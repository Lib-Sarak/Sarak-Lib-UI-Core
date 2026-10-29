import React, { useEffect, useId, useMemo, useState } from 'react';
import { format, isValid, parseISO } from 'date-fns';
import { useFocusTrap } from '../../Modals/hooks/useFocusTrap';
import { useLibraryText } from '../../../../core/i18n/useLibraryText';
import { resolveDateFnsLocale } from '../../../../core/i18n/dateFnsLocale';
import { useSarakLanguage } from '../../../../core/i18n/useSarakLanguage';
import type { SarakDateLocale } from './CalendarPanel';
import type { DatePickerViewProps } from './DatePickerView';
import {
    areSarakDatePresetValuesAllowed,
    isSarakDateAllowed,
    normalizeSarakDatePresetForMode,
    parseSarakDatePickerInput,
    resolveSarakDatePreset,
    toSarakIsoDate,
    type SarakDatePickerValue,
    type SarakDatePreset,
    type SarakDatePresetId,
} from './datePresets';
import type { SarakDatePickerProps } from '../SarakDatePicker';

const DATE_PRESET_TEXT_KEYS = {
    today: 'datePresetToday',
    yesterday: 'datePresetYesterday',
    last7Days: 'datePresetLast7Days',
    last30Days: 'datePresetLast30Days',
    thisMonth: 'datePresetThisMonth',
    lastMonth: 'datePresetLastMonth',
    thisQuarter: 'datePresetThisQuarter',
    thisYear: 'datePresetThisYear',
} as const;

interface DatePickerRuntimeState {
    reactId: string;
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    containerRef: React.MutableRefObject<HTMLDivElement | null>;
    handleTrap: React.KeyboardEventHandler<HTMLDivElement>;
    translate: ReturnType<typeof useLibraryText>;
    mode: 'single' | 'range';
    displayFormat: string;
    locale?: SarakDateLocale;
    effectivePlaceholder: string;
    start: Date | null;
    end: Date | null;
    display: string;
    typedValue: string;
    setTypedValue: React.Dispatch<React.SetStateAction<string>>;
    setTypedError: React.Dispatch<React.SetStateAction<string | undefined>>;
    fieldError?: string;
    hasValue: boolean;
    presetOptions: SarakDatePreset[];
}

interface DatePickerActionHandlers {
    onClear: () => void;
    onSelectDay: (date: Date) => void;
    onSelectPreset: (preset: SarakDatePreset) => void;
}

const toDate = (iso?: string): Date | null => {
    if (!iso) return null;
    const parsedDate = parseISO(iso);
    return isValid(parsedDate) ? parsedDate : null;
};

const readDateRange = (value: SarakDatePickerValue | undefined): [Date | null, Date | null] => {
    if (Array.isArray(value)) return [toDate(value[0]), toDate(value[1])];
    return [toDate(value), null];
};

const formatDatePickerDisplay = (options: {
    start: Date | null;
    end: Date | null;
    mode: 'single' | 'range';
    displayFormat: string;
    locale?: SarakDateLocale;
    placeholder: string;
    translate: ReturnType<typeof useLibraryText>;
}): string => {
    if (!options.start) return options.placeholder;
    const startText = format(options.start, options.displayFormat, { locale: options.locale });
    if (options.mode === 'single' || !options.end) return startText;
    const endText = format(options.end, options.displayFormat, { locale: options.locale });
    return `${startText}${options.translate('datePickerRangeSeparator')}${endText}`;
};

const resolveDatePickerPresetOptions = (
    presets: Array<SarakDatePresetId | SarakDatePreset>,
    translate: ReturnType<typeof useLibraryText>,
): SarakDatePreset[] => presets.map((preset) => typeof preset === 'string'
    ? { label: translate(DATE_PRESET_TEXT_KEYS[preset]), value: () => resolveSarakDatePreset(preset) }
    : preset);

const useDatePickerTypedState = (start: Date | null, display: string) => {
    const [typedValue, setTypedValue] = useState('');
    const [typedError, setTypedError] = useState<string>();
    useEffect(() => setTypedValue(start ? display : ''), [display, start]);
    return { typedValue, typedError, setTypedValue, setTypedError };
};

const useDatePickerRuntime = (props: SarakDatePickerProps): DatePickerRuntimeState => {
    const reactId = useId();
    const [open, setOpen] = useState(false);
    const { containerRef, handleTrap } = useFocusTrap(open, () => setOpen(false));
    const translate = useLibraryText();
    const { language } = useSarakLanguage();
    const locale = props.locale ?? resolveDateFnsLocale(language);
    const mode = props.mode ?? 'single';
    const displayFormat = props.displayFormat ?? 'dd/MM/yyyy';
    const effectivePlaceholder = props.placeholder ?? translate('datePickerPlaceholder');
    const [start, end] = useMemo(() => readDateRange(props.value), [props.value]);
    const display = useMemo(() => formatDatePickerDisplay({
        start, end, mode, displayFormat, locale, placeholder: effectivePlaceholder, translate,
    }), [start, end, mode, displayFormat, locale, effectivePlaceholder, translate]);
    const typedState = useDatePickerTypedState(start, display);
    return {
        reactId, open, setOpen, containerRef, handleTrap, translate, mode, displayFormat, locale,
        effectivePlaceholder, start, end, display, ...typedState,
        fieldError: typedState.typedError ?? props.error, hasValue: Boolean(start || end),
        presetOptions: resolveDatePickerPresetOptions(props.presets ?? [], translate),
    };
};

