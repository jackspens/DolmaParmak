import { useState, useEffect } from 'react';
import { UserProfile, LEVELS } from '../../types';
import { Users, TrendingUp, Target, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function AdminDashboard() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStats = () => {
            const storedUsers = JSON.parse(localStorage.getItem('dolmaparmak_users') || '[]');
            setUsers(storedUsers);
            setLoading(false);
        };
        loadStats();
    }, []);

    if (loading) return <div className="text-slate-400">Yükleniyor...</div>;

    const totalUsers = users.length;
    const activeToday = users.filter(u => {
        if (!u.lastLogin) return false;
        const date = new Date(u.lastLogin as any);
        return new Date().toDateString() === date.toDateString();
    }).length;

    const avgWPM = Math.round(users.reduce((acc, u) => acc + (u.bestWPM || 0), 0) / (totalUsers || 1));
    const avgAcc = Math.round(users.reduce((acc, u) => acc + (u.bestAccuracy || 0), 0) / (totalUsers || 1));

    const levelCounts: Record<string, number> = {};
    LEVELS.forEach(l => levelCounts[l] = 0);
    users.forEach(u => { levelCounts[u.currentLevel] = (levelCounts[u.currentLevel] || 0) + 1; });

    const chartData = LEVELS.map(level => ({
        name: level,
        count: levelCounts[level],
    }));

    const colors = ['#334155', '#1e3a8a', '#4c1d95', '#7e22ce', '#b45309', '#059669'];

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-black text-white">Yönetim Paneli Özeti</h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="stat-card border-none bg-dark-800">
                    <div className="flex items-center gap-2 text-blue-400 mb-2"><Users size={18} /><span className="text-xs uppercase font-bold tracking-widest">Kayıtlı</span></div>
                    <div className="text-3xl font-black text-white">{totalUsers}</div>
                </div>
                <div className="stat-card border-none bg-dark-800">
                    <div className="flex items-center gap-2 text-neon-400 mb-2"><Activity size={18} /><span className="text-xs uppercase font-bold tracking-widest">Aktif (Bugün)</span></div>
                    <div className="text-3xl font-black text-white">{activeToday}</div>
                </div>
                <div className="stat-card border-none bg-dark-800">
                    <div className="flex items-center gap-2 text-amber-400 mb-2"><TrendingUp size={18} /><span className="text-xs uppercase font-bold tracking-widest">Ort. WPM</span></div>
                    <div className="text-3xl font-black text-white">{avgWPM}</div>
                </div>
                <div className="stat-card border-none bg-dark-800">
                    <div className="flex items-center gap-2 text-emerald-400 mb-2"><Target size={18} /><span className="text-xs uppercase font-bold tracking-widest">Ort. Kesinlik</span></div>
                    <div className="text-3xl font-black text-white">%{avgAcc}</div>
                </div>
            </div>

            <div className="glass p-6">
                <h3 className="text-lg font-bold text-white mb-6">Seviyelere Göre Dağılım</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#94a3b8' }} />
                            <YAxis stroke="#64748b" tick={{ fill: '#94a3b8' }} allowDecimals={false} />
                            <Tooltip cursor={{ fill: '#1e293b' }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px' }} />
                            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
