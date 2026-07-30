---
tipo: "spec"
titulo: "Shell e Discovery — o modo módulos-plugin, onde a lib é o host"
dominio: "Sarak-Lib-UI-Core / Shell / Discovery"
status: "🟢 Vigente"
prioridade: "Alta"
tags: ["spec", "shell", "discovery", "registry", "modulos-plugin", "navegacao"]
relacionados: ["[[00-regras-e-invariantes]]", "[[01-forma-do-produto-e-modos-de-consumo]]", "[[05-cromo-e-slots]]", "[[07-responsividade-e-multidispositivo]]", "[[005-modelo-modulos-plugin-e-apps-separados]]", "[[001-tres-arquiteturas]]"]
---

# 1. Propósito

O **modo de consumo #1** (módulos-plugin): o consumidor **registra** módulos, e o `SarakShell` — sob o
`SarakUIProvider` — é o **host** que resolve navegação, roteamento e renderiza o módulo ativo. A lib é
dona do layout; o consumidor escreve componentes React comuns.

A decisão de oficializar este modelo está em [[005-modelo-modulos-plugin-e-apps-separados]]; a escolha
entre ele e o modo ui-kit está em [[01-forma-do-produto-e-modos-de-consumo]]. Aqui está **como ele
funciona**.

> ## ⚠️ FATO QUE MUDA O ENQUADRAMENTO (decisão D6, 2026-07-28)
>
> **O `Sarak-MyService` é OBSOLETO.** Ele era o consumidor real que sustentava este modo na regra de
> corte do [[001-tres-arquiteturas]] — *"só permanece o que tem consumidor real provado"*.
>
> Portanto, com honestidade: **o modo #1 existe, funciona e está coberto por teste — e hoje não tem
> consumidor real conhecido.** O único consumidor real vivo (o ERP) usa o modo #3 (ui-kit + cromo
> por-app, [[05-cromo-e-slots]]).
>
> **Esta spec NÃO decide nada sobre o futuro dele.** Manter × depreciar × remover é decisão do dono e
> exige uma varredura de consumidores que esta spec não faz. Registrar o fato é obrigação; decidir por
> conta seria repetir exatamente o erro que esta campanha existe para corrigir — uma spec descrevendo um
> mundo que não é mais o real.

# 2. O contrato de registro

Duas funções, em `src/core/Discovery/registry.ts`:

```ts
registerLocalComponent(id: string, component: React.ComponentType<P>)   // :71-74
registerSarakModule(manifest: SarakModule)                              // :121-130
```

O `SarakModule` (`:23-33`): `id` (obrigatório), `label`, `icon?`, `category?`, `component?`,
`components?`, `priority?`, `description?`, `isLocal?`.

O exemplo mínimo, conferido contra o `README.md:67-79`:

```tsx
import { SarakUIProvider, SarakShell, registerSarakModule, registerLocalComponent } from '@sarak/lib-ui-core';
import { MeuModulo } from './modules/MeuModulo';

registerLocalComponent('meu-modulo', MeuModulo);
registerSarakModule({ id: 'meu-modulo', label: 'Meu Módulo', icon: 'Box' });

ReactDOM.createRoot(document.getElementById('root')!).render(
    <SarakUIProvider>
        <SarakShell />
    </SarakUIProvider>,
);
```

## 2.1 Resolução ESTRITA: id do módulo === chave do componente

`getRegisteredModules()` (`:135-145`) resolve `mod.component || localComponents.get(mod.id)`. **Não há
fuzzy match, nem fallback por label, nem convenção de nome.** O `id` passado em `registerSarakModule` tem
de ser **exatamente** a chave usada em `registerLocalComponent`.

É a decisão certa (ambiguidade em resolução de plugin é fonte inesgotável de bug difícil), mas tem um
custo de DX: um typo no id não dá erro — dá um módulo no menu que renderiza vazio. Daí a validação de §2.2.

