---
tipo: "spec"
titulo: "Segurança, fronteiras e acessibilidade — o que a lib garante × o que o host deve prover"
dominio: "Sarak-Lib-UI-Core / Segurança / Acessibilidade"
status: "🟢 Vigente"
prioridade: "Máxima"
tags: ["spec", "seguranca", "acessibilidade", "a11y", "fronteira", "sanitizacao", "escopo"]
relacionados: ["[[00-regras-e-invariantes]]", "[[01-gates-e-baseline]]", "[[01-forma-do-produto-e-modos-de-consumo]]", "[[02-design-engine]]", "[[09-temas-e-presets]]", "[[002-remocao-motor-manifesto]]", "[[003-remocao-backend-proprio]]"]
---

# 1. Propósito, e o que MUDOU de superfície hostil

Esta spec responde a duas perguntas, e só a elas: **o que a biblioteca garante** e **o que o host tem
obrigação de prover**. Tudo que não está numa das duas listas é lacuna — e as lacunas conhecidas estão
na §5, nomeadas.

> ## ⚠️ Leia antes de comparar com a spec antiga
>
> `specs/specs/12-modelo-de-seguranca-e-acessibilidade.md` foi escrita quando a lib **executava um
> manifesto JSON autorado por usuário ou por IA**. Aquele motor **não existe mais**
> ([[002-remocao-motor-manifesto]]). Com ele morreram, sem substituto e sem herança:
> **Safe Evaluator, `renderIf`, interpolação escapada `{{ }}`, limites anti-DoS de `renderFor`,
> Dispatcher/`actions` e pipes.** Nenhuma cláusula desta spec pode falar dessas coisas — elas não são
> "garantias que enfraqueceram", são garantias de um produto que foi removido.
>
> **A superfície hostil de hoje é OUTRA, e são duas:**
>
> 1. **O JSON de TEMA** — vindo de `localStorage`, de `customThemes` no código do consumidor, ou de um
>    arquivo exportado e reimportado. É a entrada não-confiável que a lib de fato processa, em todo boot.
> 2. **O CONTEÚDO RICO** — HTML/Markdown que o consumidor entrega aos componentes de mídia e edição.
>
> O que era o Safe Evaluator na spec antiga é, hoje, `validateDesign`. É a garantia central e é onde o
> destaque desta spec fica.

# 2. O que a LIB garante

## 2.1 Tema não-confiável é tratado como dado hostil ⭐

**A garantia central.** Todo `design` — qualquer que seja a origem — atravessa `validateDesign`
(`src/core/Provider/utils/validation.ts:184-238`) antes de virar CSS Variable. Quatro travas:

### a) Domínio de chaves FECHADO

Só entra chave que é token do catálogo (índice construído de `getAllDesignTokens()`, `:19-24`) ou está em
`ALLOWED_EXTRA_KEYS` (`:32-35` — os campos de branding/legado, unidos das duas fontes conhecidas).
Qualquer outra é **descartada com `console.warn`** (`:213`). Não existe caminho "chave desconhecida vira
CSS Variable".

### b) Valor TIPADO pelo contrato do token

`coerceTokenValue` (`:101-132`) decide por `token.type`: número é validado **e clampado** a `min`/`max`
(`:59-65`); `boolean` tem de ser boolean; `select` tem de estar em `constraints.options` (`:114-121`);
cor passa pelo `COLOR_PATTERN`. Fora do contrato → `undefined` → o chamador descarta com warn (`:196-199`).

### c) `CSS_BREAKOUT_PATTERN` — a trava que impede escapar da declaração

```ts
const CSS_BREAKOUT_PATTERN = /[<>{};]/;
```

`validation.ts:37-41`. Nenhum valor de tema pode conter `<`, `>`, `{`, `}` ou `;`. Esses cinco caracteres
são exatamente os que permitiriam **sair de uma declaração `--x: VALOR;`** (via `;`) ou **fechar a tag
`<style>`** que carrega as variáveis (via `<`/`>`). Sem eles, um valor de tema é inerte: o pior que pode
fazer é ser um valor CSS feio.

A checagem é **recursiva** para os campos fora do catálogo tipado (`isSafeExtraValue`, `:76-84`) — array,
objeto aninhado, qualquer profundidade. Não há nível de aninhamento por onde passar HTML cru.

