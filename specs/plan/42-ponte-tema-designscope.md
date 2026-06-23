---
tipo: "spec"
titulo: "Ponte Manifesto ↔ Design Engine (Tema por Região / DesignScope)"
dominio: "Sarak-Lib-UI-Core (Lógica e Dados)"
status: "🟢 Implementada"
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
- [x] Um nó com `theme: "cyberpunk-neon"` aplica o preset só na sua subárvore, sem afetar o resto.
- [x] Um override parcial (`theme: { primaryColor: '#...' }`) mescla sobre o tema herdado.
- [x] `theme` está no catálogo da Spec 20 e passa na Conferência Funcional (Spec 34); valores inválidos são barrados (tipo/validação — ramo de override tipado com `Partial<SarakThemePayload>` de domínio fechado).

# 4. Plano de Testes (Quality Gate)

## Testes Unitários
- [x] **Deve** envolver a subárvore num DesignScope com as variáveis do preset/override. *(`nodes/__tests__/ThemeNode.test.tsx`)*
- [x] **Deve** mesclar parcialmente sobre o tema herdado. *(`Theme/__tests__/resolveTheme.test.ts`)*

## Testes de Contrato (API)
- [x] **Deve** passar na Conferência Funcional (Spec 34) para a diretiva `theme`, tipada via `Partial<SarakThemePayload>`. *(Auditor `auditor_manifesto.mjs`: 17 diretivas validadas Contrato TS ↔ Runtime ↔ Catálogo.)*

## Testes E2E (Integração)
- [x] Renderizar duas regiões com temas distintos lado a lado e confirmar isolamento total de estilos. *(`ThemeNode.test.tsx` — dois `DesignScope` isolados, sem vazamento de variáveis.)*

# 5. Status de Implementação (Onda 6)
- **Diretiva no pipeline:** `ThemeNode` em `nodes/renderNode.tsx` (passo 0.5) envolve a subárvore num `DesignScope` e re-renderiza o nó sem `theme` (evita laço).
- **Engine:** `Manifest/Theme/resolveTheme.ts` — preset nomeado (`ThemePresetId`, união derivada de `THEME_PRESET_IDS`) ou binding `"{{designTheme}}"` (reatividade via `mutate_state`) ou override parcial mesclado sobre o herdado (lê `DesignOverrideContext`).
- **Tipagem (Regra 5):** `ThemeDirective` reaproveita o `SarakThemePayload` blindado de `Provider/types.ts`. *Nota:* `ThemePreset.design` ficou `Record<string, unknown>` (não o payload estrito) — mata o `any`, mas os 18 presets têm dados que divergiram do domínio fechado (`logoMinimalUrl`, `cardVariant:"solid"`); reconciliação pendente (já sinalizada em `Provider/types.ts`).
