---
tipo: "plan"
titulo: "Dar às tabelas o que a tela financeira precisa"
objetivo: "Fazer SarakDataTable e SarakTable exibirem dado financeiro sem código no consumidor: formato e agregação por coluna com rodapé, cabeçalho de linha e colSpan, agrupamento com subtotal, linhas expansíveis, tree-table, busca e ordem pelo valor certo, skeleton, erro que mantém os dados, CSV e seleção de todos os N do servidor"
dominio: "DataDisplay / Tabelas"
status: "🟢 Aprovada"
prioridade: "Alta"
tags: ["plan", "rc.4", "tabela", "erp"]
relacionados: ["[[anexos/rc4-contrato]]", "[[plan-128-idioma-unico-e-feedback-rico]]", "[[10-seguranca-e-acessibilidade]]"]
depende_de: "plan-128-idioma-unico-e-feedback-rico"
retida_por: ""
destino_sintese: "—"
---

# 1. Objetivo

As duas tabelas públicas atendem os itens Tabela 1–8 e Feedback 5 do contrato, com a mesma API de coluna (`SarakColumnValueOptions<T>`).

# 2. Contexto

Contrato aceito: [`anexos/rc4-contrato.md`](anexos/rc4-contrato.md) §1.4, §1.7, §2.1–§2.3, §5 Q2, §6. **Nomes, tipos e padrões de lá são lei.**

O que a leitura revelou: `SarakDataTable` é **virtualizada** e feita de `div` com papéis ARIA (`role="table"`, `row`, `cell`,
`columnheader` — `SarakDataTable/SarakDataTableView.tsx:36`, `SarakDataTableRow.tsx:53`); todo cabeçalho é `draggable`
(`SarakDataTableHeader.tsx:56`); `error` e `loading` **substituem** a tabela (`SarakDataTableView.tsx:18-21`); há texto fixo em português
(`SarakDataTableRow.tsx:67`: "Seleção", "Selecionar linha"). A ordenação já é pura em `columnModel.ts` (`sortTableRows`). A
`SarakTable` monta pelo `useSarakTableViewModel.ts` + `SarakTableView.tsx`, com busca interna (`tableData.search`).

Linhas de grupo, de subtotal, expandidas e da árvore entram na **mesma lista virtual** (uma linha visual = uma entrada), para a
virtualização continuar valendo. O locale vem de `useSarakLanguage()` (`plan-128`).

**Ordem de execução** (uma entrega só, verificada uma vez): primeiro **colunas** (formato, agregação, rodapé, `rowHeader`, `colSpan`,
`sortable`/`sortValue`/`searchValue`, `searchQuery`, CSV, `exportable`); depois **linhas** (`groupBy`, `renderExpanded`,
`getChildren`, `selectAll`/`totalCount`, `skeletonRows`, Q2, `reorderable`).

# 3. Escopo

## 3.1 Dentro
- `src/components/atomic/DataDisplay/SarakDataTable/` — todos os arquivos; módulos puros novos para agregação, CSV, achatamento de
  grupos/árvore em linhas virtuais (cada um com teste).
- `src/components/atomic/Templates/SarakTable.tsx`, `SarakTableProps.ts`, `SarakTableView.tsx`, `SarakTableViewParts.tsx`,
  `SarakTableCards.tsx`, `useSarakTableViewModel.ts`, `hooks/` que eles usam.
- `src/core/i18n/catalogEntries.table.ts` — textos novos e os de `SarakDataTableRow.tsx:67`.
- `src/index.ts` (acréscimo) · `docs/migracoes.md` (uma subseção na `## 8.0.0`: Q2 e o resumo das props novas).

## 3.2 Fora
- `SarakTreeView` (contrato §6), `SarakDataGrid`, demais componentes.
- Dependência nova (CSV é código próprio; XLSX fora).
- Arquivos gerados; `catalog.ts` (já ligado pela `plan-128`).

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Contrato | `specs/plan/anexos/rc4-contrato.md` §1.4, §1.7, §2.1–§2.3, §5 Q2, **§9** | o que entregar e como verificar |
| Spec fixa | `specs/10-seguranca-e-acessibilidade.md` | papéis e nomes acessíveis |
| Spec fixa | `specs/07-responsividade-e-multidispositivo.md` | o colapso para cartões no celular (rodapé, grupo e expansão também no cartão) |
| **Skill** | `padrao-escrita` + `padrao-typescript` · `ui-arquitetura-design` | sempre · estilo só por token |
| Código | arquivos de §2 | ler antes de editar |

