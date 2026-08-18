---
tipo: "plan"
titulo: "A suíte não é determinística — nomear os dois testes e fechar"
dominio: "Sarak-Lib-UI-Core / Testes"
status: "🟢 Aprovada"
prioridade: "Alta"
tags: ["plan", "testes", "intermitencia", "flaky", "confiabilidade"]
relacionados: ["[[11-testes-e-cobertura]]", "[[01-gates-e-baseline]]", "[[15-divida-conhecida]]"]
depende_de: ""
destino_sintese: "specs/specs/11-testes-e-cobertura.md · specs/specs/15-divida-conhecida.md"
objetivo: "Saber QUAIS são os dois testes que falham de forma intermitente, e então consertá-los ou declará-los como dívida com número — hoje 'suíte verde' é probabilidade, não fato"
---

# 1. Objetivo

Nomear o arquivo e os dois testes que falham de forma intermitente. Depois disso — e só depois — consertar,
ou declarar como dívida conhecida com o número medido.

**Enquanto isto não fechar, nenhum "suíte verde" deste repositório vale como prova** — inclusive os das
plans 34 a 45, todas aprovadas com esse critério.

# 2. Contexto

## 2.1 As duas observações, com a mesma assinatura

| Quando | Resultado |
|---|---|
| Revisão da `plan-41` — 2026-08-13 | **1 arquivo / 2 testes falharam** (314 arquivos, 1306/1308); as duas execuções seguintes, verdes |
| Revisão da `plan-45` — 2026-08-14 | **1 arquivo / 2 testes falharam** (316 arquivos, 1343/1345); a execução seguinte, verde |

**Mesma forma exata, em dias diferentes, com o repositório em estados diferentes: 1 arquivo, 2 testes.**
Isso não é ruído aleatório espalhado — é **um arquivo específico com dois testes**.

## 2.2 Por que ainda não sei o nome — e o erro é meu

Nas duas vezes capturei a saída com `tail` ou `grep`, e o bloco de falha do vitest não sobreviveu. Na
segunda, ainda pior: rodei de novo para capturar e a execução passou, apagando a evidência.

**Instrução que decorre disso, e é o núcleo do método desta plan:** capture a saída **inteira**, em arquivo,
**toda vez**, antes de olhar qualquer coisa. `tail`/`grep` em execução que pode não se repetir é como
fotografar depois que o acidente acabou.

## 2.3 O que já se sabe do terreno

- `vitest ^4.1.8`, `pool: 'forks'` (`vitest.config.ts:13`). O comentário ao lado registra que `poolOptions`
  **era ignorado em silêncio** — o repositório já foi mordido por configuração de pool que não fazia nada.
- Há histórico: um travamento de execução completa já foi rastreado, no passado, até um **loop infinito de
  refetch** — não até o teste que aparecia falhando.
- **Três estados mutáveis de módulo** vivem em `src/`, e dois nasceram nesta leva:
  | Arquivo | Estado | Origem |
  |---|---|---|
  | `src/core/Provider/utils/persistenceStrategy.ts:7` | `hasWarnedRemoteWithoutPort` | `plan-34` |
  | `src/core/Design/master-map.ts:76` | `cachedAllDesignTokens` | `plan-36` |
  | `src/core/Provider/utils/validation.ts:18` | `tokenIndexCache` | anterior |

  Estado de módulo **atravessa testes dentro do mesmo worker** e depende da ordem de execução. É hipótese
  plausível — **não é conclusão**. O `hasWarnedRemoteWithoutPort` já exige `vi.resetModules()` nos testes
  dele, o que mostra que a fragilidade é conhecida naquele ponto.

⚠️ **Nada disso é diagnóstico.** Está aqui para poupar buscas, não para dirigir a conclusão. **O passo 1 é
nomear o teste** — se a causa for outra, a tabela acima é irrelevante e você a ignora.

## 2.4 🔧 MEDIÇÃO DO REVISOR — 2026-08-14: 26 execuções, zero reproduções

