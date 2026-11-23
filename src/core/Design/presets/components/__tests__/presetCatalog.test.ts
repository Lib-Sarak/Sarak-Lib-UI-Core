// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { MASTER_DESIGN_MAP, sarakGetAllDesignTokens, sarakGetDefaultDesignState } from '../../../master-map';
import { auditTokenContract } from '../../../../Provider/utils/validation';
import { TEXTURE_OPTIONS } from '../../../schema/atmosphere';
import { THEME_FONTS } from '../../../schema/typography';
import { ALL_COMPONENT_PRESETS, PRESET_GROUPS, type PresetGroupDef } from '../registry';
import { CARD_TEXTURE_OPACITY } from '../cards';
import { PRESET_TEXTS_COMPONENTS_B } from '../../../../i18n/presetTexts/componentsB';
import { COVERAGE_GAPS, measurePresetCoverage } from '../coverage';
import { TEXTURE_FAMILIES, textureFamilyOf } from '../textureFamilies';
import { LEGACY_CLOSE_PAIRS, LEGACY_COLOR_PRESET_IDS, PUBLISHED_PRESET_IDS } from './publishedPresets';

const TOKENS = new Map(sarakGetAllDesignTokens().map((token) => [token.id, token]));
const SCHEMA_OF = new Map(MASTER_DESIGN_MAP.components.flatMap((schema) => schema.tokens.map((token) => [token.id, schema.id] as const)));
const DEFAULTS = sarakGetDefaultDesignState() as Record<string, unknown>;

/** Mínimos por grupo; o grupo que fica abaixo tem o motivo no comentário ao lado (menos tokens, menos opções distintas). */
const MIN_COUNT: Record<string, number> = {
    barTone: 5, sidebar: 8, topbar: 6, contentWidth: 6, cards: 18, cardTextures: 40, corners: 4, density: 4, shadow: 4, shadowDirection: 5, border: 5,
    material: 4, glass: 4, atmosphere: 11, gradient: 4, textures: 40, buttons: 18, inputs: 16, tables: 5, charts: 5,
    modal: 3, notice: 3, switch: 4, scroll: 3, badge: 3, emptyState: 3, motion: 4, pageTransition: 5, icons: 6, fontPairs: 10, typeScale: 4, fonts: 42,
};

/** Cor escrita à mão num valor de texto (hex, rgb, hsl, oklch): `var(...)` e `color-mix` sobre variável não contam. */
const COLOR_LITERAL = /#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?|oklch|oklab|lab|lch)\(/i;

const writesColor = (design: Record<string, unknown>): boolean =>
    Object.entries(design).some(([id, value]) => TOKENS.get(id)?.type === 'color' || (typeof value === 'string' && COLOR_LITERAL.test(value)));

const valueOf = (design: Record<string, unknown>, id: string): unknown => (id in design ? design[id] : DEFAULTS[id]);

const differingTokens = (a: Record<string, unknown>, b: Record<string, unknown>): string[] =>
    [...new Set([...Object.keys(a), ...Object.keys(b)])].filter((id) => JSON.stringify(valueOf(a, id)) !== JSON.stringify(valueOf(b, id)));

const curated = (): PresetGroupDef[] => PRESET_GROUPS.filter((group) => !group.optionsOfOneToken && !group.optionsOfTokenAndSetting);

describe('presets de componente — o registro', () => {
    it('todo id é único no catálogo inteiro', () => {
        const ids = PRESET_GROUPS.flatMap((group) => group.presets.map((preset) => preset.id));
        const repeated = ids.filter((id, index) => ids.indexOf(id) !== index);
        expect(repeated).toEqual([]);
    });

    it('nenhum id publicado mudou ou saiu', () => {
        const present = new Set(ALL_COMPONENT_PRESETS.map((preset) => preset.id));
        expect(PUBLISHED_PRESET_IDS.filter((id) => !present.has(id))).toEqual([]);
    });

    it.each(PRESET_GROUPS.map((group) => [group.id, group] as const))('%s: atinge o mínimo de opções', (id, group) => {
        expect(group.presets.length).toBeGreaterThanOrEqual(MIN_COUNT[id] ?? 1);
    });

    it('todo grupo tem contagem mínima declarada neste teste', () => {
        expect(PRESET_GROUPS.filter((group) => group.id !== 'buttonStyles').filter((group) => MIN_COUNT[group.id] === undefined).map((group) => group.id)).toEqual([]);
    });
});

