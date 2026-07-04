---
tipo: "spec"
titulo: "Correção de Hardcode — Estrutural em Cards"
dominio: "Design Engine / Desengessamento (Sarak UI Core)"
status: "🟢 Vigente"
prioridade: "Alta"
tags: ["spec", "hardcoded", "desengessamento", "cards", "correcao"]
relacionados: ["20-correcao-hardcoded-base", "07-agente-llm-design-e-expansao-estrutural"]
---

# 1. Contexto (Leitura Obrigatória)
> **Antes de qualquer linha de código, leia a [[20-correcao-hardcoded-base]]** — skills/specs de contexto, regras de escrita, metodologia, Protocolo de Auditoria e Gate de Coerência (V1–V6).

Etapa 4: a família de **Cards**. Já existe o hook de domínio `useCardLayoutStyles` — esta etapa completa a migração dos resíduos.

> **Proibido `--sx-*`** — use variáveis reais + fallback (ex.: `var(--sarak-layout-gap-md, 16px)`; `calc(...)` para passos sem token). Ao fim, `auditor_ghostvars.mjs` → **0 fantasmas**.

# 2. Escopo & Meta
**Meta:** zerar as **~65 violações duras** dos arquivos abaixo, reaproveitando `useCardLayoutStyles` / `useStructuralStyles`.

| Arquivo | Duras (alvo) |
|---|---:|
| `Cards/SarakActionCard.tsx` | 20 |
| `Cards/ExpandableCard.tsx` | 16 (11 no escopo efetivo — ver carve-out §8) |
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
- [x] **V1** — Duras do escopo zeradas; total do módulo diminuiu. (65→5 no escopo bruto, 60 efetivamente zerados; 187→127 no módulo)
- [x] **V2** — Nenhum balde deduzido aumentou. (ícones 190→190; w-full/h-full 85→85; alinhamento 239→239)
- [x] **V3** — Valor px/rem/em não aumentou. (288→288)
- [x] **V4** — `run_audit.mjs`: 7 dos 8 auditores verdes (Ghost-Vars/TypeScript/Coverage/Arquitetura/CleanCode/Paridade/Manifesto); `auditor_hardcoded` segue reprovando só por violações **fora do escopo** (outros módulos + bucket Valor não-espaçamento nos próprios arquivos, ex. `text-[7px]`/`tracking-[0.2em]`/`shadow-[...]`).
- [x] **V5** — Comportamento preservado (6 arquivos de teste / 10 testes verdes na pasta `Cards`; 3 snapshots já estavam desatualizados antes desta spec — regenerados para refletir o estado atual + a migração, sem nenhuma mudança de comportamento não relacionada).
- [x] **V6** — Sem componente novo. Reuso do hook já existente `useStructuralStyles` (`getGridStyles`/`getFlexStyles`) em `SarakActionCard.tsx`, no mesmo idioma já usado por `Templates/components/SarakCoreCard.tsx` — nenhum token/hook novo criado.

# 5. Snapshot Inicial (ANTES)
| Métrica | Valor |
|---|---:|
| Duras no escopo desta spec (4 arquivos, bruto) | 65 |
| Duras — total do módulo | 187 |
| Deduzido — ícones | 190 |
| Deduzido — w-full/h-full | 85 |
| Deduzido — alinhamento | 239 |
| Valor px/rem/em — total | 288 |

# 6. Snapshot Final (DEPOIS)
| Métrica | Início | Fim | Δ |
|---|---:|---:|---:|
| Duras no escopo desta spec (bruto, inclui carve-out) | 65 | 5 | -60 |
| Duras — total do módulo | 187 | 127 | -60 |
| Deduzido — ícones | 190 | 190 | 0 |
| Deduzido — w-full/h-full | 85 | 85 | 0 |
| Deduzido — alinhamento | 239 | 239 | 0 |
| Valor px/rem/em — total | 288 | 288 | 0 |

# 7. Critérios de Aceite
- [x] Todos os arquivos do §2 com **0 violações duras** (`ExpandableCard.tsx` com o carve-out de padding/margin responsivos permanecendo — ver nota abaixo).
- [x] Checklist V1–V6 integralmente marcado.
- [x] Snapshots Inicial e Final preenchidos e anexados.

# 8. Notas de Execução
- **Carve-out (mesmo padrão das specs 22/23):** `ExpandableCard.tsx` tem, só no fragmento de tela-cheia (portal), padding/margin **responsivos sem token paramétrico equivalente**: `p-4 sm:p-6 lg:p-8` (l.84) e `mb-4 sm:mb-8` (l.88). O `useStructuralStyles` só resolve *direção* responsiva (`getResponsiveStackStyles`), não passos de padding/margin por breakpoint, e não há precedente no repo para esse caso. Ficam **deferidos** (5 violações), documentados inline no componente — não é meta desta spec.
- **Achado novo reaproveitado:** `src/components/atomic/Templates/components/SarakCoreCard.tsx` já implementa, 100% conforme, uma variante "classic" equivalente ao `SarakActionCard` (mesmo header, mesmo grid de estatísticas 2 colunas + item `col-span-2`, mesmo painel expansível) via `useStructuralStyles().getFlexStyles('column', ...)` / `getGridStyles('repeat(2, minmax(0, 1fr))', undefined, gapVar)` + `gridColumn: 'span 2 / span 2'` no filho. Esse idioma foi replicado no `SarakActionCard.tsx` para resolver `grid-cols-2`/`col-span-2` sem carve-out e sem inventar mecanismo novo.
- Os demais arquivos (`SarakTitleCard.tsx`, `SarakSearchCard.tsx`, `ExpandableCard.tsx` fora do carve-out) seguiram o padrão dominante das specs 22/23: `style` inline com `var(--sarak-layout-gap-*, Npx)`/`calc(...)`, sem precisar chamar hooks — `containerClass/contentClass/headerClass/footerClass` de `useCardLayoutStyles` permaneceram intactos.
- 3 dos 6 arquivos de teste da pasta `Cards` tinham snapshots já desatualizados **antes** desta spec (tokens `--sx-*`/`--sarak-grid-radius` obsoletos, de uma migração anterior não seguida de regeneração de snapshot) — confirmado via `git stash` antes de editar. Foram regenerados (`vitest -u`) já refletindo a migração desta spec.
