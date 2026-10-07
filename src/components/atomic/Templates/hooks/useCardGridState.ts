import { useCallback, useEffect, useRef, useState } from 'react';
import { useLibraryText } from '../../../../core/i18n/useLibraryText';

type CardGridState<T> = {
    data: T[];
    loading: boolean;
    error: string | null;
    search: string;
    activeFilters: Record<string, string>;
};

type LoadData<T> = () => Promise<T[]>;

export const useCardGridState = <T extends Record<string, unknown>>(
    data?: T[],
    load?: LoadData<T>,
) => {
    const [state, setState] = useState<CardGridState<T>>({
        data: data ?? [],
        loading: data === undefined && Boolean(load),
        error: null,
        search: '',
        activeFilters: {},
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

    const setSearch = useCallback((search: string) => {
        setState((current) => ({ ...current, search }));
    }, []);
    const setActiveFilters = useCallback((update: (current: Record<string, string>) => Record<string, string>) => {
        setState((current) => ({ ...current, activeFilters: update(current.activeFilters) }));
    }, []);

    return { ...state, setSearch, setActiveFilters, loadData };
};
