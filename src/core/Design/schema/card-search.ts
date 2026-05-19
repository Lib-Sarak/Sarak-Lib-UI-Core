import { ComponentSchema } from '../types';

/**
 * SCHEMA: CARDS - SEARCH CARD
 * Especializações e parametrização avançada para o Reactive Search Filter Card.
 */
export const CardSearchSchema: ComponentSchema = {
    id: 'cardSearch',
    label: 'Card de Busca',
    pilar: 'surfaces',
    subcategory: 'Estruturas de Card',
    tokens: [
        {
            id: 'cardSearchBgFocus',
            label: 'Fundo do Input Focado',
            category: 'Busca: Superfície',
            type: 'color',
            defaultValue: 'rgba(0, 242, 255, 0.08)',
            cssVars: ['--sarak-card-search-bg-focus']
        },
        {
            id: 'cardSearchBorderBeamActive',
            label: 'Border Beam no Foco',
            category: 'Busca: Feedback',
            type: 'boolean',
            defaultValue: true,
            cssVars: ['--sarak-card-search-border-beam-active']
        },
        {
            id: 'cardSearchPlaceholderColor',
            label: 'Cor do Placeholder',
            category: 'Busca: Cores',
            type: 'color',
            defaultValue: 'rgba(255, 255, 255, 0.4)',
            cssVars: ['--sarak-card-search-placeholder']
        },
        {
            id: 'cardSearchTextFocusColor',
            label: 'Cor do Texto Focado',
            category: 'Busca: Cores',
            type: 'color',
            defaultValue: '#ffffff',
            cssVars: ['--sarak-card-search-text-focus']
        }
    ]
};
