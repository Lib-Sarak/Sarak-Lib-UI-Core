# Lote 15 — Minimalist Airy

## 1. Nota de conceito

Referência clara do conjunto: papel branco, tinta escura, azul preciso e espaço generoso. Inter organiza títulos e leitura; a textura de página e a de cartão ficam explicitamente em `none`. Cartões brancos com raio de 32 px e sombra difusa dão profundidade sem desenho decorativo. A contraparte escura preserva a mesma contenção.

## 2. Medições

| Medida | Resultado |
|---|---:|
| Tokens estéticos no modo principal | 301, incluindo `mode` |
| Tokens estéticos `modeDependent` na contraparte | 104, mais `mode` |
| Tokens funcionais declarados | 0; 18 valores funcionais legados removidos |
| R31 — menor contraste textual, claro | `statusSuccessColor` / corpo: **4,984:1** |
| R31 — menor contraste textual, escuro | `statusErrorColor` / cartão: **4,892:1** |
| Contraste não textual mínimo da paleta categórica no fundo da página | claro **3,094:1** · escuro **3,105:1** |
| Borda dos cartões | largura 0; não é desenhada |
| Peso isolado, minificado | 11.272 B |
| Peso isolado, gzip -9 | **3.534 B**, abaixo do teto de 4,5 KB |

`categoricalPalette.test.ts` passou na execução dos arquivos de tema. A paleta usa a primária, azul de link e demais cores de marca; não usa cores de status. O menor contraste de série contra o fundo de página fica acima de 3:1 nos dois modos.

## 3. Capturas abertas e conferidas

Geradas a partir de `src/`, com Chromium de `node_modules/.cache/ms-playwright` via `PLAYWRIGHT_BROWSERS_PATH` absoluto e fontes reais lidas de `dist/fonts` em modo somente leitura. Cada imagem foi aberta e comparada à nota de conceito.

| Captura | Conferência contra o conceito |
|---|---|
| `node_modules/.cache/capturas-dos-temas/minimalist-airy/minimalist-airy__light__sidebar__desktop__telas.png` | Papel branco, tinta escura, azul pontual e espaço entre seções dão a leitura neutra; cartões usam sombra macia e sem contorno visível. |
| `node_modules/.cache/capturas-dos-temas/minimalist-airy/minimalist-airy__light__sidebar__desktop__modal.png` | O diálogo branco se separa pelo véu e pela sombra suave, sem textura ou ornamento. |
| `node_modules/.cache/capturas-dos-temas/minimalist-airy/minimalist-airy__light__topbar__desktop__telas.png` | A topbar compacta ocupa a faixa superior; a composição continua ampla, branca e guiada por tipografia e respiro. |
| `node_modules/.cache/capturas-dos-temas/minimalist-airy/minimalist-airy__light__sidebar__mobile__telas.png` | A coluna móvel mantém espaço entre cartões, campos e calendário; o azul aparece em links, gráfico e indicadores. |
| `node_modules/.cache/capturas-dos-temas/minimalist-airy/minimalist-airy__light__sidebar__mobile__modal.png` | Modal e controles cabem na largura do celular; o branco, o texto escuro e a sombra mantêm a hierarquia. |
| `node_modules/.cache/capturas-dos-temas/minimalist-airy/minimalist-airy__dark__sidebar__desktop__telas.png` | A contraparte troca papel por carvão e cartões em cinza-ardósia, preservando superfície limpa, cantos amplos e azul de interação. |
| `node_modules/.cache/capturas-dos-temas/minimalist-airy/minimalist-airy__dark__sidebar__desktop__modal.png` | O modal escuro organiza título, corpo e ação em camadas simples, sem textura. |
| `node_modules/.cache/capturas-dos-temas/minimalist-airy/minimalist-airy__dark__topbar__desktop__telas.png` | A topbar acompanha o corpo carvão; contraste tipográfico e azul pontual continuam conduzindo a leitura. |
| `node_modules/.cache/capturas-dos-temas/minimalist-airy/minimalist-airy__dark__sidebar__mobile__telas.png` | Em celular, a coluna e a tabela refluída ficam contidas; cartões arredondados e espaços repetidos preservam o ritmo. |
| `node_modules/.cache/capturas-dos-temas/minimalist-airy/minimalist-airy__dark__sidebar__mobile__modal.png` | O diálogo fica dentro da largura móvel, com camadas carvão e ação clara bem separadas. |

## 4. O que o tema ensinou

| Item | Tipo | Conclusão | Destino proposto |
|---|---|---|---|
| Textura ausente na ficha anterior | Decisão | `texture: none` e `cardTextureType: none` foram declarados explicitamente; a ausência de textura é uma escolha visual e evita depender de default. | `ui-criar-tema` §5.7, consolidação do lote 25 |
| Contraparte escura | Decisão | Corpo `#0d1016`, cartões `#10141e`, texto claro e botões invertidos mantêm a neutralidade; o mínimo R31 escuro é 4,892:1. | `ui-criar-tema` §5.7 e uso de cores por modo |
| Azul do tooltip | Armadilha | `tooltipTextColor` claro foi fixado em `#ffffff`, substituindo o azul apagado que a ficha anterior apontava como ilegível. | `usage` do token de tooltip, consolidação do lote 25 |
| Paleta de gráfico | Medida | Contraste mínimo sobre o fundo: 3,094:1 no claro e 3,105:1 no escuro; estados não entram como série. | A8 no anexo de direção de arte |
| Peso | Medida | 3.534 B gzip, abaixo do teto de 4,5 KB. | Esta medição |

## 5. Achados do arsenal ou do fluxo

1. A ficha pede topbar e navegação móvel automática (§7.10, `specs/plan/anexos/plan-110-direcao-de-arte.md:436`). Esses campos são funcionais e não foram declarados. A topbar foi conferida nas capturas de desktop; o modo móvel mostra o cromo responsivo existente.
2. `texture: none` está declarado no modo principal e permanece estático na contraparte (`src/core/Design/presets/themes/minimalist-airy.ts:345`); `cardTextureType: none` também está explícito.
3. A ficha desta referência pede `cardHoverStyle: lift`, opção válida. `navItemRadius` está declarado no tema, conforme o exemplo completo exigido.
4. A paridade do catálogo gerado fica para a atualização única do revisor: `themeCatalogParity.test.ts:44` acusa metadados antigos em `src/core/Design/presets/themes/catalog.generated.ts:18`. Não rodei `themes:catalog`, conforme o modelo dos lotes 8–24.

### Resumo do executor

Tema completo nos dois modos, fora da exceção, sem tokens funcionais e com 3.534 B gzip. R31 passou nos dois modos; paleta de gráfico acima de 3:1; diversidade classifica o modo claro em azul de baixa saturação, raio 32 e densidade espaçosa. As dez capturas foram abertas e conferidas. A nota clara e sem textura está representada, e a contraparte escura mantém a mesma sobriedade.

### Correção do veredito de 2026-10-18

O veredito reprovou dois valores fora da grade. Mantida a intenção visual, ajustei `cardGlowIntensity` 0,18 → 0,20 e `vignetteOpacity` 0,12 → 0,10, valores válidos nos passos dos tokens. Reexecutei R31 após os ajustes de opacidade: os 76 pares cobertos passam nos dois modos, sem reprovação nem par pulado.
