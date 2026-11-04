// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { MASTER_DESIGN_MAP, sarakGetAllDesignTokens, sarakGetDefaultDesignState } from '../../../master-map';
import { auditTokenContract } from '../../../../Provider/utils/validation';
import { TEXTURE_OPTIONS } from '../../../schema/atmosphere';
import { THEME_FONTS } from '../../../schema/typography';
import { ALL_COMPONENT_PRESETS, PRESET_GROUPS, type PresetGroupDef } from '../registry';
import { COVERAGE_GAPS, measurePresetCoverage } from '../coverage';
import { TEXTURE_FAMILIES, textureFamilyOf } from '../textureFamilies';
import { LEGACY_CLOSE_PAIRS, LEGACY_COLOR_PRESET_IDS, PUBLISHED_PRESET_IDS } from './publishedPresets';

const TOKENS = new Map(sarakGetAllDesignTokens().map((token) => [token.id, token]));
const SCHEMA_OF = new Map(MASTER_DESIGN_MAP.components.flatMap((schema) => schema.tokens.map((token) => [token.id, schema.id] as const)));
const DEFAULTS = sarakGetDefaultDesignState() as Record<string, unknown>;

/** Mínimos por grupo; o grupo que fica abaixo tem o motivo no comentário ao lado (menos tokens, menos opções distintas). */
const MIN_COUNT: Record<string, number> = {
    sidebar: 8, topbar: 6, contentWidth: 6, cards: 18, cardTextures: 40, corners: 4, density: 4, shadow: 4, shadowDirection: 5, border: 5,
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

const curated = (): PresetGroupDef[] => PRESET_GROUPS.filter((group) => !group.optionsOfOneToken);

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
