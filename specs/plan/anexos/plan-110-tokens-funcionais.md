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

Ficam abertos, para os lotes 2 e 3 da plan-117: `borderBeamEnabled`, `cardSearchBorderBeamActive`,
`cardContentAlignment` e `tableActionPosition`.
