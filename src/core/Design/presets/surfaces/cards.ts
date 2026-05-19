/**
 * Sarak Design Engine - Card Presets (v12.0)
 * 
 * Redefinição total focada em Gêmeos Digitais de Alta Fidelidade.
 * Cada preset define o estado completo de todos os componentes reguláveis da subcategoria.
 */

export interface CardPreset {
    id: string;
    name: string;
    description: string;
    design: {
        // Geometria
        cardBorderRadius: number;
        cardRadiusTL: number;
        cardRadiusTR: number;
        cardRadiusBL: number;
        cardRadiusBR: number;
        cardGeometricCut: number;
        
        // Superfície
        cardBackgroundColor: string;
        cardBackdropBlur: number;
        cardSurfaceOpacity: number;
        
        // Bordas & Linhas
        cardBorderWidth: number;
        cardBorderColor: string;
        cardBorderOpacity: number;
        cardBorderTop: number;
        cardBorderBottom: number;
        cardBorderLeft: number;
        cardBorderRight: number;
        
        // Atmosfera Local (Textura & Glow)
        cardTextureType: string;
        cardTextureOpacity: number;
        cardInnerGlowColor: string;
        cardInnerGlowWidth: number;
        
        // Efeitos
        cardShadowSpread: number;
        cardGlowIntensity: number;
        cardGlowColor: string;
        
        // Anatomia de Partes
        cardHeaderBg: string;
        cardHeaderBorder: string;
        cardHeaderPadding: number;
        cardFooterBg: string;
        cardFooterBorder: string;

        [key: string]: any;
    };
}

