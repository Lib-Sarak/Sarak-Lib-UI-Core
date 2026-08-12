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
// -------------------------------------------------------------------------
// LIMITES DECLARADOS (R18) — o que este gate NÃO vê
// -------------------------------------------------------------------------
// 1. É ESTÁTICO — não constrói CSS. Prova só que o NOME da classe está soletrado
//    literal no arquivo; não prova que a regra correspondente foi de fato GERADA no
//    `dist/sarak.css` publicado. Essa prova exige rodar `npm run build` e comparar
//    (é o que a §8 da plan-39 faz, e o que fica registrado no baseline de release).
// 2. Só detecta o padrão TEXTUAL `@min-[${` (abertura de interpolação de template
//    literal logo após o colchete). Uma classe montada por concatenação de string
//    (`'@min-[' + N + 'px]:'`) ou por `String.raw` escaparia — nenhum caso assim
//    existe hoje no repositório (medido, plan-39).
// 3. Escopo: `src/**/*.{ts,tsx}`, exceto diretórios `__tests__/` — o mesmo idioma do
//    teste companheiro (literal no código de produção, interpolado no teste para
//    pegar deriva de constante) exige que o teste continue interpolando.
// 4. É por TEXTO DE LINHA, não por AST — não distingue código de comentário. Uma
//    linha de comentário que reproduza o padrão `@min-[${` também é acusada, de
//    propósito: é a mesma armadilha que quebrou o build (comentário textual também é
//    varrido pelo scanner do Tailwind). Descreva o mecanismo em prosa sem reproduzir
//    o padrão literal.
// 5. A checagem de `sarak-base.css` (emenda §2.0) é TEXTUAL — confere que a linha do
//    `@import "tailwindcss"` contém `source(none)` e que existe pelo menos um
//    `@source` não vazio no arquivo. Não valida se o glob do `@source` ainda é amplo
//    o bastante para cobrir todo `.tsx`/`.ts` de produção — isso é responsabilidade
//    de quem editar a linha, e o `container-query:check` (a varredura acima) continua
//    sendo quem prova que a classe está soletrada.
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
  console.log('--- check-container-query-literal (plan-39) ---');
  const problemas = findInterpolatedContainerQueries();
  const problemasFonte = checkSourceRestriction();

  if (problemas.length === 0 && problemasFonte.length === 0) {
    console.log('[OK] Nenhuma classe de container query (@min-[…]) montada por interpolação em src/, e sarak-base.css restringe o scan do Tailwind (source(none) + @source explícito).');
    process.exit(0);
  }

  if (problemas.length > 0) {
    console.log(`[ERROR] ${problemas.length} classe(s) de container query montada(s) por interpolação — o scanner do Tailwind lê o arquivo como texto e nunca vê a forma interpolada:`);
    problemas.forEach((p) => console.log(`  - ${p.arquivo}:${p.linha}`));
    console.log('  Conserto: escreva a classe LITERAL; o teste companheiro afirma a igualdade contra a forma interpolada.');
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
