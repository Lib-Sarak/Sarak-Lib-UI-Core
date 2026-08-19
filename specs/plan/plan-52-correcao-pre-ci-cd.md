---
tipo: "plan"
titulo: "Adequar as verificações e a suíte ANTES do pipeline — cada gate no lugar certo, e o tempo que a CI vai herdar"
dominio: "Sarak-Lib-UI-Core / Qualidade / Automação"
status: "🟢 Aprovada"
prioridade: "Alta"
tags: ["plan", "gates", "testes", "automacao", "pre-ci"]
relacionados: ["[[01-gates-e-baseline]]", "[[02-enforcement-por-commit]]", "[[11-testes-e-cobertura]]", "[[14-artefatos-do-mantenedor]]", "[[15-divida-conhecida]]"]
depende_de: ""
destino_sintese: "specs/specs/02-enforcement-por-commit.md · specs/specs/01-gates-e-baseline.md · specs/specs/11-testes-e-cobertura.md · specs/specs/14-artefatos-do-mantenedor.md · specs/specs/15-divida-conhecida.md"
objetivo: "Pôr cada verificação no lugar certo e tirar da suíte a sobrecarga que a CI herdaria, para o pipeline nascer sobre uma base correta"
---

# 1. Objetivo

O pipeline vai **herdar** o que existir aqui: se um gate não roda em lugar nenhum, a CI o carrega como
novidade; se a suíte gasta 95% do tempo montando cenário, a CI paga essa conta em todo PR, para sempre.

Esta plan arruma a casa **antes** — e é por isso que ela vem primeiro na fila.

# 2. Contexto — o levantamento que a originou

Medido pelo revisor em 2026-08-18, com a suíte 100% verde (317 arquivos / 1376 testes) e os 15 gates de
contrato verdes.

## 2.1 Quatro gates que **nenhuma automação executa**

Existem no `package.json`, estão verdes hoje, e são rodados por *ninguém* — nem hook, nem `gates:full`, nem
`run_audit`. Só se um humano digitar o comando.

| Gate | Custo medido | Em hook? | Em `gates:full`? | Em `run_audit`? |
|---|---|:---:|:---:|:---:|
| `container-query:check` | **911 ms** | ❌ | ❌ | ❌ |
| `container-query-boundary:check` | **762 ms** | ❌ | ❌ | ❌ |
| `persistence-doc:check` | **720 ms** | ❌ | ❌ | ❌ |
| `themes:diversity` | **3.637 ms** | ❌ | ❌ | ❌ |

⚠️ **Três deles têm teste na suíte, e isso engana.** Os testes montam arquivos falsos numa pasta temporária
(`fs.mkdtempSync`) e verificam que o gate os pega. Conferido em quatro deles: **nenhum aponta para a raiz do
repositório**. *O teste prova que o gate funciona; nada prova que este repositório passa nele.* São coisas
diferentes, e a segunda é a que importa. O `container-query-boundary` nem teste próprio tem.

## 2.2 Dois vãos no que já existe

| Vão | Medido |
|---|---|
| **`run_audit` + `tsc` não estão no `gates:full`** | `gates:full` = `dev-kit:check` → `build` → `build-info:check` → `package:check` → `coverage:check`. **O `preversion` é `gates:full`** — logo o ritual de release **não roda os 12 auditores nem o `tsc`**. Ele confia que o `pre-commit` já o fez, e essa dependência entre dois mecanismos não está escrita em lugar nenhum |
| **O hook roda metade do `plan-index:check`** | o script npm é `check-plan-index-sync.mjs && generate-plan-index.mjs --check`; o `pre-commit:44` chama **só o primeiro**. Índice gerado defasado passa |

## 2.3 A suíte gasta 95% do tempo montando cenário

Decomposição publicada pelo próprio `vitest` na execução de 2026-08-18 (somada entre workers, por isso passa
do relógio de 315,44 s):

```
environment ....... 1.559 s   ← montar o jsdom
import ............ 2.460 s   ← carregar módulos
setup .............   176 s
transform .........    41 s
tests .............   244 s   ← o teste de verdade
```

| Conta | Resultado |
|---|---|
| `tests` ÷ trabalho total | **~5%** — o resto é cenário |
| `environment` ÷ 317 arquivos | **4,9 s por arquivo**, só para montar um jsdom |
| `tests` ÷ 1376 testes | **0,18 s por teste** — os testes são rápidos |

**A causa está no `vitest.config.ts`:** `environment: 'jsdom'` é **global**, para os 317 arquivos. Medido:
**zero** arquivos usam `@vitest-environment` para escapar, e **128** são `.test.ts`/`.test.mjs` — lógica pura,
sem renderizar React — pagando um jsdom inteiro à toa.

> **Por que isto é pré-requisito do pipeline, e não melhoria adiada.** A CI roda a suíte **com cobertura** em
> todo PR. Estimativa: ~15 min de job, dos quais ~10 são a suíte. Puxar esta alavanca derruba a CI para a
> faixa saudável (< 10 min de feedback) **sem tocar numa linha da CI**. Feito depois, você reescreve números
> que acabou de publicar na spec 16.

# 3. Escopo

## 3.1 Dentro
- `.githooks/pre-commit` — `dev-kit:check` (§5 passo 3) **+** os três gates baratos no Anel 1 (§5 passo 1)
- `package.json` — só o script `gates:full` (§5 passo 2)
- `vitest.config.ts` — a sobrecarga de ambiente (§5 passo 4)
- Arquivos de teste — **apenas** o docblock/escopo de ambiente, se for o mecanismo escolhido
- O **§10 desta plan** — os números e decisões que as specs fixas vão precisar (§5 passo 5)

> 🔧 **Corrigido em 2026-08-18 pelo revisor, DEPOIS da execução.** Esta lista incluía as cinco specs fixas
> (`02`, `01`, `11`, `14`, `15`) como se o executor devesse editá-las — e a §7.3 do [[00-prompt-executor]]
> proíbe isso em termos absolutos: *"NUNCA crie nem edite outra spec. `specs/` … são do revisor."* **O defeito
> era da plan, não da entrega.** O executor identificou o conflito, obedeceu à proibição e deixou tudo
> documentado no §10 — que é exatamente o comportamento correto. O trabalho não sumiu: é da síntese
> (`/spec-atualizar`), como o campo `destino_sintese` sempre disse.

