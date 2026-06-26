---
tipo: "spec"
titulo: "Foundation — Tipo do Design-State (`SarakDesignState`)"
dominio: "Sarak-Lib-UI-Core (Adequação)"
status: "🟡 Em Andamento (Fundação aplicada; sweep pendente)"
prioridade: "Alta"
tags: ["spec", "any", "adequacao", "design-state", "type-safety", "foundation", "transversal"]
relacionados: ["60-erradicacao-any-plano-mestre", "61-erradicacao-any-nucleo", "62-erradicacao-any-componentes", "63-erradicacao-any-design-engine"]
---

# 1. Visão Geral
Batch **transversal de fundação** da campanha (Spec 60). A varredura da Spec 61 provou que o `any` dominante restante é `design: any`, e que ele **não se resolve por arquivo**: é a ausência de **um tipo** que descreva o estado de design em runtime. Esta spec define esse tipo (`SarakDesignState`) e o aplica da fonte aos consumidores, **atravessando as Specs 61 ↔ 62 ↔ 63** de propósito (o `design:any` vive nas três camadas e na fronteira `core/`↔`features/`).

> **Pré-requisito de sequência:** roda **antes** do restante das fatias 61/62/63 tocar sites `design:any`. Quita um bloco grande (estimado 100+ ocorrências) de uma vez.

# 2. As duas tensões (por que é fundação, não faxina)
1. **Eixo das chaves (passaporte vs. pasta de viagem):** `SarakThemePayload` tem domínio **fechado** ("a Interface dita a Realidade"). Mas o estado real carrega chaves que o payload não prevê — `validateDesign` injeta `atmosphere`/`specialized`/`schema_version`; o Shell lê `sidebarPosition`/`navbarLayout`/`contentAlignment`/`searchPositionTopbar`/`emptyStateId`/`isSplitViewEnabled`/`secondaryModuleId`. Tipar como `SarakThemePayload` **quebra** na desestruturação dessas chaves.
2. **Eixo dos valores (rotular o cano na fonte, não cada torneira):** valores de token são usados **direto como CSS** (`width: design.sidebarWidth`). Rotular o valor de `unknown` (`Record<string,unknown>`) força cast em **cada consumidor** — e cascateia para `features/` (comprovado: AtmosphereCatalog/ButtonPreset/InputPreset/PresetCard quebraram, revertido). A solução é tipar **a fonte** com a chave correta, e as torneiras funcionam sem cast.

# 3. Decisão de tipo (Opção C — via gerador tipado)
A Fase 0 provou que o problema **não** são as chaves (quase todas já são `DesignTokenId`) e sim o **valor**: `Partial<Record<DesignTokenId, unknown>>` torna todo `design.X` um `unknown`, que quebra ao ser usado como CSS. A correção é **propagar, pela codegen, o tipo que o `MASTER_DESIGN_MAP` já conhece** (`token.type`).

**3.1 — Evoluir o gerador** (`scripts/generate-token-types.ts`) para, além da união `DesignTokenId` (preservada — a paridade depende dela), emitir uma **interface tipada por token**:

```ts
// gerado: src/core/Provider/generated/design-token-ids.ts
import type { ResponsiveValue } from '../../Design/types';

export interface SarakDesignTokens {
    isNavHidden: boolean;
    sidebarPosition: string;            // (ver §3.3: base-type vs união literal)
    sidebarWidth: number | ResponsiveValue<number>;
    primaryColor: string;
    // … 1 entrada por token, tipo derivado de token.type
}
export type DesignTokenId = keyof SarakDesignTokens;   // mantém o export que a paridade usa
```

