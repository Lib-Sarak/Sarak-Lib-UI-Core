import { motion } from 'framer-motion';
import { SarakIcon } from '../Icon/SarakIcon';
import { SarakDataEmpty } from '../Feedback/SarakDataEmpty';
import { SarakSpinner } from '../Feedback/SarakSpinner';
import { useLibraryText } from '../../../core/i18n/useLibraryText';
import { useStructuralStyles } from '../hooks/useStructuralStyles';
import { useMotionTokens } from '../hooks/useMotionTokens';
import { mergeSarakClasses } from '../hooks/mergeSarakClasses';
import { useChartData } from './hooks/useChartData';
import { SarakDataErrorNotice } from './SarakDataErrorNotice';
import { SarakDataFreshness } from './SarakDataFreshness';
import type { CSSProperties, ReactElement } from 'react';

export interface SarakChartProps<TData extends Record<string, unknown> = Record<string, unknown>> {
    /** Dado já carregado pelo host; quando presente, tem prioridade sobre load. */
    data?: TData[];
    /** Carrega os pontos pelo mecanismo escolhido pelo host. */
    load?: () => Promise<TData[]>;
    /** Horário do dado entregue diretamente pelo host. */
    updatedAt?: Date | string | number;
    /** Callback opcional para tentar novamente após uma falha. */
    onRetry?: () => void;
    /** Rótulo opcional fornecido pelo host. */
    label?: string;
    /** Chaves dos campos de valor e rótulo; os defaults são value e date. */
    mapping?: { value?: string; date?: string };
}

function numericValue(item: Record<string, unknown>, key: string): number {
    const value = item[key];
    return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

interface ChartBarsProps<TData extends Record<string, unknown>> {
    records: TData[];
    valueKey: string;
    dateKey: string;
    maximum: number;
    barStack: { className: string; style: CSSProperties };
}

function ChartBars<TData extends Record<string, unknown>>({ records, valueKey, dateKey, maximum, barStack }: ChartBarsProps<TData>): ReactElement {
    const { staggerDelay, durations } = useMotionTokens();
    return <>
        {records.map((item, index) => {
            const value = numericValue(item, valueKey);
            const height = (value / maximum) * 100;
            return (
                <div key={index} className={'flex-1 ' + barStack.className + ' items-center group/item h-full justify-end'} style={barStack.style}>
                    <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: Math.max(height, 5) + '%' }}
                        transition={{
                            delay: index * staggerDelay,
                            duration: durations.slow,
                            ease: 'circOut',
                        }}
                        className="w-full bg-gradient-to-t from-[var(--sarak-shadow-glow,rgba(25,227,240,0.18))] to-[var(--sarak-primary-color,#19e3f0)] rounded-t-lg group-hover/item:brightness-125 transition-all relative"
                        style={{ transitionDuration: 'var(--duration-normal, 0.3s)' }}
                    >
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[var(--color-theme-title,#f2f6fb)] text-[var(--color-theme-card,#101622)] text-2xs font-black rounded shadow-2xl opacity-0 group-hover/item:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-30">
                            {value.toLocaleString()}
                        </div>
                    </motion.div>
                    <div className="font-bold text-theme-muted uppercase rotate-45 origin-left hidden lg:block" style={{ marginTop: 'calc(var(--sarak-layout-gap-md,16px) * 0.75)', fontSize: 'var(--sarak-type-scale-micro, 7px)' }}>
                        {String(item[dateKey] ?? '')}
                    </div>
                </div>
            );
        })}
    </>;
}

interface ChartPlotProps<TData extends Record<string, unknown>> extends ChartBarsProps<TData> {
    loading: boolean;
    error: string | null;
    hasData: boolean;
}

function ChartPlot<TData extends Record<string, unknown>>(props: ChartPlotProps<TData>): ReactElement {
    if (props.loading && !props.hasData) return <div className="w-full h-full flex items-center justify-center"><SarakSpinner /></div>;
    if (props.error && !props.hasData) return <SarakDataErrorNotice error={props.error} />;
    if (props.hasData) return <ChartBars {...props} />;
    return <div className="w-full h-full flex items-center justify-center"><SarakDataEmpty /></div>;
}

function ChartHeading({ label }: { label?: string }): ReactElement | null {
    if (!label) return null;
    return (
        <div className="flex items-center relative z-10" style={{ gap: 'calc(var(--sarak-layout-gap-md,16px) / 2)' }}>
            <SarakIcon name="TrendingUp" size={16} className="text-[var(--sarak-primary-color,#19e3f0)]" />
            <h3 className="text-xl font-black text-theme-title tracking-tight" style={{ fontWeight: 'var(--sarak-h1-weight,800)' }}>
                {label}
            </h3>
        </div>
    );
}

export const SarakChart = <TData extends Record<string, unknown> = Record<string, unknown>>({
    data,
    load,
    updatedAt,
    onRetry,
    label,
    mapping,
}: SarakChartProps<TData>): ReactElement => {
    const text = useLibraryText();
    const { data: records, loading, error, updatedAt: lastReadAt, loadData } = useChartData<TData>(data, load, updatedAt);
    const hasData = records.length > 0;
    const retry = onRetry ?? (() => void loadData());
    const { getContainerStyles, getFlexStyles } = useStructuralStyles();
    const containerLayout = getContainerStyles();
    const barStack = getFlexStyles('column', undefined, undefined, '0px');
    const valueKey = mapping?.value ?? 'value';
    const dateKey = mapping?.date ?? 'date';
    const maximum = Math.max(...records.map((item) => numericValue(item, valueKey)), 1);

    return <div className={mergeSarakClasses('card relative overflow-hidden group rounded-[var(--sarak-card-radius,10px)]', containerLayout.className)} style={containerLayout.style}>
        <ChartHeading label={label} />
        {loading && hasData && <span className="sr-only" role="status" aria-live="polite">{text('spinnerLoading')}</span>}
        {error && hasData && <SarakDataErrorNotice error={error} onRetry={retry} />}
        <SarakDataFreshness updatedAt={lastReadAt} stale={Boolean(error && hasData)} />
        <div className="h-48 flex items-end justify-between relative z-10" style={{ gap: 'calc(var(--sarak-layout-gap-md,16px) / 4)' }}>
            <ChartPlot records={records} loading={loading} error={error} hasData={hasData} valueKey={valueKey} dateKey={dateKey} maximum={maximum} barStack={barStack} />
        </div>
    </div>;
};

export default SarakChart;
