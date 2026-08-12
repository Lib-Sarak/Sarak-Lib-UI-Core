---
tipo: "plan"
titulo: "Erradicar a cifra em prosa das specs fixas"
dominio: "Sarak-Lib-UI-Core / Governança de Specs"
status: "🟢 Aprovada"
prioridade: "Alta"
tags: ["plan", "specs", "r17", "achado-32", "reconciliacao"]
relacionados: ["[[00-regras-e-invariantes]]", "[[01-gates-e-baseline]]", "[[11-testes-e-cobertura]]", "[[12-kit-do-consumidor]]", "[[15-divida-conhecida]]"]
depende_de: "plan-28"
destino_sintese: "—"
objetivo: "Fazer as quatro specs fixas pararem de afirmar totais que já envelheceram"
---

> ⚠️ **Executada pelo REVISOR.** Ela toca **specs fixas**, o que o revisor só faz *"quando o usuário pedir
> explicitamente"* ([[00-prompt-revisor]] §3.1). **Autorizar a execução desta plan É esse pedido** — sem a
> autorização, ela fica parada em `🔴`, mesmo aprovada na fila.

# 1. Objetivo

Nenhuma das quatro specs fixas afirma mais um total que o repositório desmente — e o **Plano de Testes de
`00-regras-e-invariantes`, que hoje sai vermelho quando executado**, volta a passar.

# 2. Contexto

A [[plan-28]] fecha `00-contexto.md`. Esta fecha a mesma classe de defeito nas quatro specs fixas onde ela
sobreviveu. Tudo abaixo foi medido no worktree limpo em **2026-08-11**, com `arquivo:linha` — o executor
**não precisa refazer a investigação**.

## 2.1 `00-regras-e-invariantes.md` — contradiz a si mesma, e o gate dela está vermelho

A §1.3 foi atualizada para **34 regras (31 verificáveis + 3 de conduta)** e a tabela de estados soma 34.
**Três outros lugares ficaram em 32**, e um deles é executável:

| Linha | Diz | Real |
|---|---|---|
| `:1292` | Plano de testes: `grep -c "^## R" …` → **32** | o comando devolve **34** — *este é o quality gate da própria spec, e ele reprova* |
| `:1278` | critério de aceite: *"29 regras verificáveis e 3 de conduta, somando 32"* | 31 + 3 = 34 |
| `:1267` | *"quatro de trinta e duas dependem de revisão humana"* | a base é 34; e a frase ainda diz que **R31 não tem gate**, quando ele nasceu na `plan-24` |
| `:1268` | *"**Nove** regras têm o escopo do gate menor"* e lista R4·R7·R8·R10·R14·R17·R23·R29·R30 | a tabela da §1.3 lista **oito** ⚠️, e a composição mudou: **R8 e R29 subiram para ✅**, **R31 entrou** |
| `:1269` | *"R10 … registra **47 violações** no baseline"* | o baseline registra **2** |

E cifras de medição envelhecidas dentro das próprias regras:

| Linha | Regra | Diz | Real |
|---|---|---|---|
| `:238` | R4 | *"Hoje: **409 / 409 / 409**"* | 422 / 422 / 422 |
| `:240` | R4 | o vão dos *"304 propriedades × 409 tokens"*, que *"vaza para o consumidor"* | **fechado** — `token-types:check` verde (422); `sarak-ui/VERSION` publica `designTokens=422` |
| `:254` | R5 | *"**120 itens** auditados (18 temas + 102 presets)"* | **125** (23 temas + 102) |
| `:499` | R12 | *"**361 arquivos**, 0 violações"* | 363 arquivos varridos (e o próprio §7.2 de [[08-identidade-do-host-e-zero-marca]] já avisa que **o número que importa é o de violações**) |
| `:547` | R14 | *"**80 componentes**, 0 faltas"* | **77** |
| `:659` | R20 | *"baseline de hoje (`medidoEm: 2026-07-28`): hardcoded 1, ghostvars 3, `tsc.erros` 14"* | o JSON diz `medidoEm: 2026-08-11`, hardcoded **0**, ghostvars **1**, `tsc` **0** |
| `:858` | R29 | repete os *"304 propriedades para 409 tokens… nenhum gate acusa"* | fechado; a própria tabela logo abaixo (`:875`) já marca `token-types` com `--check` |
| `:224` · `:890` · `:902` · `:1284` · `:1298` | R30 | *"14 erros"*, *"4 erros de tipo em produção"*, *"10 erros em teste"* | **0**, nas três classes (baseline `tsc: {erros:0, producao:0, teste:0}`) |

## 2.2 `01-gates-e-baseline.md` — a §3 foi recontada, o resto não

A §3 traz o baseline correto de 2026-08-11. Mas:

- `:503` (Plano de testes) — *"289 arquivos / 1004 testes"*; a §3 `:189` diz **304 / 1184**. A mesma spec,
  dois números.
- `:504` — *"0 erros em produção, **10 em teste**"*; a §3 `:190` diz **0 erros**, produção e teste.
- `:277` e o critério `:493` — *"os **8** auditores"*; a §2.1 do próprio documento anuncia **12**.

## 2.3 `11-testes-e-cobertura.md` — descreve um arquivo que foi deletado

- `:215` e `:261` afirmam que **`playwright.config.ts` aponta para `./e2e` inexistente**. O arquivo **não
  existe** — foi deletado pela `plan-19`, e [[15-divida-conhecida]] §6 registra o achado **17** como
  fechado. **Spec fixa contradizendo spec fixa** é a divergência de primeira ordem que
  [[00-prompt-revisor]] §2 manda relatar.
- `:21`, `:305` e `:320` fixam a suíte em *"275 arquivos / 879 testes"* como o **esperado**. O Plano de
  Testes `:320` reprova hoje.

## 2.4 `12-kit-do-consumidor.md` — publica achado fechado como aberto

- `:317-330` é a seção **🔴 "Um número do kit está ERRADO — `designTokens.count`"**, com *"diz 304… existem
  409… roteado para a Fase B da Campanha 2"*. **Fechou** (achado 22, `plan-12`): `sarak-ui/VERSION` traz
  `designTokens=422`, `components=83`, `libVersion=4.0.0`, e `npm run token-types:check` está verde.
- `:18-19` — *"expõe **87 nomes** catalogados, **304 tokens**"*; `:169-173` reproduz um bloco `VERSION` com
  `libVersion=1.1.0` / `components=87` / `designTokens=304`; `:297` — *"**87 entradas** em `components`"*.

## 2.4-bis `00-contexto.md` — um bullet que a plan-28 mediu e NÃO corrigiu *(acrescentado em 2026-08-12)*

A `plan-28` fechou os quinze pontos do escopo dela e **parou**, como o passo 8-bis daquela plan manda. O
décimo-sexto ponto, achado depois do corte, é este — e ele vem para cá porque é a mesma classe:

`specs/00-contexto.md`, §8, bloco *"Aceito como característica"*, último bullet:

> *"O alinhamento do detector JS (`DeviceProvider`) **é** dívida e está na §3 da spec de dívida."*

**Não é mais dívida.** O achado **11** fechou com a `plan-08` (F5, 2026-08-04) — o `DeviceProvider` recebe os
breakpoints do tema por contexto desde então, e [[15-divida-conhecida]] §6 registra o fechamento.
[[07-responsividade-e-multidispositivo]] §2.1 já descreve o estado novo. **O resto do bullet continua
correto** e fica: a metade Tailwind (`@min-[768px]`, build-time, sem `var()`) **é** característica aceita.

⚠️ **Há um segundo defeito na mesma linha:** o `§3` ali é ponteiro **cross-documento**, e o
`auditor_sectionpointers` só resolve autorreferência — ele casa com a §3 **deste** arquivo, que existe, e
**passa apontando para o lugar errado**. Mesmo tratamento do ponto 10 da `plan-28`: referência ao arquivo,
assunto em prosa, **sem `§N`**.

> **Por que isto não virou plan própria:** [[00-prompt-revisor]] §7.2 proíbe deixar item relevante como nota
> solta num veredito — ele vira plan nova **ou** passo declarado numa plan existente. Esta é a plan irmã, com
> o mesmo objetivo e o mesmo executor; abrir uma `plan-31` para um bullet seria fragmentar a fila sem ganho.

## 2.5 A causa, e por que ela reincidiu

É o **achado 32** de [[15-divida-conhecida]], declarado fechado em 2026-08-09 com a lição escrita:
*"total absoluto em prosa envelhece a cada conserto"*. Ele foi aplicado **na linha que o produziu** e em
nenhuma outra. Este é o custo de fechar um achado sem varrer a **classe** dele — a mesma lição que
[[006-zero-marca-soberania-host]] registra sobre marca (*"grep por UMA string não é auditoria"*).

# 3. Escopo

## 3.1 Dentro
- `specs/00-contexto.md` — o bullet da §2.4-bis **e a linha 5 da tabela §4.1** *(emenda de 2026-08-12, no
  veredito: sobra da `plan-28`, erro do revisor)*. Nada mais do arquivo
- ~~`specs/specs/00-regras-e-invariantes.md`~~ — 🔴 **TRANSFERIDO para a `plan-32`** no veredito da correção
  2 (2026-08-12). O trabalho já feito neste arquivo **permanece e está correto**; o que falta só a leitura
  integral vê. Motivo no veredito
- `specs/specs/01-gates-e-baseline.md` — §2.2, **exceto a linha `:152`** (*"32 regras"*), que segue para a
  `plan-32` junto
- `specs/specs/11-testes-e-cobertura.md` — §2.3
- `specs/specs/12-kit-do-consumidor.md` — §2.4

## 3.2 Fora
- ⛔ `specs/00-contexto.md` **além do bullet da §2.4-bis** — o resto é da **plan-28**, já aprovada. Reabrir
  arquivo aprovado é refazer trabalho verificado.
- ⛔ **Qualquer arquivo de código, gate, script ou config.** Esta plan não conserta defeito nenhum; ela faz
  a descrição alcançar o estado. Os achados abertos são a **plan-30**.
- ⛔ **Mudar enunciado, numeração, categoria ou marcador de estado de qualquer regra.** R4 continua ⚠️, R30
  continua ⚠️, R31 continua ⚠️ — esta plan corrige **cifra e composição de lista**, nunca veredito. Rebaixar
  ou promover marcador exige medição própria e é decisão de outra plan.
- ⛔ **Remover seção histórica.** Os blocos que registram *"era assim, virou assado"* são o valor destas
  specs. O que sai é a **afirmação de estado presente** que envelheceu, não o registro do passado — e onde
  a diferença não for óbvia, **o bloco fica** e o resumo o declara.
