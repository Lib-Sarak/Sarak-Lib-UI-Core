import type { ReactElement } from 'react';
import { useLibraryText } from '../../../../core/i18n/useLibraryText';
import { SarakButton } from '../../Buttons/SarakButton';
import SarakDataCards from './SarakDataCards';
import { SarakDataTableHeader } from './SarakDataTableHeader';
import { SarakDataTableRows } from './SarakDataTableRows';
import type { SarakDataTableViewModel } from './useSarakDataTableViewModel';

interface SarakDataTableViewProps<T> {
    model: SarakDataTableViewModel<T>;
}

const HEADER_BACKGROUND = 'var(--sarak-table-header-bg, var(--color-theme-card,#1e293b))';
const CELL_BACKGROUND = 'var(--color-theme-card,#1e293b)';

const getTableState = <T,>(model: SarakDataTableViewModel<T>, text: ReturnType<typeof useLibraryText>): ReactElement | null => {
    if (model.props.error) {
        return <div role="alert" className="flex items-center text-theme-text" style={{ gap: 'var(--sarak-layout-gap-sm,8px)' }}><span>{text('dataLoadErrorTitle')}: {model.props.error}</span>{model.props.onRetry && <SarakButton variant="secondary" onClick={model.props.onRetry}>{text('retry')}</SarakButton>}</div>;
    }
    if (model.props.loading) return <div role="status" aria-live="polite">{text('spinnerLoading')}</div>;
    if (model.interactions.entries.length === 0) return <div role="status">{model.props.emptyMessage ?? text('dataEmpty')}</div>;
    return null;
};

export const SarakDataTableView = <T,>({ model }: SarakDataTableViewProps<T>): ReactElement => {
    const text = useLibraryText();
    const state = getTableState(model, text);
    if (state) return state;
    if (model.collapseToCards) {
        return <SarakDataCards columns={model.props.columns} rows={model.interactions.entries.map(({ row }) => row)} rowKeys={model.interactions.entries.map(({ key }) => key)} rowIndexes={model.interactions.entries.map(({ index }) => index)} height={model.props.height} overscan={model.props.overscan} getRowKey={model.props.getRowKey} sort={model.interactions.sort} onSort={model.interactions.changeSort} selectable={model.props.selectable} selectedKeys={model.interactions.selectedKeys} allVisibleSelected={model.interactions.allVisibleSelected} partiallySelected={model.interactions.partiallySelected} onToggleRow={model.interactions.toggleRow} onToggleAll={model.interactions.toggleAll} onRowClick={model.props.onRowClick} className={model.props.className} />;
    }
    return (
        <div ref={model.scrollRef} data-sarak-datatable="true" role="table" className={model.props.className} style={{ height: model.props.height ?? '100%', maxWidth: '100%', overflow: 'auto', position: 'relative' }}>
            <div style={{ width: model.containerWidth, position: 'relative', height: (model.props.headerHeight ?? 44) + model.virtualTotalSize }}>
                <SarakDataTableHeader columns={model.ordered} widths={model.widths} offsets={model.offsets} background={HEADER_BACKGROUND} headerHeight={model.props.headerHeight ?? 44} dragId={model.dragId} sort={model.interactions.sort} selectable={model.props.selectable ?? false} allVisibleSelected={model.interactions.allVisibleSelected} partiallySelected={model.interactions.partiallySelected} onDragStart={model.setDragId} onDrop={model.onDrop} onSort={model.interactions.changeSort} onToggleAll={model.interactions.toggleAll} onResizeStart={model.onResizeStart} />
                <SarakDataTableRows columns={model.ordered} rows={model.virtualRows} widths={model.widths} offsets={model.offsets} containerWidth={model.containerWidth} headerHeight={model.props.headerHeight ?? 44} automaticHeight={model.isAutomaticRowHeight} cellBackground={CELL_BACKGROUND} selectable={model.props.selectable ?? false} selectedKeys={model.interactions.selectedKeys} onToggleRow={model.interactions.toggleRow} onRowClick={model.props.onRowClick} measureElement={model.virtualizerMeasureElement} />
            </div>
        </div>
    );
};
