# Catálogo medido de fontes — plan-118, lote 1

**Medição:** 2026-10-15 · pacotes locais `@fontsource*` v5.3.0 (Source Serif 4: v5.3.1).  
**Resultado:** proposta para revisão e decisão do dono; nenhuma alteração de produto foi feita neste lote.

## Método reproduzível

- Para cada uma das 40 famílias candidatas, foi lido `node_modules/@fontsource-variable/<slug>/` quando existe; senão, `node_modules/@fontsource/<slug>/`. Nenhum pacote `@fontsource*` direto instalado ficou fora da lista de candidatas.
- `metadata.json` forneceu `subsets`, `weights`, `variable` e os eixos; `package.json` e `LICENSE` foram conferidos para licença e titular/copyright. As contagens abaixo são todos os `.woff2` em `files/` por subconjunto, incluindo estilos e variantes de eixo; não são apenas os arquivos propostos.
- Tamanho Latin upright: arquivo `*-latin-wght-normal.woff2` variável, ou `*-latin-400-normal.woff2` estático. Latin-ext usa o arquivo correspondente. `KiB = bytes / 1024`; o total MB usa MB decimal (`bytes / 1.000.000`).
- A carga variável conta um único arquivo Latin `wght` por família, que cobre os pesos no eixo. Para as 19 famílias atuais, os pesos estáticos seguem `WEIGHT_AXES`/`SINGLE_FACE` de `src/core/Provider/utils/googleFontsUrl.ts`. Para candidatas estáticas, foram somados os pesos upright nativos que a família tem entre os valores expostos pelo painel; pesos inexistentes estão anotados. Isso evita contar um arquivo de peso que não existe e torna visível quando o navegador teria de sintetizar negrito.
- O painel de tipografia oferece 300/400/600/700/800/900 para H1/H2 e 300/400/500 para corpo (`src/core/Design/schema/typography.ts:125-242`). Os temas embarcados usam 400/500/600/700/800/900 (`src/core/Design/presets/themes/*.ts`; por exemplo `kinetic-flow.ts:240-247`).
- Para a comparação visual, os espécimes foram renderizados localmente a partir dos WOFF2, com um heading, texto corrido acentuado e uma amostra monoespaçada com operadores. `document.fonts.check` confirmou o carregamento das faces. Os pares citados em “Veredito” foram comparados no desenho renderizado; nenhuma requisição externa foi usada.
- Cobertura foi conferida nos `unicode.json` instalados para ASCII e letras acentuadas examinadas de pt/en/es/fr/de/it, incluindo `Œ/œ` e `ß`: nenhuma família falha nesses caracteres. O Latin não inclui `ẞ` (U+1E9E) nem `Ÿ` (U+0178); ambos aparecem no Latin-ext das famílias que publicam esse subconjunto.

**Legenda das contagens:** `L` = latin; `LE` = latin-ext; `Cy/CyE` = cyrillic/cyrillic-ext; `Gr/GrE` = greek/greek-ext; `V` = vietnamese; `Th` = thai; `Ar` = arabic; `He` = hebrew; `M` = math; `S/S2` = symbols/symbols2. Eixos são os declarados no pacote. Os dois tamanhos são `Latin / Latin-ext` upright em KiB; para estáticas, são os arquivos 400. “Carga” é a soma Latin do catálogo se admitida, com os pesos indicados.

## Sans

