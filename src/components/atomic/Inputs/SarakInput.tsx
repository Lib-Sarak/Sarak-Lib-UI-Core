import React, { InputHTMLAttributes, useId, useState } from 'react';
import { useSarakUIOptional } from '../../../core/Provider/SarakUIProvider';
import { useAtomicStyles } from '../hooks/useAtomicStyles';
import { useStructuralStyles } from '../hooks/useStructuralStyles';
import { SarakFormGroup } from '../Layouts/SarakFormGroup';
import { SarakFieldError } from '../Feedback/SarakFieldError';
import { mergeSarakClasses } from '../hooks/mergeSarakClasses';

export interface SarakInputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    icon?: React.ReactNode;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    error?: string;
    fullWidth?: boolean;
}

interface IconSlot {
    node: React.ReactNode;
    side: 'left' | 'right';
    interactive: boolean;
}

interface SarakInputViewModel {
    inputId: string;
    errorId: string;
    iconSlots: IconSlot[];
    inputClasses: string;
    wrapperClassName: string;
    dynamicStyle: React.CSSProperties;
    setIsFocused: (focused: boolean) => void;
}

interface SarakInputViewProps {
    label?: string;
    error?: string;
    disabled?: boolean;
    nativeProps: InputHTMLAttributes<HTMLInputElement>;
    onFocus?: React.FocusEventHandler<HTMLInputElement>;
    onBlur?: React.FocusEventHandler<HTMLInputElement>;
    viewModel: SarakInputViewModel;
}

const ICON_SIDE_CLASS = { left: 'absolute left-3 z-10', right: 'absolute right-3 z-10' } as const;
const ICON_INERT_CLASS = 'pointer-events-none text-[var(--sarak-input-icon-color,var(--text-muted,rgba(242,246,251,0.55)))] transition-colors group-focus-within:text-[var(--sarak-input-focus-border-color,var(--sarak-primary-color,#19e3f0))]';
const ICON_INTERACTIVE_CLASS = 'text-[var(--sarak-input-icon-color,var(--text-muted,rgba(242,246,251,0.55)))] transition-colors group-focus-within:text-[var(--sarak-input-focus-border-color,var(--sarak-primary-color,#19e3f0))]';

const composeDescribedBy = (providedIds?: string, errorId?: string): string | undefined => {
    const descriptionIds = new Set(providedIds?.split(/\s+/).filter(Boolean) ?? []);
    if (errorId) descriptionIds.add(errorId);
    return [...descriptionIds].join(' ') || undefined;
};

const resolveIconSlots = (
    icon: React.ReactNode,
    leftIcon: React.ReactNode,
    rightIcon: React.ReactNode,
    themeSide: 'left' | 'right',
): IconSlot[] => {
    if (icon) return [{ node: icon, side: themeSide, interactive: false }];
    if (leftIcon && rightIcon) {
        return [
            { node: leftIcon, side: 'left', interactive: false },
            { node: rightIcon, side: 'right', interactive: true },
        ];
    }
    if (leftIcon) return [{ node: leftIcon, side: themeSide, interactive: false }];
    if (rightIcon) return [{ node: rightIcon, side: themeSide, interactive: true }];
    return [];
};

const getInputClasses = (
    props: SarakInputProps,
    iconSlots: IconSlot[]
): Pick<SarakInputViewModel, 'inputClasses' | 'wrapperClassName'> => {
    const widthClass = props.fullWidth ? 'w-full' : '';
    const disabledClass = props.disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : '';
    const paddingLeftClass = iconSlots.some((slot) => slot.side === 'left')
        ? 'pl-11'
        : 'pl-[var(--sarak-input-padding-horizontal,16px)]';
    const paddingRightClass = iconSlots.some((slot) => slot.side === 'right')
        ? 'pr-11'
        : 'pr-[var(--sarak-input-padding-horizontal,16px)]';
    const baseClasses = 'block text-[var(--sarak-input-text-color,var(--text-muted,rgba(242,246,251,0.55)))] font-medium outline-none transition-all placeholder:text-[var(--sarak-input-text-color,var(--text-muted,rgba(242,246,251,0.55)))]/30 bg-[var(--sarak-input-bg,var(--color-theme-card,#101622))]';
    const shapeClasses = 'rounded-input py-[var(--sarak-input-padding-vertical,var(--sarak-input-padding,16px))]';

    return {
        inputClasses: mergeSarakClasses(baseClasses, shapeClasses, paddingLeftClass, paddingRightClass, 'w-full', disabledClass),
        wrapperClassName: mergeSarakClasses(widthClass, props.className),
    };
};

