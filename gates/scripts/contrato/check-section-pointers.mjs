// Detector de ponteiro de SEÇÃO (`§N.N`) — vão nº 7 de [[01-gates-e-baseline]]
// §9.2. R23 (zero ponteiro morto na documentação gerada) e R17 (não
// transcrever fonte viva) cobram caminho/`npm run`/`node` via
// `scripts/dev-kit/deadPointers.mjs`, mas nenhum gate validava a referência
// de SEÇÃO em si — e é onde a regra estava sendo violada: o achado 29
// (`sarak-dev/GUIA-MANUTENCAO.md:308`) manda "regenere com o script do
// §5.1 do guia", e a seção §5 não tem subseção `.1` nenhuma — o alvo real é
// o §2.
//
// -------------------------------------------------------------------------
// LIMITES DECLARADOS (R18) — o que este gate NÃO vê
// -------------------------------------------------------------------------
// 1. ESCOPO: `specs/**/*.md` (exceto `specs/plan/` — rastro append-only,
//    cobrar ponteiro nele reprovaria o repositório para sempre),
//    `.agents/skills/*/SKILL.md`, `sarak-dev/*.md`, `sarak-ui/*.md` e
//    `README.md` da raiz. NÃO varre comentário de código-fonte (`.ts`/
//    `.tsx`) — escopo deliberadamente menor, para não multiplicar o
//    risco de falso-positivo numa primeira versão do detector (ele já
//    nasce com duas heurísticas de convenção, ver abaixo).
// 2. ESTA VERSÃO SÓ VALIDA AUTORREFERÊNCIA (`§N.N` apontando para uma seção
//    do PRÓPRIO arquivo) — decisão tomada DEPOIS de medir. A primeira
//    tentativa resolvia `[[WikiLink]] §N.N` para o outro documento; rodada
//    contra o repositório real, ela também precisava reconhecer qualificador
//    por CAMINHO cru (`arquitetura/00-mapa-do-modulo.md §96`, sem colchetes
//    nem crase) — sem isso, o ponteiro era atribuído ao arquivo ERRADO (o
//    de origem, não o citado), produzindo acusação falsa. Resolver os dois
//    formatos de qualificador com confiança (sem reintroduzir a mesma classe
//    de erro) é mais trabalho do que cabe nesta rodada. Por isso: **todo
//    `§N.N` com QUALQUER qualificador de documento próximo (`[[...]]` OU um
//    trecho contendo `.md` nos 40 caracteres antes) é IGNORADO** — nem
//    validado nem acusado — e só a autorreferência (a maioria medida, e o
//    caso do achado 29) é coberta. Declarado, não escondido: cobertura
//    cross-documento fica para uma iteração futura.
// 3. AS DUAS CONVENÇÕES QUE PRECISAM ESTAR CODIFICADAS ANTES DE LIGAR (a
//    causa dos "16 de 23 são ruído" que a plan-06 mediu como sonda):
//      a) `§N.M` pode ser uma SUBSEÇÃO real (heading `## N.M ...` em
//         qualquer nível, sem exigir um heading pai `# N` imediatamente
//         acima — "## 2.1 sem # 2 pai" é válido);
//      b) OU pode ser "item M da LISTA NUMERADA da seção N" (`§7.3` = item
//         3 de uma lista `1. 2. 3.` sob o heading `# 7`) — convenção viva
//         em `00-prompt-executor` §7 e `01-gates-e-baseline` §6.1. Um
//         heading "N.M" tem PRIORIDADE; na ausência dele, conta os itens
//         numerados de nível 1 sob a seção N e aceita se M estiver dentro
//         da contagem.
//      Só quando NENHUMA das duas resolve é que o ponteiro é MORTO.
// -------------------------------------------------------------------------
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');

const SCOPE_GLOBS = [
  { dir: 'specs', exclude: (p) => p.split(path.sep).includes('plan') },
  { dir: '.agents/skills', filter: (p) => p.endsWith('SKILL.md') },
  { dir: 'sarak-dev', filter: (p) => p.endsWith('.md') },
  { dir: 'sarak-ui', filter: (p) => p.endsWith('.md') },
];

