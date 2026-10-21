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
            kind: 'aesthetic',
            modeDependent: false,
            usage: 'Tamanho da fonte do título do `SarakTitleCard`, e com ele a altura do cartão, por dispositivo.',
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
            kind: 'aesthetic',
            modeDependent: true,
            usage: 'Cor do título do `SarakTitleCard`; precisa de contraste com o fundo do cartão nos dois modos.',
            description: 'Cor do texto do título exibido no card — deve manter contraste alto contra o fundo do card (`cardBackgroundColor`).',
            axis: 'color',
            defaultValue: '#f2f6fb',
            cssVars: ['--sarak-card-title-color']
        },
        {
            id: 'cardTitleFontWeight',
            label: 'Peso da Fonte do Título',
            type: 'select',
            kind: 'aesthetic',
            modeDependent: false,
            usage: 'Peso da fonte do título do `SarakTitleCard`; valor fora das opções cai no padrão.',
            description: 'Peso (espessura) da fonte do título do card. Pesos altos (Bold/Black) dão mais destaque e hierarquia visual ao título; pesos baixos (Light/Normal) produzem um clima mais editorial/discreto.',
            axis: 'density',
            constraints: {
                options: [
                    { id: '300', value: '300', label: 'Light' },
                    { id: '400', value: '400', label: 'Normal' },
                    { id: '500', value: '500', label: 'Medium' },
                    { id: '600', value: '600', label: 'Semibold' },
                    { id: '700', value: '700', label: 'Bold' },
                    { id: '900', value: '900', label: 'Black' }
                ]
            },
            defaultValue: '900',
            cssVars: ['--sarak-card-title-font-weight']
        },
        {
            id: 'cardTitleLetterSpacing',
            label: 'Espaçamento de Letras',
            type: 'slider',
            kind: 'aesthetic',
            modeDependent: false,
            usage: 'Espaço entre as letras do título do `SarakTitleCard`, em px; negativo aperta e positivo abre.',
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
            kind: 'aesthetic',
            modeDependent: true,
            usage: 'Cor do halo em volta do ícone do título do `SarakTitleCard`.',
            interactsWith: ['cardTitleIconGlowBlur'],
            description: 'Cor do brilho/glow ao redor do ícone que acompanha o título do card. Normalmente uma versão translúcida da cor primária, para reforçar o ícone sem sobrecarregar o layout.',
            axis: 'elevation',
            defaultValue: 'rgba(25, 227, 240, 0.22)',
            cssVars: ['--sarak-card-title-icon-glow']
        },
        {
            id: 'cardTitleIconGlowBlur',
            label: 'Desfoque do Brilho do Ícone do Título',
            type: 'slider',
            kind: 'aesthetic',
            modeDependent: false,
            usage: 'Quanto o halo do ícone do título se espalha; zero o apaga.',
            interactsWith: ['cardTitleIconGlow'],
            description: 'Raio de desfoque do brilho do ícone do título — controla o quão suave/espalhado é o glow ao redor do ícone.',
            axis: 'elevation',
            unit: 'px',
            constraints: { min: 0, max: 40 },
            defaultValue: 15,
            cssVars: ['--sarak-card-title-icon-glow-blur']
        }
    ]
};
