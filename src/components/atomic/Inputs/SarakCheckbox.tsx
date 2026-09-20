import React, { InputHTMLAttributes, useId, useRef, useEffect, useState } from 'react';
import { useSarakUIOptional } from '../../../core/Provider/SarakUIProvider';
import { useAtomicStyles } from '../hooks/useAtomicStyles';
import { useStructuralStyles } from '../hooks/useStructuralStyles';
import { mergeSarakClasses } from '../hooks/mergeSarakClasses';

export interface SarakCheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
    label?: React.ReactNode;
    description?: React.ReactNode;
    indeterminate?: boolean;
}

/**
 * Componente Atômico: SarakCheckbox
 *
 * @sarak-encapsula input — o `<input type=checkbox>` é o controle real
 *   (foco, teclado, leitor de tela); caixa visual é só a pele sobreposta.
 *   Suporta estado indeterminado nativo.
 *
 * Contrato de valor (o do React): quem passa `checked` GOVERNA — pele, `aria-checked` e
 * `<input>` seguem esse valor e o componente não guarda estado próprio. Sem `checked`, o
 * componente guarda o valor, semeado por `defaultChecked`. O `onChange` de quem chama é
 * sempre chamado, nos dois modos.
 */
export const SarakCheckbox: React.FC<SarakCheckboxProps> = ({
    label,
    description,
    className = '',
    disabled,
    checked,
    defaultChecked,
    onChange,
    onFocus,
    onBlur,
    indeterminate = false,
    style,
    ...props
}) => {
    const design = useSarakUIOptional()?.design;
    const { getCheckboxStyles, getChoiceMarkColor } = useAtomicStyles();
    const { getCheckboxLayoutStyles } = useStructuralStyles();
    const [isFocused, setIsFocused] = useState(false);
    const [ownChecked, setOwnChecked] = useState(!!defaultChecked);
    const inputRef = useRef<HTMLInputElement>(null);

    // Sincroniza propriedade indeterminate do input
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.indeterminate = indeterminate;
        }
    }, [indeterminate]);

    const reactId = useId();
    const descId = description ? `${reactId}-desc` : undefined;

    const isControlled = checked !== undefined;
    const isChecked = isControlled ? !!checked : ownChecked;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!isControlled) setOwnChecked(e.currentTarget.checked);
        onChange?.(e);
    };
    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(true);
        onFocus?.(e);
    };
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(false);
        onBlur?.(e);
    };

    const checkboxStyle = getCheckboxStyles(design, isChecked, indeterminate, isFocused);
    const markColor = getChoiceMarkColor();
    const { containerClass, textContainerClass, style: layoutStyle } = getCheckboxLayoutStyles();
    const baseClass = mergeSarakClasses(
        disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer',
        className,
    );

    return (
        <label className={baseClass} style={style}>
            <div className={containerClass} style={layoutStyle}>
                <div className="relative flex items-center justify-center">
                    <input
                        {...props}
                        ref={inputRef}
                        type="checkbox"
                        className="sr-only"
                        disabled={disabled}
                        checked={isControlled ? checked : undefined}
                        defaultChecked={isControlled ? undefined : defaultChecked}
                        aria-describedby={descId}
                        aria-checked={indeterminate ? 'mixed' : isChecked}
                        onChange={handleChange}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                    />

                    <div
                        className="w-5 h-5 rounded transition-all duration-200 flex items-center justify-center border"
                        style={checkboxStyle}
                    >
                        {isChecked && (
                            <svg
                                className="w-3 h-3"
                                style={{ color: markColor }}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        )}
                        {indeterminate && !isChecked && (
                            <div className="w-2 h-0.5" style={{ backgroundColor: markColor }} />
                        )}
                    </div>
                </div>

                {(label || description) && (
                    <div className={textContainerClass}>
                        {label && (
                            <span className="text-sm font-medium text-[var(--text-muted,#94a3b8)]">
                                {label}
                            </span>
                        )}
                        {description && (
                            <span
                                id={descId}
                                className="text-xs text-[var(--text-muted,#94a3b8)]"
                            >
                                {description}
                            </span>
                        )}
                    </div>
                )}
            </div>
        </label>
    );
};
