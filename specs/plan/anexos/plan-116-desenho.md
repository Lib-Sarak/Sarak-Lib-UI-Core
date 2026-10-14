# Anexo da plan-116 — o desenho do tema sob demanda (lote 0, 2026-10-13)

Lote 0: **desenho, nenhum código tocado**. Tudo que está aqui foi lido no worktree ou medido fora do repositório;
o que é projeção está marcado **[projeção]** e o que não foi medido está marcado **[não medido]**. As linhas valem
para o worktree desta data (que tem a `plan-115` lote 4 em voo — `src/core/Design/presets/themes/*.ts` estavam
sendo editados durante a medição); o executor do lote 1 reconfere antes de mexer.

**Decisão que este anexo pede ao dono** (a única que não é mecânica): §3 — qual das três formas de um tema pedido
por id pintar no primeiro quadro. Recomendação: **B + porta de espera**.

---

## 1. Medição — o catálogo no boot do consumidor

### 1.1 Achado que muda o tamanho do problema

A plan estimou "~2,5 KB gzip cada, ~35 KB somados". Essa é a medida do **arquivo-fonte** gzipado (medi: 14 fontes,
37,7 KB gzip somados). No **bundle de um consumidor**, minificado e comprimido junto com o resto da lib, os mesmos
14 temas custam bem menos:

| Variante (app mínimo: `SarakUIProvider` + `<div>`, esbuild 0.27.7, `minify`, `splitting`, ESM) | Boot raw | Boot gzip |
|---|---|---|
| `src/index.ts` — 14 temas (hoje) | 1173,9 KB | **319,3 KB** |
| mesmo, com `SARAK_GLOBAL_THEMES = [sarak-sovereign]` (13 temas fora) | 1081,9 KB | **307,2 KB** |
| mesmo, com `[sarak-sovereign, minimalist-airy]` (o par de referência) | 1088,7 KB | **308,6 KB** |
| **13 temas (diferença)** | **92,0 KB** | **12,1 KB** (≈ 0,93 KB gzip e 7,1 KB raw por tema) |

Os 14 temas são **~3,8 % do boot gzip** de hoje, não ~10 %. "Boot" = o chunk do entry mais todo chunk alcançado por
`import` estático a partir dele (os `import()` ficam de fora), medido pelo `metafile` do esbuild.

**[projeção]** para a `plan-110` (19 temas, todo token estético nos dois papéis; a plan estima 4–6 KB de fonte
gzip por tema): a razão consumidor/fonte medida hoje é 0,93/2,7 ≈ 0,35, o que dá ≈ 1,4–2,1 KB gzip por tema e
**≈ 27–40 KB gzip** para 19 temas — 8–12 % do boot de hoje. O ganho real da plan-116 só é grande **depois** da
plan-110; hoje ele é ~11 KB. Isso não muda a decisão do dono (a plan-110 depende disto), mas muda o **teto**: ele
não pode ser definido contra o número de hoje (§6).

Não medido: `dist/index.js` contra a variante sem temas (o `dist/` do worktree é de um build anterior e
`npm run build` é do revisor, não do lote 0). O `dist` inteiro dá boot 1407,5 KB raw / 348,9 KB gzip; o delta de
temas no `dist` fica **[não medido]** — o método do §1.3 mede.

### 1.2 Onde os temas entram no boot hoje

- `src/index.ts:75-77` exporta `SARAK_GLOBAL_THEMES`, `SARAK_THEME_PRESET_IDS`, `SARAK_REFERENCE_THEMES`,
  `sarakGetThemePreset`, `sarakDeriveThemeFromReference`.
- **Não depende do barril**: o `SarakUIProvider` já arrasta o catálogo inteiro por
  `useThemeCollection.ts:3,20` (`[...SARAK_GLOBAL_THEMES, ...]`) e `useDesignManager.ts:5-6,71,76,84`. Tirar do
  barril sem tirar destes dois não muda o boot — o consumidor que só importa o Provider paga os 14 temas.
