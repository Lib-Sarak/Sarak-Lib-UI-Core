

> **Porta de entrada (IA):** antes de qualquer coisa, leia [`specs/00-contexto.md`](specs/00-contexto.md) — o que este repositório é, as regras inegociáveis e o mapa de "que spec eu leio para esta tarefa". Depois, conforme o papel: [`specs/00-prompt-revisor.md`](specs/00-prompt-revisor.md) (escreve specs, dá veredito) ou [`specs/00-prompt-executor.md`](specs/00-prompt-executor.md) (executa uma plan). A fila de trabalho está em [`specs/00-indice.md`](specs/00-indice.md).
>
> **Atenção (IA):** Sou um projeto Sarak modular. Sempre que atuar aqui, leia as regras de negócio listadas em `.agents/index.md` antes de codificar.

<!-- A "Regra de Ouro (Time Tracking)" foi REMOVIDA em 2026-08-10 (achado 36 de
     specs/specs/15-divida-conhecida.md). Ela mandava iniciar um cronômetro pela skill/MCP
     `time-tracking`, que NÃO EXISTE em `.agents/skills/` — três executores relataram não
     conseguir cumprir. Instrução impossível treina a ignorar instrução, e este é o primeiro
     arquivo que qualquer agente lê, então o custo de uma regra morta aqui é maior que em
     qualquer outro lugar. Se o apontamento de horas voltar a importar, a regra volta JUNTO
     com a skill que a torna cumprível — nunca antes. -->

<!-- ⚠️ Toda regra escrita aqui é lida por TODO agente, em TODA sessão. Antes de acrescentar
     uma: ela é verificável? Existe a ferramenta que ela exige? Se a resposta a qualquer das
     duas for não, o lugar dela é uma spec — não este arquivo. -->

