import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import * as HookModule from '../useDesignVariables';
import { useDesignVariables } from '../useDesignVariables';
import { BREAKPOINT_TABLET, BREAKPOINT_DESKTOP } from '../../breakpoints';

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
