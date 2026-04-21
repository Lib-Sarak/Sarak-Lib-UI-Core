import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Activity } from 'lucide-react';
import api from '../shared/services/api';

interface SarakChartProps {
    endpoint: string;
    label?: string;
    mapping?: Record<string, string>; // { value_key: "Label", date_key: "Label" }
}

/**
 * SarakChart Genérico (v6.2)
 * 
 * Renderiza tendências de dados usando uma interface visual de alta fidelidade
 * com barras animadas em CSS/SVG, mantendo o padrão Glassmorphism.
 */
export const SarakChart: React.FC<SarakChartProps> = ({ endpoint, label, mapping }) => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get(endpoint);
            
            // Tenta localizar a lista de tendência nos dados retornados
            // Prioriza 'daily_trend' ou o próprio corpo se for lista
            const rawData = response.data.daily_trend || (Array.isArray(response.data) ? response.data : []);
            setData(rawData.slice(-15)); // Pega os últimos 15 pontos para manter a densidade visual
        } catch (err: any) {
            console.error(`[SarakChart] Falha ao carregar ${endpoint}:`, err);
            setError(err.message || 'Erro');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [endpoint]);

    const maxValue = Math.max(...data.map(d => d.tokens || d.value || 0), 1);

    return (
        <div className="bg-theme-card border-theme gap-theme flex flex-col relative overflow-hidden group rounded-theme" style={{ padding: 'var(--theme-pad, 1.5rem)', gap: 'var(--theme-gap, 1.5rem)' }}>
            {/* Contextual Glow Header */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] pointer-events-none" />

            <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center" style={{ gap: 'calc(var(--theme-gap) / 2)' }}>
                    <div className="bg-blue-500/10 rounded-2xl border border-blue-500/20" style={{ padding: 'calc(var(--theme-pad) / 3)' }}>
                        <TrendingUp size={16} className="text-blue-400" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-white tracking-tight" style={{ fontWeight: 'var(--heading-weight)' }}>{label}</h3>
                        <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Análise de Tendência em Tempo Real</p>
                    </div>
                </div>
                <div className="flex items-center bg-white/5 rounded-theme border border-theme" style={{ gap: 'calc(var(--theme-gap) / 3)', padding: 'calc(var(--theme-pad) / 3) calc(var(--theme-pad) / 1.5)' }}>
                    <Activity size={12} className="text-emerald-400 animate-pulse" />
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-tighter">Live Monitor</span>
                </div>
            </div>

            <div className="h-48 flex items-end justify-between relative z-10" style={{ gap: 'calc(var(--theme-gap) / 4)' }}>
                {loading ? (
                    <div className="w-full h-full flex items-center justify-center border border-dashed border-white/5 rounded-3xl opacity-20">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Sincronizando Datastream...</span>
                    </div>
                ) : data.length > 0 ? (
                    data.map((item, idx) => {
                        const val = item.tokens || item.value || 0;
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
                                    className="w-full bg-gradient-to-t from-blue-600/20 to-blue-400/60 rounded-t-lg group-hover/item:from-blue-500 group-hover/item:to-blue-300 transition-all relative"
                                    style={{ transitionDuration: 'var(--animation-speed, 0.3s)' }}
                                >
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-blue-900 text-[10px] font-black px-2 py-1 rounded shadow-2xl opacity-0 group-hover/item:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-30">
                                        {val.toLocaleString()}
                                    </div>
                                </motion.div>
                                <div className="text-[7px] font-bold text-white/10 uppercase mt-3 rotate-45 origin-left hidden lg:block">
                                   {item.date?.split('-').slice(1).join('/') || ''}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="w-full h-full flex items-center justify-center border border-dashed border-white/5 rounded-3xl opacity-20">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Aguardando Dados Históricos</span>
                    </div>
                )}
            </div>

            <div className="border-t border-theme flex justify-between items-center opacity-40" style={{ paddingTop: 'calc(var(--theme-gap) / 2)' }}>
                <span className="text-[8px] font-black text-white uppercase tracking-widest">Sarak Visual Metrics engine v1.0</span>
                <span className="text-[8px] font-bold text-white/40 uppercase">Performance Agnostic Layer</span>
            </div>
        </div>
    );
};

export default SarakChart;