# 5. Instruções de execução

1. Fotografe o worktree.
2. `SarakColumnValueOptions<T>` em um lugar só, estendido por `SarakColumn<T>` e `SarakTableColumn<T>`.
3. Colunas, na ordem do §2; depois linhas. Numérico com `format`: alinhado à direita e `font-variant-numeric: tabular-nums`.
4. `rowHeader`: `th scope="row"` na `SarakTable`, `role="rowheader"` na `SarakDataTable`. `colSpan`: as colunas cobertas não
   renderizam; a largura somada respeita colunas congeladas.
5. `selectAll` com `totalCount`: marcar o cabeçalho com mais itens no servidor que na página mostra "Selecionar todos os N"; com
   `selectAll` ligado, `selectedKeys` são exceções.
6. Q2: com linhas, `error` vira aviso acima das linhas (`role="alert"`) e `loading` vira `aria-busy` com as linhas; sem linhas, skeleton.
7. Textos pelo catálogo (`catalogEntries.table.ts`), nos seis idiomas.
8. Subseção em `docs/migracoes.md`; `npm run verify -- --tier=quick` uma vez, resumo colado (contrato §9).

# 6. Critérios de aceite

- [ ] Cada prop de §2.1–§2.3 e cada função de §1.4/§1.7 com teste próprio que falharia sem ela, nas duas tabelas quando o contrato diz "ambas".
- [ ] Teste por papel: `rowheader`/`th[scope=row]`, rodapé em `rowgroup`/`tfoot`, botão de expandir com `aria-expanded`, seleção de todos com nome acessível.
- [ ] Ordenação por `sortValue` e busca pelo texto formatado provadas com moeda ("R$ 200" antes de "R$ 1.000" na ordem).
- [ ] CSV: BOM, `;` em pt-BR, valor formatado, rodapé incluído — teste puro.
- [ ] Agrupamento e árvore com 1.000 linhas continuam virtualizados (só as visíveis no DOM) — teste.
- [ ] Sem prop nova, o comportamento da rc.3 se mantém (os testes existentes passam sem alteração, salvo Q2, declarado).
- [ ] Resumo com a tabela item do contrato → teste.

# 7. Como verificar (uso do revisor)

**Gate:** nenhum — comportamento provado por teste de componente.

- `npx vitest run SarakDataTable SarakDataCards SarakTable columnModel useTableInteractions src/core/i18n` — uma vez (filtro por nome:
  não pega o trabalho em andamento das plans paralelas).
- Diff lido contra o contrato §2.1–§2.3; `git diff --stat` só com a §3.1.
- O `quick` do executor é aceito pelo resumo colado (contrato §9).

# 8. Destino da síntese

**Destino:** `—` — a superfície nova é documentada pelo catálogo gerado (R17) e pela nota de migração; nenhuma regra muda.

---

# 9. Resumo da execução

## Resumo da execução — 2026-10-28

**Resultado:** Concluído com pendências (as pendências são só o que o protocolo da rc.4 §9 deixa para o fechamento; ver o fim)

**Estado do worktree ao iniciar**
(limpo) — `git status --short` vazio com `HEAD` em `b5bf7667`. Durante a execução, outras plans da rc.4 (130–135) passaram a editar
o mesmo worktree (`src/core/Design/palette/`, `SarakSelect`, `SarakProgress`, `SarakKanban`, `SarakFilterSelect`, `SarakForm`,
`SarakChart` removido etc.); nada disso é meu e não foi tocado.

