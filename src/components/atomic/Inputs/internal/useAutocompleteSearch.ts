import { useEffect, useRef, useState } from 'react';
import type { Dispatch, MutableRefObject, SetStateAction } from 'react';

interface SearchOption {
    value: string;
    label: string;
}

interface AutocompleteSearchState<TOption extends SearchOption> {
    options: TOption[];
    isLoading: boolean;
    hasError: boolean;
}

export const DEFAULT_AUTOCOMPLETE_DEBOUNCE_MS = 300;

const createEmptySearchState = <TOption extends SearchOption>(): AutocompleteSearchState<TOption> => ({
    options: [],
    isLoading: false,
    hasError: false,
});

const isSearchOption = (option: unknown): option is SearchOption => {
    if (typeof option !== 'object' || option === null) return false;
    const candidate = option as Record<string, unknown>;
    return typeof candidate.value === 'string' && typeof candidate.label === 'string';
};

const isSearchOptionList = <TOption extends SearchOption>(value: unknown): value is TOption[] =>
    Array.isArray(value) && value.every(isSearchOption);

interface SearchRequest<TOption extends SearchOption> {
    query: string;
    searchOptions: (query: string) => Promise<TOption[]>;
    requestId: number;
    latestRequestId: MutableRefObject<number>;
    setSearchState: Dispatch<SetStateAction<AutocompleteSearchState<TOption>>>;
}

const loadSearchOptions = async <TOption extends SearchOption>(request: SearchRequest<TOption>): Promise<void> => {
    try {
        const results: unknown = await request.searchOptions(request.query);
        if (request.requestId !== request.latestRequestId.current) return;
        if (!isSearchOptionList<TOption>(results)) {
            request.setSearchState({ options: [], isLoading: false, hasError: true });
            return;
        }
        request.setSearchState({ options: results, isLoading: false, hasError: false });
    } catch {
        if (request.requestId !== request.latestRequestId.current) return;
        request.setSearchState({ options: [], isLoading: false, hasError: true });
    }
};

const scheduleSearch = <TOption extends SearchOption>(
    request: SearchRequest<TOption>,
    delay: number,
): (() => void) => {
    const timeoutId = setTimeout(() => { void loadSearchOptions(request); }, delay);
    return () => {
        clearTimeout(timeoutId);
        request.latestRequestId.current += 1;
    };
};

export const useAutocompleteSearch = <TOption extends SearchOption>(
    query: string,
    searchOptions: ((query: string) => Promise<TOption[]>) | undefined,
    debounceMs: number,
): AutocompleteSearchState<TOption> => {
    const latestRequestId = useRef(0);
    const [searchState, setSearchState] = useState<AutocompleteSearchState<TOption>>(
        createEmptySearchState<TOption>,
    );

    useEffect(() => {
        if (!searchOptions || query.trim().length === 0) {
            latestRequestId.current += 1;
            setSearchState(createEmptySearchState<TOption>());
            return;
        }
        const request = {
            query,
            searchOptions,
            requestId: ++latestRequestId.current,
            latestRequestId,
            setSearchState,
        };
        const safeDelay = Number.isFinite(debounceMs)
            ? Math.max(0, debounceMs)
            : DEFAULT_AUTOCOMPLETE_DEBOUNCE_MS;
        setSearchState({ options: [], isLoading: true, hasError: false });
        return scheduleSearch(request, safeDelay);
    }, [debounceMs, query, searchOptions]);

    return searchState;
};
