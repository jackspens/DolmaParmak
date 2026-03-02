import { useState, useEffect, useRef, useMemo } from 'react';
import { calculateWPM, calculateAccuracy } from '../utils/wpm';
import { Timer, Zap, Target, RotateCcw } from 'lucide-react';

interface TypingEngineProps {
    text: string;
    onComplete: (wpm: number, accuracy: number, duration: number, correctChars: number, totalChars: number) => void;
}

export default function TypingEngine({ text, onComplete }: TypingEngineProps) {
    const [input, setInput] = useState('');
    const [startTime, setStartTime] = useState<number | null>(null);
    const [endTime, setEndTime] = useState<number | null>(null);
    const [isActive, setIsActive] = useState(false);
    const [now, setNow] = useState<number>(Date.now());
    const inputRef = useRef<HTMLInputElement>(null);

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

        // Stop if text complete
        if (val.length >= text.length) {
            val = val.slice(0, text.length);
            setInput(val);
            finishSession(val);
            return;
        }

        setInput(val);
    };

    const finishSession = (finalInput: string) => {
        setIsActive(false);
        const stop = Date.now();
        setEndTime(stop);

        let correctChars = 0;
        for (let i = 0; i < finalInput.length; i++) {
            if (finalInput[i] === text[i]) correctChars++;
        }

        const duration = (stop - (startTime || stop)) / 1000;
        const wpm = calculateWPM(correctChars, duration);
        const accuracy = calculateAccuracy(correctChars, finalInput.length);

        onComplete(wpm, accuracy, duration, correctChars, finalInput.length);
    };

    const handleRestart = () => {
        setInput('');
        setStartTime(null);
        setEndTime(null);
        setIsActive(false);
        setNow(Date.now());
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

                <button
                    onClick={handleRestart}
                    className="p-3 text-slate-400 hover:text-white hover:bg-dark-700 rounded-xl transition-colors custom-focus"
                    title="Baştan Başla (Tab + Enter)"
                >
                    <RotateCcw size={20} />
                </button>
            </div>

            {/* Typing Canvas */}
            <div
                onClick={() => inputRef.current?.focus()}
                className="w-full max-w-4xl text-2xl md:text-4xl leading-relaxed md:leading-loose font-mono text-slate-500 tracking-wide cursor-text relative min-h-[200px]"
                style={{ wordSpacing: '0.2em' }}
            >
                {!isActive && !endTime && (
                    <div className="absolute inset-x-0 -top-8 text-center text-sm font-bold text-neon-500 animate-pulse">
                        Başlamak için yazmaya başlayın...
                    </div>
                )}
                {characters}
            </div>

            {/* Completion Overlay */}
            {endTime && (
                <div className="mt-8 animate-fade-up glass p-6 border-neon-500/30 neon-glow w-full max-w-lg text-center">
                    <h3 className="text-xl font-black text-white mb-2">Egzersiz Tamamlandı!</h3>
                    <p className="text-slate-400 mb-6 font-medium">Sonuçların profilinize kaydedildi.</p>
                    <button onClick={handleRestart} className="btn-primary w-full">Yeni Metinle Devam Et</button>
                </div>
            )}
        </div>
    );
}
