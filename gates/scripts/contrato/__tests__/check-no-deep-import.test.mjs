// Teste do PRÓPRIO GATE (plan-12, R27): nenhum gate existia para o campo
// "exports" — só o contrato escrito e o próprio campo, sem verificação. Um
// caso que ele PEGA (subcaminho de deep import declarado) e um que ele
// DEIXA PASSAR (só raiz + CSS, como hoje).
import { describe, expect, it } from 'vitest';
import { checkExports } from '../check-no-deep-import.mjs';

describe('checkExports — R27', () => {
  it('acusa subcaminho que expõe dist/components/… (deep import)', () => {
    const problemas = checkExports({
      '.': { types: './dist/index.d.ts' },
      './dist/components/*': './dist/components/*',
    });
    expect(problemas).toHaveLength(1);
    expect(problemas[0]).toContain('./dist/components/*');
  });

  it('libera raiz + subcaminhos de CSS', () => {
    const problemas = checkExports({
      '.': { types: './dist/index.d.ts' },
      './sarak.css': './dist/sarak.css',
      './sarak-scoped.css': './dist/sarak-scoped.css',
    });
    expect(problemas).toEqual([]);
  });

  it('acusa "exports" ausente', () => {
    expect(checkExports(undefined)[0]).toContain('não tem campo');
  });
});
