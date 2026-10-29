import type { ReactElement } from 'react';
import { useLibraryText } from '../../../../core/i18n/useLibraryText';
import { SarakButton } from '../../Buttons/SarakButton';
import { SarakIconButton } from '../../Buttons/SarakIconButton';
import { SarakIcon } from '../../Icon/SarakIcon';
import type { TableInteractionsResult } from './useTableInteractions';

export interface SarakExpandToggleProps {
    expanded: boolean;
    /** Nome acessível já resolvido (ex.: "Expandir linha"). */
    label: string;
    onToggle: () => void;
}

/** Botão de expandir/recolher — o estado vai em `aria-expanded`, o nome no `aria-label`. */
export const SarakExpandToggle = ({ expanded, label, onToggle }: SarakExpandToggleProps): ReactElement => (
    <SarakIconButton
        type="button"
        variant="ghost"
        size="xs"
        aria-expanded={expanded}
        aria-label={label}
        draggable={false}
        icon={<SarakIcon name={expanded ? 'ChevronDown' : 'ChevronRight'} size={16} />}
        onClick={(event) => {
            event.stopPropagation();
            onToggle();
        }}
    />
);

export type SarakSelectAllBannerProps = Pick<TableInteractionsResult<unknown>, 'canSelectAllTotal' | 'selectAll' | 'totalCount' | 'selectAllTotal' | 'clearSelection'>;

/**
 * Aviso do "todos os N do servidor": com a página inteira marcada e mais itens no servidor, oferece
 * selecionar todos; com o modo ligado, informa e oferece limpar.
 */
export const SarakSelectAllBanner = ({ canSelectAllTotal, selectAll, totalCount, selectAllTotal, clearSelection }: SarakSelectAllBannerProps): ReactElement | null => {
    const text = useLibraryText();
    if (totalCount === undefined || (!canSelectAllTotal && !selectAll)) return null;
    const action = selectAll ? clearSelection : selectAllTotal;
    return (
        <div role="status" className="flex items-center" style={{ gap: 'var(--sarak-layout-gap-sm, 8px)', padding: 'var(--sarak-layout-gap-sm, 8px) var(--sarak-table-padding, 12px)' }}>
            {selectAll && <span>{text('tableAllSelected', { total: totalCount })}</span>}
            <SarakButton type="button" variant="ghost" size="xs" onClick={action}>
                {selectAll ? text('tableClearSelection') : text('tableSelectAllTotal', { total: totalCount })}
            </SarakButton>
        </div>
    );
};
