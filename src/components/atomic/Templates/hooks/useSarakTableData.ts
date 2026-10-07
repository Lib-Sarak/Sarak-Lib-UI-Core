import { useCallback, useEffect, useRef, useState } from 'react';
import { useLibraryText } from '../../../../core/i18n/useLibraryText';

type TableDataState<T> = {
    data: T[];
    loading: boolean;
    error: string | null;
    search: string;
};

type LoadData<T> = () => Promise<T[]>;

export const useSarakTableData = <T extends Record<string, unknown>>(
    data?: T[],
    load?: LoadData<T>,
) => {
    const [state, setState] = useState<TableDataState<T>>({
        data: data ?? [],
        loading: data === undefined && Boolean(load),
        error: null,
        search: '',
    });
    const loadRef = useRef(load);
    const text = useLibraryText();
    const textRef = useRef(text);
    loadRef.current = load;
    textRef.current = text;
    const hasLoad = Boolean(load);

    const loadData = useCallback(async () => {
        if (data !== undefined) {
            setState((current) => ({ ...current, data, loading: false, error: null }));
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
            setState((current) => ({ ...current, data: nextData, loading: false, error: null }));
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : textRef.current('genericLoadError');
            setState((current) => ({ ...current, loading: false, error: message }));
        }
    }, [data, hasLoad]);

    useEffect(() => {
        void loadData();
    }, [loadData]);

    const filteredData = state.data.filter((item) =>
        Object.values(item).some((value) =>
            String(value).toLowerCase().includes(state.search.toLowerCase()),
        ),
    );

    return {
        ...state,
        filteredData,
        setSearch: (search: string) => setState((current) => ({ ...current, search })),
        loadData,
    };
};
