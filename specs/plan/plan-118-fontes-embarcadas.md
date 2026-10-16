---
tipo: "plan"
titulo: "Embarcar as fontes na biblioteca, carregadas sob demanda, e ampliar o catalogo de tipografia"
objetivo: "Fazer a biblioteca entregar as proprias fontes, carregadas so quando o tema as usa e sem requisicao a terceiros, com a opcao de o host escolher a origem, e ampliar com seguranca o catalogo de familias que o schema e o painel oferecem"
dominio: "Design Engine / Tipografia / Build e distribuicao / Privacidade"
status: "🔴 A executar"
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

**Decisões do dono sobre o lote 1 (2026-10-15):**
- **`latin-ext` não entra** agora; o manifesto guarda o subconjunto como campo para entrar depois sem MAJOR.
- **Pesos sintéticos das estáticas: aceitos**, com a regra "o tema escolhe pesos que a família tem" na documentação;
  o carregador nunca declara um peso que o pacote não contém.
- **Variedade: sim, ampla.** Entram as 26 do anexo **mais** Orbitron, VT323, Fira Code, DM Sans, Manrope, Work Sans,
  Lora e Oswald (34 famílias), e uma **segunda onda** a medir (lote 1b): Open Sans, Raleway, Source Sans 3,
  Merriweather, Poppins, Lato e PT Serif. Os pacotes já estão instalados.
- **O cliente pode adicionar fontes próprias ao importar.** A lib entrega as opções prontas, e o importador registra
  outras (lote 4): o catálogo da lib é o ponto de partida, nunca o teto.

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

**Lote 1b — a segunda onda (medição; só o anexo).**
- Medir Open Sans, Raleway, Source Sans 3, Merriweather, Poppins, Lato e PT Serif **como o lote 1** (variável/estática,
  eixos, `latin` upright, licença, pesos que a lib usa) e **acrescentar ao mesmo anexo**
  `plan-118-catalogo-de-fontes.md`: a tabela por categoria, o `value` exato e o veredito, com o orçamento atualizado
  (34 famílias do lote 1 + a segunda onda). Mesmo critério de inclusão, **com a regra nova do dono**: proximidade
  visual com uma família existente **não exclui** (a marca do cliente chega com a fonte dela); excluem licença,
  qualidade em corpo/título, ou estourar o orçamento. Nenhum código de produto.

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

**Lote 4 — as fontes do host (o importador adiciona as dele).**
- **API:** `options.fonts.custom`: lista de `{ family, category?, fallback?, files: [{ url, weight, style? }] }` (ou
  `src` por peso). O importador aponta para os arquivos que **ele** serve (woff2/woff); a lib **não os embarca nem os
  copia**. Aparecem no painel junto às da lib, agrupadas por categoria, e valem em `headingFont`, `bodyFont`,
  `identityFontFamily` e qualquer token de fonte.
- **Validação (segurança, R6):** o domínio de `headingFont`/`bodyFont` hoje é o enum do schema, e `validateDesign` descarta
  valor fora dele. O valor de uma família do host só é aceito **se ela estiver registrada em `options.fonts.custom`**;
  o nome da família é validado por padrão restrito (letras, dígitos, espaço, hífen, sublinhado), e a `url` passa pelo
  mesmo predicado de mídia segura (`isSafeMediaString`): **nenhum esquema fora de `https:`, caminho relativo/`/`,
  `data:` de fonte; nenhuma interpolação em CSS sem escapar**. Tema como dado hostil: um tema salvo com uma família
  não registrada cai no padrão, com aviso nomeando a família — nunca injeta o nome.
- **Persistência:** o tema guarda só o `value` da família; o host é quem registra os arquivos. Ao exportar um tema
  que usa fonte do host, o JSON exportado o diz (comentário/aviso do painel), para o outro host saber que precisa
  registrá-la.
- **Carregamento:** o mesmo carregador sob demanda do lote 3 (só a família em uso), `font-display: swap`, sem rede
  extra quando `options.fonts` é `none`.
- **Painel:** a lista de opções é composta em runtime (catálogo da lib + as do host), sem tocar o schema embarcado;
  sem fonte registrada, nada muda.
- **Testes:** registrar, usar, tema salvo com família desconhecida (aviso, padrão), URL com esquema perigoso
  (recusada), nome com caracteres de CSS (recusado), painel lista a do host, `none` não carrega.

**Lote 5 — documentação e fechamento.**
14. O kit e as skills ensinam: as três origens, **como registrar fonte própria (`options.fonts.custom`) e quando
    preferir isso a `baseUrl`**, quando usar `baseUrl` (esbuild puro, CDN própria), a nota de
    **privacidade/LGPD** e de política de segurança de conteúdo (`font-src`), o catálogo por categoria e **o que a lib
    já faz** (não recriar carregador de fonte). A `ui-criar-tema` ganha a regra "fonte por valor exato da lista" e as
    famílias novas por categoria.
