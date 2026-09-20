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
**Pronto quando:** teclado completo (setas, Enter, Esc, Tab) e papéis acessíveis
corretos; testes cobrindo lista fixa, busca assíncrona, resultado vazio, erro na
busca, resposta fora de ordem descartada e seleção por teclado; nenhuma chamada
de rede dentro do componente (mostre no resumo o que prova isso);
`barrel:check` e `catalog:check` verdes com os gerados regenerados; `npm run
audit` no baseline; `npx vitest run` inteiro verde.
````
