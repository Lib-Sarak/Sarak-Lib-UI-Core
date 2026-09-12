import { syncThemeWithMode } from '../../Design/presets/themes/color-engine';
import { isPreferenceOffered } from '../../Design/schema/preferences';
import type { SarakTokenValue } from '../../Design/types';
import type { SarakDesignState, ThemeEntry } from '../types';
import type { SarakFontSizePreference, SarakUserPreferences } from '../preferencesTypes';

/** As 5 opções de `bodySize` (`schema/global.ts`) — a base de comparação para
 *  a escala RELATIVA da preferência de tamanho de fonte. É o token que de
 *  fato alcança a tela (`--theme-font-size-base`); `fontScale` é legado e não
 *  emite nada. */
const BODY_SIZE_ORDER = ['12px', '14px', '16px', '18px', '20px'] as const;
const FONT_SIZE_DELTA: Record<SarakFontSizePreference, number> = { sm: -1, md: 0, lg: 1 };

/** `sm`/`lg` deslocam um degrau da BASE do tema (nunca um valor absoluto);
 *  `md` é exatamente essa base (delta 0). */
const applyFontSizeDelta = (baseBodySize: string, preference: SarakFontSizePreference): string => {
    const baseIndex = BODY_SIZE_ORDER.indexOf(baseBodySize as (typeof BODY_SIZE_ORDER)[number]);
    if (baseIndex === -1) return baseBodySize;
    const targetIndex = Math.min(BODY_SIZE_ORDER.length - 1, Math.max(0, baseIndex + FONT_SIZE_DELTA[preference]));
    return BODY_SIZE_ORDER[targetIndex];
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
const applyColorMode = (
    result: SarakDesignState,
    targetMode: 'light' | 'dark',
    theme: ThemeEntry | undefined,
): SarakDesignState => {
    if (targetMode === (result.mode || 'dark')) return result;

    const contraparte = theme?.contraparte;
    if (!contraparte) {
        return syncThemeWithMode(result as unknown as Record<string, SarakTokenValue>, targetMode) as unknown as SarakDesignState;
    }

    const nativeMode: 'light' | 'dark' = (theme?.design?.mode as 'light' | 'dark') || 'dark';
    const trackedKeys = Object.keys(contraparte);
    const trackedValues = targetMode === nativeMode ? pickKeys(theme?.design, trackedKeys) : contraparte;

    return { ...result, ...trackedValues, mode: targetMode } as SarakDesignState;
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
    theme: ThemeEntry | undefined,
    systemColorScheme: 'light' | 'dark',
): SarakDesignState => {
    let result = design;
    const offered = (id: Parameters<typeof isPreferenceOffered>[1]) =>
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
    if (offered('fontSize') && preferences.fontSize) {
        result = { ...result, bodySize: applyFontSizeDelta(String(result.bodySize ?? '14px'), preferences.fontSize) };
    }
    if (offered('language') && preferences.language && isLanguageEnabled(design, preferences.language)) {
        result = { ...result, language: preferences.language };
    }

    return result;
};
