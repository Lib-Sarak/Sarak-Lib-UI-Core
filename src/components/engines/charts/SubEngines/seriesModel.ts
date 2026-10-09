import * as builders from './optionBuilders';
import { buildAxisOptions, buildTitleOption, buildTooltipOption } from './axisOptions';
import type {
    ChartBuilderConfig, ChartOptionFragment, ChartTheme, SarakChartDataItem, SarakChartType,
} from './builders/types';

const SERIES_CHART_TYPES = ['bar', 'line', 'area'] as const;
const DEFAULT_STACK_NAME = 'chart-stack';
const CHART_COLOR_TOKENS = [
    'chartColorPalette', 'secondaryColor', 'accentColor', 'statusSuccessColor',
    'statusWarningColor', 'statusErrorColor', 'statusInfoColor', 'tertiaryColor',
] as const;
const COLOR_TOKEN_NOT_FOUND = -1;
const DEFAULT_SERIES_INDEX = 0;

type SeriesChartType = typeof SERIES_CHART_TYPES[number];
type SeriesColorToken = typeof CHART_COLOR_TOKENS[number];
type SeriesAxis = 'left' | 'right';
type ChartOrientation = 'vertical' | 'horizontal';
type LegendSetting = boolean | 'top' | 'bottom';

export interface ChartSeriesDefinition {
    key: string;
    label?: string;
    type?: SeriesChartType;
    stack?: string;
    axis?: SeriesAxis;
    dashed?: boolean;
    color?: SeriesColorToken;
}

interface ChartSeriesOptions {
    series?: ChartSeriesDefinition[];
    stacked?: boolean;
    orientation?: ChartOrientation;
    legend?: LegendSetting;
}

interface ChartOptionConfig extends ChartBuilderConfig {
    title?: string;
    showAnimation?: boolean;
}

interface ChartOptionInput extends ChartSeriesOptions {
    type: SarakChartType;
    data: SarakChartDataItem[];
    config?: ChartOptionConfig;
    theme: ChartTheme;
}

interface PointClickInput {
    data: SarakChartDataItem[];
    series?: ChartSeriesDefinition[];
    dataKey: string;
    onPointClick?: (event: { seriesKey: string; index: number; datum: SarakChartDataItem }) => void;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
    return typeof value === 'number' && Number.isFinite(value);
}

function isValidSeriesDefinition(series: ChartSeriesDefinition): boolean {
    return typeof series.key === 'string' && series.key.trim().length > 0;
}

function getValidSeriesDefinitions(series: readonly ChartSeriesDefinition[] | undefined): ChartSeriesDefinition[] {
    return Array.isArray(series) ? series.filter(isValidSeriesDefinition) : [];
}

export function isSeriesChartType(type: SarakChartType): type is SeriesChartType {
    return SERIES_CHART_TYPES.includes(type as SeriesChartType);
}

export function hasRenderableSeriesData(data: unknown, series: readonly ChartSeriesDefinition[]): boolean {
    if (!Array.isArray(data) || !Array.isArray(series) || series.length === 0) return false;
    const keys = getValidSeriesDefinitions(series).map((item) => item.key);
    if (keys.length === 0) return false;
    return data.some((item) => isRecord(item) && keys.some((key) => isFiniteNumber(item[key])));
}

function resolveSeriesColor(color: SeriesColorToken | undefined, index: number, theme: ChartTheme): string {
    if (theme.palette.length === 0) return theme.primaryColor;
    const tokenIndex = color ? CHART_COLOR_TOKENS.indexOf(color as SeriesColorToken) : COLOR_TOKEN_NOT_FOUND;
    const paletteIndex = tokenIndex === COLOR_TOKEN_NOT_FOUND ? index : tokenIndex;
    return theme.palette[paletteIndex % theme.palette.length] ?? theme.primaryColor;
}

