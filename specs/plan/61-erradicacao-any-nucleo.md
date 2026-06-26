---
tipo: "spec"
titulo: "Erradicação de `any` — Núcleo (`src/core/`)"
dominio: "Sarak-Lib-UI-Core (Adequação)"
status: "🟡 Em Andamento (parte autônoma feita; design-state em HITL)"
prioridade: "Alta"
tags: ["spec", "any", "adequacao", "core", "type-safety"]
relacionados: ["60-erradicacao-any-plano-mestre", "65-foundation-design-state", "62-erradicacao-any-componentes", "50-finalizacao-adequacao-e-entrega"]
---

# 1. Visão Geral
Fatia **1** da campanha (Spec 60): quita o `any` em **`src/core/**`** — a fundação que mais consumidores dependem. Tipar o núcleo primeiro propaga segurança para `components/` e `features/`. **~134 ocorrências** em ~32 arquivos.

# 1.1 Progresso (commit 1 — parte autônoma)
Baseline da campanha **484 → 454** (−30). Tudo verde (`tsc` 0 erros · `vitest run src/<fatia>` · auditor), **só tipos, zero mudança de comportamento**.

**✅ Feito (risco baixo/médio, autônomo):**
- Discovery: `registry.ts` (−6, padrão `SarakComponent` + `register<P extends object>` + cast `as unknown as` + global tipado), `hooks/useEndpointResolver.ts` (−2), `components/hooks/useExpandableMatrixEngine.ts` (−7, tipos `MatrixNode`/`MatrixEngineConfig`).
- Provider: `hooks/useSarakDrafting.ts` (−7), `hooks/useBrandingManager.ts` (−3), `hooks/useRegistryManager.ts` (−3), `hooks/useSarakUIEffects.ts` (−1) — reusam `SarakThemePayload`/`SarakUIOptions`/`BrandingState`/`SarakModule`.
- Design: `hooks/useMediaLuminance.ts` (−1, `ReturnType<typeof setTimeout>`).

**🧱 Bloqueador-fundação descoberto (reordena o restante):** `design: any` é o padrão dominante e **não** se resolve por arquivo. `SarakThemePayload` tem domínio de chaves **fechado** (estrito demais p/ o estado real, que carrega `atmosphere`/`sidebarPosition`/`emptyStateId`/`navbarLayout`/`searchPositionTopbar`…), e tipar o valor como `Record<string,unknown>` **cascateia para `features/`** (valores de token usados direto como CSS — AtmosphereCatalog/ButtonPreset/InputPreset/PresetCard quebram; comprovado e revertido). `useDesignVariables`/`validateDesign` já falam `Record<string,unknown>`, mas o contexto exige `SarakThemePayload`.

**⏸️ Deferido para batches HITL** (ver §3 e Spec 60 §4):
- **Foundation (design-state) → Spec 65:** `useDesignManager` (10), `useDesignSync` (4), `useDesignRemoteLoader` (5), `utils/validation` (3), `DesignInjector` (2), `manifest.ts` (4) + **todo o Shell** (`ShellContent`, `TopbarNav`, `SidebarNav`, `DockNav`, `useShellLayoutStyles`, widgets ~20) + `Design/color-engine` (4) e presets — **junto** dos consumidores em `features/`. Especificado e sequenciado na **Spec 65** (`SarakDesignState`, Opção C).
- **Discovery alto risco:** `components/ContractRenderer.tsx` (39) + `types.ts` (3) — `filters`/`config`/`DiscoveredModule.component`; **não** importar `FilterConfig` de `components/` em `core/` (quebra de camada).

# 2. Escopo e Hotspots (laudo)
Por sub-bloco do núcleo (contagem aproximada do `auditor_typescript.mjs`):

> Legenda: ✅ feito · ⏸️F deferido p/ batch Foundation (design-state) · ⏸️D deferido p/ batch Discovery alto risco · 🔲 pendente.

