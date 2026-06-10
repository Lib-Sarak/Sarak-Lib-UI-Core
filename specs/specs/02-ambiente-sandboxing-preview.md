---
tipo: "spec"
titulo: "Ambiente de Sandboxing (Preview Canvas)"
dominio: "DesignEngine / Canvas"
status: "🟢 Implementado"
prioridade: "Alta"
tags: ["spec", "sandboxing", "preview", "iframe", "mocks"]
relacionados: ["01-painel-customizacao-temas"]
---

# 1. Visão Geral
O simulador visual (`PreviewCanvas.tsx`) é uma janela isolada (Sandboxed) onde as alterações visuais do Painel de Customização são renderizadas em tempo real sem "contaminar" ou afetar o painel host. Essa funcionalidade permite testar como o Dashboard e os componentes atômicos reagem aos novos tokens (ex: cor principal, arredondamento) e em diferentes simuladores de Viewport (Desktop, Mobile, Tablet).

# 2. Regras de Negócio
- **Regra 1 (Escopo Perfeito):** O Preview não usa a injeção global no elemento `html` ou `body`. Ele delega a renderização ao wrapper `<DesignScope>`, que cria uma barreira de CSS injetando as variáveis do rascunho (`draftVariables`) restritas apenas a essa subárvore do DOM.
- **Regra 2 (Responsividade Simulada):** O contêiner de renderização não se baseia no resize da tela real, mas sim na configuração `previewDevice`. As metragens exatas de Desktop (100%), Tablet (768px) e Mobile (375px) são simuladas via manipulação de escala (`transform: scale`) e constraint de `width` interno.
- **Regra 3 (Modularidade de Mocks):** Para exibir um teste coeso da UI Core, não há componentes monolíticos. O mockup engatado na janela (ex: `DashboardMock`) é montado por sub-pedaços arquiteturais estritos (`DashboardHeader`, `DashboardSidePanel`, etc.) para simular a paridade atômica da biblioteca.

# 3. Critérios de Aceite
- [x] O usuário pode alterar a chave entre Desktop, Tablet e Mobile, e a escala interna reage instantaneamente cortando as barras de scroll excedentes via tailwind (`overflow-hidden`).
- [x] Elementos injetados dentro do Preview respondem às variáveis dinâmicas do motor (ex: mudou a cor no painel, a Sidebar do Mock muda).
- [x] Nenhum vazamento global de CSS ocorre: Se o mock receber `background-color: black`, o host lateral de edição do sistema continua no tema padrão.

# 4. Plano de Testes (Quality Gate)

## Testes Unitários
- [x] **Deve** isolar o style container garantindo que as propriedades `style={{ ... }}` do `DesignScope` capturem e transformem o objeto `draft` sem erros.

## Testes E2E (Integração Lógica)
- [x] O `DashboardMock` renderizado dentro da casca deve validar a passagem fluida de dados simulados em todos os submódulos (Headers, Cards e Metricas).
