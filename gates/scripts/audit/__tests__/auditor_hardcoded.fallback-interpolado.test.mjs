import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { runGateAgainstFixture } from './helpers/runGateFixture.mjs';

// Teste do PRÓPRIO GATE (plan-17, conserto 3 — falso positivo de fallback
// interpolado): `sanitizeFallbacks()` só limpa hex/unidade escritos
// LITERALMENTE dentro de `var(--x, #fff)`. Quando o fallback é uma `const`
// interpolada — `var(--token, ${fallbackColor})`, com `fallbackColor`
// declarada em OUTRA linha — o literal sobrevivia à limpeza e era acusado
// como hardcode solto. Medido: `SarakBackgroundRenderer.tsx:71` (2 ocorrências,
// `#ffffff`/`#000000`). Self-test: um caso que passou a liberar, um que
// AINDA pega (a mesma classe de literal, sem uso como fallback interpolado).

const GATE = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'auditor_hardcoded.mjs',
);

describe('auditor_hardcoded — fallback interpolado em var(--token, ${...})', () => {
  it('LIBERA um literal hex que só existe para ser interpolado como fallback de var()', () => {
    const { status, stdout } = runGateAgainstFixture(GATE, {
      'src/core/Fixture.tsx': [
        "export const X = () => {",
        "  const fallbackColor = true ? '#ffffff' : '#000000';",
        "  const overlay = `color-mix(in srgb, var(--sarak-bg-base, ${fallbackColor}) 85%, transparent)`;",
        "  return <div style={{ background: overlay }} />;",
        "};",
      ].join('\n'),
    });
    expect(status).toBe(0);
    expect(stdout).not.toContain('#ffffff');
  });

  it('AINDA acusa um literal hex idêntico quando ele NÃO é usado como fallback interpolado (self-test negativo)', () => {
    const { status, stdout } = runGateAgainstFixture(GATE, {
      'src/core/Fixture2.tsx': [
        "export const X = () => {",
        "  const brandColor = '#ffffff';",
        "  return <div style={{ color: brandColor }} />;",
        "};",
      ].join('\n'),
    });
    expect(status).toBe(1);
    expect(stdout).toContain('#ffffff');
  });
});
