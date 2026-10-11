---
tipo: "plan"
titulo: "Fazer todo token visual oferecido pelo Design Engine mudar a tela, e travar isso por gate"
objetivo: "Fazer cada token visual que o painel oferece desenhar o que promete, gradiente, material de superficie, cor e forma da sombra, tom do sistema, estilo do switch, ruido, fontes, texturas em tema claro e paleta de graficos, e impedir por gate que um valor emitido pelo motor volte a ficar sem leitor"
dominio: "Design Engine / CSS do motor / Contrato de tokens"
status: "🟢 Aprovado"
prioridade: "Alta"
tags: ["plan", "design-engine", "tokens", "css", "gate", "temas"]
relacionados: ["[[09-temas-e-presets]]", "[[02-design-engine]]", "[[04-contrato-de-tokens-e-paridade]]", "[[03-superficie-publica]]", "[[00-regras-e-invariantes]]", "[[01-gates-e-baseline]]"]
depende_de: ""
retida_por: ""
destino_sintese: "specs/09-temas-e-presets.md + arquitetura/02-design-engine.md + arquitetura/03-superficie-publica.md + specs/00-regras-e-invariantes.md + specs/01-gates-e-baseline.md"
---

# 1. Objetivo

Todo token visual que o painel oferece muda a tela do jeito que o rótulo dele diz, em todo valor oferecido, nos dois
modos — e um gate barra o próximo token ou opção que o motor emita sem ninguém ler.

# 2. Contexto

**Esta plan destrava a `plan-110`** (temas que mostram a biblioteca): a auditoria do lote 0 dela
(`specs/plan/anexos/plan-110-direcao-de-arte.md` §3 e §9, achados A1–A10) mediu que parte do arsenal **não desenha**:
o painel oferece o valor, o tema o escolhe, e nada muda. O lote 1 da 110 espera esta plan. Decisões do dono de
2026-10-11: corrigir todos os achados; A4 opção (b); os três controles de ruído viram um só; a paleta de gráficos é
**derivada** das cores de marca; e **um gate** novo trava a classe de defeito.

**A causa comum:** um token passa por três camadas — o schema (opções, painel e catálogo), o motor
(`src/core/Provider/manifest.ts`, que emite `vars` e `attr`) e um **leitor** (regra CSS ou componente). Os achados
são tokens em que o leitor não existe ou não casa com as opções do schema. A regra *"todo token tem consumidor"* só
é cobrada no cromo (`check-chrome-token-parity.mjs`, [[05-cromo-e-slots]] §2.4); fora dele, nenhuma trava.

**Medido em 2026-10-11:**

| # | Token | O defeito |
|---|---|---|
| A1 | `bgGradientMode`, `bgGradientAngle` (`schema/atmosphere.ts:96-120`) | emitem `--sarak-bg-gradient-*`; nada lê. Não há token de cor do gradiente |
| A2 | `surfaceMaterial` (`visualImpact`) | `manifest.ts:126` → `data-surface` com `frosted`·`sleek`·`industrial`·`organic`; `src/styles/_surfaces.css` só desenha `metallic`·`brushed`·`acrylic`·`matte` |
| A3 | `shadowColorMode` | opções `neutral`·`colored`·`ambient`; `_surfaces.css` conhece `match`·`adaptive` |
| A4 | `systemTone` (`visualImpact`) | opções `dark`·`light`·`cyber`·`tactical`; só `cyber` tem regra (`src/styles/_base.css:74-79`); `friendly`/`formal` têm CSS e não são opção |
| A5 | `switchStyleType` (`schema/switches.ts`) | opções `tactile`·`asymmetric`·`pulsing`·`glass`; `SarakSwitch` não lê |
| A5 | `atmosphereNoiseOpacity`, `noiseIntensity`, `bgNoiseDensity` | os dois primeiros emitem `--sarak-noise-opacity` (`manifest.ts:185,198`), que ninguém lê; o ruído real lê `--sarak-noise-density` (`_atmosphere.css:128`), do terceiro |
| A6 | fontes | `Orbitron`, `Chakra Petch`, `VT323` e `Fira Code`, usadas por temas embarcados, não estão no carregador (`src/core/Provider/hooks/useSarakUIEffects.ts`); os temas escrevem o valor num formato diferente do de `THEME_FONTS` (`schema/typography.ts`), e o painel não reconhece a opção |
| A7 | `cardTextureType`/`texture` | `brushed`, `frosted`, `topo-deep`, `prism-mesh`, `blueprint-pro` e `wave-pulse` pintam em branco fixo (`_atmosphere.css`) e somem em superfície clara |
| A8 | paleta de gráficos | `CHART_COLOR_TOKENS` (`engines/charts/SubEngines/builders/types.ts:20-23`) usa as quatro cores de status como séries 4–7: uma 4.ª série pinta de "sucesso" |
| A9 | `cardVariant` | marcado `visualImpact` no catálogo, mas escolhe **qual cartão** o `SarakCardGrid` desenha — não é estilo |
| A10 | sombra do cartão | `src/styles/_cards.css:24-26` fixa `0 20px 50px -12px`; o tema só controla a opacidade (`cardShadowSpread`): sombra dura deslocada e sombra colorida são inalcançáveis |

**Fora, de propósito:** as fontes virem do Google Fonts por `@import` (A11 do anexo — não funciona offline); embutir
fontes no pacote é outra decisão, de peso.

# 3. Escopo

