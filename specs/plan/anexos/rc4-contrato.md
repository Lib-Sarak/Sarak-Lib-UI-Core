---
tipo: "anexo"
titulo: "Contrato da 8.0.0-rc.4 (lote 1) — superfície pública prometida ao ERP"
dominio: "Superfície pública"
status: "🟢 Aceito pelo dono (2026-10-27)"
tags: ["rc.4", "contrato", "erp", "superficie-publica"]
relacionados: ["[[00-indice]]", "[[arquitetura/03-superficie-publica]]", "[[10-seguranca-e-acessibilidade]]", "[[05-cromo-e-slots]]", "[[07-responsividade-e-multidispositivo]]", "[[09-temas-e-presets]]", "[[024-paleta-calculada-separada-do-tema]]", "[[plan-119-kit-de-importacao-aprendido-nos-importadores]]", "[[plan-133-motor-de-paletas]]", "[[plan-134-catalogo-de-paletas-e-temas]]", "[[plan-135-paletas-no-painel-e-no-kit]]"]
---

# 0. Como ler

- **Base:** `v8.0.0-rc.3` (`c14282f2`). Cada "hoje" abaixo foi conferido no `src/` dessa tag.
- **Regra de nome:** depois do aceite, nenhum nome desta página muda sem aviso prévio ao ERP. Mudança = nova
  revisão deste arquivo com a linha em §8.
- **Já existe na lib — use como está:** valor por dispositivo é o tipo público `SarakResponsiveValue<T> = { mob; tab; desk }`
  (`src/core/Design/types.ts:9`, exportado no barril). O formato `{ mobile, tablet, desktop }` não existe e não será criado. Que
  o ERP não o tenha achado é falha de exposição da lib, tratada na `plan-119` (lote 8).
- **Formato de valor:** tudo usa o tipo que já existe, `SarakValueFormat` (`src/shared/format/types.ts`):
  `{type:'number'|'currency'|'percent'|'date', …}`. `percent` segue o `Intl`: **0,12 → 12 %**.
- **Idioma:** a lib **não traduz** o sistema. Ela tem os próprios textos (em seis idiomas), o seletor e os caminhos para o i18n do
  sistema acompanhar a escolha (§1.8). Textos da lib, formatação e seletor leem uma fonte só.
- **Padrão de toda prop nova:** omitida, o componente faz exatamente o que faz na rc.3. As exceções estão em §5.

---

# 1. Componentes, hooks e funções novos

## 1.1 `SarakGridItem` — ocupação de coluna sem classe utilitária

```ts
interface SarakGridItemProps extends React.HTMLAttributes<HTMLDivElement> {
  span?: number | 'full' | SarakResponsiveValue<number | 'full'>; // omitido: 1 trilha (fluxo normal)
  rowSpan?: number | SarakResponsiveValue<number>;
  as?: React.ElementType;                                           // padrão 'div'
  children?: React.ReactNode;
}
```
```tsx
<SarakGrid columns={{ mob: 1, tab: 6, desk: 12 }}>
  <SarakGridItem span={{ mob: 'full', tab: 6, desk: 8 }}><Fluxo /></SarakGridItem>
  <SarakGridItem span={{ mob: 'full', tab: 6, desk: 4 }}><Resumo /></SarakGridItem>
</SarakGrid>
```
O dispositivo vem do `DeviceProvider` (breakpoints do tema), não de classe Tailwind fixa. As classes `col-span-*` continuam valendo.

## 1.2 `SarakFormSection` — grupo de campos com legenda

```ts
interface SarakFormSectionProps {
  title: React.ReactNode;               // vira <legend>
  description?: React.ReactNode;        // ligada ao <fieldset> por aria-describedby
  columns?: number | SarakResponsiveValue<number>; // padrão 1; no celular é sempre 1
  disabled?: boolean;                   // repassado ao <fieldset>
  children: React.ReactNode;
  className?: string;
}
```
```tsx
<SarakFormSection title="Faturamento" description="Dados da nota" columns={{ mob: 1, tab: 2, desk: 3 }}>
  <SarakMaskedInput label="CNPJ" mask="cnpj" validate />
  <SarakInput label="Valor" prefixText="R$" />
</SarakFormSection>
```

## 1.3 `SarakTabPanel` — painel ligado à aba

