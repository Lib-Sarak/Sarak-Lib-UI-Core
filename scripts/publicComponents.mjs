/**
 * Fonte da verdade dos componentes CONSUMIDOR-FACING (pós-Spec 46).
 *
 * Antes (#2, removido): a lista vinha do `NATIVE_COMPONENTS` — um registro curado
 * dentro do motor de manifesto (`core/Manifest/Registry/nativeComponents.ts`).
 * Agora (#3): deriva-se por AST diretamente do código-fonte dos componentes —
 * `src/components/atomic/<Categoria>/` e `src/components/engines/<Categoria>/` (via o
 * barril `index.ts` da categoria, quando existe — resolve `export *` em cadeia; sem
 * barril, varre os `.tsx` de raiz) e `src/components/Layout/` (sem barril, varre
 * `.tsx` de raiz).
 *
 * Usado por `check-barrel-parity.mjs` (paridade contra `src/index.ts`) e por
 * `generate-component-catalog.mjs` (catálogo da API pública).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'src');
const ATOMIC_ROOT = path.join(SRC, 'components/atomic');
const ENGINES_ROOT = path.join(SRC, 'components/engines');
const LAYOUT_ROOT = path.join(SRC, 'components/Layout');

/** Pastas que existem dentro de uma raiz de categorias mas NÃO são categoria. */
const NON_CATEGORY_DIRS = new Set(['hooks', '__tests__']);

const CANDIDATE_SUFFIXES = ['.ts', '.tsx', '/index.ts', '/index.tsx'];

const resolveModule = (fromFile, specifier) => {
    if (!specifier.startsWith('.')) return null;
    const base = path.resolve(path.dirname(fromFile), specifier);
    if (fs.existsSync(base) && fs.statSync(base).isFile()) return base;
    for (const suffix of CANDIDATE_SUFFIXES) {
        const candidate = base + suffix;
        if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
    }
    return null;
};

/**
 * Conjunto de TODOS os identificadores exportados por um módulo e sua cadeia de
 * re-exports (`export *`), valores e tipos juntos. Reusado tanto para varrer o
 * barril de uma categoria atômica quanto o barril público `src/index.ts`.
 */
export const collectExportedNames = (entryFile) => {
    const names = new Set();
    const visited = new Set();

    const walk = (file, viaStar) => {
        if (!file || visited.has(file)) return;
        visited.add(file);
        const source = ts.createSourceFile(
            file,
            fs.readFileSync(file, 'utf-8'),
            ts.ScriptTarget.Latest,
            true,
        );

        for (const node of source.statements) {
            if (ts.isExportDeclaration(node) && !node.exportClause && node.moduleSpecifier) {
                const target = resolveModule(file, node.moduleSpecifier.text);
                walk(target, true);
                continue;
            }
            if (ts.isExportDeclaration(node) && node.exportClause && ts.isNamedExports(node.exportClause)) {
                for (const el of node.exportClause.elements) names.add(el.name.text);
                continue;
            }
            if (ts.isExportDeclaration(node) && node.exportClause && ts.isNamespaceExport(node.exportClause)) {
                names.add(node.exportClause.name.text);
                continue;
            }
            const mods = ts.canHaveModifiers(node) ? ts.getModifiers(node) ?? [] : [];
            const isExported = mods.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
            const isDefault = mods.some((m) => m.kind === ts.SyntaxKind.DefaultKeyword);
            if (!isExported || (viaStar && isDefault)) continue;
            if (ts.isVariableStatement(node)) {
                for (const decl of node.declarationList.declarations) {
                    if (ts.isIdentifier(decl.name)) names.add(decl.name.text);
                }
            } else if (
                (ts.isFunctionDeclaration(node) ||
                    ts.isClassDeclaration(node) ||
                    ts.isInterfaceDeclaration(node) ||
                    ts.isTypeAliasDeclaration(node) ||
                    ts.isEnumDeclaration(node)) &&
                node.name
            ) {
                names.add(node.name.text);
            }
        }
    };

    walk(entryFile, false);
    return names;
};

/**
 * Mesma travessia de `collectExportedNames`, mas só VALORES (const/function/class/
 * default/named re-export não-`type`) — interfaces e type-aliases ficam de fora.
 * Necessário para a fonte de componentes: `interface XProps`/tipos auxiliares (ex.:
 * `SarakColumn`, `KanbanCard`) não têm existência em runtime, então checá-los contra
 * o objeto real do barril (`name in PublicAPI`) sempre falharia — falso-positivo.
 */
export const collectExportedValueNames = (entryFile) => {
    const names = new Set();
    const visited = new Set();

    const walk = (file, viaStar) => {
        if (!file || visited.has(file)) return;
        visited.add(file);
        const source = ts.createSourceFile(
            file,
            fs.readFileSync(file, 'utf-8'),
            ts.ScriptTarget.Latest,
            true,
        );

        for (const node of source.statements) {
            if (ts.isExportDeclaration(node) && !node.exportClause && node.moduleSpecifier) {
                if (node.isTypeOnly) continue;
                const target = resolveModule(file, node.moduleSpecifier.text);
                walk(target, true);
                continue;
            }
            if (ts.isExportDeclaration(node) && node.exportClause && ts.isNamedExports(node.exportClause)) {
                if (node.isTypeOnly) continue;
                for (const el of node.exportClause.elements) {
                    if (el.isTypeOnly) continue;
                    names.add(el.name.text);
                }
                continue;
            }
            if (ts.isExportDeclaration(node) && node.exportClause && ts.isNamespaceExport(node.exportClause)) {
                names.add(node.exportClause.name.text);
                continue;
            }
            const mods = ts.canHaveModifiers(node) ? ts.getModifiers(node) ?? [] : [];
            const isExported = mods.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
            const isDefault = mods.some((m) => m.kind === ts.SyntaxKind.DefaultKeyword);
            if (!isExported || (viaStar && isDefault)) continue;
            if (ts.isVariableStatement(node)) {
                for (const decl of node.declarationList.declarations) {
                    if (ts.isIdentifier(decl.name)) names.add(decl.name.text);
                }
            } else if ((ts.isFunctionDeclaration(node) || ts.isClassDeclaration(node)) && node.name) {
                names.add(node.name.text);
            }
        }
    };

    walk(entryFile, false);
    return names;
};

