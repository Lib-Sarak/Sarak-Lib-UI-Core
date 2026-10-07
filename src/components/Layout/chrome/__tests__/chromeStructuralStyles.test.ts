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
