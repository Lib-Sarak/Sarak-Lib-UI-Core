import React from 'react';
import { resolvePaletteForDesign } from '../../../../core/Design/palette/resolve';
import { getPresetGroup } from '../../../../core/Design/presets/components/registry';
import type { ComponentPreset } from '../../../../core/Design/presets/components/cards';
import type { SarakDesignState } from '../../../../core/Provider/types';
import { useRequestFont } from '../../../../core/Provider/hooks/useRequestFont';
import { BarSample } from '../../Main/components/BarSample';
import { usePresetText } from '../../hooks/usePresetText';
import { CATALOG_GRID_2COL, CATALOG_GRID_3COL } from '../panelResponsive.presets';
import { CuratedGrid } from './CuratedGrid';
import { OptionTile } from './OptionTile';
import { PresetSample } from './PresetSamples';
import { SampleScope } from './SampleScope';
import type { PeekHandler } from './peek';

interface PresetGroupCatalogProps {
    groupId: string;
    onApplyPreset: (presetDesign: Partial<SarakDesignState>, isPartial?: boolean) => void;
    currentMode: 'light' | 'dark';
    draft?: Partial<SarakDesignState>;
    onPeek?: PeekHandler;
}

/** Os grupos de barra mostram a lateral ou o topo; o resto, o componente da opção. */
const NAVIGATION_STYLE: Readonly<Record<string, string>> = { sidebar: 'sidebar', topbar: 'topbar' };
/** Na amostra de uma barra só ficam a navegação e a marca: os widgets não são o que o preset desenha, e o que o tom contrastante faz com eles é da barra, não da opção. */
const BAR_WIDGETS_OFF = { chromeSearchPosition: 'off', chromeUserPosition: 'off', chromeNotificationsPosition: 'off', preferenceModePosition: 'off', preferenceLanguagePosition: 'off', preferenceFontSizePosition: 'off', preferenceNavigationStylePosition: 'off', preferenceNavCollapsePosition: 'off' } as Partial<SarakDesignState>;
const WIDE_GROUPS: ReadonlySet<string> = new Set(['sidebar', 'topbar', 'fontPairs', 'typeScale', 'fonts', 'cards']);

/** Pede a fonte do preset antes de desenhar: sem isto a amostra de um par mostra a fonte do rascunho. */
const useFontsOf = (preset: ComponentPreset): void => {
    const requestFont = useRequestFont();
    const { headingFont, bodyFont } = preset.design;
    React.useEffect(() => {
        [headingFont, bodyFont].forEach((font) => { if (font) requestFont(font); });
    }, [requestFont, headingFont, bodyFont]);
};

/**
 * As cores da barra que o papel (`sidebarTone`/`topbarTone`) calcula: o rascunho traz as cores já gravadas, e o papel só
 * aparece na amostra se a paleta for recalculada com ele. Só as chaves da barra entram, para o resto da amostra ficar como está.
 */
const barToneColors = (draft: Partial<SarakDesignState> | undefined, overlay: Partial<SarakDesignState>, mode: 'light' | 'dark'): Partial<SarakDesignState> => {
    if (!draft) return {};
    const palette = resolvePaletteForDesign({ ...draft, ...overlay } as Record<string, unknown>, undefined, mode);
    return Object.fromEntries(Object.entries(palette).filter(([id]) => /^(sidebar|topbar)/.test(id))) as Partial<SarakDesignState>;
};

const Tile: React.FC<PresetGroupCatalogProps & { preset: ComponentPreset; kind: Parameters<typeof PresetSample>[0]['kind'] }> = ({ groupId, preset, kind, onApplyPreset, currentMode, draft, onPeek }) => {
    const text = usePresetText();
    const shown = text.preset(preset);
    useFontsOf(preset);
    const tokens = NAVIGATION_STYLE[groupId]
        ? { ...BAR_WIDGETS_OFF, ...barToneColors(draft, preset.design, currentMode), ...preset.design, navigationStyle: NAVIGATION_STYLE[groupId] } as Partial<SarakDesignState>
        : preset.design;
    return (
        <OptionTile name={shown.name} description={shown.description} onApply={() => onApplyPreset(preset.design, true)} peekTokens={() => preset.design} onPeek={onPeek}>
            {kind === 'bar' && draft
                ? <BarSample draft={draft as SarakDesignState} mode={currentMode} tokens={tokens} miniature={groupId === 'topbar' ? 'topbar' : 'sidebar'} />
                : <SampleScope draft={draft} tokens={tokens} mode={currentMode}><PresetSample kind={kind} preset={preset} /></SampleScope>}
        </OptionTile>
    );
};

/** Um grupo de opções genérico do registro: as destacadas, o "Ver todas", e a amostra que o grupo declara. */
export const PresetGroupCatalog: React.FC<PresetGroupCatalogProps> = (props) => {
    const group = getPresetGroup(props.groupId);
    if (!group) return null;
    return (
        <CuratedGrid
            group={group}
            gridClassName={WIDE_GROUPS.has(group.id) ? CATALOG_GRID_2COL : CATALOG_GRID_3COL}
            renderTile={(preset) => <Tile key={preset.id} {...props} preset={preset} kind={group.sample} />}
        />
    );
};
