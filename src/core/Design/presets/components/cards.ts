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
        description: 'Translucent cards with subtle blur and light borders.',
        design: {
            cardBorderRadius: 16,
            cardBorderWidth: 1,
            cardBorderColor: 'var(--theme-border)',
            cardShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
            cardBackdropBlur: 12,
            cardTextureType: 'none',
        }
    },
    {
        id: 'card-cyberpunk-neon',
        name: 'Cyberpunk Neon',
        description: 'Sharp edges with neon glow.',
        design: {
            cardBorderRadius: 0,
            cardBorderWidth: 1,
            cardBorderColor: 'var(--theme-primary-focus)',
            cardShadow: 'none',
            cardShadowSpread: 10,
            cardGlowColor: 'var(--theme-primary-focus)',
            cardBackdropBlur: 4,
            cardTextureType: 'grid',
            // cardClipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)',
        }
    },
    {
        id: 'card-industrial-brutalist',
        name: 'Industrial Brutalism',
        description: 'Thick borders and solid flat shadows.',
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
        id: 'card-soft-neumorphic',
        name: 'Soft Neumorphic',
        description: 'Extruded soft interface shapes.',
        design: {
            cardBorderRadius: 24,
            cardBorderWidth: 0,
            cardBorderColor: 'transparent',
            cardShadow: '20px 20px 60px rgba(0,0,0,0.5), -20px -20px 60px rgba(255,255,255,0.05)',
            cardBackdropBlur: 0,
            cardTextureType: 'none',
        }
    },
    {
        id: 'card-apple-frosted',
        name: 'Apple Frosted',
        description: 'Heavy blur, classic iOS feeling.',
        design: {
            cardBorderRadius: 20,
            cardBorderWidth: 1,
            cardBorderColor: 'var(--theme-border)',
            cardShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
            cardBackdropBlur: 24,
            cardTextureType: 'none',
        }
    },
    {
        id: 'card-material',
        name: 'Material Card',
        description: 'Standard elevation-based material design card.',
        design: {
            cardBorderRadius: 8,
            cardBorderWidth: 0,
            cardBorderColor: 'transparent',
            cardShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            cardBackdropBlur: 0,
            cardTextureType: 'none',
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
