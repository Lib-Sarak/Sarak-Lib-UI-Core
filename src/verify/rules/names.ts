import { baseName, loadVerificationData } from '../data';
import { closestNames, formatSuggestions } from '../suggest';
import type { VerificationData } from '../types';
import {
    defineRule,
    isAllowedFile,
    fileOf,
    readOptions,
    someDescendant,
    stringValueOf,
    type AstNode,
    type RuleContext,
    type Visitor,
} from './kit';

interface NamedNode extends AstNode {
    name?: string;
}

interface DeclarationNode extends AstNode {
    id?: NamedNode | null;
    declarations?: { id: NamedNode }[];
}

interface ExportNode extends AstNode {
    source?: AstNode | null;
    exportKind?: string;
    declaration?: DeclarationNode | null;
    specifiers?: { exported: NamedNode; exportKind?: string }[];
}

interface ImportNode extends AstNode {
    source: { value?: unknown };
    specifiers: { imported?: NamedNode }[];
}

const TYPE_DECLARATIONS = new Set(['TSInterfaceDeclaration', 'TSTypeAliasDeclaration']);

interface PropertyNode extends AstNode {
    key: NamedNode & { value?: unknown };
    value: AstNode;
    parent?: AstNode & { parent?: PropertyNode };
}

interface AttributeNode extends AstNode {
    name?: NamedNode;
    value?: (AstNode & { expression?: AstNode }) | null;
}

interface OpeningNode extends AstNode {
    name: NamedNode;
    attributes: AttributeNode[];
}

/** Chaves de objeto que carregam um id de tema/paleta; um teste confere que o catálogo gerado as declara. */
export const DEFAULT_THEME_KEY = 'defaultTheme';
export const THEME_OPTIONS_KEY = 'theme';
export const PALETTE_KEY = 'colorPalette';
const CUSTOM_PALETTE = /^custom:/;
/** Caminho de dublê de teste: lá o nome da peça pública é de propósito, e o substituto é outro. */
const TEST_DOUBLE_PATH = /(?:^|\/)(?:testing|__mocks__|mocks?)(?:\/|\.)|\.mock\./i;

const propKey = (property: PropertyNode): string | undefined =>
    property.key.type === 'Identifier' ? property.key.name : typeof property.key.value === 'string' ? property.key.value : undefined;

const listOf = (names: string[]): string => names.map((name) => `\`${name}\``).join(' ou ');

// ---------------------------------------------------------------- no-reimplemented-piece

/**
 * Só export de VALOR (função, classe, constante): um tipo com o nome de uma peça pública quase nunca é a
 * mesma coisa — o `DocumentKind` do importador é outro conjunto de valores, e o `NavigationItem` é o
 * contrato da API dele. Medido nos importadores reais; o sinal de nome só vale para o que roda.
 */
const exportedNames = (node: ExportNode): string[] => {
    if (node.source || node.exportKind === 'type') return [];
    const declaration = node.declaration;
    const isType = declaration !== undefined && declaration !== null && TYPE_DECLARATIONS.has(declaration.type);
    const fromDeclaration = isType ? [] : [declaration?.id?.name, ...(declaration?.declarations ?? []).map((item) => item.id.name)];
    const fromSpecifiers = (node.specifiers ?? []).filter((specifier) => specifier.exportKind !== 'type').map((specifier) => specifier.exported.name);
    return [...fromDeclaration, ...fromSpecifiers].filter((name): name is string => Boolean(name));
};

/**
 * Nomes que o arquivo importa, de onde for: quem importa a peça pública (da lib ou da porta única do
 * projeto, que a reexporta) está EMBRULHANDO-a, não a reescrevendo. O `Table` e o `Pagination` dos logins
 * importam `SarakTable`/`SarakPagination` de `@sarak/ui-kit`, e não da lib.
 */
const importedNames = (node: ImportNode, into: Set<string>): void => {
    for (const specifier of node.specifiers) if (specifier.imported?.name) into.add(specifier.imported.name);
};

const pieceMessage = (name: string, data: VerificationData, aliases: Map<string, string[]>, inDouble: boolean): string | null => {
    const alias = aliases.get(name);
    const barrel = data.barrelByBase.get(baseName(name));
    if (alias && (!barrel || inDouble)) return `\`${name}\` reescreve peça que a lib já entrega: use ${listOf(alias)}.`;
    if (barrel) return `\`${name}\` tem o nome de peça pública da lib (\`${barrel}\`): se faz a mesma coisa, use \`${barrel}\` em vez de manter a cópia.`;
    return null;
};

