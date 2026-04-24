import React from 'react';
import { motion } from 'framer-motion';
import { VISUALS_PRESETS, VisualsPreset } from '../../../../constants/visuals-presets';
import { Check, Palette, Grid, Box, Droplets } from 'lucide-react';

interface VisualsGalleryProps {
    onUpdateDraft: (key: string, value: any) => void;
    tokens: any;
}

export const VisualsGallery: React.FC<VisualsGalleryProps> = ({ onUpdateDraft, tokens }) => {
    return (
        <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {VISUALS_PRESETS.map((preset) => (
                <VisualsSpecimen 
                    key={preset.id}
                    preset={preset}
                    onSelect={() => {
                        Object.entries(preset.tokens).forEach(([key, val]) => onUpdateDraft(key, val));
                    }}
                    isActive={tokens.primaryColor === preset.tokens.primaryColor && tokens.texture === preset.tokens.texture}
                />
            ))}
        </div>
    );
};

const VisualsSpecimen: React.FC<{ preset: VisualsPreset; onSelect: () => void; isActive: boolean }> = ({ 
    preset, onSelect, isActive 
}) => {
    return (
        <motion.div 
            whileHover={{ y: -4 }}
            onClick={onSelect}
            className={`group relative bg-white/[0.02] border rounded-[2.5rem] overflow-hidden cursor-pointer transition-all duration-500 ${
                isActive ? 'border-[var(--theme-primary)] shadow-2xl shadow-primary-500/10' : 'border-white/5 hover:border-white/20'
            }`}
        >
            <div className="p-6 space-y-6">
                
                {/* 1. Atmosphere & Texture Preview */}
                <div className="h-24 bg-black/40 rounded-2xl border border-white/5 relative overflow-hidden flex items-center justify-center">
                    {/* The Actual Texture Layer (Simulated) */}
                    <div 
                        className="absolute inset-0 opacity-40 sarak-atmosphere-layer"
                        data-texture={preset.tokens.texture}
                        style={{ 
                            opacity: preset.tokens.textureOpacity * 2,
                            backgroundImage: `url('/textures/${preset.tokens.texture}.svg')` // Simulated path
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    
                    <div className="relative z-10 flex items-center gap-4">
                        <div 
                            className="w-12 h-12 rounded-full shadow-2xl border border-white/20 flex items-center justify-center"
                            style={{ 
                                backgroundColor: preset.tokens.primaryColor,
                                boxShadow: `0 0 30px ${preset.tokens.primaryColor}40`
                            }}
                        >
                            <Droplets className="text-white" size={20} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-white uppercase tracking-tighter">{preset.tokens.texture} Texture</span>
                            <span className="text-[8px] font-bold text-white/30 uppercase tracking-widest">{Math.round(preset.tokens.textureOpacity * 100)}% Intensity</span>
                        </div>
                    </div>
                </div>

                {/* 2. Material & Color Specs */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <span className="text-3xs font-black uppercase tracking-widest text-white/20 block">Surface Material</span>
                        <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-xl border border-white/5">
                            <Box size={12} className="text-[var(--theme-primary)]" />
                            <span className="text-[10px] font-black text-white/60 uppercase">{preset.tokens.surfaceMaterial}</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <span className="text-3xs font-black uppercase tracking-widest text-white/20 block">Primary Hex</span>
                        <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-xl border border-white/5">
                            <Palette size={12} className="text-white/40" />
                            <span className="text-[10px] font-black text-white/60 uppercase">{preset.tokens.primaryColor}</span>
                        </div>
                    </div>
                </div>

                {/* 3. Semantic Balance */}
                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <div className="flex gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/40" />
                        <div className="w-2 h-2 rounded-full bg-amber-500 shadow-lg shadow-amber-500/40" />
                        <div className="w-2 h-2 rounded-full bg-red-500 shadow-lg shadow-red-500/40" />
                    </div>
                    <div className="text-[9px] font-black text-white/20 uppercase tracking-widest">
                        {preset.title}
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
