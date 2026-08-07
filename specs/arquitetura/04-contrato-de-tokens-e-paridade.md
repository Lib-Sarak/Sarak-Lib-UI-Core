---
tipo: "arquitetura"
titulo: "Contrato de tokens e paridade"
dominio: "Arquitetura / Design Engine / Contrato de dados"
status: "🟢 Vigente"
tags: ["arquitetura", "tokens", "paridade", "validacao", "design-engine", "gates"]
relacionados: ["[[00-mapa-do-modulo]]", "[[01-forma-do-produto-e-modos-de-consumo]]", "[[02-design-engine]]", "[[03-superficie-publica]]"]
---

# 1. Propósito

O **dicionário** do Design System e o que **"paridade" significa hoje**. É o documento que define quando um token *existe*, o que é um valor *legítimo*, e quais gates cobram isso.

É pré-requisito de [[02-design-engine]]: aquele documento descreve como um `design` vira tela e **aponta para cá** para tudo que é dicionário e contrato.

# 2. O dicionário em três fontes

Uma chave de token atravessa três lugares, e **só é REAL se existir nos três**:

```
src/core/Design/schema/*.ts          28 arquivos de schema
        ↓
MASTER_DESIGN_MAP                    src/core/Design/master-map.ts (version 13.0.0)
        ↓
catalog/theme_table_mapping.json     13 colunas → roteia cada token
        ↓
catalog/partitions/*.json            13 partições, uma por coluna
```

`MASTER_DESIGN_MAP.components` (`master-map.ts:39-68`) é um **array literal**, montado por import estático de cada `*Schema` — um por arquivo de `schema/`. Não há função de agregação, e não há deduplicação (§2.2).

**Fora dessas três fontes, a chave é inexistente.** Não é "não suportada" nem "experimental": ela é descartada em runtime, com aviso (§4).

## 2.1 Os números reais, desta execução

| Fonte | Tokens |
| --- | --- |
| Schema (`MASTER_DESIGN_MAP`) | **409** |
| Banco (`theme_table_mapping`) | **409** |
| Catálogo (`partitions/`, 13 arquivos) | **409** |

Distribuição por coluna: `cards_engine` 95 · `components_base` 70 · `colors_and_atmosphere` 61 · `layout_and_navigation` 40 · `data_and_charts` 40 · `typography` 33 · `branding_config` 30 · `motion_and_animation` 17 · `specialized_engines` 16 · `structural` 11 · e três colunas de valor único (`mode`, `navigation_style`, `body_size`).

> ⚠️ **HISTÓRICO — não vale mais desde 2026-08-03 (`plan-07`).** Os sete ids duplicados foram **fundidos**, e
> hoje a soma fecha em **410 = 410**: entradas brutas e ids únicos coincidem. O aviso abaixo descreve o estado
> **anterior** e fica porque a §2.2 explica o defeito que ele sinalizava.
>
> ⚠️ *(até 2026-08-03)* **Se você somar a distribuição acima, chega a 416 — não a 409.** Os dois números estão certos: a lista conta **entradas** e a tabela conta **ids únicos**. Sete ids aparecem **duas vezes** no roteamento, e é isso que produz a diferença de 7. A apuração completa está em §2.2 — **não "corrija" nenhum dos dois números antes de ler aquela seção.**

## 2.2 ✅ A divergência 409 × 416 — FECHADA em 2026-08-03

> **Estado atual: não há divergência.** O auditor imprime `410/410/410` nos três totais **e** `410 tokens
> validados` na linha final. Os sete `id` que existiam em dois schemas ao mesmo tempo foram desduplicados pela
> `plan-07`. Esta seção fica porque **a classificação anterior estava errada num ponto que custa caro**, e o
> erro é mais instrutivo que o defeito.

### O que era