function buildTypeOption(
    type: SarakChartType,
    data: SarakChartDataItem[],
    config: ChartBuilderConfig,
    theme: ChartTheme,
): ChartOptionFragment {
    switch (type) {
        case 'bar': return builders.buildBarSeries(data, config, theme);
        case 'line': return builders.buildLineSeries(data, config, theme, false);
        case 'area': return builders.buildLineSeries(data, config, theme, true);
        case 'pie': return builders.buildPieSeries(data, config, theme);
        case 'radar': return builders.buildRadarConfig(data, config, theme);
        case 'gauge': return builders.buildGaugeSeries(data, config, theme);
        case 'scatter': return builders.buildScatterSeries(data, config, theme);
        case 'heatmap': return builders.buildHeatmapSeries(data, config, theme);
        case 'funnel': return builders.buildFunnelSeries(data, config, theme);
        case 'treemap': return builders.buildTreeMapSeries(data, config, theme);
        case 'candlestick': return builders.buildCandlestickSeries(data, config, theme);
        case 'sunburst': return builders.buildSunburstSeries(data, config, theme);
        case 'histogram': return builders.buildHistogramSeries(data, config, theme);
        case 'boxplot': return builders.buildBoxPlotSeries(data, config, theme);
    }
}

function buildConfiguredSeries(
    definitions: readonly ChartSeriesDefinition[],
    input: ChartOptionInput,
    config: ChartBuilderConfig,
): Array<Record<string, unknown>> {
    const chartType = input.type as SeriesChartType;
    return definitions.map((definition, index) => {
        const seriesType = definition.type && SERIES_CHART_TYPES.includes(definition.type)
            ? definition.type
            : chartType;
        const seriesConfig = {
            ...config,
            dataKey: definition.key,
            seriesColor: resolveSeriesColor(definition.color, index, input.theme),
        };
        const option = seriesType === 'bar'
            ? builders.buildBarSeries(input.data, seriesConfig, input.theme)
            : builders.buildLineSeries(input.data, seriesConfig, input.theme, seriesType === 'area');
        const baseSeries = (option.series as Array<Record<string, unknown>>)[0];
        return decorateSeries(baseSeries, definition, input.stacked ?? false, input.orientation ?? 'vertical');
    });
}

function decorateSeries(
    series: Record<string, unknown>,
    definition: ChartSeriesDefinition,
    stacked: boolean,
    orientation: ChartOrientation,
): Record<string, unknown> {
    const lineStyle = isRecord(series.lineStyle) ? series.lineStyle : {};
    const stack = typeof definition.stack === 'string' && definition.stack.trim()
        ? definition.stack
        : stacked ? DEFAULT_STACK_NAME : undefined;
    const axisIndex = definition.axis === 'right' ? 1 : undefined;
    return {
        ...series,
        id: definition.key,
        name: definition.label ?? definition.key,
        ...(stack ? { stack } : {}),
        ...(definition.dashed && series.type !== 'bar' ? { lineStyle: { ...lineStyle, type: 'dashed' } } : {}),
        ...(axisIndex !== undefined ? { [orientation === 'horizontal' ? 'xAxisIndex' : 'yAxisIndex']: axisIndex } : {}),
    };
}

function addDefaultStack(option: ChartOptionFragment, stacked: boolean): ChartOptionFragment {
    if (!stacked || !Array.isArray(option.series)) return option;
    return {
        ...option,
        series: option.series.map((series) => isRecord(series) ? { ...series, stack: DEFAULT_STACK_NAME } : series),
    };
}