## 2.1 `core/Discovery/` (~57)
- ⏸️D **`components/ContractRenderer.tsx` — 39** ⚠️ **ALTO RISCO** (coração do runtime de descoberta; caracterização reforçada + HITL antes de tocar).
- ✅ `components/hooks/useExpandableMatrixEngine.ts` — 7
- ✅ `registry.ts` — 6 · ⏸️D `types.ts` — 3 · ✅ `hooks/useEndpointResolver.ts` — 2

## 2.2 `core/Provider/` (~42)
- ⏸️F `hooks/useDesignManager.ts` — 10 ⚠️ (gerente de design; risco médio-alto)
- ✅ `hooks/useSarakDrafting.ts` — 7 · ⏸️F `hooks/useDesignRemoteLoader.ts` — 5
- ⏸️F `manifest.ts` — 4 · ⏸️F `hooks/useDesignSync.ts` — 4 · ⏸️F `utils/validation.ts` — 3
- ✅ `hooks/useRegistryManager.ts` — 3 · ✅ `hooks/useBrandingManager.ts` — 3
- ⏸️F `components/DesignInjector.tsx` — 2 · ✅ `hooks/useSarakUIEffects.ts` — 1

## 2.3 `core/Shell/` (~20) — ⏸️F bloco inteiro (todos recebem `design: any`)
- `Components/ShellContent.tsx` — 6 · `Components/TopbarNav.tsx` — 3 · `Components/SidebarNav.tsx` — 3
- `Components/types.ts` — 2 · `Components/ShellUserWidget.tsx` — 2
- `hooks/useShellLayoutStyles.ts` — 1 · `Components/ShellSearchWidget.tsx` — 1
- `Components/ShellLanguageSelector.tsx` — 1 · `Components/DockNav.tsx` — 1

## 2.4 `core/Design/` (~15)
- ⏸️F `presets/themes/color-engine.ts` — 4 · 🔲 `components/DesignScope.tsx` — 3
- 🔲 `types.ts` — 2 · 🔲 `master-map.ts` — 2 ⚠️ (fonte da paridade — não alterar IDs/estrutura, só tipos)
- ⏸️F `presets/modules/index.ts` — 1 · ⏸️F `presets/components/cards.ts` — 1
- ✅ `hooks/useMediaLuminance.ts` — 1 · 🔲 `components/SarakBackgroundRenderer.tsx` — 1

# 3. Regras de Negócio
- **Regra 1 — Caracterização antes do refactor:** para cada arquivo de risco médio/alto, garantir teste de caracterização verde (skill `code-adequacao`) antes de tipar. Arquivos de 1–2 ocorrências de risco baixo podem ser adequados diretos se já cobertos.
- **Regra 2 — `master-map.ts` é intocável estruturalmente:** corrija **apenas** o `any` de tipo; **não** altere IDs, ordem ou valores de token (quebraria a Paridade 1:1:1:1:1 — rode `verify_parity.ts` para confirmar).
- **Regra 3 — `ContractRenderer.tsx` é alto risco:** thread principal + HITL; é o nó de maior densidade da base inteira (39).
- **Regra 4 — Hierarquia de substituição** conforme Spec 60 §3.2 (tipo próprio > genérico > `unknown`+guard > cast tipado). Proibido `as any`/`@ts-ignore`.

# 4. Critérios de Aceite
- [ ] `auditor_typescript.mjs` reporta **0** `any` em todo `src/core/**`.
- [ ] `npx tsc --noEmit` = 0 erros.
- [ ] `npx vitest run` (escopo core) sem regressão; caracterização verde.
- [ ] `verify_parity.ts` continua **✅** (paridade de tokens intacta após tocar `Design/`).

# 5. Plano de Testes (Quality Gate)
## Testes Unitários
- [ ] **Deve** criar/garantir caracterização para `ContractRenderer.tsx`, `useDesignManager.ts` e `registry.ts` antes do refactor e mantê-los verdes depois.
## Testes de Contrato (Tipos)
- [ ] **Deve** confirmar que os tipos públicos exportados por `core/` (ex.: `ComponentType`, contratos do Provider) não regrediram para `any` nem quebraram consumidores (`tsc` global verde).
