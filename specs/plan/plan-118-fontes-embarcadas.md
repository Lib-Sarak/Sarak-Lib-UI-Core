---
tipo: "plan"
titulo: "Embarcar as fontes na biblioteca, carregadas sob demanda, e ampliar o catalogo de tipografia"
objetivo: "Fazer a biblioteca entregar as proprias fontes, carregadas so quando o tema as usa e sem requisicao a terceiros, com a opcao de o host escolher a origem, e ampliar com seguranca o catalogo de familias que o schema e o painel oferecem"
dominio: "Design Engine / Tipografia / Build e distribuicao / Privacidade"
status: "🟡 Em execução"
prioridade: "Alta"
tags: ["plan", "fontes", "tipografia", "build", "privacidade", "lgpd", "bundle"]
relacionados: ["[[09-temas-e-presets]]", "[[05-build-e-distribuicao]]", "[[10-seguranca-e-acessibilidade]]", "[[12-kit-do-consumidor]]", "[[02-design-engine]]"]
depende_de: "plan-117-pendencias-do-arsenal"
retida_por: ""
destino_sintese: "arquitetura/05-build-e-distribuicao.md + specs/10-seguranca-e-acessibilidade.md + specs/09-temas-e-presets.md + specs/12-kit-do-consumidor.md + adr/"
---

# 1. Objetivo

A lib **entrega as próprias fontes**: o consumidor não faz requisição a `fonts.googleapis.com`/`fonts.gstatic.com`, a
página funciona offline, e **só as famílias que o tema no ar usa** são baixadas (o boot não carrega nenhuma fonte a
mais). O host escolhe a origem (`bundled` · `google` · `none`, e um `baseUrl`). E o catálogo de tipografia, hoje com
19 famílias, **cresce** com famílias que a lib já deveria ter e com mais variedade, dentro de um orçamento de peso
medido.

# 2. Contexto

**Decisão do dono, 2026-10-15:** embarcar as fontes; ter ampla variedade e, se viável, ampliar o catálogo; o ponto
técnico (carga em runtime por URL relativa ao módulo, opção do host) foi aceito.

**Medido e lido no código em 2026-10-15:**

| Fato | Onde |
|---|---|
| As fontes vêm do Google Fonts por `@import`/`<link>` em runtime, com `preconnect` para `fonts.googleapis.com` e `fonts.gstatic.com` | `src/core/Provider/hooks/useSarakUIEffects.ts:37`, `src/core/Provider/utils/googleFontsUrl.ts` |
| A lista única é `THEME_FONTS` (19 famílias carregáveis + `system-ui`); o carregador e o painel leem dela | `src/core/Design/schema/typography.ts` |
| Offline, ou com o domínio bloqueado, todo tema cai na fonte de reserva (achado A11 do anexo de direção da `plan-110`) | — |
| Cada visita expõe o IP do usuário final a um terceiro (LGPD) e exige o domínio na política de segurança de conteúdo do importador | — |
| O CSS da lib é **injetado como string dentro do JS** (`scripts/inject-css.mjs`): um `url(...)` relativo nele resolveria contra a página, não contra o `dist/` | `scripts/inject-css.mjs` |
| O `dist/` é versionado e `package.json.files` define o que o pacote leva; `exports` só expõe a raiz e os `.css` | `package.json` |
| O `@fontsource*` **não está instalado** (`node_modules/@fontsource` não existe) e o executor não tem rede | — |
| Temas pediram `Orbitron`, `Chakra Petch`, `VT323` e `Fira Code`, que **não** estão na lista (achado A6 do anexo de direção); hoje nenhum tema as usa, e a direção de arte da `plan-110` as quer para os temas cyber/retrô | `plan-110` anexo §9 |

**Desenho aceito pelo dono:**

- **Formato:** woff2, **variável** quando a família tem versão variável, subconjunto **latin** (cobre português,
  inglês, espanhol, francês e alemão); `latin-ext` só se os idiomas de `enabledLanguages` exigirem (o executor confere
  os seis idiomas).
- **Carga:** `@font-face` **gerado em runtime**, só para as famílias lidas pelo design no ar, com
  `new URL('./fonts/<arquivo>.woff2', import.meta.url)`. **Não** inlinar em base64 no CSS (infla o boot).
