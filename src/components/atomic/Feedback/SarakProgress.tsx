import React from 'react';
import { motion } from 'framer-motion';
import { useLibraryText } from '../../../core/i18n/useLibraryText';
import { mergeSarakClasses } from '../hooks/mergeSarakClasses';

export type SarakProgressVariant = 'success' | 'error' | 'warning' | 'info';

export interface SarakProgressThreshold {
    /** Valor absoluto, na mesma escala de `value` e `max`, a partir do qual a cor vale. */
    value: number;
    variant: SarakProgressVariant;
}

export interface SarakProgressProps {
    /** Valor atual do progresso, limitado ao intervalo entre zero e `max` (padrão: 0). */
    value?: number;
    /** Valor que representa 100% do progresso; precisa ser positivo (padrão: 100). */
    max?: number;
    /** Limiares que escolhem a variante de cor conforme o valor atual. */
    thresholds?: SarakProgressThreshold[];
    /** Rótulo acessível anunciado pela barra de progresso. */
    label?: string;
    /** Exibe animação indeterminada e omite o valor atual na árvore acessível. */
    indeterminate?: boolean;
    /** Classe adicional aplicada ao contêiner do componente. */
    className?: string;
}

const INDETERMINATE_DURATION_SECONDS = 1.4;
const VARIANT_COLORS: Readonly<Record<SarakProgressVariant, string>> = {
    success: 'var(--sarak-status-success-color, var(--theme-success, #10b981))',
    error: 'var(--sarak-status-error-color, var(--theme-error, #ef4444))',
    warning: 'var(--sarak-status-warning-color, var(--theme-warning, #f59e0b))',
    info: 'var(--sarak-status-info-color, var(--theme-info, #3b82f6))',
};

const getActiveVariant = (value: number, thresholds: SarakProgressThreshold[]): SarakProgressVariant => {
    let activeThreshold: SarakProgressThreshold | undefined;
    for (const threshold of thresholds) {
        if (!Number.isFinite(threshold.value) || threshold.value > value) continue;
        if (!activeThreshold || threshold.value > activeThreshold.value) activeThreshold = threshold;
    }
    return activeThreshold?.variant ?? 'info';
};

const ProgressTrack = ({ accessibleLabel, max, value, indeterminate, color }: {
    accessibleLabel: string;
    max: number;
    value: number;
    indeterminate: boolean;
    color: string;
}): React.ReactElement => (
    <div
        role="progressbar"
        aria-label={accessibleLabel}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={indeterminate ? undefined : value}
        data-indeterminate={indeterminate ? 'true' : undefined}
        className="relative w-full overflow-hidden"
        style={{
            height: 'var(--sarak-progress-bar-height, 8px)',
            borderRadius: 'var(--sarak-progress-bar-radius, 8px)',
            backgroundColor: 'var(--theme-border, #334155)',
        }}
    >
        {indeterminate ? (
            <motion.div
                aria-hidden="true"
                className="absolute inset-y-0 left-0 w-2/5"
                animate={{ left: ['-40%', '100%'] }}
                transition={{ duration: INDETERMINATE_DURATION_SECONDS, repeat: Infinity, ease: 'easeInOut' }}
                style={{ backgroundColor: color, borderRadius: 'inherit' }}
            />
        ) : (
            <div
                aria-hidden="true"
                className="h-full transition-[width] duration-300"
                style={{ width: `${(value / max) * 100}%`, backgroundColor: color, borderRadius: 'inherit' }}
            />
        )}
    </div>
);

export const SarakProgress = ({
    value = 0,
    max = 100,
    thresholds = [],
    label,
    indeterminate = false,
    className,
}: SarakProgressProps): React.ReactElement => {
    const text = useLibraryText();
    const accessibleLabel = label?.trim() ? label : text('progressDefaultLabel');
    const safeMax = Number.isFinite(max) && max > 0 ? max : 100;
    const safeValue = Number.isFinite(value) ? Math.min(Math.max(value, 0), safeMax) : 0;
    const color = VARIANT_COLORS[getActiveVariant(safeValue, thresholds)];

    return (
        <div className={mergeSarakClasses('w-full', className)}>
            {label && <div className="text-sm text-[var(--text-muted,#94a3b8)]" style={{ marginBottom: 'var(--sarak-layout-gap-sm, 8px)' }}>{label}</div>}
            <ProgressTrack accessibleLabel={accessibleLabel} max={safeMax} value={safeValue} indeterminate={indeterminate} color={color} />
        </div>
    );
};
