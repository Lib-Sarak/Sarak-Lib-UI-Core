---
tipo: "plan"
titulo: "Tipos que aparecem em assinatura pública e não podem ser importados"
dominio: "Sarak-Lib-UI-Core / Superfície pública"
status: "🟢 Aprovada"
prioridade: "Alta"
tags: ["plan", "contrato-publico", "tipos", "barril", "gate", "achado-de-consumidor"]
relacionados: ["[[03-superficie-publica]]", "[[01-gates-e-baseline]]", "[[13-instalacao-e-atualizacao]]"]
depende_de: ""
destino_sintese: "specs/arquitetura/03-superficie-publica.md · specs/specs/01-gates-e-baseline.md"
objetivo: "O que é público na prática fica alcançável: os tipos usados em assinatura passam a ser importáveis pelo nome, e a alavanca do primeiro paint deixa de ser invisível"
---

# 1. Objetivo

Quem integra a lib consegue **importar pelo nome** os tipos que as assinaturas públicas usam:

```ts
import type { SarakThemePayload, SarakUIOptions, ThemeEntry } from '@sarak/lib-ui-core';
```

Hoje isso falha com `TS2459: declares 'SarakThemePayload' locally, but it is not exported`.

# 2. Contexto

## 2.1 Como o defeito apareceu

Não foi por varredura interna — foi um **consumidor real** integrando a persistência de tema
(`docs/persistencia-de-tema.md`, a `plan-43`) e esbarrando na primeira linha do próprio endpoint: tipar o
payload que salva e carrega.

Sem poder importar, ele derivou estruturalmente:

```ts
type PropsDoProvider = ComponentProps<typeof SarakUIProvider>;
type SarakThemePayload = NonNullable<PropsDoProvider['config']>;
type ThemeEntry = Parameters<NonNullable<NonNullable<SarakUIOptions['theme']>['onSave']>>[0];
```

Funciona — e é frágil exatamente como ele apontou: **qualquer mudança na forma de `SarakUIProviderProps`
quebra o consumidor em silêncio**, e é trabalho que todo integrador de persistência repetiria.

## 2.2 A medição — 2026-08-14

```
grep -oE "^(declare )?(interface|type) [A-Za-z_][A-Za-z0-9_]*" dist/index.d.ts   → 153 declarados
bloco `export { … }` final                                                       → 247 exportados
declarados e NÃO exportados                                                      → 29
```

Os 29 incluem, além dos três que o consumidor achou:

| Tipo ausente | Por que dói |
|---|---|
| `SarakUIContextType` | **`useSarakUI` é exportado** — dá para chamar o hook e não dá para nomear o retorno |
| `SarakUIProviderProps` | props do componente principal; é justamente o que o contorno do consumidor precisa alcançar |
| `SarakDesignState` | o estado de design que atravessa todas as portas de persistência |
| `SarakShellProps` · `DesignScopeProps` · `DeviceProviderProps` · `DynamicRendererProps` | props de componentes **exportados** |
| `SarakTokenValue` · `DesignToken` · `SarakBrandingState` · `ShellUser` | tipos de contrato citados em assinatura pública |

**O padrão:** exportamos os componentes e esquecemos os tipos que as assinaturas deles usam.

## 2.3 Onde está o defeito, conferido

Não é o bundler de `.d.ts` perdendo export. O barril **já sabe** exportar tipo — `src/index.ts:11` faz
`export type { SarakUIMode } from './core/Provider/types'`. Os irmãos dele, no **mesmo arquivo de origem**,
simplesmente nunca foram acrescentados. O conserto é no barril.

## 2.4 Por que nenhum gate viu

`barrel:check` confere paridade de **componentes** (77 registrados). **Tipo não entra na conta dele.** Não
existe verificação de que um tipo citado em assinatura pública seja importável.

## 2.5 Uma premissa falsa que eu registrei, e que esta plan corrige

A §2.1 da `plan-43` afirma: *"`SarakThemePayload`, `ThemeEntry`, `SarakDesignState`, `SarakUIOptions` no
barril público — ✅ **sim**, dá para tipar o endpoint"*. **É falso.** A medição que gerou aquela linha usou
`grep -q "<Tipo>" dist/index.d.ts`, que só testa se o **nome aparece no arquivo** — e aparece, como
declaração inlinada. Não testa o bloco de export.

Fica registrado aqui porque a `plan-43` está aprovada e o registro dela não deve ser reescrito.

## 2.6 🔧 AMPLIAÇÃO — 2026-08-14: o mesmo defeito, na outra ponta

O mesmo consumidor relatou, no dia seguinte: **ao abrir num navegador novo, o tema padrão pinta primeiro e
o persistido entra segundos depois.**

Não é bug — é o `strategy: 'hybrid'` num navegador sem cache, e a lib **não tem como** consertar: para o
primeiro paint sair certo, o dado precisa existir **antes de o JS rodar**, e quem põe dado no documento é
quem **serve o documento**. A lib não serve documento nenhum ([[003-remocao-backend-proprio]]).

**Mas a lib oferece as duas saídas, e nenhuma das duas está documentada:**

| Saída | Estado hoje |
|---|---|
| A prop `config` — o importador injeta o design no HTML servido e passa aqui | funciona, e **a precedência não está escrita em lugar nenhum** |
| `persistence.strictBackendSync` — segura o render até o backend responder (`SarakUIProvider.tsx:189-190`) | **sem JSDoc** (`types.ts:171` é linha nua, ao lado do `crossTabSync`, que tem comentário completo), **zero menções** em `docs/persistencia-de-tema.md` e **zero** no guia do consumidor |

**A precedência, medida em `useDesignManager.ts:68,92-99`:**

