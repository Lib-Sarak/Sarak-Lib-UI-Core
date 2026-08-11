---
tipo: "plan"
titulo: "Contraste — o gate da R31 nasce, e o tema antigo passa a ser contrato"
dominio: "Sarak-Lib-UI-Core / Design / Temas"
status: "🟢 Aprovada"
prioridade: "Alta"
tags: ["plan", "r31", "temas", "acessibilidade", "wcag"]
relacionados: ["[[00-regras-e-invariantes]]", "[[09-temas-e-presets]]", "[[10-seguranca-e-acessibilidade]]", "[[15-divida-conhecida]]"]
depende_de: "plan-23"
objetivo: "Ligar o gate de contraste da R31 e congelar o payload de tema como contrato"
destino_sintese: "specs/specs/09-temas-e-presets.md · specs/specs/00-regras-e-invariantes.md · specs/specs/01-gates-e-baseline.md"
---

> 🎯 **É a única pendência que o USUÁRIO FINAL enxerga.** Todo o resto desta campanha foi dívida interna:
> gate, nome de variável, endereço de arquivo. Isto é texto ilegível na tela de quem usa o produto.

# 1. Objetivo

**O contraste passa a ser MEDIDO** — gate ligado, pares reais levantados, alfa composto — e o **payload de
tema vira contrato**, com corpus congelado que acusa chave perdida.

**Esta plan não conserta tema.** Ela entrega a régua e a rede; produzir é a [[plan-24-1-fluxo-de-criacao-de-tema]].

# 2. Contexto

## 2.1 A medição, e por que ela não é discutível

A `plan-12` mediu e o revisor **reproduziu de forma independente**: **12 dos 18 temas** falham em pelo menos
um dos 4 pares canônicos de contraste.

| Fato | Medição |
|---|---|
| Temas que falham ≥1 par canônico | **12 de 18** |
| Falhas em **texto primário ou secundário** (não só tom apagado) | **4** |
| Pior caso | `neo-brutalism`: `#000000` sobre `#050505` = **1.03:1** |
| Um dos reprovados é referência | `minimalist-airy`, um dos dois `SARAK_REFERENCE_THEMES` |

> 🔴 **O `minimalist-airy` é o que dói.** A [[09-temas-e-presets]] §4.1 manda o consumidor **clonar** um dos
> `SARAK_REFERENCE_THEMES` como ponto de partida. Ou seja: a lib entrega um molde com defeito de contraste e
> pede para copiá-lo.

## 2.2 Não é ajuste de régua — isso foi testado

A primeira leitura enquadrou o problema como escolha de limiar: *"talvez `textColorMuted` deva ser cobrado a
3:1 em vez de 4,5:1"*. O revisor mediu o contrafactual: **relaxar `textColorMuted` para 3:1 resgata apenas 1
dos 12**.

As outras 11 falham **abaixo até de 3:1**. **São 12 temas com defeito de contraste real**, não uma régua
apertada demais.

## 2.3 A decisão do dono — recriar, não emendar *(2026-08-09)*

> *"Os temas atuais são apenas temas criados anteriormente, podemos recriá-los sem problemas, inclusive
> criaremos mais temas em etapa posterior."* — e, depois: *"essa biblioteca possui uma granularidade imensa
> para criação de layout; a maior funcionalidade é a criação de temas/layouts personalizados, os temas atuais
> foram criados anteriormente, muitos são antigos."*

**Recriar sai mais barato que emendar 12**, e por um motivo estrutural: emendar 12 paletas uma a uma produz 12
decisões isoladas de cor, sem critério comum. Recriar com o contraste **no critério de nascimento** produz um
conjunto coerente — e o gate nasce verde em vez de nascer vermelho.

## 2.4 O script de medição — resgatar antes de começar

A `plan-12` mediu com um script que viveu só no `%TEMP%` da sessão. O revisor o **reproduziu e preservou como
anexo da `plan-12`**. **Ele é o ponto de partida do gate**, não trabalho novo — mas precisa sair de anexo de
plan e virar código versionado.

## 2.5 ✅ AS TRÊS PERGUNTAS DE FRONTEIRA — respondidas pelo dono em 2026-08-10

> ✅ **FECHADAS. Não reabra — execute.** A §3.3 abaixo fica como registro de como foram formuladas.

### 1 · Quais pares o gate cobra ⇒ **TODOS OS PARES REAIS**

Não só os 4 canônicos. O gate enumera os pares texto/fundo que os componentes **de fato compõem** — texto
sobre card, sobre sidebar, sobre botão, sobre badge.

**Consequência assumida:** é mais caro que os 4, e o gate precisa saber quais pares existem, não só qual é a
paleta. **Comece pelo levantamento**, não pelo cálculo.

### 2 · `textColorMuted` ⇒ **MANTER 4,5:1**

E a medição do revisor mostrou que isto **quase deixou de ser uma escolha**:

> A WCAG AA não é um número só — são dois, e **quem escolhe entre eles é o tamanho da fonte**: **4,5:1** para
> texto normal, **3:1** só para texto grande (≥24px, ou ≥18,66px em negrito).

Onde o `theme-muted` renderiza, medido: `text-xs` (12px), `text-sm` (14px), e nas trocas do lote 6 da
`plan-15` também `text-2xs` (10px) e `text-3xs` (9px). **Nenhum chega perto de 24px.**

**Logo, cobrar 3:1 ali não seria escolher o limiar permitido — seria descumprir a WCAG e chamar de AA.** O
único tema que o relaxamento resgatava seria resgatado **por engano**.

> **A alternativa legítima que NÃO foi escolhida:** cobrar por tamanho real — o gate olha em que `font-size`
> cada par renderiza e aplica 4,5 ou 3 conforme. Mais correto e muito mais caro: exige o gate conhecer a
> tipografia de cada uso, não só a paleta. Fica registrado como ampliação futura.

