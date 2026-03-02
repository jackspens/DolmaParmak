import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile, LevelStat, LEVELS, AdminMessage } from '../types';

interface AuthContextType {
    firebaseUser: { uid: string; email: string } | null; // Mocked
    userProfile: UserProfile | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function defaultLevelStats(): Record<string, LevelStat> {
    const obj = {} as Record<string, LevelStat>;
    LEVELS.forEach(lvl => {
        obj[lvl] = { bestWPM: 0, bestAccuracy: 0, completions: 0 };
    });
    return obj;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [firebaseUser, setFirebaseUser] = useState<{ uid: string; email: string } | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    // Helper to read/write all users
    const getUsers = (): UserProfile[] => JSON.parse(localStorage.getItem('dolmaparmak_users') || '[]');
    const saveUsers = (users: UserProfile[]) => localStorage.setItem('dolmaparmak_users', JSON.stringify(users));

    const fetchProfile = async (uid: string) => {
        const users = getUsers();
        const user = users.find(u => u.uid === uid);
        if (user) {
            setUserProfile(user);
        }
    };

    useEffect(() => {
        // Check if previously logged in
        const activeUid = localStorage.getItem('dolmaparmak_active_uid');
        if (activeUid) {
            const users = getUsers();
            const user = users.find(u => u.uid === activeUid);
            if (user) {
                setFirebaseUser({ uid: user.uid, email: user.email });

                // Update last login
                user.lastLogin = Date.now() as any;
                user.isOnline = true;
                saveUsers(users);
                setUserProfile(user);
            }
        }
        setLoading(false);
    }, []);

    const signIn = async (email: string, password: string) => {
        // Note: LocalStorage-based auth is NOT secure and does not check passwords properly in this demo version.
        const users = getUsers();
        const user = users.find(u => u.email === email);
        if (!user) {
            throw { code: 'auth/invalid-credential', message: 'User not found' };
        }

        user.lastLogin = Date.now() as any;
        user.isOnline = true;
        saveUsers(users);

        setFirebaseUser({ uid: user.uid, email: user.email });
        setUserProfile(user);
        localStorage.setItem('dolmaparmak_active_uid', user.uid);
    };

    const signUp = async (email: string, password: string) => {
        const users = getUsers();
        if (users.some(u => u.email === email)) {
            throw { code: 'auth/email-already-in-use', message: 'Email in use' };
        }

        const uid = 'local_' + Date.now().toString();

        const newProfile: UserProfile = {
            uid,
            email,
            role: email.includes('admin') ? 'admin' : 'user', // Auto-admin if email contains 'admin' for local testing
            currentLevel: 'A1',
            bestWPM: 0,
            bestAccuracy: 0,
            totalXP: 0,
            streakDays: 0,
            badges: [],
            createdAt: Date.now() as any,
            lastLogin: Date.now() as any,
            isOnline: true,
            readMessages: [],
            levelStats: defaultLevelStats() as any,
        };

        users.push(newProfile);
        saveUsers(users);

        setFirebaseUser({ uid, email });
        setUserProfile(newProfile);
        localStorage.setItem('dolmaparmak_active_uid', uid);
    };

    const signOut = async () => {
        if (firebaseUser) {
            const users = getUsers();
            const userIdx = users.findIndex(u => u.uid === firebaseUser.uid);
            if (userIdx !== -1) {
                users[userIdx].isOnline = false;
                saveUsers(users);
            }
        }
        setFirebaseUser(null);
        setUserProfile(null);
        localStorage.removeItem('dolmaparmak_active_uid');
    };

    const refreshProfile = async () => {
        if (firebaseUser) await fetchProfile(firebaseUser.uid);
    };

    return (
        <AuthContext.Provider value={{ firebaseUser, userProfile, loading, signIn, signUp, signOut, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
