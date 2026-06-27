---
tipo: "spec"
titulo: "Erradicação de `any` — Componentes (`src/components/`)"
dominio: "Sarak-Lib-UI-Core (Adequação)"
status: "🟡 Em Andamento (engines/ 100% limpo −66; restam atomic/Templates ~89 + atomic Cards/Inputs/Icon ~24)"
prioridade: "Média"
tags: ["spec", "any", "adequacao", "components", "engines", "type-safety"]
relacionados: ["60-erradicacao-any-plano-mestre", "61-erradicacao-any-nucleo", "63-erradicacao-any-design-engine"]
---

# 1. Visão Geral
Fatia **2** da campanha (Spec 60): quita o `any` em **`src/components/**`** — átomos (`atomic/`) e motores visuais (`engines/`). Maior volume da base (**~179 ocorrências**). Depende dos tipos do núcleo (Spec 61) já firmes, pois muitos átomos consomem contratos do `core/`.

# 2. Escopo e Hotspots (laudo)

## 2.1 `components/engines/` (~66) — concentrado nos builders de charts
- ✅ **`charts/SubEngines/builders/advancedCharts.ts` — 24** *(ALTO RISCO; caracterizado + tipado)*
- ✅ **`charts/SubEngines/builders/statisticalCharts.ts` — 17** *(ALTO RISCO; caracterizado + tipado)*
- ✅ **`charts/SubEngines/builders/basicCharts.ts` — 12** *(caracterizado + tipado)*
- ✅ `index.ts` — 5 *(casts mortos `ComponentType<any>` removidos; barrel não consumido internamente; `lazy` infere o tipo real → exigiu `export` das 4 interfaces `*Props`)*
- ✅ `flows/SarakFlowEngine.tsx` — 3 *(`nodes`/`edges`/`onConnect` derivados de `React.ComponentProps<typeof ReactFlow>` — `Edge`/`Connection` são namespaces no reactflow)*
- ✅ `visuals/PaletteSelector.tsx` — 2 *(interface `ColorPalette` própria)* · ✅ `visuals/SarakVisualEngine.tsx` — 1 *(`tokens: SarakThemePayload`)*
- ✅ `chat/SarakChatEngine.tsx` — 1 *(code renderer `ComponentPropsWithoutRef<'code'> & {node?,inline?}`; `style` reordenado após `{...props}` + cast do `atomDark`)* · ✅ `charts/SarakChartEngine.tsx` — 1 *(`data: ChartDataItem[]`)*

> ✅ **`components/engines/` 100% limpo (−66 no total da pasta).**

> ✅ **Builders de charts feitos (−53):** novo `builders/types.ts` (`ChartTheme = ReturnType<typeof useEChartsTheme>` [fonte única], `ChartDataItem = Record<string,unknown>` [dataset externo], `ChartBuilderConfig` [subset lido], `ChartOptionFragment = Record<string,unknown>` [fragmento p/ echarts-for-react]). Rede de caracterização: `builders/__tests__/builders.characterization.test.ts` (14 snapshots da saída ATUAL) — **idênticos após o refactor**. Sem cascade no consumer (`typeSpecificConfig` é `{}`-tipado). Único toque de corpo: candlestick `item.v as number` (minus já coage via ToNumber → zero mudança runtime) e callback `symbolSize(value: number[])`.

## 2.2 `components/atomic/Templates/` (~89) — a maior superfície atômica
- `hooks/useFormData.ts` — 11 ⚠️ · `SarakExpandableMatrix.tsx` — 10 ⚠️
- `hooks/useSecurityOrchestratorState.ts` — 6 · `hooks/useManagementGrid.ts` — 6
- `components/ManagementGroupCard.tsx` — 5 · `components/SarakCoreCard.tsx` — 4 · `Chat/useSarakChat.ts` — 4
- `hooks/useChartData.ts` — 3 · `components/SecurityOrchestrator{Status,Setup,Disable}.tsx` — 3 cada
- `SarakManagementGrid.tsx` — 3 · `FilterSelect.tsx` — 3
- `hooks/{useSarakTableData,useSarakStatsData,useCardGridState}.ts` — 2 cada · `components/AuthSocialLogin.tsx` — 2
- `components/{resolveConfig,AuthForm}.ts(x)` · `Sarak{Stats,SecurityOrchestrator,Form,CatalogGrid,CardGrid,AuthScreen}.tsx` — 1 cada

## 2.3 `components/atomic/` (Cards · Inputs · Icon · hooks · *LayoutStyles) (~24)
- `Cards/SarakTitleCard.tsx` — 6 · `Cards/SarakActionCard.tsx` — 6 · `Cards/SarakSearchCard.tsx` — 3
- `Inputs/Controls.tsx` — 5 · `Icon/IconMap.ts` — 3 · `hooks/useAtomicStyles.ts` — 3
- `Cards/hooks/useCardLayoutStyles.ts` · `Buttons/hooks/useButtonLayoutStyles.ts` · `Modals/hooks/useModalLayoutStyles.ts` · `Tables/hooks/useTableLayoutStyles.ts` — 1 cada
- `hooks/useStructuralStyles.ts` · `Icon/SarakIcon.tsx` · `Atoms/SocialButton.tsx` — 1 cada

# 3. Regras de Negócio
- **Regra 1 — Caracterização dos charts antes de tudo:** os 3 builders (advanced/statistical/basic, 53 juntos) são de alto risco visual. Snapshot/caracterização da saída antes de tipar série/config.
- **Regra 2 — Props de Card/Input → interfaces reais:** os `any` de `SarakTitleCard`/`SarakActionCard`/`Controls` são props frouxas; o fix correto é a interface de props do componente, não `unknown`.
- **Regra 3 — `*LayoutStyles` hooks:** os `any` de 1 ocorrência costumam ser o objeto de estilo/tema; tipar com o contrato de design já existente do núcleo (reaproveitar tipos da Spec 61).
- **Regra 4 — Hierarquia de substituição** conforme Spec 60 §3.2. Proibido `as any`/`@ts-ignore`.

# 4. Critérios de Aceite
- [ ] `auditor_typescript.mjs` reporta **0** `any` em todo `src/components/**`.
- [ ] `npx tsc --noEmit` = 0 erros.
- [ ] `npx vitest run` (escopo components) sem regressão; caracterização verde.
- [ ] Saída visual dos charts inalterada (snapshot/caracterização confirmando).

# 5. Plano de Testes (Quality Gate)
## Testes Unitários
- [ ] **Deve** garantir caracterização verde para os 3 builders de charts e para `useFormData.ts`/`SarakExpandableMatrix.tsx` antes e depois do refactor.
## Testes de Contrato (Tipos)
- [ ] **Deve** validar que as interfaces de props públicas dos átomos (Cards/Inputs) ficaram explícitas (sem `any`) sem quebrar consumidores no `tsc` global.