- No `dist/`, os 14 temas moram num chunk compartilhado (`chunk-HTOTCKUV.js`, 636 KB, estático) — o esbuild da
  lib não os separa sozinho.
- `PresetsCatalog.tsx:51` cai em `SARAK_GLOBAL_THEMES` quando o contexto não tem `allThemes`; o painel já é
  lazy (`CustomizationPanel`), então o catálogo dele não conta para o boot **desde que** pare de importar o
  array eager.

### 1.3 Método (reprodutível, fora do repositório)

Pasta temporária **fora** do repositório, `node_modules` por junção (o `esbuild` e o `vite` do repositório são
os bundlers disponíveis; não há rede):

```powershell
$S = "<pasta temporária>"; $R = "<repositório>"
New-Item -ItemType Junction -Path "$S\node_modules" -Target "$R\node_modules"
# entry.tsx:  createRoot(document.getElementById('r')).render(<SarakUIProvider><div>oi</div></SarakUIProvider>)
#             com o import apontando para $R\src\index.ts  OU  $R\dist\index.js (modo dist)
$env:REPO = $R; node build.mjs src          # 14 temas
node build.mjs src-1theme                   # plugin onLoad troca themes/index.ts por [sarak-sovereign]
node build.mjs dist                         # o artefato que o consumidor instala
# build.mjs: esbuild.build({ bundle, splitting, format:'esm', minify, metafile, jsx:'automatic',
#   define:{'process.env.NODE_ENV':'"production"'} }); boot = fecho de imports kind==='import-statement'
#   a partir do entryPoint; soma raw e gzipSync de cada chunk do fecho.
# Desfazer: (Get-Item "$S\node_modules").Delete()  ANTES de apagar a pasta (junção!)
```

O `build.mjs` usado nesta medição está no scratchpad da sessão do lote 0 (não rastreado). **O revisor reproduz com
o comando acima**; o lote 1 transforma isto em `scripts/measure-consumer-boot.mjs` (a trava do §6).

---

## 2. (a) O que fica no boot

| Fica no boot | Por quê | Peso (medido/projetado) |
|---|---|---|
| `sarak-sovereign` | o tema padrão (constante `SARAK_DEFAULT_THEME_ID`) e a referência **escura** | ≈ 0,9 KB gzip (média dos 13 medidos; o isolado não foi medido) |
| `minimalist-airy` | a referência **clara**: `SARAK_REFERENCE_THEMES` é API pública e é o fallback de id inexistente em modo claro (`useDesignManager.ts:71`, `useDesignSync.ts:63`) | **+1,4 KB gzip** medido (307,2 → 308,6) |
| `SARAK_THEME_CATALOG` — metadados dos 14 (e depois 19) | listar sem carregar: `id`, `name`, `description`, `mode` nativo, `hasContraparte` | ≈ 0,1 KB raw por tema **[projeção]**; ≈ 1,5–2 KB raw |
| `SARAK_THEME_PRESET_IDS` + tipo `SarakThemePresetId` | já é pequeno; o `catalogAst.mjs` e o `collectKitSources.mjs` leem a constante do **fonte** `themes/index.ts` | desprezível |
| `SARAK_DEFAULT_THEME_ID = 'sarak-sovereign'` | tema padrão explícito (critério novo da plan) | desprezível |

**Fica de fora do boot**: os outros 12 (e os 17 da plan-110), cada um num módulo próprio alcançado só por `import()`.

**Por que a miniatura do painel não cabe nos metadados.** `PresetCard.tsx:29-110` desenha o cartão a partir do
**`design` inteiro** (raio por canto, borda, sombra, textura, `navigationStyle`, vidro) — uma amostra de cor não
basta. Então a lista (nome, modo, cor) é metadado; **a miniatura exige o tema carregado**. O painel é lazy; ao
abrir a aba de temas ele carrega o catálogo inteiro de uma vez (§3, `sarakLoadAllThemePresets`) com esqueleto de
cartão a partir do metadado até o tema chegar. Custo: o painel passa a ter um segundo chunk com ~12–19 temas
(só quando a aba abre).

