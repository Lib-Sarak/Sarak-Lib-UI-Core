import { ComponentSchema } from '../types';
import { FONT_OPTIONS } from './typography';

/** O padrão da marca: herda a fonte de títulos do tema (e, sem ela, a do corpo). */
const IDENTITY_FONT_INHERIT = 'var(--font-heading, var(--font-main, inherit))';

/**
 * SCHEMA: MARCA & BRANDING
 * Identidade visual da marca do usuário e customização de logos.
 */
export const BrandingSchema: ComponentSchema = {
    id: 'branding',
    label: 'Identidade Visual',
    tokens: [
        // --- TIPOGRAFIA DA MARCA ---
        {
            id: 'identityAlignment',
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Alinha a marca (logo e nome) dentro do bloco de identidade do cromo, na lateral e no topo: esquerda, centro ou direita.",
            label: 'Alinhamento',
            type: 'select',
            description: 'Alinhamento horizontal do bloco de identidade (logo/nome da marca) dentro do seu container na navegação — Esquerda é o padrão em sidebars/topbars ocidentais, Centro é comum em navegações minimalistas.',
            axis: 'geometry',
            constraints: {
                options: [
                    { id: 'left', label: 'Esquerda' },
                    { id: 'center', label: 'Centro' },
                    { id: 'right', label: 'Direita' }
                ]
            },
            defaultValue: 'left',
            cssVars: ['--sarak-identity-align']
        },
        {
            id: 'identityPadding',
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Respiro extra ao redor do bloco da marca no cromo, somado ao respiro base; também aumenta a altura do bloco na lateral.",
            label: 'Padding do Container',
            type: 'slider',
            description: 'Espaçamento interno, em pixels, ao redor do bloco de identidade (logo/nome) — soma-se ao respiro base do bloco no cromo. 0 (padrão) mantém o respiro de sempre.',
            axis: 'geometry',
            unit: 'px',
            constraints: { min: 0, max: 64 },
            defaultValue: 16,
            cssVars: ['--sarak-identity-padding']
        },

        // --- TIPOGRAFIA DA MARCA ---
        {
            id: 'identityFontFamily',
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Família do nome da marca no cromo (só o texto, não a imagem do logo); o padrão herda a fonte de títulos do tema.",
            label: 'Fonte do Logo',
            type: 'font',
            description: 'Família tipográfica usada no nome da marca (quando renderizado como texto, não imagem). O padrão herda a fonte de títulos do tema. Escolha uma fonte que reflita o caráter da marca — pode divergir da fonte do corpo do sistema para dar identidade própria.',
            axis: 'texture',
            constraints: {
                options: [{ id: IDENTITY_FONT_INHERIT, label: 'Fonte de títulos do tema (padrão)' }, ...FONT_OPTIONS]
            },
            defaultValue: IDENTITY_FONT_INHERIT,
            cssVars: ['--sarak-identity-font']
        },
        {
            id: 'identityFontWeight',
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Peso da fonte do nome da marca no cromo; pesos altos dão presença de logotipo e baixos um ar editorial.",
            label: 'Peso da Fonte',
            type: 'slider',
            description: 'Peso (espessura) da fonte do nome da marca. Pesos altos (700-900) dão presença/impacto de logotipo; pesos baixos (100-400) produzem um clima mais discreto/editorial.',
            axis: 'density',
            constraints: { min: 100, max: 900, step: 100 },
            defaultValue: 800,
            cssVars: ['--sarak-identity-weight']
        },
        {
            id: 'identityTracking',
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Espaçamento entre as letras do nome da marca no cromo; positivo afasta (wordmark), negativo aperta, e o bloco inteiro cresce ou encolhe.",
            label: 'Espaçamento (Tracking)',
            type: 'slider',
            description: 'Espaçamento entre caracteres (tracking) do nome da marca, em pixels. Valores positivos afastam as letras (clima editorial/premium, comum em wordmarks maiúsculos); valores negativos as aproximam. O padrão (-0.5px) é o aperto de títulos do cromo.',
            axis: 'density',
            unit: 'px',
            constraints: { min: -2, max: 8, step: 0.5 },
            defaultValue: 0,
            cssVars: ['--sarak-identity-tracking']
        },

        // --- COMPORTAMENTO ---
        {
            id: 'identityHoverEffect',
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Resposta do bloco da marca sob o ponteiro: Nenhum, Brilho (sombra luminosa), Opacidade (esmaece a 70%) ou Escala (cresce 4%).",
            label: 'Efeito ao Hover',
            type: 'select',
            description: 'Efeito aplicado ao bloco de identidade quando o mouse passa por cima — Nenhum (sem feedback), Brilho (glow sutil), Opacidade (esmaece levemente) ou Escala (cresce/zoom). Sinaliza ao usuário que o logo é clicável.',
            axis: 'motion',
            constraints: {
                options: [
                    { id: 'none', label: 'Nenhum' },
                    { id: 'glow', label: 'Brilho' },
                    { id: 'opacity', label: 'Opacidade' },
                    { id: 'scale', label: 'Escala' }
                ]
            },
            defaultValue: 'opacity',
            cssVars: ['--sarak-identity-hover']
        }
    ]
};
