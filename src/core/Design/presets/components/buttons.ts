import { ComponentPreset } from './cards';
import { BUTTON_STYLE_OPTIONS } from '../../schema/buttons';

export const BUTTON_PRESETS: ComponentPreset[] = [
    {
        id: 'btn-industrial-matte',
        name: 'Industrial Matte',
        description: 'CTA sólido, discreto, cantos levemente arredondados.',
        design: {
            btnStyleType: 'matte',
            btnBorderRadius: 6,
            btnPrimaryBg: 'var(--theme-primary)',
            btnPrimaryText: 'var(--theme-on-primary)'
        }
    },
    {
        id: 'btn-neon-pulse',
        name: 'Neon Pulse',
        description: 'Sem preenchimento, glow pulsante rápido em volta.',
        design: {
            btnStyleType: 'neon',
            btnBorderRadius: 0,
            btnNeonGlowColor: 'rgba(0,242,255,0.5)',
            btnNeonPulseSpeed: 0.8
        }
    },
    {
        id: 'btn-frosted-glass',
        name: 'Frosted Glass',
        description: 'Fundo translúcido, blur pesado, cantos suaves.',
        design: {
            btnStyleType: 'frosted',
            btnBorderRadius: 16,
            btnBackdropBlur: 24
        }
    },
    {
        id: 'btn-hollow-borderline',
        name: 'Hollow Borderline',
        description: 'Só borda e texto, preenche no hover — minimalista.',
        design: {
            btnStyleType: 'borderline',
            btnBorderRadius: 8,
            btnPrimaryBg: 'var(--theme-primary)'
        }
    },
    {
        id: 'btn-cyberpunk-wireframe',
        name: 'Cyberpunk Wireframe',
        description: 'Esquemático: sem fundo, borda fina, cantos retos.',
        design: {
            btnStyleType: 'cyberpunk',
            btnBorderRadius: 0
        }
    },
    {
        id: 'btn-neumorphism-soft',
        name: 'Neumorphism Soft',
        description: 'Plástico extrudado, super arredondado, quase sem contraste.',
        design: {
            btnStyleType: 'neumorphism',
            btnBorderRadius: 20
        }
    }
];

// Presets gerados dinamicamente a partir dos estilos do Schema (1:1 Paridade com buttons.ts)
export const BUTTON_STYLE_PRESETS: ComponentPreset[] = BUTTON_STYLE_OPTIONS.map(style => ({
    id: `btn-style-${style.value}`,
    name: style.label,
    description: `Botão utilizando o estilo ${style.label}.`,
    design: {
        btnStyleType: style.value
    }
}));