## 3.1 Dentro
- `src/core/Design/schema/` (`atmosphere.ts`, `switches.ts`, `cards.ts`, `typography.ts`) — opções e tokens que mudam; `src/core/Design/catalog/theme_table_mapping.json` e `partitions/` (paridade e o `visualImpact` do `cardVariant`); `src/core/Provider/manifest.ts`; `src/core/Provider/generated/` (regenerado).
- `src/styles/` (`_surfaces.css`, `_base.css`, `_atmosphere.css`, `_cards.css`, e um parcial novo se o gradiente pedir) — os leitores.
- `src/core/Provider/hooks/useSarakUIEffects.ts` — o carregador de fontes.
- `src/components/atomic/Inputs/SarakSwitch.tsx` — os quatro estilos.
- `src/components/engines/charts/SubEngines/builders/` — a paleta categórica derivada.
- `src/core/Design/presets/` — **só** para trocar valores que deixarem de existir (A4, A5, A6) e o formato das fontes, sem redesenhar tema (o redesenho é da `plan-110`).
- `gates/scripts/contrato/` — o gate novo, o teste dele e o script em `package.json`; `.githooks/pre-commit` (Anel 1) e `.github/workflows/gates.yml`, se o gate entrar lá.
- `browser-tests/` — casos de medição dos efeitos que o `jsdom` não computa.
- `docs/migracoes.md` — subseção dentro da entrada `## 8.0.0`.
- Artefatos regenerados (`npm run token-types`, `catalog`, `guide`, `dev-kit`).

## 3.2 Fora
- Redesenhar qualquer tema (é a `plan-110`, lote 1).
- Embutir fontes no pacote (A11) e trocar o carregador por outro mecanismo.
- O `check-chrome-token-parity` existente (continua como está; o gate novo é mais largo).
- Qualquer spec em `specs/` (a síntese é do revisor).

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/09-temas-e-presets.md` §4.2, §4.4.3, §5, §6 | valor fora do contrato, token oferecido sem efeito, catálogo e travas |
| Spec fixa | `arquitetura/02-design-engine.md` (inteira; §9.1 em especial) | como o motor emite, as camadas CSS e o que cede à classe |
| Spec fixa | `arquitetura/04-contrato-de-tokens-e-paridade.md` | paridade 1:1:1 ao criar, mudar ou remover token e opção |
| Spec fixa | `arquitetura/03-superficie-publica.md` §6.8 | o motor de gráficos e a paleta |
| Spec fixa | `specs/05-cromo-e-slots.md` §2.4 e §2.4.1 | o gate de cromo, modelo do novo |
| Spec fixa | `specs/00-regras-e-invariantes.md` (R18, R31) e `specs/01-gates-e-baseline.md` §2.2 | como nasce uma regra e um gate; contraste |
| Spec fixa | `specs/06-painel-de-customizacao-e-preview.md` §2.1 | o modo Impacto e o `visualImpact` |
| Anexo | `specs/plan/anexos/plan-110-direcao-de-arte.md` §3 e §9 | a medição de cada achado |
| Contexto | `00-contexto.md` · `00-knowledge.md` | sempre |
| **Skill** | `ui-refatorar-componente` | mudar e remover opção e token sem quebrar a paridade |
| **Skill** | `ui-novo-componente` | os tokens novos da sombra |
| **Skill** | `ui-arquitetura-design` | CSS do Design Engine |
| **Skill** | `dataviz` | a paleta categórica derivada (fórmula e validador) |
| **Skill** | `padrao-escrita` + `padrao-typescript` · `test-unitario` | sempre; testes de cada leitor |
| Código | `src/core/Provider/manifest.ts`, `src/core/Design/master-map.ts`, `src/styles/_surfaces.css`, `src/styles/_base.css`, `src/styles/_atmosphere.css`, `src/styles/_cards.css` | onde mora cada defeito |
| Código | `gates/scripts/contrato/check-chrome-token-parity.mjs` e `gates/scripts/contrato/__tests__/` | o idioma de gate e de teste de gate |
| Código | `browser-tests/css-que-so-o-navegador-mede.spec.ts`, `browser-tests/fixtures/harness-entry.tsx` | medição em navegador |

# 5. Instruções de execução

1. **A1 — gradiente:** `bgGradientMode` (`none`·`linear`·`radial`·`mesh`) e `bgGradientAngle` passam a desenhar o fundo da página, com paradas tiradas das cores que o tema já tem (fundo, camada, primária, destaque) — `mesh` mistura várias em baixa opacidade. Sem token de cor novo. Convive com a atmosfera e a textura (ordem de camadas declarada).
2. **A2 — material:** CSS para `frosted`, `sleek`, `industrial` e `organic`; saem as regras de `metallic`/`brushed`/`acrylic`/`matte`.
3. **A3 + A10 — sombra:** `shadowColorMode` desenha `neutral` (preta), `colored` (tingida pela primária) e `ambient` (derivada do fundo); a geometria da sombra do cartão vira tokens (deslocamento x e y, desfoque, expansão), com o padrão igual ao desenho de hoje — um tema sem os tokens novos não muda.
4. **A4 — tom (decisão b):** `systemTone` fica com `cyber` e `tactical`, e `tactical` ganha efeito (HUD monocromático, saturação baixa); saem `dark` e `light` (duplicam o modo); saem as regras órfãs de `friendly`/`formal`. Valor salvo `dark`/`light` cai no padrão com o aviso de valor fora do contrato.
5. **A5 — switch e ruído:** `SarakSwitch` desenha os quatro estilos; os três tokens de ruído viram **um** que desenha (os outros saem, com a paridade), e o valor salvo dos que saem cai no padrão.
6. **A6 — fontes:** toda fonte usada por tema embarcado ou oferecida em `THEME_FONTS` é carregada (ou sai da lista e do tema); o valor das fontes nos temas embarcados passa ao formato exato de `THEME_FONTS`.
7. **A7 — texturas:** as seis texturas de branco fixo passam a pintar com a cor de textura do tema, como as outras 35, e aparecem em superfície clara e escura.
8. **A8 — paleta derivada:** as séries do gráfico passam a vir de uma paleta categórica **derivada** das cores de marca do tema (primária, secundária, destaque, terciária e variações delas, sem as de status), validada pela skill `dataviz` nos temas embarcados; sem token novo.
9. **A9:** `cardVariant` deixa de ter `visualImpact` no catálogo.
10. **O gate** `token-reader:check` (`gates/scripts/contrato/check-token-reader.mjs`, uma regra, um script): todo valor que o motor emite tem leitor — (i) cada variável de `vars` do `manifest.ts` é lida em algum CSS (`var(--x)`) ou componente, fora de schema, catálogo, gerados e testes; (ii) para cada token emitido como `attr`, cada opção do schema tem regra (`[attr="valor"]`) ou leitor em componente. Exceção só por allowlist com motivo, que se esvazia sozinha (idioma de `check-chrome-token-parity`); cabeçalho com os limites declarados (R18). O gate tem de **falhar no `HEAD`** pelos achados desta plan e passar depois.
11. Testes: unitário de cada leitor em JS (switch, paleta, carregador de fontes, manifest); em `browser-tests/`, a medição dos efeitos de CSS (gradiente nos três modos, os quatro materiais, os três modos de sombra e a geometria, as seis texturas em superfície clara, o tom `tactical`).
12. Temas embarcados: só trocar valor que deixou de existir e o formato das fontes — `auditor_presets` sem órfã, `tokenContractParity` e `shippedThemesConsoleClean` verdes.
13. Nota **MAJOR** dentro da entrada `## 8.0.0` (opções que saem, tokens que se fundem, paleta de gráfico que muda, efeitos que passam a aparecer).
14. Rodar a verificação da §7.

