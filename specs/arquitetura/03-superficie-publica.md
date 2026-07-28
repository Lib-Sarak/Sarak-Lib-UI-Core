---
tipo: "arquitetura"
titulo: "Superfície pública — o barril, os gates e as fronteiras de bundle"
dominio: "Arquitetura / Contrato público / Empacotamento"
status: "🟢 Vigente"
tags: ["arquitetura", "barril", "contrato-publico", "catalogo", "bundle", "lazy", "taxonomia"]
relacionados: ["[[00-mapa-do-modulo]]", "[[01-forma-do-produto-e-modos-de-consumo]]", "[[04-contrato-de-tokens-e-paridade]]", "[[05-build-e-distribuicao]]"]
---

# 1. Propósito

Define **o que a lib expõe**, **como isso é cobrado por gate**, e **quais fronteiras de bundle existem**. É o documento que o consumidor lê para saber o que pode importar, e que o mantenedor lê antes de adicionar ou remover qualquer coisa da API.

Aqui está a regra de **exposição**. As regras de estilo e de hardcode moram na spec de regras e invariantes; o dicionário de tokens está em [[04-contrato-de-tokens-e-paridade]].

# 2. O barril único é o contrato

**`src/index.ts` é o contrato público.** Tudo se resume a duas frases:

- **O que está no barril tem retrocompatibilidade.**
- **O que não está é interno e muda sem aviso.**

**Deep imports são proibidos por contrato.** Um consumidor que escreva `import X from '@sarak/lib-ui-core/dist/components/...'` está fora do contrato, e nada garante que o caminho exista na próxima versão. A única porta é a raiz do pacote.

Hoje o barril exporta **249 nomes** (valores e tipos). A organização é uma lista categorizada por comentários de seção, misturando `export *` de categoria inteira com exports nomeados individuais onde é preciso controle fino.

## 2.1 Duas particularidades do barril que você precisa conhecer

**Um `export *` que exclui um nome.** A categoria `Layouts/` **não** é exportada com `export *`; ela usa exports nomeados um a um (`src/index.ts:58-72`). O motivo está no comentário: existe um `SarakTabs` duplicado, e um `export *` puxaria o de `Layouts/`, colidindo com o de `UX/` — que é o público. Ver a dívida na §7.

**O barril tem efeito colateral de import** (`src/index.ts:119-125`): ao importar a lib, ela executa `registerLocalComponent('mx-customization', CustomizationPanel)` e `registerLocalComponent('personalization', CustomizationPanel)`. São ids legados do Discovery, registrados só por o módulo ter sido importado. Ver §7.

# 3. Como a superfície é DERIVADA

A lista de componentes públicos **não é escrita à mão** — é derivada do código-fonte por AST, em `scripts/publicComponents.mjs` (`collectPublicComponentNames`, `:173-206`). Foi assim que ela passou a ser depois que o registro paralelo que a alimentava foi removido ([[002-remocao-motor-manifesto]]).

O algoritmo, por categoria de `src/components/atomic/`:

- **Com barril de categoria** (`index.ts` na raiz): segue a cadeia de `export *` (`:182-185`), coletando só **valores** — `interface` e `type` são ignorados.
- **Sem barril**: varre os `.tsx` de **RAIZ** da categoria por padrão de export (`:186-193`).
- A pasta `hooks/` é pulada explicitamente (`:178`).
- Depois varre `src/components/Layout/`, **sempre** no modo "raiz apenas", mesmo que houvesse barril (`:196-203`).

> ⚠️ **Limitação conhecida, escrita no próprio código (`:167-172`): categoria SEM barril só tem a RAIZ varrida.** Um componente colocado em subpasta **escapa do gate** e do catálogo. Isso é usado deliberadamente em alguns casos — as peças internas do cromo vivem em `Layout/chrome/` justamente para não virarem peça de barril — mas é uma faca de dois lados: um componente público esquecido numa subpasta passa em silêncio.

# 4. O gate `barrel:check`

```
$ npm run barrel:check
[barrel:check] 78 componentes registrados; barril em dia (0 faltas).
```

