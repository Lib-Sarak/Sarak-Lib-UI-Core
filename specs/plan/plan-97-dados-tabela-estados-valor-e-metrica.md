---
tipo: "plan"
titulo: "Exibir dado: tabela com célula própria e estados, paginação com resumo, valor formatado e cartão de métrica"
objetivo: "Dar a lib o que quatro sistemas refizeram a mao para exibir dado: tabela semantica com celula customizada e os tres estados, paginacao com tamanho e resumo, valor numerico formatado com cor por sinal e cartao de metrica completo"
dominio: "Sarak-Lib-UI-Core / Átomos / Exibição de dado"
status: "🟢 Aprovada"
prioridade: "Média"
tags: ["plan", "tabela", "paginacao", "formatacao", "metrica", "componentes"]
relacionados: ["[[03-superficie-publica]]", "[[11-testes-e-cobertura]]", "[[07-responsividade-e-multidispositivo]]"]
depende_de: ""
retida_por: ""
destino_sintese: "arquitetura/03-superficie-publica.md"
---

# 1. Objetivo

Um sistema mostra uma lista, uma página de resultados, um número e um indicador **com a lib**, sem refazer
nada: tabela semântica com célula customizada e os três estados; paginação com tamanho de página e resumo;
valor formatado (número, moeda, percentual, data) com cor por sinal; cartão de métrica com ícone, delta e
sub-rótulo.

# 2. Contexto

**Critério do dono (2026-10-03):** a lib é genérica; entra o que mais de um sistema precisou e não carrega
vocabulário de domínio. Medido em 2026-10-02:

| Necessidade | Quem refez à mão | O que a lib tem hoje |
|---|---|---|
| Tabela `<table>` semântica com `columns[].render(row)` | `login-completo` (`components/Table.tsx`, 6 telas); Cripto (38 `<table>` cruas em 27 arquivos, 3 ordenações manuais); `Novo` (`RamificacoesTabela.tsx`) | `SarakTable` renderiza `String(row[col])`; `SarakDataTable` tem `render` mas é grade virtualizada de `<div role="table">` com altura fixa por linha (`rowHeight` único — demanda 10 do ERP), sem estados de carregando/vazio/erro, sem `onRowClick`, sem alinhamento |
| Os três estados de leitura (carregando, erro com "tentar de novo", vazio) | `login-completo` (`State.tsx`), ERP (`SummaryCard.tsx`, `Notice.tsx`), Cripto (4 mensagens "Nenhum…") | só `SarakTable` tem erro com retry embutido; `SarakDataTable` não tem estado nenhum |
| Paginação com tamanho de página e "X–Y de N" | `login-completo` (`Pagination.tsx`, exigido por spec do sistema); Cripto (`PaginationControls.jsx`) | `SarakPagination` só `current`/`total`/`onChange` |
| Valor formatado (moeda, número, percentual, data) com cor por sinal | ERP (`ProposalValue.tsx`); Cripto (392 `.toFixed`, ~25 funções `format*` duplicadas) | só `Intl.NumberFormat` dentro do `SarakCurrencyInput`; nenhum formatador público |
| Cartão de métrica com ícone próprio, delta, sub-rótulo e valor formatado | ERP (`SummaryCard`), Cripto (`DashboardStats`, `MetricGrid`, `SpotWallet`), `login-completo` (`SarakStats` com rótulo como chave) | `SarakStats` sem delta, sem ícone por métrica, sem formato (depois da `plan-96`, sem domínio) |

**Decisão de desenho desta plan:** os formatadores são **funções** públicas (`sarakFormatNumber`,
`sarakFormatCurrency`, `sarakFormatPercent`, `sarakFormatDate`), com `locale` da preferência de idioma e
override por parâmetro; o componente de valor (`SarakValue`) só compõe formatador + cor por sinal + tamanho.
Nada de "pt-BR" fixo.

# 3. Escopo

## 3.1 Dentro (o que pode ser tocado)

- `src/components/atomic/Templates/SarakTable.tsx` e `hooks/useSarakTableData.ts` — `columns[].render`,
  `align`, `onRowClick`, os três estados (com `onRetry`), continua `<table>` semântica.
- `src/components/atomic/Templates/SarakTableProps.ts` · `SarakTableCards.tsx` e os testes deles — *(emenda do
  revisor, 2026-10-07)* os cartões do celular são a mesma tabela refluída ([[07-responsividade-e-multidispositivo]]):
  `columns[].render`, `align` e `onRowClick` valem neles também, senão a célula customizada some no celular.