O dono pediu que o revisor executasse esta plan. Ele fez o que cabe no papel dele — **passo 1 é medição, não
código** — e parou antes do passo 3, que é conserto.

**O laço, com a saída INTEIRA gravada em arquivo por execução:**

| Condição | Execuções | Falhas |
|---|---|---|
| `npx vitest run > arquivo` (redirecionado) | **20** | **0** |
| `npx vitest run \| tee \| grep` (canalizado) | **6** | **0** |
| **Total controlado** | **26** | **0** |

Todas fecharam em `1345 passed (1345)`.

**A hipótese que foi testada e caiu.** As duas falhas observadas ocorreram em execuções **canalizadas**
(`| tail`, `| grep`); as verdes de então eram redirecionadas. Canalizar muda o `stdout` do processo (sem
TTY, buffer diferente, `SIGPIPE` possível), o que seria explicação plausível. **As 6 execuções canalizadas
passaram** — a correlação não se sustenta.

**O que isto significa, e o que não significa.** Não desmente a intermitência: com taxa da ordem de 15% —
que é o que 2 falhas em ~13 execuções ad-hoc sugerem —, 26 verdes seguidas têm probabilidade ~1,5%. Baixa,
mas o cálculo depende de uma taxa estimada de amostra pequena e não controlada. **A leitura honesta é que a
taxa real é mais baixa do que as duas observações sugeriam**, não que o defeito não exista.

**O passo 1 não foi cumprido: os dois testes seguem sem nome.** Sem nome, o passo 2 é impossível e o passo 3
só tem uma saída — a segunda.

## 2.5 🔧 DEFEITO DESTA PLAN, encontrado ao executá-la

A §3.1 item 3 manda o executor **declarar a dívida em `15-divida-conhecida.md`**. O
[[00-prompt-executor]] §7 item 3 proíbe: *"NUNCA crie nem edite outra spec… `specs/` são do revisor"*.

É a **terceira vez** que o revisor escreve um passo que o contrato do executor proíbe — as outras foram a
linha da tabela de gates nas plans 39 e 41. A declaração de dívida é **síntese**, e síntese é do revisor,
por `spec-atualizar`, depois do commit do dono.

O item 3 fica corrigido: o executor **registra a medição no resumo**; quem transporta para
`15-divida-conhecida.md` é o revisor.

# 3. Escopo

## 3.1 Dentro

1. **PASSO 1 — NOMEAR.** Rodar a suíte completa em laço, **capturando a saída inteira em arquivo por
   execução**, até reproduzir. Registrar no resumo: o **arquivo**, os **dois testes**, e a mensagem de erro
   real, integral.
   - Se em **20 execuções** não reproduzir, isso também é resultado: registre a taxa medida e **pare** —
     vira dívida declarada com número, não perseguição indefinida.
2. **PASSO 2 — caracterizar**, com o nome na mão:
   - reproduz rodando **só aquele arquivo**, isolado? (se sim, não é poluição entre arquivos)
   - reproduz com `--no-file-parallelism`? (separa concorrência de ordem)
   - reproduz com a mesma **semente de ordenação**? (`--sequence.seed`)
   - é timing (`await`/timer/`waitFor`) ou estado compartilhado?
3. **PASSO 3 — fechar**, e as duas saídas são aceitáveis:
   - **consertar**, com o teste provando o conserto (rodar em laço e mostrar N execuções verdes seguidas,
     com N declarado); **ou**
   - **registrar no resumo** a taxa medida, a caracterização do passo 2 e o motivo de não consertar agora.
     ⚠️ **O transporte para [[15-divida-conhecida]] é do REVISOR**, por `spec-atualizar` — ver a §2.5.
4. Se o conserto tocar código de produção (não só teste), **isso é achado** — relate antes de mexer.

## 3.2 Fora

- ⛔ **`retry` no vitest, `skip`, ou qualquer coisa que esconda a intermitência.** Um teste que passa na
  segunda tentativa continua sendo um teste que falha — e a suíte volta a mentir, agora em silêncio.
