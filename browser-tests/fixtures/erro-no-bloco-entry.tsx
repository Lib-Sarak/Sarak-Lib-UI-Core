import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { SarakAppChrome, SarakButton, SarakSection, SarakUIProvider } from '@sarak/lib-ui-core';

const mountNode = document.getElementById('root');

if (!mountNode) {
    throw new Error('O harness do erro no bloco precisa do elemento #root.');
}

const CHROME_NAV = [
    { label: 'Tela quebrada', route: '/broken' },
    { label: 'Tela boa', route: '/healthy' },
];

let shouldFail = true;
let mountCount = 0;

/** Lê a falha de fora do React: consertar não rerenderiza nada, só a nova tentativa remonta. */
const FailingContent = (): React.ReactElement => {
    if (shouldFail) throw new Error('falha interna do bloco');
    const [mounts, setMounts] = useState(0);
    useEffect(() => {
        mountCount += 1;
        setMounts(mountCount);
    }, []);
    return <p data-testid="recovered">Montado {mounts}</p>;
};

const RepairButton = (): React.ReactElement => (
    <SarakButton onClick={() => { shouldFail = false; }}>Consertar</SarakButton>
);

const Counter = (): React.ReactElement => {
    const [count, setCount] = useState(0);
    return <SarakButton onClick={() => setCount(count + 1)}>Cliques {count}</SarakButton>;
};

const SectionScene = (): React.ReactElement => (
    <>
        <SarakSection title="Seção quebrada" actions={<RepairButton />}><FailingContent /></SarakSection>
        <SarakSection title="Seção vizinha"><Counter /></SarakSection>
    </>
);

const ChromeScene = (): React.ReactElement => {
    const [route, setRoute] = useState('/broken');
    return (
        <SarakAppChrome navigationStyle="sidebar" nav={CHROME_NAV} activeRoute={route} onNavigate={setRoute} topbarActions={<RepairButton />} sidebarFooter={<Counter />}>
            {route === '/broken' ? <FailingContent /> : <p>Conteúdo da tela boa</p>}
        </SarakAppChrome>
    );
};

createRoot(mountNode).render(
    <SarakUIProvider options={{ fonts: 'none' }}>
        {new URLSearchParams(window.location.search).get('tela') === 'cromo' ? <ChromeScene /> : <SectionScene />}
    </SarakUIProvider>,
);
