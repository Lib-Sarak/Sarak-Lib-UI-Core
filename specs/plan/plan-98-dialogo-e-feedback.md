---
tipo: "plan"
titulo: "Diálogo e feedback: confirmação, modal com tamanhos, estado de página, progresso e toast com ação"
objetivo: "Dar a lib as pecas de dialogo e feedback que tres sistemas refizeram a mao: confirmacao imperativa, modal com tamanhos, estado de pagina com titulo e acao, barra de progresso e toast com titulo e acao"
dominio: "Sarak-Lib-UI-Core / Átomos / Diálogo e feedback"
status: "🔴 A executar"
prioridade: "Média"
tags: ["plan", "modal", "confirmacao", "toast", "progresso", "componentes"]
relacionados: ["[[03-superficie-publica]]", "[[10-seguranca-e-acessibilidade]]"]
depende_de: "plan-97-dados-tabela-estados-valor-e-metrica"
retida_por: ""
destino_sintese: "arquitetura/03-superficie-publica.md"
---

# 1. Objetivo

Um sistema confirma uma ação destrutiva, abre um modal largo, mostra "sem permissão" ou "não encontrado"
com título e botão, exibe progresso e avisa com um toast que tem título e ação — **com a lib**, sem
`window.confirm`, sem overlay à mão e sem `<p role="alert">` solto.

# 2. Contexto

**Critério do dono (2026-10-03):** só o que mais de um sistema precisou, sem vocabulário de domínio. Medido
em 2026-10-02:

| Necessidade | Quem refez à mão | O que a lib tem |
|---|---|---|
| Diálogo de confirmação (cancelar + ação `danger`) | `login-completo` (dois modais idênticos: `TabData.tsx:68-89`, `MembershipActions.tsx:34-54`); Cripto (~60 `window.confirm`/`alert`); Oss (`DataTable.jsx:110,116`) | `SarakModal` + `footer`; `useOverlay` só `{ kind, title, message }` (`src/components/atomic/Modals/SarakOverlayProvider.tsx:17-21`) |
| Modal com tamanhos | Cripto (61 overlays, de `max-w-md` a `max-w-7xl`) | `SarakModal` fixo em `max-w-lg` (`SarakModal.tsx:117`) |
| Estado de página com título, texto e ação (sem permissão, não encontrado, sessão indisponível) | `login-completo` (`Router.tsx:30-38`, `StateTerminal.tsx`, `UnavailableSession.tsx`); ERP (`Notice.tsx`) | `SarakEmptyState` só tem `type` decorativo (`SarakEmptyState.tsx:7-10`); `SarakDataEmpty` é uma linha |
| Barra de progresso / medidor linear com limiar de cor | Cripto (16 ocorrências); `login-completo` não tem; ERP não tem | nenhum componente (`grep Progress` só acha um token e i18n) |
| Toast com título e ação | Cripto (113 chamadas no padrão `toast.success/error`); `login-completo` só usa para tema | `useToast().notify({ message, variant, duration })` (`SarakToast.tsx:29-46`) |

A barra de progresso só tem um sistema hoje; entra porque é o indicador mais elementar de feedback e o Cripto
é o próximo a adotar — é a única exceção ao critério de dois sistemas, e fica registrada aqui.

# 3. Escopo

## 3.1 Dentro (o que pode ser tocado)

- `src/components/atomic/Modals/SarakOverlayProvider.tsx` e `useOverlay` — `confirm({ title, message,
  confirmLabel?, cancelLabel?, tone? }): Promise<boolean>`, com foco preso e ESC = cancelar.
- `src/components/atomic/Modals/SarakModal.tsx` — `size: 'sm' | 'md' | 'lg' | 'xl' | 'full'`, por token.
- `src/components/atomic/Feedback/SarakEmptyState.tsx` — `title`, `description`, `action` (ReactNode),
  `icon`; o `type` decorativo continua.
- `src/components/atomic/Feedback/SarakProgress.tsx` (novo) — `value`, `max`, `thresholds?`, `label?`,
  indeterminado; por token.
- `src/components/atomic/Feedback/SarakToast.tsx` e `useToast` — `title?`, `action?: { label, onClick }`.
- `src/core/Design/schema/*` — só tokens que o tamanho do modal e o progresso precisarem (paridade das três
  fontes).
