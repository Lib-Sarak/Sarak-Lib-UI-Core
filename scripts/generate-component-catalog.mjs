/**
 * Gerador do Catálogo de Componentes — fonte da verdade DERIVADA do código-fonte.
 *
 * Sucessor do antigo `generate-manifest-catalog.mjs` (Spec 46 — remoção do motor de
 * manifesto/#2). O catálogo deixou de documentar a superfície de AUTORIA DE JSON
 * (actions do Dispatcher, pipes de binding, diretivas reservadas, regras de
 * `validation`) — esses conceitos eram exclusivos do motor removido. Passa a
 * documentar a API PÚBLICA REACT do modelo oficial (#1/#3): componentes + props,
 * tokens de espaçamento semânticos e as CSS Variables públicas do Design Engine.
 *
 * Extrai por AST (compilador TypeScript):
 *  - os componentes consumidor-facing (`scripts/publicComponents.mjs`);
 *  - as props reais de cada componente (interface/type `<Nome>Props`);
 *  - os tokens de espaçamento semânticos (`core/Design/resolveToken.ts`);
 *  - as CSS Variables públicas (namespace `--sarak-*`) do Design Engine.
 *
 * Saídas: docs/component-catalog.json (máquina) e docs/component-catalog.md (humano/IA).
 *
 * Uso: `node scripts/generate-component-catalog.mjs` (gera) | `--check` (falha se defasado).
 * O `--check` roda no `npm run build` — catálogo defasado = build vermelho.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { collectPublicComponentNames } from './publicComponents.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'src');
const DOCS_DIR = path.join(ROOT, 'docs');
const JSON_OUT = path.join(DOCS_DIR, 'component-catalog.json');
const MD_OUT = path.join(DOCS_DIR, 'component-catalog.md');

const read = (relative) => fs.readFileSync(path.join(SRC, relative), 'utf-8');
const parse = (relative) =>
    ts.createSourceFile(relative, read(relative), ts.ScriptTarget.Latest, true);

/** Todos os arquivos .ts/.tsx do src (sem testes) — índice para achar `<Nome>Props`. */
const walkSourceFiles = (dir = SRC, out = []) => {
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
            type: member.type ? member.type.getText(sourceFile).replace(/\s+/g, ' ') : 'unknown',
            optional: Boolean(member.questionToken),
            doc: jsDocOf(member),
        });
    }
    return props;
};

