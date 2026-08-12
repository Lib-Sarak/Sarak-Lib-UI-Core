---
tipo: "plan"
titulo: "O contrato único, por leitura integral — reconciliar 00-regras-e-invariantes com o repositório"
dominio: "Sarak-Lib-UI-Core / Governança de Specs"
status: "🟢 Aprovada"
prioridade: "Máxima"
tags: ["plan", "specs", "r17", "achado-32", "reconciliacao", "leitura-integral"]
relacionados: ["[[00-regras-e-invariantes]]", "[[01-gates-e-baseline]]", "[[15-divida-conhecida]]"]
depende_de: "plan-29"
destino_sintese: "—"
objetivo: "Fazer o contrato único parar de declarar vãos e violações que já foram fechados"
---

> ⚠️ **Executada pelo REVISOR** (só toca `specs/`), e **toca spec fixa** — exige pedido explícito do usuário
> ([[00-prompt-revisor]] §3.1). Autorizar a execução **é** esse pedido.

# 1. Objetivo

`00-regras-e-invariantes.md` — o **contrato único** do módulo — não declara mais nenhum vão, violação ou
dívida que o repositório já fechou, e **nenhuma regra contradiz a si mesma**.

# 2. Contexto

## 2.1 Por que esta plan existe: três rodadas provaram que o método estava errado

Este arquivo esteve no escopo da [[plan-29]] e **não fechou em três rodadas**. Não por descuido de quem
executou — as três listas que emiti estavam incompletas, cada uma truncada de um jeito diferente (`head`
por linhas · lista de padrões · `cut` por colunas). O veredito da correção 2 registra isso por extenso.

**A causa é estrutural, e é o que esta plan corrige:**

> **Um arquivo cujo conteúdo É um conjunto de vereditos não se audita por varredura — audita-se lendo.**

São ~1300 linhas e **35 linhas `**Estado:**`**, cada uma um veredito sobre um gate. O defeito mais caro
deste arquivo **não tem cifra errada**: tem *afirmação* errada — *"a regra está sendo violada hoje"*,
*"construir é trabalho da `plan-12`"*, *"está fora do escopo"*. Grep acha número; **só leitura acha
veredito**.

A prova de que o método novo funciona: quando a `plan-29` trocou para leitura integral na última rodada,
ela achou **quatro extensões** que três varreduras não tinham achado — e eu, relendo, achei mais três.

## 2.2 O ponto de partida — medido em 2026-08-12, não presumido

| Onde | O conflito | Medição |
|---|---|---|
| `:284` — **R7**, linha `**Estado:**` | diz *"a regra está sendo **violada hoje**, com o gate verde"*; o corpo em `:303` diz que o vão **fechou nos dois lados** | `grep -- "--sx-" src/styles/` → **0**. Achado 1 fechado (`plan-07` + `plan-12`) |
| `:347` e `:351` — **R8.1** | Estado **⏳**, *"construir é trabalho da `plan-12`"*, e *"nenhum script o invoca"* | `npm run coverage:check` **existe e roda** no `gates:full`; `check-coverage-floor.mjs` está construído. E a §1.3 `:78` declara a categoria ⏳ com **0**; `:1274` a declara **vazia** |
| `01-gates-e-baseline.md:152` | *"nenhuma das **32** regras depende dele"* | são **34** (`grep -c "^## R"`) |

**As três são exemplo, não a lista.** A lista é o que a leitura integral produzir — e é por isso que esta
plan **não traz uma lista de linhas** (§5).

# 3. Escopo

## 3.1 Dentro
- `specs/specs/00-regras-e-invariantes.md` — **o arquivo inteiro**
- `specs/specs/01-gates-e-baseline.md` — **só a linha `:152`**, que a `plan-29` deixou declarada

## 3.2 Fora
- ⛔ Todo o resto de `01-gates-e-baseline.md`, e `00-contexto.md`, `11-testes-e-cobertura.md`,
  `12-kit-do-consumidor.md` — **fechados e aprovados** pela `plan-29`. Reabrir arquivo aprovado é refazer
  trabalho verificado.
