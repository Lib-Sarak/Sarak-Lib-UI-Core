import { motion } from 'framer-motion';
import { SarakIcon } from '../Icon/SarakIcon';
import { SarakAlert } from '../Feedback/SarakAlert';
import { SarakDataEmpty } from '../Feedback/SarakDataEmpty';
import { SarakSpinner } from '../Feedback/SarakSpinner';
import { useLibraryText } from '../../../core/i18n/useLibraryText';
import { useStructuralStyles } from '../hooks/useStructuralStyles';
import { mergeSarakClasses } from '../hooks/mergeSarakClasses';
import { useChartData } from './hooks/useChartData';

export interface SarakChartProps<TData extends Record<string, unknown> = Record<string, unknown>> {
    /** Dado já carregado pelo host; quando presente, tem prioridade sobre load. */
    data?: TData[];
    /** Carrega os pontos pelo mecanismo escolhido pelo host. */
    load?: () => Promise<TData[]>;
    /** Rótulo opcional fornecido pelo host. */
    label?: string;
    /** Chaves dos campos de valor e rótulo; os defaults são value e date. */
    mapping?: { value?: string; date?: string };
    role?: 'primary' | 'secondary' | 'neutral' | 'accent';
    density?: 'compact' | 'standard' | 'spacious';
    importance?: 'hero' | 'base' | 'subtle';
}

function numericValue(item: Record<string, unknown>, key: string): number {
    const value = item[key];
    return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

export const SarakChart = <TData extends Record<string, unknown> = Record<string, unknown>>({
    data,
    load,
    label,
    mapping,
}: SarakChartProps<TData>) => {
    const text = useLibraryText();
    const { data: records, loading, error } = useChartData<TData>(data, load);
    const { getContainerStyles, getFlexStyles } = useStructuralStyles();
    const containerLayout = getContainerStyles();
    const barStack = getFlexStyles('column', undefined, undefined, '0px');
    const valueKey = mapping?.value ?? 'value';
    const dateKey = mapping?.date ?? 'date';
    const maximum = Math.max(...records.map((item) => numericValue(item, valueKey)), 1);

    return (
        <div className={mergeSarakClasses(
            'bg-[var(--color-theme-card,#1e293b)] border-[var(--border-color,#334155)] relative overflow-hidden group rounded-[var(--sarak-card-radius,12px)]',
            containerLayout.className,
        )} style={containerLayout.style}>
            {label && (
                <div className="flex items-center relative z-10" style={{ gap: 'calc(var(--sarak-layout-gap-md,16px) / 2)' }}>
                    <SarakIcon name="TrendingUp" size={16} className="text-[var(--sarak-primary-color,#3b82f6)]" />
                    <h3 className="text-xl font-black text-theme-title tracking-tight" style={{ fontWeight: 'var(--sarak-h1-weight,700)' }}>
                        {label}
                    </h3>
                </div>
            )}
            <div className="h-48 flex items-end justify-between relative z-10" style={{ gap: 'calc(var(--sarak-layout-gap-md,16px) / 4)' }}>
                {loading ? (
                    <div className="w-full h-full flex items-center justify-center">
                        <SarakSpinner />
                    </div>
                ) : error ? (
                    <SarakAlert variant="error" title={text('dataLoadErrorTitle')} message={error} />
                ) : records.length > 0 ? (
                    records.map((item, index) => {
                        const value = numericValue(item, valueKey);
                        const height = (value / maximum) * 100;
                        return (
                            <div key={index} className={'flex-1 ' + barStack.className + ' items-center group/item h-full justify-end'} style={barStack.style}>
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: Math.max(height, 5) + '%' }}
                                    transition={{
                                        delay: index * 0.05,
                                        duration: (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--animation-speed')) || 0.5) * 1.5,
                                        ease: 'circOut',
                                    }}
                                    className="w-full bg-gradient-to-t from-[var(--sarak-shadow-glow,rgba(59,130,246,0.5))] to-[var(--sarak-primary-color,#3b82f6)] rounded-t-lg group-hover/item:brightness-125 transition-all relative"
                                    style={{ transitionDuration: 'var(--duration-normal, 0.3s)' }}
                                >
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[var(--color-theme-title,#ffffff)] text-[var(--color-theme-card,#1e293b)] text-2xs font-black rounded shadow-2xl opacity-0 group-hover/item:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-30">
                                        {value.toLocaleString()}
                                    </div>
                                </motion.div>
                                <div className="font-bold text-theme-muted uppercase rotate-45 origin-left hidden lg:block" style={{ marginTop: 'calc(var(--sarak-layout-gap-md,16px) * 0.75)', fontSize: 'var(--sarak-type-scale-micro, 7px)' }}>
                                    {String(item[dateKey] ?? '')}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <SarakDataEmpty />
                    </div>
                )}
            </div>
        </div>
    );
};

export default SarakChart;
