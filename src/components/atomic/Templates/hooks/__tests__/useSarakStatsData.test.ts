import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useSarakStatsData } from '../useSarakStatsData';

const LARGE_METRIC_VALUE = 1200;
const LOADED_METRIC_TOTAL = 5;

describe('useSarakStatsData host data', () => {
    it('uses host values as-is, including zero', () => {
        const data = { total: 0, large: LARGE_METRIC_VALUE };
        const load = vi.fn(async () => ({}));
        const { result } = renderHook(() => useSarakStatsData(data, load));

        expect(result.current.stats).toEqual(data);
        expect(result.current.loading).toBe(false);
        expect(load).not.toHaveBeenCalled();
    });

    it('loads stats through the host callback', async () => {
        const { result } = renderHook(() => useSarakStatsData(undefined, async () => ({ total: LOADED_METRIC_TOTAL })));

        await waitFor(() => expect(result.current.stats).toEqual({ total: LOADED_METRIC_TOTAL }));
        expect(result.current.loading).toBe(false);
    });

    it('surfaces a load failure', async () => {
        const { result } = renderHook(() => useSarakStatsData(undefined, async () => {
            throw new Error('Unavailable');
        }));

        await waitFor(() => expect(result.current.error).toBe('Unavailable'));
    });

});

describe('useSarakStatsData refresh', () => {
    it('keeps the last successful metrics and reading time after a refresh failure', async () => {
        const data = { total: LOADED_METRIC_TOTAL };
        const load = vi.fn<() => Promise<typeof data>>()
            .mockResolvedValueOnce(data)
            .mockRejectedValueOnce(new Error('Unavailable'));
        const { result } = renderHook(() => useSarakStatsData(undefined, load));

        await waitFor(() => expect(result.current.updatedAt).toBeInstanceOf(Date));
        const lastReadAt = result.current.updatedAt;
        await act(async () => result.current.loadData());

        expect(result.current.stats).toEqual(data);
        expect(result.current.error).toBe('Unavailable');
        expect(result.current.updatedAt).toBe(lastReadAt);
    });
});
