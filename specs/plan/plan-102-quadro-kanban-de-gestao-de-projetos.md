---
tipo: "plan"
titulo: "Dar à lib um quadro kanban de gestão de projetos que funciona em toque e teclado, com o cartão e seus blocos de detalhe"
objetivo: "Escolher por medicao a biblioteca de arrastar e soltar do kanban, entregar um SarakKanban que reordena, funciona em toque e teclado e abre cartao, e dar os blocos de detalhe do cartao (checklist, comentarios, responsavel, historico)"
dominio: "Sarak-Lib-UI-Core / DataDisplay / Gestão de projetos"
status: "🟡 Em execução"
prioridade: "Média"
tags: ["plan", "kanban", "gestao-de-projetos", "dnd", "spike", "adr"]
relacionados: ["[[03-superficie-publica]]", "[[10-seguranca-e-acessibilidade]]", "[[07-responsividade-e-multidispositivo]]", "[[13-instalacao-e-atualizacao]]"]
depende_de: "plan-98-dialogo-e-feedback"
retida_por: ""
destino_sintese: "adr/019 (nova) + arquitetura/03-superficie-publica.md + specs/13-instalacao-e-atualizacao.md"
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

6. **A biblioteca é `@dnd-kit/core` + `@dnd-kit/sortable`** (veredito do lote 1, 2026-10-05: decisão do dono pelo
   risco, com o toque ainda não medido em aparelho; o ADR-019 a registra na síntese). O DnD fica **atrás de
   `useKanbanDrag`**, de modo que trocar de
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
9. **Toque e teclado:** o toque pelo `TouchSensor` (ativação por atraso e tolerância, como no protótipo do lote
   1); arrastar com o dedo **não impede a rolagem da página**; teclado levanta/move/solta/cancela; **anúncios
   traduzidos** (catálogo de i18n) para leitor de tela; rolagem de borda pelo `autoScroll` do `DndContext`.
   *(Emendado em 2026-10-05:)* o toque **não foi medido em aparelho** no lote 1. O lote 2 entrega com os testes de
   ponteiro simulado, e a medição em aparelho acontece **no primeiro sistema importador atualizado**, feita pelo
   dono com o revisor, **antes** do veredito final do lote 2. Falhou: o lote 2 reprova e a escolha da biblioteca
   volta ao dono.
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
      eventos simulados) **e**, em aparelho de toque, **num sistema importador atualizado**: o cartão vai ao
      índice certo entre colunas e a rolagem da página não briga com o arrasto (medido pelo dono com o revisor;
      sem essa medição o lote 2 não é aprovado).
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

**Destino:** `adr/019 (nova) + arquitetura/03-superficie-publica.md + specs/13-instalacao-e-atualizacao.md`

Texto pronto para transporte:

- **`adr/019` — biblioteca de arrastar e soltar do kanban.** Alternativas reais: as três do §2, com **o custo
  de cada uma** medido no lote 1 (peso, toque, manutenção). A escolhida e o que a torna difícil de reverter: é
  um **peer público** dos consumidores (por isso o adaptador `useKanbanDrag`, que limita a troca a um arquivo).
  A escolha foi feita **sob incerteza**, pelo risco (veredito do lote 1); o ADR registra o resultado do toque em
  aparelho medido no importador e o **gatilho de reavaliação**: o Pragmatic DnD volta à mesa se o toque nativo
  for provado nos navegadores móveis-alvo e o peso do chunk do kanban importar.
- **`adr/020` — Gantt: escrito em 2026-10-05**, depois do veredito do lote 1, a pedido do dono: [[020-gantt-casca-propria]]. Nada a transportar na síntese.
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

## Rodada 1 — Lote 1 (2026-10-05) — Concluído com pendências

### Resultado

Foram avaliados os três candidatos de DnD e os três de Gantt em protótipos temporários fora do repositório, cada um com `package.json` e `node_modules` próprios. A regra de decisão foi registrada no protocolo temporário antes de consultar os tamanhos e resultados. O teste de toque físico continua **a medir pelo dono**, portanto o veredito final do DnD fica pendente.

