// Detector de ponteiro de SEÇÃO (`§N.N`) — vão nº 7 de [[01-gates-e-baseline]]
// §9.2. R23 (zero ponteiro morto na documentação gerada) e R17 (não
// transcrever fonte viva) cobram caminho/`npm run`/`node` via
// `scripts/dev-kit/deadPointers.mjs`, mas nenhum gate validava a referência
// de SEÇÃO em si — e é onde a regra estava sendo violada: o achado 29
// (`sarak-dev/GUIA-MANUTENCAO.md:308`) manda "regenere com o script do
// §5.1 do guia", e a seção §5 não tem subseção `.1` nenhuma — o alvo real é
// o §2.
//
// CALIBRAÇÃO (plan-17, 2026-08-08): a `plan-15` mediu dois falsos positivos
// na versão original — (a) `§N.M` que é RÓTULO DE LINHA DE TABELA
// (`| **5.1** |`), não heading nem item de lista numerada; (b) `§N.M` com
// qualificador de outro documento que EXISTE mas não era reconhecido, por
// viver fora da janela de 40 caracteres ANTES do `§`, ou DEPOIS do `§`, ou
// numa linha ADJACENTE, ou em forma de PROSA ("do guia", "da spec"). A
// convenção 3c e o item 4 abaixo resolvem os dois — sem tentar RESOLVER
// cross-documento, só a decidir se IGNORA (ver o item 2).
//
// FECHAMENTO DE ESCOPO (plan-20, 2026-08-10): três consertos, sem afrouxar
// R23 — só ensinar o gate a ler o que a prosa já dizia. (a) `§N.M` FECHADO
// entre crases (`` `§7.3` ``) é CITAÇÃO — a frase está descrevendo o que uma
// string/notação É, não apontando para uma seção; vira `ignoradosComoCitacao`
// (item 5). (b) `plan/NN` (sem `.md`, sem wikilink) passa a ser qualificador
// de documento reconhecido — `11-testes-e-cobertura.md:113` cita `plan/20
// §2.3`, e sem isso o `§` era tratado como autorreferência morta. (c) a
// regra de linha VIZINHA (item 4) foi ESTREITADA: a linha ANTERIOR saiu —
// medido (probe isolado, 2026-08-10): rodando com ela de volta, os números
// (`mortos`, `ignoradosComQualificador`, `ignoradosComoCitacao`) são
// IDÊNTICOS aos de sem ela — a metade "anterior" nunca comprou nenhum caso
// sozinha neste corpus, então ela sai. A linha SEGUINTE só é consultada
// quando a ATUAL não termina a frase (sem pontuação terminal `. : ; ! ? |` e
// sem fechar célula de tabela) — "continuação de linha" é o fenômeno real;
// "vizinhança" (as duas direções, sempre) era uma aproximação larga demais
// dele.
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
//    `§N.N` com QUALQUER qualificador de documento reconhecido (ver item 4)
//    é IGNORADO** — nem validado nem acusado — e só a autorreferência (a
//    maioria medida) é coberta. Declarado, não escondido: cobertura
//    cross-documento (resolver contra o ARQUIVO CERTO) fica para uma
//    iteração futura — este gate nunca tenta resolver fora do próprio
//    arquivo, só decide se ignora.
// 3. AS TRÊS CONVENÇÕES QUE PRECISAM ESTAR CODIFICADAS ANTES DE LIGAR (a
//    causa dos "16 de 23 são ruído" que a plan-06 mediu como sonda):
//      a) `§N.M` pode ser uma SUBSEÇÃO real (heading `## N.M ...` em
//         qualquer nível, sem exigir um heading pai `# N` imediatamente
//         acima — "## 2.1 sem # 2 pai" é válido);
//      b) OU pode ser "item M da LISTA NUMERADA da seção N" (`§7.3` = item
//         3 de uma lista `1. 2. 3.` sob o heading `# 7`) — convenção viva
//         em `00-prompt-executor` §7 e `01-gates-e-baseline` §6.1. Um
//         heading "N.M" tem PRIORIDADE; na ausência dele, conta os itens
//         numerados de nível 1 sob a seção N e aceita se M estiver dentro
//         da contagem;
//      c) OU pode ser "rótulo de linha de TABELA da seção N" (`§5.1` = uma
//         linha `| **5.1** | ... |` no início de linha, em algum lugar do
//         corpo da seção `# 5`) — convenção viva em
//         `10-seguranca-e-acessibilidade.md` §5 (plan-17, medido: 4
//         ocorrências). Só testada depois de (a) e (b) não resolverem.
//      Só quando NENHUMA das três resolve é que o ponteiro é MORTO.
// 4. QUALIFICADOR DE DOCUMENTO — reconhecimento AMPLIADO (plan-17) e depois
//    ESTREITADO (plan-20): um `§N.M` é IGNORADO (não validado, não acusado)
//    quando a LINHA em que ele vive contém `[[WikiLink]]`, um trecho `.md`,
//    `plan/NN`, OU uma forma em PROSA ("do guia", "da spec", "desta spec",
//    "deste guia/documento") — em QUALQUER posição da linha —, OU quando a
//    linha SEGUINTE contém um desses sinais E a linha atual NÃO termina a
//    frase (sem pontuação terminal `. : ; ! ? |`, sem fechar célula de
//    tabela). A linha ANTERIOR NÃO é mais consultada — plan-17 a incluía;
//    plan-20 mediu (probe isolado) que ela nunca resolvia nenhum caso
//    sozinha neste corpus e a removeu, porque cada lado a mais do "IGNORE"
//    é sub-cobertura em potencial, e sub-cobertura que não compra nada não
//    se justifica.
//
//    PONTO CEGO, e é o preço do alargamento que sobra (linha atual +
//    seguinte, quando a atual não fecha a frase): uma linha que cite
//    qualquer outro documento (ou a seguinte, quando a atual continua) faz
//    TODO `§N.M` daquela linha ser ignorado, mesmo que algum desses
//    ponteiros seja autorreferência morta de verdade. Aceito porque o gate
//    nunca passa a RESOLVER contra o arquivo citado — só decide não
//    acusar —, então o único efeito colateral possível é sub-cobertura (um
//    morto real escapa), nunca acusação falsa num arquivo errado.
//
//    A MAGNITUDE (medida em 2026-08-10, contra o corpus de `§N.M` do escopo
//    atual — 462 ocorrências): `ignoradosComQualificador` = **169** (era
//    184 antes do conserto b/c desta rodada — a remoção da linha ANTERIOR
//    reduziu o total de ignorados, porque menos linhas caem no IGNORE só
//    por vizinhança; `plan/NN` como qualificador novo empurra na direção
//    oposta, mas o líquido caiu). Cobertura validada: **288 de 462** (62%,
//    era 277 antes desta rodada) — sobe, como R23 exige, e não desce em
//    nenhum arquivo (medido por diff de `mortos`, sempre 0 nesta execução).
// 5. `§N.M` FECHADO entre crases (`` `§N.M` ``, backtick imediatamente antes
//    do `§` e imediatamente depois do número) é CITAÇÃO, não ponteiro —
//    conta em `ignoradosComoCitacao`, nunca em `mortos` nem em
//    `ignoradosComQualificador`. Medido (2026-08-10): **5** ocorrências no
//    corpus atual (`01-gates-e-baseline.md:164,572`,
//    `15-divida-conhecida.md` — 3 na mesma linha), todas citação de verdade
//    (a prosa está descrevendo o que uma string/notação diz, não apontando
//    para uma seção deste documento). PONTO CEGO: um autor que quisesse
//    citar uma notação (`` `§N.M` ``) SEM que ela fosse uma citação de
//    verdade — o que não tem uso conhecido nesta base — escaparia do gate.
//    Aceito pela mesma razão do item 4: o efeito só pode ser sub-cobertura.
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

