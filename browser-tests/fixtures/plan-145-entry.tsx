import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { SarakAppChrome, SarakUIProvider } from '@sarak/lib-ui-core';
import { PERSONALITIES } from '../../src/core/Design/presets/components/personalities';
import { SARAK_ALL_THEMES } from '../../src/core/Design/presets/themes/all';
import { composeThemeForMode } from '../../src/core/Design/presets/themes/compose';
import type { SarakTokenValue } from '../../src/core/Design/types';

const mountNode = document.getElementById('root');

if (!mountNode) {
    throw new Error('O harness da plan-145 precisa do elemento #root.');
}

/**
 * Uma cena por consulta: `?personality=<id>&palette=<id>&mode=<modo>` aplica a Personalidade sobre a paleta, e
 * `?theme=<id>&mode=<modo>&bar=<sidebar|topbar>` aplica o design composto do tema embarcado, e `?design=<json>` sobrepõe tokens à cena
 * (o "antes" da prévia). `?route=` escolhe o item ativo. `window.__scenes` lista os ids, para o teste não repetir a lista do catálogo.
 */
const params = new URLSearchParams(location.search);
const mode = params.get('mode') === 'light' ? 'light' : 'dark';
(window as unknown as { __scenes: unknown }).__scenes = { personalities: PERSONALITIES.map((item) => item.id), themes: SARAK_ALL_THEMES.map((item) => item.id) };

const baseDesign = (): Record<string, unknown> => {
    const personality = PERSONALITIES.find((item) => item.id === params.get('personality'));
    if (personality) return { colorPalette: params.get('palette') ?? 'oceano', mode, ...personality.design };
    const theme = SARAK_ALL_THEMES.find((item) => item.id === params.get('theme'));
    if (!theme) return {};
    const composed = composeThemeForMode({ design: theme.design as Record<string, SarakTokenValue>, contraparte: theme.contraparte }, mode) as unknown as Record<string, unknown>;
    return { ...composed, navigationStyle: params.get('bar') === 'topbar' ? 'topbar' : 'sidebar' };
};

const sceneDesign = (): Record<string, unknown> => ({ ...baseDesign(), ...(JSON.parse(params.get('design') ?? '{}') as Record<string, unknown>) });

const LOGO = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#888"/></svg>');

const TREE = [
    { label: 'Início', route: '#home', icon: 'Home' },
    { label: 'Vendas', route: '#vendas', icon: 'Briefcase', badge: 3, children: [
        { label: 'Pedidos', route: '#vendas/pedidos', badge: 5 }, { label: 'Orçamentos', route: '#vendas/orcamentos' }, { label: 'Clientes', route: '#vendas/clientes' },
    ] },
    { label: 'Compras', route: '#compras', icon: 'Package', children: [
        { label: 'Pedidos de compra', route: '#compras/pedidos' }, { label: 'Fornecedores', route: '#compras/fornecedores' },
    ] },
    { label: 'Estoque', route: '#estoque', icon: 'Folder', children: [{ label: 'Itens', route: '#estoque/itens' }, { label: 'Movimentações', route: '#estoque/mov' }] },
    { label: 'Financeiro', route: '#financeiro', icon: 'FileText', children: [{ label: 'Contas a pagar', route: '#financeiro/pagar' }, { label: 'Contas a receber', route: '#financeiro/receber' }] },
    { label: 'Fiscal', route: '#fiscal', icon: 'FileText' },
    { label: 'Relatórios', route: '#relatorios', icon: 'Layout' },
    { label: 'Configurações', route: '#config', icon: 'Settings' },
];

const ROWS = ['PV-1042 · Metalúrgica Souza', 'PV-1041 · Comercial Alvorada', 'PV-1040 · Tecnoágua Ltda', 'PV-1039 · Grupo Tavares', 'PV-1038 · Oficina Central'];

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
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <tbody>
                {ROWS.map((row, index) => (
                    <tr key={row} style={{ background: index % 2 ? 'color-mix(in srgb, currentColor 6%, transparent)' : undefined }}>
                        <td style={{ padding: 'var(--sarak-table-padding, 8px)' }}>{row}</td>
                        <td style={{ textAlign: 'right', padding: 'var(--sarak-table-padding, 8px)' }}>{(index + 1) * 1280}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const App = (): React.ReactElement => {
    const [route, setRoute] = useState(params.get('route') ?? '#vendas/pedidos');
    return (
        <SarakUIProvider config={sceneDesign()}>
            <div data-testid="frame" style={{ height: '100vh', width: '100%' }}>
                <SarakAppChrome
                    brand={{ name: 'Sistema', logoUrl: LOGO }}
                    nav={TREE}
                    activeRoute={route}
                    onNavigate={setRoute}
                    user={{ name: 'Ana' }}
                    logout={() => undefined}
                    style={{ height: '100%' }}
                >
                    <Content />
                </SarakAppChrome>
            </div>
        </SarakUIProvider>
    );
};

createRoot(mountNode).render(<App />);
