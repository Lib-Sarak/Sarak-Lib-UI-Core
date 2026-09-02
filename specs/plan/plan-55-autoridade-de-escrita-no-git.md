---
tipo: "plan"
titulo: "Separar co-autoria absoluta de escrita autorizada no contrato de operação Git"
objetivo: "Separar os dois eixos da regra de Git — co-autoria proibida sempre, escrita no repositório só sob solicitação e autorização do dono — em todos os documentos que os afirmam, e registrar a decisão em ADR"
dominio: "Governança / Operação Git"
status: "🟢 Aprovada"
prioridade: "Máxima"
tags: ["plan", "git", "governanca", "co-autoria", "adr"]
relacionados: ["[[17-contrato-de-operacao-git]]", "[[00-contexto]]", "[[00-prompt-executor]]", "[[00-prompt-revisor]]", "[[16-integracao-continua]]"]
depende_de: ""
retida_por: ""
destino_sintese: "—"
---

> **Molde de plan.** Escrita pelo **agente revisor** ([[00-prompt-revisor]]), executada pelo **agente
> executor** ([[00-prompt-executor]]) e aprovada pelo revisor — como qualquer plan. O fato de o alvo ser
> documento não muda o papel de ninguém.
>
> ⚠️ **Esta plan escreve em `specs/adr/`, `specs/specs/` e `specs/00-contexto.md`** — arquivos que a
> [[00-prompt-executor]] §7.3 hoje declara serem "do revisor". Aquela proibição existe para impedir o
> executor de criar spec **por iniciativa própria**, não para impedi-lo de executar uma plan cujo escopo
> declarado é justamente um documento. A ressalva foi acrescentada à §7.3 por prompt direto antes desta
> plan; se você a estiver lendo e a §7.3 ainda não a tiver, **pare e avise**.

# 1. Objetivo

Os documentos deste repositório passam a afirmar **duas regras independentes** onde hoje afirmam uma só,
fundida: **co-autoria de agente é proibida sempre**, e **escrita no git/GitHub é do dono, salvo solicitação
e autorização expressa dele**. A decisão fica registrada em ADR, e a garantia que ela retira fica declarada.

# 2. Contexto

**Decisão do dono, 2026-09-02**, na íntegra:

> *"Coautoria é expressamente proibido sempre, o usuário commita e faz push, o agente pode realizar apenas
> consultas diretamente, escritas no git e github são de responsabilidade do usuário a menos que o próprio
> usuário solicite e autorize."*

**O que a contraprova de specs achou.** Os três prompts do fluxo (`00-prompt-executor`, `00-prompt-revisor`,
`00-knowledge`) foram atualizados em 2026-09-02 e passaram a admitir a exceção autorizada. O resto do corpus
ficou para trás, e hoje há contradição declarada entre pares:

- [[17-contrato-de-operacao-git]] §2.0 lista `add`/`commit`/`push` como *"⛔ **Nunca muta**"*, e a §2 diz que
  o agente *"não pode mutar o repositório"*, sem exceção.
- `00-contexto` §7 afirma *"vale para todo agente, **sem exceção** e sem co-autoria"* — uma frase que hoje
  cobre **os dois eixos ao mesmo tempo**, e é por isso que separá-los exige tocar nela.
- A skill `git-ci-cd` repete a fronteira na própria `description`, que é o **gatilho** dela.

**A garantia que a decisão retira, e que precisa ser declarada.** A §2.1 da `17` afirma hoje que o modelo
*"resolve o acesso **por construção**: nenhum agente **pode** tocar a credencial que fura a proteção da
`main` — porque nenhum agente executa o `git push` que a usaria."* Com a exceção autorizada isso deixa de
ser garantia **estrutural** e passa a ser garantia **de política**. Manter a frase como está faria a spec
afirmar uma segurança que ela não tem mais — que é o defeito mais reincidente desta base
([[15-divida-conhecida]] §3.3).

**Por que ADR, e não só edição.** A régua de [[00-prompt-revisor]] §5.2 pede as três: (1) havia duas opções
reais — *"o agente nunca muta"*, que é o modelo de 2026-08-19 e rodou, contra *"o agente muta sob
solicitação e autorização"*; (2) a escolhida tem custo que a outra não tinha — abre mão da garantia
estrutural acima; (3) voltar atrás seria caro, não em linhas, mas em repetição: **sem o ADR, um agente
futuro lê a §2.1 antiga e repropõe a reversão**, que é exatamente o que [[00-contexto]] §4.1 diz que os ADRs
existem para evitar.