### d) `COLOR_PATTERN` rejeita `url()`

```ts
/^(#[0-9a-fA-F]{3,8}|rgba?\(…\)|hsla?\(…\)|var\(--…\)|transparent|currentColor|inherit|none)$/
```

`validation.ts:43-46`, com o motivo escrito no comentário: **`url()` não tem razão de aparecer num valor
de cor e é vetor clássico de SSRF/injeção.** Um tema hostil não consegue fazer o browser buscar recurso
externo por um token de cor.

> **Por que isto é a garantia central, e não um detalhe:** o tema é o **único** dado que a lib processa
> em todo boot, vindo de um lugar que ela não controla (`localStorage` é gravável por qualquer script da
> origem). Se houvesse uma injeção possível nesta lib, é aqui que ela estaria.

**Alcance honesto:** `validateDesign` é **defesa em profundidade**, não controle de origem. Ela garante
que um tema malformado não injeta nada; **não** garante que o tema veio de quem devia (§3.4).

## 2.2 Sanitização de conteúdo rico — canal único, e uma estratégia melhor

`sanitizeHtml` (`src/core/Security/sanitizeHtml.ts`) é o **único ponto autorizado** a transformar
HTML/Markdown não-confiável em HTML seguro: DOMPurify com `USE_PROFILES: { html: true }` (`:34-41`), com
allowlist opcional de tags/atributos.

**Fail-closed em SSR:** sem `window` ou sem suporte do DOMPurify, `stripAllTags` (`:25`) remove **todas**
as tags e degrada para texto puro. Falha fechada, não aberta.

Os dois consumidores, e eles usam estratégias **diferentes**:

| Componente | Estratégia |
| --- | --- |
| `SarakRichText` (`src/components/atomic/Inputs/SarakRichText.tsx:14,22`) | passa por `sanitizeHtml` com allowlist explícita de tags/atributos |
| `SarakMarkdownRenderer` (`…/Media/SarakMarkdownRenderer/SarakMarkdownRendererImpl.tsx:6-8,27-28`) | **não usa `dangerouslySetInnerHTML` NEM `rehype-raw`** — HTML cru dentro do Markdown é tratado como **texto literal**, e as URLs passam por allowlist de esquema (`SAFE_URL`: `javascript:`/`data:` → href vazio) |

A segunda é mais forte que a primeira: não sanitiza HTML porque **nunca constrói HTML** a partir da
entrada. Vale registrar como padrão preferencial.

### ⚠️ Correção de fato: são CINCO sinks de `<style>`, não um

O cabeçalho de `sanitizeHtml.ts:8-9` diz que "a única exceção conhecida é o `<style>` de `responsiveCSS`
no `DesignScope`". **Isso está desatualizado.** A varredura completa de `dangerouslySetInnerHTML` em
`src/` (excluídos testes) devolve **cinco** usos, e **todos** são `<style>` com CSS gerado pela própria
engine:

| Sink | O que injeta |
| --- | --- |
| `src/core/Design/components/DesignScope.tsx:54` | CSS responsivo do escopo |
| `src/core/Provider/components/DesignInjector.tsx:173` | CSS de escopo do modo embarcado |
| `src/core/Provider/components/SovereignThemeInjector.tsx:116` | bridge de tema soberano |
| `src/features/DesignEngine/Canvas/PreviewCanvas.tsx:181` | CSS do preview |
| `src/features/DesignEngine/Main/MasterControlPanel.tsx:199` | CSS do painel |

**A propriedade de segurança continua válida** — nenhum deles recebe conteúdo externo; todos recebem
string montada pela engine a partir de tokens **já validados** por `validateDesign`. Mas a afirmação "uma
exceção" é falsa, e uma spec que a repetisse estaria mentindo sobre a superfície. **A regra correta é:**
`dangerouslySetInnerHTML` é permitido **exclusivamente** para CSS gerado pela engine; para qualquer
conteúdo de origem externa, o canal é `sanitizeHtml` — sem exceção.

## 2.3 Isolamento — o modo embarcado não vaza

Fonte única do modo e da classe de escopo: `src/core/Provider/scope.ts`.

- **`SARAK_SCOPE_CLASS = 'sarak-scope'`** (`:19`) e a obrigação declarada de casar com o `SCOPE_CLASS` de
  `scripts/build-scoped-css.mjs` — runtime e build **não podem divergir**.
