---
tipo: "plan"
titulo: "Segunda onda da cifra em prosa — as quatro specs que a plan-29 não alcançou"
dominio: "Sarak-Lib-UI-Core / Governança de Specs"
status: "🟢 Aprovada"
prioridade: "Alta"
tags: ["plan", "specs", "r17", "achado-32", "reconciliacao"]
relacionados: ["[[14-artefatos-do-mantenedor]]", "[[09-temas-e-presets]]", "[[06-painel-de-customizacao-e-preview]]", "[[08-identidade-do-host-e-zero-marca]]", "[[12-kit-do-consumidor]]"]
depende_de: "plan-29"
destino_sintese: "—"
objetivo: "Fechar a cifra em prosa nas quatro specs fixas restantes, com a spec do mantenedor primeiro"
---

> ⚠️ **Executada pelo REVISOR** (só toca `specs/`), e **toca specs fixas** — o que exige pedido explícito do
> usuário ([[00-prompt-revisor]] §3.1). Autorizar a execução **é** esse pedido.

# 1. Objetivo

Nenhuma spec fixa desta base afirma um total que o repositório desmente — e **nenhuma delas contradiz outra**
sobre o estado de um achado.

# 2. Contexto

A [[plan-29]] fechou quatro specs. A varredura do **veredito de reprovação dela** (2026-08-12) mostrou que a
mesma classe vive em **outras quatro** — e num caso ela produz **contradição direta entre duas specs fixas**,
que é a divergência de primeira ordem que [[00-prompt-revisor]] §2 manda tratar como prioritária.

**Tudo abaixo foi medido no worktree em 2026-08-12**, com `arquivo:linha`.

## 2.1 🔴 `14-artefatos-do-mantenedor.md` — o caso grave, e o motivo de esta plan existir agora

**A §7.1 inteira declara o achado 22 como `🔴 ABERTO`**, com título *"`design-token-ids.ts` está DEFASADO — e
o gerador não está em pipeline nenhum"*.

**O achado 22 está FECHADO** desde 2026-08-05 (`plan-12`, Lote A) — [[15-divida-conhecida]] §6 registra, e
`npm run token-types:check` responde *"em dia (422 tokens)"*, rodando no `build` e no Anel 1 do `pre-commit`.

⚠️ **E a `plan-29` acabou de corrigir a §11.1 de [[12-kit-do-consumidor]] para `✅ FECHADO` — sobre o mesmo
achado.** As duas specs fixas agora **se contradizem frontalmente**: uma diz fechado, a outra diz aberto, e a
que diz aberto é a que o **mantenedor** lê para se orientar.

| Linha | Diz | Real |
|---|---|---|
| `:175-208` | §7.1 inteira: achado 22 **aberto**, *"NÃO corrigido aqui… Roteado para a Fase B da Campanha 2"* | **fechado** (`plan-12`); gate `token-types:check` verde |
| `:185-186` | tabela *"409 / **304** / diferença **105 tokens**"* | as três fontes convergem; o tipo gerado bate |
| `:190-192` | *"o último commit do arquivo gerado é de 2026-06-27"* | superado pelo conserto |
| `:75-77` | `state.json`: *"416 entradas brutas · **409 ids únicos**"*, *"13 arquivos · 409 tokens"*, *"**304 ids**"* | o `state.json` é **gerado** e está em dia — a prosa que o descreve é que envelheceu |
| `:80` | *"`componentes.publicos` — **81**"* | o gate reporta outro número; a fonte é `collectPublicComponentNames()` |
| `:82` | *"`auditores` — **os 8**"* | são 12 |
| `:96-98` | §3.1 *"os quatro números de token lado a lado"*, com `416`, `409` e `304` | a divergência que a seção explica **foi fechada** |

> **Cuidado que o executor precisa ter aqui:** a §3.1 daquele documento defende uma **ideia boa** — publicar
> as contagens lado a lado, porque a divergência entre elas é informação. **A ideia fica; os números saem.**
> O texto passa a explicar *o que cada contagem significa e por que vê-las juntas importa*, apontando o
> `state.json` como quem as tem.

