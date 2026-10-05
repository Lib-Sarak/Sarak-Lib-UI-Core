# Catálogo de Componentes — Sarak-Lib-UI-Core

> **GERADO** por `scripts/generate-component-catalog.mjs` a partir do código-fonte (componentes + interfaces).
> Não edite à mão — rode `npm run catalog`. O build falha se este arquivo estiver defasado.

## Tokens e valores permitidos

> Valores de espaçamento aceitos pelas primitivas estruturais (`gap`, `padding`). Fora desta lista, o resolutor AVISA (`console.warn` com sugestão) e cai no default do Design Engine.

### Espaçamento semântico (`gap`, `padding`)

Traduzidos por `resolveToken` (`core/Design/resolveToken.ts`). Qualquer comprimento CSS válido também passa direto: `16px`, `1rem`, `0`, `var(--x, 16px)`, `calc(...)`.

| Token | Traduz para |
| --- | --- |
| `spacing-xs` | `calc(var(--sarak-layout-gap-sm, 8px) * 0.5)` |
| `spacing-sm` | `var(--sarak-layout-gap-sm, 8px)` |
| `spacing-md` | `var(--sarak-layout-gap-md, 16px)` |
| `spacing-lg` | `var(--sarak-layout-gap-lg, 24px)` |
| `spacing-xl` | `calc(var(--sarak-layout-gap-lg, 24px) * 1.5)` |

### Variantes literais por componente

| Componente | Prop | Valores aceitos |
| --- | --- | --- |
| `SarakAppChrome` | `navigationStyle` | `sidebar` · `topbar` · `auto` |
| `SarakAuthScreen` | `socialConfig` | `compact` · `full` · `glass` · `sovereign` |
| `SarakAuthScreen` | `role` | `primary` · `secondary` · `neutral` · `accent` |
| `SarakAuthScreen` | `density` | `compact` · `standard` · `spacious` |
| `SarakAuthScreen` | `importance` | `hero` · `base` · `subtle` |
| `SarakButton` | `variant` | `primary` · `secondary` · `ghost` · `danger` · `success` · `outline` |
| `SarakButton` | `size` | `xs` · `sm` · `md` · `lg` |
| `SarakCardGrid` | `role` | `primary` · `secondary` · `neutral` · `accent` |
| `SarakCardGrid` | `density` | `compact` · `standard` · `spacious` |
| `SarakCardGrid` | `importance` | `hero` · `base` · `subtle` |
| `SarakCardGrid` | `variant` | `classic` · `title` · `action` · `search` |
| `SarakCatalogGrid` | `role` | `primary` · `secondary` · `neutral` · `accent` |
| `SarakCatalogGrid` | `density` | `compact` · `standard` · `spacious` |
| `SarakCatalogGrid` | `importance` | `hero` · `base` · `subtle` |
| `SarakChart` | `role` | `primary` · `secondary` · `neutral` · `accent` |
| `SarakChart` | `density` | `compact` · `standard` · `spacious` |
| `SarakChart` | `importance` | `hero` · `base` · `subtle` |
| `SarakChartEngine` | `type` | `line` · `area` · `bar` · `pie` · `radar` · `gauge` · `scatter` · `heatmap` · `funnel` · `treemap` · `candlestick` · `sunburst` · `histogram` · `boxplot` |
| `SarakChartEngine` | `config` | `recharts` · `echarts` |
| `SarakChat` | `role` | `primary` · `secondary` · `neutral` · `accent` |
| `SarakChat` | `density` | `compact` · `standard` · `spacious` |
| `SarakChat` | `importance` | `hero` · `base` · `subtle` |
| `SarakDatePicker` | `mode` | `single` · `range` |
| `SarakDrawer` | `direction` | `left` · `right` · `top` · `bottom` |
| `SarakEmptyState` | `type` | `minimal` · `abstract` · `geometric` |
| `SarakFlex` | `justify` | `flex-start` · `flex-end` · `center` · `space-between` · `space-around` · `space-evenly` |
| `SarakFlex` | `align` | `stretch` · `flex-start` · `flex-end` · `center` · `baseline` |
| `SarakForm` | `mode` | `create` · `edit` |
| `SarakForm` | `actions` | `POST` · `PATCH` · `DELETE` |
| `SarakForm` | `role` | `primary` · `secondary` · `neutral` · `accent` |
| `SarakForm` | `density` | `compact` · `standard` · `spacious` |
| `SarakForm` | `importance` | `hero` · `base` · `subtle` |
| `SarakIconButton` | `variant` | `primary` · `secondary` · `ghost` · `danger` |
| `SarakIconButton` | `size` | `xs` · `sm` · `md` · `lg` |
| `SarakManagementGrid` | `groupActions` | `plus` · `settings` |
| `SarakManagementGrid` | `role` | `primary` · `secondary` · `neutral` · `accent` |
| `SarakManagementGrid` | `density` | `compact` · `standard` · `spacious` |
| `SarakManagementGrid` | `importance` | `hero` · `base` · `subtle` |
| `SarakShellLanguageSelector` | `variant` | `horizontal` · `vertical` |
| `SarakShellNav` | `orientation` | `vertical` · `horizontal` · `auto` |
| `SarakShellSearchWidget` | `variant` | `bar` · `icon` |
| `SarakShellThemeToggle` | `variant` | `horizontal` · `vertical` · `mini` |
| `SarakShellUserWidget` | `variant` | `horizontal` · `vertical` · `mini` |
| `SarakSocialButton` | `provider` | `google` · `github` |
| `SarakSocialButton` | `variant` | `glass` · `sovereign` |
| `SarakSpinner` | `size` | `sm` · `md` · `lg` |
| `SarakStats` | `role` | `primary` · `secondary` · `neutral` · `accent` |
| `SarakStats` | `density` | `compact` · `standard` · `spacious` |
| `SarakStats` | `importance` | `hero` · `base` · `subtle` |
| `SarakTable` | `role` | `primary` · `secondary` · `neutral` · `accent` |
| `SarakTable` | `density` | `compact` · `standard` · `spacious` |
| `SarakTable` | `importance` | `hero` · `base` · `subtle` |
| `SarakTabs` | `variant` | `pills` · `underlined` · `enclosed` |
| `SarakTypography` | `transform` | `none` · `uppercase` · `capitalize` |

### CSS Variables públicas (namespace `--sarak-*`)

Vars REAIS emitidas pelo Design Engine. Use SEMPRE com fallback — `var(--sarak-x, valor)`. Nomes fora desta lista NÃO existem e não pintam nada.

`--sarak-accent-color` · `--sarak-bg-opacity` · `--sarak-body-font` · `--sarak-border-radius` · `--sarak-border-radius-lg` · `--sarak-border-radius-md` · `--sarak-border-radius-sm` · `--sarak-border-style` · `--sarak-border-type` · `--sarak-border-width` · `--sarak-card-bg` · `--sarak-card-border` · `--sarak-card-padding-md` · `--sarak-card-radius` · `--sarak-chart-thickness` · `--sarak-chat-anim-speed` · `--sarak-chat-bubble` · `--sarak-color-depth` · `--sarak-color-variation` · `--sarak-contrast-curve` · `--sarak-error-color` · `--sarak-flow-grid` · `--sarak-flow-radius` · `--sarak-font-scale` · `--sarak-font-size` · `--sarak-glass-blur` · `--sarak-glass-opacity` · `--sarak-glass-saturation` · `--sarak-heading-font` · `--sarak-icon-stroke` · `--sarak-layered-shadows` · `--sarak-layout` · `--sarak-layout-density` · `--sarak-layout-gap` · `--sarak-layout-gap-lg` · `--sarak-layout-gap-md` · `--sarak-layout-gap-sm` · `--sarak-line-height` · `--sarak-max-width` · `--sarak-mode` · `--sarak-nav-style` · `--sarak-navigation-style` · `--sarak-noise-opacity` · `--sarak-palette` · `--sarak-primary-color` · `--sarak-scrollbar-width` · `--sarak-secondary-color` · `--sarak-security-glow` · `--sarak-security-pulse` · `--sarak-shadow-intensity` · `--sarak-sidebar-active-color` · `--sarak-sidebar-bg` · `--sarak-sidebar-hover-color` · `--sarak-sidebar-noise-opacity` · `--sarak-sidebar-width` · `--sarak-success-color` · `--sarak-surface` · `--sarak-surface-color` · `--sarak-surface-intensity` · `--sarak-system-tone` · `--sarak-tab-gap` · `--sarak-tab-section-margin` · `--sarak-tertiary-color` · `--sarak-texture` · `--sarak-texture-color` · `--sarak-texture-opacity` · `--sarak-title-color` · `--sarak-topbar-active-color` · `--sarak-topbar-bg` · `--sarak-topbar-height` · `--sarak-topbar-hover-color` · `--sarak-topbar-noise-opacity` · `--sarak-warning-color`

### Ícones (100 nomes válidos)

Valores aceitos por `<SarakIcon name>`, por `navItems[].icon` (`SarakAppChrome`/`SarakShellNav`) e por `mapping.icon` nos cards. O nome é o MESMO nas três famílias (`iconFamily`: `lucide` · `phosphor` · `tabler`) — trocar a família repinta todos os ícones sem mexer em nome nenhum.

Nome fora desta lista **não renderiza o ícone pedido**: o `SarakIcon` avisa no console (`console.warn`, uma vez por nome) e desenha `AlertCircle` no lugar — degradação visível, nunca tela quebrada.

`AlertCircle` · `AlertTriangle` · `Check` · `CheckCircle2` · `X` · `Info` · `HelpCircle` · `Menu` · `Search` · `Bell` · `Filter` · `List` · `Grid` · `Layout` · `LayoutDashboard` · `Home` · `ChevronDown` · `ChevronLeft` · `ChevronRight` · `ChevronUp` · `ArrowRight` · `ArrowLeft` · `ArrowUp` · `ArrowDown` · `ArrowUpDown` · `CornerDownRight` · `MoreVertical` · `MoreHorizontal` · `Maximize2` · `Minimize2` · `Loader2` · `RefreshCw` · `User` · `UserPlus` · `Users` · `LogIn` · `LogOut` · `Lock` · `Shield` · `Eye` · `File` · `FileText` · `FileSpreadsheet` · `Folder` · `Image` · `Paperclip` · `ScrollText` · `Clipboard` · `Copy` · `Download` · `Upload` · `UploadCloud` · `Printer` · `Save` · `Edit` · `Edit3` · `Plus` · `Trash2` · `Type` · `AlignLeft` · `Hash` · `Activity` · `BarChart3` · `LineChart` · `PieChart` · `ScatterChart` · `TrendingUp` · `Database` · `Layers` · `Network` · `Box` · `Package` · `Cpu` · `Cloud` · `Terminal` · `Thermometer` · `History` · `Calendar` · `Clock` · `MessageSquare` · `Mail` · `Send` · `Phone` · `Bot` · `Globe` · `Link` · `ExternalLink` · `Briefcase` · `Building` · `CreditCard` · `DollarSign` · `MapPin` · `Tag` · `Star` · `Play` · `Palette` · `Settings` · `Zap` · `Chrome` · `Github`

## Componentes públicos (96)

### SARAK_DEFAULT_COLUMN_WIDTH

_Props não expostas por interface nomeada — consulte o arquivo do componente._

### SARAK_MIN_COLUMN_WIDTH

_Props não expostas por interface nomeada — consulte o arquivo do componente._

