/**
 * SarakDataTable — grid colunar avançado (Spec 12, Regra 2 · Onda 9)
 *
 * Camada POR CIMA da virtualização: reusa o motor de windowing (`@tanstack/react-virtual`,
 * a mesma peer da primitiva headless `SarakDataGrid`) num ÚNICO contêiner de scroll, o
 * que permite — de forma nativa, sem sincronização imperativa — cabeçalho sticky no topo
 * e colunas congeladas (pinned) que mantêm o alinhamento ao rolar X/Y (Critério de Aceite).
 *
 * Entrega as três funções avançadas da Regra 2: pinned (sticky left/right), resize
 * (handle pointer-driven) e reorder (drag-and-drop nativo HTML5). Zero Hardcode: cores e
 * superfícies via `[--sarak-*]` / tokens de tabela (`--sarak-table-*`). Zero dependência nova.
 */

import React, { useMemo, useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
    SarakColumn,
    MIN_COLUMN_WIDTH,
    computeOffsets,
    reorder,
    widthOf,
} from './columnModel';

export interface SarakDataTableProps<T = Record<string, unknown>> {
    /** Definição declarativa das colunas (ordem inicial = ordem do array). */
    columns: Array<SarakColumn<T>>;
    /** Linhas de dados; a fonte real (fetch) vive fora — aqui só virtualizamos. */
    rows: T[];
    /** Altura de cada linha em px (default: 44). */
    rowHeight?: number;
    /** Altura do cabeçalho em px (default: 44). */
    headerHeight?: number;
    /** Altura da janela de scroll (default: 100% do contêiner pai). */
    height?: number | string;
    /** Linhas extra montadas fora da viewport (default: 8). */
    overscan?: number;
    /** Chave estável da linha (default: índice). */
    getRowKey?: (row: T, index: number) => React.Key;
    /** Notifica nova largura ao soltar o handle de resize. */
    onColumnResize?: (columnId: string, width: number) => void;
    /** Notifica reordenação (origem → destino) ao soltar o drag do cabeçalho. */
    onColumnReorder?: (fromId: string, toId: string) => void;
    className?: string;
}

/** Estilo sticky de uma célula congelada (compartilhado por cabeçalho e corpo). */
const pinnedStyle = <T,>(
    column: SarakColumn<T>,
    offsets: ReturnType<typeof computeOffsets>,
    bg: string,
): React.CSSProperties => {
    if (column.pinned === 'left') {
        return { position: 'sticky', left: offsets.left[column.id], zIndex: 2, background: bg };
    }
    if (column.pinned === 'right') {
        return { position: 'sticky', right: offsets.right[column.id], zIndex: 2, background: bg };
    }
    return {};
};