- **Dica de modo lida antes do render:** `data-sarak-ui-mode="embedded"` no `<html>`
  (`SARAK_MODE_ATTRIBUTE`, `:35-39`). O motivo está escrito no código (`:22-33`): a injeção de CSS roda na
  **importação** do módulo, muito antes de o Provider montar; sem a dica, um host já renderizado tomaria
  um **flash** de preflight global.
- **Portais recebem a classe de escopo.** Conteúdo em portal sai da árvore DOM da ilha e vai para o
  `document.body` — o escopo tem de viajar junto. **Verificado um por um:** os **6** componentes que usam
  `createPortal` (`ExpandableCard`, `SarakToast`, `SarakLightbox`, `SarakDrawer`, `SarakContextMenu`,
  `SarakTooltip`) **todos** envolvem o conteúdo em `SarakPortalScope`
  (`src/core/Provider/components/SarakPortalScope.tsx`). `SarakModal` não aparece na lista porque **não
  usa portal**: renderiza `fixed inset-0` na própria árvore (`SarakModal.tsx:88`), logo já está dentro do
  escopo.
- **`@keyframes`, `@font-face` e `@property` permanecem GLOBAIS de propósito.** São registros **sem
  seletor**: não casam com elemento nenhum e não alteram nada do host. Escopar um `@keyframes` é
  impossível sem renomeá-lo, e renomear quebraria a referência dentro do próprio CSS da lib.

**Gates que cobram isso:** `EmbeddedMode.test.tsx` e `scopeCss.test.ts` (`src/core/Provider/__tests__/`)
na suíte; `EmbeddedNoLeak.spec.tsx` (`src/core/Provider/__e2e__/`) é **Playwright** e **exige
`npm run build` antes** — e, como todo E2E aqui, **não roda em automação nenhuma** ([[01-gates-e-baseline]] §2.6).

## 2.4 Acessibilidade — o que é de fato garantido

### a) Foco: nenhum átomo prende foco, exceto overlay aberto

`useFocusTrap` (`src/components/atomic/Modals/hooks/useFocusTrap.ts:25-`) é o modelo transversal dos
overlays (Modal/Drawer/Popover). Ao abrir: salva o elemento focado, foca o primeiro focável (`FOCUSABLE`,
`:14-15`), mantém o `Tab` cíclico preso, fecha no `ESC` — e ao fechar/desmontar **devolve o foco ao
gatilho**.

Um detalhe de implementação que é regra de projeto: **`onClose` fica atrás de um `ref`** (`:31-34`), com o
motivo escrito — se o efeito dependesse da identidade da função, consumidores que passam closure inline
o re-executariam a cada render, reentrando o foco e **perdendo digitação**. É a classe de bug que volta.

### b) Teclado e ARIA

Navegação por `Tab`/`Shift+Tab`/`Enter`/`Espaço`/`ESC` nos componentes interativos, e ARIA nos não-nativos.
**Medido:** `aria-*` aparece em **33 arquivos** de `src/components` + `src/core`; `role=` em **24**;
`aria-current` nos 6 pontos de navegação (`SarakBreadcrumbs`, `SarakPagination`, `SarakShellNav`,
`SarakStepper`, `chrome/navItem.ts`, `SarakAppChrome`); `aria-expanded` no drawer mobile
(`SarakAppChromeMobile`) e nos inputs compostos (`SarakDatePicker`, `SarakMultiSelect`).

**Honestidade sobre o alcance:** isto é cobertura **ampla**, não **auditada**. Não existe gate de a11y —
nenhum `axe`, nenhum teste de árvore de acessibilidade agregado. A cobertura é a que os testes por
componente exercitam. Ver §5.1.

### c) Anel de foco — e a inconsistência real

O token existe: **`focusRingWidth`** (`src/core/Design/schema/engineering.ts:12-20`), slider 0-6px,
default 2, emitindo `--sarak-focus-width`; a própria descrição instrui a **não** reduzir abaixo de 2px
sem motivo validado. O schema que o hospeda chama-se, literalmente, "Acessibilidade e Camadas".

**Mas o token só é honrado em um lugar:**

