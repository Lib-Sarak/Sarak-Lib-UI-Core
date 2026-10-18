---
tipo: "anexo"
titulo: "plan-110 — Direção de arte do conjunto de temas embarcados"
dominio: "Design Engine / Temas embarcados / Design e UX"
status: "🟠 Aguardando aprovação do dono"
relacionados: ["[[plan-110-temas-que-mostram-a-biblioteca]]", "[[09-temas-e-presets]]"]
---

# 0. Para que serve, e o que se pede ao dono

Este é o documento do **lote 0** da `plan-110`. Ele audita os 14 temas de hoje, mede o peso deles, mapeia o
arsenal **que de fato desenha alguma coisa**, propõe o conjunto de 19 e escreve uma ficha por tema. Nenhum código
foi tocado. Os lotes 1 a 3 só começam depois da aprovação.

**Decisões que só o dono toma** (cada uma com a recomendação; o resto do documento já assume a recomendação):

| # | Decisão | Recomendação |
|---|---|---|
| D1 | Aprovar o **mapa do conjunto** (§5) e as **19 fichas** (§7) | aprovar |
| D2 | Dois temas atuais **mudam de modo nativo**: `neo-brutalism` (escuro → **claro**) e `cyber-retro-wave` (escuro → **claro**, e o conceito vira *Y2K cromado*) | aprovar: o brutalismo é um estilo de papel e cor chapada, e o `cyber-retro-wave` hoje é um sinônimo do `synthwave-retro`. Sem as duas trocas, o conjunto continua com 8 temas no canto escuro e neon |
| D3 | `synthwave-retro` troca a primária de laranja (H16) para **rosa** (H330) | aprovar: hoje ele colide em família com o `industrial-terminal` (âmbar) |
| D4 | Os **ids dos 5 novos** (§8) | `editorial-ink`, `organic-clay`, `high-contrast`, `corporate-ledger`, `playful-pastel` |
| D5 | O **teto de peso** (§4.4) | conjunto ≤ **28 KB gzip**; tema ≤ **4,5 KB gzip**; arte SVG em no máximo **2 temas**, ≤ **1,5 KB** em base64 por arquivo |
| D6 | O critério "os 4 modos de gradiente" do teste (b) **mede um token que não desenha nada** (§3.2, achado A1) | tirar o critério do teste (b) e registrar o achado. Manter o critério cobra uma variedade que ninguém vê |
| D7 | `high-contrast` liga `reducedMotion: true` no próprio tema | aprovar: o público do tema é quem precisa de menos estímulo. Ressalva: isso vale para **todo** usuário do tema, não só para quem pediu |

Os valores de cor das fichas são **âncoras**. O solucionador da skill `ui-criar-tema` só ajusta a luminosidade
do texto, e é ele que fecha o contraste no lote 1. Matiz, saturação, estrutura e escolha de recurso **são** a
direção. É sobre elas que se pede aprovação.

---

# 1. Auditoria do conjunto atual (medida em 2026-10-11)

## 1.1 Os números

Scripts de leitura sobre `SARAK_GLOBAL_THEMES`, `MASTER_DESIGN_MAP` e as partições do catálogo (método na §4.1).
Todos batem com a tabela da §2 da plan:

| Medida | Hoje |
|---|---|
| Tokens no dicionário | 439 |
| Tokens que cada tema define | 256 a 268 |
| Tokens que **nenhum** tema define | 169. Por schema: `cards` 42, `specialized` 29, `typography` 16, `navigation` 13, `overlays` 12, `inputs` 12, `structural` 12, `buttons` 11, `tables` 7, `preferences` 5, `status` 3, `atmosphere` 2, `chat` 2, `global` 1, `cardTitle` 1, `engineering` 1 |
| Tokens com o **mesmo** valor nos 14 | 11: `identityRedirectUrl`, `layout`, `isSplitViewEnabled`, `borderStyle`, `isNavHidden`, `cardBorderOpacity`, `cardVariant`, `switchStyleType`, `chartShowGrid`, `zIndexToast`, `zIndexBase` |
| Tokens com `visualImpact` | **22**. Dois temas não definem `texture` (`minimalist-airy`, `neumorphic-mobile`), e **nenhum** define `mobileNavigationStyle` |
| `cardTextureType` | 3 valores: `none` (9), `grid` (4), `scanlines` (1) |
| Fonte de título / de corpo | 7 / 6 valores. **Quatro famílias usadas não são carregadas pela lib** (achado A6) |
| Ícones | 9 temas Lucide (todos os 5 claros com Lucide regular), 4 Phosphor, 3 Tabler |
| `btnStyleType` | 6 valores |
| `pageTransitionType` | não definido em 6 temas, `fade` em 7 e `zoom` em 1 |
| `chartType` | `line` em 12, `bar` em 2 |
| Modo nativo | 9 escuros e 5 claros. Medidor de diversidade: **9 de 14 com primária S=100**, 4 de 14 na família ciano+magenta e só 2 com fundo de luminosidade média |

## 1.2 Tema a tema, com olho de designer

| Tema | O que comunica | Onde é genérico | Colide com | O que do arsenal ignora |
|---|---|---|---|---|
| `sarak-sovereign` | painel de comando escuro, ciano e violeta, vidro | primária neon S=100 igual a mais oito; sem textura de fundo nem de cartão | `cyberpunk-neon`, `cyber-retro-wave` (escuro, sidebar, néon) | textura, transição de página, tipo de gráfico, navegação no celular |
| `cyberpunk-neon` | terminal hacker verde | mesma fonte, cartão e gráfico de metade do conjunto; `chartColorPalette` é o ciano do sovereign (`#00f2ff`), não o verde dele | `industrial-terminal`, `data-terminal` (mono, terminal) | botão `cyberpunk`, que ele, o mais "cyberpunk" do conjunto, não usa |
| `industrial-terminal` | CRT âmbar, chapa, mono | corpo de 12px mono deixa a leitura longa cansativa | `cyberpunk-neon` | contraparte clara sem identidade própria; textura de fundo e de cartão iguais (`grid`) |
| `neo-brutalism` | cor primária pura sobre preto | o brutalismo da web é **claro**: papel, borda preta grossa, cor chapada. Escuro com `textColorMaster #838383`, ele perde o contraste que define o estilo | nenhum tema forte. É fraco em si | cartão sem textura, transição, gráfico (`#00f2ff` herdado) |
| `synthwave-retro` | pôr do sol anos 80 | primária laranja H16 a 20° do âmbar do `industrial-terminal` | `cyber-retro-wave`, `kinetic-flow` | arte de fundo (o horizonte é o símbolo do estilo e não está lá) |
| `nebula-space` | espaço profundo, rosa e ciano | rosa+ciano é a paleta de mais três temas; `texture: grid` num tema de espaço | `cyber-retro-wave`, `sarak-sovereign` | `nebula`/`stars` (texturas de espaço que existem e ele não usa), sidebar flutuante |
| `kinetic-flow` | movimento, esporte, magenta | o "movimento" se resume à curva de easing | `cyber-retro-wave` (magenta H340 × H300) | `slide-side`, `cardHoverStyle: expand`, navegação na base |
| `cyber-retro-wave` | sinônimo de `synthwave-retro` | três fontes que a lib não carrega (`Orbitron`, `Chakra Petch`, `VT323`): na tela, cai na fonte de reserva | `synthwave-retro`, `nebula-space`, `kinetic-flow` | quase tudo o que o diferenciaria |
| `minimalist-airy` | branco absoluto, tinta | é a referência e cumpre o papel. O `tooltipTextColor #738ecd` sobre `#1e293b` é um azul apagado | `neumorphic-mobile` (claro, topbar, Lucide regular, sem textura) | `texture` (chave ausente), navegação no celular |
| `data-terminal` | terminal claro verde | conceito idêntico ao `industrial-terminal`, só que claro | `cyberpunk-neon` (verde, mono) | tipo de gráfico (é o tema de dados e usa `line` como todos) |
| `neumorphic-mobile` | cinza macio, mobile | `mobile` no nome, e nenhuma escolha de celular: sem navegação na base, alvo de toque padrão | `minimalist-airy` | `mobileNavigationStyle`, `touchTargetMin`, `texture` (chave ausente) |
| `golden-hour` | quente, dourado | título `Outfit` como mais três temas; dourado sem textura no cartão | `aurora-veil` (claro, Outfit, Lucide 1.5) | fonte serifada, grão fotográfico |
| `aurora-veil` | vidro lavanda | — (é dos mais coerentes) | `neumorphic-mobile` (distância 3 de 10, §5.2) | `bgGradientMode: mesh` (que de todo modo não desenha, achado A1) |
| `blueprint-protocol` | desenho técnico azul | cartão `grid` como mais três temas | `industrial-terminal` (compact, mono, Tabler) | `blueprint` como textura de cartão, sidebar à direita |

