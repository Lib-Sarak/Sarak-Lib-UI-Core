---
tipo: "anexo"
titulo: "Contrato da 8.0.0-rc.5 — superfície pública prometida ao ERP"
dominio: "Superfície pública"
status: "🟢 Aceito pelo dono (2026-11-02)"
tags: ["rc.5", "contrato", "erp", "superficie-publica"]
relacionados: ["[[00-indice]]", "[[arquitetura/03-superficie-publica]]"]
---

# 0. Como ler

- **Base:** `v8.0.0-rc.4`, mais o que estiver na `develop` quando a rc.5 for emitida.
- **Origem:** pedido do ERP em `.sarak/outgoing/prompt-lib-rc5.md` (13 itens). Cada "conferido" abaixo foi lido no `src/` em 2026-11-02.
- **Regra:** prop nova com padrão que preserva o comportamento, salvo os itens 1, 2 e 12. Depois do aceite, nenhum nome muda sem aviso ao ERP.
- **Tudo é MINOR dentro da 8.0.0:** nenhum nome público sai. As três mudanças de comportamento vão em `docs/migracoes.md`.

# 1. Contrato

| Item | Componente | Superfície | Padrão | Comportamento muda? | Plan |
|---|---|---|---|---|---|
| 1 | `SarakGrid`, `SarakFlex` | `rowGap?: SarakLayoutGap`, `columnGap?: SarakLayoutGap`, que vencem `gap` no eixo deles | sem eles, `gap` nos dois eixos | **Sim, defeito:** a grade ganha o espaço entre colunas | 146 |
| 2 | `SarakChartEngine` | `pattern?: boolean` | `false` | **Sim:** o hachurado sai do padrão | 147 |
| 3 | `SarakChartEngine` | `getPointColor?: (datum: SarakChartDataItem, index: number) => SarakChartColorToken \| undefined`, em `bar` de uma série, `pie`, `funnel` e `treemap` | paleta | não | 147 |
| 4 | `SarakChartEngine` | sem prop: rótulo interno escolhido pelo contraste, ≥ 4,5:1 | — | melhoria | 147 |
| 5 | `SarakChartEngine` | `showValues?: boolean \| 'auto'`; `config.thickness` passa a valer em barra | `false` | não | 147 |
| 6 | `SarakChartEngine` | `funnel?: { min?: number; max?: number }` | escala pelo maior valor | o funil deixa de usar 0 a 1000 fixos; o número da dica passa a ser o real | 147 |
| 7 | `SarakChartEngine` | `axis?: { maxTicks?: number; compact?: boolean }` | marcas reduzidas sozinhas, sem sobrepor | melhoria | 147 |
| 8 | `SarakResourceRow` | `layout?: 'stacked' \| 'inline'`, `density?: 'compact' \| 'standard'` | `'stacked'`, `'standard'` | título corta com reticências; ação não passa da borda | 148 |
| 9 | `SarakStats` | `href?: string` na métrica; uma métrica preenche a célula | sem `href` | melhoria | 148 |
| 10 | `SarakInput`, `SarakCurrencyInput`, `SarakMaskedInput` | `affixPlacement?: 'outside' \| 'inside'` | `'outside'` | não | 148 |
| 11 | `SarakTabs` | `overflow?: 'scroll' \| 'wrap' \| 'menu'` | `'scroll'`, com rolagem própria e sinal de que há mais | a faixa deixa de transbordar | 148 |
| 12 | `SarakOverlayProvider`, `SarakDrawer`, `SarakModal` | pilha de camadas, sem prop | a confirmação fica acima da camada aberta | **Sim, defeito** | 146 |
| 13 | `SarakSegmentedControl` | sem prop | — | a conferir nos temas escuros | 146 |

## 1.1 Acréscimo da biblioteca (não pedido pelo ERP)

| Componente | Superfície | Padrão | Comportamento muda? | Plan |
|---|---|---|---|---|
| `SarakShellNavItem` | `children?: SarakShellNavItem[]`, `defaultExpanded?: boolean` | sem filhos | não | 149 |
| Tokens | `sidebarLogoPlacement: 'top' 
| Tokens | `sidebarResizable: boolean` | `false` | não | 149 |
| `SarakShellSearchWidget` | sai o texto Ctrl+K; o atalho continua | — | **Sim:** texto some | 149 |\| 'bottom'` | `'top'` | não | 149 |
| Tokens | `sidebarTone`, `topbarTone`: `'neutral' \| 'surface' \| 'primary' \| 'secondary' \| 'inverse'` | `'neutral'` | não | 149 |

## 1.2 Lacunas de sistema (análise do dono, 11 sistemas ativos)

| Plan | Superfície nova |
|---|---|
| 151 | `SarakErrorBoundary`, `useSarakUnsavedChanges`, `SarakPagination.getPageHref`, `sarakErrorMessage`, `renderWithSarak` |
| 152 | `bulkActions` (`onAction(ids, scope)`), `editable` e `onCellEdit`, `views`, `columnState`, `density="report"`, `getCellTone`, `SarakDocumentFrame`, `sarakPrint` |
| 153 | `SarakSettingsPage`, `SarakAuditLog`, `SarakDiffView`, `SarakVersionList`, `SarakApprovalQueue`, `SarakRunProgress`, `SarakLiveStatus`, `SarakUsageMeter`, `SarakPermissionMatrix`, `SarakMemberList`, `SarakSessionList` |
| 154 | `SarakColorInput`, `SarakSetPicker`, `SarakTagInput`, `SarakCodeInput`, `SarakFieldRenderer`, `SarakWizard`, `SarakPopover`, `SarakCopyButton`, `SarakQRCode`, `SarakFileAction`, `useSarakShortcut`, `SarakGate`, `extendOption` |
| 155 | `SarakDashboardGrid`, `SarakMap`, `SarakSignaturePad`, `SarakTour`, `SarakCarousel`, `exportXlsx` |

# 2. Conferido no código

| Item | Resultado |
|---|---|
| 1 | Confirmado: `useStructuralStyles.ts:47` envia `columnGap: undefined` depois de `gap` |
| 2 | Confirmado: `useEChartsTheme.ts:132`, `decal: { show: true }` fixo |
| 6 | Confirmado: `advancedCharts.ts:149-150`, `min: 0` e `max: HEATMAP_MAXIMUM` |
| 12 | Coerente: `SarakDrawer.tsx:110` soma 1 à camada de modal, e a confirmação usa `--z-index-modal`. A sobreposição se mede no navegador |
| 13 | `aria-checked` já existe (`SarakSegmentedControl.tsx:91`); falta medir o contraste |

# 3. O que muda em relação ao pedido

- **Item 1:** a causa é a chave `undefined`, então a revisão cobre todo estilo com propriedade curta e longa juntas.
- **Item 2:** `pattern` desligado por padrão tira uma ajuda a quem não distingue cor. Decisão do ERP, aceita; o texto da `docs/migracoes.md` orienta a ligar quando a cor for o único sinal.
- **Item 13:** sem prop nem contrato novo, se a medição não confirmar o defeito.

# 4. Quebras e migração

Vão na `## 8.0.0` de `docs/migracoes.md`: itens 1, 2, 6 e 12.

# 5. Registro de revisões

| Data | Mudança |
|---|---|
| 2026-11-02 | Proposta inicial |
| 2026-11-02 | O dono decidiu: todas as plans abertas entram na rc.5, inclusive 141, 145, 149 e 150 |
