---
tipo: "spec"
titulo: "Correção de Hardcode — Estrutural em Cards"
dominio: "Design Engine / Desengessamento (Sarak UI Core)"
status: "🔴 A Implementar"
prioridade: "Alta"
tags: ["spec", "hardcoded", "desengessamento", "cards", "correcao"]
relacionados: ["20-correcao-hardcoded-base", "07-agente-llm-design-e-expansao-estrutural"]
---

# 1. Contexto (Leitura Obrigatória)
> **Antes de qualquer linha de código, leia a [[20-correcao-hardcoded-base]]** — skills/specs de contexto, regras de escrita, metodologia, Protocolo de Auditoria e Gate de Coerência (V1–V6).

Etapa 4: a família de **Cards**. Já existe o hook de domínio `useCardLayoutStyles` — esta etapa completa a migração dos resíduos.

> **Proibido `--sx-*`** — use variáveis reais + fallback (ex.: `var(--sarak-layout-gap-md, 16px)`; `calc(...)` para passos sem token). Ao fim, `auditor_ghostvars.mjs` → **0 fantasmas**.

# 2. Escopo & Meta
**Meta:** zerar as **~65 violações duras** dos arquivos abaixo, reaproveitando `useCardLayoutStyles` / `getCardStyles`.

| Arquivo | Duras (alvo) |
|---|---:|
| `Cards/SarakActionCard.tsx` | 20 |
| `Cards/ExpandableCard.tsx` | 16 |
| `Cards/SarakSearchCard.tsx` | 15 |
| `Cards/SarakTitleCard.tsx` | 14 |

# 3. Instruções Detalhadas
1. **Baseline (ANTES):** rode `auditor_hardcoded.mjs` e preencha o **Snapshot Inicial** (§5).
2. **Por arquivo (ciclo `code-adequacao`):**
   - **Caracterizar** o render atual.
   - **Migrar duras** via `useCardLayoutStyles` (container/content/header/footer) e `useStructuralStyles().getCardStyles`; espaçamento → **variável real + fallback** (ex.: `var(--sarak-layout-gap-md, 16px)`, Spec 30) — **nunca `--sx-*`**; direção → estratégias do hook de card.
   - **Atenção aos resíduos:** estes arquivos já consomem o hook em parte; remova as classes estruturais que sobraram no JSX.
   - **Manter** `flex`, `relative`, `z-*`, alinhamento, `w-full/h-full` (deduzidos).
   - **Verificar verde:** testes + visual (estados expandido/colapsado).
3. **Conferência (DEPOIS):** rode `auditor_hardcoded.mjs` **e** `auditor_ghostvars.mjs` (= 0 fantasmas) e preencha o **Snapshot Final** (§6).

# 4. Checklist de Validação (Gate de Coerência — [[20-correcao-hardcoded-base]] §7)
- [ ] **V1** — Duras do escopo zeradas; total do módulo diminuiu.
- [ ] **V2** — Nenhum balde deduzido aumentou.
- [ ] **V3** — Valor px/rem/em não aumentou.
- [ ] **V4** — `run_audit.mjs`: 6 auditores verdes.
- [ ] **V5** — Comportamento preservado (snapshot + visual).
- [ ] **V6** — Sem componente novo; token novo só com paridade 1:1:1:1:1.

# 5. Snapshot Inicial (preencher ANTES)
| Métrica | Valor |
|---|---:|
| Duras no escopo desta spec | _(esperado ~65)_ |
| Duras — total do módulo | |
| Deduzido — ícones | |
| Deduzido — w-full/h-full | |
| Deduzido — alinhamento | |
| Valor px/rem/em — total | |

# 6. Snapshot Final (preencher DEPOIS)
| Métrica | Início | Fim | Δ |
|---|---:|---:|---:|
| Duras no escopo desta spec | | | |
| Duras — total do módulo | | | |
| Deduzido — ícones | | | |
| Deduzido — w-full/h-full | | | |
| Deduzido — alinhamento | | | |
| Valor px/rem/em — total | | | |

# 7. Critérios de Aceite
- [ ] Todos os arquivos do §2 com **0 violações duras**.
- [ ] Checklist V1–V6 integralmente marcado.
- [ ] Snapshots Inicial e Final preenchidos e anexados.