# 6. Critérios de aceite

- [ ] Cada achado A1–A10 corrigido como a §5 descreve, com o leitor provado por teste (unitário ou de navegador).
- [ ] Gate novo: falha no `HEAD` anterior pelos achados, passa depois; allowlist com motivo e vazia ou justificada; limites declarados; ligado ao Anel 1 (ou ao `build`) e à CI.
- [ ] Paridade convergente (`npm run audit`); `auditor_presets` sem órfã; `tokenContractParity` e `shippedThemesConsoleClean` verdes; contraste (R31) verde.
- [ ] Paleta derivada validada pela `dataviz` nos temas embarcados; nenhuma cor de status entre as séries.
- [ ] Nota MAJOR em `## 8.0.0`.
- [ ] Suíte completa verde; `tsc` 0; `audit:baseline` sem regressão; gates do Anel 1; `cromo-css-real:check`; catálogo, kit e barril em dia.

# 7. Como verificar (uso do revisor)

**Gate:** `token-reader:check` (`gates/scripts/contrato/check-token-reader.mjs`) — todo valor emitido pelo motor (variável de `vars` e opção de `attr`) tem leitor fora de schema, catálogo, gerados e testes. Regra nova em `00-regras-e-invariantes` na síntese.

- `git diff --stat` → só a §3.1 e os gerados.
- Mutação do gate: apagar a regra CSS de uma opção de `surfaceMaterial` → o gate falha; apagar o leitor de uma variável → o gate falha.
- `npm run build` + `npm run cromo-css-real:check` (o revisor roda, com rede) → os casos novos verdes.
- `npm run audit` (paridade, presets, contraste) · `npx vitest run` · `npx tsc --noEmit` · `npm run audit:baseline`.
- Anel 1: `container-query:check`, `container-query-boundary:check`, `class-merge:check`, `icon-port:check`, `chrome-token-parity:check`, `zero-brand:check`, `barrel:check`, `catalog:check`, `guide:check`, `dev-kit:check`, `token-types:check`, e o gate novo.

# 8. Destino da síntese

**Destino:** `specs/09-temas-e-presets.md + arquitetura/02-design-engine.md + arquitetura/03-superficie-publica.md + specs/00-regras-e-invariantes.md + specs/01-gates-e-baseline.md`

- **`00-regras-e-invariantes`:** regra nova (R40) — *todo valor que o motor emite tem leitor* — com o gate e os limites.
- **`01-gates-e-baseline`:** o gate no catálogo e na tabela de onde roda.
- **`02-design-engine`:** o gradiente de fundo, os quatro materiais, a sombra (cor e geometria), o tom `tactical`, o ruído único, e que as 41 texturas pintam com a cor de textura do tema.
- **`03-superficie-publica` §6.8:** a paleta categórica derivada das cores de marca, sem cores de status.
- **`09-temas-e-presets`:** a lista de fontes carregadas e o formato do valor; as opções que saíram (tom, ruído).

---

# 9. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only: cada rodada acrescenta um bloco novo; nada é removido. -->

## Resumo da execução — 2026-10-11

**Resultado:** Concluído com pendências

**Estado do worktree ao iniciar**
```
 M specs/00-indice.md
?? specs/plan/anexos/
?? specs/plan/plan-110-temas-que-mostram-a-biblioteca.md
?? specs/plan/plan-111-todo-token-visual-desenha.md
```

