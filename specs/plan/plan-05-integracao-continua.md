---
tipo: "plan"
titulo: "Montar o pipeline — a CI remota, e o fluxo de trabalho que ela passa a governar"
dominio: "Sarak-Lib-UI-Core / Qualidade / Automação"
status: "🟡 Em execução"
prioridade: "Alta"
tags: ["plan", "ci", "gates", "automacao", "fluxo"]
relacionados: ["[[01-gates-e-baseline]]", "[[02-enforcement-por-commit]]", "[[03-versionamento-e-release]]", "[[11-testes-e-cobertura]]", "[[15-divida-conhecida]]"]
depende_de: "plan-52"
destino_sintese: "specs/specs/16-integracao-continua.md · specs/specs/02-enforcement-por-commit.md · specs/specs/01-gates-e-baseline.md · specs/specs/03-versionamento-e-release.md · specs/specs/15-divida-conhecida.md"
objetivo: "Montar o pipeline remoto e documentar o fluxo inteiro: que evento dispara o quê, em que branch, e o que continua sendo decisão humana"
---

# 1. Objetivo

Um PR com teste quebrado é reprovado **pela automação**, não pela memória de alguém — e a suíte roda num
`$HOME` que não é o do dono.

# 2. Contexto

**Duas vezes** um "verde" foi falso por causa da máquina, e nenhum gate local pegou — por definição, o ambiente
local é o problema:

- um `package-lock.json` solto no `$HOME` derrubava um teste de detecção de gerenciador;
- um `node_modules/` não versionado fazia 6 arquivos de um projeto alheio passarem por um gate de conteúdo.

Some-se o escape invisível: **quem usa `--no-verify` não é cobrado por ninguém**. E `.github/` **não existe**
neste repositório.

Achado **26** entra aqui porque a CI é o único lugar onde cabe: **nenhum teste automatizado exercita um
`install` de verdade.** As provas de npm/pnpm/yarn foram feitas à mão, uma vez. O `check --notify` no `predev`
é o comando que mais executa na vida do importador e o menos coberto.

## 2.1 O estado medido em 2026-08-18 — **antes** da `plan-52`

⚠️ **Estes números são do commit que abriu a `plan-52`, e ela mexe justamente na suíte.** Eles servem de
**referência histórica**, não de alvo. **Remeça tudo depois que a `plan-52` fechar** — é o número de lá que vai
para a spec 16.

| Medida | Valor em 2026-08-18 |
|---|---|
| Os 15 gates de contrato (`*:check`) | todos verdes |
| Anel 2 — `check-audit-baseline.mjs --with-tsc` | `igual ao baseline de 2026-08-11 — nenhuma regressão` |
| Suíte completa (`npx vitest run`) | **317 arquivos / 1376 testes — 100% verde**, em **315,44 s** |
| Remoto | `origin/main` = `1e67c58`, tag **`v6.1.0`**, worktree limpo |
| Visibilidade do repositório | **público** (`api.github.com` responde 200 sem token) |
| `gh` CLI | **não instalado** na máquina do dono |
| `develop` | **423 commits atrás da `main`, 0 à frente** — um fóssil, não uma branch de trabalho |

## 2.2 A intermitência (achado 44) é entrada de projeto, não detalhe

A suíte **não foi provada determinística**. Duas falhas observadas (2026-08-13 e 2026-08-14), mesma assinatura
— 1 arquivo, 2 testes —, e **46 execuções controladas não reproduziram**, em duas bases distintas (tetos de
**11,5%** e **15,0%**). O defeito segue **sem nome**.

Um pipeline que roda a suíte inteira vai ficar vermelho por nada de vez em quando. **A decisão é não mascarar**
(§5 Etapa A, item 4) — `retries` some com o ruído e destrói a evidência que o achado 44 precisa.

## 2.3 Se o repositório fechar

Ele é público hoje, e o pipeline foi desenhado em cima disso: nenhum segredo, e o teste de `install` clona sem
credencial. **Se o dono fechar o repositório, as provas de `install` precisam de um token** — o `GITHUB_TOKEN`
automático não atravessa para outro repositório. Não implemente isso preventivamente; **pergunte** se a
premissa mudou.

# 3. Escopo

## 3.1 Dentro
- `.github/workflows/` — **criar**
- `.githooks/pre-commit` — **acrescentar `.github/` ao `TOCA_CODIGO`**, e **só isso** (§5 Etapa A, item 6)
- `package-lock.json` — **só na rodada de correção 1** (§11), e só para o que o `npm ci` do runner exige
- O **§10 desta plan** — todo o material que as specs fixas vão precisar (§5 Etapa A, item 10)

> 🔧 **`package-lock.json` entrou em 2026-08-19, por decisão do dono** (*"vamos corrigir e não contornar"*),
> depois de o primeiro run real da CI reprovar no `npm ci`. Não é ampliação oportunista: sem isto a CI **nunca**
> fica verde, e a §5 item 9 desta plan já mandava, por escrito, expor em vez de contornar o que só um ambiente
> limpo revela. O detalhe e os limites estão no **Achado 1** da §11.

> 🔧 **Corrigido em 2026-08-18 pelo revisor.** Esta lista mandava o executor **criar e editar spec fixa**
> (`16`, `02`, `01`, `03`) — e a §7.3 do [[00-prompt-executor]] proíbe isso em termos absolutos: *"NUNCA crie
> nem edite outra spec. `specs/` … são do revisor."* Era **defeito da plan**, não do executor: pedia uma ação
> que ele é categoricamente impedido de tomar, e um critério de aceite assim nunca poderia ser marcado. O
> trabalho não sumiu — **mudou de dono e de momento**: o executor deixa tudo escrito no §10, e a spec 16
> nasce na síntese (`/spec-atualizar`), que é do revisor. É o que o campo `destino_sintese` já dizia.

## 3.2 Fora
- ⛔ **Tudo que é da `plan-52`**: o `dev-kit:check` e os gates órfãos no `pre-commit`, o `gates:full`, o
  `vitest.config.ts`. Se algo daquilo não estiver fechado, **esta plan não começa** — é o `depende_de`.
- ⛔ Alterar o **comportamento** de qualquer gate. Acrescentar **onde** um gate roda não é alterar o que ele
  cobra; mudar o que ele verifica continua proibido.
- ⛔ Qualquer outra mudança em `.githooks/` além do `TOCA_CODIGO`. Os anéis permanecem como estão.
- ⛔ **Criar gate novo.** Em particular: a CI **não** confere se o `dist/` commitado bate com um build limpo.
  É tentador — e é um gate que não existe. Vira achado na [[15-divida-conhecida]], não código aqui.
- ⛔ **Criar ou editar qualquer spec fixa** (`specs/specs/`, `arquitetura/`, `adr/`, `00-*`). Proibição
  absoluta do executor ([[00-prompt-executor]] §7.3). O que a spec 16 precisa, você **escreve no §10**.
- ⛔ **Automatizar o release.** O CD existe e é manual **por decisão** (§5 Etapa A, item 5).
- ⛔ Declarar `engines` no `package.json`. Fixar o Node **da CI** não é publicar contrato de Node **para o
  consumidor** — se isso deve existir, é plan própria.
- ⛔ Recriar a `develop` ou ligar proteção de branch. **São ações do dono** (§5 HITL), fora do worktree.
- E2E: foi removido em 2026-08-18, e reinstalá-lo **não** é escopo desta plan. O achado **45** diz que ele
  *"depende da plan-05"* no sentido de *existir onde rodar* — não no de esta plan o trazer de volta.

> 🔧 **A linha vermelha `⛔ .githooks/` caiu uma vez, e está registrada.** O `.github/` entra no
> `TOCA_CODIGO` (§5 Etapa A, item 6) por **decisão do revisor em 2026-08-18, reversível**: o arquivo que
> comanda o pipeline seria a única peça executável do repositório que nenhum anel enxerga. *(A entrada do
> `dev-kit:check` no `pre-commit`, decidida pelo dono na mesma data, **migrou para a `plan-52`** quando o dono
> pediu uma plan de adequação anterior ao pipeline — é o mesmo trabalho, na plan que vem antes.)*

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Plan | `specs/plan/plan-52-correcao-pre-ci-cd.md` | a base que esta plan herda; leia o §10 dela antes de estimar tempo |
| Spec fixa | `specs/specs/01-gates-e-baseline.md` | o baseline versionado e o que cada gate garante |
| Spec fixa | `specs/specs/02-enforcement-por-commit.md` | os anéis locais que a CI complementa — e os que perdem gatilho |
| Spec fixa | `specs/specs/03-versionamento-e-release.md` | o ritual de release que o modelo de branches passa a cercar |
| Spec fixa | `specs/specs/11-testes-e-cobertura.md` §3.5 | o procedimento de captura que o passo da suíte implementa |
| Spec fixa | `specs/specs/13-instalacao-e-atualizacao.md` | o que o teste de `install` precisa provar |
| Código | `.githooks/pre-commit` · `pre-push` · `gates/scripts/release/check-release-tag.mjs` | o que já roda, e o que deixa de rodar |

# 5. Instruções de execução

> **A plan tem duas etapas, e a fronteira é de autoridade, não de dificuldade.** A **Etapa A** é local: o
> executor escreve e prova o que dá para provar sem servidor. A **Etapa B** termina num servidor, e **só o
> dono empurra**. Escrever "a CI está pronta" sem uma execução remota de verdade é reproduzir exatamente o
> verde falso que a remoção do E2E acabou de arrancar da base.

