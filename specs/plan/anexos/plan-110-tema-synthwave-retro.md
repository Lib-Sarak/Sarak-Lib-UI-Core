---
tipo: "anexo"
titulo: "plan-110 — Tema `synthwave-retro` (lote 10)"
dominio: "Design Engine / Temas embarcados / Design e UX"
relacionados: ["[[plan-110-temas-que-mostram-a-biblioteca]]", "[[plan-110-direcao-de-arte]]", "[[09-temas-e-presets]]"]
---

# 1. Nota de conceito

**Arquétipo:** noite de 1986 (música, eventos, entretenimento). Roxo profundo `#1a0b2e`, **rosa `#ff2e97` (H330) como
primária** (decisão D3: sai do laranja H16 que colidia com o âmbar do `industrial-terminal`), sol laranja `#ff9e2c` como
secundária, ciano `#2de2e6` como destaque. `Syne` 800 maiúsculo com brilho rosa nos títulos, `Sora` 14px no corpo, ícone
Phosphor `bold`. Botão **`neon`** em pílula com pulso lento (2,5 s), cartão de **seda** translúcido (`silk`, raio 18, borda
rosa), gráfico de **área** suavizado de traço 3, movimento suave (curva `Smooth Industrial`, 350 ms, transição de página
`slide-side`), interruptor `pulsing` e largura máxima de 1200px.

**Quem carrega a personalidade:** a paleta (rosa+laranja sobre roxo), a tipografia larga em maiúsculas com brilho, a pílula
neon, a seda do cartão e a **arte de fundo própria** (`globalBackgroundImageUrl`): sol listrado sobre grade em perspectiva,
SVG de 736 B embutido em `data:image/svg+xml;base64` (1.010 caracteres, ~600 B gzip), sem terceiro, a mesma nos dois modos
(laranja/rosa a 30% de opacidade valem sobre o roxo e sobre o rosa-claro; gzip repete a string na contraparte quase de graça).

**Contraparte:** o "amanhecer": `#fff1f7`, cartão branco, tinta roxa `#2a0e3a`, primária `#c4156f`, secundária `#b85a00`,
destaque `#007f87`. Só troca cor, vidro e textura; geometria, tipografia e movimento ficam.

**O que o tema demonstra da lib:** arte de fundo própria offline (`globalBackgroundImageUrl` com data URI), o botão `neon`
com `btnNeonPulseSpeed` e `btnNeonGlowColor`, `switchStyleType: pulsing`, `bgGradientMode: linear` com ângulo, `silk`,
`isometric`, gráfico de área suavizado, `slide-side`.

**Fontes (valor exato de `THEME_FONTS`):** `'Syne', sans-serif` (400–800), `'Sora', sans-serif`, `'JetBrains Mono', monospace`.

# 2. Medições

**Peso** (método §4.1): **4.199 B gzip** (raw 13.826 B), **93% do teto de 4,5 KB** (4.608 B). É o mais pesado dos quatro por
causa da arte; sem ela, ~3,6 KB.

**Contraste textual** (valor concreto, 76 pares por modo, 0 pulado, 0 reprovado):

| Modo | Menor razão | Os mais baixos |
|---|---|---|
| escuro (nativo) | **4,51** | `cardActionBtnText`/fundo de hover da ação do cartão 4,51 · `primaryColor`/cartão 4,82 · `statusErrorColor`/cartão 5,08 · `primaryColor`/corpo 5,38 |
| claro | **4,67** | `on:secondaryColor` 4,67 · `navItemActiveColor`/item ativo 4,67 · `statusSuccessColor`/corpo 4,85 · `textColorMuted`/botão secundário 4,89 |

**Contraste não textual** (apoio, 3:1, bordas compostas sobre o corpo):

| | borda do campo | foco | borda do cartão | marcador ativo | trilho do interruptor | séries 1 / 2 / 3 |
|---|---|---|---|---|---|---|
| escuro | 3,83 | 11,61 | 3,50 | 5,38 | 5,38 | 4,82 / 8,05 / 10,39 |
| claro | 4,65 | 4,37 | 3,45 | 5,21 | 5,21 | 5,70 / 4,67 / 4,79 |

Todos acima de 3:1 (a borda do campo e a do cartão no escuro foram de 2,19 e 2,41 para 3,83 e 3,50 ao subir o alfa de
0,5/0,55 para 0,8/0,75). Paleta de gráfico validada pelas regras do anexo (A8 e 3:1 não textual); a skill `dataviz` não
existe neste repositório.

# 3. Capturas (10 imagens, Chromium headless a partir de `src/` fora do repositório)

Abri: escuro desktop lateral (telas), recortes de viewport (1440×960) dos dois modos, escuro celular (modal).