## 2.2 Validação: um erro crítico, dois avisos

`validateSarakModule` (`:94-116`):

| Falta | Severidade | Efeito |
| --- | --- | --- |
| `id` | **`console.error` + registro ABORTADO** (`:97-100`) | o módulo não entra; é o único caso fatal |
| `label` | `console.warn` (`:102`) | entra; o menu mostra o `id` como rótulo (`useModuleDiscovery.ts:36`) |
| `icon` | `console.warn` (`:103`) | entra; cai no ícone default `'Box'` (`:37`) |
| componente não encontrado para o `id` | `console.warn` **com a instrução de correção** (`:106-109`) | entra no menu e não renderiza nada |

O aviso do quarto caso cita nominalmente a chamada que falta — é a rede de segurança do typo da §2.1.

**Registro é MERGE, não substituição:** `{ ...existing, ...manifest, isLocal: true }` (`:125`). Registrar
o mesmo id duas vezes complementa o manifesto em vez de sobrescrevê-lo — o que permite registrar
metadados e componente em momentos diferentes do boot.

## 2.3 Discovery passiva

`subscribeToRegistry(listener)` (`:63-66`) devolve a função de cancelamento; toda escrita no registro
notifica (`notifyListeners`, `:56-58`). **Não há polling, não há escaneamento ativo** — o cabeçalho de
`useModuleDiscovery.ts:7-13` registra que o "Active Polling" foi removido: o hook apenas **consome** o
que foi registrado.

`useModuleDiscovery` (`src/shared/hooks/useModuleDiscovery.ts:14-45`) formata a lista: filtra os sem `id`,
ordena por `priority` **decrescente** (`:32`), preenche defaults (`label` ← `id`, `icon` ← `'Box'`,
`category` ← `'Sistema'`, `priority` ← 500) e devolve `[]` enquanto o Provider não hidratou (`:18`).

Uma peculiaridade a saber: existe uma **blacklist de demo** (`grid-system`, `blueprint-test`, `demo-ui`,
`debug-module`) aplicada quando `design.moduleBlacklist !== 'none'` (`:27-29`). Registrar um módulo com
um desses ids faz ele **desaparecer do menu sem aviso**.

# 3. Soberania de instância — o registro vive no `window`

```ts
const _global = (typeof window !== 'undefined' ? window : {}) as unknown as SarakRegistryGlobal;
const registeredModules = _global.__SARAK_REGISTRY_MODS__ || new Map();
_global.__SARAK_REGISTRY_MODS__ = registeredModules;
```

`registry.ts:42-54` — três mapas globais: `__SARAK_REGISTRY_MODS__`, `__SARAK_REGISTRY_COMPS__`,
`__SARAK_REGISTRY_LISTENERS__`.

**O problema que resolve (real, não hipotético):** duas cópias da biblioteca na mesma página — o caso
clássico é `npm link`/`file:` local **mais** uma cópia em `node_modules` — teriam dois módulos ES
distintos, portanto dois registros distintos. O consumidor registraria numa cópia e o Shell leria da
outra: menu vazio, sem erro nenhum. Ancorar no `window` faz as duas cópias compartilharem **um** registro.

**O risco que isso aceita, declarado:**

- **É estado global mutável de página.** Qualquer script da origem pode ler e escrever
  `window.__SARAK_REGISTRY_MODS__` — inclusive apagar módulos.
- **Não sobrevive a SSR** (`typeof window === 'undefined'` cai num objeto descartável, `:45`), então o
  registro é sempre client-side.
- **Não há namespace por instância.** Duas aplicações Sarak na mesma página compartilhariam o registro
  querendo ou não.

A troca é consciente: o modo #1 é para **uma** aplicação por página, e o bug que ele evita é silencioso
enquanto o risco que ele aceita exige código hostil na mesma origem.

# 4. O Shell