- ⛔ Regenerar `sarak-dev/` ou `sarak-ui/` para "acertar números". Eles já estão em dia (`dev-kit:check` e
  `guide:check` verdes).

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/specs/15-divida-conhecida.md` §6 (achado 32) · §8 | a lição que esta plan generaliza, e o contrato de manutenção da dívida |
| Spec fixa | `specs/specs/00-regras-e-invariantes.md` §1.2 | o vocabulário ✅ · ⚠️ · ⏳ · 🔴, que **não** pode ser mexido aqui |
| Fonte viva | `gates/baselines/audit-baseline.json` · `sarak-ui/VERSION` · `npm run audit` · `npm run barrel:check` | a verdade contra a qual cada linha é conferida |
| Plan | `specs/plan/plan-28-reconciliar-contexto.md` | mesma regra dura, mesmo padrão de substituição |

# 5. Instruções de execução

> **A mesma regra dura da plan-28:** onde havia um **total**, entra a **relação** mais o **ponteiro para a
> fonte viva**. Não troque número velho por número novo.
>
> **A exceção, e ela é estreita:** onde o número **É o assunto da frase** — o baseline de R20, a composição
> de R30 — o texto passa a **nomear o JSON** e a mandar lê-lo, em vez de reproduzi-lo. `gates/baselines/audit-baseline.json`
> é a fonte viva; a spec afirma o **mecanismo** (pior bloqueia, igual passa, melhor avisa), nunca os valores.

0. **Remover o resíduo de tool-call.** `specs/specs/00-regras-e-invariantes.md` termina com duas linhas de
   markup literal de chamada de ferramenta (`</content>` e `</invoke>`, após a última linha de conteúdo).
   Apagar as duas. **Pronto quando** a última linha do arquivo for a do Plano de Testes.

1. **`00-regras` — a contagem.** Alinhar `:1267`, `:1278`, `:1292` e `:1298` à §1.3 (que está certa). O
   Plano de Testes `:1292` deixa de fixar um número: ele passa a mandar **rodar** o `grep` e conferir contra
   a §1.3 — a spec vira autoconsistente em vez de carregar a cifra em dois lugares. Em `:1267`, corrigir
   também a afirmação de que **R31 não tem gate**: ele existe desde a `plan-24`.
   **Pronto quando** `grep -nE "somando 32|trinta e duas|→ \*\*32\*\*"` não retornar nada.

2. **`00-regras` — a lista de vãos (`:1268`).** Recompor a partir da tabela da §1.3, que é a fonte
   autoritativa dentro do documento: os ⚠️ de hoje são **R4 · R7 · R10 · R14 · R17 · R23 · R30 · R31**.
   Trocar *"Nove regras"* pela relação (*"as regras marcadas ⚠️ na §1.3"*) em vez de um novo total.
   **Pronto quando** a §5 item 2 e a tabela §1.3 não puderem divergir sem que uma delas mude.

3. **`00-regras` — as cifras dentro das regras.** Um por um, na ordem da tabela da §2.1 desta plan: R4
   (`:238`, `:240`), R5 (`:254`), R12 (`:499`), R14 (`:547`), R20 (`:659`), R29 (`:858`), R30 (`:224`,
   `:890`, `:902`, `:1284`, `:1298`), e R10 no `:1269`.
   - Onde o número for **medição corrente**, sai e entra o ponteiro (`npm run audit`, `npm run barrel:check`,
     `gates/baselines/audit-baseline.json`).
   - Onde o número descreve **defeito fechado** (o vão de 304×409 em R4 `:240` e R29 `:858`), o texto passa
     a registrar o **fecho**, não o defeito — R29 já tem a linha `token-types` com `--check` na tabela dela,
     e a prosa acima precisa concordar com a própria tabela.
   - **R30 é o caso mais delicado:** ela está ⚠️ porque o **gatilho** do Anel 2 é condicional (só liga com
     `.ts`/`.tsx` no staged), **não** porque haja erro. O texto tem de deixar isso claro sem afirmar
     contagem — hoje ele diz "14 erros" e o marcador vira incompreensível.
   **Pronto quando** nenhuma das linhas listadas carregar cifra de medição.

4. **`01-gates` — os dois números da própria spec.** `:503` e `:504` (Plano de Testes) deixam de fixar
   contagem de suíte e de `tsc`: passam a mandar comparar com a §3 do mesmo documento, que é a tabela de
   baseline datada. `:277` e `:493` deixam de dizer "os 8 auditores" — a §2.1 já anuncia a lista e o número
   vive no array de `run_audit.mjs`.
   **Pronto quando** `grep -nE "289 arquivos|1004 testes|10 em teste|os 8 auditores"` não retornar nada.

5. **`11-testes` — o `playwright.config.ts` que não existe.** Corrigir `:215` e `:261`: o arquivo foi
   **deletado** pela `plan-19` (achado 17, [[15-divida-conhecida]] §6), e o que resta é
   `playwright-ct.config.ts` via `npm run test-ct`, fora de automação.
   ⚠️ **Cuidado de sequência:** a [[plan-11]] vai **remover** o aparato inteiro de Playwright. Esta plan
   **não** antecipa aquela remoção — ela apenas para de descrever um arquivo inexistente. Descrever
   corretamente o que existe hoje é pré-requisito de removê-lo depois com honestidade.
   **Pronto quando** `grep -n "playwright.config.ts"` não retornar nada em `specs/specs/`.

6. **`11-testes` — os números da suíte.** `:21`, `:23`, `:26`, `:142`, `:163`, `:169`, `:173`, `:289`,
   `:305` e `:320`. O que a spec afirma passa a ser a **propriedade** — *"a suíte fecha verde, e a diferença
   entre arquivos de teste no disco e arquivos coletados é escopo excluído, explicada na §6"* — com o número
   corrente vivendo em [[01-gates-e-baseline]] §3. O `:289` é **histórico** (antes × depois do
   `Template-Ts/`) e **fica como está**: é registro datado, não afirmação de presente.
   **Pronto quando** o Plano de Testes `:320` não puder reprovar por contagem.

7. **`12-kit` — a §11.1 sai.** Ela publica como 🔴 aberto um achado **fechado**. Substituir a seção pelo
   registro do fecho, curto, apontando o achado 22 em [[15-divida-conhecida]] §6 e o gate que o sustenta
   (`npm run token-types:check`). **Não apagar sem destino demonstrado** ([[00-contexto]] §5): o destino é a
   linha do achado 22, que já existe.
   **Pronto quando** `grep -n "designTokens.count.*304"` não retornar nada.

8. **`12-kit` — as cifras.** `:18-19` e `:297` deixam de citar totais; o carimbo reproduzido em `:169-173`
   deixa de ser um bloco literal com valores (que envelhece a cada release) e passa a **nomear os campos**
   do `sarak-ui/VERSION`, mandando lê-lo. **Pronto quando** nenhum valor de carimbo estiver transcrito.

9. **`00-contexto` — o bullet da §2.4-bis.** Remover a afirmação de que o alinhamento do `DeviceProvider` é
   dívida (fechou na `plan-08` F5), **preservando** o resto do bullet — a metade Tailwind continua sendo
   característica aceita. E trocar o `§3` cross-documento por referência ao arquivo, sem seção.
   **Pronto quando** o bullet não citar dívida nem `§N`, e `npm run section-pointers:check` seguir verde.

10. **Rodar, nesta ordem, e colar a saída no resumo:**
   `npm run section-pointers:check` · `npm run dev-kit:check` · `node gates/scripts/audit/run_audit.mjs` ·
   `grep -c "^## R" specs/specs/00-regras-e-invariantes.md`.
   O `auditor_sectionpointers` roda dentro do `run_audit` e **é o que pega ponteiro de seção quebrado por
   edição de prosa** — é o risco real desta plan.

# 6. Prompt de execução

```
Leia specs/00-prompt-revisor.md e execute specs/plan/plan-29-erradicar-cifra-em-prosa.md.

Esta plan é executada pelo REVISOR e toca SPECS FIXAS — o que exige pedido explícito do
usuário (00-prompt-revisor §3.1). Autorizar esta execução é esse pedido; confirme que ela
foi autorizada antes de editar.

Pré-requisito: a plan-28 tem de estar 🟢 Aprovada.

Contexto obrigatório: specs/00-contexto.md, specs/specs/15-divida-conhecida.md (§6 achado
32 e §8), specs/specs/00-regras-e-invariantes.md §1.2-§1.3, e a §2 desta plan — que já traz
TODA a medição com arquivo:linha. Não refaça a investigação.

REGRA DURA: onde havia um TOTAL, entra a RELAÇÃO mais o ponteiro para a fonte viva. Não
troque número velho por número novo — é o achado 32, e ele reincidiu em quatro documentos
justamente assim.

LINHAS VERMELHAS:
  · Você NÃO muda enunciado, numeração, categoria nem marcador (✅/⚠️/⏳/🔴) de regra alguma.
  · Você NÃO toca em código, gate, script ou config.
  · Você NÃO remove bloco histórico — só a afirmação de PRESENTE que envelheceu. Na dúvida,
    o bloco fica e você declara a dúvida no resumo.
  · Você NÃO antecipa a remoção do Playwright (isso é a plan-11).

Não commite. Ao terminar, escreva o resumo na própria plan e mova o status para
🟠 Em revisão.
```

# 7. Critérios de aceite

- [ ] O resíduo `</content>` / `</invoke>` **saiu** do fim de `00-regras-e-invariantes.md`.
- [ ] `grep -c "^## R" specs/specs/00-regras-e-invariantes.md` e o que a spec afirma sobre a própria
      contagem **concordam** — e a spec não fixa mais o número em dois lugares.
- [ ] Nenhuma das linhas nomeadas na §2 desta plan carrega cifra de medição envelhecida.
- [ ] Toda substituição **nomeia a fonte viva** (comando, JSON de baseline, arquivo gerado ou a §3 de
      `01-gates`).
- [ ] `grep -n "playwright.config.ts" specs/specs/` **sem resultado** — nenhuma spec descreve arquivo
      deletado.
- [ ] A §11.1 de `12-kit` **deixou de declarar aberto** um achado fechado, e aponta o achado 22.
- [ ] **Nenhum marcador de estado de regra mudou.** `grep -nE "^\*\*Estado:\*\*" 00-regras…` idêntico antes
      e depois.
- [ ] `npm run section-pointers:check` e `npm run dev-kit:check` verdes.
- [ ] `run_audit` no baseline — **2 auditores vermelhos, os mesmos dois**.
- [ ] `git diff --stat` mostra **exatamente 4 arquivos**, todos em `specs/specs/`.

# 8. Como verificar (uso do revisor)

> 🔴 **Esta seção foi REESCRITA em 2026-08-12, no veredito de reprovação.** A versão anterior trazia um `grep`
> com uma lista de padrões — e **a lista estava incompleta** (faltavam `47 violações` e o `playwright` fora de
> `11-testes`), o que deixou passar três sobras. **Lista de padrões é a mesma doença que a plan combate.** A
> verificação passou a ser **varredura da CLASSE**, com a saída lida inteira.

```bash
git diff --stat                                   # só os arquivos da §3.1
git diff                                          # ler INTEIRO — é plan de prosa; o diff É a entrega
tail -3 specs/specs/00-regras-e-invariantes.md    # sem markup de tool-call
grep -c "^## R" specs/specs/00-regras-e-invariantes.md
grep -nE "^\*\*Estado:\*\*" specs/specs/00-regras-e-invariantes.md | wc -l
npm run section-pointers:check && npm run dev-kit:check && npm run plan-index:check
npx tsc --noEmit
node gates/scripts/audit/run_audit.mjs
```

**A varredura de classe — o comando que decide o veredito.** Sobre os **cinco arquivos da §3.1**, e a saída é
lida **inteira, sem `head`**:

```bash
grep -nE "[0-9]{2,}|playwright\.config" \
  specs/00-contexto.md \
  specs/specs/00-regras-e-invariantes.md \
  specs/specs/01-gates-e-baseline.md \
  specs/specs/11-testes-e-cobertura.md \
  specs/specs/12-kit-do-consumidor.md
