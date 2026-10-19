# Lote 13 — Cyber Retro Wave

## 1. Nota de conceito

Y2K cromado em prata, vidro iridescente e ciano elétrico. O modo nativo claro usa Space Grotesk e superfícies de vidro; a contraparte escura preserva a malha prismática branca, com ciano e lilás em destaque. A ficha descreve neon claro sobre fundo de luminosidade média.

## 2. Medições

| Medida | Resultado |
|---|---:|
| Tokens estéticos no modo principal | 301, incluindo `mode` |
| Tokens estéticos `modeDependent` na contraparte | 104, mais `mode` |
| Tokens funcionais declarados | 0; 19 valores funcionais legados removidos |
| R31 — menor contraste textual, escuro | `statusErrorColor` / cartão: **4,527:1** |
| R31 — menor contraste textual, claro | `navItemActiveColor` / corpo: **4,671:1** |
| Contraste não textual mínimo da paleta categórica no fundo da página | escuro **3,369:1** · claro **3,005:1** |
| Peso isolado, minificado | 11.690 B |
| Peso isolado, gzip -9 | **3.586 B**, abaixo do teto de 4,5 KB |

`categoricalPalette.test.ts` passou (2 casos do tema; 33 outros filtrados). A paleta usa primária, secundária, destaque e terciária; não usa cores de status. O menor contraste de série no fundo em que o gráfico é renderizado é 3,005:1 no claro, acima dos 3:1 de A8.

## 3. Capturas abertas e conferidas

Geradas a partir de `src/`, com Chromium de `node_modules/.cache/ms-playwright` via `PLAYWRIGHT_BROWSERS_PATH` absoluto e fontes reais lidas de `dist/fonts` em modo somente leitura. Cada imagem foi aberta e comparada à nota de conceito.

| Captura | Conferência contra o conceito |
|---|---|
| `node_modules/.cache/capturas-dos-temas/cyber-retro-wave/cyber-retro-wave__light__sidebar__desktop__telas.png` | A superfície prata, malha prismática, cartões vítreos e ações ciano formam a leitura Y2K clara; gráfico ciano e lilás segue legível. |
| `node_modules/.cache/capturas-dos-temas/cyber-retro-wave/cyber-retro-wave__light__sidebar__desktop__modal.png` | O modal de vidro branco separa-se do fundo prateado, com ação ciano visível. |
| `node_modules/.cache/capturas-dos-temas/cyber-retro-wave/cyber-retro-wave__light__topbar__desktop__telas.png` | A topbar conserva espaço horizontal e repete a malha, prata e controles ciano sem comprimir o conteúdo. |
| `node_modules/.cache/capturas-dos-temas/cyber-retro-wave/cyber-retro-wave__light__sidebar__mobile__telas.png` | A composição móvel empilha cartões e campos; a malha continua sutil atrás dos elementos. |
| `node_modules/.cache/capturas-dos-temas/cyber-retro-wave/cyber-retro-wave__light__sidebar__mobile__modal.png` | O diálogo se ajusta à largura móvel e mantém o contorno vítreo e a ação ciano. |
| `node_modules/.cache/capturas-dos-temas/cyber-retro-wave/cyber-retro-wave__dark__sidebar__desktop__telas.png` | O modo escuro transforma a prata em azul-marinho profundo; a malha prismática branca e os controles ciano mantêm a assinatura. |
| `node_modules/.cache/capturas-dos-temas/cyber-retro-wave/cyber-retro-wave__dark__sidebar__desktop__modal.png` | O véu do modal separa as camadas escuras; texto e ação preservam hierarquia. |
| `node_modules/.cache/capturas-dos-temas/cyber-retro-wave/cyber-retro-wave__dark__topbar__desktop__telas.png` | A navegação horizontal mantém a largura útil, com superfícies escuras, ciano e malha branca coerentes. |
| `node_modules/.cache/capturas-dos-temas/cyber-retro-wave/cyber-retro-wave__dark__sidebar__mobile__telas.png` | Os cartões e campos permanecem legíveis em coluna estreita; o ciano destaca ações e navegação. |
| `node_modules/.cache/capturas-dos-temas/cyber-retro-wave/cyber-retro-wave__dark__sidebar__mobile__modal.png` | O modal se ajusta ao celular e mantém o contraste entre fundo, superfície e ação. |

