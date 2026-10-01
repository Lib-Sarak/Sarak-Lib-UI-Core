# Prompt direto 12 — `SarakAutocomplete`

> Escrito em **2026-09-19** pelo revisor. Prompt **direto** ([[00-prompt-revisor]] §6): não há plan, não há
> linha na fila gerada, e o resumo do executor vive na conversa. Confira que o estado do código ainda bate
> com o que o bloco afirma antes de despachá-lo — prompt guardado em arquivo envelhece.

````md
Leia specs/00-prompt-executor.md e execute a tarefa abaixo.

**Não há plan para esta tarefa** — a instrução completa é este bloco. Cumpra o
ritual de leitura (§2) pulando o passo 1, e entregue o resumo da §5 **nesta
conversa**, não em arquivo.

**Objetivo:** existe um campo de busca com sugestões, `SarakAutocomplete`, que
serve tanto para lista fixa (filtra sozinho) quanto para lista grande vinda do
servidor — e, nesse caso, **quem busca é o host**: a lib recebe uma função e a
chama, sem nunca falar com a rede por conta própria.
**Dentro do escopo:** `src/components/atomic/Inputs/` (componente, hook próprio
se o arquivo passar do teto de 250 linhas, barril da categoria e testes 1:1),
`src/index.ts`, e os gerados por regeneração.
**Fora do escopo:** seleção múltipla — quem faz isso é o `SarakMultiSelect`, e
ele não é alterado aqui. Criar componente de barra de filtros. Chamar `fetch` ou
`axios` dentro do componente. Criar token novo. Nada em `specs/`.
**Referências:** skills `ui-novo-componente`, `ui-arquitetura-design`,
`test-unitario` · `specs/arquitetura/03-superficie-publica.md` §6.3 (por que o
padrão `endpoint` é dos templates e **não** se aplica a um átomo) ·
`specs/specs/10-seguranca-e-acessibilidade.md` (navegação por teclado e anúncio
das sugestões) · `src/components/atomic/Inputs/SarakMultiSelect.tsx`, de onde
sai o idioma da lista de opções desta base.
**A forma:** com lista fixa, o componente filtra sozinho; com uma função de
busca, ele a chama com o que foi digitado, espera o resultado e mostra estado de
carregando, de vazio e de erro. Espera entre a digitação e a chamada, com o
intervalo vindo de prop. Digitação antiga que responde depois da nova é
descartada.
**Onde a lógica interna mora, já decidido na categoria** (medido em 2026-10-01): a tarefa 11 estabeleceu
`src/components/atomic/Inputs/internal/` como o lugar das peças não públicas desta categoria — lá estão
`mask.ts`, `currency.ts`, `inputCaret.ts` e `useInputCaret.ts`, cada um com teste próprio em
`internal/__tests__/`. Subpasta **não** é varrida pelo coletor, e é isso que a torna correta para o que não
deve chegar ao barril nem ao catálogo. O `useInputCaret` também é o precedente de controlar o cursor sem
`ref` — reaproveite em vez de reinventar, se precisar.

⚠️ **Uma armadilha de tipo já medida (2026-10-01), para não custar uma rodada:** `SarakInputProps`
estende `InputHTMLAttributes<HTMLInputElement>`, que **já declara `onSelect`** como
`ReactEventHandler` (`@types/react`). Declarar `onSelect?: (option) => void` numa interface que estende
`Omit<SarakInputProps, …>` sem omitir `'onSelect'` dá **TS2430 — incorrectly extends**, e o Anel 2 do
`pre-commit` barra (produção fecha em zero). Saídas: omitir `'onSelect'` junto das outras chaves, ou dar
outro nome à prop (`onOptionSelect`). Decida e diga no resumo qual escolheu.

**Prop nova nasce documentada.** Toda prop pública deste componente leva JSDoc **em português**,
dizendo o que acontece quando ela é omitida e a armadilha dela, quando houver — é o texto que o catálogo
publica ao consumidor. Prop sem `doc` no `docs/component-catalog.json` não está pronta: as levas 1 a 3
documentaram a superfície que já existia, e componente novo entrando em branco desfaz isso.
**Pronto quando:** teclado completo (setas, Enter, Esc, Tab) e papéis acessíveis
corretos; testes cobrindo lista fixa, busca assíncrona, resultado vazio, erro na
busca, resposta fora de ordem descartada e seleção por teclado; nenhuma chamada
de rede dentro do componente (mostre no resumo o que prova isso);
`barrel:check` e `catalog:check` verdes com os gerados regenerados; `npm run
audit` no baseline; `npx vitest run` inteiro verde.
````
