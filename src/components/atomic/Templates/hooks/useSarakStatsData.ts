import { useHostData } from './useHostData';
import type { HostDataResult } from './useHostData';

type LoadStats<T> = () => Promise<T>;
type StatsDataResult<T> = Omit<HostDataResult<T>, 'data'> & { stats: T };

export function useSarakStatsData<T extends Record<string, unknown>>(
    data?: T,
    load?: LoadStats<T>,
    updatedAt?: Date | string | number,
): StatsDataResult<T> {
    const hostData = useHostData({ data, load, updatedAt, initialData: {} as T });
    return { stats: hostData.data, loading: hostData.loading, error: hostData.error, updatedAt: hostData.updatedAt, loadData: hostData.loadData };
}