`scripts/check-barrel-parity.mjs` cobra **duas coisas** para cada componente derivado da §3 (`:63-70`):

1. O **componente** está exportado em `src/index.ts`.
2. Se existir um tipo `<Nome>Props` em qualquer lugar de `src/`, ele **também** está exportado. Exportar o componente sem o tipo das props deixa o consumidor sem como tipar o próprio wrapper.

E ele derruba o build também no sentido inverso — **exclusão obsoleta** (`:72-80`): um nome na allowlist que já está exportado, ou cujo componente/tipo não existe mais, é problema. A allowlist não pode acumular entradas mortas.

## 4.1 A allowlist exige MOTIVO escrito

`scripts/barrelExclusions.mjs` tem hoje **exatamente uma exclusão**, duplicada nas duas listas (valor e props):

| Nome | Motivo registrado no código |
| --- | --- |
| `SarakAppChromeMobile` | Colapso interno do `SarakAppChrome` no celular — não é peça standalone do barril. |

**Silêncio é proibido**: toda entrada carrega o porquê no próprio arquivo. E a lista se autolimpa — uma exclusão histórica (`SarakCardGridProps`) foi removida quando deixou de ser necessária, exatamente como o gate de exclusão obsoleta exige.

# 5. O catálogo gerado

`npm run catalog` produz `docs/component-catalog.{json,md}` por AST, e `catalog:check` confere no build que o commitado bate com o gerado. Ele publica componentes, props reais, tokens de espaçamento semânticos e as CSS Variables públicas.

**É a fonte da verdade dos consumidores.** A regra número um de quem consome a lib é *leia o catálogo, não assuma* — um nome de componente, prop ou ícone que não existe raramente quebra a tela; ele silenciosamente não faz nada, que é pior.

> Este catálogo **sucedeu** o antigo catálogo de manifesto. A superfície de autoria em JSON — tipos de nó, ações, pipes, diretivas — **morreu com o motor removido** ([[002-remocao-motor-manifesto]]). Se você encontrar referência a `manifest-catalog`, é ponteiro morto.

## 5.1 A divergência de contagem 78 × 85 — APURADA, não é bug

O gate reporta **78 componentes**; `sarak-ui/VERSION` e o catálogo do kit reportam **85**. Os dois números estão certos, porque **medem escopos de varredura diferentes**:

- **78** = o que `collectPublicComponentNames()` varre: `components/atomic/**` + `components/Layout/**`.
- **85** = 78 **+ 7**, onde os 7 vêm de `collectExtraPublicApi()` (`scripts/consumer-kit/collectKitSources.mjs:184-199`): nomes que o barril exporta, têm `<Nome>Props`, e **não** moram nas duas pastas varridas pelo gate.

Os 7, com onde moram:

| Nome | Mora em |
| --- | --- |
| `SarakUIProvider` | `src/core/Provider/` |
| `SarakShell` | `src/core/Shell/` |
| `DynamicRenderer` | `src/core/Discovery/` |
| `SarakComponent` | `src/core/Discovery/registry.ts` |
| `DeviceProvider` | `src/core/Provider/DeviceProvider.tsx` |
| `DesignScope` | `src/core/Design/components/` |
| `SarakChartEngine` | `src/components/engines/charts/` |

**Nenhum dos 7 está faltando no barril** — todos já são exportados; é justamente por isso que o coletor do kit consegue achá-los. A diferença é de **qual script os enumera como "componente"**: o gate mede paridade das peças visuais; o kit do consumidor amplia para as peças de **montagem** (Provider, Shell, Discovery, engines), que o importador também precisa saber que existem.

# 6. Taxonomia

**14 categorias** em `src/components/atomic/` (mais a pasta `hooks/`, que não é categoria):

