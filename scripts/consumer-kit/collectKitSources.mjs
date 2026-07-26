/**
 * Coletores das fontes vivas EXCLUSIVAS do kit do consumidor (Spec 50).
 *
 * O que o `docs/component-catalog.json` já cobre (componentes/props/espaçamento/
 * variantes/CSS Vars/ícones) NÃO é recoletado aqui — vem de `buildCatalog()`.
 * Este módulo acrescenta só o que o kit precisa e o catálogo não tem:
 * schema de tokens de tema, temas embutidos, contrato de responsividade (Spec 40.3),
 * slots do cromo (Spec 48) e os nomes exportados pelo barril público.
 *
 * Regra da spec: NADA aqui é escrito à mão — tudo sai de AST do código-fonte.
 */

import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { SRC, buildPropsIndex, collectStringArrayConst, parse, walkSourceFiles } from '../catalogAst.mjs';
import { collectExportedNames, namesFromFileExports } from '../publicComponents.mjs';

const TOKEN_IDS_FILE = 'core/Provider/generated/design-token-ids.ts';

/**
 * Schema vivo dos tokens de TEMA (as chaves válidas de `design` num `ThemePreset`).
 * Fonte única: a interface `SarakDesignTokens` do arquivo GERADO a partir do
 * `MASTER_DESIGN_MAP` — por construção, sempre em dia com a paridade 1:1:1:1:1:1.
 */
export const collectDesignTokens = () => {
    const source = parse(TOKEN_IDS_FILE);
    const tokens = [];
    const visit = (node) => {
        if (ts.isInterfaceDeclaration(node) && node.name.text === 'SarakDesignTokens') {
            for (const member of node.members) {
                if (!ts.isPropertySignature(member) || !member.name || !member.type) continue;
                const type = member.type.getText(source).replace(/\s+/g, ' ').trim();
                tokens.push({
                    id: member.name.getText(source),
                    type,
                    responsive: type.includes('ResponsiveValue'),
                });
            }
        }
        ts.forEachChild(node, visit);
    };
    visit(source);
    return tokens;
};

/** Ids dos temas embutidos (`THEME_PRESET_IDS`) — o catálogo de partida do consumidor. */
export const collectThemePresetIds = () =>
    collectStringArrayConst('core/Design/presets/themes/index.ts', 'THEME_PRESET_IDS');

/** O par recomendado (`SARAK_REFERENCE_THEMES`) — lido das chamadas `getThemePreset('id')`. */
export const collectReferenceThemeIds = () => {
    const source = parse('core/Design/presets/themes/reference.ts');
    const ids = [];
    const visit = (node) => {
        if (
            ts.isCallExpression(node) &&
            node.expression.getText(source) === 'getThemePreset' &&
            node.arguments.length === 1 &&
            ts.isStringLiteral(node.arguments[0])
        ) {
            ids.push(node.arguments[0].text);
        }
        ts.forEachChild(node, visit);
    };
    visit(source);
    return ids;
};

/** Limiares canônicos de dispositivo — fonte única `core/Design/breakpoints.ts`. */
export const collectBreakpoints = () => {
    const source = parse('core/Design/breakpoints.ts');
    const values = {};
    const visit = (node) => {
        if (
            ts.isVariableDeclaration(node) &&
            node.initializer &&
            ts.isNumericLiteral(node.initializer) &&
            /^BREAKPOINT_/.test(node.name.getText(source))
        ) {
            values[node.name.getText(source)] = Number(node.initializer.text);
        }
        ts.forEachChild(node, visit);
    };
    visit(source);
    return values;
};

const asImportTarget = (fromFile, node) => {
    if (!ts.isCallExpression(node) || node.arguments.length !== 1) return null;
    const [arg] = node.arguments;
    if (!ts.isArrowFunction(arg) || !ts.isCallExpression(arg.body)) return null;
    if (arg.body.expression.kind !== ts.SyntaxKind.ImportKeyword) return null;
    const [specifier] = arg.body.arguments;
    if (!specifier || !ts.isStringLiteral(specifier) || !specifier.text.startsWith('.')) return null;
    const base = path.resolve(path.dirname(fromFile), specifier.text);
    return ['.tsx', '.ts', '/index.tsx', '/index.ts']
        .map((suffix) => base + suffix)
        .find((candidate) => fs.existsSync(candidate));
};