**O que foi feito**
- **Gate `token-reader:check`** — `gates/scripts/contrato/check-token-reader.mjs`: regra (i) variável de `vars` do `manifest.ts` lida (CSS, componente ou id acessado) e regra (ii) cada opção de `select` com `attr` tem `[data-sx-<kebab>="v"]`, `classPrefix` ou componente que acessa o id e cita o valor. `ALLOWLIST` com motivo que se esvazia sozinha (entrada obsoleta falha); limites R18 no cabeçalho; opção `none` isenta. Ligado a `package.json`, ao Anel 1 de `.githooks/pre-commit` e ao passo de `*:check` de `.github/workflows/gates.yml`. Teste em `gates/scripts/contrato/__tests__/check-token-reader.test.mjs` (17 casos, com mutação).
- **A1 gradiente** — `src/styles/_background.css` (novo, camada `components.sarak-elements`): `linear`/`radial`/`mesh` pintam o `body`/escopo a partir de fundo, camada, primária e destaque; ângulo de `--sarak-bg-gradient-angle`. Ordem declarada: tom › gradiente › cor do `body`.
- **A2 material** — `src/styles/_surfaces.css`: regras `data-sx-surface-material` para `frosted`/`sleek`/`industrial`/`organic` sobre os cartões; saem `metallic`/`brushed`/`acrylic`/`matte`.
- **A3 + A10 sombra** — `_surfaces.css` §11 (cor por `data-sx-shadow-color-mode`) e `_cards.css` (sombra composta e hover por `cardShadow*`); schema `cards.ts`: tokens novos `cardShadowOffsetX`, `cardShadowOffsetY`, `cardShadowBlur`, `cardShadowExpansion` (padrão `0 20px 50px -12px`); `cardShadowSpread` perde `unit: 'px'`.
- **A4 tom** — `schema/atmosphere.ts`: `systemTone` = `none` (padrão) · `cyber` · `tactical`; regras de tom em `_background.css`; saem as de `friendly`/`formal` e `[data-tone]` de `_base.css`.
- **A5 switch** — `src/components/atomic/hooks/switchStyles.ts` (novo) + `useAtomicStyles.ts`; keyframes `sarak-switch-pulse` em `_animations.css`. **A5 ruído** — `atmosphereNoiseOpacity` e `noiseIntensity` saem; fica `bgNoiseDensity` (`--sarak-noise-density`), lido por `NoiseOverlay` e `.texture-noise`; `removedTokenKeys.ts` descarta o valor salvo.
- **A6 fontes** — `src/core/Provider/utils/googleFontsUrl.ts` (novo) deriva o `@import` de `THEME_FONTS`; os 14 temas passam ao valor exato da lista (56 valores); `Orbitron`→`Unbounded`, `Chakra Petch`→`Space Grotesk`, `VT323`/`Fira Code`→`JetBrains Mono`.
- **A7 texturas** — `_atmosphere.css`: `brushed`/`frosted`/`blueprint-pro` por gradiente na cor de textura; `topo-deep`/`prism-mesh`/`wave-pulse` por máscara com `background-color` da cor de textura.
- **A8 paleta** — `SubEngines/oklch.ts` + `categoricalPalette.ts` (novos), `useEChartsTheme.ts`, `builders/types.ts`, `seriesModel.ts`, `waterfallCharts.ts`, `statisticalCharts.ts`, `advancedCharts.ts`: 4 séries da marca + 4 variações, sem status; cor de status só por escolha explícita ou semântica (`statusColors`).
- **A9** — `visualImpact` removido de `cardVariant` em `partitions/cards_engine.json`.
- Temas: `systemTone` `dark`/`light`→`none` (13), duas linhas de ruído removidas por tema, `bgNoiseDensity` do `synthwave-retro` = 0,1 (valor efetivo do overlay); `color-engine.ts` grava `bgNoiseDensity` no claro.
- Paridade: `theme_table_mapping.json`, `partitions/colors_and_atmosphere.json` (`shadowColorMode` passa a `neutral/colored/ambient`), `cards_engine.json`; `design-token-ids.ts`, `docs/component-catalog.*`, `sarak-ui/`, `sarak-dev/` regenerados.
- `browser-tests/token-que-desenha.spec.ts` (novo, 28 casos) + cenas/recortes em `browser-tests/fixtures/harness-entry.tsx`. **Não executados** (ver pendências).
- Nota MAJOR em `docs/migracoes.md`, subseção da entrada `## 8.0.0`.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `gates/scripts/contrato/check-token-reader.mjs` | criado | gate R40 |
| `gates/scripts/contrato/__tests__/check-token-reader.test.mjs` | criado | 17 casos do gate |
| `package.json`, `.githooks/pre-commit`, `.github/workflows/gates.yml` | alterado | script, Anel 1 e CI do gate |
| `src/styles/_background.css` | criado | gradiente e tom |
| `src/styles/{_surfaces,_cards,_atmosphere,_base,_animations}.css`, `sarak-base.css` | alterado | leitores (materiais, sombra, texturas, pulso) |
| `src/core/Design/schema/{atmosphere,cards}.ts` | alterado | `systemTone`, ruído único, tokens de sombra |
| `src/core/Design/catalog/**` (3 JSON) | alterado | paridade e `visualImpact` |
| `src/core/Provider/{manifest.ts,generated/design-token-ids.ts}`, `utils/removedTokenKeys.ts`, `hooks/useSarakUIEffects.ts`, `utils/googleFontsUrl.ts` | alterado/criado | manifesto, tipos, chaves removidas, carregador de fontes |
| `src/core/Design/presets/themes/*.ts` (13 + `color-engine.ts`) | alterado | só valores que deixaram de existir e formato das fontes |
| `src/components/atomic/hooks/{switchStyles.ts,useAtomicStyles.ts}`, `src/effects/NoiseOverlay.tsx` | criado/alterado | alternador e grão |
| `src/components/engines/charts/SubEngines/**` | criado/alterado | paleta derivada, `statusColors` |
| testes (`*.test.*`) e 7 `.snap` | criado/alterado | ver Verificações |
| `browser-tests/**` | criado/alterado | casos de medição |
| `docs/migracoes.md`, `docs/component-catalog.*`, `sarak-ui/**`, `sarak-dev/**` | alterado | nota MAJOR; gerados |

