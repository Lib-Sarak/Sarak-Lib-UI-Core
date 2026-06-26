---
tipo: "spec"
titulo: "Erradicação de `any` — Núcleo (`src/core/`)"
dominio: "Sarak-Lib-UI-Core (Adequação)"
status: "🔴 A Implementar"
prioridade: "Alta"
tags: ["spec", "any", "adequacao", "core", "type-safety"]
relacionados: ["60-erradicacao-any-plano-mestre", "62-erradicacao-any-componentes", "50-finalizacao-adequacao-e-entrega"]
---

# 1. Visão Geral
Fatia **1** da campanha (Spec 60): quita o `any` em **`src/core/**`** — a fundação que mais consumidores dependem. Tipar o núcleo primeiro propaga segurança para `components/` e `features/`. **~134 ocorrências** em ~32 arquivos.

# 2. Escopo e Hotspots (laudo)
Por sub-bloco do núcleo (contagem aproximada do `auditor_typescript.mjs`):

## 2.1 `core/Discovery/` (~57)
- **`components/ContractRenderer.tsx` — 39** ⚠️ **ALTO RISCO** (coração do runtime de descoberta; caracterização reforçada + HITL antes de tocar).
- `components/hooks/useExpandableMatrixEngine.ts` — 7
- `registry.ts` — 6 · `types.ts` — 3 · `hooks/useEndpointResolver.ts` — 2

## 2.2 `core/Provider/` (~42)
- `hooks/useDesignManager.ts` — 10 ⚠️ (gerente de design; risco médio-alto)
- `hooks/useSarakDrafting.ts` — 7 · `hooks/useDesignRemoteLoader.ts` — 5
- `manifest.ts` — 4 · `hooks/useDesignSync.ts` — 4 · `utils/validation.ts` — 3
- `hooks/useRegistryManager.ts` — 3 · `hooks/useBrandingManager.ts` — 3
- `components/DesignInjector.tsx` — 2 · `hooks/useSarakUIEffects.ts` — 1

## 2.3 `core/Shell/` (~20)
- `Components/ShellContent.tsx` — 6 · `Components/TopbarNav.tsx` — 3 · `Components/SidebarNav.tsx` — 3
- `Components/types.ts` — 2 · `Components/ShellUserWidget.tsx` — 2
- `hooks/useShellLayoutStyles.ts` — 1 · `Components/ShellSearchWidget.tsx` — 1
- `Components/ShellLanguageSelector.tsx` — 1 · `Components/DockNav.tsx` — 1

## 2.4 `core/Design/` (~15)
- `presets/themes/color-engine.ts` — 4 · `components/DesignScope.tsx` — 3
- `types.ts` — 2 · `master-map.ts` — 2 ⚠️ (fonte da paridade — não alterar IDs/estrutura, só tipos)
- `presets/modules/index.ts` — 1 · `presets/components/cards.ts` — 1
- `hooks/useMediaLuminance.ts` — 1 · `components/SarakBackgroundRenderer.tsx` — 1

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
