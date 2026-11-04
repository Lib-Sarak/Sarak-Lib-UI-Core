import React, { useState } from 'react';
import { getPresetGroup } from '../../../../core/Design/presets/components/registry';
import { textureFamilyOf } from '../../../../core/Design/presets/components/textureFamilies';
import { usePresetText } from '../../hooks/usePresetText';
import { CuratedGrid } from './CuratedGrid';
import { ComponentPreset } from '../../../../core/Design/presets/components/cards';
import { Video, Grid } from 'lucide-react';
import { SarakBackgroundRenderer } from '../../../../core/Design/components/SarakBackgroundRenderer';
import { OptionTile } from './OptionTile';
import { SampleButton, SAMPLE_TEXTURE_STYLE } from './SampleParts';
import { SampleScope } from './SampleScope';
import { CATALOG_GRID_2COL } from '../panelResponsive.presets';
import type { PeekHandler } from './peek';

import { SarakDesignState } from '../../../../core/Provider/types';

interface AtmosphereCatalogProps {
    onApplyPreset: (presetDesign: Partial<SarakDesignState>, isPartial?: boolean) => void;
    currentMode: string;
    draft?: Partial<SarakDesignState>;
    onPeek?: PeekHandler;
    /** A aba que abre primeiro; quem só confere as texturas não precisa desenhar as atmosferas antes. */
    initialTab?: 'media' | 'textures';
}

export const AtmosphereCatalog: React.FC<AtmosphereCatalogProps> = ({ onApplyPreset, currentMode, draft, onPeek, initialTab = 'media' }) => {
    const [activeTab, setActiveTab] = useState<'media' | 'textures'>(initialTab);
    const text = usePresetText();

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 p-1 bg-theme-body/20 rounded-xl border border-theme-border">
                    <button
                        onClick={() => setActiveTab('media')}
                        className={`px-4 py-2 rounded-lg text-[length:var(--sarak-type-scale2xs,11px)] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'media' ? 'bg-theme-primary text-theme-on-primary shadow-lg' : 'text-theme-muted hover:text-theme-text hover:bg-theme-text/5'}`}
                    >
                        <Video size={12} />
                        Atmosferas
                    </button>
                    <button
                        onClick={() => setActiveTab('textures')}
                        className={`px-4 py-2 rounded-lg text-[length:var(--sarak-type-scale2xs,11px)] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'textures' ? 'bg-theme-primary text-theme-on-primary shadow-lg' : 'text-theme-muted hover:text-theme-text hover:bg-theme-text/5'}`}
                    >
                        <Grid size={12} />
                        Texturas
                    </button>
                </div>

                <div className="flex items-center gap-3 px-4 py-2 bg-theme-body/20 rounded-xl border border-theme-border">
                    <span className="text-[length:var(--sarak-type-scale2xs,11px)] font-black text-theme-text uppercase tracking-widest">Opacidade</span>
                    <input
                        key={activeTab}
                        type="range"
                        min="0" max="1" step="0.01"
                        defaultValue={activeTab === 'textures' ? 0.08 : 1}
                        onChange={(e) => onApplyPreset(
                            activeTab === 'textures'
                                ? { textureOpacity: parseFloat(e.target.value) }
                                : { globalBackgroundOpacity: parseFloat(e.target.value) }
                            , true)}
                        className="w-32 accent-[var(--theme-primary)] cursor-pointer"
                    />
                </div>
            </div>

            <CuratedGrid
                group={getPresetGroup(activeTab === 'media' ? 'atmosphere' : 'textures')!}
                gridClassName={CATALOG_GRID_2COL}
                sectionOf={activeTab === 'textures' ? (preset) => {
                    const family = textureFamilyOf(String(preset.design.texture)) ?? 'technical';
                    return { id: family, title: text.family(family) };
                } : undefined}
                renderTile={(preset) => (
                    <AtmospherePresetPreview key={preset.id} preset={preset} currentMode={currentMode} draft={draft} onPeek={onPeek} onApply={() => onApplyPreset(preset.design, true)} />
                )}
            />
        </div>
    );
};

const AtmospherePresetPreview = ({ preset, onApply, currentMode, draft, onPeek }: { preset: ComponentPreset, onApply: () => void, currentMode: string, draft?: Partial<SarakDesignState>, onPeek?: PeekHandler }) => {
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
        >
            {/* A atmosfera ocupa o tile inteiro, sem cartão no meio escondendo o que se quer ver: só um rótulo e uma
                mini peça no canto, para dar escala. A textura aparece com a opacidade da amostra (visível); o valor
                que o clique aplica continua sendo o do preset. */}
            <div className="relative h-48 overflow-hidden">
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
                    <div className="absolute bottom-3 right-3 z-10 scale-90 origin-bottom-right opacity-90">
                        <SampleButton state="rest" />
                    </div>
                </SampleScope>
            </div>
        </OptionTile>
    );
};
