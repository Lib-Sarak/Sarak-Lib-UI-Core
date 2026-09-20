# Prompt direto 04 — documentar as props, leva 2 (botões, cartões, estrutura e retorno)

> Escrito em **2026-09-19** pelo revisor. Prompt **direto** ([[00-prompt-revisor]] §6): não há plan, não há
> linha na fila gerada, e o resumo do executor vive na conversa. Confira que o estado do código ainda bate
> com o que o bloco afirma antes de despachá-lo — prompt guardado em arquivo envelhece.
> ⚠️ Se a `plan-82` (prefixo `Sarak` em toda a superfície pública) já tiver sido executada, os nomes
> `ExpandableCard` e `ImageCard` mudaram — use os nomes novos.

````md
Leia specs/00-prompt-executor.md e execute a tarefa abaixo.

**Não há plan para esta tarefa** — a instrução completa é este bloco. Cumpra o
ritual de leitura (§2) pulando o passo 1, e entregue o resumo da §5 **nesta
conversa**, não em arquivo.

**Objetivo:** cada prop pública dos componentes listados abaixo ganha um
comentário JSDoc que diz o que ela faz, o que acontece quando é omitida e a
armadilha dela, quando houver — e esse texto passa a aparecer no catálogo
gerado, que é o que o consumidor (humano ou agente) lê.
**Dentro do escopo:** SOMENTE os blocos de comentário nas interfaces de props
dos componentes desta leva, mais os artefatos gerados por regeneração
(`docs/component-catalog.*`, `sarak-ui/`, `sarak-dev/`, `dist/`).
**Componentes desta leva:** `SarakButton`, `SarakIconButton`, `SarakIcon`,
`ExpandableCard`, `ImageCard`, `SarakTitleCard`, `SarakSearchCard`,
`SarakEmptyState`, `SarakAccordion`, `SarakSplitPane`.
**Fora do escopo:** mudar nome, tipo, valor padrão, ordem ou comportamento de
qualquer prop; renomear qualquer coisa; tocar em componente fora da lista. Se
achar defeito, **anote no resumo em "Achados fora do escopo" e não conserte**.
Nada em `specs/`.
**Referências:** `specs/arquitetura/03-superficie-publica.md` §5 (o catálogo é
a fonte da verdade do consumidor, e a documentação sai da interface de props) ·
skill `padrao-escrita`, `references/comentarios.md` — comentário explica o
porquê, nunca repete o nome da prop em outras palavras, e **nunca cita plan** ·
os componentes desta leva, que você lê antes de escrever.
**Regra de qualidade, para não virar ruído:** "`disabled` — desabilita o
componente" é pior que nada. O que serve ao consumidor é o que ele não adivinha:
o que acontece sem a prop, o que ela exige junto, o efeito no celular, a
interação com outra prop.
**Pronto quando:** toda prop pública dos componentes da leva tem JSDoc; `npm run
catalog` regenerado e commitado, com `catalog:check` e `guide:check` verdes; o
campo `doc` no `docs/component-catalog.json` deixa de estar vazio para esses
componentes (mostre a contagem antes e depois no resumo); `npx vitest run`
inteiro verde; `npm run audit` no baseline.
````
