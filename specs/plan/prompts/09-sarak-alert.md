# Prompt direto 09 — `SarakAlert`

> Escrito em **2026-09-19** pelo revisor. Prompt **direto** ([[00-prompt-revisor]] §6): não há plan, não há
> linha na fila gerada, e o resumo do executor vive na conversa. Confira que o estado do código ainda bate
> com o que o bloco afirma antes de despachá-lo — prompt guardado em arquivo envelhece.

````md
Leia specs/00-prompt-executor.md e execute a tarefa abaixo.

**Não há plan para esta tarefa** — a instrução completa é este bloco. Cumpra o
ritual de leitura (§2) pulando o passo 1, e entregue o resumo da §5 **nesta
conversa**, não em arquivo.

**Objetivo:** a lib passa a ter aviso fixo na página, `SarakAlert`, nas quatro
intenções (informação, sucesso, atenção, erro), com título, texto, ícone, ação
opcional e fechamento opcional — o que o `useToast`, que é efêmero, não resolve.
**Dentro do escopo:** `src/components/atomic/Feedback/` (componente, barril da
categoria, teste 1:1), `src/index.ts`, e os gerados por regeneração.
**Fora do escopo:** o sistema de toast e o `SarakOverlayProvider`. Criar token
novo ou nome de ícone novo: use as intenções de cor que os temas já definem e
nomes que estejam no `IconMap` (o contrato de ícones é fechado, com 100 nomes —
`03-superficie-publica` §6.2); faltou, pare e pergunte. Nada em `specs/`.
**Referências:** skills `ui-novo-componente`, `ui-arquitetura-design`,
`test-unitario` · `specs/arquitetura/03-superficie-publica.md` §6.1 e §6.2 ·
`specs/specs/10-seguranca-e-acessibilidade.md` (papel e anúncio de mensagem
importante) · `src/components/atomic/Feedback/SarakToast.tsx`, de onde você tira
o vocabulário de intenção já em uso, para não inventar um segundo.
**Pronto quando:** as quatro intenções saem com cor de token e passam no
contraste nos dois modos; o botão de fechar é `SarakIconButton`, não elemento
cru; teste 1:1 cobrindo as quatro intenções, a ação e o fechamento;
`barrel:check` e `catalog:check` verdes com os gerados regenerados; `npm run
audit` no baseline; `npx vitest run` inteiro verde.
````
