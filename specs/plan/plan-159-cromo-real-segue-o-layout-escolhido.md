---
tipo: "plan"
titulo: "Fazer o cromo real seguir o Layout escolhido, com preferências discretas e uma decisão própria para as barras"
objetivo: "Fazer toda opção de Layout que o administrador aplica aparecer no cromo real ou dizer por que não aparece, com a Topbar sem item escondido, a barra de tom contrastante legível e os controles de preferência discretos, com P, M e G configuráveis em relação ao tamanho base do tema, e reunir as barras numa decisão própria, com um tom que vale para as duas e um interruptor da troca lateral/topo"
dominio: "Cromo / Preferências do usuário"
status: "🟡 Em execução"
prioridade: "Alta"
tags: ["plan", "cromo", "topbar", "sidebar", "preferencias", "painel"]
relacionados: ["[[05-cromo-e-slots]]", "[[09-temas-e-presets]]", "[[06-painel-de-customizacao-e-preview]]", "[[016-preferencias-do-usuario-separadas-do-tema]]", "[[014-cromo-do-modo-ui-kit-com-widgets-por-padrao]]"]
depende_de: ""
retida_por: ""
destino_sintese: "specs/05-cromo-e-slots.md + specs/09-temas-e-presets.md + specs/06-painel-de-customizacao-e-preview.md"
---

# 1. Objetivo

O administrador aplica uma opção de Layout e a vê no sistema, ou o painel diz por que ela não aparece para ele; na Topbar nenhum item
de navegação fica inalcançável sem sinal; a barra invertida, primária ou secundária é legível; e os controles de tamanho de fonte e
de navegação são discretos, com o quanto P reduz e G aumenta definido pelo administrador.

# 2. Contexto

**Medido no ERP (lib `v8.0.0`, 2026-11-10, a 1440×900, aplicando pelo painel e medindo o cromo real).** Depois da `plan-158`, cor e tom
deixam de ser problema de dado; o que sobra é do cromo e do painel:

1. **A preferência pessoal vence o administrador, sem aviso.** O administrador aplicou `navigationStyle: topbar` e continuou vendo a
   Sidebar, porque o próprio navegador tinha gravado `{"navigationStyle":"sidebar"}` em `sarak-ui-preferences-v1` ao clicar a pílula
   "Lateral". A precedência é a especificada ([[09-temas-e-presets]] §4.7, [[016-preferencias-do-usuario-separadas-do-tema]]); o
   defeito é o painel não dizer nada. Vale igual para tamanho da fonte, modo, navegação recolhida e largura da lateral.
