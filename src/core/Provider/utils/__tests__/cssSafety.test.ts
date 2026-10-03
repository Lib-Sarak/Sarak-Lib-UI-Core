import { describe, it, expect } from 'vitest';
import { isSafeCssString, isSafeMediaString } from '../cssSafety';
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
