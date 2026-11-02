import { isLiteralColor, pickOnColor } from '../../../../core/Provider/utils/on-color';
import { parseToRgba } from '../../../../core/Provider/utils/color-engine';
import { createChartValueFormatter } from './chartEnhancements';
import type { ChartValueFormatter } from './chartEnhancements';
import { resolveIntlLocale } from '../../../../shared/format/locale';
import { resolveChartColorToken } from './builders/types';
import type { SarakValueFormat } from '../../../../shared/format';
import type {
    ChartOptionFragment, ChartTheme, SarakChartAxis, SarakChartDataItem, SarakChartPointColor, SarakChartType,
} from './builders/types';

export interface ChartRefinementInput {
    type: SarakChartType;
    theme: ChartTheme;
    data: SarakChartDataItem[];
    locale?: string;
    orientation?: 'vertical' | 'horizontal';
    stacked?: boolean;
    valueFormat?: SarakValueFormat;
    seriesFormats?: Array<SarakValueFormat | undefined>;
    /** Liga o hachurado (`decal`) do ECharts; desligado por padrão. */
    pattern?: boolean;
    getPointColor?: SarakChartPointColor;
    showValues?: boolean | 'auto';
    axis?: SarakChartAxis;
    /** Largura do gráfico em px; 0 ou ausente = desconhecida. */
    width?: number;
}

const CARTESIAN_TYPES: readonly SarakChartType[] = ['bar', 'line', 'area'];
const COLORED_POINT_TYPES: readonly SarakChartType[] = ['bar', 'pie', 'funnel', 'treemap'];
const INNER_LABEL_TYPES: readonly SarakChartType[] = ['funnel', 'treemap'];
const FUNNEL_ITEM_OPACITY = 0.7;
const MIN_TICK_SPACING = 72;
const DERIVED_VALUE_TICKS_CEILING = 5;
const END_LABEL_ROOM_FACTOR = 1.5;
const COMPACT_FRACTION_DIGITS = 1;

function asRecord(value: unknown): Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function seriesList(option: ChartOptionFragment): Array<Record<string, unknown>> {
    return Array.isArray(option.series) ? option.series.map(asRecord) : [];
}

function pointToken(input: ChartRefinementInput, index: number): ReturnType<SarakChartPointColor> {
    return input.getPointColor?.(input.data[index] ?? {}, index);
}

function pointFill(input: ChartRefinementInput, index: number): string {
    const token = pointToken(input, index);
    if (token) return resolveChartColorToken(input.theme, token);
    const { palette, primaryColor } = input.theme;
    return palette[index % Math.max(palette.length, 1)] ?? primaryColor;
}

/** Texto de maior contraste sobre o item; o funil compõe a opacidade sobre a superfície. */
function labelColorOn(fill: string, opacity: number, theme: ChartTheme): string {
    if (!isLiteralColor(fill)) return theme.titleColor;
    const { r, g, b } = parseToRgba(fill);
    const under = isLiteralColor(theme.surfaceColor) ? theme.surfaceColor : undefined;
    return pickOnColor(`rgba(${r},${g},${b},${opacity})`, under);
}

function styledItem(raw: unknown, input: ChartRefinementInput, index: number): unknown {
    const entry = asRecord(raw);
    const fill = pointFill(input, index);
    const opacity = input.type === 'funnel' ? FUNNEL_ITEM_OPACITY : 1;
    const label = INNER_LABEL_TYPES.includes(input.type)
        ? { label: { ...asRecord(entry.label), color: labelColorOn(fill, opacity, input.theme) } }
        : {};
    const itemStyle = pointToken(input, index) === undefined
        ? {}
        : { itemStyle: { ...asRecord(entry.itemStyle), color: fill } };
    return { ...entry, ...itemStyle, ...label };
}

function applyPointStyle(option: ChartOptionFragment, input: ChartRefinementInput): void {
    if (!COLORED_POINT_TYPES.includes(input.type)) return;
    if (!input.getPointColor && !INNER_LABEL_TYPES.includes(input.type)) return;
    const list = seriesList(option);
    if (input.type === 'bar' && list.length !== 1) return;
    option.series = list.map((series) => ({
        ...series,
        data: (Array.isArray(series.data) ? series.data : []).map((raw, index) =>
            styledItem(input.type === 'bar' ? { value: raw } : raw, input, index)),
    }));
}

function valueLabelFormatter(input: ChartRefinementInput, seriesIndex: number): ChartValueFormatter {
    const format = input.seriesFormats?.[seriesIndex] ?? input.valueFormat;
    return createChartValueFormatter(format, input.locale) ?? ((value) => value == null ? '' : String(value));
}

