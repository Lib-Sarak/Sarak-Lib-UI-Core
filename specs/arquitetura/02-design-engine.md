---
tipo: "arquitetura"
titulo: "Design Engine — como um objeto design vira tela"
dominio: "Core / Design Engine / Provider"
status: "🟢 Vigente"
tags: ["arquitetura", "design-engine", "provider", "css-variables", "drafting", "escopo", "persistencia"]
relacionados: ["[[04-contrato-de-tokens-e-paridade]]", "[[01-forma-do-produto-e-modos-de-consumo]]", "[[00-mapa-do-modulo]]", "[[05-build-e-distribuicao]]"]
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
| `:102` | `resolveSarakUIMode(options)` → `mode` |
| `:103` | Estado do `scopeElement` (o container da ilha, no modo embarcado) |
| `:107` | `useRegistryManager` → módulos registrados e flag de hidratação |
| `:110-112` | `allThemes = [...GLOBAL_THEMES, ...customThemes]` |
| `:115-123` | **`useDesignManager`** → `design`, `setDesign`, `applyConfig`, `applyFullConfig`, `persistDesign` |
| `:126` | `useBrandingManager` → identidade (opt-in, ver [[006-zero-marca-soberania-host]]) |
| `:129` | `useSarakDrafting(design, applyConfig, applyFullConfig)` → o rascunho (§5) |
| `:136` | `useSarakUIEffects` → efeitos globais de documento (título, fontes) |
| `:140` | `useSarakStylesheetGuard(mode, scopeElement)` → a guarda de stylesheet (§9) |
| `:143-174` | O `useMemo` que monta o contexto público |

A árvore renderizada (`:180-221`): `DeviceProvider` → `UIContext.Provider` → `SarakScopeRoot` → dentro dela `DesignInjector`, `SovereignThemeInjector`, e — **só fora do modo embarcado** — `NoiseOverlay` e `SarakBackgroundRenderer`; por fim `SarakToastProvider` → `SarakOverlayProvider` → `children`.

> Os hosts de toast e overlay são montados **automaticamente**. O consumidor não deve montá-los à mão.

## 3.1 `EMPTY_CUSTOM_THEMES` e o guard — um loop de render infinito REAL

Isto é um padrão a **não repetir**, e o registro existe para que ele não volte.

O sintoma: CPU a 100% e um processo que nunca termina. A causa tinha **duas metades**, e fechar só uma não resolvia:

**Metade 1 — a referência instável.** Um default `customThemes = []` escrito inline no destructuring cria um **array novo a cada render**. Isso invalida o `useMemo` de `allThemes`, que invalida o efeito de sincronização. A correção é a constante `EMPTY_CUSTOM_THEMES` (`:47`), com o motivo escrito ali.

**Metade 2 — o `setDesign` incondicional.** `useDesignSync` chamava `setDesign` sempre que `activeThemeId` estivesse definido, com um objeto novo por spread. React nunca faz bailout por igualdade referencial de objeto, então: render → novo `customThemes` → novo `allThemes` → efeito → `setDesign` → render.

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

**Escrita:** `persistDesign` grava no `localStorage`, aguarda o `onSave` opcional do consumidor, e então chama `onThemeChange` (`useDesignManager:106`). Esta é a porta **"traga sua persistência"** — quem quiser sincronizar no backend *dele* usa o callback; a lib não fala com servidor nenhum.

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
