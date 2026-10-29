import type { SarakDisplayRow } from './tableDisplayRows';
import type { SarakDataCardsProps } from './SarakDataCards';

/** As linhas visuais dos cartões: as recebidas, ou uma linha de dado simples por `rows` (comportamento da rc.3). */
export const cardItemsOf = <T,>(props: Pick<SarakDataCardsProps<T>, 'displayRows' | 'rows' | 'rowKeys' | 'rowIndexes' | 'getRowKey'>): Array<SarakDisplayRow<T>> =>
    props.displayRows ?? props.rows.map((row, index) => {
        const rowIndex = props.rowIndexes?.[index] ?? index;
        const key = props.rowKeys?.[index] ?? (props.getRowKey ? props.getRowKey(row, rowIndex) : index);
        return { kind: 'data', id: `row:${String(key)}`, entry: { row, index: rowIndex, key }, depth: 0, expandable: false, expanded: false, hasChildren: false };
    });
