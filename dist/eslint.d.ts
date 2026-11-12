/**
 * Forma mínima do que as regras leem do ESLint. O kit NÃO importa o pacote `eslint` (peer
 * opcional): as regras são objetos simples, e o ESLint as chama pela forma `{ meta, create }`.
 * Os nós são os do ESTree/JSX, que o parser padrão e o `@typescript-eslint/parser` devolvem iguais.
 */
interface Position {
    line: number;
    column: number;
}
interface AstNode {
    type: string;
    range: [number, number];
    loc: {
        start: Position;
        end: Position;
    };
}
interface RuleContext {
    filename: string;
    cwd: string;
    options: unknown[];
    sourceCode: {
        text: string;
        getText: (node: AstNode) => string;
        getLocFromIndex: (index: number) => Position;
    };
    report: (descriptor: {
        loc: Position | AstNode['loc'];
        message: string;
    }) => void;
}
type Visitor = Record<string, (node: never) => void>;
interface RuleModule {
    meta: {
        type: 'problem' | 'suggestion';
        docs: {
            description: string;
        };
        schema: unknown[];
    };
    create: (context: RuleContext) => Visitor;
}

/**
 * O plugin de ESLint do kit de verificação. Cada regra nasce DESLIGADA: o importador a liga pelo
 * nome, com a severidade que quiser. O `recommended` só recebe a regra que a medição nos importadores
 * reais aprovou (lista abaixo, com o motivo de cada ausência).
 */
declare const rules: Record<string, RuleModule>;
declare const plugin: {
    rules: Record<string, RuleModule>;
    configs: Record<string, unknown>;
};

export { plugin as default, rules };
