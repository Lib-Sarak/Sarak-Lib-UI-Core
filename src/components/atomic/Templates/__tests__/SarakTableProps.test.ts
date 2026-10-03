import { describe, expect, it } from 'vitest';
import type { SarakTableProps } from '../SarakTableProps';

describe('SarakTableProps', () => {
    it('expõe os controles tipados de chave, ordenação e seleção', () => {
        const props = {
            data: [{ id: 'row-1', name: 'Ada' }],
            getRowKey: (row: { id: string; name: string }, _index: number) => row.id,
            sort: { columnId: 'name', direction: 'asc' as const },
            selectable: true,
            selectedKeys: ['row-1'],
            onSortChange: (_sort: SarakTableProps['sort']) => undefined,
            onSelectionChange: () => undefined,
        } satisfies SarakTableProps<{ id: string; name: string }>;

        expect(props.getRowKey(props.data[0], 0)).toBe('row-1');
        expect(props.sort).toEqual({ columnId: 'name', direction: 'asc' });
        expect(props.selectedKeys).toEqual(['row-1']);
        expect(props.selectable).toBe(true);
    });
});