15. Nota MAJOR em `## 8.0.0` (comportamento padrão muda de Google para embarcado; `options.fonts` novo); ADR;
    gerados regenerados (`guide` e `dev-kit` por último); simulação do Anel 0.

# 6. Critérios de aceite

- [ ] Lotes 1 e 1b aprovados: catálogo final decidido com o dono (34 + a segunda onda que passar), cada família com
  licença redistribuível e peso medido
- [ ] **O importador registra fontes próprias** (`options.fonts.custom`): aparecem no painel, valem nos tokens de
  fonte, passam pela validação (nome e URL seguros), tema salvo com família não registrada cai no padrão com aviso.
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


## Resumo da execução — 2026-10-15

**Resultado:** Concluído com pendências

**Estado do worktree ao iniciar**
```
M  package-lock.json
M  package.json
M  specs/00-indice.md
M  specs/plan/plan-117-pendencias-do-arsenal.md
M  specs/plan/plan-118-fontes-embarcadas.md
?? .claude/settings.local.json
```

**O que foi feito**
- Criei `specs/plan/anexos/plan-118-catalogo-de-fontes.md:1` com medições dos 40 pacotes instalados, licenças/créditos, cobertura dos seis idiomas, comparação visual e catálogo proposto.
- Acrescentei este bloco append-only na §9 e movi `status` para `🟠 Em revisão`.
- Mantive o trabalho da `plan-117` sem alterações; não editei `src/`, `scripts/`, `gates/`, `dist/`, `package.json` nem `package-lock.json`.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `specs/plan/anexos/plan-118-catalogo-de-fontes.md` | criado | Inventário e proposta com medições dos 40 candidatos. |
| `specs/plan/plan-118-fontes-embarcadas.md` | alterado | Resumo desta execução e status para revisão. |

**Verificações executadas**
- Scripts Node em `%TEMP%` sobre os diretórios instalados → 40/40 candidatas medidas; 40/40 licenças redistribuíveis; nenhum pacote Fontsource direto instalado fora da lista. Scripts scratchpad removidos ao terminar.
- Espécime local no navegador → `document.fonts`: 40 carregadas / 40; amostra comparativa incluiu acentos e operadores monoespaçados.
- Anel 0 em repositório Git temporário, com o anexo staged → `bloqueado: false`, `achados_segredo: []`, `arquivos_sensiveis: []`. O repositório temporário foi removido.
- Suítes não executadas: este lote não alterou código, e a instrução dispensa testes.

**Critérios de aceite**
- [x] Medição por pacote de arquivos/subconjuntos, eixos, pesos, tamanhos e licenças — evidência: anexo, tabelas das cinco categorias.
- [x] Proposta dentro do orçamento — Latin 1.012.836 B; com Latin-ext recomendado 1.894.996 B, abaixo de 3 MB.
- [x] Cobertura dos seis idiomas verificada; `de`/`fr` e custo Latin-ext identificados — evidência: anexo § “Latin-ext e os seis idiomas”.
- [x] Valores atuais e código de produto preservados — nenhuma edição em `src/` nem nos artefatos de produto.
- [ ] Catálogo aprovado com o dono — pendente de revisão, como prevê o fim do lote 1.

**Decisões e suposições**
- Interpretei os 19 itens atuais como 19 famílias file-backed: o código contém também `system-ui`, totalizando 20 opções. Todas permanecem sem alteração; `system-ui` continua sem WOFF2 próprio.
- Recomendo Latin-ext para `ẞ` em alemão e `Ÿ` em francês. `Satisfy` não tem esse subconjunto e dependerá de fallback nesses glifos.
- Pesos estáticos foram somados usando os pesos nativos que o pacote disponibiliza entre os valores do painel; limites e síntese estão descritos no anexo.

**Achados fora do escopo (não corrigidos)**
- `src/features/DesignEngine/Panels/LayoutTab.tsx:3` mantém uma lista local Outfit/Inter. As referências encontradas são comentários, o componente é usado apenas pelo próprio teste e não foi tratado como catálogo vivo.
- Durante a execução, o HEAD avançou para `cca1b365` (`feat(dependencies): add multiple fontsource packages ...`), que incorporou a instalação e o dispatch já presentes na fotografia inicial. Também surgiram alterações da execução paralela da `plan-117`; foram preservadas.

**Pendências / riscos**
- O dono/revisor precisa decidir o catálogo, Latin-ext e aceitação de pesos sintéticos nas fontes estáticas.
- `00-indice.md` permanece sob responsabilidade do revisor; após este status 🟠, deve ser espelhado para 🟠 antes de liberar qualquer commit.
- O status global do worktree inclui alterações em andamento da `plan-117` e `.claude/settings.local.json`; a mudança deste lote limita-se ao anexo e a esta plan.

