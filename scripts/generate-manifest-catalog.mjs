/**
 * Gerador do Catálogo do Manifesto — fonte da verdade DERIVADA do código.
 *
 * Extrai por AST (compilador TypeScript):
 *  - os `type` nativos do NATIVE_COMPONENTS (Registry — Spec 22);
 *  - as props reais de cada componente (interface/type `<Nome>Props`);
 *  - o catálogo de ações do Dispatcher (ACTION_HANDLERS — Spec 25);
 *  - os pipes nativos do Data Binding (Spec 24);
 *  - as diretivas reservadas do nó (Spec 20).
 *
 * Saídas: docs/manifest-catalog.json (máquina) e docs/manifest-catalog.md (humano/IA —
 * referenciado pelas skills ui-integra-escrever-manifesto e ui-auditoria-manifesto).
 *
 * Uso: `node scripts/generate-manifest-catalog.mjs` (gera) | `--check` (falha se defasado).
 * O `--check` roda no `npm run build` — catálogo defasado = build vermelho (mesma
 * filosofia do gate de paridade do Registry).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'src');
const DOCS_DIR = path.join(ROOT, 'docs');
const JSON_OUT = path.join(DOCS_DIR, 'manifest-catalog.json');
const MD_OUT = path.join(DOCS_DIR, 'manifest-catalog.md');

const read = (relative) => fs.readFileSync(path.join(SRC, relative), 'utf-8');
const parse = (relative) =>
    ts.createSourceFile(relative, read(relative), ts.ScriptTarget.Latest, true);

/** Chaves do objeto NATIVE_COMPONENTS (ordem de declaração preservada). */
const collectRegistryTypes = () => {
    const source = parse('core/Manifest/Registry/nativeComponents.ts');
    const types = [];
    const visit = (node) => {
        if (
            ts.isVariableDeclaration(node) &&
            node.name.getText() === 'NATIVE_COMPONENTS' &&
            node.initializer
        ) {
            let literal = node.initializer;
            while (ts.isAsExpression(literal) || ts.isSatisfiesExpression(literal)) {
                literal = literal.expression;
            }
            if (ts.isObjectLiteralExpression(literal)) {
                for (const prop of literal.properties) {
                    if (ts.isShorthandPropertyAssignment(prop) || ts.isPropertyAssignment(prop)) {
                        types.push(prop.name.getText());
                    }
                }
            }
        }
        ts.forEachChild(node, visit);
    };
    visit(source);
    return types;
};

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

/** Chaves do ACTION_HANDLERS (Spec 25). */
const collectActions = () => {
    const source = parse('core/Manifest/Dispatcher/createDispatcher.ts');
    const actions = [];
    const visit = (node) => {
        if (
            ts.isVariableDeclaration(node) &&
            node.name.getText() === 'ACTION_HANDLERS' &&
            node.initializer &&
            ts.isObjectLiteralExpression(node.initializer)
        ) {
            for (const prop of node.initializer.properties) {
                if (ts.isPropertyAssignment(prop) || ts.isShorthandPropertyAssignment(prop)) {
                    actions.push(prop.name.getText());
                }
            }
        }
        ts.forEachChild(node, visit);
    };
    visit(source);
    return actions;
};

/** Pipes nativos registrados em pipes.ts (Spec 24). */
const collectPipes = () => {
    const text = read('core/Manifest/Binding/pipes.ts');
    return [...text.matchAll(/registerPipe\('([^']+)'/g)].map((match) => match[1]);
};

/** Diretivas reservadas do nó (Spec 20) — array RESERVED_DIRECTIVES. */
const collectDirectives = () => {
    const text = read('core/Manifest/directives.ts');
    const block = text.match(/RESERVED_DIRECTIVES[^[]*\[([\s\S]*?)\]/);
    if (!block) return [];
    return [...block[1].matchAll(/'([^']+)'/g)].map((match) => match[1]);
};

const buildCatalog = () => {
    const propsIndex = buildPropsIndex();
    const components = {};
    for (const type of collectRegistryTypes()) {
        const entry = propsIndex.get(`${type}Props`);
        components[type] = entry
            ? { propsInterface: `${type}Props`, source: entry.file, extends: entry.extends || undefined, props: entry.props }
            : { propsInterface: null, source: null, props: [], note: 'Props não expostas por interface nomeada — consulte o arquivo do componente.' };
    }
    return {
        $comment:
            'GERADO por scripts/generate-manifest-catalog.mjs — NÃO edite à mão. Regenerar: npm run catalog.',
        schemaVersion: 1,
        components,
        actions: collectActions(),
        pipes: collectPipes(),
        directives: collectDirectives(),
    };
};

const renderMarkdown = (catalog) => {
    const lines = [
        '# Catálogo do Manifesto — Sarak-Lib-UI-Core',
        '',
        '> **GERADO** por `scripts/generate-manifest-catalog.mjs` a partir do código-fonte (Registry + interfaces).',
        '> Não edite à mão — rode `npm run catalog`. O build falha se este arquivo estiver defasado.',
        '',
        `## Ações do Dispatcher (\`actions[]\`)`,
        '',
        catalog.actions.map((a) => `\`${a}\``).join(' · '),
        '',
        `## Pipes de binding (\`{{valor | pipe}}\`)`,
        '',
        catalog.pipes.map((p) => `\`${p}\``).join(' · '),
        '',
        `## Diretivas reservadas do nó`,
        '',
        catalog.directives.map((d) => `\`${d}\``).join(' · '),
        '',
        `## Componentes resolvíveis via \`"type"\` (${Object.keys(catalog.components).length})`,
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
                '[catalog:check] docs/manifest-catalog.{json,md} DEFASADOS em relação ao código. ' +
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
    console.log(
        `[catalog] ${Object.keys(catalog.components).length} types, ${catalog.actions.length} ações, ` +
            `${catalog.pipes.length} pipes, ${catalog.directives.length} diretivas → docs/manifest-catalog.{json,md}`,
    );
};

main();
