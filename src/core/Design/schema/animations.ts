import { ComponentSchema } from '../types';

/**
 * Mapeamento 100% Granular: Efeitos & Animações
 */
export const AnimationSchema: ComponentSchema = {
    id: 'animations',
    label: 'Efeitos & Animações',
    tokens: [
        {
            id: 'animationSpeed',
            label: 'Velocidade Global',
            category: 'Animações',
            type: 'slider',
            unit: 'ms',
            min: 0,
            max: 1000,
            defaultValue: 300,
            cssVars: ['--anim-speed']
        },
        {
            id: 'shadowIntensity',
            label: 'Intensidade de Sombra',
            category: 'Efeitos',
            type: 'slider',
            min: 0,
            max: 1,
            step: 0.05,
            defaultValue: 0.3,
            cssVars: ['--shadow-intensity']
        },
        {
            id: 'isGeometricCut',
            label: 'Corte Geométrico (Bevel)',
            category: 'Efeitos',
            type: 'boolean',
            defaultValue: false
        },
        {
            id: 'interfaceElasticity',
            label: 'Elasticidade da Interface',
            category: 'Física',
            type: 'slider',
            min: 0,
            max: 1,
            step: 0.1,
            defaultValue: 0.5
        }
    ]
};
