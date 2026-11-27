import { describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDesignVariables } from '../useDesignVariables';
import { emitSurfaceTint } from '../designVariableHelpers';
import { sarakGetDefaultDesignState } from '../../master-map';
import { SARAK_PALETTE_PRESETS } from '../../palette/presets';
import { resolvePalette } from '../../palette/resolve';
import type { SarakPaletteMode } from '../../palette/types';

import { prazoDeTeste } from '../../../../shared/testing/prazoDeTeste';
const TINT = '--sarak-surface-tint-color';
const FOCUS = '--sarak-surface-neon-color';
const MODES: SarakPaletteMode[] = ['light', 'dark'];

const variablesOf = (mode: SarakPaletteMode, colors: Record<string, string>): Record<string, string> =>
    renderHook(() => useDesignVariables({ ...sarakGetDefaultDesignState(), ...colors, mode })).result.current.variables;

describe('emitSurfaceTint — a tinta do degradê e do brilho neon', () => {
    it('no escuro usa o tom que o texto da primária já usa; no claro, a primária', () => {
        const dark: Record<string, string> = { '--theme-primary': '#008790', '--sarak-nav-active-color': '#40abb4' };
        const light: Record<string, string> = { ...dark };
        emitSurfaceTint(dark, true);
        emitSurfaceTint(light, false);

        expect(dark[TINT]).toBe('#40abb4');
        expect(dark[FOCUS]).toBe('#40abb4');
        expect(light[TINT]).toBe('#008790');
        expect(light[FOCUS]).toBe('rgba(0, 135, 144, 0.4)');
    });

    it('sem o tom do texto, ou sem primária, não inventa cor', () => {
        const noTone: Record<string, string> = { '--theme-primary': '#008790' };
        emitSurfaceTint(noTone, true);
        expect(noTone[TINT]).toBe('#008790');

        const empty: Record<string, string> = {};
        emitSurfaceTint(empty, true);
        expect(empty[TINT]).toBeUndefined();
        expect(empty[FOCUS]).toBeUndefined();
    });

    it('cor que não é literal (var) vira a tinta, mas não ganha o canal de foco', () => {
        const variables: Record<string, string> = { '--theme-primary': 'var(--brand)' };
        emitSurfaceTint(variables, false);

        expect(variables[TINT]).toBe('var(--brand)');
        expect(variables[FOCUS]).toBeUndefined();
    });

    it('nas 78 paletas, a tinta do escuro é mais clara que a base e a do claro é a base exata', { timeout: prazoDeTeste(60_000) }, () => {
        const lightnessOf = (hex: string): number => [1, 3, 5].reduce((sum, start) => sum + parseInt(hex.slice(start, start + 2), 16), 0);
        Object.values(SARAK_PALETTE_PRESETS).forEach((preset) => MODES.forEach((mode) => {
            const colors = resolvePalette(preset, mode) as Record<string, string>;
            const variables = variablesOf(mode, colors);
            if (mode === 'light') {
                expect(variables[TINT]).toBe(variables['--sarak-primary-color']);
                return;
            }
            expect(lightnessOf(variables[TINT])).toBeGreaterThanOrEqual(lightnessOf(variables['--sarak-btn-primary-bg'] ?? colors.btnPrimaryBg));
        }));
    });
});
