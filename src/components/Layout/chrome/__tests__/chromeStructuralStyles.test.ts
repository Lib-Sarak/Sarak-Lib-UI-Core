import { describe, expect, it } from 'vitest';
import { resolveChromeBackground, resolveChromeContentStyle, resolveChromeSurfaceBorderStyle } from '../chromeStructuralStyles';
import { FLUID_MAX_CONTENT_WIDTH } from '../../../../core/Design/schema/system';

describe('resolveChromeContentStyle', () => {
    it('mantém o padding legado quando a densidade é confortável', () => {
        expect(resolveChromeContentStyle('comfortable', '1440px')).toEqual({
            width: '100%',
            maxWidth: '1440px',
            marginInline: 'auto',
            padding: 'var(--sarak-layout-padding, 16px)',
        });
    });

    it.each([
        ['compact', '0.75'],
        ['spacious', '1.25'],
    ] as const)('escala o respiro da região na densidade %s', (density, scale) => {
        expect(resolveChromeContentStyle(density, '1200px').padding).toBe(
            `calc(var(--sarak-layout-padding, 16px) * ${scale})`,
        );
    });
});

describe('resolveChromeContentStyle — as opções de `maxContentWidth` chegam a `max-width`', () => {
    it.each([
        [FLUID_MAX_CONTENT_WIDTH],
        ['1000px'],
        ['1200px'],
        ['1440px'],
        ['1600px'],
        ['100%'],
    ])('maxContentWidth %s vira exatamente a largura máxima da região de conteúdo', (maxContentWidth) => {
        expect(resolveChromeContentStyle('comfortable', maxContentWidth).maxWidth).toBe(maxContentWidth);
    });
});

describe('moldura e fundo das barras', () => {
    const border = (surface: 'sidebar' | 'topbar' | 'bottom-nav', side: 'edge' | 'all' | 'none', sidebarPosition: 'left' | 'right' | 'floating' = 'left') =>
        resolveChromeSurfaceBorderStyle({
            surface,
            side,
            style: 'solid',
            widthVariable: '--border-width',
            colorVariable: '--border-color',
            sidebarPosition,
        });

    it.each([
        ['sidebar esquerda', border('sidebar', 'edge'), { borderRightWidth: 'var(--border-width, 1px)' }],
        ['sidebar direita', border('sidebar', 'edge', 'right'), { borderLeftWidth: 'var(--border-width, 1px)' }],
        ['sidebar flutuante', border('sidebar', 'edge', 'floating'), { borderTopWidth: 'var(--border-width, 1px)', borderLeftWidth: 'var(--border-width, 1px)' }],
        ['barra superior', border('topbar', 'edge'), { borderBottomWidth: 'var(--border-width, 1px)' }],
        ['barra inferior', border('bottom-nav', 'edge'), { borderTopWidth: 'var(--border-width, 1px)' }],
    ] as const)('%s escolhe os lados da moldura', (_label, style, expected) => {
        expect(style).toMatchObject(expected);
    });

    it('none remove as quatro bordas e o gradiente preserva o fundo por token', () => {
        const noBorder = border('topbar', 'none');
        expect(noBorder).toMatchObject({ borderTopWidth: '0px', borderRightWidth: '0px', borderBottomWidth: '0px', borderLeftWidth: '0px' });
        expect(resolveChromeBackground('gradient', '--topbar-bg', '#101010')).toContain('linear-gradient(135deg, var(--topbar-bg, #101010)');
        expect(resolveChromeBackground('texture', '--topbar-bg', '#101010')).toBe('var(--topbar-bg, #101010)');
    });
});
