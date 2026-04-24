import React from 'react';
import { motion } from 'framer-motion';
import { useSarakUI, UIContext } from '../../../../core/Provider/SarakUIProvider';
import { BRANDING_PRESETS, BrandingPreset } from '../../../../constants/branding-presets';
import { Check, Globe, Maximize, Layout as LayoutIcon, Zap, Shield } from 'lucide-react';

interface BrandingGalleryProps {
    onUpdateDraft: (key: string, value: any) => void;
    tokens: any;
}

export const BrandingGallery: React.FC<BrandingGalleryProps> = ({ onUpdateDraft, tokens }) => {
    return (
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {BRANDING_PRESETS.map((preset) => (
                <BrandingSpecimen 
                    key={preset.id}
                    preset={preset}
                    onSelect={() => {
                        Object.entries(preset.tokens).forEach(([key, val]) => onUpdateDraft(key, val));
                    }}
                    isActive={tokens.systemName === preset.tokens.systemName && tokens.logoPosition === preset.tokens.logoPosition}
                />
            ))}
        </div>
    );
};

const BrandingSpecimen: React.FC<{ preset: BrandingPreset; onSelect: () => void; isActive: boolean }> = ({ 
    preset, onSelect, isActive 
}) => {
    return (
        <motion.div 
            whileHover={{ scale: 1.02 }}
            onClick={onSelect}
            className={`group relative bg-white/[0.02] border rounded-[2rem] overflow-hidden cursor-pointer transition-all duration-500 ${
                isActive ? 'border-[var(--theme-primary)] shadow-2xl shadow-primary-500/10' : 'border-white/5 hover:border-white/20'
            }`}
        >
            <div className="p-6 space-y-6">
                
                {/* 1. Header Placement Preview */}
                <div className="h-16 bg-black/40 rounded-xl border border-white/5 flex items-center px-4 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent opacity-50" />
                    
                    <div className={`flex items-center gap-3 w-full ${preset.tokens.logoPosition === 'center' ? 'justify-center' : 'justify-start'}`}>
                        <div 
                            className="w-8 h-8 rounded-lg bg-[var(--theme-primary)] flex items-center justify-center shadow-lg"
                            style={{ transform: `scale(${preset.tokens.logoScale * 0.6})` }}
                        >
                            <Zap className="text-white" size={14} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/80">
                            {preset.tokens.systemName}
                        </span>
                    </div>

                    {/* Fake UI elements */}
                    <div className="absolute right-4 flex gap-2">
                        <div className="w-4 h-4 rounded-full bg-white/5" />
                        <div className="w-4 h-4 rounded-full bg-white/5" />
                    </div>
                </div>

                {/* 2. Info Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-tight text-white">{preset.title}</h3>
                            <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">{preset.description}</p>
                        </div>
                        <div className={`px-2 py-1 rounded-md text-[8px] font-black uppercase border ${
                            preset.tokens.systemTone === 'cyber' ? 'border-purple-500/30 text-purple-400 bg-purple-500/5' :
                            preset.tokens.systemTone === 'modern' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5' :
                            'border-blue-500/30 text-blue-400 bg-blue-500/5'
                        }`}>
                            {preset.tokens.systemTone}
                        </div>
                    </div>

                    {/* 3. Contrast Test (Light/Dark) */}
                    <div className="grid grid-cols-2 gap-2 h-12">
                        <div className="bg-white rounded-lg flex items-center justify-center">
                             <span className="text-[8px] font-black text-black uppercase opacity-20">Logo Light Test</span>
                        </div>
                        <div className="bg-black/60 rounded-lg flex items-center justify-center border border-white/5">
                             <span className="text-[8px] font-black text-white uppercase opacity-20">Logo Dark Test</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Active Indicator */}
            {isActive && (
                <div className="absolute top-4 right-4">
                    <div className="w-5 h-5 bg-[var(--theme-primary)] rounded-full flex items-center justify-center shadow-lg">
                        <Check className="text-white" size={10} />
                    </div>
                </div>
            )}

            {/* Layout Decoration */}
            <div className="absolute -bottom-2 -right-2 opacity-5 pointer-events-none">
                <Globe size={80} />
            </div>
        </motion.div>
    );
};
