import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CARD_PRESETS, CARD_TEXTURE_PRESETS, ComponentPreset } from '../../../../core/Design/presets/components/cards';
import { DesignScope } from '../../../../core/Design/components/DesignScope';
import { Sparkles, Grid } from 'lucide-react';

import { SarakDesignState } from '../../../../core/Provider/types';

interface CardsCatalogProps {
    onApplyPreset: (presetDesign: Partial<SarakDesignState>, isPartial?: boolean) => void;
    currentMode: string;
}

export const CardsCatalog: React.FC<CardsCatalogProps> = ({ onApplyPreset }) => {
    const [activeTab, setActiveTab] = useState<'curated' | 'textures'>('curated');
    const presets = activeTab === 'curated' ? CARD_PRESETS : CARD_TEXTURE_PRESETS;

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2 p-1 bg-black/20 rounded-xl border border-theme-border w-fit">
                <button
                    onClick={() => setActiveTab('curated')}
                    className={`px-4 py-2 rounded-lg text-[var(--sarak-type-scale2xs,10px)] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'curated' ? 'bg-theme-primary text-white shadow-lg' : 'text-theme-muted hover:text-white hover:bg-white/5'}`}
                >
                    <Sparkles size={12} />
                    Curados
                </button>
                <button
                    onClick={() => setActiveTab('textures')}
                    className={`px-4 py-2 rounded-lg text-[var(--sarak-type-scale2xs,10px)] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'textures' ? 'bg-theme-primary text-white shadow-lg' : 'text-theme-muted hover:text-white hover:bg-white/5'}`}
                >
                    <Grid size={12} />
                    Texturas
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {presets.map((preset, i) => (
                    <CardPresetPreview key={preset.id} preset={preset} index={i} onApply={() => onApplyPreset(preset.design, true)} />
                ))}
            </div>
        </div>
    );
};

const CardPresetPreview = ({ preset, index, onApply }: { preset: ComponentPreset, index: number, onApply: () => void }) => {
    return (
        <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={onApply}
            className="group flex flex-col text-left rounded-2xl border border-theme-border overflow-hidden bg-theme-card hover:border-theme-primary hover:shadow-[0_10px_40px_-10px_rgba(var(--theme-primary-rgb),0.1)] transition-all duration-300"
        >
            <div className="h-48 w-full relative flex items-center justify-center p-6 bg-[var(--color-theme-bg, #0a0a0c)] overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05)_0%,transparent_70%)]" />

                {/*
                    Escopamos as CSS custom properties do preset via DesignScope (mesmo mecanismo
                    de produção) em vez de montar um `style` inline com valores finais: o CSS real
                    de `.sarak-card` (incl. o "Nuclear Sovereignty Reset" de _atmosphere.css, que lê
                    var(--sarak-card-*) com !important a partir de QUALQUER ancestral com
                    data-sx-texture — sempre presente no app real via SarakShell) consome essas
                    variáveis diretamente. Sobrescrever a propriedade final perde a briga de
                    especificidade; escopar a variável que a regra já lê, não.
                */}
                <DesignScope
                    design={{ mode: 'dark', ...preset.design } as SarakDesignState}
                    className="sarak-card relative flex flex-col p-4 shadow-2xl transition-transform group-hover:scale-105 duration-500 z-10"
                    style={{ width: '100%', height: '8rem', maxWidth: 'var(--sarak-preset-mini-card-max-width,280px)' }}
                >
                    <div className="flex items-center gap-3 relative z-10">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                            <Sparkles size={16} className="text-white/50" />
                        </div>
                        <div className="flex flex-col gap-1.5 flex-1">
                            <div className="h-2 w-3/4 bg-white/40 rounded-full" />
                            <div className="h-1.5 w-1/2 bg-white/20 rounded-full" />
                        </div>
                    </div>

                    <div className="mt-auto relative z-10 flex flex-col gap-2">
                        <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full w-2/3 bg-white/40 rounded-full" />
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="h-1.5 w-1/4 bg-white/20 rounded-full" />
                            <div className="h-1.5 w-1/4 bg-white/20 rounded-full" />
                        </div>
                    </div>
                </DesignScope>
            </div>

            <div className="p-4 bg-theme-sidebar">
                <h3 className="text-sm font-bold text-theme-text uppercase tracking-wider">{preset.name}</h3>
                <p className="text-xs text-theme-muted mt-1">{preset.description}</p>
            </div>
        </motion.button>
    );
};