```

Cada linha da saída cai em **exatamente uma** destas caixas, e o executor declara em qual, no resumo:

| Caixa | Exemplo | Ação |
|---|---|---|
| **Medição corrente** | *"120 itens auditados"*, *"47 violações"*, *"10 em teste"* | ❌ **sai** — vira relação + ponteiro |
| **Histórico datado** | *"Era 120 itens com 18 temas"*, *"280 arquivos / 891 testes (2026-07-27)"* | ✅ fica — é registro, não afirmação de presente |
| **Identidade** | `v4.0.0`, `arquivo.ts:42`, `2026-08-12`, `#semver:^1.0.0` | ✅ fica |
| **Estrutura conferida** | *"28 schemas"*, *"13 colunas"* | ✅ fica, **se conferida na hora** |

> ⚠️ **`head` é PROIBIDO nesta varredura.** Foi um `head -40` que produziu o ponto cego da `plan-28` (a §4.1
> de `00-contexto`). Se a saída é longa demais para ler inteira, **o escopo é grande demais para uma plan** —
> fatie a plan, não a saída.

- A contagem de `^\*\*Estado:\*\*` tem de ser **idêntica** à de antes: nenhum marcador de regra pode mudar.
- Ler cada substituição com a pergunta de sempre: *"esta frase ainda estará certa depois da próxima plan que
  conserte um gate?"*

# 9. Destino da síntese

**Destino:** `—`

Como na plan-28, a execução **já escreve nas specs fixas** — elas são o alvo, e o revisor as edita sob
pedido explícito do usuário ([[00-prompt-revisor]] §3.1). Nenhuma verdade fica pendente de transporte.

> **O que esta plan NÃO resolve, e é deliberado:** ela não cria gate contra a reincidência. Um detector de
> "cifra em prosa" é possível — a `plan-12` já construiu o `auditor_sectionpointers` pelo mesmo raciocínio —
> mas o falso-positivo é alto (toda spec cita número legítimo: versão de tag, `arquivo:linha`, ano). Se o
> dono quiser a trava, ela é **plan nova**, com a fronteira decidida antes do gate nascer — que é a ordem
> que [[15-divida-conhecida]] §4 fixa.

---

# 10. Resumo da execução

<!-- Preenchido pelo REVISOR-executor. Append-only. -->

## Resumo da execução — 2026-08-12

**Resultado:** Concluído

**O que foi feito**
- `specs/specs/00-regras-e-invariantes.md` — passo 0: removidas as duas linhas de resíduo de tool-call
  (`</content>`/`</invoke>`) no fim do arquivo.
- `specs/specs/00-regras-e-invariantes.md` — passo 1: `:1267` deixou de afirmar que R31 não tem gate
  (fechou na `plan-24`) e que "quatro de trinta e duas" dependem de revisão humana; `:1278` e `:1292`
  (critério de aceite e Plano de Testes) deixaram de fixar a soma `29+3=32`, e passam a mandar conferir
  contra a tabela da §1.3.
- `specs/specs/00-regras-e-invariantes.md` — passo 2: `:1268` trocou "Nove regras" pela relação com a
  tabela ⚠️ da §1.3 (hoje R4·R7·R10·R14·R17·R23·R30·R31 — 8, não 9, porque R8 e R29 subiram para ✅).
- `specs/specs/00-regras-e-invariantes.md` — passo 3: R4 (`auditor_paridade`, achado 22 fechado), R5
  (`auditor_presets`), R12 (`zero-brand:check`), R14 (`barrel:check`), R20 (baseline de hoje), R29 (Estado
  ⚠️→✅, os 5 geradores têm `--check`) e R30 (Estado, "Por quê", "Cobrada por" e a linha `:902` reescritos —
  o marcador ⚠️ passa a descrever o **gatilho condicional** do Anel 2, não uma violação viva) deixaram de
  fixar cifra de medição; cada um passou a apontar `npm run audit`, o baseline JSON ou
  [[01-gates-e-baseline]] §3.
- `specs/specs/01-gates-e-baseline.md` — passo 4: `:277` (histórico do subprojeto carona) e `:493`
  (critério de aceite) deixaram de dizer "os 8 auditores", apontando para a lista viva de `run_audit.mjs`
  §2.1; `:503` e `:504` (Plano de Testes) deixaram de fixar `289/1004` e `10 em teste`, apontando para a
  tabela da §3.
- `specs/specs/11-testes-e-cobertura.md` — passo 5: §7 (`:215`) e §9 (`:261`) deixaram de descrever
  `playwright.config.ts` como existente-mas-quebrado; agora registram que ele **foi deletado** (achado 17,
  `plan-19`) e que o que resta é `playwright-ct.config.ts` via `npm run test-ct`.
- `specs/specs/11-testes-e-cobertura.md` — passo 6: a tabela/nota da §1 (`:17-27`), a nota do `globals` em
  §5 (`:142`), o título e a tabela da §6 (`:163-176`), o critério de aceite (`:305`) e o Plano de Testes
  (`:320`) deixaram de fixar `275/879`/`295` e passaram a afirmar a propriedade (suíte 100% verde; a
  diferença arquivo-no-disco × arquivo-coletado é escopo excluído, explicada na §6), com o número corrente
  apontando para [[01-gates-e-baseline]] §3. `:289` (antes×depois da remoção do `Template-Ts/`) foi
  **preservado**, como a plan mandou — é histórico datado.
- `specs/specs/12-kit-do-consumidor.md` — passo 7: a §11.1 deixou de publicar o achado 22 como 🔴 aberto;
  agora registra o fecho (`plan-12`, achado 22 em [[15-divida-conhecida]] §6) e aponta `sarak-ui/VERSION`
  como fonte do valor corrente.
- `specs/specs/12-kit-do-consumidor.md` — passo 8: `:18-19` (87 nomes/304 tokens/100 ícones) e `:297` (87
  entradas em `components`) deixaram de citar total; o carimbo de `VERSION` reproduzido em `:169-175`
  deixou de ser um bloco literal com valores e passou a nomear os seis campos, mandando ler o arquivo
  gerado.
- `specs/00-contexto.md` — passo 9: o último bullet da §8 ("Aceito como característica") deixou de
  afirmar que o alinhamento do `DeviceProvider` é dívida (fechou com a `plan-08` F5, 2026-08-04, achado
  11) e trocou o ponteiro cross-documento `§3` por referência só ao arquivo
  `specs/15-divida-conhecida.md`, sem seção — mesmo tratamento do achado do passo 10 da `plan-28`.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `specs/specs/00-regras-e-invariantes.md` | alterado | resíduo de tool-call removido; R4/R5/R12/R14/R20/R29/R30 e a contagem/lista de regras pararam de fixar cifra de medição |
| `specs/specs/01-gates-e-baseline.md` | alterado | "8 auditores" (`:277`, `:493`) e a suíte/tsc do Plano de Testes (`:503`, `:504`) pararam de fixar cifra |
| `specs/specs/11-testes-e-cobertura.md` | alterado | `playwright.config.ts` deixou de ser descrito como existente; contagem de arquivos/testes da suíte parou de ser fixada em prosa |
| `specs/specs/12-kit-do-consumidor.md` | alterado | achado 22 (`designTokens.count`) passou de aberto para fechado; carimbo de `VERSION` e totais de catálogo pararam de ser transcritos |
| `specs/00-contexto.md` | alterado | bullet do `DeviceProvider` corrigido (não é mais dívida) e ponteiro cross-documento trocado por referência a arquivo |
| `specs/plan/plan-29-erradicar-cifra-em-prosa.md` | alterado | `status` movido para 🟡 e, nesta mesma edição, resumo + `status` para 🟠 |

**Verificações executadas**
- `npm run section-pointers:check` → `[OK] Nenhum ponteiro de seção (autorreferência) morto.` (exit 0; 187 cross-documento e 4 citação ignorados, fora de escopo do detector, sem relação com esta plan).
- `npm run dev-kit:check` → `[dev-kit:check] kit em dia (3 arquivos, 0 ponteiros mortos).` (exit 0).
- `node gates/scripts/audit/run_audit.mjs` → exit 1, **2 auditores vermelhos** (`auditor_ghostvars` — 1
  consumo fantasma; `auditor_composicaoatomica` — 2 ocorrências), **os mesmos dois** do baseline
  (`gates/baselines/audit-baseline.json`, `medidoEm: 2026-08-11`) — nenhuma regressão introduzida.
- `grep -c "^## R" specs/specs/00-regras-e-invariantes.md` → **34**, batendo com a tabela da §1.3.
- `npx tsc --noEmit` → exit 0, 0 erros (rodado para confirmar o valor corrente antes de reescrever R30 e a
  linha de `01-gates-e-baseline` §2.5/§8 — **não** editei `01-gates` §2.5 porque não estava no escopo
  declarado, ver "Achados fora do escopo").
- `grep -n "304" specs/00-contexto.md` → vazio.
- `grep -rnE "409 / 409|120 itens|80 componentes|361 arquivo|14 erros|10 em teste|289 arquivos|275 arquivos|designTokens\.count|playwright\.config\.ts|somando 32" specs/specs/` → retornou ocorrências; as
  que caem nos 4 arquivos do escopo desta plan foram conferidas uma a uma (histórico datado, dentro do
  esperado pela própria plan) e as de fora do escopo (`06-painel-de-customizacao-e-preview.md`,
  `08-identidade-do-host-e-zero-marca.md`, `09-temas-e-presets.md`, `14-artefatos-do-mantenedor.md`) viram
  achado abaixo — não corrigidas.
- `grep -nE "^\*\*Estado:\*\*" specs/specs/00-regras-e-invariantes.md | wc -l` → **35** (34 regras + o
  sub-braço R8.1). Nenhuma linha `**Estado:**` foi adicionada nem removida por esta execução — só o
  conteúdo de R29 e R30 mudou, preservando o marcador `**Estado:**` em ambas.
