/**
 * `src/main.tsx` — starter padrão (Spec 45): modelo módulos-plugin, o mesmo
 * padrão do `Sarak-MyService` — `SarakUIProvider` + `SarakShell`, um módulo de
 * exemplo registrado via `registerSarakModule`/`registerLocalComponent` (o
 * `safeRegister` espelha `Sarak-MyService/src/main.tsx`). Sem
 * `SarakManifestRenderer`, sem manifesto JSON, sem backend — tema persiste em
 * localStorage (embutido no Provider). Modo Embarcado (Spec 24) troca o CSS
 * automático pela variante escopada e monta o Provider com
 * `options={{ mode: 'embedded' }}`.
 */
const EMBEDDED_CSS_IMPORT = `import '@sarak/lib-ui-core/dist/sarak-scoped.css'; // Modo Embarcado (Spec 24): CSS escopado a .sarak-scope\n`;

/**
 * Sem `defaultModuleId`, o Shell sempre abre no módulo nativo "Design Engine"
 * (`mx-customization`, prioridade 9999 — vence qualquer módulo do consumidor
 * por padrão). Setar o módulo de exemplo como default é o que faz a tela
 * inicial do starter mostrar "Bem-vindo à Sarak UI" em vez do Design Engine.
 */
const APP_PROVIDER_OPTIONS = " options={{ theme: { defaultModuleId: 'exemplo' } }}";
const EMBEDDED_PROVIDER_OPTIONS = " options={{ mode: 'embedded', theme: { defaultModuleId: 'exemplo' } }}";

export function buildMainTsx({ answers }) {
    const isEmbedded = answers.mode === 'embedded';
    const cssImport = isEmbedded ? EMBEDDED_CSS_IMPORT : '';
    const providerOptions = isEmbedded ? EMBEDDED_PROVIDER_OPTIONS : APP_PROVIDER_OPTIONS;

    return `import React from 'react';
import ReactDOM from 'react-dom/client';
${cssImport}import {
    SarakUIProvider,
    SarakShell,
    registerSarakModule,
    registerLocalComponent,
} from '@sarak/lib-ui-core';
import { ExampleModule } from './modules/ExampleModule';

// Registro Industrial de Componentes com Proteção — espelha o padrão real do
// Sarak-MyService (\`safeRegister\`/\`registerSarakModuleSafe\` em
// Sarak-MyService/src/main.tsx): nunca deixe um componente \`undefined\` quebrar
// o registro em silêncio.
function safeRegister(id: string, component: React.ComponentType | undefined) {
    if (!component) {
        // eslint-disable-next-line no-console
        console.warn(\`[Sarak] Componente '\${id}' é undefined. Verifique o import.\`);
        return;
    }
    registerLocalComponent(id, component);
}

// Módulo de EXEMPLO — apague e registre os seus próprios módulos de negócio do
// mesmo jeito. A base gera a navegação (Shell) sozinha a partir do registro;
// não é preciso declarar rota nem manifesto.
safeRegister('exemplo', ExampleModule);
registerSarakModule({ id: 'exemplo', label: 'Exemplo', icon: 'Box' });

function App() {
    return (
        <SarakUIProvider${providerOptions}>
            <SarakShell />
        </SarakUIProvider>
    );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
);
`;
}