## O modelo de branches *(decisão do dono, 2026-08-18)*

```
feature/xyz  ──PR──►  develop  ──PR──►  main  ──npm version──►  tag v6.2.0
```

| Branch | Papel | Quem escreve |
|---|---|---|
| `main` | **produção / código final.** O dono não desenvolve mais nela | só merge de PR — **e o push do release**, pelo dono |
| `develop` | **desenvolvimento.** É onde o trabalho do dia acontece | commit direto e push |

⚠️ **`develop` precisa nascer de novo**: medida em 423 commits atrás da `main`, 0 à frente. É ação do dono
(§5 HITL), não do executor.

⚠️ **O consumidor nunca lê branch nenhuma.** Ele instala por `#semver:`, que o `npm` resolve contra **tags**.
O modelo de branches é disciplina de trabalho — **produção, para quem instala, é a tag**. Escreva isso na
spec 16: é a frase que impede a confusão de achar que dar merge na `main` publica alguma coisa.

## Etapa A — local. O workflow, e a linha do hook

### 1. O job de gates — fixo, e o motivo de cada item

| Item | Valor | Por quê |
|---|---|---|
| `runs-on` | `ubuntu-latest` | Windows custa **×2** e macOS **×10** em minuto de runner. E não há nada de plataforma a testar: medido, **zero** ocorrências de `process.platform`, `win32` ou caminho de unidade em `src/`, `scripts/`, `gates/`, `bin/` |
| Node | **24**, versão única, sem matriz | é o do dono (24.10.0). Matriz multiplica minuto **e** multiplica a exposição à intermitência da §2.2 |
| Cache | `cache: npm` no `setup-node` | `npm ci` sem cache é o passo mais caro e mais bobo |
| Instalação | `npm ci` (nunca `npm install`) | `ci` respeita o lockfile e falha se ele divergir — é metade do "ambiente determinístico" que a §9 da [[02-enforcement-por-commit]] promete |
| `concurrency` | por workflow + ref, `cancel-in-progress` | push em sequência não deve empilhar run que já nasceu obsoleto |

**⚠️ Na CI não existe "escopo por staged".** Toda a lógica de *"o commit não tocou `src/`, então pula o Anel 1"*
existe porque o desenvolvedor paga o tempo ([[02-enforcement-por-commit]] §3). No runner, **tudo roda sempre**
— o job é a **união** dos anéis, sem condição nenhuma.

### 2. A tabela de gatilhos — o coração desta plan

| Evento | O que roda | Pergunta que responde |
|---|---|---|
| push em `feature/*` | **nada** | você ainda está trabalhando; o `pre-commit` já cobriu |
| push em **`develop`** | **gates** completo | *"o que acabei de empurrar está bom?"* — é o trabalho do dia, e a maior parte dele não passa por PR |
| **PR `develop` → `main`** | **gates** + **install pelo `sha`** | *"isto pode ir para produção?"* |
| push em **`main`** (merge aceito) | **gates** + **a tag devida** (item 3) | *"o resultado de juntar está bom?"* — pergunta diferente da anterior, e já quebrou projeto de gente boa |
| **tag `v*` empurrada** | **install por `#semver:`**, nos 3 gerenciadores | *"o que acabei de publicar realmente instala?"* — só pode rodar aqui: antes da tag não existe o que instalar |

### 3. O anel de release perde o gatilho, e a CI precisa absorvê-lo

**Achado do revisor, e ele é a consequência mais séria do modelo novo.** O `pre-push` só age quando o destino
é `refs/heads/main`:

```sh
LINHA_MAIN=$(... awk '$3 == "refs/heads/main" ...')
if [ -z "$LINHA_MAIN" ]; then echo "Anel 3 PULADO"; exit 0; fi
```

**Quando o merge acontece pelo botão do GitHub, nenhum hook local roda.** Os dois anéis somem desse caminho:

| Anel | Fica coberto? |
|---|---|
| **Anel 3** — suíte completa | ✅ **sim** — a CI a roda no PR, *antes* do merge. A rede muda de lugar, e para um lugar melhor |
| **Anel de release** — *"o artefato mudou e não há tag"* | ❌ **não** — e o buraco é real: medido, `dist/` e `sarak-ui/` mudam em **commit normal**, não só no release (`6167361`, `96552dc`, `db82131`…) |

Sem isso, um PR que altere o artefato publicado entra na `main` pelo botão, **sem tag, e ninguém reclama** —
que é o incidente do ADR-007 de novo. **Rode a mesma verificação no evento `push` da `main`.** Não é gate
novo: é o mesmo gate num lugar novo. ⚠️ `check-release-tag.mjs` lê o **stdin no formato de hook do git**
(`<ref local> <sha local> <ref remota> <sha remoto>`) — **verifique como alimentá-lo de dentro de um job**, e
se não houver caminho honesto, **declare o vão em vez de fingir cobertura**.

### 4. A suíte — sem retry, com o log inteiro guardado

`retries` **não entra**, e a razão está na §2.2: mascarar a intermitência destrói a única evidência que o
achado **44** ainda pode colher. **Guarde a saída completa como artifact do run** (`actions/upload-artifact`),
inclusive — e principalmente — quando o job passa.

Isto é o procedimento de captura de [[11-testes-e-cobertura]] §3.5 virando automação: *"grave a saída inteira
em arquivo, nunca `tail`/`grep` ao vivo"*. Cada execução vira uma amostra grátis na caça ao defeito sem nome,
em vez de custar 5 minutos da máquina do dono.

### 5. O que o job roda — e **prove** a lista, não a presuma

Ponto de partida, porque já existe e não deve ser reescrito em YAML:

```
npm ci
npm run gates:full     # depois da plan-52 ele já inclui audit:baseline --with-tsc e themes:diversity
```

**Reenumerar comandos no YAML é a próxima prosa a envelhecer**: é exatamente a classe de defeito que a
[[15-divida-conhecida]] §3.3 registra como a mais reincidente desta base.

⚠️ **Mas confirme o alcance você mesmo.** A `plan-52` mudou o que o `gates:full` cobre; o levantamento do
revisor é de **antes** dela. **Enumere todos os `*:check` do `package.json` e prove, um a um**, quais o
`gates:full` já alcança. Os que sobrarem entram explicitamente no job — e o `plan-index:check` é candidato
conhecido: o `pre-commit` roda só **metade** dele (achado aberto pela `plan-52`), e a CI é quem cobre a outra.

Gate que ninguém percebeu que ficou de fora é um buraco que só aparece no dia em que ele reprovaria.

### 6. `.github/` entra no `TOCA_CODIGO`

Medido: o regex casa `src/ scripts/ docs/ sarak-ui/ bin/ package.json .githooks/ gates/`, e **`.github/` não
está lá**. Um commit que só mexe no workflow pularia os Anéis 1 e 2 inteiros — a peça que valida todo o resto
seria a única sem validação nenhuma.

Não é ampliação de escopo de gate: é manter verdadeira a regra que a [[02-enforcement-por-commit]] §3 já
enuncia (*"o commit mexe no código da lib ou nos artefatos gerados a partir dele"*). `.github/workflows/*.yml`
é **configuração executável** — parente direto de `.githooks/`, que já está na lista. Acrescente **junto da
justificativa por escrito no próprio hook**, como as outras linhas de lá fazem.

### 7. O teste de `install` real (achado 26) — **duas** provas, não uma

Matriz **npm/pnpm/yarn**. E a ref importa, porque as duas respondem perguntas diferentes:

| Prova | Instala de | Roda em | O que ela pega |
|---|---|---|---|
| **do PR** | o `sha` do próprio commit | PR → `main` | regressão introduzida pela mudança em revisão |
| **do consumidor** | `#semver:` contra a **tag** | evento de **tag** | o caminho que o importador de verdade percorre |

Só a segunda seria testar o passado: instalar da última tag **nunca reprova um PR**. Só a primeira deixaria o
caminho real do consumidor sem cobertura nenhuma.

Prove também que o `sarak-ui check --notify` dispara. ⚠️ **Regra herdada: comando não executado de verdade não
entra.** O que não rodar na CI não é declarado como coberto.

### 8. O que a CI **não** vai cobrir — e o Anel 0 é o primeiro da lista

Achado do revisor, e ele impede um passo que pareceria funcionar: **`verificar_commit.py` lê
`git diff --cached`** (linhas 94–95) e **não tem modo de varrer a árvore**. No runner **não há nada em
staging** — o scanner varreria um diff vazio e passaria **sempre**, em silêncio.

**Não leve o Anel 0 para a CI.** Um passo verde que não olha nada é pior que passo ausente: ninguém desconfia
dele. Ensinar o scanner a receber uma faixa (`origin/main...HEAD`) é **alterar comportamento de gate** — a
§3.2 proíbe aqui. Registre como achado novo na [[15-divida-conhecida]] §4.1 e **declare o vão na spec 16**.

Declare também, na spec 16:
- a suíte roda em jsdom — a CI **não** mede browser ([[11-testes-e-cobertura]] §7.2);
- a CI **não** confere `dist/` commitado contra build limpo (§3.2);
- **o `pre-push` deixa de rodar no dia a dia** — só age para `main`, e o dono passa a empurrar `develop`. Não
  é perda: a rede mudou de lugar (item 3). Mas é **mudança de comportamento**, e some sem avisar se ninguém
  escrever.

