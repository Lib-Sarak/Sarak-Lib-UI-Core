import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { runGateAgainstFixture } from './helpers/runGateFixture.mjs';

// Self-test do PRÓPRIO GATE (R7 vão 1, plan-20): `var(--x, N,N,N)` com
// tripla numérica CRUA no fallback só é válida dentro de rgb()/rgba()/
// color()/color-mix() — fora delas o valor cai em IACVT e a declaração
// inteira colapsa (defeito histórico de SidebarNav.tsx). Cada fixture
// registra `--theme-error-rgb` como var REAL (via um `.css` emissor), para
// que o ghost-check (checagem por NOME) não contamine o resultado — só a
// checagem de SINTAXE do fallback está sob teste aqui.
const GATE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'auditor_ghostvars.mjs');

const REGISTRO = { 'src/styles/fixture.css': ':root { --theme-error-rgb: 0, 0, 0; }' };

describe('auditor_ghostvars — R7 vão 1 (sintaxe do fallback de tripla numérica)', () => {
  it('ACUSA tripla crua usada DIRETO, fora de qualquer função de cor (defeito histórico do SidebarNav)', () => {
    const { status, stdout } = runGateAgainstFixture(GATE, {
      ...REGISTRO,
      'src/core/Shell/Fixture.tsx': 'const x = "var(--theme-error-rgb, 59,130,246)/10";',
    });
    expect(status).toBe(1);
    expect(stdout).toContain('tripla numérica crua fora de função de cor');
  });

  it('LIBERA a forma correta — envolvida por rgba() no ponto de uso (uma das 8 ocorrências reais)', () => {
    const { status, stdout } = runGateAgainstFixture(GATE, {
      ...REGISTRO,
      'src/core/Shell/Fixture.tsx':
        'const x = "rgba(var(--theme-error-rgb, 239, 68, 68), 0.4)";',
    });
    expect(status).toBe(0);
    expect(stdout).toContain('Nenhum fallback de tripla numérica fora de');
  });

  it('LIBERA a forma de definição "-rgb: var(...)" (guarda de canais para quem consome depois — convenção de _colors.css)', () => {
    const { status, stdout } = runGateAgainstFixture(GATE, {
      'src/styles/fixture.css':
        ':root { --sarak-bg-body-rgb: 248, 250, 252; --bg-body-rgb: var(--sarak-bg-body-rgb, 248, 250, 252); }',
    });
    expect(status).toBe(0);
    expect(stdout).toContain('Nenhum fallback de tripla numérica fora de');
  });
});
