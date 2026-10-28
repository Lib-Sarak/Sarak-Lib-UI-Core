import React, { SelectHTMLAttributes, useId, useState } from 'react';
import { useSarakUIOptional } from '../../../core/Provider/SarakUIProvider';
import { useAtomicStyles } from '../hooks/useAtomicStyles';
import { mergeSarakClasses } from '../hooks/mergeSarakClasses';
import { SarakFormGroup } from '../Layouts/SarakFormGroup';
import { SarakFieldError } from '../Feedback/SarakFieldError';

export interface SarakSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    /**
     * Rótulo visual ligado ao campo pelo `id` (gerado quando não é informado).
     * Sem ele, não há rótulo visível; forneça outro nome acessível se necessário.
     */
    label: string;
    /** Mantém o rótulo acessível sem ocupar espaço visual. */
    hideLabel?: boolean;
    /** Opções declarativas; quando informado, substitui `children`. */
    options?: Array<{ label: string; value: string; disabled?: boolean }>;
    /**
     * Mensagem exibida abaixo da lista, ligada ao `<select>` por `aria-describedby`
     * (pelo `SarakFieldError`), que também marca `aria-invalid`. Sem a prop, não há
     * mensagem nem estado inválido.
     */
    error?: string;
    /**
     * Faz o contêiner e a lista ocuparem toda a largura disponível. Omitida ou
     * `false`, a largura depende do layout pai.
     */
    fullWidth?: boolean;
}

interface SarakSelectControlProps {
    id: string;
    error?: string;
    fullWidth?: boolean;
    className: string;
    disabled?: boolean;
    style?: React.CSSProperties;
    describedBy?: string;
    options?: SarakSelectProps['options'];
    children?: React.ReactNode;
    nativeProps: SelectHTMLAttributes<HTMLSelectElement>;
    onFocus?: React.FocusEventHandler<HTMLSelectElement>;
    onBlur?: React.FocusEventHandler<HTMLSelectElement>;
}

const SarakSelectOptions = ({ options, children }: Pick<SarakSelectControlProps, 'options' | 'children'>): React.ReactNode => (
    options === undefined
        ? children
        : options.map((option, index) => (
            <option key={`${option.value}-${index}`} value={option.value} disabled={option.disabled}>
                {option.label}
            </option>
        ))
);

const SarakSelectCaret = (): React.ReactElement => (
    <div className="absolute inset-y-0 right-0 flex items-center pointer-events-none text-[var(--sarak-input-icon-color,var(--text-muted,rgba(242,246,251,0.55)))] transition-colors group-focus-within:text-[var(--sarak-input-focus-border-color,var(--sarak-primary-color,#19e3f0))]" style={{ paddingRight: 'var(--sarak-layout-gap-md,16px)' }}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
    </div>
);

const SELECT_LEFT_PADDING = 'pl-[var(--sarak-input-padding-horizontal,16px)]';
const SELECT_RIGHT_PADDING = 'pr-[calc(var(--sarak-input-padding-horizontal,16px)+var(--sarak-layout-gap-md,16px)+var(--sarak-layout-gap-sm,8px))]';

const SarakSelectControl = (props: SarakSelectControlProps): React.ReactElement => {
    const design = useSarakUIOptional()?.design;
    const { getInputStyles } = useAtomicStyles();
    const [isFocused, setIsFocused] = useState(false);
    const widthClass = props.fullWidth ? 'w-full' : 'w-fit';
    const disabledClass = props.disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : '';
    const dynamicStyle = { ...props.style, ...getInputStyles(design, isFocused) };

    return (
        <div className={`relative group ${widthClass}`}>
            <select
                className={mergeSarakClasses(
                    'block text-[var(--sarak-input-text-color,var(--text-muted,rgba(242,246,251,0.55)))] font-medium outline-none transition-all bg-[var(--sarak-input-bg,var(--color-theme-card,#101622))] rounded-input py-[var(--sarak-input-padding,16px)] appearance-none',
                    SELECT_LEFT_PADDING,
                    SELECT_RIGHT_PADDING,
                    widthClass,
                    disabledClass,
                    props.className,
                )}
                disabled={props.disabled}
                style={dynamicStyle}
                aria-invalid={props.error ? true : undefined}
                onFocus={(event) => { setIsFocused(true); props.onFocus?.(event); }}
                onBlur={(event) => { setIsFocused(false); props.onBlur?.(event); }}
                {...props.nativeProps}
                aria-describedby={props.describedBy}
                id={props.id}
            >
                <SarakSelectOptions options={props.options}>{props.children}</SarakSelectOptions>
            </select>
            <SarakSelectCaret />
            <SarakFieldError message={props.error} fieldId={props.id} />
        </div>
    );
};

/**
 * Componente Atômico: SarakSelect
 *
 * @sarak-encapsula select — a razão de existir deste componente é dar forma Sarak
 *   ao `<select>` nativo (seta customizada, tokens de cor); remova o `<select>` e
 *   não sobra função nenhuma, só a seta decorativa.
 */
export const SarakSelect = (props: SarakSelectProps): React.ReactElement => {
    const {
        label, hideLabel = false, options, error, fullWidth, className = '', disabled, style,
        children, id, onFocus, onBlur, ...nativeProps
    } = props;
    const generatedId = useId();
    const selectId = id ?? generatedId;
    const describedBy = [nativeProps['aria-describedby'], error ? `${selectId}-error` : undefined]
        .filter(Boolean)
        .join(' ') || undefined;

    return (
        <SarakFormGroup style={{ width: fullWidth ? '100%' : 'fit-content' }}>
            <label htmlFor={selectId} className={hideLabel ? 'sr-only' : 'text-sm font-medium'}>{label}</label>
            <SarakSelectControl
                id={selectId}
                error={error}
                fullWidth={fullWidth}
                className={className}
                disabled={disabled}
                style={style}
                describedBy={describedBy}
                options={options}
                children={children}
                nativeProps={nativeProps}
                onFocus={onFocus}
                onBlur={onBlur}
            />
        </SarakFormGroup>
    );
};
