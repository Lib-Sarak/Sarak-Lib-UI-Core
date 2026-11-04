import { ComponentPreset } from './cards';
import { INPUT_STRUCTURE_PRESETS } from './inputsStructure';

const LEGACY_INPUT_PRESETS: ComponentPreset[] = [
    {
        id: 'input-floating-pill',
        name: 'Pílula flutuante',
        description: 'Cantos no máximo, sem borda e sombra suave flutuando sobre o fundo.',
        design: {
            inputBorderType: 'none',
            inputBorderRadius: 120,
            inputBg: 'var(--theme-card)',
            inputShadow: '0 8px 20px rgba(0,0,0,0.25)',
        }
    },
    {
        id: 'input-terminal-dotted',
        name: 'Terminal tracejado',
        description: 'Borda tracejada e fundo preto puro.',
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
        name: 'Entalhe industrial',
        description: 'Sombra forte para dentro, como se estivesse entalhado no fundo.',
        design: {
            inputBorderType: 'none',
            inputBorderRadius: 6,
            inputBg: 'var(--theme-body)',
            inputShadow: 'inset 3px 3px 6px rgba(0,0,0,0.6), inset -2px -2px 4px rgba(255,255,255,0.03)',
        }
    },
    {
        id: 'input-classic-underline',
        name: 'Linha inferior',
        description: 'Estilo Material: só uma linha na base.',
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
        name: 'Vidro fosco',
        description: 'Translúcido, com desfoque perceptível.',
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
        name: 'Alto contraste',
        description: 'Fundo sólido e borda de alto contraste, no estilo brutalista.',
        design: {
            inputBorderType: 'solid',
            inputBorderRadius: 0,
            inputBg: 'var(--theme-body)',
            inputBorderColor: 'var(--sarak-emphasis-color, var(--theme-emphasis, var(--theme-primary)))',
        }
    },
    {
        id: 'input-neumorphic-press',
        name: 'Relevo pressionado',
        description: 'Extrusão suave de verdade, diferente do entalhe industrial.',
        design: {
            inputBorderType: 'none',
            inputBorderRadius: 14,
            inputBg: 'var(--theme-card)',
            inputShadow: '6px 6px 12px rgba(0,0,0,0.4), -6px -6px 12px rgba(255,255,255,0.04)',
        }
    },
    {
        id: 'input-cyberpunk-glow-line',
        name: 'Linha luminosa',
        description: 'Linha inferior com brilho sutil em repouso, vizinha neon da linha inferior comum.',
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
        name: 'Papel artesanal',
        description: 'Tom quente, borda fina e cantos generosos: orgânico.',
        design: {
            inputBorderType: 'solid',
            inputBorderRadius: 12,
            inputBg: 'rgba(180,140,90,0.06)',
            inputBorderColor: 'rgba(180,140,90,0.25)',
        }
    },
    {
        id: 'input-dense-compact',
        name: 'Denso',
        description: 'Respiro e cantos mínimos: utilitário, de alta densidade.',
        design: {
            inputBorderType: 'solid',
            inputPadding: 6,
            inputPaddingHorizontal: 6,
            inputBorderRadius: 4,
        }
    },
    {
        id: 'input-spacious-airy',
        name: 'Espaçoso',
        description: 'Respiro e cantos generosos: o oposto do campo denso.',
        design: {
            inputBorderType: 'solid',
            inputPadding: 20,
            inputPaddingHorizontal: 20,
            inputBorderRadius: 16,
            inputBg: 'rgba(255,255,255,0.03)',
        }
    },
    {
        id: 'input-alert-ring',
        name: 'Anel de alerta',
        description: 'Acento na cor de erro: variante para formulários de alerta.',
        design: {
            inputBorderType: 'solid',
            inputBorderRadius: 8,
            inputBorderColor: 'var(--sarak-input-error-color, #ff6b6b)',
        }
    }
];

export const INPUT_PRESETS: ComponentPreset[] = [...LEGACY_INPUT_PRESETS, ...INPUT_STRUCTURE_PRESETS];
