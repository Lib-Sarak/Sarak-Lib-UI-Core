---
tipo: "spec"
titulo: "Cromo apresentacional e slots de extensão — a casca do modo ui-kit"
dominio: "Sarak-Lib-UI-Core / Layout / Cromo"
status: "🟢 Vigente"
prioridade: "Alta"
tags: ["spec", "cromo", "slots", "layout", "extensibilidade", "app-chrome"]
relacionados: ["[[00-regras-e-invariantes]]", "[[01-forma-do-produto-e-modos-de-consumo]]", "[[04-shell-e-discovery]]", "[[07-responsividade-e-multidispositivo]]", "[[09-temas-e-presets]]", "[[005-modelo-modulos-plugin-e-apps-separados]]", "[[013-item-de-navegacao-como-atomo-proprio]]"]
---

# 1. Por que ele existe — a lacuna que o criou

O `SarakAppChrome` não nasceu de um pedido de feature. Nasceu de um **sintoma**: *"topbar e sidebar não
aparecem"*.

A causa foi estrutural, e está escrita no cabeçalho do próprio componente
(`src/components/Layout/SarakAppChrome.tsx:13-24`): os tokens de cromo — `--sarak-topbar-*` e
`--sarak-sidebar-*` — tinham **um único consumidor na biblioteca: o `SarakShell`**. E o `SarakShell` é um
**HOST** (renderiza o `activeModule` do Discovery, não `children`). Um consumidor de **apps separados**,
que não usa registro nem Discovery, portanto **não tinha nada que pintasse a topbar ou a sidebar** — os
tokens existiam, o tema os emitia, e ninguém os lia.

`SarakAppChrome` fecha essa lacuna: **cromo 100% apresentacional**, temável pelos mesmos tokens, que
**cada app renderiza sozinho** — sem `registerSarakModule`, sem Discovery, sem acoplar módulos. É a casca
do **modo de consumo #3** ([[005-modelo-modulos-plugin-e-apps-separados]]).

> **A distinção que não pode se perder** (ver [[04-shell-e-discovery]] §6):
> `SarakShell` renderiza **o módulo ativo do registro**. `SarakAppChrome` renderiza **`children`**.
> Os dois pintam o mesmo cromo com os mesmos tokens; o que difere é **quem manda**.

# 2. O contrato

`SarakAppChromeProps` — as props do cromo, **publicadas no catálogo gerado** (`docs/component-catalog.json`).
A contagem não é fixada aqui: o catálogo é a fonte viva ([[00-regras-e-invariantes]] **R17**).

## 2.1 Estrutura e navegação

| Prop | Contrato |
| --- | --- |
| `children` | a tela do app (obrigatória) |
| `brand?: { name?, logoUrl? }` | identidade exibida no cromo — **do consumidor, sempre** ([[08-identidade-do-host-e-zero-marca]]) |
| `navItems?: SarakNavItem[]` | **navegação recomendada**, ícone first-class; tem **precedência** sobre `nav` |
| `nav?: ShellNavItem[]` + `activeRoute?` | modelo declarativo legado (`route`/`activeRoute`), mantido por compatibilidade |
| `onNavigate?: (route) => void` | **o host decide COMO navegar** — redirect de página inteira, router local, o que for |
| `navigationStyle?: 'sidebar' \| 'topbar' \| 'auto'` | `'auto'` (default) segue `design.navigationStyle` |
| `className?` / `style?` | escape hatch; o `style` sobrescreve a altura própria (§5) |

`SarakNavItem` (`src/components/Layout/chrome/navItem.ts:20-31`):
`{ id, label, icon?, href, active?, category? }` — `id` estável para chave de render, `href` é o destino, e o
**consumidor marca qual item está ativo**. `category` agrupa visualmente (mesmo campo do `ShellNavItem`);
item sem categoria fica no grupo raiz. O `icon` é resolvido pelo `SarakIcon`/`IconMap` curado — o mesmo
motor do Shell.

