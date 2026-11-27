---
tipo: "spec"
titulo: "Painel de customização e ambiente de preview — a camada features/ do Design Engine"
dominio: "Sarak-Lib-UI-Core / Design Engine / Autoria"
status: "🟢 Vigente"
prioridade: "Alta"
tags: ["spec", "design-engine", "painel", "preview", "gemeo-digital", "folksonomia"]
relacionados: ["[[00-regras-e-invariantes]]", "[[01-gates-e-baseline]]", "[[02-design-engine]]", "[[09-temas-e-presets]]", "[[016-preferencias-do-usuario-separadas-do-tema]]", "[[08-identidade-do-host-e-zero-marca]]", "[[10-seguranca-e-acessibilidade]]", "[[003-remocao-backend-proprio]]", "[[024-paleta-calculada-separada-do-tema]]", "[[05-cromo-e-slots]]", "[[07-responsividade-e-multidispositivo]]"]
---

# 1. O que é, e por que vive em `features/`

O **painel de customização** é a ferramenta de autoria de temas da própria biblioteca: a UI onde um humano
mexe em tokens e vê o resultado ao vivo. A peça pública é o **`SarakCustomizationPanel`**
(`src/features/DesignEngine/Library/CustomizationPanel/index.tsx`, exportado **lazy** no barril `src/index.ts`
com esse nome — não há export sem prefixo), reexportando um `React.FC` com `Suspense` interno. O consumidor monta
`<SarakCustomizationPanel />`. Por dentro, o trabalho de fato é `CustomizationPanelImpl.tsx` orquestrando
`ThemeCustomizationTab`, `MasterControlPanel` e `PreviewCanvas`.

**`features/DesignEngine/` é a ÚNICA feature de `src/features/`** — e o motivo é a regra de alocação de
[[00-mapa-do-modulo]]: ela tem **estado, lógica e orquestração**, logo não é átomo. Um átomo é visual e
burro; isto é uma aplicação pequena dentro da biblioteca.

A regra de dependência que decorre disso é cobrada por gate: **`src/components` não importa `features/`** e
**`src/core` não importa `features/`** (`auditor_arquitetura.mjs`, por AST). A feature consome as camadas
de baixo; nunca o contrário.

**O que este documento NÃO cobre:** o motor (como token vira CSS Variable) é [[02-design-engine]]; o
contrato do dado de tema é [[09-temas-e-presets]].

# 2. A folksonomia dinâmica — o ponto mais interessante da arquitetura

> **O painel não tem categoria hardcoded. Ninguém monta formulário à mão.**

Três fontes se cruzam e a UI só **itera** o resultado:

| Fonte | O que injeta | Onde |
| --- | --- | --- |
| **Pilares** | as 7 abas de nível 1 — a **mesma** taxonomia para o painel e para o Command Center (as duas telas leem este arquivo) | `src/features/DesignEngine/config/design-pillars.json` |
| **Catálogo** | a **semântica** — as `categories` de cada token | partições de `src/core/Design/catalog/` |
| **Schema** | o **dado** — tokens, tipos, constraints, defaults | `MASTER_DESIGN_MAP` |

O algoritmo está em `src/features/DesignEngine/utils/dynamic-categories.ts`:

1. **`sanitizeCategory(raw)`** (`:3-19`) — dicionário de **redução**: dezenas de rótulos livres colapsam em
   ~11 categorias canônicas (`'cores'`, `'colors-and-atmosphere'`, `'identidade'`, `'branding'`, `'marca'`,
   `'tema'`… → **"Cores e Marca"**). É o que permite ao catálogo usar vocabulário natural sem fragmentar a
   UI.
2. **`PILLAR_TO_CATEGORIES` / `CATEGORY_TO_PILLAR`** (`:23-34`) — derivados do JSON de pilares em tempo de
   import; não há mapa escrito à mão.
3. **`buildDynamicGroups(masterTokens, catalogJSON)`** (`:41-`) — cruza as categorias sanitizadas de cada
   token com o `MASTER_DESIGN_MAP` e produz `{ Pilar: { Grupo: Token[] } }`, a estrutura que a UI percorre.

Os 7 pilares (do JSON, não desta prosa): `brand`, `typography`, `surfaces`, `interaction`, `navigation`, e
os dois restantes do arquivo — cada um com `title`, `icon` e `index`.

**A consequência que importa:** **um token novo aparece no painel sozinho.** Basta existir no schema com
`categories` no catálogo — nenhuma linha de UI é escrita. Inversamente: um token que não aparece no painel
está sem categoria no catálogo, não "faltando no painel".

**O contrapeso honesto:** o dicionário de redução (`:6-16`) é uma lista de sinônimos **hardcoded**. Ele é a
cola que faz a folksonomia funcionar e é o único ponto que precisa de manutenção manual quando alguém
inventa um rótulo novo de categoria. Categoria não reconhecida cai em `'Geral'` (`:18`) — degrada, não
quebra.

## 2.1 Uma coluna, sete decisões e três níveis

O painel tem **uma coluna só**, sem seletor de modo. Ela lista **sete decisões**, declaradas em `config/design-decisions.json` e lidas por `utils/decisions.ts`: Tema, Cores, Fontes, Forma, Componentes, Barras e Layout. A primeira entrada é o atalho **"Usar minha marca"** (`BrandShortcut`). Cada linha mostra o valor atual e uma marca de alterada.

| Nível | O que mostra | Como é derivado |
| --- | --- | --- |
| **1. Decisões** | a lista da coluna | `COLUMN_DECISIONS` |
| **2. Dentro da decisão** | opções visuais com amostra real, em grupos | a entrada da decisão no JSON. A decisão Barras se organiza por pergunta: Onde fica, Como é, O que aparece, Marca e Comportamento (§2.1.2) |
| **3. Ajuste fino** | os tokens da decisão, recolhidos com a contagem real, primeiro os de `importance >= 80` e depois "Mostrar todos" | catálogo e `fineMatch` por pergunta, para os tokens sem preset cair sob a pergunta certa |

Os **"Ajustes principais"** de uma decisão com mais de oito controles abrem recolhidos (`MAIN_TOKENS_OPEN_LIMIT`, `ThemeDecisionView.tsx`).

**Os tokens das decisões principais falam o idioma do painel.** Os "Ajustes principais" (`mainTokens`) e as perguntas de cada decisão (`questionTokenIds`), calculados por `decisionLayers`, mostram nome, descrição e opções nos seis idiomas (`catalogEntries.decisionTokens.ts`, `catalogEntries.decisionTokenDescriptions*.ts`, `catalogEntries.decisionOptions.ts`). A ordem de recuo, em `enhanceToken` (`DecisionTokenList.tsx`): o texto do idioma, depois o do catálogo em português, depois o do schema. Em português vale o catálogo. A busca de token acha pelo texto traduzido (`searchableTokens.ts`). O ajuste fino fora dessas decisões segue em português.

**Cada decisão cabe em 2,5 alturas da coluna**, a 1440×900, como abre (`MAX_SCROLL_SCREENS`, `catalogo-proporcional.spec.ts`). Para isso, os grupos de opção abrem fechados (`CollapsibleSection`, título com `aria-expanded`, conteúdo montado só aberto). Abre só o grupo em uso, o primeiro com uma opção aplicada no rascunho, ou o primeiro sem nenhuma, e na decisão Tema a galeria de temas (`initialOpenGroups`, `ThemeDecisionOptions.tsx`). A busca de token abre todos. Abrir mais grupos é escolha de quem usa, fora da meta.

Ao abrir uma decisão, a tela troca na mesma coluna, com voltar. Esc volta. O foco vai ao título ao entrar e à linha ao voltar.

**Por que `visualImpact` existe:** `importance` **não** mede impacto visual: tokens como z-index e breakpoint estão acima de `texture` nele. O campo fica no catálogo e entra na ordem da busca (§2.2).

**A coluna não perde token.** Um teste exige que todo token do dicionário siga alcançável numa decisão ou no **Avançado**, e a busca atravessa tudo (§2.2). Token novo entra sozinho, pelo campo que declara, sem ninguém atualizar lista. É o mesmo princípio da §2.

**O Command Center tem entrada própria:** é acesso direto por busca, e fica no menu **Avançado** como **"Busca por pilar"** (§2.3).

### 2.1.1 A seção "Composição da Barra"

Na decisão **Barras**, sob a pergunta **O que aparece**, mora a seção *Composição da Barra*: os **oito** tokens que dizem onde cada widget do cromo aparece — `pinned`, `menu` ou `off` — para modo claro/escuro, tamanho da fonte, navegação topo/lateral, navegação recolhida, idioma, busca, usuário e notificações ([[05-cromo-e-slots]] §2.2.2). Ela nasce da folksonomia como as demais: os oito tokens carregam a categoria `chrome-composition` no catálogo, e o painel a mostra como seção própria do pilar.

- **Aparece no nível 2.** Os oito não exigem abrir o ajuste fino, e os rótulos falam a língua do usuário: "Mostrar", "No menu" e "Esconder".
- **É do sistema, não do tema.** Escolher um tema no painel **não** altera essa seção: nenhum tema distribuído declara token de composição.
- Os dois tokens do tamanho da fonte do usuário, `preferenceFontSizeReduction` e `preferenceFontSizeIncrease` ([[09-temas-e-presets]] §4.7), moram na mesma pergunta.

