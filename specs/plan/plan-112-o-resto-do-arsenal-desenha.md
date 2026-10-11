---
tipo: "plan"
titulo: "Completar o arsenal: os tokens que ainda nao desenham, o vidro do cartao e a cor de textura, com o gate cobrindo o schema inteiro"
objetivo: "Fazer os tokens visuais que a plan-111 deixou na excecao do gate desenharem, o desfoque de vidro do cartao funcionar no navegador e a cor de textura chegar a todas as texturas, e estender o token-reader ao schema inteiro, sem excecao restante"
dominio: "Design Engine / CSS do motor / Contrato de tokens"
status: "🟢 Aprovada"
prioridade: "Alta"
tags: ["plan", "design-engine", "tokens", "css", "gate", "temas"]
relacionados: ["[[02-design-engine]]", "[[09-temas-e-presets]]", "[[04-contrato-de-tokens-e-paridade]]", "[[00-regras-e-invariantes]]", "[[01-gates-e-baseline]]"]
depende_de: "plan-111-todo-token-visual-desenha"
retida_por: ""
destino_sintese: "arquitetura/02-design-engine.md + specs/09-temas-e-presets.md + specs/00-regras-e-invariantes.md + specs/01-gates-e-baseline.md"
---

# 1. Objetivo

Nenhum token visual do Design Engine fica sem desenhar: os 11 que a `plan-111` deixou na exceção do gate passam a
mudar a tela, o vidro do cartão desfoca no navegador, a cor de textura do tema pinta todas as texturas, e o
`token-reader:check` cobre o schema inteiro com a lista de exceção **vazia**.

# 2. Contexto

**Decisão do dono, 2026-10-11:** corrigir agora tudo o que a `plan-111` encontrou, para que os temas da `plan-110`
(lote 1 em espera) sejam desenhados sobre o arsenal inteiro funcionando. A 110 depende desta.

**O que a `plan-111` deixou, medido em 2026-10-11** (execução dela e revisão — itens 32, 33 e 34 do backlog, promovidos
nesta plan):

| # | Defeito | Onde |
|---|---|---|
| B1 | **11 tokens sem leitor**, cobertos pela `ALLOWLIST` de `gates/scripts/contrato/check-token-reader.mjs`: `colorPalette` (variável e 5 opções), `colorDepth`, `colorVariation`, `borderRadiusSm`, `borderRadiusMd`, `borderRadiusLg`, `contrastCurve`, `borderType` (o CSS usa `inlet`/`neon`/`beveled`, que não são opções), `shadowOrientation` (o CSS usa `top-down`/`isometric`/`inner`), `layeredShadows`, `scrollbarStyle` | schema, `src/styles/_surfaces.css`, `ALLOWLIST` |
| B2 | `--dynamic-shadow` é lido por `SarakSearch.tsx:86` e `SarakShellSearchWidget.tsx:110` e só é definido por regras `[data-shadow-orientation=…]` (`_surfaces.css:72-73`) que nunca casam: o atributo emitido é `data-sx-shadow-orientation` | `_surfaces.css`, os dois componentes |
| B3 | **O vidro do cartão não desfoca no Chromium.** Regras que declaram `backdrop-filter` e `-webkit-backdrop-filter` juntas saem do build (lightningcss) **só** com a forma `-webkit-` — medido no `dist/sarak.css`: `.sarak-card,…{-webkit-backdrop-filter:blur(var(--sarak-card-blur,12px))!important;…}` sem a forma sem prefixo. O `cardBackdropBlur` não desenha em nenhum tema de vidro. Há **6** declarações `-webkit-backdrop-filter` em `src/styles/` (entre elas `_cards.css:43` e `_atmosphere.css:631`) | `src/styles/*.css` |
| B4 | **A cor de textura não chega às texturas.** O CSS lê `--theme-texture-color-rgb` em **24** lugares (`_atmosphere.css` 18, `_animations.css` 3, `_surfaces.css` 2, `_base.css` 1), e o token `textureColor` (`src/core/Design/schema/colors.ts`) não tem `generateVariants`: a variável nunca é emitida e toda regra cai na primária | schema, `src/styles/` |
| B5 | **O escopo do gate é menor que a regra.** O `token-reader:check` olha só o que o `manifest.ts` cita; quem emite variável e atributo para **todo** token do schema é o `useDesignVariables.ts`. Um token fora do manifesto escapa | `check-token-reader.mjs`, cabeçalho do `manifest.ts` |
| B6 | Textos desatualizados pela 111: `docs/extensibilidade-de-layout.md:47,56` cita `noiseIntensity` e `atmosphereNoiseOpacity`, que saíram; `ThemeImpactList.tsx:27` ainda lista `cardVariant` na ordem do modo Impacto; o cabeçalho do `manifest.ts` se diz a fonte de `vars`/`attr` | os três arquivos |

