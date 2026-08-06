---
tipo: "plan"
titulo: "Adequação total — o baseline volta a zero"
dominio: "Sarak-Lib-UI-Core / Qualidade / Dívida"
status: "🔴 A executar"
prioridade: "Alta"
tags: ["plan", "adequacao", "baseline", "divida", "gates"]
relacionados: ["[[00-regras-e-invariantes]]", "[[01-gates-e-baseline]]", "[[15-divida-conhecida]]"]
depende_de: "plan-12"
destino_sintese: "specs/01-gates-e-baseline.md · specs/15-divida-conhecida.md · specs/00-regras-e-invariantes.md"
---

> 🔒 **Esta plan NÃO mexe em gate.** Ela paga o que os gates da `plan-12` acusaram. Gate alterado aqui —
> escopo, allowlist, limiar ou exceção — **reprova a execução inteira**, porque é maquiagem com outro nome.
>
> ⚠️ **Ela começa sem lista de tarefas.** A lista é o **relatório final da `plan-12`**: o baseline que ela
> deixou. Enquanto a `plan-12` não fechar, esta plan não tem escopo — e liberá-la antes disso é convidar o
> executor a inventar trabalho.

# 1. Objetivo

O **baseline volta a zero** em todas as métricas, e o que não voltar está lá **por decisão escrita do dono** —
não por cansaço.

# 2. Contexto

A `plan-12` constrói os gates **sem exceção**, cobrando cada regra como ela está escrita. A consequência
inevitável é que **o baseline deixa de ser zero**: 15 verificações novas ou ampliadas acendem a dívida que já
existia e ninguém via.

**Isso é a metade do trabalho, e a metade fácil.** Um gate que acusa e nunca é atendido vira ruído — e ruído
treina a ignorar o vermelho, que é o defeito que este repositório passou a campanha inteira consertando.

**A decisão do dono (2026-08-05)** foi explícita: *"vamos construir os gates e depois adequar tudo — não faz
sentido criar gates e criar exceções no processo."* A `plan-12` é o "construir"; esta é o "adequar tudo".

## 2.1 O que já se sabe que vai aparecer

> ✅ **Atualizado em 2026-08-05, com a `plan-12` (Lotes A+B) 🟢 aprovada.** Os números abaixo deixaram de ser
> previsão: são o **baseline recontado** por ela, verificado no veredito. **Continua não sendo a lista** — a
> lista é o resumo de execução da `plan-12`.

| Origem | Vermelho MEDIDO | Natureza |
|---|---|---|
| **R18** | ✅ **0** — os blocos de limite foram escritos **na própria `plan-12`**; `gate-limits:check` fecha **25/25** | *(não chega a esta plan)* |
| **R30** | **10** erros de `tsc`, todos em teste — **produção já em 0**, e virou hard-block | tipagem |
| **vão 5** | **35** violações de `px` literal em `src/core/Shell/` *(a previsão dizia 4)* | conserto trivial, volume médio |
| **vãos 2+3** | **27** consumos-fantasma em `src/styles/` + `src/core/` | conserto trivial |
| **vão 7** | **27** ponteiros `§N.N` mortos, autorreferência *(a previsão dizia 4)* | texto |
| **vão 13** | 1 número falso novo: `arquitetura/04-…:52` diz `410 = 410`, o real é **409** | texto — **sem gate**, achado a numerar |
| **R10** | **111** ocorrências de HTML nativo cru — **64 em `features/DesignEngine`** | ⚠️ **depende da fronteira que o dono fixar** |
| **R31** | **12 de 18** temas falham ≥1 par canônico de AA | ⚠️ conserto é **cor de tema**, decisão visual |

**Os dois últimos dominam o risco, e agora com número.** Se a fronteira de R10 incluir o painel do Design
Engine, esta plan tem **64** substituições de HTML por átomo lá dentro — refactor com risco visual, não
higiene. Se ficar de fora, sobram **47**.

> ⚠️ **A medição de R31 vive fora do repositório.** O script de contraste foi recriado pela `plan-12` no
> `%TEMP%` da sessão e **não sobrevive a uma limpeza**. Antes de decidir R31, mova-o para um lugar durável —
> ou o número 12/18 volta a ser irreproduzível, que é o estado que esta base combate.

# 3. Escopo

## 3.1 Dentro

- **Todo item do baseline** que a `plan-12` deixou vermelho, sem exceção.
- `specs/01-gates-e-baseline.md` — o baseline recontado a cada lote pago.
- `specs/15-divida-conhecida.md` — item pago **sai** da lista, na mesma execução.
- `gates/baselines/audit-baseline.json` — regravado **junto** do conserto, nunca sozinho.

## 3.2 Fora

- ⛔ **Alterar qualquer gate** — escopo, limiar, allowlist, exceção. **É a linha vermelha desta plan.**
- ⛔ **Construir gate novo** — era a `plan-12`.
- ⛔ Baixar número sem conserto por baixo. O critério é o da `plan-07` §3.3: existe **defeito real**? Se não
  existe, o gate está errado — e aí **pare e relate**, não conserte o código para agradar o verificador.

## 3.3 As três saídas legítimas para cada vermelho