- ⛔ Os quatro arquivos da **`plan-31`** (`14-artefatos`, `09-temas`, `06-painel`, `08-identidade`).
- ⛔ **Mudar marcador de estado (✅ · ⚠️ · ⏳ · 🔴) de qualquer regra.** Ver §5, passo 3 — o executor
  **propõe**, o revisor decide, e a decisão vira execução própria.
- ⛔ Mudar enunciado, numeração ou categoria de regra. A numeração é identidade
  ([[00-regras-e-invariantes]] §1.3).
- ⛔ Código, gate, script, config.
- ⛔ Remover bloco histórico datado. Sai a afirmação de **presente** que envelheceu.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Plan | `specs/plan/plan-29-erradicar-cifra-em-prosa.md` §8 | as **quatro caixas** de classificação e a regra dura — esta plan as reusa, não as reescreve |
| Plan | idem, veredito da correção 2 | por que a varredura não fecha este arquivo |
| Spec fixa | `specs/specs/01-gates-e-baseline.md` §3 | a tabela de baseline **datada** — é para ela que as regras apontam em vez de repetir número |
| Spec fixa | `specs/specs/15-divida-conhecida.md` §6 | quais achados fecharam, e por qual plan |
| Fonte viva | `npm run audit` · `gates/baselines/audit-baseline.json` · `coverage-floor.json` · `package.json` (scripts) | a verdade contra a qual cada afirmação é conferida |

# 5. Instruções de execução

> **O método é a entrega.** Se esta plan for executada por varredura, ela falha como as três anteriores.

1. **Leia o arquivo inteiro, do começo ao fim, em blocos contíguos.** Sem `grep` como instrumento primário,
   sem `head`, sem `cut`. O `grep` só entra **depois**, para confirmar que uma correção pegou todas as
   ocorrências de um mesmo literal.

2. **Para cada afirmação de estado, faça UMA pergunta:** *"isto ainda é verdade no repositório de hoje?"* —
   e responda **rodando o comando**, não pela memória do documento. As afirmações de risco são as que dizem
   **está**, **hoje**, **continua**, **ainda**, **nenhum**, **fora do escopo**, **é dívida**, **é trabalho da
   `plan-NN`**.
   Classifique cada uma nas **quatro caixas da [[plan-29]] §8** (medição corrente · histórico datado ·
   identidade · estrutura conferida) e corrija só a primeira.

3. **⚠️ As 35 linhas `**Estado:**` são o alvo principal, e o marcador NÃO se toca.** Cada uma é um veredito
   sobre um gate. Corrija a **prosa** que envelheceu e **preserve o símbolo** — mesmo quando ele parecer não
   caber mais. Ao final, entregue no resumo uma **lista de marcadores que você propõe reavaliar**, com a
   medição que sustenta cada proposta. **Decidir se ⚠️ virou ✅ é do revisor**, exige medir o vão inteiro
   (não só a parte que mora neste arquivo) e será **execução própria** — nunca efeito colateral desta.

4. **Confira a coerência interna, que é o defeito que grep não vê.** Três lugares têm de concordar sobre
   cada regra: a linha `**Estado:**`, o corpo da regra, e as tabelas da §1.3 e da §4. Onde discordarem,
   **o repositório decide** — e o que se corrige é o texto, nunca o repositório.

5. **`01-gates-e-baseline.md:152`** — *"nenhuma das 32 regras"* deixa de citar total; a contagem vive no
   `grep -c "^## R"`, como a §2 do `00-contexto` já estabeleceu.

6. **Rodar e colar a saída:** `npm run section-pointers:check` · `npm run dev-kit:check` ·
   `node gates/scripts/audit/run_audit.mjs` · `npx tsc --noEmit` · `grep -c "^## R"` ·
   `grep -cE "^\*\*Estado:\*\*"` · `git diff --stat`.
   As duas contagens têm de ficar **inalteradas** (34 e 35).

