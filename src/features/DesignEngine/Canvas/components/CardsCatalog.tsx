import React from 'react';
import { getPresetGroup } from '../../../../core/Design/presets/components/registry';
import { textureFamilyOf } from '../../../../core/Design/presets/components/textureFamilies';
import { CATALOG_GRID_2COL } from '../panelResponsive.presets';
import { usePresetText } from '../../hooks/usePresetText';
import { CuratedGrid } from './CuratedGrid';
import { OptionTile } from './OptionTile';
import { SampleTitleCard } from './SampleParts';
import { CARD_FRAME_WIDTH } from './OptionSampleFrame';
import { SampleScope } from './SampleScope';
import type { PeekHandler } from './peek';

import { SarakDesignState } from '../../../../core/Provider/types';

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
                        frameWidth={CARD_FRAME_WIDTH}
                        buttonProps={{ 'data-preset-id': preset.id }}
                    >
                        <SampleScope
                            // O card é desenhado sobre o rascunho (o tema atual): é o que a aplicação vai mostrar.
                            draft={draft}
                            tokens={preset.design}
                            mode={currentMode}
                            className="flex items-center justify-center p-6"
                            scopeProps={section === 'textures' ? { 'data-sx-card-texture-type': String(preset.design.cardTextureType) } : undefined}
                        >
                            <SampleTitleCard texture={section === 'textures' ? String(preset.design.cardTextureType) : undefined} />
                        </SampleScope>
                    </OptionTile>
                    );
                }}
            />
        </div>
    );
};
