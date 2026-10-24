import React, {
    useEffect,
    useId,
    useRef,
    useState,
    type Dispatch,
    type RefObject,
    type SetStateAction,
} from 'react';
import { SarakIcon } from '../Icon/SarakIcon';
import { useLibraryText } from '../../../core/i18n/useLibraryText';
import { SarakInput } from '../Inputs/SarakInput';
import type { SarakSearchItem } from '../Inputs/SarakSearch';
import { SarakMenuItem } from './SarakMenuItem';
import { getSearchModifierLabel } from '../Inputs/internal/searchPresentation';
import { useSearchKeyboardNavigation } from '../Inputs/internal/useSearchKeyboardNavigation';
import {
    SarakShellSearchResults,
    type SearchBarState,
    type ShellSearchResultsState,
} from './internal/SarakShellSearchResults';

export interface SarakShellSearchWidgetProps {
    variant?: 'bar' | 'icon';
    items?: SarakSearchItem[];
    onClick: () => void;
    onSelect?: (item: SarakSearchItem) => void;
}

interface ShellSearchState extends ShellSearchResultsState {
    containerRef: RefObject<HTMLDivElement>;
    canShowResults: boolean;
    handleKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
}

const useShellSearchState = (
    items: SarakSearchItem[],
    onSelect?: (item: SarakSearchItem) => void
): ShellSearchState => {
    const [searchState, setSearchState] = useState<SearchBarState>({ query: '', isOpen: false, isInputFocused: false });
    const containerRef = useRef<HTMLDivElement>(null);
    useCloseSearchOnOutsideClick(containerRef, setSearchState);
    const listboxId = 'sarak-shell-search-results-' + useId();
    const getOptionId = (index: number): string => listboxId + '-option-' + index;
    const filteredItems = items.filter((item) =>
        item.label.toLowerCase().includes(searchState.query.toLowerCase()) ||
        item.id.toLowerCase().includes(searchState.query.toLowerCase())
    );
    const canShowResults = searchState.isOpen && searchState.query.length > 0;
    const selectActiveOption = (index: number): void => {
        document.getElementById(getOptionId(index))?.click();
    };
    const keyboardNavigation = useSearchKeyboardNavigation({
        query: searchState.query,
        resultCount: canShowResults ? filteredItems.length : 0,
        onSelectActive: selectActiveOption,
    });
    const selectResult = (item: SarakSearchItem): void => {
        setSearchState({ query: '', isOpen: false, isInputFocused: false });
        onSelect?.(item);
    };

    return {
        ...searchState,
        containerRef,
        listboxId,
        getOptionId,
        filteredItems,
        canShowResults,
        ...keyboardNavigation,
        setSearchState,
        selectResult,
    };
};

const useCloseSearchOnOutsideClick = (
    containerRef: RefObject<HTMLDivElement>,
    setSearchState: Dispatch<SetStateAction<SearchBarState>>
): void => {
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent): void => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setSearchState((current) => ({ ...current, isOpen: false }));
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [containerRef, setSearchState]);
};

const SearchShortcutBadge = ({ searchModifier, className = '' }: { searchModifier: string; className?: string }): React.ReactElement => (
    <kbd
        data-testid="sarak-shell-search-shortcut"
        className={className + ' flex shrink-0 items-center rounded bg-[var(--theme-muted)]/10 border border-[var(--theme-border)] text-[var(--sarak-type-scale-tiny,8px)] text-[var(--theme-muted)] font-black transition-opacity pointer-events-none'}
        style={{
            gap: 'calc(var(--sarak-layout-gap-sm, 8px) * 0.5)',
            paddingInline: 'calc(var(--sarak-layout-gap-sm, 8px) * 0.75)',
            paddingBlock: 'calc(var(--sarak-layout-gap-sm, 8px) * 0.25)',
        }}
    >
        <span>{searchModifier}</span>
        <span aria-hidden="true">+</span>
        <span>K</span>
    </kbd>
);

const SearchIconTrigger = ({ onClick }: { onClick: () => void }): React.ReactElement => {
    const t = useLibraryText();
    const searchModifier = getSearchModifierLabel(typeof navigator === 'undefined' ? '' : navigator.userAgent);

    return (
        <SarakMenuItem
            onClick={onClick}
            className="group font-tab"
            title={t('shellSearchWidgetTitle')}
            icon={<SarakIcon name="Search" size={18} className="text-[var(--theme-muted)] group-hover:text-[var(--theme-primary)]" />}
            label={t('genericSearchLabel')}
        >
            <SearchShortcutBadge searchModifier={searchModifier} className="ml-auto opacity-0 group-hover:opacity-100" />
        </SarakMenuItem>
    );
};

const SearchBar = ({ items, onSelect }: { items: SarakSearchItem[]; onSelect?: (item: SarakSearchItem) => void }): React.ReactElement => {
    const t = useLibraryText();
    const state = useShellSearchState(items, onSelect);
    const searchModifier = getSearchModifierLabel(typeof navigator === 'undefined' ? '' : navigator.userAgent);

    return (
        <div className="hidden md:flex items-center w-80 min-w-0 max-w-full group relative @container" ref={state.containerRef}>
            <div className="flex w-full min-w-0 items-center" style={{ gap: 'var(--sarak-layout-gap-md, 16px)' }}>
                <SarakInput
                    type="search"
                    enterKeyHint="search"
                    role="combobox"
                    aria-autocomplete="list"
                    aria-controls={state.canShowResults ? state.listboxId : undefined}
                    aria-expanded={state.canShowResults}
                    aria-activedescendant={state.canShowResults && state.filteredItems.length > 0 ? state.getOptionId(state.activeIndex) : undefined}
                    value={state.query}
                    placeholder={t('shellSearchWidgetPlaceholder')}
                    onChange={(event) => state.setSearchState((current) => ({ ...current, query: event.target.value, isOpen: true }))}
                    onFocus={() => state.setSearchState((current) => ({ ...current, isInputFocused: true, isOpen: true }))}
                    onBlur={() => state.setSearchState((current) => ({ ...current, isInputFocused: false }))}
                    onKeyDown={state.handleKeyDown}
                    leftIcon={<SarakIcon name="Search" size={14} className="text-[var(--theme-muted)] group-focus-within:text-[var(--theme-primary)] transition-colors" />}
                    fullWidth
                    className="min-w-0 flex-1"
                />
                {!state.isInputFocused && state.query.length === 0 && (
                    <SearchShortcutBadge searchModifier={searchModifier} className="@max-xs:hidden" />
                )}
            </div>
            {state.canShowResults && <SarakShellSearchResults state={state} onSelect={onSelect} />}
        </div>
    );
};

export const SarakShellSearchWidget = (props: SarakShellSearchWidgetProps): React.ReactElement => {
    const variant = props.variant ?? 'bar';
    if (variant === 'icon') return <SearchIconTrigger onClick={props.onClick} />;
    return <SearchBar items={props.items ?? []} onSelect={props.onSelect} />;
};

export default SarakShellSearchWidget;
