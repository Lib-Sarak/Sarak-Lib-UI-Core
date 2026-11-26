---
tipo: "spec"
titulo: "O cromo único e os slots de extensão — a casca de toda aplicação"
dominio: "Sarak-Lib-UI-Core / Layout / Cromo"
status: "🟢 Vigente"
prioridade: "Alta"
tags: ["spec", "cromo", "slots", "layout", "extensibilidade", "app-chrome", "navegacao"]
relacionados: ["[[00-regras-e-invariantes]]", "[[02-design-engine]]", "[[01-forma-do-produto-e-modos-de-consumo]]", "[[07-responsividade-e-multidispositivo]]", "[[09-temas-e-presets]]", "[[005-modelo-modulos-plugin-e-apps-separados]]", "[[018-um-cromo-so-e-o-consumidor-e-dono-das-rotas]]", "[[013-item-de-navegacao-como-atomo-proprio]]", "[[014-cromo-do-modo-ui-kit-com-widgets-por-padrao]]", "[[015-metrica-do-item-de-navegacao-horizontal]]", "[[016-preferencias-do-usuario-separadas-do-tema]]", "[[021-navegacao-na-base-do-celular]]"]
---

# 1. O que ele é

O `SarakAppChrome` é **o único cromo da biblioteca**: a casca **100% apresentacional** — topbar ou sidebar, mais `children` —, temável pelos mesmos tokens do Design Engine, que **cada aplicação monta sozinha**. A lib não é host: não registra módulos, não descobre módulos e não escreve na URL. A navegação é **dado** do consumidor (`navItems`), e a seleção volta por callback (`onNavigate`) ([[018-um-cromo-so-e-o-consumidor-e-dono-das-rotas]]).

Os tokens de cromo — `--sarak-topbar-*` e `--sarak-sidebar-*` — têm nele o seu consumidor, e o gate de paridade (§2.4.1) cobra que continue assim.

# 2. O contrato

`SarakAppChromeProps` — as props do cromo, **publicadas no catálogo gerado** (`docs/component-catalog.json`).
A contagem não é fixada aqui: o catálogo é a fonte viva ([[00-regras-e-invariantes]] **R17**).

## 2.1 Estrutura e navegação

| Prop | Contrato |
| --- | --- |
| `children` | a tela do app (obrigatória) |
| `brand?: { name?, logoUrl? }` | identidade exibida no cromo — **do consumidor, sempre** ([[08-identidade-do-host-e-zero-marca]]). Opcional campo a campo: o campo omitido ou vazio cai na marca do contexto (`systemName`/`logoUrl`, com a marca gravada por cima do design), e sem nenhum dos dois o cromo não desenha marca |
| `navItems?: SarakNavItem[]` | **navegação recomendada**, ícone first-class; tem **precedência** sobre `nav` |
| `nav?: SarakShellNavItem[]` + `activeRoute?` | modelo declarativo legado (`route`/`activeRoute`), mantido por compatibilidade |
| `onNavigate?: (route) => void` | **o host decide COMO navegar** — redirect de página inteira, router local, o que for |
| `navigationStyle?: 'sidebar' \| 'topbar' \| 'auto'` | `'auto'` (default) segue `design.navigationStyle` |
| `widgets?: { search?, themeToggle?, user?, notifications?, collapse?, fontSize?, navigationStyle?, language? }` | opt-out dos widgets que nascem montados (§2.2.1) — omitido = ligado, só `false` desliga aquele; é teto: tira o widget da barra e do ⚙, e nunca liga preferência que o tema não oferece |
| `user?: SarakShellUser` · `logout?: () => void` | identidade e sessão **do consumidor**: `{ name, role?, avatarUrl?, email? }` alimenta o widget de usuário (só `avatarUrl` `http(s)` ou relativo vira imagem; sem ela, o avatar de `userAvatarStyle`, §2.1.4). Sem `user` ou sem `logout`, o widget **não aparece em produção** e aparece desabilitado fora dela (§2.2.1) |
| `notifications?: SarakChromeNotification[]` · `onNotificationSelect?` | itens e tratamento do widget de notificações; sem os dois, a mesma regra do usuário (§2.2.1) |
| `className?` / `style?` | escape hatch; o `style` sobrescreve a altura própria (§5) |

`SarakNavItem` (`src/components/Layout/chrome/navItem.ts`):
`{ id, label, icon?, href, active?, disabled?, badge?, target?, category?, children?, defaultExpanded? }` — `id` estável para chave de render, `href` é o destino, e o
**consumidor marca qual item está ativo**. `category` agrupa visualmente (mesmo campo do `SarakShellNavItem`);
item sem categoria fica no grupo raiz. O `icon` é um nome resolvido pelo `SarakIcon` (curado ou registrado) ou um elemento ([[03-superficie-publica]] §6.2).

**A resolução de precedência, explícita** (`SarakAppChrome.tsx`): com `navItems`, o cromo mapeia
para o contrato do `SarakShellNav` (`toShellNavItems`) e deriva a rota ativa do item marcado `active`, procurado também entre os
filhos (`findActiveNavItemHref`, com `activeRoute` como fallback); sem `navItems`, usa `nav` + `activeRoute`.

**Grupos.** `SarakShellNavItem` e `SarakNavItem` aceitam `children` e `defaultExpanded`, com um nível só: filho de filho é ignorado, e o pai com filhos não navega. A conversão de `navItems` repassa os filhos; quem não passa `children` recebe o mesmo de sempre. O pai é botão, com `aria-expanded` e `aria-controls`. O grupo do item ativo (um filho pode ser o `active`) abre sozinho, e mais de um pode ficar aberto. Na lateral e na gaveta do celular, ele abre na própria barra. Na lateral recolhida e na topbar, abre em balão (`ShellNavFlyout`), com setas, Esc e Tab. Item sem filhos mantém o mesmo DOM. Com grupo, o celular usa a gaveta.

**Marca, tom e largura.** `sidebarLogoPlacement` põe a marca no topo ou na base da lateral; no topo, ela fica na faixa da marca (§2.1.4). `brandDisplay` escolhe o que a marca mostra nas duas barras: `both` (padrão, o que o sistema passou), `logo` (cai no nome quando não há imagem) ou `name`. Fora da faixa, o fundo da marca só pinta com logo: sem imagem, não há caixa colorida. `sidebarTone` e `topbarTone` dão o papel de cor ([[09-temas-e-presets]] §4.3.4). `sidebarResizable` liga a alça (`useSidebarResize`), por mouse e teclado, e o valor é preferência do usuário, nunca do tema (§4.7 da mesma spec). Com tom contrastante, o texto do item ativo preenchido usa o fundo da barra (`--sarak-on-nav-active`, `chromeToneStyle.ts`), o par que a paleta garante.

**A barra não rola para o lado.** Só a lista de navegação rola, e na vertical. Topo e rodapé ficam fixos. Recolhida, as preferências viram um ícone só e a busca vira ícone.

**Na topbar, nenhum item fica escondido sem sinal.** A lista não rola: cada item ocupa uma célula medida (`useHorizontalOverflow`), e o que não cabe sai da vista, do foco e do leitor de tela e vai para o botão **"Mais"** (`ShellNavMore`, `data-sarak-nav-more`), no fim da lista. O "Mais" é um grupo como os de cima: balão, setas, Esc, Tab e `aria-expanded`. Um grupo que não coube entra no "Mais" com os filhos, num nível só. Com o item ativo dentro dele, o "Mais" se desenha como ativo.

**`navigationStyle: 'auto'`** resolve por `useNavigationStyle()`: `'topbar'` no design → topbar;
qualquer outra coisa → sidebar. **Consequência que vale destacar: trocar o TEMA troca a orientação do
cromo.** O cromo é parte do design, não configuração de código.

