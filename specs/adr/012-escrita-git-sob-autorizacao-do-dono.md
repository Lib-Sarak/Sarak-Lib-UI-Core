---
tipo: "adr"
titulo: "Escrita no Git sob autorização expressa do dono"
status: "🟢 Aceito"
tags: ["adr", "git", "operacao", "governanca", "co-autoria"]
relacionados: ["[[17-contrato-de-operacao-git]]", "[[16-integracao-continua]]", "[[00-contexto]]"]
substitui: ""
substituido_por: ""
alternativas_consideradas:
  - opcao: "Manter o modelo de 2026-08-19 — nenhum agente muta o repositório, em nenhuma hipótese"
    custo: "O dono digita todo comando mesmo quando quer explicitamente delegar, e a leitura absoluta da frase já tem falha registrada: em 2026-08-19 um agente recusou-se a rodar git status e gastou duas rodadas sem entregar diagnóstico"
  - opcao: "Abrir a escrita ao agente sem exigir autorização — ele muta quando julgar necessário"
    custo: "Recria a autorização de fachada que o contrato de operação Git rejeita por escrito, e deixa a credencial que fura a proteção da main alcançável sem que ninguém tenha decidido nada naquela conversa"
---

> **Molde de ADR.** Critério de `00-prompt-revisor.md` §5.2: só é ADR quem tem **duas alternativas
> reais**, cada uma com um **custo nomeado**, e para quem voltar atrás seria caro. Sem preencher
> `alternativas_consideradas` com duas entradas e o custo de cada, não houve trade-off — não é ADR, é
> decisão óbvia (biblioteca evidente, convenção já existente, bug corrigido, refactor), e o destino dela
> é outro.

# 1. Contexto e Problema

**Data da decisão: 2026-09-02.**

Até aqui, este repositório afirmava **uma regra só** onde havia duas. A frase de `00-contexto.md:327` —
*"Quem commita é o usuário — vale para todo agente, **sem exceção** e sem co-autoria"* — amarrava num
único enunciado duas coisas que não têm a mesma natureza: **quem assina** um commit e **quem digita** um
comando. A [[17-contrato-de-operacao-git]] §2.0 fazia o mesmo, listando `add`/`commit`/`push` sob o
rótulo *"⛔ **Nunca muta**"*, sem porta nenhuma.

A fusão cobrava um preço que só aparecia no uso: **o dono não conseguia delegar nem quando queria.** Não
havia como dizer *"faça este commit"* sem que a instrução colidisse com uma proibição escrita como
absoluta — e um agente disciplinado recusa, corretamente, o que a spec proíbe sem ressalva.

A decisão do dono, na íntegra:

> *"Coautoria é expressamente proibido sempre, o usuário commita e faz push, o agente pode realizar apenas
> consultas diretamente, escritas no git e github são de responsabilidade do usuário a menos que o próprio
> usuário solicite e autorize."*

Ela separa os dois eixos: **co-autoria é absoluta e não tem exceção**; **escrita é do dono por padrão, com
uma porta que só o dono abre**.

## A garantia que esta decisão retira

A [[17-contrato-de-operacao-git]] §2.1 afirmava que o modelo anterior *"resolve o acesso **por
construção**: nenhum agente **pode** tocar a credencial que fura a proteção da `main` — porque nenhum
agente executa o `git push` que a usaria."* A exceção de administrador que essa frase cita é real e está
medida em [[16-integracao-continua]] §2.1 (`enforcement_level: "non_admins"`).

Com a porta aberta, **essa garantia deixa de ser estrutural e passa a ser de política**. Um agente
autorizado a empurrar alcança a credencial. Nada no mecanismo o impede: o que o impede é a decisão de
quem autoriza, tomada uma vez por conversa.

**Registrar isto é metade do valor deste ADR.** Uma spec que continuasse afirmando garantia por
construção estaria descrevendo uma segurança que o repositório não tem — o defeito que
[[15-divida-conhecida]] §3.3 cataloga como o mais reincidente desta base.

# 2. Decisão

**A fronteira de operação de Git passa a ser a INICIATIVA, não a mutação.**

- Nenhum agente escreve no Git ou no GitHub **por conta própria**. Sem pedido, ele entrega o comando
  pronto e o dono digita — o modelo que continua sendo o padrão, e o caminho normal.
- **Solicitação e autorização expressa do dono, naquela conversa**, é a única porta que abre a escrita.
  Ela vale para aquele ato, não para os seguintes.
- **Leitura permanece livre e obrigatória.** `status`, `log`, `diff`, `show`, `describe`, `branch`,
  `tag --list`, `fetch` e os `*:check` são do agente, sempre — é o que torna a instrução boa, e é o que a
  §2.0 da `17` já dizia.
- **Co-autoria é proibida sempre, sem exceção, e não é afetada por nada acima.** Nenhuma linha
  `Co-Authored-By` de agente, em nenhuma hipótese — nem em commit que o agente digite, nem em commit que
  ele apenas instrua.

**As seis proibições absolutas da [[17-contrato-de-operacao-git]] §3 não mudam.** Elas são sobre *o que
não se faz* — apagar tag publicada, `--force` em branch compartilhada, `squash` no merge para a `main` —,
não sobre *quem digita*. Autorização do dono não dissolve nenhuma delas.

# 3. Consequências

- **Positivas:**
  - **O dono passa a poder delegar sem contradizer a própria spec.** A porta existe, é dele, e é
    explícita.
  - **A regra de co-autoria fica mais forte, não mais fraca.** Solta do eixo de escrita, ela deixa de ser
    lida como cláusula pendurada numa exceção e volta a ser o absoluto que sempre foi.
  - **A fronteira fica dita em termos de intenção** — *iniciativa própria* —, que é o que a §2.0 já vinha
    tentando exprimir desde o incidente de paralisia de 2026-08-19, quando um agente leu *"não executa
    absolutamente nada"* ao pé da letra e se recusou a rodar `git status`.

- **Negativas (Trade-offs):**
  - 🔴 **A garantia de acesso à credencial deixa de ser estrutural.** É o custo central, e não tem
    mitigação: um agente autorizado a `push` alcança a exceção de administrador da `main`. O que sobra é
    a disciplina de quem autoriza — política, não mecanismo.
  - **A responsabilidade do erro muda de lugar.** No modelo anterior, comando errado era o dono rodando
    o comando errado, e ele via a saída ([[17-contrato-de-operacao-git]] §2.2). Com o agente executando,
    o efeito acontece sem que ninguém tenha lido a linha antes.
  - **A superfície de julgamento cresce.** *"O dono solicitou e autorizou?"* é uma pergunta que um agente
    pode errar para os dois lados: recusar o que foi pedido, ou presumir autorização de um pedido vago.
    Nenhum gate decide isso.

> **Voltar atrás é barato em linhas e caro em repetição.** Reverter esta decisão é reescrever meia dúzia
> de parágrafos. O que não se recupera é o motivo: sem este registro, um agente futuro lê a
> [[17-contrato-de-operacao-git]] §2.1 antiga,
> reconhece o argumento da garantia por construção como bom — porque ele é bom — e **repropõe a
> reversão**, sem saber que ela já foi pesada e decidida. É a função que [[00-contexto]] §4.1 atribui aos
> ADRs, e a razão de este existir.