```ts
interface SarakTabPanelProps { tabId: string; idPrefix: string; children: React.ReactNode; }
```
```tsx
<SarakTabs idPrefix="contrato" tabs={abas} activeTab={aba} onChange={setAba} />
<SarakTabPanel idPrefix="contrato" tabId={aba}>{conteudo}</SarakTabPanel>
```
Gera `role="tabpanel"`, `id` e `aria-labelledby` que casam com o `aria-controls` da aba. `idPrefix` é obrigatório nos dois lados para o par casar; sem `idPrefix` (ou `panelId`) a aba não emite `aria-controls`.

## 1.4 Exportação CSV

```ts
function sarakTableToCsv<T>(columns: SarakColumn<T>[] | SarakTableColumn<T>[], rows: T[], options?: {
  separator?: ';' | ',';     // padrão: ';' quando o locale usa vírgula decimal (pt-BR), senão ','
  formatted?: boolean;       // padrão true: exporta o valor exibido (format); false: o valor bruto
  includeFooter?: boolean;   // padrão true quando há agregação
  locale?: string;           // padrão: o locale do ambiente; a SarakTable passa o de useSarakLanguage
}): string;                  // sempre com BOM UTF-8 — abre certo no Excel pt-BR
function sarakDownloadCsv(filename: string, csv: string): void;
```
```ts
sarakDownloadCsv('faturas.csv', sarakTableToCsv(colunas, faturas));
```

## 1.5 Documentos brasileiros

```ts
function sarakIsValidCpf(value: string): boolean;                 // dígito verificador
function sarakIsValidCnpj(value: string): boolean;                // numérico e alfanumérico (regra de 2026)
function sarakFormatDocument(value: string, kind?: 'cpf' | 'cnpj' | 'cep' | 'auto'): string; // padrão 'auto'
```
```ts
sarakFormatDocument('12ABC34501DE35') // '12.ABC.345/01DE-35'
```

## 1.6 Atalhos de período

```ts
type SarakDatePresetId = 'today' | 'yesterday' | 'last7Days' | 'last30Days'
  | 'thisMonth' | 'lastMonth' | 'thisQuarter' | 'thisYear';
interface SarakDatePreset { label: string; value: SarakDatePickerValue | (() => SarakDatePickerValue); }
```
Usados pela prop `presets` do `SarakDatePicker` (§2.8). Rótulos dos ids vêm do catálogo de textos da lib.

## 1.7 Agregação

```ts
type SarakAggregate<T> = 'sum' | 'avg' | 'count' | 'min' | 'max'
  | ((values: unknown[], rows: T[]) => unknown);
function sarakAggregate<T>(rows: T[], column: SarakColumn<T> | SarakTableColumn<T>): unknown;
```
Exportada para o consumidor reaproveitar o mesmo cálculo fora da tabela (ex.: card de total).

## 1.8 Idioma — o sistema declara, a lib segue e avisa

**Hoje:** a lista do seletor (`SarakShellLanguageSelector`) vem do **tema** (`design.enabledLanguages`); a troca grava a
preferência e não avisa ninguém; os textos da lib leem `design.language`, o `SarakValue` lê `preferences.language`, os
formatadores usam o idioma do navegador e o `SarakDatePicker` cai no inglês do `date-fns`.

**Na rc.4** — nova chave `options.i18n` do `SarakUIProvider`:

```ts
interface SarakI18nOptions {
  languages?: Array<string | { code: string; label: string }>; // os idiomas DO SISTEMA, em BCP-47 ('pt-BR', 'en-US')
  language?: string;                         // controlado: o idioma atual do i18n do sistema
  onLanguageChange?: (code: string) => void; // o usuário trocou no seletor; o i18n do sistema troca junto
}
function useSarakLanguage(): {
  language: string;   // o código do sistema ('pt-BR')
  locale: string;     // BCP-47 usado na formatação ('pt' sem região → 'pt-BR')
  languages: string[];
  setLanguage(code: string): void; // mesmo caminho do seletor (chama onLanguageChange)
};
```
```tsx
<SarakUIProvider options={{ i18n: { languages: ['pt-BR', 'en-US'], language: i18n.language,
  onLanguageChange: (code) => i18n.changeLanguage(code) } }}>
```

- O seletor lista `i18n.languages`; sem ela, a lista do tema (comportamento da rc.3). Com um idioma só, não aparece (como hoje).
- Os textos da lib usam o idioma pela parte primária (`pt-BR` → `pt`); idioma fora dos seis da lib cai em `pt` (regra atual, R34).
- Passam a ler `locale` daqui: `SarakValue`, `SarakCurrencyInput`, `SarakDatePicker`, `SarakChartEngine`, as tabelas e os
  `sarakFormat*` usados dentro de componente. A prop `locale` de cada componente continua vencendo.
