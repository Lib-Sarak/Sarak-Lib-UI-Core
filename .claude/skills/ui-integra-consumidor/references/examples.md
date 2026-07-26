# Exemplos de Importação

> Os nomes usados aqui são poucos e estáveis. Para qualquer LISTA (componentes, props, tokens,
> ícones), a fonte é `sarak-ui/catalog.json` — nunca este arquivo.

## Exemplo Bom — instalação mínima, base como KIT (o formato que serve às 4 topologias)

**Situação:** projeto React/Vite; a lib entra como componentes + cromo + central de tema, e o
roteamento continua sendo do consumidor.

```bash
npm init -y                      # só se ainda não existir — evita instalar num projeto ancestral
npm install @sarak/lib-ui-core
npx sarak-ui init --mode app --frontend-port 5173
npm install                      # o init só grava package.json; quem baixa é o npm
```

```tsx
// src/main.tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { SarakUIProvider, SarakAppChrome, CustomizationPanel, SARAK_REFERENCE_THEMES } from '@sarak/lib-ui-core';

const TEMAS = SARAK_REFERENCE_THEMES;   // par COMPLETO — parta daqui, nunca de um tema do zero

function App() {
    const [rota, setRota] = React.useState(window.location.pathname);
    return (
        <SarakUIProvider
            customThemes={TEMAS}
            initialTheme={TEMAS[0].id}
            options={{ persistence: { storageKey: 'meu-sistema:design' } }}
        >
            <SarakAppChrome
                brand={{ name: 'Meu Sistema' }}
                navItems={[{ id: 'inicio', label: 'Início', icon: 'Home', href: '/' }]}
                onNavigate={(href) => { window.history.pushState({}, '', href); setRota(href); }}
            >
                {rota.startsWith('/design') ? <CustomizationPanel /> : <MinhaTela />}
            </SarakAppChrome>
        </SarakUIProvider>
    );
}

createRoot(document.getElementById('root')!).render(<App />);
```

**Por que está correto:** nenhum `import '...css'` aparece — o Provider injeta o stylesheet em runtime
assim que o módulo é importado (`<style id="sarak-ui-core-styles">`). O cromo é **por-app** e
apresentacional (sem host, sem registro). A `storageKey` compartilhada é o que faz a escolha de tema
atravessar apps de mesma origem. Se o console mostrar `[Sarak] CSS não detectado...`, a injeção
automática falhou (bundler removendo o side-effect); só nesse caso importe `@sarak/lib-ui-core/dist/sarak.css`.

## Exemplo Bom — base como HOST (módulos-plugin), um app com vários módulos

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { SarakUIProvider, SarakShell, registerSarakModule, registerLocalComponent } from '@sarak/lib-ui-core';
import { ClientesModule } from './modules/ClientesModule';

function safeRegister(id: string, component: React.ComponentType | undefined) {
    if (!component) {
        console.warn(`[Sarak] Componente '${id}' é undefined. Verifique o import.`);
        return;
    }
    registerLocalComponent(id, component);
}

safeRegister('clientes', ClientesModule);
registerSarakModule({ id: 'clientes', label: 'Clientes', icon: 'Users' });

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <SarakUIProvider>
            <SarakShell />
        </SarakUIProvider>
    </React.StrictMode>,
);
```

**Por que está correto:** o módulo é um componente React comum; a base resolve navegação e roteamento
a partir do registro — sem rota declarada à mão, sem manifesto. `icon` precisa ser um nome do
catálogo (`tokens.iconNames`).

## Exemplo Bom — SSR/Next.js (evitando FOUC)

```tsx
// app/layout.tsx
import '@sarak/lib-ui-core/dist/sarak.css'; // opcional: SÓ para SSR, evita flash sem estilo
import { SarakUIProvider } from '@sarak/lib-ui-core';
```

**Por que está correto:** a injeção automática é em runtime (JS do cliente) — em SSR isso é um
instante sem estilo até a hidratação. É a **única** situação em que o import manual de CSS é
recomendado. Em SPA, não faça.

## Exemplo Bom — um módulo de negócio temável

```tsx
// src/modules/ClientesModule.tsx
import { SarakTypography, SarakGrid } from '@sarak/lib-ui-core';

export const ClientesModule = () => (
    <SarakGrid templateColumns={{ mob: '1fr', desk: 'repeat(3, 1fr)' }} gap="md">
        <SarakTypography variant="h1" content="Clientes" />
        {/* Componente próprio: só tokens públicos, logo a central o alcança. */}
        <article
            style={{
                background: 'var(--sarak-card-bg, transparent)',
                borderRadius: 'var(--sarak-card-radius, 8px)',
                padding: 'var(--sarak-card-padding-md, 16px)',
            }}
        >
            …
        </article>
    </SarakGrid>
);
```

**Por que está correto:** mistura componentes da lib com marcação própria **usando tokens** — o
resultado inteiro responde à troca de tema. `SarakGrid` já colapsa para 1 coluna no celular, sem CSS
do consumidor.

## Exemplo Ruim — montar a interface em JSON

```tsx
import { SarakUIProvider, SarakManifestRendererDefault } from '@sarak/lib-ui-core';
import appManifest from './manifests/app.manifest.json';

<SarakUIProvider>
    <SarakManifestRendererDefault payload={appManifest} />   // ❌ não existe mais
</SarakUIProvider>
```

**Por que é ruim:** o motor de renderização por manifesto **foi REMOVIDO**. Esse import nem resolve.
O modelo é 100% React: componentes e módulos escritos em TSX. Se algum material antigo mandar
"montar telas em JSON", ele está desatualizado — confira no `catalog.json`.

## Exemplo Ruim — hardcode fora do contrato de tokens

```tsx
<div style={{ background: '#1e293b', borderRadius: 12, padding: 16 }}>…</div>
```

**Por que é ruim:** funciona hoje e fica **fora da central para sempre** — trocar o tema não muda nada
aqui, e ninguém descobre até alguém trocar o tema. O certo é
`var(--sarak-card-bg, …)` / `var(--sarak-card-radius, …)` / `var(--sarak-card-padding-md, …)`, com os
nomes conferidos no `catalog.json` → `tokens.cssVars`.
