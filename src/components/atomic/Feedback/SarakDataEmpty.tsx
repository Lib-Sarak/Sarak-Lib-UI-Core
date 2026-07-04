/**
 * SarakDataEmpty — placeholder MÍNIMO de "sem dados" (puxado sob demanda)
 *
 * ⚠️ MÍNIMO: estado `empty` da Fonte de Dados (Spec 31, Regra 2). Mensagem neutra e
 * tokenizada — distinto do `SarakEmptyState` (peça de branding de viewport vazio).
 * A UX completa de Empty States chega na Spec 13.
 */

import React from 'react';

export interface SarakDataEmptyProps {
    /** Mensagem exibida (default: "Nenhum dado encontrado."). */
    message?: string;
}

export const SarakDataEmpty: React.FC<SarakDataEmptyProps> = ({
    message = 'Nenhum dado encontrado.',
}) => {
    return (
        <div
            role="status"
            data-sarak-data-empty="true"
            className="flex items-center justify-center w-full text-sm"
            style={{ color: 'var(--text-muted,#94a3b8))', paddingBlock: 'var(--sarak-layout-gap-lg, 24px)' }}
        >
            {message}
        </div>
    );
};
