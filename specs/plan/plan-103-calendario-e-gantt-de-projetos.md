---
tipo: "plan"
titulo: "Dar à lib as visões de calendário mensal e de Gantt para a gestão de projetos"
objetivo: "Dar a lib um calendario mensal de eventos e um Gantt com dependencias, ambos com tema, teclado e celular, para que um sistema de projetos monte as visoes do quadro sem refazer a mao"
dominio: "Sarak-Lib-UI-Core / DataDisplay / Gestão de projetos"
status: "🟢 Aprovada"
prioridade: "Média"
tags: ["plan", "calendario", "gantt", "gestao-de-projetos", "visoes"]
relacionados: ["[[03-superficie-publica]]", "[[10-seguranca-e-acessibilidade]]", "[[07-responsividade-e-multidispositivo]]"]
depende_de: "plan-102-quadro-kanban-de-gestao-de-projetos"
retida_por: ""
destino_sintese: "arquitetura/03-superficie-publica.md"
---

# 1. Objetivo

Um sistema de projetos monta, com a lib, as **outras duas visões** do quadro: um **calendário mensal** com os
cartões pelo prazo e um **Gantt** com início, fim e dependências — sem refazê-las à mão, com o tema da lib, por
teclado e no celular. (Kanban e blocos do cartão são da `plan-102`; a **Lista** é a `SarakDataTable` que a lib já
tem.)

Dois lotes, **um por conversa de execução**, veredito entre eles.

# 2. Contexto

**Pedido do dono (2026-10-05):** gestão de projetos completa, com o SellersGO como referência: o módulo de
tarefas dele tem **Calendário** (grade mensal feita à mão, 195 linhas, navegação mês anterior/seguinte) e
**Gantt** (166 linhas, usa as dependências entre cartões). **Aceito:** calendário mensal **próprio** sobre a
matemática que a lib já tem; Gantt **casca própria**, decidido pela avaliação medida da `plan-102` ([[020-gantt-casca-propria]]).

**O que a lib tem hoje (medido em 2026-10-05):**

| Fato | Onde |
|---|---|
| A matemática de calendário **existe**: `buildMonthMatrix(month, weekStartsOn)` devolve semanas × dias com os dias "vazantes" do mês vizinho, sobre `date-fns` (já peer do projeto), sem React | `src/components/atomic/Inputs/internal/calendarGrid.ts:18-29` |
| O que usa essa matemática é só o **seletor de data** (`SarakDatePicker`/`CalendarPanel`): **não há visão de calendário de eventos** | `src/components/atomic/Inputs/internal/CalendarPanel.tsx` |
| **Não há** Gantt nem linha do tempo | `src/components/atomic/` |
| A tabela (`SarakDataTable`) e a grade (`SarakDataGrid`) existem — a visão **Lista** do SellersGO se compõe com elas | `src/components/atomic/DataDisplay/` |
| O padrão de dado dos componentes novos é fixado pela `plan-96` (sem URL, sem texto fixo em português, sem domínio) e o de peer/lazy pela `plan-102` | `plan-96` · `plan-102` |
| Candidatos de Gantt (npm, 2026-10-05): `@svar-ui/react-gantt` 2.7.3 (MIT; auto-agendamento, caminho crítico e exportação são PRO/pagos) · `frappe-gantt` 1.2.2 (MIT, sem React) · `gantt-task-react` (abandonado em 2022) · DHTMLX/Bryntum/Syncfusion/DevExtreme (comerciais) | `plan-102` §2 |

# 3. Escopo

## 3.1 Dentro (o que pode ser tocado)

**Lote 1 — calendário mensal**
- `src/components/atomic/DataDisplay/SarakCalendar/` — **novo**: `SarakCalendar.tsx`, `CalendarDayCell.tsx`,
  `calendarEvents.ts` (distribuição dos eventos nos dias), `index.ts`.
- `src/components/atomic/Inputs/internal/calendarGrid.ts` — **só** exportar o que a visão reusa, sem mudar o
  que o seletor de data já usa.
- `src/components/atomic/DataDisplay/index.ts` · `src/index.ts` — exportações.
- `src/core/i18n/catalogEntries.part*.ts` — textos.
- Registro/paridade (manifesto, catálogo): pelos comandos e pela skill `ui-novo-componente`; testes ao lado;
  `docs/component-catalog.*`, `dist/`, `sarak-ui/`, `sarak-dev/` regenerados.

**Lote 2 — Gantt**
- `src/components/atomic/DataDisplay/SarakGantt/` — **novo**: `SarakGantt.tsx`, `GanttTimeline.tsx`,
  `GanttDependencies.tsx` (setas em SVG), `ganttScale.ts` (datas ↔ pixels, escala dia/semana/mês), `index.ts`.
- Barris, i18n, registro, testes, artefatos — como no lote 1.

> O [[020-gantt-casca-propria]] escolheu a **casca própria** (2026-10-05): este lote a constrói, sem dependência de terceiro.

## 3.2 Fora (o que NÃO pode ser tocado)

- **O quadro kanban e os blocos do cartão** (`plan-102`) · a visão **Lista** (já existe) · um seletor de visões
  (`SarakTabs` já existe; o consumidor o compõe).
- **Arrastar e redimensionar barra do Gantt**, arrastar evento entre dias, grade de horas (semana/dia com
  horário), eventos recorrentes, fusos: **nenhum sistema de referência os usa na visão** — esperam demanda
  (`onTaskChange` e afins ficam **reservados**, não implementados).
