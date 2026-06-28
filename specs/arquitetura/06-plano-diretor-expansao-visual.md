---
tipo: "arquitetura"
titulo: "Plano Diretor: Expansão Visual e Estrutural"
dominio: "Componentes / Estrutura"
status: "🔵 Em Expansão"
prioridade: "Alta"
tags: ["roadmap", "expansao", "visual", "componentes"]
relacionados: ["03-padrao-e-taxonomia-biblioteca-atomica"]
---

# 1. Visão Geral
Este documento consolida o roteiro arquitetural para a expansão do motor visual da Sarak-Lib-UI-Core. Ele mapeia os blocos de construção genéricos necessários para transformar o projeto num Agnostic UI Engine, capaz de renderizar CRMs, ERPS e ferramentas SaaS complexas.

# 2. Regras de Negócio (Expansão por Categoria)
A expansão visual está catalogada nas seguintes categorias estritas, devendo cada uma respeitar a lei do "Zero Hardcode" e a "Paridade 1:1:1:1:1".

### 2.1 Estrutura Base e Micro-Layout (Responsividade como Dado)
- **Primitivas Flex e Grid:** Componentes estruturais cujas propriedades são guiadas apenas pelos tokens.
- **Acordeões, Drawers e Panes:** Componentes de subdivisão de tela que suportam conteúdo ilimitado e aninhamento sem restrições.

### 2.2 Formulários e Densidade de Dados
- **DataGrids Avançados:** Composição de tabelas de alta densidade (Virtual Scrolling, Pinned Columns).
- **Widgets Especiais:** Time Pickers, Rich Text (Markdown), File Uploaders e Comboboxes complexas.

### 2.3 Feedback e Navegação
- **Wizards e Steppers:** Modais e fluxos de passos gerenciados via propriedades.
- **Command Palette:** Sistema de busca universal.
- **Snackbars e Tooltips:** Sistema de notificação padronizado e injetado globalmente pela Engine.

# 3. Critérios de Aceite Genéricos
- [ ] Todo novo componente introduzido nestas vertentes obedece as 3 Camadas de Isolamento.
- [ ] Componentes interativos não devem fazer chamadas de rede diretamente, delegando isso à Engine Declarativa.
- [ ] A Responsividade é tratada como Dado (Media queries embutidas nos schemas), não em arquivos CSS.

# 4. Plano de Testes
## Unitários
- [x] O `auditor_paridade.mjs` valida todo token introduzido durante as campanhas visuais.
## Contrato/API
- *N/A* (Não há contato direto de rede na camada atômica).
## E2E
- [x] Fluxos visuais garantidos pelo Sarak UI Canvas ou ambiente de testes integrado de features.