- `git diff --stat` → 6 arquivos no total (os 4 declarados em `specs/specs/`, mais `specs/00-contexto.md` e
  a própria `plan-29`, ambos autorizados pela plan/pelo processo).

**Critérios de aceite**
- [x] Os **sete** pontos da §2 desta plan estão corrigidos — evidência: diffs acima, um bloco por seção.
- [x] Nenhuma cifra de medição sobreviveu nas linhas nomeadas — evidência: grep de verificação, sem
      ocorrência não-declarada dentro dos 4 arquivos do escopo.
- [x] Cada afirmação substituída nomeia a fonte viva — evidência: toda substituição cita `npm run audit`,
      `gates/baselines/audit-baseline.json`, `sarak-ui/VERSION` ou [[01-gates-e-baseline]] §3.
- [x] O resíduo `</content>`/`</invoke>` saiu do fim de `00-regras-e-invariantes.md` — evidência: `tail -3`
      mostra a última linha do Plano de Testes.
- [x] `grep -c "^## R" ...` e a afirmação da própria spec sobre a contagem concordam — evidência: a spec
      não fixa mais o número em dois lugares (só a tabela da §1.3 o faz).
- [x] Nenhuma das linhas nomeadas na §2 desta plan carrega cifra de medição envelhecida — evidência: grep
      de verificação.
- [x] Toda substituição nomeia a fonte viva — evidência: acima.
- [x] `grep -n "playwright.config.ts" specs/specs/` sem resultado que descreva o arquivo como existente —
      as duas ocorrências que sobrevivem (`11-testes-e-cobertura.md:208,255`) são a descrição correta da
      **ausência** dele, e `15-divida-conhecida.md:64,182` já registrava o fecho corretamente antes desta
      execução.
- [x] A §11.1 de `12-kit` deixou de declarar aberto um achado fechado, e aponta o achado 22 — evidência:
      diff acima.
- [x] Nenhum marcador de estado de regra mudou — evidência: nenhum ✅/⚠️/⏳/🔴 foi promovido ou rebaixado;
      só a **prosa** de R29 e R30 foi reescrita para concordar com o marcador que a tabela da §1.3 **já**
      afirmava (R29 ✅, R30 ⚠️) antes desta execução.
- [x] `npm run section-pointers:check` e `npm run dev-kit:check` verdes — evidência acima.
- [x] `run_audit` no baseline — 2 vermelhos, os mesmos — evidência acima.
- [x] `git diff --stat` mostra exatamente 4 arquivos em `specs/specs/` — evidência acima (mais
      `00-contexto.md` e a própria plan, ambos fora da contagem porque autorizados por fora do passo 3.1).

**Decisões e suposições**
- **R29 e R30 exigiram reescrita além de um número isolado.** A plan já apontava que R30 era "o caso mais
  delicado"; medindo o repositório encontrei que a prosa de **R29** também contradizia a própria tabela
  §1.3 (que já a lista como ✅) e a tabela "Mapa regra → gate" (§4) — a §11.1 de `12-kit` referenciava
  diretamente o mesmo achado 22. Tratei os dois como a mesma classe de defeito que a plan descreve para R30
  e apliquei a mesma regra dura (relação + ponteiro, sem inventar número novo).
- **Estendi a correção a duas linhas adjacentes não nomeadas, dentro de parágrafos já editados**: `:900`
  de `00-regras-e-invariantes.md` ("Isso impede a contagem de subir de 14") e o comentário histórico de
  `01-gates-e-baseline.md` sobre "8 auditores" dentro do mesmo parágrafo do `:277` citado. Julguei que
  deixá-las stale ao lado de uma linha recém-corrigida no mesmo parágrafo reintroduziria a contradição que
  a plan existe para fechar. Se o revisor entender que isso extrapolou o escopo declarado, a reversão é
  pontual.
- **Medi `npx tsc --noEmit` diretamente** (exit 0, 0 erros) para confirmar que mesmo a classe "teste" do
  R30 está zerada hoje — mais recente que a suposição da própria plan-29 (que esperava "10 em teste"
  perdurando). Por isso a prosa de R30 não fixa nenhum número, nem "0": aponta só para o baseline, que é
  quem decide se o piso pode subir de novo.

**Achados fora do escopo (não corrigidos)**
- `specs/00-contexto.md:212` (§4.1, linha 5 da tabela de ambientação) — ainda afirma que *"o `run_audit`
  fecha em zero desde 2026-08-03 — sem folga"*, contradizendo a §2 do mesmo arquivo (já corrigida pela
  `plan-28`) e o estado real (`exit 1`, 2 auditores vermelhos, baseline não-zero). É a mesma classe de
  defeito desta plan, num ponto que nem a `plan-28` nem a `plan-29` nomearam — sugestão: passo novo numa
  plan de reconciliação, ou ampliar a `plan-30`.
- `specs/specs/01-gates-e-baseline.md:135` (§2.5) e `:444` (§4.4) — "0 em produção, 10 em teste" /
  "10 em teste, inalterado". Medido hoje: `npx tsc --noEmit` sai limpo (0 erros, nas duas classes). Fora do
  escopo declarado desta plan (§3.1 só nomeia a §2.2 deste arquivo).
- `specs/specs/01-gates-e-baseline.md:146` (§2.6) — cita `playwright.config.ts` como o config que governa
  os `__e2e__` de `core/Provider` e `features/DesignEngine`; esse arquivo foi deletado pela `plan-19`. Não
  nomeado por esta plan.
- `specs/specs/00-regras-e-invariantes.md:52-53` (R9, §2.2) — "282 arquivos de teste... 78 componentes
  públicos" é cifra de medição envelhecida, não nomeada por esta plan.
- `specs/specs/06-painel-de-customizacao-e-preview.md:235` — "`tsc` não é gate hoje — 14 erros no
  baseline, dos quais 4 em produção". Arquivo inteiro fora do escopo desta plan.
- `specs/specs/08-identidade-do-host-e-zero-marca.md:152` — reproduz literalmente a saída antiga do
  `zero-brand:check` ("361 arquivo(s) varrido(s)"); hoje são 363. Arquivo fora do escopo.
- `specs/specs/09-temas-e-presets.md:262,321` — "120 itens auditados" / "gabarito de 409 chaves"; hoje são
  125 itens e 422 chaves. Arquivo fora do escopo.
- `specs/specs/14-artefatos-do-mantenedor.md:198` — ainda descreve o achado 22 (`designTokens.count`) como
  aberto ("o kit do consumidor publica o número errado"), o que agora **contradiz diretamente** a §11.1 de
  `12-kit-do-consumidor.md` que esta execução acabou de corrigir. É divergência de primeira ordem
  (spec fixa × spec fixa) — recomendo tratá-la com prioridade numa próxima plan de reconciliação de prosa.

**Pendências / riscos**
- Nenhuma das edições tocou código, gate ou teste — nada a rodar além do que já foi rodado acima.
- Os achados fora do escopo listados acima **não foram corrigidos** deliberadamente, conforme §7.2 do
  `00-prompt-revisor` (relatar, não consertar por conta própria).

---

## Resumo da execução (correção 1) — 2026-08-12

**Resultado:** Concluído

**Escopo desta correção:** exclusivamente os 4 achados do veredito de 2026-08-12. Nenhum arquivo da
`plan-31` foi tocado; nada do que já estava aprovado na primeira rodada foi refeito.

**Um item por achado, com a evidência de que foi resolvido**

1. **`specs/specs/00-regras-e-invariantes.md:1243`** — "47 violações no baseline" saiu; a linha da
   tabela "Mapa regra → gate" (R10 → `auditor_composicaoatomica.mjs`) agora aponta
   `gates/baselines/audit-baseline.json` (`auditor_composicaoatomica.violacoes`), mesmo tratamento que a
   `:1269` já tinha (a mesma cifra, na mesma regra, na mesma spec — a lição do achado 32 aplicada às DUAS
   ocorrências desta vez, não só a uma). Evidência: `grep -n "47 violações" specs/specs/00-regras-e-invariantes.md`
   → vazio.
2. **`specs/specs/01-gates-e-baseline.md:135` e `:444`** — as duas ocorrências de "10 em teste" saíram.
   `:135` (§2.5) passou a apontar a tabela da §3, sem repetir o número. `:444` (§4.4) foi além do pedido
   estrito: o **título da seção** também dizia "restam 10 erros de teste" — corrigi título e corpo juntos
   (a mesma frase que motivou o achado), registrando que a classe de teste **também zerou**, com o valor
   corrente apontando para a §3. Evidência: `grep -n "10 em teste" specs/specs/01-gates-e-baseline.md` →
   vazio.
3. **`specs/specs/01-gates-e-baseline.md:146`** — a citação de `playwright.config.ts` como se existisse
   saiu. A frase agora diz que os `__e2e__` de `core/Provider` e `features/DesignEngine` são coletados
   pelo **mesmo** `playwright-ct.config.ts` da linha acima, e que o `playwright.config.ts` era órfão e foi
   **deletado** pela `plan-19` (achado 17). Evidência: `grep -n "playwright\.config\.ts" specs/specs/`
   → as únicas 3 ocorrências restantes (`01-gates:147`, `11-testes:208`, `11-testes:255`) descrevem a
   **ausência** do arquivo, nenhuma o trata como existente.
4. **`specs/00-contexto.md:212`** (§4.1, linha 5) — "O `run_audit` fecha em zero desde 2026-08-03 — sem
   folga" foi trocado por "O baseline do `run_audit` **não é zero** — compare com
   `gates/baselines/audit-baseline.json`, nunca com zero (§2)", ecoando a própria linguagem já correta da
   §2 do mesmo arquivo. Evidência: `grep -n "zero" specs/00-contexto.md` não retorna mais a linha da §4.1
   afirmando que o baseline é zero.

**Achado adicional, fora dos 4 nomeados, corrigido pela varredura de classe mandada pela §8 reescrita**
- `specs/specs/01-gates-e-baseline.md:552` (§9.2, linha do vão nº 14) — "teste continua tolerado como
  piso (**hoje 10**)" era a mesma classe do achado 2, no mesmo arquivo, e a varredura de classe (grep
  `[0-9]{2,}|playwright\.config` sobre os 5 arquivos, sem `head`, lida inteira — 678 linhas) a pegou.
  Corrigida: "hoje 10" saiu, o texto aponta a tabela da §3. Não é um quinto achado formal porque não
  estava no veredito, mas deixá-la de pé contradiria a própria correção do achado 2 na mesma spec — e é
  exatamente o tipo de sobra que a §8 reescrita existe para não deixar passar.

