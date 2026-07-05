---
tipo: "spec"
titulo: "Taxonomia Estendida e Responsividade como Dado"
dominio: "Sarak-Lib-UI-Core (Visual)"
status: "🟢 Consolidado"
prioridade: "Alta"
tags: ["spec", "taxonomia", "componentes", "responsividade", "data-driven"]
relacionados: ["00-manifesto-arquitetural-ui-core", "03-padrao-e-taxonomia-biblioteca-atomica"]
---

# 1. Visão Geral
Esta especificação consolida a taxonomia dos novos componentes de alta complexidade inseridos na biblioteca e a diretriz fundamental de **Responsividade como Dado**. 
Este documento absorve o conhecimento gerado durante as expansões do Motor Genérico (Micro-layouts, Formulários Avançados, DataGrids, Feedback e Mídia) para transformar a Sarak num "Agnostic UI Engine". Tudo descrito aqui obedece restritamente a Paridade 1:1:1:1:1 e as 3 Camadas de Arquitetura.

# 2. Regras de Negócio (Expansões Visuais)

## 2.1 Micro-Layout e Primitivas (Zero Hardcode)
- **`<SarakFlex>` e `<SarakGrid>`:** Primitivas invisíveis cujo CSS (flex-direction, gap, grid-template) é obrigatoriamente derivado dos valores (tokens) do JSON injetado.
- **Painéis (Split Panes e Drawers):** Permitem arrasto e deslizamento baseados em estado. Acordeões empurram o conteúdo sem depender de alturas fixas absolutas.
- **Tabs Aninhadas:** Suportam alinhamento flexível e aninhamento sem limites (níveis N).

## 2.2 Formulários Avançados e Densos
- **Pickers (Date e Time):** Suportam alcance (*range*) e formatação de localização repassada via JSON.
- **Multiselect (Tags):** Possuem *autocomplete* interno sem perder o foco na digitação.
- **Rich Text (WYSIWYG):** Blindados, sem permissão de injeção de `<script>` ou `<style>`. As saídas passam pelo sanitizador da Engine.
- **Uploaders:** Feedback visual restrito aos tokens semânticos (ex: bordas mapeando `--sarak-color-primary` ao arrastar arquivos).

## 2.3 DataGrids, Kanban e Visualização
- **`<SarakDataGrid>`:** Emprega *virtual scrolling* (windowing). Independentemente de receber 100 mil registros no JSON, a UI monta apenas os visíveis no DOM real a 60 FPS. Suporta Pinned Columns preservando sticky state.
- **`<SarakKanban>`:** Utiliza DnD HTML5 Nativo zero-dep. O "drop" move o card e dispara eventos de mutação para o Dispatcher.
- **Gráficos e Sparklines:** Cores primárias/secundárias (SVG/ECharts) herdam estritamente das variáveis CSS do Design Engine `var(--sarak-color-primary-*)`.

## 2.4 Mídia, Navegação e Feedback
- **Renderizadores Dedicados:** Interpretadores de Markdown garantindo syntax highlighting sem quebrar o CSS global. Modais multi-step (wizards), Breadcrumbs e Command Palettes (Spotlight) injetados via tokens.
- **Snackbars e Tooltips:** Controlados pelo Event Bus global, consumindo o schema.

# 3. Responsividade Como Dado
A responsividade na Sarak não reside mais em arquivos CSS obscuros via `@media`. Ela ascendeu à camada de dados (JSON) e Tokens (Paridade 1:1:1:1:1).

- **Diretiva `responsive` no Manifesto:** O JSON aceita a diretiva explícita (ex: `responsive: { mob: { padding: 's' }, desk: { padding: 'xl' } }`). 
- **Resolução Mobile-First:** O motor lê a janela e aplica as propriedades específicas sem remontar/destruir o componente (reaproveita o DOM node, evita flicker e layout shift).
- **Tokens de Breakpoint:** Os limiares de quebra (`breakpointTablet`, `breakpointDesktop`) são tokens no MasterMap, consumidos tanto pelo gerador de CSS-in-JS (media queries dinâmicas) quanto pelo hook de resolução em tempo real (`useDesignVariables`).

# 4. Plano de Testes (Quality Gate)
## Unitários
- [x] O `SarakFlex` converte propriedades JSON em estilos CSS usando tokens (ex: `spacing-md` vira `gap: var(--sarak-spacing-md, 16px)`).
- [x] DataGrids renderizam corretamente o *windowing*, criando no máximo os `N` elementos visíveis.
- [x] O avaliador da diretiva `responsive` mescla (merge) as propriedades base com as da camada de breakpoint apropriado sem mutar o objeto original.
## Contrato/API
- [x] O auditor `auditor_paridade.mjs` certifica que todos os tokens introduzidos pelos gráficos, formulários e breakpoints (ex: `breakpointTablet`) estão sincronizados nas 5 camadas.
- [x] Todos os novos componentes garantem o Zero Any em suas props.
## E2E
- [x] Renderização interativa de um fluxo (ex: Kanban Drop -> Modal Popup -> Multiselect Form -> Resize Window) reflete perfeitamente as propriedades inseridas no manifesto original, ajustando os layouts para Mobile instantaneamente.
