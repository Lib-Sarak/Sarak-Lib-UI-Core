// @vitest-environment node
// Teste do PRÓPRIO GATE (plan-12, vão 12): sincronia entre `status` do
// frontmatter de cada plan e a coluna Status de `specs/00-indice.md` §1.
// Falhou 2x nesta campanha (plan-02, plan-13) sem nenhum gate para pegar.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { checkPlanIndexSync, checkPlanReferences } from '../check-plan-index-sync.mjs';

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

function montarFixtureDeReferencias(linhasDaTabela) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'sarak-plan-refs-'));
  const planDir = path.join(root, 'specs', 'plan');
  const specsDir = path.join(root, 'specs');
  fs.mkdirSync(path.join(specsDir, 'specs'), { recursive: true });
  fs.mkdirSync(planDir, { recursive: true });
  fs.writeFileSync(path.join(specsDir, 'specs', '01-existe.md'), '# existe');
  fs.mkdirSync(path.join(root, 'src'), { recursive: true });
  fs.writeFileSync(path.join(root, 'src', 'real.ts'), 'export {};');

  const plan = [
    '---', 'status: "🟡 Em execução"', '---', '',
    '# 3. Escopo', '', '| Tipo | Referência | Por quê |', '|---|---|---|', '| Código | `src/fora-da-secao-4.ts` | não é lida |', '',
    '# 4. Referências obrigatórias', '',
    '| Tipo | Referência | Por quê |', '|---|---|---|',
    ...linhasDaTabela, '',
    '# 5. Instruções de execução',
  ].join('\n');
  fs.writeFileSync(path.join(planDir, 'plan-99-fixture.md'), plan);
  return { root, planDir, specsDir };
}

describe('checkPlanReferences — §4 das plans', () => {
  it('acusa caminho que nunca existiu, nomeando a plan e o ponteiro', () => {
    const { root, planDir, specsDir } = montarFixtureDeReferencias([
      '| Spec fixa | `specs/24-modo-embarcado.md` | o modo embarcado |',
    ]);
    const { ponteirosMortosNaSecao4 } = checkPlanReferences({ planDir, root, specsDir });
    expect(ponteirosMortosNaSecao4).toEqual([{ plan: 'plan-99-fixture.md', referencia: 'specs/24-modo-embarcado.md' }]);
    fs.rmSync(root, { recursive: true, force: true });
  });

  it('acusa wikilink sem spec correspondente', () => {
    const { root, planDir, specsDir } = montarFixtureDeReferencias([
      '| Spec fixa | [[99-nao-existe]] · [[01-existe]] | contexto |',
    ]);
    const { ponteirosMortosNaSecao4 } = checkPlanReferences({ planDir, root, specsDir });
    expect(ponteirosMortosNaSecao4).toEqual([{ plan: 'plan-99-fixture.md', referencia: '[[99-nao-existe]]' }]);
    fs.rmSync(root, { recursive: true, force: true });
  });

  it('libera caminho relativo à raiz, relativo a specs/, com sufixo de linha e pasta', () => {
    const { root, planDir, specsDir } = montarFixtureDeReferencias([
      '| Spec fixa | `specs/specs/01-existe.md` · `specs/01-existe.md` | resolve pela raiz e por specs/ |',
      '| Código | `src/real.ts:12` · `src/` | sufixo de linha e pasta |',
    ]);
    const { ponteirosMortosNaSecao4 } = checkPlanReferences({ planDir, root, specsDir });
    expect(ponteirosMortosNaSecao4).toEqual([]);
    fs.rmSync(root, { recursive: true, force: true });
  });

  it('não resolve linha Skill, glob, metavariável, nome sem barra nem seção fora da §4', () => {
    const { root, planDir, specsDir } = montarFixtureDeReferencias([
      '| **Skill** | `skill/que-nao-existe-aqui` | skill é por nome — limite declarado |',
      '| Código | `src/**/*.ts` · `src/<modulo>/x.ts` · `catalog.ts` | glob, metavariável e nome solto |',
    ]);
    const { ponteirosMortosNaSecao4 } = checkPlanReferences({ planDir, root, specsDir });
    expect(ponteirosMortosNaSecao4).toEqual([]);
    fs.rmSync(root, { recursive: true, force: true });
  });
});
