import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SarakModal } from '../SarakModal';
import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';

const renderModal = (ui: React.ReactElement) =>
    render(<SarakUIProvider>{ui}</SarakUIProvider>);

describe('Spec 13 — SarakModal (Regra 2 + Plano de Testes)', () => {
    it('deve fechar ao pressionar ESC', () => {
        const onClose = vi.fn();
        renderModal(
            <SarakModal isOpen onClose={onClose} title="Confirmar">
                <button>Ação</button>
            </SarakModal>,
        );
        fireEvent.keyDown(document, { key: 'Escape' });
        expect(onClose).toHaveBeenCalled();
    });

    it('deve fechar ao clicar no overlay (e não quando desabilitado)', () => {
        const onClose = vi.fn();
        const { rerender } = renderModal(
            <SarakModal isOpen onClose={onClose} title="X" hideCloseButton>
                <span>corpo</span>
            </SarakModal>,
        );
        fireEvent.click(document.querySelector('[aria-hidden="true"]') as Element);
        expect(onClose).toHaveBeenCalledTimes(1);

        rerender(
            <SarakUIProvider>
                <SarakModal isOpen onClose={onClose} title="X" hideCloseButton disableOverlayClick>
                    <span>corpo</span>
                </SarakModal>
            </SarakUIProvider>,
        );
        fireEvent.click(document.querySelector('[aria-hidden="true"]') as Element);
        expect(onClose).toHaveBeenCalledTimes(1); // não incrementou
    });

    it('deve manter o foco preso dentro do dialog (focus trap)', () => {
        renderModal(
            <SarakModal isOpen onClose={() => undefined} title="Wizard" hideCloseButton>
                <button>primeiro</button>
                <button>ultimo</button>
            </SarakModal>,
        );
        const dialog = screen.getByRole('dialog');
        const buttons = within(dialog).getAllByRole('button');
        const last = buttons[buttons.length - 1];
        last.focus();
        expect(document.activeElement).toBe(last);
        // Tab no último volta ao primeiro (ciclo).
        fireEvent.keyDown(dialog, { key: 'Tab' });
        expect(document.activeElement).toBe(buttons[0]);
    });

    it('deve navegar passos do sub-wizard (multi-step)', () => {
        const onComplete = vi.fn();
        renderModal(
            <SarakModal
                isOpen
                onClose={() => undefined}
                title="Setup"
                hideCloseButton
                steps={[<div key="a">Passo A</div>, <div key="b">Passo B</div>]}
                onComplete={onComplete}
            >
                {null}
            </SarakModal>,
        );
        expect(screen.getByText('Passo A')).toBeInTheDocument();
        expect(screen.getByText('1 / 2')).toBeInTheDocument();

        fireEvent.click(screen.getByText('Avançar'));
        expect(screen.getByText('Passo B')).toBeInTheDocument();

        fireEvent.click(screen.getByText('Concluir'));
        expect(onComplete).toHaveBeenCalled();
    });
});
