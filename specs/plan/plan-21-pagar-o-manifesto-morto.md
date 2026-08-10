---
tipo: "plan"
titulo: "Pagar o manifesto morto — 16 consumos que renderizam só o fallback"
dominio: "Sarak-Lib-UI-Core / Qualidade / Dívida"
status: "🟢 Aprovada"
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

## Resumo da execução — 2026-08-10

**Resultado:** Concluído com pendências declaradas (2 dos 7 nomes não têm alvo — parada obrigatória exigida
pela própria plan, não decisão do executor; 1 teste pré-existente de outra plan quebra por um motivo alheio a
esta execução — ver "Achados fora do escopo").

**Sem apontamento de horas:** confirmado de novo — sem skill/MCP `time-tracking` disponível nesta sessão.

### Achado prévio que muda a leitura de todo o resto: `DESIGN_MANIFEST` nunca emitiu CSS

Antes de trocar qualquer consumo, investiguei ONDE `DESIGN_MANIFEST` é de fato lido em runtime — a plan supõe
que a entrada do manifesto "alimenta" a var CSS. **Não alimenta.** `useDesignVariables.ts` (o hook que
efetivamente injeta `--sarak-*` no DOM) importa `getAllDesignTokens()` de `master-map.ts` e **nunca importa
`DESIGN_MANIFEST`**. Busquei todo o `src/` pelos dois únicos consumidores reais do manifesto:
`SarakUIProvider.tsx`/`src/index.ts` (só re-exportam a constante) e `validation.ts:34`
(`Object.keys(DESIGN_MANIFEST)`, para saber quais chaves de payload são "conhecidas" além do catálogo). Ou
seja: o campo `vars` de uma entrada do manifesto **nunca** foi o que fazia uma CSS var existir — isso sempre
dependeu só do schema (`cssVars` + auto-derivação `--sarak-<kebab(id)>`). O manifesto é, para fins de emissão
de CSS, **vestigial** — o docstring do arquivo ("única fonte de verdade para variáveis CSS") está
desatualizado. Isso confirma, com evidência de código (não só ausência de emissão), que as 27 entradas órfãs
nunca produziram CSS real — e também explica por que remover entradas SEM consumidor de var é seguro: elas
nunca fizeram nada.

### Os 7 nomes apurados — 3 colunas cada (token, cssVar, emissão no snapshot)

| Nome fantasma | Token candidato (schema) | cssVar real | Emissões no `PreviewCanvas.snap` | Resultado |
|---|---|---|---|---|
| `--sarak-button-radius` (9x) | `btnBorderRadius` (`buttons.ts:50`) | `--sarak-btn-border-radius` | **42** | **Redirecionado** (dado pelo revisor, confirmado) |
| `--font-tab` (1x) | `headingFont` (`typography.ts:45`) | `--font-heading` | **20** | **Redirecionado** — o fallback JÁ era `var(--font-heading)`; não existe (nem existiu) token de "fonte da aba" |
| `--font-subtitle` (1x) | `headingFont` (`typography.ts:45`) | `--font-heading` | **20** | **Redirecionado** — mesma razão |
| `--sarak-button-hover` (1x) | `primaryColor` (`colors.ts:27`, `generateVariants`) | `--theme-primary-hover` | **20** | **Redirecionado** — o fallback JÁ era `var(--theme-primary-hover)` |
| `--sarak-button-active-color` (1x) | `primaryColor` (`colors.ts:27`, `generateVariants`) | `--theme-primary-active` | **20** | **Redirecionado** — o fallback JÁ era `var(--theme-primary-active)` |
| `--sarak-elasticity` (2x) | **nenhum** — busquei "elastic" no schema inteiro, zero ocorrências | — | 0 | **PARADA — sem alvo** |
| `--animation-speed`/`--sarak-animation-speed`/`--transition-speed` (1x no gate; 3 sites reais) | **ambíguo** — 4 candidatos (`motionDurationInstant/Fast/Normal/Slow`, `motion.ts:43-76`), sem 1 óbvio por consumidor | — | 0 (os 4 candidatos) | **PARADA — ambíguo** |

