import React from 'react';
import { createRoot } from 'react-dom/client';
import { SarakAppChrome } from '../../src/components/Layout/SarakAppChrome';
import { SarakUIProvider } from '../../src/core/Provider/SarakUIProvider';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('topbar-mais-entry: #root ausente no harness.');

const params = new URLSearchParams(window.location.search);
const ITEMS = ['Início', 'Comercial', 'Financeiro', 'Projetos', 'Propostas', 'Contratos', 'Configurações'];
const activeIndex = Number(params.get('ativo') ?? 0);
const itemCount = Number(params.get('itens') ?? ITEMS.length);
const navItems = ITEMS.slice(0, itemCount).map((label, index) => ({
    id: `item-${index}`,
    label,
    href: `/item-${index}`,
    active: index === activeIndex,
}));

// A composição que o ERP grava: P/M/G, Lateral/Topo e modo fixos na barra (a busca já nasce fixa).
const design = {
    preferenceFontSizePosition: 'pinned',
    preferenceNavigationStylePosition: 'pinned',
    preferenceModePosition: 'pinned',
    ...JSON.parse(params.get('design') ?? '{}'),
};

createRoot(rootElement).render(
    <SarakUIProvider config={design}>
        <SarakAppChrome navigationStyle={params.get('nav') === 'sidebar' ? 'sidebar' : 'topbar'} navItems={navItems} brand={{ name: 'Sistema' }}>
            <main>Conteúdo</main>
        </SarakAppChrome>
    </SarakUIProvider>,
);
