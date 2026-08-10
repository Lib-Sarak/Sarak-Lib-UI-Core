import React, { InputHTMLAttributes, useId } from 'react';
import { useSarakUI } from '../../../core/Provider/SarakUIProvider';
import { useAtomicStyles } from '../hooks/useAtomicStyles';
import { useStructuralStyles } from '../hooks/useStructuralStyles';

export interface SarakSwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
    label?: React.ReactNode;
    description?: React.ReactNode;
}

/**
 * Componente Atômico: SarakSwitch
 *
 * @sarak-encapsula input — o `<input type=checkbox role=switch>` é o controle
 *   real (foco, teclado, leitor de tela); trilho e thumb são só a pele visual
 *   sobreposta. Sem o input não há switch, só dois `<div>` decorativos.
 */
export const SarakSwitch: React.FC<SarakSwitchProps> = ({
    label,
    description,
    className = '',
    disabled,
    checked = false,
    style,
    ...props
}) => {
    const { design } = useSarakUI();
    const { getSwitchStyles } = useAtomicStyles();
    const { getSwitchLayoutStyles } = useStructuralStyles();

    const { trackStyle, thumbStyle } = getSwitchStyles(design, !!checked);
    const layoutStyles = getSwitchLayoutStyles();

    const baseClass = `${layoutStyles.containerClass} ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''} ${className}`;

    // a11y (Spec 41, Regras 2/5): padrão WAI-ARIA switch + descrição linkada por id.
    const reactId = useId();
    const descId = description ? `${reactId}-desc` : undefined;

    return (
        <label className={baseClass.trim()} style={{ ...layoutStyles.style, ...style }}>
            <div className="relative">
                <input
                    type="checkbox"
                    role="switch"
                    className="sr-only"
                    disabled={disabled}
                    checked={checked}
                    aria-checked={!!checked}
                    aria-describedby={descId}
                    {...props}
                />
                <div
                    className="block w-10 h-6 rounded-full transition-all duration-300 ease-in-out"
                    style={trackStyle}
                ></div>
                <div
                    className="absolute left-1 top-1 w-4 h-4 rounded-full transition-transform duration-300 ease-in-out shadow-sm"
                    style={thumbStyle}
                ></div>
            </div>
            
            {(label || description) && (
                <div className={layoutStyles.textContainerClass}>
                    {label && <span className="text-sm font-medium text-[var(--text-muted,#94a3b8)]">{label}</span>}
                    {description && <span id={descId} className="text-xs text-[var(--text-muted,#94a3b8)]">{description}</span>}
                </div>
            )}
        </label>
    );
};
