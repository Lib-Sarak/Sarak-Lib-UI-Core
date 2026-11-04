// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { hexToOklch } from '../color-space';
import { resolvePalette } from '../resolve';
import type { SarakPaletteInput, SarakPaletteMode } from '../types';

/** Secundária clara e acento claro: passam sobre o fundo escuro e reprovam sobre o claro. */
const LIGHT_SEEDS: SarakPaletteInput = { type: 'triadic', base: '#2563eb', secondary: '#e8a6f2', accent: '#f2d27a' };
/** Secundária e acento escuros: o oposto. */
const DARK_SEEDS: SarakPaletteInput = { type: 'triadic', base: '#2563eb', secondary: '#7a1fa0', accent: '#7a5200' };

const TEXT = [
    ['subtitleColor', 'secondary'],
    ['sidebarCategoryColor', 'secondary'],
    ['secondaryColor', 'secondary'],
    ['emphasisColor', 'accent'],
] as const;
/** `secondaryColor` só tem par misturado (40% da cor sobre o texto do corpo), que passa mesmo com a semente reprovando sozinha. */
const ADJUSTED = TEXT.filter(([token]) => token !== 'secondaryColor');
const SMALL = [['chartColorPalette', 'secondary'], ['navActiveMarkerColor', 'accent']] as const;
const MODES: SarakPaletteMode[] = ['light', 'dark'];
const lightnessOf = (hex: string): number => hexToOklch(hex)!.lightness;

describe('as três faixas: a área define o tratamento da cor', () => {
    it.each(MODES)('elemento pequeno (%s): é a semente exata, mesmo quando o texto precisa se ajustar', (mode) => {
        [LIGHT_SEEDS, DARK_SEEDS].forEach((input) => {
            const colors = resolvePalette(input, mode);
            SMALL.forEach(([token, seed]) => expect(colors[token], `${token} ${mode}`).toBe(input[seed]!.toLowerCase()));
        });
    });

    it.each(TEXT)('texto %s (seed %s): no modo em que a semente passa, é igual a ela', (token, seed) => {
        const onDark = resolvePalette(LIGHT_SEEDS, 'dark');
        const onLight = resolvePalette(DARK_SEEDS, 'light');
        expect(onDark[token]).toBe(LIGHT_SEEDS[seed]!.toLowerCase());
        expect(onLight[token]).toBe(DARK_SEEDS[seed]!.toLowerCase());
    });

    it.each(ADJUSTED)('texto %s (seed %s): no modo em que a semente reprova, anda só em luminosidade, na direção do contraste', (token, seed) => {
        const light = hexToOklch(LIGHT_SEEDS[seed]!)!;
        const dark = hexToOklch(DARK_SEEDS[seed]!)!;
        const onLight = hexToOklch(resolvePalette(LIGHT_SEEDS, 'light')[token])!;
        const onDark = hexToOklch(resolvePalette(DARK_SEEDS, 'dark')[token])!;
        expect(onLight.lightness).toBeLessThan(light.lightness);
        expect(onDark.lightness).toBeGreaterThan(dark.lightness);
        expect(Math.abs(onLight.hue - light.hue)).toBeLessThan(12);
        expect(Math.abs(onDark.hue - dark.hue)).toBeLessThan(12);
    });

    it('superfície grande continua tingida: o cabeçalho tem o matiz da secundária e luminosidade extrema', () => {
        MODES.forEach((mode) => {
            const colors = resolvePalette(LIGHT_SEEDS, mode);
            const secondary = hexToOklch(LIGHT_SEEDS.secondary!)!;
            ['cardHeaderBg', 'tableHeaderBg', 'btnSecondaryBg'].forEach((token) => {
                const color = hexToOklch(colors[token])!;
                expect(Math.abs(color.hue - secondary.hue), `${token} ${mode}`).toBeLessThan(25);
                expect(mode === 'light' ? color.lightness : 1 - color.lightness, `${token} ${mode}`).toBeGreaterThan(0.75);
            });
        });
    });

    it('a borda de foco parte do acento e passa em 3:1 sobre o campo, nos dois modos', () => {
        const ratio = (foreground: string, background: string): number => {
            const channels = (hex: string) => [1, 3, 5].map((index) => Number.parseInt(hex.slice(index, index + 2), 16) / 255)
                .map((value) => (value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4));
            const luminance = (hex: string): number => {
                const [red, green, blue] = channels(hex);
                return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
            };
            const [high, low] = [luminance(foreground), luminance(background)].sort((left, right) => right - left);
            return (high + 0.05) / (low + 0.05);
        };
        [LIGHT_SEEDS, DARK_SEEDS].forEach((input) => MODES.forEach((mode) => {
            const colors = resolvePalette(input, mode);
            expect(ratio(colors.inputFocusBorderColor, colors.inputBg), `${mode}`).toBeGreaterThanOrEqual(3);
            expect(lightnessOf(colors.inputFocusBorderColor)).toBeGreaterThan(0);
        }));
    });
});
