---
tipo: "anexo"
titulo: "plan-110 — Tema `industrial-terminal` (lote 8)"
dominio: "Design Engine / Temas embarcados / Design e UX"
relacionados: ["[[plan-110-temas-que-mostram-a-biblioteca]]", "[[plan-110-direcao-de-arte]]", "[[09-temas-e-presets]]"]
---

# 1. Nota de conceito

**Arquétipo:** CRT âmbar de chão de fábrica (indústria, logística, monitoramento 24/7). Um painel de máquina, não um
painel de software: **zero raio em tudo**, contorno de 2px, cartão de chapa com **listra de perigo** (`stripes`) e quina
cortada de 10px, botão só contorno (`borderline`), nenhuma sombra e nenhum vidro, gráfico de **barras**, movimento
**mecânico** (curva linear, 80–120 ms, sem transição de página).

**Quem carrega a personalidade:** a tipografia (Bebas Neue maiúsculo como estêncil sobre JetBrains Mono de 14px, o
corpo deixou os 12px antigos), a densidade (`compact`, `maxContentWidth` 1600px, espaços e preenchimentos de tabela
reduzidos), os pesos geométricos (`borderWidth` 2, `cardBorderWidth` 2, `cardGeometricCut` 10, sombras zeradas) e a
paleta (âmbar fósforo `#ffb347` sobre quase-preto quente `#0b0906`; primária `#ff9a1f`; alarme `#ff3b1f` em
`accentColor`; cinza de chapa `#8a7a62` em `secondaryColor`).

**Contraparte:** "relatório impresso": papel creme `#f4f1ea`, cartão `#fffdf7`, tinta `#1d1710`, primária âmbar-escuro
`#9a5200`, alarme `#b3200a`. Só trocam cor, vidro, sombra e textura (opacidade); a geometria, a tipografia e o movimento ficam.

**O que o tema demonstra da lib:** `systemTone: tactical` (o segundo tom que a base desenha), `cardTextureType: stripes`,
botão `borderline`, ícone Tabler `bold` com traço 2,5, `chartType: bar`, densidade compacta com largura de 1600px,
movimento sem curva, `tableZebraStriping`, gradiente `none`.

**Fontes (valor exato de `THEME_FONTS`):** `'Bebas Neue', display` (só peso 400) e `'JetBrains Mono', monospace`.

# 2. Medições

**Peso** (método §4.1: `esbuild` minify + `gzip -9` do arquivo): **3.421 B gzip** (raw 11.430 B), 76% do teto de 4,5 KB.

**Contraste textual** (valor concreto, `verify_contrast.PAIRS`, 76 pares por modo, 0 pulado, 0 reprovado):

| Modo | Menor razão | Os mais baixos |
|---|---|---|
| escuro | **4,84** | `on:secondaryColor`/secundária 4,84 · `textColorMuted`/cabeçalho de tabela 5,37 · `textColorMuted`/camada 2 5,77 |
| claro | **4,76** | `statusSuccessColor`/corpo 4,76 · `textColorMuted`/camada 2 4,85 · `navItemActiveColor`/item ativo 4,86 |

**Contraste não textual** (apoio, 3:1, bordas translúcidas compostas sobre o corpo):

| | borda do campo | foco | borda do cartão | marcador ativo | trilho do interruptor | séries 1 / 2 / 3 |
|---|---|---|---|---|---|---|
| escuro | 3,45 | 15,42 | 3,36 | 9,37 | 9,37 | 8,87 / 4,52 / 5,29 |
| claro | 4,65 | 5,95 | 3,69 | 5,20 | 5,20 | 5,77 / 6,30 / 6,60 |

Todos acima de 3:1. Paleta de gráfico validada pelas regras do anexo de direção (A8: as cores de status não entram como
série; 3:1 não textual); a skill `dataviz` não existe neste repositório.

Provas rodadas: `theme-completeness:check` (3 de 14 completos após este tema), `variable-contract:check` (verde),
`auditor_contraste`, `themes:diversity` (sai sem erro), vitest dos arquivos de tema e dos snapshots (ver o resumo no chat).

# 3. Capturas (10 imagens, Chromium headless a partir de `src/` fora do repositório)

Abri: escuro desktop lateral (telas), claro desktop topo (telas), claro celular (telas), escuro celular (modal), e as
miniaturas das demais.