7. **No resumo, declare o percurso da leitura** — quais blocos de linha você leu e em que ordem. É o que
   torna a completude **auditável** em vez de afirmada. **Não escreva "cobri o arquivo por completo" sem
   isso**; foi uma asserção de completude não reproduzível que reprovou a correção 1.

# 6. Prompt de execução

```
Leia specs/00-prompt-revisor.md e execute
specs/plan/plan-32-contrato-unico-leitura-integral.md.

Executada pelo REVISOR, e toca SPEC FIXA — confirme a autorização explícita do usuário
antes de editar (00-prompt-revisor §3.1).

Pré-requisito: a plan-29 tem de estar 🟢 Aprovada.

Contexto obrigatório: specs/plan/plan-29-erradicar-cifra-em-prosa.md — a §8 (as quatro
caixas + a regra dura) e o veredito da correção 2 (por que varredura não fecha este
arquivo). Mais specs/specs/01-gates-e-baseline.md §3 e
specs/specs/15-divida-conhecida.md §6.

O MÉTODO É A ENTREGA:
  · LEIA o arquivo inteiro, em blocos contíguos. Não use grep como instrumento
    primário. Nada de head, nada de cut — foi assim que as três rodadas anteriores
    falharam, cada uma truncando de um jeito diferente.
  · Para CADA afirmação de estado ("está", "hoje", "continua", "ainda", "nenhum",
    "fora do escopo", "é dívida", "é trabalho da plan-NN"), pergunte "isto ainda é
    verdade?" e responda RODANDO O COMANDO.
  · O defeito pior deste arquivo NÃO tem cifra errada: tem VEREDITO errado. Três
    exemplos medidos estão na §2.2 da plan — são exemplo, não a lista.

LINHAS VERMELHAS:
  · Você NÃO muda marcador (✅/⚠️/⏳/🔴) de regra nenhuma. Corrige a prosa, mantém o
    símbolo, e PROPÕE no resumo os que acha que não cabem mais, com a medição. Decidir
    é do revisor, e será execução própria.
  · Você NÃO muda enunciado, numeração nem categoria de regra.
  · Você NÃO toca em código, gate ou config, nem nos arquivos da plan-29 e da plan-31
    (exceto 01-gates-e-baseline.md:152, que é seu).
  · Você NÃO remove bloco histórico datado.

NO RESUMO, DECLARE O PERCURSO DA LEITURA (quais blocos de linha, em que ordem). Sem
isso, não escreva que cobriu o arquivo — foi uma asserção de completude não
reproduzível que reprovou a correção 1 da plan-29.

Não commite. Ao terminar, escreva o resumo na própria plan e mova o status para
🟠 Em revisão.
```

# 7. Critérios de aceite

- [ ] **Nenhuma regra contradiz a si mesma:** para cada uma, a linha `**Estado:**`, o corpo, e as tabelas da
      §1.3 e §4 concordam.
- [ ] Os três conflitos da §2.2 estão fechados (R7 `:284`, R8.1 `:347`/`:351`, `01-gates:152`).
- [ ] Nenhuma afirmação de vão, violação ou dívida **já fechada** sobrevive como presente.
- [ ] **Nenhum marcador mudou:** `grep -c "^## R"` = **34** e `grep -cE "^\*\*Estado:\*\*"` = **35**, e o
      conjunto de símbolos é idêntico ao de antes.
- [ ] Os marcadores propostos para reavaliação estão **listados com medição** no resumo — e **não** aplicados.
- [ ] **O percurso da leitura está declarado** no resumo, bloco a bloco.
- [ ] `section-pointers:check` · `dev-kit:check` verdes; `run_audit` no baseline; `tsc` 0.
- [ ] `git diff --stat` — **exatamente 2 arquivos**.

# 8. Como verificar (uso do revisor)

```bash
git diff --stat                                       # 2 arquivos
git diff                                              # ler INTEIRO
grep -c "^## R" specs/specs/00-regras-e-invariantes.md
grep -cE "^\*\*Estado:\*\*" specs/specs/00-regras-e-invariantes.md
grep -nE "^\*\*Estado:\*\*" specs/specs/00-regras-e-invariantes.md   # ler as 35, inteiras
npm run section-pointers:check && npm run dev-kit:check
node gates/scripts/audit/run_audit.mjs && npx tsc --noEmit
```

