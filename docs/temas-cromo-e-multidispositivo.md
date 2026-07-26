# Temas completos, Cromo e Multi-dispositivo — guia do consumidor

> Referência das APIs expostas na Spec 40.1 (L2/L3/L6). Tudo abaixo é **plug-and-play**:
> o consumidor instala, envolve no `SarakUIProvider`, escolhe um tema e (opcional) usa o
> cromo. **Zero CSS do consumidor** — a lib pinta cor, fonte, cromo, raio e espaçamento.

## 1. Temas COMPLETOS (L6)

A lib fornece um **par de temas de referência completos** — todos os eixos preenchidos
(cor + fonte + cromo topbar/sidebar + raio + espaçamento). Parta deles e customize poucos
valores; **não monte um tema do zero** (é como o `ERP_THEMES` do 1º teste nasceu só com
cor, e por isso "fonte/cromo não mudavam").

```tsx
import { SarakUIProvider, SARAK_REFERENCE_THEMES } from '@sarak/lib-ui-core';

// Customização mínima: clona o par completo e troca só a cor da marca.
const MEUS_TEMAS = SARAK_REFERENCE_THEMES.map((t) => ({
  ...t,
  design: { ...t.design, primaryColor: '#2563eb', accentColor: '#38bdf8' },
}));

<SarakUIProvider customThemes={MEUS_TEMAS} initialTheme={MEUS_TEMAS[0].id}>
  <App />
</SarakUIProvider>
```

APIs relacionadas:
- `GLOBAL_THEMES: ThemePreset[]` — catálogo completo (18 temas) para escolher o ponto de partida.
- `SARAK_REFERENCE_THEMES` — o par recomendado (`minimalist-airy` claro + `sarak-sovereign` escuro), que difere em modo, cromo e fonte de propósito.
- `getThemePreset(id)` — busca um preset por id.
- `getDefaultDesignState()` / `getAllDesignTokens()` — o **schema vivo** de tokens (fonte da verdade; cada `token.id` é uma chave válida de `design`).
- `findMissingThemeAxes(design)` / `warnOnIncompleteTheme(design)` — avisam se um tema custom omite um eixo inteiro (para não ficar incompleto em silêncio).

### Schema de tema

Um `ThemePreset` é `{ id, name, description, design }`. O `design` é um mapa
`Record<tokenId, valor>`. A lista COMPLETA de `tokenId`s válidos é **derivada do código**
(`getAllDesignTokens()`), então nunca desatualiza — cada token tem `id`, `type`
(`color` / `font` / `slider` / `select` / `boolean` / …), `defaultValue` e `cssVars`.
Eixos e tokens representativos:

| Eixo | Exemplos de token |
| --- | --- |
| cor | `primaryColor`, `accentColor`, `textColorMaster`, `colorBgBody`, `surfaceColor` |
| fonte | `bodyFont`, `headingFont`, `monoFont` |
| cromo | `sidebarColor`, `topbarColor`, `sidebarWidth`, `topbarHeight` |
| raio | `borderRadius`, `cardBorderRadius`, `btnBorderRadius` |
| espaçamento | `layoutGap`, `layoutPadding`, `cardPaddingMd` |

O **CustomizationPanel** ("Exportar JSON") sempre exporta o conjunto **completo** de
tokens — o JSON exportado nasce completo, pronto para colar em `customThemes`.

## 2. Cromo apresentacional (L2) — `SarakAppChrome`

Topbar/sidebar temáveis **sem** o modelo de host/registro do `SarakShell`. Cada app
renderiza o seu, isolado; a navegação é DADO e a seleção sai por callback.

### Navegação estruturada com ícone first-class (Spec 40.2 — L1)

Prefira `navItems` (contrato `SarakNavItem`): cada item traz **ícone** (resolvido pelo
`SarakIcon`/`IconMap` curado) + label, com estado ativo acessível (`aria-current`, foco por
teclado) — o cromo deixa de ser text-only. É o modelo recomendado para o cromo **por-app**:
defina os itens **uma vez** (código compartilhado) e todo app renderiza o mesmo menu.

