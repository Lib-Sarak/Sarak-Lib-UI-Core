import React, { useEffect, useMemo, useRef } from 'react';
import { useElementWidth } from './SubEngines/useElementWidth';
import { SarakDataEmpty } from '../../atomic/Feedback/SarakDataEmpty';
import { SarakOptionalPeerFallback } from '../../atomic/Feedback/SarakOptionalPeerFallback';
import { useLibraryText } from '../../../core/i18n/useLibraryText';
import { useSarakLanguage } from '../../../core/i18n/useSarakLanguage';
import type { SarakValueFormat } from '../../../shared/format';
import { useEChartsTheme } from './SubEngines/useEChartsTheme';
import type { EChartsTheme } from './SubEngines/useEChartsTheme';
import { buildChartOption, buildPointClickEvents, hasRenderableSeriesData, isSeriesChartType } from './SubEngines/seriesModel';
import { hasEChartsPeers, hasRechartsPeer, ReactECharts } from './SubEngines/chartPeerAvailability';
import RechartsChart from './SubEngines/RechartsChart';
import { hasRenderableData, resolveChartType } from './SubEngines/chartDataModel';
import type {
    ChartOptionFragment, SarakChartDataItem, SarakChartGauge, SarakChartPieLabel, SarakChartReferenceBand,
    SarakChartReferenceLine, SarakChartType, SarakChartZoom, SarakChartAxis, SarakChartFunnel, SarakChartPointColor,
} from './SubEngines/builders/types';

export type {
    SarakChartAxis, SarakChartFunnel, SarakChartPointColor, SarakChartGauge, SarakChartPieLabel, SarakChartReferenceBand, SarakChartReferenceLine, SarakChartReferenceTone, SarakChartZoom,
} from './SubEngines/builders/types';

const OPTIONAL_ECHARTS_PEERS = ['echarts', 'echarts-for-react'] as const;
const OPTIONAL_RECHARTS_PEER = ['recharts'] as const;

const ECHARTS_ONLY_PROPS = [
    'series', 'stacked', 'orientation', 'legend', 'onPointClick', 'valueFormat', 'height',
    'referenceLines', 'referenceBands', 'zoom', 'pieLabel', 'gauge', 'pattern', 'getPointColor', 'showValues', 'funnel', 'axis', 'extendOption',
] as const;
const CHART_TYPES_WITH_SHORT_VALUE_KEY: readonly SarakChartType[] = ['funnel', 'treemap', 'histogram'];

export interface SarakChartEngineProps {
    /**
     * Seleciona o formato; omitido, usa `chartType` do design resolvido. `waterfall` lê `{ name, value, total? }`,
     * `sankey` lê `{ source, target, value }` e `calendar` lê `{ date, value }`.
     */
    type?: 'line' | 'area' | 'bar' | 'pie' | 'radar' | 'gauge' | 'scatter'
        | 'heatmap' | 'funnel' | 'treemap' | 'candlestick' | 'sunburst'
        | 'histogram' | 'boxplot' | 'waterfall' | 'sankey' | 'calendar';
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
     * Séries cartesianas; pizza, radar, funil, `waterfall`, `sankey`, `calendar` e outros formatos ignoram esta prop.
     * `color`, quando informado, é o nome de um token de cor do tema, nunca um valor hexadecimal.
     */
    series?: Array<{
        key: string;
        label?: string;
        type?: 'bar' | 'line' | 'area';
        stack?: string;
        axis?: 'left' | 'right';
        dashed?: boolean;
        /** Formato do valor desta série; omitido, herda `valueFormat` (útil no eixo direito). */
        format?: SarakValueFormat;
        color?: 'chartColorPalette' | 'secondaryColor' | 'accentColor' | 'statusSuccessColor'
            | 'statusWarningColor' | 'statusErrorColor' | 'statusInfoColor' | 'tertiaryColor';
    }>;
    /** Formatos não cartesianos, `waterfall` e `calendar` ignoram esta prop. */
    stacked?: boolean;
    /** Formatos não cartesianos, `waterfall` e `calendar` ignoram esta prop. */
    orientation?: 'vertical' | 'horizontal';
    /** Exibe a legenda no topo/rodapé ou define explicitamente sua visibilidade; `waterfall`, `sankey` e `calendar` ignoram esta prop. */
    legend?: boolean | 'top' | 'bottom';
    /** Recebe a série, o índice e o registro original ao clicar em um ponto do ECharts. */
    onPointClick?: (event: { seriesKey: string; index: number; datum: SarakChartDataItem }) => void;
    /** Texto acessível do gráfico; omitido, usa o catálogo de i18n. */
    ariaLabel?: string;
    /** Formato de eixo de valor, dica e rótulos, no idioma da tela; omitido, mostra o número cru. Só no ECharts. */
    valueFormat?: SarakValueFormat;
    /** Altura do gráfico (número em px); omitida, ocupa 100% do pai. Só no ECharts. */
    height?: number | string;
    /** Linhas sobre valores do eixo de valor de `bar`, `line` e `area`; os tons vêm dos tokens de status. */
    referenceLines?: SarakChartReferenceLine[];
    /** Faixas sombreadas entre dois valores do eixo de valor de `bar`, `line` e `area`. */
    referenceBands?: SarakChartReferenceBand[];
    /** Zoom do eixo de categoria; `true` equivale a `'slider'`. */
    zoom?: SarakChartZoom;
    /** Rótulo das fatias da pizza; omitido, mostra o da rc.3 (só ao passar o mouse). */
    pieLabel?: SarakChartPieLabel;
    /** Escala do medidor (`gauge`); omitida, vale 0 a 100. O `%` só aparece com `valueFormat` percentual ou sem `valueFormat`. */
    gauge?: SarakChartGauge;
    /** Hachurado sobre as cores, para quem não distingue cor; desligado por padrão. Só no ECharts. */
    pattern?: boolean;
    /** Cor de cada item, pelo nome de um token do tema; `undefined` cai na paleta. Vale em `bar` de uma série, `pie`, `funnel` e `treemap`. */
    getPointColor?: SarakChartPointColor;
    /** Valor na ponta da barra, formatado por `valueFormat`; `'auto'` esconde o que não cabe. Só em `bar`. */
    showValues?: boolean | 'auto';
    /** Escala do funil (`funnel`); omitida, vai de 0 ao maior valor. */
    funnel?: SarakChartFunnel;
    /** Marcas do eixo: teto de marcas e abreviação (`1,2 mi`). Omitido, as marcas seguem a largura. */
    axis?: SarakChartAxis;
    /** Recebe a opção final do ECharts, já montada pela lib, e devolve a que será desenhada; roda por último. Só no ECharts. */
    extendOption?: (option: Record<string, unknown>) => Record<string, unknown>;
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
    locale: string;
    width: number;
}