```
getSeedConfig()  =  { ...masterDefaults, ...temaDoCatálogo, ...config }

localStorage tem valor?  →  { ...getSeedConfig(), ...localStorage }   ← o cache vence
localStorage vazio?      →  getSeedConfig()                           ← `config` vence
```

Num navegador novo, **`config` manda no primeiro paint** — é o que resolve o relato. Com cache presente, o
`localStorage` vence o `config` injetado, e isso **está certo** (o cache costuma ser o valor mais recente, e
o `onLoad` corrige se não for) — mas quem injeta `config` esperando que sempre ganhe vê comportamento que
parece aleatório.

**É o mesmo defeito desta plan, na outra ponta:** a capacidade existe, é pública, e o consumidor não a
alcança. Lá por falta de `export`; aqui por falta de documento. Por isso entra aqui, por decisão do dono —
mesmo que o método de fecho difira (o de tipo fecha no `.d.ts`, o de documento fecha na leitura).

⚠️ **Nada nesta ampliação muda comportamento.** É o artefato contando o que o código já faz. **PATCH.**

# 3. Escopo

## 3.1 Dentro

1. **Classificar os 29, um a um** — e esta é a parte que não pode ser mecânica. Para cada um: **EXPORTAR**
   ou **MANTER INTERNO**, com o motivo escrito. ⛔ **Não exporte em bloco.** Um tipo que é detalhe de
   implementação (`SarakThemePayloadExtras` é candidato) não vira contrato público só porque estava na
   lista. **A tabela de classificação vai no resumo antes das edições.**
2. **Critério da decisão, e ele é objetivo:** o tipo aparece na assinatura de algo exportado — prop,
   parâmetro, retorno de hook, membro de contexto? Então **é público na prática** e tem de ser importável.
   Se não aparece, o ônus é justificar por que estava declarado no `.d.ts`.
3. **`src/index.ts`** — acrescentar os `export type { … }` que faltam, agrupados por arquivo de origem, no
   padrão que o arquivo já usa.
4. **Gate novo** (`gates/scripts/contrato/`): compara **declarados × exportados** no `dist/index.d.ts` e
   falha se algum tipo classificado como público ficar de fora. Registre em `package.json` e **declare o
   que ele não vê** (R18) — em especial: ele lê `dist/`, então **depende do build estar atualizado**, e não
   sabe distinguir sozinho "interno de propósito" de "esquecido".
5. **Teste do gate** (R8), com caso plantado mostrando a **saída de falha**.
6. **`docs/migracoes.md`** — entrada **MINOR**, aditiva. Diga explicitamente que quem derivou os tipos
   estruturalmente (via `ComponentProps<typeof SarakUIProvider>`) **pode voltar a importar pelo nome** e
   remover o contorno.

### Da ampliação §2.6 — o primeiro paint

7. **JSDoc em `persistence.strictBackendSync`** (`types.ts:171`) — o que faz, o que custa, e quando usar.
   No padrão do `crossTabSync`, que fica na linha seguinte e tem comentário completo.
8. **Seção nova em `docs/persistencia-de-tema.md`** — *"o primeiro paint"*: por que o `'hybrid'` custa **uma
   vez por navegador**, e as **três** saídas com o trade de cada uma:
   - injetar o design no HTML servido e passar em `config` — **zero flash, zero espera**; exige servidor do
     importador, e é o conserto de verdade;
   - `strictBackendSync: true` — troca o flash por tela vazia enquanto a requisição corre;
   - aceitar — é uma vez por navegador.
9. **A tabela de precedência da §2.6, no documento**, medida e com `arquivo:linha`. Sem ela o integrador
   descobre por tentativa e erro que o cache vence o `config`.
10. **Ponteiro no guia do consumidor** para a seção nova (mexe no gerador, como a `plan-43` fez).

## 3.2 Fora

- ⛔ **Mudar a forma de qualquer tipo.** Esta plan **exporta**; não redesenha, não renomeia, não achata.
  Renomear tipo público é MAJOR e não é isto aqui.
- ⛔ Exportar tudo o que está na lista sem classificar. Ver §3.1 item 1.
- ⛔ Mexer em componente, hook, comportamento ou no `docs/persistencia-de-tema.md`.
- ⛔ Tocar no consumidor. O contorno do ERP é client-side e sai sozinho quando isto publicar.
- ⛔ Mexer no `barrel:check` existente — ele cuida de componente; o de tipo é gate novo, separado.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/arquitetura/03-superficie-publica.md` | o contrato público é o barril — é a spec que esta plan corrige na prática |
| Spec fixa | `specs/specs/01-gates-e-baseline.md` §2 | onde o gate novo é registrado |
| Spec fixa | `specs/specs/03-versionamento-e-release.md` §3 | por que exportar tipo é MINOR |
| Spec fixa | `specs/specs/00-regras-e-invariantes.md` R8 · R18 | teste ao lado; gate declara o que não vê |
| Plan | `specs/plan/plan-43-…md` §2.1 | a premissa falsa que originou o achado — **não a reescreva**, ela é registro |
| **Skill** | `padrao-escrita` · `padrao-typescript` · `test-unitario` | sempre |
| Código | `src/index.ts:11` | o idioma de export de tipo que o arquivo já usa |

# 5. Instruções de execução

1. **Reproduza a medição** e cole a lista dos 29 no resumo:
   ```bash
   sed -n '/^export {/,$p' dist/index.d.ts | tr ',' '\n' | sed 's/^ *//; s/^type //' \
     | grep -oE "^[A-Za-z_][A-Za-z0-9_]*" | sort -u > /tmp/exportados.txt
   grep -oE "^(declare )?(interface|type) [A-Za-z_][A-Za-z0-9_]*" dist/index.d.ts \
     | awk '{print $NF}' | sort -u > /tmp/declarados.txt
   comm -23 /tmp/declarados.txt /tmp/exportados.txt
   ```
   Se o `dist/` estiver velho, rode `npm run build` antes — senão você mede o passado.
2. **Classifique os 29** (EXPORTAR / INTERNO + motivo). Tabela no resumo **antes** de editar.
3. **Acrescente os exports** em `src/index.ts`.
4. **Gate + teste**, com saída de falha demonstrada.
5. **`docs/migracoes.md`**, MINOR, com a nota sobre remover o contorno.
6. **Fechar.** Nesta ordem, colando a saída real: `npm run build` (INTEIRO — o `.d.ts` é o produto desta
   plan) · `npx vitest run` · `node gates/scripts/audit/run_audit.mjs` ·
   `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` · `npx tsc --noEmit` ·
   `npm run guide:check` · `npm run barrel:check` · o gate novo · `git diff --stat`.

> `build` e `guide:check` estão na lista porque esta plan mexe em **superfície pública** e o `.d.ts` só
> existe depois do build. É a disciplina que faltou nas plans 38 e 41.

# 6. Prompt de execução

```
Leia specs/00-prompt-executor.md e execute
specs/plan/plan-45-tipos-publicos-que-nao-sao-exportados.md.

