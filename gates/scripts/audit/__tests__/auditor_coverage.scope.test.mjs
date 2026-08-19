// @vitest-environment node
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { runGateAgainstFixture } from './helpers/runGateFixture.mjs';

// Teste do PRÓPRIO GATE (plan-12, vão 6): `auditor_coverage.mjs` passou a varrer
// também `src/shared/`, `src/effects/` e `src/constants/` — hoje fora do escopo
// original (só `components/`, `features/`, `core/`). Um caso que ele PEGA e um
// que ele DEIXA PASSAR nos três diretórios novos.

const GATE = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'auditor_coverage.mjs',
);

describe('auditor_coverage — escopo ampliado a shared/effects/constants', () => {
  it('acusa um hook em src/shared/ sem teste ao lado', () => {
    const { status, stdout } = runGateAgainstFixture(GATE, {
      'src/shared/hooks/useOrfao.ts': 'export function useOrfao() { return 1; }',
    });
    expect(status).toBe(1);
    expect(stdout).toContain('useOrfao');
  });

  it('libera um hook em src/shared/ COM teste ao lado', () => {
    const { status } = runGateAgainstFixture(GATE, {
      'src/shared/hooks/useCoberto.ts': 'export function useCoberto() { return 1; }',
      'src/shared/hooks/__tests__/useCoberto.test.ts': 'it("ok", () => {});',
    });
    expect(status).toBe(0);
  });

  it('acusa um componente em src/effects/ sem teste ao lado', () => {
    const { status, stdout } = runGateAgainstFixture(GATE, {
      'src/effects/Orfao.tsx': 'export function Orfao() { return null; }',
    });
    expect(status).toBe(1);
    expect(stdout).toContain('Orfao');
  });

  it('libera um componente em src/constants/ COM teste ao lado', () => {
    const { status } = runGateAgainstFixture(GATE, {
      'src/constants/coisas.tsx': 'export const coisas = [];',
      'src/constants/__tests__/coisas.test.tsx': 'it("ok", () => {});',
    });
    expect(status).toBe(0);
  });

  it('NÃO cobra .ts que não começa com "use" (fora da letra da regra)', () => {
    const { status } = runGateAgainstFixture(GATE, {
      'src/shared/services/semTeste.ts': 'export const x = 1;',
    });
    expect(status).toBe(0);
  });
});
