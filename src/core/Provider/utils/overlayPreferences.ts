import { syncThemeWithMode } from '../../Design/presets/themes/color-engine';
import { PALETTE_CALCULATED_KEYS, resolvePaletteForDesign } from '../../Design/palette/resolve';
import { chosenToneKeys } from './designChoices';
import { chosenModeValueKeys } from './chosenModeValues';
import { isValidPaletteValue } from '../../Design/palette/parser';
import { isPreferenceOffered } from '../../Design/schema/preferences';
import { sarakGetDefaultDesignState } from '../../Design/master-map';
import type { SarakTokenValue } from '../../Design/types';
import type { SarakDesignState, SarakThemeEntry } from '../types';
import type { SarakFontSizePreference, SarakUserPreferences } from '../preferencesTypes';

/** O menor tamanho que a preferência P entrega: abaixo disso o texto deixa de ser legível, qualquer que seja a redução configurada. */
const FONT_SIZE_FLOOR_PX = 8;

/** Padrão de fábrica da redução de P e do aumento de G, em px — o mesmo `defaultValue` dos tokens (`schema/preferences.ts`). */
const DEFAULT_FONT_SIZE_STEP_PX = 2;

/** O `bodySize` de fábrica do schema, base da preferência quando o design ainda não o declara. */
const DEFAULT_BODY_SIZE = String(sarakGetDefaultDesignState().bodySize);

// @sarak-token-reader bodySize direto
// O valor de `bodySize` é lido como número de px, qualquer uma das opções, e não por uma tabela de opções.
const PX_VALUE = /^(\d+(?:\.\d+)?)px$/;

const readStepPx = (value: unknown): number =>
    typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : DEFAULT_FONT_SIZE_STEP_PX;

/**
 * `sm`/`lg` movem a BASE do tema (`bodySize`, o token que de fato chega à tela em `--theme-font-size-base`) em px: P reduz
 * `preferenceFontSizeReduction` e G aumenta `preferenceFontSizeIncrease`, nunca um valor absoluto; `md` é exatamente a
 * base. Sem escala fixa: com base 12, P é 10 e nunca igual a M; com base 20, G é 22. Base que não é px volta como veio.
 */
const applyFontSizeDelta = (
    design: SarakDesignState,
    baseBodySize: string,
    preference: SarakFontSizePreference,
): string => {
    if (preference === 'md') return baseBodySize;
    const match = PX_VALUE.exec(baseBodySize);
    if (!match) return baseBodySize;
    const record = design as unknown as Record<string, unknown>;
    const step = preference === 'sm'
        ? -readStepPx(record.preferenceFontSizeReduction)
        : readStepPx(record.preferenceFontSizeIncrease);
    return `${Math.max(FONT_SIZE_FLOOR_PX, Number(match[1]) + step)}px`;
};

const resolveColorModeTarget = (
    preference: SarakUserPreferences['colorMode'],
    systemColorScheme: 'light' | 'dark',
): 'light' | 'dark' | undefined => {
    if (preference === 'light' || preference === 'dark') return preference;
    if (preference === 'system') return systemColorScheme;
    return undefined;
};

/** Só as chaves de `keys` que `source` de fato declara — nunca inventa `undefined`. */
const pickKeys = (source: Record<string, unknown> | undefined, keys: string[]): Partial<SarakDesignState> => {
    const picked: Record<string, unknown> = {};
    keys.forEach((key) => {
        if (source && key in source) picked[key] = source[key];
    });
    return picked as Partial<SarakDesignState>;
};

const getPaletteThemeOverrides = (
    theme: SarakThemeEntry | undefined,
    targetMode: 'light' | 'dark',
): Record<string, unknown> => {
    const nativeMode = (theme?.design?.mode as 'light' | 'dark') || 'dark';
    return targetMode === nativeMode
        ? { ...theme?.design }
        : { ...theme?.design, ...theme?.contraparte };
};