**3.2 — `SarakThemePayload` absorve os valores precisos** (1 linha em `Provider/types.ts`):
```ts
export type SarakThemePayload = Partial<SarakDesignTokens> & SarakThemePayloadExtras;
// SarakDesignState = payload + as poucas órfãs/runtime (Fase 0):
export type SarakDesignState = SarakThemePayload & SarakRuntimeExtras;

interface SarakRuntimeExtras {           // SÓ o que a Fase 0 achou fora do schema:
    animationSpeed?: number;
    secondaryModuleId?: string;
    emptyStateId?: string;
    logoPosition?: 'left' | 'center';
    logoScale?: number;
    atmosphere?: Record<string, unknown>;
    specialized?: Record<string, unknown>;
    schema_version?: string;
}
```

**3.3 — Tabela de tradução `token.type → TS` (o coração do gerador):**

| `token.type` | TS |
|---|---|
| `color`, `string`, `font`, `text`, `image`, `file` | `string` |
| `number`, `slider` | `number` |
| `boolean` | `boolean` |
| `select` | **`string` (v1)** — união literal das `constraints.options` fica como refinamento opcional (precisa, mas pode super-restringir temas legados) |
| qualquer um com `isResponsive: true` | `T \| ResponsiveValue<T>` |

**Alternativas descartadas:** **A** (`Record<string, DesignTokenValue>` aberto) — espalha cast por dezenas de consumidores e perde o domínio fechado; **B** (extras na mão sem gerador) — deixa o valor dos tokens em `unknown` (não resolve o eixo dos valores, que é o real bloqueador).

# 4. Plano de Execução (Fases)
- **✅ Fase 0 — Inventário (read-only, feita):** varredura de todos os `design.X` / `} = design` em `core/` + `features/`. Resultado: ~40+ arquivos consomem `design` (atravessa 61 **e** 62); só **5 órfãs** estruturais (`animationSpeed`, `secondaryModuleId`, `emptyStateId`, `logoPosition`, `logoScale`) + 3 de runtime (`atmosphere`/`specialized`/`schema_version`); o resto já é `DesignTokenId`. **Bloqueador real = valor `unknown`, não as chaves.**
- **✅ Fase 1a — Gerador evoluído:** `scripts/generate-token-types.ts` agora emite `SarakDesignTokens` (tradução §3.3) + `DesignTokenId = keyof SarakDesignTokens` (chaves citadas quando necessário; dedup first-wins).
- **✅ Fase 1b — Regenerado:** `npx tsx scripts/generate-token-types.ts` → **304 tokens tipados**. `verify_parity.ts` ✅ (304, schema intacto).
- **✅ Fase 1c — Contrato absorvido:** `Provider/types.ts` → `SarakThemePayload = Partial<SarakDesignTokens> & Extras`; `SarakDesignState` + `SarakRuntimeExtras` definidos.
- **✅ Cascade medido = baixíssimo:** apertar `unknown → preciso` gerou **só 3 erros** (mesmo padrão: cast morto `(animX as string)` em `SarakTabs`/`SarakAccordion`/`SarakDrawer`, onde o token de duração já é `number`). Corrigidos (`typeof x === 'number' ? \`${x}ms\` : default`). `tsc` 0 · testes das pastas verdes · auditor segue **454** (a fundação ainda não remove `any` — isso é o sweep).
- **✅ Fase 2 — Fonte tipada (−22 `any`: 432):** `validateDesign(design: unknown): SarakDesignState` (1 seam cast `as unknown as` no return); `useDesignManager` usa `useState<SarakDesignState>` + props `SarakThemePayload`/`SarakUIOptions`/`ThemeEntry`; `useDesignSync`/`useDesignRemoteLoader` recebem `SetDesign`+`ThemeEntry[]`/`MutableRefObject<SarakUIOptions>`. Tipos auxiliares `ThemeEntry` e `SetDesign` em `types.ts`; `SarakUIProvider` passa `allThemes` como `ThemeEntry[]` (1 cast de fronteira: GLOBAL_THEMES + custom do banco). Seam: `SovereignThemeInjector.design → SarakThemePayload`; `mode` castado p/ `'light'|'dark'` no `SarakBackgroundRenderer`. `tsc` 0 · Provider 34/34 · paridade ✅.
- **Fase 3 — Sweep dos consumidores (queda em bloco):** Shell inteiro, `DesignInjector`, `ShellContent`, `color-engine`/presets **e** os consumidores em `features/` + os reads via `useSarakUI().design` em `components/` — agora compilam (cada chave tem tipo); cast só onde sobrar genuíno dinamismo.
- **Fase 4 — Gate:** `tsc` 0 · `vitest run` por pasta · auditor (delta) · `verify_parity.ts` ✅.

