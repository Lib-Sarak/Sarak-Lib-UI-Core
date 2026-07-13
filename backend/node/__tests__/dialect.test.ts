import { describe, it, expect } from 'vitest';
import { resolveDialect } from '../dialect';

describe('resolveDialect', () => {
    it('reconhece postgres:// e postgresql:// como Postgres', () => {
        expect(resolveDialect('postgres://localhost:5432/db')).toBe('postgres');
        expect(resolveDialect('postgresql://localhost:5432/db')).toBe('postgres');
    });

    it('trata caminho de arquivo como SQLite', () => {
        expect(resolveDialect('./database.sqlite')).toBe('sqlite');
        expect(resolveDialect('/abs/path/database.sqlite')).toBe('sqlite');
    });

    it('trata :memory: como SQLite', () => {
        expect(resolveDialect(':memory:')).toBe('sqlite');
    });
});
