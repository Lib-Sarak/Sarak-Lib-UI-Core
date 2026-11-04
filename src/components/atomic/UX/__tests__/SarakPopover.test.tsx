import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SarakPopover } from '../SarakPopover';
import { resetOverlayLayersForTests } from '../../Modals/hooks/useOverlayLayer';

afterEach(() => resetOverlayLayersForTests());

const renderPopover = (props: Partial<React.ComponentProps<typeof SarakPopover>> = {}): ReturnType<typeof render> => render(
    <div>
        <button type="button">fora</button>
        <SarakPopover trigger={<button type="button">Abrir</button>} label="Filtros" {...props}>
            <button type="button">dentro</button>
        </SarakPopover>
    </div>,
);

describe('SarakPopover', () => {
    it('abre pelo gatilho, com aria-expanded e o painel nomeado', () => {
        renderPopover();
        const trigger = screen.getByRole('button', { name: 'Abrir' });
        expect(trigger).toHaveAttribute('aria-expanded', 'false');
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

        fireEvent.click(trigger);

        expect(screen.getByRole('dialog', { name: 'Filtros' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Abrir' })).toHaveAttribute('aria-expanded', 'true');
    });

    it('foca o primeiro controle do painel ao abrir e devolve o foco ao gatilho com Esc', () => {
        renderPopover();
        const trigger = screen.getByRole('button', { name: 'Abrir' });
        trigger.focus();

        fireEvent.click(trigger);
        expect(screen.getByRole('button', { name: 'dentro' })).toHaveFocus();

        fireEvent.keyDown(document, { key: 'Escape' });
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(trigger).toHaveFocus();
    });

    it('prende o Tab dentro do painel', () => {
        renderPopover({ showClose: true });
        fireEvent.click(screen.getByRole('button', { name: 'Abrir' }));
        const last = screen.getByRole('button', { name: 'dentro' });
        last.focus();

        fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Tab' });

        expect(screen.getByRole('button', { name: 'Fechar' })).toHaveFocus();
    });

    it('clique fora fecha, clique dentro não', () => {
        renderPopover();
        fireEvent.click(screen.getByRole('button', { name: 'Abrir' }));

        fireEvent.pointerDown(screen.getByRole('button', { name: 'dentro' }));
        expect(screen.getByRole('dialog')).toBeInTheDocument();

        fireEvent.pointerDown(screen.getByRole('button', { name: 'fora' }));
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('controlado: não guarda estado e avisa cada pedido de troca', () => {
        const onOpenChange = vi.fn();
        renderPopover({ open: false, onOpenChange });

        fireEvent.click(screen.getByRole('button', { name: 'Abrir' }));

        expect(onOpenChange).toHaveBeenCalledWith(true);
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('fica acima de uma camada já aberta na pilha', () => {
        renderPopover({ defaultOpen: true });
        const first = screen.getByRole('dialog');
        render(<SarakPopover trigger={<button type="button">Outro</button>} label="Segundo" defaultOpen>x</SarakPopover>);

        const second = screen.getByRole('dialog', { name: 'Segundo' });

        expect(Number(second.style.zIndex)).toBeGreaterThan(Number(first.style.zIndex));
    });
});
