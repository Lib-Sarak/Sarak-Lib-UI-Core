import { describe, it, expect } from 'vitest';
import { isSafeCssString, isSafeFontUrl, isSafeMediaString } from '../cssSafety';
import { MEDIA_PREDICATE_TABLE } from './mediaPredicateTable';

describe('isSafeCssString', () => {
    it('recusa os cinco caracteres de breakout', () => {
        expect(isSafeCssString('<script>')).toBe(false);
        expect(isSafeCssString('a > b')).toBe(false);
        expect(isSafeCssString('{ }')).toBe(false);
        expect(isSafeCssString('a;b')).toBe(false);
    });

    it('aceita um valor CSS comum', () => {
        expect(isSafeCssString('#ff0000')).toBe(true);
    });
});

/**
 * A fonte do predicado, exercitada diretamente contra a tabela única (a
 * mesma tabela roda nas duas barreiras em `validation.test.ts` e
 * `useDesignVariables.test.ts`).
 */
describe('isSafeMediaString — tabela única', () => {
    it.each(MEDIA_PREDICATE_TABLE.map(({ value, accepted, reason }) => [value, accepted, reason] as const))(
        '%s → %s (%s)',
        (value, accepted) => {
            expect(isSafeMediaString(value)).toBe(accepted);
        }
    );
});

describe('isSafeFontUrl — o arquivo de uma fonte do host', () => {
    it.each([
        ['https://cdn.exemplo.test/marca.woff2', true],
        ['/fontes/marca.woff2', true],
        ['fontes/marca.woff', true],
        ['data:font/woff2;base64,d09GMgABAAAAAA==', true],
        ['http://cdn.exemplo.test/marca.woff2', false],
        ['data:image/png;base64,iVBORw0KGgo=', false],
        ['data:text/html;base64,PHNjcmlwdD4=', false],
        ['javascript:alert(1)', false],
        ['file:///c/fonte.woff2', false],
        ['url(/fontes/marca.woff2)', false],
        [' /fontes/marca.woff2', false],
        [`${String.fromCharCode(1)}javascript:alert(1)`, false],
        ['/fontes/a.woff2;}body{x', false],
        ['', false],
        [42, false],
    ])('%s → %s', (value, accepted) => {
        expect(isSafeFontUrl(value)).toBe(accepted);
    });
});
