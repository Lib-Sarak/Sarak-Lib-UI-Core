import type { SarakDesignState } from '../../../Provider/types';
import { TEXTURE_OPTIONS } from '../../schema/atmosphere';
import { CARD_STRUCTURE_PRESETS } from './cardsStructure';

export interface ComponentPreset {
    id: string;
    name: string;
    description: string;
    design: Partial<SarakDesignState>;
    /** Sinônimos que a busca do painel também acha, além do nome (pt e en). Opcional: o nome sozinho já é achado. */
    keywords?: readonly string[];
}

const LEGACY_CARD_PRESETS: ComponentPreset[] = [
    {
        id: 'card-glass-minimal',
        name: 'Vidro mínimo',
        description: 'Vidro translúcido com desfoque leve e borda quase invisível.',
        design: {
            cardBackgroundColor: 'rgba(255,255,255,0.04)',
            cardBackdropBlur: 16,
            cardBorderWidth: 1,
            cardBorderColor: 'rgba(255,255,255,0.08)',
            cardBorderRadius: 16,
            cardShadow: '0 8px 32px rgba(0,0,0,0.12)',
            cardTextureType: 'none',
        }
    },
    {
        id: 'card-claymorphism',
        name: 'Massinha',
        description: 'Super arredondado, sem borda, com volume dado por brilho interno e sombra externa.',
        design: {
            cardBorderRadius: 32,
            cardBorderWidth: 0,
            cardInnerGlowColor: 'rgba(255,255,255,0.15)',
            cardInnerGlowWidth: 8,
            cardBackdropBlur: 0,
            cardShadow: '12px 12px 24px rgba(0,0,0,0.35)',
            cardTextureType: 'none',
        }
    },
    {
        id: 'card-retro-os',
        name: 'Sistema retrô',
        description: 'Anos 90: cantos retos, borda cinza chanfrada, sem desfoque e sem sombra.',
        design: {
            cardBorderRadius: 0,
            cardBorderWidth: 2,
            cardBorderColor: '#9ca3af',
            cardBorderTop: 4,
            cardBackdropBlur: 0,
            cardShadow: 'none',
            cardTextureType: 'none',
        }
    },
    {
        id: 'card-cyberpunk-neon',
        name: 'Neon cibernético',
        description: 'Cantos afiados, brilho neon forte e textura de grade técnica.',
        design: {
            cardBorderRadius: 0,
            cardBorderWidth: 1,
            cardBorderColor: 'var(--theme-primary-focus)',
            cardGlowColor: 'var(--theme-primary-focus)',
            cardGlowIntensity: 0.6,
            cardShadowSpread: 20,
            cardBackdropBlur: 4,
            cardTextureType: 'grid',
        }
    },
    {
        id: 'card-holographic-hud',
        name: 'Painel holográfico',
        description: 'Ficção científica quase transparente: desfoque pesado, foco de luz e borda animada.',
        design: {
            cardBackgroundColor: 'rgba(255,255,255,0.02)',
            cardBackdropBlur: 32,
            cardBorderWidth: 1,
            cardBorderColor: 'rgba(0,242,255,0.25)',
            borderBeamEnabled: true,
            cardSpotlightOpacity: 0.25,
            cardGlowColor: 'rgba(0,242,255,0.08)',
            cardTextureType: 'none',
        }
    },
    {
        id: 'card-industrial-brutalist',
        name: 'Industrial bruto',
        description: 'Bordas grossas, sombra sólida deslocada e nenhum desfoque.',
        design: {
            cardBorderRadius: 4,
            cardBorderWidth: 3,
            cardBorderColor: 'var(--sarak-emphasis-color, var(--theme-emphasis, var(--theme-primary)))',
            cardShadow: '4px 4px 0px var(--sarak-emphasis-color, var(--theme-emphasis, var(--theme-primary)))',
            cardBackdropBlur: 0,
            cardTextureType: 'none',
        }
    },
    {
        id: 'card-geometric-cut',
        name: 'Corte geométrico',
        description: 'Cantos chanfrados, fosco e sem desfoque: silhueta de octógono.',
        design: {
            cardGeometricCut: 24,
            cardBorderRadius: 0,
            cardBorderWidth: 1,
            cardBackdropBlur: 0,
            cardShadow: 'none',
            cardTextureType: 'none',
        }
    },
    {
        id: 'card-asymmetric-accent',
        name: 'Acento no topo',
        description: 'Uma barra de destaque só no topo e o resto sem borda: plano com um toque de cor.',
        design: {
            cardBorderTop: 4,
            cardBorderBottom: 0,
            cardBorderLeft: 0,
            cardBorderRight: 0,
            cardBorderColor: 'var(--theme-primary)',
            cardBorderRadius: 8,
            cardBackdropBlur: 0,
            cardShadow: 'none',
        }
    },
    {
        id: 'card-carbon-tech',
        name: 'Fibra de carbono',
        description: 'Textura de fibra de carbono com borda técnica sutil e sem brilho espalhado.',
        design: {
            cardTextureType: 'carbon-tech',
            cardBorderRadius: 6,
            cardBorderWidth: 1,
            cardBorderColor: 'rgba(0,242,255,0.15)',
            cardBackdropBlur: 0,
            cardShadow: 'none',
        }
    },
    {
        id: 'card-organic-craft',
        name: 'Artesanal',
        description: 'Textura de madeira, cantos macios e tom quente: o oposto do tecnológico.',
        design: {
            cardTextureType: 'wood',
            cardBorderRadius: 20,
            cardBorderWidth: 1,
            cardBorderColor: 'rgba(180,140,90,0.3)',
            cardBackdropBlur: 0,
            cardShadow: '0 4px 16px rgba(0,0,0,0.15)',
        }
    },
    {
        id: 'card-floating-lift',
        name: 'Flutuante',
        description: 'Foco no movimento: sobe bastante no hover, o brilho cresce e quase não há sombra em repouso.',
        design: {
            cardHoverTranslate: -12,
            cardHoverGlowIncrease: 0.5,
            cardBorderRadius: 14,
            cardBorderWidth: 0,
            cardShadow: '0 2px 8px rgba(0,0,0,0.1)',
            cardBackdropBlur: 0,
        }
    },
    {
        id: 'card-scanline-crt',
        name: 'Monitor de tubo',
        description: 'Linhas de varredura, cantos retos e verde de fósforo.',
        design: {
            cardTextureType: 'scanlines',
            cardBorderRadius: 0,
            cardBorderWidth: 1,
            cardBorderColor: 'rgba(0,255,120,0.3)',
            cardBackdropBlur: 0,
            cardShadow: 'none',
        }
    }
];

export const CARD_PRESETS: ComponentPreset[] = [...LEGACY_CARD_PRESETS, ...CARD_STRUCTURE_PRESETS];

// Presets gerados dinamicamente a partir das texturas do Schema (1:1 Paridade com atmosphere.ts)
export const CARD_TEXTURE_PRESETS: ComponentPreset[] = TEXTURE_OPTIONS.map(texture => ({
    id: `card-tex-${texture.value}`,
    name: texture.label,
    description: `Card com a textura de superfície ${texture.label}.`,
    design: {
        cardTextureType: texture.value
    }
}));
