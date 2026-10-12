---
tipo: "arquitetura"
titulo: "Design Engine — como um objeto design vira tela"
dominio: "Core / Design Engine / Provider"
status: "🟢 Vigente"
tags: ["arquitetura", "design-engine", "provider", "css-variables", "drafting", "escopo", "persistencia"]
relacionados: ["[[04-contrato-de-tokens-e-paridade]]", "[[01-forma-do-produto-e-modos-de-consumo]]", "[[00-mapa-do-modulo]]", "[[05-build-e-distribuicao]]", "[[00-regras-e-invariantes]]", "[[01-gates-e-baseline]]", "[[09-temas-e-presets]]", "[[03-superficie-publica]]"]
---

# 1. Propósito

O coração do produto: **como um objeto `design` plano vira tela.**

Este documento descreve o **mecanismo**. O dicionário de tokens, o que é um valor legítimo e o que "paridade" significa estão em [[04-contrato-de-tokens-e-paridade]] — aqui eles são **apontados, nunca repetidos**.

**Nenhum passo deste pipeline fala com servidor.** A biblioteca não tem backend ([[003-remocao-backend-proprio]]).

# 2. O pipeline ponta a ponta

```
ENTRADA
  customThemes · initialTheme · activeThemeId · config · localStorage
        │
        ▼
  useDesignManager ──► validateDesign ──► estado `design`   (contrato: arquitetura/04 §4)
        │
        ├──────────────── ALAVANCA DE VALOR ────────────────┐
        │                                                    │
        ▼                                                    ▼
  useDesignVariables                              ALAVANCA ESTRUTURAL
  (gera --sarak-<kebab-id> + aliases de cssVars)   o MESMO design lido em JS
        │                                          pelos Hooks Controladores
        ▼                                                    │
  DesignInjector                                             ▼
  app      → documentElement + body                  { className, style }
  embedded → o container da ilha                             │
        │                                                    ▼
        ▼                                                  JSX
  CSS de verdade no DOM
  consumido com var(--sarak-x, fallback)
```

Em prosa: o Provider recolhe as entradas, `useDesignManager` monta e valida o estado, `useDesignVariables` transforma cada token em CSS Variable, e `DesignInjector` aplica no lugar certo conforme o modo. **Em paralelo**, o mesmo objeto `design` é lido diretamente em JavaScript pelos Hooks Controladores, que devolvem classe e estilo prontos — porque alguns tokens mudam *qual classe* o componente usa, não o valor de uma propriedade ([[04-contrato-de-tokens-e-paridade]] §3).

# 3. O Provider como orquestrador

A ordem real em `src/core/Provider/SarakUIProvider.tsx` — e a ordem importa, porque cada etapa consome o resultado da anterior:

| Onde | Etapa |
| --- | --- |
| `:11` | **`injectSarakStyles(SARAK_CSS)`** — no topo do módulo, **fora** do componente (§9) |
| `:99` | `resolveSarakUIMode(options)` → `mode` |
| `:100` | Estado do `scopeElement` (o container da ilha, no modo embarcado) |
| `:106` | `useThemeCollection` → `allThemes` (`SARAK_GLOBAL_THEMES` + `customThemes`), `saveTheme`, `deleteTheme` |
| `:109` | **`useDesignManager`** → `design`, `setDesign`, `applyConfig`, `applyFullConfig`, `persistDesign`, o id resolvido |
| `:120` | `useBrandingManager` → identidade (opt-in, ver [[006-zero-marca-soberania-host]]) |
| `:128` | `useSarakDrafting(design, applyConfig, applyFullConfig)` → o rascunho (§5) |
| `:132` | `overlayPreferences` → o design efetivo: rascunho (se houver) com as preferências do usuário por cima, entre elas o modo de cor |
| `:142` | `useSarakUIEffects` → efeitos globais de documento (título, fontes) |
| `:145` | `useSarakStylesheetGuard(mode, scopeElement)` → a guarda de stylesheet (§9) |
| `:148` | O `useMemo` que monta o contexto público |