describe('presets de componente — curadoria', () => {
    it.each(PRESET_GROUPS.map((group) => [group.id, group] as const))('%s: mostra até 8 opções (as que a miniatura distingue) e o resto fica no "Ver todas"', (_id, group) => {
        const known = new Set(group.presets.map((preset) => preset.id));
        expect(group.featured.filter((id) => !known.has(id))).toEqual([]);
        expect(new Set(group.featured).size).toBe(group.featured.length);
        expect(group.featured.length).toBeLessThanOrEqual(8);
        // Opção que a miniatura não distingue de outra sai das destacadas (registry.ts `except`); sobra ao menos uma.
        expect(group.featured.length).toBeGreaterThanOrEqual(1);
        expect(group.featured.length).toBeLessThanOrEqual(group.presets.length);
    });

    it.each(curated().map((group) => [group.id, group] as const))('%s: ao menos dois tokens com efeito diferem de qualquer outro preset do grupo', (_id, group) => {
        const closePairs: string[] = [];
        group.presets.forEach((a, index) => group.presets.slice(index + 1).forEach((b) => {
            const diff = differingTokens(a.design, b.design);
            if (diff.length < 2 && !LEGACY_CLOSE_PAIRS.includes(`${a.id} ~ ${b.id}`)) closePairs.push(`${a.id} ~ ${b.id} (${diff.join(',') || 'iguais'})`);
        }));
        expect(closePairs).toEqual([]);
    });

    it.each(PRESET_GROUPS.filter((group) => group.optionsOfOneToken).map((group) => [group.id, group] as const))('%s: cada opção é um valor diferente do mesmo token', (_id, group) => {
        const keys = group.presets.map((preset) => JSON.stringify(preset.design));
        expect(new Set(keys).size).toBe(keys.length);
    });

    it('cardTextures: cada textura grava o tipo dela e a própria opacidade (uma textura escolhida aparece na aplicação)', () => {
        const group = PRESET_GROUPS.find((candidate) => candidate.id === 'cardTextures') as PresetGroupDef;
        const types = group.presets.map((preset) => preset.design.cardTextureType);
        expect(new Set(types).size).toBe(types.length);
        const withoutOpacity = group.presets.filter((preset) => typeof preset.design.cardTextureOpacity !== 'number').map((preset) => preset.id);
        expect(withoutOpacity).toEqual([]);
        const invisible = group.presets.filter((preset) => preset.design.cardTextureType !== 'none' && (preset.design.cardTextureOpacity as number) <= 0).map((preset) => preset.id);
        expect(invisible).toEqual([]);
        expect(group.presets.every((preset) => Object.keys(preset.design).sort().join() === 'cardTextureOpacity,cardTextureType')).toBe(true);
    });

    it('charts: o grupo lista só estilo — nenhum preset grava chartType nem leva tipo de gráfico no nome', () => {
        const group = PRESET_GROUPS.find((candidate) => candidate.id === 'charts') as PresetGroupDef;
        expect(group.presets.filter((preset) => 'chartType' in preset.design).map((preset) => preset.id)).toEqual([]);
        const chartTypes = /\b(linha|line|barras?|bars?|bar|[aá]rea|area|pizza|pie|donut|radar|dispers[aã]o|scatter|mapa de calor|heatmap|gauge)\b/i;
        expect(group.presets.filter((preset) => chartTypes.test(preset.name ?? '')).map((preset) => preset.id)).toEqual([]);
        group.presets.forEach((preset) => {
            expect(Object.keys(preset.design).sort()).toEqual(['chartGridOpacity', 'chartShowGrid', 'chartSmoothing', 'chartThickness']);
        });
    });

    it('charts: os textos dos seis idiomas também não dizem o tipo', () => {
        const group = PRESET_GROUPS.find((candidate) => candidate.id === 'charts') as PresetGroupDef;
        const chartTypes = /\b(line|lines|bars?|area|pie|donut|radar|scatter|heatmap|gauge|l[ií]nea|barras?|[aá]rea|ligne|barres?|aire|linie|balken|fl[aä]che|linea|barre|area)\b/i;
        const texts = PRESET_TEXTS_COMPONENTS_B;
        group.presets.forEach((preset) => {
            const entry = texts[preset.id];
            expect(entry, preset.id).toBeDefined();
            expect(entry.name.filter((name) => chartTypes.test(name)), preset.id).toEqual([]);
        });
    });

    it('cardTextures: os valores de opacidade por textura não mudam sem uma nova medida', () => {
        expect(CARD_TEXTURE_OPACITY).toEqual({
        grid: 1, dots: 1, noise: 0.35, grain: 0.12, mesh: 1, waves: 1,
        squares: 1, stripes: 1, topo: 1, diamond: 1, prestige: 1, carbon: 0.25,
        brushed: 1, frosted: 1, circuit: 1, paper: 0.4, scanlines: 1, hexagon: 1,
        silk: 1, blueprint: 1, aurora: 0.8, stars: 1, honeycomb: 0.45, isometric: 0.8,
        radar: 1, crosshatch: 1, 'micro-dots': 1, pinstripes: 1, constellation: 1, 'circuit-pro': 1,
        'carbon-tech': 1, 'topo-deep': 1, 'prism-mesh': 1, 'cyber-binary': 1, 'blueprint-pro': 1, 'wave-pulse': 1,
        wood: 1, stucco: 0.12, fluid: 0.2, nebula: 1,
            none: 0.06,
        });
        expect(Object.values(CARD_TEXTURE_OPACITY).every((value) => value > 0 && value <= 1)).toBe(true);
        expect(Object.keys(CARD_TEXTURE_OPACITY).sort()).toEqual(TEXTURE_OPTIONS.map((texture) => texture.value).sort());
    });
});