- Caminho crítico, auto-agendamento e exportação (são PRO no fornecedor e **não** estão pedidos).
- Dependência nova; persistência e regra de negócio; `src/styles/`; o cromo; o SellersGO.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/arquitetura/03-superficie-publica.md` | prefixo, barril, tabela de componentes |
| Spec fixa | `specs/specs/10-seguranca-e-acessibilidade.md` | §2.4 (teclado e ARIA: grade de dias, barras focáveis) e §3.6 (tradução) |
| Spec fixa | `specs/specs/07-responsividade-e-multidispositivo.md` | as três faixas; container query |
| Spec fixa | `specs/specs/00-regras-e-invariantes.md` | R9, R36, R37, zero hardcode, paridade do registro |
| Decisão | o [[020-gantt-casca-propria]] (Gantt: **casca própria**), escrito em 2026-10-05 a partir do lote 1 da `plan-102` | **a decisão do lote 2** — enquanto ele não existir, o lote 2 **não é despachado** |
| Contexto | `specs/00-contexto.md` · `specs/00-knowledge.md` | sempre |
| **Skill** | `padrao-escrita` + `padrao-typescript` | sempre |
| **Skill** | `test-unitario` | os dois componentes |
| **Skill** | `ui-novo-componente` | componente novo, com registro e paridade |
| **Skill** | `ui-arquitetura-design` | estilo por token |
| Código | `src/components/atomic/Inputs/internal/calendarGrid.ts` · `src/components/atomic/Inputs/internal/CalendarPanel.tsx` · `src/components/atomic/Inputs/SarakDatePicker.tsx` | a matemática de calendário e o seletor que a usa |
| Código | `src/core/i18n/useLibraryText.ts` · `src/components/atomic/Atoms/SarakAvatar.tsx` | texto traduzido; avatar |

# 5. Instruções de execução

**Lote 1 — calendário mensal**

1. **`SarakCalendar`**, em `DataDisplay/`. Props: `events: { id, title, start, end?, tone?, meta? }[]`
   (`start`/`end` como `Date` ou `AAAA-MM-DD`, tratados como **dia de calendário local**, sem fuso),
   `month?` + `onMonthChange?` (controlado) **ou** `defaultMonth?` (não controlado), `weekStartsOn?` (`0 | 1`),
   `onEventClick?(event)`, `onDayClick?(date)`, `renderEvent?(event)`, `maxEventsPerDay?` (padrão 3).
   `tone`: `'primary' | 'success' | 'warning' | 'danger' | 'info' | 'muted'` — **mapeado para as cores do
   design**, nunca hexadecimal.
2. **A grade** vem de `buildMonthMatrix`. O cabeçalho mostra o mês e o ano (`Intl.DateTimeFormat` no idioma da
   lib) e os botões **anterior / hoje / próximo** (`SarakIconButton`), com texto por i18n. Os nomes dos dias da
   semana também por `Intl`.
3. **Eventos nos dias.** `calendarEvents.ts` distribui cada evento nos dias que cobre (um chip **por dia
   coberto**, com início e fim marcados); acima de `maxEventsPerDay`, o dia mostra **"+N"**, que chama
   `onDayClick(date)`. Dia de fora do mês: esmaecido. **Hoje** destacado.
4. **Teclado e ARIA.** A grade é `role="grid"`; as setas movem o foco entre os dias, `Enter` chama
   `onDayClick`, o chip é focável e `Enter` chama `onEventClick`. Cada dia tem `aria-label` com a data e a
   contagem de eventos.
5. **Celular.** Em contêiner estreito (container query, nunca `vw` de janela), o chip vira um **ponto colorido** e
   tocar o dia chama `onDayClick`; nada rola na horizontal.
6. Sem medida solta (`px`, `fontSize`) e sem texto fixo; estado de mês sem evento sem erro.
7. Testes (skill `test-unitario`): ver §6. Entregue o lote 1 e **pare para o veredito**.

**Lote 2 — Gantt (casca própria; ver a nota do §3.1)**

8. **`SarakGantt`**, em `DataDisplay/`. Props: `tasks: { id, title, start, end, progress?, dependsOn?: string[],
   tone?, group? }[]`, `scale?: 'day' | 'week' | 'month'` (padrão `'week'`), `onTaskClick?(task)`,
   `rangeStart?`/`rangeEnd?` (padrão: o intervalo das tarefas com uma margem), `rowHeight` por token.
9. **Layout:** à esquerda, a **lista** de tarefas (título e, se houver, o grupo); à direita, a **linha do tempo**
   que rola na horizontal, **com a rolagem vertical sincronizada** com a lista. Cabeçalho de datas **fixo**,
   marcador de **hoje**, fim de semana esmaecido na escala de dia.
10. **Barras** posicionadas por `ganttScale.ts` (data ↔ pixel, **uma função pura, testada**); a parte `progress`
    preenchida; cor por `tone`, pelas cores do design. **Dependências** `dependsOn` (término → início) como
    **setas em SVG** (`GanttDependencies.tsx`); dependência para tarefa inexistente é **ignorada com aviso** em
    desenvolvimento, nunca exceção; ciclo não trava a renderização.
11. **Teclado e ARIA:** a barra é focável e `Enter` chama `onTaskClick`; a linha do tempo tem `role` e rótulo; a
    lista é lida por leitor de tela como lista de tarefas com início e fim.
12. **Celular:** a lista colapsa para a coluna de título estreita e a linha do tempo rola; sem `vw`.
13. **Tamanho:** até **500 linhas sem virtualização**, dito no JSDoc; acima disso, fora do escopo.
14. Sem medida solta, sem texto fixo, sem biblioteca nova. Testes e entrega do lote 2.
15. `npm run guide` · `npm run catalog` · `npm run dev-kit` · `npx tsc --noEmit` · `npm run build` ·
    `npx vitest run` · `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` → verdes. **Pare para o
    veredito.**

# 6. Critérios de aceite

**Lote 1**
- [ ] Um evento de 3 dias aparece em **3** dias, com o primeiro e o último marcados (teste); acima de
      `maxEventsPerDay`, o dia mostra "+N" e o clique chama `onDayClick`.
- [ ] Navegar **anterior / hoje / próximo** muda o mês e chama `onMonthChange` (controlado) ou muda sozinho
      (não controlado) (teste).
- [ ] Setas movem o foco entre dias; `Enter` num dia chama `onDayClick`, num chip chama `onEventClick` (teste);
      a grade tem `role="grid"` e cada dia tem `aria-label` com data e contagem.
- [ ] `weekStartsOn` 0 e 1 mudam a 1.ª coluna (teste); os nomes dos dias saem de `Intl`, não de texto fixo.
- [ ] Em contêiner estreito o evento vira ponto e nada rola na horizontal (**medido pelo revisor no navegador**).
- [ ] `tone` mapeia para cores do design: nenhum hexadecimal no componente (`git grep` limpo).
- [ ] O `SarakDatePicker` segue passando nos testes dele (a matemática compartilhada não mudou).

**Lote 2**
- [ ] `ganttScale` converte data ↔ pixel nos três níveis de escala e **volta** (teste com os números, ida e
      volta).
- [ ] Duas tarefas com `dependsOn` desenham **uma seta**; dependência para id inexistente **não** lança e avisa
      em desenvolvimento; um **ciclo** não trava a renderização (testes).
- [ ] A barra tem `progress` visível; `tone` pelas cores do design; marcador de hoje presente na faixa visível
      (teste).
- [ ] `Enter` na barra chama `onTaskClick` (teste); a lista e a linha do tempo mantêm a mesma rolagem vertical
      (**medido pelo revisor no navegador**).
- [ ] Nenhuma medida solta nem texto fixo; **nenhuma dependência nova** no `package.json`.
- [ ] `npx tsc --noEmit` → 0; `check-audit-baseline --with-tsc` → igual ao baseline; `npm run build` e
      `npx vitest run` verdes.

# 7. Como verificar (uso do revisor)

**Gate:** `nenhum` — cada invariante vale **para um componente** (teste); o registro e a paridade já têm gate.

- `git status` + `git diff --stat` → só o §3.1; `calendarGrid.ts` com **só** exportações novas; **nenhuma**
  mudança em `package.json`.
- **Mutação do lote 1:** fazer o evento cobrir só o dia do início → o teste de 3 dias falha. **Do lote 2:** trocar
  a ida e volta de `ganttScale` por arredondamento errado → o teste de ida e volta falha. Mostrar o resultado.
- **No navegador, por mim:** o calendário em contêiner largo e estreito (`SarakCalendar` com 12 eventos, 2 de 3
  dias); o Gantt com 30 tarefas e 8 dependências, em dois temas, nas três escalas, rolando.
- Reproduzir com os **dados de exemplo do SellersGO** (cartões com prazo e dependências) montados à mão num script
  fora do repositório: as duas visões desenham sem ajuste.
- `npx tsc --noEmit` · `check-audit-baseline --with-tsc` · `npm run build` · `npx vitest run` (um por vez).
- Leitura do diff: nenhum comentário cita plan (R36); componente ≤ 250 linhas.

# 8. Destino da síntese

**Destino:** `arquitetura/03-superficie-publica.md`

Texto pronto para transporte: os dois componentes entram na tabela de componentes de `DataDisplay` (`SarakCalendar`:
calendário mensal de eventos, `tone` por cor do design, teclado e contêiner estreito; `SarakGantt`: casca própria,
dependências término→início, escalas dia/semana/mês, até 500 linhas sem virtualização) e a **decisão do Gantt**
permanece no ADR-020, citado ali. **Limites declarados:** sem arrastar/redimensionar, sem grade de horas, sem
recorrência, sem fuso; `onTaskChange` reservado.

> A síntese é ato do **revisor** ([[00-prompt-revisor]]), e o gatilho é do **usuário**: o revisor propõe ao
> aprovar e espera autorização. Esta seção apenas a prepara.

---

# 9. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only: cada rodada acrescenta um bloco novo; nada é removido. -->

## Resumo da execução — Lote 1 (calendário mensal) — 2026-10-09

**Resultado:** Concluído com pendências (a medição em contêiner estreito é do revisor, no navegador; o lote 2 não foi tocado)

**Estado do worktree ao iniciar**
(limpo) — `git status --short` vazio.

> A plan chegou em `🔴 A executar`, não em `🟡`. O dono despachou o lote 1 explicitamente na conversa; segui sem
> mover o status para `🟡` e o passo agora a `🟠`, como pedido.

**O que foi feito**
- `SarakCalendar/calendarEvents.ts` (novo): lógica pura. `parseCalendarDay` lê `AAAA-MM-DD` como meia-noite LOCAL
  (`new Date(y, m-1, d)`, não `new Date('AAAA-MM-DD')`, que é UTC) e rejeita dia inexistente (`2026-02-30`);
  `distributeCalendarEvents` põe um item por dia coberto com `isStart`/`isEnd`, recorta nas bordas da grade,
  trata `end < start` como um dia só e descarta início ilegível; `calendarToneColor` mapeia os 6 tons para
  `var(--sarak-…, var(--theme-…, currentColor))` (sem hexadecimal); `moveCalendarFocus` (setas ±1/±7 dias,
  PageUp/PageDown ±1 mês) usa `Map` para a tecla não alcançar `Object.prototype`.
- `SarakCalendar/CalendarDayCell.tsx` (novo): `role="gridcell"` com `aria-label` = data por extenso + contagem
  (`dayAriaLabel`: zero/um/vários), `aria-current="date"` em hoje, `data-outside` esmaecido, foco itinerante
  (só o dia ativo e os chips dele têm `tabIndex=0`). Chip = `SarakButton` (composição atômica) com
  `data-event-start`/`data-event-end`; clique e `Enter` no chip chamam `onEventClick` e param a propagação (o
  `Enter` não vira `onDayClick`). "+N" acima de `maxEvents` chama `onDayClick`.
- `SarakCalendar/calendarLayout.ts` (novo): as 4 classes literais de container query (altura do dia, chip
  ponto×título, toque) a partir de `@min-[768px]` (= `BREAKPOINT_TABLET`). Ver *Decisões*.
- `SarakCalendar/SarakCalendar.tsx` (novo): grade de `buildMonthMatrix`; `role="grid"` → `role="row"` →
  `columnheader`/`gridcell`; mês/ano, dias da semana e data por extenso por `Intl.DateTimeFormat` no idioma de
  `resolveLibraryLanguage(useSarakUIOptional()?.design?.language)` (R34: sem Provider, português); cabeçalho
  com `SarakIconButton` + `SarakIcon` (`ChevronLeft`/`ChevronRight`) e `SarakButton` "Hoje"; modo controlado
  (`month` + `onMonthChange`) e não controlado (`defaultMonth`, avisando `onMonthChange` também); o foco do DOM
  só se move por teclado (ref `pendingFocus`), e cruzar a borda do mês vira a página. Planta `@container` na raiz.
- `SarakCalendar/index.ts` (novo) e `DataDisplay/index.ts:17-18`: exportam `SarakCalendar`, `SarakCalendarProps`,
  `SarakCalendarEvent`, `SarakCalendarTone`, `SarakCalendarDate`. A célula, o layout e a lógica pura ficam internos.
- `src/core/i18n/catalogEntries.part6.ts`: 9 chaves `calendar*` nos 6 idiomas (rótulo da grade, anterior,
  próximo, hoje, contagem zero/um/vários, "+N" e o rótulo dele).
- Testes 1:1 em `SarakCalendar/__tests__/`: `SarakCalendar.test.tsx` (12), `CalendarDayCell.test.tsx` (7),
  `calendarEvents.test.ts` (12), `calendarLayout.test.ts` (3, amarra o literal à forma interpolada com
  `BREAKPOINT_TABLET`).

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/components/atomic/DataDisplay/SarakCalendar/SarakCalendar.tsx` | criado | componente (221 linhas) |
| `src/components/atomic/DataDisplay/SarakCalendar/CalendarDayCell.tsx` | criado | célula do dia e chip (194 linhas) |
| `src/components/atomic/DataDisplay/SarakCalendar/calendarEvents.ts` | criado | lógica pura (105 linhas) |
| `src/components/atomic/DataDisplay/SarakCalendar/calendarLayout.ts` | criado | classes de container query (21 linhas) |
| `src/components/atomic/DataDisplay/SarakCalendar/index.ts` | criado | barril da pasta |
| `src/components/atomic/DataDisplay/SarakCalendar/__tests__/*` (4) | criado | testes |
| `src/components/atomic/DataDisplay/index.ts` | alterado | `export * from './SarakCalendar'` |
| `src/core/i18n/catalogEntries.part6.ts` | alterado | 9 chaves `calendar*` + cabeçalho |
| `docs/component-catalog.{json,md}` | regenerado | `npm run catalog` (103 componentes) |
| `sarak-ui/*` (4) | regenerado | `npm run guide` (106 componentes) |
| `sarak-dev/*` (3) | regenerado | `npm run dev-kit` |
| `dist/` (39 entradas) · `src/buildInfo.ts` · `src/core/Provider/buildInfo.ts` | regenerado | `npm run build` (chunks com hash novo, carimbo de build) |

