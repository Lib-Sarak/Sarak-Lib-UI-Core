---
tipo: "adr"
titulo: "O item de navegação horizontal usa caixa normal e corpo legível, não tipografia de etiqueta"
status: "🟢 Aceito"
tags: ["adr", "atomos", "cromo", "navegacao", "tipografia", "major"]
relacionados: ["[[05-cromo-e-slots]]", "[[04-shell-e-discovery]]", "[[00-regras-e-invariantes]]"]
substitui: "[[013-item-de-navegacao-como-atomo-proprio]]"
substituido_por: ""
alternativas_consideradas:
  - opcao: "Manter a caixa alta, em paridade com o TopbarNav histórico do Shell"
    custo: "Nenhuma quebra e nenhuma divergência da aparência histórica. Mas o alvo de clique principal do sistema segue com a tipografia de quem rotula uma seção — 10px, caixa alta, 1px entre letras —, a causa mais provável da impressão de que o menu da topbar não parece um menu."
  - opcao: "Caixa normal com corpo legível (ESCOLHIDA)"
    custo: "É MAJOR: muda a aparência de toda topbar sem o consumidor tocar em nada, e o item horizontal diverge do visual histórico do Shell. Voltar atrás seria outro MAJOR."
---

# 1. Contexto e Problema

Decidido pelo dono em **2026-09-09**; implementado e aprovado em **2026-09-11**.

O [[013-item-de-navegacao-como-atomo-proprio]] fixou, entre as métricas por orientação, *"`horizontal` —
aba compacta (topbar): pílula, caixa alta, peso forte"*, por paridade com o `TopbarNav` do Shell. A mudança
foi registrada como MAJOR, com escape pela `className` do chamador, e a decisão sobre a caixa alta foi
levada ao dono três vezes sem resposta.

Ela voltou com dado. O dono avaliou a topbar do modo ui-kit como *"pobre em funcionalidade e aparência"*,
e a medição em Chromium real, sobre o `dist/` publicado, no item de navegação horizontal:

| Propriedade computada | Item horizontal | Item vertical |
| --- | --- | --- |
| `font-size` | **10px** | 12,25px |
| `text-transform` | **uppercase** | none |
| `letter-spacing` | **1px** | normal |

Um rótulo de menu a 10px, em caixa alta, com espaçamento largo entre letras, é tipografia de rótulo de
seção — aplicada ao alvo de clique principal do sistema.

# 2. Decisão

**No ramo `horizontal` do `SarakMenuItem`, o rótulo usa caixa normal, espaçamento normal entre letras e
corpo legível.** Continuam a pílula, o peso forte do item, o realce de ativo e o truncamento do rótulo — é
isso que distingue uma aba de uma lista, e não a caixa alta.

**O que este ADR substitui do 013 é só isso: um valor tipográfico de uma das duas orientações.** O núcleo
do 013 segue vigente — o item de navegação é átomo próprio, com métrica de navegação e não de botão de
ação; o ramo vertical não muda; a `className` do chamador segue vencendo o default do átomo
([[00-regras-e-invariantes]] **R35**).

# 3. Consequências

- **Positivas:**
  - O menu da topbar lê como navegação.
  - Os dois cromos saem coerentes: o `TopbarNav` do Shell não tem métrica tipográfica própria concorrente,
    e o átomo que desenha os dois é o mesmo.

- **Negativas (Trade-offs):**
  - **MAJOR**: toda topbar muda de aparência; quem queria a caixa alta a pede pela `className`.
  - **A pílula é contrato e hoje não renderiza.** A mesma investigação mediu que uma regra global de raio
    para botões (`src/styles/_utilities.css`), fora de qualquer `@layer`, vence todo `rounded-*` em todo
    `<button>` da lib: o item horizontal computa o raio do botão de ação. Este ADR não muda isso — o
    conserto alcança todo botão e pede decisão própria ([[00-backlog]]). O harness de navegador mantém o
    contrato da pílula como falha esperada até lá.
