import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useCardGridState } from '../useCardGridState';

describe('useCardGridState host data', () => {
    it('uses host data without calling load', () => {
        const data = [{ id: 1, name: 'A' }];
        const load = vi.fn(async () => []);
        const { result } = renderHook(() => useCardGridState(data, load));

        expect(result.current.data).toEqual(data);
        expect(result.current.loading).toBe(false);
        expect(load).not.toHaveBeenCalled();
    });

    it('loads data supplied by the host', async () => {
        const data = [{ id: 1, name: 'A' }];
        const load = vi.fn(async () => data);
        const { result } = renderHook(() => useCardGridState(undefined, load));

        await waitFor(() => expect(result.current.data).toEqual(data));
        expect(load).toHaveBeenCalledOnce();
        expect(result.current.loading).toBe(false);
    });

});

describe('useCardGridState load failures and refresh', () => {
    it('surfaces a load failure', async () => {
        const { result } = renderHook(() => useCardGridState(undefined, async () => {
            throw new Error('Unavailable');
        }));

        await waitFor(() => expect(result.current.error).toBe('Unavailable'));
        expect(result.current.loading).toBe(false);
    });

    it('refreshes by calling the host loader', async () => {
        const load = vi.fn().mockResolvedValue([{ id: 2 }]);
        const { result } = renderHook(() => useCardGridState(undefined, load));

        await act(async () => result.current.loadData());
        expect(result.current.data).toEqual([{ id: 2 }]);
    });

    it('keeps the last successful cards and reading time after a refresh failure', async () => {
        const data = [{ id: 1, name: 'Ana' }];
        const load = vi.fn<() => Promise<typeof data>>()
            .mockResolvedValueOnce(data)
            .mockRejectedValueOnce(new Error('Unavailable'));
        const { result } = renderHook(() => useCardGridState(undefined, load));

        await waitFor(() => expect(result.current.updatedAt).toBeInstanceOf(Date));
        const lastReadAt = result.current.updatedAt;
        await act(async () => result.current.loadData());

        expect(result.current.data).toEqual(data);
        expect(result.current.error).toBe('Unavailable');
        expect(result.current.updatedAt).toBe(lastReadAt);
    });
});
