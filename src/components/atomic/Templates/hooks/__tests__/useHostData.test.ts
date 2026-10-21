import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useHostData } from '../useHostData';

describe('useHostData', () => {
    it('uses supplied data and timestamp without calling the loader', () => {
        const data = [{ value: 'cached' }];
        const load = vi.fn(async () => []);
        const timestamp = new Date('2026-10-10T22:12:00.000Z');
        const { result } = renderHook(() => useHostData({ data, load, updatedAt: timestamp, initialData: [] }));

        expect(result.current.data).toEqual(data);
        expect(result.current.updatedAt).toEqual(timestamp);
        expect(load).not.toHaveBeenCalled();
    });

    it('preserves the last successful data and time when refresh fails', async () => {
        const data = [{ value: 'cached' }];
        const load = vi.fn<() => Promise<typeof data>>()
            .mockResolvedValueOnce(data)
            .mockRejectedValueOnce(new Error('Unavailable'));
        const { result } = renderHook(() => useHostData({ data: undefined, load, initialData: [] as typeof data }));

        await waitFor(() => expect(result.current.updatedAt).toBeInstanceOf(Date));
        const lastReadAt = result.current.updatedAt;
        await act(async () => result.current.loadData());

        expect(result.current.data).toEqual(data);
        expect(result.current.error).toBe('Unavailable');
        expect(result.current.updatedAt).toBe(lastReadAt);
    });
});
