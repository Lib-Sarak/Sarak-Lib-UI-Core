import React, { Suspense, useState } from 'react';
import { createPortal } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { SarakAppChrome, SarakDataTable, SarakDocumentFrame, SarakUIProvider, sarakPrint } from '@sarak/lib-ui-core';
import type { SarakCellTone, SarakColumn, SarakColumnState } from '@sarak/lib-ui-core';

const mountNode = document.getElementById('root');

if (!mountNode) {
    throw new Error('O harness da tabela e do documento precisa do elemento #root.');
}

interface Row {
    id: number;
    name: string;
    score: number;
    city: string;
}

const ROW_COUNT = 200;
const SCORE_LIMIT = 50;
const NARROW_WIDTH = 320;
const ROWS: Row[] = Array.from({ length: ROW_COUNT }, (_, index) => ({ id: index + 1, name: `Pessoa ${index + 1}`, score: index % 100, city: index % 2 ? 'Rio' : 'Lima' }));

const required = (value: string): string | undefined => (value.trim() ? undefined : 'Obrigatório');
const toneOf = (row: Row, column: SarakColumn<Row>): SarakCellTone | undefined => {
    if (column.id !== 'score') return undefined;
    return row.score < SCORE_LIMIT ? 'danger' : 'success';
};

const COLUMNS: Array<SarakColumn<Row>> = [
    { id: 'name', header: 'Nome', editable: true, validate: required },
    { id: 'score', header: 'Nota', format: { type: 'number' } },
    { id: 'city', header: 'Cidade', editable: true, validate: required },
];

const WorkTable = (): React.ReactElement => {
    const [columnState, setColumnState] = useState<SarakColumnState>({});
    const [log, setLog] = useState('');
    const edit = (row: Row, column: SarakColumn<Row>, value: string): void => setLog(`edit:${row.id}:${column.id}:${value}`);
    return (
        <div data-testid="work">
            <SarakDataTable<Row>
                columns={COLUMNS} rows={ROWS} height={360} selectable getRowKey={(row) => row.id}
                columnState={columnState} onColumnStateChange={setColumnState} onCellEdit={edit} getCellTone={toneOf}
                bulkActions={[
                    { label: 'Arquivar', onAction: (ids) => setLog(`arquivar:${ids.join(',')}`) },
                    { label: 'Excluir', tone: 'danger', onAction: (ids) => setLog(`excluir:${ids.join(',')}`) },
                ]}
            />
            <output data-testid="columns">{JSON.stringify(columnState)}</output>
            <output data-testid="log">{log}</output>
        </div>
    );
};

const Screens = (): React.ReactElement => {
    const screenName = new URLSearchParams(window.location.search).get('tela');
    if (screenName === 'relatorio') return <div data-testid="report"><SarakDataTable<Row> columns={COLUMNS} rows={ROWS} density="report" getCellTone={toneOf} /></div>;
    if (screenName === 'estreita') {
        return <div data-testid="narrow" style={{ width: NARROW_WIDTH }}><SarakDocumentFrame actions={<button type="button">Baixar</button>}><p>Corpo do documento</p></SarakDocumentFrame></div>;
    }
    if (screenName === 'documento') {
        return (
            <>
                <p data-testid="outside">Fora do documento</p>
                <SarakDocumentFrame actions={<button type="button">Baixar</button>}><header data-testid="doc-header">Pedido 42</header><p>Corpo do documento</p></SarakDocumentFrame>
            </>
        );
    }
    if (screenName === 'alvo') {
        return (
            <>
                <p data-testid="outside">Fora do alvo</p>
                <div data-testid="card" className="text-theme-text">Cartão comum no conteúdo</div>
                {createPortal(<div id="alvo" data-testid="target" className="text-theme-text">Só isto no papel</div>, document.body)}
                <button type="button" data-testid="print" onClick={() => sarakPrint(document.getElementById('alvo'))}>Imprimir</button>
            </>
        );
    }
    return <WorkTable />;
};

const App = (): React.ReactElement => (
    <SarakUIProvider config={{ mode: 'dark' }}>
        <SarakAppChrome navItems={[{ id: 'home', label: 'Início', href: '#home' }]}>
            <Suspense fallback={null}><Screens /></Suspense>
        </SarakAppChrome>
    </SarakUIProvider>
);

createRoot(mountNode).render(<App />);
