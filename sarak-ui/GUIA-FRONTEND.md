# Guia de Frontend — escrevendo telas com a `@sarak/lib-ui-core`

> **O que é este documento:** o **guia único de autoria** do frontend de um sistema que importou a
> biblioteca. Cobre as **4 topologias** de projeto e **todos os casos** de autoria. Ele é feito para
> ser **incorporado ao seu projeto** (mova-o para `specs/`) — vira a decisão estrutural "é assim que
> este sistema escreve frontend".
>
> **Como ele se mantém em dia:** a prosa (regras, topologias, procedimentos) é estável; **toda lista**
> — componentes, props, tokens, ícones, contrato de responsividade — vive no `catalog.json` ao lado e
> no **Apêndice A**, gerados do código-fonte da versão instalada. Se o guia e o catálogo divergirem,
> **o catálogo vence**.

---

## O modelo mental em 4 frases

1. A biblioteca é uma **base de frontend**: um `SarakUIProvider` (o contexto), um **Design Engine
   central** (a central de tema/layout) e uma coleção de **componentes React** prontos.
2. Tudo que é pintado por **tokens públicos** `var(--sarak-*)` responde à central — trocar o tema
   repinta **todas as telas** do sistema, inclusive as que você escreveu.
3. Você escreve **React normal**. Não existe "programar em JSON": telas, dados, rotas e regras de
   negócio são seu código.
4. O que a biblioteca não tiver, você cria — **com tokens**, para continuar temável. Marcação com
   valor cru (`#3b82f6`, `16px`) funciona, mas fica **fora** da central para sempre.

---

# §0 — Como agir em QUALQUER necessidade

Esta seção existe porque nenhum guia consegue enumerar o infinito. Em vez de listar todos os casos,
ela dá um **procedimento**, um **fallback** e um **loop**. Comece sempre por aqui.

## 0.1 Árvore de decisão — "preciso de X, vou para Y"

