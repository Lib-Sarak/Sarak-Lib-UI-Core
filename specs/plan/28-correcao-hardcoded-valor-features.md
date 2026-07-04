---
tipo: "spec"
titulo: "Correção de Hardcode — Valor: Features e Não-Atômicos"
dominio: "Design Engine / Desengessamento (Sarak UI Core)"
status: "🔴 A Implementar"
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
- [ ] **V1** — Duras do módulo não aumentaram.
- [ ] **V2** — Nenhum balde deduzido aumentou (exceto hairlines tolerados).
- [ ] **V3** — Valor `px/rem/em` (features) **caiu** ao alvo.
- [ ] **V4** — `run_audit.mjs`: 6 auditores verdes.
- [ ] **V5** — Comportamento preservado (snapshot + visual).
- [ ] **V6** — Token novo (se houver) respeita paridade 1:1:1:1:1; sem componente novo.

# 5. Snapshot Inicial (preencher ANTES)
| Métrica | Valor |
|---|---:|
| px/rem/em — features e não-atômicos | _(esperado ~150)_ |
| Hairlines toleráveis (1px/2px) | |
| Valor px/rem/em — total módulo | |

# 6. Snapshot Final (preencher DEPOIS)
| Métrica | Início | Fim | Δ |
|---|---:|---:|---:|
| px/rem/em — features e não-atômicos | | | |
| Valor px/rem/em — total módulo | | | |

# 7. Critérios de Aceite
- [ ] Valor `px/rem/em` fora dos átomos reduzido ao alvo (só hairlines tolerados restantes).
- [ ] Checklist V1–V6 integralmente marcado.
- [ ] Snapshots Inicial e Final preenchidos e anexados.