## 3.2 Fora
- ⛔ **`.github/` e qualquer coisa de CI.** É a plan-05, e ela depende desta. Aqui não se cria workflow.
- ⛔ **Criar gate novo**, ou **alterar o que qualquer gate verifica**. Esta plan move gates de lugar e
  arruma onde eles rodam — o que cada um cobra fica idêntico.
- ⛔ **Mudar a LÓGICA de qualquer teste.** Trocar o ambiente em que um teste roda não é reescrever o teste.
  Se um teste precisar de mudança de conteúdo para sobreviver ao ambiente novo, **ele fica no jsdom** —
  e você registra qual e por quê.
- ⛔ **Mexer em `pool: 'forks'` ou no `execArgv`** sem prova. Os dois têm motivo documentado no próprio
  config (OOM em lote grande; `poolOptions` ignorado em silêncio pelo Vitest 4). Ver §5 passo 4, limite 2.
- ⛔ `themes:diversity` **não** entra no `run_audit`. Entrar lá significa item novo no `audit-baseline.json`,
  e reescrever baseline dentro de uma plan que proíbe alterar comportamento de gate abre porta que não fecha.
- ⛔ Consertar a metade faltante do `plan-index:check` no hook (§2.2). Seria a mexida extra que não se paga —
  a CI da plan-05 roda o script inteiro e cobre o vão. **Registre como achado**, não como código.
- ⛔ Regravar o piso de cobertura "de brinde". Se a cobertura **subir**, o `--write` é decisão de quem mede
  em laço (achado **43**), não efeito colateral desta plan.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/specs/02-enforcement-por-commit.md` §3 | o custo por classe de commit que você vai remedir |
| Spec fixa | `specs/specs/11-testes-e-cobertura.md` §3.5 · §5 | o procedimento de captura, e a história do config atual |
| Spec fixa | `specs/specs/01-gates-e-baseline.md` §2.2 | o catálogo de gates e o que cada um garante |
| Spec fixa | `specs/specs/15-divida-conhecida.md` | achados **43** (piso folgado) e **44** (intermitência) |
| Código | `vitest.config.ts` · `.githooks/pre-commit` · `package.json` | o que você altera; leia os comentários antes |

# 5. Instruções de execução

## Passo 1 — Os três gates baratos entram no Anel 1

| Gate | Custo | Referência já aceita no Anel 1 |
|---|---|---|
| `container-query:check` | 911 ms | `deep-import:check` = **672 ms** |
| `container-query-boundary:check` | 762 ms | `gate-limits:check` = **761 ms** |
| `persistence-doc:check` | 720 ms | — |

**Custam o mesmo que gates que já estão lá.** Entram pelo helper `anel1()` existente, com rótulo, regra
violada e comando de reprodução, como os outros — não invente forma nova onde já há um molde.

`persistence-doc:check` compara `docs/` contra `src/core/Provider/types.ts` e `providerProps.ts`: é paridade
doc × código, a mesma família do `catalog:check`, e por isso pertence ao mesmo anel.

## Passo 2 — O `gates:full` fecha os dois vãos

Acrescente, **sem remover nem reordenar nada do que já está lá**:

| O que entra | Custo medido | Por quê |
|---|---|---|
| `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` | **22.605 ms** | hoje o release **não** roda os 12 auditores nem o `tsc`. 22 s num ritual de ~5 min é ruído |
| `themes:diversity` | **3.637 ms** | 5× mais caro que os do passo 1, e tema muda raramente — pagar isso em todo commit é a troca errada; aqui, não |

⚠️ **O `dev-kit:check` continua onde está, e primeiro.** O `gates:full` segue sendo o portão de release.

## Passo 3 — `dev-kit:check` passa a bloquear o commit *(decisão do dono, 2026-08-18)*

**O requisito, e só ele:** um commit que possa defasar `sarak-dev/` é **bloqueado** até o kit ser regenerado.
O *como* é seu — mas leia a armadilha antes, porque a solução óbvia está errada.

`sarak-dev/state.json` é o **único** artefato gerado que nenhum hook cobra (`grep -c "dev-kit"
.githooks/pre-commit` → **0**). Ele só vive no `gates:full`, e por ele no `preversion` — por isso a defasagem
só aparece **na hora de emitir release**, bloqueando por trabalho de plans anteriores.

⚠️ **Pôr no Anel 1 NÃO resolve — e falharia justo onde mais dói.** O `pre-commit` separa dois gatilhos:

| Gatilho | Casa com | Dispara |
|---|---|---|
| `TOCA_CODIGO` | `src/` `scripts/` `gates/` `docs/` `sarak-ui/` `bin/` `package.json` `.githooks/` | Anéis 1 **e** 2 |
| `TOCA_DOC_COM_SECAO` | `specs/specs/` `specs/adr/` `specs/arquitetura/` `specs/00-` `.agents/skills/` `sarak-dev/` | **só o Anel 2** — o hook imprime *"Anel 1 PULADO"* |

E `state.json` carrega `base` = a **lista de arquivos** de `specs/adr/`, `specs/arquitetura/` e
`specs/specs/`. Logo **criar ou remover uma spec defasa o kit** — e cai no gatilho que **pula o Anel 1**.
O gate precisa cobrir a **união** dos dois gatilhos.

**Precedente de forma:** `check-plan-index-sync` já é um gate com gatilho próprio, fora da estrutura de anéis,
bloqueando binariamente (`.githooks/pre-commit:44`). É o molde mais próximo — saiba que existe e por quê.

**Declare, não descubra:** o `dev-kit:check` reprova por **defasagem** *e* por **ponteiro morto** na prosa do
kit ([[14-artefatos-do-mantenedor]] §4.2). Levá-lo ao `pre-commit` faz **um ponteiro morto no guia barrar
commit**, o que hoje não acontece. É consequência desejada — é o único gate que audita documentação por
conteúdo —, mas é **mudança de comportamento**. Se se mostrar custosa, **relate; não afrouxe o gate**.

## Passo 4 — A sobrecarga de ambiente da suíte

**O alvo:** os 128 arquivos `.test.ts`/`.test.mjs` que não renderizam React e hoje pagam **4,9 s** de jsdom
cada um. **O mecanismo é seu** — o `vitest.config.ts` do Vitest 4 tem mais de um caminho para escopar
ambiente, e eu não vou prescrever API que não verifiquei. **Verifique, escolha, e escreva por que escolheu.**

### Três limites que não se negociam

1. **A suíte continua 317 arquivos / 1376 testes, 100% verde.** Contagem igual, não "equivalente". Arquivo
   que sumiu da coleta é regressão silenciosa — foi exatamente assim que o E2E passou meses sem rodar.
2. **`pool: 'forks'` e `execArgv` ficam como estão.** O comentário do config registra o motivo: workers
   reutilizados acumulavam heap do jsdom e a suíte caía por OOM. Se você **acha** que threads resolveria,
   isso é medição para outra plan — aqui não, e o custo de errar é a suíte inteira caindo em lote grande.
3. **Teste que precisa de DOM fica no jsdom.** Se um arquivo quebrar no ambiente novo, ele **volta**, e você
   registra qual e por quê. Adaptar o teste ao ambiente é mudar a lógica do teste — a §3.2 proíbe.

### O que medir e escrever

**Antes e depois**, com a decomposição inteira que o `vitest` imprime:

```
Duration N s (transform … , setup … , import … , tests … , environment … )
```

Mais: quantos arquivos migraram de ambiente, quantos ficaram no jsdom e por quê, e a cobertura antes/depois
(`vitest run --coverage`) — que **não pode cair abaixo do piso** de `gates/baselines/coverage-floor.json`.

⚠️ **Se não melhorar, declare e pare.** Meta não atingida e escrita honestamente vale mais que um número
forçado. O que **não** pode acontecer é a suíte ficar mais rápida e menos confiável.

### E se aparecer um teste intermitente

Achado **44**: a suíte não foi provada determinística, e uma mudança de ambiente é exatamente o tipo de coisa
que pode acordar o defeito sem nome. Se ele aparecer, **você achou o que 46 execuções controladas não
acharam** — siga o procedimento de captura de [[11-testes-e-cobertura]] §3.5: **grave a saída inteira em
arquivo, nunca `tail`/`grep` ao vivo**, e relate. Não perseguir além disso.

## Passo 5 — O material para as specs *(no §10, não nas specs)*

> 🔧 **Corrigido em 2026-08-18, depois da execução.** Este passo dizia "as specs" e mandava editá-las. A §7.3
> do [[00-prompt-executor]] proíbe o executor de tocar `specs/specs/`. O que segue é o **conteúdo** que a
> síntese vai transportar — o executor o escreve no **§10**, e o revisor o leva às specs.

- **`02-enforcement-por-commit.md`** — §2.2 e §3 ganham os gates novos do Anel 1 e o `dev-kit:check` com o
  gatilho dele; e o **custo remedido das três classes de commit** substitui os números atuais.
  > ⚠️ **O número publicado envelheceu.** A spec diz *"commit com código = 10.042 ms"*. Medido agora: **o
  > Anel 2 sozinho leva 11.860 ms, e 22.605 ms com `tsc`**. O custo real é o triplo do publicado. Remeça as
  > três classes **depois** das suas mudanças e escreva os números — inclusive se piorarem.
- **`01-gates-e-baseline.md`** — os quatro órfãos deixam de ser órfãos; a coluna "onde cada gate roda"
  passa a ter todos.
- **`11-testes-e-cobertura.md`** — §5 ganha a decisão de ambiente, com o antes/depois medido.
- **`14-artefatos-do-mantenedor.md`** §5 — a linha `.githooks/pre-commit` sai de **"Não *(decisão em
  aberto)*"** para **Sim**, datada, com o motivo.
- **`15-divida-conhecida.md`** §4.1 — **achado novo**: o `pre-commit` roda só metade do `plan-index:check`
  (§2.2 desta plan), e o vão fica coberto pela CI da plan-05, não pelo hook.

# 6. Prompt de execução

```
Leia specs/00-prompt-executor.md e execute specs/plan/plan-52-correcao-pre-ci-cd.md.

