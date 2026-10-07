import { SarakIcon } from '../Icon/SarakIcon';
import { motion, AnimatePresence } from 'framer-motion';

import { useCardGridState } from './hooks/useCardGridState';
import { useLibraryText } from '../../../core/i18n/useLibraryText';
import { useSarakUI } from '../../../core/Provider/SarakUIProvider';
import { SarakInput, SarakSelect } from '../Inputs';
import { SarakButton } from '../Buttons';
import { SarakCoreCard } from './components/SarakCoreCard';
import { SarakAlert } from '../Feedback/SarakAlert';
import { SarakDataEmpty } from '../Feedback/SarakDataEmpty';
import { useStructuralStyles } from '../hooks/useStructuralStyles';
import { useResponsiveStyles } from '../hooks/useResponsiveStyles';

export interface SarakFilterConfig {
    id: string;
    label: string;
    type: 'TABS' | 'SELECT';
    field: string;
    options?: { label: string; value: string }[];
    dynamic?: boolean;
}

export interface SarakCardGridProps<TData extends Record<string, unknown> = Record<string, unknown>> {
    /** Dado já carregado pelo host; quando presente, tem prioridade sobre `load`. */
    data?: TData[];
    /** Carrega os registros pelo mecanismo escolhido pelo host. */
    load?: () => Promise<TData[]>;
    label?: string;
    /**
     * Mapa de dados do card. Cada valor é o CAMINHO de um campo do item, exceto os
     * marcados como *literal* (texto/nome fixo escrito pelo próprio autor).
     *
     * Genérico por contrato (Spec 42): a Sarak não conhece domínio nenhum — nenhuma
     * aritmética, unidade ou moeda é calculada aqui. O consumidor entrega valores
     * prontos em `details`.
     */
    mapping?: {
        title: string;
        subtitle?: string;
        description?: string;
        badge?: string;
        tags?: string;
        /** *literal*: nome do ícone (contrato de nomes em `docs/component-catalog.md`). */
        icon?: string;
        color?: string;
        /** Caminho para `Array<{ label, value }>` JÁ FORMATADO pelo consumidor — painel de detalhes. */
        details?: string;
        /** Caminho para `string[]` — chips da fileira primária. */
        input_caps?: string;
        /** Caminho para `string[]` — chips da fileira secundária. */
        output_caps?: string;
        /** *literal*: cabeçalho da fileira `input_caps` (ausente = fileira sem cabeçalho). */
        input_caps_label?: string;
        /** *literal*: cabeçalho da fileira `output_caps` (ausente = fileira sem cabeçalho). */
        output_caps_label?: string;
        /** *literal*: cabeçalho do bloco de descrição no painel expansível. */
        description_label?: string;
        /** *literal*: texto do botão que abre o painel expansível (default `"Ver mais"`). */
        expand_label?: string;
        /** *literal*: texto do mesmo botão com o painel aberto (default `"Fechar"`). */
        collapse_label?: string;
    };
    filters?: SarakFilterConfig[]; // v6.4
    role?: 'primary' | 'secondary' | 'neutral' | 'accent';
    density?: 'compact' | 'standard' | 'spacious';
    importance?: 'hero' | 'base' | 'subtle';
    variant?: 'classic' | 'title' | 'action' | 'search'; // v7.0
}

/**
 * SarakCardGrid Core (v6.4)
 * 
 * Renderiza um grid de cartões de alta fidelidade com suporte a metadados
 * técnicos complexos e FILTROS DINÂMICOS declarados via manifesto.
 */
