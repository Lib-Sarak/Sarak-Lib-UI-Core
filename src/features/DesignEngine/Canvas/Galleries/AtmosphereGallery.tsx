import React from 'react';
import { motion } from 'framer-motion';
import { ATMOSPHERE_PRESETS, AtmospherePreset } from '../../../../core/Design/presets';
import { DesignScope } from '../../../../core/Design/components/DesignScope';
import { Sparkles, Check, Activity } from 'lucide-react';

interface AtmosphereGalleryProps {
    tokens: any;
    onUpdateDraft: (key: string, value: any) => void;
}

const AtmosphereSpecimen: React.FC<{ preset: AtmospherePreset, globalTokens: any, isActive: boolean }> = ({ preset, globalTokens, isActive }) => {
    const mergedTokens = React.useMemo(() => {
        const final = { ...globalTokens, ...preset.design };
        const reactiveTokens = ['themePrimary', 'mode'];
        reactiveTokens.forEach(token => {
            if (globalTokens[token] !== undefined) final[token] = globalTokens[token];
        });
        return final;
    }, [preset, globalTokens]);

    // Render texture based on preset
    const renderTexturePattern = () => {
        const type = mergedTokens.texture || 'none';
        const opacity = mergedTokens.textureOpacity ?? 0.1;
        if (type === 'none') return null;

        let bgImage = '';
        if (type === 'dots') {
            bgImage = 'radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)';
        } else if (type === 'grid') {
            bgImage = 'linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)';
        } else if (type === 'circuit') {
            bgImage = 'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.1) 2px, transparent 2px), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.1) 2px, transparent 2px)';
        } else if (type === 'silk') {
            bgImage = 'linear-gradient(135deg, rgba(255,255,255,0.05) 25%, transparent 25%)';
        } else if (type === 'noise') {
            bgImage = 'repeating-radial-gradient(circle, rgba(255,255,255,0.05), rgba(255,255,255,0.05) 2px, transparent 2px, transparent 4px)';
        } else if (type === 'carbon') {
            bgImage = 'linear-gradient(45deg, rgba(255,255,255,0.03) 25%, transparent 25%), linear-gradient(-45deg, rgba(255,255,255,0.03) 25%, transparent 25%)';
        }

        return (
            <div 
                className="absolute inset-0 z-10 pointer-events-none transition-opacity duration-500"
                style={{
                    backgroundImage: bgImage,
                    backgroundSize: type === 'dots' ? '12px 12px' : type === 'grid' ? '20px 20px' : type === 'carbon' ? '8px 8px' : '40px 40px',
                    opacity
                }}
            />
        );
    };

    return (
        <DesignScope design={mergedTokens}>
            <div 
                className="w-full h-full relative overflow-hidden group border border-white/5 flex flex-col justify-between p-6 transition-all duration-700 isolate bg-[#040406]"
            >
                {/* 1. Base Gradient Mode */}
                {mergedTokens.bgGradientMode === 'radial' && (
                    <div className="absolute inset-0 bg-radial-gradient from-[var(--theme-primary)]/10 to-transparent pointer-events-none opacity-50 z-0" />
                )}

                {/* 2. Texture Pattern Layer */}
                {renderTexturePattern()}

                {/* 3. Vignette Overlay Layer */}
                {mergedTokens.vignetteOpacity > 0 && (
                    <div 
                        className="absolute inset-0 pointer-events-none transition-all duration-500 z-15"
                        style={{
                            boxShadow: `inset 0 0 80px rgba(0,0,0,${mergedTokens.vignetteOpacity})`
                        }}
                    />
                )}

                {/* Specimen Info (High Tech Aesthetics) */}
                <div className="relative z-20 flex justify-between items-start opacity-30 group-hover:opacity-100 transition-opacity">
                    <div className="flex flex-col gap-1">
                        <span className="text-[6px] font-mono tracking-widest text-white/50 uppercase">TEXTURE_ID</span>
                        <span className="text-[9px] font-bold text-white uppercase font-mono">{preset.id.toUpperCase()}</span>
                    </div>
                    <Activity size={10} className="text-[var(--theme-primary)]" />
                </div>

                <div className="relative z-20 h-16 flex items-center justify-center opacity-20 group-hover:opacity-80 transition-opacity">
                    <span className="text-[20px] font-black tracking-widest uppercase italic text-white/10">{preset.name}</span>
                </div>

                <div className="relative z-20 flex justify-between items-center pt-2 border-t border-white/5">
                    <span className="text-[6px] font-mono text-white/30 uppercase tracking-[0.1em]">Atmospheric Node</span>
                    <div className="flex gap-1 items-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--theme-primary)]/30" />
                        <span className="text-[6px] font-mono text-white/50">{mergedTokens.textureOpacity ? `OP:${mergedTokens.textureOpacity}` : 'OP:0'}</span>
                    </div>
                </div>
            </div>
        </DesignScope>
    );
};

