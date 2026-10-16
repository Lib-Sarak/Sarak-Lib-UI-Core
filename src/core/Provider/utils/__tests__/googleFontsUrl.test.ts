import { describe, expect, it } from 'vitest';
import { THEME_FONTS } from '../../../Design/schema/typography';
import { SARAK_ALL_THEMES } from '../../../Design/presets/themes/all';
import { buildGoogleFontsUrl, listLoadableFamilies } from '../googleFontsUrl';

const FONT_TOKENS = ['headingFont', 'bodyFont', 'monoFont', 'identityFontFamily'] as const;

describe('carregador de fontes', () => {
    it('pede ao Google Fonts TODA família oferecida em THEME_FONTS, menos a do sistema', () => {
        const url = buildGoogleFontsUrl();

        for (const family of listLoadableFamilies()) {
            expect(url, family).toContain(`family=${family.replace(/ /g, '+')}`);
        }
        expect(listLoadableFamilies()).toHaveLength(THEME_FONTS.length - 1);
        expect(url).not.toContain('system-ui');
    });

    it('uma fonte nova na lista é carregada sem tocar no carregador', () => {
        const url = buildGoogleFontsUrl([...THEME_FONTS, { value: "'Nova Fonte', sans-serif" }]);

        expect(url).toContain('family=Nova+Fonte:wght@400;700');
    });

    it('fonte de face única não recebe o eixo wght', () => {
        const url = buildGoogleFontsUrl();

        expect(url).toContain('family=Bebas+Neue&');
        expect(url).toContain('family=Pacifico&');
        expect(url).toContain('family=Satisfy&');
        expect(url).toContain('family=VT323&');
        expect(url).toContain('family=Patrick+Hand&');
    });

    it('a URL é css2 com display=swap', () => {
        expect(buildGoogleFontsUrl()).toMatch(/^https:\/\/fonts\.googleapis\.com\/css2\?family=.+&display=swap$/);
    });

    it('toda fonte de tema embarcado tem o valor exato de THEME_FONTS (o painel a reconhece)', () => {
        const offered = new Set(THEME_FONTS.map((font) => font.value));
        const fora: string[] = [];

        for (const theme of SARAK_ALL_THEMES) {
            for (const token of FONT_TOKENS) {
                const value = (theme.design as Record<string, unknown>)[token];
                if (typeof value === 'string' && !offered.has(value)) fora.push(`${theme.id}.${token}=${value}`);
            }
        }

        expect(fora).toEqual([]);
    });

    it('toda fonte usada por tema embarcado é carregada', () => {
        const url = buildGoogleFontsUrl();
        const used = new Set<string>();

        for (const theme of SARAK_ALL_THEMES) {
            for (const token of FONT_TOKENS) {
                const value = (theme.design as Record<string, unknown>)[token];
                if (typeof value === 'string') used.add(value.split(',')[0].replace(/['"]/g, '').trim());
            }
        }

        for (const family of used) {
            expect(url, family).toContain(`family=${family.replace(/ /g, '+')}`);
        }
    });
});
