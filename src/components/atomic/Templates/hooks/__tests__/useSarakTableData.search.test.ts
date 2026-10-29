import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useSarakTableData } from '../useSarakTableData';

const data = [{ id: 1, amount: 1000 }, { id: 2, amount: 200 }];
const displayedText = (item: { amount: number }): string => `R$ ${item.amount === 1000 ? '1.000,00' : '200,00'}`;

describe('useSarakTableData — busca', () => {
    it('sem opções filtra pelos valores brutos, como na rc.3', () => {
        const { result } = renderHook(() => useSarakTableData(data));
        act(() => result.current.setSearch('1000'));
        expect(result.current.filteredData).toEqual([data[0]]);
        act(() => result.current.setSearch('1.000'));
        expect(result.current.filteredData).toEqual([]);
    });

    it('displayedText acrescenta o texto formatado à busca', () => {
        const { result } = renderHook(() => useSarakTableData(data, undefined, undefined, { displayedText }));
        act(() => result.current.setSearch('1.000'));
        expect(result.current.filteredData).toEqual([data[0]]);
        act(() => result.current.setSearch('1000'));
        expect(result.current.filteredData).toEqual([data[0]]);
    });

    it('searchQuery controla o termo e onSearchQueryChange avisa sem mudar o estado', () => {
        const onSearchQueryChange = vi.fn();
        const { result } = renderHook(() => useSarakTableData(data, undefined, undefined, { searchQuery: '200', onSearchQueryChange }));
        expect(result.current.search).toBe('200');
        expect(result.current.filteredData).toEqual([data[1]]);
        act(() => result.current.setSearch('1000'));
        expect(onSearchQueryChange).toHaveBeenCalledWith('1000');
        expect(result.current.search).toBe('200');
    });
});
