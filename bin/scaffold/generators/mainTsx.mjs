/**
 * `src/main.tsx` — entry point do Modo App: Provider + Renderer + navegação via
 * History API pura (sem router novo — Golden Path não adiciona dependência).
 * Modo Embarcado (Spec 24) troca o CSS automático pela variante escopada e
 * monta o Provider com `options={{ mode: 'embedded' }}`.
 */
const EMBEDDED_CSS_IMPORT = `import '@sarak/lib-ui-core/dist/sarak-scoped.css'; // Modo Embarcado (Spec 24): CSS escopado a .sarak-scope\n`;

const APP_PROVIDER_OPTIONS = '';
const EMBEDDED_PROVIDER_OPTIONS = " options={{ mode: 'embedded' }}";

export function buildMainTsx({ answers }) {
    const isEmbedded = answers.mode === 'embedded';
    const cssImport = isEmbedded ? EMBEDDED_CSS_IMPORT : '';
    const providerOptions = isEmbedded ? EMBEDDED_PROVIDER_OPTIONS : APP_PROVIDER_OPTIONS;

    return `import React from 'react';
import ReactDOM from 'react-dom/client';
${cssImport}import {
    SarakUIProvider,
    SarakManifestRendererDefault,
    createSarakDataStore,
} from '@sarak/lib-ui-core';
import { dataStore, networkInterceptor } from './Sarak-Engine';
import appManifest from './manifests/app.manifest.json';

// \`route\` reage à navegação do host (Spec 33) via History API pura — sem router
// novo. \`routerInterceptor\` chama \`history.pushState\` e reflete de volta no state.
function useHistoryRoute(): [string, (to: string) => void] {
    const [route, setRoute] = React.useState(window.location.pathname);

    React.useEffect(() => {
        const onPopState = () => setRoute(window.location.pathname);
        window.addEventListener('popstate', onPopState);
        return () => window.removeEventListener('popstate', onPopState);
    }, []);

    const navigate = React.useCallback((to: string) => {
        window.history.pushState({}, '', to);
        setRoute(to);
    }, []);

    return [route, navigate];
}

function App() {
    const [route, navigate] = useHistoryRoute();

    return (
        <SarakUIProvider${providerOptions}>
            <SarakManifestRendererDefault
                payload={appManifest}
                dataStore={dataStore}
                networkInterceptor={networkInterceptor}
                routerInterceptor={navigate}
                route={route}
            />
        </SarakUIProvider>
    );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
);

// Export mantido para quem quiser instanciar uma 2ª store isolada (ex.: testes).
export { createSarakDataStore };
`;
}
