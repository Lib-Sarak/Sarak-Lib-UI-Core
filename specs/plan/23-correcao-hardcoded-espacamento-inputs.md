---
tipo: "spec"
titulo: "Correção de Hardcode — Estrutural em Inputs"
dominio: "Design Engine / Desengessamento (Sarak UI Core)"
status: "🔴 A Implementar"
prioridade: "Alta"
tags: ["spec", "hardcoded", "desengessamento", "inputs", "correcao"]
relacionados: ["20-correcao-hardcoded-base", "07-agente-llm-design-e-expansao-estrutural"]
---

# 1. Contexto (Leitura Obrigatória)
> **Antes de qualquer linha de código, leia a [[20-correcao-hardcoded-base]]** — skills/specs de contexto, regras de escrita, metodologia, Protocolo de Auditoria e Gate de Coerência (V1–V6).

Etapa 3: a família de **Inputs** (campos, seleção, datas, upload).

> ## ⛔ DEPENDÊNCIA: Spec 30 (variáveis reais) primeiro
> **Proibido `--sx-*`** (namespace fantasma — não resolve em runtime). Migre para **variáveis reais da engine + fallback** conforme a tabela de mapeamento da [[30-erradicacao-variaveis-fantasma]] (ex.: `var(--sarak-layout-gap-md, 16px)`; `calc(var(--sarak-layout-gap-md,16px) * fator)` para passos sem token). Ao fim, rode `auditor_ghostvars.mjs` → **0 fantasmas**.

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
- [ ] **V1** — Duras do escopo zeradas; total do módulo diminuiu.
- [ ] **V2** — Nenhum balde deduzido aumentou.
- [ ] **V3** — Valor px/rem/em não aumentou.
- [ ] **V4** — `run_audit.mjs`: 6 auditores verdes.
- [ ] **V5** — Comportamento preservado (snapshot + visual).
- [ ] **V6** — Sem componente novo; token novo só com paridade 1:1:1:1:1.

# 5. Snapshot Inicial (preencher ANTES)
| Métrica | Valor |
|---|---:|
| Duras no escopo desta spec | _(esperado ~81)_ |
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
