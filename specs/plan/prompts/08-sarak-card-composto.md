# Prompt direto 08 — `SarakCard` composto

> Escrito em **2026-09-19** pelo revisor. Prompt **direto** ([[00-prompt-revisor]] §6): não há plan, não há
> linha na fila gerada, e o resumo do executor vive na conversa. Confira que o estado do código ainda bate
> com o que o bloco afirma antes de despachá-lo — prompt guardado em arquivo envelhece.

````md
Leia specs/00-prompt-executor.md e execute a tarefa abaixo.

**Não há plan para esta tarefa** — a instrução completa é este bloco. Cumpra o
ritual de leitura (§2) pulando o passo 1, e entregue o resumo da §5 **nesta
conversa**, não em arquivo.

**Objetivo:** existe um cartão genérico, `SarakCard`, com cabeçalho, corpo e
rodapé compostos por notação de ponto (`SarakCard.Header`, `.Body`, `.Footer`),
para o consumidor montar cartão próprio sem reconstruir borda, sombra, raio e
espaçamento na mão.
**Dentro do escopo:** `src/components/atomic/Cards/` (o componente, as três
peças, o barril da categoria e os testes), `src/index.ts`, e os gerados por
regeneração.
**Fora do escopo:** alterar `SarakActionCard`, `SarakTitleCard`,
`SarakSearchCard`, `ExpandableCard` ou `ImageCard` — nem para fazê-los usar o
novo. Criar token novo: o cartão usa os tokens de cartão que já existem
(`--sarak-card-*`); faltou algum, pare e pergunte. Nada em `specs/`.
**Referências:** skills `ui-novo-componente`, `ui-arquitetura-design`,
`test-unitario` · `specs/arquitetura/03-superficie-publica.md` (§3 — como o
coletor deriva a superfície: peça em subpasta de categoria **sem** barril escapa
do gate e do catálogo; §6.1.1 — merge de className) ·
`src/components/atomic/Cards/SarakActionCard.tsx` e o hook controlador de
Cards.
**Atenção ao gate:** subcomponente exposto por notação de ponto precisa chegar
ao `barrel:check` e ao catálogo. Confira como o coletor enxerga as três peças
**antes** de decidir onde os arquivos moram, e relate no resumo o que mediu.
**Pronto quando:** as três peças são opcionais e em qualquer ordem; o cartão
respeita o raio, a sombra e a superfície do tema ativo; testes 1:1 cobrindo o
cartão completo, só corpo, e a sobrescrita por `className`; `barrel:check` e
`catalog:check` verdes com os gerados regenerados; `npm run audit` no baseline;
`npx vitest run` inteiro verde.
````
