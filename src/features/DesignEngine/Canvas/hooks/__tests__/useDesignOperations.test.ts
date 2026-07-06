import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useApplyPreset } from '../useDesignOperations';

describe('useApplyPreset', () => {
    it('em merge parcial (isPartial=true), aplica cada chave via onUpdateDraft e não chama onApplyFullTheme', () => {
        const onUpdateDraft = vi.fn();
        const onApplyFullTheme = vi.fn();
        const { result } = renderHook(() => useApplyPreset(onUpdateDraft, onApplyFullTheme));

        result.current({ cardBorderRadius: 16, cardShadow: 'none' }, true);

        expect(onUpdateDraft).toHaveBeenCalledWith('cardBorderRadius', 16);
        expect(onUpdateDraft).toHaveBeenCalledWith('cardShadow', 'none');
        expect(onApplyFullTheme).not.toHaveBeenCalled();
    });

    it('em aplicação completa (isPartial=false) com onApplyFullTheme disponível, delega o preset inteiro para ele', () => {
        const onUpdateDraft = vi.fn();
        const onApplyFullTheme = vi.fn();
        const { result } = renderHook(() => useApplyPreset(onUpdateDraft, onApplyFullTheme));

        const fullTheme = { primaryColor: '#f97316', mode: 'dark' };
        result.current(fullTheme);

        expect(onApplyFullTheme).toHaveBeenCalledWith(fullTheme);
        expect(onUpdateDraft).not.toHaveBeenCalled();
    });

    it('em aplicação completa sem onApplyFullTheme, cai no fallback e aplica cada chave via onUpdateDraft', () => {
        const onUpdateDraft = vi.fn();
        const { result } = renderHook(() => useApplyPreset(onUpdateDraft));

        result.current({ primaryColor: '#f97316' });

        expect(onUpdateDraft).toHaveBeenCalledWith('primaryColor', '#f97316');
    });
});