**A razão de a regra de co-autoria ser repetida em cinco lugares — e que ainda não está escrita em lugar
nenhum.** O harness dos agentes que trabalham neste repositório injeta, como instrução padrão, *"End git
commit messages with: `Co-Authored-By: …`"*. Todo agente **chega com a co-autoria ligada** e precisa
desligá-la lendo estas specs. Esse é o motivo da insistência, e ele pertence à §4 da `17`.

> ⚠️ **Pré-requisito.** O molde `_templates/template-adr.md` ainda **não tem** o campo
> `alternativas_consideradas` que a [[00-prompt-revisor]] §5.2 declara ser a prova mecânica de um ADR
> legítimo. O prompt direto que o acrescenta tem de ter sido executado **antes** do passo 1 desta plan.

# 3. Escopo

## 3.1 Dentro (o que pode ser tocado)

- `specs/adr/012-escrita-git-sob-autorizacao-do-dono.md` — **criar**
- `specs/specs/17-contrato-de-operacao-git.md` — §2 (tabela), §2.0 (linha ⛔ e o parágrafo do porquê), §2.1,
  §2.3, §4 (só o acréscimo do motivo), §7 (um critério novo)
- `specs/00-contexto.md` — **§7 apenas**, e nela só os dois bullets de Git
- `specs/00-prompt-executor.md` — §7, item 1
- `specs/00-prompt-revisor.md` — §3 (célula de commit da tabela) e §9, item 2
- `.agents/skills/git-ci-cd/SKILL.md` — `description`, tabela da fronteira, bloco da decisão citada
- `.claude/skills/git-ci-cd/SKILL.md` — **espelho**: é symlink em disco, mas o git rastreia os dois caminhos
  como blobs regulares idênticos (achado 47). Editar um faz o `git status` mostrar **dois** arquivos, e isso
  é esperado

## 3.2 Fora (o que NÃO pode ser tocado)

- **`17` §3 — as seis proibições absolutas.** Continuam absolutas: a autorização do dono é sobre *quem
  digita*, não sobre *o que se faz*, e as seis são sobre dano irreversível. `git diff` tem de mostrá-las sem
  uma linha alterada.
- **`17` §4 — o texto da regra de co-autoria.** Já está certo (*"em nenhuma hipótese"*). O único acréscimo
  permitido é o motivo descrito na §2 desta plan.
