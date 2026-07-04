---
tipo: "spec"
titulo: "Correção de Hardcode — Estrutural em Inputs"
dominio: "Design Engine / Desengessamento (Sarak UI Core)"
status: "🟢 Vigente"
prioridade: "Alta"
tags: ["spec", "hardcoded", "desengessamento", "inputs", "correcao"]
relacionados: ["20-correcao-hardcoded-base", "07-agente-llm-design-e-expansao-estrutural"]
---

# 1. Contexto (Leitura Obrigatória)
> **Antes de qualquer linha de código, leia a [[20-correcao-hardcoded-base]]** — skills/specs de contexto, regras de escrita, metodologia, Protocolo de Auditoria e Gate de Coerência (V1–V6).

Etapa 3: a família de **Inputs** (campos, seleção, datas, upload).

> **Proibido `--sx-*`** — use variáveis reais + fallback (ex.: `var(--sarak-layout-gap-md, 16px)`; `calc(...)` para passos sem token). Ao fim, `auditor_ghostvars.mjs` → **0 fantasmas**.

# 2. Escopo & Meta
**Meta:** zerar as **~81 violações duras** dos arquivos abaixo. Inputs têm hooks específicos no `useStructuralStyles` — priorize-os.

| Arquivo | Duras (alvo) |
|---|---:|
| `Inputs/SarakSearch.tsx` | 26 |
| `Inputs/Controls.tsx` | 22 |
| `Inputs/SarakMultiSelect.tsx` | 9 |
| `Inputs/internal/CalendarPanel.tsx` | 5 |
| `Inputs/SarakUploader.tsx` | 5 |
| `Inputs/SarakDatePicker.tsx` | 5 |
| `Inputs/SarakTimePicker.tsx` | 2 |
| `Inputs/SarakSelect.tsx` | 2 |
| `Inputs/SarakInput.tsx` | 2 |
| `Inputs/SarakTextarea.tsx` | 1 |
| `Inputs/SarakRichText.tsx` | 1 |
| `Inputs/SarakRangeSlider.tsx` | 1 |

# 3. Instruções Detalhadas
1. **Baseline (ANTES):** rode `auditor_hardcoded.mjs` e preencha o **Snapshot Inicial** (§5).
2. **Por arquivo (ciclo `code-adequacao`):**
   - **Caracterizar** o render atual.
   - **Migrar duras** via `useStructuralStyles()` usando os helpers de input: `getFormGroupStyles` (label/densidade), `getInputIconStyles` (posição de ícone), `getSwitchLayoutStyles` (toggles/checkbox). Espaçamento → **variável real + fallback** (ex.: `var(--sarak-layout-gap-sm, 8px)`, Spec 30) — **nunca `--sx-*`**.
   - **Manter** `flex`, `relative`, `z-*`, alinhamento, `w-full/h-full` (deduzidos).
   - **Verificar verde:** testes + visual (foco em foco/hover/estado de erro dos inputs).
3. **Conferência (DEPOIS):** rode `auditor_hardcoded.mjs` **e** `auditor_ghostvars.mjs` (= 0 fantasmas) e preencha o **Snapshot Final** (§6).

# 4. Checklist de Validação (Gate de Coerência — [[20-correcao-hardcoded-base]] §7)
- [x] **V1** — Duras do escopo zeradas; total do módulo diminuiu. (79→0 no escopo; 266→187 no módulo)
- [x] **V2** — Nenhum balde deduzido aumentou. (ícones 190→190; w-full/h-full 85→85; alinhamento 239→239)
- [x] **V3** — Valor px/rem/em não aumentou. (288→288)
- [x] **V4** — `run_audit.mjs`: 7 dos 8 auditores verdes (Ghost-Vars/TypeScript/Coverage/Arquitetura/CleanCode/Paridade/Manifesto); `auditor_hardcoded` segue reprovando só por violações **fora do escopo** (outros módulos + bucket Valor não-espaçamento nos próprios arquivos, ex. `text-[10px]`/`tracking-[…]`/`backdrop-blur-[8px]`).
- [x] **V5** — Comportamento preservado (34 arquivos de teste / 57 testes verdes por pasta — Inputs, Inputs/internal, hooks, Templates/components, Layouts; nenhum assert de className/style rompido).
- [x] **V6** — Sem componente novo, nenhuma alteração de hook necessária desta vez (diferente da spec 22, não surgiu nenhum caso de direção responsiva sem token).

# 5. Snapshot Inicial (ANTES)
| Métrica | Valor |
|---|---:|
| Duras no escopo desta spec (12 arquivos, exclui `grid-cols-7`) | 79 |
| Duras — total do módulo | 266 |
| Deduzido — ícones | 190 |
| Deduzido — w-full/h-full | 85 |
| Deduzido — alinhamento | 239 |
| Valor px/rem/em — total | 288 |

# 6. Snapshot Final (DEPOIS)
| Métrica | Início | Fim | Δ |
|---|---:|---:|---:|
| Duras no escopo desta spec (exclui `grid-cols-7`) | 79 | 0 | -79 |
| Duras — total do módulo | 266 | 187 | -79 |
| Deduzido — ícones | 190 | 190 | 0 |
| Deduzido — w-full/h-full | 85 | 85 | 0 |
| Deduzido — alinhamento | 239 | 239 | 0 |
| Valor px/rem/em — total | 288 | 288 | 0 |

# 7. Critérios de Aceite
- [x] Todos os arquivos do §2 com **0 violações duras** de espaçamento/direção (`grid-cols-7` de `CalendarPanel.tsx` permanece deferido — ver nota abaixo).
- [x] Checklist V1–V6 integralmente marcado.
- [x] Snapshots Inicial e Final preenchidos e anexados.

# 8. Notas de Execução
- **Carve-out (novo, mesmo padrão da spec 22):** `internal/CalendarPanel.tsx` tem `grid-cols-7` (grade de dias da semana) em 2 pontos, sem token paramétrico equivalente (`getGridStyles` só cobre col-12/auto-fit/masonry). Não há precedente de grid-7-colunas resolvido no repo (outro `grid-cols-7` em `src/features/DesignEngine/Library/ThemeEditor.tsx` também está cru). Fica **deferido** — não é meta desta spec.
- **Achado sobre o auditor:** confirmado que `auditor_hardcoded.mjs` (AST) não flagra classes Tailwind definidas em `const` string separada e interpoladas via template literal no `className` (ex.: `shapeClasses`/`SELECT`/`FIELD`/`paddingLeftClass` em `SarakInput`/`SarakSelect`/`SarakTextarea`/`SarakTimePicker`/`SarakMultiSelect`) — só classes literais escritas diretamente no atributo JSX. Essas constantes de variante visual **não entraram no escopo/gate** desta spec (ficariam fora do V1); mexer nelas seria um refactor maior e mais arriscado, compartilhado entre variantes de estilo do input, e não é medido pelo auditor.
- Nenhum arquivo precisou de novo import de `useStructuralStyles` além do que já existia (`SarakInput.tsx`, que já usa `getInputIconStyles`) — toda a migração seguiu o padrão dominante validado na spec 22 (inline `style` com `var(--sarak-layout-gap-*, Npx)`/`calc(...)`, sem chamar o hook).
