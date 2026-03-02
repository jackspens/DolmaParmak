import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: UserRole;
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
    const { firebaseUser, userProfile, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-dark-950 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-2 border-neon-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-slate-400 text-sm">Yükleniyor...</span>
                </div>
            </div>
        );
    }

    if (!firebaseUser) return <Navigate to="/login" replace />;

    if (requiredRole === 'admin' && userProfile?.role !== 'admin') {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
}
