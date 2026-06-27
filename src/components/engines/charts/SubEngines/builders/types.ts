import type { useEChartsTheme } from '../useEChartsTheme';

/**
 * Contratos compartilhados pelos builders de chart (Spec 62).
 * Reaproveitam a fonte única: o tema vem do `useEChartsTheme`.
 */

/** Tema de chart já resolvido (cores/flags), produzido por `useEChartsTheme`. */
export type ChartTheme = ReturnType<typeof useEChartsTheme>;

/** Item de dado de série: dataset externo, lido por chave dinâmica. */
export type ChartDataItem = Record<string, unknown>;

/** Subset da config de chart lido pelos builders (chaves de leitura de série). */
export interface ChartBuilderConfig {
    xAxisKey?: string;
    dataKey?: string;
}

/** Fragmento de opção ECharts produzido por um builder (mesclado depois). */
export type ChartOptionFragment = Record<string, unknown>;
