# 💠 Sarak-Lib-UI-Core (Design Engine & Módulos-Plugin)

O **Sarak-Lib-UI-Core** é o motor de interface industrial de alta performance do ecossistema Sarak. Ele combina um **Design Engine Data-Driven** (temas/tokens em JSON, sem backend) com um **modelo de consumo por módulos-plugin 100% React** (`SarakUIProvider` + `SarakShell` + `registerSarakModule`/`registerLocalComponent`) — o consumidor escreve suas telas como componentes React comuns usando os átomos e os tokens públicos (`var(--sarak-*)`), sem manifesto JSON. *(O antigo motor de renderização de páginas por manifesto foi removido — Spec 46; ver `specs/plan/46-remover-motor-de-manifesto.md` para o histórico.)*

---

## 📦 Instalação num Sistema Consumidor (Plug & Play)

**Toda a instalação — do zero — é coberta por uma única skill.** Um prompt simples é suficiente:

> "Baixe a biblioteca Sarak-UI `github.com/Lib-Sarak/Sarak-Lib-UI-Core`, ela será responsável pelo Shell e tema do sistema."

Isso deve disparar **[`ui-integra-consumidor`](.agents/skills/ui-integra-consumidor/SKILL.md)** — instala o pacote e as `peerDependencies`, roda o scaffolder (`npx sarak-ui init`) que gera `SarakUIProvider` + `SarakShell` + um módulo de exemplo registrado, e conduz o handoff para o consumidor escrever seus próprios módulos de negócio. **CSS é automático** — a lib injeta o próprio stylesheet em runtime ao ser importada; nenhum `import '...css'` manual é necessário no caso comum.

Se preferir rodar manualmente, o comando de instalação (via GitHub, sem publish no npm registry) é:
```bash
npm install github:Lib-Sarak/Sarak-Lib-UI-Core
npm install framer-motion lucide-react recharts echarts echarts-for-react reactflow react-grid-layout react-markdown react-syntax-highlighter react-dropzone pdfjs-dist clsx tailwind-merge date-fns @tanstack/react-virtual axios pg tailwindcss
```
Detalhes de cada `peerDependency`, a entrevista de infraestrutura (modo app/embarcado, porta do front) e o passo-a-passo completo estão na skill `ui-integra-consumidor` — ela é a fonte da verdade, não este README.

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

### 2. O modelo de módulos-plugin (Spec 04/43 — modelo oficial)
Aplicações hosts registram cada módulo de negócio via `registerSarakModule({ id, label, icon, ... })` + `registerLocalComponent(id, Component)` — componentes React comuns, escritos livremente, usando os átomos da biblioteca (`SarakButton`, `SarakCardGrid`, `SarakTable`, etc.) e os tokens públicos (`var(--sarak-*)`) para responderem à troca de tema.
`SarakShell`, sob `SarakUIProvider`, resolve a navegação (Sidebar/Topbar/Dock, conforme o tema) e o roteamento entre os módulos registrados, sem rota declarada à mão. Ver `docs/component-catalog.md` para o catálogo gerado de componentes/props/tokens.

---

## 📦 Inicialização e Desenvolvimento (deste repositório)

### Comandos Principais
- `npm run dev`: Inicia o **Canvas do Design Engine** e a área de Live Preview local. Essencial para testar novos presets, tipografia e catálogos atômicos.
- `npm run build`: Compila a biblioteca (bundles JS via `tsup`, CSS via Tailwind CLI, e injeta o CSS compilado no bundle via `scripts/inject-css.mjs`) criando a pasta `dist/` pronta para ser consumida como pacote `@sarak/lib-ui-core`.
- `npm run build:js` e `npm run build:css`: Sub-comandos isolados (não injetam o CSS sozinhos — rode `npm run build` para o bundle final consumível).

### Consumindo na Aplicação Host (módulos-plugin)
```tsx
import ReactDOM from 'react-dom/client';
import { SarakUIProvider, SarakShell, registerSarakModule, registerLocalComponent } from '@sarak/lib-ui-core';
import { MeuModulo } from './modules/MeuModulo';

registerLocalComponent('meu-modulo', MeuModulo);
registerSarakModule({ id: 'meu-modulo', label: 'Meu Módulo', icon: 'Box' });

ReactDOM.createRoot(document.getElementById('root')!).render(
    <SarakUIProvider>
        <SarakShell />
    </SarakUIProvider>,
);
```
Nenhum import de CSS é necessário — o `SarakUIProvider` injeta o stylesheet automaticamente. Veja a seção **Instalação num Sistema Consumidor** acima para o passo-a-passo completo (peerDependencies, scaffolder, modo embarcado).

---

Mantendo a ordem estrutural e garantindo as normativas de *Design Architecture*, este repositório continua modular, escalável e 100% "Production Ready" para arquiteturas Headless/Zero-Code.