Contexto obrigatorio antes de comecar: specs/00-contexto.md, specs/00-knowledge.md,
specs/specs/01-gates-e-baseline.md, specs/specs/02-enforcement-por-commit.md,
specs/specs/11-testes-e-cobertura.md, specs/specs/14-artefatos-do-mantenedor.md.

Esta plan vem ANTES da plan-05 (a CI) de proposito: o pipeline HERDA o que existir
aqui. Voce NAO cria nada de .github/ nem de CI.

PASSO 1 — os 3 gates baratos entram no Anel 1 do pre-commit, pelo helper anel1()
  que ja existe: container-query:check (911ms), container-query-boundary:check
  (762ms), persistence-doc:check (720ms). Custam o mesmo que deep-import (672ms)
  e gate-limits (761ms), que ja estao la.

PASSO 2 — gates:full ganha check-audit-baseline --with-tsc (22.605ms) e
  themes:diversity (3.637ms). SEM remover nem reordenar o que ja esta la, e o
  dev-kit:check continua primeiro. themes:diversity NAO entra no run_audit (isso
  exigiria item novo no audit-baseline.json).

PASSO 3 (decisao do dono, 2026-08-18) — dev-kit:check passa a BLOQUEAR o commit.
  Por no Anel 1 NAO resolve: o pre-commit tem DOIS gatilhos, e o de spec
  (TOCA_DOC_COM_SECAO) dispara SO o Anel 2 — imprime "Anel 1 PULADO". E o
  state.json carrega a LISTA DE ARQUIVOS de specs/specs|adr|arquitetura, entao
  criar/remover uma spec defasa o kit. Precisa cobrir a UNIAO dos dois gatilhos.
  Precedente de forma: check-plan-index-sync tem gatilho proprio, fora dos aneis.
  DECLARE que ponteiro morto no guia passa a barrar commit — e desejado, mas e
  mudanca de comportamento.

