# Prompt direto 02 — ordenação e seleção nas duas tabelas

> Escrito em **2026-09-19** pelo revisor. Prompt **direto** ([[00-prompt-revisor]] §6): não há plan, não há
> linha na fila gerada, e o resumo do executor vive na conversa. Confira que o estado do código ainda bate
> com o que o bloco afirma antes de despachá-lo — prompt guardado em arquivo envelhece.
> **Depende de** `SarakCheckbox`, entregue pela `plan-83`.

````md
Leia specs/00-prompt-executor.md e execute a tarefa abaixo.

**Não há plan para esta tarefa** — a instrução completa é este bloco. Cumpra o
ritual de leitura (§2) pulando o passo 1, e entregue o resumo da §5 **nesta
conversa**, não em arquivo.

**Objetivo:** `SarakDataTable` e `SarakTable` passam a ordenar por coluna e a
selecionar linhas, com a MESMA API nos dois, inclusive no colapso em cartões do
celular.
**Dentro do escopo:** `src/components/atomic/DataDisplay/SarakDataTable/`
(`SarakDataTableImpl.tsx`, `columnModel.ts`, `SarakDataCards.tsx`, o barril e os
testes), `src/components/atomic/Templates/SarakTable.tsx`,
`SarakTableCards.tsx` e os hooks de `Templates/hooks/` que os servem,
`src/index.ts` se algum tipo novo precisar ser exportado, e os artefatos gerados
por regeneração.
**Fora do escopo:** paginação, filtro, edição de célula, busca no servidor.
Nenhuma mudança no contrato `data` × `endpoint` (`03-superficie-publica` §6.3).
Nada em `specs/`.
**Referências:** skills `ui-novo-componente`, `ui-arquitetura-design` e
`test-unitario` · `specs/arquitetura/03-superficie-publica.md` (§6.1 e §6.3) ·
`specs/specs/07-responsividade-e-multidispositivo.md` (o colapso em cartões) ·
`specs/specs/11-testes-e-cobertura.md` · o `SarakCheckbox`, que é o átomo da
seleção — elemento `<input>` cru é proibido.
**A API, igual nos dois:**
- ordenação: coluna marcada como ordenável; sem controle externo, o componente
  ordena sozinho; com `sort` e `onSortChange`, quem manda é quem chamou (o
  consumidor que ordena no servidor). Três estados ao clicar no cabeçalho:
  crescente, decrescente, sem ordenação.
- seleção: `selectable`, `selectedKeys`, `onSelectionChange`, com caixa no
  cabeçalho que marca e desmarca as linhas visíveis, e estado indeterminado
  quando a seleção é parcial. A chave da linha sai de `getRowKey`; no
  `SarakTable`, que não tem essa prop, crie a equivalente.
- no modo cartão do celular, a seleção continua disponível e a ordenação
  também.
**Pronto quando:** teto de 250 linhas por arquivo respeitado (o
`SarakDataTableImpl.tsx` está em 248 — extraia, e cada peça extraída leva o
próprio teste); testes cobrindo ordenar pelos três estados, ordenação
controlada por quem chama, selecionar uma, selecionar todas, seleção parcial e
seleção no modo cartão; `npm run barrel:check`, `catalog:check`, `guide:check`
verdes com os gerados regenerados; `npm run audit` no baseline; `npx vitest run`
inteiro verde.
````
