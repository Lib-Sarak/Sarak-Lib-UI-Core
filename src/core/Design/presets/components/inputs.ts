import { ComponentPreset } from './cards';

export const INPUT_PRESETS: ComponentPreset[] = [
    {
        id: 'input-classic-underline',
        name: 'Classic Underline',
        description: 'Material-style underline only.',
        design: {
            inputBorderType: 'underline',
            inputBorderRadius: 0,
            inputBorderColor: 'rgba(255,255,255,0.2)',
            inputFocusBorderColor: '#3b82f6',
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
            inputBg: 'rgba(30,30,30,1)', 
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
            inputBg: 'rgba(255,255,255,0.05)',
            inputBorderColor: 'rgba(255,255,255,0.1)',
            inputFocusBorderColor: '#00f2ff',
            inputBackdropBlur: 10,
            inputShadow: '0 2px 10px rgba(0,0,0,0.1)',
        }
    },
    {
        id: 'input-high-contrast',
        name: 'High Contrast',
        description: 'Solid dark background with sharp border.',
        design: {
            inputBorderType: 'solid',
            inputBorderRadius: 4,
            inputBg: '#000000',
            inputBorderColor: '#ffffff',
            inputFocusBorderColor: '#ff00ff',
            inputBackdropBlur: 0,
            inputShadow: 'none',
        }
    }
];
