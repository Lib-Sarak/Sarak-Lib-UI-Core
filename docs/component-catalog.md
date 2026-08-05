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
| `SarakShellNav` | `orientation` | `vertical` · `horizontal` · `auto` |
| `SarakStats` | `role` | `primary` · `secondary` · `neutral` · `accent` |
| `SarakStats` | `density` | `compact` · `standard` · `spacious` |
| `SarakStats` | `importance` | `hero` · `base` · `subtle` |
| `SarakTable` | `role` | `primary` · `secondary` · `neutral` · `accent` |
| `SarakTable` | `density` | `compact` · `standard` · `spacious` |
| `SarakTable` | `importance` | `hero` · `base` · `subtle` |
| `SarakTabs` | `variant` | `pills` · `underlined` · `enclosed` |
| `SarakTypography` | `transform` | `none` · `uppercase` · `capitalize` |
| `SocialButton` | `provider` | `google` · `github` |
| `SocialButton` | `variant` | `glass` · `sovereign` |

### CSS Variables públicas (namespace `--sarak-*`)

Vars REAIS emitidas pelo Design Engine. Use SEMPRE com fallback — `var(--sarak-x, valor)`. Nomes fora desta lista NÃO existem e não pintam nada.

`--sarak-accent-color` · `--sarak-animation-speed` · `--sarak-bg-opacity` · `--sarak-body-font` · `--sarak-border-radius` · `--sarak-border-radius-lg` · `--sarak-border-radius-md` · `--sarak-border-radius-sm` · `--sarak-border-style` · `--sarak-border-type` · `--sarak-border-width` · `--sarak-button-active-color` · `--sarak-button-bg` · `--sarak-button-hover` · `--sarak-button-padding` · `--sarak-button-radius` · `--sarak-card-active-color` · `--sarak-card-bg` · `--sarak-card-border` · `--sarak-card-hover-color` · `--sarak-card-noise-opacity` · `--sarak-card-padding-lg` · `--sarak-card-padding-md` · `--sarak-card-padding-sm` · `--sarak-card-radius` · `--sarak-card-shadow-intensity` · `--sarak-chart-thickness` · `--sarak-chat-anim-speed` · `--sarak-chat-bubble` · `--sarak-color-depth` · `--sarak-color-variation` · `--sarak-contrast-curve` · `--sarak-elasticity` · `--sarak-error-color` · `--sarak-flow-grid` · `--sarak-flow-radius` · `--sarak-fluid-scale` · `--sarak-font-scale` · `--sarak-font-size` · `--sarak-font-size-base` · `--sarak-glass-blur` · `--sarak-glass-opacity` · `--sarak-glass-saturation` · `--sarak-haptic-scale` · `--sarak-heading-font` · `--sarak-heading-spacing` · `--sarak-heading-weight` · `--sarak-icon-stroke` · `--sarak-input-border-width` · `--sarak-input-style` · `--sarak-layered-shadows` · `--sarak-layout` · `--sarak-layout-density` · `--sarak-layout-gap` · `--sarak-layout-gap-lg` · `--sarak-layout-gap-md` · `--sarak-layout-gap-sm` · `--sarak-line-height` · `--sarak-max-width` · `--sarak-mode` · `--sarak-nav-style` · `--sarak-navigation-style` · `--sarak-noise-opacity` · `--sarak-palette` · `--sarak-primary-color` · `--sarak-scale-ratio` · `--sarak-scrollbar-width` · `--sarak-secondary-color` · `--sarak-security-glow` · `--sarak-security-pulse` · `--sarak-shadow-intensity` · `--sarak-sidebar-active-color` · `--sarak-sidebar-bg` · `--sarak-sidebar-hover-color` · `--sarak-sidebar-noise-opacity` · `--sarak-sidebar-width` · `--sarak-subtitle-font` · `--sarak-success-color` · `--sarak-surface` · `--sarak-surface-color` · `--sarak-surface-intensity` · `--sarak-system-tone` · `--sarak-tab-font` · `--sarak-tab-gap` · `--sarak-tab-section-margin` · `--sarak-tabular-nums` · `--sarak-tertiary-color` · `--sarak-texture` · `--sarak-texture-color` · `--sarak-texture-opacity` · `--sarak-title-color` · `--sarak-topbar-active-color` · `--sarak-topbar-bg` · `--sarak-topbar-height` · `--sarak-topbar-hover-color` · `--sarak-topbar-noise-opacity` · `--sarak-warning-color`

### Ícones (100 nomes válidos)

Valores aceitos por `<SarakIcon name>`, por `navItems[].icon` (`SarakAppChrome`/`SarakShellNav`) e por `mapping.icon` nos cards. O nome é o MESMO nas três famílias (`iconFamily`: `lucide` · `phosphor` · `tabler`) — trocar a família repinta todos os ícones sem mexer em nome nenhum.

