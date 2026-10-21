import { sarakGetAllDesignTokens } from '../../Design/master-map';
import { THEME_FONTS } from '../../Design/schema/typography';
import type { SarakFontSource, SarakFontsOption } from '../providerProps';
import type { SarakThemePayload } from '../types';
import { listLoadableFamilies } from './googleFontsUrl';
import type { HostFontRegistry } from './hostFonts';

const FONT_SOURCES: readonly SarakFontSource[] = ['bundled', 'google', 'none'];
export const DEFAULT_FONT_SOURCE: SarakFontSource = 'bundled';

export interface ResolvedFontsOption {
    source: SarakFontSource;
    baseUrl?: string;
}

const asSource = (value: unknown): SarakFontSource =>
    FONT_SOURCES.includes(value as SarakFontSource) ? (value as SarakFontSource) : DEFAULT_FONT_SOURCE;

/** `options.fonts` → origem + `baseUrl`. Valor fora das três origens cai no padrão. */
export function resolveFontsOption(option?: SarakFontsOption): ResolvedFontsOption {
    if (option === undefined || typeof option === 'string') return { source: asSource(option) };
    return { source: asSource(option.source), baseUrl: option.baseUrl || undefined };
}

/** Valor exato de `THEME_FONTS` → família carregável; a fonte do sistema fica de fora. */
const FAMILY_BY_VALUE = new Map(
    THEME_FONTS.flatMap((font) => listLoadableFamilies([font]).map((family) => [font.value, family] as const)),
);

let fontTokens: { id: string; defaultValue: unknown }[] | null = null;
const getFontTokens = () => {
    fontTokens ??= sarakGetAllDesignTokens()
        .filter((token) => token.type === 'font')
        .map((token) => ({ id: token.id, defaultValue: token.defaultValue }));
    return fontTokens;
};

/**
 * Famílias que o design no ar usa: o valor de cada token de fonte (título, corpo, mono, identidade…), ou o padrão
 * do token quando o design não o declara — a mesma regra do `useDesignVariables`. Só valor da lista da lib ou de
 * família registrada pelo host (`fonts`) conta.
 */
export function resolveUsedFontFamilies(design: SarakThemePayload, fonts?: HostFontRegistry): string[] {
    const values = design as Record<string, unknown>;
    const families = new Set<string>();
    for (const { id, defaultValue } of getFontTokens()) {
        const value = values[id] ?? defaultValue;
        const family = typeof value === 'string' ? FAMILY_BY_VALUE.get(value) ?? fonts?.values.get(value) : undefined;
        if (family) families.add(family);
    }
    return [...families];
}