### 2.1.1 O item de navegação tem átomo próprio, e a métrica difere por orientação

> ⚠️ **Dois nomes parecidos, e eles NÃO são a mesma coisa:**
>
> | Nome | O que é |
> | --- | --- |
> | `SarakNavItem` **(tipo)** | a **forma do dado** da prop `navItems` da tabela acima — `{ id, label, icon?, href, active?, disabled?, badge?, target?, category?, children?, defaultExpanded? }`, de `Layout/chrome/navItem.ts` |
> | `SarakMenuItem` **(componente)** | o **átomo** que desenha um item de menu, de `atomic/Navigation/SarakMenuItem.tsx` |
>
> O consumidor **declara** `SarakNavItem[]` e a lib **desenha** com `SarakMenuItem`. Os dois são
> exportados pelo barril, cada um no seu espaço — tipo e valor.

O átomo que desenha o item de menu do cromo é o `SarakMenuItem` — não um `SarakButton`. São átomos de
papéis diferentes: um é **navegação**, o outro é **ação**, e o item de menu nunca carrega a métrica de
botão de ação ([[013-item-de-navegacao-como-atomo-proprio]]).

A métrica **difere por orientação**, e a diferença é contrato, não acidente:

| `orientation` | Onde | Métrica |
| --- | --- | --- |
| `vertical` | sidebar, drawer | linha de lista — recuo e peso de menu, caixa normal, largura cheia resolvida **na origem** (nunca emite piso de `min-width`), rótulo **trunca** em vez de transbordar |
| `horizontal` | topbar | aba compacta — pílula, **caixa normal**, corpo legível, peso forte, rótulo **trunca** ([[015-metrica-do-item-de-navegacao-horizontal]]) |

`SarakShellNav` — o renderizador que o `SarakAppChrome` usa para `navItems`/`nav` — compõe o átomo e segue
a orientação resolvida pelo `navigationStyle`. **Consequência direta da §2.1:** como trocar o tema troca a
orientação do cromo, ele **também** troca a métrica do item de menu, de lista para aba.

**A pílula chega à tela porque o padrão de raio de `<button>` cede à classe.** O raio que a lib dá a todo botão
mora numa camada anterior às utilitárias ([[02-design-engine]] §9.1), então o `rounded-*` do item de menu
vence nas três orientações. A medição de navegador compara o raio computado do item horizontal com o do botão
de ação.

**Largura cheia nunca carrega piso de largura no conteúdo**, venha ela da prop `fullWidth`, do tema ou da
`className` do chamador — o `min-w-fit` é de outro grupo de propriedade que `width` e sobreviveria ao merge,
impedindo o elemento de encolher.

**O consumidor tem a última palavra:** a `className` que ele passa vence o default do átomo
([[00-regras-e-invariantes]] **R35**) — é assim que se pede um rótulo em caixa normal numa topbar, sem
prop nova.

### 2.1.2 O item de navegação é um link de verdade

Item com `href` é uma **âncora** (`<a href>`); item sem `href` continua `<button>`. A regra de quem navega é uma só, compartilhada por `SarakMenuItem` e `SarakLink` (`atomic/Navigation/linkNavigation.ts`):

| Gesto | Quem navega |
| --- | --- |
| clique simples (botão primário, sem Alt/Ctrl/Cmd/Shift) num destino da mesma aba | o **consumidor**: `onNavigate(href)` é chamado e o padrão do navegador é **prevenido** |
| Ctrl/Cmd/Shift/Alt + clique, clique do meio, botão direito | o **navegador** (nova aba, janela, menu de contexto) — `onNavigate` não é chamado |
| `target` diferente de `_self` | o **navegador**; a âncora ganha `rel="noopener noreferrer"` |

- **`disabled`** tira o `href` navegável e o foco (`tabIndex -1`, `aria-disabled`) e ignora o clique — o item continua no menu.
- **`badge`** (texto ou número) aparece no item e **integra o nome acessível**.
- O `href` passa por uma **lista de esquemas seguros** (`http(s)`, `mailto`, `tel`, caminho relativo, âncora): `javascript:` e `data:` nunca viram link. A mesma checagem é pública: `sarakIsSafeLinkHref(href)`, para o consumidor validar o destino antes de montar o item.
- **Sem `onNavigate`** (nem `onChange` no `SarakShellNav`), a âncora é um link comum e o navegador a segue.
- **A busca embutida também navega**: o resultado é um link que chama o mesmo `onNavigate` e fecha a lista; o palette (`SarakSearch`) seleciona por clique e por `Enter`/`Espaço`. Item `disabled` não é pesquisável.

### 2.1.3 A busca do cromo e a paleta

O resultado da busca da barra e o da paleta Ctrl+K são **links de verdade** para a rota do item (o id do item é a rota), como o item de
navegação (§2.1.2): sem `onNavigate`, o navegador segue o link; com ele, o callback é chamado e a navegação padrão é cancelada. Setas e
Enter levam ao mesmo destino. O campo não mostra o texto do atalho: Ctrl/⌘+K segue valendo, declarado em `aria-keyshortcuts`. Sem espaço, a busca vira ícone. A paleta é `role="dialog"` com `aria-modal`, o campo é `combobox`
ligado a uma `listbox` com `aria-activedescendant`, o primeiro resultado vem ativo e o ícone de cada resultado é o do item de navegação.

### 2.1.4 A anatomia da barra lateral

A barra lateral tem **uma anatomia só, igual em todo tema**. O tema muda cor, fonte, raio e textura por cima dela, e cada peça
continua sendo um token que o tema declara e o painel ajusta (§2.4). As cores de cada papel vêm da paleta
([[09-temas-e-presets]] §4.3.4).

