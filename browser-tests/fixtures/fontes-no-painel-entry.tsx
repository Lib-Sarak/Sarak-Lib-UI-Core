import React from 'react';
import { createRoot } from 'react-dom/client';
import { SarakUIProvider } from '../../src/core/Provider/SarakUIProvider';
import { TypographyCatalog } from '../../src/features/DesignEngine/Canvas/components/TypographyCatalog';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('fontes-no-painel-entry: #root ausente no harness.');

const params = new URLSearchParams(window.location.search);
const source = params.get('origem') ?? 'bundled';
const baseUrl = params.get('fontes') ?? undefined;

/** A galeria de fontes do painel dentro de um Provider com a origem de fontes pedida na URL. */
createRoot(rootElement).render(
    <SarakUIProvider initialTheme="sarak-sovereign" options={{ fonts: { source: source as 'bundled' | 'google' | 'none', baseUrl } }}>
        <div style={{ width: '1100px', height: '700px', overflow: 'auto' }} data-testid="galeria-de-fontes">
            <TypographyCatalog onApplyPreset={() => undefined} currentMode="dark" />
        </div>
    </SarakUIProvider>,
);
