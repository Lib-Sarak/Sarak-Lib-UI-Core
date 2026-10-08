import { renderHook } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';
import { SarakDeviceProvider } from '../../../../core/Provider/DeviceProvider';
import { useSarakTableViewModel } from '../useSarakTableViewModel';
import type { SarakTableProps } from '../SarakTable';

interface Row extends Record<string, unknown> {
    id: number;
    name: string;
}

const rows: Row[] = [{ id: 1, name: 'Ana' }];

describe('useSarakTableViewModel', () => {
    it('deriva colunas, rótulos e dados filtrados sem trocar para cartões quando responsividade está desligada', () => {
        const props: SarakTableProps<Row> = {
            data: rows,
            columns: [{ key: 'name', label: 'Nome', align: 'center' }],
            responsive: false,
            showSearch: false,
        };
        const wrapper = ({ children }: { children: ReactNode }): ReactElement => (
            <SarakUIProvider>
                <SarakDeviceProvider overrideDevice="smartphone">{children}</SarakDeviceProvider>
            </SarakUIProvider>
        );
        const { result } = renderHook(() => useSarakTableViewModel(props), { wrapper });

        expect(result.current.collapseToCards).toBe(false);
        expect(result.current.columnKeys).toEqual(['name']);
        expect(result.current.columnLabels).toEqual({ name: 'Nome' });
        expect(result.current.columns[0].align).toBe('center');
        expect(result.current.filteredData).toEqual(rows);
        expect(result.current.interactions.entries[0].row).toBe(rows[0]);
    });
});