/**
 * `export const Nome = lazy(() => import('./Alvo'))` — o nome que o consumidor importa
 * é o WRAPPER preguiçoso, não o `…Impl` de dentro. Sem resolver isso, o contrato de
 * responsividade listaria um nome que ninguém escreve no próprio código.
 */
const collectLazyAliases = () => {
    const aliases = new Map();
    for (const file of walkSourceFiles()) {
        const text = fs.readFileSync(file, 'utf-8');
        if (!text.includes('lazy(')) continue;
        const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
        const visit = (node) => {
            if (ts.isVariableDeclaration(node) && node.name && node.initializer) {
                const target = asImportTarget(file, node.initializer);
                if (target) {
                    if (!aliases.has(target)) aliases.set(target, []);
                    aliases.get(target).push(node.name.getText(source));
                }
            }
            ts.forEachChild(node, visit);
        };
        visit(source);
    }
    return aliases;
};

/**
 * Componentes que adaptam SOZINHOS ao dispositivo: os que realmente chamam
 * `useSarakDevice` no próprio código (mais os wrappers preguiçosos deles). Derivado do
 * uso real, não de uma lista à mão — é o que impede o contrato de responsividade de
 * virar prosa desatualizada.
 */
export const collectDeviceAwareComponents = (publicNames) => {
    const publicSet = new Set(publicNames);
    const lazyAliases = collectLazyAliases();
    const found = new Set();
    for (const file of walkSourceFiles()) {
        if (!file.endsWith('.tsx')) continue;
        if (!fs.readFileSync(file, 'utf-8').includes('useSarakDevice(')) continue;
        for (const name of [...namesFromFileExports(file), ...(lazyAliases.get(file) ?? [])]) {
            if (publicSet.has(name)) found.add(name);
        }
    }
    return [...found].sort();
};

/** Props que aceitam valor POR DISPOSITIVO (`ResponsiveValue<T>`) — o refino opcional. */
export const collectResponsiveProps = (components) => {
    const out = [];
    for (const [component, info] of Object.entries(components)) {
        for (const prop of info.props ?? []) {
            if (prop.type.includes('ResponsiveValue')) {
                out.push({ component, prop: prop.name, type: prop.type });
            }
        }
    }
    return out;
};

/**
 * Slots de extensão do cromo (Spec 48): as props OPCIONAIS de `ReactNode` do
 * `SarakAppChrome`. Derivado das props — um slot novo entra no kit sozinho.
 */
export const collectChromeSlots = (components) => {
    const chrome = components.SarakAppChrome;
    if (!chrome) return [];
    return (chrome.props ?? [])
        .filter((prop) => prop.optional && /^React\.ReactNode$|^ReactNode$/.test(prop.type))
        .map((prop) => ({ slot: prop.name, doc: prop.doc }));
};

/** Todo nome exportado pelo barril público (`src/index.ts`) — o que dá para importar. */
export const collectBarrelExports = () =>
    [...collectExportedNames(path.join(SRC, 'index.ts'))].sort();

/**
 * O resto da API React pública que o catálogo de componentes NÃO cobre: ele varre só
 * `components/atomic/` e `components/Layout/`, então `SarakUIProvider`, `SarakShell` e
 * companhia (que moram em `core/`) ficavam de fora. Para o kit isso seria um buraco —
 * são justamente as peças de montagem. Derivado, não listado à mão: todo nome do barril
 * que tenha uma interface `<Nome>Props` no código-fonte.
 */
export const collectExtraPublicApi = ({ barrelExports, known }) => {
    const index = buildPropsIndex();
    const extra = {};
    for (const name of barrelExports) {
        if (known.has(name) || !/^[A-Z]/.test(name)) continue;
        const entry = index.get(`${name}Props`);
        if (!entry) continue;
        extra[name] = {
            propsInterface: `${name}Props`,
            source: entry.file,
            extends: entry.extends || undefined,
            props: entry.props,
        };
    }
    return extra;
};
