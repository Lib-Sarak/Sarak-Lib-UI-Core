import React, { InputHTMLAttributes } from 'react';
import { useSarakUI } from '../../../core/Provider/SarakUIProvider';
import { useAtomicStyles } from '../hooks/useAtomicStyles';

export interface SarakSwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
    label?: React.ReactNode;
    description?: React.ReactNode;
}

/**
 * Componente Atômico: SarakSwitch
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

    const { trackStyle, thumbStyle } = getSwitchStyles(design, !!checked);

    return (
        <label className={`flex items-center gap-4 cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''} ${className}`} style={style}>
            <div className="relative">
                <input
                    type="checkbox"
                    className="sr-only"
                    disabled={disabled}
                    checked={checked}
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
                <div className="flex flex-col">
                    {label && <span className="text-sm font-medium text-[var(--sx-color-text-muted)]">{label}</span>}
                    {description && <span className="text-xs text-[var(--sx-color-text-muted)]">{description}</span>}
                </div>
            )}
        </label>
    );
};
