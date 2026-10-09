---
tipo: "plan"
titulo: "Diálogo e feedback: confirmação, modal com tamanhos, estado de página, progresso e toast com ação"
objetivo: "Dar a lib as pecas de dialogo e feedback que tres sistemas refizeram a mao: confirmacao imperativa, modal com tamanhos, estado de pagina com titulo e acao, barra de progresso e toast com titulo e acao"
dominio: "Sarak-Lib-UI-Core / Átomos / Diálogo e feedback"
status: "🟢 Aprovada"
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

## Resumo da execução — 2026-10-08

**Resultado:** Concluído com pendências

**Estado do worktree ao iniciar**

```text
 M specs/00-indice.md
 M specs/plan/plan-101-motor-de-graficos-completo.md
 M src/components/engines/charts/SarakChartEngine.tsx
 M src/components/engines/charts/SubEngines/builders/advancedCharts.ts
 M src/components/engines/charts/SubEngines/builders/basicCharts.ts
 M src/components/engines/charts/SubEngines/builders/statisticalCharts.ts
 M src/components/engines/charts/SubEngines/builders/types.ts
 M src/components/engines/charts/SubEngines/useEChartsTheme.ts
 M src/core/i18n/catalogEntries.part3.ts
 M src/features/DesignEngine/Canvas/PreviewCanvas.tsx
 M src/features/DesignEngine/Canvas/components/LiveDraftPreviewFrame.tsx
 M src/features/DesignEngine/Canvas/components/PresetsCatalog.tsx
 M src/features/DesignEngine/Canvas/components/PreviewToolbar.tsx
 M src/features/DesignEngine/Canvas/components/__tests__/PreviewToolbar.test.tsx
 M src/features/DesignEngine/Canvas/hooks/useDeviceStyles.ts
 M src/features/DesignEngine/Canvas/hooks/usePreviewApps.tsx
 M src/features/DesignEngine/Main/hooks/usePreviewUIState.ts
?? src/components/engines/charts/SubEngines/axisOptions.ts
?? src/features/DesignEngine/Canvas/Mocks/MoreScreensMock.tsx
?? src/features/DesignEngine/Canvas/previewScreens.ts
```