### 2.1.2 A decisão Barras

A decisão **Barras** fica entre Componentes e Layout e reúne tudo o que é das barras: a orientação, a troca pelo usuário, o tom, os presets de Barra lateral e de Barra de topo, as cinco perguntas e os ajustes finos de barra (item, cores, marcador, rodapé). O **Layout** fica com a largura do conteúdo e o bloco global. Cada token está em uma das duas, nunca nas duas (`tokenScope` `bars`/`notBars`, `utils/barScope.ts`). Na lista, a linha das Barras resume a orientação, o tom e a troca (por exemplo, "Lateral · Invertida · troca no menu").

- **Um tom para as duas barras.** O grupo `barTone` (presets `bar-tone-neutral`, `surface`, `primary`, `secondary` e `inverse`) grava `sidebarTone` e `topbarTone` juntos; o ajuste de uma barra só fica no ajuste fino. Os presets de Barra lateral e de Barra de topo gravam só estrutura (borda, item ativo, densidade, fundo, raio), sem tom. Quem vence a cor declarada pelo tema está em [[09-temas-e-presets]] §4.3.4.
- **Espiar um tom** passa pelo mesmo cálculo da escolha (`utils/peekWithTones.ts`): a prévia mostra a barra no tom espiado, também num tema que declara a cor da barra.
- **"O usuário pode trocar entre lateral e topo"** é um interruptor na pergunta Onde fica (`NavigationSwitchControl.tsx`). Desligado grava `off` em `preferenceNavigationStylePosition`; ligado volta ao padrão do token (`menu`), e quem já está em `menu` ou `pinned` fica. Desligado, a escolha some da barra e do ⚙, e a preferência de navegação que o usuário já gravou deixa de valer (continua gravada e volta a valer se o interruptor ligar). A posição `pinned` × `menu` continua na pergunta O que aparece.

### 2.1.3 O painel diz o que o controle faz

- **A preferência pessoal por cima do tema é avisada.** Quando o administrador edita um token que uma preferência dele mesmo sobrepõe (`navigationStyle`, `bodySize`, `mode`, `isNavHidden`, `sidebarWidth`), a linha do controle diz "Sua preferência pessoal (<valor>) está por cima do tema" e oferece apagar só aquela preferência (`DecisionTokenRow.tsx`, `utils/tokenNotes.ts`). O aviso só aparece quando o tema oferece a preferência ([[09-temas-e-presets]] §4.7); a largura, só com `sidebarResizable`. Apagar tira a chave do que o usuário gravou (`storedPreferences`), sem o modo padrão do host. O aviso vale nos controles da decisão; os resultados da busca não o mostram.
- **Controle que não vale na orientação do rascunho fica desabilitado com o motivo.** O token que declara `interactsWith: ['navigationStyle']` fica num `fieldset` desabilitado quando a orientação do rascunho é a outra.
- **A largura da lateral mostra o intervalo que vale**: o slider nasce entre o mínimo do token e `sidebarMinWidth`/`sidebarMaxWidth` do dispositivo da prévia, com o texto "Entre X e Y px" (`sidebarWidthRange`).
- `isNavHidden` se chama **"Navegação recolhida"**: é o que ele faz (a barra fica como trilho de ícones).

## 2.2 A busca de token — por sentido, não por substring

As três telas que buscam token — a aba de tema, a planilha do `MasterControlPanel` e o Command Center —
chamam **uma função só**, `searchTokens` (`src/features/DesignEngine/utils/token-search.ts`). Ela não muda
rótulo nenhum: decide o que aparece e em que ordem.

**O que ela indexa:** o `label` do schema **e** o `name` do catálogo (a tela mostra um, o schema guarda o outro,
e eles diferem em muitos tokens), o id quebrado em `camelCase`, `tags`, `categories`, `description` e o rótulo do
componente de origem. Um token sem entrada no catálogo cai no `label` do schema.

**Como casa:** acento e caixa são normalizados, e palavras de ligação (`de`, `do`, `da`, `com`…) são ignoradas.
**Todo** termo precisa casar, de um destes jeitos:
- palavra inteira;
- **conceito** — o termo pertence a um grupo de `config/token-search-concepts.json` (`fonte`, `escrita`,
  `texto`, `letra`, `tipografia`, `font`… são um grupo), e qualquer membro do grupo está no índice;
- **prefixo, só no último termo** (busca enquanto digita: `cor do tex` alcança `texto`), com 2 ou mais caracteres.

**A ordem:** palavra inteira no nome > conceito no nome > palavra ou conceito em tag, categoria, descrição, id
ou componente > só prefixo (que vale mais no nome que fora dele). Um conceito no nome sobe ao nível de palavra
inteira quando o token tem três ou mais membros do grupo, e cada membro presente soma um bônus pequeno de
densidade. Os dois ajustes põem as fontes no topo de `texto` e `escrita` sem inverter "nome antes de tag".
Com o mesmo nível de casamento, ganha o token com `visualImpact`, depois o de `importance` maior, depois o geral antes do específico de um componente. Empate segue a ordem do schema.

**Na coluna:** resultados vêm por decisão, com a contagem (`Layout (12)`), até 5 por grupo e "Ver todos" (`utils/searchGroups.ts`). **Mais de 20 resultados abrem primeiro as áreas**, não a lista. A busca acha também grupos de opções e presets, não só token, e levar a um token abre a decisão e o ajuste fino. Sem resultado, ela sugere o termo mais próximo, com tolerância a um erro de digitação, e as seis decisões. Um preset é achado pelo nome, no idioma em uso, e pelos sinônimos. A linha de caminho de um resultado mostra o título traduzido da pergunta, nunca o id dela.

**Termos de ouro.** `token-search.golden.json` fixa as frases que uma pessoa usa e o token esperado entre os 3 primeiros. `token-search.validation.json` guarda frases à parte, para o dicionário não ser ajustado só ao que o teste conhece.

**Limite:** o vocabulário do catálogo é misto (português e inglês) e ralo, e o dicionário de conceitos é a única
manutenção manual da busca. O teste reprova grupo com menos de dois termos ou que não case ao menos dois tokens.

## 2.3 O caminho do painel — escolher, ajustar, aplicar

O painel conta um caminho de três passos, e a tela segue essa ordem:

1. **Escolher um tema**, na decisão Tema. A aba lista o **catálogo leve** (`themeCatalog`) na hora e carrega o `design` dos embarcados ao abrir (`useCatalogThemes`). O cartão de um tema que ainda não chegou (`PresetCardPending`), ao ser escolhido, carrega o tema e só então aplica; o tema atual permanece até lá. Escolher um tema na prévia compõe por `composeThemeDesign` ([[09-temas-e-presets]] §4.3.3): o que o tema não declara volta ao padrão (ou ao `config` do host), e o "Aplicar" grava esse estado. **A galeria não abre sobre a prévia**, que fica sempre visível; Claro/Escuro, dispositivo e tela ficam na barra dela.
   - **A decisão Tema abre pelas Personalidades** ([[09-temas-e-presets]] §5), o primeiro grupo, antes dos temas (`PersonalityCatalog`). Cada amostra mostra a Personalidade com a paleta atual do rascunho. Escolher é rascunho e não muda `colorPalette`.
   - Se o usuário ajustou à mão algum token que a Personalidade escreve, o painel pergunta antes de descartar (`usePersonalitySelection`, `personalityDraft.ts`). A referência para saber o que foi ajustado é o design aplicado, mais o tema escolhido e ainda em rascunho, mais a Personalidade já no rascunho.
   - "Usar minha marca" tem o campo opcional Personalidade: a marca dá a cor, e a Personalidade, a estrutura.
   - A busca acha a Personalidade pelo nome.
   - A troca de paleta calcula as cores das barras com o tom do rascunho (`barTonesOf`), e assim um tom declarado não se confunde com ajuste manual.
2. **Ajustar o que pesa**, nas decisões da §2.1.
3. **Aplicar**, na **barra de ações** (`Main/components/ThemeActionBar.tsx`):

| Ação | O que faz |
| --- | --- |
| **`Aplicar`** | grava o rascunho no sistema. Ao lado, um texto auxiliar diz quantas alterações o rascunho tem em relação ao sistema ("N alterações"); o botão fica desabilitado sem alteração. É a **única** porta de gravação (§4) |
| **Descartar** | volta o rascunho ao sistema. Existe também **por pilar**, no cabeçalho de cada pilar ("Descartar alterações deste pilar") |
| **Exportar** | secundário: baixa o JSON (§5); o rótulo não muda depois de exportar |
| **Desfazer última aplicação** | só aparece quando há uma aplicação a desfazer (§4.2) |

Só `Aplicar` é ação primária. `Aplicar` e `Descartar` ficam visíveis; Salvar tema, Novo tema, Exportar JSON, Apagar tema e Desfazer última aplicação ficam no menu de mais ações
(`Main/components/ThemeMoreActionsMenu.tsx`). O texto "N alterações" abre a lista de token, valor aplicado e valor do rascunho (`ThemePendingChanges.tsx`), e abrir a lista fecha o menu, e vice-versa.

