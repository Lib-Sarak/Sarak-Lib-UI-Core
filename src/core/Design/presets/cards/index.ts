/**
 * Sarak Atomic Presets: Cards (v12.0)
 * 
 * Biblioteca industrial de materiais e geometrias de container.
 */

export interface CardPreset {
    id: string;
    name: string;
    description: string;
    design: {
        cardBackgroundColor?: string;
        cardBorderColor?: string;
        glassOpacity?: number;
        glassBlur?: number;
        cardBorderRadius?: number;
        cardShadowIntensity?: number;
        cardPadding?: number;
        cardTexture?: string;
        borderType?: string;
        borderBeamEnabled?: boolean;
        isGeometricCut?: boolean;
        cardBorderStyle?: string;
        cardBorderWidth?: number;
        cardShadowColor?: string;
    };
}

export const CARD_PRESETS: CardPreset[] = [
    {
        id: 'glass-standard',
        name: 'Glass Standard',
        description: 'O clássico material vítreo da Sarak com transparência equilibrada.',
        design: {
            cardBackgroundColor: 'rgba(255, 255, 255, 0.05)',
            cardBorderColor: 'rgba(255, 255, 255, 0.1)',
            glassOpacity: 0.12,
            glassBlur: 12,
            cardBorderRadius: 16,
            cardShadowIntensity: 0.2,
            cardPadding: 24,
            cardTexture: 'dots'
        }
    },
    {
        id: 'ghost-neon',
        name: 'Ghost Neon',
        description: 'Transparência extrema com bordas que emitem luz primária.',
        design: {
            cardBackgroundColor: 'rgba(255, 255, 255, 0.02)',
            cardBorderColor: 'var(--theme-primary)',
            glassOpacity: 0.03,
            glassBlur: 20,
            cardBorderRadius: 12,
            cardShadowIntensity: 0.6,
            cardPadding: 24,
            borderType: 'neon',
            borderBeamEnabled: true
        }
    },
    {
        id: 'cyber-geometric',
        name: 'Cyber Geometric',
        description: 'Corte agressivo e textura de circuito para interfaces militares.',
        design: {
            cardBackgroundColor: 'rgba(15, 23, 42, 0.8)',
            cardBorderColor: 'rgba(255, 255, 255, 0.2)',
            cardBorderRadius: 0,
            isGeometricCut: true,
            cardTexture: 'circuit',
            cardPadding: 20,
            cardShadowIntensity: 0.4
        }
    },
    {
        id: 'frosted-prestige',
        name: 'Frosted Prestige',
        description: 'Efeito jateado denso com sombras suaves e curvas orgânicas.',
        design: {
            cardBackgroundColor: 'rgba(255, 255, 255, 0.1)',
            cardBorderColor: 'rgba(255, 255, 255, 0.15)',
            glassOpacity: 0.25,
            glassBlur: 25,
            cardBorderRadius: 32,
            cardShadowIntensity: 0.1,
            cardPadding: 32,
            cardTexture: 'silk'
        }
    },
    {
        id: 'deep-solid',
        name: 'Deep Solid',
        description: 'Material opaco focado em legibilidade e hierarquia profunda.',
        design: {
            cardBackgroundColor: '#0f172a',
            cardBorderColor: 'rgba(255, 255, 255, 0.05)',
            glassOpacity: 0.95,
            glassBlur: 0,
            cardBorderRadius: 12,
            cardShadowIntensity: 0.8,
            cardPadding: 24,
            borderType: 'inlet'
        }
    },
    {
        id: 'brutalist-raw',
        name: 'Brutalist Raw',
        description: 'Estética crua com bordas grossas e alto contraste.',
        design: {
            cardBorderRadius: 0,
            cardBorderStyle: 'solid',
            cardBorderWidth: 4,
            cardBorderColor: '#000000',
            cardBackgroundColor: '#fde047',
            cardShadowIntensity: 1.0,
            cardShadowColor: '#000000',
            cardPadding: 48
        }
    }
];
