// @vitest-environment node
import { describe, it, expect } from 'vitest';
import * as basic from '../basicCharts';
import * as advanced from '../advancedCharts';
import * as statistical from '../statisticalCharts';
import type { ChartTheme } from '../types';

/** Captura a opção produzida pelos builders para mudanças visuais intencionais. */

const CHART_DATA = [
    { name: 'A', value: 10, v: 100, open: 98, high: 108, low: 95, close: 105, boxplot: [1, 2, 3, 4, 5] },
    { name: 'B', value: 20, v: 200, open: 105, high: 112, low: 101, close: 109, boxplot: [2, 3, 4, 5, 6] },
    { name: 'C', value: 30, v: 300, open: 109, high: 116, low: 103, close: 107, boxplot: [3, 4, 5, 6, 7] },
];

const CHART_BORDER_WIDTH = 1;
const CHART_BORDER_RADIUS = 8;
const CHART_FONT_SIZE = 11;
const CHART_AXIS_LABEL_MARGIN = 8;
const CHART_GRID_OPACITY = 0.05;
const CHART_THICKNESS = 2;
const CHART_CONFIG = { dataKey: 'value', xAxisKey: 'name' };
const EMPTY_CANDLESTICK_DATA = [{ name: 'A' }];
const CANDLESTICK_INPUT = CHART_DATA[0];
const CANDLESTICK_EXPECTED = [[
    CANDLESTICK_INPUT.open, CANDLESTICK_INPUT.close, CANDLESTICK_INPUT.low, CANDLESTICK_INPUT.high,
]];
const [BOX_PLOT_MINIMUM, BOX_PLOT_FIRST_QUARTILE, BOX_PLOT_MEDIAN, BOX_PLOT_THIRD_QUARTILE, BOX_PLOT_MAXIMUM] =
    CHART_DATA[0].boxplot;
const BOX_PLOT_SUMMARY_INPUT = {
    min: BOX_PLOT_MINIMUM,
    q1: BOX_PLOT_FIRST_QUARTILE,
    median: BOX_PLOT_MEDIAN,
    q3: BOX_PLOT_THIRD_QUARTILE,
    max: BOX_PLOT_MAXIMUM,
};
const BOX_PLOT_EXPECTED = [[
    BOX_PLOT_MINIMUM, BOX_PLOT_FIRST_QUARTILE, BOX_PLOT_MEDIAN, BOX_PLOT_THIRD_QUARTILE, BOX_PLOT_MAXIMUM,
]];

// `baseOption` não é lido pelos builders (só pelo engine); fixture mínima
// suficiente, tipada via cast para o contrato real do tema.
const CHART_PALETTE = ['cornflowerblue', 'darkorchid', 'coral', 'seagreen', 'orange', 'crimson', 'dodgerblue', 'rebeccapurple'];

const CHART_THEME = {
    baseOption: {},
    palette: CHART_PALETTE,
    primaryColor: CHART_PALETTE[0],
    secondaryColor: CHART_PALETTE[1],
    textColor: 'slategray',
    titleColor: 'navy',
    borderColor: 'silver',
    borderWidth: CHART_BORDER_WIDTH,
    borderRadius: CHART_BORDER_RADIUS,
    surfaceColor: 'whitesmoke',
    bodyFont: 'Inter',
    headingFont: 'Georgia',
    fontSize: CHART_FONT_SIZE,
    axisLabelMargin: CHART_AXIS_LABEL_MARGIN,
    chartGridOpacity: CHART_GRID_OPACITY,
    chartShowGrid: true,
    chartTooltipBg: 'whitesmoke',
    chartType: 'line',
    chartThickness: CHART_THICKNESS,
    chartSmoothing: true,
} as unknown as ChartTheme;

describe('chart builders — caracterização da saída', () => {
    it('basicCharts.buildBarSeries', () => {
        expect(basic.buildBarSeries(CHART_DATA, CHART_CONFIG, CHART_THEME)).toMatchSnapshot();
    });
    it('basicCharts.buildLineSeries (line)', () => {
        expect(basic.buildLineSeries(CHART_DATA, CHART_CONFIG, CHART_THEME, false)).toMatchSnapshot();
    });
    it('basicCharts.buildLineSeries (area)', () => {
        expect(basic.buildLineSeries(CHART_DATA, CHART_CONFIG, CHART_THEME, true)).toMatchSnapshot();
    });
    it('basicCharts.buildPieSeries', () => {
        expect(basic.buildPieSeries(CHART_DATA, CHART_CONFIG, CHART_THEME)).toMatchSnapshot();
    });
});

