import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AdminMessage } from '../types';
import { BellRing, X } from 'lucide-react';

export default function AdminMessageModal() {
    const { userProfile, refreshProfile } = useAuth();
    const [messages, setMessages] = useState<AdminMessage[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (!userProfile) return;

        const fetchMessages = () => {
            try {
                const storedMsgs: AdminMessage[] = JSON.parse(localStorage.getItem('dolmaparmak_messages') || '[]');
                const now = Date.now();

                const activeMessages = storedMsgs
                    .filter(msg => msg.isActive)
                    .filter(msg => {
                        // Check expiration
                        if (msg.expiresAt && (msg.expiresAt as any) < now) return false;

                        // Check if already read
                        if (userProfile.readMessages?.includes(msg.id)) return false;

                        // Check target
                        if (msg.targetType === 'single' && msg.targetUserId !== userProfile.uid) return false;
                        return true;
                    });

                setMessages(activeMessages);
            } catch (err) {
                console.error('Failed to fetch admin messages', err);
            }
        };

        fetchMessages();
    }, [userProfile]);

    if (messages.length === 0 || !userProfile) return null;

    const currentMsg = messages[currentIndex];

    const handleMarkAsRead = async () => {
        try {
            const users = JSON.parse(localStorage.getItem('dolmaparmak_users') || '[]');
            const userIdx = users.findIndex((u: any) => u.uid === userProfile.uid);

            if (userIdx !== -1) {
                users[userIdx].readMessages = [...(users[userIdx].readMessages || []), currentMsg.id];
                localStorage.setItem('dolmaparmak_users', JSON.stringify(users));
                await refreshProfile();
            }

            if (currentIndex < messages.length - 1) {
                setCurrentIndex(prev => prev + 1);
            } else {
                setMessages([]); // Close modal
            }
        } catch (err) {
            console.error('Failed to mark message as read', err);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-sm animate-fade-in">
            <div className="glass max-w-lg w-full p-6 animate-slide-in relative border-neon-500/30 neon-glow">
                <button onClick={handleMarkAsRead} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
                    <X size={20} />
                </button>

                <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-neon-500/20 flex items-center justify-center text-neon-400">
                        <BellRing size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">{currentMsg.title}</h2>
                        <p className="text-xs text-neon-400 font-medium tracking-wide uppercase">Sistem Duyurusu</p>
                    </div>
                </div>

                <div className="bg-dark-900/50 rounded-xl p-4 border border-slate-700/50 text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {currentMsg.message}
                </div>

                <div className="mt-6 flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">
                        {currentIndex + 1} / {messages.length} mesaj
                    </span>
                    <button onClick={handleMarkAsRead} className="btn-primary">
                        Okudum, Anladım
                    </button>
                </div>
            </div>
        </div>
    );
}