**O que foi feito**
- `SarakDataTable/columnValue.ts` (novo) — `SarakColumnValueOptions<T>` em **um** lugar só (estendido por `SarakColumn<T>` em `columnModel.ts:15` e por `SarakTableColumn<T>` em `SarakTableProps.ts`); leitura por `accessor`, formato, texto, valor de ordem (bruto), texto de busca (exibido), `sarakAggregate`, texto do rodapé, alinhamento (numérico com formato → direita + `tabular-nums`).
- `tableCsv.ts` (novo) — `sarakTableToCsv`/`sarakDownloadCsv`: BOM, `;` quando o locale tem vírgula decimal, valor formatado, rodapé incluído.
- `tableDisplayRows.ts` + `useTableDisplayRows.ts` (novos) — grupo, subtotal, detalhe e árvore achatados em **uma** lista de linhas visuais; é essa lista que o virtualizador conta (`useSarakDataTableViewModel.ts`, `count: displayRows.length`), então a virtualização continua valendo.
- `columnSpan.ts` (novo) — `colSpan` por linha; a cobertura para antes de uma coluna com congelamento diferente e soma a largura.
- `useTableInteractions.ts` — `totalCount`/`selectAll`/`onSelectAllChange`; com `selectAll`, `selectedKeys` são exceções.
- DataTable: `SarakDataTableRow.tsx` (rowheader, colSpan, botão de expandir, recuo da árvore), `SarakDataTableSpecialRows.tsx` (grupo, subtotal, detalhe, rodapé em `rowgroup`), `SarakDataTableHeader.tsx` (`reorderable`, textos pelo catálogo), `SarakDataTableView.tsx` (Q2, esqueleto, aviso "todos os N", rodapé), `SarakDataTableSkeleton.tsx`, `SarakTableControls.tsx` (botão de expandir, aviso "todos os N"), `dataTableCell.ts`.
- Cartões do celular das duas tabelas: `SarakDataCards*.tsx`, `SarakDataCardParts.tsx`, `dataCardItems.ts`, `Templates/SarakTableCards.tsx` — grupo, subtotal, expansão, árvore (recuo) e rodapé.
- SarakTable: `SarakTableGrid.tsx` (novo; a grade saiu de `SarakTableViewParts.tsx`, que passou de 183 a ~110 linhas e re-exporta `SarakTableGrid`), `th scope="col"`/`th scope="row"`, `colSpan`, `tfoot`, grupo/subtotal/detalhe; `useSarakTableViewModel.ts` (busca, ordem por `sortValue`, expansão, exportação), `hooks/useSarakTableData.ts` (busca controlada + texto exibido), botão "Exportar CSV" na barra.
- `catalogEntries.table.ts` — 13 textos nos seis idiomas, inclusive os que eram literais em português (`SarakDataTableRow` "Seleção"/"Selecionar linha", `SarakDataTableHeader` "Redimensionar coluna"/"Selecionar todas…", `SarakTableSortButton` "Ordenar por", `SarakDataCardsView`).
- `src/index.ts` (acréscimo): `sarakAggregate`, `sarakTableToCsv`, `sarakDownloadCsv` e os tipos `SarakAggregate`, `SarakColumnValueOptions`, `SarakColumnFooterContext`, `SarakTableGroupBy`, `SarakCsvOptions`. `docs/migracoes.md`: uma subseção na `## 8.0.0` (Q2 e a tabela das props novas).

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `SarakDataTable/columnValue.ts`, `tableCsv.ts`, `tableDisplayRows.ts`, `useTableDisplayRows.ts`, `columnSpan.ts`, `dataTableCell.ts`, `dataCardItems.ts` | criado | módulos puros (cada um com teste) |
| `SarakDataTable/SarakTableControls.tsx`, `SarakDataTableSkeleton.tsx`, `SarakDataTableSpecialRows.tsx`, `SarakDataCardParts.tsx` | criado | botão de expandir + aviso "todos os N", esqueleto, grupo/subtotal/detalhe/rodapé, cartões de totais |
| `SarakDataTable/columnModel.ts`, `SarakDataTableImpl.tsx`, `useSarakDataTableViewModel.ts`, `useTableInteractions.ts`, `SarakDataTableRows.tsx`, `SarakDataTableRow.tsx`, `SarakDataTableHeader.tsx`, `SarakDataTableView.tsx`, `SarakDataCards.tsx`, `SarakDataCardsView.tsx`, `SarakTableSortButton.tsx` | alterado | props novas e ligação (campos novos do modelo e das props de linha são opcionais, para os testes antigos montarem sem mudança) |
| `Templates/SarakTableGrid.tsx` | criado | grade da `SarakTable` (movida de `SarakTableViewParts.tsx` + recursos novos) |
| `Templates/SarakTableProps.ts`, `SarakTableView.tsx`, `SarakTableViewParts.tsx`, `SarakTableCards.tsx`, `useSarakTableViewModel.ts`, `hooks/useSarakTableData.ts` | alterado | props, barra com exportação, cartões, busca |
| `core/i18n/catalogEntries.table.ts` | alterado | 13 textos × 6 idiomas |
| `src/index.ts`, `docs/migracoes.md` | alterado | acréscimos |
| 18 arquivos `__tests__/` novos (listados na tabela abaixo) | criado | testes |