- Sem `options.i18n`: a fonte é `design.language` como hoje, e a formatação passa a segui-la (§5 Q3).

## 1.9 Paletas de cor — a cor sai do tema *(decisão do dono, 2026-10-27; plans 133–135)*

Token novo de tema, `colorPalette` (string):

```ts
type SarakPaletteType = 'monochromatic' | 'analogous' | 'complementary' | 'split-complementary' | 'triadic';
// valor de colorPalette:
//   "<id-de-preset>"                                        ex.: "oceano"
//   "custom:<tipo>:<#base>[,sec=<#hex>][,acc=<#hex>]"       ex.: "custom:analogous:#2563eb"
function sarakResolvePalette(value: string, mode: 'light' | 'dark'): Record<string, string>; // tokens de cor calculados
```

- A paleta é **calculada**: escalas OKLCH a partir das sementes, um mapa de papéis comum por modo e correção de contraste — qualquer cor
  de entrada gera uma tela legível nos dois modos.
- **Cor explícita vence a paleta**: a declarada pelo tema, pelo `config` do host ou ajustada pelo usuário no painel.
- Ausente, nada muda: os temas salvos pelo importador (com cores explícitas) continuam iguais.
- O painel oferece os presets e a criação a partir de uma cor; a escolha vai no tema salvo, pelas portas que já existem. O backend do
  importador recebe `colorPalette` como mais um valor opaco do payload.

---

# 2. Props novas em componentes que já existem

## 2.1 Colunas — `SarakColumn<T>` (DataTable) e `SarakTableColumn<T>` (Table)

As duas ganham **o mesmo bloco**, `SarakColumnValueOptions<T>` (exportado), para não divergirem:

| Prop | Tipo | Padrão (= rc.3) |
|---|---|---|
| `accessor` | `(row: T) => unknown` | `row[id]` (DataTable) / `row[key]` (Table) |
| `format` | `SarakValueFormat` | sem formato; numérico com `format` alinha à direita e usa `tabular-nums` |
| `sortable` | `boolean` | DataTable: `false` (rc.3); Table: `true` (a rc.3 ordena tudo) |
| `sortValue` | `(row: T) => unknown` | o valor de `accessor` |
| `searchValue` | `(row: T) => string` | o **texto exibido** (com `format`) |
| `aggregate` | `SarakAggregate<T>` | nenhum |
| `footer` | `ReactNode \| ((ctx: { value: unknown; rows: T[] }) => ReactNode)` | com `aggregate`: o agregado formatado; sem os dois, célula vazia |
| `rowHeader` | `boolean` | `false`; `true` → `th scope="row"` (Table) / `role="rowheader"` (DataTable) |
| `colSpan` | `(row: T) => number \| undefined` | `undefined` (1); as colunas cobertas não são renderizadas naquela linha |

A linha de rodapé só aparece se ao menos uma coluna tiver `aggregate` ou `footer`. Ela é `<tfoot>` / `rowgroup`.

## 2.2 `SarakDataTable` e `SarakTable` (ambas)

| Prop | Tipo | Padrão |
|---|---|---|
| `groupBy` | `{ key: string \| ((row: T) => string); label?: (key: string, rows: T[]) => ReactNode; subtotals?: boolean; defaultExpanded?: boolean }` | sem agrupamento; `subtotals` `true`, `defaultExpanded` `true` |
| `renderExpanded` | `(row: T) => ReactNode` | sem linha expansível |
| `expandedKeys` / `onExpandedChange` | `React.Key[]` / `(keys) => void` | estado interno |
| `searchQuery` / `onSearchQueryChange` | `string` / `(q: string) => void` | Table: estado interno (como hoje); DataTable: sem filtro |
| `totalCount` | `number` | — ; quando maior que as linhas visíveis, marcar o cabeçalho oferece "Selecionar todos os N" |
| `selectAll` / `onSelectAllChange` | `boolean` / `(all: boolean) => void` | `false`; com `true`, `selectedKeys` passa a ser a lista de **exceções** |
| `exportable` *(só Table, que tem barra)* | `boolean \| { filename?: string }` | `false` |

## 2.3 Só `SarakDataTable`

| Prop | Tipo | Padrão |
|---|---|---|
| `getChildren` | `(row: T) => T[] \| undefined` | sem árvore; com ela, vira **tree-table** (plano de contas, DRE): a 1ª coluna indenta e ganha o botão de expandir com `aria-expanded` |
| `defaultExpandedDepth` | `number` | `0` |
| `reorderable` | `boolean` | `true` (hoje todo cabeçalho é arrastável) |
| `skeletonRows` | `number` | `8` — com `loading` e sem linhas, desenha esqueleto no lugar do texto |