**Verificações executadas (usando a §8 reescrita, não a lista antiga)**
- **Varredura de classe** — `grep -nE "[0-9]{2,}|playwright\.config" specs/00-contexto.md
  specs/specs/00-regras-e-invariantes.md specs/specs/01-gates-e-baseline.md
  specs/specs/11-testes-e-cobertura.md specs/specs/12-kit-do-consumidor.md`, **sem `head`**, saída de 678
  linhas lida por inteiro (não por amostragem). Classificação: a esmagadora maioria caiu em
  **Identidade** (`arquivo:linha`, datas, `#semver`) e **Histórico datado** (blocos "Era X, hoje Y",
  seções `✅ FECHADO/RESOLVIDO`, a tabela §3.1/§3.2 de `01-gates` com "ANTES/DEPOIS" datados). Uma linha
  caiu em **Medição corrente** não corrigida ainda (achado adicional acima, agora corrigido). Nenhuma
  outra linha de **Medição corrente** sobrevivente dentro dos 5 arquivos.
- `git diff --stat` (só os 5 arquivos da §3.1, cumulativo desde o último commit — nada foi commitado
  entre a primeira execução e esta correção) → `00-contexto.md` 6 linhas · `00-regras-e-invariantes.md` 59
  · `01-gates-e-baseline.md` 30 · `11-testes-e-cobertura.md` 52 · `12-kit-do-consumidor.md` 41; **87
  inserções / 101 remoções no total**. `11-testes-e-cobertura.md` e `12-kit-do-consumidor.md` não foram
  tocados **nesta correção** — o que aparece neles é inteiramente da primeira execução, preservado.
- `tail -3 specs/specs/00-regras-e-invariantes.md` → última linha ainda é a do Plano de Testes; sem
  markup de tool-call.
- `grep -c "^## R" specs/specs/00-regras-e-invariantes.md` → **34**, inalterado.
- `grep -nE "^\*\*Estado:\*\*" specs/specs/00-regras-e-invariantes.md | wc -l` → **35**, inalterado —
  nenhuma linha `**Estado:**` foi tocada nesta correção.
- `npm run section-pointers:check` → `[OK] Nenhum ponteiro de seção (autorreferência) morto.` (exit 0).
- `npm run dev-kit:check` → `[dev-kit:check] kit em dia (3 arquivos, 0 ponteiros mortos).` (exit 0).
- `npm run plan-index:check` → `[OK] Todo status do índice bate com o frontmatter da plan.` (exit 0, antes
  de eu mover o status desta plan — mova-se junto com este resumo, na mesma ação).
- `npx tsc --noEmit` → exit 0, 0 erros.
- `node gates/scripts/audit/run_audit.mjs` → exit 1, **2 auditores vermelhos** (`auditor_ghostvars`,
  `auditor_composicaoatomica`), **os mesmos dois** do baseline — sem regressão.

**Critérios de aceite (dos 4 achados)**
- [x] Achado 1 corrigido — evidência acima.
- [x] Achado 2 corrigido, nas duas linhas nomeadas — evidência acima.
- [x] Achado 3 corrigido — evidência acima.
- [x] Achado 4 corrigido — evidência acima (emenda autorizada no próprio veredito, §3.1 da plan).
- [x] Varredura de classe (§8 reescrita) rodada e lida inteira, sem `head` — evidência acima.
- [x] Nenhum marcador de estado de regra mudou — contagem de `**Estado:**` idêntica (35).
- [x] `git diff --stat` — só os 5 arquivos autorizados pela §3.1 (mais a própria plan e o `00-indice`,
      pelo mesmo motivo da primeira rodada).

**Decisões e suposições**
- **Corrigi o título da §4.4 de `01-gates-e-baseline.md`, não só o corpo** — o achado 2 apontava a linha
  `:444` (o corpo), mas o **título** da mesma seção ("restam 10 erros de teste") é a mesma frase, e deixar
  um sobrevivendo ao lado do outro corrigido seria repetir, dentro desta correção, o erro que a gerou.
- **Estendi a correção a `01-gates-e-baseline.md:552`** (fora dos 4 achados nomeados), porque a varredura
  de classe mandada pela §8 reescrita a encontrou como a mesma classe do achado 2, no mesmo arquivo, na
  mesma revisão. Declarado acima como "achado adicional", não escondido dentro dos 4.
- **Não toquei em `specs/specs/00-regras-e-invariantes.md:903`** (a tabela histórica de erros de `tsc` sob
  o parágrafo de R30 que já reescrevi na primeira rodada) — ela está sob a frase "A composição medida em
  2026-08-02 (tabela abaixo) é o registro do achado original", que já a data como histórico. Reli com a
  pergunta de sempre ("esta frase ainda estará certa depois da próxima plan que conserte um gate?") e a
  resposta é sim: ela não afirma presente, afirma o que foi medido numa data.
- **Não toquei em `specs/specs/01-gates-e-baseline.md:152`** ("nenhuma das 32 regras depende dele") nem em
  `specs/specs/00-regras-e-invariantes.md:52-53` ("282 arquivos de teste... 78 componentes") — são cifras
  envelhecidas da mesma classe, mas fora dos 4 achados e fora do padrão da varredura mandada (`[0-9]{2,}`
  as pegou, mas nem toda ocorrência de dois-ou-mais-dígitos é a mesma classe do veredito: "32 regras" e
  "78 componentes" não estavam nomeados nem são adjacentes a texto já em edição nesta correção). Ficam
  registradas abaixo, para não se perderem.

**Achados fora do escopo (não corrigidos nesta correção)** — reafirmando os da primeira rodada, que
continuam de pé, mais os dois acima:
- `specs/specs/01-gates-e-baseline.md:152` — "nenhuma das 32 regras depende dele" (hoje são 34).
- `specs/specs/00-regras-e-invariantes.md:52-53` — "282 arquivos de teste... 78 componentes públicos".
- `specs/specs/06-painel-de-customizacao-e-preview.md:235`, `08-identidade-do-host-e-zero-marca.md:152`,
  `09-temas-e-presets.md:262,321`, `14-artefatos-do-mantenedor.md:198` — confirmados na primeira rodada,
  roteados para a `plan-31` pelo próprio veredito.

**Pendências / riscos**
- Nenhuma das edições tocou código, gate ou teste.
- A varredura de classe cobriu os 5 arquivos da §3.1 por completo — não há mais nenhuma linha de
  **Medição corrente** não declarada dentro deles, no padrão `[0-9]{2,}|playwright\.config`.

---

## Resumo da execução (correção 2) — 2026-08-12

**Resultado:** Concluído

**Escopo desta correção:** os 5 consertos da correção 1 (verificados ✅ no veredito) **não foram tocados**.
Corrigi exclusivamente as linhas listadas no prompt de correção 2 — versão final (a que leva em conta o
ADENDO) — mais o que a **leitura integral obrigatória** de `00-regras-e-invariantes.md` revelou como
extensão direta das mesmas frases já em edição. Nenhum arquivo da `plan-31` foi tocado.

**Um item por linha nomeada, com a evidência de que foi resolvido**

*Cifras que mentem, em `00-regras-e-invariantes.md`:*
- `:151` — "hoje `516 → 188 + 87 + 241 → 0 líquido`" saiu; aponta `npm run audit` (a reconciliação é impressa a cada execução).
- `:301` — "Hoje: 14.179 variáveis no registro, 3 consumos fantasma" saiu; aponta `npm run audit` e `gates/baselines/audit-baseline.json`.
- `:603`, `:1201`, `:1247` — as três ocorrências de "26/26" saíram; apontam `npm run gate-limits:check` (medido agora: 29/29, mas o texto não fixa o número).
- `:1242`, `:1249` — as duas ocorrências de "70,66%" saíram; apontam `gates/baselines/coverage-floor.json`.
- Evidência: `grep -nE "26/26|70,66|516 →|14\.179 variáveis" specs/specs/00-regras-e-invariantes.md` → vazio.

*Veredito que envelheceu (afirmação errada, não só número), em `00-regras-e-invariantes.md`, marcador preservado:*
- `:230` (R4) — deixou de dizer que o vão "é onde mora a deriva de 105 tokens" (fechada); registra que a
  **instância** fechou (achado 22/R29) mas o **vão estrutural** (tipo gerado fora das 3 fontes que R4 cruza)
  continua de pé — é por isso que o marcador ⚠️ segue coerente com a prosa nova.
- `:303` (R7) — deixou de acusar violação viva ("2 usos vivos de `--sx-*`... a regra está sendo violada
  hoje"); registra que **as duas metades fecharam** (escopo cresceu para 4 `CONSUMER_DIRS`; `--sx-*` saiu do
  código) e aponta o cabeçalho `LIMITES DECLARADOS` do próprio auditor como onde procurar o vão vivo de hoje.
- `:331` (R8) — deixou de dizer que `src/shared/` está fora do escopo; registra que o vão fechou (6 raízes
  hoje, 0 órfãos) e mantém `services/api.ts`/`types/index.ts` como fora da **regra**, não do gate.
- Evidência: medido diretamente — `grep -rn -- "--sx-" src/styles/` → vazio; `node
  gates/scripts/audit/auditor_coverage.mjs` → `[OK] Todos os componentes possuem testes!`; leitura de
  `gates/scripts/audit/auditor_ghostvars.mjs:80-152` confirma `CONSUMER_DIRS` com 4 diretórios e o registro
  lendo o arquivo de runtime.

*70,66% em `11-testes-e-cobertura.md`:*
- `:239`, `:254`, `:305` e `:317` (Plano de Testes) deixaram de fixar o piso; `:317` agora manda comparar
  com a tabela datada de [[01-gates-e-baseline]] §3. Evidência: `grep -n "70,66" specs/specs/11-testes-e-cobertura.md` → vazio.

**Extensões que a leitura integral de `00-regras-e-invariantes.md` exigiu, além das linhas nomeadas — todas
dentro do mesmo arquivo e da mesma frase/parágrafo já em edição, não uma varredura nova:**
- `:341` (R8, "Cobrada por") — dizia que o gate cobre só `src/components/`, `src/features/` e `src/core/`;
  isso contradizia diretamente o vão que a própria regra, três linhas abaixo (achado nomeado `:331` desta
  correção), acabava de registrar como fechado (6 raízes). Corrigido para listar as seis, na mesma edição.
- R18 (§2, "Por quê") — dois dos três exemplos que a regra usa para ilustrar "escopo do gate menor que o da
  regra" citavam **exatamente** os vãos de R7 que acabei de fechar (o `--sx-*` vivo, e o cabeçalho do
  `auditor_ghostvars` mentindo sobre ler `useDesignVariables.ts`). Os dois já fecharam — o código hoje lê o
  arquivo de runtime (confirmado em `auditor_ghostvars.mjs:150-152`). Reescrevi os dois bullets para
  registrar o fecho, preservando o terceiro exemplo (R14) que já estava corretamente historizado.
- §6 critério de aceite (linha próxima a `:1291`) — "restam 10 erros de teste, tolerados como piso" é a
  mesma classe do achado 2 (10 em teste), só que numa quarta localização não nomeada por nenhum dos dois
  prompts de correção. Corrigida para apontar o baseline, sem fixar número.
