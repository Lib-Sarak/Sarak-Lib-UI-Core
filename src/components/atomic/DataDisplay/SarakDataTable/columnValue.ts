/**
 * Valor, texto, ordem, busca e agregação de uma coluna — lógica pura compartilhada pelas duas
 * tabelas públicas (`SarakDataTable` e `SarakTable`), para as APIs de coluna não divergirem.
 */

import type { ReactNode } from 'react';
import { sarakFormatCurrency, sarakFormatDate, sarakFormatNumber, sarakFormatPercent } from '../../../../shared/format';
import type { SarakValueFormat } from '../../../../shared/format';

export type SarakAggregate<T> = 'sum' | 'avg' | 'count' | 'min' | 'max'
    | ((values: unknown[], rows: T[]) => unknown);

export interface SarakColumnFooterContext<T> {
    value: unknown;
    rows: T[];
}

/** O bloco de valor que `SarakColumn<T>` (DataTable) e `SarakTableColumn<T>` (Table) compartilham. */
export interface SarakColumnValueOptions<T> {
    /** Lê o valor da linha; ausente = `row[id]` (DataTable) / `row[key]` (Table). */
    accessor?: (row: T) => unknown;
    /** Formato do valor; numérico com formato alinha à direita e usa `tabular-nums`. */
    format?: SarakValueFormat;
    /** Exibe o controle de ordenação. DataTable: `false`; Table: `true`. */
    sortable?: boolean;
    /** Valor usado na ordem; ausente = o valor de `accessor` (bruto, não o texto formatado). */
    sortValue?: (row: T) => unknown;
    /** Texto usado na busca; ausente = o texto exibido (com `format`). */
    searchValue?: (row: T) => string;
    /** Agregação do rodapé (e do subtotal de grupo). */
    aggregate?: SarakAggregate<T>;
    /** Conteúdo do rodapé; ausente com `aggregate` = o agregado formatado. */
    footer?: ReactNode | ((ctx: SarakColumnFooterContext<T>) => ReactNode);
    /** `true` → `th scope="row"` (Table) / `role="rowheader"` (DataTable). */
    rowHeader?: boolean;
    /** Quantas colunas a célula cobre naquela linha; as cobertas não são renderizadas. */
    colSpan?: (row: T) => number | undefined;
}

/** A coluna já normalizada: `id` único, venha de `SarakColumn.id` ou de `SarakTableColumn.key`. */
export interface SarakValueColumn<T> extends SarakColumnValueOptions<T> {
    id: string;
}

type SarakColumnLike<T> = SarakColumnValueOptions<T> & ({ id: string } | { key: string });

export const columnIdOf = <T,>(column: SarakColumnLike<T>): string =>
    'id' in column ? column.id : column.key;

export const toValueColumn = <T,>(column: SarakColumnLike<T>): SarakValueColumn<T> => ({ ...column, id: columnIdOf(column) });

export const columnValue = <T,>(row: T, column: SarakValueColumn<T>): unknown =>
    column.accessor ? column.accessor(row) : (row as Record<string, unknown>)[column.id];

const toNumber = (value: unknown): number | null => {
    if (typeof value === 'number') return Number.isFinite(value) ? value : null;
    if (typeof value === 'string' && value.trim() !== '' && Number.isFinite(Number(value))) return Number(value);
    return null;
};

/** Formata pelo `SarakValueFormat`; sem formato, o mesmo `String(value ?? '')` da rc.3. */
export const formatByValueFormat = (value: unknown, format: SarakValueFormat | undefined, locale?: string): string => {
    if (value === null || value === undefined) return '';
    if (!format) return String(value);
    if (format.type === 'date') {
        return sarakFormatDate(value instanceof Date || typeof value === 'string' || typeof value === 'number' ? value : null, locale, format.options);
    }
    const numeric = toNumber(value);
    if (numeric === null) return String(value);
    if (format.type === 'currency') return sarakFormatCurrency(numeric, format.currency, locale);
    if (format.type === 'percent') return sarakFormatPercent(numeric, locale, format.options);
    return sarakFormatNumber(numeric, locale, format.options);
};

export const isNumericFormat = (format: SarakValueFormat | undefined): boolean =>
    format?.type === 'number' || format?.type === 'currency' || format?.type === 'percent';

/** Alinhamento efetivo: o declarado, ou à direita quando a coluna é numérica com formato. */
export const columnAlign = <T,>(column: SarakValueColumn<T> & { align?: 'left' | 'center' | 'right' }): 'left' | 'center' | 'right' =>
    column.align ?? (isNumericFormat(column.format) ? 'right' : 'left');

export const columnText = <T,>(row: T, column: SarakValueColumn<T>, locale?: string): string =>
    formatByValueFormat(columnValue(row, column), column.format, locale);

export const columnSortValue = <T,>(row: T, column: SarakValueColumn<T>): unknown =>
    column.sortValue ? column.sortValue(row) : columnValue(row, column);

export const columnSearchText = <T,>(row: T, column: SarakValueColumn<T>, locale?: string): string =>
    column.searchValue ? column.searchValue(row) : columnText(row, column, locale);

const numbersOf = (values: unknown[]): number[] =>
    values.map(toNumber).filter((value): value is number => value !== null);

const reduceBuiltIn = (kind: 'sum' | 'avg' | 'count' | 'min' | 'max', values: unknown[]): unknown => {
    if (kind === 'count') return values.filter((value) => value !== null && value !== undefined && value !== '').length;
    const numbers = numbersOf(values);
    if (kind === 'sum') return numbers.reduce((total, value) => total + value, 0);
    if (numbers.length === 0) return undefined;
    if (kind === 'avg') return numbers.reduce((total, value) => total + value, 0) / numbers.length;
    return kind === 'min' ? Math.min(...numbers) : Math.max(...numbers);
};

/** Agrega a coluna sobre as linhas — o mesmo cálculo do rodapé, reaproveitável fora da tabela. */
export function sarakAggregate<T>(rows: T[], column: SarakColumnLike<T>): unknown {
    const valueColumn = toValueColumn(column);
    const { aggregate } = valueColumn;
    if (!aggregate) return undefined;
    const values = rows.map((row) => columnValue(row, valueColumn));
    return typeof aggregate === 'function' ? aggregate(values, rows) : reduceBuiltIn(aggregate, values);
}

/** Texto do agregado: `count` é contagem (nunca moeda); os demais seguem o `format` da coluna. */
export const aggregateText = <T,>(value: unknown, column: SarakValueColumn<T>, locale?: string): string => {
    if (value === null || value === undefined) return '';
    if (column.aggregate === 'count') return sarakFormatNumber(toNumber(value), locale);
    if (column.format) return formatByValueFormat(value, column.format, locale);
    return typeof value === 'number' ? sarakFormatNumber(value, locale, { maximumFractionDigits: 6 }) : String(value);
};

export const hasFooter = <T,>(columns: Array<SarakValueColumn<T>>): boolean =>
    columns.some((column) => column.aggregate !== undefined || column.footer !== undefined);

/** Conteúdo da célula de rodapé/subtotal de uma coluna sobre `rows`; `null` quando a coluna não tem nenhum. */
export const footerContent = <T,>(rows: T[], column: SarakValueColumn<T>, locale?: string): ReactNode => {
    const value = sarakAggregate(rows, column);
    if (typeof column.footer === 'function') return column.footer({ value, rows });
    if (column.footer !== undefined) return column.footer;
    if (column.aggregate === undefined) return null;
    return aggregateText(value, column, locale);
};
