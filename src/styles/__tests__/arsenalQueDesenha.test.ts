// @vitest-environment node
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { AtmosphereSchema } from '../../core/Design/schema/atmosphere';

/**
 * O que este teste prova, e o que não: ele lê o TEXTO dos parciais de CSS e as opções do schema. Que o
 * navegador computa o desfoque, a borda e a sombra é prova de `browser-tests/` — `jsdom` não avalia
 * `backdrop-filter` nem `color-mix`.
 */
const STYLES = path.join(process.cwd(), 'src/styles');
const read = (name: string): string => fs.readFileSync(path.join(STYLES, name), 'utf-8');
const allStyles = fs.readdirSync(STYLES).filter((f) => f.endsWith('.css')).map((f) => [f, read(f)] as const);

const optionsOf = (id: string): string[] =>
    (AtmosphereSchema.tokens.find((token) => token.id === id)?.options ?? []).map((option) => String(option.value));

/** Remove comentários de bloco para o teste não confundir prosa com declaração. */
const withoutComments = (css: string): string => css.replace(/\/\*[\s\S]*?\*\//g, '');

describe('backdrop-filter — o build só preserva a forma sem prefixo se ela vier sozinha', () => {
    it.each(allStyles)('%s não declara -webkit-backdrop-filter ao lado da forma sem prefixo', (_name, css) => {
        // Com as duas na mesma regra o lightningcss deixa só `-webkit-` e o Chromium não desfoca.
        expect(withoutComments(css)).not.toMatch(/-webkit-backdrop-filter\s*:/);
    });
});

describe('borderType — uma regra por opção, no atributo que o motor emite', () => {
    const surfaces = withoutComments(read('_surfaces.css'));

    it.each(optionsOf('borderType'))('a opção %s tem regra [data-sx-border-type]', (value) => {
        expect(surfaces).toContain(`[data-sx-border-type="${value}"]`);
    });

    it('não sobra regra no atributo antigo, que nenhum motor emite', () => {
        for (const [name, css] of allStyles) {
            expect(withoutComments(css), name).not.toMatch(/\[data-border=/);
        }
    });
});

describe('shadowOrientation e layeredShadows — sombra do cartão e sombra em camadas', () => {
    const surfaces = withoutComments(read('_surfaces.css'));
    const theme = withoutComments(read('_theme.css'));
    const cards = withoutComments(read('_cards.css'));

    it.each(optionsOf('shadowOrientation'))('a opção %s fixa um vetor de direção', (value) => {
        const rule = surfaces.match(new RegExp(`\\[data-sx-shadow-orientation="${value}"\\]\\s*\\{([^}]*)\\}`));
        expect(rule?.[1]).toMatch(/--sarak-shadow-dir-x:/);
        expect(rule?.[1]).toMatch(/--sarak-shadow-dir-y:/);
    });

    it('a sombra em camadas lê a direção, a cor e o multiplicador layeredShadows', () => {
        expect(theme).toMatch(/--sarak-dynamic-shadow:[\s\S]*--sarak-shadow-dir-y[\s\S]*--sarak-layered-shadows/);
        expect(theme).toMatch(/--sarak-dynamic-shadow:[\s\S]*--sarak-card-shadow-color/);
    });

    it('--dynamic-shadow (lido por SarakSearch e pela busca do cromo) espelha a sombra em camadas', () => {
        expect(theme).toMatch(/--dynamic-shadow:\s*var\(--sarak-dynamic-shadow\)/);
    });

    it('a sombra base e a de hover do cartão viram pela direção', () => {
        const uses = cards.match(/--sarak-shadow-dir-y/g) ?? [];
        expect(uses.length).toBeGreaterThanOrEqual(2);
    });

    it('não sobra a regra antiga em [data-shadow-orientation], que nenhum motor emite', () => {
        for (const [name, css] of allStyles) {
            expect(withoutComments(css), name).not.toMatch(/\[data-shadow-orientation=/);
        }
    });
});

describe('cor de textura — nenhuma textura lê uma variável que ninguém emite', () => {
    it('o schema de textureColor gera as variantes (o canal -rgb) que os leitores pedem', async () => {
        const { ColorsSchema } = await import('../../core/Design/schema/colors');
        const token = ColorsSchema.tokens.find((item) => item.id === 'textureColor');

        expect(token?.generateVariants).toBe(true);
        expect(token?.cssVars).toContain('--theme-texture-color');
    });
});