| Família | Variável / eixos disponíveis | WOFF2 por subconjunto | Latin / Latin-ext (KiB) | Carga Latin (pesos; KiB) | Licença e crédito para `THIRD-PARTY-FONTS` | Veredito |
|---|---|---|---:|---|---|---|
| Inter | Sim · wght 100–900; opsz 14–32; ital 0–1 | L6, LE6, Cy6, CyE6, Gr6, GrE6, V6 | 47,1 / 83,1 | wght · 47,1 | OFL-1.1 · Copyright 2016 The Inter Project Authors | Entra · atual, manter. |
| Outfit | Sim · wght 100–900 | L1, LE1 | 31,5 / 14,5 | wght · 31,5 | OFL-1.1 · Copyright 2021 The Outfit Project Authors | Entra · atual, manter. |
| Roboto | Sim · wght 100–900; wdth 75–100; ital 0–1 | L6, LE6, Cy6, CyE6, Gr6, GrE6, M6, S6, V6 | 42,1 / 28,7 | wght · 42,1 | OFL-1.1 · Copyright 2011 The Roboto Project Authors | Entra · atual, manter. |
| Montserrat | Sim · wght 100–900; ital 0–1 | L2, LE2, Cy2, CyE2, V2 | 37,1 / 69,0 | wght · 37,1 | OFL-1.1 · Copyright 2011 The Montserrat Project Authors | Entra · atual, manter. |
| Space Grotesk | Sim · wght 300–700 | L1, LE1, V1 | 21,8 / 18,5 | wght · 21,8 | OFL-1.1 · Copyright 2020 The Space Grotesk Project Authors | Entra · atual, manter. |
| Plus Jakarta Sans | Sim · wght 200–800; ital 0–1 | L2, LE2, CyE2, V2 | 26,7 / 21,2 | wght · 26,7 | OFL-1.1 · Copyright 2020 The Plus Jakarta Sans Project Authors | Entra · atual, manter. |
| Lexend | Sim · wght 100–900 | L1, LE1, V1 | 38,8 / 33,7 | wght · 38,8 | OFL-1.1 · Copyright 2019 The Lexend Project Authors | Entra · atual, manter. |
| Sora | Sim · wght 100–800 | L1, LE1 | 32,9 / 15,2 | wght · 32,9 | OFL-1.1 · Copyright 2019 The Sora Project Authors | Entra · atual, manter. |
| Syne | Sim · wght 400–800 | L1, LE1, Gr1 | 33,8 / 14,4 | wght · 33,8 | OFL-1.1 · Copyright 2019 The Syne Project Authors | Entra · atual, manter. |
| Archivo | Sim · wght 100–900; wdth 62–125; ital 0–1 | L6, LE6, V6 | 34,1 / 31,8 | wght · 34,1 | OFL-1.1 · Copyright 2020 The Archivo Project Authors | Entra · atual, manter. |
| Chakra Petch | Não · estática, pesos 300/400/500/600/700 | L10, LE10, Th10, V10 | 9,5 / 8,7 | 300+400+500+600+700 · 48,4 | OFL-1.1 · Copyright 2018 The Chakra Petch Project Authors | **Entra** · recortes angulares legíveis também em corpo; visual técnico distinto dos sans atuais. 800/900 serão sintetizados. |
| DM Sans | Sim · wght 100–1000; opsz 9–40; ital 0–1 | L6, LE6 | 36,1 / 17,8 | wght · 36,1 | OFL-1.1 · Copyright 2014 The DM Sans Project Authors | Fora · no espécime, grotesca neutra muito próxima de Inter/Roboto; não acrescenta desenho próprio. |
| Manrope | Sim · wght 200–800 | L1, LE1, Cy1, CyE1, Gr1, V1 | 24,3 / 14,8 | wght · 24,3 | OFL-1.1 · Copyright 2019 The Manrope Project Authors | Fora · sans geométrica arredondada próxima de Plus Jakarta Sans/Sora. |
| Nunito | Sim · wght 200–1000; ital 0–1 | L2, LE2, Cy2, CyE2, V2 | 38,2 / 34,8 | wght · 38,2 | OFL-1.1 · Copyright 2014 The Nunito Project Authors | **Entra** · terminais mais redondos e amistosos; legível em corpo e título e visualmente separado dos geométricos atuais. |
| Work Sans | Sim · wght 100–900; ital 0–1 | L2, LE2, V2 | 49,1 / 34,9 | wght · 49,1 | OFL-1.1 · Copyright 2019 The Work Sans Project Authors | Fora · no corpo e nos títulos aproxima-se do papel neutro de Inter/Roboto. |
| Figtree | Sim · wght 300–900; ital 0–1 | L2, LE2 | 19,7 / 10,0 | wght · 19,7 | OFL-1.1 · Copyright 2022 The Figtree Project Authors | Fora · formas arredondadas muito próximas de Outfit/Sora/Plus Jakarta Sans. |
| Rubik | Sim · wght 300–900; ital 0–1 | L2, LE2, Ar2, Cy2, CyE2, He2 | 34,5 / 18,9 | wght · 34,5 | OFL-1.1 · Copyright 2015 The Rubik Project Authors | Fora · aproxima-se de Nunito nas formas arredondadas; prefiro a diferença mais evidente de Nunito. |

## Serif

| Família | Variável / eixos disponíveis | WOFF2 por subconjunto | Latin / Latin-ext (KiB) | Carga Latin (pesos; KiB) | Licença e crédito para `THIRD-PARTY-FONTS` | Veredito |
|---|---|---|---:|---|---|---|
| Playfair Display | Sim · wght 400–900; ital 0–1 | L2, LE2, Cy2, V2 | 37,5 / 20,6 | wght · 37,5 | OFL-1.1 · Copyright 2017 The Playfair Display Project Authors · RFN | Entra · atual, manter. |
| Fraunces | Sim · wght 100–900; opsz 9–144; SOFT 0–100; WONK 0–1; ital 0–1 | L12, LE12, V12 | 35,8 / 32,8 | wght · 35,8 | OFL-1.1 · Copyright 2020 The Fraunces Project Authors | Entra · atual, manter. |
| Lora | Sim · wght 400–700; ital 0–1 | L2, LE2, Cy2, CyE2, M2, S2, V2 | 36,9 / 19,6 | wght · 36,9 | OFL-1.1 · Copyright 2011 The Lora Project Authors · RFN | Fora · serif textual/calligráfica próxima do papel editorial de Source Serif 4; escolho Source Serif 4 pela amplitude de pesos e eixo óptico. |
| Source Serif 4 | Sim · wght 200–900; opsz 8–60; ital 0–1 | L6, LE6, Cy6, CyE6, Gr6, V6 | 49,7 / 41,2 | wght · 49,7 | OFL-1.1 · Google Inc. (titular indicado no `LICENSE`) | **Entra** · desenho textual robusto para parágrafos e títulos; contraste menor que Playfair Display e eixo `opsz`. |
| Cormorant Garamond | Sim · wght 300–700; ital 0–1 | L2, LE2, Cy2, CyE2, V2 | 36,8 / 32,9 | wght · 36,8 | OFL-1.1 · Copyright 2015 The Cormorant Project Authors | Fora · serif editorial de alto contraste, próxima de Playfair Display e EB Garamond; corpo fica menos confortável. |
| EB Garamond | Sim · wght 400–800; ital 0–1 | L2, LE2, Cy2, CyE2, Gr2, GrE2, V2 | 43,3 / 111,3 | wght · 43,3 | OFL-1.1 · Copyright 2017 The EB Garamond Project Authors | Fora · mesma direção Garamond/alto contraste de Cormorant e Playfair; o espécime tem altura-x menor para corpo. O latin-ext de 111,3 KiB ainda fica abaixo do limite. |

