import React from 'react';
import { motion } from 'framer-motion';
import { BRANDING_PRESETS, BrandingPreset } from '../../../../constants/branding-presets';
import { Check, Globe, Zap } from 'lucide-react';

interface BrandingGalleryProps {
    onUpdateDraft: (key: string, value: any) => void;
    tokens: any;
}

export const BrandingGallery: React.FC<BrandingGalleryProps> = ({ onUpdateDraft, tokens }) => {
    return (
        <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {BRANDING_PRESETS.map((preset) => (
                <BrandingSpecimen 
                    key={preset.id}
                    preset={preset}
                    onSelect={() => {
                        Object.entries(preset.tokens).forEach(([key, val]) => onUpdateDraft(key, val));
                    }}
                    isActive={tokens.systemName === preset.tokens.systemName && tokens.logoPosition === preset.tokens.logoPosition}
                    globalTokens={tokens}
                />
            ))}
        </div>
    );
};

const BrandingSpecimen: React.FC<{ preset: BrandingPreset; onSelect: () => void; isActive: boolean; globalTokens: any }> = ({ 
    preset, onSelect, isActive, globalTokens 
}) => {
    // Merge for logic, but override name to keep it consistent as requested
    const mergedTokens = { ...globalTokens, ...preset.tokens, systemName: globalTokens.systemName || 'SARAK' };

    return (
        <motion.div 
            whileHover={{ scale: 1.01 }}
            onClick={onSelect}
            className={`group relative bg-white/[0.02] border rounded-[2.5rem] overflow-hidden cursor-pointer transition-all duration-500 ${
                isActive ? 'border-[var(--theme-primary)] shadow-2xl shadow-primary-500/10' : 'border-white/5 hover:border-white/20'
            }`}
        >
            <div className="p-6 space-y-6">
                
                {/* 1. Shell Context Preview (Sidebar or Topbar) */}
                <div className="bg-black/40 rounded-2xl border border-white/5 min-h-[140px] relative overflow-hidden flex items-center p-4">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent" />
                    
                    {mergedTokens.navigationStyle === 'topbar' ? (
                        <div className="w-full flex flex-col gap-2">
                            <div className="h-10 w-full bg-white/5 border border-white/10 rounded-lg flex items-center px-4 gap-3">
                                <div 
                                    className="w-6 h-6 rounded bg-[var(--theme-primary)] flex items-center justify-center shadow-lg"
                                    style={{ transform: `scale(${mergedTokens.logoScale})` }}
                                >
                                    <Zap className="text-white" size={10} />
                                </div>
                                <span className="text-[8px] font-black uppercase tracking-widest text-white/80">
                                    {mergedTokens.systemName}
                                </span>
                            </div>
                            <div className="flex-1 bg-white/[0.02] rounded-lg border border-white/5 h-16" />
                        </div>
                    ) : (
                        <div className="w-full flex gap-3 h-24">
                            <div className="w-16 bg-white/5 border border-white/10 rounded-lg flex flex-col items-center py-4 gap-4">
                                <div 
                                    className="w-8 h-8 rounded-lg bg-[var(--theme-primary)] flex items-center justify-center shadow-lg"
                                    style={{ transform: `scale(${mergedTokens.logoScale})` }}
                                >
                                    <Zap className="text-white" size={14} />
                                </div>
                                <div className="space-y-1 w-full px-2">
                                    <div className="h-1 w-full bg-white/10 rounded-full" />
                                    <div className="h-1 w-full bg-white/10 rounded-full" />
                                </div>
                            </div>
                            <div className="flex-1 bg-white/[0.02] rounded-lg border border-white/5" />
                        </div>
                    )}
                </div>

                {/* 2. Brand Ecosystem Contexts */}
                <div className="grid grid-cols-2 gap-4">
                    {/* App Icon Context */}
                    <div className="space-y-2">
                        <span className="text-3xs font-black uppercase tracking-widest text-white/20 block">System Signature</span>
                        <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl border border-white/5">
                            <div className="w-8 h-8 rounded-xl bg-[var(--theme-primary)] flex items-center justify-center shadow-lg shadow-primary-500/20">
                                <Zap className="text-white" size={14} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black text-white/60 uppercase">{mergedTokens.systemName}</span>
                                <span className="text-[7px] font-bold text-white/20 uppercase">Core Identity</span>
                            </div>
                        </div>
                    </div>

                    {/* Logo Visibility Test */}
                    <div className="space-y-2">
                        <span className="text-3xs font-black uppercase tracking-widest text-white/20 block">Chroma Balance</span>
                        <div className="flex items-center gap-2 h-[54px]">
                            <div className="flex-1 h-full bg-white rounded-lg flex items-center justify-center">
                                <Zap className="text-black/20" size={14} />
                            </div>
                            <div className="flex-1 h-full bg-black border border-white/10 rounded-lg flex items-center justify-center">
                                <Zap className="text-white/20" size={14} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Metadata */}
                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <div>
                        <h3 className="text-xs font-black uppercase tracking-tight text-white">{preset.title}</h3>
                        <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">{preset.description}</p>
                    </div>
                    <div className={`px-2 py-1 rounded-md text-[8px] font-black uppercase border ${
                        mergedTokens.systemTone === 'cyber' ? 'border-purple-500/30 text-purple-400 bg-purple-500/5' :
                        mergedTokens.systemTone === 'modern' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5' :
                        'border-blue-500/30 text-blue-400 bg-blue-500/5'
                    }`}>
                        {mergedTokens.systemTone}
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

            {/* Layout Decoration */}
            <div className="absolute -bottom-2 -right-2 opacity-5 pointer-events-none">
                <Globe size={80} />
            </div>
        </motion.div>
    );
};
