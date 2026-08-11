# Liberdade e restrição — onde você pode ser radical, e onde não

> Este mapa responde uma pergunta que o catálogo não responde: **"onde eu posso ser radical sem quebrar
> nada?"** A resposta é: **em quase tudo**, menos na relação de luminância dos pares de contraste listados
> abaixo. Ele **não descreve** os 422 tokens — isso é o catálogo, e é **gerado**
> (`docs/component-catalog.json`, `catalog/partitions/*.json`). Copiar aqui envelheceria no primeiro token
> novo (R17). Este arquivo é ponteiro, não fonte.

## 1. A única restrição real: os pares de contraste

Um **par** é um tokenId de cor de **texto** contra o tokenId (ou cadeia) de cor de **fundo** que ele
realmente compõe. A régua é `gates/scripts/audit/verify_contrast.ts` (`PAIRS`) — **36 pares**, todos a
**4,5:1**. Não transcrevemos os valores aqui: leia a constante `PAIRS` no próprio arquivo, é a fonte viva.
O que importa saber, sem abrir o código:

| Token de texto | Compõe contra (resumo) |
|---|---|
| `textColorMaster` / `textColorSecondary` / `textColorMuted` / `titleColor` | as superfícies estruturais do tema — body, layers, card, modal, sidebar, topbar |
| `cardTitleColor` · `cardActionBtnText` · `cardSearchTextFocusColor` | as superfícies do próprio card (fundo do card, fundo do botão de ação, fundo do campo de busca focado) |
| `btnPrimaryText` · `inputTextColor` · `topbarTitleColor` · `tooltipTextColor` | o fundo do próprio componente (botão primário, input, topbar, tooltip) |
| `navItemActiveColor` | o fundo do item ativo — sidebar ou topbar, conforme `navigationStyle` |

**Se você preencher um destes tokens, ele vira um par a verificar.** Rode o solucionador
(`.agents/skills/ui-criar-tema/scripts/solve_theme_contrast.ts`) antes de dar o tema por pronto — ele mede
com o mesmo gate, corrige **só a luminosidade** do texto que reprovar e devolve um relatório. Nunca escolhe
matiz nem saturação por você.

> ⚠️ **O que o solucionador NÃO resolve sozinho.** Se o mesmo tokenId de texto compõe contra fundos de
> luminância **opostas** dentro do mesmo tema (ex.: um card quase-branco sobre um body quase-preto), não há
> um único valor de luminância que sirva aos dois — o relatório declara isso como "não resolvido" em vez de
> chutar. A saída é sua, como autor: aproximar a luminância das duas superfícies, ou aceitar que aquele par
> específico fica fora de AA (e declarar por quê).

## 2. Onde NÃO há restrição nenhuma — o resto dos 422

Fora da lista acima, **nada neste mapa impõe valor, faixa ou direção**. Os eixos abaixo são identidade pura,
e o catálogo já documenta cada token deles em detalhe (`description`, `allowedValues`, `type`):

- **Matiz e saturação** — de qualquer cor, inclusive das de texto (o solucionador só desloca luminosidade).
- **Efeito e atmosfera** — glass, ruído, textura, glow, vinheta, blur.
- **Raio, geometria e sombra** — border-radius por canto, cortes geométricos, elevação.
- **Tipografia** — família, peso, tracking, escala.
- **Animação e movimento** — curva, velocidade, easing.
- **Cromo** — sidebar × topbar, largura, densidade, posição.

Um rosa neon que falha 4,5:1 **não precisa deixar de ser rosa neon** — precisa de mais luz. É essa a frase
que resume a fronteira inteira deste mapa.

## 3. Os temas atuais como demonstração de amplitude — não como gabarito

Não copie um tema existente linha a linha. Eles servem para mostrar **quão longe** a liberdade da §2 vai,
não como ponto de partida:

- Um **brutalista** (`neo-brutalism`) — contraste geométrico, cor quase binária, zero suavização.
- Um **glass** (`holographic-glass` / `crystal-glass`) — translucidez, blur, luz difusa.
- Um **minimalista** (`minimalist-airy`, a referência clonável — `SARAK_REFERENCE_THEMES`) — claro, neutro,
  respiro generoso.
- Um **neon/cyberpunk** (`cyberpunk-neon` / `synthwave-retro`) — saturação alta, glow, contraste elétrico.

Abra qualquer um em `src/core/Design/presets/themes/` e veja a amplitude real — não o replique.

## 4. Como ler o catálogo (sem transcrevê-lo)

O catálogo gerado (`catalog/partitions/*.json`, uma por domínio) documenta cada token com:

| Campo | Para quê |
|---|---|
| `description` | o papel do token — vários já dizem contra qual fundo o contraste importa (é de lá que a lista da §1 veio) |
| `type` / `allowedValues` | o contrato de valor — `color`, `select` com enum, `number` com faixa |
| `relatedTokens` | outros tokens do mesmo agrupamento visual |
| `categories` | a família semântica (`cores`, `tipografia`, `cards`, `layout`…) |

Para a lista **viva** de tokens de texto e de fundo por trás da tabela da §1, leia `PAIRS` em
`gates/scripts/audit/verify_contrast.ts` — é a mesma fonte que o gate usa, então nunca diverge do que é
cobrado de verdade.

## 5. Checklist rápido antes de registrar um tema

1. Preencheu os 422 via `generate_theme_template.ts`? (temas **novos** nascem completos — R33)
2. Rodou `findMissingThemeAxes` e sabe quais eixos ficaram vazios, se algum?
3. Rodou o solucionador e colou o relatório? Todo par "não resolvido" tem uma decisão sua registrada?
4. Matiz e saturação dos tokens de texto são **exatamente** os que você escolheu — confira contra o
   relatório do solucionador, que mostra antes/depois?
5. `npm run audit` (o auditor de contraste, R31) fecha verde para este tema?