| Categoria | Propósito |
| --- | --- |
| `Atoms` | Primitivas de base — os menores blocos reutilizáveis, incluindo tipografia |
| `Buttons` | Botões e botão-ícone |
| `Cards` | Cartões de conteúdo, ação, busca e título |
| `DataDisplay` | Densidade de dados — grid virtualizado, tabela, kanban, árvore, sparkline |
| `Feedback` | Comunicação de estado — toast, alerta, carregamento, estado vazio |
| `Icon` | O sistema de ícones (`SarakIcon`, `IconMap`) |
| `Inputs` | Entrada de dados, do básico ao denso (pickers, multiselect, rich text, uploader) |
| `Layouts` | Primitivas estruturais — flex, grid, split pane, acordeão, grupo de formulário |
| `Media` | Renderização de mídia — markdown, lightbox, PDF |
| `Modals` | Diálogos e modais |
| `Navigation` | Navegação — breadcrumbs, stepper, paginação, spotlight, nav de casca |
| `Tables` | Tabela clássica e seu colapso mobile |
| `Templates` | Moldes de composição de tela, sem lógica de negócio |
| `UX` | Componentes de experiência — inclui o `SarakTabs` público |

Mais duas pastas fora da taxonomia atômica:

- **`src/components/engines/`** — `charts/`, `chat/`, `flows/`, `visuals/`. São **wrappers de abstração sobre bibliotecas pesadas de terceiros** (ECharts, React Flow). A regra que os define: **nenhum engine tem cor de framework de terceiro hardcoded** — todos sobrescrevem a configuração da lib base forçando `var(--sarak-*)`, e é isso que faz um gráfico repintar quando o tema muda.
- **`src/components/Layout/`** — o cromo e o layout de aplicação: `SarakAppChrome`, `SarakAppChromeMobile`, `SarakAnalyticalPage`, `SarakHidden`, mais a subpasta `chrome/` com as peças internas.

A lista componente-por-componente **não está aqui de propósito** — está no catálogo gerado (§5).

## 6.1 A regra da composição atômica

**É proibido `<button>`, `<input>` ou `<select>` cru dentro de template ou componente pré-montado.** Use `SarakButton`, `SarakInput`, `SarakSelect`.

O motivo não é estético: HTML nativo cru causa **vazamento de especificidade**. O elemento fica preso na variável global do preflight e ignora a paridade atômica — deixa de responder ao token do componente que deveria governá-lo. O próprio painel do Design Engine obedece a esta regra (*dogfooding*).

## 6.2 Contrato de nomes de ícone

`IconMap` (`src/components/atomic/Icon/IconMap.ts:26-31`) é construído a partir de `ICON_NAMES` — **100 nomes** curados, cobrindo três famílias de ícone. Nome fora do mapa emite `console.warn` (`SarakIcon.tsx:25-29`, chamado em `:38`), com deduplicação por `Set` para não poluir o console a cada render.

O contrato é **fechado**: passar um nome que não está no mapa não quebra a tela — não desenha ícone. Confira o catálogo.

# 7. Fronteiras de bundle — a parte MEDIDA

O chunk de **boot** de um consumidor caiu de **3203,6 KB para 1533,6 KB (−52,1%)**, medido em app mínimo. Três hipóteses foram investigadas, e **duas foram refutadas** — o que é a parte mais útil deste registro:

| Hipótese | Veredito |
| --- | --- |
| O acesso **dinâmico** ao barril de `lucide-react` impedia tree-shaking | ✅ **Confirmada** — 789,2 KB → **56,5 KB (−92,8%)** ao passar tudo pelo `IconMap` curado |
| "As dependências de ícone estão no `dist/`" | ❌ **REFUTADA** — o tsup externaliza `dependencies` sozinho; elas nunca estiveram no bundle da lib |
| "`export *` custa mais que imports nomeados" | ❌ **REFUTADA** — saída **byte a byte idêntica** |

**A causa real do peso era outra:** `SarakChartEngine` estava exportado **eager** no barril, anulando um `React.lazy` que já existia. Isso arrastava echarts + recharts + zrender + lodash — cerca de **2,9 MB** — para o boot de **todo** consumidor, mesmo quem nunca desenhou um gráfico.

> **A regra derivada: nada pesado sai eager do barril.** Componente pesado vive atrás de fronteira lazy. E o custo de curar o `IconMap` foi assumido de olhos abertos — passar de 55 para 100 nomes custou **+179,5 KB**, que é o preço da não-regressão de cobertura.

## 7.1 As fronteiras lazy que existem hoje

