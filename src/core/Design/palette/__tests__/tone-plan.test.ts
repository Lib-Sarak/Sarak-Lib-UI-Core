// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { sarakGetDefaultDesignState } from '../../master-map';
import { evaluatePair } from '../../../../../gates/scripts/audit/verify_contrast';
import { PAIRS } from '../contrast-pairs';
import { SARAK_PALETTE_PRESETS } from '../presets';
import { resolvePalette } from '../resolve';
import { createPalettePlan, DEFAULT_PALETTE_PLAN } from '../tone-plan';
import type { SarakPaletteMode } from '../types';

const TONES = ['neutral', 'surface', 'primary', 'secondary', 'inverse'] as const;
const MODES: SarakPaletteMode[] = ['light', 'dark'];
const PRESET_IDS = Object.keys(SARAK_PALETTE_PRESETS);

const failuresOf = (colors: Record<string, string>, declared: Record<string, unknown>): string[] => {
    const design = { ...sarakGetDefaultDesignState(), ...colors };
    return createPalettePlan(declared).pairs
        .filter((pair) => pair.bgChain.some((token) => /^(sidebar|topbar)(Hover|Active)?Color/.test(token)))
        .flatMap((pair) => {
            const result = evaluatePair(pair, design);
            return result.pulado || !result.pass ? [`${pair.fg} → ${pair.bgChain.join(' → ')}`] : [];
        });
};

describe('papel de cor da barra — tom neutral', () => {
    it('não muda a saída: o plano é o de sempre e a paleta é idêntica à calculada sem papel', () => {
        expect(createPalettePlan({ sidebarTone: 'neutral', topbarTone: 'neutral' })).toBe(DEFAULT_PALETTE_PLAN);
        expect(createPalettePlan({})).toBe(DEFAULT_PALETTE_PLAN);
        expect(createPalettePlan({ sidebarTone: 'tinta' })).toBe(DEFAULT_PALETTE_PLAN);
        for (const id of PRESET_IDS) {
            for (const mode of MODES) {
                const withoutTone = resolvePalette(SARAK_PALETTE_PRESETS[id], mode, {});
                const withNeutral = resolvePalette(SARAK_PALETTE_PRESETS[id], mode, { sidebarTone: 'neutral', topbarTone: 'neutral' });
                expect(withNeutral, `${id} ${mode}`).toEqual(withoutTone);
            }
        }
    });
});

describe.each(TONES)('papel de cor da barra — tom %s', (tone) => {
    it(`todos os pares da barra passam nas ${PRESET_IDS.length} paletas, nos dois modos (sidebarTone e topbarTone)`, () => {
        const declared = { sidebarTone: tone, topbarTone: tone };
        for (const id of PRESET_IDS) {
            for (const mode of MODES) {
                const colors = resolvePalette(SARAK_PALETTE_PRESETS[id], mode, declared);
                expect(failuresOf(colors, declared), `${id} ${mode}`).toEqual([]);
            }
        }
    });
});

describe('papel de cor da barra — o que cada tom faz', () => {
    const colorOf = (tone: string, mode: SarakPaletteMode, token: string): string =>
        resolvePalette(SARAK_PALETTE_PRESETS[PRESET_IDS[0]], mode, { sidebarTone: tone })[token];

    it('cada tom pinta um fundo diferente da lateral', () => {
        for (const mode of MODES) {
            const backgrounds = TONES.map((tone) => colorOf(tone, mode, 'sidebarColor'));
            expect(new Set(backgrounds).size, mode).toBe(TONES.length);
        }
    });

    it('um tom só mexe na barra que o declara', () => {
        const so = resolvePalette(SARAK_PALETTE_PRESETS[PRESET_IDS[0]], 'light', { sidebarTone: 'primary' });
        const sem = resolvePalette(SARAK_PALETTE_PRESETS[PRESET_IDS[0]], 'light', {});
        expect(so.topbarColor).toBe(sem.topbarColor);
        expect(so.topbarItemTextColor).toBe(sem.topbarItemTextColor);
        expect(so.sidebarColor).not.toBe(sem.sidebarColor);
    });

    it('o tom contrastante inverte o texto em relação ao corpo; o texto do corpo não é o da barra', () => {
        const primary = resolvePalette(SARAK_PALETTE_PRESETS[PRESET_IDS[0]], 'light', { sidebarTone: 'primary' });
        const neutral = resolvePalette(SARAK_PALETTE_PRESETS[PRESET_IDS[0]], 'light', {});
        expect(primary.textColorMaster).toBe(neutral.textColorMaster);
        expect(primary.sidebarItemTextColor).not.toBe(neutral.sidebarItemTextColor);
    });

    it('o par do texto do corpo sobre a barra deixa de valer só nos tons contrastantes', () => {
        const bodyOverSidebar = (declared: Record<string, unknown>): boolean => createPalettePlan(declared).pairs
            .some((pair) => pair.fg === 'textColorMaster' && pair.bgChain[0] === 'sidebarColor');
        expect(PAIRS.some((pair) => pair.fg === 'textColorMaster' && pair.bgChain[0] === 'sidebarColor')).toBe(true);
        expect(bodyOverSidebar({ sidebarTone: 'surface' })).toBe(true);
        expect(bodyOverSidebar({ sidebarTone: 'primary' })).toBe(false);
        expect(bodyOverSidebar({ sidebarTone: 'secondary' })).toBe(false);
        expect(bodyOverSidebar({ sidebarTone: 'inverse' })).toBe(false);
    });

    it('uma cor declarada em sidebarColor continua vencendo o papel', () => {
        const declared = { sidebarTone: 'primary', sidebarColor: '#102030' };
        const colors = resolvePalette(SARAK_PALETTE_PRESETS[PRESET_IDS[0]], 'light', declared);
        expect(failuresOf({ ...colors, sidebarColor: '#102030' }, declared)).toEqual([]);
    });
});

describe('papel de cor da barra — o teste não é vazio', () => {
    it.each(['primary', 'secondary', 'inverse', 'surface'] as const)('o tom %s tem pares próprios da barra a conferir', (tone) => {
        const barPairs = createPalettePlan({ sidebarTone: tone, topbarTone: tone }).pairs
            .filter((pair) => pair.bgChain.some((token) => /^(sidebar|topbar)(Hover|Active)?Color/.test(token)));
        expect(barPairs.length).toBeGreaterThanOrEqual(10);
    });
});

describe('papel de cor — o host vence o padrão que o tema declara', () => {
    it('sidebarTone do host vale mesmo com o tema declarando neutral', async () => {
        const { resolvePaletteForDesign } = await import('../resolve');
        const themed = resolvePaletteForDesign({ colorPalette: 'oceano', sidebarTone: 'neutral' }, { sidebarTone: 'primary' }, 'light');
        const neutral = resolvePaletteForDesign({ colorPalette: 'oceano', sidebarTone: 'neutral' }, {}, 'light');
        expect(themed.sidebarColor).not.toBe(neutral.sidebarColor);
    });
});
