import type { CSSProperties, ReactElement } from 'react';
import type { SarakValueFormat } from '../../../shared/format';
import { sarakFormatCurrency, sarakFormatDate, sarakFormatNumber, sarakFormatPercent } from '../../../shared/format';
import { useSarakUIOptional } from '../../../core/Provider/SarakUIProvider';

export interface SarakValueProps {
    value: number | Date | string | null | undefined;
    format?: SarakValueFormat;
    locale?: string;
    signColor?: boolean;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const formatValue = (value: SarakValueProps['value'], format: SarakValueFormat | undefined, locale?: string): string => {
    if (typeof value === 'number' && !Number.isFinite(value)) return '';
    if (!format) {
        return value == null ? '' : String(value);
    }
    if (format.type === 'date') {
        return sarakFormatDate(value instanceof Date || typeof value === 'string' || typeof value === 'number' ? value : null, locale, format.options);
    }
    if (typeof value !== 'number') return '';
    if (format.type === 'currency') return sarakFormatCurrency(value, format.currency, locale);
    if (format.type === 'percent') return sarakFormatPercent(value, locale, format.options);
    return sarakFormatNumber(value, locale, format.options);
};

const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
} as const;

const signColors: Record<'positive' | 'negative' | 'neutral', string> = {
    positive: 'var(--sarak-status-success-color)',
    negative: 'var(--sarak-status-error-color)',
    neutral: 'var(--sarak-text-muted)',
};

export const SarakValue = ({ value, format, locale: localeOverride, signColor = true, size = 'md', className = '' }: SarakValueProps): ReactElement => {
    const sarak = useSarakUIOptional();
    const locale = localeOverride ?? sarak?.preferences.language;
    const numericValue = typeof value === 'number' ? value : null;
    const sign = numericValue === null || !Number.isFinite(numericValue) || numericValue === 0
        ? 'neutral'
        : numericValue > 0 ? 'positive' : 'negative';
    const style: CSSProperties | undefined = signColor ? { color: signColors[sign] } : undefined;

    return (
        <span
            className={['font-black tracking-tight', sizeClasses[size], className].filter(Boolean).join(' ')}
            data-sign={signColor ? sign : undefined}
            style={style}
        >
            {formatValue(value, format, locale)}
        </span>
    );
};