`SarakShell` (`src/core/Shell/SarakShell.tsx:54-224`), obrigatoriamente sob `SarakUIProvider`.
Orquestração em `useSarakShell` (`src/core/Shell/useSarakShell.ts`).

## 4.1 Navegação por `design.navigationStyle` — e o que ele REALMENTE aceita

O token `navigationStyle` (`src/core/Design/schema/global.ts:21-34`) tem **enum fechado de TRÊS valores**:

| Valor | Componente | Onde |
| --- | --- | --- |
| `sidebar` (default) | `SidebarNav` | `SarakShell.tsx:107-121` |
| `topbar` | `TopbarNav` | `:180-194` |
| `dock` | `DockNav` | `:164-174` |

Mais o comportamento de **fallback**: `isSidebar` cobre também "nenhum dos outros" (`:81`), então um valor
desconhecido cai em sidebar.

> ### ⚠️ Dívida a registrar: o quarto valor `'glass'` é um ramo INALCANÇÁVEL e perigoso
>
> `SarakShell.tsx:80` calcula `const isGlass = design?.navigationStyle === 'glass'` e usa `isGlass` **só**
> para excluir o fallback de sidebar (`:81`). Consequência aritmética: com `navigationStyle === 'glass'`,
> `isTopbar`/`isDock`/`isSidebar` são **todos falsos** e **nenhuma navegação é renderizada** — a aplicação
> abre sem menu.
>
> Na prática o ramo é inalcançável: `'glass'` **não está** nas `constraints.options` do token, então
> `validateDesign` o **descarta com warn** (`select` fora do enum — ver
> [[10-seguranca-e-acessibilidade]] §2.1b) e o valor cai no default. Ou seja: a trava de segurança do tema
> é o que impede este bug de acontecer.
>
> **Duas coisas erradas ao mesmo tempo:** código morto que só está morto por causa de um gate de outra
> camada, e um comportamento de "nav nenhuma" esperando um dia em que alguém adicione `'glass'` ao enum
> por parecer um estilo faltante. **Não corrigido aqui** (esta spec não altera código); a correção
> honesta é remover `isGlass` — não adicionar o enum.

## 4.2 Roteamento — a lib ESCREVE na URL

Diferente do modo ui-kit, aqui **a lib é dona da URL**:

- `useSarakRouter` (`src/shared/hooks/useSarakRouter.ts`) lê `window.location.pathname`, deriva
  `segments`, e `navigate()` faz `history.pushState`/`replaceState` **+ dispatch manual de `popstate`**
  (`:37-57`) para os próprios listeners reagirem.
- O **módulo ativo é o primeiro segmento** do path: `const activeModuleId = segments[0] || null`
  (`useSarakShell.ts:14`). Deep-link funciona por construção.
- Sem módulo na URL, a ativação inicial escolhe, nesta ordem (`useSarakShell.ts:22-34`):
  `options.theme.defaultModuleId` → um módulo de id `mx-customization`, se registrado → o primeiro da
  lista ordenada.

**Consequência para o host:** um host com router próprio (React Router, TanStack) na mesma página
**disputa o `history`** com o Shell. Não é bug — é o contrato do modo #1. Está registrado também em
[[10-seguranca-e-acessibilidade]] §3.3, porque a frase fácil "a lib nunca controla a URL" é **falsa**
neste modo.

## 4.3 As peças do Shell

| Peça | Papel |
| --- | --- |
| `SidebarNav` / `TopbarNav` / `DockNav` | as três navegações, por `navigationStyle` |
| `ShellContent` | renderiza o módulo ativo (e os contratos visuais dele) |
| `ShellUserWidget` | bloco de usuário/logout no cromo |
| `ShellSearchWidget` + `SarakSearch` | busca global (`SarakShell.tsx:221`, overlay com `isSearchOpen`) |
| `ShellThemeToggle` | alternância de tema |
| `ShellLanguageSelector` | seleção de idioma |
| `IconRenderer` | resolve o `icon` do manifesto para o ícone real |