| Peça | Como é |
| --- | --- |
| Moldura | a `<aside>` é um cartão: o raio `borderRadius` (`--sarak-border-radius`) e, com `sidebarBorderSide: 'edge'`, a linha nos quatro lados (`chrome/sidebarFrame.ts`). Encostada na tela (`tabSectionMargin` zero), o raio e as linhas dos lados colados somem, e fica só a linha do lado do conteúdo. `sidebarPosition: 'floating'` tem moldura própria e não muda |
| Faixa da marca | com a marca no topo: a altura do topo da área de conteúdo (`--sarak-topbar-height`), linha embaixo na cor da borda da barra e o fundo `sidebarBrandBackground`, com ou sem logo; dentro dela a marca não pinta fundo próprio. A seta de recolher fica à direita. Com a marca na base, o topo é só a seta, sem faixa nem altura mínima; sem marca e sem seta, o topo não existe (`ChromeSidebarHeader.tsx`) |
| Monograma | sem logo, a faixa mostra a inicial de `brand.name` (`data-sarak-brand-monogram`), no raio do tema, no texto da marca sobre o fundo da marca, com um aro do mesmo texto. Recolhida, a marca é só ele (ou o logo) |
| Nome da marca | **nunca é cortado com reticências** (`ChromeBrandName`, `useFitBrandName.ts`): quebra entre palavras em até duas linhas e, se ainda não cabe, a fonte diminui de 1 em 1 px até o piso do rótulo do item (`0,875rem`); no piso, a largura de `sidebarLabelMaxWidth`/`topbarLabelMaxWidth` cede a 100% da barra. Sobre o fundo da marca (a faixa, ou o bloco com logo) ele leva o texto da marca, escolhido pelo contraste contra esse fundo; sem fundo por baixo, o texto forte da barra. Na topbar a marca não encolhe: quem cede espaço é a lista de abas. Âncora: `data-sarak-brand-name` |
| Busca | a altura de um item de menu na densidade do tema (`menuItemHeight`, que o cromo liga) e o recuo lateral da lista; entre o topo e a busca, o vão entre seções. A dica do atalho continua escondida (§2.1.3) |
| Título de seção | caixa alta, negrito, `text-sm`, espaçamento de 0,2 em, na cor `sidebarCategoryColor` |
| Recuo e vão da lista | o espaçamento do layout com teto pela largura da barra: `min(--sarak-layout-gap-md, largura/15)` e `min(--sarak-layout-gap-sm, largura/30)`, 16 e 8 px numa barra de 240 px. Um tema de respiro de página largo não espreme os itens no meio da barra |
| Item ativo | o padrão é `bar`: um marcador de 4 × 16 px na borda, na cor `navActiveMarkerColor` e com o brilho `navActiveMarkerGlow`, sobre o véu `sidebarActiveColor`; os outros estilos (`pill`, `filled`, `outline`, `underline`) continuam. `sidebarActiveGlass` (`on` por padrão) soma, a qualquer estilo, o vidro: um brilho interno da cor do marcador a 5% (`inset 0 0 20px`). Só o item vertical o recebe; a topbar não |
| Item inativo | rótulo e ícone apagados (`sidebarItemTextColor`, `sidebarIconColor`), ainda a 4,5:1 contra a barra; o ativo e o ponteiro acendem |
| Sub-aba | recua até o rótulo do pai: o recuo do item, mais o ícone, mais o vão, pela métrica da densidade. O selo, na lista vertical, usa o vão da lista como respiro |
| Rodapé | linhas com a métrica do item vertical, todas pelo `SarakMenuItem` (`data-sarak-footer-rows`): idioma, com o código do idioma que vale à direita, na cor ativa; notificações, com o contador à direita; o modo, quando fixado; e o ⚙ em linha própria, acima do usuário. Nenhuma linha tem borda própria. Ícones na coluna dos ícones da lista, rótulos na dos rótulos, indicadores na mesma borda direita. A linha do idioma só existe com a barra aberta |
| Usuário | uma faixa (`data-sarak-user-strip`) igual em todo tema: linha em cima na cor da borda da barra, véu de 5% da cor do marcador e o avatar na coluna dos ícones. O nome vem em cima, mais forte; embaixo, o papel em caixa alta, com espaçamento largo e o ícone de escudo; sair fica à direita. `userAvatarStyle` escolhe o avatar sem foto: `initials` (padrão) ou `icon`, o ícone `User`; com imagem válida, vale a imagem |
| Recolhida | a marca no monograma ou no logo, ícones centralizados e o marcador visível no ativo. Cada controle do rodapé é só o ícone, um por linha, no eixo dos ícones da lista; o aviso de notificação é um ponto no canto de cima à direita do ícone, fora do fluxo, e não o desloca. Avatar e sair ficam empilhados |

**A métrica do item tem fonte única** (`atomic/Navigation/menuItemMetrics.ts`): as classes de cada densidade, que o `SarakMenuItem`
aplica. A altura da busca e o recuo da sub-aba leem o passo dessas mesmas classes, então nada se separa do item quando a densidade
muda. A `className` do chamador continua vencendo ([[00-regras-e-invariantes]] **R35**).

**Os presets de barra lateral do painel se distinguem a olho** (`presets/components/layout.ts`): a Contornada tem contorno em toda a
barra e o item ativo contornado; a Flutuante não tem contorno, tem o fundo em degradê e o item em pílula, com vidro; a Compacta, de itens
apertados, fica no tom Superfície, e a Limpa no Neutro. A medição de navegador compara a amostra de cada par de opções do mesmo grupo.

## 2.2 Os slots

| Slot | Região | Ausente = |
| --- | --- | --- |
| `logo` | identidade; **precedência sobre `brand.logoUrl`**, e o `brand.name` continua ao lado | cai em `brand.logoUrl` |
| `topbarStart` | início da barra superior, após a marca | região não renderiza |
| `topbarEnd` | fim da barra superior — **alias de `topbarActions`**, e **vence** quando os dois vêm | idem |
| `search` | busca do consumidor — **posicionada por token**, não por região fixa (§2.4); substitui a busca default inteira — gatilho, palette e atalho | a busca default da lib (§2.2.1) |
| `sidebarHeader` | topo da sidebar, abaixo da marca | idem |
| `sidebarFooter` | rodapé da sidebar | idem |
| `banner` | faixa **full-width**, primeira do cromo | idem |
| `footer` | faixa **full-width**, última do cromo | idem |
| `decoration` | camada decorativa **atrás** do conteúdo do cromo | idem |
| `secondaryContent` | **segundo painel** da região de conteúdo, só com o token `isSplitViewEnabled` ligado: lado a lado com os `children` a partir de 1024 px de largura **disponível na região** (container query, não a janela), empilhado abaixo disso. Com a vista ativa, o `main` planta o `@container`; fora dela, não planta | os `children` seguem diretos no `main` — nada muda |

**Verificado no gate:** `npm run catalog:check` verde, com **todos** os slots presentes nas props publicadas
de `SarakAppChrome` em `docs/component-catalog.json` (+ `topbarActions`, o alias). O contrato está
publicado, não só implementado.

### O princípio

> **A lib dá a REGIÃO; o consumidor dá o CONTEÚDO.**

**E o conteúdo pode vir da própria biblioteca.** Busca, alternância de tema, widget de usuário e seletor de
idioma são **componentes públicos** — montam sob o `SarakUIProvider`, dentro de qualquer slot, sem registro. O princípio não muda: quem decide o que vai em cada região
continua sendo o consumidor. O que deixou de existir é a situação em que ele precisava reescrever do zero o
que a lib já tinha pronto, porque os quatro moravam fora das raízes que a superfície pública varre
([[arquitetura/03-superficie-publica]]).

Todo slot é `ReactNode` puro e o invólucro é mínimo — a lib **não presume** o que vai dentro (imagem,
vídeo, animação, faixa promocional, widget). O cabeçalho de `ChromeSlots.tsx` declara isso, e cada bloco
**devolve `null` sem `children`**: **slot ausente não cria espaço
morto.**

Cada região carrega `data-sarak-slot="<nome>"` — âncora estável para teste e para o consumidor mirar por
CSS **sem depender de estrutura interna**. É contrato, não detalhe de implementação.

### Geometria: uma regra para os três modos

`ChromeFrame` (`chrome/ChromeFrame.tsx`) é a moldura comum. Ordem de pintura, de fora para dentro:

1. `decoration` — camada absoluta atrás de tudo;
2. `banner` — **primeira** faixa full-width;
3. o corpo do modo (topbar+conteúdo, sidebar+conteúdo, ou mobile);
4. `footer` — **última** faixa full-width.

**Por que uma regra só:** banner é sempre a primeira faixa e footer sempre a última, ambas full-width —
então o refluxo no celular é o mesmo do desktop (a faixa só fica mais estreita) e **não existe caso
especial por dispositivo** (cabeçalho de `ChromeFrame.tsx`).

**Empilhamento sem z-index mágico:** a raiz só ganha `position: relative` + `isolation: isolate`
**quando há `decoration`**; sem ela, o estilo da raiz é exatamente o que era. Zero mudança para
quem não usa o slot.

`decoration` é **ornamento por contrato** (`ChromeSlots.tsx`): `aria-hidden="true"` +
`pointer-events: none`. Sai da árvore de acessibilidade e **nunca rouba foco ou toque** da navegação.

### 2.2.1 Os widgets que nascem montados

O cromo nasce com **todos** os widgets montados — busca com atalho, alternância de tema, widget de usuário, notificações, colapso da navegação, e as preferências de tamanho de fonte, orientação da navegação e idioma — e o consumidor desliga o que não quiser ([[014-cromo-do-modo-ui-kit-com-widgets-por-padrao]]). **Nenhum tema esconde widget:** a barra é completa em todo tema.

**Um widget que depende do consumidor só funciona quando ele o liga, e nunca finge funcionar.** Sem a conexão, **em produção**
(`process.env.NODE_ENV === 'production'`) ele não aparece; fora de produção aparece desabilitado, para o desenvolvedor ver o que falta:

| Widget | Ativo quando | Sem a conexão |
| --- | --- | --- |
| busca | há `SarakUIProvider`, não foi desligada e o slot `search` está vazio | o palette lista a **própria navegação** do cromo e seleciona pelo mesmo `onNavigate`; o Ctrl/Cmd+K só é escutado nessas condições — fora delas, fica livre para o navegador e para o consumidor |
| alternância de tema | há `SarakUIProvider` e não foi desligada | grava a **preferência** de modo de quem clicou — nunca o tema do sistema ([[09-temas-e-presets]] §4.7) |
| usuário | o consumidor entregou `user` **e** `logout` | em produção, **ausente**; fora dela, **desabilitado**: sem identidade a lib não inventa nome |
| notificações | o consumidor entregou `notifications` com itens **e** `onNotificationSelect` | em produção, **ausente**; fora dela, **desabilitado** |
| colapso | há `SarakUIProvider` e não foi desligado | grava a **preferência** de navegação recolhida de quem clicou — nunca o tema |

O estado desabilitado é `aria-disabled="true"`, **sem handler**, focável, com um **rótulo de estado** para o usuário final ("Usuário indisponível", "Notificações indisponíveis", traduzidos) — nunca uma instrução de desenvolvedor. Na lateral ele é uma linha apagada, com a métrica do item de menu e sem caixa; na topbar, uma caixa (`ChromeUnavailableWidget.tsx`). **O que ligar** vai para o desenvolvedor, num **aviso único** no console, só fora de produção ("Conecte … ao SarakAppChrome…"). Nenhum widget clicável faz nada em silêncio.

**Onde cada um mora.** A busca ocupa o slot `search`. Tema, usuário e notificações **não têm slot**: nascem numa região própria, marcada `data-sarak-widget` — e não `data-sarak-slot`, porque não são conteúdo do consumidor. Por isso o conteúdo que o consumidor põe em `topbarEnd`/`sidebarFooter` **não** os substitui: quem já monta tema/usuário à mão desliga o default correspondente. A alternativa — dar precedência a esses slots — apagaria tema e usuário sempre que qualquer botão fosse posto ali.

### 2.2.2 A composição da barra — decisão do sistema, nunca do tema

Cada um dos **oito** widgets — modo claro/escuro, tamanho da fonte, navegação topo/lateral, navegação recolhida, idioma, busca, usuário e notificações — tem **uma de três posições**, escolhida pelo **sistema** no painel, na seção *Composição da Barra* (pilar de navegação, **visível no modo Essencial**). A navegação recolhida tem uma posição por barra: `preferenceNavCollapsePosition` é a seta da lateral, e `preferenceNavCollapsePositionTopbar` é o ≡ que compacta a topbar. São **nove** tokens de composição.

| Posição | O que o usuário final vê |
| --- | --- |
| **não oferecida** | nada — vale o valor do sistema |
| **no menu** | uma linha dentro do ⚙ *Preferências*; as escolhas (tamanho da fonte, navegação) são linhas com seleção (`menuitemradio`), não pílulas |
| **fixa na barra** | um controle direto na barra. Tamanho da fonte e navegação formam um grupo compacto, com a altura de um item de navegação (`ShellPreferenceChoiceGroup`). O ⚙ não repete o que já está fixo na barra visível, nas duas orientações |

**O padrão de fábrica:** busca, usuário, notificações e idioma **fixos na barra**; modo claro/escuro, tamanho da fonte e navegação
topo/lateral **no menu** ⚙ Preferências; a navegação recolhida **fixa na lateral** (a seta do cabeçalho, §2.1.4) e **no menu** na
topbar, que por padrão não mostra o ≡. Valor que o sistema já salvou continua valendo. A composição é do **sistema** (o design configurado), **nunca do tema**: nenhum tema distribuído declara token de composição, e por isso escolher um tema no painel **não desfaz** a composição do sistema.

**Regras que fecham o comportamento:**
- **O ⚙ só nasce quando pelo menos um widget está *no menu*.** Uma barra só com fixados não o faz aparecer — não há botão que abre painel vazio. Busca, usuário e notificações fixos na barra também não se repetem no ⚙.
- **O ⚙ é superfície.** As linhas dele leem o texto da superfície, e não o da barra de tom contrastante que o abriu (`ShellPreferencesMenu.tsx`).
- **A escolha marcada é legível.** No menu, a linha selecionada fica em ao menos 4,5:1 contra a superfície. Na barra, a opção escolhida do grupo compacto fica em ao menos 4,5:1 contra o fundo do item ativo que ela pinta: o texto sobre ele é `--sarak-on-nav-active`, que nas barras de tom contrastante e no papel `surface` é o fundo da barra. Guarda `seletor-da-barra-legivel.spec.ts`, com item ativo escuro e claro e com os temas em que a cor do ativo mais se afasta da barra.
- **Sidebar recolhida:** o ⚙ continua — é um ícone e cabe — e recebe o que é fixado e não tem ícone próprio. Recolher a navegação nunca tira do usuário o acesso a um widget oferecido.
- **Celular:** tudo o que é oferecido vai para o drawer, fixado ou não, sem ⚙ separado; a navegação recolhida não ganha linha, porque o hambúrguer já é o colapso. Nada some (§2.3).
- **Duas camadas de controle:** a prop `widgets` do `SarakAppChrome` é do **código** e é o teto — o que o desenvolvedor desligou não volta pelo painel. A posição é do **sistema** e escolhe dentro desse teto.
- A prévia do painel mostra a barra que o usuário vai ver, porque monta o cromo real. Ela é amostra: leva um usuário, o sair e
  notificações de exemplo, sem efeito, para que o que o painel configura neles (posição, avatar) apareça também em produção
  (`PreviewSystemRenderer.tsx`).

**O seletor de idioma** só monta com **dois ou mais** idiomas habilitados e, fora do caminho de substituição pelo host, também precisa estar oferecido. Ele mostra o **idioma que vale** ([[09-temas-e-presets]] §4.7) e grava a preferência; o host pode substituí-lo inteiro por `window.__SARAK_OVERRIDES__['shell-language-selector']`, que o monta dentro de um invólucro (`sarak-language-override-wrapper`) e não depende das duas condições.

Existe **um** seletor de idioma na lib, o `SarakShellLanguageSelector`. Trocar o idioma repinta os textos do cromo e dos widgets na hora, **sem recarregar a página** ([[10-seguranca-e-acessibilidade]] §3.6).

## 2.3 A regra de degradação — nada some

| Modo | O que acontece com os slots |
| --- | --- |
| **sidebar** (sem barra superior) | `topbarStart` → topo da sidebar; `topbarEnd` → **rodapé** da sidebar (`ChromeSidebarBody.tsx`) |
| **topbar** | todos na barra superior, como declarados |
| **celular** (`SarakAppChromeMobile`) | `sidebarHeader`/`sidebarFooter` → **dentro do drawer** (é onde a sidebar existe ali, `SarakAppChromeMobile.tsx`); `topbarStart`/`topbarEnd` compactam na barra (`min-w-0`, sem empurrar o hambúrguer); `banner`/`footer` seguem faixas; `logo` viaja dentro do nó `brand`; busca, tema, usuário e notificações default vão **para o drawer** e o colapso é o próprio hambúrguer do drawer — selecionar um resultado da busca navega e fecha o drawer. **A navegação** segue o token `mobileNavigationStyle` (padrão `auto`): com até 5 itens (ou `bottom`), numa **barra fixa na base** — ícone e rótulo, área tocável do `touchTargetMin`, área segura, irmã do painel de conteúdo (nunca o cobre; o `footer` fica abaixo dela) — e fora do drawer; acima de 5 itens (ou `drawer`), dentro do drawer ([[021-navegacao-na-base-do-celular]]) |

