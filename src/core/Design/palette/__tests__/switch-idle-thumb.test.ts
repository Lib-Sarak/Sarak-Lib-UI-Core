// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { resolveSwitchStyles, type SwitchStyleType } from '../../../../components/atomic/hooks/switchStyles';
import type { SarakThemePayload } from '../../../Provider/types';
import { SARAK_PALETTE_PRESETS } from '../presets';
import { resolvePalette } from '../resolve';
import type { SarakPaletteMode } from '../types';

import { prazoDeTeste } from '../../../../shared/testing/prazoDeTeste';
const MODES: SarakPaletteMode[] = ['light', 'dark'];
const STYLES: SwitchStyleType[] = ['tactile', 'asymmetric', 'pulsing', 'glass'];
/** Controle de interface: 3:1 entre a bolinha e o trilho desligado, e entre o trilho e o fundo onde o interruptor fica. */
const MIN_CONTROL_CONTRAST = 3;
const IDLE_SHARE = 0.5;
const SURFACES = ['colorBgBody', 'cardBackgroundColor', 'colorBgLayer1', 'surfaceColor'] as const;

type Rgb = [number, number, number];
const toRgb = (hex: string): Rgb => [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16)) as Rgb;
const mix = (top: Rgb, share: number, base: Rgb): Rgb => top.map((value, index) => value * share + base[index] * (1 - share)) as Rgb;
const luminance = (rgb: Rgb): number => {
    const [red, green, blue] = rgb.map((value) => {
        const unit = value / 255;
        return unit <= 0.03928 ? unit / 12.92 : ((unit + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
};
const ratio = (first: Rgb, second: Rgb): number => {
    const [light, dark] = [luminance(first), luminance(second)].sort((a, b) => b - a);
    return (light + 0.05) / (dark + 0.05);
};

describe('interruptor desligado — a bolinha e o trilho', () => {
    it('todo estilo usa o trilho de metade texto e metade cartão e a bolinha opaca quando desligado', () => {
        STYLES.forEach((style) => {
            const { trackStyle, thumbStyle } = resolveSwitchStyles({ switchStyleType: style } as SarakThemePayload, false);
            expect(trackStyle.backgroundColor).toContain('color-mix(in srgb, var(--sarak-text-main');
            expect(trackStyle.backgroundColor).toContain('50%');
            expect(thumbStyle.backgroundColor).toBe('var(--sarak-switch-thumb, #ffffff)');
        });
    });

    it('a bolinha tem 3:1 contra o trilho desligado e o trilho tem 3:1 contra o fundo: 4 estilos × 2 modos × 78 paletas', { timeout: prazoDeTeste(60_000) }, () => {
        const failures: string[] = [];
        let minThumb = Infinity;
        let minTrack = Infinity;
        Object.entries(SARAK_PALETTE_PRESETS).forEach(([id, preset]) => MODES.forEach((mode) => {
            const colors = resolvePalette(preset, mode) as Record<string, string>;
            const track = mix(toRgb(colors.textColorMaster), IDLE_SHARE, toRgb(colors.cardBackgroundColor));
            STYLES.forEach((style) => {
                const solid = toRgb(colors.switchThumbBg);
                const thumbRatio = ratio(solid, track);
                minThumb = Math.min(minThumb, thumbRatio);
                if (thumbRatio < MIN_CONTROL_CONTRAST) failures.push(`${id} ${mode} ${style} bolinha: ${thumbRatio.toFixed(2)}`);
            });
            SURFACES.forEach((surface) => {
                const trackRatio = ratio(track, toRgb(colors[surface]));
                minTrack = Math.min(minTrack, trackRatio);
                if (trackRatio < MIN_CONTROL_CONTRAST) failures.push(`${id} ${mode} trilho × ${surface}: ${trackRatio.toFixed(2)}`);
            });
        }));
        console.info(`mínimo bolinha×trilho ${minThumb.toFixed(2)}; trilho×fundo ${minTrack.toFixed(2)}`);
        expect(Object.keys(SARAK_PALETTE_PRESETS).length).toBe(78);
        expect(failures).toEqual([]);
    });
});
