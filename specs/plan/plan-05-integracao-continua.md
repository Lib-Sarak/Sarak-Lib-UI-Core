---
tipo: "plan"
titulo: "Montar o pipeline — a CI remota, e o fluxo de trabalho que ela passa a governar"
dominio: "Sarak-Lib-UI-Core / Qualidade / Automação"
status: "🔴 A executar"
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
- O **§10 desta plan** — todo o material que as specs fixas vão precisar (§5 Etapa A, item 10)

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

---

# 11. Veredito

<!-- Preenchido pelo REVISOR. Append-only. -->
