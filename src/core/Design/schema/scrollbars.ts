import { ComponentSchema } from '../types';

/**
 * SCROLLBARS SCHEMA (v13.0)
 * Define a estética da navegação vertical e horizontal.
 * Essencial para remover o aspecto de "navegador padrão".
 */
export const ScrollbarsSchema: ComponentSchema = {
    id: 'scrollbars',
    label: 'Barras de Rolagem',
    tokens: [
        // --- DIMENSÕES ---
        {
            id: 'scrollWidth',
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Espessura da barra de rolagem de toda a interface (vale por breakpoint); valores finos são discretos e os grossos facilitam o arraste.",
            label: 'Largura da Barra',
            type: 'slider',
            description: 'Espessura da barra de rolagem customizada, em pixels, com valores independentes por breakpoint. Valores finos (2-4px) são mais discretos; valores maiores (8-12px) facilitam o clique em telas touch/desktop com mouse impreciso.',
            axis: 'geometry',
            isResponsive: true,
            unit: 'px',
            constraints: { min: 2, max: 12, step: 1 },
            defaultValue: { mob: 4, tab: 4, desk: 6 },
            cssVars: ['--sarak-scroll-width']
        },
        {
            id: 'scrollRadius',
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Arredondamento do trilho e do cursor da barra de rolagem; valores altos formam uma pílula.",
            label: 'Arredondamento (Thumb)',
            type: 'slider',
            description: 'Raio de borda do cursor (thumb) da barra de rolagem, em pixels, com valores independentes por breakpoint. Valores altos dão o formato de "pílula" comum em barras de rolagem modernas.',
            axis: 'geometry',
            isResponsive: true,
            unit: 'px',
            constraints: { min: 0, max: 10, step: 1 },
            defaultValue: { mob: 8, tab: 10, desk: 10 },
            cssVars: ['--sarak-scroll-radius']
        },

        // --- CORES & OPACIDADE ---
        {
            id: 'scrollTrackOpacity',
            kind: 'aesthetic',
            modeDependent: true,
            usage: "Opacidade do trilho da barra de rolagem, branco sobre o fundo; valores baixos deixam só o cursor aparecer.",
            label: 'Opacidade do Trilho',
            type: 'slider',
            description: 'Opacidade do trilho (fundo) da barra de rolagem — valores baixos deixam o trilho quase invisível (só o cursor aparece), valores altos tornam o trilho inteiro visível como uma faixa de fundo.',
            axis: 'color',
            constraints: { min: 0, max: 1, step: 0.01 },
            defaultValue: 0.05,
            cssVars: ['--sarak-scroll-track-opacity']
        },
        {
            id: 'scrollThumbColor',
            kind: 'aesthetic',
            modeDependent: true,
            usage: "Cor do cursor da barra de rolagem; a opacidade final vem de `scrollThumbOpacity` e do hover.",
            interactsWith: ['scrollThumbOpacity', 'scrollThumbHoverOpacity'],
            label: 'Cor do Cursor (Thumb)',
            type: 'color',
            description: 'Cor base do cursor (thumb) da barra de rolagem — a opacidade final é controlada separadamente por `scrollThumbOpacity`/`scrollThumbHoverOpacity`.',
            axis: 'color',
            defaultValue: '#ffffff',
            cssVars: ['--sarak-scroll-thumb-color']
        },
        {
            id: 'scrollThumbOpacity',
            kind: 'aesthetic',
            modeDependent: true,
            usage: "Opacidade do cursor da barra de rolagem em repouso; baixa para não competir com o conteúdo.",
            interactsWith: ['scrollThumbColor'],
            label: 'Opacidade (Thumb)',
            type: 'slider',
            description: 'Opacidade do cursor da barra de rolagem em repouso — mantenha um valor baixo o suficiente para não competir visualmente com o conteúdo, mas visível o bastante para indicar que há scroll.',
            axis: 'color',
            constraints: { min: 0.1, max: 1, step: 0.05 },
            defaultValue: 0.2,
            cssVars: ['--sarak-scroll-thumb-opacity']
        },
        {
            id: 'scrollThumbHoverOpacity',
            kind: 'aesthetic',
            modeDependent: true,
            usage: "Opacidade do cursor da barra de rolagem sob o ponteiro; deve superar a de repouso para dar retorno.",
            interactsWith: ['scrollThumbColor', 'scrollThumbOpacity'],
            label: 'Opacidade ao Hover',
            type: 'slider',
            description: 'Opacidade do cursor da barra de rolagem ao passar o mouse sobre ele — deve ser maior que `scrollThumbOpacity` para dar feedback claro de que o elemento é interativo/arrastável.',
            axis: 'color',
            constraints: { min: 0.2, max: 1, step: 0.05 },
            defaultValue: 0.5,
            cssVars: ['--sarak-scroll-thumb-hover-opacity']
        },

        // --- COMPORTAMENTO ---
        {
            id: 'scrollPadding',
            kind: 'aesthetic',
            modeDependent: false,
            usage: "Folga transparente entre o cursor da barra de rolagem e a borda do trilho (vale por breakpoint); engorda a borda do cursor.",
            label: 'Espaçamento (Padding)',
            type: 'slider',
            description: 'Espaço, em pixels, entre a barra de rolagem e a borda do container, com valores independentes por breakpoint — evita que o cursor da barra encoste diretamente na borda da tela/painel.',
            axis: 'geometry',
            isResponsive: true,
            unit: 'px',
            constraints: { min: 0, max: 4, step: 1 },
            defaultValue: { mob: 0, tab: 2, desk: 2 },
            cssVars: ['--sarak-scroll-padding']
        }
    ]
};
