# Lote 16 — Data Terminal

## 1. Nota de conceito

Caderno de laboratório em verde técnico: superfície clara de papel, micro pontos de página, grade discreta nos cartões, títulos Space Grotesk, texto Inter e dados JetBrains Mono. A contraparte escura conserva a densidade e a grade, com fundo de terminal verde profundo e texto claro.

## 2. Medições

| Medida | Resultado |
|---|---:|
| Tokens estéticos no modo principal | 301, incluindo `mode` |
| Tokens estéticos `modeDependent` na contraparte | 104, mais `mode` |
| Tokens funcionais declarados | 0; configurações funcionais legadas foram removidas |
| R31 — menor contraste textual, claro | `textColorMuted` / `colorBgLayer2`: **4,874:1** |
| R31 — menor contraste textual, escuro | `btnPrimaryText` / `btnPrimaryBg` composto sobre o corpo: **4,829:1** |
| Paleta categórica, menor contraste não textual | claro **3,073:1** · escuro **3,285:1** |
| Peso isolado, minificado | 10.220 B |
| Peso isolado, gzip -9 | **3.387 B**, abaixo do teto de 4,5 KB |

O R31 passou nos dois modos, sem pares reprovados ou pulados. A paleta usa as quatro cores de marca (`chartColorPalette`, secundária, destaque e terciária) e a derivação categórica de oito séries passou nos critérios do `categoricalPalette.test.ts`; o menor contraste contra o fundo da página excede 3:1 nos dois modos. O código atual separa tokens de marca e de estado em `src/components/engines/charts/SubEngines/builders/types.ts`; cores de estado não entram na paleta automática (checagem do achado A8).

## 3. Capturas abertas e conferidas

Geradas a partir de `src/` com Vite temporário fora do repositório e Chromium de `node_modules/.cache/ms-playwright`, por `PLAYWRIGHT_BROWSERS_PATH` absoluto e `chromium.launch()` sem `executablePath`. As fontes foram servidas em modo somente leitura a partir de `dist/fonts`. Cada imagem foi aberta e comparada à nota de conceito.

| Captura | Conferência contra o conceito |
|---|---|
| `node_modules/.cache/capturas-dos-temas/data-terminal/data-terminal__light__sidebar__desktop__telas.png` | Papel verde muito claro e tinta verde escura; cartões mostram a grade técnica e a tabela compacta fica legível ao lado dos controles. |
| `node_modules/.cache/capturas-dos-temas/data-terminal/data-terminal__light__topbar__desktop__telas.png` | A navegação de topo mantém a largura do conteúdo; gráfico de área, tabela e micro pontos preservam a linguagem de caderno técnico. |
| `node_modules/.cache/capturas-dos-temas/data-terminal/data-terminal__light__sidebar__desktop__modal.png` | Véu claro difuso separa o diálogo sem esconder a estrutura verde da página; botão principal continua destacado. |
| `node_modules/.cache/capturas-dos-temas/data-terminal/data-terminal__light__sidebar__mobile__telas.png` | A tabela se reorganiza em cartões no celular; campos, gráfico, calendário, estados e chat permanecem contidos na largura móvel. |
| `node_modules/.cache/capturas-dos-temas/data-terminal/data-terminal__light__sidebar__mobile__modal.png` | O diálogo ocupa a largura móvel com texto e ação visíveis; o fundo desfocado mantém o contraste entre camada e conteúdo. |
| `node_modules/.cache/capturas-dos-temas/data-terminal/data-terminal__dark__sidebar__desktop__telas.png` | Fundo verde quase preto, superfícies profundas e acentos verdes transformam o caderno em terminal sem alterar a densidade. |
| `node_modules/.cache/capturas-dos-temas/data-terminal/data-terminal__dark__topbar__desktop__telas.png` | A topbar continua compacta sobre o fundo escuro; os dados e o gráfico mantêm separação tonal. |
| `node_modules/.cache/capturas-dos-temas/data-terminal/data-terminal__dark__sidebar__desktop__modal.png` | O modal escuro usa borda fina e botão verde luminoso, mantendo o conteúdo da página reconhecível sob o véu. |
| `node_modules/.cache/capturas-dos-temas/data-terminal/data-terminal__dark__sidebar__mobile__telas.png` | Tabela, formulário e calendário refluem para uma coluna; o fundo escuro preserva o foco no verde dos dados. |
| `node_modules/.cache/capturas-dos-temas/data-terminal/data-terminal__dark__sidebar__mobile__modal.png` | Modal e ação cabem no celular, com contorno verde visível sobre o fundo escuro. |

## 4. O que o tema ensinou

| Item | Tipo | Conclusão | Destino proposto |
|---|---|---|---|
| Contraste da primária verde | Ajuste | A ficha usa `#00995c`; a primária clara foi escurecida para `#007a49` (5,173:1 contra o corpo) e a contraparte usa `#58d395`, mantendo o verde como marca e leitura. | Esta medição |
| Raio de navegação | Decisão | `navItemRadius: 6` foi declarado explicitamente para combinar com cartões e campos técnicos. | `ui-criar-tema` §5.7 |
| Textura de página | Decisão | `micro-dots` fica declarada uma vez e permanece estática na contraparte; a grade dos cartões usa `grid`. | Esta ficha |
| Paleta do gráfico | Medida | A paleta derivada usa cores de marca, reserva cores de estado e excede 3:1 contra o fundo nos dois modos. | A8 e regra de 3:1 não textual |
| Peso | Medida | 3.387 B gzip, abaixo do teto de 4,5 KB. | Método da §4.1 do anexo de direção |

## 5. Achados do arsenal ou do fluxo

1. A ficha pede configuração funcional de navegação lateral/gaveta. Ela foi omitida por regra; o tema não declara `navigationStyle`, `mobileNavigationStyle`, `touchTargetMin` nem `sidebarPosition`. A orientação de topo nas capturas é apenas uma configuração do fixture.
2. O catálogo `dataviz` não existe neste repositório. A validação foi feita com as regras de paleta do anexo e `categoricalPalette.test.ts`; o R31 também passou.
3. A chamada padrão de `themes:diversity` passou. O modo opcional `--new` mede uma coorte e não é um veredito individual; o medidor classificou este tema como claro, verde (H156/S100), compacto, raio 6, borda 1 e blur 0.

### Resumo do executor

Tema completo nos dois modos, com 301 chaves estéticas principais (inclui `mode`), 104 chaves estéticas dependentes de modo mais `mode` na contraparte e nenhuma chave funcional. R31 passou: 4,874:1 no claro e 4,829:1 no escuro. A paleta categórica ficou em 3,073:1 e 3,285:1; o peso ficou em 3.387 B gzip. As dez capturas foram abertas e conferidas; a grade e a densidade do caderno aparecem no claro, e o terminal escuro conserva a mesma estrutura.

## 6. Suíte delimitada final

npx vitest run src/core/Design src/core/Provider src/features/DesignEngine: 170 arquivos passaram e 1 falhou; 1.145/1.146 testes passaram. A única falha foi themeCatalogParity.test.ts, que encontrou a entrada gerada de data-terminal desatualizada em relação à descrição e aos swatches do preset. A plan exclui themes:catalog; o catálogo não foi regenerado nem alterado.
