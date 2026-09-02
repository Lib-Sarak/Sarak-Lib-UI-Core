---
tipo: "plan"
titulo: "Costurar os artefatos do fluxo SDD à via direta e ao backlog"
objetivo: "Alinhar o molde de plan, o índice e o contexto ao desenho de via direta e backlog que os três prompts do fluxo passaram a assumir, fechando as contradições que a atualização deles abriu"
dominio: "Governança de Specs (SDD)"
status: "🟢 Aprovada"
prioridade: "Alta"
tags: ["plan", "sdd", "governanca", "molde", "indice", "backlog"]
relacionados: ["[[00-contexto]]", "[[00-indice]]", "[[00-backlog]]", "[[00-prompt-revisor]]", "[[00-prompt-executor]]"]
depende_de: "plan-55-autoridade-de-escrita-no-git"
retida_por: ""
destino_sintese: "—"
---

> **Molde de plan.** Escrita pelo **agente revisor** ([[00-prompt-revisor]]), executada pelo **agente
> executor** ([[00-prompt-executor]]) e aprovada pelo revisor — como qualquer plan. Ver a ressalva da
> §7.3 do executor, citada no cabeçalho da `plan-55`.

# 1. Objetivo

O molde de plan, o `00-indice` e o `00-contexto` passam a descrever o fluxo que os três prompts realmente
executam hoje — **duas vias de triagem** (plan e prompt direto), **um backlog** e **síntese como ato do
revisor** —, sem nenhuma afirmação que o próprio ciclo desminta.

# 2. Contexto

Em 2026-09-02 o dono atualizou `00-prompt-executor`, `00-prompt-revisor` e `00-knowledge`, e criou o
`00-backlog`. A mudança é boa e verificada: a contraprova de specs confirmou que o inventário do
`00-knowledge` está **completo** (52 skills instaladas, 52 citadas; 13 commands, 5 agents e 5 hooks batendo
nome a nome), que `padrao-escrita/references/comentarios.md` existe, e que o `.githooks/pre-commit` já cobre
`specs/00-backlog.md` pelo padrão `specs/00-` — nenhum gate precisa mudar.

O que **não** acompanhou foram os artefatos que os prompts passaram a pressupor. Os defeitos, todos
verificados no worktree:

**No molde de plan** (`_templates/template-plan.md`):

- Falta `objetivo` no frontmatter. `collectPlans()` (`scripts/generate-plan-index.mjs:66-69`) **lança erro**
  para plan sem esse campo — a primeira plan criada pelo molde derrubaria o `plan-index:check`.
  ⚠️ **Este item já foi corrigido por prompt direto**, antes desta plan existir; ela não o repete.
