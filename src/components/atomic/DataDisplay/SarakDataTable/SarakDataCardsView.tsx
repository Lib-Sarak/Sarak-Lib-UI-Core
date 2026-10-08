import type { RefObject, ReactElement, ReactNode, KeyboardEvent, MouseEvent } from 'react';
import type { VirtualItem } from '@tanstack/react-virtual';
import { SarakCheckbox } from '../../Inputs/SarakCheckbox';
import { SarakTableSortButton } from './SarakTableSortButton';
import type { SarakColumn } from './columnModel';
import type { SarakDataCardsProps } from './SarakDataCards';

interface SarakDataCardsViewProps<T> {
    props: SarakDataCardsProps<T>;
    scrollRef: RefObject<HTMLDivElement>;
    totalSize: number;
    virtualRows: VirtualItem[];
    measureElement: (element: Element | null) => void;
}

const cellValue = <T,>(column: SarakColumn<T>, row: T, index: number): ReactNode =>
    column.render ? column.render(row, index) : String((row as Record<string, unknown>)[column.id] ?? '');

const isInteractiveTarget = (target: EventTarget): boolean =>
    target instanceof Element && Boolean(target.closest('button,input,a,select,textarea,[role="button"],[role="checkbox"]'));

const handleCardClick = <T,>(event: MouseEvent<HTMLDivElement>, row: T, onRowClick?: (row: T) => void): void => {
    if (!isInteractiveTarget(event.target)) onRowClick?.(row);
};

const handleCardKeyDown = <T,>(event: KeyboardEvent<HTMLDivElement>, row: T, onRowClick?: (row: T) => void): void => {
    if (event.target !== event.currentTarget || !['Enter', ' '].includes(event.key)) return;
    event.preventDefault();
    onRowClick?.(row);
};

const SarakDataCardsToolbar = <T,>({ props }: Pick<SarakDataCardsViewProps<T>, 'props'>): ReactElement => (
    <>
        {props.selectable && <div role="group" aria-label="Seleção das linhas visíveis"><SarakCheckbox aria-label="Selecionar todas as linhas visíveis" checked={props.allVisibleSelected} indeterminate={props.partiallySelected} disabled={props.rows.length === 0} onChange={(event) => props.onToggleAll?.(event.currentTarget.checked)} /></div>}
        {props.columns.some((column) => column.sortable) && <div role="group" aria-label="Ordenação por coluna" style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--sarak-layout-gap-sm, 8px)' }}>{props.columns.filter((column) => column.sortable).map((column) => <SarakTableSortButton key={column.id} columnId={column.id} label={column.header} sort={props.sort ?? null} onSort={(columnId) => props.onSort?.(columnId)} />)}</div>}
    </>
);

interface SarakDataCardRowProps<T> {
    props: SarakDataCardsProps<T>;
    virtualRow: VirtualItem;
    measureElement: (element: Element | null) => void;
}

const SarakDataCardRow = <T,>({ props, virtualRow, measureElement }: SarakDataCardRowProps<T>): ReactElement | null => {
    const row = props.rows[virtualRow.index];
    if (row === undefined) return null;
    const rowIndex = props.rowIndexes?.[virtualRow.index] ?? virtualRow.index;
    const rowKey = props.rowKeys?.[virtualRow.index] ?? (props.getRowKey ? props.getRowKey(row, rowIndex) : virtualRow.key);
    return (
        <div key={rowKey} role="listitem" data-index={virtualRow.index} tabIndex={props.onRowClick ? 0 : undefined} onClick={(event) => handleCardClick(event, row, props.onRowClick)} onKeyDown={(event) => handleCardKeyDown(event, row, props.onRowClick)} ref={measureElement} style={{ position: 'absolute', top: 0, left: 0, width: '100%', transform: `translateY(${virtualRow.start}px)`, display: 'flex', flexDirection: 'column', gap: 'calc(var(--sarak-layout-gap-sm, 8px) * 0.5)', padding: 'var(--sarak-card-padding-md, var(--sarak-layout-gap-md, 16px))', marginBottom: 'var(--sarak-layout-gap-sm, 8px)', background: 'var(--sarak-card-bg, var(--color-theme-card, #1e293b))', border: 'var(--sarak-border-width, 1px) solid var(--sarak-card-border-color, var(--border-color, #334155))', borderRadius: 'var(--sarak-card-radius, 12px)', color: 'var(--sarak-text-main, #ffffff)', boxSizing: 'border-box' }}>
            {props.selectable && <SarakCheckbox aria-label={`Selecionar linha ${String(rowKey)}`} checked={props.selectedKeys?.has(rowKey) ?? false} onChange={(event) => props.onToggleRow?.(rowKey, event.currentTarget.checked)} />}
            {props.columns.map((column) => <div key={column.id} data-column-id={column.id} className="min-w-0" style={{ display: 'flex', flexDirection: 'column', gap: 'calc(var(--sarak-layout-gap-sm, 8px) * 0.25)' }}><span className="text-2xs font-semibold uppercase tracking-wider text-[var(--text-muted,#94a3b8)]">{column.header}</span><span className="text-sm break-words min-w-0" style={{ textAlign: column.align ?? 'left' }}>{cellValue(column, row, rowIndex)}</span></div>)}
        </div>
    );
};

const SarakDataCardsList = <T,>({ props, totalSize, virtualRows, measureElement }: Omit<SarakDataCardsViewProps<T>, 'scrollRef'>): ReactElement => (
    <div style={{ height: totalSize, position: 'relative', width: '100%' }}><div role="list">{virtualRows.map((virtualRow) => <SarakDataCardRow key={virtualRow.key} props={props} virtualRow={virtualRow} measureElement={measureElement} />)}</div></div>
);

export const SarakDataCardsView = <T,>({ props, scrollRef, totalSize, virtualRows, measureElement }: SarakDataCardsViewProps<T>): ReactElement => (
    <div ref={scrollRef} data-sarak-datacards="true" className={props.className} style={{ height: props.height ?? '100%', maxWidth: '100%', overflowY: 'auto', overflowX: 'hidden', position: 'relative' }}>
        <SarakDataCardsToolbar props={props} />
        <SarakDataCardsList props={props} totalSize={totalSize} virtualRows={virtualRows} measureElement={measureElement} />
    </div>
);
