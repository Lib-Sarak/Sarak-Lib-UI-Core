import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import fs from 'node:fs';
import path from 'node:path';
import { useDesignVariables } from '../../core/Design/hooks/useDesignVariables';
import { sarakGetDefaultDesignState } from '../../core/Design/master-map';
import { SystemSchema } from '../../core/Design/schema/system';
import { AtmosphereSchema } from '../../core/Design/schema/atmosphere';
import { ButtonsSchema } from '../../core/Design/schema/buttons';

/**
 * Lê o TEXTO dos parciais de CSS: que o navegador pinta o grão, a malha e a vinheta é prova de
 * `browser-tests/` — `jsdom` não avalia `color-mix`, `clamp()` nem animação.
 */
const STYLES = path.join(process.cwd(), 'src/styles');
const read = (name: string): string =>
    fs.readFileSync(path.join(STYLES, name), 'utf-8').replace(/\/\*[\s\S]*?\*\//g, '');

const tokenOf = (schema: { tokens: Array<{ id: string; defaultValue?: unknown }> }, id: string) =>
    schema.tokens.find((token) => token.id === id);

describe('colorBgLayer2 — a terceira mancha da malha lê a camada 2', () => {
    it('a mancha de 82% 92% usa --sarak-bg-layer-2', () => {
        expect(read('_background.css')).toMatch(/at 82% 92%, color-mix\(in srgb, var\(--sarak-bg-layer-2,/);
    });

    it('o padrão do token é a primária: a malha de hoje não muda', () => {
        expect(tokenOf(AtmosphereSchema, 'colorBgLayer2')?.defaultValue).toBe('var(--sarak-primary-color, #3b82f6)');
    });
});

describe('vignetteSoftness — governa a parada transparente da vinheta', () => {
    it('as duas vinhetas de _atmosphere.css e a de _theme.css leem o token', () => {
        const atmosphere = read('_atmosphere.css');
        expect(atmosphere.match(/transparent clamp\(0%, calc\(100% - var\(--sarak-vignette-softness, 50\) \* 1\.6%\), 95%\)/g)).toHaveLength(2);
        expect(read('_theme.css')).toMatch(/transparent clamp\(0%, calc\(100% - var\(--sarak-vignette-softness, 50\) \* 1%\), 95%\)/);
    });

    it('com o padrão (50) as paradas são as de sempre: 20% e 50%', () => {
        expect(100 - 50 * 1.6).toBeCloseTo(20);
        expect(100 - 50 * 1).toBe(50);
        expect(tokenOf(AtmosphereSchema, 'vignetteSoftness')?.defaultValue).toBe(50);
    });
});

describe('bgNoiseAnimation — grão animado, parado por padrão', () => {
    it('a textura noise anima com a duração do token, em passos', () => {
        expect(read('_atmosphere.css')).toMatch(
            /\[data-sx-texture="noise"\]::before \{[^}]*animation: sarak-noise-shift var\(--sarak-noise-speed, 0s\) steps\(1, end\) infinite;/
        );
    });

    it('os quadros mexem só em background-position (não repinta o layout)', () => {
        const frames = read('_animations.css').match(/@keyframes sarak-noise-shift \{[\s\S]*?\n\}/)?.[0] ?? '';
        expect(frames).toContain('background-position');
        expect(frames).not.toMatch(/\b(width|height|top|left|margin|padding)\s*:/);
    });

    it('o padrão do token é 0: estático, como era', () => {
        expect(tokenOf(AtmosphereSchema, 'bgNoiseAnimation')?.defaultValue).toBe(0);
    });

    it('o modo eco corta a animação do pseudoelemento; movimento reduzido já a zera', () => {
        expect(read('_performance.css')).toMatch(/\[data-perf-mode="eco"\] \[data-sx-texture="noise"\]::before[\s\S]*animation: none/);
        expect(read('_motion.css')).toContain('animation-duration: 0.01ms !important');
    });
});

describe('textSmoothing — uma regra por valor, no atributo que o motor emite', () => {
    it('ligado = antialiased/grayscale; desligado = auto', () => {
        const elements = read('_elements.css');
        expect(elements).toMatch(/\[data-sx-text-smoothing="true"\] \{\s*-webkit-font-smoothing: antialiased;\s*-moz-osx-font-smoothing: grayscale;/);
        expect(elements).toMatch(/\[data-sx-text-smoothing="false"\] \{\s*-webkit-font-smoothing: auto;\s*-moz-osx-font-smoothing: auto;/);
    });

    it('o motor emite o atributo com o valor do token', () => {
        const state = sarakGetDefaultDesignState();
        for (const value of [true, false]) {
            const { result } = renderHook(() => useDesignVariables({ ...state, textSmoothing: value }));
            expect(result.current.attributes['data-sx-text-smoothing']).toBe(String(value));
        }
    });
});

describe('btnNeonPulseSpeed — o pulso do neon', () => {
    it('a classe de pulso anima com a duração do token e cede no hover', () => {
        const css = read('_animations.css');
        expect(css).toMatch(/\.sarak-btn-neon-pulse \{\s*animation: sarak-btn-neon-pulse var\(--sarak-btn-neon-pulse-speed, 1\.5s\)/);
        expect(css).toMatch(/\.sarak-btn-neon-pulse:hover \{\s*animation: none;/);
    });

    it('o padrão do token é 0 (parado) e o intervalo aceita 0', () => {
        const token = ButtonsSchema.tokens.find((item) => item.id === 'btnNeonPulseSpeed');
        expect(token?.defaultValue).toBe(0);
        expect(token?.constraints?.min).toBe(0);
    });
});

describe('borderStyle — o valor de cada opção chega ao border-style declarado', () => {
    const options = (SystemSchema.tokens.find((token) => token.id === 'borderStyle')?.options ?? [])
        .map((option) => String(option.value));

    it('o schema oferece as quatro opções', () => {
        expect(options).toEqual(['solid', 'dashed', 'dotted', 'none']);
    });

    it.each(['solid', 'dashed', 'dotted', 'none'])('a opção %s é emitida em --border-style e --sarak-border-style', (value) => {
        const { result } = renderHook(() => useDesignVariables({ ...sarakGetDefaultDesignState(), borderStyle: value }));
        expect(result.current.variables['--border-style']).toBe(value);
        expect(result.current.variables['--sarak-border-style']).toBe(value);
        expect(result.current.attributes['data-sx-border-style']).toBe(value);
    });

    it('MUTAÇÃO: o cartão sob a moldura sólida e sob o escopo de design obedece borderStyle, não "solid" fixo', () => {
        const surfaces = read('_surfaces.css');
        const solidFrame = surfaces.slice(surfaces.indexOf('[data-sx-border-type="solid"]'));
        expect(solidFrame.slice(0, solidFrame.indexOf('}'))).toContain('border-style: var(--border-style, solid) !important;');
        expect(read('_card-defaults.css')).toMatch(/border-style: var\(--border-style, solid\);/);
        expect(read('_atmosphere.css')).toMatch(/border-color: color-mix\(in srgb, var\(--sarak-card-border-color/);
    });

    it('os três caminhos de borda declaram border-style a partir de --border-style', () => {
        expect(read('_elements.css')).toMatch(/\[class\*="border"\] \{ border-style: var\(--border-style, solid\);/);
        expect(read('_utilities.css')).toMatch(/\.border-theme \{[^}]*border-style: var\(--border-style, solid\) !important;/);
        expect(read('_utilities.css')).toMatch(/\.border-t-theme \{ border-top: [^;]*var\(--border-style, solid\)/);
    });
});
