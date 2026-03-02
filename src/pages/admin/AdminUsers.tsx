import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { UserProfile, LEVELS } from '../../types';
import { tsToDate, formatNumber } from '../../utils/wpm';
import { Search, Eye, ShieldAlert, ShieldCheck, Ban } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminUsers() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [levelFilter, setLevelFilter] = useState('ALL');

    useEffect(() => {
        fetchUsers();
    }, []);

    async function fetchUsers() {
        const snap = await getDocs(collection(db, 'users'));
        setUsers(snap.docs.map(d => d.data() as UserProfile));
        setLoading(false);
    }

    const handleRoleToggle = async (uid: string, currentRole: string) => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        if (confirm(`Kullanıcı rolü ${newRole} olarak değiştirilsin mi?`)) {
            await updateDoc(doc(db, 'users', uid), { role: newRole });
            setUsers(users.map(u => u.uid === uid ? { ...u, role: newRole as any } : u));
        }
    };

    const handleDisableToggle = async (uid: string, isDisabled: boolean) => {
        if (confirm(isDisabled ? 'Kullanıcı hesabı aktif edilsin mi?' : 'Kullanıcı hesabı dondurulsun mu?')) {
            await updateDoc(doc(db, 'users', uid), { isDisabled: !isDisabled });
            setUsers(users.map(u => u.uid === uid ? { ...u, isDisabled: !isDisabled } : u));
        }
    };

    const filteredUsers = users.filter(u => {
        const matchSearch = u.email.toLowerCase().includes(search.toLowerCase());
        const matchLevel = levelFilter === 'ALL' || u.currentLevel === levelFilter;
        return matchSearch && matchLevel;
    }).sort((a, b) => b.totalXP - a.totalXP); // Sort by XP desc

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-2xl font-black text-white">Kullanıcı Yönetimi</h2>

                <div className="flex gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input
                            type="text"
                            placeholder="E-posta ara..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="input-field pl-10 h-10 py-1"
                        />
                    </div>
                    <select
                        value={levelFilter}
                        onChange={(e) => setLevelFilter(e.target.value)}
                        className="input-field h-10 py-1 w-32"
                    >
                        <option value="ALL">Tümü</option>
                        {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                </div>
            </div>

            <div className="glass overflow-x-auto rounded-xl">
                <table className="w-full text-left text-sm text-slate-300">
                    <thead className="text-xs uppercase bg-dark-900/80 text-slate-400 font-bold tracking-wider">
                        <tr>
                            <th className="px-4 py-3">Kullanıcı</th>
                            <th className="px-4 py-3">Rol</th>
                            <th className="px-4 py-3">Seviye</th>
                            <th className="px-4 py-3 text-right">XP / Seri</th>
                            <th className="px-4 py-3 text-right">WPM / Hata%</th>
                            <th className="px-4 py-3">Son Giriş</th>
                            <th className="px-4 py-3 text-right">İşlem</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={7} className="px-4 py-8 text-center">Yükleniyor...</td></tr>
                        ) : filteredUsers.length === 0 ? (
                            <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">Kayıt bulunamadı.</td></tr>
                        ) : filteredUsers.map(u => (
                            <tr key={u.uid} className={`border-t border-slate-700/50 hover:bg-dark-800/50 transition-colors ${u.isDisabled ? 'opacity-50' : ''}`}>
                                <td className="px-4 py-3">
                                    <div className="font-bold text-slate-200">{u.email.split('@')[0]}</div>
                                    <div className="text-xs text-slate-500">{u.email}</div>
                                    {u.isDisabled && <span className="text-[10px] bg-red-900/50 text-red-400 px-1 rounded">Yaslı</span>}
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${u.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-700/50 text-slate-400'}`}>
                                        {u.role.toUpperCase()}
                                    </span>
                                </td>
                                <td className="px-4 py-3 font-bold text-white">
                                    <span className={`level-${u.currentLevel.toLowerCase()} px-2 py-0.5 rounded text-xs border`}>{u.currentLevel}</span>
                                </td>
                                <td className="px-4 py-3 text-right font-mono">
                                    <div className="text-neon-400 font-bold">{formatNumber(u.totalXP)} XP</div>
                                    <div className="text-xs text-amber-500">{u.streakDays} Gün</div>
                                </td>
                                <td className="px-4 py-3 text-right font-mono">
                                    <div className="font-bold text-white">{u.bestWPM} <span className="text-xs text-slate-500">WPM</span></div>
                                    <div className="text-xs text-emerald-400">%{u.bestAccuracy}</div>
                                </td>
                                <td className="px-4 py-3 text-xs text-slate-400">{tsToDate(u.lastLogin)}</td>
                                <td className="px-4 py-3 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Link to={`/admin/users/${u.uid}`} className="p-1.5 text-slate-400 hover:text-white bg-dark-700 hover:bg-dark-600 rounded">
                                            <Eye size={16} />
                                        </Link>
                                        <button onClick={() => handleRoleToggle(u.uid, u.role)} className={`p-1.5 rounded text-slate-400 bg-dark-700 hover:bg-dark-600 ${u.role === 'admin' ? 'text-purple-400 hover:text-purple-300' : ''}`} title="Admin Yap / Al">
                                            {u.role === 'admin' ? <ShieldCheck size={16} /> : <ShieldAlert size={16} />}
                                        </button>
                                        <button onClick={() => handleDisableToggle(u.uid, u.isDisabled || false)} className={`p-1.5 rounded text-slate-400 bg-dark-700 ${u.isDisabled ? 'text-green-500 hover:text-green-400' : 'text-red-400 hover:bg-red-900/30'} `} title={u.isDisabled ? 'Kaldır' : 'Dondur'}>
                                            <Ban size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
