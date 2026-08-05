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

Hoje o barril exporta **253 nomes** (valores e tipos). A organização é uma lista categorizada por comentários de seção, misturando `export *` de categoria inteira com exports nomeados individuais onde é preciso controle fino.

## 2.1 Duas particularidades do barril que você precisa conhecer

**Um `export *` que exclui um nome.** A categoria `Layouts/` **não** é exportada com `export *`; ela usa exports nomeados um a um (`src/index.ts:58-72`). O motivo está no comentário: existe um `SarakTabs` duplicado, e um `export *` puxaria o de `Layouts/`, colidindo com o de `UX/` — que é o público. Ver a dívida na §7.

**O barril tem efeito colateral de import** (`src/index.ts:119-125`): ao importar a lib, ela executa `registerLocalComponent('mx-customization', CustomizationPanel)` e `registerLocalComponent('personalization', CustomizationPanel)`. São ids legados do Discovery, registrados só por o módulo ter sido importado. Ver §7.

# 3. Como a superfície é DERIVADA

A lista de componentes públicos **não é escrita à mão** — é derivada do código-fonte por AST, em `scripts/publicComponents.mjs` (`collectPublicComponentNames`, `:173-206`). Foi assim que ela passou a ser depois que o registro paralelo que a alimentava foi removido ([[002-remocao-motor-manifesto]]).

O escopo são **duas raízes organizadas por categoria** — `src/components/atomic/` e `src/components/engines/` — mais `src/components/Layout/`, que não tem categorias. O algoritmo por categoria (`collectFromCategoryRoot`):

- **Com barril de categoria** (`index.ts`/`index.tsx` na raiz): segue a cadeia de `export *`, coletando só **valores** — `interface` e `type` são ignorados.
- **Sem barril**: varre os `.tsx` de **RAIZ** da categoria por padrão de export.
- As pastas `hooks/` e `__tests__/` são puladas explicitamente (`NON_CATEGORY_DIRS`).
- **Arquivo solto na raiz de uma raiz-de-categorias não é categoria** e fica de fora. É o caso de `engines/LazyEngineWrapper.tsx`: peça interna que os barris de categoria consomem para embutir o `Suspense`, nunca importada pelo consumidor.
- Por fim varre `src/components/Layout/`, **sempre** no modo "raiz apenas", mesmo que houvesse barril.

> **`engines/` entrou no escopo em P26** (decisão D2). Até ali o gate varria menos do que a regra R14 exigia, e três dos quatro engines viviam fora do barril público sem que nada acendesse. Ver §8.

> ⚠️ **Limitação conhecida, escrita no próprio código (`:167-172`): categoria SEM barril só tem a RAIZ varrida.** Um componente colocado em subpasta **escapa do gate** e do catálogo. Isso é usado deliberadamente em alguns casos — as peças internas do cromo vivem em `Layout/chrome/` justamente para não virarem peça de barril — mas é uma faca de dois lados: um componente público esquecido numa subpasta passa em silêncio.

# 4. O gate `barrel:check`

```
$ npm run barrel:check
[barrel:check] 81 componentes registrados; barril em dia (0 faltas).
```

`gates/scripts/contrato/check-barrel-parity.mjs` cobra **duas coisas** para cada componente derivado da §3 (`:63-70`):

1. O **componente** está exportado em `src/index.ts`.
2. Se existir um tipo `<Nome>Props` em qualquer lugar de `src/`, ele **também** está exportado. Exportar o componente sem o tipo das props deixa o consumidor sem como tipar o próprio wrapper.

E ele derruba o build também no sentido inverso — **exclusão obsoleta** (`:72-80`): um nome na allowlist que já está exportado, ou cujo componente/tipo não existe mais, é problema. A allowlist não pode acumular entradas mortas.

## 4.1 A allowlist exige MOTIVO escrito

`gates/allowlists/barrelExclusions.mjs` tem hoje **exatamente uma exclusão**, duplicada nas duas listas (valor e props):

| Nome | Motivo registrado no código |
| --- | --- |
| `SarakAppChromeMobile` | Colapso interno do `SarakAppChrome` no celular — não é peça standalone do barril. |

**Silêncio é proibido**: toda entrada carrega o porquê no próprio arquivo. E a lista se autolimpa — uma exclusão histórica (`SarakCardGridProps`) foi removida quando deixou de ser necessária, exatamente como o gate de exclusão obsoleta exige.

# 5. O catálogo gerado

`npm run catalog` produz `docs/component-catalog.{json,md}` por AST, e `catalog:check` confere no build que o commitado bate com o gerado. Ele publica componentes, props reais, tokens de espaçamento semânticos e as CSS Variables públicas.

