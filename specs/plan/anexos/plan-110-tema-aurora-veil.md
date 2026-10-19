# Lote 19 — Aurora Veil

## 1. Nota de conceito

Vidro lavanda sobre uma aurora boreal: fundo `#f6f3fb`, malha de quatro cores, cartões de vidro fosco com blur 16 e raio 28. A tipografia Lexend/Inter e o traço fino dos ícones mantêm o tom calmo; o gráfico de linha usa suavização. A contraparte escura preserva a atmosfera em `#120f1d`.

## 2. Medições

| Medida | Resultado |
|---|---:|
| Tokens estéticos no modo principal | 301, incluindo `mode` |
| Tokens estéticos `modeDependent` na contraparte | 104, mais `mode` |
| Tokens funcionais declarados | 0 |
| R31 — menor contraste textual, claro | `inputErrorColor` / `colorBgBody`: **4,731:1** |
| R31 — menor contraste textual, escuro | `inputErrorColor` / cartão composto sobre o corpo: **4,848:1** |
| Paleta categórica, menor contraste não textual | claro **3,109:1** · escuro **3,110:1** |
| Peso isolado, minificado | 10.811 B |
| Peso isolado, gzip -9 | **3.466 B**, abaixo do teto de 4,5 KB |

R31 passou nos dois modos, sem pares reprovados ou pulados. A paleta categórica de oito cores deriva das cores da marca, reserva cores de estado e supera 3:1 sobre a superfície em ambos os modos (A8). Não há skill `dataviz` neste repositório; a verificação seguiu a ficha, A8 e o limiar não textual de 3:1.

## 3. Capturas abertas e conferidas

Geradas a partir de `src/` por harness temporário fora do repositório, com Chromium de `node_modules/.cache/ms-playwright`, `PLAYWRIGHT_BROWSERS_PATH` absoluto e `chromium.launch()` sem `executablePath`. As fontes vieram de `dist/fonts` em modo somente leitura. A cópia temporária da fixture não fixa o tipo do gráfico, deixando `chartType: "line"` do tema decidir. As dez imagens foram abertas e comparadas à nota de conceito.

| Captura | Conferência contra o conceito |
|---|---|
| `node_modules/.cache/capturas-dos-temas/aurora-veil/aurora-veil__light__sidebar__desktop__telas.png` | A malha lavanda e azul-clara envolve cartões e campos translúcidos; o gráfico de linha e as camadas de vidro ficam visíveis ao longo da página. |
| `node_modules/.cache/capturas-dos-temas/aurora-veil/aurora-veil__light__topbar__desktop__telas.png` | A barra superior mantém os controles alinhados; a atmosfera suave e o vidro continuam claros sem estreitar o conteúdo. |
| `node_modules/.cache/capturas-dos-temas/aurora-veil/aurora-veil__light__sidebar__desktop__modal.png` | O modal fosco se destaca pelo contorno lavanda; título, texto e ação violeta continuam legíveis sobre o véu. |
| `node_modules/.cache/capturas-dos-temas/aurora-veil/aurora-veil__light__sidebar__mobile__telas.png` | Cartões e tabela fluem em uma coluna; calendário, gráfico e chat cabem na largura móvel. |
| `node_modules/.cache/capturas-dos-temas/aurora-veil/aurora-veil__light__sidebar__mobile__modal.png` | O diálogo arredondado cabe com margens e conserva texto legível sobre a camada translúcida. |
| `node_modules/.cache/capturas-dos-temas/aurora-veil/aurora-veil__dark__sidebar__desktop__telas.png` | A malha muda para índigo e marinho; cartões de vidro, campos e linha violeta continuam separados do fundo profundo. |
| `node_modules/.cache/capturas-dos-temas/aurora-veil/aurora-veil__dark__topbar__desktop__telas.png` | A topbar preserva a largura do conteúdo; o gráfico e a superfície dos cartões permanecem distinguíveis no fundo escuro. |
| `node_modules/.cache/capturas-dos-temas/aurora-veil/aurora-veil__dark__sidebar__desktop__modal.png` | O modal escuro usa borda lavanda fina e ação violeta; texto e corpo do diálogo têm contraste claro. |
| `node_modules/.cache/capturas-dos-temas/aurora-veil/aurora-veil__dark__sidebar__mobile__telas.png` | A tabela empilhada, o gráfico e o chat cabem em uma coluna; as superfícies escuras de vidro não se confundem com o fundo. |
| `node_modules/.cache/capturas-dos-temas/aurora-veil/aurora-veil__dark__sidebar__mobile__modal.png` | O modal ocupa a largura móvel com margem, mantém o botão visível e preserva a leitura no tema escuro. |

