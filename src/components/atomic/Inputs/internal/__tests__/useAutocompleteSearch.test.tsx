import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useAutocompleteSearch } from '../useAutocompleteSearch';

const SEARCH_RESULT = [{ value: 'finance', label: 'Financeiro' }];

describe('useAutocompleteSearch', () => {
    afterEach(() => vi.useRealTimers());

    it('aguarda o debounce antes de chamar a busca fornecida pelo host', async () => {
        vi.useFakeTimers();
        const searchOptions = vi.fn(async () => SEARCH_RESULT);
        const { result } = renderHook(() => useAutocompleteSearch(' fin ', searchOptions, 200));

        expect(result.current.isLoading).toBe(true);
        expect(searchOptions).not.toHaveBeenCalled();

        await act(async () => { await vi.advanceTimersByTimeAsync(200); });

        expect(searchOptions).toHaveBeenCalledWith(' fin ');
        expect(result.current.options).toEqual(SEARCH_RESULT);
        expect(result.current.isLoading).toBe(false);
    });

    it('converte rejeição da busca em estado de erro visível ao componente', async () => {
        vi.useFakeTimers();
        const searchOptions = vi.fn(async () => { throw new Error('erro do host'); });
        const { result } = renderHook(() => useAutocompleteSearch('fin', searchOptions, 0));

        await act(async () => { await vi.advanceTimersByTimeAsync(0); });

        expect(result.current.hasError).toBe(true);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.options).toEqual([]);
    });
});