## Display, condensada e slab

| Família | Variável / eixos disponíveis | WOFF2 por subconjunto | Latin / Latin-ext (KiB) | Carga Latin (pesos; KiB) | Licença e crédito para `THIRD-PARTY-FONTS` | Veredito |
|---|---|---|---:|---|---|---|
| Unbounded | Sim · wght 200–900 | L1, LE1, Cy1, CyE1, V1 | 49,7 / 115,6 | wght · 49,7 | OFL-1.1 · Copyright 2022 The Unbounded Project Authors | Entra · atual, manter; com Latin-ext, o total combinado é 165,3 KiB e excederia um teto por família aplicado aos dois subconjuntos. O limite da plan é por arquivo variável Latin, 49,7 KiB. |
| Bebas Neue | Não · estática, 400 | L1, LE1 | 13,4 / 8,7 | 400 · 13,4 | OFL-1.1 · Copyright 2019 The Bebas Neue Project Authors | Entra · atual, manter. |
| Orbitron | Sim · wght 400–900 | L1, LE0 | 11,5 / — | wght · 11,5 | OFL-1.1 · Copyright 2018 The Orbitron Project Authors | Fora na proposta · desenho digital distinto de Unbounded, mas é display, não texto corrido confortável, e não tem Latin-ext. Decisão opcional do dono se aceitar essas duas exceções. |
| VT323 | Não · estática, só 400 | L1, LE1, V1 | 17,5 / 16,0 | 400 · 17,5 | OFL-1.1 · Copyright 2011 The VT323 Project Authors | Fora · pixel/terminal é claramente distinto, mas a amostra perde conforto em corpo; pacote não tem 700 nativo. Pode ser exceção display-only decidida pelo dono. |
| Roboto Slab | Sim · wght 100–900 | L1, LE1, Cy1, CyE1, Gr1, GrE1, V1 | 33,4 / 20,7 | wght · 33,4 | Apache-2.0 · Copyright 2018 The Roboto Slab Project Authors | **Entra** · serifa quadrada e uniforme; separa-se visualmente das serifas de contraste alto atuais e funciona em texto e título. |
| Oswald | Sim · wght 200–700 | L1, LE1, Cy1, CyE1, V1 | 27,8 / 23,4 | wght · 27,8 | OFL-1.1 · Copyright 2016 The Oswald Project Authors | Fora · condensada para títulos, muito próxima do espaço visual de Bebas Neue. |
| Anton | Não · estática, só 400 | L1, LE1, V1 | 18,2 / 30,6 | 400 · 18,2 | OFL-1.1 · Copyright 2020 The Anton Project Authors | Fora · condensada e pesada, próxima de Bebas Neue/Oswald; não tem 700 nativo. |

## Monoespaçada

| Família | Variável / eixos disponíveis | WOFF2 por subconjunto | Latin / Latin-ext (KiB) | Carga Latin (pesos; KiB) | Licença e crédito para `THIRD-PARTY-FONTS` | Veredito |
|---|---|---|---:|---|---|---|
| JetBrains Mono | Sim · wght 100–800; ital 0–1 | L2, LE2, Cy2, CyE2, Gr2, V2 | 39,5 / 14,8 | wght · 39,5 | OFL-1.1 · Copyright 2020 The JetBrains Mono Project Authors | Entra · atual, manter. |
| Fira Code | Sim · wght 300–700 | L1, LE1, Cy1, CyE1, Gr1, GrE1, S2 1 | 35,4 / 13,0 | wght · 35,4 | OFL-1.1 · Copyright 2014–2020 The Fira Code Project Authors | Fora · na amostra de prosa e operadores não apareceu diferença visual suficiente de JetBrains Mono no estilo atual do painel. |
| Roboto Mono | Sim · wght 100–700; ital 0–1 | L2, LE2, Cy2, CyE2, Gr2, V2 | 32,0 / 22,4 | wght · 32,0 | OFL-1.1 · Copyright 2015 The Roboto Mono Project Authors | Fora · mono neutra próxima de JetBrains Mono; menor ganho visual que as duas escolhidas. |
| IBM Plex Mono | Não · estática, 100/200/300/400/500/600/700 | L14, LE14, Cy14, CyE14, V14 | 14,4 / 13,0 | 300+400+500+600+700 · 73,1 | OFL-1.1 · Copyright 2017 IBM Corp. All rights reserved. | **Entra** · construção humanista/industrial distingue-se de JetBrains Mono; 800/900 serão sintetizados. |
| Space Mono | Não · estática, 400/700 | L4, LE4, V4 | 16,1 / 15,5 | 400+700 · 32,5 | OFL-1.1 · Copyright 2016 The Space Mono Project Authors | **Entra** · proporções mais largas e geométricas que JetBrains Mono/Roboto Mono; diferença clara na amostra. Outros pesos são sintetizados. |

