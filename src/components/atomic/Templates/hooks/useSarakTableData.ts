import { useCallback, useMemo, useState } from 'react';
import { useHostData } from './useHostData';
import type { HostDataResult } from './useHostData';

type LoadData<T> = () => Promise<T[]>;
type TableDataResult<T> = HostDataResult<T[]> & {
    search: string;
    filteredData: T[];
    setSearch: (search: string) => void;
};

export interface SarakTableSearchOptions<T> {
    /** Texto da busca controlado pelo host; omitido, o hook guarda o texto. */
    searchQuery?: string;
    onSearchQueryChange?: (query: string) => void;
    /** Texto exibido das colunas (com formato), além dos valores brutos que a busca sempre olha. */
    displayedText?: (item: T) => string;
}

export const useSarakTableData = <T extends Record<string, unknown>>(
    data?: T[],
    load?: LoadData<T>,
    updatedAt?: Date | string | number,
    searchOptions: SarakTableSearchOptions<T> = {},
): TableDataResult<T> => {
    const hostData = useHostData({ data, load, updatedAt, initialData: [] as T[] });
    const [internalSearch, setInternalSearch] = useState('');
    const { searchQuery, onSearchQueryChange, displayedText } = searchOptions;
    const search = searchQuery ?? internalSearch;
    const filteredData = useMemo(() => {
        const term = search.toLowerCase();
        const matchesRaw = (item: T): boolean => Object.values(item).some((value) => String(value).toLowerCase().includes(term));
        return hostData.data.filter((item) => matchesRaw(item) || (displayedText !== undefined && displayedText(item).toLowerCase().includes(term)));
    }, [hostData.data, search, displayedText]);
    const updateSearch = useCallback((nextSearch: string) => {
        if (searchQuery === undefined) setInternalSearch(nextSearch);
        onSearchQueryChange?.(nextSearch);
    }, [searchQuery, onSearchQueryChange]);

    return { ...hostData, search, filteredData, setSearch: updateSearch };
};
