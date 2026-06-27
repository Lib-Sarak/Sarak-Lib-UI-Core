import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useManagementGrid } from '../useManagementGrid';
import api from '../../../../../shared/services/api';

vi.mock('../../../../../shared/services/api', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        delete: vi.fn(),
    }
}));

describe('useManagementGrid characterization', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('groups data correctly and adds ghost groups', async () => {
        const mockData = [
            { id: '1', category: 'A' },
            { id: '2', category: 'A' },
            { id: '3', category: 'B' },
        ];
        (api.get as unknown as { mockResolvedValueOnce: (val: unknown) => void }).mockResolvedValueOnce({ data: mockData });
        
        const getVal = (obj: Record<string, unknown>, path: string) => obj[path];
        
        const { result } = renderHook(() => 
            useManagementGrid('/api/grid', 'category', ['C'], getVal)
        );
        
        expect(result.current.loading).toBe(true);
        
        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 0));
        });
        
        expect(result.current.loading).toBe(false);
        expect(result.current.groups).toEqual({
            'A': [{ id: '1', category: 'A' }, { id: '2', category: 'A' }],
            'B': [{ id: '3', category: 'B' }],
            'C': [] // ghost group
        });
    });

    it('handleAction sets activeModal correctly', () => {
        const getVal = (obj: Record<string, unknown>, path: string) => obj[path];
        const { result } = renderHook(() => 
            useManagementGrid('/api/grid', 'category', [], getVal)
        );
        
        act(() => {
            result.current.handleAction('add_item', 'A');
        });
        
        expect(result.current.activeModal).toEqual({ type: 'add_item', group: 'A' });
    });
});