Não há aplicar por pilar nem por componente: aplicar é sempre o rascunho inteiro. O painel montado
pelo `SarakCustomizationPanel` se intitula **"Personalizar o tema"**; dentro dele, o cabeçalho da barra lateral
diz **"Design"**. Sem selos.

**O menu "Avançado"** (`Main/components/ThemeAdvancedMenu.tsx`) é o único botão do cabeçalho além da busca. Ele reúne as telas de quem já conhece o motor — **Tabela de tokens** (a planilha do `MasterControlPanel`),
**Busca por pilar** (o Command Center) e **Temas e JSON** (`TemplatesTab`) — e **"Voltar ao modo normal"**. A tela
dos pilares é o padrão e não tem botão. Teclado: Enter/Espaço abre e foca a primeira entrada; setas (com volta
circular), Home e End navegam; Esc fecha e devolve o foco ao botão; clicar fora fecha.

## 2.4 Paletas no painel

A seção de paletas (`Main/components/PaletteSection.tsx`, em `ThemeSidebarContent`) oferece as paletas prontas numa lista de uma linha por paleta, com faixa de cores e nome pelo catálogo de textos, filtros por tipo e a criação a partir de uma cor-base e de um tipo, com secundária e acento
opcionais (`PaletteCreator`).

- **Escolher é rascunho.** A escolha grava `colorPalette` e as cores calculadas para o modo do rascunho; o "Aplicar" grava pelo fluxo de
  sempre. Não há porta nem entidade própria: a paleta vai no tema salvo, como o valor de `colorPalette` ([[09-temas-e-presets]] §4.3.4).
- **Paleta espia como as outras opções** (§6.4). Passar o mouse ou focar uma paleta compõe na prévia as cores dela
  (`buildPaletteDraftPatch`, com os tons de barra do rascunho), sem gravar. No teclado, as setas movem o foco, e o foco espia;
  só Enter ou clique escolhem (`PaletteGallery.tsx`, `PaletteSection.tsx`).
- **O ajuste granular vence a paleta.** Mudar uma cor depois de escolher a paleta grava um valor explícito no `design`.
- **Trocar de paleta com cor ajustada à mão pergunta.** Só o botão explícito de descartar perde os ajustes; cancelar ou fechar o diálogo
  (Esc, clique fora) mantém o ajuste sobre a paleta nova (`usePaletteSelection`).
- **"Manter minha paleta"** é um interruptor junto da galeria (`PaletteSection.tsx`), com a descrição do estado. Ligar aplica a paleta
  vigente por cima das cores que o tema declara; desligar devolve ao rascunho a paleta e as cores do tema atual e preserva o resto
  (`utils/keepPalette.ts`). A regra está em [[09-temas-e-presets]] §4.3.4.
- **A galeria é em grupos recolhíveis**: "Minhas paletas" e um grupo por tipo. Só o grupo da paleta escolhida abre, e "Minhas paletas"
  abre quando a lista cresce (`useOpenGalleryGroups.ts`). O filtro por tipo mostra "Minhas paletas" só em "Todas".
- **Paleta criada se salva com nome.** O criador tem "Nome da paleta" e "Salvar paleta" (`useSavedPalettes.ts`). Nome repetido pergunta
  antes de substituir, e apagar pede confirmação. Salvar é rascunho e não escolhe a paleta; o "Aplicar" grava a lista no design do
  sistema ([[09-temas-e-presets]] §4.6). A paleta salva se escolhe e se espia como as outras. A lista (`savedPalettes`) não aparece
  como campo na busca nem no ajuste fino.
- **"Usar minha marca" oferece as paletas salvas** no campo "Paleta da marca", quando há alguma (`BrandShortcut.tsx`, `useBrandForm.ts`).

# 3. Controles polimórficos

`TokenControl` (`Main/components/TokenControl.tsx`) e `DynamicTokenControl`
(`components/DynamicTokenControl.tsx`) escolhem o input **pelo `token.type`** — não por `if` por nome de
token:

| `token.type` | Controle | Onde |
| --- | --- | --- |
| `color` | `ColorControl` — o seletor edita o canal opaco e **preserva o alfa**, há controle de opacidade, e o campo de texto aceita `var()`/`color-mix()`; só grava o que `isValidColor` aceita | `components/controls/ColorControl.tsx` |
| `slider` / `number` | slider com a faixa de `tokenBounds` e o sufixo da `unit` declarada (sem unidade, o número vem cru); token responsivo edita `mob`/`tab`/`desk` e grava sempre o objeto inteiro (`ResponsiveSliderControl`) | `components/controls/BasicControls.tsx` |
| `select` / `font` | select populado por `constraints.options`; grava o `value` da opção (o `id` e o `value` coincidem) | idem |
| `text` / `string` | campo de texto (sombra, curva) | idem |
| `boolean` | switch | idem |
| `image` / `file` | `MediaUploaderControl` | `components/controls/MediaUploaderControl.tsx` |
| estruturais de layout | `LayoutControls` | `components/controls/LayoutControls.tsx` |

Mais `HelpTooltip`, que exibe a `description` do token — a mesma string que documenta o token no catálogo —
**em todo ramo de controle dos dois despachantes** (o `descricaoEmTodoRamo.test.tsx` cobra). O campo numérico livre
só grava número finito, dentro de `[min, max]`; o seletor de cor resolve `var()`/`color-mix()` pelo navegador para
mostrar a amostra e o alfa, sem gravar nada até o usuário mexer; mexer só no alfa de um valor `var()`/`color-mix()`
grava `color-mix(in srgb, <valor> N%, transparent)`, sem perder o vínculo com a variável.
**A descrição escrita no schema é a ajuda que o autor de tema lê.** Isso é o que torna as descrições dos
tokens uma obrigação de produto, não um comentário.

**Mestre e exceção.** Ao lado do raio mestre e de cada canto, `ExceptionRelation` mostra a relação (quantos cantos
têm valor próprio; "segue o mestre"; "valor próprio") e devolve o canto, ou todos, ao mestre.

**Todo tipo tem controle**, nos dois despachantes; o `panel-contract:check` cobra ([[00-regras-e-invariantes]] R44).
O painel e os mocks seguem o modo do tema que mostram: nenhum branco ou preto fixo em `src/features/` (R43).

**Selo de dispositivo.** Todo controle de token com `isResponsive` mostra, acima do controle, para qual
dispositivo o valor editado vale — **"Só no Mobile"**, **"Só no Tablet"** ou **"Desktop"**, conforme o dispositivo
da barra do preview (§6.2) —, com o `title` "Este valor vale só para <dispositivo>. Troque o dispositivo na barra
do preview para editar os outros." Token não responsivo não mostra selo.

**Rótulos legíveis.** Rótulo de controle fica em caixa normal, sem espaçamento largo, e nunca abaixo de 12 px — o
tamanho vem de `--sarak-type-scale-caption` (padrão 12 no schema).

# 4. Draft × persistido

| Estado | Onde vive | Efeito |
| --- | --- | --- |
| **Rascunho** (`draft`) | `useDesignDraft` (`hooks/useDesignDraft.ts`) | reflete **instantaneamente** no preview escopado **e na tela real de quem edita**, enquanto o painel está aberto; não grava nada nem chega a outra aba |
| **Sistema** | `design` do Provider | o que a aplicação inteira usa |
| **Persistido** | `localStorage` (via `persistDesign`) | sobrevive ao reload |

Duas decisões de projeto do rascunho, ambas com o motivo no código:

- **O rascunho começa `null`** (`useDesignDraft.ts`, o estado `draftState`) — "para seguir o sistema sem criar
  uma cópia dessincronizada no mount". Sem rascunho, `draft` **resolve para o design do sistema** (o `useMemo`
  de `draft`, logo abaixo). Não
  existe estado intermediário nascendo defasado.
- **Comparação profunda antes de marcar mudança** (`areValuesEqual`, `:11-17`) — evita marcar rascunho
  sujo por diferença de identidade de objeto em valor estruturalmente igual (o caso dos valores
  responsivos `{desk,tab,mob}`).

**A gravação é explícita, e não tem exceção.** Um token ou um tema inteiro: **toda escolha no painel é
rascunho**. `handleApplyFullTheme` (`Main/ThemeCustomizationTab.tsx`) alimenta **só** o rascunho, e é o caminho
de **toda** porta que escolhe tema — a Galeria de estilos e a tela **Temas e JSON** (`TemplatesTab`), que não
chama `applyFullConfig`, `persistDesign` nem `setResolvedThemeId`. O design da aplicação e o armazenamento mudam
por uma porta única — o **`Aplicar`** da barra de ações (§2.3), em `handleApplyToSystem`
(`hooks/useDesignDraft.ts`), que é o mesmo caminho de qualquer outro token e só age com o rascunho sujo
(`isDirty`).

**O tema escolhido acompanha o rascunho.** Pré-visualizar um tema do catálogo guarda o id dele junto do
rascunho (`pendingThemeId`, `useDesignDraft.ts`); o tema só é **anunciado** como o tema no ar
(`setResolvedThemeId`) dentro de `handleApplyToSystem`. Pré-visualizar não anuncia nada.

