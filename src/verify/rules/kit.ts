import { matchesAny, relativeTo } from '../glob';

/**
 * Forma mínima do que as regras leem do ESLint. O kit NÃO importa o pacote `eslint` (peer
 * opcional): as regras são objetos simples, e o ESLint as chama pela forma `{ meta, create }`.
 * Os nós são os do ESTree/JSX, que o parser padrão e o `@typescript-eslint/parser` devolvem iguais.
 */
export interface Position {
    line: number;
    column: number;
}

export interface AstNode {
    type: string;
    range: [number, number];
    loc: { start: Position; end: Position };
}

export interface RuleContext {
    filename: string;
    cwd: string;
    options: unknown[];
    sourceCode: {
        text: string;
        getText: (node: AstNode) => string;
        getLocFromIndex: (index: number) => Position;
    };
    report: (descriptor: { loc: Position | AstNode['loc']; message: string }) => void;
}

export type Visitor = Record<string, (node: never) => void>;

export interface RuleModule {
    meta: {
        type: 'problem' | 'suggestion';
        docs: { description: string };
        schema: unknown[];
    };
    create: (context: RuleContext) => Visitor;
}

export interface LiteralNode extends AstNode {
    type: 'Literal';
    value: unknown;
}

export interface TemplateNode extends AstNode {
    type: 'TemplateLiteral';
    expressions: AstNode[];
    quasis: { value: { cooked: string | null } }[];
}

/** Esquema comum das regras que aceitam `allow` (globs de arquivo ou nomes a tolerar). */
export const ALLOW_SCHEMA = [
    {
        type: 'object',
        properties: { allow: { type: 'array', items: { type: 'string' } }, ignore: { type: 'array', items: { type: 'string' } } },
        additionalProperties: false,
    },
];

export interface RuleOptions {
    allow: string[];
    ignore: string[];
}

export const readOptions = (context: RuleContext): RuleOptions => {
    const raw = (context.options[0] ?? {}) as Partial<RuleOptions>;
    return { allow: raw.allow ?? [], ignore: raw.ignore ?? [] };
};

/** Caminho do arquivo relativo ao diretório de trabalho do ESLint, em posix. */
export const fileOf = (context: RuleContext): string => relativeTo(context.cwd, context.filename);

/** `allow` por glob de ARQUIVO: o arquivo que casa fica fora da regra. */
export const isAllowedFile = (context: RuleContext, allow: readonly string[]): boolean =>
    allow.length > 0 && matchesAny(allow, fileOf(context));

/** Texto de um literal string ou de um template sem expressões; `undefined` nos demais. */
export const stringValueOf = (node: AstNode | null | undefined): string | undefined => {
    if (!node) return undefined;
    if (node.type === 'Literal') {
        const { value } = node as LiteralNode;
        return typeof value === 'string' ? value : undefined;
    }
    if (node.type === 'TemplateLiteral') {
        const template = node as TemplateNode;
        return template.expressions.length === 0 ? (template.quasis[0]?.value.cooked ?? undefined) : undefined;
    }
    return undefined;
};

const SKIPPED_KEYS = new Set(['parent', 'loc', 'range', 'tokens', 'comments']);

/** Percorre os descendentes de um nó (ESTree/JSX), sem subir pelo `parent`; para no primeiro `test` verdadeiro. */
export const someDescendant = (node: AstNode, test: (child: AstNode) => boolean): boolean => {
    for (const [key, value] of Object.entries(node)) {
        if (SKIPPED_KEYS.has(key) || !value || typeof value !== 'object') continue;
        const children = (Array.isArray(value) ? value : [value]) as AstNode[];
        for (const child of children) {
            if (child && typeof child.type === 'string' && (test(child) || someDescendant(child, test))) return true;
        }
    }
    return false;
};

export const defineRule =(description: string, create: RuleModule['create'], schema: unknown[] = ALLOW_SCHEMA): RuleModule => ({
    meta: { type: 'problem', docs: { description }, schema },
    create,
});
