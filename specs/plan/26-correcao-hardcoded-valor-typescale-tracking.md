---
tipo: "spec"
titulo: "Correção de Hardcode — Valor: Type-scale e Tracking (Átomos / Expansão)"
dominio: "Design Engine / Desengessamento (Sarak UI Core)"
status: "🔴 A Implementar"
prioridade: "Alta"
tags: ["spec", "hardcoded", "valor", "typescale", "expansao", "correcao"]
relacionados: ["20-correcao-hardcoded-base", "07-agente-llm-design-e-expansao-estrutural", "04-paridade-cinco-camadas"]
---

# 1. Contexto (Leitura Obrigatória)
> **Antes de qualquer linha de código, leia a [[20-correcao-hardcoded-base]].** Esta etapa é de **Expansão (paridade 1:1:1:1:1)** — vai **criar tokens**, não apenas rotear para hooks. Leia também `09-expansao-vs-configuracao` e `04-paridade-cinco-camadas`.

Etapa 6: eliminar os **valores arbitrários de tipografia** nos átomos — `text-[Npx]`, `tracking-[Nem]`, `leading-[…]` — criando a escala tipográfica como token.

# 2. Escopo & Meta
**Meta:** zerar os **~64** valores arbitrários de type-scale/tracking/leading em `src/components` (átomos), substituindo por tokens (`var(--sx-*)`).

**Natureza:** **Expansão** — a maioria não tem token equivalente (`--sx-text-9px` não existe). Cada token novo exige as 5 camadas + **HITL**.

# 3. Instruções Detalhadas
1. **Baseline (ANTES):** rode `auditor_hardcoded.mjs` e preencha o **Snapshot Inicial** (§5).
2. **Consolidar a escala antes de migrar:** levante os tamanhos/trackings distintos usados (ex.: 7/8/9/10px) e proponha um conjunto fechado de tokens de type-scale — **HITL para aprovar** antes de propagar.
3. **Para cada token aprovado:** criar via skill `ui-novo-componente` nas 5 camadas (Schema, MasterMap, `theme_table_mapping.json`, DesignEngine, Catálogo) — **nunca chave órfã**.
4. **Migrar o consumo:** trocar `text-[9px]`/`tracking-[0.3em]` por `var(--sx-*)` nos átomos.
5. **Verificar verde:** testes + visual (densidade/legibilidade do texto).
6. **Conferência (DEPOIS):** rode o auditor e preencha o **Snapshot Final** (§6).

# 4. Checklist de Validação (Gate de Coerência — [[20-correcao-hardcoded-base]] §7)
- [ ] **V1** — Duras do módulo não aumentaram.
- [ ] **V2** — Nenhum balde deduzido aumentou.
- [ ] **V3** — Valor `px/rem/em` **caiu** (type-scale/tracking dos átomos zerados).
- [ ] **V4** — `run_audit.mjs`: 6 auditores verdes (em especial **Paridade** dos tokens novos).
- [ ] **V5** — Comportamento preservado (snapshot + visual).
- [ ] **V6** — Token novo respeita paridade 1:1:1:1:1; sem componente novo.

# 5. Snapshot Inicial (preencher ANTES)
| Métrica | Valor |
|---|---:|
| Type-scale/tracking arbitrários (átomos) | _(esperado ~64)_ |
| Valor px/rem/em — total módulo | |
| Tokens de type-scale novos | 0 |
| Duras — total do módulo | |

# 6. Snapshot Final (preencher DEPOIS)
| Métrica | Início | Fim | Δ |
|---|---:|---:|---:|
| Type-scale/tracking arbitrários (átomos) | | | |
| Valor px/rem/em — total módulo | | | |
| Tokens de type-scale novos | | | |
| Duras — total do módulo | | | |

# 7. Critérios de Aceite
- [ ] 0 type-scale/tracking/leading arbitrários nos átomos.
- [ ] Cada token novo presente nas 5 camadas (auditor de Paridade verde).
- [ ] Checklist V1–V6 integralmente marcado.
- [ ] Snapshots Inicial e Final preenchidos e anexados.
