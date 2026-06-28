import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { usePersistenceState } from '../usePersistenceState';

// Mocar o fetch global para não dar timeout ou quebrar com network real
global.fetch = vi.fn();

describe('usePersistenceState', () => {
    it('should initialize with default states', () => {
        const { result } = renderHook(() => usePersistenceState('http://localhost/api'));
        
        expect(result.current.currentThemeId).toBeNull();
        expect(result.current.currentThemeOrigin).toBe('script');
        expect(result.current.isSaveModalOpen).toBe(false);
    });

    it('should update state via setters', () => {
        const { result } = renderHook(() => usePersistenceState('http://localhost/api'));

        act(() => {
            result.current.setCurrentThemeId('theme-123');
            result.current.setIsSaving(true);
        });

        expect(result.current.currentThemeId).toBe('theme-123');
        expect(result.current.isSaving).toBe(true);
    });

    it('should return null if fetchActiveTheme fails', async () => {
        (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Network error'));
        
        const { result } = renderHook(() => usePersistenceState('http://localhost/api'));

        const activeTheme = await result.current.fetchActiveTheme();
        expect(activeTheme).toBeNull();
    });

    it('should return design payload on successful fetchActiveTheme', async () => {
        const mockDesign = { color: 'blue' };
        (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ data: { design: mockDesign } })
        });
        
        const { result } = renderHook(() => usePersistenceState('http://localhost/api'));

        const activeTheme = await result.current.fetchActiveTheme();
        expect(activeTheme).toEqual(mockDesign);
    });
});
