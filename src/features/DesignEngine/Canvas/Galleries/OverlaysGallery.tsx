import React from 'react';
import { motion } from 'framer-motion';
import { OVERLAY_PRESETS, OverlayPreset } from '../../../../core/Design/presets';
import { DesignScope } from '../../../../core/Design/components/DesignScope';
import { Layers, Shield, Check, HelpCircle } from 'lucide-react';

interface OverlaysGalleryProps {
    tokens: any;
    onUpdateDraft: (key: string, value: any) => void;
}

const OverlaySpecimen: React.FC<{ preset: OverlayPreset, globalTokens: any, isActive: boolean }> = ({ preset, globalTokens, isActive }) => {
    const mergedTokens = React.useMemo(() => {
        const final = { ...globalTokens, ...preset.design };
        const reactiveTokens = ['themePrimary', 'mode'];
        reactiveTokens.forEach(token => {
            if (globalTokens[token] !== undefined) final[token] = globalTokens[token];
        });
        return final;
    }, [preset, globalTokens]);

    return (
        <DesignScope design={mergedTokens}>
            <div className="w-full h-full relative overflow-hidden group bg-[#060608] border border-white/5 p-4 flex flex-col justify-center items-center">
                {/* 1. Underlying Mock Content to Prove Backdrop Blur & Opacity */}
                <div className="absolute inset-0 p-4 opacity-40 select-none flex flex-col justify-between pointer-events-none">
                    <div className="space-y-2">
                        <div className="h-2 w-2/3 bg-white/20 rounded" />
                        <div className="h-1.5 w-full bg-white/10 rounded" />
                        <div className="h-1.5 w-5/6 bg-white/10 rounded" />
                    </div>
                    <div className="flex gap-2">
                        <div className="h-8 w-12 bg-[var(--theme-primary)]/20 rounded" />
                        <div className="h-8 flex-1 bg-white/5 rounded" />
                    </div>
                </div>

                {/* 2. Reactive Modal Overlay Backdrop */}
                <div 
                    className="absolute inset-0 z-10 transition-all duration-500"
                    style={{
                        backgroundColor: mergedTokens.modalOverlayColor,
                        backdropFilter: `blur(${mergedTokens.modalOverlayBlur}px)`,
                        WebkitBackdropFilter: `blur(${mergedTokens.modalOverlayBlur}px)`,
                    }}
                />

                {/* 3. High Fidelity Centered Modal Dialog Specimen */}
                <div 
                    className="w-[85%] bg-[#0f0f15]/90 border border-white/10 p-4 relative z-20 shadow-2xl flex flex-col gap-3 transition-all duration-500 group-hover:scale-105"
                    style={{
                        borderRadius: `${mergedTokens.modalBorderRadius}px`,
                    }}
                >
                    <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                        <div className="w-2 h-2 rounded-full bg-[var(--theme-primary)] animate-pulse" />
                        <span className="text-[7px] font-mono tracking-widest uppercase text-white/50">SYSTEM_OVERLAY</span>
                    </div>

                    <div className="space-y-1">
                        <h4 className="text-[9px] font-black uppercase text-white tracking-wide">Desfazer Operação?</h4>
                        <p className="text-[7px] text-white/40 leading-normal">Esta ação não pode ser revertida nos nós centrais do servidor.</p>
                    </div>

                    <div className="flex gap-1.5 justify-end pt-1">
                        <div className="px-2.5 py-1 rounded bg-white/5 text-[6px] font-bold uppercase text-white/60">Cancelar</div>
                        <div className="px-2.5 py-1 rounded bg-[var(--theme-primary)] text-[6px] font-black uppercase text-white">Confirmar</div>
                    </div>
                </div>

                {/* 4. Miniature Tooltip Specimen on top */}
                <div className="absolute top-2 right-2 z-30">
                    <div 
                        className="px-2 py-1 flex items-center gap-1.5 shadow-lg border border-white/10 text-white font-mono text-[6px] tracking-tight"
                        style={{
                            backgroundColor: mergedTokens.tooltipBg,
                            borderRadius: `${mergedTokens.tooltipRadius}px`
                        }}
                    >
                        <HelpCircle size={6} className="text-[var(--theme-primary)]" />
                        <span>Tip Active</span>
                    </div>
                </div>
            </div>
        </DesignScope>
    );
};

export const OverlaysGallery: React.FC<OverlaysGalleryProps> = ({ tokens, onUpdateDraft }) => {
    const handleSelect = (preset: OverlayPreset) => {
        Object.entries(preset.design).forEach(([key, val]) => {
            onUpdateDraft(key, val);
        });
        onUpdateDraft('overlayPresetId', preset.id);
    };

    return (
        <div className="flex flex-col h-full bg-[#050505]">
            <div className="flex items-center justify-between px-10 py-10 border-b border-white/5 bg-black/20 backdrop-blur-2xl sticky top-0 z-20">
                <div className="flex flex-col">
                    <h2 className="text-sm font-black uppercase tracking-[0.5em] text-white italic">Overlay & Profundidade</h2>
                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mt-1">Soberania de Camadas, Desfoques e Diálogos</p>
                </div>
                
                <div className="flex items-center gap-4 px-5 py-2 bg-white/5 rounded-2xl border border-white/10">
                    <Layers size={14} className="text-[var(--theme-primary)]" />
                    <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">{OVERLAY_PRESETS.length} Presets</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {OVERLAY_PRESETS.map((preset: OverlayPreset) => {
                        const isActive = tokens.overlayPresetId === preset.id;

                        return (
                            <div key={preset.id} className="space-y-4">
                                <motion.div 
                                    whileHover={{ y: -8 }}
                                    onClick={() => handleSelect(preset)}
                                    className={`relative h-[320px] rounded-[2.5rem] overflow-hidden cursor-pointer border transition-all duration-700 ${
                                        isActive ? 'border-[var(--theme-primary)] shadow-2xl shadow-primary-500/20' : 'border-white/5 hover:border-white/20'
                                    }`}
                                >
                                    <OverlaySpecimen 
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
                                            <Layers size={24} className="text-white" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Apply Blueprint</span>
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
