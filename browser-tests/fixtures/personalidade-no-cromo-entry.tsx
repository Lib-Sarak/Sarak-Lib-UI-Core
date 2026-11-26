import React from 'react';
import { createRoot } from 'react-dom/client';
import { SarakUIProvider } from '../../src/core/Provider/SarakUIProvider';
import { SarakAppChrome } from '../../src/components/Layout/SarakAppChrome';
import { SarakCustomizationPanel } from '../../src/features/DesignEngine/Library/CustomizationPanel';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('personalidade-no-cromo-entry: #root ausente no harness.');

const NAV_ITEMS = [
    { id: 'home', label: 'Início', href: '/', icon: 'Home' },
    { id: 'design', label: 'Design', href: '/design', icon: 'Palette', active: true },
];

/** O painel como o consumidor o monta: numa rota do app, dentro do cromo, sob o `SarakUIProvider`. */
const Scene: React.FC = () => (
    <SarakUIProvider initialTheme="sarak-sovereign" options={{ fonts: 'none', persistence: { strategy: 'hybrid', storageKey: 'personalidade-no-cromo' } }}>
        <SarakAppChrome navItems={NAV_ITEMS} brand={{ name: 'Sistema' }} onNavigate={() => undefined}>
            <div style={{ height: '100%', minHeight: 0 }}><SarakCustomizationPanel /></div>
        </SarakAppChrome>
    </SarakUIProvider>
);

createRoot(rootElement).render(<Scene />);