## 2.2 `09-temas-e-presets.md`

| Linha | Diz | Real |
|---|---|---|
| `:256-263` | tabela *"Temas globais **18** · presets **102** · total **120 itens** · gabarito **409 chaves**"* | 23 temas · 125 itens · 422 chaves — e a própria §5.1 logo abaixo **já avisa** que a tabela envelheceu |
| `:321` | §6.1 *"gabarito de **409 chaves**, **120 itens** auditados"* | idem |
| `:343` | §6.3 *"cada um dos **18** temas"* | 23 |
| `:104` · `:353` · outras | *"os 18 temas"* onde o sentido é *"os temas shippados"* | ⚠️ **cuidado:** em alguns pontos "os 18" designa os **18 legados isentos de contraparte**, que é um conjunto real e nomeado. **Esses ficam** |

## 2.3 `06-painel-de-customizacao-e-preview.md`

| Linha | Diz | Real |
|---|---|---|
| `:229-236` | §9.1 *"um dos 4 erros de produção mora aqui"* e *"`tsc` não é gate hoje — **14 erros** no baseline, dos quais **4 em produção**"* | **0 erros**, produção e teste. A seção descreve dívida **quitada** |

## 2.4 `08-identidade-do-host-e-zero-marca.md`

| Linha | Diz | Real |
|---|---|---|
| `:150-155` | §7.2 *"baseline medido"*, com a saída `361 arquivo(s)` e a discussão de 363 → 361 | o gate varre outro número hoje |

⚠️ **Aqui a correção é a mais delicada da plan, e o texto atual já sabe disso:** aquela mesma seção diz, com
todas as letras, que **"o número que importa é o de violações: 0"** e que o total de arquivos varridos
acompanha o tamanho do `src/`. **A seção quase se conserta sozinha** — basta parar de reproduzir o total e
manter a lição. É o exemplo mais limpo de "afirme a relação, não a cifra" desta base.

# 3. Escopo

## 3.1 Dentro
- `specs/specs/14-artefatos-do-mantenedor.md` — §2.1 *(primeiro: é o que produz contradição entre specs)*
- `specs/specs/09-temas-e-presets.md` — §2.2
- `specs/specs/06-painel-de-customizacao-e-preview.md` — §2.3
- `specs/specs/08-identidade-do-host-e-zero-marca.md` — §2.4

## 3.2 Fora
- ⛔ Os **cinco arquivos da `plan-29`** — fechados e aprovados por ela. Reabrir arquivo aprovado é refazer
  trabalho verificado.
- ⛔ **`specs/specs/15-divida-conhecida.md`.** As cifras dela são **registro de achado**, com número e data —
  é o livro-caixa da dívida, e ali o número **é** o conteúdo.
- ⛔ Qualquer código, gate, script ou config.
- ⛔ Mudar marcador de estado de regra, enunciado ou numeração.
- ⛔ Remover bloco histórico. Sai a afirmação de **presente** que envelheceu; o registro datado fica.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Plan | `specs/plan/plan-29-erradicar-cifra-em-prosa.md` §5 e §8 | **a regra dura e a varredura de classe já estão escritas lá** — esta plan as reusa, não as reescreve |
| Spec fixa | `specs/specs/15-divida-conhecida.md` §6 (achados 22 e 32) · §8 | a prova de que o achado 22 fechou, e o contrato de manutenção |
| Fonte viva | `npm run audit` · `npm run token-types:check` · `sarak-dev/state.json` · `gates/baselines/audit-baseline.json` | a verdade contra a qual cada linha é conferida |

# 5. Instruções de execução

> **A regra dura é a da `plan-29` §5**, sem alteração: onde havia um **total**, entra a **relação** mais o
> **ponteiro para a fonte viva**. Não troque número velho por número novo.

