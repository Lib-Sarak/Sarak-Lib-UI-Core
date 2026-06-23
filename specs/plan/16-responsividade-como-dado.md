---
tipo: "spec"
titulo: "Responsividade como Dado (Breakpoints + Diretiva responsive)"
dominio: "Sarak-Lib-UI-Core (Visual + Lógica / Híbrida)"
status: "🟢 Implementado"
prioridade: "Alta"
tags: ["spec", "responsive", "breakpoints", "layout", "manifest"]
relacionados: ["20-manifest-schema-e-gramatica-no", "10-expansao-micro-layout"]
---

# 1. Visão Geral
"Layouts diversos" exige variar a interface por tamanho de tela. O Design Engine já tem **valores** responsivos (mob/tab/desk via `ResponsiveValue`), mas a **camada do manifesto** não tem como declarar props/estrutura por breakpoint. Esta spec é **híbrida**: promove os breakpoints a tokens (parte de Paridade 1:1:1:1:1) e adiciona a diretiva `responsive` ao nó (parte funcional, contrato do `ManifestNode`).

# 2. Regras de Negócio
- **Regra 1 — Parte TOKEN (Paridade 1:1:1:1:1):** Os breakpoints deixam de ser hardcoded no `useDesignVariables` (hoje `768px`/`1024px`) e viram tokens `breakpointTablet` e `breakpointDesktop`, registrados nas 5 camadas (Schema → MasterMap → `theme_table_mapping` → partição → codegen) e consumidos pelo gerador de media-queries. Segue o fluxo de expansão de token.
- **Regra 2 — Parte FUNCIONAL (Diretiva `responsive`):** O `ManifestNode` (Spec 20) ganha a diretiva reservada:
  ```
  responsive?: { mob?: Partial<NodeProps>, tab?: Partial<NodeProps>, desk?: Partial<NodeProps> }
  ```
  O Renderer resolve sobrepondo as props base com a camada do breakpoint ativo (mobile-first), sem remontar o nó.
- **Regra 3 — Contrato TS (Zero Any):** `interface ResponsiveDirective` tipada sobre as props do componente-alvo; proibido `any`.
- **Regra 4 — Coerência com o CSS responsivo existente:** A resolução por breakpoint deve usar os mesmos limiares dos tokens da Regra 1, evitando divergência entre o que o CSS (`--sarak-*` em media-query) e o JS (diretiva) consideram "tablet/desktop".
- **Regra 5 — Sem layout-shift:** Trocar de breakpoint reaproveita o nó (mesma `key`), apenas recalculando props — nunca desmontando/remontando a subárvore.

# 3. Critérios de Aceite
- [ ] `breakpointTablet`/`breakpointDesktop` passam na auditoria de Paridade (302+2 tokens) e o `useDesignVariables` os consome.
- [ ] Um nó com `responsive: { mob: { padding: 's' }, desk: { padding: 'xl' } }` aplica o valor correto conforme a largura.
- [ ] A diretiva `responsive` está registrada no catálogo da Spec 20 e jamais vaza como atributo no DOM.
- [ ] Redimensionar a janela atravessa breakpoints sem remontar a subárvore (sem flicker).

# 4. Plano de Testes (Quality Gate)

## Testes Unitários
- [ ] **Deve** mesclar props base + camada do breakpoint na ordem mobile-first correta.
- [ ] **Deve** validar (teste de tipo) que `ResponsiveDirective` não admite `any`.

## Testes de Contrato (API)
- [ ] **Deve** passar na Paridade 1:1:1:1:1 para os 2 tokens de breakpoint e na Conferência Funcional (Spec 34) para a diretiva `responsive`.

## Testes E2E (Integração)
- [ ] Visual: a mesma tela em mobile e desktop aplica disposições distintas declaradas só por dados, sem recarregar.