### 9. Isolamento

A CI **não** pode depender de nada do `$HOME` do desenvolvedor. Se um teste hoje passa por causa do ambiente
local, ele vai falhar aqui — **isso é a feature, não um problema a contornar**. Falhou algo que passa na
máquina do dono? Registre o que era, e não conserte contornando: é literalmente o defeito que esta plan existe
para expor.

### 10. As specs

⚠️ **Você NÃO escreve spec fixa** ([[00-prompt-executor]] §7.3). Você escreve **no §10 desta plan** o
material abaixo, completo e conferido — a spec 16 nasce dele, na síntese, pela mão do revisor.

**O material para `specs/specs/16-integracao-continua.md`** — a leitura única do fluxo, em quatro seções:

| Seção | Conteúdo | Regra |
|---|---|---|
| **§1 Modelo de branches** | `main` = produção · `develop` = desenvolvimento · quem escreve em quê · a proteção com exceção · *"o consumidor lê a tag, não a branch"* | 🆕 conteúdo novo — **não existe em nenhuma spec hoje** (verificado) |
| **§2 Tabela de gatilhos** | evento → o que roda → onde → quanto custa. Do commit até a tag, numa página | 🆕 |
| **§3 A CI** | jobs, custo **real medido**, e o que ela **não** cobre (item 8) | 🆕 |
| **§4 Quem detalha cada peça** | ponteiros para `02` (hooks), `03` (release), `01` (gates) | 🔗 **ponteiro, nunca cópia** |

> ⛔ **A §4 não redescreve as outras specs.** Uma quarta descrição dos mesmos fatos diverge das três primeiras
> — não é hipótese: a [[15-divida-conhecida]] §3.3 registra `arquitetura/04` errando o mesmo total três vezes
> seguidas, e a lição escrita lá é *"prosa afirma a relação; cifra fica em fonte gerada"*.

**E o que muda nas specs já existentes** — também no §10, uma linha por spec, com o texto proposto:
`02-enforcement-por-commit.md` (a §9 deixa de ser "opção em aberto"; e o `pre-push` ganha a nota do item 8) ·
`01-gates-e-baseline.md` (onde cada gate roda) · `03-versionamento-e-release.md` (o release passa a acontecer
sob o modelo de branches, e o push dele exige a exceção de administrador).

> **O CD já existe e continua manual, por decisão.** Esta lib não vai a registry: o consumidor instala por
> `#semver:` contra tag, então "publicar" aqui **é** emitir a tag, e isso já é o `npm version` +
> `postversion`. Automatizar o bump exigiria um robô decidindo `minor` × `major` a partir do diff —
> julgamento que, medido em 2026-08-18, exigiu comparar porta pública, contar 83 componentes e 273 exports, e
> verificar que nada do removido chegava ao consumidor. **Não automatize o release nesta plan.**

## Etapa B — remota. Só o dono empurra

O executor **escreve** o workflow e **para**. Então, nesta ordem:

1. Entrega o resumo (§10) com o YAML pronto e a Etapa A fechada.
2. **O dono** recria a `develop` a partir da `main`, empurra a branch do workflow e abre o PR.
3. **O dono** liga a proteção da `main` — *required status check* —, e o check só aparece na lista **depois**
   do primeiro run. ⚠️ **Com exceção para administrador**: sem ela, o `postversion` (`git push
   --follow-tags`) é recusado e o `npm version` para de funcionar no fim de um ritual de 5 minutos.
4. O executor **lê o resultado real** (aba *Actions* — o `gh` **não está instalado**, e instalá-lo não é
   escopo) e escreve no §10: duração de cada job, minutos consumidos, e o que reprovou.
5. Só então a Etapa B tem critérios de aceite marcáveis.

# 6. Prompt de execução

```
Leia specs/00-prompt-executor.md e execute specs/plan/plan-05-integracao-continua.md.

PRE-REQUISITO: a plan-52 precisa estar 🟢 Aprovada. Ela adequa gates e suite, e
esta plan HERDA o resultado. Leia o §10 dela ANTES de estimar qualquer tempo — os
numeros da §2.1 desta plan sao ANTERIORES a ela.

Contexto obrigatorio: specs/00-contexto.md, specs/00-knowledge.md,
specs/specs/01-gates-e-baseline.md, specs/specs/02-enforcement-por-commit.md,
specs/specs/03-versionamento-e-release.md, specs/specs/11-testes-e-cobertura.md,
specs/specs/13-instalacao-e-atualizacao.md.

DUAS ETAPAS, e a fronteira e de AUTORIDADE. Etapa A e local: voce escreve o YAML e
a linha do hook. Etapa B termina num servidor e SO O DONO EMPURRA. Voce escreve,
para, e espera. Workflow que nunca executou NAO pode ser declarado pronto — o
verde falso do E2E foi arrancado desta base exatamente por isso.

MODELO DE BRANCHES (decisao do dono): main = producao (o dono nao desenvolve
nela), develop = desenvolvimento. O CONSUMIDOR NAO LE BRANCH: ele instala por
#semver:, que resolve contra TAGS. Escreva isso na spec 16.

GATILHOS: push feature/* = nada. push develop = gates. PR develop->main = gates +
install pelo sha. push main = gates + a tag devida. tag v* = install por #semver:
nos 3 gerenciadores.

ACHADO CRITICO — o anel de release PERDE O GATILHO. O pre-push so age para
refs/heads/main, e o merge pelo botao do GitHub nao roda hook nenhum. Medido:
dist/ e sarak-ui/ mudam em COMMIT NORMAL, nao so no release. Rode a mesma
verificacao no evento push da main. check-release-tag.mjs le stdin no formato de
hook do git — VERIFIQUE como alimenta-lo num job, e se nao houver caminho honesto
DECLARE O VAO em vez de fingir cobertura.

ubuntu-latest, Node 24 unico (sem matriz), cache npm, npm ci, concurrency com
cancel-in-progress. Monte sobre "npm run gates:full"; NAO reenumere comandos em
YAML. ENUMERE os *:check e PROVE um a um quais ja sao alcancados — o levantamento
do revisor e anterior a plan-52 e nao vale como evidencia. SEM retries na suite, e
guarde a saida inteira como artifact SEMPRE, inclusive no verde (achado 44).
.github/ entra no TOCA_CODIGO do pre-commit, com justificativa escrita no hook —
e SO isso de .githooks/. NAO leve o Anel 0 para a CI: verificar_commit.py le
"git diff --cached" e no runner nao ha staging — passaria vazio, sempre.

VOCE NAO ESCREVE SPEC FIXA — proibicao absoluta da §7.3 do prompt-executor. O
material da spec 16 vai NO §10 DESTA PLAN, em 4 secoes: §1 branches, §2 gatilhos,
§3 a CI, §4 PONTEIROS para 02/03/01 (a §4 NAO redescreve as outras specs). Idem o
que a CI nao cobre — incluindo que o pre-push deixa de rodar no dia a dia — e o
texto proposto para 02 §9, 01 e 03. A spec 16 nasce na sintese, pelo revisor.

Voce NAO faz nada da plan-52 (dev-kit:check, gates orfaos, gates:full,
vitest.config). Voce NAO cria gate novo (dist/ x build limpo NAO se confere aqui).
Voce NAO automatiza o release. NAO declara engines. NAO reinstala E2E. NAO recria
a develop nem liga protecao de branch — sao acoes do dono.
Comando que voce nao executou de verdade nao entra no workflow nem e declarado
como coberto.
Nao saia do escopo. Nao commite. Ao terminar a Etapa A, escreva o resumo na
propria plan e ESPERE o dono empurrar. So depois mova o status para 🟠 Em revisao.
```

# 7. Critérios de aceite

## 7.1 Etapa A — o executor fecha sozinho

- [ ] Workflow escrito, com os **cinco** gatilhos da tabela do §5 item 2 — nenhum a mais, nenhum a menos.
- [ ] `.github/` entra no `TOCA_CODIGO` **com justificativa escrita no próprio hook**, e provado: um commit
      que só toca `.github/` deixa de pular os anéis.
- [ ] Todos os `*:check` do `package.json` **enumerados um a um**, com a prova de quais o `gates:full` (já
      alterado pela `plan-52`) alcança; os descobertos entraram no job explicitamente.
- [ ] Suíte **sem `retries`** e **sem `continue-on-error`**; saída completa guardada como artifact
      **inclusive no verde**.
- [ ] O anel de release tem resposta escrita: **ou** roda no evento `push` da `main`, **ou** o vão está
      declarado com o motivo técnico medido.
- [ ] Nenhum arquivo da `plan-52` foi tocado (`vitest.config.ts`, `gates:full`, gates órfãos).
- [ ] **(correção 1, §11)** `npx npm@11.17.0 ci --dry-run` **e** `npm ci --dry-run` passam **os dois**; o diff
      do `package-lock.json` está relatado por inteiro; **nenhum** arquivo de `.github/` alterado para isso.

## 7.2 Etapa B — exige o dono ter empurrado

- [ ] Workflow **executado com sucesso ao menos uma vez** no remoto (não basta escrever o YAML).
- [ ] Um PR com teste quebrado é **reprovado pela automação** — provado com um teste quebrado de propósito,
      **revertido** depois.
