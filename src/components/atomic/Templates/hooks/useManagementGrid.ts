import { useCallback, useEffect, useRef, useState } from 'react';
import { useLibraryText } from '../../../../core/i18n/useLibraryText';

type ItemAction<T> = (item: T) => void | Promise<void>;

interface UseManagementGridOptions<T extends Record<string, unknown>> {
    data?: T[];
    load?: () => Promise<T[]>;
    groupBy: string;
    ghostGroups: string[];
    getVal: (item: T, path: string) => unknown;
    onToggle?: ItemAction<T>;
    onDelete?: ItemAction<T>;
}

type ManagementGridState<T> = {
    data: T[];
    loading: boolean;
    error: string | null;
};

export const useManagementGrid = <T extends Record<string, unknown>>({
    data,
    load,
    groupBy,
    ghostGroups,
    getVal,
    onToggle,
    onDelete,
}: UseManagementGridOptions<T>) => {
    const [state, setState] = useState<ManagementGridState<T>>({
        data: data ?? [],
        loading: data === undefined && Boolean(load),
        error: null,
    });
    const dataRef = useRef(data);
    const loadRef = useRef(load);
    const toggleRef = useRef(onToggle);
    const deleteRef = useRef(onDelete);
    const text = useLibraryText();
    const textRef = useRef(text);
    dataRef.current = data;
    loadRef.current = load;
    toggleRef.current = onToggle;
    deleteRef.current = onDelete;
    textRef.current = text;
    const hasLoad = Boolean(load);
    const hasProvidedData = data !== undefined;

    const loadData = useCallback(async () => {
        if (dataRef.current !== undefined) return;
        const loadFromHost = loadRef.current;
        if (!loadFromHost) {
            setState((current) => current.loading ? { ...current, loading: false } : current);
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
    }, [hasLoad]);

    useEffect(() => {
        if (hasProvidedData) {
            setState((current) => current.loading || current.error
                ? { ...current, loading: false, error: null }
                : current);
            return;
        }
        void loadData();
    }, [hasProvidedData, loadData]);

    const runItemAction = useCallback(async (item: T, action: ItemAction<T> | undefined) => {
        if (!action) return;
        try {
            await action(item);
            if (dataRef.current === undefined) await loadData();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : textRef.current('genericLoadError');
            setState((current) => ({ ...current, error: message }));
        }
    }, [loadData]);

    const sourceData = data ?? state.data;
    const groups = sourceData.reduce<Record<string, T[]>>((result, item) => {
        const name = String(getVal(item, groupBy) ?? '');
        if (!name) return result;
        result[name] = [...(result[name] ?? []), item];
        return result;
    }, {});
    ghostGroups.forEach((groupName) => {
        groups[groupName] ??= [];
    });

    return {
        groups,
        loading: state.loading,
        error: state.error,
        load: loadData,
        handleToggle: (item: T) => runItemAction(item, toggleRef.current),
        handleDelete: (item: T) => runItemAction(item, deleteRef.current),
    };
};