**DnD:** ainda não há vencedor que satisfaça a regra com a evidência disponível. O dnd-kit e o Pangea não rolaram horizontalmente no ensaio completo; o Pragmatic DnD rolou 366 px nessa rodada, mas três rechecagens reduzidas deram 0 px. Nenhum candidato teve toque físico medido. O Pangea também não concluiu o arrasto por mouse no perfil React 19. O Pragmatic DnD é o menor pacote medido e é a opção a reavaliar se o dono confirmar D e o revisor confirmar C; não é declarado vencedor nesta rodada.

**Gantt:** a regra prévia escolhe a casca própria. A edição gratuita do SVAR não exibiu o marcador de hoje (E), e seu incremento de 101,22 KB supera o teto de 80 KB (G); a documentação classifica marcadores como PRO. O Frappe foi medido apenas como referência de peso.

### Protocolo e medições de DnD

- Cada quadro tem quatro colunas e 12 cartões; a primeira coluna tem seis cartões e rola verticalmente; o quadro excede a largura visível e rola horizontalmente. O mesmo protótipo foi executado com React 18.3.1 e 19.1.1 sob `StrictMode`.
- A: arrasto por mouse reordenou `task-1` para índice 4 da própria coluna e para índice 1 entre `task-7` e `task-8` da segunda coluna. B: teclado levantou, moveu dentro e entre colunas, soltou e cancelou com Esc; verificou-se o anúncio em `aria-live`/anúncio da biblioteca. C: arrasto perto da borda, em viewport de 800 × 900 px; foram lidos `scrollLeft` do quadro e `scrollTop` da lista. D: `PointerEvent` sintético e `Input.dispatchTouchEvent` do CDP foram sondados em separado. Eles não reproduzem o digitizador físico, eventos confiáveis do sistema, a arbitragem real de rolagem do navegador/OS nem um WebView de aparelho; não substituem o teste do dono.
- F: em cada diretório, `npm.cmd run size:compare` executa a comparação com esbuild 0.25.0, alvo `es2022`, minificação e React/ReactDOM externos: dois arquivos de entrada, um sem a biblioteca e outro com ela; mede-se o gzip de cada saída e calcula-se a diferença. O resultado é o incremento da biblioteca, sem a aplicação. No Pragmatic DnD o adaptador de teclado feito para o protótipo também fica fora desse incremento.
- Instalação foi isolada por protótipo e perfil React: `npm install --legacy-peer-deps --no-audit --no-fund`; nenhuma instalação foi feita na raiz do repositório. Licença, versão e data foram consultadas com `npm view <pacote>@<versão> version license time.<versão>`.

| Candidato | A. Índices | B. Teclado e anúncios | C. Rolagem de borda | D. Toque | E. React 18/19 + StrictMode | F. Gzip incremental | G. Estilo | H. Licença e versão publicada |
|---|---|---|---|---|---|---:|---|---|
| `@dnd-kit/core` 6.3.1 + `@dnd-kit/sortable` 10.0.0 | Passou: índice 4 dentro da coluna e índice 1 entre colunas | Passou: mover/soltar/cancelar nos dois sentidos; anúncio da biblioteca e região customizada | **Falhou no ensaio completo:** horizontal 0 px; vertical 122 px | **a medir pelo dono**; `PointerEvent` sintético ativou; toque CDP não ativou | Passou: montou sem erro e mouse/teclado funcionaram nos dois perfis | **+12,05 KB** | Passou: cartão, overlay e espaço podem receber CSS do consumidor; sem CSS fornecedor | MIT; core publicado em 2024-12-05 e sortable em 2024-12-04; cerca de 22 meses sem release até a data desta execução |
| `@hello-pangea/dnd` 18.0.1 | Passou: índice 4 dentro da coluna e índice 1 entre colunas | Passou: sensor e anúncios de teclado integrados; cancelamento com Esc | **Falhou:** horizontal 0 px; vertical 122 px | **a medir pelo dono**; `PointerEvent` sintético não ativou; toque CDP ativou o gesto longo, mas não reordenou | **Falhou nesta avaliação:** monta nos dois perfis e teclado funciona, mas o arrasto por mouse em React 19 não produziu destino nem mudou a ordem | **+30,72 KB** | Passou: estilos de cartão e placeholder podem ser aplicados pelo consumidor | Apache-2.0; 2025-02-09 |
| `@atlaskit/pragmatic-drag-and-drop` 4.0.0 | Passou: índice 4 dentro da coluna e índice 1 entre colunas | Passou com adaptador de teclado e anúncios `aria-live` implementados no protótipo; teclado não vem pronto no pacote base | **Instável:** ensaio completo mediu horizontal 366 px e vertical 122 px; três rechecagens reduzidas mediram horizontal 0 px; sem aprovação reprodutível | **a medir pelo dono**; `PointerEvent` sintético e toque CDP não ativaram | Passou: mouse e teclado funcionaram nos dois perfis sem erro de runtime | **+6,65 KB** | Passou: cartões e espaço reservado recebem CSS do consumidor; sem CSS fornecedor | Apache-2.0; 2026-09-24 |

