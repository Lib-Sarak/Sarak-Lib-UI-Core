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
            id: 'zIndexToast',
            label: 'Camada: Notificações',
            type: 'number',
            description: 'Índice de empilhamento (z-index) usado por notificações toast — normalmente o valor mais alto do sistema, para garantir que a notificação sempre apareça acima de qualquer modal/overlay já aberto.',
            axis: 'elevation',
            defaultValue: 2000,
            cssVars: ['--sarak-z-toast']
        }
    ]
};
