import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { SarakShellNavItem } from '../../SarakShellNav';
import { ShellNavGroup } from '../ShellNavGroup';

const VENDAS: SarakShellNavItem = {
    label: 'Vendas',
    route: '/vendas',
    badge: 2,
    children: [{ label: 'Pedidos', route: '/vendas/pedidos', badge: 5 }, { label: 'Clientes', route: '/vendas/clientes' }],
};

const renderGroup = (props: Partial<React.ComponentProps<typeof ShellNavGroup>> = {}) => render(
    <ShellNavGroup item={VENDAS} horizontal={false} collapsed={false} expanded={false} onToggle={vi.fn()} {...props} />,
);

describe('ShellNavGroup — lateral aberta (filhos na própria barra)', () => {
    it('o pai é um botão que declara aria-expanded e aria-controls apontando o painel dos filhos', () => {
        renderGroup();
        const trigger = screen.getByRole('button', { name: 'Vendas 2' });
        expect(trigger).toHaveAttribute('aria-expanded', 'false');
        const panel = document.getElementById(trigger.getAttribute('aria-controls') as string);
        expect(panel).not.toBeNull();
        expect(panel).toHaveAttribute('data-state', 'closed');
    });

    it('fechado, os filhos ficam invisíveis; aberto, aparecem', () => {
        const { rerender } = renderGroup();
        expect(screen.getByText('Pedidos')).not.toBeVisible();
        expect(screen.queryByRole('link', { name: 'Pedidos 5' })).toBeNull();
        rerender(<ShellNavGroup item={VENDAS} horizontal={false} collapsed={false} expanded onToggle={vi.fn()} />);
        expect(screen.getByRole('button', { name: 'Vendas 2' })).toHaveAttribute('aria-expanded', 'true');
        expect(screen.getByRole('link', { name: 'Pedidos 5' })).toBeVisible();
    });

    it('clique no pai pede a alternância e nunca navega', () => {
        const onToggle = vi.fn();
        const onSelect = vi.fn();
        renderGroup({ onToggle, onSelect });
        fireEvent.click(screen.getByRole('button', { name: 'Vendas 2' }));
        expect(onToggle).toHaveBeenCalledWith(VENDAS);
        expect(onSelect).not.toHaveBeenCalled();
    });

    it('mostra selo no pai e nos filhos e marca o filho ativo', () => {
        renderGroup({ expanded: true, activeRoute: '/vendas/clientes' });
        expect(screen.getByRole('button', { name: 'Vendas 2' })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Pedidos 5' })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Clientes' })).toHaveAttribute('aria-current', 'page');
    });

    it('filho navega pelo host', () => {
        const onSelect = vi.fn();
        renderGroup({ expanded: true, onSelect });
        fireEvent.click(screen.getByRole('link', { name: 'Clientes' }));
        expect(onSelect).toHaveBeenCalledWith('/vendas/clientes');
    });

    it('a animação de recolher usa o token de movimento e some com movimento reduzido', () => {
        renderGroup();
        const panel = document.querySelector('[data-state]') as HTMLElement;
        expect(panel.style.transition).toContain('var(--duration-fast');
        expect(panel.className).toContain('motion-reduce:transition-none');
    });
});

describe('ShellNavGroup — balão (lateral recolhida e topbar)', () => {
    it.each([
        ['lateral recolhida', { collapsed: true, horizontal: false }],
        ['topbar', { collapsed: false, horizontal: true }],
    ])('%s: os filhos só existem depois de abrir e saem no body', (_label, props) => {
        const { container } = renderGroup(props);
        const trigger = screen.getByRole('button', { name: 'Vendas 2' });
        expect(trigger).toHaveAttribute('aria-haspopup', 'true');
        expect(trigger).toHaveAttribute('aria-expanded', 'false');
        expect(screen.queryByRole('link', { name: 'Pedidos 5' })).toBeNull();

        fireEvent.click(trigger);
        expect(trigger).toHaveAttribute('aria-expanded', 'true');
        const link = screen.getByRole('link', { name: 'Pedidos 5' });
        expect(container.contains(link)).toBe(false);
        expect(link).toHaveFocus();
    });

    it('escolher um filho fecha o balão e navega', () => {
        const onSelect = vi.fn();
        renderGroup({ collapsed: true, onSelect });
        fireEvent.click(screen.getByRole('button', { name: 'Vendas 2' }));
        fireEvent.click(screen.getByRole('link', { name: 'Clientes' }));
        expect(onSelect).toHaveBeenCalledWith('/vendas/clientes');
        expect(screen.queryByRole('link', { name: 'Clientes' })).toBeNull();
    });

    it('Esc fecha o balão e o foco volta ao pai', () => {
        renderGroup({ horizontal: true });
        const trigger = screen.getByRole('button', { name: 'Vendas 2' });
        fireEvent.click(trigger);
        fireEvent.keyDown(screen.getByRole('group', { name: 'Vendas' }), { key: 'Escape' });
        expect(screen.queryByRole('link', { name: 'Pedidos 5' })).toBeNull();
        expect(trigger).toHaveFocus();
    });
});