```tsx
import { SarakAppChrome, type SarakNavItem } from '@sarak/lib-ui-core';

// Definido UMA vez e compartilhado por todos os apps → cromo idêntico em toda aba.
const NAV: SarakNavItem[] = [
  { id: 'propostas', label: 'Propostas', icon: 'FileText', href: '/propostas' },
  { id: 'projetos',  label: 'Projetos',  icon: 'Folder',   href: '/projetos' },
];

<SarakAppChrome
  brand={{ name: 'Meu Sistema' }}
  navItems={NAV.map((it) => ({ ...it, active: it.href === rotaAtual }))}
  onNavigate={(href) => window.location.assign(href)}  // o host decide como navegar
>
  <MinhaTela />
</SarakAppChrome>
```

- `SarakNavItem = { id, label, icon?, href, active? }`. O `icon` é opcional por item.
- `navItems` tem precedência sobre `nav` (modelo declarativo `route`/`activeRoute`, mantido para compat).
- `navigationStyle="auto"` (default) segue o tema: `navigationStyle: 'topbar'` no design →
  topbar; caso contrário → sidebar. Trocar o tema no `/design` troca o cromo também.
- Pintado 100% por tokens (`--sarak-topbar-*`, `--sarak-sidebar-*`) — zero CSS do consumidor.

### Slots de extensão do cromo (Spec 48)

Para **injetar imagem, animação ou qualquer `ReactNode`** em regiões do cromo (`logo`,
`topbarStart`/`topbarEnd`, `sidebarHeader`/`sidebarFooter`, `banner`, `footer`, `decoration`)
sem forkar a componente — e para o outro nível, o **fundo/atmosfera global por tema** —, veja
o guia dedicado: [`extensibilidade-de-layout.md`](./extensibilidade-de-layout.md). Todos os
slots são opcionais e aditivos (`brand`/`topbarActions`/`children` não mudaram).

## 3. Multi-dispositivo (L3) + densos responsivos por padrão (Spec 40.2 — L2)

### Princípio: **componente denso da lib é mobile-usável por padrão**

Um componente denso (tabela colunar, grid) tem que ser **legível e utilizável no celular sem
o consumidor escrever CSS** (isso seria gambiarra). A lib degrada graciosamente sozinha:

- **`SarakDataTable`/`SarakDataTableImpl`** — no smartphone (via `useSarakDevice`) **colapsa
  para cards empilhados** (`SarakDataCards`): cada linha vira um card com rótulo (cabeçalho da
  coluna) + valor, reusando as **mesmas** `columns` (mesmo `header`/`render`). Scroll só
  vertical, contido no container: **zero sobreposição, zero overflow horizontal da página**.
  No desktop/tablet segue a tabela colunar, agora com `maxWidth: 100%` (scroll X contido).
  Opt-out: `responsive={false}` mantém a tabela colunar em qualquer dispositivo.
- Tudo por tokens (`--sarak-card-*`, `--sarak-layout-gap-*`) — o consumidor não pinta nada.

- **`SarakTable`** (denso genérico) — no smartphone também **colapsa para cards** empilhados
  (`SarakTableCards`, Spec 40.3 — L3), reusando as mesmas colunas/rótulos. Desktop/tablet
  seguem a tabela dentro de um container com scroll X contido (`overflow-x-auto`).

> **Follow-up registrado (não resolvido — evitar "boilar o oceano"):** os vizinhos densos
> **`SarakManagementGrid`** e a primitiva headless **`SarakDataGrid`** ainda não têm colapso
> mobile próprio. O ERP não os usa hoje (Teste Real / Spec 40 — as telas migraram para
> cards/listas), então entram numa spec de responsividade dedicada quando um consumidor real
> os exigir no mobile. Os densos que a lib JÁ adapta são `SarakDataTable` (Spec 40.2) e
> `SarakTable` (Spec 40.3).