/** A entrada da paleta: o que o tema declara para o modo (sem os padrões do schema), com a paleta que o design escolheu. Sem tema, o próprio design. */
const themePaletteInput = (
    design: Record<string, unknown>,
    theme: SarakThemeEntry | undefined,
    mode: 'light' | 'dark',
): Record<string, unknown> => {
    if (!theme?.design) return design;
    const declared = getPaletteThemeOverrides(theme, mode);
    return { ...declared, colorPalette: design.colorPalette, mode };
};

const applyCalculatedPaletteMode = (
    design: SarakDesignState,
    targetMode: 'light' | 'dark',
    theme: SarakThemeEntry | undefined,
): SarakDesignState => {
    const currentMode = design.mode === 'light' ? 'light' : 'dark';
    const designRecord = design as unknown as Record<string, unknown>;
    // A paleta se calcula sobre o que o TEMA declara no modo (como `composeThemeDesign` a calculou quando o tema entrou), e não sobre o
    // design já composto: lá os padrões do schema e as cores calculadas entram na conta e o resultado diverge do que está na tela.
    const currentPalette = resolvePaletteForDesign(themePaletteInput(designRecord, theme, currentMode), undefined, currentMode);
    const targetPalette = resolvePaletteForDesign(themePaletteInput(designRecord, theme, targetMode), undefined, targetMode);
    // Com "manter minha paleta", a cor que o tema declara não volta na troca de modo: a paleta calcula nos dois.
    const keepPalette = designRecord.keepPalette === true;
    const chosenTone = chosenToneKeys(designRecord, theme as never, targetMode);
    const themeOverrides = keepPalette ? {} : Object.fromEntries(Object.entries(getPaletteThemeOverrides(theme, targetMode)).filter(([tokenId]) => !chosenTone.has(tokenId)));
    const chosenValues = chosenModeValueKeys(design, theme as never);
    const next = { ...design } as Record<string, unknown>;

    Object.entries(targetPalette).forEach(([tokenId, color]) => {
        const explicitThemeColor = themeOverrides[tokenId];
        if (explicitThemeColor !== undefined) {
            next[tokenId] = explicitThemeColor;
            return;
        }
        if (designRecord[tokenId] === currentPalette[tokenId]) next[tokenId] = color;
    });

    const counterpart = theme?.contraparte;
    if (counterpart) {
        const nativeMode = (theme?.design?.mode as 'light' | 'dark') || 'dark';
        const trackedKeys = Object.keys(counterpart);
        const trackedValues = targetMode === nativeMode ? pickKeys(theme?.design, trackedKeys) : counterpart;
        const wanted = Object.fromEntries(Object.entries(trackedValues).filter(([tokenId]) => !chosenTone.has(tokenId) && !chosenValues.has(tokenId) && !(keepPalette && PALETTE_CALCULATED_KEYS.has(tokenId))));
        Object.assign(next, wanted);
    }

    next.mode = targetMode;
    return next as unknown as SarakDesignState;
};

/**
 * Troca só os tokens que CARREGAM modo — os que a contraparte da entrada
 * declara — e SÓ quando o modo pedido é DIFERENTE do modo atual do design.
 * Pedir o modo em que o design já está é sempre um no-op: nenhuma chave de
 * modo é reescrita, mesmo que ela também exista em `theme.design`/
 * `contraparte` — senão uma cor de modo que o administrador personalizou
 * seria substituída pelo valor de catálogo toda vez que o usuário confirmar
 * o mesmo modo (inclusive via preferência "sistema" resolvendo para o modo
 * corrente).
 *
 * Quando o modo pedido É diferente, a comparação para ESCOLHER a fonte do
 * valor é contra o modo NATIVO da entrada (`theme.design.mode`), nunca
 * contra o modo atual do design: um tema salvo pelo painel no modo oposto ao
 * nativo já carrega os valores da contraparte como "atuais", e pedir o
 * nativo de volta precisa RESTAURAR esses tokens a partir de `theme.design`
 * — reaplicar a contraparte de novo pintaria a tela com a paleta errada sob
 * o rótulo certo. Pedido = nativo → valor de `theme.design`; pedido = oposto
 * → valor da `contraparte`. Todo o resto do design ATUAL (customizações do
 * administrador incluídas) permanece intocado. Sem contraparte, cai no
 * fallback sintetizado sobre o design atual, como antes.
 */
