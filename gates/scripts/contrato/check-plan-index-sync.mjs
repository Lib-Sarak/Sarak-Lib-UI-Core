// Sincronia entre o `status` do frontmatter de cada plan e a coluna Status da
// tabela §1 (Fila de execução) de `specs/00-indice.md`. Falhou 2x nesta
// campanha (plan-02, plan-13) — vão nº 12 de [[01-gates-e-baseline]] §9.2.
//
// -------------------------------------------------------------------------
// LIMITES DECLARADOS (R18) — o que este gate NÃO vê
// -------------------------------------------------------------------------
// 1. Só a §1 (Fila de execução) é conferida. A §4 (Histórico — plans
//    sintetizadas) não tem coluna Status própria hoje (a plan já saiu da
//    fila) — não é comparada.
// 2. Não confere a coluna "Depende de" nem a ordem da fila — só o par
//    (status do frontmatter, status da linha do índice).
// 3. Plan referenciada no índice cujo arquivo não existe em disco é
//    reportada à parte (ponteiro morto), não como divergência de status.
// -------------------------------------------------------------------------
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const INDICE_PATH = path.join(ROOT, 'specs', '00-indice.md');
const PLAN_DIR = path.join(ROOT, 'specs', 'plan');

function extrairFilaRows(indiceTexto) {
  const inicio = indiceTexto.indexOf('# 1. Fila de execução');
  const fim = indiceTexto.indexOf('# 2. Legenda de status');
  const bloco = indiceTexto.slice(inicio, fim === -1 ? undefined : fim);
  const linhas = bloco.split('\n').filter((l) => l.trim().startsWith('|') && /^\|\s*\d/.test(l.trim()));

  return linhas.map((linha) => {
    const cols = linha.split('|').map((c) => c.trim());
    // cols[0] é '', cols[1]=#, cols[2]=Plan, cols[3]=Objetivo, cols[4]=Depende de, cols[5]=Status, cols[6]=Destino
    const linkMatch = cols[2].match(/\(plan\/([^)]+\.md)\)/);
    return {
      arquivo: linkMatch ? linkMatch[1] : null,
      statusIndice: cols[5],
    };
  }).filter((r) => r.arquivo);
}

function lerStatusFrontmatter(caminhoAbs) {
  const conteudo = fs.readFileSync(caminhoAbs, 'utf8');
  const m = conteudo.match(/^status:\s*"([^"]+)"/m);
  return m ? m[1] : null;
}

export function checkPlanIndexSync({ indicePath = INDICE_PATH, planDir = PLAN_DIR } = {}) {
  const divergencias = [];
  const ponteirosMortos = [];

  const indiceTexto = fs.readFileSync(indicePath, 'utf8');
  const linhas = extrairFilaRows(indiceTexto);

  for (const { arquivo, statusIndice } of linhas) {
    const caminhoAbs = path.join(planDir, arquivo);
    if (!fs.existsSync(caminhoAbs)) {
      ponteirosMortos.push(arquivo);
      continue;
    }
    const statusFrontmatter = lerStatusFrontmatter(caminhoAbs);
    if (statusFrontmatter !== statusIndice) {
      divergencias.push({ arquivo, statusIndice, statusFrontmatter });
    }
  }

  return { divergencias, ponteirosMortos };
}

function main() {
  console.log('--- Sincronia plan.frontmatter.status × 00-indice §1 ---');
  const { divergencias, ponteirosMortos } = checkPlanIndexSync();

  if (ponteirosMortos.length > 0) {
    console.log(`\n[ERROR] ${ponteirosMortos.length} plan(s) no índice sem arquivo correspondente:`);
    ponteirosMortos.forEach((p) => console.log(`  - plan/${p}`));
  }

  if (divergencias.length > 0) {
    console.log(`\n[ERROR] ${divergencias.length} plan(s) com status divergente entre o frontmatter e o índice:`);
    divergencias.forEach(({ arquivo, statusIndice, statusFrontmatter }) => {
      console.log(`  - plan/${arquivo}: índice="${statusIndice}" × frontmatter="${statusFrontmatter}"`);
    });
  }

  if (divergencias.length === 0 && ponteirosMortos.length === 0) {
    console.log('\n[OK] Todo status do índice bate com o frontmatter da plan.');
    process.exit(0);
  }
  process.exit(1);
}

const isMain = path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1] || '');
if (isMain) {
  main();
}
