import React, { useId, useMemo, useRef, useState } from 'react';
import { format, isValid, parseISO } from 'date-fns';
import { SarakFormGroup } from '../Layouts/SarakFormGroup';
import { useFocusTrap } from '../Modals/hooks/useFocusTrap';
import { CalendarPanel, type WeekStart, type DateLocale } from './internal/CalendarPanel';

const ISO = 'yyyy-MM-dd';

/** Valor: string ISO (single) ou par [início, fim] de ISOs (range). */
export type DatePickerValue = string | [string, string];

export interface SarakDatePickerProps {
    label?: string;
    mode?: 'single' | 'range';
    value?: DatePickerValue;
    /** Formato de exibição (i18n via JSON), ex.: `dd/MM/yyyy`. */
    displayFormat?: string;
    /** Locale do `date-fns` para nomes de mês/dia (i18n). */
    locale?: DateLocale;
    weekStartsOn?: WeekStart;
    placeholder?: string;
    disabled?: boolean;
    error?: string;
    className?: string;
    style?: React.CSSProperties;
    /** Emite a nova data/intervalo em ISO (Spec 32: `onChange(value)`). */
    onChange?: (value: DatePickerValue) => void;
}

const toDate = (iso?: string): Date | null => {
    if (!iso) return null;
    const parsed = parseISO(iso);
    return isValid(parsed) ? parsed : null;
};

const readRange = (value: DatePickerValue | undefined): [Date | null, Date | null] => {
    if (Array.isArray(value)) return [toDate(value[0]), toDate(value[1])];
    return [toDate(value), null];
};

/**
 * Componente Atômico: SarakDatePicker (Spec 11, Regra 1)
 * Calendário popover in-house sobre `date-fns`. Suporta seleção única e de intervalo
 * na mesma interface, formatos i18n configuráveis e navegação por teclado (setas).
 */
export const SarakDatePicker: React.FC<SarakDatePickerProps> = ({
    label,
    mode = 'single',
    value,
    displayFormat = 'dd/MM/yyyy',
    locale,
    weekStartsOn = 0,
    placeholder = 'Selecione...',
    disabled,
    error,
    className = '',
    style,
    onChange,
}) => {
    const reactId = useId();
    const errorId = `${reactId}-error`;
    const [open, setOpen] = useState(false);
    const { containerRef, handleTrap } = useFocusTrap(open, () => setOpen(false));
    const triggerRef = useRef<HTMLButtonElement | null>(null);

    const [start, end] = useMemo(() => readRange(value), [value]);

    const display = useMemo(() => {
        if (!start) return placeholder;
        const head = format(start, displayFormat, { locale });
        if (mode === 'single' || !end) return head;
        return `${head} — ${format(end, displayFormat, { locale })}`;
    }, [start, end, mode, displayFormat, locale, placeholder]);

    const emit = (next: [Date | null, Date | null]): void => {
        if (mode === 'single') {
            if (next[0]) onChange?.(format(next[0], ISO));
            setOpen(false);
            return;
        }
        if (next[0] && next[1]) {
            onChange?.([format(next[0], ISO), format(next[1], ISO)]);
            setOpen(false);
        }
    };

    const handleSelectDay = (date: Date): void => {
        if (mode === 'single') {
            emit([date, null]);
            return;
        }
        // Range: 1º clique fixa o início; 2º fecha o intervalo (reordenando se preciso).
        if (!start || (start && end)) {
            onChange?.([format(date, ISO), '']);
            return;
        }
        const ordered: [Date, Date] = date < start ? [date, start] : [start, date];
        emit(ordered);
    };

    return (
        <SarakFormGroup className={className} style={style}>
            {label && <span className="text-sm font-medium text-[var(--text-muted,#94a3b8)]">{label}</span>}

            <div className="relative w-full">
                <button
                    ref={triggerRef}
                    type="button"
                    disabled={disabled}
                    aria-label={label ?? 'Selecionar data'}
                    aria-haspopup="dialog"
                    aria-expanded={open}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? errorId : undefined}
                    onClick={() => setOpen((prev) => !prev)}
                    className={`flex items-center justify-between w-full rounded-input text-left text-sm bg-[var(--sarak-input-bg,var(--color-theme-card,#1e293b))] border border-[var(--sarak-input-border-color,var(--border-color,#334155))] ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    style={{ padding: 'calc(var(--sarak-layout-gap-md,16px) * 0.75) var(--sarak-layout-gap-md,16px)' }}
                >
                    <span className={start ? 'text-[var(--text-muted,#94a3b8)]' : 'text-[var(--text-muted,#94a3b8)]/50'}>
                        {display}
                    </span>
                    <svg className="w-4 h-4 text-[var(--text-muted,#94a3b8)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </button>

                {open && (
                    <div
                        ref={containerRef}
                        role="dialog"
                        aria-label={label ?? 'Calendário'}
                        onKeyDown={handleTrap}
                        className="absolute z-30 rounded-input bg-[var(--color-theme-card,#1e293b)] border border-[var(--border-color,#334155)] shadow-xl"
                        style={{ marginTop: 'calc(var(--sarak-layout-gap-md,16px) * 0.25)', padding: 'calc(var(--sarak-layout-gap-md,16px) * 0.75)' }}
                    >
                        <CalendarPanel
                            mode={mode}
                            start={start}
                            end={end}
                            locale={locale}
                            weekStartsOn={weekStartsOn}
                            onSelectDay={handleSelectDay}
                        />
                    </div>
                )}
            </div>

            {error && (
                <p id={errorId} className="text-sm text-[var(--sarak-input-error-color,#ff4d4f)]" style={{ marginTop: 'calc(var(--sarak-layout-gap-md,16px) * 0.25)' }}>{error}</p>
            )}
        </SarakFormGroup>
    );
};
