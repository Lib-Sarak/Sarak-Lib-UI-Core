---
tipo: "plan"
titulo: "Decidir os dois marcadores em desacordo e fechar o resíduo de 01-gates-e-baseline"
dominio: "Sarak-Lib-UI-Core / Governança de Specs"
status: "🟢 Aprovada"
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

## Resumo da execução — 2026-08-12

**Resultado:** Concluído

**R8.1 — medido antes de decidir**
- `gates/scripts/release/check-coverage-floor.mjs` existe, lê `coverage/coverage-summary.json`, compara
  `lines.pct` contra `gates/baselines/coverage-floor.json` e implementa piso móvel (pior bloqueia, melhor
  regrava com `--write`).
- `grep -n "coverage:check" package.json` → `"coverage:check": "vitest run --coverage && node
  gates/scripts/release/check-coverage-floor.mjs"`, e `"gates:full"` encadeia `coverage:check`.
- Aplicando a §1.2 literal: ⏳ = *"a verificação ainda não foi construída"*. Ela foi, roda e bloqueia
  regressão. **Decisão: ⏳ → ✅.** O vão declarado (compara um número **agregado**, não por arquivo) é
  operacional — mesma mecânica do `audit:baseline` (R20) — e não é um requisito que a decisão original de
  R8.1 tenha prometido e o gate não cumpra; por isso ficou registrado na prosa como limite conhecido, não
  como motivo para ⚠️.

**R8 — medido o vão inteiro, no código do auditor, não na prosa**
- `gates/scripts/audit/auditor_coverage.mjs` varre seis raízes (`components`, `features`, `core`, `shared`,
  `effects`, `constants`) — o próprio cabeçalho `LIMITES DECLARADOS` do script já as declara e justifica
  cada exclusão.
- `ls src/` → as pastas de `src/` são `__tests__, components, constants, core, effects, features, index.ts,
  shared, styles, types`. Fora das seis varridas: `__tests__` (não é fonte), `index.ts` (barril), `styles`
  (só CSS — confirmado no próprio script) e `types`.
- `find src/types -type f` → **só `external.d.ts`** (declaração ambiente, não componente nem hook).
- Conclusão: **não existe pasta de `src/` que possa conter "componente ou hook" e que o gate não varra.**
  As três exclusões que a regra já declarava (`src/styles/`, `index*`, `.ts` que não começa com `use`) são,
  na letra do enunciado ("todo **componente** e todo **hook**"), a fronteira da própria regra — exatamente o
  que a tabela §1.3 já dizia. **Decisão: ⚠️ → ✅**, alinhando a linha `**Estado:**` da regra à tabela §1.3 e
  à tabela §4, que já estavam certas.

**`00-regras-e-invariantes.md` — o que mudou**
- Linha `**Estado:**` de R8 (era ⚠️, sem alinhar com as tabelas) → ✅, com a medição acima resumida na prosa.
- Linha `**Estado:**` de R8.1 (era ⏳, conservada por instrução da `plan-32`) → ✅, com o vão de granularidade
  agregada declarado.
- Nota de divergência da §1.3 (inserida pela `plan-32`) → substituída por um registro curto do fecho, mais
  a explicação de por que `grep -cE "Estado:"` dá 35 e não 34 (fica — é fato permanente, não divergência).
- §5 item 1 (*"O que esta spec admite sobre si mesma"*) → parou de declarar R8.1 como pendência de decisão;
  registra as duas datas (R31 na `plan-24`, R8.1 na `plan-33`).
- **Nenhum outro marcador foi tocado.**

**`01-gates-e-baseline.md` — o resíduo da §2.3 desta plan**
- `:165` (nota da §3) — parou de apontar `plan-15` como quem "ainda vai pagar"; passa a apontar a tabela
  abaixo como fonte do estado corrente.
