import { useAuth } from '../contexts/AuthContext';
import { calculateAccuracy, calculateWPM, formatNumber, isLevelUnlocked } from '../utils/wpm';
import { LEVEL_CONFIG, LEVELS } from '../types';
import { Medal, Flame, Target, Zap, Clock, Trophy, Keyboard } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
    const { userProfile } = useAuth();
    if (!userProfile) return null;

    const currentLvlConfig = LEVEL_CONFIG[userProfile.currentLevel];
    const nextLvlConfig = LEVELS.indexOf(userProfile.currentLevel) < LEVELS.length - 1
        ? LEVEL_CONFIG[LEVELS[LEVELS.indexOf(userProfile.currentLevel) + 1]]
        : null;

    // Calculate XP progress to next level (if any)
    const xpForNext = nextLvlConfig ? nextLvlConfig.xpReward * 5 : currentLvlConfig.xpReward * 5;
    const progressPercent = Math.min(100, Math.round((userProfile.totalXP / xpForNext) * 100));

    return (
        <div className="space-y-6 animate-fade-up">
            {/* Header Profile Card */}
            <div className="glass p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-neon-500/10 rounded-full mix-blend-screen filter blur-[80px]" />

                <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                    <div className={`w-24 h-24 rounded-3xl flex flex-col items-center justify-center border-4 shadow-xl level-${userProfile.currentLevel.toLowerCase()}`}>
                        <span className="text-3xl font-black">{userProfile.currentLevel}</span>
                    </div>

                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-3xl font-black text-white mb-2 tracking-tight">
                            Hoş Geldin, <span className="text-neon-400">{userProfile.email.split('@')[0]}</span>
                        </h1>
                        <p className="text-slate-400 text-sm md:text-base max-w-lg leading-relaxed">
                            Şu an <strong className="text-white">{currentLvlConfig.label}</strong> seviyesindesin.
                            {nextLvlConfig ? ` Bir sonraki seviye için bolca antrenman yap!` : ` En üst seviyedesin, efsane!`}
                        </p>

                        {/* XP Bar */}
                        <div className="mt-4 max-w-md">
                            <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                                <span>XP İlerlemesi</span>
                                <span className="text-neon-400">{formatNumber(userProfile.totalXP)} / {formatNumber(xpForNext)}</span>
                            </div>
                            <div className="h-2.5 bg-dark-900 rounded-full overflow-hidden border border-slate-700/50">
                                <div
                                    className="h-full bg-gradient-to-r from-neon-600 to-neon-400 rounded-full transition-all duration-1000 ease-out relative"
                                    style={{ width: `${progressPercent}%` }}
                                >
                                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="stat-card">
                    <div className="flex items-center gap-2 text-neon-400 mb-2"><Zap size={18} /><span className="text-xs font-bold tracking-widest uppercase">En Yüksek WPM</span></div>
                    <div className="text-3xl font-black text-white font-mono">{userProfile.bestWPM}</div>
                </div>
                <div className="stat-card">
                    <div className="flex items-center gap-2 text-emerald-400 mb-2"><Target size={18} /><span className="text-xs font-bold tracking-widest uppercase">Kesinlik</span></div>
                    <div className="text-3xl font-black text-white font-mono">%{userProfile.bestAccuracy}</div>
                </div>
                <div className="stat-card">
                    <div className="flex items-center gap-2 text-amber-400 mb-2"><Flame size={18} /><span className="text-xs font-bold tracking-widest uppercase">Seri (Gün)</span></div>
                    <div className="text-3xl font-black text-white font-mono">{userProfile.streakDays}</div>
                </div>
                <div className="stat-card">
                    <div className="flex items-center gap-2 text-purple-400 mb-2"><Trophy size={18} /><span className="text-xs font-bold tracking-widest uppercase">Rozetler</span></div>
                    <div className="text-3xl font-black text-white font-mono">{userProfile.badges?.length || 0}</div>
                </div>
            </div>

            {/* Levels & Training */}
            <div className="pt-4">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Keyboard size={20} className="text-neon-500" />
                    Eğitim Haritası
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {LEVELS.map((lvl) => {
                        const isUnlocked = isLevelUnlocked(lvl, userProfile.levelStats || {});
                        const stats = userProfile.levelStats?.[lvl];
                        const config = LEVEL_CONFIG[lvl];

                        return (
                            <Link
                                key={lvl}
                                to={isUnlocked ? `/typing/${lvl}` : '#'}
                                className={`glass p-5 relative overflow-hidden transition-all duration-300 ${isUnlocked
                                    ? 'hover:border-neon-500/50 hover:bg-dark-800 cursor-pointer group'
                                    : 'opacity-50 cursor-not-allowed grayscale'
                                    }`}
                            >
                                {!isUnlocked && (
                                    <div className="absolute inset-0 bg-dark-950/40 backdrop-blur-[1px] z-10 flex items-center justify-center">
                                        <div className="bg-dark-900 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-400 flex items-center gap-2 shadow-xl">
                                            🔒 {LEVEL_CONFIG[lvl].unlockWPM} WPM Gerekli
                                        </div>
                                    </div>
                                )}
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black border-2 level-${lvl.toLowerCase()}`}>
                                        {lvl}
                                    </div>
                                    {stats?.bestWPM > 0 && <span className="text-xs font-bold text-neon-400 bg-neon-500/10 px-2 py-1 rounded">Geliştirildi</span>}
                                </div>
                                <h3 className="font-bold text-white mb-1 group-hover:text-neon-400 transition-colors">{config.label}</h3>
                                <p className="text-sm text-slate-400 mb-4 h-10">{config.description}</p>
                                <div className="flex gap-4 text-sm font-mono text-slate-300">
                                    <div className="flex items-center gap-1"><Zap size={14} className="text-slate-500" /> {stats?.bestWPM || 0}</div>
                                    <div className="flex items-center gap-1"><Target size={14} className="text-slate-500" /> %{stats?.bestAccuracy || 0}</div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
