---
tipo: "plan"
titulo: "Fazer o cromo real seguir o Layout escolhido, com preferências discretas e uma decisão própria para as barras"
objetivo: "Fazer toda opção de Layout que o administrador aplica aparecer no cromo real ou dizer por que não aparece, com a Topbar sem item escondido, a barra de tom contrastante legível e os controles de preferência discretos, com P, M e G configuráveis em relação ao tamanho base do tema, e reunir as barras numa decisão própria, com um tom que vale para as duas e um interruptor da troca lateral/topo"
dominio: "Cromo / Preferências do usuário"
status: "🔴 A executar"
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
