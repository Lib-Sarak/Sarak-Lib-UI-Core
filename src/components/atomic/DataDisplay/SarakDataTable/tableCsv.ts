/**
 * Exportação CSV das tabelas — código próprio, sem dependência. O BOM UTF-8 e o `;` (quando o
 * locale usa vírgula decimal) fazem o arquivo abrir certo no Excel pt-BR.
 */

import type { SarakColumn } from './columnModel';
import {
    aggregateText,
    columnText,
    columnValue,
    hasFooter,
    sarakAggregate,
    toValueColumn,
} from './columnValue';
import type { SarakValueColumn } from './columnValue';
import type { SarakTableColumn } from '../../Templates/SarakTableProps';

const BOM = '﻿';
const LINE_BREAK = '\r\n';
/** Prefixos que Excel e LibreOffice executam como fórmula quando a célula é texto (lista da OWASP). */
const FORMULA_PREFIX = /^[=+\-@\t\r]/;

export interface SarakCsvOptions {
    /** Padrão: `;` quando o locale usa vírgula decimal (pt-BR), senão `,`. */
    separator?: ';' | ',';
    /** Padrão `true`: exporta o valor exibido (`format`); `false`: o valor bruto. */
    formatted?: boolean;
    /** Padrão `true` quando há agregação. */
    includeFooter?: boolean;
    /** Locale do formato e da escolha do separador; ausente = o do ambiente. */
    locale?: string;
}

type CsvColumn<T> = SarakColumn<T> | SarakTableColumn<T>;

const usesDecimalComma = (locale?: string): boolean => new Intl.NumberFormat(locale).format(1.1).includes(',');

const headerOf = <T,>(column: CsvColumn<T>): string => {
    if ('label' in column) return column.label;
    return typeof column.header === 'string' || typeof column.header === 'number' ? String(column.header) : column.id;
};

const rawText = (value: unknown): string => {
    if (value === null || value === undefined) return '';
    return value instanceof Date ? value.toISOString() : String(value);
};

const escapeCell = (text: string, separator: string, isText: boolean): string => {
    const safe = isText && FORMULA_PREFIX.test(text) ? `'${text}` : text;
    const needsQuotes = safe.includes(separator) || /["\r\n]/.test(safe);
    return needsQuotes ? `"${safe.replace(/"/g, '""')}"` : safe;
};

const footerCell = <T,>(rows: T[], column: SarakValueColumn<T>, formatted: boolean, locale?: string): string => {
    const value = sarakAggregate(rows, column);
    if (typeof column.footer === 'function') {
        const content = column.footer({ value, rows });
        return typeof content === 'string' || typeof content === 'number' ? String(content) : '';
    }
    if (typeof column.footer === 'string' || typeof column.footer === 'number') return String(column.footer);
    if (column.aggregate === undefined) return '';
    return formatted ? aggregateText(value, column, locale) : rawText(value);
};

/** Converte as linhas em CSV com BOM; o rodapé entra como última linha quando há agregação. */
export function sarakTableToCsv<T>(columns: CsvColumn<T>[], rows: T[], options: SarakCsvOptions = {}): string {
    const { formatted = true, locale } = options;
    const separator = options.separator ?? (usesDecimalComma(locale) ? ';' : ',');
    const valueColumns = columns.map((column) => toValueColumn<T>(column));
    const line = (cells: string[], textMask: boolean[]): string =>
        cells.map((cell, index) => escapeCell(cell, separator, textMask[index])).join(separator);
    const allText = valueColumns.map(() => true);
    const lines = [line(columns.map(headerOf), allText)];
    rows.forEach((row) => {
        const cells = valueColumns.map((column) => formatted ? columnText(row, column, locale) : rawText(columnValue(row, column)));
        const isText = valueColumns.map((column) => typeof columnValue(row, column) === 'string' && !(column.format && formatted));
        lines.push(line(cells, isText));
    });
    if ((options.includeFooter ?? true) && hasFooter(valueColumns)) {
        lines.push(line(valueColumns.map((column) => footerCell(rows, column, formatted, locale)), allText.map(() => false)));
    }
    return BOM + lines.join(LINE_BREAK);
}

/** Baixa o CSV como arquivo; só funciona no navegador. */
export function sarakDownloadCsv(filename: string, csv: string): void {
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
}