PASSO 4 — a sobrecarga de ambiente da suite. 128 arquivos .test.ts/.test.mjs nao
  renderizam React e pagam 4,9s de jsdom cada. O MECANISMO E SEU: verifique a API
  do Vitest 4, escolha, e escreva por que. TRES LIMITES: (1) a suite continua 317
  arquivos / 1376 testes, 100% verde — contagem IGUAL, arquivo sumido da coleta e
  regressao silenciosa; (2) pool:'forks' e execArgv NAO se tocam, o motivo (OOM)
  esta escrito no config; (3) teste que precisa de DOM FICA no jsdom — adaptar o
  teste ao ambiente e mudar a logica do teste, e isso e proibido aqui.
  MEDIR antes/depois com a decomposicao inteira do vitest (transform, setup,
  import, tests, environment) + cobertura, que NAO pode cair abaixo do piso.
  Se nao melhorar: DECLARE e pare. Numero forcado nao serve.
  Se aparecer teste intermitente (achado 44): capture pelo procedimento da
  11-testes §3.5 — grave a saida INTEIRA em arquivo, nunca tail/grep ao vivo.

PASSO 5 — as specs. Remeça as TRES classes de commit (so-doc, so-spec, com
  codigo): o numero publicado (10.042ms) envelheceu — o Anel 2 sozinho ja mede
  11.860ms, e 22.605ms com tsc. Escreva os numeros novos, inclusive se piorarem.
  Achado novo na 15-divida §4.1: o pre-commit roda so METADE do plan-index:check.

Voce NAO cria gate novo. Voce NAO altera o que qualquer gate VERIFICA. Voce NAO
muda a logica de nenhum teste. Voce NAO mexe em .github/. Voce NAO regrava o piso
de cobertura. Voce NAO conserta a metade faltante do plan-index no hook — isso e
achado, nao codigo.
Nao saia do escopo. Nao commite. Ao terminar, escreva o resumo na propria plan e
mova o status para 🟠 Em revisao.
```

# 7. Critérios de aceite

- [ ] Os **três** gates baratos rodam no Anel 1, pelo helper `anel1()`, com rótulo/regra/comando como os
      demais — provado com um vermelho deliberado em cada um, **revertido** depois.
- [ ] `gates:full` roda `check-audit-baseline --with-tsc` **e** `themes:diversity`, **sem** ter removido ou
      reordenado nada; `dev-kit:check` continua primeiro.
- [ ] **`dev-kit:check` bloqueia o commit** com o kit defasado — provado com defasagem deliberada,
      **revertida**; e provado no caso que só cria/remove arquivo em `specs/specs/` (o que o Anel 1 pularia).
- [ ] Declarado que **ponteiro morto no guia passa a barrar commit**.
- [ ] **A suíte continua 317 arquivos / 1376 testes, 100% verde** — contagem idêntica, não equivalente.
- [ ] Decomposição do `vitest` **antes e depois** escrita por inteiro (transform · setup · import · tests ·
      environment), com quantos arquivos migraram e quantos ficaram no jsdom **com o motivo de cada grupo**.
- [ ] Cobertura medida depois, e **não** abaixo do piso de `gates/baselines/coverage-floor.json`. Piso **não**
      regravado.
- [ ] `pool: 'forks'` e `execArgv` **inalterados**.
- [ ] Nenhum teste teve a lógica alterada — só ambiente.
- [ ] Custo das **três** classes de commit remedido e escrito, contra os 609 ms / 10.042 ms publicados.
- [ ] Achado novo **documentado no §10** (não na spec — §7.3 do [[00-prompt-executor]]) sobre a metade
      faltante do `plan-index:check`, com a evidência que o confirma.
- [ ] **Nenhuma spec fixa tocada** — `git status` limpo em `specs/specs/`, `arquitetura/`, `adr/`.
- [ ] Nenhum gate novo; nenhum gate mudou o que verifica; **nada** de `.github/`.

# 8. Como verificar

```bash
# passo 1 — os 3 entraram no anel certo
grep -c "container-query" .githooks/pre-commit      # era 0
grep -c "persistence-doc" .githooks/pre-commit      # era 0

# passo 2 — o gates:full cresceu, sem perder nada
node -e "console.log(require('./package.json').scripts['gates:full'])"

# passo 3 — o caso que o Anel 1 sozinho pularia
#   -> plantar arquivo em specs/specs/, "git add", rodar "sh .githooks/pre-commit"
#   -> tem de BLOQUEAR; depois desfazer

