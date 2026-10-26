import React from 'react';
import { createRoot } from 'react-dom/client';
import { SarakAppChrome } from '../../src/components/Layout/SarakAppChrome';
import { SarakUIProvider } from '../../src/core/Provider/SarakUIProvider';

const tableColumns = Array.from({ length: 16 }, (_, index) => `Coluna ${index + 1}`);
const tableRows = Array.from({ length: 8 }, (_, rowIndex) => rowIndex + 1);

const WideTable: React.FC = () => (
    <table data-testid="wide-layout-table" style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse' }}>
        <thead>
            <tr>
                {tableColumns.map((column) => <th key={column} style={{ overflowWrap: 'anywhere' }}>{column}</th>)}
            </tr>
        </thead>
        <tbody>
            {tableRows.map((row) => (
                <tr key={row}>
                    {tableColumns.map((column) => (
                        <td key={`${row}-${column}`} style={{ overflowWrap: 'anywhere' }}>
                            {`${column}: valor de referência da linha ${row}`}
                        </td>
                    ))}
                </tr>
            ))}
        </tbody>
    </table>
);

createRoot(document.getElementById('root')!).render(
    <SarakUIProvider>
        <SarakAppChrome navigationStyle="topbar" navItems={[]}>
            <WideTable />
        </SarakAppChrome>
    </SarakUIProvider>,
);
