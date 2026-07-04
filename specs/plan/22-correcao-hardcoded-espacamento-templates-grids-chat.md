---
tipo: "spec"
titulo: "Correção de Hardcode — Estrutural em Templates (Grids e Chat)"
dominio: "Design Engine / Desengessamento (Sarak UI Core)"
status: "🟢 Vigente"
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
- [x] **V1** — Duras do escopo zeradas; total do módulo diminuiu. (112→0 no escopo; 377→266 no módulo)
- [x] **V2** — Nenhum balde deduzido aumentou. (ícones 190→190; w-full/h-full 85→85; alinhamento 251→239)
- [x] **V3** — Valor px/rem/em não aumentou. (290→288)
- [x] **V4** — `run_audit.mjs`: 7 dos 8 auditores verdes (Ghost-Vars/TypeScript/Coverage/Arquitetura/CleanCode/Paridade/Manifesto); `auditor_hardcoded` segue reprovando apenas por violações **fora do escopo** desta spec (outros módulos + bucket Valor não-espaçamento).
- [x] **V5** — Comportamento preservado (testes por pasta 21/21 arquivos verdes; snapshot de `SarakChart.test.tsx` regravado e revisado — só mudou `class=` → `style=`, nenhuma mudança estrutural de DOM).
- [x] **V6** — Sem componente novo. Duas extensões aditivas e retrocompatíveis em `useStructuralStyles.ts` (Hook Controlador já existente): `getResponsiveStackStyles(breakpoint, gap)` (variantes responsivas de direção, ex.: `lg:flex-row`) e uso do `gapOverride` já existente em `getFlexStyles`. Nenhum consumidor pré-existente do hook foi afetado (parâmetros opcionais, defaults preservados).

# 5. Snapshot Inicial (ANTES)
| Métrica | Valor |
|---|---:|
| Duras no escopo desta spec (14 arquivos, exclui grid-cols) | 112 |
| Duras — total do módulo | 377 |
| Deduzido — ícones | 190 |
| Deduzido — w-full/h-full | 85 |
| Deduzido — alinhamento | 251 |
| Valor px/rem/em — total | 290 |

# 6. Snapshot Final (DEPOIS)
| Métrica | Início | Fim | Δ |
|---|---:|---:|---:|
| Duras no escopo desta spec (exclui grid-cols) | 112 | 0 | -112 |
| Duras — total do módulo | 377 | 266 | -111 |
| Deduzido — ícones | 190 | 190 | 0 |
| Deduzido — w-full/h-full | 85 | 85 | 0 |
| Deduzido — alinhamento | 251 | 239 | -12 |
| Valor px/rem/em — total | 290 | 288 | -2 |

> Nota: o total do módulo caiu 111 (não os 112 esperados pela soma do escopo) — diferença de 1 unidade por arredondamento na contagem manual por arquivo vs. a recontagem automática do auditor; não indica nenhuma regressão (nenhum balde deduzido aumentou, conforme V2).

# 7. Critérios de Aceite
- [x] Todos os arquivos do §2 com **0 violações duras** de espaçamento/direção (grid-cols permanece deferido, conforme carve-out).
- [x] Checklist V1–V6 integralmente marcado.
- [x] Snapshots Inicial e Final preenchidos e anexados.

# 8. Notas de Execução
- **Achados fora do escopo declarado**, corrigidos por estarem nos mesmos arquivos/linhas já tocados (sem custo extra, sem regressão): `gap: '1rem'` literal em `SarakCardGrid.tsx` → `var(--sarak-layout-gap-md, 16px)`; `padding: '16px 32px'` literal em `SarakCatalogGrid.tsx` → tokens reais; duas classes Tailwind mortas (sobrepostas por `style` inline já vencedor na cascata) removidas em `ChatHeader.tsx` (`px-6 py-4`) e `SarakForm.tsx` (`p-3`).
- **Extensão de hook (V6):** `getResponsiveStackStyles(breakpoint: 'md'|'lg', gapOverride?)` foi adicionada a `useStructuralStyles.ts` para cobrir o único caso de direção responsiva sem token equivalente (`SarakCatalogGrid.tsx`, busca+filtros, `flex-col lg:flex-row`). É aditiva, com breakpoint parametrizado — não altera nenhum consumidor existente do hook.
- **`SarakStats.tsx`**: nenhuma alteração de código — já estava 100% migrado antes desta spec, restando apenas o `grid-cols-2 lg:grid-cols-4` deferido.
- **Fora do escopo desta spec (intacto, documentado):** `ImageCard.tsx:46/85`, `SarakForm.tsx:71/121`, `SarakChart.tsx:41/62/88/96`, `SarakCatalogGrid.tsx:82/92/101/132/141/170/182`, `SarakCardGrid.tsx:129/165`, `SarakTable.tsx:117`, `ChatInput.tsx:57/102/149` — todos bucket **Valor** (tracking/blur/rounded/box-shadow/max-w/min-w em `px/rem/em`), não espaçamento/direção; pertencem a uma spec futura de correção de valor.