2. **A Topbar esconde itens sem sinal.** Com navegação no topo, o ERP mostra Início, Design, Propostas e Contratos; Comercial aparece com
   53 de 116 px, e Financeiro e Projetos com 0 px. É a regra atual (`browser-tests/barra-de-topo-estreita.spec.ts`: "a lista de
   navegação rola"), mas a barra de rolagem é oculta e nada indica que há mais itens.
3. **Sidebar de tom contrastante ilegível.** Com a Invertida aplicada e o fundo correto (`#ddeced`), os rótulos dos itens sumiram
   (texto claro sobre fundo claro), e o campo de busca e as pílulas ficaram branco sobre branco. Parte disso pode ser resto de dado que a
   `plan-158` remove: meça de novo depois dela.
4. **Controles de preferência grosseiros** (item 5 do dono). As pílulas P/M/G e Lateral/Topo ocupam ~360 px da Topbar; o menu ⚙
   real tem 330×370 px com as mesmas pílulas grandes; "Buscar…" aparece fixo na barra **e** dentro do ⚙. O padrão de fábrica já é
   "no menu" para tamanho e navegação ([[05-cromo-e-slots]] §2.2.2); o ERP mostra as pílulas porque gravou `pinned`, e continua assim
   até o administrador mudar no painel (decisão do dono, 2026-11-10: sem migração do valor gravado).
5. **P/M/G fixos e com defeito nas pontas** (item 11). `overlayPreferences.ts:14-24` desloca um degrau numa escala fixa de cinco
   (`12, 14, 16, 18, 20 px`): com base 12, P = M; com base 20, G = M. Nada é configurável. O token `bodySize` ("Tamanho Global das
   Fontes", `schema/global.ts:66`) chama 14 px de "P (Pequeno)", enquanto a barra chama 14 px de M. **Decisão do dono (2026-11-10):**
   continua relativo ao tamanho base do tema, e o administrador define quanto P reduz e quanto G aumenta.
6. **Opções de Layout que não fazem nada, sem dizer:**
   - "Textura local" (`sidebarBackgroundStyle: texture`) muda 0 px: `sidebarNoiseOpacity` está em 0, em outro controle.
   - Largura digitada abaixo do mínimo é ignorada: 260 virou 300 px porque o design tem `sidebarMinWidth: 300`.
   - "Ocultar Navegação" (`isNavHidden`, `schema/navigation.ts:129`) **recolhe** a barra para 74 px; é a preferência "navegação
     recolhida" com outro nome.
   - "Comportamento da Topbar" (`navbarLayout`) aparece e não tem efeito com a navegação lateral.

7. **Pedido do dono (2026-11-12): uma decisão própria para as barras.** O dono não acha onde se configuram as barras e vê o Layout
   "não aplicar nada". Hoje tudo isso está na decisão Layout, que mistura as barras com a largura do conteúdo
   (`design-decisions.json`: grupos `sidebar`, `topbar`, `contentWidth`, `globalBlock` e as perguntas `where`, `how`, `what`,
   `brand` e `behavior`). Ele pede três coisas:
   - **Uma categoria das barras** no caminho do painel, ao lado de Tema, Cores, Fontes, Forma, Componentes e Layout.
   - **O tom vale para as duas barras.** Lido no código:
     - o tom são dois tokens, `sidebarTone` e `topbarTone`, e os presets de cada barra gravam só o da sua barra
       (`presets/components/layout.ts`: `sidebar-inverted` grava só `sidebarTone: 'inverse'`, `topbar-inverted` só `topbarTone`);
     - escolher "Invertida" na Sidebar deixa a Topbar na cor do tema, e é o que o dono vê no ERP;
     - 8 dos 26 temas declaram tom diferente nas duas barras: `sarak-sovereign-classic`, `cyberpunk-neon` e
       `cyberpunk-neon-classic` com a lateral `inverse` e o topo `surface`/`neutral`, e também `dot-matrix-elegant`,
       `industrial-terminal-classic`, `nature-breeze`, `neo-brutalism` e `neo-brutalism-classic`.
   - **Ligar e desligar a troca lateral/topo pelo usuário.** Há sistemas com um tipo só de navegação. O mecanismo já existe e
     funciona:
     - `preferenceNavigationStylePosition: 'off'` ("Esconder", pergunta `what` do Layout) tira a escolha da barra e do ⚙;
     - `overlayPreferences.ts:154-157` ignora a preferência já gravada quando a escolha não é oferecida
       (`isPreferenceOffered`).

     Falta ser achável: hoje é uma "posição" entre outras oito, e não um interruptor junto da orientação.

**O que funciona e não se toca:** borda, densidade, blur, posição esquerda/direita/flutuante, gradiente, largura ajustável,
auto-ocultar e as larguras de conteúdo 1000/1200/1440 aplicam no cromo real. A anatomia da barra lateral (item ativo, ícones, raio da
moldura, cabeçalho e marca, rodapé e usuário) é da `plan-165`, que roda antes desta (nota do revisor de 2026-11-13, §10).

# 3. Escopo

## 3.1 Dentro
- **Lote 1 (Topbar e tom):** `src/components/Layout/chrome/ChromeTopbarBody.tsx`, `navItem.ts`, `chromeToneStyle.ts`,
  `src/components/atomic/Navigation/SarakShellNav.tsx` e os testes; `browser-tests/barra-de-topo-estreita.spec.ts` (a regra muda) e
  um caso novo de tom contrastante num spec de navegador existente do cromo.
- **Lote 2 (preferências discretas e P/M/G):** `src/components/atomic/Navigation/ShellFontSizeControl.tsx`,
  `ShellNavigationStyleControl.tsx`, `ShellPreferencesMenu.tsx`, `shellPreferenceRow.tsx`,
  `src/components/Layout/chrome/ChromeUserThemeGroup.tsx` e `chromeWidgets.ts`; `src/core/Provider/utils/overlayPreferences.ts`;
  `src/core/Design/schema/preferences.ts` e `global.ts` (tokens novos de P e G e o rótulo de `bodySize`), com a paridade das três
  fontes de token; os testes.
- **Lote 3 (o painel diz a verdade):** o aviso de preferência pessoal e os controles condicionais em
  `src/features/DesignEngine/Main/components/` (`DecisionQuestionList.tsx`, `ThemeDecisionView.tsx` e vizinhos); `schema/navigation.ts`
  e `schema/system.ts` (rótulos e o vínculo textura → opacidade); as chaves de texto em `src/core/i18n/`; os testes.
- **Lote 4 (decisão das barras):**
  - `src/features/DesignEngine/config/design-decisions.json` (a decisão nova e o que sai do Layout) e o tipo de decisão em
    `src/features/DesignEngine/utils/decisions.ts`;
  - os componentes da decisão em `src/features/DesignEngine/Main/components/` (o controle único de tom e o interruptor da troca
    lateral/topo);
  - `src/core/Design/presets/components/layout.ts` (o tom sai dos presets de estrutura) e os presets de Personalidade que citam
    preset de barra (`personalities.ts`);
  - o ícone e o texto da decisão em `src/core/i18n/` (seis idiomas);
  - os testes, o snapshot do `PresetsCatalog` e o spec de navegador da `plan-160`, se já existir (a decisão nova entra na lista dele).
- Em todo lote: `docs/migracoes.md`, `npm run guide`, `npm run dev-kit`.

## 3.2 Fora
- O que se grava e o desempenho do painel: `plan-158`.
- A prévia do painel e as amostras: `plan-160` e `plan-161`. Esta plan não muda mock nem amostra.
- Migrar o valor `pinned` já gravado nos importadores.
- Tornar `bodySize` um valor livre em px (continua com as cinco opções).
- Qualquer arquivo de importador.
- Versão e tag.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/05-cromo-e-slots.md` §2.1, §2.1.1, §2.2.2, §2.3, §2.4, §6 | estrutura, item de navegação, composição da barra, nada some, token tem consumidor, zero hardcode |
| Spec fixa | `specs/09-temas-e-presets.md` §4.3.4 (o papel da barra), §4.7 | tom contrastante e preferência sobreposta ao tema |
| Spec fixa | `specs/06-painel-de-customizacao-e-preview.md` §2.1.1, §2.3, §3 | composição da barra no painel, o caminho do painel, controles polimórficos |
| Spec fixa | `specs/07-responsividade-e-multidispositivo.md` §6.1 | as regras da camada 3 (container query) |
| Spec fixa | `specs/10-seguranca-e-acessibilidade.md` §3.6 | textos novos no catálogo dos seis idiomas |
| Spec fixa | `arquitetura/04-contrato-de-tokens-e-paridade.md` | token novo nas três fontes |
| ADR | `adr/016-preferencias-do-usuario-separadas-do-tema.md` · `adr/014-cromo-do-modo-ui-kit-com-widgets-por-padrao.md` · `adr/015-metrica-do-item-de-navegacao-horizontal.md` | precedência da preferência, widgets e métrica do item horizontal |
| Contexto | `00-contexto.md` · `00-knowledge.md` | sempre |
| **Skill** | `padrao-escrita` + `padrao-typescript` · `test-unitario` · `test-e2e` · `ui-novo-componente` (token novo) · `ui-arquitetura-design` | escrita, testes, paridade de token, regra do Design Engine |
| Código | `src/core/Provider/utils/overlayPreferences.ts:14-24` · `src/core/Design/schema/preferences.ts` · `src/core/Design/schema/global.ts:66` · `src/core/Design/schema/navigation.ts:129` · `src/components/Layout/chrome/` | ler antes de editar |
| Teste existente | `browser-tests/barra-de-topo-estreita.spec.ts` · `browser-tests/seletor-da-barra-legivel.spec.ts` · `browser-tests/plan-124-sidebar-contrast.spec.ts` | as medições do cromo que mudam ou não podem regredir |

# 5. Instruções de execução

**Um lote por vez; cada lote termina com resumo num bloco novo da §9 e status 🟠.**

**Lote 1 — Topbar sem item escondido e tom legível.**
1.1. Teste de navegador que reprova antes: a 1440, 1280 e 1024 px, com a composição `pinned` do ERP (busca, P/M/G, Lateral/Topo,
modo) e sete itens, todo item de navegação está visível inteiro **ou** num menu "Mais" no fim da lista, que abre os que não couberam.
O "Mais" é alcançável por teclado e leitor de tela, e o item ativo escondido marca o "Mais" como ativo.
1.2. Implemente. Atualize `barra-de-topo-estreita.spec.ts` para a regra nova (a lista não rola mais) e o cabeçalho de limites dele.
1.3. Meça de novo, depois da `plan-158`, a Sidebar e a Topbar com tom `inverse`, `primary` e `secondary` em dois temas e nos dois modos:
rótulo do item, ícone, busca, pílulas e ⚙ passam 4,5:1 contra o fundo da barra. O que reprovar, corrija em `chromeToneStyle.ts`
(o que cada tom refaz) e cubra com caso no spec de navegador do cromo.

**Lote 2 — preferências discretas e P/M/G configurável.**
2.1. Controles compactos: P/M/G e Lateral/Topo, fixos na barra, cabem num grupo com a altura de um item de navegação; dentro do ⚙,
viram linhas de menu com seleção, não pílulas. Meça antes e depois a largura do grupo na Topbar e o tamanho do menu ⚙.
2.2. O ⚙ não repete o que já está fixo na barra visível. Exceção mantida: na Sidebar recolhida, o ⚙ recebe o fixado que não tem
ícone próprio (05 §2.2.2). Atualize o texto da 05 §2.2.2 na síntese (a tabela diz hoje "e também dentro do ⚙").
2.3. P/M/G: dois tokens novos, a redução de P e o aumento de G em px em relação a `bodySize`, com padrão −2 e +2. O cálculo deixa de
usar a escala fixa: com base 12, P = 10 e G = 14; com base 20, P = 18 e G = 22. Teste que reprova antes nas pontas (base 12 e 20).
2.4. O rótulo das opções de `bodySize` deixa de usar P/M/G (mostra o valor em px).
2.5. Os tokens novos aparecem na decisão Layout, junto da composição da barra, nas três fontes de token (paridade verde).

**Lote 3 — o painel diz a verdade.**
3.1. Quando o administrador edita um token que uma preferência dele mesmo sobrepõe (navegação, tamanho da fonte, modo, navegação
recolhida, largura da lateral), o painel mostra, junto do controle: "Sua preferência pessoal (<valor>) está por cima do tema" e uma
ação que apaga só aquela preferência. Teste de unidade com preferência gravada e sem.
3.2. Controle que não vale no modo atual fica desabilitado com o motivo: `navbarLayout` com navegação lateral; controles só de
Sidebar com navegação no topo (e o inverso).
3.3. Escolher `texture` com `sidebarNoiseOpacity` 0 (e o par da Topbar) aplica uma opacidade visível de padrão, ou mostra o controle de
opacidade junto; o executor escolhe a forma mais simples e diz qual no resumo. Teste: a escolha muda pixel no cromo real.
3.4. Largura da lateral: o campo respeita e mostra `sidebarMinWidth`/`sidebarMaxWidth`; valor fora do intervalo não é aceito em
silêncio.
3.5. `isNavHidden` passa a se chamar, no painel, como a preferência que ele é ("Navegação recolhida"); confira se o mesmo vale para
o rótulo de `isAutoHideEnabled`.

**Lote 4 — as barras ganham decisão própria (pedido do dono, 2026-11-12; §2, item 7).** Decisões do dono em 2026-11-12: B1 (a) e B2 (a),
registradas na §10.

4.1. **Decisão "Barras".** Fica no caminho do painel entre Componentes e Layout e reúne tudo o que é das barras:
- a orientação (lateral ou topo);
- a troca pelo usuário (4.3);
- o tom (4.2);
- os presets de Sidebar e Topbar;
- as perguntas `where`, `how`, `what`, `brand` e `behavior`;
- os tokens de barra que a `plan-165` cria (`sidebarActiveGlass`, `userAvatarStyle`) e todo token do item da barra (estilo do item
  ativo, cores, marcador). Pedido do dono (2026-11-13): tudo o que é da barra fica na configuração da barra.

O Layout fica com a largura do conteúdo e o que não for de barra. O subtítulo da decisão, na lista, resume a orientação, o tom e a
troca pelo usuário (por exemplo, "Lateral · Invertida · fixa"). Teste: cada token que hoje aparece no Layout aparece em
exatamente uma das duas decisões.

4.2. **Um controle de tom para as duas barras.** Escolher um tom grava `sidebarTone` e `topbarTone` juntos. O ajuste de uma barra
só continua no nível avançado (token por token), como hoje.
- Os presets de Sidebar e Topbar deixam de gravar tom e ficam só com estrutura (borda, item ativo, densidade, fundo, raio).
- Os presets cuja identidade é o tom (`sidebar-brand`, `sidebar-inverted`, `sidebar-gradient`, `topbar-brand`,
  `topbar-inverted`) viram opções do controle de tom ou saem, conforme o executor medir que estrutura sobra neles.
- A Personalidade que citava um preset de barra continua resolvendo. Se o tom dela vinha do preset, ela passa a gravar o tom
  das duas barras.
- Teste que reprova antes: aplicar "Invertida" pela decisão muda o fundo da Sidebar e da Topbar no cromo real.

4.3. **"O usuário pode trocar lateral/topo"**: um interruptor ao lado da orientação.
- Ligado é a posição atual do token `preferenceNavigationStylePosition` (`menu` ou `pinned`).
- Desligado é `off`.
- O controle de posição continua na pergunta `what`, para quem quer `pinned` × `menu`.

Nenhum token novo. Teste: com o interruptor desligado, uma preferência `{"navigationStyle":"sidebar"}` já gravada no navegador não
muda a orientação escolhida pelo administrador, e a escolha some da barra e do ⚙.

4.4. **Tema que declara tons diferentes** nas duas barras (B2 a): continua podendo declarar; nenhum valor de tema muda. O tom
escolhido pelo administrador na decisão grava as duas barras e vence o do tema. Teste: com um tema de tons diferentes (`sarak-sovereign-classic`),
aplicar um tom pela decisão iguala as duas barras no cromo real.

# 6. Critérios de aceite

- [ ] Topbar: todo item visível ou no "Mais", a 1440, 1280 e 1024 px, com a composição do ERP (spec que reprovava antes).
- [ ] Barra de tom contrastante: rótulo, ícone, busca, pílulas e ⚙ a 4,5:1, em dois temas e nos dois modos.
- [ ] Grupo de P/M/G e Lateral/Topo com a altura de um item; menu ⚙ com linhas; números de antes e depois no resumo.
- [ ] O ⚙ não repete o fixado na barra visível; a exceção da Sidebar recolhida continua.
- [ ] P e G configuráveis em px a partir de `bodySize`, padrão −2/+2, sem P = M nem G = M nas pontas (teste que reprovava antes).
- [ ] Painel avisa a preferência pessoal que sobrepõe o token e permite apagá-la.
- [ ] Controle que não vale no modo atual: desabilitado com motivo.
- [ ] "Textura local" muda pixel; largura fora do intervalo não é aceita em silêncio; rótulo de `isNavHidden` corrigido.
- [ ] Decisão "Barras" no caminho do painel. Todo token que estava no Layout aparece em exatamente uma das duas decisões.
- [ ] Um tom aplicado pela decisão muda o fundo da Sidebar e da Topbar no cromo real (teste que reprovava antes).
- [ ] Interruptor da troca lateral/topo: desligado, a preferência já gravada não vence e a escolha some da barra e do ⚙.
- [ ] Paridade de token verde; `docs/migracoes.md`; gerados regenerados.
- [ ] Suíte completa verde; `tsc` 0; baseline sem regressão; Anel 1.
- [ ] Prévia para o dono em `C:\tmp\sarak-previa-159\index.html` (lotes 1, 2 e 4), com capturas reais; o lote só fecha com o ok do dono nela.

# 7. Como verificar (uso do revisor)

**Gate:** teste — o spec de navegador da Topbar (itens visíveis ou no "Mais") e os testes de P/M/G nas pontas; nenhuma regra de gate
nova.

- Lote 1: o spec novo rodado sobre o código de antes (em cópia fora do repositório) e visto reprovar; `npm run build` +
  `cromo-css-real:check`; leio o caso de contraste.
- Lote 2: `git diff --stat` → só a §3.1; paridade de token; os números de largura antes/depois.
- Lote 3: testes do aviso e do controle desabilitado.
- Cada lote: `npm run verify -- --tier=full`.
- No fim, com o ERP livre (combinar com o dono): Topbar com a composição dele, Invertida aplicada e o aviso de preferência.

# 8. Destino da síntese

**Destino:** `specs/05-cromo-e-slots.md + specs/09-temas-e-presets.md + specs/06-painel-de-customizacao-e-preview.md`

- **`05`:** §2.1 (o "Mais" da Topbar, no lugar da lista que rola), §2.2.2 (o ⚙ não repete o fixado; controles compactos).
- **`09`:** §4.7 (P e G a partir de `bodySize`, configuráveis, padrão −2/+2; a tabela muda de "um degrau" para o valor em px).
- **`06`:** o aviso de preferência pessoal e o controle desabilitado no modo que não vale; a decisão "Barras" no caminho do painel
  (§2.3), o controle único de tom e o interruptor da troca lateral/topo.
- **`09`:** §4.3.4, o tom escolhido pelo administrador vale para as duas barras; o que o tema declara, conforme a B2.

---

# 9. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only: cada rodada acrescenta um bloco novo; nada é removido. -->

## Resumo da execução (lote 1) — 2026-11-16

**Resultado:** Concluído com pendências (o lote só fecha com o ok do dono na prévia, §6; e o 1.3 achou o que a plan chama de "o que reprovar": o que não é de `chromeToneStyle.ts` está em *Achados*).

**Estado do worktree ao iniciar**
```
 M specs/00-indice.md
```
(O worktree é compartilhado com as plans 161 e 164, que passaram a sujar `src/core/Design/*`, `src/features/DesignEngine/*`, `docs/migracoes.md`, `sarak-*`, `dist/sarak.css` etc. durante a execução; nada disso é meu. Não toquei em nenhum arquivo delas, exceto o trecho próprio em `docs/migracoes.md` e `src/core/i18n/catalogEntries.part2.ts`, por substituição exata.)

**O que foi feito**
- **1.1/1.2 — o "Mais".** Na topbar cada item da lista vive numa célula medida (`data-sarak-nav-cell`); o que não cabe perde a visibilidade (sai do foco e do leitor de tela, mas continua no fluxo, então a largura natural da lista não depende de quem coube e a medição não oscila) e vai para o botão "Mais" (`data-sarak-nav-more`), posicionado sobre o fim da barra, fora do fluxo. O "Mais" é um `ShellNavGroup` de verdade: botão com `aria-haspopup`/`aria-expanded`, balão com setas, Esc e Tab, e se desenha como ativo quando o item ativo está dentro (`markActive`). Grupo escondido leva os filhos dele para o balão (um nível só). `nav` horizontal passou de `overflow-x-auto` para `overflow-x-hidden` (`SarakShellNav.tsx`).
- **1.2 — spec atualizado.** `barra-de-topo-estreita.spec.ts` (cabeçalho de limites e regra: a lista não rola; o que não coube está no "Mais"); `cromo-css-real.spec.ts` ganhou uma linha: item com `visibility: hidden` não conta como visível (`readVisibleNavigationItemLabels`), senão o item escondido sob o "Mais" aparecia como "visível sem rótulo".
- **1.3 — tom contrastante.** Medição nova `tom-contrastante-legivel.spec.ts` (texto e ícone dentro da barra contra o fundo composto, 2 temas × 2 modos × 2 barras × 3 tons = 24 casos). A medição achou um defeito **meu**, no próprio "Mais" ativo (texto = fundo, 1,00:1 no estilo `filled`): `ShellNavGroup` aplicava a cor de grupo por cima do estilo de ativo; corrigido (`ShellNavGroup.tsx`). `chromeToneStyle.ts` **não mudou**: nenhum dos reprovados é o que ele refaz (ver *Achados*).
- Extrações por teto de 250 linhas (`SarakShellNav.tsx` chegou a 282): `ShellNavMore.tsx`, `ShellNavBrand.tsx` (corpo idêntico ao que estava inline), `horizontalOverflow.ts` (função pura) e `useHorizontalOverflow.ts` (medição).
- Texto `shellNavMore` nos seis idiomas (`catalogEntries.part2.ts`).
- Entrada em `docs/migracoes.md` (a topbar não rola; âncoras novas) e `npm run guide`.
- Prévia para o dono: **`C:\tmp\sarak-previa-159\index.html`** (Topbar com "Mais" a 1440/1280/1024 e o balão aberto; 24 capturas de tom). Falta o ok do dono nela.

**Arquivos alterados** (só os meus)
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/components/atomic/Navigation/SarakShellNav.tsx` | alterado | células medidas, `overflow-x-hidden`, "Mais"; marca extraída |
| `src/components/atomic/Navigation/internal/ShellNavGroup.tsx` | alterado | prop `markActive`, `data-sarak-nav-group-active`, sem cor de grupo quando marcado |
| `src/components/atomic/Navigation/internal/ShellNavMore.tsx` | criado | o botão "Mais" |
| `src/components/atomic/Navigation/internal/ShellNavBrand.tsx` | criado | a marca (extraída) |
| `src/components/atomic/Navigation/internal/horizontalOverflow.ts` | criado | `resolveOverflowStart` (pura) |
| `src/components/atomic/Navigation/internal/useHorizontalOverflow.ts` | criado | hook de medição (ResizeObserver) |
| `src/core/i18n/catalogEntries.part2.ts` | alterado | `shellNavMore` ×6 idiomas |
| `src/components/atomic/Navigation/__tests__/SarakShellNav.overflow.test.tsx` | criado | 6 casos do "Mais" no jsdom (layout simulado) |
| `src/components/atomic/Navigation/internal/__tests__/{horizontalOverflow,useHorizontalOverflow}.test.ts`, `{ShellNavMore,ShellNavBrand}.test.tsx` | criados | 1:1 dos arquivos novos |
| `browser-tests/topbar-mais.spec.ts` + `fixtures/topbar-mais-entry.tsx` | criados | 6 casos: 1440/1280/1024, teclado, ativo escondido, foco |
| `browser-tests/tom-contrastante-legivel.spec.ts` | criado | contraste 4,5:1 dos tons (24 casos) |
| `browser-tests/barra-de-topo-estreita.spec.ts` | alterado | regra nova (sem rolagem; "Mais") |
| `browser-tests/cromo-css-real.spec.ts` | alterado | item `visibility:hidden` não é visível |
| `docs/migracoes.md` (+ cópia em `sarak-ui/` via `npm run guide`) | alterado | entrada do "Mais" |

**Verificações executadas**
- `npx vitest run src/components/atomic/Navigation src/components/Layout src/core/i18n` → 67 arquivos, 716 testes verdes (antes da extração de `ShellNavMore`/`ShellNavBrand`); depois da extração, `npx vitest run src/components/atomic/Navigation` → 32 arquivos, 306 verdes.
- Navegador (harness montado do código-fonte, `npm run build:css` antes; o `globalSetup` padrão lê o `dist/index.js` antigo, então rodei com um config temporário em `browser-tests/`, já removido): `topbar-mais` + `barra-de-topo-estreita` + `tom-contrastante-legivel` + `seletor-da-barra-legivel` + `barra-lateral-anatomia` + `plan-149` + `plan-124` → 198 passam, 1 falha (ver *Achados*); `cromo-css-real` filtrado em `tablet|topbar|navegação` → 10 verdes; antes, a suíte `cromo-css-real` + `seletor-da-barra-legivel` + `raio-do-item` + `navegacao-na-base` + `busca-e-campo` + `altura-do-cromo` + `chrome-theme-identity` → 59 verdes e 1 vermelho (o do tablet, causa abaixo, corrigida).
- `npx tsc --noEmit` → sem erro. `npm run verify -- --tier=quick`: `tsc` ok, `guide:check`/`dev-kit:check`/`catalog:check` ok; falham `audit:baseline` (3 regressões, **das outras plans**: `PersonalityCatalog.tsx:26` hardcode, `OptionSampleFrame.tsx` e `CollapsibleSection.tsx` sem teste; as minhas — `SarakShellNav.tsx` com 282 linhas e `useHorizontalOverflow.ts` sem teste — foram corrigidas), `plan-index:check` (índice×frontmatter da plan-164) e `check-trail-citation` (3 `it(... (plan-35))` em `*Catalog.test.tsx` de outra plan).
- Controle em `HEAD` fora do repositório (§3 item 10), só do vermelho do `plan-149`: falha idêntica na cópia do `HEAD` (`band` transparente, `inner` magenta) → não é minha. Status do repositório idêntico antes e depois; junção removida antes de apagar (`node_modules` existe).
- **NÃO rodei** o `topbar-mais.spec.ts` sobre o código de antes para vê-lo reprovar: contra o `HEAD` ele reprova por construção (não existe `data-sarak-nav-more`), mas isso é inferência, não saída. Também não rodei a suíte completa, `build` nem `cromo-css-real:check` (são do revisor; e o `build` não deve correr junto com outro executor).

**Critérios de aceite** (lote 1)
- [x] Topbar: todo item visível ou no "Mais", a 1440, 1280 e 1024 px — `topbar-mais.spec.ts` (3 casos) e `barra-de-topo-estreita.spec.ts` (12 casos, 4 temas). Teclado (Enter abre, Esc devolve o foco), `aria-expanded` e item ativo escondido marcando o "Mais" também medidos.
- [ ] Barra de tom contrastante a 4,5:1 em dois temas e nos dois modos — **atendido só para barra sólida** (`sarak-sovereign`, `minimalist-airy`: 24/24). Não atendido em barra com degradê e no tema que declara a cor da barra (*Achados*).
- [ ] Prévia para o dono — gerada, **sem o ok** ainda.
- (Critérios de lotes 2–4: fora deste lote.)

**Decisões e suposições**
- O "Mais" lista **os filhos** de um grupo que não coube, não o pai (um nível só de aninhamento; um balão dentro de outro não existe hoje).
- A célula é `inline-flex` num `div` por item: os itens ganham um wrapper só na horizontal.
- Medição do tom **fora** do prometido pela barra: o código do idioma (60% do texto forte, 3,2–4,4:1 no topo) e o ícone de sair (vermelho misturado, 3,9:1) ficam fora do filtro do spec; saem em *Achados*. O critério da plan nomeia rótulo, ícone, busca, pílulas e ⚙.
- `dist/` não foi reconstruído (a regra do revisor é `build` só na verificação do lote); o spec novo monta a própria folha de estilo da fonte, como `plan-124-sidebar-contrast.spec.ts`.
- `npm run dev-kit` não foi rodado: `dev-kit:check` já estava em dia e o gerador recontaria números com o código das outras plans em voo.

**Achados fora do escopo (não corrigidos)**
- **Tema que declara a cor da barra vence o tom do host** (`sarak-sovereign-classic` claro: `sidebarColor: '#ddeced'`, linha 320 do tema; texto do tom fica claro sobre fundo claro, 1,0:1 a 3,0:1). É exatamente o 4.4 desta plan (lote 4); não mexi.
- **Barra em degradê, modo claro** (`nebula-space`, `cyberpunk-neon`, `corporate-ledger`, `industrial-terminal`; no `industrial-terminal` também a lateral): a pílula P/M/G leva `bg-[--theme-muted]/10` (`ShellFontSizeControl.tsx:31`, `ShellNavigationStyleControl.tsx:30`), um véu do texto claro sobre a parada clara do degradê (3,4–4,4:1), e o item ativo em véu a 20% idem. É o controle que o lote 2 refaz; o item ativo sobre degradê é da paleta (`tone-plan.ts`, pares de degradê).
- `SarakShellLanguageSelector.tsx:~126` (código do idioma a 60% do texto forte) e `SarakShellUserWidget.tsx:19` (`LOGOUT_TEXT`, vermelho misturado a `--sarak-on-surface`): 3,2–4,4:1 e 3,9:1 sobre a barra contrastante.
- `browser-tests/plan-149-barras-personalidade.spec.ts:216` ("marca: o fundo pinta a faixa inteira…") falha no `HEAD` limpo: `[data-sarak-sidebar-header]` sem fundo e o bloco de dentro com magenta.
- O gancho de escrita acusa "sem config do eslint na raiz" a cada arquivo escrito (aviso do repositório, não da tarefa).

**Pendências / riscos**
- Ok do dono na prévia (`C:\tmp\sarak-previa-159\index.html`) antes de fechar o lote.
- O revisor precisa de `npm run build` + `cromo-css-real:check` para as specs de navegador da `plan-159` rodarem pelo caminho oficial: `barra-de-topo-estreita.spec.ts` e `cromo-css-real.spec.ts` usam `dist/index.js`, e o `dist/` atual não tem o "Mais" (rodam vermelhos até o build).
- Risco de medição: o "Mais" só tem `ResizeObserver` no navegador; em fonte web que carrega depois, o observador das células recalcula, mas não medi troca de fonte.

## Resumo da execução (lote 2) — 2026-11-17

**Resultado:** Concluído com pendências (o lote só fecha com o ok do dono na prévia, §6; ver *Pendências*).

**Estado do worktree ao iniciar**
```
 M dist/sarak.css
```
(O worktree é compartilhado com a `plan-161`, que mexe em `src/features/DesignEngine/Canvas/*` e em specs de navegador dela durante esta execução. Não toquei nesses arquivos. `docs/migracoes.md`, `sarak-ui/` e `sarak-dev/` são compartilhados: o que é meu em `docs/migracoes.md` é a entrada "P e G do tamanho da fonte configuráveis em px…", no topo.)

**O que foi feito**
- **2.3 — P e G em px a partir de `bodySize`.** `overlayPreferences.ts` deixa de usar a escala fixa de cinco degraus: P = `bodySize` − `preferenceFontSizeReduction`, G = `bodySize` + `preferenceFontSizeIncrease` (padrão 2 px cada), com piso de 8 px; valor inválido nos tokens cai em 2 px; base que não é px volta como veio. Base 12 → P 10 (≠ M); base 20 → G 22 (≠ M).
- **2.3/2.5 — dois tokens novos, nas três fontes.** `preferenceFontSizeReduction` e `preferenceFontSizeIncrease` (slider, px, 0–6, passo 1, padrão 2): schema `schema/preferences.ts`, partição `catalog/partitions/structural.json`, roteamento `catalog/theme_table_mapping.json`; `npm run token-types` regenerou `design-token-ids.ts` e `design-token-docs.json`. Entram na decisão Layout, na pergunta "O que aparece" (`design-decisions.json`), com os testes de contagem atualizados (10→12, 9→11).
- **2.4 — rótulo de `bodySize`** passa a `12 px … 20 px` (`schema/global.ts`), e o `usage` diz como P e G partem dele.
- **2.1 — controles compactos.** Novo `internal/ShellPreferenceChoiceGroup.tsx`, usado por `ShellFontSizeControl` e `ShellNavigationStyleControl` (props novas `variant: 'bar' | 'menu'` e `orientation`). Na barra: grupo sem véu de fundo, com a altura de um item de navegação (28 px = 28 px medido). No ⚙ e na gaveta: linhas de menu (`role="menuitemradio"`, `aria-checked`, visto na escolhida), não pílulas. `shellPreferenceRow.tsx` passa a usar a variante `menu`; `ChromeSidebarFooter.tsx` usa o grupo vertical.
- **2.2 — o ⚙ não repete o fixado.** `ChromeTopbarBody.tsx`: `menuIdsToShow` (menu − fixados) e busca/usuário/notificações no menu só se não estiverem fixados; o ⚙ não nasce se nada sobra. Era assim também com a busca ("Buscar" fixo na barra e dentro do ⚙). A exceção da lateral recolhida já existia em `ChromeSidebarBody.tsx` e não mudou.
- **Contraste sobre degradê (nota do revisor).** O grupo novo não tem véu; a opção não escolhida lê `--sarak-text-main` (a primeira versão usava o apagado do item inativo e reprovou a 3,16:1 na lateral `nebula-space` claro). Medido a 4,5:1 sobre cada parada do degradê em `nebula-space` e `corporate-ledger`, claro, nas duas barras (4 casos novos em `tom-contrastante-legivel.spec.ts`).
- **Métrica compartilhada.** As classes do item horizontal saíram de `SarakMenuItem.tsx` para `menuItemMetrics.ts` (`HORIZONTAL_MENU_ITEM_CLASSES`, `horizontalMenuItemBlockPadding`), para o grupo da barra ler a mesma fonte que o item.
- `docs/migracoes.md` (entrada nova, com os números medidos), `npm run guide`, `npm run dev-kit`.
- **Prévia:** `C:\tmp\sarak-previa-159\index.html` (a do lote 1 ficou em `index-lote1.html`; sem escrever no `dist/`). Composição de fábrica e composição fixada do ERP, nos dois modos, sobre barra em degradê (`nebula-space` e `corporate-ledger`), com antes (`HEAD`) e depois lado a lado, e o ⚙ aberto.

**Medidas (Chromium, 1440 px, tema padrão; antes = cópia do `HEAD` fora do repositório)**
| | Antes | Depois |
|---|---|---|
| Item de navegação da topbar | 57,3 × 28 | 57,3 × 28 |
| Grupo P/M/G fixado | 146,3 × 62 | 99,9 × 28 |
| Grupo Lateral/Topo fixado | 152,7 × 62 | 117,2 × 28 |
| Menu ⚙, composição de fábrica | 306,3 × 510,5 | 159,4 × 310,5 |
| Menu ⚙, composição fixada do ERP | 306,3 × 510,5 | 159,4 × 61 |

**Arquivos alterados** (só os meus)
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/core/Provider/utils/overlayPreferences.ts` | alterado | P/G em px a partir de `bodySize`, piso, leitor `bodySize direto` |
| `src/core/Design/schema/preferences.ts`, `global.ts` | alterado | dois tokens novos; rótulo de `bodySize` |
| `src/core/Design/catalog/partitions/structural.json`, `theme_table_mapping.json` | alterado | os dois tokens nas outras duas fontes |
| `src/core/Provider/generated/design-token-ids.ts`, `design-token-docs.json` | gerado | `npm run token-types` |
| `src/features/DesignEngine/config/design-decisions.json` | alterado | tokens na pergunta "O que aparece" |
| `src/components/atomic/Navigation/internal/ShellPreferenceChoiceGroup.tsx` | criado | grupo da barra e linhas do menu |
| `ShellFontSizeControl.tsx`, `ShellNavigationStyleControl.tsx`, `shellPreferenceRow.tsx`, `menuItemMetrics.ts`, `SarakMenuItem.tsx` | alterado | usam o grupo; variante `menu`; métrica horizontal compartilhada |
| `src/components/Layout/chrome/ChromeTopbarBody.tsx`, `ChromeSidebarFooter.tsx` | alterado | o ⚙ não repete o fixado; grupo vertical na lateral |
| Testes: `ShellPreferenceChoiceGroup.test.tsx` (criado), `ShellFontSizeControl`, `ShellNavigationStyleControl`, `shellPreferenceRow`, `menuItemMetrics`, `ChromeTopbarBody`, `overlayPreferences`, `preferences` (schema), `ThemeGlobalSettings`, `ThemeDecisionView`, `useThemeCustomizationData`, `decisions`, `dynamic-categories` | alterado | casos novos e contagens |
| `browser-tests/preferencias-discretas.spec.ts` | criado | altura do grupo, ⚙ sem repetição, menu com linhas |
| `browser-tests/tom-contrastante-legivel.spec.ts` | alterado | 4 casos de contraste dos grupos sobre degradê; limite 2 e cabeçalho atualizados |
| `docs/migracoes.md`, `sarak-ui/*`, `sarak-dev/*` | alterado | entrada e kits regenerados |
| `dist/*`, `src/buildInfo.ts`, `src/core/Provider/buildInfo.ts` | gerado | efeito do `npm run build` que o prompt mandou rodar |

**Verificações executadas**
- `npx vitest run` por pasta, em rodadas separadas do Playwright: `src/components/atomic/Navigation` + `src/components/Layout` → 64 arquivos, 679 verdes (depois da última edição); `src/core/Provider` → 76 arquivos, 688; `src/core/Design` → 51 arquivos, 1.153; `src/features/DesignEngine/Main` + `utils` → 62 arquivos, 478 verdes. A rodada inteira de `src/features/DesignEngine`, antes dos ajustes, deu 7 vermelhos: 4 eram meus (contagens de tokens em `decisions`, `dynamic-categories`, `ThemeDecisionView`, `useThemeCustomizationData`/`ThemeGlobalSettings`) e foram corrigidos; os outros ficam em *Achados*.
- `npx tsc --noEmit` → 0 erros. `npm run verify -- --tier=quick` → `tsc`, `audit:baseline --with-tsc`, `barrel`, `catalog`, `token-types`, `token-docs`, `token-reader`, `chrome-token-parity`, `guide:check`, `dev-kit:check`, Anel 0 verdes; falham `css-important:check` (`PresetCard.tsx:28`) e `plan-index:check` (`plan-161`: índice 🟡 × frontmatter 🟠), das duas, da `plan-161`. A primeira passada acusou 3 hardcodes estruturais meus (`ShellPreferenceChoiceGroup.tsx`), corrigidos.
- `npm run build` → exit 0 (todas as portas do `build`, inclusive `token-types:check`, `token-docs:check` e `guide:check`).
- Navegador, com o `dist/` novo e depois do build: `topbar-mais`, `barra-de-topo-estreita`, `cromo-css-real`, `tom-contrastante-legivel` (24 + 4 casos), `plan-141-presets-do-painel` inteiro e `preferencias-discretas` → **109 de 109 verdes**. A medição de contraste sobre degradê reprovou na primeira versão do grupo (3,16:1) e passou depois da correção.
- Controle em `HEAD` fora do repositório (cópia `git archive` + junção de `node_modules`) só para os números de "antes"; junção removida antes de apagar, `node_modules` existe.

**Critérios de aceite** (lote 2)
- [x] Grupo de P/M/G e Lateral/Topo com a altura de um item; menu ⚙ com linhas; números de antes e depois acima — `preferencias-discretas.spec.ts:57` e a tabela.
- [x] O ⚙ não repete o fixado na barra visível; a exceção da lateral recolhida continua — `preferencias-discretas.spec.ts:68`, `ChromeTopbarBody.test.tsx`; lateral recolhida: `ChromeSidebarBody.tsx:101` (inalterado).
- [x] P e G configuráveis em px a partir de `bodySize`, padrão −2/+2, sem P = M nem G = M nas pontas — `overlayPreferences.test.ts` (base 12 e 20).
- [x] Controle novo a 4,5:1 sobre barra em degradê, claro — `tom-contrastante-legivel.spec.ts` (nebula-space e corporate-ledger, as duas barras).
- [x] Paridade de token verde (`token-types`, `token-docs`, `token-reader`, `catalog`, `barrel`, `build`); `docs/migracoes.md`; gerados regenerados.
- [ ] Prévia para o dono em `C:\tmp\sarak-previa-159\index.html` — gerada; **falta o ok do dono**.

**Decisões e suposições**
- Nomes dos tokens: `preferenceFontSizeReduction` e `preferenceFontSizeIncrease` (a plan não os nomeou). Slider de 0 a 6 px, passo 1; piso de 8 px no resultado do P (suposição: abaixo disso o texto some).
- O ⚙ do topo não repetir o fixado foi feito em `ChromeTopbarBody.tsx`, como já era no `ChromeSidebarBody.tsx`, e não em `useChromeDefaultWidgets.ts` (que não está na §3.1). Vale também para busca, usuário e notificações.
- A opção não escolhida lê `--sarak-text-main`, e não o token do rótulo do item inativo: o apagado reprovou sobre degradê (3,16:1). Custo: sem o apagado, a hierarquia da opção escolhida vem só do fundo.
- Os dois tokens ficaram na pergunta "O que aparece" da decisão Layout (a §2.5 diz "junto da composição da barra"); a decisão "Barras" é do lote 4 e os move.
- Não toquei `ChromeUserThemeGroup.tsx` nem `chromeWidgets.ts` (§3.1 os lista, mas nada precisou mudar neles). O texto da `05` §2.2.2 ("e também dentro do ⚙") fica para a síntese.
- A gaveta do celular (`SarakAppChromeMobile`) usa `renderShellPreferenceRow`, então também ganha as linhas com seleção; não a mexi além disso.
- `npm run build` reescreveu `dist/` (rastreado) e os dois `buildInfo.ts`; o prompt mandou rodá-lo, e o `dist/sarak.css` já vinha sujo antes (fotografia). A prévia não escreveu no `dist/`.

**Achados fora do escopo (não corrigidos)**
- `src/features/DesignEngine/Canvas/components/PresetCard.tsx:28` — `!important` montado em TypeScript (`css-important:check` vermelho); `plan-161`, em voo.
- Rodada de `src/features/DesignEngine`, antes dos meus ajustes: `PreviewCanvas.test.tsx` (snapshot de width/height), `AtmosphereCatalog.test.tsx` (snapshot) e `PresetsCatalog.test.tsx` (snapshot e `@min-[240px]:grid-cols-2`) vermelhos. Os arquivos são da `plan-161` (`PresetsCatalog.tsx`, `OptionSampleFrame.tsx`…, modificados na fotografia durante a execução); não rodei controle em `HEAD` para eles, então a causa é inferência.
- `plan-index:check`: `plan-161` com índice 🟡 e frontmatter 🟠.
- O gancho de escrita acusa "sem config do eslint na raiz" a cada arquivo (aviso do repositório).

**Pendências / riscos**
- Ok do dono na prévia antes de fechar o lote (§6).
- O grupo fixado na barra não tem mais o véu: em barra de papel `surface` o grupo se distingue só pelo contorno de 1 px e pelo fundo da escolhida. Medi contraste de texto, não "legibilidade como controle".
- Instalação que gravou `preferenceFontSizePosition: pinned` (ERP) passa a ver o grupo compacto sem mudar nada (a plan não pede migração do valor gravado).
- Não medi densidades `compact`/`spacious` do item da topbar nem a lateral recolhida em navegador (limites 1 e 2 do spec novo).

## Resumo da execução (lote 3) — 2026-11-17

**Resultado:** Concluído com pendências (o lote só fecha com o ok do dono na prévia).

**Estado do worktree ao iniciar**
```
 M src/core/Design/catalog/partitions/colors_and_atmosphere.json
 M src/core/Design/catalog/theme_table_mapping.json
 M src/core/Design/presets/themes/compose.ts
 M src/core/Design/schema/colors.ts
 M src/core/Provider/generated/design-token-docs.json
 M src/core/Provider/generated/design-token-ids.ts
 M src/core/Provider/utils/validation.ts
 M src/core/i18n/catalog.ts
 M src/features/DesignEngine/Main/components/BrandShortcut.tsx
 M src/features/DesignEngine/Main/components/PaletteCreator.tsx
 M src/features/DesignEngine/Main/components/PaletteGallery.tsx
 M src/features/DesignEngine/Main/components/PaletteSection.tsx
 M src/features/DesignEngine/Main/components/ThemeDecisionView.tsx
 M src/features/DesignEngine/Main/hooks/useBrandForm.ts
 M src/features/DesignEngine/utils/decisions.ts
?? browser-tests/_probe164.spec.ts
?? src/core/Design/palette/savedPalettes.ts
?? src/core/i18n/catalogEntries.paletteSaved.ts
?? src/features/DesignEngine/Main/hooks/useSavedPalettes.ts
```
(Compartilhado com as plans 161 e 164, que sujaram outros arquivos durante a execução; não os toquei. Em `catalog.ts` acrescentei só o import e o spread de `CATALOG_TOKEN_NOTES`; `ThemeDecisionView.tsx` não foi editado por mim.)

**O que foi feito**
- **3.1** `DecisionTokenRow.tsx` (novo, usado por `DecisionTokenList.tsx`): aviso "Sua preferência pessoal (<valor>) está por cima do tema" e ação "Apagar minha preferência" (`updatePreferences({ chave: undefined })`, apaga só aquela chave). Lógica em `utils/tokenNotes.ts` (`personalOverrideOf`): `navigationStyle`, `bodySize`, `mode`, `isNavHidden`, `sidebarWidth`; só avisa se o tema oferece a preferência (régua de `overlayPreferences`; largura só com `sidebarResizable`).
- **3.2** Controle que declara `interactsWith: ['navigationStyle']` fica num `<fieldset disabled>` com o motivo quando a orientação do rascunho é a outra (`orientationOf`/`requiredOrientationIfInactive`).
- **3.3** Já resolvido no `HEAD` (`noiseTexture.ts`: `max(var(opacidade), 0.12)` com textura, na barra do topo e na lateral). Não mudei o cromo; `browser-tests/textura-muda-pixel.spec.ts` mede a captura sólida × textura com ruído 0 (e a repetição sólida idêntica, como controle).
- **3.4** `sidebarWidthRange`/`withEffectiveBounds`: o slider da largura nasce com o intervalo token × `sidebarMinWidth`/`sidebarMaxWidth` do dispositivo da prévia e mostra "Entre X e Y px".
- **3.5** `isNavHidden`: "Ocultar Navegação" → "Navegação recolhida" (schema, partição do catálogo e gerados). `isAutoHideEnabled` mantém o rótulo (esconde a navegação até o ponteiro chegar à borda; é outra coisa); a descrição, no schema e na partição, deixou de dizer "recolhe".
- Textos em `catalogEntries.tokenNotes.ts` (seis idiomas, só chaves novas). `docs/migracoes.md`, `npm run guide`, `npm run dev-kit`.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/features/DesignEngine/utils/tokenNotes.ts` | criado | lógica pura das notas |
| `src/features/DesignEngine/Main/components/DecisionTokenRow.tsx` | criado | linha com aviso, desabilitado e intervalo |
| `src/features/DesignEngine/Main/components/DecisionTokenList.tsx` | alterado | usa `DecisionTokenRow` |
| `src/core/i18n/catalogEntries.tokenNotes.ts`, `catalog.ts` | criado/alterado | textos novos |
| `src/core/Design/schema/navigation.ts`, `system.ts`, `catalog/partitions/layout_and_navigation.json`, `branding_config.json` | alterado | rótulo e descrições |
| `src/core/Provider/generated/design-token-*` | gerado | `npm run token-types` |
| `utils/__tests__/tokenNotes.test.ts`, `Main/components/__tests__/DecisionTokenRow.test.tsx` | criado | 17 casos |
| `browser-tests/painel-avisa-a-verdade.spec.ts` + `fixtures/painel-avisa-entry.tsx` | criado | 6 casos em navegador |
| `browser-tests/textura-muda-pixel.spec.ts` | criado | 4 casos |
| `browser-tests/fixtures/topbar-mais-entry.tsx` | alterado | param `nav=sidebar` |
| `docs/migracoes.md`, `sarak-ui/*`, `sarak-dev/*` | alterado | entrada e kits |

**Verificações executadas**
- `npx vitest run src/features/DesignEngine/Main src/features/DesignEngine/utils src/core/i18n src/core/Design/schema src/core/Design/catalog` → 189 arquivos, 640 testes verdes (JSON). Uma rodada anterior, sob carga, deu 19 falhas por timeout de 5 s em `PaletteSection.test.tsx` (da plan 164); não se repetiu.
- Navegador (config temporário, já removido): `painel-avisa-a-verdade` 6/6, `textura-muda-pixel` 4/4.
- `token-types`, `token-docs:check`, `catalog:check`, `token-reader:check` verdes. `tsc --noEmit`: um erro, em `src/core/i18n/presetTexts/textures.ts:58` (outra plan, em edição); nenhum nos meus arquivos.
- NÃO rodei: suíte completa, `verify --tier=quick`, `build`, nem o spec de textura contra o código de antes (o `HEAD` já tem o piso).

**Critérios de aceite (lote 3)**
- [x] Aviso de preferência pessoal com ação que a apaga — `DecisionTokenRow.test.tsx`, `painel-avisa-a-verdade.spec.ts:61`.
- [x] Controle que não vale fica desabilitado com motivo — spec `:77` e `:85`.
- [x] "Textura local" muda pixel — `textura-muda-pixel.spec.ts`.
- [x] Largura respeita e mostra o intervalo — spec `:92`.
- [x] Rótulo de `isNavHidden` corrigido — spec `:101`.
- [ ] Prévia: `C:\tmp\sarak-previa-159\index.html` (a do lote 2 em `index-lote2.html`) — falta o ok do dono.

**Decisões e suposições**
- Desabilito pelo `navigationStyle` do rascunho, mesmo com a troca lateral/topo oferecida ao usuário (leitura literal do 3.2).
- Escopo do desabilitar = só token que declara `interactsWith: ['navigationStyle']` (6 tokens hoje), não todo `sidebar*`/`topbar*`; os demais valem também em gaveta/celular.
- 3.3: sem mudança de código; defeito medido no v8.0.0 já não existe no `HEAD`.
- Mexi nas partições `layout_and_navigation.json` e `branding_config.json` (fora da lista da §3.1) porque o rótulo/descrição do catálogo vencem os do schema.
- Fixture compartilhado `topbar-mais-entry.tsx` ganhou o param `nav`.

**Achados fora do escopo (não corrigidos)**
- `src/core/i18n/presetTexts/textures.ts:58` com erro de sintaxe no worktree (plan 161/164, em voo).

**Pendências / riscos**
- Ok do dono na prévia.
- Sem recarga em runtime: apagar a preferência pelo painel depende do Provider reidratar; no navegador o `localStorage` foi conferido, o efeito na barra não.
- A nota de preferência só aparece nos controles renderizados por `DecisionTokenList` (não nos resultados da busca).

---

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->

## Nota do revisor — 2026-11-12 — lote 4 acrescentado a pedido do dono; duas decisões antes dele

O dono pediu uma categoria própria para as barras, com o tom valendo para as duas e um interruptor da troca lateral/topo (§2, item
7). Entra aqui como lote 4 porque esta plan já é dona do cromo e do painel de Layout. Os lotes 1 a 3 não mudam. O lote 4 roda
depois do 3, porque o 3.2 desabilita controles por orientação e o 4.1 reorganiza onde eles moram.

**B1 — onde fica a largura do conteúdo.**
- **(a) Recomendado:** a decisão nova "Barras" e o Layout continua com a largura do conteúdo e o resto que não é barra. Mexe
  menos, e a `plan-161` reavalia se o Layout magro se funde a Forma.
- (b) Renomear Layout para "Barras" e mover a largura do conteúdo para Forma: uma decisão a menos, mas a largura do conteúdo
  não é forma.

**B2 — tema que declara tons diferentes nas duas barras** (8 dos 26, §2, item 7).
- **(a) Recomendado:** o tema continua podendo declarar. É a cara de alguns temas, conferida contra as fotos na `plan-162`
  (Dot Matrix com a barra pintada, Sovereign Classic com a lateral invertida). A regra "vale para as duas" é a da escolha do
  administrador: tom escolhido no painel grava as duas barras e vence o do tema.
- (b) Todo tema usa um tom só nas duas barras: 8 temas mudam de visual, e o Sovereign Classic e o Cyberpunk Neon deixam de ter a
  lateral clara no escuro.

Se o que incomoda no ERP é justamente a lateral clara no tema escuro, ela vem do tema declarado (Sovereign Classic e Cyberpunk Neon)
ou de resto gravado (`plan-158`). Com B2 (a), o administrador a desfaz com um clique no tom; com B2 (b), ela some do tema.

**A `plan-161`** (vocabulário e tamanho de cada decisão) passa a ter uma decisão a mais; ela já depende da 160, que roda depois da 158.

## Decisão do dono — 2026-11-12 — B1 (a) e B2 (a)

- **B1 (a):** decisão nova "Barras"; o Layout continua com a largura do conteúdo e o que não for de barra. A `plan-161` reavalia se o
  Layout se funde a Forma.
- **B2 (a):** o tema continua podendo declarar tons diferentes nas duas barras; o tom escolhido pelo administrador grava as duas e vence
  o do tema.

O lote 4 está decidido e roda depois do lote 3.

## Nota do revisor — 2026-11-12 — prévia HTML para o dono aprovar

A pedido do dono, como nas campanhas anteriores: ao fim de lotes 1, 2 e 4, o executor gera `C:\tmp\sarak-previa-159\index.html`
com capturas reais do `dist/` ou do código-fonte (como as prévias da 136 a 149), mostrando a Topbar com "Mais" a 1440, 1280 e 1024 px; cada tom nas duas barras em dois temas e nos dois modos; as preferências compactas na barra e no ⚙ (antes e depois); a decisão "Barras" com o interruptor ligado e desligado. O resumo do lote dá o caminho.
O revisor confere a prévia antes do veredito, e o lote só fecha com o ok do dono nela (critério acrescentado à §6). A projeção da
campanha inteira, feita à mão, está em `C:\tmp\sarak-previa-campanha-9\index.html`: é referência de intenção, não de pixel.

## Nota do revisor — 2026-11-13 — a `plan-165` roda antes desta e muda três pontos

O dono pediu de volta a anatomia da barra lateral da lib antiga (`plan-165`). Ela mexe nos mesmos arquivos do cromo e roda antes
desta plan. O que muda aqui:
- **§2, "não se toca":** o item ativo, o ícone, o raio, a marca e o rodapé saíram da lista. São da 165.
- **Lote 2:** a composição padrão já vem decidida pela 165 (D4 dela). Na barra ficam busca, seta de recolher, idioma, notificações e
  usuário; no ⚙ ficam modo claro/escuro, P/M/G e lateral/topo. O 2.1 desta plan cuida da **forma** desses controles (linhas de menu
  com seleção dentro do ⚙; grupo compacto quando o sistema os fixa na barra). Siga a métrica de linha que a 165 der ao rodapé.
- **Lote 1, 1.3 (contraste do tom):** meça sobre a anatomia da 165 (fundo do ativo quase invisível, marcador na primária).

Os lotes 1 a 4 seguem com o resto do escopo.

## Nota do revisor — 2026-11-16 — as plans citadas foram sintetizadas

As `plan-158`, `plan-160`, `plan-163` e `plan-165` foram sintetizadas e removidas. Toda citação a elas nesta plan passa a valer
pela spec fixa:
- `plan-158` → [[09-temas-e-presets]] §4.3.3 e §4.4.1–4.4.2 (o que se grava), [[06-painel-de-customizacao-e-preview]] §4 e §4.1 (sair com rascunho, desempenho) e o ADR-026.
- `plan-160` → [[06-painel-de-customizacao-e-preview]] §2.4, §6.2–6.6 (a prévia, a espiada, as telas por grupo).
- `plan-163` → [[09-temas-e-presets]] §4.3.4 e §5 (paletas, régua de deslocamento, contraste).
- `plan-165` → [[05-cromo-e-slots]] §2.1.4, §2.2 e §2.4 (anatomia da barra lateral) e [[09-temas-e-presets]] §4.3.4 (faixas da marca).

O código delas está no `HEAD`. Ao executar, leia a spec fixa, e não a plan. `depende_de` fica vazio: nada mais bloqueia esta
plan por dependência de outra plan.

## Veredito — 2026-11-17 — lote 1 — 🟢 Aprovado no código; o lote fecha com o ok do dono na prévia

**Como medi:** numa cópia fora do repositório (`git archive HEAD` com junção de `node_modules`). Primeiro só o spec novo; depois
os 17 arquivos desta plan, sem nada das plans 161 e 164, com `npm run build` completo na cópia.
- **O spec novo reprova antes:** `topbar-mais.spec.ts` no `HEAD` dá 6 de 6 vermelhos. O `HEAD` não tem o "Mais"; a falha é
  estrutural, e é o que a §7 pede ver.
- **Navegador, `HEAD` + esta plan:** 14 specs que abrem a topbar ou a navegação (`cromo-css-real`, `barra-de-topo-estreita`,
  `topbar-mais`, `tom-contrastante-legivel`, `seletor-da-barra-legivel`, `barra-lateral-anatomia`, `plan-149`, `plan-141`,
  `plan-145`, `altura-do-cromo`, `raio-do-item-de-menu`, `pagina-com-atmosfera`, `arsenal-lote6`, `residuo-da-reauditoria`):
  **282 de 282 verdes**. O `plan-149:216` que o resumo dá como "falha no `HEAD` limpo" passa: no `HEAD` a folha `dist/sarak.css`
  commitada é a antiga, e foi ela que falhou, não o produto.
- **Unidade:** `npx vitest run src/components/atomic/Navigation src/components/Layout src/core/i18n` → 70 arquivos, 725 verdes.
- **Gates do commit** (Anel 1 inteiro e `check-audit-baseline --with-tsc`) na mesma cópia: verdes, baseline sem regressão. O
  `trail-citation:check` foi rodado no worktree real e está verde. O padrão de segredo, sobre as linhas adicionadas, dá 0.
- **Diff lido:** `SarakShellNav.tsx`, `ShellNavGroup.tsx` e os quatro arquivos novos. O item escondido fica no fluxo com
  `visibility: hidden` (sai do foco e do leitor de tela), e o "Mais" é um `ShellNavGroup` com `markActive`. A marca foi extraída sem
  mudar o corpo. A entrada em `docs/migracoes.md` diz o que muda para o importador.

**Critérios do lote 1**
- [x] Topbar: todo item visível ou no "Mais" a 1440, 1280 e 1024 px; teclado, `aria-expanded` e ativo escondido medidos.
- [x] Tom contrastante a 4,5:1 em dois temas e nos dois modos: 24 de 24, com `chromeToneStyle.ts` sem mudança.
  - O 1.3 pede "dois temas", e a medição usa dois temas de barra sólida.
  - O tema que declara a cor da barra é o 4.4 desta plan.
  - O resto foi para o backlog (88).
- [ ] Prévia: `C:\tmp\sarak-previa-159\index.html`, conferida. Falta o ok do dono.

**Para o lote 2:** a pílula P/M/G e Lateral/Topo em véu (`bg-[--theme-muted]/10`) fica entre 3,4 e 4,4:1 sobre a parada clara de barra
em degradê, no modo claro. O 2.1 refaz esses controles. Meça o controle novo também sobre uma barra em degradê
(`nebula-space` ou `corporate-ledger`, claro).

**Commit:** espera a `plan-164`. As duas dividem `docs/migracoes.md` e os kits `sarak-ui/` e `sarak-dev/`, e saem juntas quando a
164 fechar a correção.

**Status da plan: 🟠 Em revisão** até o ok do dono na prévia; depois, 🟡 para o lote 2.

## Veredito — 2026-11-17 — lote 1, prévia — 🔵 Em correção (três ajustes que a prévia mostrou)

O dono viu a prévia (`C:\tmp\sarak-previa-159\index.html`) e perguntou se P/M/G e Lateral/Topo tinham voltado para a barra.
- **Não voltaram.** O padrão de fábrica continua `menu` (no ⚙), em `schema/preferences.ts`.
- A prévia só mostra a composição `pinned` do ERP, que o 1.1 exige, e não diz isso de um jeito que se veja.

Os ajustes são recomendação do revisor, e o dono os aprova ao enviar o prompt de correção. O código aprovado no veredito anterior
não muda além disto.
1. **O "Mais" logo depois do último item visível.** Hoje ele fica no fim da área da lista (`ShellNavMore.tsx`, posição absoluta no
   fim do `nav`), e sobra um vão entre o último item e ele: cerca de 90 px a 1440 e de 110 px a 1280.
   - Critério: o "Mais" começa a um vão de item (`--sarak-layout-gap-sm`) do último item visível.
   - A medição continua sem oscilar.
   - `topbar-mais.spec.ts` ganha a medida desse vão nas três larguras.
2. **O ícone do "Mais" sai.** Com o peso de ícone padrão (`iconWeight: fill`), o `DotsThree` do Phosphor desenha um retângulo
   cheio com pontos, que parece um teclado. O botão fica "Mais ▾", só com texto e a seta, que já dizem o que ele é.
3. **A prévia distingue as duas composições.** No topo da seção 1, uma linha diz que as capturas usam a composição fixada do ERP.
   Acrescente a Topbar com a composição de fábrica (P/M/G, Lateral/Topo e modo no ⚙), a 1440, 1280 e 1024 px.

**Como fechar:** `topbar-mais.spec.ts` e `barra-de-topo-estreita.spec.ts` verdes, e a prévia nova. O revisor reroda esses dois specs e
leva a prévia ao dono.

**Status da plan: 🔵 Em correção.**

## Resumo da correção (lote 1, prévia) — 2026-11-17

Os três ajustes do veredito de 2026-11-17, e nada além.
1. **"Mais" logo depois do último item visível.** `useHorizontalOverflow` agora devolve `{ start, moreStart }`; `moreStart` vem de
   `resolveMoreStart` (borda direita do último item que ficou + `--sarak-layout-gap-sm`, que é o `column-gap` do `nav`).
   `ShellNavMore` recebe `start` e se posiciona com `insetInlineStart` (largura `w-max`). Continua fora do fluxo, então a largura
   natural da lista não muda e a medição não oscila.
2. **Ícone do "Mais" removido.** Fica o texto e a seta do grupo.
3. **Prévia** (`C:\tmp\sarak-previa-159\index.html`): linha de aviso no topo da seção 1 dizendo que 1.A usa a composição fixada do
   ERP; seção 1.B nova com a composição de fábrica (P/M/G, Lateral/Topo e modo no ⚙) a 1440, 1280 e 1024 px. As capturas da
   Topbar foram refeitas com o código novo.

**Verificação:** `topbar-mais.spec.ts` (ganhou a medida do vão e a do ícone nas três larguras) e `barra-de-topo-estreita.spec.ts`:
21 de 21 verdes, com o harness montado do código-fonte. `npx vitest run src/components/atomic/Navigation src/components/Layout src/core/i18n`:
70 arquivos, 728 verdes. `tsc --noEmit`: 0 erros. `docs/migracoes.md` ajustada (posição e ausência de ícone).
**Limite:** os specs rodaram contra o código-fonte, não contra `dist/` (que outro executor reconstruía); o revisor reroda com o build dele.

## Veredito — 2026-11-17 — lote 1, correção da prévia — 🔵 Em correção (um defeito de medida)

**Como medi (as três correções juntas):** numa cópia fora do repositório com o worktree inteiro (plans 159, 161 e 164), com
`npm run build` completo:
- navegador: `topbar-mais`, `barra-de-topo-estreita`, `plan-141-presets-do-painel` inteiro, `plan-161-catalogo-proporcional`,
  `login-theme-application`, `plan-122-preview-mode`, `plan-160-previa-mostra-a-opcao`, `plan-160-moldura-e-largura`,
  `troca-de-tema` e `css-que-so-o-navegador-mede` → **100 de 100 verdes**;
- unidade: `npx vitest run src/features/DesignEngine src/components/atomic/Navigation src/components/Layout src/core/Provider
  src/core/Design`, com a máquina livre → **340 arquivos, 3.408 verdes**;
- gates do hook (Anel 1 e auditoria) no worktree real: verdes, baseline sem regressão.

Os três ajustes da prévia estão feitos. O "Mais" vem a um vão do último item, sem ícone, e cabe um item a mais a 1280. A prévia
separa a composição fixada do ERP da de fábrica. Conferi as capturas.

**Achado**
1. **`useHorizontalOverflow.ts` mistura duas unidades.** As caixas da barra e dos itens vêm de `getBoundingClientRect()`, em px
   de tela, já com o `transform` dos ancestrais. O padding e o vão vêm de `getComputedStyle`, em px de layout, sem escala.
   - Onde aparece: em barra reduzida por `transform: scale`, como as amostras de Topbar do painel (`OptionSampleFrame` da
     `plan-161`).
   - O que acontece: a área útil encolhe demais, e itens que cabem vão para o "Mais".
   - O `moreStart`, medido em px de tela, é aplicado como `insetInlineStart` em px de layout, e o "Mais" cai fora do lugar.
   - Quem achou: o executor da `plan-161`, que mediu uma escala de ~0,21 e contornou com uma grade mais larga para a Topbar.

   Critério: a medida usa uma unidade só, a de layout (`offsetLeft`/`offsetWidth` das células e do `nav`, ou a caixa dividida pela
   escala). Com a barra dentro de um ancestral com `transform: scale(0.5)`, ficam visíveis os mesmos itens que a barra mostra sem
   escala, com metade da largura, e o "Mais" fica a um vão do último. Teste de unidade com a escala, e o
   `plan-141-presets-do-painel.spec.ts:353` continua verde.

**Como fechar:** o teste novo, `topbar-mais.spec.ts`, `barra-de-topo-estreita.spec.ts` e o `plan-141` inteiro. O revisor reroda esses.

**Status da plan: 🔵 Em correção.**

## Resumo da correção (lote 1, defeito de medida) — 2026-11-17

Só o achado do veredito: `useHorizontalOverflow.ts` misturava px de tela (`getBoundingClientRect`, com o `transform` dos ancestrais)
e px de layout (padding e vão do `getComputedStyle`).
- **Correção:** a escala é `navRect.width ÷ nav.offsetWidth` (1 quando não há largura de layout, como no `jsdom`). As caixas dos
  itens, a largura da barra e a do "Mais" são divididas por ela, e o `moreStart` sai em px de layout, como o `insetInlineStart`
  que o recebe.
- **Teste novo** (`useHorizontalOverflow.test.ts`): barra com `scale` 0,5 mostra os mesmos itens da barra sem escala e põe o
  "Mais" no mesmo `moreStart`. Reprova com a escala fixada em 1 (conferido) e passa com a correção.
- **Verificação:** `npx vitest run src/components/atomic/Navigation` → 32 arquivos, 310 verdes. Navegador, harness do código-fonte:
  `topbar-mais`, `barra-de-topo-estreita` e `plan-141-presets-do-painel` inteiro → 46 de 46 verdes (inclui o `:353`).

## Veredito — 2026-11-17 — lote 1, defeito de medida — 🟢 Aprovado no código; o lote fecha com o ok do dono na prévia

**O que conferi:**
- **Diff:** a escala sai de `getBoundingClientRect().width ÷ offsetWidth` do `nav`, e é 1 sem largura de layout, como no jsdom. As
  caixas das células, a largura da barra e a do "Mais" passam para px de layout, e o `moreStart` sai na unidade do
  `insetInlineStart`.
- **Teste novo:** `useHorizontalOverflow.test.ts` põe a barra em escala 0,5 e confere que ficam os mesmos itens e o mesmo `moreStart`.
  O executor relata que ele reprova com a escala fixada em 1.

**Como medi:** numa cópia do worktree inteiro (plans 159, 161 e 164) com `npm run build`:
- `npx vitest run src/components/atomic/Navigation src/components/Layout` → 63 arquivos, 660 verdes;
- `topbar-mais`, `barra-de-topo-estreita` e `plan-141-presets-do-painel` inteiro, inclusive o `:353` → 46 de 46 verdes;
- gates do hook e `check-audit-baseline --with-tsc` no worktree real: verdes, sem regressão.

**Falta, para fechar o lote 1:** o ok do dono na prévia (`C:\tmp\sarak-previa-159\index.html`). Depois dele, a plan vai a 🟡 para o
lote 2.

**Commit:** junto com as plans 161 e 164, depois do ok do dono nas três prévias.

**Status da plan: 🟠 Em revisão** (aguardando o ok do dono).

## Nota do revisor — 2026-11-17 — ok do dono na prévia do lote 1

O dono aprovou a prévia do lote 1 (`C:\tmp\sarak-previa-159\index.html`). Na conversa, ele perguntou por que P/M/G, Lateral/Topo e o
modo aparecem na barra. Resposta: a seção 1.A reproduz a composição fixada do ERP (o pior caso de espaço), e a 1.B mostra a de
fábrica, com as três no ⚙. O código do lote saiu no commit `9f08de71`, junto com as plans 161 e 164.

**Lote 1 fechado. Status da plan: 🟡 Em execução** (lote 2).

## Veredito — 2026-11-17 — lote 2 — 🔵 Em correção (um item objetivo)

**Como medi:** as plans 159 e 161 (lote 2) dividem o worktree e saem no mesmo commit, então medi as duas juntas.
- **Cópia fora do repositório** (`HEAD` + modificados + não rastreados, menos `dist/`, sem `presetCardGeometry.ts`), com
  `npm run build` completo: exit 0. Na mesma cópia, a bateria de navegador `topbar-mais`, `barra-de-topo-estreita`,
  `cromo-css-real`, `tom-contrastante-legivel`, `plan-141`, `preferencias-discretas`, `plan-161-catalogo-proporcional`,
  `login-theme-application`, `plan-122-preview-mode`, `plan-160-previa-mostra-a-opcao`, `plan-160-moldura-e-largura` e
  `troca-de-tema` deu **151 de 151 verdes**. Isso inclui os três specs que o resumo da 161 não reexecutou.
- **Gates do commit** (Anel 1 e `check-audit-baseline --with-tsc`): baseline sem regressão. Um vermelho real: `css-important:check`
  (achado da 161). O `plan-index:check` é do revisor, e o `trail-citation:check` só cai na cópia sem `.git`.
- **Unidade:** `npx vitest run` de `Navigation`, `Layout`, `core/Provider`, `core/Design` e `features/DesignEngine`. Na cópia,
  os mocks deixaram de valer em 44 arquivos (186 falhas que não se repetem fora dela). Os 44 rodados de novo **no worktree real**: 42
  verdes e 2 vermelhos, os snapshots do `PreviewCanvas` e do `AtmosphereCatalog` (achado da 159).
- **Segredo** (Anel 0), sobre as linhas adicionadas e os não rastreados fora de `dist/`: 0.
- **Diff lido:** `overlayPreferences.ts` (P e G em px a partir de `bodySize`, piso de 8 px), `ChromeTopbarBody.tsx` (o ⚙ tira o
  que já está fixado), `ShellPreferenceChoiceGroup.tsx` e as variantes `bar`/`menu` dos dois controles. Os tokens novos estão nas
  três fontes.
- **Prévia** (`C:\tmp\sarak-previa-159\index.html`) conferida: o grupo P/M/G e o de Lateral/Topo na altura do item, e o ⚙ em
  linhas com o visto. Os números de antes e depois batem com a tabela do resumo.

**Achado**
1. **Snapshots desta plan.** `src/features/DesignEngine/Canvas/__tests__/PreviewCanvas.test.tsx` ("propriedades de estilo reais") e
   `Canvas/components/__tests__/AtmosphereCatalog.test.tsx` ("abas de mídia/textura") caem no worktree real. A única diferença,
   em cada nó do snapshot, são as duas variáveis novas desta plan: `--sarak-preference-font-size-reduction: 2px` e
   `--sarak-preference-font-size-increase: 2px`. O resumo as atribui à 161, mas não são dela. É a mesma lição do lote 1 da 164: token
   emitido muda a raiz da prévia, e o filtro de unidade de quem cria token inclui `src/features/DesignEngine/Canvas`.
   - Rode `npx vitest run src/features/DesignEngine/Canvas`, leia o diff e atualize só esses dois snapshots, se a diferença for só a
     dessas duas variáveis.
   - Corrija no resumo novo a atribuição.

**Fica para a síntese** (não é correção): o texto da 05 §2.2.2 ("e também dentro do ⚙"), como o 2.2 já manda.

**Como fechar** (verificação objetiva): `src/features/DesignEngine/Canvas` verde e o resumo com as linhas do diff dos dois
snapshots. O revisor reroda só esse filtro.

**Commit:** junto com o lote 2 da `plan-161`, depois das duas correções e do ok do dono nas duas prévias. O lote 2 da `plan-164`
espera esse commit (as duas criam token).

**Status da plan: 🔵 Em correção.**

## Veredito — 2026-11-17 — lote 2, correção — 🟢 Aprovado no código; o lote fecha com o ok do dono na prévia

**Como medi:** só o filtro do achado, no worktree real. `npx vitest run src/features/DesignEngine/Canvas` deu 52 de 52 arquivos e
259 de 259 testes verdes. O diff dos dois snapshots conferido pelo executor (2 e 4 linhas) traz só as duas variáveis de preferência.
O vermelho do `PresetsCatalog` que o resumo cita era passageiro: a correção da `plan-161` estava em andamento na mesma árvore, e o
snapshot é dela. Na minha rodada, ele já passa.

**Falta, para fechar o lote 2:** o ok do dono na prévia (`C:\tmp\sarak-previa-159\index.html`).

**Commit:** junto com o lote 2 da `plan-161`, depois da correção dela e do ok do dono nas duas prévias.

**Status da plan: 🟠 Em revisão** até o ok do dono.

## Nota do revisor — 2026-11-17 — ok do dono na prévia do lote 2

O dono aprovou a prévia do lote 2 (`C:\tmp\sarak-previa-159\index.html`). Ele confirmou que P/M/G e Lateral/Topo vão para a barra
pela configuração (`preferenceFontSizePosition` e `preferenceNavigationStylePosition` em **Mostrar**), com padrão **No menu** em todos
os temas, e que o claro/escuro fica no ⚙ por padrão (`preferenceModePosition`).

**Lote 2 fechado. Status da plan: 🟡 Em execução** (próximo lote). O commit sai junto com o lote 2 da `plan-161`.

## Veredito — 2026-11-17 — lote 3 — 🔵 Em correção (dois itens objetivos)

**Como medi:** no worktree real.
- `tokenNotes.test.ts`, `DecisionTokenRow.test.tsx` e `DecisionTokenList`: 21 de 21 verdes.
- `painel-avisa-a-verdade.spec.ts` e `textura-muda-pixel.spec.ts` pelo config padrão de `browser-tests/`: 10 de 10 verdes.
- **Mutação** numa cópia fora do repositório: tirei o piso de opacidade de `noiseTexture.ts`, e os dois casos "muda pixel" reprovam. O
  3.3 já estava resolvido no `HEAD`, e o spec tem dente.
- **Diff lido:** `tokenNotes.ts`, `DecisionTokenRow.tsx`, `DecisionTokenList.tsx`, o rótulo de `isNavHidden` e o caminho de
  `updatePreferences` em `usePreferencesManager.ts`.

**Achados**
1. **Aviso falso no modo quando o host define `preferences.defaultColorMode`.** O contexto expõe as preferências já com o padrão do
   host (`withHostDefaultColorMode`). Sem escolha nenhuma do usuário, `personalOverrideOf('mode', …)` vê um `colorMode` e mostra
   "Sua preferência pessoal (…) está por cima do tema". O botão de apagar grava `colorMode: undefined`, o padrão do host volta, e o
   aviso fica onde está: a ação não faz nada.
   - Critério: com `defaultColorMode` e nada gravado, sem aviso. Com escolha gravada, aviso, e apagar o tira. Teste de unidade dos
     dois casos.
2. **Falta medir o efeito de apagar.** O resumo declara que conferiu o `localStorage`, mas não a barra. Valor gravado não prova tela.
   - Critério: um teste com o `SarakUIProvider` real e uma preferência gravada que muda o design efetivo (por exemplo
     `navigationStyle` diferente do tema). Clicar em apagar volta o design efetivo ao valor do tema.

**Como fechar** (verificação objetiva): os testes novos dos dois itens e o filtro `src/features/DesignEngine/utils` +
`Main/components/__tests__/DecisionTokenRow`. O revisor reroda só esses e manda a prévia ao dono.

**Commit:** junto com o lote 2 da `plan-164` e o lote 3 da `plan-161`, depois das correções e do ok do dono nas prévias.

**Status da plan: 🔵 Em correção.**

## Veredito — 2026-11-18 — lote 3, correção — 🟢 Aprovado no código; o lote fecha com o ok do dono na prévia

**Como medi:** só o filtro do veredito, no worktree real. `npx vitest run src/features/DesignEngine/utils` e `DecisionTokenRow`: 16 de
16 arquivos e 188 de 188 testes verdes. O executor fez a mutação do achado 1 (os dois casos reprovam lendo `preferences`), e o caso do
achado 2 mede o design efetivo do Provider real voltando ao do tema. O `tsc` acusa 1 erro, em `compose.test.ts:57`, que é da correção
da `plan-164` em andamento, não deste lote.

**Tipo público:** `storedPreferences?` entra como campo opcional do contexto, com um tipo que já é exportado (`SarakUserPreferences`).
O `public-types:check` lê o `dist/index.d.ts` e roda na verificação conjunta, com build, antes do commit.

**Falta, para fechar o lote 3:** o ok do dono na prévia (`C:\tmp\sarak-previa-159\index.html`).

**Commit:** junto com o lote 2 da `plan-164` e o lote 3 da `plan-161`.

**Status da plan: 🟠 Em revisão** até o ok do dono.

## Nota do revisor — 2026-11-18 — ok do dono na prévia do lote 3

O dono aprovou a prévia do lote 3 (`C:\tmp\sarak-previa-159\index.html`).

**Lote 3 fechado. Status da plan: 🟡 Em execução** (lote 4). O commit sai junto com o lote 2 da `plan-164` e o lote 3 da `plan-161`.

## Veredito — 2026-11-18 — achado do dono na prévia do lote 2 — 🔵 Em correção (um item objetivo)

O dono viu, na prévia do lote 2 (`index-lote2.html`, Corporate Ledger claro e escuro, ⚙ aberto), que as linhas não escolhidas do ⚙
ficam ilegíveis: Pequena, Grande, Lateral, Recolher navegação, Idioma, Buscar e Modo Escuro. A captura é do código real.

**Causa** (código lido): no ⚙ e na gaveta, a linha é um `SarakMenuItem` vertical. Sem `active`, ele pinta o texto com
`--sarak-sidebar-item-text-color` (`SarakMenuItem.tsx:140`), que é a cor do item **da barra**, escolhida contra o fundo da barra. O
⚙ abre sobre o fundo do cartão. Com tom da barra diferente do cartão (`sidebarTone: "inverse"` no Corporate Ledger), o texto some nos
dois modos. Na coluna "antes" da prévia, Recolher navegação, Idioma e Buscar já estavam apagados, então o defeito é anterior. O lote 2
o amplia, porque P/M/G e Lateral/Topo viraram linhas do mesmo menu.

**Achado**
1. **O texto das linhas do ⚙ (e da gaveta, se ela abre sobre o cartão) segue a superfície onde o menu abre, não a barra.**
   - Critério: em navegador, o contraste do texto de toda linha do ⚙ contra o fundo dele é de pelo menos 4,5:1. Medir com a linha
     escolhida e com as não escolhidas, em claro e escuro, no Corporate Ledger (tom invertido) e no tema padrão. O caso reprova antes do
     conserto. A barra em si não muda.

**Como fechar:** o caso novo, `tom-contrastante-legivel.spec.ts` e `preferencias-discretas.spec.ts` (com `npm run build`). Prévia
com o ⚙ aberto nos dois modos, para o dono.

**Commit:** junto com o lote 3 desta plan, o lote 2 da `plan-164` e o lote 3 da `plan-161`.

**Status da plan: 🔵 Em correção.**


## Resumo da execução (correção 2) — 2026-11-18

**Resultado:** Concluído (a prévia com o ⚙ aberto nos dois modos espera o ok do dono).

**Estado do worktree ao iniciar**
O worktree já tinha, de outras tarefas e de lotes anteriores desta plan, as alterações das plans 161 e 164 (`PaletteCreator`, `PaletteGallery`, `PaletteSection`, `BrandShortcut`, `presets/components/cards.ts`, `i18n/presetTexts/`, `catalog.ts`, `cardsThemes.generated.ts` e afins), o lote 3 desta plan (`DecisionTokenRow`, `tokenNotes`, `catalogEntries.tokenNotes.ts`, Provider) e o `dist/` regenerado. Nenhum desses arquivos foi tocado nesta correção; a fotografia completa está em `scratchpad/foto-corr2.txt`.

**O que foi feito**
- Achado 1: `ShellPreferencesMenu.tsx` — o menu do ⚙ (portal sobre o fundo do cartão) redefine, só para as suas linhas, os quatro tokens que o `SarakMenuItem` vertical lê (`--sarak-sidebar-item-text-color`, `--sarak-sidebar-item-hover-text-color`, `--sarak-sidebar-icon-color`, `--sarak-sidebar-hover-color`) para o texto do corpo (`--sarak-text-main`), o par do fundo do cartão. A barra não muda e o `SarakMenuItem` também não: o conserto é na superfície que abre o menu.
- Caso novo `browser-tests/menu-preferencias-legivel.spec.ts`: 12 cenas (Corporate Ledger, tema padrão, tema padrão com as duas barras em `inverse` × claro/escuro × ⚙ na lateral/no topo), com tamanho, orientação e modo no menu. Mede texto e ícone de **toda** linha (a escolhida e as não escolhidas) contra o fundo composto do menu, mínimo 4,5:1.
- Gaveta do celular: não alterada. Ela abre sobre o fundo da barra com o tom dela (`ChromeMobileDrawer.tsx:28`), então o texto da barra é o par certo ali; não há o defeito.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/components/atomic/Navigation/ShellPreferencesMenu.tsx` | alterado | `SURFACE_ITEM_TONE` aplicado ao menu do ⚙ |
| `browser-tests/menu-preferencias-legivel.spec.ts` | criado | contraste das linhas do ⚙, 12 cenas |

**Verificações executadas**
- Caso novo **antes** do conserto: reprovou. As três primeiras cenas lidas (Corporate Ledger escuro/lateral, escuro/topo, claro/lateral) acusaram texto de 1,07:1 a 1,21:1 e ícone de 1,62:1 a 1,97:1 (ex.: `texto "Pequena": rgb(223,220,232) sobre rgb(244,241,254) = 1.21`). A saída foi cortada por mim depois dessas três; não li as outras nove antes do conserto.
- Caso novo **depois** → 12 passed.
- `npm run build` → exit 0 (inclui o consumidor com todos os peers opcionais).
- `tom-contrastante-legivel.spec.ts` + `preferencias-discretas.spec.ts` (contra o build) → 31 passed.
- Capturas do ⚙ aberto, antes e depois: `C:\tmp\sarak-previa-159\index-correcao-menu.html`.

**Critérios de aceite**
- [x] Texto das linhas do ⚙ segue a superfície onde o menu abre — `ShellPreferencesMenu.tsx` (`SURFACE_ITEM_TONE`).
- [x] Contraste ≥ 4,5:1 em toda linha, escolhida e não escolhidas, claro e escuro, Corporate Ledger e tema padrão — `menu-preferencias-legivel.spec.ts`, 12/12.
- [x] O caso reprova antes do conserto — ver acima (três cenas lidas).
- [x] A barra em si não muda — `tom-contrastante-legivel.spec.ts` e `preferencias-discretas.spec.ts` verdes.
- [ ] Prévia aprovada pelo dono — pendente.

**Decisões e suposições**
- O texto do corpo (`--sarak-text-main`) vale como par do fundo do cartão; o caso mede isso em vez de supor. Ele é o mesmo token que as linhas de P/M/G e Lateral/Topo (`ShellPreferenceChoiceGroup`) já liam.
- O texto não escolhido deixa de ser "apagado" (muted) no ⚙: fica com a cor do texto do corpo, porque 4,5:1 é o critério e o muted do corpo não foi medido. A escolhida segue distinta pelo peso e pelo visto.
- O hover da linha vira um véu de 10% do texto do corpo, em vez do `--sarak-sidebar-hover-color` da barra (que também é calculado contra a barra).

**Achados fora do escopo (não corrigidos)**
- Nenhum.

**Pendências / riscos**
- Rodei só o que o prompt mandou (build, o caso novo e os dois casos citados) mais `vitest run src/components/atomic/Navigation src/components/Layout/chrome` (57 arquivos, 563 testes verdes) e `tsc --noEmit` (sem erro); suíte completa, baseline e `verify` não foram rodados.

## Veredito — 2026-11-18 — correção 2 (texto do ⚙) — 🔵 Em correção (um item objetivo; ele barra o commit)

**Verificação conjunta das plans 159, 161 e 164** (saem no mesmo commit):
- **Navegador:** numa cópia fora do repositório (o worktree inteiro, menos `dist/`), `npm run build` com exit 0 e
  `public-types:check` OK. A bateria `topbar-mais`, `barra-de-topo-estreita`, `cromo-css-real`, `tom-contrastante-legivel`,
  `plan-141`, `preferencias-discretas`, `plan-161-catalogo-proporcional`, `login-theme-application`, `plan-122-preview-mode`,
  `plan-160-previa-mostra-a-opcao`, `plan-160-moldura-e-largura`, `troca-de-tema`, `painel-avisa-a-verdade`,
  `textura-muda-pixel` e `menu-preferencias-legivel` deu **176 de 176 verdes**.
- **Unidade, no worktree real:** `Navigation`, `Layout/chrome`, `core/Provider`, `core/Design`, `core/i18n`,
  `features/DesignEngine`, `src/styles` e o gerador de cards deram 361 de 361 arquivos e 3629 de 3629 testes.
- **Segredo** (Anel 0), nas linhas adicionadas e nos não rastreados fora de `dist/`: 0.
- **Gates do commit:** um vermelho real, `audit:baseline` com `auditor_cleancode` de 0 para 1 (abaixo, item da 159). O
  `plan-index:check` é do revisor e foi regenerado.
- **Diff lido:** `ShellPreferencesMenu.tsx` redefine, só no menu, os quatro tokens da linha para o texto do corpo. A barra não muda. O
  caso novo mede texto e ícone de toda linha nas 12 cenas, e o executor o viu reprovar antes do conserto (de 1,07:1 a 1,21:1).

**Achado**
1. **`src/core/Provider/types.ts` passou do teto de 250 linhas** (`auditor_cleancode` de 0 para 1). O `audit:baseline` derruba o
   commit das três plans. As duas linhas a mais são do campo `storedPreferences` da correção do lote 3 desta plan (o `HEAD` tem
   249). O resumo da 161 a atribuiu à 164, mas não é dela.
   - Critério: `types.ts` volta a 250 linhas ou menos sem perder o campo nem a descrição, e
     `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` fica sem regressão.

**Como fechar:** só esse comando. O revisor reroda só ele.

**Falta, para o commit:** o ok do dono na prévia `C:\tmp\sarak-previa-159\index-correcao-menu.html`.

**Status da plan: 🔵 Em correção.**

## Nota do revisor — 2026-11-18 — ok do dono na prévia da correção 2

O dono aprovou a prévia `C:\tmp\sarak-previa-159\index-correcao-menu.html` (o ⚙ legível nos dois modos). Falta só o item do
`types.ts` (veredito da correção 2) para o commit.

**Status da plan: 🔵 Em correção** (o item do `types.ts`).


## Resumo da execução (correção 3) — 2026-11-18

**Resultado:** Concluído.

**Estado do worktree ao iniciar**
O mesmo das correções anteriores (alterações das plans 161 e 164, lotes desta plan e `dist/` regenerado); fotografia em `scratchpad/foto-corr3.txt`. Nada além de `types.ts` foi tocado.

**O que foi feito**
- `src/core/Provider/types.ts` — o auditor contava 251 linhas (`HEAD` tinha 249; o campo `storedPreferences` somou 2). Fundi as duas linhas finais de `export type { ... } from './providerProps'` numa só e o comentário de duas linhas sobre `SarakUIProviderProps` numa linha. O campo `storedPreferences` e a descrição dele ficaram como estavam; nenhum export foi removido (os seis nomes seguem exportados).

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/core/Provider/types.ts` | alterado | 251 → 249 linhas pelo auditor; mesmos exports e mesmo campo |

**Verificações executadas**
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` → "igual ao baseline de 2026-10-12 — nenhuma regressão" (antes da segunda condensação reprovava com `auditor_cleancode` 0 → 1, porque o auditor contava 251 com `wc` em 250).

**Critérios de aceite**
- [x] `types.ts` no teto sem perder o campo nem a descrição — `types.ts` (`storedPreferences` e o JSDoc).
- [x] Baseline sem regressão — saída acima.

**Decisões e suposições**
- Condensei exports e um comentário em vez de mover o campo; o resultado é equivalente para o consumidor.

**Achados fora do escopo (não corrigidos)**
- Nenhum.

**Pendências / riscos**
- Não rodei `build` nem a suíte; o `public-types:check` fica com o revisor (os nomes exportados não mudaram).

## Veredito — 2026-11-18 — correção 3 (`types.ts`) — 🟢 Aprovado

**Como medi:** `src/core/Provider/types.ts` tem 249 linhas, e o campo `storedPreferences` e a descrição dele seguem no lugar. O
diff só funde dois `export type` e um comentário, com os mesmos seis nomes exportados.
- `check-audit-baseline --with-tsc`: sem regressão.
- `public-types:check`: OK. Anel 1 verde. O `plan-index:check` é do revisor e foi regenerado com este veredito.

Com isto fecham o lote 3 e as correções 1 a 3, e a prévia já tem o ok do dono.

**Commit:** junto com o lote 3 da `plan-161` e o lote 2 da `plan-164`, num commit só.

**Próximo:** lote 4, depois do lote 4 da `plan-161`, porque os dois mexem em `design-decisions.json`.

**Status da plan: 🟡 Em execução** (lote 4).
