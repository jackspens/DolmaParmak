export type FingerType =
    | 'leftPinky'
    | 'leftRing'
    | 'leftMiddle'
    | 'leftIndex'
    | 'rightIndex'
    | 'rightMiddle'
    | 'rightRing'
    | 'rightPinky'
    | 'thumbs';

export interface Lesson {
    id: string; // e.g., 'phase1-f-1'
    title: string;
    text: string;
    targetFinger: FingerType | 'mixed';
    isUnlockedByDefault?: boolean;
}

export interface LetterGroup {
    letter: string;
    lessons: Lesson[];
}

export interface Phase {
    id: string; // e.g., 'phase1'
    title: string;
    description: string;
    letters: LetterGroup[];
}

// Helper to generate the 10 micro-lessons per letter
function generateLessonsForLetter(phaseId: string, letter: string, targetFinger: FingerType, isFirst: boolean = false): Lesson[] {
    const l = letter.toLowerCase();
    const U = letter.toUpperCase();

    return [
        { id: `${phaseId}-${l}-1`, title: `${U} Harfi - Tekrar`, text: `${l} ${l} ${l} ${l} ${l} ${l} ${l} ${l} ${l} ${l}`, targetFinger, isUnlockedByDefault: isFirst },
        { id: `${phaseId}-${l}-2`, title: `${U} Harfi - Çift Ritim`, text: `${l}${l} ${l}${l} ${l}${l} ${l}${l} ${l}${l}`, targetFinger },
        { id: `${phaseId}-${l}-3`, title: `${U} Harfi - Üçlü Ritim`, text: `${l}${l}${l} ${l}${l}${l} ${l}${l}${l} ${l}${l}${l}`, targetFinger },
        { id: `${phaseId}-${l}-4`, title: `${U} Harfi - Odaklanma`, text: `${l} ${l}${l} ${l} ${l}${l} ${l} ${l}${l} ${l}`, targetFinger },
        { id: `${phaseId}-${l}-5`, title: `${U} Harfi - Hız Mintonu`, text: `${l}${l}${l}${l} ${l}${l}${l}${l} ${l}${l}${l}${l}`, targetFinger },
        { id: `${phaseId}-${l}-6`, title: `${U} Harfi - Boşluk Egzersizi`, text: `${l}  ${l}  ${l}  ${l}  ${l}  ${l}`, targetFinger },
        { id: `${phaseId}-${l}-7`, title: `${U} Harfi - Seri Yazım`, text: `${l}${l}${l}${l}${l} ${l}${l}${l}${l}${l}`, targetFinger },
        { id: `${phaseId}-${l}-8`, title: `${U} Harfi - Karma 1`, text: `${l} ${l} ${l}${l} ${l} ${l}${l} ${l}`, targetFinger },
        { id: `${phaseId}-${l}-9`, title: `${U} Harfi - Karma 2`, text: `${l}${l} ${l} ${l}${l} ${l} ${l}${l}`, targetFinger },
        { id: `${phaseId}-${l}-10`, title: `${U} Harfi - Ustalık`, text: `${l}${l}${l} ${l}${l} ${l} ${l}${l} ${l}${l}${l}`, targetFinger },
    ];
}

