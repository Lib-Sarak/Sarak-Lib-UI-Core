---
tipo: "plan"
titulo: "Dar às tabelas o que a tela financeira precisa"
objetivo: "Fazer SarakDataTable e SarakTable exibirem dado financeiro sem código no consumidor: formato e agregação por coluna com rodapé, cabeçalho de linha e colSpan, agrupamento com subtotal, linhas expansíveis, tree-table, busca e ordem pelo valor certo, skeleton, erro que mantém os dados, CSV e seleção de todos os N do servidor"
dominio: "DataDisplay / Tabelas"
status: "🟡 Em execução"
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

---

# 10. Veredito