/** Indexa `interface XProps` / `type XProps` de todo o src. */
const buildPropsIndex = () => {
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
const collectSpacingTokens = () => {
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

/** CSS Variables públicas reais (namespace `--sarak-*`) emitidas pelo DESIGN_MANIFEST (Spec 16). */
const collectPublicCssVars = () => {
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
const collectVariantUnions = (components) => {
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

const buildCatalog = () => {
    const propsIndex = buildPropsIndex();
    const components = {};
    for (const name of collectPublicComponentNames()) {
        const entry = propsIndex.get(`${name}Props`);
        components[name] = entry
            ? { propsInterface: `${name}Props`, source: entry.file, extends: entry.extends || undefined, props: entry.props }
            : { propsInterface: null, source: null, props: [], note: 'Props não expostas por interface nomeada — consulte o arquivo do componente.' };
    }
    return {
        $comment:
            'GERADO por scripts/generate-component-catalog.mjs — NÃO edite à mão. Regenerar: npm run catalog.',
        schemaVersion: 2,
        components,
        tokens: {
            spacing: collectSpacingTokens(),
            variants: collectVariantUnions(components),
            cssVars: collectPublicCssVars(),
        },
    };
};

/** Seção "Tokens e valores permitidos" (Spec 16) — medidas de espaçamento semânticas. */
const renderTokensSection = (tokens) => {
    const lines = [
        '## Tokens e valores permitidos',
        '',
        '> Valores de espaçamento aceitos pelas primitivas estruturais (`gap`, `padding`). ' +
            'Fora desta lista, o resolutor AVISA (`console.warn` com sugestão) e cai no default do Design Engine.',
        '',
        '### Espaçamento semântico (`gap`, `padding`)',
        '',
        'Traduzidos por `resolveToken` (`core/Design/resolveToken.ts`). Qualquer comprimento CSS válido também passa direto: `16px`, `1rem`, `0`, `var(--x, 16px)`, `calc(...)`.',
        '',
        '| Token | Traduz para |',
        '| --- | --- |',
    ];
    for (const [name, value] of Object.entries(tokens.spacing)) {
        lines.push(`| \`${name}\` | \`${value}\` |`);
    }
    lines.push('', '### Variantes literais por componente', '');
    if (tokens.variants.length === 0) {
        lines.push('_Nenhuma união literal exposta pelas props._');
    } else {
        lines.push('| Componente | Prop | Valores aceitos |', '| --- | --- | --- |');
        for (const variant of tokens.variants) {
            const values = variant.values.map((value) => `\`${value}\``).join(' · ');
            lines.push(`| \`${variant.component}\` | \`${variant.prop}\` | ${values} |`);
        }
    }
    lines.push(
        '',
        '### CSS Variables públicas (namespace `--sarak-*`)',
        '',
        'Vars REAIS emitidas pelo Design Engine. Use SEMPRE com fallback — `var(--sarak-x, valor)`. Nomes fora desta lista NÃO existem e não pintam nada.',
        '',
        tokens.cssVars.map((cssVar) => `\`${cssVar}\``).join(' · '),
        '',
    );
    return lines;
};

const renderMarkdown = (catalog) => {
    const lines = [
        '# Catálogo de Componentes — Sarak-Lib-UI-Core',
        '',
        '> **GERADO** por `scripts/generate-component-catalog.mjs` a partir do código-fonte (componentes + interfaces).',
        '> Não edite à mão — rode `npm run catalog`. O build falha se este arquivo estiver defasado.',
        '',
        ...renderTokensSection(catalog.tokens),
        `## Componentes públicos (${Object.keys(catalog.components).length})`,
        '',
    ];
    for (const [type, info] of Object.entries(catalog.components)) {
        lines.push(`### ${type}`);
        if (!info.propsInterface) {
            lines.push('', `_${info.note}_`, '');
            continue;
        }
        lines.push('', `Props (\`${info.propsInterface}\` — \`${info.source}\`):`, '');
        lines.push('| Prop | Tipo | Obrigatória | Descrição |');
        lines.push('| --- | --- | --- | --- |');
        for (const prop of info.props) {
            const type_ = prop.type.replace(/\|/g, '\\|');
            lines.push(`| \`${prop.name}\` | \`${type_}\` | ${prop.optional ? 'não' : 'sim'} | ${prop.doc || ''} |`);
        }
        if (info.extends) lines.push('', `Estende: \`${info.extends}\``);
        lines.push('');
    }
    return `${lines.join('\n')}\n`;
};

const main = () => {
    const isCheck = process.argv.includes('--check');
    const catalog = buildCatalog();
    const json = `${JSON.stringify(catalog, null, 2)}\n`;
    const markdown = renderMarkdown(catalog);

    if (isCheck) {
        const current = (file) => (fs.existsSync(file) ? fs.readFileSync(file, 'utf-8') : '');
        if (current(JSON_OUT) !== json || current(MD_OUT) !== markdown) {
            console.error(
                '[catalog:check] docs/component-catalog.{json,md} DEFASADOS em relação ao código. ' +
                    'Rode `npm run catalog` e commite o resultado.',
            );
            process.exit(1);
        }
        console.log('[catalog:check] catálogo em dia.');
        return;
    }

    fs.mkdirSync(DOCS_DIR, { recursive: true });
    fs.writeFileSync(JSON_OUT, json);
    fs.writeFileSync(MD_OUT, markdown);
    console.log(`[catalog] ${Object.keys(catalog.components).length} componentes → docs/component-catalog.{json,md}`);
};

main();