- `specs/specs/16`, `03`, `02` — donas de outros assuntos (`17` §5). Nenhuma redescrição.
- `specs/00-indice.md`, `specs/_templates/` e o resto do `00-contexto` — são da `plan-56`.
- **Qualquer código, gate, hook, script ou teste.** Esta plan não muda comportamento de máquina.
- `docs/migracoes.md` — nada aqui alcança o consumidor.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/specs/17-contrato-de-operacao-git.md` | o alvo principal; é a **dona** deste contrato (§5 dela) |
| Spec fixa | `specs/specs/16-integracao-continua.md` §2.1 | a exceção de administrador que a §2.1 da `17` cita |
| Spec fixa | `specs/00-contexto.md` §7 e §4.1 | o segundo alvo, e o critério de quando um ADR se justifica |
| Processo | `specs/00-prompt-revisor.md` §5.2 | a régua de três testes que o ADR-012 tem de passar |
| Processo | `specs/00-prompt-executor.md` §7 · `specs/00-prompt-revisor.md` §3 e §9 | os três pontos de redação a separar |
| Molde | `specs/_templates/template-adr.md` · `specs/adr/README.md` | a forma do ADR e o protocolo de imutabilidade |
| Skill | `spec-write` | a forma e o vocabulário de spec |
| Skill | `padrao-escrita` | sempre |
| Código | `.agents/skills/git-ci-cd/SKILL.md` | ler inteiro antes de editar: a `description` é o gatilho |

# 5. Instruções de execução

1. **Criar `specs/adr/012-escrita-git-sob-autorizacao-do-dono.md`** pelo molde, com
   `alternativas_consideradas` de **duas** entradas e o custo de cada, e `substitui: ""` (ele não substitui
   ADR nenhum — a decisão de 2026-08-19 vive na `17`, não em ADR). O contexto é a §2 desta plan; a
   consequência negativa obrigatória é a perda da garantia estrutural da `17` §2.1.
2. **`17` §2, tabela:** *"Não pode: **Mutar** o repositório"* → *"**Mutar por iniciativa própria**"*.
3. **`17` §2.0, linha ⛔:** o rótulo *"Nunca muta"* passa a *"Não muta por iniciativa própria"*, e a célula
   ganha a porta: **sem pedido, entrega o comando pronto; com solicitação e autorização expressa do dono
   naquela conversa, executa.** **A lista de comandos permanece idêntica** — ela não é a proibição, é o
   inventário do que conta como mutação. Ajuste o parágrafo *"Por que a linha cai aí"* na mesma ação.
4. **`17` §2.1:** reescrever o parágrafo *"E resolve o acesso por construção"*. A garantia passa a ser **de
   política**, o custo é nomeado, e há ponteiro para o ADR-012. O argumento da **autorização de fachada**
   (parágrafos anteriores) continua válido e **não** se toca — ele é sobre aprovação distraída, não sobre
   credencial.
5. **`17` §2.3:** acrescentar a decisão de 2026-09-02, citada na íntegra e datada, marcando a de 2026-08-19
   como **superada nesta parte**, com ponteiro para o ADR-012. **Não apague a decisão antiga** — a §2 da `17`
   a cita, e [[00-contexto]] §5 proíbe remoção sem destino demonstrado.
6. **`17` §4:** acrescentar, em uma frase, o motivo descrito na §2 desta plan (o harness injeta a co-autoria
   por padrão). Nada mais na §4 muda.
7. **`17` §7:** um critério de aceite novo, marcado, para a fronteira revisada.
8. **`00-contexto` §7:** reescrever os dois bullets de Git como **dois eixos independentes**, apontando para
   a `17` sem reescrevê-la (a `17` §5 é explícita: quem detalha é ela).
9. **`00-prompt-executor` §7:** o item 1 vira **dois** itens — co-autoria absoluta (sem exceção, e sem
   travessão amarrando-a a nada) e escrita sob autorização. Renumerar os itens seguintes.
10. **`00-prompt-revisor`:** mesma separação na célula de commit da tabela da §3 e no item 2 da §9.
11. **Skill `git-ci-cd`:** alinhar `description`, tabela da fronteira e o bloco da decisão citada à §2.0
    nova. Os dois *"sem co-autoria, nunca"* (`:313` e `:751`) **ficam como estão**. ⚠️ A `description` é o
    **gatilho** da skill: reescreva preservando as palavras que a fazem disparar.
12. **Rodar as verificações da §7** e ler a saída.

# 6. Critérios de aceite

- [ ] `specs/adr/012-*.md` existe, com `alternativas_consideradas` de **duas** entradas e o custo de cada.
- [ ] `17` §2.0 distingue, por escrito, *iniciativa própria* de *solicitação e autorização do dono*.
- [ ] `17` §2.1 não afirma mais garantia **por construção**; o custo está nomeado e aponta para o ADR-012.
- [ ] A decisão de 2026-08-19 continua citada na `17`, marcada como superada nesta parte.
- [ ] `17` §3 e §4 sem nenhuma alteração além do acréscimo do item 6 — provado pelo `git diff`.
- [ ] Nos três prompts, **co-autoria é item próprio, sem exceção e sem cláusula pendurada**.
- [ ] A `description` da skill `git-ci-cd` descreve a fronteira nova e continua disparando nos mesmos casos.
- [ ] Nenhuma linha `Co-Authored-By` foi adicionada a nada, em nenhum arquivo.
- [ ] Nada commitado.

# 7. Como verificar (uso do revisor)

**Gate:** `nenhum`.

> **Por quê.** Pela régua de [[00-prompt-revisor]] §5.4, regra para a qual não se consegue escrever um caso
> que **falha** não é regra. *"O contrato descreve a fronteira certa"* é conduta, não invariante mecânico —
> nenhum script decide se um parágrafo diz a coisa certa. O que **é** verificável aqui (ponteiro de seção
> morto, defasagem do kit do mantenedor) **já tem gate**, e está listado abaixo.

- `git status` + `git diff --stat` → **apenas** os arquivos da §3.1 (contando o espelho `.claude/skills/`).
- `git diff specs/specs/17-contrato-de-operacao-git.md` → a §3 (as seis proibições) **sem uma linha
  alterada**; a §4 só com o acréscimo do item 6.
- `git diff | Select-String "Co-Authored"` → **nenhuma ocorrência adicionada**.
- `git diff specs/00-contexto.md` → só a §7.
- `npm run section-pointers:check` → verde (a `17` e o `00-contexto` têm autorreferências `§N.M`).
- `npm run dev-kit:check` → verde; se acusar defasagem, `npm run dev-kit` e commitar junto (nunca editar
  `sarak-dev/` à mão).
- `npm run audit:baseline` → *"igual ao baseline"*.
- Leitura de `specs/adr/012-*.md` → as duas alternativas têm custo escrito, e a negativa nomeia a perda da
  garantia estrutural.

# 8. Destino da síntese

**Destino:** `—`

Esta plan **escreve diretamente nas specs fixas e no ADR**: quando ela fecha, a verdade já está no lugar
definitivo. Não há nada a transportar depois, e inventar um destino aqui produziria uma síntese vazia — o
que [[00-prompt-revisor]] §5.2 chama de preencher campo por reflexo.

---

# 9. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only: cada rodada acrescenta um bloco novo; nada é removido. -->

## Resumo da execução — 2026-09-02

**Resultado:** Concluído com pendências

**O que foi feito**

- `specs/adr/012-escrita-git-sob-autorizacao-do-dono.md` — criado. Duas alternativas preteridas com custo
  nomeado; a negativa obrigatória (perda da garantia estrutural de acesso à credencial) é o primeiro item
  dos trade-offs.
- `17` §2 (tabela) — a célula do Agente virou *"Mutar por iniciativa própria (§2.0)"*. **A célula do Dono
  também mudou**: *"Digitar todo comando que muda alguma coisa"* passou a admitir *"ou solicitar e autorizar
  que o agente o execute"*, porque deixá-la como estava contradiria a linha de cima.
- `17` §2.0 — rótulo ⛔ virou *"Não muta por iniciativa própria"*; acrescentado o quadro 🔑 com a porta. **A
  lista de comandos não foi tocada.** O parágrafo *"Por que a linha cai aí"* ganhou a razão de a leitura
  nunca ter precisado de porta.
- `17` §2.1 — o parágrafo *"E resolve o acesso por construção"* foi **substituído** por um bloco que cita a
  frase antiga, declara que ela deixou de ser verdade, e aponta o trade-off ao ADR-012. O argumento da
  autorização de fachada ficou intacto.
- `17` §2.3.1 — seção nova com a decisão de 2026-09-02 na íntegra, a tabela dos dois eixos, e a marcação de
  que a decisão de 2026-08-19 **continua valendo em tudo menos nesta parte**. A antiga não foi apagada.
- `17` §4 — acrescentado o motivo de a regra ser repetida em cinco lugares: o harness injeta a co-autoria
  por padrão.
- `17` §7 — um critério de aceite novo, marcado, para a fronteira revisada.
- `00-contexto` §7 — os dois bullets de Git viraram dois eixos independentes, apontando para a `17` e o
  ADR-012 sem reescrevê-los.
- `00-prompt-executor` §7 — co-autoria virou item próprio e absoluto (item 1); a escrita sob autorização
  virou o **item 11**, no fim da lista. Ver *Decisões*.
- `00-prompt-revisor` §3 (célula de commit) e §9 — mesma separação: co-autoria absoluta no item 2, escrita
  sob autorização no **item 11**.
- `.agents/skills/git-ci-cd/SKILL.md` (+ o espelho `.claude/`) — `description`, quadro da fronteira e bloco
  da decisão citada alinhados à §2.0 nova. Os dois *"sem co-autoria, nunca"* não foram tocados.

**Arquivos alterados**

| Arquivo | Natureza | O que mudou |
|---|---|---|
| `specs/adr/012-escrita-git-sob-autorizacao-do-dono.md` | criado | O ADR da decisão, com as duas alternativas e o custo de cada |
| `specs/specs/17-contrato-de-operacao-git.md` | alterado | §2, §2.0, §2.1, §2.3.1 (nova), §4, §7 — 7 hunks |
| `specs/00-contexto.md` | alterado | §7, os dois bullets de Git — 1 hunk |
| `specs/00-prompt-executor.md` | alterado | §7: item 1 reescrito + item 11 novo |
| `specs/00-prompt-revisor.md` | alterado | §3 (célula) e §9: item 2 reescrito + item 11 novo |
| `.agents/skills/git-ci-cd/SKILL.md` | alterado | `description`, quadro da fronteira, bloco do contrato |
| `.claude/skills/git-ci-cd/SKILL.md` | alterado | espelho do acima (mesmo inode; git rastreia os dois) |
| `sarak-dev/state.json` · `START-HERE.md` · `GUIA-MANUTENCAO.md` | alterado | **gerados** por `npm run dev-kit` — ver *Decisões* |
| `specs/plan/plan-55-*.md` | alterado | `status` e este resumo |

**Verificações executadas**

- `git diff --stat` → 10 arquivos; os 7 da §3.1 mais os 3 gerados do `sarak-dev/`.
- `git diff specs/specs/17-*.md` → **7 hunks, nenhum na §3**. Conferido por busca das seis proibições no
  diff: nenhuma aparece. A §4 tem só o acréscimo do item 6.
- `git diff | grep "^+.*Co-Authored"` → 5 ocorrências, **todas texto da própria proibição**; nenhuma é um
  trailer `Co-Authored-By:` de commit.
- `git diff specs/00-contexto.md` → **1 hunk**, `@@ -327,6 +327,9 @@`, dentro da §7.
- `npm run section-pointers:check` → **verde** (2 correções necessárias, ver *Decisões*).
- `npm run dev-kit` → `77 componentes públicos, 423 tokens, 23 gates`; `dev-kit:check` → **verde**.
- `npm run audit:baseline` → *"igual ao baseline de 2026-08-11 — nenhuma regressão"*.
- YAML do ADR validado com PyYAML: `alternativas_consideradas` com **2** entradas, ambas com `custo`
  preenchido; `substitui` vazio.
- `npm run plan-index:check` → **vermelho, por desenho** — ver *Pendências*.

**Critérios de aceite**

- [x] `adr/012-*.md` existe, com duas entradas e o custo de cada — evidência: frontmatter `:9-13`, validado
      por PyYAML.
- [x] `17` §2.0 distingue iniciativa própria de solicitação e autorização — evidência: `:47` e o quadro 🔑.
- [x] `17` §2.1 não afirma mais garantia por construção; custo nomeado, ponteiro ao ADR-012 — evidência:
      hunk `@@ -70,3 +78,12 @@`.
- [x] Decisão de 2026-08-19 citada e marcada como superada nesta parte — evidência: §2.3.1.
- [x] `17` §3 e §4 sem alteração além do item 6 — evidência: os 7 hunks, nenhum na §3.
- [x] Co-autoria é item próprio nos três prompts, sem cláusula pendurada — evidência: `00-contexto` §7
      bullet 1, `00-prompt-executor` §7 item 1, `00-prompt-revisor` §9 item 2.
- [x] `description` da skill descreve a fronteira nova e preserva as palavras-gatilho — a frase *"Use quando
      o dono pedir ajuda para commitar…"* não foi tocada.
- [x] Nenhuma linha `Co-Authored-By` adicionada a nada.
- [x] Nada commitado.

**Decisões e suposições**

1. 🔴 **A plan se contradiz sobre a renumeração, e segui a leitura conservadora.** A §3.1 me deu
   *"`00-prompt-executor.md` — §7, item 1"*; o passo 9 mandou *"renumerar os itens seguintes"*. Renumerar
   move `§7.3`, que é citado **de fora** em 6 lugares que **não estão no meu escopo**: `00-contexto.md:291`
   (§5, é da `plan-56`), `01-gates-e-baseline.md:675` (fora de escopo), e as próprias `plan-55` (×3) e
   `plan-56` (×4). O `check-section-pointers` **não pegaria** — ele ignora ponteiro cross-documento por
   limite declarado. **Escolhi não renumerar:** co-autoria ficou como item 1 (próprio e absoluto, que é o
   critério de aceite) e a escrita virou o **item 11**, no fim. Itens 2–10 intactos, `§7.3` continua
   apontando para a proibição de editar spec.
2. **Mesmo tratamento no `00-prompt-revisor` §9**, pela mesma razão: a `plan-56` cita `§9.6` e `§9.7`.
   Co-autoria ficou no item 2, escrita no item 11.
3. **Rodei `npm run dev-kit`**, que altera 3 arquivos fora da §3.1. A §7 da plan autoriza explicitamente
   (*"se acusar defasagem, `npm run dev-kit` e commitar junto — nunca editar `sarak-dev/` à mão"*). Nenhum
   arquivo de `sarak-dev/` foi tocado à mão.
4. **Ajustei a célula do Dono na tabela da §2** da `17`, além da célula do Agente que o passo 2 nomeia. A
   §3.1 dá *"§2 (tabela)"* inteira, e deixar *"Digitar todo comando que muda alguma coisa"* contradiria a
   célula de cima na mesma tabela.
5. **Ajustei a linha `Commits continuam do dono … quem digita é sempre o dono`** da skill (`:170-171`), que
   faz parte do bloco do contrato que o passo 11 manda alinhar.
6. **Duas correções no ADR forçadas pelo `check-section-pointers`:** ele lê `§N.M` sem qualificador como
   autorreferência. O `§2.1` do corpo ganhou o wikilink `[[17-contrato-de-operacao-git]]`; o `§2.1` que
   estava dentro de um valor do frontmatter foi **removido** (virou prosa: *"o contrato de operação Git"*),
   porque qualificador dentro de YAML é ruído.

**Achados fora do escopo (não corrigidos)**

- `specs/00-contexto.md:285` — a célula *"Nunca faz"* do Executor ainda diz *"criar/alterar outras specs"*,
  o que contradiz a §7.3 desde 2026-09-02. **Já está roteado**: é o passo 12 da `plan-56`.
- **`§7` do executor e `§9` do revisor são frágeis por construção.** Como `§N.M` significa *"item M da lista
  numerada da seção N"* e o `check-section-pointers` ignora referência cross-documento, **qualquer inserção
  no meio dessas listas quebra ponteiros externos em silêncio**. Foi o que esta execução quase fez. Sugestão
  para o revisor: linha de `00-backlog`.

**Pendências / riscos**

- `npm run plan-index:check` está **vermelho**, e é esperado: o índice diz `🔴 A executar` e o frontmatter
  desta plan diz `🟠 Em revisão`. Espelhar o índice é ato do **revisor** ([[00-indice]] §2), e o executor não
  o toca. **O commit fica bloqueado até isso ser feito.**
- A `plan-56`, no passo 12, precisa ser lida à luz da decisão 1 acima: ela manda alinhar `00-contexto:285` à
  *"§7.3"*, e a §7.3 continua sendo a proibição de editar spec — o ponteiro dela segue válido.

---

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->

## Veredito — 2026-09-02 — 🟢 Aprovado

**Verificado, não só lido no resumo:**

- `git status` + `git diff --stat` → 11 arquivos (10 modificados + `adr/012` novo, não rastreado): os 7
  de §3.1 (`adr/012`, `17`, `00-contexto`, `00-prompt-executor`, `00-prompt-revisor`, os dois espelhos de
  `git-ci-cd/SKILL.md`) + a própria `plan-55` (status/resumo) + os 3 gerados de `sarak-dev/`. Nada fora do
  escopo, nada faltando.
- `git diff -U0 specs/specs/17-contrato-de-operacao-git.md` → **7 hunks**. Mapeei os limites de seção no
  `HEAD` (`§3`: linhas 94–111 · `§4`: 112–132) e confirmei que **nenhum hunk cai dentro da §3** — a inserção
  mais próxima (`### 2.3.1`) entra logo **antes** da linha 94, e a única mudança na §4 é a adição no final
  (linha 132), exatamente o "acréscimo do item 6" declarado. As seis proibições absolutas seguem
  byte-a-byte iguais.