## Manuscrita

| Família | Variável / eixos disponíveis | WOFF2 por subconjunto | Latin / Latin-ext (KiB) | Carga Latin (pesos; KiB) | Licença e crédito para `THIRD-PARTY-FONTS` | Veredito |
|---|---|---|---:|---|---|---|
| Dancing Script | Sim · wght 400–700 | L1, LE1, V1 | 41,7 / 22,1 | wght · 41,7 | OFL-1.1 · Copyright 2016 The Dancing Script Project Authors · RFN | Entra · atual, manter. |
| Pacifico | Não · estática, 400 | L1, LE1, Cy1, CyE1, V1 | 31,5 / 30,4 | 400 · 31,5 | OFL-1.1 · Copyright 2018 The Pacifico Project Authors | Entra · atual, manter. |
| Satisfy | Não · estática, 400 | L1, LE0 | 22,2 / — | 400 · 22,2 | Apache-2.0 · Copyright (c) 2011 by Font Diner, Inc. All rights reserved. | Entra · atual, manter; não há arquivo Latin-ext neste pacote. |
| Caveat | Sim · wght 400–700 | L1, LE1, Cy1, CyE1 | 73,2 / 28,8 | wght · 73,2 | OFL-1.1 · Copyright 2014 The Caveat Project Authors | Entra · atual, manter; maior carga Latin por família, ainda abaixo de 150 KiB. |
| Patrick Hand | Não · estática, só 400 | L1, LE1, V1 | 23,4 / 19,6 | 400 · 23,4 | OFL-1.1 · Copyright (c) 2010–2012 Patrick Wagesreiter | **Entra** · escrita manual de forma impressa, não cursiva conectada; distingue-se das quatro manuscritas atuais e continua legível em corpo. Outros pesos serão sintetizados. |

## Proposta de catálogo e orçamento

**Catálogo recomendado:** 26 famílias com arquivo — as 19 famílias atuais file-backed e sete acréscimos: Chakra Petch, Nunito, Source Serif 4, Roboto Slab, IBM Plex Mono, Space Mono e Patrick Hand. O subtotal Latin é **1.012.836 bytes (1,013 MB / 0,966 MiB)**. Como os idiomas `de` e `fr` podem exigir `ẞ` e `Ÿ`, recomendo Latin-ext nas famílias que o pacote disponibiliza: **+882.160 bytes (0,841 MiB)**, total **1.894.996 bytes (1,895 MB / 1,807 MiB)**. Contra 3 MB decimais, sobram **1.105.004 bytes (1,105 MB)**. `Satisfy` permanece como exceção por não ter Latin-ext. Nenhum arquivo variável Latin excede 150 KiB; a maior carga Latin por família é Caveat, **74.932 bytes (73,2 KiB)**. Se o dono interpretar 150 KB como teto combinado de Latin + Latin-ext, Unbounded chega a **169.252 bytes (165,3 KiB)**: precisará de exceção ou de ficar sem Latin-ext. Pelo texto da plan, o limite se aplica ao Latin variável, não ao agregado opcional.

### Valores novos propostos para `THEME_FONTS`

```ts
{ value: "'Chakra Petch', sans-serif", name: 'Chakra Petch', category: 'Sans-Serif' },
{ value: "'Nunito', sans-serif", name: 'Nunito', category: 'Sans-Serif' },
{ value: "'Source Serif 4', serif", name: 'Source Serif 4', category: 'Serif' },
{ value: "'Roboto Slab', serif", name: 'Roboto Slab', category: 'Serif' },
{ value: "'IBM Plex Mono', monospace", name: 'IBM Plex Mono', category: 'Monospace' },
{ value: "'Space Mono', monospace", name: 'Space Mono', category: 'Monospace' },
{ value: "'Patrick Hand', cursive", name: 'Patrick Hand', category: 'Handwriting' },
```

Os 19 nomes atuais com arquivo continuam no catálogo. A fonte `system-ui, -apple-system, sans-serif` também continua como opção existente, mas não ganha WOFF2: ela é a pilha do sistema operacional, não uma família embarcada. A inspeção direta de `src/core/Design/schema/typography.ts:2-31` encontra 19 opções file-backed **mais** essa opção de sistema (20 valores na lista); interpretei a regra dos “19 atuais” como as 19 famílias medíveis, sem retirar nem alterar o valor de sistema.

