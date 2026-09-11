# Migrações (breaking changes do contrato público)

Registro das mudanças que quebram o contrato de quem já importa a `@sarak/lib-ui-core`,
com o "antes" e o "depois" lado a lado. Uma entrada por mudança, mais recente primeiro.

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
**"Salvar"**, para o usuário final: o tema vai para `sarak.saveTheme`, entra na sessão (aparece em
`allThemes`, então em `TemplatesTab`/`PresetsCatalog`, sem reload) e é entregue a `options.theme.onSave`,
se você configurar essa porta.

**Como ligar a porta.**

```ts
<SarakUIProvider
  options={{
    theme: {
      onSave: async (theme) => {
        // grave onde quiser: arquivo, tabela, localStorage — a lib não pergunta e não sabe.
        await minhaApi.salvarTema(theme); // { id, name, design }
      }
    }
  }}
  customThemes={temasQueEuGuardei} // a LEITURA de volta é esta prop — não existe onLoadThemes
>
```

**O que NÃO existe, de propósito** ([[011-tema-salvo-por-uma-porta-de-escrita]]): não há `onLoadThemes` — a
leitura já é a prop `customThemes`, que você passa na montagem seguinte com o que guardou. Não há
`onDeleteTheme` — a lista de temas salvos é sua, apagar é decisão de quem guarda. Não há editar/renomear um
tema já salvo — apague e salve de novo.

**Sem a porta configurada, o botão "Salvar" não aparece** — nunca um "Salvar" que evapora no reload.
`design` passa por `validateDesign` antes de entrar em `allThemes`, a mesma fronteira de qualquer tema de
origem externa ([[10-seguranca-e-acessibilidade]] §2.1).

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