**A resolução de precedência, explícita** (`SarakAppChrome.tsx:143-149`): com `navItems`, o cromo mapeia
para o contrato do `SarakShellNav` e deriva a rota ativa do item marcado `active` (com `activeRoute` como
fallback); sem `navItems`, usa `nav` + `activeRoute`.

**`navigationStyle: 'auto'`** (`:135`) resolve por `useNavigationStyle()`: `'topbar'` no design → topbar;
qualquer outra coisa → sidebar. **Consequência que vale destacar: trocar o TEMA troca a orientação do
cromo.** O cromo é parte do design, não configuração de código.

### 2.1.1 O item de navegação tem átomo próprio, e a métrica difere por orientação

> ⚠️ **Dois nomes parecidos, e eles NÃO são a mesma coisa:**
>
> | Nome | O que é |
> | --- | --- |
> | `SarakNavItem` **(tipo)** | a **forma do dado** da prop `navItems` da tabela acima — `{ id, label, icon?, href, active? }`, de `Layout/chrome/navItem.ts` |
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
| `horizontal` | topbar | aba compacta — pílula, caixa alta, peso forte |

`SarakShellNav` — o renderizador que o `SarakAppChrome` usa para `navItems`/`nav` — compõe o átomo e segue
a orientação resolvida pelo `navigationStyle`. **Consequência direta da §2.1:** como trocar o tema troca a
orientação do cromo, ele **também** troca a métrica do item de menu, de lista para aba.

**O consumidor tem a última palavra:** a `className` que ele passa vence o default do átomo
([[00-regras-e-invariantes]] **R35**) — é assim que se pede um rótulo em caixa normal numa topbar, sem
prop nova.

## 2.2 Os slots

| Slot | Região | Ausente = |
| --- | --- | --- |
| `logo` | identidade; **precedência sobre `brand.logoUrl`**, e o `brand.name` continua ao lado | cai em `brand.logoUrl` |
| `topbarStart` | início da barra superior, após a marca | região não renderiza |
| `topbarEnd` | fim da barra superior — **alias de `topbarActions`**, e **vence** quando os dois vêm (`:151`) | idem |
| `search` | busca do consumidor — **posicionada por token**, não por região fixa (§2.4) | região não renderiza |
| `sidebarHeader` | topo da sidebar, abaixo da marca | idem |
| `sidebarFooter` | rodapé da sidebar | idem |
| `banner` | faixa **full-width**, primeira do cromo | idem |
| `footer` | faixa **full-width**, última do cromo | idem |
| `decoration` | camada decorativa **atrás** do conteúdo do cromo | idem |

**Verificado no gate:** `npm run catalog:check` verde, com **todos** os slots presentes nas props publicadas
de `SarakAppChrome` em `docs/component-catalog.json` (+ `topbarActions`, o alias). O contrato está
publicado, não só implementado.

### O princípio

> **A lib dá a REGIÃO; o consumidor dá o CONTEÚDO.**

**E o conteúdo pode vir da própria biblioteca.** Busca, alternância de tema, widget de usuário e seletor de
idioma são **componentes públicos** — montam sob o `SarakUIProvider`, dentro de qualquer slot, sem
`SarakShell`, sem Discovery e sem registro. O princípio não muda: quem decide o que vai em cada região
continua sendo o consumidor. O que deixou de existir é a situação em que ele precisava reescrever do zero o
que a lib já tinha pronto, porque os quatro moravam fora das raízes que a superfície pública varre
([[arquitetura/03-superficie-publica]]).

Todo slot é `ReactNode` puro e o invólucro é mínimo — a lib **não presume** o que vai dentro (imagem,
vídeo, animação, faixa promocional, widget). `ChromeSlots.tsx:1-12` declara isso, e cada bloco
**devolve `null` sem `children`** (`:52-56`, `:70-76`, `:85-96`, `:104-114`): **slot ausente não cria espaço
morto.**

Cada região carrega `data-sarak-slot="<nome>"` — âncora estável para teste e para o consumidor mirar por
CSS **sem depender de estrutura interna**. É contrato, não detalhe de implementação.

### Geometria: uma regra para os três modos

