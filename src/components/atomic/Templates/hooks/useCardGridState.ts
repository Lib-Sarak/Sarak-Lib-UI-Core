import { useCallback, useState } from 'react';
import { useHostData } from './useHostData';
import type { HostDataResult } from './useHostData';

type LoadData<T> = () => Promise<T[]>;
type FilterUpdater = (current: Record<string, string>) => Record<string, string>;
type CardGridStateResult<T> = HostDataResult<T[]> & {
    search: string;
    activeFilters: Record<string, string>;
    setSearch: (search: string) => void;
    setActiveFilters: (update: FilterUpdater) => void;
};

export const useCardGridState = <T extends Record<string, unknown>>(
    data?: T[],
    load?: LoadData<T>,
    updatedAt?: Date | string | number,
): CardGridStateResult<T> => {
    const hostData = useHostData({ data, load, updatedAt, initialData: [] as T[] });
    const [search, setSearch] = useState('');
    const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
    const updateFilters = useCallback((update: FilterUpdater) => setActiveFilters(update), []);

    return { ...hostData, search, activeFilters, setSearch, setActiveFilters: updateFilters };
};
