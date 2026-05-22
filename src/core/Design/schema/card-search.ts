import { ComponentSchema } from '../types';

/**
 * SCHEMA: CARDS - SEARCH CARD
 * Especializações e parametrização avançada para o Reactive Search Filter Card.
 */
export const CardSearchSchema: ComponentSchema = {
    id: 'cardSearch',
    label: 'Card de Busca',
    tokens: [
        {
            id: 'cardSearchBgFocus',
            label: 'Fundo do Input Focado',
            type: 'color',
            defaultValue: 'rgba(0, 242, 255, 0.08)',
            cssVars: ['--sarak-card-search-bg-focus']
        },
        {
            id: 'cardSearchBorderBeamActive',
            label: 'Border Beam no Foco',
            type: 'boolean',
            defaultValue: true,
            cssVars: ['--sarak-card-search-border-beam-active']
        },
        {
            id: 'cardSearchPlaceholderColor',
            label: 'Cor do Placeholder',
            type: 'color',
            defaultValue: 'rgba(255, 255, 255, 0.4)',
            cssVars: ['--sarak-card-search-placeholder']
        },
        {
            id: 'cardSearchTextFocusColor',
            label: 'Cor do Texto Focado',
            type: 'color',
            defaultValue: '#ffffff',
            cssVars: ['--sarak-card-search-text-focus']
        }
    ]
};
