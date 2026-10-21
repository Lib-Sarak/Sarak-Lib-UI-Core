const APP_TSX_TEMPLATE = `import React, { useEffect, useState } from 'react';
import { SarakAppChrome, SarakTypography, type SarakNavItem } from '@sarak/lib-ui-core';

const NAV_ITEMS: SarakNavItem[] = [
    { id: 'inicio', label: 'Início', href: '/' },
    { id: 'relatorios', label: 'Relatórios', href: '/reports' },
];

export const App: React.FC = () => {
    const [currentPath, setCurrentPath] = useState(() => window.location.pathname);

    useEffect(() => {
        const syncPath = () => setCurrentPath(window.location.pathname);
        window.addEventListener('popstate', syncPath);
        return () => window.removeEventListener('popstate', syncPath);
    }, []);

    const navigate = (path: string) => {
        window.history.pushState({}, '', path);
        setCurrentPath(path);
    };

    const activePath = NAV_ITEMS.some((item) => item.href === currentPath) ? currentPath : '/';
    const activeItem = NAV_ITEMS.find((item) => item.href === activePath) ?? NAV_ITEMS[0];

    return (
        <SarakAppChrome
            brand={{ name: 'Minha Aplicação' }}
            navItems={NAV_ITEMS.map((item) => ({ ...item, active: item.href === activePath }))}
            onNavigate={navigate}
        >
            <main className="flex h-full flex-col gap-4">
                <SarakTypography variant="h1">{activeItem.label}</SarakTypography>
                <SarakTypography variant="body">
                    Edite src/App.tsx para criar as telas e rotas da sua aplicação.
                </SarakTypography>
            </main>
        </SarakAppChrome>
    );
};
`;
export function buildAppTsx() {
    return APP_TSX_TEMPLATE;
}
