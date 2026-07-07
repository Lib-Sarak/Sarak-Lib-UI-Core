import type { SarakDesignState } from '../../../Provider/types';
import { TEXTURE_OPTIONS } from '../../schema/atmosphere';

export interface ComponentPreset {
    id: string;
    name: string;
    description: string;
    design: Partial<SarakDesignState>;
}

export const CARD_PRESETS: ComponentPreset[] = [
    {
        id: 'card-glass-minimal',
        name: 'Glass Minimal',
        description: 'Vidro translúcido, blur leve, borda quase invisível.',
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
        name: 'Claymorphism',
        description: 'Massinha: super arredondado, sem borda, volume por glow interno + sombra externa.',
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
        name: 'Retro OS',
        description: 'Anos 90: cantos duros, borda cinza chanfrada, sem blur, sem sombra.',
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
        name: 'Cyberpunk Neon',
        description: 'Bordas afiadas, glow neon forte, textura de grid técnico.',
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
        name: 'Holographic HUD',
        description: 'Sci-fi ultra transparente: blur pesado, spotlight, feixe de borda animado.',
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
        name: 'Industrial Brutalism',
        description: 'Bordas grossas, sombra sólida deslocada, zero blur.',
        design: {
            cardBorderRadius: 4,
            cardBorderWidth: 3,
            cardBorderColor: 'var(--theme-title)',
            cardShadow: '4px 4px 0px var(--theme-title)',
            cardBackdropBlur: 0,
            cardTextureType: 'none',
        }
    },
    {
        id: 'card-geometric-cut',
        name: 'Geometric Cut',
        description: 'Chanfro geométrico nos cantos, matte, sem blur — silhueta octogonal.',
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
        name: 'Asymmetric Accent',
        description: 'Barra de destaque só no topo, resto sem borda — flat com acento de cor.',
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
        name: 'Carbon Tech',
        description: 'Textura de fibra de carbono, borda técnica sutil, sem glow espalhado.',
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
        name: 'Organic Craft',
        description: 'Textura de madeira, radius suave, tom quente — o oposto do synth/tech.',
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
        name: 'Floating Lift',
        description: 'Foco em movimento: elevação forte no hover, glow crescente, quase sem sombra em repouso.',
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
        name: 'Scanline CRT',
        description: 'Monitor CRT: scanlines, cantos retos, verde-fósforo.',
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

// Presets gerados dinamicamente a partir das texturas do Schema (1:1 Paridade com atmosphere.ts)
export const CARD_TEXTURE_PRESETS: ComponentPreset[] = TEXTURE_OPTIONS.map(texture => ({
    id: `card-tex-${texture.value}`,
    name: texture.label,
    description: `Card com a textura de superfície ${texture.label}.`,
    design: {
        cardTextureType: texture.value
    }
}));
