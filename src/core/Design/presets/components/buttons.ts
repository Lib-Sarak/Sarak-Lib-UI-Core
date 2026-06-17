import { ComponentPreset } from './cards';

export const BUTTON_PRESETS: ComponentPreset[] = [
    {
        id: 'btn-minimal',
        name: 'Minimal Solid',
        description: 'A solid, unembellished button with slight rounding.',
        design: {
            btnStyleType: 'matte',
            btnBorderRadius: 4,
            btnPrimaryBg: '#3b82f6',
            btnPrimaryText: '#ffffff',
            btnBackdropBlur: 0
        }
    },
    {
        id: 'btn-neon-glow',
        name: 'Neon Glow',
        description: 'Cyberpunk style with glowing borders.',
        design: {
            btnStyleType: 'neon',
            btnBorderRadius: 0,
            btnPrimaryBg: 'rgba(0, 242, 255, 0.1)',
            btnPrimaryText: '#00f2ff',
            btnNeonGlowColor: 'rgba(0, 242, 255, 0.8)',
            btnNeonPulseSpeed: 1.0,
            btnBackdropBlur: 0
        }
    },
    {
        id: 'btn-frosted-glass',
        name: 'Frosted Glass',
        description: 'Translucent background with background blur.',
        design: {
            btnStyleType: 'frosted',
            btnBorderRadius: 12,
            btnPrimaryBg: 'rgba(255, 255, 255, 0.1)',
            btnPrimaryText: '#ffffff',
            btnBackdropBlur: 16
        }
    },
    {
        id: 'btn-brutalism',
        name: 'Brutalism',
        description: 'High contrast, matte finish with sharp edges.',
        design: {
            btnStyleType: 'matte',
            btnBorderRadius: 0,
            btnPrimaryBg: '#ffffff',
            btnPrimaryText: '#000000',
            btnBackdropBlur: 0
        }
    }
];