---

## Resumo da execução — 2026-10-15 — lote 1b

**Resultado:** Concluído; recomendo as sete candidatas da segunda onda para o catálogo de 41 famílias. A ratificação do catálogo precede o lote 2.

**Estado do worktree ao iniciar**
```text
 M browser-tests/fixtures/harness-entry.tsx
 M docs/migracoes.md
 M gates/allowlists/tokenDocumentationPending.json
 M package-lock.json
 M package.json
 M sarak-ui/GUIA-FRONTEND.md
 M sarak-ui/START-HERE.md
 M sarak-ui/VERSION
 M sarak-ui/catalog.json
 M sarak-ui/docs/migracoes.md
 M specs/00-backlog.md
 M specs/00-indice.md
 M specs/plan/anexos/plan-110-tokens-funcionais.md
 M specs/plan/plan-117-pendencias-do-arsenal.md
 M specs/plan/plan-118-fontes-embarcadas.md
 M src/components/atomic/Cards/SarakActionCard.tsx
 M src/components/atomic/Cards/SarakSearchCard.tsx
 M src/components/atomic/Cards/SarakTitleCard.tsx
 M src/components/atomic/Cards/__tests__/SarakActionCard.test.tsx
 M src/components/atomic/Templates/SarakImageCard.tsx
 M src/components/atomic/Templates/__tests__/SarakImageCard.test.tsx
 M src/components/atomic/Templates/components/SarakCoreCard.tsx
 M src/core/Design/schema/card-action.ts
 M src/core/Design/schema/cards.ts
 M src/core/Provider/generated/design-token-docs.json
 M src/styles/_cards.css
?? .claude/settings.local.json
?? browser-tests/cartao-que-se-move.spec.ts
?? specs/plan/anexos/plan-118-catalogo-de-fontes.md
?? src/components/atomic/Cards/hooks/__tests__/useSpotlightPointer.test.tsx
?? src/components/atomic/Cards/hooks/useSpotlightPointer.ts
```

**O que foi feito**
- Acrescentei uma seção ao fim de `specs/plan/anexos/plan-118-catalogo-de-fontes.md`; preservei intacto o conteúdo do lote 1.
- Medi os sete pacotes instalados, registrei licenças/créditos, pesos reais e sintetizados, os valores propostos de `THEME_FONTS` e o catálogo Latin consolidado.
- Acrescentei este resumo à §9 e mudei o status para `🟠 Em revisão`.
- Não alterei código de produto, pacote, lockfile ou arquivo da plan-117; `00-indice.md` já aparecia modificado na fotografia inicial e permaneceu intocado.

**Arquivos deste lote**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `specs/plan/anexos/plan-118-catalogo-de-fontes.md` | acréscimo | Nova seção lote 1b e catálogo consolidado de 41 famílias. |
| `specs/plan/plan-118-fontes-embarcadas.md` | alterado | Status e bloco append-only desta execução na seção 9. |

**Verificações executadas**
- Script Node temporário de leitura dos sete pacotes → 7/7 medidos; 7/7 redistribuíveis sob SIL OFL 1.1. Versões: Source Sans 3 5.3.1; demais 5.3.0. O scratchpad foi removido.
- Espécime local com WOFF2 → as sete candidatas comparadas em corpo 400 e título 700 com pares aceitos; fontes carregadas e amostra acentuada renderizada.
- Soma Latin upright → 41 famílias, 1.690.020 B (1,690 MB / 1,612 MiB); folga de 1.309.980 B (1,310 MB) contra 3 MB. Maior carga por família: Merriweather, 97.548 B (95,3 KiB).
- Anel 0 simulado em repositório Git temporário, com apenas o anexo staged → `bloqueado: false`, `achados_segredo: []`, `arquivos_sensiveis: []`; scratchpad removido.
- `git status --short -- specs/plan/anexos/plan-118-catalogo-de-fontes.md specs/plan/plan-118-fontes-embarcadas.md` → apenas o anexo (não rastreado) e esta plan (modificada). O status global conserva os caminhos que já estavam modificados na fotografia inicial.
- Suítes não executadas, conforme instrução: lote sem código e sem testes necessários.

**Critérios de aceite**
- [x] Sete candidatas medidas dos arquivos instalados: tipo, eixos, subconjuntos, WOFF2, pesos, síntese, licença e crédito.
- [x] Regra nova de variedade aplicada: aproximação visual foi registrada, não usada para excluir; as sete passam qualidade em corpo/título e limites de peso/orçamento.
- [x] Catálogo consolidado por categoria e valores exatos de 22 novas famílias documentados para o lote 2.
- [x] Latin-ext fora do catálogo e campo de subconjuntos preservado para expansão futura.
- [x] Anel 0 limpo; nenhum código ou arquivo da plan-117 alterado por este lote.