`ChromeFrame` (`chrome/ChromeFrame.tsx:38-58`) é a moldura comum. Ordem de pintura, de fora para dentro:

1. `decoration` — camada absoluta atrás de tudo;
2. `banner` — **primeira** faixa full-width;
3. o corpo do modo (topbar+conteúdo, sidebar+conteúdo, ou mobile);
4. `footer` — **última** faixa full-width.

**Por que uma regra só:** banner é sempre a primeira faixa e footer sempre a última, ambas full-width —
então o refluxo no celular é o mesmo do desktop (a faixa só fica mais estreita) e **não existe caso
especial por dispositivo** (`ChromeFrame.tsx:20-24`).

**Empilhamento sem z-index mágico:** a raiz só ganha `position: relative` + `isolation: isolate`
**quando há `decoration`** (`:45-47`); sem ela, o estilo da raiz é exatamente o que era. Zero mudança para
quem não usa o slot.

`decoration` é **ornamento por contrato** (`ChromeSlots.tsx:59-67`): `aria-hidden="true"` +
`pointer-events: none`. Sai da árvore de acessibilidade e **nunca rouba foco ou toque** da navegação.

## 2.3 A regra de degradação — nada some

| Modo | O que acontece com os slots |
| --- | --- |
| **sidebar** (sem barra superior) | `topbarStart` → topo da sidebar; `topbarEnd` → **rodapé** da sidebar (`SarakAppChrome.tsx:236-241`) |
| **topbar** | todos na barra superior, como declarados |
| **celular** (`SarakAppChromeMobile`) | `sidebarHeader`/`sidebarFooter` → **dentro do drawer** (é onde a sidebar existe ali, `SarakAppChromeMobile.tsx:134,136`); `topbarStart`/`topbarEnd` compactam na barra (`min-w-0`, sem empurrar o hambúrguer, `:109-110`); `banner`/`footer` seguem faixas; `logo` viaja dentro do nó `brand` |

**Nenhum slot é descartado em nenhum modo.** É por isso que o consumidor pode declarar os 8 e confiar —
sem escrever media query nem condicional por dispositivo.

Nota de contrato interno: `SarakAppChromeMobile` recebe `brand` como **`ReactNode` já montado**
(`ChromeBrand`, com o `logo` dentro) e `topbarActions` como o slot de fim já resolvido — por isso as props
dele no catálogo não repetem `logo`/`topbarEnd`. A tradução acontece em `SarakAppChrome.tsx:171-188`.

## 2.4 Um token de cromo vale nos DOIS modos de consumo, ou não existe

O `SarakAppChrome` (modo ui-kit) e o `SarakShell` (modo módulos-plugin) pintam o **mesmo** cromo a partir
dos **mesmos** tokens de `schema/navigation.ts`. Um token oferecido no schema e no catálogo é contrato com
o usuário final ([[09-temas-e-presets]] §4.4.3): **ou ele produz efeito nos dois modos, ou sai do schema.**
Não existe token que funciona "só no Shell" — para quem clica no painel, isso é indistinguível de defeito.

O cromo do modo ui-kit lê esses tokens por um hook único e os traduz em classe estrutural:

| Token | Efeito no cromo |
| --- | --- |
| `sidebarPosition` | lado da sidebar — `left`, `right` (inverte a direção do corpo) ou `floating` (destacada, com raio e sombra) |
| `navbarLayout` | `sticky`, `inline` ou `hidden` para a barra superior |
| `contentAlignment` | `stretch` ou `center` — largura máxima centralizada para o conteúdo |
| `isNavHidden` | colapsa a navegação: sidebar estreita só com ícone, topbar com altura reduzida |
| `isAutoHideEnabled` | a nav só existe no ar sob o ponteiro; uma faixa sensível na borda a traz de volta |
| `searchPositionTopbar` | `left`, `center`, `right` ou `hidden` para o slot `search` na topbar |
| `searchPositionSidebar` | `top`, `bottom` ou `hidden` para o slot `search` na sidebar/drawer |
| `tabGap` · `tabSectionMargin` | espaçamento entre itens e margem da seção de nav |
| `sidebarActiveColor` · `sidebarHoverColor` · `topbarActiveColor` | realce do item de menu, por orientação |

