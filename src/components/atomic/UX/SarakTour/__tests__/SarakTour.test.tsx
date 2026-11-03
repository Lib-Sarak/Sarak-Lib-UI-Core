import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { SarakTour, type SarakTourStep } from '../SarakTour';
import { placeTourCard } from '../tourPlacement';
import { resetOverlayLayersForTests } from '../../../Modals/hooks/useOverlayLayer';

const STEPS: SarakTourStep[] = [
    { id: 'one', target: '#alvo-um', title: 'Primeiro', content: 'texto um' },
    { id: 'two', target: '#alvo-que-nao-existe', title: 'Segundo', content: 'texto dois' },
    { id: 'three', title: 'Terceiro', content: 'texto três' },
];

function Page({ open = true, onClose = vi.fn(), onStepChange }: { open?: boolean; onClose?: (reason: 'done' | 'skip' | 'escape') => void; onStepChange?: (step: number) => void }) {
    return (
        <>
            <button id="alvo-um">alvo</button>
            <SarakTour steps={STEPS} open={open} onClose={onClose} onStepChange={onStepChange} />
        </>
    );
}

afterEach(() => resetOverlayLayersForTests());

describe('SarakTour', () => {
    it('fechado não desenha nada', () => {
        render(<Page open={false} />);
        expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('abre no primeiro passo, com "Passo 1 de 3", destaque no alvo e foco dentro do diálogo', () => {
        render(<Page />);
        const dialog = screen.getByRole('dialog', { name: 'Primeiro' });
        expect(screen.getByText('Passo 1 de 3')).toBeTruthy();
        expect(document.querySelector('[data-sarak-tour-highlight="true"]')).not.toBeNull();
        expect(dialog.contains(document.activeElement)).toBe(true);
    });

    it('próximo e voltar andam os passos e avisam o consumidor; no primeiro, voltar fica desligado', () => {
        const onStepChange = vi.fn();
        render(<Page onStepChange={onStepChange} />);
        expect((screen.getByRole('button', { name: 'Voltar' }) as HTMLButtonElement).disabled).toBe(true);
        fireEvent.click(screen.getByRole('button', { name: 'Próximo' }));
        expect(screen.getByRole('dialog', { name: 'Segundo' })).toBeTruthy();
        expect(onStepChange).toHaveBeenLastCalledWith(1);
        fireEvent.click(screen.getByRole('button', { name: 'Voltar' }));
        expect(screen.getByRole('dialog', { name: 'Primeiro' })).toBeTruthy();
    });

    it('alvo que não existe na tela mostra o cartão sem destaque', () => {
        render(<Page />);
        fireEvent.click(screen.getByRole('button', { name: 'Próximo' }));
        expect(document.querySelector('[data-sarak-tour-highlight="true"]')).toBeNull();
        expect(screen.getByRole('dialog', { name: 'Segundo' })).toBeTruthy();
    });

    it('no último passo o botão é "Concluir" e fecha com done', () => {
        const onClose = vi.fn();
        render(<Page onClose={onClose} />);
        fireEvent.click(screen.getByRole('button', { name: 'Próximo' }));
        fireEvent.click(screen.getByRole('button', { name: 'Próximo' }));
        fireEvent.click(screen.getByRole('button', { name: 'Concluir' }));
        expect(onClose).toHaveBeenCalledWith('done');
    });

    it('Pular fecha com skip e Esc fecha com escape', () => {
        const onClose = vi.fn();
        render(<Page onClose={onClose} />);
        fireEvent.click(screen.getByRole('button', { name: 'Pular' }));
        expect(onClose).toHaveBeenLastCalledWith('skip');
        fireEvent.keyDown(document, { key: 'Escape' });
        expect(onClose).toHaveBeenLastCalledWith('escape');
    });

    it('o Tab fica preso no cartão: do último botão volta ao primeiro', () => {
        render(<Page />);
        const dialog = screen.getByRole('dialog');
        const buttons = dialog.querySelectorAll('button:not([disabled])');
        const last = buttons[buttons.length - 1] as HTMLElement;
        last.focus();
        fireEvent.keyDown(dialog, { key: 'Tab' });
        expect(document.activeElement).toBe(buttons[0]);
    });

    it('ao fechar, o foco volta ao elemento que o tinha', () => {
        const { rerender } = render(<><button id="gatilho">abrir</button><SarakTour steps={STEPS} open={false} onClose={vi.fn()} /></>);
        (document.getElementById('gatilho') as HTMLElement).focus();
        rerender(<><button id="gatilho">abrir</button><SarakTour steps={STEPS} open onClose={vi.fn()} /></>);
        rerender(<><button id="gatilho">abrir</button><SarakTour steps={STEPS} open={false} onClose={vi.fn()} /></>);
        expect(document.activeElement).toBe(document.getElementById('gatilho'));
    });
});

describe('placeTourCard', () => {
    const container = { top: 0, left: 0, width: 400, height: 600 };
    const card = { width: 300, height: 120 };

    it('prefere abaixo do alvo', () => {
        const placed = placeTourCard({ top: 100, left: 100, width: 80, height: 30 }, card, container);
        expect(placed.top).toBe(100 + 30 + 12);
    });

    it('sem espaço abaixo, vai para cima; sem espaço nenhum, para o meio', () => {
        expect(placeTourCard({ top: 540, left: 100, width: 80, height: 30 }, card, container).top).toBe(540 - 120 - 12);
        const tight = { top: 0, left: 0, width: 400, height: 200 };
        expect(placeTourCard({ top: 60, left: 100, width: 80, height: 30 }, card, tight).top).toBe((200 - 120) / 2);
    });

    it('nunca sai do contêiner pelos lados, mesmo estreito', () => {
        const left = placeTourCard({ top: 100, left: 0, width: 10, height: 10 }, card, container);
        expect(left.left).toBeGreaterThanOrEqual(12);
        const right = placeTourCard({ top: 100, left: 390, width: 10, height: 10 }, card, container);
        expect(right.left + card.width).toBeLessThanOrEqual(400 - 12);
        const narrow = placeTourCard({ top: 100, left: 20, width: 10, height: 10 }, card, { top: 0, left: 0, width: 200, height: 600 });
        expect(narrow.left).toBe(12);
    });

    it('sem alvo centraliza', () => {
        expect(placeTourCard(null, card, container)).toEqual({ top: 240, left: 50 });
    });
});
