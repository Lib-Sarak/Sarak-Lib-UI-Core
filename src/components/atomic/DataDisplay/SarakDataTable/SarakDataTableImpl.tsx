/**
 * SarakDataTable — grid colunar avançado (Spec 12, Regra 2 · Onda 9)
 *
 * Camada POR CIMA da virtualização (`@tanstack/react-virtual`) num ÚNICO contêiner de
 * scroll: cabeçalho sticky + colunas congeladas (pinned) alinhadas ao rolar X/Y. Entrega
 * pinned (sticky left/right), resize (pointer) e reorder (drag-and-drop nativo). No celular
 * colapsa para cards (L2, Spec 40.2). Zero Hardcode: tokens `--sarak-*`/`--sarak-table-*`.
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
import SarakDataCards from './SarakDataCards';
import { useSarakDevice } from '../../../../core/Provider/DeviceProvider';

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
    /** L2 (Spec 40.2): no smartphone colapsa para cards empilhados. Default `true`. */
    responsive?: boolean;
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
    responsive = true,
    className,
}: SarakDataTableProps<T>) {
    const device = useSarakDevice();
    const scrollRef = useRef<HTMLDivElement>(null);
    // L2: denso é mobile-usável por padrão — no celular colapsa para cards (após os hooks).
    const collapseToCards = responsive && device === 'smartphone';
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

    // Colapso mobile (L2): cards reusando as MESMAS colunas (após todos os hooks).
    if (collapseToCards) {
        return (
            <SarakDataCards columns={columns} rows={rows} height={height} overscan={overscan} getRowKey={getRowKey} className={className} />
        );
    }

    return (
        <div
            ref={scrollRef}
            data-sarak-datatable="true"
            role="table"
            className={className}
            // `maxWidth: 100%` mantém o scroll horizontal CONTIDO no container (barra mínima L2).
            style={{ height, maxWidth: '100%', overflow: 'auto', position: 'relative' }}
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
                        borderBottom: 'var(--sarak-border-width, 1px) solid var(--sarak-table-border, var(--border-color,#334155))',
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
                                padding: '0 var(--sarak-table-padding, 12px)',
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
                                borderBottom: 'var(--sarak-border-width, 1px) solid var(--sarak-table-border, var(--border-color,#334155))',
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
                                        padding: '0 var(--sarak-table-padding, 12px)',
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