**O que foi feito**
- `SarakOverlayProvider.tsx:32` — implementei `confirm()` assíncrono; confirma resolve `true`, cancelamento, fechamento, Escape, substituição do overlay e desmontagem resolvem `false`, com restauração de foco.
- `SarakModal.tsx:13` — adicionei os cinco tamanhos com largura por token, mantive `lg` como padrão e dei nome acessível ao diálogo com título ou rótulo traduzido.
- `SarakEmptyState.tsx:11` — adicionei título, descrição, ícone e ação em modo semântico, preservando o modo decorativo legado quando as propriedades não são passadas.
- `SarakProgress.tsx:79` — criei progresso determinado/indeterminado, ARIA, rótulo traduzido e limiares coloridos por tokens de status.
- `SarakToast.tsx:10` — adicionei título e ação; toast com ação respeita duração mínima acessível e continua persistente quando a duração é zero ou negativa.
- `overlays.ts:115` e `status.ts:83` — adicionei tokens de largura do modal e geometria do progresso; alinhei schema, mapping e partições do catálogo.
- `catalogEntries.part4.ts:91` — incluí os textos de diálogo e progresso nos seis idiomas, usando os prefixos autorizados.
- `src/index.ts:162` e `Feedback/index.ts` — exportei o novo componente e seus tipos.
- Os testes dos cinco componentes cobrem confirmação/foco, tamanhos, compatibilidade do estado vazio, ARIA/limiares e ação/duração do toast.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/components/atomic/Modals/SarakModal.tsx` | alterado | Tamanhos, largura por token e nome acessível. |
| `src/components/atomic/Modals/SarakOverlayProvider.tsx` | alterado | Confirmação imperativa com resolução consistente e foco restaurado. |
| `src/components/atomic/Modals/__tests__/SarakModal.test.tsx` | alterado | Testes dos cinco tamanhos e do padrão. |
| `src/components/atomic/Modals/__tests__/SarakOverlayProvider.test.tsx` | alterado | Testes de confirmação, cancelamento, Escape e foco. |
| `src/components/atomic/Feedback/SarakEmptyState.tsx` | alterado | Conteúdo semântico opcional com preservação do modo legado. |
| `src/components/atomic/Feedback/SarakProgress.tsx` | criado | Progresso determinado/indeterminado com ARIA e limiares por token. |
| `src/components/atomic/Feedback/SarakToast.tsx` | alterado | Título, ação e duração mínima acessível. |
| `src/components/atomic/Feedback/index.ts` | alterado | Exportações do SarakProgress e tipos. |
| `src/components/atomic/Feedback/__tests__/SarakEmptyState.test.tsx` | alterado | Cobertura do conteúdo personalizado e do modo legado. |
| `src/components/atomic/Feedback/__tests__/SarakProgress.test.tsx` | criado | Cobertura de valores, ARIA, rótulo e limiares. |
| `src/components/atomic/Feedback/__tests__/SarakToast.test.tsx` | alterado | Cobertura de ação, duração mínima e no-op fora do Provider. |
| `src/core/Design/schema/overlays.ts` | alterado | Cinco tokens de largura do modal. |
| `src/core/Design/schema/status.ts` | alterado | Tokens de altura e raio do progresso. |
| `src/core/Design/catalog/theme_table_mapping.json` | alterado | Mapeamento dos tokens novos. |
| `src/core/Design/catalog/partitions/components_base.json` | alterado | Partição dos tokens de modal. |
| `src/core/Design/catalog/partitions/colors_and_atmosphere.json` | alterado | Partição dos tokens de progresso. |
| `src/core/i18n/catalogEntries.part4.ts` | alterado | Rótulos de diálogo/progresso nos seis idiomas. |
| `src/index.ts` | alterado | Exportações públicas do SarakProgress. |
| `src/core/Provider/generated/design-token-ids.ts` | gerado | IDs tipados atualizados para 437 tokens. |
| `docs/component-catalog.json`, `docs/component-catalog.md` | gerados | Catálogo regenerado pelo comando oficial. |
| `sarak-ui/GUIA-FRONTEND.md`, `sarak-ui/START-HERE.md`, `sarak-ui/VERSION`, `sarak-ui/catalog.json` | gerados | Kit do consumidor regenerado pelo comando oficial. |
| `sarak-dev/GUIA-MANUTENCAO.md`, `sarak-dev/START-HERE.md`, `sarak-dev/state.json` | gerados | Kit do mantenedor regenerado pelo comando oficial. |
| `src/buildInfo.ts`, `src/core/Provider/buildInfo.ts` | gerados | Metadados atualizados pelo pipeline oficial de build. |
| `dist/*` | gerado | Bundles JS, declarações, CSS e metadados regenerados por etapas oficiais; a saída inclui o estado corrente das plans paralelas. |
| `specs/plan/plan-98-dialogo-e-feedback.md` | alterado | Status movido para revisão e este resumo acrescentado. |

**Verificações executadas**
- Suíte focada de `Modals/` e `Feedback/` → 5 arquivos, 27 testes aprovados.
- `npx vitest run --maxWorkers=1 --no-file-parallelism --reporter=dot --silent=true` → 402 arquivos aprovados, 4 reprovados; 2.336 testes aprovados, 4 reprovados; 2 snapshots reprovados. Dois testes de symlink falharam com `EPERM` no Windows; os outros dois são snapshots de `DesignEngine/` da plan 100.
- `npx tsc --noEmit` → aprovado.
- Validador AST `padrao-typescript` nos 15 arquivos TS/TSX alterados → `TOTAL: 0` violações.
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` → baseline de 2026-08-11, sem regressões.
- Lista completa de gates de `.githooks/pre-commit` → aprovada enquanto o status da plan e o índice estavam ambos em `🟡 Em execução`; inclui agente, segredos, plan×índice, dev-kit, barrel, catálogo, zero-brand, guia, deep-import, limites, container queries, persistência, class-merge, ícones, cromo, trail, token-types e audit+tsc.
- `npm run token-types`, `npm run catalog`, `npm run guide`, `npm run dev-kit` e seus checks → aprovados; catálogo com 98 componentes, guia com 101 componentes e 437 tokens.
- `npm run build` → interrompido em `public-types:check`: `ChartType` aparece em `dist/index.d.ts` por causa da alteração paralela em charts, mas não é exportado pelo barril raiz. O check direto no estado final reproduz a falha. `prefix:check` passa com 341 nomes.
- `npm run build:js`, `npm run build:css`, `npm run build:css:scoped`, `copy-base-css`, `inject-css` e `generate-build-info` → etapas oficiais concluídas; a CLI Tailwind foi baixada temporariamente após aprovação do sandbox, sem alterar dependências do projeto.
- O contador CIM solicitado retornou erro de acesso no sandbox; a contagem alternativa de processos `node` foi zero antes das suítes/builds.

**Critérios de aceite**
- [x] Confirmação retorna `true`/`false`, Escape cancela e o foco retorna ao disparador — testes do `SarakOverlayProvider`.
- [x] Cinco tamanhos por token e padrão mantido — testes do `SarakModal`.
- [x] Estado vazio personalizado e modo legado — testes do `SarakEmptyState`.
- [x] Progresso com ARIA e limiar por token — testes do `SarakProgress`.
- [x] Toast com título/ação e duração mínima — testes do `SarakToast`.
- [ ] Suíte completa e `npm run build` verdes — quatro testes falharam por `EPERM`/snapshots fora do escopo; o build para no contrato de `ChartType` criado pela plan 101.
- [ ] Paridade pública completa — barrel, prefixo e catálogo passam; `public-types:check` falha pelo `ChartType` da plan 101.

**Decisões e suposições**
- O usuário autorizou incluir `theme_table_mapping.json` e `catalog/partitions/` para manter paridade dos novos tokens.
- O padrão de `SarakModal` continua `lg`; com Provider usa o token, sem Provider usa a classe Tailwind estática equivalente.
- Os artefatos gerados foram atualizados somente pelos comandos do repositório. Mudanças das plans 100/101 foram preservadas.

**Achados fora do escopo (não corrigidos)**
- `src/features/DesignEngine/Canvas/__tests__/PreviewCanvas.test.tsx` e `src/features/DesignEngine/Canvas/components/__tests__/PresetCard.test.tsx` — snapshots incompatíveis com as alterações da plan 100; não atualizei snapshots fora do §3.1.
- `bin/scaffold/__tests__/runUpdate.test.mjs` e `bin/scaffold/checkUpdate/__tests__/localDependency.test.mjs` — criação de symlink/junction negada com `EPERM` pelo Windows/sandbox.
- `src/components/engines/charts/SubEngines/builders/types.ts` — `ChartType` exposto pela assinatura de charts sem export correspondente no barril e sem prefixo Sarak; a correção pertence à plan 101.

**Pendências / riscos**
- A plan 101 precisa resolver a superfície/nome de `ChartType` para liberar `public-types:check` e o build integral.
- A plan 100 precisa revisar os dois snapshots; os testes de symlink precisam de ambiente com criação de junctions permitida.
- O índice continua sob responsabilidade do revisor: a linha da plan 98 está `🟡 Em execução`; após este status `🟠 Em revisão`, o gate plan×índice precisa ser sincronizado pelo revisor.
- O scanner de segredos terminou sem achados (`bloqueado: false`), embora o launcher Python tenha avisado que não encontrou `C:\Python314\python.exe`.

---

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->

## Veredito — 2026-10-08 — 🔴 Reprovado

**Rodado pelo revisor**, na árvore integrada (98 + 100 lote 2 + 101 lote 1), com 0 processos de outras execuções:
`npx vitest run` → 406 arquivos, 2338/2340 (as duas falhas estão no achado 2); os testes de symlink passam aqui
(o `EPERM` era o sandbox do executor); passos do build um a um verdes, inclusive `public-types:check` depois da
correção de tipo da plan-101; `check-audit-baseline --with-tsc` igual ao baseline. **Mutação em cópia:** trocar a
largura `sm` pela `lg` no modal e zerar `ACTION_TOAST_MINIMUM_DURATION_MS` derrubam 1 teste cada.

**O que está certo:** `confirm()` resolve `false` ao fechar, trocar de overlay e desmontar, com `tone: 'danger'`;
cinco tamanhos por token com `lg` (32rem) de padrão; `SarakEmptyState` com `title`/`description`/`action`/`icon`
documentados e o modo decorativo preservado; `SarakProgress` com `role="progressbar"` e limiares por token de status;
toast com título, ação e duração mínima; textos só no `catalogEntries.part4.ts`.

**Achados**

1. **A 98 apagou documentação pública, e o catálogo publicado perdeu as descrições.** `SarakModal`: os JSDoc de
   `steps`, `onComplete`, `disableOverlayClick`, `hideCloseButton` e `className` sumiram (o
   `docs/component-catalog.md` gerado mostra as cinco células vazias). `SarakToast.tsx`: 34 linhas de comentário
   removidas, entre elas o cabeçalho e o JSDoc de `message`/`variant`/`duration` e do controller.
   `SarakOverlayProvider.tsx`: o cabeçalho (Spec 13 ↔ 25, o casamento estrutural com o Dispatcher) saiu. E o que
   nasceu veio sem descrição: as props de `SarakProgress`, `SarakToastAction`, `title`/`action` do toast,
   `SarakConfirmOptions` e `confirm()` do controller. **Restaure** o que foi apagado (texto do HEAD, ajustado ao
   comportamento novo) e **documente** o que nasceu — prop pública sem JSDoc é célula vazia no catálogo.
2. **Os dois snapshots vermelhos são desta plan, não da 100.** Medido em cópia HEAD + só os arquivos da 100: o
   `PresetCard` passa; com os arquivos da 98 por cima, falha — são os tokens novos (`modalWidth*`,
   `progressBar*`) nas variáveis embutidas. Atualize o `PresetCard.test.tsx.snap` **de propósito**, gerado numa cópia
   fora do repositório com HEAD + **só** os arquivos da 98 (junção de `node_modules`), e copie de volta só o `.snap`,
   com o diff lido (só variáveis novas). O `PreviewCanvas` também muda com os seus tokens, mas o lote 2 da 100 o
   reescreve: **não o toque** — quem commitar por último regenera esse caso contra o HEAD de então.
3. **Sobra no repositório:** `.vitest-temp-plan98-363bdfa5b2da4412861874539043036f/` (não rastreado, na raiz).
   Remova; diretório temporário de teste mora fora do repositório.

**Aceito, sem achado:** `theme_table_mapping.json` e as partições do catálogo tocadas para fechar a paridade dos
tokens novos (são as três fontes que o §3.1 manda manter).

Status: `🔵 Em correção`.

## Resumo da execução (correção 1) — 2026-10-08

1. **Documentação pública:** JSDoc restaurado em `SarakModal` e `SarakToast`, adaptado aos comportamentos de
   wizard e ação/duração mínima; cabeçalho do `SarakOverlayProvider` recomposto com o contrato de confirmação.
   As props de `SarakProgress`, `SarakToastAction`, título/ação do toast, `SarakConfirmOptions` e os métodos do
   controller receberam descrição. `npm run catalog` concluiu; em `docs/component-catalog.md`, as células de
   `SarakModalProps` (linhas 880–890) e `SarakProgressProps` (957–962) estão preenchidas.
2. **Snapshot de `PresetCard`:** gerado em cópia de `git archive HEAD` com 13 arquivos-fonte da 98 por cima;
   `npx vitest run src/features/DesignEngine/Canvas/components/__tests__/PresetCard.test.tsx -u` passou (1 arquivo,
   2 testes). O diff adiciona somente sete variáveis: `--sarak-modal-width-{sm,md,lg,xl,full}` e
   `--sarak-progress-bar-{height,radius}`; não remove nem altera valores existentes. O snapshot de `PreviewCanvas`
   não foi copiado nem editado. Junction removida com `cmd /c rmdir` antes da pasta temporária.
3. **Temporário:** `.vitest-temp-plan98-363bdfa5b2da4412861874539043036f/` já estava ausente e continua ausente.

**Gates pedidos:** o Vitest de `Modals/` e `Feedback/` passou em modo serial (17 arquivos, 76 testes); a primeira
tentativa falhou apenas ao inicializar o temporário padrão do Windows (`EPERM`) e a pasta temporária isolada foi
removida. `npx tsc --noEmit` e `check-audit-baseline.mjs --with-tsc` reportaram os mesmos dois erros de tipo em
`src/components/engines/charts/SubEngines/seriesModel.ts` (`title` e `showAnimation` ausentes de
`ChartBuilderConfig`), na área paralela da plan-101. `npm run catalog:check` reportou os arquivos de catálogo
defasados em relação ao código depois da geração; não regenerei novamente durante as alterações paralelas.

## Veredito — 2026-10-08 (correção 1) — 🟢 Aprovado

**Rodado pelo revisor**, com 0 processos de outras execuções: `npx vitest run` de `Modals/`, `Feedback/` e
`PresetCard.test.tsx` → **18 arquivos, 78 testes verdes**; `npx tsc --noEmit` → 0 (os dois erros relatados em
`seriesModel.ts` eram do lote 2 da plan-101 em curso e já não existem).

**Os três achados fecharam:**
1. JSDoc: `SarakModal` 11/11 membros documentados, `SarakToast` 9/9 (cabeçalho restaurado, com a duração mínima
   da ação), `SarakOverlayProvider` com cabeçalho e `SarakConfirmOptions`/controller documentados,
   `SarakProgress` com as seis props descritas no catálogo gerado. Ficam sem JSDoc os três campos de
   `SarakOverlayRequest` — **já estavam assim no HEAD** — e o `variant` de `SarakProgressThreshold` (aviso, não
   bloqueia: o tipo não vira célula de catálogo).
2. `PresetCard.test.tsx.snap`: o delta é exatamente as sete variáveis novas (`--sarak-modal-width-*` e
   `--sarak-progress-bar-*`); nenhuma variável antiga mudou. O `PreviewCanvas` não foi tocado.
3. A pasta `.vitest-temp-plan98-*` não existe mais na raiz.

**Commit:** espera o fecho da onda. `catalog:check` está defasado por arquivos editados depois da última geração
(o `SarakOverlayProvider.tsx` desta plan e o lote 2 da plan-101); catálogo e kit se regeneram **uma vez, pelo
último a terminar**, e o `PreviewCanvas.test.tsx.snap` é regenerado por quem commitar por último (veredito anterior,
achado 2).

Status: `🟢 Aprovada`.

---

# 11. Síntese

<!-- Preenchido pelo REVISOR na síntese (00-prompt-revisor.md §7.4), imediatamente antes da remoção da plan.
     Append-only. O que foi transportado, e o que ficou de fora. -->