function walkMd(dir, { exclude, filter } = {}, out = []) {
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) return out;
  for (const entry of fs.readdirSync(abs)) {
    const full = path.join(abs, entry);
    const rel = path.relative(ROOT, full);
    if (fs.statSync(full).isDirectory()) {
      if (!exclude || !exclude(rel)) walkMd(rel, { exclude, filter }, out);
    } else if (full.endsWith('.md') && (!filter || filter(full))) {
      out.push(rel.split(path.sep).join('/'));
    }
  }
  return out;
}

function collectScopeFiles() {
  const files = new Set();
  for (const { dir, exclude, filter } of SCOPE_GLOBS) walkMd(dir, { exclude, filter }).forEach((f) => files.add(f));
  const readme = path.join(ROOT, 'README.md');
  if (fs.existsSync(readme)) files.add('README.md');
  return [...files];
}

/** Headings de um arquivo: [{ numero: "2.1", nivel, linhaInicio, linhaFim }]. */
function extractHeadings(content) {
  const lines = content.split('\n');
  const headings = [];
  lines.forEach((line, i) => {
    const m = line.match(/^(#{1,6})\s*§?(\d+(?:\.\d+)?)\b/);
    if (m) headings.push({ numero: m[2], nivel: m[1].length, linha: i });
  });
  headings.forEach((h, idx) => {
    const proximoMesmoNivelOuMenor = headings.slice(idx + 1).find((h2) => h2.nivel <= h.nivel);
    h.fimExclusivo = proximoMesmoNivelOuMenor ? proximoMesmoNivelOuMenor.linha : lines.length;
  });
  return { headings, lines };
}

/** Quantos itens de lista numerada de nível 1 (`1. `, `2. `...) existem sob a seção N. */
function countNumberedItems(lines, secao, headings) {
  const alvo = headings.find((h) => h.numero === String(secao));
  if (!alvo) return 0;
  const corpo = lines.slice(alvo.linha + 1, alvo.fimExclusivo);
  return corpo.filter((l) => /^\s*\d+\.\s/.test(l)).length;
}

/** Um pointer §N.M resolve se existe heading N.M, OU se M está dentro da
 * contagem de itens numerados da seção N. */
function pointerResolves(target, numero) {
  const { headings, lines } = target;
  if (headings.some((h) => h.numero === numero)) return true;
  const [secao, item] = numero.split('.');
  if (!item) return false;
  const total = countNumberedItems(lines, secao, headings);
  return Number(item) <= total;
}

export function checkSectionPointers({ root = ROOT, files = null } = {}) {
  const scopeFiles = files ?? collectScopeFiles();
  const parsed = new Map();
  for (const rel of scopeFiles) {
    const content = fs.readFileSync(path.join(root, rel), 'utf8');
    parsed.set(rel, extractHeadings(content));
  }

  const mortos = [];
  let ignoradosComQualificador = 0;

  for (const rel of scopeFiles) {
    const { lines } = parsed.get(rel);
    lines.forEach((line, i) => {
      for (const m of line.matchAll(/§(\d+(?:\.\d+)?)/g)) {
        const numero = m[1];
        const antes = line.slice(Math.max(0, m.index - 40), m.index);

        // Qualquer sinal de referência a OUTRO documento (wikilink ou
        // menção a um caminho `.md`) — não resolvido nesta versão, ver R18.
        if (/\[\[[\w-]+\]\]/.test(antes) || /\.md\b/.test(antes)) {
          ignoradosComQualificador++;
          continue;
        }

        if (!pointerResolves(parsed.get(rel), numero)) {
          mortos.push({ arquivo: rel, linha: i + 1, secao: numero });
        }
      }
    });
  }

  return { mortos, ignoradosComQualificador };
}

function main() {
  console.log('--- check-section-pointers (vão 7 — R23/R17) ---');
  const { mortos, ignoradosComQualificador } = checkSectionPointers();

  console.log(`(${ignoradosComQualificador} ponteiro(s) cross-documento ignorado(s) — fora do escopo desta versão, ver R18 no cabeçalho do script)`);

  if (mortos.length === 0) {
    console.log('\n[OK] Nenhum ponteiro de seção (autorreferência) morto.');
    process.exit(0);
  }

  console.log(`\n[ERROR] ${mortos.length} ponteiro(s) de seção morto(s):`);
  mortos.forEach((p) => console.log(`  - ${p.arquivo}:${p.linha} -> §${p.secao} (não existe como heading nem como item numerado NESTE arquivo)`));
  process.exit(1);
}

const isMain = path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1] || '');
if (isMain) {
  main();
}
