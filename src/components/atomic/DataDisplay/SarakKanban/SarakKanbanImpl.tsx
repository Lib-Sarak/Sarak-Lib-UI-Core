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
import { hasKanbanDragPeers, useKanbanDrag } from './useKanbanDrag';
import { useLibraryText } from '../../../../core/i18n/useLibraryText';
import { SarakOptionalPeerFallback } from '../../Feedback/SarakOptionalPeerFallback';
import type { SarakValueFormat } from '../../../../shared/format';
import type { SarakCardMove, SarakKanbanCard, SarakKanbanColumn } from './kanbanTypes';

const OPTIONAL_PEERS = ['@dnd-kit/core', '@dnd-kit/sortable'] as const;

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
    /** Formato do `value` dos cartões e da soma das colunas; omitido, o número aparece cru. */
    valueFormat?: SarakValueFormat;
    /** Soma no cabeçalho da coluna: `true`/omitido mostra a soma dos `value` só se algum cartão tiver; `false` esconde; função devolve o conteúdo. */
    columnTotal?: boolean | ((column: SarakKanbanColumn<C>) => React.ReactNode);
    className?: string;
}

function SarakKanbanContent<C extends SarakKanbanCard>({
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
                activeCard && activeColumn ? <KanbanCardShell card={activeCard} columnId={activeColumn.id} renderCard={renderCard} valueFormat={columnHandlers.valueFormat} /> : null,
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

function SarakKanbanImpl<C extends SarakKanbanCard>(props: SarakKanbanProps<C>): React.ReactElement {
    if (!hasKanbanDragPeers()) {
        return <SarakOptionalPeerFallback component="SarakKanban" packages={OPTIONAL_PEERS} />;
    }
    return <SarakKanbanContent {...props} />;
}

export default SarakKanbanImpl;
