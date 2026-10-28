import type { ReactElement } from 'react';
import { useLibraryText } from '../../../../core/i18n/useLibraryText';

const DEFAULT_SKELETON_ROWS = 8;

export interface SarakDataTableSkeletonProps {
    /** Linhas do esqueleto; padrão `8`. */
    rows?: number;
    /** Células por linha (o número de colunas da tabela). */
    columns: number;
    className?: string;
}

/** Esqueleto de carregamento no lugar do texto: `role="status"` com o texto só para leitor de tela. */
export const SarakDataTableSkeleton = ({ rows = DEFAULT_SKELETON_ROWS, columns, className }: SarakDataTableSkeletonProps): ReactElement => {
    const text = useLibraryText();
    return (
        <div role="status" aria-live="polite" aria-busy="true" data-sarak-skeleton="true" className={className}>
            <span className="sr-only">{text('spinnerLoading')}</span>
            {Array.from({ length: rows }, (_, row) => (
                <div key={row} aria-hidden="true" className="animate-pulse" style={{ display: 'flex', gap: 'var(--sarak-layout-gap-sm, 8px)', padding: 'var(--sarak-table-padding, 12px)' }}>
                    {Array.from({ length: Math.max(columns, 1) }, (__, cell) => (
                        <div key={cell} style={{ flex: 1, height: 'var(--sarak-layout-gap-md, 16px)', borderRadius: 'var(--sarak-skeleton-row-radius, 4px)', background: 'var(--sarak-table-header-bg, rgba(255, 255, 255, 0.03))' }} />
                    ))}
                </div>
            ))}
        </div>
    );
};
