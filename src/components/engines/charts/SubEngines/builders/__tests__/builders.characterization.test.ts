// @vitest-environment node
import { describe, it, expect } from 'vitest';
import * as basic from '../basicCharts';
import * as advanced from '../advancedCharts';
import * as statistical from '../statisticalCharts';
import type { ChartTheme } from '../types';

/**
 * Rede de caracterização (Spec 62, Regra 1) — captura a saída ATUAL dos
 * builders de chart antes do refactor de tipos. A saída visual (objeto de
 * opção ECharts) deve permanecer idêntica após a tipagem.
 */

const data = [
    { name: 'A', value: 10, v: 100, open: 98, high: 108, low: 95, close: 105, boxplot: [1, 2, 3, 4, 5] },
    { name: 'B', value: 20, v: 200, open: 105, high: 112, low: 101, close: 109, boxplot: [2, 3, 4, 5, 6] },
    { name: 'C', value: 30, v: 300, open: 109, high: 116, low: 103, close: 107, boxplot: [3, 4, 5, 6, 7] },
];

const config = { dataKey: 'value', xAxisKey: 'name' };

// `baseOption` não é lido pelos builders (só pelo engine); fixture mínima
// suficiente, tipada via cast para o contrato real do tema.
const theme = {
    baseOption: {},
    primaryColor: '#3b82f6',
    primaryRGB: '59, 130, 246',
    secondaryColor: '#8b5cf6',
    secondaryRGB: '139, 92, 246',
    isDark: true,
    bodyFont: 'Inter',
    headingFont: 'Inter',
} as unknown as ChartTheme;

describe('chart builders — caracterização da saída', () => {
    it('basicCharts.buildBarSeries', () => {
        expect(basic.buildBarSeries(data, config, theme)).toMatchSnapshot();
    });
    it('basicCharts.buildLineSeries (line)', () => {
        expect(basic.buildLineSeries(data, config, theme, false)).toMatchSnapshot();
    });
    it('basicCharts.buildLineSeries (area)', () => {
        expect(basic.buildLineSeries(data, config, theme, true)).toMatchSnapshot();
    });
    it('basicCharts.buildPieSeries', () => {
        expect(basic.buildPieSeries(data, config, theme)).toMatchSnapshot();
    });

    it('statisticalCharts.buildScatterSeries', () => {
        expect(statistical.buildScatterSeries(data, config, theme)).toMatchSnapshot();
    });
    it('statisticalCharts.buildCandlestickSeries', () => {
        expect(statistical.buildCandlestickSeries(data, config, theme)).toMatchSnapshot();
    });
    it('statisticalCharts.buildCandlestickSeries ignores records without OHLC values', () => {
        const result = statistical.buildCandlestickSeries([{ name: 'A', value: 10 }], config, theme);
        expect(result.xAxis).toEqual({ data: [] });
        expect(result.series).toEqual([expect.objectContaining({ type: 'candlestick', data: [] })]);
    });
    it('statisticalCharts.buildCandlestickSeries maps host OHLC values to the chart order', () => {
        const item = { name: 'Sample', open: 10, high: 15, low: 8, close: 13 };
        const result = statistical.buildCandlestickSeries([item], config, theme);

        expect(result.xAxis).toEqual({ data: ['Sample'] });
        expect(result.series).toEqual([expect.objectContaining({ data: [[10, 13, 8, 15]] })]);
    });
    it('statisticalCharts.buildBoxPlotSeries', () => {
        expect(statistical.buildBoxPlotSeries(data, config, theme)).toMatchSnapshot();
    });
    it('statisticalCharts.buildBoxPlotSeries has no fabricated data when input is empty', () => {
        expect(statistical.buildBoxPlotSeries([], config, theme).series).toEqual([
            expect.objectContaining({ type: 'boxplot', data: [] }),
        ]);
    });
    it('statisticalCharts.buildBoxPlotSeries accepts five host-provided summary values', () => {
        const item = { min: 1, q1: 2, median: 3, q3: 4, max: 5 };
        const result = statistical.buildBoxPlotSeries([item], config, theme);

        expect(result.series).toEqual([expect.objectContaining({ data: [[1, 2, 3, 4, 5]] })]);
    });
    it('statisticalCharts.buildHistogramSeries', () => {
        expect(statistical.buildHistogramSeries(data, config, theme)).toMatchSnapshot();
    });

    it('advancedCharts.buildRadarConfig', () => {
        expect(advanced.buildRadarConfig(data, config, theme)).toMatchSnapshot();
    });
    it('advancedCharts.buildGaugeSeries', () => {
        expect(advanced.buildGaugeSeries(data, config, theme)).toMatchSnapshot();
    });
    it('advancedCharts.buildHeatmapSeries', () => {
        expect(advanced.buildHeatmapSeries(data, config, theme)).toMatchSnapshot();
    });
    it('advancedCharts.buildFunnelSeries', () => {
        expect(advanced.buildFunnelSeries(data, config, theme)).toMatchSnapshot();
    });
    it('advancedCharts.buildTreeMapSeries', () => {
        expect(advanced.buildTreeMapSeries(data, config, theme)).toMatchSnapshot();
    });
    it('advancedCharts.buildSunburstSeries', () => {
        expect(advanced.buildSunburstSeries(data, config, theme)).toMatchSnapshot();
    });
});
