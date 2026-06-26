---
tipo: "spec"
titulo: "Erradicação de `any` — Design Engine (`src/features/DesignEngine/`)"
dominio: "Sarak-Lib-UI-Core (Adequação)"
status: "🔴 A Implementar"
prioridade: "Média"
tags: ["spec", "any", "adequacao", "features", "design-engine", "type-safety"]
relacionados: ["60-erradicacao-any-plano-mestre", "62-erradicacao-any-componentes", "64-erradicacao-any-constantes-e-fechamento"]
---

# 1. Visão Geral
Fatia **3** da campanha (Spec 60): quita o `any` em **`src/features/DesignEngine/**`** — a feature de customização visual (painel mestre, abas, canvas, biblioteca de temas). Alto volume (**~165 ocorrências** em ~43 arquivos), porém **menos crítico** que núcleo/átomos: é camada de aplicação/configuração, não contrato consumido por terceiros.

# 2. Escopo e Hotspots (laudo)

## 2.1 Hooks de estado/draft (risco médio — coração da feature)
- **`hooks/useDesignDraft.ts` — 12** ⚠️ · `Context/useThemePreview.ts` — 8 · `Canvas/hooks/useDesignOperations.ts` — 8
- `Main/hooks/useThemeActions.ts` — 5 · `Main/hooks/useThemeCustomizationData.ts` — 4
- `hooks/useDesignDraftSync.ts` — 3 · `Panels/hooks/useShortcutsManager.ts` — 6 · `Panels/hooks/useSovereignSearch.ts` — 1
- `Canvas/hooks/usePreviewApps.tsx` — 2 · `Main/hooks/{usePersistenceState,useThemePersistenceHandlers}.ts` — 1 cada

## 2.2 Componentes de UI da feature (risco baixo — props/handlers)
- `Main/components/ThemePillarsList.tsx` — 10 · `Main/components/ThemeSidebarContent.tsx` — 8
- `Library/ThemeEditor.tsx` — 7 · `Canvas/components/PresetCard.tsx` — 7 · `Canvas/PreviewCanvas.tsx` — 7
- `Panels/LanguageTab.tsx` — 6 · `Main/components/ThemeGlobalSettings.tsx` — 6
- `components/controls/BasicControls.tsx` — 5 · `Main/components/TokenControl.tsx` — 5 · `Library/ThemeList.tsx` — 5
- `utils/dynamic-categories.ts` — 4 · `components/DynamicTokenControl.tsx` — 3
- `Panels/{EngineCustomizationTab,AdvancedTab}.tsx` — 3 cada · `Main/TemplatesTab.tsx` — 3
- `Canvas/components/{PreviewSystemRenderer,CardsCatalog}.tsx` — 3 cada
- demais `*Tab.tsx`, `*Catalog.tsx`, `*Control(s).tsx` — 1–2 cada (cauda longa)

## 2.3 E2E da feature
- `__e2e__/RealtimeInjection.spec.tsx` — 2 · `__e2e__/Boot.spec.tsx` — 2 (tipar mocks/fixtures do teste, sem afrouxar a asserção)

# 3. Regras de Negócio
- **Regra 1 — Hooks de draft primeiro:** `useDesignDraft.ts`, `useDesignOperations.ts` e `useThemePreview.ts` carregam a lógica de edição de tema; tipar o modelo de draft/operação destrava a tipagem dos componentes que os consomem (cascata).
- **Regra 2 — `utils/dynamic-categories.ts`:** os `any` aqui são de categorização dinâmica de tokens; preferir genérico/`unknown`+guard (é fronteira realmente dinâmica), não interface fechada.
- **Regra 3 — E2E:** tipar fixtures sem mascarar; o `any` em spec de teste ainda é dívida (o auditor não isenta `__e2e__`).
- **Regra 4 — Hierarquia de substituição** conforme Spec 60 §3.2. Proibido `as any`/`@ts-ignore`.
- **Regra 5 — Cauda longa em lote:** os ~30 arquivos de 1–2 ocorrências (props/handlers de Tab/Catalog/Control) podem ir em lotes maiores por subpasta (`Panels/`, `Canvas/`, `Main/`), pois são de risco baixo e padrão repetido.

# 4. Critérios de Aceite
- [ ] `auditor_typescript.mjs` reporta **0** `any` em todo `src/features/DesignEngine/**`.
- [ ] `npx tsc --noEmit` = 0 erros.
- [ ] `npx vitest run` (escopo feature, incl. `__e2e__`) sem regressão.

# 5. Plano de Testes (Quality Gate)
## Testes Unitários
- [ ] **Deve** manter verdes os hooks de draft (`useDesignDraft`/`useDesignOperations`) após tipagem do modelo de edição.
## Testes E2E (Integração)
- [ ] **Deve** manter `Boot.spec.tsx` e `RealtimeInjection.spec.tsx` verdes com fixtures tipadas (a injeção em tempo real continua funcionando ponta a ponta).
