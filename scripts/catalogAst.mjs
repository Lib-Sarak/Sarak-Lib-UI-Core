/**
 * Coletores de AST do código-fonte — a camada BAIXA do pipeline de catálogo.
 *
 * Extraído de `generate-component-catalog.mjs` (Spec 50) para que o gerador do
 * catálogo E o gerador do kit do consumidor (`sarak-ui/`) leiam as MESMAS fontes
 * vivas, sem duplicar travessia de AST. Nenhuma regra nova mora aqui: é o mesmo
 * código, agora importável.
 *
 * Fontes vivas cobertas: props de componente (`<Nome>Props`), tokens de
 * espaçamento (`resolveToken.ts`), nomes de ícone (`iconNames.ts`), CSS Variables
 * públicas (`manifest.ts`) e uniões literais de variante.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const SRC = path.join(ROOT, 'src');

const read = (relative) => fs.readFileSync(path.join(SRC, relative), 'utf-8');

/** Um `SourceFile` do compilador TS a partir de um caminho relativo a `src/`. */
export const parse = (relative) =>
    ts.createSourceFile(relative, read(relative), ts.ScriptTarget.Latest, true);

/** Todos os arquivos .ts/.tsx do src (sem testes) — índice para achar `<Nome>Props`. */
export const walkSourceFiles = (dir = SRC, out = []) => {
    for (const entry of fs.readdirSync(dir)) {
        const full = path.join(dir, entry);
        if (fs.statSync(full).isDirectory()) {
            if (entry !== '__tests__' && entry !== 'node_modules') walkSourceFiles(full, out);
        } else if (/\.tsx?$/.test(entry) && !entry.includes('.test.')) {
            out.push(full);
        }
    }
    return out;
};

const jsDocOf = (member) => {
    const docs = member.jsDoc ?? [];
    return docs
        .map((doc) => (typeof doc.comment === 'string' ? doc.comment : ''))
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
};

/**
 * Texto do tipo SEM comentários. `getText()` devolve o trecho fonte cru — os JSDoc dos
 * campos de um objeto inline (e os `// nota` de fim de linha) iam parar dentro da célula
 * do catálogo, deixando o tipo ilegível. Os comentários seguem no código (IntelliSense).
 */
const typeTextOf = (typeNode, sourceFile) =>
    typeNode
        .getText(sourceFile)
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\/\/[^\n]*/g, '')
        .replace(/\s+/g, ' ')
        .replace(/\s+;/g, ';')
        .trim();

/** Extrai membros de uma interface/type-literal de props. */
const membersOf = (declaration, sourceFile) => {
    const members = ts.isInterfaceDeclaration(declaration)
        ? declaration.members
        : declaration.type && ts.isTypeLiteralNode(declaration.type)
          ? declaration.type.members
          : [];
    const props = [];
    for (const member of members) {
        if (!ts.isPropertySignature(member) || !member.name) continue;
        props.push({
            name: member.name.getText(sourceFile),
            type: member.type ? typeTextOf(member.type, sourceFile) : 'unknown',
            optional: Boolean(member.questionToken),
            doc: jsDocOf(member),
        });
    }
    return props;
};

/** Indexa `interface XProps` / `type XProps` de todo o src. */
export const buildPropsIndex = () => {
    const index = new Map();
    for (const file of walkSourceFiles()) {
        const text = fs.readFileSync(file, 'utf-8');
        if (!/(?:interface|type)\s+[A-Z]\w*Props\b/.test(text)) continue;
        const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
        const visit = (node) => {
            const isCandidate =
                (ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node)) &&
                /Props$/.test(node.name.text);
            if (isCandidate && !index.has(node.name.text)) {
                const extendsText = ts.isInterfaceDeclaration(node)
                    ? (node.heritageClauses ?? [])
                          .flatMap((clause) => clause.types.map((t) => t.getText(source)))
                          .join(', ')
                    : '';
                index.set(node.name.text, {
                    file: path.relative(ROOT, file).replace(/\\/g, '/'),
                    extends: extendsText,
                    props: membersOf(node, source),
                });
            }
            ts.forEachChild(node, visit);
        };
        visit(source);
    }
    return index;
};

/** Mapa SPACING_TOKENS do resolutor (Spec 16) — fonte ÚNICA dos tokens de espaçamento. */
export const collectSpacingTokens = () => {
    const source = parse('core/Design/resolveToken.ts');
    const tokens = {};
    const visit = (node) => {
        if (
            ts.isVariableDeclaration(node) &&
            node.name.getText() === 'SPACING_TOKENS' &&
            node.initializer &&
            ts.isObjectLiteralExpression(node.initializer)
        ) {
            for (const prop of node.initializer.properties) {
                if (ts.isPropertyAssignment(prop) && ts.isStringLiteral(prop.initializer)) {
                    const name = ts.isStringLiteral(prop.name) ? prop.name.text : prop.name.getText();
                    tokens[name] = prop.initializer.text;
                }
            }
        }
        ts.forEachChild(node, visit);
    };
    visit(source);
    return tokens;
};

/**
 * Elementos string de um `const NOME = [...] as const` — a forma dos catálogos
 * fechados da lib (`ICON_NAMES`, `THEME_PRESET_IDS`). Fonte ÚNICA por construção.
 */
export const collectStringArrayConst = (relative, constName) => {
    const source = parse(relative);
    const values = [];
    const visit = (node) => {
        if (ts.isVariableDeclaration(node) && node.name.getText() === constName && node.initializer) {
            // `[...] as const` — o array fica dentro da asserção de tipo.
            const array = ts.isAsExpression(node.initializer) ? node.initializer.expression : node.initializer;
            if (ts.isArrayLiteralExpression(array)) {
                for (const element of array.elements) {
                    if (ts.isStringLiteral(element)) values.push(element.text);
                }
            }
        }
        ts.forEachChild(node, visit);
    };
    visit(source);
    return values;
};

/** Nomes de ícone do contrato público (Spec 41 §2.3) — fonte ÚNICA: `ICON_NAMES`. */
export const collectIconNames = () =>
    collectStringArrayConst('components/atomic/Icon/iconNames.ts', 'ICON_NAMES');

/** CSS Variables públicas reais (namespace `--sarak-*`) emitidas pelo DESIGN_MANIFEST (Spec 16). */
export const collectPublicCssVars = () => {
    const source = parse('core/Provider/manifest.ts');
    const vars = new Set();
    const visit = (node) => {
        if (
            ts.isPropertyAssignment(node) &&
            node.name.getText() === 'vars' &&
            ts.isArrayLiteralExpression(node.initializer)
        ) {
            for (const element of node.initializer.elements) {
                if (ts.isStringLiteral(element) && element.text.startsWith('--sarak-')) {
                    vars.add(element.text);
                }
            }
        }
        ts.forEachChild(node, visit);
    };
    visit(source);
    return [...vars].sort();
};

/** Props tipadas por união de literais string (variants) já extraídas por AST. */
export const collectVariantUnions = (components) => {
    const out = [];
    for (const [type, info] of Object.entries(components)) {
        for (const prop of info.props ?? []) {
            // Ignora tipos-função (ex.: `onClick`): os literais ali são argumentos, não variantes.
            if (prop.type.includes('=>')) continue;
            const literals = [...prop.type.matchAll(/'([^']*)'/g)].map((match) => match[1]);
            if (literals.length >= 2) {
                out.push({ component: type, prop: prop.name, values: literals });
            }
        }
    }
    return out;
};
