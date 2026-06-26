/**
 * SarakKanban — quadro de colunas com drag-and-drop (Spec 12, Regra 3 · Onda 10)
 *
 * DnD via API HTML5 NATIVA (`draggable` + `onDragOver`/`onDrop`) — **zero dependência
 * nova**. No `drop`, o modelo local é atualizado IMEDIATAMENTE (o card salta de coluna sem
 * recarregar — Critério de Aceite) e o `onCardMove` é emitido com origem→destino. Zero
 * Hardcode: superfícies, bordas e o realce de drag-over saem de tokens `var(--sx-*)`.
 */

import React, { useEffect, useState } from 'react';
import { KanbanCard, KanbanColumn, CardMove, moveCard } from './kanbanModel';

export interface SarakKanbanProps<C extends KanbanCard = KanbanCard> {
    /** Colunas e seus cards (a ordem do array é a ordem visual). */
    columns: Array<KanbanColumn<C>>;
    /** Disparado ao soltar um card numa coluna (origem → destino). */
    onCardMove?: (move: CardMove) => void;
    /** Render customizado do card (default: título + descrição). */
    renderCard?: (card: C, columnId: string) => React.ReactNode;
    className?: string;
}

/** Interação de DnD: card sendo arrastado + coluna sob o cursor (um só estado p/ enxugar). */
interface DragState {
    drag: { cardId: string; fromColumn: string } | null;
    over: string | null;
}

const IDLE: DragState = { drag: null, over: null };

function SarakKanbanImpl<C extends KanbanCard>({
    columns,
    onCardMove,
    renderCard,
    className,
}: SarakKanbanProps<C>) {
    // Espelho local para mover o card no ato do drop (sem esperar o consumidor).
    const [board, setBoard] = useState<Array<KanbanColumn<C>>>(columns);
    const [io, setIo] = useState<DragState>(IDLE);

    // Ressincroniza quando o consumidor troca as colunas (fonte de verdade externa).
    useEffect(() => setBoard(columns), [columns]);

    const handleDrop = (toColumn: string) => {
        const { drag } = io;
        setIo(IDLE);
        if (!drag) return;
        const target = board.find((col) => col.id === toColumn);
        const toIndex = target ? target.cards.length : 0;
        setBoard((prev) => moveCard(prev, drag.cardId, drag.fromColumn, toColumn, toIndex));
        if (drag.fromColumn !== toColumn) {
            onCardMove?.({ cardId: drag.cardId, fromColumn: drag.fromColumn, toColumn, toIndex });
        }
    };

    return (
        <div
            data-sarak-kanban="true"
            className={className}
            style={{ display: 'flex', gap: 'var(--sx-spacing-md, 16px)', alignItems: 'flex-start', overflowX: 'auto' }}
        >
            {board.map((column) => {
                const isOver = io.over === column.id;
                return (
                    <section
                        key={column.id}
                        data-column-id={column.id}
                        aria-label={column.title}
                        onDragOver={(e) => { e.preventDefault(); setIo((s) => ({ ...s, over: column.id })); }}
                        onDragLeave={() => setIo((s) => (s.over === column.id ? { ...s, over: null } : s))}
                        onDrop={() => handleDrop(column.id)}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 'var(--sx-spacing-sm, 8px)',
                            minWidth: 260,
                            padding: 'var(--sx-spacing-sm, 8px)',
                            borderRadius: 'var(--sx-radius-md, 12px)',
                            background: 'var(--sx-color-surface-base)',
                            border: `1px solid ${isOver ? 'var(--sx-color-primary-base)' : 'var(--sx-color-border-base)'}`,
                            transition: 'border-color 120ms',
                        }}
                    >
                        <header
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '4px 8px',
                                fontWeight: 600,
                                fontSize: 13,
                                textTransform: 'uppercase',
                                letterSpacing: '0.04em',
                                color: 'var(--sx-color-text-title)',
                            }}
                        >
                            <span>{column.title}</span>
                            <span style={{ color: 'var(--sx-color-text-muted)' }}>{column.cards.length}</span>
                        </header>

                        {column.cards.map((card) => (
                            <article
                                key={card.id}
                                draggable
                                data-card-id={card.id}
                                onDragStart={() => setIo((s) => ({ ...s, drag: { cardId: card.id, fromColumn: column.id } }))}
                                onDragEnd={() => setIo(IDLE)}
                                style={{
                                    padding: 'var(--sx-spacing-sm, 8px) var(--sx-spacing-md, 12px)',
                                    borderRadius: 'var(--sx-radius-sm, 8px)',
                                    background: 'var(--sx-color-surface-raised, var(--sx-color-surface-base))',
                                    border: '1px solid var(--sx-color-border-base)',
                                    cursor: 'grab',
                                    opacity: io.drag?.cardId === card.id ? 0.5 : 1,
                                }}
                            >
                                {renderCard ? renderCard(card, column.id) : (
                                    <div>
                                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--sx-color-text-title)' }}>
                                            {card.title ?? card.id}
                                        </div>
                                        {card.description && (
                                            <div style={{ fontSize: 12, color: 'var(--sx-color-text-muted)', marginTop: 2 }}>
                                                {card.description}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </article>
                        ))}
                    </section>
                );
            })}
        </div>
    );
}

export default SarakKanbanImpl;
