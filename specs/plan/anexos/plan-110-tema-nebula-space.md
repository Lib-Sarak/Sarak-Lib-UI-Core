---
tipo: "anexo"
titulo: "plan-110 — Tema `nebula-space` (lote 11)"
dominio: "Design Engine / Temas embarcados / Design e UX"
relacionados: ["[[plan-110-temas-que-mostram-a-biblioteca]]", "[[plan-110-direcao-de-arte]]", "[[09-temas-e-presets]]"]
---

# 1. Nota de conceito

**Arquétipo:** espaço profundo (pesquisa, IA, produtos exploratórios). Azul-noite `#070818`, **violeta `#a77bff`** como
primária, gelo `#49d3ff` como secundária, rosa `#ff7ac6` como destaque, dourado `#ffd166` de estrela como terciária.
`Sora` 700 sobre `Inter` 14px, ícone Phosphor **`thin`** (traço 1), vidro espesso (`cardBackdropBlur` 20, cartão a 60%),
**raios grandes** (cartão 24, pílula 999), cartão de **estrelas** (`stars`), botão `frosted`, interruptor `glass`,
densidade **espaçosa** (gap 32, largura 1200px), linha de gráfico fina suavizada (traço 1) e movimento **longo** (curva
`Expo Glide`, 500 ms, transição `zoom`).

**Quem carrega a personalidade:** o vidro (blur 20 e opacidade 0,6 deixam o fundo aparecer), o traço fino dos ícones, a
paleta violeta-gelo, a vinheta de 0,4 e a malha de gradiente (`bgGradientMode: mesh`), os raios generosos e a duração longa.

**Contraparte:** "manhã de observatório": lavanda `#f4f3ff`, cartão branco a 80%, tinta azul-noite `#17123a`, primária
`#6a3fd6`, secundária `#0b7a9e`, destaque `#b0206f`, terciária `#a86a00`. O vidro continua (a 80%) e a malha de gradiente
sobe do lavanda ao azul-céu. Só cor, vidro e textura mudam.

**O que o tema demonstra da lib:** vidro espesso e `cardBackdropBlur`, `stars` como textura de cartão, `thin` em Phosphor,
`mesh`, `glass` no interruptor, densidade `spacious`, `zoom` e a curva longa.

**Desvio da ficha (decidido pela medição):** a ficha pedia `texture: nebula` para o fundo. `nebula` anima `transform:
scale(1.2) rotate(5deg)` no pseudoelemento de página e faz o **`scrollWidth` do documento crescer sem parar** (1440 → 1456 em
5 s → 1503 em 15 s → 1599 em 35 s, medido), isto é, uma barra de rolagem horizontal que aumenta. O tema usa
**`constellation`** (estática, pinta com `--theme-texture-color`, vale nos dois modos): `scrollWidth` fixo em 1440 aos
5 s e aos 15 s. Ver achado 1.

**Fontes (valor exato de `THEME_FONTS`):** `'Sora', sans-serif`, `'Inter', sans-serif`, `'JetBrains Mono', monospace`.

# 2. Medições

**Peso** (método §4.1): **3.569 B gzip** (raw 11.830 B), 77% do teto de 4,5 KB.

**Contraste textual** (valor concreto, 76 pares por modo, 0 pulado, 0 reprovado):

| Modo | Menor razão | Os mais baixos |
|---|---|---|
| escuro (nativo) | **5,06** | `cardActionBtnText`/fundo de hover da ação do cartão 5,06 · `textColorMuted`/camada 2 5,78 · `primaryColor`/cartão 5,98 |
| claro | **4,84** | `statusSuccessColor`/corpo 4,84 · `on:secondaryColor` 4,89 · `textColorMuted`/camada 2 4,96 |

**Contraste não textual** (apoio, 3:1, bordas compostas sobre o corpo):

| | borda do campo | foco | borda do cartão | marcador ativo | trilho do interruptor | séries 1 / 2 / 3 |
|---|---|---|---|---|---|---|
| escuro | 3,69 | 11,40 | 3,69 | 6,55 | 6,55 | 5,98 / 10,42 / 7,65 |
| claro | 3,98 | 4,45 | 3,05 | 5,80 | 5,80 | 6,37 / 4,89 / 6,40 |

Todos acima de 3:1 (a borda do campo no escuro era 2,99 com alfa 0,6; com 0,7, 3,69). Paleta de gráfico validada pelas
regras do anexo (A8 e 3:1 não textual); a skill `dataviz` não existe neste repositório.

# 3. Capturas (10 imagens, Chromium headless a partir de `src/` fora do repositório)

Abri: escuro desktop lateral (telas, com `nebula`, antes do desvio), recorte de viewport escuro (1440×960, com
`constellation`), claro desktop topo (telas, com `nebula`) e o conjunto final das dez geradas (por nome).

