---
tipo: "plan"
titulo: "Completar a tabela para o trabalho diário e entregar documento e impressão"
objetivo: "Fazer a tabela ter ações em lote, colunas configuráveis pelo usuário e modo leve de relatório, e a lib oferecer moldura de documento e impressão limpa"
dominio: "Componentes / Tabela e documento"
status: "🟢 Aprovada"
prioridade: "Alta"
tags: ["plan", "rc.5", "tabela", "documento"]
relacionados: ["[[anexos/rc5-contrato]]", "[[07-responsividade-e-multidispositivo]]", "[[11-testes-e-cobertura]]"]
depende_de: "—"
retida_por: ""
destino_sintese: "—"
---

# 1. Objetivo

Tabela pronta para o uso diário de sistema real, e documento visto e impresso sem cromo.

# 2. Contexto

Lacunas medidas em 2026-11-02:

- **Ações em lote:** há seleção de linhas (`dataTableCell.ts`), mas nada de barra de ações.
- **Colunas:** nada para esconder, reordenar ou redimensionar. O Oss escreveu `ColumnManager.jsx`, com configuração persistida.
- **Relatório:** source-verifier, painel-web e Login montam tabela leve com regra de cor por limiar, fora do `SarakDataTable`.
- **Documento:** o ERP tem `DocumentFrame` (A4 e celular), em duas cópias antes da reestruturação.
- **Impressão:** nenhuma regra `@media print` em `src/styles`.

# 3. Escopo

## 3.1 Dentro
- `src/components/atomic/DataDisplay/SarakDataTable/` e `src/components/atomic/Tables/`, com testes.
- Componente novo `SarakDocumentFrame`.
- `src/styles/` — impressão.
- `src/index.ts`, `src/core/i18n/`, `browser-tests/`.

## 3.2 Fora
- Persistência da lib: ela entrega valor e `onChange`, e quem salva é o consumidor.
- Exportação Excel: `plan-155`.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Anexo | `specs/plan/anexos/rc5-contrato.md` | superfície |
| Spec fixa | `specs/specs/07-responsividade-e-multidispositivo.md` §6.1 | contêiner |
| **Skill** | `ui-novo-componente` · `padrao-escrita` + `padrao-typescript` · `ui-arquitetura-design` | componente · sempre · token |

Casos reais, fora deste repositório: ZP/Oss/frontend/src/modules/monitoring/components/ColumnManager.jsx e, no ERP, packages/ui-kit/src/DocumentFrame.tsx. Caminhos a partir da pasta Code.

# 5. Instruções de execução

1. Fotografe o worktree.
2. **Ações em lote.** `bulkActions?: { label; icon?; tone?; onAction(ids) }[]`. Uma barra aparece com a seleção, com contagem e limpar; ação de perigo pede confirmação. Vale em tabela e cartões.
3. **Colunas.** `columnState`, `onColumnStateChange`, `defaultColumnState`: visibilidade, ordem e largura. Um botão "Colunas" abre o painel, com teclado. Alça de largura por mouse e teclado. Sem as props, nada muda.
4. **Edição inline.** `SarakColumn.editable` e `onCellEdit(row, column, value)`: clique ou Enter entra em edição, Esc cancela, Enter ou sair confirma, com validação por coluna, erro na célula e estado de salvando. Usa os átomos de entrada e a navegação de grade por teclado. Decisão do dono em 2026-11-02.
5. **Visões salvas.** `views`, `activeView`, `onViewChange`, `onViewSave`: uma visão guarda filtros, colunas e ordenação. Barra com a visão atual, salvar como e voltar ao padrão. Quem persiste é o consumidor.
6. **Relatório.** `density="report"` sem cromo de cartão, e `getCellTone?: (row, column) => tom | undefined`, com tom por token e nunca só cor: inclui ícone ou texto.
7. **`SarakDocumentFrame`.** `format: 'a4' | 'letter' | 'phone'`, zoom, ajuste à largura por contêiner e slot de ações.
8. **Impressão.** Camada `@media print` no CSS: esconde cromo e ações, tira sombra, usa tabela inteira, sem virtualização quebrada, e `SarakDocumentFrame` imprime só o documento. `sarakPrint(element?)` público.
9. Specs de navegador. `npm run verify -- --tier=quick` uma vez.

