import { ComponentSchema } from '../types';

/**
 * Interface de Valores: Atmosfera Global
 */
export interface AtmosphereDesign {
    primaryColor?: string;
    secondaryColor?: string;
    successColor?: string;
    warningColor?: string;
    errorColor?: string;
    glassOpacity?: number;
    glassBlur?: number;
    texture?: string;
    textureOpacity?: number;
    scaleRatio?: number;
    contrastCurve?: number;
    spotlightEnabled?: boolean;
    borderBeamEnabled?: boolean;
    mode?: 'light' | 'dark';
    bodyColor?: string; // Cor do fundo da página
    titleColor?: string; // Cor dos títulos principais
    primary?: string; // Alias para compatibilidade com presets de cores
}

/**
 * Interface de Valores: Cores (Subset de Atmosfera)
 */
export type ColorDesign = AtmosphereDesign;

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
            id: 'bodyColor',
            label: 'Cor do Fundo (Body)',
            category: 'Cores',
            type: 'color',
            defaultValue: '#0f172a',
            cssVars: ['--theme-body']
        },
        {
            id: 'titleColor',
            label: 'Cor do Texto/Títulos',
            category: 'Cores',
            type: 'color',
            defaultValue: '#ffffff',
            cssVars: ['--theme-title']
        },
        {
            id: 'glassOpacity',
            label: 'Opacidade do Vidro',
            category: 'Efeitos',
            type: 'slider',
            constraints: {
                min: 0,
                max: 1,
                step: 0.05,
            },
            defaultValue: 0.4,
            cssVars: ['--glass-opacity']
        },
        {
            id: 'glassBlur',
            label: 'Desfoque (Blur)',
            category: 'Efeitos',
            type: 'slider',
            unit: 'px',
            constraints: {
                min: 0,
                max: 60,
            },
            defaultValue: 10,
            cssVars: ['--glass-blur']
        },
        {
            id: 'texture',
            label: 'Textura de Atmosfera',
            category: 'Texturas',
            type: 'select',
            constraints: {
                options: [
                    { id: 'none', label: 'Nenhuma' },
                    { id: 'grid', label: 'Grid Tech' },
                    { id: 'squares', label: 'Geometry Squares' },
                    { id: 'honeycomb', label: 'Hex Honeycomb' },
                    { id: 'isometric', label: '3D Isometric' },
                    { id: 'stripes', label: 'Diagonal Stripes' },
                    { id: 'pinstripes', label: 'Vertical Pinstripes' },
                    { id: 'crosshatch', label: 'Diagonal Crosshatch' },
                    { id: 'blueprint', label: 'Engineering' },
                    { id: 'dots', label: 'Dots Clean' },
                    { id: 'micro-dots', label: 'Micro Dots' },
                    { id: 'stars', label: 'Star Field' },
                    { id: 'noise', label: 'Grain Noise' },
                    { id: 'circuit', label: 'Circuit Tech' },
                    { id: 'radar', label: 'Sonar / Radar' },
                    { id: 'carbon', label: 'Carbon Fiber' },
                    { id: 'brushed', label: 'Brushed Metal' },
                    { id: 'silk', label: 'Silk Flow' },
                    { id: 'frosted', label: 'Frosted Glass' },
                    { id: 'prestige', label: 'Prestige Pattern' },
                    { id: 'paper', label: 'Vintage Paper' },
                    { id: 'mesh', label: 'Mesh Gradient' },
                    { id: 'aurora', label: 'Aurora Deep' },
                    { id: 'aurora-classic', label: 'Aurora Classic' }
                ],
            },
            defaultValue: 'none',
            cssVars: ['--bg-texture']
        },
        {
            id: 'textureOpacity',
            label: 'Visibilidade da Textura',
            category: 'Texturas',
            type: 'slider',
            constraints: {
                min: 0,
                max: 1,
                step: 0.01,
            },
            defaultValue: 0.08,
            cssVars: ['--texture-opacity']
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
            constraints: {
                min: 0.8,
                max: 1.2,
                step: 0.01,
            },
            defaultValue: 1.0,
            cssVars: ['--theme-scale-ratio']
        },
        {
            id: 'contrastCurve',
            label: 'Curva de Contraste',
            category: 'Percepção',
            type: 'slider',
            constraints: {
                min: 0.5,
                max: 1.5,
                step: 0.05,
            },
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
        },
        {
            id: 'mode',
            label: 'Modo de Aparência',
            category: 'Global',
            type: 'select',
            constraints: {
                options: [
                    { id: 'dark', label: 'Dark Mode (Escuro)' },
                    { id: 'light', label: 'Light Mode (Claro)' }
                ],
            },
            defaultValue: 'dark'
        }
    ]
};
