import React from 'react';
import { useLibraryText } from '../../../core/i18n/useLibraryText';

/** Passo de um fluxo orientado (Spec 14, Regra 2). */
export interface SarakStepConfig {
    /** Rótulo do passo. */
    label: string;
    /** Descrição/legenda opcional. */
    description?: string;
}

export type SarakStepperOrientation = 'horizontal' | 'vertical';

export interface SarakStepperProps {
    /** Passos na ordem do fluxo. */
    steps: SarakStepConfig[];
    /** Índice (0-based) do passo atual. */
    current: number;
    /** Disposição (default: horizontal). */
    orientation?: SarakStepperOrientation;
    className?: string;
}

type StepState = 'done' | 'current' | 'todo';

const stateOf = (index: number, current: number): StepState =>
    index < current ? 'done' : index === current ? 'current' : 'todo';

const markerClass: Record<StepState, string> = {
    done: 'bg-[var(--sarak-primary-color,#19e3f0)] text-[var(--color-theme-card,#101622)] border-[var(--sarak-primary-color,#19e3f0)]',
    current:
        'bg-[var(--color-theme-card,#101622)] text-[var(--sarak-primary-color,#19e3f0)] border-[var(--sarak-primary-color,#19e3f0)] font-bold',
    todo: 'bg-[var(--color-theme-card,#101622)] text-[var(--text-muted,rgba(242,246,251,0.55))] border-[var(--border-color,rgba(255,255,255,0.09))]',
};

/**
 * Desenha passos + conectores indicando concluído/atual/futuro (Spec 14, Regra 2).
 * Em horizontal, a barra faz overflow-x com scroll em telas pequenas — nunca quebra
 * em duas linhas (Critério de Aceite).
 */
export const SarakStepper: React.FC<SarakStepperProps> = ({
    steps,
    current,
    orientation = 'horizontal',
    className = '',
}) => {
    const t = useLibraryText();
    const isVertical = orientation === 'vertical';
    const container = isVertical
        ? 'flex flex-col gap-1'
        : 'flex flex-row items-center overflow-x-auto whitespace-nowrap';

    return (
        <ol className={`${container} ${className}`} aria-label={t('stepperAriaLabel')}>
            {steps.map((step, index) => {
                const state = stateOf(index, current);
                const isLast = index === steps.length - 1;
                return (
                    <li
                        key={`${step.label}-${index}`}
                        className={`flex items-center ${isVertical ? '' : 'shrink-0'}`}
                        style={{ flexDirection: isVertical ? 'row' : 'column', gap: isVertical ? 'calc(var(--sarak-layout-gap-md, 16px) * 0.75)' : undefined }}
                        aria-current={state === 'current' ? 'step' : undefined}
                    >
                        <div className="flex items-center" style={{ flexDirection: isVertical ? 'column' : 'row' }}>
                            <span
                                className={`w-8 h-8 inline-flex items-center justify-center rounded-full border text-sm transition-colors ${markerClass[state]}`}
                            >
                                {state === 'done' ? '✓' : index + 1}
                            </span>
                            {!isLast && (
                                <span
                                    className={`${
                                        isVertical ? 'w-px h-6' : 'h-px w-10'
                                    } ${state === 'done' ? 'bg-[var(--sarak-primary-color,#19e3f0)]' : 'bg-[var(--border-color,rgba(255,255,255,0.09))]'}`}
                                    style={isVertical
                                        ? { marginBlock: 'calc(var(--sarak-layout-gap-md, 16px) * 0.25)' }
                                        : { marginInline: 'var(--sarak-layout-gap-sm, 8px)' }}
                                    aria-hidden="true"
                                />
                            )}
                        </div>
                        <span
                            className={`text-xs ${isVertical ? '' : 'max-w-24 truncate text-center'} ${
                                state === 'todo'
                                    ? 'text-[var(--text-muted,rgba(242,246,251,0.55))]'
                                    : 'text-[var(--sarak-text-main,#f2f6fb)]'
                            }`}
                            style={isVertical ? undefined : { marginTop: 'calc(var(--sarak-layout-gap-md, 16px) * 0.25)' }}
                            title={step.label}
                        >
                            {step.label}
                        </span>
                    </li>
                );
            })}
        </ol>
    );
};
