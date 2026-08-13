import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, 
    RefreshCw, 
    AlertCircle, 
    LayoutGrid, 
    ExternalLink,
    Box,
    Filter,
    XCircle
} from 'lucide-react';
import { useCardGridState } from './hooks/useCardGridState';
import { useSarakUI } from '../../../core/Provider/SarakUIProvider';
import { SarakTitleCard } from '../Cards/SarakTitleCard';
import { SarakActionCard } from '../Cards/SarakActionCard';
import { SarakSearchCard } from '../Cards/SarakSearchCard';
import { SarakInput, SarakSelect } from '../Inputs';
import { SarakButton, SarakIconButton } from '../Buttons';
import { SarakCoreCard } from './components/SarakCoreCard';
import { useStructuralStyles } from '../hooks/useStructuralStyles';

interface FilterConfig {
    id: string;
    label: string;
    type: 'TABS' | 'SELECT';
    field: string;
    options?: { label: string; value: string }[];
    dynamic?: boolean;
}

export interface SarakCardGridProps {
    endpoint: string;
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
    filters?: FilterConfig[]; // v6.4
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
export const SarakCardGrid = <TData extends Record<string, unknown>>({ endpoint, label, mapping, filters = [], variant }: SarakCardGridProps) => {
    const { design } = useSarakUI();
    const activeVariant = variant || design.cardVariant || 'classic';
    const { data, loading, error, search, activeFilters, setSearch, setActiveFilters } = useCardGridState<TData>(endpoint);
    const { getFlexStyles, getResponsiveStackStyles, getGridStyles } = useStructuralStyles();
    const outerStack = getFlexStyles('column', undefined, undefined, 'calc(var(--sarak-layout-gap-md, 16px) * 1.25)');
    const headerBlockStack = getFlexStyles('column', undefined, undefined, 'var(--sarak-layout-gap-md,16px)');
    const headerRow = getResponsiveStackStyles('md', 'var(--sarak-layout-gap-md,16px)');
    const filtersBarStack = getFlexStyles('column', undefined, undefined, 'calc(var(--sarak-layout-gap-md,16px) * 0.75)');
    const emptyStateStack = getFlexStyles('column', 'center', 'center', '0px');
    const cardsGrid = getGridStyles(undefined, undefined, 'var(--sarak-layout-gap-md, 16px)', 'cardsStandard');

    // Utility for nested path resolution
    const getVal = (obj: TData, path: string | undefined): unknown => {
        if (!path) return undefined;
        try {
            return path.split('.').reduce((acc: unknown, part) => {
                if (acc && typeof acc === 'object') return (acc as Record<string, unknown>)[part];
                return undefined;
            }, obj as unknown);
        } catch (e) {
            return undefined;
        }
    };

    // Gera opções dinâmicas para filtros do tipo SELECT que as solicitam
    const getDynamicOptions = (field: string) => {
        const values = new Set<string>();
        data.forEach(item => {
            const val = getVal(item, field);
            if (val) values.add(String(val));
        });
        return Array.from(values).sort().map(v => ({ label: v, value: v }));
    };

    const filteredData = data.filter(item => {
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
                        <h3 className="text-3xl font-black text-[var(--color-theme-title,#ffffff)] tracking-tighter" style={{ fontWeight: 'var(--sarak-h1-weight,700)' }}>{label || 'Explorar'}</h3>
                        <p className="text-[var(--text-muted,#94a3b8)] opacity-40 text-2xs font-bold uppercase" style={{ marginTop: 'calc(var(--sarak-layout-gap-md,16px) * 0.25)', letterSpacing: 'var(--sarak-tracking-wide, 0.3em)' }}>Sintonizando {filteredData.length} unidades disponíveis</p>
                    </div>
                    <div className="flex items-center" style={{ gap: 'calc(var(--sarak-layout-gap-md,16px) / 2)' }}>
                        <div className="w-full md:w-80">
                            <SarakInput 
                                type="text" 
                                placeholder="Pesquisar..." 
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                leftIcon={<Search size={16} />}
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
                                    {opt === 'all' ? `Todos (${mainFilter.label})` : opt}
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
                                        <option value="all">{filter.label}: Todos</option>
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
                    <div className={`col-span-full ${emptyStateStack.className} text-center`} style={{ ...emptyStateStack.style, paddingTop: 'calc(var(--sarak-layout-gap-md,16px) * 5)', paddingBottom: 'calc(var(--sarak-layout-gap-md,16px) * 5)' }}>
                        <AlertCircle className="w-12 h-12 text-rose-500/50" style={{ marginBottom: 'var(--sarak-layout-gap-md,16px)' }} />
                        <h4 className="text-xl font-bold text-white" style={{ marginBottom: 'var(--sarak-layout-gap-sm, 8px)' }}>Falha na Sincronização</h4>
                        <p className="text-white/30 text-xs uppercase tracking-widest">{error}</p>
                    </div>
                ) : filteredData.length === 0 ? (
                    <div className={`col-span-full ${emptyStateStack.className} text-center`} style={{ ...emptyStateStack.style, paddingTop: 'calc(var(--sarak-layout-gap-md,16px) * 5)', paddingBottom: 'calc(var(--sarak-layout-gap-md,16px) * 5)' }}>
                        <XCircle className="w-12 h-12 text-white/10" style={{ marginBottom: 'var(--sarak-layout-gap-md,16px)' }} />
                        <h4 className="text-xl font-bold text-white" style={{ marginBottom: 'var(--sarak-layout-gap-sm, 8px)' }}>Nenhum Registro</h4>
                        <p className="text-white/30 text-xs uppercase tracking-widest">Ajuste os filtros ou a pesquisa</p>
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



