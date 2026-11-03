import React from 'react';
import { useLibraryText, type LibraryTextFn } from '../../../core/i18n/useLibraryText';
import { SarakProgress } from '../Feedback/SarakProgress';
import { mergeSarakClasses } from '../hooks/mergeSarakClasses';
import { useSystemFormat } from './hooks/useSystemFormat';
import { SYSTEM_TONE_COLOR, SYSTEM_TONE_SHAPE, type SarakSystemTone } from './systemTone';

export interface SarakUsageMeterProps {
    /** O que se mede: "Chamadas por dia", "Armazenamento". */
    label: string;
    used: number;
    limit: number;
    /** Unidade escrita depois dos números: "GB", "chamadas". */
    unit?: string;
    /** Fração do limite em que o aviso começa. Padrão `0.8`. */
    warnAt?: number;
    /** Fração do limite em que o estado vira crítico. Padrão `0.95`. */
    criticalAt?: number;
    className?: string;
}

type UsageLevel = 'ok' | 'warning' | 'critical' | 'exceeded';

const DEFAULT_WARN_AT = 0.8;
const DEFAULT_CRITICAL_AT = 0.95;
const PERCENT = 100;

const LEVEL_PRESENTATION: Record<UsageLevel, { tone: SarakSystemTone; label: Parameters<LibraryTextFn>[0] }> = {
    ok: { tone: 'success', label: 'usageOk' },
    warning: { tone: 'warning', label: 'usageWarning' },
    critical: { tone: 'error', label: 'usageCritical' },
    exceeded: { tone: 'error', label: 'usageExceeded' },
};

/** Sem limite (zero), qualquer uso é excesso; sem uso, não há o que medir. */
const ratioOf = (used: number, limit: number): number => {
    if (limit > 0) return used / limit;
    return used > 0 ? Infinity : 0;
};

const levelOf =(ratio: number, warnAt: number, criticalAt: number): UsageLevel => {
    if (ratio > 1) return 'exceeded';
    if (ratio >= criticalAt) return 'critical';
    return ratio >= warnAt ? 'warning' : 'ok';
};

/** Medidor de limite de uso: barra, "X de Y", porcentagem e o nível escrito (dentro, perto, crítico, excedido). */
export const SarakUsageMeter = ({ label, used, limit, unit, warnAt = DEFAULT_WARN_AT, criticalAt = DEFAULT_CRITICAL_AT, className }: SarakUsageMeterProps): React.ReactElement => {
    const text = useLibraryText();
    const format = useSystemFormat();
    const ratio = ratioOf(used, limit);
    const level = LEVEL_PRESENTATION[levelOf(ratio, warnAt, criticalAt)];
    const suffix = unit ? ` ${unit}` : '';
    const amount = text('usageOf', { used: `${format.number(used)}${suffix}`, limit: `${format.number(limit)}${suffix}` });

    return (
        <div className={mergeSarakClasses('sarak-usage-meter w-full', className)} style={{ display: 'grid', gap: 'calc(var(--sarak-layout-gap-sm, 8px) * 0.5)' }}>
            <SarakProgress
                label={label}
                value={used}
                max={limit}
                allowOverflow
                thresholds={[{ value: limit * warnAt, variant: 'warning' }, { value: limit * criticalAt, variant: 'error' }]}
            />
            <span className="text-theme-text">{amount}{Number.isFinite(ratio) && ` (${Math.round(ratio * PERCENT)}%)`}</span>
            <span role="status" style={{ color: SYSTEM_TONE_COLOR[level.tone] }}>
                <span aria-hidden="true">{SYSTEM_TONE_SHAPE[level.tone]} </span>{text(level.label)}
            </span>
        </div>
    );
};