**Decisão segundo a regra escrita antes de medir:** não escolher biblioteca DnD ainda. D é obrigatório e aguarda o dono; além disso, C do Pragmatic DnD precisa de resultado reprodutível. Se o dono confirmar D e o revisor confirmar C, o Pragmatic DnD tem o menor F entre os candidatos viáveis: 5,40 KB abaixo do dnd-kit. O Pangea custa 24,07 KB a mais que o Pragmatic DnD e falhou C e o arrasto por mouse em React 19 no protótipo. O dnd-kit custa 5,40 KB a mais que o Pragmatic DnD; no ensaio atual falhou C e tem risco de manutenção pela data do último release. Custos adicionais: no dnd-kit, adaptar e manter o contrato/ARIA e acompanhar a manutenção; no Pangea, reavaliar compatibilidade com React 19 e rolagem horizontal; no Pragmatic DnD, manter o adaptador de teclado e os anúncios acessíveis do consumidor, e validar C e toque físico. A documentação do Pragmatic DnD deixa teclado/acessibilidade a cargo do consumidor e oferece rolagem automática como pacote opcional ([acessibilidade](https://atlassian.design/components/pragmatic-drag-and-drop/accessibility-guidelines/) · [auto-scroll](https://atlassian.design/components/pragmatic-drag-and-drop/optional-packages/auto-scroll/)).

### Página de teste de toque para o dono

Os cinco servidores das páginas React 18 foram iniciados com `vite --host 0.0.0.0`, responderam HTTP 200 no endereço LAN e permanecem ativos nesta entrega. Abra no celular/tablet conectado à mesma rede Wi-Fi da máquina que executa os protótipos:

| Protótipo | Endereço |
|---|---|
| dnd-kit | [http://192.168.3.15:5101/](http://192.168.3.15:5101/) |
| hello-pangea | [http://192.168.3.15:5112/](http://192.168.3.15:5112/) |
| Pragmatic DnD | [http://192.168.3.15:5103/](http://192.168.3.15:5103/) |
| Gantt próprio | [http://192.168.3.15:5104/](http://192.168.3.15:5104/) |
| SVAR Gantt | [http://192.168.3.15:5105/](http://192.168.3.15:5105/) |

Em cada quadro DnD, arraste `task-1` de “A fazer” e solte entre `task-7` e `task-8` em “Em andamento”; confira a posição exata. Depois tente rolar verticalmente dentro de uma coluna e horizontalmente sobre o quadro; role a página fora do cartão e repita o gesto sobre o cartão, observando se o arrasto disputa a rolagem. No dnd-kit use a alça; no Pangea arraste o cartão; no Pragmatic DnD arraste o cartão pelo gesto nativo. Nos dois Gantt, tente mover e redimensionar uma barra, rolar a linha do tempo e alternar o tema. A coluna de toque de DnD e o critério I do Gantt continuam “a medir pelo dono” até o relato dele.

### Protocolo e medições de Gantt

Foram usados 30 tarefas e 8 dependências. Casca própria e SVAR foram montados sob `StrictMode` em React 18.3.1 e 19.1.1; mediram-se DOM, início/fim, setas, mover/redimensionar, zoom e tema no navegador. O critério I depende do aparelho do dono. F usa o mesmo método de dois bundles e gzip descrito acima. O Frappe foi instalado e empacotado somente como referência de peso; os demais comportamentos não foram medidos para ele.

| Candidato | A. Início/fim | B. Dependências | C. Mover/redimensionar | D. Dia/semana/mês | E. Hoje | F. Variáveis do tema (5) | G. Gzip incremental | H. PRO/pago | I. Toque | J. React 18/19 |
|---|---|---|---|---|---|---:|---:|---|---|---|
| Casca própria | Passou: 30 barras com datas | Passou: 8 setas SVG | Passou | Passou | Passou: 1 marcador | 5/5 | **+3,10 KB** | Nenhum recurso PRO no escopo do spike | a medir pelo dono | Passou em ambos, sem erro de runtime |
| `@svar-ui/react-gantt` 2.7.3 | Passou: 30 barras com datas | Passou: 8 dependências | Passou | Passou | **Falhou na edição gratuita:** nenhum marcador; markers são PRO segundo a [documentação](https://docs.svar.dev/react/gantt/api/properties/markers/) | 5/5 com temas Willow/WillowDark e variáveis CSS ([estilo](https://docs.svar.dev/react/gantt/guides/appearance/styling/)) | **+101,22 KB** | Marcadores, auto-agendamento, caminho crítico e exportação são PRO/pagos ([edições](https://docs.svar.dev/react/gantt/getting-started/installation/)) | a medir pelo dono | Passou em ambos, sem erro de runtime |
| `frappe-gantt` 1.2.2 (referência de peso) | Não medido | Não medido | Não medido | Não medido | Não medido | Não medido | **+14,70 KB** | MIT; PRO não avaliado | Não medido | Não medido; pacote sem superfície React avaliada |

**Decisão conforme a regra do passo 4:** casca própria. O SVAR gratuito não cobre A–E por faltar o marcador de hoje e excede G em 21,22 KB; portanto não atende ao limite de 80 KB, ainda que F seja 5/5 e J passe. O custo da casca própria é manter cálculo de datas, arraste/redimensionamento, zoom, marcador de hoje, setas, acessibilidade e cobertura de testes. O custo do SVAR descartado é +98,12 KB frente à casca própria, adaptação do tema e dependência da edição PRO para marcadores e outros recursos citados. O Frappe foi apenas referência: +11,60 KB frente à casca própria, sem avaliação de comportamento React; uma adoção exigiria integração/adaptação não medida neste lote.

### Verificações, arquivos e pendências

- `npm view` confirmou: dnd-kit core 6.3.1 MIT (2024-12-05), sortable 10.0.0 MIT (2024-12-04), Pangea 18.0.1 Apache-2.0 (2025-02-09), Pragmatic DnD 4.0.0 Apache-2.0 (2026-09-24), SVAR 2.7.3 MIT (2026-09-09) e Frappe 1.2.2 MIT (2026-02-25). SVAR declara peers React/ReactDOM `>=18`.
- `npm.cmd run build -- --configLoader native` passou para os cinco protótipos React 18; após ajustes de organização do spike, dnd-kit, Pragmatic DnD e casca própria passaram novamente. Perfis React 19 passaram em execução de desenvolvimento/StrictMode e nos ensaios de interação descritos. Builds Vite React 19 não foram confirmados: as tentativas pararam em `transforming...` e foram interrompidas.
- O validador `padrao-typescript/scripts/validate.mjs` passou nos seis projetos temporários; restaram somente achados de severidade e confiança baixas, classificados como heurísticas sobre constantes do quadro de avaliação; nenhum achado não heurístico.
- Fotografia de `git status --short` no início: `?? .claude/settings.local.json`. Durante esta execução apareceram alterações das execuções simultâneas plan-95/plan-99; não foram abertas nem tocadas. A única edição deste executor no repositório é esta plan: §9 e status. Os protótipos e o harness estão em `%TEMP%\sarak-spike-102`; não houve commit.
- Critérios de aceite do Lote 1: tabelas e custos registrados — atendido; regra registrada antes da medição e decisão aplicada — atendido, com D/C pendentes; toque físico pelo dono — **pendente**; nenhuma alteração de repositório por este executor além desta plan — atendido.

**Fora de escopo:** lotes 2 e 3 não iniciados. Não foram modificados componentes, dependências, lockfile ou outros arquivos do projeto por este executor.

## Resumo da execução (correção 1) — 2026-10-05

**Resultado:** Concluído com pendências — os três achados foram corrigidos; a medição física de toque D continua a cargo do dono.

**Estado do worktree ao iniciar:** `git status --short` foi fotografado antes da edição. A plan-102 já estava modificada pela execução anterior e havia trabalho paralelo no worktree; não abri nem toquei nos arquivos das plans 95 e 99.

**O que foi feito**

1. **Achado 1 — F do dnd-kit:** `dnd-kit/src/size-with.js` passou a importar e reter no bundle as APIs usadas pelo quadro: `DndContext`, `DragOverlay`, os três sensores, `closestCenter`, `useDroppable`, `useSensor`, `useSensors`, `SortableContext`, `sortableKeyboardCoordinates`, `useSortable` e `verticalListSortingStrategy`. Com o mesmo esbuild 0.25.0, alvo `es2022`, minificação, React/ReactDOM externos e duas entradas (baseline/quadro), o gzip mediu baseline 120 B e candidato 16.534 B: **+16,03 KB**, reproduzindo a medição do revisor. Comando no protótipo: `npm.cmd run size:compare`.
2. **Achado 2 — pacote de auto-scroll e custo do teclado:** instalei `@atlaskit/pragmatic-drag-and-drop-auto-scroll@3.2.1` nos perfis temporários React 18 e 19. `npm view` e o `package.json` instalado confirmam Apache-2.0; publicação em 2026-09-24. O quadro usa `autoScrollForElements` no contêiner horizontal e nas listas verticais. A comparação com as mesmas duas entradas mediu baseline 120 B e core Pragmatic + auto-scroll 9.486 B gzip: **+9,15 KB** (`npm.cmd run size:compare`). Extraí o adaptador real do protótipo para `pragmatic-dnd/src/keyboardAdapter.js` (tratamento de teclas, reducer, foco e despacho) e medi seu incremento contra a mesma base de bibliotecas/modelo: 10.010 B para 10.672 B gzip, **+0,65 KB**. Comando: `npm.cmd run size:compare -- src/size-keyboard-adapter.js src/size-adapter-baseline.js`. Esse valor mede a lógica do módulo; o markup React/ARIA da interface e CSS não fazem parte dele.
3. **Achado 3 — C repetido e reproduzível:** `browser-harness/scripts/c-five-repetitions.mjs` usa mouse real do Playwright, viewport 800 × 900, move até a borda e segura por 1.500 ms; cada repetição lê `scrollLeft` horizontal e `scrollTop` vertical, com reset entre eixos. Rodei cinco repetições por candidato. Para o dnd-kit, deixei explícita a opção documentada `DndContext autoScroll` com limiares `x: 0.1`, `y: 0.1`; para o Pragmatic, usei o pacote 3.2.1; o Pangea foi medido com o auto-scroll integrado. `node scripts/c-five-repetitions.mjs` produziu:

| Candidato | `scrollLeft` horizontal (5 leituras, px) | `scrollTop` vertical (5 leituras, px) |
|---|---|---|
| dnd-kit, `autoScroll` explícito | 366, 366, 366, 366, 366 | 122, 122, 122, 122, 122 |
| hello-pangea | 0, 0, 0, 0, 0 | 122, 122, 122, 122, 122 |
| Pragmatic DnD + auto-scroll 3.2.1 | 366, 366, 366, 366, 366 | 122, 122, 122, 122, 122 |

**Arquivos alterados**

| Arquivo | Natureza | O que mudou |
|---|---|---|
| `specs/plan/plan-102-quadro-kanban-de-gestao-de-projetos.md` | alterado | Bloco append-only desta correção e status para 🟠. |
| `%TEMP%\sarak-spike-102\` | temporários | Sonda de tamanho completa, pacote auto-scroll, módulo de teclado e harness das cinco repetições/regressão. Sem arquivos de protótipo no repositório. |

**Verificações executadas**

- `npm.cmd run size:compare` em `dnd-kit` → +16,03 KB gzip com todas as APIs usadas.
- `npm.cmd run size:compare` em `pragmatic-dnd` → +9,15 KB gzip com core + `autoScrollForElements`.
- `npm.cmd run size:compare -- src/size-keyboard-adapter.js src/size-adapter-baseline.js` → +0,65 KB gzip para o módulo do adaptador.
- `node scripts/c-five-repetitions.mjs` → 5 leituras por eixo/candidato, registradas na tabela acima.
- `node scripts/pragmatic-regression.mjs` → React 18.3.1 e 19.1.1 sob `StrictMode`: reordenação com mouse nos índices 4 e 1, teclado dentro/entre colunas, anúncios e cancelamento com Esc; sem erros de runtime.
- `padrao-typescript/scripts/validate.mjs src` no protótipo Pragmatic → sem achados médios/altos; três alertas baixos de baixa confiança são os IDs constantes do `PointerEvent` sintético.
- Os cinco servidores LAN permaneceram ativos e responderam HTTP 200 nos ports 5101, 5112, 5103, 5104 e 5105. Builds/testes do repositório não foram executados.

**Critérios de aceite da correção**

- [x] Achado 1 — F do dnd-kit medido com todas as APIs efetivamente usadas: +16,03 KB gzip.
- [x] Achado 2 — auto-scroll instalado/medido e custo do adaptador informado separadamente: +9,15 KB e +0,65 KB gzip.
- [x] Achado 3 — cinco repetições com mesmo viewport/gesto, com as dez leituras por candidato registradas.
- [ ] Toque físico — aguarda o dono; os servidores foram mantidos no ar para esse teste.

**Decisões e suposições**

- A regra original não foi alterada. Com C agora reproduzível, dnd-kit e Pragmatic passam A, B, C, E, G e H; Pangea falha C. Se D passar no aparelho para o Pragmatic, ele fica em primeiro por peso: +9,15 KB da biblioteca e +0,65 KB do adaptador, contra +16,03 KB do dnd-kit. Não fecho a decisão enquanto D não for preenchido pelo dono.
- O auto-scroll PDD é contado no F da biblioteca; o adaptador de teclado fica destacado em parcela separada, como solicitado pelo revisor. A soma medida dessas duas parcelas é +9,80 KB gzip, antes do markup/CSS do protótipo.

**Achados fora do escopo (não corrigidos):** nenhum.

**Pendências / riscos:** resultado de toque físico D ainda não recebido. A coluna permanece “a medir pelo dono”; o veredito do lote não fecha até o relato no aparelho.

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->

## Veredito — 2026-10-05 — 🔴 Reprovado (lote 1)

**Antes de gravar:** a §10 foi relida no disco e estava vazia.

**O que está certo, e foi verificado por mim** (protótipos em `%TEMP%\sarak-spike-102`, sem tocar neles):

- Repositório: a única mudança deste executor é esta plan (§9 e status). As demais modificações do worktree
  são das plans 95 e 99.
- A regra de decisão é a da §5 itens 3 e 4, escrita antes da execução, e as duas conclusões a aplicam.
- **dnd-kit, A e B, com teclado real** (Playwright, `page.keyboard`): `Space` + `ArrowDown` ×2 + `Space` põe
  `task-1` no índice 2 da própria coluna, com anúncio `Destino: column-1, índice 2`; `ArrowRight` leva o
  cartão para a outra coluna; `Escape` cancela sem mudar a ordem. Com `KeyboardEvent` sintético nada se move,
  porque o sensor não aceita evento não confiável: B só se mede com tecla real.
- F: `npm run size:compare` reproduz +12,05 KB (dnd-kit) e +6,65 KB (Pragmatic) para as sondas do executor.
- **Gantt:** a casca própria segue a regra (o SVAR gratuito não tem marcador de hoje e soma +101,22 KB, acima
  do teto de 80 KB). Decisão aceita.
- Os cinco servidores LAN respondem 200 (`localhost:5101`, `5112`, `5103`, `5104`, `5105`).

**Achados — a correção é exclusivamente estes:**

1. **F do dnd-kit está subestimado.** O `size-with.js` importa só `DndContext` e `SortableContext`, e o
   tree-shaking descarta o resto. O protótipo usa ainda `DragOverlay`, os três sensores, `closestCenter`,
   `useDroppable`, `useSensor(s)`, `sortableKeyboardCoordinates`, `useSortable` e
   `verticalListSortingStrategy`. Com esse conjunto, medido por mim no mesmo harness: **+16,03 KB**. Critério
   violado: §5 item 2 F (*"o que o candidato soma"* ao quadro testado). Meça cada candidato pela **API que o
   protótipo dele usa**.
2. **O Pragmatic DnD foi medido sem o pacote de rolagem automática que a própria documentação indica.**
   `@atlaskit/pragmatic-drag-and-drop-auto-scroll` não está instalado no protótipo, então o C dele (366 px numa
   rodada, 0 px em três) não mede a biblioteca, e o F omite o pacote. Medi à parte: base + auto-scroll =
   **+9,22 KB** (3.2.1, Apache-2.0). O adaptador de teclado escrito para o protótipo também é custo (código que
   a lib manteria) e não aparece em F. Instale o auto-scroll, refaça C e F, e informe o tamanho do adaptador de
   teclado separado.
3. **C não é reprodutível para nenhum candidato, e é ele que elimina todos.** No dnd-kit medi **383 px de 383**
   com `PointerEvent` sintético e **3 px** com mouse real (Playwright, viewport 800 × 900); o resumo diz 0 px.
   Uma régua que dá números diferentes para o mesmo candidato não decide nada. Refaça C com **entrada real**
   (mouse do Playwright), **5 repetições por candidato**, mesmo viewport e mesmo gesto (mover até a borda e
   segurar 1,5 s), e registre as 5 leituras de `scrollLeft` e `scrollTop`. Se um candidato só rolar com uma
   opção de configuração (o `autoScroll` do `DndContext`, o pacote do Pragmatic), use a opção documentada e
   diga qual.

**Pendente, e não é do executor:** a coluna D (toque no aparelho) é do **dono**. Os servidores LAN devem
continuar no ar durante a correção. O veredito do lote só fecha com D preenchida.

## Veredito — 2026-10-05 (correção 1) — 🟢 Aprovado (lote 1 — liberação parcial)

**Antes de gravar:** a §10 foi relida no disco: só o bloco de reprovação desta data, escrito nesta conversa.

**Os três achados fecharam, medidos por mim** no harness do executor (`browser-harness/scripts/c-five-repetitions.mjs`,
mouse real, 800 × 900, 1.500 ms na borda) e no `measure-size.mjs` de cada protótipo:

| Candidato | C horizontal (5×) | C vertical (5×) | F gzip |
|---|---|---|---|
| `@dnd-kit/core` + `sortable` (`autoScroll` do `DndContext`, limiar 0,1) | 366 ×5 | 122 ×5 | **+16,03 KB**, com toda a API que o quadro usa |
| `@hello-pangea/dnd` | **0 ×5** | 122 ×5 | +30,72 KB |
| `@atlaskit/pragmatic-drag-and-drop` + `-auto-scroll` 3.2.1 | 366 ×5 | 122 ×5 | **+9,15 KB**, mais +0,65 KB do adaptador de teclado |

O Pangea sai por C. O dnd-kit e o Pragmatic passam em A, B, C, E, G e H.

**D não foi medido, e a decisão é do dono** *(2026-10-05)*. O dono não tem como testar em aparelho antes de
atualizar os sistemas importadores, e o toque simulado não serve como prova: o executor sondou `PointerEvent` e
toque por CDP, e nenhum dos dois reproduz a arbitragem real de rolagem do navegador. O dono decidiu **pelo
risco**:
- **Escolhido: `@dnd-kit/core` + `@dnd-kit/sortable`.** O toque vem de um sensor próprio (`TouchSensor`,
  atraso de 250 ms e tolerância de 5 px) que não depende do arrastar nativo do navegador, e já roda no SellersGO.
- **Descartado: o Pragmatic DnD**, apesar de ser 6,23 KB mais leve (16,03 contra 9,80). O toque dele depende do
  arrastar **nativo**, que varia por navegador móvel. Errar com ele deixa o quadro inoperante no celular;
  errar com o dnd-kit custa peso num chunk carregado sob demanda.
- O risco do dnd-kit (sem versão nova desde 2024-12) fica contido pelo adaptador `useKanbanDrag` (§5 item 6).

**D não sai do aceite: muda de lugar.** O lote 2 passa a exigir o toque medido **em aparelho, no primeiro
sistema importador atualizado**, antes da aprovação final da plan (§5 item 9 e §6, emendados nesta data).
Se essa medição falhar, o lote 2 reprova e a escolha volta ao dono.

**Gantt:** casca própria, pela regra do passo 4 (o SVAR gratuito não tem marcador de hoje, e soma 101,22 KB,
acima do teto de 80).

**Liberação parcial.** O lote 1 está aprovado. O lote 2 continua dependendo da `plan-98` (§1). O `status` volta
a `🟡 Em execução`.

---

# 11. Síntese

<!-- Preenchido pelo REVISOR na síntese (00-prompt-revisor.md §7.4), imediatamente antes da remoção da plan.
     Append-only. O que foi transportado, e o que ficou de fora. -->
