import { LEVEL_CONFIG, LEVELS, Level, LevelStat } from '../types';

// WPM formula: (correctCharacters / 5) / (elapsedSeconds / 60)
export function calculateWPM(correctChars: number, elapsedSeconds: number): number {
    if (elapsedSeconds === 0) return 0;
    return Math.round((correctChars / 5) / (elapsedSeconds / 60));
}

// Accuracy: (correctCharacters / totalTypedCharacters) * 100
export function calculateAccuracy(correctChars: number, totalTyped: number): number {
    if (totalTyped === 0) return 100;
    return Math.round((correctChars / totalTyped) * 100 * 10) / 10;
}

// Format seconds as MM:SS
export function formatTime(secs: number): string {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// XP for level completion based on WPM performance
export function calculateXP(
    baseXP: number,
    wpm: number,
    accuracy: number,
    targetWPM: number
): number {
    const wpmBonus = Math.min(2, wpm / targetWPM);          // up to 2x for speed
    const accBonus = accuracy >= 100 ? 1.5 : accuracy >= 95 ? 1.2 : 1.0;
    return Math.round(baseXP * wpmBonus * accBonus);
}

// Check if a level is unlocked based on previous level's best WPM
export function isLevelUnlocked(
    level: Level,
    levelStats: Record<Level, LevelStat>
): boolean {
    const idx = LEVELS.indexOf(level);
    if (idx === 0) return true;   // Phase 1 always unlocked
    const prev = LEVELS[idx - 1] as Level;
    const prevStat = levelStats[prev];
    return prevStat?.bestAccuracy >= 80;
}

// Format big numbers: 1500 → 1.5K
export function formatNumber(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return String(n);
}

// Firebase Timestamp → readable date string
export function tsToDate(ts: any): string {
    if (!ts) return '—';
    try {
        const d = ts?.toDate ? ts.toDate() : new Date(ts.seconds * 1000);
        return d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch { return '—'; }
}