const useDatePickerTypedInput = (
    props: SarakDatePickerProps,
    runtime: DatePickerRuntimeState,
): Pick<DatePickerViewProps, 'onTypedChange' | 'onTypedBlur'> => {
    const onTypedChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        runtime.setTypedValue(event.currentTarget.value);
        runtime.setTypedError(undefined);
    };
    const onTypedBlur = (event: React.FocusEvent<HTMLInputElement>): void => {
        const enteredValue = event.currentTarget.value;
        if (!enteredValue.trim()) {
            runtime.setTypedValue(runtime.start ? runtime.display : '');
            return;
        }
        const nextValue = parseSarakDatePickerInput(enteredValue, {
            mode: runtime.mode,
            rangeSeparator: runtime.translate('datePickerRangeSeparator'),
            displayFormat: runtime.displayFormat,
            locale: runtime.locale,
            min: props.min,
            max: props.max,
            isDateDisabled: props.isDateDisabled,
        });
        if (!nextValue) {
            runtime.setTypedError(runtime.translate('datePickerInvalidMessage'));
            return;
        }
        runtime.setTypedError(undefined);
        props.onChange?.(nextValue);
    };
    return { onTypedChange, onTypedBlur };
};

const createDatePickerPresetSelection = (
    props: SarakDatePickerProps,
    runtime: DatePickerRuntimeState,
): ((preset: SarakDatePreset) => void) => (preset: SarakDatePreset): void => {
    const presetValue = typeof preset.value === 'function' ? preset.value() : preset.value;
    const nextValue = normalizeSarakDatePresetForMode(presetValue, runtime.mode);
    if (!areSarakDatePresetValuesAllowed(nextValue, props.min, props.max, props.isDateDisabled)) return;
    props.onChange?.(nextValue);
    runtime.setOpen(false);
};

const createDatePickerDaySelection = (
    props: SarakDatePickerProps,
    runtime: DatePickerRuntimeState,
): ((date: Date) => void) => (date: Date): void => {
    if (!isSarakDateAllowed(date, props.min, props.max, props.isDateDisabled)) return;
    const isoDate = toSarakIsoDate(date);
    if (runtime.mode === 'single') {
        props.onChange?.(isoDate);
        runtime.setOpen(false);
        return;
    }
    if (!runtime.start || runtime.end) {
        props.onChange?.([isoDate, '']);
        return;
    }
    const ordered = date < runtime.start ? [date, runtime.start] : [runtime.start, date];
    props.onChange?.([toSarakIsoDate(ordered[0]), toSarakIsoDate(ordered[1])]);
    runtime.setOpen(false);
};

const useDatePickerActions = (
    props: SarakDatePickerProps,
    runtime: DatePickerRuntimeState,
): DatePickerActionHandlers => {
    const onClear = (): void => {
        props.onChange?.(runtime.mode === 'single' ? '' : ['', '']);
        runtime.setTypedValue('');
        runtime.setTypedError(undefined);
        runtime.setOpen(false);
    };
    return {
        onClear,
        onSelectDay: createDatePickerDaySelection(props, runtime),
        onSelectPreset: createDatePickerPresetSelection(props, runtime),
    };
};

const createDatePickerViewProps = (
    props: SarakDatePickerProps,
    runtime: DatePickerRuntimeState,
    typedInput: Pick<DatePickerViewProps, 'onTypedChange' | 'onTypedBlur'>,
    actions: DatePickerActionHandlers,
): DatePickerViewProps => ({
    fieldId: runtime.reactId,
    label: props.label,
    labelId: `${runtime.reactId}-label`,
    mode: runtime.mode,
    display: runtime.display,
    typedValue: runtime.typedValue,
    placeholder: runtime.effectivePlaceholder,
    start: runtime.start,
    end: runtime.end,
    locale: runtime.locale,
    weekStartsOn: props.weekStartsOn ?? 0,
    min: props.min,
    max: props.max,
    isDateDisabled: props.isDateDisabled,
    disabled: props.disabled,
    error: runtime.fieldError,
    allowTyping: props.allowTyping ?? false,
    clearable: props.clearable ?? false,
    hasValue: runtime.hasValue,
    open: runtime.open,
    presets: runtime.presetOptions,
    className: props.className ?? '',
    style: props.style,
    containerRef: runtime.containerRef,
    onDialogKeyDown: runtime.handleTrap,
    onToggle: () => runtime.setOpen((previous) => !previous),
    onTypedChange: typedInput.onTypedChange,
    onTypedBlur: typedInput.onTypedBlur,
    ...actions,
});

export const useDatePickerController = (props: SarakDatePickerProps): DatePickerViewProps => {
    const runtime = useDatePickerRuntime(props);
    const typedInput = useDatePickerTypedInput(props, runtime);
    const actions = useDatePickerActions(props, runtime);
    return createDatePickerViewProps(props, runtime, typedInput, actions);
};
