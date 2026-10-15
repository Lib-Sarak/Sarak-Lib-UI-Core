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
            kind: 'aesthetic',
            modeDependent: true,
            usage: 'Fundo do campo do `SarakSearchCard` enquanto ele tem o foco.',
            description: 'Cor de fundo do input de busca quando está em foco (usuário digitando) — normalmente uma versão translúcida da cor primária, para sinalizar o estado ativo sem competir com o texto digitado.',
            axis: 'color',
            defaultValue: 'var(--sarak-input-bg, var(--color-theme-card, rgba(15,23,42,0.6)))',
            cssVars: ['--sarak-card-search-bg-focus']
        },
        {
            id: 'cardSearchBorderBeamActive',
            label: 'Border Beam no Foco',
            type: 'boolean',
            description: 'Ativa um traço luminoso animado percorrendo a borda do card de busca quando o input está em foco (efeito "Border Beam"). Use para dar destaque extra ao campo de busca em temas mais expressivos/tech; desligue em temas sóbrios/corporativos.',
            defaultValue: true,
            cssVars: ['--sarak-card-search-border-beam-active']
        },
        {
            id: 'cardSearchPlaceholderColor',
            label: 'Cor do Placeholder',
            type: 'color',
            kind: 'aesthetic',
            modeDependent: true,
            usage: 'Cor do texto de exemplo do campo do `SarakSearchCard`, antes de digitar.',
            description: 'Cor do texto de exemplo (placeholder) exibido no input de busca antes do usuário digitar — deve ter contraste reduzido em relação ao texto real digitado, para diferenciar visualmente as duas coisas.',
            axis: 'color',
            defaultValue: 'var(--sarak-input-placeholder-color, color-mix(in srgb, var(--sarak-input-text-color, var(--text-muted, rgba(255,255,255,0.4))) 30%, transparent))',
            cssVars: ['--sarak-card-search-placeholder']
        },
        {
            id: 'cardSearchTextFocusColor',
            label: 'Cor do Texto Focado',
            type: 'color',
            kind: 'aesthetic',
            modeDependent: true,
            usage: 'Cor do texto digitado no campo do `SarakSearchCard` enquanto ele tem o foco; precisa de contraste com o fundo em foco.',
            interactsWith: ['cardSearchBgFocus'],
            description: 'Cor do texto digitado pelo usuário dentro do input de busca quando ele está em foco — deve manter contraste alto contra `cardSearchBgFocus`.',
            axis: 'color',
            defaultValue: 'var(--sarak-input-text-color, var(--text-muted, rgba(255,255,255,0.4)))',
            cssVars: ['--sarak-card-search-text-focus']
        }
    ]
};
