import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    LayoutDashboard,
    Keyboard,
    LogOut,
    Users,
    Settings,
    MessageSquareHeart,
    Medal
} from 'lucide-react';
import clsx from 'clsx';

interface SidebarProps { isAdmin?: boolean; }

export default function Sidebar({ isAdmin }: SidebarProps) {
    const { userProfile, signOut } = useAuth();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    const userLinks = [
        { to: '/dashboard', label: 'Panelim', icon: LayoutDashboard },
        { to: '/typing', label: 'Klavye Eğitimi', icon: Keyboard },
    ];

    const adminLinks = [
        { to: '/admin', label: 'Admin Özeti', icon: LayoutDashboard },
        { to: '/admin/users', label: 'Kullanıcılar', icon: Users },
        { to: '/admin/messages', label: 'Duyurular', icon: MessageSquareHeart },
    ];

    const links = isAdmin ? adminLinks : userLinks;

    return (
        <aside className="w-64 glass m-4 mr-0 flex flex-col h-[calc(100vh-2rem)] flex-shrink-0">
            {/* Brand */}
            <div className="p-6 border-b border-slate-700/50">
                <h1 className="text-2xl font-black tracking-tight text-gradient flex items-center gap-2">
                    <span>Dolma</span>
                    <span className="text-slate-100">Parmak</span>
                </h1>
                {isAdmin && <div className="mt-1 text-xs font-bold text-neon-500 uppercase tracking-widest">Admin Panel</div>}
            </div>

            {/* Nav */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {links.map((link) => {
                    const Icon = link.icon;
                    return (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            end={link.to === '/admin'}
                            className={({ isActive }) => clsx('sidebar-link', isActive && 'active')}
                        >
                            <Icon size={18} />
                            <span>{link.label}</span>
                        </NavLink>
                    );
                })}
            </nav>

            {/* User Profile */}
            <div className="p-4 border-t border-slate-700/50 flex flex-col gap-3">
                {!isAdmin && userProfile && (
                    <div className="flex items-center gap-3 px-3 py-2 bg-dark-900/50 rounded-xl border border-slate-700/30">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm bg-dark-800 border-2 level-${userProfile.currentLevel.toLowerCase()}`}>
                            {Math.floor(userProfile.totalXP / 1000)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-200 truncate">{userProfile.email.split('@')[0]}</p>
                            <p className="text-xs text-neon-400 font-medium">Seviye: {userProfile.currentLevel}</p>
                        </div>
                    </div>
                )}

                <button onClick={handleSignOut} className="sidebar-link text-red-400 hover:text-red-300 hover:bg-red-500/10 active:!bg-transparent">
                    <LogOut size={18} />
                    <span>Çıkış Yap</span>
                </button>
            </div>
        </aside>
    );
}
