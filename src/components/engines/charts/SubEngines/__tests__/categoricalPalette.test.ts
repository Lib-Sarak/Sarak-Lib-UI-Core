import { describe, expect, it } from 'vitest';
import { SARAK_ALL_THEMES } from '../../../../../core/Design/presets/themes/all';
import { resolveThemeForMode } from '../../../../../core/Design/presets/themes/color-engine';
import type { ModeResolvableTheme } from '../../../../../core/Design/presets/themes/color-engine';
import { parseToRgba } from '../../../../../core/Provider/utils/color-engine';
import { deriveCategoricalPalette, PALETTE_SIZE } from '../categoricalPalette';
import type { PaletteMode } from '../categoricalPalette';
import { contrastRatio, deltaE, hexToRgb, rgbToHex, rgbToOklch } from '../oklch';

/**
 * Os mesmos critérios computáveis do validador da skill `dataviz`
 * (`validate_palette.js`): faixa de luminosidade por modo, piso de croma, separação
 * entre vizinhas sob visão normal e sob protanopia/deuteranopia, e contraste.
 */
const BAND: Record<PaletteMode, readonly [number, number]> = { light: [0.43, 0.77], dark: [0.48, 0.67] };
const CHROMA_FLOOR = 0.10;
const CVD_TARGET = 8;
const NORMAL_FLOOR = 15;
// Abaixo de 3:1 o validador reporta ALÍVIO (rótulo visível ou tabela), não reprovação: sobre uma
// superfície de luminosidade média (o cianótipo do `blueprint-protocol` escuro) 3:1 pode não caber
// na faixa. A derivação busca 3:1 primeiro e só então relaxa; o piso aceito é este.
const MIN_CONTRAST = 2;
const STATUS_SAMPLE = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

function toHex(value: unknown): string {
    const { r, g, b } = parseToRgba(String(value));
    return rgbToHex([r / 255, g / 255, b / 255]);
}

function expectValid(palette: string[], mode: PaletteMode, surface: string, label: string): void {
    expect(palette, label).toHaveLength(PALETTE_SIZE);
    palette.forEach((hex, index) => {
        const { L, C } = rgbToOklch(hexToRgb(hex) ?? [0, 0, 0]);
        expect(hex, `${label} #${index}`).toMatch(/^#[0-9a-f]{6}$/);
        expect(L, `${label} #${index} L`).toBeGreaterThanOrEqual(BAND[mode][0] - 0.005);
        expect(L, `${label} #${index} L`).toBeLessThanOrEqual(BAND[mode][1] + 0.005);
        expect(C, `${label} #${index} C`).toBeGreaterThanOrEqual(CHROMA_FLOOR);
        expect(contrastRatio(hex, surface), `${label} #${index} contraste`).toBeGreaterThanOrEqual(MIN_CONTRAST);
    });
    for (let i = 1; i < palette.length; i++) {
        const cvd = Math.min(deltaE(palette[i], palette[i - 1], 'protan'), deltaE(palette[i], palette[i - 1], 'deutan'));
        expect(deltaE(palette[i], palette[i - 1]), `${label} #${i - 1}↔#${i} normal`).toBeGreaterThanOrEqual(NORMAL_FLOOR);
        expect(cvd, `${label} #${i - 1}↔#${i} CVD`).toBeGreaterThanOrEqual(CVD_TARGET);
    }
}

describe('deriveCategoricalPalette', () => {
    it('devolve 8 cores hex que cumprem os critérios do validador, nos dois modos', () => {
        const brand = ['#2a78d6', '#eb6834', '#1baf7a', '#8a6cc2'];

        expectValid(deriveCategoricalPalette({ brand, mode: 'light', surface: '#fcfcfb' }), 'light', '#fcfcfb', 'claro');
        expectValid(deriveCategoricalPalette({ brand, mode: 'dark', surface: '#1a1a19' }), 'dark', '#1a1a19', 'escuro');
    });

    it('mantém a cor de marca que já cumpre os critérios, intacta, na primeira série', () => {
        const [first] = deriveCategoricalPalette({
            brand: ['#2a78d6', '#eb6834', '#1baf7a', '#8a6cc2'], mode: 'light', surface: '#fcfcfb',
        });

        expect(first).toBe('#2a78d6');
    });

    it('é determinística: a mesma entrada dá a mesma paleta', () => {
        const input = { brand: ['#00f2ff', '#7c5cff', '#ff4fd8', '#f9f871'], mode: 'dark' as const, surface: '#06080d' };

        expect(deriveCategoricalPalette(input)).toEqual(deriveCategoricalPalette(input));
    });

    it('nenhuma cor de status entra: cada série vem da marca ou de uma variação dela', () => {
        const palette = deriveCategoricalPalette({
            brand: ['#2a78d6', '#8a6cc2', '#c98a1c', '#4a3f9a'], mode: 'light', surface: '#ffffff',
        });

        for (const status of STATUS_SAMPLE) {
            expect(palette).not.toContain(status);
        }
    });

    it('marca neutra (cinza) ganha croma e continua separável', () => {
        const palette = deriveCategoricalPalette({
            brand: ['#111827', '#4b5563', '#2563eb', '#6b7280'], mode: 'light', surface: '#f9fafb',
        });

        expectValid(palette, 'light', '#f9fafb', 'neutro');
    });

    it('marcas quase iguais são afastadas até separar', () => {
        const palette = deriveCategoricalPalette({
            brand: ['#3b82f6', '#3b83f6', '#3a82f5', '#3c82f7'], mode: 'dark', surface: '#0b0f17',
        });

        expectValid(palette, 'dark', '#0b0f17', 'iguais');
    });

    it('entrada inválida cai nas cores de reserva sem lançar', () => {
        const palette = deriveCategoricalPalette({ brand: ['nada', '', 'zzz'], mode: 'dark', surface: '#000000' });

        expect(palette).toHaveLength(PALETTE_SIZE);
    });
});

describe('temas embarcados', () => {
    const modes: PaletteMode[] = ['dark', 'light'];

    for (const theme of SARAK_ALL_THEMES) {
        for (const mode of modes) {
            it(`${theme.id} (${mode}): a paleta derivada passa nos critérios do validador`, () => {
                const design = resolveThemeForMode(theme as unknown as ModeResolvableTheme, mode);
                const surface = toHex(design.colorBgBody);
                const palette = deriveCategoricalPalette({
                    brand: [design.chartColorPalette, design.secondaryColor, design.accentColor, design.tertiaryColor].map(toHex),
                    mode,
                    surface,
                });

                expectValid(palette, mode, surface, `${theme.id}/${mode}`);
            });
        }
    }
});