> **Risco-chave (Fase 1b):** apertar `unknown → tipo preciso` pode revelar usos hoje incorretos (tokens `boolean`/responsivos usados como string). São achados legítimos, corrigidos no sweep; mitigação: `select → string` em v1 (§3.3) para minimizar a superfície, e `tsc`/testes por pasta gateando cada bloco.

# 5. Regras de Negócio
- **Regra 1 — Tipar a fonte, não a torneira:** valores de token recebem o tipo correto **na declaração** (`SarakRuntimeExtras`/payload), nunca cast no ponto de uso CSS.
- **Regra 2 — Casts só no seam:** os 1–2 casts deliberados ficam concentrados na fonte (`validateDesign` return, índice dinâmico do `useDesignVariables`), documentados. Proibido `as any`/`@ts-ignore` (Spec 60 §3).
- **Regra 3 — `master-map.ts` intocável estruturalmente:** só tipos; rodar `verify_parity.ts`.
- **Regra 4 — Caracterização antes:** onde faltar teste (Shell), criar antes do refactor (`code-adequacao`).
- **Regra 5 — Reconciliação, não invenção:** `SarakRuntimeExtras` termina a reconciliação já anotada como pendente no `SarakThemePayloadExtras`; **não** cria token novo (token novo nasce no schema/paridade).

# 6. Critérios de Aceite
- [ ] `SarakDesignState`/`SarakRuntimeExtras` definidos e usados como tipo único do estado de design (fonte → contexto → injectors → Shell).
- [ ] Todos os sites `design:any` do escopo (§7) a **0** `any`.
- [ ] `npx tsc --noEmit` = 0 erros.
- [ ] `npx vitest run` (por pasta: core, features) sem regressão; caracterização verde.
- [ ] `verify_parity.ts` ✅ (paridade intacta).
- [ ] Nenhum cast novo `as any`/`@ts-ignore`; os casts de seam estão documentados e contados.

# 7. Escopo (arquivos do batch)
- **Provider:** `types.ts`, `hooks/useDesignManager.ts`, `hooks/useDesignSync.ts`, `hooks/useDesignRemoteLoader.ts`, `utils/validation.ts`, `components/DesignInjector.tsx`, `manifest.ts`.
- **Shell:** `Components/ShellContent.tsx`, `Components/TopbarNav.tsx`, `Components/SidebarNav.tsx`, `Components/DockNav.tsx`, `Components/ShellUserWidget.tsx`, `Components/ShellSearchWidget.tsx`, `Components/ShellLanguageSelector.tsx`, `Components/types.ts`, `hooks/useShellLayoutStyles.ts`.
- **Design:** `presets/themes/color-engine.ts`, `presets/modules/index.ts`, `presets/components/cards.ts`, `components/SarakBackgroundRenderer.tsx`, `components/DesignScope.tsx`.
- **Features (consumidores que cascateiam):** `DesignEngine/Canvas/components/{AtmosphereCatalog,ButtonPresetPreview,InputPresetPreview,PresetCard}.tsx` e demais que a Fase 0 revelar.

# 8. Plano de Testes (Quality Gate)
## Testes Unitários
- [ ] **Deve** manter verdes (e criar onde faltar) os testes de caracterização do Shell e do Provider design-state durante o sweep.
## Testes de Contrato (Tipos)
- [ ] **Deve** confirmar via `tsc --noEmit` que `SarakDesignState` é assinável na costura do `UIContext.Provider` (o erro original que provou a necessidade do tipo) e que os consumidores CSS não exigem cast.
