---
tipo: "plan"
titulo: "Contraparte de modo — o par claro/escuro passa a ser autorado, não derivado"
dominio: "Sarak-Lib-UI-Core / Design / Temas"
status: "🟢 Aprovada"
prioridade: "Alta"
tags: ["plan", "temas", "modo", "acessibilidade", "diversidade"]
relacionados: ["[[plan-24-1-fluxo-de-criacao-de-tema]]", "[[plan-25-teste-pratico-do-fluxo-de-tema]]", "[[09-temas-e-presets]]", "[[00-regras-e-invariantes]]"]
depende_de: "plan-25"
objetivo: "Fazer a preferencia de modo do usuario sobreviver a troca de tema, com valores autorados em vez de derivados por faixa"
destino_sintese: "specs/specs/09-temas-e-presets.md · specs/specs/00-regras-e-invariantes.md"
---

> 🎯 **Conserta uma regressão de produto medida no consumidor real.** Depois da decisão D, escolher um tema
> passou a **trocar o modo do usuário**. Esta plan devolve a precedência ao usuário — e usa cor **escolhida**,
> não cor derivada por faixa.

# 1. Objetivo

Um tema declara a **contraparte** do seu modo: um bloco **parcial** com os tokens que de fato mudam entre
claro e escuro. Aplicar um tema passa a respeitar o modo em que o usuário está, e o par claro/escuro deixa de
ser calculado para ser **autorado**.

# 2. Contexto

## 2.1 A regressão, e como ela apareceu

Medida no ERP (consumidor real, `file:`), depois de a `plan-24-1` entrar:

> *"nenhum dos temas está aplicando tema claro/escuro corretamente."* — dono, 2026-08-11

**Antes da decisão D**, `syncThemeWithMode` rodava **a cada render**, e isso produzia um efeito do qual a UI
dependia sem nunca ter sido escrito: **tema e modo eram independentes.** Você estava no claro, escolhia um
tema escuro, e o motor convertia aquele tema para claro na hora. **O seu modo vencia.**

**Depois de D**, aplicar um preset é `applyFullConfigRaw(design)` — o design cru, com o `mode` que o tema
declara dentro. **Não existe mais nenhum caminho que adapte um tema ao modo corrente.** Escolher um tema
troca o modo do usuário.

> **Por que nenhum gate pegou.** O `auditor_contraste` mede cada tema **no próprio modo nativo** e depois a
> contraparte gerada. Ele nunca mede *"tema X aplicado enquanto o usuário está no modo Y"* — porque, depois de
> D, esse caso deixou de existir no código. O gate está certo sobre o que mede; o vão é **conceitual**.

## 2.2 🔴 A MEDIÇÃO QUE DIMENSIONA A SOLUÇÃO

O revisor propôs "pares nomeados" estimando que dobraria o catálogo. **O dono contestou e estava certo.**
Medido em 2026-08-11 sobre os 422 tokens:

| | Quantos |
|---|---|
| Tokens **não-cor** (estrutura, tipografia, animação, espaço) | **343** |
| Cor de **marca/acento** (`primaryColor`, `accentColor`, status…) | **19** |
| **CARREGAM MODO** — fundo **38** · texto **14** · borda **8** | **60** |

**86% do tema é agnóstico de modo.** O delta claro/escuro é **60 de 422 — 14,2%** — e é um teto: boa parte
dos 60 raramente é declarada (`matrixBorderColor`, `cardHeaderBg`). Um tema real deve mexer em **20–30**.

> ⚠️ **Os 60 são APROXIMADOS.** A classificação usa heurística de nome onde não há mapa explícito, e ela erra
> nas pontas: `textureColor` e `cardTitleIconGlow` entraram como *texto* por conterem "texture"/"title".
> **A lista definitiva precisa ser revisada token a token** — é barato, e é feito uma vez (§3.3).

## 2.3 Por que contraparte autorada, e não conversão automática

A saída óbvia seria converter no clique com `syncThemeWithMode`. **Ela resolve o bug e reintroduz o problema
que originou toda esta campanha.** As faixas de `shiftColorMode`:

| papel | escuro | claro |
|---|---|---|
| `bg` | L ≤ 15 | L ≥ 88 |
| `text` | L ≥ 85 | L ≤ 25 |
| `border` | **L = 20 fixo** | **L = 90 fixo** |

**Toda contraparte gerada converge para a mesma paleta de fundos e textos.** A identidade que sobrevive é só
matiz e saturação — e em `border` nem isso, porque `l` é descartado. É a homogeneização que o dono rejeitou
com medição própria (`plan-24-1` §2.1), reaparecendo pela porta dos fundos.

### A propriedade que fecha o argumento: a ida e volta

`shiftColorMode` **satura nos dois sentidos** — ele força para dentro da faixa e não guarda de onde veio.
Logo `escuro → claro → escuro` **não devolve a paleta original**: devolve faixa de faixa. Hoje, dois cliques
no toggle deixam o tema permanentemente diferente do que o autor escreveu.

**Com contraparte autorada, a ida e volta é exata** — são dois conjuntos de valores fixos, e alternar entre
eles é reversível por construção.

## 2.4 ✅ As três decisões do dono *(2026-08-11)*