A 111 já ensinou três armadilhas que valem aqui: o emissor real é o `useDesignVariables.ts`; o build descarta a forma
sem prefixo quando as duas vêm juntas; e o que o `jsdom` não computa só se prova em `browser-tests/`.

# 3. Escopo

## 3.1 Dentro
- `src/core/Design/schema/` e `src/core/Design/catalog/` (paridade) — os 11 tokens e o `textureColor`; `src/core/Provider/manifest.ts` (cabeçalho e, se o gate pedir, entradas); `src/core/Provider/generated/` (regenerado).
- `src/styles/` — os leitores dos 11 tokens, as 6 declarações de `backdrop-filter` e os 24 leitores da cor de textura.
- `src/components/atomic/Inputs/SarakSearch.tsx`, `src/components/atomic/Navigation/SarakShellSearchWidget.tsx` — a sombra deles; e o componente que for o leitor natural de um token (ex.: barra de rolagem).
- `gates/scripts/contrato/check-token-reader.mjs` e o teste dele — o escopo novo e a `ALLOWLIST` vazia.
- `src/core/Design/presets/` — só trocar valor que deixar de existir (sem redesenho; é da 110).
- `docs/extensibilidade-de-layout.md`, `src/features/DesignEngine/Main/components/ThemeImpactList.tsx` — os textos do B6.
- `browser-tests/` — medição dos efeitos; `docs/migracoes.md` — subseção dentro de `## 8.0.0`; artefatos regenerados.

## 3.2 Fora
- Redesenhar tema (é a `plan-110`); embutir fontes no pacote.
- Um gate novo para a direção contrária (todo `var()` lido é emitido) — o caso B4 se prova por teste aqui; a regra geral fica registrada.
- Qualquer spec em `specs/` (a síntese é do revisor).

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Plan | `specs/plan/plan-111-todo-token-visual-desenha.md` (§2, §9 e §10) | o que já foi feito, as armadilhas medidas e os achados que esta plan fecha |
| Spec fixa | `arquitetura/02-design-engine.md` (§9.1 em especial) | camadas CSS e o que cede à classe |
| Spec fixa | `arquitetura/04-contrato-de-tokens-e-paridade.md` | paridade 1:1:1 |
| Spec fixa | `specs/09-temas-e-presets.md` §4.2 e §4.4.3 | valor fora do contrato; token oferecido sem efeito |
| Spec fixa | `specs/00-regras-e-invariantes.md` (R18) e `specs/01-gates-e-baseline.md` §2.2 | limites declarados e o catálogo de gates |
| Contexto | `00-contexto.md` · `00-knowledge.md` | sempre |
| **Skill** | `ui-refatorar-componente` · `ui-novo-componente` | mudar, fundir e criar opção e token sem quebrar a paridade |
| **Skill** | `ui-arquitetura-design` | CSS do Design Engine |
| **Skill** | `padrao-escrita` + `padrao-typescript` · `test-unitario` | sempre; testes dos leitores |
| Código | `src/core/Design/hooks/useDesignVariables.ts`, `src/core/Provider/manifest.ts`, `gates/scripts/contrato/check-token-reader.mjs` | o emissor real, o escopo atual e o gate |
| Código | `src/styles/_surfaces.css`, `src/styles/_atmosphere.css`, `src/styles/_cards.css`, `src/styles/_animations.css`, `src/styles/_base.css` | os leitores |
| Código | `browser-tests/token-que-desenha.spec.ts`, `browser-tests/fixtures/harness-entry.tsx` | o idioma de medição da 111 |

