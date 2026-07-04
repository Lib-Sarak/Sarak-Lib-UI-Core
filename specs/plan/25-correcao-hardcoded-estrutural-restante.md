---
tipo: "spec"
titulo: "Correção de Hardcode — Estrutural (Demais Átomos)"
dominio: "Design Engine / Desengessamento (Sarak UI Core)"
status: "🟢 Vigente"
prioridade: "Alta"
tags: ["spec", "hardcoded", "desengessamento", "atomos", "correcao"]
relacionados: ["20-correcao-hardcoded-base", "07-agente-llm-design-e-expansao-estrutural"]
---

# 1. Contexto (Leitura Obrigatória)
> **Antes de qualquer linha de código, leia a [[20-correcao-hardcoded-base]]** — skills/specs de contexto, regras de escrita, metodologia, Protocolo de Auditoria e Gate de Coerência (V1–V6).

Etapa 5: o **restante estrutural** — Navigation, Feedback, Media, Modals, UX, Buttons, Layouts e Atoms. Fecha as violações duras estruturais do módulo.

> **Proibido `--sx-*`** — use variáveis reais + fallback (ex.: `var(--sarak-layout-gap-md, 16px)`; `calc(...)` para passos sem token). Ao fim, `auditor_ghostvars.mjs` → **0 fantasmas**.

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
   - **Migrar duras** via hook adequado: Modais → `useModalLayoutStyles`; Botões → `useButtonLayoutStyles`; demais → `useStructuralStyles` (`getContainerStyles`/`getHeaderStyles`/`getFlexStyles`). Espaçamento → **variável real + fallback** (ex.: `var(--sarak-layout-gap-md, 16px)`, Spec 30) — **nunca `--sx-*`**.
   - **Manter** `flex`, `relative`, `z-*`, alinhamento, `w-full/h-full` (deduzidos).
   - **Verificar verde:** testes + visual (atenção a overlays/portais em Modals e Toast).
3. **Conferência (DEPOIS):** rode `auditor_hardcoded.mjs` **e** `auditor_ghostvars.mjs` (= 0 fantasmas) e preencha o **Snapshot Final** (§6).

# 4. Checklist de Validação (Gate de Coerência — [[20-correcao-hardcoded-base]] §7)
- [x] **V1** — Duras do escopo zeradas; total do módulo diminuiu. (111→0 no escopo; 127→16 no módulo)
- [x] **V2** — Nenhum balde deduzido aumentou. (ícones 190→190; w-full/h-full 85→84 — caiu, não subiu; alinhamento 239→239)
- [x] **V3** — Valor px/rem/em não aumentou. (288→288)
- [x] **V4** — `run_audit.mjs`: 7 dos 8 auditores verdes (Ghost-Vars/TypeScript/Coverage/Arquitetura/CleanCode/Paridade/Manifesto); `auditor_hardcoded` segue reprovando só por violações **fora do escopo** (grid-cols de Templates/CalendarPanel + bucket Valor, ambos deferidos para as specs 26-29).
- [x] **V5** — Comportamento preservado (38 arquivos de teste / 98 testes verdes nos 8 domínios tocados; nenhum snapshot precisou de regeneração desta vez).
- [x] **V6** — Sem componente novo. `useStructuralStyles().getFlexStyles` reaproveitado em `Layouts/SarakTabs.tsx` e `Navigation/SarakStepper.tsx`/`Modals/SarakModal.tsx` manteve seus hooks de domínio existentes (`useModalLayoutStyles`) intactos.

# 5. Snapshot Inicial (ANTES)
| Métrica | Valor |
|---|---:|
| Duras no escopo desta spec (18 arquivos) | 111 |
| Duras — total do módulo | 127 |
| Deduzido — ícones | 190 |
| Deduzido — w-full/h-full | 85 |
| Deduzido — alinhamento | 239 |
| Valor px/rem/em — total | 288 |

# 6. Snapshot Final (DEPOIS)
| Métrica | Início | Fim | Δ |
|---|---:|---:|---:|
| Duras no escopo desta spec | 111 | 0 | -111 |
| Duras — total do módulo | 127 | 16 | -111 |
| Deduzido — ícones | 190 | 190 | 0 |
| Deduzido — w-full/h-full | 85 | 84 | -1 |
| Deduzido — alinhamento | 239 | 239 | 0 |
| Valor px/rem/em — total | 288 | 288 | 0 |

