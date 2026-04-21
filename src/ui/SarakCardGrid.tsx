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
import api from '../shared/services/api';

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
}

/**
 * SarakCardGrid Elite (v6.4)
 * 
 * Renderiza um grid de cartões de alta fidelidade com suporte a metadados
 * técnicos complexos e FILTROS DINÂMICOS declarados via manifesto.
 */
export const SarakCardGrid: React.FC<SarakCardGridProps> = ({ endpoint, label, mapping, filters = [] }) => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get(endpoint);
            const rawData = response.data.items || response.data || [];
            setData(Array.isArray(rawData) ? rawData : []);
        } catch (err: any) {
            console.error(`[SarakCardGrid] Erro:`, err);
            setError(err.message || 'Erro ao carregar');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [endpoint]);

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
        <div className="flex flex-col" style={{ gap: 'calc(var(--theme-gap) * 1.25)' }}>
            {/* Header & Filter Section Elite */}
            <div className="flex flex-col" style={{ gap: 'var(--theme-gap)' }}>
                <div className="flex flex-col md:flex-row md:items-center justify-between" style={{ gap: 'var(--theme-gap)' }}>
                    <div>
                        <h3 className="text-3xl font-black text-white tracking-tighter" style={{ fontWeight: 'var(--heading-weight)' }}>{label || 'Explorar'}</h3>
                        <p className="text-white/20 text-[10px] font-bold uppercase tracking-[0.3em] mt-1">Sintonizando {filteredData.length} unidades disponíveis</p>
                    </div>
                    <div className="flex items-center" style={{ gap: 'calc(var(--theme-gap) / 2)' }}>
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-blue-400 transition-colors" size={16} />
                            <input 
                                type="text" 
                                placeholder="Pesquisar..." 
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="bg-theme-card border-theme py-4 pl-12 pr-6 text-sm text-white outline-none focus:border-blue-500/40 transition-all w-full md:w-80 rounded-theme"
                            />
                        </div>
                    </div>
                </div>

            {/* Dynamic Filters Bar */}
            {(mainFilter || sideFilters.length > 0) && (
                <div className="flex flex-col pt-4 border-t border-theme" style={{ gap: 'calc(var(--theme-gap) * 0.75)' }}>
                    {mainFilter && (
                        <div className="flex flex-wrap" style={{ gap: '0.5rem' }}>
                            {['all', ...(mainFilter.options || (mainFilter.dynamic ? getDynamicOptions(mainFilter.field) : [])).map(o => typeof o === 'string' ? o : o.value)].map(opt => (
                                <button
                                    key={opt}
                                    onClick={() => setActiveFilters(prev => ({ ...prev, [mainFilter.id]: opt }))}
                                    className={`px-6 py-3 rounded-theme text-[10px] font-black uppercase tracking-widest transition-all border ${
                                        (activeFilters[mainFilter.id] || 'all') === opt
                                            ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/40'
                                            : 'bg-theme-card border-theme text-white/30 hover:text-white'
                                    }`}
                                >
                                    {opt === 'all' ? `Todos (${mainFilter.label})` : opt}
                                </button>
                            ))}
                        </div>
                    )}

                    {sideFilters.length > 0 && (
                        <div className="flex flex-wrap" style={{ gap: '1rem' }}>
                            {sideFilters.map(filter => (
                                <div key={filter.id} className="relative group min-w-[160px]">
                                    <select
                                        value={activeFilters[filter.id] || 'all'}
                                        onChange={(e) => setActiveFilters(prev => ({ ...prev, [filter.id]: e.target.value }))}
                                        className="w-full appearance-none bg-theme-card border-theme px-4 py-3 pr-10 rounded-theme text-[10px] font-black text-white/40 uppercase tracking-widest outline-none focus:border-blue-500/40 transition-all cursor-pointer"
                                    >
                                        <option value="all">{filter.label}: Todos</option>
                                        {(filter.options || (filter.dynamic ? getDynamicOptions(filter.field) : [])).map(opt => {
                                            const val = typeof opt === 'string' ? opt : opt.value;
                                            const lab = typeof opt === 'string' ? opt : opt.label;
                                            return <option key={val} value={val}>{lab}</option>;
                                        })}
                                    </select>
                                    <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-white/10 pointer-events-none group-focus-within:text-blue-400" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
            </div>

            {/* Grid de Cards Pro Elite (v6.5) */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3" style={{ gap: 'var(--theme-gap, 2rem)' }}>
                {loading ? (
                    [...Array(6)].map((_, i) => (
                        <div key={i} className="h-80 bg-theme-card border-theme animate-pulse" />
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
                        <SarakEliteCard key={idx} item={item} mapping={mapping} />
                    ))
                )}
            </div>
        </div>
    );
};

const SarakEliteCard = ({ item, mapping }: { item: any; mapping: any }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const getVal = (obj: any, path: string | undefined) => {
        if (!path) return undefined;
        try {
            return path.split('.').reduce((acc, part) => acc && acc[part], obj);
        } catch (e) { return undefined; }
    };

    const priceIn = getVal(item, mapping?.price_in || mapping?.price);
    const priceOut = getVal(item, mapping?.price_out);
    const inputCaps = getVal(item, mapping?.input_caps) || [];
    const outputCaps = getVal(item, mapping?.output_caps) || [];
    const context = getVal(item, mapping?.context);
    const description = getVal(item, mapping?.description);
    const tokenizer = getVal(item, mapping?.tokenizer);

    const getCapIcon = (cap: string) => {
        switch (cap.toLowerCase()) {
            case 'vision': return <LucideIcons.Eye size={10} />;
            case 'web': return <LucideIcons.Globe size={10} />;
            case 'chat': return <LucideIcons.MessageSquare size={10} />;
            default: return <LucideIcons.Zap size={10} />;
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col bg-theme-card border-theme group transition-all h-fit"
            style={{ transitionDuration: 'var(--animation-speed, 0.5s)' }}
        >
            <div className="p-theme" style={{ padding: 'var(--theme-pad, 2rem)' }}>
                <div className="flex justify-between items-start mb-6" style={{ marginBottom: 'calc(var(--theme-gap) / 1.5)' }}>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-1">
                            {getVal(item, mapping?.subtitle) || 'Modelo'}
                        </span>
                        <h4 className="text-xl font-black text-white tracking-tight group-hover:text-blue-400 transition-colors">
                            {getVal(item, mapping?.title)}
                        </h4>
                    </div>
                    <div className="bg-theme-card border-theme p-3">
                        {mapping?.icon && LucideIcons[mapping.icon as keyof typeof LucideIcons] ? (
                            React.createElement(LucideIcons[mapping.icon as keyof typeof LucideIcons] as any, { size: 20, className: "text-white/60" })
                        ) : <Box size={20} className="text-white/60" />}
                    </div>
                </div>

                <div className="flex flex-col gap-4 mb-8">
                    <div className="flex flex-wrap gap-2">
                        <span className="text-[8px] font-black text-white/20 uppercase w-full mb-1">Input Capacities</span>
                        {inputCaps.map((cap: string) => (
                            <div key={cap} className="flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-[9px] font-black uppercase">
                                {getCapIcon(cap)} {cap}
                            </div>
                        ))}
                    </div>
                    {outputCaps.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            <span className="text-[8px] font-black text-white/20 uppercase w-full mb-1">Output Capacities</span>
                            {outputCaps.map((cap: string) => (
                                <div key={cap} className="flex items-center gap-1.5 px-3 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-full text-[9px] font-black uppercase">
                                    {getCapIcon(cap)} {cap}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 mb-8 pt-6 border-t border-theme" style={{ gap: 'var(--theme-gap, 1rem)', marginBottom: 'var(--theme-gap)', marginTop: 'var(--theme-gap)' }}>
                    <div className="flex flex-col">
                        <span className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">Custo In (1M)</span>
                        <span className="text-sm font-mono text-emerald-400 font-bold">
                            {priceIn !== undefined ? `$${Number(priceIn).toFixed(4)}` : 'N/A'}
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">Custo Out (1M)</span>
                        <span className="text-sm font-mono text-purple-400 font-bold">
                            {priceOut !== undefined ? `$${Number(priceOut).toFixed(4)}` : 'N/A'}
                        </span>
                    </div>
                    <div className="flex flex-col col-span-2">
                        <span className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">Janela de Contexto</span>
                        <span className="text-[10px] font-black text-white/80 uppercase">
                            {context ? `${(Number(context) / 1000)}k tokens` : 'Desconhecida'}
                        </span>
                    </div>
                </div>

                <div className="flex" style={{ gap: 'calc(var(--theme-gap) / 2.5)' }}>
                    <button 
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex-1 flex items-center justify-center gap-2 py-4 bg-theme-card border-theme text-white/60 hover:text-white rounded-theme text-[10px] font-black uppercase tracking-widest transition-all"
                        style={{ transitionDuration: 'var(--animation-speed, 0.3s)' }}
                    >
                        <LucideIcons.ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        {isExpanded ? 'Fechar' : 'Ver Specs'}
                    </button>
                    <button className="p-4 bg-blue-600 hover:bg-blue-500 text-white rounded-theme transition-all shadow-lg" style={{ transitionDuration: 'var(--animation-speed, 0.3s)' }}>
                        <ExternalLink size={18} />
                    </button>
                </div>

                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="flex flex-col pt-8" style={{ gap: 'calc(var(--theme-gap) / 1.5)', paddingTop: 'var(--theme-gap)' }}>
                                {description && (
                                    <div className="p-6 bg-theme-card border-theme rounded-theme">
                                        <span className="text-[8px] font-black text-blue-400 uppercase mb-2 block">Descrição Técnica</span>
                                        <p className="text-[11px] text-white/50 leading-relaxed font-medium">{description}</p>
                                    </div>
                                )}
                                {tokenizer && (
                                    <div className="flex items-center justify-between px-6 py-4 bg-theme-card border-theme rounded-theme">
                                        <span className="text-[8px] font-black text-white/30 uppercase">Tokenizer</span>
                                        <span className="text-[10px] font-mono text-blue-400/80">{tokenizer}</span>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};