Todos em `src/core/Shell/Components/`.

**Cromo mobile embutido:** com `sidebar` no celular, o Shell troca a coluna por um **header com
hambúrguer** (`:124-138`) e um **drawer** com a mesma `SidebarNav` reaproveitada e as flags de auto-hide
neutralizadas (`:141-161`). Detalhe de responsividade em [[07-responsividade-e-multidispositivo]].

## 4.4 Resiliência: ErrorBoundary por módulo

`ErrorBoundary` (classe local, `SarakShell.tsx:24-49`) envolve **o conteúdo do módulo**, não a casca
(`:198`). **Falha de um módulo não derruba o Shell:** a navegação continua no ar e o usuário troca de
módulo. `componentDidCatch` loga `[Sarak:Critical] Falha no Módulo` (`:34`).

Há também um `React.Suspense` por dentro (`:199`), que é o que permite módulo carregado por `React.lazy`.

## 4.5 As três guardas — o que cada uma protege

| Guarda | Protege contra | Como |
| --- | --- | --- |
| `useDimensionGuard` (`hooks/useDimensionGuard.ts`) | **renderizar o módulo antes do layout estabilizar** — componentes que medem o container (gráficos, virtualizadores) nasceriam com 0×0 | observa o `contentRef`, só libera `isReady` quando as dimensões param de mudar; tem **timer de fallback** para nunca travar |
| `useShellDiagnostics` (`hooks/useShellDiagnostics.ts`) | perder o diagnóstico do acima | agrega `isReady`/`contentRef`/`dimensions` e é o que o Shell consome (`SarakShell.tsx:73`) — a tela de espera mostra as dimensões medidas (`:210-214`) |
| `useVisualSafetyGate` (`hooks/useVisualSafetyGate.ts`) | **CSS não hidratado** — a lib renderizando sem nenhuma variável de tema (o sintoma "tudo sem estilo") | após 1,5 s lê `--theme-primary` do `documentElement`; se vier vazio, `console.warn` explicando que o tema não hidratou. **Só avisa** — não bloqueia nem corrige |

As duas primeiras são de layout; a terceira é de **diagnóstico de instalação** — ela existe porque
"instalei e ficou sem estilo" era uma classe de suporte recorrente.

# 5. As peças de Discovery que o consumidor pode tocar

| Peça | O que faz | Quando o consumidor toca |
| --- | --- | --- |
| `useModuleDiscovery` | lista formatada dos módulos registrados (§2.3) | para desenhar navegação própria em vez da do Shell |
| `useSarakRouter` | rota nativa por History API (§4.2) | para navegar programaticamente entre módulos |
| `useEndpointResolver` (`src/core/Discovery/hooks/useEndpointResolver.ts`) | resolve o endpoint de um módulo a partir do manifesto dele | quando o módulo tem backend próprio e a URL vem do registro |
| `DynamicRenderer` (`src/core/Discovery/DynamicRenderer.tsx`) | renderiza um componente registrado **por id**, resolvendo do registro | para embutir um módulo dentro de outra tela, fora do Shell |
| `ContractRenderer` / `SarakExpandableMatrixEngine` (`src/core/Discovery/components/`) | renderizam "contratos visuais" declarados pelo módulo | raramente — é a superfície mais interna daqui |

**Na prática, o caminho comum não toca em nenhum deles:** registra dois nomes e monta `<SarakShell />`.
Esta tabela existe para o caso incomum.

# 6. O cromo do Shell consome o Design Engine

Trocar o tema muda a casca: `SidebarNav`/`TopbarNav` consomem os tokens `--sarak-sidebar-*` e
`--sarak-topbar-*` emitidos pela engine, e `useShellLayoutStyles`
(`src/core/Shell/hooks/useShellLayoutStyles.ts`) traduz tokens **estruturais** em classes:

