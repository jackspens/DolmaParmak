import { useState, useEffect } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { doc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { Level, LEVEL_CONFIG, LEVELS, BADGE_DEFINITIONS } from '../types';
import { isLevelUnlocked, calculateXP } from '../utils/wpm';
import { getRandomText } from '../data/texts';
import TypingEngine from '../components/TypingEngine';
import { Keyboard, ArrowLeft } from 'lucide-react';
import clsx from 'clsx';

export default function TypingPage() {
    const { level } = useParams<{ level: string }>();
    const { userProfile, refreshProfile } = useAuth();
    const navigate = useNavigate();

    const currentLevel = (level?.toUpperCase() as Level) || userProfile?.currentLevel || 'A1';

    const [textEntry, setTextEntry] = useState(() => getRandomText(currentLevel));
    const [sessionLoading, setSessionLoading] = useState(false);
    const [showLevelUp, setShowLevelUp] = useState(false);

    useEffect(() => {
        setTextEntry(getRandomText(currentLevel));
        setShowLevelUp(false);
    }, [currentLevel]);

    if (!userProfile) return null;

    if (!LEVELS.includes(currentLevel) || !isLevelUnlocked(currentLevel, userProfile.levelStats)) {
        return <Navigate to="/dashboard" replace />;
    }

    const config = LEVEL_CONFIG[currentLevel];

    const handleComplete = async (wpm: number, acc: number, duration: number, correctChars: number, totalChars: number) => {
        setSessionLoading(true);
        try {
            const stats = { ...userProfile.levelStats };
            const currentStats = stats[currentLevel] || { bestWPM: 0, bestAccuracy: 0, completions: 0 };

            // Update bests
            if (wpm > currentStats.bestWPM) currentStats.bestWPM = wpm;
            if (acc > currentStats.bestAccuracy) currentStats.bestAccuracy = acc;
            currentStats.completions += 1;
            stats[currentLevel] = currentStats;

            // Global bests
            const globalBestWPM = Math.max(userProfile.bestWPM, wpm);
            const globalBestAcc = Math.max(userProfile.bestAccuracy, acc);

            // Calc XP
            const earnedXP = calculateXP(config.xpReward, wpm, acc, config.minWPM);
            const newTotalXP = userProfile.totalXP + earnedXP;

            // Handle unlocking next level if accuracy >= 80%
            let newLevel = userProfile.currentLevel;
            let leveledUp = false;
            if (acc >= 80) {
                const idx = LEVELS.indexOf(currentLevel);
                if (idx < LEVELS.length - 1) {
                    const nextLevel = LEVELS[idx + 1];
                    // If the profile's current global level is less than the newly unlocked one, upgrade them
                    if (LEVELS.indexOf(userProfile.currentLevel) < LEVELS.indexOf(nextLevel)) {
                        newLevel = nextLevel;
                        leveledUp = true;
                    }
                }
            }

            // Handle Badges
            const newBadges = [];
            const earnedIds = userProfile.badges.map(b => b.id);
            const checkBadge = (id: string, condition: boolean) => {
                if (condition && !earnedIds.includes(id)) {
                    const bd = BADGE_DEFINITIONS.find(b => b.id === id);
                    if (bd) newBadges.push({ id, name: bd.name, icon: bd.icon, earnedAt: serverTimestamp() });
                }
            };

            checkBadge('first_session', true);
            checkBadge('wpm_30', globalBestWPM >= 30);
            checkBadge('wpm_60', globalBestWPM >= 60);
            checkBadge('wpm_90', globalBestWPM >= 90);
            checkBadge('accuracy_100', acc === 100);
            checkBadge('level_c2', newLevel === 'C2');

            const updates: any = {
                levelStats: stats,
                bestWPM: globalBestWPM,
                bestAccuracy: globalBestAcc,
                totalXP: newTotalXP,
                currentLevel: newLevel
            };

            if (newBadges.length > 0) {
                updates.badges = arrayUnion(...newBadges);
            }

            await updateDoc(doc(db, 'users', userProfile.uid), updates);
            await refreshProfile();

            if (leveledUp) {
                setShowLevelUp(true);
            } else {
                // Load next text immediately if no level up modal
                setTextEntry(getRandomText(currentLevel));
            }

        } catch (err) {
            console.error('Failed to save session', err);
        } finally {
            setSessionLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)]">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <button onClick={() => navigate('/dashboard')} className="btn-secondary flex items-center gap-2">
                    <ArrowLeft size={18} /> Panel
                </button>

                <div className="flex items-center gap-4">
                    <div className={clsx(`px-4 py-1.5 rounded-full border-2 text-sm font-bold flex items-center gap-2 level-${currentLevel.toLowerCase()}`)}>
                        <Keyboard size={16} /> {currentLevel} — {config.label.split('—')[1].trim()}
                    </div>
                </div>
            </div>

            {showLevelUp ? (
                <div className="flex-1 flex flex-col items-center justify-center animate-fade-up">
                    <div className="glass max-w-md w-full p-8 text-center border-neon-500/50 neon-glow relative overflow-hidden">
                        <div className="absolute inset-0 bg-neon-500/10 animate-pulse-slow" />
                        <h2 className="text-4xl font-black text-white mb-4 relative z-10">Tebrikler! 🎉</h2>
                        <p className="text-slate-300 mb-8 relative z-10">
                            Yüksek doğruluğun sayesinde <strong className="text-neon-400">{userProfile.currentLevel}</strong> seviyesinin kilidini açtın.
                        </p>
                        <button
                            onClick={() => {
                                setShowLevelUp(false);
                                navigate(`/typing/${userProfile.currentLevel}`);
                            }}
                            className="btn-primary w-full text-lg relative z-10"
                        >
                            Yeni Seviyeye Geç
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center p-4">
                    <div className={`w-full transition-opacity duration-300 ${sessionLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                        <TypingEngine
                            key={textEntry.id}  // Force remount on text change to clean state
                            text={textEntry.text}
                            onComplete={handleComplete}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
