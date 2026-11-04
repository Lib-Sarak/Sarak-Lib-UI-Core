import { useEffect, useRef, useState } from 'react';
import type { SarakTableSort } from './columnModel';
import type { SarakColumnState } from './tableColumnState';

/** `searchQuery` a tabela aplica; as demais chaves voltam ao consumidor sem interpretação. */
export interface SarakTableViewFilters {
    searchQuery?: string;
    [key: string]: unknown;
}

export interface SarakTableView {
    id: string;
    label: string;
    filters?: SarakTableViewFilters;
    columnState?: SarakColumnState;
    sort?: SarakTableSort | null;
}

export interface UseTableViewsOptions {
    views?: SarakTableView[];
    /** Id da visão atual (controlado); `null` é o padrão; omitido, a tabela gerencia. */
    activeView?: string | null;
    onViewChange?: (viewId: string | null, view: SarakTableView | null) => void;
    onViewSave?: (view: SarakTableView) => void;
    onSearchQueryChange?: (query: string) => void;
    query: string | undefined;
    setQuery: (query: string) => void;
    columnState: SarakColumnState;
    commitColumns: (next: SarakColumnState) => void;
    resetColumns: () => void;
    sort: SarakTableSort | null;
    applySort: (sort: SarakTableSort | null) => void;
}

export interface TableViews {
    enabled: boolean;
    views: SarakTableView[];
    activeId: string | null;
    select: (viewId: string | null) => void;
    saveAs: (label: string) => void;
}

const applyView = (options: UseTableViewsOptions, view: SarakTableView | null): void => {
    if (view?.columnState) options.commitColumns(view.columnState);
    else options.resetColumns();
    options.applySort(view?.sort ?? null);
    const query = view?.filters?.searchQuery ?? '';
    options.setQuery(query);
    options.onSearchQueryChange?.(query);
};

const findView = (views: SarakTableView[] | undefined, viewId: string | null): SarakTableView | null =>
    views?.find((view) => view.id === viewId) ?? null;

/** Mesmo nome sobrescreve a visão existente; nome novo ganha um id novo. */
const viewIdFor = (views: SarakTableView[], label: string): string =>
    views.find((view) => view.label === label)?.id ?? `view-${Date.now().toString(36)}`;

/** Visões salvas: guardam filtros, colunas e ordenação; quem persiste é o consumidor, em `onViewSave`. */
export const useTableViews = (options: UseTableViewsOptions): TableViews => {
    const [internal, setInternal] = useState<string | null>(null);
    const activeId = options.activeView !== undefined ? options.activeView : internal;
    const applied = useRef<string | null>(null);
    const latest = useRef(options);
    latest.current = options;
    // A visão pedida pode chegar depois do id, ao carregar da API: espera por ela sem tocar no estado da tela.
    useEffect(() => {
        if (applied.current === activeId) return;
        const view = findView(latest.current.views, activeId);
        if (activeId !== null && view === null) return;
        applied.current = activeId;
        applyView(latest.current, view);
    }, [activeId, options.views]);
    const select = (viewId: string | null): void => {
        if (options.activeView === undefined) setInternal(viewId);
        options.onViewChange?.(viewId, findView(options.views, viewId));
    };
    const saveAs = (label: string): void => {
        const views = options.views ?? [];
        const filters = { ...findView(views, activeId)?.filters, searchQuery: options.query ?? '' };
        const view: SarakTableView = { id: viewIdFor(views, label), label, filters, columnState: options.columnState, sort: options.sort };
        // A visão nova já é o estado da tela: nada a reaplicar quando ela vira a atual.
        applied.current = view.id;
        options.onViewSave?.(view);
        select(view.id);
    };
    return { enabled: options.views !== undefined, views: options.views ?? [], activeId, select, saveAs };
};
