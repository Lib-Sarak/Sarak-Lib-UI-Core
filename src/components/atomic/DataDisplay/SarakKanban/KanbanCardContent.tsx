/**
 * Conteúdo padrão do cartão do SarakKanban: código, título, descrição, avatar, prioridade,
 * prazo e contador de subtarefas. Cada campo só aparece se vier preenchido; a prioridade
 * média é o padrão silencioso e não aparece.
 */

import React from 'react';
import { SarakAvatar } from '../../Atoms/SarakAvatar';
import { SarakBadge } from '../../Feedback/SarakBadge';
import type { SarakBadgeVariant } from '../../Feedback/SarakBadge';
import { useSarakUIOptional } from '../../../../core/Provider/SarakUIProvider';
import { resolveLibraryLanguage, useLibraryText } from '../../../../core/i18n/useLibraryText';
import type { LibraryTextKey } from '../../../../core/i18n/catalog';
import { sarakIsOverdue, sarakParseDueDate } from './kanbanModel';
import type { SarakKanbanCard, SarakKanbanPriority } from './kanbanTypes';

const PRIORITY_BADGE: Record<Exclude<SarakKanbanPriority, 'medium'>, { variant: SarakBadgeVariant; label: LibraryTextKey }> = {
    low: { variant: 'muted', label: 'kanbanPriorityLow' },
    high: { variant: 'warning', label: 'kanbanPriorityHigh' },
    urgent: { variant: 'danger', label: 'kanbanPriorityUrgent' },
};

const mutedText: React.CSSProperties = {
    color: 'var(--sarak-text-muted, var(--text-muted, inherit))',
    fontSize: 'var(--sarak-type-scale-caption, 12px)',
};

const row: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 'var(--sarak-layout-gap-sm, 8px)',
};

function useDueLabel(dueDate: string | undefined) {
    const text = useLibraryText();
    const language = resolveLibraryLanguage(useSarakUIOptional()?.design?.language);
    const parsed = dueDate ? sarakParseDueDate(dueDate) : null;
    if (!dueDate || !parsed) return null;
    const date = parsed.toLocaleDateString(language, { day: '2-digit', month: 'short' });
    const overdue = sarakIsOverdue(dueDate);
    return { overdue, label: text(overdue ? 'kanbanDueOverdue' : 'kanbanDue', { date }) };
}

export function KanbanCardContent({ card }: { card: SarakKanbanCard }) {
    const text = useLibraryText();
    const due = useDueLabel(card.dueDate);
    const priority = card.priority && card.priority !== 'medium' ? PRIORITY_BADGE[card.priority] : null;
    const { assignee, subtasks } = card;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sarak-layout-gap-sm, 8px)' }}>
            {card.code && <span style={mutedText}>{card.code}</span>}
            <div
                style={{
                    fontSize: 'calc(var(--sarak-type-scale-caption, 12px) * 1.15)',
                    fontWeight: 'var(--sarak-body-weight, 400)',
                    color: 'var(--sarak-text-main, var(--color-theme-title, inherit))',
                }}
            >
                {card.title ?? card.id}
            </div>
            {card.description && <div style={mutedText}>{card.description}</div>}
            {(priority || due || subtasks || assignee) && (
                <div style={{ ...row, justifyContent: 'space-between' }}>
                    <div style={row}>
                        {priority && <SarakBadge size="sm" pill variant={priority.variant}>{text(priority.label)}</SarakBadge>}
                        {due && (
                            <span
                                data-overdue={due.overdue ? 'true' : undefined}
                                style={due.overdue ? { ...mutedText, color: 'var(--sarak-status-error-color, var(--theme-error, currentColor))' } : mutedText}
                            >
                                {due.label}
                            </span>
                        )}
                        {subtasks && subtasks.total > 0 && (
                            <span style={mutedText} aria-label={text('kanbanSubtasks', { done: subtasks.done, total: subtasks.total })}>
                                {subtasks.done}/{subtasks.total}
                            </span>
                        )}
                    </div>
                    {assignee && <SarakAvatar size="xs" name={assignee.name} src={assignee.avatarUrl} />}
                </div>
            )}
        </div>
    );
}

export default KanbanCardContent;
