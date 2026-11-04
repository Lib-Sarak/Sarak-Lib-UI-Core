import React, { useState } from 'react';
import { getPresetGroup } from '../../../../core/Design/presets/components/registry';
import { textureFamilyOf } from '../../../../core/Design/presets/components/textureFamilies';
import { CATALOG_GRID_2COL } from '../panelResponsive.presets';
import { usePresetText } from '../../hooks/usePresetText';
import { CuratedGrid } from './CuratedGrid';
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
    /** A aba que abre primeiro; quem só confere as texturas não precisa desenhar os cards curados antes. */
    initialTab?: 'curated' | 'textures';
}

export const CardsCatalog: React.FC<CardsCatalogProps> = ({ onApplyPreset, currentMode, draft, onPeek, initialTab = 'curated' }) => {
    const [activeTab, setActiveTab] = useState<'curated' | 'textures'>(initialTab);
    const text = usePresetText();
    const group = getPresetGroup(activeTab === 'curated' ? 'cards' : 'cardTextures')!;

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2 p-1 bg-theme-body/20 rounded-xl border border-theme-border w-fit">
                <button
                    onClick={() => setActiveTab('curated')}
                    className={`px-4 py-2 rounded-lg text-[length:var(--sarak-type-scale2xs,11px)] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'curated' ? 'bg-theme-primary text-theme-on-primary shadow-lg' : 'text-theme-muted hover:text-theme-text hover:bg-theme-text/5'}`}
                >
                    <Sparkles size={12} />
                    Curados
                </button>
                <button
                    onClick={() => setActiveTab('textures')}
                    className={`px-4 py-2 rounded-lg text-[length:var(--sarak-type-scale2xs,11px)] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'textures' ? 'bg-theme-primary text-theme-on-primary shadow-lg' : 'text-theme-muted hover:text-theme-text hover:bg-theme-text/5'}`}
                >
                    <Grid size={12} />
                    Texturas
                </button>
            </div>

            {/* Container query (plan-35): reage ao espaço real do painel, herdado do
                `@container` de `PresetsCatalog.tsx` — nunca à largura da janela. */}
            <CuratedGrid
                group={group}
                gridClassName={CATALOG_GRID_2COL}
                sectionOf={activeTab === 'textures' ? (preset) => {
                    const family = textureFamilyOf(String(preset.design.cardTextureType)) ?? 'technical';
                    return { id: family, title: text.family(family) };
                } : undefined}
                renderTile={(preset) => {
                    const shown = text.preset(preset);
                    return (
                    <OptionTile
                        key={preset.id}
                        name={shown.name}
                        description={shown.description}
                        onApply={() => onApplyPreset(preset.design, true)}
                        peekTokens={() => preset.design}
                        onPeek={onPeek}
                    >
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
                    );
                }}
            />
        </div>
    );
};
