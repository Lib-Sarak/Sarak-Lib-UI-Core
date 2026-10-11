import * as echarts from 'echarts';
import { resolveChartColorToken } from './types';
import type { ChartBuilderConfig, ChartOptionFragment, ChartTheme, SarakChartDataItem } from './types';

const WATERFALL_STACK = 'waterfall';
const WATERFALL_BAR_WIDTH = '40%';
const TRANSPARENT_FILL = 'transparent';

type WaterfallKind = 'increase' | 'decrease' | 'total';

interface WaterfallStep {
    kind: WaterfallKind;
    start: number;
    end: number;
    delta: number;
}

interface WaterfallSegment {
    base: number;
    main: number;
    rest: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
    return typeof value === 'number' && Number.isFinite(value);
}

/** Há ao menos um item com valor numérico finito no campo lido. */
export function hasWaterfallData(data: unknown, dataKey: string): boolean {
    return Array.isArray(data) && data.some((item) => isRecord(item) && isFiniteNumber(item[dataKey]));
}

/** Item sem valor numérico entra como variação zero, para a barra continuar alinhada à sua categoria. */
function buildSteps(data: SarakChartDataItem[], dataKey: string): WaterfallStep[] {
    let accumulated = 0;
    return data.map((item) => {
        const isTotal = item.total === true;
        const rawDelta = item[dataKey];
        const delta = !isTotal && isFiniteNumber(rawDelta) ? rawDelta : 0;
        const start = isTotal ? 0 : accumulated;
        const end = isTotal ? accumulated : accumulated + delta;
        accumulated = end;
        const kind: WaterfallKind = isTotal ? 'total' : delta < 0 ? 'decrease' : 'increase';
        return { kind, start, end, delta: isTotal ? end : delta };
    });
}

/** Barras empilhadas somam acima e abaixo de zero em separado; o trecho que cruza o zero vira dois. */
function splitSegment(step: WaterfallStep): WaterfallSegment {
    const low = Math.min(step.start, step.end);
    const high = Math.max(step.start, step.end);
    if (low >= 0) return { base: low, main: high - low, rest: 0 };
    if (high <= 0) return { base: high, main: low - high, rest: 0 };
    return { base: 0, main: high, rest: low };
}

function formatWaterfallTooltip(params: unknown): string {
    const point = isRecord(params) ? params : {};
    const data = isRecord(point.data) ? point.data : {};
    const delta = isFiniteNumber(data.delta) ? data.delta : 0;
    return `${echarts.format.encodeHTML(String(point.name ?? ''))}: ${delta > 0 ? '+' : ''}${delta}`;
}

function createBarSeries(theme: ChartTheme, data: unknown[], color?: string): Record<string, unknown> {
    return {
        type: 'bar',
        stack: WATERFALL_STACK,
        barWidth: WATERFALL_BAR_WIDTH,
        data,
        itemStyle: { color, borderRadius: theme.borderRadius },
    };
}

export const buildWaterfallSeries = (
    data: SarakChartDataItem[],
    config: ChartBuilderConfig | undefined,
    theme: ChartTheme,
): ChartOptionFragment => {
    const steps = buildSteps(data, config?.dataKey || 'value');
    const segments = steps.map(splitSegment);
    const colors: Record<WaterfallKind, string> = {
        increase: resolveChartColorToken(theme, 'statusSuccessColor'),
        decrease: resolveChartColorToken(theme, 'statusErrorColor'),
        total: theme.primaryColor,
    };
    const kindSeries = (kind: WaterfallKind): Record<string, unknown> => createBarSeries(
        theme,
        steps.map((step, index) => step.kind === kind ? { value: segments[index].main, delta: step.delta } : null),
        colors[kind],
    );
    const remainder = steps.map((step, index) => segments[index].rest === 0
        ? null
        : { value: segments[index].rest, delta: step.delta, itemStyle: { color: colors[step.kind] } });
    const base = {
        ...createBarSeries(theme, segments.map((segment) => segment.base), TRANSPARENT_FILL),
        silent: true,
        emphasis: { disabled: true },
    };

    return {
        tooltip: { ...theme.baseOption.tooltip, trigger: 'item', formatter: formatWaterfallTooltip },
        series: [base, kindSeries('increase'), kindSeries('decrease'), kindSeries('total'), createBarSeries(theme, remainder)],
    };
};
