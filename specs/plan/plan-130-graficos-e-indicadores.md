---
tipo: "plan"
titulo: "Dar aos gráficos e indicadores formato, referência e meta"
objetivo: "Fazer SarakChartEngine, SarakStats, SarakSparkline, SarakProgress e SarakKanban exibirem valor financeiro formatado no idioma da tela, com altura própria, linhas e faixas de referência, zoom, meta, delta percentual com semântica invertida e soma por coluna, e remover o SarakChart"
dominio: "Gráficos / Indicadores"
status: "🟢 Aprovada"
prioridade: "Alta"
tags: ["plan", "rc.4", "graficos", "indicadores", "erp"]
relacionados: ["[[anexos/rc4-contrato]]", "[[plan-128-idioma-unico-e-feedback-rico]]", "[[03-superficie-publica]]"]
depende_de: "plan-128-idioma-unico-e-feedback-rico"
retida_por: ""
destino_sintese: "—"
---

# 1. Objetivo

Itens Gráficos 1–7 e Feedback 4 do contrato entregues; `SarakChart` fora do barril, com o de/para na nota.

# 2. Contexto

Contrato aceito: [`anexos/rc4-contrato.md`](anexos/rc4-contrato.md) §2.4–§2.6, §2.9 (Kanban), §5 Q7. **Nomes, tipos e padrões de lá são lei.**

O que a leitura revelou: `SarakChartEngineProps` em `src/components/engines/charts/SarakChartEngine.tsx:23`; as opções ECharts saem
de `SubEngines/seriesModel.ts` (`buildChartOption`) e `SubEngines/builders/`; props só do ECharts são avisadas no Recharts por
`ECHARTS_ONLY_PROPS` (`:20`) — as novas entram nessa lista. `SarakStatsMetricConfig` em `Templates/SarakStats.tsx:15`; o valor é
desenhado por `Atoms/SarakValue.tsx`, que **já** tem `signColor`. `SarakSparkline` (`DataDisplay/SarakSparkline.tsx:16`),
`SarakProgress` (`Feedback/SarakProgress.tsx:14`), tipos do Kanban em `DataDisplay/SarakKanban/kanbanTypes.ts:19`. `SarakChart` é
exportado por `Templates/index.ts:10`; o ERP não o usa. O locale vem de `useSarakLanguage()` (`plan-128`).

# 3. Escopo

## 3.1 Dentro
- `src/components/engines/charts/` — props novas e builders.
- `src/components/atomic/Templates/SarakStats.tsx` (+ `hooks/` dele).
- `src/components/atomic/DataDisplay/SarakSparkline.tsx`, `src/components/atomic/Feedback/SarakProgress.tsx`.
- `src/components/atomic/DataDisplay/SarakKanban/` — `value`, `valueFormat`, `columnTotal`.
- **Remoção:** `Templates/SarakChart.tsx`, seus testes, a linha em `Templates/index.ts`, o registro dele onde houver (registros de
  componente, paridade, manifesto) e código que só ele usa — provado por `grep` colado no resumo.
- `src/core/i18n/catalogEntries.charts.ts` · `src/index.ts` (acréscimo/remoção da linha do `SarakChart`) ·
  `docs/migracoes.md` (uma subseção na `## 8.0.0`: Q7 com de/para e as props novas).

## 3.2 Fora
- Gráfico novo, motor novo, dependência nova.
- `SarakSparkline`/`SarakProgress` além das props do contrato.
- Arquivos gerados; `catalog.ts`.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Contrato | `specs/plan/anexos/rc4-contrato.md` §2.4–§2.6, §2.9, §5 Q7, **§9** | o que entregar e como verificar |
| Spec fixa | `arquitetura/03-superficie-publica.md` | remoção do barril |
| **Skill** | `padrao-escrita` + `padrao-typescript` · `ui-refatorar-componente` (remoção) · `ui-arquitetura-design` | sempre · remover sem quebrar paridade · cor só por token de status |
| Código | arquivos de §2 | ler antes de editar |

# 5. Instruções de execução

1. Fotografe o worktree.
2. `SarakChartEngine`: §2.4 inteiro; `valueFormat` usa os `sarakFormat*` com o locale do hook, no eixo, na dica e nos rótulos; tons de
   referência só pelos tokens de status; props novas na lista de aviso do Recharts.
