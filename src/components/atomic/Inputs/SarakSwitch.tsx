import React, { InputHTMLAttributes } from 'react';
import { useSarakUI } from '../../../core/Provider/SarakUIProvider';

export interface SarakSwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
    label?: string;
    description?: string;
}

/**
 * Componente Atômico: SarakSwitch
 * Substitui o `<input type="checkbox">` e alternadores. 
 * Estilizado via Design Engine.
 */
export const SarakSwitch: React.FC<SarakSwitchProps> = ({
    label,
    description,
    className = '',
    disabled,
    checked,
    style,
    ...props
}) => {
    const { design } = useSarakUI();

    const activeBg = 'var(--sarak-switch-active-bg, var(--theme-primary))';
    const thumbBg = 'var(--sarak-switch-thumb, #ffffff)';
    const blurAmount = design?.switchBackdropBlur || 4;
    const styleType = design?.switchStyleType || 'tactile';

    const dynamicTrackStyle: React.CSSProperties = {
        backgroundColor: checked ? activeBg : 'rgba(255, 255, 255, 0.1)',
        backdropFilter: `blur(${blurAmount}px)`,
        WebkitBackdropFilter: `blur(${blurAmount}px)`
    };

    const dynamicThumbStyle: React.CSSProperties = {
        backgroundColor: thumbBg,
        transform: checked ? 'translateX(100%)' : 'translateX(0)',
    };

    if (styleType === 'glass') {
        dynamicTrackStyle.backgroundColor = checked ? activeBg : 'rgba(255, 255, 255, 0.05)';
        dynamicTrackStyle.border = '1px solid rgba(255, 255, 255, 0.1)';
    }

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
                    style={dynamicTrackStyle}
                ></div>
                <div
                    className="absolute left-1 top-1 w-4 h-4 rounded-full transition-transform duration-300 ease-in-out shadow-sm"
                    style={dynamicThumbStyle}
                ></div>
            </div>
            
            {(label || description) && (
                <div className="flex flex-col">
                    {label && <span className="text-sm font-medium text-[var(--theme-text)]">{label}</span>}
                    {description && <span className="text-xs text-[var(--theme-text-sec)]">{description}</span>}
                </div>
            )}
        </label>
    );
};
