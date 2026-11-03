import React from 'react';
import { useLibraryText, type LibraryTextFn } from '../../../core/i18n/useLibraryText';
import { SarakButton } from '../Buttons/SarakButton';
import { SarakAlert } from '../Feedback/SarakAlert';
import { SarakProgress } from '../Feedback/SarakProgress';
import { SarakFlex } from '../Layouts/SarakFlex';
import { mergeSarakClasses } from '../hooks/mergeSarakClasses';
import { formatSystemDuration } from './hooks/useSystemFormat';
import { SYSTEM_TONE_COLOR, SYSTEM_TONE_SHAPE, type SarakSystemTone } from './systemTone';

export type SarakRunPhaseStatus = 'pending' | 'running' | 'done' | 'failed';

export interface SarakRunPhase {
    id: string;
    label: string;
    status: SarakRunPhaseStatus;
    /** Avanço da fase em curso, de 0 a 100. */
    progress?: number;
    detail?: React.ReactNode;
}

export interface SarakRunProgressProps {
    title?: React.ReactNode;
    phases: SarakRunPhase[];
    /** Avanço geral de 0 a 100; omitido, é a média das fases. */
    progress?: number;
    /** Tempo decorrido em milissegundos; quem conta o tempo é o host. */
    elapsedMs?: number;
    /** Com ele, aparece "Cancelar execução" enquanto houver fase pendente ou em curso. */
    onCancel?: () => void;
    cancelling?: boolean;
    /** Último erro da execução, mostrado em destaque. */
    lastError?: React.ReactNode;
    className?: string;
}

const PHASE_PRESENTATION: Record<SarakRunPhaseStatus, { tone: SarakSystemTone; label: Parameters<LibraryTextFn>[0] }> = {
    pending: { tone: 'muted', label: 'runPending' },
    running: { tone: 'info', label: 'runRunning' },
    done: { tone: 'success', label: 'runDone' },
    failed: { tone: 'error', label: 'runFailed' },
};

const PERCENT_MAX = 100;

const averageProgress = (phases: SarakRunPhase[]): number => {
    if (phases.length === 0) return 0;
    const total = phases.reduce((sum, phase) => {
        if (phase.status === 'done') return sum + PERCENT_MAX;
        return sum + (phase.status === 'running' ? phase.progress ?? 0 : 0);
    }, 0);
    return total / phases.length;
};

/** Execução em curso: fases com estado escrito (nunca só cor), avanço geral, duração, cancelamento e último erro. */
export const SarakRunProgress = ({ title, phases, progress, elapsedMs, onCancel, cancelling = false, lastError, className }: SarakRunProgressProps): React.ReactElement => {
    const text = useLibraryText();
    const overall = progress ?? averageProgress(phases);
    const active = phases.some((phase) => phase.status === 'pending' || phase.status === 'running');

    return (
        <section className={mergeSarakClasses('sarak-run-progress @container w-full', className)} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 'var(--sarak-layout-gap-md, 16px)' }}>
            <SarakFlex align="center" justify="space-between" gap="spacing-sm">
                <div>
                    {title && <h2 style={{ margin: 0 }}>{title}</h2>}
                    {elapsedMs !== undefined && <span className="text-theme-muted">{text('runDuration', { time: formatSystemDuration(elapsedMs) })}</span>}
                </div>
                {onCancel && active && (
                    <SarakButton type="button" variant="danger" disabled={cancelling} isLoading={cancelling} onClick={onCancel}>
                        {text(cancelling ? 'runCancelling' : 'runCancel')}
                    </SarakButton>
                )}
            </SarakFlex>
            <SarakProgress label={text('runOverall')} value={overall} showValue />
            <ol aria-label={text('runPhases')} style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 'var(--sarak-layout-gap-sm, 8px)' }}>
                {phases.map((phase) => {
                    const presentation = PHASE_PRESENTATION[phase.status];
                    return (
                        <li key={phase.id} aria-current={phase.status === 'running' ? 'step' : undefined} data-phase-status={phase.status} style={{ display: 'grid', gap: 'calc(var(--sarak-layout-gap-sm, 8px) * 0.5)' }}>
                            <SarakFlex align="center" justify="space-between" gap="spacing-sm">
                                <span className="text-theme-text" style={{ overflowWrap: 'anywhere' }}>{phase.label}</span>
                                <span style={{ color: SYSTEM_TONE_COLOR[presentation.tone] }}>
                                    <span aria-hidden="true">{SYSTEM_TONE_SHAPE[presentation.tone]} </span>{text(presentation.label)}
                                </span>
                            </SarakFlex>
                            {phase.status === 'running' && phase.progress !== undefined && <SarakProgress label={phase.label} value={phase.progress} showValue />}
                            {phase.detail && <span className="text-theme-muted">{phase.detail}</span>}
                        </li>
                    );
                })}
            </ol>
            {lastError && <SarakAlert variant="error" title={text('runLastError')} message={lastError} />}
        </section>
    );
};
