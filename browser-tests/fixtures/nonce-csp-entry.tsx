import React from 'react';
import { createRoot } from 'react-dom/client';
import { SarakAuthScreen, SarakUIProvider } from '@sarak/lib-ui-core';

const root = document.getElementById('root');
if (!root) throw new Error('nonce-csp-entry: #root ausente no harness.');

createRoot(root).render(
    <SarakUIProvider options={{ styleNonce: 'sarak-csp-nonce' }}>
        <SarakAuthScreen
            showCredentials={false}
            socialConfig={{ enabled: true, display: 'full', providers: [{ id: 'empresa', icon: <svg />, variant: 'solid' }] }}
        />
    </SarakUIProvider>,
);
