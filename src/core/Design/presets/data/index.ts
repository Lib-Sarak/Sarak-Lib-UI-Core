/**
 * Sarak Data & Chart Presets (v12.0)
 */

export interface DataPreset {
    id: string;
    name: string;
    description: string;
}

export const DASHBOARD_TEMPLATES: DataPreset[] = [
    { id: 'executive', name: 'Executive Summary', description: 'Visão limpa e estratégica' },
    { id: 'monitoring', name: 'Real-time Monitoring', description: 'Alta densidade de telemetria' },
    { id: 'analytics', name: 'Deep Analytics', description: 'Análise massiva de dados' },
    { id: 'technical', name: 'System Telemetry', description: 'Estilo Industrial / OS' },
    { id: 'minimal', name: 'Minimalist View', description: 'Foco total no dado bruto' }
];

export const CHART_PRESETS = [
    { id: 'standard', name: 'Standard Sarak', description: 'Equilibrado e limpo' },
    { id: 'glow', name: 'Neon Glow', description: 'Efeito vibrante e moderno' },
    { id: 'tech', name: 'Industrial Tech', description: 'Angular e denso' },
    { id: 'minimal', name: 'Ultra Minimal', description: 'Sem adornos' }
];

// Alias para o hub de presets
export const DATA_PRESETS: DataPreset[] = DASHBOARD_TEMPLATES;
