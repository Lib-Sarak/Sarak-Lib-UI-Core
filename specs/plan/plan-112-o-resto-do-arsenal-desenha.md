---
tipo: "plan"
titulo: "Completar o arsenal: os tokens que ainda nao desenham, o vidro do cartao e a cor de textura, com o gate cobrindo o schema inteiro"
objetivo: "Fazer os tokens visuais que a plan-111 deixou na excecao do gate desenharem, o desfoque de vidro do cartao funcionar no navegador e a cor de textura chegar a todas as texturas, e estender o token-reader ao schema inteiro, sem excecao restante"
dominio: "Design Engine / CSS do motor / Contrato de tokens"
status: "🟡 Em execução"
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

---

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->