describe('presets de componente — o que escrevem', () => {
    it('só tokens que existem no dicionário', () => {
        const unknown = ALL_COMPONENT_PRESETS.flatMap((preset) => Object.keys(preset.design).filter((id) => !TOKENS.has(id)).map((id) => `${preset.id}.${id}`));
        expect(unknown).toEqual([]);
    });

    it.each(PRESET_GROUPS.map((group) => [group.id, group] as const))('%s: escreve só tokens da sua área', (_id, group) => {
        const outside = group.presets.flatMap((preset) => Object.keys(preset.design)
            .filter((id) => TOKENS.get(id)?.type !== 'color')
            .filter((id) => !group.areas.includes(SCHEMA_OF.get(id) ?? '') || (group.owns !== undefined && !group.owns.test(id)))
            .map((id) => `${preset.id}.${id}`));
        expect(outside).toEqual([]);
    });

    it('nenhum valor sai do contrato do próprio token', () => {
        const drift = ALL_COMPONENT_PRESETS.flatMap((preset) => auditTokenContract(preset.id, preset.design as Record<string, unknown>));
        expect(drift).toEqual([]);
    });

    it('nenhum preset de estrutura escreve cor — a lista dos que ainda escrevem só encolhe', () => {
        const withColor = ALL_COMPONENT_PRESETS.filter((preset) => writesColor(preset.design as Record<string, unknown>)).map((preset) => preset.id).sort();
        expect(withColor).toEqual([...LEGACY_COLOR_PRESET_IDS].sort());
    });

    it('nenhum preset aponta para servidor de terceiro', () => {
        const remote = ALL_COMPONENT_PRESETS.flatMap((preset) => Object.entries(preset.design).filter(([, value]) => typeof value === 'string' && /^https?:\/\//i.test(value)).map(([id]) => `${preset.id}.${id}`));
        expect(remote).toEqual([]);
    });

    it('as palavras de busca existem, são curtas e sem repetição', () => {
        const bad = ALL_COMPONENT_PRESETS.filter((preset) => preset.keywords !== undefined
            && (preset.keywords.length === 0 || preset.keywords.some((word) => word.trim() === '' || word.length > 24) || new Set(preset.keywords).size !== preset.keywords.length));
        expect(bad.map((preset) => preset.id)).toEqual([]);
    });
});

describe('presets de componente — o mapa de cobertura', () => {
    const coverage = measurePresetCoverage(MASTER_DESIGN_MAP.components, ALL_COMPONENT_PRESETS);

    it('cobrem ao menos 60% dos tokens estéticos sem cor', () => {
        expect(coverage.ratio).toBeGreaterThanOrEqual(0.6);
    });

    it('todo token que ficou de fora tem motivo declarado, e todo motivo declarado ainda vale', () => {
        const missing = coverage.families.flatMap((family) => family.missing).sort();
        expect(missing).toEqual([...COVERAGE_GAPS.keys()].sort());
    });
});

describe('presets de componente — texturas e fontes', () => {
    it('as famílias de textura particionam as texturas do schema, sem repetir nem sobrar', () => {
        const inFamilies = TEXTURE_FAMILIES.flatMap((family) => family.textures);
        const schema = TEXTURE_OPTIONS.map((texture) => texture.value).filter((value) => value !== 'none');
        expect([...inFamilies].sort()).toEqual([...schema].sort());
        expect(textureFamilyOf('none')).toBeUndefined();
    });

    it('todo par de fontes usa só fontes da lista embarcada', () => {
        const values = new Set(THEME_FONTS.map((font) => font.value));
        const pairs = PRESET_GROUPS.find((group) => group.id === 'fontPairs')?.presets ?? [];
        const unknown = pairs.flatMap((preset) => Object.entries(preset.design).filter(([, value]) => !values.has(String(value))).map(([id]) => `${preset.id}.${id}`));
        expect(unknown).toEqual([]);
    });

    it('a escala tipográfica muda tamanho, peso e espaçamento dos títulos e do corpo juntos', () => {
        const scales = PRESET_GROUPS.find((group) => group.id === 'typeScale')?.presets ?? [];
        scales.forEach((preset) => {
            const keys = Object.keys(preset.design);
            expect(keys).toEqual(expect.arrayContaining(['h1Size', 'h1Weight', 'h1LetterSpacing', 'bodyLineHeight', 'bodyWeight']));
        });
    });
});
