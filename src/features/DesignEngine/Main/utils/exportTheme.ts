import type { SarakDesignState } from '../../../../core/Provider/types';
import { getDefaultDesignState } from '../../../../core/Design/master-map';

export interface ThemeExportPayload {
    id: string;
    name: string;
    design: SarakDesignState;
}

/**
 * Resolve o conjunto COMPLETO de tokens (Spec 40.1 — L6): parte dos defaults de TODOS
 * os tokens (`getDefaultDesignState`) e sobrepõe o design informado. Garante que um tema
 * exportado nasça com todos os eixos preenchidos (cor + fonte + cromo + raio + espaçamento),
 * em vez de um subconjunto — assim o consumidor customiza um tema já completo e nunca
 * "esquece" um eixo (a causa-raiz de "fonte/cromo não mudam" do Teste Real).
 */
const resolveCompleteDesign = (design: SarakDesignState): SarakDesignState => ({
    ...getDefaultDesignState(),
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
 * `{ id, name, design }` dos temas embutidos (`ThemePreset`, ver
 * `src/core/Design/presets/themes/*.ts`) — o dev cola isto num arquivo `.ts`/`.json`
 * do próprio repo e passa via `customThemes` do `SarakUIProvider`. Não há
 * persistência em servidor: "salvar um tema" É exportar este JSON.
 */
export const buildThemeExportPayload = (design: SarakDesignState, name: string): ThemeExportPayload => ({
    id: slugifyThemeId(name),
    name: name.trim() || 'Meu Novo Tema',
    // Exporta o conjunto COMPLETO de tokens (L6), nunca um subconjunto do rascunho.
    design: resolveCompleteDesign(design)
});

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
