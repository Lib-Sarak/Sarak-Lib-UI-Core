import React from 'react';
import { GalleryItem } from './GalleryItem';
import { TYPOGRAPHY_PRESETS } from './presets';

interface TypographyGalleryProps {
    tokens: any;
    onUpdateDraft: (key: string, value: any) => void;
}

export const TypographyGallery: React.FC<TypographyGalleryProps> = ({ tokens, onUpdateDraft }) => {
    const handleSelect = (v: any) => {
        Object.entries(v.tokens).forEach(([key, val]) => onUpdateDraft(key, val));
    };

    return (
        <div className="grid grid-cols-1 gap-6 p-6 overflow-y-auto custom-scrollbar h-full bg-black/60">
            {TYPOGRAPHY_PRESETS.map((v) => (
                <GalleryItem 
                    key={v.id}
                    title={v.title}
                    description={v.description}
                    isActive={tokens.headingFont === v.tokens.headingFont}
                    onClick={() => handleSelect(v)}
                >
                    <div className="flex flex-col gap-6 w-full text-left p-6 bg-black/20 rounded-xl border border-white/5 relative overflow-hidden group-hover:bg-black/30 transition-all">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                             <span className="text-[120px] font-black" style={{ fontFamily: v.tokens.headingFont }}>{v.title[0]}</span>
                        </div>
                        
                        <div className="space-y-1 relative z-10">
                             <h1 className="text-3xl font-black text-white" style={{ fontFamily: v.tokens.headingFont, letterSpacing: v.tokens.headingLetterSpacing === 'tight' ? '-0.05em' : v.tokens.headingLetterSpacing === 'wide' ? '0.1em' : '0' }}>
                                 Digital Sovereign
                             </h1>
                             <p className="text-[var(--theme-primary)] text-xs font-bold uppercase tracking-widest" style={{ fontFamily: v.tokens.bodyFont }}>
                                 Precision Interface Engine
                             </p>
                        </div>

                        <div className="space-y-2 relative z-10 border-t border-white/5 pt-4">
                             <p className="text-xs text-white/50 leading-relaxed" style={{ fontFamily: v.tokens.bodyFont }}>
                                 O ecossistema Sarak permite o controle granular de cada token tipográfico, garantindo legibilidade em resoluções extremas e identidades visuais mutáveis.
                             </p>
                             <div className="flex gap-4">
                                  <span className="text-[10px] text-white/20 uppercase tracking-tighter" style={{ fontFamily: v.tokens.bodyFont }}>Weight: {v.tokens.headingWeight}</span>
                                  <span className="text-[10px] text-white/20 uppercase tracking-tighter" style={{ fontFamily: v.tokens.bodyFont }}>Spacing: {v.tokens.headingLetterSpacing}</span>
                             </div>
                        </div>
                    </div>
                </GalleryItem>
            ))}
        </div>
    );
};