O auditor imprimia `409/409/409` e, na linha de sucesso, **`416 tokens validados`**. Os dois números estavam
certos e mediam coisas diferentes: **409** = ids únicos (`Set`), **416** = entradas brutas em `schema.tokens[]`
somando os 28 arquivos, sem deduplicar (`totalTokensChecked`). A diferença de 7 eram **sete ids declarados em
DOIS schemas**, e a mesma duplicação propagava para o `theme_table_mapping.json`.

| `id` | Declarado em | E também em | O que a segunda declaração acrescentava |
| --- | --- | --- | --- |
| `bgBaseColor` | `system.ts` | `atmosphere.ts` | nada — subconjunto |
| `cardBackgroundColor` | `cards.ts` | `colors.ts` | ⚠️ **`generateVariants: true`** vivia só em `cards.ts` |
| `cardBorderColor` | `cards.ts` | `colors.ts` | nada — subconjunto |
| `colorBgBody` | `colors.ts` | `atmosphere.ts` | ⚠️ **3 aliases** só em `colors.ts` |
| `colorBgLayer1` | `colors.ts` | `atmosphere.ts` | nada — subconjunto |
| `colorBgLayer2` | `colors.ts` | `atmosphere.ts` | nada — subconjunto |
| `zIndexModal` | `engineering.ts` | `layers.ts` | nada — subconjunto |

### 🔴 A classificação anterior estava ERRADA, e o erro tinha consequência

Esta seção afirmava que a consequência era **"a última declaração sobrescreve a primeira"** em
`getDefaultDesignState()`, e que as três entradas repetidas na mesma coluna do roteamento eram
*"redundância literal … inofensivo hoje"*.

**As duas afirmações estavam incompletas, e a segunda é falsa.** Medido ao executar a desduplicação:

**`getAllDesignTokens()` (`master-map.ts:75`) é um `flatMap` — ele NÃO deduplica.** Logo, as duas declarações
eram **ambas processadas pelo injetor**, e os `cssVars` das duas iam para o DOM. O "sobrescreve" valia só para
o `defaultValue`; para as **variáveis emitidas**, o efeito era de **união**.

Remover a declaração "perdedora" — o que parecia faxina — apagou **51 variáveis CSS**: todas as variantes
cromáticas de `cardBackgroundColor` (`-rgb`, `-bg`, `-border`, `-10`…`-50`, `-hover`, `-active`, `-light`) e o
alias `--theme-body`. Duas causas distintas:

- **`generateVariants: true`** existia **só** na declaração de `cards.ts`. É essa flag que dispara as variantes;
- **`colorBgBody`** tinha em `colors.ts` três aliases que `atmosphere.ts` não tem — `--theme-body`,
  `--bg-body`, `--sarak-bg-base`.

> **A duplicata não era redundância: era uma UNIÃO de aliases e flags.** Desduplicar é **fundir**, não escolher
> um lado. Quem tratar um `id` duplicado como "apague o repetido" quebra a superfície emitida em silêncio — o
> `defaultValue` continua certo, o console fica limpo, e a cor some da tela.

**Como foi fechado:** o vencedor de cada par herdou o que era exclusivo do outro (a flag em `colors.ts`, os 3
aliases em `atmosphere.ts`), e a rede de caracterização em `src/core/Design/__tests__/master-map.test.ts`
passou a cobrir **as duas** superfícies — o `defaultValue` (snapshot) **e** o conjunto de aliases emitidos.
A primeira versão daquele teste cobria só a primeira, e foi a suíte de snapshots do Design Engine que pegou a
perda. Está registrado ali, no próprio teste.

### O roteamento de persistência — mesma origem, mesma correção

`theme_table_mapping.json` tinha o mesmo desvio: **416 entradas brutas para 409 ids únicos**, nos mesmos sete
ids, em duas formas:

| Forma | Ids | O que era |
| --- | --- | --- |
| Duas colunas **diferentes** | `bgBaseColor` · `cardBackgroundColor` · `cardBorderColor` · `zIndexModal` | ambiguidade de **roteamento**: dois destinos de persistência declarados |
| Repetido na **mesma** coluna | `colorBgBody` · `colorBgLayer1` · `colorBgLayer2` | entrada duplicada literal |