- **Escuro, desktop:** roxo quase preto com brilho rosa nas bordas; "TÍTULO DE VITRINE" em Syne maiúsculo largo com brilho
  rosa; botões em pílula (primário rosa-neon cheio, secundário e contorno com halo rosa, perigo vermelho, sucesso menta);
  campos de borda rosa; cartões de vidro roxo com borda rosa e halo; tabela com cabeçalho rosa fino; gráfico de área rosa;
  seletores com o selecionado em rosa. Ao fundo, o sol listrado laranja-rosa e a grade em perspectiva aparecem **atrás do
  conteúdo**.
- **Claro, desktop:** rosa-claro, texto roxo-tinta, botão primário magenta-escuro, cartões brancos de borda rosa;
  o sol aparece como halo rosa-pêssego bem suave. Mantém pílula, Syne maiúsculo e os raios do escuro.
- **Celular:** modal em vidro roxo com borda rosa, botão "Confirmar" rosa-neon em pílula; fundo desfocado pelo véu.
- **O que a captura mostra e a ficha não pede:** (a) a arte ocupa a **altura inteira do contêiner de rolagem** (`cover`): a
  horizonte fica no fim da página e o sol é grande, e no recorte de 960px ele passa atrás de campos e botões (por isso a
  opacidade do sol é 30%); (b) a ficha pede `touch 44`, navegação e posição de preferência como escolha do tema: funcionais,
  fora do tema (ver o anexo do `industrial-terminal`, achado 1).

# 4. O que o tema ensinou

| Item | Tipo | Destino proposto |
|---|---|---|
| **Arte embutida (`globalBackgroundImageUrl`) renderiza como `<img object-fit: cover>` no contêiner de rolagem inteiro** (`SarakBackgroundRenderer.tsx`): em página longa a arte se estica; desenhar com `preserveAspectRatio='xMidYMax slice'`, elementos de baixo contraste (opacidade ≤ 0,3 no sol) e linhas de 2px. Presente, o `SarakAppChrome` deixa de pintar fundo próprio | receita/armadilha | skill `ui-criar-tema` §5.7, `usage` de `globalBackgroundImageUrl` |
| Orçamento da arte: SVG de 736 B → 1.010 caracteres de data URI → ~600 B gzip; a mesma string nos dois modos custa quase nada no gzip; o tema fechou em 4.199 B (93% do teto) | medida | skill §5.7 |
| Arte com cores que valem sobre fundo escuro **e** claro (laranja/rosa com opacidade baixa) dispensa duas artes | decisão | skill §5.7 |
| Contraste: `navItemActiveColor` como texto sobre o fundo translúcido do item ativo (4,43 com `#ff2e97`) pede um tom mais claro (`#ff63b0`, 5,58); a primária é texto 5,38/4,82 sobre corpo/cartão, boa, mas o item ativo é o par apertado | medida | skill §5.7 |
| Bordas translúcidas no escuro precisam de alfa ≥ 0,75 para 3:1 (0,5 dá 2,2) | medida | skill §5.7 (já cita a composição) |
| Rosa neon (`#ff2e97`) como primária sobre roxo escuro passa 4,8:1 como texto, mas **como fundo de botão pede texto escuro** (`#12061f`): branco dá 3,7 | decisão | comentário no tema |
| `btnNeonPulseSpeed` só desenha em `neon`; `switchPulseColor` só em `pulsing` (a primeira presença dos dois num tema) | decisão | `usage` (já cita), comentário no tema |
| Peso 4.199 B gzip; contraste mínimo 4,51 (escuro) e 4,67 (claro) | medida | esta tabela |
| **Faixas do contrato que a pílula e os raios esbarram** (`tokenContractParity` reprovou 24 valores na 1ª rodada, `shippedThemesConsoleClean` avisa em runtime): `btnBorderRadius`/`btnRadius*` e `cardBorderRadius` máx. 120 (não 999), `badgeRadius` 100, `progressBarRadius` 32, `tooltipRadius` 12, `scrollRadius` 10, `catalogSectionRadius`/`catalogItemRadius` 0 a 4 **em rem**, `bodyLineHeight` em passo 0,1, `glassOpacity` em passo 0,05: valor fora é cortado na borda ou regravado pelo slider | armadilha | skill `ui-criar-tema` §5.7 (junto de "valor enumerado" e da grade do `step`) |

# 5. Achados do arsenal ou do fluxo

1. `src/core/Design/components/SarakBackgroundRenderer.tsx:13-65` (contêiner `absolute`, 100% do contêiner de rolagem,
   `objectFit: cover`): a arte de fundo se ajusta à **altura do conteúdo**, não à janela, e rola com ele. Para uma arte tipo
   "horizonte fixo" o consumidor/tema não tem como fixar (`isFixed` não é token estético). Não essencial: o tema
   funciona; o resultado é uma arte estendida. Candidato à `plan-117`.
2. Mesmo achado do `neo-brutalism` (anexo dele, achado 2): barra de topo estreita os itens de navegação.
3. `generate_theme_template.ts` (backlog, já registrado).
