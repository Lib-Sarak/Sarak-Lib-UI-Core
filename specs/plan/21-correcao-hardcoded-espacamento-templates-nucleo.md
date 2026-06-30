---
tipo: "spec"
titulo: "Correção de Hardcode — Estrutural em Templates (Núcleo)"
dominio: "Design Engine / Desengessamento (Sarak UI Core)"
status: "🔴 A Implementar"
prioridade: "Alta"
tags: ["spec", "hardcoded", "desengessamento", "templates", "correcao"]
relacionados: ["20-correcao-hardcoded-base", "07-agente-llm-design-e-expansao-estrutural"]
---

# 1. Contexto (Leitura Obrigatória)
> **Antes de qualquer linha de código, leia a [[20-correcao-hardcoded-base]]** — ela define as skills/specs de contexto, as regras de escrita no módulo, a metodologia (`code-adequacao`), o Protocolo de Auditoria (início/fim) e o Gate de Coerência (V1–V6) que esta spec obedece.

Esta é a **etapa 1** da campanha: o subconjunto **núcleo** dos Templates (`components/`, telas de Auth e Security Orchestrator), o maior foco de hardcode estrutural do módulo.

# 2. Escopo & Meta
**Meta:** zerar as **~142 violações duras** (espaçamento `p/m/gap`, direção `flex-col/row`, grid) dos arquivos abaixo, migrando-as para os Hooks Controladores / tokens. **Não** alterar baldes deduzidos (alinhamento, `w-full/h-full`, ícones).

| Arquivo | Duras (alvo) |
|---|---:|
| `Templates/components/RecursiveMatrixNode.tsx` | 41 |
| `Templates/components/SarakCoreCard.tsx` | 29 |
| `Templates/components/AuthForm.tsx` | 16 |
| `Templates/components/AuthFormFields.tsx` | 13 |
| `Templates/components/AuthHero.tsx` | 10 |
| `Templates/SarakSecurityOrchestrator.tsx` | 10 |
| `Templates/components/AuthSocialLogin.tsx` | 6 |
| `Templates/components/SecurityOrchestratorStatus.tsx` | 5 |
| `Templates/components/SecurityOrchestratorSetup.tsx` | 5 |
| `Templates/components/SecurityOrchestratorDisable.tsx` | 5 |
| `Templates/components/PremiumSwitch.tsx` | 1 |
| `Templates/components/ManagementGroupCard.tsx` | 1 |

# 3. Instruções Detalhadas
1. **Baseline (ANTES):** rode `node .agents/skills/ui-auditoria-modulo/scripts/auditor_hardcoded.mjs` e preencha o **Snapshot Inicial** (§5).
2. **Por arquivo (ciclo `code-adequacao`):**
   - **Caracterizar:** garantir snapshot de render do componente (estado atual).
   - **Migrar o hardcode duro** consumindo `useStructuralStyles()`:
     - `p-*`/`m-*`/`gap-*` → `style` do hook com `var(--sx-spacing-*)` (use `getContainerStyles`/`getFlexStyles`/`getFormGroupStyles` conforme o caso).
     - `flex-col`/`flex-row` → `getFlexStyles(direction)` / `getContainerStyles`.
     - grid → `getGridStyles`.
   - **Manter intacto** (deduzido, não mexer só por mexer): `flex`, `relative`/`absolute`, `z-*`, `items-*`/`justify-*`, `w-full`/`h-full`.
   - **Verificar verde:** testes + inspeção visual no Canvas (paridade pixel).
3. **Conferência (DEPOIS):** rode o auditor de novo e preencha o **Snapshot Final** (§6).

# 4. Checklist de Validação (Gate de Coerência — ver [[20-correcao-hardcoded-base]] §7)
- [ ] **V1** — Violações duras no escopo zeradas; total de duras do módulo **diminuiu** (nunca aumentou).
- [ ] **V2** — Nenhum balde deduzido aumentou (ícones / `w-full,h-full` / alinhamento) — anti-burla.
- [ ] **V3** — Valor `px/rem/em` não aumentou.
- [ ] **V4** — `run_audit.mjs`: os outros 6 auditores seguem verdes.
- [ ] **V5** — Comportamento preservado (snapshot/caracterização verdes + visual sem diferença).
- [ ] **V6** — Sem componente novo; token novo só via paridade 1:1:1:1:1.

# 5. Snapshot Inicial (preencher ANTES)
| Métrica | Valor |
|---|---:|
| Duras no escopo desta spec | _(esperado ~142)_ |
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
