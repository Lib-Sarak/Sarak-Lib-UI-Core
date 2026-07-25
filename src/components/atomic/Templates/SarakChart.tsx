import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Activity } from 'lucide-react';
import api from '../../../shared/services/api';
import { useStructuralStyles } from '../hooks/useStructuralStyles';
import { twMerge } from 'tailwind-merge';
import { useChartData } from './hooks/useChartData';

export interface SarakChartProps {
    endpoint: string;
    label?: string;
    mapping?: Record<string, string>; // { value_key: "Label", date_key: "Label" }
    role?: 'primary' | 'secondary' | 'neutral' | 'accent';
    density?: 'compact' | 'standard' | 'spacious';
    importance?: 'hero' | 'base' | 'subtle';
}

interface ChartDatum extends Record<string, unknown> {
    tokens?: number;
    value?: number;
    date?: string;
}

/**
 * SarakChart Genérico (v6.2)
 * 
 * Renderiza tendências de dados usando uma interface visual de alta fidelidade
 * com barras animadas em CSS/SVG, mantendo o padrão Glassmorphism.
 */
export const SarakChart: React.FC<SarakChartProps> = ({ endpoint, label, mapping }) => {
    const { data, loading, error } = useChartData<ChartDatum>(endpoint);

    const maxValue = Math.max(...data.map((d) => (d.tokens as number) || (d.value as number) || 0), 1);
    const { getContainerStyles, getFlexStyles } = useStructuralStyles();
    const containerLayout = getContainerStyles();
    const barStack = getFlexStyles('column', undefined, undefined, '0px');

    return (
        <div className={twMerge("bg-[var(--color-theme-card,#1e293b)] border-[var(--border-color,#334155)] relative overflow-hidden group rounded-[var(--sarak-card-radius,12px)]", containerLayout.className)} style={containerLayout.style}>
            {/* Contextual Glow Header */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--sarak-primary-color-bg,rgba(59,130,246,0.1))] blur-[var(--sarak-empty-state-orb-blur,100px)] pointer-events-none" />

            <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center" style={{ gap: 'calc(var(--sarak-layout-gap-md,16px) / 2)' }}>
                    <div className="bg-[var(--sarak-primary-color-bg,rgba(59,130,246,0.1))] rounded-2xl border border-[var(--border-color,#334155)]" style={{ padding: 'calc(var(--sarak-layout-gap-md,16px) / 3)' }}>
                        <TrendingUp size={16} className="text-[var(--sarak-primary-color,#3b82f6)]" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-[var(--color-theme-title,#ffffff)] tracking-tight" style={{ fontWeight: 'var(--sarak-h1-weight,700)' }}>{label}</h3>
                        <p className="text-2xs font-bold text-[var(--text-muted,#94a3b8)] uppercase tracking-widest">Análise de Tendência em Tempo Real</p>
                    </div>
                </div>
                <div className="flex items-center bg-[var(--text-muted,#94a3b8)]/5 rounded-[var(--sarak-card-radius,12px)] border border-[var(--border-color,#334155)]" style={{ gap: 'calc(var(--sarak-layout-gap-md,16px) / 3)', padding: 'calc(var(--sarak-layout-gap-md,16px) / 3) calc(var(--sarak-layout-gap-md,16px) / 1.5)' }}>
                    <Activity size={12} className="text-[var(--sarak-status-success-color,#22c55e)] animate-pulse" />
                    <span className="text-2xs font-black text-[var(--text-muted,#94a3b8)] uppercase tracking-tighter">Live Monitor</span>
                </div>
            </div>

            <div className="h-48 flex items-end justify-between relative z-10" style={{ gap: 'calc(var(--sarak-layout-gap-md,16px) / 4)' }}>
                {loading ? (
                    <div className="w-full h-full flex items-center justify-center border border-dashed border-white/5 rounded-3xl opacity-20">
                        <span className="text-2xs font-black uppercase animate-pulse" style={{ letterSpacing: 'var(--sarak-tracking-wide, 0.3em)' }}>Sincronizando Datastream...</span>
                    </div>
                ) : data.length > 0 ? (
                    data.map((item, idx) => {
                        const val = (item.tokens as number) || (item.value as number) || 0;
                        const height = (val / maxValue) * 100;
                        return (
                            <div key={idx} className={`flex-1 ${barStack.className} items-center group/item h-full justify-end`} style={barStack.style}>
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${Math.max(height, 5)}%` }}
                                        transition={{ 
                                            delay: idx * 0.05, 
                                            duration: (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--animation-speed')) || 0.5) * 1.5, 
                                            ease: "circOut" 
                                        }}
                                        className="w-full bg-gradient-to-t from-[var(--sarak-shadow-glow,rgba(59,130,246,0.5))] to-[var(--sarak-primary-color,#3b82f6)] rounded-t-lg group-hover/item:brightness-125 transition-all relative"
                                        style={{ transitionDuration: 'var(--duration-normal, 0.3s)' }}
                                    >
                                        <div
                                            className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[var(--color-theme-title,#ffffff)] text-[var(--color-theme-card,#1e293b)] text-2xs font-black rounded shadow-2xl opacity-0 group-hover/item:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-30"
                                            style={{ padding: 'calc(var(--sarak-layout-gap-md,16px) * 0.25) var(--sarak-layout-gap-sm, 8px)' }}
                                        >
                                            {val.toLocaleString()}
                                        </div>
                                    </motion.div>
                                <div className="font-bold text-[var(--text-muted,#94a3b8)] uppercase rotate-45 origin-left hidden lg:block" style={{ marginTop: 'calc(var(--sarak-layout-gap-md,16px) * 0.75)', fontSize: 'var(--sarak-type-scale-micro, 7px)' }}>
                                   {item.date ? String(item.date).split('-').slice(1).join('/') : ''}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="w-full h-full flex items-center justify-center border border-dashed border-white/5 rounded-3xl opacity-20">
                        <span className="text-2xs font-black uppercase" style={{ letterSpacing: 'var(--sarak-tracking-wide, 0.3em)' }}>Aguardando Dados Históricos</span>
                    </div>
                )}
            </div>

            <div className="border-t border-[var(--border-color,#334155)] flex justify-between items-center opacity-40" style={{ paddingTop: 'calc(var(--sarak-layout-gap-md,16px) / 2)' }}>
                <span className="text-3xs font-black text-[var(--color-theme-title,#ffffff)] uppercase tracking-widest">Sarak Visual Metrics engine v1.0</span>
                <span className="text-3xs font-bold text-[var(--text-muted,#94a3b8)] uppercase">Performance Agnostic Layer</span>
            </div>
        </div>
    );
};

export default SarakChart;