Fechado pela mesma execução, mantendo em cada caso a **última** coluna — que é a que prevalecia. Hoje:
**410 brutas para 410 únicos**.

> **A lição que sobrevive a esta seção:** a mesma higiene faltava nas **duas** fontes independentes do
> dicionário, o que indica que uma foi derivada da outra sem deduplicar em nenhum dos lados. Um gate que
> compare **bruto × único** — em vez de só `Set` contra `Set` — teria pego isso anos antes. Ele não existe; está
> na fila da `plan-12`.

## 3.1 Alavanca de VALOR — vira CSS Variable

O token vira `var(--sarak-<kebab-id>, fallback)` no DOM. A conversão é feita por `toKebabCase` (`useDesignVariables.ts:11-12`), e o nome emitido é `--sarak-${kebabId}` (`:64-65`).

## 3.2 Alavanca ESTRUTURAL — lida em JS pelo Hook Controlador

Alguns tokens não podem virar CSS Variable, porque mudam **qual classe** o componente usa, não o valor de uma propriedade. Eles são marcados com `structuralConsumer` no schema (`types.ts:55`) e com `consumerHook` na partição correspondente — e são lidos em JS pelo hook, que devolve `{ className, style }`.

**A lista estrutural é FECHADA: 17 tokens hoje.** A fonte é `getStructuralTokens()` (`master-map.ts:83-85`) — **não transcreva a tabela aqui**; consulte a função. Os consumidores declarados são os quatro Hooks Controladores de categoria e sete métodos de `useStructuralStyles` ([[00-mapa-do-modulo]] §5).

**A regra de paridade da marca:** todo token com `structuralConsumer` no schema tem o `consumerHook` espelhado na partição. Marcar num lado e esquecer o outro é drift.

# 4. O contrato de VALOR — `validateDesign`

`src/core/Provider/utils/validation.ts:184` é **a fronteira**. Ela substituiu a validação que vivia no servidor removido ([[003-remocao-backend-proprio]]), e é o que torna `localStorage` e um JSON de tema escrito à mão **seguros por construção**.

## 4.1 Domínio de chaves FECHADO

Três origens, e nada além delas:

1. Tokens do catálogo (índice de `getAllDesignTokens()`).
2. `PAYLOAD_EXTRA_KEYS` (`payloadExtraKeys.ts`) — **69 campos** de branding e runtime que pertencem ao payload mas não têm `token.type`.
3. As chaves de `DESIGN_MANIFEST` (`manifest.ts`) — **171** adicionais.

## 4.2 Valor tipado pelo próprio token

`coerceTokenValue` (`:101-132`) despacha por `token.type`:

| `token.type` | Regra |
| --- | --- |
| `number`, `slider` | Número finito, **clampado** nos limites do token (`min`/`max`, ou `constraints.min`/`max`) |
| `boolean` | Exige `typeof === 'boolean'` |
| `select` | String segura **e** dentro do enum, se o token declarar `constraints.options`; sem enum declarado, aceita qualquer string segura |
| `color` | `COLOR_PATTERN` (§4.3) |
| `string`, `text`, `font`, `image`, `file` | String segura (§4.4) |

**Valor responsivo** (`token.isResponsive`): a forma `{ desk, tab, mob }` é validada **eixo a eixo**, cada um como número finito e clampado (`validateResponsiveValue`, `:88-97`). Se **qualquer** eixo falhar, o objeto inteiro é rejeitado — não há aplicação parcial.

## 4.3 `COLOR_PATTERN` — e o que ele barra de propósito

```
/^(#[0-9a-fA-F]{3,8}|rgba?\([0-9.,%\s]+\)|hsla?\([0-9.,%\sa-z]+\)|var\(--[a-zA-Z0-9-]+(\s*,\s*[^;<>{}]*)?\)|transparent|currentColor|inherit|none)$/
```

