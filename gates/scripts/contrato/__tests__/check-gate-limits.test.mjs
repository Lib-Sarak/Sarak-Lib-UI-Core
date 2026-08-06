// Teste do PRÓPRIO GATE (plan-12, R18): nenhum verificador cobrava que todo
// gate declara o que NÃO vê. Um caso que ele PEGA (script sem marcador) e
// um que ele DEIXA PASSAR (com o marcador canônico ou a convenção antiga).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { checkGateLimits } from '../check-gate-limits.mjs';

function montarFixture(arquivos) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'sarak-gate-limits-'));
  const dir = path.join(root, 'gates', 'scripts', 'audit');
  fs.mkdirSync(dir, { recursive: true });
  for (const [nome, conteudo] of Object.entries(arquivos)) {
    fs.writeFileSync(path.join(dir, nome), conteudo);
  }
  return root;
}

describe('checkGateLimits — R18', () => {
  it('acusa um script sem bloco de limite declarado', () => {
    const root = montarFixture({ 'semLimite.mjs': "console.log('oi');" });
    const { semLimite, total } = checkGateLimits({ root });
    expect(total).toBe(1);
    expect(semLimite).toEqual(['gates/scripts/audit/semLimite.mjs']);
  });

  it('libera um script com o marcador canônico "LIMITES DECLARADOS"', () => {
    const root = montarFixture({
      'comLimite.mjs': '// LIMITES DECLARADOS (R18) — não vê X\nconsole.log(1);',
    });
    expect(checkGateLimits({ root }).semLimite).toEqual([]);
  });

  it('libera um script com a convenção antiga "ponto cego conhecido"', () => {
    const root = montarFixture({
      'antigo.mjs': '// NOTA (ponto cego conhecido): só varre .tsx\nconsole.log(1);',
    });
    expect(checkGateLimits({ root }).semLimite).toEqual([]);
  });

  it('ignora __tests__/, helpers/ e allowlists/', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'sarak-gate-limits-'));
    fs.mkdirSync(path.join(root, 'gates', 'scripts', 'audit', '__tests__'), { recursive: true });
    fs.writeFileSync(path.join(root, 'gates', 'scripts', 'audit', '__tests__', 'x.test.mjs'), 'it(()=>{});');
    const { total } = checkGateLimits({ root });
    expect(total).toBe(0);
  });
});