> 🔴 **Instrução para mim mesmo, escrita porque eu falhei nela quatro vezes:** ao ler qualquer saída desta
> verificação, **não truncar** — nem por linhas (`head`), nem por largura (`cut`), nem por padrão (lista de
> `grep`). Se a saída for grande demais para ler, **o alvo é grande demais para uma plan** — e a resposta é
> fatiar o alvo, nunca a leitura. Esta plan **é** o resultado de aplicar essa regra.

A verificação central não é comando nenhum: é **ler as 35 linhas `**Estado:**` contra o repositório**, uma a
uma. Foi o que achou os três conflitos da §2.2, e é o que fecha esta plan.

# 9. Destino da síntese

**Destino:** `—`

A execução já escreve na spec fixa, que é o alvo. Nada fica pendente de transporte.

---

# 10. Resumo da execução

<!-- Preenchido pelo REVISOR-executor. Append-only. -->

## Resumo da execução — 2026-08-12

**Resultado:** Concluído

### O percurso da leitura (§5, passo 7)

`00-regras-e-invariantes.md` lido **por inteiro, em quatro blocos contíguos**, via `Read` com
`offset`/`limit` — que **não trunca por largura**, o defeito que derrubou a `plan-29`:

| # | Linhas | O que cobre |
|---|---|---|
| 1 | 1 – 300 | frontmatter · §1 (propósito, vocabulário, contagem) · R1 → R7 (início) |
| 2 | 300 – 600 | R7 (fim) → R18 (início) |
| 3 | 600 – 900 | R18 (fim) → R30 (início) |
| 4 | 900 – 1306 | R30 → R34 · §3 conduta · §4 mapa · §4.1 · §5 · §6 · §7 |

Nenhum `grep` foi usado como instrumento primário. Ele entrou **depois**, só para confirmar que uma
correção pegou todas as ocorrências de um mesmo literal, e para as contagens do passo 6.

### O achado que só a leitura pega — a `VALUE_ALLOWLIST` não existe

A R2 descrevia, em **quatro** lugares, um mecanismo de isenção **removido**: a `VALUE_ALLOWLIST`, apagada
pela `plan-20` e substituída pelo marcador `sarak-allow-hardcode`. O comentário **B1** do próprio
`auditor_hardcoded.mjs` registra a deleção e o motivo — e a §R2.3-bis, **na mesma regra**, contava a história
da remoção enquanto os parágrafos acima ainda a tratavam como vigente.

Pior: o texto afirmava *"as duas formas convivem por desenho"*. **Não convivem — existe uma só.**

⚠️ **Nenhum `grep` acharia isto:** não há cifra errada. Há uma estrutura inexistente citada com
`arquivo:linha` que já não bate, e uma frase que descreve um desenho de duas pontas onde só existe uma.

### As correções, uma a uma

**Vereditos envelhecidos** (afirmação errada, não número errado):

| Onde | Era | Virou |
|---|---|---|
| R2 §2.3 · §2.3-bis (4 pontos) | `VALUE_ALLOWLIST` como mecanismo vigente; *"as duas formas convivem"* | uma forma só — o marcador; a allowlist **foi removida** |
| R7, linha `Estado:` | *"a regra está sendo **violada hoje**, com o gate verde"* | o vão real (nome × sintaxe do fallback); a violação **fechou** |
| R7, `Cobrada por` | registro de **2** fontes | **4** fontes, coerente com o vão logo abaixo |
| R8.1 `:347` | *"nenhum script o invoca"* | o gate **existe e roda** desde 2026-08-05 |
| R8.1, linha `Estado:` | ⏳ *"construir é trabalho da `plan-12`"* | ⏳ **conservado**, com o desacordo declarado em voz alta |
| R10 | *"Construir é trabalho da `plan-12`"* | construído em 2026-08-05; a metade `switch` segue declarada |
| R17 | achados **24 e 25 "abertos"** em uma **§3.5 que não existe** | os dois **fecharam** (`plan-07`); o vão do gate é que continua |
| R23 | achado **29** como violação viva | **fechou**; o vão declarado virou o do `auditor_sectionpointers` |
| R24 | ponteiro para **`[[24-modo-embarcado]]`**, spec **inexistente** | aponta `01-forma-do-produto-e-modos-de-consumo` |
| R28 | achado 26 *"roteado à `plan-11`"* | roteado à **`plan-10`** desde 2026-08-11 |
| R30 | *"é decisão da `plan-12`"* | a pergunta **foi resolvida pelos fatos** |
| §5 item 1 · item 3 · texto final | `plan-15` e `plan-12` como pendências vivas | plans removidas da fila; pagar dívida é **plan própria** |
| §6 critério | lista fixa de vãos abertos, desalinhada da §1.3 | aponta a §1.3, que é a fonte |

