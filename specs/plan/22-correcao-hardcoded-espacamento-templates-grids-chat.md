---
tipo: "spec"
titulo: "Correção de Hardcode — Estrutural em Templates (Grids e Chat)"
dominio: "Design Engine / Desengessamento (Sarak UI Core)"
status: "🔴 A Implementar"
prioridade: "Alta"
tags: ["spec", "hardcoded", "desengessamento", "templates", "correcao"]
relacionados: ["20-correcao-hardcoded-base", "07-agente-llm-design-e-expansao-estrutural"]
---

# 1. Contexto (Leitura Obrigatória)
> **Antes de qualquer linha de código, leia a [[20-correcao-hardcoded-base]]** — skills/specs de contexto, regras de escrita, metodologia, Protocolo de Auditoria e Gate de Coerência (V1–V6).

Etapa 2: o subconjunto de **Templates de raiz (grids, tabelas, stats) e o módulo de Chat**.

# 2. Escopo & Meta
**Meta:** zerar as **~120 violações duras** dos arquivos abaixo, migrando para Hooks/tokens. Não alterar baldes deduzidos.

| Arquivo | Duras (alvo) |
|---|---:|
| `Templates/SarakCatalogGrid.tsx` | 21 |
| `Templates/Chat/ChatInput.tsx` | 21 |
| `Templates/SarakCardGrid.tsx` | 18 |
| `Templates/SarakExpandableMatrix.tsx` | 12 |
| `Templates/Chat/MessageBubble.tsx` | 12 |
| `Templates/SarakTable.tsx` | 7 |
| `Templates/Chat/MessageList.tsx` | 7 |
| `Templates/Chat/ModelPicker.tsx` | 6 |
| `Templates/SarakChart.tsx` | 4 |
| `Templates/ImageCard.tsx` | 4 |
| `Templates/Chat/ChatHeader.tsx` | 3 |
| `Templates/SarakStats.tsx` | 2 |
| `Templates/SarakForm.tsx` | 2 |
| `Templates/SarakChat.tsx` | 1 |

# 3. Instruções Detalhadas
1. **Baseline (ANTES):** rode `auditor_hardcoded.mjs` e preencha o **Snapshot Inicial** (§5).
2. **Por arquivo (ciclo `code-adequacao`):**
   - **Caracterizar** o render atual.
   - **Migrar duras** via `useStructuralStyles()`: espaçamento → `getGridStyles`/`getFlexStyles` (`var(--sx-spacing-*)`); direção → `getFlexStyles`/`getContainerStyles`; grid → `getGridStyles`. Grids/tabelas usam preferencialmente `getGridStyles`.
   - **Manter** `flex`, `relative`, `z-*`, alinhamento, `w-full/h-full` (deduzidos).
   - **Verificar verde:** testes + visual.
3. **Conferência (DEPOIS):** rode o auditor e preencha o **Snapshot Final** (§6).

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
| Duras no escopo desta spec | _(esperado ~120)_ |
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