- Falta o cabeçalho **Síntese**, que [[00-prompt-revisor]] §5.1 exige e a §7.4 manda preencher.
- A §6 é um **prompt de execução escrito em arquivo**, contra a §1 do revisor (*"prompt nunca é escrito em
  arquivo"*), e o corpo dela repete referências e skills, contra a §5.3 (*"ponteiro puro"*). **Removê-la
  renumera as seções e faz "Como verificar" virar §7** — exatamente o número que a §5.4 do revisor e a §3.8
  do executor já citam. Os prompts foram escritos contra o molde sem essa seção.
- Não existe a linha `Gate:`, que o revisor §5.1/§5.4 declara obrigatória, `nenhum` incluso.
- Falta `retida_por` no frontmatter (revisor §7.4 e §9.7).
- A §9 diz que a síntese é feita *"pela skill `spec-atualizar`"* — **essa skill não existe**: a base tem 52
  skills e 13 commands, nenhum com esse nome.

**No `00-indice`:**

- **`proximo_numero_plan` não existe em lugar nenhum do repositório**, e o revisor §5/§6/§9.6 manda ler `NN`
  dali. O campo tem de nascer **no frontmatter**: dentro dos marcadores ele seria apagado, porque o gerador
  reescreve o bloco inteiro a cada rodada (limite declarado #4, `generate-plan-index.mjs:28`).
- A §5 diz *"nunca remova uma linha"*, contra o revisor §7.4 (a linha sai junto com a plan, na síntese).
- A §2 e a §4 ainda roteiam a síntese por `/spec-atualizar`.
- **A retenção, como o revisor a descreve hoje, é mecanicamente impossível.** A §7.4 manda pôr *Destino* =
  `sintetizada · retida por plan-NN` no índice, mas essa coluna é **gerada** de `destino_sintese`
  (`generate-plan-index.mjs:76`) e o bloco marcado é reescrito inteiro. Quem editar à mão vê o
  `plan-index:check` derrubar o commit.

**No `00-contexto`:** o diagrama do ciclo (§5) só conhece a via da plan, termina em `/spec-atualizar`, a
tabela de papéis não menciona o backlog, o §4 não roteia "registrar um achado", e o §9 (*"só o revisor edita,
e só no contexto de uma plan aprovada"*) contradiz o revisor §3 (*"editar spec fixa fora do ciclo, se o
usuário pedir"*).

# 3. Escopo

## 3.1 Dentro (o que pode ser tocado)

- `specs/_templates/template-plan.md` — frontmatter (`retida_por`), remoção da §6, linha `Gate:`, cabeçalho
  `Síntese`, nota da §9
- `specs/00-indice.md` — frontmatter (`proximo_numero_plan`, `relacionados`), a **prosa da §1 fora dos
  marcadores**, §2, §4, §5
- `specs/00-contexto.md` — **§4, §5 e §9 apenas**
- `specs/00-prompt-revisor.md` — **§7.4 apenas**, o parágrafo da plan retida

## 3.2 Fora (o que NÃO pode ser tocado)

- **`specs/00-contexto.md` §7** — é da `plan-55`. Esta plan não encosta nele.
- **`specs/specs/17-contrato-de-operacao-git.md` e `specs/adr/`** — da `plan-55`.
- `specs/_templates/template-adr.md` — o campo `alternativas_consideradas` já entrou por prompt direto.
- `specs/00-knowledge.md` — verificado íntegro; os três nits dele vão para o `00-backlog`, não para cá.
- **O bloco entre `<!-- SARAK-INDICE:FILA:INICIO -->` e `:FIM`** — é gerado. Mexeu na fila? Rode
  `npm run plan-index`, nunca edite a tabela à mão.
- **Qualquer código, gate, hook, script ou teste.** Inclusive `check-plan-index-sync.mjs` — ver §7.
- `specs/specs/*`, `specs/arquitetura/*` — as 26 divergências da contraprova de 2026-09-02 são outro assunto.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Processo | `specs/00-prompt-revisor.md` | a fonte de tudo que o molde e o índice têm de suportar (§1, §5.1, §5.3, §5.4, §7.4, §9) |
| Processo | `specs/00-prompt-executor.md` §2, §3, §5, §7 | o outro lado do contrato — o que o executor espera achar na plan |
| Processo | `specs/00-backlog.md` | o artefato novo que o `00-contexto` ainda não conhece |
| Spec fixa | `specs/00-contexto.md` §4, §5, §9 | o alvo; a §5 é o diagrama do ciclo |
| Spec fixa | `specs/00-indice.md` | o alvo; leia inteiro, inclusive as notas fora dos marcadores |
| Código | `scripts/generate-plan-index.mjs` | **ler os limites declarados (`:10-31`) antes de editar o índice** — é onde está o motivo de o campo novo ir no frontmatter |
| Código | `gates/scripts/contrato/check-plan-index-sync.mjs` | ler para não quebrar o parser da fila (`:24-40`) |
| Molde | `specs/_templates/template-plan.md` | o alvo |
| Skill | `spec-write` | a forma e o vocabulário de spec |
| Skill | `padrao-escrita` | sempre |

# 5. Instruções de execução

1. **`template-plan.md` — frontmatter:** acrescentar `retida_por: ""` com o comentário do que ele significa.
   Conferir que `objetivo` já está lá (entrou por prompt direto); **se não estiver, pare e avise** — sem ele
   toda plan nova quebra o `plan-index:check`. Na mesma passada, **quebrar o comentário da linha `objetivo`
   em mais de uma linha** ou encurtá-lo: ele tem hoje **274 caracteres**, contra ~130 do maior vizinho, e
   destoa do corpo do documento. Nenhuma regra cobre largura de linha em markdown — é legibilidade, e o
   lugar de arrumar é aqui, porque esta plan já reescreve este bloco.
2. **`template-plan.md` — remover a §6 "Prompt de execução"** e renumerar as seções seguintes. Confirmar, ao
   final, que **"Como verificar" é a §7** — é o número que os dois prompts citam.
3. **`template-plan.md` — "Como verificar":** acrescentar a linha `**Gate:** <regra · ou nenhum>` como
   primeiro item da seção, com a nota de que ela é **sempre** preenchida e o critério mora em
   [[00-prompt-revisor]] §5.4.
4. **`template-plan.md` — acrescentar o cabeçalho `Síntese`** ao final, vazio, com o comentário HTML dizendo
   que é do revisor e append-only.
5. **`template-plan.md` — §"Destino da síntese":** trocar a nota da skill `spec-atualizar` (inexistente) por:
   a síntese é ato do **revisor** ([[00-prompt-revisor]] §7.4), disparada por autorização do usuário.
6. **`00-indice.md` — frontmatter:** criar `proximo_numero_plan: "57"` e acrescentar `[[00-backlog]]` a
   `relacionados`. O valor **57** é o próximo livre: 55 e 56 são estas duas plans, e 54 era a maior já
   emitida (conferido no histórico de remoções). Documentar, em uma linha na §5, que o campo é a **única**
   fonte de `NN` e que ele nunca regride.
7. **`00-indice.md` — §1, a nota do fim (`:94`):** ela diz *"A fila está VAZIA — pela primeira vez"*, e
   **deixou de ser verdade** quando as plans 55 e 56 entraram. O achado que ela registra (o gerador estourava
   com `ENOENT` sem `specs/plan/`) continua valendo e **não** se apaga: reescreva a nota no passado, como o
   registro datado que ela é, sem afirmar estado corrente. É a mesma disciplina que a §3.3 de
   [[15-divida-conhecida]] cobra — cifra e estado em prosa envelhecem; o registro do defeito, não.
8. **`00-indice.md` — §5:** substituir *"nunca remova uma linha"* pela regra vigente — a linha sai **junto**
   com a plan, na mesma ação da síntese (revisor §7.4); remoção por abandono é ato **manual do usuário**
   (revisor §3).
9. **`00-indice.md` — §2 e §4:** trocar as três menções a `/spec-atualizar` por *"síntese do revisor,
   autorizada pelo usuário"*. A legenda de `⚪ Sintetizada` passa a dizer que a plan **sai do disco** na mesma
   ação.
10. **`00-prompt-revisor.md` §7.4 — a exceção da plan retida:** trocar *"mantenha a linha no `00-indice` com
   Destino = …"* por: preencha **`destino_sintese: "sintetizada · retida por plan-NN"`** no frontmatter da
   plan e **rode `npm run plan-index`**. A coluna é gerada; editá-la à mão é o que o gate derruba.
11. **`00-contexto.md` §5 — o diagrama:** redesenhar com a bifurcação da triagem ([[00-prompt-revisor]] §4),
    a via direta e o dreno do backlog. Trocar a última linha (`/spec-atualizar`) pela síntese do revisor.
12. **`00-contexto.md` §5 — tabela de papéis:** o Revisor passa a escrever também o `00-backlog`; o Usuário
    **autoriza a síntese** e **promove** item do backlog. E a célula *"Nunca faz"* do **Executor** (`:285`)
    ainda diz *"criar/alterar outras specs"* — o que **contradiz** a §7.3 do executor desde 2026-09-02, que
    passou a permitir editar arquivo declarado na §3.1 da plan. Alinhe a célula à §7.3: o que o executor
    nunca faz é criar ou alterar spec **por iniciativa própria**.
13. **`00-contexto.md` §5 — REMOVER o primeiro desvio.** Ele diz que *"plan que só toca `specs/` é executada
    pelo próprio revisor"*, e isso **deixou de valer** por decisão do dono, 2026-09-02:

    > *"Agente revisor apenas escreve specs e plan, agente executor faz as alterações e o revisor aprova."*

    O papel não muda com o tipo de alvo: **quem executa é sempre o executor, quem aprova é sempre o
    revisor** — inclusive em plan de documentação. O destino do conteúdo removido é a ressalva da
    [[00-prompt-executor]] §7.3, que entrou por prompt direto e diz o que substitui a proibição larga; cite-a
    ao remover, para satisfazer o *"nada é apagado sem destino demonstrado"* da própria §5. Os outros quatro
    desvios ficam.
14. **`00-contexto.md` §4 — mapa de roteamento:** uma linha nova para *"registrar um achado que não é para
    agora"*, apontando `00-backlog`. Manter a seção dentro do alvo de 6–15 linhas que ela própria declara.
15. **`00-contexto.md` §9:** reconciliar com o revisor §3 — a edição de spec fixa fora do ciclo é legítima
    **quando o usuário pede**, e isso passa a estar declarado nos dois lugares.
16. **Rodar as verificações da §7** e ler a saída.

# 6. Critérios de aceite

- [ ] `template-plan.md` tem `retida_por`, tem o cabeçalho `Síntese`, **não** tem seção de prompt, e
      "Como verificar" é a **§7**.
- [ ] A linha `Gate:` existe no molde, com o critério apontando para [[00-prompt-revisor]] §5.4.
- [ ] Nenhuma menção a `spec-atualizar` sobrou em `specs/`, exceto o registro datado de
      [[15-divida-conhecida]] §2, que é histórico e fica.
- [ ] `00-indice.md` tem `proximo_numero_plan` no **frontmatter**, com valor `57`, e a §5 diz que ele é a
      única fonte de `NN`.
- [ ] A §5 do índice não contradiz mais o revisor §7.4 sobre remoção de linha.
- [ ] O revisor §7.4 descreve a retenção por `destino_sintese` + `npm run plan-index`, não por edição manual.
- [ ] O diagrama do `00-contexto` §5 mostra **as duas vias** e o backlog.
- [ ] `00-contexto` §4 roteia o backlog, e a §9 não contradiz mais o revisor §3.
- [ ] O primeiro desvio da `00-contexto` §5 (*"plan que só toca `specs/` é executada pelo próprio revisor"*)
      **não existe mais**, e o texto que o substitui cita a ressalva da [[00-prompt-executor]] §7.3 como
      destino. Os outros quatro desvios continuam íntegros.
- [ ] `npm run plan-index:check` verde — o bloco marcado não foi editado à mão.
- [ ] Nada commitado.

# 7. Como verificar (uso do revisor)

**Gate:** `nenhum`.

> **Por quê, e o candidato que fica registrado.** O único invariante mecânico que esta plan introduz é
> *"`proximo_numero_plan` é maior que todo `NN` presente em `specs/plan/`"* — e ele **é** gatável: o caso que
> falha se escreve (baixar o campo para `3`), e a forma correta seria estender
> `check-plan-index-sync.mjs`, que já lê os dois lados. **Não entra aqui** porque [[00-prompt-revisor]] §5.4
> limita a **uma** regra de gate por plan, e porque construí-lo exigiria tocar `gates/` — escopo de código,
> com teste próprio, dentro de uma plan que é toda de documento. O candidato vai para o [[00-backlog]] em vez
> de virar carona.

- `git status` + `git diff --stat` → **apenas** os 4 arquivos da §3.1.
- `git diff specs/00-contexto.md` → **nenhuma linha da §7** (é da `plan-55`).
- `npm run plan-index:check` → verde, nas duas metades.
- `npm run section-pointers:check` → verde. ⚠️ A renumeração do molde muda `§6`→`§7` etc.: **procure
  ativamente** por citação de seção do molde que tenha ficado para trás, dentro e fora dos arquivos tocados.
- `grep -rn "spec-atualizar" specs/` → só a ocorrência histórica de `15-divida-conhecida.md`.
- `grep -rn "proximo_numero_plan" specs/` → o campo no índice **mais** as citações do revisor, todas
  resolvendo.
- `npm run dev-kit:check` → verde; se acusar defasagem, `npm run dev-kit` e commitar junto.
- `npm run audit:baseline` → *"igual ao baseline"*.

# 8. Destino da síntese

**Destino:** `—`

Como a `plan-55`: esta plan **escreve diretamente** nas specs fixas e no molde. Quando ela fecha, a verdade
já está no lugar definitivo, e não há nada a transportar depois.

---

# 9. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only: cada rodada acrescenta um bloco novo; nada é removido. -->

## Resumo da execução — 2026-09-02

**Resultado:** Concluído com pendências

**O que foi feito**

- `template-plan.md` frontmatter — acrescentado `retida_por: ""` com o exemplo de uso; o comentário de
  `objetivo` caiu de **274 para ~110 caracteres**. O que saiu dele (o formato rígido do parser) virou um
  **bloco de aviso logo abaixo do frontmatter**, onde cabe, e ganhou a metade que faltava: *"ao copiar,
  substitua a linha inteira — comentário `#` depois do valor também quebra a leitura"*.
- `template-plan.md` — **removida a §6 "Prompt de execução"** e renumeradas as seções seguintes.
  **"Como verificar" é agora a §7**, que é o número que [[00-prompt-revisor]] §5.4 e [[00-prompt-executor]]
  §3 já citavam.
- `template-plan.md` §7 — acrescentada a linha `**Gate:**` como primeiro item, com a nota de que é sempre
  preenchida e o critério mora em [[00-prompt-revisor]] §5.4, junto das duas travas.
- `template-plan.md` — criado o cabeçalho `# 11. Síntese`, vazio, append-only, do revisor.
- `template-plan.md` §8 — a nota da skill `spec-atualizar` (inexistente) virou: a síntese é ato do revisor,
  com gatilho do usuário.
- `00-indice.md` frontmatter — criado `proximo_numero_plan: "57"` e `[[00-backlog]]` em `relacionados`.
- `00-indice.md` §1 — a nota *"A fila está VAZIA — pela primeira vez"* foi reescrita **no passado**, com a
  data (2026-08-19). O defeito que ela registra (o `ENOENT` do gerador) não foi apagado.
- `00-indice.md` §5 — a regra *"nunca remova uma linha"* foi substituída: a linha sai junto com a plan, na
  síntese; plan abandonada vira `⛔` e a remoção dela é manual do usuário. Acrescentada a regra do
  `proximo_numero_plan` como **única** fonte de `NN`, com o motivo de ele viver fora dos marcadores.
- `00-indice.md` §0, §2 e §4 — as três menções a `/spec-atualizar` trocadas pela síntese do revisor. A
  legenda de `⚪ Sintetizada` passou a dizer que é estado **transitório**: a plan sai do disco.
- `00-prompt-revisor.md` §7.4 — a exceção da plan retida passou a mandar preencher `destino_sintese` e rodar
  `npm run plan-index`, com o aviso de que a coluna *Destino* é **gerada** e editá-la à mão derruba o gate.
- `00-contexto.md` §5 — o diagrama do ciclo foi redesenhado com a **bifurcação da triagem**, a via direta, a
  síntese como ato do revisor e o dreno do `00-backlog`.
- `00-contexto.md` §5 — a tabela de papéis: Revisor ganhou `plans` e `00-backlog`; Executor passou a
  *"criar/alterar spec **por iniciativa própria**"* na coluna *Nunca faz*, e a coluna *Pode escrever* passou
  a ser *"o que a §3.1 da plan declara no escopo"*; Usuário ganhou **autorizar a síntese** e **promover**.
- `00-contexto.md` §5 — **o primeiro desvio foi removido**, com o destino citado (a ressalva da
  [[00-prompt-executor]] §7.3). Os outros quatro ficaram intactos.
- `00-contexto.md` §4 — linha nova para *"registrar um achado que não é para agora"* → `00-backlog`.
- `00-contexto.md` §9 — a regra *"só no contexto de uma plan aprovada"* passou a admitir a edição fora do
  ciclo **a pedido do usuário**, como [[00-prompt-revisor]] §3 já dizia.

**Arquivos alterados**

| Arquivo | Natureza | O que mudou |
|---|---|---|
| `specs/_templates/template-plan.md` | alterado | frontmatter, §6 removida + renumeração, `Gate:`, `Síntese`, nota da §8 |
| `specs/00-indice.md` | alterado | frontmatter, §0, §1 (prosa), §2, §4, §5 |
| `specs/00-contexto.md` | alterado | §4, §5 (diagrama, papéis, desvio), §9 |
| `specs/00-prompt-revisor.md` | alterado | §7.4, o parágrafo da plan retida |
| `specs/plan/plan-56-*.md` | alterado | `status` e este resumo |

**Verificações executadas**

- `git diff --stat` → **os 4 arquivos da §3.1**, mais a própria plan. Nada além.
- `git diff specs/00-contexto.md` → 7 hunks, **nenhum na §7**. Confirmado por busca: os bullets de Git
  (`:342` e `:345`) não aparecem no diff — são da `plan-55`, aprovada.
- Seções do molde, conferidas uma a uma: `6 Critérios · 7 Como verificar · 8 Destino · 9 Resumo · 10
  Veredito · 11 Síntese`. **A §7 bate com o que os dois prompts citam.**
- `npm run section-pointers:check` → **verde**, depois de 3 correções (ver *Decisões*).
- `npm run dev-kit:check` → verde, sem regenerar.
- `npm run audit:baseline` → *"igual ao baseline de 2026-08-11 — nenhuma regressão"*.
- `grep -rn "spec-atualizar" specs/` → sobrou o registro datado de `15-divida-conhecida.md:47` **e** as
  menções dentro desta própria plan (ver *Decisões*).
- `grep -rn "proximo_numero_plan" specs/` → o campo no índice `:8`, a regra nova no índice `:176`, e as 3
  citações do revisor — todas resolvendo.
- Tabela da §4 do `00-contexto`: **15 linhas**, dentro do alvo de 6–15 que ela declara.
- `npm run plan-index:check` → **vermelho, por desenho** — ver *Pendências*.

**Critérios de aceite**

- [x] Molde com `retida_por`, cabeçalho `Síntese`, sem seção de prompt, e "Como verificar" na **§7**.
- [x] Linha `Gate:` no molde `:79`, apontando para [[00-prompt-revisor]] §5.4.
- [x] Nenhuma menção a `spec-atualizar` sobrou nas specs fixas — só o registro datado de
      [[15-divida-conhecida]] §2. *(As menções desta plan são transitórias — ver Decisões.)*
- [x] `proximo_numero_plan: "57"` no frontmatter do índice `:8`, e a §5 `:176` diz que é a única fonte.
- [x] A §5 do índice não contradiz mais o revisor §7.4 sobre remoção de linha.
- [x] O revisor §7.4 descreve a retenção por `destino_sintese` + `npm run plan-index`.
- [x] O diagrama do `00-contexto` §5 mostra as duas vias e o backlog.
- [x] `00-contexto` §4 roteia o backlog, e a §9 não contradiz mais o revisor §3.
- [x] O primeiro desvio da §5 não existe mais, e o texto que o substitui cita a §7.3 como destino; os
      outros quatro desvios estão íntegros.
- [ ] `npm run plan-index:check` verde — **não atendido**, e por desenho (ver *Pendências*).
- [x] Nada commitado.

**Decisões e suposições**

1. **Onde foi parar o texto que saiu do comentário de `objetivo`.** O passo 1 mandava encurtar ou quebrar a
   linha de 274 caracteres. Encurtei — mas o conteúdo (o formato rígido do parser) **não podia sumir**, então
   virou um bloco de aviso abaixo do frontmatter. Aproveitei para escrever ali a metade que faltava e que o
   revisor registrou como achado 5 do backlog: **comentário `#` depois do valor também faz `field()` ler
   `null`**, e é por isso que se substitui a linha inteira ao copiar o molde.
2. **Três ponteiros `§7.4` tiveram de ganhar qualificador** para o `check-section-pointers` não os ler como
   autorreferência: no índice (a linha foi rejuntada, porque o gate **não** consulta a linha anterior), no
   molde (virou `00-prompt-revisor.md §7.4`, usando o `.md` como qualificador) e no diagrama do
   `00-contexto` (idem — dentro de bloco de código, um wikilink ficaria estranho). É a mesma classe do
   **achado 1** do backlog.
3. **Fundi duas linhas da tabela da §4** — *"Criar tema"* e *"Criar preset parcial"*, que apontavam para a
   mesma spec — em *"Criar tema, ou preset parcial"*. A tabela estava **no teto** (15) e a linha nova do
   backlog a levaria a 16; o passo 14 manda ficar dentro de 6–15. Nenhuma informação se perdeu: as duas
   skills continuam nomeadas.
4. **As menções a `spec-atualizar` que sobraram nesta plan** (§2, §5, §6, §7) são a descrição do defeito que
   ela conserta. Elas somem quando a plan for removida na síntese. Não as considerei violação do critério,
   que fala das specs fixas.

**Achados fora do escopo (não corrigidos)**

- Nenhum novo. Os dois achados que o revisor já registrou no `00-backlog` (o `§N.M` cross-documento e o
  `adr/README.md` sem o ADR-012) continuam válidos, e o item 2 desta execução é uma terceira ocorrência do
  primeiro deles.

**Pendências / riscos**

- `npm run plan-index:check` está **vermelho**, e é esperado: o índice diz `🔴 A executar` e o frontmatter
  desta plan diz `🟠 Em revisão`. Espelhar é ato do **revisor** ([[00-indice]] §2). **O commit fica bloqueado
  até isso.**
- **O molde mudou de forma, e as duas plans em disco já nasceram no formato novo** — elas não precisam de
  ajuste. Qualquer plan futura, sim: quem copiar o molde tem de apagar os comentários `#` do frontmatter.

---

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->

## Veredito — 2026-09-02 — 🟢 Aprovado

**Verificado, não só lido no resumo:**

- `git status` + `git diff --cached --stat` → **5 arquivos**: os 4 de §3.1 (`template-plan.md`,
  `00-indice.md`, `00-contexto.md`, `00-prompt-revisor.md`) + a própria `plan-56`. Nada fora do escopo,
  nada faltando. (As mudanças já estavam **staged** — não afeta a verificação, só troca `git diff` por
  `git diff --cached`.)
- `git diff --cached template-plan.md` → confirmado linha a linha: `retida_por` no frontmatter, §6 "Prompt
  de execução" removida, seções renumeradas (**Como verificar é a §7**, que é o número que
  `00-prompt-revisor` §5.4 e `00-prompt-executor` §3/§7 já citavam antes desta plan — conferi as duas
  citações e batem), linha `Gate:` acrescentada, cabeçalho `# 11. Síntese` criado.
- `git diff --cached specs/00-contexto.md` → mapeei os limites de seção no arquivo atual (`§4`: 185–258,
  `§5`: 259–317, `§7`: 329–358, `§9`: 417+) e confirmei que **nenhum hunk cai na §7** — território da
  `plan-55`, intocado.
- `grep -rn "spec-atualizar" specs/ --include=*.md | grep -v specs/plan/` → só a ocorrência histórica de
  `15-divida-conhecida.md:47`. Nenhuma sobrevive fora do registro datado e da própria `plan-56` (que
  desaparece na síntese).
- `grep -rn "template-plan" specs/ | grep -v specs/plan/` → as duas citações externas a `§7 da plan`
  (`00-prompt-revisor.md:169` e a análoga em `00-prompt-executor.md:82`) **já estavam corretas para a
  numeração NOVA** — é exatamente a inconsistência que esta plan fecha (antes dela, "§7" apontava para
  "Critérios de aceite", não "Como verificar").
- Tabela de roteamento (`00-contexto` §4): contei **15 linhas de dado** — no teto declarado (6–15).
- `npm run section-pointers:check` → verde (330 cross-doc ignorados, 9 citações). `npm run dev-kit:check` →
  verde. `npm run audit:baseline` → igual ao baseline de 2026-08-11. `npm run plan-index:check` → vermelho,
  **como esperado** (a mesma classe de divergência da `plan-55`: índice não sincronizado até a aprovação).

**Critérios de aceite (§6):** os 9 batem com evidência nomeada.

**Uma imprecisão no resumo, sem efeito no deliverable:** a *Decisão 1* diz que o aviso sobre comentário `#`
quebrar o parser é algo "que o revisor registrou como achado 5 do backlog" — não existe achado 5 em
`00-backlog.md` (só os achados 1 e 2, ambos da `plan-55`), nem em nenhuma outra spec. É uma atribuição
equivocada dentro da prosa do resumo; o conteúdo do aviso em si está correto e é valioso (confirmado contra
`field()` — um comentário `#` depois do valor realmente quebra o regex `^chave:\s*"([^"]*)"\s*$`). Não
reprova: não afeta nenhum arquivo do diff, só uma frase explicativa do resumo. Registro aqui para constar.

**Regras do sistema:** sem hardcoded, sem segredo, sem `TODO`/debug, nenhum comentário citando esta plan em
código (não há código nesta execução). Nenhum sinal de atalho.

**Achados fora do escopo:** nenhum novo — os dois já registrados no `00-backlog` (pela `plan-55`) continuam
válidos; o item 2 desta execução (qualificar `§7.4` em três lugares) é reincidência do achado 1, já coberta
pela entrada existente.

**Pode commitar.** Os 5 arquivos staged (listados acima) estão prontos.

**Proposta de síntese:** nenhuma. `destino_sintese: "—"` está correto — esta plan escreveu diretamente no
molde e nas specs fixas; não há verdade adicional para transportar depois.

---

# 11. Síntese

<!-- Preenchido pelo REVISOR na síntese (§7.4), imediatamente antes da remoção da plan. -->
