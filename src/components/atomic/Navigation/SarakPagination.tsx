import React from 'react';
import { SarakButton } from '../Buttons/SarakButton';
import { useLibraryText } from '../../../core/i18n/useLibraryText';

/** Token de paginação: número de página ou marcador de reticências. */
export type SarakPaginationToken = number | 'ellipsis';

/**
 * Gera a lista de renderização numérica (Spec 14, Regra 4): início, miolo em torno
 * da página atual e final, inserindo `ellipsis` quando há corte. Função PURA —
 * testável isoladamente, sem DOM.
 */
export const sarakBuildPaginationRange = (
    current: number,
    total: number,
    maxVisible: number = 7,
): SarakPaginationToken[] => {
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

    const tokens: SarakPaginationToken[] = [first];
    if (start > first + 1) tokens.push('ellipsis');
    for (let page = start; page <= end; page += 1) tokens.push(page);
    if (end < last - 1) tokens.push('ellipsis');
    tokens.push(last);
    return tokens;
};

export interface SarakPaginationProps {
    /** Página atual (1-based). */
    current: number;
    /** Total de páginas, quando o total de itens e o tamanho não derivam o valor. */
    total?: number;
    /** Quantidade de registros por página. */
    pageSize?: number;
    /** Opções de quantidade de registros por página. */
    pageSizeOptions?: number[];
    /** Quantidade total de registros para os resumos e o cálculo de páginas. */
    totalItems?: number;
    /** Disparado ao escolher outra quantidade de registros por página. */
    onPageSizeChange?: (pageSize: number) => void;
    /** Máximo de botões numéricos antes de compactar com reticências (default: 7). */
    maxVisible?: number;
    /** Disparado ao escolher uma página válida (diferente da atual). */
    onChange: (page: number) => void;
    className?: string;
}

const baseBtn = 'transition-colors';
const PAGE_BUTTON_FONT_WEIGHT = 500;

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
    fontWeight: PAGE_BUTTON_FONT_WEIGHT,
    textTransform: 'none',
    letterSpacing: 'normal',
};

interface PaginationView {
    currentPage: number;
    totalPages: number;
    tokens: SarakPaginationToken[];
    pageSize?: number;
    pageSizeOptions: number[];
    rangeStart: number;
    rangeEnd: number;
    totalItems?: number;
}

const createPaginationView = ({
    current,
    total,
    maxVisible = 7,
    pageSize,
    pageSizeOptions = [],
    totalItems,
}: SarakPaginationProps): PaginationView => {
    const hasValidPageSize = pageSize !== undefined && Number.isInteger(pageSize) && pageSize > 0;
    const hasValidTotalItems = totalItems !== undefined && Number.isInteger(totalItems) && totalItems >= 0;
    const totalPages = hasValidPageSize && hasValidTotalItems ? Math.ceil(totalItems / pageSize) : total ?? 0;
    const currentPage = Math.min(Math.max(current, 1), Math.max(totalPages, 1));
    const validOptions = Array.from(new Set(pageSizeOptions.filter((option) => Number.isInteger(option) && option > 0)));

    return {
        currentPage,
        totalPages,
        tokens: sarakBuildPaginationRange(currentPage, totalPages, maxVisible),
        pageSize: hasValidPageSize ? pageSize : undefined,
        pageSizeOptions: validOptions,
        rangeStart: totalItems === 0 ? 0 : (currentPage - 1) * (hasValidPageSize ? pageSize : 1) + 1,
        rangeEnd: Math.min(currentPage * (hasValidPageSize ? pageSize : 1), hasValidTotalItems ? totalItems : 0),
        totalItems: hasValidTotalItems ? totalItems : undefined,
    };
};

interface PaginationControlsProps {
    view: PaginationView;
    text: ReturnType<typeof useLibraryText>;
    onChange: (page: number) => void;
}

const changePage = (view: PaginationView, onChange: (page: number) => void, page: number): void => {
    if (page >= 1 && page <= view.totalPages && page !== view.currentPage) onChange(page);
};

interface PaginationEdgeButtonProps extends PaginationControlsProps {
    direction: 'previous' | 'next';
}

