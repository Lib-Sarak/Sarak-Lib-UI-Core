import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { usePersistenceState } from '../usePersistenceState';

describe('usePersistenceState (Spec 44 — sem backend próprio)', () => {
    it('inicializa com os defaults esperados', () => {
        const { result } = renderHook(() => usePersistenceState());

        expect(result.current.currentThemeName).toBe('');
        expect(result.current.isSaveModalOpen).toBe(false);
        expect(result.current.isSaving).toBe(false);
    });

    it('atualiza o estado via os setters', () => {
        const { result } = renderHook(() => usePersistenceState());

        act(() => {
            result.current.setCurrentThemeName('Meu Tema');
            result.current.setIsSaveModalOpen(true);
            result.current.setIsSaving(true);
        });

        expect(result.current.currentThemeName).toBe('Meu Tema');
        expect(result.current.isSaveModalOpen).toBe(true);
        expect(result.current.isSaving).toBe(true);
    });
});
