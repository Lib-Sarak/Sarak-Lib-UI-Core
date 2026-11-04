/**
 * Cena de medição do SarakChartEngine (rc.5): funil, treemap e pizza com cor por item e rótulo, e barras
 * estreitas com valor em moeda. `?tema=<id>&modo=light|dark&largura=<px>`.
 *
 * O ECharts desenha em canvas: a medição lê a OPÇÃO resolvida e os elementos de texto já desenhados
 * (zrender), por `window.__plan147`. O `echarts` importado aqui é o mesmo módulo que o pacote usa.
 */
import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import * as echarts from 'echarts';
import { SarakChartEngine, SarakUIProvider, SARAK_THEME_PRESET_IDS, useSarakPreferences } from '@sarak/lib-ui-core';

const searchParams = new URLSearchParams(window.location.search);
const themeId = searchParams.get('tema') ?? 'sarak-sovereign';
const colorMode = searchParams.get('modo') === 'light' ? 'light' : 'dark';
const narrowWidth = Number(searchParams.get('largura') ?? '320');
const CHART_HEIGHT = 320;
const WIDE_WIDTH = 520;
const PROBE_TEXT_POINT = 0.5;

const STAGES = [
    { name: 'Propostas', v: 200000 },
    { name: 'Aprovadas', v: 120000 },
    { name: 'Faturadas', v: 64000 },
    { name: 'Recusadas', v: 9000 },
];
const SHARES = STAGES.map((stage) => ({ name: stage.name, value: stage.v }));
const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
    .map((name, index) => ({ name, value: 200000 - index * 15000 }));
const BRL = { type: 'currency', currency: 'BRL' } as const;
const NO_ANIMATION = { showAnimation: false } as const;
const STATUS_BY_NAME: Record<string, 'statusSuccessColor' | 'statusErrorColor' | undefined> = {
    Faturadas: 'statusSuccessColor', Recusadas: 'statusErrorColor',
};
const colorOf = (datum: Record<string, unknown>) => STATUS_BY_NAME[String(datum.name)];

type Loose = any;

function findInstance(id: string): Loose {
    const canvas = document.querySelector(`[data-probe="${id}"] canvas`);
    for (let node = canvas?.parentElement ?? null; node; node = node.parentElement) {
        const instance = echarts.getInstanceByDom(node as HTMLElement);
        if (instance) return instance;
    }
    return null;
}

const parseCss = (() => {
    const context = document.createElement('canvas').getContext('2d')!;
    return (color: string): [number, number, number, number] => {
        context.fillStyle = '#000';
        context.fillStyle = color;
        const value = context.fillStyle;
        if (value.startsWith('#')) {
            const hex = value.slice(1);
            return [0, 2, 4].map((at) => parseInt(hex.slice(at, at + 2), 16)).concat(1) as [number, number, number, number];
        }
        const parts = value.match(/[\d.]+/g)!.map(Number);
        return [parts[0], parts[1], parts[2], parts[3] ?? 1];
    };
})();

const channel = (value: number): number => {
    const c = value / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};
const luminance = ([r, g, b]: number[]): number => 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
const over = (top: number[], alpha: number, base: number[]): number[] => [0, 1, 2].map((i) => top[i] * alpha + base[i] * (1 - alpha));
const ratio = (a: number[], b: number[]): number => {
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
};

/** Fundo atrás do gráfico: compõe o `background-color` computado de cada ancestral até ficar opaco. */
function backdropOf(element: Element): number[] {
    let base = [255, 255, 255];
    const layers: number[][] = [];
    for (let node: Element | null = element; node; node = node.parentElement) {
        const [r, g, b, a] = parseCss(getComputedStyle(node).backgroundColor);
        if (a > 0) layers.push([r, g, b, a]);
        if (a >= 1) break;
    }
    for (const layer of layers.reverse()) base = over(layer, layer[3], base);
    return base;
}