`calendarGrid.ts`, `src/index.ts` e `package.json`: **não alterados** — `buildMonthMatrix` e `SarakWeekStart` já eram
exportados, e `src/index.ts` já reexporta `DataDisplay` inteiro.

**Verificações executadas** (uma por vez; contagem de processos = 0 antes de cada build/vitest)
- `npx vitest run src/components/atomic/DataDisplay/SarakCalendar` → 4 arquivos, 34/34.
- **Mutação do lote 1** (`const to = from;` em `distributeCalendarEvents`, cópia salva e restaurada, `cmp` idêntico) →
  3 falhas: os dois testes de 3 dias (`calendarEvents` e `SarakCalendar`) e o de recorte na borda.
- `npm run catalog` → 103 componentes · `npm run guide` → 106 componentes, 437 tokens, 117 ícones · `npm run dev-kit` → 30 gates.
- `npm run build` → exit 0. Conferido no `dist/sarak.css`: as classes `@min-[768px]` (`pointer-events-auto`, `block`,
  `hidden`, `w-full`, `min-h-[calc(…*6)]`) e `min-h-[calc(…*3)]` foram geradas.
- `npx vitest run` → **426 arquivos, 2536 testes, 0 falhas** (707 s). Os avisos `Could not parse CSS stylesheet` do jsdom
  aparecem em vários arquivos da suíte.
- `npx tsc --noEmit` → 0 erros.
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` → "igual ao baseline de 2026-08-11 — nenhuma regressão".
  Antes da extração do `calendarLayout.ts` deu **regressão** `auditor_hardcoded.valor: 0 -> 4` (o `768px` das classes
  dentro do `.tsx`); ver *Decisões*.
- Gates do `.githooks/pre-commit`, um a um: `plan-index-sync`, `dev-kit --check`, `barrel-parity --check`,
  `catalog --check`, `zero-brand --check`, `consumer-kit --check`, `no-deep-import`, `gate-limits`,
  `container-query-literal`, `container-query-boundary`, `persistence-doc-identifiers`, `class-merge`, `icon-port`,
  `chrome-token-parity`, `trail-citation --staged`, `verificar_commit.py`, `generate-token-types --check` → todos OK.
  `check-agent-git-write` → FAIL, por definição em sessão de agente. `trail-citation --staged` não vê nada sem
  staged; conferido à mão: `grep -rniE "plan-?[0-9]|veredito"` na pasta nova → vazio.
- `grep -rnE "#[0-9a-fA-F]{3,8}\b" src/components/atomic/DataDisplay/SarakCalendar` → vazio.

**Critérios de aceite (lote 1)**
- [x] Evento de 3 dias em 3 dias, primeiro e último marcados; "+N" acima de `maxEventsPerDay` chama `onDayClick` —
  `SarakCalendar.test.tsx` ("um evento de 3 dias…", "acima de maxEventsPerDay…"), `CalendarDayCell.test.tsx` ("+N").
- [x] Anterior / hoje / próximo: não controlado muda sozinho e avisa; controlado só chama `onMonthChange` — testes
  "não controlado…" e "controlado…".
- [x] Setas movem o foco; `Enter` no dia → `onDayClick`, no chip → `onEventClick` (sem `onDayClick`); `role="grid"`;
  `aria-label` com data e contagem — testes "teclado: …" (3) e "cada dia tem aria-label…".
- [x] `weekStartsOn` 0 e 1 mudam a 1.ª coluna (`2026-09-27` × `2026-09-28`) e os nomes saem de `Intl` — teste "weekStartsOn…".
- [ ] Contêiner estreito: ponto e nada rolando na horizontal — **não medido em navegador** (fica para o revisor, como a
  plan define). O que existe: `@container` na raiz (teste), classes literais amarradas ao breakpoint (teste), regras
  geradas no CSS publicado (conferido), grade `repeat(7, minmax(0, 1fr))` com `minWidth: 0` e chip com `overflow: hidden`.
- [x] Nenhum hexadecimal no componente — grep vazio; tons testados em `calendarEvents.test.ts`.
- [x] `SarakDatePicker` segue verde — `calendarGrid.ts` intocado; suíte completa verde.

**Decisões e suposições**
- **`calendarLayout.ts`, um 5.º arquivo além dos quatro do §3.1** (dentro da pasta nova, que o despacho deu como
  território). Com as classes de container query no `.tsx`, o `auditor_hardcoded` acusava o `768px` da condição
  (0 → 4). A base inteira guarda essas classes literais em `.ts` (`kanbanLayout.ts`, hooks de layout): nenhum `.tsx`
  de produção carrega `@min-[768px]` literal. Segui esse idioma. **Para o revisor julgar:** isso coincide com o ponto
  cego declarado do auditor (ele só varre `.tsx`); a condição não pode ser `var()` (07 §6.1, limite do Tailwind).
- Breakpoint do estreito = `BREAKPOINT_TABLET` (768), a fronteira mobile/tablet das três faixas.
- No estreito o chip fica `pointer-events: none`, para que o toque em cima do ponto chame `onDayClick` (plan §5.5);
  pelo teclado o chip continua focável.
- `onMonthChange` também é avisado no modo não controlado (é notificação); `month` aceita só `Date`.
- `meta?: unknown`: dado opaco de quem chama, devolvido intacto em `onEventClick`.
- O foco do DOM só se move por teclado: montar o calendário ou trocar de mês pelos botões não rouba o foco. Com o mês
  trocado pelos botões, o dia tabulável vira o 1.º do mês.
- "+N" visível vem do catálogo (`calendarMore`), igual nos 6 idiomas; o nome acessível é `calendarMoreLabel`.

**Achados fora do escopo (não corrigidos)**
- `gates/scripts/audit/auditor_hardcoded.mjs`: só varre `.tsx` (a nota no próprio arquivo diz que é efeito do filtro de
  extensão e não uma isenção documentada). O idioma "classe de container query em `.ts`" depende disso.
- `src/components/atomic/Feedback/SarakBadge.tsx:57-70`: cores Tailwind fixas (`green-500`, `red-500`…), não tokens.
  Por isso o `tone` do calendário não reusa o `SarakBadge`.

**Pendências / riscos**
- Não medido em navegador real: contêiner estreito (ponto, nenhuma rolagem horizontal, toque no dia), a aparência dos
  chips sobre o preset `xs` do `SarakButton` (o `style` passado substitui o `dynamicStyle` do átomo, e o `<span>` interno
  dele não é alcançável, daí o `overflow: hidden`), o anel de foco das células e a leitura por leitor de tela. Também não
  conferi a renderização em temas diferentes.
- Lote 2 (Gantt) não iniciado, como pedido.

## Resumo da execução (correção 1 do lote 1) — 2026-10-09

**Resultado:** Concluído

**Estado do worktree ao iniciar**
```
 M docs/component-catalog.json
 M docs/component-catalog.md
 M sarak-dev/GUIA-MANUTENCAO.md
 M sarak-dev/START-HERE.md
 M sarak-dev/state.json
 M sarak-ui/GUIA-FRONTEND.md
 M sarak-ui/START-HERE.md
 M sarak-ui/VERSION
 M sarak-ui/catalog.json
 M specs/00-backlog.md
 M specs/00-indice.md
 M specs/plan/plan-103-calendario-e-gantt-de-projetos.md
 M src/buildInfo.ts
 M src/components/atomic/DataDisplay/index.ts
 M src/core/Provider/buildInfo.ts
 M src/core/i18n/catalogEntries.part6.ts
