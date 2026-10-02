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

describe('useAutocompleteSearch callback stability', () => {
    it('mantém a busca ao trocar a função e usa a mais recente na consulta seguinte', async () => {
        vi.useFakeTimers();
        const originalSearchOptions = vi.fn(async () => SEARCH_RESULT);
        const latestSearchOptions = vi.fn(async () => SEARCH_RESULT);
        const { result, rerender } = renderHook(
            ({ query, searchOptions }) => useAutocompleteSearch(query, searchOptions, 200),
            { initialProps: { query: 'fin', searchOptions: originalSearchOptions } },
        );

        await act(async () => { await vi.advanceTimersByTimeAsync(200); });

        expect(originalSearchOptions).toHaveBeenCalledTimes(1);
        expect(result.current.isLoading).toBe(false);

        rerender({ query: 'fin', searchOptions: latestSearchOptions });

        expect(result.current.options).toEqual(SEARCH_RESULT);
        expect(result.current.isLoading).toBe(false);

        await act(async () => { await vi.advanceTimersByTimeAsync(200); });

        expect(originalSearchOptions).toHaveBeenCalledTimes(1);
        expect(latestSearchOptions).not.toHaveBeenCalled();
        expect(result.current.isLoading).toBe(false);

        rerender({ query: 'finance', searchOptions: latestSearchOptions });
        await act(async () => { await vi.advanceTimersByTimeAsync(200); });

        expect(latestSearchOptions).toHaveBeenCalledWith('finance');
        expect(result.current.options).toEqual(SEARCH_RESULT);
        expect(result.current.isLoading).toBe(false);
    });
});
