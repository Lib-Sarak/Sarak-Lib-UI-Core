# 💠 Sarak-Lib-UI-Core (Design Engine & Manifest Renderer)

O **Sarak-Lib-UI-Core** é o motor de interface industrial de alta performance do ecossistema Sarak. Ele utiliza uma arquitetura baseada num **Manifest Renderer (Zero-Code Frontend)** e um **Design Engine Data-Driven**, permitindo que sistemas inteiros sejam renderizados e estilizados puramente através de manifestos JSON declarativos, sem a necessidade de escrever código de interface repetitivo ou hardcoded.

---

## 📦 Instalação num Sistema Consumidor (Plug & Play)

**Toda a instalação — do zero — é coberta por duas skills.** Um prompt simples é suficiente:

> "Baixe a biblioteca Sarak-UI `github.com/Lib-Sarak/Sarak-Lib-UI-Core`, ela será responsável por toda a renderização do sistema."

Isso deve disparar, na ordem:

1. **[`ui-integra-consumidor`](.agents/skills/ui-integra-consumidor/SKILL.md)** — instala o pacote e as `peerDependencies`, acopla `SarakUIProvider` + `SarakManifestRenderer`, configura `SarakDataStore` e os Interceptors (rede/rota). **CSS é automático** — a lib injeta o próprio stylesheet em runtime ao ser importada; nenhum `import '...css'` manual é necessário no caso comum.
2. **[`ui-integra-escrever-manifesto`](.agents/skills/ui-integra-escrever-manifesto/SKILL.md)** — a partir daí, ensina a compor as telas via JSON (o "manifesto") consumido pelo `SarakManifestRenderer`.

Se preferir rodar manualmente, o comando de instalação (via GitHub, sem publish no npm registry) é:
```bash
npm install github:Lib-Sarak/Sarak-Lib-UI-Core
npm install framer-motion lucide-react recharts echarts echarts-for-react reactflow react-grid-layout react-markdown react-syntax-highlighter react-dropzone pdfjs-dist clsx tailwind-merge date-fns @tanstack/react-virtual axios pg tailwindcss
```
Detalhes de cada `peerDependency`, a entrevista de infraestrutura (Design Agent opcional, DataStore, roteamento) e o passo-a-passo completo estão na skill `ui-integra-consumidor` — ela é a fonte da verdade, não este README.

---

## 🤖 Guia Rápido para Agentes IA (Contexto Inicial — Desenvolvimento DESTA Biblioteca)

> **Atenção Agente:** A seção acima é para quem está *consumindo* a lib num outro projeto. Esta seção é para quem está *desenvolvendo* o próprio `Sarak-Lib-UI-Core` (i.e., você está com este repositório aberto).

Este módulo é estritamente regulado por 4 skills principais da Sarak que devem ditar o seu comportamento e escolhas de código:

1. **`/ui-arquitetura-design`**: **Regra de Ouro do Design Engine.** NENHUMA propriedade visual (como `margin: 10px`, `color: #fff`, ou `bg-[#050505]`) deve ser inserida de forma "hardcoded" ou "inline" nos componentes. A estilização deve seguir o fluxo pipeline: `Schema → Master Map → CSS Variables → Tailwind Classes`.
2. **`/ui-novo-componente`**: **Regra da Paridade 1:1:1:1:1.** Ao adicionar um novo "token" de design ou componente base, ele deve obrigatoriamente ser refletido em: `Schema TS`, `MasterMap`, `Banco de Dados`, `Gêmeo Digital (Presets)` e `Catálogo JSON`.
3. **`/padrao-escrita`**: Funções curtas (≤ 40 linhas, ≤ 3 níveis aninhamento), modularidade extrema e encapsulamento rigoroso.
4. **`/code-limpeza-projeto`**: Manter a árvore limpa (Zero lixo, TODOs abandonados ou variáveis mortas).

