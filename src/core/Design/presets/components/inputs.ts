import { ComponentPreset } from './cards';

export const INPUT_PRESETS: ComponentPreset[] = [
    {
        id: 'input-floating-pill',
        name: 'Floating Pill',
        description: 'Radius máximo, sem borda, sombra suave flutuando sobre o fundo.',
        design: {
            inputBorderType: 'none',
            inputBorderRadius: 999,
            inputBg: 'var(--theme-card)',
            inputShadow: '0 8px 20px rgba(0,0,0,0.25)',
        }
    },
    {
        id: 'input-terminal-dotted',
        name: 'Terminal Dotted',
        description: 'Borda tracejada grossa, fundo puro negro.',
        design: {
            inputBorderType: 'dashed',
            inputBorderRadius: 0,
            inputBg: '#000000',
            inputBorderColor: 'var(--theme-primary)',
            inputFocusBorderColor: 'var(--theme-primary-focus)',
        }
    },
    {
        id: 'input-industrial-inset',
        name: 'Industrial Inset',
        description: 'Sombra forte para dentro, como entalhado no fundo.',
        design: {
            inputBorderType: 'none',
            inputBorderRadius: 6,
            inputBg: 'var(--theme-background)',
            inputShadow: 'inset 3px 3px 6px rgba(0,0,0,0.6), inset -2px -2px 4px rgba(255,255,255,0.03)',
        }
    },
    {
        id: 'input-classic-underline',
        name: 'Classic Underline',
        description: 'Estilo Material, só linha inferior.',
        design: {
            inputBorderType: 'underline',
            inputBorderRadius: 0,
            inputBg: 'transparent',
            inputBorderColor: 'var(--theme-border)',
            inputFocusBorderColor: 'var(--theme-primary)',
        }
    },
    {
        id: 'input-frosted-glass',
        name: 'Frosted Glass',
        description: 'Translúcido com blur perceptível.',
        design: {
            inputBorderType: 'solid',
            inputBorderRadius: 8,
            inputBg: 'var(--theme-card)',
            inputBackdropBlur: 10,
            inputBorderColor: 'var(--theme-border)',
        }
    },
    {
        id: 'input-high-contrast',
        name: 'High Contrast (Brutalism)',
        description: 'Fundo escuro sólido, borda grossa de alto contraste.',
        design: {
            inputBorderType: 'solid',
            inputBorderRadius: 0,
            inputBg: 'var(--theme-background)',
            inputBorderColor: 'var(--theme-title)',
        }
    },
    {
        id: 'input-neumorphic-press',
        name: 'Neumorphic Press',
        description: 'Extrusão suave (neumorphism real) — diferente do Inset industrial.',
        design: {
            inputBorderType: 'none',
            inputBorderRadius: 14,
            inputBg: 'var(--theme-card)',
            inputShadow: '6px 6px 12px rgba(0,0,0,0.4), -6px -6px 12px rgba(255,255,255,0.04)',
        }
    },
    {
        id: 'input-cyberpunk-glow-line',
        name: 'Cyberpunk Glow Line',
        description: 'Underline com glow sutil em repouso — vizinho neon do Classic Underline.',
        design: {
            inputBorderType: 'underline',
            inputBg: '#050505',
            inputBorderColor: 'var(--theme-primary-focus)',
            inputFocusBorderColor: 'var(--theme-primary-focus)',
            inputShadow: '0 2px 8px var(--theme-primary-focus)',
        }
    },
    {
        id: 'input-paper-craft',
        name: 'Paper Craft',
        description: 'Tom quente, borda fina, radius generoso — orgânico.',
        design: {
            inputBorderType: 'solid',
            inputBorderRadius: 12,
            inputBg: 'rgba(180,140,90,0.06)',
            inputBorderColor: 'rgba(180,140,90,0.25)',
        }
    },
    {
        id: 'input-dense-compact',
        name: 'Dense Compact',
        description: 'Padding e radius mínimos — utilitário, alta densidade.',
        design: {
            inputBorderType: 'solid',
            inputPadding: 6,
            inputBorderRadius: 4,
        }
    },
    {
        id: 'input-spacious-airy',
        name: 'Spacious Airy',
        description: 'Padding e radius generosos — o oposto do Dense Compact.',
        design: {
            inputBorderType: 'solid',
            inputPadding: 20,
            inputBorderRadius: 16,
            inputBg: 'rgba(255,255,255,0.03)',
        }
    },
    {
        id: 'input-alert-ring',
        name: 'Alert Ring',
        description: 'Acento na cor de erro — variante para formulários de alerta.',
        design: {
            inputBorderType: 'solid',
            inputBorderRadius: 8,
            inputBorderColor: 'var(--sarak-input-error-color, #ff4d4f)',
            inputFocusBorderColor: 'var(--sarak-input-error-color, #ff4d4f)',
        }
    }
];