- `src/components/atomic/DataDisplay/SarakDataTable/**` — altura de linha por função ou automática
  (`rowHeight: number | (row) => number | 'auto'`), estados carregando/vazio/erro, `onRowClick`, `align`.
- `src/components/atomic/Navigation/SarakPagination.tsx` — `pageSize`, `pageSizeOptions`, `totalItems`,
  `onPageSizeChange`, resumo "X–Y de N" traduzido.
- `src/shared/format/` (novo) — os formatadores; `src/components/atomic/Atoms/SarakValue.tsx` (novo).
- `src/components/atomic/Templates/SarakStats.tsx` — por métrica: `icon`, `delta`, `format`, `label`,
  `hint`; estados.
- `src/core/i18n/**` — os textos novos.
- `src/index.ts` — os nomes novos, pelo prefixo.
- Testes ao lado; `docs/component-catalog.*`, `sarak-ui/`, `sarak-dev/`, `dist/` regenerados.

## 3.2 Fora (o que NÃO pode ser tocado)

- Linha expansível, filtro por coluna, gerenciador de colunas, grade temporal, gráfico multi-série, tempo
  real: só um sistema cada, ou ainda não consumidor — esperam demanda.
- `SarakChart`/`SarakChartEngine`.
- Qualquer formato fixo de locale.
- O cromo, o Provider, os ícones.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/arquitetura/03-superficie-publica.md` | §4.3 (prefixo), §6 (taxonomia), §6.3 (templates de dado, na forma que a `plan-96` deixou) |
| Spec fixa | `specs/specs/07-responsividade-e-multidispositivo.md` | tabela em cartões no celular (`SarakTable`/`SarakDataTable` já reflui) |
| Spec fixa | `specs/specs/10-seguranca-e-acessibilidade.md` | §2.4 (ARIA de tabela e de paginação) e §3.6 (idioma) |
| Spec fixa | `specs/specs/11-testes-e-cobertura.md` | §3 — testes na borda |
| Contexto | `specs/00-contexto.md` · `specs/00-knowledge.md` | sempre |
| **Skill** | `padrao-escrita` + `padrao-typescript` | sempre |
| **Skill** | `ui-novo-componente` | componente e nome novos, barril e catálogo |
| **Skill** | `test-unitario` | testes |
| Código | os arquivos de §3.1 | ler antes de editar |
| Código | `src/components/atomic/Inputs/internal/currency.ts` | o único formatador que existe — reaproveitar, não duplicar |

# 5. Instruções de execução

1. **`SarakTable`**: `columns` aceita `{ key, label, render?, align? }`; `onRowClick`; `loading`, `error` +
   `onRetry`, vazio com mensagem — tudo traduzido. Continua `<table>`/`<tbody>`/`<tr>`.
2. **`SarakDataTable`**: altura por linha variável ou automática; estados; `onRowClick`; `align`.
3. **`SarakPagination`**: `pageSize` + opções + `totalItems` → resumo "X–Y de N" e "página X de Y".
4. **Formatadores**: as quatro funções, locale da preferência de idioma (`useSarakPreferences`) com override.
5. **`SarakValue`**: valor + formatador + `signColor` (positivo/negativo/neutro por token de status) +
   tamanho. *(Emenda do revisor, 2026-10-07, a pedido do executor:)* positivo = `statusSuccessColor`
   (`--sarak-status-success-color`), negativo = `statusErrorColor` (`--sarak-status-error-color`), neutro =
   `textColorMuted` (`--sarak-text-muted`) — `src/core/Design/schema/status.ts` e `schema/typography.ts`. Use as
   variáveis por `var()`, nunca a cor literal, e o teste afirma a variável de cada sinal.
6. **`SarakStats`**: por métrica `icon`, `delta` (com sinal e cor), `format`, `label`, `hint`.
7. Testes de borda para cada item; `npm run build` · `guide` · `catalog` · `dev-kit` · `tsc` · `vitest` ·
   `audit` → verdes.

# 6. Critérios de aceite

- [ ] `SarakTable` renderiza célula por `render`, alinha, aciona `onRowClick` também nos cartões do celular,
      e mostra os três estados (testes).
- [ ] `SarakDataTable` aceita linha de altura variável e mostra os três estados (testes).
- [ ] `SarakPagination` muda o tamanho de página e mostra o resumo traduzido (teste).
- [ ] Os quatro formatadores respeitam a preferência de idioma e o override (testes com dois locales).
- [ ] `SarakValue` colore por sinal com token de status (teste).
- [ ] `SarakStats` mostra ícone, delta e valor formatado por métrica (teste).
- [ ] Nomes novos com prefixo; `prefix:check`, `barrel:check`, `catalog:check` verdes.
- [ ] `npm run build`, `npx tsc --noEmit`, `npx vitest run` verdes; `npm run audit` sem regressão.

# 7. Como verificar (uso do revisor)

**Gate:** `nenhum` — componentes; prova por teste de módulo.

- `git status` + `git diff --stat` → só §3.1.
- Rodar isolados os testes dos critérios; `npx vitest run`.
- `npm run build` (prefixo, barril, tipos, catálogo).
- Leitura do diff dos formatadores → nenhum locale fixo.
- `npm run audit` contra o baseline.

# 8. Destino da síntese

**Destino:** `arquitetura/03-superficie-publica.md`

- §6 — as capacidades de exibição de dado: tabela semântica (célula, estados, clique), grade virtualizada
  (altura variável, estados), paginação com resumo, formatadores e `SarakValue`, métrica completa; §6.3
  ajustada ao que os templates passam a aceitar.

> A síntese é ato do **revisor** ([[00-prompt-revisor]]), e o gatilho é do **usuário**: o revisor propõe ao
> aprovar e espera autorização. Esta seção apenas a prepara.

---

# 9. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only: cada rodada acrescenta um bloco novo; nada é removido. -->

### 2026-10-07 — execução do executor

**Status: 🟡 Em execução.** Faltam duas definições do usuário antes de concluir todos os critérios: os nomes exatos dos tokens de cor positiva/negativa de `SarakValue` e a autorização para estender `SarakTableProps`/`SarakTableCards` e seus testes para renderizar `columns[].render` nos cartões mobile.

**Implementado nesta rodada:** formatadores públicos de número, moeda, percentual e data; `SarakValue`; estados, renderização, alinhamento, clique e altura variável nos componentes de tabela; resumo/tamanho de página na paginação; configuração por métrica em `SarakStats`; chaves de i18n; testes diretos das novas views e view models. A entrada obsoleta de `SarakPagination` foi removida da allowlist de class merge.

**Arquivos da execução:** `src/shared/format/`; `src/components/atomic/Atoms/`; `src/components/atomic/DataDisplay/SarakDataTable/`; `src/components/atomic/Navigation/SarakPagination.tsx` e seu teste; `src/components/atomic/Templates/`; `src/core/i18n/catalogEntries.part4.ts`; trecho próprio de `src/index.ts`; subseção própria em `docs/migracoes.md` dentro de `## 8.0.0`; `gates/allowlists/classMergeExclusions.mjs`. Catálogo, kits e build foram atualizados somente pelos geradores/comando oficiais.