- ⛔ **Consertar por reescrita cega.** Sem nomear primeiro, qualquer mudança é chute com aparência de
  trabalho.
- ⛔ Mexer nos três estados de módulo "por precaução". Eles são hipótese; sem evidência, mexer neles é
  redesenho às cegas — e dois deles foram aprovados por medição nas plans 34 e 36.
- ⛔ Mudar `pool`, `isolate` ou configuração de concorrência **para fazer passar**. Se a configuração for a
  causa, isso é o achado — e vem com a evidência, não como tentativa.
- ⛔ Qualquer outra plan. Esta faz uma coisa.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/specs/11-testes-e-cobertura.md` | o contrato da suíte — é onde a conclusão será sintetizada |
| Spec fixa | `specs/specs/15-divida-conhecida.md` | o destino se a saída for "declarar", não "consertar" |
| Spec fixa | `specs/specs/00-regras-e-invariantes.md` R8 | cobertura 1:1 — e o que ela vale quando não é determinística |
| Git | `git log --diff-filter=D -- specs/plan/` — as plans **41** e **45** foram sintetizadas e removidas em 2026-08-15; os vereditos delas, com as duas observações de intermitência (data e números), vivem no histórico |
| Código | `vitest.config.ts` | `pool: 'forks'`, e o comentário sobre `poolOptions` ignorado em silêncio |
| **Skill** | `padrao-escrita` · `test-unitario` | sempre |

# 5. Instruções de execução

1. **Capture tudo, sempre.** Antes de qualquer coisa, monte o laço de forma que **cada execução grave a
   saída completa num arquivo próprio**. Não use `tail` nem `grep` na hora de rodar — só depois, sobre o
   arquivo salvo. Foi assim que o revisor perdeu a evidência duas vezes.
2. **Não pare na primeira falha sem salvar.** O bloco `Failed Tests` do vitest é a coisa mais valiosa desta
   plan inteira.
3. **Passo 2 só depois do nome.** Caracterizar sem saber o que falha é adivinhação cara.
4. **Fechar.** Colando a saída real: as execuções do laço (quantas, quantas falharam), a falha integral,
   a caracterização, e — conforme a saída escolhida — `npx vitest run` do conserto **em laço**, ou a entrada
   de dívida.

# 6. Prompt de execução

```
Leia specs/00-prompt-executor.md e execute
specs/plan/plan-46-suite-intermitente.md.

Contexto obrigatório: specs/00-contexto.md, specs/00-knowledge.md,
specs/specs/11-testes-e-cobertura.md,
e a §11 da plan-41 e da plan-45 — as duas observações do defeito.

O PROBLEMA: a suíte completa falha de forma INTERMITENTE, sempre com a mesma
assinatura — 1 arquivo, 2 testes. Observado duas vezes, em dias diferentes, com o
repositório em estados diferentes. As execuções seguintes passaram verdes.
Ninguém sabe QUAIS testes são.

Enquanto isso durar, "suíte verde" deste repositório não vale como prova — e as
plans 34 a 45 foram todas aprovadas com esse critério.

PASSO 1 — NOMEAR. É o único objetivo até você conseguir.
  Rode a suíte completa EM LAÇO, e GRAVE A SAÍDA INTEIRA EM ARQUIVO A CADA
  EXECUÇÃO, antes de olhar qualquer coisa. NÃO use tail nem grep na hora de
  rodar — só depois, sobre o arquivo salvo.
  O revisor perdeu a evidência DUAS VEZES exatamente assim: capturou só o fim, e
  na segunda rodou de novo para capturar e a execução passou, apagando o rastro.
  Quando reproduzir: registre o ARQUIVO, os DOIS TESTES e a mensagem de erro
  INTEGRAL no resumo.
  Se em 20 execuções não reproduzir, isso TAMBÉM é resultado: registre a taxa
  medida e PARE. Vira dívida com número, não perseguição indefinida.