## 2.4 `SarakChartEngine`

| Prop | Tipo | Padrão |
|---|---|---|
| `valueFormat` | `SarakValueFormat` | sem formato (rc.3); vale para eixo de valor, dica e rótulos |
| `series[].format` | `SarakValueFormat` | herda `valueFormat` (útil no eixo direito) |
| `height` | `number \| string` | `100%` do pai (rc.3) |
| `referenceLines` | `Array<{ value: number; label?: string; axis?: 'left' \| 'right'; tone?: 'neutral' \| 'success' \| 'warning' \| 'error'; dashed?: boolean }>` | nenhuma |
| `referenceBands` | `Array<{ from: number; to: number; label?: string; tone?: … }>` | nenhuma |
| `zoom` | `boolean \| 'inside' \| 'slider'` | `false`; `true` = `'slider'` |
| `pieLabel` | `'name' \| 'value' \| 'percent' \| 'name-percent' \| 'none'` | o rótulo da rc.3 |
| `gauge` | `{ min?: number; max?: number }` | `0`–`100`; o `%` só aparece se `valueFormat` for `percent` **ou** se `valueFormat` for omitido (rc.3) |

Tudo isso é do motor ECharts; com `engine: 'recharts'` entra no aviso de prop ignorada que já existe.

## 2.5 `SarakStatsMetricConfig`

| Prop | Tipo | Padrão |
|---|---|---|
| `signColor` | `boolean` | `true` (rc.3) |
| `goodDirection` | `'up' \| 'down'` | `'up'`; `'down'` inverte a cor (despesa, atraso) — a seta continua mostrando o sentido real |
| `deltaFormat` | `SarakValueFormat` | o formato da rc.3; `{ type: 'percent' }` faz o delta percentual |
| `deltaLabel` | `string` | nenhum; ex.: `"vs. mês anterior"` |
| `target` / `targetLabel` | `number` / `string` | nenhum; mostra barra de progresso até a meta e "Meta: …" no `format` da métrica |
| `sparkline` | `number[]` | nenhum |

## 2.6 Indicadores pequenos

| Componente | Prop | Tipo | Padrão |
|---|---|---|---|
| `SarakSparkline` | `baseline` | `'auto' \| 'zero'` | `'auto'` (rc.3); `'zero'` fixa o zero e desenha a linha de base |
| `SarakProgress` | `allowOverflow` | `boolean` | `false`; `true` aceita `value > max`, enche a barra e marca o excesso com o tom de alerta |
| `SarakProgress` | `showValue` | `boolean` | `false` |
| `SarakProgress` | `valueFormat` | `SarakValueFormat` | `{ type: 'percent' }` sobre `value/max` |

## 2.7 Layout

| Componente | Prop | Tipo | Padrão |
|---|---|---|---|
| `SarakGrid` | `columns` | `number \| SarakResponsiveValue<number>` | omitido = rc.3; vence `templateColumns` se os dois vierem |
| `SarakAnalyticalPage` | `sidePanelWidth` | `number \| string` | a largura da rc.3 |
| `SarakAnalyticalPage` | `fillHeight` | `boolean` | `false`; `true` ocupa a altura que o cromo deixa |
| `SarakCard` | `density` | `'sm' \| 'md' \| 'lg'` | `'md'` (rc.3) |
| `SarakTabs` | `idPrefix` | `string` | gerado |
| `SarakTabs` | `onNavigate` | `(href: string, tab: SarakTabItem) => void` | — ; com ele, clique em aba com `href` não recarrega a página |
| `SarakTabs` | `onChange` | passa a **opcional** | (era obrigatória; afrouxar não quebra) |
| `SarakTabItem` | `href` | `string` | — ; com `href`, a lista vira `<nav>` de links com `aria-current="page"` (padrão correto para aba-rota) |
| `SarakTabItem` | `count` | `number` | — ; contador lido junto do rótulo pelo leitor de tela |
| `SarakTabItem` | `panelId` | `string` | `${idPrefix}-panel-${id}` |

## 2.8 Formulário

