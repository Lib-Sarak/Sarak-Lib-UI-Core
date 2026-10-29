import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { SarakUIProvider } from '../../src/core/Provider/SarakUIProvider';
import { CustomizationPanel } from '../../src/features/DesignEngine/Library/CustomizationPanel/CustomizationPanelImpl';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('plan-135-paletas-entry: #root ausente no harness.');

/** Mostra o último payload que o `onSave` recebeu — é o que o backend do importador veria. */
const SavedProbe: React.FC<{ saved: string }> = ({ saved }) => (
    <output data-testid="saved-payload" style={{ position: 'fixed', left: '-10000px', top: 0 }}>{saved}</output>
);

const Scene: React.FC = () => {
    const [saved, setSaved] = useState('');
    return (
        <SarakUIProvider
            initialTheme="sarak-sovereign"
            options={{
                fonts: 'none',
                persistence: {
                    strategy: 'hybrid',
                    storageKey: 'plan-135-paletas',
                    onSave: (design) => setSaved(JSON.stringify(design)),
                },
            }}
        >
                <div data-testid="plan-135-panel-host" style={{ width: '1600px', height: '900px' }}>
                    <CustomizationPanel />
                </div>
                <SavedProbe saved={saved} />
        </SarakUIProvider>
    );
};

createRoot(rootElement).render(<Scene />);
