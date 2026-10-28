import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import * as HookModule from '../useDesignVariables';
import { useDesignVariables } from '../useDesignVariables';
import { BREAKPOINT_TABLET, BREAKPOINT_DESKTOP } from '../../breakpoints';
import { sarakGetDefaultDesignState } from '../../master-map';
import { sarakSovereignTheme } from '../../presets/themes/sarak-sovereign';
import { composeThemeForMode } from '../../presets/themes/compose';
import { sarakResolvePalette } from '../../palette/resolve';
import { MEDIA_PREDICATE_TABLE } from '../../../Provider/utils/__tests__/mediaPredicateTable';
import { FLUID_MAX_CONTENT_WIDTH, FLUID_MAX_CONTENT_WIDTH_OPTION } from '../../schema/system';

describe('useDesignVariables', () => {
    it('should export the hook correctly', () => {
        expect(HookModule).toBeDefined();
    });
});

describe('useDesignVariables — maxContentWidth fluido', () => {
    it('traduz o valor semântico para CSS e preserva a opção no atributo de estado', () => {
        const { result } = renderHook(() => useDesignVariables({
            ...sarakGetDefaultDesignState(),
            maxContentWidth: FLUID_MAX_CONTENT_WIDTH_OPTION,
        }));

        expect(result.current.variables['--sarak-max-content-width']).toBe(FLUID_MAX_CONTENT_WIDTH);
        expect(result.current.attributes['data-sx-max-content-width']).toBe(FLUID_MAX_CONTENT_WIDTH_OPTION);
    });

    it('mantém o teto explícito em pixels na variável e no atributo', () => {
        const { result } = renderHook(() => useDesignVariables({ maxContentWidth: '1200px' }));

        expect(result.current.variables['--sarak-max-content-width']).toBe('1200px');
        expect(result.current.attributes['data-sx-max-content-width']).toBe('1200px');
    });
});

describe('useDesignVariables — padding explícito por eixo', () => {
    it('emite variáveis verticais e horizontais e mantém o alias legado vertical', () => {
        const { result } = renderHook(() => useDesignVariables({
            ...sarakGetDefaultDesignState(),
            inputPadding: 9,
            inputPaddingHorizontal: 13,
        }));

        expect(result.current.variables['--sarak-input-padding-vertical']).toBe('9px');
        expect(result.current.variables['--sarak-input-padding']).toBe('9px');
        expect(result.current.variables['--sarak-input-padding-horizontal']).toBe('13px');
    });
});

describe('useDesignVariables — dono e resolução da cor de título', () => {
    it('emite o título declarado e mantém a resolução do fallback claro ligada ao texto principal', () => {
        const { result } = renderHook(() => useDesignVariables({
            mode: 'light',
            textColorMaster: '#152033',
            titleColor: '#f2f6fb',
        }));

        expect(result.current.variables['--theme-title']).toBe('#152033');
        expect(result.current.variables['--color-theme-title']).toBe('#152033');
    });

    it('emite os novos papéis de cor através das variáveis pertencentes ao schema', () => {
        const { result } = renderHook(() => useDesignVariables({
            mode: 'dark',
            subtitleColor: '#e5eef7',
            emphasisColor: '#ff4fd8',
        }));

        expect(result.current.variables['--sarak-subtitle-color']).toBe('#e5eef7');
        expect(result.current.variables['--sarak-emphasis-color']).toBe('#ff4fd8');
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
 * PRÓPRIO modo. `btnPrimaryText: '#04121a'` sobre `btnPrimaryBg: '#19e3f0'`
 * (`sarak-sovereign`, modo `dark` nativo) é o caso que o veredito citou.
 */
describe('useDesignVariables — Decisão D: no modo nativo, emitido = escrito', () => {
    it('um tema no seu PRÓPRIO modo emite EXATAMENTE o valor que o autor escreveu', () => {
        // o autor escreve o que NÃO vem da paleta (a sobrescrita); o resto sai dela, composto antes do hook
        const merged = composeThemeForMode(sarakSovereignTheme as never, 'dark') as unknown as Record<string, unknown>;
        const { result } = renderHook(() => useDesignVariables(merged));
        const { variables } = result.current;
        const palette = sarakResolvePalette(String(sarakSovereignTheme.design.colorPalette), 'dark');

        expect(merged.mode).toBe('dark');
        expect(sarakSovereignTheme.design.btnPrimaryText).toBeUndefined();
        expect(variables['--sarak-btn-primary-text']).toBe(palette.btnPrimaryText);
        expect(variables['--sarak-btn-primary-bg']).toBe(palette.btnPrimaryBg);
    });

    it('não muda nenhum outro valor de cor do tema no modo nativo (nada de shift de luminância)', () => {
        const merged = composeThemeForMode(sarakSovereignTheme as never, 'dark') as unknown as Record<string, unknown>;
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

/**
 * 24 leitores de CSS pedem `--theme-texture-color-rgb`. Antes de `textureColor` ganhar
 * `generateVariants`, a variável nunca era emitida e toda textura caía na primária, sem erro.
 */
describe('useDesignVariables — cor de textura chega aos leitores', () => {
    const emit = (design: Record<string, unknown>) =>
        renderHook(() => useDesignVariables({ ...sarakGetDefaultDesignState(), ...design })).result.current.variables;

    it('emite o canal --theme-texture-color-rgb (e o par --sarak-) da cor de textura do tema', () => {
        const variables = emit({ textureColor: '#1f2937', primaryColor: '#00f2ff' });

        expect(variables['--theme-texture-color']).toBe('#1f2937');
        expect(variables['--theme-texture-color-rgb']).toBe('31, 41, 55');
        expect(variables['--sarak-texture-color-rgb']).toBe('31, 41, 55');
        expect(variables['--theme-texture-color-rgb']).not.toBe(variables['--theme-primary-rgb']);
    });
});

describe('useDesignVariables — colorDepth e colorVariation moldam hover e active', () => {
    const hoverActive = (design: Record<string, unknown>) => {
        const { variables } = renderHook(() => useDesignVariables({ ...sarakGetDefaultDesignState(), primaryColor: '#808040', ...design })).result.current;
        return { hover: variables['--theme-primary-hover'], active: variables['--theme-primary-active'] };
    };

    it('o padrão (1 e 1) é o desenho de sempre: hover ×1,1 e active ×0,9', () => {
        expect(hoverActive({ colorDepth: 1, colorVariation: 1 })).toEqual({ hover: '#8d8d46', active: '#73733a' });
    });

    it('colorDepth afasta hover e active da cor base', () => {
        const base = hoverActive({ colorDepth: 1 });
        const deep = hoverActive({ colorDepth: 3 });

        expect(deep.hover).not.toBe(base.hover);
        expect(deep).toEqual({ hover: '#a6a653', active: '#5a5a2d' });
    });

    it('colorVariation abre o matiz entre hover e active', () => {
        const flat = hoverActive({ colorVariation: 1 });
        const varied = hoverActive({ colorVariation: 5 });

        expect(varied.hover).not.toBe(flat.hover);
        expect(varied.active).not.toBe(flat.active);
    });
});