Nome fora desta lista **não renderiza o ícone pedido**: o `SarakIcon` avisa no console (`console.warn`, uma vez por nome) e desenha `AlertCircle` no lugar — degradação visível, nunca tela quebrada.

`AlertCircle` · `AlertTriangle` · `Check` · `CheckCircle2` · `X` · `Info` · `HelpCircle` · `Menu` · `Search` · `Bell` · `Filter` · `List` · `Grid` · `Layout` · `LayoutDashboard` · `Home` · `ChevronDown` · `ChevronLeft` · `ChevronRight` · `ChevronUp` · `ArrowRight` · `ArrowLeft` · `ArrowUp` · `ArrowDown` · `ArrowUpDown` · `CornerDownRight` · `MoreVertical` · `MoreHorizontal` · `Maximize2` · `Minimize2` · `Loader2` · `RefreshCw` · `User` · `UserPlus` · `Users` · `LogIn` · `LogOut` · `Lock` · `Shield` · `Eye` · `File` · `FileText` · `FileSpreadsheet` · `Folder` · `Image` · `Paperclip` · `ScrollText` · `Clipboard` · `Copy` · `Download` · `Upload` · `UploadCloud` · `Printer` · `Save` · `Edit` · `Edit3` · `Plus` · `Trash2` · `Type` · `AlignLeft` · `Hash` · `Activity` · `BarChart3` · `LineChart` · `PieChart` · `ScatterChart` · `TrendingUp` · `Database` · `Layers` · `Network` · `Box` · `Package` · `Cpu` · `Cloud` · `Terminal` · `Thermometer` · `History` · `Calendar` · `Clock` · `MessageSquare` · `Mail` · `Send` · `Phone` · `Bot` · `Globe` · `Link` · `ExternalLink` · `Briefcase` · `Building` · `CreditCard` · `DollarSign` · `MapPin` · `Tag` · `Star` · `Play` · `Palette` · `Settings` · `Zap` · `Chrome` · `Github`

## Componentes públicos (80)

### DEFAULT_COLUMN_WIDTH

_Props não expostas por interface nomeada — consulte o arquivo do componente._

### ExpandableCard

