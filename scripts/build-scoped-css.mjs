/**
 * Gera a variante ESCOPADA do stylesheet (Spec 24 — Modo Embarcado).
 *
 * Entrada: `dist/sarak.css` (build normal, global — Modo App).
 * Saída:   `dist/sarak-scoped.css`, onde TODO seletor de estilo passa a exigir a
 *          classe raiz `.sarak-scope`. Isso confina o preflight do Tailwind e as
 *          regras de elemento da própria lib (`h1..h6`, `button`, `input`, `body`,
 *          `:root`) à ilha embarcada, sem re-estilizar o front do host.
 *
 * Por que pós-processamento e não configuração do Tailwind: o vazamento não vem só
 * do preflight — `src/styles/_typography.css` e `_utilities.css` também trazem
 * seletores de elemento globais (alguns com `!important`). Escopar na saída pega
 * TODAS as fontes de uma vez e não depende de reescrever os parciais (o que mudaria
 * o Modo App). O transformador roda sobre a AST do lightningcss (já presente na
 * árvore do Tailwind v4), nunca por regex sobre texto CSS.
 *
 * At-rules que NÃO são escopadas de propósito: `@keyframes`, `@font-face` e
 * `@property` são registros globais sem seletor — não alteram nenhum elemento do
 * host por si só.
 *
 * Nota de implementação: o transformador usa o visitor `Selector` (não `Rule`) —
 * o visitor de `Rule` do lightningcss não consegue round-tripar o `dist/sarak.css`
 * real ("failed to deserialize ... Specifier"), enquanto o de `Selector` atravessa
 * o arquivo inteiro. Ele também só visita seletores de TOPO: o conteúdo de
 * `:not()`/`:is()` chega aninhado e intocado, então não há risco de prefixar
 * seletores internos.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { transform } from 'lightningcss';

export const SCOPE_CLASS = 'sarak-scope';

const DESCENDANT = { type: 'combinator', value: 'descendant' };
const scopeComponent = (scopeClass) => ({ type: 'class', name: scopeClass });

/** Índice do primeiro combinador — delimita o compound selector inicial. */
const firstCombinatorIndex = (selector) => {
    const index = selector.findIndex((component) => component.type === 'combinator');
    return index === -1 ? selector.length : index;
};

/**
 * Um compound é "raiz do documento" quando ancora em `html`, `body` ou `:root`.
 * Nesses casos o escopo SUBSTITUI a âncora (a ilha passa a ser a raiz), preservando
 * o resto do compound — ex.: `body:not([data-sx-texture="none"]) main` vira
 * `.sarak-scope:not([data-sx-texture="none"]) main`, e os `data-*` que o
 * DesignInjector escreve no container continuam casando.
 */
const rootAnchorIndex = (compound) =>
    compound.findIndex(
        (component) =>
            (component.type === 'type' && (component.name === 'html' || component.name === 'body')) ||
            (component.type === 'pseudo-class' && component.kind === 'root'),
    );

const isAlreadyScoped = (compound, scopeClass) =>
    compound.some((component) => component.type === 'class' && component.name === scopeClass);

/**
 * Escopa UM seletor.
 *
 * Todo seletor ganha EXATAMENTE uma classe, então a especificidade sobe de forma
 * uniforme e a ordem relativa da cascata original é preservada.
 */
export const scopeSelector = (selector, scopeClass = SCOPE_CLASS) => {
    const compoundEnd = firstCombinatorIndex(selector);
    const compound = selector.slice(0, compoundEnd);

    if (isAlreadyScoped(compound, scopeClass)) return selector;

    const anchorIndex = rootAnchorIndex(compound);
    if (anchorIndex !== -1) {
        const scoped = [...selector];
        scoped[anchorIndex] = scopeComponent(scopeClass);
        return scoped;
    }

    // `*` / `*::before` (preflight): o container também precisa da regra, não só os
    // descendentes — `:is()` expressa os dois casos num seletor só.
    if (compound[0]?.type === 'universal' && compoundEnd === selector.length) {
        return [
            {
                type: 'pseudo-class',
                kind: 'is',
                selectors: [
                    [scopeComponent(scopeClass)],
                    [scopeComponent(scopeClass), DESCENDANT, { type: 'universal' }],
                ],
            },
            ...selector.slice(1),
        ];
    }

    return [scopeComponent(scopeClass), DESCENDANT, ...selector];
};

/** Transforma o CSS global no CSS escopado. Exportada para o gate de teste. */
export const scopeCss = (css, { scopeClass = SCOPE_CLASS, minify = true, filename = 'sarak.css' } = {}) => {
    const { code } = transform({
        filename,
        code: Buffer.from(css),
        minify,
        visitor: {
            Selector: (selector) => scopeSelector(selector, scopeClass),
        },
    });
    return code.toString();
};

const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (isDirectRun) {
    const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
    const source = path.join(root, 'dist', 'sarak.css');
    const target = path.join(root, 'dist', 'sarak-scoped.css');

    if (!existsSync(source)) {
        console.error('[build-scoped-css] dist/sarak.css não encontrado — rode "npm run build:css" antes.');
        process.exit(1);
    }

    const scoped = scopeCss(readFileSync(source, 'utf8'));
    writeFileSync(target, scoped, 'utf8');
    console.log(
        `[build-scoped-css] dist/sarak-scoped.css gerado (${(scoped.length / 1024).toFixed(1)} KB, escopo ".${SCOPE_CLASS}").`,
    );
}
