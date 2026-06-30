import React from 'react';
import { SarakSlider, SarakSwitch, SarakSelect, SarakInput } from '../../../../components/atomic/Inputs';
import { HelpTooltip } from './HelpTooltip';

interface SliderControlProps {
    label: string;
    description?: string;
    value: number | string | undefined | null;
    min?: number;
    max?: number;
    step?: number;
    onChange: (value: number) => void;
    suffix?: string;
    unit?: string;
}

export const SliderControl: React.FC<SliderControlProps> = ({ label, description, value, min = 0, max = 100, step = 1, onChange, suffix = '', unit = 'px' }) => (
    <div className="mb-3">
        <div className="flex justify-between items-center mb-1.5">
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--theme-muted)] flex items-center gap-1.5">
                {label}
                <HelpTooltip label={label} description={description} />
            </span>
            <span className="text-[10px] font-mono text-[var(--theme-primary)]">{value ?? 0}{suffix || unit}</span>
        </div>
        <SarakSlider 
            min={min} 
            max={max} 
            step={step} 
            value={value ?? 0} 
            valueLabel={`${value ?? 0}${suffix || unit}`}
            onChange={(e) => onChange(parseFloat(e.target.value))}
        />
    </div>
);

interface SwitchControlProps {
    label: string;
    description?: string;
    value: boolean | undefined | null;
    onChange: (value: boolean) => void;
}

export const SwitchControl: React.FC<SwitchControlProps> = ({ label, value, onChange, description }) => (
    <SarakSwitch 
        checked={!!value}
        onChange={(e) => onChange(e.target.checked)}
        label={
            <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                {label}
                <HelpTooltip label={label} description={description} />
            </span>
        }
    />
);

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

export const SelectControl: React.FC<SelectControlProps> = ({ label, description, options, value, onChange, isFont = false }) => (
    <div className="mb-3">
        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--theme-muted)] flex items-center gap-1.5 mb-1.5">
            {label}
            <HelpTooltip label={label} description={description} />
        </span>
        <SarakSelect 
            value={value ?? ''} 
            onChange={(e) => onChange(e.target.value)}
            style={isFont ? { fontFamily: value || undefined } : {}}
        >
            {(options || []).map((opt: string | SelectOption) => {
                const optId = typeof opt === 'object' ? (opt.id !== undefined ? opt.id : (opt.value !== undefined ? opt.value : '')) : opt;
                const optLabel = typeof opt === 'object' ? (opt.label || opt.name || optId) : opt;
                return (
                    <option key={optId} value={optId}>
                        {optLabel}
                    </option>
                );
            })}
        </SarakSelect>
    </div>
);


interface InputControlProps {
    label: string;
    description?: string;
    value: string | number | undefined | null;
    onChange: (value: string | number) => void;
    type?: string;
    placeholder?: string;
}

export const InputControl: React.FC<InputControlProps> = ({ label, description, value, onChange, type = 'text', placeholder = '' }) => (
    <div className="mb-3">
        <div className="flex justify-between items-center mb-1.5">
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--theme-muted)] flex items-center gap-1.5">
                {label}
                <HelpTooltip label={label} description={description} />
            </span>
        </div>
        <SarakInput 
            type={type}
            value={value ?? ''} 
            placeholder={placeholder}
            onChange={(e) => onChange(type === 'number' ? parseFloat(e.target.value) : e.target.value)}
        />
    </div>
);

export const ToggleControl: React.FC<{ label: string, active: boolean, onClick: () => void }> = ({ label, active, onClick }) => (
    <button 
        onClick={onClick}
        className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
            active 
                ? 'bg-[var(--theme-primary)]/10 border-[var(--theme-primary)]/30 text-[var(--theme-primary)]' 
                : 'bg-[var(--color-theme-card,#1e293b)] border-[var(--theme-border)] text-[var(--theme-muted)] hover:bg-[var(--theme-border)]'
        }`}
    >
        <span className="text-[10px] font-black uppercase tracking-wider">{label}</span>
        <div className={`w-8 h-4 rounded-full relative transition-all ${active ? 'bg-[var(--theme-primary)]' : 'bg-[var(--theme-border)]'}`}>
            <div className={`absolute top-0.5 w-3 h-3 bg-[var(--theme-surface)] rounded-full transition-all ${active ? 'left-4.5' : 'left-0.5'}`} />
        </div>
    </button>
);
