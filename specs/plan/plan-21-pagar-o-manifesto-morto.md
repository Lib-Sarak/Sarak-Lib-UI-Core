---
tipo: "plan"
titulo: "Pagar o manifesto morto — 16 consumos que renderizam só o fallback"
dominio: "Sarak-Lib-UI-Core / Qualidade / Dívida"
status: "🔴 A executar"
prioridade: "Alta"
tags: ["plan", "r7", "manifesto", "divida", "fantasma"]
relacionados: ["[[00-regras-e-invariantes]]", "[[04-contrato-de-tokens-e-paridade]]", "[[plan-20-gates-sem-vao]]", "[[15-divida-conhecida]]"]
depende_de: "plan-20"
destino_sintese: "specs/specs/01-gates-e-baseline.md · specs/specs/15-divida-conhecida.md · specs/arquitetura/04-contrato-de-tokens-e-paridade.md"
objetivo: "Pagar os 16 consumos de variavel que o runtime nunca emite"
---

> ⚠️ **Esta plan nasce com escopo MEDIDO, não descoberto.** Os números abaixo foram apurados pelo revisor em
> 2026-08-09, antes de o detector existir. É o inverso da `plan-15`, que começou sem lista — e é por isso que
> esta pode ser curta.

# 1. Objetivo

**Os 16 consumos de variável que o runtime nunca emite passam a apontar para o nome real**, e as 24 entradas
mortas saem do `manifest.ts`.

# 2. Contexto

## 2.1 O vão que a `plan-20` acendeu

O `auditor_ghostvars` tratava declaração em `src/core/Provider/manifest.ts` como prova de que a variável
existe. **Não é prova.** O manifesto declara o mapeamento `tokenId → cssVars`; se o `tokenId` não é token de
schema nenhum e nenhuma das vars é emitida, aquilo é **metadado morto** — e todo consumo desses nomes passa
no gate rendendo apenas o fallback.

> 🔴 **NÚMEROS CORRIGIDOS em 2026-08-10.** Esta seção dizia **21 consumos / 27 órfãs**, apurados pelo revisor
> com varredura própria **antes** de o detector existir. O detector da `plan-20` nasceu e mediu **17 / 24** —
> e ele é a fonte certa: a varredura do revisor contou ocorrências **fora dos `CONSUMER_DIRS`** que o auditor
> de fato varre. **Use os números abaixo, não os antigos.**

| Medida (detector da `plan-20`, 2026-08-10) | Valor |
|---|---|
| Entradas do manifesto com lista de `vars` | **103** |
| Órfãs — sem token de mesmo `id` em schema **e** sem var emitida | **24** |
| Nomes **já consumidos** hoje | **7** |
| **Consumos a pagar** | **17** *(16 + o `--x`, que é caso à parte já declarado)* |

## 2.2 Os 17, por nome — medido pelo auditor, não estimado

| Consumos | Nome fantasma | Nome real |
|---|---|---|
| **9x** | `--sarak-button-radius` | ✅ **`--sarak-btn-border-radius`** — `buttons.ts:59`, token `btnBorderRadius`, **42 emissões** no snapshot contra **0** do nome consumido |
| 2x | `--sarak-elasticity` | *a apurar* |
| 1x | `--font-tab` | *a apurar* |
| 1x | `--font-subtitle` | *a apurar* |
| 1x | `--animation-speed` | *a apurar* |
| 1x | `--sarak-button-hover` | *a apurar* |
| 1x | `--sarak-button-active-color` | *a apurar* — pode não ter alvo; ver §2.4 |
| 1x | `--x` | **não é desta plan** — caso à parte, já declarado no baseline desde a `plan-15`. Não toque |

**16 consumos a pagar**, em 6 nomes. O `--sarak-button-radius` sozinho é mais da metade.

## 2.3 🔴 O caso do `--sarak-button-radius` corrige um veredito do revisor

No **lote 10 da `plan-15`**, o executor trocou literais de raio por `var(--sarak-button-radius, …)` e o
revisor **aprovou como "conceito certo para o elemento certo"**.

**Estava errado, e por um motivo que só apareceu ao cruzar o manifesto com a emissão real:** o conceito é
certo, **o nome não existe**. Aquelas 9 linhas renderizam pelo fallback e **não respondem a tema nenhum**. O
`auditor_ghostvars` não pegou porque é exatamente este vão.

**A lição, e ela é do revisor:** *"tokenizado" não é a meta — "responde ao tema" é.* Um nome plausível que não
é emitido dá a mesma tela de um hardcode, com a vantagem de parecer resolvido.