export const CARD_PRESETS: CardPreset[] = [
    {
        id: 'cyber-precision',
        name: 'Cyber Precision',
        description: 'Anatomia técnica clássica com chanfros acentuados e malha de precisão.',
        design: {
            cardVariant: 'classic',
            cardBorderRadius: 2,
            cardRadiusTL: 2, cardRadiusTR: 2, cardRadiusBL: 2, cardRadiusBR: 2,
            cardGeometricCut: 14,
            cardBackgroundColor: 'rgba(5, 5, 8, 0.95)',
            cardBackdropBlur: 10,
            cardSurfaceOpacity: 0.9,
            cardBorderWidth: 1,
            cardBorderColor: 'rgba(255, 255, 255, 0.15)',
            cardBorderOpacity: 1,
            cardBorderTop: 1, cardBorderBottom: 1, cardBorderLeft: 1, cardBorderRight: 1,
            cardTextureType: 'grid',
            cardTextureOpacity: 0.08,
            cardInnerGlowColor: 'rgba(255, 255, 255, 0.05)',
            cardInnerGlowWidth: 1,
            cardShadowSpread: 15,
            cardGlowIntensity: 0.1,
            cardGlowColor: 'var(--theme-primary)',
            cardHeaderBg: 'rgba(255, 255, 255, 0.03)',
            cardHeaderBorder: 'rgba(255, 255, 255, 0.08)',
            cardHeaderPadding: 16,
            cardFooterBg: 'transparent',
            cardFooterBorder: 'rgba(255, 255, 255, 0.05)'
        }
    },
    {
        id: 'ethereal-glass',
        name: 'Ethereal Glass (Title Specimen)',
        description: 'Superfície vítrea de cabeçalho limpo com badges de capacidade e alta refração.',
        design: {
            cardVariant: 'title',
            cardTitleFontSize: 22,
            cardTitleIconGlow: 'rgba(255, 255, 255, 0.4)',
            cardBorderRadius: 28,
            cardRadiusTL: 28, cardRadiusTR: 28, cardRadiusBL: 28, cardRadiusBR: 28,
            cardGeometricCut: 0,
            cardBackgroundColor: 'rgba(255, 255, 255, 0.01)',
            cardBackdropBlur: 35,
            cardSurfaceOpacity: 0.05,
            cardBorderWidth: 1,
            cardBorderColor: 'rgba(255, 255, 255, 0.25)',
            cardBorderOpacity: 0.8,
            cardBorderTop: 1.5, cardBorderBottom: 1, cardBorderLeft: 1, cardBorderRight: 1,
            cardTextureType: 'none',
            cardTextureOpacity: 0,
            cardInnerGlowColor: 'rgba(255, 255, 255, 0.15)',
            cardInnerGlowWidth: 2,
            cardShadowSpread: 45,
            cardGlowIntensity: 0.05,
            cardGlowColor: '#ffffff',
            cardHeaderBg: 'rgba(255, 255, 255, 0.05)',
            cardHeaderBorder: 'rgba(255, 255, 255, 0.1)',
            cardHeaderPadding: 20,
            cardFooterBg: 'rgba(255, 255, 255, 0.02)',
            cardFooterBorder: 'rgba(255, 255, 255, 0.1)'
        }
    },
    {
        id: 'industrial-stealth',
        name: 'Industrial Action Card',
        description: 'Construção tátil com gatilhos de clique neon pulsantes e especificações colapsáveis.',
        design: {
            cardVariant: 'action',
            btnStyleType: 'neon',
            btnNeonPulseSpeed: 2.0,
            cardActionBtnPrimaryBg: 'var(--theme-primary)',
            cardActionClickScale: 0.95,
            cardBorderRadius: 12,
            cardRadiusTL: 12, cardRadiusTR: 12, cardRadiusBL: 12, cardRadiusBR: 12,
            cardGeometricCut: 0,
            cardBackgroundColor: 'rgba(18, 18, 20, 1)',
            cardBackdropBlur: 0,
            cardSurfaceOpacity: 1,
            cardBorderWidth: 0,
            cardBorderColor: 'rgba(255, 255, 255, 0.05)',
            cardBorderOpacity: 1,
            cardBorderTop: 0, cardBorderBottom: 0, cardBorderLeft: 4, cardBorderRight: 0,
            cardTextureType: 'noise',
            cardTextureOpacity: 0.04,
            cardInnerGlowColor: 'rgba(255, 255, 255, 0.02)',
            cardInnerGlowWidth: 0,
            cardShadowSpread: 20,
            cardGlowIntensity: 0,
            cardGlowColor: 'transparent',
            cardHeaderBg: 'rgba(255, 255, 255, 0.02)',
            cardHeaderBorder: 'rgba(255, 255, 255, 0.05)',
            cardHeaderPadding: 16,
            cardFooterBg: 'transparent',
            cardFooterBorder: 'rgba(255, 255, 255, 0.03)'
        }
    },
    {
        id: 'plasma-vibrance',
        name: 'Plasma Search Filter',
        description: 'Card de pesquisa com filtros reativos táteis, switches neon e feixe de borda ativa.',
        design: {
            cardVariant: 'search',
            switchStyleType: 'pulsing',
            cardSearchBgFocus: 'rgba(var(--theme-primary-rgb), 0.12)',
            cardSearchBorderBeamActive: true,
            cardBorderRadius: 40,
            cardRadiusTL: 40, cardRadiusTR: 40, cardRadiusBL: 40, cardRadiusBR: 40,
            cardGeometricCut: 0,
            cardBackgroundColor: 'rgba(10, 10, 15, 0.85)',
            cardBackdropBlur: 15,
            cardSurfaceOpacity: 0.8,
            cardBorderWidth: 1,
            cardBorderColor: 'rgba(var(--theme-primary-rgb), 0.4)',
            cardBorderOpacity: 1,
            cardBorderTop: 1, cardBorderBottom: 1, cardBorderLeft: 1, cardBorderRight: 1,
            cardTextureType: 'dots',
            cardTextureOpacity: 0.06,
            cardInnerGlowColor: 'rgba(var(--theme-primary-rgb), 0.15)',
            cardInnerGlowWidth: 6,
            cardShadowSpread: 35,
            cardGlowIntensity: 0.4,
            cardGlowColor: 'var(--theme-primary)',
            cardHeaderBg: 'rgba(var(--theme-primary-rgb), 0.05)',
            cardHeaderBorder: 'rgba(var(--theme-primary-rgb), 0.1)',
            cardHeaderPadding: 18,
            cardFooterBg: 'transparent',
            cardFooterBorder: 'rgba(var(--theme-primary-rgb), 0.05)'
        }
    },
    {
        id: 'brutalist-slab',
        name: 'Brutalist Slab',
        description: 'Geometria crua com bordas pesadas e cortes assimétricos brutais.',
        design: {
            cardVariant: 'classic',
            cardBorderRadius: 0,
            cardRadiusTL: 0, cardRadiusTR: 0, cardRadiusBL: 0, cardRadiusBR: 0,
            cardGeometricCut: 24,
            cardBackgroundColor: 'rgba(12, 12, 15, 0.7)',
            cardBackdropBlur: 5,
            cardSurfaceOpacity: 0.7,
            cardBorderWidth: 2,
            cardBorderColor: 'rgba(255, 255, 255, 0.2)',
            cardBorderOpacity: 1,
            cardBorderTop: 2, cardBorderBottom: 4, cardBorderLeft: 2, cardBorderRight: 2,
            cardTextureType: 'none',
            cardTextureOpacity: 0,
            cardInnerGlowColor: 'transparent',
            cardInnerGlowWidth: 0,
            cardShadowSpread: 0,
            cardGlowIntensity: 0,
            cardGlowColor: 'transparent',
            cardHeaderBg: 'rgba(255, 255, 255, 0.05)',
            cardHeaderBorder: 'rgba(255, 255, 255, 0.1)',
            cardHeaderPadding: 24,
            cardFooterBg: 'rgba(255, 255, 255, 0.03)',
            cardFooterBorder: 'rgba(255, 255, 255, 0.08)'
        }
    }
];