- `git diff | grep "Co-Authored"` → 8 ocorrências (o resumo contou 5, antes de o próprio resumo — que cita a
  palavra ao descrever o teste — entrar no diff). Conferi as 8 uma a uma: todas são prosa da proibição ou do
  próprio resumo descrevendo o teste; **nenhuma é um trailer `Co-Authored-By:` de commit real**. Nenhum
  commit foi criado nesta execução (`git log` não tem commit novo).
- `git diff specs/00-contexto.md` → 1 hunk, dentro da §7, só os dois bullets de Git.
- `git diff specs/00-prompt-executor.md` / `specs/00-prompt-revisor.md` → item 1 / item 2 (co-autoria)
  reescrito sem cláusula pendurada; item novo **acrescentado ao final** da lista (item 11 nos dois), sem
  renumerar — validei que isso é a escolha certa: `plan-56` (ainda aberta) cita `§7.3`, `§9.6` e `§9.7` por
  número, e renumerar teria quebrado esses ponteiros cross-documento em silêncio (o `section-pointers:check`
  não os enxerga — R18/vão 7).
- Espelho `.claude/skills/git-ci-cd/SKILL.md` vs `.agents/skills/git-ci-cd/SKILL.md` → **byte-idênticos**,
  antes e depois (`diff` vazio nos dois lados).
