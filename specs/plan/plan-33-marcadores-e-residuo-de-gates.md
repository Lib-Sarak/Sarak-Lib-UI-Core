---
tipo: "plan"
titulo: "Decidir os dois marcadores em desacordo e fechar o resíduo de 01-gates-e-baseline"
dominio: "Sarak-Lib-UI-Core / Governança de Specs"
status: "🔴 A executar"
prioridade: "Alta"
tags: ["plan", "specs", "marcadores", "reconciliacao"]
relacionados: ["[[00-regras-e-invariantes]]", "[[01-gates-e-baseline]]", "[[15-divida-conhecida]]"]
depende_de: "plan-32"
destino_sintese: "—"
objetivo: "Resolver os dois marcadores de estado em desacordo e fechar a última spec que ainda roteia plans removidas"
---

> ⚠️ **Executada pelo REVISOR** e toca **spec fixa** — exige pedido explícito do usuário
> ([[00-prompt-revisor]] §3.1). Autorizar a execução **é** esse pedido.

# 1. Objetivo

Os marcadores de estado de `00-regras-e-invariantes.md` **descrevem a verificação que existe**, e nenhuma
spec fixa roteia trabalho para uma plan que saiu da fila.

# 2. Contexto

## 2.1 Por que os marcadores não foram decididos na `plan-32`

A `plan-32` tinha **proibição expressa** de mudar marcador: o executor **propõe**, o revisor decide, e a
decisão é execução própria. A razão é que mudar ✅/⚠️/⏳ exige **medir o vão inteiro** — inclusive a parte que
não mora naquele arquivo — e isso não cabia numa plan de leitura.

**Duas propostas chegaram com medição, e é isso que esta plan resolve.**

## 2.2 Os dois marcadores — medidos em 2026-08-12

| Regra | Marcador | O que a medição diz |
|---|---|---|
| **R8.1** (sub-regra) | **⏳** | ⏳ significa, na §1.2, *"a verificação ainda não foi construída"*. Ela **foi**: `check-coverage-floor.mjs` existe, é cobrado por `npm run coverage:check` dentro do `gates:full`, e o piso vive em `gates/baselines/coverage-floor.json`. O achado 15 está **fechado**. O próprio texto da regra já declara isso em voz alta |
| **R8** | **⚠️ na regra · ✅ na tabela §1.3** | Os dois motivos históricos do ⚠️ fecharam: o gate passou a varrer as seis raízes, e o segundo braço (R8.1) ganhou gate. O que resta — `src/styles/`, `index*`, `.ts` que não começa com `use` — a própria regra declara como **fronteira da regra, não vão de gate** |

**A divergência de R8 está declarada dentro da §1.3** desde a `plan-32`, com o comando que a reproduz:

```
⚠️ reais → R4 R7 R8 R10 R14 R17 R23 R30 R31   (nove)
⚠️ na tabela §1.3 → R4 R7 R10 R14 R17 R23 R30 R31   (oito)
```

> ⚠️ **A `plan-32` propôs, não decidiu — e a proposta NÃO é a decisão.** Esta plan é o lugar de medir o vão
> inteiro de cada uma e concluir. Se a medição contrariar a proposta, **a medição vence**.

## 2.3 O resíduo de `01-gates-e-baseline.md`

Última spec fixa que ainda roteia trabalho para plans que **saíram da fila**. Medido:

| Linha | O que diz | Real |
|---|---|---|
| `:555` | *"**R31** (⏳), a única regra verificável ainda sem gate — parada obrigatória da `plan-12`"* | R31 tem gate desde 2026-08-10 (`auditor_contraste.mjs`), e é ⚠️, não ⏳ |
| `:165` · `:171` · `:360` · `:540` · `:543` · `:545` · `:609` | *"dívida da `plan-15`"*, *"pago pela `plan-15`"*, *"(ainda não executada)"* | a `plan-15` **não está na fila** — foi sintetizada e removida |
| `:611` · `:617-618` | §9.5 *"a parada obrigatória"*, *"**R31 continua sem gate**"*, *"12 dos 18 temas falham"* | o gate existe e o baseline é **0 e 0**; a medição de 12/18 é **anterior** ao gate |

