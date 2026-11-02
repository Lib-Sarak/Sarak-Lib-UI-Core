import React, { useState } from 'react';
import { CARD_PRESETS, CARD_TEXTURE_PRESETS } from '../../../../core/Design/presets/components/cards';
import { CATALOG_GRID_2COL } from '../panelResponsive.presets';
import { Sparkles, Grid } from 'lucide-react';
import { OptionTile } from './OptionTile';
import { SampleCard, SAMPLE_TEXTURE_STYLE } from './SampleParts';
import { SampleScope } from './SampleScope';
import type { PeekHandler } from './peek';

import { SarakDesignState } from '../../../../core/Provider/types';

interface CardsCatalogProps {
    onApplyPreset: (presetDesign: Partial<SarakDesignState>, isPartial?: boolean) => void;
    currentMode: 'light' | 'dark';
    draft?: Partial<SarakDesignState>;
    onPeek?: PeekHandler;
}

export const CardsCatalog: React.FC<CardsCatalogProps> = ({ onApplyPreset, currentMode, draft, onPeek }) => {
    const [activeTab, setActiveTab] = useState<'curated' | 'textures'>('curated');
    const presets = activeTab === 'curated' ? CARD_PRESETS : CARD_TEXTURE_PRESETS;

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2 p-1 bg-theme-body/20 rounded-xl border border-theme-border w-fit">
                <button
                    onClick={() => setActiveTab('curated')}
                    className={`px-4 py-2 rounded-lg text-[var(--sarak-type-scale2xs,11px)] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'curated' ? 'bg-theme-primary text-theme-text shadow-lg' : 'text-theme-muted hover:text-theme-text hover:bg-theme-text/5'}`}
                >
                    <Sparkles size={12} />
                    Curados
                </button>
                <button
                    onClick={() => setActiveTab('textures')}
                    className={`px-4 py-2 rounded-lg text-[var(--sarak-type-scale2xs,11px)] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'textures' ? 'bg-theme-primary text-theme-text shadow-lg' : 'text-theme-muted hover:text-theme-text hover:bg-theme-text/5'}`}
                >
                    <Grid size={12} />
                    Texturas
                </button>
            </div>

            {/* Container query (plan-35): reage ao espaço real do painel, herdado do
                `@container` de `PresetsCatalog.tsx` — nunca à largura da janela. */}
            <div className={`grid ${CATALOG_GRID_2COL} gap-6`}>
                {presets.map((preset) => (
                    <OptionTile
                        key={preset.id}
                        name={preset.name}
                        description={preset.description}
                        onApply={() => onApplyPreset(preset.design, true)}
                        peekTokens={() => preset.design}
                        onPeek={onPeek}
                    >
                        {/* Escopamos as variáveis do preset (mesmo mecanismo de produção): o CSS real de
                            `.sarak-card` lê `--sarak-card-*` de qualquer ancestral, então o cartão real acompanha o preset. */}
                        <SampleScope
                            draft={draft}
                            tokens={preset.design}
                            mode={currentMode}
                            className="flex items-center justify-center p-6"
                            style={activeTab === 'textures' ? SAMPLE_TEXTURE_STYLE : undefined}
                            scopeProps={activeTab === 'textures' ? { 'data-sx-card-texture-type': String(preset.design.cardTextureType) } : undefined}
                        >
                            <div className="w-full" style={{ maxWidth: 'var(--sarak-preset-mini-card-max-width,280px)' }}>
                                <SampleCard className={activeTab === 'textures' ? 'min-h-40' : undefined} texture={activeTab === 'textures' ? String(preset.design.cardTextureType) : undefined} />
                            </div>
                        </SampleScope>
                    </OptionTile>
                ))}
            </div>
        </div>
    );
};