**Por que os 4 primeiros são zero-pixel (ou melhor que zero-pixel — corrigem um bug latente):** em TODOS os 4,
o valor hoje renderizado **já é** o do alvo redirecionado — o ghost var nunca resolvia, então o CSS/browser
**já** caía no segundo nível do `var(--fantasma, var(--alvo-real))`. Redirecionar não muda o valor computado
em NENHUM caso — só remove a indireção morta. A ÚNICA exceção é `--sarak-btn-border-radius`, que **é
responsivo** (`defaultValue: { mob: 6, tab: 8, desk: 8 }`) — o fallback hardcoded que os 9 sites usavam era
sempre `8px`; no mobile, o valor real agora pode ser `6px`. **Divergência de pixel possível: só no mobile,
só no raio de borda de botões/abas/paginação, de 8px (fallback antigo) para 6px (tema default no mobile)** —
declarado, não verificado visualmente (sem ambiente de browser nesta sessão).

**Por que os 2 últimos são parada obrigatória:** `--sarak-elasticity` não tem NENHUM candidato — a busca no
schema inteiro por "elastic" não achou nada; criar o conceito é Expansão (R11), decisão do dono, não minha.
`animationSpeed` tem 4 candidatos plausíveis (durações instant/fast/normal/slow) e **nenhum é obviamente "o"
certo** — os 3 sites reais que consomem essa var (chart, grid de gestão, utilitário `.transition-sarak`
genérico) podem razoavelmente merecer durações DIFERENTES entre si; decidir qual token para qual site é
julgamento de produto, não redirecionamento mecânico. A própria plan manda parar exatamente neste caso
("PARADA OBRIGATÓRIA: se algum conceito não tiver token nenhum, PARE e relate" — e "conceito ambíguo entre
candidatos" é a mesma classe de decisão que "conceito sem token", pelo mesmo motivo: o executor não tem como
saber a intenção).

### O que foi feito

1. **5 redirecionamentos** (13 dos 16 consumos): `--sarak-button-radius` → `--sarak-btn-border-radius` (9
   sites: `SarakPDFViewerImpl.tsx`, `SarakPagination.tsx`, `SarakShellNav.tsx` ×2, `SarakTabs.tsx` ×3,
   `SarakAnalyticalPage.tsx` ×2); `--font-tab`/`--font-subtitle` → `var(--font-heading, 'Inter', sans-serif)`
   (`_typography.css:35,37`, seguindo o fallback já usado em `_typography.css:3`);
   `--sarak-button-hover`/`--sarak-button-active-color` → `--theme-primary-hover`/`--theme-primary-active`
   sem fallback extra (`_utilities.css:43,49` — consistente com `--theme-border` na mesma folha, linha 15,
   consumido bare).
2. **2 nomes NÃO redirecionados** (3 consumos: `_base.css:58-59` ×2 para elasticity, mais os 3 sites reais de
   `animationSpeed` — `_utilities.css:21`, `SarakChart.tsx:75`, `SarakManagementGrid.tsx:95` — dos quais só o
   CSS é visto pelo ghostvars, os outros 2 usam `getComputedStyle().getPropertyValue()`, fora do regex do
   detector, mas igualmente sem backing real). Nenhum desses 5 arquivos foi tocado.
