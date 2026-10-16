import { ComponentSchema } from '../types';

/**
 * SCHEMA: CARDS - ACTION CARD
 * Especializações e parametrização avançada para o Tactile CTA Action Card.
 */
export const CardActionSchema: ComponentSchema = {
    id: 'cardAction',
    label: 'Card de Ação',
    tokens: [
        {
            id: 'cardActionBtnPrimaryBg',
            label: 'Fundo do Botão de Ação',
            type: 'color',
            kind: 'aesthetic',
            modeDependent: true,
            usage: 'Fundo do botão de ação do `SarakActionCard`; por padrão segue a cor primária do tema.',
            description: 'Cor de fundo do botão de ação principal (ex. "Executar") dentro do Card de Ação. Por padrão segue a cor primária do tema, como o botão primário do sistema.',
            axis: 'color',
            defaultValue: 'var(--sarak-primary-color, #00f2ff)',
            cssVars: ['--sarak-card-action-btn-bg']
        },
        {
            id: 'cardActionBtnHoverBg',
            label: 'Fundo do Botão no Hover',
            type: 'color',
            kind: 'aesthetic',
            modeDependent: true,
            usage: 'Fundo do botão de ação do `SarakActionCard` ao passar o ponteiro ou pressionar; por padrão repete o fundo normal.',
            interactsWith: ['cardActionBtnPrimaryBg'],
            description: 'Cor de fundo do botão de ação do card ao passar o mouse — sinaliza que o botão é clicável e reage à interação. Por padrão repete o fundo normal (o botão só clareia no hover).',
            axis: 'color',
            defaultValue: 'var(--sarak-card-action-btn-bg, var(--sarak-primary-color, #00f2ff))',
            cssVars: ['--sarak-card-action-btn-hover-bg']
        },
        {
            id: 'cardActionBtnText',
            label: 'Cor do Texto do Botão',
            type: 'color',
            kind: 'aesthetic',
            modeDependent: true,
            usage: 'Cor do texto e do ícone do botão de ação do `SarakActionCard`; precisa de contraste com o fundo do botão.',
            interactsWith: ['cardActionBtnPrimaryBg'],
            description: 'Cor do texto/ícone dentro do botão de ação do card — deve manter contraste alto contra `cardActionBtnPrimaryBg`.',
            axis: 'color',
            defaultValue: 'var(--text-muted, rgba(255,255,255,0.4))',
            cssVars: ['--sarak-card-action-btn-text']
        },
        {
            id: 'cardActionBtnBorderRadius',
            label: 'Arredondamento do Botão',
            type: 'slider',
            kind: 'aesthetic',
            modeDependent: false,
            usage: 'Arredonda o botão de ação do `SarakActionCard`, por dispositivo.',
            description: 'Raio de borda do botão de ação do card, em pixels, com valores independentes por breakpoint. 0 = anguloso/técnico; valores altos = arredondado/amigável — normalmente acompanha o mesmo clima do `btnBorderRadius` global.',
            axis: 'geometry',
            isResponsive: true,
            unit: 'px',
            constraints: { min: 0, max: 120 },
            defaultValue: { mob: 6, tab: 8, desk: 8 },
            cssVars: ['--sarak-card-action-btn-radius']
        },
        {
            id: 'cardActionBtnPadding',
            label: 'Padding Vertical do Botão',
            type: 'slider',
            kind: 'aesthetic',
            modeDependent: false,
            usage: 'Respiro vertical interno do botão de ação do `SarakActionCard`, em px; define a altura do botão.',
            description: 'Espaçamento interno vertical do botão de ação do card, em pixels — controla a altura/"respiro" do botão. Valores maiores aumentam a área de toque (bom para mobile); valores menores deixam o botão mais compacto.',
            axis: 'geometry',
            unit: 'px',
            constraints: { min: 4, max: 24 },
            defaultValue: 16,
            cssVars: ['--sarak-card-action-btn-padding']
        },
        {
            id: 'cardActionClickScale',
            label: 'Escala do Clique (Ação)',
            type: 'slider',
            kind: 'aesthetic',
            modeDependent: false,
            usage: 'Quanto o botão de ação do `SarakActionCard` encolhe enquanto está pressionado, por clique ou toque; 1 não encolhe.',
            interactsWith: ['cardActionBtnPrimaryBg'],
            description: 'Fator de escala do botão de ação do card no instante do clique/toque — feedback tátil de que o clique foi registrado. Valores abaixo de 1.0 simulam o botão "afundando".',
            axis: 'motion',
            constraints: { min: 0.8, max: 1.1, step: 0.01 },
            defaultValue: 0.96,
            cssVars: ['--sarak-card-action-click-scale']
        }
    ]
};