### 3 · Os pares em `rgba()` ⇒ **COMPOR SOBRE O FUNDO DO TEMA**

Não declarar fora. Contraste se calcula entre duas cores **opacas**; com alfa, a cor efetiva depende do que
está atrás — mas **dentro de um tema o fundo é conhecido**, e o gate roda tema a tema.

**A medição que tornou "declarar fora" inviável:** são **394 ocorrências de `rgba()` em 19 dos 21 arquivos de
tema**, e a esmagadora maioria é **fundo**, não texto (`aiPanelBg`, `btnGhostHoverBg`, overlays). Somado à
resposta 1 — *todos os pares reais* —, quase todo par novo terá um `rgba()` de um lado. **Declarar fora seria
excluir justamente a fatia que a resposta 1 mandou incluir**; as duas respostas se contradiriam.

Compor alfa sobre cor sólida é fórmula de três linhas, não problema de renderização.

> ⚠️ **O caso difícil existe e tem saída declarada:** `rgba` sobre `rgba` sobre imagem/gradiente. Onde o fundo
> **não** for determinístico, o gate **declara com o número** (R18) em vez de chutar um fundo.

## 2.6 🔴 O REQUISITO QUE O DONO ACRESCENTOU — tema antigo não pode quebrar

> *"Conforme a biblioteca evolui, os temas anteriores não devem quebrar, devem manter o mesmo
> funcionamento."* — dono, 2026-08-10

**Isto não é sobre os 18 shippados** — esses são conteúdo da lib e o próprio dono já autorizou recriá-los. É
sobre **o payload de tema como contrato público**: um tema que o consumidor escreveu ou salvou na versão N
tem de continuar produzindo o mesmo resultado em N+1.

### Já foi violado uma vez, e ninguém percebeu na hora

A `plan-21` removeu 27 entradas órfãs do `manifest.ts`. Como `validation.ts:34` monta
`ALLOWED_EXTRA_KEYS` a partir de `Object.keys(DESIGN_MANIFEST)`, **o conjunto de chaves aceitas caiu de 122
para 95**. Pela R6, chave fora do conjunto é **descartada com `console.warn`**.

Ou seja: um consumidor com tema persistido contendo uma daquelas 27 chaves **perde a chave em silêncio** — o
aviso vai para o console, não para ele. Foi registrado como **achado 34** e aceito, porque a exposição medida
na base é zero — mas o **mecanismo** que permitiu isso continua de pé.

### O que NÃO existe hoje — medido pelo revisor

| Garantia | Existe? |
|---|---|
| Teste que carrega payload de tema de uma versão anterior | ❌ **nenhum** |
| Alias/depreciação para chave de payload renomeada ou removida | ❌ **nenhum** |
| Gate que detecte remoção de chave pública do domínio de tema | ❌ **nenhum** |
| `tokenContractParity.test.ts` | ✅ mas cobre os temas **atuais** contra o contrato **atual** — não é compatibilidade |
| `master-map.test.ts` | ✅ é caracterização de compatibilidade, mas de **uma** mudança específica (a desduplicação dos 7 ids) |

**A base tem o hábito certo — o `master-map.test.ts` é exatamente o molde — e não tem a regra.**

### O desenho proposto, em três peças

**1 · O payload de tema é contrato público, e isso vira regra escrita.** Remover ou renomear chave do domínio
de tema é **breaking change**, na mesma classe de remover export do barril. Hoje isso não está escrito em
lugar nenhum, e foi por isso que a `plan-21` pôde encolher o domínio sem que nada acusasse.

**2 · Corpus congelado de payloads.** Fixtures no formato do consumidor — não os 18 shippados —, uma por
versão relevante, com o CSS emitido capturado. Qualquer mudança que altere a saída de uma fixture **falha**.
É o `master-map.test.ts` generalizado, e é o que transforma a promessa em teste.

> ⚠️ **A distinção que faz isso funcionar:** o **dado** é contrato; a **cor** dos 18 temas é conteúdo. Recriar
> os 18 muda cor e **não** quebra fixture nenhuma, porque a fixture é payload de consumidor, não tema da lib.
> Sem essa separação, o requisito do dono e a recriação dos temas se contradiriam.

**3 · Alias para renome, com prazo.** Chave renomeada mantém o nome antigo como alias por pelo menos uma
major, e o alias é **listado** — não é `catch` genérico. Chave removida sem alias exige entrada em
`docs/migracoes.md`, como já vale para export público.

> **⇒ ESTE BLOCO PRECISA DE DECISÃO DO DONO ANTES DE VIRAR CÓDIGO.** As três peças têm custos diferentes, e a
> 3 muda a R6. Ver a nota de escopo na §3.1.

# 3. Escopo

> 🔴 **ESTA PLAN FOI DIVIDIDA em 2026-08-10.** Ela ficou grande demais quando o dono trocou o eixo de
> *"recriar 18 temas"* para *"o sistema produz tema acessível por construção"*. A divisão segue o padrão que
> esta base já usou duas vezes — `plan-16 → plan-15` e `plan-20 → plan-21`: **medir e construir o verificador
> primeiro; produzir depois.**
>
> | | |
> |---|---|
> | **`plan-24`** *(esta)* | **o gate e o contrato** — mede, acusa, e protege o tema antigo |
> | [[plan-24-1-fluxo-de-criacao-de-tema]] | **o fluxo de criação** — solucionador, mapa do agente, e os temas |
>
> A `24` nasce com o gate **vermelho** e **não conserta nenhum tema**. Consertar é a `24.1`.

## 3.1 Dentro

1. **Trazer o script de contraste para `gates/`**, versionado, com teste próprio. Ele mediu 12/18 na `plan-12`
   e foi reproduzido pelo revisor — **não reescreva do zero**.