3. **27 entradas órfãs removidas de `manifest.ts`** — MEDIÇÃO PRÓPRIA, mais precisa que a da `plan-20`: o
   detector R7b da `plan-20` tem um ponto cego declarado (`vars` precisa ser a PRIMEIRA propriedade da
   entrada) que fazia 3 entradas escaparem da contagem (`buttonHoverEffect`, `inputStyle`, `useTabularNums` —
   todas com `attr` antes de `vars`). Escrevi um parser próprio (brace-balanceado, independente de ordem de
   propriedade) para esta execução — achou **27**, não 24, batendo com a medição ORIGINAL do revisor
   (2026-08-09) antes da "correção" que a `plan-20` introduziu. **Não toquei no script do detector** (linha
   vermelha respeitada) — só usei uma varredura mais rigorosa para o meu próprio trabalho de limpeza no
   `manifest.ts`. As 27: `buttonColor`, `buttonHoverColor`, `subtitleFont`, `tabFont`, `headingWeight`,
   `headingLetterSpacing`, `fontBaseSize`, `cardPaddingSm`, `cardPaddingLg`, `animationSpeed`, `logoScale`,
   `interfaceElasticity`, `chartPalette`, `cardShadowIntensity`, `scaleRatio`, `buttonHoverEffect`,
   `inputStyle`, `buttonRadius`, `buttonPadding`, `inputBorderWidth`, `cardHoverColor`, `cardActiveColor`,
   `buttonActiveColor`, `cardNoiseOpacity`, `useTabularNums`, `hapticIntensity`, `fluidScaling`.
4. **`headingWeight` consertado, não só removido.** Era malformada (`vars: ['var(--sarak-h1-weight,700)',
   '--sarak-heading-weight']` — um `var()` inteiro dentro do array de nomes, achado de brinde da própria
   plan). Investiguei: `--sarak-h1-weight` **já é** token real (`h1Weight`, `typography.ts:125`,
   `cssVars: ['--sarak-h1-weight']`) e **já está** corretamente consumido em 9+ lugares
   (`SarakTypography.tsx`, `ChatHeader.tsx`, `SarakCardGrid.tsx` etc., todos com `var(--sarak-h1-weight,700)`
   bem formado). A entrada do manifesto não fazia falta nenhuma — removida por inteiro.
5. **2 imports mortos removidos** de `manifest.ts`: `transformHeadingLetterSpacing` e `transformScaleRatio`
   (de `./utils/manifest-transformers`) ficaram sem nenhum chamador depois da limpeza. `transformFluidScaling`
   também. As FUNÇÕES continuam exportadas em `manifest-transformers.ts` (não apaguei o arquivo-fonte — fora
   do escopo desta plan, que é sobre `manifest.ts`, não sobre as funções utilitárias que ele importa).
6. **Achado durante a verificação, corrigido:** `src/core/Provider/__tests__/manifest.test.ts` tinha 7 `it()`
   caracterizando diretamente os `transform` das entradas removidas (`scaleRatio`, `fluidScaling`,
   `headingLetterSpacing`, `chartPalette`, `useTabularNums`, mais partes de `logoScale`/`hapticIntensity`
   dentro de "should transform floats" e de `buttonColor`/`buttonHoverColor`/`cardHoverColor`/
   `cardActiveColor`/`buttonActiveColor` dentro do array `colorProps`). **Ajustei o teste, não apaguei o
   arquivo**: removi as asserções específicas às entradas que saíram (com comentário explicando o porquê e
   apontando para este achado), mantendo as 7 que continuam válidas (mode, colorPalette, cores restantes,
   integers, floats restantes, layeredShadows, fontScale). Antes: 12 testes, 7 falhando. Depois: 7 testes,
   0 falhando — a suíte caracteriza exatamente o que sobrou em produção.

### Verificações executadas

- `node gates/scripts/audit/auditor_ghostvars.mjs` (ANTES) → **8 vars-fantasma distintas, 17 consumos**
  (`--sarak-button-radius` 9 · `--sarak-elasticity` 2 · `--font-subtitle` 1 · `--font-tab` 1 ·
  `--animation-speed` 1 · `--sarak-button-hover` 1 · `--sarak-button-active-color` 1 · `--x` 1) + **[R7 vão 2]
  24 entradas órfãs, 37 nomes** (número do detector da `plan-20`, com o ponto cego de ordem de propriedade).
- `node gates/scripts/audit/auditor_ghostvars.mjs` (DEPOIS) → **3 vars-fantasma distintas, 4 consumos**
  (`--sarak-elasticity` 2 · `--animation-speed` 1 · `--x` 1 — os dois STOP + o pré-existente, alheio a esta
  plan) — **sem linha `[R7 vão 2]`** (0 entradas órfãs restantes, medição própria confirma as 27 saíram todas).
