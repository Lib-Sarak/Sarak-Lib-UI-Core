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
        }
    ]
};
