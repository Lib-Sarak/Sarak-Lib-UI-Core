// Gera a §1 (Fila de execução) de `specs/00-indice.md` a partir do
// frontmatter de `specs/plan/*.md` — fecha R17 (não transcrever fonte viva):
// a tabela era a última fonte ainda mantida à mão, e travava o commit quando
// o executor movia `status` na plan sem o revisor presente para espelhar o
// índice. Ver specs/plan/plan-20-gates-sem-vao.md §2.2 pelo desenho completo.
//
// Uso: `node scripts/generate-plan-index.mjs` (regera) | `--check` (exit 1
// se o commitado divergir do gerado agora).
//
// -------------------------------------------------------------------------
// LIMITES DECLARADOS (R18) — o que este gerador NÃO vê
// -------------------------------------------------------------------------
// 1. Só `specs/plan/*.md` de RAIZ — nunca `specs/plan/executadas/`. Uma plan
//    sintetizada já saiu da fila por definição (00-indice.md §4); mover o
//    arquivo para `executadas/` É o sinal de saída, não algo que este
//    gerador precisa decidir.
// 2. `objetivo` é campo OBRIGATÓRIO no frontmatter de toda plan ativa. Plan
//    sem ele faz o gerador FALHAR nomeando o arquivo — nunca inventa texto
//    nem deixa a célula vazia (decisão do dono, plan-20 §2.2, item 2).
// 3. A ORDEM da coluna `#` vem do bloco MARCADO atual em `specs/00-indice.md`
//    (a ordem em que os links `plan/plan-NN-*.md` aparecem HOJE dentro dos
//    marcadores) — nunca recalculada a partir de nenhum critério próprio.
//    Plan nova (slug ainda não listado no bloco) entra no FIM, em ordem
//    alfabética de slug entre as novas. Reordenar é ação do REVISOR: troca
//    duas linhas de lugar no bloco commitado e roda o gerador de novo — a
//    nova ordem volta como está.
// 4. O gerador NUNCA faz merge célula a célula: ele reescreve a tabela
//    INTEIRA dentro dos marcadores, a cada rodada. Texto editorial dentro do
//    bloco marcado não sobrevive — é por isso que o bloco só contém a
//    tabela, nunca prosa do revisor (essa fica fora dos marcadores, imune).
// -------------------------------------------------------------------------
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PLAN_DIR = path.join(ROOT, 'specs', 'plan');
const INDICE_FILE = path.join(ROOT, 'specs', '00-indice.md');

const MARKER = 'SARAK-INDICE:FILA';
const OPEN = `<!-- ${MARKER}:INICIO -->`;
const CLOSE = `<!-- ${MARKER}:FIM -->`;

function readFrontmatter(content, file) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) throw new Error(`[plan-index] ${file}: frontmatter ausente ou malformado.`);
  return match[1];
}

function field(frontmatter, key) {
  const m = frontmatter.match(new RegExp(`^${key}:\\s*"([^"]*)"\\s*$`, 'm'));
  return m ? m[1] : null;
}

/** Coleta as plans ATIVAS (specs/plan/*.md de raiz) com seus campos de frontmatter. */
export function collectPlans({ planDir = PLAN_DIR } = {}) {
  const files = fs.readdirSync(planDir).filter((f) => /^plan-\d+-.*\.md$/.test(f));
  const plans = [];
  const semObjetivo = [];

  for (const file of files) {
    const slug = file.replace(/\.md$/, '');
    const content = fs.readFileSync(path.join(planDir, file), 'utf8');
    const frontmatter = readFrontmatter(content, file);
    const objetivo = field(frontmatter, 'objetivo');
    if (!objetivo) {
      semObjetivo.push(file);
      continue;
    }
    plans.push({
      slug,
      file,
      objetivo,
      dependeDe: field(frontmatter, 'depende_de') || '',
      status: field(frontmatter, 'status') || '',
      destino: field(frontmatter, 'destino_sintese') || '',
    });
  }

  if (semObjetivo.length > 0) {
    throw new Error(
      `[plan-index] ${semObjetivo.length} plan(s) sem campo 'objetivo' no frontmatter: ${semObjetivo.join(', ')}. ` +
        'Adicione uma linha no infinitivo — o gerador nunca inventa texto.',
    );
  }
  return plans;
}

/** Ordem atual dos slugs dentro do bloco marcado de `specs/00-indice.md`. */
function currentOrder(indiceContent) {
  const start = indiceContent.indexOf(OPEN);
  const end = indiceContent.indexOf(CLOSE);
  if (start === -1 || end === -1 || end < start) {
    throw new Error(`[plan-index] marcador ${OPEN} … ${CLOSE} ausente ou invertido em specs/00-indice.md.`);
  }
  const block = indiceContent.slice(start, end);
  const order = [];
  for (const m of block.matchAll(/\[(plan-\d+-[\w-]+)\]\(plan\//g)) order.push(m[1]);
  return order;
}

/** Ordem preservada + plans novas (slug ainda não listado) no fim, alfabético entre si. */
export function orderPlans(plans, order) {
  const bySlug = new Map(plans.map((p) => [p.slug, p]));
  const ordered = [];
  for (const slug of order) {
    const p = bySlug.get(slug);
    if (p) {
      ordered.push(p);
      bySlug.delete(slug);
    }
  }
  const novas = [...bySlug.values()].sort((a, b) => a.slug.localeCompare(b.slug));
  return [...ordered, ...novas];
}

function renderTable(ordered) {
  const header = '| # | Plan | Objetivo | Depende de | Status | Destino |\n|---|---|---|---|---|---|';
  const rows = ordered.map((p, i) => {
    const dep = p.dependeDe.trim() === '' ? '—' : p.dependeDe;
    return `| ${i + 1} | [${p.slug}](plan/${p.file}) | ${p.objetivo} | ${dep} | ${p.status} | ${p.destino} |`;
  });
  return [header, ...rows].join('\n');
}

/** Monta o bloco (tabela) que vai entre os marcadores, a partir do estado real do repositório. */
export function buildIndiceTable({ planDir = PLAN_DIR, indiceContent } = {}) {
  const plans = collectPlans({ planDir });
  const order = currentOrder(indiceContent);
  const ordered = orderPlans(plans, order);
  return renderTable(ordered);
}

function injectBlock(content, body) {
  const start = content.indexOf(OPEN);
  const end = content.indexOf(CLOSE);
  if (start === -1 || end === -1 || end < start) {
    throw new Error(`[plan-index] marcador ${OPEN} … ${CLOSE} ausente ou invertido em specs/00-indice.md.`);
  }
  const head = content.slice(0, start + OPEN.length);
  const tail = content.slice(end);
  return `${head}\n${body}\n${tail}`;
}

function main() {
  const isCheck = process.argv.includes('--check');
  const current = fs.readFileSync(INDICE_FILE, 'utf8');
  const table = buildIndiceTable({ indiceContent: current });
  const next = injectBlock(current, table);

  if (isCheck) {
    if (current === next) {
      console.log('[plan-index:check] specs/00-indice.md §1 em dia com o frontmatter das plans.');
      process.exit(0);
    }
    console.error(
      '[plan-index:check] specs/00-indice.md §1 DEFASADA em relação ao frontmatter das plans. ' +
        'Rode `npm run plan-index` e commite o resultado.',
    );
    process.exit(1);
  }

  fs.writeFileSync(INDICE_FILE, next, 'utf8');
  const total = table.split('\n').length - 2; // menos header + separador
  console.log(`[plan-index] specs/00-indice.md §1 regenerada — ${total} plan(s) ativa(s).`);
}

const isMain = path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1] || '');
if (isMain) main();