- **Opção do host:** `options.fonts`: `'bundled'` (padrão) · `'google'` (o comportamento de hoje) · `'none'` (o host
  carrega) · e `baseUrl` para hosts que servem as fontes de outro lugar. Em esbuild puro, que ignora o padrão
  `new URL(..., import.meta.url)`, o importador usa `baseUrl`.
- **Modo Embarcado:** a regra atual de `options.embedded.injectGlobalFonts` (opt-in) **continua**; fonte é recurso do
  documento, e a ilha não o impõe.

**Restrições que não mudam:** zero marca (R12); nenhuma rede por conta própria **além** do que `options.fonts:
'google'` explicitamente pede; boot continua só com o tema padrão (`theme-boot:check`, `boot:measure` não regridem);
os 19 valores existentes de `THEME_FONTS` **continuam com o mesmo `value`** (tema salvo guarda a string).

# 3. Escopo

## 3.1 Dentro
- `src/core/Design/schema/typography.ts` — a lista `THEME_FONTS` (novas famílias entram como **opções**, com a
  paridade) e os campos de `options.fonts` onde couber.
- `src/core/Provider/` — `useSarakUIEffects.ts`, `utils/googleFontsUrl.ts`, um módulo novo do carregador de
  `@font-face`, `types.ts`/`providerProps.ts` (`options.fonts`), `manifest`/`payloadExtraKeys` se necessário.
- `scripts/` — o passo de build que copia os woff2 para `dist/fonts/` e gera o manifesto (família → arquivos →
  pesos/eixos); `package.json` (`files`, devDependencies das fontes, script do passo, `fonts:check` no `build`).
- `gates/` — o gate de fontes (§5, lote 2) e a allowlist/limites (R18).
- `dist/fonts/` e `THIRD-PARTY-FONTS` (licenças) — gerados/versionados como o resto do `dist/`.
- `browser-tests/` — caso de navegador (a fonte do tema é a que a página usa, sem requisição externa).
- `sarak-ui/GUIA-FRONTEND.md`, `.agents/skills/ui-integra-consumidor/` e `ui-criar-tema` — a documentação do
  importador (a §7 da `09` e a `10` são do revisor, na síntese); `docs/migracoes.md` (`## 8.0.0`).
- Um ADR novo (o desenho e as alternativas).

## 3.2 Fora
- Mudar o `value` de qualquer família existente, ou tirar uma família do catálogo.
- Subconjuntos além de latin sem decisão (o executor propõe, o revisor decide).
- Fontes de ícone (a lib tem a porta de ícones própria) e qualquer outro recurso binário.
- Tema: os temas continuam declarando fontes pelo valor da lista (a `plan-110`).
- Versão e tag (o MAJOR é aplicado no merge; a `rc` é do dono).

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `arquitetura/05-build-e-distribuicao.md` | `dist/`, `files`, o que o pacote leva e o postbuild de CSS |
| Spec fixa | `specs/10-seguranca-e-acessibilidade.md` §3.2 | a lib não faz rede por conta própria |
| Spec fixa | `specs/09-temas-e-presets.md` §4.4, §4.4.4, §5.1 | valor salvo vence, fontes que o tema declara, fundo offline |
| Spec fixa | `specs/12-kit-do-consumidor.md` | onde o importador aprende a escolher a origem |
| Spec fixa | `specs/00-regras-e-invariantes.md` (R12, R17, R18, R33) | zero marca, não transcrever fonte viva, limites de gate, contrato público |
| Contexto | `00-contexto.md` · `00-knowledge.md` | sempre |
| **Skill** | `ui-refatorar-componente` · `ui-integra-consumidor` · `ui-criar-tema` | opção nova sem quebrar paridade; kit; guia de tema |
| **Skill** | `padrao-escrita` + `padrao-typescript` · `test-unitario` · `otimizacao-nivel-1` | sempre; medir peso antes/depois |
| Código | `src/core/Design/schema/typography.ts`, `src/core/Provider/utils/googleFontsUrl.ts`, `src/core/Provider/hooks/useSarakUIEffects.ts`, `scripts/inject-css.mjs`, `package.json` | o ponto de partida |
| Backlog | `00-backlog.md` item 18 | o precedente do worker do PDF (`new URL(..., import.meta.url)`) e o que ele ensinou |

# 5. Instruções de execução

