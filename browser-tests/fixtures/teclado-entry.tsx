import React from 'react';
import { createRoot } from 'react-dom/client';
import { SarakAppChrome, type SarakNavItem } from '../../src/components/Layout/SarakAppChrome';
import { SarakUIProvider } from '../../src/core/Provider/SarakUIProvider';
import { CustomizationPanel } from '../../src/features/DesignEngine/Library/CustomizationPanel/CustomizationPanelImpl';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('teclado-entry: #root ausente no harness.');

/**
 * O cromo OU o painel de customização, ocupando a janela inteira, para o teclado percorrer a página como o usuário.
 * Consultas: `?so=cromo|painel`, `?chrome=sidebar|topbar`, `?tema=<id>`, `?claro=1`, `?itens=N` (destinos na navegação).
 */
const params = new URLSearchParams(window.location.search);
const only = params.get('so') ?? 'cromo';
const theme = params.get('tema') ?? 'sarak-sovereign-classic';
const mode = params.get('claro') === '1' ? 'light' : 'dark';
const itemCount = Number(params.get('itens') ?? 0) || 8;

const NAV: SarakNavItem[] = [
    { id: 'inicio', label: 'Início', href: '#inicio', active: true },
    { id: 'pedidos', label: 'Pedidos', href: '#pedidos' },
    {
        id: 'cadastros', label: 'Cadastros', href: '#cadastros',
        children: [
            { id: 'clientes', label: 'Clientes', href: '#clientes' },
            { id: 'produtos', label: 'Produtos', href: '#produtos' },
        ],
    },
    ...Array.from({ length: 12 }, (_, index) => ({ id: `item-${index}`, label: `Relatório ${index + 1}`, href: `#item-${index}` })),
].slice(0, itemCount);

createRoot(rootElement).render(
    <SarakUIProvider
        initialTheme={theme}
        options={{
            fonts: 'none',
            mode: 'app',
            i18n: { languages: ['pt', 'en'], language: 'pt' },
            preferences: { defaultColorMode: mode },
            persistence: { strategy: 'local', storageKey: `teclado-${mode}` },
        }}
    >
        {only === 'painel'
            ? <div data-testid="panel-host" style={{ width: '100vw', height: '100vh' }}><CustomizationPanel /></div>
            : (
                <SarakAppChrome
                    navigationStyle={params.get('chrome') === 'topbar' ? 'topbar' : 'sidebar'}
                    navItems={NAV}
                    brand={{ name: 'Sistema' }}
                    user={{ name: 'Maria' }}
                    logout={() => undefined}
                >
                    <main><button type="button">Ação do conteúdo</button></main>
                </SarakAppChrome>
            )}
    </SarakUIProvider>,
);
