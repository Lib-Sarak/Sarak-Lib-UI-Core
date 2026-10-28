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
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Curva padrão das transições de botão, campo, cartão, corpo da página, painel e gaveta; é a curva que quase toda interação do sistema usa.",
            label: 'Curva Master (Ease)',
            type: 'text',
            description: 'Curva de aceleração (cubic-bezier) master de toda a interface: as transições de botão, campo, cartão e do corpo da página, e a abertura/fechamento de painel e gaveta. É a única curva "padrão" do sistema.',
            axis: 'motion',
            defaultValue: 'cubic-bezier(0.16, 1, 0.3, 1)',
            cssVars: ['--sarak-motion-ease-main']
        },
        {
            id: 'motionEaseOut',
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Curva do aperto de um botão HTML sem classe e do pulso do alternador pulsante; o `SarakButton` mantém a própria curva no aperto.",
            label: 'Curva de Saída (Deceleration)',
            type: 'text',
            description: 'Curva de desaceleração do aperto de um botão HTML sem classe e do pulso do alternador pulsante: o movimento começa rápido e desacelera suavemente no final. O `SarakButton` mantém a própria curva no aperto.',
            axis: 'motion',
            defaultValue: 'cubic-bezier(0.16, 1, 0.3, 1)',
            cssVars: ['--sarak-motion-ease-out']
        },
        {
            id: 'motionEaseIn',
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Curva da saída do modal e da paleta de busca: o painel e o fundo permanecem na página durante a saída (duração `motionDurationFast`) e somem acelerando por esta curva.",
            interactsWith: ['motionDurationFast'],
            label: 'Curva de Entrada (Acceleration)',
            type: 'text',
            description: 'Curva de aceleração da SAÍDA do modal e da paleta de busca: o elemento parte devagar e acelera até sumir. Aceita só `cubic-bezier(x1, y1, x2, y2)`; outra forma volta à curva de fábrica.',
            axis: 'motion',
            defaultValue: 'cubic-bezier(0.7, 0, 0.84, 0)',
            cssVars: ['--sarak-motion-ease-in']
        },

        // --- DURAÇÕES ---
        {
            id: 'motionDurationInstant',
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Duração do aperto (`:active`) de botões e botões de ícone; é a mais curta do sistema.",
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
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Duração das micro-interações de UI (hover, foco, campos e navegação) em CSS e a duração padrão das utilitárias `transition-*`.",
            label: 'Duração Rápida (UI)',
            type: 'slider',
            description: 'Duração, em segundos, de micro-interações rápidas de UI (hover, toggle), em CSS (`--duration-fast`) e em JS.',
            axis: 'motion',
            unit: 's',
            constraints: { min: 0, max: 0.5, step: 0.01 },
            defaultValue: 0.2,
            cssVars: ['--sarak-motion-dur-fast']
        },
        {
            id: 'motionDurationNormal',
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Duração das transições de escopo médio: o corpo da página, o cartão, o acordeão, a troca de página e a classe `transition-sarak`.",
            label: 'Duração Normal',
            type: 'slider',
            description: 'Duração, em segundos, de transições de escopo médio: o corpo da página, a classe `transition-sarak`, expandir/recolher um painel (`SarakAccordion`). Ritmo perceptível mas ágil.',
            axis: 'motion',
            unit: 's',
            constraints: { min: 0, max: 1, step: 0.01 },
            defaultValue: 0.3,
            cssVars: ['--sarak-motion-dur-normal']
        },
        {
            id: 'motionDurationSlow',
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Duração das animações longas: os pseudoelementos de brilho dos cartões, a gaveta e as barras de gráfico.",
            label: 'Duração Lenta (Cenário)',
            type: 'slider',
            description: 'Duração, em segundos, de animações mais longas (a gaveta e o véu dela, transições de cena). Use com moderação.',
            axis: 'motion',
            unit: 's',
            constraints: { min: 0, max: 2, step: 0.05 },
            defaultValue: 0.6,
            cssVars: ['--sarak-motion-dur-slow']
        },

        // --- INTERAÇÕES ---
        {
            id: 'motionStaggerDelay',
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Atraso entre a entrada de um item e a do seguinte: cada linha da `SarakTable` espera índice × este valor. 0 entra tudo junto.",
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