- [ ] `run_audit` na CI comparado ao baseline versionado; **não** a zero.
- [ ] `install` real coberto para os 3 gerenciadores, **nas duas provas** (sha do PR e `#semver:` na tag),
      cada uma efetivamente executada.
- [ ] **Duração real** de cada job registrada, e comparada com a medição pós-`plan-52` — nunca com os
      315,44 s da §2.1, que são anteriores.
- [ ] **No §10**, o material das **quatro** seções da spec 16, pronto para transporte — inclusive a §4 como
      **ponteiros**, nunca como redescrição de `02`/`03`/`01`.
- [ ] **No §10**, o que a CI **não** cobre: Anel 0 (com o motivo medido), browser, `dist/` × build limpo, e
      que o `pre-push` deixou de rodar no dia a dia.
- [ ] **No §10**, o achado novo para a [[15-divida-conhecida]] §4.1 (scanner de segredo sem modo de faixa) e
      o texto proposto para `02` §9, `01` e `03`.
- [ ] **Nenhuma spec fixa foi tocada** — `git status` limpo em `specs/specs/`, `arquitetura/`, `adr/`.
- [ ] Nenhum gate existente teve comportamento alterado; nenhum gate novo criado.

# 8. Como verificar

```bash
# ---- Etapa A ----
grep -c "github/" .githooks/pre-commit          # era 0; tem de ser > 0
#   staged SO com .github/workflows/*.yml -> tem de RODAR os aneis
#   (antes imprimia "PULADOS"); depois desfazer

git diff --stat vitest.config.ts package.json   # tem de sair VAZIO (e da plan-52)

# ---- Etapa B ----
# aba Actions do GitHub (o "gh" NAO esta instalado nesta maquina):
#   -> um run verde, e o run com o teste quebrado VERMELHO
#   -> o artifact com a saida da suite baixavel, tambem no run verde
#   -> um run disparado pela TAG, com as 3 provas de install
npm run audit                                    # local: baseline INALTERADO
```

- `git diff --stat` → `.github/`, `.githooks/pre-commit`, `specs/` — **nenhum** `src/`, `scripts/`, `gates/`
- Ler o workflow: cada comando declarado existe em `package.json`
- Ler a spec 16 §4: só ponteiros. **Zero** parágrafos que redescrevam `02`, `03` ou `01`

# 9. Destino da síntese

**Destino:** `specs/specs/16-integracao-continua.md` (novo) · `specs/specs/02-enforcement-por-commit.md` ·
`specs/specs/01-gates-e-baseline.md` · `specs/specs/03-versionamento-e-release.md` ·
`specs/specs/15-divida-conhecida.md`

- **`16-integracao-continua.md`** — nasce completa nesta plan; a síntese só confirma que os números escritos
  são os do run real, não os da estimativa.
- **`02-enforcement-por-commit.md`** — a §9 (*"opção em aberto"*) morre com a CI; e o `pre-push` ganha a nota
  de que deixou de rodar no dia a dia, com a rede que passou a cobri-lo.
- **`03-versionamento-e-release.md`** — o release passa a acontecer sob o modelo de branches, e o push dele
  depende da exceção de administrador na `main`.
- **`15-divida-conhecida.md`** — o achado **26** fecha (§6) se as duas provas de `install` rodarem de verdade;
  o achado **45** (E2E) ganha a nota de que o lugar onde rodar passou a existir, **sem** ser reaberto aqui; e
  entra o **achado novo** do Anel 0 sem modo de faixa (§4.1).

---

# 10. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only. -->

## Resumo da execução — 2026-08-18

**Resultado:** Concluído com pendências — **Etapa A fechada**; **Etapa B aguarda o dono** (§5, autoridade
exclusiva dele: empurrar a branch, abrir o PR, ligar a proteção da `main`). Nenhum critério de §7.2 pode ser
marcado nesta rodada — todos exigem execução remota real, que não aconteceu.

### O que foi feito (Etapa A)

**Dois workflows novos**, `.github/workflows/gates.yml` e `.github/workflows/install-tag.yml`, cobrindo as
**cinco** linhas da tabela de gatilhos (§5 item 2) sem nenhuma a mais:

| Evento | Arquivo · job | O que roda |
|---|---|---|
| push `feature/*` | *(nenhum trigger corresponde)* | nada — por omissão, não por `if` negativo |
| push `develop` | `gates.yml` → job `gates` | `gates:full` + os 5 `*:check` órfãos |
| PR `develop→main` | `gates.yml` → jobs `gates` + `install-sha` | idem + install pelo SHA, 3 gerenciadores |
| push `main` (merge aceito) | `gates.yml` → jobs `gates` + `release-tag` | idem + `check-release-tag.mjs` sobre o HEAD |
| tag `v*` empurrada | `install-tag.yml` → job `install-semver` | install por `#semver:`, 3 gerenciadores |

**A enumeração dos `*:check`** (§5 item 5), feita lendo `package.json` e seguindo cada cadeia até a raiz —
não presumida do levantamento pré-`plan-52`:

| Script | Alcançado por `gates:full`? | Como |
|---|---|---|
| `token-types:check` · `catalog:check` · `barrel:check` · `zero-brand:check` · `guide:check` · `deep-import:check` · `public-types:check` | ✅ | via `npm run build` |
| `build-info:check` · `package:check` · `coverage:check` | ✅ | diretos na cadeia |
| `dev-kit:check` | ✅ | direto, primeiro |
| `composicao-atomica:check` | ✅ | **é o mesmo arquivo** (`gates/scripts/audit/auditor_composicaoatomica.mjs`) que `check-audit-baseline.mjs --with-tsc` roda via `run_audit.mjs` |
| `section-pointers:check` | ✅ | `auditor_sectionpointers.mjs` (em `run_audit.mjs`) é **wrapper fino confirmado** (`spawnSync`) sobre `check-section-pointers.mjs` — mesmo script, dois nomes |
| `audit` (`run_audit.mjs`) · `audit:baseline` | ✅ (regra coberta, script não é o mesmo) | `check-audit-baseline.mjs` lê e roda o **mesmo array** de 12 auditores; a saída/orquestração é outra, a regra é a mesma |
| **`plan-index:check`** | ❌ | nunca esteve na cadeia; só a METADE dele roda no `pre-commit` — achado da `plan-52`, coberto aqui pela primeira vez, inteiro |
| **`gate-limits:check`** | ❌ | só no Anel 1 do `pre-commit`; `build`/`gates:full` não o chamam em ponto nenhum |
| **`container-query:check`** | ❌ | `plan-52` só o pôs no Anel 1 do `pre-commit` |
| **`container-query-boundary:check`** | ❌ | idem |
| **`persistence-doc:check`** | ❌ | idem |

Os **cinco** `❌` entram explicitamente no job `gates` (`.github/workflows/gates.yml:88-94`).

**O anel de release** (§5 item 3, o achado mais sério da plan): `check-release-tag.mjs` lê `readFileSync(0)`
(stdin) e, quando não há stdin, cai no fallback já existente no próprio código: `alvo = 'HEAD'`. Isso significa
que, num job disparado por `push` em `main`, rodar `node gates/scripts/release/check-release-tag.mjs < /dev/null`
avalia **exatamente o commit que acabou de ser empurrado** — sem fabricar o protocolo de stdin do hook do git.
**Provado localmente, contra o HEAD real deste repositório:**

```
$ node gates/scripts/release/check-release-tag.mjs < /dev/null
[release:check] OK — o artefato publicado é idêntico ao de v6.1.0 (4f274e0641ce). Nenhuma tag devida.
exit=0
```

Não testei o lado que **bloqueia** (artefato mudado sem tag) porque isso exige um commit divergente de verdade
— e o executor nunca commita. O bloqueio em si (a mesma função, `bloquear()`) já foi provado nos dois sentidos
em [[02-enforcement-por-commit]] §11.1 (Prova 3a/3b, via o `pre-push` local); o que era **novo** aqui — o
fallback sem stdin — foi provado agora, no sentido positivo.

**`.github/` entrou no `TOCA_CODIGO`** (`.githooks/pre-commit`), com a justificativa escrita ao lado, no mesmo
padrão das outras linhas do hook. **Só isso** foi tocado em `.githooks/` — nenhum anel, nenhuma outra linha.

**Anel 0 NÃO foi levado para a CI** — confirmado lendo o código: `verificar_commit.py:94-95` chama
`git diff --cached` sem parâmetro de faixa nem flag alternativa; num runner limpo não há nada em staging, e o
scanner reportaria "nenhum segredo" sempre, mascarando ausência de cobertura como sucesso. Nenhuma linha de
Anel 0 existe em `.github/workflows/`.

### Verificações executadas

- `python -c "import yaml; yaml.safe_load(...)"` nos dois workflows → **ambos parseiam sem erro**, jobs
  listados corretos (`gates`, `release-tag`, `install-sha` em `gates.yml`; `install-semver` em `install-tag.yml`).
- Todo `npm run <script>` citado nos workflows conferido contra `package.json` um a um (script de verificação
  em Node) → **todos existem**. Os dois `node <caminho>` diretos (`check-release-tag.mjs`, `sarak-ui.mjs`)
  conferidos com `ls` → **existem**.
