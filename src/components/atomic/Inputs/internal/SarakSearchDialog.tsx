import React from 'react';
import { motion, useIsPresent } from 'framer-motion';
import { SarakIcon } from '../../Icon/SarakIcon';
import { SarakInput } from '../SarakInput';
import { SarakLink } from '../../Navigation/SarakLink';
import { SarakFlex } from '../../Layouts/SarakFlex';
import { useLibraryText } from '../../../../core/i18n/useLibraryText';
import { useSarakUIOptional } from '../../../../core/Provider/SarakUIProvider';
import { useMotionTokens } from '../../hooks/useMotionTokens';
import { getSearchModifierLabel, getSarakSearchItemSubtitle } from './searchPresentation';
import { SarakSearchFooter } from './SarakSearchFooter';
import type { SarakSearchItem, SearchPaletteState } from '../SarakSearch';

type SearchMotionTiming = ReturnType<typeof useMotionTokens>;

interface SearchPaletteProps {
    onClose: () => void;
    onSelect?: (id: string) => void;
    state: SearchPaletteState;
}

interface SarakSearchDialogProps extends SearchPaletteProps {
    panelStyle: React.CSSProperties;
}

interface SearchPanelProps extends SarakSearchDialogProps {
    searchStyle?: string;
    systemName?: string;
    searchModifier: string;
    timing: SearchMotionTiming;
}

interface SearchOptionProps {
    item: SarakSearchItem;
    index: number;
    isActive: boolean;
    state: SearchPaletteState;
    onClose: () => void;
    onSelect?: (id: string) => void;
}

const SearchFrame = ({ children }: { children: React.ReactNode }): React.ReactElement => {
    const isPresent = useIsPresent();
    const frameClass = 'fixed inset-0 z-[calc(var(--sarak-z-sidebar,500)_+_200)] flex items-start justify-center pt-[10vh]' +
        (isPresent ? '' : ' pointer-events-none');

    return (
        <div className={frameClass} style={{ paddingLeft: 'var(--sarak-layout-gap-md,16px)', paddingRight: 'var(--sarak-layout-gap-md,16px)' }}>
            {children}
        </div>
    );
};

const SearchBackdrop = ({ searchStyle, timing, onClose }: Pick<SearchPanelProps, 'searchStyle' | 'timing' | 'onClose'>): React.ReactElement => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { ease: timing.easeIn, duration: timing.durations.fast } }}
        onClick={onClose}
        className={'absolute inset-0 bg-[var(--color-theme-card,#101622)]/' + (searchStyle === 'minimal' ? '20' : '60') + ' backdrop-blur-[var(--sarak-search-backdrop-blur,8px)]'}
    />
);

const SearchInputArea = ({ searchModifier, state }: Pick<SearchPanelProps, 'searchModifier' | 'state'>): React.ReactElement => {
    const t = useLibraryText();

    return (
        <div
            className="flex items-center border-b border-[var(--border-color,rgba(255,255,255,0.09))] bg-[var(--color-theme-title,#f2f6fb)]/[0.02]"
            style={{ gap: 'var(--sarak-layout-gap-md,16px)', padding: 'calc(var(--sarak-layout-gap-md,16px) * 1.25) var(--sarak-layout-gap-lg, 24px)' }}
        >
            <SarakIcon name="Search" className="w-5 h-5 text-[var(--text-muted,rgba(242,246,251,0.55))]" />
            <SarakInput
                type="search"
                enterKeyHint="search"
                role="combobox"
                aria-autocomplete="list"
                aria-controls={state.listboxId}
                aria-expanded="true"
                aria-activedescendant={state.filteredItems.length > 0 ? state.getOptionId(state.activeIndex) : undefined}
                aria-label={t('searchFieldAriaLabel')}
                value={state.query}
                onChange={(event) => state.setQuery(event.target.value)}
                onKeyDown={state.handleKeyDown}
                placeholder={t('searchPlaceholder')}
                autoFocus
                fullWidth
                className="min-w-0 flex-1"
                style={{ background: 'transparent', fontSize: 'var(--sarak-type-scale-xl, 20px)' }}
            />
            <kbd
                data-testid="sarak-search-shortcut"
                className="flex shrink-0 items-center rounded-[calc(var(--radius-theme)*0.5)] bg-[var(--sarak-primary-color,#19e3f0)]/10 border border-[var(--sarak-primary-color,#19e3f0)]/20 text-2xs text-[var(--sarak-primary-color,#19e3f0)] font-bold uppercase tracking-widest"
                style={{ gap: 'calc(var(--sarak-layout-gap-md,16px) * 0.375)', padding: 'calc(var(--sarak-layout-gap-md,16px) * 0.25) var(--sarak-layout-gap-sm, 8px)' }}
            >
                <span>{searchModifier}</span>
                <span aria-hidden="true">+</span>
                <span>K</span>
            </kbd>
        </div>
    );
};

