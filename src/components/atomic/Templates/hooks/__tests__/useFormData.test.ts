import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFormData } from '../useFormData';
import api from '../../../../../shared/services/api';

vi.mock('../../../../../shared/services/api', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        patch: vi.fn(),
    }
}));

describe('useFormData characterization', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('mode create with mapping populates formData initially', () => {
        const initialData = { id: 1 };
        const mapping = { name: 'name', email: 'email' };
        const { result } = renderHook(() => useFormData('/api/test', 'create', initialData, mapping));
        
        expect(result.current.formData).toEqual({ id: 1, name: '', email: '' });
        expect(result.current.loading).toBe(false);
    });

    it('mode edit triggers fetch and populates formData', async () => {
        (api.get as unknown as { mockResolvedValueOnce: (val: unknown) => void }).mockResolvedValueOnce({ data: { id: 2, name: 'Loaded' } });
        const { result } = renderHook(() => useFormData('/api/test', 'edit', {}));
        
        expect(result.current.loading).toBe(true);
        
        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 0));
        });
        
        expect(result.current.loading).toBe(false);
        expect(result.current.formData).toEqual({ id: 2, name: 'Loaded' });
    });

    it('handleChange updates field', () => {
        const { result } = renderHook(() => useFormData('/api/test', 'create', { name: 'A' }));
        
        act(() => {
            result.current.handleChange('name', 'B');
        });
        
        expect(result.current.formData).toEqual({ name: 'B' });
    });

    it('handleSave triggers POST in create mode', async () => {
        (api.post as unknown as { mockResolvedValueOnce: (val: unknown) => void }).mockResolvedValueOnce({ data: 'ok' });
        const { result } = renderHook(() => useFormData('/api/test', 'create', { name: 'A' }));
        
        await act(async () => {
            await result.current.handleSave();
        });
        
        expect(api.post).toHaveBeenCalledWith('/api/test', { name: 'A' });
        expect(result.current.status).toEqual({ type: 'success', message: 'Configurações sincronizadas com sucesso.' });
    });
});
