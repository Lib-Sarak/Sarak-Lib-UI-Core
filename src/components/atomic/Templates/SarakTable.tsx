import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, 
    ArrowUpDown, 
    ChevronLeft, 
    ChevronRight, 
    MoreHorizontal, 
    Download,
    Filter,
    RefreshCw,
    AlertCircle
} from 'lucide-react';
import api from '../../../shared/services/api';

interface SarakTableProps {
    endpoint: string;
    label?: string;
    mapping?: Record<string, string>; // { key_in_json: "Label na Coluna" }
}

/**
 * SarakTable Genérica (v6.0)
 * 
 * Um componente agnóstico que renderiza qualquer conjunto de dados tabular
 * baseado em um contrato visual enviado pelo manifesto do módulo.
 */
export const SarakTable: React.FC<SarakTableProps> = ({ endpoint, label, mapping }) => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get(endpoint);
            if (Array.isArray(response.data)) {
                setData(response.data);
            } else if (response.data && Array.isArray(response.data.items)) {
                setData(response.data.items);
            } else {
                setData([]);
            }
        } catch (err: any) {
            console.error(`[SarakTable] Falha ao carregar ${endpoint}:`, err);
            setError(err.message || 'Erro ao carregar dados');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [endpoint]);

    // Gerar colunas dinamicamente caso não exista um mapping
    const columns = mapping ? Object.keys(mapping) : (data.length > 0 ? Object.keys(data[0]).filter(k => !k.startsWith('_')) : []);
    const columnLabels = mapping || columns.reduce((acc, col) => ({ ...acc, [col]: col.charAt(0).toUpperCase() + col.slice(1).replace(/_/g, ' ') }), {});

    const filteredData = data.filter(item => 
        Object.values(item).some(val => 
            String(val).toLowerCase().includes(search.toLowerCase())
        )
    );

    if (error) {
        return (
            <div className="p-10 bg-red-500/5 border border-red-500/20 rounded-3xl flex items-center gap-4 text-red-400">
                <AlertCircle size={24} />
                <div>
                    <h4 className="font-bold">Erro ao carregar dados</h4>
                    <p className="text-xs opacity-60">{error}</p>
                    <button onClick={fetchData} className="mt-2 text-2xs font-black uppercase tracking-widest hover:underline">Tentar novamente</button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col" style={{ gap: 'var(--theme-gap, 1.5rem)' }}>
            {/* Header da Tabela */}
            <div className="flex flex-col md:flex-row md:items-center justify-between" style={{ gap: 'calc(var(--theme-gap) / 1.5)' }}>
                <div>
                    <h3 className="text-xl font-black text-white tracking-tight" style={{ fontWeight: 'var(--heading-weight)' }}>{label || 'Listagem de Dados'}</h3>
                    <p className="text-white/30 text-xs">{filteredData.length} registros encontrados</p>
                </div>
                
                <div className="flex items-center" style={{ gap: 'calc(var(--theme-gap) / 3)' }}>
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-blue-400 transition-colors" size={14} />
                        <input 
                            type="text" 
                            placeholder="Pesquisar..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-theme-card border-theme py-2 pl-12 pr-4 text-xs text-white outline-none focus:border-blue-500/40 focus:ring-4 focus:ring-blue-500/5 transition-all w-full md:w-64 rounded-theme"
                        />
                    </div>
                    <button onClick={fetchData} className="p-2 bg-theme-card border-theme text-white/40 hover:text-white hover:bg-white/10 transition-all rounded-theme" style={{ transitionDuration: 'var(--animation-speed, 0.3s)' }}>
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Container da Tabela com Glassmorphism */}
            <div className="relative bg-theme-card border-theme overflow-hidden rounded-theme">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 border-b border-theme">
                                {columns.map(col => (
                                    <th key={col} className="text-2xs font-black text-white/30 uppercase tracking-[0.2em]" style={{ padding: 'calc(var(--theme-pad) / 1.5) var(--theme-pad)' }}>
                                        <div className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
                                            {columnLabels[col]}
                                            <ArrowUpDown size={10} />
                                        </div>
                                    </th>
                                ))}
                                <th style={{ padding: 'calc(var(--theme-pad) / 1.5) var(--theme-pad)' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence mode="popLayout">
                                {loading ? (
                                    [...Array(5)].map((_, i) => (
                                        <tr key={`skeleton-${i}`} className="animate-pulse">
                                            {columns.map(col => (
                                                <td key={`cell-sk-${col}`} style={{ padding: 'calc(var(--theme-pad) / 2) var(--theme-pad)' }}>
                                                    <div className="h-4 bg-white/5 rounded-md w-3/4"></div>
                                                </td>
                                            ))}
                                            <td style={{ padding: 'calc(var(--theme-pad) / 2) var(--theme-pad)' }}></td>
                                        </tr>
                                    ))
                                ) : (
                                    filteredData.map((row, idx) => (
                                        <motion.tr 
                                            key={row.id || idx}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors group"
                                        >
                                            {columns.map(col => (
                                                <td key={col} className="text-sm text-white/70 font-medium" style={{ padding: 'calc(var(--theme-pad) / 2) var(--theme-pad)' }}>
                                                    {typeof row[col] === 'boolean' ? (
                                                        <span className={`px-2 py-0.5 rounded-theme text-2xs font-black uppercase ${row[col] ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                                            {row[col] ? 'Ativo' : 'Inativo'}
                                                        </span>
                                                    ) : (
                                                        String(row[col])
                                                    )}
                                                </td>
                                            ))}
                                            <td className="text-right" style={{ padding: 'calc(var(--theme-pad) / 2) var(--theme-pad)' }}>
                                                <button className="p-2 text-white/10 hover:text-white/60 transition-colors" style={{ transitionDuration: 'var(--animation-speed, 0.3s)' }}>
                                                    <MoreHorizontal size={16} />
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {filteredData.length === 0 && !loading && (
                    <div className="flex flex-col items-center justify-center text-center" style={{ padding: 'calc(var(--theme-pad) * 5)', gap: 'calc(var(--theme-gap) / 2)' }}>
                        <div className="inline-flex p-4 bg-theme-card border-theme rounded-theme">
                            <AlertCircle className="text-white/10" size={32} />
                        </div>
                        <p className="text-white/20 text-xs font-black uppercase tracking-widest">Nenhum dado encontrado</p>
                    </div>
                )}
            </div>
        </div>
    );
};