Aceita hex de 3 a 8 dígitos, `rgb()`/`rgba()`, `hsl()`/`hsla()`, `var(--x, fallback)` e as palavras-chave `transparent`, `currentColor`, `inherit`, `none`.

**Rejeita `url()`** — e isso é deliberado, não um efeito colateral do regex. `url()` num valor de cor é vetor clássico de requisição não intencional a partir de CSS.

## 4.4 Bloqueio de breakout CSS

```ts
const CSS_BREAKOUT_PATTERN = /[<>{};]/;
```

Quatro caracteres, e cada um fecha uma porta: `;` e `}` escapariam da declaração CSS atual; `<` e `>` escapariam de uma tag `<style>`. É o que impede um valor de tema de virar marcação.

## 4.5 O comportamento: descartar com aviso, nunca lançar

Três casos, três avisos distintos, e o mesmo desfecho — **a chave é omitida do estado final**:

- Token conhecido, valor reprovado → `[Sarak:Design] Token "X" com valor fora do contrato — descartado.` (`:196-198`)
- Chave extra permitida, valor inseguro → `[Sarak:Design] Campo "X" com valor inseguro — descartado.` (`:205-208`)
- Chave desconhecida → `[Sarak:Design] Chave "X" desconhecida no schema de tema — descartada.` (`:213`)

**Nunca lança exceção.** Um tema corrompido no `localStorage` degrada para o default e avisa; não derruba a aplicação. É a postura de resiliência leniente aplicada ao dado de tema.

`isSafeExtraValue` (`:76-84`) cuida das chaves extras com uma checagem **recursiva** — string segura, número finito, boolean, array item a item, objeto valor a valor. Sem tipo e sem enum, porque esses campos não têm `token.type`; mas com a mesma barreira anti-breakout.

## 4.6 `auditTokenContract` — a mesma checagem, sem efeito colateral

`:170-182` é a versão **pura**: usa **a mesma `coerceTokenValue`**, mas em vez de emitir `console.warn` empilha um registro de drift (`{ token, fonte, valor, motivo }`) e devolve a lista.

**É por isso que auditoria e runtime nunca divergem.** Se fossem duas implementações, a auditoria passaria a mentir no dia em que uma delas mudasse. A diferença de escopo é honesta e está no código: `auditTokenContract` audita **só** chaves que existem no catálogo (`:176` ignora as demais), enquanto `validateDesign` também trata chaves extras e desconhecidas.

Uma lição registrada com número: foi este auditor que achou **117 violações em 21 tokens** nos temas e presets embarcados — quando o console mostrava uma amostra de 9. **Amostra de console não é auditoria.**

# 5. As fontes vivas — e o mandamento de nunca copiá-las

Todas em `src/core/Design/master-map.ts`:

| Função | Devolve |
| --- | --- |
| `getAllDesignTokens()` `:74` | Todos os tokens, **brutos** — **409** itens hoje, e **409 ids únicos**: o bruto e o único coincidem desde que a `plan-07` fundiu os 7 ids duplicados (§2.2). ⚠️ **"Bruto" continua sendo a palavra certa**: a função é um `flatMap` e **não deduplica** — basta um id declarado em dois schemas para os dois números divergirem de novo, que é exatamente o defeito que §2.2 registra |
| `getStructuralTokens()` `:83` | Só os estruturais (17) |
| `getDefaultDesignState()` `:90` | `{ tokenId: defaultValue }` — indexado por id, portanto já deduplicado |
| `getDomainMap()` `:105` | `{ bySchema, byColumn }` — duas granularidades de domínio |
| `getScaffold(domain?)` `:126` | O **gabarito vivo**: sem argumento, o tema completo (409 chaves); com domínio, a fatia daquele componente |
| `upgradeThemePayload()` `:148` | Preenche chaves ausentes a partir de `token.legacyValue` |