function applyBarValues(option: ChartOptionFragment, input: ChartRefinementInput): void {
    if (!input.showValues) return;
    const horizontal = input.orientation === 'horizontal';
    const position = input.stacked ? 'inside' : horizontal ? 'right' : 'top';
    option.series = seriesList(option).map((series, index) => {
        if (series.type !== 'bar') return series;
        const format = valueLabelFormatter(input, index);
        return {
            ...series,
            label: {
                show: true,
                position,
                color: input.stacked ? undefined : input.theme.textColor,
                fontSize: input.theme.fontSize,
                fontFamily: input.theme.bodyFont,
                formatter: (params: unknown) => format(asRecord(params).value),
            },
            ...(input.showValues === 'auto' ? { labelLayout: { hideOverlap: true } } : {}),
        };
    });
}

function compactFormatter(input: ChartRefinementInput): ChartValueFormatter {
    const base = { notation: 'compact', maximumFractionDigits: COMPACT_FRACTION_DIGITS } as const;
    const format = input.valueFormat;
    const intl = new Intl.NumberFormat(
        resolveIntlLocale(input.locale),
        format?.type === 'currency' ? { ...base, style: 'currency', currency: format.currency } : base,
    );
    return (value) => typeof value === 'number' && Number.isFinite(value) ? intl.format(value) : String(value ?? '');
}

function axisEntries(option: ChartOptionFragment): Array<{ axis: Record<string, unknown>; horizontalRun: boolean }> {
    return (['xAxis', 'yAxis'] as const).flatMap((name) => {
        const raw = option[name];
        return (Array.isArray(raw) ? raw : [raw]).map(asRecord)
            .filter((axis) => axis.type === 'value' || axis.type === 'category')
            .map((axis) => ({ axis, horizontalRun: name === 'xAxis' }));
    });
}

function tickCeiling(input: ChartRefinementInput, horizontalRun: boolean): number | undefined {
    if (input.axis?.maxTicks !== undefined) return Math.max(1, Math.floor(input.axis.maxTicks));
    if (!horizontalRun || !input.width || input.width <= 0) return undefined;
    return Math.max(1, Math.floor(input.width / MIN_TICK_SPACING));
}

function fitAxis(axis: Record<string, unknown>, input: ChartRefinementInput, horizontalRun: boolean): void {
    const explicit = input.axis?.maxTicks !== undefined;
    const ceiling = tickCeiling(input, horizontalRun);
    const label: Record<string, unknown> = { ...asRecord(axis.axisLabel), hideOverlap: true };
    if (axis.type === 'category' && ceiling !== undefined && input.data.length > ceiling) {
        label.interval = Math.ceil(input.data.length / ceiling) - 1;
    }
    if (axis.type === 'value') {
        if (ceiling !== undefined) axis.splitNumber = explicit ? ceiling : Math.min(ceiling, DERIVED_VALUE_TICKS_CEILING);
        if (input.axis?.compact) label.formatter = compactFormatter(input);
    }
    axis.axisLabel = label;
}

function cloneAxis(axis: unknown): unknown {
    return Array.isArray(axis) ? axis.map(asRecord).map((entry) => ({ ...entry })) : axis && { ...asRecord(axis) };
}

function applyAxisFit(option: ChartOptionFragment, input: ChartRefinementInput): void {
    if (!CARTESIAN_TYPES.includes(input.type)) return;
    option.xAxis = cloneAxis(option.xAxis);
    option.yAxis = cloneAxis(option.yAxis);
    axisEntries(option).forEach(({ axis, horizontalRun }) => fitAxis(axis, input, horizontalRun));
    const grid = asRecord(option.grid);
    const right = typeof grid.right === 'number' ? grid.right : 0;
    option.grid = { ...grid, right: right + Math.ceil(input.theme.fontSize * END_LABEL_ROOM_FACTOR) };
}

function applyPattern(option: ChartOptionFragment, input: ChartRefinementInput): void {
    option.aria = { ...asRecord(option.aria), decal: { show: input.pattern === true } };
}

/** Escolhas de padrão, cor por item, rótulo legível, valor na barra e marcas de eixo, sobre a opção já montada. */
export function applyChartRefinements(option: ChartOptionFragment, input: ChartRefinementInput): ChartOptionFragment {
    const refined: ChartOptionFragment = { ...option };
    applyPattern(refined, input);
    applyPointStyle(refined, input);
    applyBarValues(refined, input);
    applyAxisFit(refined, input);
    return refined;
}