> **`hidden` some com a região mesmo havendo conteúdo.** Quem decide sumir é o token, não a ausência do
> slot — é assim que o dono do tema desliga a busca sem o consumidor mudar código.

**A regra estrutural, para quem for estender:** a tradução token → classe vive num mapa de **literais**,
nunca em string interpolada. O scanner do Tailwind lê o arquivo como texto; uma classe montada por
concatenação não existe no CSS publicado ([[07-responsividade-e-multidispositivo]] §6.1).

### 2.4.1 O gate que impede a lacuna de voltar

`npm run chrome-token-parity:check` cobra a metade que nenhum outro auditor cobrava: **não o valor do
token, a existência do consumidor**. Para cada token da lista, o gate exige uma referência ao `id` ou a uma
das variáveis CSS declaradas, **de cada lado** — `src/core/Shell/**` e `src/components/Layout/**`, mais os
átomos compartilhados que cada cromo usa para pintar o item de menu. Ausência de qualquer lado é bloqueio,
e ele roda no `pre-commit`.

**Limites que o próprio gate declara** ([[00-regras-e-invariantes]] **R18**): o escopo é uma lista fechada,
não o schema inteiro — há tokens de cromo órfãos **fora** dela, dívida anterior e nomeada no cabeçalho do
gate; e a checagem é **textual**, não por AST: prova que existe referência, não que o consumo produz efeito
visual. A prova de efeito é o teste de componente e, para CSS renderizado, `cromo-css-real:check`.

# 3. Os dois níveis de "adicionar imagem/animação"

Confusão frequente. São **dois mecanismos que se complementam**, nunca competem:

| | (a) Fundo/atmosfera GLOBAL | (b) Conteúdo por REGIÃO |
| --- | --- | --- |
| Como | por **tema** (Design Engine: `globalBackgroundImageUrl`, texturas, atmosfera) | por **slot** (`decoration`, `banner`, `footer`, `logo`…) |
| Alcance | a aplicação inteira, atrás de tudo | aquela região do cromo |
| Quem controla | o **tema** (troca junto com o tema) | o **código do app** (independe do tema) |
| Entra por | JSON de tema ([[09-temas-e-presets]]) | `ReactNode` em prop |

`ChromeSlots.tsx:44-46` diz isso explicitamente: `decoration` **complementa** — não substitui — o fundo
global por tema (`SarakBackgroundRenderer`), que **continua sendo o caminho de fundo do app**.

Regra prática: **atmosfera é do tema; ornamento localizado é do slot.** Quem quer um fundo que muda com o
tema usa (a). Quem quer um banner de campanha na topbar usa (b).

## 3.1 O fundo global alcança os DOIS cromos

`SarakShell` e `SarakAppChrome` **deixam de pintar fundo próprio quando há mídia global** — a raiz de cada
um emite fundo transparente em vez do token de fundo, para que o `SarakBackgroundRenderer` do Provider
(montado com `position: fixed`, atrás de tudo) apareça sob o cromo inteiro. Sem mídia, cada um pinta o
próprio token, como sempre.

No cromo apresentacional a regra vale igual nos **três modos de geometria** — sidebar, topbar e celular —,
porque o estilo de raiz é montado uma vez e repassado aos três ramos: nenhum ganha caso especial. O `style`
do consumidor continua sobrescrevendo nos dois estados.

> **Por que isto merece uma seção.** A assimetria entre os dois cromos foi invisível por construção: o
> token aplicava, o renderizador montava, a mídia carregava — e a raiz opaca do cromo a cobria inteira. O
> sintoma que chega é *"escolher imagem de fundo não faz nada"*, e nada no caminho do tema está errado.
> Diferença de fundo de raiz não se prova em `jsdom`, que não resolve cascata: prova-se lendo o valor
> **computado** em navegador (§9).

# 4. Acessibilidade do colapso mobile