- `description` da skill `git-ci-cd` → a cláusula-gatilho *"Use quando o dono pedir ajuda para
  commitar…NÃO acione proativamente."* permanece **verbatim**.
- YAML de `adr/012-*.md` parseado (script próprio, equivalente ao PyYAML do executor) → `alternativas_consideradas`
  com **2** entradas, ambas com `opcao` e `custo` preenchidos; `substitui`/`substituido_por` vazios,
  coerente com "não substitui nenhum ADR". Bytes do arquivo conferidos livres de replacement character —
  a saída "estranha" no terminal foi só o codepage do console, não corrupção de conteúdo.
- `npm run section-pointers:check` → verde (318 cross-doc ignorados por limite declarado, 9 citações
  ignoradas — nenhum ponteiro de autorreferência morto).
- `npm run dev-kit:check` → verde, "kit em dia (3 arquivos, 0 ponteiros mortos)".
- `npm run audit:baseline` → "igual ao baseline de 2026-08-11 — nenhuma regressão".
- `npm run plan-index:check` → vermelho, **como esperado** (`índice="🔴 A executar" × frontmatter="🟠 Em
  revisão"`) — é o revisor quem sincroniza o índice, na aprovação (abaixo).

**Critérios de aceite (§6):** os 9 batem com evidência nomeada, incluindo os dois que exigiam checagem
independente (seção 3 intacta; nenhum trailer de commit) — nenhum "atendido por interpretação".

