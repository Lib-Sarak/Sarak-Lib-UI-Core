// @vitest-environment node
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { EngineeringSchema } from '../../core/Design/schema/engineering';
import mapping from '../../core/Design/catalog/theme_table_mapping.json';
import partition from '../../core/Design/catalog/partitions/specialized_engines.json';

/**
 * O que este teste prova, e o que não: ele lê o TEXTO dos parciais de CSS e o dicionário do token. Que a regra
 * vence a classe, que o alvo mede 44 px e que o campo computa 16 px é prova de navegador real
 * (`browser-tests/toque-no-celular.spec.ts`) — `jsdom` não avalia `@media (pointer: coarse)`.
 */
const readStyle = (name: string): string =>
    fs.readFileSync(path.join(process.cwd(), 'src/styles', name), 'utf-8');

const touch = readStyle('_touch.css');
const motion = readStyle('_motion.css');
const base = readStyle('sarak-base.css');
const token = EngineeringSchema.tokens.find((item) => item.id === 'touchTargetMin');

/** O bloco `@media (...)` — o texto entre as chaves do at-rule, contando o aninhamento. */
const mediaBlock = (css: string, query: string): string => {
    const start = css.indexOf(`@media ${query} {`);
    expect(start).toBeGreaterThan(-1);
    const open = css.indexOf('{', start);
    let depth = 0;
    for (let index = open; index < css.length; index += 1) {
        if (css[index] === '{') depth += 1;
        if (css[index] === '}') depth -= 1;
        if (depth === 0) return css.slice(open + 1, index);
    }
    throw new Error(`bloco @media ${query} sem fechamento`);
};

describe('token touchTargetMin — paridade e default', () => {
    it('existe no schema com 44px de padrão, faixa 24–64 e a variável --sarak-touch-target-min', () => {
        expect(token?.defaultValue).toBe(44);
        expect(token?.constraints).toEqual({ min: 24, max: 64 });
        expect(token?.unit).toBe('px');
        expect(token?.cssVars).toContain('--sarak-touch-target-min');
    });

    it('está no roteamento e na partição da mesma coluna', () => {
        expect(mapping.specialized_engines).toContain('touchTargetMin');
        const entry = partition.find((item) => item.tokenId === 'touchTargetMin');
        expect(entry?.databaseColumn).toBe('specialized_engines');
        expect(entry?.cssVariables).toContain('--sarak-touch-target-min');
    });
});

describe('_touch.css — alvo de toque e piso de fonte do campo', () => {
    it('importa na subcamada de elemento, onde a classe vence o padrão', () => {
        expect(base).toMatch(/@import "\.\/_touch\.css" layer\(components\.sarak-elements\)/);
    });

    it('a variável ativa vale 0px por padrão e o token só com ponteiro de dedo', () => {
        const outside = touch.slice(0, touch.indexOf('@media (pointer: coarse) {'));
        expect(outside).toMatch(/--sarak-touch-target-active:\s*0px/);
        const coarse = mediaBlock(touch, '(pointer: coarse)');
        expect(coarse).toMatch(/--sarak-touch-target-active:\s*var\(--sarak-touch-target-min,\s*44px\)/);
    });

    it('os acionáveis ganham altura e largura mínimas lendo o token, só dentro de pointer: coarse', () => {
        const coarse = mediaBlock(touch, '(pointer: coarse)');
        expect(coarse).toMatch(/button,[\s\S]*\[role="menuitem"\][\s\S]*\{\s*min-height:\s*var\(--sarak-touch-target-min,\s*44px\);\s*min-width:\s*var\(--sarak-touch-target-min,\s*44px\);/);
        // Fora do bloco do ponteiro de dedo nenhuma regra mexe em altura ou largura mínima.
        const outside = touch.replace(coarse, '').replace(/\/\*[\s\S]*?\*\//g, '');
        expect(outside).not.toMatch(/min-(height|width):/);
    });

    it('input, select e textarea nunca ficam abaixo de 16px, sem encolher a fonte maior herdada', () => {
        const coarse = mediaBlock(touch, '(pointer: coarse)');
        expect(coarse).toMatch(/input,\s*select,\s*textarea\s*\{\s*font-size:\s*max\(16px,\s*1em\);/);
    });
});

describe('_motion.css — reducedMotion e prefers-reduced-motion', () => {
    it('importa na camada final, onde o !important ainda vence o estilo inline', () => {
        expect(base).toMatch(/@import "\.\/_motion\.css" layer\(sarak-lib\)/);
    });

    it('o atributo do token e a preferência do sistema reduzem transição e animação', () => {
        expect(motion).toMatch(/:root\[data-sx-reduced-motion="true"\] \*/);
        const preference = mediaBlock(motion, '(prefers-reduced-motion: reduce)');
        for (const css of [motion.slice(0, motion.indexOf('@media (prefers-reduced-motion: reduce) {')), preference]) {
            expect(css).toMatch(/animation-duration:\s*0\.01ms !important/);
            expect(css).toMatch(/transition-duration:\s*0\.01ms !important/);
            expect(css).toMatch(/animation-iteration-count:\s*1 !important/);
        }
    });

    it('o token reducedMotion segue boolean, e é isso que o motor entrega como data-sx-reduced-motion', () => {
        expect(EngineeringSchema.tokens.find((item) => item.id === 'reducedMotion')?.type).toBe('boolean');
    });
});

describe('movimento reduzido — alcança o pseudoelemento do próprio :root', () => {
    it('as duas portas (token e preferência do SO) listam :root::before e :root::after', () => {
        // O grão de ruído é `html[data-sx-texture="noise"]::before`: `:root *` só chega aos descendentes.
        const tokenDoor = motion.slice(motion.indexOf(':root[data-sx-reduced-motion="true"]'), motion.indexOf('@media'));
        expect(tokenDoor).toContain(':root[data-sx-reduced-motion="true"]::before');
        expect(tokenDoor).toContain(':root[data-sx-reduced-motion="true"]::after');
        const mediaDoor = motion.slice(motion.indexOf('@media (prefers-reduced-motion: reduce)'));
        expect(mediaDoor).toContain(':root::before');
        expect(mediaDoor).toContain(':root::after');
    });
});