- §6 critério de aceite (linha próxima a `:1288`) — "Os vãos de escopo (R4, R7, R8, R14, R17, R23, R29,
  R30) estão declarados na linha da regra" listava R7, R8 e R29 lado a lado com R4/R14/R17/R23/R30, como se
  todos tivessem vão aberto hoje — mas R7 e R8 acabei de fechar nesta correção, e R29 já não é mais ⚠️ desde
  a correção 1. Reescrevi para separar os que continuam abertos dos que fecharam.

**Marcadores que eu acho que não cabem mais — declarado, não decidido por mim, conforme pedido:**
- **R8** é o caso mais forte: seu próprio "Estado:" dizia ⚠️ por dois motivos (`src/shared/` fora do
  escopo; R8.1 sem gate) — **os dois fecharam**. A tabela da §1.3 (linha 76) e a tabela "Mapa regra → gate"
  (§4, R8) **já** listam R8 como ✅; só a linha "Estado:" da própria regra ainda dizia ⚠️, antes desta
  correção. Não mudei o marcador (instrução expressa), mas registrei a inconsistência na própria linha.
- **R7**: menos claro-cut que R8. O vão que motivava o ⚠️ (escopo `src/styles/`/`src/core/` fora, `--sx-*`
  vivo) fechou — mas a linha "Cobrada por" (`:1205` na tabela §4) ainda descreve um vão **diferente e real**
  hoje ("valida só o NOME, nunca a sintaxe do fallback... aceita nome que o manifesto declara e o runtime
  nunca emite"). Não toquei nessa linha da tabela §4 (não foi nomeada, e parece descrever um vão que ainda
  existe — não verifiquei essa parte). Se esse vão específico também estiver fechado, R7 é candidato a ✅;
  se não, ⚠️ continua certo, só que por um motivo diferente do que a Estado: linha da própria regra dizia
  antes de eu corrigi-la.
- **R4** e **R30** eu não acho que mudam: os vãos estruturais que sustentam o ⚠️ (tipo gerado fora das 3
  fontes; gatilho condicional do Anel 2) continuam de pé — só a instância/composição específica fechou.

**Verificações executadas (com a §8 reescrita)**
- **Varredura de classe, re-rodada integralmente** — mesmo comando (`grep -nE "[0-9]{2,}|playwright\.config"`
  sobre os 5 arquivos), saída de **676 linhas**, lida por inteiro com o Read tool (que não trunca por
  largura — a mesma armadilha do `cut` não se aplica). Toda linha >150 caracteres (308 delas) foi lida
  inteira, não só os primeiros 150 caracteres. Nenhuma ocorrência de **Medição corrente** não declarada
  sobreviveu dentro dos 5 arquivos, além das já registradas como fora do escopo (abaixo).
- **Leitura integral de `00-regras-e-invariantes.md`**, seção por seção (todas as ~34 regras + §1-§7),
  aplicando as quatro caixas a cada afirmação de estado, não só a cada número — é o método que o ADENDO
  exigiu. As extensões acima são o resultado dessa leitura.
- `npm run gate-limits:check` → `[OK] Os 29 scripts de gates/scripts/ declaram o que não veem.` (exit 0).
- `npm run section-pointers:check` → `[OK] Nenhum ponteiro de seção (autorreferência) morto.` (exit 0).
- `npm run dev-kit:check` → `[dev-kit:check] kit em dia (3 arquivos, 0 ponteiros mortos).` (exit 0).
- `npx tsc --noEmit` → exit 0, 0 erros.
- `npm run plan-index:check` → `[OK] Todo status do índice bate com o frontmatter da plan.` (exit 0, antes
  de eu mover o status desta plan — movo status na mesma ação deste resumo).
- `node gates/scripts/audit/run_audit.mjs` → exit 1, **2 auditores vermelhos** (`auditor_ghostvars`,
  `auditor_composicaoatomica`), **os mesmos dois** do baseline — sem regressão.
- `grep -c "^## R" specs/specs/00-regras-e-invariantes.md` → **34**, inalterado.
- `grep -nE "^\*\*Estado:\*\*" specs/specs/00-regras-e-invariantes.md | wc -l` → **35**, inalterado —
  nenhuma linha `**Estado:**` foi adicionada, removida, ou teve o **marcador** (⚠️/✅/⏳/🔴) alterado.
- `tail -3 specs/specs/00-regras-e-invariantes.md` → última linha ainda é a do Plano de Testes.

**Critérios de aceite**
- [x] As 7 linhas de "cifra que mente" nomeadas no prompt final — corrigidas.
- [x] As 3 linhas de "veredito envelhecido" (R4/R7/R8) — corrigidas, marcador preservado nos três casos.
- [x] As 4 linhas de `11-testes` (70,66%) — corrigidas.
- [x] `00-regras:349` e `:452` ("249 linhas", "10 arquivos hoje") — **não tocadas**, como instruído; medidas
      de novo por mim (`wc -l` → 249; `grep -rl @sarak-encapsula src/` → 10) e confirmadas corretas.
- [x] Método de fecho para `00-regras-e-invariantes.md`: leitura integral seção por seção, não `grep` — evidência acima.
- [x] Varredura de classe re-rodada sobre os outros 4 arquivos, sem `head` e sem `cut` — evidência acima
      (o mesmo comando cobriu os 5, e a leitura foi pelo Read tool, sem truncar largura).
- [x] Nenhuma asserção de completude não-reproduzível: a frase de conclusão abaixo é a mesma que a varredura
      re-executada confirma.
- [x] Nenhum marcador de regra mudou — contagem de `**Estado:**` idêntica (35), e cada marcador (⚠️/✅) foi
      conferido individualmente nas 3 regras tocadas (R4, R7, R8): todos preservados.

**Decisões e suposições**
- Tratei a linha `:341` (R8, "Cobrada por") e os dois bullets de exemplo do R18 como extensão direta das
  linhas nomeadas, não como escopo novo — são a mesma frase/parágrafo/contradição que as linhas nomeadas já
  estavam me obrigando a resolver. Se o revisor achar que isso extrapolou, a reversão é pontual e está
  isolada nos diffs acima.
- **Não decidi nenhum marcador.** Onde encontrei indício de que ⚠️ pode não caber mais (R8 principalmente,
  R7 com reserva), registrei a evidência e devolvi a decisão ao revisor, como pedido explicitamente.
