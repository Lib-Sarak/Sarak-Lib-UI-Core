import React from 'react';
import { createRoot } from 'react-dom/client';
import { SarakAppChrome, SarakUIProvider } from '@sarak/lib-ui-core';

const mountNode = document.getElementById('root');

if (!mountNode) {
    throw new Error('O harness da altura do cromo precisa do elemento #root.');
}

const NAV = [
    { label: 'Início', route: '/' },
    { label: 'Faturas', route: '/faturas' },
];

/** Uma página bem mais alta que a janela. O host NÃO monta cadeia de `height: 100%` em html/body/#root. */
createRoot(mountNode).render(
    <SarakUIProvider config={{ mode: 'dark' }}>
        <SarakAppChrome navigationStyle="topbar" nav={NAV} activeRoute="/">
            <div data-testid="tall-page" style={{ height: 3000 }}>Página alta</div>
        </SarakAppChrome>
    </SarakUIProvider>,
);
