---
tipo: "anexo"
titulo: "plan-110 — Critério estético × funcional e o que \"carrega modo\" (decisões por token)"
dominio: "Design Engine / Contrato de tokens"
status: "🟡 Em construção (um bloco por lote de análise)"
relacionados: ["[[plan-110-temas-que-mostram-a-biblioteca]]", "[[04-contrato-de-tokens-e-paridade]]", "[[09-temas-e-presets]]"]
---

# 0. Para que serve

A `plan-110` grava no próprio schema, token a token, `kind` (estético | funcional), `modeDependent` e `usage`. O
**mapa** é o schema; este anexo guarda só o **critério** e o **porquê das decisões que não são óbvias**. A lista de
tokens e o `usage` de cada um não são copiados aqui (R17): a fonte é `src/core/Design/schema/` e o apêndice A.4b do
`GUIA-FRONTEND.md` do kit.

# 1. O critério

| Pergunta | Se a resposta é sim |
|---|---|
| O valor precisa ser **igual em todo tema** por **segurança**, **acessibilidade** ou **consistência de comportamento**? (camadas, alvo de toque, larguras mínimas e máximas de superfícies de uso, posições e larguras do cromo, breakpoints, comportamento) | **funcional**: o tema embarcado não o declara; vale o padrão do sistema |
| Ele existe só para o **painel de customização** (pré-visualização, moldura de dispositivo, tela de exemplo)? | **funcional**: nunca é parte de um tema |
| Ele escolhe **qual componente** a lib desenha, e não como ele se parece? | **funcional** |
| Senão: cor, elevação, textura, tipografia, geometria visual, densidade visual, movimento | **estético**: todo tema embarcado o projeta |

## 1.1 `modeDependent`: o que carrega modo

Um token **carrega modo** quando o valor *certo* muda ao inverter a luminosidade do fundo, e por isso entra na
`contraparte`. Os que não carregam são herdados do modo principal **de propósito**: é o que preserva a identidade do
tema entre claro e escuro.

| Carrega modo (`true`) | Não carrega (`false`) |
|---|---|
| toda **cor** de texto, fundo, borda, realce e halo | geometria (raio, espessura, deslocamento, desfoque, expansão da sombra) |
| **opacidade** de superfície, de borda e de textura (o mesmo número lê diferente sobre fundo claro e escuro) | tipografia (tamanho, peso, espaçamento de letras) |
| **opacidade e cor** da sombra e do brilho; sombra escrita à mão (`cardShadow`) | movimento e comportamento |
| véu e vinheta | tipo de textura, estilo, posição, direção, alinhamento |

# 2. Decisões não óbvias (lote 1: cartões, sobreposições, tabelas)

| Token(s) | Decisão | Motivo |
|---|---|---|
| `cardVariant` | funcional | escolhe o cartão que a `SarakCardGrid` desenha (e, com ele, quais famílias de token valem); não é estilo. O tema o declara `classic` e deve continuar |
| `modalWidth*`, `toastMinWidth`/`toastMaxWidth`, `contextMenuMinWidth` | funcional | são tamanhos nomeados e pisos de usabilidade (alvo de clique, linha de texto legível); o importador dimensiona o conteúdo contando com eles |
| `modalActionAlignment`, `modalHeaderStyle` | **estético** | mudam a *disposição* do diálogo, não o comportamento: o botão de fechar e as ações continuam alcançáveis e rotulados em qualquer valor |
| `catalogFilterMinWidth`, `matrixNodeMinWidth`, `managementGroupListMaxHeight` | funcional | pisos e tetos de uso (filtro utilizável em contêiner estreito, nó legível, rolagem da lista), não identidade |
| `catalogSectionRadius`, `catalogItemRadius` | estético | arredondamento é geometria visual, mesmo sendo de um componente só |
| `tableDensity`, `tableCellPadding`, `kanban*` | estético | densidade visual é eixo do tema (`axis: density`) |
| `preset*`, `device*`, `controlHeightToggle`, `progressBarMaxWidth` | funcional | só o painel de customização os lê; nenhum componente do sistema muda. O gate de leitor (`PANEL_OWN_TOKENS`) já os trata como "do painel" |
| `cardSurfaceOpacity`, `cardBorderOpacity`, `cardTextureOpacity` | carrega modo | ver 1.1: é a regra de opacidade |
| `cardShadowSpread` | carrega modo; `cardShadowOffsetX/Y`, `cardShadowBlur`, `cardShadowExpansion` não | a *força* da sombra depende do fundo; a *forma* (dura × macia) é identidade |
| `tableZebraStriping` | não carrega | ligar ou desligar é estrutura; o tom da listra já vem da cor do tema |

