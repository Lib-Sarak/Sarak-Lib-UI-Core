import { BarChart3, LineChart, PieChart, Activity, Gauge, Grid3X3, ScatterChart } from 'lucide-react';

export interface ChartPreset {
    id: string;
    name: string;
    description: string;
    icon: any;
    design: {
        chartType: string;
    };
}

export const CHART_TYPES_PRESETS: ChartPreset[] = [
    { id: 'area', name: 'Area Chart', icon: Activity, description: 'Fluxo contínuo e tendências de volume', design: { chartType: 'area' } },
    { id: 'bar', name: 'Bar Chart', icon: BarChart3, description: 'Comparativos categóricos e rankings', design: { chartType: 'bar' } },
    { id: 'pie', name: 'Pie / Donut', icon: PieChart, description: 'Distribuição e composição de partes', design: { chartType: 'pie' } },
    { id: 'line', name: 'Line Chart', icon: LineChart, description: 'Séries temporais e flutuações', design: { chartType: 'line' } },
    { id: 'gauge', name: 'Performance Gauge', icon: Gauge, description: 'Telemetria de KPIs e status crítico', design: { chartType: 'gauge' } },
    { id: 'radar', name: 'Radar / Spider', icon: Grid3X3, description: 'Análise de múltiplos atributos', design: { chartType: 'radar' } },
    { id: 'heatmap', name: 'Activity Heatmap', icon: Grid3X3, description: 'Densidade de eventos e calor', design: { chartType: 'heatmap' } },
    { id: 'scatter', name: 'Scatter Plot', icon: ScatterChart, description: 'Correlação e dispersão de pontos', design: { chartType: 'scatter' } },
    { id: 'funnel', name: 'Sales Funnel', icon: Activity, description: 'Conversão de etapas e afunilamento', design: { chartType: 'funnel' } },
    { id: 'treemap', name: 'TreeMap Engine', icon: Grid3X3, description: 'Hierarquia de dados e proporções', design: { chartType: 'treemap' } },
    { id: 'candlestick', name: 'Technical Chart', icon: BarChart3, description: 'Variação de intervalos e amplitude', design: { chartType: 'candlestick' } },
    { id: 'sunburst', name: 'Sunburst Radial', icon: PieChart, description: 'Níveis hierárquicos concêntricos', design: { chartType: 'sunburst' } },
    { id: 'histogram', name: 'Histogram', icon: BarChart3, description: 'Distribuição de frequência contínua', design: { chartType: 'histogram' } },
    { id: 'boxplot', name: 'BoxPlot / Whisker', icon: Grid3X3, description: 'Resumo estatístico e quartis', design: { chartType: 'boxplot' } }
];