1. **`14-artefatos` §7.1 — PRIMEIRO, e sozinho.** A seção deixa de declarar achado aberto e passa a registrar
   o **fecho**: o que era, o que fechou (`plan-12`, Lote A, 2026-08-05), e o gate que o sustenta
   (`token-types:check`, no `build` e no Anel 1). Apontar o achado 22 em [[15-divida-conhecida]] §6.
   **Pronto quando** nenhuma spec fixa descrever o achado 22 como aberto — conferido por
   `grep -rn "design-token-ids" specs/`.
2. **`14-artefatos` §3 e §3.1** — as contagens do `state.json` saem; **a ideia da §3.1 fica** (ver o aviso na
   §2.1 desta plan). O texto passa a dizer *o que* cada contagem mede e *por que* vê-las juntas importa,
   mandando ler o `state.json`, que é gerado e está em dia.
3. **`09-temas`** — as tabelas de contagem apontam `npm run audit` (`auditor_presets`) e `GLOBAL_THEMES`.
   ⚠️ **Distinga os dois "18"**: o total de temas shippados (envelhece — sai) e os **18 legados isentos de
   contraparte** (conjunto nomeado e real — fica).
4. **`06-painel` §9.1** — a dívida de `tsc` **foi quitada**; a seção vira registro do fecho, não pendência.
5. **`08-identidade` §7.2** — parar de reproduzir o total de arquivos varridos, **mantendo a lição** que a
   própria seção já enuncia: o número que importa é o de **violações**.
6. **Rodar a varredura de classe da `plan-29` §8**, adaptada aos quatro arquivos desta plan, **lendo a saída
   inteira, sem `head`**, e declarar no resumo em que caixa cai cada linha remanescente.
7. **Rodar e colar a saída:** `npm run section-pointers:check` · `npm run dev-kit:check` ·
   `node gates/scripts/audit/run_audit.mjs` · `git diff --stat`.

# 6. Prompt de execução

```
Leia specs/00-prompt-revisor.md e execute specs/plan/plan-31-segunda-onda-cifra.md.

Executada pelo REVISOR, e toca SPECS FIXAS — confirme a autorização explícita do usuário
antes de editar (00-prompt-revisor §3.1).

Pré-requisito: a plan-29 tem de estar 🟢 Aprovada.

Contexto obrigatório: specs/plan/plan-29-erradicar-cifra-em-prosa.md (§5 = a regra dura,
§8 = a varredura de classe e as quatro caixas de classificação),
specs/specs/15-divida-conhecida.md (§6 achados 22 e 32, e §8), e a §2 desta plan — que já
traz TODA a medição com arquivo:linha. Não refaça a investigação.

COMECE PELO 14-artefatos §7.1: é o único achado que faz DUAS SPECS FIXAS SE CONTRADIZEREM
(ela diz que o achado 22 está aberto; a 12-kit, corrigida pela plan-29, diz que fechou).

REGRA DURA: onde havia um TOTAL, entra a RELAÇÃO mais o ponteiro para a fonte viva.

O ESCOPO SE FECHA POR VARREDURA, NÃO POR LISTA — e `head` é proibido nela. Foi um `head`
que produziu o ponto cego da plan-28, e foi uma lista incompleta que reprovou a plan-29.
Classifique CADA linha remanescente numa das quatro caixas da plan-29 §8 e declare no
resumo.

LINHAS VERMELHAS:
  · Você NÃO toca nos cinco arquivos da plan-29 (aprovados) nem em 15-divida-conhecida.
  · Você NÃO muda marcador, enunciado ou numeração de regra.
  · Você NÃO remove bloco histórico datado — só a afirmação de PRESENTE que envelheceu.
  · Na 14-artefatos §3.1, a IDEIA de publicar as contagens lado a lado FICA; os números saem.

Não commite. Ao terminar, escreva o resumo na própria plan e mova o status para
🟠 Em revisão.
```

# 7. Critérios de aceite

- [ ] **Nenhuma spec fixa descreve o achado 22 como aberto** — `grep -rn "design-token-ids" specs/` só
      devolve registro de fecho.
