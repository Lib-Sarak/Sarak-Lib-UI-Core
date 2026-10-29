import React from 'react';
import { sarakTabElementId, sarakTabPanelElementId } from './tabIds';

export interface SarakTabPanelProps {
    /** `id` da aba (`SarakTabItem.id`) a que este painel pertence. */
    tabId: string;
    /** O mesmo `idPrefix` passado ao `SarakTabs`; é o que casa `aria-controls` e `aria-labelledby`. */
    idPrefix: string;
    children: React.ReactNode;
}

/**
 * Painel ligado a uma aba: `role="tabpanel"`, `id` igual ao `aria-controls` da aba e
 * `aria-labelledby` apontando para ela. Renderize só o painel da aba ativa.
 */
export const SarakTabPanel: React.FC<SarakTabPanelProps> = ({
    tabId,
    idPrefix,
    children,
}) => (
    <div
        role="tabpanel"
        id={sarakTabPanelElementId(idPrefix, tabId)}
        aria-labelledby={sarakTabElementId(idPrefix, tabId)}
        tabIndex={0}
    >
        {children}
    </div>
);