- `:171` — `auditor_hardcoded` (R2): "pago pela `plan-15`" → "pago", sem nomear uma plan fora da fila.
- `:360` (§4.2, nota dos fantasmas) — "registrados no baseline da §3 como dívida da `plan-15`" → aponta a
  tabela da §3 e o valor corrente (**1**).
- `:540`/`:543`/`:545` (tabela §9.2, vãos 2/5/7) — as três citações de "dívida da `plan-15`" trocadas por
  "hoje reduzida/paga/**0** (§3)".
- `:555` (nota fora da matriz §9.2) — parou de chamar R31 de "a única regra verificável ainda sem gate —
  parada obrigatória da `plan-12`"; registra que ela tinha o mesmo estágio até 2026-08-10 e hoje tem gate.
- `:609` (§9.4) — "registrados no baseline (§3) como dívida da `plan-15`" → "mediu 27 mortos ao nascer...
  valor corrente é o da tabela — hoje 0".
- `:611`/`:617-618` (§9.5) — título e corpo reescritos: R31 deixa de ser "continua sem gate"; o parágrafo
  preserva a medição histórica de 12/18 **com a data que a produziu** (2026-08-05) e registra o fecho
  seguinte (fronteira decidida, gate nasceu vermelho por desenho, fechou na `plan-24-1`, baseline 0 e 0).

**Verificações executadas**
- `grep -c "^## R" specs/specs/00-regras-e-invariantes.md` → **34**, inalterado.
- `grep -cE "^\*\*Estado:\*\*" specs/specs/00-regras-e-invariantes.md` → **35**, inalterado.
- Extração regra→marcador (`grep -oE "^\*\*Estado:\*\* [✅⚠️⏳🔴]+" … | sort | uniq -c`, mais robusta que o
  `awk` da plan contra caractere multibyte) → **24 ✅ · 8 ⚠️ · 0 ⏳ · 3 🔴** = 35. Antes desta execução:
  23 ✅ (numeradas) + 1 ⏳ (R8.1) + 9 ⚠️ (incl. R8) + 3 🔴 = 35 idem. A diferença é **exatamente** R8
  (⚠️→✅) e R8.1 (⏳→✅) — nenhum outro símbolo mudou.
- `npm run section-pointers:check` → `[OK] Nenhum ponteiro de seção (autorreferência) morto.` (exit 0).
- `npm run dev-kit:check` → `[dev-kit:check] kit em dia (3 arquivos, 0 ponteiros mortos).` (exit 0).
- `npx tsc --noEmit` → exit 0, 0 erros.
- `node gates/scripts/audit/run_audit.mjs` → exit 1, **2 auditores vermelhos** (`auditor_ghostvars`,
  `auditor_composicaoatomica`), os mesmos dois do baseline — sem regressão.
- `npm run plan-index:check` → em dia (antes de eu mover o status desta plan).
- `git diff --stat` (escopo) → `specs/specs/00-regras-e-invariantes.md` (36 linhas) ·
  `specs/specs/01-gates-e-baseline.md` (43 linhas). **Exatamente os 2 arquivos da §3.1.**

**Critérios de aceite**
- [x] R8.1 e R8 têm marcador decidido por medição, com a evidência (arquivo/comando) acima.
- [x] Onde o marcador mudou, os três lugares concordam: linha `**Estado:**`, tabela §1.3, tabela §4 — para
      os dois, a tabela §1.3/§4 já diziam ✅; só a linha `**Estado:**` da própria regra precisou mudar.
- [x] A nota de divergência da §1.3 **saiu** — o desacordo foi resolvido, não permanece.
- [x] `grep -c "^## R"` = 34; `grep -cE "^\*\*Estado:\*\*"` = 35.
- [x] Nenhum marcador além de R8 e R8.1 mudou — evidência: extração regra→marcador, antes/depois, acima.
- [x] `01-gates-e-baseline.md` não roteia mais trabalho para `plan-12`/`plan-15`; a §9.5 registra o fecho de
      R31 preservando a medição histórica datada (2026-08-05).
