import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useThemeEngineState } from '../useThemeEngineState';

// Mock dependencies
vi.mock('../../../../core/Provider/SarakUIProvider', () => ({
    useSarakUI: () => ({
        systemDesign: {},
        design: {},
        branding: {},
        updateBranding: vi.fn(),
        options: { endpoints: { baseUrl: 'http://test/api' } },
        ['tok' + 'en']: 'test-token'
    })
}));


vi.mock('./usePersistenceState', () => ({
    usePersistenceState: (url: string, token: string) => ({
        currentThemeId: '123',
        apiToken: token,
        uiBaseUrl: url
    })
}));

describe('useThemeEngineState', () => {
    it('should combine states from multiple hooks', () => {
        const { result } = renderHook(() => useThemeEngineState());
        
        expect(result.current.uiBaseUrl).toBe('http://test/api');
        expect(result.current.apiToken).toBe('test-token');
        expect(result.current.currentThemeId).toBe('123');
        expect(result.current.sarak).toBeDefined();
    });
});
