# Lote 12 — Kinetic Flow

## 1. Nota de conceito

Tema de esporte e performance em grafite, coral, âmbar e menta. Montserrat 900 e Lexend organizam uma interface compacta; o gráfico de linha suavizado e o foco de luz dos cartões reforçam o movimento elástico. O modo claro mantém a identidade em papel blush, coral e linhas de fundo finas.

## 2. Medições

| Medida | Resultado |
|---|---:|
| Tokens estéticos no modo principal | 301, incluindo `mode` |
| Tokens estéticos `modeDependent` na contraparte | 104, mais `mode` |
| Tokens funcionais declarados | 0; 19 valores funcionais legados removidos |
| R31 — menor contraste textual, escuro | `statusErrorColor` / cartão: **4,534:1** |
| R31 — menor contraste textual, claro | `textColorMuted` / fundo de botão secundário: **4,627:1** |
| Contraste não textual do gráfico sobre o fundo da página | escuro **3,113:1** · claro **3,027:1** |
| Borda dos campos sobre o fundo | escuro **3,827:1** · claro **3,452:1** |
| Borda dos cartões | largura 0; não é desenhada |
| Peso isolado, minificado | 11.591 B |
| Peso isolado, gzip -9 | **3.528 B**, abaixo do teto de 4,5 KB |

`categoricalPalette.test.ts` passou (2 testes do tema; 33 outros casos filtrados). A paleta é derivada das cores de marca e satisfaz A8: cores de status não entram como série, as séries são distintas e o contraste mínimo no fundo onde o gráfico é renderizado ultrapassa 3:1. O slot mais escuro cai a 2,834:1 quando composto sobre o cartão escuro; a vitrine renderiza o gráfico sobre o fundo da página, onde a medição acima passa.

O anexo de direção pede `texture: waves` na contraparte. `texture` não carrega modo (`src/core/Design/schema/atmosphere.ts:217–219`), então `wave-pulse` permanece nos dois modos. A cor coral continua dando presença ao padrão nas duas superfícies.

## 3. Capturas abertas e conferidas

Geradas a partir de `src/`, com Chromium de `node_modules/.cache/ms-playwright` via `PLAYWRIGHT_BROWSERS_PATH` absoluto e fontes reais lidas de `dist/fonts` em modo somente leitura. Cada imagem foi aberta e comparada à nota de conceito.

| Captura | Conferência contra o conceito |
|---|---|
| `node_modules/.cache/capturas-dos-temas/kinetic-flow/kinetic-flow__dark__sidebar__desktop__telas.png` | A grade coral sobre grafite, os títulos pesados, os cartões escuros e a linha suavizada compõem a leitura de telemetria esportiva. |
| `node_modules/.cache/capturas-dos-temas/kinetic-flow/kinetic-flow__dark__sidebar__desktop__modal.png` | O véu escurece a vitrine; cabeçalho e ação coral preservam a hierarquia sem perder o fundo técnico. |
| `node_modules/.cache/capturas-dos-temas/kinetic-flow/kinetic-flow__dark__topbar__desktop__telas.png` | A barra horizontal mantém o conteúdo amplo; grade, coral e gráfico repetem a identidade sem comprimir a navegação. |
| `node_modules/.cache/capturas-dos-temas/kinetic-flow/kinetic-flow__dark__sidebar__mobile__telas.png` | O conteúdo flui em coluna; controles, cartões, calendário e chat continuam no mesmo sistema grafite/coral. |
| `node_modules/.cache/capturas-dos-temas/kinetic-flow/kinetic-flow__dark__sidebar__mobile__modal.png` | O diálogo ocupa a largura disponível, com foco no coral e camadas visíveis sobre a superfície escura. |
| `node_modules/.cache/capturas-dos-temas/kinetic-flow/kinetic-flow__light__sidebar__desktop__telas.png` | A contraparte clara usa blush e grade coral, cartões brancos e texto escuro; a curva do gráfico mantém o caráter de performance. |
| `node_modules/.cache/capturas-dos-temas/kinetic-flow/kinetic-flow__light__sidebar__desktop__modal.png` | O modal branco se destaca pelo véu e pela sombra; a ação coral ancora a paleta clara. |
| `node_modules/.cache/capturas-dos-temas/kinetic-flow/kinetic-flow__light__topbar__desktop__telas.png` | Topbar e conteúdo permanecem arejados; a mesma composição de gráfico, cartões e grade conserva a identidade. |
| `node_modules/.cache/capturas-dos-temas/kinetic-flow/kinetic-flow__light__sidebar__mobile__telas.png` | A coluna estreita preserva os campos e cartões arredondados; a navegação inferior aparece no cromo móvel. |
| `node_modules/.cache/capturas-dos-temas/kinetic-flow/kinetic-flow__light__sidebar__mobile__modal.png` | O diálogo claro e sua borda suave ficam legíveis sobre o fundo desfocado; a chamada coral segue evidente. |

## 4. O que o tema ensinou

| Item | Tipo | Conclusão | Destino proposto |
|---|---|---|---|
| Textura de página na contraparte | Armadilha | Conferir `modeDependent` antes de tentar trocar o padrão; `texture` é estático e a contraparte só recebe `mode` e os 104 tokens que carregam modo. | `ui-criar-tema` §5.7, na consolidação do lote 25 |
| Contraparte clara | Decisão | Escurecer a coral para `#b83228` no modo claro preserva o matiz e mantém o menor par textual acima de 4,5:1. | `usage` de `primaryColor`, na consolidação do lote 25 |
| Reservas repetidas `var(--x, F)` | Receita | Nas duas reservas repetidas, `F` recebeu o `defaultValue` do token `x`; o contrato conferiu 2.978 reservas. | `ui-criar-tema` §5.7, na consolidação do lote 25 |
| Contraste e peso | Medida | Mínimos textuais R31 de 4,534:1 (escuro) e 4,627:1 (claro); 3.528 B gzip. | Nota de conceito e esta medição |

## 5. Achados do arsenal ou do fluxo

1. A ficha pede `navigationStyle`, `mobileNavigationStyle` e `touchTargetMin`; são funcionais e não foram declarados. A vitrine mostra o cromo responsivo existente. Divergência registrada em `specs/plan/anexos/plan-110-direcao-de-arte.md:395`.
2. A textura da ficha não pode mudar para `waves` na contraparte porque `texture` é estático; o tema mantém `wave-pulse` nos dois modos (`src/core/Design/schema/atmosphere.ts:217–219`, `src/core/Design/presets/themes/kinetic-flow.ts:345`).
3. A paridade do catálogo estático segue pendente para a regeneração única do revisor: `themeCatalogParity.test.ts:44` acusa descrição e amostras antigas em `src/core/Design/presets/themes/catalog.generated.ts:16`. Não rodei `themes:catalog`, conforme o modelo dos lotes 8–24.
4. A ficha descreve `wave-pulse` como branco fixo; as capturas mostram a grade coral que o tema colore com `textureColor`. A textura desenha, mas a cor visível diverge da ficha. Medição visual: grade coral presente no fundo das cinco capturas de cada modo; não é defeito essencial.

### Resumo do executor

Tema completo nos dois modos, fora da exceção, sem tokens funcionais e com peso de 3.528 B gzip. R31 e a validação da paleta de gráfico passaram para este tema. As dez capturas foram abertas e conferidas; a única limitação da ficha é a textura estática na contraparte, registrada acima.