Contexto obrigatório: specs/00-contexto.md, specs/00-knowledge.md,
specs/arquitetura/03-superficie-publica.md,
specs/specs/00-regras-e-invariantes.md R8 e R18,
specs/specs/03-versionamento-e-release.md §3.
Skills: padrao-escrita, padrao-typescript, test-unitario.

O DEFEITO, achado por um CONSUMIDOR REAL integrando persistência de tema:
`import type { SarakThemePayload } from '@sarak/lib-ui-core'` falha com TS2459 —
o tipo é usado na assinatura de uma prop pública e NÃO está no bloco `export {}`
do dist/index.d.ts. São 29 tipos nessa situação, entre eles SarakUIContextType
(e `useSarakUI` É exportado — dá para chamar o hook e não dá para nomear o
retorno), SarakUIProviderProps, SarakDesignState e as props de vários
componentes exportados.

O conserto é no BARRIL, não no bundler: src/index.ts:11 já faz
`export type { SarakUIMode } from './core/Provider/types'`. Os irmãos dele, no
MESMO arquivo de origem, nunca foram acrescentados.

PASSO 1, ANTES DE EDITAR: reproduza a medição (os comandos estão na §5 da plan)
e cole a lista dos 29 no resumo. Se o dist/ estiver velho, rode `npm run build`
antes — senão você mede o passado.

PASSO 2: CLASSIFIQUE OS 29, UM A UM — EXPORTAR ou MANTER INTERNO, com o motivo
escrito. ⛔ NÃO exporte em bloco. Um tipo que é detalhe de implementação
(SarakThemePayloadExtras é candidato) não vira contrato público só porque estava
na lista. A tabela vai no resumo ANTES das edições.
  Critério objetivo: o tipo aparece na assinatura de algo exportado — prop,
  parâmetro, retorno de hook, membro de contexto? Então É público na prática e
  tem de ser importável. Se não aparece, justifique por que estava declarado.

PASSO 3: acrescente os `export type { … }` em src/index.ts, agrupados por
arquivo de origem, no padrão que o arquivo já usa.

PASSO 4: gate novo comparando declarados × exportados no dist/index.d.ts, com
teste e SAÍDA DE FALHA demonstrada. Declare o que ele NÃO vê (R18) — em especial
que ele lê dist/ e portanto DEPENDE do build estar atualizado, e que não
distingue sozinho "interno de propósito" de "esquecido".

PASSO 5: docs/migracoes.md, MINOR. Diga explicitamente que quem derivou os tipos
estruturalmente (ComponentProps<typeof SarakUIProvider>) pode voltar a importar
pelo nome e REMOVER o contorno.

LINHAS VERMELHAS:
  · Você NÃO muda a forma de tipo nenhum. Esta plan EXPORTA; não redesenha, não
    renomeia, não achata. Renomear tipo público é MAJOR e não é isto aqui.
  · Você NÃO exporta a lista inteira sem classificar.
  · Você NÃO mexe em componente, hook ou comportamento.
  · Você NÃO mexe no barrel:check existente — ele cuida de componente.
  · Você NÃO toca em consumidor.

FECHE rodando `npm run build` INTEIRO (o .d.ts é o produto desta plan),
`npm run guide:check` e `npm run barrel:check`.

Não commite. Ao terminar, escreva o resumo na própria plan e mova o status para
🟠 Em revisão.
```

# 7. Critérios de aceite

- [ ] A lista dos 29 medida pelo executor está no resumo, **datada antes** das edições.
- [ ] **Cada um dos 29** tem veredito EXPORTAR/INTERNO **com motivo** — nenhum export em bloco.
- [ ] `import type { SarakThemePayload, SarakUIOptions, ThemeEntry } from '@sarak/lib-ui-core'` compila —
      evidência: teste ou trecho verificado contra o `.d.ts` reconstruído.
- [ ] `SarakUIContextType` importável (o `useSarakUI` é exportado e o retorno precisa de nome).
- [ ] **Nenhuma forma de tipo mudou** — só a lista de exports de `src/index.ts`.
- [ ] Gate novo verde, **com saída de falha demonstrada**, registrado em `package.json`, com o R18 declarado
      (inclusive a dependência de `dist/` atualizado).
- [ ] `docs/migracoes.md` **MINOR**, dizendo que o contorno pode ser removido.
- [ ] **(§2.6)** `strictBackendSync` tem JSDoc dizendo o que faz, o que custa e quando usar.
- [ ] **(§2.6)** `docs/persistencia-de-tema.md` tem a seção do **primeiro paint**, com as **três** saídas e
      o trade de cada uma.
- [ ] **(§2.6)** A tabela de precedência (`config` × `localStorage` × semente) está no documento, com
      `arquivo:linha`.
- [ ] **(§2.6)** O guia do consumidor aponta para a seção nova; kit regenerado.
- [ ] **(§2.6)** **Nenhuma mudança de comportamento** — a ampliação é artefato contando o que o código já
      faz.
- [ ] `npm run build` inteiro verde; `npx vitest run` verde, não encolheu; `run_audit` sem regressão;
      `tsc` → 0; `guide:check` e `barrel:check` verdes.
- [ ] `git diff --stat` — `src/index.ts`, o gate, seu teste, `package.json`, `docs/` e o `dist/`
      reconstruído. **Nenhum componente, nenhum hook.**

# 8. Como verificar (uso do revisor)

```bash
npm run build

