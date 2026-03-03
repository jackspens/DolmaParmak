import { useState, useEffect, useRef, useMemo } from 'react';
import { calculateWPM, calculateAccuracy } from '../utils/wpm';
import { Timer, Zap, Target, RotateCcw } from 'lucide-react';
import VisualKeyboard, { KEY_FINGER_MAP } from './VisualKeyboard';
import FingerOverlay from './FingerOverlay';
import { FingerType } from '../data/curriculum';
import { FingerAccuracy } from '../types';

interface TypingEngineProps {
    text: string;
    targetFinger?: FingerType | 'mixed';
    onComplete: (wpm: number, accuracy: number, duration: number, correctChars: number, totalChars: number, sessionFingerStats: Partial<FingerAccuracy>) => void;
}

export default function TypingEngine({ text, targetFinger = 'mixed', onComplete }: TypingEngineProps) {
    const [input, setInput] = useState('');
    const [startTime, setStartTime] = useState<number | null>(null);
    const [endTime, setEndTime] = useState<number | null>(null);
    const [isActive, setIsActive] = useState(false);
    const [now, setNow] = useState<number>(Date.now());
    const inputRef = useRef<HTMLInputElement>(null);
    const [progress, setProgress] = useState(0);

    // Finger tracking state
    const [fingerStats, setFingerStats] = useState<Partial<FingerAccuracy>>({});
    const [lastPressedKey, setLastPressedKey] = useState('');
    const [isLastPressWrong, setIsLastPressWrong] = useState(false);

    // Focus hidden input on click
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    // Timer update
    useEffect(() => {
        let interval: any;
        if (isActive) {
            interval = setInterval(() => setNow(Date.now()), 100);
        }
        return () => clearInterval(interval);
    }, [isActive]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value;

        // Prevent paste (cheap trick: if jumping by >> 2 chars, ignore)
        if (Math.abs(val.length - input.length) > 2) return;

        if (!isActive && val.length > 0) {
            setIsActive(true);
            setStartTime(Date.now());
            setNow(Date.now());
        }

        const currentIndex = val.length - 1;
        const pressedChar = val[currentIndex];
        const targetChar = text[currentIndex];

        // Finger tracking logic
        if (pressedChar) {
            setLastPressedKey(pressedChar);
            const isMatch = pressedChar === targetChar;
            setIsLastPressWrong(!isMatch);

            if (targetChar) {
                const expectedFinger = KEY_FINGER_MAP[targetChar.toLowerCase()] || 'thumbs';
                setFingerStats(prev => {
                    const currentHits = prev[expectedFinger] || 0;
                    // For now, tracking "correct hits" vs "wrong hits" conceptually. 
                    // In a true system we'd track total attempts per finger to calc %.
                    // Storing simply correct hits here, can be expanded later.
                    return { ...prev, [expectedFinger]: isMatch ? currentHits + 1 : currentHits };
                });
            }
        }

        // Stop if text complete
        if (val.length >= text.length) {
            val = val.slice(0, text.length);
            setInput(val);
            setProgress(100);
            finishSession(val);
            return;
        }

        setInput(val);
        setProgress(Math.round((val.length / text.length) * 100));
    };

    const finishSession = (finalInput: string) => {
        setIsActive(false);
        const stop = Date.now();
        setEndTime(stop);

        const finalFingerStats: Partial<FingerAccuracy> = {};
        let correctChars = 0;
        for (let i = 0; i < finalInput.length; i++) {
            const isMatch = finalInput[i] === text[i];
            if (isMatch) correctChars++;

            // Map each character hit (correct or not) TO the finger meant for the TARGET char
            const targetChar = text[i];
            if (targetChar) {
                const expectedFinger = KEY_FINGER_MAP[targetChar.toLowerCase()] || 'thumbs';
                const hits = finalFingerStats[expectedFinger] || 0;
                finalFingerStats[expectedFinger] = isMatch ? hits + 1 : hits;
            }
        }

        const duration = (stop - (startTime || stop)) / 1000;
        const wpm = calculateWPM(correctChars, duration);
        const accuracy = calculateAccuracy(correctChars, finalInput.length);

        onComplete(wpm, accuracy, duration, correctChars, finalInput.length, finalFingerStats);
    };

    const handleRestart = () => {
        setInput('');
        setStartTime(null);
        setEndTime(null);
        setIsActive(false);
        setNow(Date.now());
        setLastPressedKey('');
        setIsLastPressWrong(false);
        setFingerStats({});
        inputRef.current?.focus();
    };

    // Live calculations
    const elapsedSec = startTime ? (isActive ? (now - startTime) / 1000 : ((endTime || now) - startTime) / 1000) : 0;
    let correctSoFar = 0;
    for (let i = 0; i < input.length; i++) {
        if (input[i] === text[i]) correctSoFar++;
    }
    const liveWPM = calculateWPM(correctSoFar, elapsedSec);
    const liveAccuracy = calculateAccuracy(correctSoFar, input.length);

    // Render text segments
    const characters = useMemo(() => {
        return text.split('').map((char, index) => {
            let stateClass = 'char-pending';
            if (index < input.length) {
                stateClass = input[index] === char ? 'char-correct' : 'char-incorrect';
            } else if (index === input.length && isActive) {
                stateClass = 'char-current text-slate-100';
            }

            return (
                <span key={index} className={`transition-colors duration-100 ${stateClass}`}>
                    {char}
                </span>
            );
        });
    }, [text, input, isActive]);

    return (
        <div className="w-full flex flex-col items-center">
            {/* Hidden mobile-friendly input */}
            <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={handleChange}
                onPaste={(e) => e.preventDefault()}
                className="opacity-0 absolute w-0 h-0 p-0 m-0 overflow-hidden pointer-events-none"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                disabled={!!endTime}
            />

            {/* Progress Bar */}
            <div className="w-full max-w-4xl h-1.5 bg-dark-800 rounded-full mb-8 overflow-hidden border border-slate-700/50">
                <div
                    className="h-full bg-gradient-to-r from-neon-500 to-emerald-500 transition-all duration-300 relative"
                    style={{ width: `${progress}%` }}
                >
                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                </div>
            </div>

            {/* Live Stats Bar */}
            <div className="flex w-full items-center justify-between mb-8 pb-4 border-b border-slate-700/50">
                <div className="flex items-center gap-6">
                    <div className="flex items-end gap-2 text-neon-400">
                        <Zap size={20} className="mb-1" />
                        <span className="text-3xl font-black font-mono leading-none">{liveWPM}</span>
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">wpm</span>
                    </div>
                    <div className="flex items-end gap-2 text-emerald-400">
                        <Target size={20} className="mb-1" />
                        <span className="text-3xl font-black font-mono leading-none">{liveAccuracy}</span>
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">%</span>
                    </div>
                    <div className="flex items-end gap-2 text-slate-300">
                        <Timer size={20} className="mb-1" />
                        <span className="text-3xl font-black font-mono leading-none">{Math.floor(elapsedSec)}</span>
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">sn</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {text[input.length] === ' ' && (
                        <div className="animate-bounce bg-amber-500/20 text-amber-500 px-3 py-1 rounded-lg border border-amber-500/50 text-xs font-bold uppercase tracking-tight flex items-center gap-2">
                            Boşluk Tuşuna Basın
                        </div>
                    )}
                    <button
                        onClick={handleRestart}
                        className="p-3 text-slate-400 hover:text-white hover:bg-dark-700 rounded-xl transition-colors custom-focus"
                        title="Baştan Başla (Tab + Enter)"
                    >
                        <RotateCcw size={20} />
                    </button>
                </div>
            </div>

            {/* Typing Canvas */}
            <div
                onClick={() => inputRef.current?.focus()}
                className="w-full max-w-4xl text-2xl md:text-3xl leading-relaxed font-mono text-slate-500 tracking-wide cursor-text relative min-h-[120px] mb-8"
                style={{ wordSpacing: '0.2em' }}
            >
                {!isActive && !endTime && (
                    <div className="absolute inset-x-0 -top-8 text-center text-sm font-bold text-neon-500 animate-pulse">
                        Başlamak için yazmaya başlayın...
                    </div>
                )}
                {characters}
            </div>

            <FingerOverlay targetFinger={targetFinger} />

            <div className="w-full transition-opacity duration-300">
                <VisualKeyboard
                    targetKey={text[input.length] || ''}
                    pressedKey={lastPressedKey}
                    isWrong={isLastPressWrong}
                />
            </div>
        </div>
    );
}
