import React from 'react';
import { SarakButton } from '../../Buttons/SarakButton';
import { SarakFieldError } from '../../Feedback/SarakFieldError';
import { SarakFormGroup } from '../../Layouts/SarakFormGroup';
import { useLibraryText } from '../../../../core/i18n/useLibraryText';
import { SarakInput } from '../SarakInput';
import { CalendarPanel, type SarakDateLocale, type SarakWeekStart } from './CalendarPanel';
import type { SarakDatePreset } from './datePresets';

export interface DatePickerViewProps {
    fieldId: string;
    label?: string;
    labelId: string;
    mode: 'single' | 'range';
    display: string;
    typedValue: string;
    placeholder: string;
    start: Date | null;
    end: Date | null;
    locale?: SarakDateLocale;
    weekStartsOn: SarakWeekStart;
    min?: string;
    max?: string;
    isDateDisabled?: (iso: string) => boolean;
    disabled?: boolean;
    error?: string;
    allowTyping: boolean;
    clearable: boolean;
    hasValue: boolean;
    open: boolean;
    presets: SarakDatePreset[];
    className: string;
    style?: React.CSSProperties;
    containerRef: React.MutableRefObject<HTMLDivElement | null>;
    onDialogKeyDown: React.KeyboardEventHandler<HTMLDivElement>;
    onToggle: () => void;
    onTypedChange: React.ChangeEventHandler<HTMLInputElement>;
    onTypedBlur: React.FocusEventHandler<HTMLInputElement>;
    onClear: () => void;
    onSelectDay: (date: Date) => void;
    onSelectPreset: (preset: SarakDatePreset) => void;
}

const DatePickerTrigger = (props: DatePickerViewProps): React.ReactElement => {
    const text = useLibraryText();
    return (
        <SarakButton
            type="button"
            disabled={props.disabled}
            aria-labelledby={props.label ? props.labelId : undefined}
            aria-label={!props.label ? text('datePickerAriaLabel') : undefined}
            aria-haspopup="dialog"
            aria-expanded={props.open}
            aria-invalid={props.error ? true : undefined}
            aria-describedby={props.error ? `${props.fieldId}-error` : undefined}
            onClick={props.onToggle}
            variant="secondary"
            fullWidth
            rightIcon={<CalendarIcon />}
            className="text-left"
            style={{
                justifyContent: 'space-between',
                backgroundColor: 'var(--sarak-input-bg,var(--color-theme-card,#101622))',
                borderColor: 'var(--sarak-input-border-color, var(--border-color,rgba(255,255,255,0.09)))',
                padding: 'calc(var(--sarak-layout-gap-md,16px) * 0.75) var(--sarak-layout-gap-md,16px)',
                textTransform: 'none',
                letterSpacing: 'normal',
                fontWeight: 'normal',
            }}
        >
            <span className={props.start ? 'text-[var(--text-muted,rgba(242,246,251,0.55))]' : 'text-[var(--text-muted,rgba(242,246,251,0.55))]/50'}>
                {props.display}
            </span>
        </SarakButton>
    );
};

const DatePickerTextInput = (props: DatePickerViewProps): React.ReactElement => {
    const text = useLibraryText();
    return (
        <SarakInput
            fullWidth
            aria-labelledby={props.label ? props.labelId : undefined}
            aria-label={!props.label ? text('datePickerAriaLabel') : undefined}
            value={props.typedValue}
            placeholder={props.placeholder}
            disabled={props.disabled}
            error={props.error}
            onChange={props.onTypedChange}
            onBlur={props.onTypedBlur}
        />
    );
};

const CalendarToggleButton = (props: DatePickerViewProps): React.ReactElement => {
    const text = useLibraryText();
    return (
        <SarakButton
            type="button"
            variant="secondary"
            aria-label={text('datePickerCalendarAriaLabel')}
            aria-haspopup="dialog"
            aria-expanded={props.open}
            disabled={props.disabled}
            onClick={props.onToggle}
            rightIcon={<CalendarIcon />}
        />
    );
};

const DatePickerField = (props: DatePickerViewProps): React.ReactElement => (
    props.allowTyping ? <DatePickerTextInput {...props} /> : <DatePickerTrigger {...props} />
);

const DatePresetButtons = (props: DatePickerViewProps): React.ReactElement | null => {
    if (!props.presets.length) return null;
    return (
        <div className="flex flex-wrap" style={{ gap: 'var(--sarak-layout-gap-sm,8px)', marginTop: 'var(--sarak-layout-gap-sm,8px)' }}>
            {props.presets.map((preset, index) => (
                <SarakButton
                    key={`${preset.label}-${index}`}
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={() => props.onSelectPreset(preset)}
                >
                    {preset.label}
                </SarakButton>
            ))}
        </div>
    );
};

const DatePickerCalendarDialog = (props: DatePickerViewProps): React.ReactElement | null => {
    const text = useLibraryText();
    if (!props.open) return null;
    return (
        <div
            ref={props.containerRef}
            role="dialog"
            aria-label={props.label ?? text('datePickerCalendarAriaLabel')}
            onKeyDown={props.onDialogKeyDown}
            className="absolute z-30 rounded-input bg-[var(--color-theme-card,#101622)] border border-[var(--border-color,rgba(255,255,255,0.09))] shadow-[var(--dynamic-shadow)]"
            style={{ marginTop: 'calc(var(--sarak-layout-gap-md,16px) * 0.25)', padding: 'calc(var(--sarak-layout-gap-md,16px) * 0.75)' }}
        >
            <CalendarPanel
                mode={props.mode}
                start={props.start}
                end={props.end}
                locale={props.locale}
                weekStartsOn={props.weekStartsOn}
                min={props.min}
                max={props.max}
                isDateDisabled={props.isDateDisabled}
                onSelectDay={props.onSelectDay}
            />
            <DatePresetButtons {...props} />
        </div>
    );
};

const DatePickerControls = (props: DatePickerViewProps): React.ReactElement => {
    const text = useLibraryText();
    return (
        <div className="flex items-center w-full" style={{ gap: 'var(--sarak-layout-gap-sm,8px)' }}>
            <DatePickerField {...props} />
            {props.allowTyping && <CalendarToggleButton {...props} />}
            {props.clearable && props.hasValue && (
                <SarakButton type="button" variant="ghost" onClick={props.onClear}>
                    {text('datePickerClear')}
                </SarakButton>
            )}
        </div>
    );
};

export const DatePickerView = (props: DatePickerViewProps): React.ReactElement => (
    <SarakFormGroup className={props.className} style={props.style}>
        {props.label && <span id={props.labelId} className="text-sm font-medium text-[var(--text-muted,rgba(242,246,251,0.55))]">{props.label}</span>}
        <div className="relative w-full">
            <DatePickerControls {...props} />
            <DatePickerCalendarDialog {...props} />
        </div>
        {!props.allowTyping && <SarakFieldError message={props.error} fieldId={props.fieldId} />}
    </SarakFormGroup>
);

const CalendarIcon = (): React.ReactElement => (
    <svg className="w-4 h-4 text-[var(--text-muted,rgba(242,246,251,0.55))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);