**Um lote por vez; cada lote termina com resumo num bloco novo da §9 e status 🟠; o próximo só começa depois do
veredito.**

> **Paralelismo (revisor, 2026-10-15):** o lote 1 só escreve o anexo e não toca código; pode correr ao lado do lote 1 da `plan-117`. Os lotes 2 a 4 tocam `package.json`, o build e os gerados, e esperam a `plan-117` 🟢. O executor **não tem rede**: as fontes entram por `npm install` feito pelo dono (lote 0).

**Lote 0 — ação do dono (fora da execução).** Instalar as fontes candidatas como **devDependencies**
(`@fontsource-variable/<familia>`, ou `@fontsource/<familia>` quando não houver variável) e commitar o lockfile.
Candidatas (a lista final sai do lote 1; instalar todas custa só `node_modules`):
- **As 19 atuais** carregáveis (Inter, Outfit, Roboto, Montserrat, Space Grotesk, Plus Jakarta Sans, Lexend, Sora,
  Syne, Archivo, Unbounded, Bebas Neue, Playfair Display, Fraunces, Dancing Script, Pacifico, Satisfy, Caveat,
  JetBrains Mono).
- **As que os temas já pediram e a lista não tem:** Orbitron, Chakra Petch, VT323, Fira Code.
- **Ampliação proposta (variedade que falta):** *sans* — DM Sans, Manrope, Nunito, Work Sans, Figtree, Rubik;
  *serif* — Lora, Source Serif 4, Cormorant Garamond, EB Garamond; *slab/condensada/display* — Roboto Slab, Oswald,
  Anton; *mono* — IBM Plex Mono, Space Mono, Roboto Mono; *manuscrita* — Patrick Hand.

**Lote 1 — medição e proposta (nenhum código de produto).**
1. Com os pacotes instalados, medir **cada candidata**: arquivos, eixos (peso, largura, `opsz`…), tamanho woff2
   latin (e latin-ext), licença (SIL OFL / Apache 2.0 — **só entram famílias redistribuíveis**), e se há versão
   variável.
2. Propor o **catálogo final** por categoria (sans, serif, display, mono, manuscrita), com o orçamento: **até 3 MB**
   no pacote e **até ~150 KB por família** (variável latin) como ponto de partida; justificar exceção. Critério de
   inclusão: licença redistribuível, qualidade em corpo e título, **diferença visual real** das já existentes (não
   duas quase iguais), e cobertura de latin + os idiomas habilitados.
3. Conferir os seis idiomas de `enabledLanguages` contra o subconjunto (latin basta?).
4. Entregar a proposta no anexo `specs/plan/anexos/plan-118-catalogo-de-fontes.md`. **O revisor decide a lista final
   com o dono** antes do lote 2.

**Lote 2 — pipeline, catálogo e gate.**
5. O passo de build copia os woff2 da lista final para `dist/fonts/` e **gera o manifesto** (família → arquivos,
   pesos, eixos), derivado de `THEME_FONTS` (fonte única); nenhuma lista à mão.
6. `THEME_FONTS` ganha as famílias aprovadas **como opções novas** (os 19 valores atuais intocados), com a paridade
   do schema/catálogo e a categoria; o painel já agrupa por categoria.
7. `THIRD-PARTY-FONTS` com a licença e o autor de cada família, em `dist/` e no pacote (`files`).
8. **Gate `fonts:check`** (no `build`): toda família de `THEME_FONTS` tem arquivo no manifesto e licença
   declarada; todo arquivo do manifesto existe em `dist/fonts/`; peso total ≤ orçamento; limites R18; **mutação**
   (remover um arquivo, uma licença, ou estourar o orçamento derruba).

**Lote 3 — o carregador em runtime e `options.fonts`.**
9. O módulo carregador: dado o `design` no ar, resolve **só as famílias usadas** (título, corpo, identidade e
   qualquer token de fonte) e injeta o `@font-face` correspondente (uma vez por família, deduplicado), com
   `font-display: swap`. Resolve o arquivo por `new URL('./fonts/<arquivo>.woff2', import.meta.url)`.
10. `options.fonts`: `'bundled'` (padrão) · `'google'` (preserva `googleFontsUrl`/`useSarakUIEffects` de hoje) ·
    `'none'` · e `baseUrl`. **Sem rede quando `bundled` ou `none`** (nem `preconnect`).
