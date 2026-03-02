// ─────────────────────────────────────────────────────────────────────────────
// DolmaParmak — TypeScript Types
// ─────────────────────────────────────────────────────────────────────────────

export type Level = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export type UserRole = 'user' | 'admin';

export interface UserProfile {
    uid: string;
    email: string;
    displayName?: string;
    role: UserRole;
    currentLevel: Level;
    bestWPM: number;
    bestAccuracy: number;
    totalXP: number;
    streakDays: number;
    badges: Badge[];
    createdAt: FirebaseTimestamp;
    lastLogin: FirebaseTimestamp;
    isOnline: boolean;
    readMessages: string[];   // array of adminMessage IDs already read
    levelStats: Record<Level, LevelStat>;
    isDisabled?: boolean;
}

export interface LevelStat {
    bestWPM: number;
    bestAccuracy: number;
    completions: number;
    unlockedAt?: FirebaseTimestamp;
}

export interface Badge {
    id: string;
    name: string;
    icon: string;   // emoji
    earnedAt: FirebaseTimestamp;
}

export interface AdminMessage {
    id: string;
    targetType: 'all' | 'single';
    targetUserId?: string;
    title: string;
    message: string;
    createdAt: FirebaseTimestamp;
    expiresAt: FirebaseTimestamp;
    isActive: boolean;
}

export interface TypingSession {
    level: Level;
    wpm: number;
    accuracy: number;
    duration: number;   // seconds
    correctChars: number;
    totalChars: number;
    completedAt: FirebaseTimestamp;
}

// Firestore Timestamp type alias (avoids importing firebase everywhere)
export type FirebaseTimestamp = {
    toDate: () => Date;
    seconds: number;
    nanoseconds: number;
};

// ─── Level Config ─────────────────────────────────────────────────────────────
export const LEVELS: Level[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export const LEVEL_CONFIG: Record<Level, {
    label: string;
    description: string;
    minWPM: number;
    color: string;
    xpReward: number;
    unlockWPM: number;
}> = {
    A1: { label: 'A1 — Başlangıç', description: 'Temel harf ve heceler', minWPM: 10, color: 'slate', xpReward: 100, unlockWPM: 0 },
    A2: { label: 'A2 — Temel', description: 'Kısa cümleler', minWPM: 20, color: 'blue', xpReward: 150, unlockWPM: 10 },
    B1: { label: 'B1 — Orta', description: 'Günlük paragraflar', minWPM: 35, color: 'violet', xpReward: 250, unlockWPM: 20 },
    B2: { label: 'B2 — Orta Üstü', description: 'Uzun metinler', minWPM: 50, color: 'purple', xpReward: 400, unlockWPM: 35 },
    C1: { label: 'C1 — İleri', description: 'Karmaşık içerik', minWPM: 70, color: 'amber', xpReward: 600, unlockWPM: 50 },
    C2: { label: 'C2 — Uzman', description: 'Profesyonel yazma', minWPM: 90, color: 'neon', xpReward: 1000, unlockWPM: 70 },
};

export const BADGE_DEFINITIONS = [
    { id: 'first_session', name: 'İlk Adım', icon: '🚀', description: 'İlk oturumu tamamla' },
    { id: 'wpm_30', name: 'Hızlı El', icon: '⚡', description: '30 WPM ulaş' },
    { id: 'wpm_60', name: 'Süper Hız', icon: '🔥', description: '60 WPM ulaş' },
    { id: 'wpm_90', name: 'Usta Parmak', icon: '🏆', description: '90 WPM ulaş' },
    { id: 'streak_7', name: '7 Günlük Seri', icon: '📅', description: '7 gün ara vermeden yaz' },
    { id: 'accuracy_100', name: 'Mükemmel', icon: '💎', description: '%100 doğruluk' },
    { id: 'level_c2', name: 'C2 Uzmanı', icon: '🎓', description: 'C2 seviyesine ulaş' },
];