**Decisões e suposições**
- Usei o subtotal Latin de 26 famílias já aprovado no veredito do lote 1 (1.012.836 B), somei 244.372 B das oito inclusões do dono e 432.812 B da segunda onda. A soma corresponde aos arquivos e pesos registrados no anexo.
- A opção atual `system-ui, -apple-system, sans-serif` permanece sem WOFF2 próprio e fora das 41 famílias embarcadas.
- Não há exceção de licença ou orçamento. Os pesos estáticos sintetizados constam do anexo e seguem a decisão do dono.

**Achados fora do escopo**
- As mudanças paralelas da plan-117 e demais caminhos presentes na fotografia inicial foram preservados.

**Pendências**
- Revisor/dono confirmar a inclusão das sete candidatas antes do lote 2; nenhuma exceção técnica ou de licença está pendente.

## Resumo da execução (lote 2) — 2026-10-16

**Resultado:** Concluído com pendências (o `build` real e o `dist/fonts/` versionado são do revisor)

**Estado do worktree ao iniciar**
```
 M specs/00-indice.md
 M specs/plan/plan-117-pendencias-do-arsenal.md
 M specs/plan/plan-118-fontes-embarcadas.md
```
Durante a execução apareceram, vindos da execução paralela da `plan-117` e não tocados por mim: `browser-tests/cartao-que-se-move.spec.ts`, `browser-tests/fixtures/harness-entry.tsx`, `src/components/atomic/Cards/SarakSearchCard.tsx`, `src/styles/_cards.css`.

**O que foi feito**
- Passo 5 — `scripts/fonts/fontPackages.ts` resolve família → pacote → arquivos pela convenção do `metadata.json` (id = nome em minúsculas com hífen; `metadata.family` tem de repetir o nome; variável antes de estática). Variáveis: só `latin-wght-normal`, eixo `wght` no manifesto. Estáticas: pesos do pacote ∩ `PANEL_WEIGHTS` (300–900). Nenhuma tabela escrita à mão foi necessária: as 41 famílias resolvem pela convenção. A decisão de eixos/pesos/subconjunto está no comentário do cabeçalho e no manifesto (`axes`, `weights`, `subsets: ['latin']`).
- Passo 5 — `scripts/embed-fonts.ts` (derivado de `listLoadableFamilies()` = `THEME_FONTS`) limpa e recria `<out>/fonts/`, copia os woff2 e grava `manifest.json` e `THIRD-PARTY-FONTS`. Aceita `--out` e `--modules`.
- Passo 6 — `src/core/Design/schema/typography.ts`: 22 famílias novas, por categoria, com genérico válido no `value` (Orbitron e Oswald `sans-serif`, VT323 `monospace`; a `category` segue `Display`). Os 19 `value` antigos intocados (único byte diferente numa linha antiga: a vírgula depois de `JetBrains Mono`).
- Passo 7 — `scripts/fonts/thirdPartyFonts.ts`: `THIRD-PARTY-FONTS` com índice e uma seção por família (pacote@versão, licença SPDX do `package.json`, crédito do `metadata.json` cortado antes da repetição por arquivo, `LICENSE` do pacote na íntegra). Nenhum texto de licença à mão.
- Passo 8 — `gates/scripts/contrato/check-fonts.ts` (limites R18 no cabeçalho) e `gates/scripts/contrato/__tests__/check-fonts.test.ts`. `package.json`: scripts `fonts:embed` e `fonts:check`, ambos encadeados no `build` logo depois do `build:js`. Anel 1 em `.githooks/pre-commit` (depois de `token-docs`) e `fonts:check` em `.github/workflows/gates.yml`.
- `src/core/Provider/utils/googleFontsUrl.ts`: `VT323` e `Patrick Hand` entram em `SINGLE_FACE` (+ asserção em `googleFontsUrl.test.ts`) — ver Decisões.
- `docs/migracoes.md`: subseção nova em `## 8.0.0`, inserida por substituição exata antes do separador do `## 7.0.0`.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `scripts/fonts/fontPackages.ts` | criado | Resolução família → pacote → arquivos, eixos, pesos, licença. |
| `scripts/fonts/thirdPartyFonts.ts` | criado | Geração e leitura do `THIRD-PARTY-FONTS`. |
| `scripts/embed-fonts.ts` | criado | Passo de build: copia woff2, gera manifesto e licenças. |
| `gates/scripts/contrato/check-fonts.ts` | criado | Gate `fonts:check`. |
| `gates/scripts/contrato/__tests__/check-fonts.test.ts` | criado | Teste do gate e do passo (mutações). |
| `src/core/Design/schema/typography.ts` | alterado | +22 opções em `THEME_FONTS`. |
| `src/core/Provider/utils/googleFontsUrl.ts` | alterado | `SINGLE_FACE` +2 famílias. |
| `src/core/Provider/utils/__tests__/googleFontsUrl.test.ts` | alterado | +2 asserções. |
| `package.json` | alterado | Scripts `fonts:embed`/`fonts:check`; ambos no `build`. |
| `.githooks/pre-commit` | alterado | Bloco do Anel 1 de `fonts:check`. |
| `.github/workflows/gates.yml` | alterado | `fonts:check` na lista de checks (14 → 15) e comentário. |
| `docs/migracoes.md` | alterado | Subseção MAJOR em `## 8.0.0`. |
| `specs/plan/plan-118-fontes-embarcadas.md` | alterado | Este bloco e o status. |

