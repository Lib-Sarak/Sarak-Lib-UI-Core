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

> 🔒 **Esta plan constrói verificação. Ela NÃO conserta código.** O conserto dos achados de código é das plans
> 07, 08 e 09. Aqui se constrói o instrumento que impede a próxima violação — e só depois de a régua existir.
>
> ⚠️ **Nenhum gate nasce antes da sua regra.** Item cuja regra ainda não estiver escrita em
> [[00-regras-e-invariantes]] **não é implementado nesta plan** — ele volta para a fila de regras. Gate erguido
> sobre régua inexistente cobra a coisa errada com autoridade de automação, e é mais caro que gate nenhum.

# 1. Objetivo

Os **9 itens da §4 de [[15-divida-conhecida]]** deixam de ser lista sem dono: cada um vira **gate ligado e
verde**, ou **regra nova escrita antes do gate**, ou **item morto com o motivo registrado** — e nenhum fica
como está hoje, que é escrito sem ninguém responsável.

# 2. Contexto

A triagem da `plan-03` (veredito 🟢, 2026-08-01) separou dívida de trabalho em fila, por decisão do dono:
*"tudo que é relacionado ao gate de verificação ainda não foi implementado — não é dívida, é implementação
posterior. Devemos ter todas as regras formadas, para então criar a verificação para o gate."*

A separação está feita e é boa. O que ficou faltando é **dono**: a §4 da spec de dívida lista **5 gates
integralmente ausentes** (achados 14, 15, 18, 23, 26) e **4 ampliações de escopo** (as metades de gate dos
achados 1, 13, 22, 29), e nenhuma plan da fila os executa. A `plan-06` **produz o insumo** — o mapa
escopo-de-gate × escopo-de-regra — mas é read-only por desenho, e misturar construção nela destruiria o valor
do produto dela. Daí esta plan existir, depois dela.

Duas heranças da triagem que mudam o trabalho aqui:

- **12 dos 21 achados vivos não violavam regra nenhuma das 17.** Isso não é lacuna de preenchimento: é o sinal
  de que se cobra o que não está escrito. Parte desta plan é **escrever regra**, não código.
- **Três perguntas de regra ficaram em aberto** e a `plan-06` as responde: *(a)* a lib promete WCAG AA em algum
  lugar? (achado 18) · *(b)* acoplamento de auth deve virar regra? (achado 14) · *(c)* cobertura em % acrescenta
  algo ao 1:1 de R8? (achado 15). **Sem a resposta, os três itens não são implementados** — é a regra que decide
  se o gate existe.

# 3. Escopo

## 3.1 Dentro

- `.agents/skills/ui-auditoria-modulo/scripts/auditor_ghostvars.mjs` — ampliação de escopo (achado 1)
- `.agents/skills/ui-auditoria-modulo/scripts/auditor_coverage.mjs` — ampliação de escopo (achado 13)
- `scripts/dev-kit/` — validação de ponteiro de **seção** `§N.N` (achado 29) e o `PLACEHOLDER` de
  `deadPointers.mjs:53`, que hoje não cobre `[...]`
- `scripts/check-package-contents.mjs` — cobertura de conteúdo de `sarak-ui/templates/` (achado 23)
- `package.json` — os scripts novos e o encadeamento em `gates:full`
- `specs/specs/00-regras-e-invariantes.md` — **as regras novas primeiro**, e a §3.1 (inventário validador × gate)
- `specs/specs/01-gates-e-baseline.md` — baseline recontado a cada gate ligado
- `specs/specs/15-divida-conhecida.md` — a §4 encolhe à medida que os itens saem
- `scripts/generate-token-types.ts` — registrar num script/gate (metade de gate do achado 22)
- `.agents/skills/ui-criar-tema/scripts/verify_theme_parity.ts` — o único ⏳ da §3.1 de `00-regras`

## 3.2 Fora

