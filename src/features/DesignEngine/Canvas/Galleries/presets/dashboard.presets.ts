export const DASHBOARD_PRESETS = [
    {
        id: 'smooth-line',
        title: 'Smooth Analytics',
        description: 'Linhas Orgânicas & Glow',
        tokens: { chartType: 'line', chartSmoothing: true, chartThickness: 3, chartStyle: 'modern' }
    },
    {
        id: 'industrial-bar',
        title: 'Industrial Bars',
        description: 'Geometria Rígida',
        tokens: { chartType: 'bar', chartSmoothing: false, chartThickness: 1, chartStyle: 'corporate' }
    },
    {
        id: 'high-freq-webgl',
        title: 'High-Freq WebGL',
        description: 'Tempo Real & Densidade',
        tokens: { chartType: 'area', chartSmoothing: true, chartThickness: 1, chartStyle: 'cyber' }
    },
    {
        id: 'minimal-stats',
        title: 'Minimal Metrics',
        description: 'Limpo & Informativo',
        tokens: { chartType: 'pie', chartSmoothing: false, chartThickness: 2, chartStyle: 'minimal' }
    }
];