A árvore renderizada (`:180-221`): `DeviceProvider` → `UIContext.Provider` → `SarakScopeRoot`, e dentro dela — **nesta ordem**:

| Ordem | Nó | Condição |
| --- | --- | --- |
| 1 | `DesignInjector` (`:184`) | sempre |
| 2 | `NoiseOverlay` (`:197`) | **só fora do modo embarcado** |
| 3 | `SovereignThemeInjector` (`:198`) | sempre — **não** é gated por modo; ele resolve o modo internamente (§6) |
| 4 | `SarakBackgroundRenderer` (`:199`) | **só fora do modo embarcado** |

Por fim `SarakToastProvider` → `SarakOverlayProvider` → `children` (`:214-216`).

> ⚠️ **A ordem destes quatro irmãos é carregada de significado — não a reordene.** O comentário em `:190-196` registra o porquê: no modo app a árvore tem de sair **byte-a-byte igual** à de antes do modo embarcado, porque há **snapshots de Cards** que a cobrem (`SarakActionCard`, `SarakSearchCard`, `SarakTitleCard`). O modo embarcado só **remove** nós do ramo — nunca reordena.

> Os hosts de toast e overlay são montados **automaticamente**. O consumidor não deve montá-los à mão.

## 3.1 `EMPTY_CUSTOM_THEMES` e o guard — um loop de render infinito REAL

Isto é um padrão a **não repetir**, e o registro existe para que ele não volte.

O sintoma: CPU a 100% e um processo que nunca termina. A causa tinha **duas metades**, e fechar só uma não resolvia:

**Metade 1 — a referência instável.** Um default `customThemes = []` escrito inline no destructuring cria um **array novo a cada render**. Isso invalida o `useMemo` de `allThemes`, que invalida o efeito de sincronização. A correção é a constante `EMPTY_CUSTOM_THEMES` (`:47`), com o motivo escrito ali.

**Metade 2 — o `setDesign` incondicional.** `useDesignSync` (`src/core/Provider/hooks/useDesignSync.ts` — mora no **Provider**, não em `Design/hooks/`) chamava `setDesign` sempre que `activeThemeId` estivesse definido, com um objeto novo por spread. React nunca faz bailout por igualdade referencial de objeto, então: render → novo `customThemes` → novo `allThemes` → efeito → `setDesign` → render.

A correção de raiz é um **guard por ref** em `useDesignSync`: `lastAppliedThemeIdRef` (`:21`) guarda o último id efetivamente aplicado; o efeito retorna cedo se o id não mudou (`:29`); ao aplicar, grava o ref (`:33`) **antes** de chamar `setDesign` (`:34`); e se `activeThemeId` for limpo, o ref é resetado (`:40`) para permitir reaplicar depois.

> **A lição generalizável:** um efeito que chama `setState` com objeto novo, dependendo de uma referência que o render recria, é um loop. A defesa robusta é o **guard por valor** (o id mudou de verdade?), não a estabilização da referência — essa é defesa em profundidade.

## 3.2 A hidratação é SÍNCRONA

`useDesignManager:71-83` lê o `localStorage` **dentro do inicializador do `useState`**, não num efeito. Sem janela (SSR) devolve a semente; com janela, faz o parse e passa por `validateDesign` antes de virar estado.

Isso importa porque hidratar por efeito produziria **flash**: um render com o tema default antes de o tema real chegar. Aqui o primeiro paint já sai com o tema certo.

# 4. A geração das CSS Variables

`useDesignVariables` (`src/core/Design/hooks/useDesignVariables.ts`) faz quatro coisas:

**1. Sincroniza o modo primeiro** (`:42-43`) — força as cores conforme claro/escuro **antes** de gerar qualquer variável.

**2. Emite o autoVar de cada token** (`:64-65`): `toKebabCase(token.id)` → `--sarak-<kebab-id>`.