# a medição, refeita: tem de sobrar só o que foi classificado como INTERNO
sed -n '/^export {/,$p' dist/index.d.ts | tr ',' '\n' | sed 's/^ *//; s/^type //' \
  | grep -oE "^[A-Za-z_][A-Za-z0-9_]*" | sort -u > /tmp/exportados.txt
grep -oE "^(declare )?(interface|type) [A-Za-z_][A-Za-z0-9_]*" dist/index.d.ts \
  | awk '{print $NF}' | sort -u > /tmp/declarados.txt
comm -23 /tmp/declarados.txt /tmp/exportados.txt

git diff -- src/index.ts        # só linhas de export type — nada mais
npx vitest run
npm run barrel:check
npm run guide:check
npx tsc --noEmit
```

**O que reprova:**
- export em bloco, sem a classificação um a um — é o pedido central da plan;
- qualquer mudança de **forma** de tipo (campo acrescentado, renomeado, opcionalidade alterada): seria MAJOR
  disfarçado de MINOR;
- gate mostrado só passando;
- `dist/` não reconstruído — o `.d.ts` é o produto, e sem build não há o que verificar;
- tipo classificado como INTERNO sem motivo escrito.

**O que esta verificação não vê:** se o consumidor de fato consegue remover o contorno. Isso só se prova no
ERP, e é a próxima rodada da `plan-40`.

# 9. Destino da síntese

**Destino:** `specs/arquitetura/03-superficie-publica.md` · `specs/specs/01-gates-e-baseline.md`

- `03-superficie-publica.md` — a regra que faltava: **tipo citado em assinatura pública é contrato público
  e tem de ser importável pelo nome**; e o registro de que `barrel:check` cobre componente, não tipo.
- `01-gates-e-baseline.md` — a linha do gate novo, com o que ele vê e o que não vê.
- `09-temas-e-presets.md` §4.4 — o custo do `'hybrid'` no primeiro paint e as três saídas, com a precedência
  medida. É o que faltava para o integrador não descobrir em produção.

---

# 10. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only. -->

## Resumo da execução — 2026-08-14

**Resultado:** Concluído

### Passo 1 — a medição, ANTES de qualquer edição

Rodei `npm run build` (dist estava desatualizado) e reproduzi a medição exata da §5:

```
declarados: 153
exportados: 248
declarados e NÃO exportados: 29