**Cifras que mentiam:** R21 (*"zero tags em 331 commits"* → hoje há tags); R25 (*"os **18** temas"* → o teste
itera `GLOBAL_THEMES`); R31 em 4 pontos e a linha da §4 (*"18 temas"* → *"temas shippados"*); R33 em 2 pontos;
§4 linha de R23 (*"cobre **271 de 455** ponteiros"* → a contagem sai na execução).

**`01-gates-e-baseline.md:152`** — *"nenhuma das **32** regras"* → *"nenhuma regra do contrato"*, apontando a
§1.3.

### ⚠️ A armadilha que a R31 carregava, e que agora está travada

*"Os 18 temas"* aparecia com **dois sentidos diferentes** no mesmo documento: o total de temas shippados
(que cresce) e a **lista de isenção de contraparte** do `auditor_contraste` (conjunto real, fechado, que só
encolhe). Corrigi o primeiro sentido e **deixei um aviso na própria R31** para que a distinção não se perca —
é o mesmo tropeço que a `plan-31` teve de evitar em `09-temas`.

### Marcadores propostos para reavaliação — NÃO aplicados (§5, passo 3)

| Regra | Marcador hoje | Medição que sustenta a proposta |
|---|---|---|
| **R8.1** | ⏳ | O gate **existe e roda**: `check-coverage-floor.mjs`, `npm run coverage:check`, dentro do `gates:full`, com piso em `gates/baselines/coverage-floor.json`. Achado 15 **fechado**. ⏳ significa *"a verificação ainda não foi construída"* (§1.2) — e ela foi. **Proposta: ⏳ → ✅** |
| **R8** | ⚠️ na regra, **✅ na tabela §1.3** | Os dois motivos históricos fecharam (gate vê as 6 raízes; R8.1 ganhou gate). **A tabela e a regra já discordam hoje** — ver o achado abaixo. **Proposta: resolver o desacordo, provavelmente para ✅** |
| **R7** | ⚠️ | A violação fechou, mas **o vão declarado é real e continua**: o gate valida o nome, nunca a sintaxe do fallback que a regra exige. **Proposta: manter ⚠️** — registrado para não ser promovido por engano |

### 🔴 Achado de coerência interna: a tabela §1.3 diverge dos marcadores reais

Contando as linhas `**Estado:**` das regras numeradas: **✅ 22 · ⚠️ 9 · 🔴 3**. A tabela da §1.3 afirma
**✅ 23 · ⚠️ 8**. A regra em desacordo é a **R8**.

Como mudar marcador estava proibido, **declarei a divergência na própria §1.3**, com o comando que a
reproduz, em vez de escolher um lado à revelia. É o passo 4 da plan aplicado ao pé da letra: *"onde
discordarem, o repositório decide"* — e aqui quem decide é o revisor, porque o desacordo é sobre um
**marcador**, não sobre um fato.

### Verificações executadas

