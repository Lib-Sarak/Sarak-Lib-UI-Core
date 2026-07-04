import React, { useId, useMemo } from 'react';
import { SarakFormGroup } from '../Layouts/SarakFormGroup';

export interface SarakTimePickerProps {
    label?: string;
    /** Valor no formato 24h `HH:mm`. */
    value?: string;
    /** Passo dos minutos (ex.: 5, 15). */
    minuteStep?: number;
    disabled?: boolean;
    error?: string;
    className?: string;
    style?: React.CSSProperties;
    /** Emite o novo horário `HH:mm` (Spec 32: `onChange(value)`). */
    onChange?: (value: string) => void;
}

const pad = (n: number): string => String(n).padStart(2, '0');
const range = (count: number, step = 1): number[] =>
    Array.from({ length: Math.ceil(count / step) }, (_, i) => i * step);

const SELECT =
    'rounded-input py-2 px-2 text-sm tabular-nums bg-[var(--sarak-input-bg,var(--color-theme-card,#1e293b))] border border-[var(--sarak-input-border-color,var(--border-color,#334155))] text-[var(--sarak-input-text-color,var(--text-muted,#94a3b8))] outline-none focus:border-[var(--sarak-input-focus-border-color,var(--sarak-primary-color,#3b82f6))]';

/**
 * Componente Atômico: SarakTimePicker (Spec 11, Regra 1 — par temporal)
 * Seleção de horário 24h via dois campos (hora/minuto), com passo de minutos
 * configurável. Emite `HH:mm`; teclado nativo dos `<select>` cobre a navegação.
 */
export const SarakTimePicker: React.FC<SarakTimePickerProps> = ({
    label,
    value = '',
    minuteStep = 5,
    disabled,
    error,
    className = '',
    style,
    onChange,
}) => {
    const reactId = useId();
    const errorId = `${reactId}-error`;
    const [hour, minute] = useMemo(() => {
        const [h, m] = value.split(':');
        return [h ?? '', m ?? ''];
    }, [value]);

    const hours = useMemo(() => range(24), []);
    const minutes = useMemo(() => range(60, minuteStep), [minuteStep]);

    const emit = (nextHour: string, nextMinute: string): void => {
        const h = nextHour === '' ? '00' : nextHour;
        const m = nextMinute === '' ? '00' : nextMinute;
        onChange?.(`${h}:${m}`);
    };

    const disabledClass = disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : '';

    return (
        <SarakFormGroup className={`${disabledClass} ${className}`.trim()} style={style}>
            {label && <span className="text-sm font-medium text-[var(--text-muted,#94a3b8)]">{label}</span>}

            <div className="flex items-center" style={{ gap: 'var(--sarak-layout-gap-sm, 8px)' }} role="group" aria-label={label ?? 'Horário'}>
                <select
                    aria-label="Hora"
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? errorId : undefined}
                    disabled={disabled}
                    value={hour}
                    onChange={(e) => emit(e.target.value, minute)}
                    className={SELECT}
                >
                    <option value="" disabled>--</option>
                    {hours.map((h) => (
                        <option key={h} value={pad(h)}>{pad(h)}</option>
                    ))}
                </select>

                <span className="font-bold text-[var(--text-muted,#94a3b8)]">:</span>

                <select
                    aria-label="Minuto"
                    disabled={disabled}
                    value={minute}
                    onChange={(e) => emit(hour, e.target.value)}
                    className={SELECT}
                >
                    <option value="" disabled>--</option>
                    {minutes.map((m) => (
                        <option key={m} value={pad(m)}>{pad(m)}</option>
                    ))}
                </select>
            </div>

            {error && (
                <p id={errorId} className="text-sm text-[var(--sarak-input-error-color,#ff4d4f)]" style={{ marginTop: 'calc(var(--sarak-layout-gap-md,16px) * 0.25)' }}>{error}</p>
            )}
        </SarakFormGroup>
    );
};
