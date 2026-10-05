---
tipo: "plan"
titulo: "Dar à lib um quadro kanban de gestão de projetos que funciona em toque e teclado, com o cartão e seus blocos de detalhe"
objetivo: "Escolher por medicao a biblioteca de arrastar e soltar do kanban, entregar um SarakKanban que reordena, funciona em toque e teclado e abre cartao, e dar os blocos de detalhe do cartao (checklist, comentarios, responsavel, historico)"
dominio: "Sarak-Lib-UI-Core / DataDisplay / Gestão de projetos"
status: "🔴 A executar"
prioridade: "Média"
tags: ["plan", "kanban", "gestao-de-projetos", "dnd", "spike", "adr"]
relacionados: ["[[03-superficie-publica]]", "[[10-seguranca-e-acessibilidade]]", "[[07-responsividade-e-multidispositivo]]", "[[13-instalacao-e-atualizacao]]"]
depende_de: "plan-98-dialogo-e-feedback"
retida_por: ""
destino_sintese: "adr/019 (nova) + adr/020 (nova) + arquitetura/03-superficie-publica.md + specs/13-instalacao-e-atualizacao.md"
---

# 1. Objetivo

A lib passa a ter o **quadro kanban** que um sistema de gestão de projetos precisa: arrasta entre colunas **e
reordena dentro da coluna** (no índice exato), funciona **em celular/tablet (toque) e por teclado**, abre o cartão
ao clicar, cria cartão e coluna, mostra no cartão o que todo gerenciador de tarefas mostra, e oferece os **blocos de
detalhe do cartão** (checklist, comentários, seletor de responsável, histórico). Antes, **uma avaliação medida**
escolhe a biblioteca de arrastar e soltar e decide como será o Gantt da plan seguinte.

Três lotes, **um por conversa de execução**, veredito entre eles. O **lote 1 não toca o repositório** e pode ser
despachado **antes** da plan-98; os lotes 2 e 3, não (colidem com ela em `src/core/i18n/` e dependem da barra de
progresso dela).

# 2. Contexto

**Pedido do dono (2026-10-05):** módulo de gestão de projetos (kanban), com o módulo de tarefas do **SellersGO**
como referência; **usar biblioteca de terceiros** para o comportamento difícil e deixar para a lib o visual;
aceitos: `@dnd-kit` como ponto de partida, calendário mensal e Gantt próprios (a menos que a avaliação diga outra
coisa), cartão composto com os átomos da lib; **avaliar antes de decidir**.

**Referência medida (SellersGO, `modulos/tarefas/web`):** quatro visões numa tela (Kanban, Lista, Calendário,
Gantt); no quadro, colunas criáveis/renomeáveis/apagáveis, arrasto **entre e dentro** das colunas com
`@dnd-kit/core`+`sortable` (ativação após 4 px, para não brigar com o clique), ordem por posição fracionária (passo
1024), criação rápida no rodapé da coluna, modal de detalhe (subtarefas, comentários, imagens, campos
personalizados, dependências, histórico de movimentação), 3 gráficos com `recharts`. **Nenhum componente da lib é
usado**: é tudo feito à mão.

**O que a lib tem hoje (medido em 2026-10-05):**