- `grep -inE "retr(y|ies)|continue-on-error" .github/workflows/*.yml` → **vazio** (nenhum dos dois).
- **Prova do `.github/` no `TOCA_CODIGO`**: staged **só** os dois arquivos de `.github/workflows/`,
  `sh .githooks/pre-commit` → **exit 0**, Anéis 1 e 2 rodaram por inteiro (antes desta mudança, imprimiria
  "PULADOS"). Revertido (unstage) depois.
- `git diff --stat vitest.config.ts package.json` → **vazio** — nada da `plan-52` foi tocado.
- Zero ocorrências de `process.platform`/`win32`/caminho de unidade fora de `__tests__/` em `src/`, `scripts/`,
  `gates/`, `bin/` — confirma que `ubuntu-latest` (sem matriz de SO) é seguro.
- **Instalação real, contra o repositório público de verdade** (`https://github.com/Lib-Sarak/Sarak-Lib-UI-Core`,
  confirmado público: `curl` em `api.github.com` → `200`), com os EXATOS comandos que os workflows rodam —
  não simulação:
  - `npm install "github:Lib-Sarak/Sarak-Lib-UI-Core#semver:^6.1.0"` → resolveu **6.1.0**, os 4 artefatos
    (`dist/index.cjs`, `dist/index.d.ts`, `dist/sarak.css`, `bin/sarak-ui.mjs`) existem, `sarak-ui check --notify`
    saiu com **0** e silencioso (em dia — exatamente o contrato de [[13-instalacao-e-atualizacao]] §5.1).
  - `corepack pnpm add "github:...#semver:^6.1.0"` → mesma prova, **exit 0**, `Done in 30.2s`.
  - `corepack yarn add "github:...#semver:^6.1.0"` → mesma prova, **exit 0**, `Done in 48.89s` (Yarn clássico).
  - `npm install "github:...#1e67c58bc7c083ef0a6534b006ca8c8a2a2fe89b"` (o mecanismo do `install-sha`, contra
    um commit real já empurrado — `origin/main`) → **exit 0**, `dist/` presente.
  - ⚠️ **O que NÃO testei**: `pnpm`/`yarn` pelo mecanismo `#<sha>` especificamente (só testei `#semver:` nos
    dois); e, na minha máquina local (Windows/Git Bash), `pnpm`/`yarn` só funcionaram com o prefixo
    `corepack pnpm`/`corepack yarn` — sem ele, `command not found`. **O runner `ubuntu-latest` não tem essa
    limitação**: `corepack enable` sozinho, no padrão documentado do GitHub Actions, põe `pnpm`/`yarn` no
    `PATH` diretamente — é o padrão usado em milhares de workflows públicos —, mas isso **não foi provado
    nesta máquina** e fica para a Etapa B confirmar. Se falhar, o conserto é trocar `pnpm add`/`yarn add` por
    `corepack pnpm add`/`corepack yarn add` nos dois workflows — mudança de uma linha, não de desenho.
- `npx vitest list --filesOnly` **não** foi re-rodado nesta plan (não a alterei); os números correntes da
  suíte são os que a `plan-52` fechou (317/1376), sem mudança aqui.

### Arquivos alterados

| Arquivo | Natureza | O que mudou |
|---|---|---|
| `.github/workflows/gates.yml` | criado | job `gates` (o job de gates completo, nas 3 linhas de gatilho que o pedem) + job `release-tag` (só push:main) + job `install-sha` (só PR) |
| `.github/workflows/install-tag.yml` | criado | job `install-semver`, só em push de tag `v*`, matriz npm/pnpm/yarn |
| `.githooks/pre-commit` | alterado | `.github/` entrou no `TOCA_CODIGO` (1 linha de regex + comentário de justificativa); a linha de "PULADOS" ganhou `.github/` na lista impressa |

**Nada de `specs/specs/`, `arquitetura/`, `adr/` tocado** — confirmado por `git status`.

### Critérios de aceite

**§7.1 — Etapa A (o executor fecha sozinho):**

- [x] Workflow escrito, com os cinco gatilhos — nenhum a mais, nenhum a menos.
- [x] `.github/` no `TOCA_CODIGO`, justificativa escrita no hook, provado com staged só-`.github/`.
- [x] Todos os `*:check` enumerados um a um, com a prova de quais o `gates:full` (pós-`plan-52`) alcança; os
      5 descobertos entraram explicitamente no job.
- [x] Suíte sem `retries` nem `continue-on-error`; saída completa (`gates-full-output.log`, que inclui a saída
      do `vitest run --coverage` dentro de `coverage:check`) sobe como artifact **sempre** (`if: always()`).
- [x] Anel de release: resposta escrita — roda no evento `push` da `main` (job `release-tag`), usando o
      fallback nativo do próprio script, **provado** localmente no sentido positivo.
- [x] Nenhum arquivo da `plan-52` tocado (`vitest.config.ts`, `gates:full` do `package.json`, os gates órfãos)
      — `git diff --stat` vazio nos dois primeiros; o terceiro não foi alterado (só referenciado no YAML).

**§7.2 — Etapa B (exige o dono ter empurrado): nenhum marcável nesta rodada.** Ver "Pendências" abaixo.

### Decisões e suposições

- **Dois workflows, não um só.** `install-tag.yml` roda num evento (`push: tags`) completamente diferente dos
  outros quatro (`push`/`pull_request` de branch) — um `if` dentro de um único workflow para distinguir "isto é
  push de tag" exigiria reimplementar `on.push.tags` como condição de job em vez de gatilho, sem ganho nenhum.
  A plan não proíbe múltiplos arquivos; só proíbe criar gate novo ou automatizar release — nenhum dos dois
  aconteceu.
- **`install-sha` e `release-tag` como jobs separados de `gates`, não passos dele.** Rodam em paralelo com
  `gates` (exceto `release-tag`, que declara `needs: gates` de propósito: não vale a pena avaliar a tag de um
  push cujos gates ainda nem se sabe se vão passar). `install-sha` não precisa esperar nada — roda em paralelo,
  mais rápido para quem abriu o PR.
- **`gates-full-output.log` via `tee` + `set -o pipefail`**, não uma captura separada da suíte. Rodar
  `vitest run --coverage` de novo só para ter um log próprio duplicaria a suíte inteira (custo dobrado) pelo
  mesmo conteúdo que já sai no `coverage:check` dentro do `gates:full`. `pipefail` garante que a falha real do
  `npm run gates:full` não se perca atrás do exit-0 do `tee`.
- **Corepack para pnpm/yarn**, não instalação de binário fixo. É o padrão suportado nativamente pelo
  `setup-node` da Action oficial, e evita fixar uma versão de gerenciador que a lib não versiona.
- **Não criei o achado de "faltando testar pnpm/yarn por `#sha`" como bloqueio.** É uma lacuna real da minha
  verificação local (documentada acima), não um defeito do workflow — o mecanismo de resolução de spec `github:`
  é o mesmo código do npm/pnpm/yarn para `#sha` e para `#semver:`; testei um lado em cada gerenciador.

### O material para a spec 16 (nasce na síntese — eu NÃO crio nem edito spec fixa, §7.3 do [[00-prompt-executor]])

#### §1 — Modelo de branches

```
feature/xyz  ──PR──►  develop  ──PR──►  main  ──npm version──►  tag vX.Y.Z
```

| Branch | Papel | Quem escreve |
|---|---|---|
| `main` | produção / código final. O dono não desenvolve mais nela | só merge de PR, e o push do release (pelo dono) |
| `develop` | desenvolvimento — onde o trabalho do dia acontece | commit direto e push |

**`develop` precisa nascer de novo** — confirmado nesta execução: `git log origin/main..origin/develop` = 0
commits à frente; `git log origin/develop..origin/main` = **423** atrás. É ação do dono (Etapa B item 2), fora
do worktree.

**O consumidor nunca lê branch nenhuma.** Ele instala por `#semver:`, que o `npm` resolve contra **tags**
(ADR-008). O modelo de branches é disciplina de trabalho — **produção, para quem instala, é a tag**. Dar merge
na `main` não publica nada; só `npm version` publica.

#### §2 — Tabela de gatilhos

| Evento | O que roda | Onde |
|---|---|---|
| push `feature/*` | nada | — |
| push `develop` | gates completo (build, os 4 gates encadeados, `package:check`, `coverage:check`, `check-audit-baseline --with-tsc`, `themes:diversity`, e os 5 `*:check` que `gates:full` não alcança: `plan-index`, `gate-limits`, `container-query`, `container-query-boundary`, `persistence-doc`) | `gates.yml` → job `gates` |
| PR `develop→main` | gates completo + install pelo SHA do PR, 3 gerenciadores | `gates.yml` → jobs `gates` + `install-sha` |
| push `main` (merge aceito) | gates completo + `check-release-tag.mjs` sobre o HEAD | `gates.yml` → jobs `gates` + `release-tag` |
| tag `v*` empurrada | install por `#semver:` contra a tag, 3 gerenciadores | `install-tag.yml` → job `install-semver` |

#### §3 — A CI

**Os quatro jobs**, custo real por job: **⏳ pendente de medição — só existe depois da Etapa B rodar de
verdade.** Não presuma os 315,44 s da §2.1 desta plan (são de antes da `plan-52`) nem os números locais do
`§10` da `plan-52` (~208 s de `vitest run` sozinho, sem o resto do `gates:full`) — nenhum dos dois é a duração
de um job de CI.

**O que ela NÃO cobre:**

