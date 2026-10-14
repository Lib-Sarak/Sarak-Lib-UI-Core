import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const THEME_CSS = fs.readFileSync(path.resolve(__dirname, '../_theme.css'), 'utf8').replace(/\r\n/g, '\n');

/** O corpo do bloco que começa em `header` (do primeiro `{` ao `}` que o fecha), sem comentário. */
const bodyOf = (header: string): string => {
    const start = THEME_CSS.indexOf(header);
    if (start < 0) return '';
    const open = THEME_CSS.indexOf('{', start);
    let depth = 0;
    for (let i = open; i < THEME_CSS.length; i += 1) {
        if (THEME_CSS[i] === '{') depth += 1;
        if (THEME_CSS[i] === '}') {
            depth -= 1;
            if (depth === 0) return THEME_CSS.slice(open + 1, i).replace(/\/\*[\s\S]*?\*\//g, '');
        }
    }
    return '';
};

const declarations = (text: string): string[] => text.split(';').map((item) => item.replace(/\s+/g, ' ').trim()).filter(Boolean);

describe('os nomes do tema (`@theme`) alcançam o escopo do rascunho', () => {
    it('há o bloco `@theme inline` (as utilitárias resolvem no elemento) e a regra `:root, .sarak-design-scope`', () => {
        expect(THEME_CSS).toContain('@theme inline {');
        expect(THEME_CSS).toMatch(/:root,\s*\.sarak-design-scope\s*\{/);
        expect(THEME_CSS).not.toMatch(/^@theme \{/m);
    });

    it('os dois blocos declaram os MESMOS nomes com o MESMO valor (um não esquece o que o outro ganha)', () => {
        const inline = declarations(bodyOf('@theme inline'));
        const scope = declarations(bodyOf(':root,\n.sarak-design-scope'));

        expect(scope).toEqual(inline);
        expect(inline.length).toBeGreaterThan(40);
    });

    it('PLANTADO: o raio do botão e a cor primária estão nos dois, lendo a variável do token', () => {
        const scope = bodyOf(':root,\n.sarak-design-scope');

        expect(scope).toContain('--radius-btn: var(--sarak-btn-border-radius');
        expect(scope).toContain('--color-theme-primary: var(--sarak-color-primary');
    });

    it('a vinheta decorativa não está acima da escada: nenhum z-index fixo de 9999, camada derivada da barra lateral', () => {
        const rule = /\.sarak-vignette-layer\s*\{([^}]*)\}/.exec(THEME_CSS)?.[1] ?? '';

        expect(rule).toContain('z-index: calc(var(--sarak-z-sidebar, 500) + 50)');
        expect(rule).not.toContain('9999');
    });
});
