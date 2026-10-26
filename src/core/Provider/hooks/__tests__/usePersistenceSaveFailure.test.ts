import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { usePersistenceSaveFailure } from '../usePersistenceSaveFailure';

describe('usePersistenceSaveFailure', () => {
    it('incrementa a contagem somente quando a instância registra uma falha', () => {
        const { result } = renderHook(() => usePersistenceSaveFailure());

        expect(result.current.failureCount).toBe(0);

        act(() => result.current.recordFailure());
        expect(result.current.failureCount).toBe(1);

        act(() => result.current.recordFailure());
        expect(result.current.failureCount).toBe(2);
    });
});
