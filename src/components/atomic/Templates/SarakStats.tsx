import { SarakIcon } from "../Icon/SarakIcon";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

import { useSarakStatsData } from './hooks/useSarakStatsData';
import { useStructuralStyles } from '../hooks/useStructuralStyles';

export interface SarakStatsProps<TData extends Record<string, unknown>> {
    /** Busca as métricas quando `data` não é fornecida; omitido junto com `data`, o componente fica no esqueleto de carregamento. */
    endpoint?: string;
    /** Usa métricas já carregadas e evita a busca; quando presente, tem prioridade sobre `endpoint`. */
    data?: TData;
    /** Sem efeito nesta implementação; o título dos cartões vem de `mapping` ou das chaves dos dados. */
    label?: string;
    /** Define as chaves e os rótulos exibidos; omitido, infere campos numéricos/textuais ou resume arrays em total, ativos e erros. */
    mapping?: Record<string, string>; // { key_in_json: "Label do Contador" }
    /** Sem efeito nesta implementação; omitir ou alterar o valor não muda a renderização atual. */
    role?: 'primary' | 'secondary' | 'neutral' | 'accent';
    /** Sem efeito nesta implementação; omitir ou alterar o valor não muda a renderização atual. */
    density?: 'compact' | 'standard' | 'spacious';
    /** Sem efeito nesta implementação; omitir ou alterar o valor não muda a renderização atual. */
    importance?: 'hero' | 'base' | 'subtle';
}

/**
 * SarakStats Genérico (v6.0)
 * 
 * Exibe contadores e métricas-chave de forma elegante, servindo como
 * um mini-dashboard dinâmico para qualquer módulo.
 */
export const SarakStats = <TData extends Record<string, unknown> = Record<string, unknown>>({ endpoint, data, label, mapping }: SarakStatsProps<TData>) => {
    const { stats, loading, error } = useSarakStatsData<TData>(endpoint, data);
    const { getGridStyles } = useStructuralStyles();
    const statsGrid = getGridStyles(undefined, undefined, 'var(--sarak-layout-gap-md,16px)', 'statsStandard');

    // Lógica de Agregação Sarak v6.5 (Se for array, resumimos)
    const renderValue = (key: string) => {
        if (Array.isArray(stats)) {
            if (key === 'total' || key === 'count') return stats.length;
            if (key === 'active') return stats.filter(i => i.isActive === true || i.status === 'active').length;
            if (key === 'errors' || key === 'error') return stats.filter(i => i.status === 'error' || i.error_details).length;
            return stats.length;
        }
        
        const val = stats[key];
        if (val === undefined || val === null) return '0';
        if (typeof val === 'number' && val > 1000) return `${(val / 1000).toFixed(1)}k`;
        return val;
    };

    const keys = mapping 
        ? Object.keys(mapping) 
        : (Array.isArray(stats) 
            ? ['total', 'active', 'errors'] 
            : Object.keys(stats).filter(k => typeof stats[k] === 'number' || typeof stats[k] === 'string'));

    if (error) return null;

    // As classes de container query de `statsGrid` precisam de um ancestral
    // com `container-type`, nunca do próprio elemento.
    return (
        <div className="@container w-full">
            <div className={statsGrid.className} style={statsGrid.style}>
                {loading && !Object.keys(stats).length ? (
                    [...Array(4)].map((_, i) => (
                        <div key={`skel-${i}`} className="bg-[var(--color-theme-card,#1e293b)] border-[var(--border-color,#334155)] animate-pulse rounded-[var(--sarak-card-radius,12px)]" style={{ height: 'calc(var(--sarak-layout-gap-md,16px) * 6)' }} />
                    ))
                ) : (
                    keys.map((key, idx) => (
                        <div
                            key={key}
                            className="bg-[var(--color-theme-card,#1e293b)] border-[var(--border-color,#334155)] hover:bg-white/[0.04] transition-all group rounded-[var(--sarak-card-radius,12px)]"
                            style={{ padding: 'var(--sarak-layout-gap-md,16px)', transitionDuration: 'var(--duration-normal, 0.3s)' }}
                        >
                            <span className="text-2xs text-white/30 font-black uppercase tracking-widest block transition-colors group-hover:text-[var(--sarak-primary-color,#3b82f6)]" style={{ marginBottom: 'calc(var(--sarak-layout-gap-md,16px) / 6)' }}>
                                {mapping ? mapping[key] : key.replace(/_/g, ' ')}
                            </span>
                            <div className="flex items-center justify-between">
                                <motion.span
                                    key={`${key}-${renderValue(key)}`}
                                    initial={{ opacity: 0.5, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-2xl font-black text-white tracking-tighter"
                                    style={{ fontWeight: 'var(--sarak-h1-weight,700)' }}
                                >
                                    {String(renderValue(key) || '')}
                                </motion.span>
                                {(() => {
                                    const levels = ['primary', 'secondary', 'accent'];
                                    const level = levels[idx % levels.length];
                                    return (
                                        <div className="rounded-[var(--sarak-card-radius,12px)] transition-colors" style={{ padding: 'calc(var(--sarak-layout-gap-md,16px) / 3)', backgroundColor: `var(--sarak-primary-color-bg,rgba(59,130,246,0.1))`, transitionDuration: 'var(--duration-normal, 0.3s)' }}>
                                            <SarakIcon name="Activity" size={16} className="transition-colors" style={{ color: `var(--sarak-primary-color,#3b82f6)`, transitionDuration: 'var(--duration-normal, 0.3s)' }} />
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