# 6. Critérios de aceite

- [ ] Barra de lote com contagem, confirmação em ação de perigo — navegador.
- [ ] Colunas: esconder, reordenar e redimensionar por teclado, com valor devolvido — navegador.
- [ ] Sem props novas, snapshot igual — teste.
- [ ] Edição por teclado, com Esc, validação e erro na célula — navegador.
- [ ] Visão aplica filtros, colunas e ordenação, com o valor devolvido — teste.
- [ ] Tom da célula não depende só de cor — teste.
- [ ] Impressão em `page.emulateMedia({ media: 'print' })` sem cromo — navegador.
- [ ] Moldura no contêiner estreito sem rolagem da página — navegador.

# 7. Como verificar (uso do revisor)

**Gate:** nenhum novo.

- Filtro de `DataDisplay` e `Tables`, e `check-audit-baseline.mjs --with-tsc`.
- A CI mede a bateria no push.

# 8. Destino da síntese

**Destino:** `—`. A superfície fica no catálogo gerado.

---

# 9. Resumo da execução

## Resumo da execução — 2026-11-02

**Resultado:** Concluído com pendências

**Estado do worktree ao iniciar**
(limpo)

A plan estava em `🔴` na leitura e passou a `🟡` durante a execução, movida pelo revisor.

**O que foi feito**
- Ações em lote: `SarakTableBulkBar.tsx`, com contagem, limpar e confirmação por `useOverlay().confirm` em `tone: 'danger'`; `SarakDataTableView.tsx` a põe acima da tabela e dos cartões.
- Colunas: `tableColumnState.ts` (lógica pura), `useDataTableColumns.ts` (extraído do view-model), `SarakTableColumnPanel.tsx` (em `SarakModal`) e alça por teclado em `SarakDataTableHeader.tsx`.
- Edição inline: `SarakEditableCell.tsx`, `useEditableCell.ts`, `tableGridNavigation.ts`; `editable` e `validate` em `columnModel.ts`.
- Visões: `useTableViews.ts`, `SarakDataTableToolbar.tsx`; `applySort`, `selectedCount` e `exceptKeys` em `useTableInteractions.ts`, no tipo novo `DataTableInteractionsResult`, para não obrigar os mocks da `SarakTable`.
- Relatório e tom: `density="report"`, `getCellTone` e `SarakCellContent.tsx`, a mesma célula na tabela e no cartão.
- Fluxo sem virtualização: `useIsPrinting.ts`, `rowPosition` e `flowCellWidth` em `dataTableCell.ts`, usados por relatório e impressão.
- Documento e impressão: `SarakDocumentFrame.tsx`, `sarakPrint.ts`, `src/styles/_print.css`, exportados por `DataDisplay/index.ts`.
- 21 chaves em `catalogEntries.table.ts`, nos seis idiomas.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/components/atomic/DataDisplay/SarakDataTable/{SarakCellContent,SarakDataTableToolbar,SarakEditableCell,SarakTableBulkBar,SarakTableColumnPanel}.tsx` | criado | componentes das funções novas |
| `src/components/atomic/DataDisplay/SarakDataTable/{tableColumnState,tableGridNavigation,useDataTableColumns,useEditableCell,useIsPrinting,useTableViews}.ts` | criado | lógica e hooks |
| `src/components/atomic/DataDisplay/SarakDataTable/{SarakDataCardParts,SarakDataCards,SarakDataCardsView,SarakDataTableHeader,SarakDataTableImpl,SarakDataTableRow,SarakDataTableRows,SarakDataTableSpecialRows,SarakDataTableView}.tsx` | alterado | props novas e modo em fluxo |
| `src/components/atomic/DataDisplay/SarakDataTable/{columnModel,dataTableCell,index,useSarakDataTableViewModel,useTableInteractions}.ts` | alterado | tipos, estilo em fluxo, ligação |
| `src/components/atomic/DataDisplay/SarakDocumentFrame.tsx`, `sarakPrint.ts` | criado | moldura e impressão |
| `src/components/atomic/DataDisplay/index.ts` | alterado | exporta os dois |
| `src/styles/_print.css` · `src/styles/sarak-base.css` | criado · alterado | camada `@media print` e seu import |
| `src/core/i18n/catalogEntries.table.ts` | alterado | textos |
| `src/components/atomic/DataDisplay/SarakDataTable/__tests__/` | criado | 11 arquivos de teste novos e o snapshot `SarakDataTable.semPropsNovas` |
| `.../__tests__/SarakDataTableView.test.tsx`, `SarakDataTableView.zebra.test.tsx` | alterado | `columns` e `views` no modelo montado à mão |
| `src/components/atomic/DataDisplay/__tests__/SarakDocumentFrame.test.tsx`, `sarakPrint.test.ts` | criado | testes |
| `browser-tests/tabela-documento-e-impressao.spec.ts`, `browser-tests/fixtures/tabela-documento-entry.tsx` | criado | specs de navegador |

**Verificações executadas**
- `npx vitest run` só de `SarakDataTable`, `SarakDocumentFrame`, `sarakPrint`, `src/core/i18n` e `Templates/__tests__/SarakTable` → 57 arquivos, 316 de 317; a falha era o arranjo de providers do meu teste de cartões. Corrigido, `SarakDataTableToolbar.test.tsx` → 12 de 12. O conjunto inteiro não foi repetido.
- Snapshot: gravado **antes** de qualquer mudança em `src/`, passou inalterado depois.
- `npm run verify -- --tier=quick`, uma vez → **2 falhas**: `variable-contract` (minha: `_print.css` redefinia `--color-theme-title`) e `guide:check`. O restante OK, com Anel 0 simulado em 5151 linhas e 0 achado.
- Depois de corrigir, gates avulsos, sem repetir o verify: `variable-contract:check`, `css-important:check`, `fixed-translucent:check`, `barrel:check` (112 componentes, 0 faltas), `catalog:check` → OK. `npx tsc --noEmit` → sem erros. `guide:check` → segue **vermelho**.
- `npx playwright test tabela-documento` numa cópia fora do repositório, com JS e CSS compilados lá, para não tocar no `dist/` → 8 de 8, medido de novo com o `_print.css` final. A cópia foi removida, com a junção antes.

**Critérios de aceite**
- [x] Barra de lote com contagem e confirmação em ação de perigo — evidência: spec `lote:`.
- [x] Colunas: esconder, reordenar e redimensionar por teclado, com valor devolvido — evidência: spec `colunas:`.
- [x] Sem props novas, snapshot igual — evidência: `SarakDataTable.semPropsNovas.test.tsx`.
- [x] Edição por teclado, com Esc, validação e erro na célula — evidência: spec `edição:`.
- [x] Visão aplica filtros, colunas e ordenação, com o valor devolvido — evidência: `SarakDataTableToolbar.test.tsx`, `useTableViews.test.tsx`.
- [x] Tom da célula não depende só de cor — evidência: `SarakCellContent.test.tsx`, spec `tom da célula`.
- [x] Impressão em `emulateMedia` sem cromo — evidência: spec `impressão:`.
- [x] Moldura no contêiner estreito sem rolagem da página — evidência: spec `moldura em contêiner estreito`.

**Decisões e suposições**
- As props valem para a `SarakDataTable`. A `SarakTable` (`Templates/`) não foi tocada: a §3.1 não a lista e `SarakColumn.editable` é da DataTable.
- `onAction(ids, scope)`: o contrato pedia `onAction(ids)`. Acrescentei `scope` porque, em "todos os N", `ids` só traz as linhas visíveis. Quem ignorar `scope` age sobre menos itens do que a barra anuncia.
- A confirmação usa `useOverlay`. Sem `SarakUIProvider`, ela resolve `false` e a ação de perigo não roda: falha para o lado seguro, mas em silêncio.
- `onCellEdit` recebe o texto digitado, e o consumidor converte. Toda célula editável é parada de Tab, além das setas; não há tabindex móvel, porque a linha virtual pode sair do DOM.
- `filters.searchQuery` é o único filtro que a tabela aplica; as demais chaves voltam ao consumidor, que também as acrescenta em `onViewSave`.
- O botão "Colunas" aparece com `columnState`, `defaultColumnState`, `onColumnStateChange` ou `views`. Sem elas a coluna adicionada depois da montagem continua sem aparecer, para o DOM não mudar.
- Moldura usa CSS `zoom`, não `transform`: a folha ocupa a medida reduzida sem caixa externa calculada, e a altura vira mínimo para documento longo. A troca de formato fica no slot `actions`.
- Na impressão, cromo é `header` e `aside` fora de `[data-sarak-content]`, para o cabeçalho do documento do consumidor continuar no papel.

**Achados fora do escopo (não corrigidos)**
- `SarakDataTableImpl.tsx`: `onSearchQueryChange` existia sem ser chamado; agora só as visões o disparam.
- A coluna adicionada depois da montagem não aparece na tabela sem configuração de colunas; está coberto em `useDataTableColumns.test.tsx` como comportamento atual.

**Pendências / riscos**
- `guide:check` vermelho: `sarak-ui/` está defasado, e está fora da §3.1 e sendo regravado pela execução paralela. Regenerar antes do commit.
- Durante esta execução, `dist/`, `docs/`, `sarak-ui/` e `sarak-dev/` apareceram regravados por um build que não é meu (a cópia isolada não gera `dist/testing.*`). Não mexi neles. Parte de `dist/*.css` e `dist/styles/` aparecia apagada na leitura, o que indica um build em andamento ou interrompido.
- A impressão foi medida por emulação de mídia: quebra de página real e cabeçalho repetido por folha não foram medidos, e o cabeçalho sai só uma vez.
- Em tabela com `groupBy`, os botões de expandir somem do papel por `[aria-expanded]`; grupo recolhido sai recolhido.
- Linha fora da janela virtual desmonta a célula: erro de salvamento dela se perde ao rolar.

---

# 10. Veredito

## Veredito — 2026-11-02 — 🔴 Reprovado

A base está boa. Filtro de `DataDisplay` e `SarakTable`: 509/509. `check-audit-baseline --with-tsc`: igual ao baseline. O clique em célula editável não dispara `onRowClick`, e o trinco de `useEditableCell` impede salvar duas vezes entre Enter e `blur`.

1. **Build travado pela plan.** `SarakCellBehavior` (`SarakCellContent.tsx:11`) entra em `dist/index.d.ts` sem export, e `public-types:check` para o `npm run build`. Isso também segura a `plan-151`. Exporte em `src/index.ts`, ou declare em `gates/allowlists/publicTypeExclusions.mjs` com o motivo. O critério de impressão foi medido numa cópia que não passa por esse gate.
2. **Visão salva perde a escolha quando `views` chega depois.** `useTableViews.ts:66-70`: o efeito só depende de `activeId`. Com `activeView="x"` e `views` ainda vazio, como acontece ao carregar da API, `applyView` roda sem visão, chama `resetColumns` por cima do `columnState` do consumidor, marca `x` como aplicada e nunca aplica a visão real. Critério violado: "Visão aplica filtros, colunas e ordenação". Corrija, com teste de regressão.
3. **Erro cru do salvamento na tela.** `useEditableCell.ts:50` mostra `caught.message`, inclusive `Cannot read properties of undefined`. A `plan-151` entrega `sarakErrorMessage` para isso: use-a, com `tableEditError` como `fallback`.
4. **Texto claro no papel branco.** `_print.css:49-52` só escurece `[data-sarak-datatable]`, `[data-sarak-datacards]` e `[data-sarak-document]`. Em tema escuro, `sarakPrint(element)` de outro bloco, ou um cartão comum em `[data-sarak-content]`, sai com texto claro, e a impressão real descarta o fundo escuro. Estenda a regra a `[data-sarak-print-target]` e `[data-sarak-content]`, e meça a cor no spec, em tema escuro.
5. **Nota de migração ausente.** `docs/migracoes.md` não cita nada da plan. Acrescente a nota, inclusive `onAction(ids, scope)`, com o aviso de que, em "todos os N", `ids` só traz as linhas visíveis.

**Verificação objetiva:** `npm run build`, `tabela-documento-e-impressao`, o filtro de `SarakDataTable` e `verify --tier=quick`, uma vez cada. Regenere `catalog`, `guide` e `dev-kit` antes do quick. Sem suíte inteira e sem bateria.

## Resumo da execução (correção 1) — 2026-11-02

**Resultado:** Concluído

**Achados**
1. **Build travado:** `SarakCellBehavior` exportado em `SarakDataTable/index.ts`, que chega ao barril por `export *`; `src/index.ts` não foi tocado. Evidência: `npm run build` → exit 0, com `public-types:check` na cadeia.
2. **Visão que chega depois do id:** `useTableViews.ts:66-73` espera a visão existir, sem aplicar nem marcar como aplicada, e o efeito passou a depender de `options.views`. Evidência: dois testes novos em `useTableViews.test.tsx`: a espera não chama `resetColumns`, e uma lista nova depois de aplicar não reaplica.
3. **Erro cru:** `useEditableCell.ts` usa `sarakErrorMessage(caught, text('tableEditError'))`. Evidência: `SarakEditableCell.test.tsx`, com `TypeError('Cannot read properties of undefined')` caindo no texto do catálogo.
4. **Texto claro no papel:** `_print.css` estendeu `color-scheme`, `color` e `background` a `[data-sarak-content]` e `[data-sarak-print-target]`, mantendo a exceção de `[data-cell-tone]`. Evidência: spec `tema escuro:`, com o fixture em `mode: 'dark'` e o alvo do `sarakPrint` em portal fora do conteúdo. Mede cor clara na tela e `rgb(0, 0, 0)` no papel.
5. **Nota de migração:** seção nova em `docs/migracoes.md`, com `onAction(ids, scope)` e o aviso sobre "todos os N".

**Arquivos alterados nesta rodada**
`SarakDataTable/index.ts`, `useTableViews.ts`, `useEditableCell.ts`, `__tests__/useTableViews.test.tsx`, `__tests__/SarakEditableCell.test.tsx`, `src/styles/_print.css`, `browser-tests/fixtures/tabela-documento-entry.tsx`, `browser-tests/tabela-documento-e-impressao.spec.ts`, `docs/migracoes.md`, e os gerados por `catalog`, `guide`, `dev-kit` e `build`.

**Verificações executadas (uma vez cada, nesta ordem)**
- `npm run catalog` · `npm run guide` · `npm run build` (exit 0) · `npm run dev-kit`.
- `npx playwright test tabela-documento-e-impressao`, contra o `dist/` real → 9 de 9.
- `npx vitest run src/components/atomic/DataDisplay/SarakDataTable` → 38 arquivos, 219 de 219.
- `npm run verify -- --tier=quick` → verde: 31 OK, 0 falhas, Anel 0 simulado em 5369 linhas e 0 achado.

**Decisões e suposições**
- O `background: transparent` agora vale para todo o conteúdo no papel, então selo e botão com fundo próprio perdem esse fundo na impressão; o texto continua legível. O achado pedia estender a regra, e ela leva `color` e `background` juntos.
- Visão com `activeView` que nunca chega em `views` fica pendente, sem mexer na tela.

**Pendências / riscos**
- A impressão segue medida por emulação de mídia; o PDF real não foi gerado.

## Veredito — 2026-11-02 — 🟢 Aprovado

Os cinco achados foram conferidos no código: `SarakCellBehavior` exportado, com `public-types:check` verde; `useTableViews.ts:66-73` espera a visão sem tocar na tela; `useEditableCell.ts:51` usa `sarakErrorMessage`; `_print.css` cobre `[data-sarak-content]` e `[data-sarak-print-target]`; `docs/migracoes.md` traz a nota e o aviso de `onAction(ids, scope)`.

Rodado pelo revisor, contra o `dist/` real: filtro de `DataDisplay` e `SarakTable` 511/511; `tabela-documento` 9/9; `verify --tier=quick` verde com este veredito gravado.

O commit sai junto da `plan-151`, que divide o worktree. Destino da síntese: `—`.
