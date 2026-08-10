import React, { InputHTMLAttributes } from 'react';
import { useSarakUI } from '../../../core/Provider/SarakUIProvider';
import { SarakFormGroup } from '../Layouts/SarakFormGroup';

export interface SarakSliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
    label?: string;
    valueLabel?: string | number;
}

/**
 * Componente Atômico: SarakSlider
 * Substitui o `<input type="range">`.
 *
 * @sarak-encapsula input — dá trilho e thumb com tokens Sarak ao `<input
 *   type=range>` nativo; é o próprio input estilizado, não uma peça de algo maior.
 */
export const SarakSlider: React.FC<SarakSliderProps> = ({
    label,
    valueLabel,
    className = '',
    disabled,
    style,
    ...props
}) => {
    const { design } = useSarakUI();

    const activeColor = 'var(--sarak-switch-active-bg, var(--sarak-primary-color,#3b82f6))';
    const trackColor = 'rgba(255, 255, 255, 0.1)';

    return (
        <SarakFormGroup className={`${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''} ${className}`} style={style}>
            {(label || valueLabel) && (
                <div className="flex justify-between items-center w-full text-2xs font-black uppercase tracking-widest text-[var(--text-muted,#94a3b8)]">
                    {label && <span>{label}</span>}
                    {valueLabel !== undefined && <span style={{ color: activeColor }}>{valueLabel}</span>}
                </div>
            )}
            
            <input
                type="range"
                disabled={disabled}
                aria-label={props['aria-label'] ?? label}
                aria-valuetext={valueLabel !== undefined ? String(valueLabel) : undefined}
                {...props}
                className="w-full h-1 rounded-full appearance-none cursor-pointer"
                style={{
                    backgroundColor: trackColor,
                    accentColor: activeColor
                }}
            />
        </SarakFormGroup>
    );
};