/** Convenção 3c: `§N.M` resolve se existe, em algum lugar do corpo da seção
 * N, uma linha de tabela cuja primeira célula é o rótulo `**N.M**`. */
function hasTableRowLabel(lines, secao, numero, headings) {
  const alvo = headings.find((h) => h.numero === String(secao));
  if (!alvo) return false;
  const corpo = lines.slice(alvo.linha + 1, alvo.fimExclusivo);
  const rotuloEscapado = numero.replace(/\./g, '\\.');
  const linhaDeTabela = new RegExp(`^\\s*\\|\\s*\\*\\*${rotuloEscapado}\\*\\*\\s*\\|`);
  return corpo.some((l) => linhaDeTabela.test(l));
}

/** Um pointer §N.M resolve se existe heading N.M, se M está dentro da
 * contagem de itens numerados da seção N, OU se M é rótulo de linha de
 * tabela da seção N (convenção 3c, ver LIMITES DECLARADOS). */
function pointerResolves(target, numero) {
  const { headings, lines } = target;
  if (headings.some((h) => h.numero === numero)) return true;
  const [secao, item] = numero.split('.');
  if (!item) return false;
  const total = countNumberedItems(lines, secao, headings);
  if (Number(item) <= total) return true;
  return hasTableRowLabel(lines, secao, numero, headings);
}