- [ ] `14-artefatos` e `12-kit` **concordam** sobre o estado daquele achado.
- [ ] A **ideia** da §3.1 de `14-artefatos` (contagens lado a lado como informação) sobreviveu; os números não.
- [ ] Em `09-temas`, os **18 legados isentos de contraparte** continuam nomeados como conjunto real; o total
      de temas shippados saiu.
- [ ] `06-painel` §9.1 registra o **fecho** da dívida de `tsc`, não uma pendência.
- [ ] `08-identidade` §7.2 mantém a lição (*"o que importa é o número de violações"*) sem reproduzir o total.
- [ ] A **varredura de classe** foi rodada sobre os 4 arquivos, **sem `head`**, e cada linha remanescente está
      classificada no resumo numa das quatro caixas.
- [ ] `section-pointers:check` · `dev-kit:check` verdes; `run_audit` no baseline.
- [ ] `git diff --stat` — **exatamente 4 arquivos**, todos em `specs/specs/`.

# 8. Como verificar (uso do revisor)

```bash
git diff --stat                                  # 4 arquivos, todos em specs/specs/
git diff                                         # ler INTEIRO
grep -rn "design-token-ids" specs/               # só registro de fecho
grep -nE "[0-9]{2,}" specs/specs/14-artefatos-do-mantenedor.md \
                     specs/specs/09-temas-e-presets.md \
                     specs/specs/06-painel-de-customizacao-e-preview.md \
                     specs/specs/08-identidade-do-host-e-zero-marca.md
npm run section-pointers:check && npm run dev-kit:check
node gates/scripts/audit/run_audit.mjs
```

O quarto comando é o que decide: **saída lida inteira**, cada linha caindo numa das quatro caixas da
[[plan-29]] §8, e **cada classificação conferida contra o repositório** — não contra o resumo do executor.

# 9. Destino da síntese

**Destino:** `—`

A execução já escreve nas specs fixas, que são o alvo. Nada fica pendente de transporte.

---

# 10. Resumo da execução

<!-- Preenchido pelo REVISOR-executor. Append-only. -->

## Resumo da execução — 2026-08-12

**Resultado:** Concluído

**O que foi feito**
- `specs/specs/14-artefatos-do-mantenedor.md:178-201` — §7.1 deixou de declarar o achado 22 como
  `🔴 ABERTO` e passou a registrar o fecho (`plan-12`, Lote A, 2026-08-05; `token-types:check` no
  `build` e no Anel 1 do `pre-commit`) — porque a `12-kit-do-consumidor.md` (corrigida pela
  `plan-29`) já dizia fechado, e as duas specs se contradiziam.
- `specs/specs/14-artefatos-do-mantenedor.md:70-106` — a tabela do `state.json` (§3) e o texto dos
  "quatro números de token" (§3.1) deixaram de fixar contagem (28 schemas, 416/409/304, 81
  componentes, 9 gates, "os 8" auditores); cada linha passou a descrever *o que* a chave contém e
  a apontar a fonte viva. **A ideia da §3.1 — publicar as quatro contagens juntas como
  informação — foi preservada**, só os números saíram.
- `specs/specs/09-temas-e-presets.md:254-267` — §5 ("números MEDIDOS", tabela `18/102/120/409`)
  virou §5 ("números DERIVADOS"): sem tabela fixa, apontando `npm run audit`
  (`auditor_presets`) e `GLOBAL_THEMES`. O aviso de "tabela envelheceu" em §5.1 saiu — deixou de
  fazer sentido depois que a própria §5 parou de fixar número.
- `specs/specs/09-temas-e-presets.md:314,327,337,362,366` — §6.1 ("409 chaves, 120 itens
  auditados"), §6.2 ("os 18 temas + os 102 presets"), §6.3 ("cada um dos 18 temas") e §6.5 (duas
  ocorrências de "os 18 temas"/"18 shippados") pararam de fixar o total de temas/itens shippados.
  **Distingui os dois "18"**, como a plan mandou: os **18 legados isentos de contraparte**
  (`:56-58`, `:221` — lista nomeada e real, verificada ao vivo em `verify_contrast.ts`, que
  imprime "18 tema(s) isento(s)") **ficaram intocados**; só o total de temas *shippados* (que
  cresceu de 18 para 23) saiu das linhas onde o sentido era esse.
