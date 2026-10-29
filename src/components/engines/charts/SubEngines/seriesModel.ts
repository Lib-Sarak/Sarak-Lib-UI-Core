import * as builders from './optionBuilders';
import { buildTitleOption, buildTooltipOption } from './axisOptions';
import { buildCartesianAxes, buildLegend } from './cartesianLayout';
import type { LegendSetting } from './cartesianLayout';
import { applyChartEnhancements } from './chartEnhancements';
import type { ChartEnhancementInput } from './chartEnhancements';
import { resolveChartColorToken } from './builders/types';
import type { SarakValueFormat } from '../../../../shared/format';
import type {
    ChartBuilderConfig, ChartColorToken, ChartOptionFragment, ChartTheme, SarakChartDataItem, SarakChartType,
} from './builders/types';

const SERIES_CHART_TYPES = ['bar', 'line', 'area'] as const;
const DEFAULT_STACK_NAME = 'chart-stack';
const SELF_CONTAINED_TYPES: readonly SarakChartType[] = ['waterfall', 'sankey', 'calendar'];
const DEFAULT_SERIES_INDEX = 0;

type SeriesChartType = typeof SERIES_CHART_TYPES[number];
type SeriesAxis = 'left' | 'right';
type ChartOrientation = 'vertical' | 'horizontal';

export interface ChartSeriesDefinition {
    key: string;
    label?: string;
    type?: SeriesChartType;
    stack?: string;
    axis?: SeriesAxis;
    dashed?: boolean;
    color?: ChartColorToken;
    format?: SarakValueFormat;
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

type ChartExtrasInput = Omit<ChartEnhancementInput, 'type' | 'theme' | 'orientation' | 'seriesFormats' | 'seriesAxes'>;

interface ChartOptionInput extends ChartSeriesOptions, ChartExtrasInput {
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

function resolveSeriesColor(color: ChartColorToken | undefined, index: number, theme: ChartTheme): string {
    if (theme.palette.length === 0) return theme.primaryColor;
    if (color) return resolveChartColorToken(theme, color);
    return theme.palette[index % theme.palette.length] ?? theme.primaryColor;
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
        case 'waterfall': return builders.buildWaterfallSeries(data, config, theme);
        case 'sankey': return builders.buildSankeySeries(data, config, theme);
        case 'calendar': return builders.buildCalendarSeries(data, config, theme);
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

    const option: ChartOptionFragment = {
        ...input.theme.baseOption,
        ...buildCartesianAxes({
            type: input.type,
            theme: input.theme,
            seriesChart: isSeriesChartType(input.type),
            orientation: input.orientation,
            hasRightAxis: Boolean(input.series?.some((series) => series.axis === 'right')),
        }, categories),
        tooltip: buildTooltipOption(input.type, input.theme),
        ...buildTitleOption(input.config?.title, input.theme),
        ...seriesOption,
        ...buildLegend(SELF_CONTAINED_TYPES.includes(input.type) ? false : input.legend, seriesCount, input.theme),
        animation: input.config?.showAnimation ?? true,
    };
    return applyChartEnhancements(option, {
        ...input,
        seriesFormats: configuredSeries ? definitions.map((definition) => definition.format) : undefined,
        seriesAxes: configuredSeries ? definitions.map((definition) => definition.axis) : undefined,
    });
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
