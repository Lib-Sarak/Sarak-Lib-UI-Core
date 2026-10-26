import React from 'react';
import { createRoot } from 'react-dom/client';
import { SarakAppChrome } from '../../src/components/Layout/SarakAppChrome';
import { SarakUIProvider } from '../../src/core/Provider/SarakUIProvider';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('plan-124-sidebar-contrast-entry: #root ausente no harness.');

createRoot(rootElement).render(
    <SarakUIProvider config={{ mode: 'light', colorBgBody: '#ffffff', sidebarColor: '#111111' }}>
        <SarakAppChrome
            navigationStyle="sidebar"
            nav={[
                { label: 'Página ativa', route: '/ativa' },
                { label: 'Item inativo', route: '/inativa' },
            ]}
            activeRoute="/ativa"
        >
            <main data-testid="plan-124-page">Conteúdo em tema claro</main>
        </SarakAppChrome>
    </SarakUIProvider>,
);