**3. Expande os aliases.** Um token pode declarar `cssVars` no schema — nomes extras que recebem o mesmo valor. E se declarar `generateVariants` sendo do tipo cor, a engine gera as variantes cromáticas (`-rgb`, `-bg`, `-border`, `-hover`, `-active`, `-light`, e a escala `-10`…`-50`). Há ainda um conjunto de **aliases de fachada** (`:158-176`) que mapeia nomes curtos (`--text-main`, `--bg-body`, `--primary-color`) para o primeiro valor disponível.

**4. Monta o CSS responsivo** (`:196-221`). Valor responsivo **não** entra no objeto `variables` inline — e o comentário (`:94-98`) explica por quê: especificidade inline venceria as media queries e travaria o layout no desktop. Em vez disso, gera uma folha com o seletor de escopo mais dois blocos `@media`. Os breakpoints são **interpolados numericamente** porque `@media` não aceita `var()`.

> **A segunda barreira anti-breakout.** `isCssSafeValue` (`:22`) reaplica o filtro `/[<>{};]/` no ponto de interpolação. A primeira barreira é `validateDesign`; esta existe porque o CSS responsivo é interpolado **cru** dentro de um `<style>`, e defesa em profundidade num ponto de interpolação não é redundância — é o que impede uma falha da barreira anterior de virar injeção.

# 5. Drafting — o preview ao vivo

`useSarakDrafting` mantém um estado de rascunho paralelo, e o roteamento é automático: se há rascunho ativo, a mudança vai para `draftDesign` (volátil, não persiste); se não, vai para o design real.

Três peças, e uma delas é sutil:

- **`isDrafting`** — estado React, para a UI reagir.
- **`isDraftingRef`** — ref síncrono espelhando o estado.
- **`lockDrafting()`** (`:20-22`) — grava **só no ref**, sem passar por `setState`, e por isso **pode ser chamada durante a renderização**. É a trava síncrona que impede uma mudança de escapar para o design persistido na janela entre o clique e o re-render.

**A diferença entre os dois canais, que o nome não deixa óbvio:**

| Do contexto | O que é |
| --- | --- |
| `applyConfig` | O canal **público**. Respeita o rascunho: se estiver em preview, escreve no rascunho; senão, comita |
| `applyConfigRaw` | O canal **direto**. É o `applyConfig` cru do `useDesignManager` — sempre grava no design persistido, **mesmo durante drafting** |

O mesmo par existe para `applyFullConfig`/`applyFullConfigRaw`. Usar o canal errado é a origem clássica do bug "mudei no painel e não persistiu" — ou do inverso, "o preview vazou para o sistema".

# 6. Isolamento

Cinco peças, cada uma resolvendo um problema diferente de contenção:

**`scope.ts`** — a fonte única de modo e escopo: a classe (`SARAK_SCOPE_CLASS`, `:19`), o atributo de hint no documento (`SARAK_MODE_ATTRIBUTE`, `:33`), a resolução do modo (`:42`) e o contexto que publica a classe ativa para quem precisar (`:53-55`).

**`SarakScopeRoot`** — no modo app devolve os filhos **sem nó extra no DOM** (`:35-37`); no embarcado materializa a `<div class="sarak-scope">` (`:39-45`). Usa **callback ref**, não `useRef`, para que o pai re-renderize quando o container existir — o `DesignInjector` precisa saber que já pode aplicar.

**`SarakPortalScope`** — resolve o problema dos overlays: um portal sai da árvore React e perderia o CSS escopado. No modo app é no-op estrutural; no embarcado envolve na classe de escopo. **E deliberadamente não aplica estilo nenhum** — um `<div>` com transform ou filter criaria *containing block* e quebraria `position: fixed` dos overlays.

**`SovereignThemeInjector`** — injeta CSS de alta prioridade que "sequestra" utilitários de terceiros conflitantes, para paridade visual dentro de um host que já tem seu próprio Tailwind. A âncora muda por modo (`:36`): `.sarak-scope` no embarcado, **`body`** no app — não `documentElement`. Só age agressivamente no modo claro (`:41`); no escuro faz apenas ajuste de matiz de fundo. Desativável por `manifest.sovereignHijack === false`.

