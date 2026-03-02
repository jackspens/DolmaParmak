import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { UserProfile, LEVELS } from '../../types';
import { tsToDate, formatNumber } from '../../utils/wpm';
import { ArrowLeft, Medal, Zap, Target } from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';

export default function AdminUserDetail() {
    const { uid } = useParams<{ uid: string }>();
    const navigate = useNavigate();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadUser() {
            if (!uid) return;
            const snap = await getDoc(doc(db, 'users', uid));
            if (snap.exists()) setUser(snap.data() as UserProfile);
            setLoading(false);
        }
        loadUser();
    }, [uid]);

    if (loading) return <div className="text-slate-400">Yükleniyor...</div>;
    if (!user) return <div className="text-red-400">Kullanıcı bulunamadı.</div>;

    // Chart data: WPM progression across levels
    const chartData = LEVELS.map(l => ({
        name: l,
        wpm: user.levelStats?.[l]?.bestWPM || 0,
        acc: user.levelStats?.[l]?.bestAccuracy || 0,
    }));

    return (
        <div className="space-y-6">
            <button onClick={() => navigate('/admin/users')} className="btn-secondary flex items-center gap-2 mb-4">
                <ArrowLeft size={18} /> Geri Dön
            </button>

            {/* Header Profile */}
            <div className="glass p-8 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
                <div className={`w-24 h-24 rounded-3xl flex items-center justify-center border-4 shadow-xl text-3xl font-black level-${user.currentLevel.toLowerCase()}`}>
                    {user.currentLevel}
                </div>
                <div className="flex-1">
                    <h2 className="text-3xl font-black text-white">{user.email}</h2>
                    <div className="flex gap-4 mt-2 text-sm">
                        <span className="text-slate-400">UID: <code className="text-slate-500 bg-dark-900 px-1 py-0.5 rounded">{user.uid}</code></span>
                        <span className="text-slate-400">Rol: <strong className={user.role === 'admin' ? 'text-purple-400' : 'text-slate-200'}>{user.role.toUpperCase()}</strong></span>
                        <span className="text-slate-400">Kayıt: <strong className="text-slate-200">{tsToDate(user.createdAt)}</strong></span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Stats Column */}
                <div className="space-y-4">
                    <div className="stat-card">
                        <div className="flex items-center gap-2 text-neon-400 mb-2"><Zap size={18} /><span className="text-xs uppercase font-bold">Toplam XP</span></div>
                        <div className="text-3xl font-black font-mono text-white">{formatNumber(user.totalXP)}</div>
                    </div>
                    <div className="stat-card">
                        <div className="flex items-center gap-2 text-amber-400 mb-2"><Target size={18} /><span className="text-xs uppercase font-bold">En İyi WPM / Kesinlik</span></div>
                        <div className="flex items-end gap-2 text-3xl font-black font-mono text-white">
                            {user.bestWPM} <span className="text-sm text-slate-500 mb-1">wpm</span>
                            <span className="text-slate-600 mx-2">|</span>
                            %{user.bestAccuracy}
                        </div>
                    </div>
                </div>

                {/* WPM Chart Column */}
                <div className="md:col-span-2 glass p-6">
                    <h3 className="text-lg font-bold text-white mb-6">Seviyelere Göre Performans (En İyi)</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#94a3b8' }} />
                                <YAxis yAxisId="left" stroke="#10b981" tick={{ fill: '#10b981' }} />
                                <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" tick={{ fill: '#3b82f6' }} domain={[0, 100]} />
                                <Tooltip cursor={{ fill: '#1e293b' }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                                <Line yAxisId="left" type="monotone" dataKey="wpm" name="WPM" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                <Line yAxisId="right" type="monotone" dataKey="acc" name="Kesinlik (%)" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Badges */}
            <div className="glass p-6">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <Medal size={20} className="text-amber-400" /> Kazanılan Rozetler ({user.badges?.length || 0})
                </h3>
                {(!user.badges || user.badges.length === 0) ? (
                    <p className="text-slate-500">Kullanıcı henüz rozet kazanmadı.</p>
                ) : (
                    <div className="flex flex-wrap gap-4">
                        {user.badges.map((b, i) => (
                            <div key={i} className="flex flex-col items-center justify-center p-4 bg-dark-800 rounded-xl border border-slate-700 w-32 text-center relative group">
                                <span className="text-4xl mb-2 filter drop-shadow-lg">{b.icon}</span>
                                <span className="text-xs font-bold text-slate-300">{b.name}</span>
                                <span className="text-[10px] text-slate-500 mt-1">{tsToDate(b.earnedAt)}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