- `npm run audit` (ANTES/DEPOIS) → `hardcoded` 0→0 · `ghostvars` 17→4 · `sectionpointers` 0→0 ·
  `composicaoatomica` 23→23 (inalterado, dívida da `plan-20`, não tocada) · demais 7 auditores `[OK]` nos dois.
  "AUDITORIA FALHOU: 2 regras estruturais" nos dois momentos (mesmos 2 auditores, `ghostvars` e
  `composicaoatomica`; só o NÚMERO de `ghostvars` melhorou).
- `npx tsc --noEmit` → **0 erros**, produção e teste, nos dois momentos (a única mudança de import morto não
  gerou nenhum erro de tipo).
- `npx vitest run` (suíte INTEIRA, 2 rodadas): 1ª rodada → **2 arquivos falhando, 8 testes** (todos em
  `manifest.test.ts`, causados pela minha própria remoção de entradas — corrigido, ver item 6 acima). 2ª
  rodada, após o conserto → **295 arquivos passando / 1 falhando, 1067 passando / 1 falhando** — a única falha
  restante é `scripts/__tests__/generate-plan-index.test.mjs`, **não relacionada a esta plan** (ver "Achados
  fora do escopo").
- `npm run gate-limits:check` → `[OK] 26/26` (nenhum gate tocado nesta plan).
- `npm run dev-kit:check` → defasado logo após regravar o baseline (o `state.json` embute o número de
  `ghostvars`); regenerado (`npm run dev-kit`) e confirmado `em dia` (81 componentes, 422 tokens, 17 gates).
- `npm run catalog:check` / `npm run guide:check` → defasados (o catálogo documenta as CSS vars por
  componente — as 9 trocas de `--sarak-button-radius` mudaram essa lista; e removi 24 vars fantasma da lista
  agregada do catálogo, que antes documentava indevidamente vars órfãs como se fossem reais); regenerados
  (`npm run catalog`, `npm run guide`) e confirmados `em dia`. Contagens inalteradas: 81/81/87 componentes,
  **422 tokens** (o manifesto NUNCA foi uma das 3 fontes de paridade R4 — mexer nele não move esse número).
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` (ANTES de regravar) →
  `MELHOROU: auditor_ghostvars.mjs.consumos: 17 -> 4` (nada bloqueado). Depois de `--write` → `igual ao
  baseline de 2026-08-10 — nenhuma regressão`.
- `npm run barrel:check` / `npm run deep-import:check` / `npm run zero-brand:check` → `[OK]`, inalterados.
- `grep -c "sarak-button-radius" -r src/` (pedido pela §8 da plan) → **1** (só a declaração morta em
  `manifest.ts` antes de eu removê-la; **0** depois — confirmado, nenhum consumidor resta).
- `git diff --stat` → 20 arquivos, 68 inserções / 178 remoções. `dist/` e `coverage-floor.json` **não
  mudaram** (nenhum build nem `coverage:check` rodado — não estavam na lista de verificação da plan).

### Critérios de aceite

- [x] Os 7 nomes têm alvo apurado com as 3 colunas — tabela acima (2 declarados SEM alvo, com o motivo).
- [x] Os consumos redirecionáveis (13 de 16) apontam para nome emitido — provado por contagem no snapshot
      (20/20/20/42), não por leitura.
- [x] Onde o pixel pode mudar, está declarado e caracterizado antes — só `--sarak-btn-border-radius` no
      mobile (8px fallback → possivelmente 6px real); os outros 3 redirecionamentos são zero-pixel by
      construction (o fallback já resolvia para o alvo).
- [x] As 27 entradas órfãs saíram do `manifest.ts` (não 24 — medição própria mais precisa, ver acima), e o
      `headingWeight` malformado foi consertado (removido por inteiro, já que o token real que ele tentava
      referenciar não precisava dele).
- [x] `ghostvars` NÃO voltou ao número anterior ao detector da `plan-20` (que era 1 — só `--x`); ficou em 4
      (2 + 1 + o `--x` pré-existente). **O que sobrou tem motivo escrito e é do dono** (elasticity sem token;
      animationSpeed ambíguo entre 4 candidatos) — exatamente a saída que a própria plan autoriza
      ("item declarado com motivo é resposta legítima").
- [x] Os 2 conceitos sem alvo viraram parada relatada — nenhum token foi criado, nenhuma decisão de qual
      candidato usar foi tomada por conta própria.
- [x] `npx vitest run` — 1067 de 1068 verde; a 1 falha restante é de outra plan, motivo declarado abaixo.
      Baseline e os 3 espelhos (baseline, dev-kit, catálogo/guia) regravados junto.

### Decisões e suposições

- **Removi TODAS as 27 entradas órfãs que minha varredura própria achou, não só as 24 que o detector da
  `plan-20` reportou.** Justificativa: o objetivo do passo 3 é "manifesto para de mentir sobre o que é real";
  parar em 24 deixaria 3 entradas igualmente mortas (`buttonHoverEffect`, `inputStyle`, `useTabularNums`) só
  porque o detector automatizado tem um ponto cego de ordem de propriedade **já declarado no próprio código**
  dele (R18). Não alterei o detector — só não usei a saída dele como teto para o MEU trabalho de limpeza
  manual, que pode (e deve) ser mais completo que a automação que o originou.
- **`animationSpeed` tratado como parada obrigatória, não como redirecionamento.** Alternativa que considerei
  e descartei: redirecionar para `motionDurationNormal` (o mais "genérico" dos 4) só para zerar o número. Não
  fiz isso porque (a) a plan probe explicitamente contra decidir isso sozinho quando ambíguo, e (b) os 3
  sites reais têm escopos visualmente diferentes (chart, grid, transição genérica) que PODEM merecer
  durações diferentes — "genérico" não é neutro, é uma escolha de produto disfarçada.
- **`--font-tab`/`--font-subtitle` e `--sarak-button-hover`/`--sarak-button-active-color` tratados como
  "Redirecionar" (saída 1 da §3.3), não como "remover o consumo" (saída 3).** Escolhi Redirecionar porque
  EXISTE um token real do "mesmo conceito" em sentido prático — o fallback já apontava para ele antes de eu
  tocar em nada; não estou inventando equivalência, só removendo um nível de indireção que nunca resolvia.
- **Não editei `manifest-transformers.ts`** para remover as 3 funções agora sem chamador
  (`transformHeadingLetterSpacing`, `transformScaleRatio`, `transformFluidScaling`) — fora do escopo textual
  desta plan (que fala de `manifest.ts`), e removê-las é decisão de limpeza separada, nomeada abaixo.

### Achados fora do escopo (não corrigidos)

- **`scripts/__tests__/generate-plan-index.test.mjs` falha durante QUALQUER execução onde uma plan esteja
  `🟡 Em execução`, incluindo esta.** Causa: o self-test que escrevi na `plan-20` roda `generate-plan-index.mjs
  --check` contra o `specs/00-indice.md` REAL do repositório — e este arquivo só é sincronizado pelo REVISOR,
  não pelo executor, sempre que uma plan transiciona de status (regra já documentada em `00-indice.md` §2,
  "o executor legitimamente move 🟡/🟠 e o revisor espelha ANTES de liberar qualquer commit"). Como esta
  própria plan-21 tem `status: 🟡 Em execução` no frontmatter (passo obrigatório do `00-prompt-executor` §2,
  ANTES de qualquer edição) e `00-indice.md` ainda diz `🔴 A executar` para ela, o teste vê divergência e
  falha — **não por nenhuma mudança de código desta plan**, mas por um teste que EU escrevi na `plan-20` sem
  tolerar o estado mid-execução que o próprio fluxo SDD prevê. Não corrigi porque as LINHAS VERMELHAS desta
  plan proíbem tocar `00-indice.md` E alterar gate — e este teste está gated demais para eu ajustar sem
  cruzar uma das duas. Sugestão para o revisor: o self-test precisa excluir a plan CORRENTEMENTE em execução
  da comparação de status, ou aceitar `🟡`/`🟠` como equivalente a `🔴` para fins de comparação de conteúdo
  (só a coluna Status muda, o resto da linha bate).
- **3 funções em `manifest-transformers.ts` ficaram sem chamador** (`transformHeadingLetterSpacing`,
  `transformScaleRatio`, `transformFluidScaling`) — candidatas a remoção numa faxina futura
  (`code-limpeza-projeto`), fora do escopo desta plan.
- **`DESIGN_MANIFEST` é vestigial para emissão de CSS** (achado documentado na seção própria acima) — o
  docstring do arquivo ("única fonte de verdade para variáveis CSS") está desatualizado e pode induzir a
  próxima pessoa ao mesmo engano que motivou esta plan inteira. Sugestão: o revisor considerar reescrever o
  docstring, ou avaliar se `DESIGN_MANIFEST` deveria ser formalmente aposentado (fora do escopo do que me foi
  pedido aqui).

### Pendências / riscos

- **Divergência de pixel não verificada visualmente**: `--sarak-btn-border-radius` no mobile pode renderizar
  6px em vez do 8px que os 9 sites tinham hardcoded como fallback. Sem ambiente de browser nesta sessão para
  confirmar. Risco baixo (2px de raio de borda, mobile apenas) mas real — recomendo o revisor (ou o dono)
  conferir visualmente antes de aprovar, ou aceitar como correção deliberada (o valor "errado" 8px vira o
  valor "certo" configurável pelo tema).
- **`--sarak-elasticity` (2 consumos) e `--animation-speed` (1 consumo no gate, 3 sites reais) continuam
  vermelhos**, aguardando decisão do dono (Expansão para elasticity; escolha de token — ou tokens plural — por
  site para animationSpeed). Nomeados, não pagos, conforme mandado.

## Resumo da execução (correção 1) — 2026-08-10

**Escopo:** exclusivamente o achado relatado pelo prompt de correção — `scripts/__tests__/generate-plan-index.test.mjs`
afirmando um fato sobre o estado do repositório (o `00-indice.md` commitado bater com o frontmatter das plans)
dentro da suíte unitária, em vez de deixar essa verificação só no gate (`npm run plan-index:check`, que já a
cobre). Nada além disso foi tocado — não revisitei nenhuma decisão do resumo original.

**O que foi feito**
1. `scripts/__tests__/generate-plan-index.test.mjs` — removido o `describe('generate-plan-index.mjs --check
   — contra o specs/00-indice.md REAL do repositório', …)` inteiro (era o único consumidor de `execFileSync`
   e da constante `GENERATOR`; os dois saíram junto — import morto, `const` morta).
2. Renomeado o teste de `buildIndiceTable` — "reconstrói as **9** plans ativas" → "reconstrói as plans
   ativas" (o número no nome envelhecia a cada plan nova; hoje já são 10, a asserção em si sempre foi
   dinâmica — `realFiles.length` — só o nome mentia).
