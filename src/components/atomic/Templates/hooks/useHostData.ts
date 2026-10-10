import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { useLibraryText } from '../../../../core/i18n/useLibraryText';
import { parseDataTimestamp } from './dataTimestamp';

interface HostDataState<T> {
    data: T;
    loading: boolean;
    error: string | null;
    updatedAt: Date | null;
}

interface UseHostDataOptions<T> {
    data?: T;
    load?: () => Promise<T>;
    updatedAt?: Date | string | number;
    initialData: T;
}

export interface HostDataResult<T> extends HostDataState<T> {
    loadData: () => Promise<void>;
}

interface LoadHostDataOptions<T> {
    data: T | undefined;
    hasLoad: boolean;
    updatedAt?: Date | string | number;
    loadRef: { current: (() => Promise<T>) | undefined };
    textRef: { current: ReturnType<typeof useLibraryText> };
    setState: Dispatch<SetStateAction<HostDataState<T>>>;
}

async function loadHostData<T>({ data, hasLoad, updatedAt, loadRef, textRef, setState }: LoadHostDataOptions<T>): Promise<void> {
    if (data !== undefined) {
        setState((current) => ({ ...current, data, loading: false, error: null, updatedAt: parseDataTimestamp(updatedAt) }));
        return;
    }
    const loadFromHost = hasLoad ? loadRef.current : undefined;
    if (!loadFromHost) {
        setState((current) => ({ ...current, loading: false }));
        return;
    }
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
        const nextData = await loadFromHost();
        setState((current) => ({ ...current, data: nextData, loading: false, error: null, updatedAt: new Date() }));
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : textRef.current('genericLoadError');
        setState((current) => ({ ...current, loading: false, error: message }));
    }
}

export function useHostData<T>({ data, load, updatedAt, initialData }: UseHostDataOptions<T>): HostDataResult<T> {
    const [state, setState] = useState<HostDataState<T>>({
        data: data === undefined ? initialData : data,
        loading: data === undefined && Boolean(load),
        error: null,
        updatedAt: data === undefined ? null : parseDataTimestamp(updatedAt),
    });
    const loadRef = useRef(load);
    const text = useLibraryText();
    const textRef = useRef(text);
    const hasLoad = Boolean(load);
    loadRef.current = load;
    textRef.current = text;
    const loadData = useCallback(
        () => loadHostData({ data, hasLoad, updatedAt, loadRef, textRef, setState }),
        [data, hasLoad, updatedAt],
    );

    useEffect(() => {
        void loadData();
    }, [loadData]);

    return { ...state, loadData };
}