**`DesignScope`** (`src/core/Design/components/DesignScope.tsx`) — o micro-provider. Gera uma classe única a partir de `useId` (`:28-31`), roda o próprio `useDesignVariables` com aquele seletor, injeta um contexto de override para que `useSarakUI()` interno leia o design certo, e traz a própria folha de CSS responsivo. É o que permite o preview escopado do painel e as ilhas embarcadas — **nada vaza para o host**.

# 7. Atmosfera e mídia — o processamento híbrido de luminância

`SarakBackgroundRenderer` precisa saber se uma imagem de fundo é clara ou escura, para escolher a cor de texto correta. O cálculo itera sobre um array de pixels, e feito de forma síncrona travava a thread principal em imagens pesadas.

O caminho completo, em `useMediaLuminance.ts`:

1. **Vídeo é descartado de saída** — retorna `'unknown'` direto (`:63-66`), sem tentar calcular.
2. **Amostragem minúscula**: canvas off-screen de **50×50 px** (`:81-82`), com `getContext('2d', { willReadFrequently: true })` (`:78`) — o hint que evita o *readback* GPU→CPU lento.
3. **Transferência para o Worker**: o `imageData.data.buffer` vai por `postMessage` como **Transferable** (`:116-120`) — os bytes saem da UI thread sem cópia.
4. **Equação HSP**: `sqrt(0.299·R² + 0.587·G² + 0.114·B²)`, com limiar **127,5** → `'light'` ou `'dark'`.
5. **Timeout de 500 ms** (`:94-100`): se estourar, `worker.terminate()` e cai no cálculo síncrono.

**Quatro pontos de fallback síncrono**, não um: timeout, erro do worker, falha na criação do worker, e ausência de `window.Worker`.

**Bloqueio de CORS degrada de forma diferente, e de propósito.** A imagem é carregada com `crossOrigin = 'anonymous'`; se o servidor recusar, o canvas fica *tainted* e a leitura de pixels lança. Nesse caso o resultado é `'unknown'` e **nenhum overlay é aplicado** — zero alteração nas cores originais. Não se tenta o fallback síncrono, porque a falha acontece antes de existir dado para calcular.

> ⚠️ **NOTA DE DISTRIBUIÇÃO — o Worker é INLINE via Blob URL de propósito.** Isto é decisão, não gosto, e o comentário no código (`:4-11`) registra o motivo: o padrão `new Worker(new URL('./arquivo', import.meta.url))` é resolvido **estaticamente pelo bundler do CONSUMIDOR**, que tenta empacotar um arquivo que não existe no `dist/` publicado — e isso **quebrava o build de quem importa a lib**. Um Blob URL não tem arquivo para resolver: funciona em qualquer bundler, e o cálculo continua fora da UI thread. Se o ambiente bloquear Blob workers por CSP, o `try/catch` cai no fallback síncrono.

# 8. Persistência, sem backend

**A chave default é `'sarak-ui-design-v9.0'`** (`src/core/Provider/constants.ts:1`), sobrescrevível por `persistence.storageKey`.

**A chave EFETIVA é composta** quando há `persistence.tenantId`: `` `${storageKey}::tenant:${tenantId}` ``, para que apps multi-tenant na mesma origem não vazem tema entre inquilinos ([[009-persistencia-tenant-aware]]). A composição tem **fonte única** — `resolveStorageKey` — e todo ponto de leitura, escrita e o filtro de `crossTabSync` a consomem; nenhum compõe a chave por conta própria. É o que impede compor `storageKey`+`tenantId` duas vezes por caminhos diferentes.

**A ordem de resolução depende de `strategy`** (contrato do dado em [[09-temas-e-presets]] §4.4.1). O que muda aqui, no motor: com `'remote'`, o carregamento remoto **substitui** o design partindo da semente (`{ ...semente, ...remoto }`) em vez de fundir por cima do que veio do `localStorage` — é o que impede o cache local de vencer por acidente quando o consumidor declarou que a fonte de verdade é o backend dele. Com `'hybrid'` (default) a fusão é `{ ...anterior, ...remoto }`, e com `'local'` o `onLoad` é ignorado mesmo se fornecido.

