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
        dashboardTemplate: 'executive' | 'monitoring' | 'analytics' | 'technical' | 'minimal';
        chartStyle: 'standard' | 'glow' | 'tech' | 'minimal';
        chartFillOpacity: number;
        showGridLines: boolean;
        widgetSpacing: number;
        dashboardDensity?: number;
    };
}

export const DASHBOARD_PRESETS: DashboardPreset[] = [
    {
        id: 'executive-pro',
        title: 'Executive Insight',
        description: 'Visão estratégica limpa com foco em KPIs e metas globais.',
        tokens: {
            dashboardTemplate: 'executive',
            chartStyle: 'standard',
            chartFillOpacity: 0.1,
            showGridLines: false,
            widgetSpacing: 24,
            dashboardDensity: 1.0
        }
    },
    {
        id: 'monitoring-dense',
        title: 'System Overseer',
        description: 'Alta densidade de telemetria em tempo real para infraestrutura crítica.',
        tokens: {
            dashboardTemplate: 'monitoring',
            chartStyle: 'tech',
            chartFillOpacity: 0.05,
            showGridLines: true,
            widgetSpacing: 12,
            dashboardDensity: 0.8
        }
    },
    {
        id: 'cyber-telemetry',
        title: 'Cyber Telemetry',
        description: 'Estilo Industrial/Matrix com foco em dados brutos e telemetria de sistema.',
        tokens: {
            dashboardTemplate: 'technical',
            chartStyle: 'glow',
            chartFillOpacity: 0.15,
            showGridLines: true,
            widgetSpacing: 8,
            dashboardDensity: 0.7
        }
    },
    {
        id: 'minimal-focus',
        title: 'Minimal Focus',
        description: 'Foco total no dado bruto, eliminando qualquer ruído visual desnecessário.',
        tokens: {
            dashboardTemplate: 'minimal',
            chartStyle: 'minimal',
            chartFillOpacity: 0,
            showGridLines: false,
            widgetSpacing: 32,
            dashboardDensity: 1.2
        }
    }
];
