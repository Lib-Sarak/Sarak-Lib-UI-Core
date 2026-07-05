---
tipo: "arquitetura"
titulo: "Arquitetura do Motor de Temas e Design Engine"
dominio: "Front-end / Design System"
status: "🟢 Vigente"
tags: ["arquitetura", "design-system", "ui", "core", "sdd", "theme-engine"]
relacionados: []
---

# 1. Propósito
O **Sarak-Lib-UI-Core** (e seu submódulo Design Engine) atua como o sistema nervoso central do design da plataforma. O Motor de Tema Data-Driven atua como a única fonte da verdade e de distribuição visual de propriedades CSS para toda a biblioteca atômica e aplicações clientes. Seu propósito é garantir 100% de dissociação entre lógica de estilos rígidos (hardcoded) e as propriedades reativas do design system. Toda a customização visual deve fluir de um esquema de tokens (`MasterMap`) para propriedades em CSS Variables injetadas de forma sistêmica na raiz do DOM.

# 2. Stack e Ferramentas
- **Linguagem:** TypeScript / React (v18+)
- **Estilização Dinâmica:** TailwindCSS (v4) / Inline CSS Variables Injection (`var(--sarak-..., <fallback>)` / `var(--theme-..., <fallback>)`)
- **Gestão de Estado:** React Context API (`SarakUIProvider`)
- **Dicionário de Tokens:** Typescript Objects (`MASTER_DESIGN_MAP`, `TokenCatalog`)
- **Complementos Visuais:** Framer Motion (Animações), Echarts/Recharts (Gráficos), ReactFlow/Lucide (Nodal/Ícones)

# 3. Diagramas / Estruturas
A arquitetura de renderização e do motor é dividida nas seguintes camadas operacionais num pipeline estrito:

| Etapa | Responsável | Descrição |
|---|---|---|
| **1. Base de Conhecimento** | Banco / `MASTER_DESIGN_MAP` | JSON com presets e catálogo de tokens. Nenhum átomo usa hexadecimais puros. |
| **2. Máquina de Injeção** | `SarakUIProvider` | Intercepta o estado do design e converte JSON em CSS embutido no objeto `style` da raiz do HTML/DOM. |
| **3. UI Components** | Componentes React | Consomem **exclusivamente** as CSS variables reais via classes Tailwind, sempre com fallback (ex: `bg-[var(--sarak-theme-primary,#000)]`). Nenhuma cor ou margem é chumbada. Namespace `--sx-*` é proibido (variável-fantasma; gate `auditor_ghostvars.mjs` = 0). |
| **4. Escopo de Sandboxing** | `<DesignScope>` | Atua como um micro-provider para simulações (Preview), injetando variáveis localmente para múltiplas interfaces sem sujar o tema da página hospedeira. |

> A violação do passo 3 por qualquer desenvolvedor (ex: `style={{ color: '#000' }}`) quebra o contrato de renderização dual-theme e personalização de marca.

## Fluxo de Estado
A lógica e controle de mutação de tokens para aplicações customizadoras é feita via `useThemeEngineState`, que consome os setters globais expostos pelo Provider, garantindo atualizações instantâneas de tema sem recarregar a página (Zero-Reload).
