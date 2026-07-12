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
            description: 'Curva de aceleração (cubic-bezier) master para animações via `framer-motion`/JS — paralela a `easeMain` de `animations.ts`, mas em formato de string consumível por hooks de motion JS em vez de CSS puro.',
            axis: 'motion',
            defaultValue: 'cubic-bezier(0.4, 0, 0.2, 1)',
            cssVars: ['--sarak-motion-ease-main']
        },
        {
            id: 'motionEaseOut',
            label: 'Curva de Saída (Deceleration)',
            type: 'text',
            description: 'Curva de desaceleração para animações JS de elementos saindo de cena ou chegando ao repouso — movimento começa rápido e desacelera suavemente no final.',
            axis: 'motion',
            defaultValue: 'cubic-bezier(0, 0, 0.2, 1)',
            cssVars: ['--sarak-motion-ease-out']
        },
        {
            id: 'motionEaseIn',
            label: 'Curva de Entrada (Acceleration)',
            type: 'text',
            description: 'Curva de aceleração para animações JS de elementos entrando em movimento — começa devagar e acelera, útil para elementos "partindo" de um estado parado.',
            axis: 'motion',
            defaultValue: 'cubic-bezier(0.4, 0, 1, 1)',
            cssVars: ['--sarak-motion-ease-in']
        },

        // --- DURAÇÕES ---
        {
            id: 'motionDurationInstant',
            label: 'Duração Instantânea',
            type: 'slider',
            description: 'Duração, em segundos, da animação JS mais curta do sistema — equivalente motion/JS de `animInstant`. Use para feedback quase imediato.',
            axis: 'motion',
            unit: 's',
            constraints: { min: 0, max: 0.2, step: 0.01 },
            defaultValue: 0.1,
            cssVars: ['--sarak-motion-dur-instant']
        },
        {
            id: 'motionDurationFast',
            label: 'Duração Rápida (UI)',
            type: 'slider',
            description: 'Duração, em segundos, de animações JS rápidas de UI (hover, toggle) — o padrão para a maioria das micro-interações controladas por `framer-motion`.',
            axis: 'motion',
            unit: 's',
            constraints: { min: 0.1, max: 0.5, step: 0.05 },
            defaultValue: 0.2,
            cssVars: ['--sarak-motion-dur-fast']
        },
        {
            id: 'motionDurationNormal',
            label: 'Duração Normal',
            type: 'slider',
            description: 'Duração, em segundos, de animações JS de escopo médio (expandir/recolher um painel, modal). Ritmo perceptível mas ágil.',
            axis: 'motion',
            unit: 's',
            constraints: { min: 0.2, max: 1, step: 0.05 },
            defaultValue: 0.3,
            cssVars: ['--sarak-motion-dur-normal']
        },
        {
            id: 'motionDurationSlow',
            label: 'Duração Lenta (Cenário)',
            type: 'slider',
            description: 'Duração, em segundos, de animações JS mais longas/cinematográficas (transições de cena, entradas dramáticas). Use com moderação.',
            axis: 'motion',
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
            description: 'Atraso, em segundos, entre a animação de cada item de uma lista renderizada em cascata (ex. itens de menu aparecendo um a um). Multiplicado pelo índice do item — valores maiores produzem um efeito de cascata mais lento/perceptível.',
            axis: 'motion',
            unit: 's',
            constraints: { min: 0, max: 0.2, step: 0.01 },
            defaultValue: 0.05,
            cssVars: ['--sarak-motion-stagger']
        }
    ]
};