2. **Levantar os PARES REAIS** que os componentes compõem (resposta 1 da §2.5). É o passo que dimensiona todo
   o resto, e ele **produz um artefato**: a lista `tokenId de texto × tokenId de fundo`, que a `24.1` usa para
   escrever o mapa do agente.
3. **Ligar o gate da R31**, com **composição de alfa** (resposta 3). Ele **NASCE VERMELHO**.
4. **Compatibilidade de tema — peças 1 e 2 da §2.6**, e só elas:
   - **1 · o payload de tema é contrato público** ⇒ a regra é do **revisor**, na síntese; o executor apenas
     **relata** o que mediu;
   - **2 · corpus congelado de payloads** ⇒ fixtures no formato do **consumidor**, com o CSS emitido
     capturado. É o `master-map.test.ts` generalizado.
5. R31 **permanece ⏳** ao final desta plan. Ela vira ✅ na `24.1`, quando os temas passarem.

## 3.2 Fora

- ⛔ **Corrigir tema.** Nem um. Gate vermelho é o **resultado esperado** — é ele provando que mede.
- ⛔ **O solucionador de contraste, o mapa do agente e o gabarito de 422** — são a `24.1`.
- ⛔ **A peça 3 da §2.6 (alias com prazo).** Ela muda a **R6**, e mexer em regra formada é decisão do dono.
  **Adiada por um motivo concreto:** não há nenhum renome na fila hoje, e criar mecanismo de alias antes de
  existir o primeiro alias é construir para um caso imaginado. Com as peças 1 e 2 no lugar, o dia em que um
  renome aparecer o **corpus acusa**, e o alias nasce com o caso real na mão.
- ⛔ Criar tema novo, mudar API de tema, schema ou token.

## 3.3 O que "pares reais" significa, e por que é o passo caro

A R31 diz *"nos pares texto/fundo **que produzem**"* — e essa expressão não define um conjunto. Foi por isso
que a `plan-12` parou aqui.

**Os 4 canônicos são só o começo.** Os componentes compõem texto sobre card, sobre sidebar, sobre topbar,
sobre botão, sobre badge, sobre painel de chat, sobre célula de tabela. **Cada par é um `tokenId` de cor de
texto contra um `tokenId` de superfície**, e a lista não existe escrita em lugar nenhum.

**Como levantar, em ordem de confiança:**

| Fonte | O que dá |
|---|---|
| `catalog/partitions/*.json` → `categories` e `relatedTokens` | quais tokens são texto e quais são superfície |
| `theme_table_mapping.json` | como os 422 se agrupam por coluna/domínio |
| O **snapshot do `PreviewCanvas`** | o que é **de fato emitido**, por tema — a prova de que o par existe |

⚠️ **Não deduza par por nome.** `cardTitleColor` sobre `cardBg` é óbvio; `cardSearchPlaceholderColor` sobre o
quê, não. **Onde o fundo não for determinável, declare o par como não coberto, com o número** (R18) — igual ao
que a `plan-20` fez com o ponto cego do marcador.

## 3.4 A composição de alfa — a fórmula, para não virar pesquisa

Cor com alfa sobre um fundo sólido resolve por interpolação linear em cada canal:

```
efetiva = alfa × cor + (1 − alfa) × fundo
```

Feito isso, o cálculo de contraste é o de sempre — luminância relativa e razão. **São três linhas, não um
problema de renderização.**

⚠️ **O caso difícil, e a saída já decidida:** `rgba` sobre `rgba` sobre imagem ou gradiente. Onde o fundo
**não** for determinístico, o gate **declara com o número** em vez de chutar um fundo. Medido: **394
ocorrências de `rgba()` em 19 dos 21 arquivos de tema** — a maioria esmagadora é fundo (`aiPanelBg`,
`btnGhostHoverBg`, overlays), então a maior parte **é** componível.

## 3.5 O corpus congelado — o que congelar, e o que NÃO congelar

> 🔴 **A distinção que faz o requisito conviver com recriar os temas.** Sem ela, o pedido do dono — *"tema
> antigo não pode quebrar"* — e a recriação dos 18 se contradiriam.

| | Congela? | Por quê |
|---|---|---|
| **Payload de tema no formato do consumidor** | ✅ **sim** | é **contrato** — chave que some quebra quem salvou |
| Os 18 temas shippados da lib | ❌ **não** | são **conteúdo**; o dono já autorizou recriá-los |

**A fixture é um payload de consumidor**, não um tema da lib. Recriar os 18 muda cor e **não quebra fixture
nenhuma** — porque a fixture testa *"as chaves que eu salvei continuam produzindo as mesmas variáveis"*, não
*"o tema X continua azul"*.

**O que a fixture captura:** o conjunto de variáveis CSS emitidas para aquele payload. Se uma chave sumir do
domínio, ela deixa de ser emitida, e o teste **falha** — que é exatamente o que faltou quando a `plan-21`
encolheu `ALLOWED_EXTRA_KEYS` de 122 para 95 sem nada acusar.

# 4. Referências obrigatórias

| Tipo | Onde | Para quê |
|---|---|---|
| Spec fixa | [[00-regras-e-invariantes]] → **R31**, **R6**, **R18** | o enunciado; o descarte de chave fora do domínio; declarar o que não se vê |
| Spec fixa | [[09-temas-e-presets]] §4.1 | por que o `minimalist-airy` é o mais grave |
| Anexo | `plan-12` — o script de contraste preservado | ponto de partida do gate |
| Fonte | `catalog/partitions/*.json` · `theme_table_mapping.json` | de onde sai a lista de pares |
| Prova de emissão | snapshot do `PreviewCanvas` | o que é **de fato** emitido, por tema |
| Molde | `src/core/Design/__tests__/master-map.test.ts` | o corpus congelado generalizado |
| Achado | [[15-divida-conhecida]] → **34** | a violação que motivou a §2.6 |

