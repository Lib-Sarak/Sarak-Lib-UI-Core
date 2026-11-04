// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { sarakGetAllDesignTokens, sarakGetDefaultDesignState } from '../../../master-map';
import { auditTokenContract } from '../../../../Provider/utils/validation';
import { createPalettePlan } from '../../../palette/tone-plan';
import { SARAK_PALETTE_PRESETS } from '../../../palette/presets';
import { evaluatePair } from '../../../../../../gates/scripts/audit/verify_contrast';
import { composeThemeDesign } from '../../themes/compose';
import { PERSONALITIES, getPersonality } from '../personalities';

const TOKENS = new Map(sarakGetAllDesignTokens().map((token) => [token.id, token]));
const DEFAULTS = sarakGetDefaultDesignState() as Record<string, unknown>;
const MODES = ['light', 'dark'] as const;
const TONES = ['neutral', 'surface', 'primary', 'secondary', 'inverse'];
const COLOR_LITERAL = /#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?|oklch|oklab|lab|lch)\(/i;
const MIN_DIFFERENT_TOKENS = 8;

const valueOf = (design: Record<string, unknown>, id: string): unknown => (id in design ? design[id] : DEFAULTS[id]);

const differingTokens = (a: Record<string, unknown>, b: Record<string, unknown>): string[] =>
    [...new Set([...Object.keys(a), ...Object.keys(b)])].filter((id) => JSON.stringify(valueOf(a, id)) !== JSON.stringify(valueOf(b, id)));

const failingPairs = (design: Record<string, unknown>): string[] =>
    createPalettePlan(design).pairs
        .map((pair) => evaluatePair(pair, design))
        .filter((result) => !result.pulado && !result.pass)
        .map((result) => `${result.pair.fg} sobre ${result.pair.bgChain.join('>')}`);

describe('Personalidades — o conjunto', () => {
    it('são dez, com id único e prefixo próprio', () => {
        expect(PERSONALITIES).toHaveLength(10);
        const ids = PERSONALITIES.map((personality) => personality.id);
        expect(new Set(ids).size).toBe(ids.length);
        expect(ids.filter((id) => !id.startsWith('personality-'))).toEqual([]);
        expect(getPersonality('personality-glass')?.name).toBe('Vidro');
        expect(getPersonality('nao-existe')).toBeUndefined();
    });

    it('nascem dos grupos do registro: cada parte existe, e o design contém o que a parte escreve', () => {
        PERSONALITIES.forEach((personality) => {
            expect(personality.parts.length, personality.id).toBeGreaterThanOrEqual(8);
            expect(Object.keys(personality.design).length, personality.id).toBeGreaterThan(30);
        });
    });

    it('só tokens que existem, com valor dentro do contrato do próprio token', () => {
        const unknown = PERSONALITIES.flatMap((personality) => Object.keys(personality.design).filter((id) => !TOKENS.has(id)).map((id) => `${personality.id}.${id}`));
        expect(unknown).toEqual([]);
        const drift = PERSONALITIES.flatMap((personality) => auditTokenContract(personality.id, personality.design as Record<string, unknown>));
        expect(drift).toEqual([]);
    });

    it('as palavras de busca existem, são curtas e sem repetição', () => {
        const bad = PERSONALITIES.filter((personality) => !personality.keywords || personality.keywords.length === 0
            || personality.keywords.some((word) => word.length > 24) || new Set(personality.keywords).size !== personality.keywords.length);
        expect(bad.map((personality) => personality.id)).toEqual([]);
    });

    it('nenhuma marca, setor ou cliente no nome, na descrição nem nas palavras de busca (zero-marca)', () => {
        const text = PERSONALITIES.map((personality) => [personality.name, personality.description, ...(personality.keywords ?? [])].join(' ')).join(' ');
        expect(text).not.toMatch(/sarak|earendel/i);
    });
});

