import React, { InputHTMLAttributes, useId, useState } from 'react';
import { useSarakUIOptional } from '../../../core/Provider/SarakUIProvider';
import { useAtomicStyles } from '../hooks/useAtomicStyles';
import { useStructuralStyles } from '../hooks/useStructuralStyles';
import { SarakFormGroup } from '../Layouts/SarakFormGroup';
import { SarakFieldError } from '../Feedback/SarakFieldError';

export interface SarakInputProps extends InputHTMLAttributes<HTMLInputElement> {
    /**
     * Rótulo visual ligado ao campo pelo `id` (gerado quando não é informado).
     * Sem ele, não há rótulo visível; forneça outro nome acessível se necessário.
     */
    label?: string;
    /**
     * Ícone do campo; sua posição vem do layout do tema e ele não recebe clique.
     * Quando definido, prevalece sobre `leftIcon` e `rightIcon`; sem os três,
     * não há ícone.
     */
    icon?: React.ReactNode;
    /**
     * Ícone do lado esquerdo, usado somente quando `icon` não é fornecido. Junto
     * com `rightIcon`, os dois aparecem, cada um no seu lado. Sozinho, segue a
     * posição do layout do tema.
     */
    leftIcon?: React.ReactNode;
    /**
     * Ícone do lado direito, usado somente quando `icon` não é fornecido. Aceita
     * clique (por exemplo, o botão de mostrar a senha). Junto com `leftIcon`, fica
     * à direita; sozinho, segue a posição do layout do tema.
     */
    rightIcon?: React.ReactNode;
    /**
     * Mensagem abaixo do campo, ligada por `aria-describedby`, que também marca
     * `aria-invalid`. Sem a prop, não há mensagem nem estado inválido.
     */
    error?: string;
    /**
     * Faz o grupo do campo ocupar toda a largura disponível. Omitida ou `false`,
     * a largura fica a cargo do layout pai.
     */
    fullWidth?: boolean;
}

interface IconSlot {
    node: React.ReactNode;
    side: 'left' | 'right';
    interactive: boolean;
}

/** `icon` manda; `leftIcon` + `rightIcon` ocupam um lado cada; um só segue o lado do tema. */
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

const ICON_SIDE_CLASS = { left: 'absolute left-3', right: 'absolute right-3' } as const;
const ICON_INERT_CLASS = 'pointer-events-none text-[var(--sarak-input-icon-color,var(--text-muted,#94a3b8))] transition-colors group-focus-within:text-[var(--sarak-input-focus-border-color,var(--sarak-primary-color,#00f2ff))]';
const ICON_INTERACTIVE_CLASS = 'text-[var(--sarak-input-icon-color,var(--text-muted,#94a3b8))] transition-colors group-focus-within:text-[var(--sarak-input-focus-border-color,var(--sarak-primary-color,#00f2ff))]';

/**
 * Componente Atômico: SarakInput
 * Segue a regra da "Composição Atômica Obrigatória" da Sarak-Lib-UI-Core.
 *
 * @sarak-encapsula input — a razão de existir deste componente é encapsular o
 *   `<input>` nativo, para teclado e leitor de tela funcionarem por construção.
 */
export const SarakInput: React.FC<SarakInputProps> = ({
    label,
    icon,
    leftIcon,
    rightIcon,
    error,
    fullWidth,
    className = '',
    disabled,
    style,
    ...props
}) => {
    // Átomo: tolera montar sem SarakUIProvider (Spec 18 — R10 §2.3), usa o default abaixo.
    const design = useSarakUIOptional()?.design;
    const { getInputStyles } = useAtomicStyles();
    const { getInputIconStyles } = useStructuralStyles();
    const { isIconRight } = getInputIconStyles();
    const [isFocused, setIsFocused] = useState(false);

    // a11y (Spec 41, Regras 2/5): conecta label↔input via id e o erro via aria-describedby.
    const reactId = useId();
    const inputId = props.id ?? reactId;
    const errorId = `${inputId}-error`;

    const baseClasses = 'block text-[var(--sarak-input-text-color,var(--text-muted,#94a3b8))] font-medium outline-none transition-all placeholder:text-[var(--sarak-input-text-color,var(--text-muted,#94a3b8))]/30 bg-[var(--sarak-input-bg,var(--color-theme-card,#1e293b))]';
    const shapeClasses = 'rounded-input py-[var(--sarak-input-padding,16px)]';
    
    const widthClass = fullWidth ? 'w-full' : '';
    const disabledClass = disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : '';
    
    const iconSlots = resolveIconSlots(icon, leftIcon, rightIcon, isIconRight ? 'right' : 'left');

    // O padding abre espaço no lado de cada ícone renderizado
    const paddingLeftClass = iconSlots.some((slot) => slot.side === 'left') ? 'pl-11' : 'pl-4';
    const paddingRightClass = iconSlots.some((slot) => slot.side === 'right') ? 'pr-11' : 'pr-4';

    const dynamicStyle: React.CSSProperties = { 
        ...style,
        ...getInputStyles(design, isFocused)
    };

    return (
        <SarakFormGroup className={`${widthClass} ${className}`}>
            {label && <label htmlFor={inputId} className="text-sm font-medium">{label}</label>}
            
            <div className="flex-1 flex relative w-full" style={{ flexDirection: 'column' }}>
                <div className="relative w-full flex items-center">
                    {iconSlots.map((slot) => (
                        <div
                            key={slot.side}
                            className={`${ICON_SIDE_CLASS[slot.side]} flex items-center ${slot.interactive ? ICON_INTERACTIVE_CLASS : ICON_INERT_CLASS}`}
                        >
                            {slot.node}
                        </div>
                    ))}
                    
                    <input
                        className={`${baseClasses} ${shapeClasses} ${paddingLeftClass} ${paddingRightClass} w-full ${disabledClass}`}
                        disabled={disabled}
                        style={dynamicStyle}
                        aria-invalid={error ? true : undefined}
                        aria-describedby={error ? errorId : undefined}
                        onFocus={(e) => { setIsFocused(true); props.onFocus?.(e); }}
                        onBlur={(e) => { setIsFocused(false); props.onBlur?.(e); }}
                        {...props}
                        id={inputId}
                    />
                </div>

                <SarakFieldError message={error} fieldId={inputId} />
            </div>
        </SarakFormGroup>
    );
};
