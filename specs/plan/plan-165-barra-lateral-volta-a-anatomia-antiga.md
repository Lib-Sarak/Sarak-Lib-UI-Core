---
tipo: "plan"
titulo: "Devolver à barra lateral a anatomia da lib antiga como padrão, mantendo cada token editável"
objetivo: "Fazer a barra lateral de todo tema nascer com a anatomia da lib antiga (moldura de cartão, cabeçalho da marca com monograma e seta, títulos de seção largos, item ativo com barra luminosa na cor primária e fundo quase invisível, ícones discretos, rodapé em linhas iguais às do menu e cartão do usuário com hierarquia), sem tirar do administrador nenhum token de ajuste, e corrigir os defeitos que a medição achou no caminho"
dominio: "Cromo / Barra lateral"
status: "🟡 Em execução"
prioridade: "Alta"
tags: ["plan", "cromo", "sidebar", "personalidade", "regressao-visual"]
relacionados: ["[[05-cromo-e-slots]]", "[[09-temas-e-presets]]", "[[024-paleta-calculada-separada-do-tema]]", "[[014-cromo-do-modo-ui-kit-com-widgets-por-padrao]]", "[[013-item-de-navegacao-como-atomo-proprio]]"]
depende_de: "plan-158 (lote 1)"
retida_por: ""
destino_sintese: "specs/05-cromo-e-slots.md + specs/09-temas-e-presets.md"
---

# 1. Objetivo

A barra lateral volta a ter personalidade: todo tema nasce com a mesma anatomia que a lib antiga desenhava, e cada tema muda cor,
fonte, raio e textura por cima dela. O administrador continua ajustando qualquer token, um por um. Os defeitos de funcionamento achados
na medição (item escondido atrás do rodapé, bloco da logo cortado, faixa vazia no topo, ícones que o Novo usa e a lib não tem) saem
junto.

# 2. Contexto

**Pedido do dono (2026-11-13).** Ao ver a prévia da `plan-162`, o dono apontou que as barras laterais antigas eram "muito melhores,
com mais detalhes e personalidade" e que houve regressão visual. Ele considera a barra parte importante da personalidade do tema.

