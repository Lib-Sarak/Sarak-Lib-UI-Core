---
tipo: "plan"
titulo: "Exibir dado: tabela com célula própria e estados, paginação com resumo, valor formatado e cartão de métrica"
objetivo: "Dar a lib o que quatro sistemas refizeram a mao para exibir dado: tabela semantica com celula customizada e os tres estados, paginacao com tamanho e resumo, valor numerico formatado com cor por sinal e cartao de metrica completo"
dominio: "Sarak-Lib-UI-Core / Átomos / Exibição de dado"
status: "🔴 A executar"
prioridade: "Média"
tags: ["plan", "tabela", "paginacao", "formatacao", "metrica", "componentes"]
relacionados: ["[[03-superficie-publica]]", "[[11-testes-e-cobertura]]", "[[07-responsividade-e-multidispositivo]]"]
depende_de: "plan-96-templates-sem-dominio-embutido"
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
   tamanho.
6. **`SarakStats`**: por métrica `icon`, `delta` (com sinal e cor), `format`, `label`, `hint`.
7. Testes de borda para cada item; `npm run build` · `guide` · `catalog` · `dev-kit` · `tsc` · `vitest` ·
   `audit` → verdes.

# 6. Critérios de aceite

- [ ] `SarakTable` renderiza célula por `render`, alinha, aciona `onRowClick`, e mostra os três estados
      (testes).
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

---

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->

---

# 11. Síntese

<!-- Preenchido pelo REVISOR na síntese (00-prompt-revisor.md §7.4), imediatamente antes da remoção da plan.
     Append-only. O que foi transportado, e o que ficou de fora. -->
