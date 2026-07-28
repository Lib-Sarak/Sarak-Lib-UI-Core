# ADR — Registros de Decisão Arquitetural

Esta pasta guarda o **porquê** da Sarak-Lib-UI-Core.

Um ADR (*Architecture Decision Record*) registra uma decisão estrutural que já foi tomada: qual era o problema, o que se decidiu, e o que isso custou. Ele não descreve como o código funciona hoje — isso é `arquitetura/` — nem o que uma funcionalidade deve fazer — isso é `specs/`. Ele responde à pergunta que nenhum código responde sozinho: *"por que isto é assim, e não do outro jeito?"*

Escreva um ADR quando a decisão for **estrutural e cara de reverter**: adotar ou abandonar uma arquitetura, remover uma capacidade, fixar um modelo de consumo, aceitar um trade-off que vai incomodar depois. Decisão pequena e reversível não precisa de ADR — precisa de um commit com boa mensagem.

## A regra que define esta pasta: ADR é IMUTÁVEL

**Um ADR nunca é editado para mudar a decisão que ele registra.** Se a decisão mudar, ela não some do histórico — ela é **substituída**:

1. Crie um ADR **novo**, com o número seguinte, explicando o novo contexto e a nova decisão.
2. No ADR novo, preencha `substitui: "[[NNN-nome-do-antigo]]"`.
3. No ADR antigo, preencha `substituido_por: "[[MMM-nome-do-novo]]"` e mude o `status` para `🔴 Substituído`.

Esses dois campos do frontmatter são a única edição legítima num ADR já aceito — mais correções de digitação e links quebrados. Reescrever a decisão apaga a informação mais valiosa que o documento carrega: **o que se sabia na época**. Um ADR "errado" continua sendo um registro correto de uma decisão tomada com o que se sabia então, e é exatamente isso que impede a próxima pessoa de repetir o erro.

## Convenção de nome

```
NNN-kebab-case.md
```

Três dígitos, sempre, com zeros à esquerda (`001`, `007`, `042`). A numeração é **sequencial e nunca reaproveitada** — nem quando um ADR é substituído, nem quando um é rejeitado. Um número queimado é mais barato que um link ambíguo.

O nome descreve a decisão, não o assunto: `003-remocao-backend-proprio` diz o que foi decidido; `003-backend` só diz sobre o que se falou.

## Formato

Use `../_templates/template-adr.md`. O frontmatter completo, e três seções, nesta ordem:

1. **Contexto e Problema** — o que forçou a decisão. Traga a evidência: `arquivo:linha`, a saída do comando, o incidente medido. Contexto sem prova vira opinião com data.
2. **Decisão** — o que se decidiu, em voz ativa.
3. **Consequências** — Positivas e **Negativas (Trade-offs)**. Um ADR sem trade-off registrado está incompleto: toda decisão estrutural custa alguma coisa, e quem lê precisa saber o quê.

Ponha a **data da decisão no corpo** do documento. Mantenha curto — uma a duas páginas. Se estiver ficando longo, provavelmente há duas decisões ali, e elas querem dois ADRs.

## Os ADRs desta base

| # | Decisão | Status |
| --- | --- | --- |
| [001](./001-tres-arquiteturas.md) | As três arquiteturas e por que sobraram duas | 🟢 Aceito |
| [002](./002-remocao-motor-manifesto.md) | Remoção do renderizador de páginas por manifesto (#2) | 🟢 Aceito |
| [003](./003-remocao-backend-proprio.md) | Remoção do backend próprio — tema é dado no código do consumidor | 🟢 Aceito |
| [004](./004-remocao-design-agent.md) | Remoção do Design Agent (agente LLM embarcado) | 🟢 Aceito |
| [005](./005-modelo-modulos-plugin-e-apps-separados.md) | Modelo módulos-plugin oficial e a composição apps-separados | 🟢 Aceito |
| [006](./006-zero-marca-soberania-host.md) | A lib nunca estampa a própria marca | 🟢 Aceito |
| [007](./007-distribuicao-por-git.md) | Distribuição por Git, sem registry npm | 🟢 Aceito |

Comece pelo **001** — ele enquadra os outros três da mesma virada (002, 003, 004) e explica a regra de corte que os produziu.
