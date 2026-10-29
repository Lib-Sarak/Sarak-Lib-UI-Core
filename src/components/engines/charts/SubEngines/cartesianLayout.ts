import { buildAxisOptions } from './axisOptions';
import type { ChartOptionFragment, ChartTheme, SarakChartType } from './builders/types';

export type LegendSetting = boolean | 'top' | 'bottom';

export interface CartesianLayoutInput {
    type: SarakChartType;
    theme: ChartTheme;
    /** O formato é de série configurável (`bar`, `line`, `area`); só ele troca eixos na horizontal e abre eixo direito. */
    seriesChart: boolean;
    orientation?: 'vertical' | 'horizontal';
    hasRightAxis: boolean;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function buildCartesianAxes(input: CartesianLayoutInput, categories: unknown[]): ChartOptionFragment {
    const baseAxes = buildAxisOptions(input.type, categories, input.theme);
    if (!input.seriesChart) return baseAxes;
    const horizontal = input.orientation === 'horizontal';
    const categoryAxis = isRecord(baseAxes.xAxis) ? baseAxes.xAxis : {};
    const valueAxis = isRecord(baseAxes.yAxis) ? baseAxes.yAxis : {};
    const xAxis: Record<string, unknown> = horizontal ? valueAxis : categoryAxis;
    const yAxis: Record<string, unknown> = horizontal ? categoryAxis : valueAxis;
    if (horizontal) yAxis.data = categories;
    else xAxis.data = categories;

    const axes: ChartOptionFragment = { xAxis, yAxis };
    if (!input.hasRightAxis) return axes;
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

export function buildLegend(setting: LegendSetting | undefined, seriesCount: number, theme: ChartTheme): ChartOptionFragment {
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
