---
tipo: "plan"
titulo: "O contrato único, por leitura integral — reconciliar 00-regras-e-invariantes com o repositório"
dominio: "Sarak-Lib-UI-Core / Governança de Specs"
status: "🔴 A executar"
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

---

# 11. Veredito

<!-- Preenchido pelo REVISOR. Append-only. -->