| # | Pergunta | Decisão |
|---|---|---|
| 1 | Contraparte obrigatória ou opcional? | **Obrigatória** |
| 2 | O que fazer com os 18 antigos? | **Ficam no fallback** (`syncThemeWithMode`) |
| 3 | E o ERP, que espalha `SARAK_REFERENCE_THEMES[].design`? | **O dono atualiza depois da correção** |

### Como 1 e 2 convivem — a leitura do revisor

Aplicadas ao mesmo conjunto elas se contradizem. A leitura é a óbvia: **obrigatória para tema novo, os 18 são
legado.** O mecanismo:

- **O tipo `ThemePreset` mantém `contraparte` OPCIONAL** — obrigatória no tipo faria os 18 não compilarem, e
  quebraria todo tema de consumidor (**R33**);
- **O gate EXIGE**, com uma lista de isenção declarada que **nasce com exatamente os 18 e só pode encolher**.

É o idioma que a base já usa em `@sarak-encapsula` e no `VALUE_ALLOWLIST`: **o tipo é permissivo, o gate é
estrito, e a exceção é visível e contável.**

# 3. Escopo

## 3.1 Dentro

1. **`contraparte?: Partial<SarakDesignState>`** no `ThemePreset` — bloco parcial, só os tokens que mudam.
2. **`resolveThemeForMode(theme, modo)`** — a função única que decide o que aplicar:
   - modo pedido **=** modo nativo ⇒ `theme.design`;
   - modo pedido **≠** nativo **e há contraparte** ⇒ `{ ...design, ...contraparte, mode: pedido }`;
   - modo pedido **≠** nativo **e não há** ⇒ `syncThemeWithMode` (o fallback dos 18).
3. **O caminho de aplicar preset passa por ela** — `handleApplyFullTheme` (`ThemeCustomizationTab`) deixa de
   mandar `design` cru. **É isto que conserta a regressão.**
4. **`ShellThemeToggle` passa por ela** — em vez de chamar `syncThemeWithMode` direto.
5. **Contraparte para os 5 temas novos** — são os "novos" da decisão 1.
6. **O gate exige contraparte**, com a lista de isenção dos 18, declarada e com o número na saída.
7. **A segunda passada do gate mede a contraparte AUTORADA** quando existir, em vez da sintetizada.
8. **A lista definitiva dos tokens que carregam modo**, revisada token a token (§3.3), no
   `liberdade-e-restricao.md`.

## 3.2 Fora

- ⛔ **Autorar contraparte para os 18 antigos** — decisão 2: ficam no fallback.
- ⛔ **Mexer no ERP** — decisão 3, é do dono, depois.
- ⛔ Mudar as faixas de `shiftColorMode`. Ele continua sendo o fallback e precisa seguir funcionando.
- ⛔ Criar token, mudar o domínio dos 422, ou tornar `contraparte` obrigatória **no tipo**.

## 3.3 A lista dos tokens que carregam modo — revisar, não copiar

Os **60** da §2.2 vieram de heurística e **têm erro conhecido nas pontas**. Antes de virar contrato:

| Fonte | O que ela decide |
|---|---|
| `semanticRole` declarado no schema | **autoridade** — quando existe, vence |
| `EXPLICIT_TEXT/PRIMARY/BORDER/BG_TOKENS` (`presets/themes/color-engine.ts`) | o mapa explícito que já existe |
| A `description` do token no catálogo | desempata o que sobra |

⚠️ **Um token de brilho/textura não é texto** só porque tem "title"/"texture" no nome. **Declare o número
final** (R18) — se não for 60, o número certo é o que valer.

# 4. Referências obrigatórias

| Tipo | Onde | Para quê |
|---|---|---|
| Plan | [[plan-24-1-fluxo-de-criacao-de-tema]] §2.8 | a decisão D, que originou a regressão |
| Plan | [[plan-25-teste-pratico-do-fluxo-de-tema]] | os 5 temas que recebem contraparte |
| Spec fixa | [[09-temas-e-presets]] §4.3.1 · §6.5 | D registrado; a trava de contraste |
| Spec fixa | [[00-regras-e-invariantes]] → **R31**, **R33**, **R18** | contraste; contrato de payload; declarar o que não se vê |
| Fonte | `src/core/Design/presets/themes/color-engine.ts` | as faixas e os mapas de papel semântico |
| **Skill** | `test-unitario` · `padrao-typescript` · `padrao-escrita` | |

# 5. Instruções de execução

1. **A lista dos tokens de modo primeiro.** Ela é insumo de tudo: da contraparte dos 5, do gate e do mapa.
2. **`resolveThemeForMode` antes de tocar em qualquer chamador** — uma função, três casos, teste próprio.
3. **Prove a regressão ANTES de consertar:** um teste que aplica um tema escuro estando em claro e falha.
   Depois faça passar. Sem isso, não há prova de que a plan conserta alguma coisa.
4. **Prove a ida e volta exata:** aplicar contraparte e voltar devolve o design original, chave a chave.
5. **Não autore contraparte para os 18.** Se der vontade, é a decisão 2 do dono.

# 6. Prompt de execução