**Achados fora do escopo — tratados:**

1. `00-contexto.md:285` (célula "Nunca faz" do Executor) — confirmado que **já está roteado**: `plan-56`
   passo 12 cobre exatamente essa correção, e a cita corretamente porque `§7.3` não foi renumerada. Não
   entra no backlog — já está numa plan aberta ([[00-backlog]] §4: "item que já está numa plan não fica
   aqui").
2. Fragilidade de `§N.M` como ponteiro cross-documento em listas numeradas (`00-prompt-executor` §7 e
   `00-prompt-revisor` §9) — **transcrito para o [[00-backlog]]**, peso médio.
3. **Achado adicional, meu:** `specs/adr/README.md` — a tabela "Os ADRs desta base" continua listando só
   001–011; o `adr/012` novo não foi acrescentado à tabela nem à frase final sobre "sobre o X → Y". Não
   estava em `§3.1` desta plan (só `adr/012-*.md — criar` foi declarado), então o executor corretamente não
   tocou o arquivo — é lacuna de escopo desta plan, não falha de execução. **Transcrito para o
   [[00-backlog]]**, peso baixo (o ADR existe e é válido; só o índice de navegação ficou defasado).

**Regras do sistema (`00-contexto` + `padrao-escrita`):** sem hardcoded, sem segredo, sem `TODO`/debug,
nenhum comentário citando esta plan (a norma veda citar plan em comentário de **código**; nada aqui é
código). Nenhum sinal de atalho.

**Pode commitar.** As alterações no worktree (11 arquivos, listados acima) estão prontas: `adr/012` novo +
7 arquivos de `§3.1` + os 3 gerados do `sarak-dev/` (via `npm run dev-kit`, autorizado pela própria §7 da
plan) + esta plan com o veredito.

**Proposta de síntese:** nenhuma. `destino_sintese: "—"` está correto — esta plan escreveu diretamente nas
specs fixas e no ADR; não há verdade adicional para transportar depois. Ela **não** entra na fila de
síntese: quando o `git log` mostrar o commit desta aprovação, ela pode ser removida (§7.4), o que farei
numa próxima ação sob autorização.

---

# 11. Síntese

<!-- Preenchido pelo REVISOR na síntese (§7.4), imediatamente antes da remoção da plan. -->