# 5. Instruções de execução

1. **B1 — os 11 tokens:** cada um passa a desenhar o que o rótulo promete, em cada opção, nos dois modos. Quando um token apenas **duplica** o efeito de outro que já desenha, ele é fundido no outro (como o ruído na 111), com a paridade e o valor salvo caindo no padrão — cada fusão vai declarada no resumo com o motivo. Nenhum fica na `ALLOWLIST`.
2. **B2 — sombra dinâmica:** `shadowOrientation` alimenta `--dynamic-shadow` pelo atributo real; `SarakSearch` e a barra de busca do cromo passam a ter a sombra que o tema pede.
3. **B3 — vidro:** toda declaração de `backdrop-filter` em `src/styles/` sai do build com a forma sem prefixo (o que o Chromium computa); o desfoque do cartão de vidro aparece.
4. **B4 — cor de textura:** a cor de textura do tema chega a todos os leitores (pelo token, com a variante `-rgb` emitida, ou trocando os leitores por `color-mix` — o executor escolhe e justifica); nenhuma textura cai na primária quando o tema define outra cor de textura.
5. **B5 — gate:** o `token-reader:check` passa a olhar **tudo o que o `useDesignVariables.ts` emite** para os tokens do schema (variável e atributo), não só o manifesto; a `ALLOWLIST` termina vazia (o mecanismo continua, para exceção futura com motivo); o cabeçalho atualiza os limites (R18). O gate tem de falhar no `HEAD` pelo que esta plan corrige e passar depois.
6. **B6 — textos:** os três arquivos dizem o que o código faz.
7. Testes: unitário do que for JS (barra de rolagem, sombra dos componentes, gate); em `browser-tests/`, medição de cada efeito novo (os 11 tokens por opção, a sombra dinâmica, o desfoque do cartão de vidro, a cor de textura numa amostra que cubra as quatro famílias de leitor: `_atmosphere`, `_animations`, `_surfaces`, `_base`).
8. Nota **MAJOR** dentro da entrada `## 8.0.0` (efeitos que passam a aparecer, opções que saem ou se fundem).
9. Rodar a verificação da §7.

# 6. Critérios de aceite

- [ ] Os 11 tokens desenham (ou foram fundidos, com motivo); `ALLOWLIST` do `token-reader` vazia.
- [ ] `--dynamic-shadow` definido pelo atributo real; os dois componentes com sombra.
- [ ] Nenhuma declaração de `backdrop-filter` sai do `dist/sarak.css` só com a forma `-webkit-`; o cartão de vidro desfoca, medido em navegador.
- [ ] A cor de textura do tema chega aos 24 leitores; medido em navegador nas quatro famílias.
- [ ] `token-reader:check` com escopo no schema inteiro: falha no `HEAD` anterior, passa depois.
- [ ] Os textos do B6 corrigidos.
- [ ] Paridade convergente; `auditor_presets` sem órfã; `tokenContractParity`, `shippedThemesConsoleClean` e contraste verdes.
- [ ] Nota MAJOR em `## 8.0.0`.
- [ ] Suíte completa verde; `tsc` 0; `audit:baseline` sem regressão; gates do Anel 1; `cromo-css-real:check`; catálogo, kit e barril em dia.

# 7. Como verificar (uso do revisor)

**Gate:** `token-reader:check` (o mesmo da `plan-111`, regra R40) com o escopo ampliado ao schema inteiro e a `ALLOWLIST` vazia — não é regra nova.

