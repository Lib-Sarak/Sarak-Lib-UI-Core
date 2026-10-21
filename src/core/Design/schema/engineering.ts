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
            kind: 'functional',
            modeDependent: false,
            usage: "Espessura do contorno de foco de teclado em botões e links; o piso de 1 px mantém o indicador visível em todo tema.",
            label: 'Largura do Anel de Foco',
            type: 'slider',
            description: 'Espessura, em pixels, do anel de contorno exibido ao redor de um elemento focado via teclado (Tab). Valores maiores melhoram a visibilidade para usuários de navegação por teclado/leitores de tela; o piso é 1 px.',
            axis: 'geometry',
            unit: 'px',
            constraints: { min: 1, max: 6 },
            defaultValue: 2,
            cssVars: ['--sarak-focus-width']
        },
        {
            id: 'reducedMotion',
            kind: 'functional',
            modeDependent: false,
            usage: "Zera as transições e animações da interface (duração de 0,00001 s) e as durações usadas por JavaScript; é requisito de acessibilidade, não estilo.",
            interactsWith: ['animEnabled'],
            label: 'Reduzir Movimento',
            type: 'boolean',
            description: 'Quando ativo, suprime/reduz animações e transições em toda a aplicação — atende usuários sensíveis a movimento (`prefers-reduced-motion`) e é um requisito de acessibilidade, não só preferência estética.',
            axis: 'motion',
            defaultValue: false,
            cssVars: ['--sarak-reduced-motion']
        },
        {
            id: 'touchTargetMin',
            kind: 'functional',
            modeDependent: false,
            usage: "Piso de altura e largura dos acionáveis quando o ponteiro é o dedo (`pointer: coarse`); com mouse o desenho não muda.",
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
            kind: 'functional',
            modeDependent: false,
            usage: "Camada das notificações; topo da escada de camadas, um passo acima do tooltip.",
            label: 'Camada: Notificações',
            type: 'number',
            description: 'Índice de empilhamento (z-index) usado por notificações toast — o topo da escada de camadas (um passo acima do tooltip), para a notificação aparecer acima de qualquer modal ou sobreposição já aberta.',
            axis: 'elevation',
            constraints: { min: 1000, max: 9900, step: 100 },
            defaultValue: 9100,
            cssVars: ['--sarak-z-toast']
        }
    ]
};