| Token | Efeito estrutural |
| --- | --- |
| `sidebarPosition` (`left`/`right`/`floating`) | direção do flex raiz + borda/flutuação da sidebar (`:12-22`) |
| `navbarLayout` (`sticky`/`inline`/`hidden`) | posicionamento da topbar (`:24-28`) |
| `contentAlignment` (`center`/`stretch`) | largura máxima e padding do conteúdo (`:31-34`) |

É um **Hook Controlador** clássico ([[00-mapa-do-modulo]]): o hardcode estrutural é legítimo ali, fora do
`.tsx` que o auditor varre.

> ### `SarakShell` × `SarakAppChrome` — a diferença tem de ficar cristalina
>
> | | `SarakShell` | `SarakAppChrome` |
> | --- | --- | --- |
> | Natureza | **HOST** | **APRESENTACIONAL** |
> | O que renderiza | o **módulo ativo** vindo do Discovery | o **`children`** que recebeu |
> | Precisa de registro? | **sim** (`registerSarakModule`) | **não** |
> | Quem navega | a própria lib (History API, §4.2) | o **host**, por `onNavigate` |
> | Modo de consumo | #1 (módulos-plugin) | #3 (ui-kit + central) |
>
> Os dois pintam topbar/sidebar com os **mesmos tokens**. A diferença não é visual — é **quem manda**.
> Detalhe do apresentacional em [[05-cromo-e-slots]].

# 7. Dívidas a registrar (nenhuma corrigida aqui)

## 7.1 Registro por EFEITO COLATERAL DE IMPORT — os dois ids legados

`src/index.ts:119-125`:

```ts
import { registerLocalComponent } from './core/Discovery/registry';
import { CustomizationPanel } from './features/DesignEngine/Library/CustomizationPanel';
registerLocalComponent('mx-customization', CustomizationPanel);
registerLocalComponent('personalization', CustomizationPanel);
```

**O que isto faz:** todo consumidor que importa **qualquer coisa** do barril público registra, sem pedir,
dois componentes locais — ambos apontando para o mesmo `CustomizationPanel`. Efeitos:

1. **`import` com efeito colateral no registro global.** Importar um átomo escreve no `window`.
2. **Os dois ids ficam disponíveis para registro de módulo** — se o consumidor fizer
   `registerSarakModule({ id: 'mx-customization', … })`, o painel aparece no menu sem que ele tenha
   escrito componente algum. É até conveniente, e é totalmente implícito.
3. **`mx-customization` tem tratamento privilegiado no roteamento** (§4.2): sem módulo na URL e sem
   `defaultModuleId`, o Shell procura justamente por ele antes de cair no primeiro da lista
   (`useSarakShell.ts:30-32`).
4. **Agrava a dívida de bundle** — o `CustomizationPanel` já está eager no barril
   ([[01-gates-e-baseline]] §4.5 item 3), e este import garante que ele **nunca** possa ser removido por
   tree-shaking: um efeito colateral top-level é, por definição, não-eliminável.

**PERGUNTA ABERTA PARA O DONO (não decidida aqui):** manter os dois ids legados, manter apenas
`mx-customization`, ou remover ambos e exigir registro explícito? Remover é **breaking change** para quem
depende do id implícito; manter perpetua um efeito colateral de import. A decisão pertence ao pacote de
limpeza de contrato público ([[00-prompts-execucao]] Campanha 2, Fase C, decisão D12).

## 7.2 O ramo `'glass'` inalcançável

Ver §4.1. Código morto cuja morte depende de um gate de outra camada.

## 7.3 Ghost vars no cromo do Shell — nenhum gate os vê

