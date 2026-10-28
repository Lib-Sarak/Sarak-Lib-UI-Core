import { sarakFormatCurrency, sarakFormatDate, sarakFormatNumber, sarakFormatPercent } from '../../../../shared/format';
import type { SarakValueFormat } from '../../../../shared/format';
import type {
    ChartOptionFragment, ChartTheme, SarakChartGauge, SarakChartPieLabel, SarakChartReferenceBand,
    SarakChartReferenceLine, SarakChartReferenceTone, SarakChartType, SarakChartZoom,
} from './builders/types';

export type ChartValueFormatter = (value: unknown) => string;

export interface ChartEnhancementInput {
    type: SarakChartType;
    theme: ChartTheme;
    locale?: string;
    orientation?: 'vertical' | 'horizontal';
    valueFormat?: SarakValueFormat;
    /** Formato de cada série, na ordem das definições; `undefined` herda `valueFormat`. */
    seriesFormats?: Array<SarakValueFormat | undefined>;
    seriesAxes?: Array<'left' | 'right' | undefined>;
    referenceLines?: SarakChartReferenceLine[];
    referenceBands?: SarakChartReferenceBand[];
    zoom?: SarakChartZoom;
    pieLabel?: SarakChartPieLabel;
    gauge?: SarakChartGauge;
}

const CARTESIAN_TYPES: readonly SarakChartType[] = ['bar', 'line', 'area'];
const ZOOMABLE_TYPES: readonly SarakChartType[] = [
    'bar', 'line', 'area', 'scatter', 'candlestick', 'histogram', 'boxplot', 'waterfall',
];
const DEFAULT_GAUGE_MIN = 0;
const DEFAULT_GAUGE_MAX = 100;
const ZOOM_SLIDER_SIZE = 20;
const ZOOM_SLIDER_ROOM = 48;
const BAND_OPACITY = 0.12;
const PERCENT_SCALE = 100;
const PIE_PERCENT_DIGITS = 1;

