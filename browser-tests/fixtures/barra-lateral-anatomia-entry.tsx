import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { SarakAppChrome, SarakUIProvider, type SarakNavItem } from '@sarak/lib-ui-core';

const mountNode = document.getElementById('root');

if (!mountNode) {
    throw new Error('O harness da anatomia da barra lateral precisa do elemento #root.');
}

/**
 * O conteúdo da foto da barra antiga: marca "Sarak OS", dois grupos (um item em "Personalização", cinco em
 * "Relatórios", um ativo, e o grupo "Vendas" com três sub-abas), usuário com saída, uma notificação e dois idiomas. Uma cena por consulta: `?theme=<id>`,
 * `?design=<json>` sobrescreve tokens, `?logo=1` põe imagem na marca, `?light=1` troca o modo e `?route=<href>` escolhe o ativo.
 */
const params = new URLSearchParams(location.search);
const design = JSON.parse(params.get('design') ?? '{}') as Record<string, unknown>;
const WITH_LOGO = params.get('logo') === '1';
const LOGO = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 32"><rect width="96" height="32" rx="6" fill="#888"/></svg>');

/** Pela porta recomendada (`navItems`), com um grupo "Vendas" de três sub-abas (uma com selo). */
const NAV: Array<SarakNavItem> = [
    { id: 'design-engine', label: 'Design Engine', href: '#design-engine', icon: 'Palette', category: 'Personalização' },
    { id: 'sessoes', label: 'Sessões TCE-SP', href: '#sessoes', icon: 'FileText', category: 'Relatórios' },
    { id: 'mapeamento', label: 'Mapeamento', href: '#mapeamento', icon: 'Network', category: 'Relatórios' },
    { id: 'ramificacoes', label: 'Ramificações', href: '#ramificacoes', icon: 'Layers', category: 'Relatórios' },
    { id: 'acompanhamento', label: 'Acompanhamento TC', href: '#acompanhamento', icon: 'Activity', category: 'Relatórios' },
    { id: 'encerramento', label: 'Relatório de Encerramento', href: '#encerramento', icon: 'FileSpreadsheet', category: 'Relatórios' },
    {
        id: 'vendas', label: 'Vendas', href: '#vendas', icon: 'Briefcase', category: 'Comercial',
        children: [
            { id: 'pedidos', label: 'Pedidos', href: '#vendas-pedidos', icon: 'Package' },
            { id: 'orcamentos', label: 'Orçamentos', href: '#vendas-orcamentos', icon: 'DollarSign', badge: 12 },
            { id: 'clientes', label: 'Clientes', href: '#vendas-clientes', icon: 'Users' },
        ],
    },
];

const markActive = (items: SarakNavItem[], route: string): SarakNavItem[] => items.map((item) => ({
    ...item,
    active: item.href === route,
    children: item.children?.map((child) => ({ ...child, active: child.href === route })),
}));

const NOTIFICATIONS = [{ id: 'n1', label: 'Sessão de 12/11 publicada' }];

const App = (): React.ReactElement => {
    const [route, setRoute] = useState(params.get('route') ?? '#sessoes');
    return (
        <SarakUIProvider
            initialTheme={params.get('theme') ?? undefined}
            config={design}
            options={{
                mode: 'app',
                i18n: { languages: ['pt', 'en'], language: 'pt' },
                preferences: { defaultColorMode: params.get('light') === '1' ? 'light' : 'dark' },
            }}
        >
            <div data-testid="frame" style={{ height: '100vh', width: '100%' }}>
                <SarakAppChrome
                    brand={WITH_LOGO ? { name: 'Sarak OS', logoUrl: LOGO } : { name: 'Sarak OS' }}
                    navItems={markActive(NAV, route)}
                    onNavigate={setRoute}
                    user={{ name: 'Sarak User', role: 'user' }}
                    logout={() => undefined}
                    notifications={NOTIFICATIONS}
                    onNotificationSelect={() => undefined}
                    style={{ height: '100%' }}
                >
                    <div data-testid="content" style={{ padding: 24 }}>
                        <h1 style={{ margin: 0 }}>Sessões TCE-SP</h1>
                    </div>
                </SarakAppChrome>
            </div>
        </SarakUIProvider>
    );
};

createRoot(mountNode).render(<App />);
