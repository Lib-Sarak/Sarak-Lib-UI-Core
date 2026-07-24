import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useThemeEngineState } from '../useThemeEngineState';

// Mock dependencies
vi.mock('../../../../../core/Provider/SarakUIProvider', () => ({
    useSarakUI: () => ({
        systemDesign: {},
        design: {},
        branding: {},
        updateBranding: vi.fn(),
        options: {},
        token: null
    })
}));

vi.mock('../usePersistenceState', () => ({
    usePersistenceState: () => ({
        currentThemeName: 'Meu Tema',
        isSaveModalOpen: false,
        isSaving: false
    })
}));

describe('useThemeEngineState (Spec 44 — sem backend próprio)', () => {
    it('combina o estado dos hooks internos sem uiBaseUrl/apiToken', () => {
        const { result } = renderHook(() => useThemeEngineState());

        expect(result.current.sarak).toBeDefined();
        expect(result.current.currentThemeName).toBe('Meu Tema');
        expect(result.current).not.toHaveProperty('uiBaseUrl');
        expect(result.current).not.toHaveProperty('apiToken');
    });
});
