import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, expect, it, vi } from 'vitest';
import type { SarakShellNavItem } from '../../SarakShellNav';
import { ShellNavMore } from '../ShellNavMore';
import SarakUIProvider from '../../../../../core/Provider/SarakUIProvider';

const HIDDEN: SarakShellNavItem[] = [
    { label: 'Contratos', route: '/contratos' },
    { label: 'Vendas', route: '/vendas', children: [{ label: 'Pedidos', route: '/vendas/pedidos' }] },
];

const renderMore = (props: Partial<React.ComponentProps<typeof ShellNavMore>> = {}) => render(
    <SarakUIProvider config={{}}>
        <ShellNavMore hiddenItems={HIDDEN} visible start={0} collapsed={false} onToggle={vi.fn()} {...props} />
    </SarakUIProvider>,
);

describe('ShellNavMore — o botão "Mais" da topbar', () => {
    it('abre os itens escondidos, com os filhos de um grupo no lugar do pai', () => {
        renderMore();
        fireEvent.click(screen.getByRole('button', { name: 'Mais' }));
        const flyout = document.querySelector('[data-sarak-nav-flyout]') as HTMLElement;
        expect(within(flyout).getAllByRole('link').map((link) => link.textContent)).toEqual(['Contratos', 'Pedidos']);
    });

    it('sem nada escondido o botão fica medido, mas sem visibilidade', () => {
        const { container } = renderMore({ hiddenItems: [], visible: false });
        expect((container.querySelector('[data-sarak-nav-more]') as HTMLElement).style.visibility).toBe('hidden');
    });

    it('começa onde a medição mandou e não leva ícone, só o texto e a seta', () => {
        const { container } = renderMore({ start: 412 });
        const wrapper = container.querySelector('[data-sarak-nav-more]') as HTMLElement;
        expect(wrapper.style.insetInlineStart).toBe('412px');
        expect(screen.getByRole('button', { name: 'Mais' }).querySelectorAll('svg')).toHaveLength(1);
    });

    it('o item ativo lá dentro marca o botão', () => {
        renderMore({ activeRoute: '/vendas/pedidos' });
        expect(screen.getByRole('button', { name: 'Mais' })).toHaveAttribute('data-sarak-nav-group-active', 'true');
    });

    it('selecionar um item chama onSelect com a rota', () => {
        const onSelect = vi.fn();
        renderMore({ onSelect });
        fireEvent.click(screen.getByRole('button', { name: 'Mais' }));
        fireEvent.click(screen.getByRole('link', { name: 'Contratos' }));
        expect(onSelect).toHaveBeenCalledWith('/contratos');
    });
});
