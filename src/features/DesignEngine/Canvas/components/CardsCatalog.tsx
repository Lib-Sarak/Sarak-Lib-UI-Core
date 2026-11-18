import React from 'react';
import { getPresetGroup } from '../../../../core/Design/presets/components/registry';
import { textureFamilyOf } from '../../../../core/Design/presets/components/textureFamilies';
import { CATALOG_GRID_2COL } from '../panelResponsive.presets';
import { usePresetText } from '../../hooks/usePresetText';
import { CuratedGrid } from './CuratedGrid';
import { OptionTile } from './OptionTile';
import { SampleCard, SAMPLE_TEXTURE_STYLE } from './SampleParts';
import { SampleScope } from './SampleScope';
import type { PeekHandler } from './peek';

import { SarakDesignState } from '../../../../core/Provider/types';
import { neutralCardBase } from './neutralCardBase';

/** O card de um tema é o preset gerado `card-theme-*`; o resto dos curados é escrito à mão. */
const THEME_CARD_ID_PREFIX = 'card-theme-';

interface CardsCatalogProps {
    onApplyPreset: (presetDesign: Partial<SarakDesignState>, isPartial?: boolean) => void;
    currentMode: 'light' | 'dark';
    draft?: Partial<SarakDesignState>;
    onPeek?: PeekHandler;
    /** Qual grupo o catálogo desenha: os cards (curados e dos temas) ou a textura do card. Cada um é um grupo da decisão Forma, com título próprio. */
    section?: 'curated' | 'textures';
}

export const CardsCatalog: React.FC<CardsCatalogProps> = ({ onApplyPreset, currentMode, draft, onPeek, section = 'curated' }) => {
    const text = usePresetText();
    const group = getPresetGroup(section === 'curated' ? 'cards' : 'cardTextures')!;

    return (
        <div className="flex flex-col gap-6">
            {/* Container query (plan-35): reage ao espaço real do painel, herdado do
                `@container` de `PresetsCatalog.tsx` — nunca à largura da janela. */}
            <CuratedGrid
                group={group}
                gridClassName={CATALOG_GRID_2COL}
                sectionOf={section === 'textures' ? (preset) => {
                    const family = textureFamilyOf(String(preset.design.cardTextureType)) ?? 'technical';
                    return { id: family, title: text.family(family) };
                } : (preset) => {
                    const family = preset.id.startsWith(THEME_CARD_ID_PREFIX) ? 'cardsOfThemes' : 'cardsCurated';
                    return { id: family, title: text.family(family) };
                }}
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
                            // O card curado é desenhado sobre uma base neutra (sem o rascunho, no modo da prévia): o mesmo preset tem a mesma amostra em qualquer tema atual.
                            // A textura continua sobre o rascunho: ela é um valor que se soma à paleta que já está escolhida.
                            draft={section === 'textures' ? draft : neutralCardBase(currentMode)}
                            tokens={preset.design}
                            mode={currentMode}
                            className="flex items-center justify-center p-6"
                            style={section === 'textures' ? SAMPLE_TEXTURE_STYLE : undefined}
                            scopeProps={section === 'textures' ? { 'data-sx-card-texture-type': String(preset.design.cardTextureType) } : undefined}
                        >
                            <div className="w-full" style={{ maxWidth: 'var(--sarak-preset-mini-card-max-width,280px)' }}>
                                <SampleCard className={section === 'textures' ? 'min-h-40' : undefined} texture={section === 'textures' ? String(preset.design.cardTextureType) : undefined} />
                            </div>
                        </SampleScope>
                    </OptionTile>
                    );
                }}
            />
        </div>
    );
};