**Verificações executadas**
- `npx vitest run gates/scripts/contrato/__tests__/check-fonts.test.ts src/core/Provider/utils/__tests__/googleFontsUrl.test.ts src/features/DesignEngine/components/__tests__/identityFontControl.test.tsx` → 3 arquivos, 19 testes, todos passam.
- Prova do passo de cópia e do gate **fora do repositório**: o teste usa `fs.mkdtempSync(os.tmpdir())` e o CLI foi rodado com `--out` no scratchpad. `npx tsx scripts/embed-fonts.ts --out <tmp>` → `41 famílias, 60 arquivos, 1690020 bytes`, exatamente o total do anexo; `check-fonts.ts --dir <tmp>/fonts` → exit 0 (`60 woff2, 1690020 B de 3000000 B`). Removido `lato-latin-700-normal.woff2` → `❌ [file-missing] …`, exit 1. `dist/fonts/` **não** foi criado no repositório.
- Mutações provadas no teste do gate (cada uma devolve só o código esperado): arquivo removido do disco (`file-missing`, restaurado depois), licença da `Inter` removida e corpo da `Lato` esvaziado (`license-missing`), total estourado (`total-over-budget`, com arquivo extra de 3 MB, e com teto reduzido a 1 MB), teto de família reduzido abaixo da maior (`family-over-budget`, família `Merriweather`), arquivo vazio, órfão, família sem entrada, família extra, manifesto ausente.
- `npm run token-types:check` → em dia (402 tokens). `npm run catalog:check` → em dia. `npm run guide:check` → em dia. `npm run themes:catalog:check`, `barrel:check`, `zero-brand:check`, `kit-names:check`, `persistence-doc:check`, `deep-import:check`, `gate-limits:check` (52 scripts) → OK. `npm run token-docs:check` → OK. `npx tsc --noEmit` → 0 erros.
- `npm run dev-kit:check` → **defasado** em `sarak-dev/state.json`, `GUIA-MANUTENCAO.md`, `START-HERE.md`; não rodei `dev-kit` (o revisor regenera, conforme a instrução).
- Comprimento da URL `css2` de `buildGoogleFontsUrl()` com 41 famílias: **1409 caracteres** (780 com as 19 antigas). Muito abaixo de ~8 KB; nenhum achado.
- Não rodei: `npm run build`, suíte completa, baseline, Anel 0/1, navegador, `npm run guide`/`dev-kit`.

**Critérios de aceite** (os do lote 2)
- [x] `dist/fonts/` e manifesto gerados da lista única — evidência: `embed-fonts.ts` lê `listLoadableFamilies()`; saída de 41 famílias/60 arquivos/1.690.020 B no diretório temporário (o `dist/fonts/` real nasce no `build` do revisor).
- [x] `THIRD-PARTY-FONTS` gerado dos pacotes — evidência: saída do passo; 41 seções.
- [x] `fonts:check` no `build`, no Anel 1 e na CI, com mutação e orçamento — evidência: `package.json`, `.githooks/pre-commit`, `gates.yml`, teste do gate.
- [x] Os 19 `value` atuais inalterados; 22 novas como opções, com paridade — evidência: `git diff -- src/core/Design/schema/typography.ts` (só acréscimos, exceto a vírgula); `token-types:check` e `catalog:check` em dia.
- [ ] `fonts:check` verde sobre o `dist/` real — pendente: o `dist/fonts/` não existe até o revisor rodar `npm run build`.

