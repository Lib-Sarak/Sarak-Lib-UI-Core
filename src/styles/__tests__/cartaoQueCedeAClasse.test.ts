// @vitest-environment node
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Lê o TEXTO dos parciais de CSS: onde o padrão do cartão mora e o que ele não impõe. Que o navegador
 * computa a classe vencendo o padrão, o eco vencendo o cartão e a transição pelo token é prova de
 * `browser-tests/cascata-que-cede.spec.ts` — o `jsdom` não resolve camadas de CSS.
 */
const STYLES = path.join(process.cwd(), 'src/styles');
const read = (name: string): string => fs.readFileSync(path.join(STYLES, name), 'utf-8');
const withoutComments = (css: string): string => css.replace(/\/\*[\s\S]*?\*\//g, '');

/** O corpo da primeira regra cujo seletor contém o trecho dado. */
const bodyOf = (css: string, selector: string): string => {
    const start = css.indexOf(selector);
    if (start < 0) return '';
    const open = css.indexOf('{', start);
    return css.slice(open + 1, css.indexOf('}', open));
};

const defaults = withoutComments(read('_card-defaults.css'));
const cards = withoutComments(read('_cards.css'));
const atmosphere = withoutComments(read('_atmosphere.css'));

describe('a geometria do cartão mora na subcamada que cede à classe', () => {
    it('sarak-base.css importa _card-defaults.css em components.sarak-elements, antes de utilities', () => {
        const base = read('sarak-base.css');
        expect(base).toMatch(/@import "\.\/_card-defaults\.css" layer\(components\.sarak-elements\);/);
        expect(base.indexOf('_card-defaults.css')).toBeLessThan(base.indexOf('_theme.css'));
    });

    it('nenhuma declaração de _card-defaults.css é !important (a de baixo venceria a utilitária e o inline)', () => {
        expect(defaults).not.toMatch(/!important/);
    });

    it('o padrão cobre raio, traço, largura da borda, desfoque e transição — e não a cor da superfície', () => {
        const block = bodyOf(defaults, '.sarak-card,\n.bg-theme-card {');
        for (const property of ['border-radius', 'border-style', 'border-top-width', 'backdrop-filter', 'transition']) {
            expect(block, property).toContain(`${property}:`);
        }
        expect(block).not.toMatch(/\bbackground-color:/);
        expect(block).not.toMatch(/\bborder-color:/);
    });

    it('a âncora .card sob escopo e textura recebe a geometria', () => {
        const scoped = bodyOf(defaults, '[data-sx-texture] :is(.card, .sarak-card, .bg-theme-card)');
        expect(defaults).toContain('.sarak-design-scope :is(.card, .sarak-card)');
        for (const property of ['border-radius', 'border-style', 'border-left-width', 'backdrop-filter', 'transition']) {
            expect(scoped, property).toContain(`${property}:`);
        }
    });
});

describe('a superfície do tema chega ao cartão, na camada que cede, sem !important', () => {
    const surface = bodyOf(defaults, '.sarak-card,\n.bg-theme-card,\n.card {');
    const clip = bodyOf(atmosphere, '[data-sx-texture] .card, [data-sx-texture] .sarak-card');

    it('o fundo é background-color (o atalho zerava o background-image) e leva a opacidade da superfície', () => {
        expect(surface).toMatch(/background-color: color-mix\(in srgb, var\(--sarak-card-bg[^;]*--sarak-card-opacity/);
        expect(surface).not.toMatch(/\bbackground:/);
    });

    it('a borda leva a opacidade da borda', () => {
        expect(surface).toMatch(/border-color: color-mix\([^;]*--sarak-card-border-opacity/);
    });

    it('a superfície vale também sem escopo nem textura (cartão sem tema montado e o .card da lib)', () => {
        expect(defaults).toMatch(/\.sarak-card,\n\.bg-theme-card,\n\.card \{\n\s*background-color:/);
    });

    it('o recorte geométrico lê --sarak-card-clip-path e fica na camada final', () => {
        expect(clip).toMatch(/clip-path: var\(--sarak-card-clip-path, none\);/);
        expect(clip).not.toMatch(/background-color:|border-color:/);
    });

    it('nada disso é !important', () => {
        expect(surface).not.toMatch(/!important/);
        expect(clip).not.toMatch(/!important/);
        expect(bodyOf(cards, '.sarak-card, .bg-theme-card')).not.toMatch(/!important/);
    });

    it('_cards.css não escreve mais a cor do fundo, a da borda nem a opacidade do cartão inteiro', () => {
        const block = bodyOf(cards, '.sarak-card, .bg-theme-card');
        expect(block).not.toMatch(/\bbackground-color:/);
        expect(block).not.toMatch(/\bborder-color:/);
        expect(block).not.toMatch(/\bopacity:/);
    });

    it('o fundo ativo do .bg-theme-card cede à classe: mora na camada de baixo, não em _utilities.css', () => {
        expect(bodyOf(defaults, '.bg-theme-card:active')).toContain('background-color: var(--theme-primary-active);');
        expect(bodyOf(withoutComments(read('_utilities.css')), '.bg-theme-card:active')).not.toContain('background-color');
    });
});

describe('sombra declarada e glow-only', () => {
    it('cardShadow declarada vira a sombra do cartão (repouso e hover); none deixa a composta valer', () => {
        expect(cards).toMatch(/\[data-sx-card-shadow\]:not\(\[data-sx-card-shadow="none"\]\) \.sarak-card \{[^}]*--sarak-card-shadow-full:\s*var\(--sarak-card-shadow\)/);
        expect(cards).toMatch(/\[data-sx-card-shadow\]:not\(\[data-sx-card-shadow="none"\]\) \.sarak-card:hover \{[^}]*box-shadow: var\(--sarak-card-shadow-full\)/);
    });

    it('glow-only acende a camada de brilho e acrescenta o halo, sem mover o cartão', () => {
        const hover = bodyOf(cards, '[data-sx-card-hover-style="glow-only"] .sarak-card[data-sx-card-interactive="true"]:hover {');
        expect(hover).toContain('transform: none;');
        expect(hover).toMatch(/box-shadow:[^;]*--sarak-card-shadow-full[^;]*color-mix/);
        expect(bodyOf(cards, '[data-sx-card-hover-style="glow-only"] .sarak-card[data-sx-card-interactive="true"]:hover::before')).toContain('opacity: 1;');
    });

    it('o tema não declara box-shadow morto em .bg-theme-card', () => {
        expect(withoutComments(read('_theme.css'))).not.toMatch(/\.bg-theme-card\s*\{[^}]*box-shadow/);
    });
});

describe('o que saiu da camada final', () => {
    it('_cards.css não escreve mais raio, largura de borda, desfoque nem transição do cartão', () => {
        const block = bodyOf(cards, '.sarak-card, .bg-theme-card');
        for (const property of ['border-radius', 'border-top', 'backdrop-filter', 'transition']) {
            expect(block, property).not.toContain(`${property}:`);
        }
        expect(block).toContain('padding:');
        expect(block).toContain('box-shadow:');
    });

    it('_atmosphere.css não carrega mais o raio do cartão, a transição `all` nem o reset de main/section', () => {
        expect(atmosphere).not.toContain('body:not([data-sx-texture="none"]) main');
        expect(atmosphere).not.toMatch(/(?:main|section|article)[^{}]*\{[^}]*!important/);
        expect(atmosphere).not.toMatch(/border-radius: var\(--sarak-card-radius-tl/);
        expect(atmosphere).not.toMatch(/transition: all 0\.3s ease/);
    });

    it('o reset de main/section/article é padrão (sem !important), na camada que cede', () => {
        const reset = bodyOf(defaults, 'body:not([data-sx-texture="none"]) main');
        expect(reset).toContain('background-color: transparent;');
        expect(reset).toContain('background-image: none;');
        expect(reset).not.toMatch(/!important/);
    });

    it('o !important de aurora-classic saiu: a opacidade lê os tokens de textura', () => {
        expect(atmosphere).not.toMatch(/opacity: 0\.7 !important/);
        expect(atmosphere).toMatch(/aurora-classic[\s\S]*?opacity: var\(--sarak-card-texture-opacity, var\(--sarak-bg-pattern-opacity, var\(--theme-texture-opacity, 0\.1\)\)\);/);
        expect(atmosphere).not.toMatch(/#8b5cf6 0%|#06b6d4 0%/);
    });
});

describe('durações do motor leem os tokens de movimento', () => {
    it('o cartão e o contêiner usam --duration-* (que emite motionDuration*), não segundos literais', () => {
        const transitions = [defaults, bodyOf(cards, '.sarak-card::before')].join('\n');
        // Todo segundo literal está dentro do segundo argumento de `var(--duration-*, <reserva>)`.
        const bare = transitions.replace(/var\(--duration-[a-z]+,\s*[\d.]+s\)/g, '');
        expect(transitions).toMatch(/var\(--duration-/);
        expect(bare).not.toMatch(/\b\d*\.?\d+s\b/);
    });

    it('a camada de textura e os padrões de título, botão e campo também', () => {
        expect(atmosphere).not.toMatch(/transition: opacity 0\.5s/);
        const elements = withoutComments(read('_elements.css'));
        expect(elements).not.toMatch(/transition: all 0\.[24]s/);
    });
});

describe('modo eco: o cartão inteiro perde o desfoque do material', () => {
    it('uma regra de eco mira .sarak-card, .bg-theme-card e .card e vem depois de _surfaces.css', () => {
        const performance = withoutComments(read('_performance.css'));
        expect(performance).toMatch(/:is\(\.sarak-eco-mode, \[data-performance="eco"\], \[data-perf-mode="eco"\]\) :is\(\.sarak-card, \.bg-theme-card, \.card\) \{\s*backdrop-filter: none !important;/);
        const base = read('sarak-base.css');
        expect(base.indexOf('_performance.css')).toBeGreaterThan(base.indexOf('_surfaces.css'));
    });
});