**`getScaffold()` é a peça que unifica preset e tema:** um **preset** é a fatia de um domínio, um **tema** é tudo. A mesma primitiva, amplitudes diferentes.

> **Nunca transcreva nenhuma dessas saídas para markdown.** Lista de token em prosa vira mentira na primeira mudança de schema. Aponte para a função ou para o catálogo gerado.

> ⚠️ Nota de código: `upgradeThemePayload` declara um parâmetro `partialMode` que **não é usado no corpo**. Parâmetro morto — registrado, não corrigido.

# 6. O namespace de CSS Variables

**`--sarak-*` e `--theme-*`, SEMPRE com fallback.** `--sx-*` é **proibido** — nunca foi emitido por nenhuma fonte, logo é variável-fantasma por definição.

`auditor_ghostvars.mjs` cobra a regra cruzando toda `var(--x)` consumida em `src/components` e `src/features` contra um **registro de variáveis realmente emitidas**, construído de três fontes:

1. Todo `id:` nos schemas → `--sarak-<kebab-id>` automaticamente.
2. Todo array `cssVars: [...]` declarado nos schemas.
3. Toda declaração `--x:` em `src/styles/*.css`.

Cada base é então expandida com **18 sufixos gerados** — 8 nomeados (`-rgb`, `-bg`, `-border`, `-text`, `-hover`, `-active`, `-light`, `-glow`) mais 10 numéricos (`-10` a `-100`, de dez em dez). **Registro atual: 14.179 variáveis.** A allowlist está **vazia** hoje.

> **Duas limitações honestas do auditor:** ele verifica se o **nome** existe no registro, e **não** verifica se o consumo tem fallback — a regra do fallback é conduta, não gate. E ele varre só `src/components` e `src/features`; CSS em `src/styles/` é fonte, não consumidor, e não é cruzado ([[00-mapa-do-modulo]] §6.1 registra duas ocorrências vivas de `--sx-*` justamente ali).

# 7. Tokens semânticos de espaçamento

`src/core/Design/resolveToken.ts` traduz cinco nomes semânticos para CSS real:

| Token | Resolve para |
| --- | --- |
| `spacing-xs` | `calc(var(--sarak-layout-gap-sm, 8px) * 0.5)` |
| `spacing-sm` | `var(--sarak-layout-gap-sm, 8px)` |
| `spacing-md` | `var(--sarak-layout-gap-md, 16px)` |
| `spacing-lg` | `var(--sarak-layout-gap-lg, 24px)` |
| `spacing-xl` | `calc(var(--sarak-layout-gap-lg, 24px) * 1.5)` |

A ordem de resolução (`:112-124`):

1. **Token semântico conhecido** → traduz.
2. **CSS já válido** → passthrough. Vale `0` literal, funções de comprimento (`var`, `calc`, `clamp`, `min`, `max`) e literal com unidade (`px`, `rem`, `em`, `%`, `vh`, `vw`, `ch`, `vmin`, `vmax`).
3. **Qualquer outra coisa** → `console.warn` **com sugestão por distância de edição** (Levenshtein, `:57-75`) e degradação para o fallback.

O warn tem **cache** (`:78`, chave `atom.prop:valor`) para não repetir sob re-render. Ausência de valor e string vazia devolvem o fallback **sem avisar** — ausência é legítima.

Isto existe porque havia um bug silencioso: `gap: "spacing-md"` ia **cru** para o CSS, o browser descartava a declaração, e ninguém sabia. Hoje vira `var(--sarak-layout-gap-md, 16px)` de verdade, ou avisa.

# 8. O que "PARIDADE" significa hoje

Seja preciso aqui, porque o termo mudou de significado e ainda há skill do mantenedor cobrando a versão antiga.

## 8.1 Verificado por script — as 3 fontes do dicionário

