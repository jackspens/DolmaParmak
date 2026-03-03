import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { doc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { BADGE_DEFINITIONS, FingerAccuracy } from '../types';
import { calculateXP } from '../utils/wpm';
import { getLessonById, getNextLesson, getAllLessonIds } from '../data/curriculum';
import TypingEngine from '../components/TypingEngine';
import { Keyboard, ArrowLeft, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

export default function TypingPage() {
    const { level: paramLessonId } = useParams<{ level: string }>();
    const { userProfile, updateProfile } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const lessonId = paramLessonId || userProfile?.currentLessonId || 'phase1-f-1';
    const currentLesson = getLessonById(lessonId);

    const [showGuide, setShowGuide] = useState(false);
    const [sessionLoading, setSessionLoading] = useState(false);
    const [result, setResult] = useState<{ passed: boolean; wpm: number; acc: number; fingerAcc: number } | null>(
        // Restore from location.state if navigated from a successful lesson
        (location.state as any)?.lessonResult ?? null
    );

    // Refs to hold stable values for the async Firestore call
    const pendingUpdate = useRef<{ uid: string; updates: any } | null>(null);

    useEffect(() => {
        // Reset result when lesson changes
        setResult(null);
        window.history.replaceState({}, ''); // Clear location.state
    }, [lessonId]);

    if (!userProfile) return null;

    // Only redirect if the lesson literally doesn't exist in curriculum
    if (!currentLesson) {
        console.warn('Lesson not found:', lessonId);
        navigate('/dashboard', { replace: true });
        return null;
    }

    const handleComplete = async (
        wpm: number,
        acc: number,
        _duration: number,
        _correctChars: number,
        totalChars: number,
        sessionFingerStats: Partial<FingerAccuracy>
    ) => {
        setSessionLoading(true);
        console.log('--- LESSON COMPLETE ---', { wpm, acc, totalChars, uid: userProfile.uid });

        try {
            // 1. Finger accuracy (same calculation as accuracy for now)
            let correctFingerHits = 0;
            Object.values(sessionFingerStats).forEach(v => (correctFingerHits += v || 0));
            const globalFingerAcc = totalChars > 0 ? Math.round((correctFingerHits / totalChars) * 100) : 0;

            console.log('Finger stats:', { correctFingerHits, totalChars, globalFingerAcc });

            // 2. Pass check — lowered to 70% to be beginner-friendly
            const passed = acc >= 70 && globalFingerAcc >= 70;
            console.log('Passed?', passed, { acc, globalFingerAcc });

            if (!passed) {
                setResult({ passed: false, wpm, acc, fingerAcc: globalFingerAcc });
                return;
            }

            // 3. Compute updates
            const nextLesson = getNextLesson(currentLesson.id);
            const allLessonIds = getAllLessonIds();
            const currentIdx = allLessonIds.indexOf(currentLesson.id);
            const userCurrentIdx = allLessonIds.indexOf(userProfile.currentLessonId);
            const shouldAdvance = nextLesson && currentIdx >= userCurrentIdx;

            const isEndOfPhase = nextLesson && nextLesson.id.split('-')[0] !== currentLesson.id.split('-')[0];
            const earnedXP = calculateXP(isEndOfPhase ? 100 : 20, wpm, acc, 15);
            const newTotalXP = (userProfile.totalXP || 0) + earnedXP;

            const newFingerAcc: any = { ...(userProfile.fingerAccuracy || {}) };
            for (const [f, hits] of Object.entries(sessionFingerStats)) {
                newFingerAcc[f] = (newFingerAcc[f] || 0) + (hits || 0);
            }

            const firestoreUpdates: any = {
                bestWPM: Math.max(userProfile.bestWPM || 0, wpm),
                bestAccuracy: Math.max(userProfile.bestAccuracy || 0, acc),
                totalXP: newTotalXP,
                fingerAccuracy: newFingerAcc,
                completedLessons: arrayUnion(currentLesson.id),
            };
            if (shouldAdvance) firestoreUpdates.currentLessonId = nextLesson!.id;

            // Check for first_session badge
            const earnedIds = userProfile.badges?.map(b => b.id) || [];
            if (!earnedIds.includes('first_session')) {
                const bd = BADGE_DEFINITIONS.find(b => b.id === 'first_session');
                if (bd) firestoreUpdates.badges = arrayUnion({ id: 'first_session', name: bd.name, icon: bd.icon, earnedAt: serverTimestamp() });
            }

            console.log('Updates to Firestore:', { uid: userProfile.uid, ...firestoreUpdates });

            // 4. Update LOCAL state immediately — navigation works regardless of DB
            updateProfile({
                totalXP: newTotalXP,
                bestWPM: Math.max(userProfile.bestWPM || 0, wpm),
                bestAccuracy: Math.max(userProfile.bestAccuracy || 0, acc),
                fingerAccuracy: newFingerAcc,
                currentLessonId: shouldAdvance ? nextLesson!.id : userProfile.currentLessonId,
                completedLessons: [...(userProfile.completedLessons || []), currentLesson.id],
            });

            // 5. Navigate to next lesson IMMEDIATELY — pass result via location.state for success banner
            const destination = nextLesson ? `/typing/${nextLesson.id}` : '/dashboard';
            navigate(destination, {
                replace: false,
                state: {
                    lessonResult: { passed: true, wpm, acc, fingerAcc: globalFingerAcc, xp: earnedXP }
                }
            });

            // 6. Save to Firestore in background (don't block UX)
            if (userProfile.uid) {
                updateDoc(doc(db, 'users', userProfile.uid), firestoreUpdates)
                    .then(() => console.log('✅ Firestore saved'))
                    .catch(err => {
                        console.error('❌ Firestore save failed:', err);
                        // Show in UI so user knows
                        alert(`Veritabanı kayıt hatası: ${err.message}\nUID: ${userProfile.uid}`);
                    });
            } else {
                console.error('❌ userProfile.uid is missing! Cannot save.');
                alert('Kullanıcı kimliği bulunamadı. Lütfen çıkış yapıp tekrar giriş yapın.');
            }

        } finally {
            setSessionLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] relative">
            {/* Header */}
            <div className="flex items-center justify-between mb-2 flex-shrink-0">
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
                    <div className="px-4 py-1.5 rounded-full border-2 text-sm font-bold flex items-center gap-2 border-neon-500 text-neon-400 bg-neon-500/10">
                        <Keyboard size={16} /> {currentLesson.title}
                    </div>
                </div>
            </div>

            {/* Hand Placement Guide Overlay */}
            {showGuide && (
                <div className="absolute inset-0 z-40 flex items-center justify-center p-8 bg-dark-950/90 backdrop-blur-md">
                    <div className="glass max-w-4xl w-full p-6 relative border-amber-500/30">
                        <button onClick={() => setShowGuide(false)} className="absolute top-4 right-4 btn-secondary text-sm">
                            Kapat
                        </button>
                        <h2 className="text-2xl font-black text-white mb-4 text-center">Türkçe Q Klavye Parmak Dizilimi</h2>
                        <img src="/DolmaParmak/guide-hands.png" alt="Hand Placement Guide" className="w-full h-auto rounded-xl shadow-2xl border border-slate-700/50" />
                        <p className="mt-4 text-slate-400 text-center text-sm">
                            Elleriniz <strong className="text-white">A S D F</strong> ve <strong className="text-white">J K L Ş</strong> tuşları üzerinde dinlenmelidir.
                        </p>
                    </div>
                </div>
            )}

            {/* Success banner (shown when navigated from a completed lesson) */}
            {result?.passed && (
                <div className="flex-shrink-0 animate-fade-in mb-4 px-4 py-3 rounded-xl bg-emerald-500/15 border border-emerald-500/50 flex items-center gap-4">
                    <CheckCircle className="text-emerald-400 flex-shrink-0" size={22} />
                    <div className="flex-1">
                        <span className="text-emerald-300 font-bold">Harika! Önceki ders geçildi.</span>
                        <span className="text-slate-400 text-sm ml-3">İsabet: <strong className="text-white">%{result.acc}</strong> · Hız: <strong className="text-white">{result.wpm} WPM</strong></span>
                    </div>
                </div>
            )}

            {/* Fail screen */}
            {result && !result.passed ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="glass max-w-md w-full p-8 text-center border-red-500/50 relative overflow-hidden">
                        <XCircle className="absolute top-4 right-4 text-red-500/20" size={80} />
                        <h2 className="text-3xl font-black text-white mb-3 relative z-10">Gelişim Lazım</h2>
                        <p className="text-slate-400 text-sm mb-6 relative z-10">
                            Dersi geçmek için en az <strong className="text-white">%70</strong> doğruluk gerekiyor.
                        </p>
                        <div className="grid grid-cols-2 gap-3 mb-6 relative z-10 font-mono">
                            <div className={`p-3 rounded-lg border ${result.acc < 70 ? 'border-red-500/50 bg-red-500/5 text-red-400' : 'border-emerald-500/50 bg-emerald-500/5 text-emerald-400'}`}>
                                <div className="text-2xl font-bold">%{result.acc}</div>
                                <div className="text-[10px] text-slate-500 uppercase tracking-tighter">İSABET</div>
                            </div>
                            <div className={`p-3 rounded-lg border ${result.fingerAcc < 70 ? 'border-red-500/50 bg-red-500/5 text-red-400' : 'border-emerald-500/50 bg-emerald-500/5 text-emerald-400'}`}>
                                <div className="text-2xl font-bold">%{result.fingerAcc}</div>
                                <div className="text-[10px] text-slate-500 uppercase tracking-tighter">PARMAK</div>
                            </div>
                        </div>
                        <button onClick={() => setResult(null)} className="btn-secondary w-full border-red-500/30 hover:bg-red-500/10 text-red-200">
                            Tekrar Dene
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center overflow-hidden">
                    <p className="text-slate-500 text-xs mb-3">
                        Geçiş için &gt;%70 doğruluk yeterli · Hız ikinci planda
                    </p>
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