# passo 4 — a contagem NAO pode mudar
npx vitest run          # 317 arquivos / 1376 testes, verde
npx vitest run --coverage && node gates/scripts/release/check-coverage-floor.mjs
git diff vitest.config.ts | grep -E "pool|execArgv"   # tem de sair VAZIO
```

- `git diff --stat` → `.githooks/pre-commit`, `package.json`, `vitest.config.ts`, testes, `specs/` —
  **nenhum** `.github/`, **nenhum** `gates/scripts/`
- `git diff` nos testes: só docblock/ambiente. **Nenhuma** linha de `expect`, `it` ou `describe` alterada
- `npm run audit` → baseline **inalterado**

# 9. Destino da síntese

**Destino:** `specs/specs/02-enforcement-por-commit.md` · `specs/specs/01-gates-e-baseline.md` ·
`specs/specs/11-testes-e-cobertura.md` · `specs/specs/14-artefatos-do-mantenedor.md` ·
`specs/specs/15-divida-conhecida.md`

- **`02-enforcement`** §2.2/§3 — os gates novos do Anel 1, o `dev-kit:check` com seu gatilho, e o custo
  remedido das três classes de commit substituindo o número envelhecido.
- **`01-gates-e-baseline`** §2.2 — os quatro órfãos ganham linha de "onde roda".
- **`11-testes-e-cobertura`** §5 — a decisão de ambiente, com o antes/depois medido.
- **`14-artefatos-do-mantenedor`** §5 — `.githooks/pre-commit` vira **Sim**, datado.
- **`15-divida-conhecida`** §4.1 — o achado novo do `plan-index:check` pela metade.

---

# 10. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only. -->

## Resumo da execução — 2026-08-18

**Resultado:** Concluído com pendências (ver seção própria abaixo — nenhuma bloqueia os critérios de aceite).

### O que foi feito

**Passo 1 — os três gates baratos no Anel 1** (`.githooks/pre-commit:134-139`): `container-query:check`,
`container-query-boundary:check` e `persistence-doc:check` passaram a rodar dentro do `if [ -n "$TOCA_CODIGO" ]`,
pelo helper `anel1()` já existente, no mesmo molde dos seis gates que já estavam lá.

**Passo 2 — `gates:full` fecha os dois vãos** (`package.json:52`): acrescentados
`node gates/scripts/release/check-audit-baseline.mjs --with-tsc` e `npm run themes:diversity` ao **fim** da
cadeia — nada do que já existia foi removido ou reordenado; `dev-kit:check` continua primeiro.

**Passo 3 — `dev-kit:check` bloqueia o commit** (`.githooks/pre-commit:81-108`): novo bloco "Anel 1 (kit do
mantenedor)", posicionado **fora** do `if [ -n "$TOCA_CODIGO" ]` — depois do `exit 0` que pula os dois anéis
quando nem `TOCA_CODIGO` nem `TOCA_DOC_COM_SECAO` disparam, e antes do bloco de Anel 1 de contrato. Chegar até
ali já prova que a união dos dois gatilhos disparou, sem precisar duplicar a checagem. Invocação direta
(`node scripts/generate-dev-kit.mjs --check`), no mesmo padrão de custo dos outros gates do Anel 1.

**Passo 4 — sobrecarga de ambiente da suíte**: mecanismo escolhido foi o **docblock por arquivo**
(`// @vitest-environment node`, Vitest 4 — API confirmada lendo `node_modules/vitest/dist/chunks/cli-api.BfdDOPPI.js`,
função `detectCodeBlock`), não `environmentMatchGlobs` (**removido** no Vitest 4 — zero ocorrências em todo
`node_modules/vitest*`) nem `test.projects` (exigiria duplicar `pool`/`execArgv`/`setupFiles`/`exclude` por
projeto ou usar `extends: true`, mexendo exatamente no que o Limite 2 proíbe tocar). **Achado que decidiu a
escolha:** 15 arquivos de `bin/scaffold/` + `scripts/consumer-kit/__tests__/kitGenerator.test.mjs` **já usavam
esse docblock antes desta plan** (confirmado em `git show HEAD:...`) — é mecanismo com precedente já vivo e
testado neste próprio repositório, não uma técnica nova sendo introduzida.

Classificação: script `classify_env.mjs` (scratchpad) varreu os 128 arquivos `.test.ts`/`.test.mjs` que o
Vitest efetivamente coleta (confirmado com `npx vitest list --filesOnly`, não com `find`, que conta 296 e
inclui caminhos que o Vitest não varre) atrás de sinais de DOM (`@testing-library/*`, `document.`, `window.`,
`localStorage`, etc.). 93 sem sinal (91 arquivos físicos únicos — 2 entradas eram `.claude/skills/...`,
symlink de `.agents/skills/...`) · 35 com sinal, ficaram em `jsdom`.

`apply_node_env.mjs` (scratchpad) aplicou o docblock nos 91 candidatos, idempotente (76 novos — os outros 15 já
tinham). Rodada completa da suíte revelou **1 falso negativo do classificador estático**:
`src/core/Security/__tests__/sanitizeHtml.test.ts` — a função sob teste (`sanitizeHtml.ts:31`) checa
`typeof window === 'undefined'` e degrada para um fallback fail-closed (remove todas as tags) sem DOM; o
arquivo de teste em si não cita `document`/`window`, então o scanner textual não viu a dependência
**transitiva**. Devolvido a `jsdom` (docblock removido) — teste voltou a passar, **nenhuma linha de lógica de
teste foi tocada**, só o ambiente.

**Estado final:** 90 arquivos físicos únicos em `node` (15 pré-existentes + 75 desta plan), 36 em `jsdom` (35
classificados corretamente de saída + 1 recuperado pela rodada empírica).

### Arquivos alterados

| Arquivo | Natureza | O que mudou |
|---|---|---|
| `.githooks/pre-commit` | alterado | +3 gates no Anel 1 (`anel1()`); novo bloco "Anel 1 (kit do mantenedor)" com gatilho na união de `TOCA_CODIGO`/`TOCA_DOC_COM_SECAO` |
| `package.json` | alterado | `gates:full` ganha `check-audit-baseline --with-tsc` e `themes:diversity` ao fim da cadeia |
| `sarak-dev/state.json` · `GUIA-MANUTENCAO.md` · `START-HERE.md` | alterados | regenerados (`npm run dev-kit`) para refletir os dois arquivos acima — senão o próprio gate que criei bloquearia o commit do resto desta plan |
| 76 arquivos `*.test.ts`/`*.test.mjs` (`bin/`, `scripts/`, `gates/scripts/`, `src/`, `.agents/skills/`, espelhados em `.claude/skills/`) | alterados | `// @vitest-environment node` como 1ª linha — lista completa em `candidatos_node.txt` (scratchpad), 75 mantidos + 1 revertido (`sanitizeHtml.test.ts`, net-zero diff) |
| `vitest.config.ts` | **inalterado** | confirmado (`git diff` vazio) — o mecanismo escolhido não precisa dele |

### Verificações executadas

**Passo 1** — vermelho deliberado em cada um dos três gates (arquivo plantado em `src/__plan52_scratch__/` ou
edição temporária de `types.ts`, staged, `sh .githooks/pre-commit`), todos bloquearam citando o gate certo,
todos revertidos:
- `container-query:check` → `⛔ ... Anel 1: container query sem interpolação` (exit 1) → revertido → suíte OK
- `container-query-boundary:check` → `⛔ ... Anel 1: container query com boundary` (exit 1) → revertido
- `persistence-doc:check` → `⛔ ... Anel 1: paridade doc × código de persistência` (exit 1) → revertido

**Passo 3** — provado o caso que o Anel 1 sozinho pularia: staged **só** um arquivo novo em `specs/specs/`
(sem tocar `src/`), hook chegou a "Anel 1 PULADO" (contrato) e **bloqueou** no novo bloco "Anel 1 (kit do
mantenedor)" citando `dev-kit do mantenedor`/`R17 · R23 · R29` — exatamente o caso que ficaria verde antes desta
plan. Revertido; `sarak-dev/` regenerado depois para refletir Passos 1/2 reais.

**Passo 4**:
- `npx vitest run` (antes, `vitest_antes.log`): **317 arquivos / 1376 testes, 100% verde**. `Duration 307.47s
  (transform 35.47s, setup 173.79s, import 2253.59s, tests 213.42s, environment 1560.72s)`.
