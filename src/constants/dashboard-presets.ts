/**
 * Sarak Dashboard & Chart Presets (v1.0)
 * 
 * Define a estética dos gráficos e a organização dos widgets.
 */

export interface DashboardPreset {
    id: string;
    title: string;
    description: string;
    tokens: {
        chartStyle: 'linear' | 'curved' | 'stepped';
        chartFillOpacity: number;
        showGridLines: boolean;
        widgetSpacing: number;
        showTooltips: boolean;
        chartAnimationType: 'spring' | 'linear' | 'none';
    };
}

export const DASHBOARD_PRESETS: DashboardPreset[] = [
    {
        id: 'analytic-precision',
        title: 'Analytic Precision',
        description: 'Linhas retas e grids técnicos para máxima precisão de leitura de dados.',
        tokens: {
            chartStyle: 'linear',
            chartFillOpacity: 0.05,
            showGridLines: true,
            widgetSpacing: 8,
            showTooltips: true,
            chartAnimationType: 'linear'
        }
    },
    {
        id: 'modern-pulse',
        title: 'Modern Pulse',
        description: 'Curvas suaves e preenchimentos orgânicos para uma visualização fluida.',
        tokens: {
            chartStyle: 'curved',
            chartFillOpacity: 0.2,
            showGridLines: false,
            widgetSpacing: 20,
            showTooltips: true,
            chartAnimationType: 'spring'
        }
    },
    {
        id: 'brutalist-data',
        title: 'Brutalist Data',
        description: 'Foco em contrastes altos e degraus, eliminando suavizações desnecessárias.',
        tokens: {
            chartStyle: 'stepped',
            chartFillOpacity: 0,
            showGridLines: true,
            widgetSpacing: 12,
            showTooltips: false,
            chartAnimationType: 'none'
        }
    }
];