3. `SarakStats`: §2.5; `goodDirection: 'down'` inverte a cor, nunca a seta.
4. `SarakSparkline`, `SarakProgress`: §2.6 (`aria-valuenow` com o valor real quando `allowOverflow`).
5. Kanban: soma por coluna no cabeçalho só quando algum cartão tem `value`.
6. Remova o `SarakChart` (§3.1) com a skill `ui-refatorar-componente`.
7. Subseção em `docs/migracoes.md`; `npm run barrel:check`; `npm run verify -- --tier=quick` uma vez, resumo colado (contrato §9).

# 6. Critérios de aceite

- [ ] Cada prop de §2.4–§2.6 e do Kanban com teste que falharia sem ela (opção ECharts capturada, como em `SarakChartEngine.formats.test.tsx`).
- [ ] `valueFormat` em BRL no eixo e na dica com locale `pt-BR` e `en-US` — teste.
- [ ] Gauge sem `%` quando `valueFormat` não é percentual; pizza com `pieLabel: 'percent'` — teste.
- [ ] Stats: despesa subindo com `goodDirection: 'down'` sai no tom de erro com seta para cima — teste.
- [ ] `SarakChart` ausente do barril (`barrel:check` verde) e sem referência em `src/` (grep colado).
- [ ] Sem prop nova, comportamento da rc.3 (testes existentes passam sem alteração).
- [ ] Resumo com a tabela item do contrato → teste.

# 7. Como verificar (uso do revisor)

**Gate:** nenhum — comportamento provado por teste; a remoção é cobrada pelo `barrel:check` que já existe.

- `npx vitest run src/components/engines/charts SarakStats SarakSparkline SarakProgress SarakKanban src/core/i18n` — uma vez (filtro
  por nome: não pega o trabalho em andamento das plans paralelas).
- `grep -rn "SarakChart\b" src` → vazio.
- Diff lido contra o contrato; `git diff --stat` só com a §3.1. O `quick` do executor é aceito pelo resumo colado.

# 8. Destino da síntese

**Destino:** `—` — superfície documentada pelo catálogo gerado e pela nota de migração; nenhuma regra muda.

---

# 9. Resumo da execução

## Resumo da execução — 2026-10-27

**Resultado:** Concluído com pendências (as pendências são de arquivo de outra plan e de gerado — ver abaixo)

**Estado do worktree ao iniciar**
(limpo)