**Verificações:** build final passou; `npx tsc --noEmit` passou; `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` passou (`igual ao baseline de 2026-08-11`); `prefix:check`, `barrel:check`, `catalog:check`, `guide:check`, `dev-kit:check`, `token-types:check` e `class-merge:check` passaram. Os testes focados passaram (69/69 antes do ajuste final do wrapper; os três testes afetados pelo ajuste também passaram). A suíte completa executada com uma worker terminou com 2.247 testes aprovados e 10 falhas, todas em `Layout` e `DesignEngine`, nos trabalhos paralelos que permaneceram sem alterações. `npm run audit` reportou os inputs crus já existentes de `SarakMultiSelect`/`SarakUploader` e a variável fantasma `--x`; o baseline confirmou que não houve regressão.

**Fotografia do worktree antes da primeira edição desta plan:**

```text
 M browser-tests/cromo-css-real.spec.ts
 M browser-tests/fixtures/harness-entry.tsx
 M docs/migracoes.md
 M gates/scripts/contrato/__tests__/check-chrome-token-parity.test.mjs
 M gates/scripts/contrato/check-chrome-token-parity.mjs
 M src/components/Layout/SarakAppChrome.tsx
 M src/components/Layout/SarakAppChromeMobile.tsx
 M src/components/Layout/__tests__/SarakAppChrome.tokens.test.tsx
 M src/components/Layout/chrome/ChromeSidebarBody.tsx
 M src/components/Layout/chrome/ChromeTopbarBody.tsx
 M src/components/Layout/chrome/chromeStructuralStyles.ts
 M src/components/Layout/chrome/useChromeDesignTokens.ts
?? src/components/Layout/chrome/ChromeContentRegion.tsx
```

