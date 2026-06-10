---
tipo: "spec"
titulo: "Cobertura Global de Testes (Quality Gate)"
dominio: "Sarak-Lib-UI-Core (Testes e Qualidade)"
status: "🟡 Em Progresso"
prioridade: "Alta"
tags: ["spec", "testes", "ci-cd", "quality-gate"]
relacionados: ["01-painel-customizacao-temas", "02-ambiente-sandboxing-preview"]
---

# 1. Visão Geral
Esta spec documenta o panorama oficial e a estratégia de implantação de testes unitários e de integração para o repositório `Sarak-Lib-UI-Core`. O objetivo é estabilizar a infraestrutura central de UI e Design Engine visando a esteira contínua de CI/CD (Quality Gate com meta de cobertura de ~80%). Define o que já foi instrumentado nas rotas críticas e dita o backlog técnico necessário (Long Tail) para atingir a meta global estabelecida pelo ecossistema.

# 2. Regras de Negócio e Estratégia de Teste
- **Regra 1 (Testes na Borda Pública):** Testes unitários devem testar comportamento (entradas vs saídas/side effects) via `@testing-library/react`. É proibido testar métodos privados internos dos componentes.
- **Regra 2 (Mock Restrito):** Devem ser "mockadas" apenas dependências de I/O de rede (`fetch`), dependências pesadas de terceiros irrelevantes ao modelo de render (como `framer-motion`), ou contextos globais (`SarakUIProvider`) em testes de componentes atômicos.
- **Regra 3 (Priorização do Motor Core):** Componentes responsáveis pela lógica stateful do Design Engine (Providers, Customization Tab) devem preceder componentes estáticos e MockApps de demonstração.

# 3. Panorama Atual (Mapeamento de Cobertura)

## 🟢 O Que Já Está Coberto (Motor Core & Sandboxing Crítico)
A injeção de temas e os fluxos de renderização de prova de conceito foram totalmente validados nas últimas sprints.
- [x] **Provider & Lifecycle:** `SarakUIProvider.tsx` (~71%)
- [x] **Manipuladores Atômicos:** `TokenControl.tsx` (~80%)
- [x] **Orquestradores do Canvas:** `MasterControlPanel.tsx` (~85%)
- [x] **Design Engine (Customization Tab):** `ThemeCustomizationTab.tsx` (Validada orquestração de viewModes e APIs).
- [x] **Isolamento de Estilos:** `DesignScope.tsx`
- [x] **Sandboxes Visuais de Peso:** `TableMock.tsx` (100%), `MatrixMock.tsx` (Mock de permissões aninhadas).

## 🔴 O Que Falta Cobrir (Long Tail & Utilities)
Para que a meta global `All Files` (> 80%) seja batida, os seguintes escopos precisam ser atacados:
- [ ] **Mocks Secundários (Canvas/Mocks/):** `ChartsMock.tsx`, `DashboardMock.tsx`, `MockForms.tsx`, `ChatMock.tsx`, `SettingsMock.tsx`.
- [ ] **Catálogos Visuais (Canvas/components/):** `StructureCatalog.tsx`, `CardsCatalog.tsx`, `ElementsCatalog.tsx`, `TypographyCatalog.tsx`.
- [ ] **App Shell / Layout Base:** `SidebarNav.tsx`, `DockNav.tsx`, `SearchWidget.tsx`, `ThemeToggle.tsx`, `VerticalPage.tsx`.
- [ ] **Descoberta Dinâmica (core/Discovery/):** Mapear lógica de registros e manifestos.
- [ ] **Utilitários do Engine:** `useDesignDraft.ts` (testar flush de draft state) e `build-categories.ts`.

# 4. Plano de Testes (Quality Gate)
Esta spec serve como o próprio mapa do Plano de Testes. Para fechar o débito técnico da aba *O Que Falta Cobrir*, as skills deverão implementar as seguintes suítes:

## Testes Unitários
- [ ] **Deve** garantir que `useDesignDraft.ts` descarta ou salva rascunhos corretamente sem alterar o tema ativo indevidamente.
- [ ] **Deve** renderizar os MockApps secundários isolados passando props de tema corretas.
- [ ] **Deve** validar as interações e toggle states dos widgets de navegação (`SidebarNav`, `ThemeToggle`).
- [ ] **Deve** confirmar as funções expostas pelo gerenciador de descobrimento (Registry).

## Testes de Contrato (API)
- [ ] *N/A* (O Sarak-Lib-UI-Core atua primordialmente como consumidor no que tange design, portanto APIs são testadas via mocks ou em integração e2e).

## Testes E2E (Integração)
- [ ] Fluxo feliz: Validar em runtime se a navegação combinada entre Canvas, Preview e Templates reflete perfeitamente as injeções aplicadas pelo motor visual.
