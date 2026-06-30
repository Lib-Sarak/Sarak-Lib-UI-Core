import React from 'react';
import { motion } from 'framer-motion';
import { TYPOGRAPHY_PRESETS } from '../../../../core/Design/presets/components/typography';
import { ComponentPreset } from '../../../../core/Design/presets/components/cards';
import { Type } from 'lucide-react';

import { SarakDesignState } from '../../../../core/Provider/types';

interface TypographyCatalogProps {
    onApplyPreset: (presetDesign: Partial<SarakDesignState>, isPartial?: boolean) => void;
    currentMode: string;
}

export const TypographyCatalog: React.FC<TypographyCatalogProps> = ({ onApplyPreset }) => {
    return (
        <div className="w-full h-full flex flex-col relative bg-theme-bg">
            <div className="px-8 py-5 border-b border-theme-border flex items-center justify-between bg-theme-sidebar backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-theme-primary/10 rounded-xl border border-theme-primary/20">
                        <Type size={18} className="text-theme-primary" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-black uppercase text-theme-text tracking-[0.3em]">Design Intelligence Catalog</span>
                        <span className="text-[9px] font-bold text-theme-primary uppercase tracking-widest mt-0.5">
                            Pilar: Typography & Fonts
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {TYPOGRAPHY_PRESETS.map((preset, i) => (
                        <TypographyPresetPreview key={preset.id} preset={preset} index={i} onApply={() => onApplyPreset(preset.design, true)} />
                    ))}
                </div>
            </div>
        </div>
    );
};

const TypographyPresetPreview = ({ preset, index, onApply }: { preset: ComponentPreset, index: number, onApply: () => void }) => {
    return (
        <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={onApply}
            className="group flex flex-col text-left rounded-2xl border border-theme-border overflow-hidden bg-theme-card hover:border-theme-primary hover:shadow-[0_10px_40px_-10px_rgba(var(--theme-primary-rgb),0.1)] transition-all duration-300"
        >
            <div 
                className="h-48 w-full relative p-8 flex flex-col bg-[var(--color-theme-bg, #0a0a0c)] text-white overflow-hidden" 
                style={{ fontFamily: preset.design.fontFamily }}
            >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.05)_0%,transparent_50%)] pointer-events-none" />
                
                <div className="flex justify-between items-end mb-4 relative z-10">
                    <span className="text-6xl leading-none font-bold group-hover:scale-110 origin-bottom-left transition-transform duration-500">Aa</span>
                    <span className="text-sm text-white/40 tracking-widest uppercase">{preset.name}</span>
                </div>
                
                <div className="flex flex-col gap-2 relative z-10">
                    <p className="text-base font-medium text-white/90">The quick brown fox jumps over the lazy dog</p>
                    <p className="text-sm text-white/50">0123456789 & @ # % * ! ?</p>
                </div>
                
                <div className="absolute bottom-4 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="font-light">Light</span>
                    <span className="font-normal text-white/50">•</span>
                    <span className="font-bold">Bold</span>
                </div>
            </div>

            <div className="p-4 bg-theme-sidebar">
                <h3 className="text-sm font-bold text-theme-text uppercase tracking-wider">{preset.name}</h3>
                <p className="text-xs text-theme-muted mt-1">{preset.description}</p>
            </div>
        </motion.button>
    );
};
