import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SarakPageTransition } from '../SarakPageTransition';

let mockDesign: Record<string, unknown> = {};
vi.mock('../../../../core/Provider/SarakUIProvider', () => {
    const useSarakUI = () => ({ design: mockDesign });
    return { useSarakUI, useSarakUIOptional: useSarakUI };
});

// O `framer-motion` anima por JavaScript; aqui só interessa QUAL conjunto de variantes o tema escolheu.
vi.mock('framer-motion', () => ({
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    motion: {
        div: ({ variants, children }: { variants?: unknown; children?: React.ReactNode }) => (
            <div data-testid="transition" data-variants={JSON.stringify(variants)}>{children}</div>
        ),
    },
}));

const variantsOf = (): Record<string, Record<string, unknown>> =>
    JSON.parse(screen.getByTestId('transition').getAttribute('data-variants') ?? '{}');

const renderWith = (design: Record<string, unknown>) => {
    mockDesign = design;
    return render(<SarakPageTransition locationKey="/a"><span>conteúdo</span></SarakPageTransition>);
};

describe('SarakPageTransition — `pageTransitionType`, uma opção por vez', () => {
    beforeEach(() => {
        mockDesign = {};
    });

    it('fade: só a opacidade muda', () => {
        renderWith({ pageTransitionType: 'fade' });
        expect(variantsOf().initial).toEqual({ opacity: 0 });
        expect(variantsOf().exit).toEqual({ opacity: 0 });
    });

    it('slide-up: entra de baixo (y positivo) e sai por cima (y negativo)', () => {
        renderWith({ pageTransitionType: 'slide-up' });
        expect(variantsOf().initial).toMatchObject({ opacity: 0, y: 20 });
        expect(variantsOf().exit).toMatchObject({ opacity: 0, y: -20 });
    });

    it('slide-side: entra pela direita e sai pela esquerda', () => {
        renderWith({ pageTransitionType: 'slide-side' });
        expect(variantsOf().initial).toMatchObject({ opacity: 0, x: 50 });
        expect(variantsOf().exit).toMatchObject({ opacity: 0, x: -50 });
    });

    it('zoom: entra menor que o repouso e sai maior', () => {
        renderWith({ pageTransitionType: 'zoom' });
        expect(variantsOf().initial).toMatchObject({ opacity: 0, scale: 0.95 });
        expect(variantsOf().animate).toMatchObject({ opacity: 1, scale: 1 });
        expect(variantsOf().exit).toMatchObject({ opacity: 0, scale: 1.05 });
    });

    it('none: nenhum invólucro animado — o conteúdo renderiza direto', () => {
        renderWith({ pageTransitionType: 'none' });
        expect(screen.queryByTestId('transition')).toBeNull();
        expect(screen.getByText('conteúdo')).toBeInTheDocument();
    });

    it('valor fora da lista cai em fade, o padrão do schema', () => {
        renderWith({ pageTransitionType: 'barrel-roll' });
        expect(variantsOf().initial).toEqual({ opacity: 0 });
    });
});
