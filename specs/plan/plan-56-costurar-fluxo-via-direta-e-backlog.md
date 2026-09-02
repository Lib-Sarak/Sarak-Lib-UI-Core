---
tipo: "plan"
titulo: "Costurar os artefatos do fluxo SDD à via direta e ao backlog"
objetivo: "Alinhar o molde de plan, o índice e o contexto ao desenho de via direta e backlog que os três prompts do fluxo passaram a assumir, fechando as contradições que a atualização deles abriu"
dominio: "Governança de Specs (SDD)"
status: "🔴 A executar"
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
    **autoriza a síntese** e **promove** item do backlog.
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

---

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->

---

# 11. Síntese

<!-- Preenchido pelo REVISOR na síntese (§7.4), imediatamente antes da remoção da plan. -->
