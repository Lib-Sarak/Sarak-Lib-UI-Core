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
            description: 'Cor de fundo do botão de ação principal (ex. "Executar") dentro do Card de Ação. Costuma espelhar `btnPrimaryBg` para consistência visual com os demais botões primários do sistema. Gera variantes automáticas de hover/active.',
            axis: 'color',
            defaultValue: '#00f2ff',
            generateVariants: true,
            cssVars: ['--sarak-card-action-btn-bg']
        },
        {
            id: 'cardActionBtnHoverBg',
            label: 'Fundo do Botão no Hover',
            type: 'color',
            description: 'Cor de fundo do botão de ação do card ao passar o mouse — sinaliza que o botão é clicável e reage à interação.',
            axis: 'color',
            defaultValue: 'rgba(0, 242, 255, 0.8)',
            cssVars: ['--sarak-card-action-btn-hover-bg']
        },
        {
            id: 'cardActionBtnText',
            label: 'Cor do Texto do Botão',
            type: 'color',
            description: 'Cor do texto/ícone dentro do botão de ação do card — deve manter contraste alto contra `cardActionBtnPrimaryBg`.',
            axis: 'color',
            defaultValue: '#090d16',
            cssVars: ['--sarak-card-action-btn-text']
        },
        {
            id: 'cardActionBtnBorderRadius',
            label: 'Arredondamento do Botão',
            type: 'slider',
            description: 'Raio de borda do botão de ação do card, em pixels, com valores independentes por breakpoint. 0 = anguloso/técnico; valores altos = arredondado/amigável — normalmente acompanha o mesmo clima do `btnBorderRadius` global.',
            axis: 'geometry',
            isResponsive: true,
            unit: 'px',
            constraints: { min: 0, max: 40 },
            defaultValue: { mob: 6, tab: 8, desk: 8 },
            cssVars: ['--sarak-card-action-btn-radius']
        },
        {
            id: 'cardActionBtnPadding',
            label: 'Padding Vertical do Botão',
            type: 'slider',
            description: 'Espaçamento interno vertical do botão de ação do card, em pixels — controla a altura/"respiro" do botão. Valores maiores aumentam a área de toque (bom para mobile); valores menores deixam o botão mais compacto.',
            axis: 'geometry',
            unit: 'px',
            constraints: { min: 4, max: 24 },
            defaultValue: 12,
            cssVars: ['--sarak-card-action-btn-padding']
        },
        {
            id: 'cardActionClickScale',
            label: 'Escala do Clique (Ação)',
            type: 'slider',
            description: 'Fator de escala do botão de ação do card no instante do clique/toque — feedback tátil de que o clique foi registrado. Valores abaixo de 1.0 simulam o botão "afundando".',
            axis: 'motion',
            constraints: { min: 0.8, max: 1.1, step: 0.01 },
            defaultValue: 0.96,
            cssVars: ['--sarak-card-action-click-scale']
        }
    ]
};
