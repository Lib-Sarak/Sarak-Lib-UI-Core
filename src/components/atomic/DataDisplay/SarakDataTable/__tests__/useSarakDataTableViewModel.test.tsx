import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { SarakColumn } from '../columnModel';
import { useSarakDataTableViewModel } from '../useSarakDataTableViewModel';
import type { SarakDataTableProps } from '../SarakDataTableImpl';

interface Row {
    id: number;
    name: string;
}

const ROW_WIDTH = 120;
const TABLE_HEIGHT = 300;
const HEIGHT_PER_ROW_ID = 72;
const rows: Row[] = [{ id: 1, name: 'Ana' }];
const columns: SarakColumn<Row>[] = [{ id: 'name', header: 'Nome', width: ROW_WIDTH, pinned: 'left' }];

describe('useSarakDataTableViewModel', () => {
    it('deriva colunas, largura e modo de cartão conforme o dispositivo', () => {
        const props: SarakDataTableProps<Row> = {
            columns,
            rows,
            height: TABLE_HEIGHT,
            rowHeight: (row) => row.id * HEIGHT_PER_ROW_ID,
            responsive: true,
        };
        const { result } = renderHook(() => useSarakDataTableViewModel(props, 'smartphone'));

        expect(result.current.collapseToCards).toBe(true);
        expect(result.current.ordered).toEqual(columns);
        expect(result.current.offsets.total).toBe(ROW_WIDTH);
        expect(result.current.containerWidth).toBe(ROW_WIDTH);
        expect(result.current.isAutomaticRowHeight).toBe(false);
    });
});
