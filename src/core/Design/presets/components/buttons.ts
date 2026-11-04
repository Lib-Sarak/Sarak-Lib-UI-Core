import { ComponentPreset } from './cards';
import { BUTTON_STYLE_OPTIONS } from '../../schema/buttons';
import { BUTTON_STRUCTURE_PRESETS } from './buttonsStructure';

const LEGACY_BUTTON_PRESETS: ComponentPreset[] = [
    {
        id: 'btn-industrial-matte',
        name: 'Fosco industrial',
        description: 'Botão sólido e discreto, com cantos levemente arredondados.',
        design: {
            btnStyleType: 'matte',
            btnBorderRadius: 6,
            btnPrimaryBg: 'var(--theme-primary)',
            btnPrimaryText: 'var(--theme-on-primary)'
        }
    },
    {
        id: 'btn-neon-pulse',
        name: 'Neon pulsante',
        description: 'Sem preenchimento, com um brilho que pulsa rápido ao redor.',
        design: {
            btnStyleType: 'neon',
            btnBorderRadius: 0,
            btnNeonGlowColor: 'rgba(0,242,255,0.5)',
            btnNeonPulseSpeed: 0.8
        }
    },
    {
        id: 'btn-frosted-glass',
        name: 'Vidro fosco',
        description: 'Fundo translúcido, desfoque pesado e cantos suaves.',
        design: {
            btnStyleType: 'frosted',
            btnBorderRadius: 16,
            btnBackdropBlur: 24
        }
    },
    {
        id: 'btn-hollow-borderline',
        name: 'Contorno vazado',
        description: 'Só borda e texto, que se preenchem no hover: minimalista.',
        design: {
            btnStyleType: 'borderline',
            btnBorderRadius: 8,
            btnPrimaryBg: 'var(--theme-primary)'
        }
    },
    {
        id: 'btn-cyberpunk-wireframe',
        name: 'Esquema técnico',
        description: 'Sem fundo, borda fina e cantos retos, como um desenho técnico.',
        design: {
            btnStyleType: 'cyberpunk',
            btnBorderRadius: 0
        }
    },
    {
        id: 'btn-neumorphism-soft',
        name: 'Relevo suave',
        description: 'Plástico extrudado, bem arredondado e com pouco contraste.',
        design: {
            btnStyleType: 'neumorphism',
            btnBorderRadius: 20
        }
    },
    {
        id: 'btn-sharp-tag',
        name: 'Etiqueta',
        description: 'Só um canto arredondado: silhueta de etiqueta ou faixa.',
        design: {
            btnStyleType: 'matte',
            btnRadiusTL: 16,
            btnRadiusTR: 0,
            btnRadiusBL: 0,
            btnRadiusBR: 0
        }
    },
    {
        id: 'btn-neon-slow-breathe',
        name: 'Neon que respira',
        description: 'Brilho lento e suave em formato de pílula: outro clima que o neon pulsante.',
        design: {
            btnStyleType: 'neon',
            btnBorderRadius: 120,
            btnNeonGlowColor: 'rgba(255,0,180,0.4)',
            btnNeonPulseSpeed: 3.0
        }
    },
    {
        id: 'btn-frosted-deep-pill',
        name: 'Pílula de vidro',
        description: 'Pílula completa com desfoque extremo: mais radical que o vidro fosco.',
        design: {
            btnStyleType: 'frosted',
            btnBorderRadius: 120,
            btnBackdropBlur: 30
        }
    },
    {
        id: 'btn-bouncy',
        name: 'Elástico',
        description: 'Cresce no hover e afunda no clique, com resposta de mola.',
        design: {
            btnStyleType: 'matte',
            btnBorderRadius: 6,
            btnHoverScale: 1.1,
            btnActiveScale: 0.9
        }
    },
    {
        id: 'btn-ghost-ink',
        name: 'Tinta fantasma',
        description: 'Só o contorno, com cantos retos e um hover discreto.',
        design: {
            btnStyleType: 'borderline',
            btnBorderRadius: 4
        }
    },
    {
        id: 'btn-full-block',
        name: 'Bloco inteiro',
        description: 'Ocupa a largura toda: botão de bloco para formulários e celular.',
        design: {
            btnStyleType: 'matte',
            btnBorderRadius: 12,
            buttonWidthStrategy: 'full'
        }
    }
];

export const BUTTON_PRESETS: ComponentPreset[] = [...LEGACY_BUTTON_PRESETS, ...BUTTON_STRUCTURE_PRESETS];

// Presets gerados dinamicamente a partir dos estilos do Schema (1:1 Paridade com buttons.ts)
export const BUTTON_STYLE_PRESETS: ComponentPreset[] = BUTTON_STYLE_OPTIONS.map(style => ({
    id: `btn-style-${style.value}`,
    name: style.label,
    description: `Botão utilizando o estilo ${style.label}.`,
    design: {
        btnStyleType: style.value
    }
}));
