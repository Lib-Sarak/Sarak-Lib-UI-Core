/**
 * Presets: Temas Globais
 *
 * Configurações que alteram a aplicação inteira de uma vez.
 * Formato: { id: ThemePresetId; name: string; description: string; design: Record<string, unknown> }
 *
 * `design` é `Record<string, unknown>` (Zero `any` — §0.6) e NÃO o `SarakThemePayload`
 * estrito: os presets legados carregam valores que divergiram do domínio fechado do
 * payload (ex.: `logoMinimalUrl`, `cardVariant: "solid"`), reconciliação pendente com a
 * paridade 1:1:1:1:1 (ver `Provider/types.ts`). A blindagem estrita vive na diretiva
 * `theme` (Spec 42), que autores de manifesto consomem via `Partial<SarakThemePayload>`.
 */
import type { SarakDesignState } from '../../../Provider/types';

/**
 * União conhecida dos ids de preset (fonte única do catálogo embarcado).
 * Adicionar um tema = adicionar seu id aqui, o arquivo do tema, a linha em
 * `loaders.ts` e em `all.ts`. Consumida pela diretiva `theme` (Spec 42) como o
 * ramo "preset nomeado".
 *
 * Este módulo NÃO importa tema nenhum: ele está no fecho estático do barril, e
 * só o tema padrão pode estar lá (`boot.ts`).
 */
export const SARAK_THEME_PRESET_IDS = [
    'sarak-sovereign',
    'cyberpunk-neon',
    'industrial-terminal',
    'neo-brutalism',
    'synthwave-retro',
    'nebula-space',
    'kinetic-flow',
    'cyber-retro-wave',
    'minimalist-airy',
    'data-terminal',
    'neumorphic-mobile',
    'golden-hour',
    'aurora-veil',
    'blueprint-protocol',
] as const;

export type SarakThemePresetId = (typeof SARAK_THEME_PRESET_IDS)[number];

export interface SarakThemePreset {
    id: SarakThemePresetId;
    name: string;
    description: string;
    design: Record<string, unknown>;
    /**
     * Bloco PARCIAL, autorado, com os tokens que mudam para o modo OPOSTO ao
     * nativo (`design.mode`) — specs/specs/09-temas-e-presets.md §2.1. OPCIONAL
     * no tipo de propósito: torná-lo obrigatório quebraria todo tema de
     * consumidor (R33). `resolveThemeForMode` (abaixo) é quem decide o que
     * aplicar; o gate de contraste (`auditor_contraste`) é quem EXIGE presença
     * de todo tema shippado — a lista de isenção terminou vazia.
     */
    contraparte?: Partial<SarakDesignState>;
}

/** O tema padrão do sistema — o único embarcado que vive no boot (`boot.ts`). */
export const SARAK_DEFAULT_THEME_ID = 'sarak-sovereign' as const satisfies SarakThemePresetId;

/** Amostra de cor de um tema num modo — o bastante para o seletor desenhar a pílula sem carregar o tema. */
export interface SarakThemeSwatch {
    primaryColor: string;
    colorBgBody: string;
    textColorMaster: string;
}

/**
 * Entrada do catálogo LEVE: lista o tema (nome, modo, amostra de cor) sem o
 * `design`. Os embarcados saem de `catalog.generated.ts`, gerado a partir dos
 * próprios temas (`npm run themes:catalog`) — nunca escrito à mão.
 */
export interface SarakThemeCatalogEntry {
    id: string;
    name: string;
    description: string;
    /** Modo nativo do tema. */
    mode: 'light' | 'dark';
    /** `true` quando o tema traz a contraparte AUTORADA para o modo oposto. */
    hasContraparte: boolean;
    /** Cores do tema no modo nativo. */
    swatch: SarakThemeSwatch;
    /** Cores do tema no modo oposto (contraparte autorada ou o fallback sintetizado). */
    swatchOpposite: SarakThemeSwatch;
}
