/**
 * Sarak Cards & Containers Presets (v1.1 - Category 1 Refined)
 * 
 * Este arquivo centraliza as variações atômicas de containers do ecossistema Sarak.
 */

export interface CardPreset {
    id: string;
    name: string;
    description: string;
    tokens: {
        surfaceMaterial: string;
        glassOpacity: string;
        glassBlur: number;
        borderRadius: number;
        borderWidth: number;
        shadowIntensity: string;
        cardPadding: number;
        cardSpotlight: string;
        borderBeamEnabled: string;
        isGeometricCut?: string;
        borderType?: string;
        texture?: string;
    };
}

export const CARD_VARIANTS: CardPreset[] = [
    {
        id: 'glass-standard',
        name: 'Glass Standard',
        description: 'O clássico material vítreo da Sarak com transparência equilibrada.',
        tokens: {
            surfaceMaterial: 'glass',
            glassOpacity: '0.12',
            glassBlur: 12,
            borderRadius: 16,
            borderWidth: 1,
            shadowIntensity: '0.2',
            cardPadding: 24,
            cardSpotlight: '0.15',
            borderBeamEnabled: '0',
            texture: 'dots'
        }
    },
    {
        id: 'ghost-neon',
        name: 'Ghost Neon',
        description: 'Transparência extrema com bordas que emitem luz primária.',
        tokens: {
            surfaceMaterial: 'glass',
            glassOpacity: '0.03',
            glassBlur: 20,
            borderRadius: 12,
            borderWidth: 1,
            shadowIntensity: '0.6',
            cardPadding: 24,
            cardSpotlight: '0.4',
            borderBeamEnabled: '1',
            borderType: 'neon'
        }
    },
    {
        id: 'cyber-geometric',
        name: 'Cyber Geometric',
        description: 'Corte agressivo e textura de circuito para interfaces militares.',
        tokens: {
            surfaceMaterial: 'acrylic',
            glassOpacity: '0.08',
            glassBlur: 4,
            borderRadius: 0,
            borderWidth: 2,
            shadowIntensity: '0.4',
            cardPadding: 20,
            cardSpotlight: '0.3',
            borderBeamEnabled: '1',
            isGeometricCut: '1',
            texture: 'circuit'
        }
    },
    {
        id: 'frosted-prestige',
        name: 'Frosted Prestige',
        description: 'Efeito jateado denso com sombras suaves e curvas orgânicas.',
        tokens: {
            surfaceMaterial: 'brushed',
            glassOpacity: '0.25',
            glassBlur: 25,
            borderRadius: 32,
            borderWidth: 1,
            shadowIntensity: '0.1',
            cardPadding: 32,
            cardSpotlight: '0.1',
            borderBeamEnabled: '0',
            texture: 'silk'
        }
    },
    {
        id: 'deep-solid',
        name: 'Deep Solid',
        description: 'Material opaco focado em legibilidade e hierarquia profunda.',
        tokens: {
            surfaceMaterial: 'matte',
            glassOpacity: '0.95',
            glassBlur: 0,
            borderRadius: 12,
            borderWidth: 1,
            shadowIntensity: '0.8',
            cardPadding: 24,
            cardSpotlight: '0',
            borderBeamEnabled: '0',
            borderType: 'inlet'
        }
    },
    {
        id: 'high-gloss-diamond',
        name: 'High Gloss Diamond',
        description: 'Brilho máximo com textura geométrica refinada.',
        tokens: {
            surfaceMaterial: 'glass',
            glassOpacity: '0.05',
            glassBlur: 16,
            borderRadius: 20,
            borderWidth: 1,
            shadowIntensity: '0.3',
            cardPadding: 24,
            cardSpotlight: '0.8',
            borderBeamEnabled: '0',
            texture: 'diamond'
        }
    },
    {
        id: 'silk-minimal',
        name: 'Silk Minimal',
        description: 'Fluidez e suavidade com bordas infinitas.',
        tokens: {
            surfaceMaterial: 'matte',
            glassOpacity: '0.5',
            glassBlur: 0,
            borderRadius: 60,
            borderWidth: 1,
            shadowIntensity: '0.05',
            cardPadding: 32,
            cardSpotlight: '0',
            borderBeamEnabled: '0',
            borderType: 'standard'
        }
    },
    {
        id: 'beveled-retro',
        name: 'Beveled Retro',
        description: 'Efeito chanfrado 3D clássico com profundidade tátil.',
        tokens: {
            surfaceMaterial: 'matte',
            glassOpacity: '0.8',
            glassBlur: 0,
            borderRadius: 8,
            borderWidth: 4,
            shadowIntensity: '0.4',
            cardPadding: 24,
            cardSpotlight: '0.2',
            borderBeamEnabled: '0',
            borderType: 'beveled'
        }
    }
];