- `git diff --stat` → só a §3.1 e os gerados.
- `npm run build` + `grep -o "[^}]*-webkit-backdrop-filter[^}]*}" dist/sarak.css` → toda ocorrência acompanhada da forma sem prefixo.
- `npm run cromo-css-real:check` (o revisor roda, com rede) → os casos novos verdes.
- Mutação do gate: apagar a regra CSS de uma opção de `borderType` → falha; tirar um token do manifesto → o gate ainda o vê.
- `npm run audit` (paridade, presets, contraste) · `npx vitest run` · `npx tsc --noEmit` · `npm run audit:baseline` · Anel 1 completo.

# 8. Destino da síntese

**Destino:** `arquitetura/02-design-engine.md + specs/09-temas-e-presets.md + specs/00-regras-e-invariantes.md + specs/01-gates-e-baseline.md`

- **`02-design-engine`:** os leitores dos 11 tokens (ou as fusões), a sombra dinâmica, a regra "o build só preserva a forma sem prefixo se ela vier sozinha" e a cor de textura em todas as texturas.
- **`00-regras` R40 e `01-gates`:** o escopo do gate é o schema inteiro, e a exceção está vazia.
- **`09-temas-e-presets`:** os tokens que se fundiram ou saíram.

---

# 9. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only: cada rodada acrescenta um bloco novo; nada é removido. -->

## Resumo da execução — 2026-10-11

**Resultado:** Concluído com pendências

**Estado do worktree ao iniciar**
(limpo)

