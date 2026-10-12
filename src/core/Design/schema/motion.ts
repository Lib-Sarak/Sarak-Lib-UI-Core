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
            description: 'Curva de aceleração (cubic-bezier) master de toda a interface: as transições de botão, campo, cartão e do corpo da página, e a abertura/fechamento de painel e gaveta. É a única curva "padrão" do sistema.',
            axis: 'motion',
            defaultValue: 'cubic-bezier(0.4, 0, 0.2, 1)',
            cssVars: ['--sarak-motion-ease-main']
        },
        {
            id: 'motionEaseOut',
            label: 'Curva de Saída (Deceleration)',
            type: 'text',
            description: 'Curva de desaceleração dos gestos de resposta imediata (o aperto de um botão ou de um cartão): o movimento começa rápido e desacelera suavemente no final.',
            axis: 'motion',
            defaultValue: 'cubic-bezier(0, 0, 0.2, 1)',
            cssVars: ['--sarak-motion-ease-out']
        },
        {
            id: 'motionEaseIn',
            label: 'Curva de Entrada (Acceleration)',
            type: 'text',
            description: 'Curva de aceleração da SAÍDA de sobreposições (modal, paleta de busca, avisos): o elemento parte devagar e acelera até sumir. Aceita só `cubic-bezier(x1, y1, x2, y2)`; outra forma volta à curva de fábrica.',
            axis: 'motion',
            defaultValue: 'cubic-bezier(0.4, 0, 1, 1)',
            cssVars: ['--sarak-motion-ease-in']
        },

        // --- DURAÇÕES ---
        {
            id: 'motionDurationInstant',
            label: 'Duração Instantânea',
            type: 'slider',
            description: 'Duração, em segundos, do feedback quase imediato: o aperto (`:active`) de botões e cartões. É a mais curta do sistema.',
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
            description: 'Duração, em segundos, de micro-interações rápidas de UI (hover, toggle), em CSS (`--duration-fast`) e em JS.',
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
            description: 'Duração, em segundos, de transições de escopo médio: o corpo da página, a classe `transition-sarak`, expandir/recolher um painel (`SarakAccordion`). Ritmo perceptível mas ágil.',
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
            description: 'Duração, em segundos, de animações mais longas (a gaveta e o véu dela, transições de cena). Use com moderação.',
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
            description: 'Atraso, em segundos, entre a entrada de um item e a do seguinte nas listas em cascata (as linhas de uma tabela, as barras de um gráfico). Multiplicado pelo índice do item: 0 entra tudo junto.',
            axis: 'motion',
            unit: 's',
            constraints: { min: 0, max: 0.2, step: 0.01 },
            defaultValue: 0.05,
            cssVars: ['--sarak-motion-stagger']
        }
    ]
};
