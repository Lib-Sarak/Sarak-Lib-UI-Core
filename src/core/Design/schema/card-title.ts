import { ComponentSchema } from '../types';

/**
 * SCHEMA: CARDS - TITLE CARD
 * Especializações e parametrização avançada para o Sleek Title Metadata Card.
 */
export const CardTitleSchema: ComponentSchema = {
    id: 'cardTitle',
    label: 'Card de Título',
    tokens: [
        {
            id: 'cardTitleFontSize',
            label: 'Tamanho da Fonte do Título',
            type: 'slider',
            description: 'Tamanho da fonte do título principal exibido no card, com valores independentes por breakpoint (`isResponsive`). Use valores maiores para cards de destaque/hero e menores em grids densos com muitos cards lado a lado.',
            axis: 'density',
            isResponsive: true,
            unit: 'px',
            constraints: { min: 10, max: 40 },
            defaultValue: { mob: 16, tab: 18, desk: 20 },
            cssVars: ['--sarak-card-title-font-size']
        },
        {
            id: 'cardTitleColor',
            label: 'Cor do Texto do Título',
            type: 'color',
            description: 'Cor do texto do título exibido no card — deve manter contraste alto contra o fundo do card (`cardBackgroundColor`).',
            axis: 'color',
            defaultValue: '#ffffff',
            cssVars: ['--sarak-card-title-color']
        },
        {
            id: 'cardTitleFontWeight',
            label: 'Peso da Fonte do Título',
            type: 'select',
            description: 'Peso (espessura) da fonte do título do card. Pesos altos (Bold/Black) dão mais destaque e hierarquia visual ao título; pesos baixos (Light/Normal) produzem um clima mais editorial/discreto.',
            axis: 'density',
            constraints: {
                options: [
                    { id: 'light', value: '300', label: 'Light' },
                    { id: 'normal', value: '400', label: 'Normal' },
                    { id: 'medium', value: '500', label: 'Medium' },
                    { id: 'semibold', value: '600', label: 'Semibold' },
                    { id: 'bold', value: '700', label: 'Bold' },
                    { id: 'black', value: '900', label: 'Black' }
                ]
            },
            defaultValue: '900',
            cssVars: ['--sarak-card-title-font-weight']
        },
        {
            id: 'cardTitleLetterSpacing',
            label: 'Espaçamento de Letras',
            type: 'slider',
            description: 'Espaçamento entre caracteres (tracking) do título do card, em pixels. Valores negativos aproximam as letras (título mais compacto/denso); valores positivos as afastam (clima mais editorial/espaçoso, comum em títulos maiúsculos).',
            axis: 'density',
            unit: 'px',
            constraints: { min: -2, max: 10, step: 0.5 },
            defaultValue: 0,
            cssVars: ['--sarak-card-title-letter-spacing']
        },
        {
            id: 'cardTitleIconGlow',
            label: 'Brilho do Ícone do Título',
            type: 'color',
            description: 'Cor do brilho/glow ao redor do ícone que acompanha o título do card. Normalmente uma versão translúcida da cor primária, para reforçar o ícone sem sobrecarregar o layout.',
            axis: 'elevation',
            defaultValue: 'rgba(0, 242, 255, 0.2)',
            cssVars: ['--sarak-card-title-icon-glow']
        },
        {
            id: 'cardTitleIconGlowBlur',
            label: 'Desfoque do Brilho do Ícone do Título',
            type: 'slider',
            description: 'Raio de desfoque do brilho do ícone do título — controla o quão suave/espalhado é o glow ao redor do ícone.',
            axis: 'elevation',
            unit: 'px',
            constraints: { min: 0, max: 40 },
            defaultValue: 15,
            cssVars: ['--sarak-card-title-icon-glow-blur']
        }
    ]
};
