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
            defaultValue: '#00f2ff',
            generateVariants: true,
            cssVars: ['--sarak-card-action-btn-bg']
        },
        {
            id: 'cardActionBtnHoverBg',
            label: 'Fundo do Botão no Hover',
            type: 'color',
            defaultValue: 'rgba(0, 242, 255, 0.8)',
            cssVars: ['--sarak-card-action-btn-hover-bg']
        },
        {
            id: 'cardActionBtnText',
            label: 'Cor do Texto do Botão',
            type: 'color',
            defaultValue: '#090d16',
            cssVars: ['--sarak-card-action-btn-text']
        },
        {
            id: 'cardActionBtnBorderRadius',
            label: 'Arredondamento do Botão',
            type: 'slider',
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
            unit: 'px',
            constraints: { min: 4, max: 24 },
            defaultValue: 12,
            cssVars: ['--sarak-card-action-btn-padding']
        },
        {
            id: 'cardActionClickScale',
            label: 'Escala do Clique (Ação)',
            type: 'slider',
            constraints: { min: 0.8, max: 1.1, step: 0.01 },
            defaultValue: 0.96,
            cssVars: ['--sarak-card-action-click-scale']
        }
    ]
};
