import { loadVerificationData } from '../data';
import { closestNames, formatSuggestions } from '../suggest';
import { defineRule, isAllowedFile, readOptions, stringValueOf, type AstNode, type RuleContext, type Visitor } from './kit';

interface Specifier {
    imported?: { name?: string };
    local?: { name?: string };
}

interface ModuleNode extends AstNode {
    source?: AstNode | null;
    specifiers?: Specifier[];
}

interface CallNode extends AstNode {
    callee: AstNode & { name?: string };
    arguments: AstNode[];
}

type OnSource = (source: string, node: AstNode, names: string[]) => void;

const namesOf = (node: ModuleNode): string[] =>
    (node.specifiers ?? []).map((specifier) => specifier.imported?.name ?? specifier.local?.name ?? '').filter(Boolean);

/** Cobre `import`, `export … from`, `import()` e `require()` com caminho literal; o resto não é visto. */
const moduleSources = (onSource: OnSource): Visitor => {
    const fromNode = (node: ModuleNode): void => {
        const source = stringValueOf(node.source);
        if (source !== undefined) onSource(source, node, namesOf(node));
    };
    return {
        ImportDeclaration: fromNode,
        ExportNamedDeclaration: fromNode,
        ExportAllDeclaration: fromNode,
        ImportExpression: (node: ModuleNode) => fromNode(node),
        CallExpression: (node: CallNode) => {
            if (node.callee.type !== 'Identifier' || node.callee.name !== 'require') return;
            const source = stringValueOf(node.arguments[0]);
            if (source !== undefined) onSource(source, node, []);
        },
    };
};

const isLibSource = (source: string, libName: string): boolean => source === libName || source.startsWith(`${libName}/`);

/** O nome do pacote de um caminho de import (`@dnd-kit/core/x` → `@dnd-kit/core`; `echarts/core` → `echarts`). */
const packageOf = (source: string): string => {
    const parts = source.split('/');
    return source.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0];
};

const singleEntrypoint = (context: RuleContext): Visitor => {
    const { allow } = readOptions(context);
    const { libName } = loadVerificationData();
    if (allow.length === 0 || isAllowedFile(context, allow)) return {};
    return moduleSources((source, node, names) => {
        if (!isLibSource(source, libName)) return;
        const what = names.length > 0 ? `\`${names.join('`, `')}\`` : `\`${source}\``;
        context.report({
            loc: node.loc,
            message: `Importe ${what} pela porta única do projeto (${allow.map((glob) => `\`${glob}\``).join(', ')}); a lib não se importa direto daqui.`,
        });
    });
};

const noDeepImport = (context: RuleContext): Visitor => {
    const { libName, exportKeys } = loadVerificationData();
    return moduleSources((source, node) => {
        if (!isLibSource(source, libName) || source === libName) return;
        const subpath = `.${source.slice(libName.length)}`;
        if (exportKeys.includes(subpath)) return;
        const published = exportKeys.filter((key) => key !== '.').map((key) => `${libName}${key.slice(1)}`);
        context.report({
            loc: node.loc,
            message: `\`${source}\` é import profundo, fora do contrato público: importe \`${libName}\` ou um dos subpaths publicados (${published.map((name) => `\`${name}\``).join(', ')}).${formatSuggestions(closestNames(subpath, exportKeys))}`,
        });
    });
};

const noDirectWrappedLib = (context: RuleContext): Visitor => {
    const { allow } = readOptions(context);
    const { catalog } = loadVerificationData();
    if (isAllowedFile(context, allow)) return {};
    const wrapped = new Map(catalog.verification.encapsulated.map((entry) => [entry.library, entry.component]));
    return moduleSources((source, node) => {
        const component = wrapped.get(packageOf(source));
        if (!component) return;
        context.report({
            loc: node.loc,
            message: `\`${packageOf(source)}\` já vem embrulhada pela lib: use \`${component}\` em vez de importar a biblioteca direto.`,
        });
    });
};

export const importRules = {
    'single-entrypoint': defineRule('Barra import da lib fora da porta única declarada em `allow`.', singleEntrypoint),
    'no-deep-import': defineRule('Barra import de caminho que não está no `exports` da lib.', noDeepImport),
    'no-direct-wrapped-lib': defineRule('Barra import direto de biblioteca que a lib já encapsula num componente.', noDirectWrappedLib),
};
