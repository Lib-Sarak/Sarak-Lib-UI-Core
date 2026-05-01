import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    TrendingUp, 
    TrendingDown, 
    Activity, 
    RefreshCw,
    AlertCircle
} from 'lucide-react';
import api from '../../../shared/services/api';

interface SarakStatsProps {
    endpoint: string;
    label?: string;
    mapping?: Record<string, string>; // { key_in_json: "Label do Contador" }
}

/**
 * SarakStats Genérico (v6.0)
 * 
 * Exibe contadores e métricas-chave de forma elegante, servindo como
 * um mini-dashboard dinâmico para qualquer módulo.
 */
export const SarakStats: React.FC<SarakStatsProps> = ({ endpoint, label, mapping }) => {
    const [stats, setStats] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get(endpoint);
            setStats(response.data);
        } catch (err: any) {
            console.error(`[SarakStats] Falha ao carregar ${endpoint}:`, err);
            setError(err.message || 'Erro');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [endpoint]);

    // Lógica de Agregação Sarak v6.5 (Se for array, resumimos)
    const renderValue = (key: string) => {
        if (Array.isArray(stats)) {
            if (key === 'total' || key === 'count') return stats.length;
            
            // Suporte a contagem condicional (ex: "active" conta itens onde isActive=true)
            if (key === 'active') return stats.filter(i => i.isActive === true || i.status === 'active').length;
            if (key === 'errors' || key === 'error') return stats.filter(i => i.status === 'error' || i.error_details).length;
            
            return stats.length; // Fallback
        }
        
        const val = stats[key];
        if (typeof val === 'number' && val > 1000) return `${(val / 1000).toFixed(1)}k`;
        return val ?? '0';
    };

    const keys = mapping 
        ? Object.keys(mapping) 
        : (Array.isArray(stats) 
            ? ['total', 'active', 'errors'] 
            : Object.keys(stats).filter(k => typeof stats[k] === 'number' || typeof stats[k] === 'string'));

    if (error) return null;

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4" style={{ gap: 'var(--theme-gap, 1.5rem)' }}>
            {loading ? (
                [...Array(4)].map((_, i) => (
                    <div key={`skel-${i}`} className="bg-theme-card border-theme animate-pulse rounded-theme" style={{ height: 'calc(var(--theme-pad) * 6)' }} />
                ))
            ) : (
                keys.map((key, idx) => (
                    <motion.div
                        key={key}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--animation-speed')) || 0.5, delay: idx * 0.05 }}
                        className="bg-theme-card border-theme hover:bg-white/[0.04] transition-all group rounded-theme"
                        style={{ padding: 'var(--theme-pad, 1.5rem)', transitionDuration: 'var(--animation-speed, 0.5s)' }}
                    >
                        <span className="text-2xs text-white/30 font-black uppercase tracking-widest block transition-colors group-hover:text-[var(--theme-primary)]" style={{ marginBottom: 'calc(var(--theme-gap) / 6)' }}>
                            {mapping ? mapping[key] : key.replace(/_/g, ' ')}
                        </span>
                        <div className="flex items-center justify-between">
                            <span className="text-2xl font-black text-white tracking-tighter" style={{ fontWeight: 'var(--heading-weight)' }}>
                                {renderValue(key)}
                            </span>
                            {(() => {
                                const levels = ['primary', 'secondary', 'accent'];
                                const level = levels[idx % levels.length];
                                return (
                                    <div className="rounded-theme transition-colors" style={{ padding: 'calc(var(--theme-pad) / 3)', backgroundColor: `var(--theme-${level}-bg)`, transitionDuration: 'var(--animation-speed, 0.3s)' }}>
                                        <Activity size={16} className="transition-colors" style={{ color: `var(--theme-${level})`, transitionDuration: 'var(--animation-speed, 0.3s)' }} />
                                    </div>
                                );
                            })()}
                        </div>
                    </motion.div>
                ))
            )}
        </div>
    );
};