- ⛔ **Conserto de qualquer achado de código da §3 da spec de dívida.** As metades de código são das plans 07,
  08 e 09. Ligar o gate **antes** de a metade de código estar consertada produz vermelho novo — ver §5, passo 6.
- ⛔ **Implementar gate cuja regra a `plan-06` não tiver respondido.** Vale nominalmente para os achados 14, 15
  e 18.
- ⛔ Criar gate sem registrar o baseline dele em `01-gates-e-baseline`.
- ⛔ Mexer no pipeline de CI/CD em si — isso é a `plan-05`. Aqui se constroem os **validadores** que ela chama.
- `src/`, `bin/`, `dist/`.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/15-divida-conhecida.md` §4 | **a lista exata** dos 9 itens, com `arquivo:linha` |
| Spec fixa | `specs/00-regras-e-invariantes.md` §3.1 | o inventário validador × gate, e o único ⏳ |
| Spec fixa | `specs/01-gates-e-baseline.md` | o baseline de hoje — compare contra ele, nunca contra zero |
| Spec fixa | `specs/02-enforcement-por-commit.md` | os anéis existentes; onde um gate novo se pendura |
| Spec fixa | `specs/14-artefatos-do-mantenedor.md` §4.2 | por que gate com falso-positivo é pior que gate ausente |
| Plan | `plan-06-auditoria-cobertura-gates` | **o insumo**: o mapa escopo-de-gate × escopo-de-regra |
| **Skill** | `padrao-escrita` + `padrao-typescript` | sempre |
| **Skill** | `ui-auditoria-modulo` | procedimento dos auditores que serão ampliados |

# 5. Instruções de execução

1. **Ler o produto da `plan-06` primeiro.** O mapa dela pode ter achado vãos além dos 9 — todo vão novo entra
   nesta lista, com `arquivo:linha`, antes de qualquer implementação.
2. **Regras antes de gates.** Para cada item cuja coluna *Regra* diga **nenhuma**: escrever a regra em
   `00-regras-e-invariantes` — número novo, com o texto, o exemplo e o gate que a cobrará — **ou** declarar em
   voz alta que ela não será escrita, e então **matar o item**, registrando o motivo. Item sem regra não vira
   gate.
3. **⇒ PARE. Relatório em texto ao dono:** uma linha por item — *o que é · qual regra o sustenta (nova ou
   existente) · o que o gate vai cobrar · onde ele roda · qual o custo em segundos*. **Aguarde a decisão, item
   a item.** As 3 perguntas de regra (WCAG AA · auth · cobertura em %) são decisão dele, não do executor.
4. **Implementar apenas o aprovado**, um gate por vez. Cada gate: (a) roda isolado, (b) entra no `package.json`,
   (c) é encadeado onde faz sentido (`gates:full`, `build`, hook), (d) tem o baseline dele escrito em
   `01-gates-e-baseline`.
5. **Todo gate novo nasce com teste do próprio gate** — um caso que ele **pega** e um que ele **deixa passar**.
   Gate sem teste é gate que ninguém sabe se funciona. Aplique a skill `test-unitario`.
6. **Ampliação de escopo é acompanhada de medição do vermelho que ela acende.** Ampliar escopo sem ampliar o
   registro produz **acusação falsa** — é o aviso literal de [[01-gates-e-baseline]] §4.3.c para o
   `auditor_ghostvars`. Se o vermelho novo for a metade de código de um achado das plans 07/08/09, **registre-o
   no baseline como dívida conhecida** e não conserte aqui.
7. **A §4 da spec de dívida encolhe na mesma execução** — item que virou gate sai de lá; item morto sai com o
   motivo. Ao fim, `15-divida-conhecida` §4 deve estar vazia ou conter só o que o dono adiou explicitamente.
8. Rodar `npm run audit`, `npm run gates:full` e `npx vitest run`. Comparar com o baseline **recontado**, não
   com o antigo.

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

- [ ] Todo item da §4 de `15-divida-conhecida` tem destino final: **gate ligado**, **regra escrita**, ou
      **morto com motivo**. Nenhum permanece como está.
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