function asNumber(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function asRecord(value: unknown): Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

/** Formata como o resto da lib: mesmos `sarakFormat*`, no locale da tela. Valor não numérico passa como texto. */
export function createChartValueFormatter(
    format: SarakValueFormat | undefined,
    locale?: string,
): ChartValueFormatter | undefined {
    if (!format) return undefined;
    return (value) => {
        if (format.type === 'date') {
            return typeof value === 'number' || typeof value === 'string' || value instanceof Date
                ? sarakFormatDate(value, locale, format.options) : '';
        }
        const numeric = asNumber(value);
        if (numeric === null) return value == null ? '' : String(value);
        if (format.type === 'currency') return sarakFormatCurrency(numeric, format.currency, locale);
        if (format.type === 'percent') return sarakFormatPercent(numeric, locale, format.options);
        return sarakFormatNumber(numeric, locale, format.options);
    };
}

function toneColor(tone: SarakChartReferenceTone | undefined, theme: ChartTheme): string {
    if (tone === 'success') return theme.statusColors.statusSuccessColor;
    if (tone === 'warning') return theme.statusColors.statusWarningColor;
    if (tone === 'error') return theme.statusColors.statusErrorColor;
    return theme.textColor;
}

function valueAxes(option: ChartOptionFragment): Array<Record<string, unknown>> {
    return [option.xAxis, option.yAxis]
        .flatMap((axis) => Array.isArray(axis) ? axis : [axis])
        .filter((axis): axis is Record<string, unknown> => asRecord(axis).type === 'value');
}

function applyAxisFormat(option: ChartOptionFragment, input: ChartEnhancementInput): void {
    const rightIndex = input.seriesAxes?.findIndex((axis) => axis === 'right') ?? -1;
    const leftIndex = input.seriesAxes?.findIndex((axis) => axis !== 'right') ?? -1;
    const leftFormat = input.valueFormat ?? input.seriesFormats?.[leftIndex];
    const rightFormat = input.seriesFormats?.[rightIndex] ?? input.valueFormat;
    valueAxes(option).forEach((axis, index) => {
        const formatter = createChartValueFormatter(index === 0 ? leftFormat : rightFormat, input.locale);
        if (formatter) axis.axisLabel = { ...asRecord(axis.axisLabel), formatter };
    });
}

function applyTooltipFormat(option: ChartOptionFragment, input: ChartEnhancementInput): void {
    const general = createChartValueFormatter(input.valueFormat, input.locale);
    if (general) option.tooltip = { ...asRecord(option.tooltip), valueFormatter: general };
    if (!Array.isArray(option.series)) return;
    option.series = option.series.map((series, index) => {
        const own = createChartValueFormatter(input.seriesFormats?.[index], input.locale);
        if (!own) return series;
        return { ...asRecord(series), tooltip: { ...asRecord(asRecord(series).tooltip), valueFormatter: own } };
    });
}

function patchSeries(option: ChartOptionFragment, index: number, patch: Record<string, unknown>): void {
    if (!Array.isArray(option.series) || index < 0 || !option.series[index]) return;
    option.series = option.series.map((series, position) => position === index ? { ...asRecord(series), ...patch } : series);
}

function firstSeries(option: ChartOptionFragment): Record<string, unknown> {
    return asRecord(Array.isArray(option.series) ? option.series[0] : undefined);
}

function seriesIndexForAxis(input: ChartEnhancementInput, axis: 'left' | 'right'): number {
    if (!input.seriesAxes) return axis === 'left' ? 0 : -1;
    return input.seriesAxes.findIndex((candidate) => (candidate === 'right') === (axis === 'right'));
}

function coordinate(input: ChartEnhancementInput, value: number): Record<string, number> {
    return input.orientation === 'horizontal' ? { xAxis: value } : { yAxis: value };
}

function buildMarkLine(lines: SarakChartReferenceLine[], input: ChartEnhancementInput): Record<string, unknown> {
    const formatter = createChartValueFormatter(input.valueFormat, input.locale);
    return {
        silent: true,
        symbol: 'none',
        data: lines.map((line) => ({
            ...coordinate(input, line.value),
            label: { show: true, formatter: line.label ?? formatter?.(line.value) ?? String(line.value) },
            lineStyle: { color: toneColor(line.tone, input.theme), type: line.dashed ? 'dashed' : 'solid' },
        })),
    };
}

function buildMarkArea(bands: SarakChartReferenceBand[], input: ChartEnhancementInput): Record<string, unknown> {
    return {
        silent: true,
        data: bands.map((band) => [
            {
                ...coordinate(input, band.from),
                name: band.label,
                label: { show: Boolean(band.label), color: input.theme.textColor },
                itemStyle: { color: toneColor(band.tone, input.theme), opacity: BAND_OPACITY },
            },
            coordinate(input, band.to),
        ]),
    };
}

function applyReferences(option: ChartOptionFragment, input: ChartEnhancementInput): void {
    if (!CARTESIAN_TYPES.includes(input.type)) return;
    (['left', 'right'] as const).forEach((axis) => {
        const lines = (input.referenceLines ?? []).filter((line) => (line.axis ?? 'left') === axis);
        const bands = axis === 'left' ? input.referenceBands ?? [] : [];
        const patch = {
            ...(lines.length > 0 ? { markLine: buildMarkLine(lines, input) } : {}),
            ...(bands.length > 0 ? { markArea: buildMarkArea(bands, input) } : {}),
        };
        if (Object.keys(patch).length > 0) patchSeries(option, seriesIndexForAxis(input, axis), patch);
    });
}

function applyZoom(option: ChartOptionFragment, input: ChartEnhancementInput): void {
    if (!input.zoom || !ZOOMABLE_TYPES.includes(input.type)) return;
    const horizontal = input.orientation === 'horizontal';
    const target = horizontal ? { yAxisIndex: 0, orient: 'vertical' } : { xAxisIndex: 0 };
    if (input.zoom === 'inside') {
        option.dataZoom = [{ type: 'inside', ...target }];
        return;
    }
    const grid = asRecord(option.grid);
    const side = horizontal ? 'right' : 'bottom';
    const current = asNumber(grid[side]) ?? 0;
    option.grid = { ...grid, [side]: current + ZOOM_SLIDER_ROOM };
    option.dataZoom = [{
        type: 'slider',
        ...target,
        ...(horizontal ? { width: ZOOM_SLIDER_SIZE } : { height: ZOOM_SLIDER_SIZE }),
    }];
}

function pieLabelFormatter(mode: SarakChartPieLabel, input: ChartEnhancementInput): ((params: unknown) => string) | undefined {
    const format = createChartValueFormatter(input.valueFormat, input.locale);
    const read = (params: unknown): { name: string; value: string; percent: string } => {
        const record = asRecord(params);
        const percent = (asNumber(record.percent) ?? 0) / PERCENT_SCALE;
        return {
            name: String(record.name ?? ''),
            value: format ? format(record.value) : String(record.value ?? ''),
            percent: sarakFormatPercent(percent, input.locale, { maximumFractionDigits: PIE_PERCENT_DIGITS }),
        };
    };
    if (mode === 'name') return (params) => read(params).name;
    if (mode === 'value') return (params) => read(params).value;
    if (mode === 'percent') return (params) => read(params).percent;
    if (mode === 'name-percent') {
        return (params) => {
            const parts = read(params);
            return `${parts.name}: ${parts.percent}`;
        };
    }
    return undefined;
}

function applyPieLabel(option: ChartOptionFragment, input: ChartEnhancementInput): void {
    if (input.type !== 'pie' || !input.pieLabel) return;
    const formatter = pieLabelFormatter(input.pieLabel, input);
    if (!formatter) {
        patchSeries(option, 0, { label: { show: false }, emphasis: { label: { show: false } } });
        return;
    }
    const emphasis = asRecord(firstSeries(option).emphasis);
    patchSeries(option, 0, {
        label: { show: true, position: 'outside', formatter, color: input.theme.textColor, fontSize: input.theme.fontSize },
        emphasis: { ...emphasis, label: { ...asRecord(emphasis.label), show: true, formatter } },
    });
}

function gaugeDetailFormatter(input: ChartEnhancementInput, min: number, max: number): ChartValueFormatter | string {
    const format = input.valueFormat;
    if (!format) return '{value}%';
    if (format.type !== 'percent') return createChartValueFormatter(format, input.locale) ?? '{value}';
    const span = max - min || 1;
    return (value) => sarakFormatPercent(((asNumber(value) ?? min) - min) / span, input.locale, format.options);
}

function applyGauge(option: ChartOptionFragment, input: ChartEnhancementInput): void {
    if (input.type !== 'gauge' || (!input.gauge && !input.valueFormat)) return;
    const min = input.gauge?.min ?? DEFAULT_GAUGE_MIN;
    const max = input.gauge?.max ?? DEFAULT_GAUGE_MAX;
    patchSeries(option, 0, {
        min,
        max,
        detail: { ...asRecord(firstSeries(option).detail), formatter: gaugeDetailFormatter(input, min, max) },
    });
}

/** Camada de formato, referência, zoom, rótulo da pizza e escala do medidor sobre a opção já montada. */
export function applyChartEnhancements(option: ChartOptionFragment, input: ChartEnhancementInput): ChartOptionFragment {
    const enhanced: ChartOptionFragment = { ...option };
    applyAxisFormat(enhanced, input);
    applyTooltipFormat(enhanced, input);
    applyReferences(enhanced, input);
    applyZoom(enhanced, input);
    applyPieLabel(enhanced, input);
    applyGauge(enhanced, input);
    return enhanced;
}
