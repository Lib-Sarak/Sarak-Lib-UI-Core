---
tipo: "spec"
titulo: "Ponte Manifesto ↔ Design Engine (Tema por Região / DesignScope)"
dominio: "Sarak-Lib-UI-Core (Lógica e Dados)"
status: "🔴 A Implementar"
prioridade: "Média"
tags: ["spec", "logic", "theme", "designscope", "bridge"]
relacionados: ["20-manifest-schema-e-gramatica-no", "21-datastore-estado-reativo", "30-contrato-importador-renderer"]
---

# 1. Visão Geral
Os dois blocos (Visual = Design Engine de tokens; Funcional = Manifest Renderer) precisam se encontrar em runtime: um nó do manifesto deve poder **aplicar ou trocar tema/preset por região**. O código já tem o `DesignScope` (isolamento de CSS por subárvore); esta spec define a **diretiva** que liga o manifesto a ele, sem o manifesto manipular CSS diretamente (respeitando a Regra Zero "Design as Data").

# 2. Regras de Negócio
- **Regra 1 — Diretiva `theme`:** Um nó aceita `theme: "<presetId>" | <ThemePayloadParcial>`, fazendo o Renderer envolver sua subárvore num `DesignScope` com aquele tema — sem vazar para o restante da página.
- **Regra 2 — Sem Hardcode/CSS no Manifesto:** O manifesto **nunca** injeta CSS ou classes; só referencia presets/tokens existentes (Configuração, não Expansão). Token inexistente é erro de validação, não CSS solto.
- **Regra 3 — Herança e Override:** O escopo herda o tema do pai e sobrepõe apenas as chaves declaradas (merge parcial), reusando a engine de variáveis (`useDesignVariables`).
- **Regra 4 — Reatividade:** Trocar o `theme` via `mutate_state` (Spec 25) re-injeta as variáveis daquela região sem remontar a subárvore.
- **Regra 5 — Contrato TS (Zero Any):** A diretiva é tipada como `presetId` (união conhecida) ou `Partial<SarakThemePayload>` — reaproveitando o tipo blindado do Design Engine, nunca `any`.

# 3. Critérios de Aceite
- [ ] Um nó com `theme: "cyberpunk-neon"` aplica o preset só na sua subárvore, sem afetar o resto.
- [ ] Um override parcial (`theme: { primaryColor: '#...' }`) mescla sobre o tema herdado.
- [ ] `theme` está no catálogo da Spec 20 e passa na Conferência Funcional (Spec 34); valores inválidos são barrados (tipo/validação).

# 4. Plano de Testes (Quality Gate)

## Testes Unitários
- [ ] **Deve** envolver a subárvore num DesignScope com as variáveis do preset/override.
- [ ] **Deve** mesclar parcialmente sobre o tema herdado.

## Testes de Contrato (API)
- [ ] **Deve** passar na Conferência Funcional (Spec 34) para a diretiva `theme`, tipada via `Partial<SarakThemePayload>`.

## Testes E2E (Integração)
- [ ] Renderizar duas regiões com temas distintos lado a lado e confirmar isolamento total de estilos.