?? src/components/atomic/DataDisplay/SarakCalendar/
```
(mais as entradas de `dist/` do build do lote 1). `specs/00-backlog.md` e `specs/00-indice.md` são do revisor e não foram tocados.

**Um item por achado**

1. **Ponto visível no largo.** Tirei o `display: 'inline-block'` do estilo inline do ponto (`CalendarDayCell.tsx:95-96`,
   com o motivo no comentário). Quem decide o `display` agora é a classe, nos dois tamanhos:
   `CALENDAR_CHIP_DOT_CLASS = 'inline-block @min-[768px]:hidden'` (`calendarLayout.ts:26`). O `inline-block` de base
   continua necessário: sem ele o `span` é inline, ignora a largura, e o ponto sumiria no estreito com caixa vazia.
   Conferi os outros estilos inline do chip contra as classes de container query: o `chipStyle` (padding, altura e largura
   mínimas, alinhamento, fundo, borda, cor, fonte, `overflow`), o `labelStyle` (padding, alinhamento, fundo, bordas, raios)
   e o `cellStyle` (sem `minHeight`) não declaram `display`, `width`, `min-height` nem `pointer-events`, que são as
   propriedades das classes `@min-[768px]` (`w-full`, `pointer-events-auto`, `block`, `hidden`, `min-h-[…]`). Nenhuma
   contradição restante.
2. **Caixa alta, peso e espaçamento herdados do botão.** `CALENDAR_CHIP_CLASS` (`calendarLayout.ts:19-20`) passou a abrir
   com `normal-case tracking-normal font-normal`. O `SarakButton` emite `font-black uppercase tracking-widest` sem condição
   (`SarakButton.tsx:57`), e o `mergeSarakClasses` faz a classe do chamador vencer (R35). Teste em jsdom
   (`CalendarDayCell.test.tsx:85`): as três classes do átomo não estão no chip e as três comuns estão.
3. **"Outubro De 2026".** Tirei o `textTransform: 'capitalize'` do título do cabeçalho. O texto exibido agora é
   `capitalizeFirst(monthText, formats.language)` (`SarakCalendar.tsx:93`, `:187`): maiúscula só na primeira letra, com
   `toLocaleUpperCase` no idioma da lib. O `aria-label` da grade usa o texto cru do `Intl` (`:192`), para não ficar
   "Calendário de Outubro de 2026". Conferido nos seis idiomas do catálogo (`node`, `Intl`, outubro de 2026):
   pt `Outubro de 2026` · en `October 2026` · es `Octubre de 2026` · fr `Octobre 2026` · de `Oktober 2026` ·
   it `Ottobre 2026`. Os mesmos seis estão no teste (`SarakCalendar.test.tsx:39`), mais o caso que recusa
   `Outubro De 2026` (`:33`). O `capitalize` dos nomes dos dias da semana (`SarakCalendar.tsx:57`) ficou: cada um é
   uma palavra só, e o achado é do título.
4. **Caso de navegador.** Criei a cena `?cena=calendario` em `browser-tests/fixtures/harness-entry.tsx:227-244`, com o
   `SarakCalendar` dentro do `SarakUIProvider` em dois contêineres (`data-probe="calendario-largo"`, 1000 px, e
   `"calendario-estreito"`, 340 px), mês fixo (outubro de 2026) e dois eventos, um deles de 3 dias. O spec irmão novo é
   `browser-tests/calendario.spec.ts`, com limites declarados (R18). No estreito ele cobra: `scrollWidth ≤ clientWidth`,
   ponto com `display` diferente de `none` **e largura > 0**, título com `display: none`. No largo: ponto com
   `display: none`, título visível e `text-transform: none` no chip. Os casos existentes não foram editados.
   - **Vermelho**, contra o `dist/` do lote 1 (gerado às 16:27, antes da correção):
     `npx playwright test --config=browser-tests/playwright.config.ts browser-tests/calendario.spec.ts` → **2 failed,
     2 passed**. Largo, ponto: `Expected: "none"`, `Received: "inline-block"`. Largo, chip: `Expected: "none"`,
     `Received: "uppercase"`. Os dois do estreito passaram, como no navegador do revisor.
   - **Verde**, depois de `npm run build`: `npx playwright test --config=browser-tests/playwright.config.ts` (o diretório
     inteiro) → **55 passed**, os 4 do calendário entre eles.

**Arquivos alterados nesta rodada**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/components/atomic/DataDisplay/SarakCalendar/CalendarDayCell.tsx` | alterado | sem `display` inline no ponto |
| `src/components/atomic/DataDisplay/SarakCalendar/calendarLayout.ts` | alterado | chip com texto comum; ponto `inline-block` de base |
| `src/components/atomic/DataDisplay/SarakCalendar/SarakCalendar.tsx` | alterado | `capitalizeFirst`; título sem `text-transform`; `aria-label` com o texto cru |
| `src/components/atomic/DataDisplay/SarakCalendar/__tests__/{SarakCalendar,CalendarDayCell}.test.tsx`, `calendarLayout.test.ts` | alterado | literais novos, título capitalizado, 3 casos novos |
| `browser-tests/fixtures/harness-entry.tsx` | alterado | cena `calendario` |
| `browser-tests/calendario.spec.ts` | criado | 4 casos de navegador |
| `dist/` · `src/buildInfo.ts` · `src/core/Provider/buildInfo.ts` | regenerado | `npm run build` |

**Verificações executadas** (uma por vez; contagem de processos = 0 antes de cada vitest, build e playwright)
- `npx vitest run src/components/atomic/DataDisplay/SarakCalendar` → 4 arquivos, **37/37** (eram 34).
- `npm run build` → exit 0.
- Playwright: vermelho e verde, como no item 4.
- Superfície pública sem mudança (`capitalizeFirst` não sai pelo barril): `catalog --check`, `consumer-kit --check`,
  `dev-kit --check` e `barrel-parity --check` → OK, sem regenerar.
- `container-query-literal`, `class-merge` e `gate-limits` → OK.
- `npx tsc --noEmit` → 0 erros.
- `check-audit-baseline --with-tsc` → "igual ao baseline de 2026-08-11 — nenhuma regressão".
- R36 (`grep -rniE "plan-?[0-9]|veredito"` nos arquivos tocados) e hexadecimal na pasta → vazios.
- Suíte completa do vitest **não** rodada nesta rodada; o prompt pediu só a pasta do calendário.

**Decisões e suposições**
- Peso comum = `font-normal`.
- O "+N" também é um `SarakButton` e herda as mesmas classes, mas não tem letra. O achado 2 nomeia o chip, então o "+N"
  ficou como estava.

**Achados fora do escopo (não corrigidos)**
- Nenhum novo.

**Pendências / riscos**
- O caso de navegador mede só o tema default e o Chromium (limites declarados no spec). Teclado, foco e toque seguem
  medidos só em jsdom.

## Resumo da execução — Lote 2 (Gantt) — 2026-10-09

**Resultado:** Concluído

**Estado do worktree ao iniciar**
(limpo) — `git status --short` vazio (o lote 1 já estava commitado, `b995e291`).

**O que foi feito**
- `SarakGantt/ganttScale.ts` (novo, função pura): `ganttDateToPixel` conta **dias de calendário**
  (`differenceInCalendarDays`, imune a horário de verão) × pixels por dia (`GANTT_DAY_WIDTH`: dia 32, semana 12,
  mês 4); `ganttPixelToDate` devolve o dia que **contém** o pixel (`Math.floor`). Também `ganttBarGeometry` (fim
  inclusive), `ganttRangeWidth`, `resolveGanttRange` (margem por escala: ±2 dias, semanas inteiras de segunda com
  1 de folga, meses inteiros; `rangeStart`/`rangeEnd` vencem; sem tarefas, parte de hoje), `buildGanttTicks`
  (recortadas nas bordas) e `ganttToneColor`, que reusa as cores do calendário e faz **todo tom desconhecido**
  (o `neutral` do aviso do veredito, ou `constructor`) cair em `primary`. A barra nunca fica sem cor.
- `SarakGantt/ganttTasks.ts` (novo, puro): tipo público `SarakGanttTask`; `normalizeGanttTasks` (dia local, início
  ilegível descartado, fim ilegível ou invertido vira o dia do início); `resolveGanttDependencies` devolve **pares**
  término → início, descarta dependência de si mesma e repetida, e põe id inexistente em `missing`. Nada percorre o
  grafo, então um ciclo desenha duas setas e termina. `ganttProgress` recorta em 0–100.
- `SarakGantt/GanttDependencies.tsx` (novo): setas em SVG (`aria-hidden`). O `x` vem da escala, em pixels; o `y` vem
  em **porcentagem** da altura das linhas (`(i + 0,5) / n`), porque toda linha tem a mesma altura de token. Assim
  nenhuma altura é medida em JS. O marcador da ponta tem id por instância (`useId`).
- `SarakGantt/GanttTimeline.tsx` (novo): cabeçalho de datas `sticky` no topo; uma linha por tarefa; barra =
  `SarakButton` com `GANTT_BAR_CLASS` (`normal-case tracking-normal font-normal`), posição e largura em números
  (o React escreve px), preenchimento de `progress` e `aria-label` com título, início, fim e progresso; clique e
  `Enter` chamam `onTaskClick`. Fim de semana esmaecido só na escala de dia; marcador de hoje no meio do dia; setas
  **antes** das linhas no DOM; `role="group"` com rótulo "Linha do tempo de … a …".