function buildCartesianAxes(input: ChartOptionInput, categories: unknown[]): ChartOptionFragment {
    const baseAxes = buildAxisOptions(input.type, categories, input.theme);
    if (!isSeriesChartType(input.type)) return baseAxes;
    const horizontal = input.orientation === 'horizontal';
    const categoryAxis = isRecord(baseAxes.xAxis) ? baseAxes.xAxis : {};
    const valueAxis = isRecord(baseAxes.yAxis) ? baseAxes.yAxis : {};
    const xAxis: Record<string, unknown> = horizontal ? valueAxis : categoryAxis;
    const yAxis: Record<string, unknown> = horizontal ? categoryAxis : valueAxis;
    if (horizontal) yAxis.data = categories;
    else xAxis.data = categories;

    const axes: ChartOptionFragment = { xAxis, yAxis };
    if (!input.series?.some((series) => series.axis === 'right')) return axes;
    const valueAxisName = horizontal ? 'xAxis' : 'yAxis';
    const firstValueAxis = horizontal ? xAxis : yAxis;
    const splitLine = isRecord(firstValueAxis.splitLine) ? firstValueAxis.splitLine : {};
    const secondValueAxis = {
        ...firstValueAxis,
        position: horizontal ? 'top' : 'right',
        splitLine: { ...splitLine, show: false },
    };
    return { ...axes, [valueAxisName]: [firstValueAxis, secondValueAxis] };
}

function buildLegend(setting: LegendSetting | undefined, seriesCount: number, theme: ChartTheme): ChartOptionFragment {
    const resolved = setting ?? (seriesCount > 1 ? 'top' : false);
    if (!resolved) return { legend: { show: false } };
    const position = resolved === 'bottom' ? { bottom: theme.axisLabelMargin } : { top: theme.axisLabelMargin };
    return {
        legend: {
            show: true,
            ...position,
            textStyle: { color: theme.textColor, fontSize: theme.fontSize, fontFamily: theme.bodyFont },
        },
    };
}

export function buildChartOption(input: ChartOptionInput): ChartOptionFragment {
    const config: ChartBuilderConfig = {
        ...input.config,
        thickness: input.config?.thickness ?? input.theme.chartThickness,
        showGradients: input.config?.showGradients ?? true,
    };
    const categoryKey = input.config?.xAxisKey ?? 'name';
    const categories = input.data.map((item) => item[categoryKey]);
    const definitions = getValidSeriesDefinitions(input.series);
    const configuredSeries = isSeriesChartType(input.type) && input.series !== undefined;
    const legacyOption = configuredSeries ? null : buildTypeOption(input.type, input.data, config, input.theme);
    const seriesOption = configuredSeries
        ? { series: buildConfiguredSeries(definitions, input, config) }
        : addDefaultStack(legacyOption ?? {}, isSeriesChartType(input.type) && (input.stacked ?? false));
    const seriesCount = configuredSeries
        ? definitions.length
        : Array.isArray(legacyOption?.series) ? legacyOption.series.length : 0;

    return {
        ...input.theme.baseOption,
        ...buildCartesianAxes(input, categories),
        tooltip: buildTooltipOption(input.type, input.theme),
        ...buildTitleOption(input.config?.title, input.theme),
        ...seriesOption,
        ...buildLegend(input.legend, seriesCount, input.theme),
        animation: input.config?.showAnimation ?? true,
    };
}

function handlePointClick(input: PointClickInput, event: unknown): void {
    if (!isRecord(event) || typeof event.dataIndex !== 'number' || !Number.isInteger(event.dataIndex)) return;
    const datum = input.data[event.dataIndex];
    if (!datum || !input.onPointClick) return;
    const seriesIndex = typeof event.seriesIndex === 'number' && Number.isInteger(event.seriesIndex)
        ? event.seriesIndex
        : DEFAULT_SERIES_INDEX;
    const seriesKey = getValidSeriesDefinitions(input.series)[seriesIndex]?.key ?? input.dataKey;
    input.onPointClick({ seriesKey, index: event.dataIndex, datum });
}

export function buildPointClickEvents(input: PointClickInput): Record<string, (event: unknown) => void> | undefined {
    if (!input.onPointClick) return undefined;
    return { click: (event: unknown) => handlePointClick(input, event) };
}
