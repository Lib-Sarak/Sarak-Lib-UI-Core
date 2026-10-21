import { describe, expect, it } from 'vitest';
import { resolveChromeContentStyle } from '../chromeStructuralStyles';

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

describe('resolveChromeContentStyle — as cinco opções de `maxContentWidth` chegam a `max-width`', () => {
    it.each([
        ['1000px'],
        ['1200px'],
        ['1440px'],
        ['1600px'],
        ['100%'],
    ])('maxContentWidth %s vira exatamente a largura máxima da região de conteúdo', (maxContentWidth) => {
        expect(resolveChromeContentStyle('comfortable', maxContentWidth).maxWidth).toBe(maxContentWidth);
    });
});
