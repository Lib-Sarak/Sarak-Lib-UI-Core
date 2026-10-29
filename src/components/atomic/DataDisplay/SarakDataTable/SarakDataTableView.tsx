import type { ReactElement } from 'react';
import { useLibraryText } from '../../../../core/i18n/useLibraryText';
import { useSarakUIOptional } from '../../../../core/Provider/SarakUIProvider';
import { SarakButton } from '../../Buttons/SarakButton';
import { hasFooter } from './columnValue';
import SarakDataCards from './SarakDataCards';
import { SarakDataTableHeader } from './SarakDataTableHeader';
import { SarakDataTableRows } from './SarakDataTableRows';
import { SarakDataTableFooter } from './SarakDataTableSpecialRows';
import { SarakDataTableSkeleton } from './SarakDataTableSkeleton';
import { SarakSelectAllBanner } from './SarakTableControls';
import type { SarakDataTableViewModel } from './useSarakDataTableViewModel';

interface SarakDataTableViewProps<T> {
    model: SarakDataTableViewModel<T>;
}

const HEADER_BACKGROUND = 'var(--sarak-table-header-bg, var(--color-theme-card,#101622))';
const CELL_BACKGROUND = 'var(--color-theme-card,#101622)';
const DEFAULT_HEIGHT = 44;

const ErrorNotice = <T,>({ model }: SarakDataTableViewProps<T>): ReactElement => {
    const text = useLibraryText();
    return <div role="alert" className="flex items-center text-theme-text" style={{ gap: 'var(--sarak-layout-gap-sm,8px)' }}><span>{text('dataLoadErrorTitle')}: {model.props.error}</span>{model.props.onRetry && <SarakButton variant="secondary" onClick={model.props.onRetry}>{text('retry')}</SarakButton>}</div>;
};

/** Sem linhas, `error`/`loading`/vazio substituem a tabela; COM linhas, a tabela fica (Q2). */
const getTableState = <T,>(model: SarakDataTableViewModel<T>, text: ReturnType<typeof useLibraryText>): ReactElement | null => {
    if (model.interactions.entries.length > 0) return null;
    if (model.props.error) return <ErrorNotice model={model} />;
    if (model.props.loading) return <SarakDataTableSkeleton rows={model.props.skeletonRows} columns={model.props.columns?.length ?? 1} className={model.props.className} />;
    return <div role="status">{model.props.emptyMessage ?? text('dataEmpty')}</div>;
};

const rowsProps = <T,>(model: SarakDataTableViewModel<T>, zebra: boolean) => ({
    columns: model.ordered, rows: model.virtualRows, widths: model.widths, offsets: model.offsets, containerWidth: model.containerWidth,
    headerHeight: model.props.headerHeight ?? DEFAULT_HEIGHT, automaticHeight: model.isAutomaticRowHeight, cellBackground: CELL_BACKGROUND, zebra,
    selectable: model.props.selectable ?? false, selectedKeys: model.interactions.selectedKeys, onToggleRow: model.interactions.toggleRow,
    onRowClick: model.props.onRowClick, measureElement: model.virtualizerMeasureElement, locale: model.locale, hasExpander: model.hasExpander,
    treeColumnId: model.props.getChildren ? model.ordered[0]?.id : undefined, renderExpanded: model.props.renderExpanded,
    onToggleExpand: model.toggleRow, onToggleGroup: model.toggleGroup,
});

const CardsView = <T,>({ model }: SarakDataTableViewProps<T>): ReactElement => (
    <SarakDataCards
        columns={model.props.columns} rows={model.interactions.entries.map(({ row }) => row)} rowKeys={model.interactions.entries.map(({ key }) => key)}
        rowIndexes={model.interactions.entries.map(({ index }) => index)} displayRows={model.displayRows} footerRows={model.footerRows} locale={model.locale}
        renderExpanded={model.props.renderExpanded} onToggleExpand={model.toggleRow} onToggleGroup={model.toggleGroup}
        height={model.props.height} overscan={model.props.overscan} getRowKey={model.props.getRowKey} sort={model.interactions.sort} onSort={model.interactions.changeSort}
        selectable={model.props.selectable} selectedKeys={model.interactions.selectedKeys} allVisibleSelected={model.interactions.allVisibleSelected}
        partiallySelected={model.interactions.partiallySelected} onToggleRow={model.interactions.toggleRow} onToggleAll={model.interactions.toggleAll}
        onRowClick={model.props.onRowClick} className={model.props.className}
    />
);

const TableGrid = <T,>({ model }: SarakDataTableViewProps<T>): ReactElement => {
    // Átomo-de-dados: tolera montar sem SarakUIProvider (sem listras).
    const zebra = useSarakUIOptional()?.design?.tableZebraStriping === true;
    const headerHeight = model.props.headerHeight ?? DEFAULT_HEIGHT;
    const props = rowsProps(model, zebra);
    const footer = hasFooter(model.ordered);
    const footerHeight = footer ? headerHeight : 0;
    return (
        <div ref={model.scrollRef} data-sarak-datatable="true" role="table" aria-busy={model.props.loading ? true : undefined} className={model.props.className} style={{ height: model.props.height ?? '100%', maxWidth: '100%', overflow: 'auto', position: 'relative' }}>
            <div style={{ width: model.containerWidth, position: 'relative', height: headerHeight + model.virtualTotalSize + footerHeight }}>
                <SarakDataTableHeader columns={model.ordered} widths={model.widths} offsets={model.offsets} background={HEADER_BACKGROUND} headerHeight={headerHeight} dragId={model.dragId} sort={model.interactions.sort} selectable={model.props.selectable ?? false} hasExpander={model.hasExpander} reorderable={model.props.reorderable} allVisibleSelected={model.interactions.allVisibleSelected} partiallySelected={model.interactions.partiallySelected} onDragStart={model.setDragId} onDrop={model.onDrop} onSort={model.interactions.changeSort} onToggleAll={model.interactions.toggleAll} onResizeStart={model.onResizeStart} />
                <SarakDataTableRows {...props} />
                {footer && <SarakDataTableFooter rows={model.footerRows} props={props} top={headerHeight + model.virtualTotalSize} height={footerHeight} />}
            </div>
        </div>
    );
};

export const SarakDataTableView = <T,>({ model }: SarakDataTableViewProps<T>): ReactElement => {
    const text = useLibraryText();
    const state = getTableState(model, text);
    if (state) return state;
    return (
        <>
            {model.props.error && <ErrorNotice model={model} />}
            <SarakSelectAllBanner {...model.interactions} />
            {model.collapseToCards ? <CardsView model={model} /> : <TableGrid model={model} />}
        </>
    );
};
