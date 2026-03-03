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
    const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
    const [sessionLoading, setSessionLoading] = useState(false);

    // Result states
    const [showLevelUp, setShowLevelUp] = useState(false);
    const [showFailed, setShowFailed] = useState(false);
    const [lastResults, setLastResults] = useState<{ wpm: number, acc: number, fingerAcc: number } | null>(null);

    useEffect(() => {
        const lesson = getLessonById(lessonId);
        setCurrentLesson(lesson);
        setShowLevelUp(false);
        setShowFailed(false);
    }, [lessonId]);

    if (!userProfile) return null;

    // Strict progression check: If they are trying to access a lesson they haven't unlocked yet
    if (currentLesson && !currentLesson.isUnlockedByDefault && lessonId !== userProfile.currentLessonId && !userProfile.completedLessons.includes(lessonId)) {
        return <Navigate to="/dashboard" replace />;
    }

    if (!currentLesson) {
        return <Navigate to="/dashboard" replace />;
    }

    const handleComplete = async (wpm: number, acc: number, duration: number, correctChars: number, totalChars: number, sessionFingerStats: Partial<FingerAccuracy>) => {
        setSessionLoading(true);
        try {
            // 1. Calculate Finger Accuracy % for this specific lesson
            let correctFingerHits = 0;
            // The typing engine currently tracks hits mapped to the *target key's mapped finger*.
            // We sum those up as "correct finger usages" simply matching the key success for now.
            // A more advanced physical hardware hook would be needed to actually know *which* finger they used,
            // so we approximate: if they hit the target key, we assume they used the correct finger.
            // However, the tracking logic separates it by finger bucket, allowing us to build the radar chart later.
            Object.values(sessionFingerStats).forEach(v => correctFingerHits += (v || 0));

            // Calculate finger accuracy relative to total chars in lesson
            const globalFingerAcc = totalChars > 0 ? Math.round((correctFingerHits / totalChars) * 100) : 0;

            setLastResults({ wpm, acc, fingerAcc: globalFingerAcc });

            // 2. Did they pass the strict requirements? (85% acc, 85% finger correctness)
            const passed = acc >= 85 && globalFingerAcc >= 85;

            if (!passed) {
                setShowFailed(true);
                return; // Do not save progression if failed
            }

            // --- They Passed ---

            const nextLesson = getNextLesson(currentLesson.id);
            const isEndOfPhase = nextLesson && nextLesson.id.split('-')[0] !== currentLesson.id.split('-')[0];

            // Calc XP
            const earnedXP = calculateXP(isEndOfPhase ? 100 : 20, wpm, acc, 0); // 20 per letter, 100 per phase
            const newTotalXP = userProfile.totalXP + earnedXP;

            // Merge global Finger Accuracy
            const newFingerAcc = { ...userProfile.fingerAccuracy };
            for (const [f, hits] of Object.entries(sessionFingerStats)) {
                const fKey = f as keyof FingerAccuracy;
                newFingerAcc[fKey] = (newFingerAcc[fKey] || 0) + (hits as number);
            }

            // Badges
            const newBadges: any[] = [];
            const earnedIds = userProfile.badges.map(b => b.id);
            const checkBadge = (id: string, condition: boolean) => {
                if (condition && !earnedIds.includes(id)) {
                    const bd = BADGE_DEFINITIONS.find(b => b.id === id);
                    if (bd) newBadges.push({ id, name: bd.name, icon: bd.icon, earnedAt: serverTimestamp() });
                }
            };

            const globalBestWPM = Math.max(userProfile.bestWPM, wpm);
            checkBadge('first_session', true);
            checkBadge('accuracy_100', acc === 100);

            const updates: any = {
                bestWPM: globalBestWPM,
                bestAccuracy: Math.max(userProfile.bestAccuracy, acc),
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
                    <div className={clsx(`px-4 py-1.5 rounded-full border-2 text-sm font-bold flex items-center gap-2 border-neon-500 text-neon-400 bg-neon-500/10`)}>
                        <Keyboard size={16} /> {currentLesson.title}
                    </div>
                </div>
            </div>

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
