import type { EChartsTheme } from '../useEChartsTheme';

/**
 * Contratos compartilhados pelos builders de chart (Spec 62).
 * Reaproveitam a fonte única: o tema vem do `useEChartsTheme`.
 */

/** Tema de chart já resolvido (cores/flags), produzido por `useEChartsTheme`. */
export type ChartTheme = EChartsTheme;

/** Item de dado de série: dataset externo, lido por chave dinâmica. */
export type SarakChartDataItem = Record<string, unknown>;

export type SarakChartType =
    | 'line' | 'area' | 'bar' | 'pie' | 'radar' | 'gauge' | 'scatter'
    | 'heatmap' | 'funnel' | 'treemap' | 'candlestick' | 'sunburst'
    | 'histogram' | 'boxplot' | 'waterfall' | 'sankey' | 'calendar';

/** Tokens de cor do design que formam a paleta categórica, na ordem em que as séries os recebem. */
export const CHART_COLOR_TOKENS = [
    'chartColorPalette', 'secondaryColor', 'accentColor', 'statusSuccessColor',
    'statusWarningColor', 'statusErrorColor', 'statusInfoColor', 'tertiaryColor',
] as const;

export type ChartColorToken = typeof CHART_COLOR_TOKENS[number];

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
