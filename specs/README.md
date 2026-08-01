# 🧭 Como usar o diretório de Specs

Este diretório descreve a Sarak-Lib-UI-Core: **o que ela é**, **por que ficou assim** e **quais regras valem**. O mapa das categorias e a ordem de leitura estão em [`INDEX.md`](./INDEX.md); aqui está o **fluxo** — o que entra em cada pasta, quem pode ser editado e como se escreve um documento novo.

## O princípio que governa tudo aqui

> **O código é a fonte da verdade.** Onde um documento desta pasta contradiz o código, o código vence — sem exceção. Toda afirmação estrutural precisa ser confirmável por `arquivo:linha`.

Uma spec que descreve código inexistente é **pior que nenhuma spec**: ela custa a mesma leitura e entrega instrução errada, com a autoridade de estar versionada. Foi exatamente isso que motivou a reescrita em curso — quatro documentos ainda descreviam como vigente um motor que havia sido removido.

Corolário prático: **nunca transcreva fonte viva.** Lista de tokens, de componentes, de props ou de ícones não é copiada para dentro de markdown — aponte para o artefato gerado (`docs/component-catalog.json`, `sarak-ui/catalog.json`) ou para a função que a produz. Cópia estática vira mentira na primeira mudança de código.

## Onde cada coisa mora

### `arquitetura/` — a visão macro (o **COMO**)

O estado estrutural do módulo: as camadas e a regra de dependência entre elas, a forma do produto e os modos de consumo, o Design Engine, o contrato de tokens, a superfície pública, o build e a distribuição.

**Natureza: vivo.** Quando a arquitetura muda, este documento muda junto — no mesmo trabalho, não depois. Molde: `_templates/template-arquitetura.md`.

### `adr/` — as decisões (o **POR QUÊ**)

Por que se decidiu o que se decidiu, e o que isso custou. É onde vive o conhecimento que o código não guarda: o que já foi tentado, o que falhou, e por qual motivo.

**Natureza: IMUTÁVEL.** Um ADR não é editado para mudar a decisão — cria-se um ADR novo que o substitui, ligado pelos campos `substitui`/`substituido_por`. A regra completa e a convenção de nome estão em [`adr/README.md`](./adr/README.md). Molde: `_templates/template-adr.md`.

### `specs/` — as regras e features (o **QUÊ**)

Um tópico por documento: as regras e invariantes do módulo, os gates e seu baseline, e cada feature com seu contrato, seus critérios de aceite e seu plano de testes.

**Natureza: vivo.** Molde: `_templates/template-spec.md`.

### `plan/` — o plano transitório (o **AGORA**)

**Aqui, planos de implementação EXISTEM e são versionados** — ao contrário da regra genérica do ecossistema, que manda mantê-los fora do repositório. Esta é uma escolha deliberada deste módulo, e ela vem com uma contrapartida que a torna segura.

A `plan/` guarda **uma campanha por vez**, em três arquivos fixos: `00-indice.md` (a porta de entrada), `00-prompts-execucao.md` (o plano executável) e `00-progresso.md` (o log). O que a impede de virar entulho é que **cada campanha nasce com data de morte**. Toda campanha termina com uma tarefa de fechamento que **limpa e resemeia a pasta**, depois de provar, arquivo por arquivo, que todo conteúdo ainda vivo foi migrado para uma das três categorias permanentes.

Duas regras tornam esse fechamento seguro, e as duas foram pagas com trabalho perdido antes de existirem:

1. **Nada é apagado sem destino demonstrado.** Para cada arquivo removido, mostra-se onde o conteúdo dele foi parar. Sem destino, o arquivo não sai — vira divergência.
2. **Só sai o que foi EXECUTADO.** Item ainda aberto **migra íntegro** para o plano seguinte. Apagar uma etapa não executada não limpa o plano: destrói trabalho que ninguém fez ainda e que ninguém vai lembrar de refazer.

O motivo de os planos serem versionados aqui: uma campanha atravessa várias conversas e vários agentes sem contexto compartilhado. O plano em disco é o que torna a execução **retomável e auditável** por quem chega no meio.

**Natureza: descartável.** Não aponte para `plan/` a partir de `arquitetura/`, `adr/` ou `specs/` — o alvo vai deixar de existir, e link quebrado é dívida que sobrevive ao arquivo.

### `_templates/` — os moldes

Todo documento novo nasce do template da sua categoria, com o frontmatter completo. **Nada de campo inventado**, e `status` honesto — um `🟢` que não corresponde ao código é a mesma classe de defeito que a reescrita veio corrigir.

## Onde vive o histórico

**No git, e no `plan/00-progresso.md` enquanto a campanha durar.**

O `00-progresso.md` é um log *append-only*: cada execução acrescenta uma entrada no topo, e nenhuma entrada já escrita é editada ou apagada. Ele existe para que um agente entenda rapidamente o que já foi feito, como e quando, sem reconstruir o raciocínio lendo o diff inteiro. Ele **atravessa** o fechamento de campanha — as entradas antigas continuam ali, e o histórico integral permanece também onde sempre esteve, no git.

Documento permanente não carrega histórico de execução. Se você sentir vontade de escrever "antes era assim, agora é assado" numa spec, o lugar disso é um ADR (se foi decisão) ou `docs/migracoes.md` (se afeta o consumidor).

## Ao encontrar uma divergência

Se o código não bate com o documento, se o escopo não fecha, ou se dois documentos disputam o mesmo conteúdo:

**Pare. Não decida sozinho. Não contorne.**

Registre o que o documento diz, o que o código mostra (com `arquivo:linha`), as opções que você vê e sua recomendação — e peça aprovação. **Obstáculo se registra, não se contorna**: um contorno silencioso resolve o seu dia e deixa a próxima pessoa com o mesmo problema, agora escondido.
