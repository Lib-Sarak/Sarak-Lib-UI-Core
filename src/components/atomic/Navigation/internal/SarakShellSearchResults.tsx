import React, { type Dispatch, type SetStateAction } from 'react';
import { SarakIcon } from '../../Icon/SarakIcon';
import type { SarakSearchItem } from '../../Inputs/SarakSearch';
import { getSarakSearchItemSubtitle } from '../../Inputs/internal/searchPresentation';
import { useLibraryText } from '../../../../core/i18n/useLibraryText';
import { SarakLink } from '../SarakLink';
import { SarakFlex } from '../../Layouts/SarakFlex';

export interface SearchBarState {
    query: string;
    isOpen: boolean;
    isInputFocused: boolean;
}

export interface ShellSearchResultsState extends SearchBarState {
    listboxId: string;
    getOptionId: (index: number) => string;
    filteredItems: SarakSearchItem[];
    activeIndex: number;
    setActiveIndex: Dispatch<SetStateAction<number>>;
    setSearchState: Dispatch<SetStateAction<SearchBarState>>;
    selectResult: (item: SarakSearchItem) => void;
}

interface SearchResultsProps {
    state: ShellSearchResultsState;
    onSelect?: (item: SarakSearchItem) => void;
}

interface SearchOptionProps extends SearchResultsProps {
    item: SarakSearchItem;
    index: number;
}

const SearchEmptyState = ({ query }: { query: string }): React.ReactElement => {
    const t = useLibraryText();

    return (
        <div className="flex items-center justify-center text-center opacity-40" style={{ paddingBlock: 'calc(var(--sarak-layout-gap-md, 16px) * 2.5)', flexDirection: 'column' }}>
            <SarakIcon name="Search" className="w-8 h-8 text-[var(--theme-text-primary,var(--sarak-text-main,#f2f6fb))]" style={{ marginBottom: 'var(--sarak-layout-gap-sm, 8px)' }} />
            <span role="status" className="text-xs font-black uppercase tracking-widest text-[var(--theme-text-primary,var(--sarak-text-main,#f2f6fb))]">{t('searchNoResultsFor', { query })}</span>
        </div>
    );
};

const SearchResultOption = ({ item, index, state, onSelect }: SearchOptionProps): React.ReactElement => {
    const subtitle = getSarakSearchItemSubtitle(item);
    const isActive = index === state.activeIndex;
    const activeClass = isActive ? 'bg-[var(--theme-primary)]/10' : 'hover:bg-[var(--theme-primary)]/5';
    const resultClassName = 'group h-12 flex items-center justify-between rounded-[calc(var(--radius-theme)*0.8)] transition-all w-full !text-[var(--theme-title)] no-underline hover:no-underline ' + activeClass;

    return (
        <SarakLink
            id={state.getOptionId(index)}
            role="option"
            tabIndex={-1}
            aria-selected={isActive}
            aria-label={item.label + (subtitle ? ' ' + subtitle : '')}
            href={item.id}
            onMouseEnter={() => state.setActiveIndex(index)}
            onNavigate={onSelect ? () => state.selectResult(item) : undefined}
            onClick={!onSelect ? () => state.setSearchState({ query: '', isOpen: false, isInputFocused: false }) : undefined}
            className={resultClassName}
            style={{ paddingInline: 'var(--sarak-layout-gap-md, 16px)' }}
        >
            <div className="flex min-w-0 items-center" style={{ gap: 'calc(var(--sarak-layout-gap-sm, 8px) * 1.5)' }}>
                {item.icon && <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center">{item.icon}</span>}
                <SarakFlex direction="column" wrap={false} className="min-w-0">
                    <span className="truncate text-xs font-bold text-[var(--theme-title)]/80 group-hover:text-[var(--theme-primary)]">{item.label}</span>
                    {subtitle && <span className="truncate text-3xs text-[var(--sarak-subtitle-color,var(--theme-subtitle,#f2f6fb))] uppercase tracking-widest">{subtitle}</span>}
                </SarakFlex>
            </div>
            <SarakIcon name="ArrowRight" className="w-3 h-3 shrink-0 text-[var(--theme-muted)] opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
        </SarakLink>
    );
};

export const SarakShellSearchResults = ({ state, onSelect }: SearchResultsProps): React.ReactElement => {
    const t = useLibraryText();

    return (
        <div className="absolute top-[calc(100%+var(--sarak-search-dropdown-gap,0.5rem))] left-0 w-[var(--sarak-search-dropdown-width,400px)] bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-[var(--radius-theme)] shadow-[var(--dynamic-shadow)] overflow-hidden z-[calc(var(--sarak-z-sidebar,500)_+_100)]">
            <div className="max-h-[60vh] overflow-y-auto custom-scrollbar" style={{ padding: 'var(--sarak-layout-gap-sm, 8px)' }}>
                {state.filteredItems.length > 0 && (
                    <div style={{ paddingBlock: 'var(--sarak-layout-gap-sm, 8px)' }}>
                        <h4 className="text-2xs font-black uppercase tracking-[var(--sarak-tracking-tight,0.2em)] text-[var(--theme-title,var(--sarak-title-color,#f2f6fb))]" style={{ paddingInline: 'var(--sarak-layout-gap-md, 16px)', marginBottom: 'var(--sarak-layout-gap-sm, 8px)' }}>
                            {t('shellSearchResultsHeading')}
                        </h4>
                    </div>
                )}
                <div id={state.listboxId} role="listbox">
                    {state.filteredItems.map((item, index) => (
                        <SearchResultOption key={item.id} item={item} index={index} state={state} onSelect={onSelect} />
                    ))}
                </div>
                {state.filteredItems.length === 0 && <SearchEmptyState query={state.query} />}
            </div>
        </div>
    );
};