**É a fonte da verdade dos consumidores.** A regra número um de quem consome a lib é *leia o catálogo, não assuma* — um nome de componente, prop ou ícone que não existe raramente quebra a tela; ele silenciosamente não faz nada, que é pior.

> Este catálogo **sucedeu** o antigo catálogo de manifesto. A superfície de autoria em JSON — tipos de nó, ações, pipes, diretivas — **morreu com o motor removido** ([[002-remocao-motor-manifesto]]). Se você encontrar referência a `manifest-catalog`, é ponteiro morto.

## 5.1 A divergência de contagem 81 × 87 — APURADA, não é bug

O gate reporta **81 componentes**; `sarak-ui/VERSION` e o catálogo do kit reportam **87**. Os dois números estão certos, porque **medem escopos de varredura diferentes**:

- **81** = o que `collectPublicComponentNames()` varre: `components/atomic/**` + `components/engines/**` + `components/Layout/**`.
- **87** = 81 **+ 6**, onde os 6 vêm de `collectExtraPublicApi()` (`scripts/consumer-kit/collectKitSources.mjs:184-199`): nomes que o barril exporta, têm `<Nome>Props`, e **não** moram nas pastas varridas pelo gate.

Os 6, com onde moram:

| Nome | Mora em |
| --- | --- |
| `SarakUIProvider` | `src/core/Provider/` |
| `SarakShell` | `src/core/Shell/` |
| `DynamicRenderer` | `src/core/Discovery/` |
| `SarakComponent` | `src/core/Discovery/registry.ts` |
| `DeviceProvider` | `src/core/Provider/DeviceProvider.tsx` |
| `DesignScope` | `src/core/Design/components/` |

**Nenhum dos 6 está faltando no barril** — todos já são exportados; é justamente por isso que o coletor do kit consegue achá-los. A diferença é de **qual script os enumera como "componente"**: o gate mede paridade das peças visuais; o kit do consumidor amplia para as peças de **montagem** (Provider, Shell, Discovery), que o importador também precisa saber que existem.

> A lista era de **7** antes do P26, e o sétimo era `SarakChartEngine`: ele precisava ser reincorporado por este caminho justamente porque `engines/` estava fora do escopo do gate. Com `engines/` dentro (§3), os três engines entram pela porta da frente e a lista de extras encolheu — a divergência de contagem passou a medir só o que ela sempre quis medir, as peças de montagem em `core/`.

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

- **`src/components/engines/`** — **três** categorias: `charts/`, `chat/`, `flows/`. São **wrappers de abstração sobre bibliotecas pesadas de terceiros** (ECharts, React Flow, React Markdown + Syntax Highlighter). A regra que os define: **nenhum engine tem cor de framework de terceiro hardcoded** — todos sobrescrevem a configuração da lib base forçando `var(--sarak-*)`, e é isso que faz um gráfico repintar quando o tema muda. As três são **públicas e lazy** (§7.1) e estão no escopo do `barrel:check` (§3). Na raiz da pasta mora ainda `LazyEngineWrapper.tsx`, que **não é categoria**: é a peça interna que embute o `Suspense` nos barris das três.
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
| `SarakChatEngine` | `src/components/engines/chat/index.tsx:19` |
| `SarakFlowEngine` | `src/components/engines/flows/index.tsx:17` |
| `SarakPDFViewer` | `src/components/atomic/Media/SarakPDFViewer/index.ts:12` |
| `SarakMarkdownRenderer` | `src/components/atomic/Media/SarakMarkdownRenderer/index.ts:13` |
| `SarakDataTable` | `src/components/atomic/DataDisplay/SarakDataTable/index.ts:11` |
| `SarakDataGrid` | `src/components/atomic/DataDisplay/SarakDataGrid/index.ts:14` |

`SarakKanban` **não** é lazy, e isso é deliberado — o comentário em `DataDisplay/SarakKanban/index.ts:3` registra que ele é leve (arrastar-e-soltar HTML5 nativo, zero dependência).

# 8. Dívidas nomeadas — ✅ TODAS FECHADAS em 2026-08-04 (`plan-09`)

Esta seção listava **três** dívidas de superfície pública. As três morreram no major `2.0.0`, e ficam
registradas aqui com o desfecho — o histórico é o `git`, mas o **porquê** de cada uma some se não for escrito.

