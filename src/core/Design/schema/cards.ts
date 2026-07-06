import { ComponentSchema } from '../types';
import { TEXTURE_OPTIONS } from './atmosphere';

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
                options: TEXTURE_OPTIONS
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
            cssVars: ['--sarak-card-layout-direction'],
            structuralConsumer: ['useCardLayoutStyles']
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
            cssVars: ['--sarak-card-image-position'],
            structuralConsumer: ['useCardLayoutStyles', 'useStructuralStyles.getCardStyles']
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
            cssVars: ['--sarak-card-text-align'],
            structuralConsumer: ['useCardLayoutStyles']
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
            cssVars: ['--sarak-card-content-alignment'],
            structuralConsumer: ['useStructuralStyles.getCardStyles']
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
        },

        // --- DESIGN ENGINE CANVAS: SOMBRAS DE PREVIEW DE PRESET (Spec 28) ---
        {
            id: 'presetCardHoverShadowOffsetY',
            label: 'Preview de Preset: Sombra de Hover — Offset Y',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 30 },
            defaultValue: 10,
            cssVars: ['--sarak-preset-card-hover-shadow-offset-y']
        },
        {
            id: 'presetCardHoverShadowBlur',
            label: 'Preview de Preset: Sombra de Hover — Desfoque',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 80 },
            defaultValue: 40,
            cssVars: ['--sarak-preset-card-hover-shadow-blur']
        },
        {
            id: 'presetCardHoverShadowSpread',
            label: 'Preview de Preset: Sombra de Hover — Espalhamento',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 30 },
            defaultValue: 10,
            cssVars: ['--sarak-preset-card-hover-shadow-spread']
        },
        {
            id: 'presetGlowShadowBlur',
            label: 'Preview de Preset: Glow Simples — Desfoque',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 40 },
            defaultValue: 20,
            cssVars: ['--sarak-preset-glow-shadow-blur']
        },
        {
            id: 'presetGlowShadowBlurLg',
            label: 'Preview de Preset: Glow Simples — Desfoque Grande',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 60 },
            defaultValue: 32,
            cssVars: ['--sarak-preset-glow-shadow-blur-lg']
        },
        {
            id: 'presetPreviewPaddingY',
            label: 'Preview de Preset: Padding Vertical',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 24 },
            defaultValue: 12,
            cssVars: ['--sarak-preset-preview-padding-y']
        },
        {
            id: 'presetMatteShadowBlur1',
            label: 'Preview de Preset: Sombra Matte — Desfoque 1',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 30 },
            defaultValue: 15,
            cssVars: ['--sarak-preset-matte-shadow-blur1']
        },
        {
            id: 'presetMatteShadowSpread1',
            label: 'Preview de Preset: Sombra Matte — Espalhamento 1',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 10 },
            defaultValue: 3,
            cssVars: ['--sarak-preset-matte-shadow-spread1']
        },
        {
            id: 'presetMatteShadowOffsetY2',
            label: 'Preview de Preset: Sombra Matte — Offset Y 2',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 10 },
            defaultValue: 4,
            cssVars: ['--sarak-preset-matte-shadow-offset-y2']
        },
        {
            id: 'presetMatteShadowBlur2',
            label: 'Preview de Preset: Sombra Matte — Desfoque 2',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 12 },
            defaultValue: 6,
            cssVars: ['--sarak-preset-matte-shadow-blur2']
        },
        {
            id: 'presetMatteShadowSpread2',
            label: 'Preview de Preset: Sombra Matte — Espalhamento 2',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 10 },
            defaultValue: 4,
            cssVars: ['--sarak-preset-matte-shadow-spread2']
        },
        {
            id: 'presetPreviewMinHeight',
            label: 'Preview de Preset: Altura Mínima',
            type: 'slider',
            unit: 'px',
            constraints: { min: 100, max: 500 },
            defaultValue: 320,
            cssVars: ['--sarak-preset-preview-min-height']
        },
        {
            id: 'presetMiniCardMaxWidth',
            label: 'Preview de Preset: Largura Máxima do Mini-Card',
            type: 'slider',
            unit: 'px',
            constraints: { min: 100, max: 400 },
            defaultValue: 280,
            cssVars: ['--sarak-preset-mini-card-max-width']
        },
        {
            id: 'presetCardShadowOffsetY',
            label: 'Preview de Preset: Sombra do Card — Offset Y',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 10 },
            defaultValue: 4,
            cssVars: ['--sarak-preset-card-shadow-offset-y']
        },
        {
            id: 'presetCardShadowBlur',
            label: 'Preview de Preset: Sombra do Card — Desfoque',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 20 },
            defaultValue: 10,
            cssVars: ['--sarak-preset-card-shadow-blur']
        },
        {
            id: 'presetCardShadowSpread',
            label: 'Preview de Preset: Sombra do Card — Espalhamento (negativo)',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 10 },
            defaultValue: 2,
            cssVars: ['--sarak-preset-card-shadow-spread']
        },
        {
            id: 'presetGridTextureSize',
            label: 'Preview de Preset: Tamanho da Textura de Grade',
            type: 'slider',
            unit: 'px',
            constraints: { min: 4, max: 20 },
            defaultValue: 8,
            cssVars: ['--sarak-preset-grid-texture-size']
        },

        // --- DESIGN ENGINE CANVAS: KITCHEN SINK PREVIEW (Spec 28) ---
        {
            id: 'controlHeightToggle',
            label: 'Kitchen Sink: Altura do Toggle',
            type: 'slider',
            unit: 'px',
            constraints: { min: 24, max: 64 },
            defaultValue: 46,
            cssVars: ['--sarak-control-height-toggle']
        },
        {
            id: 'progressBarMaxWidth',
            label: 'Kitchen Sink: Largura Máxima da Barra de Progresso',
            type: 'slider',
            unit: 'px',
            constraints: { min: 40, max: 300 },
            defaultValue: 100,
            cssVars: ['--sarak-progress-bar-max-width']
        },
        {
            id: 'cardHoverLift',
            label: 'Kitchen Sink: Elevação no Hover',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 12 },
            defaultValue: 4,
            cssVars: ['--sarak-card-hover-lift']
        },

        // --- DESIGN ENGINE CANVAS: PREVIEW CANVAS (MOCKUP DE DISPOSITIVO) (Spec 28) ---
        {
            id: 'devicePhoneWidth',
            label: 'Preview Canvas: Largura do Telefone',
            type: 'slider',
            unit: 'px',
            constraints: { min: 300, max: 450 },
            defaultValue: 375,
            cssVars: ['--sarak-device-phone-width']
        },
        {
            id: 'devicePhoneHeight',
            label: 'Preview Canvas: Altura do Telefone',
            type: 'slider',
            unit: 'px',
            constraints: { min: 600, max: 1000 },
            defaultValue: 812,
            cssVars: ['--sarak-device-phone-height']
        },
        {
            id: 'deviceTabletHeight',
            label: 'Preview Canvas: Altura do Tablet',
            type: 'slider',
            unit: 'px',
            constraints: { min: 700, max: 1400 },
            defaultValue: 1024,
            cssVars: ['--sarak-device-tablet-height']
        },
        {
            id: 'devicePhoneNotchRadius',
            label: 'Preview Canvas: Arredondamento do Notch',
            type: 'slider',
            unit: 'rem',
            constraints: { min: 0, max: 3, step: 0.25 },
            defaultValue: 1,
            cssVars: ['--sarak-device-phone-notch-radius']
        },
        {
            id: 'deviceFrameRadius',
            label: 'Preview Canvas: Arredondamento da Moldura',
            type: 'slider',
            unit: 'rem',
            constraints: { min: 0, max: 4, step: 0.25 },
            defaultValue: 2,
            cssVars: ['--sarak-device-frame-radius']
        },
        {
            id: 'deviceDesktopMinWidth',
            label: 'Preview Canvas: Largura Mínima do Desktop',
            type: 'slider',
            unit: 'px',
            constraints: { min: 150, max: 400 },
            defaultValue: 250,
            cssVars: ['--sarak-device-desktop-min-width']
        }
    ]
};

