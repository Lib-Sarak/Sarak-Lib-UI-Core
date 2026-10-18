---
tipo: "anexo"
titulo: "plan-110 — Tema `neo-brutalism` (lote 9)"
dominio: "Design Engine / Temas embarcados / Design e UX"
relacionados: ["[[plan-110-temas-que-mostram-a-biblioteca]]", "[[plan-110-direcao-de-arte]]", "[[09-temas-e-presets]]"]
---

# 1. Nota de conceito

**Arquétipo:** brutalismo da web, **claro por natureza** (decisão D2: o tema muda de modo nativo, de escuro para claro).
Papel creme `#fff6dc`, cartão branco, **borda preta de 3px** como elemento gráfico, cor chapada sem gradiente, **sombra dura
deslocada** (6px/6px, sem desfoque, cor de tinta), raio 4, `Archivo` 800–900 maiúsculo sobre `Space Grotesk` 500 de 16px,
ícone Lucide `bold` com traço 2,5, meio-tom (`dots`) no fundo e hachura (`crosshatch`) no cartão, hover `expand`,
transição de página `slide-up`, gráfico de barras com traço 3.

**Quem carrega a personalidade:** a borda (3px em campo, cartão, tabela), a sombra dura (`cardShadow` escrito inteiro, mais
os tokens `cardShadow*` coerentes), o amarelo chapado (`#ffd400`: botão primário, item ativo da navegação, cabeçalho de
tabela em amarelo-claro), a tipografia pesada e o raio pequeno.

**Decisão de contraste que governa o tema:** o amarelo não passa 4,5:1 como **texto** sobre o papel (1,3:1), e a primária é
medida como texto. Por isso `primaryColor` é o **cobalto** `#2f5bff` (4,79:1) e o amarelo vive em `btnPrimaryBg`,
`sidebarActiveColor`, `tableHeaderBg` e `chatUserBg`. No escuro (contraparte) a primária volta a ser o amarelo
(passa com folga sobre `#121110`), e a borda e a sombra viram creme `#f4ead2`.

**Contraparte:** modo escuro (preto quente `#121110`, cartão `#1c1a17`, texto `#fff6dc`), mesma geometria, mesma tipografia e
mesmo movimento; só cor, sombra (creme) e textura mudam.

**O que o tema demonstra da lib:** a sombra de cartão por geometria de token (a "sombra dura" que a ficha considerava
inalcançável agora é; ver anexo de direção §3.2 superado), `cardShadow` por inteiro com cor por modo, `crosshatch`, `dots`,
`headingTransform: uppercase`, `slide-up`, `expand`, e uma primária de texto diferente da cor de preenchimento da marca.

**Fontes (valor exato de `THEME_FONTS`):** `'Archivo', sans-serif`, `'Space Grotesk', sans-serif`, `'JetBrains Mono', monospace`.

# 2. Medições

**Peso** (método §4.1): **3.346 B gzip** (raw 11.391 B), 74% do teto de 4,5 KB.

**Contraste textual** (valor concreto, 76 pares por modo, 0 pulado, 0 reprovado):

| Modo | Menor razão | Os mais baixos |
|---|---|---|
| claro (nativo) | **4,79** | `primaryColor`/corpo 4,79 · `statusSuccessColor`/corpo 4,99 · `on:secondaryColor` 5,06 · `textColorMuted`/botão secundário 5,08 |
| escuro | **6,20** | `textColorMuted`/cabeçalho de tabela 6,20 · `statusErrorColor`/cartão 6,26 · `inputErrorColor`/corpo 6,80 |

**Contraste não textual** (apoio, 3:1, bordas compostas sobre o corpo):

| | borda do campo | foco | borda do cartão | marcador ativo | trilho do interruptor | séries 1 / 2 / 3 |
|---|---|---|---|---|---|---|
| claro | 17,51 | 4,79 | 17,51 | 17,51 | 4,79 | 5,17 / 5,06 / 4,77 |
| escuro | 7,03 | 7,94 | 15,76 | ≥ 13 (amarelo) | 13,18 | 12,13 / 6,13 / 7,30 |

Todos acima de 3:1. As séries são **mais escuras** que a marca (cobalto, rosa `#cc2a73`, ouro `#946c00`): amarelo e rosa
claros sobre cartão branco dão 1,4:1 e 2,7:1. Validação pelas regras do anexo (A8 e 3:1 não textual); a skill `dataviz`
não existe neste repositório.

# 3. Capturas (10 imagens, Chromium headless a partir de `src/` fora do repositório)

Abri: claro desktop lateral (telas), escuro desktop topo (telas), recorte da barra de topo escura, claro celular (modal).

- **Claro, desktop:** fundo creme com meio-tom discreto; barra lateral branca com filete preto; "Início" em bloco amarelo
  chapado com texto de tinta; título em Archivo preto pesado; botões chapados (primário amarelo, secundário rosa, contorno
  cobalto, perigo e sucesso sólidos); campos brancos de borda preta; **cartões com borda de 3px e sombra preta dura
  deslocada**, hachura leve; tabela com cabeçalho amarelo-claro; gráfico em cobalto; "hoje" do calendário em bloco
  cobalto; bolha do chat em cobalto com texto branco. É o brutalismo da nota.