const EXPORT_NAME_RE = /export\s+(?:const|function|class)\s+([A-Z][A-Za-z0-9]*)/g;
const DEFAULT_EXPORT_RE = /export\s+default\s+(?:function\s+)?([A-Z][A-Za-z0-9]*)/;

/** Nomes PascalCase exportados por um arquivo `.tsx` de raiz (sem barril na categoria). */
export const namesFromFileExports = (file) => {
    const content = fs.readFileSync(file, 'utf-8');
    const names = new Set();
    for (const match of content.matchAll(EXPORT_NAME_RE)) names.add(match[1]);
    const def = content.match(DEFAULT_EXPORT_RE);
    if (def) names.add(def[1]);
    return [...names].filter((name) => !/^[A-Z0-9_]+$/.test(name));
};

/**
 * Varre uma raiz organizada POR CATEGORIA (uma pasta por categoria): categoria COM
 * barril segue a cadeia `export *` (pega o que a categoria expõe como valor);
 * categoria SEM barril (`Cards/`, `Icon/`) varre os `.tsx` de raiz por regex (mesma
 * heurística usada pelo antigo gate R3 do Registry).
 *
 * Arquivo solto na RAIZ da raiz de categorias não é categoria e fica de fora — é o
 * caso de `engines/LazyEngineWrapper.tsx`, peça interna que os barris das categorias
 * consomem para embutir o `Suspense`, nunca importada pelo consumidor.
 *
 * -------------------------------------------------------------------------
 * REGRA (R14, decisão do dono — plan-20, 2026-08-09): componente público
 * mora na RAIZ da categoria; subpasta é peça interna.
 * -------------------------------------------------------------------------
 * Em categoria SEM barril, só os `.tsx` de RAIZ são varridos — de propósito,
 * não por lacuna. Um arquivo dentro de uma SUBPASTA de categoria NUNCA é
 * parte da superfície pública, qualquer que seja o nome do arquivo ou o que
 * ele exporta: é assim que `Layout/chrome/` (peças internas do cromo) e as
 * pastas `<Componente>/` das fronteiras lazy (`SarakPDFViewer/
 * SarakPDFViewerImpl.tsx`, `SarakDataTable/SarakDataTableImpl.tsx`, …)
 * permanecem privadas sem allowlist nenhuma — o endereço já é a fronteira.
 *
 * A regra virou VARREDURA RECURSIVA NÃO, de propósito: recursão publicaria
 * exatamente as peças `Impl` que a fronteira lazy existe para esconder.
 * `collectFromCategoryRoot.test.mjs` prova as duas metades com fixture: um
 * componente na raiz é coletado, um componente idêntico numa subpasta não é
 * — a mesma função, dois lugares, dois resultados, por design.
 *
 * Consequência para quem escreve componente novo: se ele é consumidor-facing,
 * o arquivo mora na raiz da categoria (ou a categoria ganha um barril próprio
 * que o re-exporte por `export *`). Subpasta é, por definição, implementação.
 * -------------------------------------------------------------------------
 */
export const collectFromCategoryRoot = (root, names) => {
    for (const category of fs.readdirSync(root)) {
        const dir = path.join(root, category);
        if (!fs.statSync(dir).isDirectory() || NON_CATEGORY_DIRS.has(category)) continue;
        const indexFile = ['index.ts', 'index.tsx']
            .map((f) => path.join(dir, f))
            .find((f) => fs.existsSync(f));
        if (indexFile) {
            for (const n of collectExportedValueNames(indexFile)) {
                if (/^[A-Z]/.test(n)) names.add(n);
            }
        } else {
            for (const entry of fs.readdirSync(dir)) {
                const full = path.join(dir, entry);
                if (entry.endsWith('.tsx') && fs.statSync(full).isFile()) {
                    for (const n of namesFromFileExports(full)) names.add(n);
                }
            }
        }
    }
};

/**
 * Nomes públicos derivados do código-fonte: as duas raízes por categoria
 * (`components/atomic/` e `components/engines/`) mais `components/Layout/`, que não
 * tem categorias e varre os `.tsx` de raiz.
 *
 * `engines/` entrou no escopo em P26 (decisão D2). Antes disso o gate varria menos do
 * que a regra exigia, e 3 dos 4 engines viviam fora do barril público sem que nada
 * acendesse — gate com escopo menor que a regra deixa a regra violada em silêncio.
 */
export const collectPublicComponentNames = () => {
    const names = new Set();

    collectFromCategoryRoot(ATOMIC_ROOT, names);
    if (fs.existsSync(ENGINES_ROOT)) collectFromCategoryRoot(ENGINES_ROOT, names);

    if (fs.existsSync(LAYOUT_ROOT)) {
        for (const entry of fs.readdirSync(LAYOUT_ROOT)) {
            const full = path.join(LAYOUT_ROOT, entry);
            if (entry.endsWith('.tsx') && fs.statSync(full).isFile()) {
                for (const n of namesFromFileExports(full)) names.add(n);
            }
        }
    }

    return [...names].sort();
};
