---
tipo: "spec"
titulo: "Cobertura Global de Testes (Quality Gate e E2E)"
dominio: "Sarak-Lib-UI-Core (Testes e Qualidade)"
status: "🟡 Em Progresso (Fase E2E)"
prioridade: "Alta"
tags: ["spec", "testes", "ci-cd", "quality-gate", "e2e"]
relacionados: ["01-painel-customizacao-temas", "02-ambiente-sandboxing-preview"]
---

# 1. Visão Geral
Esta spec documenta o panorama oficial e a estratégia de implantação de testes unitários e de integração para o repositório `Sarak-Lib-UI-Core`. O objetivo principal, que era estabilizar a infraestrutura central de UI e Design Engine visando a esteira contínua de CI/CD (Quality Gate com meta de cobertura de >80%), **foi atingido com sucesso no nível Unitário/Integração**. A base de testes hoje serve como uma rede de proteção espessa.
A fase atual foca em expandir essa malha para **Testes E2E (Ponta-a-Ponta)**, utilizando um navegador real para testar fluxos cruciais da interface visual.

# 2. Regras de Negócio e Estratégia de Teste
- **Regra 1 (Testes na Borda Pública):** Testes unitários devem testar comportamento (entradas vs saídas/side effects) via `@testing-library/react`. É proibido testar métodos privados internos dos componentes.
- **Regra 2 (Mock Restrito):** Devem ser "mockadas" apenas dependências de I/O de rede (`fetch`), dependências pesadas de terceiros irrelevantes ao modelo de render (como `framer-motion`), ou contextos globais (`SarakUIProvider`) em testes de componentes atômicos.
- **Regra 3 (Priorização do Motor Core):** Componentes responsáveis pela lógica stateful do Design Engine (Providers, Customization Tab) devem preceder componentes estáticos e MockApps de demonstração.
- **Regra 4 (Validação Visual - E2E):** Testes E2E devem validar as mutações do DOM causadas por inputs do usuário no Design Engine, com foco especial na injeção de variáveis CSS.

# 3. Panorama Atual (Mapeamento de Cobertura)

## 🟢 O Que Já Está Coberto (Motor Core & Sandboxing Crítico)
A injeção de temas, orquestração de catálogos e os fluxos de renderização de prova de conceito foram totalmente validados, atingindo coberturas sólidas (>80%) globalmente:
- [x] **Provider & Lifecycle:** `SarakUIProvider.tsx` e injetores base.
- [x] **Manipuladores Atômicos:** `TokenControl.tsx`, `DesignControls.tsx` e `DynamicTokenControl.tsx`.
- [x] **Orquestradores do Canvas:** `MasterControlPanel.tsx`, `SaveThemeModal.tsx`.
- [x] **Design Engine (Customization Tab):** `ThemeCustomizationTab.tsx`, `TemplatesTab.tsx` (Validada orquestração de viewModes e APIs).
- [x] **Isolamento de Estilos e Preview:** `DesignScope.tsx`, `PreviewCanvas.test.tsx`, `KitchenSinkPreview.test.tsx`.
- [x] **Sandboxes Visuais de Peso (Mocks):** `TableMock.tsx`, `MatrixMock.tsx`, `ChartsMock.tsx`, `DashboardMock.tsx`, `MockForms.tsx`, `ChatMock.tsx`, `SettingsMock.tsx`.
- [x] **Catálogos Visuais:** `AtmosphereCatalog.test.tsx`, `CardsCatalog.test.tsx`, `PresetsCatalog.test.tsx`, `TypographyCatalog.test.tsx`.
- [x] **App Shell / Layout Base:** Testes adicionados para navegação básica e widgets.
- [x] **Descoberta Dinâmica:** Testes de `registry.ts` e `manifest.ts`.
- [x] **Utilitários do Engine:** `useDesignDraft.ts`, `dynamic-categories.ts`, `color-engine.ts`.

## 🔴 O Que Falta Cobrir (Fase E2E & Long Tail)
- [ ] **Integração Playwright/Cypress:** Configurar ambiente E2E inicial para o repositório.
- [ ] **Fluxos de Painel (Design Engine):** Cobrir a injeção em tempo real de tokens CSS na árvore DOM real do navegador.
- [ ] **Expansão para Componentes Puros de Layout:** Aumentar a cobertura fina (100%) em `TopbarNav.tsx` e outros blocos secundários.

# 4. Plano de Testes (Quality Gate)
Todos os testes críticos unitários para CI/CD foram implementados com sucesso:

## Testes Unitários
- [x] **Garantido** que `useDesignDraft.ts` realiza updates (flush de draft state) corretamente.
- [x] **Renderizado** MockApps secundários isolados sem falhas de timeout.
- [x] **Validado** injeção das variáveis de `framer-motion` mitigando interrupções no pipeline.
- [x] **Confirmadas** as funções expostas pelo gerenciador de descobrimento (Registry).

## Testes de Contrato (API)
- [ ] *N/A* (O Sarak-Lib-UI-Core atua primordialmente como consumidor no que tange design, portanto APIs são testadas via mocks ou em integração e2e).

## Testes E2E (UI / Integração Real)
O próximo passo do Quality Gate é a implementação de testes em navegador real, validando os fluxos vitais do painel de Design Engine.

### Jornadas Críticas (Para a skill `test-e2e`):
- [ ] **Jornada 1: Boot do Motor e Rederização do Canvas**
  - **Critério:** Ao abrir a rota principal, o painel deve carregar o tema padrão corretamente, e os Mocks (como `DashboardMock`) devem estar visíveis e interagíveis.
- [ ] **Jornada 2: Injeção de Tokens em Tempo Real**
  - **Critério:** O usuário altera uma cor primária (ou borda/espaçamento) pelo `TokenControl`. O teste deve varrer o DOM e certificar que a variável CSS correspondente (`--sarak-...`) foi injetada e atualizada no instante exato.
- [ ] **Jornada 3: Aplicação de Template (Preset)**
  - **Critério:** O usuário aplica um Preset de tema completo. O teste deve confirmar a mudança simultânea de múltiplos tokens refletindo no `PreviewCanvas`.
- [ ] **Jornada 4: Isolamento do Contexto (`DesignScope`)**
  - **Critério:** O teste valida que um `<DesignScope>` isolado na tela de preview aplica estilos de forma compartimentada e não "vaza" CSS para o menu lateral ou barras de topo do app shell.
