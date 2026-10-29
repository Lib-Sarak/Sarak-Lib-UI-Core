import React from 'react';
import { SarakSlider, SarakSwitch, SarakSelect, SarakInput } from '../../../../components/atomic/Inputs';
import { HelpTooltip } from './HelpTooltip';
import { useDebouncedDraftCommit } from './useDebouncedDraftCommit';

interface SliderControlProps {
    label: string;
    description?: string;
    value: number | string | undefined | null;
    min?: number;
    max?: number;
    step?: number;
    onChange: (value: number) => void;
    suffix?: string;
    /** Unidade declarada pelo token. Sem ela o número é mostrado cru: o painel não presume `px`. */
    unit?: string;
}

/** Número que o slider mostra: valor ilegível (objeto responsivo, texto) cai no piso em vez de virar `NaN`. */
const numberOrFloor = (value: unknown, floor: number): number => {
    const parsed = Number(value ?? floor);
    return Number.isFinite(parsed) ? parsed : floor;
};

export const SliderControl: React.FC<SliderControlProps> = ({ label, description, value, min = 0, max = 100, step = 1, onChange, suffix = '', unit = '' }) => {
    // plan-36: o slider continua controlado localmente (feedback instantâneo, a cada
    // pixel arrastado) — só a propagação para `updateDraft` (que recomputa o dicionário
    // inteiro de tokens no preview) é debounced.
    const [localValue, commitValue] = useDebouncedDraftCommit<number>(numberOrFloor(value, min), onChange);

    return (
        <div className="mb-3">
            <div className="flex justify-between items-center mb-1.5">
                <span className="text-[var(--sarak-type-scale-caption,12px)] font-semibold normal-case tracking-normal text-[var(--theme-muted)] flex items-center gap-1.5">
                    {label}
                    <HelpTooltip label={label} description={description} />
                </span>
                    <span className="text-[var(--sarak-type-scale2xs,11px)] font-mono text-[var(--theme-primary)]">{localValue}{suffix || unit}</span>
            </div>
            <SarakSlider
                min={min}
                max={max}
                step={step}
                value={localValue}
                valueLabel={`${localValue}${suffix || unit}`}
                onChange={(e) => commitValue(parseFloat(e.target.value))}
            />
        </div>
    );
};

export type ResponsiveNumber = { desk: number; tab: number; mob: number };

const RESPONSIVE_AXES: Array<{ key: keyof ResponsiveNumber; label: string }> = [
    { key: 'desk', label: 'Desktop' },
    { key: 'tab', label: 'Tablet' },
    { key: 'mob', label: 'Mobile' }
];

/** Valor do token como os três pontos: escalar vale para os três; ponto ausente cai no piso. */
export const toResponsiveNumber = (value: unknown, floor: number): ResponsiveNumber => {
    if (value !== null && typeof value === 'object') {
        const source = value as Partial<Record<keyof ResponsiveNumber, unknown>>;
        return { desk: numberOrFloor(source.desk, floor), tab: numberOrFloor(source.tab, floor), mob: numberOrFloor(source.mob, floor) };
    }
    const flat = numberOrFloor(value, floor);
    return { desk: flat, tab: flat, mob: flat };
};

interface ResponsiveSliderControlProps extends Omit<SliderControlProps, 'value' | 'onChange'> {
    value: unknown;
    onChange: (value: ResponsiveNumber) => void;
}

/**
 * Slider de token responsivo: um slider por ponto (`desk`/`tab`/`mob`) e o valor gravado é sempre o objeto
 * completo — editar um ponto nunca apaga os outros, nem colapsa o token num escalar.
 */
