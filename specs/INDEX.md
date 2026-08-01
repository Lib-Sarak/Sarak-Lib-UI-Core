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

> **Atalho para quem vai EDITAR a lib:** o kit do mantenedor, [`sarak-dev/`](../sarak-dev/START-HERE.md), é o índice operacional desta base — ele diz em que ordem ler, qual fluxo seguir para cada tipo de mudança, e qual é o estado real do repositório agora (recontado por geração, nunca escrito à mão).

> **Sobre a regra de precedência:** os três primeiros diretórios não competem entre si. `arquitetura/` descreve o **estado**, `adr/` registra a **decisão**, `specs/` fixa a **regra**. Quando um deles precisar do assunto de outro, ele **aponta** — não repete. Conteúdo duplicado entre categorias é dívida, porque uma das cópias envelhece primeiro e ninguém percebe.

---

## `arquitetura/` — 6 documentos macro (vivos)

| Documento | O que responde |
| --- | --- |
| [`00-mapa-do-modulo.md`](./arquitetura/00-mapa-do-modulo.md) | Onde cada coisa mora e o que pode importar o quê. |
| [`01-forma-do-produto-e-modos-de-consumo.md`](./arquitetura/01-forma-do-produto-e-modos-de-consumo.md) | O que a lib **é** hoje, e os dois modos de consumo. |
| [`02-design-engine.md`](./arquitetura/02-design-engine.md) | Como um `design` vira tela. |
| [`03-superficie-publica.md`](./arquitetura/03-superficie-publica.md) | O que o consumidor alcança — barril, catálogo, fronteiras lazy. |
| [`04-contrato-de-tokens-e-paridade.md`](./arquitetura/04-contrato-de-tokens-e-paridade.md) | O dicionário, as duas alavancas e o que "paridade" significa hoje. |
| [`05-build-e-distribuicao.md`](./arquitetura/05-build-e-distribuicao.md) | Como o pacote é produzido e entregue. |

> **Nota de numeração:** o número no NOME é ordem de **leitura**, não de execução. O `01` sai antes do `00` de propósito — a forma do produto é pré-requisito do mapa.

## `adr/` — 8 decisões (imutáveis)

Índice completo, com status e o protocolo de substituição, em [`adr/README.md`](./adr/README.md). Comece pelo **001**, que enquadra os três da mesma virada.

## `specs/` — 15 specs definitivas (vivas)

| Documento | O que fixa |
| --- | --- |
| [`00-regras-e-invariantes.md`](./specs/00-regras-e-invariantes.md) | **O contrato único.** As 17 regras, cada uma com o gate que a cobra — ou a admissão de que nenhum cobra. |
| [`01-gates-e-baseline.md`](./specs/01-gates-e-baseline.md) | Como rodar e ler cada gate, e o **baseline** (que não é zero). |
| [`02-enforcement-por-commit.md`](./specs/02-enforcement-por-commit.md) | Quando cada verificação roda. |
| [`03-versionamento-e-release.md`](./specs/03-versionamento-e-release.md) | O número da versão, o ritual de release e a tag. |
| [`04-shell-e-discovery.md`](./specs/04-shell-e-discovery.md) | O host, o registro de módulos e a navegação. |
| [`05-cromo-e-slots.md`](./specs/05-cromo-e-slots.md) | O cromo apresentacional e as regiões extensíveis. |
| [`06-painel-de-customizacao-e-preview.md`](./specs/06-painel-de-customizacao-e-preview.md) | O painel do Design Engine e o preview. |
| [`07-responsividade-e-multidispositivo.md`](./specs/07-responsividade-e-multidispositivo.md) | Os três caminhos de responsividade. |
| [`08-identidade-do-host-e-zero-marca.md`](./specs/08-identidade-do-host-e-zero-marca.md) | Título, favicon e marca pertencem ao importador. |
| [`09-temas-e-presets.md`](./specs/09-temas-e-presets.md) | Tema e preset como a mesma primitiva, e o anti-drift. |
| [`10-seguranca-e-acessibilidade.md`](./specs/10-seguranca-e-acessibilidade.md) | Sanitização, foco, e o que a lib promete de a11y. |
| [`11-testes-e-cobertura.md`](./specs/11-testes-e-cobertura.md) | A cobertura 1:1, a suíte e as lacunas declaradas. |
| [`12-kit-do-consumidor.md`](./specs/12-kit-do-consumidor.md) | O `sarak-ui/` — o que o importador recebe. |
| [`13-instalacao-e-atualizacao.md`](./specs/13-instalacao-e-atualizacao.md) | O caminho do importador, do install ao update. |
| [`14-artefatos-do-mantenedor.md`](./specs/14-artefatos-do-mantenedor.md) | O `sarak-dev/` — o kit de quem edita a lib. |

## `plan/` — a campanha em curso

**Campanha 2 — "Adequação do Sistema"**, semeada em 2026-07-31. Porta de entrada em [`plan/00-indice.md`](./plan/00-indice.md).

---

## Estado desta base (2026-07-31)

**A reescrita terminou.** A campanha "Reescrita da Base de Specs" fechou no P25: os documentos aposentados foram removidos, e **todo arquivo presente nestas três categorias está vigente**. A convivência entre documento novo e antigo, que valeu durante a campanha, acabou.

Isso muda o que você pode assumir ao ler:

- A presença de um arquivo em `arquitetura/`, `adr/` ou `specs/` **é** garantia de que ele descreve o estado atual. Ainda assim, confira o `status` no frontmatter — e, na dúvida, confirme no código.
- **O que não existe aqui, não existe.** Se um documento, uma skill ou um comentário de código mandar você abrir um arquivo que não está nas listas acima, o ponteiro está morto: registre e pergunte.
- A **dívida conhecida** do módulo não foi apagada com os documentos antigos — ela está catalogada, com `arquivo:linha` e rota, em [`plan/00-prompts-execucao.md`](./plan/00-prompts-execucao.md) (29 achados) e em [`specs/01-gates-e-baseline.md`](./specs/01-gates-e-baseline.md).

Se você encontrar uma spec que descreve algo que não existe no código, isso não é uma descoberta sua a corrigir sozinho: registre e pergunte. O caminho está em [`README.md`](./README.md).
