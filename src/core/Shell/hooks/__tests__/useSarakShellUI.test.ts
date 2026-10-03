import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSarakShellUI } from '../useSarakShellUI';

const mockApplyConfig = vi.fn();
const mockUpdatePreferences = vi.fn();

vi.mock('../../../Provider/SarakUIProvider', () => ({
    useSarakUI: () => ({
        design: { isNavHidden: false },
        applyConfig: mockApplyConfig,
        updatePreferences: mockUpdatePreferences,
    }),
}));

describe('useSarakShellUI', () => {
    it('toggleNav grava a PREFERÊNCIA de recolhimento, nunca o tema', () => {
        const { result } = renderHook(() => useSarakShellUI());

        act(() => {
            result.current.toggleNav();
        });

        expect(mockUpdatePreferences).toHaveBeenCalledWith({ navCollapsed: true });
        expect(mockApplyConfig).not.toHaveBeenCalled();
    });
});
