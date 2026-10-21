// Sincronia entre o `status` do frontmatter de cada plan e a coluna Status da
// tabela §1 (Fila de execução) de `specs/00-indice.md`. Falhou 2x nesta
// campanha (plan-02, plan-13) — vão nº 12 de [[01-gates-e-baseline]] §9.2.
//
// Também confere a §4 (Referências obrigatórias) de cada plan ativa: todo
// caminho de arquivo/pasta e todo wikilink citado ali tem de existir — um
// ponteiro para spec que nunca existiu atravessava escrita, revisão e despacho.
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
// 4. Na §4 de cada plan, linha do tipo Skill NÃO é resolvida — skill é
//    referida por nome e mora fora do repositório. Só é resolvido o que está
//    em crase E tem barra (caminho), e o `[[wikilink]]`. Nome solto em crase
//    sem barra (`catalog.ts`), glob (`*`), metavariável (`<nome>`) e prosa sem
//    crase ("os arquivos de §3.1") não são lidos. Caminho vale se existir
//    relativo à raiz do repositório OU a `specs/`; wikilink vale se houver
//    `<nome>.md` em qualquer pasta de `specs/`.
// -------------------------------------------------------------------------
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const INDICE_PATH = path.join(ROOT, 'specs', '00-indice.md');
const PLAN_DIR = path.join(ROOT, 'specs', 'plan');
const SPECS_DIR = path.join(ROOT, 'specs');

const SECAO_REFERENCIAS_RE = /^# 4\. Referências obrigatórias[^\n]*\n([\s\S]*?)(?=^# \d+\.|(?![\s\S]))/m;
const CRASE_RE = /`([^`]+)`/g;
const WIKILINK_RE = /\[\[([^\]|#]+)/g;
const SUFIXO_LINHA_RE = /:\d+(?:-\d+)?$/;

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

function ehCaminhoResolvivel(token) {
  if (!token.includes('/')) return false;
  return !/[\s*<>{}]/.test(token);
}

function listarNomesDeSpec(dir, out = new Set()) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) listarNomesDeSpec(path.join(dir, entry.name), out);
    else if (entry.name.endsWith('.md')) out.add(entry.name.slice(0, -3));
  }
  return out;
}

function extrairReferenciasDaSecao4(planTexto) {
  const secao = planTexto.match(SECAO_REFERENCIAS_RE);
  if (!secao) return [];
  const referencias = [];
  for (const linha of secao[1].split('\n')) {
    if (!linha.trim().startsWith('|')) continue;
    const cols = linha.split('|').map((c) => c.trim());
    if (/skill/i.test(cols[1] ?? '')) continue;
    const celula = cols[2] ?? '';
    for (const m of celula.matchAll(CRASE_RE)) {
      const token = m[1].replace(SUFIXO_LINHA_RE, '');
      if (ehCaminhoResolvivel(token)) referencias.push({ tipo: 'caminho', valor: token });
    }
    for (const m of celula.matchAll(WIKILINK_RE)) referencias.push({ tipo: 'wikilink', valor: m[1].trim() });
  }
  return referencias;
}

/**
 * Ponteiros mortos na §4 de cada plan de `planDir`.
 * @returns {{ponteirosMortosNaSecao4: Array<{plan: string, referencia: string}>}}
 */
export function checkPlanReferences({ planDir = PLAN_DIR, root = ROOT, specsDir = SPECS_DIR } = {}) {
  const ponteirosMortosNaSecao4 = [];
  if (!fs.existsSync(planDir)) return { ponteirosMortosNaSecao4 };
  const nomesDeSpec = listarNomesDeSpec(specsDir);

  for (const arquivo of fs.readdirSync(planDir).filter((f) => f.endsWith('.md')).sort()) {
    const texto = fs.readFileSync(path.join(planDir, arquivo), 'utf8');
    for (const { tipo, valor } of extrairReferenciasDaSecao4(texto)) {
      const existe = tipo === 'wikilink'
        ? nomesDeSpec.has(valor)
        : fs.existsSync(path.join(root, valor)) || fs.existsSync(path.join(specsDir, valor));
      if (!existe) ponteirosMortosNaSecao4.push({ plan: arquivo, referencia: tipo === 'wikilink' ? `[[${valor}]]` : valor });
    }
  }
  return { ponteirosMortosNaSecao4 };
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
  const { ponteirosMortosNaSecao4 } = checkPlanReferences();

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

  if (ponteirosMortosNaSecao4.length > 0) {
    console.log(`\n[ERROR] ${ponteirosMortosNaSecao4.length} referência(s) da §4 apontam para o que não existe:`);
    ponteirosMortosNaSecao4.forEach(({ plan, referencia }) => console.log(`  - plan/${plan}: ${referencia}`));
  }

  if (divergencias.length === 0 && ponteirosMortos.length === 0 && ponteirosMortosNaSecao4.length === 0) {
    console.log('\n[OK] Todo status do índice bate com o frontmatter da plan, e toda referência da §4 existe.');
    process.exit(0);
  }
  process.exit(1);
}

const isMain = path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1] || '');
if (isMain) {
  main();
}