**O que foi feito**
- **B1, tokens que passam a desenhar.** `borderType` (5 opções, `_surfaces.css` §3.2, atributo `data-sx-border-type`); `shadowOrientation` (vetor `--sarak-shadow-dir-x/y` por opção em `_surfaces.css` §10, consumido pela sombra base e pelo hover do cartão em `_cards.css` e pela sombra em camadas em `_theme.css`; `dynamic` segue o ponteiro: `DesignInjector.tsx` publica `--sarak-light-x/y` só quando a opção está ativa); `layeredShadows` (multiplica a opacidade das duas camadas de `--sarak-dynamic-shadow`, `_theme.css`); `colorDepth`/`colorVariation` (`color-engine.ts`: `computeColorVariants(v, fallback, { depth, variation })`, fator `1 ± 0,1·depth` e 8° de matiz por passo; 1/1 reproduz o desenho anterior; ligado em `useDesignVariables.ts`).
- **B1, tokens fundidos** (saem do schema, do catálogo, dos 14 temas e do manifesto; entram em `removedTokenKeys.ts`): `colorPalette` (preset de 3 cores que já são tokens), `borderRadiusSm/Md/Lg` (escala sem leitor; o raio é `borderRadius` e os raios por componente), `contrastCurve` (o CSS só tem `contrast()`, que `globalContrast` já governa), `scrollbarWidth`/`scrollbarThumbColor` (duplicatas de `scrollWidth`/`scrollThumbColor`; os temas escreviam o mesmo valor nos dois pares) e a entrada `scrollbarStyle` do manifesto, que nunca teve token. Tokens 441 → 434.
- **B2.** `--dynamic-shadow` passa a ser definido (`_theme.css`, espelha `--sarak-dynamic-shadow`); `SarakSearch`, a busca do cromo e `.shadow-theme` o leem sem alterar componente. Saem as regras mortas `[data-shadow-orientation=…]` e `[data-border=…]`.
- **B3.** `_cards.css`, `_atmosphere.css` e `_performance.css` (2×) declaram só `backdrop-filter`. O `frosted` de `_surfaces.css` passa a partir de `cardBackdropBlur` (`blur(var(--sarak-card-blur,12px) + intensidade × 24px)`; no padrão são os mesmos 24px de antes), senão o material sobrescreveria o token.
- **B4.** `textureColor` ganha `generateVariants: true` (`colors.ts`): `--theme-texture-color-rgb` passa a existir e os leitores de `_atmosphere`/`_animations` a recebem. Em `_atmosphere.css`, as 5 texturas por SVG embutido (`waves`, `topo`, `diamond`, `prestige`, `hexagon`) viram máscara com `background-color` da cor de textura (o `var()` dentro do data URI não era resolvido) e a `carbon` deriva os 6 tons da cor de textura. As 2 leituras de `_surfaces` saíram com a reescrita de `borderType` (agora `color-mix` na cor de textura). A de `_base.css` (`--theme-primary-focus`) voltou a ler a primária (ver decisões).
- **B5.** `check-token-reader.mjs`: escopo = schema inteiro (variável automática `--sarak-<kebab>`, `cssVars`, atributo `data-sx-<kebab>`; o manifesto só informa `classPrefix`/vars extras); token não-`select` é lido por qualquer `[data-sx-<kebab>…]`; cabeçalho com os limites (R18), incluindo o 9 (só a direção emitido→lido).
- **B6.** `docs/extensibilidade-de-layout.md`, `ThemeImpactList.tsx` e o cabeçalho de `manifest.ts` corrigidos.
- **Testes:** `src/styles/__tests__/arsenalQueDesenha.test.ts` (novo, texto do CSS); casos novos em `useDesignVariables.test.ts`, `DesignInjector.test.tsx` e `check-token-reader.test.mjs` (escopo, mutação por opção e por token fora do manifesto); `browser-tests/arsenal-restante-desenha.spec.ts` (novo, **não executado**) e recortes/cenas em `fixtures/harness-entry.tsx`.
- Nota MAJOR em `docs/migracoes.md` (subseção nova dentro de `## 8.0.0`); gerados regenerados (`token-types`, `catalog`, `guide`, `dev-kit`).

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `gates/scripts/contrato/check-token-reader.mjs` e `__tests__/check-token-reader.test.mjs` | alterado | escopo = schema inteiro; `ALLOWLIST` com 70 tokens (87 achados) novos; 6 casos novos |
| `src/styles/{_surfaces,_theme,_cards,_atmosphere,_base,_performance}.css` | alterado | moldura, direção/camadas da sombra, `--dynamic-shadow`, vidro, texturas, foco |
| `src/core/Design/schema/{atmosphere,colors,system}.ts`, `catalog/**` (3 JSON), `presets/themes/*.ts` (14) | alterado | 7 tokens removidos; `textureColor` com variantes |
| `src/core/Provider/{manifest,constants}.ts`, `utils/{removedTokenKeys,validation,color-engine}.ts`, `components/DesignInjector.tsx`, `generated/design-token-ids.ts` | alterado | manifesto, chaves removidas, variantes de cor, luz dinâmica |
| `src/core/Design/hooks/useDesignVariables.ts` | alterado | forma das variantes |
| `src/features/DesignEngine/Main/components/ThemeImpactList.tsx` | alterado | sem `cardVariant` na ordem |
| testes (`*.test.*`) e 2 `.snap` | criado/alterado | os snapshots só perderam os tokens removidos |
| `browser-tests/**` | criado/alterado | casos de medição |
| `docs/**`, `sarak-ui/**`, `sarak-dev/**` | alterado | texto, nota MAJOR, gerados |