# 5. Instruções de execução

1. **Script primeiro.** Sem medição versionada, nada aqui é verificável.
2. **Levantar os pares antes de calcular.** ⇒ Apresente a lista ao dono: quantos pares, quantos componíveis,
   quantos não determináveis. **É ela que dimensiona a `24.1`.**
3. **O gate nasce vermelho, e isso é o aceite** — não maquie limiar para reduzir o número.
4. **O corpus é de payload de CONSUMIDOR**, nunca dos 18 shippados. Ver §3.5.
5. **Não conserte tema.** Se der vontade, o item é da `24.1`.

# 6. Prompt de execução

```
Leia specs/00-prompt-executor.md e execute specs/plan/plan-24-aplicacao-de-temas.md.

Contexto obrigatório: specs/00-contexto.md, specs/00-knowledge.md,
specs/specs/00-regras-e-invariantes.md (R31, R6, R18),
specs/specs/09-temas-e-presets.md, o anexo com o script de contraste da plan-12,
e a §2 e §3 desta plan.
Skills: test-unitario, padrao-typescript, padrao-escrita.

⚠️ ESTA PLAN NÃO CONSERTA TEMA NENHUM. Ela constrói o verificador e o contrato.
Consertar é a plan-24-1. Gate vermelho ao final é o RESULTADO ESPERADO.

PASSO 1 — trazer o script de contraste da plan-12 para gates/, versionado, com
teste próprio. Ele mediu 12/18 e foi reproduzido pelo revisor. NÃO reescreva.

PASSO 2 — LEVANTAR OS PARES REAIS. É o passo caro e o que dimensiona a 24.1.
  A R31 diz "os pares que os componentes produzem" — e essa lista NÃO existe
  escrita em lugar nenhum. Monte-a cruzando:
    · catalog/partitions/*.json → categories e relatedTokens (quem é texto, quem
      é superfície)
    · theme_table_mapping.json → como os 422 se agrupam
    · o snapshot do PreviewCanvas → o que é DE FATO emitido, por tema
  ⚠️ NÃO deduza par por nome. `cardTitleColor` sobre `cardBg` é óbvio;
    `cardSearchPlaceholderColor` sobre o quê, não. Onde o fundo não for
    determinável, DECLARE o par como não coberto, COM O NÚMERO (R18).
  ⇒ PARADA OBRIGATÓRIA: apresente a lista ao dono — quantos pares, quantos
    componíveis, quantos não determináveis.

PASSO 3 — ligar o gate, com COMPOSIÇÃO DE ALFA:
    efetiva = alfa × cor + (1 − alfa) × fundo
  e daí o cálculo de contraste normal. Três linhas, não pesquisa.
  Limiar: 4,5:1, decidido pelo dono. NÃO relaxe para 3:1 — a WCAG só permite 3:1
  para texto grande (≥24px), e o revisor mediu que o `theme-muted` renderiza em
  9–14px. Relaxar seria descumprir e chamar de AA.
  O gate NASCE VERMELHO. Regrave o baseline com o número e NÃO conserte nada.

PASSO 4 — compatibilidade, SÓ as peças 1 e 2 da §2.6:
  · peça 1 (o payload é contrato público) é REGRA — do revisor, na síntese.
    Você só RELATA o que mediu.
  · peça 2 — corpus congelado: fixtures de payload NO FORMATO DO CONSUMIDOR,
    com o CSS emitido capturado. Molde: master-map.test.ts.
    ⚠️ NÃO congele os 18 temas shippados. Eles são CONTEÚDO e o dono já
      autorizou recriá-los; congelá-los travaria a 24.1. Ver §3.5.
  · peça 3 (alias) está ADIADA — não implemente.

LINHAS VERMELHAS:
  · Você NÃO corrige tema. Nenhum.
  · Você NÃO cria tema, nem muda API de tema/schema/token.
  · Você NÃO afrouxa o limiar para reduzir o vermelho.
  · Você NÃO edita specs/specs/, specs/adr/, specs/arquitetura/ nem 00-indice.md.

Os três espelhos: gates/baselines/ · sarak-dev/ (npm run dev-kit) · sarak-ui/
(npm run guide — a contagem de tokens não deve mudar).

VERIFICAÇÕES, com a saída colada:
  npm run audit           (ANTES e DEPOIS — o gate novo aparece VERMELHO)
  npx vitest run          (INTEIRA)
  npm run gate-limits:check · npm run dev-kit:check
  node gates/scripts/release/check-audit-baseline.mjs --with-tsc
  git diff --stat

DECLARE se dist/ mudou e toda baseline que se moveu.

Não commite. Ao terminar, escreva o resumo na própria plan e mova o status para
🟠 Em revisão.
```

# 7. Critérios de aceite

- [ ] O script de contraste vive em `gates/`, **versionado e com teste próprio** — não em anexo de plan.
- [ ] **A lista de pares reais existe**, foi apresentada ao dono, e separa: componíveis × não determináveis.
- [ ] Os pares em `rgba()` são **compostos**, não pulados — e onde o fundo não é determinístico, está
      **declarado com o número** (R18).
- [ ] O limiar é **4,5:1**. Nenhum relaxamento.
- [ ] O gate **nasce vermelho**, com o número no baseline, e **nenhum tema foi tocado**.
- [ ] O corpus congelado usa **payload de consumidor**, e **não** os 18 shippados.
- [ ] Uma fixture do corpus **falha** se uma chave sair do domínio — demonstre removendo uma e restaurando.
- [ ] **R31 continua ⏳** — ela só vira ✅ na `24.1`.
- [ ] `npx vitest run` verde; baseline e espelhos regravados junto.

# 8. Como verificar

```bash
npm run audit                    # o gate novo, VERMELHO, com o número
npx vitest run
npm run gate-limits:check
node gates/scripts/release/check-audit-baseline.mjs --with-tsc
```

