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
import * as LucideIcons from 'lucide-react';
import { useCardGridState } from './hooks/useCardGridState';
import { useSarakUI } from '../../../core/Provider/SarakUIProvider';
import { SarakTitleCard } from '../Cards/SarakTitleCard';
import { SarakActionCard } from '../Cards/SarakActionCard';
import { SarakSearchCard } from '../Cards/SarakSearchCard';
import { SarakInput, SarakSelect } from '../Inputs';
import { SarakButton, SarakIconButton } from '../Buttons';
import { SarakCoreCard } from './components/SarakCoreCard';

interface FilterConfig {
    id: string;
    label: string;
    type: 'TABS' | 'SELECT';
    field: string;
    options?: { label: string; value: string }[];
    dynamic?: boolean;
}

interface SarakCardGridProps {
    endpoint: string;
    label?: string;
    mapping?: {
        title: string;
        subtitle?: string;
        description?: string;
        badge?: string;
        tags?: string;
        icon?: string;
        color?: string;
        price_in?: string; // v6.3
        price_out?: string; // v6.3
        context?: string; // v6.3
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
export const SarakCardGrid: React.FC<SarakCardGridProps> = ({ endpoint, label, mapping, filters = [], variant }) => {
    const { design } = useSarakUI();
    const activeVariant = variant || design.cardVariant || 'classic';
    const { data, loading, error, search, activeFilters, setSearch, setActiveFilters } = useCardGridState(endpoint);

    // Utility for nested path resolution
    const getVal = (obj: any, path: string | undefined) => {
        if (!path) return undefined;
        try {
            return path.split('.').reduce((acc, part) => acc && acc[part], obj);
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

    return (
        <div className="flex flex-col" style={{ gap: 'calc(var(--sarak-grid-gap) * 1.25)' }}>
            {/* Header & Filter Section Core */}
            <div className="flex flex-col" style={{ gap: 'var(--sx-spacing-md)' }}>
                <div className="flex flex-col md:flex-row md:items-center justify-between" style={{ gap: 'var(--sx-spacing-md)' }}>
                    <div>
                        <h3 className="text-3xl font-black text-[var(--sx-color-text-title)] tracking-tighter" style={{ fontWeight: 'var(--heading-weight)' }}>{label || 'Explorar'}</h3>
                        <p className="text-[var(--sx-color-text-muted)] opacity-40 text-2xs font-bold uppercase tracking-[0.3em] mt-1">Sintonizando {filteredData.length} unidades disponíveis</p>
                    </div>
                    <div className="flex items-center" style={{ gap: 'calc(var(--sx-spacing-md) / 2)' }}>
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
                <div className="flex flex-col pt-4 border-t border-[var(--sx-color-border-base)]" style={{ gap: 'calc(var(--sx-spacing-md) * 0.75)' }}>
                    {mainFilter && (
                        <div className="flex flex-wrap" style={{ gap: 'var(--sx-spacing-sm)' }}>
                            {['all', ...(mainFilter.options || (mainFilter.dynamic ? getDynamicOptions(mainFilter.field) : [])).map(o => typeof o === 'string' ? o : o.value)].map(opt => (
                                <SarakButton
                                    key={opt}
                                    onClick={() => setActiveFilters(prev => ({ ...prev, [mainFilter.id]: opt }))}
                                    variant={(activeFilters[mainFilter.id] || 'all') === opt ? 'primary' : 'secondary'}
                                    className={(activeFilters[mainFilter.id] || 'all') === opt ? 'shadow-lg shadow-[var(--sx-color-primary-glow)]' : ''}
                                >
                                    {opt === 'all' ? `Todos (${mainFilter.label})` : opt}
                                </SarakButton>
                            ))}
                        </div>
                    )}

                    {sideFilters.length > 0 && (
                        <div className="flex flex-wrap" style={{ gap: '1rem' }}>
                            {sideFilters.map(filter => (
                                <div key={filter.id} className="relative group min-w-[160px]">
                                    <SarakSelect
                                        value={activeFilters[filter.id] || 'all'}
                                        onChange={(e) => setActiveFilters(prev => ({ ...prev, [filter.id]: e.target.value }))}
                                        className="w-full text-2xs font-black text-[var(--sx-color-text-muted)] opacity-60 uppercase tracking-widest cursor-pointer"
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
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3" style={{ gap: 'var(--sarak-grid-gap, 2rem)' }}>
                {loading ? (
                    [...Array(6)].map((_, i) => (
                        <div key={i} className="h-80 bg-[var(--sx-color-surface-base)] border-[var(--sx-color-border-base)] animate-pulse" />
                    ))
                ) : error ? (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
                        <AlertCircle className="w-12 h-12 text-rose-500/50 mb-4" />
                        <h4 className="text-xl font-bold text-white mb-2">Falha na Sincronização</h4>
                        <p className="text-white/30 text-xs uppercase tracking-widest">{error}</p>
                    </div>
                ) : filteredData.length === 0 ? (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
                        <XCircle className="w-12 h-12 text-white/10 mb-4" />
                        <h4 className="text-xl font-bold text-white mb-2">Nenhum Registro</h4>
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



