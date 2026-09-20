# Prompt direto 10 — `SarakAvatar` e `SarakDivider`

> Escrito em **2026-09-19** pelo revisor. Prompt **direto** ([[00-prompt-revisor]] §6): não há plan, não há
> linha na fila gerada, e o resumo do executor vive na conversa. Confira que o estado do código ainda bate
> com o que o bloco afirma antes de despachá-lo — prompt guardado em arquivo envelhece.

````md
Leia specs/00-prompt-executor.md e execute a tarefa abaixo.

**Não há plan para esta tarefa** — a instrução completa é este bloco. Cumpra o
ritual de leitura (§2) pulando o passo 1, e entregue o resumo da §5 **nesta
conversa**, não em arquivo.

**Objetivo:** duas primitivas que faltam — `SarakAvatar` (imagem de pessoa, com
recurso às iniciais quando não há imagem, e tamanhos na escala dos átomos) e
`SarakDivider` (separador horizontal e vertical, com rótulo opcional no meio).
**Dentro do escopo:** `src/components/atomic/Atoms/` para o avatar e
`src/components/atomic/Layouts/` para o separador, mais os barris das duas
categorias, os testes 1:1, `src/index.ts` e os gerados por regeneração.
**Fora do escopo:** grupo de avatares empilhados, indicador de presença, upload
de foto. Criar token novo. Trocar o separador que outros componentes já
desenham por conta própria. Nada em `specs/`.
**Referências:** skills `ui-novo-componente`, `ui-arquitetura-design`,
`test-unitario` · `specs/arquitetura/03-superficie-publica.md` §6 (a taxonomia
das categorias) · `src/components/atomic/Atoms/SarakTypography.tsx` e
`src/components/atomic/Layouts/SarakFlex.tsx`, de onde sai o idioma de cada
categoria.
**Pronto quando:** o avatar cai nas iniciais quando a imagem falha de verdade
(teste com erro de carregamento, não só com `src` vazio) e tem texto
alternativo; o separador funciona nas duas orientações e some do leitor de tela
quando é puramente decorativo; testes 1:1 dos dois; `barrel:check` e
`catalog:check` verdes com os gerados regenerados; `npm run audit` no baseline;
`npx vitest run` inteiro verde.
````