**Leitura do conjunto.** Os 14 usam **60% do dicionário**. O que falta não é cor. É a parte que torna um tema
**inconfundível**: textura de cartão, tipografia com caráter, peso de ícone, movimento com propósito, densidade e
o que acontece no celular. Seis temas são variações de "escuro com néon", e nenhum tema mostra os recursos
deste ciclo (navegação na base, alvo de toque, movimento reduzido, largura máxima).

---

# 2. O que o conjunto proposto corrige, em uma linha cada

- **Modo:** de 9 escuros e 5 claros para **8 e 11**. O canto escuro fica com um tema por família de matiz.
- **Néon:** um único tema de néon puro (`cyberpunk-neon`). Os outros escuros ganham conceitos distintos: comando,
  CRT, synthwave, espaço, esporte, prancheta e alto contraste.
- **Arsenal:** cada tema define **todos os 440 tokens**: parte do `getScaffold()` e não deixa nenhum no padrão de
  fábrica (§6, regra 1).
- **Recursos deste ciclo:** 5 temas com navegação na base, 5 com gaveta, 3 com alvo de toque acima de 44px, 1 com
  movimento reduzido, 4 larguras máximas diferentes e 3 posições de sidebar.

---

# 3. O arsenal real: o que desenha e o que não desenha

A direção só promete o que o código entrega. Antes de escolher valores, conferi quem **consome** cada token
(busca do id e de cada `cssVars` em `src/`, fora de schema, presets, catálogo, gerados e testes).

## 3.1 Alavancas que funcionam, e que a direção usa

Cor (todas as famílias), `cardTextureType` e `texture` (41 opções, §3.3), fontes (as 20 de `THEME_FONTS`), ícone
(família, peso e traço, `SarakIcon`), raios por canto, borda, corte geométrico (`cardGeometricCut`), vidro
(`glassBlur`, `cardBackdropBlur`), vinheta, `cardHoverStyle`, `pageTransitionType` (`SarakPageTransition`), curvas e
durações, `chartType`, `chartThickness`, `chartSmoothing`, `chartColorPalette`, `layoutDensity`, `maxContentWidth`,
`navigationStyle`, `sidebarPosition`, `mobileNavigationStyle`, `touchTargetMin`, `reducedMotion`,
`focusRingWidth`, `headingTransform` e `identityFontFamily`.

## 3.2 Alavancas que **não desenham**, e o que a direção faz com elas

| Token | O que se mediu | Como a direção trata |
|---|---|---|
| `bgGradientMode`, `bgGradientAngle` | só emitem `--sarak-bg-gradient-mode`/`-angle`, e **nenhum** CSS nem componente lê essas variáveis | o tema define o valor (o teste (a) cobra), mas o gradiente que se vê vem de atmosfera do motor (`mesh`, `aurora`, `fluid`, `nebula`) ou de arte SVG. **D6** |
| `surfaceMaterial` (**marcado `visualImpact`**) | vira `data-surface`, mas o CSS desenha `metallic`, `brushed`, `acrylic` e `matte`, enquanto as opções do schema são `frosted`, `sleek`, `industrial` e `organic`. Nenhuma das quatro tem regra | definido por coerência semântica. A ficha não promete efeito |
| `shadowColorMode` | o CSS conhece `match` e `adaptive`; as opções são `neutral`, `colored` e `ambient` | idem |
| `systemTone` (**`visualImpact`**) | só `cyber` tem regra em `_base.css`. `dark`, `light` e `tactical` não desenham nada | só o `kinetic-flow` mantém `cyber`, onde o efeito combina |
| `switchStyleType` | nenhum consumidor | idem |
| `atmosphereNoiseOpacity`, `noiseIntensity` | emitem `--sarak-noise-opacity`, que ninguém lê. O ruído de fundo lê `--sarak-noise-density` (`bgNoiseDensity`) | a direção usa `bgNoiseDensity` e as opacidades de ruído do cromo |
| `cardVariant` (**`visualImpact`**) | não é estilo: escolhe **qual card** o `SarakCardGrid` renderiza (`classic`, `title`, `action`, `search`) | `classic` em todos. Um tema que trocasse esse valor mudaria o conteúdo da grade do consumidor |
| sombra de cartão | `_cards.css` desenha `0 20px 50px -12px` fixo; o tema só controla a opacidade (`cardShadowSpread`) | a sombra dura deslocada do brutalismo **não é alcançável**. O `neo-brutalism` compensa com borda grossa e sombra zero |

## 3.3 Texturas: a cor de cada uma decide em que modo ela aparece

Das 41 texturas, a maioria pinta com `--theme-texture-color`, com a primária ou com a borda, e funciona nos dois
modos. **Seis desenham em branco fixo** e somem sobre superfície clara: `brushed`, `frosted`, `topo-deep`,
`prism-mesh`, `blueprint-pro` e `wave-pulse`. A direção as usa só onde a superfície por baixo é escura ou média, e a
contraparte troca a textura quando o modo oposto a apagaria. Cada ficha diz isso.

## 3.4 Fontes: só existe o que a lib carrega

A lib carrega webfonts por um `@import` do Google Fonts (`useSarakUIEffects.ts`) com **19 famílias**, as de
`THEME_FONTS` menos `system-ui`. Toda fonte de tema sai **dessa lista, com o valor exato da lista**
(`"'Fraunces', serif"`). Os temas de hoje escrevem `"\"Inter\", sans-serif"`. O CSS resolve igual, mas o painel
compara por string e não reconhece a opção.

---

# 4. Peso

## 4.1 Método (reproduzível)

1. **Bundle isolado:** `esbuild` com `bundle`, `minify` e `format: esm` sobre
   `src/core/Design/presets/themes/index.ts`; `gzip -9` da saída. O mesmo para cada arquivo de tema.
2. **Boot do `dist/`:** soma do `gzip -9` de `dist/index.js` e dos 9 chunks que ele importa estaticamente. Os temas
   moram em `dist/chunk-SF4ILM6Z.js`, um desses 9, e por isso pesam no boot de todo consumidor. O `dist/` medido foi
   gerado sobre `29dfb52`; `git diff --stat 29dfb52 HEAD -- src/core/Design/presets/themes` é vazio.
3. **Projeção:** 19 temas com os **440** tokens (padrão de fábrica sobreposto pelo tema real; os 5 excedentes com cores
   perturbadas para não comprimirem como cópia), com a contraparte, serializados em JSON e com `gzip -9`. Os 14
   atuais, no mesmo formato, dão 14,4 KB, o que valida o formato contra os 14,1 KB do bundle.

## 4.2 Medido

| Medida | Valor |
|---|---|
| `SARAK_GLOBAL_THEMES`, bundle isolado | 106,5 KB minificado · **14,1 KB gzip** |
| Por tema, isolado | 6,8 a 8,4 KB minificado · **2,3 a 2,8 KB gzip** |
| Boot do `dist/` (`index.js` + 9 chunks estáticos) | **209,2 KB gzip** |
| Fração do boot que é tema | **6,8%** |

## 4.3 Projetado

**19 temas completos ≈ 21,8 KB gzip** (+7,7 KB, cerca de +3,7% do boot). A projeção subestima um pouco, porque
temas autorados repetem menos valores que o padrão de fábrica.

## 4.4 Teto proposto (D5)

- **Conjunto:** ≤ **28 KB gzip** pelo método 4.1.1. São a projeção, mais o espaço da arte, mais 1,7 KB de folga
  para valores distintos.
- **Tema:** ≤ **4,5 KB gzip** isolado, arte incluída.
- **Arte SVG embutida** (`data:image/svg+xml;base64,…`): no máximo **2 temas** (`synthwave-retro` e
  `organic-clay`); ≤ **1,5 KB** de string base64 por arquivo; no máximo 2 arquivos por tema (nativo e contraparte).
  Base64 comprime mal (cerca de 75%), então 4 arquivos custam cerca de 4,5 KB gzip. Por isso a regra é **atmosfera do
  motor primeiro**: ela custa zero byte de tema.