```tsx
import { DeviceProvider, useSarakDevice, SarakHidden, type ResponsiveValue } from '@sarak/lib-ui-core';

// 1) Envolva a árvore (o SarakUIProvider já monta um DeviceProvider; use este só para
//    forçar/observar em subárvores específicas, ex. o Gêmeo Digital do preview).
// 2) Leia o dispositivo atual:
const device = useSarakDevice();           // 'smartphone' | 'tablet' | 'desktop'

// 3) Oculte por dispositivo, sem CSS:
<SarakHidden on={['smartphone']}>
  <ColunaLateralPesada />
</SarakHidden>

// 4) Tokens responsivos: qualquer token físico aceita ResponsiveValue<T> (mob/tab/desk),
//    resolvido por breakpoint via media query pelo Design Engine.
const largura: ResponsiveValue<number> = { mob: 200, tab: 220, desk: 240 };
```

Breakpoints são tokens do tema (`breakpointTablet`/`breakpointDesktop`) — o consumidor
não hardcoda largura de tela.

## 4. Contrato de responsividade (Spec 40.3 — L4)

**Layout multidispositivo é por padrão (zero-config).** O consumidor **não escreve CSS nem
media query** para as telas adaptarem a celular/tablet/desktop — o cromo e as primitivas
consomem `useSarakDevice` sozinhos. Onde quiser um layout específico, refine passando
`ResponsiveValue<T>` (nunca é obrigatório). Breakpoints: **celular** `< 768px`, **tablet**
`768–1023px`, **desktop** `≥ 1024px`.

### O que adapta automaticamente

| Componente | Celular | Tablet | Desktop | Refino opcional |
| --- | --- | --- | --- | --- |
| **`SarakAppChrome`** (cromo) | barra compacta + **hambúrguer → drawer** (nav não come a tela, acessível: `aria-expanded`/foco/ESC) | **topbar compacta** | sidebar **ou** topbar (por `navigationStyle`) | tokens de cromo (`--sarak-sidebar-*`/`--sarak-topbar-*`) aceitam `ResponsiveValue` |
| **`SarakGrid`** | **1 coluna** (um `templateColumns` fixo colapsa; nunca estoura) | valor cheio | valor cheio | `templateColumns={{ mob, tab, desk }}` |
| **`SarakFlex`** | **quebra em linhas** (`wrap` on) | idem | idem | `wrap={false}`; `direction={{ mob, tab, desk }}` |
| **`SarakSplitPane`** | **empilha** em coluna full-width (sem divisória) | split redimensionável | split redimensionável | — |
| **`SarakDataTable`** | **colapsa para cards** (`SarakDataCards`) | tabela colunar (scroll X contido) | idem | `responsive={false}` (opt-out) |
| **`SarakTable`** | **colapsa para cards** (`SarakTableCards`) | tabela (scroll X contido) | idem | — |
| **`SarakHidden`** | oculta por `on={['smartphone', ...]}` | idem | idem | — |
| **Slots do cromo** (Spec 48) | faixas full-width refluem; regiões de sidebar migram para o **drawer**; `topbarStart/End` comprimem | idem (sem sidebar) | cada slot na sua região | conteúdo é do consumidor (`ReactNode`) |

### Regras do contrato

- **Nenhum `grid-template-columns` fixo estoura no celular** — a lib colapsa para 1 coluna por
  padrão; passe `ResponsiveValue` para controlar por dispositivo.
- **A adaptação é do componente, não do host** — funciona em qualquer deploy (monólito,
  modular, microfrontend). O cromo é por-app (cada app renderiza o seu `SarakAppChrome`).
- **Zero-config com controle opcional** — defaults mobile-first sensatos; `ResponsiveValue<T>`
  é sempre opcional, nunca exigido.
- **Fora do contrato desta rodada** (registrado, não corrigido): colapso mobile de
  `SarakManagementGrid` e `SarakDataGrid` (o ERP não os usa) — spec dedicada quando exigidos.
- Para forçar/observar o dispositivo numa subárvore (ex.: preview/Gêmeo Digital), use
  `DeviceProvider overrideDevice`; o `SarakUIProvider` já monta um `DeviceProvider` que segue
  o viewport real.
