import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useManagementGrid } from '../useManagementGrid';

const getVal = (item: Record<string, unknown>, path: string): unknown => item[path];

describe('useManagementGrid', () => {
    it('groups host data and appends ghost groups', () => {
        const data = [
            { id: '1', category: 'A' },
            { id: '2', category: 'A' },
            { id: '3', category: 'B' },
        ];
        const { result } = renderHook(() => useManagementGrid({
            data,
            groupBy: 'category',
            ghostGroups: ['C'],
            getVal,
        }));

        expect(result.current.groups).toEqual({
            A: [data[0], data[1]],
            B: [data[2]],
            C: [],
        });
    });

    it('loads records through the host callback', async () => {
        const load = vi.fn(async () => [{ id: '1', category: 'A' }]);
        const { result } = renderHook(() => useManagementGrid({
            load,
            groupBy: 'category',
            ghostGroups: [],
            getVal,
        }));

        await waitFor(() => expect(result.current.groups.A).toHaveLength(1));
        expect(load).toHaveBeenCalledOnce();
    });

    it('passes records to optional item callbacks', async () => {
        const item = { id: '1', category: 'A' };
        const data = [item];
        const ghostGroups: string[] = [];
        const onToggle = vi.fn();
        const onDelete = vi.fn();
        const { result } = renderHook(() => useManagementGrid({
            data,
            groupBy: 'category',
            ghostGroups,
            getVal,
            onToggle,
            onDelete,
        }));

        await act(async () => {
            await result.current.handleToggle(item);
            await result.current.handleDelete(item);
        });

        expect(onToggle).toHaveBeenCalledWith(item);
        expect(onDelete).toHaveBeenCalledWith(item);
    });
});
