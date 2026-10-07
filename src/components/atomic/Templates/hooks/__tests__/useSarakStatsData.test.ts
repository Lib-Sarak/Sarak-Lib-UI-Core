import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useSarakStatsData } from '../useSarakStatsData';

describe('useSarakStatsData', () => {
    it('uses host values as-is, including zero', () => {
        const data = { total: 0, large: 1200 };
        const load = vi.fn(async () => ({}));
        const { result } = renderHook(() => useSarakStatsData(data, load));

        expect(result.current.stats).toEqual(data);
        expect(result.current.loading).toBe(false);
        expect(load).not.toHaveBeenCalled();
    });

    it('loads stats through the host callback', async () => {
        const { result } = renderHook(() => useSarakStatsData(undefined, async () => ({ total: 5 })));

        await waitFor(() => expect(result.current.stats).toEqual({ total: 5 }));
        expect(result.current.loading).toBe(false);
    });

    it('surfaces a load failure', async () => {
        const { result } = renderHook(() => useSarakStatsData(undefined, async () => {
            throw new Error('Unavailable');
        }));

        await waitFor(() => expect(result.current.error).toBe('Unavailable'));
    });
});