# 3. Escopo

## 3.1 Dentro
- `specs/specs/00-regras-e-invariantes.md` — **só** a linha `**Estado:**` de **R8** e de **R8.1**, a nota de
  divergência da §1.3 e as linhas de R8/R8.1 na tabela da §4, **se** a decisão mudar algum marcador
- `specs/specs/01-gates-e-baseline.md` — as linhas da §2.3 desta plan

## 3.2 Fora
- ⛔ **Qualquer outro marcador.** Só R8 e R8.1 estão medidos; mexer noutro repete o erro que a `plan-32`
  evitou.
- ⛔ Todo o resto de `00-regras-e-invariantes.md` — fechado pela `plan-32`.
- ⛔ Os arquivos das plans 29 e 31.
- ⛔ Enunciado, numeração ou categoria de regra.
- ⛔ Código, gate, script, config. **Se a medição mostrar que o gate não cobre o que a regra pede, o marcador
  fica como está e o vão vira achado** — nunca se conserta o gate aqui para justificar um ✅.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/specs/00-regras-e-invariantes.md` §1.2 | a definição literal de cada marcador — é ela que decide, não a impressão |
| Plan | `specs/plan/plan-32-contrato-unico-leitura-integral.md` §10 e §11 | as propostas com medição, e a prova da divergência |
| Fonte viva | `npm run coverage:check` · `gates/scripts/audit/auditor_coverage.mjs` · `gates/baselines/` | o que o gate de fato cobre |

# 5. Instruções de execução

1. **R8.1 — medir antes de decidir.** Abrir `check-coverage-floor.mjs` e confirmar: ele roda? está no
   `gates:full`? o piso é lido e comparado? Confirmado, o ⏳ **não descreve mais a verificação** e o marcador
   muda para o que a §1.2 mandar. A prosa que a `plan-32` deixou (*"marcador conservado por instrução"*) sai
   junto — ela era andaime.
2. **R8 — medir o vão inteiro, não só o que está escrito.** A pergunta é uma só: **existe algo que a regra
   exige e o `auditor_coverage.mjs` não vê?** Ler o escopo no código, não na prosa. As exclusões declaradas
   (`src/styles/`, `index*`, `.ts` não-hook) são **fronteira da regra** — se não houver outra, o ⚠️ não se
   sustenta e a tabela §1.3 é que estava certa.
3. **Alinhar os três lugares** — linha `**Estado:**`, tabela §1.3 e tabela §4 — para o que a decisão fixar, e
   **remover a nota de divergência da §1.3**, que existe só enquanto o desacordo existir.
4. **`01-gates-e-baseline.md`** — as linhas da §2.3: as citações de `plan-15`/`plan-12` como trabalho futuro
   viram registro datado ou apontam a fila do [[00-indice]]; a §9.5 deixa de chamar R31 de *"sem gate"* e
   passa a registrar o fecho, preservando a medição histórica **com a data que a produziu**.
5. **Rodar e colar:** `grep -c "^## R"` · `grep -cE "^\*\*Estado:\*\*"` · a extração regra→marcador ·
   `npm run section-pointers:check` · `npm run dev-kit:check` · `node gates/scripts/audit/run_audit.mjs` ·
   `npx tsc --noEmit` · `git diff --stat`.

# 6. Prompt de execução

```
Leia specs/00-prompt-revisor.md e execute
specs/plan/plan-33-marcadores-e-residuo-de-gates.md.

Executada pelo REVISOR e toca SPEC FIXA — confirme a autorização explícita do usuário.
Pré-requisito: a plan-32 tem de estar 🟢 Aprovada.