| Onde o anel é desenhado | Respeita o token? |
| --- | --- |
| `SarakLink` (`src/components/atomic/Navigation/SarakLink.tsx:72`) | ✅ `outlineWidth: 'var(--sarak-focus-width, 2px)'` |
| Regra global de botão (`src/styles/_utilities.css:54-56`) | ❌ `outline: 2px solid …` — **largura fixa** |

Consequência: **mexer em `focusRingWidth` muda o anel dos links e não muda o dos botões.** Um consumidor
que aumentar o anel por necessidade de acessibilidade vai vê-lo aumentar em parte da interface.

Agravante estrutural: essa regra vive em `src/styles/*.css`, e `src/styles/` **não é varrido como
consumidor** por nenhum auditor ([[01-gates-e-baseline]] §4.3a) — nem o hardcode nem o não-consumo do
token aparecem em gate. **Documentado, não corrigido** (esta spec não altera código).

### d) Contraste — o que a lib faz, e o que ela NÃO promete

**Não existe garantia de contraste WCAG AA verificada.** Não há cálculo de razão de contraste, nem teste,
nem gate. O que existe é:

- **Orientação de autoria** nas descrições dos tokens de cor ("deve manter contraste alto contra X" —
  `schema/buttons.ts:145`, `schema/card-title.ts:27`, `schema/card-action.ts:34`, `schema/card-search.ts:32,41`;
  `schema/typography.ts:104` cita WCAG nominalmente).
- **Uma heurística de luminância** no `color-engine.ts` que reposiciona claridade por papel (fundo/texto/
  borda) ao derivar o modo claro, incluindo um **boost de opacidade** para texto translúcido no claro,
  com "legibilidade (WCAG)" como motivo escrito (`src/core/Provider/utils/color-engine.ts:126-129`).

**Por que a lib não pode prometer AA:** o tema é **dado do consumidor** (§[[09-temas-e-presets]]). Ele
pode declarar texto cinza-claro sobre fundo branco, e a lib vai obedecer — obedecer ao tema é a função
dela. Prometer AA exigiria a lib **recusar** valores do consumidor, o que contradiz o contrato de tema.
Uma auditoria de contraste é possível (calcular a razão dos pares shippados e avisar), mas **não
existe hoje** — §5.2.

# 3. O que o HOST deve prover — a fronteira, explicitamente

## 3.1 Autenticação e sessão

**A lib NÃO autentica ninguém.** `SarakAuthScreen`
(`src/components/atomic/Templates/SarakAuthScreen.tsx`) **renderiza a tela de acesso**: é um componente
React autocontido — campos e alternância de modo (login/registro/MFA) funcionam em **estado interno**, e
**todos** os pares `value`/`setValue` são opcionais, então o host pode controlar o que quiser
(`:53-58`, com o motivo escrito). Os dados de interação saem por callbacks/`onChange`
(`SarakAuthScreenEvent`, `:11-18`).

**O que é 100% do consumidor:** provider de identidade, emissão e validação de token, onde o token mora,
refresh, expiração, redirect de 401, logout.

**A mudança real, e ela é BREAKING silenciosa:** dois hooks legados leram token de `localStorage` num
esquema de chaves fixo, e **foram removidos**. Quem dependia da injeção automática de `Authorization`
deixou de tê-la sem erro de compilação — o request simplesmente vai sem o header. O cliente HTTP dos
templates (`src/shared/services/api.ts:1-25`) declara isso no cabeçalho: **não injeta `Authorization`
sozinho**; quem precisa de request autenticado compõe o header no ponto de chamada.

**Estado verificado hoje** (varredura desta entrega, `src/` sem testes):

| Verificação | Resultado |
| --- | --- |
| SDK de auth importado (`supabase`, `cognito`, `keycloak`, `firebase/auth`, `@auth0`) | **0 ocorrências** ✅ |
| Token lido de storage | **0 ocorrências** ✅ — os usos de `localStorage` em `src/` são persistência de **tema** (`useDesignManager`, `useDesignSync`, `useDesignStorageSync`) e idioma (`Controls.tsx:26,30`) |

