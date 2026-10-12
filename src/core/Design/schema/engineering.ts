import { ComponentSchema } from '../types';

/**
 * SCHEMA: ACESSIBILIDADE & ENGENHARIA
 * Governa o comportamento técnico, camadas e performance da UI.
 */
export const EngineeringSchema: ComponentSchema = {
    id: 'engineering',
    label: 'Acessibilidade e Camadas',
    tokens: [
        {
            id: 'focusRingWidth',
            label: 'Largura do Anel de Foco',
            type: 'slider',
            description: 'Espessura, em pixels, do anel de contorno exibido ao redor de um elemento focado via teclado (Tab). Valores maiores melhoram a visibilidade para usuários de navegação por teclado/leitores de tela — não reduza abaixo de 2px sem motivo de acessibilidade validado.',
            axis: 'geometry',
            unit: 'px',
            constraints: { min: 0, max: 6 },
            defaultValue: 2,
            cssVars: ['--sarak-focus-width']
        },
        {
            id: 'reducedMotion',
            label: 'Reduzir Movimento',
            type: 'boolean',
            description: 'Quando ativo, suprime/reduz animações e transições em toda a aplicação — atende usuários sensíveis a movimento (`prefers-reduced-motion`) e é um requisito de acessibilidade, não só preferência estética.',
            axis: 'motion',
            defaultValue: false,
            cssVars: ['--sarak-reduced-motion']
        },
        {
            id: 'touchTargetMin',
            label: 'Alvo Mínimo de Toque',
            type: 'slider',
            description: 'Altura e largura mínimas, em pixels, da área tocável de todo acionável da lib (botão, botão-ícone, item de menu, aba, campo de seleção, barra do Gantt) quando o ponteiro é o dedo (`pointer: coarse`). Com mouse o desenho não muda. 44px é o alvo de toque recomendado pelo WCAG 2.5.5; 24px é o piso do WCAG 2.5.8 (AA).',
            axis: 'geometry',
            unit: 'px',
            constraints: { min: 24, max: 64 },
            defaultValue: 44,
            cssVars: ['--sarak-touch-target-min']
        },
        {
            id: 'zIndexToast',
            label: 'Camada: Notificações',
            type: 'number',
            description: 'Índice de empilhamento (z-index) usado por notificações toast — normalmente o valor mais alto do sistema, para garantir que a notificação sempre apareça acima de qualquer modal/overlay já aberto.',
            axis: 'elevation',
            defaultValue: 9000,
            cssVars: ['--sarak-z-toast']
        }
    ]
};