| Componente | Prop | Tipo | Padrão |
|---|---|---|---|
| `SarakInput` | `prefixText` / `suffixText` | `ReactNode` | nenhum; ligados ao campo por `aria-describedby` |
| `SarakSelect` | `label` | passa a **obrigatória** | §5 Q1 |
| `SarakSelect` | `hideLabel` | `boolean` | `false`; rótulo só para leitor de tela (filtro em barra) |
| `SarakSelect` | `options` | `Array<{ label: string; value: string; disabled?: boolean }>` | — ; alternativa a `children` |
| `SarakMaskedInput` | `mask` | ganha o preset `'cep'`; `'cnpj'` aceita o alfanumérico | §5 Q5 |
| `SarakMaskedInput` | `validate` | `boolean` | `false`; com `cpf`/`cnpj`, confere o dígito no `blur`, marca `aria-invalid` e mostra o erro traduzido |
| `SarakDatePicker` | `min` / `max` | `string` (ISO) | sem limite |
| `SarakDatePicker` | `isDateDisabled` | `(iso: string) => boolean` | nenhuma |
| `SarakDatePicker` | `presets` | `Array<SarakDatePresetId \| SarakDatePreset>` | nenhum |
| `SarakDatePicker` | `allowTyping` | `boolean` | `false` (rc.3); `true` aceita a data digitada no `displayFormat` e valida contra `min`/`max` |
| `SarakDatePicker` | `clearable` | `boolean` | `false`; limpar emite `''` (single) ou `['', '']` (range) — cabe no tipo atual |
| `SarakAutocompleteOption` | `description` | `string` | nenhuma; linha secundária (ex.: CNPJ) |
| `SarakAutocomplete` | `selection` / `onSelectionChange` | `SarakAutocompleteOption \| null` / `(o: … \| null) => void` | — ; **valor pelo id**: o campo mostra `selection.label`, o consumidor guarda `selection.value` |
| `SarakAutocomplete` | `onCreate` / `createLabel` | `(query: string) => void` / `(query: string) => string` | nenhum; padrão traduzido "Criar “{query}”" |
| `SarakForm` | — | sem mudança de API | JSDoc e catálogo declaram: formulário simples gerado por `mapping`, **não é para CRUD**; CRUD = `SarakFormSection` + inputs |

## 2.9 Feedback e outros

| Componente | Prop | Mudança |
|---|---|---|
| `SarakConfirmOptions` (`confirm`) | `message` | `string` → `ReactNode` |
| `SarakAlert` | `message` | `string` → `ReactNode` (`title` segue `string`: é o nome acessível) |
| `SarakFilterSelect` | `options` | `string[]` → `string[] \| Array<{ label: string; value: string }>` |
| `SarakFilterSelect` | `placeholder` | passa a valer; o padrão sai do catálogo de textos da lib, no idioma escolhido |
| `SarakFilterSelect` | `label` | novo, `string`; nome acessível do seletor |
| `SarakKanbanCard` | `value` | novo, `number` |
| `SarakKanban` | `valueFormat` | novo, `SarakValueFormat`; com algum cartão com `value`, a coluna mostra a soma no cabeçalho |
| `SarakKanban` | `columnTotal` | novo, `boolean \| ((column) => ReactNode)`; padrão: aparece só se houver `value` |

---

# 3. Tipos novos ou alterados que o consumidor importa

Novos: `SarakGridItemProps`, `SarakFormSectionProps`, `SarakTabPanelProps`, `SarakColumnValueOptions<T>`,
`SarakAggregate<T>`, `SarakTableGroupBy<T>`, `SarakChartReferenceLine`, `SarakChartReferenceBand`,
`SarakDatePresetId`, `SarakDatePreset`, `SarakI18nOptions`, `SarakPaletteType`.

Alterados (só aditivos, salvo §5): `SarakColumn<T>`, `SarakTableColumn<T>`, `SarakDataTableProps<T>`,
`SarakTableProps<T>`, `SarakChartEngineProps`, `SarakStatsMetricConfig`, `SarakSparklineProps`,
`SarakProgressProps`, `SarakGridProps`, `SarakAnalyticalPageProps`, `SarakCardProps`, `SarakTabItem`,
`SarakTabsProps`, `SarakInputProps`, `SarakSelectProps`, `SarakMaskedInputProps`, `SarakDatePickerProps`,
`SarakAutocompleteOption`, `SarakAutocompleteProps`, `SarakConfirmOptions`, `SarakAlertProps`,
`SarakFilterSelectProps`, `SarakKanbanCard`, `SarakKanbanProps`, `SarakUIOptions`.

Removidos: `SarakChart`, `SarakChartProps` (§5 Q7).

Sem mudança: `SarakValueFormat`, `SarakResponsiveValue`.

---

# 4. CSS e tokens novos

- `--sarak-card-padding-sm` e `--sarak-card-padding-lg`, **públicos**, derivados de `--sarak-card-padding-md` (seguem o tema
  sozinhos; não são tokens novos do painel) e sobrescrevíveis em CSS pelo importador (demanda 14). Leitor: `SarakCard density`.