**A tela real mostra o rascunho, sem gravar.** Enquanto o painel está aberto (`isDrafting`) e há rascunho,
o design efetivo do Provider é o **sistema com o rascunho por cima**, e as preferências do usuário
continuam por cima de tudo ([[016-preferencias-do-usuario-separadas-do-tema]]):
`SarakUIProvider.tsx` monta `liveDesign` e passa `overlayPreferences` sobre ele. Esse design efetivo chega
a `DesignInjector`, `SovereignThemeInjector` e ao fundo global (`SarakBackgroundRenderer`). As regras,
cada uma com teste de integração pelo Provider real:

- **Nada é gravado:** nem `localStorage`, nem `persistence.onSave`, nem `onThemeChange`, nem depois do
  prazo da gravação automática (`useDesignDraft.persistenceIntegration.test.tsx`). A sobreposição é só de
  leitura, recalculada a cada render.
- **Nada é espalhado:** a sincronização entre abas nasce só de uma escrita no `localStorage` (evento
  `storage`, `useDesignStorageSync.ts`), e essa escrita não acontece.
- **"Aplicar" é a única porta de gravação**, pelo caminho descrito acima.
- **Descartar volta exato:** sem rascunho (limpo, ou o painel fechado, que zera `isDrafting` e o rascunho
  ao desmontar), o design efetivo volta a ser exatamente o sistema com as preferências.

Mostrar o rascunho na tela real é seguro porque o modo claro/escuro é sobreposto a cada render **a partir
do tema salvo** e nunca gravado nele (`overlayPreferences.ts`): experimentar não acumula conversão de
paleta.

**Sair com o rascunho sujo pergunta antes.** "Sujo" é o mesmo estado que habilita o `Aplicar`: rascunho com alteração ou marca
pendente (`ThemeCustomizationTab.tsx`). O guarda é `Main/hooks/useLeavePanelGuard.ts`, e a pergunta é
`Main/components/LeavePanelDialog.tsx`, um `SarakModal` próprio com três escolhas: **Ficar no painel**, **Descartar e sair** e
**Aplicar e sair**. Elas ficam lado a lado e com a mesma largura, e empilham numa coluna quando não cabem. Os textos estão no catálogo
(`panelLeave*`, `core/i18n/catalogEntries.panel.ts`), nos seis idiomas.

| Saída | Como o painel pergunta |
| --- | --- |
| **Rota do cromo da lib** (lateral, topo, barra inferior, busca, drawer) | O `SarakUIProvider` monta `SarakNavigationGuardProvider` (`core/Provider/navigationGuard.tsx`). O painel registra a pergunta **só com o rascunho sujo**, e o `SarakAppChrome` passa o `onNavigate` do host por `useGuardedNavigate` num ponto só, que alcança todas as portas do cromo. O host não liga nada. Com guarda registrado, o `onNavigate` do host só roda depois da resposta "sair". Sem guarda, roda na mesma chamada. Com mais de um guarda, vale o último registrado |
| **Fechar ou recarregar a aba** | aviso do navegador (`beforeunload`), só com o rascunho sujo |
| **Navegação fora do cromo** (voltar do navegador, link no conteúdo) | a prop opcional `onUnsavedChangesControl` do `SarakCustomizationPanel` entrega `confirmLeave()`, que o host liga ao bloqueio do roteador dele. A promessa resolve `true` (sair) ou `false` (ficar). Os tipos `SarakCustomizationPanelProps` e `SarakPanelLeaveControl` saem no barril |

- **Sem rascunho sujo, nada pergunta:** `confirmLeave()` resolve `true` na hora, e nenhum guarda fica registrado.
- **Esc e o X valem "ficar"**, nunca "descartar". Desmontar o painel com a pergunta aberta também responde "ficar".
- **"Aplicar e sair"** passa pelo `Aplicar` de sempre, a porta única de gravação. **"Descartar e sair"** passa pelo Descartar.

**A restrição que qualquer alteração neste caminho tem de respeitar:** o preview repinta porque lê o
**rascunho**, nunca o sistema. Quem mexer no handler mantém o rascunho alimentado — sem isso, o painel
mostra o tema anterior e a escolha parece não ter efeito.

O mecanismo de drafting no motor está em [[02-design-engine]].

## 4.1 O modelo de performance do rascunho

Arrastar um slider dispara render a cada quadro. Três decisões mantêm isso barato, e as três são
estruturais — não são otimização pontual:

| Decisão | O que evita |
| --- | --- |
| **Uma única instância de `useDesignDraft`** no painel | duas instâncias significam dois estados de rascunho divergindo, e o dobro de render por interação |
| **`getAllDesignTokens()` memoizado** | recomputar o dicionário **inteiro** de tokens a cada quadro do arraste |
| **Debounce no commit do slider** | gravar/propagar em cada quadro, em vez de no valor final |

**Escolher uma opção responde em menos de 250 ms.** O teto vale para a mediana de 15 escolhas, depois de uma de aquecimento, com o
React de produção a 1440×900, em `browser-tests/escolha-no-painel.spec.ts`. O tempo é medido do clique ao quadro seguinte ao
`Aplicar` habilitado. O tempo varia com a máquina. O que segura a regressão são as contagens do mesmo spec, que não variam:

- uma escolha que não muda valor responsivo **não insere, remove nem reescreve `<style>`**;
- uma troca de tema **não remonta escopo** de prévia, e **nenhuma amostra fora da área visível reescreve** o próprio estilo.

As decisões de código que sustentam isso:

| Decisão | O que evita |
| --- | --- |
| **A amostra fora da área visível fica congelada** no rascunho visto por último (`Canvas/hooks/useValueWhileVisible.ts`, usado em `SampleScope`, `PresetGroupCatalog` e `PersonalityCatalog`). Na área visível, o rascunho chega adiado (`useDeferredValue`) | cada amostra do painel recalcular e reescrever o estilo a cada escolha. A prévia ao vivo e o `Aplicar` respondem no render urgente, e as amostras visíveis se refazem logo depois, num render que o React pode interromper |
| **As cores de barra das amostras vêm de cache** (`barToneColors`, `PresetGroupCatalog.tsx`), com chave por tudo o que a paleta lê: valor, modo, tons, estilo de fundo das barras e cada papel de cor. Da paleta calculada, entram na amostra só as chaves da lateral, do topo e do item de navegação (`sidebar*`, `topbar*`, `nav*`) | cada cartão de barra recalcular a paleta inteira, com a correção de contraste, a cada escolha |
| **O mesmo par (contexto, override) devolve o mesmo objeto** em `mergeUIContextValue` (`WeakMap`) | cada consumidor de `useSarakUI()` copiar o design inteiro a cada render |

**A troca de tema não tem transição.** Quando centenas de variáveis mudam de uma vez (`THEME_SWITCH_MIN_CHANGED_VARIABLES`), a marca `data-sarak-theme-switching` entra antes da escrita e sai depois da
pintura, e `_motion.css` desliga as transições enquanto ela existe; hover, foco e abertura seguem animando. Sem isso, cada elemento recalcula estilo a cada quadro, e o recálculo chega a 68% do custo da troca. Ajuste de um token
não aciona a marca. A prévia e a raiz mudam no mesmo commit (`useDesignDraftSync`, em efeito de layout). O número de recálculos tem teto em `browser-tests/troca-de-tema.spec.ts`.

**Mover o ponteiro não escreve variável.** A lib só escreve `--sarak-light-x`/`--sarak-light-y` com `shadowOrientation: dynamic`: uma variável no escopo invalida o estilo da árvore inteira, e quem não usa a luz não paga por ela.

> ⚠️ **Aninhar `DesignScope` duplica o custo.** Dois `DesignScope` na mesma árvore recomputam e reinjetam
> o CSS duas vezes por mudança. É o padrão a não repetir — um escopo por árvore de preview.

## 4.2 Desfazer a última aplicação

Depois de um **`Aplicar`**, a barra de ações oferece **"Desfazer última aplicação"**, no menu de mais ações
(`Main/components/ThemeActionBar.tsx`), servido por `useLastAppliedSnapshot.ts`:

- **O que é guardado:** imediatamente antes de cada "Aplicar", o design do sistema **e** o tema anunciado
  (`resolvedThemeId`) daquele instante.
- **O que o desfazer faz:** devolve o design ao sistema (`applyFullConfigRaw`), anuncia de volta o tema
  guardado e grava pelo `persistDesign` logo em seguida, na mesma chamada: `setResolvedThemeId` atualiza na
  hora a referência que `persistDesign` lê (`useLastAppliedSnapshot.ts`, JSDoc do topo). Por isso toda gravação que ele dispara, inclusive a porta `persistence.onSave`, recebe o par restaurado:
  o design e o tema de antes. Ele também limpa o rascunho do painel, senão o rascunho com o valor desfeito
  continuaria por cima da tela real (§4).
- **Um nível só:** usado, o controle some; uma nova aplicação substitui o que está guardado; recarregar a
  página descarta (estado local, nunca persistido). Não há histórico nem refazer.
- **Alcance:** toda aplicação, porque só existe uma — o `Aplicar` do rascunho inteiro (§2.3).

# 5. Exportar JSON — o substituto do "salvar no banco"

`Main/utils/exportTheme.ts`:

- `buildThemeExportPayload(design, name)` (`:40-46`) devolve `{ id, name, design }` — **o mesmo shape dos
  temas embutidos**.
- `resolveCompleteDesign` (`:18-21`) parte de `getDefaultDesignState()` e sobrepõe: **exporta o conjunto
  COMPLETO de tokens, nunca o subconjunto do rascunho.**
