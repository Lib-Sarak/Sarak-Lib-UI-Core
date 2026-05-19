import { ComponentSchema } from '../types';

/**
 * SCHEMA: CARDS - ACTION CARD
 * Especializações e parametrização avançada para o Tactile CTA Action Card.
 */
export const CardActionSchema: ComponentSchema = {
    id: 'cardAction',
    label: 'Card de Ação',
    pilar: 'surfaces',
    subcategory: 'Estruturas de Card',
    tokens: [
        {
            id: 'cardActionBtnPrimaryBg',
            label: 'Fundo do Botão de Ação',
            category: 'Botão de Ação: Cores',
            type: 'color',
            defaultValue: '#00f2ff',
            generateVariants: true,
            cssVars: ['--sarak-card-action-btn-bg']
        },
        {
            id: 'cardActionBtnHoverBg',
            label: 'Fundo do Botão no Hover',
            category: 'Botão de Ação: Cores',
            type: 'color',
            defaultValue: 'rgba(0, 242, 255, 0.8)',
            cssVars: ['--sarak-card-action-btn-hover-bg']
        },
        {
            id: 'cardActionBtnText',
            label: 'Cor do Texto do Botão',
            category: 'Botão de Ação: Cores',
            type: 'color',
            defaultValue: '#090d16',
            cssVars: ['--sarak-card-action-btn-text']
        },
        {
            id: 'cardActionBtnBorderRadius',
            label: 'Arredondamento do Botão',
            category: 'Botão de Ação: Geometria',
            type: 'slider',
            unit: 'px',
            constraints: { min: 0, max: 40 },
            defaultValue: 8,
            cssVars: ['--sarak-card-action-btn-radius']
        },
        {
            id: 'cardActionBtnPadding',
            label: 'Padding Vertical do Botão',
            category: 'Botão de Ação: Geometria',
            type: 'slider',
            unit: 'px',
            constraints: { min: 4, max: 24 },
            defaultValue: 12,
            cssVars: ['--sarak-card-action-btn-padding']
        },
        {
            id: 'cardActionClickScale',
            label: 'Escala do Clique (Ação)',
            category: 'Botão de Ação: Feedback',
            type: 'slider',
            constraints: { min: 0.8, max: 1.1, step: 0.01 },
            defaultValue: 0.96,
            cssVars: ['--sarak-card-action-click-scale']
        }
    ]
};