- `SarakGantt/SarakGantt.tsx` (novo): **uma** área de rolagem (`role="region"`, `tabIndex=0`, nome "Cronograma") com a
  lista e a linha do tempo lado a lado. Com isso a rolagem vertical é uma só (as duas andam juntas por construção),
  a lista fica presa à esquerda (`sticky left`) e o cabeçalho ao topo. A lista é `<ul aria-label="Tarefas">`, com
  título, grupo e as datas em `sr-only`. O aviso de dependência inexistente sai uma vez por combinação, só fora de
  produção (`useEffect` + `Set`, no idioma do `useChromeDefaultWidgets`). Estado vazio traduzido; planta
  `@container`; JSDoc com "até 500 tarefas sem virtualização" e `onTaskChange` reservado.
- `SarakGantt/ganttLayout.ts` (novo): alturas por token (`--sarak-layout-gap-md`), as classes literais de container
  query (lista estreita → larga em `@min-[768px]`; grupo só no largo) e `GANTT_STICKY_SURFACE` (ver *Decisões*).
- `SarakGantt/useGanttFormats.ts` (novo): datas pelo `Intl` no idioma da lib, sem `text-transform`. Na escala de dia
  a marca mostra o número do dia, e o mês vai numa linha de cima, na 1.ª marca e no dia 1.
- `SarakGantt/index.ts` e `DataDisplay/index.ts:23-24`: exportam `SarakGantt`, `SarakGanttProps`, `SarakGanttTask`,
  `SarakGanttScale`, `SarakGanttTone`.
- `catalogEntries.part6.ts`: 7 chaves `gantt*` nos 6 idiomas.
- Testes 1:1 em `SarakGantt/__tests__/` (56): `ganttScale` 16, `GanttTimeline` 11, `SarakGantt` 9, `ganttTasks` 6,
  `GanttDependencies` 5, `ganttLayout` 5, `useGanttFormats` 4.
