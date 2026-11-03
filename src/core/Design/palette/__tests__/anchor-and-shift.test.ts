// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { hexToOklch, oklchToHex } from '../color-space';
import { SHIFT_STEP } from '../contrast-shift';
import { SARAK_PALETTE_PRESETS } from '../presets';
import { resolvePalette } from '../resolve';
import type { SarakPaletteMode, SarakPaletteType } from '../types';

const ANCHORED = ['btnPrimaryBg', 'rangeActiveColor', 'switchTrackActiveBg', 'checkboxActiveColor'];
const SHIFTED = ['primaryColor', 'navItemActiveColor', 'titleColor', 'cardTitleColor'];
const MODES: SarakPaletteMode[] = ['light', 'dark'];
const TYPES: SarakPaletteType[] = ['monochromatic', 'analogous', 'complementary', 'split-complementary', 'triadic'];
const BASES = ['#3a2a78', '#2563eb', '#19e3f0', '#8a8f94', '#e0115f', '#f2c4d0', '#ffd400', '#007a49'];

const lightnessOf = (hex: string): number => hexToOklch(hex)!.lightness;

const luminance = (hex: string): number => {
    const [red, green, blue] = [1, 3, 5]
        .map((index) => Number.parseInt(hex.slice(index, index + 2), 16) / 255)
        .map((value) => (value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4));
    return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
};

const ratio = (foreground: string, background: string): number => {
    const [high, low] = [luminance(foreground), luminance(background)].sort((left, right) => right - left);
    return (high + 0.05) / (low + 0.05);
};

describe('âncora: a cor da marca é a mesma nos dois modos', () => {
    it.each(BASES)('o preenchimento de %s é a base exata, em qualquer tipo e modo', (base) => {
        TYPES.forEach((type) => MODES.forEach((mode) => {
            const colors = resolvePalette({ type, base }, mode);
            ANCHORED.forEach((token) => expect(colors[token], `${type} ${mode} ${token}`).toBe(base.toLowerCase()));
        }));
    });

    it('todo preset ancora o preenchimento nos dois modos', () => {
        Object.entries(SARAK_PALETTE_PRESETS).forEach(([id, preset]) => MODES.forEach((mode) => {
            const colors = resolvePalette(preset, mode);
            ANCHORED.forEach((token) => expect(colors[token], `${id} ${mode} ${token}`).toBe(preset.base.toLowerCase()));
        }));
    });
});

describe('deslocamento mínimo do texto da marca', () => {
    it('a base que já passa sai igual a ela', () => {
        const base = '#a33a5c';
        expect(resolvePalette({ type: 'analogous', base }, 'light').primaryColor).toBe(base);
    });

    it('a base que não passa anda só em luminosidade, na direção do contraste, com o mesmo matiz', () => {
        const base = '#19e3f0';
        const origin = hexToOklch(base)!;
        const moved = hexToOklch(resolvePalette({ type: 'analogous', base }, 'light').primaryColor)!;
        expect(moved.lightness).toBeLessThan(origin.lightness);
        expect(Math.abs(moved.hue - origin.hue)).toBeLessThan(8);
    });

    it('o deslocamento é o menor que passa: voltar 4 passos da busca reprova um dos pares', () => {
        const base = '#19e3f0';
        const origin = hexToOklch(base)!;
        const colors = resolvePalette({ type: 'analogous', base }, 'light');
        const moved = hexToOklch(colors.primaryColor)!;
        const surfaces = ['colorBgBody', 'cardBackgroundColor'];
        expect(origin.lightness - moved.lightness).toBeGreaterThan(0);
        surfaces.forEach((token) => expect(ratio(colors.primaryColor, colors[token])).toBeGreaterThanOrEqual(4.5));
        const closer = oklchToHex({ ...moved, lightness: moved.lightness + 4 * SHIFT_STEP });
        expect(Math.min(...surfaces.map((token) => ratio(closer, colors[token])))).toBeLessThan(4.5);
    });

    it('o texto sobre o botão passa em 4,5 e vai para o lado de maior contraste', () => {
        BASES.forEach((base) => MODES.forEach((mode) => {
            const colors = resolvePalette({ type: 'analogous', base }, mode);
            expect(ratio(colors.btnPrimaryText, colors.btnPrimaryBg), `${base} ${mode}`).toBeGreaterThanOrEqual(4.5);
        }));
        const dark = resolvePalette({ type: 'analogous', base: '#ffd400' }, 'light');
        const light = resolvePalette({ type: 'analogous', base: '#3a2a78' }, 'light');
        expect(lightnessOf(dark.btnPrimaryText)).toBeLessThan(0.3);
        expect(lightnessOf(light.btnPrimaryText)).toBeGreaterThan(0.9);
    });
});

