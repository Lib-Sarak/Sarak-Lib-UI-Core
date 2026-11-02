import type { CSSProperties, Key, ReactElement, ReactNode } from 'react';
import { useLibraryText } from '../../../../core/i18n/useLibraryText';
import { SarakButton } from '../../Buttons/SarakButton';
import { useOverlay } from '../../Modals/SarakOverlayProvider';
import type { DataTableInteractionsResult } from './useTableInteractions';

/** Alcance da seleção: com `all`, a ação vale para todos do servidor, menos `exceptKeys`. */
export interface SarakTableBulkScope {
    all: boolean;
    exceptKeys: Key[];
}

export interface SarakTableBulkAction {
    label: string;
    icon?: ReactNode;
    /** `danger` usa o botão de perigo e pede confirmação antes de agir. */
    tone?: 'default' | 'danger';
    /** `ids` traz as chaves selecionadas; no modo "todos os N", olhe `scope`. */
    onAction: (ids: Key[], scope: SarakTableBulkScope) => void;
}

export interface SarakTableBulkBarProps {
    actions?: SarakTableBulkAction[];
    interactions: Pick<DataTableInteractionsResult<unknown>, 'selectedKeys' | 'selectedCount' | 'exceptKeys' | 'selectAll' | 'clearSelection'>;
}

const BAR_STYLE: CSSProperties = {
    display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--sarak-layout-gap-sm, 8px)',
    padding: 'var(--sarak-layout-gap-sm, 8px) var(--sarak-table-padding, 12px)',
    color: 'var(--sarak-text-main, #f2f6fb)',
};

/** Barra de ações em lote: aparece com a seleção, na tabela e nos cartões. */
export const SarakTableBulkBar = ({ actions, interactions }: SarakTableBulkBarProps): ReactElement | null => {
    const text = useLibraryText();
    const overlay = useOverlay();
    const count = interactions.selectedCount;
    if (!actions?.length || count === 0) return null;
    const run = async (action: SarakTableBulkAction): Promise<void> => {
        if (action.tone === 'danger') {
            const confirmed = await overlay.confirm({ title: action.label, message: text('tableBulkConfirm', { count }), tone: 'danger', confirmLabel: action.label });
            if (!confirmed) return;
        }
        action.onAction(Array.from(interactions.selectedKeys), { all: interactions.selectAll === true, exceptKeys: interactions.exceptKeys });
    };
    return (
        <div role="toolbar" aria-label={text('tableBulkActions')} data-sarak-bulk-bar="true" data-sarak-no-print="true" style={BAR_STYLE}>
            <span role="status">{text('tableBulkCount', { count })}</span>
            {actions.map((action) => (
                <SarakButton key={action.label} type="button" size="xs" variant={action.tone === 'danger' ? 'danger' : 'secondary'} leftIcon={action.icon} onClick={() => void run(action)}>{action.label}</SarakButton>
            ))}
            <SarakButton type="button" size="xs" variant="ghost" onClick={interactions.clearSelection}>{text('tableClearSelection')}</SarakButton>
        </div>
    );
};
