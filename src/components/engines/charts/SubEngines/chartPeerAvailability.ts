import * as ReactEChartsModule from 'echarts-for-react';
import * as EChartsCore from 'echarts/core';
import * as EChartsComponents from 'echarts/components';
import * as Recharts from 'recharts';

export const ReactECharts = ReactEChartsModule.default;

const ECHARTS_USE_EXTENSION: unknown = EChartsCore.use;
const ECHARTS_ARIA_COMPONENT: unknown = EChartsComponents.AriaComponent;
const ECHARTS_LEGEND_COMPONENT: unknown = EChartsComponents.LegendComponent;
const RECHARTS_RESPONSIVE_CONTAINER: unknown = Recharts.ResponsiveContainer;
const RECHARTS_BAR_CHART: unknown = Recharts.BarChart;
const RECHARTS_LINE_CHART: unknown = Recharts.LineChart;

export const hasEChartsPeers = (): boolean => Boolean(
    ReactECharts
    && typeof ECHARTS_USE_EXTENSION === 'function'
    && ECHARTS_ARIA_COMPONENT
    && ECHARTS_LEGEND_COMPONENT,
);

export const hasRechartsPeer = (): boolean => Boolean(
    RECHARTS_RESPONSIVE_CONTAINER && RECHARTS_BAR_CHART && RECHARTS_LINE_CHART,
);

if (hasEChartsPeers()) {
    (ECHARTS_USE_EXTENSION as (components: unknown[]) => void)([ECHARTS_ARIA_COMPONENT, ECHARTS_LEGEND_COMPONENT]);
}
