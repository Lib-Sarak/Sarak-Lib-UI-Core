import React from 'react';
import { createRoot } from 'react-dom/client';
import * as echarts from 'echarts';
import { SarakChartEngine, SarakUIProvider, useSarakPreferences } from '@sarak/lib-ui-core';
import { useEffect } from 'react';

const params = new URLSearchParams(window.location.search);
const colorMode = params.get('modo') === 'light' ? 'light' : 'dark';
const screenWidth = 340;
const LARGE_FRAME = { width: 600, height: 300 };
const TYPES = ['line', 'area', 'bar', 'pie', 'radar', 'scatter', 'heatmap', 'gauge'] as const;
const series = [40, 80, 55, 95, 70, 30, 85].map((value, index) => ({ name: `${index + 1}`, value }));
const shares = [{ name: 'A', value: 45 }, { name: 'B', value: 25 }, { name: 'C', value: 20 }, { name: 'D', value: 10 }];
const heatmap = Array.from({ length: 25 }, (_, index) => ({ name: `${index}`, value: (index * 137) % 1000 }));
const dataByType = { line: series, area: series, bar: series, pie: shares, radar: series, scatter: series, heatmap, gauge: [{ name: 'Core', value: 65 }] };

declare global { interface Window { __chartAreaProbe: { measure: () => unknown } } }

function getChart(type: string): any {
    const canvas = document.querySelector(`[data-chart="${type}"] canvas`);
    for (let node = canvas?.parentElement ?? null; node; node = node.parentElement) {
        const instance = echarts.getInstanceByDom(node as HTMLElement);
        if (instance) return instance;
    }
    throw new Error(`Chart ${type} is not mounted.`);
}

function measureType(type: typeof TYPES[number], frameId: string, width: number, height: number) {
    const chart = getChart(frameId);
    const model = chart.getModel().getSeriesByIndex(0);
    const seriesView = chart.getViewOfSeriesModel(model);
    const rect = seriesView.group.getBoundingRect().clone();
    const transform = seriesView.group.getComputedTransform?.();
    if (transform) rect.applyTransform(transform);
    const isCartesian = ['line', 'area', 'bar', 'scatter', 'heatmap'].includes(type);
    const grid = isCartesian ? chart.getModel().getComponent('grid') : undefined;
    const drawn = isCartesian ? grid.coordinateSystem.getRect().clone() : rect;
    const frame = document.querySelector(`[data-chart="${frameId}"]`)!.getBoundingClientRect();
    const textElements: Array<{ text: string; x: number; y: number; width: number; height: number }> = [];
    if (type === 'radar') {
        const radarModel = chart.getModel().getComponent('radar');
        const radarView = chart.getViewOfComponentModel(radarModel);
        radarView.group.traverse((element: any) => {
            if (element.type !== 'text') return;
            const labelRect = element.getBoundingRect().clone();
            const labelTransform = element.getComputedTransform?.();
            if (labelTransform) labelRect.applyTransform(labelTransform);
            textElements.push({ text: String(element.style?.text ?? ''), x: labelRect.x, y: labelRect.y, width: labelRect.width, height: labelRect.height });
        });
    }
    const labels = type === 'radar'
        ? textElements.filter((element) => /^[1-7]$/.test(element.text.trim()))
        : undefined;
    const yAxis = isCartesian ? chart.getModel().getComponent('yAxis') : undefined;
    const yAxisExtent = yAxis?.axis?.scale?.getExtent?.();
    return {
        type,
        frame: { width: frame.width, height: frame.height },
        drawn: { x: drawn.x, y: drawn.y, width: drawn.width, height: drawn.height },
        fraction: { width: drawn.width / frame.width, height: drawn.height / frame.height },
        chartSize: { width: chart.getWidth(), height: chart.getHeight() },
        ...(labels ? { labels } : {}),
        ...(yAxisExtent ? { yAxisExtent } : {}),
    };
}

window.__chartAreaProbe = {
    measure: () => TYPES.flatMap((type) => [
        measureType(type, type, screenWidth, 192),
        measureType(type, `${type}-large`, LARGE_FRAME.width, LARGE_FRAME.height),
    ]),
};

const ModeDriver: React.FC = () => {
    const { updatePreferences } = useSarakPreferences();
    useEffect(() => { updatePreferences({ colorMode }); }, [updatePreferences]);
    return null;
};

const Chart: React.FC<{ type: typeof TYPES[number]; width: number; height: number; large?: boolean }> = ({ type, width, height, large = false }) => (
    <div data-chart={large ? `${type}-large` : type} style={{ width, height }}>
        <SarakChartEngine type={type} data={dataByType[type]} config={{ xAxisKey: 'name', dataKey: 'value', showAnimation: false }} height={height} />
    </div>
);

const App: React.FC = () => (
    <SarakUIProvider options={{ fonts: 'none' }}>
        <ModeDriver />
        <main style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 340px)', gap: 16, padding: 16 }}>
            {TYPES.map((type) => <Chart key={type} type={type} width={screenWidth} height={192} />)}
        </main>
        <section style={{ padding: 16 }}>
            {TYPES.map((type) => <Chart key={`${type}-large`} type={type} width={LARGE_FRAME.width} height={LARGE_FRAME.height} large />)}
        </section>
    </SarakUIProvider>
);

const root = document.getElementById('root');
if (!root) throw new Error('graficos-ocupam-o-quadro-entry: #root ausente no harness.');
createRoot(root).render(<App />);