`SarakAppChromeMobile` (`src/components/Layout/SarakAppChromeMobile.tsx`) não é um cromo "menor" — é um
padrão diferente, com obrigações próprias:

| Garantia | Onde |
| --- | --- |
| Toggle com `aria-expanded` + `aria-controls` + `aria-label` que **muda de texto** (abrir/fechar) | `:100-102` |
| Drawer com **armadilha de foco** — `Tab` preso, `ESC` fecha, foco volta ao toggle | `:72,124-125` via `useFocusTrap` |
| Scrim é `<button>` com `aria-label`, não `div` clicável | `:115-121` |
| Selecionar item **fecha o drawer** antes de navegar | `:82-85` |
| **Scroll do corpo travado** enquanto o drawer está aberto (não vaza rolagem por baixo) | `:75-80`, restaurando o valor anterior |
| Drawer limitado a `max-w-[85vw]` | `:126` — nunca cobre a tela inteira |

O detalhe do `useFocusTrap` (por que `onClose` fica atrás de ref) está em
[[10-seguranca-e-acessibilidade]] §2.4a.

# 5. ⚠️ A altura própria (`minHeight: 100dvh`) e o bug de browser que a originou

```ts
const rootStyle: React.CSSProperties = {
    minHeight: '100dvh',
    background: 'var(--bg-body, var(--theme-body, transparent))',
    ...style,
};
```

`SarakAppChrome.tsx:153-165` — com o motivo escrito no código, e **vale documentar porque é a classe de
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
| scrim do drawer | `var(--sarak-overlay-bg, rgba(0,0,0,0.5))` |
| raio do toggle | `var(--sarak-card-radius, 8px)` |

O fallback existe para o cromo **degradar visivelmente**, nunca colapsar, se o tema não hidratar. O que
sobra de classe Tailwind é **estrutural** (`flex`, `min-w-0`, `shrink-0`, `overflow-auto`) — permitido pela
Regra 2 ([[00-regras-e-invariantes]]).

# 7. Fronteira: o que NÃO está aqui

- **O reflow por dispositivo** (tablet → topbar compacta; celular → hambúrguer + drawer) é decidido em
  `SarakAppChrome.tsx:170-172` mas o **contrato multidispositivo** — breakpoints, `useSarakDevice`, o que
  adapta e o que não adapta — é [[07-responsividade-e-multidispositivo]].
- **O Shell host** é [[04-shell-e-discovery]].
- **Nenhum slot novo é proposto aqui.** Os 8 são o contrato; ampliar é decisão de produto, com o custo de
  ampliar também a regra de degradação (§2.3) e o gate de catálogo.

# 8. Critérios de aceite

- [x] A lacuna que criou o componente está descrita com a causa estrutural, não como "feature nova".
- [x] Os 8 slots estão listados com região, degradação e comportamento de ausência.
- [x] **Provado no gate:** `catalog:check` verde e 8/8 slots publicados no catálogo gerado.
- [x] A regra de geometria (banner primeiro, footer último, full-width) é a mesma nos três modos.
- [x] `decoration` está registrado como ornamento (`aria-hidden` + sem captura).
- [x] O bug de altura está documentado com sintoma, causa e correção.
- [x] A diferença Shell × AppChrome aparece sem ambiguidade.
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
| Todo token de cromo tem consumidor nos DOIS modos | `npm run chrome-token-parity:check` | ✅ gate (`pre-commit`) |
| **Fundo da raiz do cromo**: `background-color` computado com e sem mídia global, em Chromium real contra o `dist/` buildado | `browser-tests/cromo-css-real.spec.ts` | ✅ gate (`npm run cromo-css-real:check`) |
| Os quatro widgets do cromo montados dentro de slots, sem Shell e sem registro | `src/components/atomic/Navigation/__tests__/ShellWidgetsForaDoShell.test.tsx` | ✅ suíte |

⚠️ **Ressalva metodológica herdada** ([[07-responsividade-e-multidispositivo]] §7): teste que usa
`overrideDevice` **não exercita a detecção real** de viewport. A cobertura de colapso acima prova o
*reflow*, não a *detecção*.
