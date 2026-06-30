---
tipo: "spec"
titulo: "Correção de Hardcode — Estrutural (Demais Átomos)"
dominio: "Design Engine / Desengessamento (Sarak UI Core)"
status: "🔴 A Implementar"
prioridade: "Alta"
tags: ["spec", "hardcoded", "desengessamento", "atomos", "correcao"]
relacionados: ["20-correcao-hardcoded-base", "07-agente-llm-design-e-expansao-estrutural"]
---

# 1. Contexto (Leitura Obrigatória)
> **Antes de qualquer linha de código, leia a [[20-correcao-hardcoded-base]]** — skills/specs de contexto, regras de escrita, metodologia, Protocolo de Auditoria e Gate de Coerência (V1–V6).

Etapa 5: o **restante estrutural** — Navigation, Feedback, Media, Modals, UX, Buttons, Layouts e Atoms. Fecha as violações duras estruturais do módulo.

# 2. Escopo & Meta
**Meta:** zerar as **~111 violações duras** dos arquivos abaixo. Use os hooks de domínio onde existirem (`useModalLayoutStyles`, `useTableLayoutStyles`, `useButtonLayoutStyles`).

| Arquivo | Duras (alvo) |
|---|---:|
| `Media/SarakMarkdownRenderer/SarakMarkdownRendererImpl.tsx` | 18 |
| `Modals/SarakModal.tsx` | 13 |
| `Buttons/ThemeToggle.tsx` | 11 |
| `Navigation/SarakSpotlight.tsx` | 9 |
| `Navigation/SarakStepper.tsx` | 8 |
| `UX/SarakTabs.tsx` | 8 |
| `Layouts/SarakTabs.tsx` | 7 |
| `Feedback/SarakEmptyState.tsx` | 11 |
| `Feedback/SarakToast.tsx` | 5 |
| `Atoms/SocialButton.tsx` | 5 |
| `Navigation/SarakBreadcrumbs.tsx` | 3 |
| `Layouts/SarakAccordion.tsx` | 3 |
| `Modals/SarakOverlayProvider.tsx` | 2 |
| `UX/SarakTooltip.tsx` | 2 |
| `UX/SarakContextMenu.tsx` | 2 |
| `Feedback/SarakSkeleton.tsx` | 2 |
| `Navigation/SarakPagination.tsx` | 1 |
| `Feedback/SarakDataEmpty.tsx` | 1 |

# 3. Instruções Detalhadas
1. **Baseline (ANTES):** rode `auditor_hardcoded.mjs` e preencha o **Snapshot Inicial** (§5).
2. **Por arquivo (ciclo `code-adequacao`):**
   - **Caracterizar** o render atual.
   - **Migrar duras** via hook adequado: Modais → `useModalLayoutStyles`; Botões → `useButtonLayoutStyles`; demais → `useStructuralStyles` (`getContainerStyles`/`getHeaderStyles`/`getFlexStyles`). Espaçamento → `var(--sx-spacing-*)`.
   - **Manter** `flex`, `relative`, `z-*`, alinhamento, `w-full/h-full` (deduzidos).
   - **Verificar verde:** testes + visual (atenção a overlays/portais em Modals e Toast).
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
| Duras no escopo desta spec | _(esperado ~111)_ |
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
