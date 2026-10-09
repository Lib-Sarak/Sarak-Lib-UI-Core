import React, { useEffect, useMemo, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import { use as useEChartsExtensions } from 'echarts/core';
import { AriaComponent, LegendComponent } from 'echarts/components';
import { SarakDataEmpty } from '../../atomic/Feedback/SarakDataEmpty';
import { useLibraryText } from '../../../core/i18n/useLibraryText';
import { useEChartsTheme } from './SubEngines/useEChartsTheme';
import type { EChartsTheme } from './SubEngines/useEChartsTheme';
import { buildChartOption, buildPointClickEvents, hasRenderableSeriesData, isSeriesChartType } from './SubEngines/seriesModel';
import RechartsChart from './SubEngines/RechartsChart';
import type { ChartOptionFragment, SarakChartDataItem, SarakChartType } from './SubEngines/builders/types';

useEChartsExtensions([AriaComponent, LegendComponent]);

const CHART_TYPES: readonly SarakChartType[] = [
    'line', 'area', 'bar', 'pie', 'radar', 'gauge', 'scatter', 'heatmap',
    'funnel', 'treemap', 'candlestick', 'sunburst', 'histogram', 'boxplot',
];
const ECHARTS_ONLY_PROPS = ['series', 'stacked', 'orientation', 'legend', 'onPointClick'] as const;
const CHART_TYPES_WITH_SHORT_VALUE_KEY: readonly SarakChartType[] = ['funnel', 'treemap', 'histogram'];

export interface SarakChartEngineProps {
    /** Seleciona o formato; omitido, usa `chartType` do design resolvido. */
    type?: 'line' | 'area' | 'bar' | 'pie' | 'radar' | 'gauge' | 'scatter'
        | 'heatmap' | 'funnel' | 'treemap' | 'candlestick' | 'sunburst'
        | 'histogram' | 'boxplot';
    /** Registros da série, com os campos configurados por `xAxisKey` e `dataKey`. */
    data: SarakChartDataItem[];
    /** Ajusta chaves de leitura, motor, título, gradiente, animação e espessura. */
    config?: {
        xAxisKey?: string;
        dataKey?: string;
        engine?: 'recharts' | 'echarts';
        title?: string;
        showGradients?: boolean;
        showAnimation?: boolean;
        thickness?: number;
    };
    /**
     * Séries cartesianas; pizza, radar, funil e outros formatos não cartesianos ignoram esta prop.
     * `color`, quando informado, é o nome de um token de cor do tema, nunca um valor hexadecimal.
     */
    series?: Array<{
        key: string;
        label?: string;
        type?: 'bar' | 'line' | 'area';
        stack?: string;
        axis?: 'left' | 'right';
        dashed?: boolean;
        color?: 'chartColorPalette' | 'secondaryColor' | 'accentColor' | 'statusSuccessColor'
            | 'statusWarningColor' | 'statusErrorColor' | 'statusInfoColor' | 'tertiaryColor';
    }>;
    /** Formatos não cartesianos ignoram esta prop. */
    stacked?: boolean;
    /** Formatos não cartesianos ignoram esta prop. */
    orientation?: 'vertical' | 'horizontal';
    /** Exibe a legenda no topo/rodapé ou define explicitamente sua visibilidade. */
    legend?: boolean | 'top' | 'bottom';
    /** Recebe a série, o índice e o registro original ao clicar em um ponto do ECharts. */
    onPointClick?: (event: { seriesKey: string; index: number; datum: SarakChartDataItem }) => void;
    /** Texto acessível do gráfico; omitido, usa o catálogo de i18n. */
    ariaLabel?: string;
}

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

function hasRenderableData(data: unknown, type: SarakChartType, dataKey: string): data is SarakChartDataItem[] {
    if (!Array.isArray(data) || data.length === 0) return false;
    if (type === 'candlestick') return data.some((item) => isRecord(item) && hasCandlestickValues(item));
    if (type === 'boxplot') return data.some((item) => isRecord(item) && hasBoxPlotValues(item, dataKey));
    if (type === 'sunburst') {
        return data.some((item) => isRecord(item) && (item[dataKey] !== undefined || Array.isArray(item.children)));
    }

    return data.some((item) => isRecord(item) && item[dataKey] !== undefined && item[dataKey] !== null);
}

function resolveChartType(type: SarakChartType | undefined, designType: string): SarakChartType {
    if (type) return type;
    return CHART_TYPES.includes(designType as SarakChartType) ? designType as SarakChartType : 'line';
}

function getUnsupportedRechartsProps(props: SarakChartEngineProps, type: SarakChartType): string[] {
    const runtimeProps = props as unknown as Record<string, unknown>;
    const unsupported: string[] = ECHARTS_ONLY_PROPS.filter((name) => runtimeProps[name] !== undefined);
    if (type !== 'bar' && type !== 'line') unsupported.push('type');
    if (props.config?.showGradients !== undefined) unsupported.push('showGradients');
    if (props.config?.title !== undefined) unsupported.push('title');
    return unsupported;
}

function useRechartsCompatibilityWarning(
    engine: 'echarts' | 'recharts',
    props: SarakChartEngineProps,
    type: SarakChartType,
): void {
    const warnedProps = useRef(new Set<string>());
    const unsupportedProps = getUnsupportedRechartsProps(props, type);

    useEffect(() => {
        if (engine !== 'recharts' || process.env.NODE_ENV === 'production') return;
        const unreportedProps = unsupportedProps.filter((name) => !warnedProps.current.has(name));
        if (unreportedProps.length === 0) return;
        console.warn(`[SarakChartEngine] recharts não aplica: ${unreportedProps.join(', ')}.`);
        unreportedProps.forEach((name) => warnedProps.current.add(name));
    }, [engine, props, unsupportedProps]);
}

interface ChartOptionRuntimeInput {
    type: SarakChartType;
    props: SarakChartEngineProps;
    theme: EChartsTheme;
    engine: 'echarts' | 'recharts';
    hasData: boolean;
}

function hasChartData(props: SarakChartEngineProps, type: SarakChartType, dataKey: string): boolean {
    if (isSeriesChartType(type) && props.series !== undefined) {
        return hasRenderableSeriesData(props.data, props.series);
    }
    return hasRenderableData(props.data, type, dataKey);
}

function useResolvedChartOption(input: ChartOptionRuntimeInput): ChartOptionFragment | null {
    const { type, props, theme, engine, hasData } = input;
    const option = useMemo(
        () => engine === 'echarts' && hasData ? buildChartOption({
            type,
            data: props.data,
            config: props.config,
            theme,
            series: props.series,
            stacked: props.stacked,
            orientation: props.orientation,
            legend: props.legend,
        }) : null,
        [engine, type, props, theme, hasData],
    );
    return option;
}

function usePointClickEvents(
    props: SarakChartEngineProps,
    type: SarakChartType,
    dataKey: string,
): ReturnType<typeof buildPointClickEvents> {
    return useMemo(() => buildPointClickEvents({
        data: props.data,
        series: isSeriesChartType(type) ? props.series : undefined,
        dataKey,
        onPointClick: props.onPointClick,
    }), [props.data, props.onPointClick, props.series, type, dataKey]);
}

function SarakChartEngine(props: SarakChartEngineProps): React.ReactElement {
    const theme = useEChartsTheme();
    const text = useLibraryText();
    const type = resolveChartType(props.type, theme.chartType);
    const engine = props.config?.engine ?? 'echarts';
    const dataKey = props.config?.dataKey ?? (CHART_TYPES_WITH_SHORT_VALUE_KEY.includes(type) ? 'v' : 'value');
    const hasData = hasChartData(props, type, dataKey);
    const option = useResolvedChartOption({ type, props, theme, engine, hasData });
    const onEvents = usePointClickEvents(props, type, dataKey);

    useRechartsCompatibilityWarning(engine, props, type);
    if (!hasData) return <SarakDataEmpty message={text('chartDataEmptyMessage')} />;

    const ariaLabel = props.ariaLabel ?? text('chartAriaLabel');
    if (engine === 'recharts') {
        return (
            <RechartsChart
                type={type}
                data={props.data}
                config={props.config}
                theme={theme}
                ariaLabel={ariaLabel}
            />
        );
    }

    return (
        <div className="w-full h-full p-6" role="img" aria-label={ariaLabel}>
            <ReactECharts
                option={option}
                style={{ height: '100%', width: '100%' }}
                settings={{ notMerge: true }}
                onEvents={onEvents}
            />
        </div>
    );
}

export default SarakChartEngine;