**Nenhum slot nem widget é descartado em nenhum modo.** É por isso que o consumidor pode declarar todos e confiar —
sem escrever media query nem condicional por dispositivo.

Nota de contrato interno: `SarakAppChromeMobile` recebe o objeto `brand` e o `logo` separados e monta o
`ChromeBrand` ele mesmo; o slot de fim chega já resolvido, como `topbarActions` — por isso as props dele no
catálogo trazem `brand` e `logo`, mas não `topbarEnd`. A tradução acontece no ramo de celular de `SarakAppChrome.tsx`.

## 2.4 Todo token de cromo tem consumidor no cromo, ou não existe

O `SarakAppChrome` pinta o cromo a partir dos tokens do `schema/navigation.ts` inteiro e dos tokens de layout do
`schema/system.ts` que governam o cromo. Um token oferecido no schema e no catálogo é contrato com
o usuário final ([[09-temas-e-presets]] §4.4.3): **ou ele produz efeito no cromo, ou sai do schema.**
Não existe token oferecido que ninguém lê — para quem clica no painel, isso é indistinguível de defeito.

O cromo lê esses tokens por um hook único e os traduz em classe estrutural:

| Token | Efeito no cromo |
| --- | --- |
| `sidebarPosition` | lado da sidebar — `left`, `right` (inverte a direção do corpo) ou `floating` (destacada, com raio e sombra) |
| `navbarLayout` | `sticky`, `inline` ou `hidden` para a barra superior |
| `isNavHidden` | colapsa a navegação: sidebar estreita só com ícone, topbar com altura reduzida |
| `isAutoHideEnabled` | a nav só existe no ar sob o ponteiro; uma faixa sensível na borda a traz de volta |
| `searchPositionTopbar` | `left`, `center`, `right` ou `hidden` para o slot `search` na topbar |
| `searchPositionSidebar` | `top` ou `bottom` para o slot `search` na sidebar/drawer |
| `chromeSearchPosition` · `chromeUserPosition` · `chromeNotificationsPosition` · `preferenceModePosition` · `preferenceFontSizePosition` · `preferenceNavigationStylePosition` · `preferenceNavCollapsePosition` · `preferenceNavCollapsePositionTopbar` · `preferenceLanguagePosition` | a **composição** de cada widget: `pinned`, `menu` ou `off` (§2.2.2) |
| `tabGap` · `tabSectionMargin` | espaçamento entre itens e margem da seção de nav |
| `sidebar*`/`topbar*` de identidade (por barra): `…ItemTextColor` · `…ItemHoverTextColor` · `…CategoryColor` · `…BrandColor` · `…BorderColor`/`…BorderWidth`/`…BorderStyle`/`…BorderSide` · `…BrandBackground` · `…FooterBackground` · `…BackgroundStyle` · `…ActiveItemStyle` · `…ItemDensity` · `…IconSize`/`…IconColor` · separador de grupo · sombra e blur também no topo | texto, moldura, fundo, item ativo, densidade e ícones de cada barra. Os valores de enumeração estão no schema (`schema/navigation.ts`: estilo do item ativo `bar`/`pill`/`underline`/`filled`/`outline`; borda `solid`…`none` e lados; fundo `solid`/`gradient`/`texture`; densidade `compact`/`comfortable`/`spacious`, respeitando `touchTargetMin`). Declarados pelas fábricas `createChromeColorToken`/`createChromeSliderToken`/`createChromeSelectToken`, cada um nas três fontes. **A densidade e o estilo do item não mudam a métrica do item** fixada pelo [[015-metrica-do-item-de-navegacao-horizontal]] |
| `maxContentWidth` | largura máxima da região de conteúdo, centralizada. O padrão é `fluid`: a região acompanha o contêiner e cada margem lateral cresce com ele, de `layoutPadding` até 128 px (`calc(100% − 2 × clamp(layoutPadding, 5%, 128px))`); o valor gravado é a palavra `fluid` e só `resolveMaxContentWidth` (`schema/system.ts`) o traduz para CSS, no leitor do cromo e na emissão de `--sarak-max-content-width`. Os tetos `1000px`…`1600px` e `100%` continuam como opção. O respiro de `layoutPadding` continua nos quatro lados |
| `layoutDensity` | escala o respiro da região de conteúdo: `compact` < `comfortable` < `spacious`. `comfortable` é a identidade: o respiro é exatamente o de `--sarak-layout-padding` |
| `isSplitViewEnabled` | liga a vista dividida, que só aparece com o slot `secondaryContent` preenchido (§2.2) |
| `sidebarActiveColor` · `topbarActiveColor` | **fundo** do item ativo, cada orientação o seu. O padrão do schema, sem paleta, é `transparent`: o fundo real é o da barra (`sidebarColor`/`topbarColor`); com paleta, o da lateral é o véu da primária com alfa baixo ([[09-temas-e-presets]] §4.3.4) |
| `navItemActiveColor` | **texto e ícone** do item ativo, nas duas orientações e nos dois cromos — é o token que carrega o sinal visível |
| `sidebarHoverColor` · `topbarHoverColor` | fundo do item sob o ponteiro, cada orientação o seu; o texto também muda, de `--text-muted` para `--sarak-text-main` |
| `navActiveMarkerColor` · `navActiveMarkerGlow` | cor e brilho do marcador do item ativo (o marcador é desenhado pelo `SarakMenuItem`, que o `SarakShellNav` compõe) |
| `sidebarActiveGlass` | o vidro do item ativo da lateral, `on` (padrão) ou `off`, somado a qualquer estilo do item ativo (§2.1.4) |
| `sidebarNoiseOpacity` · `topbarNoiseOpacity` | camada de ruído sobre cada barra (`chrome/noiseTexture.ts`) |
| `sidebarBlur` · `sidebarShadow` | desfoque de fundo e sombra da sidebar; a sombra do modo `floating` também vem do token |
| `topbarBlur` · `topbarShadow` | desfoque do conteúdo atrás da topbar e sombra projetada pela barra superior |
| `sidebarItemTextColor` · `sidebarItemHoverTextColor` · `sidebarCategoryColor` · `sidebarBrandColor` | texto inativo, texto sob o ponteiro, rótulo de categoria e marca da sidebar |
| `topbarItemTextColor` · `topbarItemHoverTextColor` · `topbarBrandColor` | texto inativo, texto sob o ponteiro e marca da topbar |
| `sidebarBorderColor` · `sidebarBorderWidth` · `sidebarBorderStyle` · `sidebarBorderSide` | cor, espessura, traço e lados da moldura da sidebar; `edge` desenha a moldura de cartão nos quatro lados e só a linha do lado do conteúdo quando a barra encosta na tela (§2.1.4) |
| `topbarBorderColor` · `topbarBorderWidth` · `topbarBorderStyle` · `topbarBorderSide` | cor, espessura, traço e lados da moldura da topbar; `edge` fica junto ao conteúdo |
| `sidebarBrandBackground` · `sidebarFooterBackground` | a faixa da marca no topo da lateral, com ou sem logo (§2.1.4), e o fundo do rodapé da sidebar |
| `topbarBrandBackground` | fundo da região da marca na topbar, que só pinta com logo |
| `brandDisplay` | o que a marca mostra nas duas barras: `both`, `logo` ou `name` (§2.1) |
| `userAvatarStyle` | o avatar do usuário sem foto: `initials` ou `icon` (§2.1.4) |
| `sidebarBackgroundStyle` · `topbarBackgroundStyle` | tratamento sólido, gradiente ou textura local, sem dependência de rede |
| `sidebarActiveItemStyle` · `topbarActiveItemStyle` | forma do item atual: `bar`, `pill`, `underline`, `filled` ou `outline` |
| `sidebarItemDensity` · `topbarItemDensity` | espaçamento compacto, confortável ou espaçoso, mantendo o alvo de toque mínimo |
| `sidebarIconSize` · `sidebarIconColor` · `topbarIconSize` · `topbarIconColor` | tamanho e cor dos ícones por orientação |
| `topbarGroupSeparatorColor` | separador entre grupos na barra superior |
| `sidebarMinWidth` · `sidebarMaxWidth` · `sidebarLabelMaxWidth` · `topbarLabelMaxWidth` | limites de largura da sidebar e do rótulo da marca, por orientação |
| `shellBrandLogoSize` · `brandLogoSizeCollapsed` | altura do logo com a navegação expandida e recolhida |
| `topbarTitleColor` | cor do nome do sistema na topbar |
| `searchDropdownGap` · `searchDropdownWidth` | distância e largura máxima do painel de busca (o palette do `SarakSearch`) |
| `layoutPadding` | **respiro do conteúdo** em relação às bordas, nos quatro lados e com valor por dispositivo (`--sarak-layout-padding`, faixa de 0 a 80). É do **conteúdo**: `banner`, `footer` e as barras não o recebem |