**A cor de amostra** (o plan dizia "amostra de cor") **não entra no metadado**: duplicaria valor do tema numa
segunda fonte e viraria drift. O metadado é **gerado** a partir do tema (§5), então carregá-lo não custa o tema
inteiro, mas também não repete o `design`. Se o dono quiser a amostra no seletor leve, ela entra **gerada**
(`primaryColor` e `surfaceColor` do modo nativo) — decisão aberta, ver §8.

---

## 3. (b) Como um tema pedido por id pinta no primeiro quadro

Restrição fixa ([[02-design-engine]] §3.2): o estado inicial sai do inicializador do `useState`, sem efeito; o
primeiro quadro já tem o tema certo. Todas as alternativas abaixo a respeitam — a diferença é **de quem é a
responsabilidade de o tema estar em memória antes do Provider montar**.

### Alternativa A — o consumidor passa o objeto do tema, importado por nome

```tsx
import { SarakUIProvider, cyberpunkNeonTheme } from '@sarak/lib-ui-core';
<SarakUIProvider customThemes={[cyberpunkNeonTheme]} initialTheme="cyberpunk-neon" />
```

| Eixo | Custo |
|---|---|
| Peso | zero para quem não importa o nome — **mas só se o bundler do consumidor fizer DCE por export**. O `index.cjs` e consumidor sem tree-shaking carregam os 14/19. [não medido: exige exportar os temas por nome, que é o próprio lote 1] |
| API pública | +14 (e +19) exports nominais de valor no barril; `SARAK_GLOBAL_THEMES` sai |
| Troca visível | nenhuma — síncrono |
| Tema salvo | funciona (a persistência guarda o `design`) |
| Id inexistente | `initialTheme="cyberpunk-neon"` **sem** o objeto passa a ser "inexistente" — aviso + referência do modo. É **quebra silenciosa para todo consumidor que usa `initialTheme="<id embarcado>"`**, hoje o caminho que a spec 09 §4.3 recomenda |
| Risco estrutural | **colide com a regra do §7.1 da spec 03**: exportar o valor do tema pelo barril ao lado de uma fronteira `import()` faz o esbuild da lib levá-lo ao chunk do entry — a fronteira lazy vira reexport. A alternativa A **não combina** com carregamento por `import()` no mesmo build (o painel precisaria do array, não do nome) |

### Alternativa B — carregador assíncrono com cache síncrono, mais "porta de espera" no Provider *(recomendada)*

```tsx
// opcional, antes do render — o caminho com zero espera:
await sarakPreloadThemes(['cyberpunk-neon']);
createRoot(el).render(<SarakUIProvider initialTheme="cyberpunk-neon" />);
```

O Provider **resolve o id no registro síncrono** (`sarak-sovereign`, `minimalist-airy`, `customThemes`, e tudo que
`sarakPreloadThemes`/`sarakLoadThemePreset` já trouxe). Se o id pedido está no catálogo mas **ainda não está em
memória**, o Provider **não pinta outro tema**: segura os `children` (o mesmo mecanismo do `strictBackendSync`,
`SarakUIProvider:177-178`) e renderiza `null`/`loadingFallback` até o `import()` resolver; então semeia e pinta
**o tema certo no primeiro quadro que mostra a aplicação**.

