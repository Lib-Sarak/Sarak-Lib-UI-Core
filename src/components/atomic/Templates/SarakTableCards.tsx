import React from 'react';
import { SarakCheckbox } from '../Inputs/SarakCheckbox';
import { SarakTableSortButton } from '../DataDisplay/SarakDataTable/SarakTableSortButton';
import type { SarakTableSort } from '../DataDisplay/SarakDataTable/columnModel';
import { useLibraryText } from '../../../core/i18n/useLibraryText';
import { columnAlign, columnText, toValueColumn } from '../DataDisplay/SarakDataTable/columnValue';
import { DetailCard, GroupCard, SubtotalCard, TotalsCard } from '../DataDisplay/SarakDataTable/SarakDataCardParts';
import { SarakExpandToggle } from '../DataDisplay/SarakDataTable/SarakTableControls';
import type { SarakDisplayRow } from '../DataDisplay/SarakDataTable/tableDisplayRows';
import type { SarakTableColumn } from './SarakTableProps';

export interface SarakTableSelectionCheckboxProps {
    label: string;
    checked: boolean;
    indeterminate?: boolean;
    disabled?: boolean;
    onChange: (checked: boolean) => void;
}

export function SarakTableSelectionCheckbox({
    label,
    checked,
    indeterminate = false,
    disabled = false,
    onChange,
}: SarakTableSelectionCheckboxProps) {
    return (
        <SarakCheckbox
            aria-label={label}
            checked={checked}
            indeterminate={indeterminate}
            disabled={disabled}
            onChange={(event) => onChange(event.currentTarget.checked)}
        />
    );
}

export interface SarakTableCardsProps<T extends Record<string, unknown>> {
    rows: T[];
    columns: Array<string | SarakTableColumn<T>>;
    columnLabels: Record<string, string>;
    loading?: boolean;
    rowKeys?: React.Key[];
    sort?: SarakTableSort | null;
    onSort?: (columnId: string) => void;
    sortableColumns?: string[];
    selectable?: boolean;
    selectedKeys?: Set<React.Key>;
    allVisibleSelected?: boolean;
    partiallySelected?: boolean;
    onToggleRow?: (key: React.Key, checked: boolean) => void;
    onToggleAll?: (checked: boolean) => void;
    onRowClick?: (row: T) => void;
    /** Linhas visuais (grupo, subtotal, detalhe); ausente = um cartão por linha de `rows`. */
    displayRows?: Array<SarakDisplayRow<T>>;
    /** Linhas sobre as quais o rodapé agrega; ausente, sem cartão de totais. */
    footerRows?: T[];
    locale?: string;
    renderExpanded?: (row: T) => React.ReactNode;
    onToggleExpand?: (key: React.Key) => void;
    onToggleGroup?: (groupId: string) => void;
}

const dataRow = <T extends Record<string, unknown>>(row: T, index: number, key?: React.Key): SarakDisplayRow<T> => {
    const rowId = row.id;
    const resolved = key ?? (typeof rowId === 'string' || typeof rowId === 'number' ? rowId : index);
    return { kind: 'data', id: `row:${String(resolved)}`, entry: { row, index, key: resolved }, depth: 0, expandable: false, expanded: false, hasChildren: false };
};

const skeletonRow = <T extends Record<string, unknown>>(index: number): SarakDisplayRow<T> => dataRow({ __skeleton: index } as unknown as T, index, index);

const isInteractiveTarget = (target: EventTarget): boolean =>
    target instanceof Element && Boolean(target.closest('button,input,a,select,textarea,[role="button"],[role="checkbox"]'));

const handleCardClick = <T,>(event: React.MouseEvent<HTMLDivElement>, row: T, onRowClick?: (row: T) => void): void => {
    if (!isInteractiveTarget(event.target)) onRowClick?.(row);
};

const handleCardKeyDown = <T,>(event: React.KeyboardEvent<HTMLDivElement>, row: T, onRowClick?: (row: T) => void): void => {
    if (event.target !== event.currentTarget || !['Enter', ' '].includes(event.key)) return;
    event.preventDefault();
    onRowClick?.(row);
};

const cardStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(var(--sarak-layout-gap-sm, 8px) * 0.5)',
    padding: 'var(--sarak-card-padding-md, var(--sarak-layout-gap-md, 16px))',
    background: 'var(--color-theme-card, #101622)',
    border: 'var(--sarak-border-width, 1px) solid var(--border-color, rgba(255,255,255,0.09))',
    borderRadius: 'var(--sarak-card-radius, 10px)',
    color: 'var(--sarak-text-main, #f2f6fb)',
    boxSizing: 'border-box',
};