function labelContrast(id: string): Array<{ name: string; ratio: number; label: string; fill: string; opacity: number }> {
    const chart = findInstance(id);
    const series = chart.getModel().getSeriesByIndex(0);
    const data = series.getData();
    const backdrop = backdropOf(document.querySelector(`[data-probe="${id}"]`)!);
    return Array.from({ length: data.count() }, (_, index) => {
        const style = data.getItemVisual(index, 'style') ?? {};
        const opacity = typeof style.opacity === 'number' ? style.opacity : 1;
        const [r, g, b, a] = parseCss(String(style.fill));
        const fill = over([r, g, b], a * opacity, backdrop);
        const label = String(data.getItemModel(index).get(['label', 'color']) ?? series.get(['label', 'color']));
        const [lr, lg, lb] = parseCss(label);
        return { name: String(data.getName(index)), ratio: ratio([lr, lg, lb], fill), label, fill: String(style.fill), opacity };
    });
}

function pieLabelContrast(id: string): number {
    const chart = findInstance(id);
    const label = String(chart.getModel().getSeriesByIndex(0).get(['label', 'color']));
    const [r, g, b] = parseCss(label);
    return ratio([r, g, b], backdropOf(document.querySelector(`[data-probe="${id}"]`)!));
}

interface Box { text: string; x: number; y: number; w: number; h: number }

function textBoxes(id: string): { width: number; height: number; boxes: Box[] } {
    const chart = findInstance(id);
    const list: Loose[] = chart.getZr().storage.getDisplayList(true);
    const boxes = list.filter((el) => el.style?.text && !el.ignore && el.style.opacity !== 0 && el.type === 'tspan')
        .map((el) => {
            const rect = el.getBoundingRect().clone();
            const transform = el.getComputedTransform?.();
            if (transform) rect.applyTransform(transform);
            return { text: String(el.style.text), x: rect.x, y: rect.y, w: rect.width, h: rect.height };
        });
    return { width: chart.getWidth(), height: chart.getHeight(), boxes };
}

function funnelTip(id: string): string {
    const chart = findInstance(id);
    chart.dispatchAction({ type: 'showTip', seriesIndex: 0, dataIndex: 0 });
    return (document.querySelector(`[data-probe="${id}"]`) as HTMLElement).innerText;
}

declare global {
    interface Window { __plan147: unknown }
}
window.__plan147 = { ids: SARAK_THEME_PRESET_IDS, labelContrast, pieLabelContrast, textBoxes, funnelTip, PROBE_TEXT_POINT };

const ModeDriver: React.FC = () => {
    const { updatePreferences } = useSarakPreferences();
    useEffect(() => { updatePreferences({ colorMode }); }, [updatePreferences]);
    return null;
};

const Box147: React.FC<{ id: string; width: number; children: React.ReactNode }> = ({ id, width, children }) => (
    <div data-probe={id} style={{ width, height: CHART_HEIGHT, marginBottom: 12 }}>{children}</div>
);

const App: React.FC = () => (
    <SarakUIProvider initialTheme={themeId} options={{ fonts: 'none' }}>
        <ModeDriver />
        <div style={{ padding: 16 }}>
            <Box147 id="funnel" width={WIDE_WIDTH}>
                <SarakChartEngine type="funnel" data={STAGES} valueFormat={BRL} getPointColor={colorOf} config={NO_ANIMATION} />
            </Box147>
            <Box147 id="treemap" width={WIDE_WIDTH}>
                <SarakChartEngine type="treemap" data={STAGES} getPointColor={colorOf} config={NO_ANIMATION} />
            </Box147>
            <Box147 id="pie" width={WIDE_WIDTH}>
                <SarakChartEngine type="pie" data={SHARES} pieLabel="name-percent" getPointColor={colorOf} config={NO_ANIMATION} />
            </Box147>
            <Box147 id="bar-narrow" width={narrowWidth}>
                <SarakChartEngine type="bar" data={MONTHS} valueFormat={BRL} config={NO_ANIMATION} />
            </Box147>
            <Box147 id="bar-horizontal" width={narrowWidth}>
                <SarakChartEngine type="bar" orientation="horizontal" data={MONTHS.slice(0, 5)} valueFormat={BRL} config={NO_ANIMATION} />
            </Box147>
        </div>
    </SarakUIProvider>
);

const container = document.getElementById('root');
if (!container) throw new Error('plan-147-graficos-entry: #root ausente no harness.');
createRoot(container).render(<App />);
