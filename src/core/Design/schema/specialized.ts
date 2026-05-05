import { ComponentSchema } from '../types';

/**
 * Mapeamento 100% Atômico: Componentes Especializados (v12.0)
 * Governa componentes de alto nível e utilitários de interface.
 */
export const SpecializedSchema: ComponentSchema = {
    id: 'specialized',
    label: 'Componentes Avançados',
    tokens: [
        // --- KPI & STATS: INDICADORES ---
        {
            id: 'statsValueSize',
            label: 'Tamanho do Valor',
            category: 'KPI & Stats',
            type: 'slider',
            unit: 'px',
            constraints: { min: 14, max: 64 },
            defaultValue: 24,
            cssVars: ['--sarak-stats-value-size']
        },
        {
            id: 'statsLabelOpacity',
            label: 'Opacidade do Rótulo',
            category: 'KPI & Stats',
            type: 'slider',
            constraints: { min: 0, max: 1, step: 0.05 },
            defaultValue: 0.6,
            cssVars: ['--sarak-stats-label-opacity']
        },
        {
            id: 'statsTrendGlow',
            label: 'Brilho de Tendência',
            category: 'KPI & Stats',
            type: 'slider',
            constraints: { min: 0, max: 1, step: 0.05 },
            defaultValue: 0.3,
            cssVars: ['--sarak-stats-trend-glow']
        },

        // --- MODAIS & DIALOGS ---
        {
            id: 'modalOverlayColor',
            label: 'Cor do Overlay (Fundo)',
            category: 'Modais',
            type: 'color',
            defaultValue: 'rgba(0, 0, 0, 0.4)',
            cssVars: ['--sarak-modal-overlay']
        },
        {
            id: 'modalOverlayBlur',
            label: 'Blur do Overlay',
            category: 'Modais',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 40 },
            defaultValue: 8,
            cssVars: ['--sarak-modal-blur']
        },
        {
            id: 'modalEntryAnimation',
            label: 'Animação de Entrada',
            category: 'Modais',
            type: 'select',
            constraints: {
                options: [
                    { id: 'fade', label: 'Fade' },
                    { id: 'slide-up', label: 'Slide Up' },
                    { id: 'zoom', label: 'Zoom Industrial' },
                    { id: 'none', label: 'Sem Animação' }
                ],
            },
            defaultValue: 'zoom',
            cssVars: ['--sarak-modal-anim']
        },

        // --- SCROLLBARS ---
        {
            id: 'scrollWidth',
            label: 'Largura do Scroll',
            category: 'Scrollbars',
            type: 'slider',
            unit: 'px',
            constraints: { min: 2, max: 12 },
            defaultValue: 6,
            cssVars: ['--sarak-scroll-width']
        },
        {
            id: 'scrollThumbColor',
            label: 'Cor do Atuador (Thumb)',
            category: 'Scrollbars',
            type: 'color',
            defaultValue: 'rgba(255, 255, 255, 0.2)',
            cssVars: ['--sarak-scroll-thumb']
        },

        // --- TOOLTIPS ---
        {
            id: 'tooltipBg',
            label: 'Fundo do Tooltip',
            category: 'Tooltips',
            type: 'color',
            defaultValue: '#0f172a',
            cssVars: ['--sarak-tooltip-bg']
        },
        {
            id: 'tooltipRadius',
            label: 'Raio do Tooltip',
            category: 'Tooltips',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 12 },
            defaultValue: 4,
            cssVars: ['--sarak-tooltip-radius']
        },

        // --- CHAT & BOLHAS ---
        {
            id: 'chatBubbleRadius',
            label: 'Raio da Bolha',
            category: 'Chat',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 24 },
            defaultValue: 12,
            cssVars: ['--sarak-chat-radius']
        },
        {
            id: 'chatEntryAnim',
            label: 'Animação de Mensagem',
            category: 'Chat',
            type: 'boolean',
            defaultValue: true
        }
    ]
};

