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
        expect(result.current.panelView).toEqual({ kind: 'home' });
        expect(result.current.viewMode).toBe('preview');
        expect(result.current.searchQuery).toBe('');
    });

    it('selecionar uma tela muda só a prévia; a coluna fica onde estava', () => {
        const { result } = renderHook(() => useThemeEngineState());
        act(() => { result.current.openDecision('fonts'); });

        act(() => { result.current.selectPreviewApp('chat'); });

        expect(result.current.activePreviewApp).toBe('chat');
        expect(result.current.panelView).toMatchObject({ kind: 'decision', id: 'fonts' });
    });

    it('não expõe mais `uiBaseUrl`/`apiToken`/`fetchActiveTheme` (a persistência é local, sem backend)', () => {
        const { result } = renderHook(() => useThemeEngineState());

        expect(result.current).not.toHaveProperty('uiBaseUrl');
        expect(result.current).not.toHaveProperty('apiToken');
        expect(result.current).not.toHaveProperty('fetchActiveTheme');
    });
});
