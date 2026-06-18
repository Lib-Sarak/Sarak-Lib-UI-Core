import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useSarakDrafting } from '../useSarakDrafting';

describe('useSarakDrafting', () => {
    it('should route smartApplyConfig correctly when not drafting', () => {
        const design = { color: 'red' };
        const applyConfig = vi.fn();
        const applyFullConfig = vi.fn();

        const { result } = renderHook(() => useSarakDrafting(design, applyConfig, applyFullConfig));

        act(() => {
            result.current.smartApplyConfig({ color: 'blue' });
        });

        // Should call global provider because not drafting
        expect(applyConfig).toHaveBeenCalledWith({ color: 'blue' });
        expect(result.current.draftDesign).toBeNull();
    });

    it('should route smartApplyConfig to draftDesign when drafting is active', () => {
        const design = { color: 'red' };
        const applyConfig = vi.fn();
        const applyFullConfig = vi.fn();

        const { result } = renderHook(() => useSarakDrafting(design, applyConfig, applyFullConfig));

        act(() => {
            result.current.setIsDrafting(true);
        });

        act(() => {
            result.current.smartApplyConfig({ color: 'blue' });
        });

        // Should NOT call global provider because drafting is true
        expect(applyConfig).not.toHaveBeenCalled();
        expect(result.current.draftDesign).toEqual({ color: 'blue' }); // Merged over design
    });

    it('should lock drafting synchronously', () => {
        const design = { color: 'red' };
        const applyConfig = vi.fn();
        const applyFullConfig = vi.fn();

        const { result } = renderHook(() => useSarakDrafting(design, applyConfig, applyFullConfig));

        act(() => {
            result.current.lockDrafting(); // sets Ref to true sync
            result.current.smartApplyFullConfig({ color: 'green' });
        });

        expect(applyFullConfig).not.toHaveBeenCalled();
        expect(result.current.draftDesign).toEqual({ color: 'green' });
    });
});