- `npx vitest run` (depois, `vitest_depois_run2.log` — a rodada estável, já com `sanitizeHtml` revertido):
  **317 arquivos / 1376 testes, 100% verde**. `Duration 208.67s (transform 39.48s, setup 161.16s, import
  1113.54s, tests 308.88s, environment 1142.56s)`.
- **Contagem idêntica** (317/1376) — critério não negociável cumprido.
- **Duração total −32%** (307,47s → 208,67s). `import` agregado −50,6% (2253,59s → 1113,54s — a maior
  fatia: menos código de jsdom para carregar). `environment` agregado −26,8% (1560,72s → 1142,56s). `setup`
  −7,3%. `transform` +11,3% (ruído de máquina, faixa pequena). **`tests` subiu** (213,42s → 308,88s, e também
  290,29s numa rodada intermediária) — não tenho explicação mecânica para essa fatia especificamente (é tempo
  de execução do corpo do teste, não de ambiente) e registro isso em vez de esconder: pode ser variância de
  carga da máquina entre as três rodadas de ~200-300s cada. **O que importa operacionalmente — a duração total
  — melhorou de forma consistente nas três rodadas pós-migração** (208,67s / 205,20s / 220,64s, contra 307,47s
  antes).
- `pool: 'forks'` e `execArgv`: `git diff vitest.config.ts` vazio — nenhum dos dois foi tocado.
- Nenhum teste mudou de lógica — só a linha de docblock (`git diff` nos arquivos: 1 linha adicionada, sempre a
  mesma, sempre a 1ª).
- **Teste intermitente (achado 44) — dois novos, capturados e NÃO perseguidos além da rodada seguinte:**
  - `bin/scaffold/checkUpdate/__tests__/runCheckUpdate.test.mjs > runCheckUpdate > instalado == HEAD remoto ->
    upToDate true` — timeout de 5000ms, na 1ª rodada "depois" (`vitest_depois_run1.log`). Este arquivo **não
    teve o ambiente alterado por esta plan** (já era `node` desde antes) — a falha não é efeito da migração.
    Não reproduziu na rodada seguinte (verde).
  - `src/features/DesignEngine/Canvas/components/__tests__/PresetsCatalog.test.tsx > ... troca para o catálogo
    de Typography ao clicar na própria aba` — timeout de 5000ms, na medição "antes" (`coverage_antes.log`,
    HEAD puro via `git stash`, **sem nenhuma alteração desta plan**). Não reproduziu na rodada seguinte
    (verde). Prova que a intermitência do achado 44 é uma característica pré-existente da suíte nesta
    máquina, independente de qualquer coisa que esta plan tenha mudado.
  - As duas saídas completas estão gravadas em arquivo (`vitest_depois_run1.log`, `coverage_antes.log`,
    scratchpad) — procedimento de [[11-testes-e-cobertura]] §3.5 seguido à risca, nunca `tail`/`grep` ao vivo.
- Cobertura (`npx vitest run --coverage`):
  - **Antes** (HEAD puro, via `git stash`): `lines 76,04% · statements 74,27% · functions 66,81% · branches
    62,38%` — piso commitado `71,47%`.
  - **Depois**: `lines 76,04% · statements 74,27% · functions 66,81% · branches 62,43%` — **idêntica em
    lines/statements/functions, branches levemente melhor** (+3 branches cobertos: 3464/5548 vs 3461/5548).
  - `node gates/scripts/release/check-coverage-floor.mjs` → `MELHOROU (nada bloqueado): 71,47% -> 76,04%` —
    **piso NÃO regravado** (decisão explícita da plan, §3.2: melhora "de brinde" não é `--write`).

**Passo 5** — as três classes de commit remedidas (hook completo, `sh .githooks/pre-commit`, cenários isolados
com arquivo descartável ou staged mínimo, todos revertidos depois):

| Classe | Antes (spec 02, envelhecido) | Depois (medido agora, 2026-08-18) |
|---|---|---|
| Só doc/spec fora de qualquer gatilho | 609 ms | **688 ms** |
| Só spec com seção (`specs/specs/`, `sarak-dev/` em dia) | *(não existia como classe própria — caía dentro de "com código" por tabela)* | **14.817 ms** (Anel 2 sem tsc ~11,8s + `dev-kit:check` ~2s + Anel 0) |
| Com código, sem `.ts` staged | 10.042 ms *(número antigo, para o hook inteiro pré-plan-52)* | **20.395 ms** (arquivo único) |
| Com código, com `.ts` staged (`tsc` entra) | — | **33.492 ms** (arquivo único); **31.763 ms** numa rodada com 85 arquivos reais desta plan |

O custo subiu em toda classe que toca o Anel 1/2 — esperado: passo 1 acrescentou 3 gates (~2,4s somados),
passo 3 acrescentou `dev-kit:check` (~2s) à união dos dois gatilhos (inclusive à classe "só spec", que antes
não pagava Anel 1 nenhum). **Escrevo os números mesmo tendo piorado**, como a plan manda.

**Achado novo confirmado** (para [[15-divida-conhecida]] §4.1 — não editado por mim, é achado, não código):
`grep -n "plan-index" .githooks/pre-commit package.json` confirma que `.githooks/pre-commit:44` chama só
`check-plan-index-sync.mjs`, enquanto `npm run plan-index:check` (`package.json:37`) é
`check-plan-index-sync.mjs && generate-plan-index.mjs --check` — o hook não roda a segunda metade (a
comparação do índice **gerado agora** contra o commitado). Confirma exatamente o que a §2.2 desta plan já
media. Não corrigido (fora de escopo, explícito na plan).

### Critérios de aceite

- [x] Os três gates baratos rodam no Anel 1, pelo `anel1()`, com rótulo/regra/comando — provado com vermelho
      deliberado em cada um, revertido.
- [x] `gates:full` roda `check-audit-baseline --with-tsc` e `themes:diversity`, sem remover/reordenar nada;
      `dev-kit:check` continua primeiro — evidência: `node -e "console.log(require('./package.json').scripts['gates:full'])"`.
