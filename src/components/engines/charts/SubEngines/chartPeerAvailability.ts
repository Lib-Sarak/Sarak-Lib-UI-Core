import * as ReactEChartsModule from 'echarts-for-react';
import * as EChartsCore from 'echarts/core';
import * as EChartsComponents from 'echarts/components';
import * as Recharts from 'recharts';

export const ReactECharts = ReactEChartsModule.default;

const ECHARTS_USE_EXTENSION = (EChartsCore as unknown as { use?: unknown }).use;
const ECHARTS_COMPONENT_EXPORTS = EChartsComponents as unknown as Record<string, unknown>;

export const hasEChartsPeers = (): boolean => Boolean(
    ReactECharts
    && typeof ECHARTS_USE_EXTENSION === 'function'
    && ECHARTS_COMPONENT_EXPORTS.AriaComponent
    && ECHARTS_COMPONENT_EXPORTS.LegendComponent,
);

export const hasRechartsPeer = (): boolean => Boolean(
    Recharts.ResponsiveContainer && Recharts.BarChart && Recharts.LineChart,
);

if (hasEChartsPeers()) {
    EChartsCore.use([EChartsComponents.AriaComponent, EChartsComponents.LegendComponent]);
}