Props (`ExpandableCardProps` — `src/components/atomic/Cards/ExpandableCard.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `title` | `string` | sim |  |
| `iconContent` | `React.ReactNode` | não |  |
| `helpButton` | `React.ReactNode` | não |  |
| `children` | `React.ReactNode` | sim |  |
| `className` | `string` | não |  |
| `contentClassName` | `string` | não |  |
| `baseHeight` | `number` | não |  |

### FilterSelect

Props (`FilterSelectProps` — `src/components/atomic/Templates/FilterSelect.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `col` | `string` | sim |  |
| `placeholder` | `string` | não |  |
| `filters` | `Record<string, string>` | sim |  |
| `onChange` | `(col: string, value: string) => void` | sim |  |
| `options` | `string[]` | sim |  |

### HelpButton

_Props não expostas por interface nomeada — consulte o arquivo do componente._

### ImageCard

Props (`ImageCardProps` — `src/components/atomic/Templates/ImageCard.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `src` | `string` | sim |  |
| `alt` | `string` | não |  |
| `title` | `string` | não |  |
| `subtitle` | `string` | não |  |
| `children` | `React.ReactNode` | não |  |
| `className` | `string` | não |  |
| `onClick` | `() => void` | não |  |

### LanguageSelector

_Props não expostas por interface nomeada — consulte o arquivo do componente._

### MIN_COLUMN_WIDTH

_Props não expostas por interface nomeada — consulte o arquivo do componente._

### ModuleSelector

_Props não expostas por interface nomeada — consulte o arquivo do componente._

### SarakAccordion

Props (`SarakAccordionProps` — `src/components/atomic/Layouts/SarakAccordion.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `title` | `React.ReactNode` | sim |  |
| `children` | `React.ReactNode` | sim |  |
| `defaultOpen` | `boolean` | não |  |
| `className` | `string` | não |  |

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
| `navItems` | `SarakNavItem[]` | não | Navegação ESTRUTURADA com ícone first-class (Spec 40.2 — L1). Renderiza ícone (via `SarakIcon`/`IconMap`) + label, temável por token, com estado ativo acessível (`aria-current`, foco por teclado). É o caminho recomendado para o cromo por-app; tem precedência sobre `nav` quando ambos são passados. |
| `nav` | `ShellNavItem[]` | não | Itens de navegação como DADO no contrato do `SarakShellNav` (modelo declarativo, `route`/`activeRoute`). Mantido para compatibilidade; prefira `navItems`. |
| `activeRoute` | `string` | não | Rota ativa (destaca o item correspondente no `nav`; ignorado se `navItems`). |
| `onNavigate` | `(route: string) => void` | não | Clique/teclado num item de navegação — o host decide como navegar. |
| `navigationStyle` | `'sidebar' \| 'topbar' \| 'auto'` | não | Estilo do cromo. `'auto'` (default) segue o Design Engine (`design.navigationStyle === 'topbar'` → topbar; caso contrário → sidebar), então trocar o tema no `/design` também troca a orientação do cromo. |
| `topbarActions` | `React.ReactNode` | não | Conteúdo à direita da topbar (ações, avatar, seletor de tema…). Alias legado de `topbarEnd`. |
| `logo` | `React.ReactNode` | não | Slot `logo` (Spec 48 — L1): logo custom/animado (`ReactNode`). Tem PRECEDÊNCIA sobre `brand.logoUrl`; o `brand.name` continua ao lado. Aparece nos três modos. |
| `topbarStart` | `React.ReactNode` | não | Slot `topbarStart`: conteúdo no INÍCIO da barra superior (após a marca). Sem barra superior (modo sidebar) degrada para o topo da sidebar. |
| `topbarEnd` | `React.ReactNode` | não | Slot `topbarEnd`: conteúdo no FIM da barra superior. É o mesmo lugar do `topbarActions` (alias preservado); quando os dois vêm, `topbarEnd` vence. No modo sidebar degrada para o rodapé da sidebar (comportamento atual). |
| `sidebarHeader` | `React.ReactNode` | não | Slot `sidebarHeader`: topo da sidebar (abaixo da marca). No celular migra para o drawer. |
| `sidebarFooter` | `React.ReactNode` | não | Slot `sidebarFooter`: rodapé da sidebar. No celular migra para o drawer. |
| `banner` | `React.ReactNode` | não | Slot `banner`: faixa full-width no topo do cromo (aviso, promo, faixa animada). |
| `footer` | `React.ReactNode` | não | Slot `footer`: faixa full-width na base do cromo (rodapé da página). |
| `decoration` | `React.ReactNode` | não | Slot `decoration`: camada decorativa ATRÁS do conteúdo do cromo (imagem/animação escopada ao cromo). É ornamento — `aria-hidden` e sem captura de foco/toque. COMPLEMENTA o fundo/atmosfera global por tema (Design Engine), não o substitui. |
| `className` | `string` | não |  |
| `style` | `React.CSSProperties` | não |  |

### SarakAppChromeMobile

Props (`SarakAppChromeMobileProps` — `src/components/Layout/SarakAppChromeMobile.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `children` | `React.ReactNode` | sim |  |
| `brand` | `React.ReactNode` | não |  |
| `nav` | `ShellNavItem[]` | sim |  |
| `activeRoute` | `string` | não |  |
| `onNavigate` | `(route: string) => void` | não |  |
| `topbarActions` | `React.ReactNode` | não | Slot `topbarEnd` (alias legado `topbarActions`) — fim da barra compacta. |
| `topbarStart` | `React.ReactNode` | não | Slot `topbarStart` — início da barra compacta, logo após a marca. |
| `sidebarHeader` | `React.ReactNode` | não | Slot `sidebarHeader` — migra para o topo do drawer (a sidebar do celular). |
| `sidebarFooter` | `React.ReactNode` | não | Slot `sidebarFooter` — migra para o rodapé do drawer. |
| `banner` | `React.ReactNode` | não | Slot `banner` — faixa full-width no topo. |
| `footer` | `React.ReactNode` | não | Slot `footer` — faixa full-width na base. |
| `decoration` | `React.ReactNode` | não | Slot `decoration` — camada decorativa atrás do cromo (aria-hidden, sem foco/toque). |
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

### SarakBadge

Props (`SarakBadgeProps` — `src/components/atomic/Feedback/SarakBadge.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `variant` | `BadgeVariant` | não |  |
| `size` | `BadgeSize` | não |  |
| `pill` | `boolean` | não | Se true, o badge terá bordas mais arredondadas (estilo pill) |
| `soft` | `boolean` | não | Se true, o fundo será translúcido/suave em vez de sólido |

Estende: `React.HTMLAttributes<HTMLSpanElement>`

### SarakBreadcrumbs

Props (`SarakBreadcrumbsProps` — `src/components/atomic/Navigation/SarakBreadcrumbs.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `items` | `BreadcrumbItem[]` | sim | Caminho do usuário, da raiz à folha. |
| `separator` | `React.ReactNode` | não | Separador entre migalhas (default: `/`). |
| `onNavigate` | `(href: string) => void` | não | Delega a navegação ao host (Spec 33, Regra 3) — não manipula a URL. |
| `className` | `string` | não |  |

### SarakButton

Props (`SarakButtonProps` — `src/components/atomic/Buttons/SarakButton.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `variant` | `'primary' \| 'secondary' \| 'ghost' \| 'danger' \| 'success' \| 'outline'` | não |  |
| `isLoading` | `boolean` | não |  |
| `leftIcon` | `React.ReactNode` | não |  |
| `rightIcon` | `React.ReactNode` | não |  |
| `fullWidth` | `boolean` | não |  |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg'` | não |  |

Estende: `ButtonHTMLAttributes<HTMLButtonElement>`

### SarakCardGrid

Props (`SarakCardGridProps` — `src/components/atomic/Templates/SarakCardGrid.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `endpoint` | `string` | sim |  |
| `label` | `string` | não |  |
| `mapping` | `{ title: string; subtitle?: string; description?: string; badge?: string; tags?: string; icon?: string; color?: string; details?: string; input_caps?: string; output_caps?: string; input_caps_label?: string; output_caps_label?: string; description_label?: string; expand_label?: string; collapse_label?: string; }` | não | Mapa de dados do card. Cada valor é o CAMINHO de um campo do item, exceto os marcados como *literal* (texto/nome fixo escrito pelo próprio autor). Genérico por contrato (Spec 42): a Sarak não conhece domínio nenhum — nenhuma aritmética, unidade ou moeda é calculada aqui. O consumidor entrega valores prontos em `details`. |
| `filters` | `FilterConfig[]` | não |  |
| `role` | `'primary' \| 'secondary' \| 'neutral' \| 'accent'` | não |  |
| `density` | `'compact' \| 'standard' \| 'spacious'` | não |  |
| `importance` | `'hero' \| 'base' \| 'subtle'` | não |  |
| `variant` | `'classic' \| 'title' \| 'action' \| 'search'` | não |  |

### SarakCatalogGrid

Props (`SarakCatalogGridProps` — `src/components/atomic/Templates/SarakCatalogGrid.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `items` | `CatalogItem[]` | sim |  |
| `loading` | `boolean` | não |  |
| `title` | `string` | sim |  |
| `subtitle` | `string` | não |  |
| `categories` | `Record<string, string>` | não |  |
| `onSync` | `() => void` | não |  |
| `renderCard` | `(item: CatalogItem) => React.ReactNode` | não |  |
| `emptyMessage` | `string` | não |  |
| `role` | `'primary' \| 'secondary' \| 'neutral' \| 'accent'` | não |  |
| `density` | `'compact' \| 'standard' \| 'spacious'` | não |  |
| `importance` | `'hero' \| 'base' \| 'subtle'` | não |  |

### SarakChart

Props (`SarakChartProps` — `src/components/atomic/Templates/SarakChart.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `endpoint` | `string` | sim |  |
| `label` | `string` | não |  |
| `mapping` | `Record<string, string>` | não |  |
| `role` | `'primary' \| 'secondary' \| 'neutral' \| 'accent'` | não |  |
| `density` | `'compact' \| 'standard' \| 'spacious'` | não |  |
| `importance` | `'hero' \| 'base' \| 'subtle'` | não |  |

### SarakChartEngine

Props (`SarakChartEngineProps` — `src/components/engines/charts/SarakChartEngine.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `type` | `'line' \| 'area' \| 'bar' \| 'pie' \| 'radar' \| 'gauge' \| 'scatter' \| 'heatmap' \| 'funnel' \| 'treemap' \| 'candlestick' \| 'sunburst' \| 'histogram' \| 'boxplot'` | sim |  |
| `data` | `ChartDataItem[]` | sim |  |
| `config` | `{ xAxisKey?: string; dataKey?: string; engine?: 'recharts' \| 'echarts'; title?: string; showGradients?: boolean; showAnimation?: boolean; thickness?: number; }` | não |  |

### SarakChat

Props (`SarakChatProps` — `src/components/atomic/Templates/SarakChat.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `endpoint` | `string` | sim |  |
| `modelsEndpoint` | `string` | não |  |
| `label` | `string` | não |  |
| `role` | `'primary' \| 'secondary' \| 'neutral' \| 'accent'` | não |  |
| `density` | `'compact' \| 'standard' \| 'spacious'` | não |  |
| `importance` | `'hero' \| 'base' \| 'subtle'` | não |  |

### SarakChatEngine

Props (`SarakChatEngineProps` — `src/components/engines/chat/SarakChatEngine.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `messages` | `Message[]` | sim |  |
| `onSendMessage` | `(text: string) => void` | sim |  |
| `isLoading` | `boolean` | não |  |
| `placeholder` | `string` | não |  |

### SarakContextMenu

Props (`SarakContextMenuProps` — `src/components/atomic/UX/SarakContextMenu.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `isOpen` | `boolean` | sim | Controla a visibilidade. |
| `position` | `ContextMenuPosition` | sim | Coordenada (viewport) onde abrir — normalmente `{ x: e.clientX, y: e.clientY }`. |
| `onClose` | `() => void` | sim | Fecha o menu (clique fora / ESC / escolha de item). |
| `children` | `React.ReactNode` | sim | Itens do menu (ex.: botões). |
| `className` | `string` | não |  |

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
| `rowHeight` | `number` | não | Altura de cada linha em px (default: 44). |
| `headerHeight` | `number` | não | Altura do cabeçalho em px (default: 44). |
| `height` | `number \| string` | não | Altura da janela de scroll (default: 100% do contêiner pai). |
| `overscan` | `number` | não | Linhas extra montadas fora da viewport (default: 8). |
| `getRowKey` | `(row: T, index: number) => React.Key` | não | Chave estável da linha (default: índice). |
| `onColumnResize` | `(columnId: string, width: number) => void` | não | Notifica nova largura ao soltar o handle de resize. |
| `onColumnReorder` | `(fromId: string, toId: string) => void` | não | Notifica reordenação (origem → destino) ao soltar o drag do cabeçalho. |
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
| `value` | `DatePickerValue` | não |  |
| `displayFormat` | `string` | não | Formato de exibição (i18n via JSON), ex.: `dd/MM/yyyy`. |
| `locale` | `DateLocale` | não | Locale do `date-fns` para nomes de mês/dia (i18n). |
| `weekStartsOn` | `WeekStart` | não |  |
| `placeholder` | `string` | não |  |
| `disabled` | `boolean` | não |  |
| `error` | `string` | não |  |
| `className` | `string` | não |  |
| `style` | `React.CSSProperties` | não |  |
| `onChange` | `(value: DatePickerValue) => void` | não | Emite a nova data/intervalo em ISO (Spec 32: `onChange(value)`). |

### SarakDrawer

Props (`SarakDrawerProps` — `src/components/atomic/Modals/SarakDrawer.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `isOpen` | `boolean` | sim |  |
| `onClose` | `() => void` | sim |  |
| `direction` | `'left' \| 'right' \| 'top' \| 'bottom'` | não |  |
| `children` | `React.ReactNode` | sim |  |
| `size` | `string \| number` | não |  |
| `className` | `string` | não |  |

### SarakEmptyState

Props (`SarakEmptyStateProps` — `src/components/atomic/Feedback/SarakEmptyState.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `type` | `'minimal' \| 'abstract' \| 'geometric'` | não |  |

### SarakExpandableMatrix

Props (`SarakExpandableMatrixProps` — `src/components/atomic/Templates/SarakExpandableMatrix.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `data` | `TData[]` | sim | Itens principais (ex: Roles/Papéis) |
| `subItems` | `MatrixTreeNode[]` | sim | Todos os sub-itens possíveis (ex: Todas as Permissões) |
| `activeMapping` | `(parentId: string, subItemId: string) => boolean` | sim | Função para checar se um sub-item está ativo em um item pai |
| `onToggle` | `(parentId: string, subItemId: string) => void` | sim | Callback disparado ao clicar no toggle |
| `renderItemHeader` | `(item: TData) => React.ReactNode` | não | Renderizador customizado para o cabeçalho de cada item pai |
| `manifest` | `SarakMatrixManifest` | não | Manifesto opcional de mapeamento recursivo para layout IAM/RBAC avançado |

### SarakFlex

Props (`SarakFlexProps` — `src/components/atomic/Layouts/SarakFlex.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `children` | `React.ReactNode` | sim |  |
| `direction` | `FlexDirection \| ResponsiveValue<FlexDirection>` | não | Direção do eixo. Aceita `ResponsiveValue` para variar por dispositivo (opcional). |
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
| `nodes` | `NonNullable<ReactFlowProps['nodes']>` | sim |  |
| `edges` | `NonNullable<ReactFlowProps['edges']>` | sim |  |
| `onConnect` | `ReactFlowProps['onConnect']` | não |  |

### SarakForm

Props (`SarakFormProps` — `src/components/atomic/Templates/SarakForm.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `endpoint` | `string` | sim |  |
| `label` | `string` | não |  |
| `mapping` | `Record<string, string>` | não |  |
| `mode` | `'create' \| 'edit'` | não |  |
| `initialData` | `TData` | não |  |
| `actions` | `Array<{ label: string; endpoint: string; method: 'POST' \| 'PATCH' \| 'DELETE'; }>` | não |  |
| `onSuccess` | `() => void` | não |  |
| `role` | `'primary' \| 'secondary' \| 'neutral' \| 'accent'` | não |  |
| `density` | `'compact' \| 'standard' \| 'spacious'` | não |  |
| `importance` | `'hero' \| 'base' \| 'subtle'` | não |  |

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
| `templateColumns` | `string \| ResponsiveValue<string>` | não | Colunas do grid. Aceita: - `string` fixo (ex.: `"1fr 1fr 1fr"`): mobile-first por padrão — **colapsa para 1 coluna no celular** (nunca estoura a página), reflui no valor cheio em tablet/desktop. - `ResponsiveValue<string>` (`{ mob, tab, desk }`): o consumidor controla por dispositivo. Sem `templateColumns`, usa a estratégia de grid do Design Engine (também 1 coluna no celular). |
| `templateAreas` | `string` | não |  |
| `gap` | `string` | não |  |
| `as` | `React.ElementType` | não |  |

Estende: `Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>`

### SarakHidden

Props (`SarakHiddenProps` — `src/components/Layout/SarakHidden.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `children` | `ReactNode` | sim |  |
| `on` | `DeviceType \| DeviceType[]` | sim | Esconder quando o dispositivo ativo estiver nesta lista |

### SarakIcon

Props (`SarakIconProps` — `src/components/atomic/Icon/SarakIcon.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `name` | `IconName \| string` | sim |  |
| `size` | `number \| string` | não |  |
| `className` | `string` | não |  |
| `color` | `string` | não |  |
| `style` | `React.CSSProperties` | não |  |
| `onClick` | `() => void` | não |  |

### SarakIconButton

Props (`SarakIconButtonProps` — `src/components/atomic/Buttons/SarakIconButton.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `variant` | `'primary' \| 'secondary' \| 'ghost' \| 'danger'` | não |  |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg'` | não |  |
| `isLoading` | `boolean` | não |  |
| `icon` | `React.ReactNode` | sim |  |

Estende: `ButtonHTMLAttributes<HTMLButtonElement>`

### SarakInput

Props (`SarakInputProps` — `src/components/atomic/Inputs/SarakInput.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `label` | `string` | não |  |
| `icon` | `React.ReactNode` | não |  |
| `leftIcon` | `React.ReactNode` | não |  |
| `rightIcon` | `React.ReactNode` | não |  |
| `error` | `string` | não |  |
| `fullWidth` | `boolean` | não |  |

Estende: `InputHTMLAttributes<HTMLInputElement>`

### SarakKanban

Props (`SarakKanbanProps` — `src/components/atomic/DataDisplay/SarakKanban/SarakKanbanImpl.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `columns` | `Array<KanbanColumn<C>>` | sim | Colunas e seus cards (a ordem do array é a ordem visual). |
| `onCardMove` | `(move: CardMove) => void` | não | Disparado ao soltar um card numa coluna (origem → destino). |
| `renderCard` | `(card: C, columnId: string) => React.ReactNode` | não | Render customizado do card (default: título + descrição). |
| `className` | `string` | não |  |

### SarakLightbox

Props (`SarakLightboxProps` — `src/components/atomic/Media/SarakLightbox.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `images` | `LightboxImage[]` | sim | Mídias da galeria, na ordem de exibição. |
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
| `endpoint` | `string` | sim |  |
| `groupBy` | `string` | sim |  |
| `ghostGroups` | `string[]` | não |  |
| `mapping` | `{ id: string; title: string; status: string; isActive: string; description?: string; error?: string; }` | sim |  |
| `headerActions` | `{ label: string; action: string; }[]` | não |  |
| `groupActions` | `{ label: string; icon?: 'plus' \| 'settings'; action: string; }[]` | não |  |
| `formMapping` | `Record<string, string>` | não |  |
| `role` | `'primary' \| 'secondary' \| 'neutral' \| 'accent'` | não |  |
| `density` | `'compact' \| 'standard' \| 'spacious'` | não |  |
| `importance` | `'hero' \| 'base' \| 'subtle'` | não |  |

### SarakMarkdownRenderer

Props (`SarakMarkdownRendererProps` — `src/components/atomic/Media/SarakMarkdownRenderer/SarakMarkdownRendererImpl.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `content` | `string` | sim | String de Markdown cru a renderizar. |
| `className` | `string` | não |  |

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
| `options` | `MultiSelectOption[]` | sim |  |
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
| `src` | `PdfSource` | sim | Origem do documento: URL, bytes ou ArrayBuffer. |
| `initialPage` | `number` | não | Página inicial (1-based, default: 1). |
| `zoom` | `number` | não | Escala inicial de zoom (default: 1.2). |
| `workerSrc` | `string` | não | URL do worker do pdf.js; default resolvido do pacote via `import.meta.url`. |
| `onDownload` | `(src: PdfSource) => void` | não | Disparado ao clicar em Download (recebe a `src` quando string). |
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

### SarakRangeSlider

Props (`SarakRangeSliderProps` — `src/components/atomic/Inputs/SarakRangeSlider.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `label` | `string` | não |  |
| `min` | `number` | não |  |
| `max` | `number` | não |  |
| `step` | `number` | não |  |
| `value` | `RangeValue` | não | Controlado: par [início, fim]. |
| `defaultValue` | `RangeValue` | não | Não-controlado: valor inicial. |
| `disabled` | `boolean` | não |  |
| `error` | `string` | não |  |
| `hideTooltips` | `boolean` | não | Esconde as tooltips de valor sobre os thumbs. |
| `onChange` | `(value: RangeValue) => void` | não | Recebe o novo par já clampado/ordenado (Spec 32: `onChange(value)`). |

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

### SarakSearch

Props (`SarakSearchProps` — `src/components/atomic/Inputs/SarakSearch.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `isOpen` | `boolean` | sim |  |
| `onClose` | `() => void` | sim |  |

### SarakSearchCard

Props (`SarakSearchCardProps` — `src/components/atomic/Cards/SarakSearchCard.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `item` | `TItem` | sim |  |
| `mapping` | `Record<string, string>` | não |  |
| `className` | `string` | não |  |
| `onSearchChange` | `(text: string) => void` | não |  |
| `onToggleCapability` | `(cap: string, active: boolean) => void` | não |  |
| `design` | `SarakThemePayload` | não |  |
| `label` | `string` | não |  |

### SarakSelect

Props (`SarakSelectProps` — `src/components/atomic/Inputs/SarakSelect.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `error` | `string` | não |  |
| `fullWidth` | `boolean` | não |  |

Estende: `SelectHTMLAttributes<HTMLSelectElement>`

### SarakShellNav

Props (`SarakShellNavProps` — `src/components/atomic/Navigation/SarakShellNav.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `items` | `ShellNavItem[]` | sim | Módulos/rotas do sistema, na ordem de exibição. |
| `activeRoute` | `string` | não | Rota ativa (a do roteador do consumidor) — comparada com `items[].route`. |
| `brand` | `{ name?: string; logoUrl?: string }` | não | Identidade exibida no topo do menu. |
| `onNavigate` | `(route: string) => void` | não | Callback de navegação — o host decide como navegar (router, pushState, assign). |
| `onChange` | `(route: string) => void` | não | Alias de `onNavigate`; ambos são chamados, na ordem. Mantido por compatibilidade. |
| `orientation` | `'vertical' \| 'horizontal' \| 'auto'` | não | Orientação do menu (Spec 18). `'auto'` (default) segue o Design Engine: `design.navigationStyle === 'topbar'` → horizontal; qualquer outro → vertical. `'dock'`/`'glass'` do shell legado ficam fora desta spec (tratados como vertical). |
| `className` | `string` | não |  |

### SarakSkeleton

Props (`SarakSkeletonProps` — `src/components/atomic/Feedback/SarakSkeleton.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `shape` | `SkeletonShape` | não | Forma do placeholder (default: `text`). |
| `rows` | `number` | não | Número de linhas-fantasma quando `shape="text"` (default: 3). |
| `rowHeight` | `string` | não | Altura de cada linha/bloco (default: `1rem`). |
| `size` | `string` | não | Diâmetro quando `shape="circle"` (default: `2.5rem`). |
| `width` | `string` | não | Largura quando `shape="rect"`/`circle` (default: `100%` / `size`). |

### SarakSlider

Props (`SarakSliderProps` — `src/components/atomic/Inputs/SarakSlider.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `label` | `string` | não |  |
| `valueLabel` | `string \| number` | não |  |

Estende: `Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>`

### SarakSparkline

Props (`SarakSparklineProps` — `src/components/atomic/DataDisplay/SarakSparkline.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `data` | `number[]` | sim | Série de valores. Vazia ou com 1 ponto degrada para um traço plano/único. |
| `variant` | `SparklineVariant` | não | Forma do micro-gráfico (default: 'line'). |
| `height` | `number` | não | Altura em px do desenho (default: 40). A largura preenche o contêiner. |
| `strokeWidth` | `number` | não | Espessura do traço (line/area) em px (default: 2). |
| `fillOpacity` | `number` | não | Opacidade do preenchimento da área (default: 0.15). |
| `label` | `string` | não | Descrição acessível do gráfico (vira `<title>` + `aria-label`). |
| `className` | `string` | não |  |
| `style` | `React.CSSProperties` | não |  |

### SarakSplitPane

Props (`SarakSplitPaneProps` — `src/components/atomic/Layouts/SarakSplitPane.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `leftPane` | `React.ReactNode` | sim |  |
| `rightPane` | `React.ReactNode` | sim |  |
| `minLeftWidth` | `number` | não |  |
| `maxLeftWidth` | `number` | não |  |
| `defaultLeftWidth` | `number` | não |  |
| `className` | `string` | não |  |

### SarakSpotlight

Props (`SarakSpotlightProps` — `src/components/atomic/Navigation/SarakSpotlight.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `items` | `NavigationItem[]` | sim | Itens disponíveis para navegação instantânea. |
| `shortcut` | `string` | não | Atalho de ativação global (default: `mod+k` = Ctrl/Cmd+K). |
| `open` | `boolean` | não | Modo controlado: estado de abertura. |
| `onOpenChange` | `(open: boolean) => void` | não | Notifica mudanças de abertura (abrir via atalho / fechar via Esc). |
| `onSelect` | `(item: NavigationItem) => void` | sim | Acionado ao confirmar um item (Enter ou clique). |
| `placeholder` | `string` | não | Placeholder do input central. |

### SarakStats

Props (`SarakStatsProps` — `src/components/atomic/Templates/SarakStats.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `endpoint` | `string` | não |  |
| `data` | `TData` | não |  |
| `label` | `string` | não |  |
| `mapping` | `Record<string, string>` | não |  |
| `role` | `'primary' \| 'secondary' \| 'neutral' \| 'accent'` | não |  |
| `density` | `'compact' \| 'standard' \| 'spacious'` | não |  |
| `importance` | `'hero' \| 'base' \| 'subtle'` | não |  |

### SarakStepper

Props (`SarakStepperProps` — `src/components/atomic/Navigation/SarakStepper.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `steps` | `StepConfig[]` | sim | Passos na ordem do fluxo. |
| `current` | `number` | sim | Índice (0-based) do passo atual. |
| `orientation` | `StepperOrientation` | não | Disposição (default: horizontal). |
| `className` | `string` | não |  |

### SarakSwitch

Props (`SarakSwitchProps` — `src/components/atomic/Inputs/SarakSwitch.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `label` | `React.ReactNode` | não |  |
| `description` | `React.ReactNode` | não |  |

Estende: `Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>`

### SarakTable

Props (`SarakTableProps` — `src/components/atomic/Templates/SarakTable.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `endpoint` | `string` | sim |  |
| `data` | `TData[]` | não |  |
| `label` | `string` | não |  |
| `mapping` | `Record<string, string>` | não |  |
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
| `error` | `string` | não |  |
| `fullWidth` | `boolean` | não |  |

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
| `item` | `TItem` | sim |  |
| `mapping` | `Record<string, string>` | não |  |
| `className` | `string` | não |  |
| `design` | `SarakThemePayload` | não |  |
| `label` | `string` | não |  |

### SarakToastProvider

_Props não expostas por interface nomeada — consulte o arquivo do componente._

### SarakTooltip

Props (`SarakTooltipProps` — `src/components/atomic/UX/SarakTooltip.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `children` | `React.ReactNode` | sim |  |
| `content` | `React.ReactNode` | sim |  |
| `position` | `TooltipPosition` | não |  |
| `delay` | `number` | não |  |
| `className` | `string` | não |  |
| `disabled` | `boolean` | não | Se true, desativa o tooltip |

### SarakTreeView

Props (`SarakTreeViewProps` — `src/components/atomic/DataDisplay/SarakTreeView.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `data` | `MatrixTreeNode[]` | sim | Floresta de nós; cada nó pode ter `children` (N níveis) e `loading`. |
| `manifest` | `SarakMatrixManifest` | não | Manifesto de layout por nível/tipo (default: variante limpa por profundidade). |
| `lazyLoadingIcon` | `React.ReactNode` | não | Indicador exibido sob nós com `loading: true` (default: spinner tokenizado). |
| `onExpand` | `(node: MatrixTreeNode, expanded: boolean) => void` | não | Disparado ao expandir/colapsar um nó — ponto de gancho para fetch assíncrono. |
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
| `accept` | `Accept` | não | Tipos aceitos no formato do react-dropzone (ex.: `{ 'image/*': [] }`). |
| `maxSize` | `number` | não | Tamanho máximo por arquivo, em bytes. |
| `multiple` | `boolean` | não |  |
| `disabled` | `boolean` | não |  |
| `hint` | `string` | não | Texto-dica abaixo do título da área. |
| `error` | `string` | não |  |
| `className` | `string` | não |  |
| `style` | `React.CSSProperties` | não |  |
| `onChange` | `(files: File[]) => void` | não | Recebe os arquivos aceitos (Spec 32: `onChange(value)`). |
| `onReject` | `(rejections: FileRejection[]) => void` | não | Recebe as rejeições (ex.: arquivo maior que `maxSize`). |

### SocialButton

Props (`SocialButtonProps` — `src/components/atomic/Atoms/SocialButton.tsx`):

| Prop | Tipo | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `provider` | `'google' \| 'github'` | sim |  |
| `variant` | `'glass' \| 'sovereign'` | sim |  |
| `onClick` | `(provider: 'google' \| 'github') => void` | não |  |
| `label` | `string` | não |  |
| `hideLabel` | `boolean` | não |  |
| `className` | `string` | não |  |

### ThemeToggle

_Props não expostas por interface nomeada — consulte o arquivo do componente._

### UserMenu

_Props não expostas por interface nomeada — consulte o arquivo do componente._

