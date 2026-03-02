import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import AdminMessageModal from './AdminMessageModal';

interface AppLayoutProps { isAdmin?: boolean; }

export default function AppLayout({ isAdmin = false }: AppLayoutProps) {
    return (
        <div className="flex h-screen bg-dark-950 overflow-hidden">
            <Sidebar isAdmin={isAdmin} />
            <main className="flex-1 overflow-y-auto">
                <div className="p-6 max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
            {!isAdmin && <AdminMessageModal />}
        </div>
    );
}
