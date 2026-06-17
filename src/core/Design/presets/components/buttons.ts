import { ComponentPreset } from './cards';

export const BUTTON_PRESETS: ComponentPreset[] = [
    {
        id: 'btn-minimal',
        name: 'Minimal Solid',
        description: 'A solid, unembellished button with slight rounding.',
        design: {
            btnStyleType: 'matte',
            btnBorderRadius: 4,
            btnPrimaryBg: 'var(--theme-primary)',
            btnPrimaryText: 'var(--theme-on-primary)',
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
            btnPrimaryBg: 'transparent',
            btnPrimaryText: 'var(--theme-primary-focus)',
            btnNeonGlowColor: 'var(--theme-primary-focus)',
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
            btnPrimaryBg: 'var(--theme-card)',
            btnPrimaryText: 'var(--theme-title)',
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
            btnPrimaryBg: 'var(--theme-title)',
            btnPrimaryText: 'var(--theme-background)',
            btnBackdropBlur: 0
        }
    },
    {
        id: 'btn-material',
        name: 'Material Design',
        description: 'Classic Material Design look with subtle shadow and rounded corners.',
        design: {
            btnStyleType: 'matte',
            btnBorderRadius: 4,
            btnPrimaryBg: 'var(--theme-primary)',
            btnPrimaryText: 'var(--theme-on-primary)',
            btnBackdropBlur: 0
        }
    },
    {
        id: 'btn-apple-glass',
        name: 'Apple Glassmorphism',
        description: 'High blur, translucent white background similar to macOS/iOS.',
        design: {
            btnStyleType: 'frosted',
            btnBorderRadius: 16,
            btnPrimaryBg: 'var(--theme-card)',
            btnPrimaryText: 'var(--theme-title)',
            btnBackdropBlur: 24
        }
    },
    {
        id: 'btn-neumorphism',
        name: 'Neumorphism',
        description: 'Soft extruded plastic look, blending with the background.',
        design: {
            btnStyleType: 'neumorphism',
            btnBorderRadius: 12,
            btnPrimaryBg: 'var(--theme-card)',
            btnPrimaryText: 'var(--theme-text)',
            btnBackdropBlur: 0
        }
    },
    {
        id: 'btn-wireframe',
        name: 'Wireframe',
        description: 'No background, thin solid border, for schematic looks.',
        design: {
            btnStyleType: 'cyberpunk',
            btnBorderRadius: 0,
            btnPrimaryBg: 'transparent',
            btnPrimaryText: 'var(--theme-primary)',
            btnBackdropBlur: 0
        }
    },
    {
        id: 'btn-soft-ui',
        name: 'Soft UI',
        description: 'Extremely rounded, soft background colors with subtle contrast.',
        design: {
            btnStyleType: 'matte',
            btnBorderRadius: 9999,
            btnPrimaryBg: 'var(--theme-primary)',
            btnPrimaryText: 'var(--theme-on-primary)',
            btnBackdropBlur: 0
        }
    }
];
