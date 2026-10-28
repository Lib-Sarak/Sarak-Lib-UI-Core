import type { RefObject, ReactElement, KeyboardEvent, MouseEvent } from 'react';
import type { VirtualItem } from '@tanstack/react-virtual';
import { useLibraryText } from '../../../../core/i18n/useLibraryText';
import { SarakCheckbox } from '../../Inputs/SarakCheckbox';
import { SarakTableSortButton } from './SarakTableSortButton';
import type { SarakDisplayRow } from './tableDisplayRows';
import { cardItemsOf } from './dataCardItems';
import type { SarakDataCardsProps } from './SarakDataCards';
import { CARD_STYLE, DataCardBody, DetailCard, GroupCard, SubtotalCard, TotalsCard } from './SarakDataCardParts';

interface SarakDataCardsViewProps<T> {
    props: SarakDataCardsProps<T>;
    scrollRef: RefObject<HTMLDivElement>;
    totalSize: number;
    virtualRows: VirtualItem[];
    measureElement: (element: Element | null) => void;
}

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

const SarakDataCardsToolbar = <T,>({ props }: Pick<SarakDataCardsViewProps<T>, 'props'>): ReactElement => {
    const text = useLibraryText();
    return (
        <>
            {props.selectable && <div role="group" aria-label={text('tableSelectionGroup')}><SarakCheckbox aria-label={text('selectAllVisibleRows')} checked={props.allVisibleSelected} indeterminate={props.partiallySelected} disabled={props.rows.length === 0} onChange={(event) => props.onToggleAll?.(event.currentTarget.checked)} /></div>}
            {props.columns.some((column) => column.sortable) && <div role="group" aria-label={text('tableSortGroup')} style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--sarak-layout-gap-sm, 8px)' }}>{props.columns.filter((column) => column.sortable).map((column) => <SarakTableSortButton key={column.id} columnId={column.id} label={column.header} sort={props.sort ?? null} onSort={(columnId) => props.onSort?.(columnId)} />)}</div>}
        </>
    );
};

interface SarakDataCardRowProps<T> {
    props: SarakDataCardsProps<T>;
    virtualRow: VirtualItem;
    items: Array<SarakDisplayRow<T>>;
    measureElement: (element: Element | null) => void;
}

const POSITION = (virtualRow: VirtualItem) => ({ position: 'absolute', top: 0, left: 0, width: '100%', transform: `translateY(${virtualRow.start}px)` }) as const;

/** O cartão posicionado na lista virtual: dado, grupo, subtotal, detalhe — ou o rodapé, depois do último. */
const SarakDataCardRow = <T,>({ props, virtualRow, items, measureElement }: SarakDataCardRowProps<T>): ReactElement | null => {
    const text = useLibraryText();
    const display = items[virtualRow.index];
    const totalsColumns = props.columns.map((column) => ({ column, header: column.header }));
    const frame = { 'data-index': virtualRow.index, ref: measureElement, role: 'listitem' } as const;
    if (!display) {
        if (!props.footerRows) return null;
        return <div {...frame} style={POSITION(virtualRow)}><TotalsCard columns={totalsColumns} rows={props.footerRows} title={text('tableFooterLabel')} locale={props.locale} /></div>;
    }
    if (display.kind === 'group') return <div {...frame} style={POSITION(virtualRow)}><GroupCard display={display} onToggleGroup={props.onToggleGroup} /></div>;
    if (display.kind === 'subtotal') return <div {...frame} style={POSITION(virtualRow)}><SubtotalCard columns={totalsColumns} display={display} locale={props.locale} /></div>;
    if (display.kind === 'detail') return <div {...frame} style={POSITION(virtualRow)}><DetailCard display={display} renderExpanded={props.renderExpanded} /></div>;
    const { entry } = display;
    return (
        <div key={entry.key} {...frame} tabIndex={props.onRowClick ? 0 : undefined} onClick={(event) => handleCardClick(event, entry.row, props.onRowClick)} onKeyDown={(event) => handleCardKeyDown(event, entry.row, props.onRowClick)} style={{ ...POSITION(virtualRow), ...CARD_STYLE, marginLeft: display.depth ? `calc(var(--sarak-layout-gap-md, 16px) * ${display.depth})` : undefined, width: display.depth ? `calc(100% - var(--sarak-layout-gap-md, 16px) * ${display.depth})` : '100%' }}>
            <DataCardBody props={props} display={display} />
        </div>
    );
};

const SarakDataCardsList = <T,>({ props, totalSize, virtualRows, measureElement }: Omit<SarakDataCardsViewProps<T>, 'scrollRef'>): ReactElement => {
    const items = cardItemsOf(props);
    return (
        <div style={{ height: totalSize, position: 'relative', width: '100%' }}><div role="list">{virtualRows.map((virtualRow) => <SarakDataCardRow key={virtualRow.key} props={props} virtualRow={virtualRow} items={items} measureElement={measureElement} />)}</div></div>
    );
};

export const SarakDataCardsView = <T,>({ props, scrollRef, totalSize, virtualRows, measureElement }: SarakDataCardsViewProps<T>): ReactElement => (
    <div ref={scrollRef} data-sarak-datacards="true" className={props.className} style={{ height: props.height ?? '100%', maxWidth: '100%', overflowY: 'auto', overflowX: 'hidden', position: 'relative' }}>
        <SarakDataCardsToolbar props={props} />
        <SarakDataCardsList props={props} totalSize={totalSize} virtualRows={virtualRows} measureElement={measureElement} />
    </div>
);
