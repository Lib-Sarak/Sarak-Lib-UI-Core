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
            id: 'zIndexModal',
            label: 'Camada: Modais',
            type: 'number',
            description: 'Índice de empilhamento (z-index) usado por modais/diálogos — deve ser maior que o de elementos de navegação (sidebar/topbar) para garantir que o modal sempre fique por cima, mas coerente com as demais camadas do sistema (toast, tooltip). Nota: existe um token homônimo (mesmo `id`) em `layers.ts`, com range diferente (`min: 1000, max: 5000`) — como este arquivo (`engineering.ts`) vem ANTES de `layers.ts` em `MASTER_DESIGN_MAP.components`, é ESTA definição (sem min/max) que o `agent-design-operator` de fato preenche/valida hoje (`deduplicateById`, primeira ocorrência). Pendência de higiene de schema — Spec 01/`backlog_cobertura.md`.',
            axis: 'elevation',
            defaultValue: 1000,
            cssVars: ['--sarak-z-modal']
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