**O respiro do conteúdo vem do token** — nenhuma classe fixa
participa dele, nos quatro lados, e o refluxo do celular usa o mesmo valor. O invólucro de conteúdo do
cromo carrega `data-sarak-content`, que é por onde a medição em navegador real o encontra
([[11-testes-e-cobertura]] §7). Quem quer o conteúdo encostado na borda põe o token em zero — não existe
caminho por classe.

**Cada variável CSS tem um único token de origem.** Dois tokens declarando a mesma variável fazem o
vencedor depender da ordem de iteração do mapa, não do autor do tema — é por isso que `navItemActiveColor`
declara só `--sarak-nav-active-color`, e `--theme-primary` pertence a `primaryColor`.

**O realce é visível em todo tema shippado, e isso é medido — no ativo E no hover:** duas varreduras do
catálogo inteiro (`SarakMenuItem.test.tsx`) exigem que o item **ativo** se distinga do inativo nas duas
orientações, pelo fundo **ou** pelo texto, e que o **fundo de hover** se distinga do repouso nas duas
orientações **e nos dois modos** — o nativo do tema e o oposto, como o Provider de fato o resolve. A régua
é distância perceptual (ΔE em Lab, acima do limiar de diferença perceptível), não desigualdade de valor
nem razão de luminância, que enganam em sentidos opostos. Cor não conversível (`hsl()`, `var()` não
resolvido, gradiente) é **pulada com aviso**, nunca medida contra preto inventado. A varredura de hover tem
lista de exclusão declarada — hoje **vazia** —, e um teste próprio impede que ela esvazie a varredura em
silêncio. A legibilidade do texto ativo sobre o fundo efetivo
é do `auditor_contraste`.

> **`hidden` na topbar some com a região mesmo havendo conteúdo** (`searchPositionTopbar`). A busca **não** some mais por tema na sidebar: a opção `hidden` de `searchPositionSidebar` saiu, e quem não quer oferecer a busca usa a composição (`chromeSearchPosition: 'off'`, §2.2.2) ou `widgets.search: false`.

**A regra estrutural, para quem for estender:** a tradução token → classe vive num mapa de **literais**,
nunca em string interpolada. O scanner do Tailwind lê o arquivo como texto; uma classe montada por
concatenação não existe no CSS publicado ([[07-responsividade-e-multidispositivo]] §6.1).

### 2.4.1 O gate que impede a lacuna de voltar

`npm run chrome-token-parity:check` cobra a metade que nenhum outro auditor cobrava: **não o valor do
token, a existência do consumidor**. Para cada token da lista, o gate exige uma referência ao `id` ou a uma
das variáveis CSS declaradas **no `SarakAppChrome`** — `src/components/Layout/**`, mais os
átomos compartilhados que ele usa para pintar o item de menu, a busca e o avatar (`SarakMenuItem`, `SarakSearch`,
`SarakShellNav`, `SarakShellUserWidget`). Um token que o cromo lê por um mapa de ids exportado do schema conta por `MAPA.chave` (`CHROME_WIDGET_POSITION_TOKEN_IDS.search`) ou pela chamada de um leitor genérico declarado no gate (`splitChromeWidgetsByPlacement`); citar só o nome do mapa não aprova os outros ids dele, e um id novo no mapa fica reprovado até alguém o ler. Ausência de consumidor é bloqueio, e ele roda no `pre-commit`.

**O escopo cobre os tokens de cromo em qualquer schema:** todo token de `schema/navigation.ts` (o schema é avaliado, não lido como texto: o token montado por fábrica e o de `barPersonality.ts` entram), a seção de layout de `schema/system.ts` até o marcador de bordas (também avaliada, não lida como texto), os tokens de posição de `schema/preferences.ts` (os dois passos de tamanho de fonte ficam fora: quem os lê é o Provider, em `overlayPreferences.ts`) e todo token cujo id contém `navigation` nos demais `schema/*.ts`. Esse recorte inclui escolhas de navegação definidas fora do schema dedicado, como a navegação móvel de `schema/global.ts`, sem tratar outros grupos globais como tokens do cromo.
**A contagem é fonte viva: o próprio comando a imprime.** O que esta spec fixa é a *relação* — todo token
coberto tem consumidor no cromo, e o que não tem está em `ORPHAN_TOKENS`, cada um com origem
`arquivo:linha`. **Hoje a lista está vazia**: todo token coberto tem consumidor.

`SarakMenuItem`, `SarakSearch` e `SarakShellNav` contam como parte do cromo, porque ele os compõe. **CSS global não conta:** mapear uma variável em `src/styles/` não é
consumo do cromo — se contasse, o gate aprovaria um cromo que nunca lê o token, que é exatamente a lacuna
que ele existe para fechar.

**Limites que o próprio gate declara** ([[00-regras-e-invariantes]] **R18**): a checagem é **textual**, não
por AST — prova que existe referência, não que o consumo produz efeito visual, e não distingue consumo de
menção em comentário. A prova de efeito é o teste de componente e, para CSS renderizado,
`cromo-css-real:check`.

# 3. Os dois níveis de "adicionar imagem/animação"

Confusão frequente. São **dois mecanismos que se complementam**, nunca competem:

| | (a) Fundo/atmosfera GLOBAL | (b) Conteúdo por REGIÃO |
| --- | --- | --- |
| Como | por **tema** (Design Engine: `globalBackgroundImageUrl`, texturas, atmosfera) | por **slot** (`decoration`, `banner`, `footer`, `logo`…) |
| Alcance | a aplicação inteira, atrás de tudo | aquela região do cromo |
| Quem controla | o **tema** (troca junto com o tema) | o **código do app** (independe do tema) |
| Entra por | JSON de tema ([[09-temas-e-presets]]) | `ReactNode` em prop |

O JSDoc de `decoration` em `ChromeSlots.tsx` diz isso explicitamente: `decoration` **complementa** — não substitui — o fundo
global por tema (`SarakBackgroundRenderer`), que **continua sendo o caminho de fundo do app**.

Regra prática: **atmosfera é do tema; ornamento localizado é do slot.** Quem quer um fundo que muda com o
tema usa (a). Quem quer um banner de campanha na topbar usa (b).

## 3.1 O fundo global alcança os DOIS cromos

O `SarakAppChrome` **deixa de pintar fundo próprio quando há mídia global** — a raiz
emite fundo transparente em vez do token de fundo, para que o `SarakBackgroundRenderer` do Provider
(montado com `position: fixed`, atrás de tudo) apareça sob o cromo inteiro. Sem mídia, ele pinta o
próprio token, como sempre.