**Decisões e suposições**
- **`SINGLE_FACE` com VT323 e Patrick Hand (fora do que a instrução listava).** A instrução pede que `googleFontsUrl` "continue funcionando" com a lista maior. Sem isso, as duas famílias de face única receberiam `wght@400;700` (o `DEFAULT_WEIGHTS`) e o Google rejeita a requisição `css2` inteira por esse eixo — o que derrubaria as fontes de todos os temas no modo padrão de hoje. É um acréscimo de dois nomes a um conjunto existente, com asserção no teste. Se o revisor preferir deixar isso ao lote 3, basta reverter essa linha e a asserção.
- **`THIRD-PARTY-FONTS` fica em `dist/fonts/THIRD-PARTY-FONTS`** (e não na raiz de `dist/`): a licença viaja com a pasta que o host copiar ao usar `baseUrl`. É o mesmo pacote e o mesmo `files`.
- **Crédito = `metadata.json`; texto = `LICENSE`.** O `LICENSE` do Satisfy (Apache 2.0) não traz linha de copyright, e o do Lato repete o crédito por arquivo; o `metadata.json` tem o crédito do titular, cortado antes do primeiro nome de arquivo de origem.
- **Orçamento:** total 3.000.000 B (decimal, como o anexo) contado sobre os `.woff2` em disco (órfão também pesa); por família 150.000 B (a maior, Merriweather, tem 97.548 B). Sem exceção por família, porque não há.
- O gate importa a lista por `listLoadableFamilies()` (fonte única do carregador), que já exclui `system-ui`.
- O `value` das novas famílias de `Display` segue o genérico mais próximo do desenho (Orbitron/Oswald `sans-serif`, VT323 `monospace`) — a instrução dizia "genérico válido", não qual.

**Achados fora do escopo (não corrigidos)**
- `.githooks/pre-commit`: o bloco novo lê `dist/fonts/`, que é saída de build. Um commit que toque código antes de o `dist/` ser reconstruído e versionado com a pasta nova será barrado pelo Anel 1 até o `npm run build`. É consequência da instrução (Anel 1), não de erro de implementação — o revisor deve buildar antes de commitar.
- `gates.yml` lista `fonts:check` entre os checks "que o `gates:full` não alcança", mas ele roda também no `build`, que o `gates:full` encadeia (mesma situação do `token-docs:check`, já listado). Comentário acrescentado; a duplicação é deliberada.
- `src/features/DesignEngine/Panels/LayoutTab.tsx:3` — a lista local de duas fontes (já no backlog 35).

**Pendências / riscos**
- `npm run build` real, `dist/fonts/` versionado, `guide`/`dev-kit` e `sarak-ui/docs/migracoes.md` (espelho de `docs/migracoes.md`) são do revisor.
- O `build` agora também depende de `node_modules/@fontsource*` instalado; clone limpo sem `npm ci` falha em `fonts:embed` com mensagem que nomeia a família.
- Nenhum tema alterado; o comportamento padrão (Google Fonts) não mudou — a nota MAJOR diz isso.

## Resumo da execução (correção 1) — 2026-10-16

**Resultado:** Concluído

**Achado 1 — paridade schema ↔ partições do catálogo (`catalog-drift`)**
- Acrescentei as 22 famílias novas, com os mesmos `value` e na mesma ordem de `THEME_FONTS`, aos `allowedValues` de `headingFont`, `bodyFont` e `monoFont` em `src/core/Design/catalog/partitions/typography.json` (20 → 42 opções cada) e de `identityFontFamily` em `src/core/Design/catalog/partitions/branding_config.json` (21 → 43). A opção `var(--font-heading, var(--font-main, inherit))` foi preservada na posição original. As listas foram geradas a partir de `THEME_FONTS` por um script temporário (scratchpad, fora do repositório); o JSON foi reescrito com o mesmo formato (ida e volta idêntica antes de alterar). Nenhum campo novo; só paridade de opções. Nenhum outro arquivo da partição citava as famílias (`grep Archivo` só achou esses dois).
- Evidência: `npx vitest run gates/scripts/audit/__tests__/catalog-drift.test.ts` → 1 arquivo, 10 testes passam. `npx vitest run src/core/Design` → 23 arquivos, 178 testes passam. `npx vitest run gates/scripts/audit gates/scripts/contrato scripts` → 52 arquivos, 616 testes passam.

**Não rodei:** suíte completa, `tsc`, baseline, Anel 0/1, navegador, `build`, `guide`, `dev-kit`.

**Arquivos alterados:** `src/core/Design/catalog/partitions/typography.json`, `src/core/Design/catalog/partitions/branding_config.json`, esta plan (bloco e status). Nada mais foi tocado.

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->

## Veredito — 2026-10-15 — lote 1 — 🟢 Aprovado (a execução); a lista final aguarda o dono

**Conferido pelo revisor, nos arquivos instalados (não pelo resumo):**
- **Escopo:** o lote só criou o anexo `plan-118-catalogo-de-fontes.md` e o resumo; nenhum arquivo de produto, `package.json` ou
  `dist/` foi tocado (as demais alterações do worktree são do lote 1 da `plan-117`, em paralelo).
- **Total reproduzido:** recalculei a proposta (16 variáveis atuais + 3 novas variáveis em `latin-wght`, 3 estáticas
  atuais e 4 estáticas novas nos pesos que o anexo declara) = **1.012.836 bytes**, exatamente o do anexo; o
  `latin-ext` das variáveis soma 677.360 B (o anexo soma 882.160 B com as estáticas que o publicam).
