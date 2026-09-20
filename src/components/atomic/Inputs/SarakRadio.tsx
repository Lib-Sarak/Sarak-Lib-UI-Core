import React, { InputHTMLAttributes, useId, useRef, useEffect, useState } from 'react';
import { useSarakUIOptional } from '../../../core/Provider/SarakUIProvider';
import { useAtomicStyles } from '../hooks/useAtomicStyles';
import { useStructuralStyles } from '../hooks/useStructuralStyles';
import { mergeSarakClasses } from '../hooks/mergeSarakClasses';

export interface SarakRadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
    label?: React.ReactNode;
    description?: React.ReactNode;
}

/**
 * Componente Atômico: SarakRadio
 *
 * @sarak-encapsula input — o `<input type=radio>` é o controle real
 *   (foco, teclado, leitor de tela, agrupamento por name); círculo visual
 *   é só a pele sobreposta. Agrupamento é feito via atributo `name` nativo.
 *
 * Contrato de valor (o do React): quem passa `checked` GOVERNA — pele e `<input>` seguem
 * esse valor e o componente não guarda estado próprio. Sem `checked`, o componente guarda
 * o valor, semeado por `defaultChecked`. O `onChange` de quem chama é sempre chamado, nos
 * dois modos.
 */
export const SarakRadio: React.FC<SarakRadioProps> = ({
    label,
    description,
    className = '',
    disabled,
    checked,
    defaultChecked,
    onChange,
    onFocus,
    onBlur,
    style,
    ...props
}) => {
    const design = useSarakUIOptional()?.design;
    const { getRadioStyles, getChoiceMarkColor } = useAtomicStyles();
    const { getRadioLayoutStyles } = useStructuralStyles();
    const [isFocused, setIsFocused] = useState(false);
    const [ownChecked, setOwnChecked] = useState(!!defaultChecked);
    const inputRef = useRef<HTMLInputElement>(null);

    const isControlled = checked !== undefined;
    const isChecked = isControlled ? !!checked : ownChecked;

    // Marcar um rádio desmarca os irmãos do grupo SEM disparar `change` neles: quem guarda o
    // próprio valor escuta o `change` da raiz (documento ou shadow root) para reler o do
    // `<input>`. Sem isso a pele do rádio desmarcado ficaria marcada.
    useEffect(() => {
        const input = inputRef.current;
        if (isControlled || !input) return;
        const root = input.getRootNode();
        const syncWithGroup = (e: Event) => {
            const target = e.target as HTMLInputElement;
            const sameGroup = target === input || (!!input.name && target.name === input.name);
            if (sameGroup) setOwnChecked(input.checked);
        };
        root.addEventListener('change', syncWithGroup);
        return () => root.removeEventListener('change', syncWithGroup);
    }, [isControlled]);

    // Sempre um handler: `checked` sem `onChange` faria o React avisar, e o valor de quem chama
    // é só repassado — o valor próprio (modo não controlado) é lido pelo `change` da raiz.
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => onChange?.(e);
    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(true);
        onFocus?.(e);
    };
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(false);
        onBlur?.(e);
    };

    const reactId = useId();
    const descId = description ? `${reactId}-desc` : undefined;

    const radioStyle = getRadioStyles(design, isChecked, isFocused);
    const { containerClass, textContainerClass, style: layoutStyle } = getRadioLayoutStyles();
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
                        type="radio"
                        className="sr-only"
                        disabled={disabled}
                        checked={isControlled ? checked : undefined}
                        defaultChecked={isControlled ? undefined : defaultChecked}
                        aria-describedby={descId}
                        onChange={handleChange}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                    />

                    <div
                        className="w-5 h-5 rounded-full transition-all duration-200 flex items-center justify-center border"
                        style={radioStyle}
                    >
                        {isChecked && (
                            <div
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: getChoiceMarkColor() }}
                            />
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