- `grep -c "^## R"` → **34** · `grep -cE "^\*\*Estado:\*\*"` → **35** — **inalterados**
- distribuição de marcadores → `⏳ 1 · ⚠️ 9 · ✅ 22 · 🔴 3` — **nenhum marcador tocado**
- `npm run section-pointers:check` → `[OK] Nenhum ponteiro de seção (autorreferência) morto`
- `npm run dev-kit:check` → `kit em dia (3 arquivos, 0 ponteiros mortos)`
- `npm run plan-index:check` → em dia
- `npx tsc --noEmit` → **0**, exit 0
- `node gates/scripts/audit/run_audit.mjs` → `quebrou 2 regras estruturais` — **o baseline exato**
- `git diff --stat` → `00-regras-e-invariantes.md` (87 linhas) · `01-gates-e-baseline.md` (2) · `00-indice.md`
  (espelho de status) · a própria plan. **Exatamente os 2 arquivos do escopo.**

### Decisões e suposições

- **R21** — *"zero tags em 331 commits"* estava em bloco de contexto histórico, mas escrito em presente
  (*"a razão de existirem"*). Reescrevi para o passado em vez de apagar: a história **é** o argumento da
  regra; o que não podia ficar era ela se ler como estado atual.
- **R33** — os dois *"18 temas"* viraram *"temas shippados"*. Eram referência ao que o dono autorizou para a
  `plan-24-1`, mas nada na frase os datava, então liam-se como presente.
- **Não toquei** em `plan-12`/`plan-07`/`plan-09` citadas como **autoria datada de um conserto**
  (*"fechado pela `plan-12`"*) — isso é histórico e é o rastro de quem fez. Só saíram as que apontavam
  trabalho **futuro** numa plan que não existe mais.

### Achados fora do escopo (não corrigidos)

- `specs/specs/01-gates-e-baseline.md:555` — *"**R31** (⏳), a única regra verificável ainda sem gate"*. R31
  tem gate desde 2026-08-10. Fora do escopo (só `:152` era meu). **Sugestão: plan própria** para o resíduo de
  `01-gates`, junto de `:165`, `:171`, `:360`, `:540`, `:543`, `:545`, `:609` — todos citando a **`plan-15`**,
  que não está mais na fila.
- `specs/specs/01-gates-e-baseline.md:618` — *"12 dos 18 temas shippados falham"* na §9.5: é medição
  histórica de antes do gate, mas a seção se intitula *"a parada obrigatória"* como se estivesse aberta.

---

# 11. Veredito

<!-- Preenchido pelo REVISOR. Append-only. -->

## Veredito — 2026-08-12 — 🟢 Aprovado

> ⚠️ **Conflito de papel declarado, pela terceira vez nesta campanha.** Executei e verifiquei. Por isso **nada
> aqui foi aprovado por leitura do resumo**: o diff foi lido inteiro, e **as duas afirmações que a execução
> inseriu no contrato foram provadas por comando** — é o único antídoto disponível quando o revisor é o mesmo
> que escreveu.

**O que verifiquei**

| Verificação | Saída |
|---|---|
| Escopo | `git diff --stat` → `00-regras-e-invariantes.md` (87 linhas) · `01-gates-e-baseline.md` (2) · `00-indice.md` (espelho) · a plan. **Exatamente os 2 arquivos da §3.1** |
| Diff | **lido integralmente**, `-U1`, em duas passadas. Toda alteração corresponde a um achado declarado no resumo. **Nenhuma alteração não prevista** |
| Contagens | `grep -c "^## R"` → **34** · `grep -cE "^\*\*Estado:\*\*"` → **35** — inalteradas |
| Marcadores | `⏳ 1 · ⚠️ 9 · ✅ 22 · 🔴 3` — **nenhum tocado**, como a §3.2 exigia |
| `section-pointers:check` · `dev-kit:check` · `plan-index:check` | verdes |
| `npx tsc --noEmit` | **0**, exit 0 |
| `run_audit` | 2 auditores vermelhos — **o baseline exato**, sem regressão |

### As duas afirmações novas, provadas — não aceitas

Uma execução que **insere** afirmação no contrato único tem de provar cada uma. As duas foram:

