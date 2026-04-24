import React from 'react';
import { motion } from 'framer-motion';
import { LAYOUT_PRESETS, LayoutPreset } from '../../../../constants/layout-presets';
import { Check, Layout as LayoutIcon, Maximize2, Monitor, Split, EyeOff } from 'lucide-react';

interface LayoutGalleryProps {
    onUpdateDraft: (key: string, value: any) => void;
    tokens: any;
}

export const LayoutGallery: React.FC<LayoutGalleryProps> = ({ onUpdateDraft, tokens }) => {
    return (
        <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {LAYOUT_PRESETS.map((preset) => (
                <LayoutSpecimen 
                    key={preset.id}
                    preset={preset}
                    onSelect={() => {
                        Object.entries(preset.tokens).forEach(([key, val]) => onUpdateDraft(key, val));
                    }}
                    isActive={tokens.navigationStyle === preset.tokens.navigationStyle && tokens.maxContentWidth === preset.tokens.maxContentWidth}
                />
            ))}
        </div>
    );
};

const LayoutSpecimen: React.FC<{ preset: LayoutPreset; onSelect: () => void; isActive: boolean }> = ({ 
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
                
                {/* 1. Shell Wireframe Preview */}
                <div className="h-40 bg-black/40 rounded-2xl border border-white/5 p-3 flex flex-col relative overflow-hidden">
                    <div className="absolute top-2 left-4 text-[6px] font-black text-white/5 uppercase tracking-[0.4em]">Architecture Blueprint</div>
                    
                    {/* Topbar Simulation */}
                    {preset.tokens.navigationStyle === 'topbar' && (
                        <div className="h-4 w-full bg-[var(--theme-primary)]/20 border border-[var(--theme-primary)]/30 rounded-md mb-2 flex items-center px-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                        </div>
                    )}

                    <div className="flex-1 flex gap-2 overflow-hidden">
                        {/* Sidebar Simulation */}
                        {preset.tokens.navigationStyle === 'sidebar' && (
                            <div 
                                className={`h-full bg-white/5 border border-white/10 rounded-lg transition-all duration-700 flex flex-col p-2 gap-1 ${preset.tokens.isAutoHideEnabled ? 'opacity-40' : ''}`}
                                style={{ width: `${preset.tokens.sidebarWidth / 6}px` }}
                            >
                                <div className="h-2 w-full bg-white/10 rounded" />
                                <div className="h-2 w-full bg-white/5 rounded" />
                                <div className="h-2 w-full bg-white/5 rounded" />
                            </div>
                        )}

                        {/* Content Area Simulation */}
                        <div className="flex-1 flex flex-col gap-2">
                            <div className="flex-1 bg-white/[0.02] border border-dashed border-white/5 rounded-lg flex items-center justify-center relative overflow-hidden">
                                {/* Safe Area Visualization */}
                                <div 
                                    className="h-full border-x border-dashed border-[var(--theme-primary)]/20 transition-all duration-700"
                                    style={{ width: preset.tokens.maxContentWidth === 'none' ? '100%' : '70%' }}
                                />
                                
                                {preset.tokens.isSplitViewEnabled && (
                                    <div className="absolute inset-0 flex">
                                        <div className="w-1/2 border-r border-dashed border-white/10" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Metadata & Specs */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-tight text-white">{preset.title}</h3>
                            <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">{preset.description}</p>
                        </div>
                    </div>

                    {/* 3. Tech Specs */}
                    <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-2 px-2 py-1.5 bg-white/5 rounded-lg border border-white/5">
                            <Monitor size={10} className="text-white/20" />
                            <span className="text-[8px] font-black text-white/40 uppercase">{preset.tokens.maxContentWidth === 'none' ? 'Fluid' : preset.tokens.maxContentWidth}</span>
                        </div>
                        <div className="flex items-center gap-2 px-2 py-1.5 bg-white/5 rounded-lg border border-white/5">
                            {preset.tokens.isSplitViewEnabled ? <Split size={10} className="text-[var(--theme-primary)]" /> : <Maximize2 size={10} className="text-white/20" />}
                            <span className="text-[8px] font-black text-white/40 uppercase">{preset.tokens.isSplitViewEnabled ? 'Split On' : 'Standard'}</span>
                        </div>
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
