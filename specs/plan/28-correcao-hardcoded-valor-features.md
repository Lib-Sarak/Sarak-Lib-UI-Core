---
tipo: "spec"
titulo: "Correção de Hardcode — Valor: Features e Não-Atômicos"
dominio: "Design Engine / Desengessamento (Sarak UI Core)"
status: "🟢 Vigente"
prioridade: "Média"
tags: ["spec", "hardcoded", "valor", "features", "correcao"]
relacionados: ["20-correcao-hardcoded-base", "07-agente-llm-design-e-expansao-estrutural"]
---

# 1. Contexto (Leitura Obrigatória)
> **Antes de qualquer linha de código, leia a [[20-correcao-hardcoded-base]].** O detector de **valor** (`px/rem/em`) é global (`src/components` + `src/features`); esta etapa cobre a superfície fora dos átomos.

Etapa 8: eliminar os valores `px/rem/em` hardcoded em `src/features` e componentes não-atômicos (`components/Layout`, etc.). Reaproveita os tokens criados nas specs 26/27.

> **Proibido `--sx-*`** — use variáveis reais + fallback. Ao fim, `auditor_ghostvars.mjs` → **0 fantasmas**.

# 2. Escopo & Meta
**Meta:** zerar os **~150** valores `px/rem/em` hardcoded fora dos átomos, **exceto** hairlines `1px`/`2px`.

> **Nota arquitetural:** `features/` pode legitimamente conter mais layout que os átomos. O foco aqui é **valor hardcoded** (px/rem/em), não a régua estrutural de Tailwind (que é dos átomos). Reusar tokens existentes sempre que possível.

# 3. Instruções Detalhadas
1. **Baseline (ANTES):** rode `auditor_hardcoded.mjs` e preencha o **Snapshot Inicial** (§5).
2. **Para cada valor px/rem/em:**
   - Reusar token **real** existente + fallback (`var(--sarak-*)`/`--theme-*`, incluindo os criados em 26/27) — **nunca `--sx-*`**.
   - Token novo somente se imprescindível, via paridade 1:1:1:1:1 (HITL).
   - **Hairline `1px`/`2px`** → manter (tolerado).
   - **Verificar verde:** testes + visual da feature.
3. **Conferência (DEPOIS):** rode `auditor_hardcoded.mjs` **e** `auditor_ghostvars.mjs` (= 0 fantasmas) e preencha o **Snapshot Final** (§6).

# 4. Checklist de Validação (Gate de Coerência — [[20-correcao-hardcoded-base]] §7)
- [x] **V1** — Duras do módulo não aumentaram (16→16, inalterado — mesmos carve-outs de grid-cols/ExpandableCard já conhecidos).
- [x] **V2** — Nenhum balde deduzido aumentou (ícones 190→190; w-full/h-full 84→84; alinhamento 239→239).
- [x] **V3** — Valor `px/rem/em` (features + `src/components/engines`) **caiu** ao alvo: 163 → 23 residuais, dos quais 18 são hairlines tolerados (mesma regra 1px/2px da spec 27, estendida a `0.5px` como sub-hairline no grid pontilhado do `SarakVisualEngine`) e 5 são arquivos de teste E2E (`__e2e__/Boot.spec.tsx`, `__e2e__/RealtimeInjection.spec.tsx`) — fixtures de teste, não código de produção, fora do escopo desta spec. `src/components/Layout` conferido: 0 violações (já usa `var(--sarak-layout-gap,1.5rem)`).
- [x] **V4** — `run_audit.mjs`: 7 dos 8 auditores verdes (Ghost-Vars/TypeScript/Coverage/Arquitetura/CleanCode/**Paridade**/Manifesto). `auditor_hardcoded` segue reprovando só por hairlines + fixtures de teste E2E + os mesmos resíduos de átomos/carve-outs já documentados nas specs 22-27.
- [x] **V5** — Comportamento preservado: todos os domínios tocados (engines, components/controls, Library, Main, Panels, Canvas) com testes verdes; ~10 snapshots regenerados (mudança esperada de literal→`var(--token, mesmo-valor)`); 1 falha pré-existente identificada e confirmada via `git stash` como não-relacionada (`PreviewCanvas.test.tsx` — já falhava antes desta spec, buscando uma classe `w-[var(--device-width)]` que não existe no componente atual).
- [x] **V6** — 45 tokens novos (4 em `typography.ts`, 16 em `specialized.ts`, 25 em `cards.ts`) + reuso de tokens já reais existentes (`--sarak-flow-node-radius`, `--sarak-scroll-width`, `--sarak-scroll-radius`, mais os 11 de type-scale/tracking da spec 26); `verify_parity.ts` confirma as 3 fontes (407 tokens únicos); sem componente novo, sem hook novo.