| Fato | Onde |
|---|---|
| `SarakKanban` arrasta pela **API HTML5 nativa**; no `drop` o destino é **sempre o fim da coluna** (`toIndex = target.cards.length`) — **não reordena** dentro da coluna nem solta num índice | `src/components/atomic/DataDisplay/SarakKanban/SarakKanbanImpl.tsx:44-54` |
| A API HTML5 de arrastar **não responde a toque** (celular e tablet): o quadro não funciona em aparelho de toque | `SarakKanbanImpl.tsx:104-107` (`draggable` + `onDragStart`) |
| **Nenhum tratamento de teclado nem ARIA** no componente | `SarakKanbanImpl.tsx` inteiro |
| O cartão padrão tem **só título e descrição**; o resto é por `renderCard` | `SarakKanbanImpl.tsx:117-128` · `kanbanModel.ts:8-12` |
| **Sem** eventos de clicar o cartão, criar cartão, criar/renomear/apagar coluna | `SarakKanbanProps` (`SarakKanbanImpl.tsx:13-21`) |
| Medidas escritas à mão (`minWidth: 260`, `fontSize: 13`, `cursor: 'grab'`) e **nenhum texto traduzido** | `SarakKanbanImpl.tsx:77,91,113` |
| **Não é lazy, de propósito**: "zero dependência, leve". Trazer uma biblioteca de DnD **muda isso** — dependência opcional exige carregar sob demanda, como `echarts` e `pdfjs-dist` | `SarakKanban/index.ts:1-4` · `specs/arquitetura/03-superficie-publica.md` |
| Existem testes (2 casos do componente + o modelo) e o modelo `sarakMoveCard` é **lógica pura**, reaproveitável | `SarakKanban/__tests__/` · `kanbanModel.ts:32-61` |
| Faltam, para o cartão de detalhe: checklist, thread de comentários, seletor de responsável com avatar, feed de histórico. **Há**: `SarakModal`, `SarakDrawer`, `SarakCheckbox`, `SarakAvatar`, `SarakAutocomplete`, `SarakUploader`, `SarakBadge`, `SarakContextMenu`. A barra de progresso é da `plan-98` | `src/components/atomic/` |
| Nenhuma outra plan trata de kanban, calendário ou Gantt | `specs/plan/` |

**Candidatos de arrastar e soltar** (npm, 2026-10-05): `@dnd-kit/core` 6.3.1 + `@dnd-kit/sortable` 10.0.0 (MIT,
Dez/2024 — **sem release há 22 meses**; a reescrita `@dnd-kit/react` está em 0.5, pré-1.0; já em uso no
SellersGO) · `@hello-pangea/dnd` 18.0.1 (Apache-2.0, Fev/2025; feito para quadros; teclado e leitor de tela já
inclusos) · `@atlaskit/pragmatic-drag-and-drop` 4.0.0 (Apache-2.0, Set/2026; usado no Jira; baseado no arrastar
nativo do navegador — **o comportamento em toque é o ponto a medir**). **Candidatos de Gantt:** casca **própria**
(o SellersGO fez o básico em 166 linhas) · `@svar-ui/react-gantt` 2.7.3 (MIT; auto-agendamento, caminho crítico e
exportação são da edição PRO, paga) · `frappe-gantt` 1.2.2 (MIT, sem React). **Excluídos:** `gantt-task-react`
(abandonado em 2022); DHTMLX, Bryntum, Syncfusion, DevExtreme (comerciais).

# 3. Escopo

## 3.1 Dentro (o que pode ser tocado)

**Lote 1 — avaliação (sem tocar o repositório)**
- Protótipos **descartáveis em diretório temporário fora do repositório** (nenhum arquivo novo no repo; a única
  edição é o resumo desta plan).

**Lote 2 — o quadro**
- `src/components/atomic/DataDisplay/SarakKanban/` — `SarakKanbanImpl.tsx`, `kanbanModel.ts`, `index.ts` e os
  arquivos novos: `useKanbanDrag.ts` (o **adaptador** do DnD), `KanbanCard.tsx` (cartão padrão),
  `KanbanColumn.tsx`, `kanbanTypes.ts`.
- `src/components/atomic/DataDisplay/index.ts` · `src/index.ts` — exportações.
- `package.json` — **só** o peer da biblioteca escolhida (`peerDependencies` + `peerDependenciesMeta` opcional +
  `devDependencies`) e `package-lock.json` pela instalação.
- `src/core/i18n/catalogEntries.part*.ts` — textos do quadro.
- Registro/paridade do componente (manifesto, catálogo): pelos comandos e pela skill `ui-novo-componente`.
- Testes ao lado; `docs/component-catalog.*`, `docs/migracoes.md` (a nota), `dist/`, `sarak-ui/`, `sarak-dev/`
  regenerados.

**Lote 3 — blocos de detalhe do cartão**
- Componentes **novos**, um por pasta/arquivo, com teste 1:1: `SarakChecklist`, `SarakCommentThread`,
  `SarakActivityFeed` (em `src/components/atomic/DataDisplay/`) e `SarakAssigneePicker` (em
  `src/components/atomic/Inputs/`).
- `src/core/i18n/catalogEntries.part*.ts` · barris · `docs/component-catalog.*` · artefatos regenerados.