describe('fundo tingido', () => {
    const rows = Object.entries(SARAK_PALETTE_PRESETS).flatMap(([id, preset]) => MODES.map((mode) => ({
        id, mode, colors: resolvePalette(preset, mode),
    })));

    it.each(rows)('$id/$mode: o corpo tem croma 0,012-0,030 e luminosidade na faixa do modo', ({ colors, mode }) => {
        const body = hexToOklch(colors.colorBgBody)!;
        expect(body.chroma).toBeGreaterThanOrEqual(0.012);
        expect(body.chroma).toBeLessThanOrEqual(0.03);
        const [min, max] = mode === 'light' ? [0.95, 0.97] : [0.16, 0.19];
        expect(body.lightness).toBeGreaterThanOrEqual(min);
        expect(body.lightness).toBeLessThanOrEqual(max);
    });

    it.each(rows)('$id/$mode: as camadas também são tingidas e diferem do corpo em ao menos 0,03', ({ colors }) => {
        const [body, layer1, layer2] = ['colorBgBody', 'colorBgLayer1', 'colorBgLayer2'].map((token) => hexToOklch(colors[token])!);
        [layer1, layer2].forEach((layer) => {
            expect(layer.chroma).toBeGreaterThanOrEqual(0.012);
            expect(layer.chroma).toBeLessThanOrEqual(0.03);
        });
        expect(Math.abs(layer1.lightness - body.lightness)).toBeGreaterThanOrEqual(0.03);
        expect(Math.abs(layer2.lightness - layer1.lightness)).toBeGreaterThanOrEqual(0.03);
    });

    it('o fundo leva o matiz da base', () => {
        const base = hexToOklch('#2563eb')!;
        const body = hexToOklch(resolvePalette({ type: 'analogous', base: '#2563eb' }, 'light').colorBgBody)!;
        expect(Math.abs(body.hue - base.hue)).toBeLessThan(15);
    });
});

describe('texto da marca nos presets de base média', () => {
    const BAND = { min: 0.5, max: 0.62 };
    const MAX_SHIFT = 0.04;
    const MAX_TITLE_SHIFT = 0.06;
    const MAX_NAV_SHIFT = 0.13;
    /** Os vivos: base clara de propósito (o brilho é a identidade), então o texto deles anda mais. */
    const VIVID = ['ciano-violeta', 'ciano-azul', 'verde-neon', 'azul-projeto', 'amarelo-contraste', 'ambar-industrial'];
    const inBand = Object.entries(SARAK_PALETTE_PRESETS).filter(([, preset]) => {
        const lightness = lightnessOf(preset.base);
        return lightness >= BAND.min && lightness <= BAND.max;
    });

    it('ao menos dez presets têm base média e o texto da marca anda até 0,04 (título 0,06, item ativo 0,13) em cada modo', () => {
        expect(inBand.length).toBeGreaterThanOrEqual(10);
        inBand.forEach(([id, preset]) => MODES.forEach((mode) => {
            const colors = resolvePalette(preset, mode);
            const moved = (token: string): number => Math.abs(lightnessOf(colors[token]) - lightnessOf(preset.base));
            ['primaryColor', 'cardTitleColor'].forEach((token) => expect(moved(token), `${id} ${mode} ${token}`).toBeLessThanOrEqual(MAX_SHIFT + 1e-9));
            expect(moved('titleColor'), `${id} ${mode} titleColor`).toBeLessThanOrEqual(MAX_TITLE_SHIFT);
            expect(moved('navItemActiveColor'), `${id} ${mode} navItemActiveColor`).toBeLessThanOrEqual(MAX_NAV_SHIFT);
        }));
    });

    it('os presets fora da faixa são exatamente os vivos nomeados', () => {
        const outside = Object.keys(SARAK_PALETTE_PRESETS).filter((id) => !inBand.some(([bandId]) => bandId === id));
        expect([...outside].sort()).toEqual([...VIVID].sort());
    });

    it('todo papel deslocado conserva o matiz da base quando a base tem croma', () => {
        Object.entries(SARAK_PALETTE_PRESETS).filter(([, preset]) => hexToOklch(preset.base)!.chroma > 0.1).forEach(([id, preset]) => {
            const origin = hexToOklch(preset.base)!;
            MODES.forEach((mode) => {
                // A paleta sai uma vez por preset e modo, não uma vez por papel.
                const colors = resolvePalette(preset, mode);
                SHIFTED.forEach((token) => {
                    const moved = hexToOklch(colors[token])!;
                    const gap = Math.min(Math.abs(moved.hue - origin.hue), 360 - Math.abs(moved.hue - origin.hue));
                    expect(gap, `${id} ${mode} ${token}`).toBeLessThan(12);
                });
            });
        });
    });
});
