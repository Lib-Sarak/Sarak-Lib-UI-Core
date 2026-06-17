import { ComponentPreset } from './cards';

export const INPUT_PRESETS: ComponentPreset[] = [
    {
        id: 'input-classic-underline',
        name: 'Classic Underline',
        description: 'Material-style underline only.',
        design: {
            inputBorderType: 'underline',
            inputBorderRadius: 0,
            inputBorderColor: 'var(--theme-border)',
            inputFocusBorderColor: 'var(--theme-primary)',
            inputBg: 'transparent',
            inputBackdropBlur: 0,
            inputShadow: 'none',
        }
    },
    {
        id: 'input-neumorphism',
        name: 'Neumorphism',
        description: 'Soft inset shadow for a pressed effect.',
        design: {
            inputBorderType: 'none',
            inputBorderRadius: 12,
            inputBg: 'var(--theme-card)', 
            inputShadow: 'inset 4px 4px 8px rgba(0,0,0,0.5), inset -4px -4px 8px rgba(255,255,255,0.05)',
            inputBackdropBlur: 0,
            inputBorderColor: 'transparent',
            inputFocusBorderColor: 'transparent',
        }
    },
    {
        id: 'input-glass',
        name: 'Frosted Glass',
        description: 'Translucent input with blur.',
        design: {
            inputBorderType: 'solid',
            inputBorderRadius: 8,
            inputBg: 'var(--theme-card)',
            inputBorderColor: 'var(--theme-border)',
            inputFocusBorderColor: 'var(--theme-primary)',
            inputBackdropBlur: 10,
            inputShadow: '0 2px 10px rgba(0,0,0,0.1)',
        }
    },
    {
        id: 'input-high-contrast',
        name: 'High Contrast (Brutalism)',
        description: 'Solid dark background with sharp border.',
        design: {
            inputBorderType: 'solid',
            inputBorderRadius: 0,
            inputBg: 'var(--theme-background)',
            inputBorderColor: 'var(--theme-title)',
            inputFocusBorderColor: 'var(--theme-primary)',
            inputBackdropBlur: 0,
            inputShadow: 'none',
        }
    },
    {
        id: 'input-cyberpunk',
        name: 'Cyberpunk Neon',
        description: 'Dark background, dashed glowing border.',
        design: {
            inputBorderType: 'dashed',
            inputBorderRadius: 0,
            inputBg: 'var(--theme-card)',
            inputBorderColor: 'var(--theme-border)',
            inputFocusBorderColor: 'var(--theme-primary-focus)',
            inputBackdropBlur: 0,
            inputShadow: '0 0 10px var(--theme-primary-focus)',
        }
    },
    {
        id: 'input-soft-ui',
        name: 'Soft UI',
        description: 'Extremely rounded pill-shape with soft background.',
        design: {
            inputBorderType: 'none',
            inputBorderRadius: 9999,
            inputBg: 'var(--theme-card)',
            inputBorderColor: 'transparent',
            inputFocusBorderColor: 'var(--theme-primary)',
            inputBackdropBlur: 0,
            inputShadow: 'none',
        }
    },
    {
        id: 'input-apple-glass',
        name: 'Apple Glass',
        description: 'High blur, translucent white background similar to macOS/iOS.',
        design: {
            inputBorderType: 'solid',
            inputBorderRadius: 12,
            inputBg: 'var(--theme-card)',
            inputBorderColor: 'var(--theme-border)',
            inputFocusBorderColor: 'var(--theme-primary)',
            inputBackdropBlur: 24,
            inputShadow: '0 4px 24px rgba(0, 0, 0, 0.1)',
        }
    }
];
