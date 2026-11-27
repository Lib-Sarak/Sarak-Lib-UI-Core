import { describe, expect, it } from 'vitest';
import { prazoDeTeste, RELEASE_TIMEOUT_ENV } from '../prazoDeTeste';

describe('prazoDeTeste', () => {
    it('fora da release vale o prazo declarado', () => {
        expect(prazoDeTeste(20_000, {})).toBe(20_000);
    });

    it('na release devolve o maior entre o declarado e o da release', () => {
        expect(prazoDeTeste(20_000, { [RELEASE_TIMEOUT_ENV]: '30000' })).toBe(30_000);
        expect(prazoDeTeste(120_000, { [RELEASE_TIMEOUT_ENV]: '30000' })).toBe(120_000);
    });

    it('valor inválido na variável é ignorado', () => {
        expect(prazoDeTeste(20_000, { [RELEASE_TIMEOUT_ENV]: 'abc' })).toBe(20_000);
    });
});
