// plan-41 — a camada atômica EMITE classes de container query (`@min-[…]`) via
// `useStructuralStyles.ts` (`getGridStyles`/`getResponsiveStackStyles`/`getHeaderStyles`/
// `getResponsiveSpacingStyles`) e, até esta plan, não ESTABELECIA container nenhum:
// sem um ancestral com `container-type`, a regra nunca casa — não cai para viewport,
// fica no valor base para sempre. Medido em consumidor real (`plan-40`): `SarakGrid`
// `col-12` travado em coluna única de 500px a 1440px, fora do `SarakShell`.
//
// O conserto: cada componente que chama uma dessas quatro funções passou a plantar
// `@container` — na própria raiz (a maioria) ou, quando o conteúdo com `@min-[…]` vive
// num `createPortal` (`ExpandableCard`), no ancestral real DENTRO do portal. Este gate
// impede a divergência voltar: todo arquivo de produção que CHAMA uma das quatro
// funções também precisa conter a classe `@container`, em algum elemento do mesmo
// arquivo.
//
// -------------------------------------------------------------------------
// LIMITES DECLARADOS (R18) — o que este gate NÃO vê
// -------------------------------------------------------------------------
// 1. É TEXTUAL, por arquivo — não é por AST nem por árvore de DOM. Prova que a
//    string `@container` existe EM ALGUM LUGAR do mesmo arquivo que chama a função;
//    não prova que esse elemento é de fato um ANCESTRAL, em JSX, do elemento que
//    recebeu a classe `@min-[…]`. Um `@container` num elemento irmão (não ancestral)
//    passaria neste gate e continuaria quebrado em runtime.
// 2. NÃO prova que a query casou. Container query só é avaliada por um motor de
//    layout real (browser) — nem este gate nem o `jsdom` dos testes fazem isso. A
//    prova de runtime é a rodada seguinte da `plan-40`, em consumidor real.
// 3. Super-conservador de propósito no `getGridStyles`: o layout `'auto-fit'` não usa
//    `@min-[…]` (só `'col-12'` e `'masonry'` usam, e `'col-12'` é o default quando o
//    tema não define `layoutGridTemplate`) — mas como o layout é resolvido em
//    RUNTIME pelo tema, este gate exige `@container` em QUALQUER chamada de
//    `getGridStyles`, mesmo a que só usaria `'auto-fit'` hoje. Falso positivo
//    possível; falso negativo, não.
// 4. NÃO enxerga composição entre arquivos. Se um componente A chamar uma das quatro
//    funções e depender de um ANCESTRAL em outro arquivo (componente pai) para
//    fornecer `@container`, este gate acusaria A sem motivo. Hoje (plan-41) isso não
//    acontece — todo chamador se autossustenta — mas se esse padrão mudar, a
//    suposição deste gate também precisa mudar.
// -------------------------------------------------------------------------
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const SRC = path.join(ROOT, 'src');

const CONTAINER_QUERY_FUNCTIONS = ['getGridStyles', 'getResponsiveStackStyles', 'getHeaderStyles', 'getResponsiveSpacingStyles'];
// Chamada real: nome seguido de `(` — não casa a DEFINIÇÃO (`const getGridStyles = (`).
const CALL_RE = new RegExp(`\\b(${CONTAINER_QUERY_FUNCTIONS.join('|')})\\(`);
const DEFINITION_FILE = path.join(SRC, 'components', 'atomic', 'hooks', 'useStructuralStyles.ts');

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

export function findMissingContainerBoundary({ root = SRC, relativeTo = ROOT, definitionFile = DEFINITION_FILE } = {}) {
  const problemas = [];
  for (const file of walkSourceFiles(root)) {
    if (path.resolve(file) === path.resolve(definitionFile)) continue; // dono das funções, não chamador
    const content = fs.readFileSync(file, 'utf8');
    if (!CALL_RE.test(content)) continue;

    const chamadas = CONTAINER_QUERY_FUNCTIONS.filter((fn) => content.includes(`${fn}(`));
    if (!content.includes('@container')) {
      const rel = path.relative(relativeTo, file).split(path.sep).join('/');
      problemas.push({ arquivo: rel, funcoes: chamadas });
    }
  }
  return problemas;
}

function main() {
  console.log('--- check-container-query-boundary (plan-41) ---');
  const problemas = findMissingContainerBoundary();

  if (problemas.length === 0) {
    console.log('[OK] Todo arquivo que chama getGridStyles/getResponsiveStackStyles/getHeaderStyles/getResponsiveSpacingStyles também contém a classe @container.');
    process.exit(0);
  }

  console.log(`[ERROR] ${problemas.length} arquivo(s) chama(m) função que emite container query (@min-[…]) sem plantar @container no mesmo arquivo:`);
  problemas.forEach((p) => console.log(`  - ${p.arquivo} — usa ${p.funcoes.join(', ')}`));
  console.log('  Conserto: adicione a classe utilitária @container a um elemento ANCESTRAL, no mesmo arquivo, do que recebe a classe @min-[…] (nunca no mesmo elemento — container-type não faz um elemento medir a si mesmo).');

  process.exit(1);
}

const isMain = path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1] || '');
if (isMain) {
  main();
}