export const applyColorMode = (
    result: SarakDesignState,
    targetMode: 'light' | 'dark',
    theme: SarakThemeEntry | undefined,
): SarakDesignState => {
    if (targetMode === (result.mode || 'dark')) return result;

    if (isValidPaletteValue(result.colorPalette)) return applyCalculatedPaletteMode(result, targetMode, theme);

    const contraparte = theme?.contraparte;
    if (!contraparte) {
        return syncThemeWithMode(result as unknown as Record<string, SarakTokenValue>, targetMode) as unknown as SarakDesignState;
    }

    const nativeMode: 'light' | 'dark' = (theme?.design?.mode as 'light' | 'dark') || 'dark';
    const trackedKeys = Object.keys(contraparte);
    const trackedValues = targetMode === nativeMode ? pickKeys(theme?.design, trackedKeys) : contraparte;

    const chosenValues = chosenModeValueKeys(result, theme as never);
    const wanted = Object.fromEntries(Object.entries(trackedValues).filter(([tokenId]) => !chosenValues.has(tokenId)));
    return { ...result, ...wanted, mode: targetMode } as SarakDesignState;
};

/**
 * Um idioma de preferência só vale se o TEMA o habilita — "idioma" na
 * preferência é `um dos habilitados no tema` (specs/09 §4.7), nunca um valor
 * livre. Tema sem `enabledLanguages` declarado não habilita nenhum: nada é
 * "habilitado por omissão". Exportado porque é a MESMA régua que decide o que
 * `overlayPreferences` aplica e o que o seletor mostra como valor corrente —
 * fonte única, para as duas pontas nunca divergirem (o mesmo espírito de
 * `isSafeMediaString`, specs/10 §2.1).
 */
export const isLanguageEnabled = (design: SarakDesignState, language: string): boolean => {
    const enabledLanguages = design.enabledLanguages;
    return Array.isArray(enabledLanguages) && enabledLanguages.includes(language);
};

/**
 * A sobreposição: aplica, por cima do design já resolvido, só as preferências
 * cuja posição (token `preference*Position`, lido do próprio `design`) não é
 * `'off'` — nunca grava nada, é pura.
 */
export const overlayPreferences = (
    design: SarakDesignState,
    preferences: SarakUserPreferences,
    theme: SarakThemeEntry | undefined,
    systemColorScheme: 'light' | 'dark',
): SarakDesignState => {
    let result = design;
    const offered = (id: Parameters<typeof isPreferenceOffered>[1]): boolean =>
        isPreferenceOffered(design as unknown as Record<string, unknown>, id);

    const targetMode = offered('colorMode') ? resolveColorModeTarget(preferences.colorMode, systemColorScheme) : undefined;
    if (targetMode) {
        result = applyColorMode(result, targetMode, theme);
    }

    if (offered('navigationStyle') && preferences.navigationStyle) {
        result = { ...result, navigationStyle: preferences.navigationStyle };
    }
    if (offered('navCollapsed') && typeof preferences.navCollapsed === 'boolean') {
        result = { ...result, isNavHidden: preferences.navCollapsed };
    }
    if (design.sidebarResizable === true && typeof preferences.sidebarWidth === 'number') {
        result = { ...result, sidebarWidth: preferences.sidebarWidth };
    }
    if (offered('fontSize') && preferences.fontSize) {
        result = { ...result, bodySize: applyFontSizeDelta(result, String(result.bodySize ?? DEFAULT_BODY_SIZE), preferences.fontSize) };
    }
    if (offered('language') && preferences.language && isLanguageEnabled(design, preferences.language)) {
        result = { ...result, language: preferences.language };
    }

    return result;
};
