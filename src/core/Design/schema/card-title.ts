import { ComponentSchema } from '../types';

/**
 * SCHEMA: CARDS - TITLE CARD
 * Especializações e parametrização avançada para o Sleek Title Metadata Card.
 */
export const CardTitleSchema: ComponentSchema = {
    id: 'cardTitle',
    label: 'Card de Título',
    pilar: 'surfaces',
    subcategory: 'Estruturas de Card',
    tokens: [
        {
            id: 'cardTitleFontSize',
            label: 'Tamanho da Fonte do Título',
            category: 'Título: Tipografia',
            type: 'slider',
            unit: 'px',
            constraints: { min: 10, max: 40 },
            defaultValue: 20,
            cssVars: ['--sarak-card-title-font-size']
        },
        {
            id: 'cardTitleColor',
            label: 'Cor do Texto do Título',
            category: 'Título: Cores',
            type: 'color',
            defaultValue: '#ffffff',
            cssVars: ['--sarak-card-title-color']
        },
        {
            id: 'cardTitleFontWeight',
            label: 'Peso da Fonte do Título',
            category: 'Título: Tipografia',
            type: 'select',
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
            category: 'Título: Tipografia',
            type: 'slider',
            unit: 'px',
            constraints: { min: -2, max: 10, step: 0.5 },
            defaultValue: 0,
            cssVars: ['--sarak-card-title-letter-spacing']
        },
        {
            id: 'cardTitleIconGlow',
            label: 'Brilho do Ícone do Título',
            category: 'Título: Efeitos',
            type: 'color',
            defaultValue: 'rgba(0, 242, 255, 0.2)',
            cssVars: ['--sarak-card-title-icon-glow']
        }
    ]
};