const WIKILINK_RE = /\[\[[\w-]+\]\]/;
const MD_MENTION_RE = /\.md\b/;
// `plan/NN` é qualificador de documento reconhecido (plan-20, conserto b):
// `11-testes:113` cita `plan/20 §2.3` — o `§` é ponteiro para OUTRO
// documento (a plan 20), não autorreferência, mesmo sem `.md` nem wikilink.
const PLAN_QUALIFIER_RE = /\bplan\/\d+\b/i;
// Formas em prosa que nomeiam "outro documento" sem `.md` nem wikilink —
// ver item 4 do LIMITES DECLARADOS.
const PROSE_QUALIFIER_RE = /\bd[oa]\s+(guia|specs?)\b|\bdaquela\s+specs?\b|\bde(?:ste|sta)\s+(documento|guia|specs?)\b/i;
// Pontuação terminal + fechamento de célula de tabela (conserto c): uma
// linha "termina a frase" quando acaba com um destes, ignorando espaço à
// direita. `|` cobre tanto fim de frase quanto fim de célula de tabela.
const SENTENCE_END_RE = /[.:;!?|]\s*$/;

/** Uma linha tem sinal de qualificador de OUTRO documento — wikilink, menção
 * `.md`, `plan/NN`, ou forma em prosa ("do guia", "da spec"...). */
function lineHasQualifierSignal(line) {
  if (line == null) return false;
  return WIKILINK_RE.test(line) || MD_MENTION_RE.test(line) || PLAN_QUALIFIER_RE.test(line) || PROSE_QUALIFIER_RE.test(line);
}

/** A linha "termina a frase" — acaba em pontuação terminal ou fecha célula
 * de tabela. Linha vazia/inexistente conta como terminada (nada a continuar
 * nela). Só quando ISSO for falso é que a linha SEGUINTE é consultada —
 * continuação de linha é o fenômeno real; "vizinhança" era aproximação
 * larga demais dele (ver LIMITES DECLARADOS, item 4). */
function lineEndsSentence(line) {
  if (line == null) return true;
  const trimmed = line.replace(/\s+$/, '');
  if (trimmed === '') return true;
  return SENTENCE_END_RE.test(trimmed);
}

/** Qualificador AMPLIADO (item 4 do LIMITES DECLARADOS): a própria linha,
 * OU a linha SEGUINTE quando a atual não termina a frase — nunca mais a
 * linha ANTERIOR (medido: não comprava nenhum caso real sozinha, ver item
 * 4). Só decide IGNORAR; nunca resolve cross-documento. */
function hasDocumentQualifier(line, linhaSeguinte) {
  if (lineHasQualifierSignal(line)) return true;
  if (!lineEndsSentence(line)) return lineHasQualifierSignal(linhaSeguinte);
  return false;
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
  let ignoradosComoCitacao = 0;

  for (const rel of scopeFiles) {
    const { lines } = parsed.get(rel);
    lines.forEach((line, i) => {
      for (const m of line.matchAll(/§(\d+(?:\.\d+)?)/g)) {
        const numero = m[1];

        // Conserto (a): `§N.M` FECHADO entre crases (`` `§7.3` ``) é
        // CITAÇÃO — o texto está descrevendo o que uma string/notação É, não
        // apontando para uma seção. Ver R18 item 5.
        if (line[m.index - 1] === '`' && line[m.index + m[0].length] === '`') {
          ignoradosComoCitacao++;
          continue;
        }

        // Qualquer sinal de referência a OUTRO documento (wikilink, menção
        // `.md`, `plan/NN` ou forma em prosa) na própria linha, ou na
        // seguinte quando a atual não termina a frase — não resolvido nesta
        // versão, ver R18 item 4.
        if (hasDocumentQualifier(line, lines[i + 1])) {
          ignoradosComQualificador++;
          continue;
        }

        if (!pointerResolves(parsed.get(rel), numero)) {
          mortos.push({ arquivo: rel, linha: i + 1, secao: numero });
        }
      }
    });
  }

  return { mortos, ignoradosComQualificador, ignoradosComoCitacao };
}

function main() {
  console.log('--- check-section-pointers (vão 7 — R23/R17) ---');
  const { mortos, ignoradosComQualificador, ignoradosComoCitacao } = checkSectionPointers();

  console.log(`(${ignoradosComQualificador} ponteiro(s) cross-documento ignorado(s) — fora do escopo desta versão, ver R18 no cabeçalho do script)`);
  console.log(`(${ignoradosComoCitacao} ponteiro(s) ignorado(s) por serem CITAÇÃO — §N.M fechado entre crases, ver R18 item 5)`);

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