| Eixo | Custo |
|---|---|
| Peso | **garantido** pela fronteira `import()`: o tema não está no fecho estático do entry (verificável por `metafile`, §6). Independe do bundler do consumidor |
| API pública | `+ sarakLoadThemePreset(id)`, `+ sarakPreloadThemes(ids)`, `+ SARAK_THEME_CATALOG`, `+ SARAK_DEFAULT_THEME_ID`, prop opcional `loadingFallback`; **as props `activeThemeId`/`initialTheme` e o payload (R33) não mudam** |
| Troca visível | **nenhuma**, nem tema errado nem tema trocado: no pior caso (consumidor não pré-carregou) o que aparece é o **fallback**/nada por 1 `import()` (~ms, chunk de ≈ 1–2 KB gzip) e depois o app já no tema certo. O que **deixa de valer** é "o primeiro quadro **já é o app**" — nesse caso é o fallback. É a única concessão, e só existe sem `await sarakPreloadThemes` |
| Tema salvo | o `design` salvo (localStorage/`onLoad`) pinta direto, **sem esperar** — não precisa do catálogo ([[09-temas-e-presets]] §4.4). O id do tema salvo (para achar a contraparte, `resolvedThemeId`) é carregado **depois**, por efeito, sem tocar o `design` — o modo-toggle antes de o tema chegar (ms) cai no fallback sintetizado; se ele chega depois, a contraparte autorada volta (a lição da plan-27) |
| Id inexistente | decidido **sem rede**: `SARAK_THEME_CATALOG` + `customThemes` dizem na hora que o id não existe → aviso + referência do modo (como hoje), sem esperar nada |
| SSR | sem `window` o `import()` ainda resolve no servidor; o Provider espera o carregamento antes de renderizar os `children` — **[não medido]**, o lote 1 precisa de um caso de SSR |

### Alternativa C — o Provider espera sempre (Suspense), sem `sarakPreloadThemes`

Igual a B sem o `await` do consumidor: **todo** `initialTheme` que não é um dos dois do boot passa pelo fallback.

| Eixo | Custo |
|---|---|
| Peso | o mesmo de B |
| API pública | só `SARAK_THEME_CATALOG`/`SARAK_DEFAULT_THEME_ID`; o consumidor não muda nada |
| Troca visível | nenhuma, mas **todo** consumidor com tema não-padrão passa a mostrar o fallback no primeiro quadro, sempre |
| Tema salvo / id inexistente | iguais a B |

C é B sem a saída; B é estritamente melhor e custa o mesmo no Provider.

### Alternativa descartada — "pinta o padrão e troca quando chegar"

Contradiz [[02-design-engine]] §3.2 (é exatamente o *flash* que a spec registra como erro). Listada só para ficar
escrita; o dono já a tratou como restrição, não opção.

### Alternativa descartada — um `.css` por tema

`package.json.exports` já expõe `.css`, mas o motor escreve as variáveis a partir do **estado** (`design`), não de
folha; o tema precisa estar como dados no estado para o painel, a contraparte e a persistência. Não resolve.

### Recomendação

**B.** O consumidor que quer zero espera escreve uma linha (`await sarakPreloadThemes([...])`); o que não escreve
vê o fallback por um `import()` curto — nunca um tema trocado. A é descartada pela colisão com o §7.1 da spec 03 e
pela quebra silenciosa de `initialTheme="<id>"`; C é B sem a saída.

---

## 4. (c) API pública: o que sai, o que muda, o que entra

### 4.1 Sai do barril

| Símbolo | Hoje | Substituto |
|---|---|---|
| `SARAK_GLOBAL_THEMES` (`index.ts:75`) | array eager com os 14 | `sarakLoadAllThemePresets(): Promise<SarakThemePreset[]>` (carrega todos, sob demanda) · lista leve: `SARAK_THEME_CATALOG` |
| `sarakGetThemePreset(id)` (`reference.ts:18`, `index.ts:77`) | síncrono, devolve o preset ou `undefined` | `sarakLoadThemePreset(id): Promise<SarakThemePreset>` (rejeita com id desconhecido, nunca `undefined` mudo) |

### 4.2 Muda de assinatura