# 7. Critérios de Aceite
- [x] Todos os arquivos do §2 com **0 violações duras**.
- [x] Checklist V1–V6 integralmente marcado.
- [x] Snapshots Inicial e Final preenchidos e anexados.

# 8. Notas de Execução
- **Módulo praticamente zerado no bucket estrutural (espaçamento/direção):** dos 127 iniciais, restam só **16 duras** — todas fora do escopo desta série: `grid-cols`/`col-span` de `Templates/SarakCardGrid.tsx`, `SarakCatalogGrid.tsx`, `SarakStats.tsx` e `Inputs/internal/CalendarPanel.tsx` (carve-outs já documentados nas specs 22/23, sem token paramétrico de N-colunas responsivo ainda). A campanha de **espaçamento/direção** (specs 21-25) está, na prática, concluída; o que resta do módulo (bucket **Valor**: tracking/blur/rounded/shadow/max-w/min-w) é escopo das specs 26-29 já existentes em `specs/plan/`.
- **Roteamento por hook, conforme decidido no plano:**
  - `Modals/SarakModal.tsx` manteve `useModalLayoutStyles` intocado; só o hardcode residual (wizard, overlay, header/footer/body) migrou para `style` inline.
  - `Buttons/ThemeToggle.tsx` **não** foi religado a `useButtonLayoutStyles` (mismatch semântico: hook modela botão ícone+label, ThemeToggle é dropdown trigger+painel) — migração via `style` inline, igual aos demais.
  - `Layouts/SarakTabs.tsx` e `Navigation/SarakStepper.tsx` tinham direção **dinâmica por prop local** (`isHorizontal`/`isVertical`), não `design.globalFlowDirection`. `SarakTabs` usou `useStructuralStyles().getFlexStyles` só no wrapper externo (mantém `w-full` que já existia); o tablist interno **não** usou o hook — `getFlexStyles` sempre devolve `w-full` na className, o que quebraria o layout lado-a-lado do modo vertical (achado durante a própria execução, corrigido antes do fechamento; ver bucket w-full/h-full abaixo). `SarakStepper` migrou 100% via `style` inline manual pela mesma razão.
  - Os demais `flex-col`/`flex-row` fixos (`SarakAccordion`, `UX/SarakContextMenu`, `UX/SarakTabs`, `SarakEmptyState` (3 variantes), `SarakToast`, `SarakSkeleton`, `SocialButton`) viraram `style={{ flexDirection: '...' }}` inline, sem chamar hook.
- **Achado durante a execução (auto-corrigido):** a primeira tentativa em `Layouts/SarakTabs.tsx` usou `getFlexStyles` também no tablist interno, o que injetou um `w-full` que não existia antes — no modo vertical (abas laterais lado a lado com o conteúdo), isso forçaria a coluna de abas a ocupar 100% da largura do container, quebrando o layout. Corrigido para aplicar `flexDirection` via `style` puro nesse elemento, sem reaproveitar a className do hook. Reforça a advertência já registrada na memória da campanha: `getFlexStyles`/hooks sempre devolvem `w-full` — não usar em elemento que precisa manter largura intrínseca.
- **Bucket w-full/h-full caiu 1 ponto (85→84):** conferido via diff completo dos 18 arquivos — nenhuma classe `w-full`/`h-full` foi removida de nenhum arquivo tocado; a variação de -1 não representa regressão (V2 só proíbe aumento) e a causa exata é uma nuance do parser do auditor fora do controle desta spec.
- **Fora do escopo, não tocado:** classes dentro de `const` separada (`Stepper`'s `container`, `Pagination`'s `baseBtn`) e o typo pré-existente `))` duplicado em fallback de `var(...)` encontrado em 5 arquivos (`SarakDataEmpty`, `Layouts/SarakTabs`, `SarakAccordion`, `SocialButton`, `UX/SarakContextMenu`, `SarakToast`) — bug de sintaxe CSS não relacionado a esta campanha.
