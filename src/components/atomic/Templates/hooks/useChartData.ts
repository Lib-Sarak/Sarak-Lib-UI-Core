import { useCallback, useEffect, useRef, useState } from 'react';
import { useLibraryText } from '../../../../core/i18n/useLibraryText';

type ChartDataState<T> = {
    data: T[];
    loading: boolean;
    error: string | null;
};

type LoadChartData<T> = () => Promise<T[]>;

export const useChartData = <T extends Record<string, unknown>>(
    data?: T[],
    load?: LoadChartData<T>,
) => {
    const [state, setState] = useState<ChartDataState<T>>({
        data: data ?? [],
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
            setState({ data, loading: false, error: null });
            return;
        }
        const loadFromHost = loadRef.current;
        if (!loadFromHost) {
            setState((current) => ({ ...current, loading: false }));
            return;
        }
        setState((current) => ({ ...current, loading: true, error: null }));
        try {
            const nextData = await loadFromHost();
            setState({ data: nextData, loading: false, error: null });
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : textRef.current('genericLoadError');
            setState((current) => ({ ...current, loading: false, error: message }));
        }
    }, [data, hasLoad]);

    useEffect(() => {
        void loadData();
    }, [loadData]);

    return { ...state, loadData };
};
