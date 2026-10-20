import React from 'react';
import { createRoot } from 'react-dom/client';
import { SarakGrid, SarakUIProvider } from '@sarak/lib-ui-core';

const mountNode = document.getElementById('root');

if (!mountNode) {
    throw new Error('O harness do contrato de grid precisa do elemento #root.');
}

createRoot(mountNode).render(
    <SarakUIProvider config={{ layoutGridTemplate: 'col-12' }}>
        <SarakGrid data-testid="contract-grid">
            <div data-testid="default-span">Padrão responsivo</div>
            <div className="col-span-6" data-testid="custom-span">Span do consumidor</div>
        </SarakGrid>
    </SarakUIProvider>,
);