**Famílias pedidas pelos temas que não ganhariam arquivo nesta proposta:** Orbitron, VT323 e Fira Code. Chakra Petch entra. As razões estão nos vereditos; o dono pode abrir exceção de display para Orbitron/VT323 ou pedir ligaduras explícitas para Fira Code. Nenhuma das 19 famílias atuais fica sem arquivo.

### Latin-ext e os seis idiomas

Os 14 temas embarcados declaram `enabledLanguages: ['pt', 'en', 'es', 'fr', 'de', 'it']` (por exemplo, `aurora-veil.ts:242` e `blueprint-protocol.ts:245`). **Alemão (de)** pode exigir `ẞ` (U+1E9E) em caixa alta; **francês (fr)** pode usar `Ÿ` (U+0178) em caixa alta. Ambos ficam fora de `latin` e dentro de `latin-ext` nas famílias que oferecem esse subconjunto. Portanto, para cobertura ortográfica completa desses dois casos, a recomendação é incluir Latin-ext.

Latin-ext para as famílias propostas que o pacote oferece custa mais **882.160 bytes (0,841 MiB)**: total Latin + Latin-ext **1.894.996 bytes (1,895 MB / 1,807 MiB)**, ainda abaixo de 3 MB. `Satisfy` não publica Latin-ext, então continua sem esses dois glifos mesmo nessa opção; nesses raros caracteres o navegador usará uma face de fallback. `system-ui` fica sob cobertura do sistema. Os caracteres cotidianos já estão cobertos por Latin.

### Limitações estáticas que a implementação deve respeitar

- Chakra Petch tem pesos nativos 300–700; o total proposto inclui esses cinco arquivos. Para 800/900, que o painel permite, haverá síntese do peso.
- IBM Plex Mono tem pesos nativos 100–700; o total inclui 300/400/500/600/700. Para 800/900 haverá síntese.
- Space Mono só traz 400/700; outros valores do painel serão sintetizados.
- Patrick Hand só traz 400; os pesos de título serão sintetizados. O carregador futuro precisa tratá-la como face 400 única, em vez de declarar um 700 que o pacote não contém.
- O código atual usa `DEFAULT_WEIGHTS = '400;700'` para famílias sem entrada em `WEIGHT_AXES`. Na futura integração, as estáticas acima precisam de seleção explícita dos pesos realmente disponíveis; VT323 e Anton, se o dono pedir exceção, também só têm 400. Nenhum desses pesos altera o lote atual, que não toca código.

## Licenças e atribuições

Todas as 40 famílias avaliadas são redistribuíveis pelo arquivo `LICENSE` do pacote: 38 sob SIL OFL 1.1 e duas sob Apache 2.0 (Satisfy e Roboto Slab). Não há licença que impeça o embarque nem família de licença duvidosa. Ao montar `THIRD-PARTY-FONTS`, preservar o aviso de copyright/titular indicado na tabela e incluir o texto da licença correspondente. `RFN` marca nomes reservados pela OFL nos metadados (Playfair Display, Lora e Dancing Script); a proposta distribui os WOFF2 originais sem modificá-los nem renomear as famílias.

## Decisões que cabem ao dono

1. Confirmar Latin-ext como parte do pacote inicial para `ẞ` alemão e `Ÿ` francês (+882.160 bytes); `Satisfy` continua sem esses glifos e depende de fallback nesses caracteres.
2. Aceitar os pesos sintéticos das estáticas selecionadas acima de sua faixa nativa ou limitar os pesos que os temas/painel aplicam a elas.
3. Aceitar Orbitron e/ou VT323 como exceções display-only (Orbitron não tem Latin-ext), e/ou Fira Code se a intenção exigir ligaduras que não ficaram visíveis no estilo atual do painel.
4. Confirmar a leitura de contagem da lista: 19 opções com fonte mais a opção `system-ui`, todas preservadas.
5. Confirmar que o teto de 150 KB por família se aplica ao WOFF2 Latin, como redigido, e não ao conjunto Latin + Latin-ext; só Unbounded ultrapassa 150 KB na soma dos dois subconjuntos.

Nenhum arquivo Latin excede o limite por família e o total fica abaixo do orçamento. A possível exceção existe apenas se o teto também abranger Latin-ext combinado. Não há decisão pendente de licença.

## Achado fora do lote

`src/features/DesignEngine/Panels/LayoutTab.tsx:3` mantém uma lista local de apenas Outfit e Inter, separada da lista medida. As referências de produção encontradas são comentários, e o componente só aparece no próprio teste `Panels/__tests__/LayoutTab.test.tsx`; não foi usado como catálogo vivo nem alterado neste lote. Registrar para o revisor avaliar no escopo apropriado.## Lote 1b — segunda onda e catálogo consolidado

