import React from 'react';

/** Token de paginação: número de página ou marcador de reticências. */
export type PaginationToken = number | 'ellipsis';

/**
 * Gera a lista de renderização numérica (Spec 14, Regra 4): início, miolo em torno
 * da página atual e final, inserindo `ellipsis` quando há corte. Função PURA —
 * testável isoladamente, sem DOM.
 */
export const buildPaginationRange = (
    current: number,
    total: number,
    maxVisible = 7,
): PaginationToken[] => {
    if (total <= 0) return [];
    const clamped = Math.min(Math.max(current, 1), total);
    if (total <= maxVisible) {
        return Array.from({ length: total }, (_, i) => i + 1);
    }
    const siblings = 1;
    const first = 1;
    const last = total;
    const start = Math.max(clamped - siblings, first + 1);
    const end = Math.min(clamped + siblings, last - 1);

    const tokens: PaginationToken[] = [first];
    if (start > first + 1) tokens.push('ellipsis');
    for (let page = start; page <= end; page += 1) tokens.push(page);
    if (end < last - 1) tokens.push('ellipsis');
    tokens.push(last);
    return tokens;
};

export interface SarakPaginationProps {
    /** Página atual (1-based). */
    current: number;
    /** Total de páginas. */
    total: number;
    /** Máximo de botões numéricos antes de compactar com reticências (default: 7). */
    maxVisible?: number;
    /** Disparado ao escolher uma página válida (diferente da atual). */
    onChange: (page: number) => void;
    className?: string;
}

const baseBtn =
    'min-w-9 h-9 px-3 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed';

/** Controles `< 1 2 … 5 >` respeitando o design base da Sarak (Spec 14, Regra 4). */
export const SarakPagination: React.FC<SarakPaginationProps> = ({
    current,
    total,
    maxVisible = 7,
    onChange,
    className = '',
}) => {
    const tokens = buildPaginationRange(current, total, maxVisible);
    const go = (page: number) => {
        if (page >= 1 && page <= total && page !== current) onChange(page);
    };

    return (
        <nav className={`flex items-center gap-1 ${className}`} aria-label="Paginação">
            <button
                type="button"
                className={`${baseBtn} text-[var(--sx-color-text-muted)] hover:bg-[var(--sx-color-surface-base)]`}
                onClick={() => go(current - 1)}
                disabled={current <= 1}
                aria-label="Página anterior"
            >
                ‹
            </button>

            {tokens.map((token, index) =>
                token === 'ellipsis' ? (
                    <span
                        key={`ellipsis-${index}`}
                        className="min-w-9 h-9 inline-flex items-center justify-center text-[var(--sx-color-text-muted)] select-none"
                        aria-hidden="true"
                    >
                        …
                    </span>
                ) : (
                    <button
                        key={token}
                        type="button"
                        aria-current={token === current ? 'page' : undefined}
                        className={`${baseBtn} ${
                            token === current
                                ? 'bg-[var(--sx-color-primary-base)] text-[var(--sx-color-surface-base)]'
                                : 'text-[var(--sx-color-text-muted)] hover:bg-[var(--sx-color-surface-base)]'
                        }`}
                        onClick={() => go(token)}
                    >
                        {token}
                    </button>
                ),
            )}

            <button
                type="button"
                className={`${baseBtn} text-[var(--sx-color-text-muted)] hover:bg-[var(--sx-color-surface-base)]`}
                onClick={() => go(current + 1)}
                disabled={current >= total}
                aria-label="Próxima página"
            >
                ›
            </button>
        </nav>
    );
};
