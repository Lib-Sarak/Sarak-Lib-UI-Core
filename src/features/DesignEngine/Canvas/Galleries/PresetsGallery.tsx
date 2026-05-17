import React from 'react';
import { 
  Box, Layers, Activity, 
  Fingerprint, Zap
} from 'lucide-react';
import { GalleryItem } from './GalleryItem';
import { DesignScope } from '../../../../core/Design/components/DesignScope';
import { CARD_PRESETS, CardPreset } from '../../../../core/Design/presets/surfaces/cards';

/**
 * CardSpecimen (v3.0 - Unified Pipeline)
 * 
 * Renderiza o espécime usando APENAS DesignScope para injeção CSS.
 * Sem duplicação de variáveis inline. Os tokens do preset são a única
 * fonte de verdade para a anatomia exibida.
 */
const CardSpecimen: React.FC<{ preset: CardPreset & { isActive?: boolean }, globalTokens: any }> = ({ preset, globalTokens }) => {
    const mergedTokens = React.useMemo(() => {
        // Base: estado real do sistema + sobrescritas atômicas do preset
        const final = { ...globalTokens, ...preset.design };
        
        // Reatividade para tema/modo — a anatomia é soberana
        const reactiveTokens = ['themePrimary', 'mode'];
        reactiveTokens.forEach(token => {
            if (globalTokens[token] !== undefined) final[token] = globalTokens[token];
        });
        
        return final;
    }, [preset, globalTokens]);

    const radius = preset.design.cardBorderRadius ?? 12;
    const cut = preset.design.cardGeometricCut ?? 0;
    const texture = preset.design.cardTextureType ?? 'none';
    const blur = preset.design.cardBackdropBlur ?? 0;
    const opacity = preset.design.cardSurfaceOpacity ?? 0.8;

    return (
        <DesignScope design={mergedTokens} className="w-full h-full">
            <div className="w-full h-full relative flex items-center justify-center p-12 overflow-hidden group bg-[#020202]">
                {/* AMBIENTE DE LABORATÓRIO (High Contrast for Blur Validation) */}
                <div className="absolute inset-0 z-0">
                    {/* Luzes Dinâmicas de Fundo */}
                    <div className="absolute top-[20%] left-[20%] w-[150px] h-[150px] bg-cyan-500/20 blur-[80px] animate-pulse" />
                    <div className="absolute bottom-[20%] right-[20%] w-[200px] h-[200px] bg-purple-500/10 blur-[100px]" />
                    
                    {/* Grid Técnico de Calibração */}
                    <div className="absolute inset-0 opacity-20" 
                         style={{ 
                             backgroundImage: `
                                linear-gradient(to right, #333 1px, transparent 1px),
                                linear-gradient(to bottom, #333 1px, transparent 1px)
                             `, 
                             backgroundSize: '40px 40px' 
                         }} 
                    />
                    
                    {/* Elementos Orgânicos (Para testar distorção do Blur) */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[1px] bg-gradient-to-right from-transparent via-white/10 to-transparent rotate-45" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[1px] bg-gradient-to-right from-transparent via-white/10 to-transparent -rotate-45" />
                </div>

                {/* O CARD ESPECIME (Renderizado exclusivamente via DesignScope) */}
                <div 
                    className="w-full max-w-[340px] aspect-[16/10] sarak-card relative z-10 flex flex-col gap-4 transition-all duration-500 group-hover:scale-[1.02] cursor-pointer"
                >
                    {/* Camada de Brilho Interno */}
                    <div className="absolute inset-0 pointer-events-none rounded-[inherit] bg-gradient-to-br from-white/5 to-transparent opacity-50" />

                    {/* Cabeçalho do Especime */}
                    <div className="flex justify-between items-center opacity-40 relative z-10">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[var(--theme-primary)] shadow-[0_0_10px_var(--theme-primary)]" />
                            <span className="text-[8px] font-black tracking-[0.2em] uppercase text-white">Sarak_Specimen_V3</span>
                        </div>
                        <div className="text-[8px] font-mono text-white/50">{preset.id.substring(0,8).toUpperCase()}</div>
                    </div>

                    {/* Conteúdo de Amostra */}
                    <div className="flex-1 flex flex-col gap-4 relative z-10">
                        <div className="flex items-center justify-between">
                            <div className="h-2 w-24 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-[var(--theme-primary)] w-[70%]" />
                            </div>
                            <Activity size={14} className="text-[var(--theme-primary)] opacity-40" />
                        </div>
                        
                        <div className="flex-1 flex items-center justify-center">
                             <div className="relative w-24 h-24 flex items-center justify-center">
                                <div className="absolute inset-0 border-2 border-dashed border-white/5 rounded-full animate-[spin_10s_linear_infinite]" />
                                <span className="text-3xl font-black text-white/80 font-mono tracking-tighter">{(opacity * 100).toFixed(0)}%</span>
                             </div>
                        </div>

                        <div className="flex items-center justify-between mt-auto">
                            <div className="flex gap-1">
                                <div className="w-8 h-1 bg-white/20 rounded-full" />
                                <div className="w-4 h-1 bg-white/10 rounded-full" />
                            </div>
                            <div className="px-2 py-0.5 bg-[var(--theme-primary)]/10 border border-[var(--theme-primary)]/20 rounded text-[7px] font-bold text-[var(--theme-primary)] uppercase">Active_Link</div>
                        </div>
                    </div>

                    {/* Info Técnica (Footer Interno) */}
                    <div className="pt-3 border-t border-white/5 flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-1.5">
                            <Fingerprint size={10} className="text-white/20" />
                            <span className="text-[9px] font-mono text-white/30 uppercase tracking-tighter">Surface Protocol Alpha</span>
                        </div>
                        <div className="flex gap-1.5">
                            <div className="w-2 h-2 rounded-sm border border-white/10" />
                            <div className="w-2 h-2 rounded-sm border border-white/10 bg-white/5" />
                        </div>
                    </div>
                </div>

                {/* METADADOS TÉCNICOS EXTERNOS (Blueprint Style) */}
                <div className="absolute top-6 left-8 flex flex-col gap-1">
                    <div className="text-[10px] font-black text-white/60 flex items-center gap-3 tracking-[0.3em]">
                        <div className="w-1.5 h-4 bg-[var(--theme-primary)] shadow-[0_0_8px_var(--theme-primary)]" />
                        {preset.name.toUpperCase()}
                    </div>
                </div>

                {/* Badge de Seleção (Se Ativo) */}
                {preset.isActive && (
                    <div className="absolute top-6 right-8 px-3 py-1 bg-[var(--theme-primary)] text-black text-[9px] font-black uppercase tracking-widest rounded-full">
                        Current Surface
                    </div>
                )}

                {/* Régua de Especificações Bottom */}
                <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end border-t border-white/5 pt-4">
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col gap-0.5">
                            <span className="text-[7px] text-white/30 uppercase font-black tracking-widest">Radius_Spec</span>
                            <span className="text-[11px] font-mono text-white/70">{radius}px</span>
                        </div>
                        <div className="w-[1px] h-6 bg-white/5" />
                        <div className="flex flex-col gap-0.5">
                            <span className="text-[7px] text-white/30 uppercase font-black tracking-widest">Geometry_Cut</span>
                            <span className="text-[11px] font-mono text-white/70">{cut}px</span>
                        </div>
                        <div className="w-[1px] h-6 bg-white/5" />
                        <div className="flex flex-col gap-0.5">
                            <span className="text-[7px] text-white/30 uppercase font-black tracking-widest">Texture_Pattern</span>
                            <span className="text-[11px] font-mono text-[var(--theme-primary)] font-bold">{texture.toUpperCase()}</span>
                        </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-1">
                        <div className="px-2 py-1 bg-white/5 rounded border border-white/10 flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-cyan-400 animate-ping" />
                            <span className="text-[9px] font-mono text-white/40">{blur}PX_OPTIC_BLUR</span>
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
        // Injeção Atômica: aplica TODOS os tokens do preset sem filtro
        Object.entries(preset.design).forEach(([key, val]) => {
             onUpdateDraft(key, val);
        });
        // Persiste o identificador do preset ativo na chave correta
        onUpdateDraft('cardPresetId', preset.id);
    };

    return (
        <div className="flex flex-col gap-16 p-10 overflow-y-auto custom-scrollbar h-full bg-[#050505]">
            {/* Header do Catálogo */}
            <div className="flex flex-col gap-3 border-l-2 border-[var(--theme-primary)] pl-8 py-3">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-[var(--theme-primary)]/10 rounded-lg">
                        <Layers size={22} className="text-[var(--theme-primary)]" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black uppercase tracking-[0.3em] text-white leading-tight">Anatomy & Surface Catalog</h2>
                        <p className="text-[10px] text-white/40 uppercase tracking-[0.5em] mt-1 font-bold">Industrial Surface Calibration // V3.0</p>
                    </div>
                </div>
            </div>

            {/* Grid de Presets */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {CARD_PRESETS.map((preset) => (
                    <GalleryItem 
                        key={preset.id}
                        title={preset.name}
                        description={preset.description}
                        isActive={tokens.cardPresetId === preset.id}
                        onClick={() => handleSelect(preset)}
                    >
                        <div className="w-full aspect-[16/11] rounded-2xl overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] border border-white/5 bg-[#0a0a0a] relative group/item">
                            <CardSpecimen 
                                preset={{...preset, isActive: tokens.cardPresetId === preset.id}} 
                                globalTokens={tokens}
                            />
                            
                            {/* Overlay de Hover Decorativo */}
                            <div className="absolute inset-0 bg-[var(--theme-primary)]/5 opacity-0 group-hover/item:opacity-100 transition-opacity pointer-events-none" />
                        </div>
                    </GalleryItem>
                ))}
            </div>

            {/* FOOTER DE CALIBRAÇÃO */}
            <div className="mt-auto pt-10 border-t border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-3 opacity-20">
                    <Box size={14} className="text-white" />
                    <span className="text-[8px] font-black uppercase tracking-[0.4em] text-white">Sarak_Materials_Lab</span>
                </div>
                <div className="text-[8px] font-mono text-white/10">SYNC_STATUS: OPERATIONAL_HIGH_FIDELITY</div>
            </div>
        </div>
    );
};