- `slugifyThemeId` (`:24-33`) → id kebab-case estável; `downloadThemeJson` (`:49-63`) → download no browser.

O caminho ponta a ponta, que é o critério de aceite desta spec:

```
painel  →  Exportar  →  <nome>.json  →  colar num arquivo .ts/.json do repo do consumidor
        →  passar em customThemes do SarakUIProvider  →  selecionar por activeThemeId/initialTheme
```

> ### ⚠️ Isto SUBSTITUIU o "salvar tema no banco" — [[003-remocao-backend-proprio]]
>
> Não existe endpoint de tema, não existe tabela `custom_themes`, não existe botão que faz POST. **"Salvar
> um tema" É exportar este JSON.** Qualquer menção a persistência server-side em documento antigo descreve
> código removido.
>
> O que sobrou como porta para o consumidor que **quer** um backend: `persistence.onSave`/`onLoad` e
> `branding.onChange` — callbacks **dele**, chamados pela lib, apontando para o servidor **dele**
> ([[10-seguranca-e-acessibilidade]] §3.5).

## 5.1 Exportar × Salvar — duas ações, dois públicos

O modal de salvamento expõe **duas** ações que parecem a mesma e não são:

| Ação | Para quem | Onde o tema vai parar | Precisa de deploy? |
| --- | --- | --- | --- |
| **Exportar** | desenvolvedor | JSON baixado, colado no repo do consumidor, passado em `customThemes` | **sim** |
| **Salvar** | usuário final | armazenamento do importador, via `options.theme.onSave` | **não** |

**Salvar só aparece quando a porta está configurada.** Sem `onSave`, a ação não é renderizada — não há
botão morto nem erro; o painel degrada para o ciclo de exportar. Contrato completo do dado em
[[09-temas-e-presets]] §4.6.

# 6. O Gêmeo Digital (preview)

`src/features/DesignEngine/Canvas/`.

**A prévia mostra o modo que o usuário vê.** A prévia e os cartões da galeria recebem o rascunho com a preferência de modo aplicada
por cima ([[09-temas-e-presets]] §4.7), pela contraparte do tema do rascunho (o escolhido na galeria; sem ele, o resolvido); o que
se salva continua sendo o rascunho sem preferência. O botão de modo dentro da prévia lê o modo efetivo e alterna nos dois sentidos.
Trocar o token `mode` do rascunho parte do tema do rascunho e só avisa quando uma customização da contraparte é de fato descartada.

## 6.1 `DesignScope` — a barreira de CSS

`PreviewCanvas` renderiza o rascunho dentro de `DesignScope`
(`src/core/Design/components/DesignScope.tsx`): ele gera uma **classe única** por instância
(`sarak-scope-<id>`, derivada de `useId()` com os dois-pontos removidos porque quebram seletor CSS,
`:30-32`), injeta as variáveis do rascunho **só naquela subárvore** (`:44-48`), e publica um
`DesignOverrideContext` para que componentes que chamam `useSarakUI()` dentro do escopo leiam **o rascunho**
e não o design do sistema (`:40`).

**Nada vaza para o host:** as variáveis vão no `style` do próprio nó, e o CSS responsivo gerado vai num
`<style>` **dentro** do escopo (`:52-55`) — mirando `.sarak-scope-<id>`.

## 6.2 Simulação de viewport

Duas metades, e as duas são necessárias:

| Metade | O que faz | Onde |
| --- | --- | --- |
| **Dispositivo lógico** | `SarakDeviceProvider overrideDevice={previewDevice}` — faz `useSarakDevice()` dentro do preview devolver o dispositivo simulado, então o reflow real acontece (cromo colapsa, tabela vira cards) | `Canvas/components/PreviewSystemRenderer.tsx` |
| **Moldura física** | largura-alvo + moldura de aparelho: `desktop: 100%`, `tablet: 768px`, `smartphone: 375px`, com bordas/raio simulando o device | `Canvas/hooks/useDeviceStyles.ts` |

**A largura que a prévia desenha.** No desktop, a moldura ocupa o espaço do painel, mas o sistema é desenhado na largura de uma janela
real, `PREVIEW_DESKTOP_SYSTEM_WIDTH = 1920` px (`PreviewSystemRenderer.tsx`), e reduzido para caber: escala = largura medida ÷ 1.920,
entre 0,2 e 1 (`useContainerScale.ts`, regra por dispositivo). Assim, as três larguras de conteúdo (1.000, 1.200 e 1.440 px) aparecem
distintas na prévia, como no sistema real. Tablet e celular desenham na largura do aparelho, em escala 1.

**Nada na prévia sai do painel.** Os itens da navegação de exemplo apontam para `#<tela>`. A camada da prévia cancela o que o item não
trata: Ctrl/Cmd/Shift/Alt+clique, botão do meio, menu de contexto e âncora sem tratador (`keepPreviewLinksInside`). O botão de inspeção
fica no canto da moldura, fora do aparelho. A prévia não tem marca d'água nem marca da lib: sem `systemName` no design, a barra
mostra o nome neutro "Meu sistema".

**Limite declarado:** o preview prova o **reflow**, não a **detecção** ([[07-responsividade-e-multidispositivo]] §7).

**A barra do preview** (`Canvas/components/PreviewToolbar.tsx`) é onde moram o **dispositivo** (Desktop, Tablet,
Mobile) e o interruptor **"Empilhar previews"** — o cabeçalho da barra lateral não tem nenhum dos dois. Trocar o
dispositivo troca o preview e o valor responsivo que se edita (§3, selo de dispositivo).

**Galeria e empilhado.** Com a Galeria de estilos aberta (§2.3), ela é um segundo quadro **ao lado** do preview do
rascunho sempre que os dois cabem com a largura mínima legível de cada quadro: o limiar é por container query, derivado de
`2 × PREVIEW_MIN_FRAME_WIDTH (250 px) + vão (24 px) = 524 px` (`Canvas/panelResponsive.presets.ts`); abaixo dele, empilham sozinhos.
Com "Empilhar previews" ligado, ficam um **abaixo** do outro e **cada quadro tem a altura da área de prévia**: a área rola, e cada
quadro rola o próprio conteúdo. Nunca uma unidade de janela (`vh`) nem `resize` — consequência direta da §6.2.1. Tablet e celular
mantêm a proporção do aparelho, calculada da largura simulada sobre `deviceTabletHeight`/`devicePhoneHeight`. Com a galeria fechada, o
interruptor fica inativo (`aria-disabled`), com `title` dizendo que é preciso abrir a galeria.

### 6.2.1 O painel se adapta ao CONTAINER, não à janela

O painel é embutido pelo consumidor em largura arbitrária — dentro de uma aba, de um drawer, de um split.
Por isso o layout dele **não** consulta o viewport: cada região do painel estabelece o próprio
`@container` e as classes internas medem por container query (`@min-[Npx]:`), reagindo à largura
**disponível**.

É a camada 3 de [[07-responsividade-e-multidispositivo]] §6 aplicada ao próprio painel, e vale para o
dual-view (controles + preview lado a lado): abaixo do limiar as duas colunas **empilham** em vez de se
espremerem, e nenhum texto é cortado por falta de largura. A alternativa — media query de viewport —
enxergaria a janela e erraria sempre que o painel não a ocupasse inteira.

As quatro regras de operação dessa camada (container em ancestral, classe literal, comentário que não
forma candidato, e default que não conserta opção) valem aqui integralmente — ver
[[07-responsividade-e-multidispositivo]] §6.1.

### 6.2.2 O preview desenha o cromo real

`PreviewSystemRenderer` monta o **`SarakAppChrome`** — o mesmo que o consumidor monta — com a navegação de exemplo derivada das telas do preview, e a seleção de um item troca a tela ativa (`onNavigate`). Isso vale nas três geometrias de dispositivo. O administrador configura, no painel, **a barra que o usuário final vai ver**: topbar/sidebar, os oito widgets e o estado desabilitado do que depende do consumidor.

**Os popovers do cromo abrem dentro da moldura.** O menu ⚙ (`ShellPreferencesMenu`) e o balão da navegação (`ShellNavFlyout`) se
desenham num portal, e o destino dele vem de `useSarakPortalFrame()` (`core/Provider/portalFrame.tsx`). Sem moldura, o destino é o
`body` e as coordenadas valem como vêm: nada muda para o importador. A prévia entrega um nó dentro da camada reduzida e converte as
coordenadas da janela para as da camada (subtrai a origem e divide pela escala). Assim, os dois abrem dentro da moldura, na escala da
prévia. `SarakPopover`, `SarakContextMenu`, `SarakTooltip`, modal e toast continuam no `body`.

## 6.3 Mocks modulares

`Canvas/Mocks/` — telas falsas que exercitam os componentes reais: `DashboardMock`, `TableMock`,
`ChartsMock`, `ChatMock`, `MockForms`, `MockDocuments`, `AuthMock`, `LogsMock`, `MatrixMock`,
`SettingsMock`, `TextMock`, `TypographyMock`, `ComponentsMock` e `MoreScreensMock` (a grade de "Mais telas",
§6.6). Os rótulos humanos das telas moram em `Canvas/previewScreens.ts`.

