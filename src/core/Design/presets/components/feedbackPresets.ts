import type { ComponentPreset } from './cards';

/** Barra de rolagem: largura, cantos e a opacidade do trilho e do polegar (a cor vem do texto do tema). */
export const SCROLL_PRESETS: ComponentPreset[] = [
    {
        id: 'scroll-thin',
        name: 'Fina',
        description: 'Barra estreita e discreta, que só aparece de verdade ao passar o ponteiro.',
        keywords: ['fina', 'thin', 'discreta', 'estreita'],
        design: { scrollWidth: 3, scrollRadius: 4, scrollTrackOpacity: 0, scrollThumbOpacity: 0.15, scrollThumbHoverOpacity: 0.45, scrollPadding: 0 },
    },
    {
        id: 'scroll-standard',
        name: 'Padrão',
        description: 'Largura média, polegar visível e um trilho bem leve por trás.',
        keywords: ['padrao', 'standard', 'normal', 'media'],
        design: { scrollWidth: 6, scrollRadius: 8, scrollTrackOpacity: 0.05, scrollThumbOpacity: 0.25, scrollThumbHoverOpacity: 0.55, scrollPadding: 2 },
    },
    {
        id: 'scroll-bold',
        name: 'Grossa',
        description: 'Barra larga, com trilho marcado e polegar firme: fácil de agarrar com o mouse.',
        keywords: ['grossa', 'bold', 'larga', 'agarrar'],
        design: { scrollWidth: 11, scrollRadius: 3, scrollTrackOpacity: 0.16, scrollThumbOpacity: 0.5, scrollThumbHoverOpacity: 0.85, scrollPadding: 1 },
    },
    {
        id: 'scroll-pill',
        name: 'Em pílula',
        description: 'Polegar totalmente arredondado e afastado da borda, como uma cápsula.',
        keywords: ['capsula', 'pill', 'redonda', 'pilula'],
        design: { scrollWidth: 8, scrollRadius: 10, scrollTrackOpacity: 0.08, scrollThumbOpacity: 0.35, scrollThumbHoverOpacity: 0.7, scrollPadding: 3 },
    },
];

/** Selos e barras de progresso: cantos, brilho do estado e altura da barra. */
export const BADGE_PRESETS: ComponentPreset[] = [
    {
        id: 'badge-pill',
        name: 'Pílula',
        description: 'Selos totalmente arredondados e barra de progresso redonda.',
        keywords: ['pilula', 'pill', 'redondo', 'oval'],
        design: { badgeRadius: 99, statusGlowBlur: 0, progressBarHeight: 8, progressBarRadius: 32 },
    },
    {
        id: 'badge-square',
        name: 'Retangular',
        description: 'Selos de cantos retos e uma barra de progresso fina e reta.',
        keywords: ['retangular', 'square', 'reto', 'quadrado'],
        design: { badgeRadius: 2, statusGlowBlur: 0, progressBarHeight: 4, progressBarRadius: 0 },
    },
    {
        id: 'badge-glow',
        name: 'Com brilho',
        description: 'Os estados acendem com um brilho em volta, e a barra fica mais alta.',
        keywords: ['brilho', 'glow', 'neon', 'aceso'],
        design: { badgeRadius: 99, statusGlowBlur: 14, progressBarHeight: 12, progressBarRadius: 32 },
    },
    {
        id: 'badge-tag',
        name: 'Etiqueta',
        description: 'Selos com cantos curtos, como uma etiqueta, e barra de progresso grossa.',
        keywords: ['etiqueta', 'tag', 'rotulo', 'label'],
        design: { badgeRadius: 8, statusGlowBlur: 0, progressBarHeight: 20, progressBarRadius: 8 },
    },
];

/** Estados vazios: o tamanho das esferas de fundo, o anel e a largura da legenda. */
export const EMPTY_STATE_PRESETS: ComponentPreset[] = [
    {
        id: 'empty-soft-orbs',
        name: 'Esferas suaves',
        description: 'Duas esferas grandes e bem difusas atrás da mensagem.',
        keywords: ['esferas', 'orbs', 'suave', 'difuso'],
        design: { emptyStateOrbOuter: 560, emptyStateOrbInner: 320, emptyStateOrbBlur: 120, emptyStateRingRadius: 2, emptyStateCaptionMaxWidth: 300, skeletonRowRadius: 6 },
    },
    {
        id: 'empty-compact',
        name: 'Compacto',
        description: 'Esferas pequenas e nítidas, com a legenda estreita: ocupa pouco espaço.',
        keywords: ['compacto', 'compact', 'pequeno', 'nitido'],
        design: { emptyStateOrbOuter: 300, emptyStateOrbInner: 180, emptyStateOrbBlur: 40, emptyStateRingRadius: 1, emptyStateCaptionMaxWidth: 200, skeletonRowRadius: 2 },
    },
    {
        id: 'empty-ring',
        name: 'Com anel',
        description: 'Anel largo em volta do ícone e esferas pouco desfocadas.',
        keywords: ['anel', 'ring', 'aro', 'circulo'],
        design: { emptyStateOrbOuter: 420, emptyStateOrbInner: 240, emptyStateOrbBlur: 70, emptyStateRingRadius: 4, emptyStateCaptionMaxWidth: 360, skeletonRowRadius: 12 },
    },
    {
        id: 'empty-open',
        name: 'Aberto e amplo',
        description: 'Esferas enormes e legenda larga: o vazio vira parte da paisagem.',
        keywords: ['amplo', 'wide', 'aberto', 'grande'],
        design: { emptyStateOrbOuter: 800, emptyStateOrbInner: 520, emptyStateOrbBlur: 180, emptyStateRingRadius: 0, emptyStateCaptionMaxWidth: 460, skeletonRowRadius: 16, emptyStateVoidLetterOffset: 1.4 },
    },
];