- **Cadeia de altura do cromo (demanda 12):** o `SarakAppChrome` **já** ocupa `100dvh` sozinho na rc.3
  (`src/components/Layout/SarakAppChrome.tsx:197`, com a rolagem nos painéis internos). A rc.4 mede, em navegador, o sintoma da
  demanda (conteúdo rolando a janela sob a topbar sem `height: 100%` em `html/body/#root`) e corrige se ele se reproduzir; o guia
  passa a dizer que a cadeia não é necessária. O `<main>` **continua em bloco**, como na rc.3 (em coluna flexível, filho com `margin: 0 auto` encolhe ao conteúdo — medido); o filho que deve
  encher a altura usa `fillHeight` ou a classe pública `sarak-fill-height` (`min-height: 100%` do `<main>`).
- Nenhuma cor nova: tons de referência, faixa, excesso do progresso e seta de delta saem dos tokens de status
  que já existem.

---

# 5. Mudanças que quebram ou mudam comportamento (vão para `docs/migracoes.md`, seção `8.0.0`)

| # | Mudança | Por quê | Migração |
|---|---|---|---|
| Q1 | **`SarakSelect.label` passa a obrigatório** (tipo) | demanda 15: 49 usos no ERP sem rótulo visível | passar `label`; em filtro de barra, `label` + `hideLabel` |
| Q2 | `SarakDataTable` com `error` **e** linhas: mantém as linhas e mostra o aviso acima (rc.3 trocava tudo pelo aviso). Com `loading` e linhas: mantém as linhas com `aria-busy` | Tabela 7 | nenhuma; quem dependia do sumiço passa `rows={[]}` |
| Q3 | **Um idioma só na tela:** formatação sem `locale` explícito segue o idioma escolhido (§1.8), não mais o do navegador; o `SarakDatePicker` sem `locale` passa do inglês para esse idioma | Feedback 2 | quem quer outro locale num componente passa `locale` nele |
| Q4 | `SarakFilterSelect`: o `(All)` fixo em inglês passa a sair do catálogo de textos, no idioma escolhido (`All` em inglês, `Todos` em português…) | Feedback 3 | nenhuma, salvo teste que procure `(All)` |
| Q5 | Preset `cnpj` aceita letras nas 12 primeiras posições, em maiúscula, e o teclado padrão no celular passa de numérico para texto | CNPJ alfanumérico (Receita, 2026) | `inputMode="numeric"` para manter o teclado antigo onde só há CNPJ numérico |
| Q6 | `SarakConfirmOptions.message` e `SarakAlertProps.message` viram `ReactNode` | Feedback 1 | só quebra quem **lê** `.message` como `string` |
| Q7 | **`SarakChart` removido** (errava com valor negativo; nenhum uso no ERP) | Gráficos 7 | `SarakChartEngine` com `type="line"` ou `"bar"`, `data`, `config.xAxisKey`/`dataKey` (o de/para vai na nota) |

| Q8 | **Os 19 temas embarcados mudam de cor**: passam a usar paleta, com a hierarquia de título, subtítulo e texto refeita pela regra comum (aprovada pelo dono na prévia da `plan-134`) | pedido do dono sobre a rc.3 | quem salvou tema mantém as cores salvas; quem usa tema embarcado vê as cores novas |

Q1 e Q7 são as quebras de tipo. Como a 8.0.0 ainda não saiu, ficam dentro dela e não forçam 9.0.0.

---

# 6. O que não vou fazer, ou vou fazer de outro jeito

| Pedido | Decisão | Motivo |
|---|---|---|
| Tabela 8 — XLSX | **Fora.** CSV com BOM e `;` (abre no Excel pt-BR) via `sarakTableToCsv` | XLSX exige dependência pesada (SheetJS, centenas de KB) ou um gerador próprio de OOXML |
| Tabela 4 — colunas na `SarakTreeView` | **Outro jeito:** tree-table é `SarakDataTable` + `getChildren` | a TreeView é árvore de navegação; pôr colunas nela duplicaria a tabela (ordenação, formato, rodapé, virtualização) |
| Formulário 2 — `SarakForm` tipado | **Outro jeito:** JSDoc e catálogo declaram que ele **não é para CRUD**; CRUD = `SarakFormSection` + inputs | um `SarakForm` tipado é um motor de formulário inteiro; a composição cobre o caso sem novo motor |
| Tabela 6 — busca/ordem "pelo valor exibido" | padrão de **busca** = texto exibido; padrão de **ordem** = valor bruto | ordenar por texto formatado põe "R$ 1.000" antes de "R$ 200" |
| Layout 3 — `tabpanel` com `href` | aba com `href` vira link de navegação (`aria-current`), não `role="tab"` | ARIA: aba que troca de rota é navegação |

