import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useChartData } from '../useChartData';

describe('useChartData', () => {
    it('uses data from the host without loading', () => {
        const data = [{ value: 0 }];
        const load = vi.fn(async () => []);
        const { result } = renderHook(() => useChartData(data, load));

        expect(result.current.data).toEqual(data);
        expect(result.current.loading).toBe(false);
        expect(load).not.toHaveBeenCalled();
    });

    it('loads chart data through the host callback', async () => {
        const data = [{ date: 'today', value: 3 }];
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
