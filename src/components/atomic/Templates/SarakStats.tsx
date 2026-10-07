import { motion } from 'framer-motion';
import { useSarakStatsData } from './hooks/useSarakStatsData';
import { useStructuralStyles } from '../hooks/useStructuralStyles';
import { useLibraryText } from '../../../core/i18n/useLibraryText';
import { SarakAlert } from '../Feedback/SarakAlert';

export interface SarakStatsProps<TData extends Record<string, unknown>> {
    /** Dado já carregado pelo host; quando presente, tem prioridade sobre load. */
    data?: TData;
    /** Carrega as métricas pelo mecanismo escolhido pelo host. */
    load?: () => Promise<TData>;
    /** Título opcional fornecido pelo host. */
    label?: string;
    /** Define os rótulos exibidos; omitido, usa as chaves do dado recebido. */
    mapping?: Record<string, string>;
    role?: 'primary' | 'secondary' | 'neutral' | 'accent';
    density?: 'compact' | 'standard' | 'spacious';
    importance?: 'hero' | 'base' | 'subtle';
}

export const SarakStats = <TData extends Record<string, unknown> = Record<string, unknown>>({
    data,
    load,
    label,
    mapping,
}: SarakStatsProps<TData>) => {
    const text = useLibraryText();
    const { stats, loading, error } = useSarakStatsData<TData>(data, load);
    const { getGridStyles } = useStructuralStyles();
    const statsGrid = getGridStyles(undefined, undefined, 'var(--sarak-layout-gap-md,16px)', 'statsStandard');
    const keys = mapping ? Object.keys(mapping) : Object.keys(stats);

    if (error) {
        return <SarakAlert variant="error" title={text('dataLoadErrorTitle')} message={error} />;
    }

    return (
        <div className="@container w-full">
            {label && <h3 className="text-theme-title font-bold">{label}</h3>}
            <div className={statsGrid.className} style={statsGrid.style}>
                {loading && keys.length === 0 ? (
                    Array.from({ length: 4 }, (_, index) => (
                        <div
                            key={'skeleton-' + index}
                            className="bg-[var(--color-theme-card,#1e293b)] border-[var(--border-color,#334155)] animate-pulse rounded-[var(--sarak-card-radius,12px)]"
                            style={{ height: 'calc(var(--sarak-layout-gap-md,16px) * 6)' }}
                        />
                    ))
                ) : (
                    keys.map((key) => (
                        <div
                            key={key}
                            className="bg-[var(--color-theme-card,#1e293b)] border-[var(--border-color,#334155)] hover:bg-white/[0.04] transition-all rounded-[var(--sarak-card-radius,12px)]"
                            style={{ padding: 'var(--sarak-layout-gap-md,16px)', transitionDuration: 'var(--duration-normal, 0.3s)' }}
                        >
                            <span className="text-2xs text-theme-muted font-black uppercase tracking-widest block" style={{ marginBottom: 'calc(var(--sarak-layout-gap-md,16px) / 6)' }}>
                                {mapping?.[key] ?? key.replace(/_/g, ' ')}
                            </span>
                            <motion.span
                                key={key + '-' + String(stats[key] ?? '')}
                                initial={{ opacity: 0.5, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-2xl font-black text-theme-title tracking-tighter"
                                style={{ fontWeight: 'var(--sarak-h1-weight,700)' }}
                            >
                                {String(stats[key] ?? '')}
                            </motion.span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
