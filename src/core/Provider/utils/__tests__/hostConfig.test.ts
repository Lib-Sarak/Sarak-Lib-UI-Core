import { describe, it, expect } from 'vitest';
import { NO_HOST_CONFIG, resolveHostConfig } from '../hostConfig';

describe('resolveHostConfig', () => {
    const config = { primaryColor: '#123456' };

    it('devolve o `config` como referência do host por padrão', () => {
        expect(resolveHostConfig(config, false)).toBe(config);
    });

    it('com `configIsSavedDesign`, o `config` não é host: devolve o objeto vazio compartilhado', () => {
        expect(resolveHostConfig(config, true)).toBe(NO_HOST_CONFIG);
        expect(Object.keys(NO_HOST_CONFIG)).toEqual([]);
    });

    it('sem `config`, devolve `undefined` quando a opção está desligada', () => {
        expect(resolveHostConfig(undefined, false)).toBeUndefined();
    });
});