- **Licenças:** `Satisfy` e `Roboto Slab` são Apache-2.0 (`LICENSE` lido); as demais OFL-1.1, como declarado. Nenhuma
  impede redistribuir.
- **Cobertura:** `latin` cobre ASCII e as letras acentuadas de pt/en/es/fr/de/it; só `ẞ` e `Ÿ` ficam em `latin-ext`.

**Ponto de atenção do revisor (não reprova):** o anexo mede o arquivo `latin-wght` das variáveis — o eixo `opsz` do
Inter/Source Serif 4/DM Sans e os eixos de Fraunces (`opsz`, `SOFT`, `WONK`) ficam de fora. É a escolha certa para o
orçamento, e o lote 2 a registra no manifesto como decisão (e não como esquecimento).

**Achado fora do escopo → backlog 35:** `Panels/LayoutTab.tsx` é órfão, com uma lista de fontes própria.

**Decisões que cabem ao dono (com a recomendação do revisor):**
1. **Latin-ext (+882 KB, 46% do pacote): não entrar agora.** O ganho são dois glifos (`ẞ` maiúsculo alemão, `Ÿ`
   maiúsculo francês), que caem para a fonte do sistema **por glifo**, sem quebrar a linha. O manifesto do lote 2 deixa o
   subconjunto como campo, e adicionar depois não é MAJOR.
2. **Pesos sintéticos das estáticas: aceitar**, com a regra de documentação "a ficha do tema escolhe pesos que a
   família tem" (a `ui-criar-tema` e o `usage` de `headingFont`/`bodyFont` avisam). Patrick Hand e Space Mono ganham face
   única/dupla no carregador (nunca declarar um peso que o pacote não contém).
3. **Variedade — recomendo ir além da proposta do executor**, que cortou 10 das 17 candidatas por proximidade visual.
   Numa lib cujo diferencial é casar a **identidade de marca do cliente**, "parecida com Inter" não é critério de
   exclusão: o cliente chega com a fonte dele. Com ~1,4 MB livres no orçamento de 3 MB, recomendo entrar:
   - as **três que os temas já pediram** (a direção de arte do cyber/terminal as quer): **Orbitron** (11,5 KB),
     **VT323** (17,5 KB) e **Fira Code** (35,4 KB);
   - **DM Sans, Manrope e Work Sans** (sans de marca de uso corrente), **Lora** (serif de leitura) e **Oswald**
     (condensada de títulos) — ~175 KB somados.
   Catálogo: **34 famílias**, ~1,25 MB em `latin` (< 3 MB, nenhuma > 150 KB).
4. **Segunda onda de candidatas para medir (opcional):** Poppins, Open Sans, Lato, Raleway, Source Sans 3,
   Merriweather, PT Serif — as mais usadas por marcas de cliente, que não estavam na lista inicial. Pede um lote 1b
   (instalar e medir), antes do lote 2.

**Status: 🔴 A executar (lote 2).** Fica retida por duas coisas: a decisão do dono acima e a `plan-117` 🟢.

## Veredito — 2026-10-15 — lote 1b — 🟢 Aprovado

**Conferido nos arquivos instalados:** a segunda onda soma **432.812 B**, as oito inclusões do dono **244.372 B** e a
base do lote 1 **1.012.836 B**: **1.690.020 B** para 41 famílias, exatamente o do anexo (folga de ~1,31 MB contra 3 MB,
maior família Merriweather, 97.548 B). As sete são OFL-1.1 (`package.json` lido). O escopo foi só o anexo e o resumo.

**Catálogo final para o lote 2: as 41 famílias do anexo** (a regra do dono — proximidade não exclui — foi aplicada, e
ele aceitou a segunda onda). `latin` só; o manifesto guarda o campo de subconjuntos.

**Instruções ao lote 2 (acrescentam ao anexo, não o substituem):**
1. **Valores com genérico válido.** O anexo propõe `"'Orbitron', display"` etc., e `display` **não é** uma família
   genérica de CSS (o padrão antigo `"'Unbounded', display"` já tinha o defeito). Para as famílias **novas**, o `value`
   termina num genérico válido (`sans-serif`, `serif`, `monospace`, `cursive`); a **categoria** do painel continua em
   `category`. Os 19 `value` existentes ficam como estão (tema salvo guarda a string).
2. **Eixos que ficam de fora, por decisão:** o carregador usa o arquivo `latin-wght` das variáveis; `opsz`/`wdth`/`SOFT`/
   `WONK` (Inter, Merriweather, Source Serif 4, DM Sans, Fraunces) não entram. Registrar no manifesto e na
   documentação, não deixar como esquecimento.
3. **Pesos:** o manifesto declara só os pesos com arquivo; `Poppins` (7 pesos) e `Lato` (4) são as estáticas mais
   pesadas — o carregador só busca o peso que o design pede.