> ### ⚠️ A propriedade é verdadeira e NÃO é guardada
>
> `plan/20-fronteira-de-autenticacao.md` §2.3 previu um **gate anti-acoplamento** e o critério de aceite
> foi marcado concluído ("2 violações reais achadas e corrigidas"). **Esse gate não existe no
> repositório**: não há script em `scripts/`, não há `AuthCouplingGate.test.ts`, não há varredura em
> `run_audit`. O `AuthFlow.integration.test.tsx` citado no mesmo plano também não existe — morreu com o
> motor de manifesto, que era o que ele exercitava.
>
> Ou seja: hoje **nada impede** um PR de reintroduzir leitura de token ou um SDK de auth em `src/`. A
> correção de 2026-07-19 foi feita; a **trava** que a manteria, não. Registrado em §5.3.

## 3.2 Rede

A lib **nunca chama a rede por conta própria** e **nunca embute segredo**. O cliente axios de
`src/shared/services/api.ts` existe para os hooks de dados dos templates pesados e fixa `baseURL = '/api'`
(`:20-24`) — quem chama é o componente que o consumidor montou, com os dados que ele passou. Não há
telemetria, não há phone-home, não há endpoint da lib (o backend próprio foi removido —
[[003-remocao-backend-proprio]]).

## 3.3 Roteamento