# 3. Como cada token foi aberto (método do lote)

1. **Leitor no código**: busca por `--sarak-<kebab>`, pelas `cssVars` e pelo id em `src/` (sem testes, schema, presets,
   catálogo e gerados), e leitura do arquivo que consome.
2. **Efeito no navegador**: cena única, montada de `src/` (não do `dist/`), com um exemplar de cada componente dos
   seis grupos. Para cada token, a cena é aberta com o valor-padrão e com cada valor extremo (ou opção), e o estilo
   computado de **todos** os elementos (e dos pseudoelementos com `content`) é comparado, em repouso, sob o
   ponteiro, com foco e com o botão pressionado. O que mudou, e em qual componente, é o que o `usage` diz.
3. **Dependência**: um token que só muda algo com outro (opacidade da textura × tipo de textura) é medido com o
   outro ligado, e o par entra em `interactsWith`.

# 4. Tokens sem efeito visível (vão para o resumo como achado, não são documentados)

Medidos nos dois métodos acima (leitor e navegador). Ficam na lista de exceção do gate com o rótulo `achado-lote-1`.

| Token | O que se mediu |
|---|---|
| `cardSpotlightOpacity` | os quatro cartões escrevem `data-spotlight` e uma camada `.spotlight-effect`, mas nenhuma regra CSS lê o atributo, a classe nem `--spotlight-opacity`: o valor muda um atributo, nenhum pixel |
| `borderBeamEnabled`, `cardSearchBorderBeamActive` | a camada `.border-beam-effect` existe e `@keyframes beam-rotate` também, mas nenhuma regra desenha a classe nem lê `--beam-angle`: ligar ou desligar acrescenta ou remove um `<div>` vazio |
| `cardActionClickScale` | `SarakActionCard` calcula `clickScale` e não o usa; o botão de ação não tem `whileTap` com o valor |
| `cardContentAlignment` | só o `getCardStyles` de `useStructuralStyles` o lê, e nenhum componente chama `getCardStyles` |
| `imageCardHoverZoom` | o `whileHover` está na camada da imagem, mas o véu e o conteúdo, irmãos mais acima, recebem o ponteiro: a camada nunca é "hovered", e a escala medida ao passar o ponteiro em três pontos do cartão é `none` |
| `tableActionPosition` | `useTableLayoutStyles` calcula `actionColumnAlignmentClass` e nenhum componente o consome; a `SarakTable` não tem coluna de ação |

Parcial, e documentado como tal: `cardImagePosition` só muda algo com `cardLayoutDirection` em linha e o valor da
direita (inverte a ordem dos blocos); `left`, `top` e `none` não mudam nada, e o ramo de `getCardStyles` é morto.

## 4.1 Desfecho (plan-117, lote 1 — 2026-10-15)

Três dos sete deixaram de ser achado: passaram a desenhar, foram medidos em navegador (valor padrão × extremo, em
repouso, sob o ponteiro e pressionado) e saíram da exceção `achado-lote-1`.

| Token | O que desenha agora | Medido |
|---|---|---|
| `cardSpotlightOpacity` | gradiente radial da primária do tema, com a opacidade do token, centrado onde o ponteiro está nos quatro cartões; 0 não desenha nem registra listener | `cartao-que-se-move.spec.ts` |
| `cardActionClickScale` | o botão de ação encolhe até a escala do token enquanto pressionado (propriedade `scale`; o aperto de elemento e o do átomo deixam de somar) | idem |
| `imageCardHoverZoom` | o hover vive na raiz do `SarakImageCard` e desce à camada da imagem por variante: o zoom vale com o ponteiro sobre o cartão inteiro | idem |

