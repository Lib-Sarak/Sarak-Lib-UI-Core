# Prompt direto 06 — `SarakSpinner`

> Escrito em **2026-09-19** pelo revisor. Prompt **direto** ([[00-prompt-revisor]] §6): não há plan, não há
> linha na fila gerada, e o resumo do executor vive na conversa. Confira que o estado do código ainda bate
> com o que o bloco afirma antes de despachá-lo — prompt guardado em arquivo envelhece.

````md
Leia specs/00-prompt-executor.md e execute a tarefa abaixo.

**Não há plan para esta tarefa** — a instrução completa é este bloco. Cumpra o
ritual de leitura (§2) pulando o passo 1, e entregue o resumo da §5 **nesta
conversa**, não em arquivo.

**Objetivo:** a lib passa a ter um indicador de carregamento pontual,
`SarakSpinner`, para uso dentro de botão, campo ou célula — o vão que o
`SarakSkeleton`, que é de layout de página, não cobre.
**Dentro do escopo:** `src/components/atomic/Feedback/` (componente, barril da
categoria e teste 1:1), `src/index.ts`, e os artefatos gerados por regeneração.
**Fora do escopo:** mexer no `SarakSkeleton` ou no `isLoading` do
`SarakButton` — se o spinner puder substituir o que o botão já desenha, diga no
resumo e **não faça**. Criar token novo: use os existentes; faltou, pare e
pergunte. Nada em `specs/`.
**Referências:** skills `ui-novo-componente`, `ui-arquitetura-design`,
`test-unitario` · `specs/arquitetura/03-superficie-publica.md` ·
`specs/specs/10-seguranca-e-acessibilidade.md` (o papel e o rótulo acessível de
um indicador de progresso) · `src/components/atomic/Feedback/SarakSkeleton.tsx`,
de onde você copia o idioma da categoria.
**Pronto quando:** tamanhos acompanham a escala já usada pelos átomos
(pequeno, médio, grande), a cor vem de token e acompanha o tema, o componente
tem rótulo acessível e respeita `prefers-reduced-motion`; teste 1:1; barril e
catálogo regenerados com `barrel:check` e `catalog:check` verdes; `npm run
audit` no baseline; `npx vitest run` inteiro verde.
````
