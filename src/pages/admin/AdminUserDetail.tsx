import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { UserProfile, LEVELS } from '../../types';
import { tsToDate, formatNumber } from '../../utils/wpm';
import { ArrowLeft, Medal, Zap, Target, Activity, Keyboard } from 'lucide-react';
import {
    ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip
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

    // Chart data: Finger Accuracy
    const fa = user.fingerAccuracy || {} as UserProfile['fingerAccuracy'];
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
                    <div className="stat-card">
                        <div className="flex items-center gap-2 text-emerald-400 mb-2"><Keyboard size={18} /><span className="text-xs uppercase font-bold">Tamamlanan Ders</span></div>
                        <div className="text-3xl font-black font-mono text-white">{user.completedLessons?.length || 0}</div>
                    </div>
                </div>

                {/* Radar Chart Column */}
                <div className="md:col-span-2 glass p-6 flex flex-col items-center">
                    <h3 className="text-lg font-bold text-white mb-2 self-start flex items-center gap-2">
                        <Activity size={20} className="text-blue-400" />
                        Kullanıcı Parmak Analizi
                    </h3>
                    <div className="w-full h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                                <PolarGrid stroke="#334155" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 'dataMax + 10']} tick={false} axisLine={false} />
                                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} itemStyle={{ color: '#60a5fa' }} />
                                <Radar name="Başarılı Vuruş" dataKey="A" stroke="#60a5fa" strokeWidth={2} fill="#60a5fa" fillOpacity={0.3} />
                            </RadarChart>
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