**Escrita:** `persistDesign` grava no `localStorage`, aguarda o `onSave` opcional do consumidor, e então chama `onThemeChange` (`useDesignManager:106`). Esta é a porta **"traga sua persistência"** — quem quiser sincronizar no backend *dele* usa o callback; a lib não fala com servidor nenhum.

**O `onSave` recebe DOIS argumentos: o design e o `id` do tema ativo.** O id percorre `useResolvedThemeId` → `persistDesign` → porta, e viaja **por `ref`**, não por dependência do `useCallback`. A razão é concreta: incluí-lo nas dependências trocaria a identidade da função a cada troca de tema, refazendo o efeito de persistência automática e **regravando** — o design ficaria salvando a si mesmo em laço. Pela mesma razão o id não entra dentro do payload: o payload é o dicionário de tokens, e misturar identidade com valor obrigaria todo consumidor a filtrá-la antes de gravar.

**Sincronização entre abas e apps:** `useDesignStorageSync` escuta o evento `storage` (`:73`), ativo por default (`crossTabSync !== false`). E ele **revalida antes de aplicar** — a sequência (`:50-71`) é: filtra pela chave certa, ignora remoção, faz no-op se o valor é o mesmo já conhecido (guarda anti-loop por ref), faz `JSON.parse` protegido com aviso se inválido, confere que é objeto e não array, **passa por `validateDesign`**, e só então chama `setDesign`.

> Um tema chegando de outra aba é **dado não confiável**, exatamente como um tema chegando de arquivo. Ele passa pela mesma fronteira ([[04-contrato-de-tokens-e-paridade]] §4).

**`strictBackendSync` — o que ele significa hoje, honestamente.** Ele atrasa a renderização dos `children` até o carregamento remoto terminar (`SarakUIProvider:177-178`). Mas sem backend próprio, se o consumidor **não** fornecer `persistence.onLoad`, a flag de carregamento é marcada **imediatamente** — ou seja, `strictBackendSync` é efetivamente **no-op** hoje, a menos que o consumidor traga o próprio `onLoad`. E nem faria diferença: o design já veio da semente ou do `localStorage`, de forma síncrona (§3.2).

# 9. Injeção de CSS e a guarda

**A injeção roda na IMPORTAÇÃO do módulo** — `injectSarakStyles(SARAK_CSS)` está no topo de `SarakUIProvider.tsx:11`, fora de qualquer componente. Portanto acontece **antes de qualquer Provider montar**, para não haver flash de conteúdo sem estilo.

A função é SSR-safe, idempotente pelo `id` da tag, e **no-op quando o documento está marcado como embarcado** — é para isso que serve o hint no `<html>`.

> Detalhe de build que vale saber: o guard não compara o CSS contra o literal do placeholder. Comparar duas strings literais é **constant-folding** para o esbuild, que eliminaria o código como morto **antes** de o passo de pós-build substituir o placeholder. O comentário no código registra isso.

**`useSarakStylesheetGuard`** é a rede de segurança. Num layout effect (antes do primeiro paint da ilha), se o modo é embarcado, ele **remove o stylesheet global** — porque se o consumidor esqueceu o hint no HTML, a injeção automática já rodou antes de a lib saber o modo.

E em desenvolvimento ele diagnostica: verifica por uma custom property se o CSS **certo** carregou, e emite `console.error` distinto para cada modo, apontando a correção — o import manual no app, o `sarak-scoped.css` no embarcado.

O lado do build (placeholder, geração da variante escopada, o que permanece global) está em [[05-build-e-distribuicao]] §5.

## 9.1 A ordem de camadas do CSS publicado — a classe vence o padrão de elemento

`src/styles/sarak-base.css` monta o CSS publicado em camadas, e a posição de cada camada decide quem vence.
Entre camadas, a posição conta mais que a especificidade:

```
base (preflight do Tailwind)  →  components.sarak-elements  →  utilities  →  sarak-lib
                                 padrões de ELEMENTO da lib     classes do     classes PRÓPRIAS
                                 (_elements.css)                 Tailwind       da lib
```

**Num elemento com classe utilitária, a classe decide; sem classe, vale o padrão da lib.** Os padrões que
miram **elemento ou atributo solto** moram em `_elements.css`, na subcamada `components.sarak-elements`: raio,
hover, estado ativo e foco de `<button>`; raio de campo; família, cor, tamanho e peso de título; família de
texto; os padrões do **`body`** (cor, família, tamanho, peso, entrelinha, margens, transição e `overflow-x`, num
lugar só); e a ponte do token `borderStyle`. Do `body`, só o `background-color` fica em `_base.css`, com
`!important`, na camada final. As classes que a lib aplica por nome ficam na camada final: `rounded-btn`,
`bg-theme-card`, `border-theme`, `[data-surface]` e as texturas. Vale igual nos dois artefatos, `dist/sarak.css` e
`dist/sarak-scoped.css`: o escopado herda a ordem do mesmo `sarak-base.css`.

**Quatro regras que a ordem impõe:**
- **Subcamada de `components`, e nunca uma camada de topo nova.** Todo documento com Tailwind v4 já declara
  `theme, base, components, utilities`. Se o CSS do consumidor carrega antes do da lib, uma camada de topo
  nova entra no **fim** da ordem, depois de `utilities`, e volta a vencer toda classe. A subcamada fica antes
  de `utilities` qualquer que seja a ordem de carregamento.
- **Regra que mira elemento nunca vai para `sarak-lib`.** Ali ela venceria toda classe de todo elemento, da lib
  e do consumidor.
- **`!important` fica na camada final.** Para declarações importantes a ordem das camadas se inverte: um
  `!important` na subcamada venceria até a utilitária `!important`; na camada final, ela ainda o vence. É o
  caso do `transform` do botão pressionado.
- **O token que a classe utilitária também escreve é entregue pela variável que ela lê.** As utilitárias de
  borda (`border`, `border-2`, `border-t`…) escrevem `border-style` por `var(--tw-border-style)`, e por isso a
  ponte do `borderStyle` alimenta essa variável. A ponte é o **único** seletor da lib por substring de classe
  (`[class*="border"]`, em `_elements.css`) — aceito porque só entrega `border-style` a quem já escolheu ter
  borda, e mora na subcamada que cede à classe. O raio do botão chega por `.rounded-btn`, que compõe os quatro
  cantos (`btnRadiusTL/TR/BR/BL`) com o raio mestre como reserva de cada um.

**O que ainda não cede à classe:** o **`transform` do botão pressionado** e o **`background-color` do
`body`**, os dois `!important` na camada final por desenho.

**A lib alcança cartão por âncora explícita, nunca por substring de nome de classe.** A superfície e a textura de
cartão sob o tema chegam por três âncoras: `.sarak-card` e `.bg-theme-card` (o cartão completo — superfície,
padding, borda e `clip-path`, no mesmo bloco de `_cards.css`; os componentes da lib que levam `.bg-theme-card`
contam com esse padding e essa borda) e `.card` (só superfície e textura, sob `[data-sx-texture]` ou
`.sarak-design-scope`, sem padding nem borda próprios — é a âncora para o contêiner do consumidor).
Nenhum seletor da lib casa `[class*="card"]`: uma utilitária com `card` no nome — da lib ou do consumidor, como
`bg-[var(--color-theme-card,…)]` — computa o fundo que a própria classe escreve. Contêiner que é cartão de fato
recebe a âncora `card`; controle (campo, botão, menu) não recebe.

**Custom property nunca referencia a si mesma.** As reservas de hover, ativo e foco (`--theme-*-hover`,
`-active`, `-focus`) e a do raio caem numa cor ou num valor que existe **sem** o Design Engine montado; com ele, o
valor que ele injeta no `body` vence a regra. Ciclo é inválido no CSS e anularia a reserva em silêncio.

