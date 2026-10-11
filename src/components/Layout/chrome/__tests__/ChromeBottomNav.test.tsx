import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import SarakUIProvider from '../../../../core/Provider/SarakUIProvider';
import { ChromeBottomNav } from '../ChromeBottomNav';

// Prova DOM e atributos: papel, nome acessível, estado ativo, ordem de tabulação. A posição, a
// caixa tocável e a área segura se medem em navegador real (`browser-tests/`).
const ITEMS = [
    { label: 'Início', route: '/inicio', icon: 'Home' },
    { label: 'Pedidos', route: '/pedidos', icon: 'List', badge: 3 },
    { label: 'Contas', route: '/contas', icon: 'User', disabled: true },
];

const renderBar = (props: Partial<React.ComponentProps<typeof ChromeBottomNav>> = {}) =>
    render(
        <SarakUIProvider config={{ mode: 'dark' }}>
            <ChromeBottomNav items={ITEMS} activeRoute="/pedidos" {...props} />
        </SarakUIProvider>,
    );

describe('ChromeBottomNav — a barra de navegação do celular', () => {
    it('é uma região de navegação rotulada, com um link de verdade por destino', () => {
        const { container } = renderBar();
        const nav = container.querySelector('nav[data-sarak-bottom-nav]') as HTMLElement;
        expect(nav).toHaveAttribute('aria-label');
        const links = nav.querySelectorAll('a');
        expect(links).toHaveLength(ITEMS.length);
        expect(links[0]).toHaveAttribute('href', '/inicio');
    });

    it('cada item mostra ícone E rótulo', () => {
        const { container } = renderBar();
        const first = container.querySelector('a[href="/inicio"]') as HTMLElement;
        expect(first.querySelector('svg')).not.toBeNull();
        expect(first).toHaveTextContent('Início');
    });

    it('só o item ativo carrega aria-current', () => {
        const { container } = renderBar();
        expect(container.querySelector('a[href="/pedidos"]')).toHaveAttribute('aria-current', 'page');
        expect(container.querySelector('a[href="/inicio"]')).not.toHaveAttribute('aria-current');
    });

    it('o badge integra o nome acessível', () => {
        renderBar();
        expect(screen.getByRole('link', { name: 'Pedidos 3' })).toBeInTheDocument();
    });

    it('item disabled sai da ordem de tabulação, perde o href e não navega', () => {
        const onNavigate = vi.fn();
        const { container } = renderBar({ onNavigate });
        const disabled = screen.getByText('Contas').closest('a') as HTMLElement;
        expect(disabled).toHaveAttribute('aria-disabled', 'true');
        expect(disabled).not.toHaveAttribute('href');
        expect(disabled.tabIndex).toBe(-1);
        fireEvent.click(disabled);
        expect(onNavigate).not.toHaveBeenCalled();
        expect(container.querySelectorAll('a')).toHaveLength(ITEMS.length);
    });

    it('o clique simples chama onNavigate com a rota e previne o padrão do navegador', () => {
        const onNavigate = vi.fn();
        const { container } = renderBar({ onNavigate });
        const event = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 });
        (container.querySelector('a[href="/inicio"]') as HTMLElement).dispatchEvent(event);
        expect(onNavigate).toHaveBeenCalledWith('/inicio');
        expect(event.defaultPrevented).toBe(true);
    });

    it('Ctrl+clique fica com o navegador: onNavigate não é chamado', () => {
        const onNavigate = vi.fn();
        const { container } = renderBar({ onNavigate });
        fireEvent.click(container.querySelector('a[href="/inicio"]') as HTMLElement, { ctrlKey: true });
        expect(onNavigate).not.toHaveBeenCalled();
    });

    it('por teclado: Tab alcança os itens navegáveis em ordem e Enter navega', async () => {
        const user = userEvent.setup();
        const onNavigate = vi.fn();
        renderBar({ onNavigate });
        await user.tab();
        expect(screen.getByRole('link', { name: 'Início' })).toHaveFocus();
        await user.tab();
        expect(screen.getByRole('link', { name: 'Pedidos 3' })).toHaveFocus();
        await user.keyboard('{Enter}');
        expect(onNavigate).toHaveBeenCalledWith('/pedidos');
    });

    it('a caixa tocável sai da variável do token, não de um px escrito na barra', () => {
        const { container } = renderBar();
        const item = container.querySelector('a[href="/inicio"]') as HTMLElement;
        expect(item.style.minHeight).toBe('var(--sarak-touch-target-active, 0px)');
        expect(item.style.minWidth).toBe('var(--sarak-touch-target-active, 0px)');
    });

    it('a área segura entra no respiro da base', () => {
        const { container } = renderBar();
        const nav = container.querySelector('nav') as HTMLElement;
        expect(nav.style.paddingBottom).toContain('env(safe-area-inset-bottom');
    });
});