| Símbolo | Hoje | Depois |
|---|---|---|
| `sarakDeriveThemeFromReference(referenceId, overrides)` (`reference.ts:67`) | `referenceId: SarakThemePresetId`, busca síncrona | `reference: SarakReferenceThemeId \| SarakThemePreset` — os dois ids do boot (`'sarak-sovereign' \| 'minimalist-airy'`) continuam síncronos; qualquer outro tema entra **como objeto** (o consumidor o obteve por `sarakLoadThemePreset`). Passar id não-boot lança com a mensagem de migração |
| `useSarakUI().allThemes` | "globais + custom + salvos" | **temas com `design` em memória**: os do boot, `customThemes`, salvos e os já carregados. Quem lista tema para o usuário lê `SARAK_THEME_CATALOG` (ou `themeCatalog`, abaixo) |

### 4.3 Entra

| Símbolo | Forma |
|---|---|
| `SARAK_THEME_CATALOG` | `readonly SarakThemeCatalogEntry[]` — `{ id, name, description, mode: 'light'\|'dark', hasContraparte }`; **gerado** (§5) |
| `SarakThemeCatalogEntry` | tipo |
| `SARAK_DEFAULT_THEME_ID` | `'sarak-sovereign'` — o padrão explícito |
| `sarakLoadThemePreset(id)` | carrega um tema embarcado (cache em memória; `import()` por id) |
| `sarakPreloadThemes(ids)` | idem, em lote; popula o cache síncrono que o Provider lê |
| `sarakLoadAllThemePresets()` | os 14/19, para painel e ferramenta |
| `loadingFallback?: ReactNode` | prop opcional do `SarakUIProvider` (o que mostrar enquanto o tema pedido chega) |
| `useSarakUI().themeCatalog` / `.loadTheme(id)` | metadados de tudo que é listável (embarcados + custom + salvos) e o carregador, para o painel e seletores próprios |

### 4.4 Fica

`SARAK_REFERENCE_THEMES` (os dois do boot), `SARAK_THEME_PRESET_IDS`, os tipos `SarakThemePreset`,
`SarakThemePresetId`, `SarakThemeReferenceOverrides`, `SarakDerivedThemePreset`, `activeThemeId`/`initialTheme`
e **todo o payload (R33)**.

### 4.5 Tema padrão (critério novo da plan)

`useDesignManager.ts:75` hoje faz `defaultTheme || 'classic'` — `classic` não existe, e o fallback
`?? SARAK_GLOBAL_THEMES[0]` esconde isso. Desenho: `SARAK_DEFAULT_THEME_ID = 'sarak-sovereign'` exportado e usado
no lugar; `options.theme.defaultTheme` continua sendo a porta do consumidor; se ele passar um id que não está no
catálogo nem em `customThemes`, **aviso nomeando o id** + padrão (a regra do §4.3 da spec 09, que hoje só vale
para `activeThemeId`/`initialTheme`). Nenhum id inexistente fica no código.

### 4.6 Troca de tema nunca herda token do anterior (critério novo da plan)

Hoje: `useDesignSync.ts:46-52` aplica `validateDesign({ ...prev, ...resolved })` — o token que o tema novo não
declara **herda do tema anterior**; idem a prévia do painel (`useDesignDraft.ts`, `handleThemePreview`), que o
"Aplicar" grava. Desenho:

```
aplicado = validateDesign({
  ...sarakGetDefaultDesignState(),        // o padrão de TODO token do schema
  ...preservado(prev),                    // só o que NÃO é do tema (abaixo)
  ...resolveThemeForMode(tema, modo),     // o tema, no modo pedido
})
```

