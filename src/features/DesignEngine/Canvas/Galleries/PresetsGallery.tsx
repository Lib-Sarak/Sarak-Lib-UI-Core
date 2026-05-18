import React from 'react';
import { Layers, Activity, Box } from 'lucide-react';
import { GalleryItem } from './GalleryItem';
import { DesignScope } from '../../../../core/Design/components/DesignScope';
import { CARD_PRESETS, CardPreset } from '../../../../core/Design/presets/surfaces/cards';

/**
 * CardSpecimen (v3.5 - High-Fidelity Miniature)
 * 
 * Renderiza uma miniatura ultra-focada do card sob as configurações do preset.
 * Sem poluentes externos (réguas, dados textuais vazados ou metadados fora do card).
 * Possui luzes traseiras de calibração refratadas para exibir claramente opacidade e blur.
 */
const CardSpecimen: React.FC<{ preset: CardPreset & { isActive?: boolean }, globalTokens: any }> = ({ preset, globalTokens }) => {
    const mergedTokens = React.useMemo(() => {
        const final = { ...globalTokens, ...preset.design };
        // Garante reatividade do tema ativo e do modo
        const reactiveTokens = ['themePrimary', 'mode'];
        reactiveTokens.forEach(token => {
            if (globalTokens[token] !== undefined) final[token] = globalTokens[token];
        });
        return final;
    }, [preset, globalTokens]);

    return (
        <DesignScope design={mergedTokens} className="w-full h-full">
            <div className="w-full h-full relative flex items-center justify-center p-6 overflow-hidden bg-[#040406]">
                {/* AMBIENTE VIRTUAL PARA REFRACÇÃO (Vidro / Blur / Opacidade) */}
                <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
                    {/* Gradeado de calibração microscópico */}
                    <div className="absolute inset-0 opacity-[0.03]" 
                         style={{ 
                             backgroundImage: `
                                linear-gradient(to right, #ffffff 1px, transparent 1px),
                                linear-gradient(to bottom, #ffffff 1px, transparent 1px)
                             `, 
                             backgroundSize: '16px 16px' 
                         }} 
                    />
                    {/* Esferas de Plasma de Alta Visibilidade (Essenciais para ver BackdropBlur) */}
                    <div className="absolute -top-1 -left-2 w-[70px] h-[70px] bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-full opacity-35 blur-[20px] animate-pulse" />
                    <div className="absolute -bottom-2 -right-2 w-[60px] h-[60px] bg-gradient-to-tr from-purple-500 to-pink-500 rounded-full opacity-25 blur-[18px]" />
                </div>

                {/* MINIATURA ANATÔMICA (Respeita 100% o DesignScope do Preset) */}
                <div 
                    className="w-[90%] aspect-[1.5] sarak-card relative z-10 flex flex-col justify-between p-3.5 transition-all duration-300 cursor-pointer overflow-hidden"
                >
                    {/* Reflexo de Borda Superior (Estética Premium) */}
                    <div className="absolute inset-0 pointer-events-none rounded-[inherit] bg-gradient-to-b from-white/[0.04] to-transparent" />

                    {/* MINI-HEADER */}
                    <div className="flex justify-between items-center opacity-40 border-b border-[var(--sarak-card-header-border)] pb-1.5 mb-1 relative z-10" style={{ backgroundColor: 'var(--sarak-card-header-bg)', margin: '-14px -14px 6px -14px', padding: '10px 14px 6px 14px' }}>
                        <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--theme-primary)] animate-pulse" />
                            <span className="text-[7px] font-black tracking-[0.15em] uppercase text-white font-mono">SPEC_MINI</span>
                        </div>
                        <span className="text-[6px] font-mono text-white/50">{preset.id.substring(0, 5).toUpperCase()}</span>
                    </div>

                    {/* MINI-CONTEÚDO (Micro-Layout de Dashboard) */}
                    <div className="flex-1 flex flex-col gap-2 relative z-10 justify-center">
                        <div className="flex items-center justify-between">
                            <div className="h-1 w-14 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-[var(--theme-primary)] w-[65%]" />
                            </div>
                            <Activity size={10} className="text-[var(--theme-primary)] opacity-40" />
                        </div>
                        
                        {/* Micro-Gráfico de Barras Estilizado */}
                        <div className="flex items-end gap-1.5 h-8 pt-1">
                            <div className="w-2 h-[35%] bg-white/10 rounded-sm" />
                            <div className="w-2 h-[60%] bg-[var(--theme-primary)]/40 rounded-sm" />
                            <div className="w-2 h-[85%] bg-[var(--theme-primary)] rounded-sm" />
                            <div className="w-2 h-[45%] bg-white/15 rounded-sm" />
                        </div>
                    </div>

                    {/* MINI-FOOTER */}
                    <div className="pt-1.5 border-t border-[var(--sarak-card-footer-border)] flex items-center justify-between relative z-10" style={{ backgroundColor: 'var(--sarak-card-footer-bg)', margin: '6px -14px -14px -14px', padding: '6px 14px 10px 14px' }}>
                        <span className="text-[6px] font-mono text-white/30 uppercase tracking-tighter">System Node Alpha</span>
                        <div className="flex gap-1">
                            <div className="w-1.5 h-1.5 rounded-sm bg-white/10" />
                            <div className="w-1.5 h-1.5 rounded-sm bg-[var(--theme-primary)]/20" />
                        </div>
                    </div>
                </div>
            </div>
        </DesignScope>
    );
};