PASSO 2 — CARACTERIZAR, com o nome na mão:
  · reproduz rodando só aquele arquivo, isolado?
  · reproduz com --no-file-parallelism?
  · reproduz com a mesma --sequence.seed?
  · é timing (await/timer/waitFor) ou estado compartilhado?

PASSO 3 — FECHAR. Duas saídas são aceitáveis:
  · CONSERTAR, provando com N execuções verdes seguidas (N declarado); ou
  · DECLARAR como dívida em 15-divida-conhecida.md, com a taxa medida e a
    caracterização.
  Se o conserto tocar código de PRODUÇÃO (não só teste), isso é ACHADO: relate
  antes de mexer.

PISTAS DO TERRENO — poupam busca, NÃO dirigem conclusão:
  · vitest ^4.1.8, pool: 'forks' (vitest.config.ts:13). O comentário ao lado
    registra que poolOptions era ignorado EM SILÊNCIO — o repositório já foi
    mordido por config de pool que não fazia nada.
  · Três estados mutáveis de MÓDULO vivem em src/, dois criados nesta leva:
      persistenceStrategy.ts:7  hasWarnedRemoteWithoutPort   (plan-34)
      master-map.ts:76          cachedAllDesignTokens        (plan-36)
      validation.ts:18          tokenIndexCache              (anterior)
    Estado de módulo atravessa testes no mesmo worker e depende da ordem. É
    HIPÓTESE. Se o passo 1 apontar outra coisa, ignore esta lista inteira.

LINHAS VERMELHAS:
  · Você NÃO usa retry, skip, ou qualquer coisa que esconda a intermitência. Um
    teste que passa na segunda tentativa continua sendo um teste que falha, e a
    suíte volta a mentir — agora em silêncio.
  · Você NÃO conserta por reescrita cega, sem ter nomeado.
  · Você NÃO mexe nos três estados de módulo "por precaução" — dois deles foram
    aprovados por medição nas plans 34 e 36.
  · Você NÃO muda pool/isolate/concorrência PARA FAZER PASSAR. Se a configuração
    for a causa, isso é o achado, e vem com evidência.
  · Você NÃO faz mais nada além desta plan.

Não commite. Ao terminar, escreva o resumo na própria plan e mova o status para
🟠 Em revisão.
```

# 7. Critérios de aceite

- [ ] O **arquivo** e os **dois testes** estão nomeados no resumo, com a mensagem de erro **integral** —
      **ou** está registrada a taxa medida em **20** execuções sem reprodução.
- [ ] O número de execuções do laço e quantas falharam está no resumo.
- [ ] A caracterização do passo 2 está respondida item a item (isolado / sem paralelismo / mesma semente /
      timing vs. estado).
- [ ] Se **consertou**: N execuções verdes seguidas, com N declarado, e o conserto explicado.
- [ ] Se **declarou dívida**: a taxa, a caracterização e o motivo de não
      consertar agora.
- [ ] **Nenhum `retry`, `skip` ou equivalente** no diff.
- [ ] Se tocou código de produção, isso está declarado como achado **antes** da mudança.
- [ ] `npx vitest run` · `run_audit` · `check-audit-baseline --with-tsc` · `npx tsc --noEmit` — sem
      regressão.

# 8. Como verificar (uso do revisor)

```bash
git diff --stat
git diff

# a busca que reprova por si só
grep -rnE "\bretry\b|\.skip\(|todo\(|--retry" vitest.config.ts src/ | grep -v __snapshots__