**Medição:** 2026-10-15 · segunda onda em pacotes Fontsource locais v5.3.0, exceto Source Sans 3 v5.3.1.  
**Escopo do adendo:** inventariar as sete candidatas, incorporar a decisão de variedade do dono e consolidar os 41 WOFF2 Latin propostos para o lote 2. Latin-ext foi medido para comparação, mas **não entra no pacote**.

### Método reproduzível

- Foram inspecionados `node_modules/@fontsource-variable/{open-sans,raleway,source-sans-3,merriweather}` e `node_modules/@fontsource/{poppins,lato,pt-serif}`. O script Node temporário percorreu `files/`, `metadata.json`, `package.json` e `LICENSE`; nada foi baixado ou alterado no repositório.
- A contagem por subconjunto considera todos os `.woff2` do pacote, inclusive normal/itálico e todos os pesos estáticos. As tabelas usam `L` = Latin, `LE` = Latin-ext, `Cy/CyE` = Cyrillic/Cyrillic-ext, `Gr/GrE` = Greek/Greek-ext, `He` = Hebrew, `M` = Math, `S` = Symbols e `V` = Vietnamese.
- WOFF2 upright: variável `*-latin-wght-normal.woff2`; estática, `*-latin-400-normal.woff2`. Os bytes foram lidos diretamente do arquivo. Latin-ext upright foi medido com o mesmo sufixo e fica fora do orçamento desta proposta.
- A união dos pesos pedidos pelo painel e usados pelos temas é 300/400/500/600/700/800/900: H1/H2 expõem 300/400/600/700/800/900, corpo expõe 300/400/500, e temas usam 400/500/600/700/800/900. Para estáticas, a carga é a soma dos WOFF2 Latin normal dos pesos dessa união que o pacote tem. Pesos ausentes são sintetizados pelo navegador, conforme aceito pelo dono; não se declara peso sem arquivo. Pesos nativos fora dessa união não são carregados.
- Para variáveis, a carga conta um único WOFF2 Latin `wght` upright. Outros eixos são registrados no inventário, mas não aumentam esta conta. Assim como no lote 1, não se contam itálicos porque a biblioteca pede faces upright.
- Para a comparação, um espécime local foi renderizado a partir dos WOFF2 instalados, com título a 700, subtítulo a 600, corpo a 400 e texto acentuado. Todas as sete candidatas renderizaram corpo e título legíveis. Semelhanças visuais são informativas e não excluem famílias pela regra do dono.
- `KiB = bytes / 1024`; `MB` usa unidade decimal (`bytes / 1.000.000`). Licença veio do `package.json`; crédito e eventual Reserved Font Name foram conferidos no `metadata.json`/`LICENSE`.

### Segunda onda — sans