| Preciso… | Vá para |
| --- | --- |
| instalar e acoplar a base pela primeira vez | [§1 Início](#1--início-instalar-e-acoplar) |
| decidir como organizar o projeto (1 app? vários? deploys separados?) | [§2 As 4 topologias](#2--as-4-topologias) |
| saber qual gerenciador de pacotes usar (npm/pnpm/yarn), ou atualizar a lib | [§2.6](#26-gerenciador-de-pacotes--a-lib-não-escolhe-o-seu) e [§2.7](#27-ficar-sabendo-que-saiu-versão-nova) |
| usar um componente que a lib já tem | [§3.1](#31-o-componente-existe--use-do-barril) |
| montar algo que a lib **não** tem | [§3.2](#32-falta-um-componente--react-próprio-com-tokens-ou-demanda) |
| mudar a cor/fonte/raio de **um** elemento específico | [§3.3 A escada da personalização pontual](#33-personalização-pontual--a-escada) |
| tratar carregando / erro / vazio numa tela | [§3.4](#34-estados-de-tela--sempre-os-três) |
| colocar um ícone | [§3.5](#35-ícones--só-nomes-do-catálogo) |
| criar um componente meu que **siga o tema** | [§3.6](#36-componente-próprio-temável) |
| buscar dados, montar formulário, tratar evento | [§3.7](#37-dados-formulários-e-eventos--é-o-seu-react) |
| saber **tudo** que a lib oferece | [§3.8](#38-extrair-todas-as-funcionalidades--o-catálogo-vivo) |
| definir/trocar o tema do sistema | [§3.9](#39-tema--json--design-engine-central) |
| fazer a tela funcionar em celular/tablet | [§3.10](#310-multidispositivo--o-contrato-de-responsividade) |
| pôr imagem, vídeo ou animação no layout | [§3.11](#311-imagem-animação-e-conteúdo-custom-no-layout--dois-níveis) |
| definir nome da aba, favicon, marca do produto | [§3.12](#312-identidade-da-página--é-sua-sempre) |
| isolar apps, evitar acoplamento entre módulos | [§3.13](#313-estrutura-e-isolamento) |
| copiar um esqueleto pronto e adaptar | [§4 Templates](#4--templates-copiáveis) |
| pedir algo que falta **na biblioteca** | [§5 Quando abrir demanda](#5--quando-abrir-demanda-na-biblioteca) |

## 0.2 A regra de fallback universal

**Sua necessidade não está na tabela acima?** Desça esta escada e pare no primeiro degrau que servir.
Ela responde a qualquer caso, inclusive os que ninguém previu:

1. **É um componente que a lib já tem?** → importe do barril (`catalog.json` → `components` diz se
   existe). Componha à vontade — você não é obrigado a usar do jeito "esperado".
2. **Não é da lib, mas é um elemento SEU?** → escreva React próprio **usando os tokens públicos**
   `var(--sarak-*)`. Continua temável, continua sob a central. Isto é liberdade sua, não gambiarra.
3. **É um lugar só, e de propósito diferente do tema?** → **sobrescrita LOCAL** (a escada da §3.3).
   Um lugar = local. O **mesmo** override repetido em muitos lugares = variação faltando → degrau 4.
4. **A biblioteca deveria fazer isso e não faz?** → **abra demanda na biblioteca** (§5). Nunca
   contorne com um patch no seu projeto: defeito da lib se corrige **na lib**.

**A regra negativa que sustenta tudo:** hardcode fora do contrato de tokens **não é tematizado, para
sempre**. Ele não quebra nada hoje — e é exatamente por isso que é perigoso: a tela fica órfã da
central em silêncio, e ninguém descobre até alguém trocar o tema.

## 0.3 Reporte o buraco

Se a sua necessidade **não está no guia** E o fallback acima **não resolve limpo**, isso não é um
problema seu — é uma **lacuna deste guia**. Reporte, com a necessidade concreta descrita.

O guia se completa por **uso real**, não por decreto: cada buraco reportado vira uma seção nova (ou
um template novo) na próxima versão do kit. Enquanto isso, a regra de fallback segura o caso.

---

# §1 — Início: instalar e acoplar

## 1.1 Instalar

```bash
# garanta um package.json na raiz do diretório-alvo ANTES de instalar
npm init -y                      # só se ainda não existir
npm install @sarak/lib-ui-core   # ou o spec git/registry que a sua organização usa
```

> **Por que o `npm init -y` importa:** sem um `package.json` local, o `npm install` sobe a árvore de
> diretórios, encontra um `package.json` ancestral e instala **lá** — em silêncio, poluindo um projeto
> alheio. É um erro real, já observado, e sem mensagem nenhuma.

O caminho assistido é `npx sarak-ui init`, que grava as `peerDependencies`, gera o starter e copia
este kit. Detalhes e flags na skill (`sarak-ui/skill/`).

**CSS:** no Modo App o estilo é injetado automaticamente pelo import do pacote — nada a fazer. No
**Modo Embarcado** (uma ilha da lib dentro de um frontend que já existe), importe a variante escopada
`@sarak/lib-ui-core/sarak-scoped.css` e **nunca** o CSS global.

## 1.2 O acoplamento mínimo

Todo consumo, em qualquer topologia, tem a mesma raiz: **um `SarakUIProvider` envolvendo a árvore**.

```tsx
import { SarakUIProvider, SARAK_REFERENCE_THEMES } from '@sarak/lib-ui-core';

const TEMAS = SARAK_REFERENCE_THEMES;   // ponto de partida completo — veja §3.9

export function App() {
  return (
    <SarakUIProvider customThemes={TEMAS} initialTheme={TEMAS[0].id}>
      {/* suas telas */}
    </SarakUIProvider>
  );
}
```

A partir daí, três peças **opcionais** e independentes:

| Peça | O que dá | Quando usar |
| --- | --- | --- |
| **`SarakAppChrome`** | topbar/sidebar temáveis, navegação com ícone e drawer no celular; o consumidor controla as rotas | Quase sempre. É o cromo por-app: cada app renderiza o seu. |
| **`SarakCustomizationPanel`** | o **Design Engine** — a central onde se troca tema/template e se exporta o JSON | Numa rota tipo `/design`, para quem administra a aparência. |

O consumidor mantém o próprio roteador e a própria estrutura em todas as quatro topologias. O cromo
recebe os itens de navegação em `navItems` e entrega a rota selecionada por `onNavigate`.

---

# §2 — As 4 topologias

A pergunta que decide tudo: **quantos `SarakUIProvider` a sua aplicação tem em execução ao mesmo
tempo, e eles compartilham a mesma origem (protocolo + domínio + porta)?**

| Topologia | Apps em execução | Provider | Cromo | Tema consistente por… | Troca de tema em runtime cruza os apps? |
| --- | --- | --- | --- | --- | --- |
| **1. Monolito** | 1 | 1 na raiz | 1 na casca | trivial (é um app só) | — |
| **2. Monorepo** | N (cada um sobe sozinho) | 1 **por app** | 1 **por app** | **código compartilhado** (pacote `ui-kit`) | só se mesma origem (§2.5) |
| **3. Monolito modular** | N compostos, **1 deploy** | 1 **por app** | 1 **por app** | código compartilhado | **sim** — mesma origem por construção |
| **4. Microsserviço** | N deploys independentes | 1 **por serviço** | 1 **por serviço** | **pacote de tema versionado** | só se mesma origem; senão, compile-time |

## 2.1 Monolito — uma SPA única

Um `SarakUIProvider` na raiz, tudo embaixo dele. O cromo e a rota do Design Engine ficam na casca.

```tsx
<SarakUIProvider customThemes={TEMAS} initialTheme={TEMAS[0].id}>
  <SarakAppChrome brand={{ name: 'Meu Sistema' }} navItems={NAV} onNavigate={navegar}>
    <MinhaRota />
  </SarakAppChrome>
</SarakUIProvider>
```

O `SarakAppChrome` fornece a navegação visual; o roteador da aplicação escolhe e renderiza cada tela.

## 2.2 Monorepo — vários apps no mesmo repositório

Cada app tem **o seu** Provider e **o seu** cromo (eles não se veem em runtime). O que os mantém
idênticos é **código compartilhado**, num pacote interno — chame-o de `ui-kit`:

```
packages/ui-kit/           ← depende de @sarak/lib-ui-core
  ├─ themes.ts             ← os temas do sistema (JSON como código)
  ├─ nav.ts                ← os itens de navegação, definidos UMA vez
  └─ index.ts              ← export * from '@sarak/lib-ui-core' + os seus
apps/app-a/  apps/app-b/   ← dependem de ui-kit, nunca da lib direto
```

Regras que fazem essa forma funcionar:

- **Uma única cópia da lib**, no `ui-kit`. Duas cópias = dois contextos React = tema aplicado pela
  metade.
- **`export * from '@sarak/lib-ui-core'` no `index.ts` do `ui-kit` não custa nada** no bundle
  (medido: saída byte a byte idêntica a reexportar só o que se usa). A "porta única" é de graça.
- Os apps importam **do `ui-kit`**, nunca da lib direto — assim o dia em que houver um wrapper
  próprio, nada muda no chamador.
- Dependência interna por `file:`/workspace conforme a sua ferramenta. Atenção: com `file:`, o npm
  **copia** o pacote para o store — depois de rebuildar o `ui-kit`, reinstale para o app enxergar.

Veja `templates/ui-kit/` para a forma completa.

## 2.3 Monolito modular — apps compostos, deploy único

Igual ao monorepo em código; a diferença é que tudo é servido pela **mesma origem**. Isso libera algo
que as outras topologias não têm de graça: a **troca de tema em runtime cruza os apps**.

O Provider persiste a seleção do usuário em `localStorage` e, por padrão, sincroniza entre abas/apps
que compartilham a mesma chave:

```tsx
<SarakUIProvider
  customThemes={TEMAS}
  initialTheme={TEMAS[0].id}
  options={{ persistence: { storageKey: 'meu-sistema:design', crossTabSync: true } }}
>
```

Use **a mesma `storageKey` em todos os apps**. O tema *default* já é consistente pelo código
compartilhado; a `storageKey` comum é o que faz a **escolha do usuário** atravessar.

## 2.4 Microsserviço — deploys independentes

Cada serviço tem o seu frontend, o seu Provider e o seu cromo. A consistência visual vem de um
**pacote de tema versionado** (compile-time): publique `themes.ts`/`nav.ts` como pacote e faça todos
dependerem da mesma versão.

**Ressalva explícita de mesma-origem:** `localStorage` é por origem. Serviços em domínios ou portas
diferentes **não** compartilham a seleção de tema em runtime — cada um começa no default do pacote.
Para propagar de verdade entre origens, o transporte é seu (um cookie de domínio-pai, um endpoint de
preferências do usuário, um parâmetro na navegação): leia o valor e passe em `activeThemeId`.

## 2.5 Regra única para lembrar

> **Código compartilhado resolve o tema *default*. Mesma origem resolve a *troca em runtime*.**
> Se você precisa das duas coisas e as origens são diferentes, o transporte entre origens é do
> importador — a lib não inventa rede.

## 2.6 Gerenciador de pacotes — a lib não escolhe o seu

**npm, pnpm e yarn são todos suportados.** O `init` detecta qual é o seu (pelo campo
`packageManager` do `package.json` e, na falta dele, pelo lockfile presente) e gera os comandos
daquele gerenciador. O `check` também: a mensagem de atualização sempre traz o comando certo para
o seu projeto.

**Em monorepo, os comandos de instalação e atualização rodam da RAIZ do workspace**, com o filtro do
pacote — não de dentro do pacote. Rodar o gerenciador errado dentro de um workspace de outro
gerenciador **quebra a instalação**: ele entra no armazenamento interno do outro e tenta executar
scripts de pacotes de terceiros. Isso não é teoria — é um erro real, já observado.

⚠️ **Dois lockfiles = armadilha.** Se o repositório tiver, por exemplo, `pnpm-lock.yaml` **e** um
`package-lock.json` esquecido, qualquer comando `npm` acidental vai usar o resíduo. O `check` avisa
quando detecta essa ambiguidade. Apague o lockfile que não é do seu gerenciador.

**Sobre `npm workspaces` especificamente:** eles quebram binários locais no Windows (achado real de
instalação). **Isso é sobre npm workspaces, não sobre monorepo** — workspaces de **pnpm** e **yarn**
são suportados e são a forma normal das topologias 2, 3 e 4 acima.

## 2.7 Ficar sabendo que saiu versão nova

A lib **avisa no seu terminal** — você não precisa lembrar de conferir:

```bash
npx sarak-ui check --notify
```

Em dia, ele **não imprime nada**. Quando há versão nova, imprime um bloco com as duas versões e **o
comando exato** para o seu gerenciador. Sai sempre com código 0: um aviso nunca derruba o seu `dev`.
Sem rede, também fica em silêncio.

O `init` já liga isso como `predev`, então o aviso aparece a cada `npm run dev`. **Se o seu projeto
não veio do `init`** (ou já tinha um `predev`), encadeie à mão no pacote que roda o `dev`:

```json
"predev": "node scripts/o-que-voce-ja-fazia.mjs && node node_modules/@sarak/lib-ui-core/bin/sarak-ui.mjs check --notify"
```

> **Em monorepo, atenção a QUEM roda o `dev`.** Quem declara a dependência (o pacote de UI
> compartilhada) muitas vezes não é quem roda o servidor de desenvolvimento (a raiz, ou cada app).
> O `predev` tem de ficar em **quem roda o `dev`** — o comando funciona de qualquer diretório do
> workspace, porque ele procura o pacote e o lockfile subindo a árvore.

Para um veredito sob demanda, sem o modo silencioso: `npx sarak-ui check`.

## 2.8 Atualizar de verdade — `sarak-ui update`

O `check` só avisa. Quem age é o `update` — ele roda o comando REAL do seu gerenciador (não imprime
uma sugestão para você copiar) e, ao final, re-sincroniza o kit `sarak-ui/` sozinho:

```bash
npx sarak-ui update
```

**Sem `--latest`, ele NUNCA atravessa um major.** Se a versão mais nova publicada estiver fora da
faixa que você escreveu no `package.json` (ou, sem faixa nenhuma, fora do major que você já tem
instalado), o comando simplesmente diz que você já está atualizado — do jeito seguro.

**Atravessar um major é decisão sua, e o comando mostra o preço antes de cobrar:**

```bash
npx sarak-ui update --latest
```

Ele imprime quantos majors você vai pular e as entradas de `docs/migracoes.md` publicadas depois da
sua versão instalada — **antes** de perguntar "confirmar?". Só depois da sua resposta (`s`/`sim`) é
que a faixa do `package.json` é reescrita para o novo major e o comando de reinstalação roda de
verdade. `--yes` pula a pergunta (para automação que já leu as notas fora daqui); sem ele e sem
terminal interativo, o comando falha em voz alta em vez de atravessar um major sem confirmação.

> ⚠️ **Sem `docs/migracoes.md` ancorando a SUA versão instalada, o corte "entre a instalada e a mais
> nova" não pode ser medido** — o comando avisa disso e mostra TODAS as notas registradas, em vez de
> fingir um intervalo que não conferiu.

O `update` funciona nos dois modos de dependência: git (`github:…#semver:`) e `file:`/`link:`
(desenvolvimento lado a lado) — no segundo, `--latest` não se aplica (não há major para pular), e o
comando só refaz o link/cópia do gerenciador de verdade.

---

# §3 — Casos de autoria

## 3.1 O componente existe → use do barril

```tsx
import { SarakButton, SarakCardGrid, SarakDataTable } from '@sarak/lib-ui-core';
```

Confira nome e props em `catalog.json` → `components` (ou no Apêndice A). **Você tem liberdade total
de composição** — se a tabela não serve para a sua tela, troque por cards; se o card não serve,
componha dois componentes. Não existe uso "errado" desde que o resultado use tokens.

## 3.2 Falta um componente → React próprio com tokens, ou demanda

Duas saídas legítimas, nesta ordem de preferência:

**Opção A — escreva o componente, com tokens.** É o caminho normal e não precisa de permissão de
ninguém. Veja §3.6 para a forma.

**Opção B — abra demanda na lib** quando o que falta é claramente **infraestrutura de design system**
(um átomo que todo mundo vai reescrever, um comportamento que a lib promete e não entrega). Veja §5.

**O que NUNCA fazer:** montar o elemento com valores crus fora do contrato de tokens. Funciona hoje,
e fica fora da central para sempre.

## 3.3 Personalização pontual → a escada

"Quero **este** card com a cor de destaque", "quero **este** título maior". Isso é **liberdade sua**,
não gambiarra — gambiarra é tapar buraco da lib; personalizar um elemento seu é o seu trabalho.

Desça a escada, da mais temável à mais fixa, e pare no primeiro degrau que resolve:

| # | Como | Continua seguindo o tema? |
| --- | --- | --- |
| 1 | **Prop do componente** (`variant`, `size`, `color`…), se existir — veja as variantes no catálogo | ✅ totalmente |
| 2 | **Sobrescrever o TOKEN localmente**, num wrapper: `<div style={{ ['--sarak-card-bg' as string]: 'var(--sarak-accent-color)' }}>` | ✅ o elemento passa a seguir **outro** token do tema |
| 3 | **`style`/`className` com VALOR DE TOKEN**: `style={{ color: 'var(--sarak-title-color)' }}` | ✅ one-off ainda temável |
| 4 | **`style` com valor FIXO**: `style={{ color: '#c026d3' }}` | ❌ nunca mais muda com o tema — ok se for a intenção |

**A régua:** **um** lugar = sobrescrita local, sem culpa. O **mesmo** override em **muitos** lugares =
sinal de variação faltando → vire uma prop no seu componente, ou uma demanda na lib (§5).

## 3.4 Estados de tela → sempre os três

Toda tela que busca dados tem **três** estados, não um. Trate sempre os três:

| Estado | Como |
| --- | --- |
| **carregando** | um skeleton da lib (procure `Skeleton` no catálogo) ou seu, com tokens |
| **erro** | mensagem + ação de repetir. Nunca uma tela em branco. |
| **vazio** | um estado vazio explícito, com o que fazer a seguir — não é o mesmo que carregando |

`templates/tela-exemplo.tsx` traz os três montados.

## 3.5 Ícones → só nomes do catálogo

```tsx
import { SarakIcon } from '@sarak/lib-ui-core';
<SarakIcon name="FileText" />
```

- A lista válida está em `catalog.json` → `tokens.iconNames` (e no Apêndice A).
- O **mesmo nome** vale nas três famílias de ícone — trocar a família pelo tema repinta tudo sem
  mexer em nome nenhum.
- Nome fora da lista: `console.warn` (uma vez por nome) + ícone de alerta no lugar. Degrada visível,
  não quebra a tela. **Não invente nomes.**
- Não importe barril de biblioteca de ícone com acesso dinâmico (`Icons[nome]`): impede tree-shaking
  e engorda o bundle em centenas de KB. Use `SarakIcon`.

## 3.6 Componente próprio temável

A regra única: **estilize por `var(--sarak-*)`**, com fallback. É isso que faz a central alcançar o
seu componente.

```tsx
export function MeuPainel({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section
      style={{
        background: 'var(--sarak-card-bg, transparent)',
        border: 'var(--sarak-card-border, none)',
        borderRadius: 'var(--sarak-card-radius, 8px)',
        padding: 'var(--sarak-card-padding-md, 16px)',
        gap: 'var(--sarak-layout-gap-md, 16px)',
      }}
    >
      {/* A cor do texto comum é herdada do escopo pintado pelo Provider — não force. */}
      <h2 style={{ color: 'var(--sarak-title-color, inherit)' }}>{titulo}</h2>
      {children}
    </section>
  );
}
```

- Os nomes reais estão em `catalog.json` → `tokens.cssVars`. **Nome fora dessa lista não existe e não
  pinta nada** — a var simplesmente não resolve e o fallback fica valendo para sempre.
- Sempre com fallback (`var(--x, valor)`): a tela nunca fica sem estilo se um token não estiver
  emitido naquele contexto.
- Vale para espaçamento e raio também, não só cor — é o que faz o "template" do tema (compacto,
  arredondado, denso) alcançar o seu componente.
- Componente pesado seu (gráfico, editor, visualizador): coloque atrás de `React.lazy` + `import()`,
  como a lib faz com os dela. É o que mantém o carregamento inicial pequeno.

## 3.7 Dados, formulários e eventos → é o seu React

A biblioteca **nunca chama rede sozinha**. Buscar, enviar, validar regra de negócio e navegar são
seu código: seus hooks, seu cliente HTTP, seu roteador.

- A lib dá os **inputs** e o **feedback visual** (estados de foco/erro, toasts, modais). A lógica é sua.
- Consuma **a `api/` do seu próprio módulo** — nunca um endpoint de outro módulo direto, nunca o
  banco de outro dono. Isso é o que mantém os módulos desacopláveis (§3.13).
- Formulário: estado no seu componente (ou na sua lib de formulário preferida); os componentes de
  input da lib são controlados por props, como qualquer input React.

## 3.8 Extrair TODAS as funcionalidades → o catálogo vivo

**Nunca responda "o que a lib tem?" de memória.** Leia `catalog.json`:

| Chave | O que responde |
| --- | --- |
| `components` | todo componente público, com props, tipo e descrição |
| `barrelExports` | todo nome importável de `@sarak/lib-ui-core` (inclui tipos e helpers) |
| `tokens.cssVars` | as CSS Variables que a central realmente emite |
| `tokens.spacing` | os tokens semânticos de espaçamento aceitos em `gap`/`padding` |
| `tokens.variants` | os valores literais aceitos por cada prop de variante |
| `tokens.iconNames` | os nomes de ícone válidos |
| `designTokens.ids` | as chaves válidas de `design` num tema JSON, com tipo |
| `themes.presetIds` | os temas embutidos |
| `responsive` | o contrato de responsividade: breakpoints, o que adapta sozinho, o que aceita refino |
| `chromeSlots` | as regiões do cromo que aceitam conteúdo seu |
| `shippedDocs` | os guias completos que viajam no pacote |

O Apêndice A deste arquivo é a mesma informação em forma de leitura. Para props com tipo completo,
o pacote também traz `docs/component-catalog.md`.

## 3.9 Tema → JSON + Design Engine central

**Um tema é um objeto JSON**: `{ id, name, description, design }`, onde `design` é um mapa
`tokenId → valor`.

```tsx
import { SarakUIProvider, sarakDeriveThemeFromReference } from '@sarak/lib-ui-core';

// Derive de um tema COMPLETO e troque poucos valores — a customização vale nos dois modos.
const TEMAS = [
  sarakDeriveThemeFromReference('minimalist-airy', {
    id: 'marca-claro', name: 'Marca (claro)',
    design: { primaryColor: '#2563eb', accentColor: '#2563eb' },
  }),
  sarakDeriveThemeFromReference('sarak-sovereign', {
    id: 'marca-escuro', name: 'Marca (escuro)',
    design: { primaryColor: '#38bdf8', accentColor: '#38bdf8' },
  }),
];
```

- **Nunca monte um tema do zero** com um punhado de chaves de cor: eixos omitidos (fonte, cromo,
  raio, espaçamento) simplesmente não mudam, e o sintoma vira "troquei o tema e a fonte continuou
  igual". Derive de um id de `SARAK_REFERENCE_THEMES` (o par completo) ou de `themes.presetIds`.
- **Derivar é uma chamada, não uma cópia de campo.** `sarakDeriveThemeFromReference` devolve o tema completo —
  `design` **e** `contraparte` — e aplica a customização nos dois modos. Espalhar `{ ...ref.design, … }`
  perde a contraparte, e a troca de claro/escuro passa a degradar em silêncio.
- **Qual tema está ativo** — três caminhos, não confunda:
  | Prop | Comportamento |
  | --- | --- |
  | `activeThemeId` | **controlado**: sempre vence e reaplica a cada mudança. Use quando o app decide (por cliente/config). |
  | `initialTheme` | **semente**: só semeia o primeiro carregamento; o usuário troca depois e não é forçado de volta. É a opção segura. |
  | nenhum dos dois | cai no default de `options.theme.defaultTheme` ou no primeiro tema global. |
- **A central** é o `SarakCustomizationPanel`: monte-o numa rota sua (`/design`, por exemplo) ou, no modelo
  host, use o módulo nativo que a base já registra. Ele ajusta tokens ao vivo e **exporta o JSON**
  completo — "salvar tema" **é** exportar e colar num arquivo do seu repositório.
- **Persistência sem backend:** a seleção do usuário vai para `localStorage` sozinha. Quer guardar no
  seu backend? Use `options.persistence.onSave`/`onLoad` ou `onThemeChange` — a lib entrega o payload,
  quem faz a chamada é você. **O formato do dado, o schema de referência (Postgres e SQLite) e um
  exemplo de ligação completo estão em `docs/persistencia-de-tema.md`** — leia antes de desenhar a
  sua tabela: ele explica por que o estado aplicado e os temas criados são duas entidades diferentes,
  por que o JSON é opaco (guarde byte a byte) e por que os 23 temas embarcados nunca entram na sua
  tabela. **O tema padrão pinta antes do persistido, num navegador sem cache?** É o mesmo documento,
  seção "O primeiro paint" — as três saídas (injetar `config` no HTML servido, `strictBackendSync`,
  ou aceitar) e a precedência real entre `config`/`localStorage`/semente.
- **Validação por construção:** todo tema (de arquivo, de `localStorage` ou exportado) é validado no
  load contra o schema de tokens: chave desconhecida ou valor de tipo errado vira `console.warn` e é
  **descartado**, nunca CSS cru. Se um ajuste seu "não pegou", o console diz por quê.

## 3.10 Multidispositivo → o contrato de responsividade

**É zero-config.** Você **não escreve CSS nem media query** para as telas funcionarem em
celular/tablet/desktop: o cromo e as primitivas de layout leem o dispositivo sozinhos.

- Os breakpoints e a lista do que adapta automaticamente estão em `catalog.json` → `responsive`
  (e no Apêndice A, seção A.2). Em resumo: o cromo colapsa em drawer no celular, as primitivas de
  layout viram uma coluna / quebram linha, e os componentes densos colapsam para cards.
- **Refino opcional:** onde quiser controlar por dispositivo, passe um `SarakResponsiveValue<T>` —
  `{ mob, tab, desk }` — nas props que o aceitam (a lista está em `responsive.responsiveProps`).
- Para ler o dispositivo no seu código: `useSarakDevice()` → `'smartphone' | 'tablet' | 'desktop'`.
  Para ocultar por dispositivo sem CSS: `<SarakHidden on={['smartphone']}>`.
- **Nunca hardcode largura de tela** no seu código: os limiares são tokens do tema.
- Se um componente **seu** estoura no celular, o problema é do seu componente — use as primitivas de
  layout da lib em vez de `grid-template-columns` fixo.

## 3.11 Imagem, animação e conteúdo custom no layout → dois níveis

| | **(a) Fundo/atmosfera global** | **(b) Conteúdo por região** |
| --- | --- | --- |
| Onde aparece | atrás de **toda** a aplicação | numa **região do cromo** |
| Como se define | **dado**: tokens do tema (ou pela central, sem código) | **props `ReactNode`** no `SarakAppChrome` |
| Quem troca | quem troca o tema — atinge todas as telas | o código do app que monta o cromo |
| Use para | ambiente, marca d'água, vídeo de fundo do produto | banner, rodapé, cabeçalho de menu, logo animado, arte só do cromo |

Os **slots** disponíveis estão em `catalog.json` → `chromeSlots` (Apêndice A, seção A.3). Todos são
opcionais e aditivos: ausente = região não renderizada, sem espaço morto. Eles refluem sozinhos no
celular (faixas acompanham a largura; regiões de menu migram para o drawer).

```tsx
<SarakAppChrome
  brand={{ name: 'Meu Sistema' }}
  navItems={NAV}
  onNavigate={navegar}
  banner={<img src="/campanha.gif" alt="Campanha" />}
  footer={<Rodape />}
>
  <MinhaTela />
</SarakAppChrome>
```

O conteúdo é 100% seu — a lib dá a **região**, não presume o que vai dentro. Estilize-o com tokens
(§3.6) para ele acompanhar a troca de tema. O guia completo dos dois níveis viaja no pacote:
`docs/extensibilidade-de-layout.md`.

## 3.12 Identidade da página → é sua, sempre

Nome da aba, favicon e marca do produto são **do importador**. A biblioteca **não** estampa a própria
marca e **não** sobrescreve o `<title>` do seu `index.html` por padrão.

Se você **quiser** que a lib gerencie a identidade, é opt-in explícito:

```tsx
<SarakUIProvider
  options={{ branding: { initial: { tabName: 'Meu Sistema', logoBase64: '…' } } }}
>
```

Também dá para alimentar só o rótulo do cromo via `config.systemName`. Precedência e detalhes em
`docs/identidade-do-host.md`. **Se você vir a marca da biblioteca aparecendo no seu produto, isso é
um defeito da lib — reporte (§5), não contorne.**

## 3.13 Estrutura e isolamento

Independente da topologia:

- **Um `SarakUIProvider` por app.** Dois Providers na mesma página não é suportado (disputam a mesma
  classe de escopo e o mesmo stylesheet). Vários módulos sob **um** Provider, sim.
- **Um cromo por app.** O cromo é apresentacional: cada app renderiza o seu, com a mesma navegação
  vinda do código compartilhado. Não existe um "app dono do cromo".
- **Sem import lateral.** Módulo A **não** importa de dentro do módulo B — nem componente, nem hook,
  nem tipo. O que é comum sobe para o `ui-kit`/pacote compartilhado; o que é privado fica privado.
- **Cada módulo fala com a própria `api/`.** Precisa de dado de outro domínio? Peça pelo contrato
  público dele, nunca pela tabela ou pelo endpoint interno.
- **Uma cópia da lib.** Duas versões instaladas = dois contextos React = metade da tela sem tema.

---

# §4 — Templates copiáveis

Em `sarak-ui/templates/`. São **esqueletos genéricos**, não bibliotecas: copie, renomeie, adapte e
apague o que não usar. Eles não listam componentes (isso é o catálogo) — mostram a **forma**.

| Template | Para quê |
| --- | --- |
| `main.tsx` | wiring do app: Provider + tema + cromo + rota do Design Engine. Serve às 4 topologias (§2). |
| `ui-kit/themes.ts` | os temas do sistema como código compartilhado, partindo de um tema completo. |
| `ui-kit/nav.ts` | os itens de navegação definidos **uma vez**, para todo app renderizar o mesmo menu. |
| `ui-kit/index.ts` | a porta única do pacote compartilhado (`export *` da lib + os seus). |
| `tela-exemplo.tsx` | uma tela real: busca dados e trata **os três** estados (carregando/erro/vazio). |
| `componente-proprio.tsx` | um componente seu, temável por tokens — o molde da §3.6. |

---

# §5 — Quando abrir demanda na biblioteca

Abra demanda quando:

- a lib **promete** um comportamento e ele não acontece (o cromo não colapsa, o tema não aplica, um
  token documentado não pinta);
- a marca da biblioteca aparece no **seu** produto;
- você precisou do **mesmo** override em muitos lugares — falta uma variação;
- falta um átomo de design system que todo consumidor teria de reescrever igual.

**Não** abra demanda (faça você mesmo) quando:

- é um componente do **seu domínio** (uma tela, um card com as suas regras);
- é personalização de **um** elemento (§3.3);
- é lógica de dados, formulário ou navegação (§3.7).

**A regra de ouro:** defeito da lib se corrige **na lib**. Um patch no seu projeto para contornar um
defeito da base é dívida que ninguém mais vai entender — e some na próxima atualização.

---

<!-- SARAK-KIT:APENDICE-GERADO:INICIO -->

## Apêndice A — Superfície viva desta versão (GERADO)

> **Não edite esta seção à mão.** Ela é regenerada por `npm run guide` a partir do código-fonte da `@sarak/lib-ui-core` v7.0.0; o gate `guide:check` derruba o build se ficar defasada. A fonte de máquina equivalente é o `catalog.json` ao lado deste arquivo.

Exportações do barril público: **311** nomes (componentes, tipos, hooks e helpers).

### A.1 Componentes públicos (99)

Importe do barril: `import { X } from '@sarak/lib-ui-core'`. Os TIPOS de cada prop, com descrição, estão em `catalog.json` → `components.<Nome>.props` (e em `docs/component-catalog.md`).

| Categoria | Componente | Props |
| --- | --- | --- |
| Atoms | **SarakAvatar** | `name` · `src` · `alt` · `size` |
| Atoms | **SarakTypography** | `variant` · `color` · `as` · `transform` · `content` · `children` |
| Buttons | **SarakButton** | `variant` · `isLoading` · `leftIcon` · `rightIcon` · `fullWidth` · `size` |
| Buttons | **SarakIconButton** | `variant` · `size` · `isLoading` · `icon` |
| Buttons | **SarakSocialButton** | `provider` · `variant` · `onClick` · `label` · `hideLabel` · `className` |
| Cards | **SarakActionCard** | `item` · `mapping` · `className` · `onAction` · `design` · `label` · `actionLabel` |
| Cards | **SarakCard** | `children` · `className` |
| Cards | **SarakCardBody** | `children` · `className` |
| Cards | **SarakCardFooter** | `children` · `className` |
| Cards | **SarakCardHeader** | `children` · `className` |
| Cards | **SarakExpandableCard** | `title` · `iconContent` · `helpButton` · `children` · `className` · `contentClassName` · `baseHeight` |
| Cards | **SarakSearchCard** | `item` · `mapping` · `className` · `onSearchChange` · `onToggleCapability` · `design` · `label` |
| Cards | **SarakTitleCard** | `item` · `mapping` · `className` · `design` · `label` |
| Core | **SarakDesignScope** | `design` · `children` · `className` · `style` |
| Core | **SarakDeviceProvider** | `children` · `overrideDevice` · `breakpoints` |
| Core | **SarakUIProvider** | `children` · `config` · `token` · `userId` · `options` · `customThemes` · `activeThemeId` · `initialTheme` · `onThemeChange` · `onMediaUpload` |
| DataDisplay | **SarakDataGrid** | `count` · `renderRow` · `estimateSize` · `overscan` · `height` · `className` |
| DataDisplay | **SarakDataTable** | `columns` · `rows` · `rowHeight` · `headerHeight` · `height` · `overscan` · `getRowKey` · `sort` · `onSortChange` · `selectable` · `selectedKeys` · `onSelectionChange` · `onColumnResize` · `onColumnReorder` · `responsive` · `className` |
| DataDisplay | **SarakKanban** | `columns` · `onCardMove` · `renderCard` · `className` |
| DataDisplay | **SarakSparkline** | `data` · `variant` · `height` · `strokeWidth` · `fillOpacity` · `label` · `className` · `style` |
| DataDisplay | **SarakTreeView** | `data` · `manifest` · `lazyLoadingIcon` · `onExpand` · `selectedIds` · `onSelect` · `className` |
| engines | **SarakChartEngine** | `type` · `data` · `config` |
| engines | **SarakChatEngine** | `messages` · `onSendMessage` · `isLoading` · `placeholder` |
| engines | **SarakFlowEngine** | `nodes` · `edges` · `onConnect` |
| Feedback | **SarakAlert** | `variant` · `title` · `message` · `action` · `onClose` |
| Feedback | **SarakBadge** | `variant` · `size` · `pill` · `soft` |
| Feedback | **SarakDataEmpty** | `message` |
| Feedback | **SarakEmptyState** | `type` |
| Feedback | **SarakFieldError** | `message` · `fieldId` |
| Feedback | **SarakSkeleton** | `shape` · `rows` · `rowHeight` · `size` · `width` |
| Feedback | **SarakSpinner** | `size` · `label` · `className` |
| Icon | **SarakIcon** | `name` · `size` · `className` · `color` · `style` · `onClick` |
| Inputs | **SarakAutocomplete** | `options` · `searchOptions` · `debounceMs` · `value` · `defaultValue` · `onChange` · `placeholder` · `onOptionSelect` |
| Inputs | **SarakCheckbox** | `label` · `description` · `indeterminate` |
| Inputs | **SarakCurrencyInput** | `value` · `defaultValue` · `currency` · `locale` · `label` · `onChange` · `inputMode` |
| Inputs | **SarakDatePicker** | `label` · `mode` · `value` · `displayFormat` · `locale` · `weekStartsOn` · `placeholder` · `disabled` · `error` · `className` · `style` · `onChange` |
| Inputs | **SarakInput** | `label` · `icon` · `leftIcon` · `rightIcon` · `error` · `fullWidth` |
| Inputs | **SarakMaskedInput** | `mask` · `value` · `defaultValue` · `label` · `onChange` · `inputMode` |
| Inputs | **SarakMultiSelect** | `label` · `options` · `value` · `defaultValue` · `placeholder` · `disabled` · `error` · `className` · `style` · `onChange` |
| Inputs | **SarakRadio** | `label` · `description` |
| Inputs | **SarakRangeSlider** | `label` · `min` · `max` · `step` · `value` · `defaultValue` · `disabled` · `error` · `hideTooltips` · `onChange` |
| Inputs | **SarakRichText** | `value` · `defaultValue` · `onChange` · `placeholder` · `disabled` · `error` · `className` |
| Inputs | **SarakSearch** | `isOpen` · `onClose` · `items` · `onSelect` |
| Inputs | **SarakSelect** | `error` · `fullWidth` |
| Inputs | **SarakSlider** | `label` · `valueLabel` |
| Inputs | **SarakSwitch** | `label` · `description` |
| Inputs | **SarakTextarea** | `error` · `fullWidth` |
| Inputs | **SarakTimePicker** | `label` · `value` · `minuteStep` · `disabled` · `error` · `className` · `style` · `onChange` |
| Inputs | **SarakUploader** | `label` · `accept` · `maxSize` · `multiple` · `disabled` · `hint` · `error` · `className` · `style` · `onChange` · `onReject` |
| Layout | **SarakAnalyticalPage** | `navBar` · `mainContent` · `sidePanel` · `sidePanelAsDrawerOnMobile` · `centeredOnDesktop` |
| Layout | **SarakAppChrome** | `children` · `brand` · `navItems` · `nav` · `activeRoute` · `onNavigate` · `navigationStyle` · `topbarActions` · `logo` · `topbarStart` · `topbarEnd` · `search` · `sidebarHeader` · `sidebarFooter` · `banner` · `footer` · `decoration` · `user` · `logout` · `notifications` · `onNotificationSelect` · `widgets` · `className` · `style` |
| Layout | **SarakAppChromeMobile** | `children` · `brand` · `logo` · `nav` · `activeRoute` · `onNavigate` · `topbarActions` · `topbarStart` · `search` · `sidebarHeader` · `sidebarFooter` · `banner` · `footer` · `decoration` · `user` · `logout` · `notifications` · `onNotificationSelect` · `widgets` · `className` · `rootStyle` |
| Layout | **SarakHidden** | `children` · `on` |
| Layouts | **SarakAccordion** | `title` · `children` · `defaultOpen` · `className` |
| Layouts | **SarakDivider** | `orientation` · `label` · `decorative` |
| Layouts | **SarakFlex** | `children` · `direction` · `justify` · `align` · `gap` · `wrap` · `as` |
| Layouts | **SarakFormGroup** | `children` · `gap` |
| Layouts | **SarakGrid** | `children` · `templateColumns` · `templateAreas` · `gap` · `as` |
| Layouts | **SarakScrim** | `onClose` · `ariaLabel` · `className` · `testId` · `style` · `animate` · `visible` · `durationMs` |
| Layouts | **SarakSplitPane** | `leftPane` · `rightPane` · `minLeftWidth` · `maxLeftWidth` · `defaultLeftWidth` · `className` |
| Media | **SarakLightbox** | `images` · `isOpen` · `initialIndex` · `onClose` · `onIndexChange` |
| Media | **SarakMarkdownRenderer** | `content` · `className` |
| Media | **SarakPDFViewer** | `src` · `initialPage` · `zoom` · `workerSrc` · `onDownload` · `className` |
| Modals | **SarakDrawer** | `isOpen` · `onClose` · `direction` · `children` · `size` · `className` |
| Modals | **SarakModal** | `isOpen` · `onClose` · `title` · `children` · `footer` · `steps` · `onComplete` · `disableOverlayClick` · `hideCloseButton` · `className` |
| Navigation | **SarakBreadcrumbs** | `items` · `separator` · `onNavigate` · `className` |
| Navigation | **SarakLink** | `href` · `external` · `children` |
| Navigation | **SarakMenuItem** | `icon` · `label` · `active` · `collapsed` · `orientation` · `title` · `className` |
| Navigation | **SarakPagination** | `current` · `total` · `maxVisible` · `onChange` · `className` |
| Navigation | **SarakShellLanguageSelector** | `variant` |
| Navigation | **SarakShellNav** | `items` · `activeRoute` · `brand` · `onNavigate` · `onChange` · `orientation` · `collapsed` · `className` |
| Navigation | **SarakShellSearchWidget** | `variant` · `items` · `onClick` |
| Navigation | **SarakShellThemeToggle** | `variant` |
| Navigation | **SarakShellUserWidget** | `user` · `logout` · `variant` |
| Navigation | **SarakSpotlight** | `items` · `shortcut` · `open` · `onOpenChange` · `onSelect` · `placeholder` |
| Navigation | **SarakStepper** | `steps` · `current` · `orientation` · `className` |
| Outros | **SARAK_DEFAULT_COLUMN_WIDTH** | _ver arquivo do componente_ |
| Outros | **SARAK_MIN_COLUMN_WIDTH** | _ver arquivo do componente_ |
| Outros | **SarakDataGridImpl** | _ver arquivo do componente_ |
| Outros | **SarakDataTableImpl** | _ver arquivo do componente_ |
| Outros | **SarakHelpButton** | _ver arquivo do componente_ |
| Outros | **SarakOverlayProvider** | _ver arquivo do componente_ |
| Outros | **SarakToastProvider** | _ver arquivo do componente_ |
| Templates | **SarakAuthScreen** | `branding` · `isRegistering` · `setIsRegistering` · `mfaStep` · `setMfaStep` · `username` · `setUsername` · `password` · `setPassword` · `mfaCode` · `setMfaCode` · `showPassword` · `setShowPassword` · `error` · `isPending` · `onSubmit` · `onSocialLogin` · `socialConfig` · `onForgot` · `onMasterLogin` · `onChange` · `role` · `density` · `importance` |
| Templates | **SarakCardGrid** | `endpoint` · `data` · `label` · `mapping` · `filters` · `role` · `density` · `importance` · `variant` |
| Templates | **SarakCatalogGrid** | `items` · `loading` · `title` · `subtitle` · `categories` · `onSync` · `renderCard` · `emptyMessage` · `role` · `density` · `importance` |
| Templates | **SarakChart** | `endpoint` · `label` · `mapping` · `role` · `density` · `importance` |
| Templates | **SarakChat** | `endpoint` · `modelsEndpoint` · `label` · `role` · `density` · `importance` |
| Templates | **SarakExpandableMatrix** | `data` · `subItems` · `activeMapping` · `onToggle` · `renderItemHeader` · `manifest` |
| Templates | **SarakFilterSelect** | `col` · `placeholder` · `filters` · `onChange` · `options` |
| Templates | **SarakForm** | `endpoint` · `label` · `mapping` · `mode` · `initialData` · `actions` · `onSuccess` · `role` · `density` · `importance` |
| Templates | **SarakImageCard** | `src` · `alt` · `title` · `subtitle` · `children` · `className` · `onClick` |
| Templates | **SarakManagementGrid** | `endpoint` · `groupBy` · `ghostGroups` · `mapping` · `headerActions` · `groupActions` · `formMapping` · `role` · `density` · `importance` |
| Templates | **SarakPageTransition** | `children` · `locationKey` |
| Templates | **SarakStats** | `endpoint` · `data` · `label` · `mapping` · `role` · `density` · `importance` |
| Templates | **SarakTable** | `endpoint` · `data` · `label` · `mapping` · `getRowKey` · `sort` · `onSortChange` · `selectable` · `selectedKeys` · `onSelectionChange` · `role` · `density` · `importance` · `responsive` |
| UX | **SarakContextMenu** | `isOpen` · `position` · `onClose` · `children` · `className` |
| UX | **SarakTabs** | `tabs` · `activeTab` · `onChange` · `variant` · `fullWidth` · `className` · `listClassName` |
| UX | **SarakTooltip** | `children` · `content` · `position` · `delay` · `className` · `disabled` |

### A.2 Contrato de responsividade (gerado do uso real)

Breakpoints canônicos: **celular** < 768px · **tablet** 768–1023px · **desktop** ≥ 1024px.

**Adaptam sozinhos** (leem o dispositivo no próprio código — você não escreve CSS nem media query):

`SarakAnalyticalPage` · `SarakAppChrome` · `SarakDataTable` · `SarakDataTableImpl` · `SarakFlex` · `SarakGrid` · `SarakHidden` · `SarakSplitPane` · `SarakTable`

**Refino opcional por dispositivo** (`SarakResponsiveValue<T>` = `{ mob, tab, desk }`) — 2 props:

| Componente | Prop |
| --- | --- |
| `SarakFlex` | `direction` |
| `SarakGrid` | `templateColumns` |

### A.3 Slots do `SarakAppChrome` (10)

Regiões do cromo que aceitam qualquer `ReactNode` (imagem, vídeo, componente animado).

| Slot | O que é |
| --- | --- |
| `topbarActions` | Conteúdo à direita da topbar (ações, avatar, seletor de tema…). Alias legado de `topbarEnd`. |
| `logo` | Slot `logo` (Spec 48 — L1): logo custom/animado (`ReactNode`). Tem PRECEDÊNCIA sobre `brand.logoUrl`; o `brand.name` continua ao lado. Aparece nos três modos. |
| `topbarStart` | Slot `topbarStart`: conteúdo no INÍCIO da barra superior (após a marca). Sem barra superior (modo sidebar) degrada para o topo da sidebar. |
| `topbarEnd` | Slot `topbarEnd`: conteúdo no FIM da barra superior. É o mesmo lugar do `topbarActions` (alias preservado); quando os dois vêm, `topbarEnd` vence. No modo sidebar degrada para o rodapé da sidebar (comportamento atual). |
| `search` | Slot `search`: conteúdo de busca do consumidor (tipicamente um `SarakShellSearchWidget`), posicionado por `design.searchPositionTopbar` (`left`/`center`/`right`) na topbar e `design.searchPositionSidebar` (`top`/`bottom`) na sidebar/drawer. A composição do widget controla se a busca default é oferecida; a região personalizada continua controlada pelo conteúdo desta prop. |
| `sidebarHeader` | Slot `sidebarHeader`: topo da sidebar (abaixo da marca). No celular migra para o drawer. |
| `sidebarFooter` | Slot `sidebarFooter`: rodapé da sidebar. No celular migra para o drawer. |
| `banner` | Slot `banner`: faixa full-width no topo do cromo (aviso, promo, faixa animada). |
| `footer` | Slot `footer`: faixa full-width na base do cromo (rodapé da página). |
| `decoration` | Slot `decoration`: camada decorativa ATRÁS do conteúdo do cromo (imagem/animação escopada ao cromo). É ornamento — `aria-hidden` e sem captura de foco/toque. COMPLEMENTA o fundo/atmosfera global por tema (Design Engine), não o substitui. |

### A.4 Tokens

**Espaçamento semântico** (aceito por `gap`/`padding` das primitivas): `spacing-xs` · `spacing-sm` · `spacing-md` · `spacing-lg` · `spacing-xl`

**CSS Variables públicas** (760) — as ÚNICAS que a central emite; use sempre com fallback, `var(--sarak-x, valor)`. Nome fora desta lista não pinta nada:

`--sarak-accent-color` · `--sarak-action-glow-shadow-blur` · `--sarak-action-glow-shadow-offset-y` · `--sarak-action-glow-shadow-spread` · `--sarak-ai-glow` · `--sarak-ai-glow-color` · `--sarak-ai-panel-bg` · `--sarak-anim-enabled` · `--sarak-anim-fast` · `--sarak-anim-instant` · `--sarak-anim-normal` · `--sarak-anim-slow` · `--sarak-atmosphere-noise-opacity` · `--sarak-auth-hero-orb-blur` · `--sarak-b-weight` · `--sarak-badge-radius` · `--sarak-bg-base` · `--sarak-bg-base-color` · `--sarak-bg-body` · `--sarak-bg-gradient-angle` · `--sarak-bg-gradient-mode` · `--sarak-bg-layer-1` · `--sarak-bg-layer-2` · `--sarak-bg-modal` · `--sarak-bg-noise-animation` · `--sarak-bg-noise-density` · `--sarak-bg-opacity` · `--sarak-bg-pattern-id` · `--sarak-bg-pattern-opacity` · `--sarak-body-font` · `--sarak-body-lh` · `--sarak-body-line-height` · `--sarak-body-size` · `--sarak-body-weight` · `--sarak-border-beam-enabled` · `--sarak-border-radius` · `--sarak-border-radius-lg` · `--sarak-border-radius-md` · `--sarak-border-radius-sm` · `--sarak-border-style` · `--sarak-border-type` · `--sarak-border-width` · `--sarak-brand-logo-size-collapsed` · `--sarak-breakpoint-desktop` · `--sarak-breakpoint-tablet` · `--sarak-btn-active-scale` · `--sarak-btn-backdrop-blur` · `--sarak-btn-border-radius` · `--sarak-btn-ghost-hover` · `--sarak-btn-ghost-hover-bg` · `--sarak-btn-hover-scale` · `--sarak-btn-neon-glow-color` · `--sarak-btn-neon-pulse-speed` · `--sarak-btn-primary-bg` · `--sarak-btn-primary-bg-10` · `--sarak-btn-primary-bg-20` · `--sarak-btn-primary-bg-30` · `--sarak-btn-primary-bg-40` · `--sarak-btn-primary-bg-50` · `--sarak-btn-primary-bg-active` · `--sarak-btn-primary-bg-bg` · `--sarak-btn-primary-bg-border` · `--sarak-btn-primary-bg-hover` · `--sarak-btn-primary-bg-light` · `--sarak-btn-primary-bg-rgb` · `--sarak-btn-primary-text` · `--sarak-btn-radius-b-l` · `--sarak-btn-radius-b-r` · `--sarak-btn-radius-bl` · `--sarak-btn-radius-br` · `--sarak-btn-radius-t-l` · `--sarak-btn-radius-t-r` · `--sarak-btn-radius-tl` · `--sarak-btn-radius-tr` · `--sarak-btn-secondary-bg` · `--sarak-btn-secondary-bg-10` · `--sarak-btn-secondary-bg-20` · `--sarak-btn-secondary-bg-30` · `--sarak-btn-secondary-bg-40` · `--sarak-btn-secondary-bg-50` · `--sarak-btn-secondary-bg-active` · `--sarak-btn-secondary-bg-bg` · `--sarak-btn-secondary-bg-border` · `--sarak-btn-secondary-bg-hover` · `--sarak-btn-secondary-bg-light` · `--sarak-btn-secondary-bg-rgb` · `--sarak-btn-style-type` · `--sarak-button-icon-position` · `--sarak-button-width-strategy` · `--sarak-card-action-btn-bg` · `--sarak-card-action-btn-bg-10` · `--sarak-card-action-btn-bg-20` · `--sarak-card-action-btn-bg-30` · `--sarak-card-action-btn-bg-40` · `--sarak-card-action-btn-bg-50` · `--sarak-card-action-btn-bg-active` · `--sarak-card-action-btn-bg-bg` · `--sarak-card-action-btn-bg-border` · `--sarak-card-action-btn-bg-hover` · `--sarak-card-action-btn-bg-light` · `--sarak-card-action-btn-bg-rgb` · `--sarak-card-action-btn-border-radius` · `--sarak-card-action-btn-hover-bg` · `--sarak-card-action-btn-padding` · `--sarak-card-action-btn-primary-bg` · `--sarak-card-action-btn-primary-bg-10` · `--sarak-card-action-btn-primary-bg-20` · `--sarak-card-action-btn-primary-bg-30` · `--sarak-card-action-btn-primary-bg-40` · `--sarak-card-action-btn-primary-bg-50` · `--sarak-card-action-btn-primary-bg-bg` · `--sarak-card-action-btn-primary-bg-border` · `--sarak-card-action-btn-primary-bg-hover` · `--sarak-card-action-btn-primary-bg-rgb` · `--sarak-card-action-btn-radius` · `--sarak-card-action-btn-text` · `--sarak-card-action-click-scale` · `--sarak-card-backdrop-blur` · `--sarak-card-background-color` · `--sarak-card-background-color-10` · `--sarak-card-background-color-20` · `--sarak-card-background-color-30` · `--sarak-card-background-color-40` · `--sarak-card-background-color-50` · `--sarak-card-background-color-bg` · `--sarak-card-background-color-border` · `--sarak-card-background-color-hover` · `--sarak-card-background-color-rgb` · `--sarak-card-bg` · `--sarak-card-bg-10` · `--sarak-card-bg-20` · `--sarak-card-bg-30` · `--sarak-card-bg-40` · `--sarak-card-bg-50` · `--sarak-card-bg-active` · `--sarak-card-bg-bg` · `--sarak-card-bg-border` · `--sarak-card-bg-hover` · `--sarak-card-bg-light` · `--sarak-card-bg-rgb` · `--sarak-card-blur` · `--sarak-card-border-bottom` · `--sarak-card-border-color` · `--sarak-card-border-left` · `--sarak-card-border-opacity` · `--sarak-card-border-radius` · `--sarak-card-border-right` · `--sarak-card-border-top` · `--sarak-card-border-width` · `--sarak-card-clip-path` · `--sarak-card-content-alignment` · `--sarak-card-footer-bg` · `--sarak-card-footer-border` · `--sarak-card-geometric-cut` · `--sarak-card-glow-color` · `--sarak-card-glow-intensity` · `--sarak-card-header-bg` · `--sarak-card-header-border` · `--sarak-card-header-padding` · `--sarak-card-hover-glow` · `--sarak-card-hover-glow-increase` · `--sarak-card-hover-lift` · `--sarak-card-hover-style` · `--sarak-card-hover-translate` · `--sarak-card-hover-y` · `--sarak-card-image-position` · `--sarak-card-inner-glow-color` · `--sarak-card-inner-glow-width` · `--sarak-card-layout-direction` · `--sarak-card-opacity` · `--sarak-card-padding-md` · `--sarak-card-radius` · `--sarak-card-radius-b-l` · `--sarak-card-radius-b-r` · `--sarak-card-radius-bl` · `--sarak-card-radius-br` · `--sarak-card-radius-t-l` · `--sarak-card-radius-t-r` · `--sarak-card-radius-tl` · `--sarak-card-radius-tr` · `--sarak-card-search-bg-focus` · `--sarak-card-search-border-beam-active` · `--sarak-card-search-placeholder` · `--sarak-card-search-placeholder-color` · `--sarak-card-search-text-focus` · `--sarak-card-search-text-focus-color` · `--sarak-card-shadow` · `--sarak-card-shadow-spread` · `--sarak-card-spotlight-opacity` · `--sarak-card-surface-opacity` · `--sarak-card-text-align` · `--sarak-card-texture-opacity` · `--sarak-card-texture-type` · `--sarak-card-title-color` · `--sarak-card-title-font-size` · `--sarak-card-title-font-weight` · `--sarak-card-title-icon-glow` · `--sarak-card-title-icon-glow-blur` · `--sarak-card-title-letter-spacing` · `--sarak-card-variant` · `--sarak-catalog-filter-min-width` · `--sarak-catalog-item-radius` · `--sarak-catalog-section-radius` · `--sarak-chart-color-palette` · `--sarak-chart-engine-min-h` · `--sarak-chart-engine-min-height` · `--sarak-chart-grid-opacity` · `--sarak-chart-primary` · `--sarak-chart-show-grid` · `--sarak-chart-smoothing` · `--sarak-chart-thickness` · `--sarak-chart-tooltip-bg` · `--sarak-chart-type` · `--sarak-chat-anim-speed` · `--sarak-chat-animation-speed` · `--sarak-chat-attachment-name-max-width` · `--sarak-chat-bubble` · `--sarak-chat-bubble-blur` · `--sarak-chat-bubble-glass-blur` · `--sarak-chat-bubble-radius` · `--sarak-chat-bubble-style` · `--sarak-chat-radius` · `--sarak-chat-token-slider-min-width` · `--sarak-chat-user-bg` · `--sarak-checkbox-active` · `--sarak-checkbox-active-10` · `--sarak-checkbox-active-20` · `--sarak-checkbox-active-30` · `--sarak-checkbox-active-40` · `--sarak-checkbox-active-50` · `--sarak-checkbox-active-active` · `--sarak-checkbox-active-bg` · `--sarak-checkbox-active-border` · `--sarak-checkbox-active-color` · `--sarak-checkbox-active-color-10` · `--sarak-checkbox-active-color-20` · `--sarak-checkbox-active-color-30` · `--sarak-checkbox-active-color-40` · `--sarak-checkbox-active-color-50` · `--sarak-checkbox-active-color-bg` · `--sarak-checkbox-active-color-border` · `--sarak-checkbox-active-color-hover` · `--sarak-checkbox-active-color-rgb` · `--sarak-checkbox-active-hover` · `--sarak-checkbox-active-light` · `--sarak-checkbox-active-rgb` · `--sarak-chrome-notifications-position` · `--sarak-chrome-search-position` · `--sarak-chrome-user-position` · `--sarak-color-bg-body` · `--sarak-color-bg-layer1` · `--sarak-color-bg-layer2` · `--sarak-color-bg-modal` · `--sarak-color-depth` · `--sarak-color-palette` · `--sarak-color-primary` · `--sarak-color-primary-10` · `--sarak-color-primary-20` · `--sarak-color-primary-30` · `--sarak-color-primary-40` · `--sarak-color-primary-50` · `--sarak-color-primary-active` · `--sarak-color-primary-bg` · `--sarak-color-primary-border` · `--sarak-color-primary-hover` · `--sarak-color-primary-light` · `--sarak-color-primary-rgb` · `--sarak-color-secondary` · `--sarak-color-secondary-10` · `--sarak-color-secondary-20` · `--sarak-color-secondary-30` · `--sarak-color-secondary-40` · `--sarak-color-secondary-50` · `--sarak-color-secondary-active` · `--sarak-color-secondary-bg` · `--sarak-color-secondary-border` · `--sarak-color-secondary-hover` · `--sarak-color-secondary-light` · `--sarak-color-secondary-rgb` · `--sarak-color-tertiary` · `--sarak-color-tertiary-10` · `--sarak-color-tertiary-20` · `--sarak-color-tertiary-30` · `--sarak-color-tertiary-40` · `--sarak-color-tertiary-50` · `--sarak-color-tertiary-active` · `--sarak-color-tertiary-bg` · `--sarak-color-tertiary-border` · `--sarak-color-tertiary-hover` · `--sarak-color-tertiary-light` · `--sarak-color-tertiary-rgb` · `--sarak-color-variation` · `--sarak-content-alignment` · `--sarak-context-menu-min-width` · `--sarak-contrast` · `--sarak-contrast-curve` · `--sarak-control-height-toggle` · `--sarak-design-engine-sidebar-max-w` · `--sarak-design-engine-sidebar-max-width` · `--sarak-design-engine-sidebar-min-w` · `--sarak-design-engine-sidebar-min-width` · `--sarak-device-desktop-min-width` · `--sarak-device-frame-radius` · `--sarak-device-phone-height` · `--sarak-device-phone-notch-radius` · `--sarak-device-phone-width` · `--sarak-device-tablet-height` · `--sarak-dot-grid-dot-offset` · `--sarak-dot-grid-dot-size` · `--sarak-dot-grid-tile-size` · `--sarak-ease-main` · `--sarak-ease-out` · `--sarak-empty-state-caption-max-width` · `--sarak-empty-state-orb-blur` · `--sarak-empty-state-orb-inner` · `--sarak-empty-state-orb-outer` · `--sarak-empty-state-ring-radius` · `--sarak-empty-state-void-letter-offset` · `--sarak-engine-min-h-lg` · `--sarak-engine-min-h-sm` · `--sarak-engine-min-height-lg` · `--sarak-engine-min-height-sm` · `--sarak-flow-grid` · `--sarak-flow-grid-style` · `--sarak-flow-handle-size` · `--sarak-flow-node-blur` · `--sarak-flow-node-padding` · `--sarak-flow-node-radius` · `--sarak-flow-radius` · `--sarak-focus-ring-width` · `--sarak-focus-width` · `--sarak-font-b` · `--sarak-font-h` · `--sarak-font-m` · `--sarak-form-field-density` · `--sarak-form-label-position` · `--sarak-form-layout-direction` · `--sarak-glass-blur` · `--sarak-glass-edge-color` · `--sarak-glass-edge-width` · `--sarak-glass-opacity` · `--sarak-glass-roughness` · `--sarak-glass-saturation` · `--sarak-glass-specularity` · `--sarak-global-background-blur` · `--sarak-global-background-image-url` · `--sarak-global-background-opacity` · `--sarak-global-bg-blur` · `--sarak-global-bg-image` · `--sarak-global-bg-opacity` · `--sarak-global-contrast` · `--sarak-global-flow-align` · `--sarak-global-flow-direction` · `--sarak-global-saturation` · `--sarak-global-section-gap` · `--sarak-h-transform` · `--sarak-h1-letter-spacing` · `--sarak-h1-lh` · `--sarak-h1-line-height` · `--sarak-h1-ls` · `--sarak-h1-size` · `--sarak-h1-weight` · `--sarak-h2-lh` · `--sarak-h2-line-height` · `--sarak-h2-size` · `--sarak-h2-weight` · `--sarak-h3-size` · `--sarak-header-alignment` · `--sarak-heading-font` · `--sarak-heading-transform` · `--sarak-icon-button-frosted-shadow-blur` · `--sarak-icon-button-frosted-shadow-offset-y` · `--sarak-icon-button-glow-blur-lg` · `--sarak-icon-button-glow-blur-md` · `--sarak-icon-button-glow-blur-sm` · `--sarak-icon-family` · `--sarak-icon-stroke` · `--sarak-icon-stroke-width` · `--sarak-icon-weight` · `--sarak-identity-align` · `--sarak-identity-alignment` · `--sarak-identity-font` · `--sarak-identity-font-family` · `--sarak-identity-font-weight` · `--sarak-identity-hover` · `--sarak-identity-hover-effect` · `--sarak-identity-link` · `--sarak-identity-padding` · `--sarak-identity-redirect-url` · `--sarak-identity-tracking` · `--sarak-identity-weight` · `--sarak-image-card-glow-blur` · `--sarak-image-card-hover-zoom` · `--sarak-image-card-overlay-opacity` · `--sarak-image-card-shadow-blur` · `--sarak-image-card-shadow-offset-y` · `--sarak-image-card-shadow-spread` · `--sarak-industrial-registry` · `--sarak-input-backdrop-blur` · `--sarak-input-bg` · `--sarak-input-bg-10` · `--sarak-input-bg-20` · `--sarak-input-bg-30` · `--sarak-input-bg-40` · `--sarak-input-bg-50` · `--sarak-input-bg-active` · `--sarak-input-bg-bg` · `--sarak-input-bg-border` · `--sarak-input-bg-hover` · `--sarak-input-bg-light` · `--sarak-input-bg-rgb` · `--sarak-input-border-color` · `--sarak-input-border-radius` · `--sarak-input-border-type` · `--sarak-input-error-color` · `--sarak-input-focus-border-color` · `--sarak-input-icon-color` · `--sarak-input-icon-position` · `--sarak-input-padding` · `--sarak-input-shadow` · `--sarak-input-success-color` · `--sarak-input-text-color` · `--sarak-is-auto-hide-enabled` · `--sarak-is-nav-hidden` · `--sarak-is-split-view-enabled` · `--sarak-kanban-card-radius` · `--sarak-kanban-header-padding-y` · `--sarak-kanban-header-tracking` · `--sarak-kbd-min-w` · `--sarak-kbd-min-width` · `--sarak-layer-backdrop-blur` · `--sarak-layer-backdrop-opacity` · `--sarak-layer-elevation-factor` · `--sarak-layered-shadows` · `--sarak-layout` · `--sarak-layout-density` · `--sarak-layout-gap` · `--sarak-layout-gap-lg` · `--sarak-layout-gap-md` · `--sarak-layout-gap-sm` · `--sarak-layout-grid-min-cell` · `--sarak-layout-grid-template` · `--sarak-layout-padding` · `--sarak-layout-preview-max-h` · `--sarak-line-height` · `--sarak-management-group-desc-max-width` · `--sarak-management-group-list-max-height` · `--sarak-matrix-blur` · `--sarak-matrix-border-color` · `--sarak-matrix-gap` · `--sarak-matrix-item-bg` · `--sarak-matrix-node-min-width` · `--sarak-matrix-radius` · `--sarak-matrix-search-bg` · `--sarak-max-content-width` · `--sarak-modal-action-alignment` · `--sarak-modal-blur` · `--sarak-modal-border-radius` · `--sarak-modal-header-style` · `--sarak-modal-overlay` · `--sarak-modal-overlay-blur` · `--sarak-modal-overlay-color` · `--sarak-mode` · `--sarak-mono-font` · `--sarak-motion-dur-fast` · `--sarak-motion-dur-instant` · `--sarak-motion-dur-normal` · `--sarak-motion-dur-slow` · `--sarak-motion-duration-fast` · `--sarak-motion-duration-instant` · `--sarak-motion-duration-normal` · `--sarak-motion-duration-slow` · `--sarak-motion-ease-in` · `--sarak-motion-ease-main` · `--sarak-motion-ease-out` · `--sarak-motion-stagger` · `--sarak-motion-stagger-delay` · `--sarak-multi-select-input-min-width` · `--sarak-nav-active-color` · `--sarak-nav-active-marker-color` · `--sarak-nav-active-marker-glow` · `--sarak-nav-item-active-color` · `--sarak-nav-marker-color` · `--sarak-nav-marker-glow` · `--sarak-nav-style` · `--sarak-navbar-layout` · `--sarak-navigation-style` · `--sarak-noise-density` · `--sarak-noise-intensity` · `--sarak-noise-opacity` · `--sarak-noise-speed` · `--sarak-page-transition-type` · `--sarak-preference-font-size-position` · `--sarak-preference-language-position` · `--sarak-preference-mode-position` · `--sarak-preference-nav-collapse-position` · `--sarak-preference-navigation-style-position` · `--sarak-preset-card-hover-shadow-blur` · `--sarak-preset-card-hover-shadow-offset-y` · `--sarak-preset-card-hover-shadow-spread` · `--sarak-preset-card-shadow-blur` · `--sarak-preset-card-shadow-offset-y` · `--sarak-preset-card-shadow-spread` · `--sarak-preset-glow-shadow-blur` · `--sarak-preset-glow-shadow-blur-lg` · `--sarak-preset-grid-texture-size` · `--sarak-preset-matte-shadow-blur1` · `--sarak-preset-matte-shadow-blur2` · `--sarak-preset-matte-shadow-offset-y2` · `--sarak-preset-matte-shadow-spread1` · `--sarak-preset-matte-shadow-spread2` · `--sarak-preset-mini-card-height` · `--sarak-preset-mini-card-max-width` · `--sarak-preset-preview-min-height` · `--sarak-preset-preview-padding-y` · `--sarak-primary-color` · `--sarak-primary-color-10` · `--sarak-primary-color-20` · `--sarak-primary-color-30` · `--sarak-primary-color-40` · `--sarak-primary-color-50` · `--sarak-primary-color-active` · `--sarak-primary-color-bg` · `--sarak-primary-color-border` · `--sarak-primary-color-hover` · `--sarak-primary-color-light` · `--sarak-primary-color-rgb` · `--sarak-progress-bar-max-width` · `--sarak-range-active-bg` · `--sarak-range-active-color` · `--sarak-reduced-motion` · `--sarak-saturation` · `--sarak-scroll-padding` · `--sarak-scroll-radius` · `--sarak-scroll-thumb-color` · `--sarak-scroll-thumb-hover-opacity` · `--sarak-scroll-thumb-opacity` · `--sarak-scroll-track-opacity` · `--sarak-scroll-width` · `--sarak-scrollbar-thumb` · `--sarak-scrollbar-thumb-color` · `--sarak-scrollbar-width` · `--sarak-search-backdrop-blur` · `--sarak-search-dropdown-gap` · `--sarak-search-dropdown-width` · `--sarak-search-position-sidebar` · `--sarak-search-position-topbar` · `--sarak-secondary-color` · `--sarak-secondary-color-10` · `--sarak-secondary-color-20` · `--sarak-secondary-color-30` · `--sarak-secondary-color-40` · `--sarak-secondary-color-50` · `--sarak-secondary-color-active` · `--sarak-secondary-color-bg` · `--sarak-secondary-color-border` · `--sarak-secondary-color-hover` · `--sarak-secondary-color-light` · `--sarak-secondary-color-rgb` · `--sarak-security-glow` · `--sarak-security-pulse` · `--sarak-security-pulse-speed` · `--sarak-security-shield-glow` · `--sarak-shadow-ambient-alpha` · `--sarak-shadow-color-mode` · `--sarak-shadow-intensity` · `--sarak-shadow-orientation` · `--sarak-shadow-projection-alpha` · `--sarak-shadow-projection-blur` · `--sarak-shell-brand-logo-size` · `--sarak-sidebar-active-color` · `--sarak-sidebar-bg` · `--sarak-sidebar-blur` · `--sarak-sidebar-collapsed-width` · `--sarak-sidebar-color` · `--sarak-sidebar-hover-color` · `--sarak-sidebar-label-max-width` · `--sarak-sidebar-max-width` · `--sarak-sidebar-min-width` · `--sarak-sidebar-noise-opacity` · `--sarak-sidebar-position` · `--sarak-sidebar-shadow` · `--sarak-sidebar-width` · `--sarak-skeleton-circle-size` · `--sarak-skeleton-row-height` · `--sarak-skeleton-row-radius` · `--sarak-split-pane-min-width` · `--sarak-status-error-color` · `--sarak-status-error-color-10` · `--sarak-status-error-color-20` · `--sarak-status-error-color-30` · `--sarak-status-error-color-40` · `--sarak-status-error-color-50` · `--sarak-status-error-color-active` · `--sarak-status-error-color-bg` · `--sarak-status-error-color-border` · `--sarak-status-error-color-hover` · `--sarak-status-error-color-light` · `--sarak-status-error-color-rgb` · `--sarak-status-glow-blur` · `--sarak-status-info-color` · `--sarak-status-info-color-10` · `--sarak-status-info-color-20` · `--sarak-status-info-color-30` · `--sarak-status-info-color-40` · `--sarak-status-info-color-50` · `--sarak-status-info-color-active` · `--sarak-status-info-color-bg` · `--sarak-status-info-color-border` · `--sarak-status-info-color-hover` · `--sarak-status-info-color-light` · `--sarak-status-info-color-rgb` · `--sarak-status-success-color` · `--sarak-status-success-color-10` · `--sarak-status-success-color-20` · `--sarak-status-success-color-30` · `--sarak-status-success-color-40` · `--sarak-status-success-color-50` · `--sarak-status-success-color-active` · `--sarak-status-success-color-bg` · `--sarak-status-success-color-border` · `--sarak-status-success-color-hover` · `--sarak-status-success-color-light` · `--sarak-status-success-color-rgb` · `--sarak-status-warning-color` · `--sarak-status-warning-color-10` · `--sarak-status-warning-color-20` · `--sarak-status-warning-color-30` · `--sarak-status-warning-color-40` · `--sarak-status-warning-color-50` · `--sarak-status-warning-color-active` · `--sarak-status-warning-color-bg` · `--sarak-status-warning-color-border` · `--sarak-status-warning-color-hover` · `--sarak-status-warning-color-light` · `--sarak-status-warning-color-rgb` · `--sarak-surface` · `--sarak-surface-color` · `--sarak-surface-intensity` · `--sarak-surface-material` · `--sarak-switch-active-bg` · `--sarak-switch-active-bg-10` · `--sarak-switch-active-bg-20` · `--sarak-switch-active-bg-30` · `--sarak-switch-active-bg-40` · `--sarak-switch-active-bg-50` · `--sarak-switch-active-bg-active` · `--sarak-switch-active-bg-bg` · `--sarak-switch-active-bg-border` · `--sarak-switch-active-bg-hover` · `--sarak-switch-active-bg-light` · `--sarak-switch-active-bg-rgb` · `--sarak-switch-backdrop-blur` · `--sarak-switch-label-position` · `--sarak-switch-pulse-color` · `--sarak-switch-style-type` · `--sarak-switch-thumb` · `--sarak-switch-thumb-bg` · `--sarak-switch-track-active-bg` · `--sarak-switch-track-active-bg-10` · `--sarak-switch-track-active-bg-20` · `--sarak-switch-track-active-bg-30` · `--sarak-switch-track-active-bg-40` · `--sarak-switch-track-active-bg-50` · `--sarak-switch-track-active-bg-bg` · `--sarak-switch-track-active-bg-border` · `--sarak-switch-track-active-bg-hover` · `--sarak-switch-track-active-bg-rgb` · `--sarak-system-tone` · `--sarak-tab-gap` · `--sarak-tab-section-margin` · `--sarak-table-action-position` · `--sarak-table-border` · `--sarak-table-border-color` · `--sarak-table-border-radius` · `--sarak-table-cell-padding` · `--sarak-table-density` · `--sarak-table-header-bg` · `--sarak-table-padding` · `--sarak-table-row-hover` · `--sarak-table-row-hover-bg` · `--sarak-table-zebra-striping` · `--sarak-tertiary-color` · `--sarak-tertiary-color-10` · `--sarak-tertiary-color-20` · `--sarak-tertiary-color-30` · `--sarak-tertiary-color-40` · `--sarak-tertiary-color-50` · `--sarak-tertiary-color-active` · `--sarak-tertiary-color-bg` · `--sarak-tertiary-color-border` · `--sarak-tertiary-color-hover` · `--sarak-tertiary-color-light` · `--sarak-tertiary-color-rgb` · `--sarak-text-color-master` · `--sarak-text-color-muted` · `--sarak-text-color-secondary` · `--sarak-text-glow` · `--sarak-text-glow-intensity` · `--sarak-text-main` · `--sarak-text-muted` · `--sarak-text-sec` · `--sarak-text-smoothing` · `--sarak-texture` · `--sarak-texture-color` · `--sarak-texture-opacity` · `--sarak-theme-dropdown-max-height` · `--sarak-title-color` · `--sarak-toast-accent-width` · `--sarak-toast-max-width` · `--sarak-toast-min-width` · `--sarak-tooltip-bg` · `--sarak-tooltip-border` · `--sarak-tooltip-border-color` · `--sarak-tooltip-radius` · `--sarak-tooltip-text` · `--sarak-tooltip-text-color` · `--sarak-topbar-active-color` · `--sarak-topbar-bg` · `--sarak-topbar-collapsed-height` · `--sarak-topbar-color` · `--sarak-topbar-height` · `--sarak-topbar-hover-color` · `--sarak-topbar-label-max-width` · `--sarak-topbar-noise-opacity` · `--sarak-topbar-title-color` · `--sarak-tracking-snug` · `--sarak-tracking-subtle` · `--sarak-tracking-tight` · `--sarak-tracking-ultra` · `--sarak-tracking-wide` · `--sarak-tracking-wider` · `--sarak-tracking-widest` · `--sarak-type-scale-caption` · `--sarak-type-scale-display` · `--sarak-type-scale-micro` · `--sarak-type-scale-tiny` · `--sarak-type-scale-xl` · `--sarak-type-scale-xs` · `--sarak-type-scale2xs` · `--sarak-type-scale3xs` · `--sarak-vignette-blend-mode` · `--sarak-vignette-color` · `--sarak-vignette-opacity` · `--sarak-vignette-softness` · `--sarak-visual-dot-grid-size` · `--sarak-visual-orb-blur` · `--sarak-visual-perspective` · `--sarak-visual-translate-offset-sm` · `--sarak-visual-translate-z-md` · `--sarak-z-base` · `--sarak-z-index-base` · `--sarak-z-index-modal` · `--sarak-z-index-sidebar` · `--sarak-z-index-toast` · `--sarak-z-index-tooltip` · `--sarak-z-modal` · `--sarak-z-sidebar` · `--sarak-z-toast` · `--sarak-z-tooltip`

**Tokens de TEMA** (430 chaves válidas de `design` num tema JSON) — lista completa com tipo em `catalog.json` → `designTokens.ids`. 40 deles aceitam `SarakResponsiveValue`.

**Temas embutidos** (14): `sarak-sovereign` · `cyberpunk-neon` · `industrial-terminal` · `neo-brutalism` · `synthwave-retro` · `nebula-space` · `kinetic-flow` · `cyber-retro-wave` · `minimalist-airy` · `data-terminal` · `neumorphic-mobile` · `golden-hour` · `aurora-veil` · `blueprint-protocol`

**Par de referência** (parta destes — completos em todos os eixos): `minimalist-airy` · `sarak-sovereign`

### A.5 Ícones (100 nomes válidos)

Valores aceitos por `<SarakIcon name>`, `navItems[].icon` e `mapping.icon`. O nome é o mesmo nas três famílias (`lucide`/`phosphor`/`tabler`). Nome fora da lista → `console.warn` + ícone de alerta.

`AlertCircle` · `AlertTriangle` · `Check` · `CheckCircle2` · `X` · `Info` · `HelpCircle` · `Menu` · `Search` · `Bell` · `Filter` · `List` · `Grid` · `Layout` · `LayoutDashboard` · `Home` · `ChevronDown` · `ChevronLeft` · `ChevronRight` · `ChevronUp` · `ArrowRight` · `ArrowLeft` · `ArrowUp` · `ArrowDown` · `ArrowUpDown` · `CornerDownRight` · `MoreVertical` · `MoreHorizontal` · `Maximize2` · `Minimize2` · `Loader2` · `RefreshCw` · `User` · `UserPlus` · `Users` · `LogIn` · `LogOut` · `Lock` · `Shield` · `Eye` · `File` · `FileText` · `FileSpreadsheet` · `Folder` · `Image` · `Paperclip` · `ScrollText` · `Clipboard` · `Copy` · `Download` · `Upload` · `UploadCloud` · `Printer` · `Save` · `Edit` · `Edit3` · `Plus` · `Trash2` · `Type` · `AlignLeft` · `Hash` · `Activity` · `BarChart3` · `LineChart` · `PieChart` · `ScatterChart` · `TrendingUp` · `Database` · `Layers` · `Network` · `Box` · `Package` · `Cpu` · `Cloud` · `Terminal` · `Thermometer` · `History` · `Calendar` · `Clock` · `MessageSquare` · `Mail` · `Send` · `Phone` · `Bot` · `Globe` · `Link` · `ExternalLink` · `Briefcase` · `Building` · `CreditCard` · `DollarSign` · `MapPin` · `Tag` · `Star` · `Play` · `Palette` · `Settings` · `Zap` · `Chrome` · `Github`

### A.6 Guias que viajam no pacote

Aprofundamento por tema, em `node_modules/@sarak/lib-ui-core/`:

- `docs/component-catalog.md` — Catálogo de Componentes — Sarak-Lib-UI-Core
- `docs/extensibilidade-de-layout.md` — Extensibilidade de layout — imagens, animações e conteúdo custom (guia do consumidor)
- `docs/identidade-do-host.md` — Identidade da página — o consumidor é o dono
- `docs/migracoes.md` — Migrações (breaking changes do contrato público)
- `docs/persistencia-de-tema.md` — Persistência de tema no seu backend — o contrato do dado (opcional)
- `docs/temas-cromo-e-multidispositivo.md` — Temas completos, Cromo e Multi-dispositivo — guia do consumidor

<!-- SARAK-KIT:APENDICE-GERADO:FIM -->
