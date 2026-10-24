import React from 'react';
import { createRoot } from 'react-dom/client';
import { SarakIcon, SarakSearch, SarakShellSearchWidget, SarakUIProvider } from '@sarak/lib-ui-core';

const searchItems = [
    {
        id: '#/propostas',
        label: 'Propostas',
        category: 'Comercial',
        icon: <SarakIcon name="FileText" size={14} />,
    },
    {
        id: '#/projetos',
        label: 'Projetos',
        category: 'Operação',
        icon: <SarakIcon name="Folder" size={14} />,
    },
];

const SearchLinksHarness: React.FC = () => {
    const parameters = new URLSearchParams(window.location.search);
    const scene = parameters.get('cena');
    const barWidth = Number(parameters.get('largura') ?? 240);

    return (
        <SarakUIProvider>
            {scene === 'bar' ? (
                <div data-testid="search-bar-host" style={{ width: `${barWidth}px` }}>
                    <SarakShellSearchWidget variant="bar" onClick={() => undefined} items={searchItems} />
                </div>
            ) : (
                <SarakSearch isOpen onClose={() => undefined} items={searchItems} />
            )}
        </SarakUIProvider>
    );
};

createRoot(document.getElementById('root')!).render(<SearchLinksHarness />);
