import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { runGateAgainstFixture } from './helpers/runGateFixture.mjs';

// Teste do PRÓPRIO GATE (plan-12, vãos 2 e 3): `auditor_ghostvars.mjs` passou
// a varrer `src/styles/` também como CONSUMIDORA (antes só fonte emissora) e
// `src/core/` inteiro (antes fora do escopo) — e ganhou remoção de
// comentário antes de varrer consumo, para não contar `var(--x)` citado
// como padrão em JSDoc/`//` como consumo real.

const GATE = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'auditor_ghostvars.mjs',
);

// O registro precisa de PELO MENOS um schema válido para o auditor rodar sem
// erro (ele varre src/core/Design/schema/*.ts mesmo vazio de tokens).
const SCHEMA_STUB = "export const X = { id: 'stubToken' };\n";

describe('auditor_ghostvars — escopo ampliado a src/styles/ e src/core/', () => {
  it('acusa fantasma consumido em src/styles/*.css (vão 2)', () => {
    const { status, stdout } = runGateAgainstFixture(GATE, {
      'src/core/Design/schema/stub.ts': SCHEMA_STUB,
      'src/styles/_fixture.css': '.x { background: var(--nao-emitida-em-lugar-nenhum, red); }',
    });
    expect(status).toBe(1);
    expect(stdout).toContain('--nao-emitida-em-lugar-nenhum');
  });

  it('acusa fantasma consumido em src/core/**/*.ts (vão 3)', () => {
    const { status, stdout } = runGateAgainstFixture(GATE, {
      'src/core/Design/schema/stub.ts': SCHEMA_STUB,
      'src/core/Shell/Fixture.tsx': "const s = { color: 'var(--core-fantasma)' };",
    });
    expect(status).toBe(1);
    expect(stdout).toContain('--core-fantasma');
  });

  it('NÃO conta var(--x) dentro de comentário de bloco/JSDoc como consumo', () => {
    const { status } = runGateAgainstFixture(GATE, {
      'src/core/Design/schema/stub.ts': SCHEMA_STUB,
      'src/core/Fixture.ts': '/** exemplo: var(--nao-real, fallback) */\nexport const x = 1;',
    });
    expect(status).toBe(0);
  });

  it('NÃO conta var(--x) dentro de comentário de linha (//) como consumo', () => {
    const { status } = runGateAgainstFixture(GATE, {
      'src/core/Design/schema/stub.ts': SCHEMA_STUB,
      'src/core/Fixture2.ts': "// var(--nao-real-2, fallback) é só exemplo\nexport const y = 1;",
    });
    expect(status).toBe(0);
  });

  it('libera uma var real emitida pelo schema e consumida em src/core/', () => {
    const { status } = runGateAgainstFixture(GATE, {
      'src/core/Design/schema/stub.ts': "export const X = { id: 'meuToken' };",
      'src/core/Fixture3.ts': "const s = 'var(--sarak-meu-token, 1px)';",
    });
    expect(status).toBe(0);
  });
});
