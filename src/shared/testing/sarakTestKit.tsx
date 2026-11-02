import React from 'react';
import type { RenderOptions, RenderResult } from '@testing-library/react';

const LIBRARY_ENTRY = '@sarak/lib-ui-core';
const TESTING_LIBRARY_ENTRY = '@testing-library/react';

interface SarakTestColumn {
    id: string;
    header: React.ReactNode;
    accessor?: (row: unknown) => unknown;
    render?: (row: unknown, rowIndex: number) => React.ReactNode;
    footer?: React.ReactNode | ((context: { value: unknown; rows: unknown[] }) => React.ReactNode);
    aggregate?: unknown;
}

/**
 * Props do `SarakUIProvider`, sem o tipo da lib: importá-lo aqui faz o build mover os tipos que este
 * subpath divide com o barril para um `.d.ts` compartilhado, e `dist/index.d.ts` deixa de declará-los.
 */
export interface SarakRenderProviderProps extends Record<string, unknown> {
    options?: Record<string, unknown>;
}

interface SarakTestLibrary extends Record<string, unknown> {
    SarakUIProvider: React.ComponentType<SarakRenderProviderProps & { children?: React.ReactNode }>;
    sarakAggregate: (rows: unknown[], column: SarakTestColumn) => unknown;
}

// O especificador em variável deixa os dois módulos fora do bundle e fora da carga deste subpath: o
// `vitest.config` importa `./testing` em Node, sem DOM, e nem todo consumidor tem o Testing Library. A lib
// volta pelo próprio nome para o teste usar o mesmo contexto do código que importa `@sarak/lib-ui-core`.
const loadLibrary = (): Promise<SarakTestLibrary> => import(/* @vite-ignore */ LIBRARY_ENTRY) as Promise<SarakTestLibrary>;
const loadTestingLibrary = (): Promise<typeof import('@testing-library/react')> => import(/* @vite-ignore */ TESTING_LIBRARY_ENTRY);

export interface SarakRenderOptions extends Omit<RenderOptions, 'wrapper'> {
    /** Props do `SarakUIProvider`; `options.fonts` nasce `'none'`, para o teste não carregar fonte. */
    provider?: SarakRenderProviderProps;
}

/** Renderiza dentro do `SarakUIProvider`. É assíncrona: a lib só carrega quando o teste pede. */
export const renderWithSarak = async (ui: React.ReactElement, { provider, ...renderOptions }: SarakRenderOptions = {}): Promise<RenderResult> => {
    const [{ render }, { SarakUIProvider }] = await Promise.all([loadTestingLibrary(), loadLibrary()]);
    const wrapper = ({ children }: { children: React.ReactNode }): React.ReactElement => (
        <SarakUIProvider {...provider} options={{ fonts: 'none', ...provider?.options }}>{children}</SarakUIProvider>
    );
    return render(ui, { ...renderOptions, wrapper });
};

const cellText = (value: unknown): React.ReactNode =>
    typeof value === 'string' || typeof value === 'number' ? value : value === null || value === undefined ? '' : String(value);

const cellValue = (column: SarakTestColumn, row: unknown, rowIndex: number): React.ReactNode => {
    if (column.render) return column.render(row, rowIndex);
    return cellText(column.accessor ? column.accessor(row) : (row as Record<string, unknown>)[column.id]);
};

const footerValue = (library: SarakTestLibrary, column: SarakTestColumn, rows: unknown[]): React.ReactNode => {
    const value = library.sarakAggregate(rows, column);
    if (typeof column.footer === 'function') return column.footer({ value, rows });
    if (column.footer !== undefined) return column.footer;
    return column.aggregate === undefined ? '' : cellText(value);
};

interface SarakTestTableProps {
    columns: SarakTestColumn[];
    rows: unknown[];
    getRowKey?: (row: unknown, rowIndex: number) => React.Key;
}

/** A tabela virtualizada não mede linhas no jsdom: o dublê desenha todas, com as mesmas células. */
const createTableDouble = (library: SarakTestLibrary) => ({ columns, rows, getRowKey }: SarakTestTableProps): React.ReactElement => (
    <table>
        <thead>
            <tr>{columns.map((column) => <th key={column.id} scope="col">{column.header}</th>)}</tr>
        </thead>
        <tbody>
            {rows.map((row, rowIndex) => (
                <tr key={getRowKey?.(row, rowIndex) ?? rowIndex}>
                    {columns.map((column) => <td key={column.id}>{cellValue(column, row, rowIndex)}</td>)}
                </tr>
            ))}
        </tbody>
        {columns.some((column) => column.footer !== undefined || column.aggregate !== undefined) && (
            <tfoot>
                <tr>{columns.map((column) => <td key={column.id}>{footerValue(library, column, rows)}</td>)}</tr>
            </tfoot>
        )}
    </table>
);

interface SarakTestChartProps {
    ariaLabel?: string;
    data?: Array<Record<string, unknown>>;
    onPointClick?: (point: { seriesKey: string; index: number; datum: Record<string, unknown> }) => void;
}

const pointLabel = (datum: Record<string, unknown>, index: number): string => String(datum.label ?? datum.name ?? index);

/** O ECharts não desenha no jsdom: cada ponto vira um botão, e o clique chega ao `onPointClick`. */
const ChartDouble = ({ ariaLabel, data = [], onPointClick }: SarakTestChartProps): React.ReactElement => (
    <div role="img" aria-label={ariaLabel}>
        {data.map((datum, index) => (
            <button key={pointLabel(datum, index)} type="button" onClick={() => onPointClick?.({ seriesKey: 'test', index, datum })}>
                {pointLabel(datum, index)}
            </button>
        ))}
    </div>
);

const PdfViewerDouble = (): React.ReactElement => <div role="document" />;

/**
 * A lib real com os dublês dos três componentes que não rodam no jsdom. Para o `vi.mock` do
 * consumidor: `vi.mock('@sarak/lib-ui-core', () => createSarakKitMock())`. `overrides`
 * troca ou acrescenta qualquer nome, inclusive os dublês.
 */
export const createSarakKitMock = async (overrides: Record<string, unknown> = {}): Promise<Record<string, unknown>> => {
    const library = await loadLibrary();
    return {
        ...library,
        SarakDataTable: createTableDouble(library),
        SarakChartEngine: ChartDouble,
        SarakPDFViewer: PdfViewerDouble,
        ...overrides,
    };
};
