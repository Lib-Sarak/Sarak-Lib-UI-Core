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

> ## ⛔ DEPENDÊNCIA: executar a [[30-erradicacao-variaveis-fantasma]] primeiro
> O namespace `--sx-*` é **fantasma** (não resolve). Esta spec **não pode** migrar para `var(--sx-spacing-*)` — esse era o erro da Spec 21. Use **somente variáveis reais da engine + fallback** (ver tabela na §3). Rode o `auditor_ghostvars.mjs` ao fim: **0 fantasmas**.
>
> **Carve-out de grids:** os `grid-cols-*` de `SarakStats` (2/lg:4), `SarakCardGrid` (1/md:2/xl:3) e `SarakCatalogGrid` (1/md:2/lg:3/xl:4) são **3 malhas distintas** sem token equivalente. Ficam **DEFERIDOS** para uma spec de Expansão paramétrica de grid-columns — **não** force `getGridStyles` (só tem col-12/auto-fit/masonry) nem reloc para string inline. O alvo de duras desta spec **exclui** esses grid-cols.

# 2. Escopo & Meta
**Meta:** zerar as violações duras **de espaçamento/direção** dos arquivos abaixo (os `grid-cols` deferidos não contam), migrando para **variáveis reais + fallback**. Não alterar baldes deduzidos.

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
   - **Migrar duras para VARIÁVEIS REAIS + fallback** (jamais `--sx-*`). Escolha o token pela **semântica do contexto**:
     - espaçamento/gap → `var(--theme-gap, <px>)` ou `var(--sarak-layout-gap-md, <px>)` (Chat/seções); derive valores via `calc()` quando preciso (padrão já usado no `SarakCardGrid`).
     - direção (`flex-col/row`) → `getFlexStyles`/`getContainerStyles`.
     - **Chat não é card:** não use `--sarak-card-padding-*` em ChatInput/MessageBubble; use tokens de layout/gap.
     - **fallback obrigatório** em todo `var(--real, <valor-original-px>)` para preservar 1:1.
   - **`grid-cols-*` → NÃO TOCAR** (carve-out deferido).
   - **Manter** `flex`, `relative`, `z-*`, alinhamento, `w-full/h-full` (deduzidos).
   - **Verificar verde:** testes + **visual obrigatório** (o auditor de hardcode não detecta var-fantasma).
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