**Verificações executadas**
- `npx vitest run` (completo, 449 arquivos, 2838 testes): 1ª rodada, 3 falhas (fixture de `ThemeImpactList` e 2 snapshots, consequência dos tokens removidos; corrigidos). Rodada final: **2837 passaram, 1 falhou** — `SarakPDFViewerImpl`, estouro de tempo sob carga, o mesmo da plan-111; isolado (`src/components/atomic/Media/SarakPDFViewer`) → 5/5. Sem EPERM.
- `npx tsc --noEmit` → exit 0, sem saída. `check-audit-baseline.mjs --with-tsc` → "igual ao baseline… nenhuma regressão" (uma regressão minha, `--sarak-light-x/y` fantasmas, 1→3, corrigida declarando-as em `:root`).
- `npm run audit` → paridade, `auditor_presets` e contraste (14 temas × 2 modos) verdes; falha nas mesmas 2 regras do baseline.
- Anel 1, todos OK: `container-query`, `container-query-boundary`, `class-merge`, `icon-port`, `chrome-token-parity` (43/43), `zero-brand`, `barrel` (102), `catalog`, `guide`, `dev-kit`, `token-types` (434), `token-reader` (87 sob `ALLOWLIST`), `gate-limits` (43), `persistence-doc`, `public-types`, `kit-names`, `section-pointers`.
- **Controle em `HEAD`** (cópia por `git archive` fora do repo, gate novo copiado para dentro; `git status --short` idêntico antes e depois): o gate acusa **26** valores — `borderType` ×4 opções + variável, `shadowOrientation` ×5 + variável, `layeredShadows`, `contrastCurve`, `colorPalette` ×5 + variável, `colorDepth`, `colorVariation`, `borderRadiusSm/Md/Lg`, `scrollbarWidth`, `scrollbarThumbColor`; exit 1. Na árvore, exit 0.
- Mutação (cópia fora do repo): renomear o atributo da regra `[data-sx-border-type="glow"]` → o gate acusa a opção `glow`. Token fora do manifesto: caso "MUTAÇÃO: token que o manifesto NÃO cita ainda é visto" no teste do gate.
- **Não rodei** `npm run build`, `cromo-css-real:check` (sem rede, por instrução) nem `build:js`.

**Critérios de aceite**
- [x] Os 11 tokens desenham ou foram fundidos com motivo (4 desenham, 7 fundidos).
- [ ] `ALLOWLIST` vazia — **não atendido**: o escopo ampliado revelou 70 tokens fora da medição da plan (ver Decisões).
- [x] `--dynamic-shadow` definido e lido pelos dois componentes — `_theme.css` + `arsenalQueDesenha.test.ts`; a medição em navegador está escrita (caso `SarakSearch`), não executada.
- [x] Nenhum `-webkit-backdrop-filter` sobra em `src/styles/` — `arsenalQueDesenha.test.ts`. O `dist/` e o desfoque medido (casos `build:` e `cardBackdropBlur:`) ficam para o revisor.
- [x] Cor de textura chega aos leitores — teste de `useDesignVariables` (variante emitida); medição nas famílias escrita, não executada.
- [x] `token-reader:check` no schema inteiro falha no `HEAD` (26) e passa depois.
- [x] Textos do B6 corrigidos. [x] Paridade, presets, contraste verdes. [x] Nota MAJOR.
- [ ] `npm run build` e `cromo-css-real:check` — não executados.

**Decisões e suposições**
- **Os 70 tokens novos.** A plan pede `ALLOWLIST` vazia, mas §3.1 não alcança cartão, tabela, formulário, identidade, movimento etc. Segui a interpretação conservadora: declarei os 70 (87 achados) na `ALLOWLIST` com motivo, em três grupos — sem menção fora do schema (57); lido por tabela/normalizador que o regex não vê (11, entre eles `chrome*Position` e `mobileNavigationStyle`, que são lidos; não provado opção a opção); opções de `layout` sem regra (1). Dar leitor ou retirar do schema é decisão do dono.
- **Fusão de `borderRadiusSm/Md/Lg` é reversível.** 5 dos 14 temas traziam escala autorada (aurora-veil 10/16/36, blueprint-protocol 0/2/6, golden-hour 6/12/32, minimalist-airy 4/8/48, neumorphic-mobile 4/8/32) que nunca desenhou. Desenhá-la via `--radius-sm/md/lg` do Tailwind reestilizaria ~90 usos de `rounded-sm/md/lg` e inverteria a escala (lg > xl); por isso fundi.
- `contrastCurve` fundido em `globalContrast`: três temas traziam 1,2/1,2/1,5, que nunca produziu efeito.
- `--theme-primary-focus` (`_base.css`) lia a cor de textura; com a variante emitida o foco do campo viraria branco no padrão. Voltei a leitura para a primária (o que sempre renderizou). Desvio declarado do "chega aos 24 leitores".
- `carbon`: tons por `color-mix` com preto (8–14%), que com textura branca reproduz os cinzas de antes; com textura escura o tecido escurece junto.
- `frosted` parte de `cardBackdropBlur` (não pedido literalmente): sem isso o material padrão sobrescrevia o token.
- Mudanças visíveis no padrão: cartões sob `sleek`/`industrial` desfocam 12px; o modo `eco` passa a cancelar o desfoque no Chromium; a paleta de busca e a busca do cromo ganham sombra. Declarado na nota MAJOR.

