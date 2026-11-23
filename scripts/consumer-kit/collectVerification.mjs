/**
 * Coletor do dado do kit de verificação de uso (`catalog.json › verification`).
 *
 * As regras do plugin de ESLint e do comando `sarak-ui verify` não carregam nenhuma lista de nome da
 * lib (R17): o que elas precisam saber vem de TAGS DE JSDOC nos próprios componentes e funções públicas,
 * lidas aqui por AST, e do que o catálogo já tem. Mexer na tag é mexer no comentário, nunca no
 * comportamento. Tag com forma inválida ou posta em algo que não é do barril FALHA o gerador, em voz
 * alta: dado de verificação errado acusaria o importador à toa.
 *
 *   @replacesElement h2 section[contains:h2,h3]   elemento nativo que este componente substitui
 *   @replacesPiece LinkPagination                  nome local que indica a reescrita desta peça
 *   @encapsulates echarts echarts-for-react        biblioteca que este componente já embrulha
 *   @iconNameProp name | navItems[].icon           onde este componente recebe nome de ícone
 */

import fs from 'node:fs';
import ts from 'typescript';
import { SRC, parse, walkSourceFiles } from '../catalogAst.mjs';

const TAGS = ['replacesElement', 'replacesPiece', 'encapsulates', 'iconNameProp'];
const ELEMENT_TOKEN = /^([a-z][a-z0-9]*)(?:\[contains:([A-Za-z0-9,]+)\])?$/;
const ICON_TOKEN = /^([A-Za-z][A-Za-z0-9]*)(?:\[\]\.([A-Za-z][A-Za-z0-9]*))?$/;
const PALETTE_FILE = 'core/Design/palette/presets.ts';
const PALETTE_CONST = 'SARAK_PALETTE_PRESETS';
const TESTING_ENTRY = 'testing.ts';

const hasExport = (node) => (ts.getModifiers(node) ?? []).some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword);

const declaredName = (node) => {
    if (ts.isFunctionDeclaration(node) && node.name) return node.name.text;
    if (ts.isVariableStatement(node)) return node.declarationList.declarations[0]?.name.getText();
    return undefined;
};

const tagText = (tag) => {
    const comment = tag.comment;
    const text = typeof comment === 'string' ? comment : (comment ?? []).map((part) => part.text).join('');
    return text.trim().split(/\s+/).filter(Boolean);
};

const fail = (file, tag, token, expected) => {
    throw new Error(`[guide] @${tag} inválida em ${file}: "${token}" não segue ${expected}.`);
};

const parseElement = (file, component, token) => {
    const match = ELEMENT_TOKEN.exec(token);
    if (!match) fail(file, 'replacesElement', token, '`elemento` ou `elemento[contains:a,b]`');
    return { element: match[1], component, ...(match[2] ? { contains: match[2].split(',') } : {}) };
};

const parseIcon = (file, component, token) => {
    const match = ICON_TOKEN.exec(token);
    if (!match) fail(file, 'iconNameProp', token, '`prop` ou `prop[].chave`');
    return { component, prop: match[1], ...(match[2] ? { key: match[2] } : {}) };
};

const PARSERS = {
    replacesElement: (file, component, token, out) => out.nativeEquivalents.push(parseElement(file, component, token)),
    replacesPiece: (file, component, token, out) => out.pieceAliases.push({ alias: token, use: component }),
    encapsulates: (file, component, token, out) => out.encapsulated.push({ library: token, component }),
    iconNameProp: (file, component, token, out) => out.iconNameProps.push(parseIcon(file, component, token)),
};

const collectFromFile = (file, out, barrel) => {
    const source = ts.createSourceFile(file, fs.readFileSync(file, 'utf-8'), ts.ScriptTarget.Latest, true);
    for (const statement of source.statements) {
        const tags = ts.getJSDocTags(statement).filter((tag) => TAGS.includes(tag.tagName.text));
        if (tags.length === 0) continue;
        const component = hasExport(statement) ? declaredName(statement) : undefined;
        if (!component || !barrel.has(component)) {
            throw new Error(`[guide] tag de verificação em ${file}: só vale em exportação do barril público ou do subpath testing (achei "${component ?? 'nada exportado'}").`);
        }
        for (const tag of tags) for (const token of tagText(tag)) PARSERS[tag.tagName.text](file, component, token, out);
    }
};

const byJson = (left, right) => JSON.stringify(left).localeCompare(JSON.stringify(right));

/** Chaves do objeto `SARAK_PALETTE_PRESETS` — os ids de paleta prontos. */
const collectPaletteIds = () => {
    const ids = [];
    const visit = (node) => {
        if (ts.isVariableDeclaration(node) && node.name.getText() === PALETTE_CONST && node.initializer && ts.isObjectLiteralExpression(node.initializer)) {
            for (const property of node.initializer.properties) {
                if (ts.isPropertyAssignment(property)) ids.push(ts.isStringLiteral(property.name) ? property.name.text : property.name.getText());
            }
        }
        ts.forEachChild(node, visit);
    };
    visit(parse(PALETTE_FILE));
    return ids.sort();
};

/** Nomes públicos do subpath `testing` (`createSarakKitMock`…): a tag também vale neles. */
const collectTestingExports = () => {
    const names = [];
    for (const statement of parse(TESTING_ENTRY).statements) {
        const clause = ts.isExportDeclaration(statement) && !statement.isTypeOnly ? statement.exportClause : undefined;
        if (clause && ts.isNamedExports(clause)) names.push(...clause.elements.filter((item) => !item.isTypeOnly).map((item) => item.name.text));
    }
    return names;
};

export const collectVerification = ({ barrelExports }) => {
    const barrel = new Set([...barrelExports, ...collectTestingExports()]);
    const out = { nativeEquivalents: [], pieceAliases: [], encapsulated: [], iconNameProps: [] };
    for (const file of walkSourceFiles(SRC)) {
        if (/@(?:replacesElement|replacesPiece|encapsulates|iconNameProp)\b/.test(fs.readFileSync(file, 'utf-8'))) {
            collectFromFile(file, out, barrel);
        }
    }
    return {
        nativeEquivalents: out.nativeEquivalents.sort(byJson),
        pieceAliases: out.pieceAliases.sort(byJson),
        encapsulated: out.encapsulated.sort(byJson),
        iconNameProps: out.iconNameProps.sort(byJson),
        paletteIds: collectPaletteIds(),
    };
};
