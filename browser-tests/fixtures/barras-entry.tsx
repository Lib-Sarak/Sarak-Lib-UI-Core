import React from 'react';
import { createRoot } from 'react-dom/client';
import { SarakAppChrome, type SarakNavItem } from '../../src/components/Layout/SarakAppChrome';
import { SarakUIProvider } from '../../src/core/Provider/SarakUIProvider';
import { CustomizationPanel } from '../../src/features/DesignEngine/Library/CustomizationPanel/CustomizationPanelImpl';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('barras-entry: #root ausente no harness.');

/**
 * Uma página com o painel de customização e, ao lado, o cromo REAL desenhado pelo mesmo Provider: a lateral, o topo e um cromo sem a
 * orientação fixada pela página (o que o consumidor vê). Tudo o que o painel aplica aparece nos três.
 * Consultas: `?theme=<id>`, `?claro=1`, `?design=<json>` (o `config` do administrador) e `?so=painel|cromo`.
 */
const params = new URLSearchParams(window.location.search);
const theme = params.get('theme') ?? 'sarak-sovereign-classic';
const initialMode = params.get('claro') === '1' ? 'light' : 'dark';
const design = JSON.parse(params.get('design') ?? '{}') as Record<string, unknown>;
const only = params.get('so');

const NAV: SarakNavItem[] = ['Início', 'Comercial', 'Financeiro', 'Projetos'].map((label, index) => ({
    id: `item-${index}`, label, href: `#item-${index}`, active: index === 1,
}));

const Frame: React.FC<{ id: string; height: number; children: React.ReactNode }> = ({ id, height, children }) => (
    <div data-testid={id} style={{ height, width: 880, overflow: 'hidden', transform: 'translateZ(0)', border: '1px solid #8884' }}>{children}</div>
);

const Chromes: React.FC = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Frame id="chrome-sidebar" height={380}>
            <SarakAppChrome navigationStyle="sidebar" navItems={NAV} brand={{ name: 'Sistema' }} style={{ height: '100%' }}><main>Conteúdo</main></SarakAppChrome>
        </Frame>
        <Frame id="chrome-topbar" height={260}>
            <SarakAppChrome navigationStyle="topbar" navItems={NAV} brand={{ name: 'Sistema' }} style={{ height: '100%' }}><main>Conteúdo</main></SarakAppChrome>
        </Frame>
        <Frame id="chrome-auto" height={300}>
            <SarakAppChrome navItems={NAV} brand={{ name: 'Sistema' }} style={{ height: '100%' }}><main>Conteúdo</main></SarakAppChrome>
        </Frame>
    </div>
);

createRoot(rootElement).render(
    <SarakUIProvider
        initialTheme={theme}
        config={design}
        options={{
            fonts: 'none',
            mode: 'app',
            i18n: { languages: ['pt'], language: 'pt' },
            preferences: { defaultColorMode: initialMode },
            persistence: { strategy: 'local', storageKey: `barras-${initialMode}` },
        }}
    >
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            {only !== 'cromo' && <div data-testid="panel-host" style={{ width: 1500, height: 900 }}><CustomizationPanel /></div>}
            {only !== 'painel' && <Chromes />}
        </div>
    </SarakUIProvider>,
);