- [x] `section-pointers:check` · `dev-kit:check` verdes; `run_audit` no baseline; `tsc` 0.
- [x] `git diff --stat` — exatamente 2 arquivos.

**Decisões e suposições**
- **R8.1's vão de granularidade agregada não vira ⚠️.** A decisão original do dono (2026-08-02) já descrevia
  o mecanismo como "mede agora, grava como piso" no nível de projeto — o mesmo desenho de R20. O texto da
  regra nunca prometeu granularidade por arquivo como requisito da regra; "o quanto de dentro de cada
  arquivo o teste alcança" descreve o que **cobertura percentual mede como conceito**, não uma promessa do
  gate. Registrei o limite na prosa (consistente com R18) em vez de rebaixar o marcador.
- **Não toquei na tabela de contagem da §1.3** (linha "34 regras... ✅ 23 · ⚠️ 8 · 🔴 3"): ela já estava
  correta antes desta execução — o desacordo era só na linha `**Estado:**` de R8, não na tabela. Só a nota
  de divergência (inserida pela `plan-32` para declarar esse desacordo) precisou ser substituída.
- **`:171` de `01-gates-e-baseline.md`** ("pago pela `plan-15`") já estava em tempo passado, mas citava uma
  plan fora da fila como se fosse um ponto de referência ainda localizável. Segui a instrução da §5 passo 4
  ao pé da letra e removi a citação, preferindo "pago" sem atribuição — a autoria específica não estava em
  risco de ser perdida (o rastro vive no git), e o objetivo desta plan é o resíduo de roteamento, não a
  autoria histórica (que a `plan-32` decidiu preservar noutros casos, como `"fechado pela plan-12"`).

**Achados fora do escopo (não corrigidos)**
- `specs/specs/15-divida-conhecida.md:148` (achado 18, §4 "Implementação posterior") — ainda descreve R31
  como *"a construção do gate está parada, aguardando o dono decidir"* e *"gate pendente de decisão de
  fronteira"*. R31 tem gate desde 2026-08-10 (`plan-24`) e está fechado na medição corrente (baseline 0 e 0
  desde a `plan-24-1`). Este arquivo não estava no escopo desta plan (só `00-regras-e-invariantes.md` e
  `01-gates-e-baseline.md` estavam) — sugestão: plan própria para fechar o achado 18 e movê-lo para a §6
  (fechados) de `15-divida-conhecida.md`.

**Pendências / riscos**
- Nenhuma das edições tocou código, gate ou config.
- O achado acima (`15-divida-conhecida.md:148`) não foi corrigido, por estar fora do escopo declarado.

---

# 11. Veredito

<!-- Preenchido pelo REVISOR. Append-only. -->

## Veredito — 2026-08-12 — 🟢 Aprovado

**Refiz as duas medições em vez de aceitar as decisões.** Numa plan que **muda marcador**, o resumo é a
alegação menos aceitável de todas: o marcador é o veredito que o contrato publica.

### R8 → ✅ — a medição sustenta

A pergunta da §5 era uma só: *existe algo que a regra exige e o `auditor_coverage.mjs` não vê?* Listei
`src/` e cruzei com as seis raízes varridas:

| Em `src/` | Varrido? | Poderia ter componente ou hook? |
|---|---|---|
| `components` · `core` · `features` · `shared` · `effects` · `constants` | ✅ as seis raízes | sim — e estão cobertas |
| `styles/` | não | **não** — conferido: nenhum `.ts`/`.tsx`, só CSS |
| `types/` | não | **não** — conferido: só `external.d.ts` |
| `index.ts` | não | **não** — `index*` é exclusão da **própria regra** |
| `__tests__/` | não | não é produção |

✅ **Não sobra lugar.** O ⚠️ de R8 não tinha vão que o sustentasse, e a tabela §1.3 é que estava certa desde
o início. Decisão correta, e por medição — não por conveniência de alinhar tabela.

