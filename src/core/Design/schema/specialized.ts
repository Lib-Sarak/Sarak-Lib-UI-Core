import { ComponentSchema } from '../types';

/**
 * SCHEMA: MÓDULOS ESPECIAIS & IA
 * Governa componentes complexos de domínio específico e IA.
 */
export const SpecializedSchema: ComponentSchema = {
    id: 'specialized',
    label: 'Ícones e Estética',
    tokens: [
        {
            id: 'aiPanelBg',
            label: 'Fundo do Painel IA',
            type: 'color',
            defaultValue: 'rgba(0, 0, 0, 0.4)',
            cssVars: ['--sarak-ai-panel-bg']
        },
        {
            id: 'aiGlowColor',
            label: 'Cor do Brilho IA',
            type: 'color',
            defaultValue: '#00f2ff',
            cssVars: ['--sarak-ai-glow']
        },
        {
            id: 'flowNodeRadius',
            label: 'Raio dos Nós (Fluxo)',
            type: 'slider',
            isResponsive: true,
            unit: 'px',
            constraints: { min: 0, max: 40, step: 1 },
            defaultValue: { mob: 8, tab: 10, desk: 12 },
            cssVars: ['--sarak-flow-radius', '--sarak-flow-node-radius']
        },
        {
            id: 'flowGridStyle',
            label: 'Estilo do Grid (Fluxo)',
            type: 'select',
            defaultValue: 'dots',
            options: [
                { value: 'dots', label: 'Dots (Standard)' },
                { value: 'lines', label: 'Lines (Technical)' }
            ],
            cssVars: ['--sarak-flow-grid']
        },

        // --- GRADE DE PONTOS DECORATIVA (Spec 27 — compartilhada por SarakEmptyState/AuthHero) ---
        {
            id: 'dotGridDotOffset',
            label: 'Grade de Pontos: Offset do Ponto',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 10 },
            defaultValue: 2,
            cssVars: ['--sarak-dot-grid-dot-offset']
        },
        {
            id: 'dotGridDotSize',
            label: 'Grade de Pontos: Raio do Ponto',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 6 },
            defaultValue: 1,
            cssVars: ['--sarak-dot-grid-dot-size']
        },
        {
            id: 'dotGridTileSize',
            label: 'Grade de Pontos: Tamanho do Tile',
            type: 'slider',
            unit: 'px',
            constraints: { min: 10, max: 100 },
            defaultValue: 40,
            cssVars: ['--sarak-dot-grid-tile-size']
        },

        // --- SARAK EMPTY STATE (Spec 27) ---
        {
            id: 'emptyStateOrbOuter',
            label: 'Empty State: Diâmetro do Anel Externo',
            type: 'slider',
            unit: 'px',
            constraints: { min: 100, max: 900 },
            defaultValue: 500,
            cssVars: ['--sarak-empty-state-orb-outer']
        },
        {
            id: 'emptyStateOrbInner',
            label: 'Empty State: Diâmetro do Anel Interno / Orb',
            type: 'slider',
            unit: 'px',
            constraints: { min: 100, max: 600 },
            defaultValue: 300,
            cssVars: ['--sarak-empty-state-orb-inner']
        },
        {
            id: 'emptyStateOrbBlur',
            label: 'Empty State: Desfoque do Orb',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 200 },
            defaultValue: 100,
            cssVars: ['--sarak-empty-state-orb-blur']
        },
        {
            id: 'emptyStateVoidLetterOffset',
            label: 'Empty State: Offset da Letra (VOID)',
            type: 'slider',
            unit: 'em',
            constraints: { min: 0, max: 2, step: 0.1 },
            defaultValue: 0.8,
            cssVars: ['--sarak-empty-state-void-letter-offset']
        },
        {
            id: 'emptyStateRingRadius',
            label: 'Empty State: Arredondamento do Anel Tracejado',
            type: 'slider',
            unit: 'rem',
            constraints: { min: 0, max: 4, step: 0.25 },
            defaultValue: 2,
            cssVars: ['--sarak-empty-state-ring-radius']
        },
        {
            id: 'emptyStateCaptionMaxWidth',
            label: 'Empty State: Largura Máxima da Legenda',
            type: 'slider',
            unit: 'px',
            constraints: { min: 100, max: 500 },
            defaultValue: 280,
            cssVars: ['--sarak-empty-state-caption-max-width']
        },

        // --- SARAK SKELETON (Spec 27) ---
        {
            id: 'skeletonRowHeight',
            label: 'Skeleton: Altura Padrão da Linha',
            type: 'slider',
            unit: 'rem',
            constraints: { min: 0.25, max: 4, step: 0.25 },
            defaultValue: 1,
            cssVars: ['--sarak-skeleton-row-height']
        },
        {
            id: 'skeletonCircleSize',
            label: 'Skeleton: Diâmetro Padrão (Circle)',
            type: 'slider',
            unit: 'rem',
            constraints: { min: 0.5, max: 6, step: 0.25 },
            defaultValue: 2.5,
            cssVars: ['--sarak-skeleton-circle-size']
        },
        {
            id: 'skeletonRowRadius',
            label: 'Skeleton: Arredondamento da Linha/Bloco',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 20 },
            defaultValue: 4,
            cssVars: ['--sarak-skeleton-row-radius']
        },

        // --- TEMPLATES: AUTH HERO (Spec 27) ---
        {
            id: 'authHeroOrbBlur',
            label: 'Auth Hero: Desfoque dos Orbs de Fundo',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 250 },
            defaultValue: 120,
            cssVars: ['--sarak-auth-hero-orb-blur']
        },

        // --- ENGINES: PLACEHOLDERS DE ALTURA MÍNIMA (Spec 28) ---
        {
            id: 'chartEngineMinHeight',
            label: 'Engine de Gráficos: Altura Mínima',
            type: 'slider',
            unit: 'px',
            constraints: { min: 100, max: 400 },
            defaultValue: 180,
            cssVars: ['--sarak-chart-engine-min-h']
        },
        {
            id: 'engineMinHeightLg',
            label: 'Engines: Altura Mínima (Grande)',
            type: 'slider',
            unit: 'px',
            constraints: { min: 200, max: 800 },
            defaultValue: 500,
            cssVars: ['--sarak-engine-min-h-lg']
        },
        {
            id: 'engineMinHeightSm',
            label: 'Engines: Altura Mínima (Pequena)',
            type: 'slider',
            unit: 'px',
            constraints: { min: 100, max: 500 },
            defaultValue: 300,
            cssVars: ['--sarak-engine-min-h-sm']
        },

        // --- CHAT ENGINE (Spec 28) ---
        {
            id: 'chatBubbleGlassBlur',
            label: 'Chat Engine: Desfoque de Vidro da Bolha',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 30 },
            defaultValue: 12,
            cssVars: ['--sarak-chat-bubble-blur']
        },

        // --- FLOW ENGINE (Spec 28) ---
        {
            id: 'flowNodePadding',
            label: 'Flow Engine: Padding do Nó',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 24 },
            defaultValue: 10,
            cssVars: ['--sarak-flow-node-padding']
        },
        {
            id: 'flowNodeBlur',
            label: 'Flow Engine: Desfoque do Nó',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 20 },
            defaultValue: 5,
            cssVars: ['--sarak-flow-node-blur']
        },
        {
            id: 'flowHandleSize',
            label: 'Flow Engine: Tamanho do Handle',
            type: 'slider',
            unit: 'px',
            constraints: { min: 4, max: 16 },
            defaultValue: 8,
            cssVars: ['--sarak-flow-handle-size']
        },

        // --- VISUAL ENGINE (Spec 28) ---
        {
            id: 'visualPerspective',
            label: 'Visual Engine: Perspectiva 3D',
            type: 'slider',
            unit: 'px',
            constraints: { min: 400, max: 2000 },
            defaultValue: 1024,
            cssVars: ['--sarak-visual-perspective']
        },
        {
            id: 'visualTranslateOffsetSm',
            label: 'Visual Engine: Offset de Translação (Pequeno)',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 60 },
            defaultValue: 20,
            cssVars: ['--sarak-visual-translate-offset-sm']
        },
        {
            id: 'visualTranslateZMd',
            label: 'Visual Engine: Translação Z (Médio)',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 100 },
            defaultValue: 40,
            cssVars: ['--sarak-visual-translate-z-md']
        },
        {
            id: 'visualDotGridSize',
            label: 'Visual Engine: Tamanho da Grade de Pontos',
            type: 'slider',
            unit: 'px',
            constraints: { min: 5, max: 40 },
            defaultValue: 15,
            cssVars: ['--sarak-visual-dot-grid-size']
        },
        {
            id: 'visualOrbBlur',
            label: 'Visual Engine: Desfoque do Orb',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 150 },
            defaultValue: 60,
            cssVars: ['--sarak-visual-orb-blur']
        },

        // --- DESIGN ENGINE: PAINEL LATERAL DA FERRAMENTA (Spec 28) ---
        {
            id: 'designEngineSidebarMinWidth',
            label: 'Design Engine: Largura Mínima do Painel',
            type: 'slider',
            unit: 'px',
            constraints: { min: 200, max: 400 },
            defaultValue: 280,
            cssVars: ['--sarak-design-engine-sidebar-min-w']
        },
        {
            id: 'designEngineSidebarMaxWidth',
            label: 'Design Engine: Largura Máxima do Painel',
            type: 'slider',
            unit: 'px',
            constraints: { min: 400, max: 900 },
            defaultValue: 600,
            cssVars: ['--sarak-design-engine-sidebar-max-w']
        },
        {
            id: 'layoutPreviewMaxH',
            label: 'Design Engine: Altura Máxima do Preview de Código',
            type: 'slider',
            unit: 'px',
            constraints: { min: 40, max: 300 },
            defaultValue: 120,
            cssVars: ['--sarak-layout-preview-max-h']
        },
        {
            id: 'kbdMinWidth',
            label: 'Design Engine: Largura Mínima da Tecla (Kbd)',
            type: 'slider',
            unit: 'px',
            constraints: { min: 16, max: 48 },
            defaultValue: 28,
            cssVars: ['--sarak-kbd-min-w']
        }
    ]
};