**Verificações executadas**
- `npx vitest run SarakDataTable SarakDataCards SarakTable columnModel columnValue columnSpan tableCsv tableDisplayRows dataCardItems dataTableCell useTableInteractions useTableDisplayRows useSarakTable SarakDataCardParts` → **40 arquivos, 218 testes, todos passando**, **rodado numa cópia do `HEAD` fora do repositório** (técnica da §3 item 10 do executor: `git archive` + junção de `node_modules`, junção removida antes de apagar; `node_modules` do repo conferido depois), com só os meus arquivos por cima. Motivo: no worktree compartilhado a suíte não carrega, porque a plan-133 deixou `src/core/Design/palette/resolve.ts` importando `./contrast`, que ainda não existe (`Failed to resolve import "./contrast"`). Os testes **existentes** de tabela (`SarakDataTable*`, `SarakDataCards*`, `SarakTable*`, `useTableInteractions`, `useSarakTable*`, `columnModel`) passaram **sem nenhuma alteração** — 123 antes dos meus testes novos, nas duas rodadas.
- `npx tsc --noEmit` nos meus arquivos → sem erro; os erros restantes são de outras plans (ver abaixo).
- `npm run verify -- --tier=quick` → 8 falhas, **nenhuma minha depois da correção abaixo**. Uma era minha: `variable-contract:check` acusou o fallback do esqueleto (`rgba(255,255,255,0.06)` ≠ padrão do token `rgba(255, 255, 255, 0.03)`); corrigi em `SarakDataTableSkeleton.tsx:23` e `npm run -s variable-contract:check` → `[OK] ... 3186 reservas conferidas`. As outras 7: `tsc` (8 erros em `gates/scripts/audit/verify_contrast.ts`, `Inputs/internal/CalendarPanel.tsx`, `core/Provider/utils/overlayPreferences.ts` — fora da §3.1) e por consequência `audit:baseline --with-tsc`; `theme-completeness:check` (19 temas sem `colorPalette` — plan-134); `catalog:check`, `guide:check`, `dev-kit:check` (falham por desenho, §9 do contrato); `plan-index:check` (status das plans 119 e 130, do revisor). Anel 0: 8084 linhas, 0 achados; `barrel:check` OK.

**Critérios de aceite**
- [x] Cada prop de §2.1–§2.3 e cada função de §1.4/§1.7 com teste próprio, nas duas tabelas quando o contrato diz "ambas" — tabela abaixo.
- [x] Teste por papel: `rowheader`/`th[scope=row]` (`SarakDataTable.financial.test.tsx` "rowHeader vira role=rowheader", `SarakTable.financial.test.tsx` "rowHeader renderiza th scope=row"); rodapé em `rowgroup`/`tfoot` (idem, "mostra o rodapé em rowgroup", "o rodapé é um tfoot"); botão de expandir com `aria-expanded` (idem, "renderExpanded…"); seleção de todos com nome acessível ("Selecionar todos os 500", "Selecionar todas as linhas visíveis").
- [x] Ordem por `sortValue` e busca pelo texto formatado com moeda: "R$ 200" antes de "R$ 1.000" (`columnValue.test.ts` "ordena pelo valor bruto…", `SarakDataTable.financial.test.tsx` e `SarakTable.financial.test.tsx` "…vem antes de…"); busca "1.000,00"/"300,50" casa o texto formatado.
- [x] CSV: BOM, `;` em pt-BR, valor formatado, rodapé incluído — `tableCsv.test.ts` (teste puro).
- [x] Agrupamento e árvore com 1.000 linhas continuam virtualizados — `SarakDataTable.financial.test.tsx` "com 1.000 linhas agrupadas…" e "com 1.000 raízes em árvore…" (mock do virtualizador com janela de 12; no DOM ficam ≤ 14 linhas, e "Item 999" não está).
- [x] Sem prop nova, o comportamento da rc.3 se mantém: os 123 testes existentes de tabela passam sem alteração; a única mudança de comportamento é Q2, declarada em `docs/migracoes.md`.
- [x] Resumo com a tabela item do contrato → teste (abaixo).

