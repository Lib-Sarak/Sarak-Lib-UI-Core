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
    /** Só o ícone, sem rótulo (lateral recolhida); nas linhas de menu o rótulo segue à vista. */
    compact?: boolean;
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

/**
 * O atalho não é escrito na tela: fica declarado para a tecnologia assistiva. O gatilho em si (Ctrl/Cmd+K) é do
 * cromo (`useSearchShortcut`); aqui só se anuncia a combinação da plataforma.
 */
const getSearchKeyShortcut = (): string =>
    getSearchModifierLabel(typeof navigator === 'undefined' ? '' : navigator.userAgent) === '⌘' ? 'Meta+K' : 'Control+K';

const SearchIconTrigger = ({ onClick, className = '', compact = false }: { onClick: () => void; className?: string; compact?: boolean }): React.ReactElement => {
    const t = useLibraryText();

    return (
        <SarakMenuItem
            onClick={onClick}
            className={'group font-tab ' + className}
            title={t('shellSearchWidgetTitle')}
            collapsed={compact}
            aria-keyshortcuts={getSearchKeyShortcut()}
            icon={<SarakIcon name="Search" size={18} className="text-[var(--theme-muted)] group-hover:text-[var(--theme-primary)]" />}
            label={t('genericSearchLabel')}
        />
    );
};

const SearchBar = ({ items, onSelect, onClick }: { items: SarakSearchItem[]; onSelect?: (item: SarakSearchItem) => void; onClick: () => void }): React.ReactElement => {
    const t = useLibraryText();
    const state = useShellSearchState(items, onSelect);

    return (
        <div className="hidden md:flex items-center w-80 min-w-0 max-w-full group relative @container" ref={state.containerRef}>
            {/* Sem espaço para a caixa (contêiner abaixo do mínimo útil do campo), vira o ícone que abre a busca. */}
            {/* sarak-allow-hardcode: o menor contêiner útil do campo (10rem) não tem nome nem token. */}
            <div className="hidden w-full @max-[10rem]:block"><SearchIconTrigger onClick={onClick} /></div>
            {/* sarak-allow-hardcode: o mesmo limite do gatilho acima. */}
            <div className="w-full min-w-0 @max-[10rem]:hidden"><div className="flex w-full min-w-0 items-center">
                <SarakInput
                    type="search"
                    enterKeyHint="search"
                    role="combobox"
                    aria-autocomplete="list"
                    aria-controls={state.canShowResults ? state.listboxId : undefined}
                    aria-expanded={state.canShowResults}
                    aria-keyshortcuts={getSearchKeyShortcut()}
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
            </div></div>
            {state.canShowResults && <SarakShellSearchResults state={state} onSelect={onSelect} />}
        </div>
    );
};

export const SarakShellSearchWidget = (props: SarakShellSearchWidgetProps): React.ReactElement => {
    const variant = props.variant ?? 'bar';
    if (variant === 'icon') return <SearchIconTrigger onClick={props.onClick} compact={props.compact} />;
    return <SearchBar items={props.items ?? []} onSelect={props.onSelect} onClick={props.onClick} />;
};

export default SarakShellSearchWidget;