- `specs/specs/06-painel-de-customizacao-e-preview.md:229-236` — §9.1 ("um dos 4 erros de
  produção mora aqui", "14 erros no baseline") virou "✅ FECHADO": `npx tsc --noEmit` fecha com 0
  erros hoje (confirmado ao vivo); o texto vira registro do fecho, apontando
  [[01-gates-e-baseline]] §3 como fonte do baseline corrente.
- `specs/specs/08-identidade-do-host-e-zero-marca.md:149-157` — §7.2 ("baseline medido", saída
  fixa "361 arquivo(s)", discussão 363→361) parou de reproduzir o total de arquivos varridos
  (medido ao vivo hoje: 363, mas o número não entrou na spec — o texto manda rodar o comando).
  **A lição que a própria seção já enunciava foi preservada**: "o número que importa é o de
  violações: 0".
- `specs/specs/08-identidade-do-host-e-zero-marca.md:244` — o critério de aceite que citava
  "baseline medido (363/0)" passou a citar o comando (`npm run zero-brand:check`) e a propriedade
  (violações: 0), na mesma linha de raciocínio da §7.2.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `specs/specs/14-artefatos-do-mantenedor.md` | alterado | achado 22 (§7.1) passou de aberto para fechado; §3/§3.1 (tabela do `state.json`) pararam de fixar contagem |
| `specs/specs/09-temas-e-presets.md` | alterado | §5 (catálogo shippado) e §6.1/§6.2/§6.3/§6.5 pararam de fixar total de temas/presets/chaves; os 18 legados isentos de contraparte permaneceram nomeados |
| `specs/specs/06-painel-de-customizacao-e-preview.md` | alterado | §9.1 (dívida de `tsc`) virou registro de fecho — 0 erros hoje |
| `specs/specs/08-identidade-do-host-e-zero-marca.md` | alterado | §7.2 parou de reproduzir o total de arquivos varridos, preservando a lição "o que importa é violações: 0" |
| `specs/plan/plan-31-segunda-onda-cifra.md` | alterado | `status` movido para 🟡 e, nesta mesma edição, resumo + `status` para 🟠 |

**Verificações executadas**
- `npm run token-types:check` → `[token-types:check] design-token-ids.ts em dia (422 tokens).` (exit
  0) — confirma o fecho do achado 22 antes de reescrever §7.1.
- `npx tsc --noEmit` → exit 0, 0 erros — confirma o fecho da dívida em `06-painel` §9.1.
- `npm run zero-brand:check` → `[zero-brand:check] 363 arquivo(s) varrido(s); zero marca da lib
  fora da allowlist.` (exit 0) — confirma que o gate varre outro número hoje (não usado como novo
  fixo na spec, só para saber que o `N` do bloco de código está correto).
- `npx tsx gates/scripts/audit/verify_contrast.ts` → `36 pares reais cobertos`, `25 par(es)-tema
  pulado(s)`, `0 par(es)-tema reprovado(s)`, `18 tema(s) isento(s) (legados, plan-25)` — confirma
  que os números de `09-temas` §6.5 (36, 25, 0, 18-legados) **já estavam corretos** e são
  Estrutura conferida, não Medição corrente; só as duas ocorrências que descreviam "18 temas
  verdes"/"18 shippados" (o **total**, não a isenção) precisavam sair.
- `node gates/scripts/audit/run_audit.mjs` → também imprimiu `Itens auditados: 125 (23 temas + 102
  presets)` e `Gabarito vivo (getScaffold()): 422 chaves reais` (via `auditor_presets`), e `422
  tokens validados nas 3 fontes` (via `auditor_paridade`) — confirma os valores reais citados na
  §2 da plan; **nenhum foi escrito como novo total fixo** nas specs (regra dura da plan).
- `npm run section-pointers:check` → `[OK] Nenhum ponteiro de seção (autorreferência) morto.`
  (190 cross-documento + 4 citação ignorados, fora do escopo do detector — exit 0).
- `npm run dev-kit:check` → `[dev-kit:check] kit em dia (3 arquivos, 0 ponteiros mortos).` (exit 0).
- `node gates/scripts/audit/run_audit.mjs` → exit 1 real (`echo $?` após redirecionar para
  arquivo, não via `| tail`), **2 auditores vermelhos** (`auditor_ghostvars` — 1 consumo fantasma;
  `auditor_composicaoatomica` — 2 ocorrências), **os mesmos dois** do baseline
  (`gates/baselines/audit-baseline.json`, `medidoEm: 2026-08-11`) — nenhuma regressão introduzida.
- `grep -rn "design-token-ids" specs/` → toda ocorrência em `specs/specs/` descreve o fecho (achado
  22); as ocorrências em `specs/plan/plan-28-*.md` e `plan-31` (esta plan) são histórico/processo,
  não spec fixa.
- `git diff --stat` → 5 arquivos: os 4 da §3.1 desta plan, mais a própria `plan-31` (autorizada
  pelo processo, mesmo padrão da `plan-29`).

**Varredura de classe (§8 da plan-29, adaptada aos 4 arquivos desta plan) — `grep -nE
"[0-9]{2,}"`, saída lida inteira, sem `head`, rodada DEPOIS de cada edição:**

- `14-artefatos-do-mantenedor.md` (17 linhas remanescentes) — 100% **Identidade** (`arquivo:linha`,
  "achado 22", "P23"/"P24", datas) ou **Histórico datado** ("Fechado pela `plan-12`
  (Lote A, 2026-08-05)"). Zero Medição corrente restante.
- `09-temas-e-presets.md` (73 linhas remanescentes) — a maioria **Identidade**
  (`arquivo.ts:42`) e **Histórico datado** (blocos `*(plan-24, ...)*`, `*(plan-25,
  2026-08-11)*`, `*(plan-26/27, 2026-08-11)*`, `*(plan-24-1, 2026-08-11)*`, cada um narrando um
  evento datado e fechado — inclusive o "12 dos 18" de §6.5, que é o relato histórico da
  descoberta que criou o `auditor_contraste`, e a tabela "Concentração 18 | 23" de §5.1, que é
  comparação antes/depois datada). **Estrutura conferida ao vivo, batendo com o script**: "36
  pares reais", "25 pulados", "0 e 0" (§6.5) e os **18 legados isentos de contraparte**
  (`:56-58`, `:221` — nome de conjunto real, confirmado por `verify_contrast.ts`, "só pode
  encolher"). Zero Medição corrente restante fora do que foi corrigido nesta execução.
- `06-painel-de-customizacao-e-preview.md` (55 linhas remanescentes) — **Identidade**
  (`arquivo:linha`) e **Histórico datado** (as seções `✅ FECHADO em <data> (plan-NN)` de §9.2/9.3/9.5,
  incluindo a métrica de bundle "674.011 → 167.684 bytes" do fecho já registrado da `plan-09`).
  Zero Medição corrente restante.
- `08-identidade-do-host-e-zero-marca.md` (45 linhas remanescentes) — **Identidade**
  (`arquivo:linha`) e **Histórico datado** ("Rodada 1 (Spec 47)", "Rodada 2 (Spec 49)" — narrativa
  do incidente de vazamento de marca já fechado). Zero Medição corrente restante.

**Critérios de aceite**
- [x] Nenhuma spec fixa descreve o achado 22 como aberto — evidência: `grep -rn "design-token-ids"
      specs/` acima; só plans (histórico de processo) mencionam "aberto/fechado" fora da prosa
      corrente.
- [x] `14-artefatos` e `12-kit` concordam sobre o estado do achado 22 — evidência: diff de
      `14-artefatos` §7.1 acima; `12-kit` §11.1 já dizia fechado desde a `plan-29`, não tocada
      aqui.
- [x] A ideia da §3.1 de `14-artefatos` sobreviveu; os números não — evidência: diff acima, o
      parágrafo de "quatro contagens juntas / informação, não ruído" permanece, só os valores
      numéricos saíram.
- [x] Em `09-temas`, os 18 legados isentos de contraparte continuam nomeados; o total de temas
      shippados saiu — evidência: `:56-58` e `:221` inalterados no diff (não aparecem no `git
      diff`); as 5 ocorrências corrigidas (§5, §6.1, §6.2, §6.3, §6.5×2) eram todas sobre o total
      shippado.
- [x] `06-painel` §9.1 registra o fecho da dívida de `tsc` — evidência: diff acima, `npx tsc
      --noEmit` exit 0.
- [x] `08-identidade` §7.2 mantém a lição sem reproduzir o total — evidência: diff acima, a frase
      "o número que importa é o de violações: 0" preservada.
- [x] A varredura de classe foi rodada sobre os 4 arquivos, sem `head`, e cada linha remanescente
      classificada no resumo — evidência: seção "Varredura de classe" acima.
- [x] `section-pointers:check` e `dev-kit:check` verdes — evidência acima.
- [x] `run_audit` no baseline (2 vermelhos, os mesmos) — evidência acima.
- [x] `git diff --stat` — 4 arquivos em `specs/specs/`, mais a própria plan (mesmo padrão
      autorizado da `plan-29`) — evidência acima.

**Decisões e suposições**
- **Em `09-temas-e-presets.md` §6.3, também precisei nomear o mecanismo** (`it.each(GLOBAL_THEMES...)`)
  ao trocar "cada um dos 18 temas" — verifiquei o teste real
  (`shippedThemesConsoleClean.test.ts:24`) e confirmei que ele já itera sobre `GLOBAL_THEMES`
  dinamicamente (não um array hardcoded de 18), então a prosa nova descreve o comportamento real
  do teste, não uma suposição.
- **Removi o parágrafo de aviso "⚠️ A tabela acima é de 2026-07-29 e envelheceu" em `09-temas`
  §5.1** — ele existia para avisar que a tabela de §5 (agora removida) estava desatualizada;
  sem tabela fixa em §5, o aviso perdeu o referente e ficaria confuso ("que tabela?"). Isso não é
  remoção de bloco histórico (proibida pela §3.2 da plan): é a consequência textual direta de ter
  corrigido exatamente o que o aviso apontava como errado. O restante da §5.1 (a narrativa "de 18
  para 23", datada, `plan-25`) foi preservado integralmente.
- **Em `08-identidade` §7.2, troquei o bloco de código fixo `361 arquivo(s)` por um template
  `N arquivo(s)`** em vez de removê-lo — mantém o formato exato da saída do gate (útil para quem
  procura a mensagem), sem fixar um valor que já diverge do medido ao vivo (363).
- **Medi `npx tsx gates/scripts/audit/verify_contrast.ts` diretamente** para decidir se os números
  de `09-temas` §6.5 (36 pares, 25 pulados, 0/0, 18 isentos) eram Medição corrente ou Estrutura
  conferida — bateram exatamente com a saída ao vivo, então ficaram, conforme a quarta caixa da
  `plan-29` §8 ("Estrutura conferida... fica, se conferida na hora").

**Achados fora do escopo (não corrigidos)**
- Nenhum achado novo fora do escopo desta plan foi encontrado durante a execução — a varredura de
  classe cobriu os 4 arquivos por completo e não sobrou nenhuma linha de Medição corrente fora do
  que já foi corrigido.

**Pendências / riscos**
- Nenhuma das edições tocou código, gate ou teste.
- A dupla execução de `run_audit.mjs` (uma via `| tail` para ler a cauda, outra redirecionada a
  arquivo para capturar o `exit code` real) é a mesma dupla chamada que a `plan-29` já registrou
  como necessária — `| tail` mascara o exit code do primeiro comando do pipe.

---

# 11. Veredito

<!-- Preenchido pelo REVISOR. Append-only. -->

## Veredito — 2026-08-12 — 🟢 Aprovado

**Aprovado na primeira rodada, sem correção.** É a primeira desta leva que passa direto — e o motivo é
estrutural, não sorte: **esta plan já nasceu com a varredura de classe como método de fecho**, em vez de
receber uma lista de linhas. Ver "O que isto prova", ao final.

**O que verifiquei, e como**

| Verificação | Saída real |
|---|---|
| Escopo | `git diff --stat` → os **4 arquivos** da §3.1 + `00-indice` (espelho) + a própria plan. Nada fora |
| **A contradição entre specs fixas** | `grep -rn "design-token-ids" specs/` → `14-artefatos:178` = *"## 7.1 ✅ … fechado"*; `12-kit:310` = *"## 11.1 ✅ FECHADO"*. **As duas concordam** |
| Varredura de classe | rodei a minha, sobre os 4 arquivos: **191 linhas, lidas por inteiro** (via arquivo + `Read`, que não trunca por largura). **Nenhuma medição corrente sobrevivente** |
| `section-pointers:check` · `dev-kit:check` · `plan-index:check` · `token-types:check` | verdes (`422 tokens`, em dia) |
| `npx tsc --noEmit` | **0**, exit 0 |
| `run_audit` | `quebrou 2 regras estruturais` — os mesmos dois. **Sem regressão** |
| Append-only | 1 bloco de resumo — correto para primeira execução |

**As duas armadilhas que a plan sinalizava: as duas evitadas.**

1. **`14-artefatos` §3.1 — "a ideia fica, os números saem".** Cumprido com precisão: a seção continua
   defendendo publicar as quatro contagens lado a lado, **explica o que cada divergência significaria**
   (`entradasBrutas > idsUnicos` → duplicação na fonte; `tipoPublico < idsUnicos` → tipo defasado) e fecha
   apontando `token-types:check` e o `state.json`. **Nenhuma cifra, e a informação inteira preservada.**
2. **`09-temas` — os dois "18".** O total de temas shippados saiu; os **18 legados isentos de contraparte**
   ficaram nomeados como conjunto real (`:56-58`). Era a distinção mais fácil de errar da plan.

**Bônus não pedido, e correto:** `08-identidade` §7.2 virou o exemplo mais limpo da regra em toda a base — o
bloco de saída passou a usar `N` como marcador, com *"rode `npm run zero-brand:check` para o `N` de hoje"*, e
a lição (*"o número que importa é o de violações: 0"*) intacta. **Placeholder é melhor que ponteiro** quando
a forma da saída é o que se quer mostrar; vale copiar.

**Classificação das cifras remanescentes** — conferi uma a uma; todas caem fora de *Medição corrente*:

- **Histórico datado:** as medições da `plan-24-1`/`plan-26`/`plan-27` em `09-temas` (`1299 de 1316`,
  `108 → 188`, `12 dos 18` pré-gate, `117 violações em 21 tokens`), o `674.011 → 167.684` de `06-painel`.
- **Estrutura/fronteira decidida:** os `36 pares` e o `4,5:1` da R31, os `55 dos 422` da contraparte — todos
  atribuídos à plan que os fixou, na própria seção.
- **Identidade:** `arquivo.ts:42`, datas, ids de plan.

**O que isto prova, e é o motivo de a `plan-32` estar escrita como está**

As plans 28 e 29 receberam **listas de linhas** e precisaram de uma e três rodadas de correção. Esta recebeu
**um método** — varredura de classe, quatro caixas de classificação, `head` proibido — e fechou de primeira,
com as duas armadilhas evitadas e um refinamento a mais do que o pedido. **Método no lugar de lista não é
preferência de estilo: é a diferença entre uma rodada e quatro.**

**Liberado.** As alterações estão no worktree, sem commit.
