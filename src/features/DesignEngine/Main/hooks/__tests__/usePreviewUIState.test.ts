// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import * as HookModule from '../usePreviewUIState';

describe('usePreviewUIState', () => {
    it('should export the hook correctly', () => {
        expect(HookModule).toBeDefined();
    });

    it('inicia em Essencial e permite selecionar Impacto e Completo', () => {
        const { result } = renderHook(() => HookModule.usePreviewUIState());

        expect(result.current.editMode).toBe('essential');

        act(() => result.current.setEditMode('impact'));
        expect(result.current.editMode).toBe('impact');

        act(() => result.current.setEditMode('complete'));
        expect(result.current.editMode).toBe('complete');
    });
});