`DashboardMock` é montado de **sub-peças** (`Mocks/Dashboard/`: `DashboardHeader`,
`DashboardMetricsGrid`, `DashboardSidePanel`, `DashboardShared`) — e isso não é higiene de arquivo: é o que
faz o preview **simular a paridade atômica de verdade**, com composição em vários níveis, em vez de um
bloco monolítico que só testaria o token de superfície. A grade de cartões do Painel mede a própria largura (`@container`), e não a
janela: colunas por `@min-[448px]`/`@min-[768px]`, e a etiqueta de rascunho dos cartões só aparece em contêiner largo.

**Cada grupo de opções tem onde aparecer.** Os mocks desenham, com o componente real da lib, o que cada grupo de preset muda:

| Tela | O que desenha |
| --- | --- |
| **Componentes** (`ComponentsMock`) | `SarakSwitch`, `SarakBadge`, `SarakAlert` e `SarakEmptyState` reais. A seção **Elevação** tem três blocos com `box-shadow: var(--dynamic-shadow)`, sobre uma faixa mais clara que o fundo. A lista rolável refaz as variáveis `--scroll-*` a partir das do escopo. O diálogo e os avisos de sistema são réplicas com as mesmas variáveis (o diálogo lê `--sarak-modal-border-radius`): os reais abrem em portal no `body`, fora da moldura. Cada seção leva `data-peek-group` com o grupo que ela mostra |
| **Tabela** (`TableMock`) | duas `SarakDataTable` reais, com `SarakBadge` no status. A `SarakDataTable` lê listras (`tableZebraStriping`), raio (`tableBorderRadius`, só com o token no design) e respiro (`--sarak-table-padding`, que o `tableCellPadding` escreve) |
| **Gráficos** (`ChartsMock`) | os oito tipos de `chartType` (linha, área, barras, pizza, radar, dispersão, mapa de calor e medidor), cada um num `SarakChartEngine` real com o estilo do rascunho. O motor só carrega quando a tela abre. Cada tipo ocupa ao menos 60% da altura do quadro, no da tela e no de 600×300, nos dois modos (`graficos-ocupam-o-quadro.spec.ts`) |

**O gráfico usa o quadro que recebe**, na prévia e em todo importador. O `SarakChartEngine` não põe respiro interno, e o `grid`
reserva em cima e embaixo o dobro do tamanho da fonte e, à esquerda, a margem do rótulo do eixo (`useEChartsTheme.ts`). O eixo de valor
parte do zero. A pizza vai a 95% do raio, o medidor a 90% e o radar a 70%, com o máximo dos eixos no maior valor dos dados mais 5% e
os rótulos inteiros dentro do quadro (`builders/`).

A `SarakTableView` lê o mesmo respiro horizontal (`--sarak-table-padding`, `useTableLayoutStyles.ts`). A densidade (`tableDensity`)
fica com o respiro vertical e o corpo do texto.

**A tela de cada grupo** é declarada em `config/design-decisions.json`, no `groupScreens` da decisão. Hoje são tabelas → `tabela`,
gráficos → `graficos`, e diálogo, aviso, interruptor, rolagem, selo, estado vazio, sombra e direção da sombra → `components`.
`peekScreenOf(group)` (`utils/decisions.ts`) a devolve, e grupo sem entrada não troca de tela. É a tela que a espiada usa (§6.4, §6.6).

## 6.4 Catálogos visuais

`Canvas/components/`: `AtmosphereCatalog`, `CardsCatalog`, `PresetsCatalog`, `TypographyCatalog`,
`ButtonsCatalog`, `InputsCatalog`, mais `ButtonPresetPreview`, `InputPresetPreview` e `PresetCard`. O
`PresetsCatalog` é a **Galeria de estilos** (§2.3): cada aba dele é um destes catálogos.

**Cada decisão mostra os grupos do registro de presets** ([[09-temas-e-presets]] §5), listados por decisão em `config/design-decisions.json`. A tela dos grupos é `PresetGroupCatalog`, e cada amostra vem de `PresetSamples`. `CuratedGrid` mostra de 1 a 8 opções destacadas e "Ver todas (N)"; ao abrir, as opções aparecem por família ou por categoria. Uma opção só fica entre as destacadas se a amostra dela se distingue das outras do grupo, nos dois modos. O spec de navegador dos presets (`presets-do-painel.spec.ts`) mede isso por diferença de pixels: 2% entre duas destacadas, 5% nos grupos de card e no de gráficos, e, na textura do card, 2% contra o card sem textura. Nos grupos cuja diferença só existe em animação ou tem contraste baixo (janela, rolagem, troca de página, movimento, sombra, direção da sombra, moldura e degradê), a amostra é um desenho estático do que a opção faz (`PresetSamplesStatic.tsx`, `PresetSamplesDepth.tsx`). Assim, todas as opções ficam à vista. A amostra parte do rascunho como a prévia o mostra (`sampleDraft`), e por isso segue o modo da prévia.

**A amostra é o componente real, como a aplicação o desenha.** Ela é montada com a opção por cima do rascunho, dentro de um escopo próprio, e só quando entra na área visível (`OptionTile`, `SampleScope`, `LazyWhenVisible`):
- **Grade única.** Toda decisão usa a mesma grade de colunas automáticas (`CATALOG_GRID`, mínimo de 8,5 rem; `panelResponsive.presets.ts`); amostra comprida, como a Topbar, usa `WIDE_SAMPLE_GRID`. A amostra desenha o componente num quadro de referência e o reduz à largura da opção (`OptionSampleFrame.tsx`). O nome fica embaixo, sem caixa alta, e a descrição vai para o leitor de tela e o `title`.
- **Personalidade** é um quadrado pequeno com o nome (`PERSONALITY_GRID`, 5,5 rem), sem texto dentro do desenho. **Fontes** ficam na mesma grade.
- **Miniatura de tema** é a tela "Painel" inteira da prévia (`MockDashboard`) com o tema aplicado, num quadro de desktop (`THEME_FRAME`, 1024×576, `SarakDeviceProvider overrideDevice="desktop"`) para mostrar a Sidebar ou a Topbar que o tema declara. Fica reduzida, sem animação (`MINIATURE_STILL_CSS`) e num escopo enxuto (`PresetCard.tsx`). O nome do tema é proporcional, e o selo de navegação fica fora do nome acessível.
- **Cards, Material, Cantos e Densidade** usam o card real da tela "Painel" (`SampleTitleCard`, o "CPU Cluster"), sobre o rascunho: a amostra segue o tema atual e o modo da prévia.
- **Textura do card** é o card real com a textura, pelo mesmo mecanismo da aplicação (`data-sx-card-texture-type` e a opacidade do preset). **Textura do fundo** e **Atmosfera** ocupam a amostra inteira, sem card por cima e sem botão sobre a amostra; a textura do fundo tem a barra de opacidade (`AtmosphereCatalog.tsx`). As duas texturas são grupos vizinhos da decisão Forma, com o alvo no título ("Textura do card", "Textura do fundo"), e nenhuma aba se chama só "Texturas".
- **Sombra e Direção da sombra** são um painel liso sobre uma faixa de contraste, com a mesma conta da sombra em camadas; na direção, um ponto marca a luz e a opção que segue o ponteiro tem a órbita tracejada. **Moldura** é o canto do card real ampliado. **Degradê** pinta a área inteira com a receita do fundo.
- **Gráfico, tabela, selo com progresso e estado vazio** são o `SarakChartEngine`, a `SarakDataTable`, o `SarakBadge` com o `SarakProgress` e o `SarakEmptyState` reais. A amostra do estado vazio leva um guia por cima: ele redesenha, em traço cheio, as medidas que a opção muda (os dois círculos, o anel e a largura da legenda), que no componente têm opacidade baixa demais para se distinguir na miniatura. Eles ficam num módulo à parte (`PresetSamplesReal.tsx`, carregado por `React.lazy`), para não pesar no boot do importador. A amostra de gráfico é um único gráfico de área, igual em todas as opções, na paleta de gráfico do rascunho, a mesma da tela "Gráficos".
- **Diálogo e aviso** são desenhos (`ModalWindowSample`, `NoticeSample`): os reais abrem em portal no `body`, e a espiada mostra o efeito real na prévia grande. **Rolagem, movimento e troca de página** são desenhos estáticos: a barra ampliada, a curva e o quadro da transição.

**O custo de abrir cada grupo é medido** (`browser-tests/amostras-reais-custo.spec.ts`, mediana das rodadas, contra uma cópia congelada das amostras de antes). O teto é de 2× para cada grupo e de 2,5× para a decisão Tema, decisão do dono.

**Espiada.** Passar o mouse ou focar uma opção compõe o efeito na prévia grande, sem gravar nada: não passa pelo rascunho, não conta como alteração e reverte ao sair. Não existe em toque, onde o toque já escolhe (`usePeekPreview`, `peek.ts`). A espiada começa depois de `PEEK_DELAY_MS` (150 ms) e vale para toda opção destacada: cartões de grupo, Personalidades, temas, inclusive o cartão de tema que ainda não carregou, e paletas (§2.4).

