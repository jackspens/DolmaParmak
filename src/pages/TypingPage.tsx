import { useState, useEffect } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { doc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { BADGE_DEFINITIONS, FingerAccuracy } from '../types';
import { calculateXP } from '../utils/wpm';
import { getLessonById, getNextLesson, Lesson } from '../data/curriculum';
import TypingEngine from '../components/TypingEngine';
import { Keyboard, ArrowLeft, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

export default function TypingPage() {
    const { level: paramLessonId } = useParams<{ level: string }>(); // Now used as lessonId
    const { userProfile, refreshProfile } = useAuth();
    const navigate = useNavigate();

    const lessonId = paramLessonId || userProfile?.currentLessonId || 'phase1-f-1';
    const currentLesson = getLessonById(lessonId);

    const [sessionLoading, setSessionLoading] = useState(false);

    const [showGuide, setShowGuide] = useState(false);

    // Result states
    const [showLevelUp, setShowLevelUp] = useState(false);
    const [showFailed, setShowFailed] = useState(false);
    const [lastResults, setLastResults] = useState<{ wpm: number, acc: number, fingerAcc: number } | null>(null);

    useEffect(() => {
        console.log('TypingPage Loaded:', { lessonId, currentLesson, userLevel: userProfile?.currentLevel });
        setShowLevelUp(false);
        setShowFailed(false);
    }, [lessonId]);

    if (!userProfile) return null;

    // Strict progression check: If they are trying to access a lesson they haven't unlocked yet
    const canAccess =
        lessonId === 'phase1-f-1' || // Always allow first lesson
        (currentLesson && currentLesson.isUnlockedByDefault) ||
        (lessonId === userProfile.currentLessonId) ||
        (userProfile.completedLessons.includes(lessonId));

    if (!canAccess || !currentLesson) {
        console.warn('Redirecting to dashboard: Access denied for lesson', lessonId, {
            found: !!currentLesson,
            unlockedDefault: currentLesson?.isUnlockedByDefault,
            current: userProfile.currentLessonId,
            completed: userProfile.completedLessons.includes(lessonId)
        });
        return <Navigate to="/dashboard" replace />;
    }


    const handleComplete = async (wpm: number, acc: number, duration: number, correctChars: number, totalChars: number, sessionFingerStats: Partial<FingerAccuracy>) => {
        setSessionLoading(true);
        console.info('Lesson Completed:', { wpm, acc, totalChars });
        try {
            // 1. Calculate Finger Accuracy % for this specific lesson
            let correctFingerHits = 0;
            Object.values(sessionFingerStats).forEach(v => correctFingerHits += (v || 0));

            // Calculate finger accuracy relative to total chars in lesson
            const globalFingerAcc = totalChars > 0 ? Math.round((correctFingerHits / totalChars) * 100) : 0;
            console.info('Finger Stats:', { sessionFingerStats, correctFingerHits, globalFingerAcc });

            setLastResults({ wpm, acc, fingerAcc: globalFingerAcc });

            // 2. Did they pass the strict requirements? (85% acc, 85% finger correctness)
            const passed = acc >= 85 && globalFingerAcc >= 85;
            console.info('Pass Check:', passed);

            if (!passed) {
                setShowFailed(true);
                return; // Do not save progression if failed
            }

            // --- They Passed ---

            const nextLesson = getNextLesson(currentLesson.id);
            const isEndOfPhase = nextLesson && nextLesson.id.split('-')[0] !== currentLesson.id.split('-')[0];

            // Calc XP
            const earnedXP = calculateXP(isEndOfPhase ? 100 : 20, wpm, acc, 15);
            const newTotalXP = (userProfile.totalXP || 0) + earnedXP;
            console.info('XP Gain:', { earnedXP, newTotalXP });

            // Merge global Finger Accuracy
            const newFingerAcc = { ...(userProfile.fingerAccuracy || {}) };
            for (const [f, hits] of Object.entries(sessionFingerStats)) {
                const fKey = f as keyof FingerAccuracy;
                newFingerAcc[fKey] = (newFingerAcc[fKey] || 0) + (hits as number);
            }

            // Badges
            const newBadges: any[] = [];
            const earnedIds = userProfile.badges?.map(b => b.id) || [];
            const checkBadge = (id: string, condition: boolean) => {
                if (condition && !earnedIds.includes(id)) {
                    const bd = BADGE_DEFINITIONS.find(b => b.id === id);
                    if (bd) newBadges.push({ id, name: bd.name, icon: bd.icon, earnedAt: serverTimestamp() });
                }
            };

            const globalBestWPM = Math.max(userProfile.bestWPM || 0, wpm);
            checkBadge('first_session', true);
            checkBadge('accuracy_100', acc === 100);

            const updates: any = {
                bestWPM: globalBestWPM,
                bestAccuracy: Math.max(userProfile.bestAccuracy || 0, acc),
                totalXP: newTotalXP,
                fingerAccuracy: newFingerAcc,
                completedLessons: arrayUnion(currentLesson.id)
            };

            // Unlock next lesson
            if (nextLesson && userProfile.currentLessonId === currentLesson.id) {
                updates.currentLessonId = nextLesson.id;
            }

            if (newBadges.length > 0) {
                updates.badges = arrayUnion(...newBadges);
            }

            console.info('Updating Firestore with:', updates);
            await updateDoc(doc(db, 'users', userProfile.uid), updates);
            await refreshProfile();

            setShowLevelUp(true);

        } catch (err) {
            console.error('Failed to save session', err);
        } finally {
            setSessionLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)]">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
                <button onClick={() => navigate('/dashboard')} className="btn-secondary flex items-center gap-2">
                    <ArrowLeft size={18} /> Panel
                </button>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setShowGuide(!showGuide)}
                        className={`px-4 py-1.5 rounded-full border-2 text-sm font-bold flex items-center gap-2 transition-all ${showGuide ? 'bg-amber-500/10 border-amber-500 text-amber-500' : 'border-slate-700 text-slate-400 hover:border-slate-500'}`}
                    >
                        <AlertCircle size={16} /> Parmak Yerleşimi
                    </button>
                    <div className={clsx(`px-4 py-1.5 rounded-full border-2 text-sm font-bold flex items-center gap-2 border-neon-500 text-neon-400 bg-neon-500/10`)}>
                        <Keyboard size={16} /> {currentLesson.title}
                    </div>
                </div>
            </div>

            {/* Hand Placement Guide Overlay */}
            {showGuide && (
                <div className="animate-fade-in absolute inset-0 z-40 flex items-center justify-center p-8 bg-dark-950/90 backdrop-blur-md">
                    <div className="glass max-w-4xl w-full p-6 relative border-amber-500/30 neon-glow">
                        <button onClick={() => setShowGuide(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
                            <ArrowLeft size={24} /> Kapat
                        </button>
                        <h2 className="text-2xl font-black text-white mb-4 text-center">Türkçe Q Klavye Parmak Dizilimi</h2>
                        <img src="/DolmaParmak/guide-hands.png" alt="Hand Placement Guide" className="w-full h-auto rounded-xl shadow-2xl border border-slate-700/50" />
                        <p className="mt-6 text-slate-400 text-center text-sm">
                            Her parmak kendine ait renkteki tuş grubundan sorumludur.
                            <br />Elleriniz <strong>A S D F</strong> ve <strong>J K L Ş</strong> tuşları üzerinde (Home Row) dinlenmelidir.
                        </p>
                    </div>
                </div>
            )}

            {/* Pedagogical Instruction */}
            <div className="text-center mb-6 max-w-2xl mx-auto">
                <p className="text-slate-400 text-sm">
                    Doğru parmağı kullanmaya odaklanın. Hız ikinci plandadır.
                    <span className="text-emerald-400 font-bold ml-1">Geçiş Şartı: Doğruluk &gt; %85</span>
                </p>
            </div>

            {showLevelUp ? (
                <div className="flex-1 flex flex-col items-center justify-center animate-fade-up">
                    <div className="glass max-w-md w-full p-8 text-center border-emerald-500/50 relative overflow-hidden">
                        <div className="absolute inset-0 bg-emerald-500/10 animate-pulse-slow" />
                        <h2 className="text-4xl font-black text-white mb-2 relative z-10">Mükemmel! 🎉</h2>
                        <div className="flex justify-center gap-6 my-6 relative z-10 font-mono">
                            <div>
                                <div className="text-3xl text-emerald-400 font-bold">%{lastResults?.acc}</div>
                                <div className="text-xs text-slate-500">İSABET</div>
                            </div>
                            <div>
                                <div className="text-3xl text-neon-400 font-bold">{lastResults?.wpm}</div>
                                <div className="text-xs text-slate-500">WPM</div>
                            </div>
                        </div>
                        <p className="text-slate-300 mb-8 relative z-10">Yeni dersin kilidi açıldı.</p>
                        <button
                            onClick={() => {
                                const next = getNextLesson(currentLesson.id);
                                if (next) navigate(`/typing/${next.id}`);
                                else navigate('/dashboard');
                            }}
                            className="btn-primary w-full text-lg relative z-10 shadow-[0_0_20px_rgba(16,185,129,0.3)] bg-emerald-600 hover:bg-emerald-500"
                        >
                            Sıradaki Derse Geç
                        </button>
                    </div>
                </div>
            ) : showFailed ? (
                <div className="flex-1 flex flex-col items-center justify-center animate-fade-up">
                    <div className="glass max-w-md w-full p-8 text-center border-red-500/50 relative overflow-hidden">
                        <AlertCircle className="absolute top-4 right-4 text-red-500/20" size={100} />
                        <h2 className="text-3xl font-black text-white mb-2 relative z-10">Biraz Daha Pratik</h2>
                        <p className="text-slate-400 text-sm mb-6 relative z-10 text-balance">
                            Dersi geçmek için doğruluğunun <strong className="text-white">%85</strong> üzerinde olması gerekiyor. Lütfen yavaşlayıp doğru parmakları kullandığından emin ol.
                        </p>

                        <div className="flex justify-center gap-6 my-6 relative z-10 font-mono bg-dark-900/50 p-4 rounded-xl">
                            <div>
                                <div className="text-2xl text-red-400 font-bold">%{lastResults?.acc}</div>
                                <div className="text-xs text-slate-500">İSABET</div>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowFailed(false)}
                            className="btn-secondary w-full text-lg relative z-10 border-red-500/30 hover:bg-red-500/10 text-red-200"
                        >
                            Tekrar Dene
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center">
                    <div className={`w-full transition-opacity duration-300 ${sessionLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                        <TypingEngine
                            key={currentLesson.id}
                            text={currentLesson.text}
                            targetFinger={currentLesson.targetFinger}
                            onComplete={handleComplete}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