11. Modo Embarcado: `injectGlobalFonts` segue opt-in; nada novo é imposto à página do host.
12. Testes: o `@font-face` é gerado só para as famílias usadas e uma vez; troca de tema carrega a nova família e
    não a antiga; `none` não injeta nada; `google` mantém o comportamento. **Caso de navegador:** a fonte do tema
    é a que a página usa (`document.fonts.check`), **sem requisição externa**.
13. **O `CJS`** não resolve o `new URL` do `import.meta.url`: o carregador usa `baseUrl` ou degrada para a fonte
    de reserva **com aviso nomeando a família** — nunca em silêncio.

**Lote 4 — documentação e fechamento.**
14. O kit e as skills ensinam: as três origens, quando usar `baseUrl` (esbuild puro, CDN própria), a nota de
    **privacidade/LGPD** e de política de segurança de conteúdo (`font-src`), o catálogo por categoria e **o que a lib
    já faz** (não recriar carregador de fonte). A `ui-criar-tema` ganha a regra "fonte por valor exato da lista" e as
    famílias novas por categoria.
15. Nota MAJOR em `## 8.0.0` (comportamento padrão muda de Google para embarcado; `options.fonts` novo); ADR;
    gerados regenerados (`guide` e `dev-kit` por último); simulação do Anel 0.

# 6. Critérios de aceite

- [ ] Lote 1 aprovado: catálogo final decidido com o dono, cada família com licença redistribuível e peso medido.
- [ ] `dist/fonts/` e o manifesto gerados da lista única; `THIRD-PARTY-FONTS` presente; `fonts:check` no `build`,
  com mutação e orçamento.
- [ ] Os 19 `value` atuais de `THEME_FONTS` **inalterados**; as famílias novas entram como opções, com paridade;
  tema salvo continua válido.
- [ ] Padrão `'bundled'`: **nenhuma** requisição externa de fonte e nenhum `preconnect`; só as famílias usadas são
  buscadas; o boot não regride (`theme-boot:check`, `boot:measure`).
- [ ] `'google'` preserva o comportamento atual; `'none'` não injeta nada; `baseUrl` aponta os arquivos.
- [ ] CJS e hosts que ignoram `new URL`: aviso nomeando a família, nunca silêncio.
- [ ] Caso de navegador prova a fonte usada e a ausência de requisição externa.
- [ ] Documentação do importador (kit e skills) e nota MAJOR; ADR.
- [ ] Suíte completa verde numa passada; `tsc` 0; `audit:baseline` sem regressão; Anel 1; `cromo-css-real:check`;
  catálogo, kit e barril em dia; Anel 0 simulado: 0.

# 7. Como verificar (uso do revisor)

- Lote 1: reproduzir a medição de duas famílias (tamanho woff2 e licença), conferir que nenhuma candidata tem
  licença que impeça redistribuir, e decidir a lista com o dono.
- Lote 2: `dist/fonts/` contra o manifesto; a mutação do gate; `git diff` dos `value` existentes (só acréscimos).
- Lote 3: no navegador, `document.fonts` e a aba de rede (nenhuma origem externa) com um tema de fonte não padrão;
  o aviso do CJS.
- `npm run build` + `npm run cromo-css-real:check` · `npm run boot:measure` · `npx vitest run` · `npx tsc --noEmit` ·
  `npm run audit:baseline -- --with-tsc` · Anel 1 · Anel 0.

# 8. Destino da síntese

**Destino:** `arquitetura/05-build-e-distribuicao.md + specs/10-seguranca-e-acessibilidade.md + specs/09-temas-e-presets.md + specs/12-kit-do-consumidor.md + adr/`

- **`05`:** `dist/fonts/`, o manifesto e `THIRD-PARTY-FONTS` como parte do pacote; o gate `fonts:check`.
- **`10`:** a lib não faz requisição de fonte por padrão; `options.fonts: 'google'` é opt-in explícito; LGPD.
- **`09`:** o catálogo de tipografia e a regra "fonte por valor exato da lista".
- **`12`:** o que o kit ensina sobre as três origens e `baseUrl`.
- **ADR:** o desenho aceito e as alternativas descartadas (base64 no CSS; só Google Fonts; `@fontsource` importado
  pelo consumidor).

---

# 9. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only: cada rodada acrescenta um bloco novo; nada é removido nem reescrito. -->

---

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->
