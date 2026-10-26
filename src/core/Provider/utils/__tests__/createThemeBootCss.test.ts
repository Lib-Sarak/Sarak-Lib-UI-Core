import { describe, expect, it, vi } from 'vitest';
import { AtmosphereSchema } from '../../../Design/schema/atmosphere';
import { sarakCreateThemeBootCss } from '../createThemeBootCss';

describe('sarakCreateThemeBootCss', () => {
    it('pinta html e body e define o color-scheme a partir do design', () => {
        const design = { mode: 'light', colorBgBody: '#f9fafb' };

        expect(sarakCreateThemeBootCss(design)).toBe([
            'html, body {',
            '    background-color: #f9fafb;',
            '}',
            'html {',
            '    color-scheme: light;',
            '}',
        ].join('\n'));
        expect(design).toEqual({ mode: 'light', colorBgBody: '#f9fafb' });
    });

    it('descarta cor insegura e usa a cor do design padrão', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const defaultColor = AtmosphereSchema.tokens.find((token) => token.id === 'colorBgBody')?.defaultValue;
        try {
            const css = sarakCreateThemeBootCss({
                mode: 'invalid',
                colorBgBody: '#123456; background-image: url(https://invalid.example)',
            });

            expect(css).toContain(`background-color: ${defaultColor};`);
            expect(css).toContain('color-scheme: dark;');
            expect(css).not.toContain('background-image');
            expect(warn).not.toHaveBeenCalled();
        } finally {
            warn.mockRestore();
        }
    });
});
