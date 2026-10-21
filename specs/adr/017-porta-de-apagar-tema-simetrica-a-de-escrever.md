---
tipo: "adr"
titulo: "Tema salvo em runtime também se apaga por uma porta — simétrica à de escrever"
status: "🟢 Aceito"
tags: ["adr", "persistencia", "temas", "contrato", "provider"]
relacionados: ["[[011-tema-salvo-por-uma-porta-de-escrita]]", "[[003-remocao-backend-proprio]]", "[[09-temas-e-presets]]", "[[03-superficie-publica]]"]
substitui: "[[011-tema-salvo-por-uma-porta-de-escrita]]"
substituido_por: ""
alternativas_consideradas:
  - opcao: "Manter sem porta de apagar, como o ADR-011 decidiu: a lista pertence ao importador e a lib nunca remove o que não guardou"
    custo: "A coleção da sessão nunca encolhe. Tema salvo em runtime fica visível até o reload, e cada consumidor reimplementa a ocultação por conta própria — foi o que o consumidor `login-completo` fez à mão"
  - opcao: "Reconciliar pela prop `customThemes`: o consumidor apaga na fonte dele e a lib esvazia a cópia da sessão quando o id some da lista"
    custo: "Depende do contrato de estabilidade de referência que a `§4.3` da spec 09 já cobra de `customThemes` (um array recriado a cada render realimenta o ciclo), não alcança o tema salvo só em sessão e dá ao consumidor nenhum gesto para avisar a lib de que apagou"
---

# 1. Contexto e Problema

**Data da decisão: 2026-10-03.** Implementada e aprovada em 2026-10-04.

O [[011-tema-salvo-por-uma-porta-de-escrita]] decidiu que o tema salvo pelo usuário final entra por **uma** porta
de escrita, `options.theme.onSave`, e que a leitura já é a prop `customThemes`. Na tabela da §2 ele fixou
também que `onDeleteTheme` **não existe**: *"a lista pertence ao importador; a lib nunca remove o que não
guardou"*, e deixou a consequência escrita: *"sem porta de apagar … a lib não oferece o gesto"*.

O que a execução da persistência mostrou é que a lib **guarda** o tema salvo na sessão (`saveTheme` o funde na
coleção) e, por isso, é a única que sabe como tirá-lo de lá. Sem uma porta, a coleção da sessão não encolhe até o
próximo boot, e o consumidor `login-completo` esconde o tema apagado à mão. O 011 acertou ao não deixar a lib
tocar o armazenamento do importador; o que ele não distinguiu foi **a cópia que a própria lib mantém na sessão**.

# 2. Decisão

**A porta de apagar passa a existir, simétrica à de escrever, e só ela.** O resto do 011 — uma porta de escrita
em `options.theme`, a leitura por `customThemes`, o botão *Salvar* que só aparece com `onSave` — **continua
vigente**.

- **`options.theme.onDelete?: (id: string) => Promise<void> | void`** é a porta opcional do consumidor.
- **`useSarakUI().deleteTheme(id)`** é o gesto: tira o tema da coleção da sessão e então chama `onDelete`.
- **O consumidor continua dono do armazenamento.** `onDelete` é o ponto em que ele remove o tema da própria
  fonte; a lib não toca nela.
- Id desconhecido não faz nada. Salvar de novo um tema com o mesmo id o devolve à coleção.

# 3. Consequências

- **Positivas:**
  - O consumidor deixa de reimplementar a ocultação do tema apagado.
  - **Aditivo na porta:** sem `onDelete`, `deleteTheme` ainda esconde o tema na sessão e nada mais acontece.
  - Mantém a divisão do 011 — a lib sempre embarca os internos e nunca pergunta onde o importador guarda.

- **Negativas (Trade-offs):**
  - **Mais uma superfície pública a manter**, e `SarakUIContextType` passa a **exigir** `deleteTheme`: quem monta
    o contexto à mão (em teste, por exemplo) deixa de compilar. Por isso a mudança entra na nota de
    `docs/migracoes.md` e conta para o nível MAJOR da release.
  - **A coleção encolhe antes de `onDelete` responder.** Se o callback do consumidor falhar, a lib não restaura
    o tema na sessão.
  - **`deleteTheme` também esconde tema embarcado**, só na sessão: o catálogo da lib não muda e o tema volta no
    boot seguinte. A imutabilidade do tema da lib ([[09-temas-e-presets]] §4.4.2) continua valendo — o que muda é
    a lista que a sessão mostra.
  - **A segunda alternativa foi ponderada pelo revisor ao escrever este registro**, a partir do código; não é um
    caminho que o dono tenha pedido.

> **Escopo:** este ADR substitui **só** a linha `onDeleteTheme` e a consequência *"sem porta de apagar"* do 011,
> e nada além. Leia os dois juntos. A implementação é a `plan-93`.