function SarakDataTableImpl<T>({
    columns,
    rows,
    rowHeight = 44,
    headerHeight = 44,
    height = '100%',
    overscan = 8,
    getRowKey,
    onColumnResize,
    onColumnReorder,
    className,
}: SarakDataTableProps<T>) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [widths, setWidths] = useState<Record<string, number>>({});
    const [order, setOrder] = useState<string[]>(() => columns.map((c) => c.id));
    const [dragId, setDragId] = useState<string | null>(null);

    const byId = useMemo(() => new Map(columns.map((c) => [c.id, c])), [columns]);
    const ordered = useMemo(
        () => order.map((id) => byId.get(id)).filter((c): c is SarakColumn<T> => Boolean(c)),
        [order, byId],
    );
    const offsets = useMemo(() => computeOffsets(ordered, widths), [ordered, widths]);

    const virtualizer = useVirtualizer({
        count: rows.length,
        getScrollElement: () => scrollRef.current,
        estimateSize: () => rowHeight,
        overscan,
    });

    // --- Resize: pointer capture na divisória direita do cabeçalho. ---
    const startResize = (event: React.PointerEvent, column: SarakColumn<T>) => {
        event.preventDefault();
        event.stopPropagation();
        const startX = event.clientX;
        const startW = widthOf(column, widths);
        const floor = column.minWidth ?? MIN_COLUMN_WIDTH;
        const onMove = (move: PointerEvent) => {
            const next = Math.max(floor, startW + (move.clientX - startX));
            setWidths((prev) => ({ ...prev, [column.id]: next }));
        };
        const onUp = (up: PointerEvent) => {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
            onColumnResize?.(column.id, Math.max(floor, startW + (up.clientX - startX)));
        };
        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
    };

    // --- Reorder: drag-and-drop nativo entre cabeçalhos. ---
    const onDrop = (toId: string) => {
        if (dragId && dragId !== toId) {
            setOrder((prev) => reorder(prev, dragId, toId));
            onColumnReorder?.(dragId, toId);
        }
        setDragId(null);
    };

    const headerBg = 'var(--sarak-table-header-bg, var(--color-theme-card,#1e293b))';
    const cellBg = 'var(--color-theme-card,#1e293b)';

    return (
        <div
            ref={scrollRef}
            data-sarak-datatable="true"
            role="table"
            className={className}
            style={{ height, overflow: 'auto', position: 'relative' }}
        >
            <div style={{ width: offsets.total, position: 'relative', height: headerHeight + virtualizer.getTotalSize() }}>
                {/* Cabeçalho sticky (topo). */}
                <div
                    role="row"
                    style={{
                        position: 'sticky',
                        top: 0,
                        zIndex: 3,
                        display: 'flex',
                        height: headerHeight,
                        background: headerBg,
                        borderBottom: '1px solid var(--sarak-table-border, var(--border-color,#334155))',
                    }}
                >
                    {ordered.map((column) => (
                        <div
                            key={column.id}
                            role="columnheader"
                            draggable
                            onDragStart={() => setDragId(column.id)}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={() => onDrop(column.id)}
                            data-column-id={column.id}
                            data-pinned={column.pinned ?? undefined}
                            style={{
                                width: widthOf(column, widths),
                                flex: '0 0 auto',
                                display: 'flex',
                                alignItems: 'center',
                                padding: '0 var(--sarak-table-padding, var(--sarak-layout-gap-sm,8px, 12px))',
                                fontWeight: 600,
                                color: 'var(--color-theme-title,#ffffff)',
                                cursor: 'grab',
                                userSelect: 'none',
                                opacity: dragId === column.id ? 0.5 : 1,
                                ...pinnedStyle(column, offsets, headerBg),
                            }}
                        >
                            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {column.header}
                            </span>
                            <span
                                role="separator"
                                aria-orientation="vertical"
                                aria-label={`Redimensionar coluna ${column.id}`}
                                data-resize-handle={column.id}
                                onPointerDown={(e) => startResize(e, column)}
                                onDragStart={(e) => e.preventDefault()}
                                style={{ width: 6, cursor: 'col-resize', alignSelf: 'stretch', flex: '0 0 auto' }}
                            />
                        </div>
                    ))}
                </div>

                {/* Corpo virtualizado — posicionado por `top` (sem transform) para não
                    quebrar o `position: sticky` horizontal das colunas congeladas. */}
                {virtualizer.getVirtualItems().map((virtualRow) => {
                    const row = rows[virtualRow.index];
                    return (
                        <div
                            key={getRowKey ? getRowKey(row, virtualRow.index) : virtualRow.key}
                            role="row"
                            data-index={virtualRow.index}
                            style={{
                                position: 'absolute',
                                top: headerHeight + virtualRow.start,
                                left: 0,
                                display: 'flex',
                                width: offsets.total,
                                height: rowHeight,
                                borderBottom: '1px solid var(--sarak-table-border, var(--border-color,#334155))',
                            }}
                        >
                            {ordered.map((column) => (
                                <div
                                    key={column.id}
                                    role="cell"
                                    data-column-id={column.id}
                                    style={{
                                        width: widthOf(column, widths),
                                        flex: '0 0 auto',
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '0 var(--sarak-table-padding, var(--sarak-layout-gap-sm,8px, 12px))',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        color: 'var(--sarak-text-main,#ffffff)',
                                        ...pinnedStyle(column, offsets, cellBg),
                                    }}
                                >
                                    {column.render
                                        ? column.render(row, virtualRow.index)
                                        : String((row as Record<string, unknown>)[column.id] ?? '')}
                                </div>
                            ))}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default SarakDataTableImpl;