---

# 7. Rastreio — item do pedido → linha do contrato → plan

| Item | Atendido em | Plan |
|---|---|---|
| Tabela 1 — totais/agregação | §2.1 `aggregate`, `footer` · §1.7 | 129 |
| Tabela 2 — formato por coluna | §2.1 `format` | 129 |
| Tabela 3 — expansíveis, agrupamento, subtotal | §2.2 `renderExpanded`, `expandedKeys`, `groupBy` | 129 |
| Tabela 4 — tree-table | §2.3 `getChildren`, `defaultExpandedDepth` · §6 | 129 |
| Tabela 5 — `th scope="row"`, `colSpan` | §2.1 `rowHeader`, `colSpan` (demanda 16) | 129 |
| Tabela 6 — `sortValue`, busca controlada, não ordenável, reordenação | §2.1 `sortValue`, `searchValue`, `sortable` · §2.2 `searchQuery` · §2.3 `reorderable` | 129 |
| Tabela 7 — skeleton, erro sem apagar | §2.3 `skeletonRows` · §5 Q2 | 129 |
| Tabela 8 — CSV/XLSX | §1.4 · §2.2 `exportable` · §6 | 129 |
| Gráficos 1 — `valueFormat` | §2.4 `valueFormat`, `series[].format` | 130 |
| Gráficos 2 — altura | §2.4 `height` | 130 |
| Gráficos 3 — referência, faixa, zoom | §2.4 `referenceLines`, `referenceBands`, `zoom` | 130 |
| Gráficos 4 — pizza %, gauge | §2.4 `pieLabel`, `gauge` | 130 |
| Gráficos 5 — Stats | §2.5 | 130 |
| Gráficos 6 — Sparkline, Progress | §2.6 | 130 |
| Gráficos 7 — `SarakChart` negativo | §5 Q7 | 130 |
| Layout 1 — span | §0 (formato existente) · §1.1 `SarakGridItem` | 131 |
| Layout 2 — colunas declarativas, AnalyticalPage | §2.7 `SarakGrid.columns`, `sidePanelWidth` · §1.2 `columns` | 131 |
| Layout 3 — Tabs | §2.7 `href`, `onNavigate`, `count`, `panelId` · §1.3 | 131 |
| Layout 4 — densidade, altura | §2.7 `density`, `fillHeight` · §4 | 131 |
| Formulário 1 — seção, prefixo/sufixo | §1.2 · §2.8 `prefixText`/`suffixText` | 132 |
| Formulário 2 — `SarakForm` | §2.8 · §6 | 132 |
| Formulário 3 — Select com rótulo | §5 Q1 · §2.8 `hideLabel` | 132 |
| Formulário 4 — DatePicker | §2.8 · §1.6 | 132 |
| Formulário 5 — CPF/CNPJ/CEP | §1.5 · §2.8 `validate`, `cep` · §5 Q5 | 132 |
| Formulário 6 — Autocomplete | §2.8 `selection`, `description`, `onCreate` | 132 |
| Feedback 1 — conteúdo rico | §2.9 · §5 Q6 | 128 |
| Feedback 2 — locale único | §1.8 · §5 Q3 | 128 |
| Feedback 3 — FilterSelect | §2.9 · §5 Q4 | 128 |
| Feedback 4 — Kanban valor | §2.9 `value`, `valueFormat`, `columnTotal` | 130 |
| Feedback 5 — "todos os N" | §2.2 `totalCount`, `selectAll` | 129 |
| Dono — paletas (motor) | §1.9 | 133 |
| Dono — paletas (catálogo e temas) | §1.9 · §5 Q8 | 134 |
| Dono — paletas (painel e kit) | §1.9 | 135 |
| Kit 1–6 | sem mudança de API: moldes `sarak-ui/templates/`, selo único no `SarakResourceRow`, um só `h1` (o do cabeçalho da página; o cromo não emite heading) | 119 (lote 8) |

---

# 8. Revisões deste contrato

