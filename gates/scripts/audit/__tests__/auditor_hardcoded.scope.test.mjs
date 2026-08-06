import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { runGateAgainstFixture } from './helpers/runGateFixture.mjs';

// Teste do PRÓPRIO GATE (plan-12, vão 5): `auditor_hardcoded.mjs` passou a
// varrer também `src/core/` no detector de VALOR (hex/px/rem/em) — antes
// restrito a `components/` e `features/`. Medido: 35 violações reais em
// `src/core/Shell/Components/` (a plan citava 4 — a coluna "ONDE" era ponto
// de partida, não fronteira).

const GATE = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'auditor_hardcoded.mjs',
);

describe('auditor_hardcoded — escopo ampliado a src/core/ (VALOR)', () => {
  it('acusa px hardcoded num .tsx de src/core/', () => {
    const { status, stdout } = runGateAgainstFixture(GATE, {
      'src/core/Shell/Fixture.tsx': "export const X = () => <div style={{ width: '40px' }} />;",
    });
    expect(status).toBe(1);
    expect(stdout).toContain('40px');
  });

  it('libera var(--token, fallback) em src/core/ (não é hardcode)', () => {
    const { status } = runGateAgainstFixture(GATE, {
      'src/core/Shell/Fixture2.tsx': "export const X = () => <div style={{ width: 'var(--sarak-x, 40px)' }} />;",
    });
    expect(status).toBe(0);
  });
});