**No modo ui-kit (#3):** a lib reage à rota; o host é dono da URL. O cromo apresentacional entrega a
seleção por callback (`onNavigate`) e **não navega** — ver [[05-cromo-e-slots]].

**No modo Shell-host (#1) isto é diferente, e a spec antiga simplificava:** `useSarakRouter`
(`src/shared/hooks/useSarakRouter.ts:37-57`) **escreve na URL** — `history.pushState`/`replaceState` +
dispatch manual de `popstate`. O módulo ativo do Shell **é** o primeiro segmento do path
(`useSarakShell.ts:14`). Portanto: **no modo Shell-host a lib controla a URL**, e um host que já tenha
router próprio na mesma página vai disputar o `history` com ela. Não é bug — é o contrato do modo #1 (a
lib é o host). Mas tem de estar escrito, porque "a lib nunca controla a URL" é falso. Ver
[[04-shell-e-discovery]].

## 3.4 Origem, CSP e CORS

**Validar de onde vem um JSON de tema é do host.** A validação da §2.1 é defesa em profundidade: ela
impede que um tema faça mal, não atesta procedência. Se o host aceita tema de fonte externa, a
verificação de origem/integridade é dele.

Sobre CSP: a lib injeta `<style>` (as cinco fontes da §2.2) e, no modo app, `<link>` de webfont do Google
(`useSarakUIEffects`) — um host com CSP restritiva precisa permitir esses dois, ou usar
`mode: 'embedded'` sem `injectGlobalFonts` (default `false` no embarcado, `types.ts:137-144`).

## 3.5 Persistência

`onThemeChange` (`types.ts:246`) e `persistence.onSave`/`onLoad` (`:153-166`) são as portas. **A lib não
sincroniza com servidor nenhum** — o default é `localStorage`, e sincronizar com backend é código do
consumidor, chamado pelo callback dele.

# 4. Regras derivadas (o que fazer / o que nunca fazer)

1. **Todo dado externo que virar CSS passa por `validateDesign`.** Um caminho novo que aplique design sem
   validar é defeito, mesmo que o dado "venha de dentro" — ver a lacuna §5.4.
2. **Conteúdo externo que virar HTML passa por `sanitizeHtml`.** `dangerouslySetInnerHTML` é permitido
   **só** para CSS gerado pela engine (§2.2).
3. **Overlay novo usa `useFocusTrap`.** Não reimplemente armadilha de foco.
4. **Portal novo envolve em `SarakPortalScope`.** Sem isso o modo embarcado vaza estilo — e o vazamento
   aparece só no consumidor embarcado, nunca no desenvolvimento em modo app.
5. **A lib nunca lê nem escreve token de autenticação.** Nem "por conveniência", nem "só no template".
6. **A lib nunca escreve identidade da página sem opt-in** — ver [[08-identidade-do-host-e-zero-marca]].

# 5. Lacunas conhecidas (nomeadas, não corrigidas aqui)

| # | Lacuna | Consequência | Onde |
| --- | --- | --- | --- |
| **5.1** | **Nenhum gate de a11y.** Não há `axe`, nem teste de árvore de acessibilidade agregada. A cobertura é a dos testes por componente | uma regressão de ARIA/foco passa se o teste daquele componente não a cobrir | — |
| **5.2** | **Contraste não é medido** (§2.4d) | a lib não sabe dizer se os 18 temas shippados passam AA | `color-engine.ts` tem a heurística; falta a régua |
| **5.3** | **O gate anti-acoplamento de auth não existe** (§3.1) | a propriedade "zero auth em `src/`" é verdadeira hoje e não é defendida | `plan/20` §2.3 previu; nada implementa |
| **5.4** | **`PreviewCanvas` aplica design SEM `validateDesign`** — o boot real valida, o caminho de preview não | valor fora do contrato virava CSS Variable literal no preview; foi o que expôs o drift de 21 tokens | `plan/40.4` §Nota; ver [[06-painel-de-customizacao-e-preview]] |
| **5.5** | **`AdvancedTab` chama `localStorage.clear()`** (`src/features/DesignEngine/Panels/AdvancedTab.tsx:17-25`) — apaga **toda** a origem, não só as chaves da lib, e em seguida dá `window.location.reload()`. O `confirm()` promete "restaurar TODAS as configurações **visuais**" | num host que guarda sessão/carrinho/rascunho em `localStorage`, um "reset visual" apaga **os dados do host**. Grave no modo embarcado, onde a ilha não é dona da página | ver [[06-painel-de-customizacao-e-preview]] |
| **5.6** | **`focusRingWidth` não é honrado pela regra global de foco** (§2.4c) | anel de foco muda em link e não em botão | `src/styles/_utilities.css:54-56` |
| **5.7** | **E2E de isolamento não roda em automação** — `EmbeddedNoLeak.spec.tsx` exige build e execução manual | a garantia mais difícil de manter (não-vazamento) é a menos exercitada | [[01-gates-e-baseline]] §2.6 |

**Nenhuma delas é corrigida por esta spec** — ela só escreve código-documento. As 5.5 e 5.6 são as duas
que eu recomendaria priorizar: são pequenas, locais, e a 5.5 tem impacto em dado do consumidor.

# 6. Critérios de aceite

- [x] Cada garantia aponta o arquivo (com linha) que a implementa.
- [x] Nenhuma cláusula fala de manifesto, `renderIf`, Safe Evaluator, `renderFor`, Dispatcher ou pipes.
- [x] Nenhuma garantia foi afirmada sem prova no código — as três que o material-fonte afirmava e o
      código não sustenta (gate de auth, contraste AA, "uma única exceção de `innerHTML`") aparecem como
      **correção** ou **lacuna**, não como garantia.
- [x] A fronteira host × lib está declarada item a item, incluindo o caso em que a lib **controla** a URL.
- [x] As 7 lacunas têm dono e caminho.

# 7. Plano de testes (Quality Gate)

| Verificação | Onde | Roda em automação? |
| --- | --- | --- |
| `validateDesign` descarta chave/valor fora do contrato | `src/core/Provider/utils/__tests__/validation.test.ts` | ✅ suíte |
| Nenhum valor shippado fora do contrato | `…/__tests__/tokenContractParity.test.ts` | ✅ suíte |
| `sanitizeHtml` neutraliza `<script>`/`on*`/`javascript:` | `src/core/Security/__tests__/sanitizeHtml.test.ts` | ✅ suíte |
| Modo embarcado não escreve fora do container | `src/core/Provider/__tests__/EmbeddedMode.test.tsx` | ✅ suíte |
| CSS escopado gera seletor correto | `src/core/Provider/__tests__/scopeCss.test.ts` | ✅ suíte |
| Portal leva a classe de escopo | `src/core/Provider/components/__tests__/SarakPortalScope.test.tsx` | ✅ suíte |
| Armadilha de foco, ESC e restauração | `src/components/atomic/Modals/hooks/__tests__/useFocusTrap.test.tsx` | ✅ suíte |
| Jornada só-teclado num overlay | `src/components/atomic/Modals/__tests__/keyboardJourney.test.tsx` | ✅ suíte |
| Não-vazamento em página real | `src/core/Provider/__e2e__/EmbeddedNoLeak.spec.tsx` | ❌ **manual**, exige `npm run build` |

**A implementar (backlog, não desta spec):** gate de a11y (5.1), auditoria de contraste dos temas
shippados (5.2), gate anti-acoplamento de auth (5.3).
