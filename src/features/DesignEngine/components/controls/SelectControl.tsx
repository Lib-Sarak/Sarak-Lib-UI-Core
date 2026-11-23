import React from 'react';
import { SarakSelect } from '../../../../components/atomic/Inputs';
import { HelpTooltip } from './HelpTooltip';

export interface SelectOption {
    id?: string;
    value?: string;
    label?: string;
    name?: string;
}

interface SelectControlProps {
    label: string;
    description?: string;
    options: (string | SelectOption)[];
    value: string | undefined | null;
    onChange: (value: string) => void;
    isFont?: boolean;
}

/** O que a opção grava: o `value` (que a validação confere); só na falta dele, o `id`. */
export const optionValue = (opt: string | SelectOption): string => {
    if (typeof opt !== 'object') return opt;
    return opt.value !== undefined ? opt.value : (opt.id !== undefined ? opt.id : '');
};

export const SelectControl: React.FC<SelectControlProps> = ({ label, description, options, value, onChange, isFont = false }) => (
    <div className="mb-3">
        <span className="text-[var(--sarak-type-scale-caption,12px)] font-semibold normal-case tracking-normal text-[var(--theme-muted)] flex items-center gap-1.5 mb-1.5">
            {label}
            <HelpTooltip label={label} description={description} />
        </span>
        {/* `fullWidth`: a lista ocupa a largura da linha e corta o texto que não cabe; sem isso o `<select>` tem a largura da opção mais longa e passa da borda da coluna quando a opção traduzida é maior que a em português. */}
        <SarakSelect
            label={label}
            hideLabel
            fullWidth
            value={value ?? ''} 
            onChange={(e) => onChange(e.target.value)}
            style={isFont ? { fontFamily: value || undefined } : {}}
        >
            {(options || []).map((opt: string | SelectOption) => {
                const optValue = optionValue(opt);
                const optLabel = typeof opt === 'object' ? (opt.label || opt.name || optValue) : opt;
                return (
                    <option key={optValue} value={optValue}>
                        {optLabel}
                    </option>
                );
            })}
        </SarakSelect>
    </div>
);