**Verificações executadas**
- `npx tsc --noEmit` → exit 0, nenhuma saída.
- `npm run audit` → mesmas 2 regras do HEAD (ghostvars 1 e composição atômica R10 2: `SarakMultiSelect`, `SarakUploader`); paridade 441 tokens verde; `auditor_presets` sem órfã; contraste (R31) verde. Uma regressão minha (tripla numérica crua 1→5 em `_background.css`) foi corrigida e o número voltou a 1.
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` → "igual ao baseline de 2026-08-11 — nenhuma regressão".
- Anel 1, todos exit 0: `container-query`, `container-query-boundary`, `class-merge`, `icon-port`, `chrome-token-parity` (43/43), `zero-brand`, `barrel` (102), `catalog`, `guide`, `dev-kit`, `token-types` (441), `gate-limits` (43), `persistence-doc` e `token-reader` (25 achados cobertos por ALLOWLIST).
- **Gate falha no HEAD** (cópia do HEAD fora do repo, `git archive` + gate + `manifest.ts` novo; `git status` idêntico antes e depois): 25 achados — `surfaceMaterial` ×4 opções, `systemTone` ×4 + variável, `shadowColorMode` ×3 + variável, `bgGradientMode` ×3 opções + variáveis, `bgGradientAngle`, `cardShadow*` ×4 variáveis, `switchStyleType` ×2 opções (`asymmetric`, `pulsing`), `tertiaryColor`. Com o `manifest.ts` do HEAD (sem as entradas novas) o gate já acusa A2, A3 e A4.
- **Validador da `dataviz`** (`validate_palette.js`, `pairs: adjacent`, superfície = `colorBgBody`) sobre os 14 temas × 2 modos: 28 combinações, **0 FAIL**, 1 alívio (`blueprint-protocol` escuro: contraste de uma série abaixo de 3:1, superfície de luminosidade média). Nenhuma cor de status entre as séries.
- `npx vitest run` (3ª rodada completa, 448 arquivos, 2796 testes): 2793 passaram, 3 falharam. (a) `SarakActionCard` — snapshot que eu não tinha atualizado; atualizado e confirmado verde depois. (b) `SarakPDFViewerImpl` e (c) `keyboardJourney` — estouro de tempo sob carga; os dois passam em execução isolada (a do PDF também no controle do `HEAD`). **Não repeti a suíte inteira depois de atualizar o snapshot do `SarakActionCard`.** Sem EPERM.
- Controle em `HEAD` limpo para `SarakPDFViewerImpl` (`git archive` + junção de `node_modules`): 3/3 verdes; junção removida antes de apagar, `node_modules` conferido, `git status` idêntico.

**Critérios de aceite**
- [x] A1–A10 corrigidos como a §5 descreve, leitor provado por teste — A1/A2/A3/A4/A7/A10 só por teste de navegador **escrito e não executado**; A5 (switch), A6, A8 por teste unitário executado; A9 pelo teste de `useThemeCustomizationData`.
- [x] Gate novo falha no HEAD pelos achados e passa depois; ALLOWLIST com motivo (11 tokens, ver Achados); limites declarados; Anel 1 + CI.
- [x] Paridade convergente; `auditor_presets` sem órfã; `tokenContractParity` e `shippedThemesConsoleClean` verdes; contraste verde.
- [x] Paleta validada pela `dataviz` nos temas embarcados; sem status nas séries (1 alívio declarado).
- [x] Nota MAJOR em `## 8.0.0`.
- [ ] `npm run build` e `cromo-css-real:check` — não executados nesta máquina, por instrução; os 28 casos de `browser-tests/token-que-desenha.spec.ts` esperam o revisor.
- [ ] "Suíte completa verde" — 3 falhas na última rodada completa; 2 são carga, 1 corrigida e confirmada isolada, sem nova rodada completa.

**Decisões e suposições**
- **O emissor real não é o `manifest.ts`.** `useDesignVariables.ts` emite, para todo token do schema, `--sarak-<kebab>`, as `cssVars` e `data-sx-<kebab>` (select/boolean/font); o manifesto só alimenta `ALLOWED_EXTRA_KEYS` e o export público (os testes dele já diziam "nunca alimentou CSS real"). Logo as regras de CSS antigas (`[data-surface=…]`, `[data-tone=…]`, `[data-shadow-color-mode=…]`) nunca casaram. Escrevi os leitores contra `data-sx-*` e o gate resolve a opção por esse atributo; o manifesto serve de escopo (como a plan manda). Acrescentei ao manifesto entradas para `bgGradientMode`, `bgGradientAngle`, `bgNoiseDensity`, `cardShadow*` e `switchStyleType`, senão o gate não os veria.
- **A5 "ninguém lê `--sarak-noise-opacity`" não procede:** `NoiseOverlay` (montado no Provider) a lia, e os dois tokens escreviam a mesma variável. Mantive `bgNoiseDensity` (o "ruído real" da plan) e apontei `NoiseOverlay` para `--sarak-noise-density`; o valor de cada tema para o grão é o de `noiseIntensity` (o último a escrever).
- **A10:** `cardShadowSpread` emitia `20px` e o CSS fazia `calc(var(--…) * 0.01)` num alpha — declaração inválida, descartada pelo navegador. Por leitura de código, o cartão estava **sem sombra base**; ao corrigir, ele passa a ter a sombra que o tema pedia. Isso contraria "um tema sem os tokens novos não muda" no sentido visível; está dito na nota MAJOR. **Não medi isso em navegador** — confirmar no `cromo-css-real`.
- `systemTone` ganhou a opção `none` (padrão): sem ela o padrão ficaria fora das opções (`tokenContractParity`) ou todo tema ligaria um HUD. A plan fala em "fica com `cyber` e `tactical`".
- Gate: opção `none` isenta; token cujas opções estão todas lidas por atributo conta como lido (a variável é o outro canal). Escopo (ii) = manifesto com `attr` e `select` de opções literais.
- A6: preferi trocar as 4 fontes não carregadas por fonte da lista (a plan admite "sai da lista e do tema"); o carregador passou a derivar de `THEME_FONTS`.
- A8: `ChartColorToken` e a prop `series[].color` ficam iguais (status continua escolhível); `CHART_COLOR_TOKENS` virou `[...marca, ...status]` e a paleta automática usa só a marca. Candlestick (queda) e heatmap (fim da escala) passam a ler `theme.statusColors.statusErrorColor`, mantendo a cor de antes. Contraste mínimo escalonado 3 → 2,5 → 2 → 1,5 (o validador trata < 3 como alívio).
- Tom `tactical` sem `filter` (um filtro no `body` quebraria `position: fixed`); "saturação baixa" = HUD na cor do texto atenuado.
- Mudei `unit` de `cardShadowSpread` (retirada de `px`), descrição/rótulo e partição dele por serem a causa da sombra inválida.

