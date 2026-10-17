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
| saber se a lib **já faz** o que eu ia construir (cartão, tabela, diálogo, aviso…) | [§6 O que a lib já faz](#6--o-que-a-lib-já-faz--não-recrie) |

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

const TEMAS = SARAK_REFERENCE_THEMES;   // ponto de partida completo (escuro, síncrono) — veja §3.9

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
import { SarakUIProvider, sarakDeriveThemeFromReference, sarakLoadThemePreset } from '@sarak/lib-ui-core';

// Derive de um tema COMPLETO e troque poucos valores — a customização vale nos dois modos.
// Só o `sarak-sovereign` está no boot; outro tema embarcado é carregado antes (sob demanda).
const claro = await sarakLoadThemePreset('minimalist-airy');
const TEMAS = [
  sarakDeriveThemeFromReference(claro, {
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
  igual". Derive de `SARAK_REFERENCE_THEMES` / `sarakLoadReferenceThemes()` (o par completo) ou de um tema de `themes.presetIds`
  carregado por `sarakLoadThemePreset(id)`.
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

## 3.14 Fontes → a lib já carrega, do próprio pacote

A lib leva as próprias fontes (`dist/fonts/`) e o Provider carrega **só as famílias que o tema no ar usa**, uma vez
por família, sem pedir nada a terceiros. A lista, por categoria (sans, serif, display, manuscrita, mono), é o seletor
de fonte do painel; no tema, a fonte vai pelo **`value` exato** que o seletor grava (`'Lora', serif`).

- **Não recrie o carregador.** Nada de `@fontsource`, `<link>` do Google no seu `index.html` ou `@font-face` à mão
  para uma família do catálogo: a lib carregaria de novo e a fonte deixaria de seguir a troca de tema.
- **A origem é `options.fonts`:** omitido = `'bundled'` (o padrão); `{ baseUrl }` quando o seu bundler não acha os
  arquivos (esbuild puro, CJS no navegador) ou você os serve de uma CDN própria — copie a pasta `fonts/` do pacote e
  aponte para ela; `'google'` só se você **quer** o Google Fonts; `'none'` se você carrega tudo. Vite (dev e `build`)
  acha os arquivos sozinho.
- **A fonte da marca do cliente vai em `options.fonts.custom`**, não em `baseUrl`: `custom` acrescenta uma família
  que a lib não tem, servida por você; `baseUrl` só muda de onde vêm as fontes da lib.

```tsx
<SarakUIProvider options={{ fonts: { custom: [
  { family: 'Marca Sans', category: 'Sans-Serif', fallback: 'sans-serif', files: [
    { url: '/fontes/marca-400.woff2', weight: 400 },
    { url: '/fontes/marca-700.woff2', weight: 700 },
  ] },
] } }}>
```

- **Registrar não muda o que o tema aceita.** A família registrada entra no seletor do painel e vale em qualquer token
  de fonte; uma pilha segura como `'Georgia, serif'` vale sem registro. Registrar é o que faz a lib carregar o arquivo
  e listá-la.
- **Privacidade e política de segurança de conteúdo:** no padrão, o IP do usuário não vai a um terceiro para desenhar
  texto (LGPD) e a tipografia funciona offline. A diretiva é `font-src 'self'` (mais a origem do `baseUrl`, se for
  outra); os domínios do Google só com `'google'`.
- **Fonte que não carregou avisa:** `[Sarak:UI] A fonte "<família>" não carregou (origem tentada: …)` no console,
  uma vez por família, e a página segue com a genérica da pilha.

Detalhe e a tabela por bundler: `docs/migracoes.md`, `## 8.0.0`.

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

# §6 — O que a lib já faz — não recrie

Antes de escrever um componente seu, procure a necessidade aqui. Cada linha diz **qual peça da lib atende**, **por que
reconstruir custa mais** e **o que o tema já controla**. O que a lib faz de verdade, com tipo e prop, está no
`catalog.json` (A.1 e A.4b abaixo); este mapa só aponta e ensina o que a medição mostrou.

> **Estado do mapa:** cartões, sobreposições e tabelas estão preenchidos com o que foi medido em navegador. O lote 2
> acrescenta o alcance dos leitores de tipografia, botões, campos, alternadores, cores, gráficos, chat e status. O lote 3
> acrescenta fundo, vidro, sombra, rolagem, movimento, camadas e os componentes especializados, **medidos em
> navegador** (o que cada valor mudou na tela, não só quem o lê). O lote 4 acrescenta o cromo, a estrutura, a marca e as
> preferências do usuário (§6.8). As
> necessidades que ainda estão **⏳** não foram abertas token a token; procure no catálogo antes de construir.

| Preciso de… | A lib já tem | Por que não reconstruir |
| --- | --- | --- |
| um cartão de conteúdo (cabeçalho, corpo, rodapé) | `SarakCard` com `SarakCard.Header`, `.Body` e `.Footer`; para o seu próprio contêiner, a classe `sarak-card` (ou `card`) | raio, borda, sombra, textura, vidro e brilho vêm dos tokens `card*`: um `div` com `border-radius` e `box-shadow` próprios fica fora do tema e não acompanha a troca de modo |
| cartão de título, de ação (botão), de busca ou de imagem | `SarakTitleCard`, `SarakActionCard`, `SarakSearchCard`, `SarakImageCard` | cada um já lê a própria família de token (`cardTitle*`, `cardAction*`, `cardSearch*`, `imageCard*`) e o estado de foco e de hover |
| uma grade de cartões com busca e filtros | `SarakCardGrid` (e `SarakCatalogGrid`, `SarakManagementGrid` para catálogo e gestão agrupada) | busca, filtros e os estados de carregamento, erro e vazio já estão feitos |
| uma tabela de dados | `SarakTable` (simples, com cartões no celular) ou `SarakDataTable` (virtualizada, colunas redimensionáveis) | ordenação, seleção, listra, hover e a troca por cartões no smartphone são do componente; veja a diferença de tokens abaixo |
| um diálogo | `SarakModal` (tamanhos nomeados, passos, foco preso, Escape); para painel lateral, `SarakDrawer` | foco preso, Escape, véu e animação são resolvidos; um `div` fixo com `z-index` próprio entra na disputa de camadas |
| aviso passageiro | `useToast().notify(...)` | empilhamento, tipo e largura vêm de `overlays` e do Provider |
| dica ao passar o ponteiro / menu de contexto | `SarakTooltip` · `SarakContextMenu` | o menu de contexto se desloca para dentro da tela e fecha por clique fora e por Escape; o tooltip já lê fundo, texto, borda e raio do tema |
| carregar as fontes do tema (e a da marca) | o Provider, com `options.fonts` e `options.fonts.custom` (§3.14) | só a família em uso é baixada, sem rede de terceiros, e a fonte segue a troca de tema; um `@font-face` seu fica fora disso |
| tipografia e cores da interface | `SarakTypography` · tokens `text*` e `color*` | família, escala, peso, espaçamento, halo e cores vêm do tema; as cores têm valores para os dois modos |
| ação principal ou botão de ícone | `SarakButton` · `SarakIconButton` | variantes, ícones, largura, raio, brilho e vidro seguem os tokens de botão |
| campo, seleção ou alternância | `SarakInput` · `SarakSelect` · `SarakSwitch` | foco, fundo, borda, ícone, espaçamento e estilos do alternador acompanham o tema |
| gráfico de dados | `SarakChartEngine` | paleta, grade, dicas, espessura e suavização são configuráveis; a prop `type` pode escolher a forma adequada aos dados |
| conversa com mensagens e anexos | `SarakChatEngine` | bolhas, campo de envio, animação e limites de largura já têm tokens |
| estado ou progresso | `SarakBadge` e componentes de progresso | variantes semânticas e cores de estado estão prontas para reutilizar |
| fundo da página com gradiente, textura, grão, vinheta ou imagem | o Provider, pelos tokens `bgGradient*`, `texture*`, `bgNoise*`, `vignette*` e `globalBackground*` | as camadas ficam atrás do conteúdo e seguem o modo; um `div` fixo seu com imagem disputa camada e fica fora da contraparte |
| superfície de vidro, material e sombra | `SarakCard` (`surfaceMaterial`), a classe `.sarak-glass` e a classe `.shadow-theme` | desfoque, saturação, borda, reflexo e as duas camadas de sombra vêm de `glass*` e `shadow*`; `backdrop-filter` e `box-shadow` escritos à mão não trocam com o tema |
| barra de rolagem | o CSS da lib, em todo elemento rolável | largura, raio, trilho e cursor vêm dos tokens `scroll*`; uma barra estilizada por você não acompanha o tema |
| movimento: duração, curva e atraso | tokens `motion*`, `animEnabled`, `pageTransitionType` e `reducedMotion` | cartões, campos, painéis, troca de página, tabela e gráfico leem o mesmo ritmo; `transition: all 0.3s` fixo ignora o tema e o movimento reduzido |
| camadas de empilhamento | tokens `zIndex*` | menus, busca, modais, gavetas, dicas e avisos derivam da mesma escada; um `z-index` fixo seu entra na disputa |
| estado vazio, esqueleto de carga, motor de fluxo, matriz expansível | `SarakEmptyState` · `SarakSkeleton` · `SarakFlowEngine` · `SarakExpandableMatrix` | geometria, desfoque e cores têm tokens (`emptyState*`, `skeleton*`, `flow*`, `matrix*`) |
| navegação, cromo e slots | `SarakAppChrome` (§2 e A.3), com `SarakShellNav` e os widgets de busca, usuário, notificações e preferências | lateral ou topo, barra do celular, recolher, marca, cores, sombra, grão e posição de cada widget vêm dos tokens `sidebar*`, `topbar*`, `nav*`, `identity*`, `chrome*Position` e `preference*Position` (§6.8); um cromo escrito à mão perde tudo isso e a barra do celular |
| calendário, Gantt e Kanban | ⏳ `SarakKanban` | ⏳ lote seguinte |
| escolha de modo, tamanho da fonte, orientação da navegação e idioma pelo usuário | os widgets do cromo e `useSarakPreferences` (preferências sobrepostas ao tema, nunca gravadas nele) | o administrador decide por token se cada escolha fica fixa na barra, no menu ⚙ ou não é oferecida (`preference*Position`, §6.8); um alternador seu não aplica a contraparte do tema |
| idioma (textos da lib), persistência do tema | ⏳ | ⏳ lote seguinte |
| modo embarcado (ilha sobre um front existente) | ⏳ (§2 e skill) | ⏳ lote seguinte |
| painel de customização | ⏳ `SarakCustomizationPanel` | ⏳ lote seguinte |
| tema derivado da marca do cliente | ⏳ (§3.9) | ⏳ lote seguinte |

## 6.1 Cartões — o que o tema controla e o que o surpreende

- **A textura é uma camada `::after` do cartão** (`sarak-card` e `card`), e `cardTextureType` escolhe o desenho. **A
  cor não é do tipo**: a maioria dos desenhos pinta com `textureColor`; `grid` usa a cor da borda do cartão;
  `dots` e `cyber-binary`, a primária; `noise`, `grain` e `paper` não têm cor própria. Por isso a textura **muda de cor
  no modo oposto** (as cores vêm da `contraparte`) enquanto o desenho continua o mesmo.
- **`cardTextureOpacity` padrão é muito baixo.** Sem subi-lo, o desenho escolhido quase não aparece, e a pergunta
  "a textura não funciona" é, quase sempre, essa.
- **Vidro** é `cardBackdropBlur` **com** `cardSurfaceOpacity` abaixo de 1: sem superfície translúcida não há o que
  desfocar.
- **`cardBorderWidth` também é a espessura da divisória** do cabeçalho e do rodapé do `SarakCard`; os tokens
  `cardHeader*` e `cardFooter*` valem só para `SarakCard.Header` e `SarakCard.Footer`.
- **Sombra:** a força é `cardShadowSpread` (e `shadowColorMode`); a forma é o deslocamento, o desfoque e a expansão. Os
  quatro juntos, com desfoque zero, dão a sombra dura. `cardShadow` (texto) **substitui** a composta — declare a cor
  certa para os dois modos.
- **`cardGeometricCut` corta também a sombra e o brilho externos** (é `clip-path`): combine com filete interno
  (`cardInnerGlow*`).
- **Os tokens de direção e alinhamento** (`cardLayoutDirection`, `cardTextAlign`) alcançam os cartões de título, ação,
  busca e expansível — **não** o `SarakCard` composto. Para inverter a ordem dos blocos de um cartão em linha, use o
  `className` dele (`flex-row-reverse`); não há token para isso.

Exemplo real (superfície de vidro com grade, e a cor da textura seguindo o modo):

```ts
const tema = {
  design: { cardSurfaceOpacity: 0.55, cardBackdropBlur: 24, cardTextureType: 'grid', cardTextureOpacity: 0.08 },
  contraparte: { textureColor: '#404040', cardBorderColor: '#dadee7' }, // a grade usa a cor da borda do cartão
};
```

## 6.2 Sobreposições

- **Largura do diálogo é nomeada** (`modalWidthSm` … `modalWidthFull`, escolhidos pela prop `size`); sem `size`, vale
  32 rem. A cor e o desfoque do véu são `modalOverlayColor` e `modalOverlayBlur`, e valem também para a gaveta
  (`SarakDrawer`).
- **`toastMinWidth` e `toastMaxWidth` são em `rem`**, relativos ao tamanho da fonte raiz; a faixa colorida do toast é a
  cor do tipo da mensagem, e só a espessura (`toastAccentWidth`) é do tema.
- **`modalActionAlignment` e `modalHeaderStyle` mudam a disposição**, não o comportamento: foco e Escape são os mesmos.

## 6.3 Tabelas — dois componentes, dois conjuntos de token

| Token | `SarakTable` | `SarakDataTable` |
| --- | --- | --- |
| `tableDensity` (respiro e fonte da célula) | lê | **não lê** |
| `tableCellPadding` (respiro horizontal) | **não lê** | lê |
| `tableRowHoverBg` | lê | **não lê** |
| `tableHeaderBg`, `tableBorderColor`, `tableZebraStriping` | leem | leem |

O `tableHeaderBg` também pinta a barra de ferramentas do editor de texto rico e a do visualizador de PDF.

## 6.4 Tokens que o schema oferece e ainda não mudam a tela

Nenhum. Todo token dos cartões, sobreposições e tabelas muda a tela; os que não mudavam (ou só mudavam com um valor)
saíram do schema na 8.0.0 (ver `docs/migracoes.md`) — um tema salvo com eles carrega, com aviso, e a chave é
descartada. Os outros cinco medidos sem efeito passaram a desenhar:

`cardSpotlightOpacity` (luz que segue o cursor), `imageCardHoverZoom` (zoom da capa sob o ponteiro) e
`cardActionClickScale` (aperto do botão de ação) **desenham por padrão** — 0,1 · 1,05 · 0,96. Para desligar:
`0`, `1` e `1`. Movimento reduzido zera os três.

`borderBeamEnabled` e `cardSearchBorderBeamActive` desenham o **traço luminoso**: um anel de luz na cor primária que
gira só pela borda do cartão e acompanha o raio dele. `cardSearchBorderBeamActive` (padrão `true`) acende o traço do
`SarakSearchCard` **só com o campo de busca em foco**; `borderBeamEnabled` (padrão `false`, opt-in) o mantém aceso em
qualquer cartão. Desligados, nenhuma animação roda; fora da tela o giro pausa e movimento reduzido apaga o traço. Dezenas
de cartões visíveis com o traço aceso custam quadros: use em poucos cartões de destaque.

## 6.5 Tipografia, controles e cores

- Os tokens `text*` controlam a pilha tipográfica, escala, peso, espaçamento e efeitos de texto usados por
  `SarakTypography` e pelos componentes que consomem o motor de design. As famílias configuradas no tema continuam
  sujeitas ao carregamento de fontes do Provider (§3.14).
- Os tokens de `SarakButton` e `SarakIconButton` incluem geometria e efeitos condicionais: halo e pulso dependem do
  estilo neon; desfoque e sombras de vidro dependem do estilo frosted. O estilo escolhido determina quais desses
  ajustes aparecem.
- `inputBackdropBlur` só desfoca o que está atrás do campo quando `inputBg` é translúcido. No `SarakSwitch`, os ajustes
  de vidro e pulso dependem dos estilos que os usam.
- As cores de marca e superfície têm valores por modo. O motor usa a contraparte ao trocar entre claro e escuro, em
  vez de deixar componentes com cores fixas fora da mudança de tema.

## 6.6 Dados, chat e status

- `chartGridOpacity` só aparece com `chartShowGrid` ligado. Espessura e suavização se aplicam a linhas e áreas;
  `SarakChartEngine` permite escolher o tipo de gráfico pela prop `type`.
- Os limites de largura do chat evitam que nomes de anexos e o controle de tokens ocupem espaço sem limite; a
  velocidade da animação também vem do tema.
- `SarakBadge` oferece variantes semânticas; os tokens de status e progresso controlam as cores e os limites visuais
  dos respectivos componentes.

## 6.7 Fundo, atmosfera, movimento, camadas e especializados

O que a medição em navegador mostrou, e que o schema sozinho não diz:

- **Textura é a chave da atmosfera.** `textureOpacity`, `bgNoiseAnimation`, `vignetteOpacity`, `vignetteSoftness`,
  `globalSaturation` e `globalContrast` só têm o que pintar quando `texture` não é `none`: com `none` o valor muda a
  variável e nenhum pixel. `globalSaturation` e `globalContrast` filtram **só a camada da textura**, não a interface.
- **Grão e textura `noise` são coisas diferentes.** `bgNoiseDensity` regula uma camada fixa de grão que cobre a tela em
  qualquer textura; a opacidade do padrão `texture: noise` é `textureOpacity`.
- **O gradiente depende do modo.** `bgGradientAngle` só gira o Linear; `colorBgLayer1` aparece em Linear, Radial e
  Mesh; `colorBgLayer2` só no Mesh. Com `bgGradientMode: none` as duas camadas não pintam nada.
- **Material, vidro e sombra.** `surfaceMaterial` e `surfaceIntensity` atuam nos cartões; `glass*` atuam na classe
  `.sarak-glass`, e `glassOpacity` no gradiente de vidro dos cartões. `.shadow-theme` e a busca leem as duas camadas
  de sombra (`shadowAmbientAlpha`, `shadowProjection*`, `layeredShadows`); a sombra dos cartões vem de `cardShadow*`.
  `shadowIntensity` muda a **opacidade do elemento** `.shadow-theme` (conteúdo incluso), não a força da sombra.
- **Movimento.** As durações e a curva `motionEaseMain` chegam por CSS a quase toda transição; `motionStaggerDelay`
  escalona as linhas da `SarakTable` e as barras do `SarakChart`; `reducedMotion` zera tudo, inclusive o que roda em
  JavaScript. `animEnabled` e `pageTransitionType` governam só a troca de página (`SarakPageTransition`).
  `motionEaseOut` alcança só o pulso do alternador pulsante e o aperto de um botão HTML sem classe.
- **Camadas.** `zIndexSidebar` desloca menus e busca por passos fixos; um modal seu com `z-index` fixo pode ficar sob a
  barra ou sobre o aviso. `zIndexToast` é o topo da escada.
- **Rolagem.** `scroll*` usam `::-webkit-scrollbar` (Chromium e Safari); o Firefox usa a barra do sistema.
- **Saída de sobreposição.** `motionEaseIn` é a curva da saída do modal e da paleta de busca: eles permanecem na página
  durante a saída (duração `motionDurationFast`, zero sob movimento reduzido) e só então saem. `matrixGap` é o espaço
  entre os sub-itens da `SarakExpandableMatrix`, dentro de cada linha aberta.

## 6.8 Cromo, estrutura, marca e preferências do usuário

Medido em navegador (lote 4):

- **A preferência do usuário vence o tema.** `navigationStyle`, `bodySize` e o modo claro/escuro têm uma preferência
  sobreposta (`useSarakPreferences`): com a preferência definida, o valor do tema não aparece. A paleta **só inverte
  pela preferência de modo** (que aplica a contraparte); `mode` no tema declara o modo nativo e, sozinho, não repinta a
  tela. A orientação e o tamanho da fonte só chegam ao usuário se `preference*Position` os oferece (padrão: fixas na barra).
- **Cada widget do cromo tem posição própria.** `chromeSearchPosition`, `chromeUserPosition`, `chromeNotificationsPosition`
  e os cinco `preference*Position` aceitam fixa, menu ⚙ ou não oferecida; "não oferecida" tira o controle do usuário, e
  o ⚙ só nasce quando algum widget está em `menu`.
- **Lateral e topo têm tokens separados.** `sidebar*` só valem com navegação lateral e `topbar*`/`navbarLayout` só com a
  do topo; o recolhimento (`isNavHidden`) estreita a lateral até `sidebarCollapsedWidth` (sem o piso de `sidebarMinWidth`, que é da
  lateral aberta) e encolhe o topo para
  `topbarCollapsedHeight`. No celular decidem `mobileNavigationStyle` e os `breakpoint*`: abaixo de `breakpointTablet` o
  cromo muda de forma.
- **Estrutura.** `layoutPadding`, `maxContentWidth` e `layoutDensity` agem na região de conteúdo do cromo (a densidade
  multiplica o respiro); `layoutGap*` são a escala de espaçamento (a `SarakGrid` e o `SarakFlex` leem `layoutGap`, o
  cromo lê as escalas); `layoutGridTemplate` e `layoutGridMinCell` governam a `SarakGrid`; `formLabelPosition` e
  `formFieldDensity` o `SarakFormGroup`; `switchLabelPosition` só o `SarakSwitch`.
- **Bordas e ícones.** `borderRadius` é o raio dos componentes sem raio próprio (0 deixa os cantos retos, inclusive no acordeão; vale escalar ou por breakpoint);
  `borderWidth` e `borderStyle` alcançam o cromo, as divisórias e as classes de borda. `iconFamily` troca o desenho de
  todos os ícones; `iconStrokeWidth` só vale em Lucide e Tabler, e `iconWeight` escolhe o desenho em Phosphor.
- **Marca.** `identity*` agem no bloco da marca da lateral e do topo (texto; a imagem do logo só muda de tamanho por
  `shellBrandLogoSize` e `brandLogoSizeCollapsed`).
- **Busca do topo.** `searchPositionTopbar: center` põe a busca no meio do espaço livre entre a navegação e o grupo final da
  barra (não no centro geométrico dela); `left` a deixa antes da navegação. A região de conteúdo é limitada e centralizada
  só por `maxContentWidth` (`contentAlignment` saiu do schema).

---

<!-- SARAK-KIT:APENDICE-GERADO:INICIO -->

## Apêndice A — Superfície viva desta versão (GERADO)

> **Não edite esta seção à mão.** Ela é regenerada por `npm run guide` a partir do código-fonte da `@sarak/lib-ui-core` v7.0.0; o gate `guide:check` derruba o build se ficar defasada. A fonte de máquina equivalente é o `catalog.json` ao lado deste arquivo.

Exportações do barril público: **380** nomes (componentes, tipos, hooks e helpers).

### A.1 Componentes públicos (105)

Importe do barril: `import { X } from '@sarak/lib-ui-core'`. Os TIPOS de cada prop, com descrição, estão em `catalog.json` → `components.<Nome>.props` (e em `docs/component-catalog.md`).

| Categoria | Componente | Props |
| --- | --- | --- |
| Atoms | **SarakAvatar** | `name` · `src` · `alt` · `size` |
| Atoms | **SarakTypography** | `variant` · `color` · `as` · `transform` · `content` · `children` |
| Atoms | **SarakValue** | `value` · `format` · `locale` · `signColor` · `size` · `className` |
| Buttons | **SarakButton** | `variant` · `isLoading` · `leftIcon` · `rightIcon` · `fullWidth` · `size` |
| Buttons | **SarakIconButton** | `variant` · `size` · `isLoading` · `icon` |
| Buttons | **SarakSocialButton** | `provider` · `icon` · `variant` · `onClick` · `label` · `hideLabel` · `className` |
| Cards | **SarakActionCard** | `item` · `mapping` · `className` · `onAction` · `design` · `label` · `actionLabel` |
| Cards | **SarakCard** | `children` · `className` · `interactive` |
| Cards | **SarakCardBody** | `children` · `className` |
| Cards | **SarakCardFooter** | `children` · `className` |
| Cards | **SarakCardHeader** | `children` · `className` |
| Cards | **SarakExpandableCard** | `title` · `iconContent` · `helpButton` · `children` · `className` · `contentClassName` · `baseHeight` |
| Cards | **SarakSearchCard** | `item` · `mapping` · `className` · `onSearchChange` · `onToggleCapability` · `design` · `label` |
| Cards | **SarakTitleCard** | `item` · `mapping` · `className` · `design` · `label` |
| Core | **SarakDesignScope** | `design` · `children` · `className` · `style` |
| Core | **SarakDeviceProvider** | `children` · `overrideDevice` · `breakpoints` |
| Core | **SarakUIProvider** | `children` · `config` · `token` · `userId` · `options` · `customThemes` · `activeThemeId` · `initialTheme` · `onThemeChange` · `loadingFallback` · `onMediaUpload` |
| DataDisplay | **SarakActivityFeed** | `entries` · `label` · `className` |
| DataDisplay | **SarakCalendar** | `events` · `month` · `onMonthChange` · `defaultMonth` · `weekStartsOn` · `onEventClick` · `onDayClick` · `renderEvent` · `maxEventsPerDay` · `label` · `className` |
| DataDisplay | **SarakChecklist** | `items` · `onToggle` · `onAdd` · `onRemove` · `showProgress` · `label` · `className` |
| DataDisplay | **SarakCommentThread** | `comments` · `onSubmit` · `onDelete` · `label` · `className` |
| DataDisplay | **SarakDataGrid** | `count` · `renderRow` · `estimateSize` · `overscan` · `height` · `className` |
| DataDisplay | **SarakDataTable** | `columns` · `rows` · `rowHeight` · `headerHeight` · `height` · `overscan` · `getRowKey` · `sort` · `onSortChange` · `selectable` · `selectedKeys` · `onSelectionChange` · `onColumnResize` · `onColumnReorder` · `responsive` · `loading` · `error` · `emptyMessage` · `onRetry` · `onRowClick` · `className` |
| DataDisplay | **SarakGantt** | `tasks` · `scale` · `onTaskClick` · `rangeStart` · `rangeEnd` · `label` · `className` |
| DataDisplay | **SarakKanban** | `columns` · `onCardMove` · `renderCard` · `onCardClick` · `onCardAdd` · `onColumnAdd` · `onColumnRename` · `onColumnDelete` · `className` |
| DataDisplay | **SarakSparkline** | `data` · `variant` · `height` · `strokeWidth` · `fillOpacity` · `label` · `className` · `style` |
| DataDisplay | **SarakTreeView** | `data` · `manifest` · `lazyLoadingIcon` · `onExpand` · `selectedIds` · `onSelect` · `className` |
| engines | **SarakChartEngine** | `type` · `data` · `config` · `series` · `stacked` · `orientation` · `legend` · `onPointClick` · `ariaLabel` |
| engines | **SarakChatEngine** | `messages` · `onSendMessage` · `isLoading` · `placeholder` |
| engines | **SarakFlowEngine** | `nodes` · `edges` · `onConnect` |
| Feedback | **SarakAlert** | `variant` · `title` · `message` · `action` · `onClose` |
| Feedback | **SarakBadge** | `variant` · `size` · `pill` · `soft` · `showStatusShape` |
| Feedback | **SarakDataEmpty** | `message` |
| Feedback | **SarakEmptyState** | `type` · `title` · `description` · `action` · `icon` |
| Feedback | **SarakFieldError** | `message` · `fieldId` |
| Feedback | **SarakProgress** | `value` · `max` · `thresholds` · `label` · `indeterminate` · `className` |
| Feedback | **SarakSkeleton** | `shape` · `rows` · `rowHeight` · `size` · `width` |
| Feedback | **SarakSpinner** | `size` · `label` · `className` |
| Icon | **SarakIcon** | _ver arquivo do componente_ |
| Inputs | **SarakAssigneePicker** | `people` · `value` · `onChange` · `clearable` · `label` · `disabled` · `className` |
| Inputs | **SarakAutocomplete** | `options` · `searchOptions` · `debounceMs` · `value` · `defaultValue` · `onChange` · `placeholder` · `onOptionSelect` |
| Inputs | **SarakCheckbox** | `label` · `description` · `indeterminate` |
| Inputs | **SarakCurrencyInput** | `value` · `defaultValue` · `currency` · `locale` · `label` · `onChange` · `inputMode` |
| Inputs | **SarakDatePicker** | `label` · `mode` · `value` · `displayFormat` · `locale` · `weekStartsOn` · `placeholder` · `disabled` · `error` · `className` · `style` · `onChange` |
| Inputs | **SarakInput** | `label` · `icon` · `leftIcon` · `rightIcon` · `error` · `fullWidth` |
| Inputs | **SarakMaskedInput** | `mask` · `value` · `defaultValue` · `label` · `onChange` · `inputMode` |
| Inputs | **SarakMultiSelect** | `label` · `options` · `value` · `defaultValue` · `placeholder` · `disabled` · `error` · `className` · `style` · `onChange` |
| Inputs | **SarakRadio** | `label` · `description` |
| Inputs | **SarakRangeSlider** | `label` · `min` · `max` · `step` · `value` · `defaultValue` · `disabled` · `error` · `hideTooltips` · `onChange` |
| Inputs | **SarakRichText** | `value` · `defaultValue` · `onChange` · `placeholder` · `label` · `disabled` · `error` · `className` |
| Inputs | **SarakSearch** | `isOpen` · `onClose` · `items` · `onSelect` |
| Inputs | **SarakSelect** | `label` · `error` · `fullWidth` |
| Inputs | **SarakSlider** | `label` · `valueLabel` |
| Inputs | **SarakSwitch** | `label` · `description` |
| Inputs | **SarakTextarea** | `label` · `error` · `fullWidth` |
| Inputs | **SarakTimePicker** | `label` · `value` · `minuteStep` · `disabled` · `error` · `className` · `style` · `onChange` |
| Inputs | **SarakUploader** | `label` · `accept` · `maxSize` · `multiple` · `disabled` · `hint` · `error` · `className` · `style` · `onChange` · `onReject` |
| Layout | **SarakAnalyticalPage** | `navBar` · `mainContent` · `sidePanel` · `sidePanelAsDrawerOnMobile` · `centeredOnDesktop` |
| Layout | **SarakAppChrome** | `children` · `secondaryContent` · `brand` · `navItems` · `nav` · `activeRoute` · `onNavigate` · `navigationStyle` · `topbarActions` · `logo` · `topbarStart` · `topbarEnd` · `search` · `sidebarHeader` · `sidebarFooter` · `banner` · `footer` · `decoration` · `user` · `logout` · `notifications` · `onNotificationSelect` · `widgets` · `className` · `style` |
| Layout | **SarakAppChromeMobile** | `children` · `secondaryContent` · `brand` · `logo` · `nav` · `activeRoute` · `onNavigate` · `topbarActions` · `topbarStart` · `search` · `sidebarHeader` · `sidebarFooter` · `banner` · `footer` · `decoration` · `user` · `logout` · `notifications` · `onNotificationSelect` · `widgets` · `className` · `rootStyle` |
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
| Modals | **SarakModal** | `isOpen` · `onClose` · `title` · `children` · `footer` · `steps` · `onComplete` · `disableOverlayClick` · `hideCloseButton` · `className` · `size` |
| Navigation | **SarakBreadcrumbs** | `items` · `separator` · `onNavigate` · `className` |
| Navigation | **SarakLink** | `href` · `external` · `target` · `rel` · `onNavigate` · `onClick` · `children` |
| Navigation | **SarakMenuItem** | `icon` · `label` · `active` · `collapsed` · `orientation` · `title` · `href` · `onNavigate` · `badge` · `target` · `type` · `disabled` · `onClick` · `className` |
| Navigation | **SarakPagination** | `current` · `total` · `pageSize` · `pageSizeOptions` · `totalItems` · `onPageSizeChange` · `maxVisible` · `onChange` · `className` |
| Navigation | **SarakShellLanguageSelector** | `variant` |
| Navigation | **SarakShellNav** | `items` · `activeRoute` · `brand` · `onNavigate` · `onChange` · `orientation` · `collapsed` · `className` |
| Navigation | **SarakShellSearchWidget** | `variant` · `items` · `onClick` · `onSelect` |
| Navigation | **SarakShellThemeToggle** | `variant` |
| Navigation | **SarakShellUserWidget** | `user` · `logout` · `variant` |
| Navigation | **SarakSpotlight** | `items` · `shortcut` · `open` · `onOpenChange` · `onSelect` · `placeholder` |
| Navigation | **SarakStepper** | `steps` · `current` · `orientation` · `className` |
| Outros | **SARAK_DEFAULT_COLUMN_WIDTH** | _ver arquivo do componente_ |
| Outros | **SARAK_MIN_COLUMN_WIDTH** | _ver arquivo do componente_ |
| Outros | **SarakHelpButton** | _ver arquivo do componente_ |
| Outros | **SarakOverlayProvider** | _ver arquivo do componente_ |
| Outros | **SarakToastProvider** | _ver arquivo do componente_ |
| Templates | **SarakAuthScreen** | `branding` · `allowRegistration` · `allowMfa` · `labels` · `isRegistering` · `setIsRegistering` · `mfaStep` · `setMfaStep` · `username` · `setUsername` · `password` · `setPassword` · `mfaCode` · `setMfaCode` · `showPassword` · `setShowPassword` · `error` · `isPending` · `onSubmit` · `onSocialLogin` · `socialConfig` · `onForgot` · `errorVariant` · `onChange` · `role` · `density` · `importance` |
| Templates | **SarakCardGrid** | `data` · `load` · `updatedAt` · `onRetry` · `label` · `mapping` · `filters` · `role` · `density` · `importance` · `variant` |
| Templates | **SarakCatalogGrid** | `items` · `loading` · `title` · `subtitle` · `categories` · `onSync` · `renderCard` · `emptyMessage` · `role` · `density` · `importance` |
| Templates | **SarakChart** | `data` · `load` · `updatedAt` · `onRetry` · `label` · `mapping` · `role` · `density` · `importance` |
| Templates | **SarakChat** | `onSend` · `loadModels` · `label` · `role` · `density` · `importance` |
| Templates | **SarakExpandableMatrix** | `data` · `subItems` · `activeMapping` · `onToggle` · `renderItemHeader` · `manifest` |
| Templates | **SarakFilterSelect** | `col` · `placeholder` · `filters` · `onChange` · `options` |
| Templates | **SarakForm** | `data` · `load` · `label` · `mapping` · `mode` · `initialData` · `onSubmit` · `onSuccess` · `role` · `density` · `importance` |
| Templates | **SarakImageCard** | `src` · `alt` · `title` · `subtitle` · `children` · `className` · `onClick` |
| Templates | **SarakManagementGrid** | `data` · `load` · `groupBy` · `ghostGroups` · `mapping` · `label` · `description` · `headerActions` · `groupActions` · `formMapping` · `onAction` · `onToggle` · `onDelete` · `onCreate` · `role` · `density` · `importance` |
| Templates | **SarakPageTransition** | `children` · `locationKey` |
| Templates | **SarakStats** | `data` · `load` · `updatedAt` · `onRetry` · `label` · `mapping` · `metrics` · `role` · `density` · `importance` |
| Templates | **SarakTable** | `onRetry` · `updatedAt` · `emptyMessage` · `loading` · `error` |
| UX | **SarakContextMenu** | `isOpen` · `position` · `onClose` · `children` · `className` |
| UX | **SarakTabs** | `tabs` · `activeTab` · `onChange` · `variant` · `fullWidth` · `className` · `listClassName` |
| UX | **SarakTooltip** | `children` · `content` · `position` · `delay` · `className` · `disabled` |

### A.2 Contrato de responsividade (gerado do uso real)

Breakpoints canônicos: **celular** < 768px · **tablet** 768–1023px · **desktop** ≥ 1024px.

**Adaptam sozinhos** (leem o dispositivo no próprio código — você não escreve CSS nem media query):

`SarakAccordion` · `SarakAnalyticalPage` · `SarakAppChrome` · `SarakDataTable` · `SarakFlex` · `SarakGrid` · `SarakHidden` · `SarakSplitPane`

**Refino opcional por dispositivo** (`SarakResponsiveValue<T>` = `{ mob, tab, desk }`) — 2 props:

| Componente | Prop |
| --- | --- |
| `SarakFlex` | `direction` |
| `SarakGrid` | `templateColumns` |

### A.3 Slots do `SarakAppChrome` (11)

Regiões do cromo que aceitam qualquer `ReactNode` (imagem, vídeo, componente animado).

| Slot | O que é |
| --- | --- |
| `secondaryContent` | Slot `secondaryContent`: segundo painel, exibido quando `isSplitViewEnabled` está ligado. |
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

**CSS Variables públicas** (715) — as ÚNICAS que a central emite; use sempre com fallback, `var(--sarak-x, valor)`. Nome fora desta lista não pinta nada:

`--sarak-accent-color` · `--sarak-action-glow-shadow-blur` · `--sarak-action-glow-shadow-offset-y` · `--sarak-action-glow-shadow-spread` · `--sarak-ai-glow` · `--sarak-ai-glow-color` · `--sarak-anim-enabled` · `--sarak-auth-hero-orb-blur` · `--sarak-b-weight` · `--sarak-badge-radius` · `--sarak-bg-base` · `--sarak-bg-base-color` · `--sarak-bg-body` · `--sarak-bg-body-rgb` · `--sarak-bg-gradient-angle` · `--sarak-bg-gradient-mode` · `--sarak-bg-layer-1` · `--sarak-bg-layer-2` · `--sarak-bg-modal` · `--sarak-bg-noise-animation` · `--sarak-bg-noise-density` · `--sarak-bg-opacity` · `--sarak-bg-pattern-id` · `--sarak-bg-pattern-opacity` · `--sarak-body-font` · `--sarak-body-lh` · `--sarak-body-line-height` · `--sarak-body-size` · `--sarak-body-weight` · `--sarak-border-beam-enabled` · `--sarak-border-radius` · `--sarak-border-style` · `--sarak-border-type` · `--sarak-border-width` · `--sarak-brand-logo-size-collapsed` · `--sarak-breakpoint-desktop` · `--sarak-breakpoint-tablet` · `--sarak-btn-active-scale` · `--sarak-btn-backdrop-blur` · `--sarak-btn-border-radius` · `--sarak-btn-ghost-hover` · `--sarak-btn-ghost-hover-bg` · `--sarak-btn-hover-scale` · `--sarak-btn-neon-glow-color` · `--sarak-btn-neon-pulse-speed` · `--sarak-btn-primary-bg` · `--sarak-btn-primary-bg-10` · `--sarak-btn-primary-bg-20` · `--sarak-btn-primary-bg-30` · `--sarak-btn-primary-bg-40` · `--sarak-btn-primary-bg-50` · `--sarak-btn-primary-bg-active` · `--sarak-btn-primary-bg-bg` · `--sarak-btn-primary-bg-border` · `--sarak-btn-primary-bg-hover` · `--sarak-btn-primary-bg-light` · `--sarak-btn-primary-bg-rgb` · `--sarak-btn-primary-text` · `--sarak-btn-radius-bl` · `--sarak-btn-radius-br` · `--sarak-btn-radius-tl` · `--sarak-btn-radius-tr` · `--sarak-btn-secondary-bg` · `--sarak-btn-secondary-bg-10` · `--sarak-btn-secondary-bg-20` · `--sarak-btn-secondary-bg-30` · `--sarak-btn-secondary-bg-40` · `--sarak-btn-secondary-bg-50` · `--sarak-btn-secondary-bg-active` · `--sarak-btn-secondary-bg-bg` · `--sarak-btn-secondary-bg-border` · `--sarak-btn-secondary-bg-hover` · `--sarak-btn-secondary-bg-light` · `--sarak-btn-secondary-bg-rgb` · `--sarak-btn-style-type` · `--sarak-button-icon-position` · `--sarak-button-width-strategy` · `--sarak-card-action-btn-bg` · `--sarak-card-action-btn-border-radius` · `--sarak-card-action-btn-hover-bg` · `--sarak-card-action-btn-padding` · `--sarak-card-action-btn-primary-bg` · `--sarak-card-action-btn-radius` · `--sarak-card-action-btn-text` · `--sarak-card-action-click-scale` · `--sarak-card-backdrop-blur` · `--sarak-card-background-color` · `--sarak-card-background-color-10` · `--sarak-card-background-color-20` · `--sarak-card-background-color-30` · `--sarak-card-background-color-40` · `--sarak-card-background-color-50` · `--sarak-card-background-color-bg` · `--sarak-card-background-color-border` · `--sarak-card-background-color-hover` · `--sarak-card-background-color-rgb` · `--sarak-card-bg` · `--sarak-card-bg-10` · `--sarak-card-bg-20` · `--sarak-card-bg-30` · `--sarak-card-bg-40` · `--sarak-card-bg-50` · `--sarak-card-bg-active` · `--sarak-card-bg-bg` · `--sarak-card-bg-border` · `--sarak-card-bg-hover` · `--sarak-card-bg-light` · `--sarak-card-bg-rgb` · `--sarak-card-border-bottom` · `--sarak-card-border-color` · `--sarak-card-border-left` · `--sarak-card-border-opacity` · `--sarak-card-border-radius` · `--sarak-card-border-right` · `--sarak-card-border-top` · `--sarak-card-border-width` · `--sarak-card-clip-path` · `--sarak-card-footer-bg` · `--sarak-card-footer-border` · `--sarak-card-geometric-cut` · `--sarak-card-glow-color` · `--sarak-card-glow-intensity` · `--sarak-card-header-bg` · `--sarak-card-header-border` · `--sarak-card-header-padding` · `--sarak-card-hover-glow` · `--sarak-card-hover-glow-increase` · `--sarak-card-hover-style` · `--sarak-card-hover-translate` · `--sarak-card-hover-y` · `--sarak-card-inner-glow-color` · `--sarak-card-inner-glow-width` · `--sarak-card-layout-direction` · `--sarak-card-opacity` · `--sarak-card-padding-md` · `--sarak-card-radius` · `--sarak-card-radius-bl` · `--sarak-card-radius-br` · `--sarak-card-radius-tl` · `--sarak-card-radius-tr` · `--sarak-card-search-bg-focus` · `--sarak-card-search-border-beam-active` · `--sarak-card-search-placeholder` · `--sarak-card-search-placeholder-color` · `--sarak-card-search-text-focus` · `--sarak-card-search-text-focus-color` · `--sarak-card-shadow` · `--sarak-card-shadow-blur` · `--sarak-card-shadow-expansion` · `--sarak-card-shadow-offset-x` · `--sarak-card-shadow-offset-y` · `--sarak-card-shadow-spread` · `--sarak-card-spotlight-opacity` · `--sarak-card-surface-opacity` · `--sarak-card-text-align` · `--sarak-card-texture-opacity` · `--sarak-card-texture-type` · `--sarak-card-title-color` · `--sarak-card-title-font-size` · `--sarak-card-title-font-weight` · `--sarak-card-title-icon-glow` · `--sarak-card-title-icon-glow-blur` · `--sarak-card-title-letter-spacing` · `--sarak-card-variant` · `--sarak-catalog-filter-min-width` · `--sarak-catalog-item-radius` · `--sarak-catalog-section-radius` · `--sarak-chart-color-palette` · `--sarak-chart-engine-min-h` · `--sarak-chart-engine-min-height` · `--sarak-chart-grid-opacity` · `--sarak-chart-primary` · `--sarak-chart-show-grid` · `--sarak-chart-smoothing` · `--sarak-chart-thickness` · `--sarak-chart-tooltip-bg` · `--sarak-chart-type` · `--sarak-chat-anim-speed` · `--sarak-chat-animation-speed` · `--sarak-chat-attachment-name-max-width` · `--sarak-chat-bubble` · `--sarak-chat-bubble-blur` · `--sarak-chat-bubble-glass-blur` · `--sarak-chat-bubble-radius` · `--sarak-chat-bubble-style` · `--sarak-chat-radius` · `--sarak-chat-token-slider-min-width` · `--sarak-chat-user-bg` · `--sarak-checkbox-active` · `--sarak-checkbox-active-10` · `--sarak-checkbox-active-20` · `--sarak-checkbox-active-30` · `--sarak-checkbox-active-40` · `--sarak-checkbox-active-50` · `--sarak-checkbox-active-active` · `--sarak-checkbox-active-bg` · `--sarak-checkbox-active-border` · `--sarak-checkbox-active-color` · `--sarak-checkbox-active-color-10` · `--sarak-checkbox-active-color-20` · `--sarak-checkbox-active-color-30` · `--sarak-checkbox-active-color-40` · `--sarak-checkbox-active-color-50` · `--sarak-checkbox-active-color-bg` · `--sarak-checkbox-active-color-border` · `--sarak-checkbox-active-color-hover` · `--sarak-checkbox-active-color-rgb` · `--sarak-checkbox-active-hover` · `--sarak-checkbox-active-light` · `--sarak-checkbox-active-rgb` · `--sarak-chrome-notifications-position` · `--sarak-chrome-search-position` · `--sarak-chrome-user-position` · `--sarak-color-bg-body` · `--sarak-color-bg-layer1` · `--sarak-color-bg-layer2` · `--sarak-color-bg-modal` · `--sarak-color-depth` · `--sarak-color-primary` · `--sarak-color-primary-10` · `--sarak-color-primary-20` · `--sarak-color-primary-30` · `--sarak-color-primary-40` · `--sarak-color-primary-50` · `--sarak-color-primary-active` · `--sarak-color-primary-bg` · `--sarak-color-primary-border` · `--sarak-color-primary-hover` · `--sarak-color-primary-light` · `--sarak-color-primary-rgb` · `--sarak-color-secondary` · `--sarak-color-secondary-10` · `--sarak-color-secondary-20` · `--sarak-color-secondary-30` · `--sarak-color-secondary-40` · `--sarak-color-secondary-50` · `--sarak-color-secondary-active` · `--sarak-color-secondary-bg` · `--sarak-color-secondary-border` · `--sarak-color-secondary-hover` · `--sarak-color-secondary-light` · `--sarak-color-secondary-rgb` · `--sarak-color-tertiary` · `--sarak-color-tertiary-10` · `--sarak-color-tertiary-20` · `--sarak-color-tertiary-30` · `--sarak-color-tertiary-40` · `--sarak-color-tertiary-50` · `--sarak-color-tertiary-active` · `--sarak-color-tertiary-bg` · `--sarak-color-tertiary-border` · `--sarak-color-tertiary-hover` · `--sarak-color-tertiary-light` · `--sarak-color-tertiary-rgb` · `--sarak-color-variation` · `--sarak-context-menu-min-width` · `--sarak-contrast` · `--sarak-control-height-toggle` · `--sarak-design-engine-sidebar-max-w` · `--sarak-design-engine-sidebar-max-width` · `--sarak-design-engine-sidebar-min-w` · `--sarak-design-engine-sidebar-min-width` · `--sarak-device-desktop-min-width` · `--sarak-device-frame-radius` · `--sarak-device-phone-height` · `--sarak-device-phone-notch-radius` · `--sarak-device-tablet-height` · `--sarak-dot-grid-dot-offset` · `--sarak-dot-grid-dot-size` · `--sarak-dot-grid-tile-size` · `--sarak-empty-state-caption-max-width` · `--sarak-empty-state-orb-blur` · `--sarak-empty-state-orb-inner` · `--sarak-empty-state-orb-outer` · `--sarak-empty-state-ring-radius` · `--sarak-empty-state-void-letter-offset` · `--sarak-engine-min-h-lg` · `--sarak-engine-min-h-sm` · `--sarak-engine-min-height-lg` · `--sarak-engine-min-height-sm` · `--sarak-flow-grid` · `--sarak-flow-grid-style` · `--sarak-flow-handle-size` · `--sarak-flow-node-blur` · `--sarak-flow-node-padding` · `--sarak-flow-node-radius` · `--sarak-flow-radius` · `--sarak-focus-ring-width` · `--sarak-focus-width` · `--sarak-font-b` · `--sarak-font-h` · `--sarak-font-m` · `--sarak-form-field-density` · `--sarak-form-label-position` · `--sarak-glass-blur` · `--sarak-glass-edge-color` · `--sarak-glass-edge-width` · `--sarak-glass-opacity` · `--sarak-glass-roughness` · `--sarak-glass-saturation` · `--sarak-glass-specularity` · `--sarak-global-background-blur` · `--sarak-global-background-image-url` · `--sarak-global-background-opacity` · `--sarak-global-bg-blur` · `--sarak-global-bg-image` · `--sarak-global-bg-opacity` · `--sarak-global-contrast` · `--sarak-global-flow-align` · `--sarak-global-flow-direction` · `--sarak-global-saturation` · `--sarak-global-section-gap` · `--sarak-h-transform` · `--sarak-h1-letter-spacing` · `--sarak-h1-lh` · `--sarak-h1-line-height` · `--sarak-h1-ls` · `--sarak-h1-size` · `--sarak-h1-weight` · `--sarak-h2-lh` · `--sarak-h2-line-height` · `--sarak-h2-size` · `--sarak-h2-weight` · `--sarak-h3-size` · `--sarak-header-alignment` · `--sarak-heading-font` · `--sarak-heading-transform` · `--sarak-icon-button-frosted-shadow-blur` · `--sarak-icon-button-frosted-shadow-offset-y` · `--sarak-icon-button-glow-blur-lg` · `--sarak-icon-button-glow-blur-md` · `--sarak-icon-button-glow-blur-sm` · `--sarak-icon-family` · `--sarak-icon-stroke` · `--sarak-icon-stroke-width` · `--sarak-icon-weight` · `--sarak-identity-align` · `--sarak-identity-alignment` · `--sarak-identity-font` · `--sarak-identity-font-family` · `--sarak-identity-font-weight` · `--sarak-identity-hover` · `--sarak-identity-hover-effect` · `--sarak-identity-padding` · `--sarak-identity-tracking` · `--sarak-identity-weight` · `--sarak-image-card-glow-blur` · `--sarak-image-card-hover-zoom` · `--sarak-image-card-overlay-opacity` · `--sarak-image-card-shadow-blur` · `--sarak-image-card-shadow-offset-y` · `--sarak-image-card-shadow-spread` · `--sarak-input-backdrop-blur` · `--sarak-input-bg` · `--sarak-input-bg-10` · `--sarak-input-bg-20` · `--sarak-input-bg-30` · `--sarak-input-bg-40` · `--sarak-input-bg-50` · `--sarak-input-bg-active` · `--sarak-input-bg-bg` · `--sarak-input-bg-border` · `--sarak-input-bg-hover` · `--sarak-input-bg-light` · `--sarak-input-bg-rgb` · `--sarak-input-border-color` · `--sarak-input-border-radius` · `--sarak-input-border-type` · `--sarak-input-error-color` · `--sarak-input-focus-border-color` · `--sarak-input-icon-color` · `--sarak-input-icon-position` · `--sarak-input-padding` · `--sarak-input-shadow` · `--sarak-input-text-color` · `--sarak-is-auto-hide-enabled` · `--sarak-is-nav-hidden` · `--sarak-is-split-view-enabled` · `--sarak-kanban-card-radius` · `--sarak-kanban-header-padding-y` · `--sarak-kanban-header-tracking` · `--sarak-layered-shadows` · `--sarak-layout-density` · `--sarak-layout-gap` · `--sarak-layout-gap-lg` · `--sarak-layout-gap-md` · `--sarak-layout-gap-sm` · `--sarak-layout-grid-min-cell` · `--sarak-layout-grid-template` · `--sarak-layout-padding` · `--sarak-layout-preview-max-h` · `--sarak-line-height` · `--sarak-management-group-list-max-height` · `--sarak-matrix-blur` · `--sarak-matrix-border-color` · `--sarak-matrix-gap` · `--sarak-matrix-item-bg` · `--sarak-matrix-node-min-width` · `--sarak-matrix-radius` · `--sarak-max-content-width` · `--sarak-mobile-navigation-style` · `--sarak-modal-action-alignment` · `--sarak-modal-blur` · `--sarak-modal-border-radius` · `--sarak-modal-header-style` · `--sarak-modal-overlay` · `--sarak-modal-overlay-blur` · `--sarak-modal-overlay-color` · `--sarak-modal-width-full` · `--sarak-modal-width-lg` · `--sarak-modal-width-md` · `--sarak-modal-width-sm` · `--sarak-modal-width-xl` · `--sarak-mode` · `--sarak-mono-font` · `--sarak-motion-dur-fast` · `--sarak-motion-dur-instant` · `--sarak-motion-dur-normal` · `--sarak-motion-dur-slow` · `--sarak-motion-duration-fast` · `--sarak-motion-duration-instant` · `--sarak-motion-duration-normal` · `--sarak-motion-duration-slow` · `--sarak-motion-ease-in` · `--sarak-motion-ease-main` · `--sarak-motion-ease-out` · `--sarak-motion-stagger` · `--sarak-motion-stagger-delay` · `--sarak-multi-select-input-min-width` · `--sarak-nav-active-color` · `--sarak-nav-active-marker-color` · `--sarak-nav-active-marker-glow` · `--sarak-nav-item-active-color` · `--sarak-nav-marker-color` · `--sarak-nav-marker-glow` · `--sarak-nav-style` · `--sarak-navbar-layout` · `--sarak-navigation-style` · `--sarak-noise-density` · `--sarak-noise-speed` · `--sarak-on-chat-user` · `--sarak-on-error` · `--sarak-on-info` · `--sarak-on-muted` · `--sarak-on-overlay` · `--sarak-on-secondary` · `--sarak-on-success` · `--sarak-on-surface` · `--sarak-on-warning` · `--sarak-page-transition-type` · `--sarak-preference-font-size-position` · `--sarak-preference-language-position` · `--sarak-preference-mode-position` · `--sarak-preference-nav-collapse-position` · `--sarak-preference-navigation-style-position` · `--sarak-preset-card-hover-shadow-offset-y` · `--sarak-preset-card-shadow-blur` · `--sarak-preset-card-shadow-offset-y` · `--sarak-preset-card-shadow-spread` · `--sarak-preset-glow-shadow-blur` · `--sarak-preset-glow-shadow-blur-lg` · `--sarak-preset-grid-texture-size` · `--sarak-preset-matte-shadow-blur1` · `--sarak-preset-matte-shadow-blur2` · `--sarak-preset-matte-shadow-offset-y2` · `--sarak-preset-matte-shadow-spread1` · `--sarak-preset-matte-shadow-spread2` · `--sarak-preset-mini-card-height` · `--sarak-preset-mini-card-max-width` · `--sarak-preset-preview-min-height` · `--sarak-preset-preview-padding-y` · `--sarak-primary-color` · `--sarak-primary-color-10` · `--sarak-primary-color-20` · `--sarak-primary-color-30` · `--sarak-primary-color-40` · `--sarak-primary-color-50` · `--sarak-primary-color-active` · `--sarak-primary-color-bg` · `--sarak-primary-color-border` · `--sarak-primary-color-hover` · `--sarak-primary-color-light` · `--sarak-primary-color-rgb` · `--sarak-progress-bar-height` · `--sarak-progress-bar-max-width` · `--sarak-progress-bar-radius` · `--sarak-range-active-bg` · `--sarak-range-active-color` · `--sarak-reduced-motion` · `--sarak-saturation` · `--sarak-scroll-padding` · `--sarak-scroll-radius` · `--sarak-scroll-thumb-color` · `--sarak-scroll-thumb-hover-opacity` · `--sarak-scroll-thumb-opacity` · `--sarak-scroll-track-opacity` · `--sarak-scroll-width` · `--sarak-search-backdrop-blur` · `--sarak-search-dropdown-gap` · `--sarak-search-dropdown-width` · `--sarak-search-position-sidebar` · `--sarak-search-position-topbar` · `--sarak-secondary-color` · `--sarak-secondary-color-10` · `--sarak-secondary-color-20` · `--sarak-secondary-color-30` · `--sarak-secondary-color-40` · `--sarak-secondary-color-50` · `--sarak-secondary-color-active` · `--sarak-secondary-color-bg` · `--sarak-secondary-color-border` · `--sarak-secondary-color-hover` · `--sarak-secondary-color-light` · `--sarak-secondary-color-rgb` · `--sarak-shadow-ambient-alpha` · `--sarak-shadow-color-mode` · `--sarak-shadow-intensity` · `--sarak-shadow-orientation` · `--sarak-shadow-projection-alpha` · `--sarak-shadow-projection-blur` · `--sarak-shell-brand-logo-size` · `--sarak-sidebar-active-color` · `--sarak-sidebar-bg` · `--sarak-sidebar-bg-rgb` · `--sarak-sidebar-blur` · `--sarak-sidebar-collapsed-width` · `--sarak-sidebar-color` · `--sarak-sidebar-hover-color` · `--sarak-sidebar-label-max-width` · `--sarak-sidebar-max-width` · `--sarak-sidebar-min-width` · `--sarak-sidebar-noise-opacity` · `--sarak-sidebar-position` · `--sarak-sidebar-shadow` · `--sarak-sidebar-width` · `--sarak-skeleton-circle-size` · `--sarak-skeleton-row-height` · `--sarak-skeleton-row-radius` · `--sarak-split-pane-min-width` · `--sarak-status-error-color` · `--sarak-status-error-color-10` · `--sarak-status-error-color-20` · `--sarak-status-error-color-30` · `--sarak-status-error-color-40` · `--sarak-status-error-color-50` · `--sarak-status-error-color-active` · `--sarak-status-error-color-bg` · `--sarak-status-error-color-border` · `--sarak-status-error-color-hover` · `--sarak-status-error-color-light` · `--sarak-status-error-color-rgb` · `--sarak-status-glow-blur` · `--sarak-status-info-color` · `--sarak-status-info-color-10` · `--sarak-status-info-color-20` · `--sarak-status-info-color-30` · `--sarak-status-info-color-40` · `--sarak-status-info-color-50` · `--sarak-status-info-color-active` · `--sarak-status-info-color-bg` · `--sarak-status-info-color-border` · `--sarak-status-info-color-hover` · `--sarak-status-info-color-light` · `--sarak-status-info-color-rgb` · `--sarak-status-success-color` · `--sarak-status-success-color-10` · `--sarak-status-success-color-20` · `--sarak-status-success-color-30` · `--sarak-status-success-color-40` · `--sarak-status-success-color-50` · `--sarak-status-success-color-active` · `--sarak-status-success-color-bg` · `--sarak-status-success-color-border` · `--sarak-status-success-color-hover` · `--sarak-status-success-color-light` · `--sarak-status-success-color-rgb` · `--sarak-status-warning-color` · `--sarak-status-warning-color-10` · `--sarak-status-warning-color-20` · `--sarak-status-warning-color-30` · `--sarak-status-warning-color-40` · `--sarak-status-warning-color-50` · `--sarak-status-warning-color-active` · `--sarak-status-warning-color-bg` · `--sarak-status-warning-color-border` · `--sarak-status-warning-color-hover` · `--sarak-status-warning-color-light` · `--sarak-status-warning-color-rgb` · `--sarak-surface` · `--sarak-surface-color` · `--sarak-surface-intensity` · `--sarak-surface-material` · `--sarak-switch-active-bg` · `--sarak-switch-active-bg-10` · `--sarak-switch-active-bg-20` · `--sarak-switch-active-bg-30` · `--sarak-switch-active-bg-40` · `--sarak-switch-active-bg-50` · `--sarak-switch-active-bg-active` · `--sarak-switch-active-bg-bg` · `--sarak-switch-active-bg-border` · `--sarak-switch-active-bg-hover` · `--sarak-switch-active-bg-light` · `--sarak-switch-active-bg-rgb` · `--sarak-switch-backdrop-blur` · `--sarak-switch-label-position` · `--sarak-switch-pulse-color` · `--sarak-switch-style-type` · `--sarak-switch-thumb` · `--sarak-switch-thumb-bg` · `--sarak-switch-track-active-bg` · `--sarak-switch-track-active-bg-10` · `--sarak-switch-track-active-bg-20` · `--sarak-switch-track-active-bg-30` · `--sarak-switch-track-active-bg-40` · `--sarak-switch-track-active-bg-50` · `--sarak-switch-track-active-bg-bg` · `--sarak-switch-track-active-bg-border` · `--sarak-switch-track-active-bg-hover` · `--sarak-switch-track-active-bg-rgb` · `--sarak-system-tone` · `--sarak-tab-gap` · `--sarak-tab-section-margin` · `--sarak-table-border` · `--sarak-table-border-color` · `--sarak-table-border-radius` · `--sarak-table-cell-padding` · `--sarak-table-density` · `--sarak-table-header-bg` · `--sarak-table-padding` · `--sarak-table-row-hover` · `--sarak-table-row-hover-bg` · `--sarak-table-zebra-striping` · `--sarak-tertiary-color` · `--sarak-tertiary-color-10` · `--sarak-tertiary-color-20` · `--sarak-tertiary-color-30` · `--sarak-tertiary-color-40` · `--sarak-tertiary-color-50` · `--sarak-tertiary-color-active` · `--sarak-tertiary-color-bg` · `--sarak-tertiary-color-border` · `--sarak-tertiary-color-hover` · `--sarak-tertiary-color-light` · `--sarak-tertiary-color-rgb` · `--sarak-text-color-master` · `--sarak-text-color-muted` · `--sarak-text-color-secondary` · `--sarak-text-glow` · `--sarak-text-glow-intensity` · `--sarak-text-main` · `--sarak-text-muted` · `--sarak-text-sec` · `--sarak-text-smoothing` · `--sarak-texture` · `--sarak-texture-color` · `--sarak-texture-color-10` · `--sarak-texture-color-20` · `--sarak-texture-color-30` · `--sarak-texture-color-40` · `--sarak-texture-color-50` · `--sarak-texture-color-active` · `--sarak-texture-color-bg` · `--sarak-texture-color-border` · `--sarak-texture-color-hover` · `--sarak-texture-color-light` · `--sarak-texture-color-rgb` · `--sarak-texture-opacity` · `--sarak-title-color` · `--sarak-toast-accent-width` · `--sarak-toast-max-width` · `--sarak-toast-min-width` · `--sarak-tooltip-bg` · `--sarak-tooltip-border` · `--sarak-tooltip-border-color` · `--sarak-tooltip-radius` · `--sarak-tooltip-text` · `--sarak-tooltip-text-color` · `--sarak-topbar-active-color` · `--sarak-topbar-bg` · `--sarak-topbar-collapsed-height` · `--sarak-topbar-color` · `--sarak-topbar-height` · `--sarak-topbar-hover-color` · `--sarak-topbar-label-max-width` · `--sarak-topbar-noise-opacity` · `--sarak-topbar-title-color` · `--sarak-touch-target-min` · `--sarak-tracking-snug` · `--sarak-tracking-tight` · `--sarak-tracking-ultra` · `--sarak-tracking-wide` · `--sarak-tracking-wider` · `--sarak-tracking-widest` · `--sarak-type-scale-caption` · `--sarak-type-scale-micro` · `--sarak-type-scale-tiny` · `--sarak-type-scale-xl` · `--sarak-type-scale-xs` · `--sarak-type-scale2xs` · `--sarak-type-scale3xs` · `--sarak-vignette-blend-mode` · `--sarak-vignette-color` · `--sarak-vignette-opacity` · `--sarak-vignette-softness` · `--sarak-z-base` · `--sarak-z-index-base` · `--sarak-z-index-modal` · `--sarak-z-index-sidebar` · `--sarak-z-index-toast` · `--sarak-z-index-tooltip` · `--sarak-z-modal` · `--sarak-z-sidebar` · `--sarak-z-toast` · `--sarak-z-tooltip`

**Tokens de TEMA** (398 chaves válidas de `design` num tema JSON) — lista completa com tipo em `catalog.json` → `designTokens.ids`. 37 deles aceitam `SarakResponsiveValue`.

**Temas embutidos** (14): `sarak-sovereign` · `cyberpunk-neon` · `industrial-terminal` · `neo-brutalism` · `synthwave-retro` · `nebula-space` · `kinetic-flow` · `cyber-retro-wave` · `minimalist-airy` · `data-terminal` · `neumorphic-mobile` · `golden-hour` · `aurora-veil` · `blueprint-protocol`

**Par de referência** (parta destes — completos em todos os eixos): `minimalist-airy` · `sarak-sovereign`

### A.4b Mapa dos tokens por pilar (gerado do schema)

**398** de 398 tokens já trazem o que mudam na tela. **Estético** = o tema o projeta; **funcional** = igual em todo tema (camadas, alvo de toque, larguras do cromo, comportamento) e o tema embarcado não o declara. **Modo** = o valor muda no modo claro/escuro, então entra na `contraparte` do tema. Opções e faixas ficam em `catalog.json` → `designTokens.ids`.

#### 0. Configurações Globais (`global`)

| Token | Natureza | Modo | O que muda | Depende de |
| --- | --- | --- | --- | --- |
| `bodySize` | estético | não | Tamanho da fonte do `body` (12 a 20 px): todo texto que herda dele muda, e as alturas do cromo acompanham. A preferência de tamanho do usuário (P/M/G) soma-se a este valor. | — |
| `mobileNavigationStyle` | funcional | não | Onde a navegação fica no celular: barra na base, gaveta atrás do hambúrguer ou automático (barra com até 5 destinos, gaveta acima disso). Tablet e desktop não mudam. | `navigationStyle` |
| `mode` | estético | não | Declara o modo nativo do tema: define o ícone do alternador e a mistura da vinheta. A paleta só inverte pela preferência de modo do usuário (`colorMode`), que aplica a contraparte; sozinho, o valor não repinta a tela. | `vignetteOpacity` |
| `navigationStyle` | funcional | não | Escolhe onde fica a navegação: Sidebar (coluna lateral) ou Topbar (cabeçalho). Troca a estrutura inteira do cromo; a preferência do usuário, quando oferecida, vence o valor do tema. | `sidebarPosition` · `mobileNavigationStyle` |

#### Identidade Visual (`branding`)

| Token | Natureza | Modo | O que muda | Depende de |
| --- | --- | --- | --- | --- |
| `identityAlignment` | estético | não | Alinha a marca (logo e nome) dentro do bloco de identidade do cromo, na lateral e no topo: esquerda, centro ou direita. | — |
| `identityFontFamily` | estético | não | Família do nome da marca no cromo (só o texto, não a imagem do logo); o padrão herda a fonte de títulos do tema. | — |
| `identityFontWeight` | estético | não | Peso da fonte do nome da marca no cromo; pesos altos dão presença de logotipo e baixos um ar editorial. | — |
| `identityHoverEffect` | estético | não | Resposta do bloco da marca sob o ponteiro: Nenhum, Brilho (sombra luminosa), Opacidade (esmaece a 70%) ou Escala (cresce 4%). | — |
| `identityPadding` | estético | não | Respiro extra ao redor do bloco da marca no cromo, somado ao respiro base; também aumenta a altura do bloco na lateral. | — |
| `identityTracking` | estético | não | Espaçamento entre as letras do nome da marca no cromo; positivo afasta (wordmark), negativo aperta, e o bloco inteiro cresce ou encolhe. | — |

#### Configurações de Layout (`system`)

| Token | Natureza | Modo | O que muda | Depende de |
| --- | --- | --- | --- | --- |
| `borderRadius` | estético | não | Raio de referência dos componentes sem raio próprio: acordeão, paleta de busca, motor de fluxo e outros; 0 deixa os cantos retos, inclusive no acordeão; vale escalar ou por breakpoint. | `cardBorderRadius` |
| `borderStyle` | estético | não | Traço das bordas que seguem o sistema (contínuo, tracejado, pontilhado ou sem borda): o cromo, o separador do painel dividido e as classes utilitárias de borda. | — |
| `borderWidth` | estético | não | Espessura das linhas divisórias do feed de atividade e do separador do painel dividido, e das demais linhas que leem a variável de borda do sistema (dados, botões de ícone com contorno). | — |
| `iconFamily` | estético | não | Família dos ícones do cromo e dos componentes: Phosphor, Lucide ou Tabler; troca o desenho de todos os ícones (Phosphor em peso, as outras em traço). | — |
| `iconStrokeWidth` | estético | não | Espessura do traço dos ícones Lucide e Tabler; os ícones Phosphor, desenhados por peso, ignoram o valor. | `iconFamily` |
| `iconWeight` | estético | não | Peso do ícone: na família Phosphor escolhe o desenho (fino, regular, negrito, preenchido); em Tabler ajusta a espessura do traço. | `iconFamily` |
| `isAutoHideEnabled` | funcional | não | Esconde a navegação até o ponteiro chegar à borda e devolve a largura ao conteúdo; ligado, a barra não aparece no primeiro quadro. | — |
| `isSplitViewEnabled` | funcional | não | Habilita o painel secundário ao lado do conteúdo do cromo (`secondaryContent`); desligado, o painel não é desenhado. | — |
| `layoutDensity` | estético | não | Escala o respiro interno da região de conteúdo do cromo: compacto reduz a 75%, confortável mantém e espaçoso aumenta a 125%. | — |
| `layoutGap` | estético | não | Espaçamento padrão entre irmãos quando o componente não define o seu: o `SarakFlex` e a `SarakGrid` (sem `globalSectionGap`) leem este valor, por breakpoint. | — |
| `layoutGapLg` | estético | não | Escala grande de espaçamento: entre seções e estados vazios, por breakpoint. | — |
| `layoutGapMd` | estético | não | Escala média de espaçamento, a mais usada: entre os grupos do cromo e nos blocos de conteúdo padrão, por breakpoint. | — |
| `layoutGapSm` | estético | não | Escala pequena de espaçamento: o respiro dos botões e dos campos do cromo e dos agrupamentos densos, por breakpoint. | — |
| `layoutPadding` | estético | não | Respiro entre a região de conteúdo do cromo e as bordas, em pixels, com um valor por breakpoint; a densidade multiplica este valor. | — |
| `maxContentWidth` | estético | não | Largura máxima da região de conteúdo do cromo, centralizada na tela; 100% ocupa a largura inteira. | — |

#### Container de Nav (`navigation`)

| Token | Natureza | Modo | O que muda | Depende de |
| --- | --- | --- | --- | --- |
| `brandLogoSizeCollapsed` | funcional | não | Lado do logo na barra do topo recolhida; só aparece com `isNavHidden` ligado. | `isNavHidden` |
| `chromeNotificationsPosition` | funcional | não | Posição das notificações no cromo: fixas, no menu de preferências ou não oferecidas. | — |
| `chromeSearchPosition` | funcional | não | Posição do widget de busca no cromo: fixo na barra, dentro do menu de preferências ou não oferecido; fora da barra ele some do lugar de origem. | `searchPositionTopbar` · `searchPositionSidebar` |
| `chromeUserPosition` | funcional | não | Posição do widget de usuário no cromo: fixo, no menu de preferências ou não oferecido; sem ele a navegação ganha o espaço. | — |
| `isNavHidden` | funcional | não | Recolhe a navegação: a lateral estreita para o piso de largura e esconde rótulos; o topo encolhe para a altura recolhida. É o mesmo estado que o usuário alterna pelo botão de recolher. | `sidebarMinWidth` · `topbarCollapsedHeight` · `brandLogoSizeCollapsed` |
| `navActiveMarkerColor` | estético | sim | Cor do marcador luminoso ao lado do item ativo e do brilho dele. | `navActiveMarkerGlow` |
| `navActiveMarkerGlow` | estético | não | Raio do brilho do marcador do item ativo; 0 deixa só a barrinha. | `navActiveMarkerColor` |
| `navbarLayout` | funcional | não | Comportamento da barra do topo: fixa ao rolar, rola junto com o conteúdo ou oculta. Só vale com navegação no topo. | `navigationStyle` |
| `navItemActiveColor` | estético | sim | Cor do item ativo da navegação: texto, ícone e contorno do item atual, na lateral e no topo. | — |
| `searchDropdownGap` | funcional | não | Distância, em rem, entre o topo da tela e a paleta de busca; empurra o painel para baixo. | `searchDropdownWidth` |
| `searchDropdownWidth` | funcional | não | Largura máxima da paleta de busca. | `searchDropdownGap` |
| `searchPositionSidebar` | funcional | não | Onde a busca fica na navegação lateral: no topo ou no rodapé do bloco. | `navigationStyle` · `chromeSearchPosition` |
| `searchPositionTopbar` | funcional | não | Onde a busca fica na barra do topo: esquerda (antes da navegação), centro (no meio do espaço livre entre a navegação e o grupo final, não no centro da barra), direita (no grupo final) ou oculta. | `navigationStyle` · `chromeSearchPosition` |
| `shellBrandLogoSize` | funcional | não | Lado da imagem do logo na navegação lateral; aumenta a altura do bloco da marca. | `navigationStyle` |
| `sidebarActiveColor` | estético | sim | Fundo do item ativo da navegação lateral; o padrão é transparente, e o marcador do item vem de `navActiveMarkerColor`. | `navigationStyle` · `navActiveMarkerColor` |
| `sidebarBlur` | estético | não | Desfoque do que passa atrás da navegação lateral, útil com cor translúcida. | `sidebarColor` |
| `sidebarCollapsedWidth` | funcional | não | Largura da navegação lateral recolhida (só ícones); vale sem o piso de `sidebarMinWidth`, que é da lateral aberta. | `isNavHidden` |
| `sidebarColor` | estético | sim | Pinta o fundo da navegação lateral; a cor entra na paleta derivada do cromo. | `navigationStyle` |
| `sidebarHoverColor` | estético | sim | Fundo do item da navegação lateral sob o ponteiro; o padrão é um branco translúcido. | `navigationStyle` |
| `sidebarLabelMaxWidth` | funcional | não | Largura máxima do rótulo da marca na navegação lateral; acima dela o texto é cortado. | `navigationStyle` |
| `sidebarMaxWidth` | funcional | não | Teto de largura da navegação lateral; `sidebarWidth` acima dele é cortado. | `sidebarWidth` |
| `sidebarMinWidth` | funcional | não | Piso de largura da navegação lateral aberta; o valor também limita `sidebarWidth`. Recolhida, a largura é a de `sidebarCollapsedWidth`, sem este piso. | `sidebarWidth` · `sidebarCollapsedWidth` |
| `sidebarNoiseOpacity` | estético | sim | Opacidade da textura de grão sobre a navegação lateral; 0 desliga. | `navigationStyle` |
| `sidebarPosition` | funcional | não | Lado da navegação lateral: esquerda, direita (inverte a ordem) ou flutuante (cartão arredondado com margem). Só vale com navegação lateral. | `navigationStyle` |
| `sidebarShadow` | estético | sim | Sombra da navegação lateral, escrita como `box-shadow` completo; a cor da sombra precisa ser trocada na contraparte. | `navigationStyle` |
| `sidebarWidth` | funcional | não | Largura da navegação lateral (um valor por breakpoint), dentro do piso e do teto de `sidebarMinWidth` e `sidebarMaxWidth`. | `sidebarMinWidth` · `sidebarMaxWidth` |
| `tabGap` | estético | não | Espaço entre os itens da navegação, por breakpoint; a lateral usa metade do valor em cada eixo. | — |
| `tabSectionMargin` | estético | não | Margem vertical das seções da navegação lateral e da barra do topo, por breakpoint. | — |
| `topbarActiveColor` | estético | sim | Fundo do item ativo da barra do topo; o padrão é transparente. | `navigationStyle` |
| `topbarCollapsedHeight` | funcional | não | Altura da barra do topo recolhida; só aparece com `isNavHidden` ligado. Abaixo do alvo mínimo de toque (`touchTargetMin`) os controles da barra transbordam com ponteiro de dedo; por isso o padrão não cai abaixo dele. | `isNavHidden` |
| `topbarColor` | estético | sim | Pinta o fundo da barra do topo; a cor entra na paleta derivada do cromo. | `navigationStyle` |
| `topbarHeight` | funcional | não | Altura da barra do topo, por breakpoint. | `navigationStyle` |
| `topbarHoverColor` | estético | sim | Fundo do item da barra do topo sob o ponteiro; o padrão é um branco translúcido. | `navigationStyle` |
| `topbarLabelMaxWidth` | funcional | não | Largura máxima do rótulo da marca na barra do topo; acima dela o texto é cortado. | `navigationStyle` |
| `topbarNoiseOpacity` | estético | sim | Opacidade da textura de grão sobre a barra do topo; 0 desliga. | `navigationStyle` |
| `topbarTitleColor` | estético | sim | Cor do nome da marca na barra do topo. | `navigationStyle` |

#### Card Geral (`cards`)

| Token | Natureza | Modo | O que muda | Depende de |
| --- | --- | --- | --- | --- |
| `borderBeamEnabled` | estético | não | Anel de luz na cor primária que gira pela borda de todo cartão (título, ação, busca e composto). Desligado (padrão), nenhuma animação roda. Fica parado fora da tela, some com movimento reduzido, e dezenas de cartões visíveis com o traço aceso custam quadros: use em poucos cartões de destaque. | `primaryColor` · `cardBorderRadius` · `cardBorderWidth` |
| `cardBackdropBlur` | estético | não | Desfoca o que passa por trás do cartão, como vidro fosco; só se vê com superfície translúcida, e o material de superfície soma desfoque a este valor. | `cardSurfaceOpacity` |
| `cardBorderBottom` | estético | não | Sobrepõe a espessura da borda só na base do cartão; sem declarar, vale `cardBorderWidth`. | `cardBorderWidth` |
| `cardBorderLeft` | estético | não | Sobrepõe a espessura da borda só no lado esquerdo do cartão; sem declarar, vale `cardBorderWidth`. | `cardBorderWidth` |
| `cardBorderOpacity` | estético | sim | Atenua a cor da borda do cartão sem trocar a cor; zero apaga o contorno mesmo com espessura. | `cardBorderWidth` |
| `cardBorderRadius` | estético | não | Arredonda os quatro cantos de todo cartão e do contêiner `.card` (cartões, catálogo, grade, tabela); os tokens de canto só o sobrepõem quando declarados. Aceita um valor por dispositivo. | — |
| `cardBorderRight` | estético | não | Sobrepõe a espessura da borda só no lado direito do cartão; sem declarar, vale `cardBorderWidth`. | `cardBorderWidth` |
| `cardBorderTop` | estético | não | Sobrepõe a espessura da borda só no lado de cima do cartão, por exemplo para uma faixa de destaque; sem declarar, vale `cardBorderWidth`. | `cardBorderWidth` |
| `cardBorderWidth` | estético | não | Espessura do contorno dos quatro lados de todo cartão e `.card`. Também define a espessura da linha divisória do cabeçalho e do rodapé de `SarakCard` e o contorno do `SarakImageCard`. | — |
| `cardFooterBg` | estético | sim | Pinta o fundo do rodapé de `SarakCard.Footer`; transparente funde o rodapé ao corpo do cartão. | — |
| `cardFooterBorder` | estético | sim | Cor da linha divisória no topo do rodapé de `SarakCard.Footer`; a espessura da linha é a de `cardBorderWidth`. | `cardBorderWidth` |
| `cardGeometricCut` | estético | não | Recorta os quatro cantos do cartão em diagonal (chanfro), em todo cartão e `.card`. O recorte também corta a sombra e o brilho externos, que ficam visíveis só por dentro dele. | — |
| `cardGlowColor` | estético | sim | Cor do brilho externo do cartão e do halo do `SarakImageCard`; só aparece com intensidade acima de zero. | `cardGlowIntensity` |
| `cardGlowIntensity` | estético | sim | Opacidade do brilho externo do cartão, na cor de `cardGlowColor`; zero desliga o efeito. | `cardGlowColor` |
| `cardHeaderBg` | estético | sim | Pinta o fundo do cabeçalho de `SarakCard.Header`; transparente funde o cabeçalho ao corpo do cartão. | — |
| `cardHeaderBorder` | estético | sim | Cor da linha divisória na base do cabeçalho de `SarakCard.Header`; a espessura da linha é a de `cardBorderWidth`. | `cardBorderWidth` |
| `cardHeaderPadding` | estético | não | Respiro vertical interno do cabeçalho de `SarakCard.Header`, em cima e embaixo, por dispositivo. | — |
| `cardHoverGlowIncrease` | estético | sim | Quanto o brilho externo do cartão ganha ao passar o ponteiro, somado à intensidade de repouso e limitado a 1. | `cardGlowIntensity` · `cardGlowColor` |
| `cardHoverTranslate` | estético | não | Quanto o cartão sobe (negativo) ao passar o ponteiro, quando o estilo de hover é a elevação; vale para o `SarakCard` interativo, o de título e o de imagem. | `cardHoverStyle` |
| `cardInnerGlowColor` | estético | sim | Cor do filete luminoso que o cartão projeta para dentro do próprio contorno, somado à sombra; transparente não desenha nada. | `cardInnerGlowWidth` |
| `cardInnerGlowWidth` | estético | não | Espessura do filete luminoso interno do cartão; zero o apaga. A cor vem de `cardInnerGlowColor`. | `cardInnerGlowColor` |
| `cardLayoutDirection` | estético | não | Empilha ou alinha lado a lado os blocos dos cartões de título, de ação, de busca e expansível; o `SarakCard` composto não lê este token. | — |
| `cardPaddingMd` | estético | não | Respiro interno do corpo do cartão e entre os blocos do cartão composto, por dispositivo; é a escala de padding mais usada pelos cartões. | — |
| `cardRadiusBL` | estético | não | Sobrepõe o raio só no canto inferior esquerdo dos cartões; sem declarar, vale o raio mestre. | `cardBorderRadius` |
| `cardRadiusBR` | estético | não | Sobrepõe o raio só no canto inferior direito dos cartões; sem declarar, vale o raio mestre. | `cardBorderRadius` |
| `cardRadiusTL` | estético | não | Sobrepõe o raio só no canto superior esquerdo dos cartões, para formas assimétricas; sem declarar, vale o raio mestre. | `cardBorderRadius` |
| `cardRadiusTR` | estético | não | Sobrepõe o raio só no canto superior direito dos cartões; sem declarar, vale o raio mestre. | `cardBorderRadius` |
| `cardShadow` | estético | sim | Substitui a sombra base do cartão por uma sombra CSS escrita por inteiro, com várias camadas; o brilho interno continua somado. Como carrega cor, a sombra errada num dos modos some ou pesa. | `cardInnerGlowColor` |
| `cardShadowBlur` | estético | não | Desfoque da sombra base do cartão: zero dá a sombra dura e recortada, valores altos a espalham em névoa. | — |
| `cardShadowExpansion` | estético | não | Engorda (positivo) ou encolhe (negativo) a sombra base além do contorno do cartão; negativo mantém a elevação contida por baixo dele. | — |
| `cardShadowOffsetX` | estético | não | Desloca a sombra base do cartão na horizontal; com desfoque zero e deslocamento nos dois eixos vira a sombra dura do brutalismo. | `cardShadowBlur` · `shadowOrientation` |
| `cardShadowOffsetY` | estético | não | Desloca a sombra base do cartão na vertical, para baixo quando positivo; `shadowOrientation` gira a direção sobre este valor. | `shadowOrientation` |
| `cardShadowSpread` | estético | sim | Opacidade da sombra base do cartão, em porcentagem; acima de 100 a cor já é cheia. A cor vem de `shadowColorMode` e a forma dos tokens `cardShadow*` de deslocamento, desfoque e expansão. | `shadowColorMode` |
| `cardSpotlightOpacity` | estético | sim | Luz difusa na cor primária que acompanha o cursor sobre o cartão (título, ação, busca e composto) enquanto o ponteiro está nele; sem ponteiro fino, fica no centro do cartão. Zero apaga a luz e dispensa o acompanhamento. | `primaryColor` |
| `cardSurfaceOpacity` | estético | sim | Multiplica a opacidade do fundo do cartão: zero deixa o cartão sem fundo e valores altos o tornam sólido. Vale só para o fundo, o conteúdo do cartão fica opaco. | — |
| `cardTextAlign` | estético | não | Alinha o texto e distribui o conteúdo dos cartões de título, de ação e de busca; o `SarakCard` composto não lê este token. | — |
| `cardTextureOpacity` | estético | sim | Intensidade da textura do cartão, de invisível a cobrindo a superfície; sem um tipo de textura escolhido não há o que mostrar. | `cardTextureType` |
| `cardTextureType` | estético | não | Desenha uma textura sobre a superfície de todo cartão e `.card`. O desenho é este token; a cor vem do tema: a maioria usa `textureColor`, algumas a primária ou a borda do cartão, e ruído, grão e papel não têm cor própria. | `cardTextureOpacity` · `textureColor` |
| `cardVariant` | funcional | não | Escolhe qual cartão a `SarakCardGrid` desenha para cada registro quando a prop `variant` não é passada; é escolha de componente, não de estilo, e o tema não a declara. | `cardTitleFontSize` · `cardActionBtnPrimaryBg` · `cardSearchBgFocus` |
| `catalogFilterMinWidth` | funcional | não | Largura mínima de cada filtro de seleção da `SarakCardGrid`; mantém o filtro utilizável em contêiner estreito. | — |
| `catalogItemRadius` | estético | não | Arredonda cada item do `SarakCatalogGrid`, em `rem`; costuma ser menor que o da seção, para manter a hierarquia. | — |
| `catalogSectionRadius` | estético | não | Arredonda a seção inteira do `SarakCatalogGrid`, em `rem` (relativo ao tamanho da fonte raiz). | — |
| `controlHeightToggle` | funcional | não | Altura do alternador mostrado na tela de exemplo (kitchen sink) do painel de customização; não muda o `SarakSwitch` do sistema. | — |
| `deviceDesktopMinWidth` | funcional | não | Largura mínima da moldura de desktop na pré-visualização do painel de customização; não muda componente do sistema. | — |
| `deviceFrameRadius` | funcional | não | Arredondamento da moldura externa dos dispositivos na pré-visualização do painel de customização, em `rem`; não muda componente do sistema. | — |
| `devicePhoneHeight` | funcional | não | Altura da moldura de telefone na pré-visualização responsiva do painel de customização; não muda componente do sistema. | — |
| `devicePhoneNotchRadius` | funcional | não | Arredondamento do recorte de câmera da moldura de telefone na pré-visualização do painel de customização, em `rem`; não muda componente do sistema. | — |
| `deviceTabletHeight` | funcional | não | Altura da moldura de tablet na pré-visualização responsiva do painel de customização; não muda componente do sistema. | — |
| `imageCardGlowBlur` | estético | não | Largura do halo interno que acende ao passar o ponteiro sobre o `SarakImageCard`; a cor é a de `cardGlowColor` (a primária no hover de brilho). | `cardGlowColor` |
| `imageCardHoverZoom` | estético | não | Quanto a imagem de capa do `SarakImageCard` cresce, atrás do véu e do texto, quando o ponteiro passa sobre qualquer parte do cartão; 1 deixa a imagem parada. | `imageCardOverlayOpacity` |
| `imageCardOverlayOpacity` | estético | sim | Opacidade do véu na cor do cartão sobre a foto do `SarakImageCard`; sobe para dar leitura ao texto, desce para mostrar a foto. | — |
| `imageCardShadowBlur` | estético | não | Desfoque da sombra do `SarakImageCard`. | `imageCardShadowOffsetY` |
| `imageCardShadowOffsetY` | estético | não | Desloca para baixo a sombra do `SarakImageCard`. | `imageCardShadowBlur` |
| `imageCardShadowSpread` | estético | não | Quanto a sombra do `SarakImageCard` é contraída para dentro do cartão; valores altos a escondem sob ele. | `imageCardShadowBlur` |
| `managementGroupListMaxHeight` | funcional | não | Altura máxima da lista de cada grupo do `SarakManagementGrid`; acima dela a lista rola por dentro do grupo. | — |
| `matrixNodeMinWidth` | funcional | não | Largura mínima de cada nó filho da `SarakExpandableMatrix` na variante de alternador; impede que nós de pouco conteúdo fiquem espremidos. | — |
| `presetCardHoverShadowOffsetY` | funcional | não | Deslocamento vertical da sombra do cartão de pré-visualização de preset ao passar o ponteiro, no painel de customização; não pinta nenhum componente do sistema. | — |
| `presetCardShadowBlur` | funcional | não | Desfoque da sombra em repouso do cartão de preset no painel de customização; não pinta nenhum componente do sistema. | — |
| `presetCardShadowOffsetY` | funcional | não | Deslocamento vertical da sombra em repouso do cartão de preset no painel de customização; não pinta nenhum componente do sistema. | — |
| `presetCardShadowSpread` | funcional | não | Contração da sombra em repouso do cartão de preset no painel de customização; não pinta nenhum componente do sistema. | — |
| `presetGlowShadowBlur` | funcional | não | Desfoque do brilho simples dos botões de pré-visualização de preset, no painel de customização; não pinta nenhum componente do sistema. | — |
| `presetGlowShadowBlurLg` | funcional | não | Desfoque do brilho grande dos botões de pré-visualização de preset, no painel de customização; não pinta nenhum componente do sistema. | — |
| `presetGridTextureSize` | funcional | não | Tamanho da célula da grade decorativa no fundo do cartão de preset, no painel de customização; não pinta nenhum componente do sistema. | — |
| `presetMatteShadowBlur1` | funcional | não | Desfoque da primeira camada da sombra fosca dos botões de pré-visualização, no painel de customização; não pinta nenhum componente do sistema. | — |
| `presetMatteShadowBlur2` | funcional | não | Desfoque da segunda camada da sombra fosca dos botões de pré-visualização, no painel de customização; não pinta nenhum componente do sistema. | — |
| `presetMatteShadowOffsetY2` | funcional | não | Deslocamento vertical da segunda camada da sombra fosca dos botões de pré-visualização, no painel de customização; não pinta nenhum componente do sistema. | — |
| `presetMatteShadowSpread1` | funcional | não | Contração da primeira camada da sombra fosca dos botões de pré-visualização, no painel de customização; não pinta nenhum componente do sistema. | — |
| `presetMatteShadowSpread2` | funcional | não | Contração da segunda camada da sombra fosca dos botões de pré-visualização, no painel de customização; não pinta nenhum componente do sistema. | — |
| `presetMiniCardHeight` | funcional | não | Altura do mini-cartão que representa um preset de cartão na lista do painel de customização; não pinta nenhum componente do sistema. | — |
| `presetMiniCardMaxWidth` | funcional | não | Largura máxima do mini-cartão que representa um preset de cartão na lista do painel de customização; não pinta nenhum componente do sistema. | — |
| `presetPreviewMinHeight` | funcional | não | Altura mínima dos cartões de pré-visualização de botão e de campo, no painel de customização; evita salto de layout e não pinta nenhum componente do sistema. | — |
| `presetPreviewPaddingY` | funcional | não | Respiro vertical dos cartões de pré-visualização de botão e de campo, no painel de customização; não pinta nenhum componente do sistema. | — |
| `progressBarMaxWidth` | funcional | não | Largura máxima da barra de progresso mostrada na tela de exemplo (kitchen sink) do painel de customização; não muda componente do sistema. | — |

#### Card de Título (`cardTitle`)

| Token | Natureza | Modo | O que muda | Depende de |
| --- | --- | --- | --- | --- |
| `cardTitleColor` | estético | sim | Cor do título do `SarakTitleCard`; precisa de contraste com o fundo do cartão nos dois modos. | — |
| `cardTitleFontSize` | estético | não | Tamanho da fonte do título do `SarakTitleCard`, e com ele a altura do cartão, por dispositivo. | — |
| `cardTitleFontWeight` | estético | não | Peso da fonte do título do `SarakTitleCard`; valor fora das opções cai no padrão. | — |
| `cardTitleIconGlow` | estético | sim | Cor do halo em volta do ícone do título do `SarakTitleCard`. | `cardTitleIconGlowBlur` |
| `cardTitleIconGlowBlur` | estético | não | Quanto o halo do ícone do título se espalha; zero o apaga. | `cardTitleIconGlow` |
| `cardTitleLetterSpacing` | estético | não | Espaço entre as letras do título do `SarakTitleCard`, em px; negativo aperta e positivo abre. | — |

#### Card de Ação (`cardAction`)

| Token | Natureza | Modo | O que muda | Depende de |
| --- | --- | --- | --- | --- |
| `cardActionBtnBorderRadius` | estético | não | Arredonda o botão de ação do `SarakActionCard`, por dispositivo. | — |
| `cardActionBtnHoverBg` | estético | sim | Fundo do botão de ação do `SarakActionCard` ao passar o ponteiro ou pressionar; por padrão repete o fundo normal. | `cardActionBtnPrimaryBg` |
| `cardActionBtnPadding` | estético | não | Respiro vertical interno do botão de ação do `SarakActionCard`, em px; define a altura do botão. | — |
| `cardActionBtnPrimaryBg` | estético | sim | Fundo do botão de ação do `SarakActionCard`; por padrão segue a cor primária do tema. | — |
| `cardActionBtnText` | estético | sim | Cor do texto e do ícone do botão de ação do `SarakActionCard`; precisa de contraste com o fundo do botão. | `cardActionBtnPrimaryBg` |
| `cardActionClickScale` | estético | não | Quanto o botão de ação do `SarakActionCard` encolhe enquanto está pressionado, por clique ou toque; 1 não encolhe. | `cardActionBtnPrimaryBg` |

#### Card de Busca (`cardSearch`)

| Token | Natureza | Modo | O que muda | Depende de |
| --- | --- | --- | --- | --- |
| `cardSearchBgFocus` | estético | sim | Fundo do campo do `SarakSearchCard` enquanto ele tem o foco. | — |
| `cardSearchBorderBeamActive` | estético | não | Anel de luz na cor primária que gira pela borda do `SarakSearchCard` só enquanto o campo de busca tem o foco; fora do foco nada anima. Ligado por padrão. `borderBeamEnabled` o mantém aceso mesmo sem foco; movimento reduzido o apaga. | `borderBeamEnabled` · `primaryColor` |
| `cardSearchPlaceholderColor` | estético | sim | Cor do texto de exemplo do campo do `SarakSearchCard`, antes de digitar. | — |
| `cardSearchTextFocusColor` | estético | sim | Cor do texto digitado no campo do `SarakSearchCard` enquanto ele tem o foco; precisa de contraste com o fundo em foco. | `cardSearchBgFocus` |

#### Sobreposições (Overlays) (`overlays`)

| Token | Natureza | Modo | O que muda | Depende de |
| --- | --- | --- | --- | --- |
| `contextMenuMinWidth` | funcional | não | Largura mínima do `SarakContextMenu` e do menu de preferências do cromo, em `rem`; mantém o alvo de clique confortável com poucos itens. | — |
| `modalActionAlignment` | estético | não | Posiciona os botões do rodapé do `SarakModal` à esquerda, ao centro ou à direita; o valor de largura total os faz preencher a linha, e no celular os empilha. | — |
| `modalBorderRadius` | estético | não | Arredonda o painel do `SarakModal`, por dispositivo. | — |
| `modalHeaderStyle` | estético | não | Muda a estrutura do cabeçalho do `SarakModal` (a posição do título e do botão de fechar), não as cores. | — |
| `modalOverlayBlur` | estético | não | Desfoque do que fica atrás do véu do `SarakModal`. | `modalOverlayColor` |
| `modalOverlayColor` | estético | sim | Cor do véu atrás do `SarakModal` e da gaveta (`SarakDrawer`); combina com o desfoque de `modalOverlayBlur`. | `modalOverlayBlur` |
| `modalWidthFull` | funcional | não | Largura máxima do `SarakModal` no tamanho `full`, sempre limitada pelas margens da tela. | — |
| `modalWidthLg` | funcional | não | Largura máxima do `SarakModal` no tamanho `lg`. | — |
| `modalWidthMd` | funcional | não | Largura máxima do `SarakModal` no tamanho `md`. | — |
| `modalWidthSm` | funcional | não | Largura máxima do `SarakModal` no tamanho `sm`. | — |
| `modalWidthXl` | funcional | não | Largura máxima do `SarakModal` no tamanho `xl`. | — |
| `toastAccentWidth` | estético | não | Espessura da faixa colorida na lateral esquerda do toast, cuja cor é a do tipo da mensagem; zero a remove. | — |
| `toastMaxWidth` | funcional | não | Largura máxima da notificação (toast), em `rem`; acima dela o texto quebra em linhas em vez de alargar. | — |
| `toastMinWidth` | funcional | não | Largura mínima da notificação (toast), em `rem`, relativa ao tamanho da fonte raiz; evita toast curto espremido. | — |
| `tooltipBg` | estético | sim | Fundo da caixa do `SarakTooltip`. | `tooltipTextColor` |
| `tooltipBorderColor` | estético | sim | Cor do contorno da caixa do `SarakTooltip`. | — |
| `tooltipRadius` | estético | não | Arredonda a caixa do `SarakTooltip`. | — |
| `tooltipTextColor` | estético | sim | Cor do texto da caixa do `SarakTooltip`; precisa de contraste com `tooltipBg`. | `tooltipBg` |

#### Configuração de Tabelas (`tables`)

| Token | Natureza | Modo | O que muda | Depende de |
| --- | --- | --- | --- | --- |
| `kanbanCardRadius` | estético | não | Arredonda os cartões arrastáveis do `SarakKanban`, em px. | — |
| `kanbanHeaderPaddingY` | estético | não | Respiro vertical do título de cada coluna do `SarakKanban`, em px. | — |
| `kanbanHeaderTracking` | estético | não | Espaço entre as letras do título de cada coluna do `SarakKanban`, em `em`. | — |
| `tableBorderColor` | estético | sim | Cor das linhas divisórias da `SarakTable` e da `SarakDataTable`. | — |
| `tableBorderRadius` | estético | não | Arredonda o contêiner da `SarakTable`, por dispositivo; sem declarar, segue o raio do cartão. | — |
| `tableCellPadding` | estético | não | Respiro horizontal das células da `SarakDataTable` (cabeçalho e linhas), por dispositivo; a `SarakTable` usa `tableDensity`. | — |
| `tableDensity` | estético | não | Escala o respiro das células da `SarakTable`: o compacto aperta e reduz a fonte, o espaçoso afrouxa; a `SarakDataTable` não lê este token. | — |
| `tableHeaderBg` | estético | sim | Fundo do cabeçalho da `SarakTable` e da `SarakDataTable`; também pinta a barra de ferramentas do editor de texto rico e a do visualizador de PDF. | — |
| `tableRowHoverBg` | estético | sim | Fundo da linha sob o ponteiro na `SarakTable`; a `SarakDataTable` não lê este token. | — |
| `tableZebraStriping` | estético | não | Alterna o fundo das linhas da `SarakTable` e da `SarakDataTable`, para seguir a linha em tabelas largas. | — |

#### Tipografia e Escala (`typography`)

| Token | Natureza | Modo | O que muda | Depende de |
| --- | --- | --- | --- | --- |
| `bodyFont` | estético | não | Aplica a família tipográfica aos parágrafos, rótulos e demais textos corridos. | — |
| `bodyLineHeight` | estético | não | Controla o espaço entre linhas dos parágrafos e afeta a leitura de blocos longos. | — |
| `bodyWeight` | estético | não | Controla a espessura do texto corrido sem mudar o tamanho da fonte. | — |
| `h1LetterSpacing` | estético | não | Aproxima ou afasta os caracteres do H1; valores negativos compactam o título. | — |
| `h1LineHeight` | estético | não | Controla o espaço entre linhas do H1; valores baixos comprimem títulos quebrados. | — |
| `h1Size` | estético | não | Define o tamanho do título H1 em cada breakpoint; valores muito grandes podem quebrar linhas ou ocupar a tela. | — |
| `h1Weight` | estético | não | Controla a espessura do título H1 e o peso visual do cabeçalho principal. | — |
| `h2LineHeight` | estético | não | Controla o espaço entre linhas dos títulos H2 quando ocupam mais de uma linha. | — |
| `h2Size` | estético | não | Define o tamanho dos títulos de seção H2 em cada breakpoint. | — |
| `h2Weight` | estético | não | Controla a espessura dos títulos H2 e sua hierarquia em relação ao H1. | — |
| `h3Size` | estético | não | Define o tamanho dos subtítulos H3; eles reutilizam o peso configurado para H2. | — |
| `headingFont` | estético | não | Aplica a família escolhida aos cabeçalhos HTML h1–h6 e às variantes h1, h2 e h3 de SarakTypography; permite criar contraste com a fonte do corpo. | — |
| `headingTransform` | estético | não | Converte a caixa dos títulos em maiúscula, capitalizada ou preserva a digitação original. | — |
| `monoFont` | estético | não | Aplica a família monoespaçada a valores tabulares e trechos de código. | — |
| `textColorMaster` | estético | sim | Colore o texto principal de parágrafos e rótulos; títulos usam titleColor. | — |
| `textColorMuted` | estético | sim | Colore dicas e placeholders; o contraste mais baixo da escala aparece em campos e textos auxiliares. | — |
| `textColorSecondary` | estético | sim | Colore textos secundários, como descrições e metadados, para reduzir a ênfase sem os ocultar. | — |
| `textGlowIntensity` | estético | sim | Adiciona brilho ao H1 na cor primária; zero remove o efeito. | — |
| `textSmoothing` | estético | não | Alterna o antialiasing tipográfico aplicado à página; desligado, o navegador usa a suavização padrão. | — |
| `trackingSnug` | estético | não | Controla o espaçamento de caracteres em textos curtos, um passo acima de trackingTight. | — |
| `trackingTight` | estético | não | Controla o espaçamento de caracteres em rótulos pequenos e textos curtos em caixa alta. | — |
| `trackingUltra` | estético | não | Espaça fortemente o título do estado vazio; valores altos separam as letras. | — |
| `trackingWide` | estético | não | Controla o espaçamento de textos curtos de categoria e de mensagens auxiliares. | — |
| `trackingWider` | estético | não | Amplia o espaçamento de textos curtos que precisam de mais abertura que trackingWide. | — |
| `trackingWidest` | estético | não | Aplica o espaçamento mais aberto da escala comum em rótulos de poucas palavras. | — |
| `typeScale2xs` | estético | não | Define o tamanho de metadados e rótulos pequenos em componentes da biblioteca. | — |
| `typeScale3xs` | estético | não | Define o degrau 3XS usado em rótulos compactos de cartões e indicadores. | — |
| `typeScaleCaption` | estético | não | Define o tamanho de legendas, notas e texto auxiliar. | — |
| `typeScaleMicro` | estético | não | Define a menor escala tipográfica, usada em rótulos densos; valores baixos podem prejudicar a leitura. | — |
| `typeScaleTiny` | estético | não | Define o tamanho de textos muito pequenos usados em badges e legendas. | — |
| `typeScaleXl` | estético | não | Define o tamanho XL para texto de destaque, como o campo de busca e títulos auxiliares. | — |
| `typeScaleXs` | estético | não | Define o tamanho XS usado por rótulos de eixo e valores pequenos dos gráficos. | — |

#### Botão de Ação (`buttons`)

| Token | Natureza | Modo | O que muda | Depende de |
| --- | --- | --- | --- | --- |
| `actionGlowShadowBlur` | estético | não | Desfoque da sombra do botão da categoria selecionada em `SarakCatalogGrid`; só aparece com um estilo de botão que preserva o `style` do botão (`matte`, o padrão). | `btnStyleType` |
| `actionGlowShadowOffsetY` | estético | não | Deslocamento vertical da sombra do botão da categoria selecionada em `SarakCatalogGrid`; só aparece com um estilo de botão que preserva o `style` do botão (`matte`, o padrão). | `btnStyleType` |
| `actionGlowShadowSpread` | estético | não | Espalhamento da sombra do botão da categoria selecionada em `SarakCatalogGrid`; só aparece com um estilo de botão que preserva o `style` do botão (`matte`, o padrão). | `btnStyleType` |
| `btnActiveScale` | estético | não | Amplia ou comprime o botão enquanto está pressionado; 1 mantém a escala original. | — |
| `btnBackdropBlur` | estético | não | Desfoca o fundo atrás dos botões no estilo frosted; outros estilos não aplicam o desfoque. | `btnStyleType` |
| `btnBorderRadius` | estético | não | Arredonda os quatro cantos dos botões; os tokens de canto podem sobrescrever cada lado. | — |
| `btnGhostHoverBg` | estético | sim | Pinta o fundo do botão ghost enquanto o ponteiro está sobre ele. | — |
| `btnHoverScale` | estético | não | Amplia ou reduz o botão enquanto o ponteiro está sobre ele; 1 mantém a escala original. | — |
| `btnNeonGlowColor` | estético | sim | Define a cor do halo de botões neon e cyberpunk. | `btnStyleType` |
| `btnNeonPulseSpeed` | estético | não | Define o ciclo do halo pulsante; zero mantém estático e o estilo neon precisa estar selecionado. | `btnStyleType` |
| `btnPrimaryBg` | estético | sim | Pinta o fundo do botão primário e define a tinta usada por alguns estilos do botão. | — |
| `btnPrimaryText` | estético | sim | Colore o texto do botão primário; escolha contraste suficiente com btnPrimaryBg. | — |
| `btnRadiusBL` | estético | não | Sobrepõe o arredondamento do canto inferior esquerdo do botão em relação ao mestre. | `btnBorderRadius` |
| `btnRadiusBR` | estético | não | Sobrepõe o arredondamento do canto inferior direito do botão em relação ao mestre. | `btnBorderRadius` |
| `btnRadiusTL` | estético | não | Sobrepõe o arredondamento do canto superior esquerdo do botão em relação ao mestre. | `btnBorderRadius` |
| `btnRadiusTR` | estético | não | Sobrepõe o arredondamento do canto superior direito do botão em relação ao mestre. | `btnBorderRadius` |
| `btnSecondaryBg` | estético | sim | Pinta o fundo dos botões secundários, inclusive nas estratégias neon e frosted. | — |
| `btnStyleType` | estético | não | Escolhe a aparência dos botões e ativa as regras condicionais de neon, vidro fosco, contorno ou relevo. | — |
| `buttonIconPosition` | funcional | não | Posiciona o ícone à esquerda ou à direita do texto nos botões que recebem um ícone. | — |
| `buttonWidthStrategy` | funcional | não | Faz o botão acompanhar o conteúdo ou ocupar toda a largura do contêiner. | — |
| `iconButtonFrostedShadowBlur` | estético | não | Suaviza a sombra do SarakIconButton no estilo frosted. | `btnStyleType` |
| `iconButtonFrostedShadowOffsetY` | estético | não | Desloca para baixo a sombra do SarakIconButton quando o estilo frosted está ativo. | `btnStyleType` |
| `iconButtonGlowBlurLg` | estético | não | Controla o desfoque grande do brilho de variantes primary e danger do SarakIconButton no hover. | `btnStyleType` |
| `iconButtonGlowBlurMd` | estético | não | Controla o desfoque médio do brilho de variantes secundária e ghost do SarakIconButton. | `btnStyleType` |
| `iconButtonGlowBlurSm` | estético | não | Controla o desfoque do brilho pequeno do SarakIconButton em repouso ou no hover. | `btnStyleType` |

#### Campo de Entrada (Input) (`inputs`)

| Token | Natureza | Modo | O que muda | Depende de |
| --- | --- | --- | --- | --- |
| `inputBackdropBlur` | estético | não | Desfoca o conteúdo atrás de campos translúcidos; sem fundo translúcido o desfoque não aparece. | `inputBg` |
| `inputBg` | estético | sim | Pinta o fundo dos campos e alimenta as variantes de foco e hover. | — |
| `inputBorderColor` | estético | sim | Pinta o contorno dos campos em repouso. | — |
| `inputBorderRadius` | estético | não | Arredonda os campos de entrada em cada breakpoint. | — |
| `inputBorderType` | estético | não | Escolhe contorno sólido, tracejado, ausente ou somente inferior nos campos. | — |
| `inputErrorColor` | estético | sim | Pinta a borda e o texto do campo quando a validação indica erro. | — |
| `inputFocusBorderColor` | estético | sim | Pinta o contorno dos campos quando recebem foco. | — |
| `inputIconColor` | estético | sim | Pinta os ícones internos e adjacentes aos campos. | — |
| `inputIconPosition` | funcional | não | Posiciona à esquerda ou à direita os ícones internos de campos que os exibem. | — |
| `inputPadding` | funcional | não | Controla o espaço vertical interno dos campos e, com isso, sua altura e área de toque. | — |
| `inputShadow` | estético | não | Define a sombra dos campos; aceita CSS, neumorphism ou none. | — |
| `inputTextColor` | estético | sim | Pinta o texto digitado nos campos. | — |
| `multiSelectInputMinWidth` | funcional | não | Mantém largura mínima para o campo de texto do multiselect não ser comprimido pelas tags. | — |
| `rangeActiveColor` | estético | sim | Pinta o trilho ativo, os polegares e as dicas dos controles de faixa. | — |
| `searchBackdropBlur` | estético | não | Desfoca o conteúdo atrás da paleta de busca enquanto ela está aberta. | — |

#### Alternadores (Toggles) (`switches`)

| Token | Natureza | Modo | O que muda | Depende de |
| --- | --- | --- | --- | --- |
| `checkboxActiveColor` | estético | sim | Pinta o preenchimento e a marca dos checkboxes selecionados. | — |
| `switchBackdropBlur` | estético | não | Desfoca o fundo do trilho translúcido no estilo glass. | `switchStyleType` |
| `switchPulseColor` | estético | sim | Define a cor do anel que pulsa no alternador ligado no estilo pulsing. | `switchStyleType` |
| `switchStyleType` | estético | não | Escolhe a forma e o acabamento do alternador: tátil, assimétrico, pulsante ou vidro. | — |
| `switchThumbBg` | estético | sim | Pinta o botão deslizante do alternador. | — |
| `switchTrackActiveBg` | estético | sim | Pinta o trilho do alternador quando ele está ligado. | — |

#### Paletas e Gradientes (`colors`)

| Token | Natureza | Modo | O que muda | Depende de |
| --- | --- | --- | --- | --- |
| `accentColor` | estético | sim | Define a cor de acento usada na malha de fundo e na terceira série de marca dos gráficos. | — |
| `cardBackgroundColor` | estético | sim | Pinta o fundo dos cartões e fornece a cor base às suas variantes. | — |
| `cardBorderColor` | estético | sim | Pinta o contorno dos cartões do sistema. | — |
| `colorBgModal` | estético | sim | Pinta o painel de conteúdo de modais e diálogos. | — |
| `colorDepth` | estético | não | Controla a distância tonal das variantes geradas para as cores, incluindo o hover e o pressionado globais dos botões. | — |
| `colorVariation` | estético | não | Controla a variação de matiz e saturação das variantes geradas, incluindo o hover e o pressionado globais dos botões. | — |
| `primaryColor` | estético | sim | Define a cor de marca principal usada em links, focos, estados ativos e variantes derivadas. | — |
| `secondaryColor` | estético | sim | Define a segunda cor de marca usada em elementos de apoio e séries dos gráficos. | — |
| `surfaceColor` | estético | sim | Define a cor de superfície elevada publicada pelo tema e usada pelo motor de gráficos. | — |
| `tertiaryColor` | estético | sim | Define uma terceira cor de marca disponível para composições e séries dos gráficos. | — |
| `textureColor` | estético | sim | Dá cor às texturas de fundo e de cartão que aceitam cor do tema. | `texture` · `cardTextureType` |
| `titleColor` | estético | sim | Colore títulos e cabeçalhos do sistema, separado da cor dos parágrafos. | — |

#### Gráficos & Dados (`data`)

| Token | Natureza | Modo | O que muda | Depende de |
| --- | --- | --- | --- | --- |
| `chartColorPalette` | estético | sim | Define a primeira cor de série; as séries seguintes combinam as demais cores de marca. | — |
| `chartGridOpacity` | estético | sim | Controla a opacidade das linhas de grade dos gráficos quando a grade está ligada. | `chartShowGrid` |
| `chartShowGrid` | estético | não | Exibe ou oculta as linhas de referência dos eixos dos gráficos. | — |
| `chartSmoothing` | estético | não | Curva as linhas de dados em vez de ligar os pontos por segmentos retos. | `chartType` |
| `chartThickness` | estético | não | Controla a espessura das linhas nos gráficos de linha e área. | `chartType` |
| `chartTooltipBg` | estético | sim | Pinta o fundo das dicas que aparecem sobre os dados dos gráficos. | — |
| `chartType` | estético | não | Escolhe a forma padrão de visualização dos dados quando o componente não recebe um tipo próprio. | — |

#### Transições e Animações (`animations`)

| Token | Natureza | Modo | O que muda | Depende de |
| --- | --- | --- | --- | --- |
| `animEnabled` | funcional | não | Liga e desliga a transição entre páginas (`SarakPageTransition`): desligada, a página troca no mesmo quadro. Não desliga as transições dos componentes. | `pageTransitionType` |
| `cardHoverStyle` | estético | não | Resposta do cartão ao ponteiro: Elevar (sobe e ganha sombra), Apenas brilho (só o brilho, sem mover) ou Expandir (cresce 2%). | `cardHoverTranslate` |
| `pageTransitionType` | estético | não | Efeito da troca de página: Fade, Deslizar para cima (20 px), Deslizar lateral (50 px), Zoom (±5%) ou Desativado; a duração vem de `motionDurationNormal`. | `animEnabled` · `motionDurationNormal` |

#### Fundo e Atmosfera (`atmosphere`)

| Token | Natureza | Modo | O que muda | Depende de |
| --- | --- | --- | --- | --- |
| `bgBaseColor` | estético | sim | Pinta a base das superfícies de vidro (`.sarak-glass`), o fundo da gaveta e a cor dos painéis do motor de fluxo; o corpo da página é `colorBgBody`. | — |
| `bgGradientAngle` | estético | não | Gira o gradiente Linear do fundo, de 0° a 360°. Nos modos Radial e Mesh o ângulo não entra na pintura. | `bgGradientMode` |
| `bgGradientMode` | estético | não | Escolhe o gradiente pintado sobre o fundo da página: Sólido não desenha; Linear e Radial misturam a camada 1 com a primária; Mesh espalha quatro manchas de cor. | `bgGradientAngle` · `colorBgLayer1` · `colorBgLayer2` |
| `bgNoiseAnimation` | estético | não | Segundos por ciclo do deslocamento do padrão da textura `noise`; 0 o mantém parado. Só vale com `texture: noise`. | `texture` |
| `bgNoiseDensity` | estético | sim | Opacidade do grão de filme, uma camada fixa que cobre a tela inteira acima do conteúdo em qualquer textura; 0 a apaga. Não altera o padrão da textura `noise` (esse é `textureOpacity`). | — |
| `borderType` | estético | não | Estilo da borda dos cartões: Sólido, Cyber (tracejada na cor de textura), Dupla linha, Neon Glow (borda na cor de textura) ou Sem moldura (borda transparente). | `textureColor` |
| `colorBgBody` | estético | sim | Pinta o fundo da página inteira e a base do gradiente de fundo; as outras camadas e superfícies se leem contra esta cor. | — |
| `colorBgLayer1` | estético | sim | Segunda parada do gradiente de fundo nos modos Linear e Radial (e a mancha de camada 1 da malha); com fundo Sólido não aparece. | `bgGradientMode` |
| `colorBgLayer2` | estético | sim | Terceira mancha da malha de fundo; só desenha com o gradiente Mesh. Nos outros modos o valor muda a variável e nenhum pixel. | `bgGradientMode` |
| `glassBlur` | estético | não | Desfoque do que está atrás das superfícies `.sarak-glass`; é o parâmetro mais visível do vidro. 0 deixa a superfície nítida. | — |
| `glassEdgeColor` | estético | sim | Cor da borda das superfícies `.sarak-glass`; o padrão é um branco translúcido que some sobre fundo claro. | — |
| `glassEdgeWidth` | estético | não | Espessura da borda das superfícies `.sarak-glass`; 0 a remove e valores altos viram moldura. | — |
| `glassOpacity` | estético | sim | Opacidade do gradiente de vidro das superfícies de cartão; 0 o deixa quase transparente e valores altos o tornam o brilho dominante. Não altera o `.sarak-glass`. | — |
| `glassRoughness` | estético | não | Tira contraste do que passa por trás do vidro `.sarak-glass`: 0 deixa liso, 1 o funde num campo uniforme (contraste zero). | — |
| `glassSaturation` | estético | não | Saturação das cores vistas através das superfícies `.sarak-glass`; acima de 1 as realça, abaixo de 1 as aproxima do cinza. | — |
| `glassSpecularity` | estético | sim | Força do fio de luz interno no topo das superfícies `.sarak-glass`; 0 apaga o reflexo e 1 o torna branco puro. | — |
| `globalContrast` | estético | não | Contraste aplicado somente à camada de textura do fundo (filtro da própria textura), não à interface. Sem textura escolhida não muda nada. | `texture` |
| `globalSaturation` | estético | não | Satura ou dessatura somente a camada de textura do fundo (filtro da própria textura), não a interface. Sem textura escolhida não muda nada. | `texture` |
| `layeredShadows` | estético | sim | Multiplica a opacidade das duas camadas de sombra (contato e projeção) de `.shadow-theme` e da busca; 0 as apaga e 2 as dobra. | — |
| `shadowAmbientAlpha` | estético | sim | Opacidade da camada de contato (curta, rente ao elemento) da sombra de `.shadow-theme` e da busca; 0 a apaga. | — |
| `shadowColorMode` | estético | não | Cor da sombra dos cartões: Neutro usa preto, Matizada a escurece na primária do tema e Ambiental usa um tom de baixa saturação derivado do fundo. | — |
| `shadowIntensity` | estético | sim | Opacidade de todo elemento com a classe `.shadow-theme` (de 0,3 a 1,0), conteúdo incluso. Não escala a sombra dos cartões. | — |
| `shadowOrientation` | estético | não | De onde vem a luz: muda a direção do deslocamento da sombra dos cartões e das sobreposições (Inferior, Centro, Superior, Diagonal ou dinâmica, que segue o ponteiro). | — |
| `shadowProjectionAlpha` | estético | sim | Opacidade da camada de projeção (longa) da sombra de `.shadow-theme` e da busca; 0 a apaga e 1 a torna preta. | — |
| `shadowProjectionBlur` | estético | não | Desfoque e alcance da camada de projeção (longa) da sombra de `.shadow-theme` e da busca; 0 a deixa dura e 200 a espalha. | — |
| `surfaceIntensity` | estético | sim | Escala a força do material da superfície: realce interno branco, gradiente e, no vidro, o desfoque. 0 apaga o realce; 1 o torna o traço dominante dos cartões. | `surfaceMaterial` |
| `surfaceMaterial` | estético | não | Troca o tratamento das superfícies de cartão: Vidro Fosco (desfoque 24 px com saturação), Polido (desfoque 12 px), Industrial (listras e sombra interna) ou Orgânico (sem desfoque, sombra interna suave). | `surfaceIntensity` |
| `systemTone` | estético | não | Acrescenta ao fundo uma grade de HUD com brilho de horizonte: Cibernético na cor de textura (grade de 20 px), Tático em monocromo (grade de 24 px). Neutro não desenha nada. | — |
| `texture` | estético | não | Padrão gráfico sobreposto ao fundo da página (camada do `html`/`body`); é o principal traço de caráter da atmosfera. `none` não desenha camada e leva consigo a vinheta. | `textureOpacity` · `textureColor` |
| `textureOpacity` | estético | sim | Opacidade da textura de fundo: 0 a apaga, valores altos a tornam um elemento gráfico. Sem textura escolhida não há camada para regular. | `texture` |
| `vignetteOpacity` | estético | sim | Opacidade do escurecimento das bordas da tela. Só existe quando há textura de fundo escolhida; com `texture: none` não há camada de vinheta. | `texture` · `vignetteSoftness` |
| `vignetteSoftness` | estético | não | Onde o escurecimento das bordas começa: 0 deixa só um aro fino na borda; 60 o espalha quase até o centro. Só vale com textura de fundo escolhida. | `texture` · `vignetteOpacity` |

#### Interface de Chat (`chat`)

| Token | Natureza | Modo | O que muda | Depende de |
| --- | --- | --- | --- | --- |
| `chatAnimationSpeed` | estético | não | Define a duração das transições do contêiner e das bolhas de SarakChatEngine; também controla o ritmo da prévia de digitação no painel. | — |
| `chatAttachmentNameMaxWidth` | funcional | não | Limita a largura do nome de arquivo anexado ao campo de chat para evitar que ele quebre o layout. | — |
| `chatBubbleRadius` | estético | não | Arredonda as bolhas de mensagens no chat em cada breakpoint. | — |
| `chatBubbleStyle` | estético | não | Escolhe o acabamento das mensagens do chat: vidro, fundo sólido ou apresentação minimalista. | — |
| `chatTokenSliderMinWidth` | funcional | não | Preserva largura mínima para o controle de limite de tokens no campo de chat. | — |
| `chatUserBg` | estético | sim | Pinta o fundo e a borda das mensagens enviadas pelo usuário. | — |

#### Cores Semânticas (`status`)

| Token | Natureza | Modo | O que muda | Depende de |
| --- | --- | --- | --- | --- |
| `badgeRadius` | estético | não | Arredonda as bordas das badges de status; valores altos formam uma pílula. | — |
| `progressBarHeight` | estético | não | Define a altura das barras de progresso. | — |
| `progressBarRadius` | estético | não | Arredonda os cantos das barras de progresso. | — |
| `statusErrorColor` | estético | sim | Pinta erros de validação, badges de falha e estados críticos. | — |
| `statusGlowBlur` | estético | não | Controla o espalhamento do brilho das badges na cor do status; zero desliga o efeito. | — |
| `statusInfoColor` | estético | sim | Pinta badges e mensagens de informação neutra. | — |
| `statusSuccessColor` | estético | sim | Pinta badges e outros estados de confirmação e sucesso. | — |
| `statusWarningColor` | estético | sim | Pinta avisos e estados que pedem atenção sem indicar falha. | — |

#### Acessibilidade e Camadas (`engineering`)

| Token | Natureza | Modo | O que muda | Depende de |
| --- | --- | --- | --- | --- |
| `focusRingWidth` | funcional | não | Espessura do contorno de foco de teclado em botões e links; abaixo de 2 px compromete a acessibilidade, por isso o sistema o mantém igual em todo tema. | — |
| `reducedMotion` | funcional | não | Zera as transições e animações da interface (duração de 0,00001 s) e as durações usadas por JavaScript; é requisito de acessibilidade, não estilo. | `animEnabled` |
| `touchTargetMin` | funcional | não | Piso de altura e largura dos acionáveis quando o ponteiro é o dedo (`pointer: coarse`); com mouse o desenho não muda. | — |
| `zIndexToast` | funcional | não | Camada das notificações; topo da escada de camadas, um passo acima do tooltip. | — |

#### Ícones e Estética (`specialized`)

| Token | Natureza | Modo | O que muda | Depende de |
| --- | --- | --- | --- | --- |
| `aiGlowColor` | estético | sim | Cor do indicador de "pensando" do `SarakChatEngine`: os três pontos e o avatar do assistente enquanto a resposta é gerada. | — |
| `authHeroOrbBlur` | estético | não | Desfoque dos orbes de fundo da tela de autenticação (`AuthHero`); 10 px os mostra como discos e 250 px os dilui em atmosfera. | — |
| `chartEngineMinHeight` | funcional | não | Altura mínima reservada ao gráfico Recharts antes de os dados chegarem, para a página não saltar; é um piso de layout, não de estilo. | — |
| `chatBubbleGlassBlur` | estético | não | Desfoque do vidro da bolha de resposta do `SarakChatEngine`; só vale com `chatBubbleStyle: glass` (o padrão do motor). | `chatBubbleStyle` |
| `designEngineSidebarMaxWidth` | funcional | não | Largura máxima da barra lateral do painel de customização; só o painel a lê. | `designEngineSidebarMinWidth` |
| `designEngineSidebarMinWidth` | funcional | não | Largura mínima da barra lateral do painel de customização; só o painel a lê. | `designEngineSidebarMaxWidth` |
| `dotGridDotOffset` | estético | não | Posição do ponto dentro de cada célula da grade de pontos do estado vazio geométrico e da tela de autenticação (`AuthHero`). | `dotGridTileSize` |
| `dotGridDotSize` | estético | não | Raio de cada ponto da grade decorativa do estado vazio geométrico e da tela de autenticação (`AuthHero`). | `dotGridTileSize` |
| `dotGridTileSize` | estético | não | Lado da célula que se repete na grade de pontos do estado vazio geométrico e do `AuthHero`; define o espaçamento entre pontos. | — |
| `emptyStateCaptionMaxWidth` | estético | não | Largura máxima da legenda do `SarakEmptyState` abstrato; estreitar faz o texto quebrar em mais linhas e a cena crescer. | — |
| `emptyStateOrbBlur` | estético | não | Desfoque do orbe do `SarakEmptyState` abstrato; valores altos o transformam em brilho ambiente. | — |
| `emptyStateOrbInner` | estético | não | Diâmetro do orbe do `SarakEmptyState` abstrato e do anel interno do geométrico; maior que o anel externo quebra a proporção. | `emptyStateOrbOuter` |
| `emptyStateOrbOuter` | estético | não | Diâmetro do anel externo tracejado do `SarakEmptyState` geométrico; aumenta a altura da cena inteira. | `emptyStateOrbInner` |
| `emptyStateRingRadius` | estético | não | Arredondamento, em `rem`, do anel tracejado do `SarakEmptyState` abstrato. | — |
| `emptyStateVoidLetterOffset` | estético | não | Margem lateral, em `em`, da palavra de destaque do `SarakEmptyState` geométrico. | — |
| `engineMinHeightLg` | funcional | não | Altura mínima dos motores grandes (`SarakFlowEngine`, `SarakChatEngine`); piso de uso, igual em todo tema. | — |
| `engineMinHeightSm` | funcional | não | Altura mínima do placeholder de carga dos motores (`LazyEngineWrapper`) enquanto o conteúdo carrega; piso de layout. | — |
| `flowGridStyle` | estético | não | Padrão do grid de fundo do `SarakFlowEngine`: pontos ou linhas contínuas. | — |
| `flowHandleSize` | funcional | não | Diâmetro dos pontos de conexão arrastáveis do `SarakFlowEngine`; é o alvo do dedo na conexão, por isso não é identidade do tema. | — |
| `flowNodeBlur` | estético | não | Desfoque do fundo translúcido dos nós do `SarakFlowEngine`. | — |
| `flowNodePadding` | estético | não | Respiro interno dos nós do `SarakFlowEngine`; também aumenta a altura do nó e o traçado das conexões. | — |
| `flowNodeRadius` | estético | não | Arredondamento dos nós do `SarakFlowEngine` (vale por breakpoint). | — |
| `layoutPreviewMaxH` | funcional | não | Altura máxima do bloco de JSON de cada tema na aba "Temas e JSON" do painel; acima dela o bloco rola. Só o painel a lê. | — |
| `skeletonCircleSize` | funcional | não | Diâmetro padrão do `SarakSkeleton` circular; deve imitar o avatar real que substituem, por isso depende do host e não do tema. | — |
| `skeletonRowHeight` | funcional | não | Altura padrão das linhas do `SarakSkeleton`; deve imitar o conteúdo real que substituem, por isso depende do host e não do tema. | — |
| `skeletonRowRadius` | estético | não | Arredondamento das linhas e blocos do `SarakSkeleton`. | — |

#### Movimento e Física (`motion`)

| Token | Natureza | Modo | O que muda | Depende de |
| --- | --- | --- | --- | --- |
| `motionDurationFast` | estético | não | Duração das micro-interações de UI (hover, foco, campos e navegação) em CSS e a duração padrão das utilitárias `transition-*`. | — |
| `motionDurationInstant` | estético | não | Duração do aperto (`:active`) de botões e botões de ícone; é a mais curta do sistema. | — |
| `motionDurationNormal` | estético | não | Duração das transições de escopo médio: o corpo da página, o cartão, o acordeão, a troca de página e a classe `transition-sarak`. | — |
| `motionDurationSlow` | estético | não | Duração das animações longas: os pseudoelementos de brilho dos cartões, a gaveta e as barras do gráfico (`SarakChart`). | — |
| `motionEaseIn` | estético | não | Curva da saída do modal e da paleta de busca: o painel e o fundo permanecem na página durante a saída (duração `motionDurationFast`) e somem acelerando por esta curva. | `motionDurationFast` |
| `motionEaseMain` | estético | não | Curva padrão das transições de botão, campo, cartão, corpo da página, painel e gaveta; é a curva que quase toda interação do sistema usa. | — |
| `motionEaseOut` | estético | não | Curva do aperto de um botão HTML sem classe e do pulso do alternador pulsante; o `SarakButton` mantém a própria curva no aperto. | — |
| `motionStaggerDelay` | estético | não | Atraso entre a entrada de um item e a do seguinte: cada linha da `SarakTable` e cada barra do `SarakChart` espera índice × este valor. 0 entra tudo junto. | — |

#### Barras de Rolagem (`scrollbars`)

| Token | Natureza | Modo | O que muda | Depende de |
| --- | --- | --- | --- | --- |
| `scrollPadding` | estético | não | Folga transparente entre o cursor da barra de rolagem e a borda do trilho (vale por breakpoint); engorda a borda do cursor. | — |
| `scrollRadius` | estético | não | Arredondamento do trilho e do cursor da barra de rolagem; valores altos formam uma pílula. | — |
| `scrollThumbColor` | estético | sim | Cor do cursor da barra de rolagem; a opacidade final vem de `scrollThumbOpacity` e do hover. | `scrollThumbOpacity` · `scrollThumbHoverOpacity` |
| `scrollThumbHoverOpacity` | estético | sim | Opacidade do cursor da barra de rolagem sob o ponteiro; deve superar a de repouso para dar retorno. | `scrollThumbColor` · `scrollThumbOpacity` |
| `scrollThumbOpacity` | estético | sim | Opacidade do cursor da barra de rolagem em repouso; baixa para não competir com o conteúdo. | `scrollThumbColor` |
| `scrollTrackOpacity` | estético | sim | Opacidade do trilho da barra de rolagem, branco sobre o fundo; valores baixos deixam só o cursor aparecer. | — |
| `scrollWidth` | estético | não | Espessura da barra de rolagem de toda a interface (vale por breakpoint); valores finos são discretos e os grossos facilitam o arraste. | — |

#### Camadas e Profundidade (`layers`)

| Token | Natureza | Modo | O que muda | Depende de |
| --- | --- | --- | --- | --- |
| `zIndexBase` | funcional | não | Camada mínima do sistema; a lista do autocompletar abre nela, acima do conteúdo comum. | — |
| `zIndexModal` | funcional | não | Camada de modais e do véu deles; as gavetas e o cartão expandido derivam dela por deslocamentos fixos. | — |
| `zIndexSidebar` | funcional | não | Camada da barra de navegação; menus e busca derivam dela por deslocamentos fixos (a camada do grão de filme fica 50 acima). Deve ficar sobre o conteúdo e sob modais. | — |
| `zIndexTooltip` | funcional | não | Camada dos tooltips e do menu de contexto, logo abaixo das notificações. | — |

#### Componentes Avançados (`advanced`)

| Token | Natureza | Modo | O que muda | Depende de |
| --- | --- | --- | --- | --- |
| `matrixBlur` | estético | não | Desfoque do vidro atrás dos itens da matriz expansível; 0 os deixa nítidos. | — |
| `matrixBorderColor` | estético | sim | Cor da borda dos itens da matriz expansível; o padrão é um branco translúcido que some sobre fundo claro. | — |
| `matrixGap` | estético | não | Espaço entre os sub-itens da matriz expansível (`SarakExpandableMatrix`) dentro de cada linha aberta; os filhos aninhados de um sub-item têm o espaçamento próprio. | — |
| `matrixItemBg` | estético | sim | Fundo dos itens da matriz expansível; o padrão é um branco quase transparente que não aparece sobre fundo claro. | — |
| `matrixRadius` | estético | não | Arredondamento dos itens da matriz expansível (`SarakExpandableMatrix`); 0 os deixa em ângulo reto. | — |

#### Mídia e Background (`media`)

| Token | Natureza | Modo | O que muda | Depende de |
| --- | --- | --- | --- | --- |
| `globalBackgroundBlur` | estético | não | Desfoque da imagem de fundo global; só aparece com `globalBackgroundImageUrl` preenchida. | `globalBackgroundImageUrl` |
| `globalBackgroundImageUrl` | estético | sim | Imagem desenhada atrás de todo o conteúdo (uma camada própria do Provider); vazio não desenha. Aceita só os esquemas de mídia seguros, `data:image/svg+xml` inclusive. | `globalBackgroundOpacity` · `globalBackgroundBlur` |
| `globalBackgroundOpacity` | estético | sim | Opacidade da imagem de fundo global; só aparece com `globalBackgroundImageUrl` preenchida. A imagem fica sobre `colorBgBody`. | `globalBackgroundImageUrl` |

#### Estrutura e Macro-Layout (`structural`)

| Token | Natureza | Modo | O que muda | Depende de |
| --- | --- | --- | --- | --- |
| `breakpointDesktop` | funcional | não | Largura de janela a partir da qual valem os valores `desk` dos tokens responsivos e o cromo de desktop; abaixo, os de tablet. | `breakpointTablet` |
| `breakpointTablet` | funcional | não | Largura de janela a partir da qual a interface deixa de ser celular: abaixo dela o cromo usa a barra do celular e os valores `mob`; acima, os de tablet. | `breakpointDesktop` |
| `formFieldDensity` | estético | não | Espaço entre rótulo e campo no `SarakFormGroup`: compacta 3 px, confortável 6 px, espaçosa 24 px. | `formLabelPosition` |
| `formLabelPosition` | funcional | não | Posição do rótulo no `SarakFormGroup`: acima do campo ou à esquerda, na mesma linha. | `formFieldDensity` |
| `globalFlowAlign` | funcional | não | Alinhamento transversal do catálogo: esticar, início, centro ou fim. | `globalFlowDirection` |
| `globalFlowDirection` | funcional | não | Direção em que o catálogo empilha seus blocos: coluna ou linha com quebra. | `globalFlowAlign` |
| `globalSectionGap` | estético | não | Espaçamento entre as seções de uma grade e de um catálogo; prevalece sobre `layoutGap` na `SarakGrid`. | `layoutGap` |
| `headerAlignment` | estético | não | Disposição do cabeçalho de tabelas e catálogos: título e ações espaçados, centrados ou no início. | — |
| `layoutGridMinCell` | funcional | não | Largura mínima de cada célula da grade auto-fit; célula menor cabe mais colunas, maior as reduz. | `layoutGridTemplate` |
| `layoutGridTemplate` | funcional | não | Como a `SarakGrid` distribui os itens: 12 colunas (cada item ocupa 4), auto-fit pela largura mínima da célula ou masonry em colunas. | `layoutGridMinCell` |
| `splitPaneMinWidth` | funcional | não | Largura mínima dos dois lados do `SarakSplitPane` ao arrastar a divisória; evita fechar um painel por acidente. | — |
| `switchLabelPosition` | funcional | não | Posição do texto do `SarakSwitch` em relação ao controle: à direita, à esquerda ou nas pontas. O `SarakCheckbox` e o `SarakRadio` não seguem este token. | — |

#### Preferências do Usuário (`preferences`)

| Token | Natureza | Modo | O que muda | Depende de |
| --- | --- | --- | --- | --- |
| `preferenceFontSizePosition` | funcional | não | Posição da escolha de tamanho da fonte (P/M/G): fixa, no menu de preferências ou não oferecida. | — |
| `preferenceLanguagePosition` | funcional | não | Posição da escolha de idioma: fixa, no menu de preferências ou não oferecida. | — |
| `preferenceModePosition` | funcional | não | Posição da escolha de modo claro/escuro do usuário: fixa na barra, no menu de preferências ou não oferecida; quando some, a escolha não existe para o usuário. | — |
| `preferenceNavCollapsePosition` | funcional | não | Posição do botão de recolher a navegação: fixo, no menu de preferências ou não oferecido. | — |
| `preferenceNavigationStylePosition` | funcional | não | Posição da escolha de orientação da navegação (lateral/topo): fixa, no menu de preferências ou não oferecida. | — |

### A.5 Ícones (117 nomes válidos)

Valores aceitos por `<SarakIcon name>`, `navItems[].icon` e `mapping.icon`. O nome é o mesmo nas três famílias (`lucide`/`phosphor`/`tabler`). Nome fora da lista → `console.warn` + ícone de alerta.

`AlertCircle` · `AlertTriangle` · `Check` · `CheckCircle2` · `X` · `Info` · `HelpCircle` · `Menu` · `Search` · `Bell` · `Filter` · `List` · `ListOrdered` · `Grid` · `Layout` · `LayoutDashboard` · `LayoutGrid` · `Home` · `ChevronDown` · `ChevronLeft` · `ChevronRight` · `ChevronUp` · `ArrowRight` · `ArrowLeft` · `ArrowUp` · `ArrowDown` · `ArrowUpDown` · `CornerDownRight` · `MoreVertical` · `MoreHorizontal` · `Maximize2` · `Minimize2` · `Loader2` · `RefreshCw` · `ZoomIn` · `ZoomOut` · `User` · `UserPlus` · `Users` · `LogIn` · `LogOut` · `Lock` · `Shield` · `ShieldCheck` · `Eye` · `EyeOff` · `File` · `FileText` · `FileSpreadsheet` · `Folder` · `Image` · `Paperclip` · `ScrollText` · `Clipboard` · `Copy` · `Download` · `Upload` · `UploadCloud` · `Printer` · `Save` · `Edit` · `Edit3` · `Bold` · `Italic` · `Plus` · `Trash2` · `Type` · `AlignLeft` · `Hash` · `Activity` · `BarChart3` · `LineChart` · `PieChart` · `ScatterChart` · `TrendingUp` · `Database` · `Layers` · `Network` · `Box` · `Package` · `Cpu` · `Cloud` · `Terminal` · `Binary` · `Thermometer` · `History` · `Calendar` · `Clock` · `MessageSquare` · `Mail` · `Send` · `Phone` · `Bot` · `Globe` · `Link` · `Link2` · `ExternalLink` · `Command` · `Briefcase` · `Building` · `CreditCard` · `DollarSign` · `MapPin` · `Tag` · `Star` · `Play` · `Palette` · `Settings` · `Settings2` · `Zap` · `Sparkles` · `Compass` · `Sun` · `Moon` · `XCircle` · `ToggleLeft` · `ToggleRight`

### A.6 Guias que viajam no pacote

Aprofundamento por tema, em `node_modules/@sarak/lib-ui-core/`:

- `docs/component-catalog.md` — Catálogo de Componentes — Sarak-Lib-UI-Core
- `docs/extensibilidade-de-layout.md` — Extensibilidade de layout — imagens, animações e conteúdo custom (guia do consumidor)
- `docs/identidade-do-host.md` — Identidade da página — o consumidor é o dono
- `docs/migracoes.md` — Migrações (breaking changes do contrato público)
- `docs/persistencia-de-tema.md` — Persistência de tema no seu backend — o contrato do dado (opcional)
- `docs/temas-cromo-e-multidispositivo.md` — Temas completos, Cromo e Multi-dispositivo — guia do consumidor

<!-- SARAK-KIT:APENDICE-GERADO:FIM -->
