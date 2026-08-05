# Migrações (breaking changes do contrato público)

Registro das mudanças que quebram o contrato de quem já importa a `@sarak/lib-ui-core`,
com o "antes" e o "depois" lado a lado. Uma entrada por mudança, mais recente primeiro.

---

## 2.0.0 — a limpeza do contrato público, num major só

**Esta é a única entrada que você precisa ler para migrar para a `2.0.0`.** Seis mudanças saíram
juntas de propósito: cada uma sozinha custaria a você uma migração inteira de leitura, teste e
ajuste. **Você atravessa o major uma vez, não seis.**

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