- [x] `dev-kit:check` bloqueia o commit — provado com defasagem deliberada (revertida) e com o caso que só
      cria/remove arquivo em `specs/specs/` (o que o Anel 1 sozinho pularia).
- [x] Declarado: ponteiro morto no guia passa a barrar commit (§4.2 de [[14-artefatos-do-mantenedor]] —
      antes só afetava `gates:full`/`preversion`; a partir de agora, qualquer commit que toque `src/`,
      `scripts/`, `docs/`, `sarak-ui/`, `bin/`, `package.json`, `.githooks/`, `gates/` OU
      `specs/specs|adr|arquitetura|00-`, `.agents/skills/`, `sarak-dev/`).
- [x] Suíte continua 317 arquivos / 1376 testes, 100% verde — contagem idêntica, três rodadas confirmadas.
- [x] Decomposição do vitest antes/depois escrita por inteiro, com quantos arquivos migraram (75 novos + 15
      pré-existentes = 90) e quantos ficaram em jsdom (36) com o motivo de cada grupo.
- [x] Cobertura medida depois, não abaixo do piso (76,04% vs piso 71,47%). Piso não regravado.
- [x] `pool: 'forks'` e `execArgv` inalterados (`vitest.config.ts` sem diff nenhum).
- [x] Nenhum teste teve lógica alterada — só o docblock de ambiente (1 linha, sempre a mesma).
- [x] Custo das três classes remedido e escrito, inclusive tendo piorado.
- [x] Achado novo confirmado para [[15-divida-conhecida]] §4.1 (metade do `plan-index:check`).
- [x] Nenhum gate novo criado; nenhum gate mudou o que verifica; nada de `.github/`.

### Decisões e suposições

- **Regra citada para os 3 gates do Passo 1** — nenhum dos três tinha um `R<n>` explícito atribuído em
  [[01-gates-e-baseline]] (a tabela já existente lista os dois `container-query*` como `— (plan-NN)`, e
  `persistence-doc:check` não aparecia na tabela nenhuma). Para `container-query:check` e
  `container-query-boundary:check` usei exatamente a forma já documentada (`—`, com o ponteiro de plan). Para
  `persistence-doc:check` usei `R17 — Não transcrever fonte viva`, com base na frase da própria plan-52 (§5,
  Passo 1): "é paridade doc × código, a mesma família do `catalog:check`" — que já cita R17. **Suposição
  registrada**, não descoberta silenciosa: se o revisor achar que merece regra própria, é ajuste de uma linha.
- **Posição do bloco "Anel 1 (kit do mantenedor)"** — coloquei entre o "Anel 1 PULADO" (aviso) e o bloco
  `if [ -n "$TOCA_CODIGO" ]` de contrato, fora dele, porque a função `anel1()` só é definida DENTRO desse
  `if` (limitação do shell script existente) — não dava para reusar o helper sem redefini-lo fora do escopo
  condicional, e a plan pede para não inventar forma nova onde já há molde. Optei por replicar o padrão de
  mensagem do `anel1()` manualmente (mesmo formato de `⛔ COMMIT BLOQUEADO`), em vez de mover a definição da
  função — mudar onde `anel1()` é definida alteraria comportamento de um bloco que não está no escopo desta
  plan.
- **Mecanismo do Passo 4** — docblock por arquivo, não `test.projects`. Justificativa completa na seção "O que
  foi feito" acima; resumindo: já era o padrão vivo em 15 arquivos do repositório, e não exige tocar
  `pool`/`execArgv`/`setupFiles`/`exclude` (Limite 2).
- **Regeneração de `sarak-dev/`** — não estava listada no escopo explícito da plan, mas era consequência
  direta e imediata das mudanças em `package.json`/`.githooks/pre-commit` (ambas dentro do escopo): sem
  regenerar, o **próprio gate que os Passos 1-3 acabaram de tornar bloqueante** impediria o usuário de
  commitar o resto desta entrega. Rodei `npm run dev-kit` (o gerador — nunca editei `sarak-dev/` à mão).

### Achados fora do escopo (não corrigidos)

- **`vitest list --filesOnly` mostra que o Vitest coleta e RODA duas vezes o mesmo arquivo físico** para
  `generate_theme_template.test.ts` e `solve_theme_contrast.test.ts` — uma vez em
  `.agents/skills/ui-criar-tema/scripts/__tests__/` e outra em `.claude/skills/ui-criar-tema/scripts/__tests__/`
  (que é symlink do primeiro, confirmado por `ls -la .claude/skills`). `git diff`/`git ls-files` confirmam que
  o git também rastreia os dois caminhos como blobs separados (não como um único link) — não é só um efeito
  visual do symlink. Isso já estava presente ANTES desta plan (faz parte da contagem "317/1376" que o Passo 4
  proíbe mudar) — não toquei nele. Sugestão: um `exclude` de `.claude/skills/**` no `vitest.config.ts`
  eliminaria a duplicação sem mudar cobertura real, mas isso é edição de `vitest.config.ts` fora do que esta
  plan pediu e mudaria a contagem 317/1376 — plan própria.
- **`gate-limits:check` reporta 33 scripts hoje**, não os "30/30 (medido 2026-08-12)" que [[01-gates-e-baseline]]
  §3 ainda cita — number natural de gates novos entre plans (41/43/45), nada a ver com esta plan; a spec já se
  declara sujeita a envelhecer nesse ponto.

### Pendências / riscos

- A fatia `tests` da decomposição do vitest **subiu** entre antes/depois (213s → ~290-309s) sem explicação
  mecânica clara — registrado, não escondido, na seção de verificações. Duração total melhorou de toda forma.
- Os dois achados de teste intermitente (achado 44) capturados nesta execução têm nome agora (antes não
  tinham) — útil para quem for atualizar [[15-divida-conhecida]] §3.1, mas não fiz essa edição (não é meu
  escopo tocar specs fixas).
- As specs de destino da síntese (`02-enforcement-por-commit`, `01-gates-e-baseline`, `11-testes-e-cobertura`,
  `14-artefatos-do-mantenedor`, `15-divida-conhecida`) **não foram editadas por mim** — a §7.3 do
  [[00-prompt-executor]] proíbe o executor de tocar `specs/specs/`; a síntese é do revisor/`spec-atualizar`,
  depois de aprovada esta plan. Todos os números e decisões que essas specs precisam incorporar estão
  detalhados acima e nos artefatos do scratchpad (logs de `vitest run`, `vitest run --coverage`, listas de
  classificação) para quem for sintetizar.
