import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { SarakUIProvider } from '../../src/core/Provider/SarakUIProvider';
import { CustomizationPanel } from '../../src/features/DesignEngine/Library/CustomizationPanel/CustomizationPanelImpl';

const params = new URLSearchParams(window.location.search);
const width = params.get('largura') ?? '1600px';
const isEmbedded = params.get('modo') === 'embarcado';
const initialMode = params.get('claro') === '1' ? 'light' : 'dark';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('plan-140-coluna-entry: #root ausente no harness.');

/** Mostra o que o `onSave` e a porta de marca receberam: é o que o backend do importador veria. */
const Probe: React.FC<{ saved: string; branding: string }> = ({ saved, branding }) => (
    <>
        <output data-testid="saved-payload" style={{ position: 'fixed', left: '-10000px', top: 0 }}>{saved}</output>
        <output data-testid="branding-payload" style={{ position: 'fixed', left: '-10000px', top: 0 }}>{branding}</output>
    </>
);

const Scene: React.FC = () => {
    const [saved, setSaved] = useState('');
    const [branding, setBranding] = useState('');
    return (
        <SarakUIProvider
            initialTheme="sarak-sovereign"
            options={{
                fonts: 'none',
                mode: isEmbedded ? 'embedded' : 'app',
                preferences: { defaultColorMode: initialMode },
                persistence: { strategy: 'hybrid', storageKey: `plan-140-${initialMode}`, onSave: (design) => setSaved(JSON.stringify(design)) },
                branding: { initial: { loginName: 'Host', logoBase64: null }, onChange: (value) => setBranding(JSON.stringify(value)) },
            }}
        >
            <div data-testid="plan-140-panel-host" style={{ width, height: '900px', margin: isEmbedded ? '24px' : 0 }}>
                <CustomizationPanel />
            </div>
            <Probe saved={saved} branding={branding} />
        </SarakUIProvider>
    );
};

createRoot(rootElement).render(<Scene />);