export const SarakCardGrid = <TData extends Record<string, unknown> = Record<string, unknown>>({ data, load, label, mapping, filters = [], variant }: SarakCardGridProps<TData>) => {
    const { design } = useSarakUI();
    const activeVariant = variant || design.cardVariant || 'classic';
    const text = useLibraryText();
    const { data: records, loading, error, search, activeFilters, setSearch, setActiveFilters } = useCardGridState<TData>(data, load);
    const { getFlexStyles, getGridStyles } = useStructuralStyles();
    const { getResponsiveStackStyles } = useResponsiveStyles();
    const outerStack = getFlexStyles('column', undefined, undefined, 'calc(var(--sarak-layout-gap-md, 16px) * 1.25)');
    const headerBlockStack = getFlexStyles('column', undefined, undefined, 'var(--sarak-layout-gap-md,16px)');
    const headerRow = getResponsiveStackStyles('md', 'var(--sarak-layout-gap-md,16px)');
    const filtersBarStack = getFlexStyles('column', undefined, undefined, 'calc(var(--sarak-layout-gap-md,16px) * 0.75)');
    const emptyStateStack = getFlexStyles('column', 'center', 'center', '0px');
    const cardsGrid = getGridStyles(undefined, undefined, 'var(--sarak-layout-gap-md, 16px)', 'cardsStandard');

    // Utility for nested path resolution
    const getVal = (obj: TData, path: string | undefined): unknown => {
        if (!path) return undefined;
        return path.split('.').reduce((acc: unknown, part) => {
            if (acc && typeof acc === 'object') return (acc as Record<string, unknown>)[part];
            return undefined;
        }, obj as unknown);
    };

    // Gera opções dinâmicas para filtros do tipo SELECT que as solicitam
    const getDynamicOptions = (field: string) => {
        const values = new Set<string>();
        records.forEach(item => {
            const val = getVal(item, field);
            if (val) values.add(String(val));
        });
        return Array.from(values).sort().map(v => ({ label: v, value: v }));
    };

    const filteredData = records.filter(item => {
        const title = mapping ? String(getVal(item, mapping.title) || '') : '';
        const subtitle = mapping?.subtitle ? String(getVal(item, mapping.subtitle) || '') : '';
        const matchesSearch = title.toLowerCase().includes(search.toLowerCase()) || 
                             subtitle.toLowerCase().includes(search.toLowerCase());

        const matchesFilters = Object.entries(activeFilters).every(([filterId, filterValue]) => {
            if (!filterValue || filterValue === 'all') return true;
            const filterDef = filters.find(f => f.id === filterId);
            if (!filterDef) return true;
            
            const itemValue = getVal(item, filterDef.field);
            
            // Suporte a arrays (ex: capabilities)
            if (Array.isArray(itemValue)) {
                return itemValue.includes(filterValue);
            }
            
            return String(itemValue) === filterValue;
        });

        return matchesSearch && matchesFilters;
    });

    const mainFilter = filters.find(f => f.type === 'TABS');
    const sideFilters = filters.filter(f => f.type === 'SELECT');

    // plan-41: `@container` plantado na raiz — `headerRow` e `cardsGrid` abaixo usam
    // classe `@min-[…]` (container query), que precisa de um ancestral com
    // `container-type` para casar (achado real em consumidor, `plan-40`).
    return (
        <div className={`@container ${outerStack.className}`} style={outerStack.style}>
            {/* Header & Filter Section Core */}
            <div className={headerBlockStack.className} style={headerBlockStack.style}>
                <div className={`${headerRow.className} md:items-center justify-between`} style={headerRow.style}>
                    <div>
                        {label && <h3 className="text-3xl font-black text-[var(--color-theme-title,#ffffff)] tracking-tighter" style={{ fontWeight: 'var(--sarak-h1-weight,700)' }}>{label}</h3>}
                        <p className="text-[var(--text-muted,#94a3b8)] opacity-60 text-xs" style={{ marginTop: 'calc(var(--sarak-layout-gap-md,16px) * 0.25)' }}>{text('tableRowsFound', { count: filteredData.length })}</p>
                    </div>
                    <div className="flex items-center" style={{ gap: 'calc(var(--sarak-layout-gap-md,16px) / 2)' }}>
                        <div className="w-full md:w-80">
                            <SarakInput 
                                type="text" 
                                placeholder={text('searchPlaceholder')} 
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                leftIcon={<SarakIcon name="Search" size={16} />}
                            />
                        </div>
                    </div>
                </div>

            {/* Dynamic Filters Bar */}
            {(mainFilter || sideFilters.length > 0) && (
                <div className={`${filtersBarStack.className} border-t border-[var(--border-color,#334155)]`} style={{ ...filtersBarStack.style, paddingTop: 'var(--sarak-layout-gap-md,16px)' }}>
                    {mainFilter && (
                        <div className="flex flex-wrap" style={{ gap: 'var(--sarak-layout-gap-sm,8px)' }}>
                            {['all', ...(mainFilter.options || (mainFilter.dynamic ? getDynamicOptions(mainFilter.field) : [])).map(o => typeof o === 'string' ? o : o.value)].map(opt => (
                                <SarakButton
                                    key={opt}
                                    onClick={() => setActiveFilters(prev => ({ ...prev, [mainFilter.id]: opt }))}
                                    variant={(activeFilters[mainFilter.id] || 'all') === opt ? 'primary' : 'secondary'}
                                    className={(activeFilters[mainFilter.id] || 'all') === opt ? 'shadow-lg shadow-[var(--sarak-shadow-glow,rgba(59,130,246,0.5))]' : ''}
                                >
                                    {opt === 'all' ? text('filterShowAll', { label: mainFilter.label }) : opt}
                                </SarakButton>
                            ))}
                        </div>
                    )}

                    {sideFilters.length > 0 && (
                        <div className="flex flex-wrap" style={{ gap: 'var(--sarak-layout-gap-md, 16px)' }}>
                            {sideFilters.map(filter => (
                                <div key={filter.id} className="relative group min-w-[var(--sarak-catalog-filter-min-width,160px)]">
                                    <SarakSelect
                                        value={activeFilters[filter.id] || 'all'}
                                        onChange={(e) => setActiveFilters(prev => ({ ...prev, [filter.id]: e.target.value }))}
                                        className="w-full text-2xs font-black text-[var(--text-muted,#94a3b8)] opacity-60 uppercase tracking-widest cursor-pointer"
                                    >
                                        <option value="all">{text('filterShowAll', { label: filter.label })}</option>
                                        {(filter.options || (filter.dynamic ? getDynamicOptions(filter.field) : [])).map(opt => {
                                            const val = typeof opt === 'string' ? opt : opt.value;
                                            const lab = typeof opt === 'string' ? opt : opt.label;
                                            return <option key={val} value={val}>{lab}</option>;
                                        })}
                                    </SarakSelect>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
            </div>

            {/* Grid de Cards Pro Core (v6.5) */}
            <div className={cardsGrid.className} style={cardsGrid.style}>
                {loading ? (
                    [...Array(6)].map((_, i) => (
                        <div key={i} className="h-80 bg-[var(--color-theme-card,#1e293b)] border-[var(--border-color,#334155)] animate-pulse" />
                    ))
                ) : error ? (
                    <div className={`col-span-full ${emptyStateStack.className}`} style={{ ...emptyStateStack.style, paddingTop: 'calc(var(--sarak-layout-gap-md,16px) * 5)', paddingBottom: 'calc(var(--sarak-layout-gap-md,16px) * 5)' }}>
                        <SarakAlert variant="error" title={text('dataLoadErrorTitle')} message={error} />
                    </div>
                ) : filteredData.length === 0 ? (
                    <div className={`col-span-full ${emptyStateStack.className} text-center`} style={{ ...emptyStateStack.style, paddingTop: 'calc(var(--sarak-layout-gap-md,16px) * 5)', paddingBottom: 'calc(var(--sarak-layout-gap-md,16px) * 5)' }}>
                        <SarakDataEmpty />
                    </div>
                ) : (
                    filteredData.map((item, idx) => (
                        <SarakCoreCard key={idx} item={item} mapping={mapping} variant={activeVariant} />
                    ))
                )}
            </div>
        </div>
    );
};


