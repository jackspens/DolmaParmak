// ─────────────────────────────────────────────────────────────────────────────
// DolmaParmak — TypeScript Types
// ─────────────────────────────────────────────────────────────────────────────

export type Level = 'Phase 1' | 'Phase 2' | 'Phase 3' | 'Phase 4' | 'Phase 5' | 'Phase 6' | 'Phase 7' | 'Phase 8';

export type UserRole = 'user' | 'admin';

export interface FingerAccuracy {
    leftPinky: number;
    leftRing: number;
    leftMiddle: number;
    leftIndex: number;
    rightIndex: number;
    rightMiddle: number;
    rightRing: number;
    rightPinky: number;
    thumbs: number;
}

export interface UserProfile {
    uid: string;
    email: string;
    displayName?: string;
    role: UserRole;
    currentLevel: Level; // Kept for backwards compatibility / global ranking
    currentLessonId: string; // Tracks exact progression in the curriculum
    completedLessons: string[]; // Array of lesson IDs successfully completed (>85% acc & >85% finger)
    fingerAccuracy: FingerAccuracy; // Tracks accuracy per finger across all time
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
export const LEVELS: Level[] = ['Phase 1', 'Phase 2', 'Phase 3', 'Phase 4', 'Phase 5', 'Phase 6', 'Phase 7', 'Phase 8'];

export const LEVEL_CONFIG: Record<Level, {
    label: string;
    description: string;
    minWPM: number;
    color: string;
    xpReward: number;
    unlockWPM: number;
}> = {
    'Phase 1': { label: 'Aşama 1', description: 'Ana Sıra (Home Row)', minWPM: 10, color: 'slate', xpReward: 100, unlockWPM: 0 },
    'Phase 2': { label: 'Aşama 2', description: 'Üst Sıra', minWPM: 20, color: 'blue', xpReward: 150, unlockWPM: 0 },
    'Phase 3': { label: 'Aşama 3', description: 'Alt Sıra', minWPM: 30, color: 'violet', xpReward: 250, unlockWPM: 0 },
    'Phase 4': { label: 'Aşama 4', description: 'Özel Karakterler', minWPM: 40, color: 'purple', xpReward: 400, unlockWPM: 0 },
    'Phase 5': { label: 'Aşama 5', description: 'Kelimeler', minWPM: 50, color: 'amber', xpReward: 600, unlockWPM: 0 },
    'Phase 6': { label: 'Aşama 6', description: 'Cümleler', minWPM: 65, color: 'neon', xpReward: 800, unlockWPM: 0 },
    'Phase 7': { label: 'Aşama 7', description: 'Paragraflar', minWPM: 80, color: 'emerald', xpReward: 1000, unlockWPM: 0 },
    'Phase 8': { label: 'Aşama 8', description: 'Hız Ustalığı', minWPM: 100, color: 'rose', xpReward: 1500, unlockWPM: 0 },
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
