import { ComponentSchema } from '../types';

/**
 * SCHEMA: ACESSIBILIDADE & ENGENHARIA
 * Governa o comportamento técnico, camadas e performance da UI.
 */
export const EngineeringSchema: ComponentSchema = {
    id: 'engineering',
    label: 'Acessibilidade e Camadas',
    pilar: 'systems',
    subcategory: 'Acessibilidade e Camadas',
    tokens: [
        {
            id: 'focusRingWidth',
            label: 'Largura do Anel de Foco',
            category: 'Acessibilidade',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 6 },
            defaultValue: 2,
            cssVars: ['--sarak-focus-width']
        },
        {
            id: 'reducedMotion',
            label: 'Reduzir Movimento',
            category: 'Performance',
            type: 'boolean',
            defaultValue: false,
            cssVars: ['--sarak-reduced-motion']
        },
        {
            id: 'zIndexModal',
            label: 'Camada: Modais',
            category: 'Camadas (Z-Index)',
            type: 'number',
            defaultValue: 1000,
            cssVars: ['--sarak-z-modal']
        },
        {
            id: 'zIndexToast',
            label: 'Camada: Notificações',
            category: 'Camadas (Z-Index)',
            type: 'number',
            defaultValue: 2000,
            cssVars: ['--sarak-z-toast']
        }
    ]
};