# 9. Destino da síntese

`specs/specs/00-regras-e-invariantes.md` (R31 — a fronteira de pares e o limiar; **o payload de tema como
contrato público**, peça 1) · `specs/specs/09-temas-e-presets.md` (o que o corpus congela e o que não) ·
`specs/specs/01-gates-e-baseline.md` (o gate novo e o baseline).

# 10. Resumo da execução

## Resumo da execução — 2026-08-10

**Resultado:** Concluído.

**O que foi feito**

- **PARADA OBRIGATÓRIA (Passo 2) apresentada e aprovada pelo revisor por medição independente** — lista de 26
  pares levantada cruzando `catalog/partitions` (categorias/`relatedTokens`), a `description` de cada token no
  schema (vários já declaram o par pretendido, ex. `card-title.ts:27`, `buttons.ts:145`) e o código real dos
  componentes (`SarakDataTableImpl.tsx:125`, `navigation.ts:290-295`). O revisor reproduziu (18/18, 115
  reprovados, 25 pulados) e mediu a lacuna de mais 10 pares.
- **`gates/scripts/audit/verify_contrast.ts` (criado)** — o solucionador de medição: `parseColor` (hex/rgb/rgba/
  transparent, `null` para o resto), `compositeOverOpaque` (a fórmula de alfa da §3.4), `resolveChain` (compõe
  uma cadeia de fundo do elo mais próximo ao mais distante, declara em vez de chutar quando o elo final ainda é
  translúcido), `contrastRatio` (WCAG padrão) e `PAIRS` com os **36 pares** finais (26 da parada + os 10 do
  Passo 3a: `titleColor`×`cardBackgroundColor`/`colorBgModal`, `textColorSecondary`/`textColorMuted` ×
  `colorBgLayer1`/`colorBgLayer2`/`sidebarColor`/`topbarColor`).
- **`gates/scripts/audit/auditor_contraste.mjs` (criado)** — wrapper fino (mesmo padrão de
  `auditor_presets.mjs`), invoca `verify_contrast.ts` via `npx tsx` (precisa importar `GLOBAL_THEMES`/
  `getDefaultDesignState` da fonte TS).
- **`LIMITES DECLARADOS` do `verify_contrast.ts` — item 5 acrescentado (Passo 3b)**: `statusErrorColor`/
  `statusSuccessColor` são cor de texto real (confirmado nas 4 referências que o correção citou), reprovam
  7/18 e 5/18, e **não entraram em `PAIRS`** porque o fundo real desses usos (`--sarak-status-*-color-bg`) nunca
  é emitido (`generateVariants` só existe em `primaryColor`/`secondaryColor`/`tertiaryColor`/
  `cardBackgroundColor`, `useDesignVariables.ts:118`) — o par mediria um defeito do componente, não do tema.
  Item 3 corrigido para apontar à §11 desta plan (o veredito), não mais a um "relatório da parada" em
  `plan-24-1` — a parada foi concluída aqui, na `plan-24`.
- **`gates/scripts/audit/__tests__/verify_contrast.test.ts` (criado, Passo 3c)** — 23 casos: mecânica de
  `parseColor` (7 formatos + 2 recusas), `compositeOverOpaque` (3 casos à mão), `contrastRatio` (preto/branco =
  21:1, cores iguais = 1:1, simetria), `resolveChain` (cadeia de 1 e 2 elos, declaração de base translúcida e de
  valor não-parseável) e o contrato de `PAIRS` (36 pares, todos com `min: 4.5`). **Não** trava o número de temas
  reprovados — isso é baseline, e muda a cada tema consertado na `24.1`.
- **`gates/scripts/audit/run_audit.mjs` — `auditor_contraste.mjs` registrado** na lista de auditores (12º).
- **`gates/scripts/release/check-audit-baseline.mjs` — parser `auditor_contraste.mjs`** extrai `reprovados` da
  saída ("N par(es)-tema reprovado(s) no total").
- **`gates/baselines/audit-baseline.json` regravado** (`npm run audit:baseline -- --write`) —
  `auditor_contraste.mjs.reprovados: 188`, batendo exatamente com o número que o revisor publicou como
  esperado (188 = 115 + 73 novos; 25 pulados, sem mudança).
- **`gates/README.md`** — linha do novo gate na tabela "Os auditores de `npm run audit`" + contagem
  "11 auditores" → "12 auditores" na tabela de comandos.
- **Corpus congelado de payload de consumidor (Passo 4, peça 2)** —
  `src/core/Provider/utils/__tests__/consumerThemeContract.test.ts` (criado): 3 fixtures pequenas e sintéticas
  no formato do consumidor (`cores-minimas`, `token-responsivo-mais-marca` com chave extra `systemName`/
  `logoUrl`, `botao-e-card`) — **nenhuma delas é um dos 18 temas shippados** (§3.5). Cada fixture passa por
  `validateDesign` (confere que nenhuma chave é descartada) e por `useDesignVariables` (confere que a CSS
  Variable de cada token do payload continua sendo emitida — via `variables` para token estático, via
  `responsiveCSS` para token responsivo como `sidebarWidth`), com o conjunto capturado em snapshot
  (`toMatchSnapshot()`, molde de `master-map.test.ts`).
- **Demonstração exigida (remover chave, ver falhar, restaurar)** — renomeei temporariamente o `id` de
  `primaryColor` em `src/core/Design/schema/colors.ts:27` para simular a chave saindo do domínio, rodei a
  suíte do corpus: a fixture `cores-minimas` **falhou** (`Fixture referencia token inexistente: "primaryColor"`
  — a segunda asserção, a de emissão de CSS Variable, é quem pegou; a primeira, de `validateDesign`, não pegou
  porque `primaryColor` também está listado em `PAYLOAD_EXTRA_KEYS` como rede de segurança legada e sobreviveu
  por esse caminho — registrado em "Decisões e suposições"). Restaurei o `id` original e confirmei 6/6 verde de
  novo.