`preservado(prev)` = `mode` (o modo do usuário vence — plan-26, [[09-temas-e-presets]] §4.3) e as chaves de
**identidade que o tema não é dono** (o que o lote 1 confirma contra o schema: `logo*`/nome do sistema, se
existirem em `SarakDesignState`; **preferência do usuário** continua sobreposta fora do `design`, §4.7 da spec
09). **Uma só função** (`composeThemeDesign`, em `src/core/Design/presets/themes/`) é chamada pelo `useDesignSync`
**e** pelo `useDesignDraft` — duas portas, um resolvedor (a lição das duas portas da plan-27). Teste do critério:
A declara `X`, B não; depois de B, `X` é o padrão do schema, no Provider e na prévia.

Nota de custo: o padrão de todo token é `sarakGetDefaultDesignState()`, que **já está no boot** (é a semente);
não custa peso.

---

## 5. (d) Como gates e testes carregam o catálogo inteiro

Princípio: **ferramenta importa o catálogo completo por um módulo interno; o produto não alcança esse módulo.**

- `src/core/Design/presets/themes/all.ts` (novo, **fora do barril**): importa os 14/19 estaticamente e exporta
  `SARAK_ALL_THEMES`. É o único arquivo que "sabe de todos"; gates e testes importam dele; nenhum arquivo de
  `src/` fora de `themes/` o importa (trava do §6).
- `src/core/Design/presets/themes/loaders.ts` (novo): `{ [id]: () => import('./<arquivo>') }` — a fronteira
  lazy. **Não** importa `all.ts`.
- `src/core/Design/presets/themes/catalog.generated.ts` (novo, **gerado** — mesmo padrão do `token-types`):
  `SARAK_THEME_CATALOG` derivado do `design.mode`, `name`, `description`, e da presença de `contraparte` de
  cada tema. `npm run themes:catalog` / `themes:catalog:check` (entra no `build`) — o metadado não é escrito à
  mão, então não envelhece (anti-drift; teste de paridade `catálogo == all.ts`).
- `SARAK_THEME_PRESET_IDS` continua em `themes/index.ts` (o `catalogAst.mjs:140` e o
  `collectKitSources.mjs:49` leem o **fonte** dessa constante); `index.ts` deixa de importar os 14 temas e passa a
  ser só tipos + ids + os dois do boot.

**Consumidores a migrar (levantados por `Grep` nesta data):**

| Grupo | Arquivos |
|---|---|
| Gates | `gates/scripts/audit/verify_contrast.ts`, `verify_diversity.ts`, `verify_presets.ts`; `gates/scripts/contrato/check-panel-contract.ts`, `check-channel-dispute.ts` (+ `__tests__/check-channel-dispute.test.ts`) |
| Testes (`src/`) | `core/Provider/utils/__tests__/{validationColorMix,tokenContractParity,shippedThemesConsoleClean,googleFontsUrl}.test.ts` · `core/Design/presets/themes/__tests__/{chromeWidgetDefaults,contraparteReferencia}.test.ts` · `core/Design/utils/__tests__/themeAxes.test.ts` · `core/Provider/hooks/__tests__/{useThemeCollection,useDesignSync}.test.ts` · `features/DesignEngine/hooks/__tests__/{useDesignDraft.undoIntegration,DuasPortasModoTema}.test.tsx` · `features/DesignEngine/Canvas/components/__tests__/PresetCard.test.tsx` · `components/atomic/{Feedback/SarakBadge,Navigation/SarakMenuItem}` · `components/engines/charts/SubEngines/__tests__/categoricalPalette.test.ts` |
| Fonte (produto) | `core/Provider/hooks/{useDesignManager,useThemeCollection,useDesignSync}.ts` · `features/DesignEngine/Canvas/components/PresetsCatalog.tsx` · `core/Design/utils/themeAxes.ts` (só texto) |
| Kit/skills | `sarak-ui/templates/ui-kit/themes.ts` (usa `SARAK_REFERENCE_THEMES` — segue síncrono) · `sarak-ui/GUIA-FRONTEND.md`, `sarak-ui/skill/references/examples.md`, `.agents/skills/ui-integra-consumidor/references/examples.md`, `.agents/skills/ui-criar-tema/**` (`generate_theme_template.ts` e testes) · `scripts/consumer-kit/collectKitSources.mjs` |

