import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { SarakInput, SarakResourceRow, SarakStats, SarakTabs, SarakUIProvider } from '@sarak/lib-ui-core';

const mountNode = document.getElementById('root');

if (!mountNode) {
    throw new Error('O harness da plan-148 precisa do elemento #root.');
}

const LONG_TITLE = 'Relatório trimestral de conciliação bancária das filiais do litoral norte e sul';
const TAB_COUNT = 12;
const TABS = Array.from({ length: TAB_COUNT }, (_, index) => ({ id: `t${index}`, label: `Aba número ${index + 1}` }));
const ACTIONS = [{ label: 'Abrir', onClick: () => undefined }, { label: 'Arquivar', onClick: () => undefined }];
const METADATA = [{ label: 'Dono', value: 'Financeiro' }, { label: 'Atualizado', value: 'ontem' }];

const box = (id: string, width: number, children: React.ReactNode): React.ReactElement => (
    <div data-testid={id} style={{ width, marginBottom: 24 }}>{children}</div>
);

const ControlledMenuTabs = (): React.ReactElement => {
    const [active, setActive] = useState('t0');
    return <SarakTabs tabs={TABS} activeTab={active} onChange={setActive} overflow="menu" />;
};

const App = (): React.ReactElement => (
    <SarakUIProvider>
        {box('row-wide', 900, <SarakResourceRow layout="inline" density="compact" title={LONG_TITLE} metadata={METADATA} actions={ACTIONS} />)}
        {box('row-narrow', 320, <SarakResourceRow layout="inline" density="compact" title={LONG_TITLE} metadata={METADATA} actions={ACTIONS} />)}
        {box('row-stacked', 900, <SarakResourceRow title={LONG_TITLE} metadata={METADATA} actions={ACTIONS} />)}
        {box('stats-one', 600, <SarakStats data={{ total: 42 }} mapping={{ total: 'Pedidos em aberto no mês' }} metrics={{ total: { href: '#pedidos' } }} />)}
        <div data-testid="fields" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, width: 900, marginBottom: 24 }}>
            <SarakInput aria-label="plain" fullWidth />
            <SarakInput aria-label="outside" fullWidth prefixText="R$" suffixText="/mês" />
            <SarakInput aria-label="inside" fullWidth prefixText="R$" suffixText="/mês" affixPlacement="inside" />
        </div>
        {box('tabs-scroll', 400, <SarakTabs tabs={TABS} activeTab="t0" overflow="scroll" />)}
        {box('tabs-wrap', 400, <SarakTabs tabs={TABS} activeTab="t0" overflow="wrap" />)}
        {box('tabs-menu', 400, <ControlledMenuTabs />)}
    </SarakUIProvider>
);

createRoot(mountNode).render(<App />);