- **`scripts/dev-kit/__tests__/devKit.test.mjs:100`** — `toHaveLength(11)` → `toHaveLength(12)` (o mesmo
  ajuste que a `plan-12` fez quando os auditores foram de 8 para 10 — contagem derivada do `run_audit.mjs`
  real, não escrita à mão).
- **Achado de regressão de `tsc` corrigido nesta própria execução**: `consumerThemeContract.test.ts` tinha 2
  parâmetros implicitamente `any` (`warnSpy.mock.calls.map((call) => ...)`); anotei `(call: unknown[])` e
  `(a: string)`, mesmo padrão de `shippedThemesConsoleClean.test.ts:30`. `tsc.teste` voltou de 2 para 0 antes de
  eu declarar a execução concluída (§3 do prompt do executor: gate de baseline verde sai verde).
- **Espelhos regenerados**: `npm run dev-kit` (`sarak-dev/`, 17 gates, `devKitHash` novo) e `npm run guide`
  (`sarak-ui/`, **422 tokens — contagem preservada**, `kitHash` idêntico ao anterior porque o kit do consumidor
  não enumera gates internos — nada mudou no conteúdo dele).

**Arquivos alterados**

| Arquivo | Natureza | O que mudou |
|---|---|---|
| `gates/scripts/audit/verify_contrast.ts` | criado | o solucionador de medição — `PAIRS` (36), composição de alfa, cálculo WCAG |
| `gates/scripts/audit/auditor_contraste.mjs` | criado | wrapper fino que invoca `verify_contrast.ts` via `npx tsx` |
| `gates/scripts/audit/__tests__/verify_contrast.test.ts` | criado | 23 casos — mecânica do gate, não o baseline |
| `gates/scripts/audit/run_audit.mjs` | alterado | `auditor_contraste.mjs` registrado (12º auditor) |
| `gates/scripts/release/check-audit-baseline.mjs` | alterado | parser de `auditor_contraste.mjs` |
| `gates/baselines/audit-baseline.json` | regravado | `auditor_contraste.mjs.reprovados: 188` |
| `gates/README.md` | alterado | linha do novo gate; contagem 11→12 |
| `src/core/Provider/utils/__tests__/consumerThemeContract.test.ts` | criado | corpus congelado — 3 fixtures de payload de consumidor |
| `src/core/Provider/utils/__tests__/__snapshots__/consumerThemeContract.test.ts.snap` | criado | snapshot gerado pelo corpus |
| `scripts/dev-kit/__tests__/devKit.test.mjs` | alterado | contagem de auditores 11→12 |
| `sarak-dev/GUIA-MANUTENCAO.md` · `START-HERE.md` · `state.json` | regenerado | espelho do gate novo + baseline (a versão 2.1.0→3.0.0 já estava pendente antes desta execução) |
| `sarak-ui/*` | regenerado, sem diff | `npm run guide` rodado; 422 tokens, `kitHash` idêntico — o kit não enumera gates internos |
| `src/core/Design/schema/colors.ts` | tocado e restaurado, sem diff | demonstração exigida da fixture falhando (Passo 4) — `git diff` confere vazio |

**Verificações executadas**

- `npm run audit` (ANTES, com os 26 pares): 18/18 temas, **115** reprovados, 25 pulados.
- `npm run audit` (DEPOIS, com os 36 pares): 18/18 temas, **188** reprovados, 25 pulados — bate exatamente com
  o número publicado pelo revisor. 3 auditores vermelhos no total (`ghostvars`=1 e `composicaoatomica`=2, dívida
  pré-existente já no baseline; `auditor_contraste`=188, novo).
- `npx vitest run` (íntegra, 2 rodadas — antes e depois do fix de `tsc`): **297 arquivos / 1107 testes, 100%
  verde** em ambas.
- `npm run gate-limits:check` → **28/28** scripts declaram o que não veem (26 pré-existentes + `verify_contrast.ts`
  + `auditor_contraste.mjs`).
