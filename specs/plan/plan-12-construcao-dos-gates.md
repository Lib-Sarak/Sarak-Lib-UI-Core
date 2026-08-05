---
tipo: "plan"
titulo: "Construir os gates em fila — dar dono e verificação ao que hoje só está escrito"
dominio: "Sarak-Lib-UI-Core / Qualidade / Gates"
status: "🔴 A executar"
prioridade: "Alta"
tags: ["plan", "gates", "enforcement", "ci", "regras"]
relacionados: ["[[15-divida-conhecida]]", "[[00-regras-e-invariantes]]", "[[01-gates-e-baseline]]", "[[02-enforcement-por-commit]]"]
depende_de: "plan-06"
destino_sintese: "specs/00-regras-e-invariantes.md · specs/01-gates-e-baseline.md · specs/02-enforcement-por-commit.md · specs/15-divida-conhecida.md"
---

> 🔒 **Esta plan constrói verificação. Ela NÃO conserta código.** O conserto do que os gates acusarem é a
> **`plan-15`**. Aqui se constrói o instrumento e se **registra** o que ele encontra.
>
> ⛔ **E nenhum gate nasce com exceção** *(decisão do dono, 2026-08-05)*. Carve-out, allowlist ou condição para
> acomodar violação existente **reprova a execução inteira** — ver §2.1.
>
> ⚠️ **Nenhum gate nasce antes da sua regra.** Item cuja regra ainda não estiver escrita em
> [[00-regras-e-invariantes]] **não é implementado nesta plan** — ele volta para a fila de regras. Gate erguido
> sobre régua inexistente cobra a coisa errada com autoridade de automação, e é mais caro que gate nenhum.

# 1. Objetivo

**Toda regra verificável tem gate, e nenhum gate nasce com exceção.** Ao final, as 29 regras verificáveis
estão cobradas por script determinístico — e o que elas acusarem fica **registrado no baseline**, não escondido
numa allowlist.

# 2. Contexto

O mapeamento está fechado. [[00-regras-e-invariantes]] classifica as **32 regras** e a §9 de
[[01-gates-e-baseline]] traz os **14 vãos** medidos. O trabalho desta plan é o inventário exato:

| Estado | Quantas | Quais |
|---|---|---|
| ⏳ **sem gate** | **7** | R8 *(o gate de %)* · R10 · R18 · R27 · R28 · R31 · R32 |
| ⚠️ **gate com escopo menor que a regra** | **8** | R4 · R7 · R8 *(1:1)* · R14 · R17 · R23 · R29 · R30 |
| ✅ pleno | 17 | — |
| 🔴 conduta | 3 | R11 · R15 · R16 — **não entram** |

Mais três vãos que não são de regra: o **pre-push sem `gates/`**, a **sincronia plan × índice** e o
**`dist/BUILD_INFO.json` sem `--check`**.

## 2.1 A regra desta plan: construir sem exceção

> **Decisão do dono, 2026-08-05:** *"vamos construir os gates e depois adequar tudo — não faz sentido criar
> gates e criar exceções no processo."*

**Um gate nasce cobrando a regra como ela está escrita.** Não se adiciona carve-out, allowlist nem condição
para acomodar violação existente. Violação existente é **dívida**, e dívida se paga na `plan-15` — não se
esconde no verificador que deveria acusá-la.

**Três coisas que NÃO são exceção, e a diferença importa:**

| | O que é | Permitido? |
|---|---|---|
| **Exceção / allowlist** | o gate **para de olhar** para um caso que **é** violação | ⛔ **proibida nesta plan** |
| **Limite de escopo declarado** (R18) | o gate diz o que **não** vê — e continua sem ver | ✅ **obrigatório** |
| **Conserto de falso positivo** | o gate acusava o que **não é** violação; corrige-se o **gate** | ✅ **obrigatório** |

A fronteira é **o que a regra diz**. Se o caso viola a regra → é dívida, vai para o baseline e para a
`plan-15`. Se o caso **não** viola → o gate está errado, e o gate se conserta.

## 2.2 O baseline é a ponte entre construir e adequar — e não é exceção

Ligar 15 gates novos e ampliados **vai acender vermelho**. O baseline é o que permite construir agora e
adequar depois **sem mentir**:

- **Exceção** = o gate **deixa de olhar**. A dívida some do radar.
- **Baseline** = o gate **olha, conta e reporta** — e o Anel 2 impede o número de **crescer**.

**O baseline vai deixar de ser zero nesta plan, e isso é o esperado.** Ele volta a zero na `plan-15`. O que
não pode acontecer é dívida virar allowlist: uma tem data e dono, a outra some da vista.

# 3. Escopo

## 3.1 Dentro — três lotes

**A ordem é por risco, não por regra.**

### Lote A — nascem verdes *(nenhum vermelho previsto)*