| Família | Variável? · eixos | WOFF2 por subconjunto | Latin / Latin-ext upright | Pesos usados: nativos e síntese | Carga Latin | Licença e crédito para `THIRD-PARTY-FONTS` | Veredito |
|---|---|---|---:|---|---:|---|---|
| Open Sans | Sim · `wght` 300–800, `wdth` 75–100, `ital` 0–1 | L2, LE2, Cy2, CyE2, Gr2, GrE2, He2, M2, S2, V2 | 48.320 B (47,2 KiB) / 35.156 B (34,3 KiB) | Variável 300–800; 900 sintetizado | 48.320 B (47,2 KiB) | SIL OFL 1.1 · Copyright 2020 The Open Sans Project Authors (https://github.com/googlefonts/opensans) | **Entra** · confortável em corpo e título; visualmente próxima do papel neutro de Inter/Roboto, registrada como alternativa de marca. |
| Raleway | Sim · `wght` 100–900, `ital` 0–1 | L2, LE2, Cy2, CyE2, V2 | 48.264 B (47,1 KiB) / 31.480 B (30,7 KiB) | Variável 300–900; todos os valores cobertos | 48.264 B (47,1 KiB) | SIL OFL 1.1 · Copyright 2010 The Raleway Project Authors (impallari@gmail.com) · RFN “Raleway” | **Entra** · legível a 400 em corpo; títulos mostram ritmo mais arejado que Montserrat. A proximidade geométrica fica registrada, sem veto. |
| Source Sans 3 | Sim · `wght` 200–900, `ital` 0–1 | L2, LE2, Cy2, CyE2, Gr2, GrE2, V2 | 28.872 B (28,2 KiB) / 60.088 B (58,7 KiB) | Variável 300–900; todos os valores cobertos | 28.872 B (28,2 KiB) | SIL OFL 1.1 · Google Inc. | **Entra** · desenho humanista compacto, adequado a parágrafos e cabeçalhos; no espécime é mais estreita e menos geométrica que Lexend. |
| Poppins | Não · estática; pesos disponíveis 100/200/300/400/500/600/700/800/900 | L18, LE18, Devanagari18 | 7.884 B (7,7 KiB) / 5.644 B (5,5 KiB) | Declara 300/400/500/600/700/800/900; nenhum desses pesos é sintetizado | 54.744 B (53,5 KiB) | SIL OFL 1.1 · Copyright 2020 The Poppins Project Authors (https://github.com/itfoundry/Poppins) | **Entra** · títulos geométricos marcantes e corpo legível na amostra; visualmente próxima de Plus Jakarta Sans, sem identidade igual. |
| Lato | Não · estática; pesos disponíveis 100/300/400/700/900 | L10, LE10 | 23.580 B (23,0 KiB) / 5.612 B (5,5 KiB) | Declara 300/400/700/900; 500/600/800 sintetizados | 92.360 B (90,2 KiB) | SIL OFL 1.1 · Copyright (c) 2010–2011 by tyPoland Lukasz Dziedzic (team@latofonts.com) · RFN “Lato” | **Entra** · mantém leitura confortável nos dois tamanhos; mais humanista e aberta que Inter, embora cumpra papel próximo. |

### Segunda onda — serif

| Família | Variável? · eixos | WOFF2 por subconjunto | Latin / Latin-ext upright | Pesos usados: nativos e síntese | Carga Latin | Licença e crédito para `THIRD-PARTY-FONTS` | Veredito |
|---|---|---|---:|---|---:|---|---|
| Merriweather | Sim · `wght` 300–900, `opsz` 18–144, `wdth` 87–112, `ital` 0–1 | L2, LE2, Cy2, CyE2, V2 | 97.548 B (95,3 KiB) / 74.960 B (73,2 KiB) | Variável 300–900; todos os valores cobertos | 97.548 B (95,3 KiB) | SIL OFL 1.1 · Copyright 2024 The Merriweather Project Authors (https://github.com/EbenSorkin/Merriweather4) · RFN “Merriweather” | **Entra** · corpo e título permanecem legíveis; o contraste e as serifas a distinguem de Roboto Slab, ainda que ambas ocupem espaço editorial. |
| PT Serif | Não · estática; pesos disponíveis 400/700 | L4, LE4, Cy4, CyE4 | 33.116 B (32,3 KiB) / 21.548 B (21,0 KiB) | Declara 400/700; 300/500/600/800/900 sintetizados | 62.704 B (61,2 KiB) | SIL OFL 1.1 · Copyright © 2010 ParaType Ltd. All rights reserved. | **Entra** · leitura e título equilibrados; visualmente mais textual e de contraste menor que Playfair Display. |

A segunda onda não contém candidatas de display/condensada/slab, mono ou manuscrita.

### Valores exatos a acrescentar a `THEME_FONTS`

Esta lista cobre todas as 22 famílias novas do catálogo consolidado em relação às 19 famílias atuais com arquivo. Os sete valores propostos no lote 1 reaparecem aqui para deixar o conjunto pronto para o lote 2.

| Categoria | Família | `value` |
|---|---|---|
| Sans-Serif | Chakra Petch | `"'Chakra Petch', sans-serif"` |
| Sans-Serif | Nunito | `"'Nunito', sans-serif"` |
| Sans-Serif | DM Sans | `"'DM Sans', sans-serif"` |
| Sans-Serif | Manrope | `"'Manrope', sans-serif"` |
| Sans-Serif | Work Sans | `"'Work Sans', sans-serif"` |
| Sans-Serif | Open Sans | `"'Open Sans', sans-serif"` |
| Sans-Serif | Raleway | `"'Raleway', sans-serif"` |
| Sans-Serif | Source Sans 3 | `"'Source Sans 3', sans-serif"` |
| Sans-Serif | Poppins | `"'Poppins', sans-serif"` |
| Sans-Serif | Lato | `"'Lato', sans-serif"` |
| Serif | Source Serif 4 | `"'Source Serif 4', serif"` |
| Serif | Roboto Slab | `"'Roboto Slab', serif"` |
| Serif | Lora | `"'Lora', serif"` |
| Serif | Merriweather | `"'Merriweather', serif"` |
| Serif | PT Serif | `"'PT Serif', serif"` |
| Display | Orbitron | `"'Orbitron', display"` |
| Display | VT323 | `"'VT323', display"` |
| Display | Oswald | `"'Oswald', display"` |
| Monospace | Fira Code | `"'Fira Code', monospace"` |
| Monospace | IBM Plex Mono | `"'IBM Plex Mono', monospace"` |
| Monospace | Space Mono | `"'Space Mono', monospace"` |
| Handwriting | Patrick Hand | `"'Patrick Hand', cursive"` |

### Pesos estáticos para o manifesto/carregador do lote 2

O manifesto deve guardar a lista de faces reais por família e o campo de subconjuntos, ainda com `latin` como único valor. Para cada família abaixo, o carregador declara apenas os pesos nativos relevantes ao painel/temas e deixa o navegador sintetizar os demais.

| Família estática | Pesos nativos a declarar | Valores do painel/temas sintetizados | Carga Latin incluída |
|---|---|---|---:|
| Bebas Neue | 400 | 300/500/600/700/800/900 | 13,4 KiB |
| Chakra Petch | 300/400/500/600/700 | 800/900 | 48,4 KiB |
| VT323 | 400 | 300/500/600/700/800/900 | 17,5 KiB |
| Pacifico | 400 | 300/500/600/700/800/900 | 31,5 KiB |
| Satisfy | 400 | 300/500/600/700/800/900 | 22,2 KiB |
| IBM Plex Mono | 300/400/500/600/700 | 800/900 | 73,1 KiB |
| Space Mono | 400/700 | 300/500/600/800/900 | 32,5 KiB |
| Patrick Hand | 400 | 300/500/600/700/800/900 | 23,4 KiB |
| Poppins | 300/400/500/600/700/800/900 | Nenhum | 53,5 KiB |
| Lato | 300/400/700/900 | 500/600/800 | 90,2 KiB |
| PT Serif | 400/700 | 300/500/600/800/900 | 61,2 KiB |

Pesos 100/200 de algumas famílias não são usados pelo painel nem pelos temas e, portanto, não são declarados. As variáveis cobrem os pesos nos limites do eixo; Open Sans sintetiza apenas 900 porque `wght` termina em 800. Manrope sintetiza 900 porque termina em 800; Orbitron começa em 400 e sintetiza 300; Oswald termina em 700 e sintetiza 800/900; Fira Code termina em 700 e sintetiza 800/900; Lora vai de 400 a 700 e sintetiza 300/800/900. As demais variáveis cobrem a faixa requerida.

### Catálogo consolidado para o lote 2

O catálogo soma os WOFF2 **Latin upright** que o carregador declararia: as 26 famílias já propostas no lote 1 (**1.012.836 B**), as oito famílias adicionadas pela decisão do dono (**244.372 B**) e as sete desta segunda onda (**432.812 B**).

| Categoria | Famílias do catálogo · carga Latin por família |
|---|---|
| Sans-Serif | Inter 47,1 KiB · Outfit 31,5 KiB · Roboto 42,1 KiB · Montserrat 37,1 KiB · Space Grotesk 21,8 KiB · Plus Jakarta Sans 26,7 KiB · Lexend 38,8 KiB · Sora 32,9 KiB · Syne 33,8 KiB · Archivo 34,1 KiB · Chakra Petch 48,4 KiB · Nunito 38,2 KiB · DM Sans 36,1 KiB · Manrope 24,3 KiB · Work Sans 49,1 KiB · Open Sans 47,2 KiB · Raleway 47,1 KiB · Source Sans 3 28,2 KiB · Poppins 53,5 KiB · Lato 90,2 KiB |
| Serif | Playfair Display 37,5 KiB · Fraunces 35,8 KiB · Source Serif 4 49,7 KiB · Roboto Slab 33,4 KiB · Lora 36,9 KiB · Merriweather 95,3 KiB · PT Serif 61,2 KiB |
| Display, condensada e slab | Unbounded 49,7 KiB · Bebas Neue 13,4 KiB · Orbitron 11,5 KiB · VT323 17,5 KiB · Oswald 27,8 KiB |
| Monospace | JetBrains Mono 39,5 KiB · Fira Code 35,4 KiB · IBM Plex Mono 73,1 KiB · Space Mono 32,5 KiB |
| Manuscrita | Dancing Script 41,7 KiB · Pacifico 31,5 KiB · Satisfy 22,2 KiB · Caveat 73,2 KiB · Patrick Hand 23,4 KiB |

**Total proposto:** 41 famílias com WOFF2, **1.690.020 B (1,690 MB / 1,612 MiB)**. Contra o teto de 3 MB decimais, a folga é **1.309.980 B (1,310 MB)**. A maior carga por família é Merriweather, 97.548 B (95,3 KiB); nenhuma excede o ponto de partida de ~150 KB. Não há exceção de orçamento. Latin-ext não foi incluído no total. `system-ui, -apple-system, sans-serif` permanece como opção de sistema já existente, sem arquivo, fora da contagem de 41.

### Decisões que ainda cabem ao dono

1. Confirmar em revisão a inclusão das sete famílias da segunda onda no catálogo de 41. As sete passam licença, qualidade em corpo/título e orçamento; proximidade com uma família existente foi registrada apenas para informação, conforme a regra nova.
2. Não há decisão técnica adicional sobre licença, subconjunto ou exceção de tamanho: todas são SIL OFL 1.1 redistribuíveis, o catálogo usa só Latin e o total/família ficam abaixo dos limites.
3. Pesos sintéticos das estáticas já foram aceitos pelo dono. O ponto que o lote 2 precisa preservar é declarar somente pesos com arquivo e documentar que os temas escolhem pesos nativos quando quiserem evitar síntese.
4. O manifesto conserva o campo de subconjuntos com `latin` como valor atual. Latin-ext continua como expansão futura, não como carga do lote 2.

### Licenças e atribuições da segunda onda

As sete candidatas são redistribuíveis sob SIL OFL 1.1; não há licença que impeça embarque ou licença duvidosa. Para `THIRD-PARTY-FONTS`, manter os créditos e o texto OFL indicados na tabela. Raleway, Merriweather e Lato declaram Reserved Font Names; o catálogo usa os arquivos originais sem modificá-los ou renomear as famílias.

