import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { UserProfile, LEVELS, FingerAccuracy } from '../../types';
import { Users, TrendingUp, Target, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

export default function AdminDashboard() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadStats() {
            const snap = await getDocs(collection(db, 'users'));
            setUsers(snap.docs.map(d => d.data() as UserProfile));
            setLoading(false);
        }
        loadStats();
    }, []);

    if (loading) return <div className="text-slate-400">Yükleniyor...</div>;

    // Stats calc
    const totalUsers = users.length;
    const activeToday = users.filter(u => {
        if (!u.lastLogin) return false;
        const ll = u.lastLogin as any;
        const d = ll.toDate ? ll.toDate() : new Date(ll.seconds * 1000);
        return new Date().toDateString() === d.toDateString();
    }).length;

    const avgWPM = Math.round(users.reduce((acc, u) => acc + (u.bestWPM || 0), 0) / (totalUsers || 1));
    const avgAcc = Math.round(users.reduce((acc, u) => acc + (u.bestAccuracy || 0), 0) / (totalUsers || 1));

    // Chart data
    const levelCounts: Record<string, number> = {};
    LEVELS.forEach(l => levelCounts[l] = 0);
    users.forEach(u => { levelCounts[u.currentLevel] = (levelCounts[u.currentLevel] || 0) + 1; });

    const chartData = LEVELS.map(level => ({
        name: level,
        count: levelCounts[level],
    }));

    // Global Finger Accuracy Calc
    const globFinger: Record<keyof FingerAccuracy, number> = {
        leftPinky: 0, leftRing: 0, leftMiddle: 0, leftIndex: 0,
        rightIndex: 0, rightMiddle: 0, rightRing: 0, rightPinky: 0, thumbs: 0
    };

    users.forEach(u => {
        if (u.fingerAccuracy) {
            Object.keys(globFinger).forEach(k => {
                const key = k as keyof FingerAccuracy;
                globFinger[key] += (u.fingerAccuracy[key] || 0);
            });
        }
    });

    const radarData = [
        { subject: 'Sol Serçe', A: globFinger.leftPinky },
        { subject: 'Sol Yüzük', A: globFinger.leftRing },
        { subject: 'Sol Orta', A: globFinger.leftMiddle },
        { subject: 'Sol İşaret', A: globFinger.leftIndex },
        { subject: 'Sağ İşaret', A: globFinger.rightIndex },
        { subject: 'Sağ Orta', A: globFinger.rightMiddle },
        { subject: 'Sağ Yüzük', A: globFinger.rightRing },
        { subject: 'Sağ Serçe', A: globFinger.rightPinky },
    ];

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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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

                <div className="glass p-6">
                    <h3 className="text-lg font-bold text-white mb-6">Global Parmak İsabet Haritası</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                                <PolarGrid stroke="#334155" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 'dataMax + 10']} tick={false} axisLine={false} />
                                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} itemStyle={{ color: '#ec4899' }} />
                                <Radar name="Toplam Başarılı Vuruş" dataKey="A" stroke="#ec4899" strokeWidth={2} fill="#ec4899" fillOpacity={0.3} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