## 3.2 Fora (o que NÃO pode ser tocado)

- **Calendário e Gantt** — são da plan seguinte (`plan-103`), que lê o ADR do lote 1.
- Limite de trabalho em andamento (WIP), raias (swimlanes), estimativa, etiquetas coloridas, campos
  personalizados, dependências entre cartões, menções em comentário, anexo de arquivo no componente (o
  `SarakUploader` já existe; o consumidor o compõe): **nenhum dos cinco sistemas os tem** — esperam demanda.
- Persistência, ordem fracionária e regra de negócio: do **consumidor** (a lib emite o movimento e os vizinhos).
- O módulo de tarefas do SellersGO (migrá-lo é plan de atualização do consumidor, depois).
- Dependência **além** da escolhida pelo ADR; `src/styles/`; o cromo.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/arquitetura/03-superficie-publica.md` | prefixo, barril, a fronteira lazy (§7.1) e a linha do `SarakKanban` ("não é lazy") que esta plan muda |
| Spec fixa | `specs/specs/13-instalacao-e-atualizacao.md` | a tabela de peers e `peerDependenciesMeta`: onde a biblioteca nova entra |
| Spec fixa | `specs/specs/10-seguranca-e-acessibilidade.md` | §2.4 (teclado e ARIA no arrastar) e §3.6 (tradução) |
| Spec fixa | `specs/specs/07-responsividade-e-multidispositivo.md` | as três faixas; o quadro no celular |
| Spec fixa | `specs/specs/00-regras-e-invariantes.md` | R9, R36, R37 (prefixo), zero hardcode, a regra de paridade do registro |
| Spec fixa | `specs/specs/03-versionamento-e-release.md` | §3 e §5 — peer novo e API nova |
| Contexto | `specs/00-contexto.md` · `specs/00-knowledge.md` | sempre |
| **Skill** | `padrao-escrita` + `padrao-typescript` | sempre |
| **Skill** | `test-unitario` | quadro, teclado, toque (simulado), os blocos |
| **Skill** | `ui-novo-componente` | cada componente novo, com registro e paridade |
| **Skill** | `ui-refatorar-componente` | evoluir o `SarakKanban` sem quebrar quem já o usa |
| **Skill** | `ui-arquitetura-design` | estilo por token |
| Código | `src/components/atomic/DataDisplay/SarakKanban/SarakKanbanImpl.tsx` · `src/components/atomic/DataDisplay/SarakKanban/kanbanModel.ts` · `src/components/atomic/DataDisplay/SarakKanban/index.ts` | ler antes de editar |
| Código | `src/components/engines/LazyEngineWrapper.tsx` · `src/components/engines/charts/index.tsx` | o padrão de fronteira lazy a copiar |
| Código | `src/components/atomic/Atoms/SarakAvatar.tsx` · `src/components/atomic/Inputs/SarakAutocomplete.tsx` · `src/components/atomic/UX/SarakContextMenu.tsx` · `src/components/atomic/Modals/SarakDrawer.tsx` | blocos que o cartão compõe |
| Código | `src/core/i18n/useLibraryText.ts` | texto traduzido |

# 5. Instruções de execução

**Lote 1 — avaliação (spike), sem tocar o repositório**

1. **Crie, fora do repositório**, um projeto de teste por candidato — `@dnd-kit/core`+`sortable`,
   `@hello-pangea/dnd` e `@atlaskit/pragmatic-drag-and-drop` — com **o mesmo quadro**: 4 colunas, 12 cartões, uma
   coluna alta (rola na vertical) e o quadro largo (rola na horizontal). **Sem a lib, sem tema Sarak**: só o
   comportamento. Instale as versões do §2.
2. **Meça cada critério, igual para os três** (o resumo traz uma tabela `candidato × critério`, com o número ou
   `passou/falhou` e como se mediu):
   - **A. Reordenar** dentro da coluna e **soltar num índice exato** de outra coluna.
   - **B. Teclado:** levantar, mover entre colunas e dentro, soltar e cancelar (Esc) **só com o teclado**, com
     anúncio para leitor de tela.
   - **C. Rolagem:** arrastar perto da borda **rola** o quadro (horizontal) e a coluna (vertical).
   - **D. Toque:** arrastar com o dedo sem brigar com a rolagem da página (ativação por pressão longa ou
     distância). **O executor prepara a página para o dono abrir no aparelho** (`vite --host`, com o endereço e
     o passo a passo no resumo); a coluna "toque em aparelho" fica **"a medir pelo dono"** até ele responder —
     **o veredito do lote só fecha com ela preenchida**. Meça também com eventos de ponteiro simulados.
   - **E. React:** monta e funciona em React 18 **e** 19, com `StrictMode`.
   - **F. Peso:** KB `gzip` que o candidato soma a um bundle de teste (medir com o mesmo empacotador, dois
     arquivos: com e sem a lib).
   - **G. Estilo:** o cartão arrastado e o espaço reservado aceitam estilo 100 % por token (sem CSS de
     fornecedor para brigar).
   - **H. Licença e manutenção:** licença no `package.json` publicado e data da última versão (lidas do npm).
3. **Regra de decisão, escrita antes de medir:** vence o candidato que **passa em A, B, C, D, E, G e H** com o
   **menor** F. Empate técnico → `@dnd-kit/core`+`sortable` (já provado no SellersGO). **Nenhum passa em D** →
   o lote termina `Concluído com pendências` com o relatório, e a decisão (escrever o toque à mão ou aceitar
   quadro sem toque) **é do dono**.
4. **Gantt, mesmo método.** Prototipe a **casca própria** (barras por data, linha do "hoje", dependências como
   setas) e o `@svar-ui/react-gantt` (e, só como referência de peso, o `frappe-gantt`) com 30 tarefas e 8
   dependências. Meça: **A.** tarefas com início/fim, **B.** dependências, **C.** arrastar/redimensionar barra,
   **D.** zoom (dia/semana/mês), **E.** marcador de hoje, **F.** tema por variável CSS (fonte, cor primária, raio,
   borda e modo escuro: **quantos dos cinco** ficam iguais ao tema Sarak sem sobrescrever CSS à força), **G.** KB
   `gzip`, **H.** o que é **PRO/pago**, **I.** toque, **J.** React 18/19. **Regra:** `@svar-ui/react-gantt` só
   vence se a edição **gratuita** cobrir A–E, **F ≥ 4 de 5**, **G ≤ 80 KB** e H não tocar A–E; senão, **casca
   própria**.
5. **Entregue as duas decisões** no resumo (a escolhida, a tabela, e **o custo** de cada alternativa). O revisor
   as transforma nos **ADR-019** (arrastar e soltar) e **ADR-020** (Gantt) na síntese. Entregue o lote 1 e
   **pare para o veredito**.

**Lote 2 — o quadro**

6. **A biblioteca é a que o ADR-019 escolheu**; o DnD fica **atrás de `useKanbanDrag`**, de modo que trocar de
   biblioteca mexa em **um arquivo**. O hook expõe: o que arrasta, o que recebe, o índice de destino, o cartão
   ativo e os anúncios de acessibilidade.
7. **Dependência opcional.** A biblioteca entra em `peerDependencies` com `peerDependenciesMeta` opcional e em
   `devDependencies`; **`SarakKanban` passa a ser carregado sob demanda** (`React.lazy` + `Suspense` interno,
   pelo `LazyEngineWrapper`), **preservando o tipo público** (`<SarakKanban />` sem `Suspense` do consumidor).
   `kanbanModel.ts` (lógica pura) continua **fora** do lazy e exportado.
8. **Reordenar de verdade.** O destino é o **índice onde se soltou**; `sarakMoveCard` já aceita `toIndex`. O
   evento `onCardMove` ganha `fromIndex`, `toIndex` e os vizinhos finais (`beforeCardId`/`afterCardId`, ou
   `null` nas pontas) — para o consumidor calcular a ordem (inclusive fracionária) **sem reler o quadro**.
   Soltar no mesmo lugar não emite evento.
9. **Toque e teclado** como o ADR-019 provou: arrastar com o dedo **não impede a rolagem da página**; teclado
   levanta/move/solta/cancela; **anúncios traduzidos** (catálogo de i18n) para leitor de tela.
10. **Cartão padrão** (`KanbanCard.tsx`), com campos **opcionais** em `SarakKanbanCard`: `code`, `title`,
    `description`, `assignee { name, avatarUrl? }`, `priority` (`'low' | 'medium' | 'high' | 'urgent'`),
    `dueDate`, `subtasks { done, total }`. Mostra: código, título, avatar (`SarakAvatar`), prioridade
    (`SarakBadge`; a **média não aparece**), prazo (**atrasado** pela cor de `statusErrorColor`) e o contador de
    subtarefas. **Nenhum texto fixo em português**: rótulos por i18n. `renderCard` continua vencendo o padrão.
11. **Eventos novos, todos opcionais** (cada um, quando passado, liga o recurso correspondente na interface):
    `onCardClick(card, columnId)`, `onCardAdd(columnId, title)` (campo de criação rápida no rodapé da coluna),
    `onColumnAdd(title)`, `onColumnRename(id, title)`, `onColumnDelete(id)` (menu da coluna, com
    `SarakContextMenu`). **Sem o evento, sem o controle.**
12. **Responsivo e sem medida solta.** Largura da coluna, espaçamento, raio e tipografia saem de tokens; no
    celular o quadro rola na horizontal com **uma coluna por vez** quase da largura do contêiner (container
    query, nunca `vw` de janela). Sai o `minWidth: 260`/`fontSize: 13` à mão.
13. **Compatibilidade:** quem usa `<SarakKanban columns onCardMove renderCard />` hoje continua funcionando; a
    nota em `docs/migracoes.md` diz o que mudou (lazy, peer opcional, evento mais rico).
14. Testes (skill `test-unitario`; toque por eventos de ponteiro simulados) e entrega do lote 2: **pare para o
    veredito**.

**Lote 3 — blocos de detalhe do cartão**

15. **`SarakChecklist`:** `items: { id, label, done }[]`, `onToggle(id, done)`, `onAdd?(label)`,
    `onRemove?(id)`, `showProgress?` — com o progresso **na barra de progresso da plan-98** (`feitos/total`).
16. **`SarakCommentThread`:** `comments: { id, author: { name, avatarUrl? }, body, createdAt }[]`,
    `onSubmit(text)`, `onDelete?(id)`; o horário **relativo** sai de `Intl.RelativeTimeFormat` no idioma da lib;
    campo de envio com `SarakTextarea`; sem menção (fora do §3.2).
17. **`SarakActivityFeed`:** `entries: { id, actor?, text, at }[]` — lista vertical com a linha do tempo (o
    "histórico de movimentação" do SellersGO é um uso).
18. **`SarakAssigneePicker`:** `people: { id, name, avatarUrl? }[]`, `value`, `onChange`, `clearable?` — sobre
    `SarakAutocomplete` + `SarakAvatar`.
19. Cada um: i18n, tokens, teclado/ARIA, estado vazio, teste 1:1, registro e paridade (`ui-novo-componente`).
20. **Prova de composição:** um teste monta, só com os átomos e os quatro blocos, um **detalhe de cartão**
    (`SarakDrawer` com título, `SarakAssigneePicker`, `SarakChecklist`, `SarakCommentThread`, `SarakActivityFeed`)
    e o abre a partir do `onCardClick` do quadro.
21. `npm run guide` · `npm run catalog` · `npm run dev-kit` · `npx tsc --noEmit` · `npm run build` ·
    `npx vitest run` · `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` → verdes.

# 6. Critérios de aceite

**Lote 1**
- [ ] O resumo traz a tabela `candidato × critério` do passo 2 para os **três** candidatos de DnD, com como cada
      número foi medido, **e** a do Gantt do passo 4 para os **três** candidatos.
- [ ] A coluna "toque em aparelho" está preenchida **pelo dono** antes do veredito.
- [ ] A regra de decisão aparece **escrita antes** das medições e a escolha **segue** a regra (ou o resumo
      explica a exceção).
- [ ] As duas decisões trazem **o custo de cada alternativa descartada** (insumo dos ADR).
- [ ] **Nenhum arquivo do repositório mudou** além desta plan (`git status` igual ao da fotografia).

**Lote 2**
- [ ] Soltar um cartão no meio de outra coluna o põe **naquele índice**; reordenar dentro da coluna funciona;
      `onCardMove` traz `fromIndex`, `toIndex`, `beforeCardId` e `afterCardId` (teste com os números).
- [ ] Soltar no mesmo lugar **não** chama `onCardMove` (teste).
- [ ] Teclado levanta, move entre e dentro das colunas, solta e cancela; os anúncios saem pelo catálogo de i18n
      (teste).
- [ ] O arrasto por ponteiro de toque começa por pressão longa/distância e não bloqueia a rolagem (teste com
      eventos simulados; **medido pelo revisor no aparelho com o dono**).
- [ ] O cartão padrão mostra código, título, avatar, prioridade (sem a média), prazo atrasado e contador (teste
      por campo); `renderCard` o substitui.
- [ ] Cada evento novo, **ausente**, não renderiza o controle dele; **presente**, renderiza e dispara (teste por
      evento).
- [ ] `SarakKanban` é carregado sob demanda: o chunk do boot **não** contém a biblioteca de DnD (medido no
      `build`); o tipo público é o mesmo; a biblioteca é peer **opcional**.
- [ ] Nenhuma medida solta (`px`, `fontSize`) no componente; nenhum texto fixo em português.
- [ ] `<SarakKanban columns onCardMove renderCard />` de antes segue funcionando (teste de compatibilidade).

**Lote 3**
- [ ] Cada um dos quatro componentes: renderiza, dispara os eventos, tem estado vazio, teclado/ARIA e texto por
      i18n (teste por componente); registro e paridade verdes.
- [ ] O teste de composição do passo 20 passa: clicar o cartão abre o detalhe montado só com átomos da lib.
- [ ] `npx tsc --noEmit` → 0; `check-audit-baseline --with-tsc` → igual ao baseline; `npm run build` e
      `npx vitest run` verdes.

# 7. Como verificar (uso do revisor)

**Gate:** `nenhum` — cada invariante vale **para um componente** (teste). O gate de paridade do registro e o de
peers (`package:check`) já cobram o que cruza módulos.

- **Lote 1:** `git status` **idêntico** ao da fotografia; reler **cada número** da tabela contra os
  protótipos — rodar eu mesmo o critério A, B e F de **um** candidato; conferir licença e data no `npm view`;
  colher o resultado de toque **do dono** e checar a regra de decisão.
- **Lote 2:** `git diff --stat` → só o §3.1; `package.json` com **só** o peer escolhido; `npm run build` e medir
  o chunk de boot **antes e depois** (a biblioteca não pode estar nele); **no navegador, por mim**: arrastar entre
  colunas e **dentro** da coluna, por mouse e por teclado; **com o dono, no aparelho de toque**. **Mutação:**
  voltar o `toIndex` a `cards.length` → o teste de índice falha.
- **Lote 3:** conferir o registro (barril, catálogo, paridade) dos quatro e o teste de composição.
- `npx tsc --noEmit` · `check-audit-baseline --with-tsc` · `npm run build` · `npx vitest run` (um por vez).
- Leitura do diff: nenhum comentário cita plan (R36); componente ≤ 250 linhas.

# 8. Destino da síntese

**Destino:** `adr/019 (nova) + adr/020 (nova) + arquitetura/03-superficie-publica.md + specs/13-instalacao-e-atualizacao.md`

Texto pronto para transporte:

- **`adr/019` — biblioteca de arrastar e soltar do kanban.** Alternativas reais: as três do §2, com **o custo
  de cada uma** medido no lote 1 (peso, toque, manutenção). A escolhida e o que a torna difícil de reverter: é
  um **peer público** dos consumidores (por isso o adaptador `useKanbanDrag`, que limita a troca a um arquivo).
- **`adr/020` — Gantt: casca própria × `@svar-ui/react-gantt`.** Alternativas e custo (peso, tema, o que é PRO).
  Decisão que a `plan-103` lê.
- **`arquitetura/03-superficie-publica`** — a linha do `SarakKanban` deixa de dizer "não é lazy": passa a ser
  **carregado sob demanda**, com a biblioteca de DnD como peer opcional; os quatro blocos novos entram na tabela
  de componentes; o contrato de `onCardMove` (índices e vizinhos).
- **`specs/13-instalacao-e-atualizacao`** — a biblioteca de DnD na tabela de peers como **opcional**.

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
