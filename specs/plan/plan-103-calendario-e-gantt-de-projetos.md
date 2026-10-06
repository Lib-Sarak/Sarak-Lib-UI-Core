---
tipo: "plan"
titulo: "Dar à lib as visões de calendário mensal e de Gantt para a gestão de projetos"
objetivo: "Dar a lib um calendario mensal de eventos e um Gantt com dependencias, ambos com tema, teclado e celular, para que um sistema de projetos monte as visoes do quadro sem refazer a mao"
dominio: "Sarak-Lib-UI-Core / DataDisplay / Gestão de projetos"
status: "🔴 A executar"
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

---

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->

---

# 11. Síntese

<!-- Preenchido pelo REVISOR na síntese (00-prompt-revisor.md §7.4), imediatamente antes da remoção da plan.
     Append-only. O que foi transportado, e o que ficou de fora. -->
