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
import { SarakInput } from '../Inputs';
import { SarakButton, SarakIconButton } from '../Buttons';
import { useSarakUI } from '../../../core/Provider/SarakUIProvider';
import { useTableLayoutStyles } from '../Tables/hooks/useTableLayoutStyles';
import { useStructuralStyles } from '../hooks/useStructuralStyles';
import { useSarakTableData } from './hooks/useSarakTableData';
import { twMerge } from 'tailwind-merge';

interface SarakTableProps<TData extends Record<string, unknown> = Record<string, unknown>> {
    endpoint: string;
    data?: TData[];
    label?: string;
    mapping?: Record<string, string>; // { key_in_json: "Label na Coluna" }
    role?: 'primary' | 'secondary' | 'neutral' | 'accent';
    density?: 'compact' | 'standard' | 'spacious';
    importance?: 'hero' | 'base' | 'subtle';
}

/**
 * SarakTable Genérica (v6.0)
 * 
 * Um componente agnóstico que renderiza qualquer conjunto de dados tabular
 * baseado em um contrato visual enviado pelo manifesto do módulo.
 */
export const SarakTable = <TData extends Record<string, unknown> = Record<string, unknown>>({ endpoint, data: initialData, label, mapping, role = 'neutral', density = 'standard' }: SarakTableProps<TData>) => {
    const { design } = useSarakUI();
    const { tableWrapperClass, cellDensityClass, actionColumnAlignmentClass } = useTableLayoutStyles(design);
    const { getContainerStyles, getHeaderStyles } = useStructuralStyles();
    
    const containerLayout = getContainerStyles();
    const headerLayout = getHeaderStyles();

    const {
        data,
        filteredData,
        loading,
        error,
        search,
        setSearch,
        fetchData
    } = useSarakTableData<TData>(endpoint);

    // Gerar colunas dinamicamente caso não exista um mapping
    const columns = mapping ? Object.keys(mapping) : (data.length > 0 ? Object.keys(data[0]).filter(k => !k.startsWith('_')) : []);
    const columnLabels = mapping || columns.reduce((acc: Record<string, string>, col) => ({ ...acc, [col]: col.charAt(0).toUpperCase() + col.slice(1).replace(/_/g, ' ') }), {} as Record<string, string>);

    if (error) {
        return (
            <div className={twMerge("p-10 rounded-3xl items-center border", containerLayout.className)} style={{ backgroundColor: 'var(--sarak-status-error-color-bg,rgba(239,68,68,0.1))', borderColor: 'var(--sarak-status-error-color-border,rgba(239,68,68,0.2))', color: 'var(--sarak-status-error-color,#ef4444)', gap: 'calc(var(--sarak-layout-gap-md,16px) / 2)' }}>
                <AlertCircle size={24} />
                <div>
                    <h4 className="font-bold">Erro ao carregar dados</h4>
                    <p className="text-xs opacity-60">{error}</p>
                    <SarakButton onClick={fetchData} variant="ghost" className="mt-2 text-2xs font-black uppercase tracking-widest hover:underline p-0">Tentar novamente</SarakButton>
                </div>
            </div>
        );
    }

    return (
        <div className={containerLayout.className} style={containerLayout.style}>
            {/* Header da Tabela */}
            <div className={headerLayout.className} style={headerLayout.style}>
                <div>
                    <h3 
                        className={`font-black text-white tracking-tight ${density === 'spacious' ? 'text-2xl' : 'text-xl'}`} 
                        style={{ 
                            fontWeight: 'var(--sarak-h1-weight,700)',
                            color: role === 'primary' ? 'var(--sarak-primary-color,#3b82f6)' : 'white'
                        }}
                    >
                        {label || 'Listagem de Dados'}
                    </h3>
                    <p className="text-white/30 text-xs">{filteredData.length} registros encontrados</p>
                </div>
                
                <div className="flex items-center" style={{ gap: 'calc(var(--sarak-layout-gap-md,16px) / 3)' }}>
                    <div className="w-full md:w-64">
                        <SarakInput 
                            type="text" 
                            placeholder="Pesquisar..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            leftIcon={<Search size={16} />}
                        />
                    </div>
                    <SarakIconButton 
                        icon={<RefreshCw size={16} className={loading ? 'animate-spin' : ''} />} 
                        onClick={fetchData} 
                        variant="secondary"
                    />
                </div>
            </div>

            {/* Container da Tabela com Glassmorphism */}
            <div className="relative bg-[var(--color-theme-card,#1e293b)] border-[var(--border-color,#334155)] overflow-hidden rounded-[var(--sarak-card-radius,12px)]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 border-b border-[var(--border-color,#334155)]">
                                {columns.map(col => (
                                    <th 
                                        key={col} 
                                        className={`text-2xs font-black text-white/30 uppercase tracking-[0.2em] ${cellDensityClass}`}
                                    >
                                        <div className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
                                            {columnLabels[col]}
                                            <ArrowUpDown size={10} />
                                        </div>
                                    </th>
                                ))}
                                <th className={cellDensityClass}></th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence mode="popLayout">
                                {loading ? (
                                    [...Array(5)].map((_, i) => (
                                        <tr key={`skeleton-${i}`} className="animate-pulse">
                                            {columns.map(col => (
                                                <td key={`cell-sk-${col}`} className={cellDensityClass}>
                                                    <div className="h-4 bg-white/5 rounded-md w-3/4"></div>
                                                </td>
                                            ))}
                                            <td className={cellDensityClass}></td>
                                        </tr>
                                    ))
                                ) : (
                                    filteredData.map((row, idx) => (
                                        <motion.tr 
                                            key={String(row.id || idx)}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors group"
                                        >
                                            {columns.map(col => (
                                                <td 
                                                    key={col} 
                                                    className={`text-white/70 font-medium ${density === 'compact' ? 'text-xs' : 'text-sm'} ${cellDensityClass}`}
                                                >
                                                    {typeof row[col] === 'boolean' ? (
                                                        <span 
                                                            className="px-2 py-0.5 rounded-[var(--sarak-card-radius,12px)] text-2xs font-black uppercase"
                                                            style={{ 
                                                                backgroundColor: row[col] ? 'var(--sarak-status-success-color-bg,rgba(34,197,94,0.1))' : 'var(--sarak-status-error-color-bg,rgba(239,68,68,0.1))',
                                                                color: row[col] ? 'var(--sarak-status-success-color,#22c55e)' : 'var(--sarak-status-error-color,#ef4444)'
                                                            }}
                                                        >
                                                            {row[col] ? 'Ativo' : 'Inativo'}
                                                        </span>
                                                    ) : (
                                                        String(row[col])
                                                    )}
                                                </td>
                                            ))}
                                            <td className={`flex items-center ${actionColumnAlignmentClass} ${cellDensityClass}`}>
                                                <SarakIconButton 
                                                    icon={<MoreHorizontal size={16} />}
                                                    variant="ghost"
                                                />
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {filteredData.length === 0 && !loading && (
                    <div className={twMerge("items-center justify-center text-center", containerLayout.className)} style={{ padding: 'calc(var(--sarak-layout-gap-md,16px) * 5)', gap: 'calc(var(--sarak-layout-gap-md,16px) / 2)' }}>
                        <div className="inline-flex p-4 bg-[var(--color-theme-card,#1e293b)] border-[var(--border-color,#334155)] rounded-[var(--sarak-card-radius,12px)]">
                            <AlertCircle className="text-white/10" size={32} />
                        </div>
                        <p className="text-white/20 text-xs font-black uppercase tracking-widest">Nenhum dado encontrado</p>
                    </div>
                )}
            </div>
        </div>
    );
};

