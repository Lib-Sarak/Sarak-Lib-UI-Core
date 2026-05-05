import { ComponentSchema } from '../types';

/**
 * Mapeamento 100% Atômico: Componentes Especializados (v12.0)
 * Governa componentes de alto nível e utilitários de interface.
 */
export const SpecializedSchema: ComponentSchema = {
    id: 'specialized',
    label: 'Componentes Avançados',
    tokens: [
        // --- KPI & STATS: ANATOMIA INDUSTRIAL ---
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
            id: 'statsBgOpacity',
            label: 'Opacidade do Fundo (KPI)',
            category: 'KPI & Stats',
            type: 'slider',
            constraints: { min: 0, max: 0.5, step: 0.01 },
            defaultValue: 0.03,
            cssVars: ['--sarak-stats-bg-opacity']
        },
        {
            id: 'gaugeStrokeWidth',
            label: 'Espessura do Gauge',
            category: 'KPI & Stats',
            type: 'slider',
            unit: 'px',
            constraints: { min: 2, max: 20 },
            defaultValue: 8,
            cssVars: ['--sarak-gauge-stroke']
        },

        // --- MODAIS & OVERLAYS ---
        {
            id: 'modalOverlayColor',
            label: 'Cor do Overlay',
            category: 'Modais & Overlays',
            type: 'color',
            defaultValue: 'rgba(0, 0, 0, 0.4)',
            cssVars: ['--sarak-modal-overlay']
        },
        {
            id: 'modalOverlayBlur',
            label: 'Blur do Overlay',
            category: 'Modais & Overlays',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 40 },
            defaultValue: 8,
            cssVars: ['--sarak-modal-blur']
        },

        // --- CHAT & COLABORAÇÃO ---
        {
            id: 'chatBubbleUserBg',
            label: 'Fundo: Bolha Usuário',
            category: 'Chat: Anatomia',
            type: 'color',
            defaultValue: 'rgba(255, 255, 255, 0.05)',
            cssVars: ['--sarak-chat-user-bg']
        },
        {
            id: 'chatBubbleSystemBg',
            label: 'Fundo: Bolha Sistema',
            category: 'Chat: Anatomia',
            type: 'color',
            defaultValue: 'rgba(0, 242, 255, 0.05)',
            cssVars: ['--sarak-chat-system-bg']
        },
        {
            id: 'chatBubbleRadius',
            label: 'Raio da Bolha',
            category: 'Chat: Anatomia',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 24 },
            defaultValue: 12,
            cssVars: ['--sarak-chat-radius']
        },

        // --- NAVEGAÇÃO & MENU ---
        {
            id: 'navItemHoverBg',
            label: 'Fundo Hover (Item)',
            category: 'Navegação & Menu',
            type: 'color',
            defaultValue: 'rgba(255, 255, 255, 0.05)',
            cssVars: ['--sarak-nav-item-hover']
        },
        {
            id: 'navItemActiveColor',
            label: 'Cor de Texto Ativo',
            category: 'Navegação & Menu',
            type: 'color',
            defaultValue: '#00f2ff',
            cssVars: ['--sarak-nav-item-active']
        },

        // --- ABAS (TABS) ---
        {
            id: 'tabActiveLineColor',
            label: 'Cor da Linha Ativa',
            category: 'Abas (Tabs)',
            type: 'color',
            defaultValue: '#00f2ff',
            cssVars: ['--sarak-tab-active-line']
        },
        {
            id: 'tabTextInactiveColor',
            label: 'Cor do Texto Inativo',
            category: 'Abas (Tabs)',
            type: 'color',
            defaultValue: 'rgba(255, 255, 255, 0.4)',
            cssVars: ['--sarak-tab-text-inactive']
        },

        // --- TOOLTIPS & INDICADORES ---
        {
            id: 'tooltipBg',
            label: 'Fundo do Tooltip',
            category: 'Tooltips & Popovers',
            type: 'color',
            defaultValue: '#0f172a',
            cssVars: ['--sarak-tooltip-bg']
        },
        {
            id: 'tooltipRadius',
            label: 'Raio do Tooltip',
            category: 'Tooltips & Popovers',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 12 },
            defaultValue: 4,
            cssVars: ['--sarak-tooltip-radius']
        }
    ]
};