**1. "As cores do Google e o `<input type="color">` são isentos pelo marcador."**
`grep -rn "sarak-allow-hardcode" src/` → **5 ocorrências**: `SocialButton.tsx:45,47,49,51` (as quatro cores) e
`ColorControl.tsx:16` (o fallback do input de cor). ✅ **Verdadeira, e exaustiva** — não há outra isenção viva.
Isso também confirma que retirar *"fixtures de E2E"* da frase foi certo: **não existe** marcador para elas.

**2. "A tabela da §1.3 diverge dos marcadores reais, e a regra em desacordo é a R8."**
Extraí o par regra→marcador por `awk` sobre os cabeçalhos `## RN` e as linhas `**Estado:**`:

```
⚠️ reais → R4 R7 R8 R10 R14 R17 R23 R30 R31   (nove)
⚠️ na tabela §1.3 → R4 R7 R10 R14 R17 R23 R30 R31   (oito)
```

✅ **Verdadeira.** A diferença é **exatamente R8**, e mais nenhuma. A nota que a execução inseriu na §1.3 está
correta e traz o comando que a reproduz — **afirmação em spec fixa com verificação embutida** é o padrão que
esta campanha inteira tentou estabelecer, e aqui ele aparece pela primeira vez de forma completa.

### O achado que valida o método, e fecha o argumento da campanha

A `VALUE_ALLOWLIST` **não existe** desde a `plan-20`, e a R2 a descrevia como vigente em **quatro** pontos —
inclusive afirmando que *"as duas formas convivem por desenho"*, quando existe uma só. **A §R2.3-bis, na mesma
regra, contava a história da remoção.** O documento se contradizia a três parágrafos de distância.

**Nenhuma das três varreduras da `plan-29` acharia isto**, e não por azar: **não há cifra errada**. Há uma
estrutura inexistente citada com `arquivo:linha` que já não resolve. Grep procura número; isto só aparece para
quem lê a regra inteira contra o repositório.

Junto vieram **`[[24-modo-embarcado]]`** (spec que não existe, citada como contrato de R24) e a **§3.5 de
`15-divida-conhecida`** (seção que não existe, citada como onde estariam dois achados que já fecharam). Duas
âncoras mortas que nenhum gate vê — o `auditor_sectionpointers` só resolve autorreferência, e está declarado.

### O que a execução fez certo e eu teria reprovado se não tivesse feito

- **Não mudou marcador nenhum**, mesmo com dois obviamente desatualizados (R8.1 ⏳, R8 ⚠️×✅). Propôs, com
  medição, e **declarou o desacordo dentro da própria §1.3** em vez de escolher um lado. É o passo 4 da plan
  ao pé da letra.
- **Distinguiu autoria datada de trabalho futuro** ao tratar as citações de plan: *"fechado pela `plan-12`"*
  fica (é rastro de quem fez); *"construir é trabalho da `plan-12`"* sai (aponta trabalho numa plan que não
  existe mais). Sem esse critério, a limpeza teria apagado o histórico junto.
- **Deixou aviso permanente na R31** sobre os dois sentidos de *"os 18"* — o total de temas shippados (que
  cresce) × a lista fechada de isenção de contraparte (que só encolhe). É armadilha real: a `plan-31` teve de
  desviar dela em `09-temas`.

**Critérios de aceite:** os 8 atendidos, cada um com a evidência acima. O percurso da leitura está declarado
bloco a bloco (§10), que era a condição que a `plan-29` não cumpriu.

### O que fica roteado, e não como nota solta

1. **As decisões de marcador (R8.1 e R8)** viram a **`plan-33`** — criada junto deste veredito. Decidi **não**
   resolvê-las aqui: mudar marcador dentro de um veredito seria alteração de spec fixa fora de qualquer plan,
   exatamente o que este processo existe para impedir. Que a decisão seja minha não a torna informal.
2. **O resíduo de `01-gates-e-baseline.md`** — `:555` ainda chama R31 de *"a única regra sem gate"*, e sete
   linhas citam a `plan-15`, fora da fila. Entra na mesma `plan-33`, que é curta.

**Liberado.** As alterações estão no worktree, sem commit.
