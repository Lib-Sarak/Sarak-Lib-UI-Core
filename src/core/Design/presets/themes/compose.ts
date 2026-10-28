import { sarakGetDefaultDesignState } from '../../master-map';
import { resolvePaletteForDesign } from '../../palette/resolve';
import type { SarakDesignState } from '../../../Provider/types';
import type { PaletteMode } from '../../palette/types';
import { resolveThemeForMode, type ModeResolvableTheme } from './color-engine';

/**
 * Chaves do `design` que NÃO são do tema: identidade do sistema, idioma do host
 * e o modo do usuário. Sobrevivem à troca de tema; tudo o mais é do tema escolhido.
 */
export const THEME_PRESERVED_KEYS = [
    'systemName',
    'logoUrl',
    'logoDarkUrl',
    'language',
    'availableLanguages',
    'enabledLanguages',
    'mode',
] as const;

const getPaletteMode = (
    resolvedTheme: Record<string, unknown>,
    hostConfig: Record<string, unknown>,
    previous: Record<string, unknown>,
): PaletteMode => {
    const modes = [resolvedTheme.mode, hostConfig.mode, previous.mode];
    return modes.find((mode): mode is PaletteMode => mode === 'light' || mode === 'dark') ?? 'dark';
};

/**
 * A função ÚNICA que compõe o `design` quando um tema é aplicado, nesta ordem:
 * padrão de TODO token do schema → o que não é do tema (identidade e modo do
 * usuário) → paleta calculada → `config` do host → tema resolvido para o modo.
 * O tema vence o que declara; o `config` vale no resto; o token que o tema novo
 * e o host não fixam volta ao padrão — nunca herda o valor do tema anterior.
 *
 * Chamada pelo Provider (`useDesignSync`) e pela prévia do painel
 * (`useDesignDraft`): duas portas, um resolvedor.
 */
export const composeThemeDesign = (
    resolvedTheme: Record<string, unknown>,
    previous?: Partial<SarakDesignState> | Record<string, unknown>,
    hostConfig?: Partial<SarakDesignState> | Record<string, unknown>,
): SarakDesignState => {
    const preserved: Record<string, unknown> = {};
    const prev = (previous ?? {}) as Record<string, unknown>;
    THEME_PRESERVED_KEYS.forEach((key) => {
        if (prev[key] !== undefined) preserved[key] = prev[key];
    });
    const host = (hostConfig ?? {}) as Record<string, unknown>;
    const palette = resolvePaletteForDesign(resolvedTheme, host, getPaletteMode(resolvedTheme, host, prev));
    const design = { ...sarakGetDefaultDesignState(), ...preserved, ...palette, ...host, ...resolvedTheme } as Record<string, unknown>;
    if (design.colorPalette === '') delete design.colorPalette;
    return design as unknown as SarakDesignState;
};

/**
 * O `design` que um tema produz num modo, já com a paleta expandida: o tema resolvido
 * para o modo (`design` ou `contraparte`) composto como o Provider o faz. É o que
 * ferramenta e catálogo leem no lugar de `theme.design`, que não carrega mais as
 * cores que a paleta calcula.
 */
export const composeThemeForMode = (theme: ModeResolvableTheme, mode: PaletteMode): SarakDesignState =>
    composeThemeDesign(resolveThemeForMode(theme, mode) as Record<string, unknown>);

/**
 * O tema já resolvido para o modo, com a paleta expandida por baixo do que ele declara e
 * SEM os padrões do schema: é o que a semente do Provider e a miniatura do painel leem
 * quando não compõem o `design` inteiro. A cor que o tema declara vence a paleta.
 */
export const withThemePalette = <T extends Record<string, unknown>>(resolved: T): T => {
    const mode: PaletteMode = resolved.mode === 'light' ? 'light' : 'dark';
    return { ...resolvePaletteForDesign(resolved, undefined, mode), ...resolved };
};