```
Leia specs/00-prompt-executor.md e execute
specs/plan/plan-26-contraparte-de-modo.md.

Contexto obrigatório: specs/00-contexto.md, specs/00-knowledge.md,
specs/specs/09-temas-e-presets.md (§4.3.1, §6.5),
specs/specs/00-regras-e-invariantes.md (R31, R33, R18),
a plan-24-1 §2.8 (a decisão D) e a §2/§3 desta plan.
Skills: test-unitario, padrao-typescript, padrao-escrita.

⚠️ ESTA PLAN CONSERTA UMA REGRESSÃO MEDIDA NO CONSUMIDOR REAL: depois de D,
escolher um tema TROCA O MODO DO USUÁRIO. A preferência dele tem de vencer.

⚠️ E NÃO RESOLVA COM CONVERSÃO AUTOMÁTICA. `syncThemeWithMode` joga tudo nas
faixas (bg L≥88, text L≤25, border L=90 FIXO) e toda contraparte gerada
converge para a mesma paleta — é a homogeneização que o dono rejeitou com
medição própria. A contraparte é AUTORADA.

PASSO 1 — A LISTA DOS TOKENS QUE CARREGAM MODO, revisada TOKEN A TOKEN.
  O revisor mediu 60 de 422 (fundo 38, texto 14, borda 8) por heurística, e ela
  ERRA nas pontas: `textureColor` e `cardTitleIconGlow` entraram como TEXTO por
  conterem "texture"/"title". Refaça com: `semanticRole` do schema (autoridade)
  → os mapas EXPLICIT_* de presets/themes/color-engine.ts → a description do
  catálogo para desempatar.
  ⇒ DECLARE o número final (R18). Se não for 60, o certo é o que valer.

PASSO 2 — `contraparte?: Partial<SarakDesignState>` no ThemePreset, e
  `resolveThemeForMode(theme, modo)` com os TRÊS casos:
    · modo pedido = nativo            ⇒ theme.design
    · ≠ nativo E há contraparte       ⇒ {...design, ...contraparte, mode: pedido}
    · ≠ nativo E não há               ⇒ syncThemeWithMode  (fallback dos 18)
  ⚠️ `contraparte` fica OPCIONAL NO TIPO. Obrigatória no tipo quebraria os 18 e
    todo tema de consumidor (R33). Quem exige é o GATE, no PASSO 5.

PASSO 3 — LIGAR nos dois chamadores:
  · `handleApplyFullTheme` (ThemeCustomizationTab) — hoje manda `design` cru;
    é ELE que causa a regressão.
  · `ShellThemeToggle` — hoje chama `syncThemeWithMode` direto.

  ⇒ PROVE A REGRESSÃO ANTES: escreva o teste que aplica um tema ESCURO estando
    em modo CLARO e VEJA FALHAR. Depois faça passar. Sem o vermelho antes, não
    há prova de que esta plan conserta algo.
  ⇒ E PROVE A IDA E VOLTA EXATA: aplicar a contraparte e voltar devolve o design
    original CHAVE A CHAVE. (Hoje não devolve: `shiftColorMode` satura nos dois
    sentidos, então dois cliques no toggle deixam o tema permanentemente
    diferente do que o autor escreveu.)

PASSO 4 — contraparte para os 5 temas da plan-25, e SÓ para eles.
  terracota-solar · musgo-do-vale · ardosia-ao-entardecer · forja-ultravioleta ·
  grafite-puro. Só os tokens que MUDAM — bloco parcial, não tema inteiro.
  ⛔ NÃO autore contraparte para os 18 antigos: decisão 2 do dono, ficam no
    fallback.

PASSO 5 — O GATE EXIGE contraparte, com lista de isenção DECLARADA que nasce
  com exatamente os 18 antigos e SÓ PODE ENCOLHER. Número na saída.
  E a SEGUNDA PASSADA passa a medir a contraparte AUTORADA quando existir, em
  vez da sintetizada — ela deixa de medir o que a lib derivou e passa a medir o
  que alguém escreveu.

PASSO 6 — a lista do PASSO 1 entra no
  .agents/skills/ui-criar-tema/references/liberdade-e-restricao.md — é o que o
  agente precisa saber para autorar contraparte, e hoje não existe.
  ⚠️ Aponte, não transcreva o catálogo (R17).

LINHAS VERMELHAS:
  · Você NÃO torna `contraparte` obrigatória no TIPO.
  · Você NÃO autora contraparte para os 18 antigos.
  · Você NÃO mexe no ERP — é do dono, depois.
  · Você NÃO altera as faixas de shiftColorMode: ele segue sendo o fallback.
  · Você NÃO cria token nem muda o domínio dos 422.
  · Você NÃO conserta os achados 33, 35, 37, 38 e 39 — têm plan própria.

Os três espelhos: gates/baselines/ · sarak-dev/ · sarak-ui/.

VERIFICAÇÕES, com a saída colada:
  npm run audit           (contraste 0/0 nos dois modos, 23 temas)
  npx vitest run          (INTEIRA)
  npm run gate-limits:check · npm run dev-kit:check · npm run guide:check
  node gates/scripts/release/check-audit-baseline.mjs --with-tsc
  git diff --stat

DECLARE se dist/ mudou e toda baseline que se moveu.

Não commite. Ao terminar, escreva o resumo na própria plan e mova o status para
🟠 Em revisão.
```

# 7. Critérios de aceite

- [ ] **A lista dos tokens que carregam modo foi revisada token a token**, e o número final está **declarado**
      — 60 era aproximação com erro conhecido.
