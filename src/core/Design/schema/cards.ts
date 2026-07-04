import { ComponentSchema } from '../types';

/**
 * Mapeamento 100% Atômico: Cards & Superfícies (v12.0)
 * Governa a anatomia de todos os containers do sistema.
 */
export const CardSchema: ComponentSchema = {
    id: 'cards',
    label: 'Card Geral',
    tokens: [
        // --- GEOMETRIA ---
        {
            id: 'cardBorderRadius',
            label: 'Raio da Borda (Master)',
            type: 'slider',
            isResponsive: true,
            unit: 'px',
            constraints: { min: 0, max: 120 },
            defaultValue: { mob: 8, tab: 12, desk: 12 },
            cssVars: ['--radius-theme', '--sarak-card-radius', '--sarak-card-radius-tl', '--sarak-card-radius-tr', '--sarak-card-radius-bl', '--sarak-card-radius-br']
        },
        {
            id: 'cardRadiusTL',
            label: 'Quina Superior Esquerda',
            type: 'slider',
            isResponsive: true,
            unit: 'px',
            constraints: { min: 0, max: 120 },
            defaultValue: { mob: 8, tab: 12, desk: 12 },
            cssVars: ['--sarak-card-radius-tl']
        },
        {
            id: 'cardRadiusTR',
            label: 'Quina Superior Direita',
            type: 'slider',
            isResponsive: true,
            unit: 'px',
            constraints: { min: 0, max: 120 },
            defaultValue: { mob: 8, tab: 12, desk: 12 },
            cssVars: ['--sarak-card-radius-tr']
        },
        {
            id: 'cardRadiusBL',
            label: 'Quina Inferior Esquerda',
            type: 'slider',
            isResponsive: true,
            unit: 'px',
            constraints: { min: 0, max: 120 },
            defaultValue: { mob: 8, tab: 12, desk: 12 },
            cssVars: ['--sarak-card-radius-bl']
        },
        {
            id: 'cardRadiusBR',
            label: 'Quina Inferior Direita',
            type: 'slider',
            isResponsive: true,
            unit: 'px',
            constraints: { min: 0, max: 120 },
            defaultValue: { mob: 8, tab: 12, desk: 12 },
            cssVars: ['--sarak-card-radius-br']
        },
        {
            id: 'cardGeometricCut',
            label: 'Corte Geométrico (Chanfro)',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 100 },
            defaultValue: 0,
            cssVars: ['--sarak-card-geometric-cut']
        },

        // --- SUPERFÍCIE ---
        {
            id: 'cardBackgroundColor',
            label: 'Cor de Fundo (Base)',
            type: 'color',
            defaultValue: 'rgba(15, 23, 42, 0.6)',
            generateVariants: true,
            cssVars: ['--card-bg', '--theme-surface', '--theme-card', '--sarak-card-bg']
        },
        {
            id: 'cardBackdropBlur',
            label: 'Backdrop Blur (Glass)',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 100 },
            defaultValue: 12,
            cssVars: ['--sarak-card-backdrop-blur', '--sarak-card-blur', '--sarak-glass-blur']
        },
        {
            id: 'cardSurfaceOpacity',
            label: 'Opacidade da Superfície',
            type: 'slider',
            constraints: { min: 0, max: 1, step: 0.05 },
            defaultValue: 0.8,
            cssVars: ['--sarak-card-surface-opacity', '--sarak-card-opacity']
        },

        // --- BORDAS & LINHAS ---
        {
            id: 'cardBorderWidth',
            label: 'Espessura da Borda',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 20 },
            defaultValue: 1,
            cssVars: ['--card-border-width', '--theme-border-width', '--sarak-card-border-width']
        },
        {
            id: 'cardBorderColor',
            label: 'Cor da Borda',
            type: 'color',
            defaultValue: 'rgba(255, 255, 255, 0.1)',
            cssVars: ['--card-border-color', '--theme-border', '--sarak-card-border-color']
        },
        {
            id: 'cardBorderOpacity',
            label: 'Opacidade da Borda',
            type: 'slider',
            constraints: { min: 0, max: 1, step: 0.05 },
            defaultValue: 1,
            cssVars: ['--sarak-card-border-opacity']
        },

        // --- BORDAS ASSIMÉTRICAS ---
        {
            id: 'cardBorderTop',
            label: 'Espessura: Topo',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 40 },
            defaultValue: 1,
            cssVars: ['--sarak-card-border-top']
        },
        {
            id: 'cardBorderBottom',
            label: 'Espessura: Base',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 40 },
            defaultValue: 1,
            cssVars: ['--sarak-card-border-bottom']
        },
        {
            id: 'cardBorderLeft',
            label: 'Espessura: Esquerda',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 40 },
            defaultValue: 1,
            cssVars: ['--sarak-card-border-left']
        },
        {
            id: 'cardBorderRight',
            label: 'Espessura: Direita',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 40 },
            defaultValue: 1,
            cssVars: ['--sarak-card-border-right']
        },

        // --- ILUMINAÇÃO INTERNA ---
        {
            id: 'cardInnerGlowColor',
            label: 'Cor do Glow Interno',
            type: 'color',
            defaultValue: 'rgba(255, 255, 255, 0.05)',
            cssVars: ['--sarak-card-inner-glow-color']
        },
        {
            id: 'cardInnerGlowWidth',
            label: 'Largura do Glow Interno',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 30 },
            defaultValue: 1,
            cssVars: ['--sarak-card-inner-glow-width']
        },

        // --- TEXTURA DO CARD ---
        {
            id: 'cardTextureType',
            label: 'Textura da Superfície',
            type: 'select',
            constraints: {
                options: [
                    { id: 'none', value: 'none', label: 'Nenhuma' },
                    { id: 'grid', value: 'grid', label: 'Grid Técnico' },
                    { id: 'dots', value: 'dots', label: 'Pontos (Dotted)' },
                    { id: 'noise', value: 'noise', label: 'Ruído Analógico' },
                    { id: 'grain', value: 'grain', label: 'Grão Fotográfico' },
                    { id: 'mesh', value: 'mesh', label: 'Mesh Orgânico' },
                    { id: 'waves', value: 'waves', label: 'Ondas Senoidais' },
                    { id: 'squares', value: 'squares', label: 'Quadrados Industriais' },
                    { id: 'stripes', value: 'stripes', label: 'Listras Militares' },
                    { id: 'topo', value: 'topo', label: 'Topografia' },
                    { id: 'diamond', value: 'diamond', label: 'Diamante' },
                    { id: 'prestige', value: 'prestige', label: 'Prestige' },
                    { id: 'carbon', value: 'carbon', label: 'Fibra de Carbono' },
                    { id: 'brushed', value: 'brushed', label: 'Metal Escovado' },
                    { id: 'frosted', value: 'frosted', label: 'Vidro Fosco (Frosted)' },
                    { id: 'circuit', value: 'circuit', label: 'Circuitos (Classic)' },
                    { id: 'paper', value: 'paper', label: 'Papel Craft' },
                    { id: 'scanlines', value: 'scanlines', label: 'Scanlines (CRT)' },
                    { id: 'hexagon', value: 'hexagon', label: 'Hexagonais (Céptico)' },
                    { id: 'silk', value: 'silk', label: 'Seda Líquida' },
                    { id: 'blueprint', value: 'blueprint', label: 'Blueprint (Cianótipo)' },
                    { id: 'aurora', value: 'aurora', label: 'Aurora Boreal' },
                    { id: 'stars', value: 'stars', label: 'Campo Estelar' },
                    { id: 'honeycomb', value: 'honeycomb', label: 'Favo de Mel' },
                    { id: 'isometric', value: 'isometric', label: 'Projeção Isométrica' },
                    { id: 'radar', value: 'radar', label: 'Radar Tático' },
                    { id: 'crosshatch', value: 'crosshatch', label: 'Crosshatch' },
                    { id: 'micro-dots', value: 'micro-dots', label: 'Micro-Pontos' },
                    { id: 'pinstripes', value: 'pinstripes', label: 'Pinstripes' },
                    { id: 'constellation', value: 'constellation', label: 'Constelação' },
                    { id: 'circuit-pro', value: 'circuit-pro', label: 'Circuitos (Pro)' },
                    { id: 'carbon-tech', value: 'carbon-tech', label: 'Carbon Tech' },
                    { id: 'topo-deep', value: 'topo-deep', label: 'Topografia Profunda' },
                    { id: 'prism-mesh', value: 'prism-mesh', label: 'Prism Mesh' },
                    { id: 'cyber-binary', value: 'cyber-binary', label: 'Código Binário' },
                    { id: 'blueprint-pro', value: 'blueprint-pro', label: 'Blueprint Pro' },
                    { id: 'wave-pulse', value: 'wave-pulse', label: 'Pulso de Onda' },
                    { id: 'wood', value: 'wood', label: 'Madeira (Organic)' },
                    { id: 'stucco', value: 'stucco', label: 'Stucco (Parede)' },
                    { id: 'fluid', value: 'fluid', label: 'Fluido Dinâmico' },
                    { id: 'nebula', value: 'nebula', label: 'Nebulosa' }
                ]
            },
            defaultValue: 'none',
            cssVars: ['--sarak-card-texture-type']
        },
        {
            id: 'cardTextureOpacity',
            label: 'Opacidade da Textura',
            type: 'slider',
            constraints: { min: 0, max: 1, step: 0.01 },
            defaultValue: 0.03,
            cssVars: ['--sarak-card-texture-opacity']
        },

        // --- HEADER ---
        {
            id: 'cardHeaderBg',
            label: 'Fundo do Header',
            type: 'color',
            defaultValue: 'rgba(255, 255, 255, 0.03)',
            cssVars: ['--sarak-card-header-bg']
        },
        {
            id: 'cardHeaderBorder',
            label: 'Linha Divisora (Bottom)',
            type: 'color',
            defaultValue: 'rgba(255, 255, 255, 0.05)',
            cssVars: ['--sarak-card-header-border']
        },
        {
            id: 'cardHeaderPadding',
            label: 'Padding Vertical',
            type: 'slider',
            isResponsive: true,
            unit: 'px',
            constraints: { min: 0, max: 120 },
            defaultValue: { mob: 12, tab: 16, desk: 16 },
            cssVars: ['--sarak-card-header-padding']
        },

        // --- FOOTER ---
        {
            id: 'cardFooterBg',
            label: 'Fundo do Footer',
            type: 'color',
            defaultValue: 'transparent',
            cssVars: ['--sarak-card-footer-bg']
        },
        {
            id: 'cardFooterBorder',
            label: 'Linha Divisora (Top)',
            type: 'color',
            defaultValue: 'rgba(255, 255, 255, 0.05)',
            cssVars: ['--sarak-card-footer-border']
        },

        // --- EFEITOS & GLOW ---
        {
            id: 'cardShadowSpread',
            label: 'Espalhamento da Sombra',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 200 },
            defaultValue: 20,
            cssVars: ['--sarak-card-shadow-spread']
        },
        {
            id: 'cardGlowColor',
            label: 'Cor do Brilho (Neon)',
            type: 'color',
            defaultValue: 'rgba(0, 242, 255, 0.05)',
            cssVars: ['--sarak-card-glow-color']
        },
        {
            id: 'cardGlowIntensity',
            label: 'Intensidade do Brilho',
            type: 'slider',
            constraints: { min: 0, max: 1, step: 0.05 },
            defaultValue: 0,
            cssVars: ['--sarak-card-glow-intensity']
        },

        // --- INTERAÇÃO (HOVER) ---
        {
            id: 'cardHoverTranslate',
            label: 'Elevação no Hover (Y)',
            type: 'slider',
            unit: 'px',
            constraints: { min: -50, max: 10 },
            defaultValue: -4,
            cssVars: ['--sarak-card-hover-y']
        },
        {
            id: 'cardHoverGlowIncrease',
            label: 'Aumento de Brilho',
            type: 'slider',
            constraints: { min: 0, max: 1, step: 0.05 },
            defaultValue: 0.2,
            cssVars: ['--sarak-card-hover-glow']
        },
        {
            id: 'cardSpotlightOpacity',
            label: 'Opacidade do Spotlight',
            type: 'slider',
            constraints: { min: 0, max: 1, step: 0.05 },
            defaultValue: 0.1,
            cssVars: ['--spotlight-opacity']
        },

        // --- ESCALA DE ESPAÇAMENTO ---
        {
            id: 'cardPaddingMd',
            label: 'Padding Interno (MD)',
            type: 'slider',
            isResponsive: true,
            unit: 'px',
            constraints: { min: 0, max: 120 },
            defaultValue: { mob: 16, tab: 20, desk: 24 },
            cssVars: ['--sarak-card-padding-md', '--theme-gap']
        },

        // --- ESTRUTURA (LAYOUT DATA-DRIVEN) ---
        {
            id: 'cardLayoutDirection',
            label: 'Direção do Layout',
            type: 'select',
            constraints: {
                options: [
                    { id: 'column', value: 'column', label: 'Vertical (Coluna)' },
                    { id: 'row', value: 'row', label: 'Horizontal (Linha)' }
                ]
            },
            defaultValue: 'column',
            cssVars: ['--sarak-card-layout-direction']
        },
        {
            id: 'cardImagePosition',
            label: 'Posição da Imagem',
            type: 'select',
            constraints: {
                options: [
                    { id: 'none', value: 'none', label: 'Nenhuma' },
                    { id: 'top', value: 'top', label: 'Topo' },
                    { id: 'left', value: 'left', label: 'Esquerda' },
                    { id: 'right', value: 'right', label: 'Direita' }
                ]
            },
            defaultValue: 'top',
            cssVars: ['--sarak-card-image-position']
        },
        {
            id: 'cardTextAlign',
            label: 'Alinhamento de Texto',
            type: 'select',
            constraints: {
                options: [
                    { id: 'left', value: 'left', label: 'Esquerda' },
                    { id: 'center', value: 'center', label: 'Centro' },
                    { id: 'right', value: 'right', label: 'Direita' }
                ]
            },
            defaultValue: 'left',
            cssVars: ['--sarak-card-text-align']
        },
        {
            id: 'cardContentAlignment',
            label: 'Alinhamento do Conteúdo',
            type: 'select',
            constraints: {
                options: [
                    { id: 'start', value: 'start', label: 'Início' },
                    { id: 'center', value: 'center', label: 'Centro' },
                    { id: 'space-between', value: 'space-between', label: 'Espaçado (Between)' }
                ]
            },
            defaultValue: 'start',
            cssVars: ['--sarak-card-content-alignment']
        },
        {
            id: 'cardShadow',
            label: 'Sombra do Card (CSS)',
            type: 'text',
            defaultValue: 'none',
            cssVars: ['--sarak-card-shadow']
        },
        {
            id: 'borderBeamEnabled',
            label: 'Ativar Border Beam',
            type: 'boolean',
            defaultValue: false
        },

        // --- ESPECIALIZAÇÕES (GRANULARIDADE) ---
        {
            id: 'cardVariant',
            label: 'Variante de Card',
            type: 'select',
            constraints: {
                options: [
                    { id: 'classic', value: 'classic', label: 'Classic IA Detail Card' },
                    { id: 'title', value: 'title', label: 'Sleek Title Metadata Card' },
                    { id: 'action', value: 'action', label: 'Tactile CTA Action Card' },
                    { id: 'search', value: 'search', label: 'Reactive Search Filter Card' }
                ]
            },
            defaultValue: 'classic',
            cssVars: ['--sarak-card-variant']
        },

        // --- IMAGE CARDS ---
        {
            id: 'imageCardOverlayOpacity',
            label: 'Opacidade do Overlay (Imagem)',
            type: 'slider',
            constraints: { min: 0, max: 1, step: 0.05 },
            defaultValue: 0.5,
            cssVars: ['--sarak-image-card-overlay-opacity']
        },
        {
            id: 'imageCardHoverZoom',
            label: 'Escala de Zoom no Hover (Imagem)',
            type: 'slider',
            constraints: { min: 1, max: 1.5, step: 0.01 },
            defaultValue: 1.05,
            cssVars: ['--sarak-image-card-hover-zoom']
        },
        {
            id: 'imageCardShadowOffsetY',
            label: 'Sombra do Image Card: Offset Y',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 30 },
            defaultValue: 10,
            cssVars: ['--sarak-image-card-shadow-offset-y']
        },
        {
            id: 'imageCardShadowBlur',
            label: 'Sombra do Image Card: Desfoque',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 60 },
            defaultValue: 30,
            cssVars: ['--sarak-image-card-shadow-blur']
        },
        {
            id: 'imageCardShadowSpread',
            label: 'Sombra do Image Card: Espalhamento',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 30 },
            defaultValue: 10,
            cssVars: ['--sarak-image-card-shadow-spread']
        },
        {
            id: 'imageCardGlowBlur',
            label: 'Image Card: Desfoque do Glow Interno',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 80 },
            defaultValue: 40,
            cssVars: ['--sarak-image-card-glow-blur']
        },

        // --- TEMPLATES: MANAGEMENT GROUP CARD (Spec 27) ---
        {
            id: 'managementGroupListMaxHeight',
            label: 'Management Group: Altura Máxima da Lista',
            type: 'slider',
            unit: 'px',
            constraints: { min: 100, max: 800 },
            defaultValue: 340,
            cssVars: ['--sarak-management-group-list-max-height']
        },
        {
            id: 'managementGroupDescMaxWidth',
            label: 'Management Group: Largura Máxima da Descrição',
            type: 'slider',
            unit: 'px',
            constraints: { min: 60, max: 400 },
            defaultValue: 140,
            cssVars: ['--sarak-management-group-desc-max-width']
        },

        // --- TEMPLATES: RECURSIVE MATRIX NODE (Spec 27) ---
        {
            id: 'matrixNodeMinWidth',
            label: 'Matrix Node: Largura Mínima',
            type: 'slider',
            unit: 'px',
            constraints: { min: 60, max: 400 },
            defaultValue: 140,
            cssVars: ['--sarak-matrix-node-min-width']
        },

        // --- TEMPLATES: SECURITY / MFA (Spec 27) ---
        {
            id: 'mfaQrCodeSize',
            label: 'MFA: Tamanho do QR Code',
            type: 'slider',
            unit: 'px',
            constraints: { min: 100, max: 400 },
            defaultValue: 200,
            cssVars: ['--sarak-mfa-qr-code-size']
        },

        // --- TEMPLATES: CATALOG / CARD GRID (Spec 27) ---
        {
            id: 'catalogFilterMinWidth',
            label: 'Catálogo: Largura Mínima do Filtro',
            type: 'slider',
            unit: 'px',
            constraints: { min: 80, max: 320 },
            defaultValue: 160,
            cssVars: ['--sarak-catalog-filter-min-width']
        },
        {
            id: 'catalogSectionRadius',
            label: 'Catálogo: Arredondamento da Seção',
            type: 'slider',
            unit: 'rem',
            constraints: { min: 0, max: 4, step: 0.25 },
            defaultValue: 3,
            cssVars: ['--sarak-catalog-section-radius']
        },
        {
            id: 'catalogItemRadius',
            label: 'Catálogo: Arredondamento do Item',
            type: 'slider',
            unit: 'rem',
            constraints: { min: 0, max: 4, step: 0.25 },
            defaultValue: 2,
            cssVars: ['--sarak-catalog-item-radius']
        }
    ]
};

