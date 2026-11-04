import type { CSSProperties, ReactElement } from 'react';
import { useLibraryText } from '../../../../core/i18n/useLibraryText';
import { SarakIconButton } from '../../Buttons/SarakIconButton';
import { SarakIcon } from '../../Icon/SarakIcon';
import { SarakCheckbox } from '../../Inputs/SarakCheckbox';
import { SarakModal } from '../../Modals/SarakModal';
import type { SarakColumn } from './columnModel';
import type { DataTableColumns } from './useDataTableColumns';

export interface SarakTableColumnPanelProps<T> {
    columns: DataTableColumns<T>;
    onClose: () => void;
}

const ICON_SIZE = 16;
const LIST_STYLE: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 'calc(var(--sarak-layout-gap-sm, 8px) * 0.5)', listStyle: 'none', margin: 0, padding: 0 };
const ITEM_STYLE: CSSProperties = { display: 'flex', alignItems: 'center', gap: 'var(--sarak-layout-gap-sm, 8px)' };

const labelOf = <T,>(column: SarakColumn<T>): string => (typeof column.header === 'string' ? column.header : column.id);

/** Sem `disabled` nas pontas: o botão continua com o foco de quem acabou de mover a coluna até o limite. */
const MoveButton = ({ label, icon, atEdge, onMove }: { label: string; icon: string; atEdge: boolean; onMove: () => void }): ReactElement => (
    <SarakIconButton type="button" variant="ghost" size="xs" aria-label={label} aria-disabled={atEdge || undefined} icon={<SarakIcon name={icon} size={ICON_SIZE} />} onClick={onMove} />
);

/** Painel de colunas: esconder e mover, tudo por teclado; a última coluna visível não se esconde. */
export const SarakTableColumnPanel = <T,>({ columns, onClose }: SarakTableColumnPanelProps<T>): ReactElement => {
    const text = useLibraryText();
    const { allColumns, ordered } = columns;
    const hidden = new Set(columns.state.hidden ?? []);
    return (
        <SarakModal isOpen onClose={onClose} title={text('tableColumns')}>
            <ul data-sarak-column-panel="true" style={LIST_STYLE}>
                {allColumns.map((column, index) => {
                    const name = labelOf(column);
                    const visible = !hidden.has(column.id);
                    return (
                        <li key={column.id} data-column-option={column.id} style={ITEM_STYLE}>
                            <span style={{ flex: 1, minWidth: 0 }}>
                                <SarakCheckbox label={name} aria-label={text('tableColumnShow', { column: name })} checked={visible} disabled={visible && ordered.length === 1} onChange={() => columns.toggleHidden(column.id)} />
                            </span>
                            <MoveButton label={text('tableColumnMoveUp', { column: name })} icon="ArrowUp" atEdge={index === 0} onMove={() => columns.moveColumn(column.id, -1)} />
                            <MoveButton label={text('tableColumnMoveDown', { column: name })} icon="ArrowDown" atEdge={index === allColumns.length - 1} onMove={() => columns.moveColumn(column.id, 1)} />
                        </li>
                    );
                })}
            </ul>
        </SarakModal>
    );
};