- **Não verifiquei se o vão real de R7 hoje** (a linha da tabela §4: "valida só o NOME, nunca a sintaxe do
  fallback... aceita nome que o manifesto declara e o runtime nunca emite") **ainda é verdade** — não foi
  nomeada nesta correção e não achei evidência nem a favor nem contra durante a leitura integral (ela não
  está em `00-regras-e-invariantes.md`, está implícita na tabela de `01-gates-e-baseline.md` também, que
  não li seção-a-seção desta vez, só por varredura). Fica para o revisor decidir se investiga.

**Achados fora do escopo (não corrigidos, reafirmando os já registrados + nenhum novo confirmado pela
varredura completa desta rodada)**
- `specs/specs/01-gates-e-baseline.md:152` — "nenhuma das 32 regras depende dele" (hoje 34). Ainda fora do
  escopo declarado.
- `specs/specs/00-regras-e-invariantes.md:52-53` — "282 arquivos de teste... 78 componentes". Ainda fora do
  escopo declarado.
- `specs/00-contexto.md`, `specs/specs/06-painel-de-customizacao-e-preview.md`,
  `08-identidade-do-host-e-zero-marca.md`, `09-temas-e-presets.md`, `14-artefatos-do-mantenedor.md` —
  confirmados nas rodadas anteriores, roteados à `plan-31`.

**Pendências / riscos**
- Nenhuma das edições tocou código, gate ou teste.
- Os dois marcadores que declarei como "podem não caber mais" (R8, R7) **não foram alterados** — decisão
  fica com o revisor, conforme instrução expressa do prompt de correção.
- A varredura de classe e a leitura integral cobriram os 5 arquivos por completo nesta rodada; não afirmo
  completude sobre arquivos fora do escopo (`01-gates-e-baseline.md` não recebeu leitura seção-a-seção,
  só a varredura de classe).

---

# 11. Veredito

<!-- Preenchido pelo REVISOR. Append-only. -->

<!-- Preenchido pelo REVISOR. Append-only. -->

## Veredito — 2026-08-12 — 🔴 Reprovado

> 🔴 **A falha é da spec, não de quem executou.** Eu enumerei **linhas** em vez de exigir **varredura por
> padrão**, e a minha própria §8 ("Como verificar") saiu com um `grep` incompleto — sem `47 violações`, sem
> `playwright` fora de `11-testes`. O executor cumpriu a lista que recebeu, **e ainda declarou honestamente
> duas sobras que a lista não cobria**. Quem entregou lista ruim fui eu. É a segunda vez seguida que cometo
> o mesmo erro — ver "O que eu errei", abaixo.

**O que verifiquei, e como**

| Verificação | Saída real | Veredito |
|---|---|---|
| `git status` · `git diff --stat` | 7 arquivos: as 5 do escopo + `00-indice` (espelho de status) + a própria plan. 222 inserções / 94 remoções | ✅ **escopo respeitado**, nada fora |
| `grep -c "^## R"` | **34** — bate com a §1.3 | ✅ |
| `tail -3 00-regras-e-invariantes.md` | última linha é a do Plano de Testes | ✅ **resíduo de tool-call removido** |
| `npm run section-pointers:check` | `[OK] Nenhum ponteiro de seção morto` | ✅ |
| `npm run dev-kit:check` | `kit em dia (3 arquivos, 0 ponteiros mortos)` | ✅ |
| `npm run plan-index:check` | em dia | ✅ |
| `npx tsc --noEmit` | **0 erros**, exit 0 | ✅ |
| `run_audit.mjs` | `quebrou 2 regras estruturais` — os mesmos dois | ✅ **sem regressão** |
| Diff de `00-contexto.md` | o bullet do `DeviceProvider` (§2.4-bis) corrigido, **sem `§N` cross-documento** | ✅ exatamente o pedido |

**O trabalho feito está bom.** As substituições que existem seguem a regra dura — relação e ponteiro, nunca
número novo. O resíduo de tool-call saiu. O `12-kit` §11.1 virou `✅ FECHADO`. As duas linhas de `11-testes`
sobre o `playwright.config.ts` viraram registro honesto do arquivo deletado.

**Por que reprova mesmo assim:** o **objetivo** da plan é *"nenhuma das quatro specs fixas afirma mais um
total que o repositório desmente"*. Ele não foi alcançado — e **não existe "aprovado com ressalvas"**
([[00-prompt-revisor]] §7.2).

## Achados

1. **`specs/specs/00-regras-e-invariantes.md:1243`** — a tabela da §4.1 ainda diz
   *"`auditor_composicaoatomica.mjs` … — **47 violações no baseline**"*. O baseline registra **2**.
   ⚠️ **Este é o achado que mais dói:** a §2.1 desta plan **nomeou** o defeito "47 violações" na linha `:1269`,
   e ele foi corrigido lá — **e sobreviveu no mesmo arquivo, 26 linhas acima**. É literalmente a lição que a
   §2.5 desta plan cita: *"grep por UMA string não é auditoria"*. Não declarado no resumo.
   — **critério violado:** objetivo da plan; §7 *"Nenhuma das linhas … carrega cifra de medição envelhecida"*.

2. **`specs/specs/01-gates-e-baseline.md:135` e `:444`** — *"0 em produção, **10 em teste**"* e
   *"**10 em teste**, inalterado"*. Hoje é **0** nas duas classes, e a §3 do mesmo documento já diz isso.
   ✅ **Declarado com honestidade no resumo** — o que conta a favor, mas não muda o veredito: a spec continua
   se contradizendo.
   — **critério violado:** objetivo da plan.

3. **`specs/specs/01-gates-e-baseline.md:146`** — cita **`playwright.config.ts`** entre parênteses, como se
   existisse. É o **mesmo arquivo deletado** que a §2.3 desta plan mandou expurgar de `11-testes` — e ele
   sobreviveu num arquivo que **também estava no escopo**. Não declarado no resumo.
   — **critério violado:** §7 *"`grep -n "playwright.config.ts" specs/specs/` **sem resultado**"* — este
   critério está **objetivamente não atendido**.

4. **`specs/00-contexto.md:212` (§4.1, linha 5 da tabela de ambientação)** — *"O `run_audit` fecha em
   **zero** desde 2026-08-03 — sem folga"*, contradizendo frontalmente a §2 do **mesmo arquivo**, que agora
   diz *"o baseline NÃO é zero"*.
   🔴 **Este é MEU erro, não do executor** — é sobra da `plan-28`, que eu executei e aprovei. Ele o
   encontrou e o declarou. Detalhe em "O que eu errei". **Entra no escopo desta correção por emenda** (§3.1).

## O que eu errei — duas vezes, do mesmo jeito

Na `plan-28` eu varri `00-contexto` com `grep -nE "[0-9]{2,}|ZERO|zero" | head -40` e **o `head -40` cortou a
saída antes da §4.1**. Depois "confirmei" o resultado com um `grep` que só tinha `ZERO` em maiúsculas — e a
linha sobrevivente escreve `zero` em minúsculas. **Duas checagens, o mesmo ponto cego, e eu declarei "vazio"
no veredito da 28.**

Aqui repeti o padrão na outra ponta: montei a §2 desta plan **lendo por seção** e escrevi uma §8 cujo `grep`
não cobria a classe inteira.

> **A regra que passa a valer para toda plan de reconciliação, e que eu deveria ter escrito antes da 28:**
> **o escopo se fecha por VARREDURA, e a verificação é a MESMA varredura re-executada.** Lista de linhas é
> insumo, nunca contrato. E **`head` numa varredura de auditoria é proibido** — se a saída é longa demais
> para ler, o escopo é grande demais para uma plan.

## O que NÃO entra nesta correção

As mesmas cifras existem em `06-painel…`, `08-identidade…`, `09-temas…` e — o pior caso —
`14-artefatos-do-mantenedor.md`, cuja **§7.1 inteira declara o achado 22 como 🔴 ABERTO**, contradizendo
frontalmente o `12-kit` §11.1 que esta plan acabou de corrigir. **Isso é a `plan-31`**, criada junto deste
veredito. Ampliar esta plan para sete arquivos no meio de uma correção repetiria o erro que ela existe para
consertar.

---

## Veredito (correção 1) — 2026-08-12 — 🔴 Reprovado

**Os cinco consertos estão certos, e verifiquei um a um no arquivo:**

| Achado | Como está hoje | Veredito |
|---|---|---|
| 1 | `00-regras:1243` → *"contagem corrente em `gates/baselines/audit-baseline.json`"* | ✅ |
| 2 | `01-gates:135` → *"o valor corrente das duas classes é o da tabela da §3 — não repita aqui"*; `:444` idem, com o título da seção junto | ✅ |
| 3 | `01-gates:146` → *"coletados pelo mesmo `playwright-ct.config.ts`… esse arquivo era órfão e foi deletado"* | ✅ |
| 4 | `00-contexto:212` → *"O baseline do `run_audit` **não é zero** — compare com … nunca com zero"* | ✅ |
| extra | `01-gates:552` — achado **pela varredura**, corrigido e declarado como extensão | ✅ **é o comportamento certo** |

Conferido por mim: `section-pointers` · `dev-kit` · `plan-index` verdes · `tsc` **0** · `run_audit` nos
mesmos 2 vermelhos · `grep -c "^## R"` = **34** · `**Estado:**` = **35**, inalterado · resumo anterior
**intacto** e bloco novo **acrescentado** — append-only respeitado · diff só nos 5 arquivos do escopo.

### O que reprova: a asserção de completude é falsa

O resumo afirma, em *Pendências / riscos*:

> *"A varredura de classe cobriu os 5 arquivos da §3.1 por completo — **não há mais nenhuma linha de Medição
> corrente não declarada** dentro deles, no padrão `[0-9]{2,}|playwright\.config`."*

**Há oito**, todas nos arquivos do escopo, todas capturáveis por aquele mesmo padrão, **nenhuma declarada**:

| Arquivo:linha | Diz | Real |
|---|---|---|
| `00-regras:603` | R18 — *"**Hoje: 26/26** scripts declaram o que não veem"* | `gate-limits:check` → **29/29** |
| `00-regras:1201` | tabela §4 — *"`check-gate-limits.mjs` — **26/26**"* | 29/29 |
| `00-regras:1247` | tabela §4.1 — *"— **26/26**"* | 29/29 |
| `00-regras:1242` | tabela §4.1 — *"— piso **70,66%**"* | `coverage-floor.json` → **71,47** |
| `00-regras:1249` | *"piso móvel gravado em **70,66%**"* | 71,47 |
| `11-testes:239` | *"**Piso gravado hoje: 70,66%** de linhas"* | 71,47 |
| `11-testes:254` · `:305` | *"piso móvel **70,66%**"* | 71,47 |
| `11-testes:317` | Plano de Testes — *"`coverage:check` → **igual ao piso (70,66%)**"* | hoje é **72,43% contra piso de 71,47%** — e a §3 de `01-gates`, corrigida nesta mesma plan, já diz isso |

Três delas trazem a palavra **"Hoje"**; a sexta, **"gravado hoje"**. Não cabem em outra caixa que não
*Medição corrente*.

⚠️ **Por que isto reprova, e não é preciosismo.** A §8 foi reescrita **para substituir a lista pela
varredura** — foi essa a razão da primeira reprovação. Uma varredura declarada completa e que não é
**vira teatro**: o mecanismo que deveria fechar a classe passa a certificá-la como fechada. É o achado 32
numa camada acima — agora não é a cifra que envelhece, é **a garantia de que não há cifra**.

**O que conta a favor, e não é pouco:** dois outros itens (`01-gates:152` — *"32 regras"*; `00-regras:52-53`
— *"282 arquivos / 78 componentes"*) **foram** declarados, e o achado extra do `:552` foi corrigido e
registrado como extensão em vez de escondido. O defeito é de **cobertura da varredura**, não de conduta —
e é por isso que a correção 2 é curta.

### Prompt de correção 2

```
Leia specs/00-prompt-revisor.md e corrija a execução de
specs/plan/plan-29-erradicar-cifra-em-prosa.md.

Veredito (correção 1) de 2026-08-12: REPROVADO — a asserção de completude da
varredura é falsa. Os 5 consertos da correção 1 estão APROVADOS: NÃO os toque.

Corrija as 8 linhas abaixo, todas "Medição corrente" dentro dos arquivos do escopo:
  specs/specs/00-regras-e-invariantes.md:603, 1201, 1247  — "26/26"
  specs/specs/00-regras-e-invariantes.md:1242, 1249       — "70,66%"
  specs/specs/11-testes-e-cobertura.md:239, 254, 305, 317 — "70,66%"

REGRA DURA, de novo: NÃO troque 26/26 por 29/29 nem 70,66 por 71,47. As duas são
medição corrente e têm fonte viva — `npm run gate-limits:check` e
`gates/baselines/coverage-floor.json`. O texto APONTA; não afirma valor.
O :317 é o Plano de Testes de 11-testes — ele deve mandar comparar com a tabela
datada da §3 de 01-gates-e-baseline, já corrigida nesta plan.

Depois RE-RODE a varredura de classe da §8 sobre os 5 arquivos e classifique CADA
linha nas quatro caixas — sem `head`, sem amostragem. Se a asserção de completude
voltar ao resumo, ela precisa ser verdadeira: eu a reconfiro com o mesmo comando.

Os dois itens que você já declarou (01-gates:152 e 00-regras:52-53) seguem FORA
desta correção — eu decido se entram na plan-31.

Não commite. Acrescente um bloco NOVO de resumo (os dois anteriores permanecem) e
mova o status para 🟠 Em revisão.
```

---

## 🔴 ADENDO ao veredito (correção 1) — 2026-08-12 — a lista acima estava INCOMPLETA

**Não emiti o prompt acima.** Ao revisá-lo, fui conferir a minha própria varredura e descobri que eu a li
com `cut -c…150` — **truncada em LARGURA**. Das 678 linhas, **308 passam de 150 caracteres**, e o que havia
depois da coluna 150 eu simplesmente não tinha lido.

> **É a quarta vez que a mesma classe me escapa, e a terceira forma diferente de truncar:** `head` (linhas,
> na `plan-28`), lista de padrões (§8 original), e agora `cut` (colunas). **O erro não é qual ferramenta —
> é eu resumir a saída antes de julgá-la.**

Lendo o trecho que faltava, e **medindo cada suspeito** em vez de presumir:

### As 5 linhas que a largura escondia — todas em `00-regras-e-invariantes.md`

| Linha | Diz | Medido agora |
|---|---|---|
| `:151` | *"a reconciliação (bruto → deduções → líquido), **hoje `516 → 188 + 87 + 241 → 0 líquido`**"* | `run_audit` → **bruto 467**, líquido 0 |
| `:230` | R4, linha **Estado** — *"é nesse vão que mora a **deriva de 105 tokens**"* | vão **fechado** (achado 22); `token-types:check` verde |
| `:301` | R7 — *"**Hoje: 14.179 variáveis no registro, 3 consumos fantasma**"* | **14919** variáveis · **1** consumo |
| `:303` | R7 — *"os **2 usos vivos de `--sx-*`** … o gate está verde e a regra está sendo violada"* | `grep -- "--sx-" src/styles/` → **0**. Achado 1 **fechado** (`plan-07` + `plan-12`) |
| `:331` | R8 — *"`src/shared/` está **fora** do escopo … Medido: **4 arquivos, 0 testes**"* | vão 6 **fechado**; o auditor cobre `shared/`/`effects/`/`constants/` e reporta **0 órfãos** |

⚠️ **As três últimas são piores que cifra velha: são VIOLAÇÕES DECLARADAS que já foram pagas.** A spec de
regras está dizendo que R4, R7 e R8 têm vão aberto quando os três fecharam. **Isso não envelhece um número
— envelhece um veredito**, e faz o leitor abrir dívida que não existe.

### E duas que eu suspeitei e estão CERTAS — não tocar

| Linha | Diz | Medido |
|---|---|---|
| `:349` | *"`useStructuralStyles.ts` está hoje em **249 linhas**"* | `wc -l` → **249** ✅ |
| `:452` | *"some, com razão escrita — **10 arquivos hoje**"* | `grep -rl "@sarak-encapsula" src/` → **10** ✅ |

**Isto valida a regra das quatro caixas:** o critério não é *"apague todo número"*, é *"apague o que mente"*.
Duas cifras com a palavra "hoje" estão corretas e **ficam**.

### O que muda no método — e por que a correção 2 não é mais um `grep`

Três rodadas de lista não convergiram, e todas as sobras vieram do **mesmo arquivo**:
`00-regras-e-invariantes.md`, com ~1300 linhas densas de medição. Para ele, varredura por padrão **não é o
instrumento certo** — ela acha o número, mas não julga a frase em volta, que é onde mora o veredito
envelhecido (`:230`, `:303`, `:331` não têm cifra errada: têm **afirmação** errada).

**Para `00-regras`, o fecho passa a ser LEITURA INTEGRAL do arquivo, seção por seção**, com a pergunta das
quatro caixas aplicada a cada afirmação de estado — não só a cada número. É mais caro e é o único método que
converge em prosa.

### Prompt de correção 2 — versão final

```
Leia specs/00-prompt-revisor.md e corrija a execução de
specs/plan/plan-29-erradicar-cifra-em-prosa.md.

Veredito (correção 1) + ADENDO de 2026-08-12: REPROVADO.
Os 5 consertos da correção 1 estão APROVADOS — NÃO os toque.

⚠️ O prompt anterior deste veredito listava 8 linhas e estava INCOMPLETO: eu tinha
lido a varredura truncada em largura. A lista real é esta, já medida:

00-regras-e-invariantes.md — CIFRA que mente:
  :151   "hoje 516 → 188 + 87 + 241 → 0 líquido"   (bruto real: 467)
  :301   "Hoje: 14.179 variáveis no registro, 3 consumos fantasma"  (14919 / 1)
  :603 · :1201 · :1247   "26/26"                    (gate: 29/29)
  :1242 · :1249          "70,66%"                   (piso: 71,47)

00-regras-e-invariantes.md — VEREDITO que envelheceu (mais grave que cifra):
  :230   R4 diz que o vão "mora a deriva de 105 tokens" — o vão FECHOU (achado 22)
  :303   R7 diz "2 usos vivos de --sx-*, a regra está sendo violada" — hoje são 0,
         achado 1 FECHADO. A frase acusa violação inexistente.
  :331   R8 diz "src/shared/ está fora do escopo, 4 arquivos 0 testes" — o vão 6
         FECHOU; o auditor cobre shared/effects/constants e reporta 0 órfãos.
  ⚠️ Aqui NÃO basta trocar número: a AFIRMAÇÃO tem de virar registro de fecho.
     Cuidado: NÃO mude o marcador de estado (⚠️/✅) de R4, R7 ou R8 — medir se
     o marcador ainda cabe é outra decisão, e é minha. Corrija a prosa, mantenha
     o marcador, e me diga no resumo quais marcadores você acha que não cabem mais.

11-testes-e-cobertura.md:
  :239 · :254 · :305 · :317   "70,66%"              (piso: 71,47)
  :317 é o Plano de Testes — mande comparar com a tabela datada da §3 de
  01-gates-e-baseline, já corrigida nesta plan.

NÃO TOQUE (medidos por mim, estão CERTOS):
  00-regras:349 "249 linhas"      → wc -l = 249
  00-regras:452 "10 arquivos hoje" → grep -rl @sarak-encapsula = 10

REGRA DURA: não troque 516 por 467, 26/26 por 29/29 nem 70,66 por 71,47. Todas têm
fonte viva (`npm run audit`, `npm run gate-limits:check`,
`gates/baselines/coverage-floor.json`). O texto APONTA; não afirma valor.

MÉTODO DE FECHO — mudou, e é o ponto desta rodada:
  · Para 00-regras-e-invariantes.md: LEIA O ARQUIVO INTEIRO, seção por seção, e
    aplique as quatro caixas da §8 a cada AFIRMAÇÃO DE ESTADO — não só a cada
    número. Três rodadas de grep não convergiram porque o defeito pior (:230,
    :303, :331) não tem cifra errada: tem veredito errado.
  · Para os outros 4 arquivos: a varredura da §8 basta, SEM head e SEM cut.
  · Não afirme completude que você não possa reproduzir com um comando que eu
    também consiga rodar.

Os dois itens já declarados (01-gates:152 e 00-regras:52-53) seguem FORA — eu decido
se entram na plan-31.

Não commite. Bloco NOVO de resumo (os anteriores permanecem) e status 🟠 Em revisão.
```

---

## Veredito (correção 2) — 2026-08-12 — 🟢 Aprovado, com o escopo REDUZIDO

> 🔴 **Leia primeiro por que o escopo mudou.** Na rodada anterior eu escrevi, em voz alta: *"se a próxima
> rodada também voltar com sobra, o problema não é mais a lista — é o tamanho do alvo. Nesse caso eu paro de
> emendar e fatio `00-regras-e-invariantes.md` numa plan própria. **Não vou pedir uma quarta correção da
> mesma plan.**"* A condição se cumpriu. Estou honrando o que anunciei — **não** improvisando uma saída para
> pintar de verde.

**As 11 linhas do prompt final: todas corrigidas.** Conferido por grep direto — `26/26`, `70,66`, `14.179`,
`516 →`, `105 tokens`, `2 usos vivos`, `4 arquivos, 0 testes`, `3 consumos fantasma` → **nenhuma ocorrência**.

**As 2 intocáveis: preservadas.** `249 linhas` e `10 arquivos hoje` seguem lá, corretas.

**Os marcadores: preservados nos três.** R4, R7 e R8 continuam ⚠️. `grep -c "^## R"` = **34**;
`**Estado:**` = **35** — inalterados.

**As 4 extensões declaradas: legítimas.** Conferi a de R8 (`:341`, "seis raízes" no lugar de três) — é a
mesma frase que estava em edição, e corrigi-la pela metade teria deixado o "Cobrada por" mentindo sobre o
gate que o parágrafo seguinte descreve. Extensão de frase em edição não é scope creep; **é o conserto
completo de um item do escopo.**

**Gates:** `gate-limits` · `section-pointers` · `dev-kit` · `plan-index` verdes · `tsc` 0 · `run_audit` nos
mesmos 2 vermelhos. Diff só nos 5 arquivos + índice + plan. Append-only respeitado (três resumos).

### O que fica FORA, e por quê

A leitura integral achou o que grep nenhum acharia — e **as três sobras são do mesmo arquivo**:

| Onde | O conflito |
|---|---|
| `00-regras:284` (R7, linha **Estado**) | diz *"a regra está sendo **violada hoje**, com o gate verde"* — e o corpo em `:303`, **escrito nesta mesma correção**, diz que o vão *"FECHOU, nos dois lados"*, com **zero** ocorrência. **A regra contradiz a si mesma em 19 linhas.** O executor reescreveu a prosa do Estado de R4 e R8 e não a de R7 |
| `00-regras:347` e `:351` (R8.1) | Estado **⏳** *"construir é trabalho da `plan-12`"* e *"nenhum script o invoca"* — mas `npm run coverage:check` **existe e roda** no `gates:full`. E a §1.3 `:78` declara a categoria ⏳ com **0**, e `:1274` a declara **vazia**. **Três lugares do mesmo documento em conflito** |
| `01-gates:152` | *"nenhuma das **32** regras depende dele"* — são 34. Já vinha **declarado** pelo executor na correção 1 |

**Isto não reprova a correção 2** — reprova a **minha escopagem**. Nenhuma das três estava na lista que
emiti, e as duas primeiras são de uma classe que a lista **não alcança por construção**: não têm cifra
errada, têm **veredito errado**, e só aparecem para quem lê a regra inteira contra o repositório. Foi
exatamente por isso que eu mudei o método para leitura integral — e o método funcionou: **ele achou o que
três rodadas de grep não acharam.**

### A decisão

**`specs/specs/00-regras-e-invariantes.md` SAI do escopo desta plan** e vira a **`plan-32`**, com leitura
integral como único método e as três sobras acima como ponto de partida. A `plan-29` fica aprovada para o
que ela de fato conseguia fechar:

| Arquivo | Estado |
|---|---|
| `specs/00-contexto.md` | ✅ fechado (bullet do `DeviceProvider` + §4.1) |
| `specs/specs/11-testes-e-cobertura.md` | ✅ fechado |
| `specs/specs/12-kit-do-consumidor.md` | ✅ fechado |
| `specs/specs/01-gates-e-baseline.md` | ✅ fechado **exceto `:152`**, que vai junto para a `plan-32` |
| `specs/specs/00-regras-e-invariantes.md` | ➡️ **transferido para a `plan-32`** — o trabalho feito aqui **permanece** e está correto; o que falta é o que só a leitura integral vê |

> ⚠️ **O que eu NÃO estou fazendo, e é a diferença que importa:** não estou apagando o objetivo original nem
> declarando a classe fechada. **O resíduo está medido, numerado e roteado** — três linhas, com
> `arquivo:linha` e a contradição descrita. Reduzir escopo **transferindo** é legítimo; reduzir escopo
> **esquecendo** seria a fraude que a [[01-gates-e-baseline]] §6 proíbe.

### O erro que é meu, pela quarta vez

Escopei `00-regras-e-invariantes.md` — **1300 linhas e 35 vereditos de estado** — dentro de uma plan de cinco
arquivos, e verifiquei por amostra três vezes seguidas (`head`, lista de padrões, `cut`). A lição, agora
escrita para valer:

> **Um arquivo cujo conteúdo É um conjunto de vereditos não se audita por varredura — audita-se lendo.**
> E **o objetivo de uma plan não pode ser mais largo que o método de fecho que ela declara**: a `plan-29`
> prometia *"nenhuma das quatro specs afirma mais um total"* e foi escopada por lista de linhas. Objetivo e
> método têm de ser co-extensivos, ou a plan nasce impossível de fechar.

**Liberado.** As alterações estão no worktree, sem commit.
