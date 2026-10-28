import type { CSSProperties, ReactElement, ReactNode } from 'react';
import { useLibraryText } from '../../../../core/i18n/useLibraryText';
import { SarakCheckbox } from '../../Inputs/SarakCheckbox';
import { columnAlign, columnText, footerContent } from './columnValue';
import type { SarakValueColumn } from './columnValue';
import type { SarakDataCardsProps } from './SarakDataCards';
import { SarakExpandToggle } from './SarakTableControls';
import type { SarakDisplayRow } from './tableDisplayRows';

type DisplayOf<T, K extends SarakDisplayRow<T>['kind']> = Extract<SarakDisplayRow<T>, { kind: K }>;

export const CARD_STYLE: CSSProperties = {
    display: 'flex', flexDirection: 'column', gap: 'calc(var(--sarak-layout-gap-sm, 8px) * 0.5)',
    padding: 'var(--sarak-card-padding-md, var(--sarak-layout-gap-md, 16px))', marginBottom: 'var(--sarak-layout-gap-sm, 8px)',
    background: 'var(--sarak-card-bg, var(--color-theme-card, #101622))',
    border: 'var(--sarak-border-width, 1px) solid var(--sarak-card-border-color, var(--border-color, rgba(255,255,255,0.09)))',
    borderRadius: 'var(--sarak-card-radius, 10px)', color: 'var(--sarak-text-main, #f2f6fb)', boxSizing: 'border-box',
};

const LABEL_CLASS = 'text-2xs font-semibold uppercase tracking-wider text-[var(--text-muted,rgba(242,246,251,0.55))]';

interface ColumnFieldProps {
    id: string;
    header: ReactNode;
    align: 'left' | 'center' | 'right';
    children: ReactNode;
}

const ColumnField = ({ id, header, align, children }: ColumnFieldProps): ReactElement => (
    <div data-column-id={id} className="min-w-0" style={{ display: 'flex', flexDirection: 'column', gap: 'calc(var(--sarak-layout-gap-sm, 8px) * 0.25)' }}>
        <span className={LABEL_CLASS}>{header}</span>
        <span className="text-sm break-words min-w-0" style={{ textAlign: align }}>{children}</span>
    </div>
);

export interface TotalsColumn<T> {
    column: SarakValueColumn<T>;
    header: ReactNode;
}

interface TotalsCardProps<T> {
    columns: Array<TotalsColumn<T>>;
    rows: T[];
    title: string;
    locale?: string;
}

/** Cartão de totais (rodapé ou subtotal): um campo por coluna com agregação ou rodapé. */
export const TotalsCard = <T,>({ columns, rows, title, locale }: TotalsCardProps<T>): ReactElement => (
    <div role="group" aria-label={title} style={{ ...CARD_STYLE, fontWeight: 600 }}>
        <span className={LABEL_CLASS}>{title}</span>
        {columns.map(({ column, header }) => {
            const content = footerContent(rows, column, locale);
            return content === null || content === undefined ? null : <ColumnField key={column.id} id={column.id} header={header} align={columnAlign(column as SarakValueColumn<T> & { align?: 'left' | 'center' | 'right' })}>{content}</ColumnField>;
        })}
    </div>
);

export const SubtotalCard = <T,>({ columns, display, locale }: { columns: Array<TotalsColumn<T>>; display: DisplayOf<T, 'subtotal'>; locale?: string }): ReactElement => {
    const text = useLibraryText();
    return <TotalsCard columns={columns} rows={display.rows} title={text('tableSubtotal')} locale={locale} />;
};

export const GroupCard = <T,>({ display, onToggleGroup }: { display: DisplayOf<T, 'group'>; onToggleGroup?: (groupId: string) => void }): ReactElement => {
    const text = useLibraryText();
    const label: ReactNode = display.label ? display.label(display.groupKey, display.rows) : display.groupKey;
    return (
        <div data-sarak-group={display.groupKey} style={{ ...CARD_STYLE, flexDirection: 'row', alignItems: 'center', fontWeight: 600 }}>
            <SarakExpandToggle expanded={display.expanded} label={text(display.expanded ? 'tableCollapseGroup' : 'tableExpandGroup', { group: display.groupKey })} onToggle={() => onToggleGroup?.(display.id)} />
            <span>{label}</span>
        </div>
    );
};

export const DetailCard = <T,>({ display, renderExpanded }: { display: DisplayOf<T, 'detail'>; renderExpanded?: (row: T) => ReactNode }): ReactElement => (
    <div style={CARD_STYLE}>{renderExpanded?.(display.entry.row)}</div>
);

export interface DataCardBodyProps<T> {
    props: SarakDataCardsProps<T>;
    display: DisplayOf<T, 'data'>;
}

/** Corpo do cartão de dado: seleção, botão de expandir (linha/árvore) e os campos das colunas. */
export const DataCardBody = <T,>({ props, display }: DataCardBodyProps<T>): ReactElement => {
    const text = useLibraryText();
    const { entry } = display;
    return (
        <>
            {(props.selectable || display.expandable) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sarak-layout-gap-sm, 8px)' }}>
                    {props.selectable && <SarakCheckbox aria-label={text('selectRow', { row: String(entry.key) })} checked={props.selectedKeys?.has(entry.key) ?? false} onChange={(event) => props.onToggleRow?.(entry.key, event.currentTarget.checked)} />}
                    {display.expandable && <SarakExpandToggle expanded={display.expanded} label={text(display.expanded ? 'tableCollapseRow' : 'tableExpandRow')} onToggle={() => props.onToggleExpand?.(entry.key)} />}
                </div>
            )}
            {props.columns.map((column) => (
                <ColumnField key={column.id} id={column.id} header={column.header} align={columnAlign(column)}>
                    {column.render ? column.render(entry.row, entry.index) : columnText(entry.row, column, props.locale)}
                </ColumnField>
            ))}
        </>
    );
};