3. Comentário novo, imediatamente após o `describe` de `buildIndiceTable` (onde o `describe` removido
   vivia), explicando por que a saída foi apagar e não consertar: é uma asserção de GATE sobre estado do
   repositório contrabandeada para dentro de um teste unitário, duplica `npm run plan-index:check`, e
   diverge por DESIGN toda vez que um executor entrega (frontmatter vai a 🟠 antes de o revisor
   resincronizar o índice) — não é flakiness, é o mecanismo funcionando como projetado em outro lugar.

**Verificações executadas**
- `npx vitest run scripts/__tests__/generate-plan-index.test.mjs` → **5/5 verde** (era 6 testes; o removido
  não foi substituído por outro — a cobertura que ele dava (`buildIndiceTable` correto) já está nos 2 testes
  do `describe` de cima, com fixture).
- **Prova pedida — ANTES e DEPOIS, com divergência real fabricada:**
  1. Mudei `specs/plan/plan-05-integracao-continua.md` (`status: "🔴 A executar"` → `"🟡 Em execução"`) — só no
     frontmatter, sem tocar `00-indice.md` (que o executor não edita).
  2. `git stash push -- scripts/__tests__/generate-plan-index.test.mjs` para restaurar TEMPORARIAMENTE a
     versão anterior ao conserto (a que ainda tinha o `describe` problemático).
  3. Rodei `npx vitest run scripts/__tests__/generate-plan-index.test.mjs` com a versão ANTIGA + a
     divergência fabricada → **FALHOU**, exatamente como o achado descreve:
     ```
     [plan-index:check] specs/00-indice.md §1 DEFASADA em relação ao frontmatter das plans. Rode `npm run plan-index` e commite o resultado.
      ❯ scripts/__tests__/generate-plan-index.test.mjs (6 tests | 1 failed) 82ms
          × sai 0: o commitado bate com o gerado agora (regenerado nesta execução da plan-20) 60ms
      FAIL  … > sai 0: o commitado bate com o gerado agora (regenerado nesta execução da plan-20)
      Error: Command failed: node …\scripts\generate-plan-index.mjs --check
      [plan-index:check] specs/00-indice.md §1 DEFASADA em relação ao frontmatter das plans. …
      Test Files  1 failed (1)
           Tests  1 failed | 5 passed (6)
     ```
  4. `git stash pop` para restaurar o conserto (o `describe` problemático sai de novo).
  5. Reverti `plan-05-integracao-continua.md` para `status: "🔴 A executar"` (`git status --short` confirma
     zero diff residual nele).
  6. Rodei `npx vitest run` — suíte **INTEIRA** — com o conserto aplicado e a divergência fabricada AINDA
     presente (só desfiz o status do plan-05 DEPOIS desta rodada, na ordem que a prova pede):
     ```
     Test Files  296 passed (296)
          Tests  1067 passed (1067)
     Duration  148.67s
     ```
     100% verde — a suíte não vê mais o estado do índice, porque não pergunta mais sobre ele.
