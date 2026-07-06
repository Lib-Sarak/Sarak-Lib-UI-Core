import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CARD_PRESETS, CARD_TEXTURE_PRESETS, ComponentPreset } from '../../../../core/Design/presets/components/cards';
import { useDesignVariables } from '../../../../core/Design/hooks/useDesignVariables';
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
    // We use a blank dark mode to preview the card shapes neutrally
    const { variables, attributes } = useDesignVariables({ mode: 'dark', ...preset.design });

    const cardStyle = {
        backgroundColor: variables['--sarak-card-background-color'] || 'rgba(255,255,255,0.05)',
        borderTopWidth: variables['--sarak-card-border-top'] || variables['--sarak-card-border-width'] || 'var(--border-color,#334155)',
        borderRightWidth: variables['--sarak-card-border-right'] || variables['--sarak-card-border-width'] || 'var(--border-color,#334155)',
        borderBottomWidth: variables['--sarak-card-border-bottom'] || variables['--sarak-card-border-width'] || 'var(--border-color,#334155)',
        borderLeftWidth: variables['--sarak-card-border-left'] || variables['--sarak-card-border-width'] || 'var(--border-color,#334155)',
        borderColor: variables['--sarak-card-border-color'] || 'rgba(255,255,255,0.1)',
        borderStyle: variables['--sarak-border-style'] || 'solid',
        borderTopLeftRadius: variables['--sarak-card-radius-t-l'] || variables['--sarak-card-border-radius'] || 'var(--sarak-layout-gap-md,16px)',
        borderTopRightRadius: variables['--sarak-card-radius-t-r'] || variables['--sarak-card-border-radius'] || 'var(--sarak-layout-gap-md,16px)',
        borderBottomRightRadius: variables['--sarak-card-radius-b-r'] || variables['--sarak-card-border-radius'] || 'var(--sarak-layout-gap-md,16px)',
        borderBottomLeftRadius: variables['--sarak-card-radius-b-l'] || variables['--sarak-card-border-radius'] || 'var(--sarak-layout-gap-md,16px)',
        backdropFilter: `blur(${variables['--sarak-card-backdrop-blur'] || 'var(--sarak-layout-gap-md,16px)'})`,
        boxShadow: preset.design.cardShadow && preset.design.cardShadow !== 'none'
            ? preset.design.cardShadow
            : preset.design.cardShadowSpread
                ? `0 var(--sarak-preset-card-shadow-offset-y, 4px) ${preset.design.cardShadowSpread}px calc(var(--sarak-preset-card-shadow-spread, 2px) * -1) ${preset.design.cardGlowColor || 'rgba(0,0,0,0.5)'}`
                : '0 var(--sarak-preset-card-shadow-offset-y, 4px) var(--sarak-preset-card-shadow-blur, 10px) calc(var(--sarak-preset-card-shadow-spread, 2px) * -1) rgba(0,0,0,0.5)',
        clipPath: variables['--sarak-card-clip-path']
    };

    return (
        <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={onApply}
            className="group flex flex-col text-left rounded-2xl border border-theme-border overflow-hidden bg-theme-card hover:border-theme-primary hover:shadow-[0_10px_40px_-10px_rgba(var(--theme-primary-rgb),0.1)] transition-all duration-300"
        >
            <div className="h-48 w-full relative flex items-center justify-center p-6 bg-[var(--color-theme-bg, #0a0a0c)] overflow-hidden" {...(attributes as React.HTMLAttributes<HTMLDivElement>)}>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05)_0%,transparent_70%)]" />

                {/* O Card Gigante de Preview — data-sx-card-texture-type delega a renderização real da textura para o mesmo CSS de produção (src/styles/_atmosphere.css), em vez de reimplementar em JS */}
                <div
                    className="sarak-card relative w-full max-w-[var(--sarak-preset-mini-card-max-width,280px)] h-32 flex flex-col p-4 shadow-2xl transition-transform group-hover:scale-105 duration-500 z-10"
                    data-sx-card-texture-type={String(preset.design.cardTextureType ?? 'none')}
                    style={cardStyle as React.CSSProperties}
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
                </div>
            </div>

            <div className="p-4 bg-theme-sidebar">
                <h3 className="text-sm font-bold text-theme-text uppercase tracking-wider">{preset.name}</h3>
                <p className="text-xs text-theme-muted mt-1">{preset.description}</p>
            </div>
        </motion.button>
    );
};
