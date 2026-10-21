/**
 * Cartão do SarakKanban: casca ordenável (arrasto por mouse, toque e teclado) em volta do
 * conteúdo padrão — ou do `renderCard` do consumidor, que vence o padrão. `KanbanCardShell`
 * é a mesma casca sem arrasto, usada no cartão flutuante.
 */

import React from 'react';
import { KanbanCardContent } from './KanbanCardContent';
import { useKanbanCardDrag } from './useKanbanDrag';
import type { SarakKanbanCard } from './kanbanTypes';

export interface KanbanCardProps<C extends SarakKanbanCard> {
    card: C;
    columnId: string;
    renderCard?: (card: C, columnId: string) => React.ReactNode;
    onCardClick?: (card: C, columnId: string) => void;
}

const shellStyle = (clickable: boolean, isDragging: boolean): React.CSSProperties => ({
    padding: 'var(--sarak-layout-gap-sm, 8px) var(--sarak-layout-gap-md, 16px)',
    borderRadius: 'var(--sarak-kanban-card-radius, var(--sarak-card-radius, 10px))',
    background: 'var(--color-theme-card, var(--sarak-surface-color, transparent))',
    border: 'var(--sarak-border-width, 1px) solid var(--border-color, currentColor)',
    cursor: clickable ? 'pointer' : 'grab',
    opacity: isDragging ? 0.4 : 1,
    outlineOffset: 'var(--sarak-border-width, 1px)',
});

export function KanbanCardShell<C extends SarakKanbanCard>({
    card,
    columnId,
    renderCard,
}: Pick<KanbanCardProps<C>, 'card' | 'columnId' | 'renderCard'>) {
    return (
        <article data-kanban-overlay="true" style={{ ...shellStyle(false, false), cursor: 'grabbing' }}>
            {renderCard ? renderCard(card, columnId) : <KanbanCardContent card={card} />}
        </article>
    );
}

export function KanbanCard<C extends SarakKanbanCard>({ card, columnId, renderCard, onCardClick }: KanbanCardProps<C>) {
    const drag = useKanbanCardDrag(card.id);
    const { onKeyDown: dragKeyDown, ...dragListeners } = drag.listeners ?? {};

    // O teclado levanta com Espaço; Enter abre o cartão.
    const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
        dragKeyDown?.(event);
        if (event.key === 'Enter' && onCardClick && !drag.isDragging) onCardClick(card, columnId);
    };

    return (
        <article
            ref={drag.setNodeRef}
            data-card-id={card.id}
            {...drag.attributes}
            {...dragListeners}
            onKeyDown={handleKeyDown}
            onClick={onCardClick ? () => onCardClick(card, columnId) : undefined}
            style={{ ...shellStyle(Boolean(onCardClick), drag.isDragging), ...drag.style }}
        >
            {renderCard ? renderCard(card, columnId) : <KanbanCardContent card={card} />}
        </article>
    );
}

export default KanbanCard;