**Achados fora do escopo (não corrigidos)**
- Os 70 tokens da `ALLOWLIST` (`gates/scripts/contrato/check-token-reader.mjs`).
- `src/core/Provider/manifest.ts`: ainda carrega `attr` com nomes que o motor nunca emitiu (`data-surface`, `data-tone`, `data-border`, `data-shadow-orientation`…); só o cabeçalho foi corrigido.
- `_atmosphere.css`: `--sarak-card-blur` e `--sarak-card-backdrop-blur` são duas leituras do mesmo token com fallbacks diferentes (12px × 0px).
- jsdom segue imprimindo centenas de "Could not parse CSS stylesheet".

**Pendências / riscos**
- Os ≈35 casos de `browser-tests/arsenal-restante-desenha.spec.ts` e o `cromo-css-real:check` são do revisor. Só se provam em navegador: o `color-mix(… min(100%, calc(…)))` dentro do `@theme` de `_theme.css`, o `mask` das 5 texturas convertidas e a `carbon`. Confirmar também que o Tailwind mantém `--dynamic-shadow` no `@theme` (só emite variável referenciada).
- `SarakPDFViewerImpl` é intermitente sob carga (isolado passa).


## Resumo da execução (correção 1) — 2026-10-11

**Resultado:** Concluído (a medição em navegador é do revisor)

**Estado do worktree ao iniciar**
Trabalho da execução original ainda sem commit, mais `specs/` e arquivos de `dist/` do build do revisor, que não são desta correção e não foram tocados.

**O que foi feito, por achado**
1. **Achado 1 — ponteiro fora da janela.** `browser-tests/arsenal-restante-desenha.spec.ts:236`: `page.mouse.move(0, DESKTOP.height)` virou `page.mouse.move(0, DESKTOP.height - 1)`. A janela vai de y = 0 a 799; em y = 800 o Chromium não entrega `mousemove`, e `--sarak-light-x/y` nunca eram escritas. Em (0, 799), o ponto que o revisor mediu, a luz se move e a sombra inverte, o que o `expect.poll` seguinte exige.
2. **Achado 2 — variável lida no elemento errado.** Mesmo arquivo, linha 415: `page.locator('html')` virou `page.locator('body')`. `--theme-primary-focus` é declarada em `body` (`src/styles/_base.css`), então no `html` a leitura voltava vazia.

**Arquivos alterados (só nesta correção)**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `browser-tests/arsenal-restante-desenha.spec.ts` | alterado | linha 236 (coordenada do ponteiro) e linha 415 (elemento da leitura) |
| `specs/plan/plan-112-o-resto-do-arsenal-desenha.md` | alterado | este bloco e o `status` |

**Verificações executadas**
- Leitura do código: as duas linhas conferem com o veredito e com a declaração em `_base.css`.
- `npx tsc --noEmit` → exit 0, sem saída.
- **Não rodei** `cromo-css-real:check` (sem rede); a prova é do revisor.

**Critérios de aceite**
- [x] Achado 1 — evidência: `arsenal-restante-desenha.spec.ts:236`.
- [x] Achado 2 — evidência: `arsenal-restante-desenha.spec.ts:415`.

**Decisões e suposições**
- Suposição: a medição do revisor em (0, 799) vale para o caso inteiro, inclusive `moved.x > 0`; não há como reconferir sem navegador.

**Achados fora do escopo (não corrigidos)**
- Nenhum novo.

**Pendências / riscos**
- `cromo-css-real:check` com os dois casos corrigidos é do revisor. O destino dos 70 tokens da `ALLOWLIST` segue com o dono, como no veredito.