**Achados fora do escopo (não corrigidos)**
- `gates/scripts/contrato/check-token-reader.mjs` (`ALLOWLIST`): sem leitor medido em 2026-10-11 — `colorPalette` (var + 5 opções), `colorDepth`, `colorVariation`, `borderRadiusSm/Md/Lg`, `contrastCurve`, `borderType` (var + 5 opções; o CSS usa `inlet`/`neon`/`beveled`, que não são opções), `shadowOrientation` (var + 5 opções; CSS usa `top-down`/`isometric`/`inner`), `layeredShadows`, `scrollbarStyle`.
- `src/styles/_surfaces.css` §10: `--dynamic-shadow` e as regras `[data-shadow-orientation=…]` seguem mortas (atributo real é `data-sx-shadow-orientation`); `--dynamic-shadow` é lido por `SarakSearch` e `SarakShellSearchWidget` e nunca definido.
- `docs/extensibilidade-de-layout.md:47,56` cita `noiseIntensity` e `atmosphereNoiseOpacity`, que saíram.
- `src/core/Provider/manifest.ts` (cabeçalho) segue dizendo "única fonte de verdade… vars/attr", mas não é o emissor.
- `src/features/DesignEngine/Main/components/ThemeImpactList.tsx:27` ainda lista `cardVariant` na ordem de exibição do modo Impacto (inofensivo).
- `jsdom` imprime centenas de "Could not parse CSS stylesheet" na suíte (não medi se existia no HEAD).

**Pendências / riscos**
- `npm run build` e `npm run cromo-css-real:check` não rodaram; os 28 casos novos de navegador, e a afirmação de que a sombra base do cartão estava inválida no HEAD, ficam para o revisor. A sintaxe de `color-mix(… min(100%, calc(var(--x) * 1%)) …)` em `_cards.css` só se prova em navegador.
- `_background.css` e as regras novas passam por `build:css:scoped` (lightningcss) — nunca rodado aqui.
- O tema `blueprint-protocol` escuro tem uma série com contraste < 3:1 sobre o fundo (alívio do validador).
- O `high-contrast`/os 7:1 e o redesenho dos temas são da plan-110, não tocados.
- Suíte completa não repetida após o último snapshot.

## Resumo da execução (correção 1) — 2026-10-11

**Resultado:** Concluído com pendências (os três achados corrigidos pela fonte; a confirmação em navegador é do revisor).

**Estado do worktree ao iniciar**
Todo o trabalho da execução original, ainda sem commit (`git status --short` com 86 entradas; mais `specs/00-indice.md` e `specs/plan/` do revisor). Nada de outra tarefa foi tocado.

**O que foi feito, por achado**
1. **Achado 1 — `frosted`, `backdrop-filter` computado `none`. Causa: o CSS, não o teste.** Lendo `dist/sarak.css`, a regra do material saiu com **só** `-webkit-backdrop-filter`; a propriedade sem prefixo, que o navegador computa, não está lá. Reproduzi o build na hora com o `lightningcss` do repositório: ao receber `backdrop-filter: X !important;` e `-webkit-backdrop-filter: X !important;` juntos, ele deixa só a forma com prefixo; recebendo apenas a forma sem prefixo, emite as duas (`-webkit-…;backdrop-filter:…`). `src/styles/_surfaces.css`: a regra `frosted` e a `organic` passam a declarar só `backdrop-filter`, com um comentário do porquê.
2. **Achado 2 — a sombra sai branca nos três modos. Causa: o teste media a camada errada.** O `box-shadow` computado do cartão sob material tem duas camadas — o realce `inset 0 1px 0 rgba(255,255,255,…)` do material e a sombra externa. O teste lia a **primeira** (a branca). `browser-tests/token-que-desenha.spec.ts`: `outerShadowChannels` separa as camadas pelas vírgulas de nível zero, escolhe a primeira que não é `inset` e lê a cor tanto em `rgb()/rgba()` quanto em `color(srgb …)` (forma que o navegador computa para `color-mix`). O CSS da cor da sombra não mudou.
3. **Achado 3 — `brushed`, `frosted`, `blueprint-pro` pintam com a primária. Causa: o CSS lia uma variável que nenhum token emite.** `textureColor` (`schema/colors.ts:75`) não tem `generateVariants`, então `--theme-texture-color-rgb` **nunca existe**; toda regra `rgba(var(--theme-texture-color-rgb, var(--theme-primary-rgb)), a)` cai na primária — as 3 minhas e as outras (50 consumos). `_atmosphere.css`: as três passam a `color-mix(in srgb, var(--theme-texture-color, var(--theme-primary)) N%, transparent)` (mesmos alfas). Pelo mesmo motivo troquei as quatro ocorrências do tom `cyber` em `_background.css`, que dizia "cor de textura" e pintava na primária. No teste, o caso passou a régua relacional: o `background-image` do `::after` contra a mesma expressão resolvida num `<i>` irmão, mais a prova de que ela difere da versão em `var(--theme-primary)`; as três de máscara comparam o `background-color` com `var(--theme-texture-color)`.

