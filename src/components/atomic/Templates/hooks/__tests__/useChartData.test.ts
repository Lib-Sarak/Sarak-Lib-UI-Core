import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useChartData } from '../useChartData';

const SAMPLE_CHART_VALUE = 3;

describe('useChartData host data', () => {
    it('uses data from the host without loading', () => {
        const data = [{ value: 0 }];
        const load = vi.fn(async () => []);
        const { result } = renderHook(() => useChartData(data, load));

        expect(result.current.data).toEqual(data);
        expect(result.current.loading).toBe(false);
        expect(load).not.toHaveBeenCalled();
    });

    it('loads chart data through the host callback', async () => {
        const data = [{ date: 'today', value: SAMPLE_CHART_VALUE }];
        const { result } = renderHook(() => useChartData(undefined, async () => data));

        await waitFor(() => expect(result.current.data).toEqual(data));
        expect(result.current.loading).toBe(false);
    });

    it('surfaces a load failure', async () => {
        const { result } = renderHook(() => useChartData(undefined, async () => {
            throw new Error('Unavailable');
        }));

        await waitFor(() => expect(result.current.error).toBe('Unavailable'));
    });

});

describe('useChartData refresh', () => {
    it('keeps the last successful points and reading time after a refresh failure', async () => {
        const data = [{ date: 'today', value: SAMPLE_CHART_VALUE }];
        const load = vi.fn<() => Promise<typeof data>>()
            .mockResolvedValueOnce(data)
            .mockRejectedValueOnce(new Error('Unavailable'));
        const { result } = renderHook(() => useChartData(undefined, load));

        await waitFor(() => expect(result.current.updatedAt).toBeInstanceOf(Date));
        const lastReadAt = result.current.updatedAt;
        await act(async () => result.current.loadData());

        expect(result.current.data).toEqual(data);
        expect(result.current.error).toBe('Unavailable');
        expect(result.current.updatedAt).toBe(lastReadAt);
    });
});
