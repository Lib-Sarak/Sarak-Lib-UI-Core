import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SarakSpotlight, type NavigationItem } from '../SarakSpotlight';

const items: NavigationItem[] = [
    { id: 'home', label: 'Início', keywords: 'dashboard home' },
    { id: 'clients', label: 'Clientes' },
    { id: 'reports', label: 'Relatórios' },
];

describe('Spec 14 — SarakSpotlight (Command Palette)', () => {
    it('está fechado por padrão e abre via atalho global Ctrl/Cmd+K', () => {
        render(<SarakSpotlight items={items} onSelect={() => {}} />);
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
        expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('remove o listener global ao desmontar (registro seguro)', () => {
        const remove = vi.spyOn(window, 'removeEventListener');
        const { unmount } = render(<SarakSpotlight items={items} onSelect={() => {}} />);
        unmount();
        expect(remove).toHaveBeenCalledWith('keydown', expect.any(Function));
    });

    it('filtra os itens conforme a busca', () => {
        render(<SarakSpotlight items={items} open onSelect={() => {}} />);
        fireEvent.change(screen.getByLabelText('Campo de busca'), { target: { value: 'rel' } });
        expect(screen.getByText('Relatórios')).toBeInTheDocument();
        expect(screen.queryByText('Clientes')).not.toBeInTheDocument();
    });

    it('navega com as setas e confirma com Enter', () => {
        const onSelect = vi.fn();
        render(<SarakSpotlight items={items} open onSelect={onSelect} />);
        const input = screen.getByLabelText('Campo de busca');
        fireEvent.keyDown(input, { key: 'ArrowDown' }); // ativo: índice 1 (Clientes)
        fireEvent.keyDown(input, { key: 'Enter' });
        expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'clients' }));
    });

    it('Enter sem mover seleciona o primeiro resultado', () => {
        const onSelect = vi.fn();
        render(<SarakSpotlight items={items} open onSelect={onSelect} />);
        fireEvent.keyDown(screen.getByLabelText('Campo de busca'), { key: 'Enter' });
        expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'home' }));
    });
});