## 2.4 Nem todo fantasma tem alvo — e aí a saída é outra

Alguns dos 6 podem não ter token correspondente **nenhum**. Nesse caso as saídas são, em ordem:

1. **Redirecionar** para o token real do mesmo conceito *(esperado para `--sarak-button-radius`)*.
2. **Criar o token** — Expansão (R11), **decisão do dono**, com a cadeia de paridade completa.
3. **Remover o consumo** se o conceito não deveria ser tematizável.

**A terceira saída não é atalho.** Só vale quando o valor é legitimamente fixo, e exige a mesma justificativa
de qualquer outro item da §3.3 da `plan-15`.

## 2.5 As 24 entradas órfãs do manifesto

Depois de os consumos serem redirecionados, as 24 entradas ficam sem nenhum leitor. Elas **descrevem um
mapeamento que não existe** e, enquanto viverem lá, qualquer código novo pode consumir um dos 39 nomes e
passar no gate — porque foi o próprio manifesto que os legitimou.

> **Achado a tratar junto:** a entrada `headingWeight` lista `var(--sarak-h1-weight,700)` **como se fosse nome
> de variável** — um `var()` inteiro dentro do array de nomes. Isso não é órfão, é malformado.

# 3. Escopo

## 3.1 Dentro

1. **Apurar o nome real** de cada um dos 6 fantasmas, com evidência: `arquivo:linha` do token e contagem de
   emissão no snapshot do `PreviewCanvas`.
2. **Redirecionar os 16 consumos** para o nome real.
3. **Remover as 24 entradas órfãs** do `manifest.ts`, e consertar o `headingWeight` malformado.
4. `ghostvars` volta ao número que era antes de o detector nascer.

## 3.2 Fora

- **Criar token novo.** Se algum conceito não tiver alvo, ⇒ **PARE e relate** — é Expansão, decisão do dono.
- Qualquer alteração de gate. A `plan-20` já os deixou prontos.
- Os demais nomes órfãos ainda **não consumidos**: eles somem junto com as entradas, mas não são trabalho
  de conserto.

## 3.3 As três saídas para cada consumo

Iguais às da `plan-15` §3.3, e a terceira é do dono:

| Saída | Quando |
|---|---|
| **Redirecionar** | existe token do mesmo conceito, com outro nome |
| **Criar token** | o conceito é legítimo e não tem token ⇒ **PARE, é do dono** |
| **Remover o consumo** | o valor é legitimamente fixo — exige justificativa escrita |

# 4. Referências obrigatórias

| Tipo | Onde | Para quê |
|---|---|---|
| Spec fixa | [[00-regras-e-invariantes]] → R7, R11 | namespace/fallback, e Configuração × Expansão |
| Spec fixa | [[04-contrato-de-tokens-e-paridade]] | onde os nomes de var nascem (`cssVars` do schema) |
| Fonte | `src/core/Provider/manifest.ts` | as 103 entradas |
| Prova de emissão | `src/features/DesignEngine/Canvas/__tests__/__snapshots__/PreviewCanvas.test.tsx.snap` | o conjunto **realmente emitido**, por tema |
| **Skill** | `code-adequacao` · `test-unitario` | redirecionar nome muda pixel onde o token emitido difere do fallback |

# 5. Instruções de execução

1. **Apure os 6 antes de trocar qualquer um.** Para cada: o token candidato (`arquivo:linha`), o `cssVar` que
   ele declara, e **quantas vezes esse nome aparece no snapshot**. Sem as três colunas, não troque.
2. **⇒ PARE e relate** qualquer conceito sem token — é Expansão, e é do dono.
3. **Cada troca pode mudar pixel.** O fallback de hoje e o valor emitido do token real **não são
   necessariamente iguais** — ao contrário do lote 6 da `plan-15`, aqui **zero-pixel não é garantido**. Meça o
   par (fallback atual × valor emitido) e **declare quando divergir**.
4. Só depois de os 16 estarem redirecionados, remova as 24 entradas. Remover antes deixa consumo órfão.
5. `ghostvars` tem de voltar ao número anterior ao detector. Se sobrar, diga o quê e por quê.

# 6. Prompt de execução

