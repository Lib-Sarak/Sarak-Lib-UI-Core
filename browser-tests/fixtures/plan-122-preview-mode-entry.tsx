import React from 'react';
import { createRoot } from 'react-dom/client';
import { SarakUIProvider } from '../../src/core/Provider/SarakUIProvider';
import { CustomizationPanel } from '../../src/features/DesignEngine/Library/CustomizationPanel/CustomizationPanelImpl';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('plan-122-preview-mode-entry: #root ausente no harness.');

createRoot(rootElement).render(
    <SarakUIProvider
        initialTheme="sarak-sovereign"
        options={{ fonts: 'none', preferences: { defaultColorMode: 'light' } }}
    >
        <div data-testid="plan-122-panel-host" style={{ width: '1600px', height: '900px' }}>
            <CustomizationPanel />
        </div>
    </SarakUIProvider>,
);
