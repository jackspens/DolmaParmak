import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TypingPage from './pages/TypingPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminUserDetail from './pages/admin/AdminUserDetail';
import AdminMessages from './pages/admin/AdminMessages';
import AppLayout from './components/AppLayout';

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter basename="/DolmaParmak">
                <Routes>
                    {/* Public */}
                    <Route path="/login" element={<Login />} />

                    {/* Protected user routes */}
                    <Route path="/" element={
                        <ProtectedRoute>
                            <AppLayout />
                        </ProtectedRoute>
                    }>
                        <Route index element={<Navigate to="/dashboard" replace />} />
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="typing/:level?" element={<TypingPage />} />
                    </Route>

                    {/* Admin routes */}
                    <Route path="/admin" element={
                        <ProtectedRoute requiredRole="admin">
                            <AppLayout isAdmin />
                        </ProtectedRoute>
                    }>
                        <Route index element={<AdminDashboard />} />
                        <Route path="users" element={<AdminUsers />} />
                        <Route path="users/:uid" element={<AdminUserDetail />} />
                        <Route path="messages" element={<AdminMessages />} />
                    </Route>

                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}