---

### 2026-10-07 — conclusão após as emendas do revisor

**Status: 🟠 Em revisão.** As definições pendentes foram aplicadas conforme as emendas de 2026-10-07. `SarakValue` usa `var(--sarak-status-success-color)`, `var(--sarak-status-error-color)` e `var(--sarak-text-muted)` para positivo, negativo e neutro, com teste por sinal. `SarakTableProps` e `SarakTableCards` preservam `columns[].render`, `align` e `onRowClick` no celular; os cartões também ignoram alvos interativos e não acionam linhas de esqueleto.

**Verificações finais:** `npx vitest run` após o build — 404 arquivos e 2.262 testes aprovados, zero falhas; `npx tsc --noEmit` passou; `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` confirmou igualdade com o baseline de 2026-08-11; `npm run build` passou. Passaram também `prefix:check`, `barrel:check`, `catalog:check`, `guide:check`, `dev-kit:check`, `token-types:check` e `class-merge:check`. A auditoria ampla ainda aponta `--x` e os inputs nativos em `SarakMultiSelect.tsx`/`SarakUploader.tsx`; o baseline confirmou que essas ocorrências não são regressões desta plan. A suíte final não teve falhas em `Layout` ou `DesignEngine`, portanto não há falha Vitest final a atribuir a outra plan.

**Documentação e artefatos:** o trecho próprio da subseção de dados dentro de `## 8.0.0` foi atualizado; catálogo, `sarak-ui/`, `sarak-dev/` e `dist/` foram atualizados somente pelos comandos oficiais.

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->

## Veredito — 2026-10-08 — 🟢 Aprovado

**Antes de gravar:** a §10 foi relida no disco e estava vazia.

**Verificado por mim:**
- **Escopo:** os arquivos do §3.1 e das duas emendas de 2026-10-07 (`SarakTableProps.ts`, `SarakTableCards.tsx`).
  Fora dele, só duas consequências diretas: a entrada obsoleta do `SarakPagination` saiu de
  `gates/allowlists/classMergeExclusions.mjs` (a allowlist se autolimpa) e o barril de categoria
  `Atoms/index.ts` exporta o `SarakValue`.
- **Cobertura 1:1:** cada componente e hook novo tem teste ao lado (`SarakValue`, `SarakDataCardsView`,
  `SarakDataTableRow`, `SarakDataTableView`, `useSarakDataTableViewModel`, `SarakTableView`, `SarakTableViewParts`,
  `useSarakTableViewModel`); `src/shared/format/` tem `formatters.test.ts`, e o baseline aceita.
- **`SarakValue`** colore por `var(--sarak-status-success-color)`, `var(--sarak-status-error-color)` e
  `var(--sarak-text-muted)`, como a emenda manda, e formata no idioma da preferência da lib
  (`sarak.preferences.language`), com override por `locale`.
- **Formatadores:** nenhum locale nem moeda literal em `src/shared/format/`. Sem argumento, caem no locale do
  runtime (`resolveIntlLocale`), e os testes cobrem dois locales.
- `npx vitest run` → **404 arquivos** (todos os que o `vitest list --filesOnly` descobre), **2262 de 2262 verdes**,
  com a `plan-100` (lote 2) em execução na mesma árvore.
- `check-audit-baseline --with-tsc` → igual ao baseline. Verdes: `prefix`, `barrel`, `catalog`, `guide`,
  `dev-kit`, `public-types`, `class-merge`, `kit-names`, `zero-brand` e `build-info`.

**Nota de processo:** o executor marcou os critérios da §6 como `[x]`. Pelo prompt dele, a única edição permitida
na plan fora do resumo é o `status`, e conferir critério é papel do revisor. Os `[ ]` foram restaurados aqui. Não
reprova: o código não muda.

**Conclusão:** a plan está concluída. Commit **por caminho**. A síntese vai para o destino declarado na plan, com
a autorização do dono.

---

# 11. Síntese

<!-- Preenchido pelo REVISOR na síntese (00-prompt-revisor.md §7.4), imediatamente antes da remoção da plan.
     Append-only. O que foi transportado, e o que ficou de fora. -->
