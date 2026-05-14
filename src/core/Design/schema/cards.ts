import { ComponentSchema } from '../types';

/**
 * Mapeamento 100% Atômico: Cards & Superfícies (v12.0)
 * Governa a anatomia de todos os containers do sistema.
 */
export const CardSchema: ComponentSchema = {
    id: 'cards',
    label: 'Cards & Superfícies',
    pilar: 'cards',
    tokens: [
        // --- GEOMETRIA ---
        {
            id: 'cardBorderRadius',
            label: 'Raio da Borda (Master)',
            category: 'Geometria',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 60 },
            defaultValue: 12,
            cssVars: ['--radius-theme', '--sarak-card-radius', '--sarak-card-radius-tl', '--sarak-card-radius-tr', '--sarak-card-radius-bl', '--sarak-card-radius-br']
        },
        {
            id: 'cardRadiusTL',
            label: 'Quina Superior Esquerda',
            category: 'Geometria: Avançado',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 120 },
            defaultValue: 12,
            cssVars: ['--sarak-card-radius-tl']
        },
        {
            id: 'cardRadiusTR',
            label: 'Quina Superior Direita',
            category: 'Geometria: Avançado',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 120 },
            defaultValue: 12,
            cssVars: ['--sarak-card-radius-tr']
        },
        {
            id: 'cardRadiusBL',
            label: 'Quina Inferior Esquerda',
            category: 'Geometria: Avançado',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 120 },
            defaultValue: 12,
            cssVars: ['--sarak-card-radius-bl']
        },
        {
            id: 'cardRadiusBR',
            label: 'Quina Inferior Direita',
            category: 'Geometria: Avançado',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 120 },
            defaultValue: 12,
            cssVars: ['--sarak-card-radius-br']
        },
        {
            id: 'cardGeometricCut',
            label: 'Corte Geométrico (Chanfro)',
            category: 'Geometria',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 40 },
            defaultValue: 0,
            cssVars: ['--sarak-card-cut']
        },

        // --- SUPERFÍCIE ---
        {
            id: 'cardBackgroundColor',
            label: 'Cor de Fundo (Base)',
            category: 'Superfície',
            type: 'color',
            defaultValue: 'rgba(15, 23, 42, 0.6)',
            generateVariants: true,
            cssVars: ['--card-bg', '--theme-surface', '--theme-card', '--sarak-card-bg']
        },
        {
            id: 'cardBackdropBlur',
            label: 'Backdrop Blur (Glass)',
            category: 'Superfície',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 40 },
            defaultValue: 12,
            cssVars: ['--sarak-card-blur']
        },
        {
            id: 'cardSurfaceOpacity',
            label: 'Opacidade da Superfície',
            category: 'Superfície',
            type: 'slider',
            constraints: { min: 0, max: 1, step: 0.05 },
            defaultValue: 0.8,
            cssVars: ['--sarak-card-opacity']
        },

        // --- BORDAS & LINHAS ---
        {
            id: 'cardBorderWidth',
            label: 'Espessura da Borda',
            category: 'Bordas',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 8 },
            defaultValue: 1,
            cssVars: ['--card-border-width', '--theme-border-width', '--sarak-card-border-width']
        },
        {
            id: 'cardBorderColor',
            label: 'Cor da Borda',
            category: 'Bordas',
            type: 'color',
            defaultValue: 'rgba(255, 255, 255, 0.1)',
            cssVars: ['--card-border-color', '--theme-border', '--sarak-card-border-color']
        },
        {
            id: 'cardBorderOpacity',
            label: 'Opacidade da Borda',
            category: 'Bordas',
            type: 'slider',
            constraints: { min: 0, max: 1, step: 0.05 },
            defaultValue: 1,
            cssVars: ['--sarak-card-border-opacity']
        },

        // --- BORDAS ASSIMÉTRICAS ---
        {
            id: 'cardBorderTop',
            label: 'Espessura: Topo',
            category: 'Bordas: Avançado',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 20 },
            defaultValue: 1,
            cssVars: ['--sarak-card-border-t']
        },
        {
            id: 'cardBorderBottom',
            label: 'Espessura: Base',
            category: 'Bordas: Avançado',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 20 },
            defaultValue: 1,
            cssVars: ['--sarak-card-border-b']
        },
        {
            id: 'cardBorderLeft',
            label: 'Espessura: Esquerda',
            category: 'Bordas: Avançado',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 20 },
            defaultValue: 1,
            cssVars: ['--sarak-card-border-l']
        },
        {
            id: 'cardBorderRight',
            label: 'Espessura: Direita',
            category: 'Bordas: Avançado',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 20 },
            defaultValue: 1,
            cssVars: ['--sarak-card-border-r']
        },

        // --- ILUMINAÇÃO INTERNA ---
        {
            id: 'cardInnerGlowColor',
            label: 'Cor do Glow Interno',
            category: 'Superfície: Efeitos',
            type: 'color',
            defaultValue: 'rgba(255, 255, 255, 0.05)',
            cssVars: ['--sarak-card-inner-glow-color']
        },
        {
            id: 'cardInnerGlowWidth',
            label: 'Largura do Glow Interno',
            category: 'Superfície: Efeitos',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 10 },
            defaultValue: 1,
            cssVars: ['--sarak-card-inner-glow-width']
        },

        // --- TEXTURA DO CARD ---
        {
            id: 'cardTextureType',
            label: 'Textura da Superfície',
            category: 'Superfície: Textura',
            type: 'select',
            constraints: {
                options: [
                    { id: 'none', label: 'Liso' },
                    { id: 'noise', label: 'Ruído Industrial' },
                    { id: 'grid', label: 'Grid Técnico' },
                    { id: 'dots', label: 'Dotted' }
                ]
            },
            defaultValue: 'none',
            cssVars: ['--sarak-card-texture-type']
        },
        {
            id: 'cardTextureOpacity',
            label: 'Opacidade da Textura',
            category: 'Superfície: Textura',
            type: 'slider',
            constraints: { min: 0, max: 0.2, step: 0.01 },
            defaultValue: 0.03,
            cssVars: ['--sarak-card-texture-opacity']
        },

        // --- HEADER ---
        {
            id: 'cardHeaderBg',
            label: 'Fundo do Header',
            category: 'Anatomia: Header',
            type: 'color',
            defaultValue: 'rgba(255, 255, 255, 0.03)',
            cssVars: ['--sarak-card-header-bg']
        },
        {
            id: 'cardHeaderBorder',
            label: 'Linha Divisora (Bottom)',
            category: 'Anatomia: Header',
            type: 'color',
            defaultValue: 'rgba(255, 255, 255, 0.05)',
            cssVars: ['--sarak-card-header-border']
        },
        {
            id: 'cardHeaderPadding',
            label: 'Padding Vertical',
            category: 'Anatomia: Header',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 60 },
            defaultValue: 16,
            cssVars: ['--sarak-card-header-padding']
        },

        // --- FOOTER ---
        {
            id: 'cardFooterBg',
            label: 'Fundo do Footer',
            category: 'Anatomia: Footer',
            type: 'color',
            defaultValue: 'transparent',
            cssVars: ['--sarak-card-footer-bg']
        },
        {
            id: 'cardFooterBorder',
            label: 'Linha Divisora (Top)',
            category: 'Anatomia: Footer',
            type: 'color',
            defaultValue: 'rgba(255, 255, 255, 0.05)',
            cssVars: ['--sarak-card-footer-border']
        },

        // --- EFEITOS & GLOW ---
        {
            id: 'cardShadowSpread',
            label: 'Espalhamento da Sombra',
            category: 'Efeitos: Glow',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 100 },
            defaultValue: 20,
            cssVars: ['--sarak-card-shadow-spread']
        },
        {
            id: 'cardGlowColor',
            label: 'Cor do Brilho (Neon)',
            category: 'Efeitos: Glow',
            type: 'color',
            defaultValue: 'rgba(0, 242, 255, 0.05)',
            cssVars: ['--sarak-card-glow-color']
        },
        {
            id: 'cardGlowIntensity',
            label: 'Intensidade do Brilho',
            category: 'Efeitos: Glow',
            type: 'slider',
            constraints: { min: 0, max: 1, step: 0.05 },
            defaultValue: 0,
            cssVars: ['--sarak-card-glow-intensity']
        },

        // --- INTERAÇÃO (HOVER) ---
        {
            id: 'cardHoverTranslate',
            label: 'Elevação no Hover (Y)',
            category: 'Interação',
            type: 'slider',
            unit: 'px',
            constraints: { min: -20, max: 0 },
            defaultValue: -4,
            cssVars: ['--sarak-card-hover-y']
        },
        {
            id: 'cardHoverGlowIncrease',
            label: 'Aumento de Brilho',
            category: 'Interação',
            type: 'slider',
            constraints: { min: 0, max: 1, step: 0.05 },
            defaultValue: 0.2,
            cssVars: ['--sarak-card-hover-glow']
        },
        {
            id: 'cardSpotlightOpacity',
            label: 'Opacidade do Spotlight',
            category: 'Interação',
            type: 'slider',
            constraints: { min: 0, max: 1, step: 0.05 },
            defaultValue: 0.1,
            cssVars: ['--spotlight-opacity']
        },

        // --- ESCALA DE ESPAÇAMENTO ---
        {
            id: 'cardPaddingMd',
            label: 'Padding Interno (MD)',
            category: 'Espaçamento',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 80 },
            defaultValue: 24,
            cssVars: ['--sarak-card-padding-md', '--theme-gap']
        }
    ]
};