**Item do contrato → teste** (arquivo `SarakDataTable.financial` = DT, `SarakTable.financial` = T, ambos em `__tests__/`)
| Item | Teste |
|---|---|
| §1.4 `sarakTableToCsv` / `sarakDownloadCsv` | `tableCsv.test.ts` (todos os casos) |
| §1.7 `sarakAggregate` | `columnValue.test.ts` "agregação" (sum/avg/count/min/max, função, sem aggregate) |
| Tabela 1 `aggregate`, `footer` | DT "mostra o rodapé em rowgroup…", "footer próprio recebe…"; T "o rodapé é um tfoot…", "footer próprio recebe…" |
| Tabela 2 `format` (+ direita, `tabular-nums`) | DT/T "formata o valor, alinha à direita e usa números tabulares" |
| Tabela 3 `groupBy` | DT "agrupa com cabeçalho…", "o botão do grupo recolhe…", "subtotals:false e defaultExpanded:false"; T "agrupa com cabeçalho, subtotal…" |
| Tabela 3 `renderExpanded`, `expandedKeys`, `onExpandedChange` | DT "renderExpanded…", "expandedKeys controla…"; T idem; `useTableDisplayRows.test.tsx` |
| Tabela 4 `getChildren`, `defaultExpandedDepth` | DT "tree-table…", "defaultExpandedDepth abre…", "…1.000 raízes em árvore…" |
| Tabela 5 `rowHeader`, `colSpan` | DT/T "rowHeader…", "colSpan cobre a coluna seguinte…"; `columnSpan.test.ts` |
| Tabela 6 `sortValue` / `searchValue` / `sortable` | DT/T "…vem antes de…", "sortValue ordena…", "searchValue define…", T "sortable:false tira o botão…" |
| Tabela 6 `searchQuery`, `onSearchQueryChange` | DT "a busca casa o texto formatado…"; T "searchQuery controla o campo…", "a busca digitada…"; `useSarakTableData.search.test.ts` |
| Tabela 6 `reorderable` | DT "reorderable:false tira o arraste…" |
| Tabela 7 `skeletonRows`, Q2 | DT "loading sem linhas desenha o esqueleto…", "erro com linhas mantém…", "loading com linhas…"; `SarakDataTableSkeleton.test.tsx` |
| Tabela 8 `exportable` | T "exportable mostra o botão e baixa o CSV…", "sem exportable não há botão" |
| Feedback 5 `totalCount`, `selectAll`, `onSelectAllChange` | DT "página inteira marcada…", "com selectAll, desmarcar…"; T "oferece Selecionar todos os N…"; `useTableInteractions.selectAll.test.tsx`; `SarakTableControls.test.tsx` |
| Colapso no celular (grupo, rodapé, expansão no cartão) | T "cartões no celular"; `SarakDataTable.financial.cards.test.tsx`; `SarakDataCardParts.test.tsx` |

