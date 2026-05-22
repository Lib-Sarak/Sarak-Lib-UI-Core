import { ComponentSchema } from '../types';

/**
 * MOTION SCHEMA (v13.0)
 * Controla a "alma" do sistema. Define como as coisas se movem,
 * a velocidade da resposta e a curva de aceleração (física).
 */
export const MotionSchema: ComponentSchema = {
    id: 'motion',
    label: 'Movimento e Física',
    tokens: [
        // --- CURVAS DE FÍSICA ---
        {
            id: 'motionEaseMain',
            label: 'Curva Master (Ease)',
            type: 'text',
            defaultValue: 'cubic-bezier(0.4, 0, 0.2, 1)',
            cssVars: ['--sarak-motion-ease-main']
        },
        {
            id: 'motionEaseOut',
            label: 'Curva de Saída (Deceleration)',
            type: 'text',
            defaultValue: 'cubic-bezier(0, 0, 0.2, 1)',
            cssVars: ['--sarak-motion-ease-out']
        },
        {
            id: 'motionEaseIn',
            label: 'Curva de Entrada (Acceleration)',
            type: 'text',
            defaultValue: 'cubic-bezier(0.4, 0, 1, 1)',
            cssVars: ['--sarak-motion-ease-in']
        },

        // --- DURAÇÕES ---
        {
            id: 'motionDurationInstant',
            label: 'Duração Instantânea',
            type: 'slider',
            unit: 's',
            constraints: { min: 0, max: 0.2, step: 0.01 },
            defaultValue: 0.1,
            cssVars: ['--sarak-motion-dur-instant']
        },
        {
            id: 'motionDurationFast',
            label: 'Duração Rápida (UI)',
            type: 'slider',
            unit: 's',
            constraints: { min: 0.1, max: 0.5, step: 0.05 },
            defaultValue: 0.2,
            cssVars: ['--sarak-motion-dur-fast']
        },
        {
            id: 'motionDurationNormal',
            label: 'Duração Normal',
            type: 'slider',
            unit: 's',
            constraints: { min: 0.2, max: 1, step: 0.05 },
            defaultValue: 0.3,
            cssVars: ['--sarak-motion-dur-normal']
        },
        {
            id: 'motionDurationSlow',
            label: 'Duração Lenta (Cenário)',
            type: 'slider',
            unit: 's',
            constraints: { min: 0.5, max: 2, step: 0.1 },
            defaultValue: 0.6,
            cssVars: ['--sarak-motion-dur-slow']
        },

        // --- INTERAÇÕES ---
        {
            id: 'motionStaggerDelay',
            label: 'Atraso de Cascata (Stagger)',
            type: 'slider',
            unit: 's',
            constraints: { min: 0, max: 0.2, step: 0.01 },
            defaultValue: 0.05,
            cssVars: ['--sarak-motion-stagger']
        }
    ]
};