- `npm run dev-kit:check` → **em dia** (3 arquivos, 0 ponteiros mortos).
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` → **"igual ao baseline de 2026-08-10 —
  nenhuma regressão."** (antes do fix de tipo, acusava `tsc.erros: 0→2`/`tsc.teste: 0→2`; corrigido e
  reconfirmado igual ao baseline).
- `git diff --stat` → 10 arquivos rastreados alterados (ver tabela) + os criados listados por `git status`;
  nada em `src/core/Design/presets/themes/` (nenhum tema tocado), nada em `specs/specs/`, `specs/adr/`,
  `specs/arquitetura/` nem `specs/00-indice.md` (a modificação pré-existente desse arquivo já estava no
  worktree antes desta execução começar, não fui eu quem a fez).

**Critérios de aceite**

- [x] O script de contraste vive em `gates/`, versionado e com teste próprio — `verify_contrast.ts` +
      `auditor_contraste.mjs` + `__tests__/verify_contrast.test.ts` (23 casos).
- [x] A lista de pares reais existe, foi apresentada ao dono, e separa componíveis × não determináveis — 36
      componíveis; 25 pares-tema pulados por tema (fundo não-determinístico); ~35 tokens de cor fora do escopo
      da R31 por não serem texto, declarados; `statusError/SuccessColor` fora por fundo não-emitido, declarado
      com 7/18 e 5/18.
- [x] Os pares em `rgba()` são compostos, não pulados — `compositeOverOpaque`/`resolveChain`; onde o fundo não
      é determinístico, declarado com o número (25 pares-tema, `LIMITES DECLARADOS` itens 1-2).
- [x] O limiar é 4,5:1. Nenhum relaxamento — os 36 pares têm `min: 4.5`, travado em teste
      (`verify_contrast.test.ts`, suite `PAIRS`).
- [x] O gate nasce vermelho, com o número no baseline, e nenhum tema foi tocado — 188, baseline gravado; `git
      diff` de `src/core/Design/presets/themes/` vazio.
- [x] O corpus congelado usa payload de consumidor, e não os 18 shippados — as 3 fixtures são sintéticas,
      pequenas, nenhuma reaproveita um `ThemePreset` embarcado.
- [x] Uma fixture do corpus falha se uma chave sair do domínio — demonstrado com `primaryColor` (evidência
      acima); restaurado e reconfirmado verde.
- [x] R31 continua ⏳ — não editei `specs/specs/00-regras-e-invariantes.md` (proibido, §7.3 do
      `00-prompt-executor`); a mudança de estado é da síntese do revisor.
- [x] `npx vitest run` verde; baseline e espelhos regravados junto — 297/1107 verde; `sarak-dev` e `sarak-ui`
      regenerados.

**Decisões e suposições**

- **Base de composição de alfa por par, não uma regra genérica única.** Para fundos translúcidos sem um
  container único óbvio (ex. `inputBg`, `colorBgModal`), usei `colorBgBody` como base — é o "fundo do tema" que
  a §2.5 resposta 3 cita no singular. Para fundos claramente aninhados num componente (ex.
  `cardActionBtnHoverBg`), usei o container declarado (`cardBackgroundColor`) e, como esse próprio token é
  translúcido por padrão (`rgba(15,23,42,0.6)`, medido), a cadeia completa a três elos termina em `colorBgBody`.
  Nenhum destes é "chute": todos vêm de `getDefaultDesignState()` medido ao vivo, não de suposição.
- **`primaryColor` sobrevive a `validateDesign` mesmo removido do schema, por estar duplicado em
  `PAYLOAD_EXTRA_KEYS`** (`payloadExtraKeys.ts:17`) — uma rede de segurança legada não relacionada a esta plan.
  Isso não invalidou a demonstração do corpus (a segunda asserção, de emissão de CSS Variable, pegou a
  regressão do mesmo jeito) mas é uma camada de proteção duplicada que vale registrar: se um token sair do
  catálogo E da lista de chaves extras ao mesmo tempo, só a checagem de CSS Variable do corpus pega.
- **Não investiguei nem tentei explicar por que `auditor_ghostvars`/`--sarak-status-*-color-bg` não pegam a
  ghost var** que o Passo 3b menciona — a correção foi explícita: isso é da plan de gates, não desta execução.

**Achados fora do escopo (não corrigidos, por instrução explícita)**

- `src/components/atomic/Feedback/SarakToast.tsx:84-85` — parêntese a mais em ambas as linhas
  (`var(--color-theme-card,#1e293b))`), CSS malformado descartado pelo parser, toast sem fundo/texto próprios.
  **Não toquei** — linha vermelha explícita do prompt de correção; o revisor registra em
  `specs/specs/15-divida-conhecida.md` com plan própria.
- `--sarak-status-*-color-bg` é ghost var (consumida, nunca emitida) e `auditor_ghostvars` não a pegou — **não
  investiguei nem corrigi**; mesma instrução, é da plan de gates.

**Pendências / riscos**

- Nenhuma pendência técnica conhecida. O gate está vermelho por desenho (188, o resultado esperado desta
  plan); consertar tema é escopo da `plan-24-1`.

## Resumo da execução (correção 1) — 2026-08-10

**Resultado:** Concluído. Escopo exclusivo: o item pendente do veredito §11.3.

**O que foi feito**

- **`gates/scripts/audit/verify_contrast.ts` — item 6 acrescentado aos `LIMITES DECLARADOS`.** Declara que este
  verificador mede o token **escrito** em `theme.design`, não o **emitido**: `useDesignVariables.ts:43` chama
  `syncThemeWithMode(rawDesign, targetMode)` **sem condição** antes de gerar as CSS Variables — inclusive a
  sobrescrita fixa dos 4 pares de `colorBgModal`, que mora dentro da própria `syncThemeWithMode`
  (`color-engine.ts:159,170`). Traz os três números do veredito (1299/1316 valores alterados · 188 falhas no
  valor cru · 108 no valor emitido · 178/648 veredictos divergentes), o exemplo real (`sarak-sovereign`:
  `btnPrimaryText` escrito `#000000` → emitido `#ffffff` sobre `btnPrimaryBg` `#00f2ff`, 15,14:1 escrito contra
  1,39:1 emitido) e nomeia a decisão **D** da `plan-24-1-fluxo-de-criacao-de-tema.md` (aceita pelo dono) como o
  que fecha a diferença — sem mudar nada neste gate.
- **Nada mais foi tocado.** `PAIRS` continua com 36 pares; `auditTheme` não mudou uma linha; o baseline
  (`gates/baselines/audit-baseline.json`) não foi regravado — `188` é o mesmo número de antes desta correção.
  Não consertei tema, o `))` do `SarakToast.tsx`, nem o ghost var de status — todos permanecem como o veredito
  os catalogou (§11.4), fora deste escopo.

**Arquivos alterados**

| Arquivo | Natureza | O que mudou |
|---|---|---|
| `gates/scripts/audit/verify_contrast.ts` | alterado | item 6 novo no bloco `LIMITES DECLARADOS` — só comentário, zero mudança de comportamento |

**Verificações executadas**

- `npm run audit` → **188 reprovados, 25 pulados, 18/18 temas** — idêntico a antes da correção; 3 auditores
  vermelhos no total (`ghostvars`=1, `composicaoatomica`=2, `contraste`=188 — os mesmos três de sempre).
- `npx vitest run` (íntegra) → **297 arquivos / 1107 testes, 100% verde**.
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` → **"igual ao baseline de 2026-08-10 —
  nenhuma regressão."**
- `git diff --stat` → só `verify_contrast.ts` tem a mudança desta correção (o arquivo é `??` no `git status`
  porque nunca foi commitado — `git diff --stat` contra HEAD não o lista; conferido por contagem de `{ fg:`
  em `PAIRS`, que segue em **36**, e por leitura direta do bloco de comentário).

**Critérios de aceite (desta correção)**

- [x] Item 6 declarado nos `LIMITES DECLARADOS`, com os três números e o exemplo do `btnPrimaryText`.
- [x] `PAIRS` intocado — 36 pares, confirmado por contagem.
- [x] `auditTheme` intocado.
- [x] Baseline **não** regravado — `188` idêntico ao anterior.
- [x] Nenhum tema, `SarakToast.tsx` ou ghost var de status tocados.
- [x] `npx vitest run` verde; `check-audit-baseline --with-tsc` sem regressão.

**Pendências / riscos**

- Nenhuma. A decisão D (fechamento real cru=emitido no modo nativo) é escopo da `plan-24-1`, não desta
  correção.

# 11. Veredito

**🟢 APROVADA** — *revisor, 2026-08-10.* A correção da §11.3 foi entregue e verificada: item 6 dos LIMITES
DECLARADOS traz os três números, o exemplo do `btnPrimaryText` e o ponteiro para D. Reconferido depois dela —
`PAIRS` **36**, `auditTheme` intocado (segue lendo o cru, como deve), gate **188/25/18-de-18** idêntico,
baseline **188** inalterado, e os 29 testes de `verify_contrast` + corpus verdes. Mudança **só de comentário**,
como declarado.

*O veredito original, que gerou a correção, fica abaixo como registro.*

## 11.1 O que eu verifiquei por medição própria

Reproduzi tudo; nada do que o executor relatou foi inflado.

| Verificado | Resultado |
|---|---|
| `npx tsx gates/scripts/audit/verify_contrast.ts` | **188 reprovados · 25 pulados · 18/18** — bate |
| `PAIRS` | **36 pares**, todos com `min: 4.5`, nenhum relaxamento |
| `npx vitest run` (INTEIRA) | **297/297 arquivos · 1107/1107 testes**, exit 0 |
| Temas tocados | **nenhum**; `dist/` parado |
| Achados que mandei não consertar | **intocados** — o `))` do `SarakToast` segue lá |
| Ligação | `run_audit.mjs`, `check-audit-baseline.mjs` e `audit-baseline.json` corretos |
| Teste do gate | **23 casos**, mecânica pura, inclui `PAIRS.length === 36` |
| Corpus | **payload sintético de consumidor**, nunca os 18 shippados |

Também reenumerei o universo por conta própria — **85 tokens `type: 'color'`** de 429 — e confirmei os
LIMITES DECLARADOS: item 5 traz `statusErrorColor`/`statusSuccessColor` com os números **7/18 e 5/18** e o
motivo certo; item 3 reaponta para esta §11.

## 11.2 O achado que impede o fechamento limpo

**O gate mede o token escrito; o sistema emite o token transformado.**

`auditTheme` avalia `{ ...getDefaultDesignState(), ...theme.design }` — valores crus. Mas
`useDesignVariables.ts:43` chama `syncThemeWithMode(rawDesign, targetMode)` **sem condição alguma** antes de
emitir. Não há "se o modo mudou".

Medido sobre os 18 temas, **cada um no seu próprio modo nativo**:

| | |
|---|---:|
| Valores de cor alterados por `syncThemeWithMode` | **1299 / 1316** |
| Falhas medindo **cru** (o gate hoje) | 188 |
| Falhas medindo **emitido** | **108** |
| **Veredictos que divergem** | **178 / 648** |

O caso que fecha o argumento, em `sarak-sovereign`:

```
btnPrimaryText  escrito #000000  → emitido #ffffff
btnPrimaryBg    escrito #00f2ff  → emitido #00f2ff
```

Preto sobre ciano é **15,14:1** e o gate diz *passa*; branco sobre ciano é **1,39:1** e é o que a pessoa vê.
O gate **erra nos dois sentidos** e deixa passar falha real. A prova já estava no corpus que o próprio
executor criou — o snapshot registra `btnPrimaryText: '#001018'` saindo como `#fdfeffff`. O dado foi
capturado; o significado passou batido.

