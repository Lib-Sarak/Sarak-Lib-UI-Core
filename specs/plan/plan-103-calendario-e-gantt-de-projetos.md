---
tipo: "plan"
titulo: "Dar à lib as visões de calendário mensal e de Gantt para a gestão de projetos"
objetivo: "Dar a lib um calendario mensal de eventos e um Gantt com dependencias, ambos com tema, teclado e celular, para que um sistema de projetos monte as visoes do quadro sem refazer a mao"
dominio: "Sarak-Lib-UI-Core / DataDisplay / Gestão de projetos"
status: "🟡 Em execução"
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

---

# 11. Síntese

<!-- Preenchido pelo REVISOR na síntese (00-prompt-revisor.md §7.4), imediatamente antes da remoção da plan.
     Append-only. O que foi transportado, e o que ficou de fora. -->
