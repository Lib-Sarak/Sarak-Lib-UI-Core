// Teste do PRÓPRIO GATE (plan-12, vão 12): sincronia entre `status` do
// frontmatter de cada plan e a coluna Status de `specs/00-indice.md` §1.
// Falhou 2x nesta campanha (plan-02, plan-13) sem nenhum gate para pegar.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { checkPlanIndexSync } from '../check-plan-index-sync.mjs';

function montarFixture({ statusIndice, statusFrontmatter, comArquivo = true }) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'sarak-plan-index-'));
  const planDir = path.join(root, 'plan');
  fs.mkdirSync(planDir, { recursive: true });

  const indicePath = path.join(root, '00-indice.md');
  const indice = [
    '# 1. Fila de execução',
    '',
    '| # | Plan | Objetivo | Depende de | Status | Destino |',
    '|---|---|---|---|---|---|',
    `| 1 | [plan-99-fixture](plan/plan-99-fixture.md) | Testar | — | ${statusIndice} | \`—\` |`,
    '',
    '# 2. Legenda de status',
  ].join('\n');
  fs.writeFileSync(indicePath, indice);

  if (comArquivo) {
    const plan = ['---', `status: "${statusFrontmatter}"`, '---', '', '# fixture'].join('\n');
    fs.writeFileSync(path.join(planDir, 'plan-99-fixture.md'), plan);
  }
  return { root, indicePath, planDir };
}

describe('checkPlanIndexSync', () => {
  it('acusa divergência entre índice e frontmatter', () => {
    const { root, indicePath, planDir } = montarFixture({
      statusIndice: '🔴 A executar',
      statusFrontmatter: '🟡 Em execução',
    });
    const { divergencias, ponteirosMortos } = checkPlanIndexSync({ indicePath, planDir });
    expect(ponteirosMortos).toEqual([]);
    expect(divergencias).toEqual([
      { arquivo: 'plan-99-fixture.md', statusIndice: '🔴 A executar', statusFrontmatter: '🟡 Em execução' },
    ]);
    fs.rmSync(root, { recursive: true, force: true });
  });

  it('libera quando índice e frontmatter batem', () => {
    const { root, indicePath, planDir } = montarFixture({
      statusIndice: '🟢 Aprovada',
      statusFrontmatter: '🟢 Aprovada',
    });
    const { divergencias, ponteirosMortos } = checkPlanIndexSync({ indicePath, planDir });
    expect(divergencias).toEqual([]);
    expect(ponteirosMortos).toEqual([]);
    fs.rmSync(root, { recursive: true, force: true });
  });

  it('acusa plan citada no índice cujo arquivo não existe', () => {
    const { root, indicePath, planDir } = montarFixture({
      statusIndice: '🟢 Aprovada',
      statusFrontmatter: '🟢 Aprovada',
      comArquivo: false,
    });
    const { ponteirosMortos } = checkPlanIndexSync({ indicePath, planDir });
    expect(ponteirosMortos).toEqual(['plan-99-fixture.md']);
    fs.rmSync(root, { recursive: true, force: true });
  });
});