- [ ] `contraparte` existe no `ThemePreset` e é **opcional no tipo**.
- [ ] `resolveThemeForMode` cobre os **três** casos, com teste próprio.
- [ ] **A regressão tem teste que falhava antes**: aplicar tema escuro em modo claro preservava o claro.
- [ ] **A ida e volta é exata** para tema com contraparte — demonstrado chave a chave.
- [ ] Os **5 temas novos** têm contraparte; **os 18 antigos não** e estão na lista de isenção declarada.
- [ ] O gate **exige** contraparte e imprime o número de isentos.
- [ ] A segunda passada mede a contraparte **autorada** quando existe.
- [ ] `liberdade-e-restricao.md` traz a lista, **sem transcrever o catálogo** (R17).
- [ ] `npx vitest run` verde; contraste **0/0 nos dois modos**; baselines e espelhos regravados.

# 8. Como verificar

```bash
npm run audit                    # 0/0 nos dois modos + o número de isentos
npx vitest run
npm run gate-limits:check
node gates/scripts/release/check-audit-baseline.mjs --with-tsc
```

# 9. Destino da síntese

[[09-temas-e-presets]] — a contraparte no contrato `ThemePreset` (§2), `resolveThemeForMode` no ciclo de vida
(§4.3), e a §4.3.1 ganhando o desfecho de D · [[00-regras-e-invariantes]] — **R31**, com a segunda passada
medindo contraparte autorada.

# 10. Resumo da execução

## Resumo da execução — 2026-08-11

**Resultado:** Concluído.

## O que foi feito

### PASSO 1 — a lista dos tokens que carregam modo, revisada token a token

`semanticRole` (a fonte de maior autoridade, per §3.3) está **vazio em todos os 422 tokens** — nunca foi
preenchido no schema, medido diretamente (`token.semanticRole` é `undefined` nos 79 tokens `type: 'color'`).
A classificação real veio, então, das duas fontes seguintes: os mapas `EXPLICIT_*` de
`presets/themes/color-engine.ts` como ponto de partida, e a `description` de cada token no schema para
desempatar/corrigir.

Revisão token a token dos **79 tokens `type: 'color'`** (medido; não é estimativa):

| Papel | Contagem | Exemplos |
|---|---|---|
| **texto** (`text`) | **14** | `textColorMaster`, `btnPrimaryText`, `tooltipTextColor`, `inputIconColor`… |
| **borda** (`border`) | **8** | `cardBorderColor`, `tooltipBorderColor`, `glassEdgeColor`… |
| **fundo** (`bg`) | **33** | `colorBgBody`, `sidebarColor`, `cardBackgroundColor`, `scrollThumbColor`… |
| **marca/status** (`primary`, mode-invariant) | **24** | `primaryColor`, `statusErrorColor`, `chartColorPalette`… |

**Número final: 55 tokens carregam modo** (14 + 8 + 33) — não 60. A diferença de 5 veio inteira do balde
"fundo": a heurística original contava alguns tokens de marca/estado como fundo por não terem sido
comparados contra a `description`.

