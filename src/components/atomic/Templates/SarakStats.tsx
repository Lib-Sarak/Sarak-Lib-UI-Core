import { motion } from 'framer-motion';
import { useSarakStatsData } from './hooks/useSarakStatsData';
import { useStructuralStyles } from '../hooks/useStructuralStyles';
import { useLibraryText } from '../../../core/i18n/useLibraryText';
import { SarakDataEmpty } from '../Feedback/SarakDataEmpty';
import { SarakValue } from '../Atoms/SarakValue';
import { SarakDataErrorNotice } from './SarakDataErrorNotice';
import { SarakDataFreshness } from './SarakDataFreshness';
import type { SarakValueFormat } from '../../../shared/format';
import type { ReactElement, ReactNode } from 'react';

const STAT_SKELETON_COUNT = 4;
const STAT_VALUE_INITIAL_OPACITY = 0.5;

export interface SarakStatsMetricConfig {
    icon?: ReactNode;
    delta?: number;
    format?: SarakValueFormat;
    label?: string;
    hint?: string;
}

export interface SarakStatsProps<TData extends Record<string, unknown>> {
    /** Dado já carregado pelo host; quando presente, tem prioridade sobre load. */
    data?: TData;
    /** Carrega as métricas pelo mecanismo escolhido pelo host. */
    load?: () => Promise<TData>;
    /** Horário do dado entregue diretamente pelo host. */
    updatedAt?: Date | string | number;
    /** Callback opcional para tentar novamente após uma falha. */
    onRetry?: () => void;
    /** Título opcional fornecido pelo host. */
    label?: string;
    /** Define os rótulos exibidos; omitido, usa as chaves do dado recebido. */
    mapping?: Record<string, string>;
    /** Configuração visual e de formato por chave de métrica. */
    metrics?: Partial<Record<keyof TData & string, SarakStatsMetricConfig>>;
    role?: 'primary' | 'secondary' | 'neutral' | 'accent';
    density?: 'compact' | 'standard' | 'spacious';
    importance?: 'hero' | 'base' | 'subtle';
}

interface SarakStatsGridProps<TData extends Record<string, unknown>> {
    stats: TData;
    keys: string[];
    loading: boolean;
    mapping?: Record<string, string>;
    metrics?: Partial<Record<keyof TData & string, SarakStatsMetricConfig>>;
}

const SarakStatsGrid = <TData extends Record<string, unknown>>({ stats, keys, loading, mapping, metrics }: SarakStatsGridProps<TData>): ReactElement => {
    if (loading && keys.length === 0) {
        return <>{Array.from({ length: STAT_SKELETON_COUNT }, (_, index) => <div key={'skeleton-' + index} className="card animate-pulse rounded-[var(--sarak-card-radius,12px)]" style={{ height: 'calc(var(--sarak-layout-gap-md,16px) * 6)' }} />)}</>;
    }
    if (keys.length === 0) return <div role="status" className="col-span-full"><SarakDataEmpty /></div>;
    return <>{keys.map((key) => <SarakStatsMetric key={key} metricKey={key} value={stats[key]} label={metrics?.[key]?.label ?? mapping?.[key] ?? key.replace(/_/g, ' ')} config={metrics?.[key]} />)}</>;
};

export const SarakStats = <TData extends Record<string, unknown> = Record<string, unknown>>({
    data,
    load,
    updatedAt,
    onRetry,
    label,
    mapping,
    metrics,
}: SarakStatsProps<TData>): ReactElement => {
    const text = useLibraryText();
    const { stats, loading, error, updatedAt: lastReadAt, loadData } = useSarakStatsData<TData>(data, load, updatedAt);
    const { getGridStyles } = useStructuralStyles();
    const statsGrid = getGridStyles(undefined, undefined, 'var(--sarak-layout-gap-md,16px)', 'statsStandard');
    const keys = mapping ? Object.keys(mapping) : Object.keys(stats);
    const hasData = Object.keys(stats).length > 0;
    const retry = onRetry ?? (() => void loadData());

    if (error && !hasData) {
        return <SarakDataErrorNotice error={error} />;
    }

    return (
        <div className="@container w-full">
            {loading && hasData && <span className="sr-only" role="status" aria-live="polite">{text('spinnerLoading')}</span>}
            {label && <h3 className="text-theme-title font-bold">{label}</h3>}
            {error && <SarakDataErrorNotice error={error} onRetry={retry} />}
            <SarakDataFreshness updatedAt={lastReadAt} stale={Boolean(error && hasData)} />
            <div className={statsGrid.className} style={statsGrid.style}><SarakStatsGrid stats={stats} keys={keys} loading={loading} mapping={mapping} metrics={metrics} /></div>
        </div>
    );
};

interface SarakStatsMetricProps {
    metricKey: string;
    value: unknown;
    label: string;
    config?: SarakStatsMetricConfig;
}

const SarakStatsMetric = ({ metricKey, value, label, config }: SarakStatsMetricProps): ReactElement => {
    const displayValue = value instanceof Date || typeof value === 'number' || typeof value === 'string'
        ? value
        : value == null ? null : String(value);

    return (
        <div
            className="card hover:bg-white/[0.04] transition-all rounded-[var(--sarak-card-radius,12px)]"
            style={{ padding: 'var(--sarak-layout-gap-md,16px)', transitionDuration: 'var(--duration-normal, 0.3s)' }}
        >
            {config?.icon && <div className="text-theme-muted" aria-hidden="true">{config.icon}</div>}
            <span className="text-2xs text-theme-muted font-black uppercase tracking-widest block" style={{ marginBottom: 'calc(var(--sarak-layout-gap-md,16px) / 6)' }}>
                {label}
            </span>
            <motion.div
                key={metricKey + '-' + String(value ?? '')}
                initial={{ opacity: STAT_VALUE_INITIAL_OPACITY, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ fontWeight: 'var(--sarak-h1-weight,900)' }}
            >
                <SarakValue value={displayValue} format={config?.format} size="md" />
            </motion.div>
            {config?.delta !== undefined && Number.isFinite(config.delta) && (
                <div className="text-sm font-semibold" style={{ marginTop: 'calc(var(--sarak-layout-gap-md,16px) / 6)' }}>
                    {config.delta > 0 && '+'}
                    <SarakValue value={config.delta} format={{ type: 'number' }} size="sm" />
                </div>
            )}
            {config?.hint && <p className="text-xs text-theme-muted" style={{ marginTop: 'calc(var(--sarak-layout-gap-md,16px) / 6)' }}>{config.hint}</p>}
        </div>
    );
};
