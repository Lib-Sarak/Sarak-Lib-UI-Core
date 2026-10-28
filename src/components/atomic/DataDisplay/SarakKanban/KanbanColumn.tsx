/**
 * Coluna do SarakKanban: cabeçalho (com o menu de renomear/excluir), lista ordenável de
 * cartões e o campo de criação rápida no rodapé. Cada controle só existe se o evento
 * correspondente foi passado ("sem o evento, sem o controle").
 */

import React, { useState } from 'react';
import { SarakButton } from '../../Buttons/SarakButton';
import { SarakIconButton } from '../../Buttons/SarakIconButton';
import { SarakIcon } from '../../Icon/SarakIcon';
import { SarakContextMenu } from '../../UX/SarakContextMenu';
import type { SarakContextMenuPosition } from '../../UX/SarakContextMenu';
import { SarakValue } from '../../Atoms/SarakValue';
import { useLibraryText } from '../../../../core/i18n/useLibraryText';
import type { SarakValueFormat } from '../../../../shared/format';
import { KanbanAddForm } from './KanbanAddForm';
import { KanbanCard } from './KanbanCard';
import { KANBAN_COLUMN_CLASS } from './kanbanLayout';
import { KanbanSortableList, useKanbanColumnDrop } from './useKanbanDrag';
import { sarakColumnTotal } from './kanbanModel';
import type { SarakKanbanCard, SarakKanbanColumn } from './kanbanTypes';

export interface KanbanColumnHandlers<C extends SarakKanbanCard> {
    renderCard?: (card: C, columnId: string) => React.ReactNode;
    onCardClick?: (card: C, columnId: string) => void;
    onCardAdd?: (columnId: string, title: string) => void;
    onColumnRename?: (id: string, title: string) => void;
    onColumnDelete?: (id: string) => void;
    valueFormat?: SarakValueFormat;
    columnTotal?: boolean | ((column: SarakKanbanColumn<C>) => React.ReactNode);
}

function ColumnTotal<C extends SarakKanbanCard>({ column, columnTotal, valueFormat }: {
    column: SarakKanbanColumn<C>;
    columnTotal: KanbanColumnHandlers<C>['columnTotal'];
    valueFormat?: SarakValueFormat;
}) {
    if (typeof columnTotal === 'function') return <span data-kanban-column-total="true">{columnTotal(column)}</span>;
    const total = sarakColumnTotal(column.cards);
    if (columnTotal === false || total === null) return null;
    return (
        <span data-kanban-column-total="true">
            <SarakValue value={total} format={valueFormat} size="sm" signColor={false} />
        </span>
    );
}

function ColumnMenu({ column, onRename, onDelete }: {
    column: { id: string; title: string };
    onRename?: (id: string, title: string) => void;
    onDelete?: (id: string) => void;
}) {
    const text = useLibraryText();
    const [position, setPosition] = useState<SarakContextMenuPosition | null>(null);
    const [renaming, setRenaming] = useState(false);
    const close = () => setPosition(null);

    if (renaming) {
        return (
            <KanbanAddForm
                formKind="column"
                placeholder={text('kanbanColumnRename')}
                submitLabel={text('kanbanColumnRename')}
                onSubmit={(title) => { onRename?.(column.id, title); setRenaming(false); }}
            />
        );
    }
    return (
        <>
            <SarakIconButton
                variant="ghost"
                size="xs"
                icon={<SarakIcon name="MoreHorizontal" />}
                aria-label={text('kanbanColumnMenu', { column: column.title })}
                aria-haspopup="menu"
                onClick={(event) => setPosition({ x: event.clientX, y: event.clientY })}
            />
            <SarakContextMenu isOpen={position !== null} position={position ?? { x: 0, y: 0 }} onClose={close}>
                {onRename && (
                    <SarakButton variant="ghost" size="sm" fullWidth role="menuitem" onClick={() => { close(); setRenaming(true); }}>
                        {text('kanbanColumnRename')}
                    </SarakButton>
                )}
                {onDelete && (
                    <SarakButton variant="ghost" size="sm" fullWidth role="menuitem" onClick={() => { close(); onDelete(column.id); }}>
                        {text('kanbanColumnDelete')}
                    </SarakButton>
                )}
            </SarakContextMenu>
        </>
    );
}

export function KanbanColumn<C extends SarakKanbanCard>({ column, ...handlers }: { column: SarakKanbanColumn<C> } & KanbanColumnHandlers<C>) {
    const text = useLibraryText();
    const { setNodeRef, isOver } = useKanbanColumnDrop(column.id);
    const hasMenu = Boolean(handlers.onColumnRename || handlers.onColumnDelete);

    return (
        <section
            ref={setNodeRef}
            data-column-id={column.id}
            aria-label={column.title}
            className={KANBAN_COLUMN_CLASS}
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--sarak-layout-gap-sm, 8px)',
                padding: 'var(--sarak-layout-gap-sm, 8px)',
                borderRadius: 'var(--sarak-card-radius, 10px)',
                background: 'var(--color-theme-card, var(--sarak-surface-color, transparent))',
                border: `var(--sarak-border-width, 1px) solid ${isOver ? 'var(--sarak-primary-color, currentColor)' : 'var(--border-color, currentColor)'}`,
                transition: 'border-color var(--duration-fast, 0.2s)',
            }}
        >
            <header
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 'var(--sarak-layout-gap-sm, 8px)',
                    padding: 'var(--sarak-kanban-header-padding-y, 4px) var(--sarak-layout-gap-sm, 8px)',
                    fontWeight: 'var(--sarak-body-weight, 400)',
                    fontSize: 'var(--sarak-type-scale-caption, 12px)',
                    textTransform: 'uppercase',
                    letterSpacing: 'var(--sarak-kanban-header-tracking, 0.04em)',
                    color: 'var(--theme-title, var(--sarak-title-color, inherit))',
                }}
            >
                <span>{column.title}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--sarak-layout-gap-sm, 8px)', color: 'var(--sarak-text-muted, inherit)' }}>
                    <ColumnTotal column={column} columnTotal={handlers.columnTotal} valueFormat={handlers.valueFormat} />
                    {column.cards.length}
                    {hasMenu && <ColumnMenu column={column} onRename={handlers.onColumnRename} onDelete={handlers.onColumnDelete} />}
                </span>
            </header>

            <KanbanSortableList ids={column.cards.map((card) => card.id)}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sarak-layout-gap-sm, 8px)', minHeight: 'var(--sarak-layout-gap-lg, 24px)' }}>
                    {column.cards.length === 0 && (
                        <span style={{ color: 'var(--sarak-text-muted, inherit)', fontSize: 'var(--sarak-type-scale-caption, 12px)' }}>
                            {text('kanbanEmptyColumn')}
                        </span>
                    )}
                    {column.cards.map((card) => (
                        <KanbanCard key={card.id} card={card} columnId={column.id} renderCard={handlers.renderCard} onCardClick={handlers.onCardClick} valueFormat={handlers.valueFormat} />
                    ))}
                </div>
            </KanbanSortableList>

            {handlers.onCardAdd && (
                <KanbanAddForm
                    formKind="card"
                    placeholder={text('kanbanCardAddPlaceholder')}
                    submitLabel={text('kanbanCardAddSubmit')}
                    onSubmit={(title) => handlers.onCardAdd?.(column.id, title)}
                />
            )}
        </section>
    );
}

export default KanbanColumn;
