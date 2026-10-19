# Lote 17 — Neumorphic Mobile

## 1. Nota de conceito

Interface macia e tátil em cinza frio, pensada para uso com o polegar. A página usa `noise` com grão baixo; cartões lisos de raio 24 e botões em relevo usam raio 20. A tipografia é Plus Jakarta Sans, os ícones são Lucide regular e o gráfico usa barras.

## 2. Medições

| Medida | Resultado |
|---|---:|
| Tokens estéticos no modo principal | 301, incluindo `mode` |
| Tokens estéticos `modeDependent` na contraparte | 104, mais `mode` |
| Tokens funcionais declarados | 0 |
| R31 — menor contraste textual, claro | `tooltipTextColor` / `tooltipBg` composto sobre o corpo: **4,581:1** |
| R31 — menor contraste textual, escuro | `statusErrorColor` / cartão composto sobre o corpo: **4,598:1** |
| Paleta categórica, menor contraste não textual | claro **3,070:1** · escuro **3,041:1** |
| Peso isolado, minificado | 10.121 B |
| Peso isolado, gzip -9 | **3.382 B**, abaixo do teto de 4,5 KB |

R31 passou nos dois modos, sem pares reprovados ou pulados. A paleta automática de oito cores usa as cores de marca, reserva cores de estado e mantém contraste acima de 3:1 sobre a superfície em claro e escuro (A8). O terciário claro foi ajustado para `#7a354d` para preservar a superfície `#e3e7ee` da ficha e levar o menor contraste da paleta a 3,070:1.

## 3. Capturas abertas e conferidas

Geradas a partir de `src/` por harness temporário fora do repositório, com Chromium de `node_modules/.cache/ms-playwright`, `PLAYWRIGHT_BROWSERS_PATH` absoluto e `chromium.launch()` sem `executablePath`. As fontes vieram de `dist/fonts` em modo somente leitura. Na cópia temporária da fixture, removi o `type="area"` explícito para que o motor use o `chartType: "bar"` do tema. Cada imagem foi aberta e conferida contra o conceito.

| Captura | Conferência contra o conceito |
|---|---|
| `node_modules/.cache/capturas-dos-temas/neumorphic-mobile/neumorphic-mobile__light__sidebar__desktop__telas.png` | Cinza macio, grão discreto e controles elevados; a tabela, o formulário e as barras permanecem legíveis na coluna principal. |
| `node_modules/.cache/capturas-dos-temas/neumorphic-mobile/neumorphic-mobile__light__topbar__desktop__telas.png` | A topbar fica compacta; os cartões claros mantêm o relevo baixo e as barras confirmam o tipo do tema. |
| `node_modules/.cache/capturas-dos-temas/neumorphic-mobile/neumorphic-mobile__light__sidebar__desktop__modal.png` | O modal tem superfície elevada, bordas suaves e texto nítido sobre o véu claro. |
| `node_modules/.cache/capturas-dos-temas/neumorphic-mobile/neumorphic-mobile__light__sidebar__mobile__telas.png` | O conteúdo reflowa em uma coluna, a tabela vira linhas empilhadas e as barras continuam visíveis na largura móvel. |
| `node_modules/.cache/capturas-dos-temas/neumorphic-mobile/neumorphic-mobile__light__sidebar__mobile__modal.png` | O diálogo cabe no celular e preserva o botão tátil e o contraste com a página ao fundo. |
| `node_modules/.cache/capturas-dos-temas/neumorphic-mobile/neumorphic-mobile__dark__sidebar__desktop__telas.png` | A contraparte usa ardósia escura, grão baixo e superfícies em camadas; botões e cartões continuam distintos. |
| `node_modules/.cache/capturas-dos-temas/neumorphic-mobile/neumorphic-mobile__dark__topbar__desktop__telas.png` | A topbar acompanha o fundo escuro sem comprimir o conteúdo; o gráfico de barras fica separado da superfície. |
| `node_modules/.cache/capturas-dos-temas/neumorphic-mobile/neumorphic-mobile__dark__sidebar__desktop__modal.png` | O modal se separa da página pelo tom e pelo relevo, sem perder a leitura do texto. |
| `node_modules/.cache/capturas-dos-temas/neumorphic-mobile/neumorphic-mobile__dark__sidebar__mobile__telas.png` | Campos e tabela fluem em uma coluna sobre cinza escuro; barras e estados mantêm distinção. |
| `node_modules/.cache/capturas-dos-temas/neumorphic-mobile/neumorphic-mobile__dark__sidebar__mobile__modal.png` | O diálogo ocupa a largura móvel com margem, botão elevado e superfície legível. |

## 4. O que o tema ensinou

| Item | Tipo | Conclusão | Destino proposto |
|---|---|---|---|
| Textura de página | Ajuste | A primeira leitura mostrou ruído dominante. `textureOpacity` e `bgNoiseDensity` ficaram em `0.05`, alinhados ao grão baixo da ficha; `noise` é declarado uma vez e permanece igual nos dois modos. | Esta medição |
| Fundo claro | Decisão | A superfície voltou a `#e3e7ee`, como na ficha; o terciário da marca foi ajustado para que as oito cores do gráfico continuem acima de 3:1. | A8 e regra de 3:1 não textual |
| Navegação móvel | Divergência da ficha | A ficha pede topbar, barra inferior e alvo de toque 48. Os tokens correspondentes são funcionais e foram omitidos conforme a regra do lote. | Registro da divergência |
| Peso | Medida | 3.382 B gzip, abaixo do limite de 4,5 KB. | Método da §4.1 do anexo de direção |

## 5. Achados do arsenal ou do fluxo

1. A ficha pede `navigationStyle`, `mobileNavigationStyle` e `touchTargetMin: 48`; foram omitidos por serem funcionais. `sidebarPosition` também não foi declarado. O tema não inclui nenhum token funcional na contraparte.
2. `texture` não carrega modo: `noise` foi escolhido para ambos os modos e não aparece como chave na contraparte. As opacidades e intensidades são tokens estéticos com passo de 0,05.
3. O medidor `themes:diversity` passou. Classificou o tema como claro, neutro (H207/S17), raio 24, borda 0, blur 0 e densidade confortável.
4. `theme-completeness:check`, `variable-contract:check`, `panel-contract:check`, R31 e os testes categóricos, de disputa de canal e paridade contratual passaram. O grep encontrou apenas referências de pré-carregamento em `useThemeReadiness.test.ts`, sem valores visuais fixos do tema.

### Resumo do executor

Tema completo nos dois modos, com 301 chaves estéticas no principal (inclui `mode`), 104 chaves estéticas dependentes de modo mais `mode` na contraparte e nenhuma chave funcional. R31 passou em 4,581:1 no claro e 4,598:1 no escuro; a paleta categórica ficou em 3,070:1 e 3,041:1; o peso ficou em 3.382 B gzip. O ruído foi reduzido após a conferência visual. As dez capturas mostram relevo suave, barras no gráfico e adaptação para celular.

## 6. Suíte delimitada final

npx vitest run src/core/Design src/core/Provider src/features/DesignEngine: 170 arquivos passaram e 1 falhou; 1.145/1.146 testes passaram. A única falha foi themeCatalogParity.test.ts, que encontrou a entrada gerada de neumorphic-mobile desatualizada em relação à descrição e aos swatches do preset. A plan exclui themes:catalog; o catálogo não foi regenerado nem alterado.