Accept, CatalogItem, ChartDataItem, DateLocale, DesignScopeProps, DesignToken,
DeviceProviderProps, DynamicRendererProps, FilterConfig, FlexDirection, Message,
PdfSource, PinnedOffsets, ReactFlowProps, SarakBrandingState, SarakDesignState,
SarakDesignTokens, SarakRuntimeExtras, SarakShellProps, SarakThemePayload,
SarakThemePayloadExtras, SarakTokenValue, SarakUIContextType, SarakUIOptions,
SarakUIProviderProps, ShellUser, ThemeEntry, TokenValueType, WeekStart
```

Bate com os 29 da plan.

### Passo 2 — classificação, um a um (ANTES de editar)

Critério aplicado, por tipo: ele é o tipo **direto** de uma prop/parâmetro/retorno/membro de
contexto já público (verificado lendo o código-fonte e, quando havia dúvida, o próprio
`dist/index.d.ts`)? Se só aparece como **operando** dentro da expressão de outro tipo já público
(ex.: `A & B`) — nunca ele mesmo o tipo direto de nada — e o próprio código já o documenta como
detalhe de composição/pendente, fica INTERNO.

| Tipo | Veredito | Motivo (evidência) |
|---|---|---|
| `Accept` | **EXPORTAR** | `SarakUploaderProps.accept?: Accept` — `SarakUploaderProps` já público |
| `CatalogItem` | **EXPORTAR** | `SarakCatalogGridProps.items: CatalogItem[]` / `renderCard` — já público |
| `ChartDataItem` | **EXPORTAR** | `SarakChartEngineProps.data: ChartDataItem[]` — já público |
| `DateLocale` | **EXPORTAR** | `SarakDatePickerProps.locale?: DateLocale` — já público |
| `DesignScopeProps` | **EXPORTAR** | tipo do componente `DesignScope`, já público (`React.FC<DesignScopeProps & …>`) |
| `DesignToken` | **EXPORTAR** | retorno de `getAllDesignTokens()`, já público |
| `DeviceProviderProps` | **EXPORTAR** | tipo do componente `DeviceProvider`, já público |
| `DynamicRendererProps` | **EXPORTAR** | tipo do componente `DynamicRenderer`, já público |
| `FilterConfig` | **EXPORTAR** | `SarakCardGridProps.filters?: FilterConfig[]` — já público |
| `FlexDirection` | **EXPORTAR** | `SarakFlexProps.direction?: FlexDirection \| …` — já público |
| `Message` (SarakChatEngine) | **EXPORTAR** | `SarakChatEngineProps.messages: Message[]` — já público. **Achado à parte**: existe um SEGUNDO tipo `Message` em `Templates/Chat/types.ts`, com forma diferente, mas ele não é alcançado por nenhum export atual — nem estava nos 29 (não chegou a ser `declared` no `.d.ts`). Não toquei nele; ver "Achados fora do escopo". |
| `PdfSource` | **EXPORTAR** | `SarakPDFViewerProps.src`/`onDownload` — já público |
| `PinnedOffsets` | **EXPORTAR** | retorno de `computeOffsets()`, já público |
| `ReactFlowProps` | **INTERNO** | só usado via acesso indexado (`ReactFlowProps['nodes']` etc.) DENTRO de `SarakFlowEngineProps` — nunca ele mesmo o tipo direto de nada. `reactflow` é peer dependency, com os próprios tipos disponíveis a quem precisar da forma exata |
| `SarakBrandingState` | **EXPORTAR** | `SarakUIContextType.branding`, `options.branding.initial` — já público |
| `SarakDesignState` | **EXPORTAR** | `ThemeEntry.contraparte?: Partial<SarakDesignState>` — `ThemeEntry` já público |
| `SarakDesignTokens` | **EXPORTAR** | aparece POR NOME (não inlinado) na declaração pública de `SarakThemePayload` (`Partial<SarakDesignTokens> & …`) — é a SSOT gerada, sem nenhum comentário de "detalhe interno" |
| `SarakRuntimeExtras` | **INTERNO** | só compõe `SarakDesignState` por interseção; o próprio comentário diz "não são design tokens do schema… não criar token novo aqui" |
| `SarakShellProps` | **EXPORTAR** | tipo do componente `SarakShell`, já público |
| `SarakThemePayload` | **EXPORTAR** | em toda parte — `SarakUIProviderProps.config`, `persistence.onSave/onLoad`, `SarakUIContextType.design`, etc. |
| `SarakThemePayloadExtras` | **INTERNO** | só compõe `SarakThemePayload` por interseção; o próprio comentário diz "pendente reconciliação… não adicione tokens novos aqui" — **exemplo citado pela própria plan** |
| `SarakTokenValue` | **EXPORTAR** | `DesignToken.defaultValue`, e alcançável pelo retorno de `useDesignDraft` (hook já público) |
| `SarakUIContextType` | **EXPORTAR** | retorno de `useSarakUI()`, hook já público — sem ele não dá pra nomear o retorno |
| `SarakUIOptions` | **EXPORTAR** | `SarakUIProviderProps.options`, `SarakUIContextType.options` |
| `SarakUIProviderProps` | **EXPORTAR** | tipo do componente `SarakUIProvider`, já público |
| `ShellUser` | **EXPORTAR** | `SarakShellProps.user?: ShellUser` — `SarakShellProps` já público |
| `ThemeEntry` | **EXPORTAR** | `SarakUIContextType.saveTheme`, `options.theme.onSave` — já público |
| `TokenValueType` | **EXPORTAR** | `DesignToken.type: TokenValueType` — `DesignToken` já público |
| `WeekStart` | **EXPORTAR** | `SarakDatePickerProps.weekStartsOn?: WeekStart` — já público |

**26 EXPORTAR, 3 INTERNO** (`ReactFlowProps`, `SarakRuntimeExtras`, `SarakThemePayloadExtras`) —
nenhum export em bloco, cada linha da tabela é a evidência lida no código antes de decidir.

### O que foi feito

- **7 arquivos** ganharam só a palavra `export` na frente de um `interface`/`type` que já existia,
  sem export no próprio módulo: `DeviceProvider.tsx` (`DeviceProviderProps`),
  `DynamicRenderer.tsx` (`DynamicRendererProps`), `SarakCatalogGrid.tsx` (`CatalogItem`),
  `SarakCardGrid.tsx` (`FilterConfig`), `SarakFlex.tsx` (`FlexDirection`),
  `DesignScope.tsx` (`DesignScopeProps`), `SarakChatEngine.tsx` (`Message`). **Zero mudança de
  forma** — conferido diff a diff, cada um é uma palavra numa linha só (colado na seção
  "Verificações" abaixo). Necessário porque `export type { X } from '...'` em `index.ts` exige que
  `X` já seja exportado no próprio módulo de origem.
- `src/index.ts` — os `export type { … }` que faltavam, agrupados por arquivo de origem
  (23 dos 26 EXPORTAR; os outros 3 — `CatalogItem`, `FilterConfig`, `DeviceProviderProps` — já
  propagam sozinhos por um `export *` existente, comprovado por medição antes/depois; adicionar
  uma linha explícita para eles arriscaria "member already exported").
- `gates/scripts/contrato/check-public-types-parity.mjs` (novo) + `gates/allowlists/publicTypeExclusions.mjs`
  (novo, mesmo idioma de `barrelExclusions.mjs`) — o gate permanente.
- `gates/scripts/contrato/__tests__/check-public-types-parity.test.mjs` (novo) — 10 testes.
- `package.json` — script `public-types:check`, encadeado no `build` **depois** de `build:js`
  (é o primeiro passo que produz o `.d.ts` que o gate lê) e **antes** de `build:css`.
- `docs/migracoes.md` — entrada MINOR, com o "antes" (TS2459 + contorno estrutural) e o "depois"
  (import direto), e a nota de que o contorno pode ser removido.
- `src/core/Provider/types.ts:171` — JSDoc em `strictBackendSync` (compactado numa linha para não
  estourar o teto de 250 do auditor — ver "Achado durante a execução" abaixo).
- `docs/persistencia-de-tema.md` — novo §6 "O primeiro paint": por que `'hybrid'` custa uma vez por
  navegador, as três saídas com trade explícito (injetar `config`, `strictBackendSync`, aceitar) e
  a tabela de precedência `config` × `localStorage` × semente, com `arquivo:linha`
  (`useDesignManager.ts:68` e `:93-104`, medidos agora — os números da plan (`:68,92-99`) tinham
  deslocado por causa dos commits da plan-42). §"Modelagem de referência" renumerada de §6 → §7.
- `sarak-ui/GUIA-FRONTEND.md:445-448` (prosa hand-authored) — ponteiro novo para a seção "O
  primeiro paint"; kit regenerado (`npm run guide`).

### Prova de compilação real (não só leitura de código)

Escrevi um arquivo temporário na raiz do repo importando os **26** tipos EXPORTAR do
`dist/index.d.ts` reconstruído (não de `src/`) e compilei com `npx tsc --strict`:

```
$ npx tsc --noEmit --strict --esModuleInterop --moduleResolution node --target ESNext \
    --module ESNext --jsx react-jsx --skipLibCheck __plan45_typecheck_proof.ts
