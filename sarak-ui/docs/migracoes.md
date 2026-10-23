# Migrações (breaking changes do contrato público)

Registro das mudanças que quebram o contrato de quem já importa a `@sarak/lib-ui-core`,
com o "antes" e o "depois" lado a lado. Uma entrada por mudança, mais recente primeiro.

---

## 8.0.0 — um cromo por aplicação

**Classificação: MAJOR.** O `SarakShell`, a descoberta e o registro global de módulos foram removidos.
Cada aplicação monta `SarakAppChrome`, fornece seus `navItems` e controla as próprias rotas.

Os peers opcionais continuam opcionais: instale somente os que os componentes usados pelo seu
produto precisam. Se um componente for renderizado sem o pacote correspondente, ele mostra uma
mensagem com o nome do pacote e registra um aviso no console. O guia relaciona cada pacote ao
componente que o utiliza.

### Largura padrão do conteúdo

`maxContentWidth` passa a acompanhar a largura do próprio contêiner: as margens externas crescem
proporcionalmente, respeitam `layoutPadding` como piso e param em 128 px por lado. O respiro interno
continua seguindo `layoutDensity`. Os temas embarcados adotam esse padrão fluido; aplicações que
precisam de um teto fixo podem selecionar `1000px`, `1200px`, `1440px` ou `1600px`. O valor `100%`
continua ocupando toda a largura disponível. Para gravações novas, a opção fluida é persistida como
`fluid` e convertida em CSS pela biblioteca; não grave a expressão CSS no tema. Uma configuração
explícita já salva continua valendo.

### Pisos mínimos de peers e dependência na 8.0.0

**Classificação: MAJOR.** Para receber as correções de segurança, atualize os pacotes opcionais
usados pela aplicação para `echarts >=6.1.0`, `echarts-for-react >=3.0.4`, `pdfjs-dist >=6.2.108`
e `react-syntax-highlighter >=16.1.2`. A dependência `dompurify` da biblioteca passa a exigir
`>=3.4.17` e é instalada junto com ela.

