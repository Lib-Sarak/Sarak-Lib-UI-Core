// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { buildServerTs } from '../serverTs.mjs';

const baseAnswers = { backendPort: 3000 };

describe('buildServerTs', () => {
    it('sqlite: usa setupUIDatabase com arquivo local, sem exigir env var', () => {
        const output = buildServerTs({ answers: { ...baseAnswers, storage: 'sqlite' } });
        expect(output).toContain("setupUIDatabase(DATABASE_PATH)");
        expect(output).toContain('./database.sqlite');
        expect(output).toContain('createSarakUIExpressMiddleware');
    });

    it('postgres: lê DATABASE_URL e aplica o schema quando informado', () => {
        const output = buildServerTs({ answers: { ...baseAnswers, storage: 'postgres', schema: 'MeuSchema' } });
        expect(output).toContain('process.env.DATABASE_URL');
        expect(output).toContain("schema: 'MeuSchema'");
    });

    it('postgres: sem schema informado, não força nenhum default na chamada', () => {
        const output = buildServerTs({ answers: { ...baseAnswers, storage: 'postgres', schema: null } });
        expect(output).not.toContain('schema:');
    });

    it('custom: não importa setupUIDatabase nem chama o middleware ativamente (só orienta em comentário)', () => {
        const output = buildServerTs({ answers: { ...baseAnswers, storage: 'custom' } });
        const hasLiveCall = /^\s*app\.use\(createSarakUIExpressMiddleware/m.test(output);
        expect(output).not.toContain('setupUIDatabase');
        expect(hasLiveCall).toBe(false);
        expect(output).toContain('Contrato-próprio');
    });

    it('sempre expõe o endpoint de exemplo /api/v1/hello', () => {
        const output = buildServerTs({ answers: { ...baseAnswers, storage: 'sqlite' } });
        expect(output).toContain("/api/v1/hello");
        expect(output).toContain('app.listen(PORT');
    });
});
