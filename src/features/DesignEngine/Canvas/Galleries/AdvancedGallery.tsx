import React from 'react';
import { GalleryItem } from './GalleryItem';
import { ADVANCED_PRESETS } from '../../../../core/Design/presets/advanced';
import { Layers, Box, Sparkles, Zap, Shield } from 'lucide-react';
import { DesignScope } from '../../../../core/Design/components/DesignScope';

interface AdvancedGalleryProps {
    tokens: any;
    onUpdateDraft: (key: string, value: any) => void;
}

export const AdvancedGallery: React.FC<AdvancedGalleryProps> = ({ tokens, onUpdateDraft }) => {
    
    const handleApplyPreset = (presetTokens: any) => {
        Object.entries(presetTokens).forEach(([key, value]) => {
            onUpdateDraft(key, value);
        });
    };

    return (
        <div className="p-8 flex flex-col gap-10">
            {/* Header Informativo */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-[var(--theme-primary)]/10 rounded-lg">
                        <Layers size={20} className="text-[var(--theme-primary)]" />
                    </div>
                    <h2 className="text-xl font-black text-white uppercase tracking-[0.2em]">Matrix Variety Catalog</h2>
                </div>
                <p className="text-xs text-white/40 uppercase tracking-widest leading-relaxed max-w-xl">
                    Selecione uma miniatura abaixo para aplicar o preset visual ao Gêmeo Digital. 
                    Toda a configuração é injetada em tempo real via Variáveis CSS.
                </p>
            </div>

            {/* Grid de Miniaturas (Variety Preview) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {ADVANCED_PRESETS.map((preset) => (
                    <GalleryItem
                        key={preset.id}
                        title={preset.label}
                        description={`Layout Agnostico: ${preset.id.split('-')[0]}`}
                        onClick={() => handleApplyPreset(preset.tokens)}
                        isActive={false} // Simplificado para esta visualização
                    >
                        {/* Miniatura Visual do Preset */}
                        <DesignScope design={{ ...tokens, ...preset.tokens }} className="w-full h-32 rounded-xl border border-white/5 bg-black/40 overflow-hidden relative group">
                            <div className="absolute inset-0 p-4 flex flex-col gap-2">
                                {/* Skeleton da Matriz para visualização rápida */}
                                <div className="h-6 w-full rounded bg-[var(--sarak-matrix-search-bg)] border border-[var(--sarak-matrix-border-color)] opacity-50" />
                                <div className="flex-1 flex gap-2">
                                    <div className="flex-1 rounded-[var(--sarak-matrix-radius)] bg-[var(--sarak-matrix-item-bg)] border border-[var(--sarak-matrix-border-color)] flex items-center justify-center">
                                         <Box size={16} className="text-white/10" />
                                    </div>
                                    <div className="flex-1 rounded-[var(--sarak-matrix-radius)] bg-[var(--sarak-matrix-item-bg)] border border-[var(--sarak-matrix-border-color)] flex items-center justify-center">
                                         <Box size={16} className="text-white/10" />
                                    </div>
                                </div>
                            </div>
                            
                            {/* Overlay de Hover */}
                            <div className="absolute inset-0 bg-[var(--theme-primary)]/0 group-hover:bg-[var(--theme-primary)]/5 transition-all flex items-center justify-center">
                                <Sparkles size={24} className="text-[var(--theme-primary)] opacity-0 group-hover:opacity-100 transition-all scale-50 group-hover:scale-100" />
                            </div>
                        </DesignScope>
                    </GalleryItem>
                ))}
            </div>

            {/* Footer de Suporte */}
            <div className="p-6 rounded-2xl border border-dashed border-white/5 bg-white/[0.01] flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/20">
                    <Zap size={18} />
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Sovereignty Tip</span>
                    <span className="text-[9px] text-white/30 uppercase">As alterações feitas aqui são refletidas imediatamente na aba "Matrix" do Gêmeo Digital.</span>
                </div>
            </div>
        </div>
    );
};
