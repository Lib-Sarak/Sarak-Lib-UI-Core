import { ComponentSchema } from '../types';

/**
 * SCHEMA: ANIMATIONS (MOTION)
 * Define o ritmo, curvas de easing e durações de toda a interface.
 */
export const AnimationSchema: ComponentSchema = {
    id: 'animations',
    label: 'Transições e Animações',
    tokens: [
        // --- TIMING ---
        {
            id: 'animInstant',
            label: 'Duração: Instante',
            type: 'slider',
            unit: 'ms',
            constraints: { min: 0, max: 200, step: 10 },
            defaultValue: 100,
            cssVars: ['--sarak-anim-instant']
        },
        {
            id: 'animFast',
            label: 'Duração: Rápida',
            type: 'slider',
            unit: 'ms',
            constraints: { min: 50, max: 400, step: 10 },
            defaultValue: 200,
            cssVars: ['--sarak-anim-fast']
        },
        {
            id: 'animNormal',
            label: 'Duração: Normal',
            type: 'slider',
            unit: 'ms',
            constraints: { min: 100, max: 800, step: 10 },
            defaultValue: 300,
            cssVars: ['--sarak-anim-normal']
        },
        {
            id: 'animSlow',
            label: 'Duração: Lenta',
            type: 'slider',
            unit: 'ms',
            constraints: { min: 200, max: 2000, step: 50 },
            defaultValue: 500,
            cssVars: ['--sarak-anim-slow']
        },

        // --- EASING ---
        {
            id: 'easeMain',
            label: 'Curva: Padrão (Main)',
            type: 'select',
            constraints: {
                options: [
                    { id: 'cubic-bezier(0.4, 0, 0.2, 1)', label: 'Standard' },
                    { id: 'cubic-bezier(0.6, 0.05, 0.01, 0.9)', label: 'Smooth Industrial' },
                    { id: 'cubic-bezier(0.4, 0, 1, 1)', label: 'Accelerated' },
                    { id: 'cubic-bezier(0, 0, 0.2, 1)', label: 'Decelerated' }
                ]
            },
            defaultValue: 'cubic-bezier(0.4, 0, 0.2, 1)',
            cssVars: ['--sarak-ease-main']
        },
        {
            id: 'easeOut',
            label: 'Curva: Saída Suave',
            type: 'select',
            constraints: {
                options: [
                    { id: 'cubic-bezier(0.4, 0, 0.2, 1)', label: 'Standard' },
                    { id: 'cubic-bezier(0.23, 1, 0.32, 1)', label: 'Quintic' },
                    { id: 'cubic-bezier(0.19, 1, 0.22, 1)', label: 'Expo' }
                ]
            },
            defaultValue: 'cubic-bezier(0, 0, 0.2, 1)',
            cssVars: ['--sarak-ease-out']
        },

        // --- BEHAVIOR ---
        {
            id: 'animEnabled',
            label: 'Ativar Movimentos',
            type: 'boolean',
            defaultValue: true,
            cssVars: ['--sarak-anim-enabled']
        }
    ]
};
