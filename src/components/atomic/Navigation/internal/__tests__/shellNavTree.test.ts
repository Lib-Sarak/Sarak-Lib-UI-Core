import { describe, expect, it } from 'vitest';
import type { SarakShellNavItem } from '../../SarakShellNav';
import { containsRoute, groupByCategory, groupKey, initialExpansion, isNavGroup } from '../shellNavTree';

const VENDAS: SarakShellNavItem = {
    label: 'Vendas',
    route: '/vendas',
    children: [{ label: 'Pedidos', route: '/vendas/pedidos' }, { label: 'Clientes', route: '/vendas/clientes' }],
};
const INICIO: SarakShellNavItem = { label: 'Início', route: '/' };

describe('shellNavTree', () => {
    it('só item com ao menos um filho é grupo', () => {
        expect(isNavGroup(VENDAS)).toBe(true);
        expect(isNavGroup(INICIO)).toBe(false);
        expect(isNavGroup({ label: 'Vazio', route: '/v', children: [] })).toBe(false);
    });

    it('containsRoute casa a rota do item e a de qualquer filho, e nada sem rota ativa', () => {
        expect(containsRoute(VENDAS, '/vendas/clientes')).toBe(true);
        expect(containsRoute(VENDAS, '/vendas')).toBe(true);
        expect(containsRoute(VENDAS, '/outra')).toBe(false);
        expect(containsRoute(VENDAS, undefined)).toBe(false);
    });

    it('a chave do grupo distingue pais com a mesma rota pelo rótulo', () => {
        expect(groupKey({ label: 'A', route: '#' })).not.toBe(groupKey({ label: 'B', route: '#' }));
    });

    it('agrupa por categoria na ordem de aparição, com a raiz sob a chave vazia', () => {
        const grouped = groupByCategory([INICIO, { ...VENDAS, category: 'Comercial' }, { label: 'Ajuda', route: '/ajuda' }]);
        expect([...grouped.keys()]).toEqual(['', 'Comercial']);
        expect(grouped.get('')?.map((item) => item.label)).toEqual(['Início', 'Ajuda']);
    });

    it('abre de saída o grupo com defaultExpanded e o que contém a rota ativa, e só eles', () => {
        const fechado: SarakShellNavItem = { label: 'Estoque', route: '/estoque', children: [{ label: 'Itens', route: '/estoque/itens' }] };
        const aberto: SarakShellNavItem = { label: 'Fiscal', route: '/fiscal', defaultExpanded: true, children: [{ label: 'Notas', route: '/fiscal/notas' }] };
        const expansion = initialExpansion([VENDAS, fechado, aberto, INICIO], '/vendas/pedidos');
        expect(expansion).toEqual({ [groupKey(VENDAS)]: true, [groupKey(aberto)]: true });
    });
});
