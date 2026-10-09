/**
 * SarakKanban — quadro de colunas que arrasta entre e DENTRO das colunas, por mouse, toque e
 * teclado. A biblioteca de arrastar vive atrás de `useKanbanDrag`; aqui só se monta o
 * quadro. O modelo local move o cartão no ato da soltura (sem esperar o consumidor) e o
 * `onCardMove` leva índices e vizinhos finais. Medidas, superfícies e bordas saem de tokens.
 */

import React from 'react';
import { KanbanAddForm } from './KanbanAddForm';
import { KanbanCardShell } from './KanbanCard';
import { KanbanColumn } from './KanbanColumn';
import { KANBAN_BOARD_CLASS, KANBAN_COLUMN_CLASS } from './kanbanLayout';
import { useKanbanDrag } from './useKanbanDrag';
import { useLibraryText } from '../../../../core/i18n/useLibraryText';
import type { SarakCardMove, SarakKanbanCard, SarakKanbanColumn } from './kanbanTypes';

export interface SarakKanbanProps<C extends SarakKanbanCard = SarakKanbanCard> {
    /** Colunas e seus cards (a ordem do array é a ordem visual). */
    columns: Array<SarakKanbanColumn<C>>;
    /** Disparado ao soltar um card em outro lugar: coluna e índice de origem e destino, mais os vizinhos finais. Soltar no mesmo lugar não dispara. */
    onCardMove?: (move: SarakCardMove) => void;
    /** Render customizado do card (default: o cartão padrão com código, título, avatar, prioridade, prazo e subtarefas). */
    renderCard?: (card: C, columnId: string) => React.ReactNode;
    /** Ao clicar (ou Enter) num card. Omitido, o card não é clicável. */
    onCardClick?: (card: C, columnId: string) => void;
    /** Criação rápida no rodapé da coluna. Omitido, o campo não aparece. */
    onCardAdd?: (columnId: string, title: string) => void;
    /** Nova coluna, ao fim do quadro. Omitido, o campo não aparece. */
    onColumnAdd?: (title: string) => void;
    /** Renomear coluna pelo menu dela. Omitido, o item não aparece. */
    onColumnRename?: (id: string, title: string) => void;
    /** Excluir coluna pelo menu dela. Omitido, o item não aparece. */
    onColumnDelete?: (id: string) => void;
    className?: string;
}

function SarakKanbanImpl<C extends SarakKanbanCard>({
    columns,
    onCardMove,
    renderCard,
    onColumnAdd,
    className,
    ...columnHandlers
}: SarakKanbanProps<C>) {
    const text = useLibraryText();
    const { board, activeCard, root } = useKanbanDrag(columns, onCardMove);
    const activeColumn = activeCard ? board.find((col) => col.cards.some((c) => c.id === activeCard.id)) : undefined;

    return (
        <div
            data-sarak-kanban="true"
            className={`${KANBAN_BOARD_CLASS} ${className ?? ''}`.trim()}
            style={{ display: 'flex', gap: 'var(--sarak-layout-gap-md, 16px)', alignItems: 'flex-start', overflowX: 'auto' }}
        >
            {root(
                <>
                    {board.map((column) => (
                        <KanbanColumn key={column.id} column={column} renderCard={renderCard} {...columnHandlers} />
                    ))}
                </>,
                activeCard && activeColumn ? <KanbanCardShell card={activeCard} columnId={activeColumn.id} renderCard={renderCard} /> : null,
            )}
            {onColumnAdd && (
                <div className={KANBAN_COLUMN_CLASS}>
                    <KanbanAddForm
                        formKind="column"
                        placeholder={text('kanbanColumnAddPlaceholder')}
                        submitLabel={text('kanbanColumnAddSubmit')}
                        onSubmit={onColumnAdd}
                    />
                </div>
            )}
        </div>
    );
}

export default SarakKanbanImpl;