- **Escuro, desktop:** fundo quase preto quente, barra lateral ainda mais escura com filete âmbar; "TÍTULO DE VITRINE" em
  Bebas Neue maiúsculo com leve brilho âmbar; botões quadrados só contorno (primário âmbar, perigo vermelho, sucesso
  verde), campos quadrados de fundo escuro com borda âmbar; cartões de chapa com listra discreta, borda 2px e quina
  cortada; tabela compacta com zebra e cabeçalho âmbar; gráfico em âmbar. Coerente com a nota: CRT, chapa, mecânico.
- **Claro, desktop (topo):** papel creme com o tecido do `carbon` apenas como "dente de papel" (opacidade 0,03); cartões
  brancos quentes, botões em âmbar-escuro, título em Bebas preto; mantém a quina, o zero raio e a densidade.
- **Celular:** barra de base (`auto`) com "Início / Relatórios / Configurações", botões e campos largos, cartões
  empilhados; modal com cabeçalho Bebas, fecha em botão quadrado de borda âmbar grossa.
- **O que a captura mostra e a ficha não pede / não alcança:** (a) o celular usa a barra de base, não a gaveta da ficha,
  porque `mobileNavigationStyle` é funcional (achado 2); (b) a quina cortada de 10px é discreta nos cartões largos; o
  efeito forte está na listra e na borda.

# 4. O que o tema ensinou

| Item | Tipo | Destino proposto |
|---|---|---|
| `texture: carbon` mistura a cor de textura com **preto** (`color-mix(... #000)`): nunca clareia, então sobre fundo claro vira um xadrez escuro pesado; `texture` não carrega modo, só `textureOpacity` troca na contraparte (0,6 escuro → 0,03 claro) | armadilha | skill `ui-criar-tema` §5.7 (junto de `cyber-binary`), `usage` de `texture` |
| `textColorMuted` com alfa 0,58 sobre cor âmbar reprova 4,5:1 contra o cabeçalho de tabela (3,99); com 0,72, 5,37. Muted translúcido precisa de alfa ≥ 0,7 sobre tema escuro quente | medida | skill §5.7 |
| Bordas de cartão a 1,9:1 leem como filete; chapa de 3,4:1 (`#7a6030`) lê como contorno. Medir com a borda composta sobre o corpo | medida | skill §5.7 (já cita a composição) |
| Estêncil com Bebas Neue exige subir `h1Size`/`h2Size`/`cardTitleFontSize` (a família é estreita) e usar peso `'400'` (único com arquivo) | receita | skill §5.7 |
| `systemTone: tactical` desenha; usar quando o conceito é industrial/tático | decisão | `usage` de `systemTone` |
| Sucesso verde-folha (`#5ed38a`) distante do âmbar da marca; no claro `#1f7a3f` (4,76:1) | decisão | comentário no tema |
| Peso 3.421 B gzip (76% do teto) e contraste mínimo 4,84 / 4,76 | medida | esta tabela |
| `formFieldDensity` só aceita `tight`/`comfortable`/`relaxed` (a ficha dizia "compacta"): a 1ª rodada de `tokenContractParity` e de `shippedThemesConsoleClean` reprovou `compact`, e o valor é descartado em runtime com aviso | armadilha | skill `ui-criar-tema` §5.7 (valor enumerado) |

# 5. Achados do arsenal ou do fluxo

1. **Ficha pede o que o tema não declara.** `mobileNavigationStyle` (`drawer`), `touchTargetMin` (48), `navigationStyle`
   e `sidebarPosition` são funcionais pela decisão do dono de 2026-10-13: a trava os proíbe em tema. A ficha do anexo de
   direção (§7.3) os trata como escolha do tema. Efeito medido: no celular o tema mostra a barra de base (`auto`), não a
   gaveta. Não é defeito de código; é divergência da ficha, a revisar no fechamento do anexo de direção. Mesma divergência
   vale para os lotes seguintes (neo-brutalism `bottom`, nebula-space sidebar `floating`).
2. `src/styles/_atmosphere.css:240-262`: `carbon` não acompanha o modo (ver §4). Não é bloqueante (a contraparte baixa a
   opacidade), mas a `usage` de `texture` não avisa que 6 texturas de branco fixo **e** `carbon` de preto fixo não servem
   ao modo oposto sem baixar `textureOpacity`.
3. **Barra de topo estreita os itens de navegação** (ver `neo-brutalism`, achado 2): no `industrial-terminal` claro, topo, 1440px, "Configurações" aparece cortado como "Conf".
4. `.agents/skills/ui-criar-tema/scripts/generate_theme_template.ts` continua com os defeitos já registrados (backlog); o
   ponto de partida real foi o `cyberpunk-neon.ts`, com as cores trocadas por um script de escopo local.