**Decisões e suposições**
- **`options.locale` em `sarakTableToCsv`** é um acréscimo ao contrato §1.4 (a assinatura do contrato não tem locale, mas a função é pura e não pode chamar o hook). Omitido, o separador e o formato seguem o locale do ambiente; a `SarakTable` passa o idioma da lib.
- **CSV neutraliza texto que começa com `=` ou `@`** (apóstrofo na frente): proteção contra injeção de fórmula no Excel; não está no contrato. Valor numérico e texto formatado não são alterados.
- **Busca da `SarakTable`:** o texto exibido **soma-se** aos valores brutos (rc.3), não os substitui — assim, sem `format` nem `searchValue`, o filtro é o mesmo da rc.3. Só colunas declaradas em `columns` entram no texto exibido; colunas geradas por `mapping`/chaves automáticas não têm formato.
- **`SarakDataTable.onSearchQueryChange`** existe no tipo (contrato §2.2) mas nunca dispara: a DataTable não tem campo de busca.
- **Árvore:** o rodapé agrega as linhas-raiz (não os filhos), para não contar duas vezes um pai que já totaliza os filhos. Filho sem `id` recebe a chave `${chavePai}/${posição}`. O estado de grupo expandido é interno (`expandedKeys` controla só as linhas).
- **Linha de grupo/subtotal/detalhe:** o item virtual leva uma `entry` sintética (1ª linha do grupo) e o campo opcional `display` diz o que é — para os testes e consumidores que montam `SarakDataTableVirtualRow` à mão continuarem válidos.
- **Campos novos de `TableInteractionsResult` e das props de linha são opcionais**, para os testes antigos que montam esses objetos à mão compilarem e passarem sem alteração.
- **Textos que eram fixos em português** (`SarakDataTableRow`, `SarakDataTableHeader`, `SarakTableSortButton`, `SarakDataCardsView`) passaram para o catálogo, como a §3.1 pede; em português saem idênticos.
- A plan declara `Gate: nenhum`; nada de regra/gate foi criado.

**Achados fora do escopo (não corrigidos)**
- `src/core/Design/palette/resolve.ts:6` importa `./contrast`, que não existe — derruba a suíte inteira no worktree compartilhado (plan-133, em voo).
- `src/components/atomic/Inputs/internal/CalendarPanel.tsx:100,103,198` (`useCallback` não importado, tipo de `ref`), `core/Provider/utils/overlayPreferences.ts:70`, `gates/scripts/audit/verify_contrast.ts` — erros de `tsc` de outras plans.
- Os avisos de "identificador em português" do hook de escrita sobre `Detalhe de …`/`Linha …` nos testes são texto JSX, não identificador (falso positivo).

**Pendências / riscos**
- A suíte **não foi rodada no worktree compartilhado** (bloqueada pela plan-133, acima); foi rodada na cópia do `HEAD` + meus arquivos. O revisor deve rodar `npx vitest run SarakDataTable SarakDataCards SarakTable columnModel useTableInteractions src/core/i18n` quando `contrast.ts` existir. `src/core/i18n` **não** foi rodado por mim (só o filtro dos arquivos que escrevi/toquei); o catálogo ganhou 13 chaves, todas com os seis idiomas.
- Não rodei navegador, build nem suíte completa (§9 do contrato: são do fechamento). `catalog`/`guide`/`dev-kit` não foram regenerados (arquivos gerados não se tocam nas plans). `docs/component-catalog.*` não reflete as props novas até lá.
- Q2 muda `SarakDataTable` para quem passava `error`/`loading` junto de linhas — declarado em `docs/migracoes.md`.
- A rodada de varredura de 1.000 linhas é por mock do virtualizador (jsdom não mede layout); a prova em navegador é do fechamento.

---

# 10. Veredito

## Veredito — 2026-10-28 — 🔴 Reprovado (1 achado)

**Medido por mim**, pelo protocolo do contrato §9: o filtro da §7 rodou uma vez **no worktree compartilhado** (o `contrast.ts` da
`plan-133` já existe) — **245/245 verdes**, incluindo `src/core/i18n`, que o executor não rodou. O `quick` foi aceito pelo resumo; a
única falha que era desta plan (`variable-contract`, reserva do esqueleto) foi corrigida por ele. O diff confere com o contrato §1.4,
§1.7, §2.1–§2.3 e Q2: um bloco de coluna só (`columnValue.ts`), linhas especiais na mesma lista virtual, textos fixos em português
movidos para o catálogo. Aceitos, e registrados no contrato §8: `options.locale` em `sarakTableToCsv` (função pura não lê o hook; a
`SarakTable` passa o `locale` de `useSarakLanguage`) e o rodapé da árvore agregando só as raízes.

