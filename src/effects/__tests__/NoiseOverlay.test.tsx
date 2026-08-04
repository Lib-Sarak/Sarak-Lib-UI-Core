import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { NoiseOverlay } from '../NoiseOverlay';

/**
 * Cobertura 1:1 de `NoiseOverlay` (R8) — plan-07, item 7.
 *
 * `src/effects/` está FORA do escopo do `auditor_coverage` (`:52-54`), então este
 * componente `.tsx` atravessou sem teste com o gate verde. Foi um dos dois achados
 * NOVOS da `plan-06` (vão nº 6).
 */
describe('NoiseOverlay', () => {
    const montar = () => render(<NoiseOverlay />).container.firstElementChild as HTMLElement;

    it('é uma camada decorativa que NÃO intercepta clique', () => {
        expect(montar().className).toContain('pointer-events-none');
    });

    it('cobre a viewport inteira, acima do conteúdo', () => {
        const classe = montar().className;

        expect(classe).toContain('fixed');
        expect(classe).toContain('inset-0');
        expect(classe).toContain('z-[9999]');
    });

    it('a opacidade vem do token, com fallback 0 — invisível até o tema pedir', () => {
        expect(montar().className).toContain('opacity-[var(--sarak-noise-opacity,0)]');
    });

    it('a textura é um SVG inline: nenhuma requisição de rede', () => {
        const { backgroundImage } = montar().style;

        // A URL é `data:`, não remota. O `http` que existe lá dentro é o xmlns do SVG
        // (`http://www.w3.org/2000/svg`), que é identificador de namespace — não é busca.
        expect(backgroundImage).toMatch(/^url\("data:image\/svg\+xml,/);
        expect(backgroundImage.replace('http://www.w3.org/2000/svg', '')).not.toMatch(/https?:\/\//);
    });

    it('usa mistura overlay e repete a textura em ladrilho', () => {
        const estilo = montar().style;

        expect(estilo.mixBlendMode).toBe('overlay');
        expect(estilo.backgroundRepeat).toBe('repeat');
        expect(estilo.backgroundSize).toBe('200px 200px');
    });

    it('não renderiza filho nenhum', () => {
        expect(montar().children.length).toBe(0);
    });
});
