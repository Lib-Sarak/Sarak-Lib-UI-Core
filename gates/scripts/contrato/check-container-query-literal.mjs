// plan-39 — o scanner do Tailwind v4 lê o arquivo como TEXTO; não avalia JavaScript.
// Uma classe de container query montada por interpolação de template literal
// (`` `@min-[${CONST}px]:flex` ``) nunca é uma classe válida no TEXTO do arquivo — o
// scanner a descarta, a regra correspondente nunca é gerada no CSS publicado, e o
// elemento fica com uma classe morta em runtime (achado da plan-35 §11, conserto na
// plan-39). Este gate impede que a divergência volte: nenhum arquivo de produção pode
// montar `@min-[…]` por interpolação — toda ocorrência tem de ser LITERAL, com o teste
// companheiro afirmando a igualdade contra a forma interpolada (pega deriva de
// constante sem reintroduzir o problema).
//
// Emenda §2.0 da plan-39 (durante a execução): a mesma classe de defeito também
// derrubava o build por outra porta — a detecção AUTOMÁTICA de conteúdo do Tailwind
// v4 varre o repositório INTEIRO (`.md` incluído, respeitando só `.gitignore`), então
// uma spec que cite o nome de uma classe de container query em prosa injeta regra no
// CSS publicado ou derruba o build. `src/styles/sarak-base.css` passou a declarar
// `source(none)`, restringindo o scan ao `@source` explícito. Este gate cobra também
// que essa restrição não seja removida sem querer.
//
// plan-44 — o OUTRO lado da mesma armadilha, e ele derrubou o build de verdade (não
// só gerou classe morta): um `@min-[X]:<utilitário>` LITERAL — sem interpolação
// nenhuma — em que `X` não é uma medida CSS válida (`SarakGrid.tsx:57` tinha
// `@min-[…]:grid-cols-N`; `SarakGrid.test.tsx:12` tinha `@min-[…]:grid-cols-12`,
// dentro de um COMENTÁRIO). O Tailwind aceitou os dois como candidato — são texto
// literal, não interpolado — e gerou `@container (width >= …)`; o `lightningcss` do
// `build:css:scoped` recusa essa media query e o build morre. O checador de
// interpolação acima não via nenhum dos dois: nem `${` (não havia), nem estavam fora
// de `__tests__/` (o segundo estava DENTRO). `findInvalidMeasureContainerQueries`
// cobre esse buraco: varre TODO `src/**/*.{ts,tsx}` — **inclusive `__tests__/`**,
// de propósito — atrás de `@min-[X]:<utilitário>` literal (sem `${`) cujo `X` não é
// `número + unidade CSS`, comentário ou não.
//
// -------------------------------------------------------------------------
// LIMITES DECLARADOS (R18) — o que este gate NÃO vê
// -------------------------------------------------------------------------
// 1. É ESTÁTICO — não constrói CSS. Prova só que o NOME da classe está soletrado
//    literal no arquivo; não prova que a regra correspondente foi de fato GERADA no
//    `dist/sarak.css` publicado. Essa prova exige rodar `npm run build` e comparar
//    (é o que a §8 da plan-39 faz, e o que fica registrado no baseline de release).
// 2. Só detecta o padrão TEXTUAL `@min-[${` (abertura de interpolação de template
//    literal logo após o colchete) e o padrão TEXTUAL `@min-[X]:<utilitário>` com
//    `X` fora de `número + unidade`. Uma classe montada por concatenação de string
//    (`'@min-[' + N + 'px]:'`) ou por `String.raw` escaparia — nenhum caso assim
//    existe hoje no repositório (medido, plan-39).
// 3. Escopo DIFERENTE por checador, de propósito: a checagem de INTERPOLAÇÃO
//    (`findInterpolatedContainerQueries`) exclui `__tests__/` — é o idioma do teste
//    companheiro, que interpola por design para pegar deriva de constante, e
//    interpolação nunca forma candidato real (é inerte para o build). A checagem de
//    MEDIDA INVÁLIDA (`findInvalidMeasureContainerQueries`, plan-44) varre
//    `__tests__/` TAMBÉM — foi exatamente um comentário dentro de `__tests__/` que
//    a exclusão anterior deixou passar e quebrou o build. As duas nunca se
//    sobrepõem: a checagem de medida IGNORA qualquer bracket que contenha `${`
//    (delega para a de interpolação, ou aceita como idioma de teste).
// 4. `findInvalidMeasureContainerQueries` não valida se `<utilitário>` é um nome de
//    classe REAL do Tailwind — qualquer identificador (`[A-Za-z][\w-]*`) logo após
//    `]:` conta como candidato. Falso positivo possível (`]:algumaPalavra` que não é
//    utilitário nenhum) é aceito de propósito: o custo de reescrever um comentário é
//    baixo, o custo de um miss é o build quebrar nos consumidores.
// 5. É por TEXTO DE LINHA, não por AST — não distingue código de comentário, nos
//    dois checadores. Uma linha de comentário que reproduza qualquer um dos dois
//    padrões também é acusada, de propósito: é a mesma armadilha que quebrou o
//    build (comentário textual também é varrido pelo scanner do Tailwind).
//    Descreva o mecanismo em prosa sem reproduzir o padrão literal — os comentários
//    de `SarakGrid.tsx`/`SarakGrid.test.tsx` (plan-44) mostram como.
// 6. A checagem de `sarak-base.css` (emenda §2.0) é TEXTUAL — confere que a linha do
//    `@import "tailwindcss"` contém `source(none)` e que existe pelo menos um
//    `@source` não vazio no arquivo. Não valida se o glob do `@source` ainda é amplo
//    o bastante para cobrir todo `.tsx`/`.ts` de produção — isso é responsabilidade
//    de quem editar a linha, e o `container-query:check` (a varredura acima) continua
//    sendo quem prova que a classe está soletrada.
// 7. `findInvalidMeasureContainerQueries` fecha a família `@min-[X]:` com `X`
//    inválido — a que já quebrou o build duas vezes. Não generaliza para outras
//    variantes arbitrárias do Tailwind (`@max-[…]`, `data-[…]`, etc.); nenhuma delas
//    tem precedente de quebra medido neste repositório até 2026-08-13.
// -------------------------------------------------------------------------
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const SRC = path.join(ROOT, 'src');
const SARAK_BASE_CSS = path.join(SRC, 'styles', 'sarak-base.css');
const INTERPOLATION_RE = /@min-\[\$\{/;

function walkSourceFiles(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '__tests__') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkSourceFiles(full, out);
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

export function findInterpolatedContainerQueries({ root = SRC, relativeTo = ROOT } = {}) {
  const problemas = [];
  for (const file of walkSourceFiles(root)) {
    const rel = path.relative(relativeTo, file).split(path.sep).join('/');
    const lines = fs.readFileSync(file, 'utf8').split('\n');
    lines.forEach((line, i) => {
      if (INTERPOLATION_RE.test(line)) {
        problemas.push({ arquivo: rel, linha: i + 1 });
      }
    });
  }
  return problemas;
}

// plan-44 — walk que NÃO exclui __tests__/: ver LIMITES DECLARADOS item 3 do porquê.
function walkAllSourceFiles(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkAllSourceFiles(full, out);
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

const CANDIDATE_RE = /@min-\[([^\]]*)\]:([A-Za-z][\w-]*)/g;
const VALID_MEASURE_RE = /^\d+(?:\.\d+)?(?:px|rem|em|ch|vh|vw|vmin|vmax|pt|pc|cm|mm|in|q)$/i;

/** `X` de `@min-[X]:…` é uma medida CSS válida — número + unidade, nada mais. */
export function isValidMeasure(value) {
  return VALID_MEASURE_RE.test(value.trim());
}

/**
 * plan-44 — `@min-[X]:<utilitário>` LITERAL (sem `${`) em que `X` não é uma medida
 * válida. Diferente de `findInterpolatedContainerQueries`: varre `__tests__/`
 * também (item 3 do LIMITES DECLARADOS) e ignora qualquer bracket com `${` (já
 * coberto pelo outro checador, ou idioma aceito de teste).
 */
export function findInvalidMeasureContainerQueries({ root = SRC, relativeTo = ROOT } = {}) {
  const problemas = [];
  for (const file of walkAllSourceFiles(root)) {
    const rel = path.relative(relativeTo, file).split(path.sep).join('/');
    const lines = fs.readFileSync(file, 'utf8').split('\n');
    lines.forEach((line, i) => {
      for (const match of line.matchAll(CANDIDATE_RE)) {
        const [, medida, utilitario] = match;
        if (medida.includes('${')) continue;
        if (isValidMeasure(medida)) continue;
        problemas.push({ arquivo: rel, linha: i + 1, medida, utilitario });
      }
    });
  }
  return problemas;
}

/**
 * Emenda §2.0 — `sarak-base.css` tem de restringir o scan do Tailwind ao `@source`
 * explícito: a linha `@import "tailwindcss"` declara `source(none)`, e existe pelo
 * menos um `@source "…"` não vazio. Sem os dois, a detecção automática volta a
 * varrer o repositório inteiro.
 */
export function checkSourceRestriction({ file = SARAK_BASE_CSS } = {}) {
  if (!fs.existsSync(file)) {
    return [`${path.relative(ROOT, file)} não existe.`];
  }
  const css = fs.readFileSync(file, 'utf8');
  const problemas = [];

  const importLine = css.split('\n').find((l) => /@import\s+["']tailwindcss["']/.test(l));
  if (!importLine || !/source\(\s*none\s*\)/.test(importLine)) {
    problemas.push('`@import "tailwindcss"` não declara `source(none)` — a detecção automática de conteúdo volta a varrer o repositório inteiro (achado da plan-39, emenda §2.0).');
  }

  if (!/@source\s+["'][^"']+["']/.test(css)) {
    problemas.push('nenhum `@source "…"` explícito encontrado — sem ele, `source(none)` para de escanear `src/**/*.{ts,tsx}` também.');
  }

  return problemas;
}

function main() {
  console.log('--- check-container-query-literal (plan-39 + plan-44) ---');
  const problemas = findInterpolatedContainerQueries();
  const problemasMedida = findInvalidMeasureContainerQueries();
  const problemasFonte = checkSourceRestriction();

  if (problemas.length === 0 && problemasMedida.length === 0 && problemasFonte.length === 0) {
    console.log('[OK] Nenhuma classe de container query (@min-[…]) montada por interpolação ou com medida inválida em src/ (comentário incluído), e sarak-base.css restringe o scan do Tailwind (source(none) + @source explícito).');
    process.exit(0);
  }

  if (problemas.length > 0) {
    console.log(`[ERROR] ${problemas.length} classe(s) de container query montada(s) por interpolação — o scanner do Tailwind lê o arquivo como texto e nunca vê a forma interpolada:`);
    problemas.forEach((p) => console.log(`  - ${p.arquivo}:${p.linha}`));
    console.log('  Conserto: escreva a classe LITERAL; o teste companheiro afirma a igualdade contra a forma interpolada.');
  }

  if (problemasMedida.length > 0) {
    console.log(`[ERROR] ${problemasMedida.length} classe(s) de container query com MEDIDA INVÁLIDA — literal, sem interpolação, e é exatamente o que já derrubou "npm run build" (SyntaxError: Invalid media query no lightningcss):`);
    problemasMedida.forEach((p) => console.log(`  - ${p.arquivo}:${p.linha} — @min-[${p.medida}]:${p.utilitario}`));
    console.log('  Conserto: ou use uma medida válida (número + unidade, ex. 768px), ou — se é só prosa explicando o padrão — separe o prefixo `@min-[`, a medida e `]:<utilitário>` em trechos de texto não contíguos, para não formar candidato.');
  }

  if (problemasFonte.length > 0) {
    console.log(`[ERROR] ${problemasFonte.length} problema(s) na restrição de scan de sarak-base.css:`);
    problemasFonte.forEach((p) => console.log(`  - ${p}`));
  }

  process.exit(1);
}

const isMain = path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1] || '');
if (isMain) {
  main();
}
