// @vitest-environment node
// Teste do PRÓPRIO GATE `css-important:check`. Casos PLANTADOS que ele PEGA (o bloco de
// `_atmosphere.css` que atropelava o cartão, o reset de `main`/`section`, o `!important` de fundo do
// `.sarak-card`), os que ele DEIXA PASSAR (o modo eco, o movimento reduzido, a escolha explícita de
// token por atributo com valor, a exceção declarada) e, por fim, o repositório real.
import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterEach, describe, expect, it } from 'vitest';
import {
    classifySelector,
    collectRules,
    findImportantInTypeScript,
    findImportantVisualViolations,
    importantInStringLiterals,
} from '../check-css-important-visual.mjs';

const scratchDirs = [];

function stylesFixture(files) {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sarak-css-important-'));
    scratchDirs.push(dir);
    for (const [name, css] of Object.entries(files)) fs.writeFileSync(path.join(dir, name), css, 'utf8');
    return dir;
}

function violationsOf(css, name = '_probe.css') {
    return findImportantVisualViolations({ stylesDir: stylesFixture({ [name]: css }) }).violations;
}

afterEach(() => {
    while (scratchDirs.length) fs.rmSync(scratchDirs.pop(), { recursive: true, force: true });
});

describe('PLANTADO: o que o gate pega', () => {
    it('raio com !important em .card sob o escopo de design sempre ligado', () => {
        const found = violationsOf('.sarak-design-scope .card { border-radius: 4px !important; }');
        expect(found.map((v) => v.property)).toEqual(['border-radius']);
        expect(found[0].selector).toBe('.sarak-design-scope .card');
    });

    it('atributo SEM valor ([data-sx-texture]) não estreita: o fundo do cartão', () => {
        expect(violationsOf('[data-sx-texture] .sarak-card { background: red !important; }')).toHaveLength(1);
    });

    it('o reset de main/section com :not() e body, que vale sempre', () => {
        const found = violationsOf('body:not([data-sx-texture="none"]) main { background-color: transparent !important; }');
        expect(found).toHaveLength(1);
    });

    it('fundo !important no próprio .sarak-card / .bg-theme-card', () => {
        const found = violationsOf('.sarak-card, .bg-theme-card { background-color: var(--x) !important; }');
        expect(found.map((v) => v.selector).sort()).toEqual(['.bg-theme-card', '.sarak-card']);
    });

    it('transição, sombra e recorte também contam como visual', () => {
        const found = violationsOf('.card { transition: all 1s !important; box-shadow: none !important; clip-path: none !important; }');
        expect(found.map((v) => v.property).sort()).toEqual(['box-shadow', 'clip-path', 'transition']);
    });

    it('elemento solto com !important visual', () => {
        expect(violationsOf('section { opacity: 0.5 !important; }')).toHaveLength(1);
    });

    it('MUTAÇÃO: reintroduzir o bloco que atropelava o cartão faz o gate falhar', () => {
        const css = `
            .sarak-design-scope .sarak-card {
                background: color-mix(in srgb, var(--sarak-card-bg), transparent) !important;
                border-radius: var(--sarak-card-radius-tl, 12px) !important;
                transition: all 0.3s ease !important;
            }`;
        expect(violationsOf(css).length).toBeGreaterThanOrEqual(3);
    });
});

describe('o que o gate deixa passar', () => {
    it('modo eco: classe de modo e atributo com valor', () => {
        expect(violationsOf('.sarak-eco-mode * { transition-duration: 0.1s !important; backdrop-filter: none !important; }')).toEqual([]);
        expect(violationsOf('[data-example="eco"] * { box-shadow: none !important; }')).toEqual([]);
    });

    it('movimento reduzido: atributo com valor e @media', () => {
        expect(violationsOf(':root[data-sx-reduced-motion="true"] * { transition-duration: 0.01ms !important; }')).toEqual([]);
        expect(violationsOf('@media (prefers-reduced-motion: reduce) { :root * { transition-duration: 0.01ms !important; } }')).toEqual([]);
    });

    it('escolha explícita de token: o material e a moldura estreitam por atributo com valor', () => {
        expect(violationsOf('[data-sx-surface-material="frosted"] :is(.sarak-card, .bg-theme-card) { backdrop-filter: blur(4px) !important; }')).toEqual([]);
        expect(violationsOf('[data-sx-border-type="glow"] :is(.sarak-card, .sarak-shell-sidebar) { border-color: red !important; }')).toEqual([]);
    });

    it('estado: hover e :active estreitam', () => {
        expect(violationsOf('.sarak-card:hover { transform: none !important; }')).toEqual([]);
        expect(violationsOf('.bg-theme-card:active { transform: scale(1) !important; }')).toEqual([]);
    });

    it('classe de modo no ancestral (is-geometric) estreita', () => {
        expect(violationsOf('body.is-geometric .bg-theme-card { clip-path: none !important; }')).toEqual([]);
    });

    it('declaração sem !important, em qualquer seletor amplo', () => {
        expect(violationsOf('.sarak-design-scope .card { border-radius: 4px; } section { background-color: transparent; }')).toEqual([]);
    });

    it('propriedade de layout com !important em .card não é visual', () => {
        expect(violationsOf('.card { margin: 0 !important; min-width: 0 !important; display: none !important; }')).toEqual([]);
    });

    it('classe utilitária da lib com nome próprio (o !important é o desenho dela)', () => {
        expect(violationsOf('.rounded-theme { border-radius: var(--radius-theme) !important; }')).toEqual([]);
    });

    it('a exceção declarada: o fundo do body em _base.css', () => {
        const dir = stylesFixture({ '_base.css': 'body { background-color: var(--bg-body) !important; }' });
        const { violations, staleExceptions } = findImportantVisualViolations({ stylesDir: dir });
        expect(violations).toEqual([]);
        expect(staleExceptions).toEqual([]);
    });
});