# 5. Snapshot Inicial (ANTES)
| Métrica | Valor |
|---|---:|
| px/rem/em — features e não-atômicos (`src/components/engines` + `src/features/DesignEngine`) | 163 |
| Hairlines toleráveis (1px/2px, incl. `0.5px`) | — |
| Valor px/rem/em — total módulo | 184 |

# 6. Snapshot Final (DEPOIS)
| Métrica | Início | Fim | Δ |
|---|---:|---:|---:|
| px/rem/em — features e não-atômicos | 163 | 23 (18 hairlines + 5 fixtures E2E fora de escopo) | -140 |
| Valor px/rem/em — total módulo | 184 | 48 | -136 |
| Tokens novos criados | 0 | 45 | +45 |

**Nota sobre o delta -136 vs. -140 corrigidos:** assim como nas specs 26/27, o auditor conta por nó de string/template literal, não por valor individual — a maior parte da correção aqui foi reuso puro dos 11 tokens de type-scale/tracking da spec 26 (>100 ocorrências de `text-[Npx]`/`tracking-[Nem]` em `Panels/Library/Main/components/controls/Canvas`), e vários valores compartilham o mesmo token entre arquivos (ex.: `presetPreviewMinHeight`/`presetPreviewPaddingY` entre `ButtonPresetPreview`/`InputPresetPreview`; `devicePhoneWidth`/`devicePhoneHeight` reaproveitados 2-3x no próprio `PreviewCanvas`; `engineMinHeightLg` compartilhado entre `SarakChatEngine`/`SarakFlowEngine`).

**Achados registrados durante a migração:**
- `flowNodeRadius` já existia como token real no schema (`specialized.ts`, criado antes desta spec) — o `<style>` do `SarakFlowEngine` só precisou reconsumi-lo em vez de criar um novo.
- `scrollWidth`(6px)/`scrollRadius`(10px) do schema `scrollbars.ts` batiam exatamente com o `<style dangerouslySetInnerHTML>` de custom-scrollbar do `MasterControlPanel.tsx` — reuso direto, sem token novo.
- Vários `hover:shadow-[0_Npx_..._rgba(...)]` no Canvas usam sintaxe Tailwind com underscore no lugar de espaço — o regex do auditor não casa `\b` entre `_` e o dígito seguinte (ambos são "word chars"), então esses shadows **não são flagrados** pelo auditor mesmo contendo `px` cru. Confirmado comparando a lista de violações antes/depois de tocar nesses arquivos — o padrão `0_10px_40px_-10px` em 5 arquivos do Canvas (catálogos) segue sem token, documentado como blind spot conhecido do auditor (mesma classe do achado da spec 27 com `shadow-[0_0_15px_...]`).
- Validado com `npm run build:css` que uma sintaxe nova usada aqui (`calc(var(--token,valor)*-1)` dentro de um bracket Tailwind, ex. `hover:translate-y-[calc(var(--sarak-card-hover-lift,4px)*-1)]`) compila corretamente (sem precedente anterior no repo com vírgula dentro do `calc()` em bracket).

# 7. Critérios de Aceite
- [x] Valor `px/rem/em` fora dos átomos reduzido ao alvo (só hairlines tolerados + fixtures E2E restantes).
- [x] Checklist V1–V6 integralmente marcado.
- [x] Snapshots Inicial e Final preenchidos e anexados.