- **A espiada leva a prévia à tela do grupo** (`groupScreens`, §6.3) enquanto dura, e ela volta à tela anterior ao sair. Escolher a opção espiada mantém a tela (`keepPeekScreen`, `usePeekPreview.ts`).
- **A barra que a opção altera aparece.** Espiar um preset de Topbar com a navegação lateral, ou de Sidebar com a navegação no topo, põe na prévia o `navigationStyle` da barra do preset, só durante a espiada (`peekFor`, `PresetsCatalog.tsx`).
- **O tema ainda não carregado espia** (`PresetCardPending`). A espiada carrega o tema e mostra a prévia quando ele chega. Sair antes de ele chegar não aplica nada: `getTokens` aceita promessa, e a promessa que volta depois da saída é descartada.
- **Rolar a lista não espia.** O `mouseenter` disparado durante a rolagem não espia (`SCROLL_QUIET_MS`, 200 ms depois do último `scroll`), nem o `mouseenter` sem o ponteiro ter saído do lugar. Mexer o mouse sobre a opção espia (`onMouseMove`). O `mousemove` sintético do fim da rolagem não conta. Rolar o painel não muda o que a prévia mostra.
- **O componente real que lê o design em JS** (`useSarakUI()`) vê a espiada: o contexto da prévia leva o rascunho com a espiada por cima.

**Toda opção destacada muda a prévia.** Um spec de navegador espia cada opção destacada de cada decisão, na tela do grupo, e mede a
diferença de pixels contra uma linha de base tirada logo antes, normalizada pela escala da prévia. As únicas exceções ficam listadas no
spec, cada uma com a prova do motivo:

| Exceção | Por que não muda pixel |
| --- | --- |
| **já aplicada** | o design já tem o que a opção escreve. A prova é escolher outra opção e espiar de novo, ou ler que todos os tokens dela já valem |
| **só em animação** | a opção só escreve tokens de movimento ou de transição de página, e a foto é tirada sem animação |
| **só no outro modo** | o efeito só aparece no claro, ou só no escuro. O spec espia de novo no outro modo |
| **estilo computado** | o efeito existe, mas é fino demais para o limiar de pixel na escala da prévia (a rolagem "Fina", 6 → 3 px). A prova é o estilo computado do elemento |

A amostra de fonte usa a fonte real (`headingFont` no título, `bodyFont` no corpo), carregada só quando o cartão entra na área visível e pela origem de `options.fonts` (`useRequestFont`); com `none`, mostra a
fonte que houver. Escolher uma fonte grava só `headingFont` e `bodyFont`.

## 6.5 A mídia global no preview

O fundo global do tema (`globalBackgroundImageUrl`) aparece **dentro** do preview. `PreviewCanvas` tira a
chave só do `DesignScope` **externo**, que envolve o próprio painel, para não pintar fundo atrás do cromo
do painel. O `DesignScope` interno de `PreviewSystemRenderer` a preserva, e com mídia a raiz do cromo
simulado deixa de pintar fundo opaco (`PreviewSystemRenderer.tsx`). Provado em jsdom
(`PreviewSystemRenderer.test.tsx`) e em navegador real (`browser-tests/cromo-css-real.spec.ts`, caso
*"COM mídia global"*).

## 6.6 Decisão e tela — dois gestos, sem laço

Abrir uma decisão leva a prévia à **tela canônica** dela, e escolher uma tela no menu da prévia não muda a decisão aberta. Cada decisão declara `screen` e `screens` em `config/design-decisions.json`, e `Main/hooks/usePreviewUIState.ts` faz o resto: é um gesto só, e nenhum efeito reage ao outro lado.

- Abrir uma decisão cuja tela atual já pertence a ela **não troca a tela**.
- O estado inicial é a lista de decisões, com a tela `dashboard`.
- **A tela da espiada não é a tela da decisão.** Abrir a decisão continua levando à tela canônica (`screen`). A espiada de um grupo com
  `groupScreens` mostra a tela do grupo por cima dela, sem mudar o estado de tela, e por isso ela volta ao sair: a prévia recebe
  `peekScreen ?? activePreviewApp` (`ThemeCustomizationTab.tsx`). Só escolher a opção espiada grava a tela do grupo como a tela ativa.

**O menu do preview** mostra **seis telas** com rótulo humano — **Painel · Formulário · Tabela · Texto · Gráficos ·
Tipografia** — e um sétimo item, **"Mais telas"**, que abre a grade do `MoreScreensMock` com as restantes
(Componentes, Entrar, Chat, Registros, Configurações, Documentos, Matriz, Todos os componentes). Com uma delas
ativa, o item ativo do menu é "Mais telas". Não há submenu no cromo.

# 7. Dogfooding

O painel obedece à regra de composição atômica: usa `SarakButton`, `SarakInput` e os demais átomos, não
HTML cru. **O motivo não é estético — é de detecção:** se a ferramenta de autoria da lib usasse HTML cru,
ela deixaria de exercitar os próprios átomos, e regressão visual em átomo passaria despercebida por quem
mais usa a lib (nós). O painel é o consumidor mais intenso da biblioteca.

# 8. A allowlist do zero-marca — por que ela é legítima

`gates/scripts/contrato/check-zero-brand.mjs` proíbe os literais de marca da lib como **texto renderizado** em `src/`, com
**allowlist** na constante `ALLOWLIST` do próprio gate (a fonte) — hoje um arquivo:

| Arquivo | Motivo |
| --- | --- |
| `features/DesignEngine/Canvas/KitchenSinkPreview.tsx` | vitrine interna de componentes/temas, usada só pelo painel |

**Por que é legítimo:** estes são **painéis internos** — a ferramenta com que a lib autora temas. O
consumidor **não embute** o Kitchen Sink no produto dele. A regra zero-marca existe para que a lib não
carimbe a própria marca **no produto do consumidor** ([[08-identidade-do-host-e-zero-marca]]); um painel de
autoria interno não é produto do consumidor.

**A barra para entrar na allowlist é alta, e por construção:** cada entrada carrega **motivo escrito ao
lado**, e o motivo tem de ser "isto não é consumidor-facing" — nunca "estava vermelho"
([[01-gates-e-baseline]] §6, regra 1). Adicionar arquivo aqui é assumir publicamente que ele nunca chega
ao produto do consumidor.

⚠️ **Mas há uma tensão real:** o `CustomizationPanel` **é exportado no barril público** (`src/index.ts:50`).
Ou seja, um consumidor **pode** exibi-lo — e nesse caso os painéis da allowlist chegam à tela dele. A
allowlist é justificada pela **intenção** de uso, não por uma barreira técnica. Registrado como nuance, não
como violação: os três arquivos são abas internas, e nenhum consumidor real exibe o Kitchen Sink hoje.

# 9. Dívidas conhecidas (documentadas, não corrigidas)

## 9.1 ✅ FECHADO — `tsc` estava vermelho em `ThemeCustomizationTab.tsx`, hoje zero erros

**Era:** `src/features/DesignEngine/Main/ThemeCustomizationTab.tsx:86` — `TS2322`: união de tipo de toast
incompatível. O alvo (`useThemePersistenceHandlers`) aceitava `'error' | 'success' | 'warning'`; a função
`showToast` fornecida tratava só `'success' | 'warning'`.

**Hoje:** `npx tsc --noEmit` fecha com **zero erros**, produção e teste — o baseline vive em
[[01-gates-e-baseline]] §3, que é a fonte a conferir (não este número, que envelhece).

## 9.2 ✅ FECHADO em 2026-08-05 (`plan-09`) — o painel deixou de ser eager no barril

**Era:** `src/index.ts:50` exportava `CustomizationPanel` de forma eager, e o bloco `:126-131` o **importava
com efeito colateral** para registrá-lo no Discovery — o painel inteiro, a peça mais pesada da biblioteca, no
caminho crítico de todo consumidor.

**Conserto:** o bloco de efeito colateral foi apagado (saíram junto os dois ids legados do registro de módulos,
`mx-customization`/`personalization`), e `src/index.ts:50-52` passou a
exportar o índice lazy (`Library/CustomizationPanel/index.tsx`, `React.lazy` + `Suspense` interno, no padrão
do `SarakChartEngine`). **O Design Engine inteiro saiu do caminho crítico:** chunk de boot medido em
**674.011 → 167.684 bytes (−75,1%)**. O tipo público não mudou (`React.FC`, não `LazyExoticComponent`) —
consequência de seguir o padrão existente em vez da previsão original desta spec.

**Consequência para o consumidor:** quem dependia do registro automático de `mx-customization` precisava montar o
painel direto (`<CustomizationPanel />`); o registro de módulos deixou de existir de vez com o cromo único
([[018-um-cromo-so-e-o-consumidor-e-dono-das-rotas]]) — está em `docs/migracoes.md`.

## 9.3 ✅ FECHADO em 2026-08-04 (`plan-08`, F2) — as 6 abas mortas saíram, não voltaram

**Era:** `CustomizationPanel.tsx` importava `LayoutTab`, `LanguageTab`, `ShortcutsTab`, `AdvancedTab`,
`EngineCustomizationTab` e `HyperGranularityTab`, mas o corpo só renderizava `<ThemeCustomizationTab />` —
as outras cinco eram inalcançáveis e pesavam no bundle sem entregar nada.

