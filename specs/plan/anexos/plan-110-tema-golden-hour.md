# Lote 18 — Golden Hour

## 1. Nota de conceito

Editorial quente de fim de tarde: fundo creme, títulos Playfair Display, corpo Plus Jakarta Sans e assinatura Satisfy. O ouro e o castanho acompanham o honeycomb de página; cartões com grão fotográfico, raio 20 e borda dourada; botões matte e gráfico de área suavizado.

## 2. Medições

| Medida | Resultado |
|---|---:|
| Tokens estéticos no modo principal | 301, incluindo `mode` |
| Tokens estéticos `modeDependent` na contraparte | 104, mais `mode` |
| Tokens funcionais declarados | 0 |
| R31 — menor contraste textual, claro | `statusSuccessColor` / `colorBgBody`: **4,507:1** |
| R31 — menor contraste textual, escuro | `inputErrorColor` / cartão composto sobre o corpo: **4,601:1** |
| Paleta categórica, menor contraste não textual | claro **3,032:1** · escuro **3,231:1** |
| Peso isolado, minificado | 10.225 B |
| Peso isolado, gzip -9 | **3.448 B**, abaixo do teto de 4,5 KB |

R31 passou nos dois modos, sem pares reprovados ou pulados. A paleta categórica de oito cores deriva das cores de marca e mantém contraste acima de 3:1 sobre a superfície em ambos os modos; os estados não entram na paleta automática (A8). `statusErrorColor` claro foi escurecido de `#e51414` para `#b42318` para passar AA.

## 3. Capturas abertas e conferidas

Geradas a partir de `src/` por harness temporário fora do repositório, com Chromium de `node_modules/.cache/ms-playwright`, `PLAYWRIGHT_BROWSERS_PATH` absoluto e `chromium.launch()` sem `executablePath`. As fontes vieram de `dist/fonts` em modo somente leitura. A cópia temporária da fixture não fixa o tipo do gráfico, deixando `chartType: "area"` do tema decidir. As dez imagens foram abertas e comparadas à nota de conceito.

| Captura | Conferência contra o conceito |
|---|---|
| `node_modules/.cache/capturas-dos-temas/golden-hour/golden-hour__light__sidebar__desktop__telas.png` | Creme, mel e serifa aparecem junto do honeycomb; os cartões com grão e o gráfico de área mantêm a página editorial. |
| `node_modules/.cache/capturas-dos-temas/golden-hour/golden-hour__light__topbar__desktop__telas.png` | A navegação de topo conserva espaço para a composição; título serifado, ouro e gráfico suave seguem coerentes. |
| `node_modules/.cache/capturas-dos-temas/golden-hour/golden-hour__light__sidebar__desktop__modal.png` | O modal usa borda dourada, fundo creme e ação principal em mel, com o padrão de página ainda perceptível pelo véu. |
| `node_modules/.cache/capturas-dos-temas/golden-hour/golden-hour__light__sidebar__mobile__telas.png` | O layout vira uma coluna e a tabela se empilha; o gráfico e a tipografia continuam legíveis no celular. |
| `node_modules/.cache/capturas-dos-temas/golden-hour/golden-hour__light__sidebar__mobile__modal.png` | O diálogo cabe na tela móvel, com serifa, botão dourado e separação clara do fundo. |
| `node_modules/.cache/capturas-dos-temas/golden-hour/golden-hour__dark__sidebar__desktop__telas.png` | A contraparte vira luz de abajur sobre castanho profundo; honeycomb, grão e ouro seguem visíveis sem trocar a identidade. |
| `node_modules/.cache/capturas-dos-temas/golden-hour/golden-hour__dark__topbar__desktop__telas.png` | A topbar mantém navegação e largura; tabela, cartões e gráfico permanecem diferenciados no modo escuro. |
| `node_modules/.cache/capturas-dos-temas/golden-hour/golden-hour__dark__sidebar__desktop__modal.png` | O modal escuro se destaca pelo contorno dourado e pelo fundo mais profundo, com texto claro. |
| `node_modules/.cache/capturas-dos-temas/golden-hour/golden-hour__dark__sidebar__mobile__telas.png` | A página se reorganiza em uma coluna; as barras do calendário, a tabela empilhada e o chat cabem na largura móvel. |
| `node_modules/.cache/capturas-dos-temas/golden-hour/golden-hour__dark__sidebar__mobile__modal.png` | O diálogo cabe no celular e preserva o botão em mel e a leitura sobre o fundo escuro. |

## 4. O que o tema ensinou

| Item | Tipo | Conclusão | Destino proposto |
|---|---|---|---|
| Textura honeycomb | Ajuste de grade | `textureOpacity` e `bgNoiseDensity` usam 0,05; a ficha também pede 0,05. `texture` fica declarado uma vez e não muda entre modos. | Esta ficha |
| Grão dos cartões | Ajuste de grade | A ficha pede 0,08; o passo de opacidade de 0,05 leva o token a 0,10, aproximando a textura do grão fotográfico sem sair da grade. | Esta ficha |
| Contraste do estado de erro | Correção | `statusErrorColor` claro foi escurecido para `#b42318`; R31 passou, e a paleta categórica continua sem cores de estado. | R31 e A8 |
| Peso | Medida | 3.448 B gzip, abaixo do limite de 4,5 KB. | Método da §4.1 do anexo de direção |

## 5. Achados do arsenal ou do fluxo

1. A ficha descreve navegação `sidebar` e celular `auto`; são escolhas funcionais e foram omitidas conforme a regra do lote. O tema não declara `navigationStyle`, `mobileNavigationStyle`, `touchTargetMin` nem `sidebarPosition`.
2. A textura `honeycomb` é única nos dois modos; a contraparte não repete a chave `texture`. A opacidade do fundo e a densidade do grão são 0,05; o grão dos cartões é 0,10, arredondado da ficha para o passo autorizado.
3. O medidor `themes:diversity` passou. Classificou o tema como claro, laranja (H40/S100), raio 20, borda 1, blur 0 e densidade espaçosa.
4. `theme-completeness:check`, `variable-contract:check`, `panel-contract:check`, R31 e os testes categóricos, de disputa de canal e paridade contratual passaram. O grep encontrou apenas referências ao identificador nos testes de carregamento/registro e em um teste de tema customizado; não há teste com valores visuais fixos deste preset.

### Resumo do executor

Tema completo nos dois modos, com 301 chaves estéticas no principal (inclui `mode`), 104 chaves estéticas dependentes de modo mais `mode` na contraparte e nenhuma chave funcional. R31 passou em 4,507:1 no claro e 4,601:1 no escuro; a paleta categórica ficou em 3,032:1 e 3,231:1; o peso ficou em 3.448 B gzip. As dez capturas mostram a composição creme e mel, o honeycomb, a serifa e a contraparte escura.

## 6. Suíte delimitada final

npx vitest run src/core/Design src/core/Provider src/features/DesignEngine: 170 arquivos passaram e 1 falhou; 1.145/1.146 testes passaram. A única falha foi themeCatalogParity.test.ts, que encontrou a entrada gerada de golden-hour desatualizada em relação à descrição e aos swatches do preset. A plan exclui themes:catalog; o catálogo não foi regenerado nem alterado.