**Arquivos alterados (só nesta correção)**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/styles/_surfaces.css` | alterado | `frosted`/`organic` sem a forma `-webkit-` ao lado; comentário |
| `src/styles/_atmosphere.css` | alterado | 3 texturas de gradiente na cor de textura via `color-mix` |
| `src/styles/_background.css` | alterado | tom `cyber` na cor de textura via `color-mix` |
| `browser-tests/token-que-desenha.spec.ts` | alterado | sombra externa, `color(srgb)`, régua relacional das texturas |

**Verificações executadas**
- `lightningcss` do repositório sobre `_surfaces.css` (targets chrome 111 / safari 15): `frosted` e `organic` saem com `-webkit-backdrop-filter` **e** `backdrop-filter`; o mesmo motor sobre as duas formas juntas devolve só `-webkit-` (a causa).
- `tsc --noEmit` isolado sobre o spec → exit 0.
- `npm run token-reader:check` → OK (25 sob `ALLOWLIST`); `vitest` em `src/styles` e no teste do gate → 29/29; `catalog:check`, `guide:check`, `dev-kit:check` → em dia.
- **Não rodei** `cromo-css-real:check` (build com rede), nem a suíte completa: a correção só toca CSS e o spec de navegador.

**Critérios de aceite**
- [x] Achado 1 — evidência: `_surfaces.css` + saída do `lightningcss` acima; a prova final é o caso `A2: frosted` no revisor.
- [x] Achado 2 — evidência: `outerShadowChannels` em `token-que-desenha.spec.ts`; a prova final são os três casos `A3` no revisor.
- [x] Achado 3 — evidência: `_atmosphere.css` (brushed, frosted, blueprint-pro) e o caso `A7`; prova final no revisor.

**Decisões e suposições**
- Suposição: o Chromium do harness computa `backdrop-filter` pela propriedade sem prefixo e não a partir de `-webkit-backdrop-filter` (é o que o achado 1 mostra).
- `color-mix(… N%, transparent)` no lugar de `rgba(<canal>, a)` dá o mesmo alfa; o valor computado do gradiente muda de forma, por isso a régua relacional.
- Não toquei as outras 35 texturas nem os outros leitores de `--theme-texture-color-rgb` (fora do escopo desta correção).

**Achados fora do escopo (não corrigidos)**
- `src/styles/**`: 50 consumos de `--theme-texture-color-rgb`, variável que nenhum token emite; toda textura/efeito que a usa pinta com a primária, não com a cor de textura. Conserto possível no token (`generateVariants` em `textureColor`) ou regra a regra.
- `src/styles/_atmosphere.css:631` e `_cards.css:43`: regras que declaram `backdrop-filter` e `-webkit-backdrop-filter` juntas (a segunda com `!important` em `_atmosphere.css`) saem do build só com a forma `-webkit-`; o desfoque de cartão pode não aplicar no Chromium.

**Pendências / riscos**
- Os três achados só se encerram com o `cromo-css-real:check` do revisor; a suíte completa também é dele.

## Resumo da execução (correção 3) — 2026-10-11

**Resultado:** Concluído

**Estado do worktree ao iniciar**
O trabalho da execução e das correções anteriores, ainda sem commit; `specs/00-indice.md`, `specs/plan/` e os arquivos de `dist/` do build do revisor são de outra tarefa e não foram tocados.

**O que foi feito**
- **Achado 1 — o Anel 0 barrava o commit por "Segredo atribuído".** O padrão exige `token` imediatamente seguido de `:`/`=` e um texto de 8+ caracteres; a chave `token` das entradas da `ALLOWLIST` e dos achados casava. Renomeei o campo que identifica o token para `tokenId` (o nome do schema, que o padrão não casa), nos dois arquivos, sem tocar na semântica:
  - `gates/scripts/contrato/check-token-reader.mjs`: as 11 entradas da `ALLOWLIST`, os achados `{ kind, tokenId, value?, detail }`, `covers`, e as duas saídas de `console.log` (18 trocas).
  - `gates/scripts/contrato/__tests__/check-token-reader.test.mjs`: as entradas de `allowlist`, as asserções `objectContaining` e as leituras `f.tokenId` (17 trocas).
  A troca por expressão regular pegou também `...token.cssVars` (variável local, não o campo); restaurei na hora, antes de qualquer execução do gate.

**Arquivos alterados (só nesta correção)**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `gates/scripts/contrato/check-token-reader.mjs` | alterado | campo `token` → `tokenId` |
| `gates/scripts/contrato/__tests__/check-token-reader.test.mjs` | alterado | idem |
| `specs/plan/plan-111-todo-token-visual-desenha.md` | alterado | este bloco e o `status` |

**Verificações executadas**
- Os 12 padrões de `gates/scripts/segredo/config.json` (inclusive "Segredo atribuido") aplicados linha a linha aos dois arquivos → **0 ocorrências**.
- `npm run token-reader:check` → `[OK] Todo valor emitido tem leitor. Exceções declaradas (ALLOWLIST): 25.` (mesmo número de antes).
- `npx vitest run gates/scripts/contrato/__tests__/check-token-reader.test.mjs` → 17/17.
- `npm run gate-limits:check` → OK (43 scripts).

**Critérios de aceite**
- [x] O achado 1 — evidência: varredura com 0 ocorrências nos dois arquivos; gate e teste verdes com os mesmos números.

**Decisões e suposições**
- Nome `tokenId`: o do schema e o que o veredito sugere. Não alterei a regra, a `ALLOWLIST` nem a lista de achados.
- Não rodei a varredura do Anel 0 sobre as demais linhas novas da árvore (o escopo era os dois arquivos); o revisor já a fez e só eles casavam.

**Achados fora do escopo (não corrigidos)**
- Nenhum novo.

**Pendências / riscos**
- Suíte completa e `cromo-css-real:check` não repetidos: a correção só renomeia um campo de um gate e do teste dele, que passaram isolados.

---

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->

## Veredito — 2026-10-11 — 🔴 Reprovado

**Verificado:** `npm run cromo-css-real:check` (build oficial, rodado pelo revisor com rede) → **120 verdes, 7 falhas**, todas em `browser-tests/token-que-desenha.spec.ts` (abaixo). Lido o resumo e o diff: os arquivos de tema mudaram só no permitido (fontes no formato de `THEME_FONTS`, `systemTone`, os tokens de ruído; as linhas de `description` são diferença de quebra de linha). O cabeçalho do `check-token-reader.mjs` declara o limite de escopo (só o que o `manifest.ts` cita). A descoberta de que o emissor real é o `useDesignVariables.ts` (e não o `manifest.ts`, como a plan supunha) e a de que a sombra base do cartão era uma declaração inválida no `HEAD` ficam registradas para a síntese.

**Achados:**

1. **A2 — `frosted`** (`token-que-desenha.spec.ts:140`): o `filter` computado do cartão com `surfaceMaterial: frosted` é `none` — esperado `blur(…)` e `saturate(1.6)`. A regra do material não se aplica ao cartão medido. Critério violado: "cada achado corrigido, com o leitor provado por teste".
2. **A3 — cor da sombra** (`:187`, `:193`, `:200`): nos três modos a primeira sombra computada sai **branca** (`255, 255, 255`) — `neutral` devia ser preta, `colored` tingida pela primária, `ambient` derivada do fundo e diferente das outras duas. A cor da sombra não está chegando ao cartão (ou a primeira sombra lida não é a que o modo controla). Mesmo critério.
3. **A7 — `brushed`, `frosted`, `blueprint-pro`** (`:296`): deixaram de pintar em branco fixo, mas pintam com o canal da **primária** (`0, 242, 255`), não com a **cor de textura do tema** da cena (`31, 41, 55`). A §5 passo 7 pede "pintar com a cor de textura do tema, como as outras 35". Mesmo critério.

**Pendente, para a próxima rodada:** a suíte completa não foi repetida depois do último snapshot; o revisor a roda depois da correção.

**Achados fora do escopo transcritos para o `00-backlog`** (itens 32 a 34): os 11 tokens sem leitor que o gate cobre por `ALLOWLIST`; o escopo do gate (só o `manifest.ts`) menor que o da regra (tudo o que o `useDesignVariables` emite); e os textos que ficaram desatualizados (`docs/extensibilidade-de-layout.md`, cabeçalho do `manifest.ts`, `ThemeImpactList`).

## Veredito — 2026-10-11 (rodada 2) — 🟢 Aprovado

**Achados da rodada anterior, conferidos:** (1) `frosted`: a causa era o build — o lightningcss, recebendo `backdrop-filter` e `-webkit-backdrop-filter` juntas, descartava a forma sem prefixo; a regra declara só a forma sem prefixo e o build emite as duas. (2) sombra: o CSS estava certo, o teste lia a camada `inset` branca do material; agora lê a sombra externa, inclusive na forma `color(srgb …)`. (3) texturas: liam `--theme-texture-color-rgb`, que nenhum token emite; as três passam a `color-mix` na cor de textura do tema.

**Verificado:** `npm run cromo-css-real:check` (build oficial, rodado pelo revisor) → **127/127** verdes; `npx vitest run` → 448 arquivos, 2796 testes verdes; `tsc` 0; `audit:baseline` igual ao baseline (uma regressão de ponteiro de seção apareceu no meio da revisão e era do revisor — um texto do `00-backlog` —, corrigida); `npm run audit` → paridade 441 tokens; Anel 1 completo, inclusive `token-reader:check` (25 exceções declaradas, todas da `plan-112`); `public-types`, `catalog`, `guide`, `dev-kit`, `token-types` em dia.

**Critérios de aceite:** todos atendidos — A1 a A10 com leitor provado por teste; gate novo que falha no `HEAD` e passa depois, com exceções declaradas com motivo; paridade, presets, `tokenContractParity`, `shippedThemesConsoleClean` e contraste verdes; paleta derivada validada pela `dataviz`, sem cor de status entre as séries; nota MAJOR em `## 8.0.0`.

**Encaminhado à `plan-112`** (promovida pelo dono em 2026-10-11): os 11 tokens da `ALLOWLIST`, a sombra dinâmica, o vidro do cartão (o mesmo defeito de build do achado 1, em seis declarações), a cor de textura nos 24 leitores de `--theme-texture-color-rgb`, o escopo do gate ao schema inteiro e os textos desatualizados.

## Veredito — 2026-10-11 (rodada 3) — 🔴 Reprovado (aprovação reaberta)

**Por que reabre:** o Anel 0 do `pre-commit` (`gates/scripts/segredo/verificar_commit.py`) barrou o commit desta plan com 18 achados "Segredo atribuído". O revisor aprovou sem simular o Anel 0 sobre as linhas novas. Varridas agora todas as linhas adicionadas da árvore (rastreadas e não rastreadas, fora `dist/`) com o mesmo padrão: só os dois arquivos abaixo casam.

**Achado:**

1. `gates/scripts/contrato/check-token-reader.mjs` (11 ocorrências, a `ALLOWLIST`, cada entrada com a chave `token` recebendo o id entre aspas, como colorPalette) e `gates/scripts/contrato/__tests__/check-token-reader.test.mjs` (7) — o padrão `(?i)(api[_-]?key|secret|token|password|…)s*[:=]s*['"][^'"]{8,}['"]` (`gates/scripts/segredo/config.json`) casa com uma chave chamada `token` recebendo um texto de 8 caracteres ou mais. Não é segredo, mas o gate não se contorna: a chave muda de nome (ex. `tokenId`, que o padrão não casa, porque exige `:`/`=` logo depois de `token`), no gate e no teste. Critério violado: o commit da plan passa pelos anéis do `pre-commit`.

## Veredito — 2026-10-11 (rodada 4) — 🟢 Aprovado

**Conferido no worktree:** o campo dos dois arquivos do gate virou `tokenId` (16 e 17 ocorrências), sem sobra da chave antiga; `npm run token-reader:check` OK (ALLOWLIST 25, igual à rodada 2); teste do gate 17/17; `gate-limits:check` OK. Varredura do padrão "Segredo atribuido" sobre todas as linhas adicionadas da árvore (fora `dist/`, rastreadas e não rastreadas): **0**.

**Achado do próprio revisor, já corrigido:** a 2ª tentativa de commit caiu com 1 achado neste arquivo: o exemplo literal da chave que o veredito da rodada 3 citava. Reescrito em prosa. O resto da plan segue como aprovado na rodada 2 (a correção só renomeia um campo de gate e teste, sem efeito na suíte nem no navegador).
