import React, { useMemo, useRef } from 'react';
import { PALETTE_CALCULATED_KEYS, resolvePaletteForDesign } from '../../../../core/Design/palette/resolve';
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
import { useValueWhileVisible } from '../hooks/useValueWhileVisible';

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
export const BAR_WIDGETS_OFF = { chromeSearchPosition: 'off', chromeUserPosition: 'off', chromeNotificationsPosition: 'off', preferenceModePosition: 'off', preferenceLanguagePosition: 'off', preferenceFontSizePosition: 'off', preferenceNavigationStylePosition: 'off', preferenceNavCollapsePosition: 'off', preferenceNavCollapsePositionTopbar: 'off' } as Partial<SarakDesignState>;
const WIDE_GROUPS: ReadonlySet<string> = new Set(['sidebar', 'topbar', 'fontPairs', 'typeScale', 'fonts', 'cards']);

/** Pede a fonte do preset antes de desenhar: sem isto a amostra de um par mostra a fonte do rascunho. */
export const useFontsOf = (preset: ComponentPreset): void => {
    const requestFont = useRequestFont();
    const { headingFont, bodyFont } = preset.design;
    React.useEffect(() => {
        [headingFont, bodyFont].forEach((font) => { if (font) requestFont(font); });
    }, [requestFont, headingFont, bodyFont]);
};

/** As chaves de papel, em ordem fixa: a parte do design que o cálculo da paleta lê, além do valor da paleta e dos tons. */
const PALETTE_ROLE_KEYS = [...PALETTE_CALCULATED_KEYS].sort();
/** Quantas entradas a memória guarda: as opções de barra de uma tela e as das escolhas anteriores. */
const BAR_TONE_CACHE_LIMIT = 64;
/** As chaves que o papel da barra recalcula: as da lateral, as do topo e as do item de navegação (`nav*`). */
const BAR_COLOR_KEY = /^(sidebar|topbar|nav)/;
const BAR_TONE_CACHE = new Map<string, Partial<SarakDesignState>>();

/**
 * Tudo o que `resolvePaletteForDesign` lê do design: o valor da paleta, os tons das barras e, em cada chave de papel, se ela
 * está declarada e com qual texto (a correção contra o declarado usa a presença da chave e a cor literal). Mesma chave, mesmas
 * cores: as opções com o mesmo tom calculam a paleta uma vez, e não uma por opção a cada escolha.
 */
const paletteInputKey = (design: Record<string, unknown>, mode: 'light' | 'dark'): string => [
    mode, String(design.colorPalette), String(design.sidebarTone), String(design.topbarTone), String(design.sidebarBackgroundStyle), String(design.topbarBackgroundStyle),
    ...PALETTE_ROLE_KEYS.map((id) => (id in design ? `${typeof design[id] === 'string' ? design[id] : '?'}` : '-')),
].join('|');

/**
 * As cores da barra que o papel (`sidebarTone`/`topbarTone`) e o fundo em degradê calculam: o rascunho traz as cores já gravadas, e o papel só
 * aparece na amostra se a paleta for recalculada com ele. Entram as chaves da barra e as `nav*` (o texto do item ativo é recalculado
 * com o tom, e sem ele a amostra mostraria uma cor que a lib não emite); o resto da amostra fica como está.
 */
export const barToneColors = (draft: Partial<SarakDesignState> | undefined, overlay: Partial<SarakDesignState>, mode: 'light' | 'dark'): Partial<SarakDesignState> => {
    if (!draft) return {};
    const input = { ...draft, ...overlay } as Record<string, unknown>;
    const key = paletteInputKey(input, mode);
    const cached = BAR_TONE_CACHE.get(key);
    if (cached) return cached;
    const palette = resolvePaletteForDesign(input, undefined, mode);
    const colors = Object.fromEntries(Object.entries(palette).filter(([id]) => BAR_COLOR_KEY.test(id))) as Partial<SarakDesignState>;
    if (BAR_TONE_CACHE.size >= BAR_TONE_CACHE_LIMIT) BAR_TONE_CACHE.delete(BAR_TONE_CACHE.keys().next().value as string);
    BAR_TONE_CACHE.set(key, colors);
    return colors;
};

const Tile: React.FC<PresetGroupCatalogProps & { preset: ComponentPreset; kind: Parameters<typeof PresetSample>[0]['kind'] }> = ({ groupId, preset, kind, onApplyPreset, currentMode, draft, onPeek }) => {
    const text = usePresetText();
    const shown = text.preset(preset);
    useFontsOf(preset);
    // Fora da área visível a opção guarda o rascunho que mostrou por último: não recalcula a paleta nem o escopo a cada escolha.
    const sampleRef = useRef<HTMLDivElement>(null);
    const shownDraft = useValueWhileVisible(sampleRef, draft);
    const tokens = useMemo(() => (NAVIGATION_STYLE[groupId]
        ? { ...BAR_WIDGETS_OFF, ...barToneColors(shownDraft, preset.design, currentMode), ...preset.design, navigationStyle: NAVIGATION_STYLE[groupId] } as Partial<SarakDesignState>
        : preset.design), [groupId, shownDraft, preset.design, currentMode]);
    // O mesmo elemento enquanto a amostra não muda: o React não reconcilia o cromo inteiro da miniatura a cada escolha.
    const sample = useMemo(() => (kind === 'bar' && shownDraft
        ? <BarSample draft={shownDraft as SarakDesignState} mode={currentMode} tokens={tokens} miniature={groupId === 'topbar' ? 'topbar' : 'sidebar'} />
        : <SampleScope draft={shownDraft} tokens={tokens} mode={currentMode}><PresetSample kind={kind} preset={preset} /></SampleScope>
    ), [kind, shownDraft, currentMode, tokens, groupId, preset]);
    return (
        <OptionTile name={shown.name} description={shown.description} onApply={() => onApplyPreset(preset.design, true)} peekTokens={() => preset.design} onPeek={onPeek}>
            <div ref={sampleRef}>{sample}</div>
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