Carregar temas sob demanda tiraria o custo do boot, mas muda o barril público e está fora do escopo. Fica
registrado como alternativa, não como proposta.

---

# 5. O mapa do conjunto

## 5.1 Os 19, posicionados

Temperatura: **Q** = quente · **F** = fria · **N** = neutra. A família é a do medidor de diversidade
(`verify_diversity.ts`, `HUE_FAMILIES`).

| # | id | Conceito em uma frase | Público | Modo | Família (H) | Temp. | Densidade |
|---|---|---|---|---|---|---|---|
| 1 | `sarak-sovereign` *(ref.)* | sala de comando: vidro escuro, ciano contido, constelação | SaaS técnico, painel de operação | escuro | ciano (186) | F | confortável |
| 2 | `cyberpunk-neon` | o néon do conjunto: verde ácido, corte em quina, glitch | dev tools, segurança, jogos | escuro | verde (144) | F | confortável |
| 3 | `industrial-terminal` | CRT âmbar de chão de fábrica: chapa, listra de perigo, zero raio | indústria, logística, monitoramento | escuro | laranja (33) | Q | compacta |
| 4 | `neo-brutalism` | papel creme, borda preta grossa, cor chapada | marcas jovens, criativo, portfólio | **claro** | amarelo (50) | Q | confortável |
| 5 | `synthwave-retro` | noite de 1986: horizonte, sol listrado, rosa e laranja | música, eventos, entretenimento | escuro | magenta (330) | Q | confortável |
| 6 | `nebula-space` | espaço profundo: nebulosa, estrelas, vidro, ícone fino | pesquisa, IA, produtos "exploratórios" | escuro | roxo (264) | F | espaçosa |
| 7 | `kinetic-flow` | esporte e performance: grafite, coral, movimento elástico | fitness, apps de desempenho, telemetria | escuro | vermelho (5) | Q | compacta |
| 8 | `cyber-retro-wave` | Y2K cromado: prata, vidro iridescente, ciano elétrico | consumo, música, tecnologia de varejo | **claro** | ciano (197) | F | confortável |
| 9 | `blueprint-protocol` | prancheta de engenheiro: cianótipo, traço fino, sidebar à direita | engenharia, CAD, arquitetura | escuro | azul (210) | F | compacta |
| 10 | `minimalist-airy` *(ref.)* | branco absoluto, tinta, respiro | qualquer produto que precise de neutralidade | claro | azul (221, S39) | N | espaçosa |
| 11 | `data-terminal` | caderno de laboratório: menta, grade, números em mono | ciência de dados, BI, laboratório | claro | verde (155) | F | compacta |
| 12 | `neumorphic-mobile` | macio e tátil, feito para o polegar | app móvel, IoT, casa inteligente | claro | neutro | N | confortável |
| 13 | `golden-hour` | luxo quente: serifa de vitrine, grão de filme, mel | hotelaria, varejo premium, gastronomia | claro | laranja (39) | Q | espaçosa |
| 14 | `aurora-veil` | vidro lavanda sobre aurora boreal | bem-estar, criativo calmo, SaaS de produto | claro | roxo (264, S40) | F | confortável |
| 15 | `editorial-ink` *(novo)* | papel e tinta: serifa, coluna de leitura, oxblood | publicação, documentação, base de conhecimento | claro | neutro | Q | espaçosa |
| 16 | `organic-clay` *(novo)* | argila e madeira: fundo de barro, musgo, terracota | agro, sustentabilidade, artesanato, bem-estar | claro (fundo **médio**) | verde (75, S30) | Q | confortável |
| 17 | `high-contrast` *(novo)* | preto absoluto, amarelo e branco a 7:1, sem movimento | acessibilidade, governo, quiosque | escuro | amarelo (52) | N | confortável |
| 18 | `corporate-ledger` *(novo)* | livro-razão: índigo sóbrio, tabela densa, risca de giz | ERP, finanças, back-office | claro | azul (250, S45) | F | compacta |
| 19 | `playful-pastel` *(novo)* | pastel e redondo: coral, céu, manteiga, movimento que quica | infantil, educação, consumo leve | claro | vermelho (352, S80) | Q | espaçosa |

## 5.2 A prova de que nenhum par é redundante

Régua: número de eixos, entre 10, em que dois temas diferem. Os eixos são modo, família de matiz, temperatura,
densidade, fonte de título, textura de cartão, estilo de botão, família de ícone, navegação e transição de página.
O cálculo foi feito sobre as fichas da §7:

| | Hoje (14) | Proposto (19) |
|---|---|---|
| Menor distância entre dois temas | **3** (`cyberpunk-neon` × `synthwave-retro`; `neumorphic-mobile` × `aurora-veil`) | **5** (todo par difere em pelo menos metade dos eixos) |
| Triplas textura de cartão + botão + fonte de título repetidas | 2 | **0** |
| Família + modo repetidos no **escuro** | ciano/magenta/laranja/verde repetidos (6 temas em 3 famílias) | **nenhum**: 8 escuros, 8 famílias |

Os pares mais próximos da proposta, todos com distância 5, e o que os separa além dos cinco eixos:

| Par | Iguais | O que os separa de fato |
|---|---|---|
| `sarak-sovereign` × `cyberpunk-neon` | modo, temp., densidade, Phosphor, sidebar | vidro calmo e ciano contido × néon ácido S100, corte em quina, botão `cyberpunk`, glow |
| `blueprint-protocol` × `corporate-ledger` | azul, fria, compacta, Tabler, fade | escuro × claro; cianótipo sobre papel × risca de giz; sidebar direita × esquerda |
| `data-terminal` × `corporate-ledger` | claro, fria, compacta, sidebar, fade | verde laboratório, gráfico de área, mono × índigo, barras, Roboto, largura fluida |
| `golden-hour` × `organic-clay` | claro, quente, matte, Phosphor, sidebar | serifa Playfair, branco quente e grão × fundo de barro médio, madeira e musgo |
| `minimalist-airy` × `neumorphic-mobile` | claro, neutra, sem textura, Lucide, topbar | espaço branco e traço fino × relevo macio, botão `neumorphism` e navegação na base |
| `neo-brutalism` × `organic-clay` | claro, quente, confortável, matte, slide-up | amarelo chapado e borda preta 3px × terra, madeira e raio orgânico |

**Três famílias se repetem no claro** (neutro, verde e azul), sempre entre um tema antigo e um novo e com 70° ou
mais de distância de matiz, ou com saturação oposta. Nos três casos os dois temas diferem em todos os outros eixos.

## 5.3 Os 5 novos contra o medidor de diversidade

`npm run themes:diversity -- --new editorial-ink,organic-clay,high-contrast,corporate-ledger,playful-pastel`,
avaliado sobre as âncoras das fichas:

| Critério | Esperado |
|---|---|
| 1. ≥2 claros, ≥1 com S≥60 | 4 claros; `playful-pastel` S80 ✅ |
| 2. ≥1 com fundo de luminosidade 25..75 | `organic-clay` (barro, L≈66) ✅ |
| 3. ≥2 com S entre 20 e 55 | `organic-clay` S30 · `corporate-ledger` S45 ✅ |
| 4. no máximo 1 com S≥90 | só `high-contrast` (amarelo S100) ✅ |
| 5. zero novo em ciano ou magenta | ✅ |
| 6. nenhum novo a menos de 25° de um atual na mesma família e modo | `corporate-ledger` H250 × `minimalist-airy` H221 = 29°; `organic-clay` H75 × `data-terminal` H155 = 80° ✅ |
| 7. nenhum par dos 5 com família + modo iguais | neutro/claro · verde/claro · amarelo/escuro · azul/claro · vermelho/claro ✅ |
| 8. os 5 cobrem as duas navegações | topbar (editorial, lúdico) e sidebar (barro, contraste, livro-razão) ✅ |
| 9. raio, borda, blur e densidade não todos na mesma faixa | raio 0 a 28, borda 0 a 2, densidade nas três ✅ |

## 5.4 Cobertura do conjunto (o critério do teste (b))