Mais dois deixaram de ser achado no lote 2 da plan-117: passaram a desenhar, foram medidos em navegador (ligado ×
desligado, em repouso e com o campo em foco) e saíram da exceção `achado-lote-1`.

| Token | O que desenha agora | Medido |
|---|---|---|
| `borderBeamEnabled` | anel de gradiente cônico na primária que gira (`--beam-angle`), mascarado para a borda, com o raio do cartão; desligado, a camada é `display: none` e nenhuma animação roda | `cartao-que-se-move.spec.ts` |
| `cardSearchBorderBeamActive` | o mesmo anel no `SarakSearchCard`, só com o campo em foco | idem |

Ficam abertos, para o lote 3 da plan-117: `cardContentAlignment` e `tableActionPosition`.

Os dois últimos saíram do schema no lote 3 da plan-117 (2026-10-16): fora das partições do catálogo, do mapeamento de
tema e dos tipos gerados (400 tokens), com entrada em `REMOVED_TOKEN_KEYS` — o tema salvo com a chave carrega, com
aviso, e a chave é descartada. O código morto que os lia também saiu (`getCardStyles` em `useStructuralStyles`,
`actionColumnAlignmentClass` em `useTableLayoutStyles`), e com ele o ramo morto de `cardImagePosition`, que fica só
com o leitor `useCardLayoutStyles`.

| Token | Desfecho |
|---|---|
| `cardContentAlignment` | retirado — redundante com `cardTextAlign`, que já distribui o conteúdo |
| `tableActionPosition` | retirado — a `SarakTable` não tem coluna de ações |

A exceção `achado-lote-1` do gate de documentação ficou vazia: dos sete, cinco desenham e dois saíram.

Na correção do lote 3 (2026-10-16) saiu também `cardImagePosition`, o "parcial" desta seção: sem o `getCardStyles`
morto, a opção `top` (o padrão) ficou sem leitor e o `token-reader` acusou. Só `right` com `cardLayoutDirection` em
linha mudava algo (invertia a ordem dos blocos). Saiu do schema, das partições, do mapeamento e dos tipos (399 tokens),
com entrada em `REMOVED_TOKEN_KEYS`; o `useCardLayoutStyles` passou a desenhar a direção em linha sempre como
`flex-row`. Quem invertia a ordem usa o `className` do cartão (`flex-row-reverse`).

| Token | Desfecho |
|---|---|
| `cardImagePosition` | retirado — só um valor, numa combinação, mudava a tela; a ordem dos blocos é do `className` |

# 5. Decisões não óbvias (lote 2: tipografia, controles, cor, dados, chat e status)

| Token(s) | Decisão | Motivo |
|---|---|---|
| `buttonIconPosition`, `buttonWidthStrategy`, `inputIconPosition`, `inputPadding` | funcional | posição e largura dos controles não devem mudar ao trocar o tema; o respiro vertical também preserva a área de toque do campo. |
| `multiSelectInputMinWidth`, `chatAttachmentNameMaxWidth`, `chatTokenSliderMinWidth` | funcional | são limites de uso que evitam que tags, nomes de arquivo ou o controle de tokens quebrem o layout. |
| `chartType`, `chartThickness`, `chartSmoothing` | estético | descrevem a apresentação padrão; `SarakChartEngine` aceita `type` para o consumidor preservar a forma adequada aos dados. Espessura e suavização só valem para tipos compatíveis. |
| `textGlowIntensity` | carrega modo | acompanha o halo do título, cuja força precisa ser calibrada para a luminosidade de cada contraparte. |
| Tokens de halo, vidro, textura e grade | `interactsWith` | o halo neon e o desfoque dependem do estilo de botão, o vidro e o pulso dependem do estilo de alternador, as cores de textura dependem de uma textura ativa, e a opacidade da grade só aparece com a grade ligada. |