`echarts-for-react` 3.0.4 é o primeiro piso com suporte declarado a ECharts 6. A migração para
ECharts 6 altera o tema padrão, as posições e dimensões iniciais de alguns componentes, o ajuste
automático de rótulos e a herança de estilos rich text; o motor Sarak usa opções e cores explícitas
e não precisou de mudanças de API. Consulte o [guia de atualização do ECharts 6](https://github.com/apache/echarts-handbook/blob/master/contents/en/basics/release-note/v6-upgrade-guide.md)
se a aplicação depender do tema ou dos padrões anteriores.

### De/para completo dos nomes do barril entre v7.0.0 e v8.0.0

**Classificação: MAJOR (sai na 8.0.0).** A comparação das declarações públicas de v7.0.0 com a superfície v8 identificou 26 exports removidos e uma renomeação: `SARAK_REFERENCE_THEMES` passou a `SARAK_BOOT_THEMES` (o par completo é carregado por `sarakLoadReferenceThemes()`). Esta tabela reúne todos os 27 nomes alterados ou removidos; quando não há substituto direto, a responsabilidade passa para a aplicação.

| Nome em v7.0.0 | Use na v8.0.0 |
|---|---|
| `SARAK_GLOBAL_THEMES` | `SARAK_THEME_CATALOG` para listar; `sarakLoadAllThemePresets()` para carregar os temas completos. |
| `SARAK_REFERENCE_THEMES` (par claro + escuro) | `SARAK_BOOT_THEMES` contém o tema escuro síncrono; `sarakLoadReferenceThemes()` carrega o par completo |
| `SarakComponent` | Importe e monte as telas diretamente na aplicação. |
| `SarakComponentProps` | Declare os tipos das telas e componentes React do consumidor. |
| `SarakDataGridImpl` | Use `SarakDataGrid` dentro de `<Suspense fallback={...}>`. |
| `SarakDataTableImpl` | Use `SarakDataTable` dentro de `<Suspense fallback={...}>`. |
| `SarakDiscoveredModule` | Use `SarakNavItem` para descrever a navegação; a tela fica sob controle da aplicação. |
| `SarakDynamicRenderer` | Monte a tela da rota diretamente como conteúdo de `SarakAppChrome`. |
| `SarakDynamicRendererProps` | Declare as props da tela no componente React do consumidor. |
| `SarakFilterDescriptor` | Implemente a configuração e o estado dos filtros na tela consumidora. |
| `SarakModule` | Mantenha as telas como componentes React da aplicação; não há manifesto de módulo substituto. |
| `SarakModuleManifest` | Defina título, URL e ícone em `navItems` e nas rotas do consumidor. |
| `SarakRouterState` | Use o estado do roteador escolhido pela aplicação. |
| `SarakShell` | Monte `SarakAppChrome` ao redor do conteúdo da rota. |
| `SarakShellProps` | Use `SarakAppChromeProps` e `SarakNavItem[]` para a navegação. |
| `SarakVisualContract` | Componha a tela com componentes React do consumidor. |
| `SarakVisualContractType` | Declare o tipo de props no componente React; não há contrato visual declarativo substituto. |
| `getSarakModule` | Consulte a configuração local de rotas e componentes da aplicação. |
| `registerSarakModule` | Registre telas no roteador e na navegação da aplicação. |
| `sarakGetLocalComponent` | Importe e use o componente diretamente na tela consumidora. |
| `sarakGetLocalComponentIds` | Use a configuração de rotas da aplicação para enumerar telas. |
| `sarakGetRegisteredModules` | Mantenha a lista de telas em `navItems` e nas rotas do consumidor. |
| `sarakGetThemePreset(id)` | Use `await sarakLoadThemePreset(id)`; rejeita para id desconhecido. |
| `sarakRegisterLocalComponent` | Importe e monte o componente diretamente. |
| `sarakSubscribeToRegistry` | Observe mudanças pelo estado do roteador da aplicação. |
| `useModuleDiscovery` | Controle descoberta e navegação na aplicação e forneça `navItems` ao cromo. |
| `useSarakRouter` | Use o roteador escolhido pela aplicação para ler e alterar a rota ativa. |

### Tipo público das props `gap`

**Classificação: MAJOR (sai na 8.0.0).** `gap` deixa de aceitar qualquer `string` em `SarakFlex`, `SarakGrid` e `SarakFormGroup`. `SarakLayoutGap` aceita tokens `spacing-*` publicados, zero CSS, números em pixels, comprimentos CSS com unidade e as funções `var()`, `calc()`, `clamp()`, `min()` e `max()`. Valores desconhecidos como `"md"` deixam de compilar; a validação de runtime continua avisando e usando o padrão quando JavaScript ou um cast contorna o tipo.

### Os 19 temas embarcados demonstram os eixos visuais da biblioteca

**Classificação: MAJOR.** A coleção foi recomposta para cobrir estilos e capacidades distintos do Design Engine: 14 temas existentes foram refeitos e estes 5 ids foram adicionados — `editorial-ink`, `organic-clay`, `high-contrast`, `corporate-ledger` e `playful-pastel`. O tema visual padrão continua sendo `sarak-sovereign`. A aplicação carrega os temas embarcados sob demanda; depois de carregar um preset, valores de tema já salvos pelo consumidor vencem os valores do preset para as chaves que declaram. A derivação feita com `sarakDeriveThemeFromReference` preserva a contraparte e aplica os ajustes de marca nos dois modos.

Itens de navegação com destino (`SarakMenuItem` e, por ele, `SarakShellNav` e o menu do `SarakAppChrome`)
agora são âncoras `<a href>` em vez de `<button>`. Testes de ponta a ponta e seletores de consumidor que
procuravam `role="button"`/`button` em um item de navegação devem procurar `role="link"`/`a`. Sem
`onNavigate` nem `onChange`, `SarakShellNav` também deixa o navegador seguir a rota do item, em vez de
ignorar o clique.

### Os temas embarcados são carregados sob demanda: `SARAK_GLOBAL_THEMES` e `sarakGetThemePreset` saem do barril

O boot do consumidor leva só o tema padrão (`sarak-sovereign`); os demais chegam quando são escolhidos. A
interface não muda: o primeiro acesso abre no tema padrão, ao escolher outro **o atual continua na tela até o
novo chegar**, e o tema aplicado fica salvo e pinta direto do `design` guardado no acesso seguinte, sem carregar
nada. A porta de espera só existe quando o código força, por `initialTheme`/`activeThemeId`/`options.theme.defaultTheme`,
um tema embarcado que não está em memória e não há `design` salvo — ali o Provider mostra o `loadingFallback`
(nada, por padrão) por um `import()` curto e então a aplicação já no tema certo, nunca um tema trocado. Quem não quer
nem isso pré-carrega antes do render.

**Antes**
```tsx
import { SARAK_GLOBAL_THEMES, sarakGetThemePreset } from '@sarak/lib-ui-core';

const tema = sarakGetThemePreset('cyberpunk-neon');           // síncrono
<SarakUIProvider initialTheme="cyberpunk-neon" />
```

**Depois**
```tsx
import { sarakPreloadThemes, sarakLoadThemePreset, SARAK_THEME_CATALOG } from '@sarak/lib-ui-core';

await sarakPreloadThemes(['cyberpunk-neon']);                  // antes do createRoot().render — zero espera
const tema = await sarakLoadThemePreset('cyberpunk-neon');
<SarakUIProvider initialTheme="cyberpunk-neon" loadingFallback={<Splash />} />
```

| Saiu / mudou | Use |
|---|---|
| `SARAK_GLOBAL_THEMES` | `SARAK_THEME_CATALOG` para listar (nome, modo, amostra de cor `swatch`/`swatchOpposite`, sem carregar) · `sarakLoadAllThemePresets()` para os temas com `design` |
| `sarakGetThemePreset(id)` | `sarakLoadThemePreset(id)` — assíncrono; rejeita com id desconhecido, nunca devolve `undefined` mudo |
| `SARAK_REFERENCE_THEMES` (par claro + escuro) | `SARAK_BOOT_THEMES` contém o tema escuro síncrono; `sarakLoadReferenceThemes()` carrega o par completo |
| `sarakDeriveThemeFromReference('minimalist-airy', …)` | passe o preset carregado como 1º argumento: `sarakDeriveThemeFromReference(await sarakLoadThemePreset('minimalist-airy'), …)`; `'sarak-sovereign'` segue síncrono |
| `useSarakUI().allThemes` listando todos os embarcados | `allThemes` traz só os temas com `design` em memória; para listar tudo, `useSarakUI().themeCatalog` (e `loadTheme(id)` para carregar um) |

Também mudam, e o consumidor percebe:

- **Trocar de tema não herda mais nenhum token do tema anterior.** O que o tema novo não declara volta ao padrão
  do schema (antes, herdava o valor do tema anterior e a tela dependia da ordem das escolhas). A ordem é: padrões
  do schema → identidade e modo do usuário (`systemName`, `logoUrl`, `logoDarkUrl`, idiomas, `mode`) → o `config`
  do `SarakUIProvider` → o tema. O tema vence o que declara; o `config` do host vale no resto, na montagem e em
  toda troca.
- **O tema padrão é explícito:** `SARAK_DEFAULT_THEME_ID` (`'sarak-sovereign'`). O `'classic'` implícito saiu —
  ele nunca existiu e caía no primeiro tema em silêncio. Um `options.theme.defaultTheme` que não existe agora **avisa**.
- **Pedir um tema que não existe, em modo claro,** cai na contraparte clara do `sarak-sovereign` (antes, no
  `minimalist-airy`, que deixou de ser síncrono).
- **Tema estático em SSR:** o servidor não espera o `import()`. Pré-carregue (`await sarakPreloadThemes([...])`)
  antes de `renderToString`, senão a página renderiza o `loadingFallback`.
- Peso: cada tema embarcado fica em até 3 KB gzip, e o consumidor deixa de pagar por todos no boot.

### No celular, a navegação passa para uma barra na base (até 5 destinos), e a opção `dock` sai do schema

**Classificação: MAJOR (sai na 8.0.0).** Muda o que o cromo faz por padrão no celular e tira um valor do schema
(mudar um default é MAJOR; remover valor de token é MAJOR). Nenhum nome saiu do barril público nem mudou de tipo.

| Antes | Depois |
|---|---|
| No celular a navegação morava sempre **dentro do drawer**, atrás do hambúrguer. | O token novo **`mobileNavigationStyle`** (`auto` · `bottom` · `drawer`, padrão **`auto`**) escolhe onde ela fica. Em `auto`, um cromo com **até 5 destinos** mostra a navegação numa **barra fixa na base** (ícone e rótulo, estado ativo, `badge`, `disabled`, link de verdade, caixa tocável de pelo menos `touchTargetMin`, respiro da área segura), e **acima de 5** segue na gaveta. `bottom` e `drawer` forçam. O hambúrguer e o drawer continuam, com os widgets e os slots `sidebarHeader`/`sidebarFooter`; com a barra ativa, a navegação **sai** do drawer. Tablet e desktop não mudam. |
| `navigationStyle` aceitava `'dock'` ("Doca Flutuante"), que nenhum cromo implementava: o valor era lido como `sidebar`. | `'dock'` saiu das opções do schema e do catálogo. Um tema ou preferência salvo com `navigationStyle: 'dock'` é **descartado na validação com o aviso de valor fora do contrato** e o cromo desenha a sidebar — o mesmo desenho de antes. |

**O que fazer:** quem quer a navegação do celular na gaveta como antes define `mobileNavigationStyle: 'drawer'` em
`config` do Provider (ou escolhe **Gaveta** em *Navegação no Celular*, na seção de configurações globais do painel de
Design). **Um teste seu que abria o drawer para clicar num item de navegação no celular** passa a achá-lo na barra
da base (`nav[data-sarak-bottom-nav]`, links com o mesmo nome) sem abrir o drawer, quando o cromo tem até 5 itens.
Quem tinha `navigationStyle: 'dock'` em tema salvo não precisa fazer nada; o aviso some ao regravar o tema.

### No celular, todo acionável tem área tocável de 44 px, o campo não dá zoom, o movimento reduzido vale e a busca abre o teclado de busca

**Classificação: MAJOR (sai na 8.0.0).** Com ponteiro de dedo (`pointer: coarse`) o tamanho computado de botões,
botões-ícone, itens de menu, abas e seletores cresce, e o corpo da fonte dos campos sobe. Nenhum nome saiu do
barril público nem mudou de tipo; muda o que o CSS publicado faz por padrão (mudar um default é MAJOR). Com mouse,
nada muda no desenho.

| Antes | Depois |
|---|---|
| Um botão-ícone `xs` media 24 px, o `sm` 32 px e o `SarakButton` `xs` cerca de 28 px também no celular. A barra do Gantt tinha 60% de uma linha de ~40 px. | Com `pointer: coarse`, `button`, `[role="button"]`, `[role="menuitem"]`, `[role="tab"]` e `input` de botão têm pelo menos o token **`touchTargetMin`** (44 px por padrão, faixa 24–64) de altura **e** de largura; `select` e `[role="option"]`, de altura. A linha do Gantt e a barra sobem ao mesmo valor. Mouse: tamanho de antes. **Um layout seu que contava com um botão pequeno no celular cresce; um componente seu que precise de uma caixa menor escreve `min-height`/`min-width` em estilo inline ou em classe, que vencem o padrão.** |
| `input`, `textarea` e `select` herdavam o corpo do texto (12 ou 14 px em 11 dos 14 temas): o Safari do iPhone dava zoom ao focá-los. | Com `pointer: coarse` a fonte do campo é `max(16px, corpo herdado)`. Um campo seu com `text-sm` ou `text-xs` em classe segue vencendo o padrão — a lib mesma trocou o `text-sm` do `SarakTimePicker` por uma variante de ponteiro de dedo. |
| O token `reducedMotion` emitia `--sarak-reduced-motion`, e nada lia a variável; nenhum CSS respondia a `prefers-reduced-motion`; o `framer-motion` ignorava a preferência. | Com o token ligado **ou** `prefers-reduced-motion: reduce`, transição e animação da lib caem a 0,01 ms (CSS) e o `SarakUIProvider` monta um `MotionConfig` (`always` com o token, `user` sem ele). **Quem tem a preferência ligada no sistema operacional passa a ver a lib sem movimento, sem mudar nada.** Spinner e skeleton param. |
| `SarakTooltip` abria só por `mouseenter` e foco: no toque, um gatilho não focável nunca o abria. | Abre no toque, na hora; um segundo toque no gatilho ou um toque fora o fecha. Mouse e foco como antes. |
| Os campos de busca eram `type="text"` (ou sem `type`) e abriam o teclado comum. | `SarakSearch`, a barra do `SarakShellSearchWidget`, o campo do `SarakMultiSelect` e o do `SarakAutocomplete` declaram `type="search"` e `enterKeyHint="search"`. **Um seletor de teste seu `input[type="text"]` nesses campos deixa de casar; o `role="combobox"` e o placeholder não mudaram.** No `SarakAutocomplete`, `type` e `enterKeyHint` passados vencem o padrão. |

**Token novo:** `touchTargetMin` (schema `engineering`, `--sarak-touch-target-min`), em `config` do Provider ou no
painel de Design. Não há nada a configurar para ter o comportamento novo.

### A superfície de cartão sob textura chega por âncora explícita, não por "card" no nome da classe

**Classificação: MAJOR (sai na 8.0.0).** Muda o que o CSS publicado faz por padrão com o markup do consumidor e
pede ação a quem dependia do efeito (§3 da política de versionamento: mudar um default é MAJOR). Nenhum nome saiu do barril público nem mudou de tipo. Muda o que o CSS publicado
alcança quando o tema liga uma textura (o default liga `grid`).

| Antes | Depois |
|---|---|
| Sob textura, **qualquer** elemento com `card` em qualquer pedaço do nome de uma classe — inclusive utilitárias como `bg-[var(--color-theme-card,…)]` ou `hover:bg-[var(--sarak-card-bg)]` — recebia a superfície de cartão com `!important` (fundo translúcido, desfoque, raio, borda e `clip-path` do cartão) e a camada de textura do cartão. | Só recebem a superfície e a textura de cartão os elementos com uma **âncora explícita**: `sarak-card`, `card` ou `bg-theme-card`. A utilitária do consumidor com `card` no nome passa a computar o fundo que a classe escreve. |

**O que fazer:** se uma classe sua dependia do efeito, dê ao elemento a âncora `card` (superfície e textura sob o
tema, sem o padding e a borda de `sarak-card`) ou `sarak-card` (o cartão completo). Quem nunca quis o efeito não faz
nada: o elemento deixa de ser alterado por engano.

### O motor de gráficos obedece ao tema do painel, desenha várias séries e ganha waterfall, sankey e calendário de calor

**Classificação: MAJOR (sai na 8.0.0).** O desenho padrão de todo gráfico muda: cores, grade, tooltip e fonte
passam a sair do tema, e quem não tocou uma linha vê outro gráfico (mudar um default é MAJOR). Nenhuma prop foi removida nem mudou de tipo: `type`, `data` e `config` continuam
valendo como antes. O que muda é o **desenho** que o consumidor vê, porque o `SarakChartEngine` passou a ler o
tema que o painel de Design oferece.

| Antes | Depois |
|---|---|
| Cor, eixo, grade, tooltip e fonte do gráfico vinham de `primaryColor`, `secondaryColor`, `mode` e `bodyFont`, com três cores escritas à mão. | Os sete tokens de gráfico (`chartColorPalette`, `chartGridOpacity`, `chartTooltipBg`, `chartType`, `chartShowGrid`, `chartThickness`, `chartSmoothing`) e as cores do próprio tema mandam no desenho. **Um tema com cores ou espessura diferentes do padrão antigo muda o aspecto dos gráficos existentes.** |
| `type` obrigatório. | `type` é opcional: omitido, vale `chartType` do tema. A prop explícita continua vencendo. |
| `title`, `showGradients`, `showAnimation` e `thickness` existiam no tipo sem efeito. | Passam a ter efeito. O padrão preserva o desenho anterior, exceto a espessura da linha, que agora é `chartThickness` do tema. |
| `data` vazio desenhava um gráfico em branco. | Mostra o estado vazio (`SarakDataEmpty`), sem erro no console. O gráfico ganha `role="img"` e `aria-label` (prop `ariaLabel`, com padrão traduzido). |
| Uma série por gráfico. | Props novas e opcionais: `series`, `stacked`, `orientation`, `legend` e `onPointClick`. Sem `series`, o comportamento é o de antes; pizza, radar, funil e demais formatos não cartesianos as ignoram. |
| 14 formatos em `type`. | Mais três: `waterfall` (`{ name, value, total? }`), `sankey` (`{ source, target, value }`) e `calendar` (`{ date, value }`). Dado inválido nos três cai no estado vazio, nunca em exceção. |

O motor `recharts` segue uma alternativa limitada: recebendo uma prop que só o ECharts honra, avisa uma vez no
console de desenvolvimento.

### O `SarakKanban` reordena dentro da coluna, funciona em toque e teclado, e passa a ser carregado sob demanda

**Classificação: MAJOR (sai na 8.0.0).** Reordenar na mesma coluna passa a emitir `onCardMove` por padrão, o quadro
passa a exigir as peers `@dnd-kit/core` e `@dnd-kit/sortable`, e `SarakKanbanCard` muda de forma incompatível para
campos com os nomes novos. `<SarakKanban columns onCardMove renderCard />` continua
compilando e renderizando, mas o arrasto trocou de motor e **quem usa o quadro precisa instalar duas dependências**.

| Antes | Depois |
|---|---|
| Arrastar pela API HTML5 nativa, sem dependência. Não respondia a toque. | `@dnd-kit/core` e `@dnd-kit/sortable` (peers **opcionais**: só quem renderiza um quadro precisa delas). **Instale as duas** ao usar `SarakKanban`; sem elas o quadro não carrega. |
| Carregado junto com o resto, e sempre síncrono. | Carregado sob demanda: o chunk de boot não contém a biblioteca de arrastar. `<SarakKanban />` segue sem exigir `Suspense` do consumidor (mostra um estado de carga próprio). |
| Soltar sempre punha o cartão **no fim** da coluna; soltar na mesma coluna não fazia nada e não emitia evento. | O cartão vai ao **índice onde foi solto**, também dentro da própria coluna. Soltar no mesmo lugar não emite evento. |
| `onCardMove({ cardId, fromColumn, toColumn, toIndex })`. | Os mesmos campos mais `fromIndex`, `beforeCardId` e `afterCardId` (vizinhos finais, `null` nas pontas), para calcular a ordem sem reler o quadro. **Reordenar na mesma coluna agora dispara o evento**: o handler que assumia `fromColumn !== toColumn` deve tratar os dois casos. |
| Testes do consumidor simulavam `dragStart`/`dragOver`/`drop` HTML5. | Esses eventos não movem mais nada. O toque entra por pressão longa; o teclado, por Espaço (levanta e solta) e Esc (cancela). |
| `SarakKanbanCard` só com `id`, `title` e `description`. | Campos opcionais novos: `code`, `assignee`, `priority` (`'low' \| 'medium' \| 'high' \| 'urgent'`), `dueDate` e `subtasks`. **Um cartão do consumidor que já tenha um campo com um desses nomes e outro tipo passa a dar erro de tipo.** |
| Sem criar cartão, abrir cartão nem gerir coluna. | Eventos opcionais `onCardClick`, `onCardAdd`, `onColumnAdd`, `onColumnRename` e `onColumnDelete`: cada um, quando passado, liga o controle dele. Sem o evento, sem o controle. |

### Todo token visual que o painel oferece passa a mudar a tela: gradiente, material, sombra, tom, alternador, ruído, fontes, texturas e paleta dos gráficos

**Classificação: MAJOR (sai na 8.0.0).** Duas opções de `systemTone` e dois tokens de ruído saem do schema, o valor das
fontes dos temas embarcados muda, a paleta automática dos gráficos deixa de usar cor de status e vários efeitos que
o painel já oferecia passam a aparecer (mudar um default é MAJOR). Nenhum nome saiu do barril público nem mudou de
tipo; o tipo `SarakDesignTokens` perde duas chaves e ganha quatro.

Um gate novo (`npm run token-reader:check`) passa a travar o motivo: valor que o motor emite e que ninguém lê.

| Antes | Depois |
|---|---|
| `bgGradientMode` e `bgGradientAngle` emitiam variáveis que nenhum CSS lia: escolher "Linear", "Radial" ou "Mesh" não mudava o fundo. | **Desenham.** As paradas saem das cores do tema (fundo, camada, primária e destaque); `mesh` mistura quatro manchas em baixa opacidade. O padrão do token é `linear`, então **um tema que não definia o gradiente passa a ter um fundo em gradiente**; `bgGradientMode: 'none'` devolve o fundo chapado. |
| `surfaceMaterial` (`frosted`, `sleek`, `industrial`, `organic`) virava um atributo cujas regras CSS conheciam outros quatro nomes: nenhuma opção desenhava. | Os quatro **desenham nos cartões**: vidro com desfoque e saturação, reflexo diagonal, chapa com veio e bisel, fosco sem brilho. A intensidade vem de `surfaceIntensity`. |
| `shadowColorMode` (`neutral`, `colored`, `ambient`) tinha regras para `match` e `adaptive`; a geometria da sombra do cartão era fixa em `0 20px 50px -12px`. | A cor desenha: preta, tingida pela primária ou derivada do fundo. A geometria vira quatro tokens novos (`cardShadowOffsetX`, `cardShadowOffsetY`, `cardShadowBlur`, `cardShadowExpansion`), com o padrão **igual ao desenho anterior** (`0 20px 50px -12px`). **`cardShadowSpread` deixa de emitir `px`**: é a opacidade da sombra em %, e a unidade fazia a declaração da sombra base do cartão ser inválida (o navegador a descartava). O cartão passa a ter a sombra base que o tema já pedia. |
| `systemTone` oferecia `dark`, `light`, `cyber` e `tactical`; só `cyber` desenhava, e `dark`/`light` duplicavam `mode`. | Fica com **`none`** (o padrão, sem tom), **`cyber`** e **`tactical`** (HUD monocromo). Um tema ou preferência salvo com `systemTone: 'dark'` ou `'light'` é **descartado na validação, com o aviso de valor fora do contrato**, e vale `none` — o mesmo desenho de antes. |
| `switchStyleType` (`tactile`, `asymmetric`, `pulsing`, `glass`) não era lido pelo `SarakSwitch`. | Os quatro estilos desenham. O desfoque de `switchBackdropBlur` passa a existir **só em `glass`**; antes, todo alternador desfocava o fundo do trilho. |
| Três controles de ruído: `atmosphereNoiseOpacity` e `noiseIntensity` escreviam a mesma variável (`--sarak-noise-opacity`, o último vencia) e `bgNoiseDensity` escrevia outra (`--sarak-noise-density`). | **Um só: `bgNoiseDensity`**, que governa o grão de filme sobre a tela e o padrão `texture: noise`. `atmosphereNoiseOpacity` e `noiseIntensity` **saem do schema**; o valor salvo deles é descartado com aviso e vale o padrão. A variável `--sarak-noise-opacity` deixa de ser emitida. |
| Os temas embarcados escreviam `Orbitron`, `Chakra Petch`, `VT323` e `Fira Code`, que a lib não carrega, e o valor num formato (`"Inter", sans-serif`) que o painel não reconhecia como opção. | O carregador de fontes passa a ser derivado de `THEME_FONTS`: toda fonte oferecida é carregada. Os temas embarcados usam o valor exato da lista (`'Inter', sans-serif`); as quatro fontes não carregadas foram trocadas pela mais próxima da lista. |
| Seis texturas (`brushed`, `frosted`, `topo-deep`, `prism-mesh`, `blueprint-pro`, `wave-pulse`) pintavam em branco fixo e sumiam em superfície clara. | Pintam com a cor de textura do tema, como as outras 35, e aparecem nos dois modos. |
| A paleta automática dos gráficos usava as quatro cores de status como séries 4 a 7: a 4ª série pintava de "sucesso". | A paleta é **derivada das cores de marca** (primária, secundária, destaque e terciária, mais variações delas), ajustada à faixa de luminosidade do modo, ao piso de croma, ao contraste e à separação entre vizinhas (inclusive sob daltonismo). **A cor de cada série automática muda** em todo gráfico com mais de três séries — e, quando a cor de marca está fora do critério, também nas primeiras. Cor de status só chega a uma série por escolha explícita (`series[].color: 'statusSuccessColor'`, que segue valendo) ou pela semântica do próprio gráfico (waterfall, candlestick). |
| `cardVariant` aparecia no modo Impacto do painel como estilo. | Sai do modo Impacto: escolhe **qual cartão** o `SarakCardGrid` desenha, não um estilo. O token e seus valores não mudam. |

**O que fazer:** quem quer o fundo chapado de antes define `bgGradientMode: 'none'` em `config`; quem lia
`--sarak-noise-opacity` na própria folha de estilo lê `--sarak-noise-density`; quem salvou `atmosphereNoiseOpacity`,
`noiseIntensity` ou `systemTone: 'dark' | 'light'` não precisa fazer nada (o aviso some ao regravar o tema). Um teste
que fixava a cor de uma série de gráfico lê a cor da paleta derivada, não a do token.

### O resto do arsenal desenha: moldura, direção e camadas da sombra, vidro do cartão, variantes de cor e cor de textura

**Classificação: MAJOR (sai na 8.0.0).** Sete tokens saem do schema, e efeitos que o painel já oferecia passam a
aparecer em todo tema que os escolhia ou que os carregava no valor padrão (mudar um default é MAJOR). Nenhum nome
saiu do barril público nem mudou de tipo; o tipo `SarakDesignTokens` perde sete chaves.

| Antes | Depois |
|---|---|
| `textureColor` não gerava variantes: a variável `--theme-texture-color-rgb`, lida por 24 regras de CSS, **nunca existia**, e toda textura, animação de brilho e moldura caía na cor primária. | A variante é emitida: **a cor de textura do tema chega às texturas**. Um tema com `textureColor` diferente da primária passa a ter texturas na cor dele (e o `glow-reveal`, o halo da moldura `glow`). A `carbon` mantém a diferença entre os tons do tecido sobre qualquer cor de textura. O anel de foco (`--theme-primary-focus`) continua da primária. |
| `waves`, `topo`, `diamond`, `prestige` e `hexagon` escreviam a cor com `var()` **dentro do SVG embutido**, que o navegador não resolve: o traço não tinha a cor do tema. | Pintam por máscara, preenchida com a cor de textura do tema (o desenho das outras seis da plan anterior). |
| `-webkit-backdrop-filter` ao lado de `backdrop-filter` deixa **só** a forma com prefixo no `dist/sarak.css`, que o Chromium não aplica: `cardBackdropBlur` não desfocava nenhum cartão, e o modo `eco` não o cancelava. | Toda declaração sai só na forma sem prefixo. **O cartão passa a desfocar** `cardBackdropBlur` (12px por padrão) sob os materiais `sleek` e `industrial`; sob `frosted` o desfoque é `cardBackdropBlur` + a intensidade do material (no padrão, os mesmos 24px de antes); `organic` segue sem desfoque. |
| `borderType` (`solid`, `cyber`, `double`, `glow`, `none`) virava um atributo cujas regras conheciam `inlet`, `neon` e `beveled`, que não são opções: nenhuma desenhava. | As cinco desenham, nos cartões, painéis e no cabeçalho/barra lateral do cromo: contorno contínuo, segmentado, em linha dupla, em neon e sem moldura. |
| `shadowOrientation` e `layeredShadows` emitiam variáveis e atributo que nada lia; `--dynamic-shadow`, lido por `SarakSearch`, pela busca do cromo e por `.shadow-theme`, **nunca era definido**: esses painéis não tinham sombra. | A direção (`bottom`, `center`, `top`, `bottom-right`, `dynamic`, esta seguindo o ponteiro) vira a sombra do cartão e a sombra em camadas; `layeredShadows` multiplica a opacidade das duas camadas (0 apaga, 1 é o desenho de sempre); `--dynamic-shadow` existe e espelha a sombra em camadas. **A paleta de busca e a busca do cromo passam a ter sombra.** |
| `colorDepth` e `colorVariation` emitiam variáveis que ninguém lia. | Moldam o hover e o active de toda cor com variantes: a profundidade afasta ambos da cor base (fator `1 ± 0,1 × depth`) e a variação abre o matiz entre eles (8° por passo). Em 1 e 1, o desenho é o de sempre. |
| `colorPalette`, `borderRadiusSm`, `borderRadiusMd`, `borderRadiusLg`, `contrastCurve`, `scrollbarWidth` e `scrollbarThumbColor` eram oferecidos pelo painel e emitiam variáveis que nenhum CSS lia. | **Saem do schema**, fundidos no que desenha: a paleta é preset de três cores que já são tokens; o raio é `borderRadius` e os raios por componente; a curva de contraste é `globalContrast`, o único mecanismo de contraste que o CSS tem; a largura e a cor da barra de rolagem são `scrollWidth` e `scrollThumbColor` (os temas embarcados escreviam os dois pares com o mesmo valor). O valor salvo é descartado com o aviso de valor fora do contrato e vale o padrão. A entrada `scrollbarStyle` do manifesto, que nunca teve token, sai também. |

**O que fazer:** quem salvou um dos sete tokens acima não precisa fazer nada (o aviso some ao regravar o tema); quem
quer o raio, a barra de rolagem ou o contraste que eles prometiam define `borderRadius`, `scrollWidth`/`scrollThumbColor`
ou `globalContrast`. Quem tinha uma textura "na primária" e quer o desenho de antes define `textureColor` igual à primária.
Um teste seu que fixava o `box-shadow` do painel de busca como `none`, ou o `backdrop-filter` de um cartão `sleek` como
`none`, lê o valor novo.

O `token-reader:check` passa a olhar o schema inteiro, não só o que o manifesto cita; os tokens que o escopo novo
revelou sem leitor estão declarados, com o motivo, na `ALLOWLIST` do próprio gate.

### O schema que o painel oferece desenha: 37 tokens ganham leitor, duas famílias de movimento viram uma e 27 saem do schema

**Classificação: MAJOR (sai na 8.0.0).** Tokens saem do schema (o tipo `SarakDesignTokens` perde 27 chaves, de 434 para
407), a opção `3d-tilt` de `cardHoverStyle` sai, e controles que o painel já oferecia passam a mudar a tela de todo
tema que os carregava (valor persistido vence o padrão, então quem tinha um valor salvo passa a vê-lo desenhar).
Nenhum nome saiu do barril público.

**O que passa a desenhar** (cada um, no componente que o rótulo nomeia; o valor padrão reproduz o desenho de antes, salvo
onde a coluna da direita diz o contrário):

| Token(s) | Onde desenha | Diferença no padrão |
|---|---|---|
| `cardHeaderBg`, `cardHeaderBorder`, `cardHeaderPadding`, `cardFooterBg`, `cardFooterBorder` | `SarakCard.Header` e `SarakCard.Footer` (as peças de composição; os cartões de domínio desenham o próprio cabeçalho) | Os padrões do schema passam a ser os que reproduzem o desenho (transparente, sem linha, sem padding); os 14 temas, que carregavam `rgba(255,255,255,0.03)` e afins, passam a ver o cabeçalho tingido |
| `cardHoverTranslate`, `cardHoverGlowIncrease`, `cardHoverStyle` | o **cartão interativo**: o que traz `data-sx-card-interactive="true"` (`SarakTitleCard`, `SarakImageCard` e o `SarakCard` com a nova prop `interactive`). `lift`, `glow-only` e `expand` valem só para ele; cartão contêiner (chat, matriz, formulário, `SarakCard` sem a prop) não se move nem brilha | Os cartões que subiam (`SarakTitleCard`, `SarakImageCard`) seguem subindo; nenhum outro passa a subir. O aumento de brilho padrão passa de 0,2 para 0 |
| `cardActionBtnPrimaryBg`, `cardActionBtnHoverBg`, `cardActionBtnText`, `cardActionBtnBorderRadius`, `cardActionBtnPadding` | o botão do `SarakActionCard` | Os padrões deixam de ser cian fixo e seguem a cor primária do tema; o raio tem valor próprio e deixa de seguir `btnBorderRadius` e os cantos assimétricos do botão |
| `cardSearchBgFocus`, `cardSearchPlaceholderColor`, `cardSearchTextFocusColor` | o campo do `SarakSearchCard` | Os padrões seguem os tokens de campo |
| `inputPadding` | `SarakInput`, `SarakSelect`, `SarakTextarea` (e os campos derivados) | Padrão 12 → 16 (o que `py-4` desenhava) |
| `tooltipRadius`, `tooltipBg`, `tooltipTextColor`, `tooltipBorderColor` | `SarakTooltip` | Raio padrão 4 → 6 (o que `rounded-md` desenhava); as três cores passam a ter padrão que reproduz o desenho (superfície, título e borda do tema) e os temas que as declaravam passam a vê-las |
| `modalOverlayBlur`, `modalOverlayColor`, `colorBgModal` | véu e painel do `SarakModal` | `colorBgModal` padrão passa a `var(--theme-surface)`; o véu do modal passa a ler `modalOverlayColor` (0,4 de opacidade no padrão; antes um preto fixo a 0,6) |
| `zIndexToast` | pilha do `SarakToast` | Padrão 2000 → 9000 (a camada em que a pilha já desenhava) |
| `tableZebraStriping`, `tableBorderRadius` | `SarakTable` e `SarakDataTable` (listras); contêiner da `SarakTable` (raio, que entra pelos cantos do cartão porque `[data-sx-texture] .card` o escreve com `!important`) | `tableBorderRadius` passa a ser responsivo (8 no celular, 12 acima); um tema com `cardBorderRadius` ≠ 12 vê a tabela em 12 |
| `btnGhostHoverBg`, `btnNeonPulseSpeed`, `btnStyleType` `cyberpunk` | botão `ghost`, pulso do neon, estilo wireframe | `btnNeonPulseSpeed` padrão 1,5 → 0 (o neon sempre foi estático; só pulsa quando o tema pede) |
| `statusGlowBlur` | `SarakBadge` nas variantes de status (a lib não tem `SarakStatus`) | Padrão 8 → 0 |
| `identityPadding`, `identityFontFamily`, `identityFontWeight`, `identityTracking` | nome da marca do cromo (`ChromeBrand`, `SarakShellNav`) | Padrões passam a ser o que a marca desenhava (padding 0, fonte de títulos, 700, -0,025 em). O controle de `identityFontFamily` no painel oferece o item "Fonte de títulos do tema (padrão)" e as fontes do tema |
| `colorBgLayer2`, `textSmoothing`, `vignetteSoftness`, `bgNoiseAnimation`, `aiGlowColor` | terceira mancha da malha de fundo; `-webkit-font-smoothing`; parada da vinheta; animação do grão; indicador "pensando" dos dois chats | `colorBgLayer2` padrão passa a ser a primária; `bgNoiseAnimation` padrão 1 → 0 (grão estático, como sempre foi); `aiGlowColor` padrão deixa de ser cian e segue a primária; `textSmoothing` ligado só tem efeito no macOS |

**O movimento passa a ter uma família só (`motion*`).** `animInstant`, `animFast`, `animNormal`, `animSlow`, `easeMain` e
`easeOut` saem; os leitores migraram (`transition-sarak`, botão, campo, cartão, `SarakAccordion`, `SarakDrawer`).
`motionDurationInstant` governa o aperto (`:active`) de botão e cartão, `motionEaseIn` a saída do modal, do véu e da paleta
de busca, `motionStaggerDelay` a cascata das linhas da tabela e das barras do gráfico. **Correção que vem junto:**
`--duration-fast|normal|slow` eram `calc(0.3s * 1s)`, inválidas, e toda transição que as usava caía a 0 s; agora valem o
tempo do token. Diferenças no padrão: a gaveta passa de 500 ms para 600 ms, a curva de saída do aperto muda de
`cubic-bezier(0.4,0,0.2,1)` para `(0,0,0.2,1)`, e o tema `blueprint-protocol` passa a usar a curva `motionEaseMain` que já declarava.

**O que se funde** (o valor salvo cai no padrão do destino): `formLayoutDirection` → `formLabelPosition`;
`layerElevationFactor` → `layeredShadows`; `matrixSearchBg` → tokens de campo (a busca da matriz é um `SarakInput`).

**O que sai** (sem leitor, e sem componente que o rótulo nomeie): `aiPanelBg`, `identityRedirectUrl` (o link da marca é do
consumidor), `industrialRegistry`, `inputSuccessColor` (nenhum campo tem estado de sucesso), `layout` (as três opções nunca
tiveram regra; a estratégia de grade é `layoutGridTemplate`; a chave continua aceita no payload) e as peças internas do
painel da lib `managementGroupDescMaxWidth`, `presetCardHoverShadowBlur`, `presetCardHoverShadowSpread`, `devicePhoneWidth`,
`kbdMinWidth`, `themeDropdownMaxHeight`, `visualPerspective`, `visualTranslateOffsetSm`, `visualTranslateZMd`,
`visualDotGridSize`, `visualOrbBlur`. A opção `3d-tilt` de `cardHoverStyle` sai (o tema `nebula-space` passa a `expand`).
O desfoque do cartão passa a ter um nome só: `--sarak-card-backdrop-blur` (o alias `--sarak-card-blur` deixou de ser emitido, e `--sarak-glass-blur` é só de `glassBlur`: antes `cardBackdropBlur` a escrevia também e o último na ordem vencia). `layerBackdropBlur` e `layerBackdropOpacity` saem fundidos em `modalOverlayBlur` e `modalOverlayColor`: nenhum componente lia o véu das camadas.

**Também passam a valer:** `borderStyle` nos cartões (a moldura sólida e o escopo de design não fixam mais `solid`); os tokens de cor do cartão de busca, que o campo vencia por classe utilitária; o movimento reduzido alcança o grão de ruído, que mora no `::before` do próprio `html`; o aperto de `SarakButton` e `SarakIconButton` dura `motionDurationInstant`. `SarakCard` ganha a prop `interactive` (aditiva).

**O que fazer:** quem salvou um dos tokens que saem não precisa fazer nada (o aviso some ao regravar o tema). Quem tinha
`cardHoverStyle: '3d-tilt'` volta a `lift`. Um teste seu que fixava o cabeçalho de `SarakCard` sem fundo ou a tabela com raio
fixo lê o valor novo. O `token-reader:check` fecha com a exceção vazia: todo token do schema tem leitor, e o que o motor
lê por tabela ou passagem direta é declarado no próprio leitor (`@sarak-token-reader`) e provado por teste por opção.

### O motor deixa de impor o cartão: o raio, a borda, o desfoque e a transição do componente vencem; o eco e o movimento reduzido continuam vencendo o cartão

**Classificação: MAJOR (sai na 8.0.0).** Nenhum nome saiu do barril público nem mudou de tipo. A mudança é de
cascata: um bloco do motor escrevia, com `!important` e a partir do `.sarak-design-scope` (que envolve tudo), raio,
fundo, borda, recorte e transição em todo `.card`, `.sarak-card` e `.bg-theme-card`, e outro apagava o fundo de todo
`<main>`, `<section>` e `<article>`. Por isso o raio de `catalogSectionRadius`, o fundo do Kanban, o hover de borda
do cartão e a duração de `motionDuration*` nunca chegavam à tela, e o modo eco não tirava o desfoque do `.sarak-card`.

| Antes | Depois |
|---|---|
| `rounded-[…]`, `border-2`, `backdrop-blur-…` e `transition-…` num cartão perdiam para o motor. Só a variável do canto (`--sarak-card-radius-*`) chegava. | O raio, a largura e o traço da borda, o desfoque e a transição do cartão moram na subcamada `components.sarak-elements`, **antes** das utilitárias: **a classe e o `style` do componente vencem**; sem classe, o padrão do tema vale como antes. |
| A superfície do cartão sob o tema (fundo translúcido, borda com opacidade) e o recorte geométrico eram `!important`, o que também zerava o `background-image` do componente (o atalho `background`). | Seguem do tema, **sem `!important`** e em `background-color`/`border-color`: o `style` inline do componente e o `background-image` dele coexistem com a superfície. |
| `.sarak-card:hover { border-color }` nunca aparecia. | Aparece: é a borda de hover do cartão (a moldura `cyber`/`glow`/`none`, escolhida por token, continua vencendo). |
| O reset de `main`/`section`/`article`/`.sarak-module-container` era `!important` e deixava transparente o fundo de qualquer um — o Kanban (colunas e cartões) e o do consumidor. | É o padrão transparente, sem `!important`: **o fundo que o componente ou o consumidor escreve aparece.** Sem fundo próprio, segue transparente. |
| O modo eco cortava o desfoque só do `.bg-theme-card`; o `.sarak-card` sob o material `frosted` (o padrão) seguia desfocado. `prefers-reduced-motion` perdia para a transição do cartão. | O eco corta o desfoque de `.sarak-card`, `.bg-theme-card` e `.card`; o movimento reduzido (pelo token e pela preferência do sistema) vence a transição do cartão. |
| A transição do cartão era `all 0.3s` e `transform`/`box-shadow` 0,4 s, literais; o brilho do cartão e a camada de textura 0,5 s; `main`/`section` e os títulos 0,4 s; botão e campo 0,2 s. | Leem `--duration-normal`/`--duration-fast`/`--duration-slow`, que `motionDuration*` emite: **o tema passa a mandar na duração.** **No tema padrão**, `transform` e `box-shadow` do cartão sem tema montado passam de 0,4 s a 0,3 s, o brilho e a camada de textura de 0,5 s a 0,6 s, e `main`/`section` e os títulos de 0,4 s a 0,3 s; botão e campo seguem em 0,2 s. |
| `aurora-classic` fixava `opacity: 0.7 !important` e as cores `#8b5cf6`/`#06b6d4`. | A opacidade lê `textureOpacity`/`cardTextureOpacity` (a reserva é o padrão do token, 0,1) e as cores leem `--theme-secondary`/`--theme-accent`. |

**O que não muda:** a COR do fundo e da borda do cartão continua do tema quando o componente não escolhe outra. (Que
a classe `bg-*`/`border-*` e o `hover:bg-*` do componente passam a vencer a superfície do tema é a nota seguinte, do
mesmo MAJOR.)

**O que fazer:** quem escreveu `rounded-*`, `border-2` ou `transition-*` num cartão e via o motor vencer passa a ver
a própria classe; a que não quer, a remove. Um teste seu que lia o `border-radius` ou o `transition` de um
`.sarak-card` lê o valor novo.

O `css-important:check` passa a barrar `!important` visual em seletor amplo do motor (`src/styles/`): nenhuma
declaração de fundo, borda, raio, sombra, filtro, opacidade, transição, recorte ou cor vence a classe do componente,
salvo o modo eco, o movimento reduzido, o fundo do `body` e a escolha explícita de token por atributo com valor.

### Uma variável, um dono: o raio mestre chega aos cantos, as semânticas que dividiam um nome ganham nome próprio, todo nome lido existe e toda reserva é o padrão do token

**Classificação: MAJOR (sai na 8.0.0).** Nenhum nome saiu do barril público nem mudou de tipo; o campo opcional
`exceptionOf` entra em `SarakDesignToken`. Mudam as variáveis CSS que o motor escreve (algumas deixam de existir ou
mudam de valor) e a leitura sem Provider.

| Antes | Depois |
|---|---|
| `cardBorderRadius` e `btnBorderRadius` escreviam os quatro cantos e `cardRadiusTL…BR`/`btnRadiusTL…BR` os reescreviam **sempre**, com o próprio padrão, e vinham depois: o slider mestre não tinha efeito. | O mestre escreve os quatro cantos; o canto é **exceção** (`exceptionOf`) e só escreve quando o tema o declara com valor diferente do padrão do schema. Vale nos dois modos de injeção. Os temas embarcados deixaram de repetir o canto igual ao mestre; os que têm cantos diferentes do mestre seguem como estavam. |
| `--radius-theme`, `--theme-gap`, `--theme-border-width` eram escritos por dois tokens (o sistema e o cartão); `--theme-surface` e `--theme-card-border`, idem; quem vencia dependia do modo e da ordem. | Um dono cada: `--radius-theme` é de `borderRadius` (o do cartão é `--sarak-card-radius`); `--theme-gap`, de `layoutGap` (o padding do cartão é `--sarak-card-padding-md`); `--theme-border-width`, de `borderWidth` (a do cartão é `--sarak-card-border-width`); `--theme-surface` e `--surface-color`, de `surfaceColor`; `--theme-card-border` é só a variante derivada do fundo do cartão (a cor da borda é `--sarak-card-border-color`/`--theme-border`). |
| `--theme-surface` era o fundo do cartão (translúcido por padrão): lido por `SarakBadge`, `SarakModal`, `SarakTabs`, `SarakTooltip` e o painel. | É a cor de superfície do tema (`#1e293b` no padrão): o fundo do modal, da dica e da aba ativa **deixa de ser translúcido** e passa a seguir `surfaceColor`. As variantes `--theme-surface-rgb`/`-bg`/`-border`/`-10`… deixam de ser emitidas (ninguém as lia). |
| `--sarak-bg-base` era escrito por `colorBgBody` e por `bgBaseColor` (vencia este). | Só `bgBaseColor`. O valor na tela não muda. |
| `validateDesign` forçava todo `borderRadius` que não fosse número a `12`: o raio do sistema responsivo (do tema ou do painel) nunca chegava a `--radius-theme`. | Só a ausência recebe o piso: o padrão do schema (8 / 10 / 12 por faixa) passa a valer, e o responsivo do tema também. |
| Nomes lidos que nada emitia: `--sarak-bg-body-rgb` e `--sarak-sidebar-bg-rgb` (por isso `--bg-body-rgb` era **sempre** o claro `248, 250, 252`), `--sarak-max-width`, e dez nomes nos mocks do painel. | Os dois canais são emitidos; `.sarak-safe-container` lê `--sarak-max-content-width`; os mocks leem as variáveis reais. |
| Reservas `var(--x, F)` contra o padrão do token: **298 leituras**, 137 delas da primária (`#3b82f6` contra `#00f2ff`), mais fundo, texto, borda, tipografia, espaçamento, textura. | A reserva é o padrão do token (o piso mobile-first, no responsivo). **Sem Provider** o que se vê é o tema padrão: primária `#00f2ff`, corpo `#050505`, texto `#ffffff`, títulos em `Outfit`, espaçamento de 8 px, brilho do cartão a 0,05. Com Provider nada muda — a variável existe. |
| `BEZIER_CURVES` gravava chaves sem `--` (`standard`…): `setProperty` sem efeito. | Gravadas como `--sarak-bezier-standard`/`-decelerate`/`-accelerate`/`-sharp`. |
| A pré-visualização de tema (`PresetCard`) lia chaves de tokens responsivos que nunca entram em `variables` e usava uma cor como largura de borda. | Lê o valor do tema (ponto `desk`) e o canto só quando declarado. |

**O que fazer:** quem lia `--radius-theme` esperando o raio do cartão passa a ler `--sarak-card-radius`; quem lia
`--theme-surface` esperando o fundo do cartão lê `--sarak-card-bg`/`--theme-card`. Quem tinha um canto salvo (`cardRadiusTL`
igual ao antigo mestre) e quer que o mestre volte a valer remove o canto do tema. Um teste seu que fixava a primária
sem Provider em `#3b82f6` lê `#00f2ff`.

O `variable-contract:check` passa a barrar, em `src/`, variável com mais de um dono (salvo mestre + exceção declarada),
nome lido que nenhum token, CSS ou código escreve, e reserva diferente do padrão do token.

### O componente lê o token que o nomeia: botão primário e secundário, sombra e superfície do cartão, tabela, sobreposições, alternador, modal, chat e `AuthForm`

**Classificação: MAJOR (sai na 8.0.0).** Nenhum nome saiu do barril público nem mudou de tipo. Mudam a cor do
botão, a superfície e a sombra do cartão, e valores que eram fixos em componente. O padrão visual muda em **dois**
pontos, ambos marcados abaixo; o resto é o tema passando a mandar.

| Antes | Depois |
|---|---|
| O botão primário desenhava `--sarak-primary-color` com texto `--text-muted` (`#94a3b8`): reprovava contraste em 27 das 28 combinações tema × modo (pior 1,06), e `btnPrimaryBg`/`btnPrimaryText` não tinham leitor na lib — só o painel os lia. | Lê **`btnPrimaryBg`** e **`btnPrimaryText`** (padrão `#00f2ff` e `#000000`), no `SarakButton` e no `SarakIconButton`. No `borderline`, o contorno segue a cor primária e o hover preenche com o par do token. **Diferença no tema padrão: o texto do primário passa de cinza a preto sobre o ciano — é a correção de legibilidade.** |
| O secundário desenhava a cor do cartão; `btnSecondaryBg` só valia nos estilos `neon` e `frosted`, e o `SarakIconButton` os fixava em `rgba(0,0,0,0.4)`/`rgba(255,255,255,0.05)`. O hover usava texto mudo sobre a primária. | Lê **`btnSecondaryBg`** em todo estilo (o `cyberpunk` segue sendo contorno sem preenchimento, por desenho). **Diferença no tema padrão: o secundário passa da cor do cartão a 5% de branco** — o valor do próprio token. O hover usa o par primário legível. |
| `cardShadow` não tinha leitor: declarar uma sombra não mudava nada, e a descrição do schema prometia que `"none"` desativava a sombra. | Declarada, **é a sombra do cartão** (repouso e hover; o brilho interno continua somado). `none` — o padrão — não declara nada e deixa a sombra composta pelos tokens `cardShadow*` valer. Para tirar a sombra, zere os tokens numéricos. |
| A superfície do tema (fundo e cor da borda) vencia, por camada, a `bg-*`/`hover:bg-*`/`active:bg-*`/`border-*` do componente e do consumidor; os cartões da lib repetiam `bg-[var(--color-theme-card)]` e `border-[var(--border-color)]`. | A superfície mora na subcamada `components.sarak-elements`, **antes** das utilitárias: **a classe de fundo, o `hover:bg-*`, o `active:bg-*` e a cor de borda do componente e do consumidor vencem.** Os cartões da lib deixaram de repetir a classe de fundo e de cor de borda — a superfície vem do tema, de um lugar só. O recorte geométrico (`clip-path`) segue do tema. |
| `cardSurfaceOpacity` escrevia `opacity` no cartão inteiro (o texto saía a 80%) **e** na cor do fundo: o efeito vinha dobrado. | Age só na superfície: o cartão fica opaco, o fundo é translúcido — também sem tema montado. **Diferença no tema padrão: o texto e o conteúdo do cartão deixam de sair a 80% de opacidade.** |
| `cardHoverStyle: 'glow-only'` não acrescentava brilho (e o `SarakImageCard` ainda tirava a sombra). | Acende: a camada de brilho vai a opacidade plena e o cartão ganha um halo na cor primária no hover. |
| `.bg-theme-card:active` fixava o fundo na camada final (vencia `active:bg-*`), e `.bg-theme-card { box-shadow }` nunca valia (a regra do cartão vinha depois). | O fundo ativo é padrão e cede à classe; a declaração morta saiu. |
| A tabela desenhava `bg-white/5` no cabeçalho, `hover:bg-white/[0.02]` e `border-white/[0.02]` na linha e `bg-white/5 rounded-md` no esqueleto. | Leem `tableHeaderBg`, `tableRowHoverBg`, `tableBorderColor` e `skeletonRowRadius` (4 px; era `rounded-md`). |
| As sobreposições do `SarakAnalyticalPage` e do `SarakSpotlight` eram `bg-black/50 backdrop-blur-sm`. | Leem `modalOverlayColor` e `modalOverlayBlur` (o Spotlight, `searchBackdropBlur`). **No tema padrão o véu passa de 50% a 40% de preto**, o valor do token. |
| O polegar do `PremiumSwitch` era `bg-white`; os botões do modal trocavam o raio do botão por `rounded-md`; as etiquetas do chat eram `rounded-md` e a bolha `shadow-xl`; o aviso, o erro e o fundo do `AuthForm` eram `amber`/`red`/`emerald`; a etiqueta de rascunho dos cartões era `bg-black/60` com sombra ciano fixa; a sombra do `SarakActionCard` era usada como cor de texto. | Leem `switchThumbBg`, `btnBorderRadius`, `chatBubbleRadius` (e a sombra dinâmica do tema), `statusWarningColor`/`statusErrorColor`/`statusSuccessColor`, a cor de cartão e `cardGlowColor`, e a cor primária. |
| 16 durações de transição eram literais (`duration-200…700`, `120ms`) em alternador, caixa de seleção, rádio, barra de progresso, cromo, brilho dos cartões, imagem e lista de mensagens. | Leem `--duration-fast`/`-normal`/`-slow`, que `motionDuration*` emite. **No tema padrão:** 500 ms e 700 ms viram 0,6 s (brilho dos cartões, camada de brilho da imagem, entrada do estado vazio do chat) e o Kanban passa de 0,12 s a 0,2 s. As animações de `framer-motion` (`duration` em JavaScript) seguem fixas. |
| `flowGridStyle: 'dots'` só era lido pelo painel. | O `SarakFlowEngine` lê as duas opções por nome. |

**O que fazer:** quem usava `bg-*`/`hover:bg-*` num cartão e via a superfície do tema vencer passa a ver a própria
classe; quem a escrevia só para repetir a cor do tema pode remover (o `style` inline continua valendo). Quem lia, em
teste, o texto do primário (`#94a3b8`) lê `#000000`; quem lia a `opacity` do `.sarak-card` lê `1`. Tema que declarava
`btnPrimaryBg`/`btnPrimaryText` e não os via passa a vê-los: confira o contraste do par.

O motor passa a emitir o atributo `data-sx-<kebab>` também para os tokens de tipo `text` (`cardShadow`, `inputShadow`,
`sidebarShadow` e `motionEaseMain`/`Out`/`In`): é o que deixa o CSS distinguir uma sombra declarada de `none`. Seis
atributos novos no `html`/`body` (e na ilha, no Modo Embarcado); nenhum é lido por regra do consumidor.

O `token-reader:check` deixa de contar o painel de customização como leitor de token que tem componente na lib: o
painel só conta para os tokens declarados em `PANEL_OWN_TOKENS` (a geometria da própria pré-visualização e os que a
lib ainda não tem componente para consumir), com o motivo de cada um.

### O modo claro é legível: branco e preto fixos saem dos componentes, o texto sobre cor sólida é escolhido pelo contraste, e os temas embarcados passam nos pares que os componentes desenham

**Classificação: MAJOR (sai na 8.0.0).** Nenhum nome saiu do barril público nem mudou de tipo. Mudam a cor do texto
sobre cor sólida, o realce de hover e de moldura nos dois modos, o valor de alguns tokens dos temas embarcados e a
duração das animações de `framer-motion`. O padrão visual muda em **dois** pontos marcados abaixo.

| Antes | Depois |
|---|---|
| ~45 lugares escreviam branco ou preto translúcido fixo (`bg-white/5`, `border-white/10`, `bg-black/10`, `text-white/40`, `rgba(255,255,255,…)`): sob um tema claro o realce sumia, e o texto de rótulo ficava ilegível. | O realce deriva da **cor de texto do tema**: as utilitárias `bg-theme-tint`, `bg-theme-tint-hover`, `bg-theme-tint-strong` (e `border-`/`text-`) são `color-mix` de `--text-main` a 5%, 10% e 20%. No escuro dá o mesmo branco translúcido; no claro, o escuro translúcido. **Diferença no tema padrão:** o cabeçalho e o rodapé do modal e a bandeja das abas em pílula, que eram preto a 10%, passam a ser a cor de texto a 5%. |
| O texto sobre cor sólida era fixo: `text-white` no badge sólido primário e secundário, no botão de perigo e de sucesso, na aba ativa em pílula e no envio do chat; `text-black` nos badges de status sólidos; branco a 90% na bolha do usuário. | O motor escolhe, para cada cor sólida, o texto de **maior contraste WCAG** entre `#020617` e `#ffffff` e o emite: `--theme-on-primary` (que era "claro se a luminosidade HSL passa de 55") e as novas `--sarak-on-secondary`, `-accent`, `-success`, `-error`, `-warning`, `-info`, `-chat-user`, `-muted`, `-overlay` e `--sarak-on-surface`. A escolha nunca fica abaixo de 4,5:1 sobre cor opaca. Cor que não é literal (`var()`, `color-mix`) não emite a variável, e a reserva do componente vale. **Diferença no tema padrão:** o texto do botão de perigo e de sucesso e dos badges de status sólidos passa de branco a `#020617` (sobre `#ef4444` e `#10b981` o escuro tem mais contraste que o branco), e o do badge sólido primário (`#00f2ff`) de branco a escuro. |
| O badge suave pintava o texto com a cor crua do status/da marca (reprovava 4,5:1 sobre o corpo ou o cartão em 17 de 28 combinações). | O texto é `color-mix(<cor> 40%, --sarak-on-surface)`: a cor misturada ao texto de maior contraste sobre o corpo. A matiz continua, mais escura no claro e mais clara no escuro. |
| `.sarak-card:hover { border-color }` na camada final vencia `hover:border-*`. | O hover de borda do cartão é padrão na subcamada que cede: `hover:border-*` do componente e do consumidor o vencem (a moldura `cyber`/`glow`/`none`, por token, segue vencendo). |
| A bolha do assistente do `SarakChatEngine` em vidro usava `rgba(0,0,0,0.4)` e branco; o estilo `solid` da bolha do `SarakChat` pintava o texto na cor do fundo; o `SarakFlowEngine` fixava nós, controles, mini-mapa e arestas em branco sobre preto; o `SarakIconButton` `frosted` fixava borda branca e sombra preta. | Leem a superfície, a borda e a cor de texto do tema (`--sarak-card-bg`, `--sarak-card-border-color`, `--text-main`), com a bolha sólida em `--theme-on-primary`. |
| Barras de rolagem (`.custom-scrollbar-*`) em branco translúcido fixo. | Cor de texto do tema a 5%–60%. |
| A classe quebrada `hover:border-[var(--border-color,#334155)]-primary/30` do `SarakCatalogGrid` não gerava CSS; o brilho do `PremiumSwitch` ligado era `rgba(var(#hex),0.3)`, inválido. | Corrigidos: a borda de hover do catálogo e o brilho do alternador aparecem. |
| As animações de `framer-motion` (`SarakExpandableCard`, `SarakExpandableMatrix`, `SarakPageTransition`, `SarakImageCard`, `AuthForm`, `AuthHero`, `SarakTooltip`, indicador de digitação do chat) tinham `duration` literal (0,15 s a 0,8 s). | Leem `motionDurationFast`/`Normal`/`Slow` por `useMotionTokens().durations`, e o `reducedMotion` do tema as zera. **No tema padrão:** a entrada do `AuthHero` passa de 0,8 s a 0,6 s (a do `AuthForm` segue em 0,6 s), o `SarakImageCard` de 0,4 s a 0,3 s, o tooltip de 0,15 s a 0,2 s. |

**Temas embarcados — 84 valores trocados** (só a luminosidade, mantidas a matiz e a saturação) para os pares que os
componentes desenham passarem de 4,5:1 nos 14 temas × 2 modos: `primaryColor` quando é texto (botão `ghost`/`outline`,
link) sobre o corpo e o cartão; `statusSuccessColor`, `statusErrorColor` e `inputErrorColor` quando são texto;
`btnSecondaryBg` (mais translúcido) em `industrial-terminal`, `kinetic-flow` e `blueprint-protocol`; e as contrapartes
que herdavam a cor do modo nativo — `sidebarHoverColor`/`topbarHoverColor` do `minimalist-airy` no escuro e
`matrixItemBg` do `neumorphic-mobile` no escuro. **Tema salvo por usuário não muda** (valor persistido vence o padrão).

**O que fazer:** um teste seu que lia `color: rgb(255, 255, 255)` num botão de perigo, num badge sólido ou na bolha do
chat lê agora o texto escolhido pelo contraste. Quem escreveu `bg-white/5` ou `text-white` num componente próprio e
o quer legível no claro usa `bg-theme-tint` e `text-[var(--text-main)]`, ou `text-[var(--sarak-on-error)]` sobre a cor
de status.

O `verify_contrast.ts` passa de 36 a **67 pares**, os que os componentes desenham (texto sobre cor sólida, badge
suave, erro de campo, hover de navegação e de tabela, item de matriz, botão secundário), e o `fixed-translucent:check`
passa a barrar, em `src/components/`, branco/preto translúcido e `text-white`/`text-black` fixos.

### O painel grava o que mostra e o tema declarado é o tema mostrado: slider responsivo, `select`, cor com alfa, controle por tipo, faixa numérica acusada, cinco tokens saem do schema

**Classificação: MAJOR (sai na 8.0.0).** Saem cinco chaves do tipo `SarakDesignTokens` (e do schema, do catálogo e
dos temas): `securityShieldGlow`, `securityPulseSpeed`, `trackingSubtle`, `typeScaleDisplay` e `cardHoverLift`.
`identityTracking` muda de unidade (`em` → `px`). A faixa de seis tokens se alarga, o `id` das opções de
`cardTitleFontWeight` passa a ser o próprio valor, e valores de tema que a validação cortava em silêncio mudam
para o que o tema declarou ou para o que a tela já mostrava.

| Antes | Depois |
|---|---|
| 37 tokens responsivos (`cardBorderRadius`, `btnBorderRadius`, `sidebarWidth`, `h1Size`…) mostravam `NaN` no Command Center, e o primeiro arraste gravava um escalar e perdia `mob`/`tab`/`desk`. | Um slider por ponto (Desktop, Tablet, Mobile); o valor gravado é sempre o objeto completo. Escalar salvo vale para os três e é promovido ao primeiro toque. |
| O sufixo era `px` quando o token não declarava unidade: "0.6px" de opacidade, "9000px" de camada, "600px" de peso (48 tokens). | O sufixo é a unidade declarada pelo token; sem unidade, o número vem cru. |
| `cardTitleFontWeight` oferecia `id 'black'` com `value '900'`: o controle gravava `'black'` e a validação descartava. | O controle grava o `value` da opção; `id` e `value` do peso são o mesmo número. Opção só com `id` segue valendo. |
| `text` (`cardShadow`, `inputShadow`, `sidebarShadow`, `motionEaseMain/Out/In`) e `image` (`globalBackgroundImageUrl`) caíam em "Tipo não suportado" no Command Center. | Todo tipo de `SarakTokenValueType` tem controle nos dois despachantes (Command Center e aba de tema). |
| O controle de cor convertia `rgba()` em hex sem alfa e `var()` em `#ffffff` na primeira edição. | O seletor preserva o alfa; o campo de texto aceita `var()` e `color-mix()` e só grava o que a validação aceita; há um controle de opacidade. `color-mix(in <espaço>, …)` passa a ser cor válida no tema. |
| Com o canto de raio declarado num tema salvo, mover o raio mestre não mudava o canto, sem aviso. | O controle mostra "N de 4 cantos têm valor próprio" e devolve o canto (ou todos) ao mestre. |
| O painel e as pré-visualizações escreviam branco/preto translúcido fixo (447 lugares): sob um tema claro sumiam. | Seguem o modo do tema que mostram (`bg-theme-text/5`, `text-theme-text`, `text-theme-on-primary`); o `fixed-translucent:check` cobre `src/features/`. |
| A validação de cor de tema aceitava função de recurso: `var(--a, url(x))`, `image-set()`, a barra invertida que escreve `url` por escape, e `color-mix(…, url(x))` — o navegador buscaria o recurso. | Nenhum valor de cor carrega `url`, `image`, `image-set`, `cross-fade`, `element`, `paint` ou `src` (qualquer caixa, com ou sem prefixo de fabricante) nem barra invertida, no `var()` e no `color-mix`; o valor é descartado com aviso. |
| `inputIconColor` valia `rgba(255, 255, 255, 0.5)`: o ícone do campo sumia sobre o fundo de um tema claro que não o declarava. | O padrão é `var(--text-muted)` (a cor de texto suave do tema, que muda com o modo); o par ícone × fundo do campo entra no verificador de contraste (68 pares). **Muda o padrão visual:** o ícone passa de branco a 50% para a cor de texto suave. |
| 41 valores de tema fora de `min`/`max` eram cortados sem aviso; padrões fora da própria faixa (`sidebarMaxWidth` mob 280 < 300, `zIndexToast` 9000 numa faixa implícita 0..100, `identityTracking` −0,025 fora do passo). | `auditTokenContract` e o `panel-contract:check` os **acusam**; o schema oferece as intenções dos temas e os temas embarcados cabem no contrato. |

**Intenções que o schema passa a oferecer:** duração de movimento `0` ("desligado": `motionDurationFast`,
`motionDurationNormal` e `motionDurationSlow` a partir de 0; antes 0,1 / 0,2 / 0,5); `colorDepth` a partir de 0;
`identityTracking` em **pixels**, de −2 a 8, padrão −0,5 px (o antigo −0,025 em, no corpo do nome da marca);
`sidebarMinWidth` até 400 e `sidebarMaxWidth` a partir de 240; `navActiveMarkerGlow` até 40;
`cardActionBtnBorderRadius` até 120; `zIndexSidebar` a partir de 10; `zIndexToast` ganha faixa (1000 a 9999).

**Temas embarcados — o que muda na tela:** a "pílula" (raio 9999) era cortada para o máximo do token e o tema agora
declara o máximo (nenhuma diferença visual); `zIndexTooltip` 100 (abaixo de qualquer modal) sai dos dois temas que o
declaravam e vale o padrão 9000; `colorVariation` 0 de `industrial-terminal` vira 1 (era cortado a 1). **Mudam de
fato:** `motionDurationSlow` de `synthwave-retro` (0,4), `kinetic-flow` (0,4), `data-terminal` (0,4), `golden-hour`
(0,4), `aurora-veil` (0,45) e `blueprint-protocol` (0,35) deixam de ser cortados em 0,5 s; `industrial-terminal`
passa a ter `motionDuration*` 0 (sem transição) e `colorDepth` 0 (hover e ativo sem variação de tom);
`identityTracking` de `synthwave-retro` (4), `kinetic-flow` (2), `golden-hour` e `blueprint-protocol` (1) é agora
esse número de pixels (era cortado em 0,5 em, que é grande demais para um nome de marca);
`sidebarMinWidth` 320 de `industrial-terminal`, `navActiveMarkerGlow` 30 de `kinetic-flow`, `sidebarMaxWidth` 260 de
`synthwave-retro` e `zIndexSidebar` 50 de `minimalist-airy` e `neumorphic-mobile` deixam de ser cortados;
`cardActionBtnBorderRadius` de `aurora-veil` passa do corte em 40 px para a pílula (120 px) — só difere num botão de
ação com mais de 80 px de altura. Os presets de botão e campo "pílula" (999) gravam 120.

**O que fazer:** quem lia `securityShieldGlow`, `securityPulseSpeed`, `trackingSubtle`, `typeScaleDisplay` ou
`cardHoverLift` de `useSarakUI().design` os perde (nenhum componente da lib os lia; só a pré-visualização do
painel): `cardHoverLift` é `cardHoverTranslate`. O valor salvo dessas chaves é descartado com aviso único. Quem
guardou `identityTracking` em `em` (ex.: `0.1`) o relê como pixels — reajuste. Tema próprio com `motionDuration*`
abaixo do mínimo antigo passa a ser respeitado.

O gate `panel-contract:check` trava: padrão do schema na faixa e na grade que o painel desenha, valor de tema
embarcado dentro do contrato numérico, todo tipo do schema com controle e opção com `id` igual ao `value`.

### O motor escreve cada variável por um canal só, a troca de tema não deixa o anterior, e o material, a moldura, a caixa do cartão e o aperto do botão passam a ceder à classe; `bg-theme-card` é só a cor; o tema chega às transições do Tailwind

**Classificação: MAJOR (sai na 8.0.0).** Nenhum nome saiu do barril público nem mudou de tipo. Mudam o que o motor
escreve no `html`/`body` (e na ilha), três regras de CSS que deixam de vencer a classe do componente, o sentido de uma
classe e o padrão de toda transição do Tailwind sem duração.

| Antes | Depois |
|---|---|
| O raio mestre escalar (o caso comum nos temas) escrevia os quatro cantos inline; o canto responsivo ia ao `<style>`, e o inline vencia: **o canto editado não aparecia**, e o mestre responsivo com canto escalar dependia do modo de injeção. | Uma variável, um canal: a variável de um canto declarado é escrita **só pela exceção**, qualquer que seja o formato de cada um (escalar inline, responsivo no `<style>`). O valor que o tema declara chega igual nos modos App e Embarcado e em cada ponto (mob, tab, desk). |
| A variável inline nunca era removida: trocar de tema (ou um token passar de escalar a responsivo) deixava o valor do tema anterior vencendo. | O injetor lembra o que escreveu em cada elemento e **tira o que o tema novo não escreve** (variáveis e atributos `data-sx-*`); o que o host gravou por fora não é tocado. |
| O material (`surfaceMaterial`, sempre ligado: `frosted` é o padrão) e a moldura (`borderType`) eram `!important` e venciam `bg-gradient-*`, `backdrop-blur-*`, `border-dashed`, `hover:border-*` e o `style`. | Moram na subcamada `components.sarak-elements` (`_card-materials.css`), **sem `!important`**: a classe e o `style` vencem; sem classe, o token vale. A moldura do `.border-theme` (classe `!important` por desenho) fica na camada final, por atributo com valor. |
| Preenchimento, sombra (e a sombra sob o ponteiro), recorte geométrico e `position` do `.sarak-card` moravam na camada final e venciam `p-*`, `shadow-*`, `hover:shadow-*`, `absolute`. | Moram em `components.sarak-elements`: a classe vence. O recorte é o `--sarak-card-clip-path` do token (`none` sem corte). |
| `.bg-theme-card` era a utilitária de cor **e** uma âncora de cartão inteiro (preenchimento de 24 px, sombra, raio, recorte, textura, `:active` que encolhia o contêiner). | É **só a utilitária de cor** (`--color-theme-card`). O cartão inteiro é `.sarak-card`; o contêiner do consumidor, `.card`. Nenhuma regra do motor mira `.bg-theme-card`. |
| O estado ativo de `button` fixava o `transform` com `!important` (vencia `active:scale-*`, o `style` e o `whileTap`); o recorte `is-geometric`/`data-geometric` usava 15 px fixos e um canto. | O aperto é padrão de elemento e cede (vale `--sarak-btn-active-scale`); o recorte geométrico morreu (nada o emitia a não ser `data-geometric`, que sai dos quatro cartões). |
| O sequestro do modo claro montava `!important` em TypeScript e repintava, no lightbox da lib, o contador e os botões (branco sobre preto) para a cor do tema: ilegível. | A folha é **sem `!important`**; o lightbox declara `data-sarak-own-palette` e nada dentro dele é repintado. O texto do hospedeiro com `text-white` segue repintado. |
| `transition-colors`, `transition-all`… sem `duration-*` rodavam a **150 ms** e na curva do Tailwind, e venciam o padrão de elemento que lê o token. | Leem `--default-transition-duration` = `motionDurationFast` (0,2 s no padrão) e `--default-transition-timing-function` = `motionEaseMain`. A classe com `duration-*`/`ease-*` continua decidindo. |

**Diferença no tema padrão:** a transição sem duração passa de 150 para 200 ms; um `p-*` ou `shadow-*` escrito num
`.sarak-card` (que perdia em silêncio) passa a valer — confira os componentes seus que levam as duas classes.

**O que fazer:** quem usava `bg-theme-card` esperando o cartão inteiro passa a `sarak-card` (ou `card`, no contêiner);
quem só queria a cor não muda nada e deixa de receber o preenchimento. Quem lia `data-geometric` de um cartão não o
encontra mais — leia `cardGeometricCut`. Um teste seu que lia o `transform` de um botão pressionado lê o valor do
padrão de elemento, e não mais o `!important`. Um componente seu que fosse repintado pela ponte do modo claro e
quiser sair dela põe `data-sarak-own-palette` na raiz.

O `channel-dispute:check` passa a barrar, no Anel 1, variável escrita nos dois canais ou com valor que não é o
declarado (em todo par mestre + exceção e formato) e variável inline órfã na troca de tema; o `css-important:check`
passa a barrar `!important` montado em string ou template de TypeScript em `src/`.

### O painel diz a verdade: descrição em todo controle, número com faixa, cor que não perde o alfa, tokens sem efeito ganham leitor, e o que ninguém lia ou escrevia sai

**Classificação: MAJOR (sai na 8.0.0).** Nenhum nome saiu do barril público nem mudou de tipo. Mudam o que o painel
mostra e grava, a faixa e o passo de nove tokens, o desenho padrão de três componentes (marca do cromo, selo, sidebar) e
nomes de CSS que nada escrevia.

| Antes | Depois |
|---|---|
| A `description` do schema só atravessava no ramo `boolean`: em 391 controles o `?` mostrava "Configuração granular para o parâmetro…". | Todo ramo dos dois despachantes (Command Center e aba de tema) a repassa; um teste abre o `?` de um token por tipo e formato em cada despachante. |
| O token `number` da aba de tema era um campo sem faixa que gravava `NaN` ao esvaziar. | É o mesmo slider do `slider` (faixa, passo, unidade). O `InputControl` numérico não grava o que não é número e leva o valor para `[min, max]`. |
| O seletor de cor mostrava branco (`#ffffff`) para `color-mix()`, `var()` sem reserva e `hsl()`, e perdia o alfa da reserva ao ser mexido. | Mostra a cor que o valor desenha (literal, `hsl()`, a que o navegador resolve, ou a reserva literal do `var()`), com o alfa. O texto segue sendo a verdade. |
| `cardShadowSpread` ia a 200 e `vignetteSoftness` a 200, e o CSS saturava em 100 e em 62,5: metade do slider era morta; a vinheta de `_theme.css` usava outro fator (1%). | `cardShadowSpread` até 100; `vignetteSoftness` até 60 (os temas `kinetic-flow` e `synthwave-retro`, que declaravam 100, declaram 60 — a vinheta de ambos satura igual). Os três leitores usam o mesmo fator (1,6%). |
| 13 valores de tema fora da grade do `step` (0,02 num passo de 0,05…) eram desenhados de um jeito e regravados de outro ao mexer. | O passo de `glassRoughness`, `shadowAmbientAlpha`, `shadowProjectionAlpha`, `scrollTrackOpacity`, `motionDurationFast`/`Normal` é 0,01; `motionDurationSlow` 0,05; `iconStrokeWidth` 0,25. Os valores dos temas ficam. A auditoria passa a acusar valor de tema fora da grade. |
| O catálogo tinha 7 tokens duplicados com descrições divergentes (valia a última). | Uma entrada por token. |
| `primaryColor` dizia "botões primários"; `textColorMaster`, "títulos"; `shadowIntensity`, "multiplicador de todas as sombras"; `bodySize`, "escala todos os textos"; `accentColor`, "badge novo"; 13 rótulos carregavam o valor padrão (`Escala Micro (7px)`). | Dizem o que o código faz (o fundo do botão primário é `btnPrimaryBg`; títulos usam `titleColor`; `shadowIntensity` é a opacidade do `.shadow-theme`; …). Os rótulos perdem o valor. |
| `btnStyleType: neumorphism` não tinha ramo de botão (saía matte sem sombra). | Tem: relevo suave em repouso, sombra interna sob o ponteiro, sem borda (`SarakButton` e `SarakIconButton`). |
| `identityAlignment`, `identityHoverEffect`, `glassSpecularity`, `glassRoughness`, `zIndexSidebar` e `badgeRadius` eram emitidos e nada os lia. | Têm leitor: a marca do cromo se alinha e reage ao ponteiro; o `.sarak-glass` ganha o brilho da quina e fosqueia; a sidebar empilha por `zIndexSidebar`; o selo lê `badgeRadius`. |
| `h1Weight`, `h2Weight`, `bodyWeight` e `headingTransform` (opções só com `id`) passavam o gate sem que nenhuma opção fosse conferida. | O gate lê o `id` quando falta o `value`; o leitor é declarado `direto`, com teste por opção. |
| Seletores por `data-perf-mode`, `data-performance`, `data-glass`, `data-font-scale`, `data-sx-theme`, `data-sx-surface` e `data-sx-card-texture-type="aurora-classic"` — nada escrevia esses atributos. A tabela de gráfico lia `--animation-speed` e o cartão expansível `--font-size-factor`; `--sarak-on-accent` era escrita e nunca lida. | Saíram. O modo eco é só a classe `sarak-eco-mode`; a duração da barra do gráfico é `motionDurationSlow`; `--sarak-on-accent` não é mais emitida. |

**Diferença no tema padrão — três pontos:** (1) o nome da marca do cromo **esmaece a 70% sob o ponteiro** (o padrão de
`identityHoverEffect` é `opacity`; antes não havia efeito); (2) os selos (`SarakBadge`) passam de `rounded-md` a **pílula
(99 px)**, o padrão de `badgeRadius` — a menos que o tema declare outro raio ou o selo use `pill`; (3) a barra do gráfico
anima em 0,6 s (era 0,75 s) e a sidebar ganha `z-index: 500`.

**O que fazer:** quem ligava o modo eco por `data-performance="eco"`/`data-perf-mode="eco"` passa à classe
`sarak-eco-mode`; quem lia `--sarak-on-accent`, `--sarak-surface-specular` ou `--sarak-surface-roughness` (nunca lidas
pela lib) lê `--sarak-accent-color`, `--sarak-glass-specularity` e `--sarak-glass-roughness`; quem usava `data-font-scale`
usa o token `bodySize`. Um teste que esperava duas entradas de `bgBaseColor` no catálogo espera uma.

O `variable-contract:check` passa a julgar a reserva do canal `-rgb` (antes qualquer lista passava), a de alias de
fachada e a do canal emitido fora do laço, e a não contar como dono a declaração sob seletor de atributo que ninguém
escreve; o `token-reader:check` lê o `id` da opção sem `value`; o `panel-contract:check` confere a grade do `step`.

### O texto que o componente desenha passa de 4,5:1 nos pares que faltavam, e o valor fixo que tinha token lê o token

**Classificação: MAJOR (sai na 8.0.0).** Nenhum nome saiu do barril público nem mudou de tipo. Mudam o texto de
quatro componentes (e o de dois estados de botão), a reserva de cor de 323 leituras em componente, dezoito valores de
tema e o desenho de alguns valores fixos que passam a ler o tema.

| Antes | Depois |
|---|---|
| O aviso e o erro do `AuthForm` (e o botão de sair do usuário) escreviam o texto CRU na cor do status sobre a própria tinta a 10–15%: de 1,0 a 4,4:1 em 16 e 18 dos 28 casos (14 temas × 2 modos). | O texto é a cor do status misturada ao texto de maior contraste sobre o corpo (40/60), como o badge suave. |
| O hover do botão fantasma e do contorno deixava o texto na cor primária sobre `btnGhostHoverBg` / a primária a 10% (de 3,6 a 4,4:1 em 12 e 20 de 28). | No hover o texto é a primária misturada ao texto de maior contraste (40/60); em repouso nada muda. |
| No estilo `cyberpunk` o fundo é transparente, mas o texto de primário, perigo e sucesso seguia `--sarak-on-*` (a cor "sobre a cor" caía sobre o cartão: 1,1:1 no `blueprint-protocol`). | O texto é a cor da própria variante (primária, erro, sucesso). |
| O botão de sair do usuário lia `--theme-error-bg` e `--theme-error-border` sem reserva (a tinta sumia sem Provider) e, no hover, `--theme-on-primary` sobre o vermelho. | A reserva é a do motor (`rgba(239,68,68,0.15)` e `0.25`) e o texto no hover é `--sarak-on-error`. |
| `--sarak-on-error` e `--sarak-on-success` tinham a reserva `#ffffff`; `--sarak-on-muted`, `#020617` — o motor calcula o oposto no padrão. | `#020617`, `#020617` e `#ffffff`: a reserva é o que o motor calcula sobre o padrão do token. |
| 323 leituras de alias de fachada em componente (`--text-muted`, `--border-color`, `--color-theme-card`) tinham reserva de outra cor (`#94a3b8`, `#334155`, `#1e293b`). | A reserva é o padrão do token dono (`rgba(255,255,255,0.4)`, `rgba(255,255,255,0.1)`, `rgba(15,23,42,0.6)`). Sem Provider, o cartão passa a ser translúcido. |
| A sombra do `PremiumCheckbox` e do nó da matriz era `rgba(var(--sarak-primary-color,#00f2ff),0.5)` — inválida, a sombra sumia. | `color-mix(in srgb, var(--sarak-primary-color,…) 50%, transparent)`: a sombra aparece. |
| A bolha de carregamento do chat e o anexo usavam `rounded-2xl`/`rounded-xl`; os nós da matriz, `rounded-lg`/`rounded-xl`. | Leem `chatBubbleRadius` e `matrixRadius`. |
| `hover:text-red-400`, `text-slate-300` em `SarakCatalogGrid`, `SarakFilterSelect` e `SarakHelpButton`; 161 classes de paleta, 37 `duration-N` e 8 durações/atrasos de `framer-motion` em `src/features/`; atrasos de 0,2 s/0,4 s no chat; pulso de 1,6 s do alternador; 2 s do carregamento do motor. | Leem o tema: cor de status e neutra por variável, duração e atraso por `motionDuration*`/`motionStaggerDelay` (o pulso do alternador é 1,6 s no padrão). |
| Os mocks do painel pintavam `white`, `#000`, `#1a1a1c` e `rgba(10,10,10,0.5)` fixos. | Seguem o tema (título, corpo, texto). |
| `!p-0` em `SarakChat` e `SarakChatEngine`. | `p-0` — o padding do cartão agora cede à classe. |

**Valores de tema trocados (só a cor que reprovava, sem redesenho):** `statusErrorColor` e `statusSuccessColor` em
`synthwave-retro`, `minimalist-airy`, `data-terminal`, `golden-hour`, `aurora-veil` (só o erro) e `blueprint-protocol` (modo
nativo; `data-terminal` só o sucesso) e, na contraparte, em `synthwave-retro`, `cyber-retro-wave`, `blueprint-protocol`, `kinetic-flow` (só o
erro); `textColorMuted` na contraparte do `sarak-sovereign`.

**Diferença no tema padrão:** o texto do aviso e do erro do `AuthForm` fica um pouco menos saturado, e o do
hover fantasma/contorno também.

O `verify_contrast.ts` passa a medir 76 pares (8 novos); o `fixed-translucent:check` passa a acusar tom de paleta
do Tailwind em componente e painel e, em `src/features/`, hex, `rgb()` e a palavra `white`/`black` quase preta ou
branca; o `variable-contract:check` passa a julgar a reserva de alias de fachada também em componente (fecha o
limite 6).

### O resíduo da re-auditoria: o tema chega ao escopo do rascunho e à sobreposição, a escada de camadas não tem empate, o catálogo é o schema, e o Provider devolve o host ao sair

**Classificação: MAJOR (sai na 8.0.0).** Nenhum nome saiu do barril público nem mudou de tipo. Mudam o `z-index` de dez
sobreposições, o padrão de duas camadas do schema, a sombra de treze sobreposições, o contêiner que a mídia de fundo
apaga, a reserva de 30 nomes e o que o Provider deixa no `html`/`body` ao desmontar.

| Antes | Depois |
|---|---|
| 11 classes arbitrárias com espaço no colchete (`z-[var(--z-index-tooltip, 9000)]`, `bg-[var(--color-theme-bg, #0a0a0c)]`) — o Tailwind as parte em duas e não gera nenhuma: o tooltip `fixed` ficava sem `z-index`, o hover do `SarakAnalyticalPage` sem fundo. | Sem espaço; o `fixed-translucent:check` acusa a classe com espaço. |
| `.transition-sarak` com `!important` atropelava o `transition`/`duration-*` da classe e a transição do cartão. | Mora em `components.sarak-elements`, sem `!important`: o `duration-*` do chamador decide. |
| `body[data-sarak-has-media] .bg-theme-body` apagava o fundo de **todo** componente que usa `bg-theme-body` (overlay do cartão expandido, rótulo e painel do login). | Só a raiz e o contêiner de página (`.sarak-page-surface`, que o `SarakAuthScreen` aplica) deixam a mídia aparecer. Quem usava `bg-theme-body` na raiz da própria página e queria a mídia atrás aplica `sarak-page-surface`. |
| 13 sobreposições (modal, toast, tooltip, menu de contexto, autocomplete, seletor de data, multisseleção, idioma, spotlight, preferências, seletor de modelo, ajuda, formulário de gestão) com `shadow-lg/xl/2xl` fixos. | Leem `--dynamic-shadow`, a sombra do tema (cor, direção e camadas). |
| `z-index` fixo nas sobreposições (9999, 99999, 1000, 600, 50, 1100); o lightbox ficava abaixo do modal; `zIndexToast` e `zIndexTooltip` empatavam em 9000, e o `max` 9999 fugia da grade de 100. | Cada sobreposição lê a camada do token: menus e busca acima da sidebar, o cartão expandido um passo abaixo do modal, ajuda +100, lightbox +200, spotlight +300; a notificação (padrão 9100) um passo acima do tooltip (9000); `max` 9900. Os 14 temas que declaravam `zIndexToast: 2000` (empate com o modal) declaram 9100. A vinheta e o ruído (antes `9999`, acima de tudo) ficam em `--sarak-z-sidebar` + 50: ainda cobrem o conteúdo e a barra, e não escurecem menu, modal, tooltip nem notificação. |
| `--color-theme-title`: o motor escrevia o texto principal (`--text-main`) e `_theme.css` declarava a cor do título da barra — dois donos, valores diferentes em 10 de 14 temas; `topbarTitleColor` nunca chegava a `text-theme-title`. | Um dono: o `titleColor`. |
| `--theme-card` (sem Provider) lia a cor da superfície. | Lê o token do cartão. |
| `@theme` puro: 43 de 45 nomes (`--radius-btn`, `--color-theme-primary`, `--duration-*`…) resolviam no `:root`; a prévia do painel (`SarakDesignScope`) mostrava o tema aplicado em `rounded-btn`, `bg-theme-primary` e nas durações. | `@theme inline` (as utilitárias resolvem no elemento) e a regra `:root, .sarak-design-scope` com os mesmos nomes: o escopo mostra o rascunho. |
| 30 reservas em nomes derivados declarados em CSS (`--radius-btn, 12px`; `--sarak-shadow-glow, rgba(59,130,246,.5)`; `--color-theme-primary, #3b82f6`; `--duration-slow, 0.5s`…) divergiam do valor do nome; `calc(var(--sarak-input-border-radius, 8) * 1px)` virava `8px * 1px` (raio 0). | A reserva é o valor declarado; sem unidade e palavra-chave inválida (`thin`) são achado; a tolerância de alfa cai de 0,011 a 0,001. Sem Provider, o brilho (`--sarak-shadow-glow`) passa de 50% a 5% de opacidade — é o padrão do token. |
| O `DesignInjector` deixava ~946 variáveis, a classe de modo, o atributo de mídia, a fonte ancorada e `#sarak-responsive-vars` no `html`/`body` depois de desmontar. | Desmontar tira o que o injetor escreveu (e cancela o quadro do ponteiro pendente). O que o host gravou por fora não é tocado. |
| O seletor de cor: mexer só no alfa de `var()`/`color-mix()` gravava um `rgba()` literal e perdia o vínculo com o tema. | Grava `color-mix(in srgb, <valor> N%, transparent)`. |
| `PresetCard` lia `cardShadowSpread` como desfoque em px; o schema o define como opacidade em %. | Opacidade, como o schema e o `.sarak-card`. |
| O catálogo divergia do schema em 290 entradas (tipo, opções ou faixa): `texture` sem 36 opções, `btnStyleType` sem `cyberpunk` e `neumorphism`, `shadowOrientation` com opção que não existe… | Igual ao schema; a paridade passa a conferir **tipo e valores permitidos**, não só presença. |
| Descrições falsas: `animEnabled` ("toda a aplicação"; só a transição de página lê), `isNavHidden` ("remove"; recolhe a 74 px), `cardGeometricCut` ("um canto"; corta os quatro). | Dizem o que o código faz. |
| `generate_theme_template.test.ts` gravava dentro de `src/` e fazia `kitGenerator.test.mjs` ler um arquivo já apagado. | Grava numa pasta temporária fora do repositório (`SARAK_THEME_OUT_DIR`). |

**O que fazer:** quem aplicava `bg-theme-body` a uma página inteira esperando a mídia de fundo atrás aplica também
`sarak-page-surface`; quem lia `--z-index-*` por nome continua lendo (a reserva é o padrão do token); um tema que
declara `zIndexToast`/`zIndexTooltip` em 9999 passa a 9900.

### O schema passa a documentar cada token: `kind`, `modeDependent`, `usage` e `interactsWith` (cartões, sobreposições e tabelas)

**Classificação: MINOR (campos opcionais aditivos).** Nenhum token novo, nenhuma opção nova e nenhum leitor mudou: o
dicionário só ganha, token a token, o que ele faz na tela. Cada token passa a declarar se é **estético** (o tema o
projeta) ou **funcional** (igual em todo tema), se **carrega modo** (entra na `contraparte`), o que muda na tela e
onde, e de qual outro token depende. O `catalog.json` do kit traz os campos em `designTokens.ids[]`, e o
`GUIA-FRONTEND.md` traz o mapa por pilar no apêndice A.4b. Os grupos `cards`, `cardTitle`, `cardAction`,
`cardSearch`, `overlays` e `tables` estão documentados; os demais chegam nos lotes seguintes.

Nada muda para o tema salvo: valor persistido segue valendo. Quem tem token próprio nesses grupos pode usar o mapa
para saber se o valor também precisa existir na `contraparte`.

Dois tokens desses grupos foram medidos **sem efeito visível** e saíram do schema: `cardContentAlignment` e
`tableActionPosition` (ver a nota *`cardContentAlignment`, `tableActionPosition` e `cardImagePosition` saem do schema*).
(`cardSpotlightOpacity`, `cardActionClickScale` e `imageCardHoverZoom` passaram a desenhar — ver a nota seguinte —,
e `borderBeamEnabled` e `cardSearchBorderBeamActive`, na nota depois dela.)

### Spotlight, aperto do botão de ação e zoom da capa passam a desenhar por padrão

**Classificação: MAJOR (visível por padrão, sem mudança de assinatura).** Três tokens que o painel já oferecia e que
nada desenhava passam a mudar a tela, com o valor padrão que o schema sempre declarou:

| Token | O que desenha | Padrão |
|---|---|---|
| `cardSpotlightOpacity` | Luz difusa na cor primária que acompanha o cursor sobre o `SarakTitleCard`, o `SarakActionCard`, o `SarakSearchCard` e o `SarakCoreCard`; sem ponteiro fino, fica no centro. | 0,1 |
| `imageCardHoverZoom` | A imagem de capa do `SarakImageCard` cresce quando o ponteiro passa sobre **o cartão inteiro** (antes o hover nunca disparava). | 1,05 |
| `cardActionClickScale` | O botão de ação do `SarakActionCard` encolhe enquanto está pressionado. | 0,96 |

Quem não quer o efeito declara `cardSpotlightOpacity: 0`, `imageCardHoverZoom: 1` e `cardActionClickScale: 1`.
Movimento reduzido (token `reducedMotion` ou a preferência do sistema) zera os três. O spotlight com `0` ou sob
movimento reduzido não registra nenhum listener de ponteiro.

### O traço luminoso da borda passa a desenhar: o do campo de busca acende por padrão; `borderBeamEnabled` é opt-in

**Classificação: MAJOR (visível por padrão, sem mudança de assinatura).** `cardSearchBorderBeamActive` e
`borderBeamEnabled` eram oferecidos pelo painel e nada os desenhava (ligar ou desligar só acrescentava um `<div>`
vazio). Passam a desenhar um anel de luz na cor primária que gira pela borda do cartão e acompanha o raio dele:

| Token | O que desenha | Padrão |
|---|---|---|
| `cardSearchBorderBeamActive` | O traço do `SarakSearchCard`, **só enquanto o campo de busca tem o foco**; fora do foco nada anima. | `true` — **passa a desenhar por padrão** |
| `borderBeamEnabled` | O traço aceso o tempo todo em qualquer cartão (título, ação, busca e composto). | `false` — opt-in, nada muda para quem não o declara |

Quem não quer o traço do campo de busca declara `cardSearchBorderBeamActive: false`. O traço some com movimento
reduzido (token `reducedMotion` ou a preferência do sistema) e o giro pausa com o cartão fora da tela. **Custo:** é
uma animação por cartão aceso, repintada a cada quadro; dezenas de cartões visíveis ao mesmo tempo com o traço ligado
custam quadros (medido em Chromium sem GPU: 42 cartões visíveis, de 61 para cerca de 11 quadros por segundo) — use
`borderBeamEnabled` em poucos cartões de destaque, não numa grade inteira.

### `cardContentAlignment`, `tableActionPosition` e `cardImagePosition` saem do schema

**Classificação: MAJOR (chave sai do payload de tema; um caso muda a tela).** Os dois primeiros eram oferecidos pelo
painel e nada os desenhava:
`cardContentAlignment` só era lido por um método de estilo que nenhum cartão chamava (e quem já distribui o conteúdo do
cartão é `cardTextAlign`), e `tableActionPosition` era calculado sem que a `SarakTable` tenha coluna de ações.
`cardImagePosition` só mudava a tela num caso: com `cardLayoutDirection: 'row'` e o valor `right`, invertia a ordem dos
blocos dos cartões de título, ação, busca e expansível; `none`, `top` (o padrão) e `left` não mudavam nada. O tipo
`SarakDesignTokens` perde as três chaves (de 402 para 399) e o painel deixa de mostrá-las. Para os dois primeiros a
tela não muda; para `cardImagePosition`, só muda quem tinha `right` com a direção em linha.

| Antes | Depois |
|---|---|
| `{ cardContentAlignment: 'space-between', cardTextAlign: 'center' }` aceito, e só `cardTextAlign` mudava a tela | `cardContentAlignment` é descartado ao carregar o tema, com um aviso no console que nomeia a chave; `cardTextAlign` segue valendo |
| `{ tableActionPosition: 'left' }` aceito e sem efeito | descartado ao carregar, com o mesmo aviso; a tabela desenha o padrão, como já desenhava |
| `{ cardLayoutDirection: 'row', cardImagePosition: 'right' }` → blocos do cartão em ordem inversa (`flex-row-reverse`) | `cardImagePosition` é descartado com o mesmo aviso; o cartão em linha desenha os blocos na ordem do código (`flex-row`) |

**O que fazer:** nada é obrigatório — o tema salvo com as chaves continua carregando (o valor cai no padrão, com
aviso). Para não ver o aviso, apague as três chaves do tema; para distribuir o conteúdo do cartão, use
`cardTextAlign`. Quem invertia a ordem dos blocos com `right` passa a invertê-la no próprio cartão, pelo `className`
(`className="flex-row-reverse"`: no CSS do Tailwind ela vem depois de `flex-row` e vence). Código que tipava
`design.cardContentAlignment`, `design.tableActionPosition` ou `design.cardImagePosition` deixa de compilar: apague a
leitura.

### A saída do modal e da paleta de busca anima, a lateral recolhida mede o que o token diz, o acordeão aceita raio 0 e a matriz lê o espaçamento

**Classificação: MAJOR (visível por padrão, sem mudança de assinatura).** Quatro tokens eram oferecidos pelo painel e a
tela não os obedecia; passam a obedecer, e a lateral recolhida muda de largura **para todo tema**:

| Token | Antes | Depois |
|---|---|---|
| `motionEaseIn` | `SarakModal` e `SarakSearch` saíam da página no mesmo quadro em que `isOpen` virava `false`: a saída com a curva nunca rodava | o modal e a paleta permanecem na página durante a saída (duração `motionDurationFast`, 0 sob movimento reduzido), acelerando pela curva, e só então saem; nesse instante não seguram o ponteiro |
| `sidebarCollapsedWidth` | a lateral recolhida media o piso de `sidebarMinWidth` (150 a 400 px; 200 no desktop), nunca os 48 a 100 px do token | recolhida, mede `sidebarCollapsedWidth` (74 px por padrão); o piso de `sidebarMinWidth` vale só aberta |
| `borderRadius` | `0` no acordeão voltava ao raio do cartão (12 px) | `0` deixa os cantos retos |
| `matrixGap` | a variável era escrita e nada a lia | é o espaço entre os sub-itens da `SarakExpandableMatrix` dentro de cada linha aberta (12 px por padrão, o que já se via) |

**O que fazer:** nada é obrigatório. Teste de consumidor que esperava o `SarakModal` ou a `SarakSearch` fora do DOM
logo após fechar passa a esperar a saída (`await waitFor(() => expect(…).not.toBeInTheDocument())`). Quem media a
lateral recolhida em 150 a 200 px passa a ver 74 px, ou o valor de `sidebarCollapsedWidth` que o tema declarar.

### `contentAlignment` sai do schema, `searchPositionTopbar: center` passa a centrar a busca e o acordeão lê o raio responsivo

**Classificação: MAJOR (chave sai do payload de tema; dois efeitos mudam).** `contentAlignment` era oferecido pelo painel e não mudava a
tela: a classe de centralização que `center` acrescentava perdia para o estilo em linha da região de conteúdo, que já
limita e centraliza por `maxContentWidth`. O tipo `SarakDesignTokens` perde a chave (de 399 para 398) e o painel deixa de mostrá-la.

| Antes | Depois |
|---|---|
| `{ contentAlignment: 'center' }` aceito e sem efeito | descartado ao carregar o tema, com um aviso no console que nomeia a chave; a região segue limitada e centralizada por `maxContentWidth` |
| `searchPositionTopbar: 'center'` desenhava como `left` quando há itens de navegação | a navegação deixa de tomar o espaço livre e a busca vai para depois dela, centrada no meio do espaço entre a navegação e o grupo final (**não** no centro geométrico da barra) |
| `borderRadius: { mob, tab, desk }` deixava o acordeão sem raio (o objeto era descartado) | o acordeão usa a camada do dispositivo, como `SarakFlex` e `SarakGrid`; o escalar segue como era |

**O que fazer:** nada é obrigatório. Apague `contentAlignment` do tema para não ver o aviso; código que tipava
`design.contentAlignment` deixa de compilar. Quem usava `searchPositionTopbar: 'center'` vê a busca sair de junto da marca
para o meio da barra.

### A barra do topo recolhida passa de 40 para 48 px, para caber o alvo de toque

**Classificação: MAJOR (muda o padrão de `topbarCollapsedHeight`).** Com `isNavHidden` ligado e navegação de topo, os controles da barra
(busca, alternadores, usuário) mediam 38 a 43 px com mouse e 44 px com ponteiro de dedo, e a barra tinha 40 px: eles transbordavam
a barra (2,5 px acima e 1,5 px abaixo, medido em 1024 px com toque). Com 48 px todos cabem nos dois ponteiros.

| Antes | Depois |
|---|---|
| `topbarCollapsedHeight` padrão 40 (reserva `var(--sarak-topbar-collapsed-height, 40px)`) | padrão 48 (a reserva acompanha) |

**O que fazer:** nada é obrigatório. Tema salvo que declara `topbarCollapsedHeight` mantém o valor dele; quem quer os 40 px de
antes declara `topbarCollapsedHeight: 40`. A faixa do token (24 a 56) não mudou.

### A atmosfera da página aparece atrás do conteúdo, e o raio do item de menu ganha token: `navItemRadius`

**Classificação: MAJOR (dois efeitos visíveis por padrão; o token novo só acrescenta).** Em Modo App, a raiz do `SarakAppChrome`
pintava `--bg-body` opaco por cima do `body`, e o gradiente, o `systemTone` e a textura (`texture`) que o motor emite no `body`
ficavam escondidos: a página era sempre uma cor lisa. A raiz agora é transparente quando há `SarakUIProvider` em Modo App
(como já era com mídia de fundo global). O raio do item de navegação era fixo no átomo (`rounded-xl` na lateral,
`rounded-full` no topo, `rounded-lg` recolhido); passa a vir de um token só, `navItemRadius` (`--sarak-nav-item-radius`, 0 a 24 px,
padrão 12), que vale nas três formas. O tipo `SarakDesignTokens` ganha a chave (de 398 para 399) e o painel passa a mostrá-la.

| Antes | Depois |
|---|---|
| a página tinha sempre a cor lisa do tema, com qualquer `texture`, `systemTone` e `bgGradientMode` | gradiente, tom e textura aparecem atrás do conteúdo, em Modo App; no Modo Embarcado e fora de um `SarakUIProvider` a raiz segue opaca, como era |
| item de navegação da lateral com raio 12, do topo em cápsula (`rounded-full`) e recolhido do topo com 8 | os três usam `navItemRadius`, padrão 12: o item do topo deixa de ser cápsula e o recolhido do topo passa de 8 a 12 |

**O que fazer:** nada é obrigatório. Quem quer o item do topo em cápsula declara `navItemRadius: 16` ou mais; quem quer o item reto,
`navItemRadius: 0`. Quem tinha tema com gradiente ou textura declarados passa a vê-los de verdade; para a página lisa de antes,
tire a `texture` e o `systemTone` do tema (ou declare `none`) e use `bgGradientMode: 'none'`. Quem pintava o fundo do app por conta
própria por baixo do cromo passa a ver essa pintura onde antes via a cor do tema.

### A barra de topo não esmaga a navegação, a textura animada de página não amplia o documento e o seletor da barra é legível

**Classificação: MAJOR (quatro efeitos visíveis por padrão; nenhum token novo, nenhum padrão de token alterado).**

- **Barra de topo.** Com a busca e os seletores na barra, a lista de navegação ficava com o que sobrava: a 1440 px, 246 de 341 px
  ("Configurações" virava "Conf"), a 1280 px, 86 px, e a 1024 px, 32 px, enquanto a busca e o grupo final ficavam inteiros. Agora
  a lista pede o tamanho do conteúdo e cede por último: **a busca encolhe primeiro e some abaixo de 10rem**; os rótulos dos widgets
  indisponíveis (usuário e notificações sem dado) **somem abaixo do breakpoint `2xl` (1536 px)** e ficam os ícones (o `aria-label` mantém o nome); o que
  ainda faltar a lista absorve e rola, com cada item inteiro. O grupo final nunca passa da borda da barra e a página não ganha largura.
- **Textura animada de página.** `nebula` animava `transform: scale(1.2) rotate(5deg)` e `stars` `scale(1.05)` no `::before` do `html`/`body`,
  e o `scrollWidth` do documento crescia sem parar (1440 → 1599 px em 35 s com `nebula`): barra de rolagem horizontal. A deriva da
  `nebula` anda agora por `background-position` (as duas nuvens passam a medir 120% da caixa) e a `stars` pisca só a opacidade.
  O cartão com essas texturas muda do mesmo jeito (as regras são as mesmas).
- **Seletores da barra** (tamanho da fonte e navegação lateral/topo). O botão selecionado usa a cor do item ativo como fundo e o
  texto saía da cor sobre a primária; com item ativo de cor diferente da primária o texto ficava ilegível. O texto passa a ser
  `--sarak-on-nav-active`, que o motor escolhe pelo contraste contra a cor do item ativo (emitida como as outras `--sarak-on-*`).
- **Troca de tema sem imagem de fundo.** O injetor remove do `html`/`body` a variável de valor vazio em vez de gravá-la vazia
  (`--sarak-global-bg-image` e `--sarak-global-background-image-url`). No navegador o resultado já era o mesmo; a diferença é que a
  remoção deixou de depender de o host interpretar `''` como remoção.

**O que fazer:** nada é obrigatório. Os widgets reais (com `user` e `notifications`) não mudam; só o
rótulo do widget "indisponível" cede. Quem quer a deriva da `nebula` ou o piscar da `stars` de antes não tem como
voltar ao `transform`: ele estourava o documento.

### O botão de ícone passa a aparecer no estilo `cyberpunk`

**Classificação: MAJOR (efeito visível por padrão em quem usa `btnStyleType: 'cyberpunk'`; nenhum token novo, nenhum padrão alterado).**
No estilo `cyberpunk` o fundo do botão fica transparente (wireframe). O `SarakButton` já pintava o texto das variantes sólidas na cor
da própria variante, mas o `SarakIconButton` mantinha a cor "sobre a cor" (`--sarak-btn-primary-text`, `--sarak-on-error`) sobre o fundo
da página: **o ícone primário e o de perigo sumiam** (medido: 1,07:1 e 1,01:1 no recorte escuro). O ícone passa a ler o mesmo mapa do
`SarakButton`: primário na `--sarak-primary-color`, perigo na `--sarak-status-error-color`. Secundário e fantasma não mudam.

**O que fazer:** nada é obrigatório. Quem fixava a cor do ícone por `className` (`text-*`) continua vendo a dele só se a declarar por
`style`: a cor do estilo `cyberpunk` é escrita em linha, como no `SarakButton`.

### O tema padrão `sarak-sovereign` é refeito e o padrão de todo token estético passa a ser o dele

**Classificação: MAJOR (muda o padrão de 94 tokens estéticos e o que o `sarak-sovereign` desenha).** O tema padrão ganhou direção de arte
própria (vidro escuro sobre constelação, ciano contido, Phosphor preenchido, `Outfit` nos títulos, gráfico de área, botão de vidro,
movimento `Expo Glide`) e declara **todo** token estético, nos dois modos. O padrão do schema de cada token estético é agora o valor do
`sarak-sovereign` no modo escuro: o primeiro quadro, o componente sem `SarakUIProvider` e o tema parcial do consumidor mostram esse tema.
As reservas `var(--x, F)` dos componentes acompanham (`variable-contract:check`).

| Família | Antes | Depois |
|---|---|---|
| Primária / secundária / destaque | `#00f2ff` / `#7000ff` / `#ff00d4` | `#19e3f0` / `#7c5cff` / `#ff4fd8` |
| Fundos (corpo, camada 1, camada 2) | `#050505` / `#0f0f0f` / a primária | `#06080d` / `#0b0f17` / `#101622` |
| Texto (principal, mudo) | `#ffffff`, branco a 40% | `#f2f6fb`, `#f2f6fb` a 55% |
| Ícone | Lucide regular | Phosphor `fill` |
| Cartão | raio 8/12/12, sem textura, `lift` | raio 10/14/14, textura `micro-dots`, `glow-only`, superfície a 70% |
| Botão, campo | `matte`, raio 6/8/8, sem desfoque no campo | `frosted`, raio 8/10/10, desfoque 8 no campo |
| Gráfico, fundo, movimento | `line`, grade, curva padrão | `area`, `constellation` radial, curva `cubic-bezier(0.16, 1, 0.3, 1)` |

**Os outros 13 temas embarcados ainda não foram refeitos** (saem da exceção de `theme-completeness:check` um por lote): como não declaram
esses tokens, **herdam os padrões novos e mudam de aparência** até o lote de cada um. `identityFontFamily` continua herdando a fonte de títulos
(o `sarak-sovereign` declara `Outfit`, que dá o mesmo resultado). `colorBgLayer2` deixa de ser a primária.

**O que fazer:** nada é obrigatório. Tema salvo ou `config` que declara o token mantém o valor; quem quer o visual de antes declara os
valores antigos no `config` do `SarakUIProvider`. Quem comparava a cor do botão primário, o fundo ou o raio do cartão em teste deve trocar o
valor esperado (os snapshots da própria lib mudaram só nesses valores).

### O tema `cyberpunk-neon` é refeito: verde ácido, quina cortada e botão wireframe

**Classificação: MAJOR (muda tudo o que o tema embarcado `cyberpunk-neon` desenha; o id continua).** O tema ganhou direção de arte
própria e declara **todo** token estético, nos dois modos: verde ácido `#00ff6a` sobre preto esverdeado, cartão com quina cortada
(`cardGeometricCut` 14, raio 0 em tudo), botão `cyberpunk` (wireframe), `JetBrains Mono` maiúsculo nos títulos com brilho no H1, `Space Grotesk`
no corpo, Phosphor `duotone`, textura de cartão `scanlines`, fundo `circuit-pro` com `systemTone: cyber`, gráfico de linha sem suavização e
movimento acelerado e curto, sem transição de página. A contraparte clara troca só cor, opacidade e sombra (corpo `#eef5ef`, primária `#007a33`).

| Família | Antes | Depois |
|---|---|---|
| Primária / secundária / destaque | `#00ff41` / `#ff00ff` / `#00ffff` | `#00ff6a` / `#ff2bd6` / `#f9f871` |
| Fonte (títulos / corpo) | `JetBrains Mono` / `JetBrains Mono` | `JetBrains Mono` maiúsculo / `Space Grotesk` |
| Cartão | raio 0 com corte 16, textura `grid` | raio 0 com corte 14, textura `scanlines`, `glow-only` |
| Botão | `borderline` | `cyberpunk` |
| Movimento | curva padrão, transição padrão | curva acelerada, 100-150 ms, `none` |

**O que fazer:** nada é obrigatório. Tema salvo ou `config` que declara o token mantém o valor; quem quer o visual de antes declara os valores antigos.

### Exports removidos do barril público

**Classificação: MAJOR (sai na 8.0.0).**

| Nome removido | Migração |
|---|---|
| `SarakComponent` | Remova o componente do registro global; importe e monte suas telas diretamente na aplicação. |
| `SarakComponentProps` | Use os tipos das telas e componentes do próprio consumidor. |
| `SarakDiscoveredModule` | Para descrever um item de navegação, use `SarakNavItem`; a tela continua sob controle da aplicação. |
| `SarakDynamicRenderer` | Monte a tela da rota diretamente dentro de `SarakAppChrome`. |
| `SarakDynamicRendererProps` | Remova a configuração de contratos do renderer; declare as props da tela no consumidor. |
| `SarakFilterDescriptor` | Remova a descrição de filtros usada pelo Discovery; implemente filtros na tela consumidora. |
| `SarakModule` | Remova o manifesto do módulo; mantenha a tela como componente React da aplicação. |
| `SarakModuleManifest` | Remova o manifesto do módulo; defina título, URL e ícone em `navItems` quando forem necessários. |
| `SarakRouterState` | Use o estado do roteador da aplicação. |
| `SarakShell` | Substitua por `SarakAppChrome` com `children`, `navItems` e `onNavigate`. |
| `SarakShellProps` | Ajuste as props para `SarakAppChromeProps`; itens estruturados usam `SarakNavItem[]`. |
| `SarakVisualContract` | Remova o contrato de renderização declarativa; componha a tela com componentes React. |
| `SarakVisualContractType` | Remova a discriminação de contratos visuais do Discovery. |
| `getSarakModule` | Leia a configuração local da aplicação ou do seu roteador. |
| `registerSarakModule` | Remova o registro global; a aplicação define suas rotas e navegação. |
| `sarakGetLocalComponent` | Importe e use o componente diretamente na tela consumidora. |
| `sarakGetLocalComponentIds` | Remova a enumeração do registro; use a configuração de rotas da aplicação. |
| `sarakGetRegisteredModules` | Remova a consulta ao registro; mantenha a lista de navegação no consumidor. |
| `sarakRegisterLocalComponent` | Remova o registro; importe e monte o componente diretamente. |
| `sarakSubscribeToRegistry` | Remova a assinatura ao registro; o estado da aplicação controla mudanças de rota. |
| `useModuleDiscovery` | Substitua pela lista de navegação e descoberta que a própria aplicação controla. |
| `useSarakRouter` | Use o roteador da aplicação para ler e alterar a rota ativa. |

### Configuração e scaffolder

**Classificação: MAJOR (sai na 8.0.0).**

O `SarakUIProvider` não recebe mais `discoveryEndpoints`; `useSarakUI()` não expõe mais
`discoveryEndpoints`, `registeredModules` ou `layouts`. Remova também `options.endpoints`,
`options.theme.defaultModuleId` e o campo de tema `moduleBlacklist`, que só tinham efeito no modo
host removido. O `options.manifest` usado pelo `SovereignThemeInjector` continua disponível.

`SarakSearchProps.items` agora é obrigatório. Passe os itens que a busca deve apresentar; o componente
não consulta mais o registro de módulos como fallback.

`npx sarak-ui init` gera `src/main.tsx` com o Provider e `src/App.tsx` com `SarakAppChrome`,
`navItems` e um exemplo de roteamento local. Ajuste `src/App.tsx` ao roteador e às telas do projeto.

### Composição dos widgets da barra

**Classificação: MAJOR (sai na 8.0.0).**

| | Antes | Agora |
|---|---|---|
| `searchPositionSidebar` | Aceitava `top`, `bottom` e `hidden` | Aceita `top` e `bottom`; para não oferecer a busca default, use `chromeSearchPosition: 'off'` ou `widgets.search: false` |
| Tema consumidor com `searchPositionSidebar: 'hidden'` | A busca não aparecia na sidebar | O valor legado não é válido e é normalizado para `top`; a busca aparece no topo até o tema escolher `bottom` ou desligá-la pela composição |
| Posição de fábrica dos widgets e preferências | Busca e preferências tinham defaults diferentes; usuário e notificações não tinham composição | Todos os widgets e preferências ficam `pinned` por padrão; o sistema escolhe `pinned`, `menu` ou `off` pelo painel ou pela configuração do design. Os temas distribuídos não carregam a composição |

Temas de consumidor que declaram `hidden` em `searchPositionSidebar` devem trocar o valor por `top` ou
`bottom`; o valor legado é descartado e a busca default aparece na posição definida pelo schema. A posição
`hidden` de `searchPositionTopbar` continua válida. A composição vem do sistema, e os temas distribuídos
herdam `pinned` quando o design não configura outra posição.

### O host escolhe o modo inicial e limita os widgets de preferência

**Classificação: MINOR (opções aditivas; os padrões atuais permanecem iguais).**

`options.preferences.defaultColorMode` aceita `'light'`, `'dark'` ou `'system'`. Ele define o modo enquanto
o usuário não escolheu um; `'system'` acompanha o sistema operacional. A escolha salva do usuário vence, o
default do host não é persistido e ele é ignorado se o tema não oferecer a preferência de modo.

`SarakAppChrome.widgets` também aceita `fontSize`, `navigationStyle` e `language`. Omitir cada chave mantém o
widget ligado; `false` o remove da barra e do menu de preferências, mesmo quando o tema o oferece.

### Modelo público de usuário do cromo

**Classificação: MAJOR.** `SarakShellUser` deixa de aceitar os campos de produto `username` e `level`; o nome
passa a ser obrigatório e o papel passa a ser um rótulo genérico fornecido pelo aplicativo.

| | Antes | Agora |
|---|---|---|
| Nome exibido | `username` opcional | `name` obrigatório |
| Papel exibido | `level` numérico, convertido em rótulo de produto | `role` textual opcional, definido pelo consumidor |
| Avatar e e-mail | `avatarUrl`/`email` aceitos como campos abertos | `avatarUrl` e `email` opcionais declarados no tipo |

```tsx
// Antes
const user = { username: 'ana', level: 100, email: 'ana@example.com' };

// Depois
const user = { name: 'Ana Lima', role: 'Administradora', email: 'ana@example.com' };
```

Migre `username` para `name` com o nome que deve aparecer no cromo e substitua `level` por `role` somente
quando houver um rótulo apropriado para o consumidor. Não converta números de nível em nomes de produto;
omita `role` se o aplicativo não tiver um papel para exibir.

### Ícones passam pela porta do consumidor

**Classificação: MAJOR.** A família, o peso e a espessura configurados no tema passam a ser aplicados aos
ícones da biblioteca por `SarakIcon`. Os ícones de marca deixam de fazer parte da lista curada; o consumidor
entrega a marca por elemento, ou registra seu componente com `sarakRegisterIcons`.

| Nome removido | Antes | Depois |
|---|---|---|
| `emojiSet` | Chave opcional no payload do tema, usada para escolher um conjunto de emojis na prévia. | Não é mais uma chave aceita pelo Provider. Remova-a dos temas e passe um ícone por elemento ou registro quando precisar de um desenho próprio. |
| `Chrome` | Nome público de `SarakIcon`, ligado ao glifo de marca da família Lucide. | Removido de `SarakIconName`. Passe o logotipo ao `SarakSocialButton` por `icon`, ou registre um componente com outro nome no consumidor. |
| `Github` | Nome público de `SarakIcon`, ligado ao glifo de marca das famílias Lucide, Phosphor e Tabler. | Removido de `SarakIconName`. Passe o logotipo ao `SarakSocialButton` por `icon`, ou registre um componente com outro nome no consumidor. |

`SarakSocialButton` agora exige `icon: ReactNode`; as entradas de `socialConfig.providers` usadas por
`SarakAuthScreen` também recebem esse elemento. O `SarakNavItem.icon` e o `SarakMenuItem.icon` aceitam um nome
registrado ou um elemento. O peer `lucide-react` passa a aceitar `>=0.284.0 <1.0.0`.

```tsx
<SarakSocialButton provider="github" icon={<GithubMark />} variant="glass" />
```

### Os templates deixam rede, domínio e fluxo de autenticação ao consumidor

**Classificação: MAJOR.** `SarakCardGrid`, `SarakChart`, `SarakForm`, `SarakManagementGrid`, `SarakStats` e
`SarakTable` deixam de aceitar `endpoint` e não fazem chamadas de rede. Passe os dados já carregados por
`data` ou uma função do host por `load`; `SarakForm` envia os valores por `onSubmit`. As ações de
`SarakManagementGrid` também passam por callbacks do host. Remova a dependência peer `axios` e o uso do
cliente interno.

`SarakAuthScreen` passa a exibir só o login por padrão. Habilite cadastro com `allowRegistration`, MFA com
`allowMfa` e login social com `socialConfig.enabled`; rótulos podem ser substituídos por `labels`, e a
gravidade da mensagem de erro é indicada por `errorVariant`. O host continua responsável por autenticar,
carregar recursos e tratar cada evento.

`SarakChat` também remove `endpoint` e `modelsEndpoint`. O host fornece `onSend`, que recebe mensagem,
anexos, modo, modelo e limite de tokens e encaminha os tokens recebidos ao template; `loadModels` é opcional,
e a lista permanece vazia sem o loader.

### Largura máxima e densidade da região de conteúdo

**Classificação: MAJOR (o limite padrão altera o layout, incluído na 8.0.0).**

`maxContentWidth` agora limita e centraliza a região de conteúdo; o padrão `1440px` deixa de crescer em telas mais largas. `layoutDensity` escala o respiro: `compact` reduz, `spacious` aumenta e `comfortable` preserva o espaçamento anterior.

Para voltar à largura fluida, defina `maxContentWidth: '100%'`. Para manter o respiro anterior, defina `layoutDensity: 'comfortable'`.

### Vista dividida do conteúdo

**Classificação: MINOR (capacidade aditiva incluída na 8.0.0).**

Com `isSplitViewEnabled: true` no design e `secondaryContent` preenchido em `SarakAppChrome`, o conteúdo
passa a exibir dois painéis lado a lado em desktop e empilhados em tablet e celular. Sem o token ligado ou
sem o slot secundário, a região continua com um único painel. Para manter a composição anterior, omita
`secondaryContent` ou defina `isSplitViewEnabled: false`.

### Exibição de dados: tabelas, paginação e valores formatados

**Classificação: MINOR (capacidades aditivas incluídas na 8.0.0).**

- `SarakTable` aceita renderização e alinhamento por coluna, ativação de linha e estados de carregamento, erro com nova tentativa e vazio; no celular, os cartões preservam a renderização, o alinhamento e a ativação da linha. `SarakDataTable` também aceita altura variável por linha e os mesmos estados.
- `SarakPagination` aceita tamanho de página, callback de alteração e resumo traduzido do intervalo exibido.
- Os formatadores públicos de número, moeda, percentual e data acompanham o idioma configurado, com override local. `SarakValue` aplica os tokens de status para valores positivos, negativos e neutros; `SarakStats` aceita configuração por métrica para ícone, variação, formato, rótulo e dica.

### Dados preservam a última leitura e badges de status ganham forma

**Classificação: MAJOR (o desenho padrão de `SarakBadge` muda).** `SarakTable`, `SarakCardGrid`, `SarakChart` e `SarakStats` mantêm os dados já carregados quando uma atualização falha, exibem o erro com uma ação de nova tentativa e mostram o horário da última leitura com o estado desatualizado. No modo `data`, passe `updatedAt` (`Date`, string ou número); no modo `load`, a biblioteca registra o horário de cada leitura bem-sucedida. `SarakCardGrid`, `SarakChart` e `SarakStats` também aceitam `onRetry` para substituir a nova tentativa padrão.

`SarakValue` e os números de `SarakStats` usam dígitos tabulares. As variantes `success`, `danger`, `warning` e `info` de `SarakBadge` usam as cores de status do tema e exibem uma forma junto ao rótulo. Para manter o badge sem forma, passe `showStatusShape={false}`.

### A cor do texto principal sai em `--text-main`

**Classificação: MAJOR (a variável CSS antiga deixa de ser emitida).**

A biblioteca não emite a variável `--theme-text`: a cor do texto principal sai em `--sarak-text-main` e no alias
`--text-main`, e o utilitário `text-theme-text` do Tailwind lê `--text-main`. Uma tela do consumidor que lê o nome
antigo direto fica sem valor. **Como migrar:** troque a leitura por `var(--text-main)` (ou `--sarak-text-main`);
quem precisa manter o nome antigo declara o alias no próprio CSS, apontando para `--text-main`.

### O `SarakInput` exibe os ícones laterais em conjunto

**Classificação: PATCH (correção de comportamento).**

O `SarakInput` passa a mostrar `leftIcon` e `rightIcon` juntos, cada um no seu lado, e o da direita é clicável; antes só um dos dois aparecia (o widget de busca do cromo, por exemplo, passa a exibir o atalho à direita).

### A persistência do tema ativo restaura também o id

**Classificação: MAJOR (os tipos requerem atualização).**

**Compatibilidade.** As assinaturas antigas de `onSave(design)` e `onLoad()` que devolve somente o
design continuam aceitas. Há mudanças de tipo que exigem atualização em consumidores que fornecem
`unknown[]` em vez de entradas de tema tipadas ou que constroem `SarakUIContextType` manualmente.
O Provider também aceita `null` ou `undefined` de `onLoad` para indicar que ainda não há estado salvo.

| | Antes | Agora |
|---|---|---|
| Leitura do estado aplicado | `onLoad` devolvia só o design | Pode devolver `{ design, activeThemeId }`; o id salvo é restaurado junto |
| Gravação no boot | A hidratação podia disparar uma gravação sem mudança | Boot e hidratação não gravam; alterações reais e aplicações explícitas continuam gravando |
| Troca de tenant | O consumidor precisava remontar o Provider | Alterar `tenantId` troca a partição local e chama `onLoad` para o tenant novo sem remontagem; `strategy` define a precedência |
| Remover tema customizado | O consumidor removia a entrada apenas na própria lista | `useSarakUI().deleteTheme(id)` remove da coleção da sessão e chama opcionalmente `options.theme.onDelete(id)` |
| Tipos de `customThemes` e `allThemes` | `unknown[]` | `SarakThemeEntry[]`; cada entrada tem `id` e pode declarar `name`, `design` e `contraparte` |
| `SarakUIContextType` | Não expunha `deleteTheme` | Exige `deleteTheme(id)` no valor do contexto; contextos montados manualmente devem fornecer a operação |

O id carregado não vence `activeThemeId` quando essa prop é controlada. O consumidor continua dono
do armazenamento: `onDelete` é o ponto em que pode remover o tema da própria fonte persistente.

Para trocar de tenant, mantenha um único Provider e atualize `tenantId`; os callbacks fecham sobre
o valor atual e a leitura remota anterior não pode aplicar seu resultado depois da troca:

```tsx
function App({ tenantId }: { tenantId: string }) {
  return (
    <SarakUIProvider
      options={{
        persistence: {
          tenantId,
          onLoad: () => carregarTema(tenantId),
          onSave: (design, activeThemeId) => salvarTema(tenantId, design, activeThemeId),
        },
      }}
    >
      <Aplicacao />
    </SarakUIProvider>
  );
}
```

Se a troca também tiver de descartar o estado React dos filhos, adicione `key={tenantId}` ao
Provider para desmontar e montar a árvore inteira. A chave não substitui `tenantId`: mantenha os
dois para reiniciar a árvore e separar a chave de persistência por tenant.

### O cache híbrido restaura o id ativo e a falha de gravação fica visível

O cache local da estratégia `hybrid` restaura o par design/id: o design segue no formato bruto da
chave de persistência e `activeThemeId` fica em uma chave companheira tenant-aware. `onLoad` pode
atualizar esse cache sem chamar `onSave`; o cache vence `config` por padrão, como antes. Hosts que
injetam o design de boot como fonte da verdade podem definir `preferConfigOverCache: true`, fazendo
`config` vencer o cache no primeiro render. Para evitar o quadro branco antes do JavaScript, o host
também pinta o fundo no HTML inicial com `design.colorBgBody`.

`persistence.onSave` deve rejeitar sua Promise quando a gravação falhar (incluindo resposta HTTP
4xx/5xx, que `fetch` não rejeita sozinho). A biblioteca mantém a alteração na tela e mostra um aviso
localizado; não considera a tentativa bem-sucedida nem repete automaticamente. Uma mudança aplicada
posterior tenta gravar novamente. `Aplicar (N)` continua sendo a ação que persiste o rascunho pelo
`persistence.onSave`; `options.theme.onSave` continua reservado aos temas nomeados.


### As implementações de SarakDataTable e SarakDataGrid deixam de ser públicas

**Classificação: MAJOR (sai na 8.0.0).** `SarakDataTableImpl` e `SarakDataGridImpl` deixam de ser exportados pelo barril público. `SarakDataTable`, `SarakDataGrid` e seus tipos de props continuam disponíveis; os componentes seguem carregados sob demanda e exigem `<Suspense>` do consumidor.

**Como migrar:** troque os imports de `SarakDataTableImpl` e `SarakDataGridImpl` por `SarakDataTable` e `SarakDataGrid`. Renderize os wrappers dentro de `<Suspense fallback={...}>`; os tipos `SarakDataTableProps`, `SarakDataTableRowHeight` e `SarakDataGridProps` continuam importáveis pelo barril.

### `SarakTextarea` e `SarakRichText` passam a aceitar `label`

**Classificação: MINOR (props opcionais aditivas).** Os dois átomos passam a exibir e associar o rótulo informado ao controle editável. Usos existentes continuam válidos; informe `label` para que o campo tenha um nome acessível ligado ao rótulo visível.

### As fontes passam a vir do próprio pacote, não do Google Fonts: `options.fonts` é novo e o catálogo de tipografia cresce de 19 para 41 famílias

**Classificação: MAJOR (sai na 8.0.0).** Duas coisas mudam para quem já importa a lib:

1. **O comportamento padrão muda de Google para embarcado.** Sem configurar nada, a página deixa de pedir fontes a
   `fonts.googleapis.com`/`fonts.gstatic.com`: o Provider carrega, do próprio pacote, só as famílias que o tema no ar
   usa. Quem tinha `font-src` (política de segurança de conteúdo) liberando os domínios do Google precisa liberar a
   própria origem; quem usa esbuild puro ou CJS no navegador precisa de `baseUrl` (tabela abaixo).
2. **`options.fonts` é novo** — a origem (`'bundled'`, o padrão · `'google'` · `'none'`), o `baseUrl` e as fontes do
   próprio host (`custom`).

**O que o tema aceita não muda.** Um token de fonte continua aceitando qualquer pilha de fontes segura, registrada ou
não; nenhum tema salvo deixa de valer, e a família que não carregar cai na genérica da pilha.

**Checklist do importador:**
- [ ] A política de segurança de conteúdo tem `font-src 'self'` (ou a origem do `baseUrl`); os domínios do Google só
  se você escolher `fonts: 'google'`.
- [ ] O bundler está na tabela "Onde o arquivo é encontrado" abaixo; se ele pede `baseUrl`, a pasta `fonts/` do pacote
  está publicada e o `baseUrl` aponta para ela.
- [ ] Você carregava as fontes por conta própria (folha do Google no `index.html`, `@fontsource` importado)? Passe
  `fonts: 'none'` para a lib não carregar de novo, ou remova o seu carregamento e deixe a lib fazê-lo.
- [ ] A fonte da marca é sua? Registre-a em `options.fonts.custom` (abaixo) para ela aparecer no painel e carregar
  sob demanda.

**Privacidade:** com o padrão, o navegador do usuário final não fala com terceiros para desenhar texto — o IP dele não
vai ao Google, o que tira essa transferência do inventário de LGPD do host, e a tipografia funciona offline e em rede
que bloqueia o domínio. `fonts: 'google'` volta a fazer essa requisição; é escolha explícita do host.

**O pacote:** passa a trazer `dist/fonts/` (~1,7 MB): 41 famílias em woff2,
subconjunto `latin`, mais `manifest.json` (família → arquivos → pesos e eixos) e o `THIRD-PARTY-FONTS` com o crédito e o
texto de licença de cada família (SIL OFL 1.1; Apache 2.0 para Satisfy e Roboto Slab). Quem empacota a lib e controla o
que entra no artefato final passa a ver essa pasta no pacote.

**O catálogo:** o painel passa a oferecer 22 famílias novas em
`THEME_FONTS` (Chakra Petch, Nunito, DM Sans, Manrope, Work Sans, Open Sans, Raleway, Source Sans 3, Poppins, Lato,
Orbitron, VT323, Oswald, Source Serif 4, Roboto Slab, Lora, Merriweather, PT Serif, Patrick Hand, Fira Code, IBM Plex
Mono, Space Mono). Os 19 `value` que já existiam não mudaram, nenhuma família saiu, e um tema salvo continua válido.

**Como o padrão carrega.** Com `options.fonts` omitido (`'bundled'`), o Provider injeta um `@font-face`
só para as famílias que o design no ar usa (título, corpo, mono e a fonte do logo), uma vez por família, com
`font-display: swap`, só os pesos que têm arquivo e o `unicode-range` latin, apontando para `dist/fonts/` do pacote.
Nenhuma requisição a `fonts.googleapis.com`/`fonts.gstatic.com` e nenhum `<link rel="preconnect">`. Trocar de tema
carrega a família nova; a anterior não é buscada de novo.

**`options.fonts` (novo):**

| Valor | O que a lib faz |
|---|---|
| omitido ou `'bundled'` | o `@font-face` das famílias em uso, com os arquivos do pacote (`new URL('./fonts/…', import.meta.url)`) |
| `{ baseUrl: 'https://…/fonts/' }` | o mesmo, com os arquivos em `baseUrl` + nome do arquivo: para quem serve a pasta `fonts/` do pacote de outra origem (CDN própria) ou usa um bundler que não reescreve aquele `new URL` |
| `'google'` | o comportamento anterior, igual: `@import` do Google Fonts com toda família de `THEME_FONTS` e os dois `preconnect` |
| `'none'` | nada; o host carrega as fontes |

**Para voltar ao comportamento antigo:** `<SarakUIProvider options={{ fonts: 'google' }}>`. O Modo Embarcado não muda:
sem `options.embedded.injectGlobalFonts` a ilha não injeta fonte de origem nenhuma; com ele, vale a origem de `options.fonts`.

**Onde o arquivo é encontrado sem configurar nada** (medido em 2026-10-16 com o pacote em `node_modules`, Vite 8.0.16 e
esbuild 0.27.7; webpack não foi medido):

| Bundler do importador | O que acontece | O que fazer |
|---|---|---|
| Vite em dev | a URL é reescrita para `/node_modules/@sarak/lib-ui-core/dist/fonts/…` e a fonte carrega | nada |
| `vite build` | os 60 woff2 viram assets com hash no build do importador (~1,7 MB em disco); o navegador só baixa os das famílias em uso | nada |
| esbuild puro (ESM) | a URL fica relativa ao bundle (`/fonts/…`), que não tem a pasta → 404 | copiar `node_modules/@sarak/lib-ui-core/dist/fonts/` para a pasta pública e passar `baseUrl` |
| esbuild IIFE | não há `import.meta.url` → `Invalid URL` | o mesmo |
| CJS (`require`) no navegador | o substituto do `import.meta.url` aponta para a página, não para o pacote | o mesmo |

Falha nunca é silenciosa: quando uma família não carrega, o console mostra, uma vez por família,
`[Sarak:UI] A fonte "<família>" não carregou (origem tentada: …)` com a dica do `baseUrl`, e a página segue com a fonte de
reserva do `value` (`sans-serif`, `serif`…).

**Fontes do próprio host (`options.fonts.custom`, novo).** O importador registra as famílias que ele serve; a lib não
embarca nem copia esses arquivos. Use `custom` para uma família que **não** está no catálogo da lib (a fonte da marca);
`baseUrl` é para servir de outro lugar **as mesmas** fontes do pacote:

```tsx
<SarakUIProvider options={{ fonts: { custom: [
    { family: 'Marca Sans', category: 'Sans-Serif', fallback: 'sans-serif', files: [
        { url: '/fontes/marca-400.woff2', weight: 400 },
        { url: '/fontes/marca-700.woff2', weight: 700 },
    ] },
] } }}>
```

A família entra no seletor do painel junto às da lib (na categoria dela; sem `category`, em "Personalizadas") e vale em
qualquer token de fonte. O tema grava `'Marca Sans', sans-serif`. Com `'bundled'` ou `'google'` a lib injeta o
`@font-face` dela quando o design a usa (o mesmo carregador sob demanda, com aviso se o arquivo não carregar); com
`'none'`, não — o host carrega tudo sozinho.

O que a lib valida no registro (o que falha é recusado com aviso): o nome só com letras, dígitos, espaço, hífen e
sublinhado, até 64 caracteres, sem repetir uma família da lib; a `url` só `https:`, caminho do host (`/…` ou relativo) ou
`data:font/…;base64,…` (`http:`, `file:`, `javascript:` e qualquer outro esquema são recusados); o peso em 100–900 (de
100 em 100), `normal` ou `bold`; o estilo `normal` ou `italic`; o `fallback` uma família genérica.

**Registrar não muda o que o tema aceita.** Como antes, qualquer pilha de fontes segura vale num token de fonte
(`'Georgia, serif'`, `system-ui`…), registrada ou não; CSS cru continua recusado. Registrar serve para a lib **carregar** a
família e **listá-la** no painel. Um tema vindo de outro host que use uma família que este Provider não registrou e que o
sistema não tem instalada mostra a genérica da pilha (`'X', sans-serif` → `sans-serif`), sem aviso nem erro. O registro vale
por Provider: cada ilha do Modo Embarcado carrega só os arquivos que ela registrou. O tema exportado pelo painel que usa
fonte do host traz `requiresFonts: ['…']` ao lado de `design`, e o aviso do painel diz que quem importar precisa
registrá-las.

**Limites que vale conhecer:** das fontes variáveis entra só o eixo `wght` (os eixos `opsz`, `wdth`, `SOFT` e `WONK` não);
das estáticas entram só os pesos que o pacote da família tem, e o navegador sintetiza os demais. Por isso o tema que quer
evitar peso sintetizado escolhe pesos que a família tem (por exemplo, Space Mono tem 400 e 700; VT323, Patrick Hand e
Bebas Neue, só 400).

---

### Lote 2 da documentação dos tokens

Os tokens de tipografia, botões, campos, alternadores, cores, gráficos, chat e status agora informam no schema seu
uso, classificação, dependência de modo e interações relevantes. O lote não alterou valores padrão, opções nem
leitores; temas existentes mantêm o mesmo comportamento.

### Lote 3 da documentação dos tokens

Os tokens de fundo e atmosfera, animações, movimento, acessibilidade, especializados, rolagem, camadas,
componentes avançados e mídia informam no schema o uso, a classificação, a dependência de modo e as interações,
conferidos em navegador. Três descrições foram corrigidas para o que a tela faz: `globalSaturation` e `globalContrast`
filtram só a camada de textura; `bgNoiseDensity` regula só o grão de filme; `motionEaseOut` alcança o pulso do
alternador e o botão HTML sem classe. Valores padrão, opções e leitores não mudaram; temas existentes mantêm o
comportamento.

### Lote 4 da documentação dos tokens

Os tokens globais, de marca, de layout, de navegação, estruturais e de preferências do usuário informam no schema o uso,
a classificação, a dependência de modo e as interações, conferidos em navegador. A `description` de `mode` passou a
dizer o que o valor faz (declara o modo nativo; a paleta inverte pela preferência do usuário). Valores padrão, opções e
leitores não mudaram; temas existentes mantêm o comportamento.

### `SarakAutocomplete` respeita `disabled`; props sem efeito saem da API e os componentes passam a ler os tokens de movimento e espaçamento

**Classificação: MAJOR (três props públicas são removidas).** `SarakStats` deixa de aceitar `role`, `density` e `importance`; `SarakForm` deixa de aceitar as mesmas props; `SarakTableProps` deixa de aceitar `importance`. Elas eram aceitas pelo TypeScript e não alteravam a tela.

| Componente/prop | Antes | Depois |
|---|---|---|
| `SarakStats` / `SarakForm`: `role`, `density`, `importance` | Props tipadas sem efeito visual ou semântico. | Removidas dos tipos públicos; apague-as do JSX e dos objetos de props. |
| `SarakTableProps.importance` | Prop tipada sem efeito na tabela. | Removida do tipo público; apague-a dos objetos de props. |
| `SarakAutocomplete disabled` | O controlador bloqueava sugestões, mas o campo seguia editável e recebia foco. | O atributo chega ao `SarakInput`; o campo não aceita edição, não abre a lista e não recebe foco ao clicar. |

O restante é correção visual sem configuração adicional: o contorno do `SarakCatalogGrid` usa a classe de borda válida; o véu do `SarakDrawer` sai pela curva `motionEaseIn` na duração `motionDurationFast`; os espaços entre linhas e filhos da `SarakExpandableMatrix` seguem `matrixGap`; e a borda cyberpunk de `SarakButton` lê `btnNeonGlowColor` pela mesma variável CSS de `SarakIconButton`. O JSDoc de `SarakShellNav.orientation` deixa de citar opções inexistentes; o comportamento do menu não muda.

### `SarakPDFViewer` exige `workerSrc`

**Classificação: MAJOR.** A prop `workerSrc`, antes opcional, agora é obrigatória. Gere a URL do worker a partir da mesma versão de `pdfjs-dist` usada pelo consumidor e passe-a ao componente; a configuração para Vite e Webpack 5 está no `sarak-ui/GUIA-FRONTEND.md` §3.1. Sem a prop, o visualizador mostra uma orientação traduzida e registra um aviso único no console.

### Tokens funcionais, modal e posição da arte global

**Classificação: MAJOR.** As faixas funcionais mudam: `topbarCollapsedHeight` de 24–56 para 44–56 px; `focusRingWidth` de 0–6 para 1–6 px; `zIndexSidebar` de 10–1000 para 10–790 (passo 10). `zIndexModal` permanece em 1000–5000 (passo 100). Valores salvos fora das novas faixas são ajustados ao limite durante a validação e geram aviso no console. Com os deslocamentos derivados de até 200 níveis, o teto da navegação fica em 990 e a busca segue abaixo do modal. Atualize temas e controles que escreviam valores fora dessas faixas.

O painel do `SarakModal` passa a usar a borda e a sombra do cartão: `cardBorderWidth` (incluindo larguras por lado), `borderStyle`, `cardBorderColor`/`cardBorderOpacity` e `cardShadow`/`cardShadow*`. Remova as classes ou estilos próprios que substituíam essas propriedades se quiser que o modal siga o tema.

O novo token estético `globalBackgroundPosition` aceita `absolute` (rola com o conteúdo) e `fixed` (preso à janela), com default `absolute`, igual ao `sarak-sovereign`. Os 19 temas declaram o token; `synthwave-retro` usa `fixed` porque o horizonte e a grade da arte devem permanecer ancorados na janela. Temas salvos que não conhecem o token passam a rolar com o conteúdo.

### Persistência de temas e Content Security Policy

`options.theme.onSave(theme, operation)` recebe o tema validado e, como segundo argumento opcional,
`'create'` ou `'replace'`. O painel usa `'replace'` ao **Salvar** sobre um tema do importador em edição;
**Salvar como novo**, **Duplicar** e **Novo tema** criam uma entrada e usam `'create'`. **Apagar** chama
`options.theme.onDelete(id)` e só aparece para temas do importador, após confirmação. Sem `onSave`, as
ações de criação e gravação não aparecem; sem `onDelete`, apagar remove o tema apenas da sessão.

Para uma Content Security Policy que restringe elementos `<style>`, passe o nonce da resposta em
`options.styleNonce`. A biblioteca o aplica às folhas de estilo que cria, inclusive o CSS global,
tema, escopos e fontes. Um exemplo de diretiva é `style-src 'self' 'nonce-<valor-da-resposta>'`;
não é necessário incluir `'unsafe-inline'` em `style-src`. Para que a folha global já receba nonce
durante o import, declare também `<meta property="csp-nonce" nonce="<valor-da-resposta>">` no HTML,
antes do script que importa o pacote. O `styleNonce` do Provider continua valendo para as folhas
criadas depois da montagem. Sem a meta e sem `styleNonce`, o CSS global mantém o comportamento de
zero configuração; no modo embarcado, importe `@sarak/lib-ui-core/sarak-scoped.css`.

### De/para das props inertes removidas

| Antes | Depois |
|---|---|
| `SarakAuthScreen`, `SarakChat`, `SarakChart`, `SarakManagementGrid`, `SarakCardGrid`, `SarakCatalogGrid`: `role`, `density`, `importance` | Removidas: não alteravam esses componentes. Apague-as dos objetos de props. |

`SarakTable` mantém `role` e `density`: o cabeçalho e as células leem esses valores. `importance`
já não fazia parte das props públicas da tabela.

## 7.0.0 — Os nomes públicos passam a identificar a biblioteca

**Classificação: MAJOR** — nomes importados pelo barril público recebem o prefixo Sarak.

**O que muda.** Componentes, tipos, interfaces, constantes e funções exportadas seguem a convenção de prefixo da biblioteca. Atualize os imports conforme a tabela:

| Nome antigo | Nome novo |
| --- | --- |
| `Accept` | `SarakAccept` |
| `BadgeSize` | `SarakBadgeSize` |
| `BadgeVariant` | `SarakBadgeVariant` |
| `BreadcrumbItem` | `SarakBreadcrumbItem` |
| `CardMove` | `SarakCardMove` |
| `CatalogItem` | `SarakCatalogItem` |
| `ChartDataItem` | `SarakChartDataItem` |
| `ContextMenuPosition` | `SarakContextMenuPosition` |
| `CustomizationPanel` | `SarakCustomizationPanel` |
| `DEFAULT_COLUMN_WIDTH` | `SARAK_DEFAULT_COLUMN_WIDTH` |
| `DEFAULT_DEVICE_BREAKPOINTS` | `SARAK_DEFAULT_DEVICE_BREAKPOINTS` |
| `DESIGN_MANIFEST` | `SARAK_DESIGN_MANIFEST` |
| `DateLocale` | `SarakDateLocale` |
| `DatePickerValue` | `SarakDatePickerValue` |
| `DerivedThemePreset` | `SarakDerivedThemePreset` |
| `DesignScope` | `SarakDesignScope` |
| `DesignScopeProps` | `SarakDesignScopeProps` |
| `DesignToken` | `SarakDesignToken` |
| `DeviceBreakpoints` | `SarakDeviceBreakpoints` |
| `DeviceProvider` | `SarakDeviceProvider` |
| `DeviceProviderProps` | `SarakDeviceProviderProps` |
| `DeviceType` | `SarakDeviceType` |
| `DiscoveredModule` | `SarakDiscoveredModule` |
| `DynamicRenderer` | `SarakDynamicRenderer` |
| `DynamicRendererProps` | `SarakDynamicRendererProps` |
| `ExpandableCard` | `SarakExpandableCard` |
| `ExpandableCardProps` | `SarakExpandableCardProps` |
| `FileRejection` | `SarakFileRejection` |
| `FilterConfig` | `SarakFilterConfig` |
| `FilterDescriptor` | `SarakFilterDescriptor` |
| `FilterSelect` | `SarakFilterSelect` |
| `FilterSelectProps` | `SarakFilterSelectProps` |
| `FlexDirection` | `SarakFlexDirection` |
| `GLOBAL_THEMES` | `SARAK_GLOBAL_THEMES` |
| `HelpButton` | `SarakHelpButton` |
| `ICONE_DESCONHECIDO` | `SARAK_ICONE_DESCONHECIDO` |
| `ICON_NAMES` | `SARAK_ICON_NAMES` |
| `IconFamily` | `SarakIconFamily` |
| `IconMap` | `SarakIconMap` |
| `IconName` | `SarakIconName` |
| `IconTriple` | `SarakIconTriple` |
| `ImageCard` | `SarakImageCard` |
| `ImageCardProps` | `SarakImageCardProps` |
| `KanbanCard` | `SarakKanbanCard` |
| `KanbanColumn` | `SarakKanbanColumn` |
| `LightboxImage` | `SarakLightboxImage` |
| `MIN_COLUMN_WIDTH` | `SARAK_MIN_COLUMN_WIDTH` |
| `MatrixNodeConfig` | `SarakMatrixNodeConfig` |
| `MatrixParentData` | `SarakMatrixParentData` |
| `MatrixTreeNode` | `SarakMatrixTreeNode` |
| `Message` | `SarakMessage` |
| `ModalLayoutContext` | `SarakModalLayoutContext` |
| `ModuleManifest` | `SarakModuleManifest` |
| `MultiSelectOption` | `SarakMultiSelectOption` |
| `NavigationItem` | `SarakNavigationItem` |
| `PaginationToken` | `SarakPaginationToken` |
| `PdfSource` | `SarakPdfSource` |
| `PinnedOffsets` | `SarakPinnedOffsets` |
| `PreferenceId` | `SarakPreferenceId` |
| `PreferencePosition` | `SarakPreferencePosition` |
| `RangeValue` | `SarakRangeValue` |
| `ResponsiveDevice` | `SarakResponsiveDevice` |
| `ResponsiveValue` | `SarakResponsiveValue` |
| `ShellLanguageSelector` | `SarakShellLanguageSelector` |
| `ShellLanguageSelectorProps` | `SarakShellLanguageSelectorProps` |
| `ShellNavItem` | `SarakShellNavItem` |
| `ShellSearchWidget` | `SarakShellSearchWidget` |
| `ShellSearchWidgetProps` | `SarakShellSearchWidgetProps` |
| `ShellThemeToggle` | `SarakShellThemeToggle` |
| `ShellThemeToggleProps` | `SarakShellThemeToggleProps` |
| `ShellUser` | `SarakShellUser` |
| `ShellUserWidget` | `SarakShellUserWidget` |
| `ShellUserWidgetProps` | `SarakShellUserWidgetProps` |
| `SkeletonShape` | `SarakSkeletonShape` |
| `SocialButton` | `SarakSocialButton` |
| `SocialButtonProps` | `SarakSocialButtonProps` |
| `SparklineVariant` | `SarakSparklineVariant` |
| `StepConfig` | `SarakStepConfig` |
| `StepperOrientation` | `SarakStepperOrientation` |
| `THEME_AXES` | `SARAK_THEME_AXES` |
| `THEME_PRESET_IDS` | `SARAK_THEME_PRESET_IDS` |
| `ThemeEntry` | `SarakThemeEntry` |
| `ThemePreset` | `SarakThemePreset` |
| `ThemePresetId` | `SarakThemePresetId` |
| `ThemeReferenceOverrides` | `SarakThemeReferenceOverrides` |
| `ToastController` | `SarakToastController` |
| `ToastOptions` | `SarakToastOptions` |
| `ToastVariant` | `SarakToastVariant` |
| `TokenValueType` | `SarakTokenValueType` |
| `TooltipPosition` | `SarakTooltipPosition` |
| `VisualContract` | `SarakVisualContract` |
| `VisualContractType` | `SarakVisualContractType` |
| `WeekStart` | `SarakWeekStart` |
| `buildPaginationRange` | `sarakBuildPaginationRange` |
| `computeOffsets` | `sarakComputeOffsets` |
| `deriveThemeFromReference` | `sarakDeriveThemeFromReference` |
| `deviceForWidth` | `sarakDeviceForWidth` |
| `findMissingThemeAxes` | `sarakFindMissingThemeAxes` |
| `getAllDesignTokens` | `sarakGetAllDesignTokens` |
| `getDefaultDesignState` | `sarakGetDefaultDesignState` |
| `getLocalComponent` | `sarakGetLocalComponent` |
| `getLocalComponentIds` | `sarakGetLocalComponentIds` |
| `getRegisteredModules` | `sarakGetRegisteredModules` |
| `getThemePreset` | `sarakGetThemePreset` |
| `isResponsiveValue` | `sarakIsResponsiveValue` |
| `isSafeLinkHref` | `sarakIsSafeLinkHref` |
| `moveCard` | `sarakMoveCard` |
| `registerLocalComponent` | `sarakRegisterLocalComponent` |
| `reorder` | `sarakReorder` |
| `resolveResponsiveValue` | `sarakResolveResponsiveValue` |
| `sanitizeRichText` | `sarakSanitizeRichText` |
| `subscribeToRegistry` | `sarakSubscribeToRegistry` |
| `warnOnIncompleteTheme` | `sarakWarnOnIncompleteTheme` |
| `widthOf` | `sarakWidthOf` |

### Mensagens de erro de campos são anunciadas

**Nota retroativa da 7.0.0.** `SarakInput` e os outros campos que usam `SarakFieldError` renderizam a mensagem com `role="alert"`, associada ao controle por `aria-describedby`. Testes que localizavam o erro apenas pelo texto devem consultá-lo pelo papel `alert`; leitores de tela anunciam a mensagem quando ela aparece.

**Por quê.** O prefixo permite distinguir os identificadores da biblioteca dos nomes locais do consumidor.

**Como migrar.** Substitua cada nome antigo pelo correspondente na coluna “Nome novo” dos imports e anotações de tipo.

**O que não mudou.** Nenhum comportamento, prop ou assinatura foi alterado junto com os nomes.

## 7.0.0 — A rolagem do `SarakAppChrome` passa para o painel de conteúdo

**Classificação: MAJOR** — páginas longas deixam de rolar no documento; a barra lateral e a barra superior passam a permanecer dentro da altura do cromo.

**O que muda.** A raiz do `SarakAppChrome` ocupa a viewport e contém o excedente. O painel marcado por `data-sarak-content` passa a ser a região rolável; a barra lateral só rola quando sua própria navegação não cabe. Isso mantém a navegação visível em telas longas e vale também para o modo de barra superior.

**Como migrar.** Mova usos de `window.scrollTo`, âncoras e integrações que dependiam da rolagem do documento para o painel de conteúdo. Em uso embarcado, preserve o comportamento anterior ou defina outra altura passando `style` ao `SarakAppChrome`; esse estilo continua sobrescrevendo a altura padrão da viewport.

---

## 7.0.0 — O conteúdo do cromo passa a respeitar o respiro do tema

**Classificação: MAJOR** — telas que já compensavam manualmente a distância até as bordas terão o layout deslocado.

**O que muda.** O conteúdo do `SarakAppChrome` agora recebe, nos quatro lados e nos três dispositivos, o valor de `layoutPadding` do tema. O mesmo token passa a governar também o respiro vertical do `SarakShell`; antes, esse espaço era parcialmente fixo e o modo ui-kit não tinha respiro próprio.

**Como migrar.** Remova a compensação de padding que sua tela tenha adicionado apenas para afastar o conteúdo das bordas. Para preservar o comportamento sem respiro, configure `layoutPadding` como `{ mob: 0, tab: 0, desk: 0 }` no tema.

---

## 7.0.0 — A classe utilitária passa a vencer o estilo padrão que a lib dá a botão, campo, título e texto (plan-77)

**Classificação: MAJOR** — nenhum export, prop ou token muda, mas a aparência muda sem o consumidor tocar
em nada: o mesmo critério das demais entradas da 7.0.0.

**O que estava errado.** O CSS da lib publica as camadas nesta ordem: `theme, base, components, utilities,
sarak-lib`. Os padrões que a lib dá a **elemento** — raio e hover de `<button>`, raio de `<input>`/`<select>`/
`<textarea>`, família/cor/tamanho de `h1`–`h6`, família de `span`/`p`/`div`, o estilo de borda de todo
elemento com classe de borda — moravam em `sarak-lib`, a **última** camada. Entre camadas quem decide é a
posição, não a especificidade: essas regras venciam **toda** classe utilitária do Tailwind no mesmo
elemento — da lib e a **sua**. Um `<button className="rounded-full">` do seu app saía com o raio do tema;
um `<h2 className="text-sm">` saía com o tamanho de título do tema; `hover:bg-*` em botão não aparecia.

**O que muda.** Esses padrões passam para uma camada entre o preflight e as utilitárias
(`components.sarak-elements`). A ordem publicada fica: preflight → **padrões de elemento da lib** →
utilitárias → classes próprias da lib (`rounded-btn`, `bg-theme-card`, `border-theme`…). Num elemento
com classe utilitária, **a classe decide**; sem classe, **vale o padrão da lib**, como antes. Vale nos dois
modos (`sarak.css` e `sarak-scoped.css`) e também para quem compila o `sarak-base.css` cru no próprio
Tailwind — a subcamada fica antes de `utilities` qualquer que seja a ordem em que os dois CSS carregam.

**O que você pode ver de diferente** — sempre algo que o seu código (ou o da lib) já declarava e não
recebia:

| Onde | Antes | Depois |
| --- | --- | --- |
| `<button>` com `rounded-*` | raio do tema (`btnBorderRadius`) | o raio da classe — é assim que a **pílula** do item de navegação da topbar passa a aparecer |
| `<button>` com `hover:bg-*` / `active:bg-*` / `focus-visible:*` | fundo de hover/ativo e anel de foco do tema | o que a classe diz |
| `<input>`/`<select>`/`<textarea>` com `rounded-*` | raio do token de campo | o raio da classe |
| Título (`h1`–`h6`) com `text-*`, `font-*` ou cor por classe | tamanho, peso, família e cor de título do tema | os da classe. Componentes da lib que põem classe de tamanho no próprio título passam a renderizar nesse tamanho |
| `span`/`p`/`div` com `font-*` (ex.: `font-mono`) | família de texto do tema | a família da classe |
| Elemento com `border-dashed`/`border-dotted` | o estilo de borda do tema (`borderStyle`) | o estilo da classe |
| Item de navegação sob o ponteiro | o hover primário de botão | o fundo do token `topbarHoverColor`/`sidebarHoverColor`, cujo default é `transparent` — **temas sem esses tokens ficam sem fundo de hover no item**, só com a troca de cor do texto |

**O que NÃO muda.** Sem classe, o padrão continua exatamente igual. O token `borderStyle` continua
chegando a todo elemento com `border`/`border-2`/`border-t`… — a ponte passou a alimentar também a variável
que essas utilitárias leem. Os quatro cantos do botão (`btnRadiusTL/TR/BR/BL`) continuam chegando ao
`SarakButton`/`SarakIconButton`: a classe `rounded-btn` passou a compô-los, com o raio mestre como reserva —
um tema com canto diferente do mestre (o `minimalist-airy`, por exemplo) segue com a mesma forma.

**Ainda NÃO cede à classe** (continua na última camada, por motivo):
- o `body` (tamanho, peso e entrelinha) — outra regra da lib também escreve `line-height` no `body`, e só a
  ordem atual garante que o token de entrelinha vença;
- o `transform` do botão pressionado (`:active`), que é `!important` — `active:scale-*`/`translate-*`
  continuam compondo, porque escrevem `scale`/`translate`, não `transform`.

**Como migrar.** Nada obrigatório. Onde a mudança for indesejada:
- **Uma classe sua que "não fazia nada" e agora aparece** — a classe estava errada e o padrão a escondia.
  Remova-a: sem classe, o padrão da lib volta.
- **Um título ou botão de componente da lib mudou** — a `className` que você passa ao átomo continua
  vencendo a dele (R35); passe a classe que quiser.
- **Hover do item de navegação sumiu no seu tema** — defina `topbarHoverColor`/`sidebarHoverColor` no tema.

### `globalBackgroundBlendMode` sai do schema (plan-78)

**Classificação: MAJOR** — remove um token do schema, do tipo público (`SarakDesignState`) e das
chaves aceitas por `validateDesign`.

**O que estava errado.** O token oferecia cinco modos de mesclagem (Overlay/Multiply/Screen/Soft
Light/Color Dodge) entre a imagem de fundo global e as cores do tema, mas `SarakBackgroundRenderer`
sempre renderizava em `'normal'` — regra do dono: qualquer outro modo produz resultado oposto entre
claro e escuro (o container alterna entre branco e preto). As outras quatro opções nunca tiveram
efeito visível; a descrição do próprio token já registrava a pendência.

**O que muda.** `globalBackgroundBlendMode` sai de `src/core/Design/schema/media.ts`, do tipo
`SarakDesignState`, de `PAYLOAD_EXTRA_KEYS`, do roteamento de persistência e do catálogo — e dos 15
temas embarcados que declaravam a chave. `SarakBackgroundRenderer` deixa de aceitar a prop
`blendMode`; a mesclagem `'normal'` continua fixa no código, como sempre foi na prática.

**Como migrar.** Nada obrigatório. Um tema (seu ou persistido em `localStorage`) que ainda carregue
`globalBackgroundBlendMode` tem a chave descartada por `validateDesign`, com um único
`console.warn` por sessão — não a cada render. Remova a chave do seu tema para não vê-lo mais.

### 12 temas saem do catálogo shippado — recalibração da vitrine (plan-80)

**Classificação: MAJOR** — encolhe a união pública `ThemePresetId` e `GLOBAL_THEMES`/`THEME_PRESET_IDS`
perdem 12 entradas.

**O que muda.** Decisão do dono: o catálogo de 23 temas concentrava demais num só canto (escuro + neon +
ciano/magenta, medido em `specs/09-temas-e-presets.md` §5.2) e parte dele não representava bem a
capacidade da biblioteca. Saem do catálogo:

`crystal-glass`, `holographic-glass`, `nature-breeze`, `dot-matrix-elegant`, `asymmetric-editorial`,
`stellar-nebula`, `industrial-dashboard`, `terracota-solar`, `musgo-do-vale`, `ardosia-ao-entardecer`,
`forja-ultravioleta`, `grafite-puro`.

Os dois temas de referência (`SARAK_REFERENCE_THEMES` — `minimalist-airy` claro, `sarak-sovereign` escuro)
**continuam existindo com os mesmos ids**, inalterados nesta entrada. O conteúdo dos 11 que ficam mudou em
seguida, na mesma versão — ver a entrada "Catálogo recalibrado" mais abaixo.

**O que acontece com quem já tem um dos 12 ids salvo** (`activeThemeId`, `initialTheme`, ou um id restaurado
de persistência própria do consumidor e re-passado numa dessas duas props): a lib nunca fica sem tema e
nunca lança. Ela cai no tema de referência do **modo pedido** — o de `config.mode`, se você passar um
explícito, senão o modo atual do design (para quem já tinha um tema no ar e muda de id em runtime), senão
escuro (o default do schema) — e emite **um** `console.warn` nomeando o id que não foi encontrado.

**Como migrar.** Troque o id salvo por um dos 11 que continuam no catálogo (`GLOBAL_THEMES`/
`THEME_PRESET_IDS` são a fonte viva), ou por um tema seu via `customThemes`. Não fazer nada não quebra a
tela — o consumidor cai na referência do próprio modo, com o aviso no console apontando a causa.

### `SarakBadge` `muted` deixa de usar o token de borda como fundo (plan-81)

**Classificação: MAJOR** — nenhum export, prop ou token muda, mas a variante `muted` (o default quando
`soft`) muda de cor sem o consumidor tocar em nada.

**O que estava errado.** O fundo da variante soft usava `--theme-border` — o token de `cardBorderColor`,
cujo contrato é "borda sutil, baixa opacidade", não fundo. Num tema de borda opaca (`neo-brutalism`, borda
branca sólida), o badge saía branco sobre branco — contraste ~1:1, medido na tela.

**O que muda.** O fundo passa a usar `--theme-surface` (`cardBackgroundColor` — contrato de fundo de
superfície). O par texto×fundo resultante (`textColorMuted`/`cardBackgroundColor`) já é um dos pares que o
`auditor_contraste` (R31) mede, e passa 4,5:1 em todo tema shippado, nos dois modos.

**Como migrar.** Nada obrigatório. Se você mirava `--theme-border` por CSS externo para customizar o fundo
deste badge, mire `--theme-surface`.

### Catálogo recalibrado: 3 temas novos e 11 que mudam o que o usuário vê (plan-80)

**Classificação: MAJOR** — nenhum export, prop ou token muda de forma, mas temas que **mantêm o id** passam a
renderizar diferente sem o consumidor tocar em nada: o mesmo critério das demais entradas da 7.0.0. Vale para
quem aplica um tema shippado por `initialTheme`/`activeThemeId`, ou o tem salvo no design do sistema.

**O que entra.** Três ids novos em `THEME_PRESET_IDS` e `GLOBAL_THEMES` (o catálogo passa de 11 para 14):
`golden-hour` (claro, dourado, sidebar à direita), `aurora-veil` (claro, lavanda, vidro fosco, topbar) e
`blueprint-protocol` (escuro, azul, sidebar flutuante, botão wireframe). A união `ThemePresetId` cresce —
código seu que faz `switch` exaustivo sobre ela precisa de três casos a mais.

**O que muda para quem já tinha um dos ids abaixo aplicado**, cada um com o que era e o que passa a ser:

| Tema (id mantido) | Antes | Depois |
| --- | --- | --- |
| `data-terminal` | **escuro** nativo, ciano sobre preto, com partes claras misturadas (cabeçalho de card branco sobre corpo preto) | **claro** nativo, verde vívido sobre quase-branco, monoespaçado, sidebar. Quem o tinha aplicado abre a tela clara |
| `synthwave-retro` | magenta/ciano neon sobre roxo quase preto | laranja sobre céu de dusk em ameixa (fundo de luminosidade média); continua escuro nativo, com grid retrô |
| `neo-brutalism` | acentos ciano (item ativo, botão de ação do card) num tema vermelho/preto | os mesmos acentos em vermelho, a cor do próprio tema |
| `neumorphic-mobile` | acentos azul genérico (item ativo, botão de ação, switch) | os mesmos acentos no rosa pastel do próprio tema |
| `nebula-space` | imagem de fundo hospedada em terceiro | sem imagem de fundo (`globalBackgroundImageUrl: ''`) |
| `kinetic-flow` | vídeo de fundo hospedado em terceiro, e `description` que o prometia | sem vídeo de fundo; `description` reescrita |

**O que muda em todos os 11 que já existiam:**

- **Hover do item de navegação.** Os que tinham o fundo de hover `transparent` (só a cor do texto trocava)
  ganham um fundo perceptível, nas duas orientações. A varredura de realce do `SarakMenuItem` agora mede o
  fundo de hover de todo tema, nos dois modos.
- **Idiomas.** Todo tema shippado declara `enabledLanguages` com os seis idiomas da lib (`pt`, `en`, `es`,
  `fr`, `de`, `it`). Pela regra de montagem do seletor (entrada "O seletor de idioma passa a gravar
  preferência…", abaixo), quem **oferece** `language` no painel passa a ver o seletor com os seis; quem não
  oferece continua sem ele.
- **Contraparte autorada em todos.** Antes, só 2 dos 11 tinham (`sarak-sovereign` e `minimalist-airy`); o
  modo oposto dos outros nove vinha do fallback sintetizado (`syncThemeWithMode`). Agora todo tema tem o bloco autorado, e a lista de isenção do
  `auditor_contraste` terminou vazia. Quem alternava para o modo oposto num destes vê um resultado
  **diferente** do sintetizado — de propósito.

**Como migrar.** Nada obrigatório: a tela nunca fica sem tema e nada lança. Onde a mudança for indesejada:

- **`data-terminal` claro demais para o seu app** — peça o modo escuro (`updatePreferences({ colorMode:
  'dark' })`, a mesma porta do alternador de tema): a contraparte é um terminal escuro verde sobre preto. **O
  visual escuro ciano de antes não existe mais no catálogo**; para mantê-lo, copie os valores da versão
  anterior da lib (histórico do Git da tag) para um tema seu em `customThemes`.
- **Qualquer outro** — o mesmo caminho: um tema seu em `customThemes`, ou `deriveThemeFromReference` a partir
  de `minimalist-airy`/`sarak-sovereign`, que continuam com os mesmos ids e o mesmo papel de referência.
- **Mídia de fundo que você quer de volta** (`nebula-space`, `kinetic-flow`) — aponte o
  `globalBackgroundImageUrl` do **seu** tema para um ativo **seu**; a lib não hospeda nem referencia mídia de
  terceiro.

---

## A barra de preferências do usuário passa a ser configurável pelo administrador (plan-74)

**Classificação: aditiva, não MAJOR.** O token de posição de cada preferência (`preference*Position`,
schema `preferences.ts`) já existia; esta entrada só cobre a UI nova que o lê — o widget ⚙ "Preferências",
os controles fixados na barra e a seção do painel que os configura. **O padrão de fábrica não muda a barra**
de nenhum consumidor: `colorMode` e `navCollapsed` continuam `pinned` (exatamente os widgets que já existiam
— ADR-014 no `SarakAppChrome`, sempre-ligados no `SarakShell`); `fontSize`, `navigationStyle` e `language`
continuam `off` — e nenhum tema shippado ou de consumidor declara essas três chaves hoje.

**O que passa a existir**, nos dois cromos (`SarakAppChrome` e `SarakShell`) e no drawer mobile:

- Para cada uma das 5 preferências, o administrador escolhe no painel (nova seção "Barra de Preferências do
  Usuário") uma de três posições: **não oferecida** (nada), **no menu** (item dentro do ⚙ "Preferências") ou
  **fixa na barra** (controle direto — e também dentro do ⚙, quando ele existe).
- **O ⚙ só nasce quando pelo menos uma preferência está em `menu`.** Uma barra só com fixadas (o padrão de
  fábrica) não o faz aparecer — não existe botão que abre um painel vazio, e por isso o padrão de fábrica
  fica idêntico ao de hoje.
- Duas preferências novas ganham controle: **tamanho da fonte** (P/M/G, `ShellFontSizeControl`) e
  **navegação topo/lateral** (`ShellNavigationStyleControl`). O seletor de idioma (plan-75) e a alternância
  de tema/colapso (plan-73/ADR-014) reusam os componentes que já existiam.
- **No celular, tudo o que é oferecido vai para o drawer**, fixado ou não — não há ⚙ separado ali (Spec 05
  §2.3, "nada some"); a exceção é `navCollapsed`, que nunca ganha linha própria no drawer porque o próprio
  hambúrguer já é o controle de colapso.
- **O `widgets` do `SarakAppChrome` continua sendo o teto do código** (`themeToggle`/`collapse`): o que o
  desenvolvedor desligou ali não volta pela configuração do tema. O `SarakShell` não tem essa camada — só a
  posição do tema decide.

**Quem quiser o comportamento novo** não precisa fazer nada além de abrir o painel e mudar a posição de uma
preferência — a barra de todo mundo que não tocar nisso continua exatamente como está.

**A única exceção — o seletor de idioma do `SarakShell`.** Antes deste par de plans (74 + 75), o Shell
renderizava o seletor de idioma **sem condição nenhuma**; o `SarakAppChrome` nunca o teve. Com o padrão de
fábrica desta plan (`language` = `off`), o Shell passa a escondê-lo também — é o único dos cinco widgets em
que "o padrão de fábrica não muda a barra" não se aplica, porque só o Shell tinha esse widget sempre ligado,
sem teto de `widgets` (que só o `SarakAppChrome` tem). Quem quiser o seletor de volta no Shell **oferece
`language` no painel** (`pinned` ou `menu`) — e, com a plan-75 no mesmo release, também precisa de
`enabledLanguages` com dois ou mais códigos no tema (ver a entrada abaixo).

---

## O seletor de idioma passa a gravar preferência do usuário, e o host pode traduzir a própria aplicação (plan-75)

**Classificação: MAJOR** — mesmo critério das entradas anteriores desta lista: mudar o default é MAJOR
mesmo sem tocar em export, prop ou token. `ShellLanguageSelector` deixava a escolha morrer num
`useState` local (`pt-BR`/`en-US` fixos, sempre visíveis); agora ele lista os idiomas que o **tema**
habilita (`design.enabledLanguages`) e grava a escolha como **preferência** do usuário
(`updatePreferences({ language })`, a mesma camada do plan-73 — nunca no tema).

**O que muda.**

- **A lista vem do tema, não é mais fixa.** Sem `enabledLanguages` no `design` (o caso de todo tema
  shippado hoje, e de qualquer tema de consumidor que nunca declarou o eixo), o seletor **não tem o que
  listar**. Com um idioma só, também não há escolha possível.
- **Consequência direta — regra de montagem (ADR-014, "só monta quando tem com o que funcionar"):** o
  seletor deixa de renderizar sempre. Ele só aparece com **dois ou mais** idiomas em
  `design.enabledLanguages`. Um host que já usava o painel (`LanguageTab`) para habilitar mais de um
  idioma não percebe diferença; um host que nunca configurou o eixo deixa de ver o seletor onde antes via
  o par fixo `pt-BR`/`English`. **No `SarakShell`, há uma segunda condição, que vem de outra entrada desta
  lista (plan-74):** o `enabledLanguages` deixou de ser suficiente sozinho — o Shell só monta o seletor
  quando `language` também está **oferecido** no painel (`pinned` ou `menu`; o padrão de fábrica é `off`).
  O `SarakAppChrome` nunca teve o seletor por padrão, então essa segunda condição não é novidade para ele.
- **A escolha sobrevive a recarregamento e não vaza para o sistema.** Antes, trocar de idioma no seletor
  não persistia nada (estado local, morria no F5) e não alcançava lugar nenhum. Agora persiste por
  usuário, sincroniza entre abas e chega à porta opcional `options.preferences.onSave` — a mesma porta e o
  mesmo `useSarakPreferences().updatePreferences()` do plan-73, generalizados para a quinta preferência
  (`language`). **Só para GRAVAR** — para LER o idioma que vale, ver abaixo: não é o mesmo canal.
- **O getter antigo `getLocalComponent('shell-language-selector')` foi removido na 8.0.0.** Para
  substituir o seletor de idioma, use `window.__SARAK_OVERRIDES__['shell-language-selector']`, como
  documentado em `specs/specs/05-cromo-e-slots.md` §2.2.2. O override continua independente da regra
  de montagem acima porque quem decide o que aparece ali passa a ser o host.

**O que a lib continua NÃO fazendo.** Ela entrega a **escolha**, não o **texto traduzido**: não há motor de
tradução nesta biblioteca, e os textos da própria lib não são afetados por esta mudança. Traduzir as telas
da aplicação é do host — é exatamente o que a porta abaixo existe para viabilizar.

**Como o host lê a escolha e traduz a própria aplicação.** Pelo `design` público de `useSarakUI()` — o
estado EFETIVO (tema com as preferências oferecidas sobrepostas), nunca `useSarakPreferences().preferences`
direto: a preferência crua não é o idioma que vale. `design.language` já resolve os três casos —
preferência ausente (cai no idioma do tema), preferência para uma posição que o administrador desligou no
painel (`preferenceLanguagePosition: 'off'`, o padrão de fábrica — cai no idioma do tema) e preferência para
um idioma que o administrador **desabilitou** depois de salva (`enabledLanguages` não contém mais aquele
código — cai no idioma do tema). Ler a preferência crua reabre os três: aplica um idioma desligado, ignora
que o administrador nunca ofereceu a troca, ou aplica um idioma que o tema não habilita mais.

É reativo (React re-renderiza sozinho a cada troca; não há polling nem callback novo a assinar) e a mesma
leitura já funciona entre abas, porque a camada de preferências sincroniza pelo `storage` event. Exemplo com
`i18next` (qualquer outra biblioteca de i18n do host se encaixa do mesmo jeito — a lib não sabe qual o host
usa):

```tsx
import { useEffect } from 'react';
import i18n from 'i18next';
import { useSarakUI } from '@sarak/lib-ui-core';

function AppI18nBridge() {
    const { design } = useSarakUI();

    useEffect(() => {
        if (design.language) {
            i18n.changeLanguage(design.language);
        }
    }, [design.language]);

    return null;
}
```

**Como migrar.** Quem quer o seletor visível declara `enabledLanguages` com dois ou mais códigos no tema
(painel → aba de Idioma, ou o campo direto no JSON do tema) — e, no `SarakShell`, também oferece `language`
na seção "Barra de Preferências do Usuário" do painel (plan-74), já que lá ele deixou de vir sempre ligado.
Quem quer manter o par fixo de antes, independente do tema, monta o próprio componente pelo caminho de substituição
(`window.__SARAK_OVERRIDES__['shell-language-selector']`), que não mudou. Quem já lia
`design.language`/`design.enabledLanguages` diretamente continua funcionando sem alteração — só a
**escolha do usuário final**, que antes não ia a lugar nenhum, agora tem onde pousar.

---

## O alternador de tema e o toggle de recolher deixam de mudar o TEMA do sistema — agora gravam preferência do usuário (plan-73)

**Classificação: MAJOR** — `ShellThemeToggle` (usado pelos dois cromos, `SarakAppChrome` e `SarakShell`) e o
toggle de recolher (`ChromeCollapseToggle` no modo ui-kit, o hambúrguer/chevron do `SarakShell` no modo
módulos-plugin) deixam de escrever no `design` do sistema. Antes, o clique de **um** usuário final —
alternar claro/escuro, recolher a navegação — reescrevia o tema de **todos**, porque a única gravação que
existia era a do tema (`persistDesign`, `localStorage` + `persistence.onSave`, debounce de 1,5s).

**O que muda.** Existe uma camada nova de **preferências do usuário**, separada do tema: sobreposta ao
design ao renderizar, guardada por usuário, e nunca gravada como tema. As duas ações acima passam a gravar
ali — hook público `useSarakPreferences()`, campo `preferences` + `updatePreferences` em `useSarakUI()`, e a
porta opcional `options.preferences` (`storageKey`, `onSave`, `onLoad`) para quem quer guardar por usuário
no servidor. O conjunto é fechado: `colorMode` (`'light' | 'dark' | 'system'`), `fontSize`
(`'sm' | 'md' | 'lg'`, escala relativa à base do tema — degrau a degrau sobre `bodySize`, o token que de
fato emite `--theme-font-size-base`), `navigationStyle` (`'topbar' | 'sidebar'`), `navCollapsed` (boolean)
e `language` (string, só como dado — a tradução funcional fica para um passo seguinte).

**Cinco tokens novos no `design`, um por preferência** — `preferenceModePosition`,
`preferenceFontSizePosition`, `preferenceNavigationStylePosition`, `preferenceNavCollapsePosition`,
`preferenceLanguagePosition` — cada um `'off' | 'menu' | 'pinned'`. É o administrador, no tema, quem
decide se cada preferência aparece e onde; a posição vive no `design` (persiste com o resto do tema, no
mesmo `PUT`) e nunca em um campo fora dele. **Padrão de fábrica — a barra de hoje, sem nenhuma mudança
visível:** modo e recolhimento nascem `'pinned'`; fonte, navegação e idioma nascem `'off'`.

**Por quê.** O tema é do administrador, e continua sendo — a preferência é do usuário final, e não deveria
existir só uma gaveta (`design`) para os dois guardarem. Medido no consumidor real: o tema salvo no servidor
carregava `navigationStyle`/`sidebarPosition`/`navbarLayout`/`contentAlignment` dos testes do dono no
painel, porque o painel e o alternador de tema escreviam no mesmo lugar.

**A troca de modo preserva a customização do administrador.** Escolher claro/escuro só troca os tokens que
a contraparte autorada do tema declara (specs/09 §2.1) — cor de marca, navegação, imagem de fundo e
qualquer outro token fora da contraparte continuam exatamente como o administrador configurou. Sem
contraparte, o fallback sintetizado de sempre (`syncThemeWithMode`) continua valendo.

**Como migrar.** Quem lia `design.mode`/`design.isNavHidden` para saber o estado atual continua funcionando
sem mudar nada — `useSarakUI().design` (e `activeDesign`) já é o **efetivo**: tema com as preferências
oferecidas sobrepostas. Quem editava o **tema** pelo painel administrativo também não muda: o painel lê e
grava `sarak.systemDesign` (o persistido puro), nunca o efetivo. Quem já implementava a própria alternância
de tema/colapso chamando `applyConfig`/`applyFullConfigRaw` diretamente **deve migrar para
`updatePreferences`**, senão volta a reescrever o tema do sistema. Quem quer voltar ao comportamento antigo
(alternador de tema grava o tema, para todos) grava direto em `applyFullConfigRaw`/`persistDesign`, como
antes — a porta continua pública, só deixou de ser o caminho dos dois widgets default.

---

## Revisão da métrica do item de navegação horizontal — a caixa alta sai, o corpo sobe (plan-68)

**Classificação: MAJOR** — comportamento default muda de novo, sem opt-in, para quem usa
`navigationStyle: 'topbar'` (o mesmo critério que já classificou majors anteriores desta lista: mudar o
default é MAJOR mesmo sem tocar em export, prop ou token).

**Encadeamento com a entrada abaixo.** Esta entrada revisa **parte** do que
"`SarakNavItem` — átomo próprio para item de navegação do cromo" (mais abaixo nesta lista) descreveu:
aquela introduziu, no ramo `horizontal`, `uppercase`/`tracking-widest`/corpo em `text-2xs` — paridade
deliberada com o `TopbarNav` do Shell, fixada como decisão na ADR-013. O dono decidiu reverter a caixa alta
em 2026-09-09; o **núcleo** da ADR-013 — item de navegação é átomo próprio, com métrica de navegação e não
de botão de ação — continua vigente. Só o valor tipográfico do ramo `horizontal` muda.

**O que muda**, só no ramo `horizontal` de `SarakMenuItem` (e em tudo que o compõe — `SarakShellNav`,
`SarakAppChrome*`, `TopbarNav` do Shell), medido em navegador real sobre o `dist/` publicado:

| Propriedade computada | Antes | Depois |
| --- | --- | --- |
| `text-transform` | `uppercase` | `none` |
| `letter-spacing` | largo (`tracking-widest`) | `normal` (`tracking-normal`) |
| `font-size` | `text-2xs` (10px) | `text-sm` — corpo legível de navegação |

**O que NÃO muda.** A pílula (`rounded-full`), o peso do item ativo, o truncamento e o ramo `vertical`
(sidebar/drawer) — todos inalterados. Nenhum export, prop ou token novo.

**Como migrar.** Nada obrigatório. Quem já escrevia a própria `className` para reverter a caixa alta — a
saída que a entrada anterior já descrevia, via R35 (a `className` do chamador vence o default do átomo) —
pode remover essa `className` agora: o default passou a fazer isso sozinho.

**Achado corrigido junto, sem efeito de superfície pública.** `useButtonLayoutStyles` (o Hook Controlador
que `SarakButton` usa para largura) só deixava de emitir o piso `min-w-fit` quando a largura cheia vinha
pela prop `fullWidth` ou pelo tema (`buttonWidthStrategy: 'full'`); quem pedia largura cheia só pela
`className` (`<SarakButton className="w-full">`) continuava com o piso de `min-width` do conteúdo preso,
porque `min-w-fit` e `w-full` são grupos de propriedade diferentes e o merge não os resolve um contra o
outro. Agora a `className` também conta.

---

## 7.0.0 — O cromo do modo ui-kit nasce com busca, alternância de tema, widget de usuário e colapso da navegação por padrão (plan-67)

**Classificação: MAJOR** — `SarakAppChrome` (e o colapso mobile, `SarakAppChromeMobile`) passam a montar, sem o
consumidor escrever uma linha: busca (com atalho Ctrl/Cmd+K), alternância de tema, widget de usuário e o
toggle de colapso da navegação. Antes, o cromo do modo ui-kit não montava nenhum dos quatro — eles já eram
componentes públicos (`ShellSearchWidget`, `ShellThemeToggle`, `ShellUserWidget`), mas o consumidor tinha
que importar e encaixar cada um manualmente num slot.

**Por quê.** O cromo do modo módulos-plugin (`SarakShell`) sempre entregou os quatro prontos; o do modo
ui-kit (`SarakAppChrome`) não entregava nenhum — não por decisão, mas porque nasceu para fechar um sintoma
pontual (*"topbar e sidebar não aparecem"*), como o mínimo para o cromo existir. A base já resolveu essa
pergunta duas vezes no mesmo sentido — layout multidispositivo é zero-config
([[07-responsividade-e-multidispositivo]] §1), e os hosts de toast/overlay já nascem montados — então exigir
trabalho do consumidor para o cromo completo era bug da lib, não característica.

**O que mudou.**

| Prop nova em `SarakAppChromeProps` | Contrato |
| --- | --- |
| `widgets?: { search?, themeToggle?, user?, collapse? }` | Opt-out por widget. **Omitir a prop liga os quatro**; `false` num campo desliga só aquele — os demais continuam. |
| `user?: ShellUser` / `logout?: () => void` | Alimentam o widget de usuário default. **Sem `user`, o widget não monta** — a lib não inventa uma identidade "User" genérica. Sem `logout`, o widget monta mas sem o botão de sair (é assim também em `ShellUserWidget` chamado direto, fora do cromo). |
| `SarakSearchProps.items?` / `.onSelect?` (aditivo, retrocompatível) | O `SarakSearch` (o command palette que o atalho abre) aceita uma lista de itens e um seletor próprios. O cromo alimenta os dois com a mesma navegação (`navItems`/`nav`) e o mesmo `onNavigate` que já recebe — por isso a busca default do modo ui-kit **lista e navega**, em vez de responder sempre "No results". Omitidos, o `SarakSearch` continua pelo registro do Discovery, como sempre — o `SarakShell` não muda. |

**Como migrar.** Quem quer o cromo vazio de antes:

```tsx
<SarakAppChrome widgets={{ search: false, themeToggle: false, user: false, collapse: false }}>
    {children}
</SarakAppChrome>
```

**Atenção a quem já monta um dos widgets à mão.** A busca continua no slot `search` — quem já a preenche
não vê nada em dobro, porque o conteúdo do slot sempre venceu, e continua vencendo, o default
([[05-cromo-e-slots]] §2.2). **Tema e usuário são diferentes: não têm slot.** Se você já monta
`ShellThemeToggle`/`ShellUserWidget` à mão dentro de `topbarEnd`/`sidebarFooter` (ou de qualquer outro
slot), a partir desta versão vai ver **os dois exemplares** — o seu e o default, que nasce numa região
própria (`data-sarak-widget`, fora dos 8 slots documentados, então não compete com nenhum deles). Desligue
o default correspondente:

```tsx
<SarakAppChrome widgets={{ themeToggle: false, user: false }} topbarEnd={<MeuThemeEUsuario />}>
    {children}
</SarakAppChrome>
```

**O que NÃO mudou.** Os oito slots do contrato (`logo`, `topbarStart`, `topbarEnd`, `sidebarHeader`,
`sidebarFooter`, `banner`, `footer`, `decoration`) continuam exatamente como eram — ausente = não
renderiza. Seletor de idioma (`ShellLanguageSelector`), redimensionamento por arraste e auto-hide **não**
entram no conjunto padrão — ficam fora dele por decisão explícita, disponíveis por slot/prop/token como já
eram. O atalho Ctrl/Cmd+K só escuta quando a busca default está realmente em uso — desligada por opt-out,
sem `SarakUIProvider`, ou com o slot `search` preenchido pelo consumidor, o atalho fica livre para o
navegador (e, com `search` preenchido, para o que o consumidor montou ali). `SarakShell` não muda.

---

## 7.0.0 — As quatro mídias de atmosfera hospedadas por terceiro viram atmosfera gerada em CSS (plan-69)

**Classificação: MAJOR** — os quatro presets de "Mídia Base" do painel (`bg-kinetic-flow`,
`bg-stellar-nebula`, `bg-cyber-grid-img`, `bg-dark-cinematic`) deixam de apontar para
`test-videos.co.uk`/`images.unsplash.com` e passam a aplicar uma atmosfera gerada 100% em CSS pelo
mesmo motor das 40 texturas (`src/styles/_atmosphere.css`). Os quatro `id` **continuam existindo** —
não é remoção de preset — mas o `design` que cada um aplica mudou.

**Por quê.** Uma biblioteca plug-and-play não pode ter uma aba do catálogo que depende de rede, de
CSP permissiva ou de uma URL de terceiro continuar respondendo — e hospedar os arquivos originais
(~2,9 MB) traria licença de redistribuição (Unsplash License + CC-BY do vídeo *Big Buck Bunny*) que
uma lib zero-marca não tem onde carimbar. Ver [[adr/006-zero-marca-soberania-host]] e
[[09-temas-e-presets]] §8 (item 1 do backlog, fechado por esta plan).

**O que mudou.**

| Preset (`id`) | Antes | Depois |
| --- | --- | --- |
| `bg-kinetic-flow` | `globalBackgroundImageUrl` → vídeo MP4 em `test-videos.co.uk` | `texture: 'aurora'`, `textureOpacity: 0.35` |
| `bg-stellar-nebula` | `globalBackgroundImageUrl` → foto em `images.unsplash.com` | `texture: 'nebula'`, `textureOpacity: 0.4` |
| `bg-cyber-grid-img` | `globalBackgroundImageUrl` → foto em `images.unsplash.com` | `texture: 'blueprint-pro'`, `textureOpacity: 0.3` |
| `bg-dark-cinematic` | `globalBackgroundImageUrl` → foto em `images.unsplash.com` | `texture: 'grain'`, `textureOpacity: 0.18`, `vignetteOpacity: 0.55` |

Todos os quatro passam a gravar `globalBackgroundImageUrl: ''` — para limpar, ao reaplicar o preset,
uma URL de mídia que uma versão anterior dele possa ter deixado no seu tema.

**Afeta você se** clicou em um destes quatro presets pelo painel e salvou o resultado (`localStorage`,
`customThemes`, ou exportou o tema). Nesse caso, o valor persistido é o **dado literal** que o clique
gravou naquele momento — `globalBackgroundImageUrl` com a URL antiga —, não uma referência ao `id` do
preset. **Nada muda sozinho na sua tela:** `globalBackgroundImageUrl` continua existindo com a mesma
assinatura, e `SarakBackgroundRenderer` continua servindo a URL exatamente como antes, contanto que
ela ainda resolva na rede do seu usuário. Reabrir o painel e clicar de novo no mesmo preset agora
aplica a atmosfera nova (CSS, sem URL) por cima do que estava salvo.

**O que NÃO mudou.** `globalBackgroundImageUrl`, `globalBackgroundBlur`, `globalBackgroundOpacity` e
`globalBackgroundBlendMode` continuam com a mesma assinatura — é a porta de foto/vídeo do **seu**
ativo, por upload no painel ou por URL própria. `TEXTURE_PRESETS` e as 40 texturas não mudaram. Quem
nunca usou os quatro presets de mídia não vê diferença nenhuma.

---

## Contraparte autorada nos dois temas de referência + porta de derivação `deriveThemeFromReference` (plan-64)

**Classificação: MINOR** — capacidade nova, aditiva. `minimalist-airy` e `sarak-sovereign` (os dois
de `SARAK_REFERENCE_THEMES`) ganharam `contraparte` autorada; nenhum export existente mudou de
forma, e o comportamento de quem nunca troca de modo é idêntico ao de antes.

**O que estava quebrado.** Só 5 dos 23 temas embarcados tinham `contraparte` — os dois de
referência não. Sem ela, `resolveThemeForMode` caía no fallback `syncThemeWithMode`
([[09-temas-e-presets]] §2.1), que satura nos dois sentidos e não é reversível: `escuro → claro →
escuro` devolvia faixa de faixa, não o original. Como o resultado convertido é **gravado** no
design do sistema (decisão D, `plan-24-1`), cada ida e volta afastava mais.

**O que passa a existir.** Os dois ganharam `contraparte` medida pelo `auditor_contraste` (R31) em
**0 reprovados nas duas passadas**, preservando a temperatura de cada tema (a mesma família de
matiz da própria marca — a navy de `minimalist-airy`, o slate-azul dos cards de `sarak-sovereign`)
em vez de convergir para uma paleta neutra. E uma porta nova, `deriveThemeFromReference`, para
quem parte de uma referência:

```ts
import { deriveThemeFromReference, SarakUIProvider } from '@sarak/lib-ui-core';

const meuTema = deriveThemeFromReference('minimalist-airy', {
  id: 'erp-theme',
  name: 'ERP',
  design: { primaryColor: ERP_BLUE, accentColor: ERP_BLUE, btnPrimaryBg: ERP_BLUE },
});

<SarakUIProvider customThemes={[meuTema]} initialTheme="erp-theme">…</SarakUIProvider>
```

`meuTema` já sai **completo** — `design` **e** `contraparte` — com a sobreposição de marca coerente
nos dois modos.

**Afeta você se** hoje monta um tema de consumidor assim:

```ts
// ANTES — copia só METADE do tema; a contraparte fica para trás.
const meuTema = { id: 'erp-theme', name: 'ERP', design: { ...REF.design, primaryColor: ERP_BLUE } };
```

Espalhar `...REF.design` (onde `REF` vem de `SARAK_REFERENCE_THEMES`, ou de `getThemePreset`) nunca
copiou `contraparte` — o campo nem é mencionado na desestruturação. Resultado: seu tema derivado
nasce **sem** contraparte, cai no mesmo fallback saturante que os 18 legados, e trocar de modo
degrada em silêncio, exatamente como cair no fallback fazia antes desta plan para os dois temas de
referência. **Troque para `deriveThemeFromReference`** (exemplo acima) — ela aplica a sobreposição
em `design` e espelha, nos casos em que a chave também exista na `contraparte` da referência, para
que o valor apareça igual nos dois modos.

**O que NÃO mudou.** Os outros 16 temas isentos continuam isentos — esta plan encolheu a
`CONTRAPARTE_EXEMPTION_LIST` em dois, não a esvaziou. `SARAK_REFERENCE_THEMES` continua sendo o
mesmo par de ids (`minimalist-airy`, `sarak-sovereign`) — só o conteúdo interno ganhou a
contraparte.

---

## Os quatro widgets do cromo — busca, tema, usuário e idioma — ficam públicos (plan-65)

**Classificação: MINOR** — capacidade nova, aditiva: nenhum export existente mudou de forma, e o
comportamento dentro do `SarakShell` é idêntico ao de antes (os três renderizadores do Shell —
`SidebarNav`/`TopbarNav`/`DockNav` — passaram a importar do novo caminho, sem mudar o que
compõem). Só ficou possível o que antes não era: montar cada widget por conta própria, fora do
Shell.

**O que estava faltando.** `ShellSearchWidget`, `ShellThemeToggle`, `ShellUserWidget` e
`ShellLanguageSelector` moravam em `src/core/Shell/Components/` — fora das raízes que
`scripts/publicComponents.mjs` varre (`components/atomic/`, `components/engines/`,
`components/Layout/`). Não estavam no barril público, não apareciam no catálogo, e nenhum dos 8
slots do `SarakAppChrome` tinha com o que ser preenchido por eles: quem usa o modo ui-kit (sem
`SarakShell`) simplesmente não podia importar busca, alternância de tema, widget de usuário nem
seletor de idioma — tinha de escrevê-los do zero.

**O que passa a existir.** Os quatro foram realocados para `src/components/atomic/Navigation/` —
a categoria que já hospeda os átomos de cromo (`SarakMenuItem`, `SarakShellNav`) — com os tipos de
props (`ShellSearchWidgetProps`, `ShellThemeToggleProps`, `ShellUserWidgetProps`,
`ShellLanguageSelectorProps`) exportados junto. Cada um já funcionava sem pressupor o `SarakShell`
— lê só props, o `SarakUIProvider` e, opcionalmente, o registro do Discovery (que, sem nenhum
módulo registrado, devolve lista vazia em vez de quebrar).

```tsx
import { SarakUIProvider, SarakAppChrome, ShellThemeToggle, ShellUserWidget } from '@sarak/lib-ui-core';

<SarakUIProvider>
  <SarakAppChrome
    topbarEnd={<ShellThemeToggle variant="horizontal" />}
    sidebarFooter={<ShellUserWidget user={user} logout={logout} variant="vertical" />}
  >
    {children}
  </SarakAppChrome>
</SarakUIProvider>
```

**Correção incluída, sem efeito visual hoje:** o ramo `horizontal` do `ShellLanguageSelector`
mantinha um `font-black` herdado do default do `SarakButton` que a `className` passada nunca
neutralizava (só `normal-case`/`tracking-normal`, nunca o peso) — resíduo do mesmo padrão que a
ADR-013 já havia corrigido nos itens de lista. Ganhou `font-normal` ao lado. Sem efeito visual
porque o texto interno (`text-3xs font-black`) já define o próprio peso.

**Afeta você se** montava um destes quatro por deep import interno (fora do contrato — nunca
suportado) apontando para `core/Shell/Components/*`: o caminho não existe mais, importe pelo nome
público (`import { ShellUserWidget } from '@sarak/lib-ui-core'`).

**O que NÃO mudou.** `SarakAppChrome` continua sem montar nenhum widget por padrão — publicá-los
é o que esta entrada faz; decidir o que ocupa cada slot por padrão é decisão de produto separada.
`SarakShell` renderiza os mesmos quatro, com o mesmo comportamento.

---

## Correção: o átomo de item de navegação passa a se chamar `SarakMenuItem` — `SarakNavItem` nunca chegou a ser importável

**Classificação: correção, não quebra.** O átomo descrito na entrada logo abaixo ("`SarakNavItem` — átomo
próprio para item de navegação do cromo") **nunca esteve alcançável pelo barril público**, então renomeá-lo
não retira capacidade de ninguém — não há tag publicada em que `import { SarakNavItem }` alguma vez tenha
devolvido o componente.

**O defeito.** `src/index.ts` já exportava `SarakNavItem` como **tipo** (`export type { …, SarakNavItem }
from './components/Layout/SarakAppChrome'` — a forma do dado da prop `navItems`). Quando o átomo de
navegação entrou em `components/atomic/Navigation/` com o mesmo nome, o barril de categoria o expôs por
`export *`, mas em ES/TS um **export explícito sombreia `export *`** — então o nome `SarakNavItem` no barril
público continuou resolvendo só para o tipo. `import { SarakNavItem } from '@sarak/lib-ui-core'` sempre
devolveu a interface `{ id, label, icon?, href, active? }`, nunca o componente, mesmo com `SarakNavItemProps`
publicado ao lado. Medido pela API do compilador TypeScript sobre `src/index.ts`
(`getExportsOfModule`/`getAliasedSymbol`), 2026-09-08.

**A correção.** O componente e os tipos dele foram renomeados — sem sinônimo, sem alias:

| Antes (nunca alcançável) | Depois |
| --- | --- |
| `SarakNavItem` (componente) | `SarakMenuItem` |
| `SarakNavItemProps` | `SarakMenuItemProps` |
| `SarakNavItemOrientation` | `SarakMenuItemOrientation` |

**O que NÃO mudou.** `SarakNavItem` (o **tipo**, `{ id, label, icon?, href, active? }`, a forma da prop
`navItems` de `SarakAppChrome`) continua exportado exatamente como antes — ele não faz parte desta correção
e não pode ser renomeado sem quebrar quem já usa `navItems`. A métrica, os estados (ativo/inativo/
desabilitado/colapsado) e a orientação (`vertical`/`horizontal`) do átomo também não mudaram — só o nome.

**Como migrar.** Se você compunha a própria navegação importando o átomo diretamente pelo nome antigo —
o que só era possível por deep import, proibido por contrato, já que o barril público nunca resolveu o nome
para o valor — troque para `SarakMenuItem`/`SarakMenuItemProps`/`SarakMenuItemOrientation`. Quem consome o
cromo pronto (`SarakShell`, `SarakAppChrome*`, `SarakShellNav`) não muda nada: a troca é interna aos
renderizadores de navegação do cromo.

---

## `SarakNavItem` — átomo próprio para item de navegação do cromo

**Classificação: MAJOR** — a superfície é aditiva (novo componente, novo tipo), mas o **comportamento
default muda sem opt-in**: o cromo de todo consumidor troca de métrica de navegação — o mesmo critério que
já classificou majors anteriores desta lista (*"mudar o que é default é MAJOR, mesmo mantendo a
capacidade — quem dependia do default vê comportamento diferente sem alterar uma linha"*). Precedente da
base: a `5.0.0` foi MAJOR sendo correção de bug, com o mesmo motivo — comportamento default, zero export
tocado.

**O que estava faltando.** Os itens de navegação do cromo (sidebar, topbar, drawer) compunham
`SarakButton`/`SarakIconButton` — o átomo de **botão de ação**. Sem um átomo próprio para
**item de lista de navegação**, nenhum chamador disputava a métrica default do botão
(`py-4 px-6`, `font-black uppercase tracking-widest`), e o item de menu herdava geometria de
ação: recuo e altura de botão de formulário, em vez de recuo e altura de item de menu.

**O que passa a existir.** `SarakNavItem` — item de navegação com métrica própria, e a métrica **difere por
orientação** (é a distinção que existe para não devolver a métrica de botão de ação): `vertical` (linha de
lista — recuo, peso e caixa de menu, largura cheia resolvida na origem, rótulo trunca em vez de transbordar)
e `horizontal` (aba/pílula compacta — caixa alta, peso forte, `rounded-full`). Cobre os estados que o cromo
já usa: ativo, inativo, desabilitado/offline, colapsado (só ícone). Compõe `className` por
`mergeSarakClasses` — a classe do chamador vence o default do átomo (R35).

**Afeta você se** consome o cromo pronto (`SarakShell`, `SarakAppChrome*`) ou compõe `SarakShellNav`
diretamente — e o efeito **muda de sinal por orientação**:

| Orientação | Antes | Depois |
| --- | --- | --- |
| `vertical` (sidebar, drawer) | Item de menu herdava `uppercase`, `tracking-widest`, `font-black` e a métrica de botão de ação (`py-4 px-6`) do `SarakButton` | **Perde** as três: rótulo em caixa normal, peso normal, recuo de lista (`px-3 py-2.5`) |
| `horizontal` (topbar) | `SidebarNav`/`TopbarNav` já pintavam aba em pílula/caixa alta; `SarakShellNav` neutralizava por `style` inline e renderizava como lista horizontal (caixa normal, peso 400/500) | **Passa a aplicar** `uppercase`, `tracking-widest`, `font-bold` — geometria de aba, igual à do `TopbarNav`. Quem usa `SarakShellNav` com `navigationStyle: 'topbar'` vê o rótulo virar caixa alta sem mudar uma linha |

**Como migrar.** Nada obrigatório para quem já usa `SarakShell`/`SarakAppChrome*` prontos — é o cromo que
muda de aparência. Quem quer o rótulo do `SarakShellNav` horizontal de volta em caixa normal escreve a
própria `className` (ela vence o default do átomo, R35). Quem monta a própria navegação por fora pode
importar `SarakNavItem` diretamente (`icon`, `label`, `active`, `collapsed`, `orientation`).

**O que NÃO mudou.** Nenhum export, prop ou token existente; `SarakButton`/`SarakIconButton` continuam com
a métrica de botão de ação, inalterada.

---

## A `className` passada a `SarakButton`/`SarakIconButton` agora VENCE o default do átomo

**Classificação: MAJOR** — nenhum export, prop, token ou assinatura mudou; o que muda é **comportamento
default e visível**, sem opt-in — o mesmo critério que já classificou majors anteriores desta lista
(*"mudar um comportamento default é MAJOR, mesmo mantendo a capacidade — quem dependia do default vê
comportamento diferente sem alterar uma linha"*).

**O que estava quebrado.** `SarakButton` e `SarakIconButton` **concatenavam** a `className` recebida com as
classes Tailwind do próprio átomo (`` `${base} ${className}` ``). Em Tailwind, duas utilitárias que escrevem
a mesma propriedade CSS têm a mesma especificidade — quem vence é a que aparece **depois no stylesheet
publicado**, não a que aparece depois no atributo `class`. Concatenar não sobrescrevia nada: só empilhava, e
o resultado ficava a cargo da ordem em que o Tailwind emitiu as duas regras — acidental, não decidido.

Medido no `dist/sarak.css` publicado (offset de byte da primeira ocorrência de cada seletor):

| Par em conflito | Vencia (antes) |
| --- | --- |
| `.normal-case` × `.uppercase` | o átomo (`.uppercase`) |
| `.tracking-normal` × `.tracking-widest` | o átomo (`.tracking-widest`) |
| `.w-full` × `.w-max` | o átomo (`.w-max`) |
| `.justify-center` × `.justify-start` | o chamador |
| `.text-xs` × `.text-2xs` | o chamador |
| `.rounded-btn` × `.rounded-full` | o chamador |

Três dos seis já resolviam a favor do chamador, por acaso — e o acaso muda a cada versão do Tailwind que
reordene a emissão do stylesheet.

**O que passa a acontecer.** Os dois átomos compõem a classe por **merge** (`tailwind-merge`, configurado
para reconhecer as utilitárias próprias desta base — `text-2xs`, `text-3xs`, `rounded-btn`, `font-tab`), com
a `className` do chamador sempre entrando por último. Agora ela **sempre** vence o default do átomo para a
mesma propriedade — não importa a ordem de emissão do Tailwind.

**Afeta você se** já passa `className` para um `SarakButton`/`SarakIconButton` esperando sobrescrever
`text-transform`, `letter-spacing`, `border-radius`, tamanho de fonte ou largura do átomo, e hoje o resultado
"perde" para o default (ex.: pediu `normal-case` e a tela continuou em maiúsculas). A partir desta versão,
sua classe **vence** — a tela muda para o que você sempre pediu.

**Um segundo defeito relacionado, corrigido junto:** `fullWidth` em `SarakButton` não produzia largura cheia
de fato. A estratégia default de largura emite `w-max min-w-fit` — `min-w-fit` é uma propriedade diferente de
`width` e não conflitava com o `w-full` do `fullWidth`, então sobrevivia aos dois: o botão ficava com um piso
de largura igual ao conteúdo e podia transbordar do container com um rótulo longo. Agora, com `fullWidth` (ou
`buttonWidthStrategy: 'full'` no tema), a estratégia deixa de emitir `min-w-fit` — o botão encolhe até a
largura do container normalmente.

**Como migrar.** Se você compensava algum destes defeitos por fora (estilo inline, `!important`, ou
simplesmente aceitou o resultado), **remova a compensação** — a partir desta versão a classe que você já
escreve funciona sozinha, e a compensação duplicada pode brigar com o novo resultado.

**O que NÃO mudou.** Nenhum export, prop ou token; o `style` inline devolvido pelo motor de design não foi
tocado (merge é de classe, não de estilo); `sizeClasses` (`py-*`/`px-*`/`text-*` por `size`) não mudou.

**Gate anti-regressão:** `npm run class-merge:check`
(`gates/scripts/contrato/check-class-merge.mjs`) — cobra que nenhum átomo componha `className` por
concatenação de template literal; a allowlist declara, com motivo, os átomos que ainda concatenam e serão
convertidos em plans futuras.

---

## 6.0.0 — `layoutGridTemplate: 'col-12'` passa a funcionar — filho sem span ganha um default (plan-49)

**Esta é a âncora da `6.0.0` — três quebras saíram juntas nesta tag.** Medido (`git log v5.0.0..v6.0.0 --
docs/migracoes.md`): três entradas desta faixa são, cada uma, **Classificação: MAJOR** por conta própria —
esta (`plan-49`), "O grid zero-config deixa de ser 12 colunas fixas..." (`plan-47`, logo abaixo) e "Container
query estrutural agora funciona FORA do `SarakShell`..." (`plan-41`, mais abaixo ainda). As três venceram
juntas num `npm version major` só; nenhuma delas, sozinha, ganhou uma tag própria. Leia as três se você está
atravessando a `6.0.0`.

**Classificação: MAJOR** — muda o **comportamento visual** de uma opção que já existia e já era selecionável
(schema, painel, tema persistido), sem tocar em nenhuma assinatura pública. A `plan-47` trocou o **default**
zero-config de `'col-12'` para `'auto-fit'` — mas `col-12`, escolhido explicitamente (tema persistido, opção
"Colunas (12)" no painel de Design, ou tema customizado do consumidor), continuava entregando **12 trilhas
fixas com um filho por trilha**, porque a lib nunca ofereceu mecanismo de `span`. Um consumidor real (ERP
Earendel) tinha `layoutGridTemplate: 'col-12'` **persistido**, reinstalou a `plan-47` e a tela **não mudou** —
o default não alcança tema persistido nem seleção do usuário no painel. Esta plan conserta a opção em si.

**O que mudou.** Filho que **não** declara span próprio agora ganha um default por breakpoint dentro de
`col-12`: `col-span-6` a partir de 768px, `col-span-4` a partir de 1024px, `col-span-3` a partir de 1280px —
`col-12` continua sendo, literalmente, um grid de 12 colunas (é o nome e o que o painel promete); o que muda é
que ele deixa de exigir que o consumidor declare `span` para ter uma malha legível.

**Antes × depois** (`<SarakGrid>` sob `layoutGridTemplate: 'col-12'`, 8 filhos, nenhum span — medido em
Chromium real):

| Largura do container | Antes | Depois |
| --- | --- | --- |
| 1280px | 12 trilhas de ~107px, 1 filho por trilha | **4 colunas** (`span 3` de 12) |
| 1024px | 12 trilhas de ~85px, 1 filho por trilha | **3 colunas** (`span 4` de 12) |
| 768px | 12 trilhas de ~64px, 1 filho por trilha | **2 colunas** (`span 6` de 12) |
| 400px (celular) | 1 coluna | **1 coluna** (inalterado) |

**Se você já controla o `span` dos próprios filhos**, nada muda para você: o span que você escreve **sempre
vence** o default — provado em Chromium nas 4 larguras acima, um filho com `col-span-6` próprio permanece em
`span 6 / span 6` mesmo onde o default da largura seria outro (ex.: `span 3` a 1280px). O mecanismo é um
seletor de especificidade **zero** (`:where(&)>*`) no default — qualquer classe de span no próprio filho, por
ter especificidade maior que zero, vence sempre, **não importa a ordem de geração do CSS**.

**Como migrar.** Nada a fazer — a correção é automática assim que você atualizar a lib. Se você tinha
`layoutGridTemplate: 'col-12'` persistido (tema salvo, seleção no painel, ou tema customizado) e a tela
continuava quebrada mesmo depois da `plan-47`, **é exatamente este o conserto** — não é preciso limpar dado
nem tocar em nada do seu lado.

**O que NÃO mudou.**

- `'auto-fit'` continua sendo o **default** zero-config (`plan-47`, intacta).
- `'masonry'` não foi tocado.
- `templateColumns` explícito continua ignorando qualquer estratégia de tema, `col-12` incluído.
- Nenhum número de breakpoint mudou (`768`/`1024`/`1280` seguem os mesmos das outras 40+ classes da lib).
- A parte "12 trilhas fixas" de `col-12` (`grid-cols-1 @min-[768px]:grid-cols-12`) não mudou — o que foi
  **acrescentado** é só o default de `span` para quem não declara o próprio.

---

## O grid zero-config deixa de ser 12 colunas fixas e passa a ser content-aware (plan-47)

**Classificação: MAJOR** — muda um **comportamento default**, mesmo sem tocar em nenhuma assinatura pública:
o token `layoutGridTemplate` (schema `structural` e os 5 temas embarcados) tinha `'col-12'` como valor
default e passa a ter `'auto-fit'`. Quem monta `<SarakGrid>`, `<SarakManagementGrid>` ou `<SarakForm>` **sem**
`templateColumns`/preset — o uso zero-config mais comum — vê a malha mudar na tela sem alterar uma linha de
código.

**O defeito que motivou a correção.** Sem `templateColumns`, o `col-12` entregava **doze trilhas de ~1/12 da
largura, um filho por trilha** — a lib nunca ofereceu ao consumidor nenhuma forma de declarar `span`, então um
grid de 12 colunas sem mecanismo de span virava, na prática, uma coluna estreita por filho. Reportado com a
tela na mão: a aba Propostas do ERP Earendel virou sete colunas verticais, título truncado
(`R…`, `C…`, `XTRE…`) e o texto "VER DETALHES" atravessando o card vizinho.

**Antes × depois** (`<SarakGrid>` com 8 filhos, nenhuma prop — medido em Chromium real, não em jsdom):

| Largura do container | Antes (`col-12`) | Depois (`auto-fit`) |
| --- | --- | --- |
| 1280px | 12 trilhas fixas — cada um dos 8 filhos ocupa exatamente **1 trilha de ~85px** (sem `span`) | **4 colunas** de 320px |
| 1024px | idem, ~68px por trilha | **3 colunas** de ~341px |
| 768px | 12 trilhas fixas, ~42px por trilha (`@min-[768px]:grid-cols-12` já casa **em** 768px) | **2 colunas** de 384px |
| 400px (celular) | 1 coluna (abaixo de 768px, a container query não casa — fica na base `grid-cols-1`) | **1 coluna** (inalterado) |

**Por quê.** `col-12` é um grid de 12 colunas fixas; sem `span`, cada filho ocupa exatamente 1 trilha — o
sistema estava "pela metade" (ver [[07-responsividade-e-multidispositivo]] §6). `auto-fit`
(`grid-cols-[repeat(auto-fit,minmax(280px,1fr))]`) é resolvido pelo próprio CSS Grid em runtime, pela largura
disponível: cada filho recebe uma célula de no mínimo 280px, e o número de colunas se ajusta sozinho — sem
depender de `templateColumns`, de `span` ou de container query.

**Como migrar.**

- **Você não precisa mudar nada** para sair do layout quebrado — a correção é automática assim que você
  atualizar a lib.
- **Se você queria literalmente 12 colunas fixas** (por exemplo, para compor com `gridColumn: 'span N'` no seu
  próprio CSS), o valor `'col-12'` **continua existindo** como escolha explícita do token `layoutGridTemplate`
  — defina-a no seu tema (`design.layoutGridTemplate = 'col-12'`) ou no Design Engine (campo "Template de Grid
  Global"). Esteja ciente de que a lib **ainda não** oferece um mecanismo de `span` para o consumidor —
  escolher `col-12` manualmente reproduz o mesmo problema que esta entrada corrige, a menos que você já
  controle o `span` dos seus próprios filhos.
- **Se você precisa de um número exato de colunas**, continue passando `templateColumns` explícito (string ou
  `ResponsiveValue<string>`) — não é afetado por esta mudança, veja "O que NÃO mudou".

**O que NÃO mudou.**

- `SarakGrid`/`SarakManagementGrid`/`SarakForm` com `templateColumns` explícito **continuam** ignorando o
  token de tema — o valor do consumidor sempre venceu e continua vencendo.
- `SarakCardGrid`, `SarakCatalogGrid`, `SarakStats`, `SarakActionCard`, `SarakCoreCard`,
  `AuthSocialLogin` — todos passam `responsivePreset` ou `templateColumns` próprios; não usam o token
  `layoutGridTemplate` e não são afetados.
- Nenhum número de breakpoint mudou (`640`/`768`/`1024`/`1280` seguem os mesmos).
- O `@container` plantado pela `plan-41` continua no lugar — `auto-fit` nem depende dele (é CSS Grid puro,
  sem container query), mas o wrapper não foi removido.
- `'col-12'` e `'masonry'` continuam existindo como opções válidas do token `layoutGridTemplate` — só o
  **default** mudou.

---

## 26 tipos usados em assinatura pública passam a ser importáveis pelo nome (plan-45)

**Classificação: MINOR** — capacidade nova, aditiva: nenhum tipo mudou de forma, nenhum export
existente mudou. Só ficou possível importar pelo **nome** tipos que as assinaturas públicas já
usavam, mas que não estavam no bloco `export { … }` de `src/index.ts`.

**O que estava quebrado.** `SarakThemePayload`, `SarakUIOptions`, `ThemeEntry` e outros 26 tipos
apareciam em prop, retorno de hook ou membro de contexto **já públicos** — `SarakUIProvider`,
`useSarakUI`, `SarakChartEngine`, `SarakShell`, `DesignScope`, entre outros — mas não podiam ser
importados:

```ts
// ANTES — TS2459
import type { SarakThemePayload } from '@sarak/lib-ui-core';
// error TS2459: Module '"@sarak/lib-ui-core"' declares 'SarakThemePayload' locally,
// but it is not exported.
```

Quem precisava tipar contra esses tipos tinha de derivar estruturalmente, contornando a lacuna:

```ts
// O CONTORNO que este release torna desnecessário — remova se você o escreveu
type PropsDoProvider = ComponentProps<typeof SarakUIProvider>;
type SarakThemePayload = NonNullable<PropsDoProvider['config']>;
type ThemeEntry = Parameters<NonNullable<NonNullable<SarakUIOptions['theme']>['onSave']>>[0];
```

**O que passa a funcionar.**

```ts
// DEPOIS
import type {
  SarakThemePayload, SarakUIOptions, ThemeEntry, SarakUIContextType, SarakDesignState,
  SarakUIProviderProps, SarakBrandingState, SarakShellProps, ShellUser,
  DeviceProviderProps, DynamicRendererProps, DesignScopeProps,
  DesignToken, TokenValueType, SarakTokenValue, SarakDesignTokens,
  Accept, CatalogItem, FilterConfig, FlexDirection, Message, PdfSource,
  PinnedOffsets, DateLocale, WeekStart, ChartDataItem,
} from '@sarak/lib-ui-core';
```

**Se você contornou a lacuna** derivando um desses tipos estruturalmente
(`ComponentProps<typeof SarakUIProvider>`, `Parameters<...>[0]`, etc.) — como o consumidor real que
achou este defeito — **pode remover o contorno agora** e importar pelo nome direto. O tipo derivado
e o importado pelo nome são a mesma forma; a troca é segura.

**O que NÃO ganhou export.** Três tipos que só existem como detalhe de composição interna de outro
tipo já público — nunca são, eles mesmos, o tipo direto de uma prop/parâmetro/retorno —
permanecem inacessíveis pelo nome, de propósito: `ReactFlowProps` (alias local de
`ComponentProps<typeof ReactFlow>` em `SarakFlowEngine`), `SarakRuntimeExtras` e
`SarakThemePayloadExtras` (ambos compõem `SarakDesignState`/`SarakThemePayload` por interseção, e
o próprio código os documenta como pendentes de reconciliação — não é vocabulário público). Motivo
completo de cada um em `gates/allowlists/publicTypeExclusions.mjs`.

**A garantia daqui para frente.** `npm run public-types:check` (novo, roda dentro de `npm run
build`) compara todo tipo declarado em `dist/index.d.ts` contra o que está exportado — um tipo que
apareça em assinatura pública e não seja exportado (nem esteja na allowlist com motivo) derruba o
build.

---

## `persistence.onSave` passa a receber o id do tema ativo — segundo parâmetro (plan-42)

**Classificação: MINOR** — capacidade nova, aditiva: o segundo parâmetro é opcional e quem já implementa
`onSave(design)` continua compilando e sendo chamado exatamente como antes. Nenhum consumidor precisa mudar
uma linha.

**O que estava faltando.** `options.persistence.onSave` entregava só o design (`SarakThemePayload`) — o id
do tema efetivamente ativo (`resolvedThemeId`) vivia só no contexto do Provider, fora do alcance de quem
persiste. Quem guarda o tema salvo não tinha como registrar **qual tema** aquele design representa, nem como
destacar o tema selecionado na própria interface — comparar tokens não é confiável, porque um ajuste manual
de um único valor já quebra a comparação.

**O que ganhou.** `onSave` agora recebe um segundo argumento, opcional: o id do tema ativo no instante do
save. Vem preenchido sempre que a sessão resolveu um tema; vem `undefined` só quando não há nenhum tema
resolvido.

```ts
persistence: {
  onSave: async (design, activeThemeId) => {
    await api.saveTheme({ design, activeThemeId }); // activeThemeId pode vir undefined
  },
}
```

**O que NÃO mudou.** O payload (`design`) continua sendo exatamente o mesmo objeto — o id não entra dentro
dele, para não contaminar o arquivo que o export de tema produz. `onLoad` não mudou: o id serve a quem
persiste, não à lib. `theme.onSave` (temas salvos em runtime, ADR-011) não mudou: já recebia `ThemeEntry`
com `id` e `name`.

---

## Container query estrutural agora funciona FORA do `SarakShell` — 10 componentes ganham um `@container` próprio (plan-41)

**Classificação: MAJOR** — comportamento default muda sem opt-in (mesmo critério da `4.0.0` e da entrada da
`plan-39` logo abaixo: *"mudar um comportamento default é MAJOR, mesmo mantendo a capacidade — quem dependia
do default vê comportamento diferente sem alterar uma linha."*), **e** dois componentes ganham um elemento a
mais no DOM renderizado (ver a tabela).

**O que estava quebrado.** A `plan-39` fez o CSS existir; a `plan-40`, medindo num consumidor real (o ERP
Earendel), achou a metade que faltava: **container query sem um ancestral `container-type` nunca casa** — não
cai para o comportamento de viewport, simplesmente nunca ativa, para sempre, em qualquer largura. A única
peça da lib que planta esse ancestral é o `SarakShell` (o modo "host de módulos-plugin"). Quem usa o **modo
kit de componentes** — `SarakAppChrome`, ou os componentes soltos, sem cromo nenhum — nunca tinha esse
ancestral, e todo componente com classe `@min-[…]` ficava congelado no layout de celular, em qualquer largura.

**Afeta você se** usa algum destes fora do `SarakShell` (sob `SarakAppChrome`, ou standalone):

| Componente | O que estava quebrado | O que passa a funcionar |
| --- | --- | --- |
| `SarakGrid` (layout `col-12`/`masonry`) | grid travado em 1 coluna em qualquer largura | vira 12 colunas (ou 2/3 no masonry) a partir do breakpoint, como sempre foi a intenção |
| `SarakCardGrid` | grid de cards e cabeçalho responsivo travados | grid e cabeçalho respondem à largura do container |
| `SarakCatalogGrid` | idem | idem |
| `SarakManagementGrid` | idem | idem |
| `SarakStats` | grid de métricas travado em 1 coluna | vira 4 colunas a partir de 1024px |
| `SarakTable` | cabeçalho não virava linha no desktop | vira linha e centraliza a partir de 768px |
| `SarakActionCard` | painel de detalhes expansível travado em 1 coluna | vira 2 colunas a partir do breakpoint |
| `ExpandableCard` | padding/margem do modo tela cheia travados no valor de celular | crescem a partir de 640px/1024px |
| `SarakAuthScreen` (grid de login social) | grid de provedores travado em 1 coluna | vira 4 colunas no modo `compact` |

**Se você já escreveu CSS próprio para forçar algum destes a virar grade/linha** (`!important` ou seletor mais
específico), **remova a compensação** — o CSS duplicado pode brigar com o layout novo.

**Mudança de DOM, só em dois componentes.** `SarakGrid` e `SarakStats` renderizavam um único elemento — o
próprio grid — e uma container query não pode medir a si mesma (`container-type` precisa estar num
ANCESTRAL, nunca no mesmo elemento que a consome; medido em `plan-41`). Os dois passaram a renderizar **um
`<div>` a mais**, envolvendo o grid, só para plantar o container:

```html
<!-- ANTES -->
<div class="grid ...">…</div>

<!-- DEPOIS -->
<div class="@container w-full">
  <div class="grid ...">…</div>
</div>
```

Todo `className`/`style`/`...props` que você passa para `<SarakGrid>` continua chegando no elemento do grid
(o `<div>` de dentro), exatamente como antes — só a árvore do DOM ganhou um nó a mais. **Se você usa `ref`,
seletor CSS (`document.querySelector`) ou snapshot de teste** esperando que o grid seja o elemento raiz
retornado por `SarakGrid`/`SarakStats`, atualize para o novo nível. Os demais 8 componentes da tabela acima
não ganharam elemento novo — o `@container` foi plantado numa raiz que já existia.

**O que NÃO mudou.** Nenhum breakpoint numérico (640/768/1024/1280); nenhuma prop, export ou token; o
mecanismo continua sendo container query — só passou a existir, em cada um dos 10 componentes, um ancestral
que o estabelece.

---

## Tema salvo pelo usuário final em runtime — uma porta de escrita nova (ADR-011, plan-38)

**Classificação: MINOR** — capacidade nova retrocompatível: `ThemeEntry.name?`, `options.theme.onSave?` e
`sarak.saveTheme` são todos **opcionais/aditivos**. Quem não configurar `options.theme.onSave` não vê
nenhuma mudança de comportamento — o painel continua exatamente como era, só com "Exportar Tema (JSON)".

**O que ganhou.** Até aqui, "salvar um tema" só existia como **exportar um arquivo JSON** — um fluxo de
desenvolvedor, que exige colar o arquivo em `customThemes` e fazer deploy. Agora o painel também oferece
**gestão runtime**, para o usuário final: **Salvar** substitui o tema do importador em edição; **Salvar
como novo** e **Duplicar** criam entradas com id livre. A entrada vai para `sarak.saveTheme`, aparece em
`allThemes`, então em `TemplatesTab`/`PresetsCatalog`, sem reload, e é entregue a `options.theme.onSave`,
se você configurar essa porta. **Exportar JSON** continua disponível como ação separada.

**Como ligar a porta.**

```ts
<SarakUIProvider
  options={{
    theme: {
      onSave: async (theme, operation) => {
        // grave onde quiser: arquivo, tabela, localStorage — a lib não pergunta e não sabe.
        await minhaApi.salvarTema(theme, operation); // { id, name, design, contraparte? }
      },
      onDelete: async (id) => {
        await minhaApi.apagarTema(id);
      }
    }
  }}
  customThemes={temasQueEuGuardei} // a LEITURA de volta é esta prop — não existe onLoadThemes
>
```

**O que NÃO existe, de propósito** ([[011-tema-salvo-por-uma-porta-de-escrita]]): não há `onLoadThemes` — a
leitura já é a prop `customThemes`, que você passa na montagem seguinte com o que guardou. A porta opcional
`onDelete` informa o importador quando um tema é apagado. Temas embarcados continuam imutáveis; para
alterar um deles, crie uma cópia.

**Sem `options.theme.onSave`, os gestos de salvar, duplicar e criar não aparecem** — nunca um tema que
evapora no reload. Exportar JSON permanece como ação separada. `design` passa por `validateDesign` antes de
entrar em `allThemes`, a mesma fronteira de qualquer tema de origem externa
([[10-seguranca-e-acessibilidade]] §2.1).

### Gestão de temas no painel

Com `options.theme.onSave`, o painel oferece **Salvar**, **Salvar como novo** e **Duplicar**. O primeiro
substitui o tema do importador em edição, preservando o id; os outros criam um id livre, com sufixo
quando o slug já existe. A assinatura continua compatível com callbacks antigos: o tema permanece no
primeiro argumento e um segundo argumento opcional, `'create' | 'replace'`, identifica a operação. Temas
embarcados não podem ser substituídos; editar um deles cria uma cópia. **Exportar JSON** é uma ação
separada e leva `contraparte` quando o rascunho pertence a um tema pareado.

O tema salvo passa a ser o ativo e a persistência do design recebe o id resolvido. **Apagar** só aparece
para tema do importador e pede confirmação; ao apagar o ativo, o painel volta ao tema padrão no modo
atual. Configure `options.theme.onDelete` para remover também da fonte persistente. Se a porta rejeitar,
o tema é restaurado na coleção e o painel avisa; sem a porta, a remoção vale apenas durante a sessão.
Os callbacks devem rejeitar em falhas HTTP — `fetch` não rejeita sozinho para respostas 4xx/5xx — para
que a lib consiga manter a coleção coerente e informar o usuário.

---

## 5.0.0 — A responsividade da Spec 40.3 estava desligada no pacote publicado — a nav da topbar, entre outros, volta a aparecer (plan-39)

**Esta é a âncora da `5.0.0`.** Medido (`git log v4.0.1..v5.0.0 -- docs/migracoes.md`): esta é a única
entrada desta faixa classificada **MAJOR** — a mesma família de quebra da `4.0.0`, comportamento default sem
tocar em nenhuma assinatura pública. A entrada "Tema salvo pelo usuário final em runtime..." (`ADR-011,
plan-38`), logo abaixo, saiu na MESMA tag, mas é aditiva (MINOR) — não é ela que teria motivado o major.

**Classificação: MAJOR** — nenhum export, prop, token ou assinatura mudou; o que muda é **comportamento
default e visível**, sem opt-in, exatamente o mesmo critério que classificou a `4.0.0` ([[03-versionamento-e-release]]
§3.1): *"mudar um comportamento default é MAJOR, mesmo mantendo a capacidade — quem dependia do default vê
comportamento diferente sem alterar uma linha."*

**O que estava quebrado.** O scanner do Tailwind v4 lê os arquivos como TEXTO — não avalia JavaScript. Onde o
código montava a classe de container query por interpolação (`` `@min-[${BREAKPOINT_DESKTOP}px]:flex` ``), o
texto do arquivo continha só a string literal `@min-[${BREAKPOINT_DESKTOP}px]:flex` — nunca uma classe
válida —, então o Tailwind nunca gerou a regra CSS correspondente. O elemento recebia, em runtime, uma classe
que apontava para uma regra inexistente no `dist/sarak.css` publicado. **11 das 19** classes de container
query da lib estavam nessa situação.

**Afeta você se** usa qualquer um destes, sem CSS próprio compensando o defeito:

| Onde | O que estava quebrado | O que passa a funcionar |
| --- | --- | --- |
| `navigationStyle: 'topbar'` do cromo | a nav de módulos da topbar **nunca aparecia**, em largura nenhuma (`display:none` permanente) | a nav aparece a partir de 1024px, como sempre foi a intenção |
| `SarakStack` (`getResponsiveStackStyles`) | nunca virava linha (`flex-row`) a partir do breakpoint | vira linha a partir de 768px (`md`) / 1024px (`lg`) |
| Layout `col-12` (`SarakGrid`/`useStructuralStyles`) | ficava em 1 coluna em qualquer largura | vira 12 colunas a partir de 768px |
| Layout `masonry` | ficava em 1 coluna em qualquer largura | 2 colunas a partir de 768px, 3 a partir de 1024px |
| Cabeçalho de seção (`getHeaderStyles`) | não virava linha nem alinhava ao centro no desktop | vira linha e centraliza a partir de 768px |
| `ShellContent` (padding/título do módulo ativo) | respiro e tamanho de título ficavam no valor de telefone em qualquer largura | crescem a partir de 1024px (`pt-12`, `text-5xl`) |
| Layout `center` do Shell (`useShellLayoutStyles`) | padding lateral fixo em qualquer largura | cresce a partir de 640px e 1024px |

**Se você já escreveu CSS próprio para compensar algum destes** (por exemplo, forçando a nav da topbar a
aparecer, ou a `SarakStack` a virar linha, via seletor `!important` ou CSS mais específico que o seu), **remova
essa compensação** — a partir desta versão a lib já faz isso sozinha, e o CSS duplicado pode brigar com o
novo comportamento (ex.: layout de coluna dupla).

**O que NÃO mudou.** Nenhum breakpoint numérico (640/768/1024/1280); nenhuma prop, export ou token; o
mecanismo continua sendo container query (`@min-[Npx]:`, reagindo ao container, não ao viewport) — só a
forma como o código escreve a classe (literal em vez de interpolada), para o scanner do Tailwind conseguir
gerar a regra.

**Gate anti-regressão:** `npm run container-query:check` (`gates/scripts/contrato/check-container-query-literal.mjs`)
falha se um arquivo de produção voltar a montar `@min-[…]` por interpolação de template literal.

---

## Persistência de tema tenant-aware e `strategy` funcional (ADR-009)

**Afeta você se** roda **múltiplos tenants na mesma origem** (troca de conta/tenant em runtime, sem
reload de página) — o tema de um podia vazar para o outro — **ou** se já tem backend próprio e quer que
ele vença sobre o `localStorage` sem ambiguidade.

**Não afeta ninguém que não declarar `persistence.tenantId` nem `persistence.strategy`.** O default
continua sendo exatamente o que a lib sempre fez: gravar/ler `localStorage` **e** chamar
`onSave`/`onLoad` quando fornecidos — isso agora tem nome (`'hybrid'`), mas é o mesmo comportamento,
provado por teste que não muda de veredito.

**O que mudou.**

| | Antes | Depois |
| --- | --- | --- |
| Chave de `localStorage` | sempre `storageKey` cru (`options.persistence.storageKey`, ou o default `sarak-ui-design-v9.0`) | com `persistence.tenantId` definido, a chave efetiva vira `` `${storageKey}::tenant:${tenantId}` `` — usada na leitura, na escrita e no filtro de `crossTabSync`. Sem `tenantId`, nada muda |
| `persistence.strategy` | declarado no tipo, **nunca lido** — campo morto | funcional, com três valores (ver tabela abaixo); default `'hybrid'` |
| `onLoad` resolvendo com `strategy: 'remote'` | fundia por cima do que já estava no estado (`{ ...prev, ...custom }`) — o que veio do fallback síncrono de `localStorage` podia sobreviver misturado | **substitui** (`{ ...semente, ...custom }`) — o que veio do `localStorage` é inteiramente descartado assim que `onLoad` resolve |

**Os três valores de `strategy`:**

| Valor | Comportamento |
| --- | --- |
| `'hybrid'` **(default)** | Grava/lê `localStorage` **e** chama `onSave`/`onLoad` quando fornecidos — o que a lib sempre fez, agora com nome |
| `'local'` | Ignora `onSave`/`onLoad` mesmo se configurados — só `localStorage` |
| `'remote'` | `localStorage` deixa de decidir: é lido uma única vez, síncrono, só contra o flash do primeiro paint, e é **substituído** assim que `onLoad` resolver. `persistDesign` para de escrever em `localStorage` — a escrita vira só `onSave`. Sem `onSave` nem `onLoad` configurados, a lib emite um `console.warn` único e degrada para `'local'` — nunca perde o tema em silêncio |

**Por quê.** Um consumidor multi-tenant real reportou vazamento de tema entre contas na mesma origem: o
boot lia `localStorage` sem saber "de quem" era aquele valor, e `crossTabSync` reaplicava o tema de um
tenant nas abas de outro, porque todos escreviam na mesma chave. Levantamento completo em
`specs/adr/009-persistencia-tenant-aware.md`.

**Como migrar.**

1. **Multi-tenant na mesma origem:** passe `options.persistence.tenantId` com o identificador do tenant
   ativo. É um valor opaco — a lib não valida nem interpreta, só compõe a chave. Trocar de tenant em
   runtime já isola automaticamente leitura, escrita e `crossTabSync`.

   ```tsx
   <SarakUIProvider options={{ persistence: { tenantId: tenantAtivo.id } }}>
   ```

2. **Já tem backend próprio e quer que ele vença:** declare `strategy: 'remote'` junto com `onSave`/
   `onLoad`. O `localStorage` deixa de ser gravado e de decidir o design final.

   ```tsx
   <SarakUIProvider options={{ persistence: { strategy: 'remote', onSave, onLoad } }}>
   ```

3. **Não usa nenhum dos dois:** nada a fazer. `tenantId` ausente e `strategy` ausente (ou `'hybrid'`
   explícito) reproduzem o comportamento de sempre.

**O que NÃO mudou.** O formato do payload de tema (`schema_version`) é o mesmo; `crossTabSync` continua
default `true`, com a mesma lógica de filtro — só passou a receber a chave já composta por tenant.
Nenhum export do barril mudou de assinatura.

---

## 4.0.0 — O motor de cor parou de reescrever o seu tema sem avisar (Decisão D)

**Afeta você se tem tema PRÓPRIO** — seu, não um dos 18 embarcados na lib: escrito à mão, exportado
do painel, ou herdado de uma versão anterior salvo em `localStorage`/`customThemes`. Ao atualizar, a
COR que aparece na tela pode mudar, mesmo que você não tenha tocado no tema nem trocado de modo.

**O alcance não é só quem troca de modo claro/escuro.** `useDesignVariables` chamava
`syncThemeWithMode` A CADA RENDER, incondicionalmente — toda cor de todo tema de todo consumidor era
reescrita antes de virar CSS Variable, sempre, não só na troca de modo. Medido nos 18 temas da
própria lib, cada um no seu PRÓPRIO modo nativo (sem nenhuma troca): **1299 de 1316 valores de cor
eram alterados** pelo motor antes de chegar à tela.

**O que mudou.**

| | Antes | Depois |
| --- | --- | --- |
| Cor emitida no modo nativo do seu tema | o motor recalculava a cada render (podia divergir do que você escreveu) | exatamente o valor que você escreveu — `emitido = escrito` |
| Trocar de modo (claro↔escuro) | acontecia sozinho, a cada render, de qualquer jeito que o `mode` chegasse ao Provider | só acontece no clique do `ShellThemeToggle` (o toggle claro/escuro do cromo) e na miniatura do `PresetCard`; os dois computam a paleta convertida uma vez e aplicam o resultado completo |
| `{...seuTemaEscuro, mode: 'light'}` (patch parcial, só a chave `mode`) | o motor detectava a inconsistência e convertia as cores sozinho, a cada render | **não inverte mais sozinho** — as cores continuam as do tema escuro, só o rótulo do modo muda. Se o seu código faz isso, pare: passe pelo `ShellThemeToggle` ou converta você mesmo antes de aplicar |

**Por que você pode ver a cor mudar.** Se o seu tema foi ajustado observando a TELA (não o JSON), é
provável que você tenha calibrado contra o resultado do motor forçando, não contra o valor que de
fato está salvo. Agora a tela mostra fielmente o que está salvo — e onde os dois divergiam, a
aparência muda. Não é regressão: é o mesmo dado, exibido pela primeira vez sem intermediário.

**A escala do problema, medida na própria lib.** Os 18 temas embarcados foram autorados contra o
motor forçando — desligar a reescrita, sozinha, fez o número de pares de contraste reprovados subir
de **108 para 188**, ANTES de qualquer tema ser corrigido. Os 18 temas da lib **foram** corrigidos
(a mudança que motivou D veio com a correção deles junto — não seria aceitável entregar só a
regressão). **O seu tema não foi** — ninguém além de você tem acesso a ele.

**O que fazer agora.**

1. Compare o seu tema salvo (JSON, `customThemes`, ou o que está em `localStorage`) com o que a tela
   mostrava antes de atualizar. Onde a cor mudou e você prefere a antiga, edite o JSON para bater com
   o que a tela mostrava — é o valor "emitido" antigo que você quer, não o "escrito".
2. Se algum par texto/fundo ficou pouco legível, corrija a mão: ajuste só a cor de texto do par,
   preservando o resto do tema.
3. **Não há ferramenta publicada para isto ainda.** O solucionador de contraste que a lib usou para
   corrigir os próprios 18 temas
   (`.agents/skills/ui-criar-tema/scripts/solve_theme_contrast.ts`, no repositório da lib) **não está
   no pacote que você instala** — `package.json` só publica `dist`, `bin`, `docs` e `sarak-ui`. Se
   você precisa dele hoje, a única forma é copiar o arquivo do repositório da lib para o seu projeto.

---

## 3.0.0 — quatro componentes e três tipos saíram do barril

**Só a partir desta versão** (confirmado em `git show v2.0.0:docs/migracoes.md` × `git show
v3.0.0:docs/migracoes.md` — os itens abaixo só existem no segundo). Estavam registrados, por
engano, sob a `## 2.0.0` deste arquivo: quem migrou para `2.x` seguindo aquela entrada concluiu
que já os tinha aplicado, e perdeu a remoção de 4 componentes e 3 tipos do barril.

### 1. `ThemeToggle` foi removido — abria um seletor sempre vazio

Componente publicado desde a origem, mas nunca funcional: `LAYOUTS` era um objeto literal `{}` (com um
`TODO` no próprio código pedindo os presets canônicos que nunca chegaram a ser plugados). O dropdown que
ele abre sempre esteve vazio — não é regressão desta versão, é o estado dele desde que existe.

| | |
| --- | --- |
| **Antes** | `import { ThemeToggle } from '@sarak/lib-ui-core'` — renderiza um botão "Layouts Premium Matrix" cujo dropdown nunca lista nada |
| **Depois** | não existe mais — nem o componente, nem o export |
| **Não confunda com** | `ShellThemeToggle` (`core/Shell/`), que é o toggle claro/escuro do cromo — esse continua existindo e funcionando; não foi tocado |
| **Como migrar** | se você usava o `ThemeToggle` para trocar de layout, ele nunca fez isso de verdade (o seletor estava vazio); não há substituto direto porque não havia funcionalidade a substituir. Se você precisa de um seletor de preset de layout, é escopo novo — abra como feature no seu produto |

### 2. `LanguageSelector`, `UserMenu`, `ModuleSelector` — e os tipos que vinham com eles — saíram do barril

Consequência direta do item 1, não uma mudança separada: os quatro viviam em
`atomic/Inputs/Controls.tsx`, publicados só porque um `export *` os arrastava junto com o
`ThemeToggle` — nenhum tinha consumidor interno (a base real usa a família `Shell*`:
`ShellLanguageSelector`, `ShellThemeToggle`, `ShellUserWidget`). Como só o `ThemeToggle` tinha
entrada aqui, esta seção fecha o registro dos outros três.

#### `LanguageSelector`

| | |
| --- | --- |
| **Antes** | `import { LanguageSelector } from '@sarak/lib-ui-core'` — pílulas de idioma que gravam a escolha em `localStorage`, trocam o cookie do Google Translate (`googtrans`) e recarregam a página |
| **Depois** | não existe mais |
| **Substituto?** | **`ShellLanguageSelector` (`core/Shell/Components/`) NÃO é equivalente — não force essa migração achando que é.** Ele é fixo em 2 idiomas (`pt-BR`/`en-US`, não lê os `enabledLanguages` do tema), guarda a escolha só em estado React — sem `localStorage`, sem cookie, sem reload — e existe sobretudo como um *slot* para você plugar o seu próprio seletor via `registerLocalComponent('shell-language-selector', ...)` |
| **Como migrar** | se você usava o `LanguageSelector` para trocar de idioma de verdade, o comportamento (persistência + cookie + reload) não tem substituto pronto na lib — copie a lógica de `Controls.tsx` no histórico do git para o seu projeto |

#### `UserMenu`

| | |
| --- | --- |
| **Antes** | `import { UserMenu } from '@sarak/lib-ui-core'` — avatar + nome + dropdown com "Change Password" e "Log Out" |
| **Depois** | não existe mais |
| **Substituto?** | **`ShellUserWidget` (`core/Shell/Components/`) cobre só metade.** Mostra identidade (avatar, nome, nível) e tem um botão de logout — mas não tem dropdown nem ação de trocar senha; é um chip de identidade, não um menu |
| **Como migrar** | para identidade + logout, troque por `ShellUserWidget` (`user`, `logout`, `variant`). Para "trocar senha", não há slot equivalente — monte seu próprio botão/modal ao lado |

#### `ModuleSelector`

| | |
| --- | --- |
| **Antes** | `import { ModuleSelector } from '@sarak/lib-ui-core'` — fileira de abas de módulo (`modules: {id,label}[]`, `currentModule`, `setCurrentModule`) |
| **Depois** | não existe mais |
| **Substituto** | **`SarakShellNav`** faz o mesmo trabalho (escolher o módulo/seção ativa) e é o componente que a base realmente usa para isso. A forma muda: `modules`→`items` (cada item usa `route` no lugar de `id`), `currentModule`→`activeRoute`, `setCurrentModule`→`onNavigate` |

```tsx
// Antes
<ModuleSelector currentModule={id} setCurrentModule={setId} modules={[{ id: 'a', label: 'A' }]} />

// Depois
<SarakShellNav activeRoute={id} onNavigate={setId} items={[{ route: 'a', label: 'A' }]} />
```

#### Os três tipos que vinham junto

| Tipo | Forma | Equivalente público hoje |
| --- | --- | --- |
| `LanguageOption` | `{ id: string; label: string }` | nenhum — declare o seu: `interface LanguageOption { id: string; label: string }` |
| `ModuleConfig` | `{ id: string; label: string; [k: string]: unknown }` | **`SarakModule`** (o tipo de `registerSarakModule`) já é público e tem `id`/`label` compatíveis — reutilizável, mas é um tipo mais pesado (pensado para o Discovery: carrega `component`, `priority`, `isLocal` etc.) |
| `UserPayload` | `{ email?: string; [k: string]: unknown }` | nenhum — declare o seu: `interface UserPayload { email?: string }` |

---

## 2.0.0 — a limpeza do contrato público, num major só

**Esta é a única entrada que você precisa ler para migrar para a `2.0.0`.** Oito mudanças saíram
juntas de propósito: cada uma sozinha custaria a você uma migração inteira de leitura, teste e
ajuste. **Você atravessa o major uma vez, não oito.**

Se você não usa nenhum dos itens abaixo, **atualizar é trocar a faixa da versão e mais nada** — e
você ainda ganha o boot 75% menor do item 1 sem fazer nada.

### 1. O painel do Design Engine saiu do seu boot — e não é mais registrado sozinho

**O ganho, de graça:** o `CustomizationPanel` arrastava o Design Engine inteiro (abas, canvas de
preview, controles de token) para o chunk de boot de **todo** consumidor, mesmo quem nunca abre o
painel. Ele agora fica atrás de fronteira lazy.

| | `dist/index.js` (o chunk de boot) |
| --- | --- |
| **Antes** | 674.011 bytes (658,2 KB) |
| **Depois** | 167.684 bytes (163,8 KB) |
| **Ganho** | **−506.327 bytes, −75,1%** |

O tipo público **não mudou**: `CustomizationPanel` continua sendo um `React.FC` e o `Suspense` é
interno, no mesmo padrão do `SarakChartEngine`. Você **não** precisa declarar `Suspense`.

**A quebra:** a lib **parou de registrar sozinha** os ids `mx-customization` e `personalization` no
Discovery. Antes isso acontecia por efeito colateral de import — bastava importar qualquer coisa da
lib e o painel aparecia no menu do `SarakShell`.

| | |
| --- | --- |
| **Antes** | `import '@sarak/lib-ui-core'` → o módulo "Design Engine" aparecia no menu do Shell sozinho, e era a tela inicial padrão |
| **Depois** | nada é registrado por você; o Shell abre o `defaultModuleId` que você configurou, ou o primeiro módulo descoberto |
| **Como migrar** | se você **quer** o painel no menu, registre o par você mesmo: |

```tsx
import { registerSarakModule, registerLocalComponent, CustomizationPanel } from '@sarak/lib-ui-core';

registerSarakModule({ id: 'design-engine', label: 'Design Engine', icon: 'Palette', category: 'Personalização' });
registerLocalComponent('design-engine', CustomizationPanel);
```

Se você **não** quer, não faça nada — e repare que a lib deixou de eleger um módulo dela como a
tela inicial do seu sistema. Para fixar a sua, use `options.theme.defaultModuleId`.

### 2. `SarakSecurityOrchestrator` foi removido

O componente de MFA saiu da biblioteca, junto com as três peças que só ele usava
(`SecurityOrchestratorSetup`, `SecurityOrchestratorStatus`, `SecurityOrchestratorDisable`) e o hook
`useSecurityOrchestratorState`.

| | |
| --- | --- |
| **Antes** | `import { SarakSecurityOrchestrator } from '@sarak/lib-ui-core'`, falando com `GET/POST {endpoint}/mfa/*` |
| **Depois** | não existe mais |
| **Como migrar** | copie o componente para o seu projeto (o código está no histórico do git). **Não há substituto na lib, e isso é intencional:** autenticação é do host, não do Design System — a lib é indiferente ao seu sistema de auth |

Sai junto o contrato `'SECURITY_ORCHESTRATOR'` do union `VisualContractType`: um manifesto que
declarasse esse `type` renderizava o componente pelo `DynamicRenderer`, e agora cai no `default`.
**Se algum manifesto seu usa esse tipo, troque-o por `'CUSTOM'`** e aponte para o seu componente.

### 3. `upgradeThemePayload` perdeu o segundo parâmetro

| | |
| --- | --- |
| **Antes** | `upgradeThemePayload(payload, partialMode?)` |
| **Depois** | `upgradeThemePayload(payload)` |
| **Como migrar** | apague o segundo argumento se você o passava. Ele **nunca fez nada** — era declarado e jamais lido dentro da função, então o comportamento é idêntico |

### 4. O token `mfaQrCodeSize` saiu do tema

Ele existia só para o `SarakSecurityOrchestrator` do item 2. Com o componente fora, ninguém emitia
mais `--sarak-mfa-qr-code-size` — o token virou promessa sem emissor, e saiu junto.

| | |
| --- | --- |
| **Antes** | **410** tokens; `SarakDesignTokens` tinha a propriedade `mfaQrCodeSize: number`, e a variável `--sarak-mfa-qr-code-size` era emitida |
| **Depois** | **409** tokens; a propriedade e a variável não existem mais |
| **Como migrar** | se o seu tema (JSON, `customThemes` ou preset próprio) declara `mfaQrCodeSize`, **remova a chave** — o TypeScript vai acusá-la como propriedade desconhecida de `SarakDesignTokens`. Se o seu CSS lê `var(--sarak-mfa-qr-code-size)`, troque pelo seu próprio valor: a lib não a emite mais |

Tema declarado em JSON puro (sem tipagem) **não quebra em runtime** — a chave a mais é ignorada. O
erro aparece só para quem tipa o tema com `SarakDesignTokens`, que é o caminho recomendado.

### 5. O `SarakTabs` duplicado saiu (provavelmente não te afeta)

Existiam dois componentes com o mesmo nome e APIs incompatíveis: `Layouts/SarakTabs`
(`items`/`defaultActiveId`) e `UX/SarakTabs` (`tabs`/`activeTab`/`onChange`). **Só o de `UX/` era
público** — o outro nunca esteve no barril.

| | |
| --- | --- |
| **Antes** | `Layouts/SarakTabs` existia no código, alcançável só por deep import (proibido por contrato) |
| **Depois** | não existe mais; `SarakTabs` é, sem ambiguidade, o de `UX/` |
| **Como migrar** | nada, se você importa do barril. Se usava deep import, migre para a API do `UX/SarakTabs`: `tabs={[{id, label}]}`, `activeTab`, `onChange` |

---

## O "Factory Hard Reset" do painel deixou de apagar o `localStorage` inteiro do seu site

**Se você nunca abriu o painel de customização, nada muda para você.** Esta entrada existe porque
a mudança é de **comportamento observável**, e o comportamento antigo destruía dado que não era da
lib.

**Antes.** O botão *Restaurar Padrões* (aba Avançado do painel) chamava `localStorage.clear()`:
apagava a **origem inteira** do seu site — token de sessão, preferências, carrinho, qualquer coisa
que a sua aplicação tivesse guardado — e recarregava a página. O `confirm()` prometia apenas
"TODAS as configurações visuais", então nem quem lia o aviso sabia o que ia perder.

**Depois.** O reset remove **só as chaves que a lib grava**:

| | |
| --- | --- |
| **Antes** | `localStorage.clear()` — toda a origem |
| **Depois** | a `persistence.storageKey` do seu Provider (default `sarak-ui-design-v9.0`) e `sarak_lang` |
| **Como migrar** | nada a fazer. Se você **dependia** de o reset limpar o seu próprio armazenamento, chame o seu `clear` no seu código — a lib não faz mais isso por você |

O texto do `confirm()` foi reescrito para descrever exatamente isso, e nada além disso.

---

## `SarakTable` ganhou `responsive` — o colapso mobile agora tem opt-out

**Aditivo: não quebra nada.** O default (`true`) é o comportamento que já existia.

No smartphone, o `SarakTable` troca a tabela colunar por cards empilhados. Isso era
**incondicional** — não havia como desligar, enquanto o irmão `SarakDataTable` já aceitava
`responsive={false}`. Duas tabelas públicas, duas APIs diferentes.

```tsx
// Colapsa no celular (default — igual a antes)
<SarakTable endpoint="/api/itens" />

// Mantém a tabela colunar em qualquer dispositivo
<SarakTable endpoint="/api/itens" responsive={false} />
```

Mesma prop, mesmo default e mesmo efeito do `SarakDataTable`.

---

## Engines: `SarakChatEngine` e `SarakFlowEngine` viraram públicos; `SarakVisualEngine` foi removido

**Provavelmente não quebra nada para você** — nenhum dos três estava no barril público, então
não havia como importá-los pela porta oficial. A entrada existe porque o arquivo é o histórico
do contrato, e porque quem usava **deep import** (proibido por contrato, mas possível) é afetado.

**Ganho — dois engines novos na API pública:**

```tsx
import { SarakChatEngine, SarakFlowEngine } from '@sarak/lib-ui-core';
import type { SarakChatEngineProps, SarakFlowEngineProps } from '@sarak/lib-ui-core';
```

Os dois entram **atrás de fronteira lazy**, com o `Suspense` embutido — igual ao
`SarakChartEngine`. Você **não** precisa declarar `Suspense`, e o custo no chunk de boot é
zero: `react-syntax-highlighter` e `reactflow` só carregam quando o componente é renderizado.
Ambos são peer dependencies — instale-as se for usar o engine correspondente.

**Remoção — `SarakVisualEngine` e `PaletteSelector` saíram da biblioteca.**

| | |
| --- | --- |
| **Antes** | `src/components/engines/visuals/` — nunca exportados no barril, sem consumidor na lib nem no único consumidor real |
| **Depois** | não existem mais |
| **Como migrar** | se você alcançava algum dos dois por deep import, copie o componente para o seu projeto (o código está no histórico do git). Não há substituto na lib: o `SarakVisualEngine` desenhava ilustrações técnicas decorativas, e o `PaletteSelector` renderizava uma lista de paletas que **já era um array vazio** — ele não desenhava nada |

Junto saiu o barril `src/components/engines/index.ts`, que declarava os quatro engines e **não
era importado por ninguém** — código morto que fazia a arquitetura parecer outra.

---

## Releases com tag: `#semver:` passa a funcionar — e você não precisa fazer nada

**Não quebra nada.** Nenhum export mudou, nenhum comportamento mudou, e **nenhuma forma de
instalar deixou de funcionar**. Esta entrada existe porque uma capacidade NOVA ficou disponível
e vale a pena saber que ela existe.

**O que mudou.** O repositório passou a emitir **tags `vX.Y.Z`** a cada release (`v1.0.0` é a
primeira). O npm resolve faixa semver contra as tags de um repositório git — então:

```jsonc
// RECOMENDADO a partir de agora
"@sarak/lib-ui-core": "github:Lib-Sarak/Sarak-Lib-UI-Core#semver:^1.0.0"

// SUPORTADO, e continua correto — não é erro, não é depreciado
"@sarak/lib-ui-core": "github:Lib-Sarak/Sarak-Lib-UI-Core"
```

Com a faixa, `npm update @sarak/lib-ui-core` sobe sozinho para a maior versão compatível — **sem
registry, sem editar o `package.json`, e sem atravessar MAJOR**. Sem a faixa, tudo segue como
antes: `npm run sarak:update` continua sendo o caminho (é ele que fura o pin do lockfile e o cache).

**O que você precisa fazer: nada.** Migrar é opcional e reversível. Se quiser migrar, é uma linha
no seu `package.json` seguida de uma reinstalação.

**O aviso mudou de vocabulário.** `sarak-ui check` passa a comparar **versões** em vez de hashes:
`instalado v1.0.1, publicado v1.0.2`. Se o seu spec tem uma faixa `^1`, um `v2.0.0` publicado
**não** vira aviso — ele não chegaria até você por `npm update`, e um aviso que não se resolve é
um aviso que se aprende a ignorar.

Detalhe e justificativa: `specs/adr/008-releases-com-tag-e-semver-em-git.md`.

---

## Renumeração de `3.0.0` para `1.0.0` — identidade, não regressão

**Não quebra nada. Nada foi removido, nada mudou de comportamento.** Esta entrada existe
justamente porque o número ANDA PARA TRÁS, e um número que anda para trás normalmente
significa perda de capacidade. Aqui não significa.

**O que mudou.**

| | Antes | Depois |
| --- | --- | --- |
| `package.json` → `version` | `3.0.0` | **`1.0.0`** |
| `dist/BUILD_INFO.json` → `libVersion` | `3.0.0` | `1.0.0` (regenerado por `npm run build`) |
| `sarak-ui/VERSION` → `libVersion` | `3.0.0` | `1.0.0` (regenerado por `npm run guide`) |

**Por quê.** O `3.0.0` era herança sem significado: **nunca houve um 1.x nem um 2.x com
release**. O pacote nunca foi publicado em registry, o repositório tem **zero tags git**, e a
`version` ficou **imóvel por mais de 15 commits** que alteraram o `package.json` — inclusive
commits que mudaram o contrato público. O número não descrevia nada.

Esta é a v1 do produto. O número passa a dizer a verdade, e a partir daqui ele **se move**,
com a política de MAJOR/MINOR/PATCH descrita em `specs/specs/03-versionamento-e-release.md`.

**O que você precisa fazer: nada.**

- Se você resolve por **`github:`** — a resolução é por **commit**, não por semver. O `npm install`
  se comporta exatamente como antes.
- Se você resolve por **`file:`/`link:`** — a resolução é por **caminho**. Idem.
- Um `^3.0.0` escrito à mão no seu `package.json` **nunca esteve sendo respeitado** nesses dois
  modos; se você o tem, pode trocar por `^1.0.0` por higiene, sem efeito prático.

**O que NÃO foi renumerado, e por quê** — são outras coisas, com ciclos de vida próprios:

| Número | Onde | O que é |
| --- | --- | --- |
| `kitSchemaVersion=1` | `sarak-ui/VERSION` | Versão do **formato** do kit do consumidor |
| `MASTER_DESIGN_MAP.version` | `src/core/Design/master-map.ts` | Versão do **dicionário de tokens** |
| `schema_version` | payload de design | Versão do **formato do tema** |

---

## CLI do consumidor: comandos reais, multi-gerenciador e aviso de atualização (Spec 51)

**Não quebra nada.** Tudo abaixo é aditivo: os scripts já gerados em consumidores existentes
continuam funcionando. A migração é opcional, mas recomendada.

**O que mudou.**

| | Antes | Depois |
| --- | --- | --- |
| Comandos da CLI | só `init`. `sarak-ui check` imprimia a **ajuda do `init`** | `init` · `check` · `refresh`; comando desconhecido diz **qual** não existe |
| `sarak:check` no `package.json` | caminho INTERNO (`bin/scaffold/checkUpdate.mjs`) | superfície pública (`bin/sarak-ui.mjs check`) |
| `sarak:update` | string **npm fixa** — quebrava em workspace pnpm/yarn | gerado conforme o **gerenciador detectado** (npm/pnpm/yarn) |
| `check` em monorepo | falhava (`package.json/package-lock.json não encontrados`) | procura o lockfile **subindo a árvore** |
| Dependência `file:`/`link:` | tratada como **erro** (`lockfile em formato inesperado`) | diagnóstico próprio, **exit 0**: link vivo × cópia velha |
| Saber de versão nova | só sob demanda, e **em silêncio** se você não rodasse nada | `check --notify` no `predev` avisa a cada `npm run dev` |

**Migração opcional** — no `package.json` do seu projeto:

```jsonc
// antes
"sarak:check": "node node_modules/@sarak/lib-ui-core/bin/scaffold/checkUpdate.mjs",
// depois (a forma pública; imune a refatoração interna da lib)
"sarak:check": "node node_modules/@sarak/lib-ui-core/bin/sarak-ui.mjs check",

// novo: o aviso de atualização, no pacote que roda o `dev`
"predev": "node node_modules/@sarak/lib-ui-core/bin/sarak-ui.mjs check --notify"
```

Se o seu `sarak:update` for a string npm e o projeto usar pnpm/yarn, troque as duas primeiras
etapas pelas do seu gerenciador (`pnpm remove … && pnpm add …`, `yarn remove … && yarn add …`) e
termine com `… && node node_modules/@sarak/lib-ui-core/bin/sarak-ui.mjs refresh`.

**Contrato do `--notify`:** silencioso quando em dia, quando não há rede e quando a verificação não
pôde ser feita; **exit 0 sempre**. Ele nunca derruba o seu `dev`.

---

## Rótulos decorativos — fim da marca da lib estampada em componentes (Spec 49)

**O que mudou.** A Spec 47 fechou a FONTE do vazamento de identidade (defaults de
branding → `document.title`/`systemName`), mas alguns componentes **consumidor-facing**
seguiam com a string `'Sarak Lib'`/`'Sarak AI'` **hardcoded** em textos puramente
decorativos — inclusive um regredindo para `'Sarak Lib'` como efeito colateral da própria
Spec 47 (`SarakEmptyState`, que antes caía em `'Sarak OS'`). A Spec 49 neutraliza esses
sinks: onde há fonte do consumidor (`systemName`), o componente cai nela; senão, um
rótulo genérico de função substitui o nome da lib.

| Componente | Antes | Depois |
| --- | --- | --- |
| `SarakEmptyState` (`type="minimal"`) | `systemName \|\| 'Sarak Lib'` | `systemName \|\| 'Sistema'` |
| `SarakEmptyState` (`type="abstract"`, default) | `'Sarak Lib Core Engine'` (fixo) | `systemName \|\| 'System Core Engine'` |
| `SarakSearch` (rodapé da paleta) | `'Sarak Lib Search Engine'` (fixo) | `` `${systemName} Search Engine` `` ou `'Search Engine'` |
| `ChatHeader` (subtítulo) | `'Agnostic Interface • Sarak Lib Engine'` | `'Agnostic Interface • Chat Engine'` |
| `SarakChat` (default de `label`) | `'Sarak AI Chat Lab'` | `'AI Chat'` (prop `label` continua sobrescrevível) |
| `SarakShell` (`brand` default, quando o consumidor não passa `manifest.brand`) | `{ name: 'Sarak Lib' }` / fallback `'Sarak'` | `{ name: 'Sistema' }` / fallback `'Sistema'` |
| `ShellUserWidget` (nome do usuário sem `username`/`email`) | `'Sarak User'` | `'User'` |

Os dois últimos (`SarakShell`/`ShellUserWidget`) não estavam no levantamento original da
spec — apareceram na confirmação em código durante a execução: `SarakShell` é a fonte do
`brand` que `SidebarNav`/`TopbarNav` já consomem corretamente (`systemName || brand.name`),
mas o **default** desse `brand` nomeava a lib quando o consumidor não fornecia
`manifest.brand`, reabrindo o mesmo vazamento por outra porta.

**Nenhuma capacidade foi removida** — todas as props (`label`, `brand`, `systemName`)
seguem funcionando e sobrescrevendo o default; a mudança é só o **valor** do fallback.

**Gate anti-regressão:** `npm run zero-brand:check` (roda no `npm run build`) falha se
`'Sarak Lib'`/`'Sarak OS'`/`'Sarak AI'` voltar a aparecer como texto renderizado em
componente consumidor-facing. Os painéis INTERNOS do Design Engine (Kitchen Sink, abas de
customização — ferramenta de autoria da própria lib, não embutida pelo consumidor) ficam
numa allowlist explícita em `gates/scripts/contrato/check-zero-brand.mjs`.

**Handoff para a Spec 50** (kit de uso do consumidor): não documentar nem exemplificar
componentes que estampem a marca da lib — os exemplos do kit devem refletir os rótulos
neutros acima.

---

## Identidade da página — a lib parou de impor a própria marca (Spec 47)

**O que mudou.** O `DEFAULT_BRANDING` do Provider trazia `companyName: 'Sarak OS'` e
`tabName: 'Sarak OS'`. Como o guard a jusante era `if (branding?.tabName)` e o default
era sempre truthy, **todo consumidor tinha o `<title>` do seu `index.html` sobrescrito
por "Sarak OS"** assim que o React montava — a aba piscava do nome do produto dele para
a marca da lib. O mesmo default vazava para o rótulo de marca do cromo (sidebar/topbar),
via `useSarakUI().systemName`.

Agora os campos de **identidade** nascem ausentes e a escrita é **opt-in**: sem valor
fornecido pelo consumidor, a lib não toca em `document.title` nem no favicon.

**Antes**

```tsx
// index.html: <title>Meu ERP</title>
<SarakUIProvider><App /></SarakUIProvider>
// → aba exibe "Sarak OS"
```

**Depois**

```tsx
// index.html: <title>Meu ERP</title>
<SarakUIProvider><App /></SarakUIProvider>
// → aba exibe "Meu ERP" (a lib não interfere)

// Para a lib gerenciar o título, forneça o valor:
<SarakUIProvider options={{ branding: { initial: { tabName: 'Meu ERP — Propostas' } } }}>
```

**Mudança de tipo.** Em `SarakBrandingState`, `companyName` e `tabName` passaram de
obrigatórios para opcionais (`companyName?: string`, `tabName?: string`), refletindo que
podem legitimamente não existir. Quem **escreve** branding não é afetado
(`options.branding.initial` já era `Partial<>`); quem **lê** `useSarakUI().branding`
precisa tratar `undefined`.

**Nenhuma capacidade foi removida** — só o default que vazava. `loginName` segue
obrigatório com default genérico (`'Acesso ao Sistema'`): é rótulo de UI, não marca.

Contrato completo em [`identidade-do-host.md`](./identidade-do-host.md).

---

## `SarakCardGrid.mapping` — fim dos campos de domínio LLM (Spec 42)

**O que mudou.** O `SarakCoreCard` — a variante `"classic"`, que é a **default** do
`SarakCardGrid` quando o autor não declara `variant` — carregava um catálogo de modelos
de IA embutido: painel fixo "Custo In (1M)" / "Custo Out (1M)", "Janela de Contexto"
calculando `contexto / 1000` em tokens, bloco "Tokenizer", cabeçalho "Descrição Técnica",
botão "Ver Specs" e subtítulo default `"Modelo"`. Um ERP que renderizasse contratos
recebia, sem pedir, a interface de um catálogo de LLMs.

Isso saiu. A Sarak não conhece domínio nenhum e **não formata valor de negócio**: o
painel virou uma lista genérica de pares rótulo/valor **já formatados pelo consumidor**.
É a mesma solução aplicada ao `SarakActionCard` na Spec 30.

**Campos removidos do tipo público `SarakCardGridProps['mapping']`:** `price_in`,
`price_out`, `context`. (O `SarakCoreCard` também deixou de ler `tokenizer` e `price`.)

**Antes**

```tsx
<SarakCardGrid
    endpoint="/api/v1/modelos"
    mapping={{
        title: 'name',
        subtitle: 'vendor',
        price_in: 'price_in',       // a lib fazia `$${Number(v).toFixed(4)}`
        price_out: 'price_out',     // idem
        context: 'context_window',  // a lib fazia `${v / 1000}k tokens`
        tokenizer: 'tokenizer_id',
        description: 'tech_description',
    }}
/>
```

**Depois** — o item traz um array de pares prontos; a lib só desenha:

```tsx
// O consumidor formata (moeda, unidade, arredondamento) no seu próprio código,
// no servidor ou num `map` antes de renderizar:
const item = {
    name: 'GPT-X',
    vendor: 'OpenAI',
    tech_description: 'Modelo multimodal de alta capacidade.',
    specs: [
        { label: 'Custo In (1M)', value: '$2.5000' },
        { label: 'Custo Out (1M)', value: '$10.0000' },
        { label: 'Janela de Contexto', value: '128k tokens' },
        { label: 'Tokenizer', value: 'o200k_base' },
    ],
};

<SarakCardGrid
    endpoint="/api/v1/modelos"
    mapping={{
        title: 'name',
        subtitle: 'vendor',
        description: 'tech_description',
        details: 'specs',                       // ← o painel inteiro vem daqui
        description_label: 'Descrição Técnica',  // rótulo literal, opcional
        expand_label: 'Ver Specs',               // default: "Ver mais"
    }}
/>
```

**Outros textos fixos que viraram dado** (todos opcionais; ausente = sem cabeçalho):

| Antes (fixo no componente) | Depois (chave literal do `mapping`) | Default |
| --- | --- | --- |
| `"Modelo"` (subtítulo) | `subtitle` (caminho) | vazio |
| `"Ver Specs"` / `"Fechar"` | `expand_label` / `collapse_label` | `"Ver mais"` / `"Fechar"` |
| `"Descrição Técnica"` | `description_label` | sem cabeçalho |
| `"Input Capacities"` | `input_caps_label` | sem cabeçalho |
| `"Output Capacities"` | `output_caps_label` | sem cabeçalho |

> **Chave literal × caminho:** a maioria dos valores do `mapping` é o *caminho* de um
> campo do item (`'user.name'`); as chaves marcadas como *literal* no catálogo
> (`icon`, `*_label`) são o texto/nome em si — mesma convenção que o `icon` já usava.

**Efeitos colaterais visíveis**, mesmo para quem não usava os campos removidos:

- O botão expansível só é renderizado quando há `mapping.description` — antes ele
  aparecia sempre e podia abrir um painel vazio.
- Os chips de `input_caps`/`output_caps` não têm mais ícone por palavra-chave
  (`vision`/`web`/`chat` eram domínio de LLM); todos usam o mesmo ícone neutro.
- O painel de detalhes some por completo quando não há `details` — antes exibia
  `"N/A"`/`"Desconhecida"`.

**Ganho colateral:** `SarakCardGridProps` passou a ser **exportado publicamente** (estava
fora do barril justamente porque o tipo carregava o domínio LLM).