**Status: 🔴 A executar (lote 2).** Retida pela `plan-117` 🟢 (a dependência declarada).

## Nota do revisor — 2026-10-16 — paralelismo

A verificação passou a ser só do revisor e **a regeneração dos gerados de kit (`guide`, `dev-kit`) também**: o executor edita as fontes e roda só o teste do que escreveu; o revisor regenera uma vez. Por isso o lote 2 desta plan roda **em paralelo** com o lote 2 da `plan-117` (arquivos de código disjuntos: cartões e estilos × build, `typography` e `package.json`). A dependência declarada no frontmatter vale para o fechamento (🟢), não para despachar o lote 2.

## Veredito — 2026-10-16 — lote 2 — 🔴 Reprovado (1 achado)

**Conferido no worktree:** `npm run fonts:embed` + `fonts:check` reais: **41 famílias, 60 woff2, 1.690.020 B** (o total do
anexo), `dist/fonts/` com `manifest.json` e `THIRD-PARTY-FONTS` (212 KB, uma seção por família, Apache-2.0 do Satisfy
presente, Reserved Font Names declarados); manifesto de Lato (300/400/700/900), Poppins (7 pesos), PT Serif (400/700),
Patrick Hand (400) e Inter/Fraunces (`wght` 100–900) conferido; `tsc` 0; os 22 `value` novos com genérico válido e os 19
antigos intactos (único byte antigo diferente: a vírgula depois de `JetBrains Mono`); `fonts:check` no `build`, no
Anel 1 e na CI. Teste do gate com mutação, `googleFontsUrl` (URL `css2` de 1.409 caracteres) e o recorte
`src/core/Design src/core/Provider src/features/DesignEngine gates/scripts/contrato scripts`: **1.674/1.675**. O
acréscimo de `VT323` e `Patrick Hand` ao `SINGLE_FACE` é correto e fica (sem ele o Google rejeita o `css2`).

**Achado:**

1. **A paridade schema ↔ partições do catálogo quebrou — `gates/scripts/audit/__tests__/catalog-drift.test.ts` falha**
   (*"o catálogo tem o tipo e os valores permitidos do schema, nos tokens do schema"*): `identityFontFamily`,
   `headingFont`, `bodyFont` (e o quarto token de fonte que a saída lista) têm no schema as 41+ opções, mas
   `src/core/Design/catalog/partitions/typography.json` e `branding_config.json` ainda trazem as 19 antigas
   (`allowedValues`). Critério violado: a paridade 1:1:1 (`04`, R4) — o executor conferiu `token-types:check` e
   `catalog:check`, que não olham as partições, e não rodou o teste de drift, que é o que cobra o `allowedValues`.
   **Correção:** acrescentar as 22 famílias novas, **com os mesmos `value`** do schema e na mesma ordem, aos
   `allowedValues` de cada token de fonte nas partições (`typography.json`, `branding_config.json`, e onde mais o teste
   apontar), pela skill `ui-refatorar-componente`/`ui-novo-componente`; rodar `catalog-drift.test.ts` e
   `src/core/Design` até verdes.

A verificação **completa** (suíte inteira, baseline, Anel 1, build) roda **uma vez**, depois do lote 2 da `plan-117`,
sobre as duas plans juntas; se ela acusar algo atribuível a esta, reabro.

**Status: 🔵 Em correção.** O resto da entrega está aprovado como está.

## Veredito — 2026-10-16 — correção 1 (lote 2) — 🟢 Aprovado

**Conferido pelo revisor, na verificação conjunta com a `plan-117`:** as 22 famílias estão nos `allowedValues` de
`headingFont`, `bodyFont`, `monoFont` e `identityFontFamily` nas partições, e **`catalog-drift.test.ts` passa dentro da
suíte completa**. Regenerei `token-types`, `guide` e `dev-kit`; `npm run build` real **OK** (com `fonts:embed` e
`fonts:check`: 41 famílias, 60 woff2, 1.690.020 B no `dist/fonts/`); `npm run verify --tier=full`: `tsc`, **suíte completa
sem falha**, baseline com `tsc`, os 23 gates do Anel 1, R36, `guide`/`dev-kit` e Anel 0 (1.433 linhas, 0 achados)
verdes (o único vermelho foi o índice de plans defasado, que regenerei — não é desta plan). Navegador (348 casos): 346
passaram; as 2 falhas não são desta entrega (ver o veredito da `plan-117`).

**Lote 2 da `plan-118` fechado.** Pipeline, catálogo de 41 famílias, `THIRD-PARTY-FONTS`, gate `fonts:check` (build,
Anel 1, CI) e paridade das partições.

**Status: 🔴 A executar (lote 3: o carregador em runtime e `options.fonts`).**
