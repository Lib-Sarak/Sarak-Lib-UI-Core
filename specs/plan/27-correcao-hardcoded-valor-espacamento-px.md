---
tipo: "spec"
titulo: "Correção de Hardcode — Valor: Espaçamento e Sombra px (Átomos)"
dominio: "Design Engine / Desengessamento (Sarak UI Core)"
status: "🟢 Vigente"
prioridade: "Alta"
tags: ["spec", "hardcoded", "valor", "espacamento", "correcao"]
relacionados: ["20-correcao-hardcoded-base", "07-agente-llm-design-e-expansao-estrutural"]
---

# 1. Contexto (Leitura Obrigatória)
> **Antes de qualquer linha de código, leia a [[20-correcao-hardcoded-base]].** Diferente da 26, esta etapa é majoritariamente **Configuração** (rotear para tokens existentes), não Expansão.

Etapa 7: eliminar os demais valores `px/rem/em` arbitrários nos átomos — paddings/sizes arbitrários (`p-[..px]`, `h-[..px]`) e offsets de sombra — usando tokens de espaçamento já existentes.

> **Proibido `--sx-*`** — use variáveis reais + fallback (ex.: `var(--sarak-layout-gap-md, 16px)`; `calc(...)` para passos sem token). Ao fim, `auditor_ghostvars.mjs` → **0 fantasmas**.

# 2. Escopo & Meta
**Meta:** zerar os **~59** valores `px/rem/em` arbitrários remanescentes em `src/components` (átomos), **exceto** hairlines `1px`/`2px` (tolerados/deduzidos).

# 3. Instruções Detalhadas
1. **Baseline (ANTES):** rode `auditor_hardcoded.mjs` e preencha o **Snapshot Inicial** (§5).
2. **Para cada valor px/rem/em:**
   - Espaçamento/size arbitrário → consumir token **real** existente + fallback (`var(--sarak-layout-gap-*, <px>)`, Spec 30) — **nunca `--sx-*`**. É **Configuração**.
   - Se faltar token de espaçamento adequado → criar via paridade 1:1:1:1:1 (Expansão pontual, HITL).
   - **Hairline `1px`/`2px`** (bordas, offsets de sombra) → **manter** (tolerado); registrar como deduzido.
   - **Verificar verde:** testes + visual.
3. **Conferência (DEPOIS):** rode `auditor_hardcoded.mjs` **e** `auditor_ghostvars.mjs` (= 0 fantasmas) e preencha o **Snapshot Final** (§6).

# 4. Checklist de Validação (Gate de Coerência — [[20-correcao-hardcoded-base]] §7)
- [x] **V1** — Duras do módulo não aumentaram. (16→16, inalterado — fora do escopo desta spec: carve-outs de grid-cols de `SarakCardGrid`/`SarakCatalogGrid`/`SarakStats`/`CalendarPanel` + responsivo de `ExpandableCard`, já conhecidos das specs 22-24)
- [x] **V2** — Nenhum balde deduzido aumentou (ícones 190→190; w-full/h-full 84→84; alinhamento 239→239 — confirmado na Reconciliação Estrutural do auditor)
- [x] **V3** — Valor `px/rem/em` dos átomos **caiu** ao alvo: 68 valores não-hairline (82 achados brutos do auditor − 14 hairlines) → **0** residuais fora de hairline/falso-positivo. Restam só os 14 hairlines tolerados (1px/2px, incl. negativos) + `SarakDrawer.tsx:77` (falso-positivo — já usa o token real `design.sidebarShadow`, o fallback JS é que contém "px").
- [x] **V4** — `run_audit.mjs`: 7 dos 8 auditores verdes (Ghost-Vars/TypeScript/Coverage/Arquitetura/CleanCode/**Paridade**/Manifesto). `auditor_hardcoded` segue reprovando só por violações **fora do escopo**: hairlines tolerados + carve-outs estruturais pré-existentes (V1) + o restante do bucket Valor fora de `src/components/atomic` (features/engines, specs 28/29).
- [x] **V5** — Comportamento preservado: todos os domínios tocados (Buttons, DataDisplay, Cards, Feedback, Inputs, Layouts, Templates, UX) com testes verdes; 2 snapshots regenerados (`SarakTitleCard`, `SarakChart`) — mudança esperada de literal→`var(--token, mesmo-valor)`, sem alteração de valor renderizado.
- [x] **V6** — 47 tokens novos + 1 correção de bug de sintaxe (reuso de token já existente); `auditor_paridade.mjs`/`verify_parity.ts` confirmam as 3 fontes (362 tokens únicos); sem componente novo, sem hook novo.

# 5. Snapshot Inicial (ANTES)
| Métrica | Valor |
|---|---:|
| px/rem/em arbitrários — átomos (fora type-scale, achados brutos do auditor) | 82 |
| Hairlines toleráveis (1px/2px, incl. negativos) | 14 |
| px/rem/em não-hairline a corrigir | 68 |
| Valor px/rem/em — total módulo | 245 |
| Duras — total do módulo | 16 |

# 6. Snapshot Final (DEPOIS)
| Métrica | Início | Fim | Δ |
|---|---:|---:|---:|
| px/rem/em não-hairline nos átomos | 68 | 0 | -68 |
| Valor px/rem/em — total módulo | 245 | 184 | -61 |
| Tokens novos criados | 0 | 47 | +47 |
| Duras — total do módulo | 16 | 16 | 0 |

**Nota sobre o delta -61 vs. -68 corrigidos:** o auditor conta violações por nó de string/template literal, não por valor individual — várias correções desta spec compartilham o mesmo token entre múltiplas ocorrências (ex.: o shadow-glow de ação duplicado em 3 Templates, o padrão de grade de pontos duplicado em `SarakEmptyState`/`AuthHero`, o 100px reaproveitado entre `SarakEmptyState`/`SarakChart`), então o delta bruto reportado é menor que a contagem de "valores distintos corrigidos" — mesmo efeito já documentado na spec 26.

# 7. Critérios de Aceite
- [x] Valor `px/rem/em` dos átomos reduzido ao alvo (só hairlines tolerados + 1 falso-positivo documentado restantes).
- [x] Checklist V1–V6 integralmente marcado.
- [x] Snapshots Inicial e Final preenchidos e anexados.
