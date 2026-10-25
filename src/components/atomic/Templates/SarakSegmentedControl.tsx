import React, { useId, useState } from 'react';
import { SarakButton } from '../Buttons/SarakButton';
import { mergeSarakClasses } from '../hooks/mergeSarakClasses';

export interface SarakSegmentedOption {
    value: string;
    label: React.ReactNode;
    disabled?: boolean;
}

export interface SarakSegmentedControlProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
    options: SarakSegmentedOption[];
    ariaLabel: string;
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
}

const getFirstEnabledValue = (options: SarakSegmentedOption[]): string =>
    options.find((option) => !option.disabled)?.value ?? '';

export const SarakSegmentedControl = ({
    options,
    ariaLabel,
    value,
    defaultValue,
    onValueChange,
    className,
    style,
    ...props
}: SarakSegmentedControlProps): React.ReactElement => {
    const groupId = useId();
    const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue ?? getFirstEnabledValue(options));
    const selectedValue = value ?? uncontrolledValue;
    const enabledOptions = options.filter((option) => !option.disabled);
    const tabStopValue = enabledOptions.some((option) => option.value === selectedValue)
        ? selectedValue
        : getFirstEnabledValue(options);

    const selectValue = (nextValue: string): void => {
        if (value === undefined) setUncontrolledValue(nextValue);
        onValueChange?.(nextValue);
    };

    const moveSelection = (currentValue: string, step: number): void => {
        if (enabledOptions.length === 0) return;
        const currentIndex = enabledOptions.findIndex((option) => option.value === currentValue);
        const nextIndex = (currentIndex + step + enabledOptions.length) % enabledOptions.length;
        const nextValue = enabledOptions[nextIndex].value;
        selectValue(nextValue);
        document.getElementById(`${groupId}-${options.findIndex((option) => option.value === nextValue)}`)?.focus();
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, currentValue: string): void => {
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
            event.preventDefault();
            moveSelection(currentValue, 1);
            return;
        }
        if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
            event.preventDefault();
            moveSelection(currentValue, -1);
            return;
        }
        if (event.key === 'Home' || event.key === 'End') {
            event.preventDefault();
            const destination = event.key === 'Home' ? enabledOptions[0] : enabledOptions[enabledOptions.length - 1];
            if (destination) {
                selectValue(destination.value);
                document.getElementById(`${groupId}-${options.indexOf(destination)}`)?.focus();
            }
        }
    };

    return (
        <div
            {...props}
            role="radiogroup"
            aria-label={ariaLabel}
            aria-orientation="horizontal"
            className={mergeSarakClasses('sarak-segmented-control @container flex w-full flex-wrap', className)}
            style={{ gap: 'calc(var(--sarak-layout-gap-sm, 8px) * 0.5)', ...style }}
        >
            {options.map((option, index) => (
                <SarakButton
                    key={option.value}
                    id={`${groupId}-${index}`}
                    type="button"
                    variant="ghost"
                    role="radio"
                    aria-checked={selectedValue === option.value}
                    aria-disabled={option.disabled || undefined}
                    disabled={option.disabled}
                    tabIndex={!option.disabled && tabStopValue === option.value ? 0 : -1}
                    className="min-w-0 flex-1"
                    style={{ minHeight: 'var(--sarak-touch-target-min, 44px)' }}
                    onClick={() => selectValue(option.value)}
                    onKeyDown={(event) => handleKeyDown(event, option.value)}
                >
                    {option.label}
                </SarakButton>
            ))}
        </div>
    );
};