`verify_parity.ts` (invocado por `auditor_paridade.mjs`) cruza **exatamente três** conjuntos: Schema ↔ `theme_table_mapping` ↔ partições do catálogo. Ele valida nos dois sentidos (Schema→DB, Schema→Catálogo, e as duas inversas) e sai com 1 se qualquer token faltar em qualquer fonte.

> Nota de localização: `verify_parity.ts` mora em `.agents/skills/ui-novo-componente/scripts/`, e `verify_presets.ts` em `gates/scripts/audit/`. Os dois auditores que os invocam vivem em `ui-auditoria-modulo`.

## 8.2 Verificado por outros gates — as camadas de ALCANCE

Paridade do dicionário garante que o token **existe**. Não garante que o consumidor **alcança** o componente. Isso é cobrado por outros dois gates, descritos em [[03-superficie-publica]]:

- **`barrel:check`** — o componente e seu `<Nome>Props` estão no barril público.
- **`catalog:check`** — o catálogo gerado bate com o código.

## 8.3 ⚠️ A "6ª camada" MORREU

**A antiga "6ª camada de paridade" era o Registry do motor de manifesto, e ela não existe mais** ([[002-remocao-motor-manifesto]]).

Isto precisa estar explícito porque **a skill `ui-novo-componente` ainda exige registrar componente novo nesse Registry e rodar um gate que foi removido**. Seguir aquela instrução hoje é impossível.

A paridade de **alcance** foi redefinida: onde antes era "está no `NATIVE_COMPONENTS`", hoje é **"está no barril e no catálogo gerado"** (§8.2).

# 9. Anti-drift de tema e preset

`auditor_presets.mjs` → `verify_presets.ts` compara as chaves de **todo** tema e preset embarcado contra o `getScaffold()` **vivo**, e reprova **chave órfã** — uma chave que existe no arquivo do tema mas não existe mais no dicionário.

Execução atual: **120 itens auditados (18 temas + 102 presets de componente)** contra o gabarito de **409 chaves**. **Nenhuma chave órfã.**

É o gate que impede o drift silencioso de acontecer na direção contrária: alguém remove um token do schema e os 18 temas embarcados continuam carregando a chave morta.

# 10. O baseline do `run_audit` — ele NÃO mora aqui

**A régua é [`specs/01-gates-e-baseline.md`](../specs/01-gates-e-baseline.md) §3**, e o número que o gate lê é
[`gates/baselines/audit-baseline.json`](../../gates/baselines/audit-baseline.json). **Compare com aqueles dois;
nunca com zero, e nunca com uma cópia.**

> 🔴 **Esta seção trazia uma TABELA de baseline, e ela foi removida em 2026-08-07.** Não por estar
> desatualizada — por **não poder morar aqui**. Um baseline é fonte viva: ele muda a cada plan que conserta ou
> constrói gate. Transcrevê-lo para markdown é exatamente o que **R17** proíbe, e o dano se materializou:
> a tabela dizia *"duas regras vermelhas · `auditor_hardcoded` 1 · `auditor_ghostvars` 3"* enquanto a medição
> real era **quatro vermelhas · 35 · 27**, mais três auditores que ela nem listava. Pior que o número: ela
> instruía — *"compare com este baseline"* — e teria feito o leitor concluir **regressão de +34 e +24** onde
> houve **ampliação de escopo de gate**.
>
> **Os três nomes que ela citava são o caso didático desta base:** `--token` era comentário JSDoc,
> `--sarak-button-radius` **nunca foi fantasma** (é emitida por `manifest.ts:198`) e
> `--sarak-shell-brand-logo-size` foi **criado** pela `plan-07`. Quem lesse a tabela hoje reabriria três casos
> fechados. O registro de por que cada um caiu está em [[01-gates-e-baseline]] §4.2 e §9.3.
>
> **Destino demonstrado** ([[00-contexto]] §5): o conteúdo vive em [[01-gates-e-baseline]] §3, mais completo do
> que era aqui — os **11** auditores, cada um com o número medido e o motivo de ele ser esse.
