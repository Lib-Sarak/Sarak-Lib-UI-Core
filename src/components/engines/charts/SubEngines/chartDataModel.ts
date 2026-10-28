import { hasCalendarData, hasSankeyData, hasWaterfallData } from './optionBuilders';
import type { SarakChartDataItem, SarakChartType } from './builders/types';

const CHART_TYPES: readonly SarakChartType[] = [
    'line', 'area', 'bar', 'pie', 'radar', 'gauge', 'scatter', 'heatmap',
    'funnel', 'treemap', 'candlestick', 'sunburst', 'histogram', 'boxplot',
];
function isRecord(value: unknown): value is SarakChartDataItem {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
    return typeof value === 'number' && Number.isFinite(value);
}

function hasCandlestickValues(item: SarakChartDataItem): boolean {
    return [item.open, item.close, item.low, item.high].every(isFiniteNumber);
}

function hasBoxPlotValues(item: SarakChartDataItem, dataKey: string): boolean {
    const values = item[dataKey] ?? item.boxplot;
    if (Array.isArray(values)) return values.length === 5 && values.every(isFiniteNumber);
    return [item.min, item.q1, item.median, item.q3, item.max].every(isFiniteNumber);
}

export function hasRenderableData(data: unknown, type: SarakChartType, dataKey: string): data is SarakChartDataItem[] {
    if (!Array.isArray(data) || data.length === 0) return false;
    if (type === 'candlestick') return data.some((item) => isRecord(item) && hasCandlestickValues(item));
    if (type === 'boxplot') return data.some((item) => isRecord(item) && hasBoxPlotValues(item, dataKey));
    if (type === 'waterfall') return hasWaterfallData(data, dataKey);
    if (type === 'sankey') return hasSankeyData(data, dataKey);
    if (type === 'calendar') return hasCalendarData(data, dataKey);
    if (type === 'sunburst') {
        return data.some((item) => isRecord(item) && (item[dataKey] !== undefined || Array.isArray(item.children)));
    }

    return data.some((item) => isRecord(item) && item[dataKey] !== undefined && item[dataKey] !== null);
}

export function resolveChartType(type: SarakChartType | undefined, designType: string): SarakChartType {
    if (type) return type;
    return CHART_TYPES.includes(designType as SarakChartType) ? designType as SarakChartType : 'line';
}