## 4. O que o tema ensinou

| Item | Tipo | Conclusão | Destino proposto |
|---|---|---|---|
| Primária ciano no fundo prata | Armadilha | `#00b8ff` sobre `#c9ced8` mede **1,43:1**; a primária textual foi escurecida para `#005273`, enquanto o botão mantém o ciano com texto escuro. A primária original fica como cor de marca e de série. | `ui-criar-tema` §5.7, consolidação do lote 25 |
| Contraste claro de status | Decisão | `inputErrorColor` e `statusErrorColor` em `#9f1d39` passam R31; o mínimo final no claro é 4,671:1. | `usage` de tokens de estado, consolidação do lote 25 |
| Reservas repetidas `var(--x, F)` | Receita | Os dois fallbacks repetidos foram alinhados ao `defaultValue` de seus tokens; o contrato conferiu 2.988 reservas no conjunto. | `ui-criar-tema` §5.7, consolidação do lote 25 |
| Paleta de gráfico | Medida | Mínimos no fundo da página: 3,369:1 no escuro e 3,005:1 no claro; os dois superam 3:1. Cores de estado não são séries. | A8 no anexo de direção de arte |
| Peso | Medida | 3.586 B gzip para o tema isolado. | Esta medição |

## 5. Achados do arsenal ou do fluxo

1. A ficha pede a primária `#00b8ff` (anexo de direção, §7.8). Como texto sobre o fundo prata `#c9ced8`, mede 1,43:1; o R31 reprovaria. A primária textual do modo claro foi ajustada para `#005273` (**5,42:1** contra o fundo); o botão preserva `#00b8ff` com texto escuro (`src/core/Design/presets/themes/cyber-retro-wave.ts:276,314`). Divergência visual registrada e medida.
2. A ficha pede topbar e navegação móvel automática (`specs/plan/anexos/plan-110-direcao-de-arte.md:408`); esses campos são funcionais e não foram declarados. O cromo existente aparece nas capturas. A divergência de escopo fica anotada aqui.
3. A paleta categórica passou A8 e o limite visual não textual de 3:1, embora a skill `dataviz` não exista neste repositório.
4. A paridade do catálogo gerado fica para a atualização única do revisor: `themeCatalogParity.test.ts:44` acusa metadados antigos em `src/core/Design/presets/themes/catalog.generated.ts:17`. Não rodei `themes:catalog`, conforme o modelo dos lotes 8–24.

### Resumo do executor

Tema completo nos dois modos, fora da exceção, sem tokens funcionais e com peso de 3.586 B gzip. R31 passou nos dois modos; a paleta gráfica passou A8 e a diversidade registra o modo claro, família ciano e fundo de luminosidade 82. As dez capturas foram abertas e conferidas. A primária de marca permanece ciano nos controles; a cor textual foi escurecida por contraste.

### Correção do veredito de 2026-10-18

O veredito reprovou 10 valores numéricos. Mantida a intenção visual, ajustei `cardGlowIntensity` 0,18 → 0,20, `cardSpotlightOpacity` 0,12 → 0,10, `textureOpacity` 0,055 → 0,06 e `vignetteOpacity` 0,12 → 0,10, todos para a grade do token; os seis raios de botão e input passaram de 999 para 120, o máximo do contrato para a forma de pílula. Reexecutei R31 após os ajustes de opacidade: os 76 pares cobertos passam nos dois modos, sem reprovação nem par pulado.