const noReimplementedPiece = (context: RuleContext): Visitor => {
    const { allow, ignore } = readOptions(context);
    if (isAllowedFile(context, allow)) return {};
    const data = loadVerificationData();
    const aliases = new Map<string, string[]>();
    for (const { alias, use } of data.catalog.verification.pieceAliases) aliases.set(alias, [...(aliases.get(alias) ?? []), use]);
    const inDouble = TEST_DOUBLE_PATH.test(fileOf(context));
    const imported = new Set<string>();
    const candidates: { name: string; loc: AstNode['loc'] }[] = [];
    const wraps = (name: string): boolean =>
        [...(aliases.get(name) ?? []), data.barrelByBase.get(baseName(name))].some((use) => use !== undefined && imported.has(use));
    return {
        ImportDeclaration: (node: ImportNode) => importedNames(node, imported),
        ExportNamedDeclaration: (node: ExportNode) => {
            for (const name of exportedNames(node).filter((candidate) => !ignore.includes(candidate))) candidates.push({ name, loc: node.loc });
        },
        'Program:exit': () => {
            let reported = false;
            for (const { name, loc } of candidates.filter((candidate) => !wraps(candidate.name))) {
                const message = pieceMessage(name, data, aliases, inDouble);
                if (message) context.report({ loc, message });
                reported ||= message !== null;
            }
            const file = fileOf(context).split('/').pop() ?? '';
            const stem = file.replace(/\.[^.]+$/, '');
            // O nome do arquivo só vale para arquivo sem export de valor próprio (ex.: `export default`): um
            // `pagination.ts` com `withPage` ou um `tabs.ts` com a lista de abas não reescrevem peça nenhuma.
            const skip = reported || candidates.length > 0 || stem === 'index' || ignore.includes(stem) || wraps(stem);
            const message = skip ? null : pieceMessage(stem, data, aliases, inDouble);
            if (message) context.report({ loc: { line: 1, column: 0 }, message: message.replace(/^`[^`]+` /, `O arquivo \`${file}\` `) });
        },
    };
};

// ---------------------------------------------------------------- known-icon-name

const unknownIconMessage = (name: string, data: VerificationData): string =>
    `O ícone \`${name}\` não existe na lib: cai no ícone de aviso e só avisa no console.${formatSuggestions(closestNames(name, data.iconNames))} Ícone próprio se registra na lib e se lista em \`allow\`.`;

const checkIconValue = (context: RuleContext, data: VerificationData, allow: string[]) => (node: AstNode): void => {
    const name = stringValueOf(node);
    if (name === undefined || data.iconNames.has(name) || allow.includes(name)) return;
    context.report({ loc: node.loc, message: unknownIconMessage(name, data) });
};

const checkIconKeys = (root: AstNode, key: string, check: (node: AstNode) => void): void => {
    someDescendant(root, (child) => {
        const property = child as PropertyNode;
        if (child.type === 'Property' && propKey(property) === key) check(property.value);
        return false;
    });
};

const knownIconName = (context: RuleContext): Visitor => {
    const data = loadVerificationData();
    const { allow } = readOptions(context);
    const check = checkIconValue(context, data, allow);
    const carriers = data.catalog.verification.iconNameProps;
    return {
        JSXOpeningElement: (node: OpeningNode) => {
            for (const carrier of carriers.filter((entry) => entry.component === node.name.name)) {
                const attribute = node.attributes.find((item) => item.name?.name === carrier.prop);
                const value = attribute?.value;
                if (!value) continue;
                if (carrier.key) {
                    if (value.expression) checkIconKeys(value.expression, carrier.key, check);
                    continue;
                }
                check(value.type === 'JSXExpressionContainer' && value.expression ? value.expression : value);
            }
        },
    };
};

// ---------------------------------------------------------------- known-theme-id

const themeMessage = (id: string, data: VerificationData): string =>
    `O tema \`${id}\` não é embarcado na lib.${formatSuggestions(closestNames(id, data.themeIds))} Se é tema do importador (\`customThemes\`), liste-o em \`allow\`.`;

const paletteMessage = (id: string, data: VerificationData): string =>
    `A paleta \`${id}\` não existe na lib.${formatSuggestions(closestNames(id, data.paletteIds))} Fora das prontas, só vale o formato \`custom:<tipo>:<#base>\`.`;

const isThemeDefault = (property: PropertyNode): boolean => {
    const owner = property.parent?.parent;
    return propKey(property) === DEFAULT_THEME_KEY && owner?.type === 'Property' && propKey(owner) === THEME_OPTIONS_KEY;
};

const knownThemeId = (context: RuleContext): Visitor => {
    const data = loadVerificationData();
    const { allow } = readOptions(context);
    const flagTheme = (node: AstNode): void => {
        const id = stringValueOf(node);
        if (id && !data.themeIds.has(id) && !allow.includes(id)) context.report({ loc: node.loc, message: themeMessage(id, data) });
    };
    return {
        JSXOpeningElement: (node: OpeningNode) => {
            const props = node.name.name ? data.themeIdProps.get(node.name.name) : undefined;
            for (const attribute of node.attributes.filter((item) => item.name?.name && props?.has(item.name.name))) {
                const value = attribute.value;
                if (value) flagTheme(value.type === 'JSXExpressionContainer' && value.expression ? value.expression : value);
            }
        },
        Property: (node: PropertyNode) => {
            if (isThemeDefault(node)) flagTheme(node.value);
            const id = propKey(node) === PALETTE_KEY ? stringValueOf(node.value) : undefined;
            if (id && !data.paletteIds.has(id) && !CUSTOM_PALETTE.test(id) && !allow.includes(id)) {
                context.report({ loc: node.value.loc, message: paletteMessage(id, data) });
            }
        },
    };
};

export const nameRules = {
    'no-reimplemented-piece': defineRule('Barra peça local com o nome de uma peça pública que a lib já entrega.', noReimplementedPiece),
    'known-icon-name': defineRule('Barra nome de ícone literal que a lib não conhece.', knownIconName),
    'known-theme-id': defineRule('Barra id de tema ou de paleta literal que a lib não conhece.', knownThemeId),
};