| Exigência do teste (b) | Proposto |
|---|---|
| ≥15 texturas de cartão | **16** (fora `none`, que fica em 3 temas) |
| ≥10 fontes | **15** (título + corpo) |
| 3 famílias de ícone, ≥4 pesos | Phosphor 6 pesos · Lucide 4 · Tabler 4 · **6 pesos no conjunto** |
| 4 modos de gradiente | os 4 aparecem. **Mas ver D6** |
| nenhuma tripla textura + botão + título repetida | **0** repetidas |

Os seis `btnStyleType` e os cinco `pageTransitionType` aparecem.

---

# 6. Regras do conjunto (valem para as 19 fichas)

1. **Completo por construção.** Todo tema parte de `getScaffold()` e escolhe valor para os 440 tokens. Isso cobre o
   teste (a) e vai além dele: nenhum tema cai no padrão de fábrica de componente (os 169 de hoje). As exceções são
   chaves que o tema **não** declara de propósito: as posições de preferência e de composição da barra
   (`preference*Position`, `chrome*Position`), que valem o padrão de fábrica quando ausentes
   ([[09-temas-e-presets]] §4.7; [[06-painel-de-customizacao-e-preview]] §2.1.1).
2. **`contraparte` desenhada, não derivada:** fundos em camadas, a família de matiz da marca atravessando os dois
   modos, `colorBgModal` e toda superfície sobrepostos, e a cor funcional (item ativo, link) reajustada quando a da
   marca perderia contraste. A contraparte também troca `texture`/`cardTextureType` quando a textura nativa é de
   branco fixo (§3.3).
3. **Contraste:** texto ≥ 4,5:1 nos dois modos (R31). O `high-contrast` mira **7:1** em todos os pares. O gate não
   mede 7:1, e o lote 1 relata a razão de cada par desse tema. Contraste não textual (borda de campo e de cartão
   contra o fundo, 3:1) é relatado por tema e modo.
4. **Hover de navegação** preenchido nas duas orientações (`sidebarHoverColor`, `topbarHoverColor`) e distinto do
   repouso, medido pela varredura do `SarakMenuItem`. `enabledLanguages` com os seis idiomas.
5. **Fontes** só de `THEME_FONTS`, com o valor exato da lista (§3.4). As quatro fontes manuscritas entram **só** em
   `identityFontFamily` (o nome do sistema no cromo), nunca em texto corrido.
6. **Ícones:** `fill` e `duotone` só com Phosphor, porque Lucide e Tabler aproximam o peso pelo traço. Em
   Lucide/Tabler, `iconStrokeWidth` acompanha o peso, no passo de 0,5 do schema: thin 1 · light 1,5 · regular 2 · bold 2,5. `chartThickness` tem passo 1.
7. **Gráfico.** As séries recebem, nesta ordem, `chartColorPalette`, `secondaryColor`, `accentColor`, as quatro de
   status e `tertiaryColor` (`CHART_COLOR_TOKENS`). Cada ficha dá as três primeiras. A sequência de 8 de cada tema é
   validada no lote 1 com o validador da skill `dataviz` (`validate_palette.js --mode <modo> --surface <cardBackgroundColor>`),
   nos dois modos. As quatro de status como séries 4–7 contrariam a regra da `dataviz` de cor de status reservada
   (achado A8). A direção não contorna isso pelo tema.
8. **Movimento com propósito:** toda transição de página e todo hover de cartão combinam com o conceito. As durações
   ficam entre 0 e 500 ms (ou entre 0 e 0,5 s nos tokens `motion*`). O `reducedMotion` do usuário sempre vence (o
   `_motion.css` já garante isso).
9. **Celular:** `touchTargetMin` nunca abaixo de 44. `mobileNavigationStyle` explícito em todos (`auto` também é
   escolha).
10. **Fundo offline:** atmosfera do motor primeiro. Arte SVG própria só nos 2 temas da §4.4. Nunca URL.

---

# 7. Fichas

Formato das cores: **nativo → contraparte**. "Primária / 2.ª / destaque" são `primaryColor` / `secondaryColor` /
`accentColor`, que também são as três primeiras séries de gráfico, salvo quando `chartColorPalette` difere.

### 1. `sarak-sovereign` — Sovereign *(referência escura)*
- **Conceito:** sala de comando: vidro escuro sobre constelação, ciano contido. **Público:** SaaS técnico, operação.
- **Paleta:** fundo `#06080d` / camada `#0b0f17` / cartão `#101622` a 72% → `#f3f6fa` / `#ffffff` / `#ffffff`.
  Texto `#f2f6fb` → `#0b1220`. Primária `#19e3f0` (H184 S88, sai do S100) / 2.ª `#7c5cff` / destaque `#ff4fd8`.
  Item ativo no claro: `#0a7f8a`.
- **Tipografia:** `Outfit` 800 / `Inter` 400, 14px, h1 48. **Ícone:** Phosphor `fill`.
- **Fundo:** `texture: constellation`, vinheta 0,3, `bgGradientMode: radial`. **Cartão:** `micro-dots` 0,06,
  raio 14, borda 1px, blur 12, `cardHoverStyle: glow-only`, brilho interno ciano fraco.
- **Botão:** `frosted`, raio 10. **Campo:** fundo vidro, raio 10, foco ciano.
- **Gráfico:** `area`, traço 2, suavizado; séries ciano / violeta / magenta.
- **Movimento:** `Expo Glide`, 300 ms, `fade`. **Densidade:** confortável, 1440px.
- **Navegação:** sidebar à esquerda, 260; celular `auto`, toque 44.
- **O que só ele mostra:** a referência escura completa. Vidro + constelação + Phosphor preenchido como linguagem de
  produto, sem virar néon.

### 2. `cyberpunk-neon` — Cyberpunk Neon
- **Conceito:** o néon do conjunto: verde ácido, quinas cortadas, glitch. **Público:** dev tools, segurança, jogos.
- **Paleta:** fundo `#030604` / cartão `#07110a` → `#eef5ef` / `#ffffff`. Texto `#d6ffe0` → `#06210f`.
  Primária `#00ff6a` (H144 S100) / 2.ª `#ff2bd6` / destaque `#f9f871`. Ativo no claro `#007a33`.
- **Tipografia:** `JetBrains Mono` 800 maiúsculas / `Space Grotesk` 400, 14px. **Ícone:** Phosphor `duotone`.
- **Fundo:** `cyber-binary` (branco fixo) → na contraparte, `circuit-pro`. `bgGradientMode: linear`.
  **Cartão:** `scanlines` 0,08, raio 0, **corte geométrico 14**, borda 1px verde, `glow-only`, glow 0,4.
- **Botão:** `cyberpunk` (o corte), pulso de néon lento. **Campo:** raio 0, borda verde, foco magenta.
- **Gráfico:** `line`, traço 2, sem suavização; verde / magenta / amarelo ácido. `textGlowIntensity` baixo nos títulos.
- **Movimento:** `Accelerated`, 150 ms, transição `none` (corte seco). **Densidade:** confortável.
- **Navegação:** sidebar à esquerda; marcador de ativo com glow; celular `auto`.
- **O que só ele mostra:** botão `cyberpunk`, corte geométrico, texto com brilho e marcador com glow.

### 3. `industrial-terminal` — Industrial Terminal
- **Conceito:** CRT âmbar de chão de fábrica. **Público:** indústria, logística, monitoramento 24/7.
- **Paleta:** fundo `#0b0906` / cartão `#14110c` → "relatório impresso" `#f4f1ea` / `#fffdf7`. Texto `#ffb347`
  (âmbar fósforo) → `#1d1710`. Primária `#ff9a1f` (H33) / 2.ª `#8a7a62` / destaque `#ff3b1f` (alarme).
- **Tipografia:** `Bebas Neue` maiúsculas (estêncil) / `JetBrains Mono`, **14px** (sai dos 12px de hoje).
  **Ícone:** Tabler `bold`, traço 2,5.
- **Fundo:** `carbon`, sem vinheta, `bgGradientMode: none`. **Cartão:** `stripes` (listra de perigo) 0,06,
  raio 0, borda 2px, sombra 0, corte 10.
- **Botão:** `borderline`, raio 0. **Campo:** raio 0, fundo `#0f0d09`, borda âmbar.
- **Gráfico:** `bar`, traço 2; âmbar / cinza de chapa / vermelho de alarme.
- **Movimento:** `linear`, 120 ms, transição `none`. **Densidade:** compacta, **1600px**, `tableCellPadding` 8.
- **Navegação:** sidebar à esquerda; celular **`drawer`** (operador com luva prefere menu grande a barra), toque 48.
- **O que só ele mostra:** densidade industrial, zero raio, movimento mecânico e a largura de 1600px.