**Decisão do dono (2026-08-04): remover os imports mortos**, não restaurar a navegação. `CustomizationPanel`
(hoje `CustomizationPanelImpl.tsx`) caiu de 49 para 35 linhas — saíram os 6 imports de aba, os ícones que só
serviam a elas, o `useState` não usado e o `type TabId` órfão. Dos 6 componentes de aba, **três continuam em
`Panels/`** (`AdvancedTab`, `EngineCustomizationTab`, `HyperGranularityTab`), com os próprios
testes; `LanguageTab`, `ShortcutsTab` e `LayoutTab` foram apagados depois. A ordem
obrigatória foi respeitada: esta remoção só aconteceu **depois** de a §9.5 fechar (F1 antes de F2, porque
restaurar navegação antes do conserto do `localStorage.clear()` ativaria a perda de dados).

## 9.4 `PreviewCanvas` aplica design SEM `validateDesign`

O boot real valida antes de aplicar (`useDesignManager`); o **caminho de preview não**. Por isso valores
fora do contrato chegavam a virar CSS Variable literal no preview — foi assim que o drift de 21 tokens
ficou visível (`plan/40.4` §Nota). Registrado também em [[10-seguranca-e-acessibilidade]] §5.4.

**Risco real:** baixo hoje (o dado do preview é o rascunho do próprio painel). Mas é uma **assimetria de
fronteira**: dois caminhos que aplicam design, um valida e o outro não.

## 9.5 ✅ FECHADO em 2026-08-04 (`plan-08`, F1) — o reset deixou de apagar a origem inteira

**Era:** `AdvancedTab.tsx` chamava `localStorage.clear()` num botão cujo `confirm()` prometia só
"configurações visuais" — `clear()` não distingue chave da lib de chave do host, e apagava token de sessão,
carrinho, rascunho de formulário, tudo, antes de recarregar a página do host.

**Conserto:** `src/core/Provider/utils/storage.ts` (novo) — `clearSarakStorage(storageKey?)` remove **só**
as chaves da lib (as fixas mais a `persistence.storageKey` do Provider); `AdvancedTab.tsx` passou a chamá-la
no lugar de `localStorage.clear()`, e o texto do `confirm()` e do subtítulo do cartão foram alinhados ao que
o código de fato faz. Teste dedicado prova que **uma chave alheia sobrevive ao reset**
(`storage.test.ts`). Entrada em `docs/migracoes.md`.

**Esta foi a primeira correção do lote F1→F2, de propósito:** restaurar navegação para as abas mortas
(§9.3) **antes** deste conserto teria ativado a perda de dados em produção. A ordem foi respeitada.

## 9.6 `plan/14` está APOSENTADA — decisão de não fazer

`plan/14-visibilidade-aba-design-engine.md` propunha um mecanismo de visibilidade da aba do Design Engine
baseado no **shell legado**. Aquele shell não existe mais no formato pressuposto, e a exibição do painel
hoje é decisão do consumidor (ele exporta o componente e monta onde quiser, ou registra o id legado).
**Registrado como não-fazer**, para não ser retomada por engano.

# 10. Critérios de aceite

- [x] **NENHUMA menção a "salvar tema no banco"** — o único caminho descrito é export → `customThemes`.
- [x] O caminho export → `customThemes` está descrito ponta a ponta (§5).
- [x] A folksonomia está explicada com as 3 fontes, o algoritmo e `arquivo:linha`.
- [x] Os controles polimórficos aparecem mapeados por `token.type`, não por nome de token.
- [x] Draft × persistido: a gravação é explícita e não tem exceção (§4).
- [x] O preview está descrito com o **limite** declarado (override lógico, não container query).
- [x] A allowlist do zero-marca tem a justificativa **e** a tensão registrada.
- [x] O erro de `tsc` está documentado e **não corrigido**.
- [x] As dívidas 9.2, 9.3 e 9.5 estão registradas — **as três fecharam** entre 2026-08-04 e 2026-08-05
      (plans 08 e 09); o registro documenta a decisão do dono e o conserto aplicado, não mais uma pergunta
      em aberto.

# 11. Plano de testes (Quality Gate)

| Verificação | Onde | Situação |
| --- | --- | --- |
| Folksonomia: sanitização de categoria e montagem de grupos | `src/features/DesignEngine/utils/__tests__/dynamic-categories.test.ts` | ✅ suíte |
| Busca de token: sentido, ordem, prefixo só no último termo, grupos de conceito vivos | `src/features/DesignEngine/utils/__tests__/token-search.test.ts` | ✅ suíte |
| A coluna: decisões, níveis, cobertura de todo token e `visualImpact` válido | `Main/hooks/__tests__/usePreviewUIState.test.ts` · `useThemeCustomizationData.test.ts` · `Main/components/__tests__/ThemeSidebarHeader.test.tsx` · `ThemeImpactList.test.tsx` | ✅ suíte |
| Rascunho: inicialização nula, resolução para o sistema, comparação profunda | `src/features/DesignEngine/hooks/__tests__/useDesignDraft.test.tsx` | ✅ suíte |
| Export completo (não subconjunto) e slug estável | `Main/utils/__tests__/exportTheme.test.ts` | ✅ suíte |
| Escopo do preview não vaza variável para o host | `src/core/Design/components/__tests__/DesignScope.test.tsx` | ✅ suíte |
| Painel monta e renderiza a aba de tema | `Library/CustomizationPanel/__tests__/CustomizationPanelImpl.test.tsx` | ✅ suíte |
| Fronteira lazy (`Suspense`, tipo público preservado) | `Library/CustomizationPanel/__tests__/CustomizationPanelImpl.test.tsx` | ✅ suíte *(2026-08-05, `plan-09`)* |
| Reset apaga só as chaves da lib | `src/core/Provider/utils/__tests__/storage.test.ts` · `Panels/__tests__/AdvancedTab.test.tsx` | ✅ suíte *(2026-08-04, `plan-08`)* |
| Preview (canvas, mocks, kitchen sink) | `Canvas/__tests__/PreviewCanvas.test.tsx`, `MockApps.test.tsx`, `KitchenSinkPreview.test.tsx` | ✅ suíte |
| Barra de ações: `Aplicar` e o contador com 0/1/3 alterações, Descartar, Exportar sem "Exportado", Desfazer só com aplicação | `Main/components/__tests__/ThemeActionBar.test.tsx` | ✅ suíte |
| Galeria sob demanda (fechada = só o preview) e empilhado sem `vh`; "Empilhar previews" inativo sem galeria | `Canvas/__tests__/PreviewCanvas.test.tsx` · `Canvas/components/__tests__/LiveDraftPreviewFrame.test.tsx` · `PreviewToolbar.test.tsx` | ✅ suíte |
| Escolher tema na tela Temas e JSON só altera o rascunho (falha se voltar `applyFullConfig`, `persistDesign` ou `setResolvedThemeId`) | `Main/__tests__/TemplatesTab.test.tsx` | ✅ suíte |
| Pilar ↔ tela: tela canônica por pilar, `navigation` sem voltar a `surfaces`, par inicial coerente | `Main/hooks/__tests__/usePreviewUIState.test.ts` | ✅ suíte |
| Seis telas com rótulo humano e "Mais telas" ativo para as secundárias | `Canvas/components/__tests__/PreviewSystemRenderer.test.tsx` · `Canvas/Mocks/__tests__/MoreScreensMock.test.tsx` | ✅ suíte |
| Menu Avançado: três entradas e a volta, teclado (setas com direção, Home, End, Esc devolve o foco) | `Main/components/__tests__/ThemeAdvancedMenu.test.tsx` · `ThemeSidebarHeader.test.tsx` | ✅ suíte |
| Selo de dispositivo nos três dispositivos; nenhum em token fixo; piso de 12 px pelo schema | `Main/components/__tests__/TokenControl.test.tsx` | ✅ suíte |
| Sair com rascunho sujo: pergunta só quando sujo, as três escolhas, Esc vale "ficar"; o cromo espera a resposta antes do `onNavigate` do host, na lateral e no topo | `Main/hooks/__tests__/useLeavePanelGuard.test.tsx` · `Main/components/__tests__/LeavePanelDialog.test.tsx` · `Main/__tests__/ChromeNavigationGuard.test.tsx` · `src/core/Provider/__tests__/navigationGuard.test.tsx` | ✅ suíte |
| Popover do cromo pela moldura: destino e conversão de coordenadas; sem moldura, `body` e identidade | `src/core/Provider/__tests__/portalFrame.test.tsx` | ✅ suíte |
| Espiada: tela do grupo e volta, promessa descartada ao sair, rolagem que não espia | `Main/hooks/__tests__/usePeekPreview.test.ts` · `Canvas/components/__tests__/peek.test.tsx` · `peek.scroll.test.tsx` | ✅ suíte |
| Amostra fora da área visível congelada | `Canvas/hooks/__tests__/useValueWhileVisible.test.tsx` | ✅ suíte |
| Escolher uma opção: < 250 ms (mediana, React de produção), 0 `<style>` por escolha, 0 remontagem e 0 reescrita fora da área visível na troca de tema | `browser-tests/escolha-no-painel.spec.ts` | ✅ navegador |
| Toda opção destacada muda a prévia, com as exceções provadas (§6.4); a prévia desktop na largura do sistema, o ⚙ dentro da moldura, os links que não saem, tablet e celular sem corte, rolar o painel sem espiar, o respiro da célula por opção de `tableCellPadding` | os specs de navegador da prévia em `browser-tests/` | ✅ navegador |
