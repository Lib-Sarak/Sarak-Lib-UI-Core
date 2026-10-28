import type { CSSProperties, ReactElement, ReactNode } from 'react';
import { useLibraryText } from '../../../../core/i18n/useLibraryText';
import type { SarakColumn } from './columnModel';
import { sarakWidthOf } from './columnModel';
import { resolveRowCells } from './columnSpan';
import { footerContent } from './columnValue';
import { dataCellStyle, leadingWidthOf, SPECIAL_ROW_BORDER } from './dataTableCell';
import type { SarakDataTableRowsProps, SarakDataTableVirtualRow } from './SarakDataTableRows';
import { SarakExpandToggle } from './SarakTableControls';
import type { SarakDisplayRow } from './tableDisplayRows';

type DisplayOf<T, K extends SarakDisplayRow<T>['kind']> = Extract<SarakDisplayRow<T>, { kind: K }>;

interface SpecialRowProps<T, K extends SarakDisplayRow<T>['kind']> {
    row: SarakDataTableVirtualRow<T>;
    display: DisplayOf<T, K>;
    props: SarakDataTableRowsProps<T>;
}

const STRONG = 600;

const rowFrame = <T,>(row: SarakDataTableVirtualRow<T>, props: SarakDataTableRowsProps<T>): CSSProperties => ({
    position: 'absolute', top: props.headerHeight + row.start, left: 0, display: 'flex', width: props.containerWidth,
    height: row.size, borderBottom: SPECIAL_ROW_BORDER,
});

/** Cabeçalho de grupo: uma célula de largura total com o botão de expandir e o rótulo. */
export function SarakDataTableGroupRow<T>({ row, display, props }: SpecialRowProps<T, 'group'>): ReactElement {
    const text = useLibraryText();
    const label: ReactNode = display.label ? display.label(display.groupKey, display.rows) : display.groupKey;
    const name = display.groupKey;
    return (
        <div role="row" data-index={row.virtualIndex} data-sarak-group={display.groupKey} style={{ ...rowFrame(row, props), alignItems: 'center', fontWeight: STRONG, background: props.cellBackground }}>
            <div role="cell" aria-colspan={props.columns.length} style={{ display: 'flex', alignItems: 'center', gap: 'var(--sarak-layout-gap-sm, 8px)', padding: '0 var(--sarak-table-padding, 12px)', width: '100%', color: 'var(--sarak-text-main,#f2f6fb)' }}>
                <SarakExpandToggle expanded={display.expanded} label={text(display.expanded ? 'tableCollapseGroup' : 'tableExpandGroup', { group: name })} onToggle={() => props.onToggleGroup?.(display.id)} />
                <span>{label}</span>
            </div>
        </div>
    );
}

const footerCells = <T,>({ rows, props, leading }: { rows: T[]; props: SarakDataTableRowsProps<T>; leading?: ReactNode }): ReactElement[] =>
    props.columns.map((column: SarakColumn<T>, index) => {
        const content = footerContent(rows, column, props.locale) ?? (index === 0 ? leading : null);
        return (
            <div key={column.id} role="cell" data-column-id={column.id} style={{ ...dataCellStyle(column, sarakWidthOf(column, props.widths), props), fontWeight: STRONG }}>{content}</div>
        );
    });

const LeadingSpacer = <T,>({ props }: { props: SarakDataTableRowsProps<T> }): ReactElement | null => {
    const width = leadingWidthOf(props);
    return width > 0 ? <div role="cell" aria-hidden="true" style={{ width, flex: '0 0 auto' }} /> : null;
};

/** Subtotal do grupo: as mesmas agregações do rodapé, sobre as linhas do grupo. */
export function SarakDataTableSubtotalRow<T>({ row, display, props }: SpecialRowProps<T, 'subtotal'>): ReactElement {
    const text = useLibraryText();
    return (
        <div role="row" data-index={row.virtualIndex} data-sarak-subtotal={display.groupKey} style={{ ...rowFrame(row, props), background: props.cellBackground }}>
            <LeadingSpacer props={props} />
            {footerCells({ rows: display.rows, props, leading: text('tableSubtotal') })}
        </div>
    );
}

/** Conteúdo expandido da linha (`renderExpanded`): ocupa a largura toda e mede a própria altura. */
export function SarakDataTableDetailRow<T>({ row, display, props }: SpecialRowProps<T, 'detail'>): ReactElement {
    return (
        <div role="row" data-index={row.virtualIndex} ref={props.measureElement} style={{ ...rowFrame(row, props), height: undefined }}>
            <div role="cell" aria-colspan={props.columns.length} style={{ width: '100%', padding: 'var(--sarak-table-padding, 12px)', color: 'var(--sarak-text-main,#f2f6fb)' }}>
                {props.renderExpanded?.(display.entry.row)}
            </div>
        </div>
    );
}

interface SarakDataTableFooterProps<T> {
    rows: T[];
    props: SarakDataTableRowsProps<T>;
    top: number;
    height: number;
}

/** Rodapé de totais: `rowgroup` com uma linha, após a última linha virtual. */
export function SarakDataTableFooter<T>({ rows, props, top, height }: SarakDataTableFooterProps<T>): ReactElement {
    const text = useLibraryText();
    return (
        <div role="rowgroup" aria-label={text('tableFooterLabel')} style={{ position: 'absolute', top, left: 0, width: props.containerWidth, height }}>
            <div role="row" style={{ display: 'flex', height, alignItems: 'center', background: props.cellBackground, borderBottom: SPECIAL_ROW_BORDER }}>
                <LeadingSpacer props={props} />
                {footerCells({ rows, props })}
            </div>
        </div>
    );
}