**A prova é de navegador, não de `jsdom`:** `npm run cromo-css-real:check` (job de CI) mede, em Chromium real
contra o `dist/`, que a classe vence o padrão em raio, hover, família e estilo de borda, e que o padrão continua
sem classe. Os casos "continua sem classe" usam um valor que importa: cantos diferentes do mestre, e o token de
borda fora do default. O mesmo comando roda `browser-tests/css-que-so-o-navegador-mede.spec.ts`: utilitária com
`card` no nome sob textura, hover sem Provider, `body` que cede à classe de entrelinha, valores de estilo inline
dos átomos (frosted, foco, `neumorphism`, switch, intervalo, acordeão) e a seta do `SarakSelect` numa célula que
estica — cada caso com a contraprova de que o padrão sem classe não muda.

# 10. O arsenal visual — o que cada token desenha

**Todo token do schema muda a tela, e a mudança tem leitor.** O painel oferece o controle, o motor emite a
variável e o atributo (§4), e um CSS ou componente da lib os lê. O gate `token-reader:check` cobra isso para o
schema inteiro, sem exceção declarada ([[00-regras-e-invariantes]] R40). Os tokens abaixo são os que exigem
contrato além de "a variável chega à propriedade".

## 10.1 Fundo e atmosfera

- **Gradiente** (`bgGradientMode`: `none` · `linear` (padrão) · `radial` · `mesh`) — `src/styles/_background.css`,
  camada `components.sarak-elements`, pinta o `body` (ou o escopo). `linear` vai do fundo à camada 1 tingida pela
  primária, no ângulo de `bgGradientAngle`; `radial` acende um foco no topo; `mesh` são quatro manchas — primária,
  destaque, `colorBgLayer2` e camada 1. Ordem: tom › gradiente › cor do `body`.
- **Tom do sistema** (`systemTone`: `none` (padrão) · `cyber` · `tactical`) — camada de tom em `_background.css`.
- **Ruído**: um controle só, `bgNoiseDensity` (`--sarak-noise-density`), lido por `NoiseOverlay` e
  `.texture-noise`. `bgNoiseAnimation` anima o grão (padrão 0, estático); para sob `prefers-reduced-motion` e no
  modo de desempenho que corta animação.
- **Vinheta**: `vignetteSoftness` governa a parada transparente do degradê; o padrão reproduz o desenho base.
- **Texturas**: toda textura pinta com a **cor de textura** do tema (`textureColor`, que gera variantes, então
  `--theme-texture-color-rgb` existe). Textura feita de SVG embutido é máscara com `background-color` da cor de
  textura — `var()` dentro de data URI não resolve. O anel de foco (`--theme-primary-focus`) é da primária.

## 10.2 Superfície, moldura e sombra

- **Material** (`surfaceMaterial`: `frosted` (padrão) · `sleek` · `industrial` · `organic`) — `_surfaces.css`,
  sobre os cartões. O desfoque do `frosted` parte de `cardBackdropBlur` e soma a intensidade do material; o
  desfoque do cartão tem um nome só, `--sarak-card-backdrop-blur`.
- **Moldura** (`borderType`: `solid` (padrão) · `cyber` · `double` · `glow` · `none`) — `data-sx-border-type`;
  `cyber` e `glow` nascem da cor de textura; `none` apaga o contorno sem mexer na caixa. `borderStyle` vale no
  cartão.
- **Sombra**: geometria por `cardShadowOffsetX/Y`, `cardShadowBlur`, `cardShadowExpansion` (padrão
  `0 20px 50px -12px`); cor por `shadowColorMode` (`neutral` · `colored` · `ambient`); **direção** por
  `shadowOrientation` (`bottom` (padrão) · `center` · `top` · `bottom-right` · `dynamic`), que só fixa o vetor
  `--sarak-shadow-dir-x/y` consumido pela sombra do cartão e pela sombra em camadas. `dynamic` segue a luz, o
  oposto do ponteiro: o `DesignInjector` escreve `--sarak-light-x/y` no `html` só com a opção ativa; sem ponteiro,
  vale `bottom`.
