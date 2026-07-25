import { describe, it, expect, vi } from 'vitest';
import { THEME_AXES, findMissingThemeAxes, warnOnIncompleteTheme } from '../themeAxes';
import { SARAK_REFERENCE_THEMES } from '../../presets/themes/reference';
import type { SarakDesignState } from '../../../Provider/types';

describe('Cobertura de eixos de tema (Spec 40.1 — L6)', () => {
    it('um tema só-cor (o ERP_THEMES do v5) é flagrado como incompleto', () => {
        const onlyColor = { primaryColor: '#2563eb', accentColor: '#38bdf8' } as unknown as SarakDesignState;
        const missing = findMissingThemeAxes(onlyColor);
        expect(missing).toContain('font');
        expect(missing).toContain('chrome');
        expect(missing).toContain('radius');
        expect(missing).not.toContain('color');
    });

    it('warnOnIncompleteTheme avisa (sem lançar) e retorna os eixos omitidos', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const missing = warnOnIncompleteTheme({ primaryColor: '#000' }, 'ERP_THEMES');
        expect(warn).toHaveBeenCalledTimes(1);
        expect(missing.length).toBeGreaterThan(0);
        warn.mockRestore();
    });

    it('os temas de referência da lib são COMPLETOS (nenhum eixo omitido)', () => {
        expect(SARAK_REFERENCE_THEMES.length).toBe(2);
        for (const theme of SARAK_REFERENCE_THEMES) {
            expect(findMissingThemeAxes(theme.design), `${theme.id} deveria ser completo`).toEqual([]);
        }
    });

    it('o par de referência difere em modo, cromo e fonte (prova ampla do R5)', () => {
        const [light, dark] = SARAK_REFERENCE_THEMES.map((t) => t.design as Record<string, unknown>);
        expect(light.mode).not.toBe(dark.mode);
        expect(light.navigationStyle).not.toBe(dark.navigationStyle);
        expect(light.headingFont).not.toBe(dark.headingFont);
    });

    it('expõe os 5 eixos conceituais', () => {
        expect(Object.keys(THEME_AXES).sort()).toEqual(['chrome', 'color', 'font', 'radius', 'spacing']);
    });
});
