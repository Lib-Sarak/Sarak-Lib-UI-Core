import React from 'react';
import type { AutocompleteOption } from './autocompleteTypes';
import type { AutocompleteControllerState } from './useAutocompleteController';

interface AutocompleteOptionRowProps<TOption extends AutocompleteOption> {
    option: TOption;
    id: string;
    isActive: boolean;
    onActivate: () => void;
    onSelect: () => void;
}

interface AutocompleteOptionsListProps<TOption extends AutocompleteOption> {
    listboxId: string;
    suggestions: TOption[];
    activeIndex: number;
    onActivate: (index: number) => void;
    onSelect: (option: TOption) => void;
}

interface AutocompleteSearchStatusProps {
    isLoading: boolean;
    hasError: boolean;
    shouldAnnounceEmpty: boolean;
}

interface AutocompletePopupProps<TOption extends AutocompleteOption> {
    state: AutocompleteControllerState<TOption>;
}

const DEFAULT_LOADING_TEXT = 'Carregando sugestões...';
const DEFAULT_EMPTY_TEXT = 'Nenhuma sugestão encontrada.';
const DEFAULT_SEARCH_ERROR_TEXT = 'Não foi possível carregar as sugestões.';

const AutocompleteOptionRow = <TOption extends AutocompleteOption,>(
    props: AutocompleteOptionRowProps<TOption>,
): React.ReactElement => {
    const { option, id, isActive, onActivate, onSelect } = props;
    return (
        <li
            id={id}
            role="option"
            aria-selected={isActive}
            onMouseMove={onActivate}
            onMouseDown={(event) => event.preventDefault()}
            onClick={onSelect}
            className="cursor-pointer text-sm text-[var(--sarak-input-text-color,var(--text-muted,#94a3b8))]"
            style={{
                padding: 'var(--sarak-layout-gap-sm, 8px) var(--sarak-layout-gap-md, 16px)',
                backgroundColor: isActive ? 'var(--sarak-primary-color, #3b82f6)' : 'transparent',
            }}
        >
            {option.label}
        </li>
    );
};

const AutocompleteOptionsList = <TOption extends AutocompleteOption,>(
    props: AutocompleteOptionsListProps<TOption>,
): React.ReactElement => {
    const { listboxId, suggestions, activeIndex, onActivate, onSelect } = props;
    return (
        <ul
            id={listboxId}
            role="listbox"
            style={{ margin: 0, padding: 'var(--sarak-layout-gap-sm, 8px) 0', listStyle: 'none' }}
        >
            {suggestions.map((option, index) => (
                <AutocompleteOptionRow
                    key={`${option.value}-${index}`}
                    option={option}
                    id={`${listboxId}-option-${index}`}
                    isActive={index === activeIndex}
                    onActivate={() => onActivate(index)}
                    onSelect={() => onSelect(option)}
                />
            ))}
        </ul>
    );
};

const AutocompleteSearchStatus = (props: AutocompleteSearchStatusProps): React.ReactElement | null => {
    const { isLoading, hasError, shouldAnnounceEmpty } = props;
    const statusText = isLoading
        ? DEFAULT_LOADING_TEXT
        : hasError
            ? DEFAULT_SEARCH_ERROR_TEXT
            : shouldAnnounceEmpty ? DEFAULT_EMPTY_TEXT : '';
    if (!statusText) return null;
    return (
        <p
            role={hasError ? 'alert' : 'status'}
            aria-live={hasError ? 'assertive' : 'polite'}
            style={{ margin: 0, padding: 'var(--sarak-layout-gap-sm, 8px)' }}
        >
            {statusText}
        </p>
    );
};

export const AutocompletePopup = <TOption extends AutocompleteOption,>(
    props: AutocompletePopupProps<TOption>,
): React.ReactElement => {
    const { state } = props;
    return (
        <div
            hidden={!state.shouldShowPanel}
            className="rounded-input border shadow-lg"
            style={{
                position: 'absolute',
                zIndex: 'var(--sarak-z-base, 10)',
                width: '100%',
                maxHeight: 'calc(var(--sarak-layout-gap-lg, 24px) * 12)',
                overflowY: 'auto',
                marginTop: 'var(--sarak-layout-gap-sm, 8px)',
                borderColor: 'var(--sarak-input-border-color, var(--theme-border, #334155))',
                backgroundColor: 'var(--sarak-input-bg, var(--theme-card, #1e293b))',
            }}
        >
            <AutocompleteOptionsList
                listboxId={state.listboxId}
                suggestions={state.suggestions}
                activeIndex={state.activeIndex}
                onActivate={state.activateOption}
                onSelect={state.selectOption}
            />
            <AutocompleteSearchStatus
                isLoading={state.isLoading}
                hasError={state.hasError}
                shouldAnnounceEmpty={state.shouldAnnounceEmpty}
            />
        </div>
    );
};
