import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { Dispatch, MutableRefObject, SetStateAction } from 'react';

interface SearchOption {
    value: string;
    label: string;
}

type SearchOptionsCallback<TOption extends SearchOption> = (query: string) => Promise<TOption[]>;

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
    searchOptionsRef: MutableRefObject<SearchOptionsCallback<TOption> | undefined>;
    requestId: number;
    latestRequestId: MutableRefObject<number>;
    setSearchState: Dispatch<SetStateAction<AutocompleteSearchState<TOption>>>;
}

const loadSearchOptions = async <TOption extends SearchOption>(request: SearchRequest<TOption>): Promise<void> => {
    const searchOptions = request.searchOptionsRef.current;
    if (!searchOptions) return;
    try {
        const results: unknown = await searchOptions(request.query);
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
    const searchOptionsRef = useRef(searchOptions);
    const hasSearchOptions = searchOptions !== undefined;
    const [searchState, setSearchState] = useState<AutocompleteSearchState<TOption>>(
        createEmptySearchState<TOption>,
    );

    useLayoutEffect(() => {
        searchOptionsRef.current = searchOptions;
    }, [searchOptions]);

    useEffect(() => {
        if (!hasSearchOptions || query.trim().length === 0) {
            latestRequestId.current += 1;
            setSearchState(createEmptySearchState<TOption>());
            return;
        }
        const request = {
            query,
            searchOptionsRef,
            requestId: ++latestRequestId.current,
            latestRequestId,
            setSearchState,
        };
        const safeDelay = Number.isFinite(debounceMs)
            ? Math.max(0, debounceMs)
            : DEFAULT_AUTOCOMPLETE_DEBOUNCE_MS;
        setSearchState({ options: [], isLoading: true, hasError: false });
        return scheduleSearch(request, safeDelay);
    }, [debounceMs, hasSearchOptions, query]);

    return searchState;
};