---

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->

## Veredito — 2026-10-11 — 🔴 Reprovado

**Conferido no worktree:** `npm run build` OK; suíte completa 449/449 arquivos, 2838/2838 testes; `tsc` 0; `audit:baseline --with-tsc` igual ao baseline; Anel 1 inteiro OK (o `plan-index` só divergia pelo status, sincronizado neste veredito); varredura do padrão "Segredo atribuido" sobre as linhas adicionadas (rastreadas e não rastreadas, fora `dist/`): 0; `dist/sarak.css` sem regra com só a forma `-webkit-` de `backdrop-filter` (a única ocorrência é a lista de `transition-property` do Tailwind). `npm run cromo-css-real:check`: **153 verdes, 2 vermelhos**, os dois casos novos desta plan, e nos dois o defeito é do teste, não do motor:

1. `browser-tests/arsenal-restante-desenha.spec.ts:236` — `page.mouse.move(0, DESKTOP.height)` aponta para y = 800, fora da janela (0 a 799): o Chromium não entrega `mousemove`, e a luz nunca se move. Medido à parte, com o mesmo harness: em (0, 800) `--sarak-light-x` fica vazio; em (0, 799) vira `1` e a sombra do cartão passa a `9.8px -19.5px`. Corrigir a coordenada para dentro da janela (ex.: `DESKTOP.height - 1`). Critério: os casos novos verdes em navegador.
2. `browser-tests/arsenal-restante-desenha.spec.ts:415` — lê `--theme-primary-focus` no `html`, mas ela é declarada em `body` (`src/styles/_base.css:12-34`; no `dist`, `body{--theme-primary-focus:…}`): o valor lido é vazio. Ler no `body`. Mesmo critério.

**Critério não atendido, à espera de decisão do dono:** `ALLOWLIST` vazia. O escopo ampliado revelou 70 tokens (87 achados) fora da medição que originou a plan; o executor os declarou com motivo, em três grupos, em vez de decidir sozinho entre dar leitor e retirar do schema. Interpretação aceita como conduta; o destino dos 70 é do dono (relatório na conversa).

**Achados fora do escopo registrados pelo executor** (`attr` do `manifest.ts` com nomes que o motor nunca emitiu; `--sarak-card-blur` × `--sarak-card-backdrop-blur` com fallbacks 12px × 0px): seguem com a decisão acima.

## Veredito — 2026-10-11 (rodada 2) — achados fechados; aprovação à espera da decisão do dono

**Conferido:** as duas linhas do teste mudaram como pedido (`arsenal-restante-desenha.spec.ts`: ponteiro em `DESKTOP.height - 1`; foco lido no `body`) e nada mais mudou fora da plan. `playwright test` sobre o `dist/` do build da rodada 1 (o `src/` não mudou desde então): **155/155**. Varredura do padrão "Segredo atribuido" nas linhas adicionadas e nos não rastreados: 0. Suíte, `tsc`, `audit:baseline` e Anel 1 seguem os da rodada 1 (a correção só tocou o teste de navegador).

**Pendente:** o critério "`ALLOWLIST` vazia" segue não atendido, com os 70 tokens declarados. O status fica em 🟠 até o dono decidir o destino deles (aprovar com o critério emendado e abrir plan própria, estender esta plan, ou aceitar a exceção).

## Veredito — 2026-10-11 (rodada 3) — 🟢 Aprovado

**Decisão do dono (2026-10-11):** aprovar a plan com os 70 tokens (87 achados) na `ALLOWLIST` do `token-reader:check`, com motivo, e discutir o destino deles à parte. O critério "`ALLOWLIST` vazia" fica emendado para "os 11 tokens da exceção herdada da `plan-111` resolvidos (4 desenham, 7 fundidos); a exceção restante declarada com motivo". Todo o resto foi conferido nas rodadas 1 e 2 (suíte 2838/2838, `tsc` 0, `audit:baseline` sem regressão, Anel 1 verde, navegador 155/155, Anel 0 simulado: 0).
