import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';
import { SarakAppChrome } from '../../SarakAppChrome';
import { findActiveNavItemHref, getSarakSearchItems, toShellNavItems, type SarakNavItem } from '../navItem';

const SALES: SarakNavItem = {
    id: 'vendas',
    label: 'Vendas',
    href: '#vendas',
    icon: 'Briefcase',
    category: 'Comercial',
    children: [
        { id: 'pedidos', label: 'Pedidos', href: '#pedidos' },
        { id: 'orcamentos', label: 'Orçamentos', href: '#orcamentos', badge: 12 },
    ],
};

describe('navItem — a porta `navItems` no contrato do menu', () => {
    it('sem filhos, a conversão é a de sempre (aditiva)', () => {
        expect(toShellNavItems([{ id: 'a', label: 'A', href: '#a', category: 'X', badge: 2, target: '_self' }])).toEqual([
            { label: 'A', route: '#a', icon: undefined, category: 'X', disabled: undefined, badge: 2, target: '_self' },
        ]);
    });

    it('repassa os filhos e o `defaultExpanded`', () => {
        const [group] = toShellNavItems([{ ...SALES, defaultExpanded: true }]);
        expect(group.route).toBe('#vendas');
        expect(group.defaultExpanded).toBe(true);
        expect(group.children?.map((child) => [child.label, child.route, child.badge])).toEqual([
            ['Pedidos', '#pedidos', undefined],
            ['Orçamentos', '#orcamentos', 12],
        ]);
    });

    it('um nível só: neto é ignorado', () => {
        const nested: SarakNavItem = { ...SALES, children: [{ id: 'p', label: 'P', href: '#p', children: [{ id: 'n', label: 'N', href: '#n' }] }] };
        expect(toShellNavItems([nested])[0].children?.[0].children).toBeUndefined();
    });

    it('acha o ativo também entre os filhos', () => {
        expect(findActiveNavItemHref([{ id: 'a', label: 'A', href: '#a' }, { ...SALES, children: [{ id: 'p', label: 'P', href: '#p', active: true }] }])).toBe('#p');
        expect(findActiveNavItemHref([{ id: 'a', label: 'A', href: '#a', active: true }, SALES])).toBe('#a');
        expect(findActiveNavItemHref([SALES])).toBeUndefined();
    });

    it('filho ativo abre o grupo sozinho e recebe `aria-current`', () => {
        render(
            <SarakUIProvider options={{ mode: 'app' }}>
                <SarakAppChrome navItems={[{ ...SALES, children: [{ id: 'p', label: 'Pedidos', href: '#pedidos', active: true }] }]}>
                    <div />
                </SarakAppChrome>
            </SarakUIProvider>,
        );
        expect(screen.getByRole('button', { name: /Vendas/ })).toHaveAttribute('aria-expanded', 'true');
        expect(screen.getByRole('link', { name: 'Pedidos' })).toHaveAttribute('aria-current', 'page');
    });

    it('com `defaultExpanded`, o grupo nasce aberto mesmo sem filho ativo', () => {
        render(
            <SarakUIProvider options={{ mode: 'app' }}>
                <SarakAppChrome navItems={[{ ...SALES, defaultExpanded: true }]}>
                    <div />
                </SarakAppChrome>
            </SarakUIProvider>,
        );
        expect(screen.getByRole('button', { name: /Vendas/ })).toHaveAttribute('aria-expanded', 'true');
    });

    it('os itens de busca saem sem os desativados', () => {
        expect(getSarakSearchItems([{ route: '#a', label: 'A' }, { route: '#b', label: 'B', disabled: true }]).map((item) => item.id)).toEqual(['#a']);
    });
});
