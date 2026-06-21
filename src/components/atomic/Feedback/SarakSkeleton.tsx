/**
 * SarakSkeleton — placeholder MÍNIMO de carregamento (puxado sob demanda)
 *
 * ⚠️ MÍNIMO: estado `loading` da Fonte de Dados (Spec 31, Regra 2) enquanto a Spec 13
 * (Feedback/Skeletons completa) não chega. Apenas um bloco pulsante neutro, tokenizado
 * (Zero Hardcode: cores/raio via `var(--sx-*)`). Sem dependência de tema ou ícones.
 */

import React from 'react';

export interface SarakSkeletonProps {
    /** Número de linhas-fantasma a exibir (default: 3). */
    rows?: number;
    /** Altura de cada linha (default: `1rem`). */
    rowHeight?: string;
}

export const SarakSkeleton: React.FC<SarakSkeletonProps> = ({ rows = 3, rowHeight = '1rem' }) => {
    return (
        <div
            role="status"
            aria-busy="true"
            aria-live="polite"
            data-sarak-skeleton="true"
            className="flex flex-col gap-2 w-full"
        >
            {Array.from({ length: Math.max(1, rows) }, (_v, index) => (
                <div
                    key={index}
                    className="animate-pulse w-full"
                    style={{
                        height: rowHeight,
                        borderRadius: 'var(--sx-radius-sm, 4px)',
                        background: 'var(--sx-color-surface-muted, var(--sx-color-border-base, rgba(127,127,127,0.18)))',
                    }}
                />
            ))}
        </div>
    );
};
