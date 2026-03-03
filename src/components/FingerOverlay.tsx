import * as React from 'react';
import { FingerType } from '../data/curriculum';

interface FingerOverlayProps {
    targetFinger: FingerType | 'mixed';
}

const FINGER_LABELS: Record<FingerType, string> = {
    leftPinky: 'Sol Serçe (A, Q, Z)',
    leftRing: 'Sol Yüzük (S, W, X)',
    leftMiddle: 'Sol Orta (D, E, C)',
    leftIndex: 'Sol İşaret (F, R, V, G, T, B)',
    rightIndex: 'Sağ İşaret (J, U, M, H, Y, N)',
    rightMiddle: 'Sağ Orta (K, I, Ö)',
    rightRing: 'Sağ Yüzük (L, O, Ç)',
    rightPinky: 'Sağ Serçe (Ş, P, Ü, Ğ, İ)',
    thumbs: 'Başparmak (Boşluk)'
};

export default function FingerOverlay({ targetFinger }: FingerOverlayProps) {
    if (targetFinger === 'mixed') return null;

    return (
        <div className="flex flex-col items-center gap-2 mb-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Aktif Parmak</h3>
            <div className="flex items-center gap-3 bg-dark-800 border border-slate-700/50 px-6 py-3 rounded-full shadow-lg">
                <div className={`w-4 h-4 rounded-full shadow-[0_0_10px_currentColor] animate-pulse
                    ${targetFinger.includes('Pinky') ? 'bg-pink-500 text-pink-500' : ''}
                    ${targetFinger.includes('Ring') ? 'bg-indigo-500 text-indigo-500' : ''}
                    ${targetFinger.includes('Middle') ? 'bg-cyan-500 text-cyan-500' : ''}
                    ${targetFinger.includes('Index') ? 'bg-emerald-500 text-emerald-500' : ''}
                    ${targetFinger === 'thumbs' ? 'bg-slate-400 text-slate-400' : ''}
                `} />
                <span className="text-white font-bold">{FINGER_LABELS[targetFinger]}</span>
            </div>
        </div>
    );
}
