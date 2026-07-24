import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useThemeEngineState } from '../hooks/useThemeEngineState';
import * as SarakUIProvider from '../../../../core/Provider/SarakUIProvider';

vi.mock('../../../../core/Provider/SarakUIProvider', () => ({
    useSarakUI: vi.fn()
}));

describe('useThemeEngineState (Spec 44 — sem backend próprio)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (SarakUIProvider.useSarakUI as any).mockReturnValue({
            systemDesign: {},
            design: {},
            options: {},
            token: null
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

    it('não expõe mais `uiBaseUrl`/`apiToken`/`fetchActiveTheme` (a persistência é local, sem backend)', () => {
        const { result } = renderHook(() => useThemeEngineState());

        expect(result.current).not.toHaveProperty('uiBaseUrl');
        expect(result.current).not.toHaveProperty('apiToken');
        expect(result.current).not.toHaveProperty('fetchActiveTheme');
    });
});
