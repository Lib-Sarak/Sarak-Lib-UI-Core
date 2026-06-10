---
tipo: "spec"
titulo: "Estrutura Shell e Discovery"
dominio: "Core / Roteamento"
status: "🟢 Implementado"
prioridade: "Alta"
tags: ["spec", "shell", "layout", "discovery", "routing"]
relacionados: ["03-padrao-biblioteca-atomica"]
---

# 1. Visão Geral
A Biblioteca Sarak UI Core não provê apenas botões isolados. Ela orquestra um arcabouço estrutural ("Shell") que hospeda as interfaces consumidoreas. A diretriz de Shell define componentes maciços de navegação padrão (Layouts de Painel Lateral, Headers globais e navegações Tabulares), enquanto o componente de Discovery mapeia módulos internos (ou dinâmicos) do sistema, entregando uma plataforma coesa ao invés de páginas soltas.

# 2. Regras de Negócio
- **Regra 1 (Padronização de Casca):** Os componentes de Shell (`SarakLayoutBase`, `SarakSidebar`) contêm propriedades de navegação e breadcrumbs fixas para eliminar a necessidade de reinventar a roda no sistema consumidor. A injeção da lógica de navegação (Router) é passada via injetores ou hooks adaptáveis.
- **Regra 2 (Reatividade de Espaço):** O layout casca é totalmente responsivo, esmagando ou expandindo a Content Area conforme o redimensionamento do painel (Sidebar em mobile vira um off-canvas drawer).
- **Regra 3 (Discovery Indexing):** O módulo `Discovery` funciona como um localizador de menus. Ele registra "apps" e "abas" no ecossistema global do layout do usuário, permitindo roteamento nativo sem conflitos.

# 3. Critérios de Aceite
- [x] O `SarakLayoutBase` engole perfeitamente children via React Node, envolvendo o conteúdo com o container de limites máximos (ex: max-w-7xl, p-4).
- [x] A Sidebar e Headbar compartilham o mesmo Z-index semântico, onde o Header sempre cobre ou cede à sidebar baseando-se no viewport mobile.
- [x] Os tokens CSS gerenciam os fundos da casca (background-surface) contrastando com as elevações de cards dentro da área de conteúdo (background-base).

# 4. Plano de Testes (Quality Gate)

## Testes Unitários
- [x] **Deve** encapsular e renderizar children de forma limpa.
- [x] **Deve** ocultar ou transformar barras laterais baseado nos eventos do mock de viewport (Integração Window Resizer).

## Testes de Contrato (API)
- [x] N/A (Tratamento puro de layout DOM sem chamadas fetchers).

## Testes E2E (Integração)
- [x] Ao clicar em um ícone de navegação da Sidebar, a marcação de ativo (estado de background preenchido) da aba deve refletir com cor da paleta principal da aplicação (primary-base).
