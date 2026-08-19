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
    { name: 'A', value: 10, v: 100 },
    { name: 'B', value: 20, v: 200 },
    { name: 'C', value: 30, v: 300 },
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
    it('statisticalCharts.buildBoxPlotSeries', () => {
        expect(statistical.buildBoxPlotSeries(data, config, theme)).toMatchSnapshot();
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