- `src/core/i18n/**` — "Confirmar", "Cancelar" e o que faltar.
- `src/index.ts`; testes ao lado; `docs/component-catalog.*`, `sarak-ui/`, `sarak-dev/`, `dist/`,
  `src/core/Provider/generated/` regenerados.

## 3.2 Fora (o que NÃO pode ser tocado)

- Toast com `promise`/`loading`, posição configurável, wizard com estado por passo, seletor de cor, chips
  livres, controle segmentado, copiar para a área de transferência: um sistema só — esperam demanda.
- O cromo, o Provider de tema, os templates de dado.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/arquitetura/03-superficie-publica.md` | §4.3 (prefixo), §6 (taxonomia e composição atômica) |
| Spec fixa | `specs/specs/10-seguranca-e-acessibilidade.md` | §2.4 a) e b) — foco preso só em overlay aberto, teclado e ARIA |
| Spec fixa | `specs/arquitetura/04-contrato-de-tokens-e-paridade.md` | se nascer token |
| Spec fixa | `specs/specs/11-testes-e-cobertura.md` | §3 |
| Contexto | `specs/00-contexto.md` · `specs/00-knowledge.md` | sempre |
| **Skill** | `padrao-escrita` + `padrao-typescript` | sempre |
| **Skill** | `ui-novo-componente` | componente e token novos |
| **Skill** | `ui-arquitetura-design` | estilo por token |
| **Skill** | `test-unitario` | testes |
| Código | os arquivos de §3.1 | ler antes de editar |
| Código | `src/components/atomic/Modals/hooks/useFocusTrap.ts` | o foco preso que o modal já usa |

# 5. Instruções de execução

1. `useOverlay().confirm(...)` abre um `SarakModal` com os dois botões, devolve `Promise<boolean>`; ESC e
   fechar resolvem `false`; foco volta ao disparador. Teste.
2. `SarakModal` ganha `size`; o default é o de hoje. Teste por tamanho (classe/estilo computado por token).
3. `SarakEmptyState` ganha título, descrição, ação e ícone; sem eles, renderiza como hoje. Teste.
4. `SarakProgress`: determinado e indeterminado, `thresholds` colorindo por token de status, `aria-valuenow`.
   Teste.
5. `useToast().notify` aceita `title` e `action`; o toast com ação não fecha sozinho antes do tempo mínimo
   acessível. Teste.
6. `npm run build` · `guide` · `catalog` · `dev-kit` · `tsc` · `vitest` · `audit` → verdes.

# 6. Critérios de aceite

- [ ] `confirm()` resolve `true`/`false` conforme o botão, `false` no ESC, e devolve o foco (testes).
- [ ] `SarakModal` tem cinco tamanhos por token e o default não mudou (teste de snapshot do default).
- [ ] `SarakEmptyState` com título/descrição/ação renderiza os três; sem eles, igual ao de hoje (testes).
- [ ] `SarakProgress` existe, com ARIA e limiar por token (testes).
- [ ] Toast com título e ação (teste).
- [ ] Prefixo, barril, catálogo e paridade verdes; `npm run build`, `tsc`, `vitest` verdes; `audit` sem
      regressão.

# 7. Como verificar (uso do revisor)

**Gate:** `nenhum` — componentes; prova por teste de módulo.

- `git status` + `git diff --stat` → só §3.1.
- Rodar isolados os testes dos critérios; `npx vitest run`.
- `npm run build`; `npm run audit`.
- Leitura do diff do `SarakModal` → o default é o mesmo valor de antes.

# 8. Destino da síntese

**Destino:** `arquitetura/03-superficie-publica.md`

- §6 — as peças de diálogo e feedback e seus contratos: confirmação imperativa pelo overlay, tamanhos de
  modal, estado de página, progresso, toast com ação.

> A síntese é ato do **revisor** ([[00-prompt-revisor]]), e o gatilho é do **usuário**: o revisor propõe ao
> aprovar e espera autorização. Esta seção apenas a prepara.

---

# 9. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only: cada rodada acrescenta um bloco novo; nada é removido. -->

---

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->

---

# 11. Síntese

<!-- Preenchido pelo REVISOR na síntese (00-prompt-revisor.md §7.4), imediatamente antes da remoção da plan.
     Append-only. O que foi transportado, e o que ficou de fora. -->
