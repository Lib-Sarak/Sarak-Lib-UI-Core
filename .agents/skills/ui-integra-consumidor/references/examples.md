# Exemplos de Importação

## Exemplo Bom — Instalação mínima (SPA/Vite/CRA), modelo módulos-plugin (Spec 43/45)
**Situação:** Projeto novo, frontend puro (sem SSR), consumindo a base no padrão `Sarak-MyService`.

**Instalação completa, do zero:**
```bash
npm install @sarak/lib-ui-core
npm install framer-motion lucide-react recharts echarts echarts-for-react reactflow react-grid-layout react-markdown react-syntax-highlighter react-dropzone pdfjs-dist clsx tailwind-merge date-fns @tanstack/react-virtual
```

**Entry point (`main.tsx`) — gerado pelo `init`, reproduzido aqui para referência:**
```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { SarakUIProvider, SarakShell, registerSarakModule, registerLocalComponent } from '@sarak/lib-ui-core';
import { ExampleModule } from './modules/ExampleModule';

function safeRegister(id: string, component: React.ComponentType | undefined) {
    if (!component) {
        console.warn(`[Sarak] Componente '${id}' é undefined. Verifique o import.`);
        return;
    }
    registerLocalComponent(id, component);
}

safeRegister('exemplo', ExampleModule);
registerSarakModule({ id: 'exemplo', label: 'Exemplo', icon: 'Box' });

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <SarakUIProvider>
            <SarakShell />
        </SarakUIProvider>
    </React.StrictMode>,
);
```

**Por que isso é correto:** nenhum `import '...css'` aparece em lugar nenhum. O `SarakUIProvider` injeta o stylesheet completo em runtime assim que é importado (um `<style id="sarak-ui-core-styles">` no `<head>`, gerado no build da lib) — a tela já sai estilizada. Nenhum manifesto/JSON é necessário: o `SarakShell` resolve a navegação a partir dos módulos registrados. Se o `console` mostrar `[Sarak] CSS não detectado...`, é sinal de que a injeção automática falhou (bundler removendo o side-effect); só nesse caso, como último recurso, importe manualmente `@sarak/lib-ui-core/dist/sarak.css`.

## Exemplo Bom — SSR/Next.js (evitando FOUC)
**Situação:** App Next.js com `layout.tsx` renderizado no servidor; quer o CSS já presente no HTML inicial (sem flash de conteúdo sem estilo).

```tsx
// app/layout.tsx
import '@sarak/lib-ui-core/dist/sarak.css'; // opcional: só para SSR sem FOUC
import { SarakUIProvider } from '@sarak/lib-ui-core';
```

**Por que isso é correto:** a injeção automática (runtime, via JS) só acontece depois que o bundle do cliente executa — em SSR isso significa um instante sem estilo até a hidratação. Importar o CSS manualmente no `layout.tsx` server-side elimina esse flash. Essa é a ÚNICA situação em que o import manual de CSS é recomendado — no caso comum (SPA), não faça isso.

## Exemplo Bom — Registrar um módulo próprio
**Situação:** o consumidor quer adicionar uma feature de negócio (ex.: "Clientes") ao Shell.

```tsx
// src/modules/ClientesModule.tsx
import { SarakCardGrid, SarakTypography } from '@sarak/lib-ui-core';

export const ClientesModule = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sarak-layout-gap-md, 1rem)' }}>
        <SarakTypography variant="h1">Clientes</SarakTypography>
        <SarakCardGrid items={meusClientes} mapping={{ title: 'nome', subtitle: 'email' }} />
    </div>
);
```
```tsx
// main.tsx
import { ClientesModule } from './modules/ClientesModule';
safeRegister('clientes', ClientesModule);
registerSarakModule({ id: 'clientes', label: 'Clientes', icon: 'Users' });
```

**Por que isso é correto:** o módulo é um componente React comum, usa componentes Sarak (logo, é tematizado automaticamente pela central) e é registrado do mesmo jeito que o módulo de exemplo do starter — sem manifesto, sem rota declarada à mão.

## Exemplo Ruim
**Situação:** O Agente tentou "instalar" a Sarak UI escrevendo a interface via manifesto JSON como se fosse a única forma de consumo.

**O Erro Comum:**
```tsx
import { SarakUIProvider, SarakManifestRendererDefault } from '@sarak/lib-ui-core';
import appManifest from './manifests/app.manifest.json';

// ⚠️ Não é mais o modelo de consumo oficial (Spec 43) — o motor de manifesto
// segue disponível como caminho OPCIONAL, mas orientar o consumidor a montar
// TODA a interface em JSON contradiz o padrão real do único consumidor em
// produção (Sarak-MyService), que registra módulos React.
<SarakUIProvider>
    <SarakManifestRendererDefault payload={appManifest} />
</SarakUIProvider>
```

**Por que é ruim:** trata o motor de manifesto (opcional, Spec 11) como se fosse o modelo de consumo. O padrão oficial é registrar módulos React (`registerSarakModule`/`registerLocalComponent`) sob `SarakUIProvider`+`SarakShell` — ver o exemplo do topo deste arquivo.