A regra vale igual nos **três modos de geometria** — sidebar, topbar e celular —,
porque o estilo de raiz é montado uma vez e repassado aos três ramos: nenhum ganha caso especial. O `style`
do consumidor continua sobrescrevendo nos dois estados.

> **Por que isto merece uma seção.** A assimetria foi invisível por construção: o
> token aplicava, o renderizador montava, a mídia carregava — e a raiz opaca do cromo a cobria inteira. O
> sintoma que chega é *"escolher imagem de fundo não faz nada"*, e nada no caminho do tema está errado.
> Diferença de fundo de raiz não se prova em `jsdom`, que não resolve cascata: prova-se lendo o valor
> **computado** em navegador (§9).

# 4. Acessibilidade do colapso mobile

`SarakAppChromeMobile` (`src/components/Layout/SarakAppChromeMobile.tsx`) não é um cromo "menor" — é um
padrão diferente, com obrigações próprias:

| Garantia | Como |
| --- | --- |
| Toggle com `aria-expanded` + `aria-controls` + `aria-label` que **muda de texto** (abrir/fechar) | o botão do hambúrguer |
| Drawer com **armadilha de foco** — `Tab` preso, `ESC` fecha, foco volta ao toggle | `useFocusTrap` |
| Scrim é `<button>` com `aria-label`, não `div` clicável | `SarakScrim` |
| Selecionar item **fecha o drawer** antes de navegar | a navegação de dentro do drawer |
| **Scroll do corpo travado** enquanto o drawer está aberto (não vaza rolagem por baixo) | efeito que restaura o valor anterior ao fechar |
| Drawer limitado a `max-w-[85vw]` | classe do drawer — nunca cobre a tela inteira |

O detalhe do `useFocusTrap` (por que `onClose` fica atrás de ref) está em
[[10-seguranca-e-acessibilidade]] §2.4a.

# 5. ⚠️ A altura própria do cromo, a rolagem interna, e o bug de browser que originou a altura

```ts
const rootStyle: React.CSSProperties = {
    height: '100dvh',
    overflow: 'hidden',
    background: useHasGlobalBackgroundMedia() ? 'transparent' : 'var(--bg-body, var(--theme-body, transparent))',
    ...style,
};
```

O `rootStyle` de `SarakAppChrome.tsx` — com o motivo escrito no código, e **vale documentar porque é a classe de
bug que volta**:

O cromo é a casca do app, e **não pode depender de o host ter setado `html/body/#root { height: 100% }`**.
Sem altura definida no ancestral, o `h-full` do cromo **colapsa** (percentual sobre altura indefinida),
a navegação — que tem `overflow` — é **recortada**, e o sintoma que chega é:

> *"a sidebar sumiu, mas o conteúdo aparece"*

`100dvh` dá ao cromo uma altura de **viewport própria**, independente do CSS do host. O `style` do
consumidor **sobrescreve** (`...style` vem depois), que é o que permite uso embarcado dentro de um
container de altura fixa.

**Por que registrar:** o sintoma parece bug de componente (a sidebar!), a causa está no CSS do **host**, e
a correção mora numa terceira camada (a raiz do cromo). Sem isto escrito, o diagnóstico se refaz do zero
a cada ocorrência.

## 5.1 A altura é fixa, e quem rola é o painel de conteúdo

A raiz tem **altura de janela, não piso**, e **contém** o excedente (`overflow: hidden`), o mesmo valendo
para a moldura (`ChromeFrame.tsx`). A consequência é o contrato de rolagem do cromo:

| Região | Rola? |
| --- | --- |
| O documento | **não** — a raiz do cromo não cresce com o conteúdo |
| O painel de conteúdo (`data-sarak-content`) | **sim** — é a região rolável da página |
| A navegação lateral (o `<nav>` dentro da `<aside>`) | **sim, por dentro**, e só quando os itens não cabem |
| `banner`, `footer`, barra lateral e barra superior | **não** — são faixas do cromo e permanecem no lugar |

**Quem rola a navegação é o `<nav>`, não a `<aside>`.** O `SarakShellNav` vertical já nasce com
`h-full min-h-0 overflow-y-auto` (`SarakShellNav.tsx`); o que fecha a cadeia é o chamador declarar
`min-h-0` nele (`ChromeSidebarBody.tsx`), sem o qual o flex não o deixa encolher e os itens **saem
recortados** pela raiz — a §2.3 ao contrário. A `<aside>` guarda a moldura e a geometria; o `<nav>` guarda
a rolagem.

**A margem da barra lateral é compensada na altura.** `tabSectionMargin` vale nos quatro lados (§2.4), e
por isso a altura da `<aside>` é `calc(100% - (margem * 2))` (`ChromeSidebarBody.tsx`) — é o que
impede a barra de exceder a janela sem quebrar a paridade do token.

**Consequência para quem já consome:** a rolagem da página deixou de ser a do documento, então
`window.scrollTo`, âncoras e `scrollIntoView` sobre o documento mudam de alvo — e quem precisa do
comportamento antigo passa outra altura por `style`. A nota está em `docs/migracoes.md` (7.0.0).

**O host não declara cadeia de altura.** Com a altura própria da raiz, `html`, `body` e `#root` não
precisam de `height: 100%`: numa página mais alta que a janela, sem essa cadeia, o documento não rola, a
barra superior não se move e quem rola é o painel de conteúdo (`browser-tests/altura-do-cromo.spec.ts`).

**O painel de conteúdo é bloco, e o filho que enche a altura pede isso.** O `<main>` (`ChromeContentRegion.tsx`)
fica em `display: block` de propósito: em coluna flexível, o filho com `margin: 0 auto` e sem largura própria
deixa de esticar e encolhe ao conteúdo, o que quebra o padrão de página centralizada (`max-w-* mx-auto`). Quem
precisa ocupar a altura útil usa `fillHeight` no `SarakAnalyticalPage` ou a classe pública `sarak-fill-height`
(`min-height: 100%` do `<main>`, `src/styles/_utilities.css`) — o mesmo caso de navegador mede as duas coisas.

**Onde isso se mede:** em navegador real (`browser-tests/`, [[11-testes-e-cobertura]] §7), que é o único
lugar onde altura e posição se verificam de verdade. Teste de componente prova a declaração; só o
navegador prova a caixa.


# 6. Zero hardcode

Toda cor e medida do cromo vem de **token com fallback**:

| Onde | Token (com fallback) |
| --- | --- |
| altura da topbar | `var(--sarak-topbar-height, 64px)` |
| fundo da topbar | `var(--sarak-topbar-bg, var(--theme-sidebar-bg, transparent))` |
| largura da sidebar | `var(--sarak-sidebar-width, 240px)` |
| fundo da sidebar | `var(--sarak-sidebar-bg, var(--theme-sidebar-bg, transparent))` |
| bordas | `var(--border-color, var(--theme-border, rgba(255,255,255,0.1)))` |
| padding dos slots de sidebar | `var(--sarak-layout-gap-sm, 8px)` |
| scrim do drawer | `var(--sarak-modal-overlay, rgba(0,0,0,0.5))` — o do `SarakScrim`, que o drawer usa |
| raio do toggle | `var(--sarak-card-radius, 8px)` |

O fallback existe para o cromo **degradar visivelmente**, nunca colapsar, se o tema não hidratar. O que
sobra de classe Tailwind é **estrutural** (`flex`, `min-w-0`, `shrink-0`, `overflow-auto`) — permitido pela
Regra 2 ([[00-regras-e-invariantes]]).

# 7. Fronteira: o que NÃO está aqui

- **O reflow por dispositivo** (tablet → topbar compacta; celular → hambúrguer + drawer) é decidido em
  `SarakAppChrome.tsx` mas o **contrato multidispositivo** — breakpoints, `useSarakDevice`, o que
  adapta e o que não adapta — é [[07-responsividade-e-multidispositivo]].
