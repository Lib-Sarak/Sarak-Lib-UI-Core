import React from 'react';
import { SarakCheckbox } from '../Inputs/SarakCheckbox';
import { SarakTableSortButton } from '../DataDisplay/SarakDataTable/SarakTableSortButton';
import type { SarakTableSort } from '../DataDisplay/SarakDataTable/columnModel';
import { useLibraryText } from '../../../core/i18n/useLibraryText';
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
}

const displayValue = (value: unknown): string => String(value ?? '');

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
    background: 'var(--color-theme-card, #1e293b)',
    border: 'var(--sarak-border-width, 1px) solid var(--border-color, #334155)',
    borderRadius: 'var(--sarak-card-radius, 12px)',
    color: 'var(--sarak-text-main, #ffffff)',
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
}: SarakTableCardsProps<T>) {
    const text = useLibraryText();
    const items = loading ? Array.from({ length: 3 }, (_, index) => ({ __skeleton: index } as unknown as T)) : rows;
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
                {items.map((row, index) => {
                    const rowId = row.id;
                    const rowKey = rowKeys?.[index]
                        ?? (typeof rowId === 'string' || typeof rowId === 'number' ? rowId : index);
                    const handleRowClick = loading ? undefined : onRowClick;
                    return (
                        <div key={rowKey} role="listitem" tabIndex={handleRowClick ? 0 : undefined} onClick={(event) => handleCardClick(event, row, handleRowClick)} onKeyDown={(event) => handleCardKeyDown(event, row, handleRowClick)} style={{ ...cardStyle, cursor: handleRowClick ? 'pointer' : undefined }}>
                            {canSelect && (
                                <SarakTableSelectionCheckbox
                                    label={text('selectRow', { row: String(rowKey) })}
                                    checked={selectedKeys.has(rowKey)}
                                    onChange={(checked) => onToggleRow?.(rowKey, checked)}
                                />
                            )}
                            {columns.map((column) => {
                                const columnId = typeof column === 'string' ? column : column.key;
                                const label = typeof column === 'string' ? columnLabels[columnId] : column.label;
                                const align = typeof column === 'string' ? 'left' : column.align ?? 'left';
                                return (
                                <div key={columnId} className="min-w-0" style={{ display: 'flex', flexDirection: 'column', gap: 'calc(var(--sarak-layout-gap-sm, 8px) * 0.25)' }}>
                                    <span className="text-2xs font-black uppercase tracking-widest text-theme-muted">
                                        {label}
                                    </span>
                                    <span className="text-sm break-words min-w-0 text-theme-text" style={{ textAlign: align }}>
                                        {loading ? '' : typeof column === 'string' || !column.render ? displayValue(row[columnId]) : column.render(row)}
                                    </span>
                                </div>
                                );
                            })}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default SarakTableCards;