### Integração com Tailwind v4
Este projeto utiliza **Tailwind CSS v4**. Isso significa que as variáveis de cor geradas pelo Design Engine (ex: `--sarak-card-bg` ou `--sarak-bg-base`) são mapeadas no bloco `@theme` no arquivo `src/styles/sarak-base.css` e expostas como variáveis semânticas do Tailwind (`--color-theme-card`, `--color-theme-bg`).
- **NUNCA use:** `bg-[var(--theme-card)]` ou classes dinâmicas arbitrárias de fallback de CSS puro se a variável existir no `@theme`.
- **USE SEMPRE:** As classes semânticas canônicas nativas como `bg-theme-card`, `bg-theme-bg`, `bg-theme-sidebar`, `border-theme-border`, e `text-theme-text`. Elas se encarregam da reatividade nativa e transparência correta sem causar falhas de escurecimento.

---

## 🚀 Como Funciona a Arquitetura

A biblioteca funciona como um barramento centralizado de UI que opera em dois grandes eixos:

### 1. O Design Engine (Motor Visual)
Responsável por orquestrar a estética do sistema de maneira unificada e reativa.
- Ele recebe um JSON de configuração (o "Preset"/tema).
- O hook `useDesignVariables` transforma essas definições de alto nível em **CSS Variables Globais**.
- O componente `DesignInjector` pendura essas variáveis no `:root` e no `body` da aplicação de forma transparente.
- Os componentes físicos e o Tailwind CSS (`@theme`) consomem essas variáveis passivamente, gerando mudanças globais instantâneas sem a necessidade de re-renderizações onerosas no React.

### 2. O Manifest Renderer (Motor Lógico — Spec 11)
Aplicações hosts injetam um `payload` JSON (o "Manifesto") descrevendo a árvore de telas inteira — componentes, condicionais (`renderIf`), loops (`renderFor`), two-way binding (`model`) e eventos (`actions`).
O `SarakManifestRenderer` interpreta esse JSON nó a nó, resolve cada `type` contra o Registry de componentes atômicos e trafega eventos entre a UI e a lógica de negócio externa (via `networkInterceptor`/`routerInterceptor`, injetados pelo consumidor). Ver a skill **`ui-integra-escrever-manifesto`** para a gramática completa.

---

## 📦 Inicialização e Desenvolvimento (deste repositório)

### Comandos Principais
- `npm run dev`: Inicia o **Canvas do Design Engine** e a área de Live Preview local. Essencial para testar novos presets, tipografia e catálogos atômicos.
- `npm run build`: Compila a biblioteca (bundles JS via `tsup`, CSS via Tailwind CLI, e injeta o CSS compilado no bundle via `scripts/inject-css.mjs`) criando a pasta `dist/` pronta para ser consumida como pacote `@sarak/lib-ui-core`.
- `npm run build:js` e `npm run build:css`: Sub-comandos isolados (não injetam o CSS sozinhos — rode `npm run build` para o bundle final consumível).

### Consumindo na Aplicação Host (`SarakManifestRenderer`)
```tsx
import ReactDOM from 'react-dom/client';
import { SarakUIProvider, SarakManifestRendererDefault, createSarakDataStore } from '@sarak/lib-ui-core';

const store = createSarakDataStore({ initialState: {} });

ReactDOM.createRoot(document.getElementById('root')!).render(
    <SarakUIProvider>
        <SarakManifestRendererDefault payload={meuManifesto} dataStore={store} />
    </SarakUIProvider>,
);
```
Nenhum import de CSS é necessário — o `SarakUIProvider` injeta o stylesheet automaticamente. Veja a seção **Instalação num Sistema Consumidor** acima para o passo-a-passo completo (peerDependencies, interceptors, Design Agent opcional).

---

Mantendo a ordem estrutural e garantindo as normativas de *Design Architecture*, este repositório continua modular, escalável e 100% "Production Ready" para arquiteturas Headless/Zero-Code.
