import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ShellNavEntry } from '../ShellNavEntry';

describe('ShellNavEntry', () => {
    it('desenha o item como link com a rota, o selo e o destaque do ativo', () => {
        render(<ShellNavEntry item={{ label: 'Pedidos', route: '/pedidos', badge: 3 }} isActive horizontal={false} collapsed={false} />);
        const link = screen.getByRole('link', { name: 'Pedidos 3' });
        expect(link).toHaveAttribute('href', '/pedidos');
        expect(link).toHaveAttribute('aria-current', 'page');
    });

    it('delega a navegação ao host em clique simples', () => {
        const onSelect = vi.fn();
        render(<ShellNavEntry item={{ label: 'Pedidos', route: '/pedidos' }} isActive={false} horizontal={false} collapsed={false} onSelect={onSelect} />);
        fireEvent.click(screen.getByRole('link', { name: 'Pedidos' }));
        expect(onSelect).toHaveBeenCalledWith('/pedidos');
    });

    it('só o filho de um grupo ganha recuo; o item comum não leva estilo inline de recuo', () => {
        const { rerender } = render(<ShellNavEntry item={{ label: 'Pedidos', route: '/pedidos' }} isActive={false} horizontal={false} collapsed={false} />);
        expect(screen.getByRole('link').style.paddingInlineStart).toBe('');
        rerender(<ShellNavEntry item={{ label: 'Pedidos', route: '/pedidos' }} isActive={false} horizontal={false} collapsed={false} nested />);
        expect(screen.getByRole('link').style.paddingInlineStart).toContain('--sarak-layout-gap-md');
    });

    it('recolhido, o nome acessível continua sendo o rótulo', () => {
        render(<ShellNavEntry item={{ label: 'Pedidos', route: '/pedidos' }} isActive={false} horizontal={false} collapsed />);
        expect(screen.getByRole('link', { name: 'Pedidos' })).toBeInTheDocument();
    });
});
