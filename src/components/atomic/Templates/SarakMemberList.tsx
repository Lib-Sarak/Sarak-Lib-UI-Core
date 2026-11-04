import React from 'react';
import { useLibraryText } from '../../../core/i18n/useLibraryText';
import { SarakButton } from '../Buttons/SarakButton';
import { SarakBadge } from '../Feedback/SarakBadge';
import { SarakEmptyState } from '../Feedback/SarakEmptyState';
import { SarakFlex } from '../Layouts/SarakFlex';
import { mergeSarakClasses } from '../hooks/mergeSarakClasses';
import { useSystemFormat, type SarakSystemTimestamp } from './hooks/useSystemFormat';

export interface SarakMember {
    id: string;
    name: string;
    email?: string;
    /** Papel em texto, mostrado como selo. */
    role?: string;
}

export interface SarakInvitation {
    id: string;
    email: string;
    role?: string;
    sentAt?: SarakSystemTimestamp;
}

export interface SarakMemberListProps {
    members: SarakMember[];
    /** Convites enviados e ainda sem resposta; sem eles, a seção não aparece. */
    invitations?: SarakInvitation[];
    /** Chamados com o id; a regra (quem pode remover) e a rede são do host. Sem o callback, o botão não aparece. */
    onRemoveMember?: (memberId: string) => void;
    onResendInvitation?: (invitationId: string) => void;
    onRevokeInvitation?: (invitationId: string) => void;
    /** Ações extras por membro, ao lado de "Remover". */
    renderMemberActions?: (member: SarakMember) => React.ReactNode;
    className?: string;
}

const ROW_STYLE: React.CSSProperties = { padding: 'var(--sarak-layout-gap-sm, 8px) 0', borderBottom: 'var(--sarak-border-width, 1px) solid var(--theme-border)' };
const LIST_STYLE: React.CSSProperties = { listStyle: 'none', margin: 0, padding: 0 };

const Identity = ({ title, subtitle, role }: { title: string; subtitle?: string; role?: string }): React.ReactElement => (
    <div style={{ minWidth: 0 }}>
        <SarakFlex align="center" gap="spacing-sm" wrap={false}>
            <strong className="text-theme-text" style={{ overflowWrap: 'anywhere' }}>{title}</strong>
            {role && <SarakBadge variant="muted" soft>{role}</SarakBadge>}
        </SarakFlex>
        {subtitle && <span className="text-theme-muted" style={{ overflowWrap: 'anywhere', fontSize: 'var(--sarak-type-scale-xs, 11px)' }}>{subtitle}</span>}
    </div>
);

/** Membros e convites pendentes, com as ações que o host liga. Apresentacional: nada é enviado, removido ou revogado aqui. */
export const SarakMemberList = ({ members, invitations = [], onRemoveMember, onResendInvitation, onRevokeInvitation, renderMemberActions, className }: SarakMemberListProps): React.ReactElement => {
    const text = useLibraryText();
    const format = useSystemFormat();

    return (
        <div className={mergeSarakClasses('sarak-member-list @container w-full', className)} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 'var(--sarak-layout-gap-lg, 24px)' }}>
            <section aria-label={text('memberMembers')}>
                <h3 style={{ margin: 0 }}>{text('memberMembers')}</h3>
                {members.length === 0 ? <SarakEmptyState type="minimal" title={text('memberEmpty')} /> : (
                    <ul style={LIST_STYLE}>
                        {members.map((member) => (
                            <li key={member.id} style={ROW_STYLE}>
                                <SarakFlex align="center" justify="space-between" gap="spacing-sm">
                                    <Identity title={member.name} subtitle={member.email} role={member.role} />
                                    <SarakFlex align="center" gap="spacing-sm">
                                        {renderMemberActions?.(member)}
                                        {onRemoveMember && <SarakButton type="button" size="sm" variant="outline" onClick={() => onRemoveMember(member.id)}>{text('memberRemove', { name: member.name })}</SarakButton>}
                                    </SarakFlex>
                                </SarakFlex>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
            {invitations.length > 0 && (
                <section aria-label={text('memberInvites')}>
                    <h3 style={{ margin: 0 }}>{text('memberInvites')}</h3>
                    <ul style={LIST_STYLE}>
                        {invitations.map((invitation) => (
                            <li key={invitation.id} style={ROW_STYLE}>
                                <SarakFlex align="center" justify="space-between" gap="spacing-sm">
                                    <Identity title={invitation.email} subtitle={invitation.sentAt ? text('memberInvitedAt', { date: format.date(invitation.sentAt) }) : undefined} role={invitation.role} />
                                    <SarakFlex align="center" gap="spacing-sm">
                                        {onResendInvitation && <SarakButton type="button" size="sm" variant="ghost" onClick={() => onResendInvitation(invitation.id)}>{text('memberResend', { email: invitation.email })}</SarakButton>}
                                        {onRevokeInvitation && <SarakButton type="button" size="sm" variant="outline" onClick={() => onRevokeInvitation(invitation.id)}>{text('memberRevoke', { email: invitation.email })}</SarakButton>}
                                    </SarakFlex>
                                </SarakFlex>
                            </li>
                        ))}
                    </ul>
                </section>
            )}
        </div>
    );
};
