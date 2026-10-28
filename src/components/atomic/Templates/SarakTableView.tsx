import type { CSSProperties, ReactElement } from 'react';
import { useLibraryText } from '../../../core/i18n/useLibraryText';
import { SarakDataEmpty } from '../Feedback/SarakDataEmpty';
import { SarakTableCards } from './SarakTableCards';
import { SarakTableErrorState } from './SarakTableErrorState';
import { hasFooter } from '../DataDisplay/SarakDataTable/columnValue';
import { SarakSelectAllBanner } from '../DataDisplay/SarakDataTable/SarakTableControls';
import { SarakTableGrid, SarakTableToolbar, type SarakTableViewProps } from './SarakTableViewParts';
import { useStructuralStyles } from '../hooks/useStructuralStyles';
import { SarakDataErrorNotice } from './SarakDataErrorNotice';
import { SarakDataFreshness } from './SarakDataFreshness';

/**
 * O raio do contêiner vem de `tableBorderRadius`. O padrão do cartão (`_card-defaults.css`) lê os quatro
 * cantos `--sarak-card-radius-*` e cede à classe `rounded-[…]` do contêiner; o token entra também pelos
 * cantos, como variável do próprio elemento, para os descendentes que herdam o raio da tabela.
 */
const TABLE_CORNER_RADIUS = 'var(--sarak-table-border-radius, var(--sarak-card-radius, 10px))';
const TABLE_RADIUS_STYLE = {
    '--sarak-card-radius-tl': TABLE_CORNER_RADIUS,
    '--sarak-card-radius-tr': TABLE_CORNER_RADIUS,
    '--sarak-card-radius-br': TABLE_CORNER_RADIUS,
    '--sarak-card-radius-bl': TABLE_CORNER_RADIUS,
} as CSSProperties;

export const SarakTableView = <TData extends Record<string, unknown>>(
    props: SarakTableViewProps<TData>,
): ReactElement => {
    const text = useLibraryText();
    const { getHeaderStyles } = useStructuralStyles();
    const headerStyles = getHeaderStyles();
    const hasData = props.hasData ?? props.filteredData.length > 0;
    if (props.error && !hasData) {
        return <SarakTableErrorState containerClassName={props.containerClassName} error={props.error} onRetry={props.onRetry} />;
    }

    return (
        <div className="@container" style={props.containerStyle}>
            {props.loading && <span className="sr-only" role="status" aria-live="polite">{text('spinnerLoading')}</span>}
            {(props.label || props.showSearch || props.canRefresh || props.exportable) && <SarakTableToolbar {...props} headerClassName={headerStyles.className} headerStyle={headerStyles.style} />}
            {props.error && <SarakDataErrorNotice error={props.error} onRetry={props.onRetry} />}
            <SarakDataFreshness updatedAt={props.updatedAt} stale={Boolean(props.error && hasData)} />
            <SarakSelectAllBanner {...props.interactions} />
            <div className="card relative overflow-hidden rounded-[var(--sarak-table-border-radius,var(--sarak-card-radius,10px))]" style={TABLE_RADIUS_STYLE}>
                {props.collapseToCards ? <SarakTableCards rows={props.interactions.entries.map(({ row }) => row)} rowKeys={props.interactions.entries.map(({ key }) => key)} columns={props.columns} columnLabels={props.columnLabels} loading={props.loading} sort={props.interactions.sort} onSort={props.interactions.changeSort} sortableColumns={props.columns.filter((column) => column.sortable !== false).map((column) => column.key)} selectable={props.selectable} selectedKeys={props.interactions.selectedKeys} allVisibleSelected={props.interactions.allVisibleSelected} partiallySelected={props.interactions.partiallySelected} onToggleRow={props.interactions.toggleRow} onToggleAll={props.interactions.toggleAll} onRowClick={props.onRowClick} displayRows={props.displayRows} footerRows={hasFooter(props.valueColumns ?? []) ? (props.footerRows ?? props.filteredData) : undefined} locale={props.locale} renderExpanded={props.renderExpanded} onToggleExpand={props.toggleRow} onToggleGroup={props.toggleGroup} /> : <SarakTableGrid props={props} />}
                {props.filteredData.length === 0 && !props.loading && <div role="status" className="flex items-center justify-center text-center" style={{ padding: 'calc(var(--sarak-layout-gap-md,16px) * 5)' }}>{props.emptyMessage ?? <SarakDataEmpty />}</div>}
            </div>
        </div>
    );
};
