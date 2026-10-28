import React from 'react';
import { createRoot } from 'react-dom/client';
import { SarakAppChrome, SarakUIProvider } from '@sarak/lib-ui-core';

const mountNode = document.getElementById('root');

if (!mountNode) {
    throw new Error('O harness do filho do cromo precisa do elemento #root.');
}

const NAV = [
    { label: 'Início', route: '/' },
    { label: 'Faturas', route: '/faturas' },
];

/** Conteúdo curto: um filho centralizado por margem automática e um filho que enche a altura. */
createRoot(mountNode).render(
    <SarakUIProvider config={{ mode: 'dark' }}>
        <SarakAppChrome navigationStyle="topbar" nav={NAV} activeRoute="/">
            <div data-testid="centered" style={{ maxWidth: 1000, margin: '0 auto' }}>Conteúdo centralizado</div>
            <div data-testid="fill" className="sarak-fill-height">Enche a altura</div>
        </SarakAppChrome>
    </SarakUIProvider>,
);
