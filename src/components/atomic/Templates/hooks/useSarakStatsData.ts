import { useCallback, useEffect, useRef, useState } from 'react';
import { useLibraryText } from '../../../../core/i18n/useLibraryText';

type StatsDataState<T> = {
    stats: T;
    loading: boolean;
    error: string | null;
};

type LoadStats<T> = () => Promise<T>;

export function useSarakStatsData<T extends Record<string, unknown>>(
    data?: T,
    load?: LoadStats<T>,
) {
    const [state, setState] = useState<StatsDataState<T>>({
        stats: data ?? ({} as T),
        loading: data === undefined && Boolean(load),
        error: null,
    });
    const loadRef = useRef(load);
    const text = useLibraryText();
    const textRef = useRef(text);
    loadRef.current = load;
    textRef.current = text;
    const hasLoad = Boolean(load);

    const loadData = useCallback(async () => {
        if (data !== undefined) {
            setState((current) => ({ ...current, stats: data, loading: false, error: null }));
            return;
        }
        const loadFromHost = loadRef.current;
        if (!loadFromHost) {
            setState((current) => ({ ...current, loading: false }));
            return;
        }
        setState((current) => ({ ...current, loading: true, error: null }));
        try {
            const stats = await loadFromHost();
            setState((current) => ({ ...current, stats, loading: false, error: null }));
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : textRef.current('genericLoadError');
            setState((current) => ({ ...current, loading: false, error: message }));
        }
    }, [data, hasLoad]);

    useEffect(() => {
        void loadData();
    }, [loadData]);

    return { ...state, loadData };
}
