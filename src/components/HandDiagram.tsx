import { FingerType } from '../data/curriculum';

interface HandDiagramProps {
    targetFinger: FingerType | 'mixed';
    isLastCorrect: boolean;
    isLastWrong: boolean;
}

interface FingerDef {
    id: FingerType;
    label: string;
    keys: string[];
    heightClass: string;
}

const FINGER_STYLE: Record<FingerType, { fill: string; glow: string; label: string }> = {
    leftPinky: { fill: '#ec4899', glow: '0 0 18px #ec489988', label: 'Serçe' },
    leftRing: { fill: '#a855f7', glow: '0 0 18px #a855f788', label: 'Yüzük' },
    leftMiddle: { fill: '#22d3ee', glow: '0 0 18px #22d3ee88', label: 'Orta' },
    leftIndex: { fill: '#34d399', glow: '0 0 18px #34d39988', label: 'İşaret' },
    thumbs: { fill: '#94a3b8', glow: '0 0 18px #94a3b888', label: 'Başp.' },
    rightIndex: { fill: '#34d399', glow: '0 0 18px #34d39988', label: 'İşaret' },
    rightMiddle: { fill: '#22d3ee', glow: '0 0 18px #22d3ee88', label: 'Orta' },
    rightRing: { fill: '#a855f7', glow: '0 0 18px #a855f788', label: 'Yüzük' },
    rightPinky: { fill: '#ec4899', glow: '0 0 18px #ec489988', label: 'Serçe' },
};

const LEFT_FINGERS: FingerDef[] = [
    { id: 'leftPinky', label: 'SC', keys: ['Q', 'A', 'Z'], heightClass: 'h-20' },
    { id: 'leftRing', label: 'YZ', keys: ['W', 'S', 'X'], heightClass: 'h-24' },
    { id: 'leftMiddle', label: 'OT', keys: ['E', 'D', 'C'], heightClass: 'h-28' },
    { id: 'leftIndex', label: 'İŞ', keys: ['R', 'T', 'F', 'G', 'V', 'B'], heightClass: 'h-24' },
];

const RIGHT_FINGERS: FingerDef[] = [
    { id: 'rightIndex', label: 'İŞ', keys: ['Y', 'U', 'H', 'J', 'N', 'M'], heightClass: 'h-24' },
    { id: 'rightMiddle', label: 'OT', keys: ['I', 'K', 'Ö'], heightClass: 'h-28' },
    { id: 'rightRing', label: 'YZ', keys: ['O', 'L', 'Ç'], heightClass: 'h-24' },
    { id: 'rightPinky', label: 'SC', keys: ['P', 'Ğ', 'Ü', 'Ş', 'İ'], heightClass: 'h-20' },
];

function FingerPillar({
    finger,
    isTarget,
    isCorrect,
    isWrong,
}: {
    finger: FingerDef;
    isTarget: boolean;
    isCorrect: boolean;
    isWrong: boolean;
}) {
    const style = FINGER_STYLE[finger.id];

    let borderColor = 'border-slate-700/30';
    let bgColor = 'bg-dark-800/40';
    let boxShadow = 'none';
    let scaleClass = '';
    let textColor = 'text-slate-600';
    let fillColor = style.fill + '18'; // 10% opacity by default

    if (isCorrect && isTarget) {
        borderColor = 'border-emerald-400';
        bgColor = 'bg-emerald-500/20';
        boxShadow = '0 0 20px rgba(52,211,153,0.5)';
        scaleClass = 'scale-105';
        textColor = 'text-emerald-300';
        fillColor = '#34d39930';
    } else if (isWrong && isTarget) {
        borderColor = 'border-red-500';
        bgColor = 'bg-red-500/20';
        boxShadow = '0 0 16px rgba(239,68,68,0.4)';
        scaleClass = 'scale-105';
        textColor = 'text-red-300';
        fillColor = '#ef444430';
    } else if (isTarget) {
        borderColor = 'border-2';
        bgColor = '';
        boxShadow = style.glow;
        scaleClass = 'scale-105';
        textColor = 'text-white';
        fillColor = style.fill + '30';
    }

    return (
        <div
            className={`relative flex flex-col items-center gap-1 px-2 py-2 rounded-xl border-2 transition-all duration-200 cursor-default select-none ${scaleClass}`}
            style={{
                boxShadow: isTarget ? boxShadow : undefined,
                backgroundColor: fillColor,
                borderColor: isCorrect && isTarget ? '#34d399' : isWrong && isTarget ? '#ef4444' : isTarget ? style.fill : '#1e293b55',
            }}
        >
            {/* Keys list */}
            <div className="flex flex-col gap-[3px] items-center">
                {finger.keys.map(k => (
                    <div
                        key={k}
                        className={`w-8 h-6 flex items-center justify-center rounded-md text-xs font-black font-mono transition-colors border
                            ${isTarget ? 'border-current' : 'border-slate-700/40'}
                        `}
                        style={{
                            color: isCorrect && isTarget ? '#34d399' : isWrong && isTarget ? '#ef4444' : isTarget ? style.fill : '#475569',
                            backgroundColor: isTarget ? (isCorrect ? '#34d39915' : isWrong ? '#ef444415' : style.fill + '15') : '#0f172a40',
                        }}
                    >
                        {k}
                    </div>
                ))}
            </div>

            {/* Finger label */}
            <div
                className="text-[9px] font-bold uppercase tracking-widest mt-1 transition-colors"
                style={{ color: isTarget ? (isCorrect ? '#34d399' : isWrong ? '#ef4444' : style.fill) : '#334155' }}
            >
                {FINGER_STYLE[finger.id].label}
            </div>

            {/* Active indicator dot */}
            {isTarget && (
                <div
                    className="absolute -top-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full animate-bounce"
                    style={{ backgroundColor: isCorrect ? '#34d399' : isWrong ? '#ef4444' : style.fill }}
                />
            )}
        </div>
    );
}