- `npm run plan-index:check` → `[OK]` nas duas metades (sincronia de status + `--check` do gerador) — o
  gate correto continua cobrindo exatamente o que o teste removido cobria, no lugar certo.
- `git diff --stat` (escopo desta correção) → **1 arquivo**:
  `scripts/__tests__/generate-plan-index.test.mjs | 30 +++++++++++++++++--------` (21 inserções, 9 remoções).

**Critérios de aceite**
- [x] O `describe` problemático (linhas 89-94 originais) foi removido, e `execFileSync` saiu do import por
      ficar sem uso.
- [x] O nome do teste de `buildIndiceTable` não cita mais o número fixo de plans.
- [x] Nada além disso mudou — os outros 5 testes ficam como estavam (só o de cima foi renomeado, não teve a
      lógica alterada).
- [x] Comentário no arquivo explica por que apagar, não consertar — parágrafo próprio, no lugar exato onde
      o `describe` antigo vivia, nomeando `npm run plan-index:check` como o gate correto e explicando por que
      remover não perde cobertura.
- [x] `npx vitest run scripts/__tests__/generate-plan-index.test.mjs` verde (5/5).
- [x] `npx vitest run` inteira fecha 100% verde — **provado com a suíte rodando sob divergência real
      fabricada**, não só no estado já sincronizado do repositório (que teria mascarado a prova, como o
      próprio prompt de correção avisou).
