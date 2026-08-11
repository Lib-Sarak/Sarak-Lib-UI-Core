import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import * as HookModule from '../useDesignVariables';
import { useDesignVariables } from '../useDesignVariables';
import { BREAKPOINT_TABLET, BREAKPOINT_DESKTOP } from '../../breakpoints';
import { getDefaultDesignState } from '../../master-map';
import { sarakSovereignTheme } from '../../presets/themes/sarak-sovereign';

describe('useDesignVariables', () => {
    it('should export the hook correctly', () => {
        expect(HookModule).toBeDefined();
    });
});

/**
 * plan-08 F5 (achado 11) — este é o ÚNICO dos caminhos de responsividade que já lia o
 * token. O teste fixa esse comportamento para que o alinhamento com o detector JS
 * (`DeviceProvider`) tenha os dois lados cobertos, e não só o lado novo.
 */
describe('useDesignVariables — breakpoints como dado (F5)', () => {
    const mediaQueries = (design: Record<string, unknown>): number[] => {
        const { result } = renderHook(() => useDesignVariables(design));
        return [...result.current.responsiveCSS.matchAll(/@media\s*\(min-width:\s*(\d+)px\)/g)].map((m) => Number(m[1]));
    };

    it('sem os tokens no tema, as media-queries usam os limiares canônicos', () => {
        expect(mediaQueries({ mode: 'dark' })).toEqual([BREAKPOINT_TABLET, BREAKPOINT_DESKTOP]);
    });

    it('com os tokens no tema, as media-queries seguem o tema', () => {
        expect(mediaQueries({ mode: 'dark', breakpointTablet: 900, breakpointDesktop: 1400 }))
            .toEqual([900, 1400]);
    });
});

/**
 * Decisão D (plan-24-1 §2.8, veredito §11.2 da plan-24) — critério de aceite:
 * no modo NATIVO do tema, o hook não chama mais `syncThemeWithMode`. Medido
 * antes de D: 1299/1316 valores de cor alterados mesmo com o tema no seu
 * PRÓPRIO modo. `btnPrimaryText: '#000000'` sobre `btnPrimaryBg: '#00f2ff'`
 * (`sarak-sovereign`, modo `dark` nativo) é o caso que o veredito citou.
 */
describe('useDesignVariables — Decisão D: no modo nativo, emitido = escrito', () => {
    it('um tema no seu PRÓPRIO modo emite EXATAMENTE o valor que o autor escreveu', () => {
        const merged = { ...getDefaultDesignState(), ...(sarakSovereignTheme.design as Record<string, unknown>) };
        const { result } = renderHook(() => useDesignVariables(merged));
        const { variables } = result.current;

        expect(merged.mode).toBe('dark');
        expect(sarakSovereignTheme.design.btnPrimaryText).toBe('#000000');
        expect(variables['--sarak-btn-primary-text']).toBe('#000000');
        expect(variables['--sarak-btn-primary-bg']).toBe('#00f2ff');
    });

    it('não muda nenhum outro valor de cor do tema no modo nativo (nada de shift de luminância)', () => {
        const merged = { ...getDefaultDesignState(), ...(sarakSovereignTheme.design as Record<string, unknown>) };
        const { result } = renderHook(() => useDesignVariables(merged));
        const { variables } = result.current;

        expect(variables['--sarak-text-main']).toBe(String(merged.textColorMaster));
        expect(variables['--sarak-color-bg-body']).toBe(String(merged.colorBgBody));
    });
});
