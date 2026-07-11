import React from 'react';
import { Monitor } from 'lucide-react';

interface LiveDraftPreviewFrameProps {
    previewDevice: 'desktop' | 'tablet' | 'smartphone';
    isPreviewStacked?: boolean;
    targetWidth: string | number;
    getDeviceHeightClass: () => string;
    getDeviceFrameStyles: () => string;
    isInspecting: boolean;
    setIsInspecting: (value: boolean) => void;
    children: React.ReactNode;
}

/** Moldura de hardware (notch/câmera) + botão de inspeção do "Gêmeo Digital" (Preset 1). */
export const LiveDraftPreviewFrame: React.FC<LiveDraftPreviewFrameProps> = ({
    previewDevice,
    isPreviewStacked,
    targetWidth,
    getDeviceHeightClass,
    getDeviceFrameStyles,
    isInspecting,
    setIsInspecting,
    children,
}) => {
    return (
        <div
            className={`relative shrink-0 overflow-hidden bg-[var(--theme-surface)] transition-all duration-500 flex flex-col group min-h-[var(--sarak-engine-min-h-sm,300px)] max-w-full ${getDeviceHeightClass()} ${getDeviceFrameStyles()} ${previewDevice === 'desktop' ? 'resize' : 'resize-none'}`}
            style={{
                width: previewDevice === 'desktop' ? (isPreviewStacked ? '100%' : '50%') : targetWidth,
                height: previewDevice === 'smartphone' ? 'var(--sarak-device-phone-height, 812px)' : previewDevice === 'tablet' ? 'var(--sarak-device-tablet-height, 1024px)' : 'auto',
                maxHeight: previewDevice !== 'desktop' ? '90vh' : 'none'
            } as React.CSSProperties}
        >
            {/* Hardware Mockup Extras (Notch, Camera) */}
            {previewDevice === 'smartphone' && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[var(--color-theme-card,#1e293b)] rounded-b-[var(--sarak-device-phone-notch-radius,1rem)] z-[1000] flex items-center justify-center gap-2">
                    <div className="w-12 h-1.5 rounded-full bg-black/50"></div>
                    <div className="w-2 h-2 rounded-full bg-[var(--color-theme-card, #000000)] shadow-inner border border-white/5"></div>
                </div>
            )}
            {previewDevice === 'tablet' && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-32 flex items-center justify-center z-[1000]">
                    {/* Camera na borda esquerda simulando modo paisagem/retrato dependendo do frame */}
                    <div className="absolute top-1/2 -translate-y-1/2 -left-3 w-2 h-2 rounded-full bg-[var(--color-theme-card, #000000)] shadow-inner border border-white/5"></div>
                </div>
            )}

            <button
                onClick={() => setIsInspecting(!isInspecting)}
                className={`absolute top-4 right-4 z-[9999] p-2 rounded-full backdrop-blur-md border shadow-2xl transition-all ${isInspecting ? 'bg-[var(--theme-primary)] text-white border-[var(--theme-primary)] animate-pulse scale-110' : 'bg-black/40 border-white/10 text-white/50 hover:text-white hover:bg-black/60 opacity-0 group-hover:opacity-100'}`}
                style={isInspecting ? { backgroundColor: 'var(--theme-primary, #00f2ff)', borderColor: 'var(--theme-primary, #00f2ff)' } : {}}
                title="Modo de Inspeção (Selecionar elemento)"
            >
                <Monitor size={16} />
            </button>
            {/* Overlay visually when inspecting */}
            {isInspecting && (
                <div className="absolute inset-0 z-[9998] bg-[var(--theme-primary)]/5 cursor-crosshair pointer-events-none border-2 border-[var(--theme-primary)]/50 rounded-[var(--sarak-device-frame-radius,2rem)]">
                    <div className="absolute top-8 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/80 backdrop-blur border border-[var(--theme-primary)]/50 rounded-full text-white text-xs font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(var(--theme-primary-rgb),0.3)]">
                        <div className="w-2 h-2 rounded-full bg-[var(--theme-primary)] animate-ping" />
                        Clique em um componente para inspecionar
                    </div>
                </div>
            )}

            <div className={`flex-1 relative sarak-device-${previewDevice} w-full h-full`}>
                {/* Watermark */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.02]">
                    <span className="text-[var(--sarak-type-scale-display,10rem)] font-black text-white uppercase tracking-[var(--sarak-tracking-tight,0.2em)] -rotate-12 select-none">SARAK TWIN</span>
                </div>
                {children}
            </div>
        </div>
    );
};
