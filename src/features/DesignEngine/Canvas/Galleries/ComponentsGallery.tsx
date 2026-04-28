import React from 'react';
import { motion } from 'framer-motion';
import { COMPONENT_PRESETS, ComponentPreset } from '../../../../constants/component-presets';
import { Check, Layout as LayoutIcon, Maximize, Zap } from 'lucide-react';
import { SocialButton } from '../../../../components/atomic/Atoms';

interface ComponentsGalleryProps {
    onUpdateDraft: (key: string, value: any) => void;
    tokens: any;
}

export const ComponentsGallery: React.FC<ComponentsGalleryProps> = ({ onUpdateDraft, tokens }) => {
    return (
        <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
            {COMPONENT_PRESETS.map((preset) => (
                <ComponentSpecimen 
                    key={preset.id}
                    preset={preset}
                    onSelect={() => {
                        Object.entries(preset.tokens).forEach(([key, val]) => onUpdateDraft(key, val));
                    }}
                    isActive={tokens.layoutDensity === preset.tokens.layoutDensity && tokens.layoutGap === preset.tokens.layoutGap}
                    globalTokens={tokens}
                />
            ))}
        </div>
    );
};

const ComponentSpecimen: React.FC<{ preset: ComponentPreset; onSelect: () => void; isActive: boolean; globalTokens: any }> = ({ 
    preset, onSelect, isActive, globalTokens 
}) => {
    // Merge for Digital Twin fidelity
    const mergedTokens = { ...globalTokens, ...preset.tokens };

    return (
        <motion.div 
            whileHover={{ y: -4 }}
            onClick={onSelect}
            className={`group relative bg-white/[0.02] border rounded-[2.5rem] overflow-hidden cursor-pointer transition-all duration-500 ${
                isActive ? 'border-[var(--theme-primary)] shadow-2xl shadow-primary-500/10' : 'border-white/5 hover:border-white/20'
            }`}
        >
            <div className="p-6 space-y-6">
                
                {/* 1. Button Architecture & Style Showcase */}
                <div className="bg-black/40 rounded-2xl border border-white/5 p-6 min-h-[180px] flex flex-col justify-center gap-6 overflow-hidden relative">
                    <div className="absolute top-3 left-4 text-[7px] font-black text-white/10 uppercase tracking-[0.3em]">
                        Button Architecture
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                             <span className="text-[7px] font-black text-white/20 uppercase tracking-widest">Solid Style</span>
                             <button className="w-full py-2 bg-[var(--theme-primary)] text-white text-[9px] font-black uppercase tracking-widest rounded-[var(--radius-theme)] shadow-lg shadow-primary-500/20">Primary</button>
                        </div>
                        <div className="space-y-1.5">
                             <span className="text-[7px] font-black text-white/20 uppercase tracking-widest">Glass Style</span>
                             <button className="w-full py-2 bg-white/5 backdrop-blur-md border border-white/10 text-white text-[9px] font-black uppercase tracking-widest rounded-[var(--radius-theme)]">Secondary</button>
                        </div>
                        <div className="space-y-1.5">
                             <span className="text-[7px] font-black text-white/20 uppercase tracking-widest">Outline Style</span>
                             <button className="w-full py-2 border border-[var(--theme-primary)]/40 text-[var(--theme-primary)] text-[9px] font-black uppercase tracking-widest rounded-[var(--radius-theme)]">Action</button>
                        </div>
                        <div className="space-y-1.5">
                             <span className="text-[7px] font-black text-white/20 uppercase tracking-widest">Minimal Style</span>
                             <button className="w-full py-2 text-white/60 text-[9px] font-black uppercase tracking-widest rounded-[var(--radius-theme)] hover:bg-white/5 transition-colors">Ghost</button>
                        </div>
                    </div>
                </div>

                {/* 2. Interactive States & Feedback */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <span className="text-3xs font-black uppercase tracking-widest text-white/20 block">Control Surface</span>
                        <div className="flex items-center gap-3 px-3 py-2 bg-white/5 rounded-xl border border-white/5">
                             <div className={`w-8 h-4 rounded-full relative transition-colors ${isActive ? 'bg-[var(--theme-primary)]' : 'bg-white/10'}`}>
                                 <div className="absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow-sm" />
                             </div>
                             <span className="text-[8px] font-black text-white/40 uppercase">Toggle State</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <span className="text-3xs font-black uppercase tracking-widest text-white/20 block">Input Architecture</span>
                        <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-xl border border-white/10">
                            <Zap size={10} className="text-white/20" />
                            <div className="w-12 h-1 bg-white/10 rounded-full" />
                        </div>
                    </div>
                </div>

                {/* 3. Layout Density Context */}
                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <div className="flex flex-col">
                        <h3 className="text-xs font-black uppercase tracking-tight text-white">{preset.title}</h3>
                        <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Density: {mergedTokens.layoutDensity}</p>
                    </div>
                    <div className="flex gap-1">
                         <div className="w-1.5 h-1.5 rounded-full bg-[var(--theme-primary)]" />
                         <div className="w-1.5 h-1.5 rounded-full bg-white/5" />
                    </div>
                </div>
            </div>

            {/* Active Indicator */}
            {isActive && (
                <div className="absolute top-6 right-6">
                    <div className="w-6 h-6 bg-[var(--theme-primary)] rounded-full flex items-center justify-center shadow-lg">
                        <Check className="text-white" size={12} />
                    </div>
                </div>
            )}
        </motion.div>
    );
};