| Vão | Motivo medido |
|---|---|
| **Anel 0 (segredos)** | `verificar_commit.py:94-95` lê só `git diff --cached`; no runner não há staging — reportaria "nenhum segredo" sempre, em silêncio. Achado novo, ver abaixo |
| **CSS renderizado em browser real** | a suíte roda em `jsdom`; a CI não muda isso ([[11-testes-e-cobertura]] §7.2) |
| **`dist/` commitado × build limpo** | não confere — seria gate novo, fora do escopo desta plan |
| **O `pre-push` local deixa de rodar no dia a dia** | ele só age para `refs/heads/main`, e agora o dono empurra `develop` — a suíte local raramente dispara. **Não é perda**: a rede mudou de lugar, para os jobs `gates` (em push:develop, push:main, PR→main) |

#### §4 — Ponteiros (nunca redescrição)

- Anéis locais (pre-commit/pre-push), o que cada um cobra e custa → [[02-enforcement-por-commit]]
- Ritual de release, ganchos do `npm version`, formato da tag → [[03-versionamento-e-release]]
- Catálogo de gates, baseline versionado, matriz de cobertura → [[01-gates-e-baseline]]

### Achado novo para [[15-divida-conhecida]] §4.1

**Anel 0 (segredos) não tem modo de faixa.** `gates/scripts/segredo/verificar_commit.py:94-95` chama
`git diff --cached --unified=0 --no-color` — hardcoded, sem flag para varrer um intervalo de commits
(`origin/main...HEAD` ou similar). Isso o torna **inutilizável em qualquer pipeline remoto**: um runner limpo
não tem nada em staging, e o scanner reportaria "0 achados" sempre — verde que não examinou nada, pior que
ausência. Confirmado lendo o código (`main()`, `argparse`, sem opção de faixa). **Destino:** implementação
posterior (§4 de [[15-divida-conhecida]], não dívida) — construir um modo `--faixa <base>..<head>` antes de
qualquer plan que queira levar Anel 0 a um pipeline remoto. Enquanto isso não existir, o Anel 0 **continua só
local**, e é isso que `.github/workflows/` desta plan reflete.

### Texto proposto para as specs existentes

- **`02-enforcement-por-commit.md` §9** — a "opção em aberto" morre: existe desde `<data do merge desta
  plan>`, em `.github/workflows/gates.yml` (jobs `gates`/`release-tag`/`install-sha`) e `install-tag.yml`
  (job `install-semver`). Acrescentar nota em §4.2: *"o `pre-push` local deixou de rodar no dia a dia — ele só
  age para `refs/heads/main`, e o modelo de branches (plan-05) passou o trabalho diário para `develop`; a rede
  da suíte completa mudou de lugar, para o job `gates` da CI, disparado em push:develop, push:main e PR→main."*
- **`01-gates-e-baseline.md` §2.2** — a coluna "onde roda" de `plan-index:check`, `gate-limits:check`,
  `container-query:check`, `container-query-boundary:check` e `persistence-doc:check` ganha `CI
  (.github/workflows/gates.yml)`, além do que já tinham (Anel 1 do `pre-commit`, quando aplicável).
- **`03-versionamento-e-release.md` §6** — o release passa a acontecer **sob o modelo de branches**: o dono
  emite `npm version` a partir da `main`, e o `postversion` (`git push --follow-tags`) exige a **exceção de
  administrador** na proteção de branch da `main` (Etapa B item 3 desta plan) — sem ela, o push do release é
  recusado pela própria regra que a CI acabou de ganhar poder para impor.

### Pendências / riscos

- **Etapa B inteira está pendente — é a natureza da fronteira desta plan.** Nada aqui foi executado num
  runner de verdade. Os itens que dependem disso (workflow "executado com sucesso ao menos uma vez", PR com
  teste quebrado reprovado pela automação, `run_audit` comparado ao baseline **na CI**, install real nas duas
  provas, duração real de cada job, `sarak-dev`/proteção de branch/`develop`) **não podem ser marcados** até o
  dono: (1) recriar a `develop` a partir da `main`; (2) empurrar a branch com estes dois workflows e abrir o PR
  para `develop` (que dispara `gates` pela primeira vez); (3) ligar a proteção da `main` com a exceção de
  administrador, **depois** do primeiro run aparecer na lista de checks.
- **`pnpm add`/`yarn add` sem prefixo `corepack`, no runner, é suposição informada, não prova** — ver a
  seção de verificações acima. Primeiro sinal de problema na Etapa B: erro `command not found` no passo de
  install; conserto é de uma linha por gerenciador.
- **Nenhuma duração de job existe ainda** — §3 da spec 16 (acima) fica com o número em aberto até a Etapa B.
- **`sarak-ui check --notify` foi provado localmente contra `#semver:`/`#sha` de commits JÁ publicados**, não
  contra o SHA de um PR real (que ainda não existe). O mecanismo é o mesmo; o cenário exato do `install-sha`
  só é exercitado quando existir um PR de verdade.

## Resumo da execução (correção 1) — 2026-08-19

**Resultado:** Concluído. Escopo respeitado à letra: **só `package-lock.json` foi tocado.** A plan segue
`🟡 Em execução` — a Etapa B (recriar `develop`, empurrar, PR, proteção de branch) continua sendo do dono.

### O achado, resolvido

**Mecanismo escolhido:** `rm package-lock.json && npx -y npm@11.17.0 install --package-lock-only` — apagar o
lock e regenerá-lo **do zero** com o npm do runner, não regravá-lo em cima do existente.

**Por que não bastava `npm install --package-lock-only` sobre o lock existente** (o que o revisor já havia
medido e descartado): com o lock presente, `--package-lock-only` usa a **árvore já resolvida** como âncora e só
confere se ela ainda "bate" com `package.json` — responde `up to date` mesmo faltando a entrada de topo que o
`npm ci` exige, porque aquela checagem de sincronia é mais **permissiva** que a do `ci`. Sem o lock, o npm não
tem âncora nenhuma: resolve a árvore inteira do zero, hoisting incluído, e É NESSA hoiste completa que as
entradas de topo `node_modules/@emnapi/core` e `node_modules/@emnapi/runtime` nasceram — antes só existiam
aninhadas sob dois consumidores diferentes (`@rolldown/binding-wasm32-wasi` e, agora,
`@tailwindcss/oxide-wasm32-wasi`), nunca hoisted para o nível que o `@napi-rs/wasm-runtime` (peer dependency)
precisa encontrar.

**Prova obrigatória, nos DOIS npms — feita duas vezes cada, com e sem `node_modules` (a segunda simula um
clone limpo de verdade, o que o runner realmente é):**

| Cenário | `npx npm@11.17.0 ci --dry-run` | `npm ci --dry-run` (11.6.1 local) |
|---|---|---|
| Com `node_modules` existente | ✅ exit 0 (mostra ajustes de árvore — remoções de pacotes que a nova resolução não precisa mais) | ✅ exit 0 (mostra adições — pacotes opcionais de outras plataformas que antes não apareciam na árvore) |
| **Sem `node_modules`** (`mv node_modules /tmp/...`, clone limpo simulado) | ✅ **exit 0 — 417 pacotes, nenhum erro** | ✅ **exit 0 — 514 pacotes, nenhum erro** |

Antes da correção: `npx npm@11.17.0 ci --dry-run` reproduzia **exatamente** o erro do runner (`EUSAGE`,
`Missing: @emnapi/core@1.11.3` / `@emnapi/runtime@1.11.3`) — confirmado batendo a saída, caractere por
caractere, contra o que o revisor colou do run real. Depois da correção, os dois npms passam, nos dois
cenários. `node_modules` foi restaurado ao estado original depois do teste (só movido e devolvido — nenhuma
instalação real de fato mudou o que está em disco).

### O diff do lock, por inteiro — nada em silêncio

`lockfileVersion` continua **3** nos dois. As declarações de raiz (`dependencies`, `devDependencies`,
`peerDependencies` do próprio pacote) são **byte-idênticas** entre antes e depois — confirmado comparando os
dois blocos por igualdade de string. O que mudou é só a **árvore resolvida**:

| Métrica | Antes | Depois |
|---|---|---|
| Linhas do arquivo | 7.481 | 6.780 (**−701**) |
| Entradas em `"packages"` | 519 | 523 (**+4** líquido) |

**19 entradas adicionadas** — as duas que o `npm ci` exigia (`@emnapi/core@1.10.0`, `@emnapi/runtime@1.10.0`,
agora de TOPO) mais 17 variantes de plataforma de `@tailwindcss/oxide-*` (`android-arm64`, `darwin-arm64`,
`darwin-x64`, `freebsd-x64`, `linux-arm-gnueabihf`, `linux-arm64-gnu`, `linux-arm64-musl`, `linux-x64-gnu`,
`linux-x64-musl`, `wasm32-wasi` e seu subárvore própria de `@emnapi/*`+`@napi-rs/wasm-runtime`+`@tybys/wasm-util`+`tslib`,
`win32-arm64-msvc`) que **subiram de nível**: antes viviam só aninhadas sob
`node_modules/@tailwindcss/vite/node_modules/@tailwindcss/oxide-*`.

**15 entradas removidas** — e aqui está o achado que não estava no pedido, e por isso é relatado à parte:

