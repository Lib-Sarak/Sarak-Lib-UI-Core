---
tipo: "spec"
titulo: "Correção de Hardcode — Valor: Espaçamento e Sombra px (Átomos)"
dominio: "Design Engine / Desengessamento (Sarak UI Core)"
status: "🔴 A Implementar"
prioridade: "Alta"
tags: ["spec", "hardcoded", "valor", "espacamento", "correcao"]
relacionados: ["20-correcao-hardcoded-base", "07-agente-llm-design-e-expansao-estrutural"]
---

# 1. Contexto (Leitura Obrigatória)
> **Antes de qualquer linha de código, leia a [[20-correcao-hardcoded-base]].** Diferente da 26, esta etapa é majoritariamente **Configuração** (rotear para tokens existentes), não Expansão.

Etapa 7: eliminar os demais valores `px/rem/em` arbitrários nos átomos — paddings/sizes arbitrários (`p-[..px]`, `h-[..px]`) e offsets de sombra — usando tokens de espaçamento já existentes.

# 2. Escopo & Meta
**Meta:** zerar os **~59** valores `px/rem/em` arbitrários remanescentes em `src/components` (átomos), **exceto** hairlines `1px`/`2px` (tolerados/deduzidos).

# 3. Instruções Detalhadas
1. **Baseline (ANTES):** rode `auditor_hardcoded.mjs` e preencha o **Snapshot Inicial** (§5).
2. **Para cada valor px/rem/em:**
   - Espaçamento/size arbitrário → consumir token existente (`var(--sx-spacing-*)`). É **Configuração**.
   - Se faltar token de espaçamento adequado → criar via paridade 1:1:1:1:1 (Expansão pontual, HITL).
   - **Hairline `1px`/`2px`** (bordas, offsets de sombra) → **manter** (tolerado); registrar como deduzido.
   - **Verificar verde:** testes + visual.
3. **Conferência (DEPOIS):** rode o auditor e preencha o **Snapshot Final** (§6).

# 4. Checklist de Validação (Gate de Coerência — [[20-correcao-hardcoded-base]] §7)
- [ ] **V1** — Duras do módulo não aumentaram.
- [ ] **V2** — Nenhum balde deduzido aumentou (exceto hairlines conscientemente tolerados).
- [ ] **V3** — Valor `px/rem/em` dos átomos **caiu** ao alvo (só hairlines restantes).
- [ ] **V4** — `run_audit.mjs`: 6 auditores verdes.
- [ ] **V5** — Comportamento preservado (snapshot + visual).
- [ ] **V6** — Token novo (se houver) respeita paridade 1:1:1:1:1; sem componente novo.

# 5. Snapshot Inicial (preencher ANTES)
| Métrica | Valor |
|---|---:|
| px/rem/em arbitrários — átomos (fora type-scale) | _(esperado ~59)_ |
| Hairlines toleráveis (1px/2px) | |
| Valor px/rem/em — total módulo | |
| Duras — total do módulo | |

# 6. Snapshot Final (preencher DEPOIS)
| Métrica | Início | Fim | Δ |
|---|---:|---:|---:|
| px/rem/em arbitrários — átomos (fora type-scale) | | | |
| Valor px/rem/em — total módulo | | | |
| Duras — total do módulo | | | |

# 7. Critérios de Aceite
- [ ] Valor `px/rem/em` dos átomos reduzido ao alvo (só hairlines tolerados restantes).
- [ ] Checklist V1–V6 integralmente marcado.
- [ ] Snapshots Inicial e Final preenchidos e anexados.