export function SarakTableCards<T extends Record<string, unknown>>({
    rows,
    columns,
    columnLabels,
    loading = false,
    rowKeys,
    sort = null,
    onSort,
    sortableColumns = [],
    selectable = false,
    selectedKeys = new Set<React.Key>(),
    allVisibleSelected = false,
    partiallySelected = false,
    onToggleRow,
    onToggleAll,
    onRowClick,
    displayRows,
    footerRows,
    locale,
    renderExpanded,
    onToggleExpand,
    onToggleGroup,
}: SarakTableCardsProps<T>) {
    const text = useLibraryText();
    const columnList = columns.map((column) => typeof column === 'string' ? { key: column, label: columnLabels[column] } : column);
    const valueColumns = columnList.map((column) => toValueColumn<T>(column));
    const totalsColumns = valueColumns.map((column, index) => ({ column, header: columnList[index].label }));
    const items: Array<SarakDisplayRow<T>> = loading
        ? Array.from({ length: 3 }, (_, index) => skeletonRow<T>(index))
        : displayRows ?? rows.map((row, index) => dataRow(row, index, rowKeys?.[index]));
    const canSelect = selectable && !loading;

    return (
        <div data-sarak-tablecards="true" style={{ maxWidth: '100%' }}>
            {selectable && (
                <div role="group" aria-label={text('tableSelectionGroup')}>
                    <SarakTableSelectionCheckbox
                        label={text('selectAllVisibleRows')}
                        checked={allVisibleSelected}
                        indeterminate={partiallySelected}
                        disabled={loading || rows.length === 0}
                        onChange={(checked) => onToggleAll?.(checked)}
                    />
                </div>
            )}
            {sortableColumns.length > 0 && (
                <div role="group" aria-label={text('tableSortGroup')} style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--sarak-layout-gap-sm, 8px)' }}>
                    {sortableColumns.map((columnId) => (
                        <SarakTableSortButton
                            key={columnId}
                            columnId={columnId}
                            label={columnLabels[columnId]}
                            sort={sort}
                            onSort={(id) => onSort?.(id)}
                        />
                    ))}
                </div>
            )}
            <div role="list" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sarak-layout-gap-sm, 8px)', maxWidth: '100%' }}>
                {items.map((display) => {
                    if (display.kind === 'group') return <div key={display.id} role="listitem"><GroupCard display={display} onToggleGroup={onToggleGroup} /></div>;
                    if (display.kind === 'subtotal') return <div key={display.id} role="listitem"><SubtotalCard columns={totalsColumns} display={display} locale={locale} /></div>;
                    if (display.kind === 'detail') return <div key={display.id} role="listitem"><DetailCard display={display} renderExpanded={renderExpanded} /></div>;
                    const { row, key: rowKey } = display.entry;
                    const handleRowClick = loading ? undefined : onRowClick;
                    return (
                        <div key={display.id} role="listitem" tabIndex={handleRowClick ? 0 : undefined} onClick={(event) => handleCardClick(event, row, handleRowClick)} onKeyDown={(event) => handleCardKeyDown(event, row, handleRowClick)} style={{ ...cardStyle, cursor: handleRowClick ? 'pointer' : undefined }}>
                            {(canSelect || display.expandable) && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sarak-layout-gap-sm, 8px)' }}>
                                    {canSelect && (
                                        <SarakTableSelectionCheckbox
                                            label={text('selectRow', { row: String(rowKey) })}
                                            checked={selectedKeys.has(rowKey)}
                                            onChange={(checked) => onToggleRow?.(rowKey, checked)}
                                        />
                                    )}
                                    {display.expandable && <SarakExpandToggle expanded={display.expanded} label={text(display.expanded ? 'tableCollapseRow' : 'tableExpandRow')} onToggle={() => onToggleExpand?.(rowKey)} />}
                                </div>
                            )}
                            {columnList.map((column, index) => (
                                <div key={column.key} className="min-w-0" style={{ display: 'flex', flexDirection: 'column', gap: 'calc(var(--sarak-layout-gap-sm, 8px) * 0.25)' }}>
                                    <span className="text-2xs font-black uppercase tracking-widest text-theme-muted">
                                        {column.label}
                                    </span>
                                    <span className="text-sm break-words min-w-0 text-theme-text" style={{ textAlign: columnAlign(valueColumns[index]) }}>
                                        {loading ? '' : 'render' in column && column.render ? column.render(row) : columnText(row, valueColumns[index], locale)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    );
                })}
                {footerRows && !loading && <div role="listitem"><TotalsCard columns={totalsColumns} rows={footerRows} title={text('tableFooterLabel')} locale={locale} /></div>}
            </div>
        </div>
    );
}

export default SarakTableCards;
