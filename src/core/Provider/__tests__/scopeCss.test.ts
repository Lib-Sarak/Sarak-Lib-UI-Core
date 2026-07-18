/**
 * Gate do transformador de CSS escopado (Spec 24 §2.1).
 *
 * A variante `dist/sarak-scoped.css` é o que impede o preflight do Tailwind e as
 * regras de elemento da lib (`h1..h6`, `button`, `input`, `body`, `:root`) de
 * re-estilizarem o front do host. Este gate prova que o transformador confina TODOS
 * os seletores em `.sarak-scope` — inclusive os casos que quebram um prefixador
 * ingênuo: universal, âncora de documento, `:not()` aninhado e at-rules.
 */

import { describe, it, expect } from 'vitest';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error — script de build em JS puro, sem tipos (roda só em Node).
import { scopeCss, SCOPE_CLASS } from '../../../../scripts/build-scoped-css.mjs';

const scope = (css: string): string => String(scopeCss(css, { minify: false }));

describe('scopeCss — confinamento de seletores em .sarak-scope', () => {
    it('a classe de escopo do build casa com a do runtime', async () => {
        const { SARAK_SCOPE_CLASS } = await import('../scope');
        expect(SCOPE_CLASS).toBe(SARAK_SCOPE_CLASS);
    });

    it('prefixa seletores de elemento (o preflight deixa de alcançar o host)', () => {
        expect(scope('h1,h2{margin:0}')).toContain('.sarak-scope h1');
        expect(scope('h1,h2{margin:0}')).toContain('.sarak-scope h2');
        expect(scope('button:not(.p-0){padding:4px}')).toContain('.sarak-scope button');
    });

    it('substitui as âncoras de documento (`html`/`body`/`:root`) pela ilha', () => {
        expect(scope(':root{--a:1}')).toMatch(/\.sarak-scope\s*\{/);
        expect(scope('html{color:red}')).toMatch(/\.sarak-scope\s*\{/);
        expect(scope('body{margin:0}')).toMatch(/\.sarak-scope\s*\{/);
        // A âncora some, mas o resto do compound e os descendentes sobrevivem.
        const out = scope('body:not([data-sx-texture="none"]) main{z-index:0}');
        expect(out).toContain('.sarak-scope:not([data-sx-texture=');
        expect(out).toContain('main');
        expect(out).not.toMatch(/(^|[^-\w])body/);
    });

    it('o universal cobre a ilha E seus descendentes', () => {
        const out = scope('*{box-sizing:border-box}');
        expect(out).toMatch(/:is\(\.sarak-scope,\s*\.sarak-scope \*\)/);
    });

    it('não prefixa seletores DENTRO de `:not()`/`:is()` (só os de topo)', () => {
        const out = scope('.a:is(.b,.c){color:red}');
        expect(out).toMatch(/\.sarak-scope \.a:is\(\.b,\s*\.c\)/);
        expect(out).not.toContain(':is(.sarak-scope .b');
    });

    it('escopa dentro de `@media`, `@supports` e `@layer`', () => {
        expect(scope('@media (min-width:10px){body{margin:2px}}')).toMatch(/\.sarak-scope\s*\{/);
        expect(scope('@layer base{h1{margin:0}}')).toContain('.sarak-scope h1');
        expect(scope('@supports (display:grid){.x{display:grid}}')).toContain('.sarak-scope .x');
    });

    it('preserva registros globais sem seletor (`@keyframes`, `@font-face`, `@property`)', () => {
        const out = scope('@keyframes k{from{opacity:0}to{opacity:1}}');
        expect(out).toContain('@keyframes k');
        expect(out).not.toContain('.sarak-scope from');
        expect(scope('@font-face{font-family:X;src:url(a.woff2)}')).toContain('@font-face');
    });

    it('é idempotente: seletor já escopado não ganha um segundo prefixo', () => {
        const once = scope('.sarak-scope .card{color:red}');
        expect(once).toContain('.sarak-scope .card');
        expect(once).not.toContain('.sarak-scope .sarak-scope');
    });

    it('gate agregado: NENHUM seletor escapa do escopo', () => {
        const amostra = [
            '*,::before,::after{box-sizing:border-box}',
            ':root{--sarak-ui-core-css-loaded:1}',
            'h1,h2,h3{font-family:var(--font-heading)!important}',
            'body,span,p,div{font-family:var(--font-main)}',
            'button:not(.p-0){cursor:pointer}',
            'input,select,textarea{font:inherit}',
            'body:not([data-sx-texture="none"]) main{z-index:0}',
            '@media (min-width:768px){.grid-x{display:grid}}',
        ].join('\n');

        const out = scope(amostra);
        // Toda regra de estilo da saída precisa mencionar a âncora de escopo.
        const regras = out.split('}').filter((bloco) => bloco.includes('{') && !bloco.includes('@media'));
        regras.forEach((bloco) => {
            const seletor = bloco.slice(0, bloco.indexOf('{'));
            if (!seletor.trim()) return;
            expect(seletor).toContain('.sarak-scope');
        });
    });
});