- **Nenhum slot novo é proposto aqui.** Os slots da tabela da §2.2 são o contrato; ampliar é decisão de produto, com o custo de
  ampliar também a regra de degradação (§2.3) e o gate de catálogo.

# 8. Critérios de aceite

- [x] A lacuna que criou o componente está descrita com a causa estrutural, não como "feature nova".
- [x] Os slots estão listados com região, degradação e comportamento de ausência (tabela da §2.2).
- [x] **Provado no gate:** `catalog:check` verde e todos os slots da §2.2 publicados no catálogo gerado (mais o alias `topbarActions`).
- [x] A regra de geometria (banner primeiro, footer último, full-width) é a mesma nos três modos.
- [x] `decoration` está registrado como ornamento (`aria-hidden` + sem captura).
- [x] O bug de altura está documentado com sintoma, causa e correção.
- [x] O cromo é único: não há host, registro nem Discovery, e a navegação é dado do consumidor.
- [x] O item de navegação é um link de verdade, com a regra dos modificadores (§2.1.2).
- [x] Os oito widgets têm composição do sistema e o padrão de fábrica da §2.2.2; o que depende do consumidor, sem a conexão, some em produção e aparece desabilitado fora dela (§2.2.1).
- [x] A barra lateral tem a mesma anatomia em todo tema, e cada peça é token (§2.1.4).
- [x] Todo valor visual citado é token com fallback.

# 9. Plano de testes (Quality Gate)

| Verificação | Onde | Situação |
| --- | --- | --- |
| Cromo renderiza `children`, marca e navegação; precedência `navItems` > `nav` | `src/components/Layout/__tests__/SarakAppChrome.test.tsx` | ✅ suíte |
| Slots: presença, ausência (não renderiza), `topbarEnd` vence `topbarActions` | idem | ✅ suíte |
| Colapso por dispositivo (desktop/tablet/celular) via `overrideDevice` | `src/components/Layout/__tests__/SarakAppChrome.viewport.test.tsx` | ✅ suíte |
| Drawer mobile: `aria-expanded`, ESC, foco, fechar ao selecionar | `src/components/Layout/__tests__/SarakAppChromeMobile.test.tsx` | ✅ suíte |
| Moldura comum (ordem banner/corpo/footer, isolamento com `decoration`) | `src/components/Layout/chrome/__tests__/` | ✅ suíte |
| Contrato publicado (todos os slots no catálogo) | `npm run catalog:check` | ✅ gate |
| Cada token de cromo produz a classe estrutural esperada nos dois corpos | `src/components/Layout/chrome/__tests__/ChromeTopbarBody.test.tsx` · `ChromeSidebarBody.test.tsx` | ✅ suíte |
| O hook de leitura dos tokens cai no default correto quando o design não os traz | `src/components/Layout/chrome/__tests__/useChromeDesignTokens.test.ts` | ✅ suíte |
| Auto-hide: some sob ausência de ponteiro, volta pelo sensor de borda | `src/components/Layout/chrome/__tests__/useChromeAutoHide.test.ts` | ✅ suíte |
| Todo token de cromo tem consumidor no cromo | `npm run chrome-token-parity:check` | ✅ gate (`pre-commit`) |
| O item ativo se distingue do inativo em **todo** tema shippado, nas duas orientações (ΔE) | `src/components/atomic/Navigation/__tests__/SarakMenuItem.test.tsx` | ✅ suíte |
| Widgets default: conjunto completo, cada opt-out isolado, slot `search` vencendo o default, atalho e suas três travas, celular | `src/components/Layout/__tests__/SarakAppChrome.test.tsx` · `SarakAppChromeMobile.test.tsx` · `chrome/__tests__/useChromeDefaultWidgets.test.ts` | ✅ suíte |
| O palette busca os itens dados (`items` é obrigatório) e seleciona por clique e teclado; a busca embutida navega pelo resultado | `src/components/atomic/Inputs/__tests__/SarakSearch.test.tsx` · `src/components/atomic/Navigation/__tests__/SarakShellSearchWidget.test.tsx` | ✅ suíte |
| Posição de cada widget: as três posições, ⚙ só com item no menu, teto de `widgets`, sidebar recolhida | `src/core/Provider/utils/__tests__/chromePreferencePlacement.test.ts` · `src/components/Layout/__tests__/SarakAppChrome.preferencesBar.test.tsx` | ✅ suíte |
| Nenhum tema distribuído declara composição nem esconde a busca; os nove tokens de composição entram no Essencial | `src/core/Design/presets/themes/__tests__/chromeWidgetDefaults.test.ts` · `src/features/DesignEngine/utils/__tests__/dynamic-categories.test.ts` | ✅ suíte |
| Widget sem conexão: ausente em produção; fora dela, `aria-disabled`, sem handler, rótulo de estado e aviso único | `src/components/Layout/chrome/__tests__/ChromeUnavailableWidget.test.tsx` · `ChromeNotificationsWidget.test.tsx` · `useChromeDefaultWidgets.test.ts` | ✅ suíte |
| Item de navegação: âncora, modificadores e clique do meio ao navegador, `disabled`, `badge`, `target` | `src/components/atomic/Navigation/__tests__/SarakMenuItem.test.tsx` · `SarakLink.test.tsx` | ✅ suíte |
| O ⚙ como overlay: abre por teclado, ESC fecha, o foco volta ao ⚙; não monta vazio | `src/components/atomic/Navigation/__tests__/ShellPreferencesMenu.test.tsx` | ✅ suíte |
| O seletor de idioma: lista o que o tema habilita, grava preferência, não monta com um idioma, mostra o idioma que vale | `src/components/atomic/Navigation/__tests__/SarakShellLanguageSelector.test.tsx` | ✅ suíte |
| Item horizontal em caixa normal e corpo legível, medido em navegador real | `browser-tests/cromo-css-real.spec.ts` | ✅ gate (`npm run cromo-css-real:check`) |
| Contrato da pílula — raio do item horizontal diferente do botão de ação | `browser-tests/cromo-css-real.spec.ts` | ✅ gate (`npm run cromo-css-real:check`) |
| **Fundo da raiz do cromo**: `background-color` computado com e sem mídia global, em Chromium real contra o `dist/` buildado | `browser-tests/cromo-css-real.spec.ts` | ✅ gate (`npm run cromo-css-real:check`) |
| `navItems` com sub-abas: filhos de um nível e `defaultExpanded` repassados, neto ignorado, filho ativo abre o grupo | `src/components/Layout/chrome/__tests__/navItem.test.tsx` | ✅ suíte |
| A métrica do item tem fonte única: altura da busca e recuo da sub-aba nas três densidades | `src/components/atomic/Navigation/__tests__/menuItemMetrics.test.tsx` | ✅ suíte |
| O nome da marca encolhe até caber, sem reticências | `src/components/Layout/chrome/__tests__/useFitBrandName.test.ts` · `ChromeSlots.test.tsx` | ✅ suíte |
| **Anatomia da barra lateral** em quatro temas: moldura, faixa e monograma, marca inteira, busca e títulos, item ativo e vidro, inativo apagado, sub-abas, rodapé em linhas e alinhado, usuário, recolhida, composição padrão e nenhum item atrás do rodapé (1440 × 900 e 1280 × 720) | `browser-tests/barra-lateral-anatomia.spec.ts` | ✅ gate (`npm run cromo-css-real:check`) |
| Os quatro widgets do cromo montados dentro de slots, sem registro | `src/components/atomic/Navigation/__tests__/ShellWidgetsForaDoShell.test.tsx` | ✅ suíte |

⚠️ **Ressalva metodológica herdada** ([[07-responsividade-e-multidispositivo]] §7): teste que usa
`overrideDevice` **não exercita a detecção real** de viewport. A cobertura de colapso acima prova o
*reflow*, não a *detecção*.