// ─────────────────────────────────────────────────────────────────────────────
// The 8-Phase Curriculum
// ─────────────────────────────────────────────────────────────────────────────
export const CURRICULUM: Phase[] = [
    {
        id: 'phase1',
        title: 'Aşama 1: Temel Sıra (Home Row)',
        description: 'En çok kullanılan harfler ve parmakların ana duruş (Home) pozisyonu.',
        letters: [
            // Left hand
            { letter: 'F', lessons: generateLessonsForLetter('phase1', 'f', 'leftIndex', true) },
            { letter: 'D', lessons: generateLessonsForLetter('phase1', 'd', 'leftMiddle') },
            { letter: 'S', lessons: generateLessonsForLetter('phase1', 's', 'leftRing') },
            { letter: 'A', lessons: generateLessonsForLetter('phase1', 'a', 'leftPinky') },
            // Right hand
            { letter: 'J', lessons: generateLessonsForLetter('phase1', 'j', 'rightIndex') },
            { letter: 'K', lessons: generateLessonsForLetter('phase1', 'k', 'rightMiddle') },
            { letter: 'L', lessons: generateLessonsForLetter('phase1', 'l', 'rightRing') },
            { letter: 'Ş', lessons: generateLessonsForLetter('phase1', 'ş', 'rightPinky') },
        ]
    },
    {
        id: 'phase2',
        title: 'Aşama 2: Üst Sıra (Upper Row)',
        description: 'Parmaklarınızı ana sıradan üst sıraya uzatarak harflere ulaşmayı öğrenin.',
        letters: [
            { letter: 'R', lessons: generateLessonsForLetter('phase2', 'r', 'leftIndex') },
            { letter: 'E', lessons: generateLessonsForLetter('phase2', 'e', 'leftMiddle') },
            { letter: 'W', lessons: generateLessonsForLetter('phase2', 'w', 'leftRing') },
            { letter: 'Q', lessons: generateLessonsForLetter('phase2', 'q', 'leftPinky') },
            { letter: 'U', lessons: generateLessonsForLetter('phase2', 'u', 'rightIndex') },
            { letter: 'I', lessons: generateLessonsForLetter('phase2', 'ı', 'rightMiddle') },
            { letter: 'O', lessons: generateLessonsForLetter('phase2', 'o', 'rightRing') },
            { letter: 'P', lessons: generateLessonsForLetter('phase2', 'p', 'rightPinky') },
        ]
    },
    {
        id: 'phase3',
        title: 'Aşama 3: Alt Sıra (Lower Row)',
        description: 'Parmaklarınızı alt sıraya uzatarak hızınızı kaybetmeden yazın.',
        letters: [
            { letter: 'V', lessons: generateLessonsForLetter('phase3', 'v', 'leftIndex') },
            { letter: 'C', lessons: generateLessonsForLetter('phase3', 'c', 'leftMiddle') },
            { letter: 'X', lessons: generateLessonsForLetter('phase3', 'x', 'leftRing') },
            { letter: 'Z', lessons: generateLessonsForLetter('phase3', 'z', 'leftPinky') },
            { letter: 'M', lessons: generateLessonsForLetter('phase3', 'm', 'rightIndex') },
            { letter: 'N', lessons: generateLessonsForLetter('phase3', 'n', 'rightMiddle') },
            { letter: 'B', lessons: generateLessonsForLetter('phase3', 'b', 'leftIndex') } // B is usually left index on QWERTY/Turkish Q
        ]
    },
    {
        id: 'phase4',
        title: 'Aşama 4: Özel Türkçe Karakterler & Uzantılar',
        description: 'Türkçeye özgü karakterler ve orta sütun uzanımları.',
        letters: [
            { letter: 'G', lessons: generateLessonsForLetter('phase4', 'g', 'leftIndex') },
            { letter: 'H', lessons: generateLessonsForLetter('phase4', 'h', 'rightIndex') },
            { letter: 'T', lessons: generateLessonsForLetter('phase4', 't', 'leftIndex') },
            { letter: 'Y', lessons: generateLessonsForLetter('phase4', 'y', 'rightIndex') },
            { letter: 'İ', lessons: generateLessonsForLetter('phase4', 'i', 'rightPinky') },
            { letter: 'Ü', lessons: generateLessonsForLetter('phase4', 'ü', 'rightPinky') },
            { letter: 'Ğ', lessons: generateLessonsForLetter('phase4', 'ğ', 'rightPinky') },
            { letter: 'Ç', lessons: generateLessonsForLetter('phase4', 'ç', 'rightPinky') },
            { letter: 'Ö', lessons: generateLessonsForLetter('phase4', 'ö', 'rightPinky') },
        ]
    }
];

// Phase 5, 6, 7 and 8 are structural word/sentence tests, which can be defined similarly or dynamically generated
// For MVP of 10-finger typing, we focus heavily on Phase 1-4 for strict mechanical finger placement training.

export function getLessonById(id: string): Lesson | null {
    for (const phase of CURRICULUM) {
        for (const letterGroup of phase.letters) {
            for (const lesson of letterGroup.lessons) {
                if (lesson.id === id) return lesson;
            }
        }
    }
    return null;
}

export function getNextLesson(currentLessonId: string): Lesson | null {
    let foundCurrent = false;
    for (const phase of CURRICULUM) {
        for (const letterGroup of phase.letters) {
            for (const lesson of letterGroup.lessons) {
                if (foundCurrent) return lesson;
                if (lesson.id === currentLessonId) {
                    foundCurrent = true;
                }
            }
        }
    }
    return null;
}

export function getPreviousLesson(currentLessonId: string): Lesson | null {
    let lastLesson: Lesson | null = null;
    for (const phase of CURRICULUM) {
        for (const letterGroup of phase.letters) {
            for (const lesson of letterGroup.lessons) {
                if (lesson.id === currentLessonId) return lastLesson;
                lastLesson = lesson;
            }
        }
    }
    return null;
}

export function getAllLessonIds(): string[] {
    const ids: string[] = [];
    for (const phase of CURRICULUM) {
        for (const letterGroup of phase.letters) {
            for (const lesson of letterGroup.lessons) {
                ids.push(lesson.id);
            }
        }
    }
    return ids;
}
