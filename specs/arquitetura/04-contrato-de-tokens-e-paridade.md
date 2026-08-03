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

> ⚠️ **Se você somar a distribuição acima, chega a 416 — não a 409.** Os dois números estão certos: a lista conta **entradas** e a tabela conta **ids únicos**. Sete ids aparecem **duas vezes** no roteamento, e é isso que produz a diferença de 7. A apuração completa está em §2.2 — **não "corrija" nenhum dos dois números antes de ler aquela seção.**

## 2.2 ⚠️ A divergência 409 × 416 — APURADA

A saída do auditor de paridade imprime `409/409/409` nos três totais e, na linha final de sucesso, **`416 tokens validados`**. Os dois números estão certos e medem coisas diferentes:

- **409** = ids **únicos**, contados por `Set` — é o tamanho real do contrato.
- **416** = contagem **bruta** de entradas em `schema.tokens[]` somando os 28 arquivos, incrementada sem deduplicar (`totalTokensChecked`, em `verify_parity.ts:60-63`, impresso na `:96`).

A diferença de 7 é real: **sete `id` estão declarados em DOIS schemas diferentes**, e como `MASTER_DESIGN_MAP` não deduplica, `getAllDesignTokens()` devolve 416 itens para 409 ids distintos.

| `id` duplicado | Declarado em | E também em |
| --- | --- | --- |
| `bgBaseColor` | `atmosphere.ts:84` | `system.ts:12` |
| `cardBackgroundColor` | `cards.ts:87` | `colors.ts:153` |
| `cardBorderColor` | `cards.ts:131` | `colors.ts:162` |
| `colorBgBody` | `atmosphere.ts:56` | `colors.ts:116` |
| `colorBgLayer1` | `atmosphere.ts:65` | `colors.ts:125` |
| `colorBgLayer2` | `atmosphere.ts:74` | `colors.ts:134` |
| `zIndexModal` | `engineering.ts:32` | `layers.ts:34` |

**Isto não produz falso-negativo na paridade** — toda validação é por presença em `Set`, então a duplicata não engana o gate. Mas tem uma consequência de comportamento que importa: em `getDefaultDesignState()` (`master-map.ts:90-96`), o estado é um objeto indexado por `id`, então a **última** declaração sobrescreve a primeira. Duas definições do mesmo token com metadados diferentes (faixa, enum, default) resolvem por ordem de declaração no array, não por intenção.

### A duplicação PROPAGA para o roteamento de persistência

O achado não para no schema. `src/core/Design/catalog/theme_table_mapping.json` — a fonte que decide **em qual coluna cada token é persistido** — tem exatamente o mesmo desvio: **416 entradas brutas para 409 ids únicos**, e são **os mesmos sete ids** da tabela acima.

A forma da duplicação, porém, **não é uniforme** — e a distinção importa para quem for consertar:

| `id` | Onde aparece no roteamento | Forma |
| --- | --- | --- |
| `bgBaseColor` | `branding_config` + `colors_and_atmosphere` | Duas colunas **diferentes** |
| `cardBackgroundColor` | `colors_and_atmosphere` + `cards_engine` | Duas colunas **diferentes** |
| `cardBorderColor` | `colors_and_atmosphere` + `cards_engine` | Duas colunas **diferentes** |
| `zIndexModal` | `layout_and_navigation` + `specialized_engines` | Duas colunas **diferentes** |
| `colorBgBody` | `colors_and_atmosphere` **×2** | Entrada **repetida na MESMA coluna** |
| `colorBgLayer1` | `colors_and_atmosphere` **×2** | Entrada **repetida na MESMA coluna** |
| `colorBgLayer2` | `colors_and_atmosphere` **×2** | Entrada **repetida na MESMA coluna** |

São dois defeitos de natureza distinta sob o mesmo sintoma:

- **Quatro ids em duas colunas diferentes** é ambiguidade de **roteamento**: o mesmo token tem dois destinos de persistência declarados. Qual vence depende da ordem em que o consumidor do mapa itera.
- **Três ids repetidos dentro da mesma coluna** é redundância **literal** — a mesma string duas vezes no mesmo array. Não é ambíguo, é só entrada duplicada; inofensivo hoje porque todo consumo é por presença, e é o caso mais barato de limpar.

Isto **reforça** o achado do schema, não o substitui: a mesma higiene faltante aparece nas duas fontes independentes do dicionário, o que sugere que uma foi derivada da outra sem deduplicar em nenhum dos dois lados.

Registrado em DIVERGÊNCIAS. **Não corrigido aqui** — no schema, mexer muda qual definição vence; no roteamento, muda em qual coluna o valor passa a ser gravado. As duas coisas exigem decisão, não faxina.

# 3. As duas alavancas

Todo token é consumido por uma de duas vias. **O payload de entrada não distingue** — a distinção nasce só no consumo.

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
| `getAllDesignTokens()` `:74` | Todos os tokens, **brutos** (416 itens — ver §2.2) |
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

# 10. O baseline do `run_audit`, desta execução

**`run_audit.mjs` NÃO está em zero.** Duas regras vermelhas, ambas dívida conhecida e documentada:

| Auditor | Resultado |
| --- | --- |
| `auditor_hardcoded` | ❌ **1 violação de Valor** — `src/components/atomic/Atoms/SarakTypography.tsx:39`, `var(--sarak-h1-ls, -1px)`. Estrutural líquido = **0** (516 brutos, menos 188 ícones, 87 dimensão fluida e 241 alinhamento) |
| `auditor_ghostvars` | ❌ **3 consumos** que não resolvem: `--token`, `--sarak-button-radius`, `--sarak-shell-brand-logo-size` |
| `auditor_typescript` | ✅ nenhum `any` |
| `auditor_coverage` | ✅ todos os componentes com teste |
| `auditor_arquitetura` | ✅ nenhuma quebra de camada |
| `auditor_cleancode` | ✅ nenhuma violação |
| `auditor_paridade` | ✅ 409/409/409 |
| `auditor_presets` | ✅ 120 itens, zero chave órfã |

> **Compare com este baseline; NUNCA espere zero.** Acusar regressão porque o auditor saiu com código 1 é o erro que este registro existe para evitar. A dívida detalhada, com o que seria preciso para fechar cada item, é assunto da spec de gates e baseline.