## 4. O que o tema ensinou

| Item | Tipo | Conclusão | Destino proposto |
|---|---|---|---|
| Paleta de marca | Ajuste de contraste | As cores de marca foram aprofundadas para texto e gráficos: primária `#6d4fa8`, secundária `#327d75` e destaque `#b85381`; as cores derivadas continuam acima de 3:1 e R31 fecha AA. | R31 e A8 |
| Texto suave e estados | Correção | `textColorMuted` claro ficou `#5f536f`; `statusSuccessColor` e `statusErrorColor` claros ficaram `#0b7c56` e `#c81e1e`. | R31 |
| Malha e vidro | Ajuste de ficha | `bgGradientMode` usa `mesh`; `cardTextureType` usa `frosted` com opacidade 0,10. As intensidades usam o passo de 0,05. | Esta ficha |
| Peso | Medida | 3.466 B gzip, abaixo do limite de 4,5 KB. | Método da §4.1 do anexo de direção |

## 5. Achados do arsenal ou do fluxo

1. A ficha pede navegação `topbar` e celular `auto`; foram omitidos por serem escolhas funcionais. `navigationStyle`, `mobileNavigationStyle`, `touchTargetMin` e `sidebarPosition` não aparecem no tema. O harness mostra as variantes de sidebar/topbar e as telas móveis nas capturas, sem transformar essas opções em tokens do preset.
2. `texture` não carrega modo: `aurora` é a textura única, declarada no modo principal e omitida na contraparte. A malha `mesh` e `cardTextureType: "frosted"` também ficam no modo principal; `cardTextureOpacity: 0.10` carrega modo e aparece na contraparte.
3. A paleta de marca da ficha (`#8a6cc2`, `#4fb3a6`, `#e58fb6`) foi aprofundada para manter legibilidade e validar a paleta derivada: primária `#6d4fa8`, secundária `#327d75`, destaque `#b85381`. O menor contraste da paleta final é 3,109:1 no claro e 3,110:1 no escuro.
4. O medidor `themes:diversity` passou e classificou o tema como claro, roxo (H260/S36), raio 28, borda 1, blur 16 e densidade confortável. Como a navegação é funcional e omitida, o medidor reporta o padrão `sidebar`; as capturas também exercitam `topbar`.
5. `theme-completeness:check`, `variable-contract:check`, `panel-contract:check`, R31, `themes:diversity` e os testes categóricos, de disputa de canal e paridade contratual passaram. O grep encontrou apenas referências de carregamento/registro do identificador nos testes, sem valores visuais fixos deste preset. Os snapshots permitidos foram atualizados: 2 arquivos e 9 testes aprovados.

### Resumo do executor

Tema completo nos dois modos, com 301 chaves estéticas no principal (inclui `mode`), 104 chaves estéticas dependentes de modo mais `mode` na contraparte e nenhuma chave funcional. R31 passou em 4,731:1 no claro e 4,848:1 no escuro; a paleta categórica ficou em 3,109:1 e 3,110:1; o peso ficou em 3.466 B gzip. As dez capturas mostram a malha lavanda, os cartões de vidro fosco, o gráfico de linha e a adaptação móvel.

## 6. Suíte delimitada final

npx vitest run src/core/Design src/core/Provider src/features/DesignEngine: 170 arquivos passaram e 1 falhou; 1.145/1.146 testes passaram. A única falha foi themeCatalogParity.test.ts, que encontrou a entrada gerada de aurora-veil desatualizada em relação à descrição e aos swatches do preset. A plan exclui themes:catalog; o catálogo não foi regenerado nem alterado.
