import type { EChartsTheme } from '../useEChartsTheme';

/**
 * Contratos compartilhados pelos builders de chart (Spec 62).
 * Reaproveitam a fonte única: o tema vem do `useEChartsTheme`.
 */

/** Tema de chart já resolvido (cores/flags), produzido por `useEChartsTheme`. */
export type ChartTheme = EChartsTheme;

/** Cor que um token de série resolve neste tema: marca pela paleta derivada, estado pela cor de estado. */
export function resolveChartColorToken(theme: ChartTheme, token: ChartColorToken): string {
    const brandIndex = (CHART_BRAND_TOKENS as readonly string[]).indexOf(token);
    if (brandIndex >= 0) return theme.palette[brandIndex] ?? theme.primaryColor;
    return theme.statusColors[token as ChartStatusToken] ?? theme.primaryColor;
}

/** Item de dado de série: dataset externo, lido por chave dinâmica. */
export type SarakChartDataItem = Record<string, unknown>;

export type SarakChartType =
    | 'line' | 'area' | 'bar' | 'pie' | 'radar' | 'gauge' | 'scatter'
    | 'heatmap' | 'funnel' | 'treemap' | 'candlestick' | 'sunburst'
    | 'histogram' | 'boxplot' | 'waterfall' | 'sankey' | 'calendar';

/**
 * Cores de marca que alimentam a paleta categórica, na ordem em que as quatro primeiras
 * séries as recebem. As quatro seguintes são variações derivadas delas (`categoricalPalette`).
 */
export const CHART_BRAND_TOKENS = ['chartColorPalette', 'secondaryColor', 'accentColor', 'tertiaryColor'] as const;

/**
 * Cores de estado. Ficam FORA da paleta automática — uma série que não pediu "sucesso"
 * não pinta de verde —, e só chegam a uma série por escolha explícita (`series[].color`)
 * ou por semântica do próprio gráfico (alta/baixa, aumento/redução).
 */
export const CHART_STATUS_TOKENS = ['statusSuccessColor', 'statusWarningColor', 'statusErrorColor', 'statusInfoColor'] as const;

export const CHART_COLOR_TOKENS = [...CHART_BRAND_TOKENS, ...CHART_STATUS_TOKENS] as const;

export type ChartColorToken = typeof CHART_COLOR_TOKENS[number];
export type ChartBrandToken = typeof CHART_BRAND_TOKENS[number];
export type ChartStatusToken = typeof CHART_STATUS_TOKENS[number];

/** Subset da config de chart lido pelos builders (chaves de leitura de série). */
export interface ChartBuilderConfig {
    xAxisKey?: string;
    dataKey?: string;
    thickness?: number;
    showGradients?: boolean;
    seriesColor?: string;
}

/** Fragmento de opção ECharts produzido por um builder (mesclado depois). */
export type ChartOptionFragment = Record<string, unknown>;

/** Tom de uma linha ou faixa de referência; só `neutral` fica fora dos tokens de status. */
export type SarakChartReferenceTone = 'neutral' | 'success' | 'warning' | 'error';

/** Linha horizontal (vertical, na orientação horizontal) traçada sobre um valor do eixo de valor. */
export interface SarakChartReferenceLine {
    value: number;
    label?: string;
    /** Eixo de valor ao qual `value` pertence; precisa de uma série em `axis: 'right'` para existir. */
    axis?: 'left' | 'right';
    tone?: SarakChartReferenceTone;
    dashed?: boolean;
}

/** Faixa do eixo de valor entre `from` e `to`, sombreada no tom pedido. */
export interface SarakChartReferenceBand {
    from: number;
    to: number;
    label?: string;
    tone?: SarakChartReferenceTone;
}

export type SarakChartZoom = boolean | 'inside' | 'slider';

export type SarakChartPieLabel = 'name' | 'value' | 'percent' | 'name-percent' | 'none';

/** Escala do medidor; omitidos, vale 0 a 100. */
export interface SarakChartGauge {
    min?: number;
    max?: number;
}
