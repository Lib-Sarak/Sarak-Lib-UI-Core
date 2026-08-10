import React from 'react';
import { SarakButton } from '../Buttons/SarakButton';

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

const baseBtn = 'transition-colors';

/** Neutraliza o `font-black uppercase tracking-widest` + `rounded-btn`/`py-*px-*` que
 *  `SarakButton` aplica por padrão — `style` sempre vence a classe do átomo (R10 —
 *  lote 10), preservando o `min-w-9 h-9 px-3 rounded-md text-sm font-medium` original.
 *  Zero hardcode (R2): deriva de `--sarak-layout-gap-*`/`--sarak-btn-border-radius`, tokens reais. */
const pageBtnStyle: React.CSSProperties = {
    minWidth: 'calc(var(--sarak-layout-gap-md, 16px) * 2.25)',
    height: 'calc(var(--sarak-layout-gap-md, 16px) * 2.25)',
    paddingInline: 'calc(var(--sarak-layout-gap-sm, 8px) * 1.5)',
    paddingBlock: 0,
    borderRadius: 'calc(var(--sarak-btn-border-radius, 8px) * 0.75)',
    fontSize: 'calc(var(--sarak-layout-gap-md, 16px) * 0.875)',
    fontWeight: 500,
    textTransform: 'none',
    letterSpacing: 'normal',
};

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
        <nav className={`flex items-center ${className}`} style={{ gap: 'calc(var(--sarak-layout-gap-md, 16px) * 0.25)' }} aria-label="Paginação">
            <SarakButton
                variant="ghost"
                className={`${baseBtn} text-[var(--text-muted,#94a3b8)] hover:bg-[var(--color-theme-card,#1e293b)]`}
                style={pageBtnStyle}
                onClick={() => go(current - 1)}
                disabled={current <= 1}
                aria-label="Página anterior"
            >
                ‹
            </SarakButton>

            {tokens.map((token, index) =>
                token === 'ellipsis' ? (
                    <span
                        key={`ellipsis-${index}`}
                        className="min-w-9 h-9 inline-flex items-center justify-center text-[var(--text-muted,#94a3b8)] select-none"
                        aria-hidden="true"
                    >
                        …
                    </span>
                ) : (
                    <SarakButton
                        key={token}
                        variant="ghost"
                        aria-current={token === current ? 'page' : undefined}
                        className={`${baseBtn} ${
                            token === current
                                ? 'bg-[var(--sarak-primary-color,#3b82f6)] text-[var(--color-theme-card,#1e293b)]'
                                : 'text-[var(--text-muted,#94a3b8)] hover:bg-[var(--color-theme-card,#1e293b)]'
                        }`}
                        style={pageBtnStyle}
                        onClick={() => go(token)}
                    >
                        {token}
                    </SarakButton>
                ),
            )}

            <SarakButton
                variant="ghost"
                className={`${baseBtn} text-[var(--text-muted,#94a3b8)] hover:bg-[var(--color-theme-card,#1e293b)]`}
                style={pageBtnStyle}
                onClick={() => go(current + 1)}
                disabled={current >= total}
                aria-label="Próxima página"
            >
                ›
            </SarakButton>
        </nav>
    );
};