const PaginationEdgeButton = ({ view, text, onChange, direction }: PaginationEdgeButtonProps): React.ReactElement => {
    const previous = direction === 'previous';
    const label = text(previous ? 'paginationPrevAriaLabel' : 'paginationNextAriaLabel');
    const page = view.currentPage + (previous ? -1 : 1);
    const disabled = previous ? view.currentPage <= 1 : view.currentPage >= view.totalPages;
    return <SarakButton variant="ghost" className={`${baseBtn} text-[var(--text-muted,#94a3b8)] hover:bg-[var(--color-theme-card,#1e293b)]`} style={pageBtnStyle} onClick={() => changePage(view, onChange, page)} disabled={disabled} aria-label={label}>{previous ? '‹' : '›'}</SarakButton>;
};

interface PaginationNumberButtonProps extends PaginationControlsProps {
    token: SarakPaginationToken;
}

const PaginationNumberButton = ({ view, text, onChange, token }: PaginationNumberButtonProps): React.ReactElement => {
    if (token === 'ellipsis') return <span className="min-w-9 h-9 inline-flex items-center justify-center text-[var(--text-muted,#94a3b8)] select-none" aria-hidden="true">…</span>;
    const isCurrent = token === view.currentPage;
    const className = isCurrent
        ? `${baseBtn} bg-[var(--sarak-primary-color,#3b82f6)] text-[var(--color-theme-card,#1e293b)]`
        : `${baseBtn} text-[var(--text-muted,#94a3b8)] hover:bg-[var(--color-theme-card,#1e293b)]`;
    return <SarakButton variant="ghost" aria-current={isCurrent ? 'page' : undefined} className={className} style={pageBtnStyle} onClick={() => changePage(view, onChange, token)}>{token}</SarakButton>;
};

const PaginationControls = ({ view, text, onChange }: PaginationControlsProps): React.ReactElement => (
    <nav className="flex items-center" style={{ gap: 'calc(var(--sarak-layout-gap-md, 16px) * 0.25)' }} aria-label={text('paginationAriaLabel')}>
        <PaginationEdgeButton view={view} text={text} onChange={onChange} direction="previous" />
        {view.tokens.map((token, index) => <PaginationNumberButton key={token === 'ellipsis' ? `ellipsis-${index}` : token} view={view} text={text} onChange={onChange} token={token} />)}
        <PaginationEdgeButton view={view} text={text} onChange={onChange} direction="next" />
    </nav>
);

const PaginationSummary = ({ view, text }: Pick<PaginationControlsProps, 'view' | 'text'>): React.ReactElement | null => {
    if (view.totalItems === undefined || view.pageSize === undefined) return null;
    return (
        <span aria-live="polite" className="text-theme-muted text-xs">
            {text('paginationRangeSummary', { start: view.rangeStart, end: view.rangeEnd, total: view.totalItems })}
            {' · '}
            {text('paginationPageSummary', { current: view.currentPage, total: view.totalPages })}
        </span>
    );
};

const PaginationPageSizeOptions = ({ view, onPageSizeChange, text }: {
    view: PaginationView;
    onPageSizeChange?: (pageSize: number) => void;
    text: ReturnType<typeof useLibraryText>;
}): React.ReactElement | null => {
    if (view.pageSize === undefined || view.pageSizeOptions.length === 0 || !onPageSizeChange) return null;
    return (
        <div
            role="group"
            aria-label={text('paginationPageSizeLabel')}
            className="flex items-center"
            style={{ gap: 'var(--sarak-layout-gap-sm,8px)' }}
        >
            {view.pageSizeOptions.map((option) => (
                <SarakButton
                    key={option}
                    type="button"
                    variant="ghost"
                    style={pageBtnStyle}
                    aria-pressed={option === view.pageSize}
                    onClick={() => option !== view.pageSize && onPageSizeChange(option)}
                >
                    {option}
                </SarakButton>
            ))}
        </div>
    );
};

/** Controles de página, resumo de resultados e opções de tamanho. */
export const SarakPagination = (props: SarakPaginationProps): React.ReactElement => {
    const text = useLibraryText();
    const view = createPaginationView(props);
    return (
        <div
            className={`flex items-center ${props.className ?? ''}`}
            style={{ gap: 'calc(var(--sarak-layout-gap-md,16px) * 0.5)' }}
        >
            <PaginationControls view={view} text={text} onChange={props.onChange} />
            <PaginationSummary view={view} text={text} />
            <PaginationPageSizeOptions view={view} onPageSizeChange={props.onPageSizeChange} text={text} />
        </div>
    );
};
