---
tipo: "arquitetura"
titulo: "Design Engine e Sarak-Lib-UI-Core"
dominio: "Front-end / Design System"
status: "🟢 Vigente"
tags: ["arquitetura", "design-system", "ui"]
relacionados: []
---

# 1. Propósito
O componente arquitetural **Sarak-Lib-UI-Core** (e seu submódulo Design Engine) atua como o sistema nervoso central do design da plataforma. O propósito primário é prover componentes base independentes e governados 100% por uma abordagem Data-Driven. Toda a customização visual da plataforma deve fluir de um esquema de tokens (`MasterMap`) para propriedades em CSS Variables, garantindo que nenhum estilo fique engessado (hardcoded) no código dos componentes.

# 2. Stack e Ferramentas
- **Linguagem:** TypeScript / React (v18+)
- **Estilização Dinâmica:** TailwindCSS (v4) / Inline CSS Variables Injection
- **Animações:** Framer Motion
- **Visualização de Dados:** Echarts / Recharts
- **Design Gráfico:** ReactFlow / Lucide React

# 3. Diagramas / Estruturas

A arquitetura de renderização obedece a um pipeline estrito:

| Etapa | Responsável | Descrição |
|---|---|---|
| **1. Entidade de Dados** | Banco de Dados / Store | JSON contendo os presets de interface e configurações dos pilares. |
| **2. Engine de Tokens** | `SarakUIProvider` | Converte o JSON em CSS Variables injetadas dinamicamente no `:root` ou container principal. |
| **3. UI Components** | Componentes React | Consomem **exclusivamente** as CSS variables geradas via classes Tailwind (ex: `bg-[var(--theme-primary)]`). Nenhuma cor ou margem é chumbada. |

> A violação do passo 3 por qualquer desenvolvedor (ex: `style={{ color: '#000' }}`) quebra o contrato de renderização dual-theme e personalização de marca.
