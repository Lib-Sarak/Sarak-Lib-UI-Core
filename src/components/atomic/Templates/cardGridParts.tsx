import type { ReactElement } from 'react';
import type { SarakCardGridProps, SarakFilterConfig } from './SarakCardGrid';
import { useLibraryText } from '../../../core/i18n/useLibraryText';
import { SarakInput, SarakSelect } from '../Inputs';
import { SarakButton } from '../Buttons';
import { SarakIcon } from '../Icon/SarakIcon';
import { SarakCoreCard } from './components/SarakCoreCard';
import { SarakDataEmpty } from '../Feedback/SarakDataEmpty';
import { SarakDataErrorNotice } from './SarakDataErrorNotice';
import { useStructuralStyles } from '../hooks/useStructuralStyles';
import { useResponsiveStyles } from '../hooks/useResponsiveStyles';

type FilterSetter = (update: (current: Record<string, string>) => Record<string, string>) => void;

function getPathValue<TData extends Record<string, unknown>>(item: TData, path?: string): unknown {
    if (!path) return undefined;
    return path.split('.').reduce((current: unknown, part) => (
        current && typeof current === 'object' ? (current as Record<string, unknown>)[part] : undefined
    ), item as unknown);
}

function getDynamicOptions<TData extends Record<string, unknown>>(records: TData[], field: string): { label: string; value: string }[] {
    const values = new Set(records.map((item) => getPathValue(item, field)).filter(Boolean).map(String));
    return Array.from(values).sort().map((value) => ({ label: value, value }));
}

interface FilterCardGridOptions<TData extends Record<string, unknown>> {
    records: TData[];
    mapping: SarakCardGridProps<TData>['mapping'];
    filters: SarakFilterConfig[];
    search: string;
    activeFilters: Record<string, string>;
}

export function filterCardGridRecords<TData extends Record<string, unknown>>({ records, mapping, filters, search, activeFilters }: FilterCardGridOptions<TData>): TData[] {
    return records.filter((item) => {
        const title = mapping ? String(getPathValue(item, mapping.title) || '') : '';
        const subtitle = mapping?.subtitle ? String(getPathValue(item, mapping.subtitle) || '') : '';
        const matchesSearch = title.toLowerCase().includes(search.toLowerCase()) || subtitle.toLowerCase().includes(search.toLowerCase());
        const matchesFilters = Object.entries(activeFilters).every(([id, value]) => {
            if (!value || value === 'all') return true;
            const filter = filters.find((candidate) => candidate.id === id);
            if (!filter) return true;
            const itemValue = getPathValue(item, filter.field);
            return Array.isArray(itemValue) ? itemValue.includes(value) : String(itemValue) === value;
        });
        return matchesSearch && matchesFilters;
    });
}

interface CardGridSearchProps {
    search: string;
    setSearch: (value: string) => void;
}

function CardGridSearch({ search, setSearch }: CardGridSearchProps): ReactElement {
    const text = useLibraryText();
    return <div className="flex items-center" style={{ gap: 'calc(var(--sarak-layout-gap-md,16px) / 2)' }}>
        <div className="w-full md:w-80">
            <SarakInput type="text" placeholder={text('searchPlaceholder')} value={search} onChange={(event) => setSearch(event.target.value)} leftIcon={<SarakIcon name="Search" size={16} />} />
        </div>
    </div>;
}

interface CardGridFilterProps<TData extends Record<string, unknown>> {
    mainFilter?: SarakFilterConfig;
    sideFilters: SarakFilterConfig[];
    records: TData[];
    activeFilters: Record<string, string>;
    setActiveFilters: FilterSetter;
}

function CardGridTabFilter<TData extends Record<string, unknown>>({ mainFilter, records, activeFilters, setActiveFilters }: CardGridFilterProps<TData>): ReactElement | null {
    const text = useLibraryText();
    if (!mainFilter) return null;
    const options = mainFilter.options || (mainFilter.dynamic ? getDynamicOptions(records, mainFilter.field) : []);
    return <div className="flex flex-wrap" style={{ gap: 'var(--sarak-layout-gap-sm,8px)' }}>
        {['all', ...options.map((option) => typeof option === 'string' ? option : option.value)].map((option) => (
            <SarakButton key={option} onClick={() => setActiveFilters((current) => ({ ...current, [mainFilter.id]: option }))} variant={(activeFilters[mainFilter.id] || 'all') === option ? 'primary' : 'secondary'} className={(activeFilters[mainFilter.id] || 'all') === option ? 'shadow-lg shadow-[var(--sarak-shadow-glow,rgba(59,130,246,0.5))]' : ''}>
                {option === 'all' ? text('filterShowAll', { label: mainFilter.label }) : option}
            </SarakButton>
        ))}
    </div>;
}

