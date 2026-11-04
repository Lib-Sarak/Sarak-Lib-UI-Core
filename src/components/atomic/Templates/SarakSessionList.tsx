import React from 'react';
import { useLibraryText } from '../../../core/i18n/useLibraryText';
import { SarakButton } from '../Buttons/SarakButton';
import { SarakBadge } from '../Feedback/SarakBadge';
import { SarakEmptyState } from '../Feedback/SarakEmptyState';
import { SarakFlex } from '../Layouts/SarakFlex';
import { mergeSarakClasses } from '../hooks/mergeSarakClasses';
import { useSystemFormat, type SarakSystemTimestamp } from './hooks/useSystemFormat';

export interface SarakSession {
    id: string;
    /** Aparelho e navegador em texto: "Chrome no Windows". */
    device: string;
    location?: string;
    lastActiveAt: SarakSystemTimestamp;
    /** A sessão de quem está olhando: leva o selo "Esta sessão" e não pode ser encerrada daqui. */
    current?: boolean;
}

export interface SarakSessionListProps {
    sessions: SarakSession[];
    /** Chamado ao encerrar uma sessão; quem revoga o token é o host. Sem ele, o botão não aparece. */
    onRevoke?: (sessionId: string) => void;
    /** Com ele, aparece "Encerrar as outras sessões" quando há outra além da atual. */
    onRevokeOthers?: () => void;
    className?: string;
}

/** Sessões da conta: aparelho, lugar e última atividade, com a atual marcada e o pedido de encerrar as demais. */
export const SarakSessionList = ({ sessions, onRevoke, onRevokeOthers, className }: SarakSessionListProps): React.ReactElement => {
    const text = useLibraryText();
    const format = useSystemFormat();
    const hasOthers = sessions.some((session) => !session.current);

    if (sessions.length === 0) return <SarakEmptyState type="minimal" title={text('sessionEmpty')} />;
    return (
        <div className={mergeSarakClasses('sarak-session-list @container w-full', className)} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 'var(--sarak-layout-gap-md, 16px)' }}>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {sessions.map((session) => (
                    <li key={session.id} aria-current={session.current ? 'true' : undefined} style={{ padding: 'var(--sarak-layout-gap-sm, 8px) 0', borderBottom: 'var(--sarak-border-width, 1px) solid var(--theme-border)' }}>
                        <SarakFlex align="center" justify="space-between" gap="spacing-sm">
                            <div style={{ minWidth: 0 }}>
                                <SarakFlex align="center" gap="spacing-sm" wrap={false}>
                                    <strong className="text-theme-text" style={{ overflowWrap: 'anywhere' }}>{session.device}</strong>
                                    {session.current && <SarakBadge variant="success" showStatusShape>{text('sessionCurrent')}</SarakBadge>}
                                </SarakFlex>
                                <span className="text-theme-muted" style={{ fontSize: 'var(--sarak-type-scale-xs, 11px)' }}>
                                    {[session.location, text('sessionLastActive', { time: format.dateTime(session.lastActiveAt) })].filter(Boolean).join(' · ')}
                                </span>
                            </div>
                            {onRevoke && !session.current && (
                                <SarakButton type="button" size="sm" variant="outline" onClick={() => onRevoke(session.id)}>{text('sessionRevoke', { device: session.device })}</SarakButton>
                            )}
                        </SarakFlex>
                    </li>
                ))}
            </ul>
            {onRevokeOthers && hasOthers && <div><SarakButton type="button" variant="danger" onClick={onRevokeOthers}>{text('sessionRevokeOthers')}</SarakButton></div>}
        </div>
    );
};