EXIT=0
```

E o controle negativo — os 3 INTERNO continuam recusados, com o MESMO erro do consumidor real:

```
$ npx tsc --noEmit … __plan45_negative_raw.ts
__plan45_negative_raw.ts(1,15): error TS2459: Module '"./dist/index"' declares
'ReactFlowProps' locally, but it is not exported.
EXIT=2
```

Os dois arquivos temporários foram **apagados** logo depois (não fazem parte da entrega — são
verificação, mesma lógica da mutação-e-reversão que uso nos gates).

### Achado durante a execução (resolvido na hora)

`src/core/Provider/types.ts` estourou o teto de 250 linhas do `auditor_cleancode` depois do JSDoc
de `strictBackendSync` — `wc -l` mostrava 250 (parece ok), mas o auditor conta por
`content.split('\n').length`, que dá 251 num arquivo terminado em `\n` (a diferença entre contar
quebras-de-linha e contar "linhas" como um editor mostra). Compactei o JSDoc para uma linha só;
`run_audit` confirmou 0 regressão depois.

### Arquivos alterados

| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/index.ts` | alterado | 23 `export type { … }` novos, agrupados por origem |
| `src/core/Provider/DeviceProvider.tsx` | alterado | `export` em `DeviceProviderProps` |
| `src/core/Discovery/DynamicRenderer.tsx` | alterado | `export` em `DynamicRendererProps` |
| `src/components/atomic/Templates/SarakCatalogGrid.tsx` | alterado | `export` em `CatalogItem` |
| `src/components/atomic/Templates/SarakCardGrid.tsx` | alterado | `export` em `FilterConfig` |
| `src/components/atomic/Layouts/SarakFlex.tsx` | alterado | `export` em `FlexDirection` |
| `src/core/Design/components/DesignScope.tsx` | alterado | `export` em `DesignScopeProps` |
| `src/components/engines/chat/SarakChatEngine.tsx` | alterado | `export` em `Message` |
| `src/core/Provider/types.ts` | alterado | JSDoc de `strictBackendSync` (1 linha) |
| `gates/scripts/contrato/check-public-types-parity.mjs` | criado | o gate |
| `gates/allowlists/publicTypeExclusions.mjs` | criado | allowlist dos 3 INTERNO, com motivo |
| `gates/scripts/contrato/__tests__/check-public-types-parity.test.mjs` | criado | 10 testes |
| `package.json` | alterado | script `public-types:check`, encadeado no `build` |
| `docs/migracoes.md` | alterado | entrada MINOR nova |
| `docs/persistencia-de-tema.md` | alterado | §6 "O primeiro paint" novo; §6 antigo virou §7 |
| `sarak-ui/GUIA-FRONTEND.md` | alterado | ponteiro para a seção nova (prosa hand-authored) |
| `dist/*` | regenerado | subproduto do `npm run build` mandatório (ver nota da plan-44, mesmo princípio) |

### Verificações executadas

- Compilação real dos 26 EXPORTAR + controle negativo dos 3 INTERNO — colada acima.
- `node gates/scripts/contrato/check-public-types-parity.mjs` (isolado, contra o `dist/` real) →
  `[OK] Todo tipo declarado em dist/index.d.ts está exportado, ou tem exclusão com motivo.`
- **Saída de FALHA demonstrada com mutação real**: removi `type SarakThemePayload,` do bloco
  `export { }` de `dist/index.d.ts` de verdade e rodei o gate:
  ```
  [ERROR] 1 tipo(s) declarado(s) em dist/index.d.ts e NÃO exportado(s):
    - SarakThemePayload  (exporte em src/index.ts, ou declare em gates/allowlists/publicTypeExclusions.mjs com motivo)
  EXIT=1
  ```
  Revertido (`cp` do backup) e reconferido verde antes de prosseguir.
- `npx vitest run gates/scripts/contrato/__tests__/check-public-types-parity.test.mjs` (isolado) →
  **10/10 verde**.
- `npm run build` (INTEIRO, com `public-types:check` já encadeado depois de `build:js`) → **passa
  do início ao fim**, sem pular etapa.
- `npx vitest run` (suíte INTEIRA) → **316 arquivos / 1345 testes, 100% verde** (193,9 s). Era
  315/1335 antes desta plan — cresceu exatamente o arquivo e os 10 testes novos.
