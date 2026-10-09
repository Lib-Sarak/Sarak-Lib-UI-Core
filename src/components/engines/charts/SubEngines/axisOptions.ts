import type { ChartOptionFragment, ChartTheme, SarakChartType } from './builders/types';

const CHART_TYPES_WITHOUT_CARTESIAN_AXES: readonly SarakChartType[] = [
    'pie', 'radar', 'gauge', 'funnel', 'treemap', 'sunburst',
];

function createGridLine(theme: ChartTheme): Record<string, unknown> {
    return {
        show: theme.chartShowGrid,
        lineStyle: {
            color: theme.borderColor,
            opacity: theme.chartGridOpacity,
            type: 'solid',
        },
    };
}

function createAxisLabel(theme: ChartTheme, margin: number): Record<string, unknown> {
    return {
        color: theme.textColor,
        fontSize: theme.fontSize,
        fontFamily: theme.bodyFont,
        margin,
    };
}

export function buildAxisOptions(
    type: SarakChartType,
    categories: unknown[],
    theme: ChartTheme,
): ChartOptionFragment {
    if (CHART_TYPES_WITHOUT_CARTESIAN_AXES.includes(type)) {
        return { xAxis: undefined, yAxis: undefined };
    }

    return {
        xAxis: {
            type: 'category',
            data: categories,
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: createAxisLabel(theme, theme.axisLabelMargin),
            splitLine: createGridLine(theme),
        },
        yAxis: {
            type: 'value',
            splitLine: createGridLine(theme),
            axisLine: { show: false },
            axisLabel: createAxisLabel(theme, theme.axisLabelMargin),
        },
    };
}

export function buildTooltipOption(type: SarakChartType, theme: ChartTheme): ChartOptionFragment {
    const itemTriggerTypes: readonly SarakChartType[] = ['pie', 'funnel', 'treemap', 'sunburst', 'boxplot'];
    return {
        ...theme.baseOption.tooltip,
        trigger: itemTriggerTypes.includes(type) ? 'item' : 'axis',
    };
}

export function buildTitleOption(title: string | undefined, theme: ChartTheme): ChartOptionFragment {
    if (!title) return {};
    return {
        title: {
            text: title,
            left: theme.axisLabelMargin,
            top: theme.axisLabelMargin,
            textStyle: { color: theme.titleColor, fontFamily: theme.headingFont, fontSize: theme.fontSize },
        },
    };
}