- **14 são as duplicatas aninhadas que a promoção ao topo tornou redundantes**: as mesmas 12 variantes de
  `@tailwindcss/oxide-*` que existiam **duplicadas** sob `@tailwindcss/vite/node_modules/...` (agora só no
  topo) + as 2 entradas aninhadas de `@emnapi/core`/`@emnapi/runtime` sob `@rolldown/binding-wasm32-wasi/node_modules/...`
  (idem, agora só no topo). Puro dedup — é a razão do arquivo ter encolhido 701 linhas.
- **1 é estranha ao pedido, e por isso relatada em destaque:** `"../Sarak-Lib-Shared": { "version": "4.0.2",
  "extraneous": true, ... }` — uma entrada que apontava para um **diretório IRMÃO** (`../Sarak-Lib-Shared`,
  fora deste repositório), marcada `extraneous: true` pelo próprio npm (o rótulo oficial para "presente na
  árvore que o npm viu, mas não requerido por nenhum `package.json` desta árvore"). **Não é dependência real
  desta lib** — `package.json` não cita `@sarak/lib-shared` em nenhuma das três listas de dependência (raiz
  idêntica, conferido acima), e a nova regeneração, partindo do zero, nunca a redescobriu. Era resíduo de uma
  varredura de filesystem anterior (`npm install` rodado em algum momento com o diretório irmão presente/visível
  na árvore), não uma referência funcional — e por isso sair é limpeza, não perda de cobertura.

**1 entrada com a MESMA chave mudou de versão** — e **desceu**, não subiu:

```
node_modules/@emnapi/wasi-threads: 1.2.3 -> 1.2.1
```

Antes existiam **duas** cópias dessa dependência transitiva (`dev`, `optional`) em versões diferentes — `1.2.3`
aninhada sob `@rolldown/binding-wasm32-wasi` (removida, ver acima) e implicitamente outra resolução em jogo. A
regeneração do zero convergiu para uma **única** cópia de topo, `1.2.1`, que é o que
`@tailwindcss/oxide-wasm32-wasi` (via seu `@napi-rs/wasm-runtime` aninhado) declara precisar. **Nenhuma outra
versão mudou** — nem subiu, nem desceu. É um pacote `optional: true`/`dev: true`, parte do binário WASM32 do
Tailwind Oxide, nunca importado pelo código de produção da lib.

**Nenhuma versão de dependência de produção mudou.** As 19 adições e 14 das 15 remoções são a mesma família
(`@tailwindcss/oxide-*` e seus `@emnapi/*` transitivos) mudando de **posição** na árvore, não de **conteúdo**.

### Verificações executadas

- `npx -y npm@11.17.0 ci --dry-run` (com e sem `node_modules`) → **exit 0** nos dois cenários.
- `npm ci --dry-run` local, 11.6.1 (com e sem `node_modules`) → **exit 0** nos dois cenários, continua passando.
- `npx vitest run` → **317 arquivos / 1376 testes, 100% verde** (`Duration 165,48s`), com o `node_modules`
  restaurado ao estado anterior — a suíte roda contra o que já estava instalado, não contra uma instalação
  nova a partir do lock regenerado (essa instalação real só acontece na CI, via `npm ci` de verdade).
- `git diff --stat package.json` → **vazio**. `git diff --stat .github/` → **vazio**. `grep -n "engines\|packageManager" package.json` → **nenhuma ocorrência nova** (nenhum dos dois foi declarado).
- Comparação estrutural JSON (script em scratchpad, não commitado) entre o lock antes/depois: 19 adicionadas,
  15 removidas, 1 versão mudada — números acima, conferidos por chave de `"packages"`, não por linha de texto.

### Arquivos alterados

| Arquivo | Natureza | O que mudou |
|---|---|---|
| `package-lock.json` | alterado | regenerado do zero com `npm@11.17.0 install --package-lock-only`; ver diff estrutural acima |

**Nada mais.** `package.json`, `.github/workflows/`, `.githooks/`, `src/`, `gates/`, `scripts/` e toda spec
fixa continuam sem diff — confirmado por `git status`.

### Critérios da correção 1

- [x] Mecanismo descoberto, provado e justificado por escrito (por que `--package-lock-only` sobre o lock
      existente não bastava, e por que apagar primeiro resolve).
- [x] `npx npm@11.17.0 ci --dry-run` PASSA — provado, inclusive em clone limpo simulado.
- [x] `npm ci --dry-run` (11.6.1) CONTINUA passando — provado, inclusive em clone limpo simulado. Não é "verde
      só no novo com o antigo quebrado".
- [x] Diff do lock relatado por inteiro: 19 adicionadas, 15 removidas (14 dedup + 1 resíduo estranho ao
      pedido, `../Sarak-Lib-Shared`, marcado `extraneous` pelo próprio npm), 1 versão mudada (`@emnapi/wasi-threads`,
      **desceu** 1.2.3→1.2.1, transitiva opcional/dev). Nenhuma versão de dependência de produção mudou.
- [x] Suíte 317/1376 verde depois da mudança.
- [x] `.github/workflows/` intocado; `npm ci` continua sendo o comando do workflow (não virou `npm install`);
      `node-version` do YAML continua `"24"`, não pinado em patch.
- [x] Nenhum `engines` nem `packageManager` declarado em `package.json`.
- [x] Nenhum outro arquivo tocado.

### Achados que não são desta correção (já estavam registrados no veredito, não repito código)

Os achados 2–5 do veredito (lockfile gerado por npm mais antigo, ausência de `packageManager`/`engines`,
aviso do `allowScripts` sobre `esbuild`, `actions@v4` vs `v5`) **continuam de pé** — nada nesta correção os
fecha, porque nenhum é escopo dela. O achado 2 é, na prática, a explicação de por que o defeito aconteceu; a
correção resolve o **sintoma** (o lock quebrado) sem resolver a **causa estrutural** (nada impede o lock de
voltar a ser gerado por um npm desalinhado do runner) — que é exatamente o que o achado 3 (`packageManager`
declarado) resolveria de raiz, e que a §3.2 desta plan proíbe fazer aqui de propósito.

---

# 11. Veredito

<!-- Preenchido pelo REVISOR. Append-only. -->

## Conferência da Etapa A — 2026-08-18 — ⏸️ **SEM VEREDITO** (a plan segue `🟡 Em execução`)

**Isto não é aprovação, e não pode ser.** Os critérios da §7.2 exigem execução remota real; até o dono
empurrar, não há o que marcar. O que segue é a conferência do que **já dá para conferir** — tudo remedido por
mim no worktree.

### Etapa A — o que eu verifiquei sozinho

| Alegação | O que eu medi | |
|---|---|---|
| Dois workflows, as 5 linhas de gatilho, "nem uma a mais" | `push [develop, main]` · `pull_request [main]` · `push tags v*`. `feature/*` sem gatilho, por omissão | ✅ |
| Sem `retries` / `continue-on-error` | `grep -niE` nos dois arquivos → **vazio** | ✅ |
| Os 5 `*:check` órfãos entraram no job | conferi um a um contra o `gates:full` corrente: **os cinco estão mesmo fora dele** | ✅ |
| `section-pointers` e `composicao-atomica` já cobertos | `auditor_sectionpointers.mjs:14-15` é `spawnSync` sobre `check-section-pointers.mjs` — **wrapper fino, confirmado na fonte**; e `composicao-atomica:check` aponta para o mesmo `.mjs` que o `run_audit` carrega | ✅ |
| Todo `npm run X` do YAML existe | **7 de 7** conferidos contra o `package.json` | ✅ |
| `.github/` no `TOCA_CODIGO` | **reproduzi**: staged só `.github/workflows/*.yml` → Anéis 1 e 2 rodaram por inteiro; no `HEAD` o regex não tem `.github/`, então imprimiria "PULADOS" | ✅ |
| Nada da `plan-52` tocado | `git diff vitest.config.ts package.json` **vazio** | ✅ |
| Nenhuma spec fixa tocada | `git status` limpo em `specs/specs`, `arquitetura`, `adr` | ✅ |
| Gates | **15 de 15 verdes** (o `plan-index` divergia por status — espelhei o índice, que é meu) | ✅ |

### O achado do anel de release está **certo**, e é o melhor da entrega

A plan mandava verificar como alimentar o `check-release-tag.mjs` num job, e **declarar o vão se não houvesse
caminho honesto**. O executor achou um caminho que já existia:

```
gates/scripts/release/check-release-tag.mjs:44
   "Rodando à mão não há stdin — readFileSync(0) estoura e o fallback é o HEAD."
:56  if (stdin.trim() === '') return 'HEAD';
```

Conferido na fonte. O job roda `… check-release-tag.mjs < /dev/null` e cai no fallback **documentado pelo
próprio script** — o mesmo caminho do `npm run release:check` manual. Nada de protocolo de hook fabricado. É
literalmente "o mesmo gate num lugar novo", que era a condição da §3.2.

### Duas coisas boas de engenharia que passaram do pedido

- **`set -o pipefail` antes do `tee`.** Sem isso o `tee` devolveria exit 0 e **um `gates:full` vermelho
  passaria despercebido** — exatamente a classe de verde falso que esta plan existe para matar.
- **O `install-tag` não se contenta com "instalou"**: ele assere `test "$INSTALADA" = "$VERSAO"`, provando que
  `#semver:^X.Y.Z` resolve para a tag recém-publicada, e não para uma anterior.

### Riscos declarados — nenhum bloqueia, os dois são da Etapa B

1. **`corepack enable` sozinho põe `pnpm`/`yarn` no `PATH`?** Não foi provado nesta máquina (no Windows só
   funcionou com o prefixo `corepack pnpm`). Declarado em vez de afirmado — correto. Se o job falhar, há
   **duas** correções de uma linha: o prefixo que o executor propõe, **ou** `COREPACK_ENABLE_DOWNLOAD_PROMPT=0`
   no `env`, se o que travar for o prompt de download do corepack num runner sem TTY.
2. **`pnpm`/`yarn` por `#<sha>` não foram testados** — só por `#semver:`. O `#sha` foi provado no `npm`. Risco
   pequeno (é o mesmo resolvedor de git), declarado, e a Etapa B o fecha de graça.

### O que falta, e é do dono

Nada aqui é trabalho de executor. A plan **fica `🟡`** até:

1. recriar a `develop` a partir da `main` (423 commits atrás);
2. empurrar a branch com os workflows e abrir o PR;
3. ligar a proteção da `main` — *required status check* —, **com exceção para administrador**;
4. o PR com teste quebrado de propósito, e a reversão.

---

## Rodada de correção 1 — 2026-08-19 — o primeiro run real

**Os passos 1 e 2 acima aconteceram**: `develop` recriada, PR #1 aberto (`develop` → `main`), e a CI rodou
pela primeira vez. Resultado, lido por mim na API pública e nos prints do dono:

| Check | Resultado | Leitura |
|---|---|---|
| `install-sha` **npm · pnpm · yarn** | ✅ **1m · 16s · 21s** | o **achado 26 está provado na prática**; e o risco do `corepack` que o executor declarou **não se materializou** |
| `install-sha (push)` · `release-tag (push)` · `release-tag (pull_request)` | ⊘ *skipped* | **toda a lógica condicional dos gatilhos está correta** |
| `upload-artifact` | ⚠️ *"No files were found"* | **correto**: o `gates:full` não chegou a rodar, então não havia log. O `if: always()` fez o que devia |
| `gates` (push **e** pull_request) | ❌ **falha em 13-14 s** | ver o Achado 1 |

### 🔴 Achado 1 — o `npm ci` reprova sob o npm do runner *(bloqueia a Etapa B)*

**O erro, na íntegra:**

```
npm error code EUSAGE
npm error `npm ci` can only install packages when your package.json and package-lock.json ... are in sync.
npm error Missing: @emnapi/core@1.11.3 from lock file
npm error Missing: @emnapi/runtime@1.11.3 from lock file
```

**Reproduzido por mim na máquina do dono** — não depende mais da CI para verificar:

```
npx npm@11.17.0 ci --dry-run     → EUSAGE, saída IDÊNTICA à do runner
npm ci --dry-run                 → PASSA (npm 11.6.1)
```

**A divergência, medida:**

| | Máquina do dono | Runner |
|---|---|---|
| Node | **24.10.0** | `node-version: "24"` → **24.19.0** |
| npm | **11.6.1** | **11.17.0** |

A prova de que é o npm e não o SO: o texto de ajuda do runner lista `--allow-scripts`, `--allow-git`,
`--allow-directory`, `--strict-allow-scripts`. Testei as sete — **o npm 11.6.1 não conhece nenhuma delas**.

**A causa raiz:** `@napi-rs/wasm-runtime` e `@tailwindcss/oxide-wasm32-wasi` exigem `@emnapi/core` e
`@emnapi/runtime`, e o lock só os registra **aninhados** sob `@rolldown/binding-wasm32-wasi`. Falta a entrada
de topo. O npm 11.6.1 tolera a omissão; o 11.17.0 recusa.

> **O workflow NÃO está errado.** `npm ci` é o comando certo e reprovou por uma razão verdadeira: **o lockfile
> deste repositório quebra para qualquer pessoa com um Node 24 atual**, dentro ou fora da CI.

### O que a correção 1 exige

**Escopo: `package-lock.json`, e nada mais.**

1. **Descobrir e provar** qual comando produz um lock que satisfaz o `npm ci` do runner. ⚠️ **Medido por mim:
   `npm install --package-lock-only` NÃO resolve** — sob o 11.17.0 ele responde *"up to date"* e o `npm ci`
   continua reprovando. O mecanismo é seu; escreva por que escolheu.
2. **Prova obrigatória nos DOIS npms, local, antes de entregar:**
   ```
   npx npm@11.17.0 ci --dry-run     → tem de PASSAR
   npm ci --dry-run                 → tem de CONTINUAR passando
   ```
   Verde só no novo, com o antigo quebrado, **não serve**: seria trocar de defeito.
3. **Relatar o diff do lock por inteiro** — quantas entradas mudaram além das duas, e se alguma versão subiu.
   Um lock regenerado pode mexer em mais do que se pediu, e isso não pode passar em silêncio.
4. **A suíte continua 317/1376 verde** depois da mudança.

### ⛔ Proibido nesta correção

- **Tocar em `.github/workflows/`.** Em particular: trocar `npm ci` por `npm install`, ou pinar
  `node-version` numa versão de patch. As duas fariam a CI ficar verde **escondendo** o defeito — é o
  "consertar contornando" que a §5 item 9 proíbe, e o próprio YAML já diz *"nunca `npm install`"*.
- Declarar `engines` ou `packageManager` (§3.2). É a solução de raiz, e por isso mesmo merece plan própria —
  ver Achado 3.
- Qualquer outro arquivo. Nada de `src/`, `gates/`, `scripts/`, spec fixa.

### Achados para a síntese (não são código desta correção)

- **Achado 2 — o lockfile é gerado por um npm mais antigo que o do ambiente de referência.** Enquanto a
  máquina que gera o lock e a que o consome divergirem de versão, isto reincide. Vai para
  [[15-divida-conhecida]].
- **Achado 3 — não há `packageManager` nem `engines` declarados.** É o que tornaria essa divergência
  **impossível** em vez de invisível. Candidato a plan própria; a §3.2 desta plan o proíbe aqui de propósito.
- **Achado 4 — aviso novo do npm 11.17:** `esbuild@0.27.7 (postinstall: node install.js)` cai na política
  `allowScripts`, hoje só como **warning**. Se essa política endurecer por padrão, o build para. Vigiar.
- **Achado 5 — as `actions@v4` já rodam forçadas em Node 24** (aviso de depreciação do Node 20 no runner).
  Migrar para `@v5` é trabalho de manutenção, não desta correção.

### Veredito da correção 1 — 2026-08-19 — 🟢 **ACEITA**

Tudo remedido por mim no worktree.

| Alegação | O que eu medi | |
|---|---|---|
| Escopo: só `package-lock.json` | `git status` → o lock + esta plan. `package.json` **byte-idêntico**, `.github/` intocado | ✅ |
| `npx npm@11.17.0 ci --dry-run` | **exit 0** (antes reproduzia o `EUSAGE` do runner) | ✅ |
| `npm ci --dry-run` (11.6.1) | **exit 0** — o npm antigo continua aceitando | ✅ |
| 19 adicionadas · 15 removidas · 1 versão | **19 · 15 · 1**, conferido entrada por entrada | ✅ |
| Produção intacta | os 3 deps idênticos; **nenhuma** versão não-`dev` mudou | ✅ |
| Suíte | **317 arquivos / 1376 testes verdes**, 170,23 s | ✅ |

**Checagem que eu acrescentei:** nenhum `integrity` mudou sem a versão mudar — é o que denunciaria troca de
tarball. Cadeia limpa.

**O downgrade não é efeito colateral: é a prova de que o conserto está certo.** `@emnapi/core` exige
`@emnapi/wasi-threads` na versão **exata `1.2.1`** (pin, não faixa). O `1.2.3` anterior só sobrevivia porque o
`@emnapi/core` **não existia no topo** e ninguém cobrava o pin. Promovido, o pin passa a governar. O executor
relatou como *"desceu"*; **descer era o correto**, e o número antigo era sintoma do mesmo defeito.

**As 15 remoções conferem:** 14 são duplicatas aninhadas sob `@tailwindcss/vite/node_modules/` e
`@rolldown/binding-wasm32-wasi/node_modules/`, redundantes depois da promoção ao topo — dedup puro.

### 🔵 Achado 6 — uma biblioteca inteira, de outro repositório, dentro do lockfile

A 15ª remoção merece registro próprio. A entrada era:

```json
"../Sarak-Lib-Shared": {
  "name": "@sarak/lib-shared", "version": "4.0.2", "extraneous": true,
  "dependencies": { "axios": "^1.6.0" },
  "devDependencies": { "framer-motion", "lucide-react", "tsup", "typescript", ... }
}
```

Um **diretório irmão, fora deste repositório** — e que **não existe mais nesta máquina**. Está no lock desde
a **`v2.1.1`** (`git log -S`), atravessando todos os releases desde então.

Nunca quebrou nada — `extraneous: true` faz o `npm ci` ignorar. Mas é **a mesma família dos dois verdes falsos
que motivaram esta plan**: topologia da máquina local vazando para arquivo versionado. Saiu de graça porque o
lock foi **regenerado do zero** em vez de remendado, o que valida o mecanismo escolhido pelo executor.

Vai para [[15-divida-conhecida]] junto com os achados 2 a 5.

### O que continua faltando

A plan **segue `🟡 Em execução`**. A correção 1 desbloqueia a CI, mas nenhum critério da §7.2 pode ser marcado
antes de o dono empurrar, ligar a proteção da `main` e fazer a prova do vermelho.