Contexto obrigatório: specs/specs/00-regras-e-invariantes.md §1.2 (a definição literal
dos quatro marcadores) e a §10/§11 da plan-32 (as propostas e a prova da divergência).

ESTA PLAN DECIDE MARCADOR — é a única autorizada a isso, e só para R8 e R8.1.

  · MEÇA ANTES DE DECIDIR. A proposta da plan-32 não é a decisão: se a medição
    contrariar a proposta, a medição vence e o marcador fica.
  · A régua é a §1.2, literal. ⏳ = "a verificação ainda não foi construída".
    ⚠️ = "existe verificação e ela NÃO VÊ parte do que a regra exige".
  · Para R8, a pergunta é uma só: existe algo que a regra exige e o
    auditor_coverage.mjs não vê? Leia o escopo NO CÓDIGO.
  · Se um marcador mudar, ALINHE OS TRÊS LUGARES: a linha **Estado:**, a tabela
    §1.3 e a tabela §4 — e remova a nota de divergência da §1.3.

LINHAS VERMELHAS:
  · Você NÃO toca em nenhum marcador além de R8 e R8.1.
  · Você NÃO conserta gate para justificar um ✅. Se o gate não cobre, o marcador
    fica e o vão vira achado declarado.
  · Você NÃO reabre o resto de 00-regras-e-invariantes.md (fechado pela plan-32).

Não commite. Resumo na própria plan e status 🟠 Em revisão.
```

# 7. Critérios de aceite

- [ ] R8.1 e R8 têm marcador **decidido por medição**, com a evidência (arquivo/comando) no resumo.
- [ ] Onde o marcador mudou, os **três lugares concordam**: linha `**Estado:**`, tabela §1.3, tabela §4.
- [ ] A nota de divergência da §1.3 **saiu** se o desacordo foi resolvido — ou **permanece com o motivo
      atualizado**, se a medição mostrou que ela ainda vale.
- [ ] `grep -c "^## R"` = **34**; `grep -cE "^\*\*Estado:\*\*"` = **35**.
- [ ] **Nenhum marcador além de R8 e R8.1 mudou** — comprovado pela extração regra→marcador, antes e depois.
- [ ] `01-gates-e-baseline.md` não roteia mais trabalho para `plan-12`/`plan-15`; a §9.5 registra o fecho de
      R31 preservando a medição histórica **datada**.
- [ ] `section-pointers:check` · `dev-kit:check` verdes; `run_audit` no baseline; `tsc` 0.
- [ ] `git diff --stat` — **exatamente 2 arquivos**.

# 8. Como verificar (uso do revisor)

```bash
git diff --stat && git diff                       # ler INTEIRO
grep -c "^## R" specs/specs/00-regras-e-invariantes.md
grep -cE "^\*\*Estado:\*\*" specs/specs/00-regras-e-invariantes.md
awk '/^## R[0-9]+ /{r=$2} /^\*\*Estado:\*\*/{if(r!=""){print r, substr($0,15,3); r=""}}' \
    specs/specs/00-regras-e-invariantes.md
grep -rn "plan-15\|plan-12" specs/specs/01-gates-e-baseline.md
npm run section-pointers:check && npm run dev-kit:check
node gates/scripts/audit/run_audit.mjs && npx tsc --noEmit
```

A verificação central é a quarta linha: **o par regra→marcador, comparado com o de antes**. Só R8 e R8.1
podem ter mudado. E a pergunta que decide a aprovação não é *"o marcador ficou bonito"*, é: **a §1.2 aplicada
literalmente produz este símbolo?**

# 9. Destino da síntese

**Destino:** `—`

A execução já escreve nas specs fixas, que são o alvo.

---

# 10. Resumo da execução

<!-- Preenchido pelo REVISOR-executor. Append-only. -->

---

# 11. Veredito

<!-- Preenchido pelo REVISOR. Append-only. -->