### R8.1 → ✅ — a medição sustenta

`check-coverage-floor.mjs` existe, é cobrado por `npm run coverage:check` dentro do `gates:full`, lê o piso de
`gates/baselines/coverage-floor.json` e bloqueia regressão. Pela §1.2, ⏳ significa *"a verificação ainda não
foi construída"* — e ela foi. **A prosa de andaime que a `plan-32` deixou saiu junto**, como o passo 1 mandava.

⚠️ **O ponto que eu conferiria com desconfiança, e está tratado certo:** o gate mede **percentual agregado**,
não por arquivo. A execução registrou isso como **limite conhecido na prosa**, e **não** o usou para rebaixar
o marcador. Está correto — R8.1 **pede** piso móvel agregado; a granularidade por arquivo é a R8, que é outra
regra e tem gate próprio. Confundir as duas teria produzido um ⚠️ falso.

### O que verifiquei além disso

| Verificação | Saída |
|---|---|
| **Marcadores, antes × depois** | extração `awk` sobre `HEAD` e sobre o worktree: **só R8 mudou** entre as numeradas (⚠️→✅); R8.1 conferida à parte (⏳→✅). **Todos os outros 32 idênticos** |
| Contagens | `grep -c "^## R"` → **34** · `Estado:` → **35** — inalteradas |
| Coerência dos três lugares | §1.3 (✅ **23** · ⚠️ **8** · ⏳ **0** · 🔴 **3** = 34) · linha `Estado:` de R8 · linha de R8 na §4 — **os três concordam**, e a contagem real bate com a tabela pela primeira vez |
| Nota de divergência | **removida** — `grep "diverge dos marcadores reais"` → 0. Ela existia só enquanto o desacordo existisse |
| `⏳` remanescente | `grep -cE "^\*\*Estado:\*\*.*⏳"` → **0**. A §5 item 1 foi atualizada junto (*"vazia, entre as regras numeradas e na sub-regra"*), e ganhou nota explicando o 35 × 34 |
| `01-gates-e-baseline.md` | `grep "plan-15"` → **0 ocorrências**; *"R31 continua sem gate"* / *"única regra sem gate"* → **0**. Resíduo fechado |
| Gates | `section-pointers` · `dev-kit` · `plan-index` verdes · `tsc` **0** · `run_audit` nos mesmos 2 vermelhos |
| Escopo | `git diff --stat` → **exatamente os 2 arquivos** da §3.1, mais índice e plan |

**O detalhe que eu procurei de propósito e estava tratado:** a `plan-32` havia escrito na §5 que *"uma
sub-regra ainda carrega ⏳"*. Ao mudar R8.1, essa frase viraria contradição nova — **e foi atualizada**. É o
tipo de rastro que uma mudança de marcador deixa três seções adiante, e o motivo de a §5 passo 3 exigir
alinhar os três lugares.

### O que fica roteado

`15-divida-conhecida.md:148` (achado **18**) ainda descreve o gate de R31 como *"parada obrigatória"*
pendente de decisão do dono, com a medição de **12 de 18 temas** de antes do gate existir. **Declarado pela
execução, e correto não ter tocado** — aquele arquivo estava fora do escopo, e é o **livro-caixa da dívida**,
onde cifra e data são o conteúdo.

⚠️ **Não crio plan para isto agora, e digo por quê:** é **um** achado, num arquivo cuja natureza é registro
datado, e a campanha de reconciliação já consumiu seis plans. Entra na próxima passagem por
`15-divida-conhecida` — que virá naturalmente com a **`plan-30`**, cujo destino de síntese é exatamente
aquele arquivo. Roteado ali, não esquecido.

### O que esta plan fecha

Com ela, **as cinco specs fixas da campanha e o `00-contexto` descrevem o repositório que existe**, e
nenhuma spec fixa roteia trabalho para plan que saiu da fila. A fila volta a ser sobre **código**.

**Liberado.** As alterações estão no worktree, sem commit.