### 4. `neo-brutalism` — Neo Brutalism *(muda para claro, D2)*
- **Conceito:** papel creme, borda preta grossa, cor chapada. **Público:** marcas jovens, criativo, portfólio.
- **Paleta:** fundo `#fff6dc` / cartão `#ffffff` / borda `#111111` → `#121110` / `#1c1a17` / borda `#f4ead2`. Texto
  `#111111` → `#fff6dc`. Primária `#ffd400` (H50, botão com texto `#111111`) / 2.ª `#ff5fa2` / destaque `#2f5bff`.
- **Tipografia:** `Archivo` 900 / `Space Grotesk` 500, 16px. **Ícone:** Lucide `bold`, traço 2,5.
- **Fundo:** `dots` (meio-tom) 0,1, `none`. **Cartão:** `crosshatch` 0,05, raio 4, **borda 3px**, sombra 0
  (§3.2: a sombra deslocada não é alcançável), `cardHoverStyle: expand`.
- **Botão:** `matte`, raio 4, `btnActiveScale` 0,96. **Campo:** raio 4, borda 2px `#111`.
- **Gráfico:** `bar`, traço 3; amarelo / rosa / cobalto.
- **Movimento:** `Standard`, 150 ms, `slide-up`. **Densidade:** confortável.
- **Navegação:** topbar; celular **`bottom`**, toque 48.
- **O que só ele mostra:** o brutalismo claro de verdade, com borda como elemento gráfico e cor chapada sem gradiente.

### 5. `synthwave-retro` — Synthwave Retro *(primária muda, D3)*
- **Conceito:** noite de 1986: horizonte em grade, sol listrado. **Público:** música, eventos, entretenimento.
- **Paleta:** fundo `#1a0b2e` / cartão `#2a1145` a 80% → "amanhecer" `#fff1f7` / `#ffffff`. Texto `#fff0fa` →
  `#2a0e3a`. Primária `#ff2e97` (H330) / 2.ª `#ff9e2c` (sol) / destaque `#2de2e6`.
- **Tipografia:** `Syne` 800 maiúsculas / `Sora`, 14px, h1 60. **Ícone:** Phosphor `bold`.
- **Fundo:** `isometric` 0,08 + **arte SVG própria**: sol listrado sobre grade em perspectiva, ≤ 1,5 KB, uma
  versão por modo. `bgGradientMode: linear`, 180°. **Cartão:** `silk` 0,1, raio 18, borda 1px rosa, `lift`.
- **Botão:** `neon`, pulso lento, raio 999. **Campo:** raio 12, foco rosa com glow.
- **Gráfico:** `area`, traço 3; rosa / laranja / ciano.
- **Movimento:** `Smooth Industrial`, 350 ms, `slide-side`. **Densidade:** confortável, 1200px.
- **Navegação:** topbar; celular `auto`.
- **O que só ele mostra:** arte de fundo própria embutida e o botão `neon` com pulso.

### 6. `nebula-space` — Nebula Space
- **Conceito:** espaço profundo: nebulosa violeta, estrelas, vidro. **Público:** pesquisa, IA, produtos exploratórios.
- **Paleta:** fundo `#070818` / cartão `#11132e` a 60%, blur 20 → `#f4f3ff` / `#ffffff` a 80%. Texto `#eef0ff` →
  `#17123a`. Primária `#a77bff` (H264) / 2.ª `#49d3ff` (gelo) / destaque `#ff7ac6`.
- **Tipografia:** `Sora` 700 / `Inter`, 14px. **Ícone:** Phosphor **`thin`**.
- **Fundo:** `nebula`, vinheta 0,4, `bgGradientMode: mesh`. **Cartão:** `stars` 0,15, raio 24, borda 1px,
  `3d-tilt`.
- **Botão:** `frosted`, raio 999. **Campo:** vidro, raio 14.
- **Gráfico:** `line`, traço 1, suavizado; violeta / gelo / rosa.
- **Movimento:** `Expo Glide`, 500 ms, `zoom`. **Densidade:** **espaçosa**, 1200px.
- **Navegação:** sidebar **`floating`** (destacada, com raio e sombra); celular `auto`.
- **O que só ele mostra:** sidebar flutuante, ícone `thin`, inclinação 3D e as texturas de espaço.

### 7. `kinetic-flow` — Kinetic Flow
- **Conceito:** esporte e performance: grafite, coral, movimento elástico. **Público:** fitness, telemetria.
- **Paleta:** fundo `#111214` / cartão `#1a1c20` → `#f6f6f4` / `#ffffff`. Texto `#f5f5f5` → `#141414`.
  Primária `#ff3d2e` (H5) / 2.ª `#ffb000` / destaque `#2ee6a6`.
- **Tipografia:** `Montserrat` 900 / `Lexend`, 14px. **Ícone:** Lucide `bold`. `systemTone: cyber` (o único com
  efeito, §3.2).
- **Fundo:** `wave-pulse` (branco fixo) → `waves` na contraparte. `bgGradientMode: radial`.
  **Cartão:** `waves` 0,06, raio 12, borda 0, `expand`, `cardSpotlightOpacity` 0,15.
- **Botão:** `matte`, raio 10, `btnHoverScale` 1,04. **Campo:** raio 10.
- **Gráfico:** `line`, **traço 3**, suavizado; coral / âmbar / menta.
- **Movimento:** **`Overshoot`**, 250 ms, `slide-side`. **Densidade:** compacta, 1200px.
- **Navegação:** topbar; celular **`bottom`**, toque 48.
- **O que só ele mostra:** curva elástica, holofote no cartão e o app de desempenho com navegação na base.

### 8. `cyber-retro-wave` — Cyber Retro Wave *(muda para Y2K cromado e claro, D2)*
- **Conceito:** Y2K: prata, vidro iridescente, ciano elétrico. **Público:** consumo, música, varejo de tecnologia.
- **Paleta:** fundo **prata** `#c9ced8` (luminosidade média-alta) / cartão branco a 55%, blur 14 → `#0d1020` /
  `#171b2e` a 70%. Texto `#0d1426` → `#e8eeff`. Primária `#00b8ff` (H197) / 2.ª `#b16cff` / destaque `#c8ff2e`.
- **Tipografia:** `Space Grotesk` 700 / `Sora`, 14px. **Ícone:** Phosphor `regular`.
- **Fundo:** `prism-mesh` (branco fixo, visível sobre prata e sobre escuro), `bgGradientMode: mesh`.
  **Cartão:** `diamond` 0,06, raio 20, borda 1px branca a 60%, `lift`.
- **Botão:** `neon` sobre fundo claro (glow ciano), raio 999. **Campo:** raio 999, vidro.
- **Gráfico:** `area`, traço 2; ciano / lilás / lima.
- **Movimento:** `Overshoot`, 300 ms, `zoom`. **Densidade:** confortável.
- **Navegação:** topbar; celular `auto`.
- **O que só ele mostra:** néon em modo claro e fundo de luminosidade média com vidro.

### 9. `blueprint-protocol` — Blueprint Protocol
- **Conceito:** prancheta de engenheiro: cianótipo, traço fino. **Público:** engenharia, CAD, arquitetura.
- **Paleta:** fundo `#1f3a5f` (cianótipo, L≈25) / cartão `#24466f` a 70% → papel de desenho `#eef4fa` /
  `#ffffff`. Texto `#f1f7ff` → `#0e2a47`. Primária `#5b8fc4` (H210 S45) / 2.ª `#bfe0ff` / destaque `#ff6b6b`
  (lápis vermelho de revisão).
- **Tipografia:** `JetBrains Mono` 700 maiúsculas / `Archivo`, 14px. **Ícone:** Tabler **`thin`**, traço 1.
- **Fundo:** `blueprint-pro` (branco fixo) → `blueprint` na contraparte. **Cartão:** `blueprint` 0,12, raio 2,
  borda 1px tracejada (`borderStyle: dashed`), corte 8.
