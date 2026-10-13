// @vitest-environment node
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { AnimationSchema } from '../../core/Design/schema/animations';

/**
 * Lê o TEXTO de `_cards.css` e as opções do schema: que o navegador computa o `transform`, o
 * `opacity` do brilho e as cores é prova de `browser-tests/` (o jsdom não avalia `var()`).
 */
const cards = fs
    .readFileSync(path.join(process.cwd(), 'src/styles/_cards.css'), 'utf-8')
    .replace(/\/\*[\s\S]*?\*\//g, '');

const hoverStyleOptions = (): string[] => {
    const token = AnimationSchema.tokens.find((t) => t.id === 'cardHoverStyle');
    return (token?.constraints?.options ?? token?.options ?? []).map((option) => String(option.value));
};

const rule = (selector: string): string => {
    const start = cards.indexOf(selector);
    return start < 0 ? '' : cards.slice(start, cards.indexOf('}', start));
};

describe('cardHoverStyle — uma regra por opção, no atributo que o motor emite', () => {
    it('o schema oferece lift, glow-only e expand (3d-tilt não tem leitor e saiu)', () => {
        expect(hoverStyleOptions()).toEqual(['lift', 'glow-only', 'expand']);
    });

    it.each(['lift', 'glow-only', 'expand'])('a opção %s tem regra [data-sx-card-hover-style] no hover do cartão', (value) => {
        expect(cards).toContain(`[data-sx-card-hover-style="${value}"] .sarak-card[data-sx-card-interactive="true"]:hover`);
    });

    it('lift sobe cardHoverTranslate (--sarak-card-hover-y)', () => {
        expect(rule('[data-sx-card-hover-style="lift"] .sarak-card[data-sx-card-interactive="true"]:hover')).toMatch(/translateY\(var\(--sarak-card-hover-y/);
    });

    it('glow-only não move o cartão', () => {
        expect(rule('[data-sx-card-hover-style="glow-only"] .sarak-card[data-sx-card-interactive="true"]:hover')).toMatch(/transform:\s*none/);
    });

    it('movimento reduzido e modo eco desligam o deslocamento do hover', () => {
        expect(cards).toMatch(/prefers-reduced-motion:\s*reduce\)\s*\{\s*\[data-sx-card-hover-style\] \.sarak-card\[data-sx-card-interactive="true"\]:hover\s*\{\s*transform:\s*none/);
        expect(cards).toMatch(/\.sarak-eco-mode \.sarak-card:hover\s*\{\s*transform:\s*none/);
    });
});

describe('cardHoverGlowIncrease — soma ao brilho base no hover', () => {
    it('o ::before do hover lê intensidade + aumento', () => {
        const body = rule('.sarak-card[data-sx-card-interactive="true"]:hover::before');
        expect(body).toContain('--sarak-card-glow-intensity');
        expect(body).toContain('--sarak-card-hover-glow');
    });
});

describe('botão de ação e campo de busca do cartão', () => {
    it('o botão de ação lê fundo, texto, hover, raio e padding', () => {
        const css = rule('.sarak-card-action-btn {') + rule('.sarak-card-action-btn--filled {') + rule('.sarak-card-action-btn--filled:hover');
        for (const variable of [
            '--sarak-card-action-btn-bg', '--sarak-card-action-btn-text', '--sarak-card-action-btn-hover-bg',
            '--sarak-card-action-btn-radius', '--sarak-card-action-btn-padding',
        ]) {
            expect(css).toContain(variable);
        }
    });

    it('placeholder, fundo e texto focados valem só dentro do cartão de busca', () => {
        expect(rule('.sarak-search-card input::placeholder')).toContain('--sarak-card-search-placeholder');
        const focus = rule('.sarak-search-card input:focus');
        expect(focus).toContain('--sarak-card-search-bg-focus');
        expect(focus).toContain('--sarak-card-search-text-focus');
    });
});

describe('cartão interativo — só ele se move ou brilha no hover', () => {
    it('toda regra de hover de movimento e de brilho exige data-sx-card-interactive', () => {
        const hoverRules = cards.match(/[^{}]*\.sarak-card[^{}]*:hover[^{}]*\{[^}]*\}/g) ?? [];
        const moving = hoverRules.filter((block) => /transform:|::before/.test(block) && !/none !important/.test(block));
        expect(moving.length).toBeGreaterThanOrEqual(4);
        for (const block of moving) {
            // A borda e a sombra do hover genérico (`.sarak-card:hover { border-color… }`) não são movimento.
            if (/border-color|box-shadow/.test(block) && !/transform:|opacity:/.test(block)) continue;
            expect(block).toContain('data-sx-card-interactive="true"');
        }
    });

    it('nenhuma regra de hover de movimento alcança o .sarak-card genérico', () => {
        expect(cards).not.toMatch(/\[data-sx-card-hover-style="(lift|expand|glow-only)"\] \.sarak-card:hover/);
    });
});

describe('campo do cartão de busca — vence a classe utilitária do próprio campo', () => {
    it('fundo, texto e placeholder focados são !important (o SarakInput os escreve por classe de utilitária)', () => {
        const focus = rule('.sarak-search-card input:focus');
        expect(focus).toMatch(/background-color:[^;]*!important/);
        expect(focus).toMatch(/\bcolor:[^;]*!important/);
        expect(rule('.sarak-search-card input::placeholder')).toMatch(/color:[^;]*!important/);
    });
});