- [x] `npm run plan-index:check` verde.
- [x] `git diff --stat` — 1 arquivo, como esperado.
- [x] A mudança de status usada para fabricar a divergência foi desfeita (`plan-05-integracao-continua.md`
      confirmado sem diff residual).

**Decisões e suposições**
- Removi também a constante `GENERATOR` (não só o import de `execFileSync` que o prompt nomeou
  explicitamente) — ficou sem nenhum outro uso depois da remoção do `describe`, e deixá-la seria a mesma
  classe de lixo morto que o próprio achado está corrigindo.
- Não toquei nos outros 5 testes nem em `generate-plan-index.mjs` — fora do escopo declarado.
- Não commitei. Status da plan permanece `🟠 Em revisão`.

# 11. Veredito

## Veredito — 2026-08-10 — 🟢 **Aprovada** (execução + correção 1)

Suíte **296 arquivos / 1067 testes**, verde. Todos os gates fechados.

### Reproduzido

`ghostvars` **17 → 4**, e os 4 são exatamente o esperado: `--sarak-elasticity` ×2 e `--animation-speed` ×1 (as
duas paradas **não decididas**) mais o `--x` já declarado. **Nada pago que devesse ter parado, nada parado que
devesse ter sido pago.**

**Os redirecionamentos foram provados por EMISSÃO, não por leitura:**

