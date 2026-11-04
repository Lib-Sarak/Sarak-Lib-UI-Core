import React from 'react';
import { act, render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SarakShellNav, type SarakShellNavItem } from '../SarakShellNav';

const PLAIN: SarakShellNavItem[] = [
    { label: 'Início', route: '/' },
    { label: 'Relatórios', route: '/relatorios', category: 'Análise' },
];
const WITH_GROUP: SarakShellNavItem[] = [
    { label: 'Início', route: '/' },
    {
        label: 'Vendas',
        route: '/vendas',
        children: [{ label: 'Pedidos', route: '/vendas/pedidos' }, { label: 'Clientes', route: '/vendas/clientes' }],
    },
    { label: 'Estoque', route: '/estoque', defaultExpanded: true, children: [{ label: 'Itens', route: '/estoque/itens' }] },
];

describe('SarakShellNav — grupos recolhíveis', () => {
    it('sem children, o DOM é o de sempre: links diretos, nenhum botão, grupo ou painel', () => {
        const { container } = render(<SarakShellNav items={PLAIN} />);
        expect(container.querySelector('[data-sarak-nav-group]')).toBeNull();
        expect(screen.queryAllByRole('button')).toHaveLength(0);
        expect(screen.getAllByRole('link').map((link) => link.getAttribute('href'))).toEqual(['/', '/relatorios']);
    });

    it('o grupo abre e fecha por clique, com aria-expanded', () => {
        render(<SarakShellNav items={WITH_GROUP} orientation="vertical" />);
        const vendas = screen.getByRole('button', { name: 'Vendas' });
        expect(vendas).toHaveAttribute('aria-expanded', 'false');
        fireEvent.click(vendas);
        expect(vendas).toHaveAttribute('aria-expanded', 'true');
        expect(screen.getByRole('link', { name: 'Pedidos' })).toBeVisible();
        fireEvent.click(vendas);
        expect(vendas).toHaveAttribute('aria-expanded', 'false');
    });

    it('o pai do grupo é um botão nativo e recebe foco: Enter e Espaço o acionam pelo teclado', () => {
        render(<SarakShellNav items={WITH_GROUP} orientation="vertical" />);
        const vendas = screen.getByRole('button', { name: 'Vendas' });
        vendas.focus();
        expect(vendas.tagName).toBe('BUTTON');
        expect(vendas).toHaveFocus();
    });

    it('o grupo do item ativo abre sozinho, e defaultExpanded abre o seu', () => {
        render(<SarakShellNav items={WITH_GROUP} activeRoute="/vendas/clientes" orientation="vertical" />);
        expect(screen.getByRole('button', { name: 'Vendas' })).toHaveAttribute('aria-expanded', 'true');
        expect(screen.getByRole('button', { name: 'Estoque' })).toHaveAttribute('aria-expanded', 'true');
        expect(screen.getByRole('link', { name: 'Clientes' })).toHaveAttribute('aria-current', 'page');
    });

    it('troca de rota ativa para um filho de grupo fechado abre esse grupo', () => {
        const { rerender } = render(<SarakShellNav items={WITH_GROUP} activeRoute="/" orientation="vertical" />);
        expect(screen.getByRole('button', { name: 'Vendas' })).toHaveAttribute('aria-expanded', 'false');
        rerender(<SarakShellNav items={WITH_GROUP} activeRoute="/vendas/pedidos" orientation="vertical" />);
        expect(screen.getByRole('button', { name: 'Vendas' })).toHaveAttribute('aria-expanded', 'true');
    });

    it('mais de um grupo pode ficar aberto', () => {
        render(<SarakShellNav items={WITH_GROUP} orientation="vertical" />);
        fireEvent.click(screen.getByRole('button', { name: 'Vendas' }));
        expect(screen.getByRole('button', { name: 'Estoque' })).toHaveAttribute('aria-expanded', 'true');
        expect(screen.getByRole('button', { name: 'Vendas' })).toHaveAttribute('aria-expanded', 'true');
    });

    it('na topbar o grupo abre um balão e o item sem filhos segue um link', () => {
        render(<SarakShellNav items={WITH_GROUP} orientation="horizontal" />);
        expect(screen.getByRole('link', { name: 'Início' })).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: 'Vendas' }));
        expect(screen.getByRole('group', { name: 'Vendas' })).toBeInTheDocument();
    });

    it('recolhida, o grupo abre um balão ao lado do ícone', () => {
        render(<SarakShellNav items={WITH_GROUP} orientation="vertical" collapsed />);
        fireEvent.click(screen.getByRole('button', { name: 'Vendas' }));
        expect(screen.getByRole('group', { name: 'Vendas' })).toBeInTheDocument();
    });

    it('recolhida, o item comum mostra o nome em dica ao focar', () => {
        vi.useFakeTimers();
        try {
            render(<SarakShellNav items={PLAIN} orientation="vertical" collapsed />);
            fireEvent.focus(screen.getByRole('link', { name: 'Início' }));
            act(() => { vi.advanceTimersByTime(400); });
            expect(screen.getByRole('tooltip')).toHaveTextContent('Início');
        } finally {
            vi.useRealTimers();
        }
    });

    it('o pai com filhos nunca navega: não é link', () => {
        render(<SarakShellNav items={WITH_GROUP} orientation="vertical" />);
        expect(screen.queryByRole('link', { name: 'Vendas' })).toBeNull();
    });
});
