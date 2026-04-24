import React from 'react';
import { motion } from 'framer-motion';
import { COMPONENT_PRESETS, ComponentPreset } from '../../../../constants/component-presets';
import { Check, Layout as LayoutIcon, Maximize, Grid as GridIcon, Square, Layers } from 'lucide-react';

interface ComponentsGalleryProps {
    onUpdateDraft: (key: string, value: any) => void;
    tokens: any;
}

export const ComponentsGallery: React.FC<ComponentsGalleryProps> = ({ onUpdateDraft, tokens }) => {
    return (
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            {COMPONENT_PRESETS.map((preset) => (
                <ComponentSpecimen 
                    key={preset.id}
                    preset={preset}
                    onSelect={() => {
                        Object.entries(preset.tokens).forEach(([key, val]) => onUpdateDraft(key, val));
                    }}
                    isActive={tokens.layoutDensity === preset.tokens.layoutDensity && tokens.layoutGap === preset.tokens.layoutGap}
                />
            ))}
        </div>
    );
};

const ComponentSpecimen: React.FC<{ preset: ComponentPreset; onSelect: () => void; isActive: boolean }> = ({ 
    preset, onSelect, isActive 
}) => {
    return (
        <motion.div 
            whileHover={{ y: -4 }}
            onClick={onSelect}
            className={`group relative bg-white/[0.02] border rounded-[2rem] overflow-hidden cursor-pointer transition-all duration-500 ${
                isActive ? 'border-[var(--theme-primary)] shadow-2xl shadow-primary-500/10' : 'border-white/5 hover:border-white/20'
            }`}
        >
            <div className="p-6 space-y-6">
                
                {/* 1. Layout Density & Gap Preview */}
                <div className="bg-black/40 rounded-2xl border border-white/5 p-4 min-h-[120px] flex flex-col justify-center overflow-hidden">
                    <div className="text-[7px] font-black text-white/10 uppercase tracking-[0.3em] mb-3">Ergonomics & Density ({preset.tokens.layoutDensity})</div>
                    
                    <div className="flex flex-wrap gap-2" style={{ gap: `${preset.tokens.layoutGap / 4}px` }}>
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center">
                                <Square size={10} className="text-white/20" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* 2. Navigation Spec (Sidebar vs Topbar) */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <span className="text-3xs font-black uppercase tracking-widest text-white/20 block">Navigation Style</span>
                        <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-xl border border-white/5">
                            <LayoutIcon size={12} className="text-[var(--theme-primary)]" />
                            <span className="text-[10px] font-black text-white/60 uppercase">{preset.tokens.navigationStyle}</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <span className="text-3xs font-black uppercase tracking-widest text-white/20 block">Sidebar Width</span>
                        <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-xl border border-white/5">
                            <Maximize size={12} className="text-white/40 rotate-90" />
                            <span className="text-[10px] font-black text-white/60 uppercase">{preset.tokens.sidebarWidth}px</span>
                        </div>
                    </div>
                </div>

                {/* 3. Metadata */}
                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <div>
                        <h3 className="text-xs font-black uppercase tracking-tight text-white">{preset.title}</h3>
                        <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">{preset.description}</p>
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