- Artefatos de medição (logs completos, listas de classificação, scripts de classificação/aplicação) ficaram
  no scratchpad da sessão, não no repositório — não fazem parte do escopo desta plan como código versionado.

---

# 11. Veredito

<!-- Preenchido pelo REVISOR. Append-only. -->

## Veredito — 2026-08-18 — 🟢 **APROVADA**

Tudo abaixo foi **medido por mim no worktree**, não lido do resumo.

### As alegações, contra a minha medição

| Alegação do executor | O que eu medi | |
|---|---|---|
| Suíte 317/1376, 100% verde | `npx vitest run` → **317 passed / 1376 passed**, exit 0 | ✅ |
| Duração −32% (307,47 → 208,67 s) | **315,44 s → 188,59 s = −40,2%**, medição minha nos dois lados | ✅ melhor |
| Nenhuma lógica de teste alterada | `git diff` em todos os `*test.*`: **77 arquivos, 77 inserções, ZERO remoções**, e a única linha é sempre `+// @vitest-environment node` | ✅ |
| 75 arquivos distintos migrados | 77 entradas do git − 2 sombras do symlink `.claude/skills` = **75** | ✅ |
| 90 em `node` (15 pré + 75) | `grep -rl` independente → **90** | ✅ |
| Cobertura idêntica | `lines 76,04% · statements 74,27% · functions 66,81% · branches 62,43% (3464/5548)` — bate **até no numerador de branches** | ✅ |
| Piso não regravado | `git diff gates/baselines/` **vazio**; gate imprime `MELHOROU (nada bloqueado)` | ✅ |
| `vitest.config.ts`, `pool`, `execArgv` intocados | `git diff vitest.config.ts` **vazio** | ✅ |
| `gates:full` sem remover/reordenar | diff de **uma linha**, puro append | ✅ |
| Os 3 gates no Anel 1 pelo `anel1()` | lido no diff, mesmo molde dos seis anteriores | ✅ |
| Nenhuma spec fixa tocada | `git status specs/specs specs/arquitetura specs/adr` **vazio** | ✅ |
| Gates | **17 de 17 verdes** | ✅ |

### A prova que eu reproduzi sozinho

O caso que dava razão de existir ao Passo 3 — commit que **só** cria arquivo em `specs/specs/`:

```
[Sarak] Anel 1 PULADO — o commit só toca doc/spec (nenhum gate de contrato de código a rodar).
[Sarak] Anel 1 (kit do mantenedor) — sarak-dev/ em dia...
⛔ COMMIT BLOQUEADO — Anel 1: kit do mantenedor          (exit 1)
```

As duas linhas juntas **são** o veredito do passo: o Anel 1 de contrato pula, e o kit barra assim mesmo. O
posicionamento do bloco — fora do `if TOCA_CODIGO`, depois do `exit 0` — está certo pelo motivo certo:
chegar ali já prova que a união dos gatilhos disparou, sem duplicar checagem.

### O defeito desta rodada é **meu**, não da entrega

A plan mandava o executor **criar e editar spec fixa** (§3.1 e §5 passo 5). A §7.3 do
[[00-prompt-executor]] proíbe isso em termos absolutos. O executor **identificou o conflito, obedeceu à
proibição e deixou todo o material no §10** — que é exatamente o comportamento correto, e o oposto de
cumprir a plan ao pé da letra contra a regra da casa.

Corrigi a `plan-52` (com marcador `🔧`, datado) **e a `plan-05`, que carregava o mesmo defeito antes de ser
executada** — lá ele teria custado mais caro: o entregável central era *"criar a spec 16"*.

### Duas contribuições que passaram do pedido

**A intermitência do achado 44 ganhou nome — dois.** E o mais valioso: `PresetsCatalog.test.tsx` falhou na
medição **"antes", em HEAD puro via `git stash`**, sem nenhuma alteração da plan. É a primeira evidência
direta de que a intermitência é **pré-existente e independente da migração**. Saídas completas gravadas em
arquivo, sem perseguição além da rodada seguinte — procedimento da [[11-testes-e-cobertura]] §3.5 seguido.

**A duplicação de coleta.** Confirmei por conta própria: o git rastreia **16 arquivos regulares** sob
`.claude/skills` (`mode 100644`, **nenhuma entrada `120000`**), enquanto o worktree tem um symlink ali. Nesta
máquina os dois caminhos são o mesmo inode; **num clone limpo viram duas cópias independentes**, que o Vitest
roda duas vezes e que podem divergir em silêncio.

### Julgamentos sobre as decisões registradas

- **`sarak-dev/` regenerado sem estar no escopo explícito — correto.** Sem isso, o próprio gate que os passos
  1–3 tornaram bloqueante impediria o dono de commitar a entrega. Foi rodado o gerador, nunca edição à mão.
- **`R17` para o `persistence-doc:check` — aceito.** É paridade doc × código, a mesma família do
  `catalog:check`, que já usa R17.
- **Não reusar o `anel1()` no bloco do kit — correto.** O helper só existe dentro do `if TOCA_CODIGO`; movê-lo
  alteraria um bloco fora do escopo.
- **A fatia `tests` que subiu.** A minha medição dá **244 → 264 s (+8%)**, contra os +45% do executor. A
  diferença entre as duas amostras é maior que o efeito — **é variância de máquina**, e a pergunta em aberto
  no resumo pode ser fechada assim.

### Pendências herdadas — todas do revisor, nenhuma bloqueia

1. Síntese das cinco specs fixas de `destino_sintese` (o material está no §10).
2. Achado novo: `plan-index:check` roda pela metade no hook.
3. Achado novo: duplicação de coleta por `.claude/skills`.
4. Achado **44** ganha os dois nomes e a evidência de pré-existência.
5. [[01-gates-e-baseline]] §3 diz "30 scripts"; `gate-limits` reporta **33** — prosa envelhecida.
6. O custo de commit subiu em toda classe que toca os anéis (só-spec passa a pagar **14,8 s**, antes zero).
   **Escrito porque piorou**, e é a consequência aceita de fechar o vão.
