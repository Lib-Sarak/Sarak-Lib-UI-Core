import { useCallback, useMemo, useState } from 'react';
import { useHostData } from './useHostData';
import type { HostDataResult } from './useHostData';

type LoadData<T> = () => Promise<T[]>;
type TableDataResult<T> = HostDataResult<T[]> & {
    search: string;
    filteredData: T[];
    setSearch: (search: string) => void;
};

export const useSarakTableData = <T extends Record<string, unknown>>(
    data?: T[],
    load?: LoadData<T>,
    updatedAt?: Date | string | number,
): TableDataResult<T> => {
    const hostData = useHostData({ data, load, updatedAt, initialData: [] as T[] });
    const [search, setSearch] = useState('');
    const filteredData = useMemo(
        () => hostData.data.filter((item) => Object.values(item).some((value) => String(value).toLowerCase().includes(search.toLowerCase()))),
        [hostData.data, search],
    );
    const updateSearch = useCallback((nextSearch: string) => setSearch(nextSearch), []);

    return { ...hostData, search, filteredData, setSearch: updateSearch };
};