- **Sombra em camadas** `--sarak-dynamic-shadow` (contato + projeção, `_theme.css`), espelhada em
  `--dynamic-shadow` (lida pela paleta de busca, pela busca do cromo e por `.shadow-theme`). `layeredShadows`
  multiplica a opacidade das duas camadas (0 apaga, 1 é o desenho base).

## 10.3 Cor

`colorDepth` e `colorVariation` dão forma às variantes de interação (`computeColorVariants`): `hover` clareia e
`active` escurece pelo fator `1 ± 0,1 × depth`, e o matiz abre `(variation − 1) × 8°` entre os dois. Em 1/1 a
saída é a de sempre.

## 10.4 Cartão

- **Hover só em cartão interativo.** Interativo é o cartão cuja superfície inteira responde ao ponteiro e traz
  `data-sx-card-interactive="true"`: `SarakTitleCard`, `SarakImageCard` e o `SarakCard` com a prop `interactive`.
  `cardHoverStyle` (`lift` (padrão) · `glow-only` · `expand`) e `cardHoverTranslate` movem só esse; cartão
  contêiner (painel de chat, matriz, `SarakCard` sem a prop) não se move em nenhum valor. `cardHoverGlowIncrease`
  soma ao brilho base no hover. Movimento reduzido e modo de desempenho cortam o movimento.
- Cabeçalho e rodapé (`cardHeader*`, `cardFooter*`), botão de ação (`cardActionBtn*`) e busca do cartão
  (`cardSearch*`) leem os próprios tokens; a classe do consumidor ainda vence ([[03-superficie-publica]] §6.1.1).

## 10.5 Movimento

Uma família só: `motion*` (`motionDurationInstant/Fast/Normal/Slow`, `motionEaseMain/In/Out`,
`motionStaggerDelay`), com unidade no valor emitido (`--duration-*` repassam o valor; multiplicar por `1s`
invalida a declaração). `motionDurationInstant` é o aperto do botão (`:active`); `motionEaseIn` é a saída de
sobreposição (modal, scrim, busca); `motionStaggerDelay` é a cascata de entrada das linhas da tabela e das séries
do gráfico (`useMotionTokens.ts`).

## 10.6 Componentes que leem tokens próprios

Campo (`inputPadding`), tooltip (`tooltipRadius`, `tooltipBg`, `tooltipTextColor`, `tooltipBorderColor`), modal
(`colorBgModal`, `modalOverlayBlur`, `modalOverlayColor`), toast (`zIndexToast`), tabela (`tableZebraStriping`,
`tableBorderRadius`, este pelos quatro cantos como variável do contêiner), botão (`btnGhostHoverBg`,
`btnNeonPulseSpeed`), badge de status (`statusGlowBlur`), nome da marca no cromo (`identityPadding`,
`identityFontFamily` — padrão: a fonte de títulos do tema —, `identityFontWeight`, `identityTracking`), indicador
de "pensando" dos dois chats (`aiGlowColor`), suavização de fonte (`textSmoothing`).

## 10.7 Regras de CSS que o build impõe

- **`backdrop-filter` vai sozinho.** O lightningcss, ao receber `backdrop-filter` e `-webkit-backdrop-filter`
  juntos, publica só a forma com prefixo — que o Chromium não computa. A lib declara só a forma sem prefixo; o
  build gera as duas. `browser-tests/` cobra que nenhuma regra do `dist/sarak.css` traga só a prefixada.
- **Leitor por tabela é declarado.** Quando o valor chega ao leitor por mapa em JS ou direto à propriedade, o
  arquivo do leitor traz `@sarak-token-reader <id> tabela|direto` em comentário, e cada opção tem teste que cita o
  id e o valor ([[01-gates-e-baseline]] §2.2).
