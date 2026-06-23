---
tipo: "spec"
titulo: "Contrato de Acessibilidade (a11y Transversal)"
dominio: "Sarak-Lib-UI-Core (Transversal)"
status: "🟢 Implementada"
prioridade: "Média"
tags: ["spec", "a11y", "accessibility", "transversal"]
relacionados: ["13-expansao-feedback-interacoes", "14-expansao-navegacao", "11-expansao-formularios"]
---

# 1. Visão Geral
Cada spec testa acessibilidade isoladamente, mas sem um **modelo único** o resultado fica inconsistente (cada componente resolve foco/ARIA do seu jeito). Esta spec define o **contrato transversal de a11y** que todos os átomos e o Renderer devem honrar, para que aplicações montadas via dados sejam acessíveis por construção.

# 2. Regras de Negócio
- **Regra 1 — Modelo de Foco:** Overlays (Modal/Drawer/Popover — Specs 10/13) implementam **focus trap** e devolução de foco ao fechar; ordem de tabulação previsível.
- **Regra 2 — ARIA por Papel:** Componentes interativos expõem `role`/`aria-*` corretos derivados do seu papel semântico (tabs, dialog, listbox, etc.), nunca apenas visual.
- **Regra 3 — Teclado Universal:** Todo controle acionável por mouse é acionável por teclado (Enter/Espaço/Setas conforme o padrão WAI-ARIA do componente).
- **Regra 4 — Contraste e Estado:** Os tokens semânticos garantem contraste mínimo; estados (foco, erro, desabilitado) são perceptíveis além da cor (borda/ícone), não só por cor.
- **Regra 5 — a11y como Dado:** O `ManifestNode` permite `aria` (label, describedby) por nó, repassado ao átomo; rótulos de formulário (Spec 11) são obrigatórios ou derivados.

# 3. Critérios de Aceite
- [x] Modal/Drawer retêm o foco e o devolvem ao gatilho ao fechar. *(`useFocusTrap` aplicado a ambos; `onClose` por ref para o trap não reentrar a cada render.)*
- [x] Navegação completa por teclado nos componentes de Navegação (Spec 14) e Formulário (Spec 11). *(Tabs setas/Home/End + roving tabindex; Spotlight setas; Breadcrumbs Enter/Espaço; Pagination botões nativos; Stepper é indicador não-interativo; inputs nativos.)*
- [x] Estados de erro/foco perceptíveis sem depender exclusivamente de cor. *(Input expõe mensagem de erro textual + `aria-invalid`/`aria-describedby`, além da cor.)*

# 4. Plano de Testes (Quality Gate)

## Testes Unitários
- [x] **Deve** validar presença de `role`/`aria-*` corretos por componente interativo. *(`nodes/__tests__/aria.test.tsx`, `UX/__tests__/SarakTabs.keyboard.test.tsx`)*
- [x] **Deve** garantir focus trap e restauração de foco nos overlays. *(`Modals/hooks/__tests__/useFocusTrap.test.tsx`)*

## Testes de Contrato (API)
- [x] **Deve** aceitar e repassar a diretiva `aria` do nó ao átomo correspondente. *(`mapAriaDirective` + teste de integração no LeafNode.)*

## Testes E2E (Integração)
- [x] Percorrer um fluxo completo (abrir modal, preencher form, submeter) usando somente o teclado. *(`Modals/__tests__/keyboardJourney.test.tsx` via `@testing-library/user-event`: abre por teclado → preenche → Tab → submete; + ESC fecha e devolve o foco ao gatilho.)*

# 5. Status de Implementação (Ondas 6 BASE + 7)
- **a11y como dado (Regra 5):** diretiva `aria` fiada no `LeafNode` via `nodes/aria.ts` (`mapAriaDirective`) — passa na Conferência Funcional (Spec 34).
- **Modelo de foco (Regra 1):** `Modals/hooks/useFocusTrap.ts` (trap + ESC + restauração) aplicado a `SarakModal` e `SarakDrawer`. **Onda 7:** `onClose` guardado em ref — o efeito do trap só depende de `isOpen`, evitando reentrada de foco a cada render (corrige perda de digitação).
- **ARIA por papel (Regras 2/4):** `SarakInput` (label↔input via id + erro linkado), `SarakSlider` (`aria-label`/`aria-valuetext`), `SarakSwitch` (`role="switch"` + descrição), `SarakTabs` (setas/Home/End + roving tabindex).
- **Teclado de Navegação (Regra 3 — Onda 7):** `SarakBreadcrumbs` ativa por Enter/Espaço; Pagination usa botões nativos; Stepper é indicador não-interativo. Jornada E2E só-teclado coberta.