```
Leia specs/00-prompt-executor.md e execute specs/plan/plan-21-pagar-o-manifesto-morto.md.

Contexto obrigatório: specs/00-contexto.md, specs/00-knowledge.md,
specs/specs/00-regras-e-invariantes.md (R7 e R11),
specs/arquitetura/04-contrato-de-tokens-e-paridade.md, e a §2 desta plan.
Skills: code-adequacao, test-unitario, padrao-typescript, padrao-escrita.

O escopo já está MEDIDO: 16 consumos de 6 nomes que o runtime nunca emite,
mais 24 entradas órfãs no manifest.ts. Você não precisa descobrir — precisa apurar
o ALVO de cada um e trocar.

PASSO 1 — APURAR ANTES DE TROCAR. Para cada um dos 7 nomes, três colunas:
   · o token candidato (arquivo:linha no schema)
   · o cssVar que esse token declara
   · quantas vezes esse cssVar aparece no snapshot do PreviewCanvas (= emissão real)
Sem as três, não troque. O revisor já apurou um:
   --sarak-button-radius  →  --sarak-btn-border-radius
   (buttons.ts:59, token btnBorderRadius, 42 emissões contra 0 do nome consumido)

⚠️ AQUI ZERO-PIXEL NÃO É GARANTIDO — e é a diferença para o lote 6 da plan-15.
O fallback escrito hoje e o valor emitido pelo token real podem divergir. Meça o
par para cada troca e DECLARE onde muda. Onde mudar, caracterize antes (§5.3).

⇒ PARADA OBRIGATÓRIA: se algum conceito não tiver token nenhum, PARE e relate.
   Criar token é Expansão (R11) e é decisão do dono, não sua.

PASSO 2 — trocar os 16 consumos.
PASSO 3 — só então remover as 24 entradas órfãs do manifest.ts, e consertar a
   entrada headingWeight, que lista `var(--sarak-h1-weight,700)` COMO SE FOSSE um
   nome de variável (um var() inteiro dentro do array de nomes).
   Remover antes do passo 2 deixa consumo órfão.

META: ghostvars volta ao número anterior ao detector da plan-20. Se sobrar algo,
diga o quê e por quê — item declarado com motivo é resposta legítima; esquecido não.

LINHAS VERMELHAS:
  · Você NÃO altera gate nenhum. A plan-20 já os deixou prontos.
  · Você NÃO cria token sem decisão do dono.
  · Você NÃO edita specs/specs/, specs/adr/, specs/arquitetura/ nem 00-indice.md.

Os três espelhos: gates/baselines/ · sarak-dev/ (npm run dev-kit) · sarak-ui/
(npm run guide — só se a contagem de tokens mudar).

VERIFICAÇÕES, com a saída colada:
  npm run audit           (ANTES e DEPOIS)
  npx vitest run          (INTEIRA)
  npm run gate-limits:check · npm run dev-kit:check
  node gates/scripts/release/check-audit-baseline.mjs --with-tsc
  git diff --stat

DECLARE se dist/ mudou e toda baseline que se moveu.

Baseline e espelhos JUNTO. Não commite. Ao terminar, escreva o resumo na própria
plan e mova o status para 🟠 Em revisão.
```

# 7. Critérios de aceite

- [ ] Os **7 nomes** têm alvo apurado com as **três colunas** (token, `cssVar`, contagem de emissão).
- [ ] Os **16 consumos** apontam para nome emitido — provado por contagem no snapshot, não por leitura.
- [ ] Onde o pixel mudou, está **declarado e caracterizado antes**.
- [ ] As **24 entradas órfãs** saíram do `manifest.ts`, e o `headingWeight` malformado foi consertado.
- [ ] `ghostvars` voltou ao número anterior ao detector; o que sobrou tem **motivo escrito e dono nomeado**.
- [ ] Conceito sem token virou **parada relatada**, nunca token criado por conta própria.
- [ ] `npx vitest run` verde; baseline e espelhos regravados junto.

# 8. Como verificar

```bash
npm run audit                    # ghostvars de volta ao patamar pré-detector
npx vitest run
npm run dev-kit:check
node gates/scripts/release/check-audit-baseline.mjs --with-tsc
grep -c "sarak-button-radius" -r src/   # esperado: 0
```

# 9. Destino da síntese

`specs/specs/01-gates-e-baseline.md` (baseline) · `specs/specs/15-divida-conhecida.md` (o achado do manifesto
morto, se sobrar resíduo) · `specs/arquitetura/04-contrato-de-tokens-e-paridade.md` (o manifesto deixa de ser
fonte de legitimidade por si só).

# 10. Resumo da execução

*(a preencher pelo executor)*

# 11. Veredito

*(a preencher pelo revisor)*
