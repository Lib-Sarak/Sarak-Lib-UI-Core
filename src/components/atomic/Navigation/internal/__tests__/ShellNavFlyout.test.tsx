import React, { useRef } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ShellNavFlyout } from '../ShellNavFlyout';

const Harness: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const anchorRef = useRef<HTMLDivElement>(null);
    return (
        <>
            <div ref={anchorRef}><button type="button">gatilho</button></div>
            <ShellNavFlyout id="fly" label="Vendas" anchorRef={anchorRef} placement="side" onClose={onClose}>
                <a href="/a">Primeiro</a>
                <a href="/b">Segundo</a>
            </ShellNavFlyout>
            <button type="button">fora</button>
        </>
    );
};

describe('ShellNavFlyout', () => {
    it('renderiza no body (fora do contêiner da barra), nomeado pelo grupo, e põe o foco no primeiro item', () => {
        const { container } = render(<Harness onClose={vi.fn()} />);
        const flyout = screen.getByRole('group', { name: 'Vendas' });
        expect(container.contains(flyout)).toBe(false);
        expect(document.body.contains(flyout)).toBe(true);
        expect(screen.getByRole('link', { name: 'Primeiro' })).toHaveFocus();
    });

    it('as setas movem o foco entre os itens, em círculo', () => {
        render(<Harness onClose={vi.fn()} />);
        const flyout = screen.getByRole('group', { name: 'Vendas' });
        fireEvent.keyDown(flyout, { key: 'ArrowDown' });
        expect(screen.getByRole('link', { name: 'Segundo' })).toHaveFocus();
        fireEvent.keyDown(flyout, { key: 'ArrowDown' });
        expect(screen.getByRole('link', { name: 'Primeiro' })).toHaveFocus();
        fireEvent.keyDown(flyout, { key: 'ArrowUp' });
        expect(screen.getByRole('link', { name: 'Segundo' })).toHaveFocus();
    });

    it('Esc fecha e devolve o foco ao gatilho', () => {
        const onClose = vi.fn();
        render(<Harness onClose={onClose} />);
        fireEvent.keyDown(screen.getByRole('group', { name: 'Vendas' }), { key: 'Escape' });
        expect(onClose).toHaveBeenCalledTimes(1);
        expect(screen.getByRole('button', { name: 'gatilho' })).toHaveFocus();
    });

    it('Tab fecha e devolve o foco ao gatilho em vez de seguir a ordem do portal', () => {
        const onClose = vi.fn();
        render(<Harness onClose={onClose} />);
        fireEvent.keyDown(screen.getByRole('group', { name: 'Vendas' }), { key: 'Tab' });
        expect(onClose).toHaveBeenCalledTimes(1);
        expect(screen.getByRole('button', { name: 'gatilho' })).toHaveFocus();
    });

    it('clicar fora fecha; clicar dentro ou no gatilho não', () => {
        const onClose = vi.fn();
        render(<Harness onClose={onClose} />);
        fireEvent.mouseDown(screen.getByRole('link', { name: 'Segundo' }));
        fireEvent.mouseDown(screen.getByRole('button', { name: 'gatilho' }));
        expect(onClose).not.toHaveBeenCalled();
        fireEvent.mouseDown(screen.getByRole('button', { name: 'fora' }));
        expect(onClose).toHaveBeenCalledTimes(1);
    });
});
