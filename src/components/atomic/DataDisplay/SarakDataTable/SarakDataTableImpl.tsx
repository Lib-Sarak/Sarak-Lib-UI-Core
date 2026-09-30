/**
 * SarakDataTable — grid colunar avançado (Spec 12, Regra 2 · Onda 9)
 *
 * Mantém cabeçalho sticky, colunas congeladas, resize e reorder sobre um único
 * contêiner virtualizado. No celular, os mesmos dados colapsam para cards.
 */

import React, { useMemo, useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { computeOffsets, reorder, widthOf, MIN_COLUMN_WIDTH, SELECTION_COLUMN_WIDTH } from './columnModel';
import type { SarakColumn, SarakTableSort } from './columnModel';
import SarakDataCards from './SarakDataCards';
import { SarakDataTableHeader } from './SarakDataTableHeader';
import { SarakDataTableRows } from './SarakDataTableRows';
import { useTableInteractions } from './useTableInteractions';
import { useSarakDevice } from '../../../../core/Provider/DeviceProvider';

export interface SarakDataTableProps<T = Record<string, unknown>> {
    /** Definição declarativa das colunas (ordem inicial = ordem do array). */
    columns: Array<SarakColumn<T>>;
    /** Linhas de dados; a fonte real (fetch) vive fora — aqui só virtualizamos. */
    rows: T[];
    rowHeight?: number;
    headerHeight?: number;
    height?: number | string;
    overscan?: number;
    /** Chave estável da linha para seleção; por padrão, usa row.id ou o índice original. */
    getRowKey?: (row: T, index: number) => React.Key;
    /** Omitido, ordena localmente; passe null para controlar o estado sem ordenação. */
    sort?: SarakTableSort | null;
    /** Recebe o próximo estado de ordenação; com sort, o consumidor controla a ordem das linhas. */
    onSortChange?: (sort: SarakTableSort | null) => void;
    /** Habilita a seleção de linhas e a caixa das linhas visíveis. */
    selectable?: boolean;
    /** Chaves selecionadas controladas; omitido, a tabela gerencia a seleção. */
    selectedKeys?: React.Key[];
    /** Recebe as chaves selecionadas atualizadas. */
    onSelectionChange?: (selectedKeys: React.Key[]) => void;
    onColumnResize?: (columnId: string, width: number) => void;
    onColumnReorder?: (fromId: string, toId: string) => void;
    /** L2 (Spec 40.2): no smartphone colapsa para cards empilhados. Default `true`. */
    responsive?: boolean;
    className?: string;
}

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
    sort,
    onSortChange,
    selectable = false,
    selectedKeys,
    onSelectionChange,
    responsive = true,
    className,
}: SarakDataTableProps<T>) {
    const device = useSarakDevice();
    const collapseToCards = responsive && device === 'smartphone';
    const scrollRef = useRef<HTMLDivElement>(null);
    const [widths, setWidths] = useState<Record<string, number>>({});
    const [order, setOrder] = useState<string[]>(() => columns.map((column) => column.id));
    const [dragId, setDragId] = useState<string | null>(null);
    const byId = useMemo(() => new Map(columns.map((column) => [column.id, column])), [columns]);
    const ordered = useMemo(
        () => order.map((id) => byId.get(id)).filter((column): column is SarakColumn<T> => Boolean(column)),
        [order, byId],
    );
    const offsets = useMemo(() => computeOffsets(ordered, widths), [ordered, widths]);
    const interactions = useTableInteractions({
        rows,
        getRowKey,
        sort,
        onSortChange,
        selectedKeys,
        onSelectionChange,
        getSortValue: (row, columnId) => (row as Record<string, unknown>)[columnId],
    });
    const containerWidth = offsets.total + (selectable ? SELECTION_COLUMN_WIDTH : 0);
    const virtualizer = useVirtualizer({
        count: interactions.entries.length,
        getScrollElement: () => scrollRef.current,
        estimateSize: () => rowHeight,
        overscan,
    });
    const headerBg = 'var(--sarak-table-header-bg, var(--color-theme-card,#1e293b))';
    const cellBg = 'var(--color-theme-card,#1e293b)';

    const startResize = (event: React.PointerEvent, column: SarakColumn<T>) => {
        event.preventDefault();
        event.stopPropagation();
        const startX = event.clientX;
        const startWidth = widthOf(column, widths);
        const minimum = column.minWidth ?? MIN_COLUMN_WIDTH;
        const move = (pointer: PointerEvent) => setWidths((previous) => ({
            ...previous,
            [column.id]: Math.max(minimum, startWidth + pointer.clientX - startX),
        }));
        const finish = (pointer: PointerEvent) => {
            window.removeEventListener('pointermove', move);
            window.removeEventListener('pointerup', finish);
            onColumnResize?.(column.id, Math.max(minimum, startWidth + pointer.clientX - startX));
        };
        window.addEventListener('pointermove', move);
        window.addEventListener('pointerup', finish);
    };
    const onDrop = (toId: string) => {
        if (dragId && dragId !== toId) {
            setOrder((previous) => reorder(previous, dragId, toId));
            onColumnReorder?.(dragId, toId);
        }
        setDragId(null);
    };
    const virtualRows = virtualizer.getVirtualItems().flatMap((item) => {
        const entry = interactions.entries[item.index];
        return entry ? [{ entry, virtualIndex: item.index, virtualKey: item.key, start: item.start }] : [];
    });

    if (collapseToCards) {
        return (
            <SarakDataCards
                columns={columns}
                rows={interactions.entries.map(({ row }) => row)}
                rowKeys={interactions.entries.map(({ key }) => key)}
                rowIndexes={interactions.entries.map(({ index }) => index)}
                height={height}
                overscan={overscan}
                getRowKey={getRowKey}
                sort={interactions.sort}
                onSort={interactions.changeSort}
                selectable={selectable}
                selectedKeys={interactions.selectedKeys}
                allVisibleSelected={interactions.allVisibleSelected}
                partiallySelected={interactions.partiallySelected}
                onToggleRow={interactions.toggleRow}
                onToggleAll={interactions.toggleAll}
                className={className}
            />
        );
    }

    return (
        <div ref={scrollRef} data-sarak-datatable="true" role="table" className={className} style={{ height, maxWidth: '100%', overflow: 'auto', position: 'relative' }}>
            <div style={{ width: containerWidth, position: 'relative', height: headerHeight + virtualizer.getTotalSize() }}>
                <SarakDataTableHeader
                    columns={ordered}
                    widths={widths}
                    offsets={offsets}
                    background={headerBg}
                    headerHeight={headerHeight}
                    dragId={dragId}
                    sort={interactions.sort}
                    selectable={selectable}
                    allVisibleSelected={interactions.allVisibleSelected}
                    partiallySelected={interactions.partiallySelected}
                    onDragStart={setDragId}
                    onDrop={onDrop}
                    onSort={interactions.changeSort}
                    onToggleAll={interactions.toggleAll}
                    onResizeStart={startResize}
                />
                <SarakDataTableRows
                    columns={ordered}
                    rows={virtualRows}
                    widths={widths}
                    offsets={offsets}
                    containerWidth={containerWidth}
                    headerHeight={headerHeight}
                    rowHeight={rowHeight}
                    cellBackground={cellBg}
                    selectable={selectable}
                    selectedKeys={interactions.selectedKeys}
                    onToggleRow={interactions.toggleRow}
                />
            </div>
        </div>
    );
}

export default SarakDataTableImpl;