- **Botão:** `borderline`, raio 2. **Campo:** raio 2, borda 1px.
- **Gráfico:** `line`, traço 1, **sem suavização** (degrau de medição); azul / gelo / vermelho.
- **Movimento:** `Decelerated`, 200 ms, `fade`. **Densidade:** compacta.
- **Navegação:** sidebar **à direita** (`sidebarPosition: right`); celular `drawer`.
- **O que só ele mostra:** sidebar à direita, borda tracejada e traço de ícone fino.

### 10. `minimalist-airy` — Minimalist Airy *(referência clara)*
- **Conceito:** branco absoluto, tinta, respiro. **Público:** produto que precisa de neutralidade.
- **Paleta:** a de hoje, completada. Fundo `#F9FAFB` / cartão `#FFFFFF` → `#0d1016` / `#10141e`. Texto
  `#0f172a`. Primária `#111827` / 2.ª `#4B5563` / destaque `#2563eb` (o azul de link, hoje no gráfico).
  `tooltipTextColor` deixa de ser `#738ecd`.
- **Tipografia:** `Inter` 800 / `Inter`, 16px. **Ícone:** Lucide **`light`**, traço 1,5.
- **Fundo:** `texture: none` (declarado; hoje a chave falta). **Cartão:** `none`, raio 32 (por canto, como hoje),
  borda 0, sombra difusa, `lift`.
- **Botão:** `matte`, pílula. **Campo:** raio 12, borda 1px.
- **Gráfico:** `line`, traço 2; tinta / cinza / azul.
- **Movimento:** `Standard`, 300 ms, `fade`. **Densidade:** espaçosa.
- **Navegação:** topbar; celular `auto`.
- **O que só ele mostra:** a referência clara: o quanto se faz sem textura, só com espaço.

### 11. `data-terminal` — Data Terminal *(reconceituado: laboratório)*
- **Conceito:** caderno de laboratório: menta, grade, números em mono. **Público:** ciência de dados, BI.
- **Paleta:** fundo `#f6fbf8` / cartão `#ffffff` → `#07130d` / `#0d1d14`. Texto `#0b2a1a` → `#d9f5e6`.
  Primária `#00995c` (H155) / 2.ª `#2b6cb0` / destaque `#f2a900`.
- **Tipografia:** `Space Grotesk` 600 / `Inter`, 14px; `monoFont` `JetBrains Mono` nos números.
  **Ícone:** Lucide `regular`.
- **Fundo:** `micro-dots` 0,05. **Cartão:** **`grid`** 0,06, raio 6, borda 1px.
- **Botão:** `borderline`, raio 6. **Campo:** raio 6.
- **Gráfico:** **`area`**, traço 2, `chartShowGrid` com grade 0,15; verde / azul / âmbar.
- **Movimento:** `Standard`, 200 ms, `fade`. **Densidade:** compacta, `tableCellPadding` 10.
- **Navegação:** sidebar; celular `drawer`.
- **O que só ele mostra:** gráfico como cidadão de primeira classe e tabela densa legível no claro.

### 12. `neumorphic-mobile` — Neumorphic Mobile
- **Conceito:** macio e tátil, feito para o polegar. **Público:** app móvel, IoT, casa inteligente.
- **Paleta:** fundo = cartão `#e3e7ee` → `#23272e` = `#23272e`. Texto `#2f3b45` → `#e6eaf0`. Primária `#5b6b78`
  (neutra) / 2.ª `#93a1ad` / destaque `#ff7a90`.
- **Tipografia:** `Plus Jakarta Sans` 700 / 400, 16px. **Ícone:** Lucide `regular`.
- **Fundo:** `noise` (`bgNoiseDensity` baixo), `radial`. **Cartão:** `none`, raio 24, borda 0.
- **Botão:** **`neumorphism`**, raio 20. **Campo:** relevo afundado, raio 16.
- **Gráfico:** `bar`, traço 2; ardósia / cinza / rosa.
- **Movimento:** `Decelerated`, 300 ms, `slide-up`. **Densidade:** confortável.
- **Navegação:** topbar; celular **`bottom`**, **toque 48**.
- **O que só ele mostra:** o tema que faz jus ao nome no celular: barra na base e alvo de toque maior.

### 13. `golden-hour` — Golden Hour
- **Conceito:** luxo quente: serifa de vitrine, grão de filme, mel. **Público:** hotelaria, varejo premium.
- **Paleta:** fundo `#fff8ec` / cartão `#fffdf8` → "luz de abajur" `#1b140b` / `#261c10`. Texto `#3a2a0e` →
  `#fbeed6`. Primária `#c98a1c` (H39) / 2.ª `#8a4f1d` / destaque `#e86a3a`.
- **Tipografia:** **`Playfair Display`** 700 / `Plus Jakarta Sans`, 16px; `identityFontFamily` **`Satisfy`**.
  **Ícone:** Phosphor `light`.
- **Fundo:** `honeycomb` 0,05, `linear`. **Cartão:** **`grain`** 0,08, raio 20, borda 1px dourada, `lift`.
- **Botão:** `matte`, raio 6. **Campo:** raio 6, borda dourada no foco.
- **Gráfico:** `area`, suavizado; mel / castanho / sol-poente.
- **Movimento:** `Decelerated`, 450 ms, `fade`. **Densidade:** espaçosa.
- **Navegação:** sidebar; celular `auto`.
- **O que só ele mostra:** serifa de exibição, letra manuscrita no nome do sistema e grão fotográfico.

### 14. `aurora-veil` — Aurora Veil
- **Conceito:** vidro lavanda sobre aurora boreal. **Público:** bem-estar, criativo calmo.
- **Paleta:** fundo `#f6f3fb` / cartão branco a 55%, blur 16 → `#120f1d` / `#1e1830` a 60%. Texto `#2f2443` →
  `#efeaff`. Primária `#8a6cc2` (H264 S40) / 2.ª `#4fb3a6` / destaque `#e58fb6`.
- **Tipografia:** `Lexend` 600 / `Inter`, 14px. **Ícone:** Lucide **`thin`**, traço 1.
- **Fundo:** `aurora`, `mesh`. **Cartão:** `frosted` 0,1 (branco fixo, sobre vidro: brilho intencional), raio 28.
- **Botão:** `frosted`, pílula. **Campo:** pílula, vidro.
- **Gráfico:** `line`, suavizado; lavanda / verde-aurora / rosa.
- **Movimento:** `Expo Glide`, 400 ms, `fade`. **Densidade:** confortável.
- **Navegação:** topbar; celular `auto`.
- **O que só ele mostra:** vidro claro de verdade, sobre uma atmosfera que dá sentido ao blur.

### 15. `editorial-ink` — Editorial Ink *(novo)*
- **Conceito:** papel e tinta: serifa, coluna de leitura, oxblood. **Público:** publicação, docs, base de conhecimento.
- **Paleta:** fundo `#f7f3ea` / cartão `#fffdf8` → "leitura noturna" `#16130f` / `#1e1a15`. Texto `#1c1813`,
  secundário `#5c5347` → `#ece4d6` (sépia). Primária `#1f1b16` (tinta, neutra) / 2.ª `#6b6256` / destaque
  `#9b1c2c` (oxblood: link, ativo, citação).
- **Tipografia:** **`Fraunces`** 700 / **`Fraunces`** 400, **18px**, entrelinha 1,75, h1 44.
  **Ícone:** Tabler `light`, traço 1,5.
- **Fundo:** **`paper`**, `none`. **Cartão:** **`paper`** 0,06, raio 2, borda 1px `#e4dccb`, sombra 0, `lift`
  discreto.
- **Botão:** `borderline`, raio 2. **Campo:** `inputBorderType: underline` (só a linha de baixo), raio 0.
- **Gráfico:** `line`, traço 1; tinta / cinza / oxblood.
- **Movimento:** `Decelerated`, 350 ms, `fade`. **Densidade:** espaçosa, **`maxContentWidth: 1000px`**,
  `contentAlignment: center`.
- **Navegação:** topbar; celular `drawer`.
- **O que só ele mostra:** coluna de leitura de 1000px centralizada, serifa no corpo, 18px e papel.

### 16. `organic-clay` — Organic Clay *(novo; ponto de partida "orgânico")*
- **Conceito:** argila e madeira: fundo de barro, musgo, terracota. **Público:** agro, sustentabilidade, artesanato.
- **Paleta:** fundo de **barro** `#c6b394` (luminosidade média) / camada `#d8c9ae` / cartão `#ece2cf` → nogueira
  `#1d1913` / `#29231a`. Texto `#241c12` → `#efe6d4`. Primária `#5f6b3a` (musgo, H75 S30) / 2.ª `#a4532e`
  (terracota) / destaque `#d6a24a` (ocre).
