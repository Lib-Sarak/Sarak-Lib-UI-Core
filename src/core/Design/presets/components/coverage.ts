import type { SarakDesignToken } from '../../types';
import type { ComponentPreset } from './cards';

/** Família do mapa de cobertura: o schema a que o token pertence. */
export interface CoverageFamily {
    family: string;
    total: number;
    covered: number;
    /** Os tokens que nenhum preset escreve, para a justificativa de cada um. */
    missing: string[];
}

export interface PresetCoverage {
    total: number;
    covered: number;
    ratio: number;
    families: CoverageFamily[];
}

/**
 * Por que um token estético sem cor fica sem preset algum. A lista só pode encolher: o teste exige que todo token fora
 * esteja aqui E que todo token daqui continue fora — preset novo que o cubra obriga a tirá-lo.
 * - `fine-tuning`: só faz sentido como ajuste fino (um número solto, sem efeito que se escolha de relance), ou depende de
 *   algo que o tema não escolhe (a imagem de fundo do host, a marca do host).
 * - `text-with-color`: o valor é um texto de sombra que carrega cor escrita à mão, e preset de estrutura não escreve cor.
 * - `next-round`: tem leitor e daria preset, mas a amostra ainda não existe (chat, Kanban e matriz).
 */
export type CoverageGap = 'fine-tuning' | 'text-with-color' | 'next-round';

const gaps = (reason: CoverageGap, ids: string[]): Array<[string, CoverageGap]> => ids.map((id) => [id, reason]);

export const COVERAGE_GAPS: ReadonlyMap<string, CoverageGap> = new Map<string, CoverageGap>([
    ...gaps('fine-tuning', [
        'bodySize', 'identityAlignment', 'identityPadding', 'identityFontFamily', 'identityFontWeight', 'identityTracking', 'identityHoverEffect',
        'borderWidth', 'borderStyle', 'sidebarLogoPlacement', 'tabSectionMargin', 'catalogSectionRadius', 'catalogItemRadius',
        'cardSearchBorderBeamActive', 'cardHoverStyle', 'surfaceIntensity', 'headerAlignment', 'textSmoothing', 'textGlowIntensity',
        'typeScaleMicro', 'typeScaleTiny', 'typeScale3xs', 'typeScale2xs', 'typeScaleCaption', 'typeScaleXs',
        'trackingTight', 'trackingSnug', 'trackingWide', 'trackingWider', 'trackingWidest', 'trackingUltra',
        'globalBackgroundBlur', 'globalBackgroundOpacity', 'globalBackgroundPosition',
        'flowNodeRadius', 'flowGridStyle', 'flowNodePadding', 'flowNodeBlur', 'dotGridDotOffset', 'dotGridDotSize', 'dotGridTileSize', 'authHeroOrbBlur',
    ]),
    ...gaps('text-with-color', ['topbarShadow', 'sidebarShadow']),
    ...gaps('next-round', [
        'chatBubbleRadius', 'chatBubbleStyle', 'chatAnimationSpeed', 'chatBubbleGlassBlur',
        'matrixGap', 'matrixRadius', 'matrixBlur', 'kanbanHeaderPaddingY', 'kanbanHeaderTracking', 'kanbanCardRadius',
    ]),
]);

/** O que a paleta e o modo de cor decidem: preset de estrutura não os escreve. */
const PALETTE_IDS: ReadonlySet<string> = new Set(['mode', 'colorPalette', 'colorDepth', 'colorVariation']);

/** Token que o mapa mede: estético e que não é cor. Cor é da paleta, e o funcional vale o padrão do sistema. */
export const isStructuralToken = (token: SarakDesignToken): boolean =>
    (token.kind ?? 'aesthetic') === 'aesthetic' && token.type !== 'color' && !PALETTE_IDS.has(token.id);

/**
 * Quantos tokens estéticos sem cor algum preset escreve, por família (o schema de origem). O dado vem do dicionário vivo:
 * nenhuma lista de token é escrita aqui.
 */
export const measurePresetCoverage = (
    schemas: ReadonlyArray<{ id: string; tokens: readonly SarakDesignToken[] }>,
    presets: readonly ComponentPreset[],
): PresetCoverage => {
    const written = new Set(presets.flatMap((preset) => Object.keys(preset.design)));
    const families = schemas.flatMap((schema) => {
        const tokens = schema.tokens.filter(isStructuralToken);
        if (tokens.length === 0) return [];
        const missing = tokens.filter((token) => !written.has(token.id)).map((token) => token.id);
        return [{ family: schema.id, total: tokens.length, covered: tokens.length - missing.length, missing }];
    });
    const total = families.reduce((sum, family) => sum + family.total, 0);
    const covered = families.reduce((sum, family) => sum + family.covered, 0);
    return { total, covered, ratio: total === 0 ? 0 : covered / total, families };
};