Duas correções confirmadas, exatamente as que a plan citou como erro conhecido:
- `textureColor` — entrava como TEXTO por conter "texture"/heurística de nome; a `description` ("cor usada
  em overlays de textura/ruído de fundo") é clara: é **fundo**.
- `cardTitleIconGlow` — entrava como TEXTO por conter "title"; a `description` ("brilho... normalmente uma
  versão translúcida da cor primária") é **marca**, não texto.

Duas correções **novas**, achadas nesta revisão (não citadas na plan, mas do mesmo padrão):
- `navItemActiveColor` — está em `EXPLICIT_PRIMARY_TOKENS` em `color-engine.ts` (e o próprio comentário do
  arquivo já admite: *"funcionalmente texto, mesmo classificado como 'primary'"*). Para a lista de
  "carrega modo" desta plan, reclassifiquei como **texto** — ele PRECISA de valor distinto por modo (é
  exatamente um dos 3 tokens da Decisão C, `ON_PRIMARY_TEXT_PAIRS`). Não editei `color-engine.ts` (fora do
  escopo — a linha vermelha proíbe mexer nas faixas de `shiftColorMode`); a reclassificação vale só para
  esta lista de referência.
- `inputFocusBorderColor` — por nome pareceria borda, mas a `description` diz "herda a cor primária do
  sistema" e o valor real em todos os 5 temas novos é literalmente `primaryColor`. Classifiquei como
  **marca** (mode-invariant) — mudar o modo não deveria mudar de qual cor a borda de foco deriva.

### PASSO 2 — `contraparte` no tipo + `resolveThemeForMode`

- `ThemePreset.contraparte?: Partial<SarakDesignState>` (`src/core/Design/presets/themes/index.ts`) e o
  espelho `ThemeEntry.contraparte?: Partial<SarakDesignState>` (`src/core/Provider/types.ts`, usado pelos
  temas do banco) — **opcionais no tipo**, como a plan exige (R33: obrigar quebraria os 18 e todo tema de
  consumidor).
- `resolveThemeForMode(theme, modo)` em `src/core/Design/presets/themes/color-engine.ts` — os 3 casos
  exatos da plan: nativo → `theme.design`; oposto com `contraparte` → `{...design, ...contraparte, mode}`;
  oposto sem `contraparte` → `syncThemeWithMode` (fallback). **9 testes** em
  `presets/themes/__tests__/color-engine.test.ts`, incluindo os 3 casos isolados e a **ida e volta exata**
  (ver PASSO 3).

### PASSO 3 — ligado em QUATRO chamadores, não dois

A plan nomeia `handleApplyFullTheme` e `ShellThemeToggle`. Ao explorar o código encontrei que
`handleApplyFullTheme` (`ThemeCustomizationTab.tsx`) só recebe um `design` **já achatado** — não tem acesso
a `theme.contraparte` porque quem monta esse payload é o chamador de cima, `PresetsCatalog.tsx`. E existe
um **terceiro caminho de aplicar tema**, não citado na plan, com o **mesmo defeito**: `useDesignSync.ts`
(o caminho do `activeThemeId` CONTROLADO, `09-temas-e-presets` §4.3) fazia
`setDesign((prev) => ({ ...prev, ...activeTheme.design }))` — sem NENHUMA tentativa de preservar o modo do
usuário, o mais literal dos dois bugs descritos na §2.1 desta plan ("escolher um tema troca o modo").

**Decisão:** tratei os 4 como no escopo, porque são a MESMA regressão, na mesma família de causa
(`applyFullConfigRaw`/`setDesign` recebendo `theme.design` cru). Deixar `useDesignSync.ts` de fora
significaria que a plan não conserta o caminho que o ERP (consumidor real que reportou o bug) mais
provavelmente usa — ele consome via `activeThemeId`/`customThemes`, não via o painel interno do Design
Engine.

1. **`useDesignSync.ts`** (`src/core/Provider/hooks/`) — `resolveThemeForMode` com `requestedMode` lido de
   `prev.mode` (o modo ATUAL do usuário, via updater funcional). **Prova da regressão**: teste que aplica
   um tema nativamente escuro estando o usuário em claro — RED antes do conserto (`result.mode` saía
   `'dark'`), GREEN depois (`'light'`) — saída colada abaixo.
2. **`PresetsCatalog.tsx`** — o clique em "aplicar tema" (aba Globais) chamava
   `{ ...theme.design, mode: currentMode }`: um patch que **forçava o rótulo do modo sem converter nenhuma
   cor** — um estado pior que "tema venceu": mode claro com cores cruas escuras. Trocado por
   `resolveThemeForMode(theme, currentMode)`.
3. **`PresetCard.tsx`** — a miniatura do catálogo chamava `syncThemeWithMode` **sem condição**, mesmo no
   modo nativo — violava o próprio princípio da Decisão D ("no nativo, emitido = escrito") só nesta
   miniatura. Trocado por `resolveThemeForMode`; a prévia agora mostra exatamente o que `onApply`
   aplicaria.
4. **`ShellThemeToggle.tsx`** — passou a procurar o tema ativo em `allThemes` por `activeThemeId` (os dois
   agora expostos no CONTEXTO — não estavam: `activeThemeId` só existia como prop do `Provider`, nunca
   chegava a `useSarakUI()`; adicionei em `SarakUIContextType` e no `uiContextValue`). Achado o tema,
   `resolveThemeForMode`; sem tema rastreável (design custom sem id de catálogo), cai no fallback de
   sempre — `syncThemeWithMode` sobre o `design` corrente, comportamento preservado.

**Prova da ida e volta exata** (teste em `color-engine.test.ts`): tema sintético com `contraparte`, aplica
`resolveThemeForMode(theme, 'light')` e depois `resolveThemeForMode(theme, 'dark')` de novo — o resultado é
**idêntico ao `design` original, chave a chave** (`toEqual` + loop `toBe` por chave). Funciona porque
`resolveThemeForMode` sempre parte do `theme` IMUTÁVEL, nunca do resultado anterior.

### PASSO 4 — contraparte para os 5 temas da plan-25 (só eles)

Autorei a contraparte de `terracota-solar`, `musgo-do-vale`, `ardosia-ao-entardecer`, `forja-ultravioleta` e
`grafite-puro` — 54-55 chaves cada (os tokens que meu tema de fato customiza, restritos aos papéis
texto/borda/fundo do PASSO 1). **Não toquei nos 18 legados** (confirmado por `git diff` — nenhum arquivo de
`presets/themes/` fora dos 5 novos aparece no diff).

**Método** (declarado com honestidade — usei ferramenta, não "senti" cada cor): para cada token, calculei
`newL = 100 - L` (HSL), preservando H/S — uma inversão direta, simples e a mesma para os 5, então "autorada"
no sentido de que EU escolhi a fórmula e as exceções (abaixo), não que rejeitei toda sistematização. Mesclei
`{...defaults, ...design, ...contraparte}` e rodei o MESMO `solveThemeContrast` (`plan-24-1`/`plan-25`)
sobre o candidato — ele corrige só a luminosidade do texto que reprova, exatamente como usado para os temas
nativos. `primaryColor`/`accentColor`/`secondaryColor`/status e `inputFocusBorderColor` **nunca** entraram
na inversão (marca não muda de modo).

**Relatório do solucionador sobre cada candidato de contraparte:**

| Tema | Falhas antes do solucionador | Depois | Decisão de autor extra |
|---|---|---|---|
| `terracota-solar` (light→dark) | 3 | 0 | — |
| `musgo-do-vale` (light→dark) | 1 | 0 | `cardActionBtnHoverBg` fixado em `#4b9968` (mesmo H140/S36, mais claro que `cardActionBtnPrimaryBg`) — mesmo padrão de conflito "dois fundos do mesmo botão, direções opostas" já visto na plan-25 |
| `ardosia-ao-entardecer` (dark→light) | 3 | 0 | — |
| `forja-ultravioleta` (dark→light) | 3 | 0 | — |
| `grafite-puro` (dark→light) | 8 | 0 | — |

Todas as falhas "antes" foram resolvidas pelo solucionador sozinho, exceto `musgo-do-vale`, que precisou da
mesma decisão de autor (fundo do hover) documentada na plan-25 para os temas nativos — o conflito
"`cardActionBtnPrimaryBg` × `cardActionBtnHoverBg` puxam o texto em direções opostas" reaparece na
contraparte pela mesma razão estrutural.

### PASSO 5 — o gate exige contraparte

- `CONTRAPARTE_EXEMPTION_LIST` (`gates/scripts/audit/verify_contrast.ts`) — os 18 ids legados, only-shrink
  por comentário no código.
- `auditContraparteRequired(themes)` — reprova qualquer tema fora da lista sem `contraparte`. Rodando hoje:
  **18 isentos, 0 faltando** (os 5 novos têm; nenhum tema novo apareceu sem).
- `auditThemeOppositeMode` passou a chamar `resolveThemeForMode` em vez de `syncThemeWithMode` direto — a
  segunda passada agora mede a contraparte AUTORADA quando existe.
- `check-audit-baseline.mjs` ganhou o parser `contraparteFaltando` para o `auditor_contraste.mjs` — sem
  isso, uma regressão futura (tema perder a contraparte) não apareceria no gate de baseline, só no
  `npm run audit` direto. Ajustei `printContraparteAudit` para imprimir a contagem SEMPRE (sucesso ou
  falha) — métrica ausente no caminho feliz vira "não consegui ler a saída" (R20) e bloquearia à toa.

### PASSO 6 — `liberdade-e-restricao.md` + `SKILL.md`

Nova §5 em `liberdade-e-restricao.md`: o que é contraparte, por que 86% do tema é agnóstico de modo, como
autorar na prática (o método do PASSO 4) — **sem transcrever** `EXPLICIT_*`/o catálogo (aponta para
`resolveSemanticRole` em `color-engine.ts`, declarando que a lista de lá "erra nas pontas" e pode mudar).
`SKILL.md` ganhou o passo 5.5 (contraparte obrigatória para tema novo) e 1 item de checklist — sem isso, o
Passo 5 documentado ("Verificação") ficaria descrevendo um fluxo que o gate já não aceita mais.

## Achados fora do escopo (não corrigidos)

- **`resolveSemanticRole` (`color-engine.ts`) tem os mesmos 2 erros de heurística** (`textureColor`,
  `cardTitleIconGlow`) que produzem a contraparte SINTETIZADA errada para os 18 legados que algum dia forem
  autorados. Não corrigi — mudar essas faixas está fora do escopo (linha vermelha: não altera
  `shiftColorMode`/os mapas `EXPLICIT_*`). Fica registrado para quem decidir autorar contraparte para um dos
  18.
- **`semanticRole` está vazio em TODOS os 422 tokens** — a fonte de maior autoridade que a própria plan
  nomeia (§3.3) nunca foi preenchida no schema. Preenchê-la é trabalho de outra escala (422 decisões
  token a token no schema) e não estava no escopo desta plan.

## Arquivos alterados

| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/core/Design/presets/themes/index.ts` | alterado | `ThemePreset.contraparte?` |
| `src/core/Provider/types.ts` | alterado | `ThemeEntry.contraparte?`, `SarakUIContextType.activeThemeId?` |
| `src/core/Design/presets/themes/color-engine.ts` | alterado | `resolveThemeForMode` + `ModeResolvableTheme` |
| `src/core/Design/presets/themes/__tests__/color-engine.test.ts` | alterado | +9 testes (3 casos + ida-e-volta + regressão) |
| `src/core/Provider/hooks/useDesignSync.ts` | alterado | usa `resolveThemeForMode`, respeita `prev.mode` |
| `src/core/Provider/hooks/__tests__/useDesignSync.test.ts` | alterado | +1 teste de regressão (RED→GREEN provado) |
| `src/core/Provider/SarakUIProvider.tsx` | alterado | expõe `activeThemeId` no contexto |
| `src/features/DesignEngine/Canvas/components/PresetsCatalog.tsx` | alterado | usa `resolveThemeForMode` em vez do patch cru |
| `src/features/DesignEngine/Canvas/components/PresetCard.tsx` | alterado | miniatura usa `resolveThemeForMode` |
| `src/core/Shell/Components/ShellThemeToggle.tsx` | alterado | procura tema ativo, usa `resolveThemeForMode` com fallback |
| `src/core/Design/presets/themes/{5 temas}.ts` | alterados | +bloco `contraparte` (54-55 chaves cada) |
| `gates/scripts/audit/verify_contrast.ts` | alterado | `auditThemeOppositeMode` via `resolveThemeForMode`; `CONTRAPARTE_EXEMPTION_LIST`; `auditContraparteRequired` |
| `gates/scripts/audit/__tests__/verify_contrast.test.ts` | alterado | +7 testes (contraparte autorada medida; exigência) |
| `gates/scripts/release/check-audit-baseline.mjs` | alterado | +parser `contraparteFaltando` |
| `.agents/skills/ui-criar-tema/references/liberdade-e-restricao.md` | alterado | §5 contraparte |
| `.agents/skills/ui-criar-tema/SKILL.md` | alterado | passo 5.5 + checklist |
| `sarak-dev/*` | regenerado | `npm run dev-kit` |

`.claude/skills/ui-criar-tema/*` reflete via symlink (mesmo arquivo de `.agents/skills/`, não uma cópia).
`dist/BUILD_INFO.json` aparece modificado no `git status` (timestamp/`baseCommit`) — **não rodei
`npm run build`** nesta execução; a mudança não é minha e não mexe em nenhum artefato de bundle (só esse
metadado). `specs/00-indice.md` mostra 1 linha adicionada — pré-existente, o revisor registrando a
`plan-26` na fila antes desta execução começar (confirmado por `git diff`, não fui eu). `sarak-ui/` não
precisou de regeneração (`guide:check` já saiu "em dia").

## Verificações executadas

- **Prova da regressão** (`useDesignSync.test.ts`) — ANTES do conserto: `expected 'dark' to be 'light'`
  (FAIL, 1/4 testes do arquivo). DEPOIS: 4/4 verde.
- `npm run audit` → `auditor_contraste`: **0 reprovados nativo, 0 oposto, 25 pulados** (idêntico ao
  baseline anterior); **Exigência de CONTRAPARTE: 18 isentos, 0 faltando**. 2 auditores vermelhos no total
  (`ghostvars`=1, `composicaoatomica`=2) — idênticos ao baseline, dívida pré-existente intocada.
- `npx vitest run` (suíte INTEIRA, rodada final) → **301 arquivos / 1170 testes, 100% verde** (cresceu de
  1159→1170: +11 testes novos desta plan, distribuídos em `useDesignSync.test.ts`,
  `color-engine.test.ts` e `verify_contrast.test.ts`).
- `npm run gate-limits:check` → **29/29**.
- `npm run dev-kit:check` → defasado em 3 arquivos → `npm run dev-kit` → **em dia (3 arquivos, 0 ponteiros
  mortos)**.
- `npm run guide:check` → **em dia (6 arquivos)**, sem regeneração necessária.
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` → **1ª rodada: BLOQUEADO** — 2 erros de
  `tsc` em produção (`color-engine.ts` cast incompatível; `ShellThemeToggle.tsx` acessando
  `activeThemeId` antes de eu tê-lo exposto no contexto) — corrigidos; **2ª rodada: REGRESSÃO** —
  `auditor_cleancode.violacoes: 0→1` (`types.ts` passou de 250 para 252 linhas) — comprimi os comentários
  novos e removi 1 linha em branco; **3ª rodada (final): "igual ao baseline de 2026-08-11 — nenhuma
  regressão."** `tsc`: 0 erros produção, 0 teste.
- `git diff --stat` → 30 arquivos rastreados alterados + 1 novo (esta plan); nada em `specs/specs/`,
  `specs/adr/`; `specs/00-indice.md` e `dist/BUILD_INFO.json` confirmados como pré-existentes/externos ao
  meu trabalho.

## Critérios de aceite

- [x] A lista dos tokens que carregam modo foi revisada token a token, número final **declarado: 55** (14
      texto + 8 borda + 33 fundo, de 79 tokens `color`) — não 60.
- [x] `contraparte` existe no `ThemePreset` (e no `ThemeEntry`) e é **opcional no tipo**.
- [x] `resolveThemeForMode` cobre os 3 casos, com teste próprio (9 testes).
- [x] A regressão tem teste que falhava antes — saída RED colada acima, GREEN depois.
- [x] A ida e volta é exata para tema com contraparte — `toEqual` + `toBe` chave a chave.
- [x] Os 5 temas novos têm contraparte; os 18 antigos não, e estão na lista de isenção declarada
      (`CONTRAPARTE_EXEMPTION_LIST`, 18 ids).
- [x] O gate exige contraparte e imprime o número de isentos (`18 tema(s) isento(s)...`).
- [x] A segunda passada mede a contraparte autorada quando existe (`resolveThemeForMode`, não
      `syncThemeWithMode` direto).
- [x] `liberdade-e-restricao.md` traz a lista (via ponteiro para `resolveSemanticRole`), sem transcrever o
      catálogo.
- [x] `npx vitest run` verde (301/301, 1170/1170); contraste 0/0 nos dois modos; baselines/espelhos
      regravados (`sarak-dev/`; `sarak-ui/` já estava em dia).

## Decisões e suposições

- **Tratei `useDesignSync.ts` como 3º chamador no escopo**, além dos 2 nomeados pela plan — justificado
  em detalhe no PASSO 3. Sem essa inclusão, a regressão relatada pelo dono (medida no ERP, que consome via
  `activeThemeId`) provavelmente continuaria não corrigida na prática.
- **Também toquei `PresetCard.tsx`** (a miniatura do catálogo) — não nomeado pela plan, mas com o MESMO
  padrão de bug (`syncThemeWithMode` incondicional, violando a Decisão D só ali) e resolvido pela mesma
  função. Deixá-lo de fora criaria uma miniatura que mente sobre o que `onApply` vai realmente aplicar.
- **`resolveThemeForMode` recebe uma interface estrutural (`ModeResolvableTheme`)**, não o tipo
  `ThemePreset` inteiro — permite reusar a mesma função para `ThemeEntry` (temas do banco) sem depender de
  import cruzado desnecessário.
- **A fórmula de inversão da contraparte (`newL = 100 - L`, preservando H/S) foi minha escolha**, não algo
  que a plan especificou — é deliberadamente diferente das faixas fixas de `shiftColorMode` (que a linha
  vermelha proíbe alterar, mas não proíbe eu usar uma fórmula PRÓPRIA para autorar). Registrado com
  honestidade: é sistemática (a mesma fórmula nos 5 temas), não uma escolha estética por token — a parte
  "autorada" está na fórmula escolhida e nas 2 decisões de exceção (marca não inverte; conflito de hover
  resolvido manualmente), não em cada cor individual.
- **`inputFocusBorderColor` e `navItemActiveColor` foram reclassificados** na lista de referência desta
  plan (não no código de `color-engine.ts`, que seguiu intocado) — justificado no PASSO 1.

## Pendências / riscos

- Nenhuma pendência técnica.
- **Decisão do dono, sem prazo** (fora do escopo desta plan, §3.2): o ERP consome hoje `SARAK_REFERENCE_THEMES[].design`
  espalhado por `file:` — ele precisa ser atualizado para tirar proveito da correção (decisão 3 da §2.4).
- **`resolveSemanticRole` mantém os 2 erros de heurística conhecidos** (achado fora do escopo, acima) — só
  importa no dia em que alguém autorar contraparte para um dos 18 legados.

# 11. Veredito

**🟢 APROVADA** — *revisor, 2026-08-11.* Sem pendências.

## 11.1 A prova que definia a plan: a contraparte é AUTORADA, não faixa colada

O risco desta plan era um só — a contraparte sair como saída do `syncThemeWithMode` com outro nome, o que
reintroduziria a homogeneização pela porta dos fundos. Medi de duas formas independentes.

**Matiz e saturação sobrevivem; só a luminosidade inverte:**

```
terracota-solar     H 30 S 40 L96  ->  H 30 S 40 L 4
musgo-do-vale       H 96 S 20 L95  ->  H 96 S 20 L 5
ardosia-ao-entardecer H223 S 15 L39 ->  H223 S 15 L61
forja-ultravioleta  H270 S 20 L 6  ->  H270 S 20 L94
grafite-puro        H240 S  6 L 7  ->  H240 S  6 L93
```

**As 5 contrapartes NÃO convergem** — guardam H30, H96, H223, H270 e H240. Se fossem faixa, os fundos teriam
colapsado no mesmo lugar. E as primárias **não mudam** entre modos, que é o correto: marca é agnóstica.

**Contra a síntese, token a token:** **93 a 98% dos valores diferem** do que `syncThemeWithMode` produziria
para o mesmo tema. São escolhas, não derivação.

## 11.2 O resto, medido

| Verificado | Resultado |
|---|---|
| `resolveThemeForMode` | os **3 casos** exatos da §3.1, na ordem certa |
| **Ida e volta exata** | `toEqual(design)` **mais** verificação chave a chave — o critério que eu exigi |
| Prova da regressão | teste RED→GREEN; a preferência de modo do usuário vence |
| Gate | **0/0 nos dois modos** · **18 isentos · 5 com contraparte · 0 faltando** |
| 2ª passada | mede a contraparte **autorada**, não a sintetizada |
| Suíte | **301/301 arquivos · 1170/1170 testes**, exit 0 |
| Baseline | `check-audit-baseline --with-tsc` sem regressão · `gate-limits` **29/29** · `dev-kit` em dia |
| Tipo | `contraparte` **opcional**, como a §2.4 exigia — os 18 legados seguem compilando (**R33**) |

## 11.3 O executor ampliou o escopo, e estava certo

A plan nomeava **2** chamadores. Ele tratou **4**, e a extensão se justifica: qualquer caminho que aplique um
tema sem passar pelo resolvedor reintroduz a regressão.

⚠️ **Uma correção ao relato, que não muda a entrega:** ele descreveu `useDesignSync` como *"provavelmente o
que o ERP usa de verdade"*. **Não é** — o ERP usa `initialTheme` mais a seleção no painel, e o caminho real
dele é o `PresetsCatalog`, que resolve no clique com `currentMode`. `useDesignSync` cobre o consumidor que
usa `activeThemeId` controlado, e tratá-lo foi correto de todo modo. **O caminho do ERP está coberto** —
conferi.

## 11.4 Duas observações, nenhuma bloqueante

**A contraparte ficou completa, não mínima.** Cada uma tem **~54 chaves** — praticamente a lista inteira dos
55. A §2.2 previa *"20–30 na prática"*; **a previsão era minha e estava errada**. Completa é defensável e
mais fácil de auditar; fica o registro de que o custo real por tema é o teto, não a metade dele.

**A lista fechou em 55, não 60** — 14 texto, 8 borda, 33 fundo. Foram as 2 correções que a própria plan
apontava (`textureColor`, `cardTitleIconGlow`) mais 2 que o executor achou. É exatamente o que a §3.3 pedia:
**declarar o número que vale**, não confirmar o que eu chutei.

**`dist/BUILD_INFO.json`** aparece no diff e o executor declarou não ter sido ele. Confere: `builtAt`
18:09:41 sobre o commit `5eafa02` (o da `4.0.0`) — é o `npm run build` que o **dono** rodou ao diagnosticar o
consumidor. Nada a corrigir.
