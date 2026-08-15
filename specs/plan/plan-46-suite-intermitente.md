---
tipo: "plan"
titulo: "A suíte não é determinística — nomear os dois testes e fechar"
dominio: "Sarak-Lib-UI-Core / Testes"
status: "🔴 A executar"
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
| Plan | `specs/plan/plan-41-…md` §11 · `plan-45-…md` §11 | as duas observações, com data e números |
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
- [ ] Se **declarou dívida**: entrada em [[15-divida-conhecida]] com taxa, caracterização e o motivo de não
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

---

# 10. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only. -->

---

# 11. Veredito

<!-- Preenchido pelo REVISOR. Append-only. -->