Esta lista é a do `Grep` de hoje; o `src/` está em movimento (plan-115). O lote 1 reconta antes de começar.

---

## 6. (e) Teto de boot e a trava

**Por que não um número absoluto.** O boot do consumidor muda com toda plan que toca `src/` (a plan-115 está
movendo `src/` agora). Um teto em KB fixo ou fica folgado e deixa um tema voltar, ou quebra por razão alheia. A
trava é **relativa e estrutural**:

1. **Estrutural (a que falha "se um tema voltar ao boot")** — no fecho estático do entry (fonte e `dist`):
   nenhum módulo `themes/<id>.ts` fora de `{sarak-sovereign, minimalist-airy}` e nenhum `themes/all.ts`. Em
   `src/`: um teste vitest anda o grafo de imports **estáticos** a partir de `src/index.ts` (AST, como
   `SarakDataLazyBoundary.test.ts`) e falha ao tocar um tema fora dos dois. No `dist`: o fecho de
   `import` estático de `dist/index.js` não contém o marcador (`id:"cyberpunk-neon"`…) de nenhum tema fora dos
   dois (a mesma técnica da §7.1 da spec 03 para `@tanstack/react-virtual`).
2. **Medida (consumidor, no `gates:full`)** — `scripts/measure-consumer-boot.mjs` (o §1.3 promovido): esbuild
   sobre `dist/index.js`, fecho estático, gzip. Teto: **boot da variante com `[sarak-sovereign, minimalist-airy]`
   medido na própria execução, + 0,1 KB gzip por tema do catálogo + 3 KB gzip de folga** — o teto acompanha o
   resto da lib, porque a referência é medida no mesmo run (uma variante com o plugin de dois temas), não um
   número congelado.
3. **Mutação do revisor** — importar um tema (`import './cyberpunk-neon'` no `index.ts`) deve acender as duas.

**Valor proposto hoje** (para o dono aprovar o *formato* do teto): hoje o boot do consumidor é 319,3 KB gzip; o
piso alcançável com 2 temas é **308,6 KB gzip** (−10,7 KB). Depois da plan-110 a trava segura os ~27–40 KB
**[projeção]** que ela traria.

---

## 7. Riscos e armadilhas já medidas na memória do projeto

- **`export *` custa zero; um export de valor ao lado do `import()` anula a fronteira** (§7.1 da spec 03). Por
  isso `all.ts` e `loaders.ts` ficam fora do barril e o barril não reexporta módulo de tema.
- **tsup/esbuild pode juntar módulo em chunk com nome de hash** — o marcador do `dist` (§6.1) é o id do tema, não
  o nome do arquivo.
- **Chunk lazy compartilhado**: dois temas que importam o mesmo módulo (`./index` só por tipo hoje — erased)
  podem ser juntados num só pedaço; o lote 1 confere que cada `themes/<id>.ts` não importa valor de outro tema.
- **`PresetsCatalog.tsx:51` e `useThemeCollection.ts` hoje caem no array eager** — são os dois pontos onde o
  boot volta sem ninguém notar; estão no escopo do lote 1 e cobertos pela trava estrutural.
- **O loop infinito `customThemes`/`activeThemeId`** (spec 02 §3.1): o cache de temas carregados **não pode**
  recriar `allThemes` a cada render — referência estável por versão do cache; teste dedicado.
- **`strictBackendSync` é no-op hoje** (spec 02): a "porta de espera" do B é um mecanismo **novo**, não o reuso
  literal do flag; o lote 1 especifica o gate de render (`isThemeReady`) em vez de depender do flag.

---

## 8. O que o dono decide para liberar o lote 1

