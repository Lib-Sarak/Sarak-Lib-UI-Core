import { useHostData } from './useHostData';
import type { HostDataResult } from './useHostData';

type LoadChartData<T> = () => Promise<T[]>;

export const useChartData = <T extends Record<string, unknown>>(
    data?: T[],
    load?: LoadChartData<T>,
    updatedAt?: Date | string | number,
): HostDataResult<T[]> => useHostData({ data, load, updatedAt, initialData: [] as T[] });
