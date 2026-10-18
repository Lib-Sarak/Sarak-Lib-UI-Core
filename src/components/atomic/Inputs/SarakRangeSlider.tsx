import React, { HTMLAttributes, useId, useMemo, useState } from 'react';
import { SarakFormGroup } from '../Layouts/SarakFormGroup';
import { SarakFieldError } from '../Feedback/SarakFieldError';
import { useLibraryText } from '../../../core/i18n/useLibraryText';

/** Par ordenado [início, fim] de um intervalo contínuo. */
export type SarakRangeValue = [number, number];

export interface SarakRangeSliderProps
    extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
    label?: string;
    min?: number;
    max?: number;
    step?: number;
    /** Controlado: par [início, fim]. */
    value?: SarakRangeValue;
    /** Não-controlado: valor inicial. */
    defaultValue?: SarakRangeValue;
    disabled?: boolean;
    error?: string;
    /** Esconde as tooltips de valor sobre os thumbs. */
    hideTooltips?: boolean;
    /** Recebe o novo par já clampado/ordenado (Spec 32: `onChange(value)`). */
    onChange?: (value: SarakRangeValue) => void;
}

const ACTIVE = 'var(--sarak-range-active-bg, var(--color-theme-primary, #19e3f0))';
const TRACK = 'var(--color-theme-border, rgba(255,255,255,0.09))';

const clamp = (n: number, lo: number, hi: number): number => Math.min(Math.max(n, lo), hi);
const percent = (n: number, min: number, max: number): number =>
    max === min ? 0 : ((n - min) / (max - min)) * 100;

/**
 * Componente Atômico: SarakRangeSlider (Spec 11, Regra 5)
 * Slider duplo (início/fim) para intervalos contínuos, com tooltips de valor.
 * Dois `<input type="range">` sobrepostos preservam a navegação por teclado nativa;
 * o trilho colorido entre os thumbs reflete os tokens do Design Engine.
 *
 * @sarak-encapsula input — o `RangeThumb` interno é um `<input type=range>`
 *   transparente; dois deles sobrepostos formam o padrão de slider duplo. São o
 *   próprio controle de início/fim, não decoração de algo maior.
 */
export const SarakRangeSlider: React.FC<SarakRangeSliderProps> = ({
    label,
    min = 0,
    max = 100,
    step = 1,
    value,
    defaultValue,
    disabled,
    error,
    hideTooltips,
    onChange,
    className = '',
    style,
    ...props
}: SarakRangeSliderProps): React.ReactElement => {
    const t = useLibraryText();
    const reactId = useId();
    const labelId = `${reactId}-label`;
    const errorId = `${reactId}-error`;
    const [internal, setInternal] = useState<SarakRangeValue>(defaultValue ?? [min, max]);
    const current = value ?? internal;
    const [low, high] = useMemo<SarakRangeValue>(
        () => [clamp(Math.min(...current), min, max), clamp(Math.max(...current), min, max)],
        [current, min, max],
    );

    const commit = (next: SarakRangeValue): void => {
        const ordered: SarakRangeValue = [Math.min(next[0], next[1]), Math.max(next[0], next[1])];
        if (value === undefined) setInternal(ordered);
        onChange?.(ordered);
    };

    const handleLow = (raw: number): void => commit([clamp(raw, min, high), high]);
    const handleHigh = (raw: number): void => commit([low, clamp(raw, low, max)]);

    const lowPct = percent(low, min, max);
    const highPct = percent(high, min, max);
    const disabledClass = disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : '';

    return (
        <SarakFormGroup
            {...props}
            className={`${disabledClass} ${className}`.trim()}
            style={style}
            role="group"
            aria-labelledby={label ? labelId : undefined}
        >
            {label && (
                <span id={labelId} className="text-2xs font-black uppercase tracking-widest text-[var(--text-muted,rgba(242,246,251,0.55))]">
                    {label}
                </span>
            )}

            <div className="relative w-full h-6 flex items-center" data-testid="sarak-range">
                {/* Trilho base + faixa ativa entre os thumbs. */}
                <div
                    className="absolute h-1 w-full rounded-full"
                    style={{ backgroundColor: TRACK }}
                />
                <div
                    className="absolute h-1 rounded-full"
                    style={{ left: `${lowPct}%`, width: `${highPct - lowPct}%`, backgroundColor: ACTIVE }}
                />

                {!hideTooltips && (
                    <>
                        <Tooltip pct={lowPct} value={low} />
                        <Tooltip pct={highPct} value={high} />
                    </>
                )}

                <RangeThumb
                    ariaLabel={t('rangeMinAriaLabel', { label: label ?? t('rangeDefaultLabel') })}
                    min={min}
                    max={max}
                    step={step}
                    value={low}
                    disabled={disabled}
                    invalid={!!error}
                    describedBy={error ? errorId : undefined}
                    onInput={handleLow}
                />
                <RangeThumb
                    ariaLabel={t('rangeMaxAriaLabel', { label: label ?? t('rangeDefaultLabel') })}
                    min={min}
                    max={max}
                    step={step}
                    value={high}
                    disabled={disabled}
                    invalid={!!error}
                    describedBy={error ? errorId : undefined}
                    onInput={handleHigh}
                />
            </div>

            <SarakFieldError message={error} fieldId={reactId} />
        </SarakFormGroup>
    );
};

interface ThumbProps {
    ariaLabel: string;
    min: number;
    max: number;
    step: number;
    value: number;
    disabled?: boolean;
    invalid: boolean;
    describedBy?: string;
    onInput: (value: number) => void;
}

/** Um `<input type="range">` transparente sobreposto — só o thumb capta o ponteiro. */
const RangeThumb: React.FC<ThumbProps> = ({
    ariaLabel,
    min,
    max,
    step,
    value,
    disabled,
    invalid,
    describedBy,
    onInput,
}: ThumbProps): React.ReactElement => (
    <input
        type="range"
        aria-label={ariaLabel}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onInput(Number(e.target.value))}
        className="sarak-range-thumb absolute w-full h-1 bg-transparent appearance-none pointer-events-none cursor-pointer"
        style={{ accentColor: ACTIVE }}
    />
);

const Tooltip: React.FC<{ pct: number; value: number }> = ({ pct, value }: { pct: number; value: number }): React.ReactElement => (
    <span
        className="absolute -top-4 -translate-x-1/2 text-2xs font-black tabular-nums"
        style={{ left: `${pct}%`, color: ACTIVE }}
    >
        {value}
    </span>
);