const SearchOption = ({
    item,
    index,
    isActive,
    state,
    onClose,
    onSelect,
}: SearchOptionProps): React.ReactElement => {
    const subtitle = getSarakSearchItemSubtitle(item);
    const activeClass = isActive ? 'bg-[var(--sarak-primary-color,#19e3f0)]/10' : 'hover:bg-[var(--sarak-primary-color,#19e3f0)]/5';
    const className = 'group h-14 flex items-center justify-between rounded-[calc(var(--radius-theme)*0.8)] transition-all w-full !text-[var(--color-theme-title,#f2f6fb)] no-underline hover:no-underline ' + activeClass;

    return (
        <SarakLink
            id={state.getOptionId(index)}
            role="option"
            tabIndex={-1}
            aria-selected={isActive}
            aria-label={item.label + (subtitle ? ' ' + subtitle : '')}
            href={item.id}
            onMouseEnter={() => state.setActiveIndex(index)}
            onNavigate={onSelect ? state.selectItem : undefined}
            onClick={!onSelect ? onClose : undefined}
            className={className}
            style={{ paddingLeft: 'var(--sarak-layout-gap-md,16px)', paddingRight: 'var(--sarak-layout-gap-md,16px)' }}
        >
            <div className="flex min-w-0 items-center" style={{ gap: 'var(--sarak-layout-gap-md,16px)' }}>
                {item.icon && <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center">{item.icon}</span>}
                <SarakFlex direction="column" wrap={false} className="min-w-0">
                    <span className="truncate text-sm font-bold text-[var(--color-theme-title,#f2f6fb)]/80 group-hover:text-[var(--sarak-primary-color,#19e3f0)]">{item.label}</span>
                    {subtitle && <span className="truncate text-2xs text-[var(--text-muted,rgba(242,246,251,0.55))] uppercase tracking-widest">{subtitle}</span>}
                </SarakFlex>
            </div>
            <SarakIcon name="ArrowRight" className="w-4 h-4 shrink-0 text-[var(--text-muted,rgba(242,246,251,0.55))] opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
        </SarakLink>
    );
};

const SearchResults = ({ state, onClose, onSelect }: SearchPaletteProps): React.ReactElement => {
    const t = useLibraryText();

    return (
        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar" style={{ padding: 'var(--sarak-layout-gap-sm, 8px)' }}>
            {state.filteredItems.length > 0 && (
                <div style={{ paddingTop: 'var(--sarak-layout-gap-sm, 8px)', paddingBottom: 'var(--sarak-layout-gap-sm, 8px)' }}>
                    <h4 className="text-2xs font-black uppercase text-[var(--text-muted,rgba(242,246,251,0.55))]" style={{ paddingLeft: 'var(--sarak-layout-gap-md,16px)', paddingRight: 'var(--sarak-layout-gap-md,16px)', marginBottom: 'var(--sarak-layout-gap-sm, 8px)', letterSpacing: 'var(--sarak-tracking-tight, 0.2em)' }}>{t('searchAvailableToolsHeading')}</h4>
                </div>
            )}
            <div id={state.listboxId} role="listbox">
                {state.filteredItems.map((item, index) => (
                    <SearchOption
                        key={item.id}
                        item={item}
                        index={index}
                        isActive={index === state.activeIndex}
                        state={state}
                        onClose={onClose}
                        onSelect={onSelect}
                    />
                ))}
            </div>
            {state.filteredItems.length === 0 && <SearchEmptyState query={state.query} />}
        </div>
    );
};

const SearchEmptyState = ({ query }: { query: string }): React.ReactElement => {
    const t = useLibraryText();

    return (
        <div className="flex items-center justify-center text-center opacity-20" style={{ flexDirection: 'column', paddingTop: 'calc(var(--sarak-layout-gap-md,16px) * 5)', paddingBottom: 'calc(var(--sarak-layout-gap-md,16px) * 5)' }}>
            <SarakIcon name="Search" className="w-12 h-12 text-[var(--color-theme-title,#f2f6fb)]" style={{ marginBottom: 'var(--sarak-layout-gap-md,16px)' }} />
            <span role="status" className="text-sm font-black uppercase tracking-widest text-[var(--color-theme-title,#f2f6fb)]">{t('searchNoResultsFor', { query })}</span>
        </div>
    );
};

const SearchPanel = ({
    searchStyle,
    systemName,
    searchModifier,
    timing,
    onClose,
    onSelect,
    state,
    panelStyle,
}: SearchPanelProps): React.ReactElement => (
    <>
        <SearchBackdrop searchStyle={searchStyle} timing={timing} onClose={onClose} />
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20, transition: { ease: timing.easeIn, duration: timing.durations.fast } }}
            className="relative w-full bg-[var(--color-theme-card,#101622)] border border-[var(--border-color,rgba(255,255,255,0.09))] rounded-[var(--radius-theme)] shadow-[var(--dynamic-shadow)] overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-label={useLibraryText()('searchAvailableToolsHeading')}
            style={panelStyle}
        >
            <SearchInputArea searchModifier={searchModifier} state={state} />
            <SearchResults state={state} onClose={onClose} onSelect={onSelect} />
            <SarakSearchFooter systemName={systemName} />
        </motion.div>
    </>
);

export const SarakSearchDialog = (props: SarakSearchDialogProps): React.ReactElement => {
    const { design } = useSarakUIOptional() || {};
    const timing = useMotionTokens();
    const searchModifier = getSearchModifierLabel(typeof navigator === 'undefined' ? '' : navigator.userAgent);

    return (
        <SearchFrame>
            <SearchPanel
                searchStyle={design?.searchStyle}
                systemName={design?.systemName}
                searchModifier={searchModifier}
                timing={timing}
                panelStyle={props.panelStyle}
                onClose={props.onClose}
                onSelect={props.onSelect}
                state={props.state}
            />
        </SearchFrame>
    );
};