| Dívida | Desfecho |
|---|---|
| **`SarakTabs` duplicado** — dois componentes, mesmo nome, APIs incompatíveis | **Removido o de `Layouts/`.** A medição da `plan-09` mostrou que ele **nunca foi público**: exportado pelo barril de categoria, deliberadamente fora do barril público (exports nomeados da §2.1) e **sem um único consumidor** em `src/`. Não era decisão de API — era código morto. **Nenhum ADR foi necessário** |
| **`CustomizationPanel` eager** — o painel inteiro no caminho crítico de todo consumidor | **Fechada, e é a maior medição desta base:** o chunk de boot foi de **674.011 → 167.684 bytes (−494,4 KB · −75,1%)**. Seguiu o padrão do `SarakChartEngine` (§7.1), que **preserva o tipo público** — o consumidor continua escrevendo `<CustomizationPanel />` sem `Suspense`. **Não quebrou contrato** |
| **Os 2 ids legados do Discovery** (`mx-customization`, `personalization`) | **Removidos** junto com o bloco de efeito colateral de `src/index.ts`. ⚠️ Eram **três pontas, não uma**: o registro no entrypoint, o `useRegistryManager.ts:35-42` que contava com ele e o `useSarakShell.ts:31` que auto-navegava para o módulo. Apagar só o bloco entregaria item de menu que não renderiza nada + `console.warn` em todo boot |

**O que saiu junto, e não estava nesta lista:** o `SarakSecurityOrchestrator` (violação de **R32** — a lib
ditava o protocolo de MFA do importador), o parâmetro morto `upgradeThemePayload(partialMode)` e o token órfão
`mfaQrCodeSize`, que existia só para o orquestrador.

> **A lição que sobrevive a esta seção:** duas das três "dívidas de API" não eram decisão de design — eram
> **código morto que ninguém tinha medido**. O `SarakTabs` esperou uma "spec de refatoração dedicada" que nunca
> precisou existir. **Antes de agendar uma decisão, meça se ainda há o que decidir.**

# 9. Os engines — dívida FECHADA em P26 (registro)

Esta seção era, até 2026-07-29, a maior dívida desta lista: **três das quatro categorias de `engines/` estavam fora do contrato público**, e o gate não pegava porque `components/engines/**` não estava no escopo de varredura. A investigação mostrou que os três casos tinham **status diferentes** — e é por isso que a resposta não foi uma só (decisão **D2**).

| Engine | Uso interno na lib | Estava no barril | O que foi feito |
| --- | --- | --- | --- |
| `SarakChartEngine` | — | ✅ | Nada — era o padrão a copiar |
| `SarakChatEngine` | ✅ `core/Discovery/components/ContractRenderer.tsx:67` | ❌ | **EXPOSTO** (barril próprio, lazy) |
| `SarakFlowEngine` | ✅ `ContractRenderer.tsx:89` | ❌ | **EXPOSTO** (barril próprio, lazy) |
| `SarakVisualEngine` | ❌ nenhum | ❌ | **REMOVIDO** |

**O achado que explicava a confusão:** existia um `src/components/engines/index.ts` que declarava os quatro atrás de `React.lazy` e **não era importado por ninguém** — o `ContractRenderer` importava direto dos arquivos e o `src/index.ts` importava de `engines/charts`. Código morto que produzia leitura errada da arquitetura: quem o lia concluía que os quatro engines eram alcançáveis. Foi apagado.

**Por que `SarakVisualEngine` saiu** e os outros dois ficaram: a regra de corte de [[001-tres-arquiteturas]] — *só permanece o que tem consumidor real provado*. Chat e Flow tinham consumidor interno vivo; o Visual não tinha nenhum, nem dentro da lib nem no ERP Earendel (o único consumidor real, decisão D13 — varredura feita antes da remoção). Saiu junto o `PaletteSelector`, que morava na mesma categoria, também sem nenhum consumidor, e cuja lista de paletas (`COLOR_PALETTES`) era um **array vazio** — ele não desenhava nada. Registro em `docs/migracoes.md`.

**O custo de boot foi ZERO**, e isso é o ponto: expor não é o pecado, expor *eager* é (§7). Chat e Flow entraram pelo mesmo padrão do `charts/` — barril de categoria com `React.lazy` + `LazyEngineWrapper` (`Suspense` interno, para o consumidor não ter de declarar). Medido: `dist/index.js` (o chunk de boot) foi de **657,4 KB para 657,7 KB** — os `+0,3 KB` dos dois wrappers. As implementações continuam em chunks próprios, com o mesmo hash de antes.

**E o vão do gate foi fechado**, não contornado: `collectPublicComponentNames()` passou a varrer `components/engines/**` como raiz por categoria (§3). O gate saiu de 78 para **81 componentes** e continua em 0 faltas. A prova de que ele passou a ver os engines: comentar o export de `SarakChatEngine` derruba o `barrel:check` com `exit 1`, acusando o valor e o tipo — coisa que antes passava em silêncio.
