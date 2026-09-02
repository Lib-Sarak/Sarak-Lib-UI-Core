---
tipo: "plan"
titulo: "Separar co-autoria absoluta de escrita autorizada no contrato de operação Git"
objetivo: "Separar os dois eixos da regra de Git — co-autoria proibida sempre, escrita no repositório só sob solicitação e autorização do dono — em todos os documentos que os afirmam, e registrar a decisão em ADR"
dominio: "Governança / Operação Git"
status: "🔴 A executar"
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

---

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->

---

# 11. Síntese

<!-- Preenchido pelo REVISOR na síntese (§7.4), imediatamente antes da remoção da plan. -->
