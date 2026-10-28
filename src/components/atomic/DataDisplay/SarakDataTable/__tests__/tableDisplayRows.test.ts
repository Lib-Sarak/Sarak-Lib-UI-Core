import { describe, expect, it } from 'vitest';
import { buildDisplayRows, groupIdOf, groupKeyOf } from '../tableDisplayRows';
import type { BuildDisplayRowsOptions } from '../tableDisplayRows';

interface Node { id: number; group: string; children?: Node[] }

const data: Node[] = [
    { id: 1, group: 'A' }, { id: 2, group: 'B' }, { id: 3, group: 'A' },
];
const entries = data.map((row, index) => ({ row, index, key: row.id }));
const base = (extra: Partial<BuildDisplayRowsOptions<Node>> = {}): BuildDisplayRowsOptions<Node> => ({
    entries, hasDetail: false, isRowExpanded: () => false, isGroupExpanded: (_id, fallback) => fallback, ...extra,
});
const kinds = (options: BuildDisplayRowsOptions<Node>): string[] => buildDisplayRows(options).map((row) => `${row.kind}:${row.id}`);

describe('buildDisplayRows', () => {
    it('sem agrupamento, árvore ou detalhe devolve só as linhas de dado', () => {
        expect(kinds(base())).toEqual(['data:row:1', 'data:row:2', 'data:row:3']);
    });

    it('agrupa na ordem de aparição, com subtotal por padrão', () => {
        expect(kinds(base({ groupBy: { key: 'group' } }))).toEqual([
            'group:group:A', 'data:row:1', 'data:row:3', 'subtotal:subtotal:A',
            'group:group:B', 'data:row:2', 'subtotal:subtotal:B',
        ]);
    });

    it('subtotals:false tira o subtotal; grupo recolhido esconde linhas e subtotal', () => {
        expect(kinds(base({ groupBy: { key: (row) => row.group, subtotals: false } }))).not.toContain('subtotal:subtotal:A');
        const collapsed = base({ groupBy: { key: 'group' }, isGroupExpanded: (id) => id !== groupIdOf('A') });
        expect(kinds(collapsed)).toEqual(['group:group:A', 'group:group:B', 'data:row:2', 'subtotal:subtotal:B']);
    });

    it('defaultExpanded:false recolhe os grupos que não foram alternados', () => {
        expect(kinds(base({ groupBy: { key: 'group', defaultExpanded: false } }))).toEqual(['group:group:A', 'group:group:B']);
    });

    it('linha expandida ganha o detalhe logo abaixo', () => {
        const rows = buildDisplayRows(base({ hasDetail: true, isRowExpanded: (key) => key === 2 }));
        expect(rows.map((row) => row.kind)).toEqual(['data', 'data', 'detail', 'data']);
        expect(rows[1]).toMatchObject({ expandable: true, expanded: true });
        expect(rows[0]).toMatchObject({ expandable: true, expanded: false });
    });

    it('árvore: filhos entram depois do pai, com profundidade e estado de expansão', () => {
        const tree: Node[] = [{ id: 1, group: 'A', children: [{ id: 10, group: 'A' }, { id: 11, group: 'A', children: [{ id: 110, group: 'A' }] }] }];
        const rows = buildDisplayRows(base({
            entries: tree.map((row, index) => ({ row, index, key: row.id })),
            getChildren: (row) => row.children, getRowKey: (row) => row.id,
            isRowExpanded: (_key, depth) => depth < 1,
        }));
        expect(rows.map((row) => row.kind === 'data' ? [row.entry.key, row.depth, row.expanded] : row.kind)).toEqual([[1, 0, true], [10, 1, false], [11, 1, false]]);
        expect(rows[0]).toMatchObject({ hasChildren: true, expandable: true });
        expect(rows[1]).toMatchObject({ hasChildren: false, expandable: false });
    });

    it('filho sem id usa a posição prefixada pela chave do pai', () => {
        const tree = [{ id: 1, children: [{ name: 'x' }] }] as unknown as Node[];
        const rows = buildDisplayRows({
            ...base(), entries: tree.map((row, index) => ({ row, index, key: row.id })),
            getChildren: (row) => row.children, isRowExpanded: () => true,
        });
        expect(rows.map((row) => row.kind === 'data' ? row.entry.key : '')).toEqual([1, '1/0']);
    });

    it('groupKeyOf aceita campo, função e valor ausente', () => {
        expect(groupKeyOf({ key: 'group' }, data[0])).toBe('A');
        expect(groupKeyOf({ key: () => 'Z' }, data[0])).toBe('Z');
        expect(groupKeyOf({ key: 'inexistente' }, data[0])).toBe('');
    });
});