**Onde está o original.** O sistema Novo (`C:\Users\Igor\Desktop\Sarak\X - Trabalho\Code\ZP\Automacao-relatorios\Novo\`) usa a lib no
commit `7c4dbaed` e monta o `SarakShell` sem customizar a barra (`modules/painel-web/web/src/AppBootstrap.tsx`). Logo, a foto mostra a lib
pura. O desenho está em `git show 7c4dbaed:src/core/Shell/Components/SidebarNav.tsx`, `ShellUserWidget.tsx`,
`ShellSearchWidget.tsx`, `ShellLanguageSelector.tsx` e `ShellThemeToggle.tsx`. **A barra antiga era uma anatomia só, igual em
todos os temas.** O tema mudava as variáveis; a estrutura ficava. Era isso que dava a personalidade.

**Medido (revisor, 2026-11-13).** A barra atual foi capturada com o mesmo conteúdo da foto do Novo (dois grupos, seis itens com
ícone, usuário, uma notificação), a 1440×900, nos 7 temas resgatados e no `sarak-sovereign` e `cyberpunk-neon` de hoje.
- Prévia lado a lado, antiga × atual: `C:\tmp\sarak-previa-barra\index.html` (imagens em `img\`).
- Capturas e medidas computadas: `C:\tmp\sarak-medida-barra-capturas\` (`medidas.json`).
- Fotos antigas: `C:\tmp\sarak-temas-antigos\`.

| Peça | Antiga (todos os temas) | Atual (medido) |
|---|---|---|
| Moldura | cartão: margem, raio do tema, borda de 1 px na cor da borda, sombra | cantos retos nos 9 temas; a `<aside>` não consome raio nenhum |
| Cabeçalho da marca | faixa de 64 px com linha embaixo e fundo levemente tingido; logo ou **monograma** (inicial sobre gradiente da primária); seta de recolher à direita | só o nome, sem faixa, sem linha, sem monograma, sem seta (a seta mora no ⚙ por padrão). Com `logo`, um bloco magenta mais estreito que a barra e cortado no topo (`--sarak-sidebar-brand-bg`) |
| Busca | compacta (≈32 px) | caixa de ≈56 px |
| Título de seção | caixa alta, negrito, espaçamento ≈0,2 em, claro | 11 px, espaçamento 1,1 px, colorido com a secundária ou a de destaque |
| Item ativo | fundo primária a ≈10% + brilho interno leve; **barra de 4×16 px na primária com brilho**; ícone e texto na primária | só 3 dos 9 têm marcador e nenhum na primária; fundos de pílula a 60%, quase branco, contorno; texto às vezes preto ou branco |
| Ícone inativo | na cor apagada do texto | na primária: a lista inteira parece acesa |
| Rodapé | três linhas com a métrica do item de menu: ícone, rótulo, indicador à direita ("PT", ponto aceso) | sino solto com "1", pílula de idioma de ≈105 px com borda, "Modo Claro" solto, ⚙ isolado embaixo do usuário; alturas de 28, 39 e 31–43 px |
| Usuário | faixa com linha em cima e fundo próprio; avatar tingido; nome em cima, papel pequeno em caixa alta com escudo; sair à direita | papel maior e mais pesado que o nome; faixa com borda e fundo em alguns temas e sem nada em outros |

**Defeitos de funcionamento achados na medição:**
- **Dot Matrix Elegant:** itens centralizados com 43 px de altura; o ativo vira pílula truncada ("Sessões TC…"); a 900 px de altura,
  "Acompanhamento TC" e "Relatório de Encerramento" ficam **atrás do rodapé**.
- **Cyberpunk Neon Classic e Industrial Terminal Classic** (`sidebarLogoPlacement: 'bottom'`): sobram 64 px vazios no topo
  (backlog 71).
- **Ícones do Novo:** `FileSearch` (duas abas) e `GitBranch` não estão nos 117 nomes curados (`iconNames.ts`); a aba mostraria o ícone de
  aviso.

**Causa principal, lida no código.** O mapa de papéis da paleta dá à barra os padrões que desmontam a anatomia
(`src/core/Design/palette/role-map.ts`):
- `:30` `sidebarActiveColor` = primária a 60%;
- `:33` `sidebarCategoryColor` = secundária;
- `:38` `sidebarIconColor` = primária;
- `:51` `navActiveMarkerColor` = destaque.

Os temas somam sobrescritas próprias. O cabeçalho, a moldura, o rodapé e o usuário perderam peças no redesenho do cromo
(`src/components/Layout/chrome/`).

**Decisões do dono (2026-11-13):**
- **D0:** a anatomia antiga vira o **padrão**, e **toda a granularidade fica**: cada token de hoje continua editável no painel e
  declarável pelo tema.
- **D1:** vale para **todos os temas**, não só os resgatados. Os 7 resgatados declaram o item ativo como no original.
- **D2:** a seta de recolher volta ao cabeçalho por padrão.
- **D3:** a dica do atalho (`Ctrl/⌘ K`) continua **escondida** na busca (05 §2.1.3 não muda).
- **D4:** composição padrão. **Na barra:** busca, seta de recolher, idioma (com 2 ou mais idiomas), notificações e usuário. **No ⚙:**
  modo claro/escuro, tamanho da fonte (P/M/G) e lateral/topo. Continuam valendo as regras de hoje: o ⚙ não repete o fixado, e a barra
  recolhida manda ao ⚙ o fixado sem ícone próprio.
- **D5:** o widget que o sistema não ligou (sem `user`/`logout`, sem `notifications`) **não aparece em produção**. Fora de produção
  continua aparecendo, com o aviso único no console que diz o que ligar.
- **D6:** o avatar do usuário vira opção, ícone ou iniciais. O padrão é **iniciais**, e os 7 resgatados declaram **ícone**.
- **D7:** `FileSearch` e `GitBranch` entram nos nomes curados, nas três famílias.
- **D9 (2026-11-13, prévia do lote 1):** o item ativo ganha o acabamento de **vidro** da antiga: fundo translúcido da primária,
  brilho interno (`inset 0 0 20px` da primária a 5% no código de `7c4dbaed`) e o brilho do marcador. É uma **opção** que combina com
  qualquer estilo do item ativo (`bar`, `pill`, `filled`, `outline`, `underline`), por token novo `sidebarActiveGlass`
  (`'on'` | `'off'`), padrão `'on'`, nas três fontes. **No painel, fica na configuração da barra**, no mesmo grupo do estilo do item
  ativo (pedido do dono: tudo o que é da barra fica na configuração da barra). A decisão "Barras" da `plan-159` (lote 4) leva o grupo
  inteiro, com este token e o `userAvatarStyle` (D6).
- **D8 (2026-11-13):** o menu com sub-abas recolhíveis passa a funcionar também pela porta recomendada, `navItems`.
  - Hoje só o `nav` antigo aceita `children` (05 §2.1, "Grupos").
  - `SarakNavItem` (`chrome/navItem.ts`) não tem `children`, e a conversão em `SarakAppChrome.tsx:179` descarta os filhos.
  - O ERP usa `navItems`.

  Referência do dono: aba com sub-abas, seta, selo e o filho ativo destacado.

# 3. Escopo

## 3.1 Dentro
- **Lote 1 (a lista e o cabeçalho):**
  - `src/core/Design/palette/role-map.ts` (os quatro papéis da barra);
  - `src/components/Layout/chrome/ChromeSidebarBody.tsx`, `ChromeSidebarHeader.tsx`, `ChromeSlots.tsx` (`ChromeBrand`) e
    `ChromeCollapseToggle.tsx`;
  - `src/components/atomic/Navigation/SarakShellNav.tsx`, `SarakMenuItem.tsx` e `SarakShellSearchWidget.tsx`;
  - D8: `src/components/Layout/chrome/navItem.ts`, a conversão em `src/components/Layout/SarakAppChrome.tsx:179` (o único ponto que converte
    `navItems`), `src/components/atomic/Navigation/internal/ShellNavGroup.tsx` e
    `ShellNavFlyout.tsx` (só o visual da anatomia);
  - o token novo da moldura, se for preciso (§5, 1.2), e o `sidebarActiveGlass` (D9), nas três fontes de token e no painel;
  - os testes, e um spec de navegador novo da anatomia (`browser-tests/`), com fixture própria.
- **Lote 2 (o rodapé e o usuário):**
  - `src/components/Layout/chrome/ChromeSidebarFooter.tsx`, `ChromeUserThemeGroup.tsx`, `ChromeUnavailableWidget.tsx`,
    `ChromeNotificationsWidget.tsx` e `useChromeDefaultWidgets.ts`;
  - `src/components/atomic/Navigation/SarakShellUserWidget.tsx`, `SarakShellLanguageSelector.tsx` e `ShellPreferencesMenu.tsx`;
  - `src/core/Design/schema/preferences.ts` (padrões de posição, D4) e o token novo do avatar (D6), nas três fontes;
  - os textos novos em `src/core/i18n/` (seis idiomas);
  - os testes e o spec da anatomia.
- **Lote 3 (os temas e os ícones):**
  - os arquivos de tema em `src/core/Design/presets/themes/` que sobrescrevem tokens da barra (§5, 3.1);
  - `src/components/atomic/Icon/iconNames.ts` e as três famílias em `families/` (D7);
  - os gerados (`npm run themes:catalog`, catálogo de componentes) e o snapshot do `PresetsCatalog`, se mudar.
- Em todo lote: `docs/migracoes.md`, `npm run guide`, `npm run dev-kit`.

## 3.2 Fora
- A Topbar, salvo o que for consequência direta da paleta. A anatomia da barra de topo é outra conversa.
- O que a `plan-159` faz: o "Mais" da Topbar, o tom das barras e a decisão "Barras" no painel, P/M/G configurável e o aviso de
  preferência pessoal. **A forma** dos controles de P/M/G e lateral/topo dentro do ⚙ é do lote 2 da 159; esta plan só decide
  **onde** eles ficam (D4).
- A dica do atalho na busca (D3).
- A prévia do painel e as amostras (`plan-160`, `plan-161`).
- Migrar valor de posição já gravado por importador: valor salvo continua valendo (05 §2.2.2).
- Qualquer arquivo do Novo, do ERP ou dos logins.
- Versão e tag.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/05-cromo-e-slots.md` §2.1, §2.1.1, §2.1.3, §2.2.1, §2.2.2, §2.3, §2.4, §6 | estrutura, item de navegação, busca, widgets montados, composição, nada some, token tem consumidor, zero hardcode |
| Spec fixa | `specs/09-temas-e-presets.md` §4.3.4, §5, §5.3, §6.5 | paleta e papéis, catálogo e sobrescrita justificada, o que o tema declara, contraste |
| Spec fixa | `specs/10-seguranca-e-acessibilidade.md` §3.6 | texto novo nos seis idiomas; contraste |
| Spec fixa | `arquitetura/04-contrato-de-tokens-e-paridade.md` | token novo nas três fontes |
| ADR | `adr/024-paleta-calculada-separada-do-tema.md` · `adr/014-cromo-do-modo-ui-kit-com-widgets-por-padrao.md` · `adr/013-item-de-navegacao-como-atomo-proprio.md` | papéis da paleta; widgets por padrão (D5 muda o que aparece em produção); o átomo do item |
| Contexto | `00-contexto.md` · `00-knowledge.md` | sempre |
| **Skill** | `padrao-escrita` + `padrao-typescript` · `test-unitario` · `test-e2e` · `ui-novo-componente` (token novo) · `ui-arquitetura-design` | escrita, testes, paridade de token, regra do Design Engine |
| Código antigo | `git show 7c4dbaed:src/core/Shell/Components/SidebarNav.tsx` (e os vizinhos da §2) | a anatomia de referência, classe por classe |
| Medida | `C:\tmp\sarak-previa-barra\index.html` · `C:\tmp\sarak-medida-barra-capturas\medidas.json` · `C:\tmp\sarak-temas-antigos\` | o antes, já medido |
| Teste existente | `browser-tests/plan-145-personalidades.spec.ts` · `browser-tests/seletor-da-barra-legivel.spec.ts` · `browser-tests/plan-124-sidebar-contrast.spec.ts` · `browser-tests/troca-de-tema.spec.ts` | legibilidade do cromo e custo da troca, que não podem regredir |

# 5. Instruções de execução

**Um lote por vez; cada lote termina com resumo num bloco novo da §9, a prévia do lote e status 🟠.**

**Antes do lote 1 — o spec que reprova.** Crie o spec de navegador da anatomia (`browser-tests/barra-lateral-anatomia.spec.ts`, com
fixture própria) com o conteúdo da medição: marca "Sarak OS" sem logo, grupos "Personalização" (1 item) e "Relatórios" (5 itens, um
ativo), ícones, `user` + `logout`, uma notificação, dois idiomas. Viewport de 1440×900, modo escuro. Temas: `sarak-sovereign-classic`,
`dot-matrix-elegant`, `cyberpunk-neon-classic` e `sarak-sovereign`. Os casos de cada lote entram nele. Rode-o sobre o código de antes
e registre no resumo quais casos reprovam.

**Lote 1 — a lista e o cabeçalho.**
1.1. **Item ativo.** O padrão é a anatomia antiga:
- marcador `bar` na borda, na cor primária, com brilho;
- fundo na primária com alfa baixo (≈10%; o número final sai da medida contra a foto);
- ícone e texto do ativo na cor ativa;
- ícone inativo na cor do texto do item, não na primária.

Conserte em `role-map.ts` (`sidebarActiveColor`, `navActiveMarkerColor`, `sidebarIconColor`) e onde mais o padrão nascer. O
estilo `filled`, `outline` e `underline` continua disponível. Casos no spec: o marcador existe e tem a cor da primária do tema; o alfa
do fundo é no máximo 0,15; o ícone inativo tem a cor do rótulo inativo; o texto ativo passa 4,5:1 contra o fundo da barra.

1.1-b. **Revisão pela prévia do dono (2026-11-13).**
- **Vidro (D9).** Token `sidebarActiveGlass`, padrão `'on'`, aplicado no `SarakMenuItem` da barra lateral em todos os estilos. Com
  `'off'`, o item ativo fica como o lote 1 entregou. Casos no spec: com `'on'` o ativo tem `box-shadow` interno não nulo nos quatro
  temas; com `'off'`, não tem. Teste de unidade dos dois valores.
- **Item inativo apagado, como a antiga.** No código de `7c4dbaed`, rótulo **e** ícone do item inativo usam `--theme-muted`, e só o
  ativo e o passar do mouse acendem. O papel de `sidebarItemTextColor` (e, com ele, `sidebarIconColor`) passa ao tom apagado da
  barra, com o texto inativo ainda a 4,5:1 contra o fundo dela. Caso no spec: o rótulo inativo é mais apagado que o ativo (contraste
  menor contra o fundo) e passa 4,5:1.

1.2. **Moldura.** A `<aside>` volta a ser um cartão: raio do tema, borda de 1 px na cor da borda da barra e a sombra que já existe.
- O raio vem de um token que o tema e o painel alcançam. Use um existente se ele tiver esse papel. Se não houver, crie
  `sidebarRadius`, com padrão no raio do tema, nas três fontes. **Não** use variável sem declaração no `:root` (ver
  `--sarak-button-radius`).
- Com `sidebarPosition` flutuante, nada muda. Na borda da tela (sem margem), o raio do lado colado é zero.

1.3. **Cabeçalho da marca.**
- Faixa com a altura de hoje (`--sarak-topbar-height`), linha embaixo na cor da borda da barra e fundo levemente tingido (token
  existente de fundo da marca ou do cabeçalho; o executor diz qual).
- Sem `logo`: **monograma**, a primeira letra de `brand.name` sobre gradiente da primária, com o raio do tema. Recolhida, fica só o
  monograma.
- Seta de recolher à direita (D2: o padrão de `preferenceNavCollapsePosition` passa a `pinned`; a seta já é o controle fixado).
- **Defeito:** com `logo`, o fundo da marca (`--sarak-sidebar-brand-bg`) não pode sair mais estreito que a faixa nem cortado. Caso no
  spec com logo.
- **Backlog 71:** com `sidebarLogoPlacement: 'bottom'`, o topo fica só com a seta, numa faixa da altura dela, sem 64 px vazios.
- **Respiro abaixo do topo (prévia do dono).** Entre o fim do topo (a faixa da marca ou a faixa só da seta) e a busca há o mesmo
  respiro que separa os blocos da lista (o vão entre seções), nunca 0. A busca usa o mesmo recuo lateral dos itens: a borda
  esquerda do campo alinha com a borda esquerda dos itens (±1 px). Casos no spec, nas duas posições da marca: distância
  topo→busca ≥ 8 px e igual (±1 px) ao vão entre seções; bordas esquerdas alinhadas.

1.4. **Títulos de seção:** caixa alta, negrito, espaçamento de pelo menos 0,15 em, na cor do texto da barra (papel
`sidebarCategoryColor` sai da secundária). Tamanho e peso medidos contra a foto. Caso no spec: espaçamento e cor.

1.5. **Busca compacta:** a mesma altura de um item de menu (a antiga tinha ≈32 px). A dica do atalho continua escondida (D3).

1.6. **Dot Matrix:**
- itens alinhados à esquerda como nos outros temas;
- o ativo não trunca o rótulo de "Sessões TCE-SP" a 1440;
- **todo item da lista visível ou alcançável rolando a lista, nunca atrás do rodapé.** Este caso vale nos quatro temas do spec, a
  1440×900 e a 1280×720.

Ache a causa (token do tema ou do cromo) e diga no resumo.

1.7. Recolhida (74 px): monograma, ícones centralizados, marcador visível no ativo, dica com o nome (já existe). Um caso no spec.

1.8. **Sub-abas pela porta `navItems` (D8).**
- `SarakNavItem` ganha `children?: SarakNavItem[]` e `defaultExpanded?: boolean`, com a mesma regra do `SarakShellNavItem`: um nível
  só, e o pai com filhos não navega.
- A conversão de `navItems` repassa os filhos.
- O item ativo pode ser um filho (`active: true` nele). O grupo dele abre sozinho, e o pai fica marcado como contendo o ativo.
- Lateral, lateral recolhida (balão), topbar (balão) e gaveta do celular se comportam como já se comportam com `nav` (05 §2.1).
- Mudança aditiva: quem não passa `children` não vê diferença.

Testes:
- unidade da conversão (filhos, `defaultExpanded`, filho ativo abre o grupo);
- no spec da anatomia, a fixture ganha um grupo "Vendas" com três sub-abas, uma ativa e uma com `badge`, e os casos conferem:
  - o grupo abre e fecha pela seta (mouse e teclado);
  - os filhos ficam recuados em relação ao pai;
  - o filho ativo tem o marcador e as cores do item ativo do 1.1;
  - o selo cabe sem truncar o rótulo a 1440.

**Lote 2 — o rodapé e o usuário.**
2.1. **Composição padrão (D4)** em `schema/preferences.ts`:
- `preferenceModePosition` passa a `menu`;
- `preferenceNavCollapsePosition` passa a `pinned` (se não entrou no 1.3);
- `preferenceLanguagePosition`, `chromeSearchPosition`, `chromeUserPosition` e `chromeNotificationsPosition` ficam `pinned`;
- `preferenceFontSizePosition` e `preferenceNavigationStylePosition` ficam `menu`.

Valor que o sistema já gravou continua valendo. Teste: com o design padrão, o ⚙ contém modo, tamanho da fonte e lateral/topo, e a
barra mostra idioma, notificações e usuário.

2.2. **Rodapé em linhas.** Idioma e notificações, fixos na barra, viram linhas com a métrica do item de menu vertical: ícone, rótulo
e indicador à direita.
- Idioma: o código do idioma que vale, na cor ativa.
- Notificações: um ponto aceso quando há não lidas, ou o contador.
- **Alinhamento (prévia do dono):** nada centralizado nem solto. Ícone de cada linha, ⚙ e avatar na mesma coluna dos ícones dos
  itens da lista (±1 px); rótulos na mesma coluna dos rótulos; indicadores alinhados à direita na mesma borda. Caso no spec, nos
  quatro temas: a borda esquerda dos ícones do rodapé e do avatar bate com a dos ícones da lista.

Clicar abre o mesmo seletor ou a lista de hoje. O ⚙ fica numa linha própria com a mesma métrica, acima do usuário, não isolado
embaixo dele. Caso no spec: as linhas do rodapé têm a altura do item de menu (±2 px), e nenhuma tem borda própria.

2.3. **Widget não ligado (D5).** Em produção (`process.env.NODE_ENV === 'production'`, o mesmo critério do aviso de
`useChromeDefaultWidgets.ts:124`), usuário e notificações sem dado não aparecem. Fora de produção aparecem como linha apagada, com a
mesma métrica do 2.2 (sem a caixa com borda de hoje) e o aviso único no console.
- Teste de unidade nos dois ambientes.
- Atualize o teste de `ChromeUnavailableWidget`.
- A busca e os demais widgets não mudam.

2.4. **Usuário.**
- A faixa do usuário tem sempre a mesma anatomia: linha em cima na cor da borda da barra, fundo levemente tingido e o mesmo
  respiro em todos os temas.
- Nome em cima, mais forte. Embaixo, o papel pequeno em caixa alta, com espaçamento largo e o ícone de escudo. Sair à direita.
- Caso no spec: o tamanho de fonte do nome é maior que o do papel, e a faixa tem borda superior nos quatro temas.

2.5. **Avatar (D6).** Token novo `userAvatarStyle` (`'initials'` | `'icon'`), padrão `'initials'`, nas três fontes, com controle no
painel ao lado dos demais do usuário. `'icon'` mostra o ícone `User` sobre fundo tingido da primária, como a antiga. Teste de
unidade dos dois valores.

**Lote 3 — os temas e os ícones.**
3.1. **Sobrescritas dos temas.** Liste, nos 25 temas embarcados, toda sobrescrita dos tokens da barra que esta plan reabre. São eles:
- `sidebarActiveColor`, `sidebarActiveItemStyle`, `navActiveMarkerColor`, `navActiveMarkerGlow` e `navItemActiveColor`;
- `sidebarIconColor`, `sidebarItemTextColor`, `sidebarCategoryColor` e `navItemRadius`;
- `sidebarBorderSide` (o `'none'` tira a moldura do 1.2);
- o fundo da marca (`sidebarBrandBackground`) e os tokens que o lote 1 criou.

Nos resgatados, o texto do item ativo é o da foto (a cor da semente primária, não a primária de texto que a paleta clareia): o tema
declara `navItemActiveColor`, com linha de motivo. A paleta não muda.

Para cada sobrescrita:
- **Os 7 resgatados:** ficam como o original da §2 (marcador na primária, fundo quase invisível, avatar `icon`). A foto é a
  referência.
- **Os outros 18:** a sobrescrita que só repete o valor que a paleta calculava sai, e o tema passa a seguir a anatomia. A que é
  identidade do tema, com linha de motivo (09 §5), fica.

Traga a tabela (tema, token, valor, fica ou sai, por quê) no resumo. **Nenhuma cor de fundo, texto ou marca do tema muda.**
3.2. **Ícones (D7):** `FileSearch` e `GitBranch` em `SARAK_ICON_NAMES` e nas três famílias (lucide, phosphor, tabler). Para família
sem ícone de mesmo nome, use o equivalente mais próximo e diga qual. `icon-port:check` verde; catálogo regenerado.
3.3. Contraste: `auditor_contraste` e o spec das Personalidades verdes nos 25 temas e nos dois modos, com o item ativo novo.

# 6. Critérios de aceite

- [ ] Spec da anatomia criado antes do código, com os casos que reprovavam listados no resumo.
- [ ] Item ativo: marcador na primária, fundo com alfa ≤ 0,15, ícone inativo na cor do rótulo, texto ativo a 4,5:1, nos quatro temas
  do spec; os estilos `filled`/`outline`/`underline` continuam aplicáveis.
- [ ] Moldura com raio por token; cabeçalho com faixa, linha, monograma sem logo e seta por padrão; o bloco da logo inteiro; sem faixa
  vazia com a marca embaixo (backlog 71 sai).
- [ ] Títulos de seção largos, na cor do texto; busca com a altura do item.
- [ ] Vidro no item ativo por `sidebarActiveGlass` (padrão `'on'`, `'off'` desliga), em todo estilo; item inativo apagado a 4,5:1 (D9, 1.1-b).
- [ ] Respiro igual ao vão entre seções abaixo do topo, nas duas posições da marca; busca e rodapé alinhados à coluna dos itens.
- [ ] Nenhum item atrás do rodapé, a 1440×900 e 1280×720; o Dot Matrix alinhado e sem truncar.
- [ ] Composição padrão do D4; rodapé em linhas da altura do item; ⚙ fora de baixo do usuário.
- [ ] Widget não ligado: ausente em produção; linha apagada e aviso fora de produção.
- [ ] Usuário com nome acima do papel e faixa igual em todos os temas; `userAvatarStyle` com os dois valores.
- [ ] Tabela das sobrescritas dos 25 temas, com nenhuma cor de tema alterada.
- [ ] `FileSearch` e `GitBranch` nas três famílias.
- [ ] Sub-abas recolhíveis pela porta `navItems`, com filho ativo abrindo o grupo, recuo e anatomia do ativo no filho (D8).
- [ ] Contraste e Personalidades verdes; `troca-de-tema` dentro do teto.
- [ ] Paridade de token verde; `docs/migracoes.md` (padrões que mudaram, widget ausente em produção, token novo); gerados em dia.
- [ ] Suíte completa verde; `tsc` 0; baseline sem regressão; Anel 1; `npm run build`.
- [ ] **Prévia para o dono** em `C:\tmp\sarak-previa-165\index.html`, por lote, com capturas reais, em **três temas** (pedido do dono,
  2026-11-13: não precisa de todos): `sarak-sovereign-classic`, `cyberpunk-neon-classic` e `sarak-sovereign`. Cada um mostra a foto
  antiga, a barra de antes desta plan (as da `C:\tmp\sarak-previa-barra\`) e a de depois, mais a barra recolhida e o modo claro de
  dois deles. **A barra do topo também**, nos mesmos três temas, antes e depois, sempre que o lote mudar algo que chega a ela.
  O lote só fecha com o ok do dono nela.

# 7. Como verificar (uso do revisor)

**Gate:** teste: o spec de navegador da anatomia e os testes de unidade de D5 e D6. Nenhuma regra de gate nova.

- Antes do lote 1: leio o spec e confiro que os casos reprovavam (resumo).
- Cada lote: abro a prévia, comparo três temas com a foto antiga e levo a prévia ao dono antes do veredito.
- Lote 1: mutação em cópia fora do repositório. O marcador volta à cor de destaque e o caso reprova; o rodapé volta a cobrir a
  lista e o caso reprova.
- Lote 2: teste de D5 nos dois ambientes; `git diff` de `preferences.ts` com só os padrões do D4.
- Lote 3: confiro a tabela das sobrescritas contra o `git diff` dos temas, e confiro que nenhuma cor de fundo, texto ou marca mudou.

# 8. Destino da síntese

**Destino:** `specs/05-cromo-e-slots.md + specs/09-temas-e-presets.md`

- **`05`:**
  - §2.1: a anatomia da barra lateral (moldura, cabeçalho, seções, item ativo, rodapé em linhas, usuário); em "Grupos", que
    `SarakNavItem` também aceita `children` e `defaultExpanded` (D8);
  - §2.2.1: o widget não ligado não aparece em produção (D5);
  - §2.2.2: a composição padrão do D4.
- **`09`:** §4.3.4, os papéis da barra na paleta (marcador e ativo na primária, ícone e seção na cor do texto); §5, a regra da
  sobrescrita de barra nos temas.
- **ADR-014:** nota de revisão sobre o D5 (o widget por padrão continua; em produção, sem dado, não aparece).
- O spec da anatomia fica como trava.

---

# 9. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only: cada rodada acrescenta um bloco novo; nada é removido. -->

## Resumo da execução (spec da anatomia + lote 1) — 2026-11-13

**Resultado:** Concluído com pendências. As 11 reprovações que sobram vêm de valores que os próprios temas declaram (escopo do lote 3), não do cromo nem da paleta.

**Chegada fora do fluxo.** A plan chegou em `🔴 A executar`, e o lote 1 da `plan-158`, de que ela depende, está em `🔵 Em correção`, sem commit, no mesmo worktree. O dono pediu, na conversa, para executar e terminar em `🟠`. Os arquivos da 158 (hooks do Provider, `palette/resolve.ts`, `useDesignDraft.ts`) não se cruzam com os deste lote. Não editei `resolve.ts`.

**Estado do worktree ao iniciar**
```
 M docs/migracoes.md
 M docs/persistencia-de-tema.md
 M docs/schema/postgres.sql
 M docs/schema/sqlite.sql
 M sarak-ui/GUIA-FRONTEND.md
 M sarak-ui/START-HERE.md
 M sarak-ui/VERSION
 M sarak-ui/catalog.json
 M sarak-ui/docs/migracoes.md
 M specs/00-backlog.md
 M specs/00-indice.md
 M specs/plan/plan-158-design-gravado-guarda-escolhas-e-aplica-sem-atraso.md
 M specs/plan/plan-159-cromo-real-segue-o-layout-escolhido.md
 M src/core/Design/palette/resolve.ts
 M src/core/Provider/__tests__/TenantPersistence.test.tsx
 M src/core/Provider/hooks/__tests__/useDesignManager.test.ts
 M src/core/Provider/hooks/useDesignManager.ts
 M src/core/Provider/hooks/useDesignRemoteLoader.ts
 M src/core/Provider/hooks/useDesignSync.ts
 M src/core/Provider/types.ts
 M src/core/Provider/utils/resolveStorageKey.ts
 M src/features/DesignEngine/Main/__tests__/LoginThemeApplication.test.tsx
 M src/features/DesignEngine/hooks/__tests__/themeApplication.persistenceIntegration.test.tsx
 M src/features/DesignEngine/hooks/__tests__/useDesignDraft.persistenceIntegration.test.tsx
 M src/features/DesignEngine/hooks/useDesignDraft.ts
 M src/index.ts
?? specs/plan/plan-165-barra-lateral-volta-a-anatomia-antiga.md
?? src/core/Provider/designFormatTypes.ts
?? src/core/Provider/hooks/__tests__/useDesignChoices.test.ts
?? src/core/Provider/hooks/useDesignChoices.ts
?? src/core/Provider/utils/__tests__/designChoices.test.ts
?? src/core/Provider/utils/designChoices.ts
?? src/features/DesignEngine/hooks/__tests__/designGravadoEscolhas.persistenceIntegration.test.tsx
```

### Antes do lote 1 — o spec que reprova

`browser-tests/barra-lateral-anatomia.spec.ts` + `browser-tests/fixtures/barra-lateral-anatomia-entry.tsx`. O conteúdo é o da medição: marca "Sarak OS" (sem logo; `?logo=1` põe um), "Personalização" com 1 item, "Relatórios" com 5 e "Sessões TCE-SP" ativo, ícones, `user` + `logout`, uma notificação, idiomas `pt`/`en`, 1440×900, modo escuro, e os quatro temas pedidos. São 14 casos por tema, 56 no total. O spec lê o código-fonte (`useSourceLibrary: true`) com `dist/sarak.css`, porque o `dist/` é compartilhado e o `build` encadeia todos os gates.

**Rodado sobre o código de antes**, numa cópia do worktree fora do repositório (`C:\tmp\sarak-165-antes`, com junção para `node_modules`, já removida): **15 passam, 41 reprovam.**

| Caso | sovereign-classic | dot-matrix | cyberpunk-neon-classic | sarak-sovereign |
|---|---|---|---|---|
| marcador na cor da primária | ✗ (magenta: acento) | ✗ (sem marcador: `pill`) | ✗ (sem marcador: `filled`) | ✗ (acento) |
| fundo do ativo com alfa ≤ 0,15 | ✗ 0,6 | ✗ | ✗ | ✗ 0,6 |
| texto ativo a 4,5:1 | ✓ | ✓ | ✓ | ✓ |
| ícone inativo na cor do rótulo | ✗ | ✗ | ✗ | ✗ (primária) |
| moldura: raio do tema e 1 px | ✗ raio 0 | ✗ | ✗ | ✗ raio 0 |
| cabeçalho: faixa, linha, monograma, seta | ✗ 75 px, sem linha | ✗ | ✗ | ✗ |
| cabeçalho com logo sem corte | ✗ | ✗ | ✗ | ✗ |
| marca embaixo sem faixa vazia | ✗ (sem seta no topo) | ✗ | ✗ | ✗ |
| títulos de seção | ✗ (0,1 em) | ✗ | ✗ | ✗ |
| busca da altura do item | ✗ (+16 a +26 px) | ✗ | ✗ | ✗ |
| itens à esquerda, ativo sem truncar | ✓ | ✗ ("Sessões T…") | ✓ | ✓ |
| nenhum item atrás do rodapé, 1440×900 | ✓ | ✓ | ✓ | ✓ |
| nenhum item atrás do rodapé, 1280×720 | ✓ | ✓ | ✓ | ✓ |
| recolhida: monograma, centro, marcador | ✗ (sem monograma) | ✗ | ✗ | ✗ |

**Dois erros do próprio spec, achados e corrigidos durante a execução.** "itens à esquerda" usava `SUBPIXEL` dentro do `page.evaluate`, e "busca" media o gatilho de ícone escondido, de altura 0. Os dois reprovavam por motivo errado na primeira rodada (44 reprovações). A tabela já traz os dois casos rodados de novo, com o spec corrigido, sobre a mesma cópia do código de antes (8 casos: busca reprova nos 4 temas, alinhamento só no Dot Matrix). O caso do marcador passou a comparar com `--sarak-btn-primary-bg`, a semente exata da primária, e não com `--theme-primary` (ver Decisões). Rodado de novo sobre a cópia, ele continua reprovando nos 4 temas.

**"Nenhum item atrás do rodapé" já passava antes**, nos 4 temas e nas duas resoluções. A lista rola, e todo item fica alcançável. O defeito da medição (§2) não se reproduz com este conteúdo. O que se via no Dot Matrix era o último item visível cortado pela borda da lista rolável, e esse caso segue como trava.

### Lote 1

**O que foi feito**
- `src/core/Design/palette/role-map.ts`: `sidebarActiveColor` → primária na semente a 10%; `navActiveMarkerColor` → primária na semente; `sidebarIconColor` → o mesmo papel de `sidebarItemTextColor` (neutra 800/100); `sidebarCategoryColor` → neutra 950/50, o texto forte da barra (sai da secundária); `sidebarBrandBackground` → primária a 5%, o fundo tingido da faixa (era acento sólido). (1.1, 1.3, 1.4)
- `src/core/Design/schema/navigation.ts:436`: o padrão sem paleta de `sidebarIconColor` passa de `#19e3f0` para `rgba(242,246,251,0.72)`, o padrão de `sidebarItemTextColor`, e o texto de uso diz isso. É "onde mais o padrão nascer" (1.1).
- `src/core/Design/schema/preferences.ts`: `preferenceNavCollapsePosition` passa a `pinned` (D2, 1.3).
- `src/components/Layout/chrome/sidebarFrame.ts` (novo) + `ChromeSidebarBody.tsx`: moldura de cartão. O raio vem de `--sarak-border-radius`, e a borda `edge` vale nos quatro lados. Com margem zero, o raio e as linhas dos lados colados viram 0, por `min(valor, margem × 1000)`, sem o cromo ler a margem por breakpoint. A flutuante não muda. (1.2)
- `ChromeSidebarHeader.tsx`: faixa com altura `--sarak-topbar-height`, linha embaixo (`--sarak-border-width` na cor `--sarak-sidebar-border-color`) e fundo `--sarak-sidebar-brand-bg`. Com a marca embaixo, o topo é só a seta, sem altura mínima (backlog 71). Sem marca e sem seta, o topo não é renderizado. (1.3)
- `ChromeSlots.tsx` (`ChromeBrand`): prop `band`. Na faixa, a marca não pinta fundo próprio (fim do bloco estreito e cortado) e, sem logo, mostra o monograma (`data-sarak-brand-monogram`: a inicial sobre o gradiente da primária, no raio do tema), que fica sozinho na lateral recolhida. Fora da faixa (barra do topo, marca no rodapé), nada muda. (1.3, 1.7)
- `SarakShellNav.tsx`: na vertical, o recuo e o vão passam a ter teto proporcional à largura da barra: `min(--sarak-layout-gap-md, largura/15)` e `min(--sarak-layout-gap-sm, largura/30)`, ou seja, 16 e 8 px em 240. Títulos de seção em `text-sm`, negrito, caixa alta, espaçamento 0,2 em, com truncamento. A horizontal não muda. (1.4, 1.6)
- `SarakShellSearchWidget.tsx`: prop `menuItemHeight`. O campo tem a altura do item lateral na densidade do tema: a maior entre ícone e linha, mais o respiro. `ChromeSidebarBody` liga a prop. A dica do atalho continua escondida (D3). (1.5)
- **Causa do Dot Matrix (1.6):** do cromo, não do tema. A `nav` vertical usava `--sarak-layout-gap-md/sm` (espaçamento de página) como recuo e vão, e o tema declara 48/24 px: os itens ficavam com 143 px numa barra de 240, pareciam centralizados e truncavam. Com o teto, ficam com 210 px.
- Testes de unidade atualizados para os padrões novos, mais 3 casos novos em `ChromeSidebarHeader.test.tsx` (monograma, marca embaixo sem faixa, topo vazio não renderiza) e 1 em `role-map.test.ts` (papéis da barra).
- Gerados: `npx tsx scripts/generate-token-types.ts`, `npm run catalog`, `npm run guide`, `npm run dev-kit`, `npm run build:css`.
- `docs/migracoes.md`: entrada "9.0.0 — a barra lateral volta à anatomia da lib antiga", com a tabela dos padrões que mudaram.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `browser-tests/barra-lateral-anatomia.spec.ts` | criado | spec da anatomia, 56 casos |
| `browser-tests/fixtures/barra-lateral-anatomia-entry.tsx` | criado | fixture com o conteúdo da foto |
| `src/core/Design/palette/role-map.ts` | alterado | cinco papéis da barra |
| `src/core/Design/schema/navigation.ts` | alterado | padrão e uso de `sidebarIconColor` |
| `src/core/Design/schema/preferences.ts` | alterado | `preferenceNavCollapsePosition` → `pinned` |
| `src/components/Layout/chrome/sidebarFrame.ts` | criado | moldura de cartão |
| `src/components/Layout/chrome/ChromeSidebarBody.tsx` | alterado | aplica a moldura; liga `menuItemHeight` |
| `src/components/Layout/chrome/ChromeSidebarHeader.tsx` | alterado | faixa da marca; topo só com a seta |
| `src/components/Layout/chrome/ChromeSlots.tsx` | alterado | `ChromeBrand` com `band` e monograma |
| `src/components/atomic/Navigation/SarakShellNav.tsx` | alterado | recuo e vão da vertical; títulos de seção |
| `src/components/atomic/Navigation/SarakShellSearchWidget.tsx` | alterado | `menuItemHeight` |
| `src/components/Layout/chrome/__tests__/ChromeSidebarBody.test.tsx` | alterado | moldura e seta fixa por padrão |
| `src/components/Layout/chrome/__tests__/ChromeSidebarHeader.test.tsx` | alterado | faixa, monograma, topo sem faixa |
| `src/components/Layout/chrome/__tests__/ChromeTopbarBody.test.tsx` | alterado | recolher fixo por padrão |
| `src/components/Layout/chrome/__tests__/useChromeDefaultWidgets.test.ts` | alterado | `showCollapse` verdadeiro por padrão |
| `src/core/Design/palette/__tests__/role-map.test.ts` | alterado | papéis novos da barra |
| `src/core/Design/palette/__tests__/three-bands.test.ts` | alterado | marcador é a semente primária; categoria sai da lista de texto da secundária |
| `src/core/Design/schema/__tests__/preferences.test.ts` | alterado | padrão do recolher |
| `src/core/Provider/generated/design-token-docs.json` | gerado | texto e padrão de `sidebarIconColor` |
| `docs/component-catalog.json` · `.md` | gerado | prop `menuItemHeight` |
| `sarak-ui/*` · `sarak-dev/*` | gerado | `npm run guide` / `npm run dev-kit` |
| `dist/sarak.css` | gerado | `npm run build:css`, para o spec ler as classes novas |
| `docs/migracoes.md` | alterado | entrada nova no topo; o resto do arquivo (de outra tarefa) intacto |

**Verificações executadas**
- Spec da anatomia, código de antes (cópia fora do repositório) → 15 passam / 41 reprovam (tabela acima).
- Spec da anatomia, depois do lote 1 → **45 passam / 11 reprovam**. As 11, todas por sobrescrita do tema (lote 3):
  - `sarak-sovereign-classic`: fundo ativo 0,6 (`sidebarActiveColor: 'rgba(0, 88, 93, 0.6)'`); ícone (`sidebarIconColor: '#62d9e1'`); moldura sem linha (`sidebarBorderSide: 'none'`); título roxo (`sidebarCategoryColor: '#835cff'`).
  - `dot-matrix-elegant`: sem marcador no ativo, aberta e recolhida (`sidebarActiveItemStyle: 'pill'`).
  - `cyberpunk-neon-classic`: sem marcador, aberta e recolhida, e fundo ativo opaco (`sidebarActiveItemStyle: 'filled'`); ícone (`sidebarIconColor: '#62e37a'`); título magenta (`sidebarCategoryColor: '#ff00ff'`).
  - `sarak-sovereign`: 14/14.
- `npx vitest run src/core/Design/palette src/components/Layout/chrome src/components/atomic/Navigation src/core/Design/schema src/core/Provider/__tests__/manifest.test.ts src/features/DesignEngine/utils/__tests__/decisions.test.ts` → 66 arquivos, 750 testes, todos verdes. A primeira rodada deu 15 vermelhos, todos de testes que fixavam os padrões antigos; corrigidos acima.
- `npm run verify -- --tier=quick` → **nível "quick" verde**. No caminho ele acusou: `token-types:check` (regenerado); `guide:check` e `catalog:check` (regenerados); `variable-contract:check`, porque eu tinha usado `--spacing`/`--text-sm` do Tailwind, que nenhum token escreve (troquei pelos valores da escala); `audit:baseline` hardcoded 0 → 6, porque tinha usado `p-4`, `gap-2`, `px-3` e unidades fixas (o recuo e o vão passaram a token com teto proporcional; ver Decisões para as três isenções).
- `npm run -s migration-anchor:check` → OK.

**Critérios de aceite (os do lote 1)**
- [x] Spec da anatomia criado antes do código, com os casos que reprovavam listados — evidência: tabela acima.
- [ ] Item ativo nos quatro temas — **parcial**: `sarak-sovereign` 4/4; marcador na primária também no `sarak-sovereign-classic`. Os demais reprovam pela sobrescrita do tema (lote 3). Os estilos `filled`/`outline`/`underline` não foram tocados (`SarakMenuItem.tsx` sem diff).
- [x] Moldura com raio por token (`borderRadius`) — spec ✓ em 3 temas; o 4º é `sidebarBorderSide: 'none'` do tema.
- [x] Cabeçalho com faixa, linha, monograma e seta por padrão; logo inteiro; sem faixa vazia com a marca embaixo — spec ✓ nos 4 temas (3 casos × 4).
- [ ] Títulos largos na cor do texto — espaçamento ✓ nos 4; cor ✓ em 2; os outros 2 declaram a cor (lote 3).
- [x] Busca com a altura do item — ✓ nos 4.
- [x] Nenhum item atrás do rodapé a 1440×900 e 1280×720; Dot Matrix alinhado e sem truncar — ✓ nos 4 (o rodapé já não cobria antes; ver acima).
- [ ] Recolhida com marcador — ✓ em 2; os 2 sem marcador são `pill`/`filled` do tema.
- [x] `docs/migracoes.md`; gerados em dia (`guide:check`, `dev-kit:check`, `catalog:check` e `token-types:check` verdes no quick).
- [x] Prévia: `C:\tmp\sarak-previa-165\index.html`.

**Decisões e suposições**
- **Raio da moldura:** usei o token existente `borderRadius` (`--sarak-border-radius`), cujo uso já é "raio de referência dos componentes sem raio próprio". Não criei `sidebarRadius`.
- **"A primária do tema" no spec é a semente** (`--sarak-btn-primary-bg`, papel `primary` na base, exata). `--theme-primary` é a primária de texto, que a paleta anda até ter contraste: nos dois Classic ela sai quase branca (`rgb(232,247,248)`), e o marcador, como na foto antiga, é o ciano da semente.
- **Linha nos quatro lados com `sidebarBorderSide: 'edge'`:** para a lateral destacada (com margem), todos os lados são "externos". Os outros valores (`none`, `right`…) mantêm o comportamento que já tinham.
- **Tom contrastante da barra** (`sidebarTone` `primary`/`secondary`/`inverse`, em `palette/tone-plan.ts`): não mexi. Nesses tons o fundo ativo continua branco a 20%, porque a primária a 10% não aparece sobre uma barra pintada de primária. Nenhum dos quatro temas do spec chega a esse caminho (os dois Classic sobrescrevem as cores).
- **Tamanho do título de seção: `text-sm`**, medido na foto: "PERSONALIZAÇÃO" ocupa ≈161 px de largura e "RELATÓRIOS" tem ≈10 px de altura de maiúscula, o que dá 14 px. Peso 700.
- **Três isenções `sarak-allow-hardcode`**, com a razão no próprio literal: o espaçamento 0,2 em do título (proporção da fonte, sem token) e as medidas que espelham as classes do `SarakMenuItem` na busca (`py-1.5/2.5/3` e `text-sm`, sem token), para o campo medir igual ao item.
- **D2 também chega à barra do topo:** com o recolher `pinned` por padrão, o modo topo passa a mostrar o botão de menu. É consequência direta do padrão (`ChromeTopbarBody.test.tsx` atualizado), e a nota de migração diz isso.
- **`sidebarBrandBackground` passou a pintar a faixa inteira, inclusive sem logo.** O papel novo é primária a 5%. Tema que declara cor sólida mostra a faixa sólida (Sovereign Classic: `#340029`, magenta escuro).

**Achados fora do escopo (não corrigidos)**
- **Arquivos modificados que não estavam na fotografia e que eu não toquei.** Outra tarefa está rodando no mesmo worktree:
  - `.agents/skills/git-ci-cd/SKILL.md`, `.agents/skills/ui-criar-tema/SKILL.md` e as cópias em `.claude/skills/`;
  - `.githooks/pre-commit`, `gates/scripts/contrato/check-agent-git-write.mjs`, `gates/scripts/contrato/check-zero-brand.mjs`;
  - `specs/specs/00-regras-e-invariantes.md`, `06-…`, `08-…`, `09-…`;
  - `src/features/DesignEngine/Library/CustomizationPanel/CustomizationPanelImpl.tsx`, `Main/ThemeCustomizationTab.tsx`, `Main/components/ThemeSidebarContent.tsx` (+ teste), `Panels/HyperGranularityTab.tsx` (+ teste);
  - **removidos:** `Panels/LayoutTab.tsx`, o teste e o snapshot.

  Os gerados que eu rodei (`catalog`, `guide`, `dev-kit`) leem a árvore inteira, então podem refletir também essas mudanças.
- **A primária de texto quase branca nos Classic** (`--theme-primary` = `rgb(232,247,248)` no `sarak-sovereign-classic` escuro) deixa o texto do item ativo branco, e não ciano como na foto. É o ajuste de contraste da paleta. Pede decisão: no lote 3 (o tema declara `navItemActiveColor`) ou na paleta.
- **`sidebarBorderSide` não está na lista de tokens do lote 3 (§5, 3.1),** mas o `sarak-sovereign-classic` declara `'none'` e por isso fica sem a moldura da foto. Sugiro incluí-lo.

**Pendências / riscos**
- As 11 reprovações do spec ficam vermelhas até o lote 3. Não usei `test.fail`/`skip`. Se a CI do navegador rodar este spec antes do lote 3, ele reprova.
- Não rodei a suíte completa, `build`, Anel 2 nem os specs de navegador vizinhos (`plan-145-personalidades`, `seletor-da-barra-legivel`, `plan-124-sidebar-contrast`, `troca-de-tema`, `plan-149-barras-personalidade`). Eles leem a barra e podem acusar a mudança de papéis, moldura ou cabeçalho; ficam com o revisor (§3, item 8).
- A prévia mostra o rodapé e o usuário de hoje (lote 2).

## Correção do lote 1 (veredito 1 a 3, prévia do dono, pedidos) — 2026-11-13

**Resultado:** Concluído com pendências. Os achados 1 a 3, o D9 e o 1.1-b, o respiro do 1.3 e os pedidos do dono estão feitos. O spec da
anatomia fica em 69 ✓ / 15 ✗, e as 15 reprovações vêm de sobrescritas dos próprios temas (lote 3). O rodapé fica para o lote 2.

**Achado 1 — sub-abas pela porta `navItems` (1.8, D8)**
- `chrome/navItem.ts`: `SarakNavItem` ganha `children?: SarakNavItem[]` e `defaultExpanded?: boolean`. A conversão foi para dois ajudantes,
  `toShellNavItems` (repassa os filhos de um nível e o `defaultExpanded`; neto é ignorado) e `findActiveNavItemHref` (procura o `active`
  também nos filhos). `SarakAppChrome.tsx` usa os dois (o arquivo estava em 249 linhas). Quem não passa `children` recebe o mesmo de antes.
- O grupo, o balão e a gaveta são os do `nav` (`ShellNavGroup`, `ShellNavFlyout`), sem mudança. O filho ativo abre o grupo pela regra que
  já existia (`initialExpansion`).
- `internal/ShellNavEntry.tsx`: a sub-aba recuava `1,5 × --sarak-layout-gap-md` (72 px no Dot Matrix). Agora recua até o rótulo do pai:
  recuo do item, mais o ícone, mais o vão, pela métrica da densidade.
- Testes: `chrome/__tests__/navItem.test.tsx` (novo, 7 casos: conversão aditiva, filhos e `defaultExpanded`, neto ignorado, ativo entre
  os filhos, filho ativo abre o grupo e recebe `aria-current`, `defaultExpanded` abre sem ativo). A fixture do spec passou a usar
  `navItems` e ganhou o grupo "Vendas" ("Comercial": Pedidos, Orçamentos com selo `12`, Clientes) e `?route=`. Dois casos novos no spec:
  abre e fecha pela seta (clique, Enter e Espaço); filho ativo abre o grupo, recua mais de 8 px, tem marcador na primária, fundo ≤ 0,15
  e vidro, e o selo não trunca "Orçamentos" a 1440.

**Achado 2 — os specs de navegador vizinhos.** Rodei depois de `npm run build` (eles leem o `dist/`), com
`--config=browser-tests/playwright.config.ts` (o `globalSetup` prepara o harness) e o 124 pela configuração isolada dele:

| Spec | Resultado | Observação |
|---|---|---|
| `plan-145-personalidades` | 1 ✓ | — |
| `seletor-da-barra-legivel` | 6 ✓ | — |
| `plan-124-sidebar-contrast` | 1 ✓ | — |
| `troca-de-tema` | 4 ✓ | dentro do teto |
| `plan-149-barras-personalidade` | 29 ✓ / 1 ✗ → 30 ✓ | "marca sem logo: nenhuma caixa colorida…" fixava o desenho velho: o fundo da marca só numa caixa atrás do logo, e nada sem logo. O 1.3 pôs esse fundo na faixa inteira, com ou sem logo. É a anatomia nova, não regressão. Atualizei o caso: a faixa pinta o fundo nos dois casos, nenhuma caixa colorida menor dentro dela, e recolhida não sobra fundo. |

**Achado 3 — uma fonte só para a métrica do item.** `src/components/atomic/Navigation/menuItemMetrics.ts` (novo) guarda as classes
da linha vertical por densidade (`gap-2 px-2 py-1.5`, `gap-3 px-3 py-2.5`, `gap-4 px-4 py-3`) e o `text-sm`. O `SarakMenuItem` aplica as
classes, e a busca (`verticalMenuItemHeight`) e o recuo da sub-aba (`nestedMenuItemIndent`) **leem o passo dessas mesmas classes**, sem
número repetido. Mudou a classe, a busca muda junto. Os três literais isentos da busca saíram; ficaram duas isenções no módulo, com
razão: o tamanho e a linha do `text-sm` e o passo da escala (0,25 rem). O módulo também guarda o recuo, o vão e o vão entre seções da lista
(saíram do `SarakShellNav`). Teste: `__tests__/menuItemMetrics.test.tsx` (novo). Ele confere a altura calculada nas três densidades
(32, 40 e 44 px), que o item leva as classes do módulo e a busca a altura derivada delas em cada densidade, e que a classe do chamador
continua vencendo (R35).
- Primeira tentativa descartada: variáveis locais declaradas no `style` do item. O `auditor_ghostvars` acusou 7 consumos sem emissor
  (ele só aceita schema, CSS e o hook de runtime). Voltei para as classes.

**D9 e 1.1-b — vidro e item inativo apagado**
- Token novo `sidebarActiveGlass` (`'on'` | `'off'`, padrão `'on'`):
  - nas três fontes (`schema/navigation.ts`, `theme_table_mapping.json`, partição `layout_and_navigation.json`);
  - no `useNavigationAppearance`;
  - no painel, na pergunta "how" da decisão da barra (`design-decisions.json`), logo depois de `sidebarActiveItemStyle`.
- Consumo no `SarakMenuItem`: o item vertical ativo, em qualquer estilo, ganha `inset 0 0 20px` da cor do marcador a 5%
  (`color-mix`), o brilho da antiga. Uma isenção, para o raio de 20 px. Com `'off'`, nada. O topo não ganha vidro.
- Testes de unidade: os 5 estilos com o vidro, e `'off'`, inativo e horizontal sem ele.
- Casos no spec: com `'on'` a sombra tem `inset`, e com `'off'` não tem, nos 4 temas.
- **O gate de completude obriga todo tema a declarar o token estético novo.** Os 25 temas ganharam uma linha
  `sidebarActiveGlass: 'on'`, o próprio padrão, sem efeito visual. É arquivo de tema, que é do lote 3; o gate não deixa esperar. Nenhuma
  cor mudou.
- **A cobertura dos presets exige preset ou motivo.** `sidebar-clean` ("Limpa") leva `'off'` e `sidebar-floating` ("Flutuante") leva
  `'on'`.
- `role-map.ts`: `sidebarItemTextColor` e `sidebarIconColor` passam de neutra 800/100 para **600/400**, o tom apagado. O par de 4,5:1 da
  paleta (`contrast-pairs.ts:49`) segura o piso. O passar do mouse continua 950/50. Os tons contrastantes da barra não mudam (decisão
  aceita na rodada anterior).
- Caso no spec: o rótulo inativo tem contraste menor que o do ativo e ainda 4,5:1. Passa em 3 temas. No Sovereign Classic reprova
  (inativo 17,3 × ativo 12,2) porque **o tema declara `sidebarItemTextColor` quase branco**, o que vai para o lote 3.

**1.3 — respiro abaixo do topo, nas duas posições da marca.** `ChromeSidebarBody.tsx`:
- A busca no topo usa o recuo lateral da lista (`VERTICAL_NAV_PADDING`) e, acima dela, o vão entre seções
  (`VERTICAL_NAV_SECTION_GAP` = 2 × o vão da lista, o mesmo que separa a última linha de uma seção do título da próxima).
- A busca embaixo usa o mesmo recuo.
- O `ChromeSearchSlot` aceita `style`.
- Casos no spec (marca no topo e embaixo):
  - topo → busca ≥ 8 px e igual ao vão entre seções (±1 px);
  - borda esquerda da busca igual à dos itens (±1 px).

  Passam nos 4 temas.

**Spec da anatomia.** 21 casos por tema, 84 no total (eram 14 e 56): vidro ligado e desligado, inativo apagado, respiro nas duas
posições e as duas sub-abas. Os seletores dos casos antigos passaram a contar só os itens de primeiro nível. Resultado final:
**69 ✓ / 15 ✗.** Passam nos 4 temas: os 8 casos de respiro e vidro e a abertura das sub-abas. As 15 reprovações:
- as 11 da rodada anterior, todas sobrescrita de tema (lote 3);
- 3 do caso de sub-aba ativa, pelas mesmas sobrescritas: Sovereign Classic com o ativo a 0,6, Dot Matrix com `pill` e Cyberpunk Neon
  Classic com `filled`, que não têm marcador;
- 1 do inativo apagado no Sovereign Classic (`sidebarItemTextColor` do tema).

A última rodada usou `--workers=1 --timeout=120000`, porque a suíte da 158 ocupava a CPU e o `beforeAll` (montagem do harness) passou
de 30 s. O spec não mudou para isso.

**Prévia** em `C:\tmp\sarak-previa-165\index.html`, nos três temas pedidos (`sarak-sovereign-classic`, `cyberpunk-neon-classic`,
`sarak-sovereign`), com capturas reais do código final:
- foto antiga, antes desta plan, rodada 1 e agora;
- marca embaixo;
- sub-abas com "Pedidos" ativo;
- vidro ligado e desligado;
- recolhida e modo claro de dois temas;
- com logo.

**A barra do topo, antes e depois, nos três temas.** O "antes" é o último commit, numa cópia fora do repositório, já removida. A prévia
explica as duas mudanças que chegam ao topo:
- o marcador na primária: não aparece nesses três temas, porque o ativo do topo deles é preenchido ou pílula;
- o botão de recolher (D2), que **espera a decisão do dono**.

A prévia da rodada 1 ficou guardada em `C:\tmp\sarak-165-previa-rodada1.html`.

**Verificação**
- `npx vitest run` completo, rodada no meio da edição: 5878 ✓ / 17 ✗. As 17 eram:
  - 9 de arquivos que eu editava enquanto ela rodava;
  - `useNavigationAppearance` (token novo);
  - `chromePreferencePlacement`: o padrão `pinned` da **rodada 1**, que eu não tinha rodado;
  - dois snapshots, `PreviewCanvas` e `AtmosphereCatalog`. Os dois mostravam só o `pinned`, a anatomia do cabeçalho e os tokens de barra
    desta plan, conferidos chave a chave antes do `-u`, rodado só nos dois arquivos;
  - completude dos temas;
  - cobertura de presets.

  Corrigidos os 17, rodei de novo os arquivos afetados (Navigation, Layout, `src/core/Design`, Canvas do painel, os dois testes do
  Provider e o do gate de completude): **441 arquivos, 1564 ✓, 0 ✗.**
- `npm run build` verde.
- `npm run verify -- --tier=quick` verde (Anel 0 simulado: 0 achados).
- `npm run audit:baseline -- --with-tsc`: igual ao baseline. No meio, ele acusou 7 variáveis-fantasma e um arquivo de 260 linhas (a
  primeira tentativa do achado 3); depois de trocar, voltou a zero.
- `variable-contract:check`, `theme-completeness:check` (25/25), `token-types`/`token-docs`, `chrome-token-parity`, `token-reader`,
  `barrel:check`, `catalog:check`, `guide:check`, `dev-kit:check` e `themes:catalog:check` verdes.
- `token-release-notes:check` reprova: o gate é do gancho `version`, e com o `package.json` em 8.0.0 ele procura `sidebarActiveGlass`
  na seção 8.0.0. O token está na entrada 9.0.0 de `docs/migracoes.md`, onde a release o procura.

**Arquivos desta rodada**
- **Novos:** `menuItemMetrics.ts`, `__tests__/menuItemMetrics.test.tsx`, `chrome/__tests__/navItem.test.tsx`.
- **Editados:**
  - `SarakMenuItem.tsx`, `SarakShellSearchWidget.tsx`, `SarakShellNav.tsx`, `internal/ShellNavEntry.tsx`;
  - `chrome/navItem.ts`, `SarakAppChrome.tsx`, `ChromeSidebarBody.tsx`, `ChromeSlots.tsx`;
  - `palette/role-map.ts`, `schema/navigation.ts`, `useNavigationAppearance.ts`;
  - as duas fontes de catálogo e `design-decisions.json`;
  - os 25 temas (uma linha cada) e `presets/components/layout.ts`.
- **Testes:** `SarakMenuItem`, `ShellNavEntry`, `useChromeDesignTokens`, `useNavigationAppearance`, `chromePreferencePlacement` e os
  dois snapshots.
- **Navegador:** o spec e a fixture da anatomia, e o caso do `plan-149`.
- **Gerados:** `design-token-ids.ts`, `design-token-docs.json`, catálogo, `sarak-ui/`, `sarak-dev/` e `dist/`.
- **Docs:** `docs/migracoes.md`, na entrada 9.0.0 da anatomia, com seis linhas novas na tabela: inativo apagado, vidro, respiro,
  recuo da sub-aba e `navItems` com sub-abas.

**Convivência com a 158.**
- Nenhum arquivo dela foi tocado: nem `DesignScope`, nem a injeção de variáveis, nem `useDesignDraftSync`, nem as amostras do painel,
  nem `escolha-no-painel.spec.ts`.
- Conferi os processos antes de cada `build` e Playwright. Esperei o Playwright dela terminar antes do `build`, porque o spec dela lê o
  `dist/`.
- Durante a rodada apareceram arquivos dela no índice (`git add` de fora). Não mexi neles.
- Um `vitest` meu ficou órfão quando parei a tarefa (o neto não morre com o `TaskStop`). Encerrei-o pelo PID; era só meu.

**Decisões do executor**
- Fonte única por classe utilitária, com a medida lida do passo da classe, e não por variável CSS local, que o auditor de fantasmas
  recusa. Isso também segura a R35.
- O vidro só no item vertical, porque a D9 fala da barra lateral. O seletor de idioma, que usa itens verticais, também o recebe no ativo.
- Apagado = neutra 600/400. O padrão sem paleta do schema (`rgba(242,246,251,0.72)`) ficou.
- O caso do `plan-149` foi atualizado, não apagado, e manteve as três garantias dele.

**Achados fora do escopo**
- **`sidebarItemTextColor` deve entrar na lista do lote 3 (§5, 3.1).** O Sovereign Classic o declara quase branco, e isso derruba o
  inativo apagado.
- **A busca da barra não acha sub-abas.** `getSarakSearchItems(nav)` não desce em `children`, e isso já valia para o `nav`. Pode ir para
  o backlog.
- **No topo, "Relatório de Encerramento" e o grupo "Vendas" ficam fora da área visível** a 1440 com este conteúdo (a lista rola na
  horizontal). Isso já era assim antes; aparece na prévia do topo.

**Pendências / riscos**
- As 15 reprovações do spec ficam até o lote 3, sem `skip`.
- Botão de recolher no topo: decisão do dono, depois de ver a prévia.
- Não rodei a suíte completa de novo depois das correções; rodei os 441 arquivos afetados.

## Correção 1.10 (Contornada × Flutuante, achado 4) — 2026-11-13

**O que o spec mostrava.** Repeti a medida do achado: `plan-141-presets-do-painel.spec.ts:206`, Layout no claro, dava
`sidebar-outlined × sidebar-floating = 1,66%`. No escuro dava 4,75%. Na amostra do painel as duas eram a mesma barra:
- mesma superfície;
- contorno nas duas, porque a moldura de cartão da anatomia vale para toda barra e esconde o `'all'` da Contornada;
- o desfoque não aparece, porque o fundo é opaco;
- o vidro do ativo (5%) não se vê.

Só o item ativo as separava (linha × pílula clara).

**O que mudou: só o preset `sidebar-floating`** (`presets/components/layout.ts`):
- `sidebarBorderSide` passa de `'all'` (com estilo e largura) para `'none'`;
- ganha `sidebarBackgroundStyle: 'gradient'`, o brilho de vidro do degradê que a lib já tem;
- pílula, vidro ligado, raio 20 e densidade confortável ficam.

A Contornada, a anatomia, o spec do 141 e o renderizador da barra não mudaram.
- A descrição da Flutuante deixou de dizer "Contornada" e ficou "Sem contorno, num vidro em degradê e com itens em pílula: parece solta da
  tela", nos 6 idiomas (`i18n/presetTexts/layout.ts`).
- As personalidades Moderno e Vidro usam a Flutuante. Elas passam a declarar, nos ajustes próprios (`extra`), a borda que recebiam dela
  (`'all'`, sólida, 1 px), porque o `themeBars.test` exige que os 6 temas ligados a elas sigam a borda da personalidade. Assim os temas e a
  borda das duas personalidades ficam como estavam. O degradê da Flutuante chega às duas personalidades, mas não aos temas.

**Variantes medidas** (spec do 141, Layout, tema `sarak-sovereign`, claro / escuro):

| Flutuante | claro | escuro |
|---|---|---|
| antes (contornada) | 1,66% | 4,75% |
| sem contorno | 2,79% | 5,83% |
| sem contorno + degradê (**escolhida**) | 2,80% | 29,65% |
| sem contorno + degradê + `spacious` | 3,15% | 29,75% |

Descartei a densidade `spacious`: ela somava 0,35 ponto, mas cortava "Relatório de Encerramento" com "…" no Sovereign Classic.

**Medição**

| Verificação | Resultado |
|---|---|
| `plan-141-presets-do-painel.spec.ts` inteiro | 25/25 |
| `cromo-css-real:check` (build + 686 casos) | 669 ✓ / 17 ✗ |
| Spec da anatomia, dentro do check | os mesmos 15 ✗ da rodada anterior, todos sobrescrita de tema do lote 3; nenhum caso novo |
| `cartao-cede-a-classe` (2 ✗) | **falha anterior a esta plan**, ver abaixo |
| Testes de unidade de presets, personalidades, temas, textos e painel | 124 arquivos, 1026 ✓, com o `spacious`; depois da troca, os 30 arquivos de preset e personalidade, 514 ✓ |

O `cromo-css-real:check` rodou com o `spacious`. A troca para `comfortable` veio depois, e por isso o spec do 141 foi rodado de novo inteiro
com o valor final. O preset não entra no spec da anatomia, que usa os tokens do tema.

**`cartao-cede-a-classe` não é desta plan.** O caso "material: o gradiente e o desfoque da classe vencem…" reprova nos dois modos com
`background-image: none`. Para conferir:
- tirei uma cópia do HEAD por `git archive` para `C:\tmp`, com junção para `node_modules`;
- fiz o build nela e rodei o spec: as mesmas 2 reprovações;
- a cópia foi removida.

O `dist/` versionado (rc.5) passa porque foi gerado em outro momento. As classes `from-[…]`/`to-[…]` da fixture não existem em `src/`, e o
`@source` do build varre só `src/` (limite 2 declarado no próprio spec). Vale um item de backlog.

**Prévia** em `C:\tmp\sarak-previa-165\index.html`, na primeira seção: Contornada, Flutuante antes e Flutuante agora, lado a lado, nos três
temas, no escuro e no claro (capturas reais, `img/p110-*`).

**Convivência com a 158.** Não toquei em nenhum arquivo dela. Conferi os processos antes do Playwright e do check. Um primeiro harness do
141 não compilou porque `useDesignChoices.ts` estava no meio de uma edição dela; esperei e repeti.

**Achados fora do escopo**
- **No claro, o degradê quase não aparece:** ele mistura o fundo com 16% de branco, e uma superfície já clara quase não muda. Lá, o que
  separa as duas é o contorno e o item ativo, e a margem é estreita (2,80% contra o teto de 2%).
- **Limpa × Compacta está em 2,04% no claro**, que é o par mais apertado da lateral. Já era assim antes desta correção e não mudou com ela.
- Backlog: `cartao-cede-a-classe` reprova num build novo do HEAD (acima).

---

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->

## Veredito — 2026-11-13 — lote 1 — 🔵 Em correção

**O que conferi e como**
- Plan inteira contra o resumo, item a item do lote 1 (§5, 1.1 a 1.8).
- `git diff` dos 16 arquivos de `src/` do lote; `navItem.ts` e a conversão em `SarakAppChrome.tsx`.
- `npm run -s audit:baseline -- --with-tsc` → igual ao baseline, sem regressão (tsc incluído).
- Prévia `C:\tmp\sarak-previa-165\index.html`: Sovereign Classic e Sarak Sovereign contra a foto antiga. A direção bate: moldura,
  faixa com monograma e seta, títulos largos, marcador em barra na primária, fundo do ativo tênue. Vai ao dono neste veredito.
- Não repeti o quick nem o vitest filtrado do executor. A mutação do §7 fica para a próxima rodada, porque o código ainda muda.

**Decisões do executor que ficam**
- Raio pela `borderRadius` existente, sem `sidebarRadius`: aceito (o uso dela já é esse).
- O spec compara o marcador com a semente (`--sarak-btn-primary-bg`): aceito.
- Linha nos quatro lados com `edge`; tom contrastante sem mudança; título em `text-sm` 700; D2 chegando ao topo, com nota de migração:
  aceitos.
- Achados fora do escopo: `sidebarBorderSide` entrou na lista do 3.1, e o texto ativo dos resgatados vai pelo tema no lote 3
  (`navItemActiveColor`), sem mexer na paleta. Escrevi os dois no 3.1.

**Achados**
1. **Bloqueio — o 1.8 (D8, sub-abas pela porta `navItems`) não foi executado, e o resumo não diz isso.** `SarakNavItem`
   (`src/components/Layout/chrome/navItem.ts:21`) segue sem `children`/`defaultExpanded`. A fixture não tem o grupo "Vendas". Não
   há teste de unidade da conversão nem os quatro casos do spec. O resumo marca "Concluído com pendências" sem citar o item.
   Execute o 1.8 inteiro como está no §5, inclusive o selo a 1440 e o filho ativo com a anatomia do 1.1.
2. **Bloqueio — os specs de navegador vizinhos não rodaram.** Não existe "§3, item 8" que os passe ao revisor. A §4 os lista como
   "não podem regredir", e o lote 1 mexe nos papéis da paleta que eles medem. Rode `plan-145-personalidades`,
   `seletor-da-barra-legivel`, `plan-124-sidebar-contrast`, `plan-149-barras-personalidade` e `troca-de-tema`. Registre o número de
   cada um. Para cada reprovação, diga se é a anatomia nova (o spec antigo fixava o padrão velho: atualize-o, dizendo o caso) ou
   regressão (conserte).
3. **A busca copia a métrica do `SarakMenuItem` à mão.** `SarakShellSearchWidget.tsx` tem três literais com isenção que repetem os
   `py-1.5/2.5/3` e o `text-sm` do item. Se o item mudar, a busca deixa de medir igual sem nenhum teste acusar. Faça uma fonte só:
   as medidas por densidade num módulo que os dois leem, e o `SarakMenuItem` passa a usá-las. Um teste de unidade compara a altura
   calculada nas três densidades.

**Próximo passo:** o executor corrige 1 a 3 num bloco novo da §9, regenera a prévia (com o grupo "Vendas") e volta a 🟠. Na próxima
rodada eu faço a mutação do §7. O lote 1 fecha com essa rodada verde e com o ok do dono na prévia.

## Avaliação do dono na prévia do lote 1 — 2026-11-13 — reprovada

O dono reprovou a prévia: "ainda não atingimos o objetivo". Os pontos dele e para onde cada um foi:

| Ponto do dono | Onde entra |
|---|---|
| Busca colada na faixa da marca, sem respiro | lote 1, item 1.3 ("Respiro abaixo do topo") |
| Item ativo sem o efeito de vidro da antiga; deve ser uma possibilidade | D9 + item 1.1-b (`sidebarActiveGlass`, padrão `'on'`) |
| Com a marca embaixo, a seta de recolher cola na busca | lote 1, item 1.3 (o mesmo caso, nas duas posições da marca) |
| Rodapé desalinhado; a referência estava melhor; "apenas alinhar e organizar" | lote 2, item 2.2 ("Alinhamento") |

O revisor acrescentou, pela mesma comparação com o código de `7c4dbaed`: o item inativo volta apagado (`--theme-muted` no rótulo e no
ícone), e não quase branco (1.1-b).

A correção do lote 1 cobre os achados 1 a 3 do veredito acima **e** os itens 1.1-b e 1.3 desta avaliação. O rodapé fica no lote 2,
como já estava. A próxima prévia volta ao dono antes do veredito.

## Pedidos do dono — 2026-11-13 (depois da avaliação)

- **Prévia em três temas**, não em todos: `sarak-sovereign-classic`, `cyberpunk-neon-classic` e `sarak-sovereign` (critério de aceite
  ajustado na §6).
- **O vidro é configurável e mora na configuração da barra** (D9 ajustado; a decisão "Barras" da `plan-159` lote 4 passou a listar os
  tokens novos desta plan).
- **A barra do topo mudou no lote 1, e o dono quer ver.** Medido no código, sem tema que sobrescreva:
  - o marcador da aba ativa (`navActiveMarkerColor`, o mesmo token nas duas barras) passou do acento para a primária;
  - com `preferenceNavCollapsePosition: 'pinned'` (D2), o botão de recolher aparece também no topo
    (`ChromeTopbarBody.test.tsx` mudou para isso).

  Os dois vão na prévia da correção: a barra do topo nos três temas, antes e depois. O botão de recolher no topo espera a decisão do
  dono depois de ver (a §3.2 deixa a Topbar fora, salvo consequência direta da paleta, e este não é da paleta).

## Veredito — 2026-11-13 — correção do lote 1 — 🟠 achados 1 a 3 resolvidos; o 🟢 espera o dono na prévia

**O que conferi e como**
- O resumo da correção contra os achados 1 a 3, a avaliação do dono e os pedidos dele: cada item tem execução e caso no spec.
- **Mutação do §7, numa cópia fora do repositório** (`C:\tmp\sarak-165-mut`, junção para `node_modules`, já removida), com o
  spec da anatomia filtrado para `sarak-sovereign`:
  - controle, sem mutação: os 3 casos (marcador; nenhum item atrás do rodapé a 1440×900 e 1280×720) passam;
  - `navActiveMarkerColor` de volta ao acento (`role-map.ts:54`): o caso do marcador **reprova** ("marcador 195,132,0,1 ×
    primária");
  - a lista sem rolagem (`SarakShellNav.tsx:131`, `overflow-visible`): o caso do rodapé **reprova** a 1280×720 ("itens que nem
    rolando saem de trás do rodapé"). A 1440×900 o conteúdo cabe sem rolar, e o caso passa, o que é correto.
- A prévia `C:\tmp\sarak-previa-165\index.html`: os três temas pedidos, a marca embaixo, as sub-abas, o vidro ligado e
  desligado e a barra do topo antes e depois. Vai ao dono neste veredito.
- Não repeti o quick, o build, os vizinhos nem o `audit:baseline` do executor.

**Decisões do executor que ficam**
- A métrica do item tem uma fonte só, por classe utilitária, com a medida lida do passo dela. A tentativa com variável local foi
  recusada pelo auditor de fantasmas.
- Os 25 temas declaram `sidebarActiveGlass: 'on'`, porque o gate de completude obriga. É o padrão e não tem efeito visual. Os presets
  `sidebar-clean` (`'off'`) e `sidebar-floating` (`'on'`) também ficam.
- O caso do `plan-149` foi atualizado para a faixa nova, mantendo as três garantias dele.
- O `token-release-notes:check` reprovado é esperado: ele procura o token na seção da versão do `package.json` (8.0.0). Na
  emissão da 9.0.0 ele o acha na entrada 9.0.0.

**Achados fora do escopo, encaminhados**
- `sidebarItemTextColor` entrou na lista do 3.1.
- Backlog 80: a busca da barra não acha sub-abas.
- Backlog 81: a barra do topo não mostra os itens que não cabem.

**O que a prévia mostra na barra do topo** (`r2-topo-*` contra `antes-topo-*`):
- O traço da aba ativa passou de laranja (acento) para a primária. Isso é consequência da paleta e está no escopo.
- O botão de recolher (D2) aparece à esquerda e come a largura: "Acompanhamento TC" passa a ser cortado. O nome da marca já saía
  "Sar…" antes. **Decisão do dono.** A recomendação do revisor é que o padrão `pinned` não ponha o botão no topo: o topo fica como
  era, e a seta continua no cabeçalho da lateral. Quem quiser o botão no topo ainda escolhe por token.

**Falta para o 🟢:** o ok do dono na prévia e a decisão do botão de recolher no topo.

**Status da plan: 🟠 Em revisão** (aguardando o dono).

## Avaliação do dono na prévia da correção do lote 1 — 2026-11-13 — avanço, objetivo ainda não atingido

O dono disse que houve "um grande avanço", mas que o objetivo ainda não foi atingido. Os pontos dele:

| Ponto do dono | Encaminhamento (proposta do revisor; o lote depende da resposta do dono) |
|---|---|
| Topbar "excelente"; só o nome da marca não pode sair cortado com "…". Nome de várias palavras quebra em linhas. Opção de mostrar o logo, trocar o nome pelo logo ou os dois | item novo **1.9** (abaixo) |
| O botão ≡ no topo: explicar o que faz e remover se não fizer nada | ele compacta o topo (`isNavHidden`): altura 48 px, abas só com ícone, a marca só com o logo, a busca em ícone (`ChromeTopbarBody.tsx:72,110,130-143`). **Decisão do dono:** manter ou tirar do padrão |
| Lateral recolhida: os itens de baixo desalinhados; o resto "perfeito" | lote 2, item **2.2-b** (abaixo) |
| Rodapé ainda desorganizado: voltar ao formato antigo, um item por linha, escrito | lote 2, item 2.2, que já pedia isso; ver a decisão do modo abaixo |

1.9. **Marca sem corte** (as duas barras).
- O nome da marca nunca é truncado com "…". Quando não cabe numa linha, quebra entre palavras, em até duas linhas. Uma palavra só,
  que não cabe nem sozinha, diminui a fonte até caber, sem ficar abaixo do rótulo do item de menu. A marca não encolhe para dar
  espaço às abas: quem cede espaço é a lista de abas (ver backlog 81).
- Token novo `brandDisplay` (`'both'` | `'logo'` | `'name'`), padrão `'both'`, nas três fontes, na configuração da barra (pergunta
  `brand`):
  - `'both'` mostra o que o sistema passou (logo e nome, ou só o que existir);
  - `'logo'` mostra só o logo e cai no nome quando não há logo;
  - `'name'` mostra só o nome.
- Casos no spec: a 1440 px, o nome "Sarak OS" e um nome de três palavras aparecem inteiros, no topo e na lateral; com
  `brandDisplay: 'logo'` e `?logo=1` só o logo aparece. Teste de unidade dos três valores.

2.2-b. **Rodapé da lateral recolhida.** Cada controle do rodapé (notificações, idioma, modo, usuário, sair, ⚙) fica centrado no mesmo
eixo dos ícones da lista (±1 px), um por linha, sem o contador deslocar o ícone. Caso no spec, nos três temas da prévia.

**Prévia interativa (pedido do dono, 2026-11-13).** Além das capturas, a prévia leva uma cópia do harness do spec da anatomia em
`C:\tmp\sarak-previa-165\interativo\` (o `index.html`, o `bundle.js` e o CSS, estáticos, abrindo com dois cliques, sem servidor). Uma
barra de controles no alto da página troca, recarregando com os parâmetros da fixture:
- o tema (os três da prévia) e o modo claro/escuro;
- logo sim/não e a posição da marca;
- vidro ligado/desligado;
- lateral/topo e o `brandDisplay`.

A seção de prévia de cada lote passa a ter esse link.

## Veredito — 2026-11-13 — lote 1 — 🟢 Aprovado pelo dono; a marca (1.9) vai com o lote 2

**Respostas do dono:**
1. **O lote 1 está aprovado.** O item 1.9 (marca sem corte e `brandDisplay`) é executado junto com o lote 2, porque mexe no mesmo
   cromo.
2. **O botão ≡ no topo** (compactar a barra) continua existindo, mas **fica escondido por padrão no topo**, como era antes desta plan.
   Na lateral, a seta continua fixa (D2). Quem quiser o botão no topo liga pela configuração. Entra no lote 2 (item 2.6).
3. **Rodapé no formato antigo, um item por linha, escrito. O que está no ⚙ continua no ⚙.** O D4 não muda: o modo, o tamanho da
   fonte e a escolha lateral/topo ficam no ⚙. As linhas do rodapé são idioma e notificações, e o ⚙ ganha uma linha própria
   (2.2).
4. **O nome da marca volta ao branco**, configurável. Os papéis `sidebarBrandColor` e `topbarBrandColor` saem do acento
   (`colorRole('accent', 700, 300)`) para o texto forte da barra (neutra 950/50), como na lib antiga. Os dois tokens continuam no
   painel, na configuração da barra. Os 7 resgatados seguem a foto no lote 3. Entra no lote 2 (item 2.7).

**Itens acrescentados ao lote 2:**
- **1.9 — marca sem corte:** como escrito acima, nas duas barras.
- **2.6 — ≡ no topo escondido por padrão:** a posição do recolher passa a ser lida por barra. Com o padrão, a lateral mostra a
  seta e o topo não mostra o ≡. O valor gravado continua valendo. Teste de unidade nas duas barras.
- **2.7 — nome da marca no texto forte da barra:** mudança no `role-map.ts`, com a linha em `docs/migracoes.md`. Caso no spec:
  a cor do nome tem contraste ≥ 4,5:1 e não é o acento.
- **2.2-b:** rodapé da recolhida alinhado ao eixo dos ícones.
- **A prévia interativa** em `C:\tmp\sarak-previa-165\interativo\`.

**Status da plan: 🟡 Em execução** (lotes 2 e 3).

## Veredito — 2026-11-13 — lote 1 volta para correção antes do commit (achado 4, medido na revisão da `plan-158`)

- `cromo-css-real:check` reprova `plan-141-presets-do-painel.spec.ts:206` (Layout, claro):
  "`sidebar: sidebar-outlined × sidebar-floating = 1.66%`". Duas opções do mesmo grupo ficaram quase iguais (o teto é 2%).
- **Bisseção em cópia fora do repositório:** HEAD + lote 1 da `plan-158` passa; com esta plan, reprova.
- É da anatomia nova: a moldura em cartão e o vidro ligado em `sidebar-floating` aproximaram as duas.
- **Correção (1.10):** as duas opções voltam a se distinguir a olho, sem tocar o spec e sem mudar a anatomia aprovada pelo dono.
  - Rodar o `plan-141-presets-do-painel.spec.ts` inteiro e o spec da anatomia.
  - A prévia mostra as duas lado a lado nos três temas.
- **O commit 2 (lote 1) não sai até isso fechar.** Ele também espera o commit 1 (`plan-158` lote 1), que voltou para correção.

**Status da plan: 🔵 Em correção** (o lote 2 começa depois do commit do lote 1).

## Veredito — 2026-11-14 — correção 1.10 — 🟠 o spec fecha; o 🟢 espera o dono na prévia

**O que conferi e como**
- O diff: só o preset `sidebar-floating` mudou (`'none'` no contorno e degradê no fundo), mais a descrição nos 6 idiomas.
  - As personalidades Moderno e Vidro passam a declarar nos ajustes próprios a borda que recebiam da Flutuante. Os temas ligados a elas
    não mudam, e o `themeBars.test` exige isso.
  - A Contornada, a anatomia, o renderizador e o spec do 141 ficaram intactos.
- **A medida do efeito é a do próprio achado:** o mesmo caso reprovava com 1,66% e agora passa com 2,80% no claro e 29,65% no escuro.
  O executor também mediu as variantes descartadas, o que dispensa uma mutação minha.
- Não repeti o `plan-141` inteiro (25/25) nem o `cromo-css-real:check` do executor.
- O que sobra no check não é desta correção:
  - os 15 casos da anatomia, que são sobrescritas de tema do lote 3, como já registrado;
  - o `cartao-cede-a-classe`, que o executor reproduziu numa cópia do HEAD (backlog 83).
- As capturas da prévia (`img/p110-*`), no claro do `sarak-sovereign`.

**Aviso para o dono:** no claro, a margem é estreita (2,80% contra o teto de 2%), e a olho as duas ainda se parecem. O que as separa é o
item ativo (contorno × pílula azulada) e um contorno fino na Contornada. O degradê quase não aparece numa superfície clara. No escuro, a
diferença é clara. Se o dono achar pouco, o próximo passo é dar à Flutuante uma sombra própria de "solta da tela", e não mexer na
anatomia.

**Falta para o 🟢:** o ok do dono na primeira seção da prévia `C:\tmp\sarak-previa-165\index.html`.

**Status da plan: 🟠 Em revisão** (aguardando o dono).

## Avaliação do dono — 2026-11-14 — barra do topo aprovada

- **A barra do topo da prévia foi aprovada.**
- O dono conferiu que três pontos ainda não estão feitos. Os três já são do lote 2:
  - o rodapé no formato antigo, um item por linha (2.2);
  - o alinhamento da lateral recolhida (2.2-b);
  - a marca sem "…" (1.9, com `brandDisplay` e o nome no texto forte da barra, 2.7).
- **Pendente:** o ok do dono na Flutuante da correção 1.10, na primeira seção da prévia.

## Veredito — 2026-11-14 — lote 1 (com a correção 1.10) — 🟢 Aprovado pelo dono

- O dono aprovou a Flutuante da correção 1.10 como está.
- **O commit do lote 1 sai depois do commit do lote 1 da `plan-158`**, que está em correção: o hook avalia o worktree inteiro.
- **O lote 2 começa depois do commit**, com os itens 1.9, 2.2, 2.2-b, 2.6, 2.7 e a prévia interativa.

**Status da plan: 🟡 Em execução** (lotes 2 e 3).
