import { ComponentSchema } from '../types';

/**
 * Mapeamento 100% Granular: Atmosfera Global
 */
export const AtmosphereSchema: ComponentSchema = {
    id: 'atmosphere',
    label: 'Atmosfera & Efeitos',
    tokens: [
        {
            id: 'primaryColor',
            label: 'Cor Primária',
            category: 'Cores',
            type: 'color',
            defaultValue: '#00f2ff',
            cssVars: ['--theme-primary']
        },
        {
            id: 'glassOpacity',
            label: 'Opacidade do Vidro',
            category: 'Efeitos',
            type: 'slider',
            min: 0,
            max: 1,
            step: 0.05,
            defaultValue: 0.4,
            cssVars: ['--glass-opacity']
        },
        {
            id: 'glassBlur',
            label: 'Desfoque (Blur)',
            category: 'Efeitos',
            type: 'slider',
            unit: 'px',
            min: 0,
            max: 60,
            defaultValue: 10,
            cssVars: ['--glass-blur']
        },
        {
            id: 'texture',
            label: 'Textura de Atmosfera',
            category: 'Texturas',
            type: 'select',
            options: [
                { id: 'none', label: 'Nenhuma' },
                { id: 'dots', label: 'Pontos' },
                { id: 'grid', label: 'Grade' },
                { id: 'noise', label: 'Ruído' }
            ],
            defaultValue: 'none',
            cssVars: ['--bg-texture']
        },
        {
            id: 'secondaryColor',
            label: 'Cor Secundária',
            category: 'Cores',
            type: 'color',
            defaultValue: '#ff00e5',
            cssVars: ['--theme-secondary']
        },
        {
            id: 'successColor',
            label: 'Cor de Sucesso',
            category: 'Cores Semânticas',
            type: 'color',
            defaultValue: '#10b981',
            cssVars: ['--theme-success']
        },
        {
            id: 'warningColor',
            label: 'Cor de Alerta',
            category: 'Cores Semânticas',
            type: 'color',
            defaultValue: '#f59e0b',
            cssVars: ['--theme-warning']
        },
        {
            id: 'errorColor',
            label: 'Cor de Erro',
            category: 'Cores Semânticas',
            type: 'color',
            defaultValue: '#ef4444',
            cssVars: ['--theme-error']
        },
        {
            id: 'scaleRatio',
            label: 'Razão de Escala (Zoom)',
            category: 'Percepção',
            type: 'slider',
            min: 0.8,
            max: 1.2,
            step: 0.01,
            defaultValue: 1.0,
            cssVars: ['--theme-scale-ratio']
        },
        {
            id: 'contrastCurve',
            label: 'Curva de Contraste',
            category: 'Percepção',
            type: 'slider',
            min: 0.5,
            max: 1.5,
            step: 0.05,
            defaultValue: 1.0,
            cssVars: ['--theme-contrast-curve']
        },
        {
            id: 'spotlightEnabled',
            label: 'Efeito Spotlight',
            category: 'Interação Avançada',
            type: 'boolean',
            defaultValue: true
        },
        {
            id: 'borderBeamEnabled',
            label: 'Borda com Feixe Laser',
            category: 'Interação Avançada',
            type: 'boolean',
            defaultValue: false
        }
    ]
};