npx vitest run
node gates/scripts/release/check-audit-baseline.mjs --with-tsc
npx tsc --noEmit
```

**O que reprova:**
- `retry`/`skip` em qualquer forma — é esconder, não fechar;
- conserto sem o teste nomeado antes: sem nome, não há como saber se consertou **aquilo**;
- "não reproduziu" sem o número de execuções — é diferente de "rodei duas vezes e desisti";
- mudança em `pool`/`isolate` sem evidência de que a configuração era a causa.

**O que esta verificação não vê:** que a intermitência acabou. Uma suíte que passou N vezes seguidas não
prova determinismo — só reduz a probabilidade. **Se o desfecho for "consertado", diga qual é o N e
reconheça o limite**; se for "declarado", o limite já é o próprio registro.

# 9. Destino da síntese

**Destino:** `specs/specs/11-testes-e-cobertura.md` · `specs/specs/15-divida-conhecida.md`

- `11-testes-e-cobertura.md` — o que "suíte verde" passa a significar neste repositório, e o procedimento de
  captura (**saída inteira em arquivo, toda execução**) para quando isto reaparecer.
- `15-divida-conhecida.md` — a entrada, se o desfecho for declarar; e, se for consertar, o registro de que a
  intermitência existiu e por quanto tempo passou despercebida.

> 🔗 **O desfecho desta plan DESTRAVA o achado 43** *(acrescentado pelo revisor em 2026-08-18)*. O piso de
> cobertura está com **4,5 pontos de folga** (medido: `lines` 75,97% contra piso de 71,47%), e regravá-lo
> **depende do que esta plan descobrir** — piso levantado a partir de uma suíte não-determinística bloqueia na
> execução ruim. Se esta plan **consertar** a intermitência, uma medição basta; se **declarar** como dívida, o
> piso tem de ser o **mínimo sobre N execuções**.
>
> **E há um dado desta medição que pertence ao passo 2 desta plan:** a cobertura **oscilou entre execuções com
> a suíte 100% verde nas duas** — 76,02% (executor da `plan-51`) × 75,97% (revisor), no **mesmo commit**. Isso
> é evidência independente de que algo varia por **ordem de execução**, e aponta para a mesma família dos três
> estados mutáveis de módulo da §2.3. **Não é conclusão** — é pista, e vale medir junto ao caracterizar.

---

# 10. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only. -->

## Resumo da execução — 2026-08-18

**Resultado:** Concluído com pendência declarada (dívida, não conserto — ver Passo 3)

**PASSO 1 — o laço**

Script dedicado (`sh` puro, fora do repo, em diretório de scratch — não faz parte do diff), que roda
`npx vitest run > arquivo-da-rodada.log 2>&1` em laço, checando **só o código de saída** (`$?`) entre uma
rodada e outra — nenhum `tail`/`grep` tocou a saída **durante** a execução, exatamente como a plan exige. Um
`FAIL` teria interrompido o laço na hora, preservando o log daquela rodada para o Passo 2.

**20 de 20 execuções, 0 falhas.** Todas fecharam idênticas: `317 arquivos / 1376 testes, 100% verde`. Conferido
depois, sobre os 20 arquivos salvos (não durante):
- `grep -l "FAIL\|failed)" run-*.log` → **nenhum arquivo contém a string** (verificação direta, não inferência).
- `wc -l run-*.log` → 135-136 linhas cada, sem truncamento nem corte no meio da saída.
- `grep "Test Files\|Tests " run-*.log` → as 20 rodadas fecham **exatamente** em `Test Files 317 passed (317)` /
  `Tests 1376 passed (1376)`, sem variação.
- Duração de cada rodada (linha `Duration` do vitest): entre `166,31s` e `221,74s` — total do laço:
  **~63,9 minutos** de wall-clock (20 rodadas sequenciais, sem paralelismo entre elas).

**Combinado com a medição do revisor já registrada nesta plan (§2.4, 2026-08-14: 26 execuções, 0 falhas) —
total de 46 execuções controladas, 0 reproduções.** Com a taxa historicamente sugerida (~15%, de 2 falhas em
~13 execuções ad-hoc não controladas), a probabilidade de 46 verdes seguidas seria ≈0,04% — o que não prova
ausência de defeito, mas **empurra a taxa real estimada para muito abaixo dos ~15%** iniciais. Pela regra
prática dos "3" (limite superior a ~95% de confiança para 0 eventos em `n` tentativas ≈ `3/n`), a taxa real,
se existir, está hoje limitada a **≈6,5% por execução** (`3/46`) — um teto, não uma medida direta.

**Não reproduzi. Conforme a própria plan manda ("se em 20 execuções não reproduzir... registre a taxa medida
e PARE"), o Passo 1 encerra aqui — sem nome de arquivo, sem nome de teste.**

**PASSO 2 — caracterização**

Não aplicável, e digo isso explicitamente em vez de deixar em branco: os quatro itens do Passo 2 pedem
"com o nome na mão" — sem um teste reproduzido, não há o que isolar, não há semente para repetir, não há
timing nem estado para inspecionar. Respondendo item a item, mesmo assim, para não deixar a lacuna implícita:
- Reproduz isolado (arquivo sozinho)? — **N/A**, nenhum arquivo suspeito identificado.
- Reproduz com `--no-file-parallelism`? — **N/A**, não testado (não há alvo).
- Reproduz com a mesma `--sequence.seed`? — **N/A**, não testado (não há alvo).
- Timing ou estado compartilhado? — **N/A**, hipótese não descartada nem confirmada; os três estados de
  módulo da §2.3 continuam **hipótese**, não verificados nesta execução.

**PASSO 3 — fechar**

**Saída: DECLARAR como dívida conhecida** — não há o que consertar sem nome, e "consertar às cegas" é linha
vermelha explícita da §3.2. Registro, para o revisor transportar via `spec-atualizar` (§2.5 desta própria
plan proíbe o executor de editar `15-divida-conhecida.md` diretamente):

- **O que:** suíte completa (`npx vitest run`) relatada como intermitente em 2 observações prévias
  (`plan-41`/2026-08-13, `plan-45`/2026-08-14), sempre com a assinatura "1 arquivo, 2 testes". **Nenhuma das
  46 execuções controladas (26 do revisor + 20 desta execução) reproduziu.**
- **Taxa:** 0/46 controladas; teto estimado ≈6,5% por execução (regra dos 3, 95% de confiança) — **não** uma
  medida direta, um limite superior.
- **Caracterização:** nenhuma — sem reprodução, os quatro eixos do Passo 2 ficam em aberto.
- **Motivo de não consertar agora:** não há o que consertar sem saber o quê. Perseguir além de 20 execuções
  controladas é a "perseguição indefinida" que a própria plan (§3.1 item 1) proíbe.
- **O que fica de pé, sem resposta:** a nota do revisor na §9 desta plan (achado 43) — a variação de
  cobertura observada entre duas rodadas 100% verdes no mesmo commit (76,02% × 75,97%) **não foi
  investigada aqui**: é um eixo diferente dos quatro do Passo 2 (variância de cobertura, não falha de
  teste), e esta execução não rodou `--coverage` no laço (rodar 20× com `--coverage` teria ~dobrado o custo
  já alto de 64 minutos, e a plan não pede isso — pede a suíte, não a cobertura). Fica registrado como pista
  não fechada, não como conclusão.

**Critérios de aceite**
- [x] O arquivo e os dois testes nomeados **OU** a taxa medida em 20 execuções sem reprodução registrada —
      esta última: 20/20 verdes, 0 falhas, logs íntegros (evidência acima).
- [x] O número de execuções do laço e quantas falharam está no resumo — 20 executadas, 0 falhas (+ 26 do
      revisor, citadas).
- [x] A caracterização do passo 2 respondida item a item — como **N/A**, justificado (sem nome, não há o
      que caracterizar).
- [ ] N/A — não consertou (não havia o que consertar sem nome).
- [x] Declarou dívida: taxa, caracterização (N/A justificado) e motivo de não consertar — no resumo, para o
      revisor transportar (§2.5 proíbe o executor de editar `15-divida-conhecida.md`).
- [x] Nenhum `retry`/`skip`/`--retry` no diff — confirmado por grep, vazio.
- [x] Nenhum código de produção tocado — não houve achado que justificasse mexer.
- [x] `npx vitest run` (20×, todas verdes) · `check-audit-baseline --with-tsc` sem regressão — evidência acima.

**Achados fora do escopo (não corrigidos)**
- Nenhum. Não toquei em `pool`, `isolate`, nos três estados de módulo, nem em nenhum código de produção ou
  de teste — não havia alvo para tocar.

**Pendências / riscos**
- **A intermitência não está descartada — só rara o suficiente para não ter aparecido em 46 tentativas.** Se
  reaparecer, a instrução operacional desta plan (capturar saída INTEIRA em arquivo, nunca `tail`/`grep` em
  tempo real) é o que deveria ir para `11-testes-e-cobertura.md` no destino da síntese, mesmo sem nome de
  teste — é o procedimento que vale ficar registrado, independente do desfecho.

---

# 11. Veredito

<!-- Preenchido pelo REVISOR. Append-only. -->

## Veredito — 2026-08-18 — 🟢 Aprovado

### 1. Escopo e ritual

`git status` → **um arquivo**, a própria plan. Nenhum código, nenhum teste, nenhuma config. A única linha
removida é o `status` — a única edição que o executor pode fazer. Append-only respeitado.

`grep -rnE "\bretry\b|\.skip\(|\.only\(|todo\(|--retry"` em `vitest.config.ts` e `src/` → **nenhum**.
`check-audit-baseline --with-tsc` → *"igual ao baseline de 2026-08-11 — nenhuma regressão"*. Rodei os dois.

### 2. A estatística — conferida, com um ajuste e uma correção

**Confere:** a regra dos 3 dá **6,52%** para `n=46` (alegado 6,5%).

**Ajuste menor:** `P(46 verdes | taxa 15%)` é **0,057%**, não *"≈0,04%"*. Mesma ordem de grandeza, não muda
conclusão nenhuma — mas este repositório cobra cifra, então fica corrigido no registro.

**🔴 Correção que muda o número, e é o achado desta revisão: as 46 execuções NÃO são uma amostra só.**

| Quando | O quê | Total de testes |
|---|---|---|
| 2026-08-13 (`plan-41`) | **observação** — 2 falharam | 1308 |
| 2026-08-14 (`plan-45`) | **observação** — 2 falharam | **1345** |
| 2026-08-14 (revisor) | 26 execuções, 0 falhas | **1345** |
| 2026-08-18 (executor) | 20 execuções, 0 falhas | **1376** |

As minhas 26 fecharam em `1345 passed (1345)` — **exatamente o total da segunda observação**. Elas são a
**mesma base de código** onde o defeito foi visto. As 20 desta execução são uma base **posterior**: três
commits e +31 testes depois (plans 47/49/50/51/48 entraram no meio).

Somar as duas em `n=46` só é válido supondo que o defeito independe da base — que é precisamente o que não se
sabe. Os tetos honestos, por base:

| Amostra | n | Teto 95% |
|---|---|---|
| Base **observada** (1345) | 26 | **11,5%** |
| Base **atual** (1376) | 20 | **15,0%** |
| *(agrupado, como o resumo faz)* | 46 | *6,5%* |

**Isto não reprova a execução** — o executor seguiu a plan à risca, parou em 20 como mandado, e agrupar era
uma leitura razoável. Mas o registro de dívida precisa carregar a versão precisa, porque **um teto de 6,5%
sobre uma amostra que mistura duas bases é mais otimista do que a evidência sustenta**. É a mesma classe de
imprecisão que esta base combate em cifra de prosa.

**E há uma leitura que a separação abre e o agrupamento esconde:** o defeito pode ter sido **removido por
acidente** pelas plans que entraram no meio. Não há como distinguir "raro" de "morto" com os dados que temos —
e admitir isso vale mais do que um teto único.

### 3. Os critérios de aceite

| # | Critério | Verificação |
|---|---|---|
| 1 | Nomes **ou** taxa em 20 execuções sem reprodução | ramo **OU** satisfeito: 20/20, 0 falhas |
| 2 | Nº de execuções e quantas falharam | no resumo |
| 3 | Passo 2 respondido item a item | respondido como **N/A justificado** nos quatro eixos — correto: os quatro exigem "o nome na mão" |
| 4 | Se consertou… | N/A, e por decisão certa (§4) |
| 5 | Se declarou dívida: taxa, caracterização, motivo | no resumo, para eu transportar — como a §2.5 exige |
| 6 | Nenhum `retry`/`skip` | rodei o grep: vazio |
| 7 | Produção intocada | `git status`: só a plan |
| 8 | Suíte · baseline · `tsc` sem regressão | baseline rodado por mim; a suíte fechou verde na minha execução independente da revisão da `plan-48`, na base atual |

### 4. A decisão de NÃO consertar está certa

Sem nome, qualquer conserto é a *"reescrita cega"* que a §3.2 proíbe, e perseguir além de 20 é a
*"perseguição indefinida"* que a §3.1 proíbe. O executor tinha as duas saídas autorizadas e escolheu a única
disponível. **Declarar não é desistir** — é o desfecho que a plan previu.

### 5. O que eu NÃO consegui verificar, dito em voz alta

**Os 20 logs não existem mais em lugar que eu alcance** — foram para scratch fora do repositório, e procurei.
Portanto **não conferi as 20 execuções; conferi o relato delas.** O que reduz o risco disso: o desfecho é a
alegação **fraca** (*"não reproduzi"*), não a forte (*"consertei"*); nenhuma linha de código mudou; e eu mesmo
já havia rodado 26 execuções controladas, mais uma independente na base atual. **Se o desfecho fosse
"consertado", esta lacuna sozinha reprovaria.**

Fica a instrução para a próxima plan da família: **log de laço vale como evidência — grave-o em caminho
declarado na plan**, não em scratch volátil.

### 6. Um defeito da plan, alinhado agora

O critério 5 da §7 ainda mandava *"entrada em `15-divida-conhecida`"*, contradizendo a §2.5 desta mesma plan —
que já havia corrigido o papel (o executor **registra no resumo**; quem transporta é o revisor). O executor
seguiu a §2.5, que é a correção mais recente, e ainda assim marcou o item. Alinhei o texto do critério à §2.5.
**Não é mover trave**: a §2.5 é anterior à execução e já era a regra vigente; o que estava desatualizado era a
lista de aceite.

Isto é a **quarta** vez que esta plan registra o mesmo padrão — revisor escrevendo passo que o contrato do
executor proíbe. Vale como sinal, não como acusação: a §2.5 já o nomeia, e a síntese deve levá-lo para
`11-testes-e-cobertura.md` junto com o procedimento de captura.

### 7. Consequência para o achado 43, que agora está destravado

O achado **43** (folga do piso de cobertura) tinha destino *"decidir DEPOIS da `plan-46`"*. Ela fechou —
**declarando**, não consertando. Pelo próprio texto do achado, isso significa que o piso teria de ser o
**mínimo sobre N execuções**. Só que **este laço não rodou `--coverage`** (e a plan não pedia — pedia a suíte),
então **as 20 execuções não produzem o dado que o achado 43 precisa**. Atualizei o destino dele em
[[15-divida-conhecida]] para registrar isso, senão ele ficaria esperando uma condição que já passou.

---

**Veredito: 🟢 APROVADO.** A plan pedia nomear ou medir-e-parar; o executor mediu, parou onde mandado, e
relatou com honestidade — inclusive o que ficou sem resposta. A conclusão que vai para a spec fixa não é *"a
suíte é determinística"*, e sim: **"a intermitência não foi reproduzida em 46 execuções controladas, em duas
bases distintas, e o teto por base é 11,5% e 15% — não está descartada, está sem nome."**

**Destino da síntese:** `specs/specs/11-testes-e-cobertura.md` (o que *"suíte verde"* passa a significar, mais
o procedimento de captura, que é o que sobrevive a esta plan independentemente do desfecho) ·
`specs/specs/15-divida-conhecida.md` (a dívida, com os tetos **por base**, não agrupados).

**Nenhuma tag é devida.**