`SidebarNav.tsx:142` consome `--sarak-sidebar-active` e `TopbarNav.tsx:123-124` consome
`--sarak-topbar-active`; a engine emite `--sarak-sidebar-active-color` e `--sarak-topbar-active-color`
(`schema/navigation.ts:97,162`). **Os consumos não resolvem** — o realce de item ativo depende de
fallback. E `auditor_ghostvars` **não varre `src/core/`**, então isto está verde em gate e quebrado no
código. Detalhe em [[01-gates-e-baseline]] §4.3b.

# 8. Critérios de aceite

- [x] O exemplo mínimo da §2 roda como escrito — conferido contra `README.md:67-79`.
- [x] O contrato de registro, a resolução estrita e as 4 severidades de validação têm `arquivo:linha`.
- [x] As variantes de `navigationStyle` foram **confirmadas no enum do token**, não copiadas de spec
      antiga — e o quarto valor que aparecia na descrição do plano está registrado como ramo morto.
- [x] A obsolescência do `Sarak-MyService` está registrada como **fato**, sem decisão sobre o futuro do
      modo #1.
- [x] A diferença Shell (host) × AppChrome (apresentacional) está explícita.
- [x] Nenhuma menção a manifesto, `ShellRouterNode` ou renderizador declarativo.
- [x] Os dois ids legados estão documentados com a pergunta aberta, não resolvidos.

# 9. Plano de testes (Quality Gate)

| Verificação | Onde | Situação |
| --- | --- | --- |
| Registro, merge e resolução estrita; validação (erro sem `id`, warns) | `src/core/Discovery/__tests__/registry.test.ts` | ✅ suíte |
| Renderização de componente registrado por id | `src/core/Discovery/__tests__/DynamicRenderer.test.tsx` | ✅ suíte |
| Shell renderiza o módulo ativo e sobrevive à falha dele | `src/core/Shell/__tests__/SarakShell.test.tsx` | ✅ suíte |
| Orquestração (módulo ativo, agrupamento, ativação inicial) | `src/core/Shell/__tests__/useSarakShell.test.ts` | ✅ suíte |
| Guardas de dimensão e de segurança visual | `src/core/Shell/hooks/__tests__/` (5 arquivos) | ✅ suíte |
| Tokens estruturais → classes do Shell | `src/core/Shell/hooks/__tests__/useShellLayoutStyles.test.ts` | ✅ suíte |
| **Discovery passiva** (formatação, ordem por prioridade, blacklist) | — | ❌ **SEM TESTE** |
| **Rota nativa** (segmentos, `navigate`, `popstate`) | — | ❌ **SEM TESTE** |

> ### ⚠️ LACUNA GRAVE: `src/shared/` está FORA do escopo do gate de cobertura
>
> `useModuleDiscovery.ts` e `useSarakRouter.ts` moram em `src/shared/hooks/` — que **não tem pasta
> `__tests__` nenhuma** (`find src/shared -type d -name __tests__` = vazio). E `auditor_coverage` está
> **verde**, porque ele varre apenas `src/components`, `src/features` e `src/core`
> (`auditor_coverage.mjs:52-60`). `src/shared/` inteiro é invisível para o gate: 3 arquivos sem teste
> (os dois hooks + `services/api.ts`).
>
> **Por que isto importa aqui em especial:** esses dois hooks são o **coração do modo #1**. A derivação do
> módulo ativo a partir da URL e a escrita no `history` (§4.2) — o comportamento mais frágil e mais
> acoplado a browser de todo o modo — não têm um único teste, e nenhum gate reclama.
>
> É a mesma classe de defeito da lacuna do `auditor_ghostvars` ([[01-gates-e-baseline]] §4.3): **escopo do
> auditor menor que o alcance da regra** → gate verde, regra violada. Registrado também em
> [[11-testes-e-cobertura]]; a correção (ampliar o escopo **e** escrever os testes) é spec própria.

**Outra lacuna, menor:** não há teste que prove o comportamento do Shell com `navigationStyle` inválido
(§4.1) — hoje a prova de que `'glass'` nunca chega é indireta, via o teste de `validateDesign`.
