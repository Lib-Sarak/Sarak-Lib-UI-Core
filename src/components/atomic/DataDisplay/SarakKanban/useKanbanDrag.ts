/**
 * Adaptador de arrastar e soltar do SarakKanban — o ÚNICO arquivo que conhece o `@dnd-kit`.
 *
 * Trocar de biblioteca é reescrever este arquivo: o resto do quadro só vê o que ele expõe
 * (o estado do quadro, o cartão ativo, a raiz de arrasto, a lista que recebe cartões, o
 * gancho do cartão e o da coluna). O destino do cartão é o ÍNDICE onde foi solto, e os
 * anúncios de leitor de tela saem do catálogo de i18n.
 */

import { createElement, useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import {
    DndContext,
    DragOverlay,
    KeyboardSensor,
    MouseSensor,
    TouchSensor,
    closestCorners,
    useDroppable,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import type { Announcements, DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useLibraryText } from '../../../../core/i18n/useLibraryText';
import { sarakApplyDrop, sarakDescribeMove, sarakLocateCard, sarakPreviewOver } from './kanbanModel';
import type { SarakCardMove, SarakKanbanCard, SarakKanbanColumn } from './kanbanTypes';

/** Mouse: o arrasto só começa após esta distância, para não brigar com o clique. */
const MOUSE_ACTIVATION_DISTANCE = 4;
/** Toque: pressão longa; antes dela o dedo rola a página normalmente. */
const TOUCH_ACTIVATION_DELAY_MS = 250;
const TOUCH_ACTIVATION_TOLERANCE = 5;
/** Fração da borda do contêiner em que a rolagem automática começa. */
const AUTO_SCROLL_EDGE = 0.1;
/** Enter fica livre para abrir o cartão: o teclado levanta e solta só com Espaço. */
const KEYBOARD_CODES = { start: ['Space'], cancel: ['Escape'], end: ['Space'] };

type Board<C extends SarakKanbanCard> = Array<SarakKanbanColumn<C>>;

export interface KanbanDrag<C extends SarakKanbanCard> {
    board: Board<C>;
    activeCard: C | null;
    /** Envolve o quadro: sensores, colisão, rolagem de borda, anúncios e o cartão flutuante. */
    root: (children: ReactNode, overlay: ReactNode) => ReactNode;
}

const isBelowMidline = (event: DragOverEvent): boolean => {
    const dragged = event.active.rect.current.translated;
    const over = event.over?.rect;
    return Boolean(dragged && over && dragged.top > over.top + over.height / 2);
};

export function useKanbanDrag<C extends SarakKanbanCard>(
    columns: Board<C>,
    onCardMove?: (move: SarakCardMove) => void,
): KanbanDrag<C> {
    const text = useLibraryText();
    const [board, setBoard] = useState<Board<C>>(columns);
    const [activeId, setActiveId] = useState<string | null>(null);
    // Quadro de antes do arrasto: base do evento final e do cancelamento.
    const origin = useRef<Board<C> | null>(null);

    // Fonte de verdade externa; durante o arrasto o espelho local manda.
    useEffect(() => {
        if (!origin.current) setBoard(columns);
    }, [columns]);

    const sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint: { distance: MOUSE_ACTIVATION_DISTANCE } }),
        useSensor(TouchSensor, { activationConstraint: { delay: TOUCH_ACTIVATION_DELAY_MS, tolerance: TOUCH_ACTIVATION_TOLERANCE } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates, keyboardCodes: KEYBOARD_CODES }),
    );

    const finish = useCallback(() => {
        origin.current = null;
        setActiveId(null);
    }, []);

    const onDragStart = (event: DragStartEvent) => {
        origin.current = board;
        setActiveId(String(event.active.id));
    };

    const onDragOver = (event: DragOverEvent) => {
        if (!event.over) return;
        const [active, over, after] = [String(event.active.id), String(event.over.id), isBelowMidline(event)];
        setBoard((prev) => sarakPreviewOver(prev, active, over, after));
    };

    const onDragEnd = (event: DragEndEvent) => {
        const before = origin.current ?? board;
        const id = String(event.active.id);
        const final = event.over ? sarakApplyDrop(board, id, String(event.over.id)) : before;
        setBoard(final);
        finish();
        const move = sarakDescribeMove(before, final, id);
        if (move) onCardMove?.(move);
    };

    const onDragCancel = () => {
        if (origin.current) setBoard(origin.current);
        finish();
    };

    // Posição anunciada: a do cartão-alvo quando o ativo está sobre um cartão (a reordenação
    // dentro da coluna só entra no quadro ao soltar), senão a do próprio ativo.
    const describe = (activeCardId: string | number, overId?: string | number) => {
        const active = String(activeCardId);
        const overCard = overId === undefined ? null : sarakLocateCard(board, String(overId));
        const where = overCard ?? sarakLocateCard(board, active);
        const column = board.find((col) => col.id === where?.columnId)
            ?? board.find((col) => col.id === String(overId));
        const card = board.flatMap((col) => col.cards).find((c) => c.id === active);
        return {
            card: card?.title ?? active,
            column: column?.title ?? '',
            position: (where?.index ?? column?.cards.length ?? 0) + 1,
            total: column?.cards.length ?? 0,
        };
    };

    const announcements: Announcements = {
        onDragStart: ({ active }) => text('kanbanAnnounceLift', describe(active.id)),
        onDragOver: ({ active, over }) =>
            over ? text('kanbanAnnounceOver', describe(active.id, over.id)) : undefined,
        onDragEnd: ({ active, over }) => text('kanbanAnnounceDrop', describe(active.id, over?.id)),
        onDragCancel: ({ active }) => text('kanbanAnnounceCancel', describe(active.id)),
    };

    const activeCard = activeId ? board.flatMap((col) => col.cards).find((c) => c.id === activeId) ?? null : null;

    const root = (children: ReactNode, overlay: ReactNode) =>
        createElement(
            DndContext,
            {
                sensors,
                collisionDetection: closestCorners,
                autoScroll: { threshold: { x: AUTO_SCROLL_EDGE, y: AUTO_SCROLL_EDGE } },
                accessibility: { announcements, screenReaderInstructions: { draggable: text('kanbanInstructions') } },
                onDragStart,
                onDragOver,
                onDragEnd,
                onDragCancel,
            },
            children,
            createElement(DragOverlay, null, overlay),
        );

    return { board, activeCard, root };
}

/** Lista de uma coluna: os cartões dela se ordenam entre si e aceitam o que vem de fora. */
export const KanbanSortableList = (props: { ids: string[]; children: ReactNode }) =>
    createElement(SortableContext, { items: props.ids, strategy: verticalListSortingStrategy, children: props.children });

/** Coluna como alvo de soltura (inclusive vazia). */
export function useKanbanColumnDrop(columnId: string) {
    const { setNodeRef, isOver } = useDroppable({ id: columnId });
    return { setNodeRef, isOver };
}

/** Cartão ordenável: refs, atributos de acessibilidade, ouvintes de ponteiro/toque/teclado e o deslocamento. */
export function useKanbanCardDrag(cardId: string) {
    const sortable = useSortable({ id: cardId });
    const { transform, transition } = sortable;
    const style: CSSProperties = {
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        transition,
    };
    return {
        setNodeRef: sortable.setNodeRef,
        attributes: sortable.attributes,
        listeners: sortable.listeners,
        isDragging: sortable.isDragging,
        style,
    };
}
