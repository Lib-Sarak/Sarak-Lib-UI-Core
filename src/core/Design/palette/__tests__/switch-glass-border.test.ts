// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { SARAK_PALETTE_PRESETS } from '../presets';
import { resolvePalette } from '../resolve';
import type { SarakPaletteMode } from '../types';

const MODES: SarakPaletteMode[] = ['light', 'dark'];
/** A borda opaca do trilho de vidro ligado é a cor ativa do interruptor; ela precisa de 3:1 (controle de interface) com a superfície onde o interruptor fica. */
const MIN_CONTROL_CONTRAST = 3;
const SURFACES = ['colorBgBody', 'cardBackgroundColor', 'colorBgLayer1', 'surfaceColor'] as const;

const luminance = (hex: string): number => {
    const [red, green, blue] = [1, 3, 5].map((start) => {
        const unit = parseInt(hex.slice(start, start + 2), 16) / 255;
        return unit <= 0.03928 ? unit / 12.92 : ((unit + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
};

const ratio = (first: string, second: string): number => {
    const [light, dark] = [luminance(first), luminance(second)].sort((a, b) => b - a);
    return (light + 0.05) / (dark + 0.05);
};

describe('trilho do interruptor de vidro — a borda na cor ativa', () => {
    it('a cor ativa (a base exata da paleta) passa de 3:1 sobre cada superfície, nas 78 paletas e nos dois modos', () => {
        const failures: string[] = [];
        Object.entries(SARAK_PALETTE_PRESETS).forEach(([id, preset]) => MODES.forEach((mode) => {
            const colors = resolvePalette(preset, mode) as Record<string, string>;
            SURFACES.forEach((surface) => {
                const value = ratio(colors.switchTrackActiveBg, colors[surface]);
                if (value < MIN_CONTROL_CONTRAST) failures.push(`${id} ${mode} ${surface}: ${value.toFixed(2)}`);
            });
        }));
        expect(Object.keys(SARAK_PALETTE_PRESETS).length).toBe(78);
        expect(failures).toEqual([]);
    });

    it('o trilho ligado é a base exata da primária: a borda mostra a cor da paleta, sem deslocamento', () => {
        Object.values(SARAK_PALETTE_PRESETS).forEach((preset) => MODES.forEach((mode) => {
            const colors = resolvePalette(preset, mode) as Record<string, string>;
            expect(colors.switchTrackActiveBg).toBe(colors.btnPrimaryBg);
        }));
    });
});
