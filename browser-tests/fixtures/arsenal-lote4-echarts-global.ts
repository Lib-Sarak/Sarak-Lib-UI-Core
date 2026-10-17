interface BrowserEChartsGlobal {
    graphic: Record<string, unknown>;
}

declare global {
    interface Window {
        echarts: BrowserEChartsGlobal;
    }
}

const echarts = window.echarts;

export const graphic = echarts.graphic;
export default echarts;