- **Escuro, desktop (final):** azul-noite com vinheta e brilho violeta suave; barra lateral mais funda com borda violeta;
  "Título de vitrine" em Sora 700 com brilho de luar; botões em pílula (primário violeta cheio, secundário e contorno em
  vidro com borda violeta, sucesso menta, perigo coral); campos de vidro; cartões de raio 24 de vidro azul com borda
  violeta e pontos de estrela; seletores com o selecionado em lavanda.
- **Antes do desvio (com `nebula`):** o fundo ganhava uma nebulosa violeta→verde-azulado muito mais viva, mas com a rolagem
  horizontal crescente. A versão final perde essa nebulosa e fica mais contida; é o preço medido.
- **Claro, desktop topo:** gradiente de malha lavanda→azul-céu, cartões de vidro branco a 80%, primária violeta-escura,
  seletor selecionado em violeta; mantém raios, Sora e estrelas.
- **O que a captura mostra e a ficha não pede / não alcança:** sidebar `floating`, `touchTargetMin` e a navegação são
  funcionais (ver o anexo do `industrial-terminal`, achado 1); `3d-tilt` não existe entre as opções de `cardHoverStyle`
  (`lift`, `glow-only`, `expand`): o tema usa `lift` com 8px.

# 4. O que o tema ensinou

| Item | Tipo | Destino proposto |
|---|---|---|
| **Texturas de página que animam `transform` (`nebula`, medida: scale 1,2 + rotate 5°; `stars` tem scale 1,05, não medida) ampliam o `scrollWidth` do documento** (`html` com `overflow-x: visible`): 1440 → 1599 em 35 s com `nebula`. Em tema, escolher textura estática (`constellation`, `micro-dots`, `circuit-pro`) para a página e deixar as animadas para o cartão (clipado) | armadilha | skill `ui-criar-tema` §5.7, `usage` de `texture` |
| A ficha de 2026-10-11 pedia `3d-tilt` e `nebula`; o código só tem `lift`/`glow-only`/`expand` e a `nebula` estoura o documento: a ficha mente em dois pontos | decisão | anexo de direção (fechamento) |
| Vidro espesso: `cardBackdropBlur` 20 com `cardSurfaceOpacity` 0,6; a contraparte sobe para 0,8 (vidro sobre claro precisa de mais corpo para o texto) | receita | skill §5.7 |
| `navItemActiveColor` em tom claro da primária (`#c4a6ff`) para passar 4,5:1 sobre o item translúcido; é também o fundo do seletor (ver neo-brutalism, achado 1) | decisão | comentário no tema |
| Borda translúcida no escuro: alfa ≥ 0,7 para 3:1 sobre o corpo | medida | skill §5.7 |
| Peso 3.569 B gzip; contraste mínimo 5,06 (escuro) e 4,84 (claro) | medida | esta tabela |
| (mesma lição do `synthwave-retro`) **Faixas do contrato que a pílula e os raios esbarram** (`tokenContractParity` reprovou 24 valores na 1ª rodada, `shippedThemesConsoleClean` avisa em runtime): `btnBorderRadius`/`btnRadius*` e `cardBorderRadius` máx. 120 (não 999), `badgeRadius` 100, `progressBarRadius` 32, `tooltipRadius` 12, `scrollRadius` 10, `catalogSectionRadius`/`catalogItemRadius` 0 a 4 **em rem**, `bodyLineHeight` em passo 0,1, `glassOpacity` em passo 0,05: valor fora é cortado na borda ou regravado pelo slider | armadilha | skill `ui-criar-tema` §5.7 (junto de "valor enumerado" e da grade do `step`) |

# 5. Achados do arsenal ou do fluxo

1. **`src/styles/_atmosphere.css:610-628` (`nebula`, `nebula-drift`) e `:372-385` (`stars`, `stars-twinkle`).** As animações
   transformam o pseudoelemento de página (`html[data-sx-texture]::before`, `position: absolute`) com `scale`/`rotate`; como o
   `html` tem `overflow-x: visible`, o `scrollWidth` do documento cresce. Medida no `nebula-space` escuro, 1440px de
   janela: `scrollWidth` 1443 (0,8 s) · 1452 (3 s) · 1456 (5 s) · 1503 (15 s) · 1599 (35 s). `stars` (scale 1,05) tem a mesma forma de animação, e `aurora-flow` não foi lida; **não medi** nenhuma das duas em página. **Defeito do arsenal que impede a ficha:** o conceito "espaço"
   perde a nebulosa. Não é bloqueante para o lote seguinte (os temas B–D usam outras texturas) e o tema foi entregue com a
   textura estática; **marcado como essencial para a ficha do `nebula-space`** (decisão do revisor: corrigir o motor com
   `overflow: hidden`/`clip` no contêiner da textura, ou aceitar `constellation`).
2. A barra de topo estreita os itens de navegação (ver `neo-brutalism`, achado 2).
3. `generate_theme_template.ts` (backlog, já registrado).
