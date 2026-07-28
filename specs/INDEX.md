# 🧭 Mapa de Especificações — Sarak-Lib-UI-Core

> **Atenção, agentes:** este diretório é a fonte da verdade sobre o módulo — **exceto quando o código discorda dele.** Onde uma spec contradiz o código, o **código vence**, e a spec é o que precisa ser corrigido. Nunca o contrário.

## As 4 categorias

| Pasta | O que é | Natureza |
| --- | --- | --- |
| [`arquitetura/`](./arquitetura/) | A visão **macro**: as camadas, a forma do produto, os modos de consumo, o Design Engine como central, o contrato de tokens, a superfície pública e o build. | Documento **vivo** |
| [`adr/`](./adr/) | As **decisões** e o porquê delas: as viradas estruturais, o que foi removido e o que isso custou. | Documento **imutável** |
| [`specs/`](./specs/) | As specs **definitivas** de feature e de regra — um tópico por documento. | Documento **vivo** |
| [`plan/`](./plan/) | O plano **transitório** da campanha em curso, com data de morte. | **Descartável** |
| [`_templates/`](./_templates/) | Os moldes obrigatórios de cada categoria. Todo documento novo nasce de um deles. | Estável |

## Ordem de leitura para quem chega agora

**`arquitetura/` → `adr/` → `specs/`.**

Comece pela **arquitetura** para saber *o que a lib é e como ela está montada*. Passe pelos **ADRs** para entender *por que ela é assim* — e, principalmente, o que já foi tentado e descartado, que é o que evita propor de novo o que já falhou. Só então vá às **specs**, que dão a regra detalhada do assunto em que você vai mexer.

Pule a `plan/` a menos que esteja executando a campanha em curso. Ela não descreve o produto; descreve o trabalho.

> **Sobre a regra de precedência:** os três primeiros diretórios não competem entre si. `arquitetura/` descreve o **estado**, `adr/` registra a **decisão**, `specs/` fixa a **regra**. Quando um deles precisar do assunto de outro, ele **aponta** — não repete. Conteúdo duplicado entre categorias é dívida, porque uma das cópias envelhece primeiro e ninguém percebe.

## ⚠️ Estado desta base (2026-07-27)

**A base está sendo reescrita agora.** A campanha "Reescrita da Base de Specs" (`plan/00-prompts-execucao.md`) está em curso, e até ela fechar convivem documentos novos e documentos aposentados **de propósito** — os nomes novos são distintos dos antigos justamente para não colidirem.

| Categoria | Estado |
| --- | --- |
| `adr/` | ✅ **Completa** — os 7 ADRs estão escritos. Índice em [`adr/README.md`](./adr/README.md). |
| `arquitetura/` | 🟡 **Em reescrita.** Os documentos hoje presentes ainda incluem os antigos; alguns descrevem código **já removido**. |
| `specs/` | 🟡 **Em reescrita.** Idem. |
| `plan/` | 🟡 **Será esvaziada** na última tarefa da campanha. |

**A lista completa e definitiva dos documentos de cada categoria será preenchida aqui ao longo da campanha**, e fechada na tarefa final. Até lá, **não trate a presença de um arquivo em `arquitetura/` ou `specs/` como garantia de que ele está vigente** — confira o `status` no frontmatter e, na dúvida, confirme no código.

Se você encontrar uma spec que descreve algo que não existe no código, isso não é uma descoberta sua a corrigir sozinho: registre e pergunte. O caminho está em [`README.md`](./README.md).
