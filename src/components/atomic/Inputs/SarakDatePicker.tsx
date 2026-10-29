import React from 'react';
import type { SarakWeekStart, SarakDateLocale } from './internal/CalendarPanel';
import { DatePickerView } from './internal/DatePickerView';
import { useDatePickerController } from './internal/useDatePickerController';
import type { SarakDatePickerValue, SarakDatePreset, SarakDatePresetId } from './internal/datePresets';

export type { SarakDatePickerValue, SarakDatePreset, SarakDatePresetId } from './internal/datePresets';

export interface SarakDatePickerProps {
    label?: string;
    mode?: 'single' | 'range';
    value?: SarakDatePickerValue;
    /** Formato de exibição (i18n via JSON), ex.: `dd/MM/yyyy`. */
    displayFormat?: string;
    /** Locale do `date-fns` para nomes de mês/dia; omitido, segue o idioma escolhido (`useSarakLanguage`). */
    locale?: SarakDateLocale;
    weekStartsOn?: SarakWeekStart;
    placeholder?: string;
    disabled?: boolean;
    error?: string;
    className?: string;
    style?: React.CSSProperties;
    /** Emite a nova data/intervalo em ISO (Spec 32: `onChange(value)`). */
    onChange?: (value: SarakDatePickerValue) => void;
    min?: string;
    max?: string;
    isDateDisabled?: (iso: string) => boolean;
    presets?: Array<SarakDatePresetId | SarakDatePreset>;
    allowTyping?: boolean;
    clearable?: boolean;
}

/**
 * Componente Atômico: SarakDatePicker (Spec 11, Regra 1)
 * Calendário popover in-house sobre `date-fns`. Suporta seleção única e de intervalo
 * na mesma interface, formatos i18n configuráveis e navegação por teclado (setas).
 */
export const SarakDatePicker = (props: SarakDatePickerProps): React.ReactElement => (
    <DatePickerView {...useDatePickerController(props)} />
);