function CardGridSelectFilters<TData extends Record<string, unknown>>({ sideFilters, records, activeFilters, setActiveFilters }: CardGridFilterProps<TData>): ReactElement | null {
    const text = useLibraryText();
    if (sideFilters.length === 0) return null;
    return <div className="flex flex-wrap" style={{ gap: 'var(--sarak-layout-gap-md, 16px)' }}>
        {sideFilters.map((filter) => {
            const options = filter.options || (filter.dynamic ? getDynamicOptions(records, filter.field) : []);
            return <div key={filter.id} className="relative group min-w-[var(--sarak-catalog-filter-min-width,160px)]">
                <SarakSelect value={activeFilters[filter.id] || 'all'} onChange={(event) => setActiveFilters((current) => ({ ...current, [filter.id]: event.target.value }))} className="w-full text-2xs font-black text-[var(--text-muted,#94a3b8)] opacity-60 uppercase tracking-widest cursor-pointer">
                    <option value="all">{text('filterShowAll', { label: filter.label })}</option>
                    {options.map((option) => {
                        const value = typeof option === 'string' ? option : option.value;
                        const label = typeof option === 'string' ? option : option.label;
                        return <option key={value} value={value}>{label}</option>;
                    })}
                </SarakSelect>
            </div>;
        })}
    </div>;
}

function CardGridFilters<TData extends Record<string, unknown>>(props: CardGridFilterProps<TData>): ReactElement | null {
    const { getFlexStyles } = useStructuralStyles();
    const stack = getFlexStyles('column', undefined, undefined, 'calc(var(--sarak-layout-gap-md,16px) * 0.75)');
    if (!props.mainFilter && props.sideFilters.length === 0) return null;
    return <div className={`${stack.className} border-t border-[var(--border-color,#334155)]`} style={{ ...stack.style, paddingTop: 'var(--sarak-layout-gap-md,16px)' }}>
        <CardGridTabFilter {...props} />
        <CardGridSelectFilters {...props} />
    </div>;
}

interface CardGridHeaderProps<TData extends Record<string, unknown>> extends CardGridFilterProps<TData> {
    label?: string;
    rowCount: number;
    search: string;
    setSearch: (value: string) => void;
}

export function CardGridHeader<TData extends Record<string, unknown>>(props: CardGridHeaderProps<TData>): ReactElement {
    const text = useLibraryText();
    const { getFlexStyles } = useStructuralStyles();
    const { getResponsiveStackStyles } = useResponsiveStyles();
    const block = getFlexStyles('column', undefined, undefined, 'var(--sarak-layout-gap-md,16px)');
    const row = getResponsiveStackStyles('md', 'var(--sarak-layout-gap-md,16px)');
    return <div className={block.className} style={block.style}>
        <div className={`${row.className} md:items-center justify-between`} style={row.style}>
            <div>
                {props.label && <h3 className="text-3xl font-black text-[var(--color-theme-title,#ffffff)] tracking-tighter" style={{ fontWeight: 'var(--sarak-h1-weight,700)' }}>{props.label}</h3>}
                <p className="text-[var(--text-muted,#94a3b8)] opacity-60 text-xs" style={{ marginTop: 'calc(var(--sarak-layout-gap-md,16px) * 0.25)' }}>{text('tableRowsFound', { count: props.rowCount })}</p>
            </div>
            <CardGridSearch search={props.search} setSearch={props.setSearch} />
        </div>
        <CardGridFilters {...props} />
    </div>;
}

interface CardGridResultsProps<TData extends Record<string, unknown>> {
    filteredData: TData[];
    hasData: boolean;
    loading: boolean;
    error: string | null;
    mapping?: SarakCardGridProps<TData>['mapping'];
    variant: NonNullable<SarakCardGridProps<TData>['variant']>;
}

export function CardGridResults<TData extends Record<string, unknown>>({ filteredData, hasData, loading, error, mapping, variant }: CardGridResultsProps<TData>): ReactElement {
    const { getFlexStyles, getGridStyles } = useStructuralStyles();
    const emptyState = getFlexStyles('column', 'center', 'center', '0px');
    const grid = getGridStyles(undefined, undefined, 'var(--sarak-layout-gap-md, 16px)', 'cardsStandard');
    const emptyStyle = { ...emptyState.style, paddingTop: 'calc(var(--sarak-layout-gap-md,16px) * 5)', paddingBottom: 'calc(var(--sarak-layout-gap-md,16px) * 5)' };
    return <div className={grid.className} style={grid.style}>
        {loading && !hasData ? [...Array(6)].map((_, index) => <div key={index} className="h-80 bg-[var(--color-theme-card,#1e293b)] border-[var(--border-color,#334155)] animate-pulse" />)
            : error && !hasData ? <div className={`col-span-full ${emptyState.className}`} style={emptyStyle}><SarakDataErrorNotice error={error} /></div>
                : filteredData.length === 0 ? <div className={`col-span-full ${emptyState.className} text-center`} style={emptyStyle}><SarakDataEmpty /></div>
                    : filteredData.map((item, index) => <SarakCoreCard key={index} item={item} mapping={mapping} variant={variant} />)}
    </div>;
}