describe('exceção vencida', () => {
    it('a exceção que deixou de existir é acusada, para a lista não apodrecer', () => {
        const { staleExceptions } = findImportantVisualViolations({ stylesDir: stylesFixture({ '_base.css': 'body { color: red; }' }) });
        expect(staleExceptions.map((e) => e.file)).toEqual(['_base.css']);
    });

    it('o mesmo corpo em OUTRO arquivo não herda a exceção', () => {
        expect(violationsOf('body { background-color: red !important; }', '_other.css')).toHaveLength(1);
    });
});

describe('o analisador', () => {
    it('lê regras dentro de @media e ignora @keyframes', () => {
        const rules = collectRules('@keyframes x { from { opacity: 0 !important; } } @media (min-width: 1px) { .a { color: red; } }');
        expect(rules.map((r) => r.selector)).toEqual(['.a']);
        expect(rules[0].atContext).toHaveLength(1);
    });

    it('ignora !important em comentário', () => {
        expect(violationsOf('/* .card { border-radius: 1px !important; } */ .card { margin: 0; }')).toEqual([]);
    });

    it('classifica: estreitado × amplo', () => {
        expect(classifySelector('.sarak-design-scope .card')).toEqual({ broad: true, narrowed: false });
        expect(classifySelector('.card:hover')).toEqual({ broad: true, narrowed: true });
        expect(classifySelector('#root')).toEqual({ broad: false, narrowed: false });
    });
});

describe('!important montado em TypeScript', () => {
    const srcFixture = (files) => {
        const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sarak-ts-important-'));
        scratchDirs.push(dir);
        for (const [name, text] of Object.entries(files)) {
            const full = path.join(dir, name);
            fs.mkdirSync(path.dirname(full), { recursive: true });
            fs.writeFileSync(full, text, 'utf8');
        }
        return dir;
    };

    it('PLANTADO: o !important dentro de um template literal é acusado, com a linha', () => {
        const text = 'const css = `\n  body.light .text-white {\n    color: red !important;\n  }\n`;\n';
        expect(importantInStringLiterals(text)).toEqual([3]);
    });

    it('PLANTADO: string comum e aspas simples também', () => {
        expect(importantInStringLiterals("const a = 'color: red !important';")).toEqual([1]);
        expect(importantInStringLiterals('const a = "color: red !important";')).toEqual([1]);
    });

    it('PASSA: !important em comentário (linha ou bloco) não é CSS montado', () => {
        const text = '// color: red !important\n/* e este !important */\nconst a = 1;\n';
        expect(importantInStringLiterals(text)).toEqual([]);
    });

    it('PASSA: aspas dentro de comentário não abrem string', () => {
        expect(importantInStringLiterals("// it's fine\nconst a = 'x !important';\n")).toEqual([2]);
    });

    it('varre src/**/*.{ts,tsx}, ignora teste e gerado, e acusa o arquivo', () => {
        const dir = srcFixture({
            'core/Injector.tsx': 'export const css = `a { color: red !important; }`;',
            'core/__tests__/Injector.test.tsx': 'export const css = `a { color: red !important; }`;',
            'core/generated/types.ts': "export const css = 'a !important';",
            'core/clean.ts': 'export const css = `a { color: red; }`;',
        });
        const { violations } = findImportantInTypeScript({ srcDir: dir, exceptions: [] });
        expect(violations).toEqual([{ file: 'src/core/Injector.tsx', line: 1 }]);
    });

    it('a exceção declarada passa, e a que deixou de existir é acusada', () => {
        const dir = srcFixture({ 'core/Injector.tsx': 'export const css = `a { color: red !important; }`;' });
        const withException = findImportantInTypeScript({ srcDir: dir, exceptions: [{ file: 'core/Injector.tsx', reason: 'x' }] });
        expect(withException.violations).toEqual([]);
        expect(withException.staleExceptions).toEqual([]);
        const stale = findImportantInTypeScript({ srcDir: srcFixture({ 'core/clean.ts': 'const a = 1;' }), exceptions: [{ file: 'core/Injector.tsx', reason: 'x' }] });
        expect(stale.staleExceptions.map((e) => e.file)).toEqual(['core/Injector.tsx']);
    });
});

describe('o repositório real', () => {
    it('src/styles não tem !important visual em seletor amplo, e as exceções declaradas existem', () => {
        const { violations, staleExceptions } = findImportantVisualViolations();
        expect(violations).toEqual([]);
        expect(staleExceptions).toEqual([]);
    });

    it('src/**/*.{ts,tsx} não monta !important em string nem em template', () => {
        const { violations, staleExceptions } = findImportantInTypeScript();
        expect(violations).toEqual([]);
        expect(staleExceptions).toEqual([]);
    });
});
