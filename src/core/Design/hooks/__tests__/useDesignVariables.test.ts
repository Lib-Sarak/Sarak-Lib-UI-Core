import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import * as HookModule from '../useDesignVariables';
import { useDesignVariables } from '../useDesignVariables';
import { BREAKPOINT_TABLET, BREAKPOINT_DESKTOP } from '../../breakpoints';
import { getDefaultDesignState } from '../../master-map';
import { sarakSovereignTheme } from '../../presets/themes/sarak-sovereign';
import { MEDIA_PREDICATE_TABLE } from '../../../Provider/utils/__tests__/mediaPredicateTable';

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

/**
 * A segunda barreira (`isSafeTokenValue`) reconhece a MESMA forma de mídia
 * embutida que `validateDesign` (a primeira), via o predicado importado de
 * `validation.ts`. `globalBackgroundImageUrl` é o único token `image` do
 * schema; `bodyFont` (`type: 'font'`) prova que nenhum outro tipo herdou a
 * leniência.
 */
describe('useDesignVariables — segunda barreira reconhece mídia embutida', () => {
    const PNG_1PX = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

    it('emite mídia embutida `data:` bem-formada sem warn, no token `image`', () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const dataUri = `data:image/png;base64,${PNG_1PX}`;

        const { result } = renderHook(() => useDesignVariables({ mode: 'dark', globalBackgroundImageUrl: dataUri }));

        expect(result.current.variables['--sarak-global-bg-image']).toBe(dataUri);
        expect(warnSpy).not.toHaveBeenCalled();
        warnSpy.mockRestore();
    });

    it('descarta `javascript:` no token `image`, cai no default e avisa', () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        const { result } = renderHook(() => useDesignVariables({ mode: 'dark', globalBackgroundImageUrl: 'javascript:alert(1)' }));

        expect(result.current.variables['--sarak-global-bg-image']).toBe('');
        expect(warnSpy).toHaveBeenCalled();
        warnSpy.mockRestore();
    });

    it('não estende a leniência de mídia a outro tipo de token (`bodyFont`, `type: font`)', () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const dataUri = `data:image/png;base64,${PNG_1PX}`;

        const withoutOverride = renderHook(() => useDesignVariables({ mode: 'dark' })).result.current.variables['--sarak-body-font'];
        const { result } = renderHook(() => useDesignVariables({ mode: 'dark', bodyFont: dataUri }));

        expect(result.current.variables['--sarak-body-font']).toBe(withoutOverride);
        expect(result.current.variables['--sarak-body-font']).not.toBe(dataUri);
        expect(warnSpy).toHaveBeenCalled();
        warnSpy.mockRestore();
    });
});

/**
 * A mesma tabela única de `validation.test.ts` (barreira 1), rodada aqui na
 * barreira 2. Diferente da barreira 1, esta NÃO tem curto-circuito de
 * entrada: `''` chega ao predicado como qualquer outro valor, e — aceito —
 * fica exposto tal como escrito, sem warn.
 */
describe('useDesignVariables — tabela única de mídia', () => {
    it.each(MEDIA_PREDICATE_TABLE.map(({ value, accepted, reason }) => [value, accepted, reason] as const))(
        '%s → %s (%s)',
        (value, accepted) => {
            const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

            const { result } = renderHook(() => useDesignVariables({ mode: 'dark', globalBackgroundImageUrl: value }));

            if (accepted) {
                expect(warnSpy).not.toHaveBeenCalled();
                expect(result.current.variables['--sarak-global-bg-image']).toBe(value);
            } else {
                expect(result.current.variables['--sarak-global-bg-image']).toBe('');
                expect(warnSpy).toHaveBeenCalled();
            }

            warnSpy.mockRestore();
        }
    );
});
