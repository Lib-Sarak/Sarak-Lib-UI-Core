import React from 'react';
import { createRoot } from 'react-dom/client';
import { SarakDataGrid, SarakDataTable, SarakUIProvider } from '@sarak/lib-ui-core';
import type { SarakColumn } from '@sarak/lib-ui-core';

const mountNode = document.getElementById('root');

if (!mountNode) {
    throw new Error('O harness da tabela impressa em folhas precisa do elemento #root.');
}

interface Row {
    id: number;
    name: string;
    score: number;
    city: string;
}

const ROW_COUNT = 200;
const GRID_ROW_HEIGHT = 44;
const GRID_HEIGHT = 360;
const TABLE_HEIGHT = 360;
const MIN_LINES = 3;
const LINE_VARIATIONS = 3;
const ROWS: Row[] = Array.from({ length: ROW_COUNT }, (_, index) => ({ id: index + 1, name: `Pessoa ${index + 1}`, score: index % 100, city: index % 2 ? 'Rio' : 'Lima' }));
/** Cada linha de dado tem de 3 a 5 linhas de texto (`r<id>l<n>`): uma quebra de folha no meio dela deixa o texto em duas folhas. */
const linesOf = (id: number): string[] => Array.from({ length: MIN_LINES + (id % LINE_VARIATIONS) }, (_, line) => `r${id}l${line + 1}`);
const noteOf = (row: Row): React.ReactNode => linesOf(row.id).map((text) => <span key={text} style={{ display: 'block' }}>{text}</span>);
const COLUMNS: Array<SarakColumn<Row>> = [
    { id: 'name', header: 'Nome' },
    { id: 'score', header: 'Nota', format: { type: 'number' } },
    { id: 'city', header: 'Cidade' },
    { id: 'note', header: 'Obs', render: noteOf },
];

const Screens = (): React.ReactElement => {
    const screenName = new URLSearchParams(window.location.search).get('tela');
    if (screenName === 'grupo') {
        return <SarakDataTable<Row> columns={COLUMNS} rows={ROWS} height={TABLE_HEIGHT} getRowKey={(row) => row.id} groupBy={{ key: 'city', subtotals: false }} />;
    }
    if (screenName === 'planilha') {
        return <SarakDataGrid count={ROW_COUNT} height={GRID_HEIGHT} estimateSize={GRID_ROW_HEIGHT} renderRow={(index) => <div><span style={{ display: 'block' }}>{`Linha ${index + 1}`}</span>{linesOf(index + 1).map((text) => <span key={text} style={{ display: 'block' }}>{text}</span>)}</div>} />;
    }
    return <SarakDataTable<Row> columns={COLUMNS} rows={ROWS} height={TABLE_HEIGHT} getRowKey={(row) => row.id} />;
};

createRoot(mountNode).render(
    <SarakUIProvider config={{ mode: 'dark' }}>
        <Screens />
    </SarakUIProvider>,
);