describe('chart builders — caracterização da saída', () => {
    it('statisticalCharts.buildScatterSeries', () => {
        expect(statistical.buildScatterSeries(CHART_DATA, CHART_CONFIG, CHART_THEME)).toMatchSnapshot();
    });
    it('statisticalCharts.buildCandlestickSeries', () => {
        expect(statistical.buildCandlestickSeries(CHART_DATA, CHART_CONFIG, CHART_THEME)).toMatchSnapshot();
    });
    it('statisticalCharts.buildHistogramSeries', () => {
        expect(statistical.buildHistogramSeries(CHART_DATA, CHART_CONFIG, CHART_THEME)).toMatchSnapshot();
    });
});

describe('validação de construtores estatísticos', () => {
    it('statisticalCharts.buildCandlestickSeries ignores records without OHLC values', () => {
        const result = statistical.buildCandlestickSeries(EMPTY_CANDLESTICK_DATA, CHART_CONFIG, CHART_THEME);
        expect(result.xAxis).toEqual({ data: [] });
        expect(result.series).toEqual([expect.objectContaining({ type: 'candlestick', data: [] })]);
    });
    it('statisticalCharts.buildCandlestickSeries maps host OHLC values to the chart order', () => {
        const result = statistical.buildCandlestickSeries([CANDLESTICK_INPUT], CHART_CONFIG, CHART_THEME);

        expect(result.xAxis).toEqual({ data: [CANDLESTICK_INPUT.name] });
        expect(result.series).toEqual([expect.objectContaining({ data: CANDLESTICK_EXPECTED })]);
    });
    it('statisticalCharts.buildBoxPlotSeries', () => {
        expect(statistical.buildBoxPlotSeries(CHART_DATA, CHART_CONFIG, CHART_THEME)).toMatchSnapshot();
    });
    it('statisticalCharts.buildBoxPlotSeries has no fabricated data when input is empty', () => {
        expect(statistical.buildBoxPlotSeries([], CHART_CONFIG, CHART_THEME).series).toEqual([
            expect.objectContaining({ type: 'boxplot', data: [] }),
        ]);
    });
    it('statisticalCharts.buildBoxPlotSeries accepts five host-provided summary values', () => {
        const result = statistical.buildBoxPlotSeries([BOX_PLOT_SUMMARY_INPUT], CHART_CONFIG, CHART_THEME);

        expect(result.series).toEqual([expect.objectContaining({ data: BOX_PLOT_EXPECTED })]);
    });
});

describe('chart builders — caracterização da saída', () => {
    it('advancedCharts.buildRadarConfig', () => {
        expect(advanced.buildRadarConfig(CHART_DATA, CHART_CONFIG, CHART_THEME)).toMatchSnapshot();
    });
    it('advancedCharts.buildGaugeSeries', () => {
        expect(advanced.buildGaugeSeries(CHART_DATA, CHART_CONFIG, CHART_THEME)).toMatchSnapshot();
    });
    it('advancedCharts.buildHeatmapSeries', () => {
        expect(advanced.buildHeatmapSeries(CHART_DATA, CHART_CONFIG, CHART_THEME)).toMatchSnapshot();
    });
    it('advancedCharts.buildFunnelSeries', () => {
        expect(advanced.buildFunnelSeries(CHART_DATA, CHART_CONFIG, CHART_THEME)).toMatchSnapshot();
    });
    it('advancedCharts.buildTreeMapSeries', () => {
        expect(advanced.buildTreeMapSeries(CHART_DATA, CHART_CONFIG, CHART_THEME)).toMatchSnapshot();
    });
    it('advancedCharts.buildSunburstSeries', () => {
        expect(advanced.buildSunburstSeries(CHART_DATA, CHART_CONFIG, CHART_THEME)).toMatchSnapshot();
    });
});
