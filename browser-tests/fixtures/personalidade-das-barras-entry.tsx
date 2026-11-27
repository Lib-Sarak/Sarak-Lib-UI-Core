import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { SarakAppChrome, SarakUIProvider, type SarakNavItem } from '@sarak/lib-ui-core';

const mountNode = document.getElementById('root');

if (!mountNode) {
    throw new Error('O harness da plan-149 precisa do elemento #root.');
}

/**
 * Uma cena por consulta: `?design=<json>` entrega o tema (o Provider escreve variáveis no documento, então cada cena
 * pede uma página própria), `?nav=long` alonga a lista para medir rolagem, `?logo=none` tira a imagem da marca.
 */
const params = new URLSearchParams(location.search);
const design = JSON.parse(params.get('design') ?? '{}') as Record<string, unknown>;
const LONG = params.get('nav') === 'long';
const WITH_LOGO = params.get('logo') !== 'none';
const BRAND_NAME = 'Sistema';
const LOGO = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#888"/></svg>');

const filler = (count: number): SarakNavItem[] => Array.from({ length: count }, (_, index) => ({
    id: `extra-${index}`, label: `Módulo ${index + 1}`, href: `#extra-${index}`, icon: 'Folder',
}));

const BASE_NAV: SarakNavItem[] = [
    { id: 'home', label: 'Início', href: '#home', icon: 'Home' },
    { id: 'orders', label: 'Pedidos', href: '#orders', icon: 'FileText' },
    { id: 'clients', label: 'Clientes', href: '#clients', icon: 'User' },
];

const Content = (): React.ReactElement => (
    <div data-testid="content" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Pedidos de venda</h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {['Em aberto', 'Faturados no mês', 'Atrasados'].map((label, index) => (
                <div key={label} style={{ background: 'var(--sarak-card-bg, transparent)', border: '1px solid var(--sarak-card-border-color, currentColor)', borderRadius: 10, padding: 16 }}>
                    <div style={{ opacity: 0.7, fontSize: 13 }}>{label}</div>
                    <div style={{ fontSize: 28, fontWeight: 700 }}>{[128, 342, 17][index]}</div>
                </div>
            ))}
        </div>
        <div style={{ background: 'var(--sarak-card-bg, transparent)', border: '1px solid var(--sarak-card-border-color, currentColor)', borderRadius: 10, padding: 16 }}>
            {['PV-1042 · Metalúrgica Souza', 'PV-1041 · Comercial Alvorada', 'PV-1040 · Tecnoágua Ltda'].map((row) => <div key={row} style={{ padding: '8px 0' }}>{row}</div>)}
        </div>
    </div>
);

const App = (): React.ReactElement => {
    const [route, setRoute] = useState(params.get('route') ?? '#home');
    const nav = [...BASE_NAV, ...(LONG ? filler(30) : [])].map((item) => ({ ...item, active: item.href === route }));
    const erp = params.get('erp') === '1';
    const flatErp = erp && params.get('items') === 'flat';
    const ERP_TREE = [
        { label: 'Início', route: '#home', icon: 'Home' },
        { label: 'Vendas', route: '#vendas', icon: 'Briefcase', badge: 3, children: [
            { label: 'Pedidos', route: '#vendas/pedidos', badge: 5 }, { label: 'Orçamentos', route: '#vendas/orcamentos' }, { label: 'Clientes', route: '#vendas/clientes' },
        ] },
        { label: 'Compras', route: '#compras', icon: 'Package', children: [
            { label: 'Pedidos de compra', route: '#compras/pedidos' }, { label: 'Fornecedores', route: '#compras/fornecedores' },
        ] },
        { label: 'Estoque', route: '#estoque', icon: 'Folder', children: [
            { label: 'Itens', route: '#estoque/itens' }, { label: 'Movimentações', route: '#estoque/mov' },
        ] },
        { label: 'Financeiro', route: '#financeiro', icon: 'FileText', children: [
            { label: 'Contas a pagar', route: '#financeiro/pagar' }, { label: 'Contas a receber', route: '#financeiro/receber' },
        ] },
        { label: 'Fiscal', route: '#fiscal', icon: 'FileText' },
        { label: 'Relatórios', route: '#relatorios', icon: 'Layout' },
        { label: 'Configurações', route: '#config', icon: 'Settings' },
    ];
    const ERP_FLAT = ERP_TREE.flatMap((item) => (item.children ? [{ ...item, children: undefined, route: item.route }, ...item.children.map((child) => ({ ...child, icon: undefined, label: item.label + ' · ' + child.label }))] : [item]));
    const tree = erp ? (flatErp ? ERP_FLAT : ERP_TREE) : [
        { label: 'Início', route: '#home', icon: 'Home' },
        {
            label: 'Vendas', route: '#vendas', icon: 'Briefcase', badge: 3,
            children: [
                { label: 'Pedidos', route: '#vendas/pedidos', badge: 5 },
                { label: 'Clientes', route: '#vendas/clientes' },
            ],
        },
        { label: 'Estoque', route: '#estoque', icon: 'Package', children: [{ label: 'Itens', route: '#estoque/itens' }] },
        ...(LONG ? filler(30).map(({ label, href, icon }) => ({ label, route: href, icon })) : []),
    ];
    return (
        <SarakUIProvider initialTheme={params.get('tema') ?? undefined} config={design}>
            <div data-testid="frame" style={{ height: '100vh', width: '100%' }}>
                <SarakAppChrome
                    brand={WITH_LOGO ? { name: BRAND_NAME, logoUrl: LOGO } : { name: BRAND_NAME }}
                    nav={params.get('items') === 'flat' ? undefined : tree}
                    navItems={flatErp ? ERP_FLAT.map((item, index) => ({ id: `i${index}`, label: item.label, href: item.route, icon: item.icon, active: item.route === route })) : params.get('items') === 'flat' ? nav : undefined}
                    activeRoute={route}
                    onNavigate={setRoute}
                    user={{ name: 'Ana' }}
                    logout={() => undefined}
                    sidebarFooter={<span data-testid="host-footer">rodapé do host</span>}
                    style={{ height: '100%' }}
                >
                    <Content />
                </SarakAppChrome>
            </div>
        </SarakUIProvider>
    );
};

createRoot(mountNode).render(<App />);
