---
tipo: "plan"
titulo: "Erradicar a cifra em prosa das specs fixas"
dominio: "Sarak-Lib-UI-Core / Governança de Specs"
status: "🔴 A executar"
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
- `specs/00-contexto.md` — **um único bullet**, o da §2.4-bis. Nada mais: o resto do arquivo foi fechado pela
  `plan-28` e está aprovado
- `specs/specs/00-regras-e-invariantes.md` — §2.1 e §2.5 desta plan, **mais** o resíduo de tool-call do fim
  do arquivo (§5, passo 0)
- `specs/specs/01-gates-e-baseline.md` — §2.2
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

```bash
git diff --stat                                     # exatamente 4 arquivos, todos em specs/specs/
git diff specs/specs/                               # ler INTEIRO — é uma plan de prosa; o diff É a entrega
tail -3 specs/specs/00-regras-e-invariantes.md      # sem markup de tool-call
grep -c "^## R" specs/specs/00-regras-e-invariantes.md
grep -rnE "409 / 409|120 itens|80 componentes|361 arquivo|14 erros|10 em teste|289 arquivos|275 arquivos|designTokens.count|playwright\.config\.ts|somando 32" specs/specs/
grep -nE "^\*\*Estado:\*\*" specs/specs/00-regras-e-invariantes.md | wc -l
npm run section-pointers:check && npm run dev-kit:check
node gates/scripts/audit/run_audit.mjs
```

- O quinto comando tem de voltar **vazio**, exceto onde a ocorrência for **histórico datado** — e aí o
  resumo do executor tem de tê-la declarado, item por item. Ocorrência não declarada é achado.
- O sexto tem de dar **o mesmo número** de antes da execução: nenhum marcador de regra pode ter mudado.
- Ler cada substituição com a pergunta de sempre: *"esta frase ainda estará certa depois da próxima plan
  que conserte um gate?"*

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

---

# 11. Veredito

<!-- Preenchido pelo REVISOR. Append-only. -->
