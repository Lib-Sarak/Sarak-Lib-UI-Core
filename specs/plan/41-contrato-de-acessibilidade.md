---
tipo: "spec"
titulo: "Contrato de Acessibilidade (a11y Transversal)"
dominio: "Sarak-Lib-UI-Core (Transversal)"
status: "🔴 A Implementar"
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
- [ ] Modal/Drawer retêm o foco e o devolvem ao gatilho ao fechar.
- [ ] Navegação completa por teclado nos componentes de Navegação (Spec 14) e Formulário (Spec 11).
- [ ] Estados de erro/foco perceptíveis sem depender exclusivamente de cor.

# 4. Plano de Testes (Quality Gate)

## Testes Unitários
- [ ] **Deve** validar presença de `role`/`aria-*` corretos por componente interativo.
- [ ] **Deve** garantir focus trap e restauração de foco nos overlays.

## Testes de Contrato (API)
- [ ] **Deve** aceitar e repassar a diretiva `aria` do nó ao átomo correspondente.

## Testes E2E (Integração)
- [ ] Percorrer um fluxo completo (abrir modal, preencher form, submeter) usando somente o teclado.