function hasChartData(props: SarakChartEngineProps, type: SarakChartType, dataKey: string): boolean {
    if (isSeriesChartType(type) && props.series !== undefined) {
        return hasRenderableSeriesData(props.data, props.series);
    }
    return hasRenderableData(props.data, type, dataKey);
}

function useResolvedChartOption(input: ChartOptionRuntimeInput): ChartOptionFragment | null {
    const { type, props, theme, engine, hasData, locale, width } = input;
    const { extendOption } = props;
    const option = useMemo(() => {
        if (engine !== 'echarts' || !hasData) return null;
        const built = buildChartOption({
            type,
            data: props.data,
            config: props.config,
            theme,
            series: props.series,
            stacked: props.stacked,
            orientation: props.orientation,
            legend: props.legend,
            locale,
            valueFormat: props.valueFormat,
            referenceLines: props.referenceLines,
            referenceBands: props.referenceBands,
            zoom: props.zoom,
            pieLabel: props.pieLabel,
            gauge: props.gauge,
            pattern: props.pattern,
            getPointColor: props.getPointColor,
            showValues: props.showValues,
            funnel: props.funnel,
            axis: props.axis,
            width,
        });
        return extendOption ? extendOption(built) : built;
    }, [engine, type, props, theme, hasData, locale, width, extendOption]);
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

function SarakChartContent(props: SarakChartEngineProps): React.ReactElement {
    const theme = useEChartsTheme();
    const text = useLibraryText();
    const { locale } = useSarakLanguage();
    const type = resolveChartType(props.type, theme.chartType);
    const engine = props.config?.engine ?? 'echarts';
    const dataKey = props.config?.dataKey ?? (CHART_TYPES_WITH_SHORT_VALUE_KEY.includes(type) ? 'v' : 'value');
    const hasData = hasChartData(props, type, dataKey);
    const [frameRef, width] = useElementWidth();
    const option = useResolvedChartOption({ type, props, theme, engine, hasData, locale, width });
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
        <div ref={frameRef} className="w-full h-full p-6" role="img" aria-label={ariaLabel} style={props.height === undefined ? undefined : { height: props.height }}>
            <ReactECharts
                option={option}
                style={{ height: '100%', width: '100%' }}
                settings={{ notMerge: true }}
                onEvents={onEvents}
            />
        </div>
    );
}

function SarakChartEngine(props: SarakChartEngineProps): React.ReactElement {
    const engine = props.config?.engine ?? 'echarts';
    if (engine === 'recharts' && !hasRechartsPeer()) {
        return <SarakOptionalPeerFallback component="SarakChartEngine" packages={OPTIONAL_RECHARTS_PEER} />;
    }
    if (engine === 'echarts' && !hasEChartsPeers()) {
        return <SarakOptionalPeerFallback component="SarakChartEngine" packages={OPTIONAL_ECHARTS_PEERS} />;
    }
    return <SarakChartContent {...props} />;
}

export default SarakChartEngine;
