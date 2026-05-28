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
            cardBorderColor: 'rgba(255, 255, 255, 0.1)',
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
            cardBorderColor: 'rgba(56, 189, 248, 0.5)',
            cardShadow: 'none',
            cardShadowSpread: 10,
            cardGlowColor: 'rgba(56, 189, 248, 0.4)',
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
            cardBorderColor: '#000000',
            cardShadow: '4px 4px 0px #000000',
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
    }
];
