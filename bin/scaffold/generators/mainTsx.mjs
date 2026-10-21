const EMBEDDED_CSS_IMPORT = `import '@sarak/lib-ui-core/dist/sarak-scoped.css'; // Modo Embarcado (Spec 24): CSS escopado a .sarak-scope\n`;

export function buildMainTsx({ answers }) {
    const isEmbedded = answers.mode === 'embedded';
    const cssImport = isEmbedded ? EMBEDDED_CSS_IMPORT : '';
    const providerOptions = isEmbedded ? " options={{ mode: 'embedded' }}" : '';

    return `import React from 'react';
import ReactDOM from 'react-dom/client';
${cssImport}import { SarakUIProvider } from '@sarak/lib-ui-core';
import { App } from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <SarakUIProvider${providerOptions}>
            <App />
        </SarakUIProvider>
    </React.StrictMode>,
);
`;
}
