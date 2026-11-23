import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { SarakUIProvider } from '../../src/core/Provider/SarakUIProvider';
import { sarakGetAllDesignTokens } from '../../src/core/Design/master-map';
import { DecisionTokenList } from '../../src/features/DesignEngine/Main/components/DecisionTokenList';
import type { SarakDesignState } from '../../src/core/Provider/types';
import type { SarakTokenValue } from '../../src/core/Design/types';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('painel-avisa-entry: #root ausente no harness.');

const params = new URLSearchParams(window.location.search);
const SHOWN = ['navigationStyle', 'navbarLayout', 'sidebarPosition', 'isNavHidden', 'sidebarWidth', 'bodySize'];
const overrides = JSON.parse(params.get('draft') ?? '{}') as Record<string, SarakTokenValue>;

const Column: React.FC = () => {
    const tokens = useMemo(() => SHOWN.map((id) => sarakGetAllDesignTokens().find((token) => token.id === id)!), []);
    const [draft, setDraft] = useState<Record<string, SarakTokenValue>>(() => ({
        ...Object.fromEntries(sarakGetAllDesignTokens().map((token) => [token.id, token.defaultValue as SarakTokenValue])),
        ...overrides,
    }));
    return (
        <div style={{ width: 360, padding: 12 }} data-testid="column">
            <DecisionTokenList
                tokens={tokens}
                catalogMap={new Map()}
                draft={draft as unknown as SarakDesignState}
                updateDraft={(id, value) => setDraft((current) => ({ ...current, [id]: value }))}
                previewDevice="desktop"
            />
        </div>
    );
};

createRoot(rootElement).render(
    <SarakUIProvider config={overrides}>
        <Column />
    </SarakUIProvider>,
);
