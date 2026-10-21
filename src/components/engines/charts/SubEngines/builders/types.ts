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
