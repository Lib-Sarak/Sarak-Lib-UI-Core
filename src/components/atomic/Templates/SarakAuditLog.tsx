import React, { Suspense, useMemo } from 'react';
import { useLibraryText } from '../../../core/i18n/useLibraryText';
import { SarakInput } from '../Inputs/SarakInput';
import { SarakSelect } from '../Inputs/SarakSelect';
import { SarakSkeleton } from '../Feedback/SarakSkeleton';
import { SarakFlex } from '../Layouts/SarakFlex';
import { SarakPagination } from '../Navigation/SarakPagination';
import { SarakDataTable } from '../DataDisplay/SarakDataTable';
import type { SarakColumn, SarakDataTableProps } from '../DataDisplay/SarakDataTable';
import { mergeSarakClasses } from '../hooks/mergeSarakClasses';
import { useSystemFormat, type SarakSystemTimestamp } from './hooks/useSystemFormat';

export interface SarakAuditEntry {
    id: string;
    /** Quem agiu. */
    actor: string;
    /** O que fez. */
    action: string;
    /** Sobre o quê. */
    target: string;
    at: SarakSystemTimestamp;
    /** Conteúdo da linha expandida: valores antes e depois, IP, origem. Sem ele, a linha não expande. */
    detail?: React.ReactNode;
}

export interface SarakAuditFilters {
    query?: string;
    actor?: string;
    action?: string;
}

export interface SarakAuditLogProps {
    entries: SarakAuditEntry[];
    /** Filtros em vigor (controlado). Com `onFiltersChange`, a lib mostra os campos de filtro. */
    filters?: SarakAuditFilters;
    onFiltersChange?: (filters: SarakAuditFilters) => void;
    /** Atores e ações oferecidos nos filtros; sem a lista, o filtro correspondente não aparece. */
    actors?: string[];
    actions?: string[];
    /** Paginação do servidor: página atual (1-based), tamanho e total. Sem `onPageChange`, não há paginação. */
    page?: number;
    pageSize?: number;
    totalItems?: number;
    onPageChange?: (page: number) => void;
    loading?: boolean;
    error?: string | null;
    onRetry?: () => void;
    className?: string;
}

// O `lazy` perde o parâmetro genérico no JSX; o cast devolve a linha tipada, e o `Suspense` abaixo segue valendo.
const AuditTable = SarakDataTable as unknown as (props: SarakDataTableProps<SarakAuditEntry>) => React.ReactElement;

const optionsFor =(values: string[], allLabel: string): Array<{ label: string; value: string }> =>
    [{ label: allLabel, value: '' }, ...values.map((value) => ({ label: value, value }))];

/**
 * Visor de auditoria: ator, ação, alvo e data, com filtros e paginação por props e detalhe expansível.
 * Compõe `SarakDataTable` (carregada sob demanda). Apresentacional: o servidor filtra e pagina, a lib só desenha.
 */
export const SarakAuditLog = ({
    entries, filters = {}, onFiltersChange, actors, actions, page = 1, pageSize, totalItems, onPageChange, loading, error, onRetry, className,
}: SarakAuditLogProps): React.ReactElement => {
    const text = useLibraryText();
    const format = useSystemFormat();
    const columns = useMemo<Array<SarakColumn<SarakAuditEntry>>>(() => [
        { id: 'actor', header: text('auditActor') },
        { id: 'action', header: text('auditAction') },
        { id: 'target', header: text('auditTarget') },
        {
            id: 'at',
            header: text('auditDate'),
            render: (entry) => {
                const parsed = new Date(entry.at);
                // Data inválida não pode derrubar o visor: sem `dateTime` válido, a célula mostra só o texto.
                return <time dateTime={Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString()}>{format.dateTime(entry.at)}</time>;
            },
        },
    ], [text, format]);
    const change = (patch: SarakAuditFilters): void => onFiltersChange?.({ ...filters, ...patch });
    const hasDetail = entries.some((entry) => entry.detail !== undefined);
    const pages = pageSize && totalItems ? Math.max(1, Math.ceil(totalItems / pageSize)) : undefined;

    return (
        <div className={mergeSarakClasses('sarak-audit-log @container w-full', className)} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 'var(--sarak-layout-gap-md, 16px)' }}>
            {onFiltersChange && (
                <SarakFlex align="flex-end" gap="spacing-md">
                    <SarakInput label={text('auditSearch')} type="search" value={filters.query ?? ''} onChange={(event) => change({ query: event.target.value })} />
                    {actors && <SarakSelect label={text('auditFilterActor')} value={filters.actor ?? ''} options={optionsFor(actors, text('filterSelectAll'))} onChange={(event) => change({ actor: event.target.value })} />}
                    {actions && <SarakSelect label={text('auditFilterAction')} value={filters.action ?? ''} options={optionsFor(actions, text('filterSelectAll'))} onChange={(event) => change({ action: event.target.value })} />}
                </SarakFlex>
            )}
            <Suspense fallback={<SarakSkeleton rows={4} />}>
                <AuditTable
                    columns={columns}
                    rows={entries}
                    getRowKey={(entry) => entry.id}
                    density="report"
                    loading={loading}
                    error={error}
                    onRetry={onRetry}
                    emptyMessage={text('auditEmpty')}
                    renderExpanded={hasDetail ? (entry) => entry.detail ?? null : undefined}
                />
            </Suspense>
            {onPageChange && pages !== undefined && pages > 1 && (
                <SarakPagination current={page} total={pages} pageSize={pageSize} totalItems={totalItems} onChange={onPageChange} />
            )}
        </div>
    );
};
