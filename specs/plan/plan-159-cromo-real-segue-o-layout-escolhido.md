---
tipo: "plan"
titulo: "Fazer o cromo real seguir o Layout escolhido, com preferências discretas"
objetivo: "Fazer toda opção de Layout que o administrador aplica aparecer no cromo real ou dizer por que não aparece, com a Topbar sem item escondido, a barra de tom contrastante legível e os controles de preferência discretos, com P, M e G configuráveis em relação ao tamanho base do tema"
dominio: "Cromo / Preferências do usuário"
status: "🔴 A executar"
prioridade: "Alta"
tags: ["plan", "cromo", "topbar", "sidebar", "preferencias", "painel"]
relacionados: ["[[05-cromo-e-slots]]", "[[09-temas-e-presets]]", "[[06-painel-de-customizacao-e-preview]]", "[[016-preferencias-do-usuario-separadas-do-tema]]", "[[014-cromo-do-modo-ui-kit-com-widgets-por-padrao]]"]
depende_de: "plan-158"
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

**O que funciona e não se toca:** borda, item ativo, raio, densidade, ícone, blur, posição esquerda/direita/flutuante, gradiente, marca
na base, largura ajustável, auto-ocultar e as larguras de conteúdo 1000/1200/1440 aplicam no cromo real.

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

# 6. Critérios de aceite

- [ ] Topbar: todo item visível ou no "Mais", a 1440, 1280 e 1024 px, com a composição do ERP (spec que reprovava antes).
- [ ] Barra de tom contrastante: rótulo, ícone, busca, pílulas e ⚙ a 4,5:1, em dois temas e nos dois modos.
- [ ] Grupo de P/M/G e Lateral/Topo com a altura de um item; menu ⚙ com linhas; números de antes e depois no resumo.
- [ ] O ⚙ não repete o fixado na barra visível; a exceção da Sidebar recolhida continua.
- [ ] P e G configuráveis em px a partir de `bodySize`, padrão −2/+2, sem P = M nem G = M nas pontas (teste que reprovava antes).
- [ ] Painel avisa a preferência pessoal que sobrepõe o token e permite apagá-la.
- [ ] Controle que não vale no modo atual: desabilitado com motivo.
- [ ] "Textura local" muda pixel; largura fora do intervalo não é aceita em silêncio; rótulo de `isNavHidden` corrigido.
- [ ] Paridade de token verde; `docs/migracoes.md`; gerados regenerados.
- [ ] Suíte completa verde; `tsc` 0; baseline sem regressão; Anel 1.

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
- **`06`:** o aviso de preferência pessoal e o controle desabilitado no modo que não vale.

---

# 9. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only: cada rodada acrescenta um bloco novo; nada é removido. -->

---

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->
