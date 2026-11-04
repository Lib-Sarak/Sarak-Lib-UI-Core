/**
 * Exportação Excel (.xlsx) das tabelas, ao lado da CSV. O escritor de planilha (`xlsxFile.ts`) é código próprio
 * e só é carregado no clique de exportar: a tabela não paga peso por ele. Respeita o formato e a moeda da coluna
 * (o texto exibido), as colunas visíveis e a ordem do `columnState`, e bloqueia fórmula vinda de dado: texto que
 * começa com `=`, `+`, `-`, `@`, tab ou CR sai com `'` na frente, como na CSV.
 */

import type { SarakColumnState } from './tableColumnState';
import { resolveColumnOrder } from './tableColumnState';
import { aggregateText, columnText, columnValue, hasFooter, sarakAggregate, toValueColumn } from './columnValue';
import type { SarakValueColumn } from './columnValue';
import type { SarakCsvColumn } from './tableCsv';
import type { XlsxCell } from './xlsxFile';

/** Prefixos que Excel e LibreOffice executam como fórmula quando a célula é texto (lista da OWASP). */
const FORMULA_PREFIX = /^[=+\-@\t\r]/;
export const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

export interface SarakXlsxOptions {
    /** Nome do arquivo ao baixar. Omitido, `table.xlsx`. */
    filename?: string;
    /** Nome da aba. Omitido, `Sheet1`. */
    sheetName?: string;
    /** Padrão `true`: o valor exibido (`format`, moeda); `false`: o valor bruto, com número como número. */
    formatted?: boolean;
    /** Padrão `true` quando há agregação. */
    includeFooter?: boolean;
    /** Colunas escondidas e ordem do usuário: só as visíveis saem, na ordem dele. */
    columnState?: SarakColumnState;
    /** Locale do formato; ausente = o do ambiente. */
    locale?: string;
}

const idOf = <T,>(column: SarakCsvColumn<T>): string => ('id' in column ? column.id : column.key);

const headerOf = <T,>(column: SarakCsvColumn<T>): string => {
    if ('label' in column) return column.label;
    return typeof column.header === 'string' || typeof column.header === 'number' ? String(column.header) : column.id;
};

/** As colunas que saem: sem as escondidas, na ordem do estado. */
export function visibleColumns<T>(columns: SarakCsvColumn<T>[], state?: SarakColumnState): SarakCsvColumn<T>[] {
    const hidden = new Set(state?.hidden ?? []);
    const order = resolveColumnOrder(columns.map(idOf), state?.order);
    return order.filter((id) => !hidden.has(id)).map((id) => columns.find((column) => idOf(column) === id)!);
}

/** Texto de dado nunca começa como fórmula. */
const neutralize = (text: string): string => (FORMULA_PREFIX.test(text) ? `'${text}` : text);

function dataCell<T>(row: T, column: SarakValueColumn<T>, formatted: boolean, locale?: string): XlsxCell {
    const raw = columnValue(row, column);
    if (raw === null || raw === undefined) return null;
    if (formatted) {
        const text = columnText(row, column, locale);
        // O texto formatado de um número ("-R$ 10,00") não é fórmula: só o texto livre é neutralizado.
        return typeof raw === 'string' && !column.format ? neutralize(text) : text;
    }
    if (typeof raw === 'number') return raw;
    return neutralize(raw instanceof Date ? raw.toISOString() : String(raw));
}

function footerCell<T>(rows: T[], column: SarakValueColumn<T>, formatted: boolean, locale?: string): XlsxCell {
    if (column.aggregate === undefined) return null;
    const value = sarakAggregate(rows, column);
    if (!formatted && typeof value === 'number') return value;
    return aggregateText(value, column, locale);
}

/** Linhas da planilha (cabeçalho, dados e rodapé), antes de virarem arquivo. */
export function sarakTableToSheetRows<T>(columns: SarakCsvColumn<T>[], rows: T[], options: SarakXlsxOptions = {}): XlsxCell[][] {
    const { formatted = true, locale } = options;
    const shown = visibleColumns(columns, options.columnState);
    const valueColumns = shown.map((column) => toValueColumn<T>(column));
    const sheet: XlsxCell[][] = [shown.map((column) => neutralize(headerOf(column)))];
    rows.forEach((row) => sheet.push(valueColumns.map((column) => dataCell(row, column, formatted, locale))));
    if ((options.includeFooter ?? true) && hasFooter(valueColumns)) {
        sheet.push(valueColumns.map((column) => footerCell(rows, column, formatted, locale)));
    }
    return sheet;
}

/** Planilha `.xlsx` (bytes). Carrega o escritor sob demanda. */
export async function sarakTableToXlsx<T>(columns: SarakCsvColumn<T>[], rows: T[], options: SarakXlsxOptions = {}): Promise<Uint8Array> {
    const { buildXlsx } = await import('./xlsxFile');
    return buildXlsx({ name: options.sheetName ?? 'Sheet1', rows: sarakTableToSheetRows(columns, rows, options) });
}

/** Baixa os bytes como arquivo; só funciona no navegador. */
export function sarakDownloadXlsx(filename: string, bytes: Uint8Array): void {
    const url = URL.createObjectURL(new Blob([bytes as BlobPart], { type: XLSX_MIME }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
}

/** Monta e baixa a planilha: o escritor só é carregado agora, no clique. */
export async function sarakExportXlsx<T>(columns: SarakCsvColumn<T>[], rows: T[], options: SarakXlsxOptions = {}): Promise<void> {
    sarakDownloadXlsx(options.filename ?? 'table.xlsx', await sarakTableToXlsx(columns, rows, options));
}