| Componente | Onde o `lazy` é declarado |
| --- | --- |
| `SarakChartEngine` | `src/components/engines/charts/index.tsx:20` |
| `SarakPDFViewer` | `src/components/atomic/Media/SarakPDFViewer/index.ts:12` |
| `SarakMarkdownRenderer` | `src/components/atomic/Media/SarakMarkdownRenderer/index.ts:13` |
| `SarakDataTable` | `src/components/atomic/DataDisplay/SarakDataTable/index.ts:11` |
| `SarakDataGrid` | `src/components/atomic/DataDisplay/SarakDataGrid/index.ts:14` |

`SarakKanban` **não** é lazy, e isso é deliberado — o comentário em `DataDisplay/SarakKanban/index.ts:3` registra que ele é leve (arrastar-e-soltar HTML5 nativo, zero dependência).

# 8. Dívidas nomeadas

Registradas para serem conhecidas, **não corrigidas aqui**:

**`SarakTabs` duplicado e incompatível.** Dois componentes, mesmo nome, APIs que não conversam: `Layouts/SarakTabs` (`items`, `defaultActiveId`, `alignment`) e `UX/SarakTabs` (`tabs`, `activeTab`, `onChange`, `variant`, `fullWidth`). Só o de `UX/` é público; o outro é mantido fora do barril pelos exports nomeados da §2.1. Deduplicar exige uma decisão de API.

**`CustomizationPanel` sai EAGER do barril.** Ele é exportado sem `React.lazy` (`src/index.ts:50`) e ainda é importado de forma *eager* pelo efeito colateral de `:119-125`. Isso contraria diretamente a regra da §7 — é o painel inteiro do Design Engine no caminho crítico de todo consumidor. É a dívida mais custosa desta lista.

**Os dois ids legados do Discovery** (`mx-customization`, `personalization`) registrados por efeito colateral de import. Funcionam, mas ninguém decidiu se devem continuar existindo.

**Três das QUATRO categorias de `engines/` estão fora do contrato público.** Isto não é uma peça esquecida — é **uma pasta inteira majoritariamente inalcançável**.

`src/components/engines/index.ts:8-11` declara os quatro engines, todos atrás de `React.lazy`. Mas `src/index.ts` só reexporta a partir de `./components/engines/charts` — nunca do barril `engines/`. Resultado, medido contra os 249 nomes do barril:

| Engine | Componente existe | `<Nome>Props` exportado | No barril público |
| --- | --- | --- | --- |
| `SarakChartEngine` | ✅ `charts/SarakChartEngine.tsx` | ✅ | ✅ **PRESENTE** |
| `SarakFlowEngine` | ✅ `flows/SarakFlowEngine.tsx` | ✅ | ❌ **AUSENTE** |
| `SarakChatEngine` | ✅ `chat/SarakChatEngine.tsx` | ✅ | ❌ **AUSENTE** |
| `SarakVisualEngine` | ✅ `visuals/SarakVisualEngine.tsx` | ✅ | ❌ **AUSENTE** |

Os três ausentes **não são esboços**: cada um é um componente real, com `interface <Nome>Props` exportada — exatamente o par que `barrel:check` exigiria se estivessem no escopo do gate.

**E o gate não pega isso por construção.** `collectPublicComponentNames()` varre `components/atomic/**` e `components/Layout/**`; `components/engines/**` **não está no escopo** (§3). Não é falha do gate — é o limite declarado dele, e é a mesma razão pela qual o catálogo do kit precisou reincorporar `SarakChartEngine` por outro caminho (§5.1). A consequência prática é que a ausência dos outros três **nunca vai acender uma luz vermelha**: ela é invisível para toda a automação existente.

**Não apurado** — a escolha é do dono, e as duas leituras são defensáveis: ou os três são **internos de propósito** (e então a taxonomia da §6 deve dizer isso explicitamente, em vez de listar quatro categorias como se todas fossem consumíveis), ou é **lacuna de exposição** da mesma classe que o `barrel:check` nasceu para impedir — e nesse caso a correção é exportar os três e discutir se `engines/` entra no escopo de varredura.