- **Tipografia:** `Outfit` 600 / `Lexend`, 16px. **Ícone:** Phosphor `regular`.
- **Fundo:** `topo` (curvas de nível) + **arte SVG própria**: colinas em camadas, ≤ 1,5 KB, uma por modo.
  `linear`. **Cartão:** **`wood`** 0,08, raios orgânicos assimétricos (TL 22 · TR 10 · BR 22 · BL 10), borda 0.
- **Botão:** `matte`, raio 14. **Campo:** raio 12, fundo `#f3ecdf`.
- **Gráfico:** `area`, suavizado; musgo / terracota / ocre.
- **Movimento:** `Smooth Industrial`, 400 ms, `slide-up`. **Densidade:** confortável.
- **Navegação:** sidebar; celular `auto`.
- **O que só ele mostra:** fundo de luminosidade média num tema claro, madeira e raio assimétrico por canto.
- **Risco declarado:** sobre barro L≈66, o texto secundário e o mudo ficam com pouca margem de contraste. O
  solucionador pode exigir texto mais escuro. A alternativa, se não fechar, é subir o fundo para L≈70.

### 17. `high-contrast` — High Contrast *(novo)*
- **Conceito:** preto absoluto, amarelo e branco a 7:1, sem movimento. **Público:** acessibilidade, governo, quiosque.
- **Paleta:** fundo `#000000` / cartão `#000000` com borda `#ffffff` 2px → `#ffffff` / `#ffffff` com borda
  `#000000`. Texto `#ffffff` → `#000000`; mudo `#e6e6e6` → `#1a1a1a` (≥ 7:1). Primária `#ffd400` (H52 S100, botão
  com texto preto, ≈ 15:1) / 2.ª `#5ce1ff` / destaque `#ff9e4d`. No claro, link e item ativo `#0000cc`.
- **Tipografia:** `Lexend` 700 / `Lexend` 400, **18px**, entrelinha 1,7. **Ícone:** Tabler `bold`, traço 2,5.
- **Fundo:** `none`. **Cartão:** `none`, raio 4, **borda 2px**, sombra 0, `cardHoverStyle: glow-only` com glow 0.
- **Botão:** `borderline`, raio 4, borda 2px. **Campo:** borda 2px, foco amarelo.
- **Gráfico:** `line`, **traço 3**, grade ligada 0,3; amarelo / ciano / laranja (passam pelo validador antes de
  qualquer coisa).
- **Movimento:** **`reducedMotion: true`** (D7), transição `none`. **`focusRingWidth: 4`**.
- **Densidade:** confortável. **Navegação:** sidebar; celular **`bottom`**, **toque 56**.
- **O que só ele mostra:** os recursos de acessibilidade da lib juntos: 7:1, anel de foco largo, alvo de 56px e
  movimento reduzido.

### 18. `corporate-ledger` — Corporate Ledger *(novo)*
- **Conceito:** livro-razão: índigo sóbrio, tabela densa, risca de giz. **Público:** ERP, finanças, back-office.
- **Paleta:** fundo `#f4f6f9` / camada e cartão `#ffffff`, borda `#d5dbe4` → `#0f141c` / `#151b25`, borda
  `#263041`. Texto `#121a26`, mudo `#4b5768` → `#e6ebf2`. Primária **H250 S45 L40** (`#4a3f9a` como âncora:
  índigo de banco, a 29° do `minimalist-airy`) / 2.ª `#0f766e` (positivo) / destaque `#b45309`.
- **Tipografia:** `Roboto` 700 / `Roboto` 400, 14px, h1 28. **Ícone:** Tabler `regular`, traço 1,5.
- **Fundo:** `none`. **Cartão:** **`pinstripes`** 0,04, raio 6, borda 1px, sombra 0,3.
- **Botão:** `matte`, raio 6. **Campo:** raio 4, borda 1px.
- **Gráfico:** **`bar`**, traço 2; índigo / verde-petróleo / âmbar.
- **Movimento:** `Standard`, 150 ms, `fade`. **Densidade:** **compacta**, **`maxContentWidth: 100%`**,
  `tableCellPadding` 8.
- **Navegação:** sidebar; celular `drawer`, toque 44.
- **O que só ele mostra:** largura fluida, a densidade de uma tela de ERP e sobriedade sem ser genérico.

### 19. `playful-pastel` — Playful Pastel *(novo)*
- **Conceito:** pastel e redondo: coral, céu, manteiga, movimento que quica. **Público:** infantil, educação.
- **Paleta:** fundo `#fff5f6` / cartão `#ffffff` → ameixa `#1c1420` / `#261b2b`. Texto `#2d1b2e` → `#fde9ef`.
  Primária **H352 S80** (`#ec5b73`, botão com texto `#2d1b2e`) / 2.ª `#7cc6fe` / destaque `#ffd166`; terciária
  `#8ee3c8`.
- **Tipografia:** **`Unbounded`** 700 / `Lexend`, 16px; `identityFontFamily` **`Caveat`**.
  **Ícone:** Phosphor `fill`.
- **Fundo:** **`fluid`**, `radial`. **Cartão:** **`hexagon`** 0,05, **raio 28**, borda 2px pastel, `expand`.
- **Botão:** `frosted` ("gelatina"), pílula, `btnHoverScale` 1,05. **Campo:** pílula, borda 2px.
- **Gráfico:** `bar`, traço 3; coral / céu / manteiga.
- **Movimento:** **`Overshoot`**, 350 ms, **`zoom`**. **Densidade:** espaçosa.
- **Navegação:** topbar; celular **`bottom`**, **toque 48**.
- **O que só ele mostra:** o raio máximo do conjunto, fonte de exibição larga e movimento que quica.

---

# 8. As 5 direções novas: o que mudou do ponto de partida e os ids

| Ponto de partida (revisor) | Mantido? | id | Nome |
|---|---|---|---|
| editorial (papel, serifa, leitura longa) | sim | `editorial-ink` | Editorial Ink |
| orgânico (terra, madeira, estuque) | **sim, com uma troca**: a cor de marca é **musgo**, não terracota (que fica na 2.ª). Terracota (H12–22) cairia a menos de 25° do `golden-hour` (laranja/claro) e reprovaria o critério 6 do medidor. A textura de cartão é `wood`, não `stucco`, porque `stucco` desenha em branco fixo e some num tema claro (§3.3) | `organic-clay` | Organic Clay |
| alto contraste (AAA, 7:1) | sim; modo nativo **escuro** (preto absoluto), contraparte clara também a 7:1 | `high-contrast` | High Contrast |
| corporativo sóbrio (denso, ERP e finanças) | sim; primária índigo H250, não azul-marinho H215, para ficar a ≥25° do `minimalist-airy` | `corporate-ledger` | Corporate Ledger |
| lúdico (pastel, arredondado, movimento suave) | sim, com uma nuance: o movimento é **elástico** (`Overshoot`), suave na duração e não na curva. O público infantil lê a "mola" como alegria | `playful-pastel` | Playful Pastel |

---

# 9. Achados fora do escopo (não corrigidos)

