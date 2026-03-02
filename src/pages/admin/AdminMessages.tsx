import { useState, useEffect } from 'react';
import { AdminMessage } from '../../types';
import { MessageSquareHeart, Plus, Power, ShieldAlert } from 'lucide-react';
import { tsToDate } from '../../utils/wpm';

export default function AdminMessages() {
    const [messages, setMessages] = useState<AdminMessage[]>([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [targetType, setTargetType] = useState<'all' | 'single'>('all');
    const [targetUser, setTargetUser] = useState('');
    const [expireDays, setExpireDays] = useState(7);

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = () => {
        const stored = JSON.parse(localStorage.getItem('dolmaparmak_messages') || '[]');
        // Sort client-side by createdAt desc
        stored.sort((a: any, b: any) => b.createdAt - a.createdAt);
        setMessages(stored);
        setLoading(false);
    };

    const saveMessages = (msgs: AdminMessage[]) => {
        localStorage.setItem('dolmaparmak_messages', JSON.stringify(msgs));
        setMessages(msgs);
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !body) return;

        try {
            const now = Date.now();
            const expireDate = now + (expireDays * 24 * 60 * 60 * 1000);

            const newMsg: AdminMessage = {
                id: 'msg_' + now.toString(),
                title,
                message: body,
                targetType,
                targetUserId: targetType === 'single' ? targetUser : undefined,
                isActive: true,
                createdAt: now as any,
                expiresAt: expireDate as any,
            };

            saveMessages([newMsg, ...messages]);

            // Reset
            setTitle('');
            setBody('');
            setTargetUser('');
            setShowForm(false);
        } catch (err) {
            console.error(err);
            alert('Mesaj oluşturulamadı.');
        }
    };

    const toggleActive = (id: string, current: boolean) => {
        const newMsgs = messages.map(m => m.id === id ? { ...m, isActive: !current } : m);
        saveMessages(newMsgs);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black text-white flex items-center gap-3">
                    <MessageSquareHeart className="text-pink-500" /> Sistem Duyuruları
                </h2>
                <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
                    {showForm ? 'İptal' : <><Plus size={18} /> Yeni Duyuru</>}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleCreate} className="glass p-6 animate-slide-in space-y-4 border-neon-500/30 neon-glow">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Başlık</label>
                            <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="input-field" placeholder="Örn: Sistem Bakımı" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Geçerlilik (Gün)</label>
                            <input type="number" min="1" max="365" value={expireDays} onChange={e => setExpireDays(Number(e.target.value))} className="input-field" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Mesaj İçeriği</label>
                            <textarea required value={body} onChange={e => setBody(e.target.value)} rows={3} className="input-field resize-none bg-dark-950" placeholder="Kullanıcılara gösterilecek mesaj..." />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Hedef</label>
                            <select value={targetType} onChange={e => setTargetType(e.target.value as 'all' | 'single')} className="input-field">
                                <option value="all">Tüm Kullanıcılar (Genel Duyuru)</option>
                                <option value="single">Tek Bir Kullanıcı (UID ile)</option>
                            </select>
                        </div>
                        {targetType === 'single' && (
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Hedef Kullanıcı UID</label>
                                <input type="text" required value={targetUser} onChange={e => setTargetUser(e.target.value)} className="input-field" placeholder="Kullanıcı UID yapıştırın..." />
                            </div>
                        )}
                        <div className="md:col-span-2 flex justify-end">
                            <button type="submit" className="btn-primary w-full md:w-auto">
                                Yayınla ve Gönder
                            </button>
                        </div>
                    </div>
                </form>
            )}

            <div className="glass overflow-hidden rounded-xl">
                <table className="w-full text-left text-sm text-slate-300">
                    <thead className="text-xs uppercase bg-dark-900/80 text-slate-400 font-bold tracking-wider">
                        <tr>
                            <th className="px-4 py-3">Durum</th>
                            <th className="px-4 py-3">Başlık & Mesaj</th>
                            <th className="px-4 py-3">Hedef</th>
                            <th className="px-4 py-3">Tarihler</th>
                            <th className="px-4 py-3 text-right">İşlem</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} className="px-4 py-8 text-center">Yükleniyor...</td></tr>
                        ) : messages.length === 0 ? (
                            <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">Henüz duyuru oluşturulmadı.</td></tr>
                        ) : messages.map(m => (
                            <tr key={m.id} className={`border-t border-slate-700/50 hover:bg-dark-800/50 transition-colors ${!m.isActive ? 'opacity-50' : ''}`}>
                                <td className="px-4 py-3">
                                    <span className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded w-max ${m.isActive ? 'bg-neon-500/20 text-neon-400' : 'bg-red-500/20 text-red-400'}`}>
                                        <Power size={12} /> {m.isActive ? 'Aktif' : 'Pasif'}
                                    </span>
                                </td>
                                <td className="px-4 py-3 max-w-xs">
                                    <div className="font-bold text-white truncate">{m.title}</div>
                                    <div className="text-xs text-slate-500 truncate">{m.message}</div>
                                </td>
                                <td className="px-4 py-3">
                                    {m.targetType === 'all'
                                        ? <span className="bg-slate-700 text-slate-300 px-2 py-0.5 rounded text-xs font-bold">Genel</span>
                                        : <span className="bg-purple-900/50 text-purple-400 px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1 w-max" title={m.targetUserId}><ShieldAlert size={12} /> Özel</span>
                                    }
                                </td>
                                <td className="px-4 py-3 text-xs">
                                    <div className="text-slate-400">Pbl: {tsToDate(m.createdAt)}</div>
                                    <div className="text-amber-500">Exp: {tsToDate(m.expiresAt)}</div>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <button onClick={() => toggleActive(m.id, m.isActive)} className="text-xs font-bold text-slate-400 hover:text-white px-3 py-1.5 bg-dark-700 hover:bg-dark-600 rounded">
                                        {m.isActive ? 'Durdur' : 'Başlat'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