| Data | Mudança |
|---|---|
| 2026-10-27 | Proposta inicial (lote 1) |
| 2026-10-27 | Aceite do dono: valor por dispositivo informado como existente (§0); idioma redesenhado com `options.i18n` e `useSarakLanguage` no lugar de `useSarakLocale` (§1.8); Q4 reescrita (catálogo, não troca para português); `SarakChart` removido (Q7); coluna de plan no rastreio; protocolo da §9; §4 corrigido — o cromo já tinha `100dvh` na rc.3 |
| 2026-10-28 | §1.9: o separador de `custom:` passa de `;` a `,` (a barreira de CSS recusa `;`) |
| 2026-10-28 | §9: o revisor mede o `audit:baseline` a cada rodada (a 130 foi aprovada com dois arquivos acima de 250 linhas, atribuídos a outra plan no resumo) |
| 2026-10-28 | §1.3: `SarakTabPanel.idPrefix` obrigatório e `aria-controls` só com `idPrefix`/`panelId`; §4: o `<main>` fica em bloco (o flexível encolhia conteúdo centralizado de 1000 para 33 px) |
| 2026-10-28 | §1.4: `locale` em `sarakTableToCsv` (função pura não lê o hook); a árvore agrega só as raízes no rodapé; §9: `token-types` entra nos geradores do commit |
| 2026-10-27 | Paletas de cor entram na rc.4 a pedido do dono: §1.9, Q8, plans 133–135 no rastreio |

---

# 9. Protocolo de execução e verificação da rc.4 *(decisão do dono, 2026-10-27)*

Objetivo: **cada verificação roda uma vez por plan, e a bateria completa roda uma vez na campanha.** Vale para as plans 128 a
135 e o lote 8 da 119; substitui, só nelas, o `npm run verify` por plan de [[00-prompt-revisor]].

| Quem | Quando | O que roda | O que **não** roda |
|---|---|---|---|
| Executor | durante | os testes dos arquivos que escreveu | — |
| Executor | antes de entregar | `npm run verify -- --tier=quick` uma vez, e cola o resumo | suíte completa, build, navegador |
| Revisor | veredito | `npx vitest run <pastas da §7 da plan>` uma vez + leitura do diff contra este contrato (nomes, tipos, padrões) + **`node gates/scripts/release/check-audit-baseline.mjs` uma vez por rodada de vereditos** (no worktree compartilhado, a atribuição de falha do executor não é confiável, e o Anel 2 do commit bloqueia regressão) | `verify` de novo (o `quick` do executor é aceito pelo relato colado); suíte completa; build |
| Revisor | fechamento (depois do lote 2) | `npm run verify -- --tier=full` + `npm run cromo-css-real:check` (inclui o build) — **uma vez para todas** | — |

Regras que mantêm isso seguro:

- **Execução em paralelo no mesmo worktree.** No `quick`, erro de `tsc`/auditoria em arquivo **fora** da §3.1 da plan é de outra
  plan: relate, não conserte. `catalog:check`, `guide:check` e `dev-kit:check` falham por desenho (catálogo e kits são gerados no
  fechamento): não são do executor.
- **A correção verifica só o que corrigiu.** No prompt de correção, o revisor nomeia o filtro de testes do achado; a bateria da §7
  não roda de novo.
- **Arquivos gerados não se tocam nas plans** (`dist/`, `sarak-dev/`, `docs/component-catalog.*` e o que `npm run guide` copia
  para `sarak-ui/`, como `catalog.json`, `skill/` e `docs/`). O gancho de commit cobra `catalog:check`, `guide:check` e
  `dev-kit:check`; por isso, **antes de cada commit**, o dono roda `npm run catalog; npm run guide; npm run dev-kit; npm run token-types` (segundos, sem
  build). O `dist/` só no fechamento. Com plans paralelas em voo, o commit sai **por rodada** — todas as aprovadas juntas, sem plan
  pela metade no worktree —, para o gerado não levar superfície de código que não está no commit. Os de **autoria** do kit
  (`sarak-ui/GUIA-FRONTEND.md`, `sarak-ui/templates/`) são da `plan-119`, lote 8.
- **Arquivos compartilhados só por acréscimo:** `src/index.ts`, `docs/migracoes.md` (cada plan na sua subseção dentro de `## 8.0.0`)
  e `src/core/i18n/catalog.ts`. Cada plan escreve os textos novos no **seu** arquivo de catálogo, criado vazio pela 128.
  Se a ferramenta acusar arquivo alterado por outro agente, releia e reaplique.
- **Arquivo novo de código ganha o teste dele** (o `coverage:check` do fechamento exige 1:1); item que mexe em papel, rótulo ou
  teclado tem teste por papel e nome acessível.
- **O resumo traz a tabela item → teste** (nome do teste e arquivo). Ela vira, sem retrabalho, a tabela final entregue ao ERP.
- Falha no fechamento volta como correção à plan dona do arquivo.
