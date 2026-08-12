---
tipo: "plan"
titulo: "Segunda onda da cifra em prosa — as quatro specs que a plan-29 não alcançou"
dominio: "Sarak-Lib-UI-Core / Governança de Specs"
status: "🔴 A executar"
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

---

# 11. Veredito

<!-- Preenchido pelo REVISOR. Append-only. -->
