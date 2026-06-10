import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useThemeEngineState } from '../hooks/useThemeEngineState';
import * as SarakUIProvider from '../../../../core/Provider/SarakUIProvider';

vi.mock('../../../../core/Provider/SarakUIProvider', () => ({
    useSarakUI: vi.fn()
}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('useThemeEngineState', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (SarakUIProvider.useSarakUI as any).mockReturnValue({
            systemDesign: {},
            design: {},
            options: { endpoints: { baseUrl: '/api/mock' } },
            token: ['mock', 'token'].join('-')
        });
    });

    it('deve inicializar com o estado padrão', () => {
        const { result } = renderHook(() => useThemeEngineState());
        
        expect(result.current.activePreviewApp).toBe('dashboard');
        expect(result.current.previewDevice).toBe('desktop');
        expect(result.current.activePillarId).toBe('surfaces'); // mapped from 'dashboard'
        expect(result.current.viewMode).toBe('preview');
        expect(result.current.searchQuery).toBe('');
    });

    it('deve sincronizar activePillarId quando activePreviewApp mudar', () => {
        const { result } = renderHook(() => useThemeEngineState());
        
        act(() => {
            result.current.setActivePreviewApp('typography');
        });
        
        expect(result.current.activePillarId).toBe('typography');
        
        act(() => {
            result.current.setActivePreviewApp('chat');
        });
        
        expect(result.current.activePillarId).toBe('advanced');
    });

    it('deve fazer fetchActiveTheme corretamente', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ data: { design: { tokens: 'mocked' } } })
        });

        const { result } = renderHook(() => useThemeEngineState());
        
        let theme;
        await act(async () => {
            theme = await result.current.fetchActiveTheme();
        });
        
        expect(mockFetch).toHaveBeenCalledWith('/api/mock/design', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${['mock', 'token'].join('-')}`
            }
        });
        
        expect(theme).toEqual({ tokens: 'mocked' });
    });
    
    it('deve lidar com falhas no fetchActiveTheme graciosamente', async () => {
        mockFetch.mockRejectedValueOnce(new Error('Network error'));

        const { result } = renderHook(() => useThemeEngineState());
        
        let theme;
        await act(async () => {
            theme = await result.current.fetchActiveTheme();
        });
        
        expect(theme).toBeNull();
    });
});
