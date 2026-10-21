import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useFormData } from '../useFormData';

describe('useFormData', () => {
    it('uses initial data and mapping in create mode', () => {
        const { result } = renderHook(() => useFormData({
            initialData: { id: 1 },
            mode: 'create',
            mapping: { name: 'Name', email: 'Email' },
        }));

        expect(result.current.formData).toEqual({ id: 1, name: '', email: '' });
        expect(result.current.loading).toBe(false);
    });

    it('loads edit data through the host callback', async () => {
        const load = vi.fn(async () => ({ id: 2, name: 'Loaded' }));
        const { result } = renderHook(() => useFormData({ initialData: { id: 0, name: '' }, mode: 'edit', load }));

        await waitFor(() => expect(result.current.formData).toEqual({ id: 2, name: 'Loaded' }));
        expect(result.current.loading).toBe(false);
    });

    it('updates a field and submits through the host callback', async () => {
        const onSubmit = vi.fn();
        const onSuccess = vi.fn();
        const { result } = renderHook(() => useFormData({
            initialData: { name: 'A' },
            mode: 'create',
            onSubmit,
            onSuccess,
        }));

        act(() => result.current.handleChange('name', 'B'));
        await act(async () => result.current.handleSave());

        expect(onSubmit).toHaveBeenCalledWith({ name: 'B' });
        expect(onSuccess).toHaveBeenCalledOnce();
        expect(result.current.status?.type).toBe('success');
    });

    it('surfaces submit failures', async () => {
        const { result } = renderHook(() => useFormData({
            initialData: { name: 'A' },
            mode: 'create',
            onSubmit: async () => { throw new Error('Rejected'); },
        }));

        await act(async () => result.current.handleSave());
        expect(result.current.status).toEqual({ type: 'error', message: 'Rejected' });
        expect(result.current.saving).toBe(false);
    });
});