| Item | Por que verde |
|---|---|
| **R27** — deep import | o campo `exports` já restringe |
| **R28** — contrato de saída do CLI | medido correto na `plan-04` |
| **R32** — indiferente a auth | o `SarakSecurityOrchestrator` saiu na `plan-09` |
| **vão 6** — `auditor_coverage` em `shared/`, `effects/`, `constants/` | os 4 testes foram escritos na `plan-07` |
| **vão 8** — `dist/BUILD_INFO.json` com `--check` | artefato novo no cruzamento |
| **vão 11** — `pre-push:53` incluir `gates/` | uma linha |
| **vão 12** — sincronia plan × `00-indice` | as 14 linhas estão sincronizadas hoje |
| **R4 / R29 / vão 1** — regenerar `design-token-ids.ts` **e registrar o gerador** | **as duas metades juntas.** ⚠️ Isto muda o número publicado de **304 → 409** e conserta o `sarak-ui/VERSION` |

### Lote B — vermelho conhecido e medido

| Item | Vermelhos previstos |
|---|---|
| **R30** — `tsc --noEmit` | **10**, todos em arquivos de teste |
| **R18** — todo gate declara o que não vê | **13 de 17** scripts sem bloco de limite. É **escrita**, não conserto |
| **vão 5** — R2 (hardcoded) em `src/core/` | **4 linhas** com `px` literal em `core/Shell/Components/` |
| **vão 3** — R7 (ghostvars) em `src/core/` | **4** — sendo **2 reais** e **2 falsos vindos de comentário** |
| **vão 2** — R7 em `src/styles/` | a medir; os 2 `--sx-*` já saíram na `plan-07` |
| **vão 7** — ponteiro `§N.N` | **4 vivos**; o detector acusa 23, e **16 são ruído** |
| **vão 13** — R17, prosa manual | a medir |
| **R8** — cobertura em %, piso móvel | mede, grava, o piso só sobe |

⚠️ **Dois itens do lote B exigem consertar o GATE antes de ligar** — não é exceção, é falso positivo:
os **2 comentários** do vão 3 (o auditor não distingue prosa de código) e os **16 ruídos** do §N.N (as duas
convenções: `§7.3` como *item 3 da seção 7*, e alvo com `## 2.1` sem `# 2` pai). **O detector ignora
`specs/plan/`** — plan é rastro append-only.

### Lote C — escopo a decidir ANTES do código

Estes dois **não são implementação, são decisão**. Se entrarem no mesmo lote dos outros, param a plan inteira.

| Item | O que falta decidir |
|---|---|
| **R10** — composição atômica | **97 ocorrências** de `<button>`/`<input>`/`<select>` fora dos átomos de Buttons/Inputs — **66 só em `features/DesignEngine`**. A regra diz *"dentro de template ou componente pré-montado"* e afirma que o painel obedece por *dogfooding*. **Onde exatamente a regra vale?** Sem essa fronteira, o gate nasce com dezenas de falsos |
| **R31** — contraste AA nos 18 temas | **Ninguém nunca mediu.** Pode dar 0 reprovados, pode dar 18. E o conserto, se houver, é **ajustar cor de tema** — decisão visual, não mecânica |

**⇒ PARADA OBRIGATÓRIA antes do lote C.** Meça primeiro, apresente, e só então implemente.

## 3.2 Fora

- ⛔ **Criar exceção, allowlist ou carve-out** para acomodar violação existente. **Reprova a execução inteira.**
- ⛔ **Adequar o código** que os gates acusarem — é a `plan-15`. Aqui se **constrói e se registra**.
- ⛔ R11, R15 e R16 — conduta por decisão do dono.
- ⛔ Ampliar escopo **sem** ampliar o registro correspondente. A `plan-06` mediu o custo: **~85 acusações
  falsas**. Cada ampliação sai com a contagem de falsos medida **antes e depois**.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/00-regras-e-invariantes.md` | **as 32 regras e o estado de cada uma** — a fonte do que construir |
| Spec fixa | `specs/01-gates-e-baseline.md` §9 | **a matriz dos 14 vãos**, com exposição medida e destino |
| Spec fixa | `specs/02-enforcement-por-commit.md` | onde cada gate novo se pendura |
| Spec fixa | `specs/14-artefatos-do-mantenedor.md` §4.2 | por que gate com falso-positivo é pior que gate ausente |
| Código | `gates/README.md` | o índice; **cada gate novo entra nele, com a coluna "o que NÃO vê"** |
| **Skill** | `padrao-escrita` · `padrao-typescript` · `test-unitario` | sempre |

# 5. Instruções de execução

1. **Lote A**, um gate por vez. Cada um: roda isolado → entra no `package.json` → encadeia onde faz sentido →
   **baseline escrito** em `01-gates-e-baseline` → linha no `gates/README.md` com o que ele **não** vê.
2. **Todo gate novo nasce com teste do próprio gate** — um caso que ele **pega** e um que ele **deixa passar**.
   Gate sem teste é gate que ninguém sabe se funciona.
3. **Lote B**, na mesma disciplina. Onde houver falso positivo conhecido (vãos 3 e 7), **conserte o gate
   primeiro** e prove com a contagem antes/depois.
4. **Registre o vermelho no baseline** — `npm run audit:baseline -- --write`, **no mesmo commit** do gate que o
   acendeu. Baseline sozinho no diff é o que a §6.1 proíbe.
5. **⇒ PARE antes do lote C.** Meça R10 (onde a regra vale) e R31 (os 18 temas passam?) e **apresente ao dono**.
6. Ao final: `npm run gates:full`, `npm run audit` e `npx vitest run`, com o **baseline novo declarado** —
   e a lista do que a `plan-15` vai ter de adequar.

# 6. Prompt de execução

```
Leia specs/00-prompt-executor.md e execute specs/plan/plan-12-construcao-dos-gates.md.