export const ResponsiveSliderControl: React.FC<ResponsiveSliderControlProps> = ({ label, description, value, onChange, min = 0, ...rest }) => {
    const current = toResponsiveNumber(value, min);
    // Dois pontos editados dentro da janela de debounce: o segundo parte do primeiro, não do valor antigo.
    const latest = React.useRef(current);
    latest.current = current;

    const commitAxis = (axis: keyof ResponsiveNumber, next: number) => {
        latest.current = { ...latest.current, [axis]: next };
        onChange(latest.current);
    };

    return (
        <div className="mb-3" role="group" aria-label={label}>
            <span className="text-[var(--sarak-type-scale-caption,12px)] font-semibold normal-case tracking-normal text-[var(--theme-muted)] flex items-center gap-1.5 mb-1.5">
                {label}
                <HelpTooltip label={label} description={description} />
            </span>
            {RESPONSIVE_AXES.map(({ key, label: axisLabel }) => (
                <SliderControl
                    key={key}
                    {...rest}
                    min={min}
                    label={axisLabel}
                    value={current[key]}
                    onChange={(next) => commitAxis(key, next)}
                />
            ))}
        </div>
    );
};

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
            <span className="text-[var(--sarak-type-scale-caption,12px)] font-semibold normal-case tracking-normal flex items-center gap-1.5">
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
        <SarakSelect
            label={label}
            hideLabel
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


interface InputControlProps {
    label: string;
    description?: string;
    value: string | number | undefined | null;
    onChange: (value: string | number) => void;
    type?: string;
    placeholder?: string;
    /** Faixa, passo e unidade do campo numérico: sem eles o navegador aceita qualquer número. */
    min?: number;
    max?: number;
    step?: number;
    unit?: string;
}

const clampNumber = (value: number, min = -Infinity, max = Infinity): number => Math.min(Math.max(value, min), max);

export const InputControl: React.FC<InputControlProps> = ({ label, description, value, onChange, type = 'text', placeholder = '', min, max, step, unit }) => {
    // Cada tecla atualiza o campo na hora (estado local); só a propagação para `updateDraft` é debounced.
    const [localValue, commitValue] = useDebouncedDraftCommit(value ?? '', onChange);
    // O texto do campo numérico é próprio: "" e "-" no meio da digitação não são número e nunca são gravados.
    const [numberText, setNumberText] = React.useState(String(localValue));
    React.useEffect(() => { setNumberText(String(value ?? '')); }, [value]);

    const handleChange = (text: string): void => {
        if (type !== 'number') {
            commitValue(text);
            return;
        }
        setNumberText(text);
        const parsed = parseFloat(text);
        if (Number.isFinite(parsed)) commitValue(clampNumber(parsed, min, max));
    };

    return (
        <div className="mb-3">
            <div className="flex justify-between items-center mb-1.5">
                <span className="text-[var(--sarak-type-scale-caption,12px)] font-semibold normal-case tracking-normal text-[var(--theme-muted)] flex items-center gap-1.5">
                    {label}
                    <HelpTooltip label={label} description={description} />
                </span>
            </div>
            <SarakInput
                type={type}
                value={type === 'number' ? numberText : localValue}
                placeholder={placeholder}
                min={type === 'number' ? min : undefined}
                max={type === 'number' ? max : undefined}
                step={type === 'number' ? step : undefined}
                aria-label={unit ? `${label} (${unit})` : undefined}
                onChange={(e) => handleChange(e.target.value)}
            />
        </div>
    );
};

export const ToggleControl: React.FC<{ label: string, active: boolean, onClick: () => void }> = ({ label, active, onClick }) => (
    <button 
        onClick={onClick}
        className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
            active 
                ? 'bg-[var(--theme-primary)]/10 border-[var(--theme-primary)]/30 text-[var(--theme-primary)]' 
                : 'bg-[var(--color-theme-card,#101622)] border-[var(--theme-border)] text-[var(--theme-muted)] hover:bg-[var(--theme-border)]'
        }`}
    >
        <span className="text-[var(--sarak-type-scale-caption,12px)] font-semibold normal-case tracking-normal">{label}</span>
        <div className={`w-8 h-4 rounded-full relative transition-all ${active ? 'bg-[var(--theme-primary)]' : 'bg-[var(--theme-border)]'}`}>
            <div className={`absolute top-0.5 w-3 h-3 bg-[var(--theme-surface)] rounded-full transition-all ${active ? 'left-4.5' : 'left-0.5'}`} />
        </div>
    </button>
);
