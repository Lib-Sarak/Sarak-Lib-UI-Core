import type { SarakDesignState, SarakThemeEntry } from '../../../../core/Provider/types';
import type { SarakTokenValue } from '../../../../core/Design/types';
import { sarakGetAllDesignTokens, sarakGetDefaultDesignState } from '../../../../core/Design/master-map';
import { resolveThemeForMode } from '../../../../core/Design/presets/themes/color-engine';

export interface ThemeExportPayload {
    id: string;
    name: string;
    design: SarakDesignState;
    contraparte?: Partial<SarakDesignState>;
    /**
     * Famílias de fonte que o tema usa e que não são da lib (vieram de `options.fonts.custom` deste host): quem
     * importar o tema precisa registrá-las no próprio Provider, senão o token cai no padrão. Fora do `design` e só
     * presente quando há alguma — o formato `{ id, name, design }` continua o mesmo.
     */
    requiresFonts?: string[];
}

/** Famílias dos tokens de fonte do design que não estão nas opções do schema (as da lib e a herança da identidade). */
export const listHostFontFamilies = (design: SarakDesignState): string[] => {
    const values = design as Record<string, unknown>;
    const families = new Set<string>();
    for (const token of sarakGetAllDesignTokens().filter((candidate) => candidate.type === 'font')) {
        const value = values[token.id];
        const catalog = (token.constraints?.options ?? token.options ?? []).map((opt) => String(opt.value ?? opt.id ?? ''));
        if (typeof value === 'string' && value !== '' && !catalog.includes(value)) families.add(value.split(',')[0].replace(/['"]/g, '').trim());
    }
    return [...families];
};

/**
 * Resolve o conjunto COMPLETO de tokens (Spec 40.1 — L6): parte dos defaults de TODOS
 * os tokens (`getDefaultDesignState`) e sobrepõe o design informado. Garante que um tema
 * exportado nasça com todos os eixos preenchidos (cor + fonte + cromo + raio + espaçamento),
 * em vez de um subconjunto — assim o consumidor customiza um tema já completo e nunca
 * "esquece" um eixo (a causa-raiz de "fonte/cromo não mudam" do Teste Real).
 */
const resolveCompleteDesign = (design: SarakDesignState): SarakDesignState => ({
    ...sarakGetDefaultDesignState(),
    ...(design as Record<string, unknown>),
} as SarakDesignState);

/** Converte um nome livre em um `id` de tema estável (kebab-case, sem acentos). */
export const slugifyThemeId = (name: string): string => {
    const normalized = name
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    return normalized || 'meu-tema';
};

/**
 * Monta o payload de exportação de um tema (Spec 44 §2.4): o formato é o mesmo
 * `{ id, name, design, contraparte }` dos temas (`ThemePreset`, ver
 * `src/core/Design/presets/themes/*.ts`) — o dev cola isto num arquivo `.ts`/`.json`
 * do próprio repo e passa via `customThemes` do `SarakUIProvider`. Não há
 * persistência em servidor: "salvar um tema" É exportar este JSON.
 */
export const buildThemeExportPayload = (
    design: SarakDesignState,
    name: string,
    contraparte?: Partial<SarakDesignState>,
): ThemeExportPayload => {
    const requiresFonts = listHostFontFamilies(design);
    return {
        id: slugifyThemeId(name),
        name: name.trim() || 'Meu Novo Tema',
        // Exporta o conjunto COMPLETO de tokens (L6), nunca um subconjunto do rascunho.
        design: resolveCompleteDesign(design),
        ...(contraparte ? { contraparte: { ...contraparte } } : {}),
        ...(requiresFonts.length > 0 ? { requiresFonts } : {}),
    };
};

/** Gera um id livre para uma nova entrada sem colidir com o catálogo ou importador. */
export const createUniqueThemeId = (name: string, existingIds: ReadonlySet<string>): string => {
    const baseId = slugifyThemeId(name);
    if (!existingIds.has(baseId)) return baseId;

    let suffix = 2;
    while (existingIds.has(`${baseId}-${suffix}`)) suffix += 1;
    return `${baseId}-${suffix}`;
};

/** Recupera o outro lado do par quando o rascunho está no modo não nativo do tema. */
export const getThemeCounterpartForMode = (
    theme: SarakThemeEntry | undefined,
    mode: 'light' | 'dark',
    draft?: SarakDesignState,
): Partial<SarakDesignState> | undefined => {
    if (!theme?.design || !theme.contraparte) {
        if (!draft) return undefined;
        const oppositeMode = mode === 'light' ? 'dark' : 'light';
        return resolveThemeForMode({ design: draft as unknown as Record<string, SarakTokenValue> }, oppositeMode) as Partial<SarakDesignState>;
    }
    if (theme.design.mode === mode) return theme.contraparte;

    const sourceDesign = theme.design as Record<string, unknown>;
    const modeTokens = Object.keys(theme.contraparte).reduce<Record<string, unknown>>((result, token) => {
        if (token in sourceDesign) result[token] = sourceDesign[token];
        return result;
    }, {});
    modeTokens.mode = theme.design.mode;
    return modeTokens as Partial<SarakDesignState>;
};

/** Dispara o download do JSON no navegador. Só roda no cliente (`document` real). */
export const downloadThemeJson = (payload: ThemeExportPayload): void => {
    if (typeof document === 'undefined') return;

    const json = JSON.stringify(payload, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${payload.id}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
};
