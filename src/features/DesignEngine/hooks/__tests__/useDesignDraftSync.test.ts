import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useDesignDraftSync } from '../useDesignDraftSync';
import { SarakDesignState, SarakUIContextType } from '../../../../core/Provider/types';

describe('useDesignDraftSync', () => {
    it('should sync current local draft to sarak provider if different', () => {
        const draftState = { background: '#000' } as unknown as SarakDesignState;
        const setDraftState = vi.fn();
        const setDraftDesign = vi.fn();
        const sarak = {
            draftDesign: { background: '#fff' } as unknown as SarakDesignState,
            setDraftDesign
        } as unknown as SarakUIContextType;
        const isSyncingRef = { current: false };

        renderHook(() => useDesignDraftSync(draftState, setDraftState, sarak, isSyncingRef));

        expect(setDraftDesign).toHaveBeenCalledWith(draftState);
    });

    it('should not sync if isSyncingRef is true', () => {
        const draftState = { background: '#000' } as unknown as SarakDesignState;
        const setDraftState = vi.fn();
        const setDraftDesign = vi.fn();
        const sarak = {
            draftDesign: { background: '#fff' } as unknown as SarakDesignState,
            setDraftDesign
        } as unknown as SarakUIContextType;
        const isSyncingRef = { current: true };

        renderHook(() => useDesignDraftSync(draftState, setDraftState, sarak, isSyncingRef));

        expect(setDraftDesign).not.toHaveBeenCalled();
    });

    it('should clear draft on unmount', () => {
        const draftState = { background: '#000' } as unknown as SarakDesignState;
        const setDraftState = vi.fn();
        const setDraftDesign = vi.fn();
        const sarak = {
            draftDesign: draftState,
            setDraftDesign
        } as unknown as SarakUIContextType;
        const isSyncingRef = { current: false };

        const { unmount } = renderHook(() => useDesignDraftSync(draftState, setDraftState, sarak, isSyncingRef));

        unmount();
        
        expect(setDraftDesign).toHaveBeenCalledWith(null);
    });
});