| # | Onde | O que há de errado |
|---|---|---|
| A1 | `src/core/Design/schema/atmosphere.ts:96-120` | `bgGradientMode` e `bgGradientAngle` não têm consumidor: as variáveis emitidas não são lidas por CSS nem componente. O painel oferece "Linear/Radial/Mesh" e nada muda. É token oferecido sem efeito ([[09-temas-e-presets]] §4.4.3) |
| A2 | `src/core/Provider/manifest.ts:126` × `src/styles/_surfaces.css:7-26` | `surfaceMaterial` (marcado `visualImpact`) vira `data-surface` com `frosted`/`sleek`/`industrial`/`organic`; o CSS só desenha `metallic`/`brushed`/`acrylic`/`matte`. Nenhuma opção tem efeito, e o modo Impacto do painel promete o contrário |
| A3 | `schema` de `shadowColorMode` × `_surfaces.css:65-66` | opções `neutral`/`colored`/`ambient`; o CSS conhece `match`/`adaptive` |
| A4 | `manifest.ts:129` × `_base.css:74-88` | `systemTone` (`visualImpact`): só `cyber` desenha; `dark`/`light`/`tactical` não; `friendly`/`formal` têm CSS e não são opção |
| A5 | `switchStyleType`; `atmosphereNoiseOpacity`/`noiseIntensity` (`manifest.ts:185,198`) | `switchStyleType` não tem consumidor; `--sarak-noise-opacity` é emitido e ninguém o lê |
| A6 | temas `cyber-retro-wave`, `minimalist-airy`, `neumorphic-mobile` × `useSarakUIEffects.ts` | `Orbitron`, `Chakra Petch`, `VT323` e `Fira Code` não estão no `@import` de fontes: na tela, viram a fonte de reserva. Os temas também escrevem o valor da fonte num formato que o painel não reconhece como opção da lista |
| A7 | `src/styles/_atmosphere.css` | seis texturas desenham em branco fixo (`brushed`, `frosted`, `topo-deep`, `prism-mesh`, `blueprint-pro`, `wave-pulse`) e somem sobre superfície clara, e o painel as oferece em qualquer modo |
| A8 | `src/components/engines/charts/SubEngines/builders/types.ts:20-23` | `CHART_COLOR_TOKENS` usa as quatro cores de status como séries 4–7, o que contraria a regra de cor de status reservada da `dataviz`: um gráfico com 5 séries pinta a 4.ª de "sucesso" |
| A9 | catálogo, `cardVariant` | marcado `visualImpact: cards`, mas escolhe a especialização de card do `SarakCardGrid`, não um estilo |
| A10 | `src/styles/_cards.css:24-26` | a sombra do cartão tem geometria fixa (`0 20px 50px -12px`); o tema só controla a opacidade. Sombra dura deslocada (brutalismo) e sombra colorida não são alcançáveis |
| A11 | `useSarakUIEffects.ts` | as fontes vêm do Google Fonts por `@import`. Offline ou com o domínio bloqueado, todo tema cai na fonte de reserva. A §5.1 da `09` exige offline só do fundo, então não é violação, mas é a mesma classe de dependência de terceiro |

---

# 10. Notas para os lotes seguintes

- **Divergência plan × código, lote 3:** a plan pede para *escrever* a vitrine, mas ela **já existe**:
  `npm run themes:showcase` → `browser-tests/generate-showcase.mts`, com saída em `browser-tests/showcase-output/`,
  documentada na skill `ui-criar-tema` §5. O lote 3 é então **estender** a cena (gráfico, calendário, formulário com
  erro, estado vazio, celular) e não criar outra. O revisor decide.
- **Teste (b), leitura adotada:** "3 famílias de ícone com pelo menos 4 pesos" foi lido como *3 famílias em uso e ≥4
  pesos no conjunto*. A proposta cumpre a leitura mais forte (≥4 pesos **por** família). Fonte é contada pelo valor
  normalizado da lista, não pela string crua.
- **Teste (a):** cobra os 22 tokens com `visualImpact`. A regra 1 (§6) vai além: os 440, por construção. O teste
  continua cobrando só os 22, que é o que a plan pede.
- **Contraste do `high-contrast`:** o gate cobra 4,5. O lote 1 relata a razão de cada par desse tema, nos dois modos,
  contra 7:1.
- **Peso:** o lote 1 remede pelo método 4.1 depois de cada tema e para no teto aprovado.

---

# 11. Notas de conceito (uma por tema, acrescentada no lote do tema)

## `sarak-sovereign` (lote 6, 2026-10-17)

- **Arquétipo de identidade:** sala de comando. Superfície de vidro escuro com a constelação por trás, ciano contido (H184 S88, fora do S100 dos
  neons) e linguagem de produto, não de efeito. É o tema que carrega sem ninguém escolher, e o padrão de todo token estético do schema.
- **Tokens que carregam a personalidade:** `primaryColor` (o ciano que passa 4,5:1 como texto nos dois modos) · `iconWeight: fill` (Phosphor
  preenchido) · `cardSurfaceOpacity` 0,7 com `cardBackdropBlur` 12 (o vidro) · `cardTextureType: micro-dots` · `cardHoverStyle: glow-only` ·
  `btnStyleType: frosted` · `chartType: area` · `bgGradientMode: radial` · `texture: constellation` · `motionEaseMain` (`Expo Glide`).
- **O que o tema demonstra da lib:** a referência escura completa e a contraparte clara (`#f3f6fa` / `#ffffff`, mesmo matiz, primária `#087782`)
  que troca só cor, opacidade e sombra; geometria, tipografia e movimento vêm do modo escuro.
- **Decisões que a medição forçou:** (1) `cardTitleFontWeight` fica `900` (a opção `800` não existe no token); (2) `cardSurfaceOpacity` em
  múltiplo de 0,05; (3) `colorBgLayer2`, `cardActionBtnHoverBg` e `cardSearchTextFocusColor` são valores concretos, porque o contraste só mede
  cadeia que termina numa cor (cadeia de `var()` faz o par ser pulado); (4) `identityFontFamily` do tema é `Outfit` e o padrão do schema continua
  a herança da fonte de títulos; (5) os tokens cujo padrão é derivado (`rangeActiveColor`, `tooltip*`, `inputIconColor`,
  `cardActionBtnPrimaryBg`, `aiGlowColor`, `colorBgModal`, `cardSearch*`) repetem a cadeia, para o consumidor que troca só a primária levar o derivado.
- **Contraste não textual (1.4.11, 3:1, apoio):** escuro: foco do campo 12,7, interruptor ativo 11,5, marcador do item ativo 12,8, séries 4,2 a 11,5;
  claro: foco 4,9, interruptor 5,3, séries 5,3 a 6,5. Borda do cartão contra o corpo (1,2:1) é deliberadamente sutil (vidro); borda do campo em
  repouso 1,9:1 (escuro) e 2,1:1 (claro), abaixo de 3:1.

## `cyberpunk-neon` (lote 7, 2026-10-18)

- **Arquétipo de identidade:** o néon do conjunto. Terminal de invasão: verde ácido (H144 S100, o único neon S100 que sobra) sobre preto esverdeado,
  quina cortada, mono maiúsculo e movimento seco. Linguagem de efeito, ao contrário do `sarak-sovereign` (linguagem de produto).
- **Tokens que carregam a personalidade:** `primaryColor` · `cardGeometricCut: 14` com raio 0 em todo token de raio · `btnStyleType: cyberpunk` ·
  `headingFont` JetBrains Mono + `headingTransform: uppercase` + `textGlowIntensity: 0.35` · `iconWeight: duotone` · `cardTextureType: scanlines` ·
  `systemTone: cyber` · `chartSmoothing: false` · `pageTransitionType: none` com `motionEase*` acelerado e durações de 0,05 a 0,3 s · `switchStyleType: asymmetric`.
- **O que o tema demonstra da lib:** o botão wireframe, o corte geométrico, o brilho de texto e o marcador de item ativo com halo (`navActiveMarkerGlow` 14);
  a contraparte clara (`#eef5ef` / `#ffffff`, primária `#007a33`) mostra que o mesmo tema funciona como papel quadriculado verde sem perder o corte e o mono.
- **Onde a ficha foi revista pelo código:** (1) `cyber-binary` pinta com a primária e opacidade fixa de 0,05, não em branco fixo: a ficha trocava a textura
  na contraparte, mas `texture` não carrega modo, então o fundo é `circuit-pro` (currentColor) nos dois; (2) o "pulso de néon lento" não existe no botão
  `cyberpunk` (só o `neon` pulsa), então `btnNeonPulseSpeed` é 0; (3) `systemTone: cyber` entra, porque o tom desenha grade de HUD e horizonte.
- **Contraste textual (4,5:1, 76 pares por modo):** escuro, menor 5,52 (`statusErrorColor` sobre o cartão); claro, menor 4,61 (`navItemActiveColor` sobre o item ativo).
  O solucionador não achou o que corrigir nos dois modos.
- **Contraste não textual (1.4.11, 3:1, apoio):** escuro: foco do campo 6,4, marcador 15,3, interruptor 15,0, borda do campo 4,2, borda do cartão 3,5,
  séries 6,0 a 17,1; claro: foco 5,7, marcador 5,5, interruptor 4,9, borda do campo 3,6, séries 5,4 a 6,3. Abaixo de 3:1: borda do cartão no claro (2,9).
  Séries vizinhas se distinguem por matiz, não por luminosidade (razão 1,06 a 2,85).