describe('Personalidades — distintas entre si', () => {
    it(`todo par difere em ao menos ${MIN_DIFFERENT_TOKENS} tokens de estrutura`, () => {
        const close: string[] = [];
        PERSONALITIES.forEach((a, index) => PERSONALITIES.slice(index + 1).forEach((b) => {
            const diff = differingTokens(a.design, b.design);
            if (diff.length < MIN_DIFFERENT_TOKENS) close.push(`${a.id} ~ ${b.id} (${diff.length})`);
        }));
        expect(close).toEqual([]);
    });

    it('cada uma cobre forma, fontes, densidade, barras, tabela, movimento e ícones', () => {
        const AREAS: Record<string, string[]> = {
            shape: ['borderRadius', 'cardBorderRadius', 'btnBorderRadius'],
            fonts: ['headingFont', 'bodyFont'],
            density: ['layoutDensity', 'layoutPadding'],
            bars: ['sidebarTone', 'topbarTone', 'sidebarActiveItemStyle', 'topbarActiveItemStyle'],
            table: ['tableDensity', 'tableZebraStriping', 'tableCellPadding'],
            motion: ['motionDurationFast', 'motionDurationNormal'],
            icons: ['iconFamily', 'iconWeight'],
        };
        const missing = PERSONALITIES.flatMap((personality) => Object.entries(AREAS)
            .filter(([, ids]) => !ids.every((id) => id in personality.design))
            .map(([area]) => `${personality.id}: ${area}`));
        expect(missing).toEqual([]);
    });
});

describe('Personalidades — nenhuma cor, a paleta fica', () => {
    it('não escrevem token de cor nem literal de cor em valor de texto', () => {
        const withColor = PERSONALITIES.filter((personality) => Object.entries(personality.design)
            .some(([id, value]) => TOKENS.get(id)?.type === 'color' || (typeof value === 'string' && COLOR_LITERAL.test(value))));
        expect(withColor.map((personality) => personality.id)).toEqual([]);
    });

    it('não escrevem a paleta nem o modo: trocar de Personalidade não muda `colorPalette`', () => {
        PERSONALITIES.forEach((personality) => {
            expect('colorPalette' in personality.design, personality.id).toBe(false);
            expect('mode' in personality.design, personality.id).toBe(false);
        });
        const draft: Record<string, unknown> = { colorPalette: 'oceano', mode: 'light' };
        PERSONALITIES.forEach((personality) => {
            const next = { ...draft, ...personality.design };
            expect(next.colorPalette).toBe('oceano');
            expect(next.mode).toBe('light');
        });
    });
});

describe('Personalidades — as barras', () => {
    it('toda uma declara o tom das duas barras, a posição da marca e a orientação, sem cor de barra', () => {
        PERSONALITIES.forEach((personality) => {
            const design = personality.design as Record<string, unknown>;
            expect(TONES, `${personality.id}.sidebarTone`).toContain(design.sidebarTone);
            expect(TONES, `${personality.id}.topbarTone`).toContain(design.topbarTone);
            expect(['top', 'bottom'], `${personality.id}.sidebarLogoPlacement`).toContain(design.sidebarLogoPlacement);
            expect(['sidebar', 'topbar'], `${personality.id}.navigationStyle`).toContain(design.navigationStyle);
            expect('sidebarColor' in design, `${personality.id}.sidebarColor`).toBe(false);
            expect('topbarColor' in design, `${personality.id}.topbarColor`).toBe(false);
        });
    });

    it('os cinco tons aparecem no conjunto, e `neutral` só onde é o caráter (no máximo duas)', () => {
        const used = new Set(PERSONALITIES.flatMap((personality) => [personality.design.sidebarTone, personality.design.topbarTone]));
        expect([...used].sort()).toEqual([...TONES].sort());
        const neutral = PERSONALITIES.filter((personality) => personality.design.sidebarTone === 'neutral' && personality.design.topbarTone === 'neutral');
        expect(neutral.length).toBeLessThanOrEqual(2);
    });

    it('as duas orientações e as duas posições da marca aparecem no conjunto', () => {
        expect(new Set(PERSONALITIES.map((personality) => personality.design.navigationStyle))).toEqual(new Set(['sidebar', 'topbar']));
        expect(new Set(PERSONALITIES.map((personality) => personality.design.sidebarLogoPlacement))).toEqual(new Set(['top', 'bottom']));
    });
});

describe('Personalidades — legíveis em toda paleta, nos dois modos', () => {
    const palettes = Object.keys(SARAK_PALETTE_PRESETS);

    it.each(PERSONALITIES.map((personality) => [personality.id, personality] as const))('%s', (_id, personality) => {
        const broken = palettes.flatMap((palette) => MODES.flatMap((mode) => {
            const base = composeThemeDesign({ colorPalette: palette, mode }) as unknown as Record<string, unknown>;
            const baseline = new Set(failingPairs(base));
            const applied = composeThemeDesign({ colorPalette: palette, mode, ...personality.design }) as unknown as Record<string, unknown>;
            return failingPairs(applied).filter((pair) => !baseline.has(pair)).map((pair) => `${palette} (${mode}): ${pair}`);
        }));
        expect(broken).toEqual([]);
    }, 120_000);
});
