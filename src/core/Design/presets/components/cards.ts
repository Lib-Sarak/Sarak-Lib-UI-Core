export interface ComponentPreset {
    id: string;
    name: string;
    description: string;
    design: Record<string, any>;
}

export const CARD_PRESETS: ComponentPreset[] = [
    {
        id: 'card-glass-minimal',
        name: 'Glass Minimal',
        description: 'Translucent cards with subtle blur and light borders.',
        design: {
            cardBorderRadius: '16px',
            cardBorderWidth: '1px',
            cardBorderColor: 'var(--theme-border)',
            cardShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
            cardBackdropBlur: '12px',
            cardTextureType: 'none',
        }
    },
    {
        id: 'card-cyberpunk-neon',
        name: 'Cyberpunk Neon',
        description: 'Sharp edges with neon glow.',
        design: {
            cardBorderRadius: '0px',
            cardBorderWidth: '1px',
            cardBorderColor: 'var(--theme-primary-focus)',
            cardShadow: 'none',
            cardShadowSpread: 10,
            cardGlowColor: 'var(--theme-primary-focus)',
            cardBackdropBlur: '4px',
            cardTextureType: 'grid',
            cardClipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)',
        }
    },
    {
        id: 'card-industrial-brutalist',
        name: 'Industrial Brutalism',
        description: 'Thick borders and solid flat shadows.',
        design: {
            cardBorderRadius: '4px',
            cardBorderWidth: '3px',
            cardBorderColor: 'var(--theme-title)',
            cardShadow: '4px 4px 0px var(--theme-title)',
            cardBackdropBlur: '0px',
            cardTextureType: 'none',
        }
    },
    {
        id: 'card-soft-neumorphic',
        name: 'Soft Neumorphic',
        description: 'Extruded soft interface shapes.',
        design: {
            cardBorderRadius: '24px',
            cardBorderWidth: '0px',
            cardBorderColor: 'transparent',
            cardShadow: '20px 20px 60px rgba(0,0,0,0.5), -20px -20px 60px rgba(255,255,255,0.05)',
            cardBackdropBlur: '0px',
            cardTextureType: 'none',
        }
    },
    {
        id: 'card-apple-frosted',
        name: 'Apple Frosted',
        description: 'Heavy blur, classic iOS feeling.',
        design: {
            cardBorderRadius: '20px',
            cardBorderWidth: '1px',
            cardBorderColor: 'var(--theme-border)',
            cardShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
            cardBackdropBlur: '24px',
            cardTextureType: 'none',
        }
    },
    {
        id: 'card-material',
        name: 'Material Card',
        description: 'Standard elevation-based material design card.',
        design: {
            cardBorderRadius: '8px',
            cardBorderWidth: '0px',
            cardBorderColor: 'transparent',
            cardShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            cardBackdropBlur: '0px',
            cardTextureType: 'none',
        }
    }
];