**Achado 1 — a proteção contra injeção de fórmula no CSV está incompleta.** `tableCsv.ts:21` neutraliza só `=` e `@`
(`FORMULA_PREFIX = /^[=@]/`). O Excel e o LibreOffice também executam célula de texto que começa com `+`, `-`, tabulação (`\t`) ou
retorno de carro (`\r`) — ex.: um nome de fornecedor `-2+3+cmd|' /C calc'!A0` vira fórmula. É a lista da OWASP (*CSV Injection*). A
proteção que existe pela metade engana mais do que nenhuma: quem lê o código acredita que está coberto. **Correção:** o prefixo cobre
`= + - @ \t \r` **só em célula de texto** (o valor numérico e o texto produzido por `format` continuam intactos, como hoje); um teste
por prefixo em `tableCsv.test.ts`, mais um que prova que `-1.234,50` vindo de `format` não ganha apóstrofo.

**Status: 🔵 Em correção.**

---

## Resumo da execução (correção 1) — 2026-10-28

**Resultado:** Concluído

**Achado 1 — proteção contra injeção de fórmula no CSV**
- `src/components/atomic/DataDisplay/SarakDataTable/tableCsv.ts:21` — `FORMULA_PREFIX` passou de `/^[=@]/` para `/^[=+\-@\t\r]/` (lista da OWASP). Continua valendo só para célula de texto (`isText`); número e texto produzido por `format` não são alterados.
- `__tests__/tableCsv.test.ts` — `it.each` com um caso por prefixo (`=`, `+`, `-`, `@`, `\t`, `\r`) e um teste de que `-1.234,50` (moeda formatada) e o número bruto `-5` não ganham apóstrofo.

**Verificações executadas**
- `npx vitest run tableCsv` → 1 arquivo, 14 testes, passando.
- `npm run verify -- --tier=quick` → o `Anel 0` fecha em 0 achados. `audit:baseline` acusou `auditor_composicaoatomica` 2→3 por um `<button>` nativo **meu** (`SarakTableControls.tsx`, o botão de expandir); troquei por `SarakIconButton variant="ghost" size="xs"` (mesmos `aria-expanded` e `aria-label`) e a contagem voltou a 2. Rodei também `npx vitest run SarakTableControls financial` → 4 arquivos, 58 testes passando, pois a troca toca o botão que esses testes exercitam (fora do filtro pedido; declaro).
- Falhas restantes do `quick`, todas fora da §3.1: `audit:baseline` (hardcode estrutural, órfãos de teste e clean code em `SarakMultiSelect`, `SarakSelect`, `SarakUploader`, `SarakMaskedInput`, `CalendarPanel`, `useDatePickerController`, `SarakChartEngine`, `seriesModel` — plans 130/132), `token-types:check` (`design-token-docs.json` defasado), `catalog:check`, `guide:check`, `dev-kit:check` (gerados por desenho).

**Decisões e suposições**
- Cabeçalho do CSV também recebe o apóstrofo se começar por esses caracteres (é texto); coluna de texto cujo conteúdo é um número negativo em string (ex.: `"-5"`) com `formatted:false` também recebe — é texto, não número.
- A troca do botão de expandir (24 px, `ghost`) é um ajuste visual mínimo; o tamanho e o tom vêm do átomo.

**Achados fora do escopo (não corrigidos):** os arquivos listados acima.

**Pendências / riscos:** nenhuma desta correção.

## Veredito — 2026-10-28 — correção 1 — 🟢 Aprovada

**Achado 1 fechado.** `tableCsv.ts:21` cobre `= + - @ \t \r` só em célula de texto; `tableCsv.test.ts` tem um caso por prefixo e prova
que `-1.234,50` formatado e o número `-5` não ganham apóstrofo. A troca do `<button>` nativo do expandir por `SarakIconButton`
(`SarakTableControls.tsx`) devolveu o `auditor_composicaoatomica` ao baseline. **Medido por mim:** `tableCsv` + `SarakTableControls`,
uma vez, verdes; o `audit:baseline` do worktree não aponta nenhum arquivo desta plan.

**Status: 🟢 Aprovada.** Destino `—`.
