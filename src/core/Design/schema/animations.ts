import { ComponentSchema } from '../types';

/**
 * Interface de Valores: Efeitos & Animações
 */
export interface AnimationDesign {
    animationSpeed?: 'fast' | 'normal' | 'slow';
    animationStyle?: 'standard' | 'fluid' | 'minimal' | 'perspective';
    shadowIntensity?: number;
    isGeometricCut?: boolean;
    interfaceElasticity?: number;
    pageTransition?: string;
}

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
            type: 'select',
            constraints: {
                options: [
                    { id: 'fast', label: 'Explosiva (Fast)' },
                    { id: 'normal', label: 'Suave (Normal)' },
                    { id: 'slow', label: 'Cinemática (Slow)' }
                ],
            },
            defaultValue: 'normal'
        },
        {
            id: 'animationStyle',
            label: 'Estilo de Movimento',
            category: 'Animações',
            type: 'select',
            constraints: {
                options: [
                    { id: 'standard', label: 'Linear / Padrão' },
                    { id: 'fluid', label: 'Orgânico / Elástico' },
                    { id: 'minimal', label: 'Discreto / Minimal' },
                    { id: 'perspective', label: '3D Perspective' }
                ],
            },
            defaultValue: 'standard'
        },
        {
            id: 'shadowIntensity',
            label: 'Intensidade de Sombra',
            category: 'Efeitos',
            type: 'slider',
            constraints: {
                min: 0,
                max: 1,
                step: 0.05,
            },
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
            constraints: {
                min: 0,
                max: 1,
                step: 0.1,
            },
            defaultValue: 0.5
        },
        {
            id: 'pageTransition',
            label: 'Transição de Página',
            category: 'Animações',
            type: 'select',
            constraints: {
                options: [
                    { id: 'none', label: 'Nenhuma' },
                    { id: 'fade', label: 'Smooth Fade' },
                    { id: 'slideUp', label: 'Slide Up' },
                    { id: 'slideLeft', label: 'Slide Left' },
                    { id: 'slideDown', label: 'Slide Down' },
                    { id: 'scale', label: 'Zoom Bounce' },
                    { id: 'blur', label: 'Atmospheric' },
                    { id: 'perspective', label: '3D Perspective' },
                    { id: 'flip', label: '3D Flip' },
                    { id: 'elastic', label: 'Elastic Tech' }
                ],
            },
            defaultValue: 'fade'
        }
    ]
};