Nem todo vermelho se paga com código, e forçar isso produz código pior que a dívida:

| Saída | Quando | Quem decide |
|---|---|---|
| **Consertar o código** | a regra vale e o código a viola | executor |
| **Corrigir o gate** | é **falso positivo** — o caso não viola a regra | executor, com a contagem antes/depois |
| **Corrigir a REGRA** | o vermelho revela que a regra foi escrita larga demais | **⇒ PARE. Dono.** Vira edição em `00-regras-e-invariantes`, e é decisão, não atalho |

> **A terceira é a que costuma faltar.** Uma regra que acusa 66 casos legítimos provavelmente está mal
> escrita — e contorcer 66 arquivos para satisfazê-la é pior que reescrevê-la. Mas isso é **decisão do dono**,
> nunca conveniência do executor.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Plan | `plan-12-construcao-dos-gates` | **o relatório final dela É o escopo desta** |
| Spec fixa | `specs/01-gates-e-baseline.md` | o baseline que se está pagando |
| Spec fixa | `specs/00-regras-e-invariantes.md` | a regra por trás de cada vermelho |
| **Skill** | `code-adequacao` | onde houver risco de mudar comportamento: **caracterização antes** |
| **Skill** | `padrao-escrita` · `padrao-typescript` · `test-unitario` | sempre |

# 5. Instruções de execução

1. **Ler o relatório final da `plan-12`** e transcrever o baseline vermelho como lista de trabalho, **ordenada
   por risco crescente** — texto e tipagem antes de refactor de componente.
2. **⇒ PARE. Apresentar a lista ao dono**, com a saída proposta para cada item (§3.3) e o custo. Só então
   executar.
3. **Um lote por vez, com o baseline regravado junto** — nunca ao final, tudo de uma vez. Baseline que anda com
   o conserto é auditável; baseline que anda sozinho é suspeito.
4. **Onde houver risco de mudar comportamento** — R10 em componente montado, R31 em cor de tema — a rede vem
   antes: `code-adequacao`, caracterização, e só então o refactor.
5. **Vermelho que não for pago fica no baseline com o motivo escrito e o dono nomeado.** Zero é a meta; item
   declarado é resposta legítima. Item esquecido não é.
6. Ao final: `npm run audit` e `npm run gates:full` — e o baseline final, com **o que sobrou e por quê**.

# 6. Prompt de execução

```
Leia specs/00-prompt-executor.md e execute specs/plan/plan-15-adequacao-total.md.

Contexto obrigatório: specs/00-contexto.md, specs/00-knowledge.md,
specs/specs/00-regras-e-invariantes.md, specs/specs/01-gates-e-baseline.md,
e o RESUMO FINAL da plan-12 — que é o escopo desta plan.
Skills: padrao-escrita, padrao-typescript, test-unitario, code-adequacao.

Você NÃO altera gate nenhum. Nem escopo, nem limiar, nem allowlist, nem exceção — é a linha
vermelha desta plan e reprova a execução inteira. Aqui se paga o que o gate acusa.

Cada vermelho tem três saídas (§3.3): consertar o código · corrigir o gate se for FALSO
POSITIVO · ou corrigir a REGRA, se ela foi escrita larga demais. A terceira é decisão do
DONO — pare e pergunte, nunca decida sozinho.

PARADA OBRIGATÓRIA no passo 2: apresente a lista com a saída proposta por item e o custo.

O baseline se regrava JUNTO do conserto, no mesmo commit — nunca sozinho, nunca no final.
Não commite. Ao terminar, escreva o resumo na própria plan.
```

# 7. Critérios de aceite

- [ ] `npm run audit` em **zero**, ou o que sobrou está no baseline **com motivo escrito e dono nomeado**.
- [ ] **Nenhum gate alterado** — `git diff` em `gates/scripts/` vazio, salvo conserto de falso positivo
      **declarado e medido**.
- [ ] Todo item pago **saiu** de `15-divida-conhecida` na mesma execução.
- [ ] Baseline regravado **junto** de cada conserto, nunca isolado no diff.
- [ ] Onde houve risco de comportamento, a **caracterização veio antes** — e está no diff.
- [ ] `npx vitest run` verde; `npm run gates:full` verde.
- [ ] A lista do passo 2 foi apresentada ao dono **antes** de qualquer conserto.

# 8. Como verificar

- `npm run audit` → zero, ou o baseline com o motivo de cada linha
- `git diff --stat -- gates/` → vazio ou só falso positivo declarado
- `npm run audit:baseline` → "igual ao baseline"
- `grep` em `15-divida-conhecida` → nenhum achado pago sobrevivendo na lista
- Amostragem: 3 consertos reabertos no `arquivo:linha`, conferindo que o defeito era real

# 9. Destino da síntese

**Destino:** `specs/01-gates-e-baseline.md` (o baseline final) · `specs/15-divida-conhecida.md` (o que saiu) ·
`specs/00-regras-e-invariantes.md` (**só se** alguma regra for corrigida por decisão do dono)

---

# 10. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only. -->

---

# 11. Veredito

<!-- Preenchido pelo REVISOR. Append-only. -->
