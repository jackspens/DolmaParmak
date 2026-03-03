import * as React from 'react';
import { FingerType } from '../data/curriculum';

interface VisualKeyboardProps {
    targetKey: string;     // The next expected key
    pressedKey: string;    // Currently pressed key (if any)
    isWrong: boolean;      // Did they press the wrong key?
}

// Map each key to its required finger type
export const KEY_FINGER_MAP: Record<string, FingerType> = {
    // Upper Row
    'q': 'leftPinky', 'w': 'leftRing', 'e': 'leftMiddle', 'r': 'leftIndex', 't': 'leftIndex',
    'y': 'rightIndex', 'u': 'rightIndex', 'ı': 'rightMiddle', 'i': 'rightMiddle', 'o': 'rightRing', 'p': 'rightPinky', 'ğ': 'rightPinky', 'ü': 'rightPinky',

    // Home Row
    'a': 'leftPinky', 's': 'leftRing', 'd': 'leftMiddle', 'f': 'leftIndex', 'g': 'leftIndex',
    'h': 'rightIndex', 'j': 'rightIndex', 'k': 'rightMiddle', 'l': 'rightRing', 'ş': 'rightPinky', 'i̇': 'rightPinky',

    // Lower Row
    'z': 'leftPinky', 'x': 'leftRing', 'c': 'leftMiddle', 'v': 'leftIndex', 'b': 'leftIndex',
    'n': 'rightIndex', 'm': 'rightIndex', 'ö': 'rightRing', 'ç': 'rightPinky',

    ' ': 'thumbs'
};

const FINGER_COLORS: Record<FingerType, string> = {
    leftPinky: 'border-b-pink-500/50 bg-pink-500/10 text-pink-300',
    leftRing: 'border-b-indigo-500/50 bg-indigo-500/10 text-indigo-300',
    leftMiddle: 'border-b-cyan-500/50 bg-cyan-500/10 text-cyan-300',
    leftIndex: 'border-b-emerald-500/50 bg-emerald-500/10 text-emerald-300',

    rightIndex: 'border-b-emerald-500/50 bg-emerald-500/10 text-emerald-300',
    rightMiddle: 'border-b-cyan-500/50 bg-cyan-500/10 text-cyan-300',
    rightRing: 'border-b-indigo-500/50 bg-indigo-500/10 text-indigo-300',
    rightPinky: 'border-b-pink-500/50 bg-pink-500/10 text-pink-300',

    thumbs: 'border-b-slate-500/50 bg-slate-500/10 text-slate-300'
};

const KEY_ROWS = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'ı', 'o', 'p', 'ğ', 'ü'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ş', 'i̇'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm', 'ö', 'ç']
];

export default function VisualKeyboard({ targetKey, pressedKey, isWrong }: VisualKeyboardProps) {

    const renderKey = (key: string, label?: string, flexClass?: string) => {
        const lowerKey = key.toLowerCase();
        const tKey = targetKey.toLowerCase();
        const pKey = pressedKey.toLowerCase();

        const isTarget = lowerKey === tKey;
        const isPressed = lowerKey === pKey;

        const finger = KEY_FINGER_MAP[lowerKey] || 'thumbs';
        const fingerColorClass = FINGER_COLORS[finger];

        // State classes
        let stateClass = 'border-slate-800 bg-dark-900 border-b-slate-700 text-slate-400 opacity-60'; // Default idle

        if (isTarget) {
            stateClass = `border-neon-500 bg-neon-500/20 text-neon-300 border-b-neon-600 shadow-[0_0_15px_rgba(14,165,233,0.3)] animate-pulse`;
        }

        if (isPressed) {
            if (isWrong) {
                stateClass = 'border-red-500 bg-red-500/30 text-red-300 border-b-0 translate-y-1';
            } else if (isTarget) {
                stateClass = 'border-emerald-500 bg-emerald-500/30 text-emerald-300 border-b-0 translate-y-1';
            } else {
                stateClass = `${fingerColorClass.replace('border-b-', 'border-')} border-b-0 translate-y-1 opacity-100`;
            }
        } else if (!isTarget) {
            stateClass = `${fingerColorClass} opacity-80`;
        }

        return (
            <div
                key={lowerKey}
                className={`
                    relative flex items-center justify-center rounded-lg border-2 border-b-4 
                    font-mono font-bold text-lg uppercase transition-all duration-150 select-none
                    ${flexClass || 'w-12 h-14 sm:w-14 sm:h-16'}
                    ${stateClass}
                `}
            >
                {label || key}
                {/* Home row bumps */}
                {(lowerKey === 'f' || lowerKey === 'j') && (
                    <div className="absolute bottom-1 w-3 h-[2px] bg-current rounded-full" />
                )}
            </div>
        );
    };

    return (
        <div className="glass p-6 sm:p-8 rounded-2xl w-full max-w-4xl mx-auto overflow-x-auto">
            <div className="min-w-[700px] flex flex-col gap-2 mx-auto justify-center items-center">

                {/* Upper Row */}
                <div className="flex gap-2 ml-4">
                    {KEY_ROWS[0].map(k => renderKey(k))}
                </div>

                {/* Home Row */}
                <div className="flex gap-2 ml-10">
                    {KEY_ROWS[1].map(k => renderKey(k))}
                </div>

                {/* Lower Row */}
                <div className="flex gap-2 ml-20">
                    {KEY_ROWS[2].map(k => renderKey(k))}
                </div>

                {/* Space Bar Row */}
                <div className="flex gap-2 mt-2 w-full max-w-[600px]">
                    <div className="flex-1" />
                    {renderKey(' ', 'SPACE', 'w-96 h-14 sm:h-16')}
                    <div className="flex-1" />
                </div>

            </div>
        </div>
    );
}