export default function HandDiagram({ targetFinger, isLastCorrect, isLastWrong }: HandDiagramProps) {
    return (
        <div className="flex flex-col items-center gap-3 w-full max-w-3xl mx-auto my-4 select-none">
            {/* Hands row */}
            <div className="flex items-end justify-center gap-2 w-full">
                {/* LEFT HAND label */}
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-600 mr-1 writing-vertical self-center" style={{ writingMode: 'horizontal-tb' }}>
                    SOL EL
                </div>

                {/* Left Fingers */}
                {LEFT_FINGERS.map(f => (
                    <FingerPillar
                        key={f.id}
                        finger={f}
                        isTarget={targetFinger === f.id}
                        isCorrect={isLastCorrect}
                        isWrong={isLastWrong}
                    />
                ))}

                {/* Space (thumbs) */}
                <div className="flex flex-col items-center mx-2">
                    <div
                        className={`px-5 py-2 rounded-xl border-2 text-xs font-black font-mono transition-all duration-200 ${targetFinger === 'thumbs' ? 'scale-105' : ''}`}
                        style={{
                            borderColor: targetFinger === 'thumbs' ? (isLastCorrect ? '#34d399' : isLastWrong ? '#ef4444' : '#94a3b8') : '#1e293b55',
                            boxShadow: targetFinger === 'thumbs' ? (isLastCorrect ? '0 0 16px rgba(52,211,153,0.5)' : isLastWrong ? '0 0 16px rgba(239,68,68,0.4)' : '0 0 14px rgba(148,163,184,0.4)') : undefined,
                            backgroundColor: targetFinger === 'thumbs' ? (isLastCorrect ? '#34d39920' : isLastWrong ? '#ef444420' : '#94a3b820') : '#0f172a40',
                            color: targetFinger === 'thumbs' ? (isLastCorrect ? '#34d399' : isLastWrong ? '#ef4444' : '#94a3b8') : '#334155',
                        }}
                    >
                        SPACE
                    </div>
                    <div className="text-[9px] font-bold uppercase tracking-widest mt-1 text-slate-600">Başparmak</div>
                </div>

                {/* Right Fingers */}
                {RIGHT_FINGERS.map(f => (
                    <FingerPillar
                        key={f.id}
                        finger={f}
                        isTarget={targetFinger === f.id}
                        isCorrect={isLastCorrect}
                        isWrong={isLastWrong}
                    />
                ))}

                {/* RIGHT HAND label */}
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-600 ml-1 self-center">
                    SAĞ EL
                </div>
            </div>

            {/* Active finger hint */}
            {targetFinger !== 'mixed' && (
                <div
                    className="flex items-center gap-3 px-5 py-2 rounded-full border text-sm font-bold transition-all duration-200"
                    style={{
                        borderColor: isLastCorrect ? '#34d399' : isLastWrong ? '#ef4444' : FINGER_STYLE[targetFinger]?.fill ?? '#94a3b8',
                        color: isLastCorrect ? '#34d399' : isLastWrong ? '#ef4444' : FINGER_STYLE[targetFinger]?.fill ?? '#94a3b8',
                        backgroundColor: isLastCorrect ? '#34d39912' : isLastWrong ? '#ef444412' : (FINGER_STYLE[targetFinger]?.fill ?? '#94a3b8') + '12',
                    }}
                >
                    <div
                        className={`w-3 h-3 rounded-full ${isLastCorrect ? 'animate-none' : 'animate-pulse'}`}
                        style={{ backgroundColor: isLastCorrect ? '#34d399' : isLastWrong ? '#ef4444' : FINGER_STYLE[targetFinger]?.fill ?? '#94a3b8' }}
                    />
                    {isLastCorrect ? '✓ Doğru Parmak!' : isLastWrong ? '✗ Yanlış!' : `Aktif: ${FINGER_STYLE[targetFinger]?.label ?? ''} Parmak`}
                </div>
            )}
        </div>
    );
}
