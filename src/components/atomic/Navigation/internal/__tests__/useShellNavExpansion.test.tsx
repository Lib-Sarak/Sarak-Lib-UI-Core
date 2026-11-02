import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { SarakShellNavItem } from '../../SarakShellNav';
import { useShellNavExpansion } from '../useShellNavExpansion';

const VENDAS: SarakShellNavItem = { label: 'Vendas', route: '/vendas', children: [{ label: 'Pedidos', route: '/vendas/pedidos' }] };
const ESTOQUE: SarakShellNavItem = { label: 'Estoque', route: '/estoque', children: [{ label: 'Itens', route: '/estoque/itens' }] };
const ITEMS = [VENDAS, ESTOQUE];

describe('useShellNavExpansion', () => {
    it('começa tudo fechado sem rota ativa nem defaultExpanded', () => {
        const { result } = renderHook(() => useShellNavExpansion(ITEMS, undefined));
        expect(result.current.isExpanded(VENDAS)).toBe(false);
        expect(result.current.isExpanded(ESTOQUE)).toBe(false);
    });

    it('abre sozinho o grupo do item ativo', () => {
        const { result } = renderHook(() => useShellNavExpansion(ITEMS, '/estoque/itens'));
        expect(result.current.isExpanded(ESTOQUE)).toBe(true);
        expect(result.current.isExpanded(VENDAS)).toBe(false);
    });

    it('abre o grupo de um filho quando a rota ativa muda para ele, sem fechar os outros', () => {
        const { result, rerender } = renderHook(({ route }) => useShellNavExpansion(ITEMS, route), { initialProps: { route: '/vendas/pedidos' } });
        rerender({ route: '/estoque/itens' });
        expect(result.current.isExpanded(VENDAS)).toBe(true);
        expect(result.current.isExpanded(ESTOQUE)).toBe(true);
    });

    it('alterna cada grupo por conta própria e mais de um fica aberto', () => {
        const { result } = renderHook(() => useShellNavExpansion(ITEMS, undefined));
        act(() => result.current.toggle(VENDAS));
        act(() => result.current.toggle(ESTOQUE));
        expect(result.current.isExpanded(VENDAS) && result.current.isExpanded(ESTOQUE)).toBe(true);
        act(() => result.current.toggle(VENDAS));
        expect(result.current.isExpanded(VENDAS)).toBe(false);
        expect(result.current.isExpanded(ESTOQUE)).toBe(true);
    });

    it('um grupo que o usuário fechou não reabre a cada render com a mesma rota ativa', () => {
        const { result, rerender } = renderHook(() => useShellNavExpansion([...ITEMS], '/vendas/pedidos'));
        act(() => result.current.toggle(VENDAS));
        expect(result.current.isExpanded(VENDAS)).toBe(false);
        rerender();
        expect(result.current.isExpanded(VENDAS)).toBe(false);
    });
});