const useSarakInputViewModel = (props: SarakInputProps): SarakInputViewModel => {
    const design = useSarakUIOptional()?.design;
    const { getInputStyles } = useAtomicStyles();
    const { getInputIconStyles } = useStructuralStyles();
    const { isIconRight } = getInputIconStyles();
    const [isFocused, setIsFocused] = useState(false);
    const generatedId = useId();
    const inputId = props.id ?? generatedId;
    const iconSlots = resolveIconSlots(props.icon, props.leftIcon, props.rightIcon, isIconRight ? 'right' : 'left');

    return {
        inputId,
        errorId: inputId + '-error',
        iconSlots,
        ...getInputClasses(props, iconSlots),
        dynamicStyle: { ...props.style, ...getInputStyles(design, isFocused) },
        setIsFocused,
    };
};

const getNativeInputProps = (props: SarakInputProps): InputHTMLAttributes<HTMLInputElement> => {
    const nativeProps = { ...props };
    delete nativeProps.label;
    delete nativeProps.icon;
    delete nativeProps.leftIcon;
    delete nativeProps.rightIcon;
    delete nativeProps.error;
    delete nativeProps.fullWidth;
    delete nativeProps.className;
    return nativeProps;
};

const SarakInputControl = ({
    error,
    disabled,
    nativeProps,
    onFocus,
    onBlur,
    viewModel,
}: SarakInputViewProps): React.ReactElement => (
    <div className="relative w-full flex items-center">
        {viewModel.iconSlots.map((slot) => (
            <div
                key={slot.side}
                className={mergeSarakClasses(
                    ICON_SIDE_CLASS[slot.side],
                    'flex items-center',
                    slot.interactive ? ICON_INTERACTIVE_CLASS : ICON_INERT_CLASS,
                )}
            >
                {slot.node}
            </div>
        ))}
        <input
            {...nativeProps}
            className={viewModel.inputClasses}
            disabled={disabled}
            style={viewModel.dynamicStyle}
            aria-invalid={error ? true : undefined}
            aria-describedby={composeDescribedBy(nativeProps['aria-describedby'], error ? viewModel.errorId : undefined)}
            onFocus={(event) => { viewModel.setIsFocused(true); onFocus?.(event); }}
            onBlur={(event) => { viewModel.setIsFocused(false); onBlur?.(event); }}
            id={viewModel.inputId}
        />
    </div>
);

const SarakInputView = (props: SarakInputViewProps): React.ReactElement => (
    <SarakFormGroup className={props.viewModel.wrapperClassName}>
        {props.label && <label htmlFor={props.viewModel.inputId} className="text-sm font-medium">{props.label}</label>}
        <div className="flex-1 flex relative w-full" style={{ flexDirection: 'column' }}>
            <SarakInputControl {...props} />
            <SarakFieldError message={props.error} fieldId={props.viewModel.inputId} />
        </div>
    </SarakFormGroup>
);

/**
 * @sarak-encapsula input — o átomo encapsula o campo nativo para teclado, leitor de tela e estilo.
 */
export const SarakInput = (props: SarakInputProps): React.ReactElement => {
    const viewModel = useSarakInputViewModel(props);

    return (
        <SarakInputView
            label={props.label}
            error={props.error}
            disabled={props.disabled}
            nativeProps={getNativeInputProps(props)}
            onFocus={props.onFocus}
            onBlur={props.onBlur}
            viewModel={viewModel}
        />
    );
};