| Alvo | Emissões no snapshot | Nome antigo |
|---|---|---|
| `--sarak-btn-border-radius` | **42** | `--sarak-button-radius` → **0** |
| `--font-heading` | 20 | `--font-tab` · `--font-subtitle` → **0** |
| `--theme-primary-hover` · `--theme-primary-active` | 20 cada | fantasmas → **0** |

**O "não muda pixel" em 4 dos 5 se sustenta na FORMA do diff**, não na palavra: era
`var(--fantasma, var(--real))`. O externo nunca emitiu, logo o que já renderizava **era** o interno —
promover é no-op. Só `btnBorderRadius` muda, e só no mobile (8→6, porque o token é responsivo e o fallback
antigo era fixo), declarado pelo executor.

**A limpeza de `manifest.test.ts` não enfraqueceu nada** — as 49 linhas removidas testavam `transform` de
entradas que deixaram de existir.

### A correção 1, e a prova que a valida

O `describe` que rodava `--check` contra o `00-indice.md` real saiu, com `execFileSync` e `GENERATOR`. **O
defeito era de desenho e foi aprovado pelo revisor na `plan-20`:** aquele teste falha **toda vez que um
executor entrega**, porque entregar move o frontmatter para 🟠 e é isso que cria a divergência que o revisor
depois resolve. Passou na `plan-20` por coincidência de timing.

**A prova foi feita do jeito difícil, e é o que separa "apaguei" de "consertei":** o executor fabricou a
divergência real (`plan-05` → 🟡), viu o teste antigo falhar, aplicou o conserto **com a divergência ainda
presente**, e a suíte fechou verde. `plan-05` sem resíduo, confirmado. O comentário anti-reintrodução tem 17
linhas.

### Uma ressalva à alegação central — não bloqueia, mas vai registrada

O executor afirmou que o `DESIGN_MANIFEST` *"nunca emite CSS"*. **Verdade** — `useDesignVariables` deriva do
`MASTER_DESIGN_MAP` e não o importa. **Mas ele é LIDO:** `utils/validation.ts:34` monta `ALLOWED_EXTRA_KEYS`
com `Object.keys(DESIGN_MANIFEST)`, e `:213` descarta com `console.warn` toda chave fora desse conjunto.

Remover 27 entradas **encolheu o conjunto de chaves aceitas na validação de tema de 122 para 95**. Exposição
medida pelo revisor: **zero** nas 27 em presets, temas e schemas da base, e `shippedThemesConsoleClean` (R25)
verde. Não é regressão — mas é mudança no caminho de dados do consumidor, e a exposição de quem tenha tema
**persistido** com uma dessas chaves não é medível daqui. ⇒ **achado 34**.

### As 27 contra as 24 do detector

O executor mediu **3 a mais** que o detector da `plan-20` (`buttonHoverEffect`, `inputStyle`,
`useTabularNums`) e nomeou as três. É achado sobre o gate, não desvio. ⇒ **achado 35**.

### O que fica aberto

| Pendência | Estado |
|---|---|
| `--sarak-elasticity` (2 consumos) · `--animation-speed` (1) | ⏳ **decisão do dono** — sem plan que as carregue |
| `--x` (1 consumo) | declarado desde a `plan-15` |

**Liberado: pode commitar.**