export const PresetsGallery: React.FC<{
    tokens: any;
    onUpdateDraft: (key: string, value: any) => void;
    activePreviewApp?: string;
    customThemes?: any[];
}> = ({ tokens, onUpdateDraft }) => {
    
    const handleSelect = (preset: CardPreset) => {
        // Injeção Atômica total do payload de design do preset
        Object.entries(preset.design).forEach(([key, val]) => {
             onUpdateDraft(key, val);
        });
        onUpdateDraft('cardPresetId', preset.id);
    };

    return (
        <div className="flex flex-col gap-10 p-8 overflow-y-auto custom-scrollbar h-full bg-[#030304]">
            {/* Header de Engenharia Estético */}
            <div className="flex flex-col gap-2 border-l-2 border-[var(--theme-primary)] pl-6 py-2">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-[var(--theme-primary)]/10 rounded-lg">
                        <Layers size={18} className="text-[var(--theme-primary)]" />
                    </div>
                    <div>
                        <h2 className="text-lg font-black uppercase tracking-[0.2em] text-white leading-none">Catálogo de Presets</h2>
                        <p className="text-[8px] text-white/40 uppercase tracking-[0.4em] mt-1 font-bold">Miniaturas Anatômicas Atômicas</p>
                    </div>
                </div>
            </div>

            {/* Grid de Presets em Alta Densidade (Miniaturas Compactas) */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {CARD_PRESETS.map((preset) => (
                    <GalleryItem 
                        key={preset.id}
                        title={preset.name}
                        description={preset.description}
                        isActive={tokens.cardPresetId === preset.id}
                        onClick={() => handleSelect(preset)}
                    >
                        <div className="w-full aspect-[1.4] rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.6)] border border-white/5 bg-[#08080a] relative group/item">
                            <CardSpecimen 
                                preset={{...preset, isActive: tokens.cardPresetId === preset.id}} 
                                globalTokens={tokens}
                            />
                            {/* Overlay Sutil Interativo */}
                            <div className="absolute inset-0 bg-[var(--theme-primary)]/[0.02] opacity-0 group-hover/item:opacity-100 transition-opacity pointer-events-none" />
                        </div>
                    </GalleryItem>
                ))}
            </div>

            {/* Rodapé de Status */}
            <div className="mt-auto pt-6 border-t border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-2 opacity-20">
                    <Box size={12} className="text-white" />
                    <span className="text-[7px] font-black uppercase tracking-[0.3em] text-white">Sarak Core Systems</span>
                </div>
                <div className="text-[7px] font-mono text-white/20">PRESET_PREVIEW: READY // GRID: HIGH_DENSITY</div>
            </div>
        </div>
    );
};
