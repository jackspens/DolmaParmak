import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
    User,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
} from 'firebase/auth';
import {
    doc, getDoc, setDoc, updateDoc, serverTimestamp
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import { UserProfile, Level, LevelStat, LEVELS } from '../types';
import { getLessonById } from '../data/curriculum';

// ─── Default level stats ──────────────────────────────────────────────────────
function defaultLevelStats(): Record<Level, LevelStat> {
    const obj = {} as Record<Level, LevelStat>;
    LEVELS.forEach(lvl => {
        obj[lvl] = { bestWPM: 0, bestAccuracy: 0, completions: 0 };
    });
    return obj;
}

// ─── Context type ─────────────────────────────────────────────────────────────
interface AuthContextType {
    firebaseUser: User | null;
    userProfile: UserProfile | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
    const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async (uid: string, email?: string | null) => {
        const ref = doc(db, 'users', uid);
        let snap;
        try {
            snap = await getDoc(ref);
        } catch (err) {
            console.error("Firestore getDoc error:", err);
            // If it fails, simulate it not existing so we create the local profile
            snap = { exists: () => false, data: () => undefined } as any;
        }

        if (snap.exists()) {
            const data = snap.data() || {};
            // Validate level or fallback to Phase 1
            const rawLevel = data.currentLevel;
            const validLevel = LEVELS.includes(rawLevel as Level) ? (rawLevel as Level) : 'Phase 1';

            // Validate lessonId or fallback
            let lessonId = data.currentLessonId || 'phase1-f-1';
            if (!getLessonById(lessonId)) lessonId = 'phase1-f-1';

            // Merge existing data with defaults in case of missing fields (e.g. manually created users)
            const fullProfile: UserProfile = {
                uid, // Crucial: was missing for existing users
                completedLessons: [],
                fingerAccuracy: { leftPinky: 0, leftRing: 0, leftMiddle: 0, leftIndex: 0, rightIndex: 0, rightMiddle: 0, rightRing: 0, rightPinky: 0, thumbs: 0 },
                bestWPM: 0,
                bestAccuracy: 0,
                totalXP: 0,
                streakDays: 0,
                badges: [],
                readMessages: [],
                levelStats: defaultLevelStats(),
                ...(data as any),
                currentLevel: validLevel, // Ensure valid level for curriculum
                currentLessonId: lessonId // Ensure valid lesson for curriculum
            };
            setUserProfile(fullProfile);
        } else if (email) {

            // Auto-create missing profile if it doesn't exist
            const profile: Omit<UserProfile, 'uid'> = {
                email,
                role: 'user',
                currentLevel: 'Phase 1',
                currentLessonId: 'phase1-f-1',
                completedLessons: [],
                fingerAccuracy: { leftPinky: 0, leftRing: 0, leftMiddle: 0, leftIndex: 0, rightIndex: 0, rightMiddle: 0, rightRing: 0, rightPinky: 0, thumbs: 0 },
                bestWPM: 0,
                bestAccuracy: 0,
                totalXP: 0,
                streakDays: 0,
                badges: [],
                createdAt: serverTimestamp() as any,
                lastLogin: serverTimestamp() as any,
                isOnline: true,
                readMessages: [],
                levelStats: defaultLevelStats(),
            };
            setUserProfile({ uid, ...profile } as UserProfile); // Set state immediately
            try {
                await setDoc(ref, { uid, ...profile });
            } catch (err) {
                console.error("Firestore setDoc error:", err);
            }
        }
    };

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (user) => {
            setFirebaseUser(user);
            if (user) {
                await fetchProfile(user.uid, user.email);
                // Update lastLogin + isOnline
                await updateDoc(doc(db, 'users', user.uid), {
                    lastLogin: serverTimestamp(),
                    isOnline: true,
                }).catch(() => { });
            } else {
                setUserProfile(null);
            }
            setLoading(false);
        });
        return unsub;
    }, []);

    const signIn = async (email: string, password: string) => {
        await signInWithEmailAndPassword(auth, email, password);
    };

    const signUp = async (email: string, password: string) => {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        // Create Firestore profile
        const profile: Omit<UserProfile, 'uid'> = {
            email,
            role: 'user',
            currentLevel: 'Phase 1',
            currentLessonId: 'phase1-f-1',
            completedLessons: [],
            fingerAccuracy: { leftPinky: 0, leftRing: 0, leftMiddle: 0, leftIndex: 0, rightIndex: 0, rightMiddle: 0, rightRing: 0, rightPinky: 0, thumbs: 0 },
            bestWPM: 0,
            bestAccuracy: 0,
            totalXP: 0,
            streakDays: 0,
            badges: [],
            createdAt: serverTimestamp() as any,
            lastLogin: serverTimestamp() as any,
            isOnline: true,
            readMessages: [],
            levelStats: defaultLevelStats(),
        };
        await setDoc(doc(db, 'users', cred.user.uid), { uid: cred.user.uid, ...profile });
    };

    const signOut = async () => {
        if (firebaseUser) {
            await updateDoc(doc(db, 'users', firebaseUser.uid), { isOnline: false }).catch(() => { });
        }
        await firebaseSignOut(auth);
        setUserProfile(null);
    };

    const refreshProfile = async () => {
        if (firebaseUser) await fetchProfile(firebaseUser.uid, firebaseUser.email);
    };

    return (
        <AuthContext.Provider value={{ firebaseUser, userProfile, loading, signIn, signUp, signOut, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