1. **Alternativa**: B (recomendada), A ou C — §3.
2. **Quais temas ficam no boot**: `sarak-sovereign` + `minimalist-airy` (recomendado, mantém
   `SARAK_REFERENCE_THEMES` síncrono e o fallback claro), ou só `sarak-sovereign` (−1,4 KB gzip; o fallback claro
   passa a vir da `contraparte` do soberano — **muda o visual** do fallback de id inexistente em modo claro).
3. **Amostra de cor no catálogo** (§2): sim (gerada, 2 chaves) ou não (só nome/modo).
4. **Forma do teto** (§6): relativo + estrutural (recomendado) ou número absoluto congelado.
5. **`sarakGetThemePreset` síncrono**: some (recomendado — devolver `undefined` mudo para 12 de 14 ids é armadilha)
   ou fica restrito aos dois do boot com `SarakReferenceThemeId`.
6. **Versão**: tudo isto é **MAJOR** dentro de `## 8.0.0` (remove exports do barril); o `minor-no-removal:check`
   não bloqueia major.

---

## 9. Nota de migração (rascunho para `docs/migracoes.md`, subseção MAJOR em `## 8.0.0`)

> ### Os temas embarcados são carregados sob demanda: `SARAK_GLOBAL_THEMES` e `sarakGetThemePreset` saem do barril
>
> O boot do consumidor leva só o tema padrão (`sarak-sovereign`) e o par de referência; os demais chegam quando
> são escolhidos. Para o primeiro quadro pintar o tema pedido sem espera, pré-carregue-o antes do render.
>
> **Antes**
> ```tsx
> import { SARAK_GLOBAL_THEMES, sarakGetThemePreset } from '@sarak/lib-ui-core';
> const tema = sarakGetThemePreset('cyberpunk-neon');
> <SarakUIProvider initialTheme="cyberpunk-neon" />
> ```
> **Depois**
> ```tsx
> import { sarakPreloadThemes, sarakLoadThemePreset, SARAK_THEME_CATALOG } from '@sarak/lib-ui-core';
> await sarakPreloadThemes(['cyberpunk-neon']);            // antes do createRoot().render
> const tema = await sarakLoadThemePreset('cyberpunk-neon');
> <SarakUIProvider initialTheme="cyberpunk-neon" />        // sem o pré-carregamento: mostra o loadingFallback e então o tema certo
> ```
>
> | Saiu | Use |
> |---|---|
> | `SARAK_GLOBAL_THEMES` | `SARAK_THEME_CATALOG` (lista, sem carregar) · `sarakLoadAllThemePresets()` (os temas) |
> | `sarakGetThemePreset(id)` | `sarakLoadThemePreset(id)` |
> | `sarakDeriveThemeFromReference('<id>', …)` com id fora de `sarak-sovereign`/`minimalist-airy` | passe o preset carregado como 1º argumento |
> | `useSarakUI().allThemes` listando todos os embarcados | `useSarakUI().themeCatalog` |
>
> Também muda: trocar de tema **não herda mais** nenhum token do tema anterior (o que o tema novo não declara
> volta ao padrão do schema), e o tema padrão passa a ser `SARAK_DEFAULT_THEME_ID` (`sarak-sovereign`); um
> `options.theme.defaultTheme` inexistente avisa em vez de cair em silêncio.

(Rascunho: o texto final nasce no lote 1, com o `guide` regenerado por último.)

---

## 10. O que este lote não fez

- Não rodou `npm run build` (artefato, e outro executor está na árvore) — o delta de temas **no `dist/`** fica para
  o §1.3.
- Não mediu a alternativa A (exige exportar os temas por nome — é o próprio lote 1) nem SSR do B.
- Não tocou `src/`, `gates/`, `scripts/`, nenhuma spec. O app mínimo e o `build.mjs` moram no scratchpad da
  sessão, fora do repositório (a junção de `node_modules` é só leitura sobre o do repositório).
