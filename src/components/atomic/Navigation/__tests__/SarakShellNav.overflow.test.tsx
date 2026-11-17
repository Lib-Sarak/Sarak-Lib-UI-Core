import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SarakShellNav, type SarakShellNavItem } from '../SarakShellNav';
import SarakUIProvider from '../../../../core/Provider/SarakUIProvider';

const ITEMS: SarakShellNavItem[] = ['Início', 'Comercial', 'Financeiro', 'Projetos', 'Propostas'].map((label, index) => ({ label, route: `/item-${index}` }));
const ITEM_WIDTH = 100;
const MORE_WIDTH = 60;

/** O `jsdom` não calcula layout: cada célula tem 100 px, o botão "Mais" 60 px e a barra a largura pedida (sem vão nem recuo). */
const mockLayout = (navWidth: number): void => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function measure(this: HTMLElement) {
        const cells = Array.from(document.querySelectorAll('[data-sarak-nav-cell]'));
        const index = cells.indexOf(this);
        const box = (left: number, width: number): DOMRect => ({ left, right: left + width, width, top: 0, bottom: 0, height: 0, x: left, y: 0, toJSON: () => ({}) });
        if (index >= 0) return box(index * ITEM_WIDTH, ITEM_WIDTH);
        if (this.hasAttribute('data-sarak-nav-more')) return box(0, MORE_WIDTH);
        if (this.tagName === 'NAV') return box(0, navWidth);
        return box(0, 0);
    });
};

const renderNav = (props: Partial<React.ComponentProps<typeof SarakShellNav>> = {}) => render(
    <SarakUIProvider config={{}}>
        <SarakShellNav items={ITEMS} orientation="horizontal" {...props} />
    </SarakUIProvider>,
);

const hiddenCells = (): string[] => Array.from(document.querySelectorAll<HTMLElement>('[data-sarak-nav-cell]'))
    .filter((cell) => cell.style.visibility === 'hidden')
    .map((cell) => cell.textContent ?? '');

afterEach(() => vi.restoreAllMocks());

describe('SarakShellNav horizontal — o que não cabe vai para o "Mais"', () => {
    it('cabendo tudo, nenhum item é escondido e o "Mais" fica invisível', () => {
        mockLayout(500);
        renderNav();
        expect(hiddenCells()).toEqual([]);
        expect((document.querySelector('[data-sarak-nav-more]') as HTMLElement).style.visibility).toBe('hidden');
    });

    it('os itens que não cabem perdem a visibilidade (saem do foco) e o "Mais" os abre, em ordem', () => {
        mockLayout(400);
        renderNav();
        // 400 px com 60 do botão: ficam os que terminam até 340 (3 itens); os outros 2 vão para o "Mais".
        expect(hiddenCells()).toEqual(['Projetos', 'Propostas']);
        const more = within(document.querySelector('[data-sarak-nav-more]') as HTMLElement).getByRole('button', { name: 'Mais' });
        expect((document.querySelector('[data-sarak-nav-more]') as HTMLElement).style.visibility).not.toBe('hidden');
        expect(more).toHaveAttribute('aria-expanded', 'false');
        fireEvent.click(more);
        expect(more).toHaveAttribute('aria-expanded', 'true');
        const flyout = document.querySelector('[data-sarak-nav-flyout]') as HTMLElement;
        expect(within(flyout).getAllByRole('link').map((link) => link.textContent)).toEqual(['Projetos', 'Propostas']);
    });

    it('escolher um item do "Mais" navega pelo mesmo onNavigate e fecha o balão', () => {
        mockLayout(400);
        const onNavigate = vi.fn();
        renderNav({ onNavigate });
        fireEvent.click(within(document.querySelector('[data-sarak-nav-more]') as HTMLElement).getByRole('button', { name: 'Mais' }));
        fireEvent.click(within(document.querySelector('[data-sarak-nav-flyout]') as HTMLElement).getByRole('link', { name: 'Propostas' }));
        expect(onNavigate).toHaveBeenCalledWith('/item-4');
        expect(document.querySelector('[data-sarak-nav-flyout]')).toBeNull();
    });

    it('o item ativo escondido marca o "Mais" como ativo; o ativo visível não', () => {
        mockLayout(400);
        const { unmount } = renderNav({ activeRoute: '/item-4' });
        const more = within(document.querySelector('[data-sarak-nav-more]') as HTMLElement).getByRole('button', { name: 'Mais' });
        expect(more).toHaveAttribute('data-sarak-nav-group-active', 'true');
        unmount();
        renderNav({ activeRoute: '/item-0' });
        expect(within(document.querySelector('[data-sarak-nav-more]') as HTMLElement).getByRole('button', { name: 'Mais' })).not.toHaveAttribute('data-sarak-nav-group-active');
    });

    it('grupo escondido leva os filhos dele para o "Mais" (um nível só)', () => {
        mockLayout(150);
        renderNav({ items: [ITEMS[0], { label: 'Vendas', route: '/vendas', children: [{ label: 'Pedidos', route: '/vendas/pedidos' }] }] });
        fireEvent.click(within(document.querySelector('[data-sarak-nav-more]') as HTMLElement).getByRole('button', { name: 'Mais' }));
        expect(within(document.querySelector('[data-sarak-nav-flyout]') as HTMLElement).getByRole('link', { name: 'Pedidos' })).toBeInTheDocument();
    });

    it('na vertical não há "Mais" nem célula medida', () => {
        mockLayout(100);
        renderNav({ orientation: 'vertical' });
        expect(document.querySelector('[data-sarak-nav-more]')).toBeNull();
        expect(document.querySelector('[data-sarak-nav-cell]')).toBeNull();
        expect(screen.getAllByRole('link')).toHaveLength(5);
    });
});
