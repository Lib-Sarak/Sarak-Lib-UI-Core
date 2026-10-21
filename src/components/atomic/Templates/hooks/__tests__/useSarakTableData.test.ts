import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useSarakTableData } from '../useSarakTableData';

describe('useSarakTableData host data', () => {
    it('uses host data without calling load', () => {
        const data = [{ id: 1, name: 'A' }];
        const load = vi.fn(async () => []);
        const { result } = renderHook(() => useSarakTableData(data, load));

        expect(result.current.data).toEqual(data);
        expect(result.current.loading).toBe(false);
        expect(load).not.toHaveBeenCalled();
    });

    it('loads data and filters it with local search', async () => {
        const data = [{ id: 1, name: 'Ana' }, { id: 2, name: 'Beto' }];
        const { result } = renderHook(() => useSarakTableData(undefined, async () => data));

        await waitFor(() => expect(result.current.data).toEqual(data));
        act(() => result.current.setSearch('ana'));
        expect(result.current.filteredData).toEqual([data[0]]);
    });

});

describe('useSarakTableData load failures and refresh', () => {
    it('surfaces a load failure', async () => {
        const { result } = renderHook(() => useSarakTableData(undefined, async () => {
            throw new Error('Unavailable');
        }));

        await waitFor(() => expect(result.current.error).toBe('Unavailable'));
        expect(result.current.loading).toBe(false);
    });

    it('keeps the last successful rows and reading time after a refresh failure', async () => {
        const data = [{ id: 1, name: 'Ana' }];
        const load = vi.fn<() => Promise<typeof data>>()
            .mockResolvedValueOnce(data)
            .mockRejectedValueOnce(new Error('Unavailable'));
        const { result } = renderHook(() => useSarakTableData(undefined, load));

        await waitFor(() => expect(result.current.updatedAt).toBeInstanceOf(Date));
        const lastReadAt = result.current.updatedAt;
        await act(async () => result.current.loadData());

        expect(result.current.data).toEqual(data);
        expect(result.current.error).toBe('Unavailable');
        expect(result.current.updatedAt).toBe(lastReadAt);
    });
});