**O que foi feito**
- `SubEngines/chartEnhancements.ts` (novo): `createChartValueFormatter` (usa os `sarakFormat*` com o locale) e `applyChartEnhancements` — formato no eixo de valor (esquerdo/direito), dica (`tooltip.valueFormatter`, por série quando há `series[].format`), `markLine`/`markArea` por tom de status, `dataZoom`, rótulo da pizza, escala e `detail.formatter` do gauge.
- `SubEngines/seriesModel.ts`: `buildChartOption` termina chamando `applyChartEnhancements`; `ChartSeriesDefinition.format`.
- `SarakChartEngine.tsx`: props `valueFormat`, `series[].format`, `height`, `referenceLines`, `referenceBands`, `zoom`, `pieLabel`, `gauge`; locale de `useSarakLanguage()`; `height` no contêiner; as props novas entram em `ECHARTS_ONLY_PROPS`. Tipos novos em `builders/types.ts`, exportados em `src/index.ts`.
- `Templates/SarakStatsDelta.tsx` (novo) e `SarakStats.tsx`: `signColor`, `goodDirection`, `deltaFormat`, `deltaLabel`, `target`/`targetLabel`, `sparkline`. Texto "Meta" em `catalogEntries.charts.ts` (`statsTargetLabel`, 6 idiomas).
- `SarakSparkline.tsx`: `baseline` (`'zero'` inclui o zero na escala e desenha a linha de base; barras partem dela).
- `SarakProgress.tsx`: `allowOverflow` (`aria-valuenow` com o valor real, barra cheia, trecho do excesso em `--sarak-status-warning-color`), `showValue`, `valueFormat`.
- Kanban: `SarakKanbanCard.value`, `SarakKanbanProps.valueFormat` e `columnTotal`; `sarakColumnTotal` em `kanbanModel.ts`; soma no cabeçalho da coluna só quando algum cartão tem `value`.
- Remoção do `SarakChart`: componente, teste, snapshot, `useChartData` (+ teste, só ele usava), linha em `Templates/index.ts`, `digitalTwins` em `data_and_charts.json`, e a menção em textos de `motion.ts`/`manifest.ts`; `npm run token-types` regenerou `design-token-docs.json` (2 linhas).
- `docs/migracoes.md`: subseção "Gráficos e indicadores…" na `## 8.0.0`, com o de/para da Q7.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/components/engines/charts/SubEngines/chartEnhancements.ts` | criado | formato, referência, zoom, pizza, gauge |
| `src/components/engines/charts/SubEngines/seriesModel.ts` | alterado | chama a camada nova; `format` na série |
| `src/components/engines/charts/SubEngines/builders/types.ts` | alterado | tipos de referência, zoom, pizza, gauge |
| `src/components/engines/charts/SarakChartEngine.tsx` | alterado | props novas, locale, altura, aviso do Recharts |
| `src/components/atomic/Templates/SarakStatsDelta.tsx` | criado | delta com seta e tom |
| `src/components/atomic/Templates/SarakStats.tsx` | alterado | props do contrato §2.5 |
| `src/components/atomic/DataDisplay/SarakSparkline.tsx` | alterado | `baseline` |
| `src/components/atomic/Feedback/SarakProgress.tsx` | alterado | `allowOverflow`, `showValue`, `valueFormat` |
| `src/components/atomic/DataDisplay/SarakKanban/{kanbanTypes,kanbanModel,KanbanCardContent,KanbanCard,KanbanColumn,SarakKanbanImpl}` | alterado | `value`, `valueFormat`, `columnTotal` |
| `src/core/i18n/catalogEntries.charts.ts` | alterado | `statsTargetLabel` |
| `src/index.ts` | alterado | exporta os tipos novos do gráfico |
| `docs/migracoes.md` | alterado | subseção da plan-130 |
| `Templates/SarakChart.tsx`, `__tests__/SarakChart.test.tsx` (+ `.snap`), `hooks/useChartData.ts` (+ teste) | removido | Q7 |
| `Templates/index.ts`, `Design/catalog/partitions/data_and_charts.json`, `Design/schema/motion.ts`, `Provider/manifest.ts`, `Provider/generated/design-token-docs.json` | alterado | referência ao `SarakChart` fora |
| testes novos: `SarakChartEngine.reference.test.tsx`, `SubEngines/__tests__/chartEnhancements.test.ts`, `SarakStatsDelta.test.tsx`, `SarakProgress.overflow.test.tsx`, `SarakSparkline.baseline.test.tsx`, `SarakKanban/__tests__/KanbanColumn.value.test.tsx` | criado | provas abaixo |

**Verificações executadas**
- `npx vitest run SarakStats SarakProgress SarakSparkline KanbanColumn kanbanModel KanbanCard src/core/i18n src/components/engines/charts` → 27 arquivos, 239 testes passando (antes do `chartEnhancements.test.ts`); `npx vitest run chartEnhancements` → 5 passando.
- `npm run barrel:check` → "110 componentes registrados; barril em dia (0 faltas)".
- `grep -rn "SarakChart\b" src` → vazio.
- `npm run verify -- --tier=quick` → 8 falhas, nenhuma em arquivo da §3.1: `tsc` e `audit:baseline` apontam `SarakInput.paddingToken.test.tsx` (Select com `label` obrigatório), `SarakDatePicker.tsx`, `Design/palette/resolve.ts` (`./contrast` ausente) e `colorPalette` em testes (plans 132 e 133–135, em voo); `theme-completeness`, `variable-contract` (`SarakDataTableSkeleton.tsx`), `token-types:check` (token novo de outra plan), `catalog`/`guide`/`dev-kit:check` (gerados, por desenho). O `tsc` não aponta nenhum arquivo meu.

**Critérios de aceite** (item do contrato → teste)
- [x] Cada prop de §2.4–§2.6 e do Kanban com teste que falharia sem ela:
  | Item | Teste |
  |---|---|
  | `valueFormat` (eixo/dica) | `SarakChartEngine.reference.test.tsx` › "formata o eixo de valor e a dica em BRL no locale pt-BR" |
  | `series[].format` | idem › "series[].format vence o valueFormat no eixo direito e na dica da série" |
  | `height` | idem › "height em número vira px no contêiner…" |
  | `referenceLines` | idem › "traça a linha no tom de status…", "…eixo direito…", "…orientação horizontal" |
  | `referenceBands` | idem › "sombreia a faixa entre from e to no tom de aviso" |
  | `zoom` | idem › describe `zoom` (3 testes) |
  | `pieLabel` | idem › describe `pieLabel` (4 testes) |
  | `gauge` | idem › describe `gauge` e "gauge sem % quando valueFormat não é percentual…" |
  | aviso do Recharts | idem › "com recharts, as props novas entram no aviso de prop ignorada" |
  | Stats `signColor`/`goodDirection`/`deltaFormat`/`deltaLabel` | `SarakStatsDelta.test.tsx` › describes "SarakStatsDelta…" e "SarakStats — props novas" |
  | Stats `target`/`targetLabel`/`sparkline` | `SarakStatsDelta.test.tsx` › "target mostra a barra…", "targetLabel troca…", "sparkline desenha…" |
  | Sparkline `baseline` | `SarakSparkline.baseline.test.tsx` (4 testes) |
  | Progress `allowOverflow`/`showValue`/`valueFormat` | `SarakProgress.overflow.test.tsx` (5 testes) |
  | Kanban `value`/`valueFormat`/`columnTotal` | `KanbanColumn.value.test.tsx` (4 testes) |
- [x] `valueFormat` em BRL no eixo e na dica com `pt-BR` e `en-US` — `R$ 1.234,50` e `R$1,234.50` (`SarakChartEngine.reference.test.tsx`).
- [x] Gauge sem `%` quando `valueFormat` não é percentual; pizza com `pieLabel: 'percent'` — mesmos arquivo, describes `valueFormat` e `pieLabel`.
- [x] Stats: despesa subindo com `goodDirection: 'down'` em tom de erro com seta para cima — `SarakStatsDelta.test.tsx` (`data-tone="error"`, `data-direction="up"`).
- [x] `SarakChart` ausente do barril (`barrel:check` verde) e sem referência em `src/` (grep vazio, acima).
- [x] Sem prop nova, comportamento da rc.3: os testes existentes de charts, Stats, Progress, Sparkline e Kanban passaram sem alteração; há testes dedicados ("sem valueFormat o eixo fica como na rc.3", "sem prop nova de delta, mantém o desenho da rc.3", "omitido showValue…", "'auto' (padrão)…").
- [x] Resumo com a tabela item do contrato → teste (acima).

**Decisões e suposições**
- O delta com seta e `data-tone` só aparece se `goodDirection`, `deltaFormat` ou `deltaLabel` vier; sem nenhum, o delta é o da rc.3 (número com sinal, cor pelo sinal), para "sem prop nova = rc.3".
- Gauge com `valueFormat` percentual: o percentual é calculado sobre `(valor − min) / (max − min)`, não sobre o valor cru; com 0–100 dá o mesmo que o `{value}%` da rc.3. Com `valueFormat` moeda/número, o `detail` mostra o valor formatado, sem `%`.
- `SarakProgress valueFormat`: `percent` é aplicado a `value / max`; os outros formatos ao `value`.
- `referenceLines`/`referenceBands` valem em `bar`, `line` e `area` (os tipos com série cartesiana configurável); `zoom` vale também em `scatter`, `candlestick`, `histogram`, `boxplot` e `waterfall`. Faixa não tem `axis`: vai na série do eixo esquerdo.
- `tone: 'neutral'` usa `theme.textColor`; sucesso/aviso/erro usam `theme.statusColors`.
- `targetLabel` substitui a palavra "Meta" (texto fica "<targetLabel>: <valor>").
- Removi também `useChartData` (e teste), as menções ao `SarakChart` em `motion.ts`, `manifest.ts` e `data_and_charts.json`, e regenerei `design-token-docs.json` com `npm run token-types`: sem isso o grep da §7 não ficava vazio e o `token-docs:check` divergia. Esses cinco arquivos não estão nomeados na §3.1 (cobertos por "registro dele onde houver" e "código que só ele usa").

**Achados fora do escopo (não corrigidos)**
- `src/components/atomic/DataDisplay/SarakDataTable/SarakDataTableSkeleton.tsx:23` — `variable-contract:check` acusa reserva `rgba(255,255,255,0.06)` diferente do padrão do token (plan 129, em voo).
- `docs/migracoes.md` (linhas ~1308 e ~999–1041 da seção 7.0.0/anteriores) cita `SarakChart` em notas históricas: é histórico e foi deixado.

**Pendências / riscos**
- `catalog:check`, `guide:check`, `dev-kit:check` e `token-types:check` ficam vermelhos até o dono rodar `npm run catalog; npm run guide; npm run dev-kit; npm run token-types` antes do commit da rodada (o `token-types` diverge por token novo de outra plan, não pelo meu diff).
- Zoom em `slider`, linhas/faixas e rótulo da pizza foram provados na opção ECharts capturada, não em navegador (fecha na bateria do revisor).
- Os tipos `SarakSparklineBaseline` e a prop `columnTotal` não foram acrescentados a `src/index.ts` (o Sparkline e o Kanban não são nomeados no barril; ficam resolvíveis pelo manifesto como antes).


---

# 10. Veredito

## Veredito — 2026-10-28 — 🟢 Aprovada

**Medido por mim**, pelo protocolo do contrato §9: o filtro da §7 (mais `KanbanColumn`) rodou uma vez — **270/270 verdes**. O `quick`
foi aceito pelo resumo; nenhuma falha relatada aponta arquivo desta plan. O diff confere com o contrato §2.4–§2.6, §2.9 e Q7:
`chartEnhancements.ts` concentra formato, referência, zoom, pizza e gauge; as props novas entram no aviso do Recharts; o delta novo
só aparece com prop nova (sem ela, rc.3); `SarakChart` e `useChartData` removidos, sem referência em `src/`, com o de/para na nota.
Aceitos: a remoção nos cinco arquivos de registro fora da §3.1 (cobertos por "registro dele onde houver") e o percentual do gauge sobre
`(valor − min)/(max − min)`. O `token-types` passou a constar dos geradores do commit (contrato §9), como o executor apontou.

**Status: 🟢 Aprovada.** Destino `—`.

## Veredito — 2026-10-28 — 🔴 Aprovação reaberta (1 achado)

**O revisor aprovou sem medir a auditoria.** O protocolo da `rc.4` aceitava o `quick` do executor pelo resumo, e o resumo atribuía as
falhas do `audit:baseline` a outras plans. Medido agora por mim (`node gates/scripts/release/check-audit-baseline.mjs` +
`run_audit.mjs`): `auditor_cleancode` acusa **`SarakChartEngine.tsx` com 265 linhas** e **`SubEngines/seriesModel.ts` com 258** — teto
de 250, e os dois cresceram nesta plan. O Anel 2 do gancho de commit bloqueia regressão. O contrato §9 passou a mandar o revisor medir
o `audit:baseline` a cada rodada de vereditos.

**Achado 1 — dois arquivos acima do teto de linhas.** **Correção:** extrair, sem mudar comportamento, o que cresceu — por exemplo, a
validação de dados e a resolução de tipo de `SarakChartEngine.tsx` para um módulo irmão, e o trecho de séries/eixos de `seriesModel.ts`
—, cada módulo novo com o seu teste 1:1. Os testes existentes passam sem alteração.

**Status: 🔵 Em correção.**

---

## Resumo da execução (correção 1) — 2026-10-28

**Achado 1 — dois arquivos acima do teto de linhas: corrigido, sem mudar comportamento.**
- `SarakChartEngine.tsx` 265 → 223 linhas: validação de dado (`hasRenderableData`, guardas de candlestick/boxplot) e `resolveChartType` com a lista `CHART_TYPES` foram para `SubEngines/chartDataModel.ts` (novo, teste `__tests__/chartDataModel.test.ts`).
- `SubEngines/seriesModel.ts` 258 → 227 linhas: `buildCartesianAxes` e `buildLegend` foram para `SubEngines/cartesianLayout.ts` (novo, teste `__tests__/cartesianLayout.test.ts`); a função recebe `seriesChart` e `hasRightAxis` já resolvidos no lugar de `ChartOptionInput`.
- Nenhum teste existente foi alterado.

**Verificações:** `npx vitest run src/components/engines/charts` → 12 arquivos, 156 testes passando. `node gates/scripts/release/check-audit-baseline.mjs` → ainda acusa regressão (hardcoded estrutural 0→2, órfão 0→1, cleancode 0→3), mas `run_audit.mjs` não aponta nenhum arquivo desta plan: os violadores são `Inputs/internal/CalendarPanel.tsx` (261 linhas), `Inputs/internal/useDatePickerController.ts` (256 linhas e sem teste) e um `pl-4`/`pr-10` na linha 76 de outro arquivo — trabalho em voo de outra plan.

## Veredito — 2026-10-28 — correção 1 — 🟢 Aprovada

**Achado 1 fechado.** `SarakChartEngine.tsx` 223 linhas e `SubEngines/seriesModel.ts` 227, com `chartDataModel.ts` e
`cartesianLayout.ts` extraídos e testados 1:1; nenhum teste existente alterado. **Medido por mim:** `src/components/engines/charts`,
uma vez — **156/156 verdes**; `check-audit-baseline.mjs` no worktree inteiro — **igual ao baseline** (as regressões que o resumo
ainda via eram da `plan-132`, já corrigida).

**Status: 🟢 Aprovada.** Destino `—`.