### SarakAccordion

Props (`SarakAccordionProps` — `src/components/atomic/Layouts/SarakAccordion.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `title` | `React.ReactNode` | sim | Título obrigatório do botão que abre e fecha o painel; sem conteúdo, o controle fica sem título visível. |
| `children` | `React.ReactNode` | sim | Conteúdo obrigatório do painel, mantido no DOM mesmo quando recolhido; se omitido, o painel fica vazio. |
| `defaultOpen` | `boolean` | não | Define o estado inicial do painel; sem a prop, começa recolhido e mudanças posteriores não o controlam. |
| `className` | `string` | não | Acrescenta classes à raiz do acordeão; omitida, nenhuma classe adicional é aplicada. |

### SarakActionCard

Props (`SarakActionCardProps` — `src/components/atomic/Cards/SarakActionCard.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `item` | `TItem` | sim |  |
| `mapping` | `Record<string, string>` | não |  |
| `className` | `string` | não |  |
| `onAction` | `(item: TItem) => void` | não |  |
| `design` | `SarakThemePayload` | não |  |
| `label` | `string` | não |  |
| `actionLabel` | `string` | não | Texto do botão de ação principal (default: "Executar"). |

### SarakAlert

Props (`SarakAlertProps` — `src/components/atomic/Feedback/SarakAlert.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `variant` | `SarakAlertVariant` | não | Define a intenção `info`, `success`, `warning` ou `error`; omitida, usa `info`. Só `error` recebe anúncio assertivo. |
| `title` | `string` | sim | Define o título visível e o nome acessível do aviso; é obrigatória e, se omitida em runtime, o aviso fica sem título. |
| `message` | `string` | sim | Define o texto simples do aviso; é obrigatório e, se omitido em runtime, nenhum texto será exibido. |
| `action` | `{ label: string; onClick: () => void; }` | não | Exibe uma ação com rótulo e callback; omitida, não há botão, e clicar nela não fecha o aviso automaticamente. |
| `onClose` | `() => void` | não | Exibe o botão de fechar; omitida, não há botão, e o callback deve remover ou desmontar o aviso, pois ele não tem estado interno de fechamento. |

### SarakAnalyticalPage

Props (`SarakAnalyticalPageProps` — `src/components/Layout/SarakAnalyticalPage.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `navBar` | `ReactNode` | não |  |
| `mainContent` | `ReactNode` | sim |  |
| `sidePanel` | `ReactNode` | não |  |
| `sidePanelAsDrawerOnMobile` | `boolean` | não | Se true, o painel lateral abre como um modal/drawer por cima no mobile. Se false, fica empilhado. Default: true |
| `centeredOnDesktop` | `boolean` | não | Se true, centraliza horizontalmente e verticalmente o mainContent no Desktop para preencher vazios. |

### SarakAppChrome

Props (`SarakAppChromeProps` — `src/components/Layout/SarakAppChrome.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `children` | `React.ReactNode` | sim | Conteúdo do app (a tela do próprio módulo). |
| `brand` | `{ name?: string; logoUrl?: string }` | não | Identidade exibida no cromo (topo da sidebar / início da topbar). |
| `navItems` | `SarakNavItem[]` | não | Navegação ESTRUTURADA com ícone first-class (Spec 40.2 — L1). Renderiza ícone (via `SarakIcon`/`SarakIconMap`) + label, temável por token, com estado ativo acessível (`aria-current`, foco por teclado). É o caminho recomendado para o cromo por-app; tem precedência sobre `nav` quando ambos são passados. |
| `nav` | `SarakShellNavItem[]` | não | Itens de navegação como DADO no contrato do `SarakShellNav` (modelo declarativo, `route`/`activeRoute`). Mantido para compatibilidade; prefira `navItems`. |
| `activeRoute` | `string` | não | Rota ativa (destaca o item correspondente no `nav`; ignorado se `navItems`). |
| `onNavigate` | `(route: string) => void` | não | Clique/teclado num item de navegação — o host decide como navegar. |
| `navigationStyle` | `'sidebar' \| 'topbar' \| 'auto'` | não | Estilo do cromo. `'auto'` (default) segue o Design Engine (`design.navigationStyle === 'topbar'` → topbar; caso contrário → sidebar), então trocar o tema no `/design` também troca a orientação do cromo. |
| `topbarActions` | `React.ReactNode` | não | Conteúdo à direita da topbar (ações, avatar, seletor de tema…). Alias legado de `topbarEnd`. |
| `logo` | `React.ReactNode` | não | Slot `logo` (Spec 48 — L1): logo custom/animado (`ReactNode`). Tem PRECEDÊNCIA sobre `brand.logoUrl`; o `brand.name` continua ao lado. Aparece nos três modos. |
| `topbarStart` | `React.ReactNode` | não | Slot `topbarStart`: conteúdo no INÍCIO da barra superior (após a marca). Sem barra superior (modo sidebar) degrada para o topo da sidebar. |
| `topbarEnd` | `React.ReactNode` | não | Slot `topbarEnd`: conteúdo no FIM da barra superior. É o mesmo lugar do `topbarActions` (alias preservado); quando os dois vêm, `topbarEnd` vence. No modo sidebar degrada para o rodapé da sidebar (comportamento atual). |
| `search` | `React.ReactNode` | não | Slot `search`: conteúdo de busca do consumidor (tipicamente um `SarakShellSearchWidget`), posicionado por `design.searchPositionTopbar` (`left`/`center`/`right`) na topbar e `design.searchPositionSidebar` (`top`/`bottom`) na sidebar/drawer. A composição do widget controla se a busca default é oferecida; a região personalizada continua controlada pelo conteúdo desta prop. |
| `sidebarHeader` | `React.ReactNode` | não | Slot `sidebarHeader`: topo da sidebar (abaixo da marca). No celular migra para o drawer. |
| `sidebarFooter` | `React.ReactNode` | não | Slot `sidebarFooter`: rodapé da sidebar. No celular migra para o drawer. |
| `banner` | `React.ReactNode` | não | Slot `banner`: faixa full-width no topo do cromo (aviso, promo, faixa animada). |
| `footer` | `React.ReactNode` | não | Slot `footer`: faixa full-width na base do cromo (rodapé da página). |
| `decoration` | `React.ReactNode` | não | Slot `decoration`: camada decorativa ATRÁS do conteúdo do cromo (imagem/animação escopada ao cromo). É ornamento — `aria-hidden` e sem captura de foco/toque. COMPLEMENTA o fundo/atmosfera global por tema (Design Engine), não o substitui. |
| `user` | `SarakShellUser` | não | Identidade exibida no widget de usuário default. |
| `logout` | `() => void` | não | Encerra a sessão a partir do widget de usuário default. |
| `notifications` | `SarakChromeNotification[]` | não | Notificações fornecidas pelo aplicativo para o widget da barra. |
| `onNotificationSelect` | `(notification: SarakChromeNotification) => void` | não | Trata a seleção de uma notificação pelo usuário. |
| `widgets` | `SarakChromeWidgets` | não | O cromo nasce com busca (atalho Ctrl/Cmd+K incluso), alternância de tema, widget de usuário, notificações e colapso da navegação MONTADOS — sem escrever nada. Omitir esta prop mantém os widgets ligados; `false` num campo desliga só aquele. Um slot preenchido pelo consumidor (`search`) sempre vence o default correspondente. |
| `className` | `string` | não |  |
| `style` | `React.CSSProperties` | não |  |

### SarakAppChromeMobile

Props (`SarakAppChromeMobileProps` — `src/components/Layout/SarakAppChromeMobile.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `children` | `React.ReactNode` | sim |  |
| `brand` | `{ name?: string; logoUrl?: string }` | não |  |
| `logo` | `React.ReactNode` | não |  |
| `nav` | `SarakShellNavItem[]` | sim |  |
| `activeRoute` | `string` | não |  |
| `onNavigate` | `(route: string) => void` | não |  |
| `topbarActions` | `React.ReactNode` | não | Slot `topbarEnd` (alias legado `topbarActions`) — fim da barra compacta. |
| `topbarStart` | `React.ReactNode` | não | Slot `topbarStart` — início da barra compacta, logo após a marca. |
| `search` | `React.ReactNode` | não | Slot `search` — posicionado por `searchPositionSidebar` (é onde a sidebar existe no celular: o drawer). |
| `sidebarHeader` | `React.ReactNode` | não | Slot `sidebarHeader` — migra para o topo do drawer (a sidebar do celular). |
| `sidebarFooter` | `React.ReactNode` | não | Slot `sidebarFooter` — migra para o rodapé do drawer. |
| `banner` | `React.ReactNode` | não | Slot `banner` — faixa full-width no topo. |
| `footer` | `React.ReactNode` | não | Slot `footer` — faixa full-width na base. |
| `decoration` | `React.ReactNode` | não | Slot `decoration` — camada decorativa atrás do cromo (aria-hidden, sem foco/toque). |
| `user` | `SarakShellUser` | não | Identidade exibida no widget de usuário default, no rodapé do drawer. |
| `logout` | `() => void` | não |  |
| `notifications` | `SarakChromeNotification[]` | não |  |
| `onNotificationSelect` | `(notification: SarakChromeNotification) => void` | não |  |
| `widgets` | `SarakChromeWidgets` | não | Opt-out dos widgets default; o hambúrguer continua controlando a navegação no celular. |
| `className` | `string` | não |  |
| `rootStyle` | `React.CSSProperties` | sim |  |

### SarakAuthScreen

Props (`SarakAuthScreenProps` — `src/components/atomic/Templates/SarakAuthScreen.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `branding` | `{ name: string; logo?: string; }` | não |  |
| `isRegistering` | `boolean` | não |  |
| `setIsRegistering` | `(val: boolean) => void` | não |  |
| `mfaStep` | `boolean` | não |  |
| `setMfaStep` | `(val: boolean) => void` | não |  |
| `username` | `string` | não |  |
| `setUsername` | `(val: string) => void` | não |  |
| `password` | `string` | não |  |
| `setPassword` | `(val: string) => void` | não |  |
| `mfaCode` | `string` | não |  |
| `setMfaCode` | `(val: string) => void` | não |  |
| `showPassword` | `boolean` | não |  |
| `setShowPassword` | `(val: boolean) => void` | não |  |
| `error` | `string` | não |  |
| `isPending` | `boolean` | não |  |
| `onSubmit` | `(e: React.FormEvent) => void` | não |  |
| `onSocialLogin` | `(provider: string) => void` | não |  |
| `socialConfig` | `{ enabled: boolean; display: 'compact' \| 'full'; providers: Array<{ id: string; variant: 'glass' \| 'sovereign' }>; }` | não |  |
| `onForgot` | `() => void` | não |  |
| `onMasterLogin` | `() => void` | não |  |
| `onChange` | `(event: SarakAuthScreenEvent) => void` | não | Canal declarativo único — ver `SarakAuthScreenEvent`. Dispara em toda interação de negócio. |
| `role` | `'primary' \| 'secondary' \| 'neutral' \| 'accent'` | não |  |
| `density` | `'compact' \| 'standard' \| 'spacious'` | não |  |
| `importance` | `'hero' \| 'base' \| 'subtle'` | não |  |

### SarakAutocomplete

Props (`SarakAutocompleteProps` — `src/components/atomic/Inputs/SarakAutocomplete.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `options` | `SarakAutocompleteOption[]` | não | Opções locais filtradas pelo rótulo. Omitida, a lista começa vazia; com `searchOptions`, os resultados remotos substituem esta lista. |
| `searchOptions` | `(query: string) => Promise<SarakAutocompleteOption[]>` | não | Busca fornecida pelo host para listas remotas; a biblioteca não acessa a rede diretamente. Omitida, a propriedade options é filtrada localmente. Recriar a função mantendo-a definida não reinicia a busca nem chama o host de novo. A próxima busca usa a função mais recente; uma chamada já iniciada continua com a função que a iniciou. |
| `debounceMs` | `number` | não | Intervalo antes da busca remota, em milissegundos. Omitido, aguarda 300 ms; valores negativos são tratados como zero. |
| `value` | `string` | não | Texto digitado no modo controlado. Omitido, o componente guarda a busca internamente; quem controla deve atualizá-lo após a seleção. |
| `defaultValue` | `string` | não | Texto inicial no modo não controlado. Omitido, o campo começa vazio. |
| `onChange` | `React.ChangeEventHandler<HTMLInputElement>` | não | Recebe o evento nativo ao digitar. Omitida, não há notificação de digitação; selecionar uma opção é informado por `onOptionSelect`. |
| `placeholder` | `string` | não | Texto de dica do campo. Omitido, usa "Buscar...". |
| `onOptionSelect` | `(option: SarakAutocompleteOption) => void` | não | Recebe a opção escolhida por clique ou teclado. Omitida, a opção ainda preenche o texto do campo não controlado, sem emitir seleção externa. |

Estende: `Omit<SarakInputProps, 'defaultValue' | 'onChange' | 'value'>`

### SarakAvatar

Props (`SarakAvatarProps` — `src/components/atomic/Atoms/SarakAvatar.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `name` | `string` | sim | Nome da pessoa; obrigatório e usado como texto alternativo padrão e como origem das iniciais. Nome vazio (se a tipagem for contornada) exibe `?` no fallback. |
| `src` | `string` | não | Endereço da foto. Omitido, o avatar mostra as iniciais; se a imagem falhar ao carregar, também volta às iniciais. Para tentar novamente a mesma URL, remonte o componente. |
| `alt` | `string` | não | Texto alternativo da foto e nome acessível do fallback. Omitido, usa `name`; string vazia torna a imagem decorativa e deixa as iniciais sem nome acessível. |
| `size` | `SarakAvatarSize` | não | Tamanho na escala `xs`/`sm`/`md`/`lg` dos átomos. Omitido, usa `md`; o tamanho acompanha o token de espaçamento médio do tema. |

Estende: `Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'>`

### SarakBadge

Props (`SarakBadgeProps` — `src/components/atomic/Feedback/SarakBadge.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `variant` | `SarakBadgeVariant` | não |  |
| `size` | `SarakBadgeSize` | não |  |
| `pill` | `boolean` | não | Se true, o badge terá bordas mais arredondadas (estilo pill) |
| `soft` | `boolean` | não | Se true, o fundo será translúcido/suave em vez de sólido |

Estende: `React.HTMLAttributes<HTMLSpanElement>`

### SarakBreadcrumbs

Props (`SarakBreadcrumbsProps` — `src/components/atomic/Navigation/SarakBreadcrumbs.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `items` | `SarakBreadcrumbItem[]` | sim | Caminho do usuário, da raiz à folha. |
| `separator` | `React.ReactNode` | não | Separador entre migalhas (default: `/`). |
| `onNavigate` | `(href: string) => void` | não | Delega a navegação ao host (Spec 33, Regra 3) — não manipula a URL. |
| `className` | `string` | não |  |

### SarakButton

Props (`SarakButtonProps` — `src/components/atomic/Buttons/SarakButton.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `variant` | `'primary' \| 'secondary' \| 'ghost' \| 'danger' \| 'success' \| 'outline'` | não | Define a aparência visual sem mudar o tipo HTML; sem a prop, usa `primary`. |
| `isLoading` | `boolean` | não | Troca os ícones pelo indicador de carregamento e desabilita o botão enquanto ativa; omitida, mantém o botão habilitado. |
| `leftIcon` | `React.ReactNode` | não | Exibe um elemento antes do conteúdo; omitida, não há ícone à esquerda, e durante o carregamento é substituída pelo indicador. |
| `rightIcon` | `React.ReactNode` | não | Exibe um elemento depois do conteúdo; omitida, não há ícone à direita, e durante o carregamento fica oculta. |
| `fullWidth` | `boolean` | não | Faz o botão ocupar a largura disponível; omitida, a largura acompanha o conteúdo. |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg'` | não | Define a escala de altura, espaçamento e texto; sem a prop, usa `md`. |

Estende: `ButtonHTMLAttributes<HTMLButtonElement>`

### SarakCard

Props (`SarakCardProps` — `src/components/atomic/Cards/SarakCard.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `children` | `ReactNode` | não | Conteúdo composto do cartão; se omitido, a moldura temática permanece vazia. |
| `className` | `string` | não | Classes adicionais; se omitidas, o cartão mantém largura total e sua moldura temática. Classes utilitárias conflitantes substituem o padrão; a classe `sarak-card` é preservada para aplicar os tokens do tema. |

### SarakCardBody

Props (`SarakCardBodyProps` — `src/components/atomic/Cards/SarakCardBody.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `children` | `ReactNode` | não | Conteúdo principal; se omitido, a área do corpo permanece vazia. |
| `className` | `string` | não | Classes adicionais; se omitidas, nenhuma classe extra é aplicada. |

### SarakCardFooter

Props (`SarakCardFooterProps` — `src/components/atomic/Cards/SarakCardFooter.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `children` | `ReactNode` | não | Conteúdo do rodapé; se omitido, o invólucro do rodapé permanece vazio. |
| `className` | `string` | não | Classes adicionais; se omitidas, nenhuma classe extra é aplicada. |

### SarakCardGrid

Props (`SarakCardGridProps` — `src/components/atomic/Templates/SarakCardGrid.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `endpoint` | `string` | não | Sem `data`, busca por este endpoint. Com `data`, é ignorado — nenhuma chamada de rede ocorre. |
| `data` | `TData[]` | não | Dado já em mãos (cache, SSR, outra chamada) — quando presente, renderiza direto, sem rede. |
| `label` | `string` | não |  |
| `mapping` | `{ title: string; subtitle?: string; description?: string; badge?: string; tags?: string; icon?: string; color?: string; details?: string; input_caps?: string; output_caps?: string; input_caps_label?: string; output_caps_label?: string; description_label?: string; expand_label?: string; collapse_label?: string; }` | não | Mapa de dados do card. Cada valor é o CAMINHO de um campo do item, exceto os marcados como *literal* (texto/nome fixo escrito pelo próprio autor). Genérico por contrato (Spec 42): a Sarak não conhece domínio nenhum — nenhuma aritmética, unidade ou moeda é calculada aqui. O consumidor entrega valores prontos em `details`. |
| `filters` | `SarakFilterConfig[]` | não |  |
| `role` | `'primary' \| 'secondary' \| 'neutral' \| 'accent'` | não |  |
| `density` | `'compact' \| 'standard' \| 'spacious'` | não |  |
| `importance` | `'hero' \| 'base' \| 'subtle'` | não |  |
| `variant` | `'classic' \| 'title' \| 'action' \| 'search'` | não |  |

### SarakCardHeader

Props (`SarakCardHeaderProps` — `src/components/atomic/Cards/SarakCardHeader.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `children` | `ReactNode` | não | Conteúdo do cabeçalho; se omitido, o invólucro do cabeçalho permanece vazio. |
| `className` | `string` | não | Classes adicionais; se omitidas, nenhuma classe extra é aplicada. |

### SarakCatalogGrid

Props (`SarakCatalogGridProps` — `src/components/atomic/Templates/SarakCatalogGridProps.ts`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `items` | `SarakCatalogItem[]` | sim | Itens filtrados e exibidos; obrigatória. Cada registro precisa de `id` e `display_name`; a busca ignora `description` e outros campos. |
| `loading` | `boolean` | não | Exibe o indicador de carga no lugar de todo o catálogo; omitida, os itens são renderizados sem espera. |
| `title` | `string` | sim | Título obrigatório do catálogo; não há valor padrão e ele também fica oculto enquanto `loading` for verdadeiro. |
| `subtitle` | `string` | não | Texto complementar do cabeçalho; omitido, a linha de subtítulo não aparece. |
| `categories` | `Record<string, string>` | não | Mapeia cada valor de `item.category` para o rótulo do filtro; omitida, oferece apenas `all: 'Todos'`. Inclua `all` para manter o botão de mostrar tudo. |
| `onSync` | `() => void` | não | Habilita o botão que chama a rotina de sincronização; omitida, o botão não aparece. Ele fica fixo no canto inferior direito. |
| `renderCard` | `(item: SarakCatalogItem) => React.ReactNode` | não | Personaliza cada cartão já filtrado; omitida, o cartão padrão mostra `display_name` e `organization`. |
| `emptyMessage` | `string` | não | Mensagem exibida quando a lista filtrada fica vazia; omitida, usa `Nenhum item encontrado.`. Não aparece durante o carregamento. |
| `role` | `'primary' \| 'secondary' \| 'neutral' \| 'accent'` | não | Sem efeito nesta implementação; omitir ou alterar o valor não muda a renderização atual. |
| `density` | `'compact' \| 'standard' \| 'spacious'` | não | Sem efeito nesta implementação; omitir ou alterar o valor não muda a renderização atual. |
| `importance` | `'hero' \| 'base' \| 'subtle'` | não | Sem efeito nesta implementação; omitir ou alterar o valor não muda a renderização atual. |

### SarakChart

Props (`SarakChartProps` — `src/components/atomic/Templates/SarakChart.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `endpoint` | `string` | sim | Busca `daily_trend` ou o array da resposta e usa só os 15 itens finais; obrigatório, sem fonte alternativa se omitido. |
| `label` | `string` | não | Texto do cabeçalho; sem valor, o título fica vazio, pois não há rótulo padrão. |
| `mapping` | `Record<string, string>` | não | Não é lida por esta implementação; omitida ou preenchida, as séries continuam usando `tokens`/`value` e `date`. |
| `role` | `'primary' \| 'secondary' \| 'neutral' \| 'accent'` | não | Sem efeito nesta implementação; omitir ou alterar o valor não muda a renderização atual. |
| `density` | `'compact' \| 'standard' \| 'spacious'` | não | Sem efeito nesta implementação; omitir ou alterar o valor não muda a renderização atual. |
| `importance` | `'hero' \| 'base' \| 'subtle'` | não | Sem efeito nesta implementação; omitir ou alterar o valor não muda a renderização atual. |

### SarakChartEngine

Props (`SarakChartEngineProps` — `src/components/engines/charts/SarakChartEngine.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `type` | `'line' \| 'area' \| 'bar' \| 'pie' \| 'radar' \| 'gauge' \| 'scatter' \| 'heatmap' \| 'funnel' \| 'treemap' \| 'candlestick' \| 'sunburst' \| 'histogram' \| 'boxplot'` | sim | Seleciona o formato do gráfico; obrigatório. Com `recharts`, só `bar` vira barras e os demais formatos caem em linha. |
| `data` | `SarakChartDataItem[]` | sim | Registros das séries; obrigatório, com campos compatíveis com o formato e as chaves configuradas. |
| `config` | `{ xAxisKey?: string; dataKey?: string; engine?: 'recharts' \| 'echarts'; title?: string; showGradients?: boolean; showAnimation?: boolean; thickness?: number; }` | não | Ajusta chaves dos eixos e o motor; omitida, usa ECharts, eixo `name` e valor `value`. `title`, gradientes, animação e espessura não têm efeito nesta implementação. |

### SarakChat

Props (`SarakChatProps` — `src/components/atomic/Templates/SarakChat.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `endpoint` | `string` | sim | Rota POST anexada a `/api`; obrigatória, e o host precisa prover o endpoint e sua autenticação. |
| `modelsEndpoint` | `string` | não | Rota para carregar modelos; omitida, consulta `/api/llm-test-chat/models`. Passe `''` para não buscar modelos. |
| `label` | `string` | não | Nome exibido no cabeçalho; omitido, usa `AI Chat`. |
| `role` | `'primary' \| 'secondary' \| 'neutral' \| 'accent'` | não | Sem efeito nesta implementação; omitir ou alterar o valor não muda a renderização atual. |
| `density` | `'compact' \| 'standard' \| 'spacious'` | não | Sem efeito nesta implementação; omitir ou alterar o valor não muda a renderização atual. |
| `importance` | `'hero' \| 'base' \| 'subtle'` | não | Sem efeito nesta implementação; omitir ou alterar o valor não muda a renderização atual. |

### SarakChatEngine

Props (`SarakChatEngineProps` — `src/components/engines/chat/SarakChatEngine.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `messages` | `SarakMessage[]` | sim | Histórico controlado pelo consumidor; obrigatório. O motor o renderiza como Markdown e rola para a última mensagem quando a lista muda. |
| `onSendMessage` | `(text: string) => void` | sim | Recebe o texto digitado; obrigatório. O consumidor precisa atualizar `messages` para que a resposta apareça. |
| `isLoading` | `boolean` | não | Indica envio em andamento, mostra o indicador e bloqueia novo envio; omitida, vale `false`. |
| `placeholder` | `string` | não | Texto de orientação do campo de entrada; omitido, usa `Escreva sua mensagem...`. |

### SarakCheckbox

Props (`SarakCheckboxProps` — `src/components/atomic/Inputs/SarakCheckbox.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `label` | `React.ReactNode` | não |  |
| `description` | `React.ReactNode` | não |  |
| `indeterminate` | `boolean` | não |  |

Estende: `Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>`

### SarakContextMenu

Props (`SarakContextMenuProps` — `src/components/atomic/UX/SarakContextMenu.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `isOpen` | `boolean` | sim | Controla a visibilidade. |
| `position` | `SarakContextMenuPosition` | sim | Coordenada (viewport) onde abrir — normalmente `{ x: e.clientX, y: e.clientY }`. |
| `onClose` | `() => void` | sim | Fecha o menu (clique fora / ESC / escolha de item). |
| `children` | `React.ReactNode` | sim | Itens do menu (ex.: botões). |
| `className` | `string` | não |  |

### SarakCurrencyInput

Props (`SarakCurrencyInputProps` — `src/components/atomic/Inputs/SarakCurrencyInput.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `value` | `number \| null` | não | Valor numérico controlado; `null` representa campo vazio. Omitido, usa `defaultValue`; o pai deve atualizar após `onChange`. |
| `defaultValue` | `number \| null` | não | Valor numérico inicial. Omitido, o campo começa vazio; ignorado após a montagem ou quando `value` é informado. |
| `currency` | `string` | não | Moeda ISO 4217 de `Intl.NumberFormat`. Omitida, usa BRL; o estilo monetário aparece ao sair do campo; código inválido gera `RangeError`. |
| `locale` | `string` | não | Locale dos separadores durante a edição e da formatação ao sair do campo. Omitida, acompanha o idioma do Provider; sem Provider, usa `pt-BR`. Textos colados devem segui-la. |
| `label` | `string` | não | Rótulo visível encaminhado ao `SarakInput`. Omitido, não há rótulo; forneça um nome acessível. |
| `onChange` | `(cleanValue: number \| null) => void` | não | Emite número ou `null` para o campo vazio, nunca o texto formatado. Omitido, mudanças não são notificadas. |
| `inputMode` | `React.HTMLAttributes<HTMLInputElement>['inputMode']` | não | Teclado sugerido ao dispositivo. Omitido, solicita teclado decimal na locale atual. |

Estende: `Omit<SarakInputProps, 'defaultValue' | 'label' | 'onChange' | 'type' | 'value'>`

### SarakDataEmpty

Props (`SarakDataEmptyProps` — `src/components/atomic/Feedback/SarakDataEmpty.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `message` | `string` | não | Mensagem exibida (default: "Nenhum dado encontrado."). |

### SarakDataGrid

Props (`SarakDataGridProps` — `src/components/atomic/DataDisplay/SarakDataGrid/SarakDataGridImpl.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `count` | `number` | sim | Quantidade total de linhas (a fonte real vive fora; aqui só virtualizamos). |
| `renderRow` | `(index: number) => React.ReactNode` | sim | Render de UMA linha pelo índice — chamado apenas para linhas visíveis. |
| `estimateSize` | `number` | não | Altura estimada de cada linha em px (default: 44). |
| `overscan` | `number` | não | Linhas extra montadas fora da viewport para scroll suave (default: 8). |
| `height` | `number \| string` | não | Altura da janela de scroll (default: 100% do contêiner pai). |
| `className` | `string` | não | Classe utilitária extra do contêiner. |

### SarakDataGridImpl

_Props não expostas por interface nomeada — consulte o arquivo do componente._

### SarakDataTable

Props (`SarakDataTableProps` — `src/components/atomic/DataDisplay/SarakDataTable/SarakDataTableImpl.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `columns` | `Array<SarakColumn<T>>` | sim | Definição declarativa das colunas (ordem inicial = ordem do array). |
| `rows` | `T[]` | sim | Linhas de dados; a fonte real (fetch) vive fora — aqui só virtualizamos. |
| `rowHeight` | `number` | não |  |
| `headerHeight` | `number` | não |  |
| `height` | `number \| string` | não |  |
| `overscan` | `number` | não |  |
| `getRowKey` | `(row: T, index: number) => React.Key` | não | Chave estável da linha para seleção; por padrão, usa row.id ou o índice original. |
| `sort` | `SarakTableSort \| null` | não | Omitido, ordena localmente; passe null para controlar o estado sem ordenação. |
| `onSortChange` | `(sort: SarakTableSort \| null) => void` | não | Recebe o próximo estado de ordenação; com sort, o consumidor controla a ordem das linhas. |
| `selectable` | `boolean` | não | Habilita a seleção de linhas e a caixa das linhas visíveis. |
| `selectedKeys` | `React.Key[]` | não | Chaves selecionadas controladas; omitido, a tabela gerencia a seleção. |
| `onSelectionChange` | `(selectedKeys: React.Key[]) => void` | não | Recebe as chaves selecionadas atualizadas. |
| `onColumnResize` | `(columnId: string, width: number) => void` | não |  |
| `onColumnReorder` | `(fromId: string, toId: string) => void` | não |  |
| `responsive` | `boolean` | não | L2 (Spec 40.2): no smartphone colapsa para cards empilhados. Default `true`. |
| `className` | `string` | não |  |

### SarakDataTableImpl

_Props não expostas por interface nomeada — consulte o arquivo do componente._

### SarakDatePicker

Props (`SarakDatePickerProps` — `src/components/atomic/Inputs/SarakDatePicker.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `label` | `string` | não |  |
| `mode` | `'single' \| 'range'` | não |  |
| `value` | `SarakDatePickerValue` | não |  |
| `displayFormat` | `string` | não | Formato de exibição (i18n via JSON), ex.: `dd/MM/yyyy`. |
| `locale` | `SarakDateLocale` | não | Locale do `date-fns` para nomes de mês/dia (i18n). |
| `weekStartsOn` | `SarakWeekStart` | não |  |
| `placeholder` | `string` | não |  |
| `disabled` | `boolean` | não |  |
| `error` | `string` | não |  |
| `className` | `string` | não |  |
| `style` | `React.CSSProperties` | não |  |
| `onChange` | `(value: SarakDatePickerValue) => void` | não | Emite a nova data/intervalo em ISO (Spec 32: `onChange(value)`). |

### SarakDivider

Props (`SarakDividerProps` — `src/components/atomic/Layouts/SarakDivider.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `orientation` | `SarakDividerOrientation` | não | Direção do traço. Omitida, usa `horizontal`; no modo vertical, o contêiner acompanha a altura disponível do pai. |
| `label` | `string` | não | Texto exibido entre os traços e usado como nome acessível. Omitido, não há texto e o separador é decorativo por padrão. |
| `decorative` | `boolean` | não | Oculta o componente da árvore acessível. Omitida, é decorativo quando `label` não existe e semântico quando existe; use `false` sem rótulo apenas se também fornecer `aria-label`. |

Estende: `Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>`

### SarakDrawer

Props (`SarakDrawerProps` — `src/components/atomic/Modals/SarakDrawer.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `isOpen` | `boolean` | sim | Controla a abertura do painel. `true` mostra o diálogo; `false` mantém a estrutura durante a saída animada e depois a desmonta. Obrigatória, sem estado padrão. |
| `onClose` | `() => void` | sim | Callback chamado ao clicar no scrim ou pressionar `Escape`. É obrigatório; sem ele, a integração não compila nem pode solicitar o fechamento. |
| `direction` | `'left' \| 'right' \| 'top' \| 'bottom'` | não | Borda pela qual o painel entra; o padrão é `right`. `left`/`right` usam `size` como largura, enquanto `top`/`bottom` usam como altura. |
| `children` | `React.ReactNode` | sim | Conteúdo renderizado dentro do diálogo. Obrigatório; não há conteúdo padrão. |
| `size` | `string \| number` | não | Largura para direções laterais ou altura para direções verticais; aceita número (pixels) ou valor CSS com unidade. O padrão é `320`, limitado à área da tela. |
| `className` | `string` | não | Classes adicionais aplicadas ao elemento do diálogo, que já mantém rolagem vertical. Sem a prop, usa apenas as classes internas. |

### SarakEmptyState

Props (`SarakEmptyStateProps` — `src/components/atomic/Feedback/SarakEmptyState.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `type` | `'minimal' \| 'abstract' \| 'geometric'` | não | Escolhe a composição visual (`minimal`, `abstract` ou `geometric`); sem a prop, usa `abstract`. |

### SarakExpandableCard

Props (`SarakExpandableCardProps` — `src/components/atomic/Cards/SarakExpandableCard.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `title` | `string` | sim | Título obrigatório do cabeçalho nas visualizações compacta e expandida; sem valor, o título fica vazio. |
| `iconContent` | `React.ReactNode` | não | Elemento ao lado do título; omitido, o cabeçalho não reserva um ícone. |
| `helpButton` | `React.ReactNode` | não | Ação ou conteúdo auxiliar no cabeçalho; omitido, essa área não é renderizada. |
| `children` | `React.ReactNode` | sim | Conteúdo obrigatório das visualizações compacta e expandida; se omitido ou vazio, deixa o corpo sem conteúdo. |
| `className` | `string` | não | Acrescenta classes à raiz do cartão; omitida, nenhuma classe adicional é aplicada. |
| `contentClassName` | `string` | não | Acrescenta classes à área do conteúdo; omitida, a área usa apenas as classes internas do cartão. |
| `baseHeight` | `number` | não | Altura mínima compacta em pixels, ajustada pelo fator tipográfico do tema; sem a prop, usa 300 px. |

### SarakExpandableMatrix

Props (`SarakExpandableMatrixProps` — `src/components/atomic/Templates/SarakExpandableMatrix.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `data` | `TData[]` | sim | Itens principais (ex: Roles/Papéis) |
| `subItems` | `SarakMatrixTreeNode[]` | sim | Todos os sub-itens possíveis (ex: Todas as Permissões) |
| `activeMapping` | `(parentId: string, subItemId: string) => boolean` | sim | Função para checar se um sub-item está ativo em um item pai |
| `onToggle` | `(parentId: string, subItemId: string) => void` | sim | Callback disparado ao clicar no toggle |
| `renderItemHeader` | `(item: TData) => React.ReactNode` | não | Renderizador customizado para o cabeçalho de cada item pai |
| `manifest` | `SarakMatrixManifest` | não | Manifesto opcional de mapeamento recursivo para layout IAM/RBAC avançado |

### SarakFieldError

Props (`SarakFieldErrorProps` — `src/components/atomic/Feedback/SarakFieldError.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `message` | `string` | não | Mensagem do erro. Omitida, vazia ou composta só por espaços, não renderiza elemento nem reserva espaço; espaços nas bordas não são removidos do texto exibido. |
| `fieldId` | `string` | sim | `id` do controle descrito; a mensagem recebe o id `${fieldId}-error`. É obrigatório em TypeScript; se omitido ao contornar a tipagem, a mensagem continua visível e anunciada, mas não pode ser associada ao campo. No controle, use esse id da mensagem em `aria-describedby`. |

### SarakFilterSelect

Props (`SarakFilterSelectProps` — `src/components/atomic/Templates/SarakFilterSelect.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `col` | `string` | sim | Identifica a coluna cujo valor será lido de `filters` e enviado ao callback; obrigatória. |
| `placeholder` | `string` | não | Não altera o texto do seletor nesta implementação; omitida ou preenchida, a opção inicial continua fixa como `(All)`. |
| `filters` | `Record<string, string>` | sim | Estado atual dos filtros; a opção selecionada vem de `filters[col]` e fica vazia quando a chave não existe. |
| `onChange` | `(col: string, value: string) => void` | sim | Recebe a coluna e o novo valor a cada seleção; obrigatória para propagar mudanças ao consumidor. |
| `options` | `string[]` | sim | Valores disponíveis além da opção fixa `(All)`; obrigatória, mesmo quando a lista estiver vazia. |

### SarakFlex

Props (`SarakFlexProps` — `src/components/atomic/Layouts/SarakFlex.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `children` | `React.ReactNode` | sim |  |
| `direction` | `SarakFlexDirection \| SarakResponsiveValue<SarakFlexDirection>` | não | Direção do eixo. Aceita `SarakResponsiveValue` para variar por dispositivo (opcional). |
| `justify` | `'flex-start' \| 'flex-end' \| 'center' \| 'space-between' \| 'space-around' \| 'space-evenly' \| string` | não |  |
| `align` | `'stretch' \| 'flex-start' \| 'flex-end' \| 'center' \| 'baseline' \| string` | não |  |
| `gap` | `string` | não |  |
| `wrap` | `boolean` | não | Quebra em múltiplas linhas quando não cabe (mobile-first). Default `true`: uma linha de itens nunca estoura a página no celular — reflui para baixo. Passe `false` para forçar linha única (nowrap) quando o layout exigir. |
| `as` | `React.ElementType` | não |  |

Estende: `Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>`

### SarakFlowEngine

Props (`SarakFlowEngineProps` — `src/components/engines/flows/SarakFlowEngine.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `nodes` | `NonNullable<ReactFlowProps['nodes']>` | sim | Nós fornecidos ao React Flow; obrigatório, sem lista padrão. Use `[]` para iniciar sem nós. |
| `edges` | `NonNullable<ReactFlowProps['edges']>` | sim | Conexões existentes fornecidas ao React Flow; obrigatório, sem lista padrão. Use `[]` quando não houver conexões. |
| `onConnect` | `ReactFlowProps['onConnect']` | não | Recebe novas conexões criadas na tela; omitida, os nós e as conexões existentes continuam visíveis, mas não há callback do consumidor para persistir novas ligações. |

### SarakForm

Props (`SarakFormProps` — `src/components/atomic/Templates/SarakForm.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `endpoint` | `string` | sim | URL usada para buscar os dados em `edit` e, por padrão, salvar em ambos os modos. Obrigatória; `actions[0]` pode substituir o destino do salvamento. |
| `label` | `string` | não | Título exibido no cabeçalho; sem a prop, o cabeçalho fica sem texto. |
| `mapping` | `Record<string, string>` | não | Define as chaves e os rótulos dos campos. Sem ela, as chaves de `formData` viram campos e `_` é trocado por espaço; em `create`, as chaves mapeadas ausentes começam como texto vazio. |
| `mode` | `'create' \| 'edit'` | não | Escolhe a carga inicial: `edit` busca `endpoint` e é o padrão; `create` não busca, usa `initialData` e salva por padrão com `POST`. |
| `initialData` | `TData` | não | Dados iniciais; por padrão, um objeto vazio. Em `edit`, a resposta da busca os substitui; em `create`, são preservados. A prop é lida na montagem, então mudanças posteriores não reinicializam o formulário. |
| `actions` | `Array<{ label: string; endpoint: string; method: 'POST' \| 'PATCH' \| 'DELETE'; }>` | não | Configura o destino e o método do botão Salvar; somente `actions[0]` é usado. Sem primeira entrada, usa `endpoint` com `POST` em `create` ou `PATCH` em `edit`. `label` e as entradas seguintes não são exibidos nem usados; em `DELETE`, `formData` vai como configuração, não como corpo. |
| `onSuccess` | `() => void` | não | Chamado depois de um salvamento bem-sucedido. Sem a prop, o formulário salva e exibe o status, mas não notifica o chamador. |
| `role` | `'primary' \| 'secondary' \| 'neutral' \| 'accent'` | não | Opção sem efeito nesta implementação; omiti-la ou defini-la não altera a apresentação. |
| `density` | `'compact' \| 'standard' \| 'spacious'` | não | Opção sem efeito nesta implementação; omiti-la ou defini-la não altera a densidade. |
| `importance` | `'hero' \| 'base' \| 'subtle'` | não | Opção sem efeito nesta implementação; omiti-la ou defini-la não altera a ênfase visual. |

### SarakFormGroup

Props (`SarakFormGroupProps` — `src/components/atomic/Layouts/SarakFormGroup.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `children` | `React.ReactNode` | sim |  |
| `gap` | `string` | não | Espaçamento entre label e campo — token semântico (`spacing-md`) ou CSS válido. |

Estende: `React.HTMLAttributes<HTMLDivElement>`

### SarakGrid

Props (`SarakGridProps` — `src/components/atomic/Layouts/SarakGrid.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `children` | `React.ReactNode` | sim |  |
| `templateColumns` | `string \| SarakResponsiveValue<string>` | não | Colunas do grid. Aceita: - `string` fixo (ex.: `"1fr 1fr 1fr"`): mobile-first por padrão — **colapsa para 1 coluna no celular** (nunca estoura a página), reflui no valor cheio em tablet/desktop. - `SarakResponsiveValue<string>` (`{ mob, tab, desk }`): o consumidor controla por dispositivo. Sem `templateColumns`, usa a estratégia de grid do Design Engine (também 1 coluna no celular). |
| `templateAreas` | `string` | não |  |
| `gap` | `string` | não |  |
| `as` | `React.ElementType` | não |  |

Estende: `Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>`

### SarakHelpButton

_Props não expostas por interface nomeada — consulte o arquivo do componente._

### SarakHidden

Props (`SarakHiddenProps` — `src/components/Layout/SarakHidden.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `children` | `ReactNode` | sim |  |
| `on` | `SarakDeviceType \| SarakDeviceType[]` | sim | Esconder quando o dispositivo ativo estiver nesta lista |

### SarakIcon

Props (`SarakIconProps` — `src/components/atomic/Icon/SarakIcon.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `name` | `SarakIconName \| string` | sim | Nome obrigatório do catálogo de ícones; se omitido ou desconhecido, gera um aviso e mostra o ícone de fallback. |
| `size` | `number \| string` | não | Define a dimensão SVG; sem a prop, usa 24 px. |
| `className` | `string` | não | Acrescenta classes ao SVG; omitida, nenhuma classe adicional é aplicada. |
| `color` | `string` | não | Define a cor do traço ou preenchimento; omitida, o ícone herda a cor corrente. |
| `style` | `React.CSSProperties` | não | Acrescenta estilos CSS inline ao SVG; omitida, só os estilos da família de ícone são usados. |
| `onClick` | `() => void` | não | Encaminha o clique ao SVG; omitida, não há callback, e a prop não dá semântica de botão nem suporte de teclado. |

### SarakIconButton

Props (`SarakIconButtonProps` — `src/components/atomic/Buttons/SarakIconButton.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `variant` | `'primary' \| 'secondary' \| 'ghost' \| 'danger'` | não | Define a aparência visual sem mudar o tipo HTML; sem a prop, usa `primary`. |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg'` | não | Define a largura e a altura quadradas do botão; sem a prop, usa `md` (40 × 40 px). |
| `isLoading` | `boolean` | não | Troca o ícone pelo indicador de carregamento e desabilita o botão enquanto ativa; omitida, mantém o botão habilitado. |
| `icon` | `React.ReactNode` | sim | Elemento exibido dentro do botão; é obrigatório, e sem ele o botão não mostra um glifo; `isLoading` o substitui pelo indicador. |

Estende: `ButtonHTMLAttributes<HTMLButtonElement>`

### SarakImageCard

Props (`SarakImageCardProps` — `src/components/atomic/Templates/SarakImageCard.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `src` | `string` | sim | Endereço da imagem de fundo; é obrigatório e, sem uma fonte válida, a camada de imagem fica vazia. |
| `alt` | `string` | não | Texto alternativo da imagem; sem a prop, usa o texto genérico `Image Card`, então informe uma descrição para imagens informativas. |
| `title` | `string` | não | Título sobreposto à imagem; omitido, o título não aparece. |
| `subtitle` | `string` | não | Texto secundário sob o título; omitido, o subtítulo não aparece. |
| `children` | `React.ReactNode` | não | Conteúdo adicional sob os textos; omitido, não há conteúdo extra. |
| `className` | `string` | não | Acrescenta classes à raiz do cartão; omitida, nenhuma classe adicional é aplicada. |
| `onClick` | `() => void` | não | Executa uma ação quando o cartão recebe clique; omitida, não há ação, e a raiz continua sem semântica de botão nem suporte de teclado. |

### SarakInput

Props (`SarakInputProps` — `src/components/atomic/Inputs/SarakInput.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `label` | `string` | não | Rótulo visual ligado ao campo pelo `id` (gerado quando não é informado). Sem ele, não há rótulo visível; forneça outro nome acessível se necessário. |
| `icon` | `React.ReactNode` | não | Ícone do campo; sua posição vem do layout do tema. Quando definido, prevalece sobre `leftIcon` e `rightIcon`; sem os três, não há ícone. |
| `leftIcon` | `React.ReactNode` | não | Ícone de compatibilidade usado somente quando `icon` não é fornecido. Sem `icon` e este valor, `rightIcon` pode ser usado; o nome da prop não fixa o lado visual. |
| `rightIcon` | `React.ReactNode` | não | Ícone de compatibilidade usado quando `icon` e `leftIcon` não são fornecidos. A posição vem do layout do tema; sem qualquer ícone, o campo fica sem decoração. |
| `error` | `string` | não | Mensagem abaixo do campo, ligada por `aria-describedby`, que também marca `aria-invalid`. Sem a prop, não há mensagem nem estado inválido. |
| `fullWidth` | `boolean` | não | Faz o grupo do campo ocupar toda a largura disponível. Omitida ou `false`, a largura fica a cargo do layout pai. |

Estende: `InputHTMLAttributes<HTMLInputElement>`

### SarakKanban

Props (`SarakKanbanProps` — `src/components/atomic/DataDisplay/SarakKanban/SarakKanbanImpl.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `columns` | `Array<SarakKanbanColumn<C>>` | sim | Colunas e seus cards (a ordem do array é a ordem visual). |
| `onCardMove` | `(move: SarakCardMove) => void` | não | Disparado ao soltar um card numa coluna (origem → destino). |
| `renderCard` | `(card: C, columnId: string) => React.ReactNode` | não | Render customizado do card (default: título + descrição). |
| `className` | `string` | não |  |

### SarakLightbox

Props (`SarakLightboxProps` — `src/components/atomic/Media/SarakLightbox.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `images` | `SarakLightboxImage[]` | sim | Mídias da galeria, na ordem de exibição. |
| `isOpen` | `boolean` | sim | Controla a visibilidade do overlay. |
| `initialIndex` | `number` | não | Índice inicial ao abrir (default: 0). |
| `onClose` | `() => void` | sim | Fecha o overlay (ESC, clique no ✕ ou no fundo). |
| `onIndexChange` | `(index: number) => void` | não | Notifica a troca de mídia (avançar/retroceder). |

### SarakLink

Props (`SarakLinkProps` — `src/components/atomic/Navigation/SarakLink.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `href` | `string` | sim | Destino do link. Esquemas perigosos (`javascript:`, `data:`, ...) são bloqueados. |
| `external` | `boolean` | não | Abre em nova aba com `rel="noreferrer noopener"` + indicação visual/a11y. |
| `children` | `React.ReactNode` | sim |  |

Estende: `Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'target' | 'rel'>`

### SarakManagementGrid

Props (`SarakManagementGridProps` — `src/components/atomic/Templates/SarakManagementGrid.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `endpoint` | `string` | sim | Rota consultada para listar e usada nas ações de ativar, remover e criar; obrigatória e compatível com esses métodos. |
| `groupBy` | `string` | sim | Caminho do campo que separa os grupos; aceita pontos para campos aninhados e envia valores ausentes ao grupo `outros`. |
| `ghostGroups` | `string[]` | não | Cria cartões vazios para grupos sem registros; omitida, só aparecem grupos encontrados nos dados. |
| `mapping` | `{ id: string; title: string; status: string; isActive: string; description?: string; error?: string; }` | sim | Traduz os caminhos do registro para id, título, estado e campos opcionais; obrigatória para exibir e operar cada item. |
| `headerActions` | `{ label: string; action: string; }[]` | não | Ações no cabeçalho; omitida, o cabeçalho não aparece. Só ações cujo texto contenha `modal` ou `add` abrem o formulário. |
| `groupActions` | `{ label: string; icon?: 'plus' \| 'settings'; action: string; }[]` | não | Ações em cada grupo; omitida, não há botões de grupo. Ações sem `modal` ou `add` no texto não abrem o formulário. |
| `formMapping` | `Record<string, string>` | não | Mapeia os campos do formulário de criação; omitida, o formulário recebe um mapeamento vazio. |
| `role` | `'primary' \| 'secondary' \| 'neutral' \| 'accent'` | não | Sem efeito nesta implementação; omitir ou alterar o valor não muda a renderização atual. |
| `density` | `'compact' \| 'standard' \| 'spacious'` | não | Sem efeito nesta implementação; omitir ou alterar o valor não muda a renderização atual. |
| `importance` | `'hero' \| 'base' \| 'subtle'` | não | Sem efeito nesta implementação; omitir ou alterar o valor não muda a renderização atual. |

### SarakMarkdownRenderer

Props (`SarakMarkdownRendererProps` — `src/components/atomic/Media/SarakMarkdownRenderer/SarakMarkdownRendererImpl.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `content` | `string` | sim | String de Markdown cru a renderizar. |
| `className` | `string` | não |  |

### SarakMaskedInput

Props (`SarakMaskedInputProps` — `src/components/atomic/Inputs/SarakMaskedInput.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `mask` | `string` | sim | Padrão com `0` nas posições numéricas ou preset `cpf`, `cnpj` e `phone`. É obrigatório; `phone` alterna entre telefone fixo e celular pelo total de dígitos. Um padrão sem `0` deixa o campo somente com os dígitos, sem pontuação. |
| `value` | `string` | não | Valor limpo controlado. Omitido, usa `defaultValue`; ao fornecê-lo, o pai deve atualizá-lo após `onChange`. |
| `defaultValue` | `string` | não | Valor inicial sem pontuação. Omitido, o campo começa vazio; ignorado após a montagem ou quando `value` é informado. |
| `label` | `string` | não | Rótulo visível encaminhado ao `SarakInput`. Omitido, não há rótulo; forneça um nome acessível. |
| `onChange` | `(cleanValue: string) => void` | não | Emite somente os dígitos aceitos pelo padrão. Omitido, mudanças não são notificadas por callback. |
| `inputMode` | `React.HTMLAttributes<HTMLInputElement>['inputMode']` | não | Teclado sugerido ao dispositivo. Omitido, solicita teclado numérico; isso não valida a entrada. |

Estende: `Omit<SarakInputProps, 'defaultValue' | 'label' | 'onChange' | 'type' | 'value'>`

### SarakMenuItem

Props (`SarakMenuItemProps` — `src/components/atomic/Navigation/SarakMenuItem.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `icon` | `React.ReactNode` | não | Ícone à esquerda do rótulo — resolvido pelo chamador (`SarakIcon`/`IconRenderer`). |
| `label` | `React.ReactNode` | sim | Rótulo do item; trunca em vez de transbordar (orientação vertical). |
| `active` | `boolean` | não | Item corresponde à rota/seção corrente. |
| `collapsed` | `boolean` | não | Colapsado — mostra só o ícone, sem o rótulo (sidebar recolhida/topbar estreita). |
| `orientation` | `SarakMenuItemOrientation` | não | `vertical` = linha de lista (sidebar/drawer); `horizontal` = aba (topbar). |
| `title` | `string` | não | Tooltip nativo; cai para o texto do rótulo quando `label` é string. |
| `className` | `string` | não |  |

Estende: `Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'title'>`

### SarakModal

Props (`SarakModalProps` — `src/components/atomic/Modals/SarakModal.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `isOpen` | `boolean` | sim |  |
| `onClose` | `() => void` | sim |  |
| `title` | `React.ReactNode` | não |  |
| `children` | `React.ReactNode` | não |  |
| `footer` | `React.ReactNode` | não |  |
| `steps` | `React.ReactNode[]` | não | Sub-wizard multi-step (Spec 13, Regra 2): cada passo é renderizado isolado dentro do overlay, com navegação "Voltar/Avançar" contida no rodapé. Tem precedência sobre `children`. No último passo, "Avançar" é substituído por `onComplete`. |
| `onComplete` | `() => void` | não | Chamado ao avançar além do último passo (conclusão do wizard). |
| `disableOverlayClick` | `boolean` | não | Se true, o clique no overlay (fundo) não fecha o modal |
| `hideCloseButton` | `boolean` | não | Se true, o botão de fechar não é renderizado |
| `className` | `string` | não | Classe CSS customizada para o contêiner do modal |

### SarakMultiSelect

Props (`SarakMultiSelectProps` — `src/components/atomic/Inputs/SarakMultiSelect.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `label` | `string` | não |  |
| `options` | `SarakMultiSelectOption[]` | sim |  |
| `value` | `string[]` | não | Controlado: lista de values selecionados. |
| `defaultValue` | `string[]` | não | Não-controlado: seleção inicial. |
| `placeholder` | `string` | não |  |
| `disabled` | `boolean` | não |  |
| `error` | `string` | não |  |
| `className` | `string` | não |  |
| `style` | `React.CSSProperties` | não |  |
| `onChange` | `(value: string[]) => void` | não | Emite a nova lista de values (Spec 32: `onChange(value)`). |

### SarakOverlayProvider

_Props não expostas por interface nomeada — consulte o arquivo do componente._

### SarakPDFViewer

Props (`SarakPDFViewerProps` — `src/components/atomic/Media/SarakPDFViewer/SarakPDFViewerImpl.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `src` | `SarakPdfSource` | sim | Origem do documento: URL, bytes ou ArrayBuffer. |
| `initialPage` | `number` | não | Página inicial (1-based, default: 1). |
| `zoom` | `number` | não | Escala inicial de zoom (default: 1.2). |
| `workerSrc` | `string` | não | URL do worker do pdf.js; default resolvido do pacote via `import.meta.url`. |
| `onDownload` | `(src: SarakPdfSource) => void` | não | Disparado ao clicar em Download (recebe a `src` quando string). |
| `className` | `string` | não |  |

### SarakPageTransition

Props (`SarakPageTransitionProps` — `src/components/atomic/Templates/SarakPageTransition.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `children` | `React.ReactNode` | sim |  |
| `locationKey` | `string` | sim | Usado como key pela AnimatePresence para saber quando a rota mudou |

### SarakPagination

Props (`SarakPaginationProps` — `src/components/atomic/Navigation/SarakPagination.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `current` | `number` | sim | Página atual (1-based). |
| `total` | `number` | sim | Total de páginas. |
| `maxVisible` | `number` | não | Máximo de botões numéricos antes de compactar com reticências (default: 7). |
| `onChange` | `(page: number) => void` | sim | Disparado ao escolher uma página válida (diferente da atual). |
| `className` | `string` | não |  |

### SarakRadio

Props (`SarakRadioProps` — `src/components/atomic/Inputs/SarakRadio.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `label` | `React.ReactNode` | não |  |
| `description` | `React.ReactNode` | não |  |

Estende: `Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>`

### SarakRangeSlider

Props (`SarakRangeSliderProps` — `src/components/atomic/Inputs/SarakRangeSlider.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `label` | `string` | não |  |
| `min` | `number` | não |  |
| `max` | `number` | não |  |
| `step` | `number` | não |  |
| `value` | `SarakRangeValue` | não | Controlado: par [início, fim]. |
| `defaultValue` | `SarakRangeValue` | não | Não-controlado: valor inicial. |
| `disabled` | `boolean` | não |  |
| `error` | `string` | não |  |
| `hideTooltips` | `boolean` | não | Esconde as tooltips de valor sobre os thumbs. |
| `onChange` | `(value: SarakRangeValue) => void` | não | Recebe o novo par já clampado/ordenado (Spec 32: `onChange(value)`). |

Estende: `Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'>`

### SarakRichText

Props (`SarakRichTextProps` — `src/components/atomic/Inputs/SarakRichText.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `value` | `string` | não | Conteúdo HTML controlado pelo consumidor (par com `onChange`). |
| `defaultValue` | `string` | não | Conteúdo inicial não-controlado. |
| `onChange` | `(html: string) => void` | não | Emite o HTML JÁ sanitizado a cada mudança. |
| `placeholder` | `string` | não |  |
| `disabled` | `boolean` | não |  |
| `error` | `string` | não |  |
| `className` | `string` | não |  |

### SarakScrim

Props (`SarakScrimProps` — `src/components/atomic/Layouts/SarakScrim.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `onClose` | `() => void` | sim | Fecha a camada — chamado ao clique em qualquer ponto do scrim. |
| `ariaLabel` | `string` | sim | Rótulo acessível do scrim (ex.: "Fechar menu de navegação"). |
| `className` | `string` | não |  |
| `testId` | `string` | não | `data-testid`, para quem precisa localizar o scrim em teste sem depender do `ariaLabel`. Não é passthrough genérico de props — evita colidir com os tipos de evento do `motion.button` (que redefine `onDrag` e afins com assinatura própria). |
| `style` | `React.CSSProperties` | não | Sobrepõe o fundo padrão (`--sarak-modal-overlay`, do token `modalOverlayColor`) — para consumidores que já liam a cor do overlay de um token de design próprio antes de migrar para este átomo. |
| `animate` | `boolean` | não | Ativa a transição de opacidade na entrada/saída. Default `false` — o comportamento de sempre, sem animação (plan-19/20/22 pararam exatamente por causa disto: dar animação sem ela ser opcional removeria o scrim estático que já existe). |
| `visible` | `boolean` | não | Só tem efeito com `animate`. Alvo da opacidade (1 = visível, 0 = invisível) SEM desmontar — para consumidores que gerenciam o próprio atraso de desmontagem (ex.: `SarakDrawer`, que mantém o overlay montado até a transição terminar). Quando omitido, assume visível — o caso de quem desmonta via `AnimatePresence` por fora (ex.: `Controls.tsx`), onde o `exit` já cobre o fade de saída. |
| `durationMs` | `number` | não | Só tem efeito com `animate`. Duração da transição em ms. Default 300 — o mesmo valor que o `motion.div` ad hoc de `Controls.tsx` já usava (default do framer-motion para uma transição de opacidade sem `transition` explícito). |

### SarakSearch

Props (`SarakSearchProps` — `src/components/atomic/Inputs/SarakSearch.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `isOpen` | `boolean` | sim |  |
| `onClose` | `() => void` | sim |  |
| `items` | `SarakSearchItem[]` | sim | Itens da busca, fornecidos pela navegação do aplicativo. |
| `onSelect` | `(id: string) => void` | não | Seleciona um item, por clique ou teclado (`Enter`/`Espaço`). Sem esta prop, os resultados não são acionáveis — o comportamento de sempre. |

### SarakSearchCard

Props (`SarakSearchCardProps` — `src/components/atomic/Cards/SarakSearchCard.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `item` | `TItem` | sim | Registro genérico exigido pela assinatura; a implementação atual não o consulta, então ele não altera o conteúdo visível. |
| `mapping` | `Record<string, string>` | não | Caminhos de campos previstos para o registro; a implementação atual não lê o mapa, então fornecê-lo não altera o cartão. |
| `className` | `string` | não | Acrescenta classes à raiz do cartão; omitida, nenhuma classe adicional é aplicada. |
| `onSearchChange` | `(text: string) => void` | não | Recebe o texto a cada edição da busca; sem callback, a busca ainda muda localmente, mas nenhum valor é enviado ao consumidor. |
| `onToggleCapability` | `(cap: string, active: boolean) => void` | não | Recebe a capacidade (`vision`, `web` ou `chat`) e seu novo estado; sem callback, os alternadores mudam apenas o estado local. |
| `design` | `SarakThemePayload` | não | Substitui o tema do provider para este cartão; omitida, usa o tema global. |
| `label` | `string` | não | Texto do selo de rascunho; sem a prop, usa `Card de Interação`, e o selo só aparece durante a composição de rascunho. |

### SarakSelect

Props (`SarakSelectProps` — `src/components/atomic/Inputs/SarakSelect.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `error` | `string` | não | Mensagem exibida abaixo da lista. Sem a prop, não há mensagem; o texto não é associado automaticamente ao `<select>` por `aria-describedby`. |
| `fullWidth` | `boolean` | não | Faz o contêiner e a lista ocuparem toda a largura disponível. Omitida ou `false`, a largura depende do layout pai. |

Estende: `SelectHTMLAttributes<HTMLSelectElement>`

### SarakShellLanguageSelector

Props (`SarakShellLanguageSelectorProps` — `src/components/atomic/Navigation/SarakShellLanguageSelector.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `variant` | `'horizontal' \| 'vertical'` | não | Posiciona o seletor na barra ou na lateral; omitida, usa `horizontal`. Com zero ou um idioma habilitado, nada é renderizado. |

### SarakShellNav

Props (`SarakShellNavProps` — `src/components/atomic/Navigation/SarakShellNav.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `items` | `SarakShellNavItem[]` | sim | Módulos/rotas do sistema, na ordem de exibição. |
| `activeRoute` | `string` | não | Rota ativa (a do roteador do consumidor) — comparada com `items[].route`. |
| `brand` | `{ name?: string; logoUrl?: string }` | não | Identidade exibida no topo do menu. |
| `onNavigate` | `(route: string) => void` | não | Callback de navegação — o host decide como navegar (router, pushState, assign). |
| `onChange` | `(route: string) => void` | não | Alias de `onNavigate`; ambos são chamados, na ordem. Mantido por compatibilidade. |
| `orientation` | `'vertical' \| 'horizontal' \| 'auto'` | não | Orientação do menu (Spec 18). `'auto'` (default) segue o Design Engine: `design.navigationStyle === 'topbar'` → horizontal; qualquer outro → vertical. `'dock'`/`'glass'` do shell legado ficam fora desta spec (tratados como vertical). |
| `collapsed` | `boolean` | não | Colapsado (`isNavHidden`): só ícone, rótulo e categoria somem. |
| `className` | `string` | não |  |

### SarakShellSearchWidget

Props (`SarakShellSearchWidgetProps` — `src/components/atomic/Navigation/SarakShellSearchWidget.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `variant` | `'bar' \| 'icon'` | não | Escolhe a barra de busca ou o gatilho de menu; omitida, usa `bar`, que fica oculto abaixo do breakpoint `md`. |
| `items` | `SarakSearchItem[]` | não | Resultados fornecidos pelo aplicativo. |
| `onClick` | `() => void` | sim | Callback do gatilho `icon`; obrigatório. A variante padrão `bar` não o chama ao selecionar resultados. |

### SarakShellThemeToggle

Props (`SarakShellThemeToggleProps` — `src/components/atomic/Navigation/SarakShellThemeToggle.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `variant` | `'horizontal' \| 'vertical' \| 'mini'` | não | Define o formato horizontal, vertical ou compacto; omitida, usa `horizontal`. O clique grava a preferência do usuário. |

### SarakShellUserWidget

Props (`SarakShellUserWidgetProps` — `src/components/atomic/Navigation/SarakShellUserWidget.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `user` | `SarakShellUser` | não | Fornece nome, e-mail e nível usados na identidade; omitido, exibe o rótulo genérico de usuário. |
| `logout` | `() => void` | não | Executa o encerramento de sessão e habilita o botão de sair; omitida, esse botão não é renderizado. |
| `variant` | `'horizontal' \| 'vertical' \| 'mini'` | não | Ajusta o arranjo à barra, à lateral ou ao modo compacto; omitida, usa `vertical`. Em `mini`, o nome e o nível ficam ocultos. |

### SarakSkeleton

Props (`SarakSkeletonProps` — `src/components/atomic/Feedback/SarakSkeleton.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `shape` | `SarakSkeletonShape` | não | Forma do placeholder (default: `text`). |
| `rows` | `number` | não | Número de linhas-fantasma quando `shape="text"` (default: 3). |
| `rowHeight` | `string` | não | Altura de cada linha/bloco (default: `1rem`). |
| `size` | `string` | não | Diâmetro quando `shape="circle"` (default: `2.5rem`). |
| `width` | `string` | não | Largura quando `shape="rect"`/`circle` (default: `100%` / `size`). |

### SarakSlider

Props (`SarakSliderProps` — `src/components/atomic/Inputs/SarakSlider.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `label` | `string` | não | Texto mostrado acima do controle e usado como nome acessível quando `aria-label` não é informado. Sem `label`, forneça `aria-label`. |
| `valueLabel` | `string \| number` | não | Texto apresentado ao lado do rótulo e exposto como `aria-valuetext`; não altera o valor numérico. Sem a prop, o navegador anuncia o valor nativo. |

Estende: `Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>`

### SarakSocialButton

Props (`SarakSocialButtonProps` — `src/components/atomic/Buttons/SarakSocialButton.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `provider` | `'google' \| 'github'` | sim | Escolhe o ícone e o rótulo padrão do provedor; obrigatória. |
| `variant` | `'glass' \| 'sovereign'` | sim | Seleciona o acabamento visual; obrigatória. Um tema `sovereign` também prevalece quando esta prop é `glass`. |
| `onClick` | `(provider: 'google' \| 'github') => void` | não | Recebe o provedor clicado; omitida, o botão continua visível, mas não executa ação. |
| `label` | `string` | não | Substitui o rótulo e o título acessível; omitida, usa o texto padrão do provedor. |
| `hideLabel` | `boolean` | não | Esconde o texto e reduz o botão a um ícone; omitida, mantém o rótulo visível. O título continua disponível no botão. |
| `className` | `string` | não | Acrescenta classes ao botão com resolução de conflitos Tailwind; omitida, mantém apenas as classes internas. |

### SarakSparkline

Props (`SarakSparklineProps` — `src/components/atomic/DataDisplay/SarakSparkline.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `data` | `number[]` | sim | Série de valores. Vazia ou com 1 ponto degrada para um traço plano/único. |
| `variant` | `SarakSparklineVariant` | não | Forma do micro-gráfico (default: 'line'). |
| `height` | `number` | não | Altura em px do desenho (default: 40). A largura preenche o contêiner. |
| `strokeWidth` | `number` | não | Espessura do traço (line/area) em px (default: 2). |
| `fillOpacity` | `number` | não | Opacidade do preenchimento da área (default: 0.15). |
| `label` | `string` | não | Descrição acessível do gráfico (vira `<title>` + `aria-label`). |
| `className` | `string` | não |  |
| `style` | `React.CSSProperties` | não |  |

### SarakSpinner

Props (`SarakSpinnerProps` — `src/components/atomic/Feedback/SarakSpinner.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `size` | `'sm' \| 'md' \| 'lg'` | não | Define o diâmetro pequeno, médio ou grande; omitido, usa `md` e os tamanhos acompanham os tokens tipográficos do tema. |
| `label` | `string` | não | Nome acessível do progresso indeterminado; omitido ou vazio, usa `Carregando` para manter o indicador identificado. |
| `className` | `string` | não | Acrescenta classes ao SVG; omitida, mantém o estilo interno. Classes de animação podem substituir a rotação em movimento permitido. |

### SarakSplitPane

Props (`SarakSplitPaneProps` — `src/components/atomic/Layouts/SarakSplitPane.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `leftPane` | `React.ReactNode` | sim | Conteúdo obrigatório do painel esquerdo; em celulares, aparece antes do painel direito. |
| `rightPane` | `React.ReactNode` | sim | Conteúdo obrigatório do painel direito; em celulares, aparece depois do painel esquerdo. |
| `minLeftWidth` | `number` | não | Limite inferior, em pixels, ao arrastar com mouse; sem a prop, usa 200 px, não se aplica no celular e não é ajustável por toque em tablet. |
| `maxLeftWidth` | `number` | não | Limite superior, em pixels, ao arrastar com mouse; sem a prop, usa 800 px, não se aplica no celular e não é ajustável por toque em tablet. |
| `defaultLeftWidth` | `number` | não | Largura inicial do painel esquerdo, em pixels; sem a prop, usa 300 px, sem ajustar esse valor aos limites até o primeiro arraste. |
| `className` | `string` | não | Acrescenta classes ao contêiner; omitida, nenhuma classe adicional é aplicada. |

### SarakSpotlight

Props (`SarakSpotlightProps` — `src/components/atomic/Navigation/SarakSpotlight.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `items` | `SarakNavigationItem[]` | sim | Itens disponíveis para navegação instantânea. |
| `shortcut` | `string` | não | Atalho de ativação global (default: `mod+k` = Ctrl/Cmd+K). |
| `open` | `boolean` | não | Modo controlado: estado de abertura. |
| `onOpenChange` | `(open: boolean) => void` | não | Notifica mudanças de abertura (abrir via atalho / fechar via Esc). |
| `onSelect` | `(item: SarakNavigationItem) => void` | sim | Acionado ao confirmar um item (Enter ou clique). |
| `placeholder` | `string` | não | Placeholder do input central. |

### SarakStats

Props (`SarakStatsProps` — `src/components/atomic/Templates/SarakStats.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `endpoint` | `string` | não | Busca as métricas quando `data` não é fornecida; omitido junto com `data`, o componente fica no esqueleto de carregamento. |
| `data` | `TData` | não | Usa métricas já carregadas e evita a busca; quando presente, tem prioridade sobre `endpoint`. |
| `label` | `string` | não | Sem efeito nesta implementação; o título dos cartões vem de `mapping` ou das chaves dos dados. |
| `mapping` | `Record<string, string>` | não | Define as chaves e os rótulos exibidos; omitido, infere campos numéricos/textuais ou resume arrays em total, ativos e erros. |
| `role` | `'primary' \| 'secondary' \| 'neutral' \| 'accent'` | não | Sem efeito nesta implementação; omitir ou alterar o valor não muda a renderização atual. |
| `density` | `'compact' \| 'standard' \| 'spacious'` | não | Sem efeito nesta implementação; omitir ou alterar o valor não muda a renderização atual. |
| `importance` | `'hero' \| 'base' \| 'subtle'` | não | Sem efeito nesta implementação; omitir ou alterar o valor não muda a renderização atual. |

### SarakStepper

Props (`SarakStepperProps` — `src/components/atomic/Navigation/SarakStepper.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `steps` | `SarakStepConfig[]` | sim | Passos na ordem do fluxo. |
| `current` | `number` | sim | Índice (0-based) do passo atual. |
| `orientation` | `SarakStepperOrientation` | não | Disposição (default: horizontal). |
| `className` | `string` | não |  |

### SarakSwitch

Props (`SarakSwitchProps` — `src/components/atomic/Inputs/SarakSwitch.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `label` | `React.ReactNode` | não | Conteúdo visível ao lado do controle e clicável como parte do rótulo. Sem `label` e `description`, nenhum texto é mostrado; nesse caso, dê um nome acessível ao controle. |
| `description` | `React.ReactNode` | não | Texto auxiliar exibido junto ao rótulo e ligado ao controle por `aria-describedby`. Sem a prop, não há descrição adicional. |

Estende: `Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>`

### SarakTable

Props (`SarakTableProps` — `src/components/atomic/Templates/SarakTableProps.ts`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `endpoint` | `string` | não | Sem `data`, busca por este endpoint. Com `data`, é ignorado — nenhuma chamada de rede ocorre. |
| `data` | `TData[]` | não | Dado já em mãos (cache, SSR, outra chamada) — quando presente, renderiza direto, sem rede. |
| `label` | `string` | não |  |
| `mapping` | `Record<string, string>` | não |  |
| `getRowKey` | `(row: TData, index: number) => Key` | não | Chave estável da linha para seleção; por padrão, usa row.id ou o índice original. |
| `sort` | `SarakTableSort \| null` | não | Omitido, ordena localmente; passe null para controlar o estado sem ordenação. |
| `onSortChange` | `(sort: SarakTableSort \| null) => void` | não | Recebe o próximo estado de ordenação; com sort, o consumidor controla a ordem das linhas. |
| `selectable` | `boolean` | não | Habilita a seleção de linhas e a caixa das linhas visíveis. |
| `selectedKeys` | `Key[]` | não | Chaves selecionadas controladas; omitido, a tabela gerencia a seleção. |
| `onSelectionChange` | `(selectedKeys: Key[]) => void` | não | Recebe as chaves selecionadas atualizadas. |
| `role` | `'primary' \| 'secondary' \| 'neutral' \| 'accent'` | não |  |
| `density` | `'compact' \| 'standard' \| 'spacious'` | não |  |
| `importance` | `'hero' \| 'base' \| 'subtle'` | não |  |
| `responsive` | `boolean` | não | No smartphone colapsa para cards empilhados. Default `true` — mesma prop, mesmo default e mesmo efeito do irmão `SarakDataTable`, para que os dois componentes públicos de tabela não tenham APIs divergentes. |

### SarakTabs

Props (`SarakTabsProps` — `src/components/atomic/UX/SarakTabs.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `tabs` | `SarakTabItem[]` | sim |  |
| `activeTab` | `string` | sim |  |
| `onChange` | `(tabId: string) => void` | sim |  |
| `variant` | `'pills' \| 'underlined' \| 'enclosed'` | não | Estilo de exibição das abas |
| `fullWidth` | `boolean` | não | Preencher a largura toda? |
| `className` | `string` | não |  |
| `listClassName` | `string` | não |  |

### SarakTextarea

Props (`SarakTextareaProps` — `src/components/atomic/Inputs/SarakTextarea.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `error` | `string` | não | Mensagem exibida abaixo da área de texto. Sem a prop, não há mensagem; o texto não é associado automaticamente ao `<textarea>` por `aria-describedby`. |
| `fullWidth` | `boolean` | não | Faz o contêiner e a área de texto ocuparem toda a largura disponível. Omitida ou `false`, a largura depende do layout pai. |

Estende: `TextareaHTMLAttributes<HTMLTextAreaElement>`

### SarakTimePicker

Props (`SarakTimePickerProps` — `src/components/atomic/Inputs/SarakTimePicker.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `label` | `string` | não |  |
| `value` | `string` | não | Valor no formato 24h `HH:mm`. |
| `minuteStep` | `number` | não | Passo dos minutos (ex.: 5, 15). |
| `disabled` | `boolean` | não |  |
| `error` | `string` | não |  |
| `className` | `string` | não |  |
| `style` | `React.CSSProperties` | não |  |
| `onChange` | `(value: string) => void` | não | Emite o novo horário `HH:mm` (Spec 32: `onChange(value)`). |

### SarakTitleCard

Props (`SarakTitleCardProps` — `src/components/atomic/Cards/SarakTitleCard.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `item` | `TItem` | sim | Registro obrigatório usado para obter título, subtítulo, contexto, capacidades e ícone pelos caminhos de `mapping`. |
| `mapping` | `Record<string, string>` | não | Associa esses campos a caminhos do registro; aceita caminhos pontuados e, sem a prop, não há valores mapeados (o subtítulo usa `Modelo`). |
| `className` | `string` | não | Acrescenta classes à raiz do cartão; omitida, nenhuma classe adicional é aplicada. |
| `design` | `SarakThemePayload` | não | Substitui o tema do provider para este cartão; omitida, usa o tema global. |
| `label` | `string` | não | Texto do selo de rascunho; sem a prop, usa `Card de Título`, e o selo só aparece durante a composição de rascunho. |

### SarakToastProvider

_Props não expostas por interface nomeada — consulte o arquivo do componente._

### SarakTooltip

Props (`SarakTooltipProps` — `src/components/atomic/UX/SarakTooltip.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `children` | `React.ReactNode` | sim |  |
| `content` | `React.ReactNode` | sim |  |
| `position` | `SarakTooltipPosition` | não |  |
| `delay` | `number` | não |  |
| `className` | `string` | não |  |
| `disabled` | `boolean` | não | Se true, desativa o tooltip |

### SarakTreeView

Props (`SarakTreeViewProps` — `src/components/atomic/DataDisplay/SarakTreeView.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `data` | `SarakMatrixTreeNode[]` | sim | Floresta de nós; cada nó pode ter `children` (N níveis) e `loading`. |
| `manifest` | `SarakMatrixManifest` | não | Manifesto de layout por nível/tipo (default: variante limpa por profundidade). |
| `lazyLoadingIcon` | `React.ReactNode` | não | Indicador exibido sob nós com `loading: true` (default: spinner tokenizado). |
| `onExpand` | `(node: SarakMatrixTreeNode, expanded: boolean) => void` | não | Disparado ao expandir/colapsar um nó — ponto de gancho para fetch assíncrono. |
| `selectedIds` | `string[]` | não | IDs selecionados (habilita o toggle por nó quando combinado com `onSelect`). |
| `onSelect` | `(nodeId: string) => void` | não | Disparado ao alternar a seleção de um nó. |
| `className` | `string` | não |  |

### SarakTypography

Props (`SarakTypographyProps` — `src/components/atomic/Atoms/SarakTypography.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `variant` | `SarakTypographyVariant` | não | Escala tipográfica (Spec typography — tokens `h1Size`/`h2Size`/etc). Default: `body`. |
| `color` | `SarakTypographyColor` | não | Cor de texto (`textColorMaster`/`textColorSecondary`/`textColorMuted`). Default: `main`. |
| `as` | `React.ElementType` | não | Tag HTML a renderizar; sobrepõe o default semântico do `variant`. |
| `transform` | `'none' \| 'uppercase' \| 'capitalize'` | não | Sobrepõe `--sarak-h-transform` só para esta instância. |
| `content` | `string` | não | Texto via prop, para quando a origem é uma string e não nós filhos (ex.: dado vindo de uma API). Tem prioridade sobre `children` quando ambos são passados. |
| `children` | `React.ReactNode` | não |  |

Estende: `React.HTMLAttributes<HTMLElement>`

### SarakUploader

Props (`SarakUploaderProps` — `src/components/atomic/Inputs/SarakUploader.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `label` | `string` | não |  |
| `accept` | `SarakAccept` | não | Tipos aceitos no formato do react-dropzone (ex.: `{ 'image/*': [] }`). |
| `maxSize` | `number` | não | Tamanho máximo por arquivo, em bytes. |
| `multiple` | `boolean` | não |  |
| `disabled` | `boolean` | não |  |
| `hint` | `string` | não | Texto-dica abaixo do título da área. |
| `error` | `string` | não |  |
| `className` | `string` | não |  |
| `style` | `React.CSSProperties` | não |  |
| `onChange` | `(files: File[]) => void` | não | Recebe os arquivos aceitos (Spec 32: `onChange(value)`). |
| `onReject` | `(rejections: SarakFileRejection[]) => void` | não | Recebe as rejeições (ex.: arquivo maior que `maxSize`). |