- **Escuro, topo:** preto quente com a mesma geometria; cartões com borda e **sombra dura creme**; botão amarelo com texto
  de tinta; seletores P/M/G e Lateral/Topo com o selecionado em amarelo e texto escuro (corrigido depois de achado 1).
- **Celular (claro):** barra de base (`auto`), botões e campos largos; modal com borda fina e sombra suave (não a sombra
  dura): o modal não lê os tokens de borda e sombra do cartão (achado 3).
- **O que a captura mostra e a ficha não pede / não alcança:** o item ativo "Início" da barra de topo no escuro é
  espremido a um filete de poucos pixels (achado 2); o celular usa a barra de base (`auto`), que por acaso é o que a ficha
  pede (`bottom`), mas por padrão do sistema, não por escolha do tema.

# 4. O que o tema ensinou

| Item | Tipo | Destino proposto |
|---|---|---|
| **`navItemActiveColor` tem dois papéis**: texto do item ativo e **fundo** do botão selecionado dos seletores da barra (`ShellFontSizeControl.tsx:42`, com o texto de `--color-theme-on-primary`). Um tema cujo item ativo tem fundo de outra cor que a primária (amarelo com tinta) não satisfaz os dois: o seletor sai tinta sobre `rgb(2,6,23)` fixo. A saída: item ativo em tom translúcido da primária + `navItemActiveColor` = primária | armadilha | skill `ui-criar-tema` §5.7, `usage` de `navItemActiveColor` |
| Primária de preenchimento ≠ primária de texto: com marca amarela, `primaryColor` vira a cor escura legível (cobalto) e o amarelo mora em `btnPrimaryBg`, `sidebarActiveColor` e afins; `primaryColor` no escuro volta a ser o amarelo (é `modeDependent`) | receita | skill §5.7, GUIA (do cliente ao tema) |
| Sombra dura: `cardShadow` por inteiro (`6px 6px 0 0 <cor>`) com **cor trocada na contraparte**, e os `cardShadowOffset*`/`Blur`/`Expansion`/`Spread` coerentes; `cardShadow` carrega modo, os de geometria não | receita | skill §5.7, `usage` de `cardShadow` |
| O texto do cabeçalho da tabela usa a primária: cobalto sobre `#ffd400` dá 4,4:1, sobre `#ffe680` 5,0:1; a razão não está em `PAIRS` | armadilha | skill §5.7 (par que o gate não mede) |
| Trilho do interruptor e série de gráfico em amarelo sobre branco: 1,2:1 / 1,4:1; usar cobalto e série escura | medida | skill §5.7 |
| `dots` e `crosshatch` pintam com a cor de textura e valem nos dois modos (`textureColor` troca na contraparte) | decisão | comentário no tema |
| `catalogSectionRadius`/`catalogItemRadius` são **rem** (0 a 4): `4` seria 64px; raio de 4px é `0,25` | armadilha | skill `ui-criar-tema` §5.7 |
| Peso 3.346 B gzip; contraste mínimo 4,79 (claro) e 6,20 (escuro) | medida | esta tabela |

# 5. Achados do arsenal ou do fluxo

1. `src/components/atomic/Navigation/ShellFontSizeControl.tsx:42`: o botão selecionado usa `--sarak-nav-active-color` como **fundo** e
   `--color-theme-on-primary` (derivado da primária) como texto, com reserva `#020617`. Dois tokens com papéis acoplados:
   com item ativo de fundo ≠ primária, o seletor fica ilegível (medido: bg `rgb(17,17,17)` e cor `rgb(2,6,23)`). Contornado no
   tema (§4), mas o acoplamento é do componente. Candidato à `plan-117`, não essencial.
2. **Barra de topo estreita o item de navegação.** `neo-brutalism`, escuro, topo, 1440px: "Início" (ativo) aparece como um
   filete amarelo de poucos pixels, e "Relatórios" cabe. A busca (`Busca inteligente` + `CTRL K`) e os seletores ocupam
   a largura; os itens têm `shrink-0 min-w-0` e encolhem. Com fontes mais largas o efeito aumenta; no `industrial-terminal`
   claro, "Configurações" aparece cortado como "Conf". Medida: `getComputedStyle` do link "Início": cor `rgb(17,17,17)`, fundo
   `rgb(255,212,0)`, largura reduzida pelo layout; o tema não controla. Candidato ao revisor.
3. `SarakModal`: o modal desenha borda fina e sombra suave, não a borda do tema (`borderWidth` 3) nem a sombra dura. Não há
   token de borda/sombra de modal nos estéticos declarados; o brutalismo do modal fica pela metade. Não essencial.
4. `generate_theme_template.ts` (backlog, já registrado).