Contexto obrigatório antes de começar: specs/00-contexto.md, specs/00-knowledge.md,
specs/specs/15-divida-conhecida.md (§4 é a lista), specs/specs/00-regras-e-invariantes.md,
specs/specs/01-gates-e-baseline.md, specs/specs/02-enforcement-por-commit.md,
specs/specs/14-artefatos-do-mantenedor.md, e o resumo de execução da plan-06.
Skills a aplicar: padrao-escrita, padrao-typescript, test-unitario, ui-auditoria-modulo.

REGRA ANTES DE GATE: item cuja regra não estiver escrita não vira gate — ou você escreve a
regra, ou mata o item com o motivo. É proibido inventar gate para preencher tabela.
Esta plan NÃO conserta achado de código (isso é das plans 07/08/09): se um gate novo acender
vermelho que pertence a elas, registre no baseline e siga.
PARADA OBRIGATÓRIA no passo 3: relatório em texto ao dono, item a item, antes de implementar.
Não saia do escopo. Não commite. Ao terminar, escreva o resumo na própria plan.
```

# 7. Critérios de aceite

- [ ] **As 7 regras ⏳ têm gate** e **os 8 escopos ⚠️ foram ampliados** — ou o item está declarado com o motivo.
- [ ] ⛔ **Zero exceção criada.** Nenhuma allowlist nova, nenhum carve-out, nenhuma condição para acomodar
      violação existente. `git diff` das allowlists vazio.
- [ ] O **baseline final está escrito** em `01-gates-e-baseline`, com cada vermelho novo nomeado — é o escopo
      da `plan-15`.
- [ ] A parada do **lote C** aconteceu: R10 e R31 medidos e apresentados **antes** de virar código.
- [ ] Nenhum gate novo existe sem uma regra escrita em `00-regras-e-invariantes` que o sustente.
- [ ] Cada gate novo tem **teste do próprio gate**: um caso pegado, um caso liberado.
- [ ] `01-gates-e-baseline` traz o baseline **recontado** de cada gate ligado — números reais, não previsão.
- [ ] `00-regras-e-invariantes` §3.1 sem nenhum `⏳` pendente, ou com o motivo escrito de por que sobrou.
- [ ] `15-divida-conhecida` §4 encolhida na mesma execução.
- [ ] Vermelho novo aceso por ampliação de escopo está **registrado** no baseline, não escondido nem
      "consertado de passagem".
- [ ] `npx vitest run` verde; `npm run gates:full` conforme o baseline recontado.
- [ ] O relatório do passo 3 foi apresentado **antes** de qualquer implementação.

# 8. Como verificar

- `git diff --stat` → só os caminhos de §3.1; **zero** `src/`, `bin/`, `dist/`
- `npm run audit` · `npm run gates:full` · `npx vitest run` → comparados ao baseline recontado da execução
- Para cada gate novo: rodar isolado e conferir que **falha** no caso plantado e **passa** no caso limpo
- `grep -n "⏳" specs/specs/00-regras-e-invariantes.md` → nenhum, ou só o justificado
- Ler `15-divida-conhecida` §4 → encolhida; cada saída rastreável a uma linha do resumo
- Ler `01-gates-e-baseline` → todo gate novo com número medido nesta execução

# 9. Destino da síntese

**Destino:** `specs/00-regras-e-invariantes.md` (regras novas + §3.1 atualizada) ·
`specs/01-gates-e-baseline.md` (baseline recontado) · `specs/02-enforcement-por-commit.md` (onde cada gate novo
se pendura) · `specs/15-divida-conhecida.md` (§4 encolhida)

Se a decisão do dono for **não** escrever alguma regra (WCAG AA, auth, cobertura em %), isso é decisão técnica
com trade-off: **escreva um ADR**, porque o próximo agente vai repropor.

---

# 10. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only: cada rodada acrescenta um bloco novo; nada é removido. -->

---

# 11. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->
