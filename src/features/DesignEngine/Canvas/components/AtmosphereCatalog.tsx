import React from 'react';
import { getPresetGroup } from '../../../../core/Design/presets/components/registry';
import { textureFamilyOf } from '../../../../core/Design/presets/components/textureFamilies';
import { usePresetText } from '../../hooks/usePresetText';
import { CuratedGrid } from './CuratedGrid';
import { ComponentPreset } from '../../../../core/Design/presets/components/cards';
import { SarakBackgroundRenderer } from '../../../../core/Design/components/SarakBackgroundRenderer';
import { OptionTile } from './OptionTile';
import { SAMPLE_TEXTURE_STYLE } from './SampleParts';
import { SampleScope } from './SampleScope';
import { CATALOG_GRID } from '../panelResponsive.presets';
import type { PeekHandler } from './peek';

import { SarakDesignState } from '../../../../core/Provider/types';

interface AtmosphereCatalogProps {
    onApplyPreset: (presetDesign: Partial<SarakDesignState>, isPartial?: boolean) => void;
    currentMode: string;
    draft?: Partial<SarakDesignState>;
    onPeek?: PeekHandler;
    /** Qual grupo o catálogo desenha: as atmosferas ou a textura do fundo. Cada um é um grupo da decisão Forma, com título próprio. */
    section?: 'media' | 'textures';
}

export const AtmosphereCatalog: React.FC<AtmosphereCatalogProps> = ({ onApplyPreset, currentMode, draft, onPeek, section = 'media' }) => {
    const text = usePresetText();

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-end gap-4">
                <div className="flex items-center gap-3 px-4 py-2 bg-theme-body/20 rounded-xl border border-theme-border">
                    <span className="text-[length:var(--sarak-type-scale2xs,11px)] font-black text-theme-text uppercase tracking-widest">Opacidade</span>
                    <input
                        key={section}
                        type="range"
                        min="0" max="1" step="0.01"
                        defaultValue={section === 'textures' ? 0.08 : 1}
                        onChange={(e) => onApplyPreset(
                            section === 'textures'
                                ? { textureOpacity: parseFloat(e.target.value) }
                                : { globalBackgroundOpacity: parseFloat(e.target.value) }
                            , true)}
                        className="w-32 accent-[var(--theme-primary)] cursor-pointer"
                    />
                </div>
            </div>

            <CuratedGrid
                group={getPresetGroup(section === 'media' ? 'atmosphere' : 'textures')!}
                gridClassName={CATALOG_GRID}
                sectionOf={section === 'textures' ? (preset) => {
                    const family = textureFamilyOf(String(preset.design.texture)) ?? 'technical';
                    return { id: family, title: text.family(family) };
                } : undefined}
                renderTile={(preset) => (
                    <AtmospherePresetPreview key={preset.id} preset={preset} currentMode={currentMode} draft={draft} onPeek={onPeek} fineGrain={section === 'textures'} onApply={() => onApplyPreset(preset.design, true)} />
                )}
            />
        </div>
    );
};

/** A textura do fundo é de traço fino (1 px a cada 16 ou 32): no quadro de referência reduzido pela metade, grade, pontos e planta somem. Esse quadro é o do tamanho da opção. */
const FINE_GRAIN_FRAME = { width: 150, height: 129 } as const;

const AtmospherePresetPreview = ({ preset, onApply, currentMode, draft, onPeek, fineGrain = false }: { preset: ComponentPreset, onApply: () => void, currentMode: string, draft?: Partial<SarakDesignState>, onPeek?: PeekHandler, fineGrain?: boolean }) => {
    const shown = usePresetText().preset(preset);
    const imageUrl = preset.design.globalBackgroundImageUrl;
    const isVideo = imageUrl && (imageUrl.includes('video') || imageUrl.endsWith('.webm') || imageUrl.endsWith('.mp4'));
    const isImage = imageUrl && !isVideo;
    const texture = preset.design.texture && preset.design.texture !== 'none' ? preset.design.texture : undefined;
    const hasGeneratedAtmosphere = !imageUrl && texture;
    const mode = (preset.design.mode || currentMode) === 'light' ? 'light' : 'dark';

    return (
        <OptionTile
            name={shown.name}
            description={shown.description}
            onApply={onApply}
            peekTokens={() => preset.design}
            onPeek={onPeek}
            frameWidth={fineGrain ? FINE_GRAIN_FRAME.width : undefined}
            frameHeight={fineGrain ? FINE_GRAIN_FRAME.height : undefined}
        >
            {/* A atmosfera ocupa o tile inteiro, sem cartão nem botão por cima do que se quer ver. A textura aparece com a opacidade da amostra (visível); o valor
                que o clique aplica continua sendo o do preset. */}
            <div className="relative h-full overflow-hidden">
                {imageUrl && (
                    <div className="absolute inset-0 z-0">
                        <SarakBackgroundRenderer
                            imageUrl={imageUrl}
                            opacity={preset.design.globalBackgroundOpacity}
                            blur={preset.design.globalBackgroundBlur}
                            mode={mode}
                            disableOverlay={true}
                            zIndex={0}
                        />
                    </div>
                )}
                <SampleScope
                    draft={draft}
                    tokens={preset.design}
                    mode={mode}
                    transparent={Boolean(imageUrl)}
                    slotClassName="absolute inset-0 z-10"
                    className={texture ? 'texture-active' : undefined}
                    style={hasGeneratedAtmosphere ? SAMPLE_TEXTURE_STYLE : undefined}
                    scopeProps={{ 'data-sx-texture': texture }}
                >
                    <div aria-hidden="true" className="h-full w-full" />
                </SampleScope>
            </div>
        </OptionTile>
    );
};
