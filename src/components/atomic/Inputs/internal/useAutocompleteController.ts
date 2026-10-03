import { useId, useMemo, useState } from 'react';
import type {
    ChangeEvent,
    ChangeEventHandler,
    FocusEvent,
    FocusEventHandler,
    KeyboardEventHandler,
} from 'react';
import type { AutocompleteOption } from './autocompleteTypes';
import { useAutocompleteNavigation } from './useAutocompleteNavigation';
import { useAutocompleteSearch } from './useAutocompleteSearch';

export interface AutocompleteControllerState<TOption extends AutocompleteOption> {
    listboxId: string;
    query: string;
    suggestions: TOption[];
    activeIndex: number;
    isOpen: boolean;
    isLoading: boolean;
    hasError: boolean;
    shouldAnnounceEmpty: boolean;
    shouldShowPanel: boolean;
    handleInputChange: ChangeEventHandler<HTMLInputElement>;
    handleFocus: FocusEventHandler<HTMLInputElement>;
    handleBlur: FocusEventHandler<HTMLInputElement>;
    handleKeyDown: KeyboardEventHandler<HTMLInputElement>;
    selectOption: (option: TOption) => void;
    activateOption: (index: number) => void;
}

interface AutocompleteControllerProps<TOption extends AutocompleteOption> {
    options?: TOption[];
    searchOptions?: (query: string) => Promise<TOption[]>;
    debounceMs: number;
    value?: string;
    defaultValue: string;
    disabled?: boolean;
    onChange?: ChangeEventHandler<HTMLInputElement>;
    onOptionSelect?: (option: TOption) => void;
    onFocus?: FocusEventHandler<HTMLInputElement>;
    onBlur?: FocusEventHandler<HTMLInputElement>;
    onKeyDown?: KeyboardEventHandler<HTMLInputElement>;
}

interface AutocompleteQueryState {
    query: string;
    updateQuery: (nextQuery: string) => void;
}

interface AutocompleteSuggestionState<TOption extends AutocompleteOption> {
    suggestions: TOption[];
    isLoading: boolean;
    hasError: boolean;
    normalizedQuery: string;
}

interface AutocompleteInputHandlerDependencies {
    updateQuery: (query: string) => void;
    open: () => void;
    close: () => void;
    onChange?: ChangeEventHandler<HTMLInputElement>;
    onFocus?: FocusEventHandler<HTMLInputElement>;
    onBlur?: FocusEventHandler<HTMLInputElement>;
}

interface AutocompleteInputHandlers {
    handleInputChange: ChangeEventHandler<HTMLInputElement>;
    handleFocus: FocusEventHandler<HTMLInputElement>;
    handleBlur: FocusEventHandler<HTMLInputElement>;
}

const useAutocompleteQuery = (
    value: string | undefined,
    defaultValue: string,
): AutocompleteQueryState => {
    const [internalQuery, setInternalQuery] = useState(defaultValue);
    const query = value ?? internalQuery;
    const updateQuery = (nextQuery: string): void => {
        if (value === undefined) setInternalQuery(nextQuery);
    };
    return { query, updateQuery };
};

const useAutocompleteSuggestions = <TOption extends AutocompleteOption>(
    query: string,
    options: TOption[],
    searchOptions: ((query: string) => Promise<TOption[]>) | undefined,
    debounceMs: number,
): AutocompleteSuggestionState<TOption> => {
    const remoteSearch = useAutocompleteSearch(query, searchOptions, debounceMs);
    const normalizedQuery = query.trim().toLowerCase();
    const localOptions = useMemo(
        () => options.filter((option) => option.label.toLowerCase().includes(normalizedQuery)),
        [normalizedQuery, options],
    );
    return {
        suggestions: searchOptions ? remoteSearch.options : localOptions,
        isLoading: remoteSearch.isLoading,
        hasError: remoteSearch.hasError,
        normalizedQuery,
    };
};

const useAutocompleteInputHandlers = (
    dependencies: AutocompleteInputHandlerDependencies,
): AutocompleteInputHandlers => {
    const handleInputChange: ChangeEventHandler<HTMLInputElement> = (event: ChangeEvent<HTMLInputElement>): void => {
        dependencies.updateQuery(event.target.value);
        dependencies.open();
        dependencies.onChange?.(event);
    };
    const handleFocus: FocusEventHandler<HTMLInputElement> = (event: FocusEvent<HTMLInputElement>): void => {
        dependencies.open();
        dependencies.onFocus?.(event);
    };
    const handleBlur: FocusEventHandler<HTMLInputElement> = (event: FocusEvent<HTMLInputElement>): void => {
        dependencies.close();
        dependencies.onBlur?.(event);
    };
    return { handleInputChange, handleFocus, handleBlur };
};

export const useAutocompleteController = <TOption extends AutocompleteOption>(
    props: AutocompleteControllerProps<TOption>,
): AutocompleteControllerState<TOption> => {
    const {
        options = [], searchOptions, debounceMs, value, defaultValue, disabled,
        onChange, onOptionSelect, onFocus, onBlur, onKeyDown,
    } = props;
    const listboxId = `${useId()}-listbox`;
    const queryState = useAutocompleteQuery(value, defaultValue);
    const searchState = useAutocompleteSuggestions(queryState.query, options, searchOptions, debounceMs);
    const selectOption = (option: TOption): void => {
        queryState.updateQuery(option.label);
        onOptionSelect?.(option);
    };
    const navigation = useAutocompleteNavigation(searchState.suggestions, onKeyDown, selectOption);
    const inputHandlers = useAutocompleteInputHandlers({
        updateQuery: queryState.updateQuery,
        open: navigation.open,
        close: navigation.close,
        onChange, onFocus, onBlur,
    });
    const shouldAnnounceEmpty = shouldAnnounceNoSuggestions(searchState);
    const shouldShowPanel = shouldShowAutocompletePanel({
        disabled,
        isOpen: navigation.isOpen,
        suggestionCount: searchState.suggestions.length,
        isLoading: searchState.isLoading,
        hasError: searchState.hasError,
        shouldAnnounceEmpty,
    });
    return {
        listboxId, query: queryState.query, suggestions: searchState.suggestions,
        activeIndex: navigation.activeIndex, isOpen: navigation.isOpen,
        isLoading: searchState.isLoading, hasError: searchState.hasError,
        shouldAnnounceEmpty, shouldShowPanel, ...inputHandlers,
        handleKeyDown: navigation.handleKeyDown,
        selectOption: (option) => { navigation.close(); selectOption(option); },
        activateOption: navigation.activateOption,
    };
};

const shouldAnnounceNoSuggestions = <TOption extends AutocompleteOption>(
    state: AutocompleteSuggestionState<TOption>,
): boolean => state.normalizedQuery.length > 0 && state.suggestions.length === 0 &&
    !state.isLoading && !state.hasError;

const shouldShowAutocompletePanel = (state: {
    disabled?: boolean;
    isOpen: boolean;
    suggestionCount: number;
    isLoading: boolean;
    hasError: boolean;
    shouldAnnounceEmpty: boolean;
}): boolean => !state.disabled && state.isOpen && (
    state.suggestionCount > 0 || state.isLoading || state.hasError || state.shouldAnnounceEmpty
);
