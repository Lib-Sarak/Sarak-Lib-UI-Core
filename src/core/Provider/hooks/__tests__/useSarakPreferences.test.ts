import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSarakPreferences } from '../useSarakPreferences';

const mockUseSarakUI = vi.fn();
vi.mock('../../SarakUIProvider', () => ({
    useSarakUI: () => mockUseSarakUI(),
}));

describe('useSarakPreferences (hook público)', () => {
    it('expõe só `preferences`/`updatePreferences`, lidos de `useSarakUI`', () => {
        const updatePreferences = vi.fn();
        mockUseSarakUI.mockReturnValue({
            preferences: { colorMode: 'dark' },
            updatePreferences,
            design: {}, // ruído do contexto real — não deve vazar para o hook público
        });

        const { result } = renderHook(() => useSarakPreferences());

        expect(result.current).toEqual({ preferences: { colorMode: 'dark' }, updatePreferences });
    });
});
