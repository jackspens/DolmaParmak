import { useAuth } from '../contexts/AuthContext';
import { calculateAccuracy, calculateWPM, formatNumber, isLevelUnlocked } from '../utils/wpm';
import { LEVEL_CONFIG, LEVELS, FingerAccuracy } from '../types';
import { Medal, Flame, Target, Zap, Clock, Trophy, Keyboard, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CURRICULUM } from '../data/curriculum';
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    Tooltip
} from 'recharts';

export default function Dashboard() {
    const { userProfile } = useAuth();
    if (!userProfile) return null;

    const currentLvlConfig = LEVEL_CONFIG[userProfile.currentLevel] || LEVEL_CONFIG['Phase 1'];
    const nextLvlConfig = LEVELS.indexOf(userProfile.currentLevel) < LEVELS.length - 1
        ? LEVEL_CONFIG[LEVELS[LEVELS.indexOf(userProfile.currentLevel) + 1]]
        : null;

    // Calculate XP progress to next level (if any)
    const xpForNext = nextLvlConfig ? nextLvlConfig.xpReward * 5 : currentLvlConfig.xpReward * 5;
    const progressPercent = Math.min(100, Math.round((userProfile.totalXP / xpForNext) * 100));

    // Radar Chart Data Prep
    const fa = userProfile.fingerAccuracy || {} as FingerAccuracy;
    const radarData = [
        { subject: 'Sol Serçe', A: fa.leftPinky || 0 },
        { subject: 'Sol Yüzük', A: fa.leftRing || 0 },
        { subject: 'Sol Orta', A: fa.leftMiddle || 0 },
        { subject: 'Sol İşaret', A: fa.leftIndex || 0 },
        { subject: 'Sağ İşaret', A: fa.rightIndex || 0 },
        { subject: 'Sağ Orta', A: fa.rightMiddle || 0 },
        { subject: 'Sağ Yüzük', A: fa.rightRing || 0 },
        { subject: 'Sağ Serçe', A: fa.rightPinky || 0 },
    ];

    // Find weakest/strongest (ignoring 0 values if starting out)
    const activeFingers = radarData.filter(d => d.A > 0);
    const sortedFingers = [...activeFingers].sort((a, b) => a.A - b.A);
    const weakestFinger = sortedFingers[0]?.subject || 'Veri Yok';
    const strongestFinger = sortedFingers[sortedFingers.length - 1]?.subject || 'Veri Yok';

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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Finger Accuracy Radar */}
                <div className="glass p-6 rounded-2xl flex flex-col hover:border-neon-500/30 transition-colors">
                    <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                        <Activity size={20} className="text-neon-500" />
                        Parmak İsabet Analizi
                    </h2>
                    <p className="text-slate-400 text-sm mb-4">
                        Doğru tuşa bastığınız parmakların analiz haritası.
                    </p>

                    <div className="w-full h-64 mb-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                                <PolarGrid stroke="#334155" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 'dataMax + 10']} tick={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                                    itemStyle={{ color: '#38bdf8' }}
                                />
                                <Radar
                                    name="Doğru Vuruş"
                                    dataKey="A"
                                    stroke="#38bdf8"
                                    strokeWidth={2}
                                    fill="#38bdf8"
                                    fillOpacity={0.3}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="flex justify-between items-center mt-auto font-mono text-sm border-t border-slate-700/50 pt-4">
                        <div>
                            <span className="text-slate-500 block text-xs">Zayıf Parmak</span>
                            <span className="text-red-400 font-bold">{weakestFinger}</span>
                        </div>
                        <div className="text-right">
                            <span className="text-slate-500 block text-xs">Güçlü Parmak</span>
                            <span className="text-emerald-400 font-bold">{strongestFinger}</span>
                        </div>
                    </div>
                </div>

                {/* Levels & Training */}
                <div className="glass p-6 rounded-2xl flex flex-col hover:border-emerald-500/30 transition-colors">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Keyboard size={20} className="text-emerald-500" />
                        Eğitim Haritası
                    </h2>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                        {CURRICULUM.map((phase, idx) => {
                            // Determine how many lessons out of total in this phase are completed
                            let totalPhaseLessons = 0;
                            let completedInPhase = 0;
                            let firstIncompleteLessonId: string | null = null;

                            phase.letters.forEach(g => {
                                g.lessons.forEach(l => {
                                    totalPhaseLessons++;
                                    if (userProfile.completedLessons.includes(l.id)) {
                                        completedInPhase++;
                                    } else if (!firstIncompleteLessonId) {
                                        firstIncompleteLessonId = l.id;
                                    }
                                });
                            });

                            const isCurrentPhase = firstIncompleteLessonId !== null;
                            // If all are completed, they can click to review the first lesson
                            const targetLessonId = firstIncompleteLessonId || phase.letters[0].lessons[0].id;
                            const isFullyCompleted = completedInPhase === totalPhaseLessons;
                            const isLocked = !isCurrentPhase && !isFullyCompleted && idx > 0 && !userProfile.completedLessons.includes(CURRICULUM[idx - 1].letters[CURRICULUM[idx - 1].letters.length - 1].lessons[9].id);

                            return (
                                <Link
                                    key={phase.id}
                                    to={isLocked ? '#' : `/typing/${targetLessonId}`}
                                    className={`block p-4 rounded-xl border transition-all duration-300 ${isLocked
                                        ? 'bg-dark-900 border-slate-800 opacity-50 cursor-not-allowed'
                                        : isCurrentPhase
                                            ? 'bg-emerald-500/10 border-emerald-500/50 hover:bg-emerald-500/20'
                                            : 'bg-dark-800 border-slate-700 hover:border-slate-500'}`}
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <h3 className="font-bold text-white flex items-center gap-2">
                                            {isFullyCompleted && <Target size={16} className="text-emerald-400" />}
                                            {phase.title}
                                        </h3>
                                        {!isLocked && (
                                            <span className="text-xs font-mono font-bold text-slate-400">
                                                {completedInPhase} / {totalPhaseLessons}
                                            </span>
                                        )}
                                        {isLocked && <span className="text-xs text-slate-500">🔒 Kilitli</span>}
                                    </div>
                                    <p className="text-xs text-slate-400 mb-3">{phase.description}</p>

                                    {/* Mini Progress Bar */}
                                    {!isLocked && (
                                        <div className="h-1.5 w-full bg-dark-950 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${isFullyCompleted ? 'bg-emerald-500' : 'bg-neon-500'}`}
                                                style={{ width: `${(completedInPhase / totalPhaseLessons) * 100}%` }}
                                            />
                                        </div>
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
