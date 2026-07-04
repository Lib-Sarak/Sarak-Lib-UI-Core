import React from 'react';

/** Passo de um fluxo orientado (Spec 14, Regra 2). */
export interface StepConfig {
    /** Rótulo do passo. */
    label: string;
    /** Descrição/legenda opcional. */
    description?: string;
}

export type StepperOrientation = 'horizontal' | 'vertical';

export interface SarakStepperProps {
    /** Passos na ordem do fluxo. */
    steps: StepConfig[];
    /** Índice (0-based) do passo atual. */
    current: number;
    /** Disposição (default: horizontal). */
    orientation?: StepperOrientation;
    className?: string;
}

type StepState = 'done' | 'current' | 'todo';

const stateOf = (index: number, current: number): StepState =>
    index < current ? 'done' : index === current ? 'current' : 'todo';

const markerClass: Record<StepState, string> = {
    done: 'bg-[var(--sarak-primary-color,#3b82f6)] text-[var(--color-theme-card,#1e293b)] border-[var(--sarak-primary-color,#3b82f6)]',
    current:
        'bg-[var(--color-theme-card,#1e293b)] text-[var(--sarak-primary-color,#3b82f6)] border-[var(--sarak-primary-color,#3b82f6)] font-bold',
    todo: 'bg-[var(--color-theme-card,#1e293b)] text-[var(--text-muted,#94a3b8)] border-[var(--border-color,#334155)]',
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
    const isVertical = orientation === 'vertical';
    const container = isVertical
        ? 'flex flex-col gap-1'
        : 'flex flex-row items-center overflow-x-auto whitespace-nowrap';

    return (
        <ol className={`${container} ${className}`} aria-label="Progresso por etapas">
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
                                    } ${state === 'done' ? 'bg-[var(--sarak-primary-color,#3b82f6)]' : 'bg-[var(--border-color,#334155)]'}`}
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
                                    ? 'text-[var(--text-muted,#94a3b8)]'
                                    : 'text-[var(--sarak-text-main,#ffffff)]'
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
