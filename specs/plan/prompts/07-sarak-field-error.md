# Prompt direto 07 — `SarakFieldError`

> Escrito em **2026-09-19** pelo revisor. Prompt **direto** ([[00-prompt-revisor]] §6): não há plan, não há
> linha na fila gerada, e o resumo do executor vive na conversa. Confira que o estado do código ainda bate
> com o que o bloco afirma antes de despachá-lo — prompt guardado em arquivo envelhece.

````md
Leia specs/00-prompt-executor.md e execute a tarefa abaixo.

**Não há plan para esta tarefa** — a instrução completa é este bloco. Cumpra o
ritual de leitura (§2) pulando o passo 1, e entregue o resumo da §5 **nesta
conversa**, não em arquivo.

**Objetivo:** a mensagem de erro de campo passa a ter um componente próprio,
`SarakFieldError`, com a mesma cor, tipografia, ícone e espaçamento em qualquer
formulário do consumidor.
**Dentro do escopo:** `src/components/atomic/Feedback/` ou
`src/components/atomic/Layouts/` — escolha pela categoria onde o componente é
procurado e **justifique no resumo** —, mais o barril da categoria, o teste 1:1,
`src/index.ts` e os gerados por regeneração.
**Fora do escopo:** mudar a prop `error` que `SarakInput`, `SarakSelect`,
`SarakTextarea`, `SarakDatePicker` e `SarakMultiSelect` já têm. O componente
novo é para o consumidor compor; a integração dos átomos com ele, se fizer
sentido, é tarefa seguinte. Criar token novo. Nada em `specs/`.
**Referências:** skills `ui-novo-componente`, `ui-arquitetura-design`,
`test-unitario` · `specs/arquitetura/03-superficie-publica.md` §6.1 ·
`specs/specs/10-seguranca-e-acessibilidade.md` (a mensagem precisa ser
anunciada por leitor de tela e associável ao campo) · como
`src/components/atomic/Inputs/SarakInput.tsx` desenha hoje o texto de `error` —
o componente novo tem de sair igual, e você diz no resumo se saiu.
**Pronto quando:** o componente aceita a mensagem e o id do campo que descreve,
usa o papel acessível correto, não ocupa espaço quando não há erro; teste 1:1
cobrindo com mensagem, sem mensagem e a associação com o campo; barril e
catálogo regenerados e verdes; `npm run audit` no baseline; `npx vitest run`
inteiro verde.
````