- `node gates/scripts/audit/run_audit.mjs` → **2 auditores vermelhos**, os mesmos de sempre
  (`SarakMultiSelect.tsx`/`SarakUploader.tsx` R10, variável-fantasma `--x`), sem relação com esta
  plan — o 3º (Clean Code em `types.ts`) apareceu e foi corrigido durante a própria execução (ver
  "Achado" acima), não sobrou no fechamento.
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` → `igual ao baseline de
  2026-08-11 — nenhuma regressão`.
- `npx tsc --noEmit` (projeto inteiro) → **0 erros**, exit 0.
- `npm run guide:check` → `kit em dia (6 arquivos)`.
- `npm run barrel:check` → `77 componentes registrados; barril em dia (0 faltas)` — **inalterado**,
  confirma que esta plan não tocou superfície de componente, só de tipo.
- `npm run gate-limits:check` (R18, cautela por ter criado gate novo) → `[OK] Os 33 scripts de
  gates/scripts/ declaram o que não veem`.
- `npm run persistence-doc:check` (gate da plan-43, sensível a edição em
  `docs/persistencia-de-tema.md`) → continua `[OK]`.
- `git diff --stat` / `git status --short` → só os arquivos da tabela acima.

### Critérios de aceite

- [x] Lista dos 29 no resumo, datada antes das edições — evidência: "Passo 1".
- [x] Cada um dos 29 com veredito e motivo, nenhum export em bloco — evidência: tabela "Passo 2".
- [x] `import type { SarakThemePayload, SarakUIOptions, ThemeEntry }` compila — evidência: prova de
      compilação real contra `dist/index.d.ts`.
- [x] `SarakUIContextType` importável — evidência: mesma prova, incluído na lista dos 26.
- [x] Nenhuma forma de tipo mudou — evidência: diffs colados (§"Verificações" da conversa) — cada
      um dos 7 arquivos de origem ganhou só a palavra `export`; `src/index.ts` só ganhou linhas de
      export; `types.ts` só teve um JSDoc reescrito (mesmo campo, mesmo tipo).
- [x] Gate novo verde, com saída de falha demonstrada, registrado em `package.json`, R18 declarado
      (inclusive a dependência de `dist/` atualizado) — evidência acima.
- [x] `docs/migracoes.md` MINOR, dizendo que o contorno pode ser removido — evidência: entrada
      nova, parágrafo "Se você contornou a lacuna…".
- [x] **(§2.6)** `strictBackendSync` com JSDoc (o que faz, o que custa, quando usar) —
      evidência: `types.ts:171`.
- [x] **(§2.6)** `docs/persistencia-de-tema.md` com a seção do primeiro paint e as três saídas —
      evidência: §6 novo.
- [x] **(§2.6)** Tabela de precedência com `arquivo:linha` — evidência: §6, subseção da precedência.
- [x] **(§2.6)** Guia do consumidor aponta para a seção nova; kit regenerado — evidência acima.
- [x] **(§2.6)** Nenhuma mudança de comportamento — nenhum arquivo de comportamento (hooks,
      componentes de runtime) foi tocado nesta parte; só documentação e um JSDoc.
- [x] `npm run build` inteiro verde; `vitest` verde e não encolheu; `run_audit` sem regressão;
      `tsc` → 0; `guide:check` e `barrel:check` verdes — evidência acima.
- [x] `git diff --stat` — `src/index.ts`, o gate, seu teste, `package.json`, `docs/` e o `dist/`
      reconstruído — evidência acima, **mais os 7 arquivos de origem que precisaram do `export`**
      (ver "Decisões e suposições").

### Decisões e suposições

- **Os 7 arquivos de origem com `export` adicionado não estavam explicitamente na lista de
  `git diff --stat` que o §7 da plan antecipava** (`src/index.ts`, o gate, o teste, `package.json`,
  `docs/`, `dist/`). São consequência direta e necessária do próprio pedido da plan — `export type
  { X } from '<módulo>'` em `index.ts` não compila se `X` não for exportado nesse módulo — e cada
  diff é de uma palavra só, sem mudança de forma. Registrado explicitamente para não parecer
  omissão.
- **3 dos 26 EXPORTAR (`CatalogItem`, `FilterConfig`, `DeviceProviderProps`) não ganharam linha
  explícita em `index.ts`** — comprovei por medição (antes/depois de só adicionar `export` na
  fonte, sem tocar `index.ts`) que eles já propagam sozinhos por um `export *` de dois níveis já
  existente (`Templates/index.ts` → `index.ts`, e `core/Provider/DeviceProvider` → `index.ts`).
  Adicionar uma linha explícita redundante arriscaria erro de "member already exported" — testei
  isso: o build passou sem erro depois de adicionar as linhas dos outros 23, confirmando que não
  houve colisão nenhuma nem para estes 3 (porque não escrevi linha pra eles).
- **`SarakDesignTokens` classificado EXPORTAR, ao contrário de `SarakThemePayloadExtras`/
  `SarakRuntimeExtras`, apesar dos três aparecerem só dentro de uma expressão de interseção.** A
  distinção: os dois últimos têm comentário próprio no código dizendo que são detalhe/pendência de
  reconciliação, nunca para virar vocabulário público; `SarakDesignTokens` é a SSOT gerada (422
  tokens reais), sem nenhuma ressalva desse tipo, e um consumidor querendo "só os tokens, sem os
  campos legados" tem uso real para `Partial<SarakDesignTokens>` isolado. Documentado por extenso
  na tabela do "Passo 2".
- **O segundo `Message`** (`Templates/Chat/types.ts`) não foi tocado — não estava nos 29 (nunca
  chegou a `declared` no `.d.ts`, então não é o que esta plan cobre) e mexer nele seria além do
  escopo desta plan (mudar o que está — ou não está — alcançável a partir de `SarakChat`/
  `SarakChatProps` é decisão de outra plan, não "exportar tipo já usado"). Ver "Achados fora do
  escopo".

### Achados fora do escopo (não corrigidos)

- `src/components/atomic/Templates/Chat/types.ts` declara `Message`/`Attachment`/`ModelRoute`, mas
  nenhum dos três aparece em `dist/index.d.ts` — sugerindo que `SarakChat`/`SarakChatProps`
  (Templates) não os usa de verdade, ou que a peça que os usaria não está no grafo de export.
  Não investiguei mais fundo por estar fora do escopo (esta plan é sobre tipos que JÁ aparecem
  declarados e usados; isto é possível código morto, achado diferente). Se for confirmado código
  morto, é candidato a uma faxina (`code-limpeza-projeto`), não a esta plan.
- Os 2 auditores vermelhos de `run_audit` (`SarakMultiSelect.tsx`/`SarakUploader.tsx`,
  variável-fantasma) já eram vermelhos no baseline, sem relação com esta plan.

### Pendências / riscos

- Nenhuma pendência conhecida dentro do escopo desta plan.
- A síntese para `specs/arquitetura/03-superficie-publica.md` e
  `specs/specs/01-gates-e-baseline.md` (e `09-temas-e-presets.md` §4.4, citada na §9) é do
  revisor/`spec-atualizar`, fora do escopo do executor.

---

# 11. Veredito

<!-- Preenchido pelo REVISOR. Append-only. -->

## Veredito — 2026-08-14 — 🟢 Aprovada

A classificação foi feita como pedida — um a um, com motivo — e a **prova é de compilação, não de leitura**.
Isso resolve o defeito e a causa do defeito ao mesmo tempo: eu tinha afirmado o contrário na `plan-43` por
ter lido o arquivo em vez de compilar contra ele.

### A prova que fecha a questão

O executor compilou um arquivo temporário importando os **26** tipos direto do `dist/index.d.ts` com
`tsc --strict` → **exit 0**. E fez o **controle negativo**: os 3 classificados como INTERNO reproduzem o
mesmo `TS2459` que o consumidor original relatou.

Controle negativo não estava no pedido. É o que separa "compilou" de "compilou pelo motivo certo".

### A medição, refeita por mim

```
declarados e NÃO exportados agora: ReactFlowProps, SarakRuntimeExtras, SarakThemePayloadExtras
(eram 29)
```

Os três batem exatamente com os classificados como INTERNO, e cada um tem entrada em
`gates/allowlists/publicTypeExclusions.mjs` **com motivo escrito** — no idioma do `barrelExclusions.mjs`,
que já existia. Exclusão com motivo é diferente de esquecimento; a diferença agora está no arquivo.

*(Um `Accept` aparece na minha varredura como não-exportado e **é** exportado — meu extrator perde o
primeiro item da linha do bloco `export {`. Artefato do meu comando, não do trabalho.)*

### O escopo, que cresceu — e a declaração está certa

Sete arquivos de origem ganharam **uma palavra** cada (`interface X` → `export interface X`), necessária
para o barril conseguir reexportar. `git diff --stat` mostra `2 +-` em cada um: uma linha modificada, nada
mais. **Nenhuma forma de tipo mudou** — que era o risco de virar MAJOR disfarçado de MINOR.

`types.ts` ganhou **uma linha**: o JSDoc do `strictBackendSync`. Fechou em **249 de 250** (R9) — apertado, e
o executor declarou a compactação que precisou fazer para caber.

### O gate, e o lugar dele

`check-public-types-parity` está **encadeado no `npm run build`**, logo depois do `build:js`. É o lugar
certo: ele lê `dist/index.d.ts`, que só existe depois do build — pô-lo num hook seria um gate medindo
artefato velho. E a saída de falha foi demonstrada **mutando o `.d.ts` de verdade**, não com fixture.

`gate-limits:check` → **33/33**.

### A ampliação §2.6, conferida item a item

| | |
|---|---|
| JSDoc em `strictBackendSync` | presente: *"segura os filhos até `onLoad` resolver — troca flash por tela vazia"* |
| Seção do primeiro paint | `docs/persistencia-de-tema.md` **§6 "O primeiro paint"** |
| As três saídas e a tabela de precedência | `config`, `strictBackendSync`, `localStorage vazio`, *"uma vez por navegador"* — todos presentes |
| Ponteiro no guia do consumidor | presente; kit regenerado |
| Comportamento | **inalterado** — é artefato contando o que o código já faz |

### Gates

| | |
|---|---|
| `npm run build` | **exit 0**, com o gate novo já dentro da cadeia |
| `npx vitest run` | **316 / 1345 verde** — mas ver a nota abaixo |
| `npx tsc --noEmit` · baseline | **0** · igual ao baseline de 2026-08-11 |
| `barrel:check` | **77** — inalterado, confirma que a superfície de **componente** não se moveu |

### 🔴 A intermitência da suíte, agora reproduzida — e não é desta plan

Rodei a suíte **duas vezes seguidas neste mesmo worktree, sem tocar em nada**:

| Execução | Resultado |
|---|---|
| 1ª | **1 arquivo / 2 testes FALHARAM** (316 arquivos, 1343/1345) |
| 2ª | **316 / 1345 verde** |

**É a mesma forma exata** do que registrei no veredito da `plan-41`: *1 arquivo / 2 testes*. Duas
observações, em dias diferentes, com a mesma assinatura — **não é aleatório, é um arquivo específico com
dois testes**. E continuo sem nomeá-lo: nas duas vezes a execução seguinte passou verde e o bloco de falha
não sobreviveu à minha captura.

**Não reprova a `plan-45`** — a assinatura precede esta plan e a execução verde bate com o número declarado.
Mas já custou três execuções extras hoje e mina a base de toda aprovação desta leva. **Vira plan própria,
com prioridade — não dá para seguir tratando "suíte verde" como fundação enquanto ela é probabilística.**

### O que esta revisão NÃO viu

Se o consumidor consegue **remover o contorno**. A prova de compilação foi contra o `.d.ts`, aqui; a prova
real é o ERP apagando as três derivações e compilando. Próxima rodada da `plan-40`.

### Destino da síntese

Declarado na §9, **não executado por mim**: `arquitetura/03-superficie-publica.md` (tipo citado em
assinatura pública é contrato público e tem de ser importável; `barrel:check` cobre componente, não tipo),
`01-gates-e-baseline.md` (o gate novo), e `09-temas-e-presets.md` §4.4 (o custo do `'hybrid'` no primeiro
paint, com a precedência medida).
