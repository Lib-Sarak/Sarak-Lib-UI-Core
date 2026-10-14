// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { isValidColor, validateDesign } from '../validation';
import { sarakGetAllDesignTokens } from '../../../Design/master-map';
import { SARAK_ALL_THEMES } from '../../../Design/presets/themes/all';

/**
 * Cor de tema: `color-mix(in <espaço>, …)` é válida (o painel a aceita e o motor já a escreve), e NENHUM valor de
 * cor carrega função de imagem ou de recurso nem barra invertida — em nenhum ramo, inclusive a reserva do `var()`.
 * Tema é dado hostil: um valor de cor não faz o navegador buscar nada.
 */
const BACKSLASH = String.fromCharCode(92);

describe('cor de tema: o que passa', () => {
    it('aceita a mistura com var() e a mistura simples', () => {
        expect(isValidColor('color-mix(in srgb, var(--sarak-primary-color, #00f2ff) 40%, transparent)')).toBe(true);
        expect(isValidColor('color-mix(in oklch, red 20%, blue)')).toBe(true);
        expect(isValidColor('color-mix(in oklch longer hue, red, blue)')).toBe(true);
    });

    it('aceita var() com reserva de cor e as formas de sempre', () => {
        expect(isValidColor('var(--sarak-primary-color, #00f2ff)')).toBe(true);
        expect(isValidColor('var(--x, rgba(1, 2, 3, 0.5))')).toBe(true);
        expect(isValidColor('rgba(255, 255, 255, 0.1)')).toBe(true);
        expect(isValidColor('#ff0000')).toBe(true);
        expect(isValidColor('transparent')).toBe(true);
    });

    it('um tema com a mistura em token de cor chega inteiro à validação', () => {
        const mix = 'color-mix(in srgb, #ff0000 30%, transparent)';
        const validated = validateDesign({ primaryColor: mix }) as unknown as Record<string, unknown>;
        expect(validated.primaryColor).toBe(mix);
    });

    it('toda cor de todos os temas embarcados continua aceita', () => {
        const colorIds = new Set(sarakGetAllDesignTokens().filter((token) => token.type === 'color').map((token) => token.id));
        const refused: string[] = [];
        for (const theme of SARAK_ALL_THEMES) {
            for (const [key, value] of Object.entries(theme.design as Record<string, unknown>)) {
                if (colorIds.has(key) && typeof value === 'string' && value !== '' && !isValidColor(value)) refused.push(`${theme.id}.${key}=${value}`);
            }
        }
        expect(refused).toEqual([]);
    });

    it('toda cor padrão do schema continua aceita', () => {
        const refused = sarakGetAllDesignTokens()
            .filter((token) => token.type === 'color' && typeof token.defaultValue === 'string' && token.defaultValue !== '')
            .filter((token) => !isValidColor(token.defaultValue))
            .map((token) => token.id);
        expect(refused).toEqual([]);
    });
});

describe('cor de tema: o que NUNCA passa (função de imagem ou de recurso, escape)', () => {
    const probes: Array<[string, string]> = [
        ['url() no color-mix', 'color-mix(in srgb, red, url(x))'],
        ['url() com cor antes no color-mix', 'color-mix(in srgb, rgb(1,2,3) 50%, url(x))'],
        ['URL() em maiúsculas no color-mix', 'color-mix(in srgb, red 50%, URL(x))'],
        ['url() na reserva do var()', 'var(--a, url(x))'],
        ['escape de CSS escrevendo url na reserva', `var(--a, u${BACKSLASH}72l(x))`],
        ['escape de CSS escrevendo url no color-mix', `color-mix(in srgb, red, u${BACKSLASH}72l(x))`],
        ['image-set() na reserva do var()', 'var(--a, image-set(x))'],
        ['IMAGE-SET() em maiúsculas', 'var(--a, IMAGE-SET(x))'],
        ['-webkit-image-set() com prefixo', 'var(--a, -webkit-image-set(x))'],
        ['image() na reserva', 'var(--a, image(x))'],
        ['cross-fade() na reserva', 'var(--a, cross-fade(x, y))'],
        ['element() na reserva', 'var(--a, element(#alvo))'],
        ['-moz-element() com prefixo', 'var(--a, -moz-element(#alvo))'],
        ['paint() na reserva', 'var(--a, paint(x))'],
        ['src() na reserva', 'var(--a, src(x))'],
        ['url() aninhado em var() dentro de color-mix', 'color-mix(in srgb, var(--a, url(x)) 40%, red)'],
        ['url() com URL absoluta', 'var(--a, url(https://x.test/a.png))'],
        ['barra invertida solta', `var(--a, #ff0000${BACKSLASH})`],
    ];

    it.each(probes)('recusa %s', (_name, value) => {
        expect(isValidColor(value)).toBe(false);
    });

    it('a validação do tema descarta a sonda em vez de gravá-la', () => {
        for (const [, value] of probes) {
            const validated = validateDesign({ primaryColor: value }) as unknown as Record<string, unknown>;
            expect(validated.primaryColor, value).toBeUndefined();
        }
    });

    it('continua recusando o breakout de declaração e a mistura sem espaço de cor', () => {
        expect(isValidColor('color-mix(in srgb, red; background: url(x))')).toBe(false);
        expect(isValidColor('color-mix(in srgb, red 10%, blue); }</style>')).toBe(false);
        expect(isValidColor('color-mix(red 10%, blue)')).toBe(false);
    });
});