export const AtmosphereGallery: React.FC<AtmosphereGalleryProps> = ({ tokens, onUpdateDraft }) => {
    const handleSelect = (preset: AtmospherePreset) => {
        Object.entries(preset.design).forEach(([key, val]) => {
            onUpdateDraft(key, val);
        });
        onUpdateDraft('atmospherePresetId', preset.id);
    };

    return (
        <div className="flex flex-col h-full bg-[#050505]">
            <div className="flex items-center justify-between px-10 py-10 border-b border-white/5 bg-black/20 backdrop-blur-2xl sticky top-0 z-20">
                <div className="flex flex-col">
                    <h2 className="text-sm font-black uppercase tracking-[0.5em] text-white italic">Atmosfera & Texturas</h2>
                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mt-1">Ambientes, ruídos e padrões matemáticos</p>
                </div>
                
                <div className="flex items-center gap-4 px-5 py-2 bg-white/5 rounded-2xl border border-white/10">
                    <Sparkles size={14} className="text-[var(--theme-primary)]" />
                    <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">{ATMOSPHERE_PRESETS.length} Atmosferas</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {ATMOSPHERE_PRESETS.map((preset: AtmospherePreset) => {
                        const isActive = tokens.atmospherePresetId === preset.id;

                        return (
                            <div key={preset.id} className="space-y-4">
                                <motion.div 
                                    whileHover={{ y: -8 }}
                                    onClick={() => handleSelect(preset)}
                                    className={`relative h-[220px] rounded-[2.5rem] overflow-hidden cursor-pointer border transition-all duration-700 ${
                                        isActive ? 'border-[var(--theme-primary)] shadow-2xl shadow-primary-500/20' : 'border-white/5 hover:border-white/20'
                                    }`}
                                >
                                    <AtmosphereSpecimen 
                                        preset={preset} 
                                        globalTokens={tokens}
                                        isActive={isActive}
                                    />
                                    
                                    {isActive && (
                                        <div className="absolute top-6 right-6 z-30">
                                            <div className="w-8 h-8 bg-[var(--theme-primary)] rounded-full flex items-center justify-center shadow-lg shadow-primary-500/40 border border-white/20 scale-110">
                                                <Check className="text-white" size={14} />
                                            </div>
                                        </div>
                                    )}

                                    <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center backdrop-blur-sm group z-20">
                                        <div className="p-5 bg-white/10 rounded-2xl border border-white/20 mb-4 scale-75 group-hover:scale-100 transition-transform duration-500">
                                            <Sparkles size={24} className="text-white" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Apply Atmosphere</span>
                                    </div>
                                </motion.div>

                                <div className="px-4">
                                    <h3 className={`text-[11px] font-black uppercase tracking-widest ${isActive ? 'text-[var(--theme-primary)]' : 'text-white/80'}`}>{preset.name}</h3>
                                    <p className="text-[9px] text-white/30 uppercase leading-relaxed mt-1 tracking-wider line-clamp-1">{preset.description}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
