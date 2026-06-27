import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Activity } from 'lucide-react';
import api from '../../../shared/services/api';
import { useStructuralStyles } from '../hooks/useStructuralStyles';
import { twMerge } from 'tailwind-merge';
import { useChartData } from './hooks/useChartData';

interface SarakChartProps {
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
    const { getContainerStyles } = useStructuralStyles();
    const containerLayout = getContainerStyles();

    return (
        <div className={twMerge("bg-[var(--sx-color-surface-base)] border-[var(--sx-color-border-base)] relative overflow-hidden group rounded-[var(--sx-radius-md)]", containerLayout.className)} style={containerLayout.style}>
            {/* Contextual Glow Header */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--sx-color-primary-surface)] blur-[100px] pointer-events-none" />

            <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center" style={{ gap: 'calc(var(--sx-spacing-md) / 2)' }}>
                    <div className="bg-[var(--sx-color-primary-surface)] rounded-2xl border border-[var(--sx-color-border-base)]" style={{ padding: 'calc(var(--sx-spacing-md) / 3)' }}>
                        <TrendingUp size={16} className="text-[var(--sx-color-primary-base)]" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-[var(--sx-color-text-title)] tracking-tight" style={{ fontWeight: 'var(--heading-weight)' }}>{label}</h3>
                        <p className="text-2xs font-bold text-[var(--sx-color-text-muted)] uppercase tracking-widest">Análise de Tendência em Tempo Real</p>
                    </div>
                </div>
                <div className="flex items-center bg-[var(--sx-color-text-muted)]/5 rounded-[var(--sx-radius-md)] border border-[var(--sx-color-border-base)]" style={{ gap: 'calc(var(--sx-spacing-md) / 3)', padding: 'calc(var(--sx-spacing-md) / 3) calc(var(--sx-spacing-md) / 1.5)' }}>
                    <Activity size={12} className="text-[var(--sx-color-success-base)] animate-pulse" />
                    <span className="text-2xs font-black text-[var(--sx-color-text-muted)] uppercase tracking-tighter">Live Monitor</span>
                </div>
            </div>

            <div className="h-48 flex items-end justify-between relative z-10" style={{ gap: 'calc(var(--sx-spacing-md) / 4)' }}>
                {loading ? (
                    <div className="w-full h-full flex items-center justify-center border border-dashed border-white/5 rounded-3xl opacity-20">
                        <span className="text-2xs font-black uppercase tracking-[0.3em] animate-pulse">Sincronizando Datastream...</span>
                    </div>
                ) : data.length > 0 ? (
                    data.map((item, idx) => {
                        const val = (item.tokens as number) || (item.value as number) || 0;
                        const height = (val / maxValue) * 100;
                        return (
                            <div key={idx} className="flex-1 flex flex-col items-center group/item h-full justify-end">
                                    <motion.div 
                                        initial={{ height: 0 }}
                                        animate={{ height: `${Math.max(height, 5)}%` }}
                                        transition={{ 
                                            delay: idx * 0.05, 
                                            duration: (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--animation-speed')) || 0.5) * 1.5, 
                                            ease: "circOut" 
                                        }}
                                        className="w-full bg-gradient-to-t from-[var(--sx-color-primary-glow)] to-[var(--sx-color-primary-base)] rounded-t-lg group-hover/item:brightness-125 transition-all relative"
                                        style={{ transitionDuration: 'var(--animation-speed, 0.3s)' }}
                                    >
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[var(--sx-color-text-title)] text-[var(--sx-color-surface-base)] text-2xs font-black px-2 py-1 rounded shadow-2xl opacity-0 group-hover/item:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-30">
                                            {val.toLocaleString()}
                                        </div>
                                    </motion.div>
                                <div className="text-[7px] font-bold text-[var(--sx-color-text-muted)] uppercase mt-3 rotate-45 origin-left hidden lg:block">
                                   {item.date ? String(item.date).split('-').slice(1).join('/') : ''}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="w-full h-full flex items-center justify-center border border-dashed border-white/5 rounded-3xl opacity-20">
                        <span className="text-2xs font-black uppercase tracking-[0.3em]">Aguardando Dados Históricos</span>
                    </div>
                )}
            </div>

            <div className="border-t border-[var(--sx-color-border-base)] flex justify-between items-center opacity-40" style={{ paddingTop: 'calc(var(--sx-spacing-md) / 2)' }}>
                <span className="text-3xs font-black text-[var(--sx-color-text-title)] uppercase tracking-widest">Sarak Visual Metrics engine v1.0</span>
                <span className="text-3xs font-bold text-[var(--sx-color-text-muted)] uppercase">Performance Agnostic Layer</span>
            </div>
        </div>
    );
};

export default SarakChart;