- `browser-tests/fixtures/harness-entry.tsx`: cena `?cena=gantt` (Provider; 30 tarefas com datas a partir de hoje;
  7 dependências válidas + 1 para tarefa inexistente; escala de dia em 1000 px e de semana em 340 px).
  `browser-tests/gantt.spec.ts` (novo, limites R18): 10 casos. Os casos existentes não foram editados.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/components/atomic/DataDisplay/SarakGantt/SarakGantt.tsx` | criado | componente e lista (114 linhas) |
| `src/components/atomic/DataDisplay/SarakGantt/GanttTimeline.tsx` | criado | cabeçalho, barras, fundo (200 linhas) |
| `src/components/atomic/DataDisplay/SarakGantt/GanttDependencies.tsx` | criado | setas SVG (88) |
| `src/components/atomic/DataDisplay/SarakGantt/ganttScale.ts` | criado | escala pura (122) |
| `src/components/atomic/DataDisplay/SarakGantt/ganttTasks.ts` | criado | tarefas e dependências (75) |
| `src/components/atomic/DataDisplay/SarakGantt/ganttLayout.ts` | criado | medidas, classes, superfície (39) |
| `src/components/atomic/DataDisplay/SarakGantt/useGanttFormats.ts` | criado | datas por `Intl` (41) |
| `src/components/atomic/DataDisplay/SarakGantt/index.ts` · `__tests__/*` (7) | criado | barril e testes |
| `src/components/atomic/DataDisplay/index.ts` | alterado | `export * from './SarakGantt'` |
| `src/core/i18n/catalogEntries.part6.ts` | alterado | 7 chaves `gantt*` + cabeçalho |
| `browser-tests/fixtures/harness-entry.tsx` | alterado | cena `gantt` |
| `browser-tests/gantt.spec.ts` | criado | 10 casos de navegador |
| `docs/component-catalog.*` · `sarak-ui/*` (4) · `sarak-dev/*` (3) | regenerado | catalog (104) · guide (107) · dev-kit |
| `dist/` (39) · `src/buildInfo.ts` · `src/core/Provider/buildInfo.ts` | regenerado | `npm run build` |

**Verificações executadas** (uma por vez; contagem de processos = 0 antes de cada vitest, build e playwright)
- `npx vitest run src/components/atomic/DataDisplay/SarakGantt` → 7 arquivos, **56/56**.
- **Mutação do §7** (`Math.floor` → `Math.round` em `ganttPixelToDate`, cópia salva e restaurada, `cmp` idêntico) →
  `ganttScale.test.ts` **2 failed / 14 passed**: "pixel → data, com os números…" e "ida e volta: todo pixel de cada
  dia…" (`expected 2026-10-09… to deeply equal 2026-10-08…`).
- **Navegador, 1.ª rodada** (`browser-tests/gantt.spec.ts`, 8 casos) → 8/8 verdes. Uma captura da cena mostrou três
  defeitos que esses 8 não cobravam: a lista presa **translúcida** (barras e marcador de hoje apareciam por trás dela
  ao rolar; o `--sarak-card-bg` do tema default é `rgba(15, 23, 42, 0.6)`); a 1.ª marca e a do dia 1 **cortadas**
  ("de ou", "de no": "2 de out." não cabe em 32 px); setas por cima do texto das barras.
- **Vermelho**, com 2 casos novos contra o `dist/` daquele momento → **2 failed, 8 passed**: fundo opaco
  (`Expected: 1`, `Received: 0.6`) e marcas sem corte (4 rótulos cortados).
- Correções (ver *Decisões*) → `npm run build` → **verde 10/10**; nova captura confirma lista opaca, mês na linha de
  cima ("out. / 2", "nov. / 1") e setas sob as barras.
- Passo 15: `npm run catalog` → 104 componentes · `npm run guide` → 107 componentes · `npm run dev-kit` → 30 gates ·
  `npx tsc --noEmit` → 0 · `npm run build` → exit 0 · `npx vitest run` → **433 arquivos, 2595 testes, 0 falhas** ·
  `check-audit-baseline --with-tsc` → "igual ao baseline de 2026-08-11 — nenhuma regressão".
- `npx playwright test --config=browser-tests/playwright.config.ts` (diretório inteiro) → **65 passed**.
- Gates do `.githooks/pre-commit`, um a um: `plan-index-sync`, `dev-kit --check`, `barrel-parity --check`,
  `catalog --check`, `zero-brand --check`, `consumer-kit --check`, `no-deep-import`, `gate-limits`,
  `container-query-literal`, `container-query-boundary`, `persistence-doc-identifiers`, `class-merge`, `icon-port`,
  `chrome-token-parity`, `trail-citation --staged`, `verificar_commit.py`, `generate-token-types --check` → OK.
  `check-agent-git-write` → FAIL, por definição em sessão de agente.
- `grep` na pasta nova: hexadecimal → vazio; `plan-?[0-9]|veredito` (R36, também no spec e no diff do harness) → vazio;
  `else if` → vazio. `git diff --stat package.json` → vazio (nenhuma dependência nova). Maior arquivo: 200 linhas.

**Critérios de aceite (lote 2)**
- [x] `ganttScale` data ↔ pixel nos três níveis e volta — `ganttScale.test.ts` (números explícitos; todo pixel de cada
  dia por 120 dias, nas 3 escalas) e a mutação acima.
- [x] Duas tarefas com `dependsOn` → **uma** seta; id inexistente não lança e avisa uma vez; ciclo não trava —
  `SarakGantt.test.tsx` (3 casos), `ganttTasks.test.ts`; no navegador, 7 setas para 7 válidas + 1 inexistente.
- [x] `progress` visível, `tone` pelas cores do design, marcador de hoje na faixa visível — `GanttTimeline.test.tsx`
  e navegador ("o marcador de hoje existe, dentro da linha do tempo").
- [x] `Enter` na barra → `onTaskClick` (jsdom, com `userEvent`); lista e linha do tempo com a mesma rolagem vertical
  (navegador: depois de rolar, o topo da linha `t20` na lista e na linha do tempo difere ≤ 1 px).
- [x] Nenhuma medida solta nem texto fixo; nenhuma dependência nova — greps acima, `auditor_hardcoded` no baseline.
- [x] `tsc` 0; baseline igual; build e vitest verdes — acima.
- Pedidos do despacho, todos cobertos em `gantt.spec.ts`: rola na horizontal e a página não; rolagem vertical junta;
  cabeçalho fixo (e lista fixa ao rolar na horizontal); barra de 3 dias com 3 larguras da marca de dia; hoje existe;
  340 px sem rolagem de página (e a lista estreita, sem o grupo); `text-transform: none` na barra.

**Decisões e suposições**
- **Arquivos além dos cinco do §3.1**, todos dentro da pasta nova: `ganttTasks.ts` (tarefa e dependências não são
  escala), `ganttLayout.ts` (classes de container query em `.ts`, o idioma aceito no lote 1) e `useGanttFormats.ts`
  (formatos compartilhados pela lista e pela linha do tempo).
- **"`rowHeight` por token":** não existe token de altura de linha, e criar um seria expansão do dicionário (três
  fontes, fora do território). A altura vem de `--sarak-layout-gap-md` × 2,5, e não há prop `rowHeight`.
- **Uma área de rolagem só**, no lugar de duas sincronizadas por evento: a sincronia vertical vem por construção, e o
  `sticky` do cabeçalho continua funcionando (com duas áreas, a da linha do tempo rolaria na horizontal e prenderia o
  `sticky` dela).
- **Fundo do que fica preso:** a cor do cartão em camada (`linear-gradient`) sobre `--color-theme-body`, que é
  variável real do tema (`src/styles/_theme.css:7`). Só a cor do cartão não basta quando o tema a deixa translúcida.
- `progress` é percentual 0–100. A semana da escala começa na segunda (ISO 8601), sem prop. A tarefa com início
  ilegível não aparece, como no calendário.
- Escala de mês: o rótulo é o texto do `Intl` como vem ("out. de 2026"), sem capitalizar.

**Achados fora do escopo (não corrigidos)**
- `src/components/atomic/DataDisplay/SarakCalendar/calendarEvents.ts:92` (`calendarToneColor`): um tom fora da união
  (`neutral`) devolve `undefined`, e o chip fica sem fundo nem marca. É a causa do aviso do veredito do lote 1. No Gantt
  o fallback foi feito por cima (`ganttToneColor`); o calendário segue como está.
- `--sarak-card-bg`/`--color-theme-card` são translúcidos no tema default. Outro componente da lib que prenda algo
  com `sticky` sobre conteúdo rolando, usando só essa cor, mostrará o conteúdo por trás.

**Pendências / riscos**
- Não medido em navegador: outros temas além do default, as escalas de semana e mês no contêiner largo, toque e gesto
  em aparelho, leitor de tela real, e volume perto de 500 tarefas (a cena tem 30).
- O marcador de hoje depende do relógio da máquina: a cena monta as datas a partir de hoje para o caso não envelhecer.

## Resumo da execução (correção 1 do lote 2) — 2026-10-09

**Resultado:** Concluído

**Estado do worktree ao iniciar**
```
 M browser-tests/fixtures/harness-entry.tsx
 M docs/component-catalog.json
 M docs/component-catalog.md
 M sarak-dev/GUIA-MANUTENCAO.md
 M sarak-dev/START-HERE.md
 M sarak-dev/state.json
 M sarak-ui/GUIA-FRONTEND.md
 M sarak-ui/START-HERE.md
 M sarak-ui/VERSION
 M sarak-ui/catalog.json
 M specs/00-indice.md
 M specs/plan/plan-103-calendario-e-gantt-de-projetos.md
 M src/buildInfo.ts
 M src/components/atomic/DataDisplay/index.ts
 M src/core/Provider/buildInfo.ts
 M src/core/i18n/catalogEntries.part6.ts
?? browser-tests/gantt.spec.ts
?? src/components/atomic/DataDisplay/SarakGantt/
```
(mais as 39 entradas de `dist/` do build do lote 2). `specs/00-indice.md` é do revisor e não foi tocado.

**Um item por achado**

1. **Altura do host.** A raiz passou a ser coluna flex com `height: 100%` (`SarakGantt.tsx:99`), e a área que rola
   recebe `GANTT_SCROLL_HEIGHT = { flex: '1 1 auto', minHeight: '100%', maxHeight: GANTT_MAX_HEIGHT }`
   (`ganttLayout.ts:37`, aplicado em `SarakGantt.tsx:104`). Com host de altura definida, o `min-height: 100%` resolve
   para a altura dele e vence o teto; sem altura no host, o percentual não resolve e o teto manda. **Medi o desenho
   antes de escolher**, no Chromium, numa página `<!doctype html>` com conteúdo de 2000 px:
   - `max-height: max(teto, 100%)` → no host sem altura vira `none` e cresce até 2000. Descartado.
   - `max-height: teto` (o de antes) → no host de 420 fica no teto. Descartado.
   - `min-height: 100%` + `max-height: teto` → host 420 → 420; 1000 → 1000; sem altura → o teto; sem altura e conteúdo
     de 50 px → 50. **Escolhido.**

   Depois da correção, na cena `gantt-altura`: host 1000 × 420 → raiz 420, área 420; host 340 × 360 → raiz 360, área 360.
2. **Contraste do título da barra — caminho: rótulo fora do preenchimento.** Uma cor "sobre" por tom não existe no
   dicionário (só há `--color-theme-on-primary`), e criar seis seria expansão de token fora do território. Então:
   - o progresso virou uma **faixa fina na base** da barra (`insetBlockEnd: 0`, altura
     `calc(var(--sarak-layout-gap-sm) * 0.375)`, `GanttTimeline.tsx:44`), e não fica mais por trás do título;
   - a trilha da barra ficou **opaca**: o tom a 22% misturado à cor de fundo do tema
     (`color-mix(in srgb, <tom> 22%, var(--color-theme-body, Canvas))`, `GanttTimeline.tsx:117`). O título fica sobre
     uma cor que está perto do fundo do tema, e o texto principal do tema já contrasta com esse fundo.

   Medido depois: escuro, texto `rgb(255, 255, 255)` sobre trilha `color(srgb 0.015 0.224 0.235)`; claro, texto
   `rgb(15, 23, 42)` sobre `color(srgb 0.776 0.785 0.801)`. Todas as barras visíveis ≥ 4,5:1 nos dois temas (caso 4b).
3. **Tom desconhecido no calendário.** `calendarToneColor` (`calendarEvents.ts:96`) cai em `primary` quando o tom não é
   chave **própria** do mapa (`Object.prototype.hasOwnProperty.call`). Assim `neutral`, `constructor` e `toString`
   viram `primary`. Teste em `calendarEvents.test.ts`. O `ganttToneColor` ficou como estava (já fazia o fallback).
4. **Casos de navegador**, em dois specs irmãos novos (os existentes não foram editados):
   `browser-tests/gantt-altura-e-contraste.spec.ts` (5 casos) e `browser-tests/calendario-tom.spec.ts` (1 caso), com
   limites R18. Harness: cenas `gantt-altura` (hosts 1000 × 420 e 340 × 360) e `calendario-tom` (um evento de tom
   `neutral` lido de JSON e um `primary`), mais o parâmetro `?tema-ativo=<id>` → `activeThemeId` do Provider
   (`harness-entry.tsx:311-312`); ausente, é `undefined`, como antes. O contraste é medido pela pilha de
   `elementsFromPoint` sob 5 pontos do rótulo, compondo os `background-color` computados até ficar opaco, com a
   luminância da WCAG 2.x; vale o pior ponto. Um caso de pré-condição prova que o tema claro foi de fato ligado.
   - **Vermelho**, contra o `dist/` do lote 2 (gerado às 17:33) → **4 failed, 2 passed**:
     (a) altura: `root − host` = **300** (720 num host de 420);
     (b) contraste no **escuro**: 10 barras abaixo de 4,5, a pior **1,39:1** (`t6`); no **claro**: 2 barras, a pior
     **1,01:1** (`t6`) e `t5` com 3,58:1;
     (c) calendário: fundo do chip de tom desconhecido `rgba(0, 0, 0, 0)`.
     Passaram: o teto sem altura no host e a pré-condição do tema claro.
   - **Verde**, depois de `npm run build`: os 6 casos passam; Playwright do diretório inteiro → **71 passed**.

**Arquivos alterados nesta rodada**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/components/atomic/DataDisplay/SarakGantt/SarakGantt.tsx` | alterado | raiz em coluna com `height: 100%`; área com `GANTT_SCROLL_HEIGHT` |
| `src/components/atomic/DataDisplay/SarakGantt/ganttLayout.ts` | alterado | `GANTT_SCROLL_HEIGHT` |
| `src/components/atomic/DataDisplay/SarakGantt/GanttTimeline.tsx` | alterado | progresso em faixa na base; trilha opaca |
| `src/components/atomic/DataDisplay/SarakCalendar/calendarEvents.ts` | alterado | fallback de tom para `primary` |
| `…/SarakGantt/__tests__/{SarakGantt,GanttTimeline}.test.tsx`, `ganttLayout.test.ts`, `…/SarakCalendar/__tests__/calendarEvents.test.ts` | alterado | 4 casos novos |
| `browser-tests/fixtures/harness-entry.tsx` | alterado | cenas `gantt-altura`, `calendario-tom`; `?tema-ativo=` |
| `browser-tests/gantt-altura-e-contraste.spec.ts` · `browser-tests/calendario-tom.spec.ts` | criado | 6 casos de navegador |
| `dist/` · `src/buildInfo.ts` · `src/core/Provider/buildInfo.ts` | regenerado | `npm run build` |

**Verificações executadas** (uma por vez; contagem de processos = 0 antes de cada vitest, build e playwright)
- `npx vitest run src/components/atomic/DataDisplay/SarakGantt src/components/atomic/DataDisplay/SarakCalendar` →
  11 arquivos, **97/97**.
- `npm run build` → exit 0.
- Playwright: vermelho e verde, como no item 4; diretório inteiro → **71 passed**.
- `npx tsc --noEmit` → 0 erros.
- `check-audit-baseline --with-tsc` → "igual ao baseline de 2026-08-11 — nenhuma regressão".
- Superfície pública sem mudança: `catalog --check`, `consumer-kit --check` e `dev-kit --check` → OK, sem regenerar.
  `container-query-literal` e `gate-limits` → OK.
- Hexadecimal e R36 nos arquivos tocados → vazios.
- Suíte completa do vitest **não** rodada nesta rodada; o prompt pediu as duas pastas.

**Decisões e suposições**
- Contraste pelo caminho "rótulo fora do preenchimento" (item 2), porque não há cor "sobre" por tom no dicionário.
- Com host de altura definida e pouco conteúdo, a área ocupa o host inteiro (sobra espaço vazio embaixo). É a leitura
  literal de "ocupam a altura do host".
- O spec de contraste lê só `background-color` (declarado no limite 1); na cena não há imagem nem gradiente atrás das
  barras.

**Achados fora do escopo (não corrigidos)**
- **No `minimalist-airy` o marcador de hoje some, e as linhas divisórias do Gantt também.** O tema define
  `--sarak-border-width: 0px` (medido), e o marcador usa `calc(var(--sarak-border-width) * 2)` como espessura
  (`GanttTimeline.tsx`, `GanttBackdrop`). Medido: escuro → 2px; claro → **0px**. Vi isso na captura do tema claro desta
  rodada. O caso de navegador "o marcador de hoje existe" mede só caixa e altura no tema escuro, por isso não pegou.
  É defeito do lote 2, mas não está entre os quatro achados.

**Pendências / riscos**
- Contraste medido só nos dois temas nomeados e na posição inicial de rolagem; os demais temas de referência não
  foram medidos.

## Resumo da execução (correção 2 do lote 2) — 2026-10-09

**Resultado:** Concluído

**Estado do worktree ao iniciar**
```
 M browser-tests/fixtures/harness-entry.tsx
 M docs/component-catalog.json
 M docs/component-catalog.md
 M sarak-dev/GUIA-MANUTENCAO.md
 M sarak-dev/START-HERE.md
 M sarak-dev/state.json
 M sarak-ui/GUIA-FRONTEND.md
 M sarak-ui/START-HERE.md
 M sarak-ui/VERSION
 M sarak-ui/catalog.json
 M specs/00-indice.md
 M specs/plan/plan-103-calendario-e-gantt-de-projetos.md
 M src/buildInfo.ts
 M src/components/atomic/DataDisplay/SarakCalendar/__tests__/calendarEvents.test.ts
 M src/components/atomic/DataDisplay/SarakCalendar/calendarEvents.ts
 M src/components/atomic/DataDisplay/index.ts
 M src/core/Provider/buildInfo.ts
 M src/core/i18n/catalogEntries.part6.ts
?? browser-tests/calendario-tom.spec.ts
?? browser-tests/gantt-altura-e-contraste.spec.ts
?? browser-tests/gantt.spec.ts
?? src/components/atomic/DataDisplay/SarakGantt/
```
(mais as 39 entradas de `dist/` do build da correção 1). `specs/00-indice.md` é do revisor e não foi tocado.

**Achado 1 — marcador de hoje com espessura própria**
- **Escolha: piso sobre o token, declarado como exceção.** `GANTT_TODAY_THICKNESS =
  'max(2px, calc(var(--sarak-border-width, 1px) * 2))'` (`GanttTimeline.tsx:49`), usado em `GanttTimeline.tsx:176`. O
  marcador segue o dobro da borda do tema quando ela existe (um tema de borda grossa engrossa o marcador), e nunca
  fica abaixo de 2 px. O `2px` carrega o marcador `sarak-allow-hardcode` com o motivo (`GanttTimeline.tsx:48`), no
  idioma de exceção que o `auditor_hardcoded` aceita. O JSDoc da constante explica por que o marcador não pode zerar
  e as linhas divisórias podem.
- As linhas divisórias continuam seguindo `--sarak-border-width`, sem mudança (somem no `minimalist-airy`, como o tema quer).
- jsdom (`GanttTimeline.test.tsx`): a constante tem o piso e o token, e o estilo do marcador a usa.
- **Caso de navegador novo** em `browser-tests/gantt-altura-e-contraste.spec.ts`: o mesmo caso nos dois temas
  (`?tema-ativo=minimalist-airy` e o padrão). Ele cobra `border-inline-start-width` computada > 0, largura da caixa
  > 0 e a caixa dentro de `[data-gantt-timeline]`. Acrescentei também uma linha no cabeçalho do spec. O caso
  "o marcador de hoje existe" (`gantt.spec.ts`) não foi editado.
  - **Vermelho**, contra o `dist/` da correção 1 (gerado às 18:12), filtrando só esses casos: **1 failed, 1 passed**. No
    claro, espessura `Expected: > 0`, `Received: 0`; o escuro passou (2 px).
  - **Verde**, depois de `npm run build`: os dois passam.

**Arquivos alterados nesta rodada**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/components/atomic/DataDisplay/SarakGantt/GanttTimeline.tsx` | alterado | `GANTT_TODAY_THICKNESS` (piso declarado) no marcador |
| `src/components/atomic/DataDisplay/SarakGantt/__tests__/GanttTimeline.test.tsx` | alterado | 1 caso novo |
| `browser-tests/gantt-altura-e-contraste.spec.ts` | alterado | 2 casos novos (claro e escuro) e uma linha no cabeçalho |
| `dist/` · `src/buildInfo.ts` · `src/core/Provider/buildInfo.ts` | regenerado | `npm run build` |

**Verificações executadas** (uma por vez; contagem de processos = 0 antes de cada vitest, build e playwright)
- `npx vitest run src/components/atomic/DataDisplay/SarakGantt src/components/atomic/DataDisplay/SarakCalendar` →
  11 arquivos, **98/98**.
- `npm run build` → exit 0.
- `npx playwright test --config=browser-tests/playwright.config.ts` (diretório inteiro) → **73 passed**.
- `npx vitest run` (suíte completa) → **433 arquivos, 2600 testes, 0 falhas**.
- `npx tsc --noEmit` → 0 erros.
- `check-audit-baseline --with-tsc` → "igual ao baseline de 2026-08-11 — nenhuma regressão".
- `node gates/scripts/audit/auditor_hardcoded.mjs` → nenhum apontamento em `SarakGantt/`. R36 nos arquivos tocados → vazio.

**Decisões e suposições**
- Piso de 2 px, o mesmo valor que o marcador tinha no tema padrão (`1px × 2`); acima disso, vale o token.

**Achados fora do escopo (não corrigidos)**
- Nenhum novo.

**Pendências / riscos**
- O piso foi medido nos dois temas da cena; os demais temas de referência não foram medidos.

---

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->

## Veredito — 2026-10-09 (lote 1) — 🔴 Reprovado

**Medido pelo revisor no navegador (§7), sem tocar o repositório:** um harness numa pasta temporária, empacotado
pelo esbuild contra o `dist/` do executor, com o `SarakCalendar` dentro do `SarakUIProvider`, 12 eventos (2 de 3
dias, 4 no mesmo dia), em dois contêineres — 1000 px e 340 px —, no Chromium do Playwright.

- **Estreito (340 px), o que a plan pede:** nenhuma rolagem horizontal (`scrollWidth` 340 = `clientWidth` 340); o
  chip vira um ponto de 9 px com `pointer-events: none`; tocar em cima dele chama `onDayClick` com o dia. "+2" acima
  do limite; hoje marcado. ✅
- **Largo (1000 px):** sem rolagem; o clique no chip chama `onEventClick` com o evento; os eventos de 3 dias cobrem
  os 3 dias. ✅
- A lógica (`calendarEvents.ts`), o teclado, o `role="grid"`, o idioma por `Intl`, o modo controlado e não
  controlado e a mutação do lote 1 (3 falhas) conferem com o resumo. O `calendarLayout.ts` em `.ts` segue o idioma
  da base (`kanbanLayout.ts`) e o limite do `auditor_hardcoded` (só `.tsx`) — aceito; o limite vai ao backlog.

**Achados — os três vistos só em navegador**

1. **O ponto não some no contêiner largo.** O ponto tem a classe `@min-[768px]:hidden` (`CALENDAR_CHIP_DOT_CLASS`),
   mas o próprio estilo inline dele declara `display: 'inline-block'` (`CalendarDayCell.tsx:96`), e o estilo inline
   vence a classe: no largo, o ponto (9 px) aparece junto do título em todo chip — acima do chip, nos eventos de
   vários dias. O título, que não tem `display` inline, obedece à container query. Tire o `display` do estilo
   inline e deixe a classe decidir nos dois tamanhos.
2. **O título do evento sai em caixa alta, negrito pesado e espaçamento largo, e corta cedo** ("SPRINT REVIEW LO"
   em 137 px). O chip é um `SarakButton`, e herda `font-black uppercase tracking-widest` do átomo. Título de evento é
   conteúdo, não ação: o chip passa `normal-case tracking-normal` e um peso de texto comum por `className` (a classe
   do chamador vence a do átomo — R35), como o painel faz nos rótulos.
3. **O cabeçalho escreve "Outubro De 2026".** O `textTransform: 'capitalize'` (`SarakCalendar.tsx:102`) põe em
   maiúscula **cada** palavra do texto do `Intl` ("outubro de 2026"); em português a preposição fica minúscula.
   Capitalize só a primeira letra, no texto — e confira que o mesmo não ocorre em outro idioma do catálogo.
4. **Prova durável.** Os três escaparam do `jsdom`. Acrescente um caso de navegador para o calendário em
   `browser-tests/` (cena nova no `harness-entry.tsx` por `?cena=`, num `.spec.ts` irmão ou no
   `css-que-so-o-navegador-mede.spec.ts`), com o calendário dentro do Provider em dois contêineres: no estreito,
   nenhuma rolagem horizontal, ponto visível e título escondido; no largo, ponto escondido, título visível e
   `text-transform: none` no chip. Mostre o caso **vermelho** contra o `dist/` de antes da correção e verde depois.
   Autorizado tocar `browser-tests/` só para isso; os casos que já existem continuam sem edição.

**Para o backlog:** itens 21 (`auditor_hardcoded` só varre `.tsx`) e 22 (`SarakBadge` com cores Tailwind fixas).

Status: `🔵 Em correção`.

## Veredito — 2026-10-09 (lote 1, correção 1) — 🟢 Aprovado (lote 1 — liberação parcial)

**Medido de novo pelo revisor no navegador**, com o mesmo harness temporário (calendário dentro do Provider, 1000 e
340 px), contra o `dist/` desta rodada: no largo, o ponto não aparece mais entre os elementos visíveis do dia, e o
chip computa `text-transform: none`, sem `font-black` nem `tracking-widest` (os títulos leem "Sprint review longa");
o cabeçalho diz "Outubro de 2026". O estreito segue certo: nenhuma rolagem horizontal (340 = 340), ponto de 9 px com
`pointer-events: none`, toque no ponto chama `onDayClick`; no largo, o clique no chip chama `onEventClick`.
`browser-tests/calendario.spec.ts` → **4/4**. O executor mostrou o caso vermelho contra o `dist/` anterior (largo: o
ponto `inline-block` e o chip `uppercase`) e 55/55 no diretório inteiro depois.

**Os quatro achados fecharam.** O `display` saiu do estilo inline do ponto, e a classe decide nos dois tamanhos
(`inline-block @min-[768px]:hidden`); o chip passa `normal-case tracking-normal font-normal` (R35), com teste em
jsdom; o título capitaliza só a primeira letra no idioma da lib (os seis idiomas testados), e o `aria-label` usa o
texto cru do `Intl`; o caso de navegador ficou como regressão.

**Aviso, sem achado:** o evento de tom `neutral` desenha só o texto, sem fundo nem marca lateral de chip — fica
distinto dos outros cinco tons. Avaliar no lote 2, se o Gantt reusar os tons.

**Liberação parcial.** Status volta a `🟡 Em execução`; o lote 2 (o Gantt) pode ser despachado.

## Veredito — 2026-10-09 (lote 2) — 🔴 Reprovado

**Medido pelo revisor no navegador (§7):** harness temporário contra o `dist/` desta rodada, `SarakGantt` dentro do
`SarakUIProvider` com 30 tarefas e 8 dependências, nas três escalas (hosts de 1000 × 420 px) e num host estreito
(340 × 360 px), em **dois temas** — o padrão (`sarak-sovereign`, escuro) e o `minimalist-airy` (claro), cada um numa
página.

- **O que confere, nos dois temas:** a página não rola na horizontal (1200 = 1200); a linha do tempo rola sozinha nas
  escalas de dia e semana e cabe na de mês; a barra de uma tarefa de 3 dias mede 3 dias em cada escala (96 = 3 × 32,
  36 = 3 × 12, 12 = 3 × 4); as setas aparecem; a barra tem `text-transform: none` e o clique chama `onTaskClick`; a
  lista presa é opaca (cor do cartão em camada sobre a cor do corpo); nenhum erro no console.
- Pelo executor, conferido no resumo: mutação do §7 (2 falhas), 56 testes da pasta, suíte 433/2595, 65 casos de
  navegador, `tsc` 0, baseline igual, nenhuma dependência nova, maior arquivo com 200 linhas. Os três defeitos visuais
  que o próprio caso de navegador achou (lista translúcida, marcas cortadas, setas por cima) foram consertados com
  caso vermelho antes.

**Achados — os dois vistos só em navegador, e só fora do caso do executor (que mede um tema e um host sem altura)**

1. **O Gantt não cabe no contêiner do host.** A região de rolagem tem altura própria — `maxHeight` de
   `GANTT_MAX_HEIGHT` (`calc(16px × 30)` = 720 px, `ganttLayout.ts:29`) — e ignora a altura do pai: num host de 420 px,
   a raiz e a região medem **720 px**, e o Gantt invade o que vem abaixo (no host estreito de 360 px, idem). O
   componente se adapta ao contêiner ([[07-responsividade-e-multidispositivo]] §6.1), não impõe a própria medida:
   com host de altura definida, a raiz e a região ocupam **a altura do host** e rolam por dentro; sem altura no host,
   vale o teto de hoje.
2. **No tema claro, o título some sobre a parte preenchida da barra.** A cor do texto da barra é fixa
   (`var(--sarak-text-main, …)`, `GanttTimeline.tsx:114`) e não acompanha o preenchimento: no `minimalist-airy` a
   primária é quase preta e o texto também é escuro — em "Tarefa 6 do projeto" só aparece "ojeto", na parte fora do
   progresso. No tema escuro o mesmo texto é legível por acaso (primária ciano, texto claro). O texto sobre o
   preenchimento precisa contrastar **com a cor do tom** em qualquer tema (por exemplo, a cor "sobre" do tom, ou um
   rótulo fora do preenchimento); prove o contraste ≥ 4,5:1 no tema claro **e** no escuro.
3. **O calendário fica sem cor para tom desconhecido** (o próprio executor apontou, `calendarEvents.ts:92`): o Gantt já
   cai em `primary` quando o tom não é da união; o `SarakCalendar` devolve `undefined`, e o chip fica sem fundo nem
   marca. É desta plan e é o mesmo caso: dê ao calendário o mesmo fallback.
4. **Os casos de navegador cobrem os dois achados acima.** No `gantt.spec.ts` (ou irmão): um host com altura fixa →
   a raiz não passa da altura do host; e a cena num tema claro (por `activeThemeId`) → contraste do texto da barra
   sobre o preenchimento ≥ 4,5:1, também no escuro. No `calendario.spec.ts`: um evento com tom fora da união tem fundo
   visível. Mostre cada caso **vermelho** contra o `dist/` atual e verde depois; os casos existentes seguem sem edição.

Status: `🔵 Em correção`.


## Veredito — 2026-10-09 (lote 2, correção 1) — 🔴 Reprovado

**Medido de novo pelo revisor no navegador**, com o mesmo harness temporário (30 tarefas, 8 dependências, três
escalas, hosts de 1000 × 420 e 340 × 360, temas `sarak-sovereign` e `minimalist-airy`), contra o `dist/` desta rodada:

- **Os quatro achados do veredito anterior fecharam.** A raiz mede a altura do host nos dois temas (420 = 420, 360 = 360)
  e a página não rola na horizontal; no tema claro, os títulos são legíveis sobre a trilha da barra (o progresso virou
  uma faixa fina na base, e a trilha é o tom misturado à cor do corpo); o calendário cai em `primary` para tom fora da
  união. O executor mostrou os seis casos de navegador novos **vermelhos** contra o `dist/` anterior (altura +300 px;
  contraste pior 1,39:1 no escuro e 1,01:1 no claro; chip sem fundo) e verdes depois, com 71/71 no diretório inteiro.
  O desenho da altura foi **medido antes de escolhido** (três alternativas, com números) — é o que se espera.

**Achado** (o próprio executor o encontrou e o relatou fora do escopo da rodada; é deste lote):

1. **O marcador de hoje some num tema que zera a borda.** A espessura dele é `calc(var(--sarak-border-width, 1px) * 2)`
   (`GanttTimeline.tsx:169`), e o `minimalist-airy` declara `--sarak-border-width: 0px`: medido pelo revisor, o
   marcador tem **2 px** no tema escuro e **0 px** no claro, e não aparece. As linhas divisórias somem pelo mesmo
   motivo — essas, por desenho do tema (ele não quer borda) —, mas o marcador é **informação**, não decoração: não pode
   depender de um token que o tema tem direito de zerar. Dê a ele uma espessura própria que não chegue a zero (uma
   hairline declarada, como as que a base já aceita como exceção, ou um piso sobre o token) e prove com um caso de
   navegador: no `minimalist-airy`, a largura computada do marcador é > 0 e ele fica dentro da linha do tempo —
   **vermelho** contra o `dist/` atual, verde depois. O caso "o marcador de hoje existe" que já existe fica sem edição.

Status: `🔵 Em correção`.


## Veredito — 2026-10-09 (lote 2, correção 2) — 🟢 Aprovado

**Medido de novo pelo revisor no navegador**, com o mesmo harness temporário, contra o `dist/` desta rodada: o marcador
de hoje tem `border-inline-start-width` de **2 px** nos dois temas (`sarak-sovereign` e `minimalist-airy`), nas três
escalas e no host estreito (era 0 px no claro); a raiz segue na altura do host (420 = 420, 360 = 360) e a página não
rola na horizontal.

**O achado fechou.** `GANTT_TODAY_THICKNESS = max(2px, calc(var(--sarak-border-width, 1px) * 2))`: o marcador segue o
dobro da borda do tema quando ela existe e nunca fica abaixo de 2 px; o `2px` carrega o marcador de exceção com o
motivo, e as divisórias continuam seguindo o token. O caso de navegador novo ficou **vermelho** no claro contra o
`dist/` anterior (`Received: 0`) e verde depois; pelo executor, 73/73 no diretório de navegador, suíte completa
433/2600, `tsc` 0, baseline igual e `auditor_hardcoded` sem apontamento na pasta.

**A plan está completa** (lotes 1 e 2). Status: `🟢 Aprovada`. A síntese (§8) espera o commit e o seu sinal.

---

# 11. Síntese

<!-- Preenchido pelo REVISOR na síntese (00-prompt-revisor.md §7.4), imediatamente antes da remoção da plan.
     Append-only. O que foi transportado, e o que ficou de fora. -->