> **Correção minha, para o registro:** eu relatei o `tooltipTextColor` idêntico ao `tooltipBg` como "texto
> invisível". Os tokens crus são idênticos, isso é fato — mas a emissão dá `#fbfcfe` sobre `#0c1222`,
> **18,18:1**. Eu medi o token e concluí sobre a tela.

## 11.3 A correção pendente — declarar, não remedir

**O gate NÃO muda de medição.** O dono aceitou a decisão **D** (`plan-24-1`): `syncThemeWithMode` passa a agir
só quando o modo pedido **difere** do nativo. Depois de D, no modo nativo **cru = emitido**, e este gate fica
correto como está — inclusive os 4 pares em `colorBgModal`, cuja sobrescrita fixa
(`color-engine.ts:159,170`) mora dentro da própria `syncThemeWithMode`.

Falta só **um item novo nos LIMITES DECLARADOS** dizendo que hoje o emitido difere, com os três números
(**188 / 108 / 178**) e o exemplo do `btnPrimaryText`, e que D é o que fecha a diferença.

## 11.4 Achados a catalogar (meus, não do executor)

1. `SarakToast.tsx:84-85` — parêntese a mais nas duas linhas; CSS malformado é descartado.
2. `--sarak-status-*-color-bg` é ghost var e `auditor_ghostvars` não pegou.
3. A suíte emite **19× `Could not parse CSS stylesheet`** — **causa não atribuída**, pode ser (1) ou o jsdom
   engasgando com o `responsiveCSS`. Anotado para medir antes de virar achado.
